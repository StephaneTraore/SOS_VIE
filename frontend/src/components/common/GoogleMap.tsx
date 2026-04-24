import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useGoogleMaps } from '../../hooks/useGoogleMaps';

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  /** Short text used in the pin label (kept ≤ 2 chars by the renderer). */
  label?: string;
  /** Emoji/icon drawn inside a circular badge. */
  icon?: string;
  color?: string;
  title?: string;
  /** Optional React node rendered inside the InfoWindow on click. */
  popup?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
}

export interface RouteInfo {
  distanceText: string;
  durationText: string;
  distanceMeters: number;
  durationSeconds: number;
}

interface GoogleMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: MapMarker[];
  selectedId?: string | null;
  onMarkerClick?: (id: string) => void;
  onMapClick?: (lat: number, lng: number) => void;
  userLocation?: { lat: number; lng: number } | null;
  /**
   * When `userLocation` and a selected marker are present, ask Google Directions
   * for a real road itinerary and render it on the map. Falls back to a dashed
   * straight line if the request fails.
   */
  drawRouteToSelected?: boolean;
  /** Travel mode for the directions (default DRIVING). */
  travelMode?: 'DRIVING' | 'WALKING' | 'BICYCLING' | 'TRANSIT';
  /** Called when a route is computed successfully (or reset to null when cleared). */
  onRouteInfo?: (info: RouteInfo | null) => void;
  style?: React.CSSProperties;
  className?: string;
  /** Optional forced map type: 'roadmap' | 'hybrid' | 'satellite' | 'terrain'. */
  mapType?: 'roadmap' | 'hybrid' | 'satellite' | 'terrain';
  /** Show the native zoom/street-view/fullscreen controls. */
  showControls?: boolean;
}

const CONAKRY = { lat: 9.537, lng: -13.6773 };

// Subtle bluish map style to match the SOS VIE brand
const LIGHT_STYLE: any[] = [
  { elementType: 'geometry', stylers: [{ color: '#f5f9fc' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#52606d' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#f5f9fc' }] },
  { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#0077B6' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#64748b' }] },
  { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#d8efe2' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road.arterial', elementType: 'labels.text.fill', stylers: [{ color: '#334155' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#e2edf5' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#0f172a' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c6e6f4' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#0077B6' }] },
];

function makeMarkerIcon(google: any, m: MapMarker, isSelected: boolean) {
  const color = m.color || '#0096C7';
  const size = m.size === 'lg' ? 46 : m.size === 'sm' ? 30 : 38;
  const scale = isSelected ? 1.15 : 1;
  const px = Math.round(size * scale);
  const iconText = (m.icon || '').trim();
  // Build a data URL SVG — avoids any external asset and renders crisply.
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px + 6}" viewBox="0 0 ${px} ${px + 6}">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="${color}" flood-opacity="0.45"/>
        </filter>
      </defs>
      <circle cx="${px / 2}" cy="${px / 2}" r="${px / 2 - 3}" fill="${color}" stroke="white" stroke-width="3" filter="url(#shadow)"/>
      <text x="${px / 2}" y="${px / 2 + 5}" font-size="${Math.round(px * 0.5)}" text-anchor="middle" font-family="Apple Color Emoji, Segoe UI Emoji, sans-serif">${iconText}</text>
    </svg>
  `.trim();
  return {
    url: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(px, px + 6),
    anchor: new google.maps.Point(px / 2, px / 2),
  };
}

function makeUserIcon(google: any) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
      <circle cx="14" cy="14" r="12" fill="rgba(0,150,199,0.22)"/>
      <circle cx="14" cy="14" r="7" fill="#0077B6" stroke="white" stroke-width="3"/>
    </svg>
  `.trim();
  return {
    url: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(28, 28),
    anchor: new google.maps.Point(14, 14),
  };
}

export default function GoogleMap({
  center = CONAKRY,
  zoom = 13,
  markers = [],
  selectedId,
  onMarkerClick,
  onMapClick,
  userLocation,
  drawRouteToSelected,
  travelMode = 'DRIVING',
  onRouteInfo,
  style,
  className,
  mapType = 'roadmap',
  showControls = true,
}: GoogleMapProps) {
  const { google, isLoaded, error } = useGoogleMaps();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRefs = useRef<Map<string, any>>(new Map());
  const userMarkerRef = useRef<any>(null);
  const routeRef = useRef<any>(null);
  const directionsRendererRef = useRef<any>(null);
  const directionsServiceRef = useRef<any>(null);
  const onRouteInfoRef = useRef(onRouteInfo);
  onRouteInfoRef.current = onRouteInfo;
  const infoWindowRef = useRef<any>(null);
  const infoContainerRef = useRef<HTMLDivElement | null>(null);
  const [infoReactContent, setInfoReactContent] = useState<React.ReactNode>(null);

  // Initialise the map once the API is loaded
  useEffect(() => {
    if (!isLoaded || !google || !containerRef.current || mapRef.current) return;
    mapRef.current = new google.maps.Map(containerRef.current, {
      center,
      zoom,
      mapTypeId: mapType,
      styles: mapType === 'roadmap' ? LIGHT_STYLE : undefined,
      disableDefaultUI: !showControls,
      zoomControl: showControls,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: showControls,
      clickableIcons: false,
      gestureHandling: 'greedy',
      backgroundColor: '#f5f9fc',
    });
    infoContainerRef.current = document.createElement('div');
    infoWindowRef.current = new google.maps.InfoWindow({ content: infoContainerRef.current });

    if (onMapClick) {
      mapRef.current.addListener('click', (e: any) => {
        if (e.latLng) onMapClick(e.latLng.lat(), e.latLng.lng());
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, google]);

  // Pan/zoom when center or zoom props change
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.panTo(center);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center.lat, center.lng]);

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setZoom(zoom);
  }, [zoom]);

  // Render / update markers
  useEffect(() => {
    if (!isLoaded || !google || !mapRef.current) return;
    const active = new Set<string>();
    markers.forEach(m => {
      active.add(m.id);
      const isSelected = selectedId === m.id;
      const icon = makeMarkerIcon(google, m, isSelected);
      let marker = markerRefs.current.get(m.id);
      if (!marker) {
        marker = new google.maps.Marker({
          position: { lat: m.lat, lng: m.lng },
          map: mapRef.current,
          icon,
          title: m.title,
          optimized: false,
          zIndex: isSelected ? 1000 : 500,
        });
        marker.addListener('click', () => {
          onMarkerClick?.(m.id);
          if (m.popup && infoContainerRef.current) {
            setInfoReactContent(m.popup);
            infoWindowRef.current?.open({ map: mapRef.current, anchor: marker });
          }
        });
        markerRefs.current.set(m.id, marker);
      } else {
        marker.setPosition({ lat: m.lat, lng: m.lng });
        marker.setIcon(icon);
        marker.setZIndex(isSelected ? 1000 : 500);
        marker.setTitle(m.title || '');
      }
    });
    // Remove stale markers
    markerRefs.current.forEach((marker, id) => {
      if (!active.has(id)) {
        marker.setMap(null);
        markerRefs.current.delete(id);
      }
    });
  }, [markers, selectedId, isLoaded, google, onMarkerClick]);

  // Auto-open InfoWindow on selected marker, if it has popup content
  useEffect(() => {
    if (!isLoaded || !google || !mapRef.current) return;
    if (!selectedId) {
      infoWindowRef.current?.close();
      return;
    }
    const m = markers.find(x => x.id === selectedId);
    const marker = markerRefs.current.get(selectedId);
    if (m?.popup && marker && infoContainerRef.current) {
      setInfoReactContent(m.popup);
      infoWindowRef.current.open({ map: mapRef.current, anchor: marker });
    } else {
      infoWindowRef.current?.close();
    }
  }, [selectedId, markers, isLoaded, google]);

  // User marker
  useEffect(() => {
    if (!isLoaded || !google || !mapRef.current) return;
    if (!userLocation) {
      if (userMarkerRef.current) {
        userMarkerRef.current.setMap(null);
        userMarkerRef.current = null;
      }
      return;
    }
    if (!userMarkerRef.current) {
      userMarkerRef.current = new google.maps.Marker({
        position: userLocation,
        map: mapRef.current,
        icon: makeUserIcon(google),
        title: 'Votre position',
        zIndex: 2000,
      });
    } else {
      userMarkerRef.current.setPosition(userLocation);
    }
  }, [userLocation, isLoaded, google]);

  // Route (real driving directions via Google Directions API, with polyline fallback)
  useEffect(() => {
    if (!isLoaded || !google || !mapRef.current) return;

    const clearRoute = () => {
      if (routeRef.current) { routeRef.current.setMap(null); routeRef.current = null; }
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
        directionsRendererRef.current = null;
      }
    };

    clearRoute();
    if (!drawRouteToSelected || !userLocation || !selectedId) {
      onRouteInfoRef.current?.(null);
      return;
    }
    const sel = markers.find(m => m.id === selectedId);
    if (!sel) { onRouteInfoRef.current?.(null); return; }

    const strokeColor = sel.color || '#0096C7';

    const drawStraightFallback = () => {
      routeRef.current = new google.maps.Polyline({
        map: mapRef.current,
        path: [userLocation, { lat: sel.lat, lng: sel.lng }],
        geodesic: true,
        strokeOpacity: 0,
        icons: [{
          icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, strokeColor, scale: 3 },
          offset: '0',
          repeat: '12px',
        }],
      });
    };

    if (!google.maps.DirectionsService || !google.maps.DirectionsRenderer) {
      drawStraightFallback();
      return;
    }

    if (!directionsServiceRef.current) {
      directionsServiceRef.current = new google.maps.DirectionsService();
    }

    const renderer = new google.maps.DirectionsRenderer({
      map: mapRef.current,
      suppressMarkers: true,
      preserveViewport: true,
      polylineOptions: {
        strokeColor,
        strokeOpacity: 0.9,
        strokeWeight: 5,
      },
    });
    directionsRendererRef.current = renderer;

    let cancelled = false;
    directionsServiceRef.current.route(
      {
        origin: userLocation,
        destination: { lat: sel.lat, lng: sel.lng },
        travelMode: google.maps.TravelMode[travelMode],
      },
      (result: any, status: any) => {
        if (cancelled) return;
        if (status === google.maps.DirectionsStatus.OK && result) {
          renderer.setDirections(result);
          const leg = result.routes?.[0]?.legs?.[0];
          if (leg && onRouteInfoRef.current) {
            onRouteInfoRef.current({
              distanceText: leg.distance?.text ?? '',
              durationText: leg.duration?.text ?? '',
              distanceMeters: leg.distance?.value ?? 0,
              durationSeconds: leg.duration?.value ?? 0,
            });
          }
        } else {
          renderer.setMap(null);
          directionsRendererRef.current = null;
          drawStraightFallback();
          onRouteInfoRef.current?.(null);
        }
      },
    );

    return () => { cancelled = true; };
  }, [drawRouteToSelected, selectedId, userLocation, markers, isLoaded, google, travelMode]);

  const overlayPortal = useMemo(() => {
    if (!infoContainerRef.current) return null;
    // Render React content into the InfoWindow div via createPortal
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const ReactDOM = require('react-dom');
    return ReactDOM.createPortal(infoReactContent, infoContainerRef.current);
  }, [infoReactContent]);

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: 260,
        borderRadius: 14,
        overflow: 'hidden',
        background: '#f5f9fc',
        ...style,
      }}
    >
      <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />

      {!isLoaded && !error && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 14,
            background:
              'linear-gradient(135deg, #e0f7fa 0%, #f5f9fc 100%)',
            color: '#475569',
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              border: '3px solid rgba(0,150,199,0.15)',
              borderTopColor: '#0096C7',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: 0.4 }}>
            Chargement de la carte…
          </div>
        </div>
      )}

      {error && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            gap: 12,
            background: 'linear-gradient(135deg, #fff 0%, #fef2f2 100%)',
            color: '#dc2626',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 36 }}>🗺️</div>
          <div style={{ fontSize: 14, fontWeight: 800 }}>Impossible de charger Google Maps</div>
          <div style={{ fontSize: 12, color: '#64748b', maxWidth: 420 }}>{error}</div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>
            Vérifiez que <code>REACT_APP_GOOGLE_MAPS_API_KEY</code> est bien défini dans <code>.env</code> et que l'API <strong>Maps JavaScript API</strong> est activée sur votre projet Google Cloud.
          </div>
        </div>
      )}

      {overlayPortal}
    </div>
  );
}
