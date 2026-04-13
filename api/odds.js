// api/odds.js — Proxy para The Odds API
module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();

  const { endpoint, apiKey, ...rest } = req.query;
  if (!endpoint || !apiKey) return res.status(400).json({ error: "Parâmetros 'endpoint' e 'apiKey' obrigatórios" });

  const params = new URLSearchParams({ ...rest, apiKey });
  try {
    const response = await fetch(`https://api.the-odds-api.com/v4/${endpoint}?${params}`, {
      headers: { "User-Agent": "BetAnalytics/1.0" },
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate");
    return res.status(200).json(data);
  } catch (error) {
    return res.status(502).json({ error: "Erro Odds API: " + error.message });
  }
};
