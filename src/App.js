import { useState, useCallback, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════ THEME */
const T = {
  bg:"#05070f", card:"#0c1018", card2:"#101620",
  border:"rgba(255,255,255,0.06)", borderG:"rgba(56,211,159,0.35)",
  green:"#38d39f", greenDim:"rgba(56,211,159,0.10)",
  gold:"#f5a623",  goldDim:"rgba(245,166,35,0.10)",
  red:"#ff5370",   redDim:"rgba(255,83,112,0.10)",
  blue:"#4ec9f0",  blueDim:"rgba(78,201,240,0.10)",
  purple:"#c084fc",purpleDim:"rgba(192,132,252,0.10)",
  orange:"#ff8c42",orangeDim:"rgba(255,140,66,0.10)",
  text:"#e2e8f0", muted:"#64748b", dim:"#94a3b8",
};
const RS={APOSTAR:{color:T.green,bg:T.greenDim,border:"rgba(56,211,159,0.30)",icon:"✅"},ANALISAR:{color:T.gold,bg:T.goldDim,border:"rgba(245,166,35,0.30)",icon:"⚠️"},EVITAR:{color:T.red,bg:T.redDim,border:"rgba(255,83,112,0.30)",icon:"❌"}};

/* ═══════════════════════════════════════════ CONSTANTS */
const LEAGUES = [
  { code:"BSA", name:"Brasileirão",    country:"Brasil",      flag:"🇧🇷", oddsKey:"soccer_brazil_campeonato",      sofaId:325  },
  { code:"PL",  name:"Premier League", country:"England",     flag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿", oddsKey:"soccer_epl",                    sofaId:17   },
  { code:"PD",  name:"La Liga",        country:"Spain",       flag:"🇪🇸", oddsKey:"soccer_spain_la_liga",          sofaId:8    },
  { code:"SA",  name:"Serie A",        country:"Italy",       flag:"🇮🇹", oddsKey:"soccer_italy_serie_a",          sofaId:23   },
  { code:"BL1", name:"Bundesliga",     country:"Germany",     flag:"🇩🇪", oddsKey:"soccer_germany_bundesliga",     sofaId:35   },
  { code:"FL1", name:"Ligue 1",        country:"France",      flag:"🇫🇷", oddsKey:"soccer_france_ligue_1",         sofaId:34   },
  { code:"CL",  name:"Champions",      country:"Europe",      flag:"🌍", oddsKey:"soccer_uefa_champs_league",     sofaId:7    },
  { code:"CLI", name:"Libertadores",   country:"Sul-América", flag:"🏆", oddsKey:"soccer_conmebol_libertadores",  sofaId:384  },
  { code:"CSA", name:"Sul-Americana",  country:"Sul-América", flag:"🌎", oddsKey:"soccer_conmebol_sudamericana",  sofaId:480  },
];

const WC_LEAGUE = {
  code:"WC", name:"Copa do Mundo 2026", country:"Mundo", flag:"🏆",
  oddsKey:"soccer_fifa_world_cup", sofaId:16,
  isNational: true,
  phases: ["Fase de Grupos","Oitavas","Quartas","Semifinal","Final"],
};

const CURRENCIES=[{code:"BRL",symbol:"R$"},{code:"USD",symbol:"$"},{code:"EUR",symbol:"€"}];
const FIB=[1,1,2,3,5,8,13,21,34,55];
const MONTH_NAMES=["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

const CORNER_STATS={
  BSA:{avg:10.2,homeAvg:5.4,awayAvg:4.8,over85:72,over95:58,over105:42},
  PL: {avg:10.8,homeAvg:5.8,awayAvg:5.0,over85:76,over95:64,over105:48},
  PD: {avg:9.8, homeAvg:5.2,awayAvg:4.6,over85:68,over95:54,over105:38},
  SA: {avg:9.4, homeAvg:5.0,awayAvg:4.4,over85:65,over95:50,over105:34},
  BL1:{avg:10.5,homeAvg:5.6,awayAvg:4.9,over85:74,over95:61,over105:45},
  FL1:{avg:9.6, homeAvg:5.1,awayAvg:4.5,over85:67,over95:52,over105:36},
  CL: {avg:10.1,homeAvg:5.4,awayAvg:4.7,over85:71,over95:57,over105:41},
  CLI:{avg:9.6, homeAvg:5.1,awayAvg:4.5,over85:67,over95:53,over105:37},
  CSA:{avg:9.4, homeAvg:5.0,awayAvg:4.4,over85:65,over95:51,over105:35},
  WC: {avg:9.8, homeAvg:5.0,awayAvg:4.8,over85:68,over95:53,over105:37},
};

const LEAGUE_MARKET_STATS={
  BSA:[{market:"Over 2.5 Gols",winRate:58,sample:380,trend:"↑"},{market:"BTTS – Ambas Marcam",winRate:55,sample:380,trend:"→"},{market:"1X2 – Vitória Casa",winRate:47,sample:380,trend:"↓"}],
  PL: [{market:"Over 2.5 Gols",winRate:68,sample:380,trend:"↑"},{market:"BTTS – Ambas Marcam",winRate:62,sample:380,trend:"↑"},{market:"1X2 – Vitória Casa",winRate:45,sample:380,trend:"→"}],
  PD: [{market:"Over 2.5 Gols",winRate:65,sample:380,trend:"↑"},{market:"BTTS – Ambas Marcam",winRate:58,sample:380,trend:"→"},{market:"1X2 – Vitória Casa",winRate:47,sample:380,trend:"→"}],
  WC: [{market:"Over 2.5 Gols",winRate:55,sample:128,trend:"→"},{market:"BTTS – Ambas Marcam",winRate:50,sample:128,trend:"→"},{market:"1X2 – Vitória Casa",winRate:42,sample:128,trend:"→"}],
};

const MARKET_INFO={
  "1X2 – Vitória Casa":{titulo:"Vitória da Casa (1)",explicacao:"Você aposta que o time da casa vencerá no tempo regulamentar (90 min).",exemplo:"Termina 2x0 → Casa vence ✅",dica:"Analise aproveitamento em casa."},
  "Empate (X)":{titulo:"Empate (X)",explicacao:"Você aposta que o jogo termina empatado.",exemplo:"Termina 1x1 → você ganha ✅",dica:"Mais comum em jogos equilibrados."},
  "Over 2.5 Gols":{titulo:"Over 2.5 — 3+ gols",explicacao:"Apostamos que o jogo terá 3 ou mais gols somando os dois times.",exemplo:"Termina 2x1 (3 gols) → ✅",dica:"Média combinada acima de 2.8 gols/j é favorável."},
  "BTTS – Ambas Marcam":{titulo:"BTTS — Ambas Marcam",explicacao:"AMBOS os times marcarão pelo menos 1 gol.",exemplo:"Termina 1x1 → ✅",dica:"Times com alta média de gols marcados E sofridos."},
  "Escanteios Over 9.5":{titulo:"Escanteios Over 9.5 — 10+",explicacao:"O jogo terá 10 ou mais escanteios no total.",exemplo:"6+5 = 11 escanteios → ✅",dica:"Times que jogam pelas laterais geram mais escanteios."},
};

/* ═══════════════════════════════════════════ HELPERS */
const fmtISO=d=>{const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,"0"),dd=String(d.getDate()).padStart(2,"0");return`${y}-${m}-${dd}`;};
const fmtBR=d=>d.toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit",year:"numeric"});
const fmtShort=d=>d.toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit"});
const nowDate=()=>new Date();
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
function calDays(y,m){const f=new Date(y,m,1),l=new Date(y,m+1,0),days=[];for(let i=0;i<f.getDay();i++)days.push(null);for(let d=1;d<=l.getDate();d++)days.push(new Date(y,m,d));return days;}
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ═══════════════════════════════════════════ API */

async function oddsFetch(path, key) {
  const [endpoint, qs] = path.includes("?") ? path.split("?") : [path, ""];
  const params = new URLSearchParams(qs);
  params.set("apiKey", key);
  const url = `/api/odds?endpoint=${encodeURIComponent(endpoint)}&${params.toString()}`;
  const r = await fetch(url).catch(e => { throw new Error("Odds rede: " + e.message); });
  if (!r.ok) throw new Error(`Odds ${r.status}`);
  return r.json();
}

async function claudeAnalysis(fixture, homeStats, awayStats, markets, leagueName, dateStr, anthropicKey) {
  const top = (markets || []).filter(m => m.rec === "APOSTAR" && m.cat !== "Escanteios").slice(0, 3);
  const cornerMarkets = (markets || []).filter(m => m.cat === "Escanteios").slice(0, 3);
  const fmtM = m => `• ${m.name}: Prob ${m.prob}% | Odd ${m.odd?.toFixed(2)} | EV ${m.ev>0?"+":""}${m.ev} | ${m.justif}`;

  const prompt = `Você é analista sênior de apostas. Analise ESTA partida e responda APENAS JSON válido.
PARTIDA: ${fixture.homeTeam?.name} x ${fixture.awayTeam?.name} | ${leagueName} | ${dateStr}
CASA: PPG ${homeStats?.ppg||"N/D"} | Gols/J ${homeStats?.goalsFor||"N/D"} | Sofr/J ${homeStats?.goalsAgainst||"N/D"} | Casa% ${homeStats?.winRateHome||"N/D"}
VISIT: PPG ${awayStats?.ppg||"N/D"} | Gols/J ${awayStats?.goalsFor||"N/D"} | Sofr/J ${awayStats?.goalsAgainst||"N/D"} | Fora% ${awayStats?.winRateAway||"N/D"}
MERCADOS EV+: ${top.map(fmtM).join("\n")||"Nenhum"}
ESCANTEIOS: ${cornerMarkets.map(fmtM).join("\n")||"N/D"}
{"resumo":"2-3 frases","analise_casa":"análise","analise_visitante":"análise","perfil_jogo":"Defensivo/Ofensivo","placar_provavel":"X-Y","placar_justificativa":"1-2 frases","escanteios_previsao":"9-11","escanteios_analise":"2 frases","escanteios_aposta":"melhor mercado","mercados":[{"nome":"nome exato","recomendacao":"APOSTAR","risco":"Baixo","justificativa":"para este jogo","confianca":8}],"aposta_principal":"nome","aposta_justificativa":"2-3 frases","segunda_opcao":"nome","segunda_opcao_justificativa":"1-2 frases","alertas":["alerta"],"conclusao":"conselho final"}`;

  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": anthropicKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2500,
      messages: [{ role: "user", content: prompt }, { role: "assistant", content: "{" }],
    }),
  });
  if (!r.ok) throw new Error("Erro Claude API");
  const data = await r.json();
  const text = data.content?.[0]?.text || "";
  return JSON.parse(("{" + text).replace(/```json|
