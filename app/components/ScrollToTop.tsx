import { useEffect } from "react";
import { useLocation } from "@tanstack/react-router";

export function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    // Try to scroll the main scroll container first
    const mainScrollContainer = document.getElementById("main-scroll-container");
    if (mainScrollContainer) {
      mainScrollContainer.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }

    // Also scroll the window as fallback
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location.pathname]);

  return null;
}

