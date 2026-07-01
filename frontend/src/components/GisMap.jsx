import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/**
 * GisMap (OpenStreetMap Leaflet Integration)
 * Renders a full interactive geographic GIS twin map using Leaflet.
 * No API key required. Styled with a custom dark-mode tile filter.
 */
export default function GisMap({ locations, selectedLocation, onSelectLocation }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  const getStatusColor = (color) => {
    switch (color) {
      case 'green': return '#10B981';   // Safe / Good
      case 'yellow': return '#F59E0B';  // Moderate
      case 'orange': return '#F97316';  // High
      case 'red': return '#EF4444';     // Critical
      default: return '#6B7280';
    }
  };

  const createCustomIcon = (loc, isSelected) => {
    const color = getStatusColor(loc.aqi_color);
    const isOffline = loc.sensor_status === 'OFFLINE';
    const markerColor = isOffline ? '#6B7280' : color;
    
    return L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div style="
          position: relative;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <!-- Outer Pulsing Glow -->
          <div style="
            position: absolute;
            width: ${isSelected ? '28px' : '18px'};
            height: ${isSelected ? '28px' : '18px'};
            border-radius: 50%;
            background-color: ${markerColor};
            opacity: 0.35;
            animation: leafletPulse 2s infinite ease-in-out;
          "></div>
          <!-- Inner solid dot -->
          <div style="
            position: absolute;
            width: ${isSelected ? '12px' : '8px'};
            height: ${isSelected ? '12px' : '8px'};
            border-radius: 50%;
            background-color: ${markerColor};
            border: 2px solid #0F172A;
            box-shadow: 0 0 10px ${markerColor};
            transition: all 0.3s;
          "></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -10]
    });
  };

  // 1. Initialize Map once
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Center map around Bangalore Metropolitan Coordinates
    const map = L.map(mapContainerRef.current, {
      center: [12.9716, 77.5946],
      zoom: 11,
      zoomControl: true,
      attributionControl: false
    });

    // Load standard OSM tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // 2. Redraw markers on locations or selection updates
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    locations.forEach(loc => {
      if (!loc.latitude || !loc.longitude) return;

      const isSelected = selectedLocation.toLowerCase() === loc.name.toLowerCase();
      const icon = createCustomIcon(loc, isSelected);

      const marker = L.marker([loc.latitude, loc.longitude], { icon })
        .addTo(mapRef.current);

      // Custom themed dark popup
      const popupContent = `
        <div style="
          color: #fff;
          background-color: #1E293B;
          border: 1px solid #334155;
          padding: 8px 12px;
          border-radius: 8px;
          font-family: system-ui, -apple-system, sans-serif;
          min-width: 160px;
        ">
          <div style="font-weight: 700; font-size: 13px; color: #38BDF8; margin-bottom: 4px; display: flex; justify-content: space-between; align-items: center;">
            <span>${loc.name}</span>
            <span style="font-size: 9px; padding: 2px 6px; border-radius: 4px; background: ${loc.sensor_status === 'ONLINE' ? '#064E3B' : '#7F1D1D'}; color: ${loc.sensor_status === 'ONLINE' ? '#34D399' : '#F87171'}">
              ${loc.sensor_status}
            </span>
          </div>
          <div style="font-size: 11px; display: flex; flex-direction: column; gap: 4px; color: #94A3B8;">
            <div>Sector Type: <span style="font-weight: 600; color: #F1F5F9;">${loc.sector_type || 'N/A'}</span></div>
            <div>Air AQI: <span style="font-weight: 700; color: ${getStatusColor(loc.aqi_color)};">${loc.current_aqi} (${loc.aqi_category || 'Moderate'})</span></div>
            <div>Water Quality: <span style="font-weight: 700; color: ${loc.water_status === 'SAFE' ? '#10B981' : '#EF4444'};">${loc.current_wqi ? loc.current_wqi + ' WQI' : 'N/A'} (${loc.water_status || 'SAFE'})</span></div>
            <div>Diagnostics: <span style="font-weight: 600; color: #F1F5F9;">🔋 ${loc.battery || 100}% | 📶 ${loc.signal || 100}%</span></div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        closeButton: false,
        className: 'custom-leaflet-popup'
      });

      marker.on('click', () => {
        onSelectLocation(loc.name);
      });

      if (isSelected) {
        // Focus map and open popup
        mapRef.current.setView([loc.latitude, loc.longitude], 12, { animate: true });
        marker.openPopup();
      }

      markersRef.current.push(marker);
    });
  }, [locations, selectedLocation]);

  return (
    <div style={{
      backgroundColor: '#1E293B',
      border: '1px solid #334155',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      height: '520px',
      position: 'relative',
    }}>
      {/* Map Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '16px', fontWeight: '700', letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#38BDF8', boxShadow: '0 0 8px #38BDF8' }} />
            Geospatial Digital Twin (OpenStreetMap GIS Grid)
          </div>
          <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>
            Active geographic telemetry monitoring. Click status markers to query sensor node data
          </div>
        </div>
      </div>

      {/* Map Canvas Container */}
      <div 
        ref={mapContainerRef} 
        className="dark-leaflet-map"
        style={{
          flex: 1,
          borderRadius: '8px',
          border: '1px solid #334155',
          overflow: 'hidden',
          zIndex: 1
        }} 
      />

      {/* Styled custom keyframes & Leaflet dark overrides */}
      <style>{`
        @keyframes leafletPulse {
          0% { transform: scale(0.7); opacity: 0.8; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        /* Premium dark tile filters to style standard OpenStreetMap tiles */
        .dark-leaflet-map .leaflet-tile {
          filter: invert(100%) hue-rotate(180deg) brightness(85%) contrast(90%);
        }
        .dark-leaflet-map {
          background-color: #0F172A !important;
        }
        /* Custom Leaflet popup overrides */
        .custom-leaflet-popup .leaflet-popup-content-wrapper {
          background: #1E293B !important;
          color: #fff !important;
          border: 1px solid #334155 !important;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4) !important;
          border-radius: 8px !important;
          padding: 0 !important;
        }
        .custom-leaflet-popup .leaflet-popup-content {
          margin: 0 !important;
        }
        .custom-leaflet-popup .leaflet-popup-tip {
          background: #1E293B !important;
          border: 1px solid #334155 !important;
        }
      `}</style>
    </div>
  );
}
