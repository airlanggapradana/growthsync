export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(455).json({ error: 'Method Not Allowed' });
  }

  try {
    const { regencyId } = req.query;
    if (!regencyId) {
      return res.status(400).json({ error: 'Missing required parameter: regencyId' });
    }

    const response = await fetch(`https://wilayah.id/api/districts/${regencyId}.json`);
    if (!response.ok) throw new Error("Failed to fetch districts");
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching districts:', error);
    res.status(500).json({ error: "Failed to fetch districts" });
  }
}
