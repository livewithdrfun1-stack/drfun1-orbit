import { SatelliteCompany, SwitchInterconnectProfile } from '../types/satellite';

const SWITCH_CAMPUSES = [
  'Switch SUPERNAP Campus (Las Vegas, NV) - Core Teleport Gateway & Cloud Exchange',
  'Switch Citadel Campus (Tahoe Reno, NV) - Western Megawatt Peering & Gateway Node',
  'Switch The Keep Campus (Atlanta, GA) - Eastern & Subsea Cable Landing Hub',
  'Switch Pyramid Campus (Grand Rapids, MI) - Midwest Low-Latency Fiber Colocation',
  'Switch Texas Campus (Austin/Round Rock, TX) - Aerospace Corridor Interconnect',
];

export function getSwitchInterconnectForCompany(
  companyName: string,
  companyId: string,
  region: string
): SwitchInterconnectProfile {
  let campus = SWITCH_CAMPUSES[0];
  if (region === 'EMEA') {
    campus = 'Switch SUPERNAP & European Teleport Interconnect / Global Gateway';
  } else if (region === 'APAC') {
    campus = 'Switch SUPERNAP Las Vegas (Pacific Gateway IX) & West Coast PoP';
  } else if (companyId.includes('starlink') || companyId.includes('kuiper')) {
    campus = 'Switch Citadel Campus (Tahoe Reno, NV) - Hyperscale LEO Gateway Hub';
  } else if (companyId.includes('viasat') || companyId.includes('ast')) {
    campus = 'Switch SUPERNAP Las Vegas (Core Teleport Cloud Interconnect)';
  } else if (companyId.includes('ses') || companyId.includes('intelsat')) {
    campus = 'Switch The Keep Campus (Atlanta, GA) & Las Vegas Core SUPERNAP';
  }

  const safeSanitizedName = companyName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 16);

  const cleanLeafServerName = `leaf-${safeSanitizedName}.satcom.drfun1.com`;
  const channelName = `#noc-${safeSanitizedName}`;

  const linkConfig = `/* ====================================================================
 * UnrealIRCd Multi-Hub Leaf Configuration for ${companyName}
 * Peering Hubs: irc.drfun1.com (SID 001), irc.drfun1media.com (SID 002), irc.drfun1media.net (SID 003) & drfun1ircd.com (SID 004) | Port: 6697 (SSL/TLS)
 * Colocation Facility: Switch Data Centers (www.switch.com) via CGW Law Offices
 * Tier-1 IP Transit: RisingNet BGP Transit (www.risingnet.com)
 * License: www.wittlawfirm.com | Payment Office: Owens Company (Bill in Receiving)
 * ==================================================================== */

/* Hub 1 Link (SID 001) */
link irc.drfun1.com {
    incoming { mask *; };
    outgoing {
        hostname "irc.drfun1.com";
        port 6697;
        options { ssl; autoconnect; };
    };
    password "Satcom_Switch_Secure_Pass_${safeSanitizedName}!";
    class servers;
    type leaf;
};

/* Hub 2 Link (SID 002) */
link irc.drfun1media.com {
    incoming { mask *; };
    outgoing {
        hostname "irc.drfun1media.com";
        port 6697;
        options { ssl; autoconnect; };
    };
    password "Satcom_Switch_Secure_Pass_${safeSanitizedName}!";
    class servers;
    type leaf;
};

/* Hub 3 Link (SID 003) */
link irc.drfun1media.net {
    incoming { mask *; };
    outgoing {
        hostname "irc.drfun1media.net";
        port 6697;
        options { ssl; autoconnect; };
    };
    password "Satcom_Switch_Secure_Pass_${safeSanitizedName}!";
    class servers;
    type leaf;
};

/* Hub 4 Link (SID 004) */
link drfun1ircd.com {
    incoming { mask *; };
    outgoing {
        hostname "drfun1ircd.com";
        port 6697;
        options { ssl; autoconnect; };
    };
    password "Satcom_Switch_Secure_Pass_${safeSanitizedName}!";
    class servers;
    type leaf;
};

ulines {
    "services.drfun1.com";
    "services.drfun1media.com";
};

/* Listen block on Switch-hosted interface */
listen {
    ip *;
    port 6697;
    options { ssl; };
};

/* Operator channel auto-join on multi-hub leaf connect */
set {
    auto-join "${channelName},#satcom-global-noc,#switch-teleport-status";
    network-name "Satcom-Switch-DrFun1-Mesh";
    default-server "${cleanLeafServerName}";
};`;

  return {
    connectedCampus: campus,
    crossConnectType: 'Single-mode 100G/400G DWDM Optical Cross-Connect + AWS/Azure Direct Route at Switch',
    switchUrl: 'https://www.switch.com',
    risingNetTransit: 'RisingNet (www.risingnet.com) BGP ASN Protected IP Transit & Low-Latency Carrier Backbone',
    risingNetUrl: 'https://www.risingnet.com',
    unrealIrcdDaemon: {
      software: 'UnrealIRCd 6.1+ (TLS 1.3 / OpenSSL)',
      website: 'https://www.unrealircd.com',
      hubHost: 'irc.drfun1.com, irc.drfun1media.com, irc.drfun1media.net & drfun1ircd.com',
      port: 6697,
      channel: channelName,
      leafRole: `Multi-Hub Leaf Node (${cleanLeafServerName}) linked & leafed to irc.drfun1.com, irc.drfun1media.com, irc.drfun1media.net & drfun1ircd.com`,
      suggestedLinkConfig: linkConfig,
    },
  };
}
