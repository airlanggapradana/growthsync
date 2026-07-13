export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(455).json({ error: 'Method Not Allowed' });
  }

  try {
    const { districtId } = req.query;
    if (!districtId) {
      return res.status(400).json({ error: 'Missing required parameter: districtId' });
    }

    const response = await fetch(`https://wilayah.id/api/villages/${districtId}.json`);
    if (!response.ok) throw new Error("Failed to fetch villages");
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching villages:', error);
    res.status(500).json({ error: "Failed to fetch villages" });
  }
}
