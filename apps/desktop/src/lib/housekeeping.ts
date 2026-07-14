// Daily housekeeping — runs once on app open (see App.tsx).
// This is the app's only "a new day started" moment: it wakes expired
// snoozes, spawns the next instance of completed recurring tasks, and
// retires yesterday's completed focus tasks. Everything here exists to
// keep the object-permanence promise: nothing she snoozed or set to
// repeat is ever silently lost.

import { addDays, addMonths, addYears } from 'date-fns'
import { select, execute, localNaiveDateTime } from '@/lib/db'
import { randomId } from '@/lib/utils'
import type { Recurrence } from '@/lib/queries/tasks'

export async function runDailyHousekeeping(): Promise<void> {
  await wakeSnoozedTasks()
  await retireStaleFocusCompletions()
  await spawnRecurrences()
}

/** Snoozed tasks whose wake time has passed become ACTIVE again. Without
 *  this, "snooze 1 day" was functionally a silent delete. */
async function wakeSnoozedTasks() {
  // snoozed_until is written as a JS ISO string, so an ISO comparison is safe.
  await execute(
    `UPDATE tasks SET status = 'ACTIVE', snoozed_until = NULL, updated_at = datetime('now')
     WHERE status = 'SNOOZED' AND snoozed_until IS NOT NULL AND snoozed_until <= ?`,
    [new Date().toISOString()]
  )
}

/** Focus tasks completed on a PREVIOUS day drop their focus flag so the
 *  dashboard's 5 focus slots don't silently fill with old wins. Today's
 *  completions keep the flag (they count toward today's focus ratio).
 *  Unfinished focus tasks deliberately carry forward — quiet roll-forward,
 *  never a reset (Design Law #2). */
async function retireStaleFocusCompletions() {
  const dayStart = new Date()
  dayStart.setHours(0, 0, 0, 0)
  await execute(
    `UPDATE tasks SET is_focus_today = 0
     WHERE is_focus_today = 1 AND status = 'DONE'
       AND (completed_at IS NULL OR datetime(completed_at) < datetime(?, 'utc'))`,
    [localNaiveDateTime(dayStart)]
  )
}

// ─── RECURRENCE SPAWNING ──────────────────────────────────────────────────────

interface SpawnRow {
  rec_id:        string
  frequency:     Recurrence['frequency']
  interval_val:  number
  last_spawn_at: string | null
  task_id:       string
  title:         string
  notes:         string | null
  category_id:   string | null
  priority:      string
  due_date:      string | null
  due_time:      string | null
  time_estimate_min: number | null
  completed_at:  string | null
}

function addFrequency(d: Date, freq: Recurrence['frequency'], times = 1): Date {
  switch (freq) {
    case 'DAILY':    return addDays(d, 1 * times)
    case 'WEEKLY':   return addDays(d, 7 * times)
    case 'BIWEEKLY': return addDays(d, 14 * times)
    case 'MONTHLY':  return addMonths(d, times)
    case 'YEARLY':   return addYears(d, times)
  }
}

/** SQLite writes completed_at as 'YYYY-MM-DD HH:MM:SS' (UTC, space separator). */
function parseSqliteUtc(s: string): Date {
  return new Date(s.includes('T') ? s : s.replace(' ', 'T') + 'Z')
}

/** For each completed task that has a recurrence, create the next instance
 *  (once per completion) and move the recurrence onto it so the chain
 *  continues. If several periods were missed, spawn ONE next instance in
 *  the future — never a punishing backlog of overdue clones. */
async function spawnRecurrences() {
  const rows = await select<SpawnRow>(`
    SELECT r.id AS rec_id, r.frequency, r.interval_val, r.last_spawn_at,
           t.id AS task_id, t.title, t.notes, t.category_id, t.priority,
           t.due_date, t.due_time, t.time_estimate_min, t.completed_at
    FROM recurrences r
    JOIN tasks t ON t.id = r.task_id
    WHERE t.status = 'DONE'
  `)

  const now = new Date()

  for (const r of rows) {
    const completedAt = r.completed_at ? parseSqliteUtc(r.completed_at) : null

    // Already spawned for this completion? (last_spawn_at is a JS ISO string.)
    if (r.last_spawn_at && completedAt && new Date(r.last_spawn_at) >= completedAt) continue

    // Next occurrence: step forward from the old due date (or the completion
    // moment if it never had one) until we land in the future.
    const base = r.due_date ? new Date(r.due_date) : (completedAt ?? now)
    let next = addFrequency(base, r.frequency, Math.max(1, r.interval_val || 1))
    for (let i = 0; next <= now && i < 500; i++) {
      next = addFrequency(next, r.frequency)
    }

    const newId = randomId()
    await execute(`
      INSERT INTO tasks (id, title, notes, category_id, priority, due_date, due_time,
                         time_estimate_min, status, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', datetime('now'))
    `, [
      newId, r.title, r.notes, r.category_id, r.priority,
      next.toISOString(), r.due_time, r.time_estimate_min,
    ])
    await execute(
      'UPDATE recurrences SET task_id = ?, last_spawn_at = ? WHERE id = ?',
      [newId, new Date().toISOString(), r.rec_id]
    )
  }
}
