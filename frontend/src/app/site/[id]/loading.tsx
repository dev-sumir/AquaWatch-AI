export default function Loading() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6 shadow-xl"></div>
      <h2 className="text-2xl font-bold text-gray-900">Loading Dashboard...</h2>
      <p className="text-gray-600 mt-2">Retrieving Earth Engine data</p>
    </main>
  );
}
