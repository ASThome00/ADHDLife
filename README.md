# ADHD Life

A calm, forgiving life management app for an ADHD brain. **Runs entirely on-device — no accounts, no cloud, no internet required.**

Native desktop app (Tauri) for macOS + Windows, plus an Expo companion for iOS + Android — each with its own local SQLite database.

---

## 📥 Install

Grab the latest installer from [Releases](https://github.com/ASThome00/adhdlife/releases):

- **Windows**: `ADHD Life_x.x.x_x64-setup.exe`
- **macOS**: `ADHD Life_x.x.x_x64.dmg`

Updates check themselves (Settings → Check for Updates). Mobile ships via Expo/EAS.

---

## 🛠️ Development

```bash
pnpm install
pnpm dev            # Desktop app (Tauri window + Vite)
pnpm dev:fresh      # Same, but resets the local dev database first
pnpm dev:mobile     # Expo — scan the QR with Expo Go
pnpm typecheck      # TypeScript check across the monorepo
```

Needs Node 20+, pnpm 9+, and [Rust](https://rustup.rs) for the Tauri shell. No DB setup needed — migrations in `apps/desktop/src-tauri/migrations/` run and seed the 8 default categories automatically on first launch.

---

## ✨ What it does

| Feature | Status |
|---|---|
| Daily dashboard (focus tasks, habits, week strip) | ✅ |
| Brain dump inbox (type fast, sort later) | ✅ |
| Tasks (subtasks, due dates, recurrence, priority, snooze) | ✅ |
| 8 life categories (Work, School, Health…) | ✅ |
| Habit tracking with forgiving streaks | ✅ |
| Reading tracker (kanban: To Read / Reading / Finished) | ✅ |
| Weekly review (stats, carried-over, next-week priorities) | ✅ |
| Dark mode + settings + JSON data export | ✅ |
| Auto-updater | ✅ |
| Focus timer (gentle pomodoro) | 🔲 planned |
| Mobile screens (Today, Inbox, …) | 🔲 in progress |

Every action ≤5 seconds, no punishing red overdue counters, streaks pause instead of resetting — wrapped in a calm "Quiet Garden" tonal sage theme. Full design principles in [CLAUDE.md](./CLAUDE.md).

---

## 💾 Your data

One SQLite file, entirely local:

- **Windows**: `%APPDATA%\com.adhd-life.app\adhd-life.db`
- **macOS**: `~/Library/Application Support/com.adhd-life.app/adhd-life.db`

Back up by copying that file (or Settings → Export my data for JSON); restore by putting it back. Mobile keeps its own separate on-device database — no sync between them (yet — deliberately).

---

## 📁 Project layout

```
adhd-life/
├── apps/
│   ├── desktop/      Tauri 2 + Vite + React — macOS & Windows
│   └── mobile/       Expo (React Native) — iOS & Android, own local DB
├── packages/types/   Shared TypeScript types
└── CLAUDE.md         Full context for Claude Code sessions
```

No server, no API routes — React talks to SQLite directly via `tauri-plugin-sql` (desktop) and `expo-sqlite` (mobile).

---

## 🚀 Releasing

```bash
pnpm release 1.0.0   # Builds all platforms → creates a GitHub Release
```

Prerequisites and full checklist: [RELEASE.md](./RELEASE.md), [RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md).

---

*Built for the love of my life. 💜*
