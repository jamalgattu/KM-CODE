import { useState } from 'react'
import { Loader2, Zap, Terminal, Layers, Smartphone, Cloud } from 'lucide-react'
import { signInWithGoogle, signInWithGitHub, isSupabaseConfigured } from '@/lib/supabase'
import { cn } from '@/lib/utils'

const PILLS = [
  { icon: Terminal,   label: '12 languages' },
  { icon: Smartphone, label: 'Mobile-first' },
  { icon: Layers,     label: 'VS Code colors' },
  { icon: Cloud,      label: 'Cloud sync' },
]

type Props = { onGuest: () => void }

export function LoginPage({ onGuest }: Props) {
  const [loading, setLoading] = useState<'google' | 'github' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGoogle = async () => {
    try {
      setError(null)
      setLoading('google')
      await signInWithGoogle()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : ''
      setError(
        msg.toLowerCase().includes('provider') || msg.toLowerCase().includes('not enabled')
          ? 'Google sign-in isn\'t enabled yet — go to Supabase → Authentication → Providers → Google to enable it.'
          : 'Google sign-in failed. Please try again.'
      )
      setLoading(null)
    }
  }

  const handleGitHub = async () => {
    try {
      setError(null)
      setLoading('github')
      await signInWithGitHub()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : ''
      setError(
        msg.toLowerCase().includes('provider') || msg.toLowerCase().includes('not enabled')
          ? 'GitHub sign-in isn\'t enabled yet — go to Supabase → Authentication → Providers → GitHub to enable it.'
          : 'GitHub sign-in failed. Please try again.'
      )
      setLoading(null)
    }
  }

  return (
    <div
      className="min-h-dvh w-screen flex flex-col lg:flex-row overflow-auto"
      style={{
        background: '#0a0f1a',
        backgroundImage: `radial-gradient(ellipse 80% 50% at 20% 40%, rgba(30,110,232,0.07) 0%, transparent 60%),
                          radial-gradient(ellipse 60% 40% at 80% 70%, rgba(99,60,180,0.06) 0%, transparent 55%)`,
      }}
    >
      {/* Subtle dot grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
        aria-hidden
      />

      {/* ── Left: Branding ── */}
      <div className="relative flex flex-col justify-center px-10 py-16 lg:w-[52%] lg:px-20 lg:py-0">

        {/* Wordmark */}
        <div className="flex items-center gap-3 mb-12">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #1e6ee8, #5b21b6)' }}
          >
            <Zap size={18} className="text-white" fill="white" />
          </div>
          <span className="text-base font-semibold text-white tracking-tight">Su Zai Zai Code</span>
        </div>

        {/* Headline */}
        <h1 className="text-[2.75rem] sm:text-5xl font-bold text-white leading-[1.1] tracking-tight mb-5">
          Your code editor,
          <br />
          <span className="text-slate-400">anywhere.</span>
        </h1>

        <p className="text-slate-500 text-base leading-relaxed max-w-sm mb-10">
          A free, open-source IDE for phones and tablets.
          Write, run, and sync code from any browser.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-2">
          {PILLS.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] text-sm text-slate-400"
            >
              <Icon size={13} className="text-blue-500 shrink-0" />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* ── Right: Auth card ── */}
      <div className="relative flex items-center justify-center px-6 py-12 lg:w-[48%] lg:py-0">
        <div className="w-full max-w-[360px]">

          {/* Card */}
          <div
            className="rounded-2xl p-8 border border-white/[0.07]"
            style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(12px)' }}
          >
            <p className="text-[15px] font-semibold text-white mb-1">Sign in</p>
            <p className="text-sm text-slate-500 mb-6">
              Save and sync your files across devices.
            </p>

            {/* Error */}
            {error && (
              <div className="mb-5 px-3 py-2.5 rounded-lg bg-red-950/50 border border-red-900/60 text-red-300 text-xs leading-relaxed">
                {error}
              </div>
            )}

            {/* Supabase not configured */}
            {!isSupabaseConfigured && (
              <div className="mb-5 px-3 py-2.5 rounded-lg bg-amber-950/40 border border-amber-900/50 text-amber-400 text-xs">
                Cloud sync not configured — guest mode only.
              </div>
            )}

            <div className="flex flex-col gap-2.5">
              {/* Google */}
              <button
                onClick={handleGoogle}
                disabled={!isSupabaseConfigured || loading !== null}
                className={cn(
                  'relative flex items-center justify-center gap-2.5 h-[44px] w-full rounded-xl text-sm font-medium transition-all duration-150',
                  isSupabaseConfigured && loading === null
                    ? 'bg-white text-gray-900 hover:bg-gray-50 active:scale-[.98]'
                    : 'bg-white/8 text-slate-600 cursor-not-allowed'
                )}
              >
                {loading === 'google' ? (
                  <Loader2 size={16} className="animate-spin text-gray-500" />
                ) : (
                  <svg width="16" height="16" viewBox="0 0 48 48" className="shrink-0">
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v8.51h12.93c-.49 2.67-1.93 5.02-3.96 6.71v5.29h5.94c3.37-3.11 5.07-7.31 5.07-11.96z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.49l-5.94-5.29c-2.13 1.43-4.87 2.28-9.96 2.28-7.65 0-14.14-5.17-16.44-12.12H1.44v5.48C5.39 42.67 14.07 48 24 48z"/>
                    <path fill="#FBBC05" d="M7.56 27.38A14.41 14.41 0 0 1 7.07 24c0-1.18.2-2.32.49-3.38v-5.48H1.44A23.93 23.93 0 0 0 0 24c0 3.88.93 7.54 2.56 10.86l5-3.48z"/>
                    <path fill="#EA4335" d="M24 9.52c3.34 0 6.33 1.15 8.69 3.4l6.01-6.01C34.93 2.13 29.48 0 24 0 14.07 0 5.39 5.33 1.44 13.14l6.12 4.76C9.86 10.69 16.35 9.52 24 9.52z"/>
                  </svg>
                )}
                Continue with Google
              </button>

              {/* GitHub */}
              <button
                onClick={handleGitHub}
                disabled={!isSupabaseConfigured || loading !== null}
                className={cn(
                  'flex items-center justify-center gap-2.5 h-[44px] w-full rounded-xl text-sm font-medium border transition-all duration-150',
                  isSupabaseConfigured && loading === null
                    ? 'bg-[#161b22] text-white border-[#30363d] hover:bg-[#1c2330] active:scale-[.98]'
                    : 'bg-white/3 text-slate-600 border-white/5 cursor-not-allowed'
                )}
              >
                {loading === 'github' ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
                    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                  </svg>
                )}
                Continue with GitHub
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 my-0.5">
                <div className="flex-1 h-px bg-white/[0.06]" />
                <span className="text-xs text-slate-700">or</span>
                <div className="flex-1 h-px bg-white/[0.06]" />
              </div>

              {/* Guest */}
              <button
                onClick={onGuest}
                disabled={loading !== null}
                className="flex items-center justify-center h-[44px] w-full rounded-xl text-sm font-medium text-slate-400 border border-white/[0.07] hover:border-white/[0.14] hover:text-white transition-all duration-150 disabled:opacity-40"
              >
                Continue as Guest
              </button>
            </div>

            <p className="text-center text-xs text-slate-700 mt-5">
              Guest files stay in your browser only
            </p>
          </div>

          {/* Footer link */}
          <p className="text-center mt-5 text-xs text-slate-800">
            <a
              href="https://github.com/jamalgattu/KM-CODE"
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-500 transition-colors"
            >
              Open source on GitHub
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
