import { useEffect, useState } from 'react';

// Minimal type alias — we access google.maps through the global window object.
type GoogleNs = any;

declare global {
  interface Window {
    google?: GoogleNs;
    __gmapsLoaderPromise?: Promise<GoogleNs>;
  }
}

const API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';
const LIBRARIES = 'places,geometry';

function loadScript(): Promise<GoogleNs> {
  if (typeof window === 'undefined') return Promise.reject(new Error('SSR'));
  if (window.google?.maps?.Map) return Promise.resolve(window.google);
  if (window.__gmapsLoaderPromise) return window.__gmapsLoaderPromise;

  window.__gmapsLoaderPromise = new Promise((resolve, reject) => {
    if (!API_KEY) {
      reject(new Error('REACT_APP_GOOGLE_MAPS_API_KEY manquant dans .env'));
      return;
    }

    // Poll until google.maps.Map is actually available (handles both sync and async loading).
    const waitForReady = () => {
      const start = Date.now();
      const tick = () => {
        if (window.google?.maps?.Map) return resolve(window.google);
        if (Date.now() - start > 15000) {
          reject(new Error('Google Maps SDK prend trop de temps à s\'initialiser.'));
          return;
        }
        setTimeout(tick, 50);
      };
      tick();
    };

    const existing = document.querySelector<HTMLScriptElement>('script[data-gmaps-loader]');
    if (existing) {
      if (window.google?.maps?.Map) {
        resolve(window.google);
        return;
      }
      existing.addEventListener('load', waitForReady);
      existing.addEventListener('error', () => reject(new Error('Google Maps failed to load')));
      return;
    }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(API_KEY)}&libraries=${LIBRARIES}&language=fr&region=GN&v=weekly`;
    script.async = true;
    script.defer = true;
    script.dataset.gmapsLoader = 'true';
    script.onload = waitForReady;
    script.onerror = () => {
      window.__gmapsLoaderPromise = undefined;
      reject(new Error('Impossible de charger Google Maps. Vérifiez la clé API et votre connexion.'));
    };
    document.head.appendChild(script);
  });

  return window.__gmapsLoaderPromise;
}

export interface GoogleMapsState {
  google: GoogleNs | null;
  isLoaded: boolean;
  error: string | null;
}

export function useGoogleMaps(): GoogleMapsState {
  const [state, setState] = useState<GoogleMapsState>(() => ({
    google: typeof window !== 'undefined' && window.google?.maps?.Map ? window.google : null,
    isLoaded: typeof window !== 'undefined' && !!window.google?.maps?.Map,
    error: null,
  }));

  useEffect(() => {
    if (state.isLoaded) return;
    let active = true;
    loadScript()
      .then(google => {
        if (!active) return;
        setState({ google, isLoaded: true, error: null });
      })
      .catch(err => {
        if (!active) return;
        setState({ google: null, isLoaded: false, error: err.message || 'Erreur Google Maps' });
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return state;
}

// Helper: prompts navigator.geolocation and returns coords or a fallback.
export async function getCurrentPosition(fallback: { lat: number; lng: number } = { lat: 9.537, lng: -13.6773 }): Promise<{ lat: number; lng: number; fromGPS: boolean }> {
  if (typeof window === 'undefined' || !('geolocation' in navigator)) {
    return { ...fallback, fromGPS: false };
  }
  return new Promise(resolve => {
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, fromGPS: true }),
      () => resolve({ ...fallback, fromGPS: false }),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60_000 },
    );
  });
}
