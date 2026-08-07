import { fetchSites } from '@/lib/api';
import SiteListSidebar from '@/components/SiteListSidebar';
import MapView from '@/components/MapView';

export default async function Home() {
  const sites = await fetchSites();

  return (
    <main className="flex h-screen w-screen overflow-hidden bg-gray-50">
      {/* Left Sidebar (30% width) */}
      <div className="w-full md:w-[400px] lg:w-[450px] h-full z-10 shadow-2xl relative shrink-0">
        <SiteListSidebar sites={sites} />
      </div>
      
      {/* Right Map Area (Remaining width) */}
      <div className="flex-1 h-full relative z-0">
        <MapView sites={sites} />
      </div>
    </main>
  );
}
