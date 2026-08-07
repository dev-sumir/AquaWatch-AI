"use client";

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useRouter } from 'next/navigation';

const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const analyzingIcon = new L.DivIcon({
  className: 'custom-div-icon',
  html: `<div class="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin shadow-lg"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function MapClickHandler({ setTempMarker, setIsAnalyzing }: { setTempMarker: any, setIsAnalyzing: any }) {
  const router = useRouter();
  useMapEvents({
    click(e) {
      setTempMarker([e.latlng.lat, e.latlng.lng]);
      setIsAnalyzing(true);
      router.push(`/site/dynamic?lat=${e.latlng.lat}&lon=${e.latlng.lng}`);
    }
  });
  return null;
}

export default function Map({ sites }: { sites: any[] }) {
  const router = useRouter();
  const [tempMarker, setTempMarker] = useState<[number, number] | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // If navigating back, reset analyzing state
  useEffect(() => {
    setIsAnalyzing(false);
    setTempMarker(null);
  }, [sites]);

  const center = sites.length > 0 ? [sites[0].latitude, sites[0].longitude] : [26.47, 80.37];

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      
      {isAnalyzing && (
        <div className="absolute inset-0 z-50 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center transition-all duration-300">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6 shadow-xl"></div>
          <h2 className="text-2xl font-bold text-gray-900 drop-shadow-sm">Analyzing Coordinate...</h2>
          <p className="text-gray-700 mt-3 font-medium bg-white/80 px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            Pinging Google Earth Engine (This takes ~5-15 seconds)
          </p>
        </div>
      )}

      <MapContainer center={center as any} zoom={9} style={{ height: '100%', width: '100%', zIndex: 0 }}>
        <TileLayer
          attribution='&copy; <a href="https://maps.google.com">Google Maps</a>'
          url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
        />
        
        <MapClickHandler setTempMarker={setTempMarker} setIsAnalyzing={setIsAnalyzing} />
        
        {tempMarker && (
           <Marker position={tempMarker} icon={analyzingIcon} />
        )}

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
