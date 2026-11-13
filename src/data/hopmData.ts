/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * Hybrid Open Proxy Monitor (HOPM) Data, Config Generators & Scanner Engine
 */

import {
  HopmDaemonState,
  HopmDetectionEvent,
  HopmDnsblZone,
  HopmExemptEntry,
  HopmProbeResultItem,
  HopmScanReport,
  HopmScannerProtocol,
} from '../types/hopm';

export const HOPM_STORAGE_KEY = 'drfun1_hopm_workspace_v1';

export const CORE_HOPM_HUBS: { domain: string; sid: string; location: string; ip: string }[] = [
  { domain: 'irc.drfun1.com', sid: '001', location: 'Switch SUPERNAP Las Vegas NV', ip: '198.51.100.10' },
  { domain: 'irc.drfun1media.com', sid: '002', location: 'DataPacket Anycast / NYC Core', ip: '185.152.64.20' },
  { domain: 'irc.drfun1media.net', sid: '003', location: 'Switch / RisingNet Mesh Hub', ip: '204.14.88.10' },
  { domain: 'drfun1ircd.com', sid: '004', location: 'Dual-Stack Global IRCd Hub', ip: '198.51.100.40' },
];

export const INITIAL_HOPM_DAEMON_STATE: HopmDaemonState = {
  installed: true,
  version: '1.1.10',
  installPath: '/opt/hopm',
  repoUrl: 'https://github.com/ircd-hybrid/hopm.git',
  systemdUnit: 'hopm.service',
  status: 'running',
  installedAt: '2026-03-14 04:15:00 UTC',
  lastRehashAt: '2026-03-14 04:18:22 UTC',
  operNick: 'HOPM',
  operPasswordMask: '$2y$12$HopmScannerOperSecretHash2026',
  bindIp: '198.51.100.12',
  banAction: 'GZLINE',
  banDuration: '7d',
  negCacheSeconds: 3600,
  maxScanConcurrency: 512,
  fdLimit: 4096,
  monitoredHubs: [
    'irc.drfun1.com',
    'irc.drfun1media.com',
    'irc.drfun1media.net',
    'drfun1ircd.com',
  ],
};

export const INITIAL_HOPM_SCANNERS: HopmScannerProtocol[] = [
  {
    id: 'scan-http',
    protocol: 'HTTP',
    ports: [80, 8080, 3128, 8000],
    enabled: true,
    targetIp: '198.51.100.10',
    targetPort: 6667,
    timeoutSec: 5,
    hits: 412,
  },
  {
    id: 'scan-httppost',
    protocol: 'HTTPPOST',
    ports: [80, 8080, 3128],
    enabled: true,
    targetIp: '198.51.100.10',
    targetPort: 6667,
    timeoutSec: 5,
    hits: 94,
  },
  {
    id: 'scan-socks4',
    protocol: 'SOCKS4',
    ports: [1080, 1081],
    enabled: true,
    targetIp: '198.51.100.10',
    targetPort: 6667,
    timeoutSec: 5,
    hits: 618,
  },
  {
    id: 'scan-socks5',
    protocol: 'SOCKS5',
    ports: [1080, 9050, 1081, 8080],
    enabled: true,
    targetIp: '198.51.100.10',
    targetPort: 6667,
    timeoutSec: 5,
    hits: 1485,
  },
  {
    id: 'scan-wingate',
    protocol: 'WINGATE',
    ports: [23],
    enabled: true,
    targetIp: '198.51.100.10',
    targetPort: 6667,
    timeoutSec: 5,
    hits: 37,
  },
  {
    id: 'scan-router',
    protocol: 'ROUTER',
    ports: [23],
    enabled: false,
    targetIp: '198.51.100.10',
    targetPort: 6667,
    timeoutSec: 5,
    hits: 11,
  },
];

export const INITIAL_HOPM_DNSBLS: HopmDnsblZone[] = [
  {
    id: 'dnsbl-dronebl',
    zone: 'dnsbl.dronebl.org',
    replyBitmasks: '3,5,6,7,8,9,10,11,13,14,15,17',
    enabled: true,
    banReason: 'Open proxy / DroneBL listed host (drfun1.com security)',
    hits: 5120,
  },
  {
    id: 'dnsbl-efnetrbl',
    zone: 'rbl.efnetrbl.org',
    replyBitmasks: '1,2,3,4,5',
    enabled: true,
    banReason: 'EFnetRBL open proxy / tor exit / drone detected',
    hits: 2340,
  },
  {
    id: 'dnsbl-tor',
    zone: 'tor.dan.me.uk',
    replyBitmasks: '100',
    enabled: true,
    banReason: 'Unverified Tor exit relay blocked by HOPM policy',
    hits: 842,
  },
  {
    id: 'dnsbl-ircbl',
    zone: 'rbl.ircbl.org',
    replyBitmasks: '1,2,4,8',
    enabled: true,
    banReason: 'IRCBL open proxy / abuse source detected',
    hits: 118,
  },
];

export const INITIAL_HOPM_EXEMPTS: HopmExemptEntry[] = [
  {
    id: 'ex-switch',
    mask: '198.51.100.0/24',
    reason: 'Switch SUPERNAP Las Vegas Core Hubs & Carrier Mesh (CGW Law Offices)',
    addedBy: 'RichardAlanWitt',
    addedAt: '2026-03-14 04:15 UTC',
  },
  {
    id: 'ex-datapacket',
    mask: '185.152.64.0/22',
    reason: 'DataPacket 100G Dedicated Leaf Nodes (12/Hub Sync)',
    addedBy: 'HOPM',
    addedAt: '2026-03-14 04:15 UTC',
  },
  {
    id: 'ex-risingnet',
    mask: '204.14.88.0/24',
    reason: 'RisingNet 10 Dedicated Servers & Dual-Hub Sync Links',
    addedBy: 'OwensOps',
    addedAt: '2026-03-14 04:15 UTC',
  },
  {
    id: 'ex-loopback',
    mask: '127.0.0.1/32',
    reason: 'Local Anope Services, ZNC Bouncer & StatServ Daemon',
    addedBy: 'HOPM',
    addedAt: '2026-03-14 04:15 UTC',
  },
  {
    id: 'ex-witt',
    mask: '10.240.0.0/16',
    reason: 'Witt Law Firm & Owens Company Internal Administration Tunnel',
    addedBy: 'RichardAlanWitt',
    addedAt: '2026-03-14 04:15 UTC',
  },
];

export const INITIAL_HOPM_EVENTS: HopmDetectionEvent[] = [
  {
    id: 'evt-1',
    timestamp: '04:18:09 UTC',
    ip: '185.220.101.42',
    nick: 'relay_probe88',
    identHost: '~anon@185.220.101.42',
    hub: 'irc.drfun1.com',
    detectionSource: 'DNSBL',
    detail: 'tor.dan.me.uk (127.0.0.100) + SOCKS5:9050 open',
    actionIssued: 'GZLINE *@185.220.101.42',
    duration: '7d',
  },
  {
    id: 'evt-2',
    timestamp: '04:17:44 UTC',
    ip: '45.155.205.88',
    nick: 'floodbot_91',
    identHost: '~curl@45.155.205.88',
    hub: 'irc.drfun1media.com',
    detectionSource: 'SCANNER',
    detail: 'SOCKS5 proxy handshake succeeded on port 1080',
    actionIssued: 'GZLINE *@45.155.205.88',
    duration: '7d',
  },
  {
    id: 'evt-3',
    timestamp: '04:16:52 UTC',
    ip: '194.26.135.14',
    nick: 'squid_node4',
    identHost: '~proxy@194.26.135.14',
    hub: 'irc.drfun1media.net',
    detectionSource: 'SCANNER',
    detail: 'HTTP CONNECT open relay detected on port 3128',
    actionIssued: 'GZLINE *@194.26.135.14',
    duration: '7d',
  },
  {
    id: 'evt-4',
    timestamp: '04:16:05 UTC',
    ip: '91.219.236.222',
    nick: 'drone_scan2',
    identHost: '~bot@91.219.236.222',
    hub: 'drfun1ircd.com',
    detectionSource: 'DNSBL',
    detail: 'dnsbl.dronebl.org reply 127.0.0.17 (Auto-listed proxy)',
    actionIssued: 'GZLINE *@91.219.236.222',
    duration: '7d',
  },
];

export interface HopmWorkspaceSnapshot {
  daemon: HopmDaemonState;
  scanners: HopmScannerProtocol[];
  dnsbls: HopmDnsblZone[];
  exempts: HopmExemptEntry[];
  events: HopmDetectionEvent[];
}

export function loadHopmWorkspace(): HopmWorkspaceSnapshot {
  if (typeof window === 'undefined') {
    return {
      daemon: INITIAL_HOPM_DAEMON_STATE,
      scanners: INITIAL_HOPM_SCANNERS,
      dnsbls: INITIAL_HOPM_DNSBLS,
      exempts: INITIAL_HOPM_EXEMPTS,
      events: INITIAL_HOPM_EVENTS,
    };
  }
  try {
    const raw = window.localStorage.getItem(HOPM_STORAGE_KEY);
    if (!raw) {
      return {
        daemon: INITIAL_HOPM_DAEMON_STATE,
        scanners: INITIAL_HOPM_SCANNERS,
        dnsbls: INITIAL_HOPM_DNSBLS,
        exempts: INITIAL_HOPM_EXEMPTS,
        events: INITIAL_HOPM_EVENTS,
      };
    }
    const parsed = JSON.parse(raw) as Partial<HopmWorkspaceSnapshot>;
    return {
      daemon: parsed.daemon ? { ...INITIAL_HOPM_DAEMON_STATE, ...parsed.daemon } : INITIAL_HOPM_DAEMON_STATE,
      scanners: Array.isArray(parsed.scanners) && parsed.scanners.length ? parsed.scanners : INITIAL_HOPM_SCANNERS,
      dnsbls: Array.isArray(parsed.dnsbls) && parsed.dnsbls.length ? parsed.dnsbls : INITIAL_HOPM_DNSBLS,
      exempts: Array.isArray(parsed.exempts) && parsed.exempts.length ? parsed.exempts : INITIAL_HOPM_EXEMPTS,
      events: Array.isArray(parsed.events) && parsed.events.length ? parsed.events : INITIAL_HOPM_EVENTS,
    };
  } catch {
    return {
      daemon: INITIAL_HOPM_DAEMON_STATE,
      scanners: INITIAL_HOPM_SCANNERS,
      dnsbls: INITIAL_HOPM_DNSBLS,
      exempts: INITIAL_HOPM_EXEMPTS,
      events: INITIAL_HOPM_EVENTS,
    };
  }
}

export function saveHopmWorkspace(snapshot: HopmWorkspaceSnapshot): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(HOPM_STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // ignore storage quota failure
  }
}

function ipToNumber(ip: string): number | null {
  const parts = ip.trim().split('.');
  if (parts.length !== 4) return null;
  let num = 0;
  for (const part of parts) {
    if (!/^\d+$/.test(part)) return null;
    const n = Number(part);
    if (n < 0 || n > 255) return null;
    num = (num << 8) | n;
  }
  return num >>> 0;
}

export function isIpInCidrOrMask(ip: string, mask: string): boolean {
  const cleanMask = mask.trim();
  if (!cleanMask) return false;
  if (cleanMask === ip.trim()) return true;
  if (cleanMask.includes('/')) {
    const [baseIp, prefixStr] = cleanMask.split('/');
    const prefix = Number(prefixStr);
    const ipNum = ipToNumber(ip);
    const baseNum = ipToNumber(baseIp);
    if (ipNum === null || baseNum === null || Number.isNaN(prefix) || prefix < 0 || prefix > 32) {
      return false;
    }
    const bitmask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
    return (ipNum & bitmask) === (baseNum & bitmask);
  }
  if (cleanMask.endsWith('*')) {
    return ip.startsWith(cleanMask.slice(0, -1));
  }
  return false;
}

export function generateHopmConf(
  daemon: HopmDaemonState,
  scanners: HopmScannerProtocol[],
  dnsbls: HopmDnsblZone[],
  exempts: HopmExemptEntry[]
): string {
  const banCmd =
    daemon.banAction === 'GZLINE'
      ? `GZLINE *@%i ${daemon.banDuration} :Open proxy (%t) detected by DrFun1 HOPM (www.wittlawfirm.com)`
      : daemon.banAction === 'GLINE'
        ? `GLINE *@%i ${daemon.banDuration} :Open proxy (%t) detected by DrFun1 HOPM (www.wittlawfirm.com)`
        : `KLINE *@%i ${daemon.banDuration} :Open proxy (%t) detected by DrFun1 HOPM (www.wittlawfirm.com)`;

  const ircBlocks = daemon.monitoredHubs
    .map((hubDomain) => {
      const hubMeta = CORE_HOPM_HUBS.find((h) => h.domain === hubDomain);
      return `irc {
    nick = "${daemon.operNick}";
    realname = "Hybrid Open Proxy Monitor v${daemon.version} - DrFun1Media Mesh";
    username = "hopm";
    server = "${hubDomain}";
    port = 6697;
    tls = yes;
    oper = "${daemon.operNick} ${daemon.operPasswordMask}";
    mode = "+Fc";
    vhost = "${daemon.bindIp}";
    nickserv = "PRIVMSG NickServ :IDENTIFY HOPM ${daemon.operPasswordMask}";
    channel {
        name = "#orbit-ops";
        key = "drfun1ops";
        invite = "PRIVMSG ChanServ :INVITE #orbit-ops";
    };
    connregex = "\\*\\*\\* Notice -- Client connecting: ([^ ]+) \\(([^@]+)@([^\\)]+)\\) \\[([0-9a-fA-F\\.:]+)\\]";
    kline = "${banCmd}";
    /* ${hubMeta ? `${hubMeta.location} (SID ${hubMeta.sid})` : 'Custom UnrealIRCd Hub'} */
};`;
    })
    .join('\n\n');

  const scannerBlocks = scanners
    .filter((s) => s.enabled)
    .map(
      (s) => `scanner {
    name = "${s.protocol.toLowerCase()}";
    ${s.ports.map((p) => `protocol = ${s.protocol}:${p};`).join('\n    ')}
    target_ip = "${s.targetIp}";
    target_port = ${s.targetPort};
    target_string = "NOTICE AUTH :*** Looking up your hostname...";
    timeout = ${s.timeoutSec};
    max_read = 4096;
    bind = "${daemon.bindIp}";
    fd = ${daemon.fdLimit};
};`
    )
    .join('\n\n');

  const dnsblBlocks = dnsbls
    .filter((d) => d.enabled)
    .map(
      (d) => `    blacklist {
        name = "${d.zone}";
        type = "A record bitmask";
        ban_unknown = no;
        ${d.replyBitmasks
          .split(',')
          .map((m) => m.trim())
          .filter(Boolean)
          .map((bit) => `reply { ${bit} = "${d.banReason}"; };`)
          .join('\n        ')}
    };`
    )
    .join('\n\n');

  const exemptMasks = exempts.map((ex) => `    mask = "${ex.mask}"; /* ${ex.reason} */`).join('\n');

  return `/*
 * HOPM ${daemon.version} (Hybrid Open Proxy Monitor) Configuration
 * Repo: ${daemon.repoUrl}
 * Prefix: ${daemon.installPath}
 * Network: DrFun1 Orbit Satcom & MPD Broadcast Mesh (4-Hub UnrealIRCd 6.1.4)
 * Licensed to Richard Alan Witt LLC (www.wittlawfirm.com)
 * Billing: Owens Company (www.owenscompany.com) | Counsel: CGW Law Offices
 */

options {
    pidfile = "${daemon.installPath}/var/hopm.pid";
    negcache = ${daemon.negCacheSeconds};
    dns_fdlimit = ${daemon.fdLimit};
    scanlog = "${daemon.installPath}/var/log/scan.log";
    command_queue_size = ${daemon.maxScanConcurrency};
    command_interval = 1;
    command_timeout = 180;
};

${ircBlocks}

opm {
    dnsbl_from = "hopm-alerts@drfun1.com";
    dnsbl_to = "dnsbl-reports@dronebl.org";
    sendmail = "/usr/sbin/sendmail";

${dnsblBlocks}
};

${scannerBlocks}

user {
    mask = "*!*@*";
    scanner = "http";
    scanner = "httppost";
    scanner = "socks4";
    scanner = "socks5";
    scanner = "wingate";
};

exempt {
${exemptMasks}
};
`;
}

export function generateUnrealHopmOperBlock(daemon: HopmDaemonState): string {
  return `/* Add to unrealircd.conf on all 4 Core Hubs (${daemon.monitoredHubs.join(', ')}) */

oper ${daemon.operNick} {
    class opers;
    mask "*@${daemon.bindIp}";
    password "${daemon.operPasswordMask}";
    swhois "is the Hybrid Open Proxy Monitor (${daemon.version})";
    vhost "hopm.security.drfun1.com";
    snomask "cF";
    flags {
        local;
        global;
        can_gzline;
        can_gline;
        can_kline;
        can_zline;
        can_override;
    };
};

except ban {
    mask "${daemon.bindIp}";
    type { all; };
};

except throttle {
    mask "${daemon.bindIp}";
};
`;
}

export function generateHopmInstallScript(daemon: HopmDaemonState, hopmConf: string): string {
  return `#!/usr/bin/env bash
# HOPM ${daemon.version} Automated Installer for UnrealIRCd 6.1.4 4-Hub Mesh
# Source: ${daemon.repoUrl}
# Targets: ${daemon.monitoredHubs.join(', ')}
set -euo pipefail

echo "[1/5] Installing build toolchain dependencies..."
sudo apt-get update -y
sudo apt-get install -y build-essential autoconf automake libtool libssl-dev git pkg-config

echo "[2/5] Cloning Hybrid Open Proxy Monitor (HOPM) from GitHub..."
rm -rf /tmp/hopm-src
git clone ${daemon.repoUrl} /tmp/hopm-src
cd /tmp/hopm-src

echo "[3/5] Configuring & compiling HOPM to ${daemon.installPath}..."
./autogen.sh || true
./configure --prefix=${daemon.installPath} --enable-openssl
make -j"$(nproc)"
sudo make install
sudo mkdir -p ${daemon.installPath}/etc ${daemon.installPath}/var/log

echo "[4/5] Writing ${daemon.installPath}/etc/hopm.conf..."
cat << 'EOF' | sudo tee ${daemon.installPath}/etc/hopm.conf >/dev/null
${hopmConf}
EOF

echo "[5/5] Installing and starting systemd service (${daemon.systemdUnit})..."
cat << 'EOF' | sudo tee /etc/systemd/system/${daemon.systemdUnit} >/dev/null
[Unit]
Description=Hybrid Open Proxy Monitor (HOPM ${daemon.version}) - DrFun1 4-Hub Security
After=network-online.target unrealircd.service
Wants=network-online.target

[Service]
Type=forking
PIDFile=${daemon.installPath}/var/hopm.pid
ExecStart=${daemon.installPath}/bin/hopm -c ${daemon.installPath}/etc/hopm.conf
ExecReload=/bin/kill -HUP $MAINPID
Restart=always
RestartSec=5
LimitNOFILE=${daemon.fdLimit}

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now ${daemon.systemdUnit}
sudo systemctl status ${daemon.systemdUnit} --no-pager
echo "HOPM ${daemon.version} installed and linked to ${daemon.monitoredHubs.join(', ')}!"
`;
}

export function evaluateIpAgainstHopm(
  rawIp: string,
  rawNick: string,
  hub: string,
  daemon: HopmDaemonState,
  scanners: HopmScannerProtocol[],
  dnsbls: HopmDnsblZone[],
  exempts: HopmExemptEntry[],
  forcedMode: 'auto' | 'socks5' | 'http' | 'dnsbl' | 'clean' = 'auto'
): HopmScanReport {
  const ip = rawIp.trim() || '185.220.101.42';
  const nick = rawNick.trim() || 'guest_user';
  const nowUtc = new Date().toISOString().slice(11, 19) + ' UTC';
  const probes: HopmProbeResultItem[] = [];

  // 1. Check exempt ranges first
  const matchedExempt = exempts.find((ex) => isIpInCidrOrMask(ip, ex.mask));
  if (matchedExempt && forcedMode === 'auto') {
    probes.push({
      checkName: matchedExempt.mask,
      category: 'EXEMPT',
      status: 'EXEMPT',
      latencyMs: 1,
      detail: `Exempted infrastructure mask: ${matchedExempt.reason}`,
    });
    return {
      ip,
      nick,
      hub,
      verdict: 'EXEMPT',
      actionIssued: 'NONE (EXEMPT)',
      probes,
      event: {
        id: `evt-${Date.now()}`,
        timestamp: nowUtc,
        ip,
        nick,
        identHost: `~user@${ip}`,
        hub,
        detectionSource: 'EXEMPT',
        detail: `Exempt CIDR match (${matchedExempt.mask})`,
        actionIssued: 'ALLOW (EXEMPT)',
        duration: '-',
      },
    };
  }

  // Deterministic classification based on IP heuristics + optional simulation mode
  const isKnownTor = ip.startsWith('185.220.') || ip.startsWith('104.244.');
  const isKnownSocks5 = forcedMode === 'socks5' || ip.startsWith('45.155.205.') || ip.startsWith('103.251.');
  const isKnownHttpProxy = forcedMode === 'http' || ip.startsWith('194.26.135.') || ip.startsWith('192.0.2.');
  const isKnownDroneBl = forcedMode === 'dnsbl' || isKnownTor || ip.startsWith('91.219.236.') || ip.startsWith('198.98.');

  let detectedVerdict: HopmScanReport['verdict'] = 'CLEAN';
  let detectionSource: HopmDetectionEvent['detectionSource'] = 'CLEAN';
  let primaryDetail = 'All enabled proxy ports closed; negative DNSBL lookups';

  // 2. Evaluate enabled DNSBL zones
  for (const zone of dnsbls.filter((d) => d.enabled)) {
    const hitTor = isKnownTor && zone.zone.includes('tor');
    const hitDrone = isKnownDroneBl && (zone.zone.includes('dronebl') || zone.zone.includes('efnet'));
    if (hitTor || hitDrone) {
      detectedVerdict = 'DNSBL_LISTED';
      detectionSource = 'DNSBL';
      primaryDetail = `${zone.zone} returned listed bitmask (${zone.banReason})`;
      probes.push({
        checkName: zone.zone,
        category: 'DNSBL',
        status: 'LISTED',
        latencyMs: 18,
        detail: zone.banReason,
      });
    } else {
      probes.push({
        checkName: zone.zone,
        category: 'DNSBL',
        status: 'CLOSED',
        latencyMs: 14,
        detail: 'NXDOMAIN (not listed)',
      });
    }
  }

  // 3. Evaluate enabled proxy port scanners
  for (const sc of scanners.filter((s) => s.enabled)) {
    for (const port of sc.ports) {
      const hitSocks5 = (isKnownSocks5 || isKnownTor) && sc.protocol === 'SOCKS5' && (port === 1080 || port === 9050);
      const hitHttp = isKnownHttpProxy && (sc.protocol === 'HTTP' || sc.protocol === 'HTTPPOST') && (port === 3128 || port === 8080);

      if (hitSocks5 || hitHttp) {
        if (detectedVerdict === 'CLEAN') {
          detectedVerdict = 'PROXY_DETECTED';
          detectionSource = 'SCANNER';
          primaryDetail = `Open ${sc.protocol} proxy relay verified on port ${port}`;
        }
        probes.push({
          checkName: `${sc.protocol}:${port}`,
          category: 'SCANNER',
          status: 'OPEN_HIT',
          latencyMs: 42,
          detail: `CONNECT ${sc.targetIp}:${sc.targetPort} succeeded -> UnrealIRCd handshake echoed`,
        });
      } else {
        probes.push({
          checkName: `${sc.protocol}:${port}`,
          category: 'SCANNER',
          status: 'CLOSED',
          latencyMs: 9,
          detail: 'Connection refused / closed',
        });
      }
    }
  }

  const actionIssued =
    detectedVerdict === 'CLEAN'
      ? `NEGCACHE (${daemon.negCacheSeconds}s)`
      : `${daemon.banAction} *@${ip}`;

  return {
    ip,
    nick,
    hub,
    verdict: detectedVerdict,
    actionIssued,
    probes,
    event: {
      id: `evt-${Date.now()}`,
      timestamp: nowUtc,
      ip,
      nick,
      identHost: `~user@${ip}`,
      hub,
      detectionSource,
      detail: primaryDetail,
      actionIssued,
      duration: detectedVerdict === 'CLEAN' ? '-' : daemon.banDuration === '0' ? 'PERM' : daemon.banDuration,
    },
  };
}
