"use client";

interface RiskGaugeProps {
  score: number;
  severity: string;
}

export default function RiskGauge({ score, severity }: RiskGaugeProps) {
  const percentage = Math.min(Math.max(score, 0), 100);
  
  const getColors = () => {
    if (severity === 'High') return { text: 'text-red-600', fill: 'border-red-500', bg: 'bg-red-50 text-red-700 border-red-200' };
    if (severity === 'Moderate') return { text: 'text-amber-600', fill: 'border-amber-500', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
    return { text: 'text-emerald-600', fill: 'border-emerald-500', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  };

  const colors = getColors();
  
  return (
    <div className="flex flex-col items-center justify-center pt-8 pb-4">
      <div className="relative w-48 h-24 overflow-hidden">
        {/* Background Arc */}
        <div className="absolute top-0 left-0 w-48 h-48 rounded-full border-[20px] border-gray-100 box-border"></div>
        
        {/* Value Arc (Rotated) */}
        <div 
          className={`absolute top-0 left-0 w-48 h-48 rounded-full border-[20px] border-transparent border-t-current border-l-current ${colors.text} transition-transform duration-1000 ease-out box-border`}
          style={{ transform: `rotate(${ -135 + (percentage * 1.8) }deg)` }}
        ></div>
        
        {/* Inner Label */}
        <div className="absolute bottom-0 w-full flex justify-center mb-[-5px]">
          <span className={`text-4xl font-black ${colors.text}`}>{score.toFixed(1)}</span>
        </div>
      </div>
      
      <div className={`mt-8 px-4 py-1.5 rounded-full font-bold text-sm border shadow-sm ${colors.bg}`}>
        {severity.toUpperCase()} RISK
      </div>
    </div>
  );
}
