import { DuplicatorHostingPlan, DuplicatorPacketEvent, DuplicatorRelayRule } from '../types/duplicator';
import { StoreProduct } from '../types/store';
import { CoreHubDomain } from '../types/irc';

export const CORE_DUPLICATOR_HUBS: {
  domain: CoreHubDomain;
  sid: string;
  campus: string;
  port: number;
}[] = [
  {
    domain: 'irc.drfun1.com',
    sid: '001',
    campus: 'Switch SUPERNAP Las Vegas (Core Campus)',
    port: 6697,
  },
  {
    domain: 'irc.drfun1media.com',
    sid: '002',
    campus: 'Switch SUPERNAP Broadcast Teleport',
    port: 6697,
  },
  {
    domain: 'irc.drfun1media.net',
    sid: '003',
    campus: 'Switch Citadel Campus Tahoe Reno',
    port: 6697,
  },
  {
    domain: 'drfun1ircd.com',
    sid: '004',
    campus: 'Switch The Keep Campus Atlanta',
    port: 6697,
  },
];

export const INITIAL_DUPLICATOR_RULES: DuplicatorRelayRule[] = [
  {
    id: 'dup_lobby_4hub',
    label: 'Global Lobby 4-Hub + WordPress Mirror',
    sourceHub: 'irc.drfun1.com',
    sourceChannel: '#lobby',
    targetHubs: ['irc.drfun1.com', 'irc.drfun1media.com', 'irc.drfun1media.net', 'drfun1ircd.com'],
    targetChannel: '#lobby',
    duplicatorServerHost: 'dup-nv01.switch.drfun1.com',
    infraProvider: 'Switch SUPERNAP NV (via CGW Law Offices)',
    wordpressWebhookUrl: 'https://drfun1media.com/wp-json/drfun1-irc/v1/relay',
    wordpressSyncEnabled: true,
    preserveNickPrefix: true,
    stripIrcColors: false,
    floodRatePerSec: 120,
    status: 'active',
    planTier: 'enterprise_cluster',
    replicatedMessages24h: 148920,
    avgRelayLatencyMs: 0.7,
    lastEventAt: '00:11:42 UTC',
    hmacKey: 'witt_hmac_9f41e82b0c3a4d11',
  },
  {
    id: 'dup_satcom_noc',
    label: 'Satcom Global NOC Telemetry Bridge',
    sourceHub: 'irc.drfun1media.com',
    sourceChannel: '#satcom-global-noc',
    targetHubs: ['irc.drfun1.com', 'irc.drfun1media.com', 'irc.drfun1media.net', 'drfun1ircd.com'],
    targetChannel: '#satcom-global-noc',
    duplicatorServerHost: 'dup-dp04.datapacket.drfun1.com',
    infraProvider: 'DataPacket 100G No-Ads Edge',
    wordpressWebhookUrl: 'https://noc.drfun1.com/wp-json/drfun1-irc/v1/relay',
    wordpressSyncEnabled: true,
    preserveNickPrefix: true,
    stripIrcColors: false,
    floodRatePerSec: 250,
    status: 'active',
    planTier: 'enterprise_cluster',
    replicatedMessages24h: 92410,
    avgRelayLatencyMs: 0.9,
    lastEventAt: '00:12:08 UTC',
    hmacKey: 'witt_hmac_3c88d104a57e9b22',
  },
  {
    id: 'dup_radio_np',
    label: 'MPD & SHOUTcast Request Room Duplicator',
    sourceHub: 'irc.drfun1media.net',
    sourceChannel: '#drfun1-radio',
    targetHubs: ['irc.drfun1.com', 'irc.drfun1media.com', 'irc.drfun1media.net'],
    targetChannel: '#drfun1-radio',
    duplicatorServerHost: 'dup-rn02.risingnet.drfun1.com',
    infraProvider: 'RisingNet 100G DWDM Dedicated',
    wordpressWebhookUrl: 'https://radio.drfun1media.com/wp-json/drfun1-irc/v1/relay',
    wordpressSyncEnabled: true,
    preserveNickPrefix: true,
    stripIrcColors: true,
    floodRatePerSec: 80,
    status: 'active',
    planTier: 'multi_hub_pro',
    replicatedMessages24h: 54180,
    avgRelayLatencyMs: 1.1,
    lastEventAt: '00:10:55 UTC',
    hmacKey: 'witt_hmac_7a12f490e31b6c09',
  },
  {
    id: 'dup_legal_escrow',
    label: 'WittLaw & CGW Escrow Audit Room',
    sourceHub: 'drfun1ircd.com',
    sourceChannel: '#wittlaw-escrow',
    targetHubs: ['irc.drfun1.com', 'drfun1ircd.com'],
    targetChannel: '#wittlaw-escrow',
    duplicatorServerHost: 'dup-atl01.switch.drfun1.com',
    infraProvider: 'Switch SUPERNAP NV (via CGW Law Offices)',
    wordpressWebhookUrl: '',
    wordpressSyncEnabled: false,
    preserveNickPrefix: true,
    stripIrcColors: true,
    floodRatePerSec: 40,
    status: 'active',
    planTier: 'starter_mirror',
    replicatedMessages24h: 12640,
    avgRelayLatencyMs: 0.6,
    lastEventAt: '00:08:19 UTC',
    hmacKey: 'witt_hmac_5e90c218d44a7e31',
  },
  {
    id: 'dup_tv_simulcast',
    label: 'Broadcast PrimeTV Chat Simulcast',
    sourceHub: 'irc.drfun1.com',
    sourceChannel: '#drfun1-primetv',
    targetHubs: ['irc.drfun1.com', 'irc.drfun1media.com', 'irc.drfun1media.net', 'drfun1ircd.com'],
    targetChannel: '#drfun1-primetv',
    duplicatorServerHost: 'dup-nv03.switch.drfun1.com',
    infraProvider: 'DataPacket 100G No-Ads Edge',
    wordpressWebhookUrl: 'https://tv.drfun1media.com/wp-json/drfun1-irc/v1/relay',
    wordpressSyncEnabled: true,
    preserveNickPrefix: false,
    stripIrcColors: false,
    floodRatePerSec: 180,
    status: 'paused',
    planTier: 'multi_hub_pro',
    replicatedMessages24h: 31800,
    avgRelayLatencyMs: 0.8,
    lastEventAt: '23:54:02 UTC',
    hmacKey: 'witt_hmac_1b64a902f78c3d55',
  },
];

export const INITIAL_DUPLICATOR_EVENTS: DuplicatorPacketEvent[] = [
  {
    id: 'evt_1001',
    timestamp: '00:12:08.114',
    ruleId: 'dup_satcom_noc',
    ruleLabel: 'Satcom Global NOC Telemetry Bridge',
    nick: 'StatServ',
    sourceHub: 'irc.drfun1media.com',
    sourceChannel: '#satcom-global-noc',
    message: '[TLE SYNC] Starlink-6104 footprint lock confirmed over Switch SUPERNAP LV.',
    replicatedTo: ['irc.drfun1.com', 'irc.drfun1media.com', 'irc.drfun1media.net', 'drfun1ircd.com'],
    targetChannel: '#satcom-global-noc',
    latencyMs: 0.9,
    wordpressDispatched: true,
    hmacDigest: 'sha256=8a4f...c20e',
  },
  {
    id: 'evt_1002',
    timestamp: '00:11:42.402',
    ruleId: 'dup_lobby_4hub',
    ruleLabel: 'Global Lobby 4-Hub + WordPress Mirror',
    nick: 'RichardAlanWitt',
    sourceHub: 'irc.drfun1.com',
    sourceChannel: '#lobby',
    message: 'All 4 hubs (irc.drfun1.com, drfun1media.com/.net, drfun1ircd.com) mirrored cleanly.',
    replicatedTo: ['irc.drfun1.com', 'irc.drfun1media.com', 'irc.drfun1media.net', 'drfun1ircd.com'],
    targetChannel: '#lobby',
    latencyMs: 0.7,
    wordpressDispatched: true,
    hmacDigest: 'sha256=3d91...7b44',
  },
  {
    id: 'evt_1003',
    timestamp: '00:10:55.881',
    ruleId: 'dup_radio_np',
    ruleLabel: 'MPD & SHOUTcast Request Room Duplicator',
    nick: 'SHOUTcastBot',
    sourceHub: 'irc.drfun1media.net',
    sourceChannel: '#drfun1-radio',
    message: '.np [Deck A] Cosmic Synthwave 320kbps FLAC -> 4,120 web listeners synced.',
    replicatedTo: ['irc.drfun1.com', 'irc.drfun1media.com', 'irc.drfun1media.net'],
    targetChannel: '#drfun1-radio',
    latencyMs: 1.1,
    wordpressDispatched: true,
    hmacDigest: 'sha256=1e72...f90a',
  },
  {
    id: 'evt_1004',
    timestamp: '00:08:19.045',
    ruleId: 'dup_legal_escrow',
    ruleLabel: 'WittLaw & CGW Escrow Audit Room',
    nick: 'BillReceiving',
    sourceHub: 'drfun1ircd.com',
    sourceChannel: '#wittlaw-escrow',
    message: 'Owens Company PO #881 verified for Switch SUPERNAP 100G node batch.',
    replicatedTo: ['irc.drfun1.com', 'drfun1ircd.com'],
    targetChannel: '#wittlaw-escrow',
    latencyMs: 0.6,
    wordpressDispatched: false,
    hmacDigest: 'sha256=6c05...a13d',
  },
];

export const DUPLICATOR_HOSTING_PLANS: DuplicatorHostingPlan[] = [
  {
    id: 'starter_mirror',
    name: 'Single-Room Mirror Node',
    audience: 'For single-site blogs & private NOC rooms',
    tagline: 'Dedicated Redis + TLS 1.3 leaf daemon duplicating 1 room across up to 2 core hubs.',
    retailPrice: 39,
    wholesalePrice: 22,
    maxChannels: 5,
    maxPacketsPerHour: '50,000 msgs/hr',
    maxConcurrentWebSockets: '2,500 visitors',
    includedHubs: 'Any 2 of 4 Core Hubs (6697 SSL)',
    hostingNode: 'Switch SUPERNAP NV (via CGW Law Offices)',
    hardwareSpec: '2 vCPU EPYC · 4 GB ECC · 10G Unmetered',
    slaGuarantee: '99.90% Uptime',
    storeProductId: 'drfun1-wp-irc-duplicator-hosting',
  },
  {
    id: 'multi_hub_pro',
    name: 'WordPress Cloud Duplicator Pro',
    audience: 'For broadcasters, WP communities & radio decks',
    tagline: 'High-concurrency PHP 8.3 OPcache + Redis WebSocket broker bridging all 4 UnrealIRCd hubs.',
    retailPrice: 65,
    wholesalePrice: 35,
    maxChannels: 25,
    maxPacketsPerHour: '250,000 msgs/hr',
    maxConcurrentWebSockets: '15,000 visitors',
    includedHubs: 'All 4 Hubs (SID 001–004) + WP REST API',
    hostingNode: 'Switch SUPERNAP + RisingNet CleanPipe',
    hardwareSpec: '8 vCPU EPYC · 16 GB ECC · 25G Redundant',
    slaGuarantee: '99.95% Uptime',
    storeProductId: 'drfun1-wp-irc-duplicator-hosting',
  },
  {
    id: 'enterprise_cluster',
    name: 'Enterprise 100G 4-Hub Duplicator Cluster',
    audience: 'For networks, carrier NOCs & 100G edge resellers',
    tagline: 'Bare-metal Switch SUPERNAP + DataPacket 100G cluster with unlimited channels & HMAC webhook fanout.',
    retailPrice: 249,
    wholesalePrice: 145,
    maxChannels: 500,
    maxPacketsPerHour: '2,500,000 msgs/hr',
    maxConcurrentWebSockets: '100,000+ visitors',
    includedHubs: 'All 4 Hubs (001–004) + Custom Peer Uplink',
    hostingNode: 'Switch SUPERNAP + DataPacket 100G + RisingNet DWDM',
    hardwareSpec: 'Dual 32-Core EPYC · 128 GB ECC · 100G Optical',
    slaGuarantee: '99.999% Tier-5 SLA',
    storeProductId: 'drfun1-enterprise-ircd-deployment',
  },
];

export function buildPlanCartProduct(plan: DuplicatorHostingPlan): StoreProduct {
  return {
    id: `dup_hosting_${plan.id}`,
    name: `IRC Chat Room Duplicator Hosting — ${plan.name}`,
    drfun1RebrandedName: `DrFun1 IRC Chat Room Duplicator: ${plan.name}`,
    tagline: plan.tagline,
    category: 'Dedicated IRCD & Transit Hosting',
    oemCarriers: ['Switch SUPERNAP (CGW Law Offices)', 'DataPacket 100G', 'RisingNet DDoS Shield'],
    oemDescription: `${plan.hardwareSpec} hosting cluster for bidirectional IRC chat room duplication across UnrealIRCd 6.1.4 hubs.`,
    drfun1Description: `Managed DrFun1 IRC Chat Room Duplicator Hosting (${plan.name}): ${plan.includedHubs}. Licensed under www.wittlawfirm.com (FRN 0034981290) with settlement via Owens Company (Bill in Receiving).`,
    retailPrice: plan.retailPrice,
    drfun1WholesalePrice: plan.wholesalePrice,
    priceUnit: 'per_month',
    stockStatus: 'In Stock',
    minOrderQuantity: 1,
    badge: 'Duplicator Hosting',
    frequencyBands: ['UnrealIRCd 6.1.4 TLS', 'Redis 7.2 Broker', 'WordPress REST Sync'],
    orbitType: '4-Hub Multi-Cluster',
    specs: [
      { label: 'Mirrored Rooms Limit', value: `${plan.maxChannels} Concurrent Rooms` },
      { label: 'Packet Replication', value: plan.maxPacketsPerHour },
      { label: 'WebSocket Concurrency', value: plan.maxConcurrentWebSockets },
      { label: 'Hub Coverage', value: plan.includedHubs },
      { label: 'Hosting Node', value: plan.hostingNode },
      { label: 'Hardware & SLA', value: `${plan.hardwareSpec} (${plan.slaGuarantee})` },
    ],
    drfun1ValueAdd: [
      'Pre-linked & leafed to irc.drfun1.com, irc.drfun1media.com, irc.drfun1media.net & drfun1ircd.com',
      'HMAC SHA-256 WordPress REST webhook dispatcher + zero-overhead WebSocket fanout',
      'Switch.com 100G infrastructure via CGW Law Offices; licensed via www.wittlawfirm.com',
    ],
    switchInterconnectCampus: plan.hostingNode,
    unrealIrcdEnabled: true,
    risingNetProtected: true,
  };
}

export function generateDuplicatorConfigSnippet(rule: DuplicatorRelayRule): string {
  const cleanHost = rule.duplicatorServerHost.trim() || 'dup-node01.switch.drfun1.com';
  const targetLinks = rule.targetHubs
    .map((hub) => {
      const hubMeta = CORE_DUPLICATOR_HUBS.find((h) => h.domain === hub);
      return `/* Upstream Hub ${hubMeta?.sid || '001'}: ${hub} */
link ${hub} {
    incoming { mask *; };
    outgoing {
        hostname "${hub}";
        port 6697;
        options { ssl; autoconnect; };
    };
    password "DrFun1_Duplicator_TLS_${rule.id}";
    class servers;
    type leaf;
};`;
    })
    .join('\n\n');

  return `/* =========================================================================
 * DrFun1 IRC Chat Room Duplicator Hosting Config — ${rule.label}
 * Source: ${rule.sourceHub} (${rule.sourceChannel}) -> ${rule.targetChannel}
 * Hosted Node: ${cleanHost} (${rule.infraProvider})
 * Licensing: www.wittlawfirm.com (FRN 0034981290) | Switch Counsel: CGW Law Offices
 * Payment Office: Owens Company (www.owenscompany.com) · Attn: Bill in Receiving
 * ========================================================================= */

me {
    name "${cleanHost}";
    info "DrFun1 Chat Room Duplicator Worker (${rule.planTier})";
    sid "9D1";
};

${targetLinks}

/* Redis & WordPress Duplicator Relay Pipeline */
relay_pipeline {
    rule_id "${rule.id}";
    source_hub "${rule.sourceHub}";
    source_channel "${rule.sourceChannel}";
    target_channel "${rule.targetChannel}";
    targets [ "${rule.targetHubs.join('", "')}" ];
    preserve_nick_prefix ${rule.preserveNickPrefix ? 'yes' : 'no'};
    strip_irc_colors ${rule.stripIrcColors ? 'yes' : 'no'};
    flood_rate_per_sec ${rule.floodRatePerSec};
    wordpress_webhook_enabled ${rule.wordpressSyncEnabled ? 'yes' : 'no'};
    wordpress_endpoint "${rule.wordpressWebhookUrl || 'disabled'}";
    hmac_sha256_secret "${rule.hmacKey}";
};`;
}

export function generateWordPressEmbedSnippet(rule: DuplicatorRelayRule): string {
  const hubsAttr = rule.targetHubs.length === 4 ? 'all' : rule.targetHubs.join(',');
  return `<!-- WordPress Block / Shortcode for ${rule.label} -->
[drfun1_irc_duplicator channel="${rule.sourceChannel}" target="${rule.targetChannel}" hubs="${hubsAttr}" duplicator_host="${rule.duplicatorServerHost}" ssl_port="6697"]

<?php
// wp-config.php / functions.php HMAC SHA-256 Relay Secret
define('DRFUN1_IRC_DUP_RULE', '${rule.id}');
define('DRFUN1_IRC_DUP_HMAC', '${rule.hmacKey}');
define('DRFUN1_IRC_DUP_ENDPOINT', '${rule.wordpressWebhookUrl || 'https://drfun1media.com/wp-json/drfun1-irc/v1/relay'}');
?>`;
}

export interface IframeEmbedOptions {
  heightPx: number;
  nickPrefix: string;
  theme: 'dark-slate' | 'purple-gold';
}

export function generateIframeSrcDocHtml(
  rule: DuplicatorRelayRule,
  options: IframeEmbedOptions = {
    heightPx: 460,
    nickPrefix: 'WebVisitor',
    theme: 'purple-gold',
  }
): string {
  const hubsList = rule.targetHubs.join(', ');
  const accent = options.theme === 'purple-gold' ? '#fbbf24' : '#38bdf8';
  const accentBorder = options.theme === 'purple-gold' ? '#9333ea' : '#0284c7';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>DrFun1 IRC Chat Duplicator - ${rule.sourceChannel}</title>
<style>
  * { box-sizing: border-box; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
  body { margin: 0; background: #020617; color: #e2e8f0; display: flex; flex-direction: column; height: 100vh; }
  .bar { padding: 10px 14px; background: #0f172a; border-bottom: 1px solid ${accentBorder}; display: flex; justify-content: space-between; align-items: center; gap: 8px; font-size: 12px; }
  .title { font-weight: 700; color: ${accent}; }
  .hubs { font-size: 11px; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 60%; }
  .log { flex: 1; overflow-y: auto; padding: 12px 14px; font-size: 12px; line-height: 1.5; }
  .line { margin-bottom: 6px; }
  .ts { color: #64748b; }
  .nick { color: #34d399; font-weight: 700; }
  .meta { color: #a78bfa; font-size: 11px; }
  .form { display: flex; gap: 8px; padding: 10px 14px; background: #0f172a; border-top: 1px solid #1e293b; }
  input { flex: 1; background: #020617; border: 1px solid #334155; color: #fff; border-radius: 6px; padding: 8px 10px; font-size: 12px; outline: none; }
  input:focus { border-color: ${accent}; }
  button { background: #7e22ce; color: #fff; border: none; border-radius: 6px; padding: 8px 14px; font-size: 12px; font-weight: 700; cursor: pointer; }
  button:hover { background: #9333ea; }
</style>
</head>
<body>
  <div class="bar">
    <span class="title">${rule.sourceChannel} -&gt; ${rule.targetChannel}</span>
    <span class="hubs">Hubs (${rule.targetHubs.length}): ${hubsList}</span>
  </div>
  <div id="chatLog" class="log">
    <div class="line"><span class="ts">[SYNC]</span> Connected to <span class="meta">${rule.duplicatorServerHost}:6697 (TLSv1.3)</span></div>
    <div class="line"><span class="ts">[MESH]</span> Duplicating across: <span class="meta">${hubsList}</span></div>
  </div>
  <form id="chatForm" class="form">
    <input id="nickInput" type="text" value="${options.nickPrefix}_101" style="max-width:130px" aria-label="Nickname" />
    <input id="msgInput" type="text" placeholder="Type message to duplicate across ${rule.targetHubs.length} hubs..." aria-label="Message" />
    <button type="submit">Send &amp; Duplicate</button>
  </form>
  <script>
    (function () {
      var log = document.getElementById('chatLog');
      var form = document.getElementById('chatForm');
      var nickEl = document.getElementById('nickInput');
      var msgEl = document.getElementById('msgInput');
      var targets = ${JSON.stringify(rule.targetHubs)};

      function appendLine(nick, text) {
        var now = new Date().toISOString().slice(11, 19);
        var div = document.createElement('div');
        div.className = 'line';
        div.textContent = '';
        var ts = document.createElement('span');
        ts.className = 'ts';
        ts.textContent = '[' + now + '] ';
        var nk = document.createElement('span');
        nk.className = 'nick';
        nk.textContent = '<' + nick + '> ';
        var body = document.createTextNode(text + ' ');
        var meta = document.createElement('span');
        meta.className = 'meta';
        meta.textContent = '[-> ' + targets.length + ' hubs]';
        div.appendChild(ts);
        div.appendChild(nk);
        div.appendChild(body);
        div.appendChild(meta);
        log.appendChild(div);
        log.scrollTop = log.scrollHeight;
      }

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var text = msgEl.value.trim();
        var nick = nickEl.value.trim() || 'WebUser';
        if (!text) return;
        appendLine(nick, text);
        msgEl.value = '';
        if (window.parent) {
          window.parent.postMessage({
            type: 'DRFUN1_IRC_DUPLICATOR_PACKET',
            ruleId: '${rule.id}',
            channel: '${rule.sourceChannel}',
            nick: nick,
            message: text,
            targets: targets
          }, '*');
        }
      });

      window.addEventListener('message', function (ev) {
        if (ev.data && ev.data.type === 'DRFUN1_IRC_DUPLICATOR_INBOUND' && ev.data.message) {
          appendLine(ev.data.nick || 'HubRelay', ev.data.message);
        }
      });
    })();
  </script>
</body>
</html>`;
}

export function generateStandaloneIframeAssetJs(rule: DuplicatorRelayRule): string {
  return `/**
 * DrFun1 IRC Chat Room Duplicator - WordPress & Standalone Iframe Loader
 * Rule: ${rule.label} (${rule.sourceChannel} -> ${rule.targetChannel})
 * Hubs: irc.drfun1.com, irc.drfun1media.com, irc.drfun1media.net, drfun1ircd.com (:6697 SSL)
 */
(function (window, document) {
  'use strict';

  function mountDrFun1IrcIframe(options) {
    var cfg = Object.assign({
      containerId: 'drfun1-irc-duplicator-iframe',
      channel: '${rule.sourceChannel}',
      targetChannel: '${rule.targetChannel}',
      duplicatorHost: '${rule.duplicatorServerHost}',
      hubs: ${JSON.stringify(rule.targetHubs)},
      webhookUrl: '${rule.wordpressWebhookUrl || 'https://drfun1media.com/wp-json/drfun1-irc/v1/relay'}',
      height: 460
    }, options || {});

    var container = document.getElementById(cfg.containerId);
    if (!container) return null;

    var iframe = document.createElement('iframe');
    iframe.title = 'DrFun1 IRC Chat Room Duplicator (' + cfg.channel + ')';
    iframe.style.width = '100%';
    iframe.style.height = cfg.height + 'px';
    iframe.style.border = '1px solid #334155';
    iframe.style.borderRadius = '12px';
    iframe.style.backgroundColor = '#020617';
    iframe.setAttribute('sandbox', 'allow-scripts allow-forms');
    iframe.setAttribute('loading', 'lazy');

    iframe.srcdoc = ${JSON.stringify(generateIframeSrcDocHtml(rule))};

    container.innerHTML = '';
    container.appendChild(iframe);

    window.addEventListener('message', function (event) {
      if (!event.data || event.data.type !== 'DRFUN1_IRC_DUPLICATOR_PACKET') return;
      if (typeof cfg.onPacket === 'function') {
        cfg.onPacket(event.data);
      }
      if (cfg.webhookUrl && typeof window.fetch === 'function') {
        window.fetch(cfg.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(event.data)
        }).catch(function () { /* non-blocking bridge */ });
      }
    });

    return iframe;
  }

  window.DrFun1IrcDuplicator = { mount: mountDrFun1IrcIframe };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      mountDrFun1IrcIframe();
    });
  } else {
    mountDrFun1IrcIframe();
  }
})(window, document);`;
}

export function generateIframeEmbedJs(
  rule: DuplicatorRelayRule,
  options: IframeEmbedOptions = {
    heightPx: 460,
    nickPrefix: 'WebVisitor',
    theme: 'purple-gold',
  }
): string {
  const srcDoc = generateIframeSrcDocHtml(rule, options);
  return `<div id="drfun1-irc-duplicator-host"></div>
<script>
(function () {
  var mount = document.getElementById('drfun1-irc-duplicator-host');
  if (!mount) return;

  var iframe = document.createElement('iframe');
  iframe.title = 'DrFun1 IRC Chat Room Duplicator (${rule.sourceChannel})';
  iframe.style.width = '100%';
  iframe.style.height = '${options.heightPx}px';
  iframe.style.border = '1px solid #334155';
  iframe.style.borderRadius = '12px';
  iframe.style.background = '#020617';
  iframe.setAttribute('sandbox', 'allow-scripts allow-forms');
  iframe.srcdoc = ${JSON.stringify(srcDoc)};

  mount.innerHTML = '';
  mount.appendChild(iframe);

  // Listen for duplicated chat packets posted out of the iframe
  window.addEventListener('message', function (event) {
    if (event.data && event.data.type === 'DRFUN1_IRC_DUPLICATOR_PACKET') {
      console.log('[DrFun1 Duplicator]', event.data.channel, event.data.nick + ':', event.data.message, '-> Hubs:', event.data.targets);
    }
  });
})();
</script>`;
}

export function generateWordPressPluginPhp(rule: DuplicatorRelayRule): string {
  const hubsCsv = rule.targetHubs.join(',');
  return `<?php
/**
 * Plugin Name: DrFun1 IRC Chat Room Duplicator
 * Plugin URI: https://drfun1media.com
 * Description: Managed WordPress plugin bridging posts & visitors to UnrealIRCd 6.1.4 4-Hub Duplicator Hosting (irc.drfun1.com, irc.drfun1media.com, irc.drfun1media.net, drfun1ircd.com) via iframe JS & HMAC SHA-256 REST webhooks.
 * Version: 2.6.0
 * Author: Richard Alan Witt (www.wittlawfirm.com)
 * License: Apache-2.0
 */

if (!defined('ABSPATH')) {
    exit;
}

define('DRFUN1_DUP_RULE_ID', '${rule.id}');
define('DRFUN1_DUP_HOST', '${rule.duplicatorServerHost}');
define('DRFUN1_DUP_SOURCE_CHANNEL', '${rule.sourceChannel}');
define('DRFUN1_DUP_TARGET_CHANNEL', '${rule.targetChannel}');
define('DRFUN1_DUP_HUBS', '${hubsCsv}');
define('DRFUN1_DUP_HMAC_SECRET', '${rule.hmacKey}');

/**
 * Enqueue standalone iframe loader JS when shortcode renders
 */
function drfun1_duplicator_register_assets() {
    wp_register_script(
        'drfun1-duplicator-iframe',
        plugin_dir_url(__FILE__) . 'assets/duplicator-iframe.js',
        array(),
        '2.6.0',
        true
    );
}
add_action('wp_enqueue_scripts', 'drfun1_duplicator_register_assets');

/**
 * Shortcode: [drfun1_irc_duplicator channel="${rule.sourceChannel}" height="460"]
 */
function drfun1_duplicator_shortcode($atts) {
    $atts = shortcode_atts(array(
        'channel' => DRFUN1_DUP_SOURCE_CHANNEL,
        'target'  => DRFUN1_DUP_TARGET_CHANNEL,
        'hubs'    => DRFUN1_DUP_HUBS,
        'height'  => '460',
    ), $atts, 'drfun1_irc_duplicator');

    wp_enqueue_script('drfun1-duplicator-iframe');
    $container_id = 'drfun1-irc-duplicator-iframe-' . wp_rand(100, 9999);
    $rest_url = esc_url_raw(rest_url('drfun1-irc/v1/relay'));

    ob_start();
    ?>
    <div id="<?php echo esc_attr($container_id); ?>" class="drfun1-irc-duplicator-wrap"></div>
    <script>
      window.addEventListener('DOMContentLoaded', function () {
        if (window.DrFun1IrcDuplicator) {
          window.DrFun1IrcDuplicator.mount({
            containerId: '<?php echo esc_js($container_id); ?>',
            channel: '<?php echo esc_js($atts['channel']); ?>',
            targetChannel: '<?php echo esc_js($atts['target']); ?>',
            hubs: '<?php echo esc_js($atts['hubs']); ?>'.split(','),
            webhookUrl: '<?php echo esc_js($rest_url); ?>',
            height: parseInt('<?php echo esc_js($atts['height']); ?>', 10) || 460
          });
        }
      });
    </script>
    <?php
    return ob_get_clean();
}
add_shortcode('drfun1_irc_duplicator', 'drfun1_duplicator_shortcode');

/**
 * REST API Endpoint: /wp-json/drfun1-irc/v1/relay
 */
function drfun1_duplicator_register_rest_routes() {
    register_rest_route('drfun1-irc/v1', '/relay', array(
        'methods'             => 'POST',
        'permission_callback' => '__return_true',
        'callback'            => function ($request) {
            $body = $request->get_json_params();
            $signature = $request->get_header('x-drfun1-hmac');
            if ($signature) {
                $expected = 'sha256=' . hash_hmac('sha256', wp_json_encode($body), DRFUN1_DUP_HMAC_SECRET);
                if (!hash_equals($expected, $signature)) {
                    return new WP_Error('invalid_hmac', 'Invalid HMAC signature', array('status' => 403));
                }
            }
            return rest_ensure_response(array(
                'status'  => 'replicated',
                'ruleId'  => DRFUN1_DUP_RULE_ID,
                'hubs'    => explode(',', DRFUN1_DUP_HUBS),
                'channel' => sanitize_text_field($body['channel'] ?? DRFUN1_DUP_SOURCE_CHANNEL),
            ));
        },
    ));
}
add_action('rest_api_init', 'drfun1_duplicator_register_rest_routes');
`;
}

export function generateWordPressReadmeTxt(rule: DuplicatorRelayRule): string {
  return `=== DrFun1 IRC Chat Room Duplicator ===
Contributors: drfun1media, wittlawfirm
Tags: irc, unrealircd, chat duplicator, websocket, iframe
Requires at least: 5.8
Tested up to: 6.7
Stable tag: 2.6.0
License: Apache-2.0

Managed WordPress plugin and JavaScript iframe embed for mirroring IRC channels across:
- irc.drfun1.com (SID 001)
- irc.drfun1media.com (SID 002)
- irc.drfun1media.net (SID 003)
- drfun1ircd.com (SID 004)

== Installation ==
1. Upload the drfun1-irc-chat-duplicator.zip file in WordPress Admin -> Plugins -> Add New -> Upload Plugin.
2. Activate the plugin.
3. Add shortcode [drfun1_irc_duplicator channel="${rule.sourceChannel}" height="460"] to any post or page.
4. Licensing: www.wittlawfirm.com (FRN 0034981290) | Counsel: CGW Law Offices | Payment Office: Owens Company (Bill in Receiving).
`;
}

