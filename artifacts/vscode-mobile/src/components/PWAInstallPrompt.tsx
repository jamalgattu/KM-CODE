import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already dismissed
    const wasDismissed = localStorage.getItem("pwa-prompt-dismissed");
    if (wasDismissed) return;

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    // Android/Chrome install prompt
    window.addEventListener("beforeinstallprompt", (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setTimeout(() => setShowPrompt(true), 3000);
    });

    // iOS detection
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isInStandaloneMode = window.navigator.standalone === true;
    if (isIOS && !isInStandaloneMode) {
      setTimeout(() => setShowPrompt(true), 3000);
    }
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      if (result.outcome === "accepted") {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    } else {
      // iOS — show manual guide
      setShowIOSGuide(true);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem("pwa-prompt-dismissed", "true");
  };

  if (!showPrompt || dismissed) return null;

  return (
    <>
      {/* Main prompt */}
      {!showIOSGuide && (
        <div className="fixed bottom-20 left-3 right-3 z-50 bg-[#1e1e2e] border border-blue-500/30 rounded-xl shadow-2xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
              <span className="text-lg">⚡</span>
            </div>
            <div className="flex-1">
              <div className="text-white font-semibold text-sm">
                Install Su Zai Zai Code
              </div>
              <div className="text-gray-400 text-xs mt-0.5">
                Add to home screen for the best experience. Works offline too!
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-gray-500 hover:text-gray-300 p-1"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex gap-2 mt-3">
            <button
              onClick={handleDismiss}
              className="flex-1 py-2 rounded-lg text-xs text-gray-400 border border-gray-700 hover:bg-gray-800 transition-colors"
            >
              Not now
            </button>
            <button
              onClick={handleInstall}
              className="flex-1 py-2 rounded-lg text-xs text-white bg-blue-600 hover:bg-blue-500 transition-colors flex items-center justify-center gap-1"
            >
              <Download size={12} />
              Install App
            </button>
          </div>
        </div>
      )}

      {/* iOS manual guide */}
      {showIOSGuide && (
        <div className="fixed bottom-20 left-3 right-3 z-50 bg-[#1e1e2e] border border-blue-500/30 rounded-xl shadow-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white font-semibold text-sm">
              Install on iPhone
            </span>
            <button onClick={() => setShowPrompt(false)} className="text-gray-500">
              <X size={16} />
            </button>
          </div>
          <div className="space-y-2 text-xs text-gray-300">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs shrink-0">1</span>
              <span>Tap the <strong>Share</strong> button (box with arrow) at bottom of Safari</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs shrink-0">2</span>
              <span>Scroll down and tap <strong>"Add to Home Screen"</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs shrink-0">3</span>
              <span>Tap <strong>"Add"</strong> in the top right</span>
            </div>
          </div>
          <button
            onClick={() => setShowPrompt(false)}
            className="w-full mt-3 py-2 rounded-lg text-xs text-white bg-blue-600 hover:bg-blue-500 transition-colors"
          >
            Got it!
          </button>
        </div>
      )}
    </>
  );
                            }
