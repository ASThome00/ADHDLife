// apps/desktop/src/pages/setup.tsx
import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { updateSettings } from '@/lib/queries/settings'
import { qk } from '@/lib/hooks/use-data'

export function SetupPage() {
  const [name, setName]       = useState('')
  const [loading, setLoading] = useState(false)
  const qc = useQueryClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    await updateSettings({ display_name: name.trim(), setup_complete: true })
    // Refetch settings — App.tsx will redirect to dashboard
    await qc.invalidateQueries({ queryKey: qk.settings })
    setLoading(false)
  }

  return (
    <div
      className="flex items-center justify-center h-screen select-text"
      style={{ background: 'var(--bg-page)' }}
    >
      <div className="w-full max-w-sm text-center space-y-8 px-4">

        {/* Logo */}
        <div>
          <div className="mb-3" style={{ fontSize: 44, color: 'var(--accent)' }}>✦</div>
          <h1 className="font-bold" style={{ fontSize: 28, color: 'var(--text-primary)' }}>ADHD Life</h1>
          <p className="mt-2 text-sm" style={{ lineHeight: 1.6, color: 'var(--text-muted)' }}>
            A calm place for your brain.<br />
            Everything stays on your computer.
          </p>
        </div>

        {/* Card */}
        <div className="card text-left space-y-5">
          <div>
            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>What should I call you?</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-faint)' }}>Just for your morning greeting.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              autoFocus
              type="text"
              placeholder="Your name or nickname"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={40}
              className="input select-text text-center"
              style={{ fontSize: 16, padding: '11px 12px' }}
            />
            <button
              type="submit"
              disabled={!name.trim() || loading}
              className="btn-primary w-full py-3 text-base"
            >
              {loading ? 'Setting up…' : "Let's go →"}
            </button>
          </form>
        </div>

        <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
          No cloud. No sync. No account needed.
        </p>
      </div>
    </div>
  )
}
