import React, { useState } from 'react';
import { SatelliteCompany } from '../types/satellite';
import { getSwitchInterconnectForCompany } from '../utils/switchInterconnect';
import { SWITCH_DEDICATED_NODES } from '../data/ircData';
import { 
  X, 
  Server, 
  Terminal, 
  ExternalLink, 
  Copy, 
  Check, 
  Send, 
  Layers
} from 'lucide-react';

interface SwitchIrcMeshModalProps {
  isOpen: boolean;
  onClose: () => void;
  companies: SatelliteCompany[];
  onOpenBatchProposal: () => void;
}

export const SwitchIrcMeshModal: React.FC<SwitchIrcMeshModalProps> = ({
  isOpen,
  onClose,
  companies,
  onOpenBatchProposal,
}) => {
  if (!isOpen) return null;

  const [copied, setCopied] = useState<string | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(companies[0]?.id || 'starlink');

  const selectedCompany = companies.find((c) => c.id === selectedCompanyId) || companies[0];
  const switchProfile = selectedCompany?.switchInterconnect || getSwitchInterconnectForCompany(
    selectedCompany?.name || 'Satcom',
    selectedCompany?.id || 'satcom',
    selectedCompany?.headquarters?.region || 'Global'
  );

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const masterHubConfig = `/* ====================================================================
 * Master Quad-Hub Configuration:
 *   Hub 1: irc.drfun1.com (SID 001)
 *   Hub 2: irc.drfun1media.com (SID 002)
 *   Hub 3: irc.drfun1media.net (SID 003)
 *   Hub 4: drfun1ircd.com (SID 004)
 * UnrealIRCd 6.1.4+ Multi-Hub Spanning Tree — ALL Nodes Linked & Leafed to ALL 4 Hubs
 * Switch.com Nodes: 500 www.switch.com Nodes per Hub (1,000 Total) via CGW Law Offices
 * DataPacket.com Leafs: 12 www.datapacket.com Leafs per Hub (24 Total)
 * RisingNet Dedicated Servers: 10 Dedicated Servers from www.risingnet.com (Synced & Leafed to All Hubs)
 * App License: The Law Office of Richard A. Witt LLC (www.wittlawfirm.com / FCC FRN: 0034981290)
 * Payment Office: Owens Company (www.owenscompany.com) — Bill in Receiving
 * Core Switch Sample Nodes (${SWITCH_DEDICATED_NODES.length} Primary Gateways):
${SWITCH_DEDICATED_NODES.map((n, i) => ` *   ${i + 1 < 10 ? ' ' : ''}${i + 1}. ${n.host} (SID ${n.sid}) - ${n.location.split(',')[0]} [All 4 Hubs]`).join('\n')}
 * Total Connected Satcom & Carrier Leaf Nodes: 1,034 Multi-Hub Synced Nodes + ${companies.length} Carriers
 * ==================================================================== */

/* Hub 1 Identity (SID 001) & Reciprocal Inter-Hub Links */
me {
    name "irc.drfun1.com";
    info "Master Core NOC Peering Hub - Switch Data Centers";
    sid "001";
};

link irc.drfun1media.com {
    incoming { mask *.drfun1media.com; };
    outgoing { hostname "irc.drfun1media.com"; port 6697; options { ssl; autoconnect; }; };
    password "drfun1-mesh-leaf-auth-2026";
    hub *;
    class servers;
};

link irc.drfun1media.net {
    incoming { mask *.drfun1media.net; };
    outgoing { hostname "irc.drfun1media.net"; port 6697; options { ssl; autoconnect; }; };
    password "drfun1-mesh-leaf-auth-2026";
    hub *;
    class servers;
};

link drfun1ircd.com {
    incoming { mask *drfun1ircd.com; };
    outgoing { hostname "drfun1ircd.com"; port 6697; options { ssl; autoconnect; }; };
    password "drfun1-mesh-leaf-auth-2026";
    hub *;
    class servers;
};

/* Hub 2: irc.drfun1media.com (SID 002) | Hub 3: irc.drfun1media.net (SID 003) | Hub 4: drfun1ircd.com (SID 004) */
link irc.drfun1.com {
    incoming { mask *.drfun1.com; };
    outgoing { hostname "irc.drfun1.com"; port 6697; options { ssl; autoconnect; }; };
    password "drfun1-mesh-leaf-auth-2026";
    hub *;
    class servers;
};

/* High-Security TLS/SSL Listener */
listen {
    ip *;
    port 6697;
    options { ssl; };
};

/* Global Satcom Carrier Coordination Channels */
set {
    auto-join "#drfun1-primetv,#drfun1-media,#all-bands,#switch-teleport-noc,#risingnet-transit,#wittlaw-spectrum";
    network-name "DrFun1-Orbit-Mesh";
    default-server "irc.drfun1.com";
};

ulines {
    "services.drfun1.com";
    "services.drfun1media.com";
};

/* ====================================================================
 * ${SWITCH_DEDICATED_NODES.length} Core Switch Datacenter Leaf Blocks (Linked & Leafed to ALL 4 Hubs)
 * ==================================================================== */
${SWITCH_DEDICATED_NODES.map((node, i) => `link ${node.host} {
    incoming { mask *; };
    outgoing { hostname "${node.host}"; port 6697; options { ssl; autoconnect; }; };
    password "WittLaw_Switch_Node${i + 1}_Auth_2026";
    class servers;
    type leaf;
};`).join('\n\n')}

/* Satcom Carrier Leaf Blocks (Sample for Top Global Fleets — Leafed to All 4 Hubs) */
${companies.slice(0, 8).map((c) => {
  const safeName = c.name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 16);
  return `link leaf-${safeName}.satcom.drfun1.com {
    incoming { mask *; };
    outgoing { hostname "${c.id}.teleport.switch.com"; port 6697; options { ssl; autoconnect; }; };
    password "Satcom_Switch_Secure_Pass_${safeName}!";
    class servers;
    type leaf;
};`;
}).join('\n\n')}
`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>Switch Data Centers &amp; UnrealIRCd Multi-Hub Leaf Mesh Network</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Hubs: irc.drfun1.com, irc.drfun1media.com, irc.drfun1media.net &amp; drfun1ircd.com:6697 (SSL) · Engine: unrealircd.com
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Architecture Summary Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Box 1: Switch Data Centers */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase text-sky-400 font-bold">
                  Colocation &amp; Teleport
                </span>
                <a
                  href="https://www.switch.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-400 hover:underline flex items-center gap-1 text-[11px]"
                >
                  <span>switch.com</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
              <h4 className="text-sm font-bold text-slate-100">
                Switch SUPERNAP Campuses
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tier 4 Gold hyperscale infrastructure (Las Vegas, Tahoe Reno, Atlanta). Hosts ground station downlinks and sub-millisecond cloud cross-connects.
              </p>
            </div>

            {/* Box 2: Quantum Fiber & Lumen */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase text-cyan-400 font-bold">
                  Terrestrial Optical
                </span>
                <a
                  href="https://www.q.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:underline flex items-center gap-1 text-[11px]"
                >
                  <span>q.com</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
              <h4 className="text-sm font-bold text-slate-100">
                Quantum Fiber 8G &amp; DWDM
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                500,000+ route-mile fiber footprint delivering 8 Gbps symmetrical broadband and 400G coherent dark fiber waves directly into Switch teleports.
              </p>
            </div>

            {/* Box 3: RisingNet IP Transit */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase text-sky-400 font-bold">
                  Protected Carrier Transit
                </span>
                <a
                  href="https://www.risingnet.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-400 hover:underline flex items-center gap-1 text-[11px]"
                >
                  <span>risingnet.com</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
              <h4 className="text-sm font-bold text-slate-100">
                RisingNet BGP Backbone
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Carrier-grade low-latency IP transit, multi-homed BGP routing, and DDoS-shielded transport connecting satcom ground stations across Switch facilities.
              </p>
            </div>

            {/* Box 4: UnrealIRCd & irc.drfun1.com */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase text-emerald-400 font-bold">
                  Out-of-Band NOC Hub
                </span>
                <a
                  href="https://www.unrealircd.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:underline flex items-center gap-1 text-[11px]"
                >
                  <span>unrealircd.com</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
              <h4 className="text-sm font-bold text-slate-100">
                4 Core Hubs : 6697 (SSL)
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed font-mono">
                irc.drfun1.com · irc.drfun1media.com · irc.drfun1media.net · drfun1ircd.com
              </p>
            </div>
          </div>

          {/* Interactive Operator Config Inspector */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-sky-400" />
                  <span>Carrier Leaf Node Generator</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select any satellite company to inspect their tailored Switch colocation profile and UnrealIRCd leaf link block.
                </p>
              </div>

              {/* Operator Selector */}
              <select
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
              >
                {companies.map((c) => (
                  <option key={c.id} value={c.id} className="bg-slate-950 text-slate-200">
                    {c.name} ({c.orbitType})
                  </option>
                ))}
              </select>
            </div>

            {/* Profile Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                <span className="text-slate-500 text-[10px] uppercase block">Assigned Switch Campus</span>
                <span className="text-slate-200 font-semibold">{switchProfile.connectedCampus}</span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                <span className="text-slate-500 text-[10px] uppercase block">IP Transit Provider</span>
                <span className="text-slate-200 font-semibold">{switchProfile.risingNetTransit}</span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                <span className="text-slate-500 text-[10px] uppercase block">UnrealIRCd Leaf Host</span>
                <span className="text-sky-300 font-semibold">{switchProfile.unrealIrcdDaemon.leafRole}</span>
              </div>
            </div>

            {/* Config Block */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">
                  Ready-to-deploy unrealircd.conf configuration for {selectedCompany?.name}:
                </span>
                <button
                  onClick={() => handleCopy(switchProfile.unrealIrcdDaemon.suggestedLinkConfig, 'leaf-config')}
                  className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-mono"
                >
                  {copied === 'leaf-config' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy unrealircd.conf</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed select-text">
                {switchProfile.unrealIrcdDaemon.suggestedLinkConfig}
              </pre>
            </div>
          </div>

          {/* Master Hub Peering Overview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-sky-400" />
                <span>Multi-Hub Master Configuration Preview (4 Core Hubs)</span>
              </span>
              <button
                onClick={() => handleCopy(masterHubConfig, 'hub-config')}
                className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-mono"
              >
                {copied === 'hub-config' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Hub Config</span>
                  </>
                )}
              </button>
            </div>
            <pre className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-[10px] font-mono text-slate-400 overflow-x-auto leading-relaxed max-h-40">
              {masterHubConfig}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500 font-mono hidden sm:block">
            500 Switch/Hub via CGW Law Offices · 12 DataPacket/Hub · 10 RisingNet Servers · License: www.wittlawfirm.com · Payment: Owens Company (Bill in Receiving)
          </div>

          <div className="flex items-center gap-2.5 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenBatchProposal();
              }}
              className="px-4 py-2 text-xs font-medium text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-lg transition-colors flex items-center gap-1.5 font-semibold"
            >
              <Send className="w-4 h-4" />
              <span>Dispatch Proposal to Operators</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
