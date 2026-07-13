import { useEffect, useState } from 'react'
import { useSettings, useUpdateSettings } from '@/lib/hooks/use-data'
import { useTheme, type Theme } from '@/lib/theme'

export function ProfileCard() {
  const { data: settings } = useSettings()
  const updateSettings = useUpdateSettings()
  const [name, setName] = useState('')

  useEffect(() => { if (settings) setName(settings.display_name) }, [settings])

  function save() {
    const n = name.trim()
    if (n && n !== settings?.display_name) updateSettings.mutate({ display_name: n })
  }

  return (
    <div className="card">
      <div className="card-title"><span aria-hidden>👤</span> Profile</div>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        onBlur={save}
        onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
        placeholder="Your name"
        style={{
          width: '100%', fontFamily: 'Geist, sans-serif', fontSize: 15,
          color: 'var(--text-primary)', background: 'transparent', border: 'none',
          borderBottom: '1.5px solid var(--input-border)', padding: '8px 0',
          outline: 'none', transition: 'border-color 0.2s',
        }}
        onFocus={e => (e.target.style.borderBottomColor = 'var(--accent)')}
      />
      <p style={{ fontFamily: 'Geist, sans-serif', fontSize: 11, color: 'var(--text-faint)', marginTop: 6 }}>
        Used for your morning greeting
      </p>
    </div>
  )
}

const THEME_OPTIONS: Array<{ k: Theme; label: string }> = [
  { k: 'light',  label: 'Light'  },
  { k: 'dark',   label: 'Dark'   },
  { k: 'system', label: 'System' },
]

export function AppearanceCard() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="card">
      <div className="card-title"><span aria-hidden>🎨</span> Appearance</div>
      <div style={{ display: 'flex', gap: 6 }}>
        {THEME_OPTIONS.map(({ k, label }) => {
          const selected = theme === k
          return (
            <button
              key={k}
              type="button"
              onClick={() => setTheme(k)}
              style={{
                padding: '5px 14px', borderRadius: 7,
                fontFamily: 'Geist, sans-serif', fontSize: 12,
                fontWeight: selected ? 600 : 400, cursor: 'pointer',
                border: `1.5px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
                background: selected ? 'var(--bg-accent)' : 'transparent',
                color: selected ? 'var(--text-accent)' : 'var(--text-sidebar)',
                transition: 'all 0.12s',
              }}
            >
              {label}
            </button>
          )
        })}
      </div>
      <p style={{ fontFamily: 'Geist, sans-serif', fontSize: 11, color: 'var(--text-faint)', marginTop: 10 }}>
        System follows your computer's light/dark preference
      </p>
    </div>
  )
}

export function FocusCard() {
  const { data: settings } = useSettings()
  const updateSettings = useUpdateSettings()
  const [limit, setLimit] = useState('')

  useEffect(() => { if (settings) setLimit(String(settings.daily_focus_limit)) }, [settings])

  function save() {
    const n = Math.min(20, Math.max(1, parseInt(limit, 10) || 5))
    setLimit(String(n))
    if (n !== settings?.daily_focus_limit) updateSettings.mutate({ daily_focus_limit: n })
  }

  return (
    <div className="card">
      <div className="card-title"><span aria-hidden>⚡</span> Daily focus limit</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <input
          value={limit}
          onChange={e => setLimit(e.target.value.replace(/\D/g, ''))}
          onBlur={save}
          onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
          inputMode="numeric"
          style={{
            width: 64, fontFamily: 'DM Mono, monospace', fontSize: 20, textAlign: 'center',
            color: 'var(--accent)', background: 'var(--bg-card-lite)',
            border: '1.5px solid var(--input-border)', borderRadius: 8, padding: 8,
            outline: 'none', transition: 'border-color 0.2s',
          }}
          onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
        />
        <span style={{ fontFamily: 'Geist, sans-serif', fontSize: 13, color: 'var(--text-muted)' }}>
          focus tasks per day, max
        </span>
      </div>
    </div>
  )
}
