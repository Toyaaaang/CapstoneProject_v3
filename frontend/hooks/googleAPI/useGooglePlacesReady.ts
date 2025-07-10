import { useEffect, useState } from "react";

export function useGooglePlacesReady() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (window.google && window.google.maps && window.google.maps.places) {
        setReady(true);
        clearInterval(interval);
      }
    }, 300);
    return () => clearInterval(interval);
  }, []);

  return ready;
}
