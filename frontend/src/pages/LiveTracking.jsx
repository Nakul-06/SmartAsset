import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

export default function LiveTracking({ equipment, sites, navigateToTab }) {
  const mapRef = useRef(null);
  const leafletMapInstance = useRef(null);
  const markersRef = useRef({}); // dict to store equipment markers: { equipmentId: marker }
  const siteMarkersRef = useRef([]); // array of site markers

  useEffect(() => {
    // 1. Initialize Map
    if (!leafletMapInstance.current && mapRef.current) {
      leafletMapInstance.current = L.map(mapRef.current, {
        center: [13.0450, 80.2200], // Centered around Chennai
        zoom: 12,
        zoomControl: true,
        attributionControl: false
      });

      // Dark Mode Tile Layer (fitting the Cat Charcoal branding!)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
      }).addTo(leafletMapInstance.current);
    }

    const map = leafletMapInstance.current;

    // 2. Render Site Boundaries / Custom Site Markers
    if (siteMarkersRef.current.length === 0 && sites.length > 0) {
      sites.forEach(site => {
        // Draw site area circle
        const siteCircle = L.circle([site.location.latitude, site.location.longitude], {
          color: '#FFCD00',
          fillColor: '#FFCD00',
          fillOpacity: 0.05,
          radius: 1200 // 1.2km radius
        }).addTo(map);

        // Custom site label
        const siteIcon = L.divIcon({
          className: 'site-label-icon',
          html: `<div class="bg-cat-card/90 border border-cat-yellow text-cat-yellow font-extrabold text-[9px] px-2 py-0.5 rounded shadow whitespace-nowrap">${site.id}</div>`,
          iconSize: [40, 20]
        });

        const labelMarker = L.marker([site.location.latitude + 0.008, site.location.longitude], { icon: siteIcon }).addTo(map);
        siteMarkersRef.current.push(siteCircle, labelMarker);
      });
    }

    // 3. Render and Update Equipment Markers
    equipment.forEach(asset => {
      if (!asset.location || !asset.location.latitude || !asset.location.longitude) return;

      const { latitude, longitude } = asset.location;
      const isLowUtil = asset.status === 'Active' && asset.utilization < 20;
      const isOverdue = asset.status === 'Active' && asset.checkOutDate && new Date(asset.checkOutDate) < new Date('2026-07-30');

      // Pick marker color
      let markerColor = '#9E9E9E'; // default unassigned (grey)
      if (asset.status === 'Active') {
        if (isOverdue) markerColor = '#EF4444'; // Red
        else if (isLowUtil) markerColor = '#F59E0B'; // Yellow/Orange
        else markerColor = '#10B981'; // Green
      }

      // Create Custom DivIcon representing the crawler/marker
      const customIcon = L.divIcon({
        className: 'custom-equipment-icon',
        html: `
          <div class="relative flex items-center justify-center">
            <span class="absolute inline-flex h-6 w-6 rounded-full opacity-35 animate-ping" style="background-color: ${markerColor}"></span>
            <div class="h-4 w-4 rounded-full border-2 border-cat-card flex items-center justify-center text-[7px] font-bold text-cat-dark" style="background-color: ${markerColor}">
            </div>
          </div>
        `,
        iconSize: [24, 24]
      });

      // Prepare Popup Content
      const popupHtml = `
        <div class="p-3 text-xs bg-cat-card text-cat-text space-y-1.5 min-w-[160px]">
          <div class="flex justify-between items-center border-b border-cat-border pb-1">
            <b class="text-cat-yellow text-sm font-extrabold">${asset.equipmentId}</b>
            <span class="text-[9px] uppercase font-bold px-1.5 py-0.2 bg-cat-dark rounded">${asset.type}</span>
          </div>
          <div class="space-y-0.5">
            <p><b>Status:</b> ${asset.status === 'Active' ? (isOverdue ? '⚠️ Overdue' : isLowUtil ? '⚠️ Low Usage' : '🟢 Active') : '⚪ Unassigned'}</p>
            <p><b>Site:</b> ${asset.siteId ? `Site ${asset.siteId}` : 'None'}</p>
            <p><b>Operator:</b> ${asset.operatorId || 'None'}</p>
            <p><b>Utilization:</b> <span class="font-bold ${isLowUtil ? 'text-amber-500' : 'text-emerald-400'}">${asset.utilization}%</span></p>
            <p><b>Idle Time:</b> ${asset.idleHoursPerDay.toFixed(1)} hrs/day</p>
            <p><b>Fuel Level:</b> ${Math.round(asset.fuelLevel)}%</p>
          </div>
          <button 
            id="btn-${asset.equipmentId}" 
            class="w-full mt-2 bg-cat-yellow hover:bg-yellow-500 text-cat-dark font-extrabold text-[10px] py-1 rounded transition-colors"
          >
            Open Details
          </button>
        </div>
      `;

      // If marker already exists, update position & popup content
      if (markersRef.current[asset.equipmentId]) {
        const marker = markersRef.current[asset.equipmentId];
        marker.setLatLng([latitude, longitude]);
        
        // Only bind popup if it's not open to avoid closing active popups on update
        if (!marker.isPopupOpen()) {
          marker.setPopupContent(popupHtml);
        }
      } else {
        // Create new marker
        const marker = L.marker([latitude, longitude], { icon: customIcon })
          .addTo(map)
          .bindPopup(popupHtml, {
            className: 'custom-map-popup',
            closeButton: false,
            minWidth: 180
          });

        // Set up click handler in popup
        marker.on('popupopen', () => {
          const btn = document.getElementById(`btn-${asset.equipmentId}`);
          if (btn) {
            btn.onclick = () => {
              map.closePopup();
              navigateToTab('equipment', asset.equipmentId);
            };
          }
        });

        markersRef.current[asset.equipmentId] = marker;
      }
    });

  }, [equipment, sites]);

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Legend Header */}
      <div className="bg-cat-card border border-cat-border p-4 rounded-xl flex flex-wrap gap-6 items-center justify-between">
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
            <span className="text-cat-text">Active & Efficient (&ge; 20% Util)</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
            <span className="text-cat-text">Under-utilized (&lt; 20% Util)</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="w-3 h-3 rounded-full bg-red-500 inline-block animate-pulse"></span>
            <span className="text-cat-text">Rental Overdue</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="w-3 h-3 rounded-full bg-gray-500 inline-block"></span>
            <span className="text-cat-text">Unassigned Fleet</span>
          </div>
        </div>

        <div className="text-xs text-cat-gray font-medium">
          💡 Markers represent GPS tracking nodes. Positions drift slightly in real-time.
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 min-h-[450px] relative border border-cat-border rounded-xl overflow-hidden shadow-inner">
        <div ref={mapRef} className="absolute inset-0 z-10" />
      </div>
    </div>
  );
}
