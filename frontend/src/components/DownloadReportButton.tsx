"use client";

export default function DownloadReportButton({ siteId }: { siteId: string | number }) {
  return (
    <button 
      onClick={() => window.print()}
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow transition whitespace-nowrap print:hidden"
    >
      Download Report (PDF)
    </button>
  );
}
