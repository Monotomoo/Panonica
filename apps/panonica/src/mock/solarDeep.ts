/**
 * Solar · deep data for hourly irradiance, degradation, variability, tech.
 * Source anchors:
 * - PVGIS TMY data for 45.21°N 18.44°E
 * - IEC 61853-1 module performance characterization
 * - Jordan & Kurtz NREL degradation meta-study (2013 + 2022 updates)
 * - Fraunhofer ISE bifacial modeling
 */

export const ghiByHourMonth: number[][] = [
  // 12 months × 24 hours · W/m² global horizontal irradiance
  [0, 0, 0, 0, 0, 0, 0, 5, 35, 85, 145, 195, 225, 220, 185, 130, 75, 25, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 5, 28, 95, 175, 245, 305, 335, 325, 275, 205, 130, 55, 8, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 8, 45, 115, 210, 310, 405, 470, 490, 470, 410, 325, 220, 115, 35, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 18, 58, 135, 235, 345, 450, 545, 605, 620, 595, 525, 425, 305, 180, 75, 15, 0, 0, 0, 0],
  [0, 0, 0, 5, 45, 110, 210, 330, 455, 575, 675, 735, 755, 725, 640, 525, 395, 265, 145, 50, 8, 0, 0, 0],
  [0, 0, 0, 12, 65, 140, 255, 395, 540, 675, 790, 855, 875, 840, 745, 615, 475, 330, 195, 85, 20, 0, 0, 0],
  [0, 0, 0, 10, 60, 135, 250, 395, 545, 685, 810, 880, 905, 865, 770, 635, 490, 340, 200, 85, 18, 0, 0, 0],
  [0, 0, 0, 0, 30, 95, 200, 330, 470, 600, 715, 780, 795, 760, 670, 540, 400, 255, 130, 35, 0, 0, 0, 0],
  [0, 0, 0, 0, 8, 55, 140, 250, 375, 490, 580, 635, 645, 615, 530, 410, 280, 155, 55, 5, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 20, 75, 160, 265, 365, 450, 500, 510, 480, 400, 290, 175, 70, 10, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 15, 65, 140, 225, 295, 335, 340, 320, 260, 180, 90, 25, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 15, 60, 130, 195, 235, 245, 225, 175, 110, 45, 5, 0, 0, 0, 0, 0, 0],
];

export const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/* ------------------------------ DEGRADATION ----------------------------- */

export const degradationYears: { year: number; p50: number; p90: number; p10: number }[] = Array.from({ length: 26 }, (_, y) => {
  const base = Math.pow(1 - 0.005, y); // 0.5%/yr mean
  const std = Math.sqrt(y) * 0.008;
  return {
    year: y,
    p50: base * 100,
    p90: (base + 1.28 * std) * 100, // NREL median methodology
    p10: (base - 1.28 * std) * 100,
  };
});

/* ------------------------------- VARIABILITY ---------------------------- */

export const monthlySoilingLoss = [
  { month: 'Jan', lossPct: 1.8 },
  { month: 'Feb', lossPct: 1.6 },
  { month: 'Mar', lossPct: 2.2 },
  { month: 'Apr', lossPct: 2.8 },
  { month: 'May', lossPct: 3.4 },
  { month: 'Jun', lossPct: 4.2 },
  { month: 'Jul', lossPct: 5.8 },
  { month: 'Aug', lossPct: 6.4 },
  { month: 'Sep', lossPct: 4.1 },
  { month: 'Oct', lossPct: 2.6 },
  { month: 'Nov', lossPct: 1.9 },
  { month: 'Dec', lossPct: 1.7 },
];

export const temperatureDerateByMonth = [
  { month: 'Jan', avgC: 1.2, panelTempC: 5.2, deratePct: 0.5 },
  { month: 'Feb', avgC: 3.4, panelTempC: 12.1, deratePct: 0.8 },
  { month: 'Mar', avgC: 7.8, panelTempC: 22.5, deratePct: 2.1 },
  { month: 'Apr', avgC: 13.1, panelTempC: 31.5, deratePct: 4.2 },
  { month: 'May', avgC: 18.0, panelTempC: 42.3, deratePct: 7.1 },
  { month: 'Jun', avgC: 21.4, panelTempC: 48.5, deratePct: 8.9 },
  { month: 'Jul', avgC: 23.2, panelTempC: 52.8, deratePct: 10.2 },
  { month: 'Aug', avgC: 22.8, panelTempC: 52.1, deratePct: 10.0 },
  { month: 'Sep', avgC: 17.9, panelTempC: 42.2, deratePct: 7.1 },
  { month: 'Oct', avgC: 11.2, panelTempC: 28.4, deratePct: 3.4 },
  { month: 'Nov', avgC: 6.1, panelTempC: 17.2, deratePct: 1.4 },
  { month: 'Dec', avgC: 2.4, panelTempC: 7.8, deratePct: 0.6 },
];

export const weatherStation = {
  name: 'DHMZ Gunja',
  distanceKm: 14.2,
  since: '1967',
  availability: 0.984,
  variables: ['GHI', 'DNI', 'Tamb', 'WindSpd', 'RH', 'precipitation'],
  pyranometerClass: 'ISO 9060 Class-B',
  dataFeed: 'connected · 10-min resolution',
};

/* --------------------------------- TECH --------------------------------- */

export interface PanelTech {
  name: string;
  relativeYield: number; // 1.0 = baseline mono
  bifacialGain: number;
  tempCoef: number; // %/°C (more negative = worse)
  degradation: number; // %/yr
  pricePremium: number; // relative to baseline
  note: string;
}

export const panelTechComparison: PanelTech[] = [
  { name: 'Mono-Si PERC (baseline)', relativeYield: 1.0, bifacialGain: 0, tempCoef: -0.37, degradation: 0.55, pricePremium: 1.0, note: 'Industry standard · 22% efficiency' },
  { name: 'Mono-Si bifacial', relativeYield: 1.07, bifacialGain: 0.08, tempCoef: -0.37, degradation: 0.55, pricePremium: 1.04, note: 'Rear-gain +7% on albedo 0.25 ground' },
  { name: 'n-TOPCon', relativeYield: 1.08, bifacialGain: 0.09, tempCoef: -0.30, degradation: 0.40, pricePremium: 1.12, note: 'Better temp coefficient · lower LID · 2026 mainstream' },
  { name: 'HJT (heterojunction)', relativeYield: 1.11, bifacialGain: 0.1, tempCoef: -0.24, degradation: 0.25, pricePremium: 1.24, note: 'Best temp behavior · longest-lived · premium' },
  { name: 'IBC (interdigitated)', relativeYield: 1.12, bifacialGain: 0, tempCoef: -0.29, degradation: 0.25, pricePremium: 1.82, note: 'Meyer Burger · highest efficiency · EU-made' },
];

export interface TrackerUplift {
  month: string;
  fixedGhiKwh: number;
  onexAxis: number;
  uplifterPct: number;
}

export const trackerUpliftByMonth: TrackerUplift[] = months.map((m, i) => {
  const daily = [45, 72, 112, 152, 188, 205, 215, 190, 148, 95, 58, 42][i];
  const uplift = [0.16, 0.14, 0.1, 0.06, 0.04, 0.03, 0.03, 0.04, 0.07, 0.11, 0.15, 0.17][i];
  return {
    month: m,
    fixedGhiKwh: daily,
    onexAxis: daily * (1 + uplift),
    uplifterPct: uplift * 100,
  };
});

export const performanceRatio = {
  value: 0.843,
  components: [
    { label: 'Module STC capacity', value: 1.0 },
    { label: '− Temperature losses', value: -0.042 },
    { label: '− Soiling (annual)', value: -0.028 },
    { label: '− Mismatch losses', value: -0.016 },
    { label: '− DC wiring losses', value: -0.012 },
    { label: '− Inverter losses', value: -0.018 },
    { label: '− AC wiring + transformer', value: -0.020 },
    { label: '− Availability', value: -0.010 },
    { label: '− Tracking/aiming loss', value: -0.011 },
  ],
};
