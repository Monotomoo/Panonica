/**
 * Project-state validation engine.
 * Checks the Builder state for physical, regulatory, and financial clashes.
 * Returns a list of violations ranked by severity.
 *
 * Every rule is deterministic and traceable — no heuristics.
 */

import type { ProjectState, SectionKey } from '@/store/projectStore';

export type Severity = 'error' | 'warn' | 'info';

export interface Violation {
  id: string;
  severity: Severity;
  section: SectionKey;
  title: string;
  message: string;
  fix?: string;
}

export interface ValidationResult {
  violations: Violation[];
  errorCount: number;
  warnCount: number;
  infoCount: number;
  passCount: number;  // rules that pass (for health score)
  totalRules: number;
  healthScore: number;  // 0..100 composite
}

export function validateProject(s: ProjectState): ValidationResult {
  const vs: Violation[] = [];

  /* ========================= SITE ======================== */

  if (s.site.areaHa <= 0) {
    vs.push({ id: 'site-area', severity: 'error', section: 'site',
      title: 'Site area missing',
      message: 'Draw the polygon or enter area directly · downstream BoM + finance depend on this.',
      fix: 'Open Site · draw the polygon on the map',
    });
  }

  if (s.site.meanSlopePct > 5) {
    vs.push({ id: 'site-slope-high', severity: 'error', section: 'site',
      title: `Slope ${s.site.meanSlopePct.toFixed(1)}% > 5%`,
      message: 'Slope above 5% breaks agri-PV land-classification + triples civil cut-and-fill.',
      fix: 'Use a different parcel or limit GCR to protected flat zones',
    });
  } else if (s.site.meanSlopePct > 3) {
    vs.push({ id: 'site-slope-med', severity: 'warn', section: 'site',
      title: `Slope ${s.site.meanSlopePct.toFixed(1)}% marginal`,
      message: 'Slope 3–5% raises civil CAPEX ~15%. Agri dual-use may need additional waiver.',
    });
  }

  if (s.site.waterTableAvgM > -1.5) {
    vs.push({ id: 'water-table-high', severity: 'warn', section: 'site',
      title: 'High water table',
      message: `Average water table ${s.site.waterTableAvgM}m < 1.5m below surface · pile-driving will hit saturated soil.`,
      fix: 'Switch foundation to screw or concrete ballast',
    });
  }

  if (s.site.floodZone100yr === 'inside') {
    vs.push({ id: 'flood-zone', severity: 'error', section: 'site',
      title: 'Inside Q100 flood zone',
      message: 'Insurers will decline · lenders will require flood covenant · re-site recommended.',
    });
  }

  if (s.site.soilBearingKpa < 100) {
    vs.push({ id: 'soil-bearing', severity: 'warn', section: 'site',
      title: `Soil bearing ${s.site.soilBearingKpa} kPa low`,
      message: 'Below 100 kPa indicates soft/organic soil · pile length must increase.',
      fix: 'Increase pile length to ≥ 3.5 m',
    });
  }

  /* ======================= CLIMATE ======================= */

  if (s.climate.ghiKwhM2Yr < 1200) {
    vs.push({ id: 'ghi-low', severity: 'warn', section: 'climate',
      title: `GHI ${s.climate.ghiKwhM2Yr} kWh/m²·yr low`,
      message: 'Below 1,200 kWh/m² is marginal for 25-yr PPA economics.',
    });
  }

  if (s.climate.windDesignMps > 35) {
    vs.push({ id: 'wind-extreme', severity: 'warn', section: 'climate',
      title: `Design wind ${s.climate.windDesignMps} m/s very high`,
      message: 'Structural cost premium ~8% for 35+ m/s zones.',
    });
  }

  if (s.climate.soilingLossPctYr > 5) {
    vs.push({ id: 'soiling-high', severity: 'info', section: 'climate',
      title: 'Soiling > 5%/yr',
      message: 'Upgrade cleaning strategy or budget for robotic sweep.',
    });
  }

  /* ====================== GENERATION ===================== */

  const panelArea = s.generation.moduleCountTarget * s.generation.moduleAreaM2;
  const gcrDerived = panelArea / (s.site.areaHa * 10_000);
  if (gcrDerived > 0.55) {
    vs.push({ id: 'gcr-too-dense', severity: 'warn', section: 'generation',
      title: `GCR ${gcrDerived.toFixed(2)} too dense`,
      message: 'GCR > 0.55 crashes under-panel PAR for agri dual-use.',
    });
  }
  if (gcrDerived < 0.25 && s.generation.capacityDcKw > 0) {
    vs.push({ id: 'gcr-too-sparse', severity: 'info', section: 'generation',
      title: `GCR ${gcrDerived.toFixed(2)} sparse`,
      message: 'Unused land share · CAPEX per MW rises.',
    });
  }

  if (s.generation.groundCoverageRatio < 0.3 || s.generation.groundCoverageRatio > 0.45) {
    vs.push({ id: 'gcr-outside-agri-sweet-spot', severity: 'info', section: 'generation',
      title: 'GCR outside AGV sweet-spot',
      message: 'Fraunhofer ISE recommends GCR 0.30–0.45 for agri-PV.',
    });
  }

  if (s.generation.tilt !== 'fixed' && s.site.meanSlopePct > 3) {
    vs.push({ id: 'tracker-slope', severity: 'warn', section: 'generation',
      title: 'Trackers on sloped ground',
      message: 'Tracker installation complexity rises sharply on 3%+ slope.',
    });
  }

  if (s.generation.panelHeightMinM < 2.5 && s.agriculture.system !== 'none') {
    vs.push({ id: 'panel-height-agri', severity: 'error', section: 'generation',
      title: 'Panel clearance too low for agri dual-use',
      message: `Min ${s.generation.panelHeightMinM}m < required 2.5m · land will be reclassified.`,
      fix: 'Raise panel clearance to ≥ 2.5 m (3.5 m for tractor access on crops)',
    });
  }

  if (s.generation.rowPitchM < 6 && s.agriculture.system !== 'none') {
    vs.push({ id: 'row-pitch-agri', severity: 'warn', section: 'generation',
      title: 'Row pitch tight for machinery',
      message: `${s.generation.rowPitchM}m row pitch < 6m recommended for under-panel ops.`,
    });
  }

  /* =================== POWER ELECTRONICS ================= */

  const vocMaxSafe = s.powerElectronics.inverterMpptVmax * 0.95;
  if (s.powerElectronics.vocStackV > vocMaxSafe) {
    vs.push({ id: 'voc-stack-exceeds', severity: 'error', section: 'powerElectronics',
      title: `Voc stack ${s.powerElectronics.vocStackV}V exceeds inverter limit`,
      message: `Voc ${s.powerElectronics.vocStackV}V > 95% of inverter max ${s.powerElectronics.inverterMpptVmax}V · cold-morning overvoltage risk.`,
      fix: 'Reduce modules per string by 1',
    });
  }

  if (s.powerElectronics.dcAcRatio > 1.35) {
    vs.push({ id: 'dcac-clip', severity: 'warn', section: 'powerElectronics',
      title: `DC/AC ${s.powerElectronics.dcAcRatio.toFixed(2)} > 1.35 recommended`,
      message: 'Higher clipping · HOPS may require curtailment plan.',
    });
  }

  if (s.powerElectronics.dcAcRatio < 1.0) {
    vs.push({ id: 'dcac-undersize', severity: 'warn', section: 'powerElectronics',
      title: `DC/AC ${s.powerElectronics.dcAcRatio.toFixed(2)} < 1.0`,
      message: 'Inverter larger than array · wastes AC capacity.',
    });
  }

  const totalInverterKw = s.powerElectronics.inverterCount * s.powerElectronics.inverterKw;
  const targetAcKw = s.generation.capacityDcKw / Math.max(s.powerElectronics.dcAcRatio, 1);
  if (s.generation.capacityDcKw > 0 && Math.abs(totalInverterKw - targetAcKw) / targetAcKw > 0.15) {
    vs.push({ id: 'inverter-count-mismatch', severity: 'warn', section: 'powerElectronics',
      title: 'Inverter bank mis-sized',
      message: `${s.powerElectronics.inverterCount} × ${s.powerElectronics.inverterKw}kW = ${totalInverterKw}kW · target ${targetAcKw.toFixed(0)}kW`,
      fix: 'Adjust inverter count to match AC target',
    });
  }

  /* ====================== GRID CONNECTION ================= */

  if (s.gridConnection.pccDistanceKm > 25) {
    vs.push({ id: 'grid-distance', severity: 'warn', section: 'gridConnection',
      title: `PCC ${s.gridConnection.pccDistanceKm} km far`,
      message: 'Cable >25 km dominates CAPEX and Ferranti losses.',
    });
  }

  if (s.gridConnection.pccVoltageKv < 20 && s.generation.capacityDcKw > 10_000) {
    vs.push({ id: 'voltage-level', severity: 'error', section: 'gridConnection',
      title: 'PCC voltage too low for capacity',
      message: `Site ${(s.generation.capacityDcKw / 1000).toFixed(0)}MW on < 20kV feeder · insufficient.`,
      fix: 'Upgrade to 35 kV connection',
    });
  }

  if (s.gridConnection.pccVoltageKv < 35 && s.generation.capacityDcKw >= 20_000) {
    vs.push({ id: 'voltage-level-med', severity: 'warn', section: 'gridConnection',
      title: '35 kV recommended for 20+ MW',
      message: 'HOPS grid code best-practice for this capacity class.',
    });
  }

  if (!s.gridConnection.lvrtCompliant || !s.gridConnection.hvrtCompliant) {
    vs.push({ id: 'ride-through', severity: 'error', section: 'gridConnection',
      title: 'Ride-through not compliant',
      message: 'LVRT + HVRT required by HOPS 2024 rev.3 · cannot be commissioned otherwise.',
    });
  }

  if (s.gridConnection.thdPct > 5) {
    vs.push({ id: 'thd-high', severity: 'warn', section: 'gridConnection',
      title: `THD ${s.gridConnection.thdPct}% > 5%`,
      message: 'Harmonic filter required.',
    });
  }

  if (s.gridConnection.ferrantiRisePct > 3) {
    vs.push({ id: 'ferranti-high', severity: 'warn', section: 'gridConnection',
      title: `Ferranti rise ${s.gridConnection.ferrantiRisePct}% > 3%`,
      message: 'No-load voltage rise will trip protection · add reactor/reactive compensation.',
    });
  }

  /* =========================== STORAGE =================== */

  if (s.storage.enabled && s.storage.chemistry === 'nmc') {
    vs.push({ id: 'nmc-fire', severity: 'warn', section: 'storage',
      title: 'NMC chemistry · thermal runaway risk',
      message: 'Fire authority (HVZ) requires 8m clearance from PV array · liquid cooling.',
    });
  }

  if (s.storage.enabled && s.storage.energyMwh / Math.max(s.storage.powerMw, 0.1) > 6) {
    vs.push({ id: 'storage-duration', severity: 'info', section: 'storage',
      title: 'Long-duration storage',
      message: 'E/P ratio > 6h · consider flow batteries for economics.',
    });
  }

  if (s.storage.enabled && s.storage.fireSuppressionSystem === 'none') {
    vs.push({ id: 'storage-fire', severity: 'error', section: 'storage',
      title: 'No fire suppression on battery',
      message: 'Insurance will decline · fire authority won\'t issue permit.',
      fix: 'Install aerosol or inert-gas suppression',
    });
  }

  /* ========================== AGRICULTURE ================ */

  if (s.agriculture.system !== 'none' && s.agriculture.stockingRateHeadPerHa > 2) {
    vs.push({ id: 'stocking-high', severity: 'warn', section: 'agriculture',
      title: `Stocking ${s.agriculture.stockingRateHeadPerHa} head/ha aggressive`,
      message: 'Pasture degradation risk · CAP P2 eco-scheme may not qualify.',
    });
  }

  if (s.agriculture.system === 'sheep' && s.civilBos.fenceHeightM < 1.5) {
    vs.push({ id: 'sheep-fence', severity: 'error', section: 'civilBos',
      title: 'Perimeter fence too low for sheep',
      message: 'Sheep containment requires 1.5m+ · internal paddock fencing also.',
    });
  }

  /* ======================= CIVIL / BoS =================== */

  if (s.civilBos.fenceHeightM < 2.4 && s.generation.capacityDcKw >= 10_000) {
    vs.push({ id: 'insurer-fence', severity: 'warn', section: 'civilBos',
      title: 'Fence < 2.4m for utility-scale',
      message: 'Standard insurer requirement (Croatia Osiguranje baseline).',
    });
  }

  if (s.civilBos.cctvCount < 8 && s.generation.capacityDcKw >= 30_000) {
    vs.push({ id: 'cctv-low', severity: 'warn', section: 'civilBos',
      title: 'CCTV coverage thin',
      message: '30+ MW sites typically require 8+ towers for insurance baseline.',
    });
  }

  /* ============================ FINANCE ================== */

  if (s.finance.senior_dscrCovenant < 1.15) {
    vs.push({ id: 'dscr-weak', severity: 'warn', section: 'finance',
      title: 'DSCR covenant < 1.15',
      message: 'Lenders rarely accept below 1.15 on project finance · revisit capital stack.',
    });
  }

  if (s.finance.senior_debtPct + s.finance.mezzanine_debtPct + s.finance.sponsorEquityPct !== 100) {
    vs.push({ id: 'capital-stack-sum', severity: 'error', section: 'finance',
      title: 'Capital stack ≠ 100%',
      message: `Senior ${s.finance.senior_debtPct}% + mezz ${s.finance.mezzanine_debtPct}% + equity ${s.finance.sponsorEquityPct}% = ${s.finance.senior_debtPct + s.finance.mezzanine_debtPct + s.finance.sponsorEquityPct}%.`,
      fix: 'Rebalance so senior + mezzanine + equity = 100%',
    });
  }

  if (s.finance.ppaPriceEurMwh < 70) {
    vs.push({ id: 'ppa-low', severity: 'warn', section: 'finance',
      title: 'PPA below spot floor',
      message: `€${s.finance.ppaPriceEurMwh}/MWh < typical HROTE 30-day avg.`,
    });
  }

  if (s.finance.contingencyPctCapex < 5) {
    vs.push({ id: 'contingency-low', severity: 'warn', section: 'finance',
      title: 'EPC contingency < 5%',
      message: 'Standard EPC practice is 8% for utility-scale PV.',
    });
  }

  /* ========================== PERMITTING ================= */

  const blocked = (Object.keys(s.permitting) as (keyof typeof s.permitting)[])
    .filter((k) => s.permitting[k] === 'blocked');
  if (blocked.length > 0) {
    vs.push({ id: 'permit-blocked', severity: 'error', section: 'permitting',
      title: `${blocked.length} permit${blocked.length === 1 ? '' : 's'} BLOCKED`,
      message: `Blocked: ${blocked.join(', ')}. Cannot proceed until unblocked.`,
    });
  }

  const pending = (Object.keys(s.permitting) as (keyof typeof s.permitting)[])
    .filter((k) => s.permitting[k] === 'pending').length;
  if (pending > 3) {
    vs.push({ id: 'permit-pending-many', severity: 'info', section: 'permitting',
      title: `${pending} permits pending`,
      message: 'Critical path includes all pending permits · track in Gantt.',
    });
  }

  /* ========================== CONSTRUCTION =============== */

  if (s.construction.liquidatedDamagesPctPerWeek < 0.1) {
    vs.push({ id: 'ld-low', severity: 'info', section: 'construction',
      title: 'LDs below market',
      message: '0.1-0.3%/week is standard · below this shifts delay risk to sponsor.',
    });
  }

  if (s.construction.performanceBondPctCapex < 5) {
    vs.push({ id: 'bond-low', severity: 'warn', section: 'construction',
      title: 'Performance bond thin',
      message: 'Industry floor is 5% · lenders usually require 10%.',
    });
  }

  /* ============================ OPERATIONS =============== */

  if (s.operations.availabilityGuaranteePct < 97) {
    vs.push({ id: 'avail-low', severity: 'warn', section: 'operations',
      title: 'Availability guarantee < 97%',
      message: 'Below investor expectations · may affect DSCR.',
    });
  }

  /* =========================== RISK ====================== */

  if (!s.riskInsurance.propertyAllRiskCover) {
    vs.push({ id: 'no-par', severity: 'error', section: 'riskInsurance',
      title: 'No property all-risk cover',
      message: 'Lenders require it unconditionally.',
    });
  }

  if (s.riskInsurance.counterpartyConcentrationPct === 100 && !s.finance.ppaTakeOrPay) {
    vs.push({ id: 'counterparty-risk', severity: 'warn', section: 'riskInsurance',
      title: 'Single-offtaker exposure',
      message: 'No take-or-pay clause + 100% counterparty concentration = concentrated revenue risk.',
    });
  }

  /* =========================== ESG ======================= */

  if (!s.esgExit.euTaxonomyDnshCompliant) {
    vs.push({ id: 'dnsh', severity: 'warn', section: 'esgExit',
      title: 'EU Taxonomy DNSH not confirmed',
      message: 'Blocks ESG funds from participating.',
    });
  }

  /* ========================= TALLY ======================= */

  const errorCount = vs.filter((v) => v.severity === 'error').length;
  const warnCount = vs.filter((v) => v.severity === 'warn').length;
  const infoCount = vs.filter((v) => v.severity === 'info').length;
  const TOTAL_RULES = 40;
  const passCount = TOTAL_RULES - vs.length;
  const errorWeight = 10;
  const warnWeight = 3;
  const infoWeight = 1;
  const penalty = errorCount * errorWeight + warnCount * warnWeight + infoCount * infoWeight;
  const healthScore = Math.max(0, Math.min(100, 100 - penalty));

  return {
    violations: vs,
    errorCount,
    warnCount,
    infoCount,
    passCount,
    totalRules: TOTAL_RULES,
    healthScore,
  };
}
