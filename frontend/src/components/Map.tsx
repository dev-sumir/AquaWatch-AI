"use client";

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useRouter } from 'next/navigation';

// Fix for default marker icons in Next.js
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function Map({ sites }: { sites: any[] }) {
  const router = useRouter();

  // If no sites, default center to Punjab
  const center = sites.length > 0 ? [sites[0].latitude, sites[0].longitude] : [31.0, 75.8];

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <MapContainer center={center as any} zoom={9} style={{ height: '100%', width: '100%', zIndex: 0 }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        {sites.map(site => (
          <Marker 
            key={site.id} 
            position={[site.latitude, site.longitude]} 
            icon={customIcon}
            eventHandlers={{
              click: () => {
                router.push(`/site/${site.id}`);
              }
            }}
          >
            <Popup>
              <strong className="text-gray-900">{site.name}</strong><br/>
              <span className="text-gray-600">Score: {site.anomaly_score?.score ?? 'N/A'}</span><br/>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
