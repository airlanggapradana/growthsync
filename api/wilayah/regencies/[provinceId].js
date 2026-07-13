export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(455).json({ error: 'Method Not Allowed' });
  }

  try {
    const { provinceId } = req.query;
    if (!provinceId) {
      return res.status(400).json({ error: 'Missing required parameter: provinceId' });
    }

    const response = await fetch(`https://wilayah.id/api/regencies/${provinceId}.json`);
    if (!response.ok) throw new Error("Failed to fetch regencies");
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching regencies:', error);
    res.status(500).json({ error: "Failed to fetch regencies" });
  }
}
