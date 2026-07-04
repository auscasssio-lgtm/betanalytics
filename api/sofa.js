export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  // Recebe o path e o novo parâmetro de filtro
  const { path, filterTournament } = req.query;
  if (!path) return res.status(400).json({ error: 'Parâmetro "path" obrigatório.' });

  const SOFA_BASE = "https://api.sofascore.com/api/v1";
  const url = `${SOFA_BASE}/${path}`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json, text/plain, */*",
        "Origin": "https://www.sofascore.com",
        "Referer": "https://www.sofascore.com/",
        "Cache-Control": "no-cache",
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `SofaScore retornou ${response.status}`, path });
    }

    let data = await response.json();

    // 🔥 O TRUQUE: Filtra o arquivão gigantesco direto na Vercel!
    if (filterTournament && data.events) {
      const tId = Number(filterTournament);
      data.events = data.events.filter(ev => ev.tournament?.uniqueTournament?.id === tId);
    }

    const isLive = path.includes("live") || path.includes("inprogress");
    res.setHeader("Cache-Control", isLive ? "s-maxage=60" : "s-maxage=1800");
    return res.status(200).json(data);
  } catch (err) {
    console.error("[sofa.js] Erro:", err.message);
    return res.status(500).json({ error: "Erro interno no proxy SofaScore." });
  }
}
