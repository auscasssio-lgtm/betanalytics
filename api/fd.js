module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Auth-Token");
  if (req.method === "OPTIONS") return res.status(204).end();

  const key = req.headers["x-auth-token"];
  if (!key) return res.status(401).json({ error: "X-Auth-Token obrigatorio" });

  // Reconstrói o endpoint completo a partir da URL raw
  // Ex: /api/fd?endpoint=competitions/BSA/matches&dateFrom=2026-04-13&dateTo=2026-04-13
  // req.query.endpoint = "competitions/BSA/matches"
  // Parâmetros extras (dateFrom, dateTo, etc.) são passados separados
  const { endpoint, ...rest } = req.query;
  if (!endpoint) return res.status(400).json({ error: "endpoint obrigatorio" });

  // Reconstrói query string com os parâmetros extras
  const extraParams = new URLSearchParams(rest).toString();
  const url = `https://api.football-data.org/v4/${endpoint}${extraParams ? "?" + extraParams : ""}`;

  try {
    const upstream = await fetch(url, {
      headers: { "X-Auth-Token": key }
    });
    const data = await upstream.json();
    res.setHeader("Cache-Control", "s-maxage=60");
    return res.status(upstream.status).json(data);
  } catch(e) {
    return res.status(502).json({ error: e.message });
  }
};
