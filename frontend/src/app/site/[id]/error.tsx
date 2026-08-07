"use client";

import Link from 'next/link';

export default function Error({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-3xl font-bold text-red-600 mb-4">Analysis Failed</h2>
      <p className="text-gray-700 mb-8 max-w-md text-lg">
        We encountered an error while pinging Google Earth Engine. This coordinate might not have valid Sentinel-2 data, or the connection timed out.
      </p>
      <div className="flex gap-4">
        <button 
          onClick={() => reset()}
          className="px-6 py-2 bg-gray-900 text-white rounded-lg shadow hover:bg-gray-800 transition font-medium"
        >
          Try Again
        </button>
        <Link 
          href="/" 
          className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition font-medium"
        >
          Return to Map
        </Link>
      </div>
    </main>
  );
}
