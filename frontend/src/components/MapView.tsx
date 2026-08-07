"use client";
import dynamic from 'next/dynamic';

const Map = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-500 font-medium">Initializing Map Data...</div>
});

export default function MapView({ sites }: { sites: any[] }) {
  return <Map sites={sites} />;
}
