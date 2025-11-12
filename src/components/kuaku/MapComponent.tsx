'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// @ts-ignore - Leaflet types compatibility
import type { Map as LeafletMap, Marker } from 'leaflet';

// Fix Leaflet icon issue with bundlers
if (typeof window !== 'undefined') {
  const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
  const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
  const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl,
    iconUrl,
    shadowUrl,
  });
}

interface MapComponentProps {
  latitude: number;
  longitude: number;
  alamat?: string;
  onMapClick?: (latitude: number, longitude: number) => void;
  onMarkerDrag?: (latitude: number, longitude: number) => void;
  draggableMarker?: boolean;
}

export const MapComponent: React.FC<MapComponentProps> = ({
  latitude,
  longitude,
  alamat = 'Lokasi Pernikahan',
  onMapClick,
  onMarkerDrag,
  draggableMarker = true,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const marker = useRef<Marker | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map only once
    if (!map.current) {
      map.current = L.map(mapContainer.current).setView([latitude, longitude], 16);

      // Add OpenStreetMap tiles (100% FREE)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map.current);

      // Handle map clicks for location selection
      if (onMapClick) {
        map.current.on('click', (event: L.LeafletMouseEvent) => {
          const { lat, lng } = event.latlng;
          onMapClick(lat, lng);
        });
      }
    } else {
      // Update map view if coordinates change
      map.current.setView([latitude, longitude], 16);
    }

    // Remove existing marker if any
    if (marker.current) {
      marker.current.remove();
    }

    // Add or update marker (draggable)
    marker.current = L.marker([latitude, longitude], {
      title: alamat,
      draggable: draggableMarker,
    })
      .addTo(map.current)
      .bindPopup(
        `<div class="text-sm font-medium">${alamat}</div><div class="text-xs text-gray-600 mt-1">Lat: ${latitude.toFixed(6)}<br/>Lon: ${longitude.toFixed(6)}<br/><em class="text-yellow-600">💡 Geser marker untuk mengatur posisi</em></div>`
      );

    // Open popup on marker
    if (marker.current) {
      marker.current.openPopup();
    }

    // Handle marker drag
    if (draggableMarker && marker.current) {
      marker.current.on('dragend', (event: L.DragEndEvent) => {
        const pos = event.target.getLatLng();
        const newLat = pos.lat;
        const newLon = pos.lng;

        console.log('📍 Marker dragged to:', newLat, newLon);

        // Update popup with new coordinates
        marker.current?.setPopupContent(
          `<div class="text-sm font-medium">${alamat}</div><div class="text-xs text-gray-600 mt-1">Lat: ${newLat.toFixed(6)}<br/>Lon: ${newLon.toFixed(6)}<br/><em class="text-yellow-600">✅ Posisi diperbarui</em></div>`
        );

        // Trigger callback if provided
        if (onMarkerDrag) {
          onMarkerDrag(newLat, newLon);
        }
      });
    }

    return () => {
      // Cleanup
      if (marker.current) {
        marker.current.remove();
      }
    };
  }, [latitude, longitude, alamat, onMapClick, onMarkerDrag, draggableMarker]);

  return (
    <div
      ref={mapContainer}
      className="w-full rounded-lg border border-input overflow-hidden"
      style={{ height: '400px', minHeight: '400px' }}
    />
  );
};

export default MapComponent;
