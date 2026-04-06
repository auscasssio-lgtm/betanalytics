// api/ia.js — Análise IA usando Claude (Anthropic)
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });

  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_KEY) return res.status(500).json({ error: "Chave Anthropic não configurada no servidor. Adicione ANTHROPIC_API_KEY nas variáveis de ambiente do Vercel." });

  const { fixture, homeStats, awayStats, markets, leagueName, dateStr } = req.body;
  if (!fixture) return res.status(400).json({ error: "Dados da partida obrigatórios" });

  const top = (markets || []).filter(m => m.rec === "APOSTAR").slice(0, 3);

  const prompt = `Você é um analista profissional de apostas esportivas. Analise a partida e responda APENAS com JSON válido, sem texto adicional.

PARTIDA: ${fixture.homeTeam?.name} x ${fixture.awayTeam?.name}
COMPETIÇÃO: ${leagueName}
DATA: ${dateStr}

ESTATÍSTICAS CASA (${fixture.homeTeam?.name}):
- PPG: ${homeStats?.ppg || "N/D"} | Gols/J: ${homeStats?.goalsFor || "N/D"} | Sofridos/J: ${homeStats?.goalsAgainst || "N/D"}
- Vitórias casa: ${homeStats?.winRateHome || "N/D"}% | BTTS: ${homeStats?.btts || "N/D"}%
- Forma recente: ${homeStats?.form?.join(", ") || "N/D"}

ESTATÍSTICAS VISITANTE (${fixture.awayTeam?.name}):
- PPG: ${awayStats?.ppg || "N/D"} | Gols/J: ${awayStats?.goalsFor || "N/D"} | Sofridos/J: ${awayStats?.goalsAgainst || "N/D"}
- Vitórias fora: ${awayStats?.winRateAway || "N/D"}% | BTTS: ${awayStats?.btts || "N/D"}%
- Forma recente: ${awayStats?.form?.join(", ") || "N/D"}

MERCADOS COM EV POSITIVO:
${top.map(m => `- ${m.name}: Prob ${m.prob}%, Odd ${m.odd?.toFixed(2)}, EV ${m.ev}`).join("\n") || "Nenhum encontrado"}

Responda EXATAMENTE neste formato JSON:
{
  "resumo": "2-3 frases resumindo o confronto",
  "analise_casa": "análise detalhada do time da casa",
  "analise_visitante": "análise detalhada do time visitante",
  "placar_provavel": "X-Y",
  "placar_justificativa": "justificativa em 1-2 frases",
  "mercados": [
    {
      "nome": "nome do mercado",
      "recomendacao": "APOSTAR ou ANALISAR ou EVITAR",
      "risco": "Baixo ou Médio ou Alto",
      "justificativa": "análise de risco detalhada",
      "confianca": 7
    }
  ],
  "aposta_principal": "nome do mercado mais recomendado",
  "aposta_justificativa": "justificativa em 2-3 frases",
  "alertas": ["alerta relevante se houver"],
  "conclusao": "parágrafo final com conselho ao apostador"
}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: "Erro Claude: " + err.slice(0, 200) });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || "";
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    return res.status(200).json(parsed);
  } catch (error) {
    return res.status(500).json({ error: "Erro na análise IA: " + error.message });
  }
}
