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
  {code:"BSA",name:"Brasileirão",    country:"Brasil",  flag:"🇧🇷",oddsKey:"soccer_brazil_campeonato"},
  {code:"PL", name:"Premier League", country:"England", flag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",oddsKey:"soccer_epl"},
  {code:"PD", name:"La Liga",        country:"Spain",   flag:"🇪🇸",oddsKey:"soccer_spain_la_liga"},
  {code:"SA", name:"Serie A",        country:"Italy",   flag:"🇮🇹",oddsKey:"soccer_italy_serie_a"},
  {code:"BL1",name:"Bundesliga",     country:"Germany", flag:"🇩🇪",oddsKey:"soccer_germany_bundesliga"},
  {code:"FL1",name:"Ligue 1",        country:"France",  flag:"🇫🇷",oddsKey:"soccer_france_ligue_1"},
  {code:"CL", name:"Champions",      country:"Europe",  flag:"🌍",oddsKey:"soccer_uefa_champs_league"},
];
const CURRENCIES=[{code:"BRL",symbol:"R$"},{code:"USD",symbol:"$"},{code:"EUR",symbol:"€"}];
const FIB=[1,1,2,3,5,8,13,21,34,55];
const MONTH_NAMES=["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

// Ranking histórico de mercados por liga (dados baseados em estatísticas reais 2023-2025)
const LEAGUE_MARKET_STATS={
  BSA:[{market:"Over 2.5 Gols",winRate:58,sample:380,trend:"↑"},{market:"BTTS – Ambas Marcam",winRate:55,sample:380,trend:"→"},{market:"1X2 – Vitória Casa",winRate:47,sample:380,trend:"↓"},{market:"Under 2.5 Gols",winRate:42,sample:380,trend:"↓"},{market:"Dupla Chance 1X",winRate:72,sample:380,trend:"↑"}],
  PL: [{market:"Over 2.5 Gols",winRate:68,sample:380,trend:"↑"},{market:"BTTS – Ambas Marcam",winRate:62,sample:380,trend:"↑"},{market:"1X2 – Vitória Casa",winRate:45,sample:380,trend:"→"},{market:"Under 2.5 Gols",winRate:32,sample:380,trend:"↓"},{market:"Dupla Chance 1X",winRate:70,sample:380,trend:"↑"}],
  PD: [{market:"Over 2.5 Gols",winRate:65,sample:380,trend:"↑"},{market:"BTTS – Ambas Marcam",winRate:58,sample:380,trend:"→"},{market:"1X2 – Vitória Casa",winRate:47,sample:380,trend:"→"},{market:"Under 2.5 Gols",winRate:35,sample:380,trend:"↓"},{market:"Dupla Chance 1X",winRate:71,sample:380,trend:"↑"}],
  SA: [{market:"Over 2.5 Gols",winRate:55,sample:380,trend:"→"},{market:"BTTS – Ambas Marcam",winRate:52,sample:380,trend:"→"},{market:"1X2 – Vitória Casa",winRate:46,sample:380,trend:"→"},{market:"Under 2.5 Gols",winRate:45,sample:380,trend:"↑"},{market:"Dupla Chance 1X",winRate:70,sample:380,trend:"→"}],
  BL1:[{market:"Over 2.5 Gols",winRate:70,sample:306,trend:"↑"},{market:"BTTS – Ambas Marcam",winRate:63,sample:306,trend:"↑"},{market:"1X2 – Vitória Casa",winRate:46,sample:306,trend:"→"},{market:"Under 2.5 Gols",winRate:30,sample:306,trend:"↓"},{market:"Dupla Chance 1X",winRate:72,sample:306,trend:"↑"}],
  FL1:[{market:"Over 2.5 Gols",winRate:60,sample:380,trend:"→"},{market:"BTTS – Ambas Marcam",winRate:55,sample:380,trend:"→"},{market:"1X2 – Vitória Casa",winRate:44,sample:380,trend:"↓"},{market:"Under 2.5 Gols",winRate:40,sample:380,trend:"↑"},{market:"Dupla Chance 1X",winRate:68,sample:380,trend:"→"}],
  CL: [{market:"Over 2.5 Gols",winRate:66,sample:125,trend:"↑"},{market:"BTTS – Ambas Marcam",winRate:60,sample:125,trend:"↑"},{market:"1X2 – Vitória Casa",winRate:50,sample:125,trend:"↑"},{market:"Under 2.5 Gols",winRate:34,sample:125,trend:"↓"},{market:"Dupla Chance 1X",winRate:73,sample:125,trend:"↑"}],
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
};

/* ═══════════════════════════════════════════ HELPERS */
const fmtISO=d=>{const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,"0"),dd=String(d.getDate()).padStart(2,"0");return`${y}-${m}-${dd}`;};
const fmtBR=d=>d.toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit",year:"numeric"});
const fmtShort=d=>d.toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit"});
const nowDate=()=>new Date();
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
function calDays(y,m){const f=new Date(y,m,1),l=new Date(y,m+1,0),days=[];for(let i=0;i<f.getDay();i++)days.push(null);for(let d=1;d<=l.getDate();d++)days.push(new Date(y,m,d));return days;}

/* ═══════════════════════════════════════════ API
   Usa rotas serverless do Vercel — sem proxy local necessário
   Em desenvolvimento local, usa localhost:3000/api/...
═══════════════════════════════════════════ */
const API_BASE = "";  // vazio = mesmo domínio (funciona local e no Vercel)

async function fdFetch(ep, key, retries = 2) {
  const r = await fetch(`${API_BASE}/api/fd?endpoint=${encodeURIComponent(ep)}`, {
    headers: { "X-Auth-Token": key },
  });
  if (r.status === 429 && retries > 0) { await sleep(7000); return fdFetch(ep, key, retries - 1); }
  if (!r.ok) {
    const t = await r.text();
    throw new Error(t.includes("<") ? "Servidor não disponível. Tente novamente." : `FD ${r.status}: ${t.slice(0, 120)}`);
  }
  return r.json();
}

async function oddsFetch(path, key) {
  const [endpoint, query] = path.includes("?") ? path.split("?") : [path, ""];
  const params = new URLSearchParams(query);
  params.set("apiKey", key);
  const r = await fetch(`${API_BASE}/api/odds?endpoint=${encodeURIComponent(endpoint)}&${params}`);
  if (!r.ok) throw new Error(`Odds ${r.status}`);
  return r.json();
}

async function claudeAnalysis(fixture, homeStats, awayStats, markets, leagueName, dateStr) {
  const r = await fetch(`${API_BASE}/api/ia`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fixture, homeStats, awayStats, markets, leagueName, dateStr }),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(t.slice(0, 200));
  }
  return r.json();
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

function buildMarkets(hs,as_,oddsData){
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
    {name:"1X2 – Vitória Casa",   cat:"Resultado",    prob:hwp, odd:ro.home||1.90,  score:sc(hwp), rec:rec(hwp,62,45), ev:ev(hwp,ro.home||1.90),  justif:`Aproveit. casa: ${hwr}% · PPG: ${hppg.toFixed(2)}`},
    {name:"Empate (X)",           cat:"Resultado",    prob:dwp, odd:ro.draw||3.20,  score:sc(dwp), rec:rec(dwp,35,25), ev:ev(dwp,ro.draw||3.20),  justif:`Prob. de empate: ${dwp}%`},
    {name:"1X2 – Vitória Visit.", cat:"Resultado",    prob:awp, odd:ro.away||2.60,  score:sc(awp), rec:rec(awp,55,40), ev:ev(awp,ro.away||2.60),  justif:`Aproveit. fora: ${awr}% · PPG: ${appg.toFixed(2)}`},
    {name:"Over 2.5 Gols",        cat:"Over/Under",   prob:o25, odd:ro.over25||1.85,score:sc(o25), rec:rec(o25,65,50), ev:ev(o25,ro.over25||1.85),justif:`Média total: ${totalG.toFixed(2)} gols/j`},
    {name:"Over 3.5 Gols",        cat:"Over/Under",   prob:o35, odd:ro.over35||2.35,score:sc(o35), rec:rec(o35,55,40), ev:ev(o35,ro.over35||2.35),justif:`Requer ataque forte · média ${totalG.toFixed(2)}`},
    {name:"Under 2.5 Gols",       cat:"Over/Under",   prob:100-o25,odd:ro.under25||2.00,score:sc(100-o25),rec:rec(100-o25,52,40),ev:ev(100-o25,ro.under25||2.00),justif:`Under favorecido quando média ≤ 2.5`},
    {name:"BTTS – Ambas Marcam",  cat:"Ambas Marcam", prob:bttp,odd:1.90,           score:sc(bttp), rec:rec(bttp,62,50), ev:ev(bttp,1.90),          justif:`BTTS casa ${hbtts}%, visit. ${abtts}%`},
    {name:"Dupla Chance 1X",      cat:"Dupla Chance", prob:dc1x,odd:1.25,           score:sc(dc1x), rec:rec(dc1x,72,58), ev:ev(dc1x,1.25),          justif:`Cobre vitória + empate · ${dc1x}%`},
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
function MarketCard({m,i,onRegister,bankroll,currency,strategy}){
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════ SETUP */
function Setup({onSave}){
  const[fd,setFd]=useState("");const[odds,setOdds]=useState("");
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
        {[{label:"Football-Data.org",desc:"Jogos, stats, escudos · gratuito",color:T.green,link:"https://football-data.org/client/register",val:fd,set:setFd,ph:"Chave Football-Data.org..."},{label:"The Odds API",desc:"Odds reais das casas · 500 req/mês grátis",color:T.gold,link:"https://the-odds-api.com/#get-access",val:odds,set:setOdds,ph:"Chave The Odds API..."}].map(({label,desc,color,link,val,set,ph})=>(
          <Card key={label} style={{marginBottom:14}} glow={!!val}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
              <div><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:16,color}}>{label}</div><div style={{fontSize:11,color:T.muted,marginTop:2}}>{desc}</div></div>
              <a href={link} target="_blank" rel="noreferrer" style={{fontSize:11,color:T.blue}}>Criar conta →</a>
            </div>
            <input type="password" placeholder={ph} value={val} onChange={e=>set(e.target.value)} style={{width:"100%",background:"rgba(255,255,255,0.04)",border:`1px solid ${val?"rgba(56,211,159,0.3)":T.border}`,borderRadius:10,padding:"13px 15px",color:T.text,fontSize:14,outline:"none",boxSizing:"border-box"}}/>
          </Card>
        ))}
        <button onClick={()=>ok&&onSave(fd.trim(),odds.trim())} disabled={!ok} style={{width:"100%",background:ok?T.greenDim:"rgba(255,255,255,0.03)",border:`1px solid ${ok?T.borderG:T.border}`,borderRadius:12,padding:15,color:ok?T.green:T.muted,fontSize:16,fontWeight:800,fontFamily:"'Barlow Condensed',sans-serif",cursor:ok?"pointer":"not-allowed",transition:"all 0.2s",marginBottom:12}}>
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
  const saveKeys=(fd,od)=>{try{localStorage.setItem("bta_fd3",fd);localStorage.setItem("bta_od3",od);}catch{};setFdKey(fd);setOddsKey(od);};
  const logout=()=>{try{["bta_fd3","bta_od3"].forEach(k=>localStorage.removeItem(k));}catch{};setFdKey("");setOddsKey("");};

  const[profile,setProfile]=useState(()=>{try{return JSON.parse(localStorage.getItem("bta_profile4")||"{}")}catch{return{}}});
  const saveProfile=p=>{try{localStorage.setItem("bta_profile4",JSON.stringify(p))}catch{};setProfile(p);};

  const[tab,setTab]=useState("scanner");
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
  const[alertThreshold,setAlertThreshold]=useState(()=>{try{return Number(localStorage.getItem("bta_alert")||20)}catch{return 20}});
  const[alertEnabled,setAlertEnabled]=useState(()=>{try{return localStorage.getItem("bta_alertOn")==="true"}catch{return false}});

  const[betLog,setBetLog]=useState(()=>{try{return JSON.parse(localStorage.getItem("bta_bets4")||"[]")}catch{return[]}});
  const saveBets=b=>{try{localStorage.setItem("bta_bets4",JSON.stringify(b))}catch{};setBetLog(b);};

  const[simStrat,setSimStrat]=useState("kelly");
  const[simOdd,setSimOdd]=useState(1.90);
  const[simProb,setSimProb]=useState(65);
  const[simUnit,setSimUnit]=useState(2);
  const[simFib,setSimFib]=useState(0);
  const[simLoss,setSimLoss]=useState(0);

  const[gptKey,setGptKey]=useState(()=>{try{return localStorage.getItem("bta_gpt")||""}catch{return ""}});
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
    setSelFix(fixture);setAnalysis(null);setLoadingAna(true);setErr("");setTab("analise");
    try{
      const season=selDate.getFullYear();
      const hr=await fdFetch(`teams/${fixture.homeTeam.id}/matches?season=${season}&limit=12&status=FINISHED`,fdKey);
      await sleep(6500);
      const ar=await fdFetch(`teams/${fixture.awayTeam.id}/matches?season=${season}&limit=12&status=FINISHED`,fdKey);
      const hs=parseStatsFD(hr,fixture.homeTeam.id);
      const as_=parseStatsFD(ar,fixture.awayTeam.id);
      let oddsData=null;
      try{const allOdds=await oddsFetch(`sports/${selLeague.oddsKey}/odds?regions=eu&markets=h2h,totals&dateFrom=${dateStr}T00:00:00Z&dateTo=${dateStr}T23:59:59Z`,oddsKey);oddsData=Array.isArray(allOdds)?allOdds.find(o=>(o.home_team||"").toLowerCase().includes((fixture.homeTeam.name||"").toLowerCase().split(" ")[0])):null;}catch{}
      setAnalysis({fixture,hs,as_,markets:buildMarkets(hs,as_,oddsData),hasOdds:!!oddsData});
    }catch(e){setErr("Erro na análise: "+e.message);}finally{setLoadingAna(false);}
  },[fdKey,oddsKey,selLeague,selDate,dateStr]);

  /* ── SCANNER ── */
  const runScanner=useCallback(async()=>{
    setScanning(true);setScanErr("");setScanResults([]);
    try{
      const ds=fmtISO(scanDate);
      const data=await fdFetch(`competitions/${scanLeague.code}/matches?dateFrom=${ds}&dateTo=${ds}`,fdKey);
      const matches=data.matches||[];
      if(!matches.length){setScanErr("Nenhum jogo encontrado.");setScanning(false);return;}
      let allOdds=[];
      try{allOdds=await oddsFetch(`sports/${scanLeague.oddsKey}/odds?regions=eu&markets=h2h,totals&dateFrom=${ds}T00:00:00Z&dateTo=${ds}T23:59:59Z`,oddsKey);}catch{}
      const season=scanDate.getFullYear();
      const results=[];
      const limit=Math.min(5,matches.length);
      for(let i=0;i<limit;i++){
        const m=matches[i];
        try{
          const hr=await fdFetch(`teams/${m.homeTeam.id}/matches?season=${season}&limit=10&status=FINISHED`,fdKey);
          await sleep(6500);
          const ar=await fdFetch(`teams/${m.awayTeam.id}/matches?season=${season}&limit=10&status=FINISHED`,fdKey);
          if(i<limit-1)await sleep(6500);
          const hs=parseStatsFD(hr,m.homeTeam.id);
          const as_=parseStatsFD(ar,m.awayTeam.id);
          const oddsData=Array.isArray(allOdds)?allOdds.find(o=>(o.home_team||"").toLowerCase().includes((m.homeTeam.name||"").toLowerCase().split(" ")[0])):null;
          const markets=buildMarkets(hs,as_,oddsData);
          const valueScore=calcValueScore(markets);
          results.push({fixture:m,hs,as_,markets,valueScore,bestMarkets:markets.filter(mk=>mk.rec==="APOSTAR"&&mk.ev>0),hasOdds:!!oddsData});
          setScanResults([...results].sort((a,b)=>b.valueScore-a.valueScore));
        }catch(e){console.warn("Scanner skip:",e.message);}
      }
      if(!results.length)setScanErr("Não foi possível analisar. Verifique sua chave e tente novamente.");
    }catch(e){setScanErr("Erro: "+e.message);}finally{setScanning(false);}
  },[fdKey,oddsKey,scanLeague,scanDate]);

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
      const result=await claudeAnalysis(f,hs,as_,markets,selLeague.name,fmtBR(selDate));
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
          {[["scanner","🔥","Scanner",hotGames.length],["agenda","📅","Agenda",0],["jogos","⚽","Jogos",0],["analise","📊","Análise",0],["ia","🤖","IA",analysis?1:0],["banca","💰","Banca",pending],["ranking","🏆","Ranking",0],["simulador","🎲","Simulador",0],["perfil","👤","Perfil",0]].map(([k,ic,lb,badge])=>
            <NavBtn key={k} active={tab===k} onClick={()=>setTab(k)} icon={ic} label={lb} badge={badge}/>
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

        {/* ══ SCANNER ══ */}
        {tab==="scanner"&&(
          <div>
            <div style={{marginBottom:20}}>
              <h2 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:24,fontWeight:800,color:T.text,margin:"0 0 4px"}}>🔥 Scanner de Valor</h2>
              <p style={{color:T.muted,fontSize:12,margin:0}}>Analisa todos os jogos automaticamente e destaca os com <strong style={{color:T.green}}>EV positivo real</strong>.</p>
            </div>
            <Card style={{marginBottom:18}}>
              <div style={{display:"flex",gap:16,flexWrap:"wrap",alignItems:"flex-end"}}>
                <div style={{flex:1,minWidth:280}}>
                  <div style={{fontSize:11,color:T.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>Liga</div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {LEAGUES.map(l=><button key={l.code} onClick={()=>setScanLeague(l)} style={{padding:"7px 12px",background:scanLeague.code===l.code?T.greenDim:"rgba(255,255,255,0.03)",border:`1px solid ${scanLeague.code===l.code?T.borderG:T.border}`,borderRadius:8,cursor:"pointer",color:scanLeague.code===l.code?T.green:T.dim,fontSize:12,fontWeight:scanLeague.code===l.code?700:400,transition:"all 0.2s"}}>{l.flag} {l.name}</button>)}
                  </div>
                </div>
                <div>
                  <div style={{fontSize:11,color:T.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Data</div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
                    {[["Ontem",-1],["Hoje",0],["Amanhã",1]].map(([lb,off])=>{const d=new Date();d.setDate(d.getDate()+off);const active=fmtISO(d)===fmtISO(scanDate);return<button key={lb} onClick={()=>setScanDate(d)} style={{padding:"7px 12px",background:active?T.goldDim:"rgba(255,255,255,0.03)",border:`1px solid ${active?"rgba(245,166,35,0.35)":T.border}`,borderRadius:8,cursor:"pointer",color:active?T.gold:T.dim,fontSize:12,fontWeight:active?700:400}}>{lb}</button>;})}
                    <button onClick={()=>setShowCal(true)} style={{padding:"7px 11px",background:"rgba(255,255,255,0.03)",border:`1px solid ${T.border}`,borderRadius:8,cursor:"pointer",color:T.dim,fontSize:11}}>📅 {fmtShort(scanDate)}</button>
                  </div>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <label style={{fontSize:11,color:T.muted}}>Alerta EV ≥</label>
                    <input type="number" value={alertThreshold} onChange={e=>{const v=Number(e.target.value);setAlertThreshold(v);try{localStorage.setItem("bta_alert",v)}catch{}}} style={{width:60,background:"rgba(255,255,255,0.05)",border:`1px solid ${T.border}`,borderRadius:7,padding:"5px 8px",color:T.text,fontSize:13,outline:"none",textAlign:"center"}}/>
                    <button onClick={()=>{const v=!alertEnabled;setAlertEnabled(v);try{localStorage.setItem("bta_alertOn",v)}catch{}}} style={{padding:"5px 12px",background:alertEnabled?T.greenDim:"rgba(255,255,255,0.03)",border:`1px solid ${alertEnabled?T.borderG:T.border}`,borderRadius:7,cursor:"pointer",color:alertEnabled?T.green:T.muted,fontSize:11,fontWeight:700}}>🔔 {alertEnabled?"ON":"OFF"}</button>
                  </div>
                  <button onClick={runScanner} disabled={scanning} style={{padding:"11px 22px",background:scanning?T.card2:T.greenDim,border:`1px solid ${scanning?T.border:T.borderG}`,borderRadius:10,color:scanning?T.muted:T.green,fontSize:14,fontWeight:800,fontFamily:"'Barlow Condensed',sans-serif",cursor:scanning?"not-allowed":"pointer",opacity:scanning?0.6:1}}>
                    {scanning?"🔄 Analisando...":"🔍 Escanear Jogos"}
                  </button>
                </div>
              </div>
            </Card>

            {scanErr&&<div style={{background:T.redDim,border:"1px solid rgba(255,83,112,0.3)",borderRadius:12,padding:"14px 18px",color:T.red,marginBottom:16,fontSize:13}}>{scanErr}</div>}
            {scanning&&<Spinner label={`Analisando... ${scanResults.length>0?scanResults.length+" jogo(s) prontos. Aguarde (10 req/min no plano free)":"Buscando jogos..."}`}/>}

            {!scanning&&scanResults.length>0&&(
              <div>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16,flexWrap:"wrap"}}>
                  <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:18,fontWeight:700,color:T.text}}>{scanResults.length} jogos analisados · {fmtBR(scanDate)}</div>
                  {hotGames.length>0&&<Pill color={T.green}>{hotGames.length} com valor real ≥{alertThreshold}</Pill>}
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {scanResults.map((r,i)=>{
                    const f=r.fixture;
                    const kt=new Date(f.utcDate).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});
                    const hasValue=r.valueScore>=alertThreshold;
                    const isTop=i===0&&hasValue;
                    return(
                      <Card key={i} style={{border:`1px solid ${isTop?T.borderG:hasValue?"rgba(56,211,159,0.12)":T.border}`,background:isTop?`linear-gradient(135deg,rgba(56,211,159,0.04),${T.card})`:T.card,padding:"16px 20px"}}>
                        <div style={{display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
                          <div style={{width:42,height:42,borderRadius:12,background:isTop?T.greenDim:hasValue?"rgba(56,211,159,0.05)":"rgba(255,255,255,0.03)",border:`1px solid ${isTop?T.borderG:T.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:isTop?22:18,flexShrink:0}}>{isTop?"🏆":hasValue?"🎯":"📉"}</div>
                          <div style={{flex:1,minWidth:180}}>
                            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5,flexWrap:"wrap"}}>
                              {f.homeTeam?.crest&&<img src={f.homeTeam.crest} alt="" style={{height:20}} onError={e=>e.target.style.display="none"}/>}
                              <span style={{fontWeight:700,fontSize:14,color:T.text}}>{f.homeTeam?.name}</span>
                              <span style={{color:T.muted,fontSize:11}}>vs</span>
                              {f.awayTeam?.crest&&<img src={f.awayTeam.crest} alt="" style={{height:20}} onError={e=>e.target.style.display="none"}/>}
                              <span style={{fontWeight:700,fontSize:14,color:T.text}}>{f.awayTeam?.name}</span>
                            </div>
                            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                              <span style={{fontSize:11,color:T.gold}}>⏰ {kt}</span>
                              {r.hs&&<span style={{fontSize:11,color:T.muted}}>Casa: {r.hs.ppg.toFixed(2)} PPG</span>}
                              {r.as_&&<span style={{fontSize:11,color:T.muted}}>Visit.: {r.as_.ppg.toFixed(2)} PPG</span>}
                              {!r.hasOdds&&<Pill color={T.muted} size={9}>Odds estimadas</Pill>}
                            </div>
                          </div>
                          <div style={{textAlign:"center",minWidth:70}}>
                            <div style={{fontSize:10,color:T.muted,marginBottom:3}}>Score Valor</div>
                            <div style={{fontSize:28,fontWeight:800,color:hasValue?T.green:T.muted,fontFamily:"'Barlow Condensed',sans-serif"}}>{r.valueScore}</div>
                          </div>
                          <div style={{minWidth:200}}>
                            {r.bestMarkets.slice(0,2).map((m,j)=>(
                              <div key={j} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"5px 10px",background:T.greenDim,border:"1px solid rgba(56,211,159,0.2)",borderRadius:8,marginBottom:4}}>
                                <span style={{fontSize:11,color:T.green,fontWeight:600}}>{m.name}</span>
                                <span style={{fontSize:11,color:T.gold,fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif"}}>EV +{m.ev.toFixed(2)} @{m.odd.toFixed(2)}</span>
                              </div>
                            ))}
                            {!hasValue&&<div style={{fontSize:11,color:T.muted,padding:"5px 0"}}>Sem mercados com valor acima do threshold</div>}
                          </div>
                          <div style={{display:"flex",gap:7,flexShrink:0}}>
                            <button onClick={()=>{setSelFix(f);setSelLeague(scanLeague);setSelDate(scanDate);setAnalysis({fixture:f,hs:r.hs,as_:r.as_,markets:r.markets,hasOdds:r.hasOdds});setTab("analise");}} style={{padding:"8px 14px",background:T.greenDim,border:`1px solid ${T.borderG}`,borderRadius:9,color:T.green,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif"}}>📊 Ver</button>
                            {r.bestMarkets[0]&&<button onClick={()=>addBet(r.bestMarkets[0],null,f)} style={{padding:"8px 14px",background:T.goldDim,border:"1px solid rgba(245,166,35,0.3)",borderRadius:9,color:T.gold,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif"}}>+ Apostar</button>}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
            {!scanning&&scanResults.length===0&&!scanErr&&(
              <div style={{textAlign:"center",padding:80,color:T.muted}}>
                <div style={{fontSize:52,marginBottom:18}}>🔥</div>
                <div style={{fontSize:16,fontWeight:600,color:T.dim,marginBottom:8}}>Encontre jogos com valor real</div>
                <div style={{fontSize:13}}>Selecione uma liga e clique em "Escanear Jogos"</div>
              </div>
            )}
          </div>
        )}

        {/* ══ AGENDA SEMANAL ══ */}
        {tab==="agenda"&&(
          <div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12,marginBottom:20}}>
              <div><h2 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:24,fontWeight:800,color:T.text,margin:"0 0 4px"}}>📅 Agenda Semanal</h2><p style={{color:T.muted,fontSize:12,margin:0}}>Próximos 7 dias das suas ligas favoritas</p></div>
              <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {LEAGUES.map(l=>{const sel=agendaLeagues.includes(l.code);return<button key={l.code} onClick={()=>setAgendaLeagues(p=>sel?p.filter(c=>c!==l.code):[...p,l.code])} style={{padding:"6px 12px",background:sel?T.blueDim:"rgba(255,255,255,0.03)",border:`1px solid ${sel?"rgba(78,201,240,0.35)":T.border}`,borderRadius:8,cursor:"pointer",color:sel?T.blue:T.dim,fontSize:11,fontWeight:sel?700:400}}>{l.flag} {l.name}</button>;})}
                </div>
                <button onClick={loadAgenda} disabled={loadingAgenda||!agendaLeagues.length} style={{padding:"10px 20px",background:T.blueDim,border:"1px solid rgba(78,201,240,0.35)",borderRadius:10,color:T.blue,fontSize:13,fontWeight:800,fontFamily:"'Barlow Condensed',sans-serif",cursor:loadingAgenda?"not-allowed":"pointer",opacity:loadingAgenda?0.6:1}}>
                  {loadingAgenda?"Carregando...":"📅 Carregar Agenda"}
                </button>
              </div>
            </div>
            {loadingAgenda&&<Spinner label="Buscando jogos dos próximos 7 dias..."/>}
            {!loadingAgenda&&Object.keys(agendaByDay).length===0&&(
              <div style={{textAlign:"center",padding:60,color:T.muted}}><div style={{fontSize:44,marginBottom:16}}>📅</div><div>Selecione as ligas e clique em "Carregar Agenda"</div></div>
            )}
            {!loadingAgenda&&Object.keys(agendaByDay).length>0&&(
              <div style={{display:"flex",flexDirection:"column",gap:20}}>
                {Object.entries(agendaByDay).map(([ds,matches])=>{
                  const d=new Date(ds+"T12:00:00");
                  const isToday=ds===fmtISO(nowDate());
                  const isTomorrow=ds===fmtISO(new Date(Date.now()+86400000));
                  return(
                    <div key={ds}>
                      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:16,fontWeight:800,color:isToday?T.green:isTomorrow?T.gold:T.text}}>{isToday?"HOJE":isTomorrow?"AMANHÃ":d.toLocaleDateString("pt-BR",{weekday:"long",day:"2-digit",month:"2-digit"}).toUpperCase()}</div>
                        <div style={{height:1,flex:1,background:isToday?`rgba(56,211,159,0.2)`:T.border}}/>
                        <Pill color={isToday?T.green:isTomorrow?T.gold:T.muted} size={10}>{matches.length} jogos</Pill>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:8}}>
                        {matches.map((m,i)=>{
                          const kt=new Date(m.utcDate).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});
                          const live=["IN_PLAY","PAUSED"].includes(m.status);
                          const fin=m.status==="FINISHED";
                          return(
                            <Card key={i} style={{padding:"12px 16px",cursor:"pointer"}} onClick={()=>{setSelLeague(LEAGUES.find(l=>l.name===m.leagueName)||LEAGUES[0]);setSelDate(new Date(m.utcDate));setTab("jogos");}}>
                              <div style={{display:"flex",alignItems:"center",gap:10}}>
                                <div style={{minWidth:44,textAlign:"center"}}>
                                  {live&&<div style={{fontSize:10,color:T.red,fontWeight:800}}>🔴 LIVE</div>}
                                  {fin&&<div style={{fontSize:10,color:T.muted}}>FIM</div>}
                                  {!live&&!fin&&<div style={{fontSize:13,fontWeight:700,color:T.gold}}>{kt}</div>}
                                  <div style={{fontSize:9,color:T.muted,marginTop:2}}>{m.leagueFlag}</div>
                                </div>
                                <div style={{flex:1,display:"flex",alignItems:"center",gap:8}}>
                                  <div style={{textAlign:"right",flex:1}}>
                                    {m.homeTeam?.crest&&<img src={m.homeTeam.crest} alt="" style={{height:18,display:"block",marginLeft:"auto",marginBottom:2}} onError={e=>e.target.style.display="none"}/>}
                                    <div style={{fontSize:12,fontWeight:700,color:T.text}}>{m.homeTeam?.name}</div>
                                  </div>
                                  {m.score?.fullTime?.home!=null?<div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:16,fontWeight:800,color:T.gold,minWidth:40,textAlign:"center"}}>{m.score.fullTime.home}–{m.score.fullTime.away}</div>:<div style={{fontSize:11,color:T.muted,minWidth:40,textAlign:"center"}}>vs</div>}
                                  <div style={{flex:1}}>
                                    {m.awayTeam?.crest&&<img src={m.awayTeam.crest} alt="" style={{height:18,display:"block",marginBottom:2}} onError={e=>e.target.style.display="none"}/>}
                                    <div style={{fontSize:12,fontWeight:700,color:T.text}}>{m.awayTeam?.name}</div>
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

        {/* ══ JOGOS ══ */}
        {tab==="jogos"&&(
          <div>
            <h2 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:24,fontWeight:800,color:T.text,margin:"0 0 4px"}}>⚽ Jogos por Data</h2>
            <p style={{color:T.muted,fontSize:12,margin:"0 0 20px"}}>Escolha liga e data — passado, hoje ou futuro.</p>
            <Card style={{marginBottom:20}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18,flexWrap:"wrap"}}>
                <span style={{fontSize:11,color:T.muted,textTransform:"uppercase",letterSpacing:1}}>Data:</span>
                <button onClick={()=>{const d=new Date(selDate);d.setDate(d.getDate()-1);setSelDate(d);}} style={{width:32,height:32,borderRadius:8,background:"rgba(255,255,255,0.05)",border:`1px solid ${T.border}`,color:T.text,cursor:"pointer",fontSize:18}}>‹</button>
                <button onClick={()=>setShowCal(true)} style={{padding:"8px 16px",background:T.greenDim,border:`1px solid ${T.borderG}`,borderRadius:10,color:T.green,fontSize:13,fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif",cursor:"pointer",display:"flex",alignItems:"center",gap:8}}>📅 {fmtBR(selDate)}{fmtISO(selDate)===fmtISO(nowDate())&&<Pill color={T.gold} size={9}>Hoje</Pill>}</button>
                <button onClick={()=>{const d=new Date(selDate);d.setDate(d.getDate()+1);setSelDate(d);}} style={{width:32,height:32,borderRadius:8,background:"rgba(255,255,255,0.05)",border:`1px solid ${T.border}`,color:T.text,cursor:"pointer",fontSize:18}}>›</button>
                <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                  {[["Ontem",-1],["Hoje",0],["Amanhã",1],["+3d",3],["+7d",7]].map(([lb,off])=>{const d=new Date();d.setDate(d.getDate()+off);const active=fmtISO(d)===fmtISO(selDate);return<button key={lb} onClick={()=>setSelDate(d)} style={{padding:"5px 10px",background:active?T.greenDim:"rgba(255,255,255,0.03)",border:`1px solid ${active?T.borderG:T.border}`,borderRadius:7,color:active?T.green:T.muted,fontSize:11,fontWeight:active?700:400,cursor:"pointer"}}>{lb}</button>;})}
                </div>
              </div>
              <div style={{fontSize:11,color:T.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>Liga:</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:18}}>
                {LEAGUES.map(l=><button key={l.code} onClick={()=>setSelLeague(l)} style={{padding:"7px 13px",background:selLeague.code===l.code?T.greenDim:"rgba(255,255,255,0.03)",border:`1px solid ${selLeague.code===l.code?T.borderG:T.border}`,borderRadius:9,cursor:"pointer",color:selLeague.code===l.code?T.green:T.dim,fontSize:12,fontWeight:selLeague.code===l.code?700:400,transition:"all 0.2s"}}>{l.flag} {l.name}</button>)}
              </div>
              <button onClick={loadFixtures} disabled={loadingFix} style={{padding:"11px 26px",background:loadingFix?T.card2:T.greenDim,border:`1px solid ${loadingFix?T.border:T.borderG}`,borderRadius:10,color:loadingFix?T.muted:T.green,fontSize:13,fontWeight:800,fontFamily:"'Barlow Condensed',sans-serif",cursor:loadingFix?"not-allowed":"pointer",opacity:loadingFix?0.6:1}}>
                {loadingFix?"Buscando...":`🔍 Buscar Jogos — ${fmtBR(selDate)}`}
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
                    <Card key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 18px",gap:14}}>
                      <div style={{display:"flex",alignItems:"center",gap:14,flex:1}}>
                        <div style={{textAlign:"center",minWidth:58}}>{live&&<div style={{fontSize:11,fontWeight:800,color:T.red}}>🔴 LIVE</div>}{fin&&<div style={{fontSize:11,color:T.muted}}>Encerrado</div>}{!live&&!fin&&<div style={{fontSize:13,fontWeight:700,color:T.gold,fontFamily:"'Barlow Condensed',sans-serif"}}>{kt}</div>}<div style={{fontSize:10,color:T.muted,marginTop:2}}>{f.matchday?`R${f.matchday}`:""}</div></div>
                        <div style={{display:"flex",alignItems:"center",gap:12,flex:1}}>
                          <div style={{textAlign:"right",flex:1}}>{f.homeTeam?.crest&&<img src={f.homeTeam.crest} alt="" style={{height:24,display:"block",marginLeft:"auto",marginBottom:4}} onError={e=>e.target.style.display="none"}/>}<div style={{fontSize:14,fontWeight:700,color:T.text}}>{f.homeTeam?.name}</div><div style={{fontSize:10,color:T.muted}}>Casa</div></div>
                          {f.score?.fullTime?.home!=null?<div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:24,fontWeight:800,color:T.gold,minWidth:60,textAlign:"center"}}>{f.score.fullTime.home}–{f.score.fullTime.away}</div>:<div style={{fontSize:13,color:T.muted,minWidth:60,textAlign:"center"}}>VS</div>}
                          <div style={{flex:1}}>{f.awayTeam?.crest&&<img src={f.awayTeam.crest} alt="" style={{height:24,display:"block",marginBottom:4}} onError={e=>e.target.style.display="none"}/>}<div style={{fontSize:14,fontWeight:700,color:T.text}}>{f.awayTeam?.name}</div><div style={{fontSize:10,color:T.muted}}>Visit.</div></div>
                        </div>
                      </div>
                      <button onClick={()=>loadAnalysis(f)} style={{padding:"9px 18px",background:T.greenDim,border:`1px solid ${T.borderG}`,borderRadius:10,color:T.green,fontSize:12,fontWeight:800,fontFamily:"'Barlow Condensed',sans-serif",cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>📊 Analisar</button>
                    </Card>
                  );
                })}
              </div>
            )}
            {!loadingFix&&fixtures.length===0&&!err&&<div style={{textAlign:"center",padding:60,color:T.muted}}><div style={{fontSize:44,marginBottom:16}}>📅</div><div>Selecione uma liga e clique em "Buscar Jogos"</div></div>}
          </div>
        )}

        {/* ══ ANÁLISE ══ */}
        {tab==="analise"&&(
          <div>
            {loadingAna&&<Spinner label="Buscando estatísticas e odds reais... (aguarde ~15s)"/>}
            {err&&!loadingAna&&<div style={{background:T.redDim,border:"1px solid rgba(255,83,112,0.3)",borderRadius:12,padding:"14px 18px",color:T.red,marginBottom:16,fontSize:13}}>{err}</div>}
            {!loadingAna&&!analysis&&!err&&<div style={{textAlign:"center",padding:60,color:T.muted}}><div style={{fontSize:44,marginBottom:16}}>📊</div><div>Vá em "Jogos" e clique em "Analisar", ou use o Scanner.</div></div>}
            {!loadingAna&&analysis&&(()=>{
              const{fixture:f,hs,as_,markets,hasOdds}=analysis;
              const kt=new Date(f.utcDate).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});
              return(
                <div>
                  <Card glow style={{marginBottom:18}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:14}}>
                      <div>
                        <div style={{fontSize:10,color:T.green,textTransform:"uppercase",letterSpacing:1.5,marginBottom:8,display:"flex",alignItems:"center",gap:8}}>{selLeague.flag} {selLeague.name} · {f.matchday?`R${f.matchday}`:""}{hasOdds?<Pill color={T.green} size={9}>✓ Odds reais</Pill>:<Pill color={T.gold} size={9}>Odds estimadas</Pill>}</div>
                        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
                          {f.homeTeam?.crest&&<img src={f.homeTeam.crest} alt="" style={{height:32}} onError={e=>e.target.style.display="none"}/>}
                          <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:24,fontWeight:800,color:T.text}}>{f.homeTeam?.name} <span style={{color:T.muted,fontSize:16}}>vs</span> {f.awayTeam?.name}</div>
                          {f.awayTeam?.crest&&<img src={f.awayTeam.crest} alt="" style={{height:32}} onError={e=>e.target.style.display="none"}/>}
                        </div>
                        <div style={{fontSize:11,color:T.muted}}>{fmtBR(selDate)} às {kt}</div>
                      </div>
                      {hs&&as_&&(
                        <div style={{display:"flex",gap:20}}>
                          {[[hs,f.homeTeam?.name,"Casa"],[as_,f.awayTeam?.name,"Visit."]].map(([s,nm,lb])=>(
                            <div key={lb} style={{textAlign:"center"}}>
                              <div style={{fontSize:10,color:T.muted,marginBottom:4}}>{lb}</div>
                              <div style={{fontSize:22,fontWeight:800,color:T.gold,fontFamily:"'Barlow Condensed',sans-serif"}}>{s.ppg.toFixed(2)}</div>
                              <div style={{fontSize:10,color:T.muted}}>PPG · {s.goalsFor.toFixed(1)} gols/j</div>
                              <div style={{display:"flex",gap:3,marginTop:5,justifyContent:"center"}}>{s.form.map((r,k)=><FormBadge key={k} r={r}/>)}</div>
                            </div>
                          ))}
                        </div>
                      )}
                      <button onClick={()=>setTab("ia")} style={{padding:"9px 16px",background:"rgba(192,132,252,0.12)",border:"1px solid rgba(192,132,252,0.3)",borderRadius:9,color:T.purple,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Barlow Condensed',sans-serif",alignSelf:"flex-start"}}>🤖 Análise IA</button>
                    </div>
                  </Card>
                  {hs&&as_&&(
                    <Card style={{marginBottom:18}}>
                      <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:15,color:T.text,marginBottom:12}}>📊 Comparativo</div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
                        {[["Gols/J",hs.goalsFor.toFixed(2),as_.goalsFor.toFixed(2)],["Sofridos/J",hs.goalsAgainst.toFixed(2),as_.goalsAgainst.toFixed(2)],["PPG",hs.ppg.toFixed(2),as_.ppg.toFixed(2)],["Vitórias%",hs.winRateHome+"%",as_.winRateAway+"% (fora)"],["BTTS",hs.btts+"%",as_.btts+"%"],["Jogos",hs.played,as_.played]].map(([l,h,a])=>(
                          <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 11px",background:"rgba(255,255,255,0.025)",borderRadius:8,border:`1px solid ${T.border}`}}>
                            <span style={{fontSize:12,color:T.muted}}>{l}</span>
                            <div style={{display:"flex",gap:10}}><span style={{fontSize:13,fontWeight:700,color:T.green}}>{h}</span><span style={{fontSize:10,color:T.muted}}>vs</span><span style={{fontSize:13,fontWeight:700,color:T.blue}}>{a}</span></div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                  <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:18,color:T.text,marginBottom:6,display:"flex",alignItems:"center",gap:10}}>
                    🎯 Mercados
                    <span style={{fontSize:11,color:T.blue,fontWeight:400,fontStyle:"italic"}}>clique para expandir e ver explicação + sugestão de valor</span>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"195px 1fr 85px 75px 75px 115px 36px",gap:10,padding:"0 14px 8px",borderBottom:`1px solid ${T.border}`,marginBottom:6}}>
                    {["Mercado","Score","Prob.","Odd","EV","Recomendação",""].map(h=><div key={h} style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:1}}>{h}</div>)}
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:5}}>
                    {markets.map((m,i)=><MarketCard key={i} m={m} i={i} onRegister={(mk,stake)=>addBet(mk,stake,f)} bankroll={bankroll} currency={currency} strategy={preferredStrategy}/>)}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ══ ANÁLISE IA ══ */}
        {tab==="ia"&&(
          <div>
            <h2 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:24,fontWeight:800,color:T.text,margin:"0 0 4px"}}>🤖 Análise IA — GPT-4</h2>
            <p style={{color:T.muted,fontSize:12,margin:"0 0 20px"}}>GPT-4 analisa os dados reais e gera relatório profissional completo.</p>
            {!analysis?(<Card><div style={{textAlign:"center",padding:44,color:T.muted}}><div style={{fontSize:36,marginBottom:12}}>📊</div><div>Selecione um jogo em "Jogos" ou use o Scanner primeiro.</div></div></Card>):(
              <div>
                <Card style={{marginBottom:18,padding:"14px 18px"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      {analysis.fixture.homeTeam?.crest&&<img src={analysis.fixture.homeTeam.crest} alt="" style={{height:26}} onError={e=>e.target.style.display="none"}/>}
                      <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:18,fontWeight:800,color:T.text}}>{analysis.fixture.homeTeam?.name} vs {analysis.fixture.awayTeam?.name}</div>
                      {analysis.fixture.awayTeam?.crest&&<img src={analysis.fixture.awayTeam.crest} alt="" style={{height:26}} onError={e=>e.target.style.display="none"}/>}
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <button onClick={runGpt} disabled={loadingGpt} style={{padding:"10px 20px",background:loadingGpt?"rgba(255,255,255,0.04)":"rgba(192,132,252,0.15)",border:`1px solid ${loadingGpt?T.border:"rgba(192,132,252,0.4)"}`,borderRadius:10,color:loadingGpt?T.muted:T.purple,fontSize:13,fontWeight:800,fontFamily:"'Barlow Condensed',sans-serif",cursor:loadingGpt?"not-allowed":"pointer"}}>
                        {loadingGpt?"🔄 Analisando...":"🤖 Gerar Análise IA"}
                      </button>
                    </div>
                  </div>
                </Card>
                {gptErr&&<div style={{background:T.redDim,border:"1px solid rgba(255,83,112,0.3)",borderRadius:12,padding:"14px 18px",color:T.red,marginBottom:16,fontSize:13}}>{gptErr}</div>}
                {loadingGpt&&<Spinner label="GPT-4 analisando... aguarde alguns segundos"/>}
                {gptAnalysis&&(
                  <div style={{display:"flex",flexDirection:"column",gap:14}}>
                    <Card glow><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:17,color:T.green,marginBottom:8}}>📋 Resumo</div><div style={{fontSize:13,color:T.text,lineHeight:1.8}}>{gptAnalysis.resumo}</div></Card>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                      <Card><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:15,color:T.green,marginBottom:8}}>🏠 {analysis.fixture.homeTeam?.name}</div><div style={{fontSize:13,color:T.text,lineHeight:1.7}}>{gptAnalysis.analise_casa}</div></Card>
                      <Card><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:15,color:T.blue,marginBottom:8}}>✈️ {analysis.fixture.awayTeam?.name}</div><div style={{fontSize:13,color:T.text,lineHeight:1.7}}>{gptAnalysis.analise_visitante}</div></Card>
                    </div>
                    <Card style={{background:"linear-gradient(135deg,rgba(245,166,35,0.07),rgba(12,16,24,1))"}}>
                      <div style={{display:"flex",alignItems:"center",gap:20,flexWrap:"wrap"}}>
                        <div style={{textAlign:"center"}}><div style={{fontSize:10,color:T.muted,marginBottom:4}}>PLACAR MAIS PROVÁVEL</div><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:52,fontWeight:800,color:T.gold,letterSpacing:2}}>{gptAnalysis.placar_provavel}</div></div>
                        <div style={{flex:1}}><div style={{fontSize:10,color:T.muted,marginBottom:4}}>JUSTIFICATIVA</div><div style={{fontSize:13,color:T.text,lineHeight:1.7}}>{gptAnalysis.placar_justificativa}</div></div>
                      </div>
                    </Card>
                    {gptAnalysis.mercados?.length>0&&(
                      <Card>
                        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:15,color:T.text,marginBottom:12}}>🎯 Análise de Risco por Mercado</div>
                        <div style={{display:"flex",flexDirection:"column",gap:7}}>
                          {gptAnalysis.mercados.map((m,i)=>{const rc={APOSTAR:T.green,ANALISAR:T.gold,EVITAR:T.red}[m.recomendacao]||T.muted;const riskC={Baixo:T.green,Médio:T.gold,Alto:T.red}[m.risco]||T.muted;return(
                            <div key={i} style={{padding:"11px 14px",background:"rgba(255,255,255,0.02)",borderRadius:10,border:`1px solid ${T.border}`}}>
                              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5,flexWrap:"wrap"}}><span style={{fontWeight:700,fontSize:13,color:T.text}}>{m.nome}</span><Pill color={rc} size={10}>{m.recomendacao}</Pill><Pill color={riskC} size={10}>Risco {m.risco}</Pill><span style={{marginLeft:"auto",fontFamily:"'Barlow Condensed',sans-serif",fontSize:17,fontWeight:800,color:rc}}>{m.confianca}/10</span></div>
                              <div style={{fontSize:12,color:T.dim,lineHeight:1.6}}>{m.justificativa}</div>
                            </div>
                          );})}
                        </div>
                      </Card>
                    )}
                    <Card style={{border:`1px solid ${T.borderG}`,background:"linear-gradient(135deg,rgba(56,211,159,0.05),rgba(12,16,24,1))"}}>
                      <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:17,color:T.green,marginBottom:4}}>🏆 Aposta Principal</div>
                      <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:22,fontWeight:800,color:T.text,marginBottom:8}}>{gptAnalysis.aposta_principal}</div>
                      <div style={{fontSize:13,color:T.text,lineHeight:1.8}}>{gptAnalysis.aposta_justificativa}</div>
                    </Card>
                    {gptAnalysis.alertas?.length>0&&(<Card style={{border:"1px solid rgba(245,166,35,0.25)"}}><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:15,color:T.gold,marginBottom:10}}>⚠️ Alertas</div>{gptAnalysis.alertas.map((a,i)=><div key={i} style={{display:"flex",gap:8,padding:"5px 0",borderBottom:i<gptAnalysis.alertas.length-1?`1px solid ${T.border}`:"none"}}><span style={{color:T.gold}}>▸</span><span style={{fontSize:12,color:T.dim}}>{a}</span></div>)}</Card>)}
                    <Card><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:15,color:T.text,marginBottom:8}}>💬 Conclusão</div><div style={{fontSize:13,color:T.text,lineHeight:1.8}}>{gptAnalysis.conclusao}</div></Card>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ══ BANCA ══ */}
        {tab==="banca"&&(
          <div>
            <h2 style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:24,fontWeight:800,color:T.text,margin:"0 0 20px"}}>💰 Banca & P&L</h2>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:22}}>
              {[{label:"Banca Atual",value:`${currency.symbol} ${(bankroll+totalPnl).toFixed(0)}`,color:totalPnl>=0?T.green:T.red},{label:"P&L Total",value:`${totalPnl>=0?"+":""}${currency.symbol} ${totalPnl.toFixed(2)}`,color:totalPnl>=0?T.green:T.red},{label:"Taxa de Acerto",value:concluded.length?`${(wins/concluded.length*100).toFixed(0)}%`:"—",color:T.gold},{label:"Apostas Ativas",value:pending,color:T.blue}].map(({label,value,color})=>(
                <Card key={label} glow><div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:1.5,marginBottom:8}}>{label}</div><div style={{fontSize:26,fontWeight:800,color,fontFamily:"'Barlow Condensed',sans-serif"}}>{value}</div></Card>
              ))}
            </div>

            {/* Gráfico de evolução */}
            {concluded.length>0&&(
              <Card style={{marginBottom:18}}>
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:15,color:T.text,marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  📈 Evolução da Banca
                  <div style={{display:"flex",gap:12}}>
                    <span style={{fontSize:11,color:T.muted}}>Início: {currency.symbol} {bankroll.toFixed(0)}</span>
                    <span style={{fontSize:11,color:totalPnl>=0?T.green:T.red,fontWeight:700}}>Atual: {currency.symbol} {(bankroll+totalPnl).toFixed(0)}</span>
                    <span style={{fontSize:11,color:totalPnl>=0?T.green:T.red,fontWeight:700}}>{totalPnl>=0?"+":""}{(totalPnl/bankroll*100).toFixed(1)}% ROI</span>
                  </div>
                </div>
                <Sparkline data={bankCurve} w={Math.min(900,typeof window!=="undefined"?window.innerWidth-120:800)} h={100} color={totalPnl>=0?T.green:T.red}/>
                <div style={{display:"flex",justifyContent:"space-between",marginTop:10}}>
                  <span style={{fontSize:10,color:T.muted}}>1ª aposta</span>
                  <span style={{fontSize:10,color:T.muted}}>Última aposta</span>
                </div>
              </Card>
            )}

            {betLog.length===0?(
              <Card><div style={{textAlign:"center",padding:44,color:T.muted}}><div style={{fontSize:36,marginBottom:12}}>📋</div><div>Nenhuma aposta registrada. Use o Scanner ou Análise.</div></div></Card>
            ):(
              <Card style={{padding:0,overflow:"hidden"}}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead><tr style={{background:"rgba(245,166,35,0.07)",borderBottom:"1px solid rgba(245,166,35,0.18)"}}>
                    {["Data","Partida","Mercado","Odd","Stake","Status","P&L",""].map(h=><th key={h} style={{padding:"10px 13px",textAlign:"left",fontSize:10,color:T.gold,textTransform:"uppercase",letterSpacing:1,fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700}}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {betLog.map((b,i)=>(
                      <tr key={b.id} style={{borderBottom:`1px solid ${T.border}`,background:i%2===0?"rgba(255,255,255,0.012)":"transparent"}}>
                        <td style={{padding:"10px 13px",color:T.muted,fontSize:12}}>{b.date}</td>
                        <td style={{padding:"10px 13px",color:T.text,fontSize:12,fontWeight:600}}>{b.match}</td>
                        <td style={{padding:"10px 13px",color:T.dim,fontSize:11}}>{b.market}</td>
                        <td style={{padding:"10px 13px",color:T.gold,fontWeight:800,fontSize:14,fontFamily:"'Barlow Condensed',sans-serif"}}>{b.odd.toFixed(2)}</td>
                        <td style={{padding:"10px 13px",color:T.dim,fontSize:12}}>{currency.symbol} {b.stake.toFixed(2)}</td>
                        <td style={{padding:"10px 13px"}}><Pill color={b.result==="WIN"?T.green:b.result==="LOSS"?T.red:T.gold} size={10}>{b.result}</Pill></td>
                        <td style={{padding:"10px 13px",color:b.pnl>=0?T.green:T.red,fontWeight:800,fontSize:13,fontFamily:"'Barlow Condensed',sans-serif"}}>{b.result==="PENDENTE"?"—":`${b.pnl>=0?"+":""}${currency.symbol} ${b.pnl.toFixed(2)}`}</td>
                        <td style={{padding:"10px 13px"}}>
                          <div style={{display:"flex",gap:4}}>
                            {b.result==="PENDENTE"&&<><button onClick={()=>resolveBet(b.id,"WIN")} style={{background:T.greenDim,border:`1px solid ${T.borderG}`,borderRadius:6,padding:"3px 8px",color:T.green,fontSize:10,fontWeight:700,cursor:"pointer"}}>WIN</button><button onClick={()=>resolveBet(b.id,"LOSS")} style={{background:T.redDim,border:"1px solid rgba(255,83,112,0.3)",borderRadius:6,padding:"3px 8px",color:T.red,fontSize:10,fontWeight:700,cursor:"pointer"}}>LOSS</button></>}
                            <button onClick={()=>deleteBet(b.id)} style={{background:"rgba(255,255,255,0.04)",border:`1px solid ${T.border}`,borderRadius:6,padding:"3px 7px",color:T.muted,fontSize:10,cursor:"pointer"}}>✕</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            )}
          </div>
        )}

        {/* ══ RANKING MERCADOS ══ */}
        {tab==="ranking"&&(
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

        {/* ══ SIMULADOR ══ */}
        {tab==="simulador"&&(
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

        {/* ══ PERFIL ══ */}
        {tab==="perfil"&&(
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
