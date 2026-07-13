export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(455).json({ error: 'Method Not Allowed' });
  }

  try {
    const response = await fetch("https://wilayah.id/api/provinces.json");
    if (!response.ok) throw new Error("Failed to fetch provinces");
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching provinces:', error);
    res.status(500).json({ error: "Failed to fetch provinces" });
  }
}
