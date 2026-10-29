import React, { useState } from 'react';
import { TvuCloudCdnConfig, BondedInterface, TvuCloudEdgeNode } from '../../types/stream';
import { TVU_CODE_SNIPPETS } from '../../data/streamData';
import { 
  Tv, 
  Server, 
  Code2, 
  Copy, 
  Check, 
  ExternalLink, 
  Activity, 
  Wifi, 
  ShieldCheck, 
  RefreshCw, 
  Globe, 
  Terminal, 
  Zap, 
  Layers, 
  Radio, 
  ChevronRight, 
  Sliders 
} from 'lucide-react';

interface TvuNetworksCdnClonePanelProps {
  tvuConfig: TvuCloudCdnConfig;
  onUpdateTvuConfig: (updated: Partial<TvuCloudCdnConfig>) => void;
  onOpenLicense: () => void;
  onOpenSwitchMesh: () => void;
}

export const TvuNetworksCdnClonePanel: React.FC<TvuNetworksCdnClonePanelProps> = ({
  tvuConfig,
  onUpdateTvuConfig,
  onOpenLicense,
  onOpenSwitchMesh,
}) => {
  const [activeCodeTab, setActiveCodeTab] = useState<'nodejs' | 'curl' | 'python' | 'ffmpeg' | 'json'>('nodejs');
  const [copiedCode, setCopiedCode] = useState(false);
  const [simulatingFailover, setSimulatingFailover] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const activeSnippet = TVU_CODE_SNIPPETS[activeCodeTab];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeSnippet.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSimulateFailover = () => {
    setSimulatingFailover(true);
    setTestResult('Simulating satellite attenuation... ISSP dynamically shifting traffic to Switch SUPERNAP 100G fiber');
    setTimeout(() => {
      setSimulatingFailover(false);
      setTestResult('Zero dropped frames (0.00% loss). All 2,840 TVU Grid receivers stayed locked to 4K UHD 60fps.');
    }, 2000);
  };

  // Calculate total bonded capacity
  const totalBondedBitrate = tvuConfig.bondedInterfaces.reduce((sum, iface) => sum + iface.bitrateMbps, 0);
  const totalEdgeEgress = tvuConfig.edgeNodes.reduce((sum, node) => sum + node.egressGbps, 0);

  return (
    <div className="p-4 space-y-5 text-xs text-slate-200">
      {/* TVU Networks Cloud Ecosystem Header */}
      <div className="bg-gradient-to-r from-cyan-950/70 via-slate-900 to-indigo-950/70 border border-cyan-500/30 rounded-xl p-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm tracking-wide">
                  TVU Networks Cloud CDN &amp; Grid Router
                </span>
                <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold border border-cyan-500/30">
                  CLONE ENGINE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 flex flex-wrap items-center gap-2">
                <span>Ecosystem: <a href="https://www.tvunetworks.com" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">www.tvunetworks.com</a></span>
                <span className="text-slate-600">·</span>
                <span>Bonding: <strong className="text-emerald-400 font-medium">ISSP (Inverse StatMux Plus)</strong></span>
                <span className="text-slate-600">·</span>
                <span>Teleport Origin: <strong className="text-sky-400 font-medium">Switch SUPERNAP</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://www.tvunetworks.com"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <span>TVUNetworks.com</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* ISSP (Inverse StatMux Plus) Bonding Telemetry Visualizer */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              TVU ISSP Bonded Uplink Telemetry (Inverse StatMux Plus)
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Simultaneous multi-path packet multiplexing across terrestrial 100G fiber &amp; low-latency satellite constellations.
            </p>
          </div>

          <div className="text-right font-mono">
            <div className="text-sm font-bold text-emerald-400">{totalBondedBitrate} Mbps</div>
            <div className="text-[10px] text-slate-500">Aggregate Headroom</div>
          </div>
        </div>

        {/* Bonded Link Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {tvuConfig.bondedInterfaces.map(iface => (
            <div
              key={iface.id}
              className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200 truncate">{iface.name}</span>
                <span className={`px-1.5 py-0.2 rounded font-mono text-[9px] ${
                  iface.status === 'active' 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {iface.status.toUpperCase()}
                </span>
              </div>

              <div className="text-[10px] text-slate-400 mt-1 truncate">
                {iface.carrier}
              </div>

              <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between font-mono text-[10px]">
                <span className="text-cyan-400 font-bold">{iface.bitrateMbps} Mbps</span>
                <span className="text-slate-400">{iface.latencyMs} ms RTT</span>
                <span className="text-emerald-400">{iface.packetLossPercent}% loss</span>
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Failover simulation button */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <button
            onClick={handleSimulateFailover}
            disabled={simulatingFailover}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 font-medium flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${simulatingFailover ? 'animate-spin text-cyan-400' : ''}`} />
            <span>Test ISSP Satellite Rain-Fade Failover</span>
          </button>

          {testResult && (
            <span className="text-emerald-400 font-mono text-[11px]">
              {testResult}
            </span>
          )}
        </div>
      </div>

      {/* TVU Grid Receiver Topology (Point-to-Multipoint IP Video Distribution) */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              TVU Grid Global Edge Replication Nodes
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Point-to-multipoint distribution replicating broadcast feed with sub-second latency worldwide.
            </p>
          </div>

          <div className="text-right font-mono">
            <div className="text-sm font-bold text-indigo-400">{totalEdgeEgress.toFixed(1)} Gbps</div>
            <div className="text-[10px] text-slate-500">Global Grid Capacity</div>
          </div>
        </div>

        <div className="space-y-2">
          {tvuConfig.edgeNodes.map(node => (
            <div
              key={node.id}
              className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800 flex flex-wrap items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <div>
                  <div className="font-semibold text-white text-xs">{node.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{node.datacenter} ({node.location})</div>
                </div>
              </div>

              <div className="flex items-center gap-4 font-mono text-[11px]">
                <div className="text-right">
                  <div className="text-slate-200">{node.egressGbps} Gbps</div>
                  <div className="text-[9px] text-slate-500">Bandwidth</div>
                </div>
                <div className="text-right">
                  <div className="text-slate-200">{node.loadPercent}%</div>
                  <div className="text-[9px] text-slate-500">Compute Load</div>
                </div>
                <div className="text-right">
                  <div className="text-emerald-400">{node.latencyMs} ms</div>
                  <div className="text-[9px] text-slate-500">Latency to Origin</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TVU Cloud CDN Clone Code Generator */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-cyan-400" />
            <div>
              <span className="font-bold text-white text-xs">
                TVU Networks Cloud CDN Integration Code
              </span>
              <p className="text-[10px] text-slate-400 font-mono">
                Production-grade implementations for TVU Producer v3 &amp; TVU Grid
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCode}
              className="px-2.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition-colors"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copied Code!' : 'Copy Code'}</span>
            </button>
          </div>
        </div>

        {/* Code tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/80 px-2 pt-1 gap-1 overflow-x-auto">
          {[
            { id: 'nodejs', label: 'Node.js / TS (SDK)' },
            { id: 'curl', label: 'cURL / REST API' },
            { id: 'python', label: 'Python (Webhook)' },
            { id: 'ffmpeg', label: 'FFmpeg Playout' },
            { id: 'json', label: 'TVU Grid Topology' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveCodeTab(tab.id as any)}
              className={`py-2 px-3 text-xs font-mono font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                activeCodeTab === tab.id
                  ? 'bg-slate-900 text-cyan-400 border-t-2 border-cyan-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Code snippet info & preview */}
        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-bold text-white">{activeSnippet.title}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{activeSnippet.description}</p>
            </div>
            <span className="font-mono text-[10px] text-slate-500 bg-slate-900 px-2 py-1 rounded border border-slate-800">
              {activeSnippet.filename}
            </span>
          </div>

          <div className="relative rounded-lg bg-slate-900/90 border border-slate-800 p-3 font-mono text-[11px] overflow-x-auto max-h-[360px] text-slate-300 leading-relaxed">
            <pre>{activeSnippet.code}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
