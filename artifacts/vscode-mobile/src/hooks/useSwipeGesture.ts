import { useEffect, useRef } from "react";
import { useEditorStore } from "@/store/editorStore";

const EDGE_ZONE = 24;    // px from left edge to start an open-swipe
const THRESHOLD = 60;    // min horizontal travel to trigger
const MAX_VERTICAL = 80; // abort if user is scrolling vertically

export function useSwipeGesture() {
  const { sidebarVisible, setSidebarVisible } = useEditorStore();
  const sidebarVisibleRef = useRef(sidebarVisible);
  sidebarVisibleRef.current = sidebarVisible;

  useEffect(() => {
    // Only wire up on mobile
    if (window.innerWidth >= 640) return;

    let startX = 0;
    let startY = 0;
    let tracking = false; // true = we claimed this touch

    const onTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      tracking = false;

      // Open swipe: finger starts within EDGE_ZONE of the left edge
      if (!sidebarVisibleRef.current && startX <= EDGE_ZONE) {
        tracking = true;
      }
      // Close swipe: sidebar is open, finger can start anywhere
      if (sidebarVisibleRef.current) {
        tracking = true;
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!tracking) return;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;

      // Abort if movement is more vertical than horizontal (user is scrolling)
      if (Math.abs(dy) > MAX_VERTICAL) return;

      if (!sidebarVisibleRef.current && dx > THRESHOLD) {
        setSidebarVisible(true);
      } else if (sidebarVisibleRef.current && dx < -THRESHOLD) {
        setSidebarVisible(false);
      }
    };

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, [setSidebarVisible]);
}
