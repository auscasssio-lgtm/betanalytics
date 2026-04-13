module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();

  const { endpoint, apiKey, ...rest } = req.query;
  if (!endpoint || !apiKey) return res.status(400).json({ error: "endpoint e apiKey obrigatorios" });

  const params = new URLSearchParams({ ...rest, apiKey });
  const url = `https://api.the-odds-api.com/v4/${endpoint}?${params}`;
  const upstream = await fetch(url);
  const data = await upstream.json();
  res.setHeader("Cache-Control", "s-maxage=300");
  return res.status(upstream.status).json(data);
};
