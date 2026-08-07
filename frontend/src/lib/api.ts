const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export async function fetchSites() {
  try {
    const res = await fetch(`${API_URL}/sites`, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to fetch sites");
    return res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function fetchSiteDetails(id: number) {
  const res = await fetch(`${API_URL}/sites/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch site details");
  return res.json();
}

export async function analyzeCoordinate(lat: number, lon: number) {
  const res = await fetch(`${API_URL}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lat, lon }),
    cache: 'no-store'
  });
  if (!res.ok) throw new Error("Failed to dynamically analyze site");
  return res.json();
}
