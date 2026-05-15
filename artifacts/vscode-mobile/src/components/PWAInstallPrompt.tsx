import { useState, useEffect, useRef } from "react";
import { Download, X, Share, Plus, MoreVertical } from "lucide-react";

type Platform = "android" | "ios" | "desktop" | "unknown";

function detectPlatform(): Platform {
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua) && !(window as unknown as Record<string, unknown>).MSStream) return "ios";
  if (/Android/.test(ua)) return "android";
  if (/Macintosh|Windows|Linux/.test(ua)) return "desktop";
  return "unknown";
}

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

const DISMISS_KEY = "szz-pwa-dismissed-v1";
// Show banner after this many seconds regardless of beforeinstallprompt
const SHOW_DELAY_MS = 4000;

export function PWAInstallPrompt() {
  const deferredPrompt = useRef<any>(null);
  const [show, setShow] = useState(false);
  const [platform, setPlatform] = useState<Platform>("unknown");
  const [showSteps, setShowSteps] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    if (localStorage.getItem(DISMISS_KEY)) return;

    const p = detectPlatform();
    setPlatform(p);

    // Capture the deferred prompt if/when Chrome fires it
    const onPrompt = (e: any) => {
      e.preventDefault();
      deferredPrompt.current = e;
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    // Show our own UI after a short delay — don't wait on beforeinstallprompt
    // Android Chrome delays the event up to 30+ min; we handle install manually if needed
    if (p === "android" || p === "ios" || p === "desktop") {
      const t = setTimeout(() => setShow(true), SHOW_DELAY_MS);
      return () => {
        clearTimeout(t);
        window.removeEventListener("beforeinstallprompt", onPrompt);
      };
    }

    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  const dismiss = () => {
    setShow(false);
    setShowSteps(false);
    localStorage.setItem(DISMISS_KEY, "1");
  };

  const handleInstall = async () => {
    if (deferredPrompt.current) {
      // Android Chrome native install
      deferredPrompt.current.prompt();
      const { outcome } = await deferredPrompt.current.userChoice;
      if (outcome === "accepted") {
        setShow(false);
        deferredPrompt.current = null;
      } else {
        dismiss();
      }
    } else {
      // No native prompt yet — show manual instructions
      setShowSteps(true);
    }
  };

  if (!show) return null;

  // Step-by-step instructions sheet
  if (showSteps) {
    return (
      <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-sm bg-[#161b22] border border-white/10 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-5">
            <span className="text-sm font-semibold text-white">
              {platform === "ios" ? "Add to Home Screen" : "Install App"}
            </span>
            <button onClick={dismiss} className="text-slate-500 hover:text-white p-1 -mr-1">
              <X size={16} />
            </button>
          </div>

          <div className="space-y-4">
            {platform === "ios" ? (
              <>
                <Step n={1} icon={<Share size={14} className="text-blue-400" />}>
                  Tap the <strong className="text-white">Share</strong> button in Safari's toolbar
                </Step>
                <Step n={2} icon={<Plus size={14} className="text-blue-400" />}>
                  Tap <strong className="text-white">Add to Home Screen</strong>
                </Step>
                <Step n={3} icon={<Download size={14} className="text-blue-400" />}>
                  Tap <strong className="text-white">Add</strong> — done!
                </Step>
              </>
            ) : (
              <>
                <Step n={1} icon={<MoreVertical size={14} className="text-blue-400" />}>
                  Tap the <strong className="text-white">⋮ menu</strong> in Chrome's top-right
                </Step>
                <Step n={2} icon={<Download size={14} className="text-blue-400" />}>
                  Tap <strong className="text-white">Add to Home screen</strong> or <strong className="text-white">Install app</strong>
                </Step>
                <Step n={3} icon={<Plus size={14} className="text-blue-400" />}>
                  Tap <strong className="text-white">Add</strong> — done!
                </Step>
              </>
            )}
          </div>

          <button
            onClick={dismiss}
            className="mt-5 w-full h-10 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    );
  }

  // Bottom banner
  return (
    <div className="fixed bottom-20 left-3 right-3 z-50 bg-[#161b22] border border-white/10 rounded-2xl shadow-2xl p-4">
      <button
        onClick={dismiss}
        className="absolute top-3 right-3 text-slate-600 hover:text-slate-300 p-1"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>

      <div className="flex items-center gap-3 mb-3 pr-6">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 text-lg">
          ⚡
        </div>
        <div>
          <div className="text-sm font-semibold text-white">Install Su Zai Zai Code</div>
          <div className="text-xs text-slate-500 mt-0.5">
            {platform === "ios" ? "Add to home screen" : "Works offline · faster load"}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={dismiss}
          className="flex-1 h-9 rounded-xl text-xs text-slate-500 border border-white/[0.08] hover:text-slate-300 transition-colors"
        >
          Not now
        </button>
        <button
          onClick={handleInstall}
          className="flex-1 h-9 rounded-xl text-xs text-white font-medium bg-blue-600 hover:bg-blue-500 flex items-center justify-center gap-1.5 transition-colors"
        >
          <Download size={12} />
          {platform === "ios" ? "How to install" : "Install"}
        </button>
      </div>
    </div>
  );
}

function Step({ n, icon, children }: { n: number; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-5 h-5 rounded-full bg-blue-600/15 border border-blue-500/25 flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-[10px] text-blue-400 font-bold">{n}</span>
      </div>
      <div className="flex items-center gap-2 text-xs text-slate-400">
        {icon}
        <span>{children}</span>
      </div>
    </div>
  );
}
