// api/ia.js — Análise IA usando Claude (Anthropic)
module.exports = async function handler(req, res) {
  // ── CORS ──
  // ⚠️ Troque "*" pelo seu domínio real depois de estabilizar, ex:
  // res.setHeader("Access-Control-Allow-Origin", "https://seu-app.vercel.app");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });

  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
  if (!ANTHROPIC_KEY) {
    return res.status(500).json({
      error: "Chave Anthropic não configurada no servidor. Adicione ANTHROPIC_API_KEY nas variáveis de ambiente do Vercel.",
    });
  }

  const { fixture, homeStats, awayStats, markets, leagueName, dateStr } = req.body;
  if (!fixture) return res.status(400).json({ error: "Dados da partida obrigatórios" });

  // ── DEBUG: veja nos Runtime Logs da Vercel o que está chegando ──
  console.log("INPUT IA:", JSON.stringify({
    league: leagueName,
    date: dateStr,
    home: homeStats,
    away: awayStats,
    qtdMarkets: (markets || []).length,
  }, null, 2));

  // ── Validação de dados mínimos (evita gastar token à toa) ──
  const hasStats = !!(homeStats?.played || awayStats?.played);
  const hasMarkets = (markets || []).length > 0;
  if (!hasStats && !hasMarkets) {
    return res.status(422).json({
      error: "Dados insuficientes para análise. Estatísticas e mercados estão vazios.",
    });
  }

  // ── Agrupamento de mercados por categoria ──
  const mkResult     = (markets || []).filter(m => m.cat === "Resultado");
  const mkGols       = (markets || []).filter(m => m.cat === "Over/Under" || m.cat === "Ambas Marcam" || m.cat === "Dupla Chance");
  const mkEscanteios = (markets || []).filter(m => m.cat === "Escanteios");

  const fmtMarket = m =>
    `  • ${m.name}: Prob ${m.prob}% | Odd ${m.odd?.toFixed(2)} | EV ${m.ev > 0 ? "+" : ""}${m.ev} | Score ${m.score}/10 | ${m.justif}`;

  // ── Aviso de dados faltantes para a IA não "inventar" ──
  const dataWarning = !hasStats
    ? "\n⚠️ ATENÇÃO: As estatísticas das equipes estão INDISPONÍVEIS (N/D). Baseie sua análise APENAS nas odds dos mercados listados. NÃO invente dados de forma, gols, competição ou histórico. Seja transparente sobre a baixa confiança nos campos 'alertas' e 'conclusao'.\n"
    : "";

  const prompt = `Você é um analista sênior de apostas esportivas com 15 anos de experiência. Sua tarefa é analisar ESTA partida específica e identificar a MELHOR oportunidade de aposta considerando todos os dados disponíveis.

═══════════════════════════════════
PARTIDA: ${fixture.homeTeam?.name} x ${fixture.awayTeam?.name}
COMPETIÇÃO: ${leagueName} | DATA: ${dateStr}
═══════════════════════════════════

DADOS ESTATÍSTICOS — ${fixture.homeTeam?.name} (CASA):
• PPG: ${homeStats?.ppg || "N/D"} | Gols marcados/j: ${homeStats?.goalsFor || "N/D"} | Gols sofridos/j: ${homeStats?.goalsAgainst || "N/D"}
• % vitórias em casa: ${homeStats?.winRateHome || "N/D"}% | BTTS histórico: ${homeStats?.btts || "N/D"}%
• Forma últimos 5 jogos: ${homeStats?.form?.join(" ") || "N/D"} | Jogos analisados: ${homeStats?.played || "N/D"}

DADOS ESTATÍSTICOS — ${fixture.awayTeam?.name} (VISITANTE):
• PPG: ${awayStats?.ppg || "N/D"} | Gols marcados/j: ${awayStats?.goalsFor || "N/D"} | Gols sofridos/j: ${awayStats?.goalsAgainst || "N/D"}
• % vitórias fora: ${awayStats?.winRateAway || "N/D"}% | BTTS histórico: ${awayStats?.btts || "N/D"}%
• Forma últimos 5 jogos: ${awayStats?.form?.join(" ") || "N/D"} | Jogos analisados: ${awayStats?.played || "N/D"}

TODOS OS MERCADOS DISPONÍVEIS:

[RESULTADO]
${mkResult.map(fmtMarket).join("\n") || "  N/D"}

[GOLS / BTTS / DUPLA CHANCE]
${mkGols.map(fmtMarket).join("\n") || "  N/D"}

[ESCANTEIOS]
${mkEscanteios.map(fmtMarket).join("\n") || "  N/D"}
${dataWarning}
═══════════════════════════════════
INSTRUÇÕES DE ANÁLISE:
1. Analise os padrões estatísticos de cada time (ataque, defesa, forma, comportamento em casa/fora)
2. Identifique inconsistências nas odds das casas (onde a probabilidade real supera a implícita)
3. Considere o contexto: times ofensivos vs defensivos, confronto equilibrado vs desequilibrado
4. NÃO repita os mesmos mercados sempre — escolha baseado nos dados DESTE jogo específico
5. A aposta principal pode ser qualquer mercado, incluindo escanteios
═══════════════════════════════════

Responda APENAS com este JSON válido:
{
  "resumo": "2-3 frases descrevendo o confronto e o contexto estatístico",
  "analise_casa": "análise detalhada dos padrões do time da casa com base nos dados",
  "analise_visitante": "análise detalhada dos padrões do visitante com base nos dados",
  "perfil_jogo": "como você classifica esse jogo: ex: Defensivo, Ofensivo, Equilibrado, Dominância Casa, etc.",
  "placar_provavel": "X-Y",
  "placar_justificativa": "justificativa baseada nos dados de ataque e defesa de cada time",
  "escanteios_previsao": "faixa ex: 9-11",
  "escanteios_analise": "análise do mercado de escanteios para este jogo específico",
  "escanteios_aposta": "melhor mercado de escanteios com justificativa",
  "mercados": [
    {
      "nome": "nome exato do mercado da lista acima",
      "recomendacao": "APOSTAR ou ANALISAR ou EVITAR",
      "risco": "Baixo ou Médio ou Alto",
      "justificativa": "por que este mercado é bom ou ruim PARA ESTE JOGO ESPECÍFICO",
      "confianca": 8
    }
  ],
  "aposta_principal": "nome exato do mercado mais recomendado",
  "aposta_justificativa": "justificativa completa de 2-3 frases explicando por que esta é a melhor aposta para ESTE jogo",
  "segunda_opcao": "nome do segundo melhor mercado",
  "segunda_opcao_justificativa": "justificativa breve",
  "alertas": ["alerta específico sobre riscos ou incertezas deste jogo"],
  "conclusao": "conselho final personalizado para este jogo, mencionando os times pelo nome"
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
        max_tokens: 3000,
        messages: [
          { role: "user", content: prompt },
          { role: "assistant", content: "{" },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: "Erro Claude: " + err.slice(0, 200) });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || "";

    // O prefill começou com "{", então recolocamos e limpamos cercas de código
    const clean = ("{" + text).replace(/```json|```/g, "").trim();

    // ── Parsing robusto (recupera de truncamento por max_tokens) ──
    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch (e) {
      const lastBrace = clean.lastIndexOf("}");
      if (lastBrace > 0) {
        try {
          parsed = JSON.parse(clean.slice(0, lastBrace + 1));
        } catch {
          return res.status(502).json({
            error: "Resposta da IA em formato inválido",
            raw: clean.slice(0, 300),
          });
        }
      } else {
        return res.status(502).json({ error: "Resposta vazia ou inválida da IA" });
      }
    }

    return res.status(200).json(parsed);
  } catch (error) {
    return res.status(500).json({ error: "Erro na análise IA: " + error.message });
  }
};
