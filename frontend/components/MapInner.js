'use client';
import { useMemo, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const STATUS_COLORS = {
    'Open': '#3B82F6',
    'In Progress': '#F59E0B',
    'Resolved': '#10B981',
    'Closed': '#6B7280',
};

// SVG icons for Leaflet markers
function createCustomIcon(color) {
    if (typeof window === 'undefined') return null;
    const L = require('leaflet');
    return new L.DivIcon({
        className: 'custom-div-icon',
        html: `<div style='background-color:${color};width:16px;height:16px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 8px ${color}'></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
    });
}

function RecenterControl({ center }) {
    const map = useMap();
    return (
        <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 500 }}>
            <button
                onClick={() => map.flyTo(center, 13, { animate: true })}
                style={{
                    background: 'rgba(6,5,10,0.8)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid var(--border-0)',
                    borderRadius: 8,
                    padding: '8px 12px',
                    color: 'var(--amber)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--amber)'; e.currentTarget.style.background = 'rgba(6,5,10,0.9)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-0)'; e.currentTarget.style.background = 'rgba(6,5,10,0.8)'; }}
            >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 2 12 6"></polyline><polyline points="12 18 12 22"></polyline><polyline points="2 12 6 12"></polyline><polyline points="18 12 22 12"></polyline></svg>
                Recenter
            </button>
        </div>
    );
}

export default function MapInner({ complaints }) {
    const [theme, setTheme] = useState('dark');

    useEffect(() => {
        if (typeof document !== 'undefined') {
            const getTheme = () => document.documentElement.getAttribute('data-theme') || 'dark';
            setTheme(getTheme());
            const observer = new MutationObserver(() => setTheme(getTheme()));
            observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
            return () => observer.disconnect();
        }
    }, []);

    const markers = useMemo(() => {
        return complaints.filter(c => c.location && c.location.lat && c.location.lng).map(c => ({
            ...c,
            iconColor: STATUS_COLORS[c.status] || '#ccc'
        }));
    }, [complaints]);

    const defaultCenter = markers.length > 0
        ? [markers[0].location.lat, markers[0].location.lng]
        : [28.6139, 77.2090];

    return (
        <div className="card" style={{ height: 400, overflow: 'hidden', position: 'relative', marginBottom: 24, padding: 0, zIndex: 0 }}>
            <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 500, background: 'rgba(6,5,10,0.8)', backdropFilter: 'blur(8px)', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-0)' }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--amber)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>// ISSUE HEATMAP</p>
            </div>

            <style>{`
            .leaflet-container { z-index: 10 !important; font-family: var(--font-mono) !important; background: var(--bg-1) !important; }
            .leaflet-popup-content-wrapper { background: var(--bg-1) !important; border: 1px solid var(--border-0) !important; color: var(--text-0) !important; border-radius: 8px !important; }
            .leaflet-popup-tip { background: var(--bg-1) !important; border: 1px solid var(--border-0) !important; }
            .leaflet-control-zoom { border: none !important; box-shadow: 0 4px 12px rgba(0,0,0,0.2) !important; border-radius: 8px !important; overflow: hidden !important; }
            .leaflet-control-zoom a { background: var(--bg-1) !important; color: var(--text-0) !important; border-color: var(--border-0) !important; }

            html[data-theme='light'] .leaflet-popup-content-wrapper { background: rgba(255, 255, 255, 0.95) !important; border-color: var(--border-1) !important; color: #1a1a1a !important; box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important; }
            html[data-theme='light'] .leaflet-popup-tip { background: rgba(255, 255, 255, 0.95) !important; border-color: var(--border-1) !important; }
            html[data-theme='light'] .leaflet-control-zoom a { background: rgba(255, 255, 255, 0.9) !important; color: #1a1a1a !important; border-color: var(--border-1) !important; }
            html[data-theme='light'] .leaflet-popup-content span { color: var(--text-3) !important; }
          `}</style>

            <MapContainer center={defaultCenter} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    key={theme}
                    url={theme === 'light'
                        ? "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                        : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"}
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />

                <RecenterControl center={defaultCenter} />

                {markers.map((c) => (
                    <Marker
                        key={c._id}
                        position={[c.location.lat, c.location.lng]}
                        icon={createCustomIcon(c.iconColor)}
                    >
                        <Popup>
                            <div style={{ padding: '4px', minWidth: 160 }}>
                                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--amber)', marginBottom: 2 }}>{c.complaintId}</p>
                                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-0)', marginBottom: 4 }}>{c.title}</p>
                                <span style={{ fontSize: 10, color: 'var(--text-2)', display: 'block', marginBottom: 8 }}>{c.location.ward}</span>
                                <span className={`badge ${c.status === 'Open' ? 'status-open' : c.status === 'In Progress' ? 'status-progress' : c.status === 'Resolved' ? 'status-resolved' : 'status-closed'}`} style={{ display: 'inline-block' }}>{c.status}</span>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
