import { useState } from 'react'
import { Loader2, Zap, Play, Globe, Smartphone, Cloud, Code2, GitBranch } from 'lucide-react'
import { signInWithGoogle, signInWithGitHub, isSupabaseConfigured } from '@/lib/supabase'
import { cn } from '@/lib/utils'

const FEATURES = [
  { icon: Play,        title: 'Run Code Instantly',    desc: '12 languages — Python, JS, Java, Rust & more' },
  { icon: Code2,       title: 'VS Code Syntax Colors', desc: 'Full highlighting like your desktop IDE'       },
  { icon: Smartphone,  title: 'Mobile-First',          desc: 'Swipe gestures, symbol bar, FAB run button'   },
  { icon: Globe,       title: 'HTML Live Preview',     desc: 'See your HTML render in real time'            },
  { icon: Cloud,       title: 'Cloud Sync',            desc: 'Sign in to save files across all devices'     },
  { icon: GitBranch,   title: 'Source Control',        desc: 'View git changes and branch info'             },
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
    } catch (e) {
      setError('Google sign-in failed. Please try again.')
      setLoading(null)
    }
  }

  const handleGitHub = async () => {
    try {
      setError(null)
      setLoading('github')
      await signInWithGitHub()
    } catch (e) {
      setError('GitHub sign-in failed. Please try again.')
      setLoading(null)
    }
  }

  return (
    <div className="min-h-dvh w-screen bg-[hsl(220,13%,10%)] flex flex-col lg:flex-row overflow-auto">

      {/* ── Left panel — branding & features ── */}
      <div className="flex flex-col justify-center px-8 py-12 lg:w-[55%] lg:px-16 lg:py-0">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg">
            <Zap size={22} className="text-white" fill="white" />
          </div>
          <div>
            <div className="text-xl font-bold text-white tracking-tight">Su Zai Zai Code</div>
            <div className="text-xs text-slate-400">Mobile-first code editor</div>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-3">
          Code anywhere.<br />
          <span className="text-primary">On any device.</span>
        </h1>
        <p className="text-slate-400 text-base mb-10 max-w-md">
          A free, open-source code editor built for phones and tablets.
          Run, preview, and save your code — all from the browser.
        </p>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.04] border border-white/[0.06]">
              <div className="w-8 h-8 rounded-md bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                <Icon size={15} className="text-primary" />
              </div>
              <div>
                <div className="text-sm font-medium text-white">{title}</div>
                <div className="text-xs text-slate-500 mt-0.5">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel — auth card ── */}
      <div className="flex items-center justify-center px-6 py-10 lg:w-[45%] lg:py-0">
        <div className="w-full max-w-sm">
          <div className="bg-[hsl(220,13%,15%)] border border-white/[0.08] rounded-2xl p-8 shadow-2xl">
            <h2 className="text-xl font-semibold text-white mb-1">Get started</h2>
            <p className="text-sm text-slate-400 mb-7">
              Sign in to sync your files across devices, or jump in as a guest.
            </p>

            {/* Error */}
            {error && (
              <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Not configured warning */}
            {!isSupabaseConfigured && (
              <div className="mb-5 px-4 py-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs leading-relaxed">
                Cloud sign-in isn't configured yet — only guest mode is available right now.
              </div>
            )}

            {/* Google */}
            <button
              onClick={handleGoogle}
              disabled={!isSupabaseConfigured || loading !== null}
              className={cn(
                "w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all mb-3",
                isSupabaseConfigured
                  ? "bg-white text-gray-800 hover:bg-gray-100 active:scale-[.98] shadow-md"
                  : "bg-white/10 text-slate-500 cursor-not-allowed"
              )}
            >
              {loading === 'google' ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 48 48">
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
                "w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all mb-6",
                isSupabaseConfigured
                  ? "bg-[#24292f] text-white hover:bg-[#2f3640] active:scale-[.98] shadow-md border border-white/10"
                  : "bg-white/5 text-slate-500 cursor-not-allowed border border-white/5"
              )}
            >
              {loading === 'github' ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                </svg>
              )}
              Continue with GitHub
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-slate-500">or</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Guest */}
            <button
              onClick={onGuest}
              disabled={loading !== null}
              className="w-full px-4 py-3 rounded-xl text-sm font-medium text-slate-300 border border-white/10 hover:bg-white/[0.05] hover:text-white active:scale-[.98] transition-all"
            >
              Continue as Guest
            </button>

            <p className="text-center text-xs text-slate-600 mt-4 leading-relaxed">
              Guest files are saved locally in your browser only.
              Sign in to sync across devices.
            </p>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-slate-600 mt-5">
            Free &amp; open source ·{' '}
            <a
              href="https://github.com/jamalgattu/KM-CODE"
              target="_blank"
              rel="noreferrer"
              className="text-slate-500 hover:text-slate-400 underline underline-offset-2"
            >
              jamalgattu/KM-CODE
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
