module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Auth-Token");
  if (req.method === "OPTIONS") return res.status(204).end();

  const { endpoint } = req.query;
  if (!endpoint) return res.status(400).json({ error: "endpoint obrigatorio" });

  const key = req.headers["x-auth-token"];
  if (!key) return res.status(401).json({ error: "X-Auth-Token obrigatorio" });

  const url = `https://api.football-data.org/v4/${endpoint}`;
  const upstream = await fetch(url, {
    headers: { "X-Auth-Token": key }
  });
  const data = await upstream.json();
  res.setHeader("Cache-Control", "s-maxage=60");
  return res.status(upstream.status).json(data);
};
