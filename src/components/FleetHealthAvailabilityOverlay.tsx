import React, { useState, useEffect, useRef, useMemo } from 'react';
import { SatelliteCompany, TelemetryStatus, SatelliteTelemetryNode, FleetHealthTelemetryState } from '../types/satellite';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  X, 
  Satellite, 
  SlidersHorizontal, 
  Search, 
  Zap, 
  ShieldCheck, 
  Radio, 
  Clock, 
  ChevronRight, 
  Terminal, 
  Wifi, 
  Download, 
  Mail, 
  Play, 
  Pause,
  Layers,
  ArrowUpRight
} from 'lucide-react';

interface FleetHealthAvailabilityOverlayProps {
  company: SatelliteCompany;
  onClose: () => void;
  onOpenRfq: (company: SatelliteCompany) => void;
}

// Helper to seed realistic mocked telemetry nodes for an operator
function generateInitialFleetTelemetry(company: SatelliteCompany): SatelliteTelemetryNode[] {
  const activeSats = company.fleetSize?.activeSatellites || 16;
  // Create 18 to 24 representative nodes for the fleet
  const sampleCount = Math.min(Math.max(activeSats > 50 ? 24 : 16, 12), 28);
  const planes = ['Polar Plane A (53°)', 'Polar Plane B (70°)', 'Equatorial Ring (0°)', 'Walker Delta Plane C', 'Sun-Synchronous (98°)'];
  const bands = company.frequencyBands.length > 0 ? company.frequencyBands : ['Ka-band', 'Ku-band'];

  const nodes: SatelliteTelemetryNode[] = [];

  for (let i = 0; i < sampleCount; i++) {
    const num = i + 1;
    const padNum = num < 10 ? `0${num}` : `${num}`;
    const plane = planes[i % planes.length];
    const band = bands[i % bands.length];

    // Majority Active, a few Degraded, rare Offline (1 in 20)
    let status: TelemetryStatus = 'Active';
    let statusReason = 'Nominal RF payload operation; telemetry stream locked with teleport ground gate.';
    let snrDb = Number((13.5 + Math.random() * 4.2).toFixed(1));
    let batteryPct = Math.floor(92 + Math.random() * 8);
    let payloadUtil = Math.floor(65 + Math.random() * 32);

    if (i === 3 || i === 11) {
      status = 'Degraded';
      statusReason = 'Payload thermal variance detected; spot beams throttled to 75% for cooling.';
      snrDb = Number((9.2 + Math.random() * 2.1).toFixed(1));
      batteryPct = Math.floor(78 + Math.random() * 10);
      payloadUtil = Math.floor(45 + Math.random() * 20);
    } else if (i === sampleCount - 2 && sampleCount > 14) {
      status = 'Offline';
      statusReason = 'Spacecraft in safe-mode for routine reaction wheel desaturation and station-keeping burn.';
      snrDb = 0;
      batteryPct = Math.floor(65 + Math.random() * 15);
      payloadUtil = 0;
    }

    nodes.push({
      id: `${company.id}-sv-${padNum}`,
      name: `${company.name.split(' ')[0]} SV-${padNum}`,
      orbitalPlane: plane,
      altitudeKm: company.altitudeKm || '550 km',
      frequencyBand: band,
      status,
      snrDb,
      batteryPct,
      tempCelsius: Math.floor(14 + Math.random() * 12),
      laserCrosslinkStatus: status === 'Offline' ? 'Offline' : status === 'Degraded' ? 'Acquiring' : 'Nominal',
      latencyMs: Math.round((parseInt(company.latencyMs) || 32) + (Math.random() * 6 - 3)),
      lastTelemetryUpdate: 'Just now',
      statusReason,
      payloadUtilizationPct: payloadUtil,
    });
  }

  return nodes;
}

export const FleetHealthAvailabilityOverlay: React.FC<FleetHealthAvailabilityOverlayProps> = ({
  company,
  onClose,
  onOpenRfq,
}) => {
  const [nodes, setNodes] = useState<SatelliteTelemetryNode[]>(() => generateInitialFleetTelemetry(company));
  const [selectedNode, setSelectedNode] = useState<SatelliteTelemetryNode | null>(null);
  const [statusFilter, setStatusFilter] = useState<'All' | TelemetryStatus>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAutoPollActive, setIsAutoPollActive] = useState(true);
  const [isPollingNow, setIsPollingNow] = useState(false);
  const [pollCountdown, setPollCountdown] = useState(4);
  const [lastPolledTime, setLastPolledTime] = useState<string>(new Date().toLocaleTimeString());
  
  // Real-time telemetry event logs
  const [telemetryLogs, setTelemetryLogs] = useState<Array<{ id: string; time: string; text: string; type: 'info' | 'active' | 'degraded' | 'offline' }>>([
    {
      id: 'log-1',
      time: new Date(Date.now() - 12000).toLocaleTimeString(),
      text: `Master telemetry handshake completed across ${company.name} constellation. 99.98% availability verified.`,
      type: 'info'
    },
    {
      id: 'log-2',
      time: new Date(Date.now() - 7000).toLocaleTimeString(),
      text: `SV-04: Transponder backhaul nominal. Laser crosslink mesh locked with adjacent orbital plane.`,
      type: 'active'
    },
    {
      id: 'log-3',
      time: new Date(Date.now() - 2000).toLocaleTimeString(),
      text: `Switch SUPERNAP Teleport Gateway reports 0.00% packet loss on direct ground receiver array.`,
      type: 'info'
    }
  ]);

  const logScrollRef = useRef<HTMLDivElement>(null);

  // Auto-poll countdown & mock update engine
  useEffect(() => {
    if (!isAutoPollActive) return;

    const interval = setInterval(() => {
      setPollCountdown((prev) => {
        if (prev <= 1) {
          triggerMockTelemetryPoll();
          return 4;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isAutoPollActive]);

  // Execute a simulated telemetry polling update
  const triggerMockTelemetryPoll = () => {
    setIsPollingNow(true);
    setLastPolledTime(new Date().toLocaleTimeString());

    // Randomly update 1 or 2 satellites with slight fluctuations
    setNodes((prevNodes) => {
      const updated = [...prevNodes];
      const randomIndex = Math.floor(Math.random() * updated.length);
      const target = { ...updated[randomIndex] };

      const timeStr = new Date().toLocaleTimeString();
      let logType: 'info' | 'active' | 'degraded' | 'offline' = 'active';
      let logMsg = '';

      // Occasionally transition degraded to active or fluctuate SNR
      if (target.status === 'Degraded' && Math.random() > 0.45) {
        target.status = 'Active';
        target.statusReason = 'Thermal equilibrium restored; spot beam power returned to 100%.';
        target.snrDb = Number((14.0 + Math.random() * 3).toFixed(1));
        target.laserCrosslinkStatus = 'Nominal';
        logMsg = `${target.name}: Thermal variance resolved. Status transitioned Degraded -> Active.`;
        logType = 'active';
      } else if (target.status === 'Active' && Math.random() > 0.88) {
        target.status = 'Degraded';
        target.statusReason = 'Momentum wheel calibration cycle in progress; payload throughput attenuated.';
        target.snrDb = Number((9.8 + Math.random() * 1.5).toFixed(1));
        target.laserCrosslinkStatus = 'Acquiring';
        logMsg = `${target.name}: Calibration cycle started. Status transitioned Active -> Degraded.`;
        logType = 'degraded';
      } else {
        // Standard ping refresh
        target.snrDb = Number(Math.max(8.5, target.snrDb + (Math.random() * 0.8 - 0.4)).toFixed(1));
        target.batteryPct = Math.min(100, Math.max(70, target.batteryPct + (Math.random() > 0.5 ? 1 : -1)));
        target.lastTelemetryUpdate = 'Just now';
        logMsg = `${target.name}: Telemetry beacon nominal (${target.frequencyBand}, SNR ${target.snrDb} dB).`;
        logType = target.status === 'Active' ? 'active' : target.status === 'Degraded' ? 'degraded' : 'offline';
      }

      updated[randomIndex] = target;

      // Append to live logs
      setTelemetryLogs((prev) => [
        {
          id: `log-${Date.now()}`,
          time: timeStr,
          text: logMsg,
          type: logType,
        },
        ...prev.slice(0, 15)
      ]);

      return updated;
    });

    setTimeout(() => setIsPollingNow(false), 450);
  };

  // Compute live availability statistics
  const stats = useMemo(() => {
    const total = nodes.length;
    const active = nodes.filter((n) => n.status === 'Active').length;
    const degraded = nodes.filter((n) => n.status === 'Degraded').length;
    const offline = nodes.filter((n) => n.status === 'Offline').length;
    
    // Availability formula: (Active * 100 + Degraded * 50) / Total
    const availabilityPct = total > 0 ? Number(((active * 100 + degraded * 65) / total).toFixed(2)) : 99.98;

    return {
      total,
      active,
      degraded,
      offline,
      availabilityPct,
      activePct: ((active / total) * 100).toFixed(1),
      degradedPct: ((degraded / total) * 100).toFixed(1),
      offlinePct: ((offline / total) * 100).toFixed(1),
    };
  }, [nodes]);

  // Filtered nodes
  const filteredNodes = useMemo(() => {
    return nodes.filter((node) => {
      const matchesStatus = statusFilter === 'All' || node.status === statusFilter;
      const matchesSearch = 
        node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.orbitalPlane.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.frequencyBand.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [nodes, statusFilter, searchQuery]);

  return (
    <div className="absolute inset-0 z-30 bg-slate-950/95 backdrop-blur-md flex flex-col overflow-hidden text-slate-200 animate-in fade-in duration-200">
      {/* 1. OVERLAY HEADER */}
      <div className="px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 flex items-center justify-between gap-4 shrink-0 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-sky-500 to-indigo-600 p-0.5 shadow-md flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide flex items-center gap-2">
                <span>Fleet Health &amp; Availability</span>
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>REAL-TIME TELEMETRY</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-950 text-sky-300 border border-sky-800/40">
                {company.name}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Live orbital constellation telemetry stream &bull; Monitored at Switch SUPERNAP Teleport &bull; FRN: 0034981290
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Auto-Poll Toggle */}
          <button
            onClick={() => setIsAutoPollActive(!isAutoPollActive)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold border flex items-center gap-1.5 transition cursor-pointer ${
              isAutoPollActive
                ? 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
                : 'bg-amber-950/60 border-amber-600/40 text-amber-300'
            }`}
            title={isAutoPollActive ? 'Pause automated polling' : 'Resume automated polling'}
          >
            {isAutoPollActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isAutoPollActive ? `Poll in ${pollCountdown}s` : 'Paused'}</span>
          </button>

          {/* Trigger Manual Poll */}
          <button
            onClick={() => triggerMockTelemetryPoll()}
            disabled={isPollingNow}
            className="p-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 transition cursor-pointer disabled:opacity-50"
            title="Poll fresh constellation telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${isPollingNow ? 'animate-spin text-sky-400' : ''}`} />
          </button>

          {/* Close Overlay */}
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
            title="Close Fleet Health overlay"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 2. TOP METRIC SCORECARDS */}
      <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/60 grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
        {/* Availability SLA Card */}
        <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono text-[11px] uppercase tracking-wider">Constellation Availability</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-emerald-400 tracking-tight">
              {stats.availabilityPct}%
            </span>
            <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-500/30">
              5-Nines SLA
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 mt-1">
            Carrier-grade SLA audited 24/7
          </span>
        </div>

        {/* Active Spacecraft Card */}
        <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono text-[11px] uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Active Nodes</span>
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-white tracking-tight">
              {stats.active}
            </span>
            <span className="text-xs font-mono text-emerald-400">
              ({stats.activePct}%)
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 mt-1">
            Transmitting 100% nominal telemetry
          </span>
        </div>

        {/* Degraded Spacecraft Card */}
        <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono text-[11px] uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Degraded Nodes</span>
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-amber-300 tracking-tight">
              {stats.degraded}
            </span>
            <span className="text-xs font-mono text-amber-400">
              ({stats.degradedPct}%)
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 mt-1">
            Orbital re-phasing or thermal calibration
          </span>
        </div>

        {/* Offline Spacecraft Card */}
        <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-mono text-[11px] uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Offline Nodes</span>
            </span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-rose-400 tracking-tight">
              {stats.offline}
            </span>
            <span className="text-xs font-mono text-rose-400">
              ({stats.offlinePct}%)
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 mt-1">
            Safe-mode or decommission cycle
          </span>
        </div>
      </div>

      {/* 3. FILTER & SEARCH TOOLBAR */}
      <div className="px-6 py-3 border-b border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setStatusFilter('All')}
            className={`px-3 py-1 rounded-lg transition cursor-pointer ${
              statusFilter === 'All'
                ? 'bg-slate-800 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Nodes ({stats.total})
          </button>
          <button
            onClick={() => setStatusFilter('Active')}
            className={`px-3 py-1 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'Active'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                : 'text-emerald-400 hover:bg-slate-800'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>Active ({stats.active})</span>
          </button>
          <button
            onClick={() => setStatusFilter('Degraded')}
            className={`px-3 py-1 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'Degraded'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-amber-400 hover:bg-slate-800'
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            <span>Degraded ({stats.degraded})</span>
          </button>
          <button
            onClick={() => setStatusFilter('Offline')}
            className={`px-3 py-1 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'Offline'
                ? 'bg-rose-600 text-white font-bold shadow-sm'
                : 'text-rose-400 hover:bg-slate-800'
            }`}
          >
            <XCircle className="w-3 h-3" />
            <span>Offline ({stats.offline})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter satellite ID, plane, band..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
          />
        </div>
      </div>

      {/* 4. MAIN SCROLLABLE TELEMETRY WORKSPACE */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Constellation Grid of Telemetry Markers */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-2">
              <Satellite className="w-4 h-4 text-sky-400" />
              <span>Constellation Telemetry Markers ({filteredNodes.length} space vehicles)</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-500">
              Click any node to inspect deep telemetry bus
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredNodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-indigo-950/40 border-sky-400 shadow-md ring-1 ring-sky-400/50'
                      : node.status === 'Active'
                      ? 'bg-slate-900/60 border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900'
                      : node.status === 'Degraded'
                      ? 'bg-amber-950/20 border-amber-800/40 hover:border-amber-500 hover:bg-amber-950/30'
                      : 'bg-rose-950/20 border-rose-800/40 hover:border-rose-500 hover:bg-rose-950/30'
                  }`}
                >
                  <div>
                    {/* Node Header */}
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-white">
                          {node.name}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                          {node.frequencyBand.split(' ')[0]}
                        </span>
                      </div>

                      {/* Status Marker Badge */}
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border flex items-center gap-1 ${
                          node.status === 'Active'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                            : node.status === 'Degraded'
                            ? 'bg-amber-950 text-amber-300 border-amber-500/40'
                            : 'bg-rose-950 text-rose-300 border-rose-500/40'
                        }`}
                      >
                        {node.status === 'Active' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />}
                        {node.status === 'Degraded' && <AlertTriangle className="w-2.5 h-2.5 text-amber-400" />}
                        {node.status === 'Offline' && <XCircle className="w-2.5 h-2.5 text-rose-400" />}
                        <span>{node.status}</span>
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 font-mono line-clamp-1 mb-2">
                      {node.orbitalPlane} &bull; {node.altitudeKm}
                    </div>

                    {/* Sensor Metric Readout Bar */}
                    <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-800/60 font-mono text-[10px]">
                      <div>
                        <span className="text-slate-500 block">SNR Ratio</span>
                        <span className={node.snrDb > 12 ? 'text-emerald-400 font-bold' : node.snrDb > 8 ? 'text-amber-400 font-bold' : 'text-rose-400 font-bold'}>
                          {node.snrDb > 0 ? `${node.snrDb} dB` : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Solar Batt</span>
                        <span className="text-slate-300 font-bold">{node.batteryPct}%</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Payload</span>
                        <span className="text-sky-300 font-bold">{node.payloadUtilizationPct}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Status update summary note */}
                  <div className="mt-2.5 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span className="truncate max-w-[210px] text-slate-400 italic">
                      {node.statusReason}
                    </span>
                    <span className="text-slate-500 shrink-0 ml-1">
                      {node.lastTelemetryUpdate}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5. DEEP TELEMETRY BUS INSPECTOR (If node is selected) */}
        {selectedNode && (
          <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-sky-500/40 rounded-2xl shadow-xl space-y-4 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-sky-950 border border-sky-500/40 text-sky-400">
                  <Satellite className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white font-mono">
                      {selectedNode.name} Deep Telemetry Bus Inspector
                    </h4>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border flex items-center gap-1 ${
                        selectedNode.status === 'Active'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                          : selectedNode.status === 'Degraded'
                          ? 'bg-amber-950 text-amber-300 border-amber-500/40'
                          : 'bg-rose-950 text-rose-300 border-rose-500/40'
                      }`}
                    >
                      {selectedNode.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Orbital Slot: {selectedNode.orbitalPlane} &bull; Altitude: {selectedNode.altitudeKm} &bull; Telemetry Uplink: Switch SUPERNAP
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedNode(null)}
                className="text-xs font-mono text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
              >
                Close Inspector
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500 text-[11px] block">Carrier SNR Level</span>
                <span className="text-lg font-bold text-emerald-400">{selectedNode.snrDb} dB</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Min threshold: 8.0 dB</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500 text-[11px] block">Laser Mesh Crosslink</span>
                <span className="text-lg font-bold text-sky-300">{selectedNode.laserCrosslinkStatus}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">1550nm inter-satellite link</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500 text-[11px] block">Solar Array Thermal</span>
                <span className="text-lg font-bold text-amber-300">{selectedNode.tempCelsius}°C</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Nominal: -20°C to +45°C</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500 text-[11px] block">Downlink Round-Trip</span>
                <span className="text-lg font-bold text-purple-300">{selectedNode.latencyMs} ms</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Ground teleport interface</span>
              </div>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 flex items-center justify-between">
              <div>
                <span className="text-slate-500 mr-2">Status Diagnostic:</span>
                <span>{selectedNode.statusReason}</span>
              </div>
              <button
                onClick={() => onOpenRfq(company)}
                className="px-3 py-1 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-lg text-xs transition cursor-pointer"
              >
                Inquire Capacity
              </button>
            </div>
          </div>
        )}

        {/* 6. LIVE REAL-TIME TELEMETRY LOG / TERMINAL FEED */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-slate-200">Real-Time Constellation Telemetry Feed</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Streaming Live &bull; Polled {lastPolledTime}</span>
            </div>
          </div>

          <div
            ref={logScrollRef}
            className="p-4 max-h-[160px] overflow-y-auto space-y-1.5 font-mono text-[11px] bg-slate-950 text-slate-300 select-text"
          >
            {telemetryLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-2.5 leading-relaxed">
                <span className="text-slate-500 shrink-0">[{log.time}]</span>
                <span
                  className={
                    log.type === 'active'
                      ? 'text-emerald-400'
                      : log.type === 'degraded'
                      ? 'text-amber-400'
                      : log.type === 'offline'
                      ? 'text-rose-400'
                      : 'text-sky-300'
                  }
                >
                  &rsaquo;
                </span>
                <span className="flex-1">{log.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 7. OVERLAY FOOTER ACTIONS */}
      <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-900/80 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs font-mono">
        <div className="flex items-center gap-3 text-slate-400">
          <span className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span>Telemetry verified via Switch SUPERNAP Vault #01</span>
          </span>
          <span className="text-slate-700 hidden sm:inline">&bull;</span>
          <span className="text-slate-500 hidden sm:inline">UnrealIRCd Mesh Sync: irc.drfun1.com</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenRfq(company)}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm shadow-sky-500/20 cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Compose Capacity RFQ</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition cursor-pointer"
          >
            Close Telemetry View
          </button>
        </div>
      </div>
    </div>
  );
};
