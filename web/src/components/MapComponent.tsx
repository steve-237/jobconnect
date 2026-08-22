'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const CITY_COORDINATES: Record<string, [number, number]> = {
  paris: [48.8566, 2.3522],
  lyon: [45.764, 4.8357],
  marseille: [43.2965, 5.3698],
  toulouse: [43.6047, 1.4442],
  nice: [43.7102, 7.262],
  nantes: [47.2184, -1.5536],
  strasbourg: [48.5734, 7.7521],
  montpellier: [43.6108, 3.8767],
  bordeaux: [44.8378, -0.5792],
  lille: [50.6292, 3.0573],
  rennes: [48.1173, -1.6778],
};

function getCoordsForJob(job: any): [number, number] {
  if (job.latitude && job.longitude && !isNaN(Number(job.latitude)) && !isNaN(Number(job.longitude))) {
    return [Number(job.latitude), Number(job.longitude)];
  }
  if (job.location) {
    const locLower = job.location.toLowerCase();
    for (const [city, coords] of Object.entries(CITY_COORDINATES)) {
      if (locLower.includes(city)) {
        return coords;
      }
    }
  }
  return [48.8566, 2.3522];
}

export default function MapComponent({ jobs }: { jobs: any[] }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full h-[600px] rounded-3xl glass border border-white/10 flex items-center justify-center text-muted-foreground text-sm font-semibold">
        Chargement de la carte interactive...
      </div>
    );
  }

  const defaultCenter = [46.603354, 1.888334] as [number, number];

  return (
    <div className="w-full h-[600px] rounded-3xl overflow-hidden glass border border-white/10 shadow-2xl relative z-10">
      <MapContainer
        center={defaultCenter}
        zoom={6}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%', zIndex: 1 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {jobs.map((job) => {
          const coords = getCoordsForJob(job);
          return (
            <Marker key={job.id} position={coords}>
              <Popup>
                <div className="text-black font-sans p-1">
                  <h3 className="font-bold text-sm mb-1">{job.title}</h3>
                  <p className="font-extrabold text-emerald-600 text-sm mb-1">{job.price} €</p>
                  <p className="text-xs text-gray-600 mb-2">📍 {job.location || 'Sur place'}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
