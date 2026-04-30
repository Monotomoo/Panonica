import { useRef, useState } from 'react';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  Download,
  FileText,
  Info,
  RefreshCcw,
  Save,
  Settings2,
  Sparkles,
  Upload,
  Wrench,
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { cn } from '@paladian/ui';
import { presetState, useProjectStore, type ProjectMeta } from '@/store/projectStore';
import type { ValidationResult } from '@/lib/validationEngine';
import type { BuilderFinanceResult } from '@/lib/builderDerive';

export function BuilderTopBar({ validation, finance, onPushToConfigurator }: {
  validation: ValidationResult;
  finance: BuilderFinanceResult;
  onPushToConfigurator: () => void;
}) {
  const project = useProjectStore();
  const loadPreset = useProjectStore((s) => s.loadPreset);
  const resetAll = useProjectStore((s) => s.resetAll);
  const [presetOpen, setPresetOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const fireToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  const presets: { key: ProjectMeta['preset']; label: string; note: string }[] = [
    { key: 'beravci-default', label: 'Kopanica-Beravci · default', note: '30 MW · Paladina baseline' },
    { key: 'ribic-breg', label: 'Ribić Breg · comp', note: '30 MW · Solida · real precedent' },
    { key: 'obrovac', label: 'Obrovac SE', note: '28 MW · Končar · Dalmatian coast' },
    { key: 'worst-case', label: 'Worst case · stress', note: 'low GHI · high rates · queue slip' },
    { key: 'blank', label: 'Blank slate', note: 'empty · build from scratch' },
  ];

  const handleLoadPreset = (key: ProjectMeta['preset']) => {
    loadPreset(key);
    setPresetOpen(false);
    fireToast(`Loaded · ${key}`);
  };

  const handleReset = () => {
    if (confirm('Reset all sections to Kopanica-Beravci default?')) {
      resetAll();
      fireToast('Reset · Kopanica-Beravci default');
    }
  };

  const handleCopyJSON = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(project, null, 2));
      fireToast('JSON copied to clipboard');
    } catch {
      fireToast('Clipboard blocked');
    }
  };

  const handleExportPdf = async () => {
    setExporting(true);
    try {
      // Build a print-ready hidden spec sheet + snapshot
      const node = document.createElement('div');
      node.style.position = 'fixed';
      node.style.left = '-9999px';
      node.style.top = '0';
      node.style.width = '210mm';
      node.style.minHeight = '297mm';
      node.style.padding = '18mm';
      node.style.background = '#fafaf7';
      node.style.color = '#0f0f10';
      node.style.fontFamily = 'JetBrains Mono Variable, monospace';
      node.style.fontSize = '10px';
      node.style.lineHeight = '1.5';
      node.innerHTML = buildSpecSheetHtml(project, finance);
      document.body.appendChild(node);

      const canvas = await html2canvas(node, { backgroundColor: '#fafaf7', scale: 2 });
      document.body.removeChild(node);

      const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
      const imgData = canvas.toDataURL('image/jpeg', 0.92);
      const imgWidthMm = 210;
      const pageHeightMm = 297;
      const imgHeightMm = (canvas.height * imgWidthMm) / canvas.width;
      let heightLeft = imgHeightMm;
      let position = 0;
      let pageIdx = 0;
      while (heightLeft > 0) {
        if (pageIdx > 0) pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, -position, imgWidthMm, imgHeightMm, undefined, 'FAST');
        heightLeft -= pageHeightMm;
        position += pageHeightMm;
        pageIdx += 1;
        if (pageIdx > 8) break;
      }

      pdf.setProperties({
        title: `${project.site.projectName || 'Panonica Project'} · Engineering Spec Sheet`,
        author: project.site.ownerEntity || 'Panonica',
        subject: 'EPC-grade technical specification',
        keywords: 'solar, agrivoltaic, EPC, technical spec',
        creator: 'Panonica Builder v0.1',
      });

      const filename = `${(project.site.projectName || 'panonica').replace(/[^a-z0-9-]/gi, '-').toLowerCase()}-spec-${new Date().toISOString().slice(0, 10)}.pdf`;
      pdf.save(filename);
      fireToast(`Exported · ${filename}`);
    } catch (e) {
      console.error('[builder-pdf]', e);
      fireToast('Export failed · see console');
    } finally {
      setExporting(false);
    }
  };

  const completion = useProjectStore((s) => s.getCompletionPct)();

  return (
    <div className="flex items-center gap-4 border-b border-border bg-surface/50 px-5 py-2.5">
      <div className="flex items-center gap-2">
        <Wrench className="h-4 w-4 text-pulse" strokeWidth={1.8} />
        <span className="font-display text-sm uppercase tracking-tech-tight text-text-primary">
          project builder
        </span>
        <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
          EPC-grade · 16 sections · {project.meta.preset}
        </span>
      </div>

      <div className="h-5 w-px bg-border-bright" />

      {/* Validation summary */}
      <div className="flex items-center gap-2">
        <HealthPill validation={validation} />
      </div>

      <div className="h-5 w-px bg-border-bright" />

      {/* Financial summary */}
      <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
        <SummaryBadge label="CAPEX" value={`€${(finance.capexEur / 1_000_000).toFixed(1)}M`} tone="sun" />
        <SummaryBadge label="IRR" value={`${finance.irrPct.toFixed(1)}%`} tone={finance.irrPct >= 10 ? 'agri' : finance.irrPct >= 7 ? 'sun' : 'spark'} />
        <SummaryBadge label="DSCR" value={`${finance.dscrY1.toFixed(2)}×`} tone={finance.dscrY1 >= 1.3 ? 'agri' : finance.dscrY1 >= 1.15 ? 'sun' : 'spark'} />
        <SummaryBadge label="yield" value={`${finance.annualYieldGwh.toFixed(1)} GWh`} tone="signal" />
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        {/* Preset loader */}
        <div className="relative">
          <button
            onClick={() => setPresetOpen((o) => !o)}
            className="inline-flex items-center gap-1.5 rounded-sm border border-border-bright bg-surface px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-text-secondary transition-colors hover:border-pulse hover:text-pulse"
          >
            <Settings2 className="h-3 w-3" strokeWidth={1.8} />
            preset
            <ChevronDown className={cn('h-3 w-3 transition-transform', presetOpen && 'rotate-180')} strokeWidth={1.8} />
          </button>
          {presetOpen && (
            <div
              className="absolute right-0 top-full z-[60] mt-1 w-[260px] overflow-hidden rounded-md border border-border-bright bg-surface/95 shadow-2xl backdrop-blur"
              onMouseLeave={() => setPresetOpen(false)}
            >
              {presets.map((p) => (
                <button
                  key={p.key}
                  onClick={() => handleLoadPreset(p.key)}
                  className="flex w-full flex-col items-start gap-0.5 border-b border-border/60 px-4 py-2 text-left transition-colors last:border-b-0 hover:bg-pulse/10 hover:text-pulse"
                >
                  <span className="font-mono text-[11px] text-text-primary">{p.label}</span>
                  <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-muted">
                    {p.note}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={onPushToConfigurator}
          className="inline-flex items-center gap-1.5 rounded-sm border border-border-bright bg-surface px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-text-secondary transition-colors hover:border-pulse hover:text-pulse"
          title="Send current build to Configurator (simpler view)"
        >
          → configurator
        </button>

        <button
          onClick={handleCopyJSON}
          className="inline-flex items-center gap-1.5 rounded-sm border border-border-bright bg-surface px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-text-secondary transition-colors hover:border-pulse hover:text-pulse"
        >
          <Copy className="h-3 w-3" strokeWidth={1.8} />
          JSON
        </button>

        <button
          onClick={handleExportPdf}
          disabled={exporting}
          className="inline-flex items-center gap-1.5 rounded-sm border border-agri/40 bg-agri/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-agri transition-all hover:bg-agri/20 hover:shadow-glow-pulse disabled:opacity-40"
        >
          <Download className="h-3 w-3" strokeWidth={1.8} />
          {exporting ? 'exporting…' : 'spec PDF'}
        </button>

        <button
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 rounded-sm border border-border-bright bg-surface px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted transition-colors hover:border-spark hover:text-spark"
          title="Reset to Kopanica-Beravci default"
        >
          <RefreshCcw className="h-3 w-3" strokeWidth={1.8} />
        </button>
      </div>

      {toast && (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-[97] -translate-x-1/2 rounded-md border border-agri/40 bg-agri/15 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.22em] text-agri backdrop-blur">
          <Check className="mr-2 inline h-3 w-3" strokeWidth={2.5} />
          {toast}
        </div>
      )}
    </div>
  );
}

function HealthPill({ validation }: { validation: ValidationResult }) {
  const { errorCount, warnCount, healthScore } = validation;
  const tone = errorCount > 0 ? 'spark' : warnCount > 2 ? 'sun' : 'agri';
  const label = errorCount > 0 ? 'errors' : warnCount > 0 ? 'warnings' : 'healthy';
  const toneCls = { spark: 'bg-spark/10 border-spark/40 text-spark', sun: 'bg-sun/10 border-sun/40 text-sun', agri: 'bg-agri/10 border-agri/40 text-agri' }[tone];
  return (
    <div className={cn('inline-flex items-center gap-2 rounded-sm border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.22em]', toneCls)}>
      {errorCount > 0 ? <AlertTriangle className="h-3 w-3" strokeWidth={1.8} /> : <CheckCircle2 className="h-3 w-3" strokeWidth={1.8} />}
      <span>health {healthScore}/100</span>
      <span className="text-text-muted">·</span>
      <span className="tabular-nums">{errorCount}E</span>
      <span className="tabular-nums">{warnCount}W</span>
    </div>
  );
}

function SummaryBadge({ label, value, tone }: { label: string; value: string; tone: 'agri' | 'sun' | 'spark' | 'signal' }) {
  const toneCls = { agri: 'text-agri', sun: 'text-sun', spark: 'text-spark', signal: 'text-signal' }[tone];
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span>{label}</span>
      <span className={cn('font-display text-sm tracking-tech-tight', toneCls)}>{value}</span>
    </span>
  );
}

function buildSpecSheetHtml(project: any, finance: BuilderFinanceResult): string {
  const s = project;
  return `
    <div style="border-bottom: 2px solid #0f0f10; padding-bottom: 12px; margin-bottom: 16px;">
      <div style="font-size: 9px; letter-spacing: 0.24em; text-transform: uppercase; color: #444;">Engineering Specification Sheet</div>
      <div style="font-size: 24px; font-weight: bold; margin-top: 4px;">${s.site.projectName || 'Panonica Project'}</div>
      <div style="font-size: 11px; color: #666; margin-top: 2px;">${s.site.ownerEntity} · ${s.site.areaHa} ha · ${(s.generation.capacityDcKw / 1000).toFixed(1)} MW · ${new Date().toISOString().slice(0, 10)}</div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 10px; margin-bottom: 16px;">
      <div><div style="font-size: 8px; color: #666; text-transform: uppercase;">CAPEX</div><div style="font-size: 18px; font-weight: bold;">€${(finance.capexEur / 1_000_000).toFixed(2)}M</div></div>
      <div><div style="font-size: 8px; color: #666; text-transform: uppercase;">Y1 Revenue</div><div style="font-size: 18px; font-weight: bold;">€${(finance.annualRevenueEur / 1_000_000).toFixed(2)}M</div></div>
      <div><div style="font-size: 8px; color: #666; text-transform: uppercase;">IRR</div><div style="font-size: 18px; font-weight: bold;">${finance.irrPct.toFixed(1)}%</div></div>
      <div><div style="font-size: 8px; color: #666; text-transform: uppercase;">Exit EV (Y10)</div><div style="font-size: 18px; font-weight: bold;">€${(finance.exitEvEur / 1_000_000).toFixed(1)}M</div></div>
    </div>

    ${specSection('01 · Site', [
      ['Location', `${s.site.centroidLat.toFixed(4)}°N ${s.site.centroidLon.toFixed(4)}°E`],
      ['Area', `${s.site.areaHa} ha`],
      ['Elevation', `${s.site.elevationMinM}–${s.site.elevationMaxM} m`],
      ['Slope', `${s.site.meanSlopePct.toFixed(1)}% · aspect ${s.site.meanAspectDeg}°`],
      ['Soil', `${s.site.soilWrbClass} · ${s.site.soilBearingKpa} kPa`],
      ['Water table', `${s.site.waterTableAvgM} m · flood ${s.site.floodZone100yr}`],
    ])}

    ${specSection('04 · Generation', [
      ['Module', `${s.generation.moduleMake} ${s.generation.moduleModel}`],
      ['Spec', `${s.generation.moduleWp} Wp · η ${s.generation.moduleEfficiencyPct}%${s.generation.moduleBifacial ? ' · bifacial' : ''}`],
      ['Count', `${s.generation.moduleCountTarget.toLocaleString()} modules`],
      ['Capacity DC', `${(s.generation.capacityDcKw / 1000).toFixed(1)} MW`],
      ['Tracking', `${s.generation.tilt}${s.generation.tilt === 'fixed' ? ` @ ${s.generation.tiltDeg}°` : ''} · azimuth ${s.generation.azimuthDeg}°`],
      ['GCR', `${s.generation.groundCoverageRatio.toFixed(2)} · pitch ${s.generation.rowPitchM} m · height ${s.generation.panelHeightMaxM} m`],
      ['Foundation', s.generation.foundation],
    ])}

    ${specSection('05 · Power Electronics', [
      ['Inverter', `${s.powerElectronics.inverterMake} ${s.powerElectronics.inverterModel}`],
      ['Topology', `${s.powerElectronics.inverterTopology} · ${s.powerElectronics.inverterCount} × ${s.powerElectronics.inverterKw} kW`],
      ['Efficiency', `${s.powerElectronics.inverterEffCec}% CEC`],
      ['DC/AC', `${s.powerElectronics.dcAcRatio.toFixed(2)}`],
      ['MPPT config', `${s.powerElectronics.modulesPerString} modules/string · ${s.powerElectronics.stringsPerMppt} strings/MPPT`],
      ['Voc stack', `${s.powerElectronics.vocStackV} V`],
      ['Transformer', `${s.powerElectronics.transformerCount} × ${s.powerElectronics.transformerKva} kVA · ${s.powerElectronics.transformerVectorGroup}`],
    ])}

    ${specSection('06 · Grid Connection', [
      ['PCC', `${s.gridConnection.pccSubstation}`],
      ['Voltage', `${s.gridConnection.pccVoltageKv} kV`],
      ['Cable', `${s.gridConnection.cableCrossSectionMm2} mm² ${s.gridConnection.cableMaterial} · ${s.gridConnection.pccDistanceKm} km`],
      ['Protection', `LVRT: ${s.gridConnection.lvrtCompliant ? '✓' : '✗'} · HVRT: ${s.gridConnection.hvrtCompliant ? '✓' : '✗'} · THD ${s.gridConnection.thdPct}%`],
      ['Communication', s.gridConnection.communicationProtocol],
      ['Queue', `#${s.gridConnection.gridQueuePosition} of ${s.gridConnection.gridQueueTotal} · COD ${s.gridConnection.expectedConnectionDate}`],
    ])}

    ${specSection('07 · Storage', s.storage.enabled ? [
      ['Capacity', `${s.storage.energyMwh} MWh / ${s.storage.powerMw} MW`],
      ['Chemistry', `${s.storage.chemistry.toUpperCase()} · ${s.storage.cRateCharge}C / ${s.storage.cRateDischarge}C`],
      ['Efficiency', `${s.storage.roundTripEffPct}% round-trip`],
      ['Cycles', `${s.storage.cyclesTo80Pct.toLocaleString()} to 80%`],
      ['Thermal', `${s.storage.thermalManagement} · ${s.storage.fireSuppressionSystem}`],
      ['Services', s.storage.gridServicesEnabled.join(' · ') || 'none'],
    ] : [['Storage', 'not deployed']])}

    ${specSection('08 · Agriculture', s.agriculture.system !== 'none' ? [
      ['System', s.agriculture.system],
      ['Flock / crop', `${s.agriculture.flockSizeHead} head · ${s.agriculture.breed}`],
      ['Stocking', `${s.agriculture.stockingRateHeadPerHa} head/ha · ${s.agriculture.grazingPaddocks} paddocks`],
      ['Partner', s.agriculture.coopPartner],
      ['CAP', `P1 ${s.agriculture.capPillar1Eligible ? '✓' : '✗'} · P2 eco ${s.agriculture.capPillar2Ecoscheme ? '✓' : '✗'} · EIP ${s.agriculture.eipAgriOperational ? '✓' : '✗'}`],
      ['Agri revenue', `€${(s.agriculture.annualAgriRevenueEur / 1000).toFixed(0)}k/yr + €${(s.agriculture.annualCapPaymentsEur / 1000).toFixed(0)}k CAP`],
    ] : [['Agriculture', 'none']])}

    ${specSection('11 · Finance', [
      ['Discount rate', `${s.finance.discountRatePct}%`],
      ['PPA', `€${s.finance.ppaPriceEurMwh}/MWh · ${s.finance.ppaTenorYears} yr · ${s.finance.ppaEscalationPctYr}%/yr`],
      ['Capital stack', `${s.finance.senior_debtPct}% senior + ${s.finance.mezzanine_debtPct}% mezz + ${s.finance.sponsorEquityPct}% equity`],
      ['Senior debt', `${s.finance.senior_ratePct}% · ${s.finance.senior_tenorYears} yr · DSCR ${s.finance.senior_dscrCovenant.toFixed(2)}×`],
      ['Y1 DSCR', `${finance.dscrY1.toFixed(2)}×`],
      ['Exit', `Y${s.finance.exitYear} · cap rate ${s.finance.exitCapRatePct}% · EV €${(finance.exitEvEur / 1_000_000).toFixed(1)}M`],
      ['Equity MoM', `${finance.equityMom.toFixed(2)}×`],
    ])}

    <div style="margin-top: 20px; padding-top: 12px; border-top: 1px solid #ccc; font-size: 8px; color: #666;">
      Panonica Builder v0.1 · ${new Date().toISOString()} · preset: ${s.meta.preset} · sections: 16
    </div>
  `;
}

function specSection(title: string, rows: [string, string][]): string {
  return `
    <div style="margin-bottom: 14px;">
      <div style="font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; color: #7C5CFF; border-bottom: 1px solid #7C5CFF; padding-bottom: 3px; margin-bottom: 6px;">${title}</div>
      <div style="display: grid; grid-template-columns: 130px 1fr; gap: 4px 12px;">
        ${rows.map(([k, v]) => `<div style="color: #666; text-transform: uppercase; font-size: 8px; letter-spacing: 0.18em;">${k}</div><div style="font-size: 10px;">${v}</div>`).join('')}
      </div>
    </div>
  `;
}
