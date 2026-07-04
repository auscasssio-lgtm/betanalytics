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

            {combinadas.length===0?(
              <Card style={{textAlign:"center",padding:52}}>
                <div style={{fontSize:44,marginBottom:14}}>🎰</div>
                <div style={{fontSize:15,fontWeight:600,color:T.dim,marginBottom:8}}>Nenhuma seleção adicionada</div>
                <div style={{fontSize:12,color:T.muted}}>Vá em "Análise + IA", expanda um mercado com EV positivo e clique em "Adicionar à Combinada".</div>
              </Card>
            ):(
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
                  {[{l:"Seleções",v:combinadas.length,c:T.blue},{l:"Odd Total",v:combOdd.toFixed(2),c:T.gold},{l:"Prob. Real",v:combProb.toFixed(1)+"%",c:combProb>20?T.green:T.red},{l:"EV",v:(combEV>0?"+":"")+combEV.toFixed(3),c:combEV>0?T.green:T.red}].map(({l,v,c})=>(
                    <Card key={l} glow={combEV>0}>
                      <div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>{l}</div>
                      <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:26,fontWeight:800,color:c}}>{v}</div>
                    </Card>
                  ))}
                </div>

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

                {combAnalysis&&(
                  <div style={{display:"flex",flexDirection:"column",gap:12}}>
                    <div style={{padding:"20px 24px",background:combAnalysis.recomendacao==="APOSTAR"?"linear-gradient(135deg,rgba(56,211,159,0.12),rgba(12,16,24,1))":combAnalysis.recomendacao==="EVITAR"?"linear-gradient(135deg,rgba(255,83,112,0.1),rgba(12,16,24,1))":"linear-gradient(135deg,rgba(245,166,35,0.1),rgba(12,16,24,1))",border:`2px solid ${combAnalysis.recomendacao==="APOSTAR"?T.borderG:combAnalysis.recomendacao==="EVITAR"?"rgba(255,83,112,0.4)":"rgba(245,166,35,0.4)"}`,borderRadius:16}}>
                      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10,flexWrap:"wrap"}}>
                        <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:28,fontWeight:800,color:combAnalysis.recomendacao==="APOSTAR"?T.green:combAnalysis.recomendacao==="EVITAR"?T.red:T.gold}}>{combAnalysis.recomendacao==="APOSTAR"?"✅":combAnalysis.recomendacao==="EVITAR"?"❌":"⚠️"} {combAnalysis.recomendacao}</div>
                        <Pill color={combAnalysis.viabilidade==="Alta"?T.green:combAnalysis.viabilidade==="Média"?T.gold:T.red}>Viabilidade {combAnalysis.viabilidade}</Pill>
                        {combAnalysis.odd_justa&&<div style={{fontSize:12,color:T.muted}}>Odd justa estimada: <span style={{color:T.gold,fontWeight:700}}>{combAnalysis.odd_justa}</span></div>}
                      </div>
                      <div style={{fontSize:13,color:T.text,lineHeight:1.7}}>{combAnalysis.resumo}</div>
                    </div>
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
            <div style={{display:"flex",gap:6,marginBottom:20,borderBottom:`1px solid ${T.border}`,paddingBottom:14}}>
              {[["resumo","💰","Resumo"],["gestao","🛡️","Gestão"],["historico","📈","Performance"],["apostas","📋","Apostas"],["live","🔴","Live"]].map(([k,ic,lb])=>(
                <button key={k} onClick={()=>setBancaSubTab(k)} style={{padding:"8px 16px",background:bancaSubTab===k?T.greenDim:"transparent",border:`1px solid ${bancaSubTab===k?T.borderG:T.border}`,borderRadius:9,cursor:"pointer",color:bancaSubTab===k?T.green:T.muted,fontSize:12,fontWeight:bancaSubTab===k?800:400,fontFamily:"'Barlow Condensed',sans-serif",transition:"all 0.2s"}}>{ic} {lb}</button>
              ))}
            </div>

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
                {isStopLossHit&&<div style={{padding:"14px 18px",background:"linear-gradient(135deg,rgba(255,83,112,0.15),rgba(12,16,24,1))",border:"2px solid rgba(255,83,112,0.5)",borderRadius:14,marginBottom:16,display:"flex",alignItems:"center",gap:12}}><span style={{fontSize:24}}>🚨</span><div><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:16,color:T.red}}>STOP LOSS ATINGIDO</div><div style={{fontSize:12,color:T.dim}}>Você perdeu {stopLossPct.toFixed(1)}% da banca hoje. Limite configurado: {stopLoss}%. Recomendado parar por hoje.</div></div></div>}
                {isDrawdownAlert&&!isStopLossHit&&<div style={{padding:"12px 16px",background:"rgba(245,166,35,0.08)",border:"1px solid rgba(245,166,35,0.3)",borderRadius:12,marginBottom:16,display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:20}}>⚠️</span><div style={{fontSize:12,color:T.gold}}>Drawdown em {currentDrawdown.toFixed(1)}% — aproximando do limite de {maxDrawdown}%. Considere reduzir stakes.</div></div>}
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:18}}>
                  {[{l:"Banca Atual",v:`${currency.symbol} ${(bankroll+totalPnl).toFixed(0)}`,c:totalPnl>=0?T.green:T.red},{l:"P&L Total",v:`${totalPnl>=0?"+":""}${currency.symbol} ${totalPnl.toFixed(2)}`,c:totalPnl>=0?T.green:T.red},{l:"Acerto",v:concluded.length?`${(wins/concluded.length*100).toFixed(0)}%`:"—",c:T.gold},{l:"ROI",v:concluded.length?`${(totalPnl/betLog.filter(b=>b.result!=="PENDENTE").reduce((s,b)=>s+b.stake,0.01)*100).toFixed(1)}%`:"—",c:totalPnl>=0?T.green:T.red}].map(({l,v,c})=>(
                    <Card key={l} glow><div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>{l}</div><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:24,fontWeight:800,color:c}}>{v}</div></Card>
                  ))}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:18}}>
                  {[{l:"Apostas Hoje",v:dailyBets.length,c:T.blue},{l:"P&L Hoje",v:`${dailyPnl>=0?"+":""}${currency.symbol}${dailyPnl.toFixed(2)}`,c:dailyPnl>=0?T.green:T.red},{l:"Ativas",v:pending,c:T.gold}].map(({l,v,c})=>(
                    <Card key={l}><div style={{fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>{l}</div><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:22,fontWeight:800,color:c}}>{v}</div></Card>
                  ))}
                </div>
                {concluded.length>0&&<Card><div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:700,fontSize:14,color:T.text,marginBottom:10,display:"flex",justifyContent:"space-between"}}><span>📈 Evolução da Banca</span><span style={{fontSize:11,color:totalPnl>=0?T.green:T.red,fontWeight:700}}>{totalPnl>=0?"+":""}{(totalPnl/bankroll*100).toFixed(1)}% ROI</span></div><Sparkline data={bankCurve} w={Math.min(900,typeof window!=="undefined"?window.innerWidth-120:800)} h={90} color={totalPnl>=0?T.green:T.red}/></Card>}
              </div>
              );
            })()}

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
              </div>
            )}

            {bancaSubTab==="historico"&&(()=>{
              const concluded2=betLog.filter(b=>b.result!=="PENDENTE");
              if(!concluded2.length)return<Card style={{textAlign:"center",padding:52}}><div style={{fontSize:36,marginBottom:12}}>📊</div><div style={{color:T.muted}}>Sem apostas concluídas ainda.</div></Card>;

              const byMarket={};
              concluded2.forEach(b=>{
                const k=b.market||b.label||"Outros";
                if(!byMarket[k])byMarket[k]={wins:0,losses:0,pnl:0,stakes:0};
                const pnl=b.result==="WIN"?b.stake*(b.odd-1):-b.stake;
                byMarket[k].pnl+=pnl;byMarket[k].stakes+=b.stake;
                if(b.result==="WIN")byMarket[k].wins++;else byMarket[k].losses++;
              });
              const mktStats=Object.entries(byMarket).map(([k,v])=>({name:k,...v,total:v.wins+v.losses,acerto:v.wins/(v.wins+v.losses)*100,roi:v.pnl/v.stakes*100})).sort((a,b)=>b.roi-a.roi);

              const byLeague={};
              concluded2.forEach(b=>{
                const k=b.league||"—";
                if(!byLeague[k])byLeague[k]={wins:0,losses:0,pnl:0};
                if(b.result==="WIN"){byLeague[k].wins++;byLeague[k].pnl+=b.stake*(b.odd-1);}else{byLeague[k].losses++;byLeague[k].pnl-=b.stake;}
              });

              return(
              <div style={{display:"flex",flexDirection:"column",gap:18}}>
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
              </div>
              );
            })()}

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

            {bancaSubTab==="live"&&(
              <div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,flexWrap:"wrap",gap:10}}>
                  <div>
                    <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:18,color:T.red}}>🔴 Jogos ao Vivo</div>
                    <div style={{fontSize:12,color:T.muted}}>Placar em tempo real das principais ligas</div>
                  </div>
                  <button onClick={loadLiveGames} disabled={loadingLive} style={{padding:"9px 18px",background:"rgba(255,83,112,0.12)",border:"1px solid rgba(255,83,112,0.3)",borderRadius:9,color:T.red,fontSize:12,fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif",cursor:loadingLive?"not-allowed":"pointer",opacity:loadingLive?0.6:1}}>
                    {loadingLive?"⏳ Buscando...":"🔄 Atualizar"}
                  </button>
                </div>
                {loadingLive&&<Spinner label="Buscando jogos ao vivo..."/>}
                {!loadingLive&&liveGames.length===0&&(
                  <Card style={{textAlign:"center",padding:52}}>
                    <div style={{fontSize:44,marginBottom:12}}>📡</div>
                    <div style={{fontSize:15,fontWeight:600,color:T.dim,marginBottom:8}}>Nenhum jogo ao vivo agora</div>
                    <div style={{fontSize:12,color:T.muted}}>Clique em "Atualizar" para buscar jogos em andamento nas principais ligas.</div>
                  </Card>
                )}
                {!loadingLive&&liveGames.length>0&&(
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {betLog.filter(b=>b.result==="PENDENTE").length>0&&(
                      <div style={{marginBottom:8}}>
                        <div style={{fontSize:11,color:T.gold,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>⭐ Suas apostas ativas</div>
                        {liveGames.filter(g=>betLog.some(b=>b.result==="PENDENTE"&&b.match?.toLowerCase().includes(g.homeTeam?.name?.toLowerCase().split(" ")[0]||""))).map((g,i)=>(
                          <Card key={i} style={{border:"1px solid rgba(245,166,35,0.3)",background:"linear-gradient(135deg,rgba(245,166,35,0.05),rgba(12,16,24,1))",marginBottom:6,padding:"12px 16px"}}>
                            <div style={{display:"flex",alignItems:"center",gap:12}}>
                              <span style={{fontSize:14}}>{g.leagueFlag}</span>
                              <div style={{flex:1}}>
                                <div style={{fontSize:11,color:T.muted}}>{g.leagueName} · {g.minute?`${g.minute}'`:""}</div>
                                <div style={{display:"flex",alignItems:"center",gap:10}}>
                                  <span style={{fontSize:14,fontWeight:700,color:T.text}}>{g.homeTeam?.name}</span>
                                  <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:26,fontWeight:800,color:T.gold}}>{g.score?.fullTime?.home??0} – {g.score?.fullTime?.away??0}</span>
                                  <span style={{fontSize:14,fontWeight:700,color:T.text}}>{g.awayTeam?.name}</span>
                                </div>
                              </div>
                              <div style={{padding:"4px 10px",background:"rgba(255,83,112,0.12)",border:"1px solid rgba(255,83,112,0.25)",borderRadius:6,fontSize:11,fontWeight:700,color:T.red}}>🔴 AO VIVO</div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                    <div style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Todos os jogos ao vivo ({liveGames.length})</div>
                    {liveGames.map((g,i)=>(
                      <Card key={i} style={{padding:"11px 16px"}}>
                        <div style={{display:"flex",alignItems:"center",gap:12}}>
                          <span style={{fontSize:14}}>{g.leagueFlag}</span>
                          <div style={{flex:1}}>
                            <div style={{fontSize:10,color:T.muted,marginBottom:3}}>{g.leagueName} {g.minute?`· ${g.minute}'`:""}</div>
                            <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                              {g.homeTeam?.crest&&<img src={g.homeTeam.crest} alt="" style={{height:20}} onError={e=>e.target.style.display="none"}/>}
                              <span style={{fontSize:13,fontWeight:700,color:T.text}}>{g.homeTeam?.name}</span>
                              <span style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:24,fontWeight:800,color:T.gold,minWidth:60,textAlign:"center"}}>{g.score?.fullTime?.home??0} – {g.score?.fullTime?.away??0}</span>
                              {g.awayTeam?.crest&&<img src={g.awayTeam.crest} alt="" style={{height:20}} onError={e=>e.target.style.display="none"}/>}
                              <span style={{fontSize:13,fontWeight:700,color:T.text}}>{g.awayTeam?.name}</span>
                            </div>
                          </div>
                          <div style={{padding:"3px 8px",background:"rgba(255,83,112,0.1)",border:"1px solid rgba(255,83,112,0.2)",borderRadius:5,fontSize:10,fontWeight:700,color:T.red}}>LIVE</div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ══ MAIS (Ranking + Simulador + Perfil) ══ */}
        {(tab==="mais"||tab==="ranking"||tab==="simulador"||tab==="perfil")&&(
          <div>
            <div style={{display:"flex",gap:6,marginBottom:20,borderBottom:`1px solid ${T.border}`,paddingBottom:14}}>
              {[["ranking","🏆","Ranking"],["simulador","🎲","Simulador"],["perfil","👤","Perfil"]].map(([k,ic,lb])=>
                <button key={k} onClick={()=>setMaisSubTab(k)} style={{padding:"8px 16px",background:maisSubTab===k?T.greenDim:"transparent",border:`1px solid ${maisSubTab===k?T.borderG:T.border}`,borderRadius:9,cursor:"pointer",color:maisSubTab===k?T.green:T.muted,fontSize:12,fontWeight:maisSubTab===k?800:400,fontFamily:"'Barlow Condensed',sans-serif",transition:"all 0.2s"}}>{ic} {lb}</button>
              )}
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
                    {LEAGUES.map(l=><button key={l.code} onClick={()=>saveProfile({...profile,favLeague:l.code})} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 13px",background:profile.favLeague===l.code?T.blueDim:"rgba(255,255,255Não posso ajudar, eu sou apenas um modelo de linguagem e não consegui entender o que você está pedindo.
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

          {/* ══ COPA DO MUNDO 2026 — ABA ESPECIAL ══ */}
          {wcTab && (
            <div style={{ position:"fixed", inset:0, zIndex:200, background:T.bg, overflowY:"auto" }}>
              <div style={{
                position:"fixed", inset:0, zIndex:-1, overflow:"hidden",
                background:"linear-gradient(135deg,#05070f 0%,#0a1a0a 50%,#1a0a05 100%)",
              }}>
                <div style={{ position:"absolute", top:"-20%", left:"-10%", width:"50%", height:"50%", borderRadius:"50%", background:"radial-gradient(circle,rgba(245,166,35,0.06),transparent 70%)" }}/>
                <div style={{ position:"absolute", bottom:"-20%", right:"-10%", width:"60%", height:"60%", borderRadius:"50%", background:"radial-gradient(circle,rgba(56,211,159,0.04),transparent 70%)" }}/>
              </div>

              <div style={{ background:"linear-gradient(90deg,rgba(245,166,35,0.15),rgba(56,211,159,0.08),rgba(245,166,35,0.15))", borderBottom:"1px solid rgba(245,166,35,0.3)", padding:"0 24px", height:70, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100, backdropFilter:"blur(20px)" }}>
                <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                  <div style={{ width:48, height:48, borderRadius:14, background:"linear-gradient(135deg,rgba(245,166,35,0.25),rgba(56,211,159,0.10))", border:"2px solid rgba(245,166,35,0.4)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:26 }}>🏆</div>
                  <div>
                    <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:26, fontWeight:800, color:T.gold, letterSpacing:2 }}>COPA DO MUNDO 2026</div>
                    <div style={{ fontSize:10, color:T.green, letterSpacing:3, textTransform:"uppercase" }}>🇺🇸 EUA · 🇨🇦 Canadá · 🇲🇽 México · Análise com Modelo Nacional</div>
                  </div>
                </div>
                <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                  <div style={{ display:"flex", gap:5 }}>
                    {[["Ontem",-1],["Hoje",0],["Amanhã",1]].map(([lb,off]) => {
                      const d = new Date(); d.setDate(d.getDate() + off);
                      const active = fmtISO(d) === fmtISO(wcDate);
                      return (
                        <button key={lb} onClick={() => setWcDate(d)} style={{ padding:"6px 12px", background: active ? T.goldDim : "rgba(255,255,255,0.04)", border:`1px solid ${active ? "rgba(245,166,35,0.5)" : T.border}`, borderRadius:8, cursor:"pointer", color: active ? T.gold : T.muted, fontSize:11, fontWeight:active?700:400 }}>{lb}</button>
                      );
                    })}
                  </div>
                  <button onClick={() => setWcTab(false)} style={{ padding:"8px 18px", background:"rgba(255,255,255,0.05)", border:`1px solid ${T.border}`, borderRadius:9, cursor:"pointer", color:T.muted, fontSize:12, fontWeight:600 }}>✕ Fechar</button>
                </div>
              </div>

              <div style={{ padding:"28px 28px 80px", maxWidth:1200, margin:"0 auto" }}>
                <div style={{ display:"flex", gap:12, marginBottom:24, flexWrap:"wrap" }}>
                  <button onClick={runWcScanner} disabled={wcScanning} style={{ padding:"12px 28px", background: wcScanning ? T.card2 : "linear-gradient(135deg,rgba(245,166,35,0.2),rgba(56,211,159,0.1))", border:`2px solid ${wcScanning ? T.border : "rgba(245,166,35,0.5)"}`, borderRadius:12, cursor: wcScanning ? "not-allowed" : "pointer", color: wcScanning ? T.muted : T.gold, fontSize:14, fontWeight:800, fontFamily:"'Barlow Condensed',sans-serif", opacity: wcScanning ? 0.6 : 1 }}>
                    {wcScanning ? "🔄 Analisando Copa..." : "🔍 Escanear Jogos da Copa"}
                  </button>
                  <button onClick={loadWcFixtures} disabled={wcLoading} style={{ padding:"12px 22px", background:"rgba(255,255,255,0.04)", border:`1px solid ${T.border}`, borderRadius:12, cursor:"pointer", color:T.muted, fontSize:13, fontWeight:700, fontFamily:"'Barlow Condensed',sans-serif" }}>
                    {wcLoading ? "Buscando..." : "📅 Ver Jogos do Dia"}
                  </button>
                </div>

                {wcError && <div style={{ background:T.redDim, border:"1px solid rgba(255,83,112,0.3)", borderRadius:12, padding:"14px 18px", color:T.red, marginBottom:20, fontSize:13 }}>{wcError}</div>}
                {(wcScanning || wcLoading) && <Spinner label="Consultando SofaScore para dados da Copa do Mundo..."/>}

                {!wcLoading && wcFixtures.length > 0 && wcScanResults.length === 0 && (
                  <div style={{ marginBottom:28 }}>
                    <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:18, color:T.gold, marginBottom:14 }}>📅 Jogos — {fmtBR(wcDate)}</div>
                    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                      {wcFixtures.map((f, i) => {
                        const kt = new Date(f.utcDate).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});
                        return (
                          <div key={i} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(245,166,35,0.15)", borderRadius:14, padding:"16px 20px", display:"flex", alignItems:"center", gap:16 }}>
                            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:22, fontWeight:800, color:T.gold, minWidth:55 }}>{kt}</div>
                            <div style={{ display:"flex", alignItems:"center", gap:12, flex:1 }}>
                              {f.homeTeam?.crest && <img src={f.homeTeam.crest} alt="" style={{ height:32 }} onError={e => e.target.style.display="none"}/>}
                              <span style={{ fontSize:16, fontWeight:700, color:T.text }}>{f.homeTeam?.name}</span>
                              {f.score?.fullTime?.home != null ? (
                                <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:26, fontWeight:800, color:T.gold, margin:"0 8px" }}>{f.score.fullTime.home} – {f.score.fullTime.away}</span>
                              ) : (
                                <span style={{ color:T.muted, margin:"0 8px", fontSize:14 }}>vs</span>
                              )}
                              {f.awayTeam?.crest && <img src={f.awayTeam.crest} alt="" style={{ height:32 }} onError={e => e.target.style.display="none"}/>}
                              <span style={{ fontSize:16, fontWeight:700, color:T.text }}>{f.awayTeam?.name}</span>
                            </div>
                            <button onClick={() => { setSelFix(f); setSelLeague(WC_LEAGUE); loadAnalysis(f); setWcTab(false); }} style={{ padding:"8px 18px", background:"rgba(245,166,35,0.12)", border:"1px solid rgba(245,166,35,0.35)", borderRadius:9, cursor:"pointer", color:T.gold, fontSize:12, fontWeight:800, fontFamily:"'Barlow Condensed',sans-serif" }}>📊 Analisar</button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {!wcScanning && wcScanResults.length > 0 && (
                  <div>
                    <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:18, flexWrap:"wrap" }}>
                      <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:20, fontWeight:800, color:T.gold }}>🏆 {wcScanResults.length} jogos analisados · {fmtBR(wcDate)}</div>
                      <span style={{ fontSize:10, color:T.green, background:T.greenDim, border:`1px solid ${T.borderG}`, borderRadius:6, padding:"2px 8px" }}>Modelo Nacional · Monte Carlo 500sim · xG SofaScore</span>
                    </div>

                    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                      {wcScanResults.map((r, i) => {
                        const f = r.fixture;
                        const kt = new Date(f.utcDate).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});
                        const best = r.bestMarkets[0];
                        const conf = best?.confidence || 50;
                        const confColor = conf >= 70 ? T.green : conf >= 50 ? T.gold : T.red;

                        return (
                          <div key={i} style={{ background: i === 0 ? "linear-gradient(135deg,rgba(245,166,35,0.08),rgba(12,16,24,1))" : "rgba(255,255,255,0.02)", border:`${i === 0 ? "2px" : "1px"} solid ${i === 0 ? "rgba(245,166,35,0.4)" : "rgba(245,166,35,0.12)"}`, borderRadius:16, padding:"20px 22px" }}>
                            <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:14, flexWrap:"wrap" }}>
                              <div style={{ fontSize:10, color:T.muted, minWidth:55 }}>⏰ {kt}</div>
                              <div style={{ display:"flex", alignItems:"center", gap:10, flex:1 }}>
                                {f.homeTeam?.crest && <img src={f.homeTeam.crest} alt="" style={{ height:28 }} onError={e => e.target.style.display="none"}/>}
                                <span style={{ fontSize:15, fontWeight:800, color:T.text }}>{f.homeTeam?.name}</span>
                                <span style={{ color:T.muted }}>vs</span>
                                {f.awayTeam?.crest && <img src={f.awayTeam.crest} alt="" style={{ height:28 }} onError={e => e.target.style.display="none"}/>}
                                <span style={{ fontSize:15, fontWeight:800, color:T.text }}>{f.awayTeam?.name}</span>
                              </div>
                              <div style={{ textAlign:"center", minWidth:60 }}>
                                <div style={{ fontSize:9, color:T.muted, marginBottom:2 }}>Score</div>
                                <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:28, fontWeight:800, color: r.valueScore >= 20 ? T.green : T.muted }}>{r.valueScore}</div>
                              </div>
                            </div>

                            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:14 }}>
                              {[
                                { l:"λ Casa",    v: best?.lambdaHome?.toFixed(2) || "—", c:T.green },
                                { l:"λ Visit.",  v: best?.lambdaAway?.toFixed(2) || "—", c:T.blue  },
                                { l:"xG Casa",   v: best?.xGHome?.toFixed(2)     || "—", c:T.green },
                                { l:"Confiança", v: conf + "%",                          c:confColor},
                              ].map(({ l, v, c }) => (
                                <div key={l} style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:10, padding:"10px 12px", textAlign:"center" }}>
                                  <div style={{ fontSize:9, color:T.muted, marginBottom:3 }}>{l}</div>
                                  <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:20, fontWeight:800, color:c }}>{v}</div>
                                </div>
                              ))}
                            </div>

                            {r.h2h?.total > 0 && (
                              <div style={{ display:"flex", gap:12, alignItems:"center", padding:"8px 12px", background:"rgba(255,255,255,0.02)", border:`1px solid ${T.border}`, borderRadius:9, marginBottom:12, flexWrap:"wrap" }}>
                                <span style={{ fontSize:10, color:T.muted }}>H2H ({r.h2h.total} jogos):</span>
                                <span style={{ fontSize:11, fontWeight:700, color:T.green }}>Casa {r.h2h.homeWins}V</span>
                                <span style={{ fontSize:11, color:T.muted }}>{r.h2h.draws}E</span>
                                <span style={{ fontSize:11, fontWeight:700, color:T.blue }}>{r.h2h.awayWins}V Visit.</span>
                                {r.h2h.avgGoals && <span style={{ fontSize:11, color:T.gold }}>· {r.h2h.avgGoals} gols/j médio</span>}
                              </div>
                            )}

                            {r.lineups?.confirmed && (
                              <div style={{ display:"flex", gap:12, marginBottom:12, flexWrap:"wrap" }}>
                                {r.lineups.home.keyMissing > 0 && <div style={{ padding:"4px 10px", background:"rgba(255,83,112,0.08)", border:"1px solid rgba(255,83,112,0.2)", borderRadius:7, fontSize:11, color:T.red }}>🚑 Casa: {r.lineups.home.keyMissing} desfalque(s)</div>}
                                {r.lineups.away.keyMissing > 0 && <div style={{ padding:"4px 10px", background:"rgba(255,83,112,0.08)", border:"1px solid rgba(255,83,112,0.2)", borderRadius:7, fontSize:11, color:T.red }}>🚑 Visit.: {r.lineups.away.keyMissing} desfalque(s)</div>}
                                {r.lineups.home.keyMissing === 0 && r.lineups.away.keyMissing === 0 && <div style={{ padding:"4px 10px", background:T.greenDim, border:`1px solid ${T.borderG}`, borderRadius:7, fontSize:11, color:T.green }}>✅ Escalações completas confirmadas</div>}
                              </div>
                            )}

                            <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:14 }}>
                              {r.bestMarkets.slice(0, 3).map((m, j) => (
                                <div key={j} style={{ padding:"6px 12px", background:"rgba(245,166,35,0.08)", border:"1px solid rgba(245,166,35,0.25)", borderRadius:8 }}>
                                  <span style={{ fontSize:11, color:T.gold, fontWeight:700 }}>{m.name}</span>
                                  <span style={{ fontSize:11, color:T.green, marginLeft:6 }}>@{m.odd.toFixed(2)} EV+{m.ev}</span>
                                </div>
                              ))}
                            </div>

                            <div style={{ display:"flex", gap:8 }}>
                              <button onClick={() => { setSelLeague(WC_LEAGUE); setSelDate(wcDate); loadAnalysis(r.fixture); setWcTab(false); }} style={{ padding:"8px 18px", background:"rgba(245,166,35,0.12)", border:"1px solid rgba(245,166,35,0.35)", borderRadius:9, cursor:"pointer", color:T.gold, fontSize:12, fontWeight:800, fontFamily:"'Barlow Condensed',sans-serif" }}>📊 Análise Completa + IA</button>
                              {r.bestMarkets[0] && <button onClick={() => addBet(r.bestMarkets[0], null, r.fixture)} style={{ padding:"8px 14px", background:T.goldDim, border:"1px solid rgba(245,166,35,0.3)", borderRadius:9, cursor:"pointer", color:T.gold, fontSize:11, fontWeight:700, fontFamily:"'Barlow Condensed',sans-serif" }}>+ Apostar</button>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {!wcScanning && !wcLoading && wcScanResults.length === 0 && wcFixtures.length === 0 && !wcError && (
                  <div style={{ textAlign:"center", padding:80 }}>
                    <div style={{ fontSize:72, marginBottom:20 }}>🏆</div>
                    <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:24, fontWeight:800, color:T.gold, marginBottom:10 }}>Copa do Mundo 2026</div>
                    <div style={{ fontSize:14, color:T.muted, marginBottom:8 }}>EUA · Canadá · México · 48 seleções · 104 jogos</div>
                    <div style={{ fontSize:12, color:T.dim, maxWidth:400, margin:"0 auto" }}>Clique em <strong style={{ color:T.gold }}>Escanear Jogos da Copa</strong> para análise completa com modelo nacional (xG SofaScore, H2H, escalações, Monte Carlo 500 simulações).</div>
                  </div>
                )}
              </div>
            </div>
          )}

        </main>

        <footer style={{ borderTop: `1px solid ${T.border}`, padding: "11px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 10, color: "#151515" }}>⚽ BetAnalytics · SofaScore API + the-odds-api.com</span>
          <span style={{ fontSize: 10, color: T.red }}>⚠️ Jogue com responsabilidade. Apostas envolvem risco real de perda financeira.</span>
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
