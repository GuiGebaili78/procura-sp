import { useState, useEffect } from "react";
import type { Coordinates } from "../types/location";

interface GeoState {
  coords?: Coordinates | null;
  error?: string | null;
  loading: boolean;
}

export function useGeoLocation(enable = true) {
  const [state, setState] = useState<GeoState>({
    coords: undefined,
    error: null,
    loading: false,
  });

  useEffect(() => {
    if (
      !enable ||
      typeof navigator === "undefined" ||
      !("geolocation" in navigator)
    ) {
      setState((s) => ({
        ...s,
        error: "Geolocalização não disponível",
        loading: false,
      }));
      return;
    }

    setState((s) => ({ ...s, loading: true }));

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          coords: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          error: null,
          loading: false,
        });
      },
      (err) => {
        setState({ coords: null, error: err.message, loading: false });
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );

    return () => {
      // No watcher to clear for getCurrentPosition, kept for symmetry
    };
  }, [enable]);

  return state;
}
