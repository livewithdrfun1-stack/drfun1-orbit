import React, { useState } from 'react';
import { SatelliteCompany } from '../types/satellite';
import { getSwitchInterconnectForCompany } from '../utils/switchInterconnect';
import { 
  X, 
  Server, 
  Terminal, 
  ExternalLink, 
  Copy, 
  Check, 
  Send, 
  Layers, 
  Radio, 
  Globe, 
  ShieldCheck,
  Cpu
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
 * Master Hub Configuration on irc.drfun1.com (UnrealIRCd 6.1+)
 * Core Teleport Colocation: Switch SUPERNAP (www.switch.com)
 * Tier-1 Carrier IP Transit: RisingNet BGP Transit (www.risingnet.com)
 * Licensed to: Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * All 12 Dedicated Switch Nodes Leafed to irc.drfun1.com:
 *   1. node1.lasvegas.switch.drfun1.com (SID 002) - Las Vegas Core
 *   2. node2.tahoereno.switch.drfun1.com (SID 003) - Tahoe Reno Citadel
 *   3. node3.grandrapids.switch.drfun1.com (SID 004) - Pyramid Grand Rapids
 *   4. node4.atlanta.switch.drfun1.com (SID 005) - The Keep Atlanta
 *   5. node5.space-teleport.switch.drfun1.com (SID 006) - Space Teleport Gateway
 *   6. node6.austin.switch.drfun1.com (SID 007) - Texas Core Teleport
 *   7. node7.chicago.switch.drfun1.com (SID 008) - Great Lakes Gateway
 *   8. node8.seattle.switch.drfun1.com (SID 009) - PNW Transpacific Teleport
 *   9. node9.newyork.switch.drfun1.com (SID 010) - East Coast Optical Teleport
 *  10. node10.london.switch.drfun1.com (SID 011) - European Optical Teleport
 *  11. node11.tokyo.switch.drfun1.com (SID 012) - Asia-Pacific Teleport
 *  12. node12.hawaii.switch.drfun1.com (SID 013) - Pacific Orbital Teleport
 * Total Connected Satcom Leaf Nodes: ${companies.length} Carriers
 * ==================================================================== */

me {
    name "irc.drfun1.com";
    info "Satcom Teleport Core NOC Peering Hub - Switch Data Centers";
    sid "001";
};

/* High-Security TLS/SSL Listener */
listen {
    ip *;
    port 6697;
    options { ssl; };
};

/* Global Satcom Carrier Coordination Channels */
set {
    auto-join "#drfun1-media,#all-bands,#switch-teleport-noc,#risingnet-transit,#wittlaw-spectrum";
    network-name "DrFun1-Orbit-Mesh";
    default-server "irc.drfun1.com";
};

/* ====================================================================
 * 12 Dedicated Switch Datacenter Leaf Blocks (Leafed to irc.drfun1.com)
 * ==================================================================== */
link node1.lasvegas.switch.drfun1.com {
    incoming { mask *.drfun1.com; };
    outgoing { hostname "node1.lasvegas.switch.drfun1.com"; port 6697; options { ssl; }; };
    password "WittLaw_Switch_Node1_Auth_2026";
    class servers;
    type leaf;
};

link node2.tahoereno.switch.drfun1.com {
    incoming { mask *.drfun1.com; };
    outgoing { hostname "node2.tahoereno.switch.drfun1.com"; port 6697; options { ssl; }; };
    password "WittLaw_Switch_Node2_Auth_2026";
    class servers;
    type leaf;
};

link node3.grandrapids.switch.drfun1.com {
    incoming { mask *.drfun1.com; };
    outgoing { hostname "node3.grandrapids.switch.drfun1.com"; port 6697; options { ssl; }; };
    password "WittLaw_Switch_Node3_Auth_2026";
    class servers;
    type leaf;
};

link node4.atlanta.switch.drfun1.com {
    incoming { mask *.drfun1.com; };
    outgoing { hostname "node4.atlanta.switch.drfun1.com"; port 6697; options { ssl; }; };
    password "WittLaw_Switch_Node4_Auth_2026";
    class servers;
    type leaf;
};

link node5.space-teleport.switch.drfun1.com {
    incoming { mask *.drfun1.com; };
    outgoing { hostname "node5.space-teleport.switch.drfun1.com"; port 6697; options { ssl; }; };
    password "WittLaw_Switch_Node5_Auth_2026";
    class servers;
    type leaf;
};

link node6.austin.switch.drfun1.com {
    incoming { mask *.drfun1.com; };
    outgoing { hostname "node6.austin.switch.drfun1.com"; port 6697; options { ssl; }; };
    password "WittLaw_Switch_Node6_Auth_2026";
    class servers;
    type leaf;
};

link node7.chicago.switch.drfun1.com {
    incoming { mask *.drfun1.com; };
    outgoing { hostname "node7.chicago.switch.drfun1.com"; port 6697; options { ssl; }; };
    password "WittLaw_Switch_Node7_Auth_2026";
    class servers;
    type leaf;
};

link node8.seattle.switch.drfun1.com {
    incoming { mask *.drfun1.com; };
    outgoing { hostname "node8.seattle.switch.drfun1.com"; port 6697; options { ssl; }; };
    password "WittLaw_Switch_Node8_Auth_2026";
    class servers;
    type leaf;
};

link node9.newyork.switch.drfun1.com {
    incoming { mask *.drfun1.com; };
    outgoing { hostname "node9.newyork.switch.drfun1.com"; port 6697; options { ssl; }; };
    password "WittLaw_Switch_Node9_Auth_2026";
    class servers;
    type leaf;
};

link node10.london.switch.drfun1.com {
    incoming { mask *.drfun1.com; };
    outgoing { hostname "node10.london.switch.drfun1.com"; port 6697; options { ssl; }; };
    password "WittLaw_Switch_Node10_Auth_2026";
    class servers;
    type leaf;
};

link node11.tokyo.switch.drfun1.com {
    incoming { mask *.drfun1.com; };
    outgoing { hostname "node11.tokyo.switch.drfun1.com"; port 6697; options { ssl; }; };
    password "WittLaw_Switch_Node11_Auth_2026";
    class servers;
    type leaf;
};

link node12.hawaii.switch.drfun1.com {
    incoming { mask *.drfun1.com; };
    outgoing { hostname "node12.hawaii.switch.drfun1.com"; port 6697; options { ssl; }; };
    password "WittLaw_Switch_Node12_Auth_2026";
    class servers;
    type leaf;
};

/* Satcom Carrier Leaf Blocks (Sample for Top Global Fleets) */
${companies.slice(0, 8).map((c) => {
  const safeName = c.name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 16);
  return `link leaf-${safeName}.satcom.drfun1.com {
    incoming { mask *; };
    outgoing { hostname "${c.id}.teleport.switch.com"; port 6697; options { ssl; }; };
    password "Satcom_Switch_Secure_Pass_${safeName}!";
    class servers;
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
                <span>Switch Data Centers & UnrealIRCd Leaf Mesh Network</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Hub: irc.drfun1.com:6697 (SSL) · Colocation: switch.com · Transit: risingnet.com · Engine: unrealircd.com
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
                irc.drfun1.com : 6697 (SSL)
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                UnrealIRCd 6.1+ hub-and-leaf mesh. Provides real-time out-of-band telemetry alerts, 24/7 engineer coordination, and crisis dispatch during web outages.
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
                <span>Master Hub Configuration Preview (irc.drfun1.com)</span>
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
            Connected to Switch SUPERNAP · Protected by RisingNet · Powered by UnrealIRCd
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
