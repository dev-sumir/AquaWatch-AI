import MapView from '@/components/MapView';

export default function Home() {
  // We explicitly load the 3 hackathon demo sites as default map markers.
  const sites = [
    {
      id: "dynamic?lat=28.5670&lon=77.2986", // We use the dynamic route for these pre-defined sites too!
      name: "Yamuna River (Okhla)",
      latitude: 28.567001,
      longitude: 77.298610
    },
    {
      id: "dynamic?lat=26.4717&lon=80.3729",
      name: "Ganges River at Kanpur",
      latitude: 26.471761,
      longitude: 80.372923
    },
    {
      id: "dynamic?lat=31.0174&lon=76.5370",
      name: "Ropar Wetland (Control)",
      latitude: 31.017402,
      longitude: 76.537030
    }
  ];

  return (
    <main className="flex h-screen w-screen overflow-hidden bg-gray-50">
      {/* Full-screen Interactive Map Area */}
      <div className="flex-1 h-full relative z-0">
        
        {/* Helper overlay to explain the new interaction */}
        <div className="absolute top-6 left-12 z-10 bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-gray-200 max-w-md pointer-events-auto">
          <h1 className="text-2xl font-bold text-blue-900 mb-2">AquaWatch AI</h1>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Dynamic Risk Engine</h2>
          <p className="text-sm text-gray-700">
            Welcome to the live dynamic pipeline. We have pinned <b>3 pre-selected demonstration sites</b> on the map for the hackathon showcase.
          </p>
          <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
            <p className="text-sm text-blue-800 font-medium">
              ✨ <b>Interactive Mode</b>: Click any of the pins, or click <b>anywhere else on the map</b> (rivers, lakes, wetlands) to ping Google Earth Engine and generate an on-the-fly pollution anomaly analysis for that exact coordinate.
            </p>
          </div>
          <div className="mt-3 flex gap-2">
            <a href="/records" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
              📊 Monitoring Records Dashboard
            </a>
          </div>
        </div>

        <MapView sites={sites} />
      </div>
    </main>
  );
}
