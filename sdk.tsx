import { useSyncExternalStore } from "react";

export function useDeviceGate(query = "(max-width: 769px)") {
  const isMobile = useSyncExternalStore(
    (callback) => {
      if (typeof window === "undefined") return () => {};
      
      const mql = window.matchMedia(query);
      mql.addEventListener("change", callback);
      return () => mql.removeEventListener("change", callback);
    },
    () => {
      if (typeof window !== "undefined") {
        return window.matchMedia(query).matches;
      }
      return false;
    }
  );

  return {
    ready: true,
    device: isMobile ? "mobile" : "desktop",
    isMobile
  };
}

