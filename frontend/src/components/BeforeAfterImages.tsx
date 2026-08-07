"use client";
import { useState } from 'react';

export default function BeforeAfterImages({ beforeUrl, afterUrl }: { beforeUrl: string, afterUrl: string }) {
  const backendBase = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api").replace('/api', '');
  
  const getFullUrl = (url: string) => url.startsWith('http') ? url : `${backendBase}${url}`;
  
  const [sliderPosition, setSliderPosition] = useState(50);

  return (
    <div className="relative w-full h-full min-h-[300px] md:min-h-[400px] rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shadow-[inset_0_2px_10px_rgba(0,0,0,0.1)] group select-none">
      
      {/* Background Image (Before - 2025) */}
      <img 
        src={getFullUrl(beforeUrl)} 
        alt="Baseline Satellite" 
        className="absolute inset-0 object-cover w-full h-full pointer-events-none" 
      />
      
      {/* Background Label */}
      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white px-3 py-1 text-sm font-semibold rounded-md shadow-sm border border-white/20 z-0">
        Baseline (2025)
      </div>

      {/* Foreground Image (After - 2026) with Clip-Path */}
      <div 
        className="absolute inset-0 overflow-hidden pointer-events-none z-10"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img 
          src={getFullUrl(afterUrl)} 
          alt="Present Satellite" 
          className="absolute inset-0 object-cover w-full h-full pointer-events-none"
        />
        
        {/* Foreground Label (Clipped along with image) */}
        <div className="absolute top-4 left-4 bg-blue-600/90 backdrop-blur-md text-white px-3 py-1 text-sm font-semibold rounded-md shadow-sm border border-blue-400/50">
          Latest (2026)
        </div>
      </div>
      
      {/* Slider Input */}
      <input
        type="range"
        min="0"
        max="100"
        value={sliderPosition}
        onChange={(e) => setSliderPosition(Number(e.target.value))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
      />

      {/* Slider Visual Handle */}
      <div 
        className="absolute inset-y-0 w-1 bg-white shadow-[0_0_15px_rgba(0,0,0,0.8)] pointer-events-none z-20 transition-all duration-75"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-xl border border-gray-200 flex items-center justify-center">
           <div className="flex gap-1">
             <div className="w-0.5 h-3 bg-gray-400 rounded-full" />
             <div className="w-0.5 h-3 bg-gray-400 rounded-full" />
           </div>
        </div>
      </div>
    </div>
  );
}
