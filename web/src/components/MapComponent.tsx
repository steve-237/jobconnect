'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import L from 'leaflet';

// Fix for default marker icon in leaflet with webpack/nextjs
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

export default function MapComponent({ jobs }: { jobs: any[] }) {
  useEffect(() => {
    // Override default icon since Next.js doesn't handle Leaflet assets natively out of the box
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: iconRetinaUrl,
      iconUrl: iconUrl,
      shadowUrl: shadowUrl,
    });
  }, []);

  // Center of France roughly
  const defaultCenter = [46.603354, 1.888334] as [number, number];

  return (
    <div className="w-full h-[600px] rounded-xl overflow-hidden glass border border-white/10 shadow-xl">
      <MapContainer 
        center={defaultCenter} 
        zoom={5} 
        style={{ height: '100%', width: '100%', zIndex: 1 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        {jobs.filter(j => j.latitude && j.longitude).map(job => (
          <Marker key={job.id} position={[job.latitude, job.longitude]}>
            <Popup>
              <div className="text-black font-sans">
                <h3 className="font-bold text-lg">{job.title}</h3>
                <p className="font-semibold text-blue-600 text-lg mb-1">{job.price}€</p>
                <p className="text-sm text-gray-600 mb-2">{job.location}</p>
                <a href={`#`} className="text-sm font-semibold text-blue-500 hover:underline">
                  Voir la mission
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
