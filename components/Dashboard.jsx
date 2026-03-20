"use client";
import { useState, useMemo, useEffect } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, ComposedChart, Cell, PieChart, Pie } from "recharts";

const MONTHS=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const fmt=n=>n>=1000?(n/1000).toFixed(1)+"k":n.toFixed(0);
const fmtCHF=n=>"CHF "+n.toLocaleString("de-CH",{minimumFractionDigits:0,maximumFractionDigits:0});
const fmtPct=n=>(n>0?"+":"")+n.toFixed(1)+"%";
const sc={green:"#10b981",amber:"#f59e0b",red:"#ef4444"};
const sb={green:"rgba(16,185,129,0.10)",amber:"rgba(245,158,11,0.10)",red:"rgba(239,68,68,0.10)"};
const CC=["#6366f1","#22d3ee","#f59e0b","#ec4899","#10b981"];
const NUM_UNITS=11;

// ===== RAW BOOKING DATA (confirmed+modified only) =====
// Each booking: [check-in month (1-12), revenue, room_nights, bookings_count, source, adr_implicit, lead_time, los, room_type]
// We store monthly aggregates + source + room for filtering
const M25=[{m:1,bk:11,rev:5637.54,rn:34,arn:341,occ:10.0,adr:165.81,rpar:16.53,los:2.7,lead:6.7,bud:8000},{m:2,bk:25,rev:8652.27,rn:92,arn:308,occ:29.9,adr:94.05,rpar:28.09,los:3.7,lead:8.2,bud:10135.18},{m:3,bk:28,rev:17692.23,rn:124,arn:341,occ:36.4,adr:142.68,rpar:51.88,los:4.2,lead:26.1,bud:20846.19},{m:4,bk:41,rev:27295.59,rn:170,arn:330,occ:51.5,adr:160.56,rpar:82.71,los:4.1,lead:33.4,bud:33756.04},{m:5,bk:41,rev:22728.88,rn:152,arn:341,occ:44.6,adr:149.53,rpar:66.65,los:3.5,lead:43.9,bud:27534.92},{m:6,bk:41,rev:32309.40,rn:201,arn:330,occ:60.9,adr:160.74,rpar:97.91,los:3.8,lead:53.3,bud:33572.64},{m:7,bk:65,rev:40367.99,rn:231,arn:341,occ:67.7,adr:174.75,rpar:118.38,los:3.5,lead:86.0,bud:48258.68},{m:8,bk:30,rev:35070.35,rn:183,arn:341,occ:53.7,adr:191.64,rpar:102.85,los:4.6,lead:88.4,bud:37898.91},{m:9,bk:31,rev:20799.10,rn:130,arn:330,occ:39.4,adr:159.99,rpar:63.03,los:3.7,lead:21.2,bud:23202.56},{m:10,bk:51,rev:26194.19,rn:209,arn:341,occ:61.3,adr:125.33,rpar:76.82,los:4.0,lead:42.3,bud:29649.73},{m:11,bk:8,rev:2236.14,rn:24,arn:330,occ:7.3,adr:93.17,rpar:6.78,los:3.0,lead:11.0,bud:5235.86},{m:12,bk:14,rev:9139.79,rn:53,arn:341,occ:15.5,adr:172.45,rpar:26.80,los:3.8,lead:52.4,bud:8215.43}];
const M26=[{m:1,bk:2,rev:557.23,rn:6,arn:341,occ:1.8,adr:92.87,rpar:1.63,los:3.0,lead:2.0,bud:8000},{m:2,bk:26,rev:10251.56,rn:87,arn:308,occ:28.2,adr:117.83,rpar:33.28,los:3.3,lead:11.5,bud:10135.18},{m:3,bk:41,rev:16854.31,rn:146,arn:341,occ:42.8,adr:115.44,rpar:49.43,los:3.6,lead:18.3,bud:20846.19},{m:4,bk:33,rev:22419.26,rn:142,arn:330,occ:43.0,adr:157.88,rpar:67.94,los:4.2,lead:53.8,bud:33756.04},{m:5,bk:24,rev:13821.53,rn:89,arn:341,occ:26.1,adr:155.30,rpar:40.53,los:3.7,lead:81.2,bud:27534.92},{m:6,bk:13,rev:11247.54,rn:66,arn:330,occ:20.0,adr:170.42,rpar:34.08,los:4.2,lead:135.9,bud:33572.64},{m:7,bk:32,rev:29690.82,rn:133,arn:341,occ:39.0,adr:223.24,rpar:87.07,los:3.9,lead:190.5,bud:48258.68},{m:8,bk:5,rev:5586.93,rn:33,arn:341,occ:9.7,adr:169.30,rpar:16.38,los:6.6,lead:226.8,bud:37898.91},{m:9,bk:8,rev:3054.39,rn:19,arn:330,occ:5.8,adr:160.76,rpar:9.26,los:2.4,lead:214.1,bud:23202.56},{m:10,bk:1,rev:613.20,rn:3,arn:341,occ:0.9,adr:204.40,rpar:1.80,los:3.0,lead:293.0,bud:29649.73},{m:11,bk:0,rev:0,rn:0,arn:330,occ:0,adr:0,rpar:0,los:0,lead:0,bud:5235.86},{m:12,bk:1,rev:952.00,rn:6,arn:341,occ:1.8,adr:158.67,rpar:2.79,los:6.0,lead:351.0,bud:8215.43}];
const OTB=[{m:1,r25:5637.54,rn25:34,bk25:11,r26:557.23,rn26:6,bk26:2,d:-5080.31,dp:-90.1},{m:2,r25:8652.27,rn25:92,bk25:25,r26:10251.56,rn26:87,bk26:26,d:1599.29,dp:18.5},{m:3,r25:14580.37,rn25:100,bk25:21,r26:16854.31,rn26:146,bk26:41,d:2273.94,dp:15.6},{m:4,r25:14963.75,rn25:84,bk25:20,r26:22419.26,rn26:142,bk26:33,d:7455.51,dp:49.8},{m:5,r25:11513.24,rn25:69,bk25:15,r26:13821.53,rn26:89,bk26:24,d:2308.29,dp:20.0},{m:6,r25:5750.38,rn25:35,bk25:9,r26:11247.54,rn26:66,bk26:13,d:5497.16,dp:95.6},{m:7,r25:18948.07,rn25:109,bk25:24,r26:29690.82,rn26:133,bk26:32,d:10742.75,dp:56.7},{m:8,r25:17587.21,rn25:90,bk25:12,r26:5586.93,rn26:33,bk26:5,d:-12000.28,dp:-68.2},{m:9,r25:0,rn25:0,bk25:0,r26:3054.39,rn26:19,bk26:8,d:3054.39,dp:0},{m:10,r25:2235.77,rn25:12,bk25:2,r26:613.20,rn26:3,bk26:1,d:-1622.57,dp:-72.6},{m:11,r25:0,rn25:0,bk25:0,r26:0,rn26:0,bk26:0,d:0,dp:0},{m:12,r25:0,rn25:0,bk25:0,r26:952.00,rn26:6,bk26:1,d:952.00,dp:0}];
const WEEKS=[{w:4,ws:"19 Jan",bk:1,rev:363.75,rn:4,los:4.0,occ:5.2},{w:5,ws:"26 Jan",bk:1,rev:193.48,rn:2,los:2.0,occ:2.6},{w:6,ws:"02 Feb",bk:5,rev:1427.96,rn:14,los:2.8,occ:18.2},{w:7,ws:"09 Feb",bk:4,rev:1242.19,rn:14,los:3.5,occ:18.2},{w:8,ws:"16 Feb",bk:15,rev:6065.49,rn:45,los:3.0,occ:58.4},{w:9,ws:"23 Feb",bk:2,rev:1515.92,rn:14,los:7.0,occ:18.2},{w:10,ws:"02 Mar",bk:8,rev:2496.97,rn:24,los:3.0,occ:31.2},{w:11,ws:"09 Mar",bk:8,rev:3111.85,rn:28,los:3.5,occ:36.4},{w:12,ws:"16 Mar",bk:16,rev:6401.69,rn:60,los:3.8,occ:77.9},{w:13,ws:"23 Mar",bk:8,rev:4337.27,rn:31,los:3.9,occ:40.3},{w:14,ws:"30 Mar",bk:7,rev:4409.79,rn:29,los:4.1,occ:37.7},{w:15,ws:"06 Apr",bk:12,rev:8204.25,rn:49,los:4.1,occ:63.6},{w:16,ws:"13 Apr",bk:4,rev:2262.77,rn:16,los:4.0,occ:20.8},{w:17,ws:"20 Apr",bk:5,rev:3010.80,rn:20,los:4.0,occ:26.0},{w:18,ws:"27 Apr",bk:9,rev:7554.04,rn:49,los:5.1,occ:63.6},{w:20,ws:"11 May",bk:9,rev:4854.28,rn:29,los:3.2,occ:37.7},{w:21,ws:"18 May",bk:5,rev:2551.82,rn:16,los:3.2,occ:20.8},{w:22,ws:"25 May",bk:7,rev:3899.57,rn:26,los:3.7,occ:33.8},{w:23,ws:"01 Jun",bk:1,rev:1044.28,rn:7,los:7.0,occ:9.1},{w:24,ws:"08 Jun",bk:1,rev:766.00,rn:4,los:4.0,occ:5.2},{w:25,ws:"15 Jun",bk:4,rev:4999.42,rn:28,los:4.8,occ:36.4},{w:26,ws:"22 Jun",bk:6,rev:3903.87,rn:24,los:3.5,occ:31.2},{w:27,ws:"29 Jun",bk:1,rev:533.97,rn:3,los:3.0,occ:3.9},{w:28,ws:"06 Jul",bk:10,rev:6970.11,rn:26,los:2.6,occ:33.8},{w:29,ws:"13 Jul",bk:16,rev:16521.21,rn:67,los:4.2,occ:87.0},{w:30,ws:"20 Jul",bk:5,rev:5559.85,rn:36,los:5.8,occ:46.8},{w:31,ws:"27 Jul",bk:2,rev:1188.73,rn:7,los:3.5,occ:9.1},{w:32,ws:"03 Aug",bk:1,rev:2370.00,rn:11,los:11.0,occ:14.3},{w:34,ws:"17 Aug",bk:1,rev:1034.63,rn:7,los:7.0,occ:9.1},{w:35,ws:"24 Aug",bk:2,rev:1633.22,rn:12,los:6.0,occ:15.6},{w:36,ws:"31 Aug",bk:4,rev:1125.45,rn:7,los:1.8,occ:9.1},{w:37,ws:"07 Sep",bk:1,rev:400.32,rn:3,los:3.0,occ:3.9},{w:38,ws:"14 Sep",bk:2,rev:988.02,rn:6,los:3.0,occ:7.8},{w:40,ws:"28 Sep",bk:1,rev:540.60,rn:3,los:3.0,occ:3.9},{w:41,ws:"05 Oct",bk:1,rev:613.20,rn:3,los:3.0,occ:3.9},{w:52,ws:"21 Dec",bk:1,rev:952.00,rn:6,los:6.0,occ:7.8}];
// Channels: Amenitiz + Prenotazione Manuale merged into "Direct"
const SRC26=[{source:"Booking.com",bk:143,rev:84556.02,rn:535},{source:"Direct",bk:30,rev:23758.10,rn:151},{source:"Airbnb",bk:12,rev:5147.05,rn:37},{source:"Expedia",bk:1,rev:1587.60,rn:7}];
const RM26=[{room:"Sup. 2-Rooms Apt N°4",bk:19,rev:15274.94,rn:78,los:4.11,lead:123.6},{room:"Sup. Penthouse N°18",bk:17,rev:14982.58,rn:85,los:4.47,lead:96.1},{room:"2-Rooms Apt N°17",bk:17,rev:12340.43,rn:71,los:3.76,lead:75.0},{room:"Sup. 1-Room Apt N°9",bk:16,rev:11634.93,rn:81,los:4.88,lead:67.4},{room:"Studio N°7",bk:18,rev:11299.61,rn:79,los:4.39,lead:100.3},{room:"Studio N°12",bk:26,rev:11197.03,rn:91,los:3.50,lead:95.7},{room:"Sunny Nr. 3",bk:18,rev:9985.79,rn:52,los:2.89,lead:79.4},{room:"Studio N°8",bk:15,rev:7945.45,rn:50,los:3.33,lead:81.7},{room:"Charming Nr 15",bk:18,rev:7868.56,rn:59,los:3.28,lead:76.8},{room:"2-Rooms Apt N°10",bk:10,rev:6758.74,rn:40,los:4.00,lead:74.5},{room:"Cozy Studio Nr. 1",bk:12,rev:5760.71,rn:44,los:3.42,lead:60.1}];
const BUDGET_MO=[8000,10135.18,20846.19,33756.04,27534.92,33572.64,48258.68,37898.91,23202.56,29649.73,5235.86,8215.43];
const BUDGET_FY=286306.14;
const TOTAL26={rev:115048.77,rn:730,bk:186,adr:157.60,revpar:28.65,occ:18.2,los:3.8,lead:86.7};
const TOTAL25={rev:248123.47,rn:1603,bk:386,adr:154.79,revpar:61.80,occ:39.9,los:3.8,lead:47.3};
const OTB25={rev:99868.60,rn:625,bk:139};
const CANCEL={r25:13.6,r26:18.1};

// ===== HELPERS =====
function rangeAgg(data, from, to) {
  const sl = data.filter(m => m.m >= from && m.m <= to);
  const rev = sl.reduce((a,m)=>a+m.rev,0);
  const rn = sl.reduce((a,m)=>a+m.rn,0);
  const bk = sl.reduce((a,m)=>a+m.bk,0);
  const arn = sl.reduce((a,m)=>a+m.arn,0);
  const bud = sl.reduce((a,m)=>a+m.bud,0);
  const occ = arn>0?rn/arn*100:0;
  const adr = rn>0?rev/rn:0;
  const rpar = arn>0?rev/arn:0;
  const los = bk>0?sl.reduce((a,m)=>a+m.los*m.bk,0)/bk:0;
  const lead = bk>0?sl.reduce((a,m)=>a+m.lead*m.bk,0)/bk:0;
  return {rev,rn,bk,arn,bud,occ,adr,rpar,los,lead};
}
function delta(a,b){return b!==0?((a-b)/b*100):0;}

// ===== ACTIONS =====
const generateActions=()=>{const red=[],amber=[],green=[];
const ytdB=M26.slice(0,3).reduce((a,m)=>a+m.bud,0),ytdA=M26.slice(0,3).reduce((a,m)=>a+m.rev,0),ytdV=(ytdA-ytdB)/ytdB*100;
if(ytdV<-30)red.push({title:"YTD Revenue Critical: "+ytdV.toFixed(0)+"% Below Budget",metric:fmtCHF(ytdA)+" vs "+fmtCHF(ytdB)+" budget",actions:["Review pricing for remaining March dates","Activate last-minute deals on Booking.com & Airbnb","Flash promotions for shoulder weeks","Audit Amenitiz booking engine for conversion"],impact:"Closing 50% of gap = "+fmtCHF(Math.abs(ytdA-ytdB)*0.5)+" additional revenue"});
red.push({title:"January: -94% vs Budget (CHF 491 vs CHF 8,000)",metric:"Only 2 bookings / 6 room nights",actions:["Reassess CHF 8k January budget for Locarno winter","Winter packages (ski + city break) for Jan 2027","Long-stay discounts for 7+ nights","Partner with local events for low-season demand"],impact:"Budget revision needed for Q1 2027"});
if(OTB[7].dp<-50)red.push({title:"August OTB: "+OTB[7].dp+"% Behind STLY",metric:fmtCHF(OTB[7].r26)+" vs "+fmtCHF(OTB[7].r25)+" STLY ("+OTB[7].bk26+" vs "+OTB[7].bk25+" bk)",actions:["Peak season gap is critical","Targeted summer campaigns","Ensure all rooms visible on all OTAs","Early-bird non-refundable discounts","Check Locarno competitor pricing"],impact:"Closing gap = "+fmtCHF(Math.abs(OTB[7].d))+" peak revenue"});
const marV=(M26[2].rev-M26[2].bud)/M26[2].bud*100;if(marV<-30)red.push({title:"March: "+marV.toFixed(0)+"% Below Budget",metric:fmtCHF(M26[2].rev)+" vs "+fmtCHF(M26[2].bud)+" \u2014 month half over",actions:["Last-minute promotions","Mobile-first Booking.com deals","'Stay 3 pay 2' offers","Check all rooms are open for booking"],impact:"Each booking at avg ADR (CHF 99) adds ~CHF 376"});
const aprV=(M26[3].rev-M26[3].bud)/M26[3].bud*100;if(aprV<-30)red.push({title:"April OTB: "+aprV.toFixed(0)+"% Below Budget",metric:fmtCHF(M26[3].rev)+" vs "+fmtCHF(M26[3].bud),actions:["Easter/spring demand potential","Increase OTA visibility","'Locarno Spring Break' packages","Direct offers to past guests via Amenitiz"],impact:"April 2025 delivered "+fmtCHF(M25[3].rev)});
const adrD=(TOTAL26.adr-TOTAL25.adr)/TOTAL25.adr*100;if(adrD<-5)amber.push({title:"ADR Erosion: "+adrD.toFixed(1)+"% vs 2025",metric:"CHF "+TOTAL26.adr+" vs CHF "+TOTAL25.adr,actions:["Review rate strategy","Check room type mix","Compare competitor rates","Value-adds instead of rate cuts"],impact:"CHF 10 ADR increase \u00d7 "+TOTAL26.rn+" RN = "+fmtCHF(TOTAL26.rn*10)});
if(CANCEL.r26>15)amber.push({title:"Cancellation Rate: "+CANCEL.r26+"% (up from "+CANCEL.r25+"%)",metric:"41 cancellations \u2014 83% from Booking.com",actions:["Review Booking.com cancellation policies","Non-refundable rate options","Analyze cancellation clustering","Expedia: 4/5 bookings cancelled"],impact:"Reducing by 5% retains ~10 bookings"});
amber.push({title:"OTA Dependency: Booking.com at 79%",metric:"143/186 bookings \u2014 high commission exposure (~15%)",actions:["Boost direct bookings on residenzamotta.ch","'Book Direct' best-rate guarantee","Grow Airbnb (currently 6%)","Google Hotel Ads"],impact:"10% shift to direct saves ~"+fmtCHF(TOTAL26.rev*0.10*0.15)+" commissions"});
if(OTB[4].dp<-5)amber.push({title:"May OTB: "+OTB[4].dp+"% Behind STLY",metric:fmtCHF(OTB[4].r26)+" vs "+fmtCHF(OTB[4].r25),actions:["Spring/pre-summer packages","Competitive Ascension weekend pricing"],impact:"May 2025 ended at "+fmtCHF(M25[4].rev)});
amber.push({title:"Cancellation Clusters: Mar, Jun, Jul = 6 Each",metric:"18 of 41 cancellations in 3 months",actions:["Investigate drivers per month","Stricter Jul policies"],impact:"Half of July's 6 cancellations = significant peak revenue"});
const dp=delta(TOTAL26.rev,OTB25.rev);if(dp>0)green.push({title:"Total OTB: +"+dp.toFixed(1)+"% Ahead of STLY",metric:fmtCHF(TOTAL26.rev)+" vs "+fmtCHF(OTB25.rev),actions:["Maintain momentum","Monitor pace weekly"],impact:"Strong foundation"});
if(OTB[6].dp>50)green.push({title:"July OTB: +"+OTB[6].dp+"% vs STLY",metric:fmtCHF(OTB[6].r26)+" vs "+fmtCHF(OTB[6].r25)+" \u2014 32 vs 22 bk",actions:["Consider rate increases","W29 at 89.6% \u2014 push for sellout","Restrict discounting"],impact:"CHF 10 increase on 138 RN = CHF 1.4k"});
if(OTB[5].dp>100)green.push({title:"June OTB: +"+OTB[5].dp+"% vs STLY",metric:fmtCHF(OTB[5].r26)+" vs "+fmtCHF(OTB[5].r25),actions:["Maintain pricing","Monitor weekly to optimize yield"],impact:"Jun 2025 ended at "+fmtCHF(M25[5].rev)+" \u2014 on track"});
if(OTB[3].dp>20)green.push({title:"April Room Nights +64% vs STLY",metric:"118 vs 72 RN \u2014 strong demand",actions:["Focus on ADR optimization","Check if group bookings pulling avg down"],impact:"Volume excellent \u2014 maximize rate"});
green.push({title:"Lead Time: 95 Days (vs 47 in 2025)",metric:"Guests booking 2\u00d7 further ahead",actions:["Dynamic pricing with advance visibility","Early-bird non-refundable rates"],impact:"Better forecasting & ops planning"});
green.push({title:"LOS Stable: 3.9 Nights",metric:"vs 3.8 in 2025",actions:["Min stay for peak periods","Stay extension discounts"],impact:"+0.1 night at current ADR = ~CHF 2.4k/year"});
return{red,amber,green};};

// ===== COMPONENTS =====
const KPICard=({label,value,sub,pctLabel,status})=>(<div style={{background:sb[status]||"rgba(255,255,255,0.04)",border:"1px solid "+(sc[status]||"rgba(255,255,255,0.08)"),borderRadius:12,padding:"18px 22px",display:"flex",flexDirection:"column",gap:3,minWidth:0}}>
<div style={{fontSize:11,fontWeight:500,color:"rgba(255,255,255,0.5)",textTransform:"uppercase",letterSpacing:1}}>{label}</div>
<div style={{fontSize:26,fontWeight:700,color:"#fff"}}>{value}</div>
<div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
{sub&&<span style={{fontSize:12,color:"rgba(255,255,255,0.5)"}}>{sub}</span>}
{pctLabel&&<span style={{fontSize:11,fontWeight:700,color:sc[status],background:sb[status],borderRadius:6,padding:"2px 8px"}}>{pctLabel}</span>}
</div></div>);

const Tab=({active,children,onClick,badge})=>(<button onClick={onClick} style={{padding:"10px 20px",borderRadius:8,border:"none",background:active?"rgba(255,255,255,0.12)":"transparent",color:active?"#fff":"rgba(255,255,255,0.5)",fontWeight:600,fontSize:13,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:6}}>{children}{badge>0&&<span style={{background:"#ef4444",color:"#fff",fontSize:10,fontWeight:700,borderRadius:10,padding:"2px 7px"}}>{badge}</span>}</button>);
const STitle=({children,sub})=>(<div style={{marginBottom:16,marginTop:32}}><h2 style={{fontSize:18,fontWeight:700,color:"#fff",margin:0}}>{children}</h2>{sub&&<p style={{fontSize:12,color:"rgba(255,255,255,0.45)",margin:"4px 0 0"}}>{sub}</p>}</div>);
const ActionCard=({severity,title,metric,actions,impact,defaultOpen,onDone,done})=>{const[open,setOpen]=useState(defaultOpen||false);return(<div style={{background:done?"rgba(255,255,255,0.02)":sb[severity],border:"1px solid "+(done?"rgba(255,255,255,0.06)":sc[severity]+"30"),borderRadius:12,overflow:"hidden",marginBottom:12,opacity:done?0.6:1}}>
<div onClick={()=>setOpen(!open)} style={{padding:"16px 20px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
<div style={{display:"flex",gap:12,alignItems:"flex-start",flex:1}}>
<span style={{fontSize:22,lineHeight:1}}>{done?"\u2705":severity==="red"?"\ud83d\udd34":severity==="amber"?"\ud83d\udfe1":"\ud83d\udfe2"}</span>
<div><div style={{fontWeight:700,color:done?"rgba(255,255,255,0.5)":"#fff",fontSize:14,marginBottom:4,textDecoration:done?"line-through":"none"}}>{title}</div>
<div style={{fontSize:12,color:"rgba(255,255,255,0.55)",lineHeight:1.5}}>{metric}</div></div></div>
<div style={{display:"flex",gap:8,alignItems:"center"}}>
{onDone&&!done&&<button onClick={e=>{e.stopPropagation();onDone();}} style={{background:"rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.6)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:8,padding:"6px 12px",fontSize:11,cursor:"pointer",fontFamily:"inherit",fontWeight:600,whiteSpace:"nowrap"}}>✓ Done</button>}
<span style={{color:"rgba(255,255,255,0.4)",fontSize:18,transform:open?"rotate(180deg)":"",transition:"0.2s"}}>{"\u25bc"}</span>
</div></div>
{open&&(<div style={{padding:"0 20px 20px 54px",borderTop:"1px solid "+(sc[severity]||"rgba(255,255,255,0.1)")+"15"}}>
<div style={{fontSize:12,fontWeight:600,color:sc[severity]||"rgba(255,255,255,0.5)",marginBottom:8,marginTop:12}}>RECOMMENDED ACTIONS:</div>
{actions.map((a,i)=>(<div key={i} style={{display:"flex",gap:8,marginBottom:6,fontSize:13,color:"rgba(255,255,255,0.75)",lineHeight:1.5}}><span style={{color:sc[severity]||"rgba(255,255,255,0.4)",flexShrink:0}}>{"\u2192"}</span>{a}</div>))}
{impact&&(<div style={{marginTop:12,padding:"10px 14px",background:"rgba(255,255,255,0.05)",borderRadius:8,fontSize:12,color:"rgba(255,255,255,0.6)"}}><strong style={{color:"rgba(255,255,255,0.8)"}}>Impact:</strong> {impact}</div>)}
</div>)}</div>);};
const CTip=({active,payload,label})=>{if(!active||!payload)return null;return(<div style={{background:"#1a1a2e",border:"1px solid rgba(255,255,255,0.15)",borderRadius:8,padding:"10px 14px",fontSize:12}}><div style={{fontWeight:700,color:"#fff",marginBottom:6}}>{label}</div>{payload.map((p,i)=>(<div key={i} style={{color:p.color,marginBottom:2}}>{p.name}: {typeof p.value==="number"?p.value.toLocaleString("de-CH"):p.value}</div>))}</div>);};

// Date picker
const MonthPicker=({from,to,setFrom,setTo})=>{const isP=(f,t)=>from===f&&to===t;const qBtn=(label,f,t)=>(<button onClick={()=>{setFrom(f);setTo(t);}} style={{background:isP(f,t)?"rgba(99,102,241,0.25)":"rgba(255,255,255,0.06)",color:isP(f,t)?"#a5b4fc":"rgba(255,255,255,0.5)",border:isP(f,t)?"1px solid rgba(99,102,241,0.4)":"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"8px 12px",fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:isP(f,t)?700:400,transition:"all 0.15s"}}>{label}</button>);
return(<div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",marginBottom:20}}>
<span style={{fontSize:12,color:"rgba(255,255,255,0.5)",fontWeight:600}}>Period:</span>
<select value={from} onChange={e=>setFrom(+e.target.value)} style={{background:"rgba(255,255,255,0.08)",color:"#fff",border:"1px solid rgba(255,255,255,0.15)",borderRadius:8,padding:"8px 12px",fontSize:13,fontFamily:"inherit"}}>
{MONTHS.map((m,i)=>(<option key={i} value={i+1}>{m}</option>))}
</select>
<span style={{color:"rgba(255,255,255,0.3)"}}>to</span>
<select value={to} onChange={e=>setTo(+e.target.value)} style={{background:"rgba(255,255,255,0.08)",color:"#fff",border:"1px solid rgba(255,255,255,0.15)",borderRadius:8,padding:"8px 12px",fontSize:13,fontFamily:"inherit"}}>
{MONTHS.map((m,i)=>(<option key={i} value={i+1}>{m}</option>))}
</select>
{qBtn("Full Year",1,12)}{qBtn("Q1",1,3)}{qBtn("Q2",4,6)}{qBtn("Q3",7,9)}{qBtn("Q4",10,12)}{qBtn("H1",1,6)}{qBtn("H2",7,12)}{qBtn("Summer",6,8)}{qBtn("Peak",7,8)}
</div>);};

// ===== MAIN =====
export default function Dashboard(){
const[authed,setAuthed]=useState(false);
const[loading,setLoading]=useState(true);
const[pw,setPw]=useState("");
const[pwErr,setPwErr]=useState(false);
const[tab,setTab]=useState("overview");
const[from,setFrom]=useState(1);
const[to,setTo]=useState(12);
const[dismissed,setDismissed]=useState([]);
const[showCompleted,setShowCompleted]=useState(false);
const actions=useMemo(()=>generateActions(),[]);
useEffect(()=>{try{if(sessionStorage.getItem("rm_auth")==="1")setAuthed(true)}catch(e){}setLoading(false);},[]);
const checkPw=()=>{if(pw==="Motta2026"){setAuthed(true);setPwErr(false);try{sessionStorage.setItem("rm_auth","1")}catch(e){}}else{setPwErr(true);}};
const dismiss=(severity,idx)=>{setDismissed(p=>[...p,severity+"-"+idx]);};
const isDismissed=(severity,idx)=>dismissed.includes(severity+"-"+idx);

const f26=useMemo(()=>rangeAgg(M26,from,to),[from,to]);
const f25=useMemo(()=>rangeAgg(M25,from,to),[from,to]);
const fOtb=useMemo(()=>{const sl=OTB.filter(m=>m.m>=from&&m.m<=to);return{r26:sl.reduce((a,m)=>a+m.r26,0),r25:sl.reduce((a,m)=>a+m.r25,0),rn26:sl.reduce((a,m)=>a+m.rn26,0),rn25:sl.reduce((a,m)=>a+m.rn25,0),bk26:sl.reduce((a,m)=>a+m.bk26,0),bk25:sl.reduce((a,m)=>a+m.bk25,0)};},[from,to]);
const fWeeks=useMemo(()=>{const moToW={1:[1,5],2:[5,9],3:[9,14],4:[14,18],5:[18,23],6:[23,27],7:[27,32],8:[32,36],9:[36,40],10:[40,44],11:[44,48],12:[48,53]};return WEEKS.filter(w=>{for(let m=from;m<=to;m++){const[lo,hi]=moToW[m]||[0,0];if(w.w>=lo&&w.w<hi)return true;}return false;});},[from,to]);
const mChart=M26.filter(m=>m.m>=from&&m.m<=to).map((m,i)=>({name:MONTHS[m.m-1],"2026 OTB":m.rev,"2025 Actual":M25[m.m-1].rev,Budget:m.bud}));
const oChart=OTB.filter(m=>m.m>=from&&m.m<=to).map(m=>({name:MONTHS[m.m-1],"OTB 20.03.26":m.r26,"OTB 20.03.25":m.r25}));
const occC=M26.filter(m=>m.m>=from&&m.m<=to).map(m=>({name:MONTHS[m.m-1],"2026":m.occ,"2025":M25[m.m-1].occ}));
const adrC=M26.filter(m=>m.m>=from&&m.m<=to).map(m=>({name:MONTHS[m.m-1],"2026":m.adr,"2025":M25[m.m-1].adr}));
const periodLabel=from===1&&to===12?"Full Year":from===to?MONTHS[from-1]:MONTHS[from-1]+" \u2013 "+MONTHS[to-1];

if(loading)return(<div style={{fontFamily:"'DM Sans',-apple-system,sans-serif",background:"linear-gradient(145deg,#0f0f1a 0%,#131325 50%,#0d0d1a 100%)",color:"#fff",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{fontSize:14,color:"rgba(255,255,255,0.4)"}}>Loading...</div></div>);

if(!authed)return(
<div style={{fontFamily:"'DM Sans',-apple-system,sans-serif",background:"linear-gradient(145deg,#0f0f1a 0%,#131325 50%,#0d0d1a 100%)",color:"#fff",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
<div style={{maxWidth:380,width:"100%",textAlign:"center"}}>
<div style={{fontSize:48,marginBottom:16}}>🏠</div>
<h1 style={{fontSize:24,fontWeight:700,margin:"0 0 4px",letterSpacing:-0.5}}>Residenza Motta</h1>
<p style={{fontSize:13,color:"rgba(255,255,255,0.4)",margin:"0 0 32px"}}>Operations Dashboard</p>
<div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:12,padding:24}}>
<input type="password" value={pw} onChange={e=>{setPw(e.target.value);setPwErr(false);}}
onKeyDown={e=>{if(e.key==="Enter")checkPw();}}
placeholder="Password"
style={{width:"100%",padding:"12px 16px",borderRadius:8,border:pwErr?"1px solid #ef4444":"1px solid rgba(255,255,255,0.15)",background:"rgba(255,255,255,0.06)",color:"#fff",fontSize:15,fontFamily:"inherit",outline:"none",boxSizing:"border-box",marginBottom:12}}/>
{pwErr&&<div style={{color:"#ef4444",fontSize:12,marginBottom:12}}>Password errata. Riprova.</div>}
<button onClick={checkPw} style={{width:"100%",padding:"12px 16px",borderRadius:8,border:"none",background:"#6366f1",color:"#fff",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Accedi</button>
</div>
<p style={{fontSize:11,color:"rgba(255,255,255,0.2)",marginTop:24}}>Accesso riservato · Locarno, Ticino</p>
</div>
</div>);

const ytdB=M26.slice(0,3).reduce((a,m)=>a+m.bud,0);const ytdA=M26.slice(0,3).reduce((a,m)=>a+m.rev,0);const ytdV=(ytdA-ytdB)/ytdB*100;

return(<div style={{fontFamily:"'DM Sans',-apple-system,sans-serif",background:"linear-gradient(145deg,#0f0f1a 0%,#131325 50%,#0d0d1a 100%)",color:"#fff",minHeight:"100vh",padding:"20px 16px 60px",maxWidth:1200,margin:"0 auto"}}>
{/* HEADER */}
<div style={{marginBottom:24,display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
<div><h1 style={{fontSize:26,fontWeight:700,margin:0,letterSpacing:-0.5}}>Residenza Motta</h1><p style={{margin:"4px 0 0",fontSize:13,color:"rgba(255,255,255,0.4)"}}>Short-Term Holiday Apartments — Operations Dashboard</p></div>
<div style={{background:"rgba(255,255,255,0.06)",borderRadius:8,padding:"8px 14px",fontSize:12,color:"rgba(255,255,255,0.5)"}}>📅 <span style={{color:"#fff",fontWeight:600}}>March 20, 2026</span><br/>11 units · Locarno · Confirmed + modified only</div>
</div>
{/* TABS */}
<div style={{display:"flex",gap:4,marginBottom:20,overflowX:"auto",paddingBottom:4}}>
<Tab active={tab==="overview"} onClick={()=>setTab("overview")}>Overview</Tab>
<Tab active={tab==="otb"} onClick={()=>setTab("otb")}>OTB vs STLY</Tab>
<Tab active={tab==="budget"} onClick={()=>setTab("budget")}>vs Budget</Tab>
<Tab active={tab==="weekly"} onClick={()=>setTab("weekly")}>Weekly</Tab>
<Tab active={tab==="monthly"} onClick={()=>setTab("monthly")}>Monthly</Tab>
<Tab active={tab==="channels"} onClick={()=>setTab("channels")}>Channels</Tab>
<Tab active={tab==="leadtime"} onClick={()=>setTab("leadtime")}>⏱ Lead Time</Tab>
<Tab active={tab==="adr"} onClick={()=>setTab("adr")}>💰 ADR Analysis</Tab>
<Tab active={tab==="actions"} onClick={()=>setTab("actions")} badge={actions.red.length-dismissed.filter(d=>d.startsWith("red")).length}>⚡ Actions</Tab>
</div>

{/* ACTION CENTER */}
{tab==="actions"&&(<div>
<div style={{display:"flex",gap:12,marginBottom:24,flexWrap:"wrap"}}>
{[["red",actions.red.filter((_,i)=>!isDismissed("red",i)).length,"Act Now"],["amber",actions.amber.filter((_,i)=>!isDismissed("amber",i)).length,"Attention"],["green",actions.green.filter((_,i)=>!isDismissed("green",i)).length,"On Track"]].map(([s,n,l])=>(<div key={s} style={{background:sb[s],border:"1px solid "+sc[s]+"30",borderRadius:10,padding:"14px 20px",flex:1,minWidth:140}}><div style={{fontSize:32,fontWeight:700,color:sc[s]}}>{n}</div><div style={{fontSize:12,fontWeight:600,color:sc[s]}}>{s==="red"?"\ud83d\udd34":s==="amber"?"\ud83d\udfe1":"\ud83d\udfe2"} {l}</div></div>))}
</div>

{actions.red.filter((_,i)=>!isDismissed("red",i)).length>0&&<><STitle sub="Immediate intervention required">{"\ud83d\udd34"} Act Now ({actions.red.filter((_,i)=>!isDismissed("red",i)).length})</STitle>
{actions.red.map((a,i)=>!isDismissed("red",i)&&<ActionCard key={i} severity="red" {...a} defaultOpen={i===0} onDone={()=>dismiss("red",i)}/>)}</>}

{actions.amber.filter((_,i)=>!isDismissed("amber",i)).length>0&&<><STitle sub="Monitor and plan corrective action">{"\ud83d\udfe1"} Needs Attention ({actions.amber.filter((_,i)=>!isDismissed("amber",i)).length})</STitle>
{actions.amber.map((a,i)=>!isDismissed("amber",i)&&<ActionCard key={i} severity="amber" {...a} onDone={()=>dismiss("amber",i)}/>)}</>}

{actions.green.filter((_,i)=>!isDismissed("green",i)).length>0&&<><STitle sub="Protect these wins">{"\ud83d\udfe2"} Performing Well ({actions.green.filter((_,i)=>!isDismissed("green",i)).length})</STitle>
{actions.green.map((a,i)=>!isDismissed("green",i)&&<ActionCard key={i} severity="green" {...a} onDone={()=>dismiss("green",i)}/>)}</>}

{dismissed.length>0&&(<div style={{marginTop:40}}>
<div onClick={()=>setShowCompleted(!showCompleted)} style={{cursor:"pointer",display:"flex",alignItems:"center",gap:10,padding:"14px 0",borderTop:"1px solid rgba(255,255,255,0.08)"}}>
<span style={{fontSize:14,color:"rgba(255,255,255,0.4)",transform:showCompleted?"rotate(180deg)":"",transition:"0.2s"}}>{"\u25bc"}</span>
<span style={{fontSize:14,fontWeight:600,color:"rgba(255,255,255,0.4)"}}>✓ Completed / Dismissed ({dismissed.length})</span>
{!showCompleted&&<span style={{fontSize:11,color:"rgba(255,255,255,0.25)",fontStyle:"italic"}}>click to expand</span>}
</div>
{showCompleted&&(<div style={{paddingTop:8}}>
{actions.red.map((a,i)=>isDismissed("red",i)&&<ActionCard key={"r"+i} severity="red" {...a} done={true}/>)}
{actions.amber.map((a,i)=>isDismissed("amber",i)&&<ActionCard key={"a"+i} severity="amber" {...a} done={true}/>)}
{actions.green.map((a,i)=>isDismissed("green",i)&&<ActionCard key={"g"+i} severity="green" {...a} done={true}/>)}
<button onClick={()=>setDismissed([])} style={{marginTop:12,background:"rgba(255,255,255,0.06)",color:"rgba(255,255,255,0.4)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"8px 16px",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>↩ Restore all items</button>
</div>)}
</div>)}

{dismissed.length===0&&actions.red.length+actions.amber.length+actions.green.length===0&&(
<div style={{textAlign:"center",padding:"60px 20px",color:"rgba(255,255,255,0.3)"}}><div style={{fontSize:48,marginBottom:12}}>🎉</div><div style={{fontSize:16,fontWeight:600}}>All clear! No action items.</div></div>
)}
</div>)}

{/* OVERVIEW */}
{tab==="overview"&&(<div>
<MonthPicker from={from} to={to} setFrom={setFrom} setTo={setTo}/>
<STitle sub={"OTB "+periodLabel+" 2026 vs 2025 (confirmed + modified)"}>{"\ud83d\udcca"} KPIs — {periodLabel}</STitle>
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12}}>
<KPICard label="Revenue" value={fmtCHF(f26.rev)} sub={"2025: "+fmtCHF(f25.rev)} pctLabel={fmtPct(delta(f26.rev,f25.rev))} status={f26.rev>=f25.rev?"green":"red"}/>
<KPICard label="Room Nights" value={f26.rn} sub={"2025: "+f25.rn} pctLabel={fmtPct(delta(f26.rn,f25.rn))} status={f26.rn>=f25.rn?"green":"red"}/>
<KPICard label="ADR" value={"CHF "+f26.adr.toFixed(0)} sub={"2025: CHF "+f25.adr.toFixed(0)} pctLabel={fmtPct(delta(f26.adr,f25.adr))} status={f26.adr>=f25.adr*0.95?"green":f26.adr>=f25.adr*0.85?"amber":"red"}/>
<KPICard label="RevPAR" value={"CHF "+f26.rpar.toFixed(0)} sub={"2025: CHF "+f25.rpar.toFixed(0)} pctLabel={fmtPct(delta(f26.rpar,f25.rpar))} status={f26.rpar>=f25.rpar*0.9?"green":"amber"}/>
<KPICard label="Occupancy" value={f26.occ.toFixed(1)+"%"} sub={"2025: "+f25.occ.toFixed(1)+"%"} pctLabel={(f26.occ-f25.occ>0?"+":"")+(f26.occ-f25.occ).toFixed(1)+"pp"} status={f26.occ>=f25.occ*0.9?"green":"amber"}/>
<KPICard label="Bookings" value={f26.bk} sub={"2025: "+f25.bk} pctLabel={fmtPct(delta(f26.bk,f25.bk))} status={f26.bk>=f25.bk*0.8?"green":"amber"}/>
<KPICard label="Avg LOS" value={f26.los.toFixed(1)+" nights"} sub={"2025: "+f25.los.toFixed(1)} pctLabel={fmtPct(delta(f26.los,f25.los))} status={f26.los>=f25.los?"green":"amber"}/>
<KPICard label="Lead Time" value={f26.lead.toFixed(0)+" days"} sub={"2025: "+f25.lead.toFixed(0)+"d"} pctLabel={fmtPct(delta(f26.lead,f25.lead))} status="green"/>
</div>
<STitle sub={periodLabel}>💰 Revenue vs Budget</STitle>
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12}}>
<KPICard label="Revenue" value={fmtCHF(f26.rev)} sub={"Budget: "+fmtCHF(f26.bud)} pctLabel={fmtPct(delta(f26.rev,f26.bud))} status={delta(f26.rev,f26.bud)>-3?"green":delta(f26.rev,f26.bud)>-10?"amber":"red"}/>
<KPICard label="Budget Gap" value={fmtCHF(Math.abs(f26.rev-f26.bud))} sub={f26.rev>=f26.bud?"ahead of budget":"behind budget"} pctLabel={fmtPct(delta(f26.rev,f26.bud))} status={f26.rev>=f26.bud?"green":"red"}/>
<KPICard label="OTB vs STLY (20.03)" value={fmtCHF(fOtb.r26)} sub={"OTB 20.03.25: "+fmtCHF(fOtb.r25)} pctLabel={fOtb.r25>0?fmtPct(delta(fOtb.r26,fOtb.r25)):"N/A"} status={fOtb.r26>=fOtb.r25?"green":"red"}/>
</div>
<STitle>{"\ud83d\udcc8"} Monthly Revenue</STitle>
<div style={{background:"rgba(255,255,255,0.03)",borderRadius:12,padding:"16px 8px 8px"}}><ResponsiveContainer width="100%" height={300}><ComposedChart data={mChart}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)"/><XAxis dataKey="name" tick={{fill:"rgba(255,255,255,0.5)",fontSize:11}}/><YAxis tick={{fill:"rgba(255,255,255,0.5)",fontSize:11}} tickFormatter={fmt}/><Tooltip content={<CTip/>}/><Legend wrapperStyle={{fontSize:11}}/><Bar dataKey="2026 OTB" fill="#6366f1" radius={[4,4,0,0]}/><Bar dataKey="2025 Actual" fill="rgba(255,255,255,0.15)" radius={[4,4,0,0]}/><Line dataKey="Budget" stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="6 3"/></ComposedChart></ResponsiveContainer></div>
</div>)}

{/* OTB vs STLY */}
{tab==="otb"&&(<div>
<MonthPicker from={from} to={to} setFrom={setFrom} setTo={setTo}/>
<div style={{background:"rgba(99,102,241,0.08)",border:"1px solid rgba(99,102,241,0.2)",borderRadius:10,padding:"12px 18px",marginBottom:20,fontSize:12,color:"rgba(255,255,255,0.6)",lineHeight:1.6}}>
<strong style={{color:"#a5b4fc"}}>How this works:</strong> 2026 OTB = all confirmed/modified bookings as of <strong style={{color:"#fff"}}>March 20, 2026</strong>. STLY = only 2025 bookings created on or before <strong style={{color:"#fff"}}>March 20, 2025</strong>. Same cutoff date, apples to apples.
</div>
<STitle sub={"OTB as of 20.03.2026 vs OTB as of 20.03.2025"}>{"\ud83d\udcca"} On The Books — {periodLabel}</STitle>
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12,marginBottom:24}}>
<KPICard label="Revenue (OTB 20.03.26)" value={fmtCHF(fOtb.r26)} sub={"OTB 20.03.25: "+fmtCHF(fOtb.r25)} pctLabel={fOtb.r25>0?fmtPct(delta(fOtb.r26,fOtb.r25)):"N/A"} status={fOtb.r26>=fOtb.r25?"green":"red"}/>
<KPICard label="Room Nights (OTB 20.03.26)" value={fOtb.rn26} sub={"OTB 20.03.25: "+fOtb.rn25} pctLabel={fOtb.rn25>0?fmtPct(delta(fOtb.rn26,fOtb.rn25)):"N/A"} status={fOtb.rn26>=fOtb.rn25?"green":"red"}/>
<KPICard label="ADR (OTB 20.03.26)" value={"CHF "+(fOtb.rn26>0?(fOtb.r26/fOtb.rn26).toFixed(0):"0")} sub={"OTB 20.03.25: CHF "+(fOtb.rn25>0?(fOtb.r25/fOtb.rn25).toFixed(0):"0")} pctLabel={fOtb.rn25>0&&fOtb.rn26>0?fmtPct(delta(fOtb.r26/fOtb.rn26,fOtb.r25/fOtb.rn25)):"N/A"} status={fOtb.rn25>0&&fOtb.rn26>0&&(fOtb.r26/fOtb.rn26)>=(fOtb.r25/fOtb.rn25)*0.95?"green":(fOtb.rn25>0&&fOtb.rn26>0&&(fOtb.r26/fOtb.rn26)>=(fOtb.r25/fOtb.rn25)*0.85?"amber":"red")}/>
<KPICard label="RevPAR (OTB 20.03.26)" value={"CHF "+(f26.arn>0?(fOtb.r26/f26.arn).toFixed(2):"0")} sub={"OTB 20.03.25: CHF "+(f25.arn>0?(fOtb.r25/f25.arn).toFixed(2):"0")} pctLabel={f25.arn>0&&f26.arn>0?fmtPct(delta(fOtb.r26/f26.arn,fOtb.r25/f25.arn)):"N/A"} status={f25.arn>0&&f26.arn>0&&(fOtb.r26/f26.arn)>=(fOtb.r25/f25.arn)*0.9?"green":"amber"}/>
<KPICard label="Bookings (OTB 20.03.26)" value={fOtb.bk26} sub={"OTB 20.03.25: "+fOtb.bk25} pctLabel={fOtb.bk25>0?fmtPct(delta(fOtb.bk26,fOtb.bk25)):"N/A"} status={fOtb.bk26>=fOtb.bk25?"green":"red"}/>
</div>
<div style={{background:"rgba(255,255,255,0.03)",borderRadius:12,padding:"16px 8px 8px"}}><ResponsiveContainer width="100%" height={320}><ComposedChart data={oChart}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)"/><XAxis dataKey="name" tick={{fill:"rgba(255,255,255,0.5)",fontSize:11}}/><YAxis tick={{fill:"rgba(255,255,255,0.5)",fontSize:11}} tickFormatter={fmt}/><Tooltip content={<CTip/>}/><Legend wrapperStyle={{fontSize:11}}/><Bar dataKey="OTB 20.03.26" fill="#6366f1" radius={[4,4,0,0]}/><Bar dataKey="OTB 20.03.25" fill="rgba(255,255,255,0.2)" radius={[4,4,0,0]}/></ComposedChart></ResponsiveContainer></div>
<div style={{marginTop:24,overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}><thead><tr style={{borderBottom:"1px solid rgba(255,255,255,0.1)"}}>{["Month","OTB 20.03.26","OTB 20.03.25","\u0394 CHF","\u0394 %","RN 26","RN 25"].map(h=>(<th key={h} style={{padding:"10px 8px",textAlign:"left",color:"rgba(255,255,255,0.5)",fontWeight:600,whiteSpace:"nowrap"}}>{h}</th>))}</tr></thead><tbody>{OTB.filter(m=>m.m>=from&&m.m<=to).map((m)=>{const st=m.d>0?"green":m.d>-(m.r25*0.1)?"amber":"red";return(<tr key={m.m} style={{borderBottom:"1px solid rgba(255,255,255,0.05)"}}><td style={{padding:"10px 8px",fontWeight:600,color:"#fff"}}>{MONTHS[m.m-1]}</td><td style={{padding:"10px 8px",color:"#fff"}}>{fmtCHF(m.r26)}</td><td style={{padding:"10px 8px",color:"rgba(255,255,255,0.5)"}}>{fmtCHF(m.r25)}</td><td style={{padding:"10px 8px",color:sc[st],fontWeight:600}}>{m.d>=0?"+":""}{fmtCHF(m.d)}</td><td style={{padding:"10px 8px",color:sc[st],fontWeight:600}}>{m.r25>0?fmtPct(m.dp):"N/A"}</td><td style={{padding:"10px 8px",color:"#fff"}}>{m.rn26}</td><td style={{padding:"10px 8px",color:"rgba(255,255,255,0.5)"}}>{m.rn25}</td></tr>);})}</tbody></table></div>
</div>)}

{/* BUDGET */}
{tab==="budget"&&(<div>
<MonthPicker from={from} to={to} setFrom={setFrom} setTo={setTo}/>
<STitle sub={periodLabel+" 2026"}>💰 Revenue vs Budget</STitle>
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12,marginBottom:24}}>
<KPICard label="Revenue" value={fmtCHF(f26.rev)} sub={"Budget: "+fmtCHF(f26.bud)} pctLabel={fmtPct(delta(f26.rev,f26.bud))} status={delta(f26.rev,f26.bud)>-3?"green":delta(f26.rev,f26.bud)>-10?"amber":"red"}/>
<KPICard label="ADR" value={"CHF "+f26.adr.toFixed(0)} sub={"2025: CHF "+f25.adr.toFixed(0)} pctLabel={fmtPct(delta(f26.adr,f25.adr))} status={f26.adr>=f25.adr*0.95?"green":f26.adr>=f25.adr*0.85?"amber":"red"}/>
<KPICard label="RevPAR" value={"CHF "+f26.rpar.toFixed(2)} sub={"2025: CHF "+f25.rpar.toFixed(2)} pctLabel={fmtPct(delta(f26.rpar,f25.rpar))} status={f26.rpar>=f25.rpar*0.9?"green":"amber"}/>
<KPICard label="vs 2025 Actual" value={fmtCHF(f26.rev)} sub={"2025: "+fmtCHF(f25.rev)} pctLabel={fmtPct(delta(f26.rev,f25.rev))} status={f26.rev>=f25.rev?"green":"red"}/>
<KPICard label="FY Budget" value={fmtCHF(BUDGET_FY)} sub={(f26.rev/BUDGET_FY*100).toFixed(1)+"% achieved"} pctLabel={periodLabel} status="amber"/>
</div>
<div style={{background:"rgba(255,255,255,0.03)",borderRadius:12,padding:"16px 8px 8px"}}><ResponsiveContainer width="100%" height={320}><ComposedChart data={mChart}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)"/><XAxis dataKey="name" tick={{fill:"rgba(255,255,255,0.5)",fontSize:11}}/><YAxis tick={{fill:"rgba(255,255,255,0.5)",fontSize:11}} tickFormatter={fmt}/><Tooltip content={<CTip/>}/><Legend wrapperStyle={{fontSize:11}}/><Bar dataKey="2026 OTB" fill="#6366f1" radius={[4,4,0,0]}/><Line dataKey="Budget" stroke="#f59e0b" strokeWidth={2.5} dot={{r:4,fill:"#f59e0b"}}/><Line dataKey="2025 Actual" stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} dot={false} strokeDasharray="4 4"/></ComposedChart></ResponsiveContainer></div>
<div style={{marginTop:24,overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}><thead><tr style={{borderBottom:"1px solid rgba(255,255,255,0.1)"}}>{["Month","OTB Rev","Budget","Var","Var %","2025","vs 2025"].map(h=>(<th key={h} style={{padding:"10px 8px",textAlign:"left",color:"rgba(255,255,255,0.5)",fontWeight:600,whiteSpace:"nowrap"}}>{h}</th>))}</tr></thead><tbody>{M26.filter(m=>m.m>=from&&m.m<=to).map(m=>{const v=m.rev-m.bud,vp=v/m.bud*100,st=vp>-3?"green":vp>-10?"amber":"red";const v25=m.rev-M25[m.m-1].rev,v25p=M25[m.m-1].rev>0?(v25/M25[m.m-1].rev*100):0,s25=v25p>0?"green":v25p>-10?"amber":"red";return(<tr key={m.m} style={{borderBottom:"1px solid rgba(255,255,255,0.05)"}}><td style={{padding:"10px 8px",fontWeight:600,color:"#fff"}}>{MONTHS[m.m-1]}</td><td style={{padding:"10px 8px",color:"#fff"}}>{fmtCHF(m.rev)}</td><td style={{padding:"10px 8px",color:"rgba(255,255,255,0.5)"}}>{fmtCHF(m.bud)}</td><td style={{padding:"10px 8px",color:sc[st],fontWeight:600}}>{v>=0?"+":""}{fmtCHF(v)}</td><td style={{padding:"10px 8px",color:sc[st],fontWeight:600}}>{fmtPct(vp)}</td><td style={{padding:"10px 8px",color:"rgba(255,255,255,0.5)"}}>{fmtCHF(M25[m.m-1].rev)}</td><td style={{padding:"10px 8px",color:sc[s25],fontWeight:600}}>{M25[m.m-1].rev>0?fmtPct(v25p):"N/A"}</td></tr>);})}</tbody></table></div>
</div>)}

{/* WEEKLY */}
{tab==="weekly"&&(<div>
<MonthPicker from={from} to={to} setFrom={setFrom} setTo={setTo}/>
<STitle sub={periodLabel+" 2026"}>{"\ud83d\udcc5"} Weekly Performance</STitle>
<div style={{background:"rgba(255,255,255,0.03)",borderRadius:12,padding:"16px 8px 8px"}}><ResponsiveContainer width="100%" height={300}><ComposedChart data={fWeeks}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)"/><XAxis dataKey="ws" tick={{fill:"rgba(255,255,255,0.5)",fontSize:10}} angle={-45} textAnchor="end" height={60}/><YAxis yAxisId="left" tick={{fill:"rgba(255,255,255,0.5)",fontSize:11}} tickFormatter={fmt}/><YAxis yAxisId="right" orientation="right" tick={{fill:"#22d3ee",fontSize:11}} unit="%"/><Tooltip content={<CTip/>}/><Legend wrapperStyle={{fontSize:11}}/><Bar yAxisId="left" dataKey="rev" name="Revenue" fill="#6366f1" radius={[3,3,0,0]}/><Line yAxisId="right" dataKey="occ" name="Occ %" stroke="#22d3ee" strokeWidth={2} dot={{r:3}}/></ComposedChart></ResponsiveContainer></div>
<div style={{marginTop:20,overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}><thead><tr style={{borderBottom:"1px solid rgba(255,255,255,0.1)"}}>{["Wk","Start","Bk","Revenue","RN","Occ%","LOS"].map(h=>(<th key={h} style={{padding:"10px 8px",textAlign:"left",color:"rgba(255,255,255,0.5)",fontWeight:600}}>{h}</th>))}</tr></thead><tbody>{fWeeks.map(w=>{const st=w.occ>=55?"green":w.occ>=25?"amber":"red";return(<tr key={w.w} style={{borderBottom:"1px solid rgba(255,255,255,0.05)"}}><td style={{padding:"10px 8px",fontWeight:600,color:"#fff"}}>W{w.w}</td><td style={{padding:"10px 8px",color:"rgba(255,255,255,0.6)"}}>{w.ws}</td><td style={{padding:"10px 8px",color:"#fff"}}>{w.bk}</td><td style={{padding:"10px 8px",color:"#fff"}}>{fmtCHF(w.rev)}</td><td style={{padding:"10px 8px",color:"#fff"}}>{w.rn}</td><td style={{padding:"10px 8px",color:sc[st],fontWeight:600}}>{w.occ}%</td><td style={{padding:"10px 8px",color:"rgba(255,255,255,0.6)"}}>{w.los}</td></tr>);})}</tbody></table></div>
</div>)}

{/* MONTHLY */}
{tab==="monthly"&&(<div>
<MonthPicker from={from} to={to} setFrom={setFrom} setTo={setTo}/>
<STitle sub={periodLabel}>{"\ud83d\udcc6"} Monthly Detail</STitle>
<h3 style={{fontSize:14,fontWeight:600,color:"rgba(255,255,255,0.7)",marginBottom:8}}>Occupancy (%)</h3>
<div style={{background:"rgba(255,255,255,0.03)",borderRadius:12,padding:"16px 8px 8px",marginBottom:24}}><ResponsiveContainer width="100%" height={220}><BarChart data={occC}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)"/><XAxis dataKey="name" tick={{fill:"rgba(255,255,255,0.5)",fontSize:11}}/><YAxis tick={{fill:"rgba(255,255,255,0.5)",fontSize:11}} unit="%"/><Tooltip content={<CTip/>}/><Legend wrapperStyle={{fontSize:11}}/><Bar dataKey="2026" fill="#6366f1" radius={[4,4,0,0]}/><Bar dataKey="2025" fill="rgba(255,255,255,0.15)" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer></div>
<h3 style={{fontSize:14,fontWeight:600,color:"rgba(255,255,255,0.7)",marginBottom:8}}>ADR (CHF)</h3>
<div style={{background:"rgba(255,255,255,0.03)",borderRadius:12,padding:"16px 8px 8px",marginBottom:24}}><ResponsiveContainer width="100%" height={220}><LineChart data={adrC}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)"/><XAxis dataKey="name" tick={{fill:"rgba(255,255,255,0.5)",fontSize:11}}/><YAxis tick={{fill:"rgba(255,255,255,0.5)",fontSize:11}}/><Tooltip content={<CTip/>}/><Legend wrapperStyle={{fontSize:11}}/><Line dataKey="2026" stroke="#6366f1" strokeWidth={2.5} dot={{r:4,fill:"#6366f1"}}/><Line dataKey="2025" stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} dot={{r:3}} strokeDasharray="4 4"/></LineChart></ResponsiveContainer></div>
<div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}><thead><tr style={{borderBottom:"1px solid rgba(255,255,255,0.1)"}}>{["Month","Revenue","Budget","Occ","ADR","RevPAR","RN","Bk","LOS","Lead"].map(h=>(<th key={h} style={{padding:"8px 6px",textAlign:"left",color:"rgba(255,255,255,0.5)",fontWeight:600,whiteSpace:"nowrap"}}>{h}</th>))}</tr></thead><tbody>{M26.filter(m=>m.m>=from&&m.m<=to).map(m=>(<tr key={m.m} style={{borderBottom:"1px solid rgba(255,255,255,0.05)"}}><td style={{padding:"8px 6px",fontWeight:600,color:"#fff"}}>{MONTHS[m.m-1]}</td><td style={{padding:"8px 6px",color:"#fff"}}>{fmtCHF(m.rev)}</td><td style={{padding:"8px 6px",color:"rgba(255,255,255,0.4)"}}>{fmtCHF(m.bud)}</td><td style={{padding:"8px 6px",color:sc[m.occ>=40?"green":m.occ>=20?"amber":"red"],fontWeight:600}}>{m.occ}%</td><td style={{padding:"8px 6px",color:"#fff"}}>CHF {m.adr.toFixed(0)}</td><td style={{padding:"8px 6px",color:"#fff"}}>CHF {m.rpar.toFixed(0)}</td><td style={{padding:"8px 6px",color:"#fff"}}>{m.rn}</td><td style={{padding:"8px 6px",color:"#fff"}}>{m.bk}</td><td style={{padding:"8px 6px",color:"rgba(255,255,255,0.6)"}}>{m.los}</td><td style={{padding:"8px 6px",color:"rgba(255,255,255,0.6)"}}>{m.lead}d</td></tr>))}</tbody></table></div>
</div>)}

{/* CHANNELS */}
{tab==="channels"&&(<div>
<MonthPicker from={from} to={to} setFrom={setFrom} setTo={setTo}/>
<STitle sub={"2026 OTB — "+periodLabel}>{"\ud83d\udce1"} Channels</STitle>
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:20,marginBottom:24}}>
<div style={{background:"rgba(255,255,255,0.03)",borderRadius:12,padding:16}}><h3 style={{fontSize:13,fontWeight:600,color:"rgba(255,255,255,0.7)",margin:"0 0 12px"}}>Revenue by Channel</h3><ResponsiveContainer width="100%" height={220}><PieChart><Pie data={SRC26} dataKey="rev" nameKey="source" cx="50%" cy="50%" outerRadius={80} label={({source,percent})=>source+" "+(percent*100).toFixed(0)+"%"} labelLine={false} style={{fontSize:10}}>{SRC26.map((_,i)=><Cell key={i} fill={CC[i%CC.length]}/>)}</Pie><Tooltip formatter={v=>fmtCHF(v)}/></PieChart></ResponsiveContainer></div>
<div style={{background:"rgba(255,255,255,0.03)",borderRadius:12,padding:16}}><h3 style={{fontSize:13,fontWeight:600,color:"rgba(255,255,255,0.7)",margin:"0 0 12px"}}>Channel Detail</h3><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}><thead><tr style={{borderBottom:"1px solid rgba(255,255,255,0.1)"}}>{["Source","Bk","Revenue","RN","Share"].map(h=>(<th key={h} style={{padding:"8px 6px",textAlign:"left",color:"rgba(255,255,255,0.5)",fontWeight:600}}>{h}</th>))}</tr></thead><tbody>{SRC26.map((ch,i)=>(<tr key={i} style={{borderBottom:"1px solid rgba(255,255,255,0.05)"}}><td style={{padding:"8px 6px",color:"#fff",fontWeight:600,display:"flex",alignItems:"center",gap:6}}><span style={{width:8,height:8,borderRadius:2,background:CC[i],display:"inline-block"}}/>{ch.source}</td><td style={{padding:"8px 6px",color:"#fff"}}>{ch.bk}</td><td style={{padding:"8px 6px",color:"#fff"}}>{fmtCHF(ch.rev)}</td><td style={{padding:"8px 6px",color:"#fff"}}>{ch.rn}</td><td style={{padding:"8px 6px",color:"rgba(255,255,255,0.6)"}}>{(ch.rev/TOTAL26.rev*100).toFixed(1)}%</td></tr>))}</tbody></table></div>
</div>
<STitle sub="2026 OTB by apartment">{"\ud83c\udfe0"} Rooms</STitle>
<div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}><thead><tr style={{borderBottom:"1px solid rgba(255,255,255,0.1)"}}>{["Room","Bk","Revenue","RN","ADR","LOS","Lead"].map(h=>(<th key={h} style={{padding:"10px 8px",textAlign:"left",color:"rgba(255,255,255,0.5)",fontWeight:600,whiteSpace:"nowrap"}}>{h}</th>))}</tr></thead><tbody>{RM26.map((r,i)=>{const adr=r.rn>0?r.rev/r.rn:0;return(<tr key={i} style={{borderBottom:"1px solid rgba(255,255,255,0.05)"}}><td style={{padding:"10px 8px",color:"#fff",fontWeight:600}}>{r.room}</td><td style={{padding:"10px 8px",color:"#fff"}}>{r.bk}</td><td style={{padding:"10px 8px",color:"#fff"}}>{fmtCHF(r.rev)}</td><td style={{padding:"10px 8px",color:"#fff"}}>{r.rn}</td><td style={{padding:"10px 8px",color:"#fff"}}>CHF {adr.toFixed(0)}</td><td style={{padding:"10px 8px",color:"rgba(255,255,255,0.6)"}}>{r.los}</td><td style={{padding:"10px 8px",color:"rgba(255,255,255,0.6)"}}>{r.lead.toFixed(0)}d</td></tr>);})}</tbody></table></div>
</div>)}

{/* LEAD TIME */}
{tab==="leadtime"&&(<div>
<MonthPicker from={from} to={to} setFrom={setFrom} setTo={setTo}/>
<STitle sub="How far in advance do guests book for each month?">{"\u23f1"} Booking Lead Time Analysis</STitle>

{/* Lead time comparison chart */}
<div style={{background:"rgba(255,255,255,0.03)",borderRadius:12,padding:"16px 8px 8px",marginBottom:24}}>
<ResponsiveContainer width="100%" height={300}>
<ComposedChart data={[{m:1,n:"Jan",a26:2,a25:7,md26:2,md25:4},{m:2,n:"Feb",a26:12,a25:8,md26:2,md25:5},{m:3,n:"Mar",a26:20,a25:26,md26:15,md25:8},{m:4,n:"Apr",a26:59,a25:33,md26:40,md25:17},{m:5,n:"May",a26:82,a25:44,md26:84,md25:21},{m:6,n:"Jun",a26:136,a25:53,md26:134,md25:48},{m:7,n:"Jul",a26:195,a25:86,md26:192,md25:53},{m:8,n:"Aug",a26:227,a25:88,md26:202,md25:74},{m:9,n:"Sep",a26:214,a25:21,md26:221,md25:6},{m:10,n:"Oct",a26:293,a25:42,md26:293,md25:22},{m:11,n:"Nov",a26:0,a25:11,md26:0,md25:6},{m:12,n:"Dec",a26:351,a25:52,md26:351,md25:46}].filter(d=>d.m>=from&&d.m<=to)}>
<CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)"/>
<XAxis dataKey="n" tick={{fill:"rgba(255,255,255,0.5)",fontSize:11}}/>
<YAxis tick={{fill:"rgba(255,255,255,0.5)",fontSize:11}} label={{value:"Days ahead",angle:-90,position:"insideLeft",style:{fill:"rgba(255,255,255,0.4)",fontSize:11}}}/>
<Tooltip content={<CTip/>}/><Legend wrapperStyle={{fontSize:11}}/>
<Bar dataKey="a26" name="2026 Avg Lead" fill="#6366f1" radius={[4,4,0,0]}/>
<Bar dataKey="a25" name="2025 Avg Lead" fill="rgba(255,255,255,0.15)" radius={[4,4,0,0]}/>
<Line dataKey="md26" name="2026 Median" stroke="#22d3ee" strokeWidth={2} dot={{r:4}}/>
</ComposedChart>
</ResponsiveContainer>
</div>

{/* Key Insight Cards */}
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:12,marginBottom:24}}>
<KPICard label="Feb: Last-Minute Dominant" value="62% within 3 days" sub="16 of 26 bookings booked 0-3 days before" pctLabel="Walk-in market" status="amber"/>
<KPICard label="Jul: Early Planners" value="198 days avg" sub="vs 86 days in 2025" pctLabel="+130%" status="green"/>
<KPICard label="Summer (Jun-Aug)" value="4-7 months ahead" sub="All bookings 90+ days before arrival" pctLabel="Price early" status="green"/>
<KPICard label="Mar: Mixed Window" value="22 days avg" sub="Spread from same-day to 72 days" pctLabel="Dynamic pricing" status="amber"/>
</div>

{/* Booking Window Distribution */}
<STitle sub="How many bookings fall into each lead time bucket?">{"\ud83d\udcca"} Booking Window Distribution (2026)</STitle>
<div style={{background:"rgba(255,255,255,0.03)",borderRadius:12,padding:"16px 8px 8px",marginBottom:24}}>
<ResponsiveContainer width="100%" height={300}>
<BarChart data={[
{n:"Jan",lm:1,w1:1,w2:0,mo1:0,mo2:0,mo3:0,mo6:0,far:0},
{n:"Feb",lm:16,w1:4,w2:3,mo1:1,mo2:0,mo3:1,mo6:1,far:0},
{n:"Mar",lm:5,w1:4,w2:8,mo1:10,mo2:8,mo3:1,mo6:0,far:0},
{n:"Apr",lm:0,w1:0,w2:0,mo1:5,mo2:17,mo3:3,mo6:3,far:1},
{n:"May",lm:0,w1:0,w2:0,mo1:0,mo2:3,mo3:12,mo6:7,far:0},
{n:"Jun",lm:0,w1:0,w2:0,mo1:0,mo2:0,mo3:0,mo6:13,far:0},
{n:"Jul",lm:0,w1:0,w2:0,mo1:0,mo2:0,mo3:0,mo6:13,far:17},
{n:"Aug",lm:0,w1:0,w2:0,mo1:0,mo2:0,mo3:0,mo6:1,far:4},
{n:"Sep",lm:0,w1:0,w2:0,mo1:0,mo2:0,mo3:0,mo6:2,far:6},
{n:"Oct",lm:0,w1:0,w2:0,mo1:0,mo2:0,mo3:0,mo6:0,far:1},
{n:"Dec",lm:0,w1:0,w2:0,mo1:0,mo2:0,mo3:0,mo6:0,far:1}
].filter(d=>{const mi=MONTHS.indexOf(d.n)+1;return mi>=from&&mi<=to;})}>
<CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)"/>
<XAxis dataKey="n" tick={{fill:"rgba(255,255,255,0.5)",fontSize:11}}/>
<YAxis tick={{fill:"rgba(255,255,255,0.5)",fontSize:11}}/>
<Tooltip content={<CTip/>}/><Legend wrapperStyle={{fontSize:10}}/>
<Bar dataKey="lm" name="0-3 days" stackId="a" fill="#ef4444"/>
<Bar dataKey="w1" name="4-7 days" stackId="a" fill="#f59e0b"/>
<Bar dataKey="w2" name="8-14 days" stackId="a" fill="#eab308"/>
<Bar dataKey="mo1" name="15-30 days" stackId="a" fill="#22d3ee"/>
<Bar dataKey="mo2" name="1-2 months" stackId="a" fill="#6366f1"/>
<Bar dataKey="mo3" name="2-3 months" stackId="a" fill="#8b5cf6"/>
<Bar dataKey="mo6" name="3-6 months" stackId="a" fill="#10b981"/>
<Bar dataKey="far" name="6+ months" stackId="a" fill="#059669"/>
</BarChart>
</ResponsiveContainer>
</div>

{/* Lead Time by Source */}
<STitle sub="Which channels book furthest ahead?">{"\ud83d\udce1"} Lead Time by Channel</STitle>
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:12,marginBottom:24}}>
<KPICard label="Direct" value="113 days avg" sub="Median: 94 days" pctLabel="Longest lead" status="green"/>
<KPICard label="Airbnb" value="105 days avg" sub="Median: 78 days" pctLabel="Early bookers" status="green"/>
<KPICard label="Booking.com" value="91 days avg" sub="Median: 64 days" pctLabel="78% of volume" status="amber"/>
<KPICard label="Expedia" value="112 days avg" sub="Only 1 booking" pctLabel="Low sample" status="amber"/>
</div>

{/* Detail Table */}
<STitle>Monthly Lead Time Detail</STitle>
<div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}><thead><tr style={{borderBottom:"1px solid rgba(255,255,255,0.1)"}}>
{["Month","2026 Avg","2026 Median","2025 Avg","2025 Median","\u0394 Avg","Bk 2026","Last-Min","1-4wk","1-3mo","3mo+"].map(h=>(<th key={h} style={{padding:"10px 8px",textAlign:"left",color:"rgba(255,255,255,0.5)",fontWeight:600,whiteSpace:"nowrap"}}>{h}</th>))}
</tr></thead><tbody>
{[{m:1,a26:2,md26:2,a25:7,md25:4,n26:2,lm:1,mid:1,mo:0,far:0},{m:2,a26:12,md26:2,a25:8,md25:5,n26:26,lm:16,mid:8,mo:1,far:1},{m:3,a26:20,md26:15,a25:26,md25:8,n26:36,lm:5,mid:22,mo:9,far:0},{m:4,a26:59,md26:40,a25:33,md25:17,n26:29,lm:0,mid:5,mo:20,far:4},{m:5,a26:82,md26:84,a25:44,md25:21,n26:22,lm:0,mid:0,mo:15,far:7},{m:6,a26:136,md26:134,a25:53,md25:48,n26:13,lm:0,mid:0,mo:0,far:13},{m:7,a26:195,md26:192,a25:86,md25:53,n26:30,lm:0,mid:0,mo:0,far:30},{m:8,a26:227,md26:202,a25:88,md25:74,n26:5,lm:0,mid:0,mo:0,far:5},{m:9,a26:214,md26:221,a25:21,md25:6,n26:8,lm:0,mid:0,mo:0,far:8},{m:10,a26:293,md26:293,a25:42,md25:22,n26:1,lm:0,mid:0,mo:0,far:1},{m:11,a26:0,md26:0,a25:11,md25:6,n26:0,lm:0,mid:0,mo:0,far:0},{m:12,a26:351,md26:351,a25:52,md25:46,n26:1,lm:0,mid:0,mo:0,far:1}].filter(d=>d.m>=from&&d.m<=to).map(d=>{
const dlt=d.a25>0?d.a26-d.a25:0;const st=dlt>0?"green":dlt<-10?"red":"amber";
return(<tr key={d.m} style={{borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
<td style={{padding:"10px 8px",fontWeight:600,color:"#fff"}}>{MONTHS[d.m-1]}</td>
<td style={{padding:"10px 8px",color:"#fff",fontWeight:600}}>{d.a26}d</td>
<td style={{padding:"10px 8px",color:"rgba(255,255,255,0.6)"}}>{d.md26}d</td>
<td style={{padding:"10px 8px",color:"rgba(255,255,255,0.5)"}}>{d.a25}d</td>
<td style={{padding:"10px 8px",color:"rgba(255,255,255,0.4)"}}>{d.md25}d</td>
<td style={{padding:"10px 8px",color:sc[st],fontWeight:600}}>{dlt>0?"+":""}{dlt}d</td>
<td style={{padding:"10px 8px",color:"#fff"}}>{d.n26}</td>
<td style={{padding:"10px 8px",color:d.lm>5?sc.amber:"rgba(255,255,255,0.6)"}}>{d.lm}</td>
<td style={{padding:"10px 8px",color:"rgba(255,255,255,0.6)"}}>{d.mid}</td>
<td style={{padding:"10px 8px",color:"rgba(255,255,255,0.6)"}}>{d.mo}</td>
<td style={{padding:"10px 8px",color:d.far>5?sc.green:"rgba(255,255,255,0.6)"}}>{d.far}</td>
</tr>);})}
</tbody></table></div>

{/* Strategic Insights */}
<STitle>{"\ud83d\udca1"} Strategic Insights</STitle>
<div style={{display:"flex",flexDirection:"column",gap:10}}>
<div style={{background:"rgba(99,102,241,0.08)",border:"1px solid rgba(99,102,241,0.2)",borderRadius:10,padding:"14px 18px"}}><div style={{fontWeight:700,color:"#fff",fontSize:13,marginBottom:4}}>Winter (Jan-Feb): Last-minute market dominates</div><div style={{fontSize:12,color:"rgba(255,255,255,0.6)",lineHeight:1.6}}>62% of Feb bookings arrive within 3 days. Strategy: keep rates flexible, activate flash deals 1 week before, don't discount too early — these guests will book regardless.</div></div>
<div style={{background:"rgba(99,102,241,0.08)",border:"1px solid rgba(99,102,241,0.2)",borderRadius:10,padding:"14px 18px"}}><div style={{fontWeight:700,color:"#fff",fontSize:13,marginBottom:4}}>Spring (Mar-Apr): Mixed booking window — perfect for dynamic pricing</div><div style={{fontSize:12,color:"rgba(255,255,255,0.6)",lineHeight:1.6}}>March has bookings from same-day to 72 days. April shifts to 1-2 months. Use tiered pricing: early-bird rate at 60+ days, standard at 30 days, flexible premium under 14 days.</div></div>
<div style={{background:"rgba(16,185,129,0.08)",border:"1px solid rgba(16,185,129,0.2)",borderRadius:10,padding:"14px 18px"}}><div style={{fontWeight:700,color:"#fff",fontSize:13,marginBottom:4}}>Summer (Jun-Aug): Guests plan 4-7 months ahead</div><div style={{fontSize:12,color:"rgba(255,255,255,0.6)",lineHeight:1.6}}>100% of summer bookings are 90+ days out. This means: set summer rates NOW for 2027. Consider non-refundable early-bird rates. July week 29 is at 89.6% occ — raise rates immediately for remaining inventory.</div></div>
<div style={{background:"rgba(99,102,241,0.08)",border:"1px solid rgba(99,102,241,0.2)",borderRadius:10,padding:"14px 18px"}}><div style={{fontWeight:700,color:"#fff",fontSize:13,marginBottom:4}}>2026 lead times are 2× longer than 2025 across the board</div><div style={{fontSize:12,color:"rgba(255,255,255,0.6)",lineHeight:1.6}}>This is positive — it means guests see more value and plan ahead. Use this visibility to optimize yield management. You have MORE time to adjust pricing and close gaps.</div></div>
</div>
</div>)}

{/* ADR ANALYSIS */}
{tab==="adr"&&(<div>
<STitle sub="Impatto dell'erosione ADR e occupancy necessaria per compensare">💰 ADR Gap Analysis</STitle>

{/* Headline */}
<div style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:12,padding:"18px 22px",marginBottom:24}}>
<div style={{fontSize:16,fontWeight:700,color:"#fff",marginBottom:6}}>ADR Gap: quasi azzerato con Prezzo totale</div>
<div style={{fontSize:13,color:"rgba(255,255,255,0.6)",lineHeight:1.7}}>OTB ADR CHF 158 vs CHF 155 corrected 2025 FY (<strong style={{color:"#10b981"}}>+1.8%</strong>). Con il Prezzo totale il gap ADR \u00e8 praticamente eliminato. Il confronto OTB (CHF 160) mostra un gap minimo di CHF -2/notte. Note: 2025 ADR corretta per Sybille (giu, 5 apt non 1) e agosto (10 notti non 1).</div>
</div>

{/* Scenario Cards */}
<STitle sub="Quanto occupancy in più serve per compensare?">📊 Scenari di Break-Even</STitle>
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12,marginBottom:24}}>
<div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:"20px 22px"}}>
<div style={{fontSize:11,fontWeight:500,color:"rgba(255,255,255,0.5)",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Scenario 1: Confronto OTB attuale</div>
<div style={{fontSize:28,fontWeight:700,color:"#10b981"}}>+15.2%</div>
<div style={{fontSize:13,color:"rgba(255,255,255,0.6)",marginTop:4}}>CHF 115'049 vs CHF 99'869 STLY</div>
<div style={{fontSize:12,color:"rgba(255,255,255,0.4)",marginTop:4}}>Revenue OTB avanti di CHF 15'180</div>
<div style={{marginTop:8,padding:"6px 10px",background:"rgba(16,185,129,0.1)",borderRadius:6,fontSize:11,color:"#10b981",fontWeight:600,display:"inline-block"}}>In pista</div>
</div>
<div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:"20px 22px"}}>
<div style={{fontSize:11,fontWeight:500,color:"rgba(255,255,255,0.5)",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Scenario 2: ADR vs 2025 Full Year</div>
<div style={{fontSize:28,fontWeight:700,color:"#10b981"}}>+1.8%</div>
<div style={{fontSize:13,color:"rgba(255,255,255,0.6)",marginTop:4}}>CHF 158 vs CHF 155 (2025 corrected)</div>
<div style={{fontSize:12,color:"rgba(255,255,255,0.4)",marginTop:4}}>ADR gap eliminato — il focus è ora su volume/occupancy</div>
<div style={{marginTop:8,padding:"6px 10px",background:"rgba(16,185,129,0.1)",borderRadius:6,fontSize:11,color:"#10b981",fontWeight:600,display:"inline-block"}}>OK</div>
</div>
<div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:"20px 22px"}}>
<div style={{fontSize:11,fontWeight:500,color:"rgba(255,255,255,0.5)",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Scenario 3: Raggiungere budget</div>
<div style={{fontSize:28,fontWeight:700,color:"#ef4444"}}>49.7% Occ</div>
<div style={{fontSize:13,color:"rgba(255,255,255,0.6)",marginTop:4}}>+476 RN vs 2025 (~125 prenotazioni extra)</div>
<div style={{fontSize:12,color:"rgba(255,255,255,0.4)",marginTop:4}}>Budget costruito con ADR più alti — molto ambizioso</div>
<div style={{marginTop:8,padding:"6px 10px",background:"rgba(239,68,68,0.1)",borderRadius:6,fontSize:11,color:"#ef4444",fontWeight:600,display:"inline-block"}}>Difficile</div>
</div>
<div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:"20px 22px"}}>
<div style={{fontSize:11,fontWeight:500,color:"rgba(255,255,255,0.5)",textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Alternativa: ADR necessario per budget</div>
<div style={{fontSize:28,fontWeight:700,color:"#ef4444"}}>CHF 179</div>
<div style={{fontSize:13,color:"rgba(255,255,255,0.6)",marginTop:4}}>+13% vs attuale — a parità volume 2025 (1'603 RN)</div>
<div style={{fontSize:12,color:"rgba(255,255,255,0.4)",marginTop:4}}>Non realistico nel breve termine</div>
<div style={{marginTop:8,padding:"6px 10px",background:"rgba(239,68,68,0.1)",borderRadius:6,fontSize:11,color:"#ef4444",fontWeight:600,display:"inline-block"}}>Non realistico</div>
</div>
</div>

{/* ADR by month chart */}
<STitle sub="Dove si perde e dove si guadagna ADR?">📈 ADR per Mese: 2026 OTB vs 2025 STLY</STitle>
<div style={{background:"rgba(255,255,255,0.03)",borderRadius:12,padding:"16px 8px 8px",marginBottom:24}}>
<ResponsiveContainer width="100%" height={300}>
<ComposedChart data={[
{n:"Jan",a26:93,a25:166},{n:"Feb",a26:118,a25:94},{n:"Mar",a26:115,a25:143},{n:"Apr",a26:158,a25:161},
{n:"May",a26:155,a25:150},{n:"Jun",a26:170,a25:161},{n:"Jul",a26:223,a25:175},{n:"Aug",a26:169,a25:192},
{n:"Sep",a26:161,a25:0},{n:"Oct",a26:204,a25:0},{n:"Nov",a26:0,a25:0},{n:"Dec",a26:159,a25:0}
]}>
<CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)"/>
<XAxis dataKey="n" tick={{fill:"rgba(255,255,255,0.5)",fontSize:11}}/>
<YAxis tick={{fill:"rgba(255,255,255,0.5)",fontSize:11}} domain={[0,250]}/>
<Tooltip content={<CTip/>}/><Legend wrapperStyle={{fontSize:11}}/>
<Bar dataKey="a26" name="ADR 2026" fill="#6366f1" radius={[4,4,0,0]}/>
<Bar dataKey="a25" name="ADR 2025 STLY" fill="rgba(255,255,255,0.2)" radius={[4,4,0,0]}/>
</ComposedChart>
</ResponsiveContainer>
</div>

{/* Monthly break-even table */}
<STitle sub="Quante RN extra servono per mese per compensare il gap ADR">🔢 Break-Even per Mese</STitle>
<div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
<thead><tr style={{borderBottom:"1px solid rgba(255,255,255,0.1)"}}>
{["Mese","ADR 26","ADR 25","Gap/RN","RN 26","Rev Gap","Extra RN","Extra Bk","Status"].map(h=>(<th key={h} style={{padding:"10px 8px",textAlign:"left",color:"rgba(255,255,255,0.5)",fontWeight:600,whiteSpace:"nowrap"}}>{h}</th>))}
</tr></thead>
<tbody>
{[{n:"Jan",a26:93,a25:166,rn:6},{n:"Feb",a26:118,a25:94,rn:87},{n:"Mar",a26:115,a25:143,rn:146},{n:"Apr",a26:158,a25:161,rn:142},{n:"May",a26:155,a25:150,rn:89},{n:"Jun",a26:170,a25:161,rn:66},{n:"Jul",a26:223,a25:175,rn:133},{n:"Aug",a26:169,a25:192,rn:33}].map((d,i)=>{
const gap=d.a25>0&&d.a26>0?d.a25-d.a26:0;const revGap=gap*d.rn;const extra=d.a26>0&&gap>0?Math.ceil(revGap/d.a26):0;const extraBk=extra>0?Math.ceil(extra/3.8):0;
const ok=gap<=0&&d.a26>0;
return(<tr key={i} style={{borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
<td style={{padding:"10px 8px",fontWeight:600,color:"#fff"}}>{d.n}</td>
<td style={{padding:"10px 8px",color:"#fff"}}>CHF {d.a26}</td>
<td style={{padding:"10px 8px",color:"rgba(255,255,255,0.5)"}}>CHF {d.a25}</td>
<td style={{padding:"10px 8px",color:ok?sc.green:gap>30?sc.red:sc.amber,fontWeight:600}}>{ok?"OK":"CHF -"+gap}</td>
<td style={{padding:"10px 8px",color:"#fff"}}>{d.rn}</td>
<td style={{padding:"10px 8px",color:ok?"rgba(255,255,255,0.4)":sc.red,fontWeight:ok?400:600}}>{ok?"\u2014":"CHF -"+revGap.toLocaleString("de-CH")}</td>
<td style={{padding:"10px 8px",color:ok?"rgba(255,255,255,0.4)":"#fff",fontWeight:ok?400:700}}>{ok?"\u2014":"+"+extra}</td>
<td style={{padding:"10px 8px",color:ok?"rgba(255,255,255,0.4)":"#fff"}}>{ok?"\u2014":"~+"+extraBk}</td>
<td style={{padding:"10px 8px"}}>{ok?<span style={{color:sc.green,fontWeight:600}}>🟢 OK</span>:extra>30?<span style={{color:sc.red,fontWeight:600}}>🔴 Critico</span>:<span style={{color:sc.amber,fontWeight:600}}>🟡 Recuperabile</span>}</td>
</tr>);})}
<tr style={{borderTop:"2px solid rgba(255,255,255,0.15)",fontWeight:700}}>
<td style={{padding:"10px 8px",color:"#fff"}}>TOTALE</td><td colSpan={4}></td>
<td style={{padding:"10px 8px",color:sc.green,fontWeight:700}}>Gap minimo</td>
<td style={{padding:"10px 8px",color:"#fff",fontWeight:700}}>ADR OK</td>
<td style={{padding:"10px 8px",color:"#fff"}}></td>
<td style={{padding:"10px 8px",color:sc.green,fontWeight:600}}>Focus: volume</td>
</tr>
</tbody></table></div>

{/* ADR by room */}
<STitle sub="Quali appartamenti perdono di più?">🏠 ADR per Appartamento: 2026 vs 2025</STitle>
<div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
<thead><tr style={{borderBottom:"1px solid rgba(255,255,255,0.1)"}}>
{["Appartamento","ADR 26","ADR 25","Gap","RN 26","Impatto CHF","Status"].map(h=>(<th key={h} style={{padding:"10px 8px",textAlign:"left",color:"rgba(255,255,255,0.5)",fontWeight:600,whiteSpace:"nowrap"}}>{h}</th>))}
</tr></thead>
<tbody>
{[{r:"Sup. 1-Room N°9",a26:144,a25:139,rn:81},{r:"Charming Nr 15",a26:133,a25:155,rn:59},{r:"Sup. Penthouse N°18",a26:176,a25:180,rn:85},{r:"Studio N°7",a26:143,a25:155,rn:79},{r:"Cozy Studio Nr.1",a26:131,a25:145,rn:44},{r:"Studio N°12",a26:123,a25:128,rn:91},{r:"Sunny Nr. 3",a26:192,a25:185,rn:52},{r:"2-Rooms Apt N°10",a26:169,a25:165,rn:40},{r:"2-Rooms Apt N°17",a26:174,a25:164,rn:71},{r:"Sup. 2-Rooms N°4",a26:196,a25:172,rn:78},{r:"Studio N°8",a26:159,a25:133,rn:50}].map((d,i)=>{
const gap=d.a26-d.a25;const impact=gap*d.rn;const ok=gap>=0;
return(<tr key={i} style={{borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
<td style={{padding:"10px 8px",fontWeight:600,color:"#fff"}}>{d.r}</td>
<td style={{padding:"10px 8px",color:"#fff"}}>CHF {d.a26}</td>
<td style={{padding:"10px 8px",color:"rgba(255,255,255,0.5)"}}>CHF {d.a25}</td>
<td style={{padding:"10px 8px",color:ok?sc.green:gap<-30?sc.red:sc.amber,fontWeight:600}}>CHF {gap>0?"+":""}{gap}</td>
<td style={{padding:"10px 8px",color:"#fff"}}>{d.rn}</td>
<td style={{padding:"10px 8px",color:ok?sc.green:sc.red,fontWeight:600}}>CHF {impact>0?"+":""}{impact.toLocaleString("de-CH")}</td>
<td style={{padding:"10px 8px"}}>{ok?<span style={{color:sc.green}}>🟢</span>:gap<-30?<span style={{color:sc.red}}>🔴</span>:<span style={{color:sc.amber}}>🟡</span>}</td>
</tr>);})}
</tbody></table></div>

{/* Channel ADR */}
<STitle sub="Dove si concentra la perdita per canale?">📡 ADR per Canale</STitle>
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:12,marginBottom:24}}>
<KPICard label="Booking.com" value="CHF 158" sub="2025: CHF 151" pctLabel="+4.6%" status="green"/>
<KPICard label="Direct" value="CHF 157" sub="2025 corrected: ~CHF 161" pctLabel="-2.5%" status="amber"/>
<KPICard label="Airbnb" value="CHF 139" sub="2025: CHF 130" pctLabel="+7.0%" status="green"/>
</div>

{/* Strategic recommendations */}
<STitle>💡 Strategia Consigliata</STitle>
<div style={{display:"flex",flexDirection:"column",gap:10}}>
<div style={{background:"rgba(16,185,129,0.08)",border:"1px solid rgba(16,185,129,0.2)",borderRadius:10,padding:"14px 18px"}}>
<div style={{fontWeight:700,color:"#fff",fontSize:13,marginBottom:4}}>🟢 ADR in linea con il 2025 — il problema non è il prezzo</div>
<div style={{fontSize:12,color:"rgba(255,255,255,0.6)",lineHeight:1.6}}>Con il Prezzo totale, l'ADR 2026 (CHF 158) supera leggermente il 2025 corretto (CHF 155). Il focus strategico si sposta dall'ADR al volume: servono più room nights per raggiungere il budget.</div>
</div>
<div style={{background:"rgba(99,102,241,0.08)",border:"1px solid rgba(99,102,241,0.2)",borderRadius:10,padding:"14px 18px"}}>
<div style={{fontWeight:700,color:"#fff",fontSize:13,marginBottom:4}}>📝 Nota: Correzioni dati 2025 applicate</div>
<div style={{fontSize:12,color:"rgba(255,255,255,0.6)",lineHeight:1.6}}>Due prenotazioni 2025 erano registrate in modo errato: (1) Sybille Wiedenmann (giu, CHF 8'750) era registrata come 1 camera ma sono 5 appartamenti × 10 notti. (2) Agosto 17, 5 prenotazioni registrate come 1 notte, in realtà sono 10 notti a CHF 200/notte. Revenue calcolato con "Prezzo totale" (tasse incluse).</div>
</div>
<div style={{background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.2)",borderRadius:10,padding:"14px 18px"}}>
<div style={{fontWeight:700,color:"#fff",fontSize:13,marginBottom:4}}>🟡 Marzo: volume alto ma ADR sotto STLY (CHF 115 vs 143)</div>
<div style={{fontSize:12,color:"rgba(255,255,255,0.6)",lineHeight:1.6}}>Marzo ha 146 RN (+46% vs STLY) ma ADR -19%. Stai riempiendo con tariffe basse. Per le ultime 2 settimane valuta un leggero aumento.</div>
</div>
<div style={{background:"rgba(16,185,129,0.08)",border:"1px solid rgba(16,185,129,0.2)",borderRadius:10,padding:"14px 18px"}}>
<div style={{fontWeight:700,color:"#fff",fontSize:13,marginBottom:4}}>🟢 Luglio: ADR +28% — CHF 223 vs 175 STLY</div>
<div style={{fontSize:12,color:"rgba(255,255,255,0.6)",lineHeight:1.6}}>Performance eccezionale. Non cedere a sconti. W29 al 87% occupancy. Ogni CHF 10 in più su 133 RN = CHF 1'330.</div>
</div>
<div style={{background:"rgba(16,185,129,0.08)",border:"1px solid rgba(16,185,129,0.2)",borderRadius:10,padding:"14px 18px"}}>
<div style={{fontWeight:700,color:"#fff",fontSize:13,marginBottom:4}}>🟢 Aprile e Maggio in forte crescita OTB</div>
<div style={{fontSize:12,color:"rgba(255,255,255,0.6)",lineHeight:1.6}}>Aprile +50% vs STLY, Maggio +20%. La domanda c'è — mantieni le tariffe e cerca di catturare prenotazioni dirette per ridurre le commissioni OTA.</div>
</div>
</div>
</div>)}

{/* FOOTER */}
<div style={{marginTop:48,paddingTop:20,borderTop:"1px solid rgba(255,255,255,0.06)",textAlign:"center"}}><p style={{fontSize:11,color:"rgba(255,255,255,0.25)",margin:0}}>Residenza Motta — March 20, 2026 — 11 Units — Locarno, Ticino</p><p style={{fontSize:10,color:"rgba(255,255,255,0.15)",margin:"6px 0 0"}}>Confirmed + modified only · OTB: 2025 bookings created on or before 20.03.2025 only · Budget from 2026 Business Plan · Direct = Amenitiz + Manual bookings</p></div>
</div>);}
