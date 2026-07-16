// Theme handling — the settings table is the source of truth ('light' |
// 'dark' | 'system'); localStorage is only a pre-paint cache so the first
// frame renders in the right palette before SQLite has loaded (see main.tsx).

import { useEffect } from 'react'
import { useSettings, useUpdateSettings } from '@/lib/hooks/use-data'

export type Theme = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'adhd-theme'

export function computeDark(theme: Theme): boolean {
  if (theme === 'dark')  return true
  if (theme === 'light') return false
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
}

function setDarkClass(dark: boolean) {
  const root = document.getElementById('root')
  if (!root) return
  root.classList.toggle('dark', dark)
  // Native popups (date picker calendar, <select> panel) key off the
  // document's own color-scheme, not #root's — set it here too so they
  // don't render with light OS chrome inside a dark app.
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
}

// Follow OS changes while theme === 'system'
let systemListener: ((e: MediaQueryListEvent) => void) | null = null

export function applyTheme(theme: Theme) {
  window.localStorage.setItem(STORAGE_KEY, theme)
  setDarkClass(computeDark(theme))

  const mq = window.matchMedia?.('(prefers-color-scheme: dark)')
  if (!mq) return
  if (systemListener) {
    mq.removeEventListener('change', systemListener)
    systemListener = null
  }
  if (theme === 'system') {
    systemListener = e => setDarkClass(e.matches)
    mq.addEventListener('change', systemListener)
  }
}

/** Full three-way theme control (Settings page). */
export function useTheme(): { theme: Theme; isDark: boolean; setTheme: (t: Theme) => void } {
  const { data: settings } = useSettings()
  const updateSettings = useUpdateSettings()
  const theme = (settings?.theme ?? 'system') as Theme

  // Re-apply whenever the persisted value changes (incl. initial load)
  useEffect(() => { applyTheme(theme) }, [theme])

  return {
    theme,
    isDark: computeDark(theme),
    setTheme: (t: Theme) => {
      applyTheme(t)                          // instant — no DB round-trip wait
      updateSettings.mutate({ theme: t })
    },
  }
}

/** Two-state convenience for the dashboard topbar toggle. Toggling picks an
 *  explicit light/dark (a deliberate override of 'system'). */
export function useDarkMode(): [boolean, () => void] {
  const { isDark, setTheme } = useTheme()
  return [isDark, () => setTheme(isDark ? 'light' : 'dark')]
}
