// api/fd.js — Proxy para Football-Data.org
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Auth-Token");
  if (req.method === "OPTIONS") return res.status(204).end();

  const { endpoint } = req.query;
  if (!endpoint) return res.status(400).json({ error: "Parâmetro 'endpoint' obrigatório" });

  const authToken = req.headers["x-auth-token"];
  if (!authToken) return res.status(401).json({ error: "Header X-Auth-Token obrigatório" });

  try {
    const response = await fetch(`https://api.football-data.org/v4/${endpoint}`, {
      headers: { "X-Auth-Token": authToken, "User-Agent": "BetAnalytics/1.0" },
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate");
    return res.status(200).json(data);
  } catch (error) {
    return res.status(502).json({ error: "Erro Football-Data.org: " + error.message });
  }
}
