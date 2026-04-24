import React, { useEffect, useState } from 'react';
import Modal from './Modal';
import GoogleMap, { MapMarker, RouteInfo } from './GoogleMap';
import { getCurrentPosition } from '../../hooks/useGoogleMaps';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  location: { lat: number; lng: number; address: string; city?: string };
  citizenName?: string;
  citizenPhone?: string;
  /** Accent color used for the citizen marker + route. */
  accentColor?: string;
  /** Emoji shown on the citizen marker. */
  accentIcon?: string;
  /** Title text for the modal. */
  title?: string;
}

export default function LocationMapModal({
  isOpen,
  onClose,
  location,
  citizenName,
  citizenPhone,
  accentColor = '#ef4444',
  accentIcon = '🆘',
  title = 'Localisation du citoyen',
}: Props) {
  const [responderPos, setResponderPos] = useState<{ lat: number; lng: number } | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);

  useEffect(() => {
    if (!isOpen) { setRouteInfo(null); return; }
    getCurrentPosition({ lat: location.lat, lng: location.lng }).then(p => {
      if (p.fromGPS) setResponderPos({ lat: p.lat, lng: p.lng });
    });
  }, [isOpen, location.lat, location.lng]);

  const markers: MapMarker[] = [
    {
      id: 'citizen',
      lat: location.lat,
      lng: location.lng,
      icon: accentIcon,
      color: accentColor,
      title: citizenName || 'Citoyen',
      size: 'lg',
      popup: (
        <div style={{ minWidth: 180, padding: '2px 4px 4px' }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>
            {citizenName ? `📍 ${citizenName}` : '📍 Position signalée'}
          </div>
          <div style={{ fontSize: 11, color: '#475569' }}>{location.address}</div>
          {location.city && <div style={{ fontSize: 11, color: '#64748b' }}>{location.city}</div>}
          {citizenPhone && <div style={{ fontSize: 11, color: accentColor, fontWeight: 700, marginTop: 4 }}>📞 {citizenPhone}</div>}
        </div>
      ),
    },
  ];

  const gmapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`;
  const crowKm = responderPos
    ? (() => {
        const dy = (location.lat - responderPos.lat) * 111;
        const dx = (location.lng - responderPos.lng) * 111 * Math.cos(responderPos.lat * Math.PI / 180);
        return Math.sqrt(dx * dx + dy * dy);
      })()
    : null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="xl">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Address summary */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: `${accentColor}10`, border: `1px solid ${accentColor}30`, borderRadius: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 10, background: accentColor, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
            {accentIcon}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>{citizenName || 'Position signalée'}</div>
            <div style={{ fontSize: 12, color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              📍 {location.address}{location.city ? `, ${location.city}` : ''}
            </div>
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
              {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
              {crowKm !== null && ` · 📏 ${crowKm.toFixed(1)} km à vol d'oiseau`}
            </div>
          </div>
        </div>

        {/* Route summary (filled when Google Directions returns) */}
        {routeInfo && (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', padding: '10px 14px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 10 }}>
            <span style={{ fontSize: 18 }}>🧭</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#0c4a6e' }}>Itinéraire routier</div>
              <div style={{ fontSize: 12, color: '#0369a1' }}>
                {routeInfo.distanceText} · ⏱ {routeInfo.durationText}
              </div>
            </div>
          </div>
        )}

        {/* Map */}
        <div style={{ height: 'clamp(260px, 55vh, 460px)', borderRadius: 14, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
          <GoogleMap
            center={{ lat: location.lat, lng: location.lng }}
            zoom={15}
            markers={markers}
            selectedId="citizen"
            userLocation={responderPos}
            drawRouteToSelected
            onRouteInfo={setRouteInfo}
            style={{ borderRadius: 0, height: '100%' }}
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <a
            href={gmapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flex: 1,
              minWidth: 200,
              padding: '12px 16px',
              background: accentColor,
              borderRadius: 10,
              color: 'white',
              fontSize: 13,
              fontWeight: 700,
              textDecoration: 'none',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: `0 4px 14px ${accentColor}50`,
            }}
          >
            🧭 Itinéraire dans Google Maps
          </a>
          {citizenPhone && (
            <a
              href={`tel:${citizenPhone}`}
              style={{
                padding: '12px 16px',
                background: '#f0fff4',
                border: '1px solid #c6f6d5',
                borderRadius: 10,
                color: '#2f855a',
                fontSize: 13,
                fontWeight: 700,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              📞 Appeler
            </a>
          )}
          <button
            onClick={onClose}
            style={{
              padding: '12px 18px',
              background: '#f7fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 10,
              color: '#4a5568',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Fermer
          </button>
        </div>
      </div>
    </Modal>
  );
}
