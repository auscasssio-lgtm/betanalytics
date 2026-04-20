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
const LEAGUES=[
  {code:"BSA",name:"Brasileirão",    country:"Brasil",      flag:"🇧🇷",oddsKey:"soccer_brazil_campeonato"},
  {code:"PL", name:"Premier League", country:"England",     flag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",oddsKey:"soccer_epl"},
  {code:"PD", name:"La Liga",        country:"Spain",       flag:"🇪🇸",oddsKey:"soccer_spain_la_liga"},
  {code:"SA", name:"Serie A",        country:"Italy",       flag:"🇮🇹",oddsKey:"soccer_italy_serie_a"},
  {code:"BL1",name:"Bundesliga",     country:"Germany",     flag:"🇩🇪",oddsKey:"soccer_germany_bundesliga"},
  {code:"FL1",name:"Ligue 1",        country:"France",      flag:"🇫🇷",oddsKey:"soccer_france_ligue_1"},
  {code:"CL", name:"Champions",      country:"Europe",      flag:"🌍",oddsKey:"soccer_uefa_champs_league"},
  {code:"CLI",name:"Libertadores",   country:"Sul-América", flag:"🏆",oddsKey:"soccer_conmebol_libertadores"},
  {code:"CSA",name:"Sul-Americana",  country:"Sul-América", flag:"🌎",oddsKey:"soccer_conmebol_sudamericana"},
];
const CURRENCIES=[{code:"BRL",symbol:"R$"},{code:"USD",symbol:"$"},{code:"EUR",symbol:"€"}];
const FIB=[1,1,2,3,5,8,13,21,34,55];
const MONTH_NAMES=["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

// Ranking histórico de mercados por liga (dados baseados em estatísticas reais 2023-2025)
// Médias históricas de escanteios por liga (dados 2023-2025)
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
};

const LEAGUE_MARKET_STATS={
  BSA:[{market:"Over 2.5 Gols",winRate:58,sample:380,trend:"↑"},{market:"BTTS – Ambas Marcam",winRate:55,sample:380,trend:"→"},{market:"1X2 – Vitória Casa",winRate:47,sample:380,trend:"↓"},{market:"Under 2.5 Gols",winRate:42,sample:380,trend:"↓"},{market:"Dupla Chance 1X",winRate:72,sample:380,trend:"↑"},{market:"Escanteios Over 8.5",winRate:72,sample:380,trend:"↑"},{market:"Escanteios Over 9.5",winRate:58,sample:380,trend:"→"},{market:"Escanteios Over 10.5",winRate:42,sample:380,trend:"→"}],
  PL: [{market:"Over 2.5 Gols",winRate:68,sample:380,trend:"↑"},{market:"BTTS – Ambas Marcam",winRate:62,sample:380,trend:"↑"},{market:"1X2 – Vitória Casa",winRate:45,sample:380,trend:"→"},{market:"Under 2.5 Gols",winRate:32,sample:380,trend:"↓"},{market:"Dupla Chance 1X",winRate:70,sample:380,trend:"↑"},{market:"Escanteios Over 8.5",winRate:76,sample:380,trend:"↑"},{market:"Escanteios Over 9.5",winRate:64,sample:380,trend:"↑"},{market:"Escanteios Over 10.5",winRate:48,sample:380,trend:"↑"}],
  PD: [{market:"Over 2.5 Gols",winRate:65,sample:380,trend:"↑"},{market:"BTTS – Ambas Marcam",winRate:58,sample:380,trend:"→"},{market:"1X2 – Vitória Casa",winRate:47,sample:380,trend:"→"},{market:"Under 2.5 Gols",winRate:35,sample:380,trend:"↓"},{market:"Dupla Chance 1X",winRate:71,sample:380,trend:"↑"},{market:"Escanteios Over 8.5",winRate:68,sample:380,trend:"↑"},{market:"Escanteios Over 9.5",winRate:54,sample:380,trend:"→"},{market:"Escanteios Over 10.5",winRate:38,sample:380,trend:"→"}],
  SA: [{market:"Over 2.5 Gols",winRate:55,sample:380,trend:"→"},{market:"BTTS – Ambas Marcam",winRate:52,sample:380,trend:"→"},{market:"1X2 – Vitória Casa",winRate:46,sample:380,trend:"→"},{market:"Under 2.5 Gols",winRate:45,sample:380,trend:"↑"},{market:"Dupla Chance 1X",winRate:70,sample:380,trend:"→"},{market:"Escanteios Over 8.5",winRate:65,sample:380,trend:"→"},{market:"Escanteios Over 9.5",winRate:50,sample:380,trend:"→"},{market:"Escanteios Over 10.5",winRate:34,sample:380,trend:"↓"}],
  BL1:[{market:"Over 2.5 Gols",winRate:70,sample:306,trend:"↑"},{market:"BTTS – Ambas Marcam",winRate:63,sample:306,trend:"↑"},{market:"1X2 – Vitória Casa",winRate:46,sample:306,trend:"→"},{market:"Under 2.5 Gols",winRate:30,sample:306,trend:"↓"},{market:"Dupla Chance 1X",winRate:72,sample:306,trend:"↑"},{market:"Escanteios Over 8.5",winRate:74,sample:306,trend:"↑"},{market:"Escanteios Over 9.5",winRate:61,sample:306,trend:"↑"},{market:"Escanteios Over 10.5",winRate:45,sample:306,trend:"↑"}],
  FL1:[{market:"Over 2.5 Gols",winRate:60,sample:380,trend:"→"},{market:"BTTS – Ambas Marcam",winRate:55,sample:380,trend:"→"},{market:"1X2 – Vitória Casa",winRate:44,sample:380,trend:"↓"},{market:"Under 2.5 Gols",winRate:40,sample:380,trend:"↑"},{market:"Dupla Chance 1X",winRate:68,sample:380,trend:"→"},{market:"Escanteios Over 8.5",winRate:67,sample:380,trend:"→"},{market:"Escanteios Over 9.5",winRate:52,sample:380,trend:"→"},{market:"Escanteios Over 10.5",winRate:36,sample:380,trend:"↓"}],
  CL: [{market:"Over 2.5 Gols",winRate:66,sample:125,trend:"↑"},{market:"BTTS – Ambas Marcam",winRate:60,sample:125,trend:"↑"},{market:"1X2 – Vitória Casa",winRate:50,sample:125,trend:"↑"},{market:"Under 2.5 Gols",winRate:34,sample:125,trend:"↓"},{market:"Dupla Chance 1X",winRate:73,sample:125,trend:"↑"},{market:"Escanteios Over 8.5",winRate:71,sample:125,trend:"↑"},{market:"Escanteios Over 9.5",winRate:57,sample:125,trend:"↑"},{market:"Escanteios Over 10.5",winRate:41,sample:125,trend:"→"}],
  CLI:[{market:"Over 2.5 Gols",winRate:62,sample:200,trend:"↑"},{market:"BTTS – Ambas Marcam",winRate:56,sample:200,trend:"→"},{market:"1X2 – Vitória Casa",winRate:52,sample:200,trend:"↑"},{market:"Under 2.5 Gols",winRate:38,sample:200,trend:"↓"},{market:"Dupla Chance 1X",winRate:74,sample:200,trend:"↑"},{market:"Escanteios Over 8.5",winRate:67,sample:200,trend:"→"},{market:"Escanteios Over 9.5",winRate:53,sample:200,trend:"→"},{market:"Escanteios Over 10.5",winRate:37,sample:200,trend:"↓"}],
  CSA:[{market:"Over 2.5 Gols",winRate:59,sample:180,trend:"→"},{market:"BTTS – Ambas Marcam",winRate:53,sample:180,trend:"→"},{market:"1X2 – Vitória Casa",winRate:50,sample:180,trend:"→"},{market:"Under 2.5 Gols",winRate:41,sample:180,trend:"↑"},{market:"Dupla Chance 1X",winRate:72,sample:180,trend:"→"},{market:"Escanteios Over 8.5",winRate:65,sample:180,trend:"→"},{market:"Escanteios Over 9.5",winRate:51,sample:180,trend:"↓"},{market:"Escanteios Over 10.5",winRate:35,sample:180,trend:"↓"}],
};

const MARKET_INFO={
  "1X2 – Vitória Casa":{titulo:"Vitória da Casa (1)",explicacao:"Você aposta que o time da casa vencerá no tempo regulamentar (90 min).",exemplo:"Termina 2x0, 1x0, 3x1 → Casa vence ✅",dica:"💡 Analise aproveitamento em casa e confrontos diretos."},
  "Empate (X)":{titulo:"Empate (X)",explicacao:"Você aposta que o jogo termina empatado no tempo regulamentar.",exemplo:"Termina 1x1 ou 0x0 → você ganha ✅",dica:"💡 Mais comum em jogos equilibrados."},
  "1X2 – Vitória Visit.":{titulo:"Vitória Visitante (2)",explicacao:"Você aposta que o visitante vencerá. Times visitantes vencem menos, por isso odds maiores.",exemplo:"Termina 0x1 → Visitante vence ✅",dica:"💡 Verifique desempenho fora de casa do visitante."},
  "Over 2.5 Gols":{titulo:"Over 2.5 — 3+ gols",explicacao:"Apostamos que o jogo terá 3 ou mais gols somando os dois times.",exemplo:"Termina 2x1 (3 gols) → ✅ | Termina 1x1 (2 gols) → ❌",dica:"💡 Média combinada acima de 2.8 gols/j é favorável."},
  "Over 3.5 Gols":{titulo:"Over 3.5 — 4+ gols",explicacao:"O jogo terá 4 ou mais gols. Mais arriscado, odds mais atrativas.",exemplo:"Termina 3x1 (4 gols) → ✅ | Termina 2x1 (3 gols) → ❌",dica:"💡 Reserve para jogos com média acima de 3.5 gols/j."},
  "Under 2.5 Gols":{titulo:"Under 2.5 — 2 gols ou menos",explicacao:"O jogo terá 2 gols ou menos. Oposto do Over 2.5.",exemplo:"Termina 1x0 (1 gol) → ✅ | Termina 2x1 (3 gols) → ❌",dica:"💡 Bom para jogos defensivos ou mata-matas."},
  "BTTS – Ambas Marcam":{titulo:"BTTS — Ambas Marcam",explicacao:"AMBOS os times marcarão pelo menos 1 gol. Não importa o placar.",exemplo:"Termina 1x1 → ✅ | Termina 2x0 → ❌",dica:"💡 Times com alta média de gols marcados E sofridos favorecem."},
  "Dupla Chance 1X":{titulo:"Dupla Chance 1X",explicacao:"Você aposta em DOIS resultados: vitória da casa OU empate. Só perde se o visitante vencer.",exemplo:"Termina 2x0 → ✅ | Termina 1x1 → ✅ | Termina 0x1 → ❌",dica:"💡 Ideal quando confia que a casa não perde mas tem dúvida se vence."},
  "Escanteios Over 9.5":{titulo:"Escanteios Over 9.5 — 10+",explicacao:"O jogo terá 10 ou mais escanteios no total dos dois times.",exemplo:"6+5 = 11 escanteios → ✅ | 4+4 = 8 → ❌",dica:"💡 Times que jogam pelas laterais geram mais escanteios."},
  "Escanteios Over 10.5":{titulo:"Escanteios Over 10.5 — 11+",explicacao:"11 ou mais escanteios no total. Versão mais exigente.",exemplo:"6+6 = 12 → ✅ | 5+5 = 10 → ❌",dica:"💡 Reserve para times muito ofensivos com altas médias."},
  "Escanteios Over 8.5":{titulo:"Escanteios Over 8.5 — 9+",explicacao:"O jogo terá 9 ou mais escanteios no total. É o mercado mais provável dos três.",exemplo:"5+4 = 9 escanteios → ✅ | 4+4 = 8 → ❌",dica:"💡 Odds mais baixas mas maior probabilidade — bom para acumuladores."},
  "Escanteios Time Casa":{titulo:"Escanteios — Time da Casa bate mais",explicacao:"Você aposta que o time da casa cobrará mais escanteios do que o visitante no total do jogo.",exemplo:"Casa: 6 escanteios · Visit.: 4 escanteios → Casa vence ✅",dica:"💡 Times que atacam mais em casa naturalmente geram mais escanteios."},
  "Escanteios Time Visit.":{titulo:"Escanteios — Time Visitante bate mais",explicacao:"Você aposta que o visitante cobrará mais escanteios do que a casa.",exemplo:"Visit.: 6 escanteios · Casa: 4 escanteios → Visitante vence ✅",dica:"💡 Favorável quando o visitante é amplamente superior e domina o jogo."},
  "1º Escanteio — Casa":{titulo:"Primeiro Escanteio — Time da Casa",explicacao:"Você aposta que o time da casa cobrará o primeiro escanteio do jogo.",exemplo:"Primeiro escanteio aos 3min para a casa → ✅",dica:"💡 Times que pressionam no início do jogo tendem a bater o primeiro escanteio."},
  "1º Escanteio — Visit.":{titulo:"Primeiro Escanteio — Visitante",explicacao:"Você aposta que o visitante cobrará o primeiro escanteio do jogo.",exemplo:"Primeiro escanteio aos 5min para o visitante → ✅",dica:"💡 Odds mais altas — favorável quando visitante tem estilo ofensivo e pressiona logo no início."},
  "Handicap Escanteios Casa -1.5":{titulo:"Handicap Escanteios — Casa -1.5",explicacao:"O time da casa precisa bater 2 ou mais escanteios a mais que o visitante.",exemplo:"Casa 7 · Visit. 4 = diferença +3 → Casa cobre -1.5 ✅ | Casa 6 · Visit. 5 = +1 → ❌",dica:"💡 Ideal quando a casa é claramente superior e controla o jogo no ataque."},
};

/* ═══════════════════════════════════════════ HELPERS */
const fmtISO=d=>{const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,"0"),dd=String(d.getDate()).padStart(2,"0");return`${y}-${m}-${dd}`;};
const fmtBR=d=>d.toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit",year:"numeric"});
const fmtShort=d=>d.toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit"});
const nowDate=()=>new Date();
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
function calDays(y,m){const f=new Date(y,m,1),l=new Date(y,m+1,0),days=[];for(let i=0;i<f.getDay();i++)days.push(null);for(let d=1;d<=l.getDate();d++)days.push(new Date(y,m,d));return days;}

/* ═══════════════════════════════════════════ API
   Chamadas via proxy CORS público — garantidamente sem bloqueio
═══════════════════════════════════════════ */
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function fdFetch(ep, key, retries = 2) {
  // Usa serverless function do Vercel como proxy — único método que funciona
  const [path, qs] = ep.includes("?") ? ep.split("?") : [ep, ""];
  const url = `/api/fd?endpoint=${encodeURIComponent(path)}${qs ? "&" + qs : ""}`;
  const r = await fetch(url, { headers: { "X-Auth-Token": key } })
    .catch(e => { throw new Error("Rede: " + e.message); });
  if (r.status === 429 && retries > 0) { await sleep(7000); return fdFetch(ep, key, retries - 1); }
  if (!r.ok) { const t = await r.text().catch(() => ""); throw new Error(`FD ${r.status}: ${t.slice(0,120)}`); }
  return r.json();
}

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
CASA: PPG ${homeStats?.ppg||"N/D"} | Gols/J ${homeStats?.goalsFor||"N/D"} | Sofr/J ${homeStats?.goalsAgainst||"N/D"} | Casa% ${homeStats?.winRateHome||"N/D"} | BTTS ${homeStats?.btts||"N/D"}% | Forma: ${homeStats?.form?.join(" ")||"N/D"}
VISIT: PPG ${awayStats?.ppg||"N/D"} | Gols/J ${awayStats?.goalsFor||"N/D"} | Sofr/J ${awayStats?.goalsAgainst||"N/D"} | Fora% ${awayStats?.winRateAway||"N/D"} | BTTS ${awayStats?.btts||"N/D"}% | Forma: ${awayStats?.form?.join(" ")||"N/D"}
MERCADOS EV+: ${top.map(fmtM).join("\n")||"Nenhum"}
ESCANTEIOS: ${cornerMarkets.map(fmtM).join("\n")||"N/D"}
INSTRUÇÃO: NÃO repita sempre os mesmos mercados. Escolha baseado nos dados DESTE jogo.

{"resumo":"2-3 frases","analise_casa":"análise","analise_visitante":"análise","perfil_jogo":"Defensivo/Ofensivo/Equilibrado/etc","placar_provavel":"X-Y","placar_justificativa":"1-2 frases","escanteios_previsao":"9-11","escanteios_analise":"2 frases","escanteios_aposta":"melhor mercado","mercados":[{"nome":"nome exato","recomendacao":"APOSTAR","risco":"Baixo","justificativa":"para este jogo","confianca":8}],"aposta_principal":"nome","aposta_justificativa":"2-3 frases","segunda_opcao":"nome","segunda_opcao_justificativa":"1-2 frases","alertas":["alerta"],"conclusao":"conselho final"}`;

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
      messages: [
        { role: "user", content: prompt },
        { role: "assistant", content: "{" }
      ],
    }),
  });
  if (!r.ok) { const t = await r.text(); throw new Error(t.slice(0, 200)); }
  const data = await r.json();
  const text = data.content?.[0]?.text || "";
  return JSON.parse(("{" + text).replace(/```json|```/g, "").trim());
}

/* ═══════════════════════════════════════════ ANALYSIS ENGINE */
function parseStatsFD(resp,teamId){
  if(!resp?.matches?.length)return null;
  const matches=resp.matches.filter(m=>m.status==="FINISHED").slice(-10);
  if(!matches.length)return null;
  let gf=0,ga=0,w=0,d=0,wh=0,ph=0,wa=0,pa=0,btts=0;
  matches.forEach(m=>{
    const isH=m.homeTeam?.id===teamId;
    const gs=isH?(m.score?.fullTime?.home||0):(m.score?.fullTime?.away||0);
    const gc=isH?(m.score?.fullTime?.away||0):(m.score?.fullTime?.home||0);
    gf+=gs;ga+=gc;if(gs>0&&gc>0)btts++;
    if(gs>gc){w++;if(isH)wh++;else wa++;}else if(gs===gc)d++;
    if(isH)ph++;else pa++;
  });
  const n=matches.length;
  return{ppg:+((w*3+d)/n).toFixed(2),goalsFor:+(gf/n).toFixed(2),goalsAgainst:+(ga/n).toFixed(2),winRateHome:ph?Math.round(wh/ph*100):0,winRateAway:pa?Math.round(wa/pa*100):0,btts:Math.round(btts/n*100),played:n,form:matches.slice(-5).map(m=>{const isH=m.homeTeam?.id===teamId;const gs=isH?(m.score?.fullTime?.home||0):(m.score?.fullTime?.away||0);const gc=isH?(m.score?.fullTime?.away||0):(m.score?.fullTime?.home||0);return gs>gc?"W":gs===gc?"D":"L";})};
}

function buildMarkets(hs,as_,oddsData,leagueCode="BSA"){
  const hppg=hs?.ppg||1.2,appg=as_?.ppg||1.0;
  const hgf=hs?.goalsFor||1.3,agf=as_?.goalsFor||1.1;
  const hwr=hs?.winRateHome||40,awr=as_?.winRateAway||32;
  const hbtts=hs?.btts||50,abtts=as_?.btts||48;
  const totalG=hgf+agf;
  const hwp=clamp(Math.round(hwr*0.55+(hppg/3)*38+5),10,82);
  const awp=clamp(Math.round(awr*0.50+(appg/3)*33),8,72);
  const dwp=clamp(100-hwp-awp,10,38);
  const o25=clamp(Math.round(totalG>=3?72:totalG>=2.5?58:40),25,84);
  const o35=clamp(Math.round(totalG>=3.5?60:totalG>=3?44:26),14,72);
  const bttp=clamp(Math.round((hbtts+abtts)/2),20,80);
  const dc1x=clamp(hwp+dwp,50,95);

  // Escanteios — usa médias históricas da liga + estilo ofensivo dos times
  const cs=CORNER_STATS[leagueCode]||CORNER_STATS.BSA;
  // Fator ofensivo: times com mais gols tendem a gerar mais escanteios
  const offFactor=clamp((hgf+agf)/2.4,0.8,1.3);
  // Fator pressão: times com mais vitórias em casa pressionam mais
  const pressFactor=clamp((hwr+awr)/80,0.9,1.2);
  const cornerFactor=offFactor*pressFactor;
  const expCorners=+(cs.avg*cornerFactor).toFixed(1);
  const homeCorners=+(cs.homeAvg*(hgf/1.3)*clamp(hwr/45,0.8,1.3)).toFixed(1);
  const awayCorners=+(cs.awayAvg*(agf/1.1)*clamp(awr/35,0.8,1.3)).toFixed(1);

  const o85=clamp(Math.round(cs.over85*cornerFactor),45,90);
  const o95=clamp(Math.round(cs.over95*cornerFactor),30,80);
  const o105=clamp(Math.round(cs.over105*cornerFactor),18,68);

  // Quem bate mais escanteios
  const homeMoreCorners=clamp(Math.round(50+(homeCorners-awayCorners)*8),25,78);
  const awayMoreCorners=100-homeMoreCorners;

  // Primeiro escanteio (proporcional à pressão no início)
  const firstCornHome=clamp(Math.round(50+(hwr-awr)*0.3+(hgf-agf)*5),35,68);
  const firstCornAway=100-firstCornHome;

  // Handicap escanteios casa -1.5
  const hcCornerHome=clamp(Math.round(homeMoreCorners*0.72),20,60);

  const ro={};
  if(oddsData?.bookmakers?.length){
    oddsData.bookmakers.forEach(b=>b.markets?.forEach(mkt=>{
      if(mkt.key==="h2h")mkt.outcomes?.forEach(o=>{if(o.name==="Home"&&!ro.home)ro.home=o.price;if(o.name==="Away"&&!ro.away)ro.away=o.price;if(o.name==="Draw"&&!ro.draw)ro.draw=o.price;});
      if(mkt.key==="totals")mkt.outcomes?.forEach(o=>{if(o.name==="Over"&&Math.abs((o.point||0)-2.5)<0.1&&!ro.over25)ro.over25=o.price;if(o.name==="Under"&&Math.abs((o.point||0)-2.5)<0.1&&!ro.under25)ro.under25=o.price;if(o.name==="Over"&&Math.abs((o.point||0)-3.5)<0.1&&!ro.over35)ro.over35=o.price;});
    }));
  }
  const hasReal=Object.keys(ro).length>0;
  const ev=(p,odd)=>+((p/100)*odd-1).toFixed(3);
  const sc=p=>clamp(Math.round(p/11),1,9);
  const rec=(p,t1,t2)=>p>=t1?"APOSTAR":p>=t2?"ANALISAR":"EVITAR";

  return[
    // Mercados de resultado
    {name:"1X2 – Vitória Casa",   cat:"Resultado",    prob:hwp, odd:ro.home||1.90,  score:sc(hwp), rec:rec(hwp,62,45), ev:ev(hwp,ro.home||1.90),  justif:`Aproveit. casa: ${hwr}% · PPG: ${hppg.toFixed(2)}`},
    {name:"Empate (X)",           cat:"Resultado",    prob:dwp, odd:ro.draw||3.20,  score:sc(dwp), rec:rec(dwp,35,25), ev:ev(dwp,ro.draw||3.20),  justif:`Prob. de empate: ${dwp}%`},
    {name:"1X2 – Vitória Visit.", cat:"Resultado",    prob:awp, odd:ro.away||2.60,  score:sc(awp), rec:rec(awp,55,40), ev:ev(awp,ro.away||2.60),  justif:`Aproveit. fora: ${awr}% · PPG: ${appg.toFixed(2)}`},
    // Mercados de gols
    {name:"Over 2.5 Gols",        cat:"Over/Under",   prob:o25, odd:ro.over25||1.85,score:sc(o25), rec:rec(o25,65,50), ev:ev(o25,ro.over25||1.85),justif:`Média total: ${totalG.toFixed(2)} gols/j`},
    {name:"Over 3.5 Gols",        cat:"Over/Under",   prob:o35, odd:ro.over35||2.35,score:sc(o35), rec:rec(o35,55,40), ev:ev(o35,ro.over35||2.35),justif:`Requer ataque forte · média ${totalG.toFixed(2)}`},
    {name:"Under 2.5 Gols",       cat:"Over/Under",   prob:100-o25,odd:ro.under25||2.00,score:sc(100-o25),rec:rec(100-o25,52,40),ev:ev(100-o25,ro.under25||2.00),justif:`Under favorecido quando média ≤ 2.5`},
    {name:"BTTS – Ambas Marcam",  cat:"Ambas Marcam", prob:bttp,odd:1.90,           score:sc(bttp), rec:rec(bttp,62,50), ev:ev(bttp,1.90),          justif:`BTTS casa ${hbtts}%, visit. ${abtts}%`},
    {name:"Dupla Chance 1X",      cat:"Dupla Chance", prob:dc1x,odd:1.25,           score:sc(dc1x), rec:rec(dc1x,72,58), ev:ev(dc1x,1.25),          justif:`Cobre vitória + empate · ${dc1x}%`},
    // Mercados de escanteios
    {name:"Escanteios Over 8.5",        cat:"Escanteios",    prob:o85,           odd:1.65,score:sc(o85),           rec:rec(o85,72,58),           ev:ev(o85,1.65),           justif:`Prev. ${expCorners} escanteios · Liga: ${cs.avg} média`},
    {name:"Escanteios Over 9.5",        cat:"Escanteios",    prob:o95,           odd:1.90,score:sc(o95),           rec:rec(o95,62,48),           ev:ev(o95,1.90),           justif:`${homeCorners.toFixed(1)} (casa) + ${awayCorners.toFixed(1)} (visit.) esperados`},
    {name:"Escanteios Over 10.5",       cat:"Escanteios",    prob:o105,          odd:2.20,score:sc(o105),          rec:rec(o105,52,40),          ev:ev(o105,2.20),          justif:`Requer jogo aberto · ${cs.over105}% histórico na liga`},
    {name:"Escanteios Time Casa",       cat:"Escanteios",    prob:homeMoreCorners,odd:1.85,score:sc(homeMoreCorners),rec:rec(homeMoreCorners,60,45),ev:ev(homeMoreCorners,1.85),justif:`Casa: ${homeCorners.toFixed(1)} · Visit.: ${awayCorners.toFixed(1)} escanteios esperados`},
    {name:"Escanteios Time Visit.",     cat:"Escanteios",    prob:awayMoreCorners,odd:2.10,score:sc(awayMoreCorners),rec:rec(awayMoreCorners,55,40),ev:ev(awayMoreCorners,2.10),justif:`Visitante precisa dominar territoriamente`},
    {name:"1º Escanteio — Casa",        cat:"Escanteios",    prob:firstCornHome, odd:1.80,score:sc(firstCornHome), rec:rec(firstCornHome,60,45), ev:ev(firstCornHome,1.80), justif:`Casa pressiona mais no início · ${hwr}% aproveit. em casa`},
    {name:"1º Escanteio — Visit.",      cat:"Escanteios",    prob:firstCornAway, odd:2.10,score:sc(firstCornAway), rec:rec(firstCornAway,52,38), ev:ev(firstCornAway,2.10), justif:`Odds maiores por ser menos provável`},
    {name:"Handicap Escanteios Casa -1.5",cat:"Escanteios",  prob:hcCornerHome,  odd:2.00,score:sc(hcCornerHome),  rec:rec(hcCornerHome,52,38),  ev:ev(hcCornerHome,2.00),  justif:`Casa precisa bater 2+ escanteios a mais`},
  ].map(m=>({...m,hasRealOdd:hasReal})).sort((a,b)=>b.score-a.score);
}

function calcKelly(prob,odd){return Math.max(0,(prob/100*(odd-1)-(1-prob/100))/(odd-1));}
function calcValueScore(markets){const best=markets.filter(m=>m.rec==="APOSTAR"&&m.ev>0);if(!best.length)return 0;return Math.round(Math.max(...best.map(m=>m.ev))*40+Math.max(...best.map(m=>m.score))*6);}

/* ═══════════════════════════════════════════ UI ATOMS */
function Card({children,style={},glow=false,onClick}){return<div onClick={onClick} style={{background:T.card,border:`1px solid ${glow?T.borderG:T.border}`,borderRadius:16,padding:20,boxShadow:glow?"0 0 28px rgba(56,211,159,0.07)":"none",cursor:onClick?"pointer":"default",...style}}>{children}</div>;}
function Pill({children,color=T.green,size=11}){return<span style={{background:color+"18",border:`1px solid ${color}33`,color,borderRadius:6,padding:"2px 9px",fontSize:size,fontWeight:700,whiteSpace:"nowrap"}}>{children}</span>;}
function FormBadge({r}){const m={W:{c:T.green,l:"V"},D:{c:T.gold,l:"E"},L:{c:T.red,l:"D"}};const s=m[r]||{c:T.muted,l:"?"};return<span style={{width:22,height:22,borderRadius:5,background:s.c+"20",border:`1px solid ${s.c}44`,color:s.c,fontSize:10,fontWeight:800,display:"inline-flex",alignItems:"center",justifyContent:"center"}}>{s.l}</span>;}
function ScoreBar({score}){const c=score>=7?T.green:score>=5?T.gold:T.red;return<div style={{display:"flex",alignItems:"center",gap:8}}><div style={{flex:1,background:"rgba(255,255,255,0.06)",borderRadius:4,height:7,overflow:"hidden"}}><div style={{width:`${score*10}%`,height:"100%",background:c,borderRadius:4,boxShadow:`0 0 8px ${c}55`,transition:"width 0.6s ease"}}/></div><span style={{color:c,fontWeight:800,fontSize:13,minWidth:36,fontFamily:"'Barlow Condensed',sans-serif"}}>{score}/10</span></div>;}
function Spinner({label="Buscando..."}){return<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:72,gap:16}}><div style={{position:"relative",width:44,height:44}}><div style={{position:"absolute",inset:0,border:`3px solid ${T.border}`,borderRadius:"50%"}}/><div style={{position:"absolute",inset:0,border:"3px solid transparent",borderTopColor:T.green,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/></div><span style={{color:T.muted,fontSize:13,textAlign:"center",maxWidth:400}}>{label}</span><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;}
function NavBtn({active,onClick,icon,label,badge=0}){return<button onClick={onClick} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 14px",background:active?T.greenDim:"transparent",border:`1px solid ${active?T.borderG:T.border}`,borderRadius:10,cursor:"pointer",color:active?T.green:T.muted,fontSize:12,fontWeight:active?700:400,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:0.4,transition:"all 0.2s",whiteSpace:"nowrap",position:"relative"}}><span>{icon}</span>{label}{badge>0&&<span style={{position:"absolute",top:-4,right:-4,background:T.red,color:"#fff",borderRadius:"50%",width:16,height:16,fontSize:9,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center"}}>{badge}</span>}</button>;}
function InfoRow({t,d}){return<div style={{display:"flex",gap:10,padding:"8px 0",borderBottom:`1px solid ${T.border}`}}><span style={{color:T.green,fontSize:12,marginTop:1,flexShrink:0}}>▸</span><div><div style={{fontSize:13,color:T.text,fontWeight:600}}>{t}</div><div style={{fontSize:11,color:T.muted,marginTop:2,lineHeight:1.5}}>{d}</div></div></div>;}
function ResBox({label,value,color,sub}){return<div style={{background:"rgba(255,255,255,0.04)",borderRadius:12,padding:14,textAlign:"center",border:`1px solid ${T.border}`}}><div style={{fontSize:10,color:T.muted,marginBottom:5,lineHeight:1.4}}>{label}</div><div style={{fontSize:22,fontWeight:800,color,fontFamily:"'Barlow Condensed',sans-serif"}}>{value}</div>{sub&&<div style={{fontSize:9,color:T.muted,marginTop:3}}>{sub}</div>}</div>;}

/* ═══════════════════════════════════════════ SPARKLINE */
function Sparkline({data,w=280,h=80,color=T.green,showDots=true}){
  if(!data||data.length<2)return<div style={{color:T.muted,fontSize:12,padding:20,textAlign:"center"}}>Sem dados suficientes</div>;
  const mn=Math.min(...data)-5,mx=Math.max(...data)+5;
  const pts=data.map((v,i)=>{const x=(i/(data.length-1))*w;const y=h-((v-mn)/(mx-mn))*h;return`${x},${y}`;}).join(" ");
  const isUp=data[data.length-1]>=data[0];
  const c=isUp?color:T.red;
  return(
    <svg width={w} height={h} style={{overflow:"visible"}}>
      <defs><linearGradient id={`sg${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={c} stopOpacity="0.3"/><stop offset="100%" stopColor={c} stopOpacity="0"/></linearGradient></defs>
      <polygon points={`${pts} ${w},${h} 0,${h}`} fill={`url(#sg${color.replace("#","")})`}/>
      <polyline points={pts} fill="none" stroke={c} strokeWidth="2.5" strokeLinejoin="round"/>
      {showDots&&data.map((v,i)=>{const x=(i/(data.length-1))*w;const y=h-((v-mn)/(mx-mn))*h;return<circle key={i} cx={x} cy={y} r="3.5" fill={c} stroke={T.card} strokeWidth="1.5"/>;})}
    </svg>
  );
}

/* ═══════════════════════════════════════════ CALENDAR */
function Calendar({selected,onSelect,onClose}){
  const[view,setView]=useState({year:selected.getFullYear(),month:selected.getMonth()});
  const days=calDays(view.year,view.month);
  const todayStr=fmtISO(nowDate()),selStr=fmtISO(selected);
  const prev=()=>setView(v=>v.month===0?{year:v.year-1,month:11}:{...v,month:v.month-1});
  const next=()=>setView(v=>v.month===11?{year:v.year+1,month:0}:{...v,month:v.month+1});
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,backdropFilter:"blur(8px)"}} onClick={onClose}>
      <div style={{background:T.card,border:`1px solid ${T.borderG}`,borderRadius:20,padding:28,width:330}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
          <button onClick={prev} style={{width:34,height:34,borderRadius:9,background:"rgba(255,255,255,0.05)",border:`1px solid ${T.border}`,color:T.text,cursor:"pointer",fontSize:18}}>‹</button>
          <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:17,color:T.text}}>{MONTH_NAMES[view.month]} {view.year}</span>
          <button onClick={next} style={{width:34,height:34,borderRadius:9,background:"rgba(255,255,255,0.05)",border:`1px solid ${T.border}`,color:T.text,cursor:"pointer",fontSize:18}}>›</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:10}}>
          {["D","S","T","Q","Q","S","S"].map((d,i)=><div key={i} style={{textAlign:"center",fontSize:10,color:T.muted,fontWeight:700,padding:"4px 0"}}>{d}</div>)}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4}}>
          {days.map((d,i)=>{if(!d)return<div key={i}/>;const ds=fmtISO(d),isT=ds===todayStr,isS=ds===selStr;return<button key={i} onClick={()=>{onSelect(d);onClose();}} style={{height:36,borderRadius:8,border:`1px solid ${isS?T.borderG:isT?"rgba(245,166,35,0.4)":T.border}`,background:isS?T.greenDim:isT?T.goldDim:"transparent",color:isS?T.green:isT?T.gold:T.text,fontWeight:isS||isT?700:400,fontSize:13,cursor:"pointer"}}>{d.getDate()}</button>;})}
        </div>
        <div style={{display:"flex",gap:6,marginTop:16}}>
          {[["Ontem",-1],["Hoje",0],["Amanhã",1],["+3d",3],["+7d",7]].map(([lb,off])=>{const d=new Date();d.setDate(d.getDate()+off);return<button key={lb} onClick={()=>{onSelect(d);onClose();}} style={{flex:1,padding:"7px 0",background:"rgba(255,255,255,0.04)",border:`1px solid ${T.border}`,borderRadius:8,color:T.dim,fontSize:10,cursor:"pointer",fontWeight:600}}>{lb}</button>;})}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════ MARKET CARD (expansível) */
function MarketCard({m,i,onRegister,onAddCombinada,bankroll,currency,strategy,isInCombinada=false}){
  const[open,setOpen]=useState(false);
  const[customStake,setCustomStake]=useState(null); // null = usar sugestão
  const rs=RS[m.rec];
  const info=MARKET_INFO[m.name]||null;
  const kelly=calcKelly(m.prob,m.odd);
  const kellyStake=+(bankroll*kelly*0.25).toFixed(2);
  const fixedStake=+(bankroll*0.02).toFixed(2);
  const sugStake=strategy==="kelly"?kellyStake:fixedStake;
  const finalStake=customStake!==null?customStake:sugStake;
  const evStake=+(finalStake*m.ev).toFixed(2);
  const pctBanca=(finalStake/bankroll*100).toFixed(1);

  return(
    <div style={{border:`1px solid ${open?T.borderG:T.border}`,borderRadius:12,overflow:"hidden",background:open?"rgba(56,211,159,0.02)":i%2===0?"rgba(255,255,255,0.012)":T.card,transition:"all 0.2s"}}>
      <div style={{display:"grid",gridTemplateColumns:"195px 1fr 85px 75px 75px 115px 36px",gap:10,alignItems:"center",padding:"13px 14px",cursor:"pointer"}} onClick={()=>setOpen(o=>!o)}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <div style={{fontWeight:700,fontSize:13,color:T.text}}>{m.name}</div>
            {info&&<span style={{fontSize:9,color:T.blue,background:T.blueDim,border:`1px solid rgba(78,201,240,0.2)`,borderRadius:4,padding:"1px 5px"}}>?</span>}
          </div>
          <div style={{fontSize:10,color:T.muted,marginTop:2}}>{m.cat}</div>
          <div style={{fontSize:10,color:T.muted,marginTop:3,lineHeight:1.4}}>{m.justif}</div>
        </div>
        <ScoreBar score={m.score}/>
        <div style={{textAlign:"center"}}><div style={{fontSize:18,fontWeight:800,color:T.text,fontFamily:"'Barlow Condensed',sans-serif"}}>{m.prob}%</div></div>
        <div style={{textAlign:"center"}}><div style={{fontSize:16,fontWeight:800,color:T.gold,fontFamily:"'Barlow Condensed',sans-serif"}}>{m.odd.toFixed(2)}</div><div style={{fontSize:9,color:T.muted}}>{m.hasRealOdd?"real":"est."}</div></div>
        <div style={{textAlign:"center"}}><div style={{fontSize:15,fontWeight:800,color:m.ev>0?T.green:T.red,fontFamily:"'Barlow Condensed',sans-serif"}}>{m.ev>0?"+":""}{m.ev}</div></div>
        <div style={{background:rs.bg,border:`1px solid ${rs.border}`,borderRadius:8,padding:"6px 8px",textAlign:"center",color:rs.color,fontWeight:800,fontSize:11,fontFamily:"'Barlow Condensed',sans-serif"}}>{rs.icon} {m.rec}</div>
        <div style={{textAlign:"center",color:open?T.green:T.muted,fontSize:16,transition:"transform 0.25s",transform:open?"rotate(180deg)":"rotate(0deg)"}}>⌄</div>
      </div>
      {open&&(
        <div style={{borderTop:`1px solid ${T.border}`,padding:"18px 20px",background:"rgba(0,0,0,0.25)"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:18}}>
            {/* Explicação */}
            <div>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:15,color:T.blue,marginBottom:10}}>📖 O que é?</div>
              {info?(
                <>
                  <div style={{fontSize:13,color:T.text,lineHeight:1.7,marginBottom:10}}>{info.explicacao}</div>
                  <div style={{padding:"9px 13px",background:T.blueDim,border:`1px solid rgba(78,201,240,0.2)`,borderRadius:8,fontSize:12,color:T.blue,marginBottom:8}}>{info.exemplo}</div>
                  <div style={{fontSize:12,color:T.gold}}>{info.dica}</div>
                </>
              ):<div style={{color:T.muted,fontSize:13}}>Sem descrição disponível.</div>}
            </div>
            {/* Dados da aposta */}
            <div>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:15,color:T.green,marginBottom:10}}>📊 Dados</div>
              <div style={{display:"flex",flexDirection:"column",gap:7}}>
                {[["Probabilidade estimada",`${m.prob}%`],["Odd",`${m.odd.toFixed(2)} (${m.hasRealOdd?"real":"estimada"})`],["EV",`${m.ev>0?"+":""}${m.ev}`],["Score",`${m.score}/10`],["Risco",m.ev>0.1?"Baixo":m.ev>0?"Médio":"Alto"],["Recomendação",m.rec]].map(([l,v])=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"5px 10px",background:"rgba(255,255,255,0.03)",borderRadius:7,border:`1px solid ${T.border}`}}>
                    <span style={{fontSize:12,color:T.muted}}>{l}</span>
                    <span style={{fontSize:12,fontWeight:700,color:T.text}}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Sugestão de valor + entrada editável */}
            <div>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:15,color:T.gold,marginBottom:10}}>💰 Valor da Aposta</div>

              {/* Sugestão */}
              <div style={{padding:"10px 14px",background:"rgba(245,166,35,0.07)",border:`1px solid rgba(245,166,35,0.2)`,borderRadius:10,marginBottom:12}}>
                <div style={{fontSize:10,color:T.gold,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>Sugestão ({strategy==="kelly"?"Kelly 25%":"2 Un."})</div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <span style={{fontSize:20,fontWeight:800,color:T.gold,fontFamily:"'Barlow Condensed',sans-serif"}}>{currency.symbol} {sugStake.toFixed(2)}</span>
                  <button onClick={e=>{e.stopPropagation();setCustomStake(sugStake);}} style={{fontSize:10,color:T.gold,background:"rgba(245,166,35,0.15)",border:"1px solid rgba(245,166,35,0.3)",borderRadius:6,padding:"3px 8px",cursor:"pointer"}}>Usar</button>
                </div>
                {kelly<=0&&<div style={{fontSize:10,color:T.red,marginTop:4}}>⚠️ EV negativo — Kelly indica não apostar</div>}
              </div>

              {/* Entrada editável */}
              <div style={{marginBottom:12}}>
                <div style={{fontSize:11,color:T.text,fontWeight:600,marginBottom:7}}>✏️ Valor real que vai apostar:</div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:14,color:T.muted,fontWeight:600}}>{currency.symbol}</span>
                  <input
                    type="number"
                    value={finalStake}
                    min={0.01}
                    step={0.5}
                    onClick={e=>e.stopPropagation()}
                    onChange={e=>{e.stopPropagation();setCustomStake(Math.max(0,Number(e.target.value)));}}
                    style={{flex:1,background:"rgba(255,255,255,0.06)",border:`1px solid ${T.borderG}`,borderRadius:9,padding:"10px 13px",color:T.green,fontSize:20,fontWeight:800,outline:"none",fontFamily:"'Barlow Condensed',sans-serif",boxSizing:"border-box"}}
                  />
                  {customStake!==null&&customStake!==sugStake&&(
                    <button onClick={e=>{e.stopPropagation();setCustomStake(null);}} style={{fontSize:10,color:T.muted,background:"rgba(255,255,255,0.04)",border:`1px solid ${T.border}`,borderRadius:6,padding:"3px 7px",cursor:"pointer",whiteSpace:"nowrap"}}>Reset</button>
                  )}
                </div>
                <div style={{display:"flex",justifyContent:"space-between",marginTop:7}}>
                  <span style={{fontSize:11,color:T.muted}}>{pctBanca}% da banca</span>
                  {m.ev>0&&<span style={{fontSize:11,color:T.green}}>Retorno esp.: +{currency.symbol} {Math.abs(evStake).toFixed(2)}</span>}
                </div>
              </div>

              {/* Botões rápidos de valor */}
              <div style={{display:"flex",gap:5,marginBottom:12,flexWrap:"wrap"}}>
                {[1,2,5,10,25,50].map(v=>(
                  <button key={v} onClick={e=>{e.stopPropagation();setCustomStake(v);}} style={{padding:"5px 10px",background:finalStake===v?T.greenDim:"rgba(255,255,255,0.04)",border:`1px solid ${finalStake===v?T.borderG:T.border}`,borderRadius:7,cursor:"pointer",color:finalStake===v?T.green:T.dim,fontSize:11,fontWeight:finalStake===v?700:400}}>
                    {currency.symbol}{v}
                  </button>
                ))}
              </div>

              {m.rec==="APOSTAR"&&(
                <button onClick={e=>{e.stopPropagation();onRegister(m,finalStake);}} style={{width:"100%",padding:"12px 0",background:T.greenDim,border:`1px solid ${T.borderG}`,borderRadius:9,color:T.green,fontSize:13,fontWeight:800,fontFamily:"'Barlow Condensed',sans-serif",cursor:"pointer"}}>
                  + Registrar Aposta · {currency.symbol} {finalStake.toFixed(2)}
                </button>
              )}
              {onAddCombinada&&m.ev>0&&(
                <button onClick={e=>{e.stopPropagation();onAddCombinada(m);}} style={{width:"100%",marginTop:6,padding:"9px 0",background:isInCombinada?"rgba(245,166,35,0.15)":T.goldDim,border:`1px solid ${isInCombinada?"rgba(245,166,35,0.5)":"rgba(245,166,35,0.3)"}`,borderRadius:9,color:T.gold,fontSize:12,fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif",cursor:"pointer"}}>
                  {isInCombinada?"✓ Na Combinada":"🎰 Adicionar à Combinada"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


/* ═══════════════════════════════════════════ SETUP */
function Setup({onSave}){
  const[fd,setFd]=useState("");const[odds,setOdds]=useState("");const[ant,setAnt]=useState("");
  const ok=fd.trim()&&odds.trim();
  return(
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Barlow',sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;600;700&family=Barlow+Condensed:wght@700;800&display=swap" rel="stylesheet"/>
      <div style={{maxWidth:540,width:"100%",padding:"0 24px"}}>
        <div style={{textAlign:"center",marginBottom:40}}>
          <div style={{width:72,height:72,borderRadius:20,background:T.greenDim,border:`2px solid ${T.borderG}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:36,margin:"0 auto 20px"}}>⚽</div>
          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:38,fontWeight:800,color:T.text,letterSpacing:1}}>BETANALYTICS</div>
          <div style={{fontSize:13,color:T.muted,marginTop:8}}>Dashboard profissional · Dados reais · Temporada atual</div>
        </div>
        {[{label:"Football-Data.org",desc:"Jogos, stats, escudos · gratuito",color:T.green,link:"https://football-data.org/client/register",val:fd,set:setFd,ph:"Chave Football-Data.org..."},{label:"The Odds API",desc:"Odds reais das casas · 500 req/mês grátis",color:T.gold,link:"https://the-odds-api.com/#get-access",val:odds,set:setOdds,ph:"Chave The Odds API..."},{label:"Anthropic API",desc:"Análise IA com Claude · ~$0.001/análise",color:T.purple,link:"https://console.anthropic.com",val:ant,set:setAnt,ph:"Chave Anthropic (sk-ant-...) — opcional"}].map(({label,desc,color,link,val,set,ph})=>(
          <Card key={label} style={{marginBottom:14}} glow={!!val}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
              <div><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:16,color}}>{label}</div><div style={{fontSize:11,color:T.muted,marginTop:2}}>{desc}</div></div>
              <a href={link} target="_blank" rel="noreferrer" style={{fontSize:11,color:T.blue}}>Criar conta →</a>
            </div>
            <input type="password" placeholder={ph} value={val} onChange={e=>set(e.target.value)} style={{width:"100%",background:"rgba(255,255,255,0.04)",border:`1px solid ${val?"rgba(56,211,159,0.3)":T.border}`,borderRadius:10,padding:"13px 15px",color:T.text,fontSize:14,outline:"none",boxSizing:"border-box"}}/>
          </Card>
        ))}
        <button onClick={()=>ok&&onSave(fd.trim(),odds.trim(),ant.trim())} disabled={!ok} style={{width:"100%",background:ok?T.greenDim:"rgba(255,255,255,0.03)",border:`1px solid ${ok?T.borderG:T.border}`,borderRadius:12,padding:15,color:ok?T.green:T.muted,fontSize:16,fontWeight:800,fontFamily:"'Barlow Condensed',sans-serif",cursor:ok?"pointer":"not-allowed",transition:"all 0.2s",marginBottom:12}}>
          Entrar no Dashboard →
        </button>
        <div style={{padding:"11px 15px",background:T.redDim,border:"1px solid rgba(255,83,112,0.2)",borderRadius:10,fontSize:11,color:T.red}}>🔒 Suas chaves ficam salvas <strong>apenas no seu navegador</strong>. Nunca as compartilhe.</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════ MAIN APP */
export default function App(){
  const[fdKey,setFdKey]=useState(()=>{try{return localStorage.getItem("bta_fd3")||""}catch{return ""}});
  const[oddsKey,setOddsKey]=useState(()=>{try{return localStorage.getItem("bta_od3")||""}catch{return ""}});
  const[gptKey,setGptKey]=useState(()=>{try{return localStorage.getItem("bta_gpt")||""}catch{return ""}});
  const saveKeys=(fd,od,ant="")=>{
    try{localStorage.setItem("bta_fd3",fd);localStorage.setItem("bta_od3",od);if(ant)localStorage.setItem("bta_gpt",ant);}catch{}
    setFdKey(fd);setOddsKey(od);if(ant)setGptKey(ant);
  };
  const logout=()=>{try{["bta_fd3","bta_od3"].forEach(k=>localStorage.removeItem(k));}catch{};setFdKey("");setOddsKey("");};

  const[profile,setProfile]=useState(()=>{try{return JSON.parse(localStorage.getItem("bta_profile4")||"{}")}catch{return{}}});
  const saveProfile=p=>{try{localStorage.setItem("bta_profile4",JSON.stringify(p))}catch{};setProfile(p);};

  const[tab,setTab]=useState("scanner");
  const[jogosSubTab,setJogosSubTab]=useState("scanner");
  const[maisSubTab,setMaisSubTab]=useState("ranking");
  const[showRawData,setShowRawData]=useState(false);
  const[anaStep,setAnaStep]=useState(0); // 0=idle,1=stats,2=odds,3=ia
  const[selLeague,setSelLeague]=useState(LEAGUES[0]);
  const[selDate,setSelDate]=useState(nowDate());
  const[showCal,setShowCal]=useState(false);
  const[fixtures,setFixtures]=useState([]);
  const[loadingFix,setLoadingFix]=useState(false);
  const[analysis,setAnalysis]=useState(null);
  const[loadingAna,setLoadingAna]=useState(false);
  const[selFix,setSelFix]=useState(null);
  const[err,setErr]=useState("");

  const[scanResults,setScanResults]=useState([]);
  const[scanning,setScanning]=useState(false);
  const[scanErr,setScanErr]=useState("");
  const[scanLeague,setScanLeague]=useState(LEAGUES[0]);
  const[scanDate,setScanDate]=useState(nowDate());
  const[scanMode,setScanMode]=useState("auto"); // "auto" = todas ligas, "manual" = escolher liga
  const[scanProgress,setScanProgress]=useState({current:0,total:0,league:""});
  const[luckyBet,setLuckyBet]=useState(null); // Chance Lucrativa
  const[alertThreshold,setAlertThreshold]=useState(()=>{try{return Number(localStorage.getItem("bta_alert")||20)}catch{return 20}});
  const[alertEnabled,setAlertEnabled]=useState(()=>{try{return localStorage.getItem("bta_alertOn")==="true"}catch{return false}});

  const[betLog,setBetLog]=useState(()=>{try{return JSON.parse(localStorage.getItem("bta_bets4")||"[]")}catch{return[]}});
  const saveBets=b=>{try{localStorage.setItem("bta_bets4",JSON.stringify(b))}catch{};setBetLog(b);};

  // Apostas Combinadas
  const[combinadas,setCombinadas]=useState([]); // seleções para combinar
  const[combLog,setCombLog]=useState(()=>{try{return JSON.parse(localStorage.getItem("bta_comb")||"[]")}catch{return[]}});
  const saveCombLog=b=>{try{localStorage.setItem("bta_comb",JSON.stringify(b))}catch{};setCombLog(b);};

  // Gestão de banca profissional
  const[bancaConfig,setBancaConfig]=useState(()=>{try{return JSON.parse(localStorage.getItem("bta_bancacfg")||"{}")}catch{return{}}});
  const saveBancaConfig=c=>{try{localStorage.setItem("bta_bancacfg",JSON.stringify(c))}catch{};setBancaConfig(c);};
  const[bancaSubTab,setBancaSubTab]=useState("resumo");
  const[loadingComb,setLoadingComb]=useState(false);
  const[combAnalysis,setCombAnalysis]=useState(null);
  const[combErr,setCombErr]=useState("");

  const[simStrat,setSimStrat]=useState("kelly");
  const[simOdd,setSimOdd]=useState(1.90);
  const[simProb,setSimProb]=useState(65);
  const[simUnit,setSimUnit]=useState(2);
  const[simFib,setSimFib]=useState(0);
  const[simLoss,setSimLoss]=useState(0);

  const[gptAnalysis,setGptAnalysis]=useState(null);
  const[loadingGpt,setLoadingGpt]=useState(false);
  const[gptErr,setGptErr]=useState("");

  // Agenda semanal
  const[agenda,setAgenda]=useState([]);
  const[loadingAgenda,setLoadingAgenda]=useState(false);
  const[agendaLeagues,setAgendaLeagues]=useState(["BSA","PL"]);

  const currency=CURRENCIES.find(c=>c.code===profile.currency)||CURRENCIES[0];
  const bankroll=profile.bankroll||1000;
  const preferredStrategy=profile.strategy||"kelly";
  const dateStr=fmtISO(selDate);

  // Banca curve
  const concluded=betLog.filter(b=>b.result!=="PENDENTE");
  const totalPnl=concluded.reduce((a,b)=>a+b.pnl,0);
  const wins=concluded.filter(b=>b.result==="WIN").length;
  const pending=betLog.filter(b=>b.result==="PENDENTE").length;

  let runningBank=bankroll;
  const bankCurve=betLog.filter(b=>b.result!=="PENDENTE").slice().reverse().map(b=>{runningBank+=b.pnl;return+runningBank.toFixed(2);});
  if(!bankCurve.length)bankCurve.push(bankroll);

  // Alerts
  const hotGames=scanResults.filter(r=>r.valueScore>=alertThreshold);
  useEffect(()=>{
    if(alertEnabled&&hotGames.length>0&&"Notification"in window){
      Notification.requestPermission().then(p=>{if(p==="granted")new Notification(`⚽ BetAnalytics — ${hotGames.length} jogo(s) com valor!`,{body:hotGames.map(r=>`${r.fixture.homeTeam?.name} x ${r.fixture.awayTeam?.name} — Score ${r.valueScore}`).join("\n")});});
    }
  },[hotGames.length,alertEnabled]);

  /* ── LOAD FIXTURES ── */
  const loadFixtures=useCallback(async()=>{
    setLoadingFix(true);setErr("");setFixtures([]);setSelFix(null);setAnalysis(null);
    try{const data=await fdFetch(`competitions/${selLeague.code}/matches?dateFrom=${dateStr}&dateTo=${dateStr}`,fdKey);setFixtures(data.matches||[]);if(!(data.matches||[]).length)setErr(`Nenhum jogo em ${fmtBR(selDate)} para ${selLeague.name}.`);}
    catch(e){setErr("Erro: "+e.message);}finally{setLoadingFix(false);}
  },[fdKey,selLeague,dateStr,selDate]);

  /* ── LOAD ANALYSIS ── */
  const loadAnalysis=useCallback(async(fixture)=>{
    setSelFix(fixture);setAnalysis(null);setLoadingAna(true);setErr("");setGptAnalysis(null);setGptErr("");setTab("analise");setShowRawData(false);setAnaStep(1);
    try{
      const calYear=selDate.getFullYear();
      const calMonth=selDate.getMonth();
      const calendarLeagues=["BSA","MLS","CLI","CSA"];
      const season=calendarLeagues.includes(selLeague.code)?calYear:(calMonth>=7?calYear:calYear-1);
      const hr=await fdFetch(`teams/${fixture.homeTeam.id}/matches?season=${season}&limit=12&status=FINISHED`,fdKey);
      await sleep(6500);
      setAnaStep(2);
      const ar=await fdFetch(`teams/${fixture.awayTeam.id}/matches?season=${season}&limit=12&status=FINISHED`,fdKey);
      const hs=parseStatsFD(hr,fixture.homeTeam.id);
      const as_=parseStatsFD(ar,fixture.awayTeam.id);
      let oddsData=null;
      try{const allOdds=await oddsFetch(`sports/${selLeague.oddsKey}/odds?regions=eu&markets=h2h,totals&dateFrom=${dateStr}T00:00:00Z&dateTo=${dateStr}T23:59:59Z`,oddsKey);oddsData=Array.isArray(allOdds)?allOdds.find(o=>(o.home_team||"").toLowerCase().includes((fixture.homeTeam.name||"").toLowerCase().split(" ")[0])):null;}catch{}
      setAnaStep(3);
      const builtMarkets=buildMarkets(hs,as_,oddsData,selLeague.code);
      setAnalysis({fixture,hs,as_,markets:builtMarkets,hasOdds:!!oddsData});
      setLoadingGpt(true);
      try{
        const result=await claudeAnalysis(fixture,hs,as_,builtMarkets,selLeague.name,fmtBR(selDate),gptKey);
        setGptAnalysis(result);
      }catch(e){setGptErr("Erro IA: "+e.message);}
      finally{setLoadingGpt(false);}
    }catch(e){setErr("Erro na análise: "+e.message);}finally{setLoadingAna(false);setAnaStep(0);}
  },[fdKey,oddsKey,selLeague,selDate,dateStr]);

  /* ── SCANNER ── */
  const runScanner=useCallback(async()=>{
    setScanning(true);setScanErr("");setScanResults([]);setLuckyBet(null);
    const ds=fmtISO(scanDate);
    const calYear=scanDate.getFullYear();
    const calMonth=scanDate.getMonth();
    const calendarLeagues=["BSA","MLS","CLI","CSA"];
    const leaguesToScan=scanMode==="auto"?LEAGUES:[scanLeague];
    const allResults=[];
    let totalMatches=0;

    try{
      // Fase 1: busca jogos de todas as ligas
      const leagueMatches=[];
      for(const league of leaguesToScan){
        try{
          const data=await fdFetch(`competitions/${league.code}/matches?dateFrom=${ds}&dateTo=${ds}`,fdKey);
          const matches=(data.matches||[]).slice(0,3); // max 3 por liga para não estourar rate limit
          if(matches.length){leagueMatches.push({league,matches});totalMatches+=matches.length;}
          await sleep(6500);
        }catch(e){console.warn(`Skip ${league.code}:`,e.message);}
      }

      if(!leagueMatches.length){setScanErr("Nenhum jogo encontrado para hoje nessas ligas.");setScanning(false);return;}

      // Fase 2: analisa cada jogo
      let processed=0;
      for(const{league,matches}of leagueMatches){
        let allOdds=[];
        try{allOdds=await oddsFetch(`sports/${league.oddsKey}/odds?regions=eu&markets=h2h,totals&dateFrom=${ds}T00:00:00Z&dateTo=${ds}T23:59:59Z`,oddsKey);await sleep(3000);}catch{}
        const season=calendarLeagues.includes(league.code)?calYear:(calMonth>=7?calYear:calYear-1);

        for(const m of matches){
          try{
            setScanProgress({current:++processed,total:totalMatches,league:league.name});
            const hr=await fdFetch(`teams/${m.homeTeam.id}/matches?season=${season}&limit=10&status=FINISHED`,fdKey);
            await sleep(6500);
            const ar=await fdFetch(`teams/${m.awayTeam.id}/matches?season=${season}&limit=10&status=FINISHED`,fdKey);
            await sleep(6500);
            const hs=parseStatsFD(hr,m.homeTeam.id);
            const as_=parseStatsFD(ar,m.awayTeam.id);
            const oddsData=Array.isArray(allOdds)?allOdds.find(o=>(o.home_team||"").toLowerCase().includes((m.homeTeam.name||"").toLowerCase().split(" ")[0])):null;
            const markets=buildMarkets(hs,as_,oddsData,league.code);
            const valueScore=calcValueScore(markets);
            allResults.push({fixture:m,hs,as_,markets,valueScore,bestMarkets:markets.filter(mk=>mk.rec==="APOSTAR"&&mk.ev>0),hasOdds:!!oddsData,league});
            setScanResults([...allResults].sort((a,b)=>b.valueScore-a.valueScore));
          }catch(e){console.warn("Scanner skip:",e.message);}
        }
      }

      // Fase 3: detectar Chance Lucrativa
      // Critério: EV positivo + odd >= 2.50 + prob >= 30% (chance real mas odd alta)
      const luckyBets=[];
      allResults.forEach(r=>{
        r.markets.forEach(m=>{
          if(m.ev>0&&m.odd>=2.50&&m.prob>=28&&m.prob<=65){
            luckyBets.push({...m,fixture:r.fixture,league:r.league,lucroEsperado:+(m.ev*100).toFixed(1)});
          }
        });
      });
      // Ordena por maior EV absoluto (não relativo) — o que retorna mais em termos absolutos
      luckyBets.sort((a,b)=>b.ev*b.odd-a.ev*a.odd);
      if(luckyBets.length>0)setLuckyBet(luckyBets[0]);

      if(!allResults.length)setScanErr("Não foi possível analisar os jogos. Verifique sua chave.");
    }catch(e){setScanErr("Erro: "+e.message);}finally{setScanning(false);setScanProgress({current:0,total:0,league:""});}
  },[fdKey,oddsKey,scanLeague,scanDate,scanMode]);

  /* ── AGENDA SEMANAL ── */
  const loadAgenda=useCallback(async()=>{
    setLoadingAgenda(true);
    const today=nowDate();
    const results=[];
    for(const leagueCode of agendaLeagues){
      const league=LEAGUES.find(l=>l.code===leagueCode);
      if(!league)continue;
      try{
        const from=fmtISO(today);
        const toD=new Date(today);toD.setDate(toD.getDate()+6);
        const to=fmtISO(toD);
        const data=await fdFetch(`competitions/${leagueCode}/matches?dateFrom=${from}&dateTo=${to}`,fdKey);
        await sleep(6500);
        (data.matches||[]).forEach(m=>{results.push({...m,leagueName:league.name,leagueFlag:league.flag});});
      }catch(e){console.warn("Agenda skip:",leagueCode,e.message);}
    }
    results.sort((a,b)=>new Date(a.utcDate)-new Date(b.utcDate));
    setAgenda(results);
    setLoadingAgenda(false);
  },[fdKey,agendaLeagues]);

  /* ── BET ACTIONS ── */
  const addBet=(m,sugStake,fixture)=>{
    const stake=sugStake||+(bankroll*calcKelly(m.prob,m.odd)*0.25).toFixed(2)||+(bankroll*0.02).toFixed(2);
    const nb=[{id:Date.now(),date:fmtBR(nowDate()),match:`${(fixture||selFix)?.homeTeam?.name} x ${(fixture||selFix)?.awayTeam?.name}`,market:m.name,odd:m.odd,stake,result:"PENDENTE",pnl:0},...betLog];
    saveBets(nb);
  };
  const resolveBet=(id,res)=>saveBets(betLog.map(b=>b.id!==id?b:{...b,result:res,pnl:res==="WIN"?+(b.stake*(b.odd-1)).toFixed(2):-b.stake}));
  const deleteBet=id=>saveBets(betLog.filter(b=>b.id!==id));

  /* ── GPT ── */
  const runGpt=useCallback(async()=>{
    if(!analysis)return;
    setLoadingGpt(true);setGptErr("");setGptAnalysis(null);
    const{fixture:f,hs,as_,markets}=analysis;
    try{
      const result=await claudeAnalysis(f,hs,as_,markets,selLeague.name,fmtBR(selDate),gptKey);
      setGptAnalysis(result);
    }catch(e){setGptErr("Erro IA: "+e.message);}
    finally{setLoadingGpt(false);}
  },[analysis,selLeague,selDate]);

  if(!fdKey||!oddsKey)return<Setup onSave={saveKeys}/>;

  const simKelly=calcKelly(simProb,simOdd);
  const simEV=simProb/100*simOdd-1;
  const INP={width:"100%",background:"rgba(255,255,255,0.05)",border:`1px solid ${T.border}`,borderRadius:8,padding:"10px 12px",color:T.green,fontSize:18,fontWeight:800,fontFamily:"'Barlow Condensed',sans-serif",outline:"none",boxSizing:"border-box"};

  // Group agenda by date
  const agendaByDay={};
  agenda.forEach(m=>{const d=fmtISO(new Date(m.utcDate));if(!agendaByDay[d])agendaByDay[d]=[];agendaByDay[d].push(m);});

  return(
    <div style={{minHeight:"100vh",background:T.bg,color:T.text,fontFamily:"'Barlow',sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;600;700&family=Barlow+Condensed:wght@600;700;800&display=swap" rel="stylesheet"/>
      {showCal&&<Calendar selected={tab==="jogos"?selDate:scanDate} onSelect={d=>{tab==="jogos"?setSelDate(d):setScanDate(d);}} onClose={()=>setShowCal(false)}/>}

      {/* HEADER */}
      <header style={{background:"linear-gradient(90deg,#091510,#05070f)",borderBottom:"1px solid rgba(56,211,159,0.10)",padding:"0 24px",display:"flex",alignItems:"center",justifyContent:"space-between",height:62,position:"sticky",top:0,zIndex:100,backdropFilter:"blur(16px)"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:38,height:38,borderRadius:12,background:T.greenDim,border:`1px solid ${T.borderG}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>⚽</div>
          <div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:18,fontWeight:800,color:T.text,letterSpacing:1.5}}>BETANALYTICS</div>
            <div style={{fontSize:8,color:T.green,letterSpacing:2,textTransform:"uppercase"}}>Dados Reais · Temporada Atual</div>
          </div>
        </div>
        <nav style={{display:"flex",gap:5,flexWrap:"wrap"}}>
          {[["jogos","⚽","Jogos",0],["analise","🔬","Análise + IA",analysis?1:0],["combinadas","🎰","Combinadas",combinadas.length],["banca","💰","Banca",pending],["ranking","🏆","Ranking",0],["mais","⚙️","Mais",0]].map(([k,ic,lb,badge])=>
            <NavBtn key={k} active={tab===k||((tab==="scanner"||tab==="agenda"||tab==="ia"||tab==="simulador"||tab==="perfil")&&((k==="jogos"&&(tab==="scanner"||tab==="agenda"))||(k==="analise"&&tab==="ia")||(k==="mais"&&(tab==="simulador"||tab==="perfil"))))} onClick={()=>setTab(k)} icon={ic} label={lb} badge={badge}/>
          )}
        </nav>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          {profile.favTeamCrest&&<img src={profile.favTeamCrest} alt="" style={{height:26,opacity:0.85}} onError={e=>e.target.style.display="none"}/>}
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:9,color:T.muted}}>BANCA</div>
            <div style={{fontSize:15,fontWeight:800,color:totalPnl>=0?T.green:T.red,fontFamily:"'Barlow Condensed',sans-serif"}}>{currency.symbol} {(bankroll+totalPnl).toFixed(0)}</div>
          </div>
          <button onClick={logout} style={{background:"transparent",border:`1px solid ${T.border}`,borderRadius:8,padding:"5px 10px",color:T.muted,fontSize:11,cursor:"pointer"}}>Sair</button>
        </div>
      </header>

      <main style={{padding:"24px 24px 72px"}}>

        {/* ══ JOGOS (unifica Scanner + Agenda + Jogos) ══ */}
        {(tab==="jogos"||tab==="scanner"||tab==="agenda")&&(
          <div>
            {/* Sub-navegação */}
            <div style={{display:"flex",gap:6,marginBottom:20,borderBottom:`1px solid ${T.border}`,paddingBottom:14}}>
              {[["scanner","🔥","Scanner Multi-Liga"],["buscar","🔍","Buscar por Data"],["agenda","📅","Agenda Semanal"]].map(([k,ic,lb])=>(
                <button key={k} onClick={()=>setJogosSubTab(k)} style={{padding:"8px 16px",background:jogosSubTab===k?T.greenDim:"transparent",border:`1px solid ${jogosSubTab===k?T.borderG:T.border}`,borderRadius:9,cursor:"pointer",color:jogosSubTab===k?T.green:T.muted,fontSize:12,fontWeight:jogosSubTab===k?800:400,fontFamily:"'Barlow Condensed',sans-serif",transition:"all 0.2s"}}>{ic} {lb}</button>
              ))}
            </div>

            {/* ── SUB: SCANNER ── */}
            {jogosSubTab==="scanner"&&(
            <div>
              <div style={{marginBottom:16,display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
                <div>
                  <h2 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:22,fontWeight:800,color:T.text,margin:"0 0 4px"}}>🔥 Scanner de Valor</h2>
                  <p style={{color:T.muted,fontSize:12,margin:0}}>Analisa jogos de todas as ligas e detecta as melhores oportunidades automaticamente.</p>
                </div>
                <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                  <div style={{display:"flex",gap:4}}>
                    {[["auto","🌍 Todas as ligas"],["manual","⚙️ Escolher liga"]].map(([m,lb])=>(
                      <button key={m} onClick={()=>setScanMode(m)} style={{padding:"7px 14px",background:scanMode===m?T.greenDim:"rgba(255,255,255,0.03)",border:`1px solid ${scanMode===m?T.borderG:T.border}`,borderRadius:8,cursor:"pointer",color:scanMode===m?T.green:T.dim,fontSize:11,fontWeight:scanMode===m?700:400}}>{lb}</button>
                    ))}
                  </div>
                  <div style={{display:"flex",gap:5}}>
                    {[["Ontem",-1],["Hoje",0],["Amanhã",1]].map(([lb,off])=>{const d=new Date();d.setDate(d.getDate()+off);const active=fmtISO(d)===fmtISO(scanDate);return<button key={lb} onClick={()=>setScanDate(d)} style={{padding:"6px 11px",background:active?T.goldDim:"rgba(255,255,255,0.03)",border:`1px solid ${active?"rgba(245,166,35,0.35)":T.border}`,borderRadius:8,cursor:"pointer",color:active?T.gold:T.dim,fontSize:11,fontWeight:active?700:400}}>{lb}</button>;})}
                    <button onClick={()=>setShowCal(true)} style={{padding:"6px 10px",background:"rgba(255,255,255,0.03)",border:`1px solid ${T.border}`,borderRadius:8,cursor:"pointer",color:T.dim,fontSize:10}}>📅 {fmtShort(scanDate)}</button>
                  </div>
                </div>
              </div>

              {scanMode==="manual"&&(
                <Card style={{marginBottom:14}}>
                  <div style={{fontSize:11,color:T.muted,marginBottom:8}}>Liga específica:</div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {LEAGUES.map(l=><button key={l.code} onClick={()=>setScanLeague(l)} style={{padding:"6px 11px",background:scanLeague.code===l.code?T.greenDim:"rgba(255,255,255,0.03)",border:`1px solid ${scanLeague.code===l.code?T.borderG:T.border}`,borderRadius:7,cursor:"pointer",color:scanLeague.code===l.code?T.green:T.dim,fontSize:11,fontWeight:scanLeague.code===l.code?700:400}}>{l.flag} {l.name}</button>)}
                  </div>
                </Card>
              )}

              <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:16,flexWrap:"wrap"}}>
                <button onClick={runScanner} disabled={scanning} style={{padding:"11px 24px",background:scanning?T.card2:T.greenDim,border:`1px solid ${scanning?T.border:T.borderG}`,borderRadius:10,color:scanning?T.muted:T.green,fontSize:14,fontWeight:800,fontFamily:"'Barlow Condensed',sans-serif",cursor:scanning?"not-allowed":"pointer",opacity:scanning?0.6:1}}>
                  {scanning?"🔄 Analisando...":"🔍 Escanear Jogos"}
                </button>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <span style={{fontSize:11,color:T.muted}}>Alerta EV ≥</span>
                  <input type="number" value={alertThreshold} onChange={e=>{const v=Number(e.target.value);setAlertThreshold(v);try{localStorage.setItem("bta_alert",v)}catch{}}} style={{width:52,background:"rgba(255,255,255,0.05)",border:`1px solid ${T.border}`,borderRadius:7,padding:"5px 8px",color:T.text,fontSize:12,outline:"none",textAlign:"center"}}/>
                  <button onClick={()=>{const v=!alertEnabled;setAlertEnabled(v);try{localStorage.setItem("bta_alertOn",v)}catch{}}} style={{padding:"5px 10px",background:alertEnabled?T.greenDim:"rgba(255,255,255,0.03)",border:`1px solid ${alertEnabled?T.borderG:T.border}`,borderRadius:7,cursor:"pointer",color:alertEnabled?T.green:T.muted,fontSize:11,fontWeight:700}}>🔔 {alertEnabled?"ON":"OFF"}</button>
                </div>
                {scanning&&scanProgress.total>0&&(
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:140,background:"rgba(255,255,255,0.06)",borderRadius:4,height:6,overflow:"hidden"}}>
                      <div style={{width:`${(scanProgress.current/scanProgress.total)*100}%`,height:"100%",background:T.green,borderRadius:4,transition:"width 0.3s"}}/>
                    </div>
                    <span style={{fontSize:11,color:T.muted}}>{scanProgress.current}/{scanProgress.total} · {scanProgress.league}</span>
                  </div>
                )}
              </div>

              {scanErr&&<div style={{background:T.redDim,border:"1px solid rgba(255,83,112,0.3)",borderRadius:12,padding:"14px 18px",color:T.red,marginBottom:16,fontSize:13}}>{scanErr}</div>}
              {scanning&&!scanProgress.total&&<Spinner label="Buscando jogos de todas as ligas..."/>}

              {/* ── CHANCE LUCRATIVA ── */}
              {luckyBet&&!scanning&&(
                <div style={{marginBottom:20,padding:"18px 20px",background:"linear-gradient(135deg,rgba(245,166,35,0.12),rgba(12,16,24,1))",border:"2px solid rgba(245,166,35,0.4)",borderRadius:16,position:"relative",overflow:"hidden"}}>
                  <div style={{position:"absolute",top:12,right:16,fontSize:32,opacity:0.15}}>💎</div>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                    <span style={{fontSize:18}}>💎</span>
                    <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:18,color:T.gold}}>Chance Lucrativa do Dia</span>
                    <Pill color={T.gold} size={10}>Alto Retorno</Pill>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:12,color:T.muted,marginBottom:4}}>
                        {luckyBet.league?.flag} {luckyBet.league?.name} · {luckyBet.fixture?.homeTeam?.name} vs {luckyBet.fixture?.awayTeam?.name}
                      </div>
                      <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:22,fontWeight:800,color:T.text,marginBottom:4}}>{luckyBet.name}</div>
                      <div style={{fontSize:12,color:T.dim}}>{luckyBet.justif}</div>
                    </div>
                    <div style={{display:"flex",gap:16,alignItems:"center"}}>
                      <div style={{textAlign:"center"}}>
                        <div style={{fontSize:10,color:T.muted,marginBottom:2}}>ODD</div>
                        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:32,fontWeight:800,color:T.gold}}>{luckyBet.odd?.toFixed(2)}</div>
                      </div>
                      <div style={{textAlign:"center"}}>
                        <div style={{fontSize:10,color:T.muted,marginBottom:2}}>PROB. REAL</div>
                        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:28,fontWeight:800,color:T.green}}>{luckyBet.prob}%</div>
                      </div>
                      <div style={{textAlign:"center"}}>
                        <div style={{fontSize:10,color:T.muted,marginBottom:2}}>EV</div>
                        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:28,fontWeight:800,color:T.green}}>+{luckyBet.ev}</div>
                      </div>
                    </div>
                  </div>
                  <div style={{marginTop:12,padding:"9px 14px",background:"rgba(245,166,35,0.08)",borderRadius:10,fontSize:12,color:T.gold}}>
                    💡 <strong>Por que é lucrativa:</strong> A odd {luckyBet.odd?.toFixed(2)} implica probabilidade de {(100/luckyBet.odd).toFixed(0)}%, mas nosso modelo estima {luckyBet.prob}% de chance real — uma diferença de +{(luckyBet.prob-100/luckyBet.odd).toFixed(0)}pp que representa valor real.
                    <span style={{color:T.muted}}> Aposte apenas o que está disposto a perder.</span>
                  </div>
                </div>
              )}

              {!scanning&&scanResults.length>0&&(
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14,flexWrap:"wrap"}}>
                    <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:16,fontWeight:700,color:T.text}}>{scanResults.length} jogos analisados · {fmtBR(scanDate)}</div>
                    {hotGames.length>0&&<Pill color={T.green}>{hotGames.length} com valor ≥{alertThreshold}</Pill>}
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:10}}>
                    {scanResults.map((r,i)=>{
                      const f=r.fixture;
                      const kt=new Date(f.utcDate).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});
                      const hasValue=r.valueScore>=alertThreshold;
                      const isTop=i===0&&hasValue;
                      return(
                        <Card key={i} style={{border:`1px solid ${isTop?T.borderG:hasValue?"rgba(56,211,159,0.12)":T.border}`,background:isTop?`linear-gradient(135deg,rgba(56,211,159,0.04),${T.card})`:T.card,padding:"14px 18px"}}>
                          <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
                            <div style={{fontSize:18,flexShrink:0}}>{r.league?.flag||"⚽"}</div>
                            <div style={{flex:1,minWidth:160}}>
                              <div style={{fontSize:10,color:T.muted,marginBottom:3}}>{r.league?.name} · ⏰ {kt}</div>
                              <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                                {f.homeTeam?.crest&&<img src={f.homeTeam.crest} alt="" style={{height:18}} onError={e=>e.target.style.display="none"}/>}
                                <span style={{fontWeight:700,fontSize:13,color:T.text}}>{f.homeTeam?.name}</span>
                                <span style={{color:T.muted,fontSize:11}}>vs</span>
                                {f.awayTeam?.crest&&<img src={f.awayTeam.crest} alt="" style={{height:18}} onError={e=>e.target.style.display="none"}/>}
                                <span style={{fontWeight:700,fontSize:13,color:T.text}}>{f.awayTeam?.name}</span>
                              </div>
                              {r.bestMarkets.slice(0,2).map((m,j)=>(
                                <div key={j} style={{display:"inline-flex",alignItems:"center",gap:6,marginTop:5,marginRight:6,padding:"3px 9px",background:T.greenDim,border:"1px solid rgba(56,211,159,0.2)",borderRadius:6}}>
                                  <span style={{fontSize:10,color:T.green,fontWeight:600}}>{m.name}</span>
                                  <span style={{fontSize:10,color:T.gold,fontFamily:"'Barlow Condensed',sans-serif"}}>@{m.odd.toFixed(2)} EV+{m.ev}</span>
                                </div>
                              ))}
                            </div>
                            <div style={{textAlign:"center",minWidth:55}}>
                              <div style={{fontSize:9,color:T.muted,marginBottom:2}}>Score</div>
                              <div style={{fontSize:24,fontWeight:800,color:hasValue?T.green:T.muted,fontFamily:"'Barlow Condensed',sans-serif"}}>{r.valueScore}</div>
                            </div>
                            <div style={{display:"flex",gap:6,flexShrink:0}}>
                              <button onClick={()=>{setSelFix(f);setSelLeague(r.league||LEAGUES[0]);setSelDate(scanDate);setAnalysis({fixture:f,hs:r.hs,as_:r.as_,markets:r.markets,hasOdds:r.hasOdds});setTab("analise");}} style={{padding:"7px 13px",background:T.greenDim,border:`1px solid ${T.borderG}`,borderRadius:8,color:T.green,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif"}}>📊 Analisar</button>
                              {r.bestMarkets[0]&&<button onClick={()=>addBet(r.bestMarkets[0],null,f)} style={{padding:"7px 12px",background:T.goldDim,border:"1px solid rgba(245,166,35,0.3)",borderRadius:8,color:T.gold,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif"}}>+ Apostar</button>}
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
              {!scanning&&scanResults.length===0&&!scanErr&&(
                <div style={{textAlign:"center",padding:72,color:T.muted}}>
                  <div style={{fontSize:48,marginBottom:16}}>🔥</div>
                  <div style={{fontSize:15,fontWeight:600,color:T.dim,marginBottom:8}}>Pronto para escanear</div>
                  <div style={{fontSize:12}}>{scanMode==="auto"?"Vai analisar jogos de todas as 9 ligas — pode demorar alguns minutos":"Selecione a liga e clique em Escanear"}</div>
                </div>
              )}
            </div>
            )}

            {/* ── SUB: BUSCAR POR DATA ── */}
            {jogosSubTab==="buscar"&&(
            <div>
              <h2 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:22,fontWeight:800,color:T.text,margin:"0 0 16px"}}>🔍 Buscar Jogos</h2>
              <Card style={{marginBottom:18}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16,flexWrap:"wrap"}}>
                  <button onClick={()=>{const d=new Date(selDate);d.setDate(d.getDate()-1);setSelDate(d);}} style={{width:32,height:32,borderRadius:8,background:"rgba(255,255,255,0.05)",border:`1px solid ${T.border}`,color:T.text,cursor:"pointer",fontSize:18}}>‹</button>
                  <button onClick={()=>setShowCal(true)} style={{padding:"8px 16px",background:T.greenDim,border:`1px solid ${T.borderG}`,borderRadius:10,color:T.green,fontSize:13,fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif",cursor:"pointer",display:"flex",alignItems:"center",gap:8}}>📅 {fmtBR(selDate)}{fmtISO(selDate)===fmtISO(nowDate())&&<Pill color={T.gold} size={9}>Hoje</Pill>}</button>
                  <button onClick={()=>{const d=new Date(selDate);d.setDate(d.getDate()+1);setSelDate(d);}} style={{width:32,height:32,borderRadius:8,background:"rgba(255,255,255,0.05)",border:`1px solid ${T.border}`,color:T.text,cursor:"pointer",fontSize:18}}>›</button>
                  <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                    {[["Ontem",-1],["Hoje",0],["Amanhã",1],["+3d",3],["+7d",7]].map(([lb,off])=>{const d=new Date();d.setDate(d.getDate()+off);const active=fmtISO(d)===fmtISO(selDate);return<button key={lb} onClick={()=>setSelDate(d)} style={{padding:"5px 10px",background:active?T.greenDim:"rgba(255,255,255,0.03)",border:`1px solid ${active?T.borderG:T.border}`,borderRadius:7,color:active?T.green:T.muted,fontSize:11,fontWeight:active?700:400,cursor:"pointer"}}>{lb}</button>;})}
                  </div>
                </div>
                <div style={{fontSize:11,color:T.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Liga:</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:16}}>
                  {LEAGUES.map(l=><button key={l.code} onClick={()=>setSelLeague(l)} style={{padding:"6px 12px",background:selLeague.code===l.code?T.greenDim:"rgba(255,255,255,0.03)",border:`1px solid ${selLeague.code===l.code?T.borderG:T.border}`,borderRadius:8,cursor:"pointer",color:selLeague.code===l.code?T.green:T.dim,fontSize:11,fontWeight:selLeague.code===l.code?700:400,transition:"all 0.2s"}}>{l.flag} {l.name}</button>)}
                </div>
                <button onClick={loadFixtures} disabled={loadingFix} style={{padding:"10px 24px",background:loadingFix?T.card2:T.greenDim,border:`1px solid ${loadingFix?T.border:T.borderG}`,borderRadius:10,color:loadingFix?T.muted:T.green,fontSize:13,fontWeight:800,fontFamily:"'Barlow Condensed',sans-serif",cursor:loadingFix?"not-allowed":"pointer",opacity:loadingFix?0.6:1}}>
                  {loadingFix?"Buscando...":`🔍 Buscar — ${fmtBR(selDate)}`}
                </button>
              </Card>
              {err&&<div style={{background:T.redDim,border:"1px solid rgba(255,83,112,0.3)",borderRadius:12,padding:"14px 18px",color:T.red,marginBottom:16,fontSize:13}}>{err}</div>}
              {loadingFix&&<Spinner/>}
              {!loadingFix&&fixtures.length>0&&(
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {fixtures.map((f,i)=>{
                    const kt=new Date(f.utcDate).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});
                    const live=["IN_PLAY","LIVE","PAUSED"].includes(f.status);
                    const fin=f.status==="FINISHED";
                    return(
                      <Card key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"13px 16px",gap:12}}>
                        <div style={{display:"flex",alignItems:"center",gap:12,flex:1}}>
                          <div style={{textAlign:"center",minWidth:52}}>{live&&<div style={{fontSize:10,fontWeight:800,color:T.red}}>🔴 LIVE</div>}{fin&&<div style={{fontSize:10,color:T.muted}}>FIM</div>}{!live&&!fin&&<div style={{fontSize:13,fontWeight:700,color:T.gold,fontFamily:"'Barlow Condensed',sans-serif"}}>{kt}</div>}<div style={{fontSize:9,color:T.muted,marginTop:2}}>{f.matchday?`R${f.matchday}`:""}</div></div>
                          <div style={{display:"flex",alignItems:"center",gap:10,flex:1}}>
                            <div style={{textAlign:"right",flex:1}}>{f.homeTeam?.crest&&<img src={f.homeTeam.crest} alt="" style={{height:22,display:"block",marginLeft:"auto",marginBottom:3}} onError={e=>e.target.style.display="none"}/>}<div style={{fontSize:13,fontWeight:700,color:T.text}}>{f.homeTeam?.name}</div></div>
                            {f.score?.fullTime?.home!=null?<div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:22,fontWeight:800,color:T.gold,minWidth:52,textAlign:"center"}}>{f.score.fullTime.home}–{f.score.fullTime.away}</div>:<div style={{fontSize:12,color:T.muted,minWidth:52,textAlign:"center"}}>VS</div>}
                            <div style={{flex:1}}>{f.awayTeam?.crest&&<img src={f.awayTeam.crest} alt="" style={{height:22,display:"block",marginBottom:3}} onError={e=>e.target.style.display="none"}/>}<div style={{fontSize:13,fontWeight:700,color:T.text}}>{f.awayTeam?.name}</div></div>
                          </div>
                        </div>
                        <button onClick={()=>loadAnalysis(f)} style={{padding:"8px 16px",background:T.greenDim,border:`1px solid ${T.borderG}`,borderRadius:9,color:T.green,fontSize:11,fontWeight:800,fontFamily:"'Barlow Condensed',sans-serif",cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>📊 Analisar</button>
                      </Card>
                    );
                  })}
                </div>
              )}
              {!loadingFix&&fixtures.length===0&&!err&&<div style={{textAlign:"center",padding:60,color:T.muted}}><div style={{fontSize:44,marginBottom:16}}>📅</div><div>Selecione uma liga e clique em "Buscar"</div></div>}
            </div>
            )}

            {/* ── SUB: AGENDA ── */}
            {jogosSubTab==="agenda"&&(
            <div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12,marginBottom:16}}>
                <h2 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:22,fontWeight:800,color:T.text,margin:0}}>📅 Agenda — Próximos 7 dias</h2>
                <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
                  <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                    {LEAGUES.map(l=>{const sel=agendaLeagues.includes(l.code);return<button key={l.code} onClick={()=>setAgendaLeagues(p=>sel?p.filter(c=>c!==l.code):[...p,l.code])} style={{padding:"5px 10px",background:sel?T.blueDim:"rgba(255,255,255,0.03)",border:`1px solid ${sel?"rgba(78,201,240,0.35)":T.border}`,borderRadius:7,cursor:"pointer",color:sel?T.blue:T.dim,fontSize:10,fontWeight:sel?700:400}}>{l.flag}</button>;})}
                  </div>
                  <button onClick={loadAgenda} disabled={loadingAgenda||!agendaLeagues.length} style={{padding:"8px 16px",background:T.blueDim,border:"1px solid rgba(78,201,240,0.35)",borderRadius:9,color:T.blue,fontSize:12,fontWeight:800,fontFamily:"'Barlow Condensed',sans-serif",cursor:loadingAgenda?"not-allowed":"pointer",opacity:loadingAgenda?0.6:1}}>
                    {loadingAgenda?"Carregando...":"📅 Carregar"}
                  </button>
                </div>
              </div>
              {loadingAgenda&&<Spinner label="Buscando jogos dos próximos 7 dias..."/>}
              {!loadingAgenda&&Object.keys(agendaByDay).length===0&&<div style={{textAlign:"center",padding:60,color:T.muted}}><div style={{fontSize:44,marginBottom:16}}>📅</div><div>Selecione as ligas e clique em "Carregar"</div></div>}
              {!loadingAgenda&&Object.keys(agendaByDay).length>0&&(
                <div style={{display:"flex",flexDirection:"column",gap:18}}>
                  {Object.entries(agendaByDay).map(([ds,matches])=>{
                    const d=new Date(ds+"T12:00:00");
                    const isToday=ds===fmtISO(nowDate());
                    const isTomorrow=ds===fmtISO(new Date(Date.now()+86400000));
                    return(
                      <div key={ds}>
                        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,fontWeight:800,color:isToday?T.green:isTomorrow?T.gold:T.text}}>{isToday?"HOJE":isTomorrow?"AMANHÃ":d.toLocaleDateString("pt-BR",{weekday:"long",day:"2-digit",month:"2-digit"}).toUpperCase()}</div>
                          <div style={{height:1,flex:1,background:isToday?`rgba(56,211,159,0.2)`:T.border}}/>
                          <Pill color={isToday?T.green:isTomorrow?T.gold:T.muted} size={9}>{matches.length} jogos</Pill>
                        </div>
                        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:7}}>
                          {matches.map((m,i)=>{
                            const kt=new Date(m.utcDate).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});
                            const fin=m.status==="FINISHED";
                            return(
                              <Card key={i} style={{padding:"10px 14px",cursor:"pointer"}} onClick={()=>{setSelLeague(LEAGUES.find(l=>l.name===m.leagueName)||LEAGUES[0]);setSelDate(new Date(m.utcDate));setJogosSubTab("buscar");}}>
                                <div style={{display:"flex",alignItems:"center",gap:8}}>
                                  <div style={{minWidth:38,textAlign:"center"}}>{fin?<div style={{fontSize:9,color:T.muted}}>FIM</div>:<div style={{fontSize:12,fontWeight:700,color:T.gold}}>{kt}</div>}<div style={{fontSize:11}}>{m.leagueFlag}</div></div>
                                  <div style={{flex:1}}>
                                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                                      {m.homeTeam?.crest&&<img src={m.homeTeam.crest} alt="" style={{height:16}} onError={e=>e.target.style.display="none"}/>}
                                      <span style={{fontSize:11,fontWeight:600,color:T.text}}>{m.homeTeam?.name}</span>
                                      {m.score?.fullTime?.home!=null?<span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,fontWeight:800,color:T.gold,margin:"0 4px"}}>{m.score.fullTime.home}–{m.score.fullTime.away}</span>:<span style={{fontSize:10,color:T.muted,margin:"0 4px"}}>vs</span>}
                                      {m.awayTeam?.crest&&<img src={m.awayTeam.crest} alt="" style={{height:16}} onError={e=>e.target.style.display="none"}/>}
                                      <span style={{fontSize:11,fontWeight:600,color:T.text}}>{m.awayTeam?.name}</span>
                                    </div>
                                  </div>
                                </div>
                              </Card>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            )}
          </div>
        )}

        {/* ══ ANÁLISE + IA ══ */}
        {(tab==="analise"||tab==="ia")&&(
          <div>
            {/* Progress Bar */}
            {(loadingAna||loadingGpt)&&(
              <div style={{padding:"40px 24px",textAlign:"center"}}>
                <div style={{fontSize:36,marginBottom:16}}>
                  {anaStep===1?"📡":anaStep===2?"📊":anaStep===3?"🤖":"⏳"}
                </div>
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:18,fontWeight:700,color:T.text,marginBottom:6}}>
                  {anaStep===1?"Buscando dados do time da casa...":anaStep===2?"Buscando dados do visitante...":anaStep===3?"Claude analisando o jogo...":"Processando..."}
                </div>
                <div style={{fontSize:12,color:T.muted,marginBottom:20}}>
                  {anaStep===3?"Inteligência artificial gerando recomendações personalizadas":"Consultando Football-Data.org"}
                </div>
                {/* Barra de progresso */}
                <div style={{maxWidth:400,margin:"0 auto"}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                    {[["1","📡","Dados Casa"],["2","📊","Dados Visit."],["3","🤖","Análise IA"],["4","✅","Pronto"]].map(([step,icon,label])=>{
                      const s=Number(step);
                      const done=anaStep>s||(s===4&&!loadingAna&&!loadingGpt);
                      const active=anaStep===s||(s===4&&loadingGpt);
                      return(
                        <div key={step} style={{textAlign:"center",flex:1}}>
                          <div style={{width:36,height:36,borderRadius:"50%",margin:"0 auto 4px",display:"flex",alignItems:"center",justifyContent:"center",background:done?T.greenDim:active?"rgba(56,211,159,0.2)":"rgba(255,255,255,0.04)",border:`2px solid ${done||active?T.borderG:T.border}`,fontSize:16,transition:"all 0.4s"}}>{done?"✓":icon}</div>
                          <div style={{fontSize:9,color:done||active?T.green:T.muted,fontWeight:done||active?700:400}}>{label}</div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{background:"rgba(255,255,255,0.06)",borderRadius:4,height:5,overflow:"hidden",marginTop:4}}>
                    <div style={{width:`${anaStep===1?15:anaStep===2?40:anaStep===3?75:100}%`,height:"100%",background:`linear-gradient(90deg,${T.green},rgba(56,211,159,0.6))`,borderRadius:4,transition:"width 0.6s ease",boxShadow:`0 0 8px ${T.green}44`}}/>
                  </div>
                </div>
              </div>
            )}

            {err&&!loadingAna&&<div style={{background:T.redDim,border:"1px solid rgba(255,83,112,0.3)",borderRadius:12,padding:"14px 18px",color:T.red,marginBottom:16,fontSize:13}}>{err}</div>}
            {gptErr&&!loadingGpt&&<div style={{background:T.redDim,border:"1px solid rgba(255,83,112,0.3)",borderRadius:12,padding:"14px 18px",color:T.red,marginBottom:16,fontSize:13}}>{gptErr} <button onClick={runGpt} style={{marginLeft:10,padding:"4px 10px",background:"rgba(255,83,112,0.15)",border:"1px solid rgba(255,83,112,0.3)",borderRadius:6,color:T.red,fontSize:11,cursor:"pointer"}}>Tentar novamente</button></div>}

            {!loadingAna&&!analysis&&!err&&(
              <div style={{textAlign:"center",padding:72,color:T.muted}}>
                <div style={{fontSize:52,marginBottom:16}}>🔬</div>
                <div style={{fontSize:16,fontWeight:600,color:T.dim,marginBottom:8}}>Selecione um jogo para analisar</div>
                <div style={{fontSize:13}}>Vá em "Jogos → Buscar" ou use o Scanner e clique em "Analisar".</div>
              </div>
            )}

            {!loadingAna&&analysis&&!loadingGpt&&(()=>{
              const{fixture:f,hs,as_,markets,hasOdds}=analysis;
              const kt=new Date(f.utcDate).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});
              return(
                <div>
                  {/* ── HEADER COMPACTO ── */}
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12,marginBottom:20}}>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      {f.homeTeam?.crest&&<img src={f.homeTeam.crest} alt="" style={{height:34}} onError={e=>e.target.style.display="none"}/>}
                      <div>
                        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:22,fontWeight:800,color:T.text}}>{f.homeTeam?.name} <span style={{color:T.muted,fontSize:16}}>vs</span> {f.awayTeam?.name}</div>
                        <div style={{fontSize:11,color:T.muted,marginTop:3}}>{selLeague.flag} {selLeague.name} · {fmtBR(selDate)} às {kt} · {hasOdds?<span style={{color:T.green}}>✓ Odds reais</span>:<span style={{color:T.gold}}>Odds estimadas</span>}</div>
                      </div>
                      {f.awayTeam?.crest&&<img src={f.awayTeam.crest} alt="" style={{height:34}} onError={e=>e.target.style.display="none"}/>}
                    </div>
                    {/* Botão expandir dados brutos */}
                    <button onClick={()=>setShowRawData(v=>!v)} style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",background:"rgba(255,255,255,0.04)",border:`1px solid ${T.border}`,borderRadius:9,cursor:"pointer",color:T.muted,fontSize:11,fontWeight:600,transition:"all 0.2s"}}>
                      {showRawData?"▲ Ocultar dados":"▼ Ver dados brutos"}
                    </button>
                  </div>

                  {/* ── DADOS BRUTOS (expansível) ── */}
                  {showRawData&&(
                    <div style={{marginBottom:24,padding:18,background:"rgba(255,255,255,0.02)",borderRadius:14,border:`1px solid ${T.border}`}}>
                      {hs&&as_&&(
                        <div style={{marginBottom:16}}>
                          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:14,color:T.text,marginBottom:10}}>📊 Estatísticas Comparativas</div>
                          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                            {[["Gols/J",hs.goalsFor.toFixed(2),as_.goalsFor.toFixed(2)],["Sofridos/J",hs.goalsAgainst.toFixed(2),as_.goalsAgainst.toFixed(2)],["PPG",hs.ppg.toFixed(2),as_.ppg.toFixed(2)],["Vitórias%",hs.winRateHome+"%",as_.winRateAway+"% (fora)"],["BTTS",hs.btts+"%",as_.btts+"%"],["Jogos",hs.played,as_.played]].map(([l,h,a])=>(
                              <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 10px",background:"rgba(255,255,255,0.025)",borderRadius:8,border:`1px solid ${T.border}`}}>
                                <span style={{fontSize:11,color:T.muted}}>{l}</span>
                                <div style={{display:"flex",gap:8}}><span style={{fontSize:12,fontWeight:700,color:T.green}}>{h}</span><span style={{fontSize:10,color:T.muted}}>vs</span><span style={{fontSize:12,fontWeight:700,color:T.blue}}>{a}</span></div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:14,color:T.text,marginBottom:8}}>🎯 Todos os Mercados</div>
                      <div style={{display:"grid",gridTemplateColumns:"195px 1fr 85px 75px 75px 115px 36px",gap:8,padding:"0 12px 6px",borderBottom:`1px solid ${T.border}`,marginBottom:5}}>
                        {["Mercado","Score","Prob.","Odd","EV","Recomendação",""].map(h=><div key={h} style={{fontSize:9,color:T.muted,textTransform:"uppercase",letterSpacing:1}}>{h}</div>)}
                      </div>
                      <div style={{display:"flex",flexDirection:"column",gap:4}}>
                        {markets.map((m,i)=><MarketCard key={i} m={m} i={i} onRegister={(mk,stake)=>addBet(mk,stake,f)} onAddCombinada={(mk)=>setCombinadas(prev=>{const exists=prev.find(c=>c.marketId===`${f.homeTeam?.id}-${mk.name}`);if(exists)return prev.filter(c=>c.marketId!==`${f.homeTeam?.id}-${mk.name}`);return[...prev,{marketId:`${f.homeTeam?.id}-${mk.name}`,match:`${f.homeTeam?.name} x ${f.awayTeam?.name}`,market:mk.name,odd:mk.odd,prob:mk.prob,ev:mk.ev,league:selLeague.name,leagueFlag:selLeague.flag}];})} isInCombinada={!!combinadas.find(c=>c.marketId===`${f.homeTeam?.id}-${m.name}`)} bankroll={bankroll} currency={currency} strategy={preferredStrategy}/>)}
                      </div>
                    </div>
                  )}

                  {/* ── ANÁLISE CLAUDE ── */}
                  {!gptAnalysis&&!gptErr&&(
                    <div style={{textAlign:"center",padding:40,color:T.muted}}>
                      <div style={{fontSize:32,marginBottom:12}}>🤖</div>
                      <div style={{fontSize:14}}>Análise Claude em andamento...</div>
                    </div>
                  )}

                  {gptAnalysis&&(
                    <div style={{display:"flex",flexDirection:"column",gap:14}}>

                      {/* ── APOSTAS PRINCIPAIS — destaque máximo ── */}
                      <div style={{display:"grid",gridTemplateColumns:gptAnalysis.segunda_opcao?"1fr 1fr":"1fr",gap:14}}>
                        <div style={{padding:"20px 22px",background:"linear-gradient(135deg,rgba(56,211,159,0.12),rgba(12,16,24,1))",border:`2px solid ${T.borderG}`,borderRadius:16}}>
                          <div style={{fontSize:10,color:T.green,textTransform:"uppercase",letterSpacing:2,marginBottom:6}}>🏆 Aposta Principal</div>
                          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:26,fontWeight:800,color:T.text,marginBottom:10}}>{gptAnalysis.aposta_principal}</div>
                          <div style={{fontSize:13,color:T.text,lineHeight:1.7}}>{gptAnalysis.aposta_justificativa}</div>
                        </div>
                        {gptAnalysis.segunda_opcao&&(
                          <div style={{padding:"20px 22px",background:"linear-gradient(135deg,rgba(78,201,240,0.08),rgba(12,16,24,1))",border:"1px solid rgba(78,201,240,0.3)",borderRadius:16}}>
                            <div style={{fontSize:10,color:T.blue,textTransform:"uppercase",letterSpacing:2,marginBottom:6}}>🥈 Segunda Opção</div>
                            <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:26,fontWeight:800,color:T.text,marginBottom:10}}>{gptAnalysis.segunda_opcao}</div>
                            <div style={{fontSize:13,color:T.text,lineHeight:1.7}}>{gptAnalysis.segunda_opcao_justificativa}</div>
                          </div>
                        )}
                      </div>

                      {/* ── PERFIL + PLACAR ── */}
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                        <Card style={{background:"linear-gradient(135deg,rgba(245,166,35,0.06),rgba(12,16,24,1))"}}>
                          <div style={{fontSize:10,color:T.muted,marginBottom:6}}>PLACAR MAIS PROVÁVEL</div>
                          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:48,fontWeight:800,color:T.gold,marginBottom:8}}>{gptAnalysis.placar_provavel}</div>
                          <div style={{fontSize:12,color:T.text,lineHeight:1.6}}>{gptAnalysis.placar_justificativa}</div>
                        </Card>
                        <Card>
                          <div style={{fontSize:10,color:T.muted,marginBottom:8}}>PERFIL DO JOGO</div>
                          {gptAnalysis.perfil_jogo&&<div style={{display:"inline-flex",alignItems:"center",marginBottom:12,padding:"5px 14px",background:"rgba(78,201,240,0.1)",border:"1px solid rgba(78,201,240,0.25)",borderRadius:20}}><span style={{fontSize:13,fontWeight:700,color:T.blue}}>{gptAnalysis.perfil_jogo}</span></div>}
                          <div style={{fontSize:13,color:T.text,lineHeight:1.7}}>{gptAnalysis.resumo}</div>
                        </Card>
                      </div>

                      {/* ── ANÁLISE DOS TIMES ── */}
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                        <Card><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:14,color:T.green,marginBottom:8}}>🏠 {f.homeTeam?.name}</div><div style={{fontSize:13,color:T.text,lineHeight:1.7}}>{gptAnalysis.analise_casa}</div></Card>
                        <Card><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:14,color:T.blue,marginBottom:8}}>✈️ {f.awayTeam?.name}</div><div style={{fontSize:13,color:T.text,lineHeight:1.7}}>{gptAnalysis.analise_visitante}</div></Card>
                      </div>

                      {/* ── ESCANTEIOS ── */}
                      {gptAnalysis.escanteios_previsao&&(
                        <Card style={{border:"1px solid rgba(78,201,240,0.2)"}}>
                          <div style={{display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
                            <div style={{textAlign:"center",padding:"10px 16px",background:"rgba(78,201,240,0.08)",borderRadius:10}}>
                              <div style={{fontSize:10,color:T.muted,marginBottom:3}}>🔲 ESCANTEIOS</div>
                              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:28,fontWeight:800,color:T.blue}}>{gptAnalysis.escanteios_previsao}</div>
                            </div>
                            <div style={{flex:1}}>
                              <div style={{fontSize:13,color:T.text,lineHeight:1.7,marginBottom:8}}>{gptAnalysis.escanteios_analise}</div>
                              {gptAnalysis.escanteios_aposta&&<div style={{padding:"6px 12px",background:T.greenDim,border:`1px solid ${T.borderG}`,borderRadius:8,display:"inline-flex",gap:8,fontSize:12}}><span style={{color:T.muted}}>Melhor aposta:</span><span style={{fontWeight:700,color:T.green}}>{gptAnalysis.escanteios_aposta}</span></div>}
                            </div>
                          </div>
                        </Card>
                      )}

                      {/* ── ANÁLISE DE RISCO ── */}
                      {gptAnalysis.mercados?.length>0&&(
                        <Card>
                          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:14,color:T.text,marginBottom:12}}>🎯 Análise de Risco por Mercado</div>
                          <div style={{display:"flex",flexDirection:"column",gap:6}}>
                            {gptAnalysis.mercados.map((m,i)=>{
                              const rc={APOSTAR:T.green,ANALISAR:T.gold,EVITAR:T.red}[m.recomendacao]||T.muted;
                              const riskC={Baixo:T.green,Médio:T.gold,Alto:T.red}[m.risco]||T.muted;
                              return(
                                <div key={i} style={{padding:"10px 13px",background:"rgba(255,255,255,0.02)",borderRadius:10,border:`1px solid ${T.border}`}}>
                                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}>
                                    <span style={{fontWeight:700,fontSize:13,color:T.text}}>{m.nome}</span>
                                    <Pill color={rc} size={10}>{m.recomendacao}</Pill>
                                    <Pill color={riskC} size={10}>Risco {m.risco}</Pill>
                                    <span style={{marginLeft:"auto",fontFamily:"'Barlow Condensed',sans-serif",fontSize:16,fontWeight:800,color:rc}}>{m.confianca}/10</span>
                                  </div>
                                  <div style={{fontSize:12,color:T.dim,lineHeight:1.6}}>{m.justificativa}</div>
                                </div>
                              );
                            })}
                          </div>
                        </Card>
                      )}

                      {/* ── ALERTAS + CONCLUSÃO ── */}
                      {gptAnalysis.alertas?.length>0&&(
                        <Card style={{border:"1px solid rgba(245,166,35,0.25)"}}>
                          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:14,color:T.gold,marginBottom:10}}>⚠️ Alertas</div>
                          {gptAnalysis.alertas.map((a,i)=><div key={i} style={{display:"flex",gap:8,padding:"5px 0",borderBottom:i<gptAnalysis.alertas.length-1?`1px solid ${T.border}`:"none"}}><span style={{color:T.gold}}>▸</span><span style={{fontSize:12,color:T.dim}}>{a}</span></div>)}
                        </Card>
                      )}
                      <Card style={{background:"linear-gradient(135deg,rgba(192,132,252,0.05),rgba(12,16,24,1))",border:"1px solid rgba(192,132,252,0.15)"}}>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                          <span style={{fontSize:16}}>🤖</span>
                          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:14,color:T.purple}}>Conclusão do Claude</div>
                        </div>
                        <div style={{fontSize:13,color:T.text,lineHeight:1.8}}>{gptAnalysis.conclusao}</div>
                      </Card>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* ══ COMBINADAS ══ */}
        {tab==="combinadas"&&(()=>{
          const combOdd=combinadas.reduce((acc,c)=>acc*c.odd,1);
          const combProb=combinadas.reduce((acc,c)=>acc*(c.prob/100),1)*100;
          const combEV=(combProb/100)*combOdd-1;
          const sugStake=Math.max(0,(combProb/100*(combOdd-1)-(1-combProb/100))/(combOdd-1));
          const sugVal=+(bankroll*Math.min(sugStake,0.03)).toFixed(2);

          const analisarCombinada=async()=>{
            if(!gptKey){setCombErr("Configure a chave Anthropic em Mais → Perfil.");return;}
            if(combinadas.length<2){setCombErr("Adicione pelo menos 2 seleções.");return;}
            setLoadingComb(true);setCombErr("");setCombAnalysis(null);
            const sels=combinadas.map(c=>`• ${c.match} — ${c.market} @ ${c.odd?.toFixed(2)} (Prob ${c.prob}%, EV ${c.ev>0?"+":""}${c.ev})`).join("\n");
            const prompt=`Você é analista profissional de apostas. Analise esta aposta combinada e responda APENAS JSON válido.

SELEÇÕES (${combinadas.length} jogos):
${sels}

ODD COMBINADA: ${combOdd.toFixed(2)} | PROB. COMBINADA: ${combProb.toFixed(1)}% | EV COMBINADO: ${combEV>0?"+":""}${combEV.toFixed(3)}

{"viabilidade":"Alta/Média/Baixa","resumo":"análise geral da combinada em 2-3 frases","analise_selecoes":[{"selecao":"nome do jogo - mercado","avaliacao":"FORTE/OK/FRACA","justificativa":"por que esta seleção é boa ou ruim"}],"elo_fraco":"qual seleção representa maior risco e por que","odd_justa":"odd que refletiria as probabilidades reais, ex: 4.20","value_assessment":"se há valor real nesta combinada","stake_sugerido":"% da banca recomendada (ex: 1-2%)","alertas":["risco específico"],"recomendacao":"APOSTAR/ANALISAR/EVITAR","conclusao":"conselho final direto"}`;
            try{
              const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":gptKey,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({model:"claude-haiku-4-5-20251001",max_tokens:1500,messages:[{role:"user",content:prompt},{role:"assistant",content:"{"}]})});
              const data=await r.json();
              const text=data.content?.[0]?.text||"";
              setCombAnalysis(JSON.parse(("{"+text).replace(/```json|```/g,"").trim()));
            }catch(e){setCombErr("Erro IA: "+e.message);}
            finally{setLoadingComb(false);}
          };

          const registrarCombinada=()=>{
            if(!combinadas.length)return;
            const nova={id:Date.now(),selecoes:combinadas,odd:combOdd,prob:combProb,ev:combEV,stake:sugVal,result:"PENDENTE",date:fmtISO(nowDate())};
            const updated=[nova,...combLog];
            saveCombLog(updated);
            setCombinadas([]);
          };

          return(
          <div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:12}}>
              <div>
                <h2 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:24,fontWeight:800,color:T.text,margin:"0 0 4px"}}>🎰 Apostas Combinadas</h2>
                <p style={{color:T.muted,fontSize:12,margin:0}}>Combine múltiplos jogos — o Claude analisa a viabilidade da combinada.</p>
              </div>
              {combinadas.length>=2&&<button onClick={registrarCombinada} style={{padding:"10px 20px",background:T.greenDim,border:`1px solid ${T.borderG}`,borderRadius:10,color:T.green,fontSize:13,fontWeight:800,fontFamily:"'Barlow Condensed',sans-serif",cursor:"pointer"}}>✅ Registrar Combinada</button>}
            </div>

            {/* Seleções atuais */}
            {combinadas.length===0?(
              <Card style={{textAlign:"center",padding:52}}>
                <div style={{fontSize:44,marginBottom:14}}>🎰</div>
                <div style={{fontSize:15,fontWeight:600,color:T.dim,marginBottom:8}}>Nenhuma seleção adicionada</div>
                <div style={{fontSize:12,color:T.muted}}>Vá em "Análise + IA", expanda um mercado com EV positivo e clique em "Adicionar à Combinada".</div>
              </Card>
            ):(
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                {/* Resumo da combinada */}
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
                  {[{l:"Seleções",v:combinadas.length,c:T.blue},{l:"Odd Total",v:combOdd.toFixed(2),c:T.gold},{l:"Prob. Real",v:combProb.toFixed(1)+"%",c:combProb>20?T.green:T.red},{l:"EV",v:(combEV>0?"+":"")+combEV.toFixed(3),c:combEV>0?T.green:T.red}].map(({l,v,c})=>(
                    <Card key={l} glow={combEV>0}>
                      <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>{l}</div>
                      <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:26,fontWeight:800,color:c}}>{v}</div>
                    </Card>
                  ))}
                </div>

                {/* Lista de seleções */}
                <Card>
                  <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:15,color:T.text,marginBottom:12}}>📋 Seleções</div>
                  <div style={{display:"flex",flexDirection:"column",gap:7}}>
                    {combinadas.map((c,i)=>(
                      <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:"rgba(255,255,255,0.02)",borderRadius:10,border:`1px solid ${T.border}`}}>
                        <span style={{fontSize:16}}>{c.leagueFlag}</span>
                        <div style={{flex:1}}>
                          <div style={{fontSize:12,color:T.muted,marginBottom:2}}>{c.match}</div>
                          <div style={{fontSize:13,fontWeight:700,color:T.text}}>{c.market}</div>
                        </div>
                        <div style={{textAlign:"center",minWidth:50}}>
                          <div style={{fontSize:9,color:T.muted}}>ODD</div>
                          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:20,fontWeight:800,color:T.gold}}>{c.odd?.toFixed(2)}</div>
                        </div>
                        <div style={{textAlign:"center",minWidth:50}}>
                          <div style={{fontSize:9,color:T.muted}}>PROB</div>
                          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:18,fontWeight:700,color:T.green}}>{c.prob}%</div>
                        </div>
                        <button onClick={()=>setCombinadas(prev=>prev.filter((_,j)=>j!==i))} style={{background:"rgba(255,83,112,0.1)",border:"1px solid rgba(255,83,112,0.2)",borderRadius:7,padding:"4px 9px",color:T.red,fontSize:11,cursor:"pointer"}}>✕</button>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Stake sugerido */}
                <Card style={{background:"linear-gradient(135deg,rgba(56,211,159,0.05),rgba(12,16,24,1))"}}>
                  <div style={{display:"flex",alignItems:"center",gap:20,flexWrap:"wrap"}}>
                    <div>
                      <div style={{fontSize:10,color:T.muted,marginBottom:4}}>STAKE SUGERIDO (Kelly)</div>
                      <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:28,fontWeight:800,color:T.green}}>{currency.symbol} {sugVal.toFixed(2)}</div>
                      <div style={{fontSize:11,color:T.muted,marginTop:2}}>{(sugVal/bankroll*100).toFixed(1)}% da banca</div>
                    </div>
                    <div style={{flex:1,textAlign:"center"}}>
                      <div style={{fontSize:10,color:T.muted,marginBottom:4}}>RETORNO POTENCIAL</div>
                      <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:28,fontWeight:800,color:T.gold}}>{currency.symbol} {(sugVal*combOdd).toFixed(2)}</div>
                    </div>
                    <button onClick={analisarCombinada} disabled={loadingComb} style={{padding:"12px 24px",background:"rgba(192,132,252,0.15)",border:"1px solid rgba(192,132,252,0.4)",borderRadius:10,color:T.purple,fontSize:13,fontWeight:800,fontFamily:"'Barlow Condensed',sans-serif",cursor:loadingComb?"not-allowed":"pointer",opacity:loadingComb?0.6:1}}>
                      {loadingComb?"🔄 Analisando...":"🤖 Analisar com Claude"}
                    </button>
                  </div>
                </Card>

                {combErr&&<div style={{background:T.redDim,border:"1px solid rgba(255,83,112,0.3)",borderRadius:12,padding:"14px 18px",color:T.red,fontSize:13}}>{combErr}</div>}
                {loadingComb&&<Spinner label="Claude analisando a viabilidade da combinada..."/>}

                {/* Análise Claude da combinada */}
                {combAnalysis&&(
                  <div style={{display:"flex",flexDirection:"column",gap:12}}>
                    {/* Veredicto */}
                    <div style={{padding:"20px 24px",background:combAnalysis.recomendacao==="APOSTAR"?"linear-gradient(135deg,rgba(56,211,159,0.12),rgba(12,16,24,1))":combAnalysis.recomendacao==="EVITAR"?"linear-gradient(135deg,rgba(255,83,112,0.1),rgba(12,16,24,1))":"linear-gradient(135deg,rgba(245,166,35,0.1),rgba(12,16,24,1))",border:`2px solid ${combAnalysis.recomendacao==="APOSTAR"?T.borderG:combAnalysis.recomendacao==="EVITAR"?"rgba(255,83,112,0.4)":"rgba(245,166,35,0.4)"}`,borderRadius:16}}>
                      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10,flexWrap:"wrap"}}>
                        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:28,fontWeight:800,color:combAnalysis.recomendacao==="APOSTAR"?T.green:combAnalysis.recomendacao==="EVITAR"?T.red:T.gold}}>{combAnalysis.recomendacao==="APOSTAR"?"✅":combAnalysis.recomendacao==="EVITAR"?"❌":"⚠️"} {combAnalysis.recomendacao}</div>
                        <Pill color={combAnalysis.viabilidade==="Alta"?T.green:combAnalysis.viabilidade==="Média"?T.gold:T.red}>Viabilidade {combAnalysis.viabilidade}</Pill>
                        {combAnalysis.odd_justa&&<div style={{fontSize:12,color:T.muted}}>Odd justa estimada: <span style={{color:T.gold,fontWeight:700}}>{combAnalysis.odd_justa}</span></div>}
                      </div>
                      <div style={{fontSize:13,color:T.text,lineHeight:1.7}}>{combAnalysis.resumo}</div>
                    </div>
                    {/* Análise por seleção */}
                    <Card>
                      <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:14,color:T.text,marginBottom:10}}>🔍 Análise por Seleção</div>
                      <div style={{display:"flex",flexDirection:"column",gap:7}}>
                        {combAnalysis.analise_selecoes?.map((s,i)=>{
                          const sc={FORTE:T.green,OK:T.gold,FRACA:T.red}[s.avaliacao]||T.muted;
                          return(<div key={i} style={{padding:"9px 12px",background:"rgba(255,255,255,0.02)",borderRadius:9,border:`1px solid ${T.border}`}}>
                            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}><span style={{fontSize:12,fontWeight:700,color:T.text,flex:1}}>{s.selecao}</span><Pill color={sc} size={10}>{s.avaliacao}</Pill></div>
                            <div style={{fontSize:12,color:T.dim,lineHeight:1.5}}>{s.justificativa}</div>
                          </div>);
                        })}
                      </div>
                    </Card>
                    {combAnalysis.elo_fraco&&<Card style={{border:"1px solid rgba(255,83,112,0.2)"}}><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:13,color:T.red,marginBottom:6}}>⚠️ Elo Mais Fraco</div><div style={{fontSize:12,color:T.text,lineHeight:1.6}}>{combAnalysis.elo_fraco}</div></Card>}
                    {combAnalysis.alertas?.length>0&&<Card style={{border:"1px solid rgba(245,166,35,0.2)"}}><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:13,color:T.gold,marginBottom:8}}>⚠️ Alertas</div>{combAnalysis.alertas.map((a,i)=><div key={i} style={{fontSize:12,color:T.dim,padding:"4px 0",borderBottom:i<combAnalysis.alertas.length-1?`1px solid ${T.border}`:"none"}}>▸ {a}</div>)}</Card>}
                    <Card style={{background:"linear-gradient(135deg,rgba(192,132,252,0.05),rgba(12,16,24,1))",border:"1px solid rgba(192,132,252,0.15)"}}><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:13,color:T.purple,marginBottom:6}}>🤖 Conclusão</div><div style={{fontSize:13,color:T.text,lineHeight:1.8}}>{combAnalysis.conclusao}</div></Card>
                  </div>
                )}
              </div>
            )}

            {/* Histórico de combinadas */}
            {combLog.length>0&&(
              <div style={{marginTop:28}}>
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:16,color:T.text,marginBottom:12}}>📂 Histórico de Combinadas</div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {combLog.map((c,i)=>{
                    const pnl=c.result==="WIN"?+(c.stake*(c.odd-1)).toFixed(2):c.result==="LOSS"?-c.stake:0;
                    const rc={WIN:T.green,LOSS:T.red,PENDENTE:T.gold}[c.result];
                    return(
                      <Card key={i} style={{padding:"12px 16px"}}>
                        <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
                          <div style={{flex:1}}>
                            <div style={{fontSize:11,color:T.muted,marginBottom:4}}>{c.date} · {c.selecoes.length} seleções · Odd {c.odd?.toFixed(2)}</div>
                            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{c.selecoes.map((s,j)=><span key={j} style={{fontSize:10,padding:"2px 7px",background:"rgba(255,255,255,0.04)",borderRadius:5,color:T.dim}}>{s.market}</span>)}</div>
                          </div>
                          <div style={{textAlign:"center",minWidth:60}}><div style={{fontSize:9,color:T.muted}}>STAKE</div><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:16,fontWeight:700,color:T.text}}>{currency.symbol}{c.stake?.toFixed(2)}</div></div>
                          <div style={{textAlign:"center",minWidth:70}}><div style={{fontSize:9,color:T.muted}}>RESULTADO</div><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:16,fontWeight:800,color:rc}}>{c.result==="WIN"?`+${currency.symbol}${pnl}`:c.result==="LOSS"?`-${currency.symbol}${Math.abs(pnl)}`:T.gold&&"PENDENTE"}</div></div>
                          <div style={{display:"flex",gap:5}}>
                            {c.result==="PENDENTE"&&<><button onClick={()=>{const u=[...combLog];u[i]={...c,result:"WIN"};saveCombLog(u);}} style={{background:T.greenDim,border:`1px solid ${T.borderG}`,borderRadius:6,padding:"3px 8px",color:T.green,fontSize:10,fontWeight:700,cursor:"pointer"}}>WIN</button><button onClick={()=>{const u=[...combLog];u[i]={...c,result:"LOSS"};saveCombLog(u);}} style={{background:T.redDim,border:"1px solid rgba(255,83,112,0.3)",borderRadius:6,padding:"3px 8px",color:T.red,fontSize:10,fontWeight:700,cursor:"pointer"}}>LOSS</button></>}
                            <button onClick={()=>saveCombLog(combLog.filter((_,j)=>j!==i))} style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${T.border}`,borderRadius:6,padding:"3px 7px",color:T.muted,fontSize:10,cursor:"pointer"}}>✕</button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          );
        })()}

        {/* ══ BANCA ══ */}
        {tab==="banca"&&(
          <div>
            {/* Sub-nav Banca */}
            <div style={{display:"flex",gap:6,marginBottom:20,borderBottom:`1px solid ${T.border}`,paddingBottom:14}}>
              {[["resumo","💰","Resumo"],["gestao","🛡️","Gestão"],["historico","📈","Performance"],["apostas","📋","Apostas"]].map(([k,ic,lb])=>(
                <button key={k} onClick={()=>setBancaSubTab(k)} style={{padding:"8px 16px",background:bancaSubTab===k?T.greenDim:"transparent",border:`1px solid ${bancaSubTab===k?T.borderG:T.border}`,borderRadius:9,cursor:"pointer",color:bancaSubTab===k?T.green:T.muted,fontSize:12,fontWeight:bancaSubTab===k?800:400,fontFamily:"'Barlow Condensed',sans-serif",transition:"all 0.2s"}}>{ic} {lb}</button>
              ))}
            </div>

            {/* ── RESUMO ── */}
            {bancaSubTab==="resumo"&&(()=>{
              const dailyBets=betLog.filter(b=>{try{return b.date===fmtISO(nowDate())}catch{return false}});
              const dailyPnl=dailyBets.filter(b=>b.result!=="PENDENTE").reduce((s,b)=>s+(b.result==="WIN"?b.stake*(b.odd-1):-b.stake),0);
              const stopLoss=bancaConfig.stopLoss||20;
              const stopLossPct=(Math.abs(Math.min(dailyPnl,0))/(bankroll+totalPnl)*100);
              const isStopLossHit=stopLossPct>=stopLoss;
              const maxDrawdown=bancaConfig.maxDrawdown||30;
              const currentDrawdown=totalPnl<0?Math.abs(totalPnl)/(bankroll)*100:0;
              const isDrawdownAlert=currentDrawdown>=maxDrawdown*0.7;
              return(
              <div>
                {/* Alertas de risco */}
                {isStopLossHit&&<div style={{padding:"14px 18px",background:"linear-gradient(135deg,rgba(255,83,112,0.15),rgba(12,16,24,1))",border:"2px solid rgba(255,83,112,0.5)",borderRadius:14,marginBottom:16,display:"flex",alignItems:"center",gap:12}}><span style={{fontSize:24}}>🚨</span><div><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:16,color:T.red}}>STOP LOSS ATINGIDO</div><div style={{fontSize:12,color:T.dim}}>Você perdeu {stopLossPct.toFixed(1)}% da banca hoje. Limite configurado: {stopLoss}%. Recomendado parar por hoje.</div></div></div>}
                {isDrawdownAlert&&!isStopLossHit&&<div style={{padding:"12px 16px",background:"rgba(245,166,35,0.08)",border:"1px solid rgba(245,166,35,0.3)",borderRadius:12,marginBottom:16,display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:20}}>⚠️</span><div style={{fontSize:12,color:T.gold}}>Drawdown em {currentDrawdown.toFixed(1)}% — aproximando do limite de {maxDrawdown}%. Considere reduzir stakes.</div></div>}
                {/* KPIs */}
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:18}}>
                  {[{l:"Banca Atual",v:`${currency.symbol} ${(bankroll+totalPnl).toFixed(0)}`,c:totalPnl>=0?T.green:T.red},{l:"P&L Total",v:`${totalPnl>=0?"+":""}${currency.symbol} ${totalPnl.toFixed(2)}`,c:totalPnl>=0?T.green:T.red},{l:"Acerto",v:concluded.length?`${(wins/concluded.length*100).toFixed(0)}%`:"—",c:T.gold},{l:"ROI",v:concluded.length?`${(totalPnl/betLog.filter(b=>b.result!=="PENDENTE").reduce((s,b)=>s+b.stake,0.01)*100).toFixed(1)}%`:"—",c:totalPnl>=0?T.green:T.red}].map(({l,v,c})=>(
                    <Card key={l} glow><div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>{l}</div><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:24,fontWeight:800,color:c}}>{v}</div></Card>
                  ))}
                </div>
                {/* Hoje */}
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:18}}>
                  {[{l:"Apostas Hoje",v:dailyBets.length,c:T.blue},{l:"P&L Hoje",v:`${dailyPnl>=0?"+":""}${currency.symbol}${dailyPnl.toFixed(2)}`,c:dailyPnl>=0?T.green:T.red},{l:"Ativas",v:pending,c:T.gold}].map(({l,v,c})=>(
                    <Card key={l}><div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>{l}</div><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:22,fontWeight:800,color:c}}>{v}</div></Card>
                  ))}
                </div>
                {/* Gráfico */}
                {concluded.length>0&&<Card><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:14,color:T.text,marginBottom:10,display:"flex",justifyContent:"space-between"}}><span>📈 Evolução da Banca</span><span style={{fontSize:11,color:totalPnl>=0?T.green:T.red,fontWeight:700}}>{totalPnl>=0?"+":""}{(totalPnl/bankroll*100).toFixed(1)}% ROI</span></div><Sparkline data={bankCurve} w={Math.min(900,typeof window!=="undefined"?window.innerWidth-120:800)} h={90} color={totalPnl>=0?T.green:T.red}/></Card>}
              </div>
              );
            })()}

            {/* ── GESTÃO PROFISSIONAL ── */}
            {bancaSubTab==="gestao"&&(
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                <Card>
                  <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:16,color:T.text,marginBottom:16}}>🛡️ Limites de Risco</div>
                  {[{key:"stopLoss",label:"Stop Loss Diário",desc:"% da banca — para apostas se atingir este limite de perda no dia",default:20,color:T.red},{key:"maxDrawdown",label:"Drawdown Máximo",desc:"% da banca inicial — alerta quando drawdown total atingir este nível",default:30,color:T.orange},{key:"maxDailyBets",label:"Máx. Apostas/Dia",desc:"Número máximo de apostas por dia",default:5,color:T.blue},{key:"maxStakePct",label:"Stake Máximo por Aposta",desc:"% da banca em uma única aposta",default:5,color:T.gold}].map(({key,label,desc,default:def,color})=>(
                    <div key={key} style={{marginBottom:16,paddingBottom:16,borderBottom:`1px solid ${T.border}`}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                        <div><div style={{fontSize:13,fontWeight:700,color:T.text}}>{label}</div><div style={{fontSize:11,color:T.muted}}>{desc}</div></div>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <input type="number" value={bancaConfig[key]||def} onChange={e=>saveBancaConfig({...bancaConfig,[key]:Number(e.target.value)})} style={{width:70,background:"rgba(255,255,255,0.05)",border:`1px solid ${color}44`,borderRadius:8,padding:"7px 10px",color,fontSize:14,fontWeight:700,outline:"none",textAlign:"center",fontFamily:"'Barlow Condensed',sans-serif"}}/>
                          <span style={{fontSize:12,color:T.muted}}>{key==="maxDailyBets"?"apostas":"%"}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </Card>
                <Card>
                  <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:15,color:T.text,marginBottom:14}}>💰 Banca Inicial</div>
                  <div style={{display:"flex",gap:12,alignItems:"center"}}>
                    <input type="number" value={bankroll} onChange={e=>{const v=Number(e.target.value);try{localStorage.setItem("bta_bank",v)}catch{};}} style={{flex:1,background:"rgba(255,255,255,0.05)",border:`1px solid ${T.border}`,borderRadius:9,padding:"10px 13px",color:T.text,fontSize:16,outline:"none"}}/>
                    <select value={currency.code} onChange={e=>{const c=CURRENCIES.find(c=>c.code===e.target.value);if(c){try{localStorage.setItem("bta_curr",JSON.stringify(c))}catch{}}}} style={{background:"rgba(255,255,255,0.05)",border:`1px solid ${T.border}`,borderRadius:9,padding:"10px 12px",color:T.text,fontSize:13,outline:"none"}}>
                      {CURRENCIES.map(c=><option key={c.code} value={c.code} style={{background:T.card}}>{c.code} {c.symbol}</option>)}
                    </select>
                  </div>
                </Card>
              </div>
            )}

            {/* ── HISTÓRICO DE PERFORMANCE ── */}
            {bancaSubTab==="historico"&&(()=>{
              const concluded2=betLog.filter(b=>b.result!=="PENDENTE");
              if(!concluded2.length)return<Card style={{textAlign:"center",padding:52}}><div style={{fontSize:36,marginBottom:12}}>📊</div><div style={{color:T.muted}}>Sem apostas concluídas ainda.</div></Card>;

              // Por mercado
              const byMarket={};
              concluded2.forEach(b=>{
                const k=b.market||b.label||"Outros";
                if(!byMarket[k])byMarket[k]={wins:0,losses:0,pnl:0,stakes:0};
                const pnl=b.result==="WIN"?b.stake*(b.odd-1):-b.stake;
                byMarket[k].pnl+=pnl;byMarket[k].stakes+=b.stake;
                if(b.result==="WIN")byMarket[k].wins++;else byMarket[k].losses++;
              });
              const mktStats=Object.entries(byMarket).map(([k,v])=>({name:k,...v,total:v.wins+v.losses,acerto:v.wins/(v.wins+v.losses)*100,roi:v.pnl/v.stakes*100})).sort((a,b)=>b.roi-a.roi);

              // Por liga
              const byLeague={};
              concluded2.forEach(b=>{
                const k=b.league||"—";
                if(!byLeague[k])byLeague[k]={wins:0,losses:0,pnl:0};
                if(b.result==="WIN"){byLeague[k].wins++;byLeague[k].pnl+=b.stake*(b.odd-1);}else{byLeague[k].losses++;byLeague[k].pnl-=b.stake;}
              });

              // Por mês
              const byMonth={};
              concluded2.forEach(b=>{
                const k=(b.date||"").slice(0,7);
                if(!k)return;
                if(!byMonth[k])byMonth[k]={wins:0,losses:0,pnl:0};
                if(b.result==="WIN"){byMonth[k].wins++;byMonth[k].pnl+=b.stake*(b.odd-1);}else{byMonth[k].losses++;byMonth[k].pnl-=b.stake;}
              });

              return(
              <div style={{display:"flex",flexDirection:"column",gap:18}}>
                {/* Por mercado */}
                <Card>
                  <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:15,color:T.text,marginBottom:12}}>🎯 Performance por Mercado</div>
                  <div style={{overflowX:"auto"}}>
                    <table style={{width:"100%",borderCollapse:"collapse"}}>
                      <thead><tr>{["Mercado","Apostas","Acerto","ROI","P&L"].map(h=><th key={h} style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:1,padding:"6px 10px",textAlign:"left",borderBottom:`1px solid ${T.border}`}}>{h}</th>)}</tr></thead>
                      <tbody>
                        {mktStats.map((m,i)=>(
                          <tr key={i} style={{borderBottom:`1px solid ${T.border}22`}}>
                            <td style={{padding:"8px 10px",fontSize:12,fontWeight:600,color:T.text}}>{m.name}</td>
                            <td style={{padding:"8px 10px",fontSize:12,color:T.muted}}>{m.total}</td>
                            <td style={{padding:"8px 10px",fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,fontWeight:700,color:m.acerto>=55?T.green:m.acerto>=45?T.gold:T.red}}>{m.acerto.toFixed(0)}%</td>
                            <td style={{padding:"8px 10px",fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,fontWeight:700,color:m.roi>=0?T.green:T.red}}>{m.roi>=0?"+":""}{m.roi.toFixed(1)}%</td>
                            <td style={{padding:"8px 10px",fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,fontWeight:700,color:m.pnl>=0?T.green:T.red}}>{m.pnl>=0?"+":""}{currency.symbol}{m.pnl.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
                {/* Por liga */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                  <Card>
                    <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:14,color:T.text,marginBottom:10}}>🌍 Por Liga</div>
                    {Object.entries(byLeague).map(([k,v])=>{
                      const lg=LEAGUES.find(l=>l.name===k);
                      const roi=v.pnl/(concluded2.filter(b=>(b.league||"—")===k).reduce((s,b)=>s+b.stake,0.01))*100;
                      return(<div key={k} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:`1px solid ${T.border}22`}}>
                        <span style={{fontSize:14}}>{lg?.flag||"🌐"}</span>
                        <span style={{flex:1,fontSize:12,color:T.text}}>{k}</span>
                        <span style={{fontSize:12,color:T.muted}}>{v.wins+v.losses}j</span>
                        <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,fontWeight:700,color:roi>=0?T.green:T.red}}>{roi>=0?"+":""}{roi.toFixed(1)}%</span>
                      </div>);
                    })}
                  </Card>
                  <Card>
                    <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:14,color:T.text,marginBottom:10}}>📅 Por Mês</div>
                    {Object.entries(byMonth).sort((a,b)=>b[0].localeCompare(a[0])).slice(0,6).map(([k,v])=>(
                      <div key={k} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:`1px solid ${T.border}22`}}>
                        <span style={{flex:1,fontSize:12,color:T.text}}>{k}</span>
                        <span style={{fontSize:11,color:T.muted}}>{v.wins+v.losses}j · {v.wins>0?(v.wins/(v.wins+v.losses)*100).toFixed(0):"0"}%</span>
                        <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,fontWeight:700,color:v.pnl>=0?T.green:T.red}}>{v.pnl>=0?"+":""}{currency.symbol}{v.pnl.toFixed(2)}</span>
                      </div>
                    ))}
                  </Card>
                </div>
              </div>
              );
            })()}

            {/* ── APOSTAS ── */}
            {bancaSubTab==="apostas"&&(
              <div>
                {betLog.length===0?(
                  <Card><div style={{textAlign:"center",padding:44,color:T.muted}}><div style={{fontSize:36,marginBottom:12}}>📋</div><div>Nenhuma aposta registrada. Use o Scanner ou Análise.</div></div></Card>
                ):(
                  <Card style={{padding:0,overflow:"hidden"}}>
                    <table style={{width:"100%",borderCollapse:"collapse"}}>
                      <thead><tr style={{background:"rgba(245,166,35,0.07)",borderBottom:"1px solid rgba(245,166,35,0.18)"}}>
                        {["Data","Partida","Mercado","Odd","Stake","Status","P&L",""].map(h=><th key={h} style={{padding:"10px 13px",textAlign:"left",fontSize:10,color:T.gold,textTransform:"uppercase",letterSpacing:1,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>{h}</th>)}
                      </tr></thead>
                      <tbody>
                        {betLog.map((b,i)=>{
                          const pnl=b.result==="WIN"?+(b.stake*(b.odd-1)).toFixed(2):b.result==="LOSS"?-b.stake:0;
                          const rc={WIN:T.green,LOSS:T.red,PENDENTE:T.gold}[b.result]||T.muted;
                          return(
                            <tr key={b.id} style={{borderBottom:`1px solid ${T.border}`,background:i%2===0?"rgba(255,255,255,0.012)":"transparent"}}>
                              <td style={{padding:"10px 13px",color:T.muted,fontSize:12}}>{b.date}</td>
                              <td style={{padding:"10px 13px",color:T.text,fontSize:12,fontWeight:600}}>{b.match}</td>
                              <td style={{padding:"10px 13px",color:T.dim,fontSize:11}}>{b.market}</td>
                              <td style={{padding:"10px 13px",color:T.gold,fontWeight:800,fontSize:14,fontFamily:"'Barlow Condensed',sans-serif"}}>{b.odd?.toFixed(2)}</td>
                              <td style={{padding:"10px 13px",color:T.dim,fontSize:12}}>{currency.symbol} {b.stake?.toFixed(2)}</td>
                              <td style={{padding:"10px 13px"}}><Pill color={rc} size={10}>{b.result}</Pill></td>
                              <td style={{padding:"10px 13px",color:pnl>=0?T.green:T.red,fontWeight:800,fontSize:13,fontFamily:"'Barlow Condensed',sans-serif"}}>{b.result==="PENDENTE"?"—":`${pnl>=0?"+":""}${currency.symbol} ${Math.abs(pnl).toFixed(2)}`}</td>
                              <td style={{padding:"10px 13px"}}>
                                <div style={{display:"flex",gap:4}}>
                                  {b.result==="PENDENTE"&&<><button onClick={()=>resolveBet(b.id,"WIN")} style={{background:T.greenDim,border:`1px solid ${T.borderG}`,borderRadius:6,padding:"3px 8px",color:T.green,fontSize:10,fontWeight:700,cursor:"pointer"}}>WIN</button><button onClick={()=>resolveBet(b.id,"LOSS")} style={{background:T.redDim,border:"1px solid rgba(255,83,112,0.3)",borderRadius:6,padding:"3px 8px",color:T.red,fontSize:10,fontWeight:700,cursor:"pointer"}}>LOSS</button></>}
                                  <button onClick={()=>deleteBet(b.id)} style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${T.border}`,borderRadius:6,padding:"3px 7px",color:T.muted,fontSize:10,cursor:"pointer"}}>✕</button>
                                </div>
                              </td>
                            </tr>
                          );})}
                      </tbody>
                    </table>
                  </Card>
                )}
              </div>
            )}
          </div>
        )}

        {/* ══ MAIS (Ranking + Simulador + Perfil) ══ */}
        {(tab==="mais"||tab==="ranking"||tab==="simulador"||tab==="perfil")&&(
          <div>
            <div style={{display:"flex",gap:6,marginBottom:20,borderBottom:`1px solid ${T.border}`,paddingBottom:14}}>
              {[["ranking","🏆","Ranking"],["simulador","🎲","Simulador"],["perfil","👤","Perfil"]].map(([k,ic,lb])=>(
                <button key={k} onClick={()=>setMaisSubTab(k)} style={{padding:"8px 16px",background:maisSubTab===k?T.greenDim:"transparent",border:`1px solid ${maisSubTab===k?T.borderG:T.border}`,borderRadius:9,cursor:"pointer",color:maisSubTab===k?T.green:T.muted,fontSize:12,fontWeight:maisSubTab===k?800:400,fontFamily:"'Barlow Condensed',sans-serif",transition:"all 0.2s"}}>{ic} {lb}</button>
              ))}
            </div>
            {maisSubTab==="ranking"&&(
          <div>
            <h2 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:24,fontWeight:800,color:T.text,margin:"0 0 4px"}}>🏆 Ranking de Mercados por Liga</h2>
            <p style={{color:T.muted,fontSize:12,margin:"0 0 20px"}}>Taxa de acerto histórica por mercado em cada liga (dados 2023-2025, +300 jogos/liga)</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(380px,1fr))",gap:16}}>
              {LEAGUES.map(league=>{
                const stats=LEAGUE_MARKET_STATS[league.code]||[];
                const sorted=[...stats].sort((a,b)=>b.winRate-a.winRate);
                return(
                  <Card key={league.code}>
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                      <span style={{fontSize:22}}>{league.flag}</span>
                      <div>
                        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:16,color:T.text}}>{league.name}</div>
                        <div style={{fontSize:11,color:T.muted}}>+{sorted[0]?.sample||300} jogos analisados</div>
                      </div>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:8}}>
                      {sorted.map((s,i)=>{
                        const c=s.winRate>=65?T.green:s.winRate>=55?T.gold:T.red;
                        const trendC=s.trend==="↑"?T.green:s.trend==="↓"?T.red:T.muted;
                        return(
                          <div key={i} style={{display:"flex",alignItems:"center",gap:10}}>
                            <div style={{width:18,height:18,borderRadius:"50%",background:c+"22",border:`1px solid ${c}44`,color:c,fontSize:9,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{i+1}</div>
                            <div style={{flex:1}}>
                              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                                <span style={{fontSize:12,color:T.text,fontWeight:600}}>{s.market}</span>
                                <div style={{display:"flex",alignItems:"center",gap:6}}>
                                  <span style={{fontSize:11,color:trendC,fontWeight:700}}>{s.trend}</span>
                                  <span style={{fontSize:13,fontWeight:800,color:c,fontFamily:"'Barlow Condensed',sans-serif"}}>{s.winRate}%</span>
                                </div>
                              </div>
                              <div style={{background:"rgba(255,255,255,0.06)",borderRadius:3,height:5,overflow:"hidden"}}>
                                <div style={{width:`${s.winRate}%`,height:"100%",background:c,borderRadius:3,transition:"width 0.8s ease"}}/>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                );
              })}
            </div>
            <Card style={{marginTop:16,padding:"14px 18px"}}>
              <div style={{fontSize:11,color:T.muted,lineHeight:1.7}}>
                ℹ️ <strong style={{color:T.text}}>Como usar o Ranking:</strong> Combine a taxa de acerto histórica com a análise estatística do jogo específico. Mercados com alta taxa histórica + EV positivo na análise = maior confiança na entrada. Tendência ↑ indica que o mercado está performando melhor nas últimas rodadas.
              </div>
            </Card>
          </div>
        )}

            {maisSubTab==="simulador"&&(
          <div>
            <h2 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:24,fontWeight:800,color:T.text,margin:"0 0 4px"}}>🎲 Simulador de Estratégias</h2>
            <p style={{color:T.muted,fontSize:12,margin:"0 0 20px"}}>Compare sistemas de gestão de banca.</p>
            <div style={{display:"flex",gap:7,marginBottom:20,flexWrap:"wrap"}}>
              {[["kelly","🎯","Kelly"],["fixed","🔒","Fixo"],["fib","🌀","Fibonacci"],["mart","⚡","Martingale"],["value","💎","Value"]].map(([k,ic,lb])=><button key={k} onClick={()=>setSimStrat(k)} style={{display:"flex",alignItems:"center",gap:6,padding:"9px 15px",background:simStrat===k?T.greenDim:"rgba(255,255,255,0.03)",border:`1px solid ${simStrat===k?T.borderG:T.border}`,borderRadius:10,cursor:"pointer",color:simStrat===k?T.green:T.muted,fontWeight:simStrat===k?800:400,fontSize:13,fontFamily:"'Barlow Condensed',sans-serif",transition:"all 0.2s"}}><span>{ic}</span>{lb}</button>)}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"290px 1fr",gap:18}}>
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                <Card glow>
                  <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:15,color:T.text,marginBottom:14}}>⚙️ Parâmetros</div>
                  {[{label:`Banca (${currency.symbol})`,val:bankroll,set:v=>saveProfile({...profile,bankroll:v}),step:50,min:100,max:100000},{label:"Odd",val:simOdd,set:setSimOdd,step:0.05,min:1.05,max:15,dec:2},{label:"Probabilidade (%)",val:simProb,set:setSimProb,step:1,min:5,max:95}].map(({label,val,set,step,min,max,dec})=>(
                    <div key={label} style={{marginBottom:14}}><div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>{label}</div><input type="number" value={dec?+val.toFixed(dec):val} onChange={e=>set(Number(e.target.value))} step={step} min={min} max={max} style={INP}/><input type="range" min={min} max={max} step={step} value={val} onChange={e=>set(Number(e.target.value))} style={{width:"100%",marginTop:6,accentColor:T.green}}/></div>
                  ))}
                  {simStrat==="fixed"&&<div><div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>% por aposta</div><input type="number" value={simUnit} onChange={e=>setSimUnit(Number(e.target.value))} step={0.5} min={0.5} max={10} style={{...INP,color:T.blue}}/><input type="range" min={0.5} max={10} step={0.5} value={simUnit} onChange={e=>setSimUnit(Number(e.target.value))} style={{width:"100%",marginTop:6,accentColor:T.blue}}/></div>}
                  {simStrat==="fib"&&<div><div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Etapa Fibonacci</div><div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{FIB.map((n,i)=><button key={i} onClick={()=>setSimFib(i)} style={{width:28,height:28,borderRadius:6,background:i===simFib?T.purpleDim:"rgba(255,255,255,0.04)",border:`1px solid ${i===simFib?"rgba(192,132,252,0.4)":T.border}`,color:i===simFib?T.purple:T.dim,fontSize:11,fontWeight:700,cursor:"pointer"}}>{n}</button>)}</div></div>}
                  {simStrat==="mart"&&<div><div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Derrotas: {simLoss}</div><input type="range" min={0} max={7} step={1} value={simLoss} onChange={e=>setSimLoss(Number(e.target.value))} style={{width:"100%",accentColor:T.red}}/></div>}
                </Card>
                <Card style={{borderColor:simEV>0?"rgba(56,211,159,0.25)":"rgba(255,83,112,0.25)"}}>
                  <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Valor Esperado (EV)</div>
                  <div style={{fontSize:36,fontWeight:800,color:simEV>0?T.green:T.red,fontFamily:"'Barlow Condensed',sans-serif"}}>{simEV>0?"+":""}{simEV.toFixed(3)}</div>
                  <div style={{fontSize:11,color:T.muted,marginTop:6}}>{simEV>0?"✅ Valor positivo":"❌ EV negativo — não apostar"}</div>
                </Card>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                {simStrat==="kelly"&&(<><Card glow><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:17,color:T.green,marginBottom:4}}>🎯 Critério de Kelly</div><div style={{fontSize:12,color:T.muted,marginBottom:16}}>Fração ótima. Sempre use o conservador (25%).</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}><ResBox label="Kelly Pleno" value={`${(simKelly*100).toFixed(1)}%`} color={simKelly>0.2?T.red:simKelly>0.1?T.gold:T.green} sub={simKelly>0.15?"⚠️ Agressivo":"Calculado"}/><ResBox label="Kelly 25% (rec.)" value={`${(simKelly*25).toFixed(1)}%`} color={T.green} sub="Conservador"/><ResBox label="Valor" value={`${currency.symbol} ${(bankroll*simKelly*0.25).toFixed(2)}`} color={T.gold} sub="na banca atual"/></div></Card><Card><InfoRow t="Fórmula" d="f* = (p·(b−1) − (1−p)) / (b−1)"/><InfoRow t="Conservador" d="Use 25% do Kelly pleno para reduzir variância"/><InfoRow t="Limite" d="Nunca aposte mais de 5% da banca num evento"/></Card></>)}
                {simStrat==="fixed"&&(<><Card glow><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:17,color:T.blue,marginBottom:4}}>🔒 Unidades Fixas</div><div style={{fontSize:12,color:T.muted,marginBottom:16}}>Método mais simples e disciplinado.</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}><ResBox label="% por aposta" value={`${simUnit}%`} color={T.blue}/><ResBox label="Valor" value={`${currency.symbol} ${(bankroll*simUnit/100).toFixed(2)}`} color={T.gold}/><ResBox label="Até falência" value={`~${Math.floor(100/simUnit)}`} color={T.green} sub="apostas"/></div></Card><Card>{[["1 un. (1%)","Baixa confiança (score 1-5)",T.red],["2 un. (2%)","Padrão (score 6-7)",T.gold],["3 un. (3%)","Alta confiança — EV+ (score 8-9)",T.green],["4+ un.","Convicção máxima",T.purple]].map(([u,d,c])=><div key={u} style={{padding:"9px 0",borderBottom:`1px solid ${T.border}`}}><div style={{fontSize:13,color:c,fontWeight:700}}>{u}</div><div style={{fontSize:11,color:T.muted,marginTop:2}}>{d}</div></div>)}</Card></>)}
                {simStrat==="fib"&&(<><Card glow><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:17,color:T.purple,marginBottom:4}}>🌀 Fibonacci</div><div style={{fontSize:12,color:T.muted,marginBottom:16}}>Avança após derrota, recua 2 após vitória.</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}><ResBox label="×" value={`${FIB[simFib]}`} color={T.purple}/><ResBox label="Valor" value={`${currency.symbol} ${(bankroll*0.01*FIB[simFib]).toFixed(2)}`} color={T.gold}/><ResBox label="% banca" value={`${FIB[simFib]}%`} color={FIB[simFib]>8?T.red:T.green}/></div><div style={{marginTop:12,display:"flex",gap:4,flexWrap:"wrap"}}>{FIB.map((n,i)=><div key={i} style={{width:34,height:34,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",background:i===simFib?T.purpleDim:"rgba(255,255,255,0.04)",border:`1px solid ${i===simFib?"rgba(192,132,252,0.4)":T.border}`,color:i<simFib?T.muted:i===simFib?T.purple:T.dim,fontSize:12,fontWeight:700}}>{n}</div>)}</div></Card><Card><InfoRow t="Limite" d="Não ultrapassar etapa 6 (×8) — risco elevado"/><InfoRow t="Melhor uso" d="Mercados com taxa de acerto acima de 60%"/></Card></>)}
                {simStrat==="mart"&&(<><Card style={{borderColor:simLoss>=4?"rgba(255,83,112,0.4)":T.border}}><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:17,color:T.red,marginBottom:4}}>⚡ Martingale</div><div style={{fontSize:12,color:T.muted,marginBottom:16}}>Dobra após cada derrota. Alto risco.</div><div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}><ResBox label="Base" value={`${currency.symbol}${(bankroll*0.01).toFixed(0)}`} color={T.dim}/><ResBox label="×" value={`${Math.pow(2,simLoss)}`} color={simLoss>=4?T.red:T.gold}/><ResBox label="Aposta" value={`${currency.symbol}${(bankroll*0.01*Math.pow(2,simLoss)).toFixed(2)}`} color={T.red}/><ResBox label="% banca" value={`${Math.pow(2,simLoss)}%`} color={simLoss>=4?T.red:T.gold}/></div>{simLoss>=4&&<div style={{marginTop:12,background:T.redDim,border:"1px solid rgba(255,83,112,0.3)",borderRadius:10,padding:"11px 14px",color:T.red,fontSize:12}}>🚨 {simLoss} derrotas — considere resetar.</div>}</Card><Card><div style={{display:"flex",flexDirection:"column",gap:4}}>{[0,1,2,3,4,5,6,7].map(n=>{const st=(bankroll*0.01*Math.pow(2,n)).toFixed(2);const c=n>=4?T.red:n>=2?T.gold:T.green;return<div key={n} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 8px",background:n===simLoss?"rgba(255,255,255,0.04)":"transparent",borderRadius:7,border:`1px solid ${n===simLoss?c+"44":T.border}`}}><span style={{fontSize:11,color:T.muted,minWidth:65}}>{n} derrota{n!==1?"s":""}</span><div style={{flex:1,background:"rgba(255,255,255,0.05)",borderRadius:3,height:4}}><div style={{width:`${Math.min(100,Math.pow(2,n)*8)}%`,height:"100%",background:c,borderRadius:3}}/></div><span style={{fontSize:12,fontWeight:700,color:c,minWidth:90,textAlign:"right"}}>{currency.symbol}{st}</span>{n===simLoss&&<Pill color={c} size={9}>atual</Pill>}</div>})}</div></Card></>)}
                {simStrat==="value"&&(<><Card glow><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:17,color:T.gold,marginBottom:4}}>💎 Value Betting</div><div style={{fontSize:12,color:T.muted,marginBottom:16}}>Identifica quando a odd supera a probabilidade real.</div><div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}><ResBox label="Prob. implícita" value={`${(1/simOdd*100).toFixed(1)}%`} color={T.dim} sub="1/odd"/><ResBox label="Estimativa" value={`${simProb}%`} color={T.text}/><ResBox label="Edge" value={`${(simProb-1/simOdd*100).toFixed(1)}%`} color={simProb>1/simOdd*100?T.green:T.red}/><ResBox label={`EV/${currency.symbol}100`} value={`${currency.symbol}${(simEV*100).toFixed(2)}`} color={simEV>0?T.green:T.red}/></div><div style={{marginTop:12,padding:"12px 14px",background:simEV>0?T.greenDim:T.redDim,border:`1px solid ${simEV>0?"rgba(56,211,159,0.3)":"rgba(255,83,112,0.3)"}`,borderRadius:10}}><div style={{color:simEV>0?T.green:T.red,fontSize:13,fontWeight:700}}>{simEV>0?`✅ VALUE — Edge de ${(simProb-1/simOdd*100).toFixed(1)}%`:`❌ SEM VALUE — Casa tem ${(1/simOdd*100-simProb).toFixed(1)}% de vantagem`}</div></div></Card><Card><InfoRow t="Prob. implícita" d="1/odd × 100. Casa cobra overround — soma supera 100%."/><InfoRow t="Edge positivo" d="Sua estimativa supera a probabilidade implícita."/><InfoRow t="EV > 0" d="Retorno esperado positivo a longo prazo."/></Card></>)}
              </div>
            </div>
          </div>
        )}

            {maisSubTab==="perfil"&&(
          <div>
            <h2 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:24,fontWeight:800,color:T.text,margin:"0 0 4px"}}>👤 Perfil</h2>
            <p style={{color:T.muted,fontSize:12,margin:"0 0 22px"}}>Personalize sua experiência — salvo no navegador.</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
              <Card glow>
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:16,color:T.green,marginBottom:16}}>💰 Banca & Moeda</div>
                <div style={{marginBottom:16}}><div style={{fontSize:11,color:T.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Banca Inicial</div><input type="number" value={profile.bankroll||1000} onChange={e=>saveProfile({...profile,bankroll:Number(e.target.value)})} style={{width:"100%",background:"rgba(255,255,255,0.05)",border:`1px solid ${T.border}`,borderRadius:10,padding:"12px 14px",color:T.green,fontSize:20,fontWeight:800,outline:"none",boxSizing:"border-box",fontFamily:"'Barlow Condensed',sans-serif"}}/></div>
                <div style={{marginBottom:16}}><div style={{fontSize:11,color:T.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Moeda</div><div style={{display:"flex",gap:8}}>{CURRENCIES.map(c=><button key={c.code} onClick={()=>saveProfile({...profile,currency:c.code})} style={{flex:1,padding:"10px 0",background:profile.currency===c.code?T.greenDim:"rgba(255,255,255,0.03)",border:`1px solid ${profile.currency===c.code?T.borderG:T.border}`,borderRadius:9,cursor:"pointer",color:profile.currency===c.code?T.green:T.muted,fontSize:14,fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif"}}>{c.symbol} {c.code}</button>)}</div></div>
                <div><div style={{fontSize:11,color:T.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Estratégia padrão (usada na sugestão de valor)</div><div style={{display:"flex",gap:8}}>{[["kelly","🎯 Kelly"],["fixed","🔒 Fixo"]].map(([k,lb])=><button key={k} onClick={()=>saveProfile({...profile,strategy:k})} style={{flex:1,padding:"10px 0",background:profile.strategy===k?T.greenDim:"rgba(255,255,255,0.03)",border:`1px solid ${profile.strategy===k?T.borderG:T.border}`,borderRadius:9,cursor:"pointer",color:profile.strategy===k?T.green:T.muted,fontSize:13,fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif"}}>{lb}</button>)}</div></div>
              </Card>
              <Card>
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:16,color:T.gold,marginBottom:16}}>🎯 Meta de Lucro Mensal</div>
                <div style={{marginBottom:10}}><div style={{fontSize:11,color:T.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Meta (%)</div><input type="number" value={profile.monthlyGoal||10} onChange={e=>saveProfile({...profile,monthlyGoal:Number(e.target.value)})} step={1} min={1} max={200} style={{width:"100%",background:"rgba(255,255,255,0.05)",border:`1px solid ${T.border}`,borderRadius:10,padding:"12px 14px",color:T.gold,fontSize:20,fontWeight:800,outline:"none",boxSizing:"border-box",fontFamily:"'Barlow Condensed',sans-serif"}}/></div>
                <div style={{padding:"12px 14px",background:T.goldDim,border:"1px solid rgba(245,166,35,0.25)",borderRadius:10,marginTop:12}}>
                  <div style={{fontSize:12,color:T.gold,fontWeight:700}}>Meta: {currency.symbol} {((profile.bankroll||1000)*(profile.monthlyGoal||10)/100).toFixed(0)}/mês</div>
                  <div style={{fontSize:11,color:T.muted,marginTop:3}}>Progresso: {currency.symbol} {totalPnl.toFixed(2)}</div>
                  <div style={{marginTop:8,background:"rgba(255,255,255,0.06)",borderRadius:4,height:6,overflow:"hidden"}}><div style={{width:`${Math.min(100,Math.max(0,totalPnl/((profile.bankroll||1000)*(profile.monthlyGoal||10)/100)*100))}%`,height:"100%",background:T.gold,borderRadius:4,transition:"width 0.5s ease"}}/></div>
                  <div style={{fontSize:10,color:T.muted,marginTop:4}}>{Math.min(100,Math.max(0,totalPnl/((profile.bankroll||1000)*(profile.monthlyGoal||10)/100)*100)).toFixed(0)}% da meta atingida</div>
                </div>
              </Card>
              <Card>
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:16,color:T.blue,marginBottom:16}}>⭐ Liga Favorita</div>
                <div style={{display:"flex",flexDirection:"column",gap:7}}>
                  {LEAGUES.map(l=><button key={l.code} onClick={()=>saveProfile({...profile,favLeague:l.code})} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 13px",background:profile.favLeague===l.code?T.blueDim:"rgba(255,255,255,0.03)",border:`1px solid ${profile.favLeague===l.code?"rgba(78,201,240,0.35)":T.border}`,borderRadius:10,cursor:"pointer",textAlign:"left",transition:"all 0.2s"}}><span style={{fontSize:20}}>{l.flag}</span><div><div style={{fontSize:13,fontWeight:700,color:profile.favLeague===l.code?T.blue:T.text}}>{l.name}</div><div style={{fontSize:11,color:T.muted}}>{l.country}</div></div>{profile.favLeague===l.code&&<span style={{marginLeft:"auto",color:T.blue,fontSize:16}}>✓</span>}</button>)}
                </div>
              </Card>
              <Card>
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:16,color:T.purple,marginBottom:16}}>🏆 Time Favorito</div>
                <div style={{marginBottom:14}}><div style={{fontSize:11,color:T.muted,marginBottom:7}}>Nome do time</div><input type="text" placeholder="Ex: Flamengo, Arsenal..." value={profile.favTeam||""} onChange={e=>saveProfile({...profile,favTeam:e.target.value})} style={{width:"100%",background:"rgba(255,255,255,0.05)",border:`1px solid ${T.border}`,borderRadius:10,padding:"11px 13px",color:T.text,fontSize:13,outline:"none",boxSizing:"border-box"}}/></div>
                <div><div style={{fontSize:11,color:T.muted,marginBottom:7}}>URL do escudo (PNG)</div><input type="text" placeholder="https://..." value={profile.favTeamCrest||""} onChange={e=>saveProfile({...profile,favTeamCrest:e.target.value})} style={{width:"100%",background:"rgba(255,255,255,0.05)",border:`1px solid ${T.border}`,borderRadius:10,padding:"11px 13px",color:T.text,fontSize:13,outline:"none",boxSizing:"border-box"}}/><div style={{fontSize:10,color:T.muted,marginTop:5}}>O escudo aparece no cabeçalho do dashboard.</div></div>
                {profile.favTeamCrest&&<div style={{marginTop:14,display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:T.purpleDim,border:"1px solid rgba(192,132,252,0.25)",borderRadius:12}}><img src={profile.favTeamCrest} alt="" style={{height:44}} onError={e=>e.target.style.display="none"}/><div><div style={{fontWeight:700,color:T.purple,fontSize:14}}>{profile.favTeam||"Seu time"}</div><div style={{fontSize:11,color:T.muted,marginTop:2}}>Aparece no cabeçalho</div></div></div>}
              </Card>
            </div>
            {/* Chave Anthropic no perfil */}
            <Card style={{marginTop:16,border:`1px solid rgba(192,132,252,0.2)`}}>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:16,color:T.purple,marginBottom:12}}>🤖 Chave API Anthropic (Claude)</div>
              <div style={{fontSize:12,color:T.muted,marginBottom:10}}>Necessária para a análise IA automática. Obtida em <a href="https://console.anthropic.com" target="_blank" rel="noreferrer" style={{color:T.blue}}>console.anthropic.com</a> → API Keys.</div>
              <input type="password" placeholder="sk-ant-..." value={gptKey} onChange={e=>{setGptKey(e.target.value);try{localStorage.setItem("bta_gpt",e.target.value)}catch{}}} style={{width:"100%",background:"rgba(255,255,255,0.05)",border:`1px solid ${gptKey?"rgba(192,132,252,0.4)":T.border}`,borderRadius:10,padding:"11px 13px",color:T.text,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
              {gptKey&&<div style={{fontSize:11,color:T.green,marginTop:8}}>✓ Chave configurada — análise IA ativa</div>}
              {!gptKey&&<div style={{fontSize:11,color:T.gold,marginTop:8}}>⚠️ Sem chave — análise IA indisponível</div>}
            </Card>
          </div>
        )}

          </div>
        )}

      </main>

      <footer style={{borderTop:`1px solid ${T.border}`,padding:"11px 24px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:10,color:"#151515"}}>⚽ BetAnalytics · football-data.org + the-odds-api.com</span>
        <span style={{fontSize:10,color:T.red}}>⚠️ Jogue com responsabilidade. Apostas envolvem risco real de perda financeira.</span>
      </footer>

      <style>{`
        input[type=range]{-webkit-appearance:none;height:4px;border-radius:2px;background:rgba(255,255,255,0.08)}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:13px;height:13px;border-radius:50%;cursor:pointer;background:${T.green}}
        *{scrollbar-width:thin;scrollbar-color:#131f18 transparent}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#1a2a1a;border-radius:3px}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
      `}</style>
    </div>
  );
}
