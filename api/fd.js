module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Auth-Token");
  if (req.method === "OPTIONS") return res.status(204).end();

  const key = req.headers["x-auth-token"];
  if (!key) return res.status(401).json({ error: "X-Auth-Token obrigatorio" });

  // ep contem o endpoint completo codificado em base64
  const { ep } = req.query;
  if (!ep) return res.status(400).json({ error: "ep obrigatorio" });

  // Decodifica base64 para obter a URL completa
  const decoded = Buffer.from(ep, "base64").toString("utf8");
  const url = `https://api.football-data.org/v4/${decoded}`;

  try {
    const upstream = await fetch(url, { headers: { "X-Auth-Token": key } });
    const data = await upstream.json();
    res.setHeader("Cache-Control", "s-maxage=60");
    return res.status(upstream.status).json(data);
  } catch(e) {
    return res.status(502).json({ error: e.message });
  }
};
