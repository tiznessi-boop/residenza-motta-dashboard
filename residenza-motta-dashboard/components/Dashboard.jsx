"use client";
import { useState, useMemo } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, ComposedChart, Area, Cell, PieChart, Pie } from "recharts";

// ========== DATA ==========
const DATA = {
  summary: {
    snapshot_date: "2026-03-13",
    num_units: 11,
    year_2025: { total_bookings: 373, total_revenue: 238994.86, total_room_nights: 1470, available_room_nights: 4015, occupancy: 36.6, adr: 162.58, revpar: 59.53, avg_los: 3.8, avg_lead_time: 46.2, cancellation_rate: 14.1 },
    year_2026_otb: { total_bookings: 164, total_revenue: 96802.55, total_room_nights: 670, available_room_nights: 4015, occupancy: 16.7, adr: 144.48, revpar: 24.11, avg_los: 4.0, avg_lead_time: 94.0, cancellation_rate: 17.2 },
    otb_vs_ly: { otb_2026_revenue: 96802.55, otb_2025_revenue: 84490.14, delta_revenue: 12312.41, delta_pct: 14.6, otb_2026_rn: 670, otb_2025_rn: 545 },
    budget_fy: 286306.14
  },
  months_2025: [
    { month: 1, bookings: 11, revenue: 5330.64, room_nights: 34, available_rn: 341, occupancy: 10.0, adr: 156.78, revpar: 15.63, avg_los: 2.7, avg_lead_time: 6.7, budget: 8000 },
    { month: 2, bookings: 25, revenue: 8323.83, room_nights: 92, available_rn: 308, occupancy: 29.9, adr: 90.48, revpar: 27.03, avg_los: 3.7, avg_lead_time: 8.2, budget: 10135.18 },
    { month: 3, bookings: 27, revenue: 16653.09, room_nights: 120, available_rn: 341, occupancy: 35.2, adr: 138.78, revpar: 48.84, avg_los: 4.2, avg_lead_time: 24.5, budget: 20846.19 },
    { month: 4, bookings: 40, revenue: 25972.75, room_nights: 166, available_rn: 330, occupancy: 50.3, adr: 156.46, revpar: 78.71, avg_los: 4.2, avg_lead_time: 33.2, budget: 33756.04 },
    { month: 5, bookings: 41, revenue: 22148.41, room_nights: 152, available_rn: 341, occupancy: 44.6, adr: 145.71, revpar: 64.95, avg_los: 3.5, avg_lead_time: 43.9, budget: 27534.92 },
    { month: 6, bookings: 41, revenue: 31845.14, room_nights: 161, available_rn: 330, occupancy: 48.8, adr: 197.80, revpar: 96.50, avg_los: 3.8, avg_lead_time: 53.3, budget: 33572.64 },
    { month: 7, bookings: 60, revenue: 36706.15, room_nights: 213, available_rn: 341, occupancy: 62.5, adr: 172.33, revpar: 107.64, avg_los: 3.5, avg_lead_time: 80.1, budget: 48258.68 },
    { month: 8, bookings: 30, revenue: 37807.90, room_nights: 138, available_rn: 341, occupancy: 40.5, adr: 273.97, revpar: 110.87, avg_los: 4.6, avg_lead_time: 88.4, budget: 37898.91 },
    { month: 9, bookings: 30, revenue: 19680.65, room_nights: 125, available_rn: 330, occupancy: 37.9, adr: 157.45, revpar: 59.64, avg_los: 3.7, avg_lead_time: 21.7, budget: 23202.56 },
    { month: 10, bookings: 49, revenue: 24558.73, room_nights: 201, available_rn: 341, occupancy: 58.9, adr: 122.18, revpar: 72.02, avg_los: 4.0, avg_lead_time: 42.7, budget: 29649.73 },
    { month: 11, bookings: 5, revenue: 1260.84, room_nights: 15, available_rn: 330, occupancy: 4.5, adr: 84.06, revpar: 3.82, avg_los: 3.0, avg_lead_time: 10.4, budget: 5235.86 },
    { month: 12, bookings: 14, revenue: 8706.73, room_nights: 53, available_rn: 341, occupancy: 15.5, adr: 164.28, revpar: 25.53, avg_los: 3.8, avg_lead_time: 52.4, budget: 8215.43 }
  ],
  months_2026: [
    { month: 1, bookings: 2, revenue: 491.25, room_nights: 6, available_rn: 341, occupancy: 1.8, adr: 81.88, revpar: 1.44, avg_los: 3.0, avg_lead_time: 2.0, budget: 8000 },
    { month: 2, bookings: 26, revenue: 8942.03, room_nights: 87, available_rn: 308, occupancy: 28.2, adr: 102.78, revpar: 29.03, avg_los: 3.3, avg_lead_time: 11.5, budget: 10135.18 },
    { month: 3, bookings: 31, revenue: 11695.46, room_nights: 118, available_rn: 341, occupancy: 34.6, adr: 99.11, revpar: 34.30, avg_los: 3.8, avg_lead_time: 22.1, budget: 20846.19 },
    { month: 4, bookings: 27, revenue: 17301.10, room_nights: 118, available_rn: 330, occupancy: 35.8, adr: 146.62, revpar: 52.43, avg_los: 4.3, avg_lead_time: 61.2, budget: 33756.04 },
    { month: 5, bookings: 21, revenue: 11504.70, room_nights: 83, available_rn: 341, occupancy: 24.3, adr: 138.61, revpar: 33.74, avg_los: 4.0, avg_lead_time: 84.9, budget: 27534.92 },
    { month: 6, bookings: 13, revenue: 10233.51, room_nights: 66, available_rn: 330, occupancy: 20.0, adr: 155.05, revpar: 31.01, avg_los: 4.2, avg_lead_time: 135.9, budget: 33572.64 },
    { month: 7, bookings: 31, revenue: 27876.13, room_nights: 135, available_rn: 341, occupancy: 39.6, adr: 206.49, revpar: 81.75, avg_los: 4.1, avg_lead_time: 196.1, budget: 48258.68 },
    { month: 8, bookings: 5, revenue: 5243.55, room_nights: 33, available_rn: 341, occupancy: 9.7, adr: 158.90, revpar: 15.38, avg_los: 6.6, avg_lead_time: 226.8, budget: 37898.91 },
    { month: 9, bookings: 6, revenue: 2087.62, room_nights: 15, available_rn: 330, occupancy: 4.5, adr: 139.17, revpar: 6.33, avg_los: 2.5, avg_lead_time: 228.3, budget: 23202.56 },
    { month: 10, bookings: 1, revenue: 577.20, room_nights: 3, available_rn: 341, occupancy: 0.9, adr: 192.40, revpar: 1.69, avg_los: 3.0, avg_lead_time: 293.0, budget: 29649.73 },
    { month: 11, bookings: 0, revenue: 0, room_nights: 0, available_rn: 330, occupancy: 0, adr: 0, revpar: 0, avg_los: 0, avg_lead_time: 0, budget: 5235.86 },
    { month: 12, bookings: 1, revenue: 850.00, room_nights: 6, available_rn: 341, occupancy: 1.8, adr: 141.67, revpar: 2.49, avg_los: 6.0, avg_lead_time: 351.0, budget: 8215.43 }
  ],
  otb_comparison: [
    { month: 1, otb_2025_revenue: 5330.64, otb_2025_rn: 34, otb_2025_bk: 11, otb_2026_revenue: 491.25, otb_2026_rn: 6, otb_2026_bk: 2, delta: -4839.39, delta_pct: -90.8 },
    { month: 2, otb_2025_revenue: 8323.83, otb_2025_rn: 92, otb_2025_bk: 25, otb_2026_revenue: 8942.03, otb_2026_rn: 87, otb_2026_bk: 26, delta: 618.20, delta_pct: 7.4 },
    { month: 3, otb_2025_revenue: 12688.40, otb_2025_rn: 88, otb_2025_bk: 18, otb_2026_revenue: 11695.46, otb_2026_rn: 118, otb_2026_bk: 31, delta: -992.94, delta_pct: -7.8 },
    { month: 4, otb_2025_revenue: 12067.03, otb_2025_rn: 68, otb_2025_bk: 16, otb_2026_revenue: 17301.10, otb_2026_rn: 118, otb_2026_bk: 27, delta: 5234.07, delta_pct: 43.4 },
    { month: 5, otb_2025_revenue: 11203.54, otb_2025_rn: 69, otb_2025_bk: 15, otb_2026_revenue: 11504.70, otb_2026_rn: 83, otb_2026_bk: 21, delta: 301.16, delta_pct: 2.7 },
    { month: 6, otb_2025_revenue: 3630.57, otb_2025_rn: 24, otb_2025_bk: 6, otb_2026_revenue: 10233.51, otb_2026_rn: 66, otb_2026_bk: 13, delta: 6602.94, delta_pct: 181.9 },
    { month: 7, otb_2025_revenue: 13983.22, otb_2025_rn: 80, otb_2025_bk: 18, otb_2026_revenue: 27876.13, otb_2026_rn: 135, otb_2026_bk: 31, delta: 13892.91, delta_pct: 99.4 },
    { month: 8, otb_2025_revenue: 15941.24, otb_2025_rn: 83, otb_2025_bk: 11, otb_2026_revenue: 5243.55, otb_2026_rn: 33, otb_2026_bk: 5, delta: -10697.69, delta_pct: -67.1 },
    { month: 9, otb_2025_revenue: 0, otb_2025_rn: 0, otb_2025_bk: 0, otb_2026_revenue: 2087.62, otb_2026_rn: 15, otb_2026_bk: 6, delta: 2087.62, delta_pct: 0 },
    { month: 10, otb_2025_revenue: 1321.67, otb_2025_rn: 7, otb_2025_bk: 1, otb_2026_revenue: 577.20, otb_2026_rn: 3, otb_2026_bk: 1, delta: -744.47, delta_pct: -56.3 },
    { month: 11, otb_2025_revenue: 0, otb_2025_rn: 0, otb_2025_bk: 0, otb_2026_revenue: 0, otb_2026_rn: 0, otb_2026_bk: 0, delta: 0, delta_pct: 0 },
    { month: 12, otb_2025_revenue: 0, otb_2025_rn: 0, otb_2025_bk: 0, otb_2026_revenue: 850.00, otb_2026_rn: 6, otb_2026_bk: 1, delta: 850.00, delta_pct: 0 }
  ],
  weeks_2026: [
    { week: 4, ws: "19 Jan", bookings: 1, revenue: 333.75, rn: 4, los: 4.0, occ: 5.2 },
    { week: 5, ws: "26 Jan", bookings: 1, revenue: 157.50, rn: 2, los: 2.0, occ: 2.6 },
    { week: 6, ws: "02 Feb", bookings: 5, revenue: 1244.89, rn: 14, los: 2.8, occ: 18.2 },
    { week: 7, ws: "09 Feb", bookings: 4, revenue: 1092.67, rn: 14, los: 3.5, occ: 18.2 },
    { week: 8, ws: "16 Feb", bookings: 15, revenue: 5263.94, rn: 45, los: 3.0, occ: 58.4 },
    { week: 9, ws: "23 Feb", bookings: 2, revenue: 1340.53, rn: 14, los: 7.0, occ: 18.2 },
    { week: 10, ws: "02 Mar", bookings: 8, revenue: 2113.15, rn: 24, los: 3.0, occ: 31.2 },
    { week: 11, ws: "09 Mar", bookings: 6, revenue: 2019.96, rn: 22, los: 3.7, occ: 28.6 },
    { week: 12, ws: "16 Mar", bookings: 11, revenue: 4359.73, rn: 47, los: 4.3, occ: 61.0 },
    { week: 13, ws: "23 Mar", bookings: 6, revenue: 3202.62, rn: 25, los: 4.2, occ: 32.5 },
    { week: 14, ws: "30 Mar", bookings: 2, revenue: 1149.83, rn: 7, los: 3.5, occ: 9.1 },
    { week: 15, ws: "06 Apr", bookings: 12, revenue: 7243.86, rn: 48, los: 4.0, occ: 62.3 },
    { week: 16, ws: "13 Apr", bookings: 3, revenue: 1678.31, rn: 14, los: 4.7, occ: 18.2 },
    { week: 17, ws: "20 Apr", bookings: 4, revenue: 2515.20, rn: 18, los: 4.5, occ: 23.4 },
    { week: 18, ws: "27 Apr", bookings: 9, revenue: 6891.02, rn: 49, los: 5.1, occ: 63.6 },
    { week: 20, ws: "11 May", bookings: 7, revenue: 3616.78, rn: 23, los: 3.3, occ: 29.9 },
    { week: 21, ws: "18 May", bookings: 5, revenue: 2313.89, rn: 16, los: 3.2, occ: 20.8 },
    { week: 22, ws: "25 May", bookings: 6, revenue: 3396.91, rn: 26, los: 4.3, occ: 33.8 },
    { week: 23, ws: "01 Jun", bookings: 1, revenue: 977.15, rn: 7, los: 7.0, occ: 9.1 },
    { week: 24, ws: "08 Jun", bookings: 1, revenue: 709.06, rn: 4, los: 4.0, occ: 5.2 },
    { week: 25, ws: "15 Jun", bookings: 4, revenue: 4529.84, rn: 28, los: 4.8, occ: 36.4 },
    { week: 26, ws: "22 Jun", bookings: 6, revenue: 3531.94, rn: 24, los: 3.5, occ: 31.2 },
    { week: 27, ws: "29 Jun", bookings: 1, revenue: 485.52, rn: 3, los: 3.0, occ: 3.9 },
    { week: 28, ws: "06 Jul", bookings: 10, revenue: 7106.42, rn: 29, los: 2.9, occ: 37.7 },
    { week: 29, ws: "13 Jul", bookings: 15, revenue: 14948.25, rn: 66, los: 4.4, occ: 85.7 },
    { week: 30, ws: "20 Jul", bookings: 5, revenue: 5211.81, rn: 36, los: 5.8, occ: 46.8 },
    { week: 31, ws: "27 Jul", bookings: 2, revenue: 1109.73, rn: 7, los: 3.5, occ: 9.1 },
    { week: 32, ws: "03 Aug", bookings: 1, revenue: 2260.00, rn: 11, los: 11.0, occ: 14.3 },
    { week: 34, ws: "17 Aug", bookings: 1, revenue: 967.85, rn: 7, los: 7.0, occ: 9.1 },
    { week: 35, ws: "24 Aug", bookings: 2, revenue: 1515.62, rn: 12, los: 6.0, occ: 15.6 },
    { week: 36, ws: "31 Aug", bookings: 2, revenue: 473.05, rn: 3, los: 1.5, occ: 3.9 },
    { week: 37, ws: "07 Sep", bookings: 1, revenue: 356.76, rn: 3, los: 3.0, occ: 3.9 },
    { week: 38, ws: "14 Sep", bookings: 1, revenue: 621.77, rn: 4, los: 4.0, occ: 5.2 },
    { week: 39, ws: "21 Sep", bookings: 1, revenue: 209.44, rn: 2, los: 2.0, occ: 2.6 },
    { week: 40, ws: "28 Sep", bookings: 1, revenue: 426.60, rn: 3, los: 3.0, occ: 3.9 },
    { week: 41, ws: "05 Oct", bookings: 1, revenue: 577.20, rn: 3, los: 3.0, occ: 3.9 },
    { week: 52, ws: "21 Dec", bookings: 1, revenue: 850.00, rn: 6, los: 6.0, occ: 7.8 }
  ],
  sources_2025: [
    { source: "Booking.com", bookings: 232, revenue: 121869.78, rn: 827 },
    { source: "Prenotazione Manuale", bookings: 61, revenue: 69354.85, rn: 315 },
    { source: "Amenitiz", bookings: 53, revenue: 33306.43, rn: 229 },
    { source: "Airbnb", bookings: 20, revenue: 8969.04, rn: 72 },
    { source: "Expedia", bookings: 6, revenue: 5126.34, rn: 25 },
    { source: "Ebookers", bookings: 1, revenue: 368.42, rn: 2 }
  ],
  sources_2026: [
    { source: "Booking.com", bookings: 128, revenue: 72609.38, rn: 501 },
    { source: "Amenitiz", bookings: 14, revenue: 7768.85, rn: 58 },
    { source: "Prenotazione Manuale", bookings: 11, revenue: 10679.25, rn: 71 },
    { source: "Airbnb", bookings: 10, revenue: 4157.47, rn: 33 },
    { source: "Expedia", bookings: 1, revenue: 1587.60, rn: 7 }
  ],
  rooms_2026: [
    { room: "Superior 2-Rooms Apt N°4", bookings: 18, revenue: 13836.75, rn: 75, los: 4.17, lead: 126.6 },
    { room: "Sup. 2-Rooms Penthouse N°18", bookings: 17, revenue: 13640.01, rn: 85, los: 4.47, lead: 96.1 },
    { room: "Studio N°12", bookings: 25, revenue: 10052.52, rn: 90, los: 3.60, lead: 99.0 },
    { room: "2-Rooms Apartment N°17", bookings: 13, revenue: 9888.20, rn: 62, los: 4.23, lead: 85.0 },
    { room: "Studio N°7", bookings: 16, revenue: 9890.95, rn: 75, los: 4.69, lead: 120.0 },
    { room: "Sup. 1-Room Apt N°9", bookings: 14, revenue: 9459.49, rn: 71, los: 4.86, lead: 71.9 },
    { room: "Sunny Nr. 3", bookings: 13, revenue: 8326.47, rn: 47, los: 3.62, lead: 110.2 },
    { room: "Charming Nr 15", bookings: 17, revenue: 6142.50, rn: 52, los: 3.06, lead: 80.2 },
    { room: "Studio N°8", bookings: 13, revenue: 6080.55, rn: 44, los: 3.38, lead: 74.0 },
    { room: "2-Rooms Apartment N°10", bookings: 9, revenue: 5878.52, rn: 37, los: 4.11, lead: 85.6 },
    { room: "Cozy Studio Nr. 1", bookings: 9, revenue: 3606.59, rn: 32, los: 3.22, lead: 52.1 }
  ]
};

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const fmt = (n) => n >= 1000 ? `${(n/1000).toFixed(1)}k` : n.toFixed(0);
const fmtCHF = (n) => `CHF ${n.toLocaleString("de-CH", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
const fmtPct = (n) => `${n > 0 ? "+" : ""}${n.toFixed(1)}%`;

// Status logic
const getStatus = (val, green, amber) => {
  if (typeof green === "function") return green(val);
  if (val >= green) return "green";
  if (val >= amber) return "amber";
  return "red";
};

const statusColors = { green: "#10b981", amber: "#f59e0b", red: "#ef4444" };
const statusBg = { green: "rgba(16,185,129,0.12)", amber: "rgba(245,158,11,0.12)", red: "rgba(239,68,68,0.12)" };
const statusIcon = { green: "●", amber: "●", red: "●" };

// ========== COMPONENTS ==========
const KPICard = ({ label, value, subtitle, status, small }) => (
  <div style={{
    background: statusBg[status] || "rgba(255,255,255,0.04)",
    border: `1px solid ${statusColors[status] || "rgba(255,255,255,0.08)"}`,
    borderRadius: 12, padding: small ? "14px 16px" : "20px 24px",
    display: "flex", flexDirection: "column", gap: 4, minWidth: 0
  }}>
    <div style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
    <div style={{ fontSize: small ? 22 : 28, fontWeight: 700, color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>{value}</div>
    {subtitle && <div style={{ fontSize: 12, color: statusColors[status] || "rgba(255,255,255,0.5)", fontWeight: 600 }}>
      {status === "green" ? "▲ " : status === "red" ? "▼ " : "● "}{subtitle}
    </div>}
  </div>
);

const Tab = ({ active, children, onClick }) => (
  <button onClick={onClick} style={{
    padding: "10px 20px", borderRadius: 8, border: "none",
    background: active ? "rgba(255,255,255,0.12)" : "transparent",
    color: active ? "#fff" : "rgba(255,255,255,0.5)",
    fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "all 0.2s",
    fontFamily: "'DM Sans', sans-serif"
  }}>{children}</button>
);

const SectionTitle = ({ children, sub }) => (
  <div style={{ marginBottom: 16, marginTop: 32 }}>
    <h2 style={{ fontSize: 18, fontWeight: 700, color: "#fff", margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{children}</h2>
    {sub && <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: "4px 0 0 0" }}>{sub}</p>}
  </div>
);

const AlertCard = ({ severity, title, detail }) => (
  <div style={{
    background: statusBg[severity], border: `1px solid ${statusColors[severity]}40`,
    borderRadius: 10, padding: "14px 18px", display: "flex", gap: 12, alignItems: "flex-start"
  }}>
    <span style={{ fontSize: 20, color: statusColors[severity], lineHeight: 1 }}>{severity === "red" ? "🔴" : "🟡"}</span>
    <div>
      <div style={{ fontWeight: 700, color: "#fff", fontSize: 13, marginBottom: 2 }}>{title}</div>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>{detail}</div>
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null;
  return (
    <div style={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, padding: "10px 14px", fontSize: 12 }}>
      <div style={{ fontWeight: 700, color: "#fff", marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, marginBottom: 2 }}>
          {p.name}: {typeof p.value === "number" ? p.value.toLocaleString("de-CH") : p.value}
        </div>
      ))}
    </div>
  );
};

// ========== ALERTS GENERATOR ==========
const generateAlerts = () => {
  const alerts = [];
  const s = DATA.summary;
  
  // January was terrible
  if (DATA.months_2026[0].revenue < DATA.months_2026[0].budget * 0.5) {
    alerts.push({ severity: "red", title: "January Revenue: CHF 491 vs CHF 8,000 Budget (-93.9%)", detail: "January significantly underperformed. Only 2 bookings / 6 room nights. Review low-season strategy." });
  }
  // March tracking below budget
  const marPct = ((DATA.months_2026[2].revenue - DATA.months_2026[2].budget) / DATA.months_2026[2].budget * 100);
  if (marPct < -10) {
    alerts.push({ severity: "red", title: `March Revenue Tracking ${marPct.toFixed(0)}% Below Budget`, detail: `OTB: CHF ${DATA.months_2026[2].revenue.toLocaleString()} vs Budget CHF ${DATA.months_2026[2].budget.toLocaleString()}. Month is half over — need last-minute bookings or promotions.` });
  }
  // April below budget
  const aprPct = ((DATA.months_2026[3].revenue - DATA.months_2026[3].budget) / DATA.months_2026[3].budget * 100);
  if (aprPct < -15) {
    alerts.push({ severity: "red", title: `April OTB ${aprPct.toFixed(0)}% Below Budget`, detail: `Only CHF ${DATA.months_2026[3].revenue.toLocaleString()} on the books vs CHF ${DATA.months_2026[3].budget.toLocaleString()} budget. ${DATA.months_2026[3].bookings} bookings. Push OTA visibility and direct marketing.` });
  }
  // August significantly behind STLY
  if (DATA.otb_comparison[7].delta_pct < -50) {
    alerts.push({ severity: "red", title: `August OTB: ${DATA.otb_comparison[7].delta_pct}% Behind Last Year`, detail: `Only CHF ${DATA.otb_comparison[7].otb_2026_revenue.toLocaleString()} vs CHF ${DATA.otb_comparison[7].otb_2025_revenue.toLocaleString()} at same point in 2025. Only ${DATA.otb_comparison[7].otb_2026_bk} bookings. Peak season needs attention.` });
  }
  // Cancellation rate
  if (s.year_2026_otb.cancellation_rate > 15) {
    alerts.push({ severity: "amber", title: `Cancellation Rate: ${s.year_2026_otb.cancellation_rate}%`, detail: `Up from ${s.year_2025.cancellation_rate}% in 2025. Monitor booking conditions and cancellation policies.` });
  }
  // ADR erosion
  const adrDrop = ((s.year_2026_otb.adr - s.year_2025.adr) / s.year_2025.adr * 100);
  if (adrDrop < -5) {
    alerts.push({ severity: "amber", title: `ADR Down ${adrDrop.toFixed(1)}% vs 2025`, detail: `Current: CHF ${s.year_2026_otb.adr.toFixed(0)} vs CHF ${s.year_2025.adr.toFixed(0)} last year. Check if discounting is too aggressive.` });
  }
  // Booking.com dominance
  const bkPct = (128 / 164 * 100);
  if (bkPct > 70) {
    alerts.push({ severity: "amber", title: `Channel Concentration: Booking.com at ${bkPct.toFixed(0)}%`, detail: "Heavy OTA dependence increases commission costs. Consider boosting direct bookings via Amenitiz website and manual channels." });
  }
  // Positive: July strong
  if (DATA.otb_comparison[6].delta_pct > 50) {
    alerts.push({ severity: "green", title: `July OTB +${DATA.otb_comparison[6].delta_pct}% Ahead of STLY`, detail: `CHF ${DATA.otb_comparison[6].otb_2026_revenue.toLocaleString()} on the books. Strong advance bookings for peak season.` });
  }
  
  return alerts;
};

// ========== MAIN DASHBOARD ==========
export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [monthDetail, setMonthDetail] = useState(null);
  const alerts = useMemo(() => generateAlerts(), []);

  const monthlyChart = DATA.months_2026.map((m, i) => ({
    name: MONTHS[i],
    "2026 OTB": m.revenue,
    "2025 Actual": DATA.months_2025[i].revenue,
    Budget: m.budget
  }));

  const otbChart = DATA.otb_comparison.map((m, i) => ({
    name: MONTHS[i],
    "OTB 2026": m.otb_2026_revenue,
    "OTB 2025": m.otb_2025_revenue,
    delta: m.delta
  }));

  const occChart = DATA.months_2026.map((m, i) => ({
    name: MONTHS[i],
    "2026 OTB": m.occupancy,
    "2025 Actual": DATA.months_2025[i].occupancy
  }));

  const adrChart = DATA.months_2026.map((m, i) => ({
    name: MONTHS[i],
    "2026 OTB": m.adr,
    "2025 Actual": DATA.months_2025[i].adr
  }));

  const s = DATA.summary;
  const ytdBudget = DATA.months_2026.slice(0, 3).reduce((a, m) => a + m.budget, 0);
  const ytdActual = DATA.months_2026.slice(0, 3).reduce((a, m) => a + m.revenue, 0);
  const ytdVar = ((ytdActual - ytdBudget) / ytdBudget * 100);

  const CHANNEL_COLORS = ["#6366f1", "#22d3ee", "#f59e0b", "#ec4899", "#10b981", "#8b5cf6"];

  return (
    <div style={{
      fontFamily: "'DM Sans', -apple-system, sans-serif",
      background: "linear-gradient(145deg, #0f0f1a 0%, #131325 50%, #0d0d1a 100%)",
      color: "#fff", minHeight: "100vh", padding: "20px 16px 60px",
      maxWidth: 1200, margin: "0 auto"
    }}>
      {/* HEADER */}
      <div style={{ marginBottom: 24, display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, letterSpacing: -0.5 }}>
            Residenza Motta
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
            Short-Term Holiday Apartments — Operations Dashboard
          </p>
        </div>
        <div style={{
          background: "rgba(255,255,255,0.06)", borderRadius: 8, padding: "8px 14px",
          fontSize: 12, color: "rgba(255,255,255,0.5)"
        }}>
          📅 Snapshot: <span style={{ color: "#fff", fontWeight: 600 }}>March 13, 2026</span>
          <br />11 units · Locarno, Ticino
        </div>
      </div>

      {/* TABS */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, overflowX: "auto", paddingBottom: 4 }}>
        {[
          ["overview", "Overview"],
          ["otb", "OTB vs STLY"],
          ["budget", "Revenue vs Budget"],
          ["weekly", "Weekly View"],
          ["monthly", "Monthly View"],
          ["channels", "Channels & Rooms"]
        ].map(([id, label]) => (
          <Tab key={id} active={activeTab === id} onClick={() => setActiveTab(id)}>{label}</Tab>
        ))}
      </div>

      {/* ====== OVERVIEW TAB ====== */}
      {activeTab === "overview" && (
        <div>
          {/* ATTENTION ALERTS */}
          <SectionTitle sub="Items requiring immediate review">🚨 What Needs Your Attention</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {alerts.filter(a => a.severity !== "green").map((a, i) => <AlertCard key={i} {...a} />)}
          </div>

          {/* GOOD NEWS */}
          {alerts.filter(a => a.severity === "green").length > 0 && (
            <>
              <SectionTitle sub="Positive trends">✅ What's Going Well</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {alerts.filter(a => a.severity === "green").map((a, i) => <AlertCard key={i} {...a} />)}
              </div>
            </>
          )}

          {/* HEADLINE KPIs */}
          <SectionTitle sub="OTB as of March 13, 2026 vs full year 2025">📊 Key Performance Indicators</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
            <KPICard label="OTB Revenue" value={fmtCHF(s.year_2026_otb.total_revenue)}
              subtitle={`${fmtPct(s.otb_vs_ly.delta_pct)} vs STLY`}
              status={s.otb_vs_ly.delta_pct > 0 ? "green" : "red"} />
            <KPICard label="Room Nights" value={s.year_2026_otb.total_room_nights}
              subtitle={`vs ${s.otb_vs_ly.otb_2025_rn} STLY`}
              status={s.otb_vs_ly.otb_2026_rn > s.otb_vs_ly.otb_2025_rn ? "green" : "red"} />
            <KPICard label="ADR" value={`CHF ${s.year_2026_otb.adr.toFixed(0)}`}
              subtitle={`vs CHF ${s.year_2025.adr.toFixed(0)} (2025)`}
              status={s.year_2026_otb.adr >= s.year_2025.adr * 0.95 ? "green" : s.year_2026_otb.adr >= s.year_2025.adr * 0.85 ? "amber" : "red"} />
            <KPICard label="RevPAR (OTB)" value={`CHF ${s.year_2026_otb.revpar.toFixed(0)}`}
              subtitle={`FY 2025: CHF ${s.year_2025.revpar.toFixed(0)}`}
              status="amber" />
            <KPICard label="Avg Length of Stay" value={`${s.year_2026_otb.avg_los} nights`}
              subtitle={`vs ${s.year_2025.avg_los} (2025)`}
              status={s.year_2026_otb.avg_los >= s.year_2025.avg_los ? "green" : "amber"} />
            <KPICard label="Booking Lead Time" value={`${s.year_2026_otb.avg_lead_time.toFixed(0)} days`}
              subtitle={`vs ${s.year_2025.avg_lead_time.toFixed(0)} days (2025)`}
              status="green" />
            <KPICard label="Bookings" value={s.year_2026_otb.total_bookings}
              subtitle={`FY 2025: ${s.year_2025.total_bookings}`}
              status="amber" />
            <KPICard label="Cancellation Rate" value={`${s.year_2026_otb.cancellation_rate}%`}
              subtitle={`vs ${s.year_2025.cancellation_rate}% (2025)`}
              status={s.year_2026_otb.cancellation_rate <= 10 ? "green" : s.year_2026_otb.cancellation_rate <= 20 ? "amber" : "red"} />
          </div>

          {/* YTD vs Budget */}
          <SectionTitle sub="Jan–Mar 2026">💰 YTD Revenue vs Budget</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
            <KPICard label="YTD Revenue" value={fmtCHF(ytdActual)} subtitle={`Budget: ${fmtCHF(ytdBudget)}`}
              status={ytdVar > -3 ? "green" : ytdVar > -10 ? "amber" : "red"} />
            <KPICard label="YTD Variance" value={fmtPct(ytdVar)}
              subtitle={`${fmtCHF(Math.abs(ytdActual - ytdBudget))} ${ytdVar >= 0 ? "ahead" : "behind"}`}
              status={ytdVar > -3 ? "green" : ytdVar > -10 ? "amber" : "red"} />
            <KPICard label="FY Budget" value={fmtCHF(s.budget_fy)}
              subtitle={`${((ytdActual / s.budget_fy) * 100).toFixed(1)}% achieved`}
              status="amber" />
          </div>

          {/* Revenue Chart */}
          <SectionTitle>📈 Monthly Revenue: 2026 OTB vs 2025 Actual vs Budget</SectionTitle>
          <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: "16px 8px 8px" }}>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={monthlyChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} tickFormatter={fmt} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }} />
                <Bar dataKey="2026 OTB" fill="#6366f1" radius={[4,4,0,0]} />
                <Bar dataKey="2025 Actual" fill="rgba(255,255,255,0.15)" radius={[4,4,0,0]} />
                <Line dataKey="Budget" stroke="#f59e0b" strokeWidth={2} dot={false} strokeDasharray="6 3" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ====== OTB vs STLY TAB ====== */}
      {activeTab === "otb" && (
        <div>
          <SectionTitle sub="Comparing what was booked by March 13 in each year — apples to apples">📊 On The Books: 2026 vs Same Time Last Year (2025)</SectionTitle>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginBottom: 24 }}>
            <KPICard label="Total OTB Revenue 2026" value={fmtCHF(s.otb_vs_ly.otb_2026_revenue)} status="green"
              subtitle={fmtPct(s.otb_vs_ly.delta_pct) + " vs STLY"} />
            <KPICard label="Total OTB Revenue STLY" value={fmtCHF(s.otb_vs_ly.otb_2025_revenue)} status="amber" />
            <KPICard label="Room Nights 2026" value={s.otb_vs_ly.otb_2026_rn}
              subtitle={`vs ${s.otb_vs_ly.otb_2025_rn} STLY (+${((s.otb_vs_ly.otb_2026_rn - s.otb_vs_ly.otb_2025_rn) / s.otb_vs_ly.otb_2025_rn * 100).toFixed(0)}%)`}
              status="green" />
          </div>

          <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: "16px 8px 8px" }}>
            <ResponsiveContainer width="100%" height={320}>
              <ComposedChart data={otbChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} tickFormatter={fmt} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="OTB 2026" fill="#6366f1" radius={[4,4,0,0]} />
                <Bar dataKey="OTB 2025" fill="rgba(255,255,255,0.2)" radius={[4,4,0,0]} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly OTB Table */}
          <div style={{ marginTop: 24, overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                  {["Month", "2026 Rev", "2025 Rev", "Δ CHF", "Δ %", "2026 RN", "2025 RN", "2026 Bk", "2025 Bk"].map(h => (
                    <th key={h} style={{ padding: "10px 8px", textAlign: "left", color: "rgba(255,255,255,0.5)", fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DATA.otb_comparison.map((m, i) => {
                  const st = m.delta > 0 ? "green" : m.delta > -(m.otb_2025_revenue * 0.1) ? "amber" : "red";
                  return (
                    <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <td style={{ padding: "10px 8px", fontWeight: 600, color: "#fff" }}>{MONTHS[i]}</td>
                      <td style={{ padding: "10px 8px", color: "#fff" }}>{fmtCHF(m.otb_2026_revenue)}</td>
                      <td style={{ padding: "10px 8px", color: "rgba(255,255,255,0.5)" }}>{fmtCHF(m.otb_2025_revenue)}</td>
                      <td style={{ padding: "10px 8px", color: statusColors[st], fontWeight: 600 }}>{m.delta >= 0 ? "+" : ""}{fmtCHF(m.delta)}</td>
                      <td style={{ padding: "10px 8px", color: statusColors[st], fontWeight: 600 }}>{m.otb_2025_revenue > 0 ? fmtPct(m.delta_pct) : "N/A"}</td>
                      <td style={{ padding: "10px 8px", color: "#fff" }}>{m.otb_2026_rn}</td>
                      <td style={{ padding: "10px 8px", color: "rgba(255,255,255,0.5)" }}>{m.otb_2025_rn}</td>
                      <td style={{ padding: "10px 8px", color: "#fff" }}>{m.otb_2026_bk}</td>
                      <td style={{ padding: "10px 8px", color: "rgba(255,255,255,0.5)" }}>{m.otb_2025_bk}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ====== BUDGET TAB ====== */}
      {activeTab === "budget" && (
        <div>
          <SectionTitle sub="2026 OTB revenue vs annual budget">💰 Revenue vs Forecast / Budget</SectionTitle>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginBottom: 24 }}>
            <KPICard label="YTD Actual (Jan–Mar)" value={fmtCHF(ytdActual)} 
              subtitle={`${fmtPct(ytdVar)} vs budget`}
              status={ytdVar > -3 ? "green" : ytdVar > -10 ? "amber" : "red"} />
            <KPICard label="YTD Budget" value={fmtCHF(ytdBudget)} status="amber" />
            <KPICard label="Full Year Budget" value={fmtCHF(s.budget_fy)} 
              subtitle={`${((ytdActual/s.budget_fy)*100).toFixed(1)}% achieved (Q1)`}
              status="amber" />
          </div>

          <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: "16px 8px 8px" }}>
            <ResponsiveContainer width="100%" height={320}>
              <ComposedChart data={monthlyChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} tickFormatter={fmt} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="2026 OTB" fill="#6366f1" radius={[4,4,0,0]} />
                <Line dataKey="Budget" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4, fill: "#f59e0b" }} />
                <Line dataKey="2025 Actual" stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Budget variance table */}
          <div style={{ marginTop: 24, overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                  {["Month", "OTB Revenue", "Budget", "Variance", "Var %", "2025 Actual", "vs 2025"].map(h => (
                    <th key={h} style={{ padding: "10px 8px", textAlign: "left", color: "rgba(255,255,255,0.5)", fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DATA.months_2026.map((m, i) => {
                  const variance = m.revenue - m.budget;
                  const varPct = ((variance / m.budget) * 100);
                  const st = varPct > -3 ? "green" : varPct > -10 ? "amber" : "red";
                  const vs25 = m.revenue - DATA.months_2025[i].revenue;
                  const vs25Pct = DATA.months_2025[i].revenue > 0 ? (vs25 / DATA.months_2025[i].revenue * 100) : 0;
                  const st25 = vs25Pct > 0 ? "green" : vs25Pct > -10 ? "amber" : "red";
                  return (
                    <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <td style={{ padding: "10px 8px", fontWeight: 600, color: "#fff" }}>{MONTHS[i]}</td>
                      <td style={{ padding: "10px 8px", color: "#fff" }}>{fmtCHF(m.revenue)}</td>
                      <td style={{ padding: "10px 8px", color: "rgba(255,255,255,0.5)" }}>{fmtCHF(m.budget)}</td>
                      <td style={{ padding: "10px 8px", color: statusColors[st], fontWeight: 600 }}>{variance >= 0 ? "+" : ""}{fmtCHF(variance)}</td>
                      <td style={{ padding: "10px 8px", color: statusColors[st], fontWeight: 600 }}>{fmtPct(varPct)}</td>
                      <td style={{ padding: "10px 8px", color: "rgba(255,255,255,0.5)" }}>{fmtCHF(DATA.months_2025[i].revenue)}</td>
                      <td style={{ padding: "10px 8px", color: statusColors[st25], fontWeight: 600 }}>{DATA.months_2025[i].revenue > 0 ? fmtPct(vs25Pct) : "N/A"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ====== WEEKLY TAB ====== */}
      {activeTab === "weekly" && (
        <div>
          <SectionTitle sub="2026 bookings by week of check-in">📅 Weekly Performance</SectionTitle>
          
          <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: "16px 8px 8px" }}>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={DATA.weeks_2026}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="ws" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                <YAxis yAxisId="left" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} tickFormatter={fmt} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: "#22d3ee", fontSize: 11 }} unit="%" />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill="#6366f1" radius={[3,3,0,0]} />
                <Line yAxisId="right" dataKey="occ" name="Occupancy %" stroke="#22d3ee" strokeWidth={2} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div style={{ marginTop: 20, overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                  {["Week", "Start", "Bookings", "Revenue", "Room Nights", "Occ %", "Avg LOS"].map(h => (
                    <th key={h} style={{ padding: "10px 8px", textAlign: "left", color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DATA.weeks_2026.map((w, i) => {
                  const occSt = w.occ >= 55 ? "green" : w.occ >= 25 ? "amber" : "red";
                  return (
                    <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <td style={{ padding: "10px 8px", fontWeight: 600, color: "#fff" }}>W{w.week}</td>
                      <td style={{ padding: "10px 8px", color: "rgba(255,255,255,0.6)" }}>{w.ws}</td>
                      <td style={{ padding: "10px 8px", color: "#fff" }}>{w.bookings}</td>
                      <td style={{ padding: "10px 8px", color: "#fff" }}>{fmtCHF(w.revenue)}</td>
                      <td style={{ padding: "10px 8px", color: "#fff" }}>{w.rn}</td>
                      <td style={{ padding: "10px 8px", color: statusColors[occSt], fontWeight: 600 }}>{w.occ}%</td>
                      <td style={{ padding: "10px 8px", color: "rgba(255,255,255,0.6)" }}>{w.los}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ====== MONTHLY TAB ====== */}
      {activeTab === "monthly" && (
        <div>
          <SectionTitle sub="Full KPI breakdown by month">📆 Monthly Performance Detail</SectionTitle>
          
          {/* Occupancy Chart */}
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 8 }}>Occupancy Rate (%)</h3>
          <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: "16px 8px 8px", marginBottom: 24 }}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={occChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} unit="%" />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="2026 OTB" fill="#6366f1" radius={[4,4,0,0]} />
                <Bar dataKey="2025 Actual" fill="rgba(255,255,255,0.15)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* ADR Chart */}
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 8 }}>Average Daily Rate (CHF)</h3>
          <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: "16px 8px 8px", marginBottom: 24 }}>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={adrChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} />
                <YAxis tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line dataKey="2026 OTB" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4, fill: "#6366f1" }} />
                <Line dataKey="2025 Actual" stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} dot={{ r: 3 }} strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly KPI Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                  {["Month", "Revenue", "Budget", "Occ %", "ADR", "RevPAR", "RN", "Bookings", "Avg LOS", "Lead Time"].map(h => (
                    <th key={h} style={{ padding: "8px 6px", textAlign: "left", color: "rgba(255,255,255,0.5)", fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DATA.months_2026.map((m, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <td style={{ padding: "8px 6px", fontWeight: 600, color: "#fff" }}>{MONTHS[i]}</td>
                    <td style={{ padding: "8px 6px", color: "#fff" }}>{fmtCHF(m.revenue)}</td>
                    <td style={{ padding: "8px 6px", color: "rgba(255,255,255,0.4)" }}>{fmtCHF(m.budget)}</td>
                    <td style={{ padding: "8px 6px", color: statusColors[m.occupancy >= 40 ? "green" : m.occupancy >= 20 ? "amber" : "red"], fontWeight: 600 }}>{m.occupancy}%</td>
                    <td style={{ padding: "8px 6px", color: "#fff" }}>CHF {m.adr.toFixed(0)}</td>
                    <td style={{ padding: "8px 6px", color: "#fff" }}>CHF {m.revpar.toFixed(0)}</td>
                    <td style={{ padding: "8px 6px", color: "#fff" }}>{m.room_nights}</td>
                    <td style={{ padding: "8px 6px", color: "#fff" }}>{m.bookings}</td>
                    <td style={{ padding: "8px 6px", color: "rgba(255,255,255,0.6)" }}>{m.avg_los}</td>
                    <td style={{ padding: "8px 6px", color: "rgba(255,255,255,0.6)" }}>{m.avg_lead_time}d</td>
                  </tr>
                ))}
                <tr style={{ borderTop: "2px solid rgba(255,255,255,0.2)", fontWeight: 700 }}>
                  <td style={{ padding: "10px 6px", color: "#fff" }}>TOTAL</td>
                  <td style={{ padding: "10px 6px", color: "#fff" }}>{fmtCHF(s.year_2026_otb.total_revenue)}</td>
                  <td style={{ padding: "10px 6px", color: "rgba(255,255,255,0.4)" }}>{fmtCHF(s.budget_fy)}</td>
                  <td style={{ padding: "10px 6px", color: statusColors["amber"] }}>{s.year_2026_otb.occupancy}%</td>
                  <td style={{ padding: "10px 6px", color: "#fff" }}>CHF {s.year_2026_otb.adr.toFixed(0)}</td>
                  <td style={{ padding: "10px 6px", color: "#fff" }}>CHF {s.year_2026_otb.revpar.toFixed(0)}</td>
                  <td style={{ padding: "10px 6px", color: "#fff" }}>{s.year_2026_otb.total_room_nights}</td>
                  <td style={{ padding: "10px 6px", color: "#fff" }}>{s.year_2026_otb.total_bookings}</td>
                  <td style={{ padding: "10px 6px", color: "rgba(255,255,255,0.6)" }}>{s.year_2026_otb.avg_los}</td>
                  <td style={{ padding: "10px 6px", color: "rgba(255,255,255,0.6)" }}>{s.year_2026_otb.avg_lead_time.toFixed(0)}d</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ====== CHANNELS & ROOMS TAB ====== */}
      {activeTab === "channels" && (
        <div>
          <SectionTitle sub="2026 OTB distribution">📡 Channel Mix</SectionTitle>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
            {/* Pie chart */}
            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 16 }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)", margin: "0 0 12px" }}>Revenue by Channel</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={DATA.sources_2026} dataKey="revenue" nameKey="source" cx="50%" cy="50%" outerRadius={80} label={({ source, percent }) => `${source.replace("Prenotazione Manuale","Direct")} ${(percent*100).toFixed(0)}%`} labelLine={false} style={{ fontSize: 10 }}>
                    {DATA.sources_2026.map((_, i) => <Cell key={i} fill={CHANNEL_COLORS[i % CHANNEL_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => fmtCHF(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Channel table */}
            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 16 }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)", margin: "0 0 12px" }}>Channel Detail (2026)</h3>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                    {["Source", "Bk", "Revenue", "RN", "Share"].map(h => (
                      <th key={h} style={{ padding: "8px 6px", textAlign: "left", color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DATA.sources_2026.map((ch, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <td style={{ padding: "8px 6px", color: "#fff", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ width: 8, height: 8, borderRadius: 2, background: CHANNEL_COLORS[i], display: "inline-block" }} />
                        {ch.source === "Prenotazione Manuale" ? "Direct/Manual" : ch.source}
                      </td>
                      <td style={{ padding: "8px 6px", color: "#fff" }}>{ch.bookings}</td>
                      <td style={{ padding: "8px 6px", color: "#fff" }}>{fmtCHF(ch.revenue)}</td>
                      <td style={{ padding: "8px 6px", color: "#fff" }}>{ch.rn}</td>
                      <td style={{ padding: "8px 6px", color: "rgba(255,255,255,0.6)" }}>{(ch.revenue / s.year_2026_otb.total_revenue * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Room Performance */}
          <SectionTitle sub="2026 OTB by apartment">🏠 Room / Apartment Performance</SectionTitle>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                  {["Room", "Bookings", "Revenue", "Room Nights", "ADR", "Avg LOS", "Lead Time"].map(h => (
                    <th key={h} style={{ padding: "10px 8px", textAlign: "left", color: "rgba(255,255,255,0.5)", fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DATA.rooms_2026.map((r, i) => {
                  const adr = r.rn > 0 ? r.revenue / r.rn : 0;
                  return (
                    <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <td style={{ padding: "10px 8px", color: "#fff", fontWeight: 600 }}>{r.room}</td>
                      <td style={{ padding: "10px 8px", color: "#fff" }}>{r.bookings}</td>
                      <td style={{ padding: "10px 8px", color: "#fff" }}>{fmtCHF(r.revenue)}</td>
                      <td style={{ padding: "10px 8px", color: "#fff" }}>{r.rn}</td>
                      <td style={{ padding: "10px 8px", color: "#fff" }}>CHF {adr.toFixed(0)}</td>
                      <td style={{ padding: "10px 8px", color: "rgba(255,255,255,0.6)" }}>{r.los}</td>
                      <td style={{ padding: "10px 8px", color: "rgba(255,255,255,0.6)" }}>{r.lead.toFixed(0)}d</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <div style={{ marginTop: 48, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", margin: 0 }}>
          Residenza Motta — Hotel Operations Dashboard · Data snapshot: March 13, 2026 · 11 Short-Term Holiday Apartments · Locarno, Ticino
        </p>
        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.15)", margin: "6px 0 0" }}>
          OTB comparisons use booking creation date to ensure like-for-like comparison · Budget from 2026 Business Plan
        </p>
      </div>
    </div>
  );
}
