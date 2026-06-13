// api/sofa.js — Proxy serverless SofaScore (sem autenticação)
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { path } = req.query;
  if (!path) return res.status(400).json({ error: 'Parâmetro "path" obrigatório.' });

  const SOFA_BASE = "https://api.sofascore.com/api/v1";
  const url = `${SOFA_BASE}/${path}`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9",
        Origin: "https://www.sofascore.com",
        Referer: "https://www.sofascore.com/",
        "Cache-Control": "no-cache",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: `SofaScore retornou ${response.status}`,
        path,
      });
    }

    const data = await response.json();
    const isLive = path.includes("live") || path.includes("inprogress");
    res.setHeader("Cache-Control", isLive ? "s-maxage=60" : "s-maxage=1800");
    return res.status(200).json(data);
  } catch (err) {
    console.error("[sofa.js] Erro:", err.message);
    return res.status(500).json({ error: "Erro interno no proxy SofaScore." });
  }
}
