import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Check,
  Code2,
  Copy,
  Database,
  Globe,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Search,
  Send,
  Server,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Terminal,
  Trash2,
} from 'lucide-react';
import {
  DuplicatorHostingPlan,
  DuplicatorHostingPlanId,
  DuplicatorInfraProvider,
  DuplicatorPacketEvent,
  DuplicatorRelayRule,
} from '../types/duplicator';
import { CoreHubDomain } from '../types/irc';
import { StoreProduct } from '../types/store';
import {
  buildPlanCartProduct,
  CORE_DUPLICATOR_HUBS,
  DUPLICATOR_HOSTING_PLANS,
  generateDuplicatorConfigSnippet,
  generateWordPressEmbedSnippet,
  INITIAL_DUPLICATOR_EVENTS,
  INITIAL_DUPLICATOR_RULES,
} from '../data/duplicatorHostingData';

const STORAGE_KEY_RULES = 'drfun1_irc_duplicator_rules_v1';
const STORAGE_KEY_EVENTS = 'drfun1_irc_duplicator_events_v1';

interface IrcDuplicatorHostingViewProps {
  onQuickAddToCart: (product: StoreProduct, isDrfun1: boolean) => void;
  onOpenProductConfig: (product: StoreProduct, isDrfun1: boolean) => void;
  onOpenCart: () => void;
  onOpenLicense: () => void;
  onOpenSwitchMesh: () => void;
  onNavigateToIrc: () => void;
}

type DuplicatorSubTab = 'rules' | 'sandbox' | 'plans' | 'config';

export const IrcDuplicatorHostingView: React.FC<IrcDuplicatorHostingViewProps> = ({
  onQuickAddToCart,
  onOpenProductConfig,
  onOpenCart,
  onOpenLicense,
  onOpenSwitchMesh,
  onNavigateToIrc,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<DuplicatorSubTab>('rules');

  // Persisted Mirror Rules
  const [rules, setRules] = useState<DuplicatorRelayRule[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_RULES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return INITIAL_DUPLICATOR_RULES;
  });

  // Persisted Replication Events
  const [events, setEvents] = useState<DuplicatorPacketEvent[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_EVENTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return INITIAL_DUPLICATOR_EVENTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_RULES, JSON.stringify(rules));
    } catch (_) {}
  }, [rules]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(events));
    } catch (_) {}
  }, [events]);

  // Filters for rules table
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused'>('all');
  const [hubFilter, setHubFilter] = useState<'all' | CoreHubDomain>('all');

  // Provision form drawer toggle & inputs
  const [showProvisionForm, setShowProvisionForm] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newSourceHub, setNewSourceHub] = useState<CoreHubDomain>('irc.drfun1.com');
  const [newSourceChannel, setNewSourceChannel] = useState('#community');
  const [newTargetChannel, setNewTargetChannel] = useState('#community');
  const [newTargetHubs, setNewTargetHubs] = useState<CoreHubDomain[]>([
    'irc.drfun1.com',
    'irc.drfun1media.com',
    'irc.drfun1media.net',
    'drfun1ircd.com',
  ]);
  const [newInfraProvider, setNewInfraProvider] = useState<DuplicatorInfraProvider>(
    'Switch SUPERNAP NV (via CGW Law Offices)'
  );
  const [newPlanTier, setNewPlanTier] = useState<DuplicatorHostingPlanId>('multi_hub_pro');
  const [newWordpressSync, setNewWordpressSync] = useState(true);
  const [newWordpressUrl, setNewWordpressUrl] = useState(
    'https://site.drfun1media.com/wp-json/drfun1-irc/v1/relay'
  );
  const [newPreserveNick, setNewPreserveNick] = useState(true);
  const [newStripColors, setNewStripColors] = useState(false);
  const [newFloodRate, setNewFloodRate] = useState(120);

  // Selected rule for Config Inspector & Sandbox
  const [selectedRuleId, setSelectedRuleId] = useState<string>(
    () => rules[0]?.id || INITIAL_DUPLICATOR_RULES[0].id
  );

  // Live Replication Sandbox form
  const [sandboxNick, setSandboxNick] = useState('RichardAlanWitt');
  const [sandboxMessage, setSandboxMessage] = useState(
    'Broadcast status nominal across all 4 UnrealIRCd hubs and WordPress edge relay.'
  );

  // Copy & toast feedback
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setFeedbackBanner(msg);
    setTimeout(() => setFeedbackBanner(null), 3200);
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const selectedRule = useMemo(
    () => rules.find((r) => r.id === selectedRuleId) || rules[0] || null,
    [rules, selectedRuleId]
  );

  const filteredRules = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return rules.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (
        hubFilter !== 'all' &&
        r.sourceHub !== hubFilter &&
        !r.targetHubs.includes(hubFilter)
      ) {
        return false;
      }
      if (q) {
        const match =
          r.label.toLowerCase().includes(q) ||
          r.sourceChannel.toLowerCase().includes(q) ||
          r.targetChannel.toLowerCase().includes(q) ||
          r.duplicatorServerHost.toLowerCase().includes(q) ||
          r.sourceHub.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [rules, searchQuery, statusFilter, hubFilter]);

  const metrics = useMemo(() => {
    const activeRules = rules.filter((r) => r.status === 'active');
    const totalMessages24h = rules.reduce((sum, r) => sum + r.replicatedMessages24h, 0);
    const avgLatency =
      rules.length > 0
        ? (rules.reduce((sum, r) => sum + r.avgRelayLatencyMs, 0) / rules.length).toFixed(2)
        : '0.00';
    const wpBridges = rules.filter((r) => r.wordpressSyncEnabled).length;
    return {
      totalRules: rules.length,
      activeCount: activeRules.length,
      totalMessages24h,
      avgLatency,
      wpBridges,
    };
  }, [rules]);

  const toggleTargetHub = (domain: CoreHubDomain) => {
    setNewTargetHubs((prev) =>
      prev.includes(domain)
        ? prev.length > 1
          ? prev.filter((d) => d !== domain)
          : prev
        : [...prev, domain]
    );
  };

  const handleProvisionRule = (e: React.FormEvent) => {
    e.preventDefault();
    const srcChan = newSourceChannel.trim().startsWith('#')
      ? newSourceChannel.trim()
      : `#${newSourceChannel.trim() || 'room'}`;
    const tgtChan = newTargetChannel.trim().startsWith('#')
      ? newTargetChannel.trim()
      : `#${newTargetChannel.trim() || srcChan.slice(1)}`;
    const slug = srcChan.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'room';
    const hostSuffix =
      newInfraProvider.includes('DataPacket')
        ? 'datapacket.drfun1.com'
        : newInfraProvider.includes('RisingNet')
        ? 'risingnet.drfun1.com'
        : 'switch.drfun1.com';

    const randomHex = Math.random().toString(16).slice(2, 14);
    const newRule: DuplicatorRelayRule = {
      id: `dup_${slug}_${Date.now().toString(36)}`,
      label: newLabel.trim() || `${srcChan} Multi-Hub Duplicator`,
      sourceHub: newSourceHub,
      sourceChannel: srcChan,
      targetHubs: newTargetHubs,
      targetChannel: tgtChan,
      duplicatorServerHost: `dup-${slug}.${hostSuffix}`,
      infraProvider: newInfraProvider,
      wordpressWebhookUrl: newWordpressSync ? newWordpressUrl.trim() : '',
      wordpressSyncEnabled: newWordpressSync,
      preserveNickPrefix: newPreserveNick,
      stripIrcColors: newStripColors,
      floodRatePerSec: Math.max(10, Math.min(1000, Number(newFloodRate) || 120)),
      status: 'active',
      planTier: newPlanTier,
      replicatedMessages24h: 1,
      avgRelayLatencyMs: Number((0.5 + Math.random() * 0.6).toFixed(1)),
      lastEventAt: new Date().toISOString().slice(11, 19) + ' UTC',
      hmacKey: `witt_hmac_${randomHex}`,
    };

    setRules((prev) => [newRule, ...prev]);
    setSelectedRuleId(newRule.id);
    setShowProvisionForm(false);
    setNewLabel('');
    showToast(`Provisioned ${newRule.label} on ${newRule.duplicatorServerHost}`);
  };

  const handleToggleRuleStatus = (id: string) => {
    setRules((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: r.status === 'active' ? 'paused' : 'active' }
          : r
      )
    );
  };

  const handleDeleteRule = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
    if (selectedRuleId === id) {
      const remaining = rules.filter((r) => r.id !== id);
      setSelectedRuleId(remaining[0]?.id || '');
    }
    showToast('Removed duplicator mirror rule.');
  };

  const handleResetDefaults = () => {
    setRules(INITIAL_DUPLICATOR_RULES);
    setEvents(INITIAL_DUPLICATOR_EVENTS);
    setSelectedRuleId(INITIAL_DUPLICATOR_RULES[0].id);
    showToast('Restored default 4-hub duplicator pipelines.');
  };

  const handleRotateHmacKey = (id: string) => {
    const nextSecret = `witt_hmac_${Math.random().toString(16).slice(2, 10)}${Math.random()
      .toString(16)
      .slice(2, 8)}`;
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, hmacKey: nextSecret } : r))
    );
    showToast('Rotated HMAC SHA-256 relay signing key.');
  };

  const handleSimulatePacket = (ruleToUse?: DuplicatorRelayRule, customMsg?: string) => {
    const rule = ruleToUse || selectedRule;
    if (!rule) return;

    const now = new Date();
    const ts = `${now.toISOString().slice(11, 19)}.${String(
      now.getUTCMilliseconds()
    ).padStart(3, '0')}`;
    const msgText =
      (customMsg ?? sandboxMessage).trim() ||
      `Health heartbeat verified across ${rule.targetHubs.length} hubs.`;
    const latency = Number((0.5 + Math.random() * 0.7).toFixed(2));
    const digest = `sha256=${Math.random().toString(16).slice(2, 6)}...${Math.random()
      .toString(16)
      .slice(2, 6)}`;

    const evt: DuplicatorPacketEvent = {
      id: `evt_${Date.now()}`,
      timestamp: ts,
      ruleId: rule.id,
      ruleLabel: rule.label,
      nick: sandboxNick.trim() || 'Operator',
      sourceHub: rule.sourceHub,
      sourceChannel: rule.sourceChannel,
      message: msgText,
      replicatedTo: rule.targetHubs,
      targetChannel: rule.targetChannel,
      latencyMs: latency,
      wordpressDispatched: rule.wordpressSyncEnabled,
      hmacDigest: digest,
    };

    setEvents((prev) => [evt, ...prev].slice(0, 40));
    setRules((prev) =>
      prev.map((r) =>
        r.id === rule.id
          ? {
              ...r,
              replicatedMessages24h: r.replicatedMessages24h + 1,
              lastEventAt: now.toISOString().slice(11, 19) + ' UTC',
              avgRelayLatencyMs: latency,
            }
          : r
      )
    );
    showToast(
      `Replicated packet from ${rule.sourceHub} to ${rule.targetHubs.length} hubs (${latency} ms)`
    );
  };

  const handleOrderPlan = (plan: DuplicatorHostingPlan, openConfigModal: boolean) => {
    const product = buildPlanCartProduct(plan);
    if (openConfigModal) {
      onOpenProductConfig(product, true);
    } else {
      onQuickAddToCart(product, true);
      onOpenCart();
    }
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* Feedback Toast */}
      {feedbackBanner && (
        <div
          role="status"
          className="px-4 py-2.5 rounded-lg bg-slate-900 border border-emerald-500/50 text-emerald-300 text-xs font-mono flex items-center justify-between"
        >
          <span>{feedbackBanner}</span>
          <button
            onClick={() => setFeedbackBanner(null)}
            className="text-slate-400 hover:text-white ml-4 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header Summary Strip */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <p className="text-xs font-mono text-amber-300">
              DrFun1Media Managed Infrastructure · Switch SUPERNAP · DataPacket 100G · RisingNet DWDM
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              IRC Chat Room Duplicator Hosting
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Provision dedicated UnrealIRCd 6.1.4 + Redis + WordPress REST mirror workers that
              duplicate channel conversations, topic updates, and DJ/telemetry bots across all 4 core
              hubs in real time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => {
                setActiveSubTab('rules');
                setShowProvisionForm((v) => !v);
              }}
              className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Provision Duplicator Room</span>
            </button>

            <button
              onClick={() => setActiveSubTab('plans')}
              className="px-4 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
              <span>Hosting Plans</span>
            </button>

            <button
              onClick={onNavigateToIrc}
              className="px-3.5 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>Open WebIRC</span>
            </button>
          </div>
        </div>

        {/* Key Operational Metrics (Tabular Numerals) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800">
          <div>
            <span className="text-xs text-slate-400 block">Active Mirror Pipelines</span>
            <span className="text-xl font-bold text-white font-mono tabular-nums mt-0.5 block">
              {metrics.activeCount} / {metrics.totalRules}
            </span>
            <span className="text-xs text-slate-500">Multi-hub sync active</span>
          </div>

          <div>
            <span className="text-xs text-slate-400 block">24h Duplicated Messages</span>
            <span className="text-xl font-bold text-emerald-400 font-mono tabular-nums mt-0.5 block">
              {metrics.totalMessages24h.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">0.00% dropped packets</span>
          </div>

          <div>
            <span className="text-xs text-slate-400 block">Mean Fanout Latency</span>
            <span className="text-xl font-bold text-sky-300 font-mono tabular-nums mt-0.5 block">
              {metrics.avgLatency} ms
            </span>
            <span className="text-xs text-slate-500">TLSv1.3 AES-256-GCM</span>
          </div>

          <div>
            <span className="text-xs text-slate-400 block">WordPress REST Bridges</span>
            <span className="text-xl font-bold text-amber-300 font-mono tabular-nums mt-0.5 block">
              {metrics.wpBridges} Connected
            </span>
            <span className="text-xs text-slate-500">HMAC SHA-256 verified</span>
          </div>
        </div>

        {/* 4 Core Hubs Backbone Summary */}
        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-300">
            <span className="text-slate-400">4 Core Uplink Hubs (:6697 SSL):</span>
            {CORE_DUPLICATOR_HUBS.map((hub) => (
              <span key={hub.domain} className="text-slate-200">
                <strong className="text-emerald-400">{hub.sid}</strong> · {hub.domain}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-3 text-slate-400">
            <button
              onClick={onOpenLicense}
              className="hover:text-white underline-offset-2 hover:underline cursor-pointer"
            >
              License: www.wittlawfirm.com (FRN 0034981290)
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={onOpenSwitchMesh}
              className="hover:text-white underline-offset-2 hover:underline cursor-pointer"
            >
              Switch Counsel: CGW Law Offices
            </button>
            <span aria-hidden="true">·</span>
            <span>Payment: Owens Company (Bill in Receiving)</span>
          </div>
        </div>
      </section>

      {/* Primary Workspace Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-lg">
          {(
            [
              { id: 'rules', label: 'Mirror Pipelines', icon: Server },
              { id: 'sandbox', label: 'Live Replication Sandbox', icon: Activity },
              { id: 'plans', label: 'Hosting Plans & Ordering', icon: ShoppingBag },
              { id: 'config', label: 'UnrealIRCd & WordPress Config', icon: Code2 },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const active = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5 text-purple-400" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={handleResetDefaults}
          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 transition flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {/* ===================================================================
          TAB 1: ACTIVE MIRROR PIPELINES & PROVISIONER
          =================================================================== */}
      {activeSubTab === 'rules' && (
        <div className="space-y-6">
          {/* Interactive Provisioning Form */}
          {showProvisionForm && (
            <form
              onSubmit={handleProvisionRule}
              className="bg-slate-900 border border-purple-500/40 rounded-xl p-6 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h2 className="text-base font-semibold text-white">
                    Provision Hosted Chat Room Duplicator
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Creates a dedicated UnrealIRCd leaf + Redis WebSocket relay worker across selected
                    hubs.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowProvisionForm(false)}
                  className="text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <label className="space-y-1.5 block">
                  <span className="text-slate-300 font-medium block">Pipeline Label</span>
                  <input
                    type="text"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    placeholder="e.g. Newsroom 4-Hub Simulcast"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
                  />
                </label>

                <label className="space-y-1.5 block">
                  <span className="text-slate-300 font-medium block">Source Hub</span>
                  <select
                    value={newSourceHub}
                    onChange={(e) => setNewSourceHub(e.target.value as CoreHubDomain)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-purple-500"
                  >
                    {CORE_DUPLICATOR_HUBS.map((h) => (
                      <option key={h.domain} value={h.domain}>
                        SID {h.sid} · {h.domain}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1.5 block">
                  <span className="text-slate-300 font-medium block">Hosting Infrastructure</span>
                  <select
                    value={newInfraProvider}
                    onChange={(e) =>
                      setNewInfraProvider(e.target.value as DuplicatorInfraProvider)
                    }
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Switch SUPERNAP NV (via CGW Law Offices)">
                      Switch SUPERNAP NV (via CGW Law Offices)
                    </option>
                    <option value="DataPacket 100G No-Ads Edge">
                      DataPacket 100G No-Ads Edge
                    </option>
                    <option value="RisingNet 100G DWDM Dedicated">
                      RisingNet 100G DWDM Dedicated
                    </option>
                  </select>
                </label>

                <label className="space-y-1.5 block">
                  <span className="text-slate-300 font-medium block">Source IRC Room</span>
                  <input
                    type="text"
                    required
                    value={newSourceChannel}
                    onChange={(e) => setNewSourceChannel(e.target.value)}
                    placeholder="#community"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                </label>

                <label className="space-y-1.5 block">
                  <span className="text-slate-300 font-medium block">Target Mirrored Room</span>
                  <input
                    type="text"
                    required
                    value={newTargetChannel}
                    onChange={(e) => setNewTargetChannel(e.target.value)}
                    placeholder="#community"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                </label>

                <label className="space-y-1.5 block">
                  <span className="text-slate-300 font-medium block">
                    Hosting Tier &amp; Flood Limit (msgs/sec)
                  </span>
                  <div className="flex gap-2">
                    <select
                      value={newPlanTier}
                      onChange={(e) =>
                        setNewPlanTier(e.target.value as DuplicatorHostingPlanId)
                      }
                      className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="starter_mirror">Single-Room ($22/mo)</option>
                      <option value="multi_hub_pro">WP Cloud Pro ($35/mo)</option>
                      <option value="enterprise_cluster">100G Cluster ($145/mo)</option>
                    </select>
                    <input
                      type="number"
                      min={10}
                      max={1000}
                      value={newFloodRate}
                      onChange={(e) => setNewFloodRate(Number(e.target.value))}
                      className="w-24 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono tabular-nums focus:outline-none focus:border-purple-500"
                      title="Max duplicated messages per second"
                    />
                  </div>
                </label>
              </div>

              {/* Target Hubs Multi-Select */}
              <div className="space-y-2 text-xs">
                <span className="text-slate-300 font-medium block">
                  Target UnrealIRCd Hubs (Select destinations to mirror traffic)
                </span>
                <div className="flex flex-wrap gap-2">
                  {CORE_DUPLICATOR_HUBS.map((hub) => {
                    const selected = newTargetHubs.includes(hub.domain);
                    return (
                      <button
                        type="button"
                        key={hub.domain}
                        onClick={() => toggleTargetHub(hub.domain)}
                        className={`px-3 py-1.5 rounded-lg border font-mono transition cursor-pointer flex items-center gap-1.5 ${
                          selected
                            ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 font-semibold'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {selected && <Check className="w-3.5 h-3.5" />}
                        <span>
                          SID {hub.sid} · {hub.domain}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* WordPress Bridge & Relay Flags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800 text-xs">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newWordpressSync}
                      onChange={(e) => setNewWordpressSync(e.target.checked)}
                      className="accent-purple-500"
                    />
                    <span>Enable WordPress REST Webhook &amp; WebSocket Bridge</span>
                  </label>
                  {newWordpressSync && (
                    <input
                      type="url"
                      value={newWordpressUrl}
                      onChange={(e) => setNewWordpressUrl(e.target.value)}
                      placeholder="https://yoursite.com/wp-json/drfun1-irc/v1/relay"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-mono focus:outline-none focus:border-purple-500"
                    />
                  )}
                </div>

                <div className="flex flex-col justify-center gap-2">
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newPreserveNick}
                      onChange={(e) => setNewPreserveNick(e.target.checked)}
                      className="accent-purple-500"
                    />
                    <span>Preserve original sender nickname &amp; mode prefix (@ / +)</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newStripColors}
                      onChange={(e) => setNewStripColors(e.target.checked)}
                      className="accent-purple-500"
                    />
                    <span>Strip mIRC / ANSI formatting codes on external bridge</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProvisionForm(false)}
                  className="px-4 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
                >
                  Deploy Duplicator Instance
                </button>
              </div>
            </form>
          )}

          {/* Filter & Search Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by channel (#lobby), hostname, or hub..."
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg text-xs">
                {(['all', 'active', 'paused'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-md capitalize transition cursor-pointer ${
                      statusFilter === st
                        ? 'bg-slate-800 text-white font-medium'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <select
                value={hubFilter}
                onChange={(e) => setHubFilter(e.target.value as 'all' | CoreHubDomain)}
                className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 font-mono focus:outline-none focus:border-purple-500"
                aria-label="Filter by IRC hub domain"
              >
                <option value="all">All 4 Hubs</option>
                {CORE_DUPLICATOR_HUBS.map((h) => (
                  <option key={h.domain} value={h.domain}>
                    {h.domain} ({h.sid})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* High-Density Rules Data Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            {filteredRules.length === 0 ? (
              <div className="p-10 text-center space-y-3">
                <Database className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-sm font-semibold text-slate-200">
                  No duplicator pipelines match your current filter
                </p>
                <p className="text-xs text-slate-400">
                  Clear the search filter or provision a new hosted IRC chat room duplicator rule.
                </p>
                <div className="flex justify-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('all');
                      setHubFilter('all');
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-white cursor-pointer"
                  >
                    Clear Filters
                  </button>
                  <button
                    onClick={() => setShowProvisionForm(true)}
                    className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs text-white font-semibold cursor-pointer"
                  >
                    Provision Duplicator Room
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 font-medium">
                      <th className="py-3 px-4">Pipeline &amp; Hosted Worker</th>
                      <th className="py-3 px-4">Source -&gt; Target Room</th>
                      <th className="py-3 px-4">Mirrored Hubs</th>
                      <th className="py-3 px-4">WordPress Bridge</th>
                      <th className="py-3 px-4 text-right">24h Messages</th>
                      <th className="py-3 px-4 text-right">Latency</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {filteredRules.map((rule) => (
                      <tr
                        key={rule.id}
                        className={`hover:bg-slate-950/60 transition ${
                          selectedRuleId === rule.id ? 'bg-slate-950/80' : ''
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="font-semibold text-white">{rule.label}</div>
                          <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                            {rule.duplicatorServerHost} · {rule.infraProvider}
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono">
                          <div className="text-emerald-300 font-semibold">
                            {rule.sourceChannel} -&gt; {rule.targetChannel}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Origin: {rule.sourceHub}
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono text-slate-300">
                          <div>{rule.targetHubs.length} of 4 Hubs</div>
                          <div className="text-[11px] text-slate-500 max-w-[200px] truncate">
                            {rule.targetHubs.join(', ')}
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono text-[11px]">
                          {rule.wordpressSyncEnabled ? (
                            <span className="text-sky-300">
                              WP REST Active · {rule.floodRatePerSec}/s
                            </span>
                          ) : (
                            <span className="text-slate-500">
                              IRC Mesh Only · {rule.floodRatePerSec}/s
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right font-mono tabular-nums text-white font-semibold">
                          {rule.replicatedMessages24h.toLocaleString()}
                        </td>

                        <td className="py-3 px-4 text-right font-mono tabular-nums text-sky-300">
                          {rule.avgRelayLatencyMs} ms
                        </td>

                        <td className="py-3 px-4 font-mono">
                          <span
                            className={`text-[11px] font-semibold ${
                              rule.status === 'active'
                                ? 'text-emerald-400'
                                : 'text-amber-400'
                            }`}
                          >
                            {rule.status === 'active' ? 'ACTIVE' : 'PAUSED'}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleSimulatePacket(rule)}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 text-[11px] font-medium cursor-pointer"
                              title="Send test message across target hubs"
                            >
                              Simulate
                            </button>
                            <button
                              onClick={() => {
                                setSelectedRuleId(rule.id);
                                setActiveSubTab('config');
                              }}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium cursor-pointer"
                              title="Inspect UnrealIRCd & WordPress config"
                            >
                              Config
                            </button>
                            <button
                              onClick={() => handleToggleRuleStatus(rule.id)}
                              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                              title={rule.status === 'active' ? 'Pause relay' : 'Resume relay'}
                              aria-label={rule.status === 'active' ? 'Pause relay' : 'Resume relay'}
                            >
                              {rule.status === 'active' ? (
                                <Pause className="w-3.5 h-3.5 text-amber-400" />
                              ) : (
                                <Play className="w-3.5 h-3.5 text-emerald-400" />
                              )}
                            </button>
                            <button
                              onClick={() => handleDeleteRule(rule.id)}
                              className="p-1.5 rounded bg-slate-800 hover:bg-red-950/60 text-slate-400 hover:text-red-300 cursor-pointer"
                              title="Delete pipeline"
                              aria-label="Delete pipeline"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================
          TAB 2: LIVE REPLICATION SANDBOX & PACKET LEDGER
          =================================================================== */}
      {activeSubTab === 'sandbox' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Dispatch Form */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div>
              <h2 className="text-base font-semibold text-white">
                Test Message Duplication Fanout
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Dispatch a message into any active duplicator room to observe real-time multi-hub
                replication and WordPress webhook verification.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <label className="space-y-1 block">
                <span className="text-slate-300 font-medium block">Target Pipeline</span>
                <select
                  value={selectedRule?.id || ''}
                  onChange={(e) => setSelectedRuleId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-purple-500"
                >
                  {rules.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.sourceChannel} ({r.sourceHub}) -&gt; {r.targetHubs.length} Hubs
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1 block">
                <span className="text-slate-300 font-medium block">Sender IRC Nickname</span>
                <input
                  type="text"
                  value={sandboxNick}
                  onChange={(e) => setSandboxNick(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-purple-500"
                />
              </label>

              <label className="space-y-1 block">
                <span className="text-slate-300 font-medium block">Message Payload</span>
                <textarea
                  rows={3}
                  value={sandboxMessage}
                  onChange={(e) => setSandboxMessage(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-purple-500"
                />
              </label>

              {selectedRule && (
                <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
                  <div>Worker: {selectedRule.duplicatorServerHost}</div>
                  <div>Targets: {selectedRule.targetHubs.join(' · ')}</div>
                  <div>
                    WordPress Webhook:{' '}
                    {selectedRule.wordpressSyncEnabled
                      ? selectedRule.wordpressWebhookUrl
                      : 'Disabled'}
                  </div>
                </div>
              )}

              <button
                onClick={() => handleSimulatePacket(selectedRule || undefined, sandboxMessage)}
                disabled={!selectedRule}
                className="w-full px-4 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send &amp; Duplicate Across Hubs</span>
              </button>
            </div>
          </div>

          {/* Replication Event Ledger */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-semibold text-white">
                  Live Packet Replication Ledger
                </h3>
                <p className="text-xs text-slate-400">
                  Chronological fanout trace with latency and HMAC SHA-256 verification.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400 tabular-nums">
                {events.length} Events Recorded
              </span>
            </div>

            <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
              {events.map((evt) => (
                <div
                  key={evt.id}
                  className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1.5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]">
                    <div className="flex items-center gap-2 text-slate-400 tabular-nums">
                      <span className="text-emerald-400 font-semibold">{evt.timestamp}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-white font-semibold">&lt;{evt.nick}&gt;</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-purple-300">
                        {evt.sourceHub} {evt.sourceChannel}
                      </span>
                    </div>
                    <span className="text-sky-300 tabular-nums">{evt.latencyMs} ms</span>
                  </div>

                  <p className="text-slate-200 font-mono text-xs break-words">{evt.message}</p>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-500 pt-1 border-t border-slate-900">
                    <span>
                      Replicated to ({evt.replicatedTo.length}): {evt.replicatedTo.join(', ')}
                    </span>
                    <span>
                      {evt.wordpressDispatched ? 'WP REST OK' : 'IRC Only'} · {evt.hmacDigest}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          TAB 3: HOSTING PLANS & PROCUREMENT CART ORDERING
          =================================================================== */}
      {activeSubTab === 'plans' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {DUPLICATOR_HOSTING_PLANS.map((plan) => (
              <div
                key={plan.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <div className="space-y-1">
                    <p className="text-xs font-mono text-amber-300">{plan.audience}</p>
                    <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">{plan.tagline}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-baseline justify-between font-mono">
                    <div>
                      <span className="text-2xl font-bold text-white tabular-nums">
                        ${plan.wholesalePrice}
                      </span>
                      <span className="text-xs text-slate-400"> / mo DrFun1 Wholesale</span>
                    </div>
                    <span className="text-xs text-slate-500 line-through tabular-nums">
                      ${plan.retailPrice}/mo Retail
                    </span>
                  </div>

                  <dl className="space-y-2 pt-3 border-t border-slate-800 text-xs">
                    <div className="flex justify-between gap-2">
                      <dt className="text-slate-400">Mirrored Rooms</dt>
                      <dd className="text-white font-mono tabular-nums">
                        Up to {plan.maxChannels} rooms
                      </dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-slate-400">Duplication Rate</dt>
                      <dd className="text-emerald-400 font-mono tabular-nums">
                        {plan.maxPacketsPerHour}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-slate-400">WebSockets</dt>
                      <dd className="text-sky-300 font-mono tabular-nums">
                        {plan.maxConcurrentWebSockets}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-slate-400">Hub Links</dt>
                      <dd className="text-slate-200 font-mono text-right">{plan.includedHubs}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-slate-400">Hardware</dt>
                      <dd className="text-slate-300 font-mono text-right">{plan.hardwareSpec}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-slate-400">Location &amp; SLA</dt>
                      <dd className="text-slate-300 text-right">{plan.slaGuarantee}</dd>
                    </div>
                  </dl>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
                  <button
                    onClick={() => handleOrderPlan(plan, false)}
                    className="flex-1 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition cursor-pointer"
                  >
                    Add Hosting to Cart
                  </button>
                  <button
                    onClick={() => handleOrderPlan(plan, true)}
                    className="px-3.5 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium transition cursor-pointer flex items-center gap-1"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Configure</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Procurement & Settlement Notice */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div className="space-y-1">
              <div className="font-semibold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Contracting, Licensing &amp; Payment Office</span>
              </div>
              <p className="text-slate-400">
                App Licensed via <strong>www.wittlawfirm.com</strong> (FRN 0034981290) · Switch.com
                colocation represented by <strong>CGW Law Offices</strong> · Payment Office:{' '}
                <strong>Owens Company (www.owenscompany.com)</strong>, Attention:{' '}
                <strong>Bill in Receiving</strong>.
              </p>
            </div>
            <button
              onClick={onOpenCart}
              className="px-4 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold whitespace-nowrap shrink-0 cursor-pointer"
            >
              View Procurement Cart
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================
          TAB 4: UNREALIRCD & WORDPRESS CONFIGURATION GENERATOR
          =================================================================== */}
      {activeSubTab === 'config' && selectedRule && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-mono text-slate-400">Active Config Target</span>
              <h2 className="text-base font-semibold text-white">{selectedRule.label}</h2>
              <p className="text-xs font-mono text-slate-400">
                Host: {selectedRule.duplicatorServerHost} · HMAC Secret: {selectedRule.hmacKey}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedRule.id}
                onChange={(e) => setSelectedRuleId(e.target.value)}
                className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
              >
                {rules.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label} ({r.sourceChannel})
                  </option>
                ))}
              </select>

              <button
                onClick={() => handleRotateHmacKey(selectedRule.id)}
                className="px-3 py-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-xs text-amber-300 font-medium cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Rotate HMAC Key</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* UnrealIRCd Leaf & Relay Pipeline Config */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Server className="w-4 h-4 text-emerald-400" />
                  <span>UnrealIRCd 6.1.4 Multi-Hub Duplicator Config</span>
                </h3>
                <button
                  onClick={() =>
                    handleCopy(generateDuplicatorConfigSnippet(selectedRule), 'unreal_dup_conf')
                  }
                  className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedKey === 'unreal_dup_conf' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedKey === 'unreal_dup_conf' ? 'Copied' : 'Copy Config'}</span>
                </button>
              </div>
              <pre className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto leading-relaxed max-h-[420px]">
                {generateDuplicatorConfigSnippet(selectedRule)}
              </pre>
            </div>

            {/* WordPress Plugin Shortcode & PHP Snippet */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-sky-400" />
                  <span>WordPress Duplicator Shortcode &amp; Webhook Secret</span>
                </h3>
                <button
                  onClick={() =>
                    handleCopy(generateWordPressEmbedSnippet(selectedRule), 'wp_dup_snippet')
                  }
                  className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedKey === 'wp_dup_snippet' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedKey === 'wp_dup_snippet' ? 'Copied' : 'Copy Snippet'}</span>
                </button>
              </div>
              <pre className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-sky-300 overflow-x-auto leading-relaxed max-h-[420px]">
                {generateWordPressEmbedSnippet(selectedRule)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
