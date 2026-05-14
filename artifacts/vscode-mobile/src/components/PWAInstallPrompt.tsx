import { useState, useEffect } from "react";
import { Download, X, Share, Plus } from "lucide-react";

type Platform = "android" | "ios" | "desktop" | "unknown";

function detectPlatform(): Platform {
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream) return "ios";
  if (/Android/.test(ua)) return "android";
  if (/Macintosh|Windows|Linux/.test(ua)) return "desktop";
  return "unknown";
}

function isInStandaloneMode(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true
  );
}

const DISMISS_KEY = "km-pwa-dismissed-v2";

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [show, setShow] = useState(false);
  const [platform, setPlatform] = useState<Platform>("unknown");
  const [showIOSSteps, setShowIOSSteps] = useState(false);

  useEffect(() => {
    if (isInStandaloneMode()) return;
    if (localStorage.getItem(DISMISS_KEY)) return;

    const p = detectPlatform();
    setPlatform(p);

    if (p === "android") {
      // Wait for Chrome's native prompt event
      const handler = (e: any) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setShow(true);
      };
      window.addEventListener("beforeinstallprompt", handler);
      return () => window.removeEventListener("beforeinstallprompt", handler);
    }

    if (p === "ios") {
      // On iOS Safari, show custom instructions after 4 seconds
      const timer = setTimeout(() => setShow(true), 4000);
      return () => clearTimeout(timer);
    }

    // Desktop: show a subtle banner after 10s
    if (p === "desktop") {
      const handler = (e: any) => {
        e.preventDefault();
        setDeferredPrompt(e);
        const timer = setTimeout(() => setShow(true), 10_000);
        return () => clearTimeout(timer);
      };
      window.addEventListener("beforeinstallprompt", handler);
      return () => window.removeEventListener("beforeinstallprompt", handler);
    }
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShow(false);
        setDeferredPrompt(null);
      } else {
        dismiss();
      }
    } else if (platform === "ios") {
      setShowIOSSteps(true);
    }
  };

  const dismiss = () => {
    setShow(false);
    setShowIOSSteps(false);
    localStorage.setItem(DISMISS_KEY, "1");
  };

  if (!show) return null;

  // iOS step-by-step instructions overlay
  if (showIOSSteps) {
    return (
      <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="w-full max-w-sm bg-[#1e1e2e] border border-white/10 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-white font-semibold">Install KM Code</span>
            <button onClick={dismiss} className="text-slate-400 hover:text-white p-1">
              <X size={18} />
            </button>
          </div>
          <div className="space-y-4">
            <Step n={1} icon={<Share size={16} className="text-blue-400" />}>
              Tap the <strong className="text-white">Share</strong> button at the bottom of Safari
            </Step>
            <Step n={2} icon={<Plus size={16} className="text-blue-400" />}>
              Scroll down and tap <strong className="text-white">Add to Home Screen</strong>
            </Step>
            <Step n={3} icon={<Download size={16} className="text-blue-400" />}>
              Tap <strong className="text-white">Add</strong> — KM Code appears on your home screen!
            </Step>
          </div>
          <button
            onClick={dismiss}
            className="mt-5 w-full py-2.5 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 left-3 right-3 z-50 bg-[#1a1a2e] border border-blue-500/30 rounded-2xl shadow-2xl p-4 animate-in slide-in-from-bottom-4 duration-300">
      <button
        onClick={dismiss}
        className="absolute top-3 right-3 text-slate-500 hover:text-slate-300 p-1"
        aria-label="Dismiss"
      >
        <X size={15} />
      </button>

      <div className="flex items-center gap-3 mb-3 pr-4">
        <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
          <span className="text-xl">⚡</span>
        </div>
        <div>
          <div className="text-white font-semibold text-sm leading-tight">Install KM Code</div>
          <div className="text-slate-400 text-xs mt-0.5">
            {platform === "ios"
              ? "Add to home screen for the best experience"
              : "Code on your phone — works offline too"}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={dismiss}
          className="flex-1 py-2 rounded-xl text-xs text-slate-400 border border-white/10 hover:bg-white/5 transition-colors"
        >
          Not now
        </button>
        <button
          onClick={handleInstall}
          className="flex-1 py-2 rounded-xl text-xs text-white font-medium bg-blue-600 hover:bg-blue-500 flex items-center justify-center gap-1.5 transition-colors"
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
      <div className="w-6 h-6 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-xs text-blue-400 font-bold">{n}</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-slate-300">
        {icon}
        <span>{children}</span>
      </div>
    </div>
  );
}
