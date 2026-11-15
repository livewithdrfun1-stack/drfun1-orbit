/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 *
 * VoIP SIP/SRTP Trunking Data for all 855,000 SHOUTcast Stations &
 * Supreme Court (https://www.supremecourt.gov) DJ/Host Hiring Governance
 * Administered through www.wittlawfirm.com.
 */

import {
  DjHostHiringRecord,
  ShoutcastVoipTrunkCluster,
  ShoutcastVoipWorkspace,
  VoipDialTestResult,
} from '../types/shoutcastVoip';

export const SHOUTCAST_VOIP_STORAGE_KEY = 'drfun1_shoutcast_voip_scotus_v1';

export const SUPREME_COURT_URL = 'https://www.supremecourt.gov';
export const WITT_LAW_URL = 'https://www.wittlawfirm.com';

export const INITIAL_VOIP_TRUNK_CLUSTERS: ShoutcastVoipTrunkCluster[] = [
  {
    id: 'cluster-west-hiphop',
    name: 'Cluster 1 · West Coast, Death Row & Hip-Hop Stations',
    regionHub: 'irc.drfun1.com (Switch SUPERNAP NV)',
    stationRangeStart: 1,
    stationRangeEnd: 215000,
    stationCount: 215000,
    sipDomain: 'west-voip.drfun1.com',
    didBlock: '+1-702-855-0001 to 215000',
    activeCalls: 1842,
    latencyMs: 6.4,
    srtpStatus: 'VERIFIED_TLS13_SRTP',
  },
  {
    id: 'cluster-dc-law-talk',
    name: 'Cluster 2 · Supreme Court Docket, News & Talk Stations',
    regionHub: 'irc.drfun1media.com (Ashburn DataPacket)',
    stationRangeStart: 215001,
    stationRangeEnd: 355000,
    stationCount: 140000,
    sipDomain: 'dc-voip.drfun1.com',
    didBlock: '+1-202-855-0001 to 140000',
    activeCalls: 1290,
    latencyMs: 11.2,
    srtpStatus: 'VERIFIED_TLS13_SRTP',
  },
  {
    id: 'cluster-midwest-elec',
    name: 'Cluster 3 · Electronic, Synthwave & MPD Club Mixes',
    regionHub: 'irc.drfun1media.net (Chicago RisingNet 100G)',
    stationRangeStart: 355001,
    stationRangeEnd: 535000,
    stationCount: 180000,
    sipDomain: 'chi-voip.drfun1.com',
    didBlock: '+1-312-855-0001 to 180000',
    activeCalls: 1510,
    latencyMs: 14.8,
    srtpStatus: 'VERIFIED_TLS13_SRTP',
  },
  {
    id: 'cluster-east-sports',
    name: 'Cluster 4 · Sports Talk, Live Call-In & Fubo Relay',
    regionHub: 'drfun1ircd.com (NYC Switch/DataPacket)',
    stationRangeStart: 535001,
    stationRangeEnd: 700000,
    stationCount: 165000,
    sipDomain: 'nyc-voip.drfun1.com',
    didBlock: '+1-212-855-0001 to 165000',
    activeCalls: 1635,
    latencyMs: 16.5,
    srtpStatus: 'VERIFIED_TLS13_SRTP',
  },
  {
    id: 'cluster-global-satcom',
    name: 'Cluster 5 · Global Satcom, Indie & World Broadcasts',
    regionHub: 'irc.drfun1.com (LAX / Global RisingNet Mesh)',
    stationRangeStart: 700001,
    stationRangeEnd: 855000,
    stationCount: 155000,
    sipDomain: 'global-voip.drfun1.com',
    didBlock: '+1-310-855-0001 to 155000',
    activeCalls: 1180,
    latencyMs: 19.1,
    srtpStatus: 'VERIFIED_TLS13_SRTP',
  },
];

export const INITIAL_DJ_HOST_HIRING_ROSTER: DjHostHiringRecord[] = [
  {
    id: 'dj-john-roberts',
    name: 'Chief Justice John G. Roberts, Jr. (~ Owner · John Roberts Rank)',
    ircNick: 'ChiefJustice_JohnRoberts',
    role: 'Program Director',
    assignedStations: 'All 855,000 SHOUTcast Stations (Supreme Court Chief Authority)',
    voipExtension: '855-000000',
    sipUri: 'sip:jroberts@chiefjustice.supremecourt.gov:5061',
    status: 'APPROVED_ACTIVE',
    approvingAuthority: 'Supreme Court of the United States',
    governingUrl: SUPREME_COURT_URL,
    administeredThrough: 'The Law Office of Richard A. Witt LLC',
    counselUrl: WITT_LAW_URL,
    docketNumber: 'SCOTUS-CHIEF-2026-0000',
    updatedAt: '2026-11-14 19:45 UTC',
  },
  {
    id: 'dj-rawitt',
    name: 'Richard Alan Witt, Esq. (~ Owner · John Roberts Rank)',
    ircNick: 'RichardAlanWitt',
    role: 'Program Director',
    assignedStations: 'All 855,000 SHOUTcast Stations (Global Executive Bridge)',
    voipExtension: '855-000001',
    sipUri: 'sip:rawitt@voip.drfun1.com:5061',
    status: 'APPROVED_ACTIVE',
    approvingAuthority: 'Supreme Court of the United States',
    governingUrl: SUPREME_COURT_URL,
    administeredThrough: 'The Law Office of Richard A. Witt LLC',
    counselUrl: WITT_LAW_URL,
    docketNumber: 'SCOTUS-WITT-2026-0001',
    updatedAt: '2026-11-14 19:20 UTC',
  },
  {
    id: 'dj-wittlaw-staff',
    name: 'Eleanor Vance, Esq. & Witt Law Firm Coworkers (~ Owner)',
    ircNick: 'EleanorVance_Esq',
    role: 'Program Director',
    assignedStations: 'All 855,000 SHOUTcast Stations (Witt Law Firm ~ Owner Desk)',
    voipExtension: '855-000002',
    sipUri: 'sip:wittlaw@voip.drfun1.com:5061',
    status: 'APPROVED_ACTIVE',
    approvingAuthority: 'Supreme Court of the United States',
    governingUrl: SUPREME_COURT_URL,
    administeredThrough: 'The Law Office of Richard A. Witt LLC',
    counselUrl: WITT_LAW_URL,
    docketNumber: 'SCOTUS-WITT-2026-0002',
    updatedAt: '2026-11-14 19:45 UTC',
  },
  {
    id: 'dj-scotus-clerk',
    name: 'Scott S. Harris & Confirmed SCOTUS Court Staff (~ Owner · John Roberts Rank)',
    ircNick: 'ScottSHarris_SCOTUS',
    role: 'Broadcast Host',
    assignedStations: 'Stations #1–#855,000 (SCOTUS Confirmed Staff Bridge)',
    voipExtension: '855-000003',
    sipUri: 'sip:clerk@supremecourt.gov:5061',
    status: 'APPROVED_ACTIVE',
    approvingAuthority: 'Supreme Court of the United States',
    governingUrl: SUPREME_COURT_URL,
    administeredThrough: 'The Law Office of Richard A. Witt LLC',
    counselUrl: WITT_LAW_URL,
    docketNumber: 'SCOTUS-WITT-2026-0003',
    updatedAt: '2026-11-14 19:45 UTC',
  },
  {
    id: 'dj-orbitnova',
    name: 'DJ Orbit Nova',
    ircNick: 'DJ_OrbitNova',
    role: 'Station DJ',
    assignedStations: 'Stations #1–#215,000 (#music-deathrow & #drfun1-dj)',
    voipExtension: '855-001042',
    sipUri: 'sip:orbitnova@west-voip.drfun1.com:5061',
    status: 'APPROVED_ACTIVE',
    approvingAuthority: 'Supreme Court of the United States',
    governingUrl: SUPREME_COURT_URL,
    administeredThrough: 'The Law Office of Richard A. Witt LLC',
    counselUrl: WITT_LAW_URL,
    docketNumber: 'SCOTUS-WITT-2026-0142',
    updatedAt: '2026-11-14 19:20 UTC',
  },
  {
    id: 'dj-vinylkev',
    name: 'Kevin "Vinyl Kev" Mercer',
    ircNick: 'VinylKev',
    role: 'Station DJ',
    assignedStations: 'Stations #355,001–#535,000 (Electronic & Synthwave)',
    voipExtension: '855-355018',
    sipUri: 'sip:vinylkev@chi-voip.drfun1.com:5061',
    status: 'APPROVED_ACTIVE',
    approvingAuthority: 'Supreme Court of the United States',
    governingUrl: SUPREME_COURT_URL,
    administeredThrough: 'The Law Office of Richard A. Witt LLC',
    counselUrl: WITT_LAW_URL,
    docketNumber: 'SCOTUS-WITT-2026-0218',
    updatedAt: '2026-11-14 19:20 UTC',
  },
  {
    id: 'host-dc-desk',
    name: 'Justice Oral-Argument Broadcast Host',
    ircNick: 'SCOTUS_Host_DC',
    role: 'Broadcast Host',
    assignedStations: 'Stations #215,001–#355,000 (DC Docket & News Talk)',
    voipExtension: '855-215009',
    sipUri: 'sip:scotushost@dc-voip.drfun1.com:5061',
    status: 'APPROVED_ACTIVE',
    approvingAuthority: 'Supreme Court of the United States',
    governingUrl: SUPREME_COURT_URL,
    administeredThrough: 'The Law Office of Richard A. Witt LLC',
    counselUrl: WITT_LAW_URL,
    docketNumber: 'SCOTUS-WITT-2026-0309',
    updatedAt: '2026-11-14 19:20 UTC',
  },
  {
    id: 'host-pending-1',
    name: 'Elena Vance (Live Sports Call-In Applicant)',
    ircNick: 'Elena_Host_NY',
    role: 'Live Call Screener',
    assignedStations: 'Stations #535,001–#700,000 (Sports Call-In Bridge)',
    voipExtension: '855-535410',
    sipUri: 'sip:evance@nyc-voip.drfun1.com:5061',
    status: 'PENDING_SCOTUS_REVIEW',
    approvingAuthority: 'Supreme Court of the United States',
    governingUrl: SUPREME_COURT_URL,
    administeredThrough: 'The Law Office of Richard A. Witt LLC',
    counselUrl: WITT_LAW_URL,
    docketNumber: 'SCOTUS-WITT-2026-0410',
    updatedAt: '2026-11-14 19:25 UTC',
  },
];

export const INITIAL_SHOUTCAST_VOIP_WORKSPACE: ShoutcastVoipWorkspace = {
  provisioned: true,
  sipRegistrar: 'voip.drfun1.com',
  sipPort: 5061,
  tlsProtocol: 'SIP over TLS 1.3 (RFC 5630) + SRTP AES-256-GCM',
  codec: 'Opus 48kHz Stereo',
  totalShoutcastStations: 855000,
  provisionedStations: 855000,
  rtpPortRange: '10000-29999/UDP',
  governingAuthorityUrl: SUPREME_COURT_URL,
  counselUrl: WITT_LAW_URL,
  lastSyncedAt: '2026-11-14 19:28:00 UTC',
  clusters: INITIAL_VOIP_TRUNK_CLUSTERS,
  hiringRoster: INITIAL_DJ_HOST_HIRING_ROSTER,
};

export function loadShoutcastVoipWorkspace(): ShoutcastVoipWorkspace {
  if (typeof window === 'undefined') return INITIAL_SHOUTCAST_VOIP_WORKSPACE;
  try {
    const raw = window.localStorage.getItem(SHOUTCAST_VOIP_STORAGE_KEY);
    if (!raw) return INITIAL_SHOUTCAST_VOIP_WORKSPACE;
    const parsed = JSON.parse(raw) as Partial<ShoutcastVoipWorkspace>;
    return {
      ...INITIAL_SHOUTCAST_VOIP_WORKSPACE,
      ...parsed,
      clusters:
        Array.isArray(parsed.clusters) && parsed.clusters.length
          ? parsed.clusters
          : INITIAL_VOIP_TRUNK_CLUSTERS,
      hiringRoster:
        Array.isArray(parsed.hiringRoster) && parsed.hiringRoster.length
          ? parsed.hiringRoster
          : INITIAL_DJ_HOST_HIRING_ROSTER,
    };
  } catch {
    return INITIAL_SHOUTCAST_VOIP_WORKSPACE;
  }
}

export function saveShoutcastVoipWorkspace(workspace: ShoutcastVoipWorkspace): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(SHOUTCAST_VOIP_STORAGE_KEY, JSON.stringify(workspace));
  } catch {
    // ignore storage quota failure
  }
}

export function dialShoutcastStationVoip(
  rawStationNumber: number,
  workspace: ShoutcastVoipWorkspace
): VoipDialTestResult {
  const stationNum = Math.min(855000, Math.max(1, Math.floor(rawStationNumber || 1)));
  const cluster =
    workspace.clusters.find(
      (c) => stationNum >= c.stationRangeStart && stationNum <= c.stationRangeEnd
    ) || workspace.clusters[0];
  const ext = String(stationNum).padStart(6, '0');
  const didArea = cluster.didBlock.slice(0, 10); // e.g. "+1-702-855"
  return {
    stationNumber: stationNum,
    sipUri: `sip:sc${ext}@${cluster.sipDomain}:${workspace.sipPort}`,
    clusterName: cluster.name,
    didNumber: `${didArea}-${ext.slice(-4)}`,
    codec: workspace.codec,
    rttMs: cluster.latencyMs,
    srtpCipher: 'AEAD_AES_256_GCM',
    status: 'CONNECTED_TO_SHOUTCAST_BRIDGE',
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
  };
}

export function generateAsteriskShoutcastVoipConf(workspace: ShoutcastVoipWorkspace): string {
  const codecMap: Record<ShoutcastVoipWorkspace['codec'], string> = {
    'Opus 48kHz Stereo': 'opus',
    'G.722 Wideband': 'g722',
    'G.711 u-Law': 'ulaw',
    'EVS Super-Wideband': 'evs',
  };
  const asteriskCodec = codecMap[workspace.codec];

  return `;===========================================================================
; Asterisk / Kamailio PJSIP Trunking for ALL 855,000 SHOUTcast Stations
; Registrar: ${workspace.sipRegistrar}:${workspace.sipPort} (${workspace.tlsProtocol})
; DJ & Host Hiring Authority: ${workspace.governingAuthorityUrl}
; Administered Through: ${workspace.counselUrl} (Richard Alan Witt LLC)
; Billing Office: Owens Company (www.owenscompany.com) | Bill in Receiving
;===========================================================================

[transport-tls]
type=transport
protocol=tls
bind=0.0.0.0:${workspace.sipPort}
cert_file=/etc/drfun1/tls/voip.drfun1.com.crt
priv_key_file=/etc/drfun1/tls/voip.drfun1.com.key
method=tlsv1_3

[shoutcast-global-855k]
type=endpoint
transport=transport-tls
context=shoutcast-855k-bridge
disallow=all
allow=${asteriskCodec}
media_encryption=sdes
rtp_symmetric=yes
force_rport=yes
rewrite_contact=yes

; Dynamic SIP Dialplan covering Stations #000001 through #855000
; File: /etc/asterisk/extensions.conf
[shoutcast-855k-bridge]
exten => _855XXXXXX,1,NoOp(Connecting VoIP Call-In to SHOUTcast Station #\${EXTEN:3})
 same => n,Set(CHANNEL(audioreadformat)=${asteriskCodec})
 same => n,Set(SHOUTCAST_CLUSTER=\${IF(\$[\${EXTEN:3} <= 215000]?west-voip.drfun1.com:dc-voip.drfun1.com)})
 same => n,AGI(verify_scotus_wittlaw_dj.py,\${CALLERID(num)},\${EXTEN:3})
 same => n,MixMonitor(/var/spool/shoutcast-voip/\${EXTEN:3}-\${UNIQUEID}.opus,b)
 same => n,Dial(PJSIP/sc\${EXTEN:3}@\${SHOUTCAST_CLUSTER},30,r)
 same => n,Hangup()

; Regional Cluster Trunk Endpoints (${workspace.clusters.length} Clusters = ${workspace.provisionedStations.toLocaleString()} Stations)
${workspace.clusters
  .map(
    (c) => `[${c.id}]
; ${c.name} | Range: #${c.stationRangeStart.toLocaleString()}-#${c.stationRangeEnd.toLocaleString()} (${c.stationCount.toLocaleString()} stations)
; Hub: ${c.regionHub} | DID: ${c.didBlock}
type=aor
contact=sip:${c.sipDomain}:${workspace.sipPort}`
  )
  .join('\n\n')}
`;
}

export function generateScotusHiringCharter(workspace: ShoutcastVoipWorkspace): string {
  const approvedCount = workspace.hiringRoster.filter((d) => d.status === 'APPROVED_ACTIVE').length;
  const pendingCount = workspace.hiringRoster.filter((d) => d.status === 'PENDING_SCOTUS_REVIEW').length;

  return `SUPREME COURT BROADCAST & DJ HIRING AUTHORIZATION CHARTER
===========================================================================
Governing Hiring Authority: Supreme Court of the United States (${workspace.governingAuthorityUrl})
Legal Administration & Filings: The Law Office of Richard A. Witt LLC (${workspace.counselUrl})
Licensee & FCC Authority: Richard Alan Witt (FCC FRN: 0034981290)
Payment & Billing Office: Owens Company (www.owenscompany.com) · Bill in Receiving
Network Scope: All ${workspace.totalShoutcastStations.toLocaleString()} SHOUTcast VoIP-Enabled Broadcast Stations

SECTION 1 — EXCLUSIVE HIRING GOVERNANCE
All Station DJs, Broadcast Hosts, Live Call Screeners, and Program Directors
operating on any of the ${workspace.totalShoutcastStations.toLocaleString()} SHOUTcast VoIP broadcast trunks must be
submitted through ${workspace.counselUrl} and approved under docket authority
of ${workspace.governingAuthorityUrl} prior to receiving active SIP/SRTP credentials.

SECTION 2 — ACTIVE DOCKET ROSTER SUMMARY
Approved & Commissioned DJs/Hosts: ${approvedCount}
Pending Supreme Court Docket Review: ${pendingCount}

${workspace.hiringRoster
  .map(
    (r) =>
      `[${r.docketNumber}] ${r.name} (${r.ircNick}) — ${r.role}
  Status: ${r.status}
  Authority: ${r.approvingAuthority} (${r.governingUrl}) via ${r.counselUrl}
  Stations: ${r.assignedStations}
  VoIP SIP URI: ${r.sipUri} (Ext ${r.voipExtension})`
  )
  .join('\n\n')}
`;
}
