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
const M26=[{m:1,bk:2,rev:557.23,rn:6,arn:341,occ:1.8,adr:92.87,rpar:1.63,los:3.0,lead:2.0,bud:8000},{m:2,bk:26,rev:10251.56,rn:87,arn:308,occ:28.2,adr:117.83,rpar:33.28,los:3.3,lead:11.5,bud:10135.18},{m:3,bk:51,rev:21046.65,rn:174,arn:341,occ:51.0,adr:120.96,rpar:61.72,los:3.4,lead:15.1,bud:20846.19},{m:4,bk:56,rev:33785.64,rn:210,arn:330,occ:63.6,adr:160.88,rpar:102.38,los:3.5,lead:34.0,bud:33756.04},{m:5,bk:53,rev:32042.71,rn:192,arn:341,occ:56.3,adr:166.89,rpar:93.97,los:3.5,lead:37.2,bud:27534.92},{m:6,bk:59,rev:32260.97,rn:183,arn:330,occ:55.5,adr:176.29,rpar:97.76,los:2.8,lead:41.7,bud:33572.64},{m:7,bk:86,rev:57917.52,rn:258,arn:341,occ:75.7,adr:224.49,rpar:169.85,los:2.8,lead:76.9,bud:48258.68},{m:8,bk:37,rev:45777.58,rn:251,arn:341,occ:73.6,adr:182.38,rpar:134.25,los:5.6,lead:69.9,bud:37898.91},{m:9,bk:33,rev:21620.41,rn:136,arn:330,occ:41.2,adr:158.97,rpar:65.52,los:4.1,lead:119.2,bud:23202.56},{m:10,bk:2,rev:1989.03,rn:10,arn:341,occ:2.9,adr:198.9,rpar:5.83,los:5.0,lead:237.5,bud:29649.73},{m:11,bk:4,rev:1739.74,rn:13,arn:330,occ:3.9,adr:133.83,rpar:5.27,los:3.2,lead:168.5,bud:5235.86},{m:12,bk:1,rev:1426.0,rn:8,arn:341,occ:2.3,adr:178.25,rpar:4.18,los:8.0,lead:352.0,bud:8215.43}];
const OTB=[{m:1,r25:5637.54,rn25:34,bk25:11,r26:557.23,rn26:6,bk26:2,d:-5080.31,dp:-90.1},{m:2,r25:8652.27,rn25:92,bk25:25,r26:10251.56,rn26:87,bk26:26,d:1599.29,dp:18.5},{m:3,r25:17692.23,rn25:124,bk25:28,r26:21046.65,rn26:174,bk26:51,d:3354.42,dp:19.0},{m:4,r25:27295.59,rn25:170,bk25:41,r26:33785.64,rn26:210,bk26:56,d:6490.05,dp:23.8},{m:5,r25:22728.88,rn25:152,bk25:41,r26:32042.71,rn26:192,bk26:53,d:9313.83,dp:41.0},{m:6,r25:32309.4,rn25:161,bk25:41,r26:32260.97,rn26:183,bk26:59,d:-48.43,dp:-0.1},{m:7,r25:40367.99,rn25:231,bk25:65,r26:57917.52,rn26:258,bk26:86,d:17549.53,dp:43.5},{m:8,r25:21914.15,rn25:115,bk25:19,r26:45777.58,rn26:251,bk26:37,d:23863.43,dp:108.9},{m:9,r25:2661.66,rn25:16,bk25:5,r26:21620.41,rn26:136,bk26:33,d:18958.75,dp:712.3},{m:10,r25:6275.53,rn25:39,bk25:8,r26:1989.03,rn26:10,bk26:2,d:-4286.5,dp:-68.3},{m:11,r25:0.0,rn25:0,bk25:0,r26:1739.74,rn26:13,bk26:4,d:1739.74,dp:0},{m:12,r25:0.0,rn25:0,bk25:0,r26:1426.0,rn26:8,bk26:1,d:1426.0,dp:0}];
const WEEKS=[{w:4,ws:"19 Jan",bk:1,rev:363.75,rn:4,los:4.0,occ:5.2},{w:5,ws:"26 Jan",bk:1,rev:193.48,rn:2,los:2.0,occ:2.6},{w:6,ws:"02 Feb",bk:5,rev:1427.96,rn:14,los:2.8,occ:18.2},{w:7,ws:"09 Feb",bk:4,rev:1242.19,rn:14,los:3.5,occ:18.2},{w:8,ws:"16 Feb",bk:15,rev:6065.49,rn:45,los:3.0,occ:58.4},{w:9,ws:"23 Feb",bk:2,rev:1515.92,rn:14,los:7.0,occ:18.2},{w:10,ws:"02 Mar",bk:8,rev:2496.97,rn:24,los:3.0,occ:31.2},{w:11,ws:"09 Mar",bk:8,rev:3111.85,rn:28,los:3.5,occ:36.4},{w:12,ws:"16 Mar",bk:17,rev:7027.89,rn:64,los:3.8,occ:83.1},{w:13,ws:"23 Mar",bk:14,rev:6685.54,rn:45,los:3.2,occ:58.4},{w:14,ws:"30 Mar",bk:14,rev:7526.33,rn:51,los:3.6,occ:66.2},{w:15,ws:"06 Apr",bk:17,rev:10873.17,rn:63,los:3.7,occ:81.8},{w:16,ws:"13 Apr",bk:9,rev:3802.65,rn:26,los:2.9,occ:33.8},{w:17,ws:"20 Apr",bk:12,rev:7541.94,rn:49,los:3.2,occ:63.6},{w:18,ws:"27 Apr",bk:14,rev:10079.49,rn:63,los:4.3,occ:81.8},{w:19,ws:"04 May",bk:4,rev:1559.39,rn:11,los:2.8,occ:14.3},{w:20,ws:"11 May",bk:11,rev:6951.91,rn:37,los:3.1,occ:48.1},{w:21,ws:"18 May",bk:17,rev:8204.56,rn:48,los:2.8,occ:62.3},{w:22,ws:"25 May",bk:15,rev:11013.31,rn:67,los:4.5,occ:87.0},{w:23,ws:"01 Jun",bk:11,rev:5532.76,rn:32,los:2.9,occ:41.6},{w:24,ws:"08 Jun",bk:15,rev:7466.52,rn:41,los:2.7,occ:53.2},{w:25,ws:"15 Jun",bk:17,rev:10408.4,rn:54,los:2.5,occ:70.1},{w:26,ws:"22 Jun",bk:13,rev:7041.14,rn:43,los:3.1,occ:55.8},{w:27,ws:"29 Jun",bk:14,rev:6484.18,rn:38,los:2.7,occ:49.4},{w:28,ws:"06 Jul",bk:23,rev:12914.09,rn:56,los:2.4,occ:72.7},{w:29,ws:"13 Jul",bk:29,rev:20375.24,rn:74,los:2.6,occ:96.1},{w:30,ws:"20 Jul",bk:12,rev:10924.8,rn:55,los:4.0,occ:71.4},{w:31,ws:"27 Jul",bk:18,rev:14082.04,rn:76,los:3.8,occ:98.7},{w:32,ws:"03 Aug",bk:10,rev:23208.69,rn:116,los:7.2,occ:150.6},{w:33,ws:"10 Aug",bk:1,rev:1372.0,rn:7,los:7.0,occ:9.1},{w:34,ws:"17 Aug",bk:10,rev:7441.12,rn:49,los:4.9,occ:63.6},{w:35,ws:"24 Aug",bk:8,rev:8568.09,rn:50,los:6.2,occ:64.9},{w:36,ws:"31 Aug",bk:12,rev:6132.6,rn:40,los:3.3,occ:51.9},{w:37,ws:"07 Sep",bk:8,rev:5548.51,rn:35,los:4.4,occ:45.5},{w:38,ws:"14 Sep",bk:8,rev:5659.26,rn:35,los:4.4,occ:45.5},{w:39,ws:"21 Sep",bk:4,rev:3086.44,rn:19,los:4.8,occ:24.7},{w:40,ws:"28 Sep",bk:2,rev:1330.6,rn:8,los:4.0,occ:10.4},{w:41,ws:"05 Oct",bk:2,rev:1989.03,rn:10,los:5.0,occ:13.0},{w:44,ws:"26 Oct",bk:1,rev:749.08,rn:6,los:6.0,occ:7.8},{w:46,ws:"09 Nov",bk:1,rev:236.62,rn:2,los:2.0,occ:2.6},{w:47,ws:"16 Nov",bk:1,rev:312.04,rn:2,los:2.0,occ:2.6},{w:48,ws:"23 Nov",bk:1,rev:442.0,rn:3,los:3.0,occ:3.9},{w:52,ws:"21 Dec",bk:1,rev:1426.0,rn:8,los:8.0,occ:10.4}];
// Channels: Amenitiz + Prenotazione Manuale merged into "Direct"
const SRC26=[{"source":"Booking.com","bk":276,"rev":157695.01,"rn":930},{"source":"Direct","bk":86,"rev":83972.8,"rn":489},{"source":"Airbnb","bk":38,"rev":14624.5,"rn":89},{"source":"Expedia","bk":10,"rev":4122.73,"rn":20}];
const RM26=[{"room":"Sup. Penthouse N°18","bk":38,"rev":28850.53,"rn":159,"los":4.18,"lead":71.8},{"room":"2-Rooms Apt N°17","bk":40,"rev":28319.61,"rn":154,"los":3.85,"lead":53.3},{"room":"Sunny Nr. 3","bk":38,"rev":26470.61,"rn":135,"los":3.55,"lead":45.8},{"room":"Studio N°7","bk":44,"rev":25917.5,"rn":164,"los":3.73,"lead":53.2},{"room":"Sup. 1-Room Apt N°9","bk":31,"rev":23981.78,"rn":141,"los":4.55,"lead":50.4},{"room":"Studio N°8","bk":43,"rev":23794.72,"rn":146,"los":3.4,"lead":47.6},{"room":"Sup. 2-Rooms Apt N°4","bk":37,"rev":22632.39,"rn":114,"los":3.08,"lead":80.9},{"room":"Studio N°12","bk":53,"rev":21435.98,"rn":146,"los":2.75,"lead":59.7},{"room":"2-Rooms Apt N°10","bk":32,"rev":20854.65,"rn":125,"los":3.91,"lead":43.1},{"room":"Charming Nr 15","bk":40,"rev":20508.94,"rn":128,"los":3.2,"lead":47.7},{"room":"Cozy Studio Nr. 1","bk":33,"rev":17648.33,"rn":116,"los":3.52,"lead":41.8}];
const BUDGET_MO=[8000,10135.18,20846.19,33756.04,27534.92,33572.64,48258.68,37898.91,23202.56,29649.73,5235.86,8215.43];
// Daily pace data
const PACE_D26=[{d:"2025-08-18",bk:1,rev:2370.0,rn:11,cn:0,bc:0,di:1,ab:0,ex:0},{d:"2025-09-30",bk:1,rev:535.26,rn:3,cn:0,bc:1,di:0,ab:0,ex:0},{d:"2025-10-10",bk:0,rev:0.0,rn:0,cn:1,bc:0,di:0,ab:0,ex:0},{d:"2025-10-23",bk:0,rev:0.0,rn:0,cn:1,bc:0,di:0,ab:0,ex:0},{d:"2025-10-27",bk:1,rev:1587.6,rn:7,cn:0,bc:0,di:0,ab:0,ex:1},{d:"2025-10-31",bk:1,rev:130.7,rn:1,cn:0,bc:0,di:0,ab:1,ex:0},{d:"2025-11-03",bk:0,rev:0.0,rn:0,cn:2,bc:0,di:0,ab:0,ex:0},{d:"2025-11-04",bk:2,rev:1089.02,rn:6,cn:3,bc:2,di:0,ab:0,ex:0},{d:"2025-11-05",bk:1,rev:3615.06,rn:14,cn:0,bc:1,di:0,ab:0,ex:0},{d:"2025-11-06",bk:1,rev:812.04,rn:4,cn:1,bc:1,di:0,ab:0,ex:0},{d:"2025-11-08",bk:0,rev:0.0,rn:0,cn:1,bc:0,di:0,ab:0,ex:0},{d:"2025-11-09",bk:1,rev:545.28,rn:3,cn:0,bc:1,di:0,ab:0,ex:0},{d:"2025-11-11",bk:1,rev:797.0,rn:3,cn:0,bc:0,di:0,ab:1,ex:0},{d:"2025-11-15",bk:1,rev:404.55,rn:4,cn:0,bc:0,di:0,ab:1,ex:0},{d:"2025-11-19",bk:1,rev:1458.24,rn:5,cn:0,bc:1,di:0,ab:0,ex:0},{d:"2025-11-28",bk:1,rev:816.6,rn:3,cn:0,bc:1,di:0,ab:0,ex:0},{d:"2025-12-07",bk:0,rev:0.0,rn:0,cn:1,bc:0,di:0,ab:0,ex:0},{d:"2025-12-13",bk:1,rev:325.48,rn:2,cn:0,bc:1,di:0,ab:0,ex:0},{d:"2025-12-16",bk:2,rev:1619.13,rn:6,cn:1,bc:2,di:0,ab:0,ex:0},{d:"2025-12-19",bk:1,rev:613.2,rn:3,cn:0,bc:0,di:1,ab:0,ex:0},{d:"2025-12-21",bk:1,rev:1503.0,rn:6,cn:1,bc:0,di:1,ab:0,ex:0},{d:"2025-12-22",bk:0,rev:0.0,rn:0,cn:1,bc:0,di:0,ab:0,ex:0},{d:"2025-12-24",bk:1,rev:697.44,rn:3,cn:0,bc:1,di:0,ab:0,ex:0},{d:"2025-12-29",bk:1,rev:780.6,rn:3,cn:0,bc:1,di:0,ab:0,ex:0},{d:"2025-12-30",bk:1,rev:637.0,rn:4,cn:0,bc:0,di:1,ab:0,ex:0},{d:"2025-12-31",bk:0,rev:0.0,rn:0,cn:1,bc:0,di:0,ab:0,ex:0},{d:"2026-01-01",bk:1,rev:1014.1,rn:7,cn:0,bc:0,di:1,ab:0,ex:0},{d:"2026-01-04",bk:1,rev:926.4,rn:3,cn:0,bc:1,di:0,ab:0,ex:0},{d:"2026-01-05",bk:0,rev:0.0,rn:0,cn:4,bc:0,di:0,ab:0,ex:0},{d:"2026-01-07",bk:1,rev:385.69,rn:3,cn:0,bc:1,di:0,ab:0,ex:0},{d:"2026-01-09",bk:1,rev:1426.0,rn:8,cn:1,bc:0,di:1,ab:0,ex:0},{d:"2026-01-12",bk:2,rev:2105.55,rn:12,cn:0,bc:1,di:1,ab:0,ex:0},{d:"2026-01-18",bk:1,rev:608.4,rn:2,cn:1,bc:1,di:0,ab:0,ex:0},{d:"2026-01-19",bk:1,rev:529.92,rn:3,cn:0,bc:1,di:0,ab:0,ex:0},{d:"2026-01-20",bk:2,rev:1466.85,rn:10,cn:2,bc:2,di:0,ab:0,ex:0},{d:"2026-01-21",bk:1,rev:639.65,rn:4,cn:1,bc:0,di:0,ab:1,ex:0},{d:"2026-01-22",bk:1,rev:2166.0,rn:12,cn:0,bc:0,di:1,ab:0,ex:0},{d:"2026-01-23",bk:2,rev:1512.93,rn:5,cn:1,bc:2,di:0,ab:0,ex:0},{d:"2026-01-25",bk:1,rev:406.79,rn:3,cn:0,bc:1,di:0,ab:0,ex:0},{d:"2026-01-27",bk:1,rev:971.37,rn:7,cn:0,bc:1,di:0,ab:0,ex:0},{d:"2026-01-28",bk:0,rev:0.0,rn:0,cn:1,bc:0,di:0,ab:0,ex:0},{d:"2026-01-31",bk:4,rev:1328.54,rn:11,cn:0,bc:4,di:0,ab:0,ex:0},{d:"2026-02-01",bk:2,rev:1151.34,rn:10,cn:2,bc:0,di:2,ab:0,ex:0},{d:"2026-02-02",bk:4,rev:3525.68,rn:21,cn:0,bc:3,di:0,ab:1,ex:0},{d:"2026-02-03",bk:1,rev:225.38,rn:2,cn:0,bc:1,di:0,ab:0,ex:0},{d:"2026-02-04",bk:3,rev:1219.64,rn:12,cn:1,bc:2,di:1,ab:0,ex:0},{d:"2026-02-06",bk:2,rev:1010.88,rn:6,cn:0,bc:2,di:0,ab:0,ex:0},{d:"2026-02-07",bk:2,rev:1487.46,rn:7,cn:0,bc:2,di:0,ab:0,ex:0},{d:"2026-02-09",bk:3,rev:2793.27,rn:16,cn:2,bc:3,di:0,ab:0,ex:0},{d:"2026-02-10",bk:2,rev:1132.45,rn:10,cn:0,bc:1,di:1,ab:0,ex:0},{d:"2026-02-11",bk:1,rev:438.72,rn:3,cn:1,bc:1,di:0,ab:0,ex:0},{d:"2026-02-12",bk:2,rev:1478.71,rn:10,cn:1,bc:2,di:0,ab:0,ex:0},{d:"2026-02-13",bk:4,rev:3125.21,rn:18,cn:0,bc:1,di:3,ab:0,ex:0},{d:"2026-02-14",bk:3,rev:1499.8,rn:9,cn:0,bc:2,di:1,ab:0,ex:0},{d:"2026-02-15",bk:1,rev:300.0,rn:2,cn:0,bc:0,di:1,ab:0,ex:0},{d:"2026-02-16",bk:3,rev:1193.46,rn:9,cn:1,bc:2,di:0,ab:1,ex:0},{d:"2026-02-17",bk:3,rev:1472.23,rn:14,cn:2,bc:2,di:1,ab:0,ex:0},{d:"2026-02-18",bk:4,rev:3939.25,rn:26,cn:0,bc:2,di:1,ab:1,ex:0},{d:"2026-02-19",bk:8,rev:3031.71,rn:24,cn:2,bc:7,di:0,ab:1,ex:0},{d:"2026-02-20",bk:3,rev:1219.44,rn:12,cn:0,bc:2,di:1,ab:0,ex:0},{d:"2026-02-21",bk:3,rev:1813.69,rn:12,cn:2,bc:3,di:0,ab:0,ex:0},{d:"2026-02-22",bk:3,rev:1171.16,rn:10,cn:2,bc:2,di:1,ab:0,ex:0},{d:"2026-02-23",bk:3,rev:1242.66,rn:8,cn:0,bc:3,di:0,ab:0,ex:0},{d:"2026-02-24",bk:1,rev:331.64,rn:4,cn:2,bc:1,di:0,ab:0,ex:0},{d:"2026-02-25",bk:2,rev:956.52,rn:8,cn:3,bc:2,di:0,ab:0,ex:0},{d:"2026-02-26",bk:1,rev:225.66,rn:2,cn:1,bc:1,di:0,ab:0,ex:0},{d:"2026-02-27",bk:6,rev:2454.37,rn:16,cn:1,bc:4,di:1,ab:1,ex:0},{d:"2026-02-28",bk:2,rev:1477.3,rn:6,cn:2,bc:2,di:0,ab:0,ex:0},{d:"2026-03-01",bk:6,rev:3559.32,rn:24,cn:0,bc:6,di:0,ab:0,ex:0},{d:"2026-03-02",bk:1,rev:532.57,rn:3,cn:1,bc:1,di:0,ab:0,ex:0},{d:"2026-03-03",bk:3,rev:1655.71,rn:13,cn:1,bc:3,di:0,ab:0,ex:0},{d:"2026-03-04",bk:2,rev:1092.57,rn:9,cn:0,bc:1,di:1,ab:0,ex:0},{d:"2026-03-06",bk:5,rev:2672.5,rn:20,cn:0,bc:4,di:1,ab:0,ex:0},{d:"2026-03-07",bk:1,rev:399.32,rn:4,cn:0,bc:1,di:0,ab:0,ex:0},{d:"2026-03-08",bk:2,rev:2037.39,rn:10,cn:1,bc:1,di:1,ab:0,ex:0},{d:"2026-03-09",bk:4,rev:2039.13,rn:13,cn:0,bc:3,di:0,ab:1,ex:0},{d:"2026-03-10",bk:4,rev:1959.17,rn:11,cn:1,bc:4,di:0,ab:0,ex:0},{d:"2026-03-11",bk:1,rev:368.96,rn:1,cn:1,bc:1,di:0,ab:0,ex:0},{d:"2026-03-12",bk:3,rev:2056.63,rn:15,cn:1,bc:3,di:0,ab:0,ex:0},{d:"2026-03-13",bk:1,rev:300.0,rn:3,cn:0,bc:0,di:1,ab:0,ex:0},{d:"2026-03-14",bk:2,rev:1126.86,rn:7,cn:1,bc:2,di:0,ab:0,ex:0},{d:"2026-03-15",bk:7,rev:2619.02,rn:17,cn:0,bc:6,di:1,ab:0,ex:0},{d:"2026-03-16",bk:1,rev:315.81,rn:3,cn:1,bc:1,di:0,ab:0,ex:0},{d:"2026-03-17",bk:3,rev:2180.1,rn:17,cn:2,bc:0,di:2,ab:1,ex:0},{d:"2026-03-18",bk:3,rev:1318.34,rn:6,cn:1,bc:2,di:0,ab:1,ex:0},{d:"2026-03-19",bk:2,rev:1491.78,rn:9,cn:0,bc:2,di:0,ab:0,ex:0},{d:"2026-03-20",bk:4,rev:1220.88,rn:9,cn:0,bc:1,di:2,ab:1,ex:0},{d:"2026-03-21",bk:2,rev:508.43,rn:3,cn:1,bc:1,di:0,ab:1,ex:0},{d:"2026-03-22",bk:5,rev:2125.71,rn:13,cn:0,bc:3,di:0,ab:1,ex:1},{d:"2026-03-23",bk:2,rev:1018.34,rn:7,cn:1,bc:1,di:1,ab:0,ex:0},{d:"2026-03-24",bk:4,rev:1829.06,rn:13,cn:0,bc:3,di:1,ab:0,ex:0},{d:"2026-03-25",bk:1,rev:410.7,rn:3,cn:0,bc:0,di:1,ab:0,ex:0},{d:"2026-03-26",bk:1,rev:314.74,rn:2,cn:1,bc:1,di:0,ab:0,ex:0},{d:"2026-03-27",bk:1,rev:271.4,rn:2,cn:0,bc:1,di:0,ab:0,ex:0},{d:"2026-03-28",bk:4,rev:1765.25,rn:13,cn:0,bc:1,di:2,ab:1,ex:0},{d:"2026-03-29",bk:2,rev:823.64,rn:4,cn:0,bc:1,di:0,ab:0,ex:1},{d:"2026-03-30",bk:2,rev:1195.5,rn:8,cn:0,bc:0,di:2,ab:0,ex:0},{d:"2026-03-31",bk:3,rev:1458.04,rn:8,cn:0,bc:1,di:1,ab:1,ex:0},{d:"2026-04-01",bk:1,rev:1010.0,rn:4,cn:0,bc:0,di:1,ab:0,ex:0},{d:"2026-04-03",bk:1,rev:583.8,rn:4,cn:0,bc:1,di:0,ab:0,ex:0},{d:"2026-04-04",bk:1,rev:319.1,rn:2,cn:1,bc:1,di:0,ab:0,ex:0},{d:"2026-04-05",bk:2,rev:2262.91,rn:14,cn:0,bc:2,di:0,ab:0,ex:0},{d:"2026-04-06",bk:1,rev:1518.62,rn:7,cn:0,bc:1,di:0,ab:0,ex:0},{d:"2026-04-07",bk:1,rev:1224.35,rn:6,cn:0,bc:1,di:0,ab:0,ex:0},{d:"2026-04-08",bk:1,rev:359.18,rn:2,cn:0,bc:1,di:0,ab:0,ex:0},{d:"2026-04-09",bk:2,rev:325.16,rn:2,cn:0,bc:2,di:0,ab:0,ex:0},{d:"2026-04-11",bk:2,rev:1685.53,rn:10,cn:1,bc:1,di:0,ab:1,ex:0},{d:"2026-04-12",bk:1,rev:315.0,rn:2,cn:1,bc:0,di:1,ab:0,ex:0},{d:"2026-04-13",bk:2,rev:1491.04,rn:9,cn:1,bc:2,di:0,ab:0,ex:0},{d:"2026-04-14",bk:2,rev:685.33,rn:4,cn:0,bc:1,di:0,ab:0,ex:1},{d:"2026-04-15",bk:0,rev:0.0,rn:0,cn:2,bc:0,di:0,ab:0,ex:0},{d:"2026-04-16",bk:2,rev:633.81,rn:4,cn:0,bc:1,di:0,ab:1,ex:0},{d:"2026-04-17",bk:1,rev:498.9,rn:3,cn:0,bc:0,di:1,ab:0,ex:0},{d:"2026-04-18",bk:2,rev:733.04,rn:4,cn:0,bc:1,di:0,ab:1,ex:0},{d:"2026-04-19",bk:4,rev:2632.49,rn:20,cn:1,bc:2,di:1,ab:1,ex:0},{d:"2026-04-20",bk:3,rev:1370.69,rn:9,cn:0,bc:1,di:1,ab:1,ex:0},{d:"2026-04-22",bk:1,rev:390.43,rn:3,cn:0,bc:1,di:0,ab:0,ex:0},{d:"2026-04-23",bk:1,rev:1084.16,rn:7,cn:1,bc:1,di:0,ab:0,ex:0},{d:"2026-04-24",bk:2,rev:1105.86,rn:5,cn:0,bc:1,di:1,ab:0,ex:0},{d:"2026-04-26",bk:2,rev:787.62,rn:6,cn:1,bc:2,di:0,ab:0,ex:0},{d:"2026-04-29",bk:6,rev:3020.97,rn:19,cn:0,bc:4,di:2,ab:0,ex:0},{d:"2026-04-30",bk:2,rev:789.49,rn:5,cn:0,bc:2,di:0,ab:0,ex:0},{d:"2026-05-01",bk:1,rev:282.96,rn:1,cn:0,bc:0,di:0,ab:0,ex:1},{d:"2026-05-02",bk:2,rev:983.8,rn:6,cn:1,bc:2,di:0,ab:0,ex:0},{d:"2026-05-03",bk:3,rev:2822.13,rn:15,cn:0,bc:2,di:1,ab:0,ex:0},{d:"2026-05-04",bk:0,rev:0.0,rn:0,cn:1,bc:0,di:0,ab:0,ex:0},{d:"2026-05-05",bk:3,rev:3973.29,rn:23,cn:1,bc:1,di:2,ab:0,ex:0},{d:"2026-05-07",bk:1,rev:280.72,rn:2,cn:0,bc:1,di:0,ab:0,ex:0},{d:"2026-05-08",bk:1,rev:472.8,rn:3,cn:0,bc:0,di:1,ab:0,ex:0},{d:"2026-05-09",bk:1,rev:560.91,rn:3,cn:0,bc:1,di:0,ab:0,ex:0},{d:"2026-05-10",bk:1,rev:1021.8,rn:6,cn:0,bc:0,di:1,ab:0,ex:0},{d:"2026-05-11",bk:2,rev:1153.42,rn:7,cn:0,bc:2,di:0,ab:0,ex:0},{d:"2026-05-12",bk:0,rev:0.0,rn:0,cn:1,bc:0,di:0,ab:0,ex:0},{d:"2026-05-13",bk:1,rev:372.1,rn:2,cn:0,bc:0,di:1,ab:0,ex:0},{d:"2026-05-14",bk:1,rev:661.64,rn:3,cn:0,bc:1,di:0,ab:0,ex:0},{d:"2026-05-15",bk:1,rev:164.27,rn:1,cn:0,bc:1,di:0,ab:0,ex:0},{d:"2026-05-16",bk:1,rev:1110.0,rn:5,cn:0,bc:0,di:1,ab:0,ex:0},{d:"2026-05-17",bk:3,rev:1114.36,rn:6,cn:1,bc:2,di:0,ab:1,ex:0},{d:"2026-05-19",bk:7,rev:16370.84,rn:85,cn:0,bc:3,di:4,ab:0,ex:0},{d:"2026-05-20",bk:5,rev:2155.59,rn:11,cn:1,bc:3,di:1,ab:1,ex:0},{d:"2026-05-21",bk:1,rev:679.8,rn:5,cn:0,bc:1,di:0,ab:0,ex:0},{d:"2026-05-23",bk:2,rev:478.65,rn:2,cn:0,bc:1,di:0,ab:1,ex:0},{d:"2026-05-24",bk:1,rev:2198.4,rn:14,cn:3,bc:0,di:1,ab:0,ex:0},{d:"2026-05-25",bk:2,rev:920.31,rn:3,cn:2,bc:2,di:0,ab:0,ex:0},{d:"2026-05-26",bk:1,rev:235.0,rn:1,cn:0,bc:0,di:0,ab:1,ex:0},{d:"2026-05-27",bk:3,rev:1545.48,rn:9,cn:0,bc:2,di:1,ab:0,ex:0},{d:"2026-05-28",bk:4,rev:3084.74,rn:19,cn:1,bc:4,di:0,ab:0,ex:0},{d:"2026-05-30",bk:1,rev:312.04,rn:2,cn:0,bc:1,di:0,ab:0,ex:0},{d:"2026-05-31",bk:5,rev:3909.66,rn:20,cn:1,bc:3,di:1,ab:1,ex:0},{d:"2026-06-01",bk:2,rev:1645.48,rn:11,cn:0,bc:2,di:0,ab:0,ex:0},{d:"2026-06-02",bk:1,rev:467.2,rn:2,cn:0,bc:1,di:0,ab:0,ex:0},{d:"2026-06-03",bk:1,rev:666.5,rn:4,cn:1,bc:1,di:0,ab:0,ex:0},{d:"2026-06-04",bk:6,rev:1889.25,rn:11,cn:1,bc:6,di:0,ab:0,ex:0},{d:"2026-06-05",bk:6,rev:1745.1,rn:11,cn:0,bc:6,di:0,ab:0,ex:0},{d:"2026-06-06",bk:1,rev:837.9,rn:5,cn:2,bc:0,di:1,ab:0,ex:0},{d:"2026-06-07",bk:4,rev:1838.74,rn:11,cn:1,bc:4,di:0,ab:0,ex:0},{d:"2026-06-09",bk:1,rev:236.62,rn:2,cn:0,bc:1,di:0,ab:0,ex:0},{d:"2026-06-10",bk:1,rev:618.99,rn:3,cn:1,bc:1,di:0,ab:0,ex:0},{d:"2026-06-11",bk:2,rev:604.3,rn:2,cn:0,bc:1,di:0,ab:0,ex:1},{d:"2026-06-12",bk:2,rev:845.55,rn:4,cn:0,bc:2,di:0,ab:0,ex:0},{d:"2026-06-13",bk:2,rev:688.44,rn:4,cn:0,bc:2,di:0,ab:0,ex:0},{d:"2026-06-14",bk:1,rev:746.0,rn:4,cn:0,bc:0,di:1,ab:0,ex:0},{d:"2026-06-15",bk:2,rev:753.07,rn:3,cn:0,bc:2,di:0,ab:0,ex:0},{d:"2026-06-17",bk:2,rev:3658.96,rn:20,cn:2,bc:2,di:0,ab:0,ex:0},{d:"2026-06-18",bk:3,rev:1123.31,rn:7,cn:0,bc:2,di:0,ab:0,ex:1},{d:"2026-06-19",bk:1,rev:366.3,rn:2,cn:0,bc:0,di:1,ab:0,ex:0},{d:"2026-06-21",bk:2,rev:979.6,rn:5,cn:0,bc:1,di:1,ab:0,ex:0},{d:"2026-06-22",bk:3,rev:2296.12,rn:12,cn:0,bc:2,di:1,ab:0,ex:0},{d:"2026-06-23",bk:1,rev:372.62,rn:1,cn:0,bc:1,di:0,ab:0,ex:0},{d:"2026-06-24",bk:2,rev:591.53,rn:3,cn:1,bc:1,di:0,ab:0,ex:1},{d:"2026-06-25",bk:1,rev:1411.0,rn:6,cn:0,bc:0,di:0,ab:1,ex:0},{d:"2026-06-26",bk:4,rev:2328.56,rn:15,cn:0,bc:4,di:0,ab:0,ex:0},{d:"2026-06-27",bk:1,rev:585.88,rn:4,cn:0,bc:1,di:0,ab:0,ex:0},{d:"2026-06-28",bk:5,rev:2666.38,rn:17,cn:0,bc:4,di:1,ab:0,ex:0},{d:"2026-06-30",bk:4,rev:2342.5,rn:15,cn:0,bc:3,di:0,ab:1,ex:0},{d:"2026-07-01",bk:8,rev:13594.94,rn:68,cn:2,bc:1,di:7,ab:0,ex:0},{d:"2026-07-02",bk:6,rev:1679.26,rn:11,cn:0,bc:1,di:2,ab:2,ex:1},{d:"2026-07-03",bk:1,rev:225.39,rn:2,cn:1,bc:1,di:0,ab:0,ex:0},{d:"2026-07-04",bk:5,rev:2997.99,rn:19,cn:1,bc:2,di:1,ab:2,ex:0},{d:"2026-07-05",bk:2,rev:2033.4,rn:7,cn:0,bc:2,di:0,ab:0,ex:0},{d:"2026-07-06",bk:1,rev:232.32,rn:2,cn:0,bc:1,di:0,ab:0,ex:0},{d:"2026-07-07",bk:3,rev:1154.92,rn:6,cn:0,bc:1,di:0,ab:2,ex:0},{d:"2026-07-08",bk:1,rev:268.98,rn:2,cn:0,bc:1,di:0,ab:0,ex:0},{d:"2026-07-09",bk:2,rev:480.61,rn:2,cn:0,bc:1,di:0,ab:1,ex:0},{d:"2026-07-10",bk:1,rev:271.2,rn:1,cn:0,bc:0,di:0,ab:1,ex:0},{d:"2026-07-12",bk:2,rev:703.75,rn:3,cn:0,bc:1,di:1,ab:0,ex:0},{d:"2026-07-13",bk:3,rev:1215.43,rn:7,cn:0,bc:2,di:1,ab:0,ex:0},{d:"2026-07-14",bk:1,rev:363.74,rn:2,cn:1,bc:1,di:0,ab:0,ex:0},{d:"2026-07-15",bk:2,rev:2240.02,rn:11,cn:0,bc:2,di:0,ab:0,ex:0},{d:"2026-07-16",bk:1,rev:482.85,rn:3,cn:0,bc:1,di:0,ab:0,ex:0},{d:"2026-07-17",bk:2,rev:1634.74,rn:11,cn:0,bc:1,di:1,ab:0,ex:0},{d:"2026-07-18",bk:4,rev:2289.7,rn:13,cn:0,bc:3,di:1,ab:0,ex:0},{d:"2026-07-19",bk:2,rev:562.88,rn:3,cn:0,bc:2,di:0,ab:0,ex:0},{d:"2026-07-22",bk:0,rev:0.0,rn:0,cn:1,bc:0,di:0,ab:0,ex:0},{d:"2026-07-23",bk:2,rev:819.78,rn:4,cn:0,bc:1,di:0,ab:1,ex:0},{d:"2026-07-24",bk:2,rev:860.18,rn:4,cn:1,bc:1,di:0,ab:0,ex:1},{d:"2026-07-25",bk:1,rev:254.01,rn:1,cn:0,bc:1,di:0,ab:0,ex:0},{d:"2026-07-28",bk:5,rev:5640.97,rn:29,cn:0,bc:1,di:4,ab:0,ex:0}];
const PACE_D25=[{d:"2024-11-25",bk:6,rev:6779.5,rn:41,cn:1},{d:"2024-11-26",bk:2,rev:1464.97,rn:10,cn:4},{d:"2024-12-01",bk:2,rev:3020.5,rn:14,cn:0},{d:"2024-12-15",bk:1,rev:482.82,rn:3,cn:0},{d:"2024-12-16",bk:1,rev:1045.0,rn:5,cn:0},{d:"2024-12-18",bk:1,rev:612.36,rn:3,cn:0},{d:"2024-12-20",bk:1,rev:415.58,rn:2,cn:0},{d:"2024-12-21",bk:0,rev:0.0,rn:0,cn:1},{d:"2024-12-22",bk:2,rev:1203.06,rn:6,cn:1},{d:"2024-12-25",bk:1,rev:612.36,rn:3,cn:0},{d:"2024-12-26",bk:2,rev:1517.28,rn:8,cn:0},{d:"2024-12-27",bk:1,rev:517.52,rn:4,cn:0},{d:"2024-12-30",bk:1,rev:528.0,rn:3,cn:0},{d:"2025-01-01",bk:0,rev:0.0,rn:0,cn:1},{d:"2025-01-02",bk:2,rev:954.84,rn:6,cn:1},{d:"2025-01-03",bk:2,rev:1412.23,rn:7,cn:1},{d:"2025-01-04",bk:0,rev:0.0,rn:0,cn:1},{d:"2025-01-05",bk:2,rev:1890.47,rn:10,cn:2},{d:"2025-01-06",bk:2,rev:1294.35,rn:8,cn:0},{d:"2025-01-07",bk:1,rev:771.12,rn:4,cn:0},{d:"2025-01-09",bk:1,rev:1636.38,rn:9,cn:0},{d:"2025-01-10",bk:4,rev:2898.6,rn:12,cn:1},{d:"2025-01-11",bk:1,rev:657.6,rn:4,cn:0},{d:"2025-01-12",bk:1,rev:632.76,rn:3,cn:0},{d:"2025-01-13",bk:1,rev:251.2,rn:2,cn:0},{d:"2025-01-14",bk:0,rev:0.0,rn:0,cn:1},{d:"2025-01-15",bk:2,rev:1173.91,rn:9,cn:2},{d:"2025-01-17",bk:1,rev:1120.0,rn:7,cn:0},{d:"2025-01-18",bk:1,rev:210.4,rn:2,cn:2},{d:"2025-01-19",bk:4,rev:5850.38,rn:28,cn:0},{d:"2025-01-21",bk:1,rev:849.0,rn:6,cn:0},{d:"2025-01-22",bk:3,rev:2275.72,rn:16,cn:0},{d:"2025-01-23",bk:3,rev:1901.9,rn:14,cn:0},{d:"2025-01-24",bk:1,rev:354.0,rn:3,cn:1},{d:"2025-01-25",bk:1,rev:310.72,rn:4,cn:0},{d:"2025-01-28",bk:2,rev:567.98,rn:5,cn:0},{d:"2025-01-29",bk:0,rev:0.0,rn:0,cn:1},{d:"2025-01-30",bk:2,rev:515.1,rn:5,cn:0},{d:"2025-01-31",bk:1,rev:175.0,rn:1,cn:0},{d:"2025-02-01",bk:1,rev:213.98,rn:2,cn:1},{d:"2025-02-03",bk:1,rev:809.69,rn:7,cn:0},{d:"2025-02-04",bk:1,rev:509.79,rn:3,cn:2},{d:"2025-02-05",bk:6,rev:8515.97,rn:68,cn:0},{d:"2025-02-07",bk:0,rev:0.0,rn:0,cn:1},{d:"2025-02-08",bk:0,rev:0.0,rn:0,cn:1},{d:"2025-02-09",bk:2,rev:461.06,rn:5,cn:1},{d:"2025-02-10",bk:1,rev:1199.7,rn:9,cn:2},{d:"2025-02-11",bk:2,rev:2148.67,rn:14,cn:1},{d:"2025-02-12",bk:2,rev:1294.55,rn:9,cn:0},{d:"2025-02-13",bk:1,rev:247.3,rn:2,cn:0},{d:"2025-02-14",bk:1,rev:880.0,rn:6,cn:0},{d:"2025-02-15",bk:2,rev:874.94,rn:6,cn:2},{d:"2025-02-16",bk:2,rev:1231.9,rn:8,cn:0},{d:"2025-02-17",bk:0,rev:0.0,rn:0,cn:1},{d:"2025-02-18",bk:1,rev:889.4,rn:5,cn:0},{d:"2025-02-19",bk:1,rev:493.2,rn:3,cn:0},{d:"2025-02-20",bk:2,rev:1378.31,rn:8,cn:0},{d:"2025-02-21",bk:2,rev:772.55,rn:6,cn:0},{d:"2025-02-22",bk:2,rev:891.07,rn:5,cn:0},{d:"2025-02-23",bk:5,rev:1586.84,rn:13,cn:0},{d:"2025-02-24",bk:2,rev:1748.23,rn:8,cn:0},{d:"2025-02-25",bk:0,rev:0.0,rn:0,cn:1},{d:"2025-02-27",bk:2,rev:647.3,rn:6,cn:0},{d:"2025-03-01",bk:1,rev:1699.29,rn:9,cn:0},{d:"2025-03-02",bk:2,rev:696.76,rn:5,cn:1},{d:"2025-03-03",bk:2,rev:2316.09,rn:14,cn:0},{d:"2025-03-04",bk:9,rev:4033.89,rn:22,cn:1},{d:"2025-03-05",bk:2,rev:1288.15,rn:8,cn:0},{d:"2025-03-06",bk:2,rev:886.4,rn:7,cn:0},{d:"2025-03-08",bk:1,rev:295.5,rn:2,cn:0},{d:"2025-03-09",bk:2,rev:1878.37,rn:12,cn:0},{d:"2025-03-11",bk:2,rev:1044.0,rn:6,cn:0},{d:"2025-03-12",bk:2,rev:1815.28,rn:10,cn:0},{d:"2025-03-13",bk:3,rev:1949.25,rn:12,cn:0},{d:"2025-03-14",bk:1,rev:218.28,rn:2,cn:0},{d:"2025-03-15",bk:1,rev:1285.97,rn:7,cn:0},{d:"2025-03-16",bk:4,rev:2430.62,rn:14,cn:1},{d:"2025-03-17",bk:3,rev:3350.96,rn:23,cn:0},{d:"2025-03-18",bk:1,rev:921.6,rn:6,cn:0},{d:"2025-03-19",bk:2,rev:1061.13,rn:6,cn:0},{d:"2025-03-22",bk:1,rev:189.35,rn:2,cn:0},{d:"2025-03-24",bk:4,rev:2360.55,rn:15,cn:0},{d:"2025-03-25",bk:1,rev:201.96,rn:2,cn:0},{d:"2025-03-26",bk:1,rev:1176.35,rn:10,cn:0},{d:"2025-03-27",bk:2,rev:1307.2,rn:9,cn:0},{d:"2025-03-28",bk:3,rev:1264.1,rn:9,cn:0},{d:"2025-03-29",bk:1,rev:590.4,rn:3,cn:0},{d:"2025-03-30",bk:2,rev:1761.84,rn:10,cn:0},{d:"2025-03-31",bk:1,rev:412.5,rn:3,cn:0},{d:"2025-04-03",bk:1,rev:1073.3,rn:6,cn:0},{d:"2025-04-05",bk:1,rev:440.0,rn:4,cn:0},{d:"2025-04-06",bk:3,rev:1918.09,rn:11,cn:0},{d:"2025-04-07",bk:2,rev:1147.32,rn:6,cn:0},{d:"2025-04-08",bk:1,rev:344.36,rn:3,cn:0},{d:"2025-04-10",bk:1,rev:626.68,rn:4,cn:0},{d:"2025-04-11",bk:1,rev:695.96,rn:4,cn:0},{d:"2025-04-13",bk:4,rev:2713.64,rn:17,cn:0},{d:"2025-04-14",bk:1,rev:635.04,rn:3,cn:0},{d:"2025-04-15",bk:1,rev:516.96,rn:4,cn:0},{d:"2025-04-17",bk:1,rev:336.96,rn:3,cn:0},{d:"2025-04-18",bk:2,rev:1482.51,rn:8,cn:1},{d:"2025-04-19",bk:3,rev:1386.92,rn:9,cn:0},{d:"2025-04-21",bk:5,rev:2234.81,rn:18,cn:1},{d:"2025-04-22",bk:1,rev:406.59,rn:3,cn:0},{d:"2025-04-23",bk:2,rev:1002.56,rn:6,cn:0},{d:"2025-04-24",bk:1,rev:475.54,rn:4,cn:0},{d:"2025-04-25",bk:1,rev:586.6,rn:4,cn:0},{d:"2025-04-26",bk:1,rev:873.5,rn:5,cn:0},{d:"2025-04-27",bk:6,rev:3349.59,rn:24,cn:1},{d:"2025-04-28",bk:2,rev:910.0,rn:6,cn:0},{d:"2025-04-29",bk:1,rev:712.62,rn:4,cn:0},{d:"2025-04-30",bk:0,rev:0.0,rn:0,cn:1},{d:"2025-05-01",bk:1,rev:615.9,rn:3,cn:0},{d:"2025-05-03",bk:0,rev:0.0,rn:0,cn:1},{d:"2025-05-04",bk:1,rev:347.95,rn:3,cn:0},{d:"2025-05-05",bk:1,rev:653.33,rn:5,cn:0},{d:"2025-05-06",bk:1,rev:314.0,rn:2,cn:0},{d:"2025-05-07",bk:2,rev:1773.68,rn:11,cn:0},{d:"2025-05-09",bk:1,rev:286.81,rn:1,cn:0},{d:"2025-05-10",bk:0,rev:0.0,rn:0,cn:1},{d:"2025-05-11",bk:7,rev:3079.8,rn:16,cn:0},{d:"2025-05-12",bk:1,rev:479.11,rn:4,cn:0},{d:"2025-05-13",bk:1,rev:559.3,rn:4,cn:1},{d:"2025-05-14",bk:2,rev:1561.46,rn:11,cn:0},{d:"2025-05-18",bk:1,rev:1186.9,rn:7,cn:0},{d:"2025-05-19",bk:1,rev:415.0,rn:3,cn:0},{d:"2025-05-20",bk:3,rev:1495.14,rn:11,cn:0},{d:"2025-05-21",bk:1,rev:343.38,rn:3,cn:0},{d:"2025-05-22",bk:2,rev:576.28,rn:6,cn:0},{d:"2025-05-23",bk:1,rev:469.84,rn:3,cn:1},{d:"2025-05-24",bk:2,rev:611.99,rn:4,cn:0},{d:"2025-05-25",bk:1,rev:362.64,rn:3,cn:0},{d:"2025-05-30",bk:1,rev:500.0,rn:4,cn:0},{d:"2025-06-01",bk:2,rev:789.47,rn:6,cn:0},{d:"2025-06-02",bk:1,rev:1222.9,rn:7,cn:0},{d:"2025-06-04",bk:2,rev:1171.12,rn:7,cn:0},{d:"2025-06-08",bk:1,rev:990.68,rn:8,cn:0},{d:"2025-06-09",bk:0,rev:0.0,rn:0,cn:1},{d:"2025-06-10",bk:2,rev:990.0,rn:6,cn:1},{d:"2025-06-11",bk:1,rev:310.07,rn:1,cn:0},{d:"2025-06-12",bk:2,rev:984.2,rn:7,cn:0},{d:"2025-06-14",bk:3,rev:1270.6,rn:10,cn:0},{d:"2025-06-15",bk:1,rev:300.36,rn:3,cn:0},{d:"2025-06-16",bk:1,rev:319.33,rn:3,cn:0},{d:"2025-06-17",bk:1,rev:494.42,rn:3,cn:0},{d:"2025-06-18",bk:2,rev:769.4,rn:5,cn:0},{d:"2025-06-19",bk:3,rev:1530.59,rn:10,cn:0},{d:"2025-06-20",bk:2,rev:962.16,rn:6,cn:0},{d:"2025-06-21",bk:1,rev:657.72,rn:4,cn:0},{d:"2025-06-22",bk:1,rev:432.72,rn:3,cn:0},{d:"2025-06-24",bk:1,rev:383.2,rn:3,cn:0},{d:"2025-06-28",bk:0,rev:0.0,rn:0,cn:1},{d:"2025-06-30",bk:2,rev:890.08,rn:7,cn:0},{d:"2025-07-02",bk:1,rev:431.7,rn:3,cn:0},{d:"2025-07-03",bk:3,rev:11065.0,rn:23,cn:0},{d:"2025-07-04",bk:1,rev:1125.0,rn:7,cn:0},{d:"2025-07-10",bk:1,rev:426.3,rn:3,cn:0},{d:"2025-07-11",bk:0,rev:0.0,rn:0,cn:1},{d:"2025-07-12",bk:1,rev:198.58,rn:1,cn:0},{d:"2025-07-13",bk:2,rev:397.16,rn:2,cn:0},{d:"2025-07-14",bk:1,rev:262.08,rn:1,cn:0},{d:"2025-07-15",bk:1,rev:230.63,rn:1,cn:1},{d:"2025-07-16",bk:2,rev:702.65,rn:4,cn:0},{d:"2025-07-17",bk:1,rev:561.9,rn:3,cn:0},{d:"2025-07-19",bk:0,rev:0.0,rn:0,cn:1},{d:"2025-07-20",bk:2,rev:1458.84,rn:9,cn:0},{d:"2025-07-21",bk:2,rev:1234.31,rn:7,cn:0},{d:"2025-07-22",bk:1,rev:566.04,rn:3,cn:0},{d:"2025-07-23",bk:1,rev:509.43,rn:3,cn:0},{d:"2025-07-24",bk:1,rev:360.0,rn:2,cn:0},{d:"2025-07-25",bk:3,rev:1408.0,rn:8,cn:0},{d:"2025-07-26",bk:1,rev:392.01,rn:3,cn:0},{d:"2025-07-27",bk:1,rev:531.68,rn:3,cn:0},{d:"2025-07-28",bk:1,rev:570.0,rn:1,cn:0},{d:"2025-07-30",bk:1,rev:497.94,rn:3,cn:0},{d:"2025-08-03",bk:1,rev:656.64,rn:4,cn:2},{d:"2025-08-06",bk:2,rev:754.21,rn:5,cn:0},{d:"2025-08-07",bk:0,rev:0.0,rn:0,cn:1},{d:"2025-08-08",bk:1,rev:331.5,rn:2,cn:0},{d:"2025-08-09",bk:1,rev:542.97,rn:3,cn:0},{d:"2025-08-11",bk:1,rev:626.27,rn:3,cn:0},{d:"2025-08-15",bk:1,rev:454.53,rn:3,cn:0},{d:"2025-08-17",bk:2,rev:2853.32,rn:18,cn:0},{d:"2025-08-18",bk:1,rev:781.6,rn:4,cn:0},{d:"2025-08-19",bk:1,rev:454.44,rn:3,cn:0},{d:"2025-08-20",bk:5,rev:13425.0,rn:5,cn:0},{d:"2025-08-21",bk:0,rev:0.0,rn:0,cn:1},{d:"2025-08-25",bk:2,rev:1146.31,rn:7,cn:0},{d:"2025-08-28",bk:1,rev:426.81,rn:3,cn:0},{d:"2025-08-29",bk:3,rev:2352.62,rn:13,cn:0},{d:"2025-09-01",bk:1,rev:533.0,rn:3,cn:0},{d:"2025-09-02",bk:1,rev:1450.84,rn:8,cn:0},{d:"2025-09-03",bk:1,rev:413.67,rn:3,cn:0},{d:"2025-09-04",bk:1,rev:1655.0,rn:6,cn:0},{d:"2025-09-06",bk:1,rev:294.9,rn:3,cn:0},{d:"2025-09-07",bk:1,rev:1028.44,rn:6,cn:0},{d:"2025-09-09",bk:3,rev:1385.83,rn:10,cn:0},{d:"2025-09-10",bk:4,rev:1591.91,rn:14,cn:0},{d:"2025-09-11",bk:2,rev:776.19,rn:6,cn:0},{d:"2025-09-12",bk:0,rev:0.0,rn:0,cn:1},{d:"2025-09-13",bk:5,rev:2964.7,rn:20,cn:0},{d:"2025-09-14",bk:6,rev:2629.74,rn:21,cn:0},{d:"2025-09-15",bk:2,rev:892.54,rn:6,cn:1},{d:"2025-09-16",bk:2,rev:936.76,rn:7,cn:0},{d:"2025-09-17",bk:3,rev:1077.35,rn:9,cn:0},{d:"2025-09-18",bk:2,rev:1562.3,rn:13,cn:0},{d:"2025-09-19",bk:2,rev:856.54,rn:9,cn:0},{d:"2025-09-20",bk:2,rev:778.24,rn:7,cn:0},{d:"2025-09-21",bk:1,rev:1419.85,rn:9,cn:0},{d:"2025-09-24",bk:1,rev:484.44,rn:4,cn:0},{d:"2025-09-25",bk:1,rev:540.86,rn:3,cn:1},{d:"2025-09-26",bk:1,rev:301.65,rn:3,cn:0},{d:"2025-09-28",bk:2,rev:948.9,rn:7,cn:0},{d:"2025-09-29",bk:1,rev:374.05,rn:3,cn:0},{d:"2025-09-30",bk:1,rev:923.8,rn:5,cn:0},{d:"2025-10-05",bk:2,rev:673.92,rn:6,cn:0},{d:"2025-10-06",bk:1,rev:243.8,rn:2,cn:0},{d:"2025-10-14",bk:1,rev:701.6,rn:6,cn:0},{d:"2025-10-16",bk:1,rev:252.8,rn:2,cn:0},{d:"2025-10-20",bk:1,rev:547.6,rn:4,cn:0},{d:"2025-10-21",bk:3,rev:1252.56,rn:11,cn:0},{d:"2025-10-22",bk:1,rev:649.14,rn:7,cn:0},{d:"2025-10-23",bk:4,rev:2069.26,rn:20,cn:0},{d:"2025-10-24",bk:1,rev:313.99,rn:4,cn:0},{d:"2025-10-25",bk:3,rev:1212.74,rn:11,cn:0},{d:"2025-10-27",bk:1,rev:791.6,rn:5,cn:0},{d:"2025-10-30",bk:2,rev:635.95,rn:8,cn:0},{d:"2025-11-01",bk:1,rev:209.66,rn:2,cn:1},{d:"2025-11-02",bk:0,rev:0.0,rn:0,cn:1},{d:"2025-11-05",bk:1,rev:334.88,rn:3,cn:0},{d:"2025-11-07",bk:1,rev:167.83,rn:2,cn:0},{d:"2025-11-14",bk:0,rev:0.0,rn:0,cn:1},{d:"2025-11-15",bk:1,rev:281.2,rn:3,cn:0},{d:"2025-11-17",bk:1,rev:1095.47,rn:7,cn:0},{d:"2025-11-21",bk:2,rev:1412.65,rn:7,cn:0},{d:"2025-11-26",bk:1,rev:553.14,rn:3,cn:0},{d:"2025-12-03",bk:1,rev:468.3,rn:3,cn:0},{d:"2025-12-04",bk:1,rev:304.78,rn:2,cn:0},{d:"2025-12-26",bk:1,rev:714.7,rn:5,cn:0}];
const PACE_M=[{m:1,mn:"Jan",bk26:20,rev26:15488.19,rn26:90,bk25:39,rev25:27703.66,rn25:165,canc:11},{m:2,mn:"Feb",bk26:72,rev26:39917.63,rn26:277,bk25:39,rev25:26794.45,rn25:193,canc:25},{m:3,mn:"Mar",bk26:82,rev26:40666.87,rn26:270,bk25:56,rev25:36435.79,rn25:228,canc:14},{m:4,mn:"Apr",bk26:43,rev26:24827.48,rn26:151,bk25:42,rev25:23869.55,rn25:156,canc:9},{m:5,mn:"May",bk26:54,rev26:46864.71,rn26:254,bk25:31,rev25:15632.51,rn25:104,canc:13},{m:6,mn:"Jun",bk26:61,rev26:32305.9,rn26:184,bk25:29,rev25:14469.02,rn25:99,canc:9},{m:7,mn:"Jul",bk26:57,rev26:40007.06,rn26:211,bk25:28,rev25:22929.25,rn25:90,canc:7}];
const PACE_W=[{w:1,ws:"29 Dec",bk26:4,rev26:3358.1,rn26:17,bk25:7,rev25:4785.54,canc:1},{w:2,ws:"05 Jan",bk26:2,rev26:1811.69,rn26:11,bk25:10,rev25:7890.81,canc:5},{w:3,ws:"12 Jan",bk26:3,rev26:2713.95,rn26:14,bk25:9,rev25:8605.89,canc:1},{w:4,ws:"19 Jan",bk26:8,rev26:6722.14,rn26:37,bk25:9,rev25:5691.34,canc:4},{w:5,ws:"26 Jan",bk26:7,rev26:3451.25,rn26:28,bk25:6,rev25:1472.06,canc:3},{w:6,ws:"02 Feb",bk26:12,rev26:7469.04,rn26:48,bk25:10,rev25:10296.51,canc:1},{w:7,ws:"09 Feb",bk26:16,rev26:10768.16,rn26:68,bk25:11,rev25:7877.06,canc:4},{w:8,ws:"16 Feb",bk26:27,rev26:13840.94,rn26:107,bk25:13,rev25:6011.37,canc:9},{w:9,ws:"23 Feb",bk26:21,rev26:10247.47,rn26:68,bk25:7,rev25:4791.58,canc:9},{w:10,ws:"02 Mar",bk26:14,rev26:8390.06,rn26:59,bk25:18,rev25:10698.4,canc:3},{w:11,ws:"09 Mar",bk26:22,rev26:10469.77,rn26:67,bk25:13,rev25:8743.4,canc:4},{w:12,ws:"16 Mar",bk26:20,rev26:9161.05,rn26:60,bk25:7,rev25:5523.04,canc:5},{w:13,ws:"23 Mar",bk26:15,rev26:6433.13,rn26:44,bk25:14,rev25:8662.4,canc:2},{w:14,ws:"30 Mar",bk26:10,rev26:6829.35,rn26:40,bk25:6,rev25:3843.89,canc:1},{w:15,ws:"06 Apr",bk26:8,rev26:5427.84,rn26:29,bk25:9,rev25:5527.96,canc:2},{w:16,ws:"13 Apr",bk26:13,rev26:6674.61,rn26:44,bk25:8,rev25:4358.39,canc:4},{w:17,ws:"20 Apr",bk26:9,rev26:4738.76,rn26:30,bk25:17,rev25:8929.19,canc:2},{w:18,ws:"27 Apr",bk26:14,rev26:7899.35,rn26:46,bk25:5,rev25:2586.47,canc:1},{w:19,ws:"04 May",bk26:7,rev26:6309.52,rn26:37,bk25:12,rev25:6107.62,canc:2},{w:20,ws:"11 May",bk26:9,rev26:4575.79,rn26:24,bk25:5,rev25:3786.77,canc:2},{w:21,ws:"18 May",bk26:16,rev26:21883.28,rn26:117,bk25:11,rev25:4274.27,canc:4},{w:22,ws:"25 May",bk26:16,rev26:10007.23,rn26:54,bk25:3,rev25:1289.47,canc:4},{w:23,ws:"01 Jun",bk26:21,rev26:9090.17,rn26:55,bk25:4,rev25:3384.7,canc:5},{w:24,ws:"08 Jun",bk26:9,rev26:3739.9,rn26:19,bk25:9,rev25:3855.23,canc:1},{w:25,ws:"15 Jun",bk26:10,rev26:6881.24,rn26:37,bk25:11,rev25:5166.34,canc:2},{w:26,ws:"22 Jun",bk26:17,rev26:10252.09,rn26:58,bk25:1,rev25:383.2,canc:1},{w:27,ws:"29 Jun",bk26:26,rev26:22873.48,rn26:122,bk25:7,rev25:13511.78,canc:4},{w:28,ws:"06 Jul",bk26:10,rev26:3111.78,rn26:16,bk25:4,rev25:1022.04,canc:0},{w:29,ws:"13 Jul",bk26:15,rev26:8789.36,rn26:50,bk25:7,rev25:3216.1,canc:1},{w:30,ws:"20 Jul",bk26:5,rev26:1933.97,rn26:9,bk25:10,rev25:5001.47,canc:2},{w:31,ws:"27 Jul",bk26:5,rev26:5640.97,rn26:29,bk25:3,rev25:1724.58,canc:0},{w:34,ws:"18 Aug",bk26:1,rev26:2370.0,rn26:11,bk25:7,rev25:14661.04,canc:0},{w:40,ws:"29 Sep",bk26:1,rev26:535.26,rn26:3,bk25:4,rev25:1971.77,canc:0},{w:44,ws:"27 Oct",bk26:2,rev26:1718.3,rn26:8,bk25:4,rev25:1637.21,canc:0},{w:45,ws:"03 Nov",bk26:5,rev26:6061.4,rn26:27,bk25:2,rev25:502.71,canc:7},{w:46,ws:"10 Nov",bk26:2,rev26:1201.55,rn26:7,bk25:1,rev25:281.2,canc:0},{w:47,ws:"17 Nov",bk26:1,rev26:1458.24,rn26:5,bk25:3,rev25:2508.12,canc:0},{w:48,ws:"24 Nov",bk26:1,rev26:816.6,rn26:3,bk25:11,rev25:11818.11,canc:0},{w:50,ws:"08 Dec",bk26:1,rev26:325.48,rn26:2,bk25:1,rev25:482.82,canc:0},{w:51,ws:"15 Dec",bk26:4,rev26:3735.33,rn26:15,bk25:5,rev25:3276.0,canc:2},{w:52,ws:"22 Dec",bk26:1,rev26:697.44,rn26:3,bk25:5,rev25:3361.86,canc:1}];
// Monthly source/room data for period filtering
const RM25_MO=[{m:1,room:"Studio N°12",bk:2,rev:1033.3,rn:9},{m:1,room:"Sup. 1-Room Apt N°9",bk:3,rev:1263.48,rn:8},{m:1,room:"Studio N°7",bk:2,rev:734.2,rn:4},{m:1,room:"Sup. 2-Rooms Apt N°4",bk:4,rev:1640.56,rn:9},{m:1,room:"Studio N°8",bk:1,rev:483.0,rn:2},{m:1,room:"Sup. Penthouse N°18",bk:1,rev:483.0,rn:2},{m:2,room:"Cozy Studio Nr. 1",bk:1,rev:247.3,rn:2},{m:2,room:"2-Rooms Apt N°10",bk:2,rev:426.27,rn:4},{m:2,room:"Sup. 1-Room Apt N°9",bk:3,rev:1003.13,rn:9},{m:2,room:"Studio N°12",bk:2,rev:478.86,rn:5},{m:2,room:"2-Rooms Apt N°17",bk:3,rev:935.63,rn:9},{m:2,room:"Studio N°7",bk:5,rev:987.2,rn:12},{m:2,room:"Sup. 2-Rooms Apt N°4",bk:5,rev:1830.96,rn:16},{m:2,room:"Studio N°8",bk:1,rev:1365.0,rn:23},{m:2,room:"Sup. Penthouse N°18",bk:3,rev:1377.92,rn:12},{m:3,room:"Sup. 1-Room Apt N°9",bk:3,rev:2244.0,rn:15},{m:3,room:"Studio N°7",bk:4,rev:2436.51,rn:18},{m:3,room:"2-Rooms Apt N°10",bk:3,rev:3232.82,rn:19},{m:3,room:"Studio N°12",bk:6,rev:1273.61,rn:12},{m:3,room:"Cozy Studio Nr. 1",bk:2,rev:731.4,rn:5},{m:3,room:"Sup. Penthouse N°18",bk:2,rev:1148.84,rn:8},{m:3,room:"Studio N°8",bk:4,rev:2587.92,rn:20},{m:3,room:"Sup. 2-Rooms Apt N°4",bk:3,rev:2317.13,rn:15},{m:3,room:"2-Rooms Apt N°17",bk:2,rev:1720.0,rn:12},{m:4,room:"Studio N°7",bk:4,rev:2327.84,rn:15},{m:4,room:"Sup. 2-Rooms Apt N°4",bk:5,rev:2838.24,rn:16},{m:4,room:"Studio N°12",bk:5,rev:2861.56,rn:19},{m:4,room:"2-Rooms Apt N°10",bk:3,rev:2268.95,rn:15},{m:4,room:"2-Rooms Apt N°17",bk:6,rev:4034.6,rn:25},{m:4,room:"Sup. 1-Room Apt N°9",bk:5,rev:3365.25,rn:21},{m:4,room:"Studio N°8",bk:4,rev:2796.69,rn:22},{m:4,room:"Sup. Penthouse N°18",bk:6,rev:5374.06,rn:27},{m:4,room:"Cozy Studio Nr. 1",bk:3,rev:1428.4,rn:10},{m:5,room:"Cozy Studio Nr. 1",bk:6,rev:2304.51,rn:19},{m:5,room:"Studio N°12",bk:5,rev:1864.43,rn:15},{m:5,room:"Studio N°7",bk:7,rev:2758.08,rn:18},{m:5,room:"2-Rooms Apt N°17",bk:3,rev:1735.46,rn:9},{m:5,room:"Sup. 1-Room Apt N°9",bk:5,rev:2790.54,rn:19},{m:5,room:"Charming Nr 15",bk:1,rev:500.0,rn:4},{m:5,room:"Sup. 2-Rooms Apt N°4",bk:4,rev:1927.4,rn:11},{m:5,room:"Sup. Penthouse N°18",bk:4,rev:2446.81,rn:13},{m:5,room:"Studio N°8",bk:6,rev:3984.75,rn:29},{m:5,room:"2-Rooms Apt N°10",bk:3,rev:2416.9,rn:15},{m:6,room:"Charming Nr 15",bk:3,rev:1654.58,rn:11},{m:6,room:"Sup. Penthouse N°18",bk:3,rev:1702.55,rn:9},{m:6,room:"Sup. 2-Rooms Apt N°4",bk:4,rev:2388.22,rn:13},{m:6,room:"Studio N°8",bk:4,rev:2351.73,rn:15},{m:6,room:"2-Rooms Apt N°10",bk:3,rev:1478.43,rn:9},{m:6,room:"Studio N°7",bk:5,rev:3059.67,rn:19},{m:6,room:"2-Rooms Apt N°17",bk:2,rev:1727.64,rn:10},{m:6,room:"Cozy Studio Nr. 1",bk:7,rev:2970.76,rn:21},{m:6,room:"Sup. 1-Room Apt N°9",bk:4,rev:10808.61,rn:24},{m:6,room:"Studio N°12",bk:7,rev:4167.21,rn:30},{m:7,room:"Studio N°7",bk:8,rev:3917.56,rn:21},{m:7,room:"Charming Nr 15",bk:8,rev:4017.33,rn:25},{m:7,room:"Sup. 1-Room Apt N°9",bk:7,rev:3941.83,rn:21},{m:7,room:"Studio N°8",bk:5,rev:3316.63,rn:18},{m:7,room:"Sup. 2-Rooms Apt N°4",bk:3,rev:2398.41,rn:11},{m:7,room:"2-Rooms Apt N°10",bk:8,rev:4298.61,rn:23},{m:7,room:"2-Rooms Apt N°17",bk:4,rev:3499.72,rn:23},{m:7,room:"Studio N°12",bk:8,rev:3489.49,rn:22},{m:7,room:"Cozy Studio Nr. 1",bk:5,rev:3352.09,rn:24},{m:7,room:"Sup. Penthouse N°18",bk:5,rev:4540.84,rn:25},{m:7,room:"Sunny Nr. 3",bk:5,rev:3595.48,rn:18},{m:8,room:"Sup. Penthouse N°18",bk:4,rev:6224.04,rn:20},{m:8,room:"2-Rooms Apt N°10",bk:3,rev:2881.97,rn:14},{m:8,room:"Cozy Studio Nr. 1",bk:2,rev:3431.81,rn:4},{m:8,room:"Studio N°8",bk:2,rev:2471.3,rn:14},{m:8,room:"Studio N°12",bk:4,rev:1760.33,rn:10},{m:8,room:"Sup. 1-Room Apt N°9",bk:2,rev:3731.58,rn:8},{m:8,room:"Studio N°7",bk:2,rev:2925.96,rn:15},{m:8,room:"Sunny Nr. 3",bk:2,rev:3203.58,rn:2},{m:8,room:"Charming Nr 15",bk:3,rev:3230.94,rn:7},{m:8,room:"Sup. 2-Rooms Apt N°4",bk:3,rev:4125.94,rn:21},{m:8,room:"2-Rooms Apt N°17",bk:3,rev:4507.9,rn:23},{m:9,room:"Studio N°7",bk:3,rev:4086.74,rn:21},{m:9,room:"Sunny Nr. 3",bk:3,rev:1290.76,rn:8},{m:9,room:"Studio N°12",bk:6,rev:3005.65,rn:21},{m:9,room:"Charming Nr 15",bk:3,rev:1637.18,rn:11},{m:9,room:"Studio N°8",bk:3,rev:1224.57,rn:9},{m:9,room:"Sup. Penthouse N°18",bk:5,rev:2555.71,rn:16},{m:9,room:"Sup. 2-Rooms Apt N°4",bk:3,rev:1643.96,rn:10},{m:9,room:"Cozy Studio Nr. 1",bk:3,rev:1764.34,rn:12},{m:9,room:"Sup. 1-Room Apt N°9",bk:3,rev:1932.78,rn:12},{m:9,room:"2-Rooms Apt N°10",bk:1,rev:446.4,rn:3},{m:9,room:"2-Rooms Apt N°17",bk:2,rev:1211.0,rn:7},{m:10,room:"2-Rooms Apt N°10",bk:5,rev:2595.84,rn:20},{m:10,room:"Cozy Studio Nr. 1",bk:4,rev:1502.24,rn:15},{m:10,room:"Studio N°12",bk:8,rev:2468.18,rn:26},{m:10,room:"Studio N°8",bk:3,rev:1149.76,rn:11},{m:10,room:"Sup. 1-Room Apt N°9",bk:5,rev:2672.02,rn:21},{m:10,room:"Sunny Nr. 3",bk:4,rev:2008.17,rn:16},{m:10,room:"Sup. Penthouse N°18",bk:4,rev:4077.87,rn:23},{m:10,room:"Studio N°7",bk:6,rev:2384.36,rn:22},{m:10,room:"2-Rooms Apt N°17",bk:5,rev:2656.12,rn:20},{m:10,room:"Sup. 2-Rooms Apt N°4",bk:5,rev:3177.56,rn:22},{m:10,room:"Charming Nr 15",bk:3,rev:1502.07,rn:13},{m:11,room:"Studio N°12",bk:4,rev:1055.65,rn:11},{m:11,room:"Sunny Nr. 3",bk:2,rev:544.54,rn:5},{m:11,room:"Studio N°7",bk:1,rev:314.3,rn:4},{m:11,room:"Studio N°8",bk:1,rev:321.65,rn:4},{m:12,room:"Sup. 1-Room Apt N°9",bk:3,rev:2204.25,rn:12},{m:12,room:"Charming Nr 15",bk:2,rev:868.2,rn:6},{m:12,room:"2-Rooms Apt N°17",bk:1,rev:1055.0,rn:5},{m:12,room:"Studio N°12",bk:3,rev:1644.05,rn:11},{m:12,room:"Studio N°8",bk:1,rev:714.7,rn:5},{m:12,room:"Sunny Nr. 3",bk:2,rev:1103.52,rn:6},{m:12,room:"Sup. 2-Rooms Apt N°4",bk:1,rev:626.27,rn:3},{m:12,room:"Cozy Studio Nr. 1",bk:1,rev:923.8,rn:5}];
const SRC_MO=[{m:1,src:"Booking.com",bk:2,rev:557.23,rn:6},{m:2,src:"Direct",bk:4,rev:1197.74,rn:11},{m:2,src:"Booking.com",bk:18,rev:6260.72,rn:56},{m:2,src:"Expedia",bk:1,rev:1587.6,rn:7},{m:2,src:"Airbnb",bk:3,rev:1205.5,rn:13},{m:3,src:"Booking.com",bk:35,rev:13966.31,rn:115},{m:3,src:"Direct",bk:14,rev:6397.04,rn:53},{m:3,src:"Airbnb",bk:2,rev:683.3,rn:6},{m:4,src:"Booking.com",bk:40,rev:22447.84,rn:135},{m:4,src:"Airbnb",bk:7,rev:2772.7,rn:17},{m:4,src:"Direct",bk:9,rev:8565.1,rn:58},{m:5,src:"Airbnb",bk:3,rev:730.7,rn:5},{m:5,src:"Booking.com",bk:38,rev:21297.21,rn:125},{m:5,src:"Direct",bk:12,rev:10014.8,rn:62},{m:6,src:"Booking.com",bk:45,rev:22170.67,rn:125},{m:6,src:"Direct",bk:11,rev:9155.62,rn:53},{m:6,src:"Airbnb",bk:2,rev:584.0,rn:2},{m:6,src:"Expedia",bk:1,rev:350.68,rn:3},{m:7,src:"Booking.com",bk:51,rev:38534.91,rn:166},{m:7,src:"Expedia",bk:6,rev:1511.26,rn:6},{m:7,src:"Direct",bk:13,rev:11115.3,rn:54},{m:7,src:"Airbnb",bk:16,rev:6756.05,rn:32},{m:8,src:"Direct",bk:14,rev:28671.9,rn:146},{m:8,src:"Booking.com",bk:20,rev:16094.8,rn:98},{m:8,src:"Airbnb",bk:2,rev:782.3,rn:5},{m:8,src:"Expedia",bk:1,rev:228.58,rn:2},{m:9,src:"Booking.com",bk:23,rev:13691.75,rn:87},{m:9,src:"Direct",bk:7,rev:6816.1,rn:41},{m:9,src:"Airbnb",bk:2,rev:667.95,rn:6},{m:9,src:"Expedia",bk:1,rev:444.61,rn:2},{m:10,src:"Booking.com",bk:1,rev:1375.83,rn:7},{m:10,src:"Direct",bk:1,rev:613.2,rn:3},{m:11,src:"Booking.com",bk:3,rev:1297.74,rn:10},{m:11,src:"Airbnb",bk:1,rev:442.0,rn:3},{m:12,src:"Direct",bk:1,rev:1426.0,rn:8}];
const RM_MO=[{m:1,room:"Studio N°12",bk:1,rev:193.48,rn:2},{m:1,room:"Studio N°7",bk:1,rev:363.75,rn:4},{m:2,room:"Studio N°12",bk:4,rev:1109.81,rn:12},{m:2,room:"Studio N°7",bk:3,rev:967.28,rn:9},{m:2,room:"Sup. Penthouse N°18",bk:3,rev:1512.01,rn:11},{m:2,room:"Cozy Studio Nr. 1",bk:2,rev:650.45,rn:6},{m:2,room:"Sup. 2-Rooms Apt N°4",bk:1,rev:1587.6,rn:7},{m:2,room:"Charming Nr 15",bk:2,rev:790.51,rn:9},{m:2,room:"2-Rooms Apt N°10",bk:2,rev:675.39,rn:5},{m:2,room:"Sup. 1-Room Apt N°9",bk:3,rev:1409.52,rn:15},{m:2,room:"Sunny Nr. 3",bk:1,rev:256.4,rn:2},{m:2,room:"2-Rooms Apt N°17",bk:3,rev:765.58,rn:6},{m:2,room:"Studio N°8",bk:2,rev:527.01,rn:5},{m:3,room:"2-Rooms Apt N°17",bk:5,rev:3265.73,rn:21},{m:3,room:"Studio N°7",bk:5,rev:2109.23,rn:21},{m:3,room:"2-Rooms Apt N°10",bk:4,rev:1421.64,rn:12},{m:3,room:"Sunny Nr. 3",bk:5,rev:1770.66,rn:13},{m:3,room:"Sup. 2-Rooms Apt N°4",bk:5,rev:1901.33,rn:14},{m:3,room:"Charming Nr 15",bk:5,rev:1728.43,rn:17},{m:3,room:"Studio N°8",bk:4,rev:1102.62,rn:10},{m:3,room:"Sup. 1-Room Apt N°9",bk:5,rev:2196.53,rn:18},{m:3,room:"Cozy Studio Nr. 1",bk:3,rev:1323.42,rn:12},{m:3,room:"Studio N°12",bk:5,rev:1570.06,rn:15},{m:3,room:"Sup. Penthouse N°18",bk:5,rev:2657.0,rn:21},{m:4,room:"Sup. 2-Rooms Apt N°4",bk:6,rev:3570.29,rn:20},{m:4,room:"Sup. Penthouse N°18",bk:5,rev:3709.53,rn:19},{m:4,room:"Sup. 1-Room Apt N°9",bk:5,rev:3322.63,rn:19},{m:4,room:"Sunny Nr. 3",bk:7,rev:3416.17,rn:18},{m:4,room:"Cozy Studio Nr. 1",bk:5,rev:2367.53,rn:16},{m:4,room:"Charming Nr 15",bk:6,rev:2309.64,rn:17},{m:4,room:"2-Rooms Apt N°17",bk:4,rev:2432.68,rn:13},{m:4,room:"Studio N°7",bk:6,rev:4502.57,rn:29},{m:4,room:"Studio N°12",bk:6,rev:2365.93,rn:16},{m:4,room:"Studio N°8",bk:5,rev:3327.47,rn:24},{m:4,room:"2-Rooms Apt N°10",bk:5,rev:2461.21,rn:19},{m:5,room:"Charming Nr 15",bk:7,rev:2714.79,rn:19},{m:5,room:"Studio N°12",bk:6,rev:2025.25,rn:14},{m:5,room:"Sup. 2-Rooms Apt N°4",bk:5,rev:2392.71,rn:12},{m:5,room:"Studio N°8",bk:6,rev:3124.82,rn:21},{m:5,room:"Sup. 1-Room Apt N°9",bk:4,rev:3381.35,rn:21},{m:5,room:"2-Rooms Apt N°10",bk:7,rev:3807.35,rn:24},{m:5,room:"Sunny Nr. 3",bk:5,rev:4801.41,rn:27},{m:5,room:"Cozy Studio Nr. 1",bk:4,rev:1650.6,rn:10},{m:5,room:"2-Rooms Apt N°17",bk:4,rev:3092.39,rn:16},{m:5,room:"Studio N°7",bk:3,rev:1829.13,rn:12},{m:5,room:"Sup. Penthouse N°18",bk:4,rev:3222.9,rn:16},{m:6,room:"2-Rooms Apt N°17",bk:6,rev:3853.78,rn:21},{m:6,room:"Sunny Nr. 3",bk:7,rev:2698.14,rn:15},{m:6,room:"2-Rooms Apt N°10",bk:5,rev:2816.04,rn:17},{m:6,room:"Studio N°7",bk:7,rev:3178.03,rn:20},{m:6,room:"Sup. 2-Rooms Apt N°4",bk:7,rev:3638.81,rn:18},{m:6,room:"Studio N°8",bk:4,rev:2665.72,rn:16},{m:6,room:"Sup. Penthouse N°18",bk:6,rev:2262.98,rn:10},{m:6,room:"Cozy Studio Nr. 1",bk:6,rev:2169.98,rn:13},{m:6,room:"Charming Nr 15",bk:7,rev:4037.2,rn:22},{m:6,room:"Sup. 1-Room Apt N°9",bk:4,rev:2654.42,rn:15},{m:6,room:"Studio N°12",bk:6,rev:2285.87,rn:16},{m:7,room:"Sup. 1-Room Apt N°9",bk:6,rev:6403.84,rn:27},{m:7,room:"Studio N°7",bk:8,rev:4911.74,rn:21},{m:7,room:"2-Rooms Apt N°10",bk:5,rev:3168.17,rn:13},{m:7,room:"Charming Nr 15",bk:9,rev:4490.75,rn:20},{m:7,room:"2-Rooms Apt N°17",bk:10,rev:6808.17,rn:29},{m:7,room:"Studio N°12",bk:13,rev:4805.66,rn:25},{m:7,room:"Sunny Nr. 3",bk:9,rev:7408.24,rn:30},{m:7,room:"Sup. 2-Rooms Apt N°4",bk:8,rev:5106.45,rn:20},{m:7,room:"Sup. Penthouse N°18",bk:4,rev:5824.71,rn:27},{m:7,room:"Cozy Studio Nr. 1",bk:5,rev:3545.55,rn:22},{m:7,room:"Studio N°8",bk:12,rev:5444.24,rn:24},{m:8,room:"Studio N°7",bk:5,rev:3953.2,rn:23},{m:8,room:"Sup. 2-Rooms Apt N°4",bk:4,rev:3990.59,rn:21},{m:8,room:"Studio N°8",bk:5,rev:4712.88,rn:29},{m:8,room:"Studio N°12",bk:5,rev:3689.81,rn:22},{m:8,room:"Cozy Studio Nr. 1",bk:3,rev:3958.58,rn:23},{m:8,room:"Sup. Penthouse N°18",bk:4,rev:4341.14,rn:23},{m:8,room:"Sup. 1-Room Apt N°9",bk:3,rev:3678.5,rn:21},{m:8,room:"2-Rooms Apt N°10",bk:2,rev:4379.94,rn:22},{m:8,room:"Sunny Nr. 3",bk:3,rev:5894.04,rn:29},{m:8,room:"2-Rooms Apt N°17",bk:5,rev:4088.56,rn:22},{m:8,room:"Charming Nr 15",bk:2,rev:3090.34,rn:16},{m:9,room:"Cozy Studio Nr. 1",bk:5,rev:1982.22,rn:14},{m:9,room:"Sup. Penthouse N°18",bk:5,rev:4265.06,rn:26},{m:9,room:"Studio N°12",bk:7,rev:3390.11,rn:24},{m:9,room:"Studio N°7",bk:4,rev:2439.95,rn:15},{m:9,room:"Studio N°8",bk:5,rev:2889.96,rn:17},{m:9,room:"Sup. 1-Room Apt N°9",bk:1,rev:934.99,rn:5},{m:9,room:"Charming Nr 15",bk:2,rev:1347.28,rn:8},{m:9,room:"2-Rooms Apt N°17",bk:2,rev:3700.68,rn:24},{m:9,room:"Sup. 2-Rooms Apt N°4",bk:1,rev:444.61,rn:2},{m:9,room:"Sunny Nr. 3",bk:1,rev:225.55,rn:1},{m:10,room:"2-Rooms Apt N°10",bk:1,rev:1375.83,rn:7},{m:10,room:"Sup. Penthouse N°18",bk:1,rev:613.2,rn:3},{m:11,room:"2-Rooms Apt N°17",bk:1,rev:312.04,rn:2},{m:11,room:"Studio N°7",bk:1,rev:236.62,rn:2},{m:11,room:"Sup. Penthouse N°18",bk:1,rev:442.0,rn:3},{m:11,room:"2-Rooms Apt N°10",bk:1,rev:749.08,rn:6},{m:12,room:"Studio N°7",bk:1,rev:1426.0,rn:8}];
const BUDGET_FY=286306.14;
const TOTAL26={rev:260415.04,rn:1528,bk:410,adr:170.43,revpar:64.87,occ:38.1,los:3.5,lead:53.8};
const TOTAL25={rev:248123.47,rn:1603,bk:386,adr:154.79,revpar:61.80,occ:39.9,los:3.8,lead:47.3};
const OTB25={rev:185535.24,rn:1134,bk:284};
const CANCEL={r25:13.6,r26:19.9};

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
function cs(a,b){if(b===0)return a>0?"green":"amber";const d=(a-b)/b*100;return d>=3?"green":d<=-3?"red":"amber";}

// ===== ACTIONS =====
const generateActions=()=>{const red=[],amber=[],green=[];
const ytdB=M26.slice(0,3).reduce((a,m)=>a+m.bud,0),ytdA=M26.slice(0,3).reduce((a,m)=>a+m.rev,0),ytdV=(ytdA-ytdB)/ytdB*100;
if(ytdV<-30)red.push({title:"YTD Revenue Critical: "+ytdV.toFixed(0)+"% Below Budget",metric:fmtCHF(ytdA)+" vs "+fmtCHF(ytdB)+" budget",actions:["Review pricing for remaining March dates","Activate last-minute deals on Booking.com & Airbnb","Flash promotions for shoulder weeks","Audit Amenitiz booking engine for conversion"],impact:"Closing 50% of gap = "+fmtCHF(Math.abs(ytdA-ytdB)*0.5)+" additional revenue"});
red.push({title:"January: -94% vs Budget (CHF 491 vs CHF 8,000)",metric:"Only 2 bookings / 6 room nights",actions:["Reassess CHF 8k January budget for Locarno winter","Winter packages (ski + city break) for Jan 2027","Long-stay discounts for 7+ nights","Partner with local events for low-season demand"],impact:"Budget revision needed for Q1 2027"});
if(OTB[7].dp<-50)red.push({title:"August OTB: "+OTB[7].dp+"% Behind STLY",metric:fmtCHF(OTB[7].r26)+" vs "+fmtCHF(OTB[7].r25)+" STLY ("+OTB[7].bk26+" vs "+OTB[7].bk25+" bk)",actions:["Peak season gap is critical","Targeted summer campaigns","Ensure all rooms visible on all OTAs","Early-bird non-refundable discounts","Check Locarno competitor pricing"],impact:"Closing gap = "+fmtCHF(Math.abs(OTB[7].d))+" peak revenue"});
const marV=(M26[2].rev-M26[2].bud)/M26[2].bud*100;if(marV<-30)red.push({title:"March: "+marV.toFixed(0)+"% Below Budget",metric:fmtCHF(M26[2].rev)+" vs "+fmtCHF(M26[2].bud)+" \u2014 month half over",actions:["Last-minute promotions","Mobile-first Booking.com deals","'Stay 3 pay 2' offers","Check all rooms are open for booking"],impact:"Each booking at avg ADR (CHF 99) adds ~CHF 376"});
const aprV=(M26[3].rev-M26[3].bud)/M26[3].bud*100;if(aprV<-50)red.push({title:"April OTB: "+aprV.toFixed(0)+"% Below Budget",metric:fmtCHF(M26[3].rev)+" vs "+fmtCHF(M26[3].bud),actions:["Easter/spring demand potential","Increase OTA visibility","'Locarno Spring Break' packages","Direct offers to past guests via Amenitiz"],impact:"April 2025 delivered "+fmtCHF(M25[3].rev)});
if(OTB[3].dp>20)green.push({title:"April OTB: +"+OTB[3].dp+"% vs STLY",metric:fmtCHF(OTB[3].r26)+" vs "+fmtCHF(OTB[3].r25)+" — "+OTB[3].bk26+" vs "+OTB[3].bk25+" bk",actions:["Strong demand — focus on ADR optimization","Easter opportunity to push rates","Restrict discounting for peak weekends","Monitor pace to close budget gap (currently at "+aprV.toFixed(0)+"%)"],impact:"April 2025 ended at "+fmtCHF(M25[3].rev)+" — on pace to exceed STLY"});
const adrD=(TOTAL26.adr-TOTAL25.adr)/TOTAL25.adr*100;if(adrD<-5)amber.push({title:"ADR Erosion: "+adrD.toFixed(1)+"% vs 2025",metric:"CHF "+TOTAL26.adr+" vs CHF "+TOTAL25.adr,actions:["Review rate strategy","Check room type mix","Compare competitor rates","Value-adds instead of rate cuts"],impact:"CHF 10 ADR increase \u00d7 "+TOTAL26.rn+" RN = "+fmtCHF(TOTAL26.rn*10)});
if(CANCEL.r26>15)amber.push({title:"Cancellation Rate: "+CANCEL.r26+"% (up from "+CANCEL.r25+"%)",metric:"102 cancellations \u2014 83% from Booking.com",actions:["Review Booking.com cancellation policies","Non-refundable rate options","Analyze cancellation clustering","Expedia: 4/5 bookings cancelled"],impact:"Reducing by 5% retains ~10 bookings"});
amber.push({title:"OTA Dependency: Booking.com at 71%",metric:"296/410 bookings \u2014 high commission exposure (~15%)",actions:["Boost direct bookings on residenzamotta.ch","'Book Direct' best-rate guarantee","Grow Airbnb (currently 8%)","Google Hotel Ads"],impact:"10% shift to direct saves ~"+fmtCHF(TOTAL26.rev*0.10*0.15)+" commissions"});
if(OTB[4].dp<-5)amber.push({title:"May OTB: "+OTB[4].dp+"% Behind STLY",metric:fmtCHF(OTB[4].r26)+" vs "+fmtCHF(OTB[4].r25),actions:["Spring/pre-summer packages","Competitive Ascension weekend pricing"],impact:"May 2025 ended at "+fmtCHF(M25[4].rev)});
if(OTB[4].dp>=5)green.push({title:"May OTB: +"+OTB[4].dp+"% vs STLY",metric:fmtCHF(OTB[4].r26)+" vs "+fmtCHF(OTB[4].r25)+" — "+OTB[4].bk26+" vs "+OTB[4].bk25+" bk",actions:["Good momentum — maintain pricing","Ascension/Whitsun weekend opportunity"],impact:"May 2025 ended at "+fmtCHF(M25[4].rev)});
amber.push({title:"Cancellation Clusters: Mar, Jun, Jul = 6 Each",metric:"18 of 102 cancellations in 3 months",actions:["Investigate drivers per month","Stricter Jul policies"],impact:"Half of July's 6 cancellations = significant peak revenue"});
const dp=delta(TOTAL26.rev,OTB25.rev);if(dp>0)green.push({title:"Total OTB: +"+dp.toFixed(1)+"% Ahead of STLY",metric:fmtCHF(TOTAL26.rev)+" vs "+fmtCHF(OTB25.rev),actions:["Maintain momentum","Monitor pace weekly"],impact:"Strong foundation"});
if(OTB[6].dp>50)green.push({title:"July OTB: +"+OTB[6].dp+"% vs STLY",metric:fmtCHF(OTB[6].r26)+" vs "+fmtCHF(OTB[6].r25)+" \u2014 32 vs 22 bk",actions:["Consider rate increases","W29 at 89.6% \u2014 push for sellout","Restrict discounting"],impact:"CHF 10 increase on 138 RN = CHF 1.4k"});
if(OTB[5].dp>100)green.push({title:"June OTB: +"+OTB[5].dp+"% vs STLY",metric:fmtCHF(OTB[5].r26)+" vs "+fmtCHF(OTB[5].r25),actions:["Maintain pricing","Monitor weekly to optimize yield"],impact:"Jun 2025 ended at "+fmtCHF(M25[5].rev)+" \u2014 on track"});
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
const[paceFrom,setPaceFrom]=useState("2026-01-01");
const[paceTo,setPaceTo]=useState("2026-07-28");
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
const oChart=OTB.filter(m=>m.m>=from&&m.m<=to).map(m=>({name:MONTHS[m.m-1],"OTB 28.07.26":m.r26,"OTB 28.07.25":m.r25}));
const occC=M26.filter(m=>m.m>=from&&m.m<=to).map(m=>({name:MONTHS[m.m-1],"2026":m.occ,"2025":M25[m.m-1].occ}));
const adrC=M26.filter(m=>m.m>=from&&m.m<=to).map(m=>({name:MONTHS[m.m-1],"2026":m.adr,"2025":M25[m.m-1].adr}));
const periodLabel=from===1&&to===12?"Full Year":from===to?MONTHS[from-1]:MONTHS[from-1]+" \u2013 "+MONTHS[to-1];
const fPace=useMemo(()=>{
const f26=PACE_D26.filter(p=>p.d>=paceFrom&&p.d<=paceTo);
const y25f=paceFrom.replace('2026','2025');const y25t=paceTo.replace('2026','2025');
const f25=PACE_D25.filter(p=>p.d>=y25f&&p.d<=y25t);
const bk26=f26.reduce((a,p)=>a+p.bk,0);const rev26=f26.reduce((a,p)=>a+p.rev,0);const rn26=f26.reduce((a,p)=>a+p.rn,0);
const cn26=f26.reduce((a,p)=>a+p.cn,0);
const bk25=f25.reduce((a,p)=>a+p.bk,0);const rev25=f25.reduce((a,p)=>a+p.rev,0);const rn25=f25.reduce((a,p)=>a+p.rn,0);
const bc=f26.reduce((a,p)=>a+p.bc,0);const di=f26.reduce((a,p)=>a+p.di,0);const ab=f26.reduce((a,p)=>a+p.ab,0);const ex=f26.reduce((a,p)=>a+p.ex,0);
// Weekly aggregation
const wMap={};f26.forEach(p=>{const dt=new Date(p.d);const day=dt.getDay();const mon=new Date(dt);mon.setDate(dt.getDate()-((day+6)%7));const wk=mon.toISOString().slice(5,10).replace('-','/');if(!wMap[wk])wMap[wk]={ws:wk,bk26:0,rev26:0,cn:0};wMap[wk].bk26+=p.bk;wMap[wk].rev26+=p.rev;wMap[wk].cn+=p.cn;});
const wMap25={};f25.forEach(p=>{const dt=new Date(p.d);const day=dt.getDay();const mon=new Date(dt);mon.setDate(dt.getDate()-((day+6)%7));const wk=mon.toISOString().slice(5,10).replace('-','/');if(!wMap25[wk])wMap25[wk]={bk25:0};wMap25[wk].bk25+=p.bk;});
const weeks=Object.entries(wMap).sort((a,b)=>a[0].localeCompare(b[0])).map(([k,v])=>{const k25=k.replace(/^0/,'').replace('/','/')==k?k:k;return{...v,bk25:0}});
// Daily list for chart
const daily=f26.map(p=>({d:p.d.slice(5),bk:p.bk,cn:p.cn}));
return{bk26,rev26,rn26,cn26,bk25,rev25,rn25,bc,di,ab,ex,daily,days:f26.length};
},[paceFrom,paceTo]);
const fRm25=useMemo(()=>{const map={};RM25_MO.filter(r=>r.m>=from&&r.m<=to).forEach(r=>{if(!map[r.room])map[r.room]={room:r.room,bk:0,rev:0,rn:0};const m=map[r.room];m.bk+=r.bk;m.rev+=r.rev;m.rn+=r.rn;});return Object.values(map).sort((a,b)=>b.rev-a.rev);},[from,to]);
const fSrc=useMemo(()=>{const map={};SRC_MO.filter(s=>s.m>=from&&s.m<=to).forEach(s=>{if(!map[s.src])map[s.src]={source:s.src,bk:0,rev:0,rn:0};map[s.src].bk+=s.bk;map[s.src].rev+=s.rev;map[s.src].rn+=s.rn;});return Object.values(map).sort((a,b)=>b.rev-a.rev);},[from,to]);
const fRm=useMemo(()=>{const map={};RM_MO.filter(r=>r.m>=from&&r.m<=to).forEach(r=>{if(!map[r.room])map[r.room]={room:r.room,bk:0,rev:0,rn:0,losSum:0,leadSum:0,losN:0,leadN:0};const m=map[r.room];m.bk+=r.bk;m.rev+=r.rev;m.rn+=r.rn;m.losSum+=r.los*r.bk;m.leadSum+=r.lead*r.bk;m.losN+=r.bk;m.leadN+=r.bk;});return Object.values(map).map(r=>({...r,los:r.losN>0?r.losSum/r.losN:0,lead:r.leadN>0?r.leadSum/r.leadN:0})).sort((a,b)=>b.rev-a.rev);},[from,to]);

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
<div style={{background:"rgba(255,255,255,0.06)",borderRadius:8,padding:"8px 14px",fontSize:12,color:"rgba(255,255,255,0.5)"}}>📅 <span style={{color:"#fff",fontWeight:600}}>July 28, 2026</span><br/>11 units · Locarno · Confirmed + modified only</div>
</div>
{/* TABS */}
<div style={{display:"flex",gap:4,marginBottom:20,overflowX:"auto",paddingBottom:4}}>
<Tab active={tab==="overview"} onClick={()=>setTab("overview")}>Overview</Tab>
<Tab active={tab==="otb"} onClick={()=>setTab("otb")}>OTB vs STLY</Tab>
<Tab active={tab==="budget"} onClick={()=>setTab("budget")}>vs Budget</Tab>
<Tab active={tab==="weekly"} onClick={()=>setTab("weekly")}>Weekly</Tab>
<Tab active={tab==="monthly"} onClick={()=>setTab("monthly")}>Monthly</Tab>
<Tab active={tab==="channels"} onClick={()=>setTab("channels")}>Channels</Tab>
<Tab active={tab==="apartments"} onClick={()=>setTab("apartments")}>🏠 Apartments</Tab>
<Tab active={tab==="pace"} onClick={()=>setTab("pace")}>📈 Booking Pace</Tab>
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
<KPICard label="Revenue" value={fmtCHF(f26.rev)} sub={"2025: "+fmtCHF(f25.rev)} pctLabel={fmtPct(delta(f26.rev,f25.rev))} status={cs(f26.rev,f25.rev)}/>
<KPICard label="Room Nights" value={f26.rn} sub={"2025: "+f25.rn} pctLabel={fmtPct(delta(f26.rn,f25.rn))} status={cs(f26.rn,f25.rn)}/>
<KPICard label="ADR" value={"CHF "+f26.adr.toFixed(0)} sub={"2025: CHF "+f25.adr.toFixed(0)} pctLabel={fmtPct(delta(f26.adr,f25.adr))} status={cs(f26.adr,f25.adr)}/>
<KPICard label="RevPAR" value={"CHF "+f26.rpar.toFixed(0)} sub={"2025: CHF "+f25.rpar.toFixed(0)} pctLabel={fmtPct(delta(f26.rpar,f25.rpar))} status={cs(f26.rpar,f25.rpar)}/>
<KPICard label="Occupancy" value={f26.occ.toFixed(1)+"%"} sub={"2025: "+f25.occ.toFixed(1)+"%"} pctLabel={(f26.occ-f25.occ>0?"+":"")+(f26.occ-f25.occ).toFixed(1)+"pp"} status={cs(f26.occ,f25.occ)}/>
<KPICard label="Bookings" value={f26.bk} sub={"2025: "+f25.bk} pctLabel={fmtPct(delta(f26.bk,f25.bk))} status={cs(f26.bk,f25.bk)}/>
<KPICard label="Avg LOS" value={f26.los.toFixed(1)+" nights"} sub={"2025: "+f25.los.toFixed(1)} pctLabel={fmtPct(delta(f26.los,f25.los))} status={cs(f26.los,f25.los)}/>
<KPICard label="Lead Time" value={f26.lead.toFixed(0)+" days"} sub={"2025: "+f25.lead.toFixed(0)+"d"} pctLabel={fmtPct(delta(f26.lead,f25.lead))} status="green"/>
</div>
<STitle sub={periodLabel}>💰 Revenue vs Budget</STitle>
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12}}>
<KPICard label="Revenue" value={fmtCHF(f26.rev)} sub={"Budget: "+fmtCHF(f26.bud)} pctLabel={fmtPct(delta(f26.rev,f26.bud))} status={cs(f26.rev,f26.bud)}/>
<KPICard label="Budget Gap" value={fmtCHF(Math.abs(f26.rev-f26.bud))} sub={f26.rev>=f26.bud?"ahead of budget":"behind budget"} pctLabel={fmtPct(delta(f26.rev,f26.bud))} status={cs(f26.rev,f26.bud)}/>
<KPICard label="OTB vs STLY (28.07)" value={fmtCHF(fOtb.r26)} sub={"OTB 28.07.25: "+fmtCHF(fOtb.r25)} pctLabel={fOtb.r25>0?fmtPct(delta(fOtb.r26,fOtb.r25)):"N/A"} status={cs(fOtb.r26,fOtb.r25)}/>
</div>
<STitle>{"\ud83d\udcc8"} Monthly Revenue</STitle>
<div style={{background:"rgba(255,255,255,0.03)",borderRadius:12,padding:"16px 8px 8px"}}><ResponsiveContainer width="100%" height={300}><ComposedChart data={mChart}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)"/><XAxis dataKey="name" tick={{fill:"rgba(255,255,255,0.5)",fontSize:11}}/><YAxis tick={{fill:"rgba(255,255,255,0.5)",fontSize:11}} tickFormatter={fmt}/><Tooltip content={<CTip/>}/><Legend wrapperStyle={{fontSize:11}}/><Bar dataKey="2026 OTB" fill="#6366f1" radius={[4,4,0,0]}/><Bar dataKey="2025 Actual" fill="rgba(255,255,255,0.15)" radius={[4,4,0,0]}/><Line dataKey="Budget" stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="6 3"/></ComposedChart></ResponsiveContainer></div>
</div>)}

{/* OTB vs STLY */}
{tab==="otb"&&(<div>
<MonthPicker from={from} to={to} setFrom={setFrom} setTo={setTo}/>
<div style={{background:"rgba(99,102,241,0.08)",border:"1px solid rgba(99,102,241,0.2)",borderRadius:10,padding:"12px 18px",marginBottom:20,fontSize:12,color:"rgba(255,255,255,0.6)",lineHeight:1.6}}>
<strong style={{color:"#a5b4fc"}}>How this works:</strong> 2026 OTB = all confirmed/modified bookings as of <strong style={{color:"#fff"}}>July 28, 2026</strong>. STLY = only 2025 bookings created on or before <strong style={{color:"#fff"}}>July 28, 2025</strong>. Same cutoff date, apples to apples.
</div>
<STitle sub={"OTB as of 28.07.2026 vs OTB as of 28.07.2025"}>{"\ud83d\udcca"} On The Books — {periodLabel}</STitle>
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12,marginBottom:24}}>
<KPICard label="Revenue (OTB 28.07.26)" value={fmtCHF(fOtb.r26)} sub={"OTB 28.07.25: "+fmtCHF(fOtb.r25)} pctLabel={fOtb.r25>0?fmtPct(delta(fOtb.r26,fOtb.r25)):"N/A"} status={cs(fOtb.r26,fOtb.r25)}/>
<KPICard label="Room Nights (OTB 28.07.26)" value={fOtb.rn26} sub={"OTB 28.07.25: "+fOtb.rn25} pctLabel={fOtb.rn25>0?fmtPct(delta(fOtb.rn26,fOtb.rn25)):"N/A"} status={cs(fOtb.rn26,fOtb.rn25)}/>
<KPICard label="ADR (OTB 28.07.26)" value={"CHF "+(fOtb.rn26>0?(fOtb.r26/fOtb.rn26).toFixed(0):"0")} sub={"OTB 28.07.25: CHF "+(fOtb.rn25>0?(fOtb.r25/fOtb.rn25).toFixed(0):"0")} pctLabel={fOtb.rn25>0&&fOtb.rn26>0?fmtPct(delta(fOtb.r26/fOtb.rn26,fOtb.r25/fOtb.rn25)):"N/A"} status={fOtb.rn25>0&&fOtb.rn26>0?cs(fOtb.r26/fOtb.rn26,fOtb.r25/fOtb.rn25):"amber"}/>
<KPICard label="RevPAR (OTB 28.07.26)" value={"CHF "+(f26.arn>0?(fOtb.r26/f26.arn).toFixed(2):"0")} sub={"OTB 28.07.25: CHF "+(f25.arn>0?(fOtb.r25/f25.arn).toFixed(2):"0")} pctLabel={f25.arn>0&&f26.arn>0?fmtPct(delta(fOtb.r26/f26.arn,fOtb.r25/f25.arn)):"N/A"} status={f25.arn>0&&f26.arn>0?cs(fOtb.r26/f26.arn,fOtb.r25/f25.arn):"amber"}/>
<KPICard label="Bookings (OTB 28.07.26)" value={fOtb.bk26} sub={"OTB 28.07.25: "+fOtb.bk25} pctLabel={fOtb.bk25>0?fmtPct(delta(fOtb.bk26,fOtb.bk25)):"N/A"} status={cs(fOtb.bk26,fOtb.bk25)}/>
<KPICard label="Occupancy (OTB 28.07.26)" value={(f26.arn>0?(fOtb.rn26/f26.arn*100).toFixed(1):"0")+"%"} sub={"OTB 28.07.25: "+(f25.arn>0?(fOtb.rn25/f25.arn*100).toFixed(1):"0")+"%"} pctLabel={f25.arn>0&&f26.arn>0?fmtPct(delta(fOtb.rn26/f26.arn,fOtb.rn25/f25.arn)):"N/A"} status={f25.arn>0&&f26.arn>0?cs(fOtb.rn26/f26.arn,fOtb.rn25/f25.arn):"amber"}/>
</div>
<div style={{background:"rgba(255,255,255,0.03)",borderRadius:12,padding:"16px 8px 8px"}}><ResponsiveContainer width="100%" height={320}><ComposedChart data={oChart}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)"/><XAxis dataKey="name" tick={{fill:"rgba(255,255,255,0.5)",fontSize:11}}/><YAxis tick={{fill:"rgba(255,255,255,0.5)",fontSize:11}} tickFormatter={fmt}/><Tooltip content={<CTip/>}/><Legend wrapperStyle={{fontSize:11}}/><Bar dataKey="OTB 28.07.26" fill="#6366f1" radius={[4,4,0,0]}/><Bar dataKey="OTB 28.07.25" fill="rgba(255,255,255,0.2)" radius={[4,4,0,0]}/></ComposedChart></ResponsiveContainer></div>
<div style={{marginTop:24,overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}><thead><tr style={{borderBottom:"1px solid rgba(255,255,255,0.1)"}}>{["Month","OTB 28.07.26","OTB 28.07.25","\u0394 CHF","\u0394 %","RN 26","RN 25"].map(h=>(<th key={h} style={{padding:"10px 8px",textAlign:"left",color:"rgba(255,255,255,0.5)",fontWeight:600,whiteSpace:"nowrap"}}>{h}</th>))}</tr></thead><tbody>{OTB.filter(m=>m.m>=from&&m.m<=to).map((m)=>{const st=m.r25>0?cs(m.r26,m.r25):(m.r26>0?"green":"amber");return(<tr key={m.m} style={{borderBottom:"1px solid rgba(255,255,255,0.05)"}}><td style={{padding:"10px 8px",fontWeight:600,color:"#fff"}}>{MONTHS[m.m-1]}</td><td style={{padding:"10px 8px",color:"#fff"}}>{fmtCHF(m.r26)}</td><td style={{padding:"10px 8px",color:"rgba(255,255,255,0.5)"}}>{fmtCHF(m.r25)}</td><td style={{padding:"10px 8px",color:sc[st],fontWeight:600}}>{m.d>=0?"+":""}{fmtCHF(m.d)}</td><td style={{padding:"10px 8px",color:sc[st],fontWeight:600}}>{m.r25>0?fmtPct(m.dp):"N/A"}</td><td style={{padding:"10px 8px",color:"#fff"}}>{m.rn26}</td><td style={{padding:"10px 8px",color:"rgba(255,255,255,0.5)"}}>{m.rn25}</td></tr>);})}<tr style={{borderTop:"2px solid rgba(255,255,255,0.15)",fontWeight:700}}><td style={{padding:"10px 8px",color:"#fff",fontWeight:700}}>TOTAL</td><td style={{padding:"10px 8px",color:"#fff",fontWeight:700}}>{fmtCHF(fOtb.r26)}</td><td style={{padding:"10px 8px",color:"#fff",fontWeight:700}}>{fmtCHF(fOtb.r25)}</td><td style={{padding:"10px 8px",color:"#fff",fontWeight:700}} style={{padding:"10px 8px",color:sc[cs(fOtb.r26,fOtb.r25)],fontWeight:700}}>{fOtb.r26-fOtb.r25>=0?"+":""}{fmtCHF(fOtb.r26-fOtb.r25)}</td><td style={{padding:"10px 8px",color:sc[cs(fOtb.r26,fOtb.r25)],fontWeight:700}}>{fOtb.r25>0?fmtPct((fOtb.r26-fOtb.r25)/fOtb.r25*100):"N/A"}</td><td style={{padding:"10px 8px",color:"#fff",fontWeight:700}}>{fOtb.rn26}</td><td style={{padding:"10px 8px",color:"#fff",fontWeight:700}}>{fOtb.rn25}</td></tr></tbody></table></div>
</div>)}

{/* BUDGET */}
{tab==="budget"&&(<div>
<MonthPicker from={from} to={to} setFrom={setFrom} setTo={setTo}/>
<STitle sub={periodLabel+" 2026"}>💰 Revenue vs Budget</STitle>
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12,marginBottom:24}}>
<KPICard label="Revenue" value={fmtCHF(f26.rev)} sub={"Budget: "+fmtCHF(f26.bud)} pctLabel={fmtPct(delta(f26.rev,f26.bud))} status={cs(f26.rev,f26.bud)}/>
<KPICard label="ADR" value={"CHF "+f26.adr.toFixed(0)} sub={"2025: CHF "+f25.adr.toFixed(0)} pctLabel={fmtPct(delta(f26.adr,f25.adr))} status={cs(f26.adr,f25.adr)}/>
<KPICard label="RevPAR" value={"CHF "+f26.rpar.toFixed(2)} sub={"2025: CHF "+f25.rpar.toFixed(2)} pctLabel={fmtPct(delta(f26.rpar,f25.rpar))} status={cs(f26.rpar,f25.rpar)}/>
<KPICard label="vs 2025 Actual" value={fmtCHF(f26.rev)} sub={"2025: "+fmtCHF(f25.rev)} pctLabel={fmtPct(delta(f26.rev,f25.rev))} status={cs(f26.rev,f25.rev)}/>
<KPICard label="FY Budget" value={fmtCHF(BUDGET_FY)} sub={(f26.rev/BUDGET_FY*100).toFixed(1)+"% achieved"} pctLabel={periodLabel} status="amber"/>
</div>
<div style={{background:"rgba(255,255,255,0.03)",borderRadius:12,padding:"16px 8px 8px"}}><ResponsiveContainer width="100%" height={320}><ComposedChart data={mChart}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)"/><XAxis dataKey="name" tick={{fill:"rgba(255,255,255,0.5)",fontSize:11}}/><YAxis tick={{fill:"rgba(255,255,255,0.5)",fontSize:11}} tickFormatter={fmt}/><Tooltip content={<CTip/>}/><Legend wrapperStyle={{fontSize:11}}/><Bar dataKey="2026 OTB" fill="#6366f1" radius={[4,4,0,0]}/><Line dataKey="Budget" stroke="#f59e0b" strokeWidth={2.5} dot={{r:4,fill:"#f59e0b"}}/><Line dataKey="2025 Actual" stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} dot={false} strokeDasharray="4 4"/></ComposedChart></ResponsiveContainer></div>
<div style={{marginTop:24,overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}><thead><tr style={{borderBottom:"1px solid rgba(255,255,255,0.1)"}}>{["Month","OTB Rev","Budget","Var","Var %","2025","vs 2025"].map(h=>(<th key={h} style={{padding:"10px 8px",textAlign:"left",color:"rgba(255,255,255,0.5)",fontWeight:600,whiteSpace:"nowrap"}}>{h}</th>))}</tr></thead><tbody>{M26.filter(m=>m.m>=from&&m.m<=to).map(m=>{const v=m.rev-m.bud,vp=v/m.bud*100,st=cs(m.rev,m.bud);const v25=m.rev-M25[m.m-1].rev,v25p=M25[m.m-1].rev>0?(v25/M25[m.m-1].rev*100):0,s25=M25[m.m-1].rev>0?cs(m.rev,M25[m.m-1].rev):"amber";return(<tr key={m.m} style={{borderBottom:"1px solid rgba(255,255,255,0.05)"}}><td style={{padding:"10px 8px",fontWeight:600,color:"#fff"}}>{MONTHS[m.m-1]}</td><td style={{padding:"10px 8px",color:"#fff"}}>{fmtCHF(m.rev)}</td><td style={{padding:"10px 8px",color:"rgba(255,255,255,0.5)"}}>{fmtCHF(m.bud)}</td><td style={{padding:"10px 8px",color:sc[st],fontWeight:600}}>{v>=0?"+":""}{fmtCHF(v)}</td><td style={{padding:"10px 8px",color:sc[st],fontWeight:600}}>{fmtPct(vp)}</td><td style={{padding:"10px 8px",color:"rgba(255,255,255,0.5)"}}>{fmtCHF(M25[m.m-1].rev)}</td><td style={{padding:"10px 8px",color:sc[s25],fontWeight:600}}>{M25[m.m-1].rev>0?fmtPct(v25p):"N/A"}</td></tr>);})}{(()=>{const fM=M26.filter(m=>m.m>=from&&m.m<=to);const tRev=fM.reduce((a,m)=>a+m.rev,0);const tBud=fM.reduce((a,m)=>a+m.bud,0);const t25=fM.reduce((a,m)=>a+M25[m.m-1].rev,0);const vb=tRev-tBud;const v25=tRev-t25;return(<tr style={{borderTop:"2px solid rgba(255,255,255,0.15)",fontWeight:700}}><td style={{padding:"10px 8px",color:"#fff",fontWeight:700}}>TOTAL</td><td style={{padding:"10px 8px",color:"#fff",fontWeight:700}}>{fmtCHF(tRev)}</td><td style={{padding:"10px 8px",color:"#fff",fontWeight:700}}>{fmtCHF(tBud)}</td><td style={{padding:"10px 8px",color:sc[cs(tRev,tBud)],fontWeight:700}}>{vb>=0?"+":""}{fmtCHF(vb)}</td><td style={{padding:"10px 8px",color:sc[cs(tRev,tBud)],fontWeight:700}}>{fmtPct(vb/tBud*100)}</td><td style={{padding:"10px 8px",color:"#fff",fontWeight:700}}>{fmtCHF(t25)}</td><td style={{padding:"10px 8px",color:sc[cs(tRev,t25)],fontWeight:700}}>{t25>0?fmtPct(v25/t25*100):"N/A"}</td></tr>);})()}</tbody></table></div>
</div>)}

{/* WEEKLY */}
{tab==="weekly"&&(<div>
<MonthPicker from={from} to={to} setFrom={setFrom} setTo={setTo}/>
<STitle sub={periodLabel+" 2026"}>{"\ud83d\udcc5"} Weekly Performance</STitle>
<div style={{background:"rgba(255,255,255,0.03)",borderRadius:12,padding:"16px 8px 8px"}}><ResponsiveContainer width="100%" height={300}><ComposedChart data={fWeeks}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)"/><XAxis dataKey="ws" tick={{fill:"rgba(255,255,255,0.5)",fontSize:10}} angle={-45} textAnchor="end" height={60}/><YAxis yAxisId="left" tick={{fill:"rgba(255,255,255,0.5)",fontSize:11}} tickFormatter={fmt}/><YAxis yAxisId="right" orientation="right" tick={{fill:"#22d3ee",fontSize:11}} unit="%"/><Tooltip content={<CTip/>}/><Legend wrapperStyle={{fontSize:11}}/><Bar yAxisId="left" dataKey="rev" name="Revenue" fill="#6366f1" radius={[3,3,0,0]}/><Line yAxisId="right" dataKey="occ" name="Occ %" stroke="#22d3ee" strokeWidth={2} dot={{r:3}}/></ComposedChart></ResponsiveContainer></div>
<div style={{marginTop:20,overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}><thead><tr style={{borderBottom:"1px solid rgba(255,255,255,0.1)"}}>{["Wk","Start","Bk","Revenue","RN","Occ%","LOS"].map(h=>(<th key={h} style={{padding:"10px 8px",textAlign:"left",color:"rgba(255,255,255,0.5)",fontWeight:600}}>{h}</th>))}</tr></thead><tbody>{fWeeks.map(w=>{const st=w.occ>=55?"green":w.occ>=25?"amber":"red";return(<tr key={w.w} style={{borderBottom:"1px solid rgba(255,255,255,0.05)"}}><td style={{padding:"10px 8px",fontWeight:600,color:"#fff"}}>W{w.w}</td><td style={{padding:"10px 8px",color:"rgba(255,255,255,0.6)"}}>{w.ws}</td><td style={{padding:"10px 8px",color:"#fff"}}>{w.bk}</td><td style={{padding:"10px 8px",color:"#fff"}}>{fmtCHF(w.rev)}</td><td style={{padding:"10px 8px",color:"#fff"}}>{w.rn}</td><td style={{padding:"10px 8px",color:sc[st],fontWeight:600}}>{w.occ}%</td><td style={{padding:"10px 8px",color:"rgba(255,255,255,0.6)"}}>{w.los}</td></tr>);})}{(()=>{const tBk=fWeeks.reduce((a,w)=>a+w.bk,0);const tRev=fWeeks.reduce((a,w)=>a+w.rev,0);const tRn=fWeeks.reduce((a,w)=>a+w.rn,0);const tLos=fWeeks.length>0?fWeeks.reduce((a,w)=>a+w.los*w.bk,0)/tBk:0;return(<tr style={{borderTop:"2px solid rgba(255,255,255,0.15)",fontWeight:700}}><td style={{padding:"10px 8px",color:"#fff",fontWeight:700}}>TOTAL</td><td style={{padding:"10px 8px"}}></td><td style={{padding:"10px 8px",color:"#fff",fontWeight:700}}>{tBk}</td><td style={{padding:"10px 8px",color:"#fff",fontWeight:700}}>{fmtCHF(tRev)}</td><td style={{padding:"10px 8px",color:"#fff",fontWeight:700}}>{tRn}</td><td style={{padding:"10px 8px"}}></td><td style={{padding:"10px 8px",color:"rgba(255,255,255,0.6)"}}>{tLos.toFixed(1)}</td></tr>);})()}</tbody></table></div>
</div>)}

{/* MONTHLY */}
{tab==="monthly"&&(<div>
<MonthPicker from={from} to={to} setFrom={setFrom} setTo={setTo}/>
<STitle sub={periodLabel}>{"\ud83d\udcc6"} Monthly Detail</STitle>
<h3 style={{fontSize:14,fontWeight:600,color:"rgba(255,255,255,0.7)",marginBottom:8}}>Occupancy (%)</h3>
<div style={{background:"rgba(255,255,255,0.03)",borderRadius:12,padding:"16px 8px 8px",marginBottom:24}}><ResponsiveContainer width="100%" height={220}><BarChart data={occC}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)"/><XAxis dataKey="name" tick={{fill:"rgba(255,255,255,0.5)",fontSize:11}}/><YAxis tick={{fill:"rgba(255,255,255,0.5)",fontSize:11}} unit="%"/><Tooltip content={<CTip/>}/><Legend wrapperStyle={{fontSize:11}}/><Bar dataKey="2026" fill="#6366f1" radius={[4,4,0,0]}/><Bar dataKey="2025" fill="rgba(255,255,255,0.15)" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer></div>
<h3 style={{fontSize:14,fontWeight:600,color:"rgba(255,255,255,0.7)",marginBottom:8}}>ADR (CHF)</h3>
<div style={{background:"rgba(255,255,255,0.03)",borderRadius:12,padding:"16px 8px 8px",marginBottom:24}}><ResponsiveContainer width="100%" height={220}><LineChart data={adrC}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)"/><XAxis dataKey="name" tick={{fill:"rgba(255,255,255,0.5)",fontSize:11}}/><YAxis tick={{fill:"rgba(255,255,255,0.5)",fontSize:11}}/><Tooltip content={<CTip/>}/><Legend wrapperStyle={{fontSize:11}}/><Line dataKey="2026" stroke="#6366f1" strokeWidth={2.5} dot={{r:4,fill:"#6366f1"}}/><Line dataKey="2025" stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} dot={{r:3}} strokeDasharray="4 4"/></LineChart></ResponsiveContainer></div>
<div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}><thead><tr style={{borderBottom:"1px solid rgba(255,255,255,0.1)"}}>{["Month","Revenue","Budget","Occ","ADR","RevPAR","RN","Bk","LOS","Lead"].map(h=>(<th key={h} style={{padding:"8px 6px",textAlign:"left",color:"rgba(255,255,255,0.5)",fontWeight:600,whiteSpace:"nowrap"}}>{h}</th>))}</tr></thead><tbody>{M26.filter(m=>m.m>=from&&m.m<=to).map(m=>(<tr key={m.m} style={{borderBottom:"1px solid rgba(255,255,255,0.05)"}}><td style={{padding:"8px 6px",fontWeight:600,color:"#fff"}}>{MONTHS[m.m-1]}</td><td style={{padding:"8px 6px",color:"#fff"}}>{fmtCHF(m.rev)}</td><td style={{padding:"8px 6px",color:"rgba(255,255,255,0.4)"}}>{fmtCHF(m.bud)}</td><td style={{padding:"8px 6px",color:sc[cs(m.occ,M25[m.m-1].occ)],fontWeight:600}}>{m.occ}%</td><td style={{padding:"8px 6px",color:"#fff"}}>CHF {m.adr.toFixed(0)}</td><td style={{padding:"8px 6px",color:"#fff"}}>CHF {m.rpar.toFixed(0)}</td><td style={{padding:"8px 6px",color:"#fff"}}>{m.rn}</td><td style={{padding:"8px 6px",color:"#fff"}}>{m.bk}</td><td style={{padding:"8px 6px",color:"rgba(255,255,255,0.6)"}}>{m.los}</td><td style={{padding:"8px 6px",color:"rgba(255,255,255,0.6)"}}>{m.lead}d</td></tr>))}{(()=>{const fM=M26.filter(m=>m.m>=from&&m.m<=to);const tRev=fM.reduce((a,m)=>a+m.rev,0);const tBud=fM.reduce((a,m)=>a+m.bud,0);const tRn=fM.reduce((a,m)=>a+m.rn,0);const tArn=fM.reduce((a,m)=>a+m.arn,0);const tBk=fM.reduce((a,m)=>a+m.bk,0);return(<tr style={{borderTop:"2px solid rgba(255,255,255,0.15)",fontWeight:700}}><td style={{padding:"8px 6px",color:"#fff",fontWeight:700}}>TOTAL</td><td style={{padding:"8px 6px",color:"#fff",fontWeight:700}}>{fmtCHF(tRev)}</td><td style={{padding:"8px 6px",color:"rgba(255,255,255,0.4)",fontWeight:700}}>{fmtCHF(tBud)}</td><td style={{padding:"8px 6px",color:"#fff",fontWeight:700}}>{tArn>0?(tRn/tArn*100).toFixed(1):"0"}%</td><td style={{padding:"8px 6px",color:"#fff",fontWeight:700}}>CHF {tRn>0?(tRev/tRn).toFixed(0):"0"}</td><td style={{padding:"8px 6px",color:"#fff",fontWeight:700}}>CHF {tArn>0?(tRev/tArn).toFixed(0):"0"}</td><td style={{padding:"8px 6px",color:"#fff",fontWeight:700}}>{tRn}</td><td style={{padding:"8px 6px",color:"#fff",fontWeight:700}}>{tBk}</td><td style={{padding:"8px 6px"}}></td><td style={{padding:"8px 6px"}}></td></tr>);})()}</tbody></table></div>
</div>)}

{/* CHANNELS */}
{tab==="channels"&&(<div>
<MonthPicker from={from} to={to} setFrom={setFrom} setTo={setTo}/>
<STitle sub={"2026 OTB — "+periodLabel}>{"\ud83d\udce1"} Channels</STitle>
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:20,marginBottom:24}}>
<div style={{background:"rgba(255,255,255,0.03)",borderRadius:12,padding:16}}><h3 style={{fontSize:13,fontWeight:600,color:"rgba(255,255,255,0.7)",margin:"0 0 12px"}}>Revenue by Channel</h3><ResponsiveContainer width="100%" height={220}><PieChart><Pie data={fSrc} dataKey="rev" nameKey="source" cx="50%" cy="50%" outerRadius={80} label={({source,percent})=>source+" "+(percent*100).toFixed(0)+"%"} labelLine={false} style={{fontSize:10}}>{fSrc.map((_,i)=><Cell key={i} fill={CC[i%CC.length]}/>)}</Pie><Tooltip formatter={v=>fmtCHF(v)}/></PieChart></ResponsiveContainer></div>
<div style={{background:"rgba(255,255,255,0.03)",borderRadius:12,padding:16}}><h3 style={{fontSize:13,fontWeight:600,color:"rgba(255,255,255,0.7)",margin:"0 0 12px"}}>Channel Detail</h3><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}><thead><tr style={{borderBottom:"1px solid rgba(255,255,255,0.1)"}}>{["Source","Bk","Revenue","RN","Share"].map(h=>(<th key={h} style={{padding:"8px 6px",textAlign:"left",color:"rgba(255,255,255,0.5)",fontWeight:600}}>{h}</th>))}</tr></thead><tbody>{(()=>{const fSrcTotal=fSrc.reduce((a,c)=>a+c.rev,0);return fSrc.map((ch,i)=>(<tr key={i} style={{borderBottom:"1px solid rgba(255,255,255,0.05)"}}><td style={{padding:"8px 6px",color:"#fff",fontWeight:600,display:"flex",alignItems:"center",gap:6}}><span style={{width:8,height:8,borderRadius:2,background:CC[i],display:"inline-block"}}/>{ch.source}</td><td style={{padding:"8px 6px",color:"#fff"}}>{ch.bk}</td><td style={{padding:"8px 6px",color:"#fff"}}>{fmtCHF(ch.rev)}</td><td style={{padding:"8px 6px",color:"#fff"}}>{ch.rn}</td><td style={{padding:"8px 6px",color:"rgba(255,255,255,0.6)"}}>{fSrcTotal>0?(ch.rev/fSrcTotal*100).toFixed(1):"0"}%</td></tr>))})()}{(()=>{const tBk=fSrc.reduce((a,c)=>a+c.bk,0);const tRev=fSrc.reduce((a,c)=>a+c.rev,0);const tRn=fSrc.reduce((a,c)=>a+c.rn,0);return(<tr style={{borderTop:"2px solid rgba(255,255,255,0.15)",fontWeight:700}}><td style={{padding:"8px 6px",color:"#fff",fontWeight:700}}>TOTAL</td><td style={{padding:"8px 6px",color:"#fff",fontWeight:700}}>{tBk}</td><td style={{padding:"8px 6px",color:"#fff",fontWeight:700}}>{fmtCHF(tRev)}</td><td style={{padding:"8px 6px",color:"#fff",fontWeight:700}}>{tRn}</td><td style={{padding:"8px 6px",color:"#fff",fontWeight:700}}>100%</td></tr>);})()}</tbody></table></div>
</div>
<STitle sub={"2026 OTB by apartment — "+periodLabel}>{"\ud83c\udfe0"} Rooms</STitle>
<div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}><thead><tr style={{borderBottom:"1px solid rgba(255,255,255,0.1)"}}>{["Room","Bk","Revenue","RN","ADR","LOS","Lead"].map(h=>(<th key={h} style={{padding:"10px 8px",textAlign:"left",color:"rgba(255,255,255,0.5)",fontWeight:600,whiteSpace:"nowrap"}}>{h}</th>))}</tr></thead><tbody>{fRm.map((r,i)=>{const adr=r.rn>0?r.rev/r.rn:0;return(<tr key={i} style={{borderBottom:"1px solid rgba(255,255,255,0.05)"}}><td style={{padding:"10px 8px",color:"#fff",fontWeight:600}}>{r.room}</td><td style={{padding:"10px 8px",color:"#fff"}}>{r.bk}</td><td style={{padding:"10px 8px",color:"#fff"}}>{fmtCHF(r.rev)}</td><td style={{padding:"10px 8px",color:"#fff"}}>{r.rn}</td><td style={{padding:"10px 8px",color:"#fff"}}>CHF {adr.toFixed(0)}</td><td style={{padding:"10px 8px",color:"rgba(255,255,255,0.6)"}}>{r.los.toFixed(1)}</td><td style={{padding:"10px 8px",color:"rgba(255,255,255,0.6)"}}>{r.lead.toFixed(0)}d</td></tr>);})}{(()=>{const tBk=fRm.reduce((a,r)=>a+r.bk,0);const tRev=fRm.reduce((a,r)=>a+r.rev,0);const tRn=fRm.reduce((a,r)=>a+r.rn,0);return(<tr style={{borderTop:"2px solid rgba(255,255,255,0.15)",fontWeight:700}}><td style={{padding:"10px 8px",color:"#fff",fontWeight:700}}>TOTAL</td><td style={{padding:"10px 8px",color:"#fff",fontWeight:700}}>{tBk}</td><td style={{padding:"10px 8px",color:"#fff",fontWeight:700}}>{fmtCHF(tRev)}</td><td style={{padding:"10px 8px",color:"#fff",fontWeight:700}}>{tRn}</td><td style={{padding:"10px 8px",color:"#fff",fontWeight:700}}>CHF {tRn>0?(tRev/tRn).toFixed(0):"0"}</td><td style={{padding:"10px 8px"}}></td><td style={{padding:"10px 8px"}}></td></tr>);})()}</tbody></table></div>
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

{/* BOOKING PACE */}
{tab==="pace"&&(<div>
<STitle sub="Booking creation analysis — filter any date range">{"\ud83d\udcc8"} Booking Pace</STitle>

{/* Date filters */}
<div style={{display:"flex",gap:12,marginBottom:20,flexWrap:"wrap",alignItems:"center"}}>
<div style={{display:"flex",alignItems:"center",gap:6}}>
<span style={{color:"rgba(255,255,255,0.5)",fontSize:12}}>From:</span>
<input type="date" value={paceFrom} onChange={e=>setPaceFrom(e.target.value)} style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:8,padding:"6px 10px",color:"#fff",fontSize:13}}/>
</div>
<div style={{display:"flex",alignItems:"center",gap:6}}>
<span style={{color:"rgba(255,255,255,0.5)",fontSize:12}}>To:</span>
<input type="date" value={paceTo} onChange={e=>setPaceTo(e.target.value)} style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:8,padding:"6px 10px",color:"#fff",fontSize:13}}/>
</div>
{[["Last 7d",7],["Last 14d",14],["Last 30d",30],["Last 90d",90],["YTD",0]].map(([label,days])=>(<button key={label} onClick={()=>{const t=new Date("2026-07-28");const f=days>0?new Date(t-days*86400000):new Date("2026-01-01");setPaceFrom(f.toISOString().slice(0,10));setPaceTo(t.toISOString().slice(0,10));}} style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:8,padding:"6px 14px",color:"#fff",fontSize:12,cursor:"pointer"}}>{label}</button>))}
</div>

{/* KPI cards */}
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12,marginBottom:24}}>
<KPICard label="Bookings Created" value={fPace.bk26} sub={"STLY: "+fPace.bk25} pctLabel={fPace.bk25>0?fmtPct((fPace.bk26-fPace.bk25)/fPace.bk25*100):"N/A"} status={cs(fPace.bk26,fPace.bk25)}/>
<KPICard label="Revenue Generated" value={fmtCHF(fPace.rev26)} sub={"STLY: "+fmtCHF(fPace.rev25)} pctLabel={fPace.rev25>0?fmtPct((fPace.rev26-fPace.rev25)/fPace.rev25*100):"N/A"} status={cs(fPace.rev26,fPace.rev25)}/>
<KPICard label="Net (Bk - Canc)" value={fPace.bk26-fPace.cn26} sub={"Cancelled: "+fPace.cn26} pctLabel={fPace.bk26>0?(fPace.cn26/fPace.bk26*100).toFixed(0)+"%":"0%"} status={fPace.cn26/fPace.bk26>0.2?"red":"green"}/>
<KPICard label="Avg/Day" value={(fPace.days>0?(fPace.bk26/fPace.days).toFixed(1):"0")} sub={"Rev/day: "+fmtCHF(fPace.days>0?fPace.rev26/fPace.days:0)} pctLabel={fPace.rn26+" RN"} status="green"/>
</div>

{/* Channel breakdown */}
<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:12,marginBottom:24}}>
{[["Booking.com",fPace.bc,"#3b82f6"],["Direct",fPace.di,"#10b981"],["Airbnb",fPace.ab,"#f59e0b"],["Expedia",fPace.ex,"#8b5cf6"]].map(([name,val,col])=>(<div key={name} style={{background:"rgba(255,255,255,0.03)",borderRadius:12,padding:16,textAlign:"center"}}><div style={{fontSize:24,fontWeight:700,color:col}}>{val}</div><div style={{fontSize:11,color:"rgba(255,255,255,0.5)"}}>{name}</div><div style={{fontSize:11,color:"rgba(255,255,255,0.4)"}}>{fPace.bk26>0?(val/fPace.bk26*100).toFixed(0):"0"}%</div></div>))}
</div>

{/* Daily booking chart */}
<div style={{background:"rgba(255,255,255,0.03)",borderRadius:12,padding:"16px 8px 8px",marginBottom:24}}>
<h3 style={{fontSize:13,fontWeight:600,color:"rgba(255,255,255,0.7)",margin:"0 0 4px 8px"}}>Daily Bookings Created</h3>
<ResponsiveContainer width="100%" height={250}>
<BarChart data={fPace.daily}>
<CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)"/>
<XAxis dataKey="d" tick={{fill:"rgba(255,255,255,0.4)",fontSize:9}} interval={Math.max(0,Math.floor(fPace.daily.length/15))}/>
<YAxis tick={{fill:"rgba(255,255,255,0.5)",fontSize:11}}/>
<Tooltip content={<CTip/>}/>
<Bar dataKey="bk" name="Created" fill="#6366f1" radius={[2,2,0,0]}/>
<Bar dataKey="cn" name="Cancelled" fill="#ef4444" radius={[2,2,0,0]}/>
</BarChart>
</ResponsiveContainer>
</div>

{/* Monthly comparison (static, always full year) */}
<STitle sub="Monthly comparison — full year">{"\ud83d\udcca"} Monthly Pace vs STLY</STitle>
<div style={{background:"rgba(255,255,255,0.03)",borderRadius:12,padding:"16px 8px 8px",marginBottom:24}}>
<ResponsiveContainer width="100%" height={280}>
<BarChart data={PACE_M}>
<CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)"/>
<XAxis dataKey="mn" tick={{fill:"rgba(255,255,255,0.5)",fontSize:12}}/>
<YAxis tick={{fill:"rgba(255,255,255,0.5)",fontSize:11}}/>
<Tooltip content={<CTip/>}/><Legend wrapperStyle={{fontSize:11}}/>
<Bar dataKey="bk26" name="2026" fill="#6366f1" radius={[4,4,0,0]}/>
<Bar dataKey="bk25" name="2025" fill="rgba(255,255,255,0.2)" radius={[4,4,0,0]}/>
</BarChart>
</ResponsiveContainer>
</div>

{/* Cumulative curve */}
<div style={{background:"rgba(255,255,255,0.03)",borderRadius:12,padding:"16px 8px 8px",marginBottom:24}}>
<h3 style={{fontSize:13,fontWeight:600,color:"rgba(255,255,255,0.7)",margin:"0 0 4px 8px"}}>Cumulative Bookings — 2026 vs 2025</h3>
<ResponsiveContainer width="100%" height={250}>
<LineChart data={PACE_M.map((p,i)=>({mn:p.mn,cum26:PACE_M.slice(0,i+1).reduce((a,x)=>a+x.bk26,0),cum25:PACE_M.slice(0,i+1).reduce((a,x)=>a+x.bk25,0)}))}>
<CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)"/>
<XAxis dataKey="mn" tick={{fill:"rgba(255,255,255,0.5)",fontSize:12}}/>
<YAxis tick={{fill:"rgba(255,255,255,0.5)",fontSize:11}}/>
<Tooltip content={<CTip/>}/><Legend wrapperStyle={{fontSize:11}}/>
<Line type="monotone" dataKey="cum26" name="2026" stroke="#6366f1" strokeWidth={3} dot={{r:4}}/>
<Line type="monotone" dataKey="cum25" name="2025" stroke="rgba(255,255,255,0.3)" strokeWidth={2} strokeDasharray="5 5" dot={{r:3}}/>
</LineChart>
</ResponsiveContainer>
</div>
</div>)}

{/* APARTMENTS */}
{tab==="apartments"&&(<div>
<STitle sub={"2026 OTB vs 2025 Full Year — "+periodLabel}>{"\ud83c\udfe0"} Apartment Performance</STitle>

{/* Main comparison table */}
<div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
<thead><tr style={{borderBottom:"1px solid rgba(255,255,255,0.1)"}}>
{["Apartment","Rev 26","Rev 25","\u0394 Rev","\u0394%","RN 26","RN 25","ADR 26","ADR 25","\u0394 ADR","Occ 26","Bk 26"].map(h=>(<th key={h} style={{padding:"10px 8px",textAlign:"left",color:"rgba(255,255,255,0.5)",fontWeight:600,whiteSpace:"nowrap"}}>{h}</th>))}
</tr></thead>
<tbody>
{fRm.map((r,i)=>{
const r25=fRm25.find(x=>x.room===r.room)||{rev:0,rn:0,bk:0};
const dRev=r.rev-r25.rev;const dPct=r25.rev>0?(dRev/r25.rev*100):0;
const adr26=r.rn>0?r.rev/r.rn:0;const adr25=r25.rn>0?r25.rev/r25.rn:0;const dAdr=adr26-adr25;
const arn=M26.filter(m=>m.m>=from&&m.m<=to).reduce((a,m)=>a+m.arn/11,0);
const occ26=arn>0?r.rn/arn*100:0;
return(<tr key={i} style={{borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
<td style={{padding:"10px 8px",fontWeight:600,color:"#fff"}}>{r.room}</td>
<td style={{padding:"10px 8px",color:"#fff"}}>{fmtCHF(r.rev)}</td>
<td style={{padding:"10px 8px",color:"rgba(255,255,255,0.5)"}}>{fmtCHF(r25.rev)}</td>
<td style={{padding:"10px 8px",color:sc[cs(r.rev,r25.rev)],fontWeight:600}}>{dRev>=0?"+":""}{fmtCHF(dRev)}</td>
<td style={{padding:"10px 8px",color:sc[cs(r.rev,r25.rev)],fontWeight:600}}>{r25.rev>0?fmtPct(dPct):"N/A"}</td>
<td style={{padding:"10px 8px",color:"#fff"}}>{r.rn}</td>
<td style={{padding:"10px 8px",color:"rgba(255,255,255,0.5)"}}>{r25.rn}</td>
<td style={{padding:"10px 8px",color:"#fff"}}>CHF {adr26.toFixed(0)}</td>
<td style={{padding:"10px 8px",color:"rgba(255,255,255,0.5)"}}>CHF {adr25.toFixed(0)}</td>
<td style={{padding:"10px 8px",color:sc[cs(adr26,adr25)],fontWeight:600}}>{adr25>0?(dAdr>=0?"+":"")+dAdr.toFixed(0):"N/A"}</td>
<td style={{padding:"10px 8px",color:"#fff"}}>{occ26.toFixed(1)}%</td>
<td style={{padding:"10px 8px",color:"#fff"}}>{r.bk}</td>
</tr>);})}
{(()=>{const t26Rev=fRm.reduce((a,r)=>a+r.rev,0);const t25Rev=fRm25.reduce((a,r)=>a+r.rev,0);const t26Rn=fRm.reduce((a,r)=>a+r.rn,0);const t25Rn=fRm25.reduce((a,r)=>a+r.rn,0);const t26Bk=fRm.reduce((a,r)=>a+r.bk,0);const dRev=t26Rev-t25Rev;const dPct=t25Rev>0?dRev/t25Rev*100:0;const a26=t26Rn>0?t26Rev/t26Rn:0;const a25=t25Rn>0?t25Rev/t25Rn:0;const arn=M26.filter(m=>m.m>=from&&m.m<=to).reduce((a,m)=>a+m.arn,0);return(<tr style={{borderTop:"2px solid rgba(255,255,255,0.15)",fontWeight:700}}><td style={{padding:"10px 8px",color:"#fff",fontWeight:700}}>TOTAL</td><td style={{padding:"10px 8px",color:"#fff",fontWeight:700}}>{fmtCHF(t26Rev)}</td><td style={{padding:"10px 8px",color:"rgba(255,255,255,0.5)",fontWeight:700}}>{fmtCHF(t25Rev)}</td><td style={{padding:"10px 8px",color:sc[cs(t26Rev,t25Rev)],fontWeight:700}}>{dRev>=0?"+":""}{fmtCHF(dRev)}</td><td style={{padding:"10px 8px",color:sc[cs(t26Rev,t25Rev)],fontWeight:700}}>{fmtPct(dPct)}</td><td style={{padding:"10px 8px",color:"#fff",fontWeight:700}}>{t26Rn}</td><td style={{padding:"10px 8px",color:"rgba(255,255,255,0.5)",fontWeight:700}}>{t25Rn}</td><td style={{padding:"10px 8px",color:"#fff",fontWeight:700}}>CHF {a26.toFixed(0)}</td><td style={{padding:"10px 8px",color:"rgba(255,255,255,0.5)",fontWeight:700}}>CHF {a25.toFixed(0)}</td><td style={{padding:"10px 8px",color:sc[cs(a26,a25)],fontWeight:700}}>{(a26-a25>=0?"+":"")+(a26-a25).toFixed(0)}</td><td style={{padding:"10px 8px",color:"#fff",fontWeight:700}}>{arn>0?(t26Rn/arn*100).toFixed(1):"0"}%</td><td style={{padding:"10px 8px",color:"#fff",fontWeight:700}}>{t26Bk}</td></tr>);})()}
</tbody></table></div>

{/* Revenue bar chart per apartment */}
<STitle sub={"Revenue comparison — "+periodLabel}>{"\ud83d\udcca"} Revenue per Apartment</STitle>
<div style={{background:"rgba(255,255,255,0.03)",borderRadius:12,padding:"16px 8px 8px",marginBottom:24}}>
<ResponsiveContainer width="100%" height={350}>
<BarChart data={fRm.map(r=>{const r25=fRm25.find(x=>x.room===r.room);return{name:r.room.replace("Sup. ","").replace("Apt ","").replace("Studio ","S"),"2026":Math.round(r.rev),"2025":r25?Math.round(r25.rev):0};})}>
<CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)"/>
<XAxis dataKey="name" tick={{fill:"rgba(255,255,255,0.5)",fontSize:9}} angle={-35} textAnchor="end" height={80}/>
<YAxis tick={{fill:"rgba(255,255,255,0.5)",fontSize:11}}/>
<Tooltip content={<CTip/>}/><Legend wrapperStyle={{fontSize:11}}/>
<Bar dataKey="2026" fill="#6366f1" radius={[4,4,0,0]}/>
<Bar dataKey="2025" fill="rgba(255,255,255,0.2)" radius={[4,4,0,0]}/>
</BarChart>
</ResponsiveContainer>
</div>

{/* ADR comparison chart */}
<STitle sub={"ADR per apartment — "+periodLabel}>{"\ud83d\udcb0"} ADR Comparison</STitle>
<div style={{background:"rgba(255,255,255,0.03)",borderRadius:12,padding:"16px 8px 8px",marginBottom:24}}>
<ResponsiveContainer width="100%" height={300}>
<BarChart data={fRm.map(r=>{const r25=fRm25.find(x=>x.room===r.room);const a26=r.rn>0?Math.round(r.rev/r.rn):0;const a25=r25&&r25.rn>0?Math.round(r25.rev/r25.rn):0;return{name:r.room.replace("Sup. ","").replace("Apt ","").replace("Studio ","S"),"ADR 2026":a26,"ADR 2025":a25};})}>
<CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)"/>
<XAxis dataKey="name" tick={{fill:"rgba(255,255,255,0.5)",fontSize:9}} angle={-35} textAnchor="end" height={80}/>
<YAxis tick={{fill:"rgba(255,255,255,0.5)",fontSize:11}} domain={[0,250]}/>
<Tooltip content={<CTip/>}/><Legend wrapperStyle={{fontSize:11}}/>
<Bar dataKey="ADR 2026" fill="#6366f1" radius={[4,4,0,0]}/>
<Bar dataKey="ADR 2025" fill="rgba(255,255,255,0.2)" radius={[4,4,0,0]}/>
</BarChart>
</ResponsiveContainer>
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
<td style={{padding:"10px 8px",color:sc[cs(d.a26,d.a25)],fontWeight:600}}>{ok?"OK":"CHF -"+gap}</td>
<td style={{padding:"10px 8px",color:"#fff"}}>{d.rn}</td>
<td style={{padding:"10px 8px",color:sc[cs(d.a26,d.a25)],fontWeight:ok?400:600}}>{ok?"\u2014":"CHF -"+revGap.toLocaleString("de-CH")}</td>
<td style={{padding:"10px 8px",color:ok?"rgba(255,255,255,0.4)":"#fff",fontWeight:ok?400:700}}>{ok?"\u2014":"+"+extra}</td>
<td style={{padding:"10px 8px",color:ok?"rgba(255,255,255,0.4)":"#fff"}}>{ok?"\u2014":"~+"+extraBk}</td>
<td style={{padding:"10px 8px"}}>{ok?<span style={{color:sc.green,fontWeight:600}}>🟢 OK</span>:gap>d.a25*0.03?<span style={{color:sc.red,fontWeight:600}}>🔴 Critico</span>:<span style={{color:sc.amber,fontWeight:600}}>🟡 Neutro</span>}</td>
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
<td style={{padding:"10px 8px",color:sc[cs(d.a26,d.a25)],fontWeight:600}}>CHF {gap>0?"+":""}{gap}</td>
<td style={{padding:"10px 8px",color:"#fff"}}>{d.rn}</td>
<td style={{padding:"10px 8px",color:sc[cs(d.a26,d.a25)],fontWeight:600}}>CHF {impact>0?"+":""}{impact.toLocaleString("de-CH")}</td>
<td style={{padding:"10px 8px"}}>{cs(d.a26,d.a25)==="green"?<span style={{color:sc.green}}>🟢</span>:cs(d.a26,d.a25)==="red"?<span style={{color:sc.red}}>🔴</span>:<span style={{color:sc.amber}}>🟡</span>}</td>
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
<div style={{marginTop:48,paddingTop:20,borderTop:"1px solid rgba(255,255,255,0.06)",textAlign:"center"}}><p style={{fontSize:11,color:"rgba(255,255,255,0.25)",margin:0}}>Residenza Motta — July 28, 2026 — 11 Units — Locarno, Ticino</p><p style={{fontSize:10,color:"rgba(255,255,255,0.15)",margin:"6px 0 0"}}>Confirmed + modified only · OTB: 2025 bookings created on or before 28.07.2025 only · Budget from 2026 Business Plan · Direct = Amenitiz + Manual bookings</p></div>
</div>);}
