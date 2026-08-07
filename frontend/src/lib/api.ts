const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

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
