import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [show, setShow] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Already installed as PWA
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
      return;
    }

    // Already dismissed
    if (localStorage.getItem("pwa-dismissed")) return;

    // Show after 2 seconds always
    const timer = setTimeout(() => setShow(true), 2000);

    // Catch Chrome's prompt when available
    window.addEventListener("beforeinstallprompt", (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });

    return () => clearTimeout(timer);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      if (result.outcome === "accepted") {
        setShow(false);
        setInstalled(true);
      }
    } else {
      // Show manual instructions
      alert(
        "To install:\n\n" +
        "Android: Tap ⋮ menu → 'Add to Home screen'\n\n" +
        "iPhone: Tap Share button → 'Add to Home Screen'"
      );
    }
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem("pwa-dismissed", "true");
  };

  if (installed || !show) return null;

  return (
    <div className="fixed bottom-16 left-3 right-3 z-50 bg-[#1e1e2e] border border-blue-500/40 rounded-2xl shadow-2xl p-4 animate-in slide-in-from-bottom-4">
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 text-gray-500 hover:text-gray-300"
      >
        <X size={16} />
      </button>

      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-2xl shrink-0">
          ⚡
        </div>
        <div>
          <div className="text-white font-semibold text-sm">
            Install Su Zai Zai Code
          </div>
          <div className="text-gray-400 text-xs mt-0.5">
            Code on your phone. Free forever.
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleDismiss}
          className="flex-1 py-2 rounded-xl text-xs text-gray-400 border border-gray-700"
        >
          Not now
        </button>
        <button
          onClick={handleInstall}
          className="flex-1 py-2 rounded-xl text-xs text-white bg-blue-600 hover:bg-blue-500 flex items-center justify-center gap-1"
        >
          <Download size={12} />
          Install
        </button>
      </div>
    </div>
  );
        }
