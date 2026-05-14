import { useState, useEffect } from 'react'
import { Loader2, Zap, Play, Globe, Smartphone, Cloud, Code2, GitBranch, Terminal, Braces } from 'lucide-react'
import { signInWithGoogle, signInWithGitHub, isSupabaseConfigured } from '@/lib/supabase'
import { cn } from '@/lib/utils'

const FEATURES = [
  { icon: Play,       title: 'Run 12 Languages',      desc: 'Python, JS, Java, Rust, Go & more' },
  { icon: Code2,      title: 'VS Code Highlighting',  desc: 'Full syntax colors like your desktop' },
  { icon: Smartphone, title: 'Mobile-First',          desc: 'Swipe gestures & symbol bar'         },
  { icon: Globe,      title: 'HTML Live Preview',     desc: 'See renders in real time'             },
  { icon: Cloud,      title: 'Cloud Sync',            desc: 'Save files across all devices'        },
  { icon: GitBranch,  title: 'Source Control',        desc: 'View git changes & branches'          },
]

const CODE_LINES = [
  { color: 'text-blue-400',   text: 'const editor = new SuZaiZaiCode()' },
  { color: 'text-purple-400', text: 'editor.run("python", script)' },
  { color: 'text-green-400',  text: '// ✓ Output: Hello, World!' },
  { color: 'text-yellow-400', text: 'for lang in languages:' },
  { color: 'text-pink-400',   text: '    compile(lang, optimized=True)' },
  { color: 'text-cyan-400',   text: 'git commit -m "shipped 🚀"' },
  { color: 'text-orange-400', text: 'class Mobile extends Editor {}' },
  { color: 'text-emerald-400',text: 'deploy(target="everywhere")' },
]

function FloatingCode() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden>
      {CODE_LINES.map((line, i) => (
        <div
          key={i}
          className={cn('absolute font-mono text-xs opacity-0 whitespace-nowrap', line.color)}
          style={{
            top: `${8 + i * 11}%`,
            left: '-5%',
            animation: `slideCode ${14 + i * 1.5}s linear ${i * 1.8}s infinite`,
          }}
        >
          {line.text}
        </div>
      ))}
      <style>{`
        @keyframes slideCode {
          0%   { transform: translateX(0);    opacity: 0;    }
          5%   { opacity: 0.18; }
          90%  { opacity: 0.12; }
          100% { transform: translateX(110vw); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

type Props = { onGuest: () => void }

export function LoginPage({ onGuest }: Props) {
  const [loading, setLoading] = useState<'google' | 'github' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const handleGoogle = async () => {
    try {
      setError(null)
      setLoading('google')
      await signInWithGoogle()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Sign-in failed'
      if (msg.toLowerCase().includes('provider') || msg.toLowerCase().includes('not enabled')) {
        setError('Google sign-in isn\'t enabled yet. Please enable the Google provider in your Supabase dashboard under Authentication → Providers.')
      } else {
        setError('Google sign-in failed. Please try again.')
      }
      setLoading(null)
    }
  }

  const handleGitHub = async () => {
    try {
      setError(null)
      setLoading('github')
      await signInWithGitHub()
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Sign-in failed'
      if (msg.toLowerCase().includes('provider') || msg.toLowerCase().includes('not enabled')) {
        setError('GitHub sign-in isn\'t enabled yet. Please enable the GitHub provider in your Supabase dashboard under Authentication → Providers.')
      } else {
        setError('GitHub sign-in failed. Please try again.')
      }
      setLoading(null)
    }
  }

  return (
    <div className="min-h-dvh w-screen overflow-auto relative flex flex-col lg:flex-row" style={{ background: 'linear-gradient(135deg, #080c14 0%, #0d1117 40%, #0a0e1a 70%, #080c14 100%)' }}>

      {/* Ambient glow orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #1e6ee8 0%, transparent 70%)' }} />
        <div className="absolute top-1/2 -right-24 w-80 h-80 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }} />
        <div className="absolute -bottom-24 left-1/3 w-72 h-72 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #0ea5e9 0%, transparent 70%)' }} />
      </div>

      <FloatingCode />

      {/* ── Left panel ── */}
      <div
        className={cn(
          'relative flex flex-col justify-center px-8 py-14 lg:w-[55%] lg:px-16 lg:py-0 transition-all duration-700',
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30"
            style={{ background: 'linear-gradient(135deg, #1e6ee8 0%, #7c3aed 100%)' }}
          >
            <Zap size={24} className="text-white" fill="white" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white tracking-tight">Su Zai Zai Code</div>
            <div className="text-xs text-blue-400/80 font-medium tracking-wide uppercase">Mobile IDE</div>
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl font-extrabold leading-[1.1] mb-4">
          <span className="text-white">Code anywhere.</span>
          <br />
          <span style={{ background: 'linear-gradient(90deg, #1e6ee8, #7c3aed, #0ea5e9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            On any device.
          </span>
        </h1>
        <p className="text-slate-400 text-base mb-10 max-w-md leading-relaxed">
          A free, open-source code editor built for phones and tablets.
          Run, preview, and sync your code — all from the browser.
        </p>

        {/* Terminal preview chip */}
        <div className="mb-10 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm max-w-max">
          <Terminal size={14} className="text-green-400 shrink-0" />
          <span className="font-mono text-xs text-green-400">$ python demo.py</span>
          <span className="font-mono text-xs text-slate-400">→ Hello, World! 🚀</span>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-lg">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex items-start gap-3 p-3 rounded-xl border border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06] hover:border-blue-500/20 transition-all duration-200"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'linear-gradient(135deg, rgba(30,110,232,0.2), rgba(124,58,237,0.2))' }}>
                <Icon size={15} className="text-blue-400" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">{title}</div>
                <div className="text-xs text-slate-500 mt-0.5">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel — auth card ── */}
      <div
        className={cn(
          'relative flex items-center justify-center px-6 py-12 lg:w-[45%] lg:py-0 transition-all duration-700 delay-150',
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        )}
      >
        <div className="w-full max-w-sm">

          {/* Card */}
          <div
            className="rounded-3xl p-8 shadow-2xl border border-white/[0.08]"
            style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)', backdropFilter: 'blur(20px)' }}
          >
            {/* Card header */}
            <div className="flex items-center gap-2 mb-1">
              <Braces size={18} className="text-blue-400" />
              <h2 className="text-xl font-bold text-white">Get started</h2>
            </div>
            <p className="text-sm text-slate-400 mb-7 leading-relaxed">
              Sign in to sync files across devices, or code as a guest.
            </p>

            {/* Error */}
            {error && (
              <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-300 text-xs leading-relaxed">
                <span className="font-semibold text-red-400">Sign-in failed: </span>{error}
              </div>
            )}

            {/* Not configured */}
            {!isSupabaseConfigured && (
              <div className="mb-5 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs leading-relaxed">
                Cloud sync isn't set up — only guest mode is available.
              </div>
            )}

            {/* Google */}
            <button
              onClick={handleGoogle}
              disabled={!isSupabaseConfigured || loading !== null}
              className={cn(
                'w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-200 mb-3 relative overflow-hidden group',
                isSupabaseConfigured && loading === null
                  ? 'bg-white text-gray-800 hover:bg-gray-50 active:scale-[.98] shadow-lg shadow-black/30'
                  : 'bg-white/10 text-slate-500 cursor-not-allowed'
              )}
            >
              {isSupabaseConfigured && loading === null && (
                <span className="absolute inset-0 bg-gradient-to-r from-blue-50/0 via-blue-100/30 to-blue-50/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
              )}
              {loading === 'google' ? (
                <Loader2 size={18} className="animate-spin text-gray-600" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 48 48" className="shrink-0">
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v8.51h12.93c-.49 2.67-1.93 5.02-3.96 6.71v5.29h5.94c3.37-3.11 5.07-7.31 5.07-11.96z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.49l-5.94-5.29c-2.13 1.43-4.87 2.28-9.96 2.28-7.65 0-14.14-5.17-16.44-12.12H1.44v5.48C5.39 42.67 14.07 48 24 48z"/>
                  <path fill="#FBBC05" d="M7.56 27.38A14.41 14.41 0 0 1 7.07 24c0-1.18.2-2.32.49-3.38v-5.48H1.44A23.93 23.93 0 0 0 0 24c0 3.88.93 7.54 2.56 10.86l5-3.48z"/>
                  <path fill="#EA4335" d="M24 9.52c3.34 0 6.33 1.15 8.69 3.4l6.01-6.01C34.93 2.13 29.48 0 24 0 14.07 0 5.39 5.33 1.44 13.14l6.12 4.76C9.86 10.69 16.35 9.52 24 9.52z"/>
                </svg>
              )}
              {loading === 'google' ? 'Signing in…' : 'Continue with Google'}
            </button>

            {/* GitHub */}
            <button
              onClick={handleGitHub}
              disabled={!isSupabaseConfigured || loading !== null}
              className={cn(
                'w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-200 mb-6 border relative overflow-hidden group',
                isSupabaseConfigured && loading === null
                  ? 'bg-[#161b22] text-white hover:bg-[#1c2330] active:scale-[.98] border-white/15 shadow-lg shadow-black/30'
                  : 'bg-white/5 text-slate-500 cursor-not-allowed border-white/5'
              )}
            >
              {isSupabaseConfigured && loading === null && (
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
              )}
              {loading === 'github' ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                </svg>
              )}
              {loading === 'github' ? 'Signing in…' : 'Continue with GitHub'}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' }} />
              <span className="text-xs text-slate-600 font-medium">or</span>
              <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' }} />
            </div>

            {/* Guest */}
            <button
              onClick={onGuest}
              disabled={loading !== null}
              className="w-full px-4 py-3.5 rounded-2xl text-sm font-semibold text-slate-300 border border-white/10 hover:bg-white/[0.06] hover:border-white/20 hover:text-white active:scale-[.98] transition-all duration-200 disabled:opacity-50"
            >
              Continue as Guest
            </button>

            <p className="text-center text-xs text-slate-600 mt-4 leading-relaxed">
              Guest files are saved locally in your browser only
            </p>
          </div>

          {/* Footer */}
          <div className="mt-6 flex items-center justify-center gap-4 text-xs text-slate-600">
            <span>Free &amp; open source</span>
            <span className="w-1 h-1 rounded-full bg-slate-700" />
            <a
              href="https://github.com/jamalgattu/KM-CODE"
              target="_blank"
              rel="noreferrer"
              className="text-slate-500 hover:text-blue-400 transition-colors underline underline-offset-2"
            >
              jamalgattu/KM-CODE
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
