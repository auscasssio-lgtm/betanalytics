module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Auth-Token");
  if (req.method === "OPTIONS") return res.status(204).end();

  const key = req.headers["x-auth-token"];
  if (!key) return res.status(401).json({ error: "X-Auth-Token obrigatorio" });

  // req.query contem todos os parametros da URL
  // endpoint = o path base (ex: "competitions/PL/matches")
  // os demais parametros (dateFrom, dateTo, season, limit, status) sao passados direto
  const { endpoint, ...rest } = req.query;
  if (!endpoint) return res.status(400).json({ error: "endpoint obrigatorio" });

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
