import { 
  StreamDestination, 
  StreamChatMessage, 
  StreamOverlay, 
  EcomTransmissionState, 
  RtmpTvHostConfig, 
  TvuCloudCdnConfig 
} from '../types/stream';

export const INITIAL_STREAM_DESTINATIONS: StreamDestination[] = [
  {
    id: 'dest_facebook',
    name: 'DrFun1 SpaceBook Live (Facebook)',
    platform: 'facebook',
    iconName: 'facebook',
    streamUrl: 'rtmps://live-api-s.facebook.com:443/rtmp/',
    streamKey: 'FB-984214-drfun1-live-feed',
    enabled: true,
    status: 'live',
    viewers: 1420,
    health: 'optimal',
    bitrateKbps: 6000,
    serverLocation: 'US-East (Virginia)',
  },
  {
    id: 'dest_youtube',
    name: 'YouTube Live (DrFun1 Orbit Space TV)',
    platform: 'youtube',
    iconName: 'youtube',
    streamUrl: 'rtmp://a.rtmp.youtube.com/live2',
    streamKey: 'yt-7182-orbit-feed-drfun1',
    enabled: true,
    status: 'live',
    viewers: 3890,
    health: 'optimal',
    bitrateKbps: 6000,
    serverLocation: 'Google Global CDN (Anycast)',
  },
  {
    id: 'dest_twitch',
    name: 'Twitch (DrFun1 Satcom Lab)',
    platform: 'twitch',
    iconName: 'twitch',
    streamUrl: 'rtmp://live.twitch.tv/app/',
    streamKey: 'live_891230198_drfun1_twitch_key',
    enabled: true,
    status: 'live',
    viewers: 865,
    health: 'optimal',
    bitrateKbps: 6000,
    serverLocation: 'US-West (Oregon Edge)',
  },
  {
    id: 'dest_x',
    name: 'X Broadcast (@DrFun1Orbit)',
    platform: 'x',
    iconName: 'twitter',
    streamUrl: 'rtmp://va.pscp.tv:80/x/',
    streamKey: 'x-live-stream-satcom-feed',
    enabled: true,
    status: 'live',
    viewers: 2150,
    health: 'good',
    bitrateKbps: 4500,
    serverLocation: 'X Media Edge (Dallas)',
  },
  {
    id: 'dest_switch',
    name: 'Switch SUPERNAP Teleport CDN',
    platform: 'switch',
    iconName: 'server',
    streamUrl: 'rtmp://stream.switch.com/teleport-feed',
    streamKey: 'switch-lv9-supernap-100g-rtmp',
    enabled: true,
    status: 'live',
    viewers: 420,
    health: 'optimal',
    bitrateKbps: 12000,
    serverLocation: 'Switch LAS VEGAS / TAHOE RENO Core',
  },
  {
    id: 'dest_risingnet',
    name: 'RisingNet IP Transit Backbone',
    platform: 'risingnet',
    iconName: 'network',
    streamUrl: 'rtmp://edge.risingnet.com/uplink',
    streamKey: 'risingnet-core-transit-key-01',
    enabled: true,
    status: 'live',
    viewers: 310,
    health: 'optimal',
    bitrateKbps: 8000,
    serverLocation: 'RisingNet Tier-1 Optical Ring',
  },
  {
    id: 'dest_irc',
    name: 'UnrealIRCd Chat Leaf Relay',
    platform: 'unreal_irc',
    iconName: 'terminal',
    streamUrl: 'ircs://irc.drfun1.com:6697/#stream',
    streamKey: 'leaf-auth-token-witt-orbit',
    enabled: true,
    status: 'live',
    viewers: 178,
    health: 'optimal',
    bitrateKbps: 256,
    serverLocation: 'irc.drfun1.com (UnrealIRCd Leaf)',
  },
  {
    id: 'dest_tvu_cloud',
    name: 'TVU Networks Cloud CDN & Grid Router (www.tvunetworks.com)',
    platform: 'tvu_cloud',
    iconName: 'tv',
    streamUrl: 'rtmp://ingest.tvunetworks.drfun1.com/tvu-grid/issp',
    streamKey: 'tvu-token-witt-producer-live-9921',
    enabled: true,
    status: 'live',
    viewers: 2840,
    health: 'optimal',
    bitrateKbps: 18000,
    serverLocation: 'TVU Networks Silicon Valley Cloud Ingest Hub (ISSP Multiplex)',
  },
  {
    id: 'dest_rtmp_tv',
    name: 'DrFun1 Media TV Host (DRFN-TV Ch 1.1 UHD Master Playout)',
    platform: 'rtmp_tv',
    iconName: 'tv',
    streamUrl: 'rtmp://live.drfun1.com/tv/drfn_uhd_ch1',
    streamKey: 'live_tv_host_richard_alan_witt_master',
    enabled: true,
    status: 'live',
    viewers: 5120,
    health: 'optimal',
    bitrateKbps: 22000,
    serverLocation: 'Switch SUPERNAP Las Vegas Broadcast Facility & Master Control',
  },
  {
    id: 'dest_custom',
    name: 'Starlink / Eutelsat Uplink Feed (Custom RTMP)',
    platform: 'custom_rtmp',
    iconName: 'satellite',
    streamUrl: 'rtmp://teleport.drfun1.com:1935/live',
    streamKey: 'drfun1-orbit-private-key-77',
    enabled: false,
    status: 'offline',
    viewers: 0,
    health: 'offline',
    bitrateKbps: 0,
    serverLocation: 'Dedicated Teleport Earth Station',
  },
];

export const INITIAL_STREAM_MESSAGES: StreamChatMessage[] = [
  {
    id: 'msg_1',
    sender: 'Richard Alan Witt, Esq.',
    avatar: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=120&q=80',
    platform: 'facebook',
    message: 'Welcome everyone to the DrFun1 Orbit broadcast. Licensed under The Law Office of Richard A. Witt LLC & Owens Company.',
    timestamp: '12:02 PM',
    isModerator: true,
    badge: 'Legal Admin',
  },
  {
    id: 'msg_2',
    sender: 'Switch_NOC_LasVegas',
    avatar: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=120&q=80',
    platform: 'switch_noc',
    message: 'Switch SUPERNAP teleport optical cross-connect is locked at 100 Gbps. Latency to Starlink ground gateway: 4.8ms.',
    timestamp: '12:03 PM',
    isVip: true,
    badge: 'Switch Engineer',
  },
  {
    id: 'msg_3',
    sender: 'SatcomGuru',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    platform: 'youtube',
    message: 'Crisp 4K feed! Are you routing this multi-stream over RisingNet backbone or direct Ku-band uplink?',
    timestamp: '12:04 PM',
  },
  {
    id: 'msg_4',
    sender: 'IRC_Bot_drfun1',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80',
    platform: 'unreal_irc',
    message: '[irc.drfun1.com #stream] 74 leaf nodes synchronized via UnrealIRCd cluster.',
    timestamp: '12:04 PM',
    badge: 'IRC Leaf',
  },
  {
    id: 'msg_5',
    sender: 'OrbitWatcher_99',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    platform: 'twitch',
    message: 'Checking in from Munich Teleport. Signal to noise ratio is 14.2 dB on the Ka-band transponder.',
    timestamp: '12:05 PM',
  },
  {
    id: 'msg_6',
    sender: 'AeroRF_Tech',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    platform: 'x',
    message: 'The new DrFun1 Phased Array Terminal in the store looks like a game changer for mobile aviation SATCOM.',
    timestamp: '12:06 PM',
  },
];

export const INITIAL_STREAM_OVERLAYS: StreamOverlay[] = [
  {
    id: 'ov_license',
    name: 'Richard Alan Witt License Banner',
    type: 'lower_third',
    enabled: true,
    content: 'Licensed to Richard Alan Witt | www.wittlawfirm.com | www.owenscompany.com',
    position: 'bottom-banner',
  },
  {
    id: 'ov_teleport',
    name: 'Switch SUPERNAP Teleport Badge',
    type: 'teleport_bug',
    enabled: true,
    content: 'Switch SUPERNAP 100G Teleport Uplink | www.switch.com',
    position: 'top-right',
  },
  {
    id: 'ov_irc',
    name: 'IRC & RisingNet Leaf Ticker',
    type: 'ticker',
    enabled: true,
    content: 'IRC Leaf: irc.drfun1.com:6697 | UnrealIRCd Mesh | RisingNet Optical Ring www.risingnet.com',
    position: 'bottom-left',
  },
];

export const INITIAL_ECOM_TRANSMISSION: EcomTransmissionState = {
  featuredProductId: 'drfun1-orbitlink-ut1',
  isOverlayVisible: true,
  discountPercent: 15,
  discountCode: 'WITTLAW-VIP-15',
  flashSaleActive: true,
  broadcastGmv: 84250,
  itemsSold: 38,
  liveBuyersCount: 19,
  autoPushToChat: true,
};

export const INITIAL_RTMP_TV_HOST: RtmpTvHostConfig = {
  channelId: 'drfn-tv-uhd',
  channelName: 'DrFun1 Media TV UHD Network (Ch 1.1)',
  callSign: 'DRFN-TV 1.1 UHD',
  frequencyBand: 'Ku / Ka / Optical Hybrid',
  playoutMode: 'switch_teleport',
  resolution: '4K UHD (2160p60)',
  videoBitrateMbps: 24,
  audioCodec: 'AAC-LC 320kbps',
  broadcastDelaySeconds: 7,
  primaryRtmpIngest: 'rtmp://live.drfun1.com/tv/drfn_uhd_ch1',
  backupRtmpsIngest: 'rtmps://ingest.switch.drfun1.com:443/tv/drfn_backup',
  streamKey: 'live_tv_host_richard_alan_witt_master_key_4k',
  audioLimiterEnabled: true,
  programVolume: 88,
  emergencyAlertActive: false,
};

export const INITIAL_TVU_CLOUD_CDN: TvuCloudCdnConfig = {
  providerName: 'TVU Networks Cloud Router & TVU Grid (www.tvunetworks.com)',
  portalUrl: 'https://www.tvunetworks.com',
  producerApiVersion: 'v3.8.4-issp',
  gridReceiverToken: 'tvu_grid_tok_witt_switch_supernap_8832',
  isspBondingEnabled: true,
  cloudRouterIp: '198.51.100.42 (TVU Anycast Global Ingest)',
  activeCodeLanguage: 'nodejs',
  bondedInterfaces: [
    {
      id: 'bond_switch',
      name: 'Switch SUPERNAP 100G Fiber Uplink',
      type: 'fiber',
      carrier: 'Switch Core Teleport (www.switch.com)',
      bitrateMbps: 950,
      packetLossPercent: 0.0,
      latencyMs: 2.8,
      priority: 1,
      status: 'active',
    },
    {
      id: 'bond_risingnet',
      name: 'RisingNet 1.46 Tbps IP Transit',
      type: 'fiber',
      carrier: 'RisingNet Backbone (www.risingnet.com)',
      bitrateMbps: 920,
      packetLossPercent: 0.0,
      latencyMs: 3.1,
      priority: 1,
      status: 'active',
    },
    {
      id: 'bond_starlink',
      name: 'Starlink LEO Ku-Band Terminal Feed',
      type: 'satellite_leo',
      carrier: 'SpaceX Starlink Direct-to-Cell LEO',
      bitrateMbps: 210,
      packetLossPercent: 0.08,
      latencyMs: 29.4,
      priority: 2,
      status: 'active',
    },
    {
      id: 'bond_oneweb',
      name: 'Eutelsat OneWeb LEO CIR Trunk',
      type: 'satellite_leo',
      carrier: 'Eutelsat OneWeb Enterprise',
      bitrateMbps: 145,
      packetLossPercent: 0.04,
      latencyMs: 33.7,
      priority: 2,
      status: 'active',
    },
    {
      id: 'bond_inmarsat',
      name: 'Inmarsat Global Xpress Ka-Band',
      type: 'satellite_geo',
      carrier: 'Inmarsat / Viasat Maritime & Aero',
      bitrateMbps: 68,
      packetLossPercent: 0.12,
      latencyMs: 118.0,
      priority: 3,
      status: 'backup',
    },
  ],
  edgeNodes: [
    {
      id: 'edge_switch_lv',
      name: 'Switch SUPERNAP Las Vegas (Origin Teleport)',
      location: 'Las Vegas, NV, USA',
      datacenter: 'Switch CORE Campus (Tier 4 / Class 4 Gold)',
      egressGbps: 100.0,
      loadPercent: 38,
      latencyMs: 2.1,
      health: 'optimal',
    },
    {
      id: 'edge_tvu_sv',
      name: 'TVU Networks Silicon Valley Cloud Hub',
      location: 'Mountain View, CA, USA',
      datacenter: 'TVU Cloud Ingestion Core (www.tvunetworks.com)',
      egressGbps: 80.0,
      loadPercent: 52,
      latencyMs: 8.4,
      health: 'optimal',
    },
    {
      id: 'edge_risingnet_lon',
      name: 'RisingNet London Telehouse North',
      location: 'London, United Kingdom',
      datacenter: 'Telehouse Docklands / LINX Peer',
      egressGbps: 40.0,
      loadPercent: 29,
      latencyMs: 68.2,
      health: 'optimal',
    },
    {
      id: 'edge_tvu_tyo',
      name: 'TVU Asia-Pacific Tokyo Hub',
      location: 'Tokyo, Japan',
      datacenter: 'Equinix TY2 / JPIX Exchange',
      egressGbps: 50.0,
      loadPercent: 34,
      latencyMs: 104.5,
      health: 'optimal',
    },
    {
      id: 'edge_frankfurt_fra',
      name: 'Frankfurt DE-CIX Teleport Node',
      location: 'Frankfurt, Germany',
      datacenter: 'Interxion FRA1 / DE-CIX Teleport',
      egressGbps: 45.0,
      loadPercent: 41,
      latencyMs: 72.8,
      health: 'optimal',
    },
  ],
};

export const TVU_CODE_SNIPPETS = {
  nodejs: {
    title: 'Node.js / TypeScript: TVU Cloud Producer & Grid SDK Integration',
    filename: 'drfun1-tvu-producer-client.ts',
    description: 'Integrates TVU Networks Cloud Router API v3 with ISSP (Inverse StatMux Plus) multi-link bonding and UnrealIRCd telemetry notifier.',
    code: `import axios from 'axios';
import { Socket } from 'net';

/**
 * DrFun1 Media TVU Networks Cloud CDN Ingest Client
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * Uplink infrastructure: Switch SUPERNAP (www.switch.com) & RisingNet (www.risingnet.com)
 * Cloud CDN & Grid: TVU Networks (www.tvunetworks.com)
 */

interface TvuProducerSessionConfig {
  apiKey: string;
  channelId: string;
  sourceStreamUrl: string;
  enableIsspBonding: boolean;
  gridDistributionEnabled: boolean;
  targetResolution: '4k_uhd_60' | '1080p_60';
  unrealIrcdNotifyHost?: string;
}

export class DrFun1TvuCloudBridge {
  private readonly baseUrl = 'https://api.tvunetworks.com/v3/producer';
  private readonly token = process.env.TVU_API_KEY || 'tvu-token-witt-producer-live-9921';

  constructor(private config: TvuProducerSessionConfig) {}

  /**
   * Initializes TVU Cloud Session with ISSP bonded links & Switch teleport origin
   */
  async initializeTvuStreamSession(): Promise<{ sessionId: string; gridToken: string; rtmpIngest: string }> {
    console.log('[TVU Networks] Booting TVU Producer session for DRFN-TV UHD...');

    const response = await axios.post(\`\${this.baseUrl}/sessions/create\`, {
      channel_name: 'DrFun1 Media TV UHD Network',
      call_sign: 'DRFN-TV 1.1 UHD',
      license_holder: 'Richard Alan Witt (The Law Office of Richard A. Witt LLC)',
      issp_bonding: {
        mode: 'dynamic_multiplex',
        interfaces: [
          { name: 'Switch SUPERNAP 100G Fiber', weight: 10, mtu: 9000 },
          { name: 'RisingNet 1.46 Tbps Transit', weight: 10, mtu: 1500 },
          { name: 'Starlink LEO Phased Array', weight: 5, mtu: 1420 },
          { name: 'Eutelsat OneWeb CIR Pipe', weight: 4, mtu: 1420 }
        ],
        jitter_buffer_ms: 120,
        fec_overhead_percent: 8
      },
      grid_replication: {
        enabled: true,
        edge_nodes: [
          'edge_switch_lv',
          'edge_tvu_sv',
          'edge_risingnet_lon',
          'edge_tvu_tyo'
        ]
      },
      ecom_transmission_hooks: {
        active_offer_feed: 'https://orbit.drfun1.com/api/ecom/current-showcase',
        checkout_sync_enabled: true
      }
    }, {
      headers: {
        'Authorization': \`Bearer \${this.token}\`,
        'X-Teleport-Provider': 'Switch SUPERNAP Las Vegas',
        'Content-Type': 'application/json'
      }
    });

    const sessionData = response.data;
    console.log(\`[TVU Networks] Session online: \${sessionData.session_id}\`);
    
    // Broadcast status message to UnrealIRCd leaf mesh (irc.drfun1.com)
    await this.notifyIrcLeafMesh(sessionData.session_id, sessionData.rtmp_endpoint);

    return {
      sessionId: sessionData.session_id,
      gridToken: sessionData.grid_token,
      rtmpIngest: sessionData.rtmp_endpoint
    };
  }

  /**
   * Pushes real-time stream status to UnrealIRCd #stream leaf channel
   */
  private async notifyIrcLeafMesh(sessionId: string, rtmpEndpoint: string): Promise<void> {
    const client = new Socket();
    client.connect(6667, 'irc.drfun1.com', () => {
      client.write('NICK TVU_Broadcaster\\r\\n');
      client.write('USER tvu 0 * :TVU Networks Cloud CDN Ingest\\r\\n');
      setTimeout(() => {
        client.write('JOIN #stream\\r\\n');
        client.write(\`PRIVMSG #stream :[TVU Networks CDN Online] Session \${sessionId} live via Switch 100G & TVU Grid. Endpoint: \${rtmpEndpoint}\\r\\n\`);
        client.end();
      }, 1000);
    });
  }
}
`,
  },
  curl: {
    title: 'cURL / REST API: TVU Networks Cloud Router & Ingest Control',
    filename: 'tvu-cloud-router-curl.sh',
    description: 'Direct REST commands for provisioning TVU Cloud Grid distribution and testing ISSP bonded packet health.',
    code: `#!/usr/bin/env bash
# TVU Networks Cloud Router REST API Provisioning
# Licensee: Richard Alan Witt (www.wittlawfirm.com)
# Primary Uplink: Switch SUPERNAP (www.switch.com) | Transit: RisingNet (www.risingnet.com)

TVU_API_KEY="tvu-token-witt-producer-live-9921"
TVU_ENDPOINT="https://api.tvunetworks.com/v3"

echo "=== 1. Check TVU Networks Cloud Router Health ==="
curl -s -X GET "\${TVU_ENDPOINT}/router/health" \\
  -H "Authorization: Bearer \${TVU_API_KEY}" \\
  -H "X-Origin: Switch-SUPERNAP-Teleport-Las-Vegas" | jq .

echo "=== 2. Allocate TVU Grid Point-to-Multipoint Ingestion Point ==="
curl -s -X POST "\${TVU_ENDPOINT}/grid/receivers/provision" \\
  -H "Authorization: Bearer \${TVU_API_KEY}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "channel_id": "drfn-tv-uhd",
    "ingest_protocol": "RTMP_ISSP",
    "primary_edge": "Switch SUPERNAP Las Vegas (www.switch.com)",
    "transit_provider": "RisingNet 1.46 Tbps Optical (www.risingnet.com)",
    "bitrate_target_kbps": 22000,
    "resolution": "3840x2160p60",
    "video_codec": "HEVC_H265",
    "audio_codec": "AAC_320K",
    "ecom_overlay_sync": true
  }' | jq .

echo "=== 3. Query Real-Time ISSP Packet Bonding Telemetry ==="
curl -s -X GET "\${TVU_ENDPOINT}/issp/metrics?channel=drfn-tv-uhd" \\
  -H "Authorization: Bearer \${TVU_API_KEY}" | jq .
`,
  },
  python: {
    title: 'Python 3.11: TVU Grid Ingest Listener & ECOM Sales Hook',
    filename: 'drfun1_tvu_ecom_bridge.py',
    description: 'Listens for TVU Networks webhook triggers, monitors bonded packet loss across satellite/fiber, and synchronizes DrFun1 store sales.',
    code: `"""
DrFun1 Media ECOM & TVU Networks Cloud Router Webhook Daemon
Licensed to Richard Alan Witt (The Law Office of Richard A. Witt LLC)
Infrastructure: Switch SUPERNAP (www.switch.com), RisingNet (www.risingnet.com)
Cloud Ecosystem: TVU Networks (www.tvunetworks.com)
"""

import asyncio
import hmac
import hashlib
import json
from aiohttp import web

TVU_WEBHOOK_SECRET = "tvu_secret_witt_drfun1_orbit_2026"

async def handle_tvu_stream_status(request: web.Request) -> web.Response:
    payload = await request.read()
    signature = request.headers.get("X-TVU-Signature", "")
    
    # Verify cryptographic signature from TVU Networks
    expected_sig = hmac.new(
        TVU_WEBHOOK_SECRET.encode(), payload, hashlib.sha256
    ).hexdigest()
    
    if not hmac.compare_digest(signature, expected_sig):
        return web.Response(status=401, text="Unauthorized TVU signature")
        
    data = json.loads(payload.decode())
    event_type = data.get("event")
    
    if event_type == "issp.bonded_links.updated":
        total_bitrate = data.get("metrics", {}).get("total_bandwidth_mbps", 0)
        packet_loss = data.get("metrics", {}).get("packet_loss_pct", 0)
        print(f"[TVU ISSP Telemetry] Bandwidth: {total_bitrate} Mbps | Loss: {packet_loss}%")
        
    elif event_type == "ecom.in_stream_order.created":
        product_id = data.get("order", {}).get("product_id")
        amount = data.get("order", {}).get("total_usd")
        buyer = data.get("order", {}).get("buyer_callsign", "Anonymous")
        print(f"[DrFun1 ECOM Broadcast Order] Product {product_id} ordered for \\\${amount} by {buyer}")
        
    return web.json_response({"status": "received", "carrier": "Switch SUPERNAP / RisingNet"})

app = web.Application()
app.router.add_post("/api/tvu/webhook", handle_tvu_stream_status)

if __name__ == "__main__":
    web.run_app(app, host="0.0.0.0", port=8088)
`,
  },
  ffmpeg: {
    title: 'FFmpeg: Broadcast Pipeline to DrFun1 RTMP TV & TVU Cloud CDN',
    filename: 'push-tvu-rtmp-broadcast.sh',
    description: 'Hardware-accelerated broadcast command pushing 4K UHD 60fps to DrFun1 RTMP TV host and TVU Networks ISSP Cloud Ingest.',
    code: `#!/usr/bin/env bash
# Dual Program Broadcast to DrFun1 RTMP TV & TVU Networks Cloud Router
# Playout Host: Richard Alan Witt (www.wittlawfirm.com)
# Facility: Switch SUPERNAP Las Vegas (www.switch.com) 100G Fiber

RTMP_TV_DEST="rtmp://live.drfun1.com/tv/drfn_uhd_ch1"
TVU_ISSP_DEST="rtmp://ingest.tvunetworks.drfun1.com/tvu-grid/issp"
STREAM_KEY="live_tv_host_richard_alan_witt_master_key_4k"

ffmpeg -f lavfi -i "color=c=black:s=3840x2160:r=60" \\
  -f lavfi -i "sine=frequency=1000:sample_rate=48000:beep_factor=4" \\
  -c:v h264_nvenc -preset p7 -tune hq -profile:v high \\
  -b:v 20000k -maxrate 24000k -bufsize 48000k \\
  -g 120 -keyint_min 120 -sc_threshold 0 \\
  -pix_fmt yuv420p \\
  -c:a aac -b:a 320k -ar 48000 -ac 2 \\
  -f tee \\
  -map 0:v -map 1:a \\
  "[f=flv]\${RTMP_TV_DEST} | [f=flv]\${TVU_ISSP_DEST}/\${STREAM_KEY}"
`,
  },
  json: {
    title: 'TVU Grid Topology: Global Edge Relay Manifest',
    filename: 'drfun1-tvu-grid-topology.json',
    description: 'Configuration manifest for TVU Grid receiver topology across Switch SUPERNAP teleports and RisingNet global PoPs.',
    code: `{
  "$schema": "https://tvunetworks.com/schemas/grid-topology-v3.json",
  "network_id": "drfun1-orbit-global-grid",
  "licensee": "Richard Alan Witt (The Law Office of Richard A. Witt LLC)",
  "firm_url": "https://www.wittlawfirm.com",
  "affiliate_url": "https://www.owenscompany.com",
  "datacenter_host": "Switch SUPERNAP Las Vegas (https://www.switch.com)",
  "optical_transit": "RisingNet 1.46 Tbps (https://www.risingnet.com)",
  "cloud_cdn_provider": "TVU Networks (https://www.tvunetworks.com)",
  "origin_server": {
    "node_id": "switch_las_vegas_origin",
    "datacenter": "Switch SUPERNAP LV9",
    "capacity_gbps": 100.0,
    "ip_address": "198.51.100.12",
    "redundancy": "N+2 Active-Active"
  },
  "grid_relays": [
    {
      "node_id": "tvu_mountain_view_cloud",
      "region": "US-West (Silicon Valley)",
      "latency_to_origin_ms": 8.4,
      "protocol": "TVU_ISSP_V3"
    },
    {
      "node_id": "risingnet_london_docklands",
      "region": "EU-West (London)",
      "latency_to_origin_ms": 68.2,
      "protocol": "TVU_ISSP_V3"
    },
    {
      "node_id": "tvu_tokyo_ty2",
      "region": "APAC (Tokyo)",
      "latency_to_origin_ms": 104.5,
      "protocol": "TVU_ISSP_V3"
    }
  ],
  "ecom_overlay_policy": {
    "enabled": true,
    "store_endpoint": "https://orbit.drfun1.com/store",
    "cart_sync_channel": "irc.drfun1.com:6697/#stream"
  }
}
`,
  },
};

