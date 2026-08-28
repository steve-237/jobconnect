'use client';

import { useEffect, useRef } from 'react';
import { formatPrice } from '@/lib/currency';

interface JobMapItem {
  id: string;
  title: string;
  price?: number;
  location?: string;
  latitude?: number | null;
  longitude?: number | null;
  category?: { name: string } | null;
  distanceKm?: number;
}

interface JobsMapProps {
  jobs: JobMapItem[];
  userLat?: number;
  userLng?: number;
  onSelectJob?: (jobId: string) => void;
}

export default function JobsMap({ jobs, userLat = 48.8566, userLng = 2.3522, onSelectJob }: JobsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;

    // Dynamically import Leaflet to prevent SSR window reference issues
    import('leaflet').then((L) => {
      // Fix default marker icon assets
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (!leafletMapRef.current) {
        // Initialize Map centered at user location or Paris default
        const map = L.map(mapRef.current).setView([userLat, userLng], 6);

        // Dark-themed CartoDB map tile layer
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
          maxZoom: 19,
        }).addTo(map);

        leafletMapRef.current = map;
      }

      const map = leafletMapRef.current;

      // Clear existing markers
      map.eachLayer((layer: any) => {
        if (layer instanceof L.Marker) {
          map.removeLayer(layer);
        }
      });

      // Add User Location Marker (Blue Pulsing Circle)
      L.circleMarker([userLat, userLng], {
        radius: 9,
        color: '#3b82f6',
        fillColor: '#60a5fa',
        fillOpacity: 0.8,
      }).addTo(map).bindPopup('<b>📍 Votre Position Actuelle</b>');

      // Add Job Markers
      const bounds = L.latLngBounds([[userLat, userLng]]);

      jobs.forEach((job) => {
        const lat = job.latitude || (userLat + (Math.random() - 0.5) * 0.4);
        const lng = job.longitude || (userLng + (Math.random() - 0.5) * 0.4);

        bounds.extend([lat, lng]);

        const customHtml = `
          <div style="background:#1e1e2d; color:#fff; padding:10px 14px; border-radius:14px; border:1px solid rgba(255,255,255,0.15); box-shadow:0 10px 25px rgba(0,0,0,0.5); font-family:sans-serif; min-width:180px;">
            <div style="font-size:11px; font-weight:800; color:#38bdf8; text-transform:uppercase; margin-bottom:2px;">
              ${job.category?.name || 'Mission'} ${job.distanceKm ? `• ${job.distanceKm.toFixed(1)} km` : ''}
            </div>
            <div style="font-size:13px; font-weight:bold; line-height:1.3; margin-bottom:6px;">${job.title}</div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;">
              <span style="font-size:15px; font-weight:900; color:#4ade80;">${job.price ? formatPrice(job.price) : ''}</span>
              <a href="/jobs/${job.id}" style="background:#6366f1; color:#fff; text-decoration:none; padding:4px 10px; border-radius:8px; font-size:11px; font-weight:bold;">Voir</a>
            </div>
          </div>
        `;

        const markerIcon = L.divIcon({
          className: 'custom-leaflet-marker',
          html: `<div style="background:#6366f1; color:#fff; font-weight:bold; font-size:11px; padding:4px 8px; border-radius:12px; border:2px solid #fff; box-shadow:0 4px 12px rgba(0,0,0,0.4); text-align:center; white-space:nowrap;">📍 ${job.price ? formatPrice(job.price) : 'Job'}</div>`,
          iconSize: [60, 30],
          iconAnchor: [30, 15],
        });

        const marker = L.marker([lat, lng], { icon: markerIcon }).addTo(map);
        marker.bindPopup(customHtml);
      });

      if (jobs.length > 0) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
      }
    });

    return () => {
      // Map cleanup if component unmounts
    };
  }, [jobs, userLat, userLng]);

  return (
    <div className="relative w-full h-[520px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl z-10">
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}
