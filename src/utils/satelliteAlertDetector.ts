/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 *
 * Live RSS Satellite Alert Detection Engine for DrFun1 News.
 * Scans incoming satcom RSS articles (SpaceNews, NASA SCaN, Via Satellite, SatNews, ESA, FCC, ITU)
 * for critical orbital events — satellite malfunctions/anomalies, new constellation launches,
 * geomagnetic/solar RF advisories, and orbital optical relay milestones.
 */

import { getNextDynamicHeadline, INITIAL_RSS_ARTICLES } from '../data/rssNewsData';
import {
  SatelliteAlertEventType,
  SatelliteAlertSeverity,
  SatelliteOrbitalAlert,
} from '../types/drfun1News';
import { RssArticleItem } from '../types/rssNews';

interface DetectionRule {
  eventType: SatelliteAlertEventType;
  severity: SatelliteAlertSeverity;
  badgeLabel: string;
  keywords: string[];
}

const ORBITAL_DETECTION_RULES: DetectionRule[] = [
  {
    eventType: 'malfunction',
    severity: 'CRITICAL',
    badgeLabel: 'SAT MALFUNCTION',
    keywords: [
      'malfunction',
      'anomaly',
      'safe mode',
      'thruster',
      'transponder fault',
      'attitude control',
      'solar array fault',
      'debris conjunction',
      'conjunction alert',
      'loss of signal',
      'carrier outage',
      'unplanned de-orbit',
      'payload outage',
    ],
  },
  {
    eventType: 'solar_weather',
    severity: 'ADVISORY',
    badgeLabel: 'SOLAR / RF ALERT',
    keywords: [
      'geomagnetic storm',
      'solar flare',
      'coronal mass ejection',
      'cme',
      'ionospheric scintillation',
      'sun outage',
      'rf interference',
    ],
  },
  {
    eventType: 'launch',
    severity: 'HIGH',
    badgeLabel: 'NEW LAUNCH',
    keywords: [
      'launches',
      'launch manifest',
      'falcon 9',
      'atlas v',
      'new glenn',
      'ariane',
      'polar plane deployment',
      'constellation',
      'direct-to-cell',
      'project kuiper',
      'bluebird',
      'orbit insertion',
      'liftoff',
    ],
  },
  {
    eventType: 'telemetry_milestone',
    severity: 'ADVISORY',
    badgeLabel: 'ORBITAL LINK',
    keywords: [
      'optical laser relay',
      'lcrd',
      'illuma-t',
      'inter-satellite',
      'quantum key distribution',
      'orbital cellular',
    ],
  },
];

// Realistic critical orbital RSS advisories interleaved into the live satcom RSS wire
// so both malfunction/conjunction emergencies and constellation launches trigger live alerts.
const CRITICAL_ORBITAL_RSS_BULLETINS: Array<{
  idPrefix: string;
  sourceId: RssArticleItem['sourceId'];
  sourceName: string;
  title: string;
  description: string;
  link: string;
  category: string;
  tags: string[];
}> = [
  {
    idPrefix: 'rss-anom-geo-ku',
    sourceId: 'satnews',
    sourceName: 'SatNews Publishers',
    title: 'GEO Ku-Band Transponder Fault Triggers Safe Mode & Carrier Reroute at 101°W Orbital Slot',
    description:
      'Operators initiated automatic traffic migration across backup Ku-band transponders following an attitude control anomaly and payload power bus malfunction on a North American broadcast relay satellite.',
    link: 'https://news.satnews.com/',
    category: 'Orbital Anomalies',
    tags: ['GEO', 'Transponder Fault', 'Safe Mode', 'Ku-Band'],
  },
  {
    idPrefix: 'rss-launch-vandenberg',
    sourceId: 'spacenews',
    sourceName: 'SpaceNews Satcom',
    title: 'SpaceX Falcon 9 Liftoff Deploys 24 Next-Gen Direct-to-Cell LEO Constellation Satellites',
    description:
      'A new orbital shell of 24 direct-to-cellular LEO spacecraft achieved nominal orbit insertion from Vandenberg, expanding emergency and broadcast relay coverage.',
    link: 'https://spacenews.com/',
    category: 'Constellation Launches',
    tags: ['Falcon 9', 'LEO', 'Constellation Launch', 'Direct-to-Cell'],
  },
  {
    idPrefix: 'rss-conjunction-leo',
    sourceId: 'nasa',
    sourceName: 'NASA SCaN Telemetry',
    title: 'High-Priority LEO Debris Conjunction Alert Prompts Automated Thruster Avoidance Maneuver',
    description:
      'NASA Conjunction Assessment Risk Analysis (CARA) issued a red-threshold debris conjunction alert at 540 km altitude; affected commercial satcom buses executed automated thruster burns.',
    link: 'https://www.nasa.gov/directorates/somd/space-communications-navigation-program/',
    category: 'Orbital Safety',
    tags: ['LEO', 'Debris Conjunction', 'Thruster', 'NASA SCaN'],
  },
  {
    idPrefix: 'rss-solar-g3',
    sourceId: 'esa',
    sourceName: 'ESA ARTES & IRIS²',
    title: 'G3 Geomagnetic Storm & X-Class Solar Flare Triggers Polar Ka/Ku-Band Ionospheric Scintillation',
    description:
      'Space weather centers report elevated ionospheric scintillation and high-latitude RF interference affecting polar LEO gateways; adaptive coding & modulation (ACM) margins engaged.',
    link: 'https://connectivity.esa.int/',
    category: 'Space Weather',
    tags: ['Geomagnetic Storm', 'Solar Flare', 'RF Interference', 'Multi-Orbit'],
  },
  {
    idPrefix: 'rss-kuiper-deploy',
    sourceId: 'viasatellite',
    sourceName: 'Via Satellite',
    title: 'New Glenn Heavy-Lift Launch Manifest Confirmed for Next Amazon Project Kuiper Orbital Plane',
    description:
      'Flight readiness verified for a 61-satellite Project Kuiper Ka-band batch targeting 610 km LEO plane integration with global Switch & AWS teleports.',
    link: 'https://www.satellitetoday.com/',
    category: 'Constellation Launches',
    tags: ['Project Kuiper', 'New Glenn', 'LEO', 'Ka-Band'],
  },
  {
    idPrefix: 'rss-meo-solar-array',
    sourceId: 'spacenews',
    sourceName: 'SpaceNews Satcom',
    title: 'MEO Broadband Spacecraft Reports Solar Array Fault & Partial Transponder Payload Outage',
    description:
      'Fleet telemetry engineers isolated a partial solar array deployment fault in medium Earth orbit (8,062 km), dynamically re-allocating high-throughput Ka-band beams to adjacent spacecraft.',
    link: 'https://spacenews.com/',
    category: 'Orbital Anomalies',
    tags: ['MEO', 'Solar Array Fault', 'Payload Outage', 'Beam Re-allocation'],
  },
];

function inferOrbitRegime(text: string): SatelliteOrbitalAlert['orbitRegime'] {
  const lower = text.toLowerCase();
  if (lower.includes('geo') || lower.includes('geostationary') || lower.includes('101°w')) {
    return 'GEO';
  }
  if (lower.includes('meo') || lower.includes('medium earth orbit') || lower.includes('8,062 km')) {
    return 'MEO';
  }
  if (
    lower.includes('leo') ||
    lower.includes('low earth orbit') ||
    lower.includes('starlink') ||
    lower.includes('kuiper') ||
    lower.includes('oneweb') ||
    lower.includes('bluebird') ||
    lower.includes('540 km')
  ) {
    return 'LEO';
  }
  return 'Multi-Orbit';
}

function isSafeExternalUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch {
    return false;
  }
}

/**
 * Classifies an RSS article and returns a structured SatelliteOrbitalAlert
 * when a critical orbital event (malfunction, launch, solar/RF storm, or orbital link) is detected.
 */
export function detectSatelliteOrbitalAlert(
  article: RssArticleItem,
  detectedAtDate: Date = new Date()
): SatelliteOrbitalAlert | null {
  const corpus = `${article.title} ${article.description} ${article.category} ${article.tags.join(' ')}`.toLowerCase();

  for (const rule of ORBITAL_DETECTION_RULES) {
    const matched = rule.keywords.filter((kw) => corpus.includes(kw));
    if (matched.length > 0) {
      return {
        id: `satalert-${article.id}`,
        articleId: article.id,
        eventType: rule.eventType,
        severity: rule.severity,
        badgeLabel: rule.badgeLabel,
        title: article.title,
        summary: article.description,
        sourceName: article.sourceName,
        sourceUrl: isSafeExternalUrl(article.link) ? article.link : 'https://spacenews.com/',
        orbitRegime: inferOrbitRegime(corpus),
        detectedAt: detectedAtDate.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        detectedAtMs: detectedAtDate.getTime(),
        matchedKeywords: matched.slice(0, 3),
        acknowledged: false,
        dismissedOverlay: false,
      };
    }
  }

  return null;
}

/**
 * Scans the initial live RSS feed snapshot and returns the top detected orbital alerts
 * (including both launch and anomaly advisories) for immediate situational awareness.
 */
export function buildInitialSatelliteAlerts(): SatelliteOrbitalAlert[] {
  const now = new Date();
  const initialMalfunctionSeed: RssArticleItem = {
    id: `${CRITICAL_ORBITAL_RSS_BULLETINS[0].idPrefix}-init`,
    sourceId: CRITICAL_ORBITAL_RSS_BULLETINS[0].sourceId,
    sourceName: CRITICAL_ORBITAL_RSS_BULLETINS[0].sourceName,
    title: CRITICAL_ORBITAL_RSS_BULLETINS[0].title,
    description: CRITICAL_ORBITAL_RSS_BULLETINS[0].description,
    link: CRITICAL_ORBITAL_RSS_BULLETINS[0].link,
    pubDate: 'Just now',
    timestamp: now.getTime(),
    category: CRITICAL_ORBITAL_RSS_BULLETINS[0].category,
    tags: CRITICAL_ORBITAL_RSS_BULLETINS[0].tags,
    isBreaking: true,
    isNew: true,
    author: 'SatNews NOC Wire',
  };

  const results: SatelliteOrbitalAlert[] = [];
  const malfunctionAlert = detectSatelliteOrbitalAlert(initialMalfunctionSeed, now);
  if (malfunctionAlert) {
    results.push(malfunctionAlert);
  }

  for (const article of INITIAL_RSS_ARTICLES.slice(0, 6)) {
    const detected = detectSatelliteOrbitalAlert(article, new Date(article.timestamp));
    if (detected && !results.some((a) => a.articleId === detected.articleId)) {
      results.push({
        ...detected,
        // Keep only the top 2 newest alerts as active overlay badges on initial load
        dismissedOverlay: results.length >= 2,
      });
    }
  }

  return results;
}

/**
 * Polls the next live RSS article from the satcom wire (blending live dynamic RSS headlines
 * with critical orbital anomaly / launch advisories) and runs the orbital event detector.
 */
export function pollNextRssForSatelliteAlert(pollCycle: number): {
  article: RssArticleItem;
  alert: SatelliteOrbitalAlert | null;
} {
  const now = new Date();
  let article: RssArticleItem;

  // Alternate between critical orbital advisories (malfunctions, conjunctions, solar flares, launches)
  // and live general satcom RSS headlines so every scan tests real classification.
  if (pollCycle % 2 === 1) {
    const idx = Math.floor(pollCycle / 2) % CRITICAL_ORBITAL_RSS_BULLETINS.length;
    const item = CRITICAL_ORBITAL_RSS_BULLETINS[idx];
    article = {
      id: `${item.idPrefix}-${now.getTime()}-${pollCycle}`,
      sourceId: item.sourceId,
      sourceName: item.sourceName,
      title: item.title,
      description: item.description,
      link: item.link,
      pubDate: 'Just now',
      timestamp: now.getTime(),
      category: item.category,
      tags: item.tags,
      isBreaking: true,
      isNew: true,
      author: `${item.sourceName} Live Wire`,
    };
  } else {
    article = getNextDynamicHeadline(pollCycle);
  }

  return {
    article,
    alert: detectSatelliteOrbitalAlert(article, now),
  };
}
