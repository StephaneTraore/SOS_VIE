import React, { useEffect, useMemo, useState } from 'react';
import { useAlerts } from '../../context/AlertContext';
import PageLayout from '../../components/layout/PageLayout';
import { StatusBadge, PriorityBadge } from '../../components/common/StatusBadge';
import { alertTypeIcons, priorityColors, timeAgo } from '../../utils/helpers';
import { Alert } from '../../types';
import GoogleMap, { MapMarker } from '../../components/common/GoogleMap';
import { getCurrentPosition } from '../../hooks/useGoogleMaps';

const CONAKRY = { lat: 9.537, lng: -13.6773 };

export default function MapPage() {
  const { alerts } = useAlerts();
  const [selected, setSelected] = useState<Alert | null>(null);
  const [filterType, setFilterType] = useState('active');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState(CONAKRY);

  useEffect(() => {
    getCurrentPosition(CONAKRY).then(pos => {
      const coords = { lat: pos.lat, lng: pos.lng };
      setUserLocation(coords);
      if (pos.fromGPS) setMapCenter(coords);
    });
  }, []);

  const displayed = filterType === 'active'
    ? alerts.filter(a => a.status !== 'resolved' && a.status !== 'cancelled')
    : alerts;

  const markers = useMemo<MapMarker[]>(() => displayed.map(alert => ({
    id: alert.id,
    lat: alert.location.lat,
    lng: alert.location.lng,
    icon: alertTypeIcons[alert.type],
    color: priorityColors[alert.priority],
    title: alert.title,
    size: selected?.id === alert.id ? 'lg' : 'md',
    popup: (
      <div style={{ minWidth: 200, maxWidth: 260, padding: '2px 4px 4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: priorityColors[alert.priority], display: 'inline-block' }} />
          <span style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>{alert.title}</span>
        </div>
        <div style={{ fontSize: 11, color: '#475569', marginBottom: 6 }}>📍 {alert.location.address}</div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          <StatusBadge status={alert.status} />
          <PriorityBadge priority={alert.priority} />
          <span style={{ fontSize: 10, color: '#94a3b8' }}>{timeAgo(alert.createdAt)}</span>
        </div>
      </div>
    ),
  })), [displayed, selected]);

  const handleSelect = (alert: Alert) => {
    const isSame = selected?.id === alert.id;
    const next = isSame ? null : alert;
    setSelected(next);
    setSidebarOpen(false);
    if (next) setMapCenter({ lat: next.location.lat, lng: next.location.lng });
  };

  return (
    <PageLayout noPadding>
      <div style={{ display: 'flex', height: 'calc(100vh - 64px)', position: 'relative' }} className="page-enter">

        {/* Mobile toggle button */}
        <button className="map-toggle-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{ position: 'absolute', top: 12, left: 12, zIndex: 60, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '8px 14px', fontSize: 13, fontWeight: 700, color: '#1a202c', cursor: 'pointer', alignItems: 'center', gap: 6, boxShadow: '0 2px 10px rgba(0,0,0,0.12)' }}>
          📋 {displayed.length} alerte(s)
        </button>

        {/* Sidebar backdrop on mobile */}
        {sidebarOpen && (
          <div onClick={() => setSidebarOpen(false)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 49, display: 'none' }}
            className="show-mobile" />
        )}

        {/* Sidebar */}
        <div className={`map-sidebar${sidebarOpen ? ' open' : ''}`}
          style={{ width: 320, background: '#fff', borderRight: '1px solid #e2e8f0', overflow: 'auto', flexShrink: 0, zIndex: 50 }}>
          <div style={{ padding: '18px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: '#1a202c' }}>🗺️ Carte des alertes</h2>
              <button className="show-mobile" onClick={() => setSidebarOpen(false)}
                style={{ background: '#f7fafc', border: 'none', width: 30, height: 30, borderRadius: 8, fontSize: 16, cursor: 'pointer', display: 'none', alignItems: 'center', justifyContent: 'center' }}>
                ✕
              </button>
            </div>
            <p style={{ fontSize: 12, color: '#718096', marginBottom: 14 }}>Conakry — {displayed.length} alerte(s)</p>

            <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
              {[{ v: 'active', l: 'Actives' }, { v: 'all', l: 'Toutes' }].map(f => (
                <button key={f.v} onClick={() => setFilterType(f.v)}
                  style={{ flex: 1, padding: '7px', border: `1.5px solid ${filterType === f.v ? '#0096C7' : '#e2e8f0'}`, borderRadius: 8, background: filterType === f.v ? '#e0f7fa' : '#fff', color: filterType === f.v ? '#0096C7' : '#718096', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  {f.l}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {displayed.map(alert => {
                const isSelected = selected?.id === alert.id;
                return (
                  <div key={alert.id} onClick={() => handleSelect(alert)}
                    style={{ padding: '11px 12px', border: `1.5px solid ${isSelected ? '#0096C7' : '#e2e8f0'}`, borderRadius: 9, cursor: 'pointer', background: isSelected ? '#e0f7fa' : '#fafafa', transition: 'all 0.15s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: priorityColors[alert.priority], flexShrink: 0, display: 'inline-block' }} />
                      <span style={{ fontSize: 14 }}>{alertTypeIcons[alert.type]}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#1a202c', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{alert.title}</span>
                    </div>
                    <div style={{ fontSize: 11, color: '#718096', marginBottom: 5 }}>📍 {alert.location.address}</div>
                    <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                      <StatusBadge status={alert.status} />
                      <span style={{ fontSize: 10, color: '#a0aec0' }}>{timeAgo(alert.createdAt)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Map area */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <GoogleMap
            center={mapCenter}
            zoom={selected ? 15 : 13}
            markers={markers}
            selectedId={selected?.id || null}
            userLocation={userLocation}
            drawRouteToSelected
            onMarkerClick={id => {
              const a = displayed.find(x => x.id === id);
              if (a) handleSelect(a);
            }}
            style={{ borderRadius: 0, height: '100%' }}
          />

          {/* Title overlay */}
          <div style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(15,23,42,0.78)', backdropFilter: 'blur(10px)', borderRadius: 12, padding: '8px 14px', color: 'white', boxShadow: '0 6px 20px rgba(15,23,42,0.25)', zIndex: 5 }}>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 0.2 }}>Conakry, Guinée</div>
            <div style={{ fontSize: 10, color: '#94a3b8' }}>Données en temps réel</div>
          </div>

          {/* Legend */}
          <div style={{ position: 'absolute', bottom: 16, right: 16, background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(10px)', borderRadius: 12, padding: '12px 14px', color: '#0f172a', boxShadow: '0 6px 20px rgba(15,23,42,0.12)', border: '1px solid rgba(15,23,42,0.06)', zIndex: 5 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: '#64748b', marginBottom: 7, letterSpacing: 1 }}>PRIORITÉ</div>
            {[
              { color: priorityColors.critical, label: 'Critique' },
              { color: priorityColors.high, label: 'Élevée' },
              { color: priorityColors.medium, label: 'Modérée' },
              { color: priorityColors.low, label: 'Faible' },
            ].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4, fontSize: 11 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: l.color, flexShrink: 0, border: '1.5px solid white', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }} />{l.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
