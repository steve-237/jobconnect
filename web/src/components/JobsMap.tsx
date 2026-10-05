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

export default function JobsMap({
  jobs,
  userLat = 48.8566,
  userLng = 2.3522,
  onSelectJob,
}: JobsMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).jobconnect_open_job = (jobId: string) => {
        if (onSelectJob) {
          onSelectJob(jobId);
        } else {
          window.location.href = `/jobs/${jobId}`;
        }
      };
    }
  }, [onSelectJob]);

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;

    // Dynamically import Leaflet to prevent SSR issues
    import('leaflet').then((L) => {
      // Fix default Leaflet icon paths
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      // Initialize Map instance if not created
      if (!mapInstanceRef.current && containerRef.current) {
        const map = L.map(containerRef.current, {
          center: [userLat, userLng],
          zoom: 12,
          scrollWheelZoom: true,
        });

        // 100% Free OpenStreetMap & CartoDB tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);

        mapInstanceRef.current = map;

        // Force container layout recalculation for full visibility
        setTimeout(() => {
          map.invalidateSize();
        }, 200);
      }

      const map = mapInstanceRef.current;

      // Reset view to user coordinates if updated
      map.setView([userLat, userLng], map.getZoom() || 12);

      // Clear existing markers
      map.eachLayer((layer: any) => {
        if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
          map.removeLayer(layer);
        }
      });

      // Add User Location Pulse Marker
      L.circleMarker([userLat, userLng], {
        radius: 10,
        color: '#3b82f6',
        fillColor: '#60a5fa',
        fillOpacity: 0.9,
        weight: 3,
      })
        .addTo(map)
        .bindPopup('<b style="color:#0f172a;">📍 Votre Position GPS</b>');

      // Create bounding box for fitBounds
      const bounds = L.latLngBounds([[userLat, userLng]]);

      // Add Job Markers with Price Badges
      jobs.forEach((job) => {
        const lat = job.latitude || userLat + (Math.random() - 0.5) * 0.08;
        const lng = job.longitude || userLng + (Math.random() - 0.5) * 0.08;

        bounds.extend([lat, lng]);

        const priceText = job.price ? formatPrice(job.price) : 'Offre';
        const categoryText = job.category?.name || 'Mission';

        const customMarkerHtml = `
          <div style="
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            color: #ffffff;
            font-weight: 800;
            font-size: 11px;
            padding: 6px 12px;
            border-radius: 20px;
            border: 2px solid #ffffff;
            box-shadow: 0 6px 16px rgba(0,0,0,0.35);
            text-align: center;
            white-space: nowrap;
            cursor: pointer;
            transition: transform 0.2s ease;
          " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
            📍 ${priceText}
          </div>
        `;

        const markerIcon = L.divIcon({
          className: 'jobconnect-leaflet-marker',
          html: customMarkerHtml,
          iconSize: [84, 32],
          iconAnchor: [42, 16],
          popupAnchor: [0, -18],
        });

        const popupHtml = `
          <div style="font-family: system-ui, -apple-system, sans-serif; padding: 6px; max-width: 240px; color: #0f172a;">
            <div style="font-size: 10px; font-weight: 800; color: #2563eb; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px;">
              ${categoryText} ${job.distanceKm ? `• ${job.distanceKm.toFixed(1)} km` : ''}
            </div>
            <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 6px; line-height: 1.3;">
              ${job.title}
            </div>
            <div style="font-size: 11px; color: #64748b; margin-bottom: 10px;">
              📍 ${job.location || 'Localisation disponible'}
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; padding-top: 8px; margin-top: 4px;">
              <span style="font-size: 15px; font-weight: 800; color: #16a34a;">${priceText}</span>
              <button onclick="if(window.jobconnect_open_job) window.jobconnect_open_job('${job.id}')" style="
                background: linear-gradient(135deg, #2563eb, #1d4ed8);
                color: #ffffff;
                border: none;
                padding: 6px 14px;
                border-radius: 10px;
                font-size: 11px;
                font-weight: 700;
                cursor: pointer;
                box-shadow: 0 2px 8px rgba(37,99,235,0.3);
              ">Voir l'offre ➔</button>
            </div>
          </div>
        `;

        const marker = L.marker([lat, lng], { icon: markerIcon }).addTo(map);
        marker.bindPopup(popupHtml, { autoPan: true });

        marker.on('click', () => {
          marker.openPopup();
        });
      });

      // Fit bounds if jobs exist
      if (jobs.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      }
    });
  }, [jobs, userLat, userLng, onSelectJob]);

  return (
    <div className="relative w-full h-[520px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl z-10 bg-slate-900">
      <div ref={containerRef} className="w-full h-full min-h-[520px]" />
    </div>
  );
}
