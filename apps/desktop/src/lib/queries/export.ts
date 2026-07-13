// "Export my data" — everything in the local DB as one readable JSON file.
// Uses the dialog plugin for a native save dialog and the fs plugin to write
// wherever she picked. Object permanence: her data is never locked in.

import { save } from '@tauri-apps/plugin-dialog'
import { writeTextFile } from '@tauri-apps/plugin-fs'
import { select, selectOne } from '@/lib/db'

export async function exportAllData(): Promise<boolean> {
  const [tasks, categories, habits, habit_logs, books, recurrences, focus_days, settings] =
    await Promise.all([
      select('SELECT * FROM tasks'),
      select('SELECT * FROM categories'),
      select('SELECT * FROM habits'),
      select('SELECT * FROM habit_logs'),
      select('SELECT * FROM books'),
      select('SELECT * FROM recurrences'),
      select('SELECT * FROM focus_days'),
      selectOne('SELECT * FROM settings WHERE id = ?', ['1']),
    ])

  const payload = {
    exported_at: new Date().toISOString(),
    app: 'adhd-life',
    tasks, categories, habits, habit_logs, books, recurrences, focus_days, settings,
  }

  const path = await save({
    defaultPath: `adhd-life-export-${new Date().toISOString().split('T')[0]}.json`,
    filters: [{ name: 'JSON', extensions: ['json'] }],
  })
  if (!path) return false   // she cancelled — not an error

  await writeTextFile(path, JSON.stringify(payload, null, 2))
  return true
}
