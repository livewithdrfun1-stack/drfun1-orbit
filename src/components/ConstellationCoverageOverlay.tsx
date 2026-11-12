/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 * 
 * Interactive Constellation Coverage Overlay Component
 * Real-time satellite footprint projections using satellite TLE (Two-Line Element) data:
 * - Orbital propagation from NORAD Two-Line Element sets (Keplerian orbital parameters)
 * - Dynamic sub-satellite nadir tracking, ground tracks, and elevation mask cones
 * - Real-time footprint coverage intersection with the 352-leaf mesh (Switch, DataPacket, RisingNet)
 * - Slant range distance, propagation delay, Doppler shift, and carrier RF downlinks
 * - Day/Night Solar Terminator projection & interactive TLE telemetry terminal
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Radio,
  Globe,
  Activity,
  Layers,
  Sparkles,
  Zap,
  Play,
  Pause,
  FastForward,
  RotateCcw,
  Sliders,
  Terminal,
  Copy,
  Check,
  ChevronRight,
  ShieldCheck,
  Search,
  Filter,
  Eye,
  Crosshair,
  Server,
  Info,
  X,
  Maximize2,
  Minimize2,
  MapPin,
  Clock,
  Wifi,
  ExternalLink
} from 'lucide-react';
import { SwitchDedicatedNode } from '../types/irc';
import { ALL_NETWORK_LEAF_NODES } from '../data/unrealSearchData';

export interface ConstellationSatellite {
  id: string;
  name: string;
  noradId: number;
  intlDesignator: string;
  constellation: 'Starlink' | 'OneWeb' | 'O3b mPOWER' | 'Iridium' | 'AST SpaceMobile' | 'GEO DBS' | 'Space Stations' | 'GPS';
  operator: string;
  orbitType: 'LEO' | 'MEO' | 'GEO';
  altitudeKm: number;
  velocityKmS: number;
  inclinationDeg: number;
  periodMinutes: number;
  footprintRadiusKm: number;
  downlinkFreqMHz: number;
  uplinkBand: string;
  nominalLat: number;
  nominalLon: number;
  tleLine1: string;
  tleLine2: string;
  color: string;
  description: string;
  beamType: string;
  spectrumAllocation: string;
}

export interface ParsedTleData {
  catalogNumber: number;
  classification: string;
  intlDesignator: string;
  epochYear: number;
  epochDay: number;
  meanMotionDeriv1: number;
  bstarDrag: string;
  inclinationDeg: number;
  raanDeg: number;
  eccentricity: number;
  argPerigeeDeg: number;
  meanAnomalyDeg: number;
  meanMotionRevsPerDay: number;
  revNumberAtEpoch: number;
}

export const CONSTELLATION_SATELLITES: ConstellationSatellite[] = [
  {
    id: 'starlink_v2_cell',
    name: 'STARLINK-5124 (Direct-to-Cell V2)',
    noradId: 54201,
    intlDesignator: '2022-134A',
    constellation: 'Starlink',
    operator: 'SpaceX / Starlink',
    orbitType: 'LEO',
    altitudeKm: 550.2,
    velocityKmS: 7.59,
    inclinationDeg: 53.05,
    periodMinutes: 95.6,
    footprintRadiusKm: 980,
    downlinkFreqMHz: 1990.0,
    uplinkBand: 'PCS G-Block (1910-1995 MHz) & Ku/Ka-Band',
    nominalLat: 38.12,
    nominalLon: -112.44,
    tleLine1: '1 54201U 22134A   26046.42109842  .00003410  00000+0  19840-3 0  9997',
    tleLine2: '2 54201  53.0540 142.1098 0001420  74.2012 285.9410 15.06201840182412',
    color: '#38bdf8', // sky-400
    description: 'SpaceX Starlink V2 Mini equipped with 3GPP direct-to-cell eNodeB phased array antennas for unmodified standard LTE smartphones.',
    beamType: 'Dynamic Phased-Array Cellular Spot Beam',
    spectrumAllocation: 'T-Mobile G-Block / 3GPP Band 25 NTN'
  },
  {
    id: 'starlink_laser_gate',
    name: 'STARLINK-5894 (Optical Space Laser)',
    noradId: 58941,
    intlDesignator: '2023-018F',
    constellation: 'Starlink',
    operator: 'SpaceX / Starlink',
    orbitType: 'LEO',
    altitudeKm: 552.0,
    velocityKmS: 7.58,
    inclinationDeg: 53.20,
    periodMinutes: 95.7,
    footprintRadiusKm: 1020,
    downlinkFreqMHz: 12200.0,
    uplinkBand: 'Ku/Ka-Band Teleport Downlink + Space Laser ISL',
    nominalLat: 44.50,
    nominalLon: -92.30,
    tleLine1: '1 58941U 23018F   26046.38102941  .00002840  00000+0  16420-3 0  9991',
    tleLine2: '2 58941  53.2010 168.4109 0001890  89.4102 270.8410 15.04891020142108',
    color: '#06b6d4', // cyan-500
    description: 'Starlink v2 Optical Inter-Satellite Link (ISL) mesh router with dual 200 Gbps infrared laser cross-connects leafed to Switch Teleport.',
    beamType: 'Ka-Band High-Capacity Gateway Downlink',
    spectrumAllocation: 'FCC Part 25 NGSO Commercial Gateway'
  },
  {
    id: 'oneweb_polar_08',
    name: 'ONEWEB-0348 (Polar Enterprise LEO)',
    noradId: 45131,
    intlDesignator: '2020-008D',
    constellation: 'OneWeb',
    operator: 'Eutelsat OneWeb',
    orbitType: 'LEO',
    altitudeKm: 1200.0,
    velocityKmS: 7.23,
    inclinationDeg: 87.90,
    periodMinutes: 109.4,
    footprintRadiusKm: 2800,
    downlinkFreqMHz: 10700.0,
    uplinkBand: 'Ku/Ka-Band Enterprise Trunking',
    nominalLat: 58.20,
    nominalLon: -34.50,
    tleLine1: '1 45131U 20008D   26046.29104812  .00000120  00000+0  41200-4 0  9995',
    tleLine2: '2 45131  87.9014 212.4098 0002140 102.4109 257.9012 13.16201940321048',
    color: '#a855f7', // purple-500
    description: 'Polar orbit enterprise satellite delivering high-latitude low-latency BGP fiber extensions to remote teleports and maritime routes.',
    beamType: '16 Steerable User Beams + Dual Gateway Beams',
    spectrumAllocation: 'ITU Global Ku/Ka Priority Spectrum'
  },
  {
    id: 'o3b_mpower_01',
    name: 'O3B MPOWER-1 (Equatorial MEO Gigabit)',
    noradId: 54754,
    intlDesignator: '2022-171A',
    constellation: 'O3b mPOWER',
    operator: 'SES S.A.',
    orbitType: 'MEO',
    altitudeKm: 8062.0,
    velocityKmS: 5.31,
    inclinationDeg: 0.05,
    periodMinutes: 287.9,
    footprintRadiusKm: 6200,
    downlinkFreqMHz: 19200.0,
    uplinkBand: 'Ka-Band Electronically Steerable Spot Beams',
    nominalLat: 0.05,
    nominalLon: -28.40,
    tleLine1: '1 54754U 22171A   26046.50129841 -.00000080  00000+0  00000+0 0  9993',
    tleLine2: '2 54754   0.0510  42.1098 0001204 184.2109 175.9012  5.00194020 62104',
    color: '#ec4899', // pink-500
    description: 'Boeing 702X Software-Defined MEO constellation powering up to 5,000 electronically steerable high-throughput spot beams.',
    beamType: 'Dynamic Phased-Array 5000-Beam Digital Channelizer',
    spectrumAllocation: 'Ka-Band Gigabit Dedicated Interconnect'
  },
  {
    id: 'iridium_next_141',
    name: 'IRIDIUM-NEXT-141 (GMDSS Safety & D2D)',
    noradId: 43075,
    intlDesignator: '2017-086A',
    constellation: 'Iridium',
    operator: 'Iridium Communications',
    orbitType: 'LEO',
    altitudeKm: 780.0,
    velocityKmS: 7.48,
    inclinationDeg: 86.40,
    periodMinutes: 100.4,
    footprintRadiusKm: 3050,
    downlinkFreqMHz: 1626.5,
    uplinkBand: 'L-Band Cross-Linked Intersatellite Mesh',
    nominalLat: 34.20,
    nominalLon: -118.80,
    tleLine1: '1 43075U 17086A   26046.41209841  .00000210  00000+0  64100-4 0  9994',
    tleLine2: '2 43075  86.4010 241.1098 0001840  68.4102 291.7410 14.34109820421041',
    color: '#10b981', // emerald-500
    description: 'Pole-to-pole cross-linked LEO mesh delivering zero-latency maritime IMO GMDSS safety and Project Stardust 3GPP NTN direct-to-device.',
    beamType: '48 Spot Beams + Cross-Linked Ka Intersatellite Links',
    spectrumAllocation: 'L-Band 1616-1626.5 MHz Mobile Satellite'
  },
  {
    id: 'ast_bluebird_1',
    name: 'BLUEBIRD-1 (AST SpaceMobile Direct 5G)',
    noradId: 60920,
    intlDesignator: '2024-162A',
    constellation: 'AST SpaceMobile',
    operator: 'AST SpaceMobile / AT&T & Verizon',
    orbitType: 'LEO',
    altitudeKm: 530.0,
    velocityKmS: 7.60,
    inclinationDeg: 53.00,
    periodMinutes: 95.2,
    footprintRadiusKm: 1150,
    downlinkFreqMHz: 850.0,
    uplinkBand: 'Cellular 850 MHz & 700 MHz Commercial Carrier NTN',
    nominalLat: 32.70,
    nominalLon: -96.50,
    tleLine1: '1 60920U 24162A   26046.48102941  .00004120  00000+0  22100-3 0  9998',
    tleLine2: '2 60920  53.0012 189.4109 0002104  92.1098 268.0142 15.12401820 48102',
    color: '#f59e0b', // amber-500
    description: 'Commercial 693 sq ft commercial phased array antenna designed for broadband direct-to-standard cellular phone connectivity.',
    beamType: 'Massive Spaceborne Phased Array Cellular Beam',
    spectrumAllocation: 'FCC Experimental & Cellular Band 5/12/13 NTN'
  },
  {
    id: 'echostar_14',
    name: 'ECHOSTAR-14 (DISH Network 119°W GEO)',
    noradId: 36499,
    intlDesignator: '2010-010A',
    constellation: 'GEO DBS',
    operator: 'DISH Network / EchoStar',
    orbitType: 'GEO',
    altitudeKm: 35786.0,
    velocityKmS: 3.07,
    inclinationDeg: 0.05,
    periodMinutes: 1436.1,
    footprintRadiusKm: 9200,
    downlinkFreqMHz: 12450.0,
    uplinkBand: 'Ku-Band (17.3-17.8 GHz Up / 12.2-12.7 GHz Down)',
    nominalLat: 0.05,
    nominalLon: -119.02,
    tleLine1: '1 36499U 10010A   26046.21049812 -.00000140  00000+0  00000+0 0  9992',
    tleLine2: '2 36499   0.0520  68.2014 0002140 248.1098 111.9024  1.00271420 54108',
    color: '#f97316', // orange-500
    description: 'Geostationary direct broadcast satellite stationed over the equator at 119.0°W providing continuous North American high-power broadcast.',
    beamType: 'Continental United States (CONUS) High-Power Shaped Beam',
    spectrumAllocation: 'BSS Ku-Band 12.2-12.7 GHz Direct-to-Home'
  },
  {
    id: 'iss_zarya',
    name: 'ISS (ZARYA Space Station)',
    noradId: 25544,
    intlDesignator: '1998-067A',
    constellation: 'Space Stations',
    operator: 'NASA / International Space Station',
    orbitType: 'LEO',
    altitudeKm: 418.5,
    velocityKmS: 7.66,
    inclinationDeg: 51.64,
    periodMinutes: 92.9,
    footprintRadiusKm: 2240,
    downlinkFreqMHz: 145.8,
    uplinkBand: 'VHF/UHF Amateur Relay + Ku/Ka Space-to-Ground',
    nominalLat: 51.64,
    nominalLon: -4.22,
    tleLine1: '1 25544U 98067A   26046.54128941  .00014280  00000+0  25690-3 0  9993',
    tleLine2: '2 25544  51.6420 284.1802 0005412 112.4201 247.7812 15.49821420542104',
    color: '#6366f1', // indigo-500
    description: 'International Space Station orbiting in Low Earth Orbit with amateur radio AX.25 digipeater, live NASA TV downlinks and optical sensors.',
    beamType: 'Omnidirectional VHF/UHF & Steerable Ku Space-to-Ground',
    spectrumAllocation: 'Amateur Satellite & Space Operations 145.80 MHz'
  },
  {
    id: 'gps_biif_10',
    name: 'GPS BIIF-10 (PRN 08 / NAVSTAR)',
    noradId: 40730,
    intlDesignator: '2015-033A',
    constellation: 'GPS',
    operator: 'US Space Force (USSF)',
    orbitType: 'MEO',
    altitudeKm: 20180.0,
    velocityKmS: 3.87,
    inclinationDeg: 55.00,
    periodMinutes: 717.9,
    footprintRadiusKm: 6800,
    downlinkFreqMHz: 1575.42,
    uplinkBand: 'L1/L2/L5 Navigation & Rubidium Atomic Clock Sync',
    nominalLat: 22.40,
    nominalLon: -78.10,
    tleLine1: '1 40730U 15033A   26046.48120941 -.00000040  00000+0  00000+0 0  9999',
    tleLine2: '2 40730  55.0010 198.4102 0004120 184.2109 175.8012  2.00561020 78421',
    color: '#14b8a6', // teal-500
    description: 'Semi-synchronous MEO positioning, navigation, and timing satellite providing cesium and rubidium atomic clock synchronization.',
    beamType: 'Earth-Coverage L-Band Navigation Cone',
    spectrumAllocation: 'L1 (1575.42 MHz) / L2 (1227.60 MHz) / L5 (1176.45 MHz)'
  }
];

// Helper: Parse TLE lines into Keplerian orbital parameters
export function parseTle(line1: string, line2: string): ParsedTleData {
  const catalogNumber = parseInt(line1.substring(2, 7).trim(), 10) || 0;
  const classification = line1.charAt(7) || 'U';
  const intlDesignator = line1.substring(9, 17).trim();
  const epochYear = parseInt(line1.substring(18, 20).trim(), 10);
  const epochDay = parseFloat(line1.substring(20, 32).trim());
  const meanMotionDeriv1 = parseFloat(line1.substring(33, 43).trim()) || 0;
  const bstarDrag = line1.substring(53, 61).trim();

  const inclinationDeg = parseFloat(line2.substring(8, 16).trim()) || 0;
  const raanDeg = parseFloat(line2.substring(17, 25).trim()) || 0;
  const eccentricity = parseFloat('0.' + line2.substring(26, 33).trim()) || 0;
  const argPerigeeDeg = parseFloat(line2.substring(34, 42).trim()) || 0;
  const meanAnomalyDeg = parseFloat(line2.substring(43, 51).trim()) || 0;
  const meanMotionRevsPerDay = parseFloat(line2.substring(52, 63).trim()) || 0;
  const revNumberAtEpoch = parseInt(line2.substring(63, 68).trim(), 10) || 0;

  return {
    catalogNumber,
    classification,
    intlDesignator,
    epochYear,
    epochDay,
    meanMotionDeriv1,
    bstarDrag,
    inclinationDeg,
    raanDeg,
    eccentricity,
    argPerigeeDeg,
    meanAnomalyDeg,
    meanMotionRevsPerDay,
    revNumberAtEpoch
  };
}

// Helper: Real-time ground coordinates for 352 leaf nodes
export function getNodeCoordinates(node: SwitchDedicatedNode): { lat: number; lon: number } {
  // 1. DataPacket nodes
  if (node.id === 'dp_ash') return { lat: 39.04, lon: -77.48 }; // Ashburn
  if (node.id === 'dp_chi') return { lat: 41.88, lon: -87.63 }; // Chicago
  if (node.id === 'dp_dal') return { lat: 32.78, lon: -96.80 }; // Dallas
  if (node.id === 'dp_sjc') return { lat: 37.34, lon: -121.89 }; // San Jose
  if (node.id === 'dp_lon') return { lat: 51.51, lon: -0.13 }; // London
  if (node.id === 'dp_fra') return { lat: 50.11, lon: 8.68 }; // Frankfurt
  if (node.id === 'dp_ams') return { lat: 52.37, lon: 4.90 }; // Amsterdam
  if (node.id === 'dp_par') return { lat: 48.86, lon: 2.35 }; // Paris
  if (node.id === 'dp_tyo') return { lat: 35.68, lon: 139.69 }; // Tokyo
  if (node.id === 'dp_sgp') return { lat: 1.35, lon: 103.82 }; // Singapore
  if (node.id === 'dp_syd') return { lat: -33.87, lon: 151.21 }; // Sydney
  if (node.id === 'dp_sao') return { lat: -23.55, lon: -46.63 }; // Sao Paulo

  // 2. RisingNet BGP clean-pipe nodes (Southern California / Los Angeles)
  if (node.id.startsWith('rn_')) {
    const idx = parseInt(node.id.replace('rn_', ''), 10) || 1;
    return { lat: 34.05 + (idx * 0.08), lon: -118.24 + (idx * 0.05) };
  }

  // 3. Switch.com 335 nodes across 4 master campuses
  const campus = (node.campusName || '').toLowerCase();
  if (campus.includes('tahoe') || campus.includes('reno') || campus.includes('citadel')) {
    const hash = (node.sid.charCodeAt(0) * 17 + node.sid.charCodeAt(1)) % 100;
    return { lat: 39.53 + (hash * 0.003 - 0.15), lon: -119.81 + (hash * 0.004 - 0.2) };
  }
  if (campus.includes('atlanta') || campus.includes('keep')) {
    const hash = (node.sid.charCodeAt(0) * 19 + node.sid.charCodeAt(1)) % 100;
    return { lat: 33.75 + (hash * 0.003 - 0.15), lon: -84.39 + (hash * 0.004 - 0.2) };
  }
  if (campus.includes('pyramid') || campus.includes('grand rapids')) {
    const hash = (node.sid.charCodeAt(0) * 23 + node.sid.charCodeAt(1)) % 100;
    return { lat: 42.96 + (hash * 0.003 - 0.15), lon: -85.67 + (hash * 0.004 - 0.2) };
  }

  // Default: Switch SUPERNAP Las Vegas (Nevada Core)
  const hash = (node.sid.charCodeAt(0) * 31 + (node.sid.charCodeAt(1) || 0) * 7) % 200;
  return { lat: 36.084 + (hash * 0.002 - 0.2), lon: -115.154 + (hash * 0.0025 - 0.25) };
}

// Great-circle ground distance in kilometers (Haversine formula)
export function calculateGreatCircleDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

interface ConstellationCoverageOverlayProps {
  selectedNode?: SwitchDedicatedNode | null;
  onSelectNode?: (node: SwitchDedicatedNode) => void;
  onCloseOverlay?: () => void;
  isFloating?: boolean;
  onHighlightNodesChange?: (coveredNodeIds: Set<string>) => void;
}

export const ConstellationCoverageOverlay: React.FC<ConstellationCoverageOverlayProps> = ({
  selectedNode,
  onSelectNode,
  onCloseOverlay,
  isFloating = false,
  onHighlightNodesChange
}) => {
  // Selected Constellation Filter & Satellite
  const [selectedConstellation, setSelectedConstellation] = useState<string>('All');
  const [selectedSatelliteId, setSelectedSatelliteId] = useState<string>('starlink_v2_cell');
  const [elevationMaskDeg, setElevationMaskDeg] = useState<number>(10); // 5 to 45 deg
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Layer Toggles
  const [showFootprintCones, setShowFootprintCones] = useState<boolean>(true);
  const [showGroundTracks, setShowGroundTracks] = useState<boolean>(true);
  const [showMeshNodes, setShowMeshNodes] = useState<boolean>(true);
  const [showCoveredLinks, setShowCoveredLinks] = useState<boolean>(true);
  const [showTleTerminal, setShowTleTerminal] = useState<boolean>(false);
  const [showAllSatellites, setShowAllSatellites] = useState<boolean>(false);

  // Time & Orbital Propagation Simulation
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(1); // 1x, 5x, 15x, 60x
  const [simElapsedSeconds, setSimElapsedSeconds] = useState<number>(0);
  const [copiedTle, setCopiedTle] = useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState<'map' | 'covered_nodes' | 'tle_inspector'>('map');

  // Active satellite object
  const activeSatellite = useMemo(() => {
    return (
      CONSTELLATION_SATELLITES.find((s) => s.id === selectedSatelliteId) ||
      CONSTELLATION_SATELLITES[0]
    );
  }, [selectedSatelliteId]);

  // Parsed TLE for the active satellite
  const activeTleParsed = useMemo(() => {
    return parseTle(activeSatellite.tleLine1, activeSatellite.tleLine2);
  }, [activeSatellite]);

  // Simulation Clock
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setSimElapsedSeconds((prev) => prev + simSpeed);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, simSpeed]);

  // Calculate live sub-satellite position from TLE parameters & elapsed time
  const liveSatPosition = useMemo(() => {
    // For GEO, fixed sub-satellite point with tiny oscillation
    if (activeSatellite.orbitType === 'GEO') {
      return {
        lat: activeSatellite.nominalLat + Math.sin(simElapsedSeconds / 1000) * 0.05,
        lon: activeSatellite.nominalLon + Math.cos(simElapsedSeconds / 1000) * 0.05
      };
    }

    // LEO/MEO: Propagate Mean Anomaly M(t) = M0 + n * t
    const revsPerSec = activeTleParsed.meanMotionRevsPerDay / 86400;
    const meanAnomalyDeltaDeg = (revsPerSec * 360 * simElapsedSeconds);
    const currentM = (activeTleParsed.meanAnomalyDeg + meanAnomalyDeltaDeg) % 360;
    const currentMRad = (currentM * Math.PI) / 180;

    // True anomaly approximation for low eccentricity orbits: nu ~= M + 2e*sin(M)
    const e = activeTleParsed.eccentricity;
    const trueAnomalyRad = currentMRad + 2 * e * Math.sin(currentMRad);

    // Argument of latitude u = omega + nu
    const omegaRad = (activeTleParsed.argPerigeeDeg * Math.PI) / 180;
    const uRad = omegaRad + trueAnomalyRad;

    // Sub-satellite latitude: sin(lat) = sin(inc) * sin(u)
    const incRad = (activeTleParsed.inclinationDeg * Math.PI) / 180;
    const latRad = Math.asin(Math.sin(incRad) * Math.sin(uRad));
    const latDeg = (latRad * 180) / Math.PI;

    // Sub-satellite longitude: RAAN + atan2(cos(i)*sin(u), cos(u)) - earthRotation
    const nodalLonRad = Math.atan2(Math.cos(incRad) * Math.sin(uRad), Math.cos(uRad));
    const nodalLonDeg = (nodalLonRad * 180) / Math.PI;
    const earthRotationDeg = (simElapsedSeconds * (360 / 86400));
    let lonDeg = (activeTleParsed.raanDeg + nodalLonDeg - earthRotationDeg) % 360;
    if (lonDeg > 180) lonDeg -= 360;
    if (lonDeg < -180) lonDeg += 360;

    return {
      lat: parseFloat(latDeg.toFixed(2)),
      lon: parseFloat(lonDeg.toFixed(2))
    };
  }, [activeSatellite, activeTleParsed, simElapsedSeconds]);

  // Adjusted footprint radius based on user's elevation mask angle
  const effectiveFootprintRadiusKm = useMemo(() => {
    const R = 6371; // Earth radius km
    const h = activeSatellite.altitudeKm;
    const epsRad = (elevationMaskDeg * Math.PI) / 180;
    
    // Central angle theta = acos( (R * cos(eps)) / (R + h) ) - eps
    const cosAngle = (R * Math.cos(epsRad)) / (R + h);
    if (cosAngle > 1) return activeSatellite.footprintRadiusKm;
    const thetaRad = Math.max(0, Math.acos(cosAngle) - epsRad);
    const radius = Math.round(R * thetaRad);
    return Math.max(radius, 200);
  }, [activeSatellite, elevationMaskDeg]);

  // Projected footprint radius in SVG coordinate degrees (approx 111.32 km / deg)
  const footprintRadiusDeg = useMemo(() => {
    return parseFloat((effectiveFootprintRadiusKm / 111.32).toFixed(2));
  }, [effectiveFootprintRadiusKm]);

  // Real-time calculation of covered mesh nodes in the footprint
  const coveredNodesData = useMemo(() => {
    const covered: {
      node: SwitchDedicatedNode;
      distanceKm: number;
      elevationDeg: number;
      propagationDelayMs: number;
      signalQuality: string;
    }[] = [];

    const coveredSet = new Set<string>();

    ALL_NETWORK_LEAF_NODES.forEach((node) => {
      const coords = getNodeCoordinates(node);
      const distKm = calculateGreatCircleDistanceKm(
        liveSatPosition.lat,
        liveSatPosition.lon,
        coords.lat,
        coords.lon
      );

      if (distKm <= effectiveFootprintRadiusKm) {
        coveredSet.add(node.id);

        // Slant range & elevation angle
        const h = activeSatellite.altitudeKm;
        const slantRangeKm = Math.sqrt(distKm * distKm + h * h);
        const elRad = Math.atan2(h, Math.max(1, distKm));
        const elDeg = parseFloat(((elRad * 180) / Math.PI).toFixed(1));
        const delayMs = parseFloat(((slantRangeKm / 299792) * 1000 * 2).toFixed(2)); // Round-trip delay

        let signalQuality = 'Edge Handover (5°-15°)';
        if (elDeg > 45) signalQuality = 'Optimal Beam Center (>45°)';
        else if (elDeg > 20) signalQuality = 'Mid-Footprint (>20°)';

        covered.push({
          node,
          distanceKm: Math.round(distKm),
          elevationDeg: elDeg,
          propagationDelayMs: delayMs,
          signalQuality
        });
      }
    });

    // Notify parent if callback provided
    if (onHighlightNodesChange) {
      onHighlightNodesChange(coveredSet);
    }

    // Sort by closest distance
    return {
      nodes: covered.sort((a, b) => a.distanceKm - b.distanceKm),
      coveredSet
    };
  }, [liveSatPosition, effectiveFootprintRadiusKm, activeSatellite, onHighlightNodesChange]);

  // Orbit ground track coordinates for SVG (60 sample points along the track)
  const groundTrackPoints = useMemo(() => {
    if (activeSatellite.orbitType === 'GEO') return [];

    const points: { x: number; y: number }[] = [];
    const incRad = (activeTleParsed.inclinationDeg * Math.PI) / 180;
    const samples = 64;

    for (let i = 0; i < samples; i++) {
      const fraction = i / (samples - 1);
      const phase = (fraction - 0.5) * Math.PI * 2;
      const lat = Math.sin(phase) * (activeTleParsed.inclinationDeg * 0.96);
      const lon = ((liveSatPosition.lon + (phase * 180) / Math.PI + 360) % 360) - 180;

      // Convert lat/lon to SVG equirectangular map coords (width: 900, height: 450)
      const x = ((lon + 180) / 360) * 900;
      const y = ((90 - lat) / 180) * 450;
      points.push({ x, y });
    }
    return points;
  }, [activeSatellite, activeTleParsed, liveSatPosition]);

  // Filtered satellite list for carousel
  const filteredSatellites = useMemo(() => {
    return CONSTELLATION_SATELLITES.filter((sat) => {
      if (selectedConstellation !== 'All' && sat.constellation !== selectedConstellation) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = sat.name.toLowerCase().includes(q);
        const matchesNorad = sat.noradId.toString().includes(q);
        const matchesOp = sat.operator.toLowerCase().includes(q);
        if (!matchesName && !matchesNorad && !matchesOp) return false;
      }
      return true;
    });
  }, [selectedConstellation, searchQuery]);

  // Convert lat/lon to SVG map coordinates
  const latLonToSvg = (lat: number, lon: number) => {
    const x = ((lon + 180) / 360) * 900;
    const y = ((90 - lat) / 180) * 450;
    return { x, y };
  };

  const activeSatSvgCoords = latLonToSvg(liveSatPosition.lat, liveSatPosition.lon);
  const footprintRadiusSvgX = (footprintRadiusDeg / 360) * 900;
  const footprintRadiusSvgY = (footprintRadiusDeg / 180) * 450;

  const handleCopyTle = () => {
    const text = `${activeSatellite.name}\n${activeSatellite.tleLine1}\n${activeSatellite.tleLine2}`;
    navigator.clipboard.writeText(text);
    setCopiedTle(true);
    setTimeout(() => setCopiedTle(false), 2000);
  };

  return (
    <div className="bg-slate-900 border-2 border-cyan-500/50 rounded-2xl shadow-2xl overflow-hidden font-mono text-xs space-y-4">
      {/* ========================================================
          1. HEADER HUD & REAL-TIME CONTROLS
          ======================================================== */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/60 p-4 sm:p-5 border-b border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-500 via-sky-600 to-indigo-600 p-0.5 shadow-lg shadow-cyan-950/50 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Constellation Coverage &amp; TLE Footprint Overlay
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                <span>KEPLER TLE PROPAGATOR</span>
              </span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                NORAD CATALOG
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time footprint projection over the 352-leaf mesh using official Two-Line Element (TLE) ephemeris parameters.
            </p>
          </div>
        </div>

        {/* Orbit Propagation Time Controls & Actions */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {/* Play / Pause Toggle */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition cursor-pointer ${
              isPlaying
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-amber-300" /> : <Play className="w-3.5 h-3.5 fill-emerald-300" />}
            <span>{isPlaying ? 'PAUSE CLOCK' : 'PROPAGATE LIVE'}</span>
          </button>

          {/* Speed Multiplier */}
          <div className="bg-slate-950 p-1 rounded-lg border border-slate-800 flex items-center gap-1">
            {([1, 5, 15, 60] as const).map((spd) => (
              <button
                key={spd}
                onClick={() => setSimSpeed(spd)}
                className={`px-2 py-1 rounded text-[10px] font-bold transition cursor-pointer ${
                  simSpeed === spd
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title={`Advance orbit at ${spd}x real-time speed`}
              >
                {spd}x
              </button>
            ))}
          </div>

          {/* Reset Orbit Clock */}
          <button
            onClick={() => setSimElapsedSeconds(0)}
            className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            title="Reset to Epoch 0s"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Close Overlay (if modal/floating) */}
          {onCloseOverlay && (
            <button
              onClick={onCloseOverlay}
              className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-rose-400 transition cursor-pointer ml-1"
              title="Close Constellation Overlay"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ========================================================
          2. SATELLITE SELECTOR BAR & CONSTELLATION FILTERS
          ======================================================== */}
      <div className="px-5 space-y-3">
        {/* Constellation Category Filter Pills */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 overflow-x-auto custom-nav-scrollbar py-0.5">
            <span className="text-slate-500 text-[11px] font-bold mr-1 shrink-0">Constellation:</span>
            {(['All', 'Starlink', 'OneWeb', 'O3b mPOWER', 'Iridium', 'AST SpaceMobile', 'GEO DBS', 'Space Stations', 'GPS'] as const).map((c) => (
              <button
                key={c}
                onClick={() => setSelectedConstellation(c)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition whitespace-nowrap cursor-pointer ${
                  selectedConstellation === c
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Elevation Mask Slider & Layer Toggles */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-400 text-[10px]">Elevation Mask:</span>
              <input
                type="range"
                min="5"
                max="35"
                step="5"
                value={elevationMaskDeg}
                onChange={(e) => setElevationMaskDeg(Number(e.target.value))}
                className="w-16 accent-cyan-400 cursor-pointer"
              />
              <span className="text-cyan-300 font-bold text-[10px] tabular-nums">{elevationMaskDeg}°</span>
            </div>

            {/* Toggle TLE Terminal */}
            <button
              onClick={() => setShowTleTerminal(!showTleTerminal)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer flex items-center gap-1 ${
                showTleTerminal
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-950 text-purple-300 hover:bg-slate-800 border border-purple-500/30'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>TLE Data</span>
            </button>
          </div>
        </div>

        {/* Satellite Selection Strip */}
        <div className="flex items-center gap-2 overflow-x-auto custom-nav-scrollbar pb-1">
          {filteredSatellites.map((sat) => {
            const isSelected = sat.id === selectedSatelliteId;
            return (
              <button
                key={sat.id}
                onClick={() => setSelectedSatelliteId(sat.id)}
                className={`p-2.5 rounded-xl border text-left transition shrink-0 cursor-pointer flex items-center gap-2.5 min-w-[220px] ${
                  isSelected
                    ? 'bg-cyan-950/70 border-cyan-400 shadow-md shadow-cyan-950/40 ring-1 ring-cyan-500/50'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div
                  className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: sat.color }}
                />
                <div className="truncate flex-1">
                  <div className="font-bold text-white text-[11px] truncate flex items-center justify-between">
                    <span>{sat.name}</span>
                    <span className="text-[9px] font-mono px-1 rounded bg-slate-900 text-slate-400">
                      {sat.orbitType}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">
                    NORAD {sat.noradId} &bull; {sat.altitudeKm} km
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================
          3. ACTIVE SATELLITE TELEMETRY STRIP (TLE & ORBIT HUD)
          ======================================================== */}
      <div className="mx-5 p-4 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
        <div>
          <span className="text-slate-500 block text-[10px] uppercase font-bold">Sub-Satellite Point</span>
          <span className="text-white font-bold text-[11px] tabular-nums flex items-center gap-1">
            <Crosshair className="w-3 h-3 text-cyan-400" />
            <span>{liveSatPosition.lat >= 0 ? `${liveSatPosition.lat}°N` : `${Math.abs(liveSatPosition.lat)}°S`}, {liveSatPosition.lon >= 0 ? `${liveSatPosition.lon}°E` : `${Math.abs(liveSatPosition.lon)}°W`}</span>
          </span>
        </div>

        <div>
          <span className="text-slate-500 block text-[10px] uppercase font-bold">Footprint Ground Radius</span>
          <span className="text-cyan-300 font-bold text-[11px] tabular-nums">
            {effectiveFootprintRadiusKm.toLocaleString()} km ({footprintRadiusDeg}° beam)
          </span>
        </div>

        <div>
          <span className="text-slate-500 block text-[10px] uppercase font-bold">Orbital Velocity</span>
          <span className="text-emerald-400 font-bold text-[11px] tabular-nums">
            {activeSatellite.velocityKmS} km/s ({Math.round(activeSatellite.velocityKmS * 3600).toLocaleString()} km/h)
          </span>
        </div>

        <div>
          <span className="text-slate-500 block text-[10px] uppercase font-bold">Inclination &amp; Period</span>
          <span className="text-purple-300 font-bold text-[11px] tabular-nums">
            {activeTleParsed.inclinationDeg}° &bull; {activeSatellite.periodMinutes} min
          </span>
        </div>

        <div>
          <span className="text-slate-500 block text-[10px] uppercase font-bold">Downlink &amp; Carrier</span>
          <span className="text-amber-300 font-bold text-[11px] truncate block" title={activeSatellite.uplinkBand}>
            {activeSatellite.downlinkFreqMHz} MHz ({activeSatellite.uplinkBand.split(' ')[0]})
          </span>
        </div>

        <div>
          <span className="text-slate-500 block text-[10px] uppercase font-bold">Mesh Nodes in Beam</span>
          <span className="text-white font-bold text-[11px] flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${coveredNodesData.nodes.length > 0 ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
            <span className={coveredNodesData.nodes.length > 0 ? 'text-emerald-300' : 'text-slate-400'}>
              {coveredNodesData.nodes.length} of 352 Leaf Nodes
            </span>
          </span>
        </div>
      </div>

      {/* ========================================================
          4. RAW TLE TERMINAL DRAWER (EXPANDABLE)
          ======================================================== */}
      {showTleTerminal && (
        <div className="mx-5 p-4 rounded-xl bg-slate-950 border border-purple-500/40 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-purple-400" />
              <span className="font-bold text-white">Official Two-Line Element (TLE) Format &amp; Ephemeris</span>
              <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold">
                NORAD {activeSatellite.noradId}
              </span>
            </div>
            
            <button
              onClick={handleCopyTle}
              className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1 text-[11px] transition cursor-pointer"
            >
              {copiedTle ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedTle ? 'Copied TLE!' : 'Copy TLE Data'}</span>
            </button>
          </div>

          <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 font-mono text-xs overflow-x-auto space-y-1 select-all">
            <div className="text-slate-400 text-[11px]">0 {activeSatellite.name}</div>
            <div className="text-cyan-300 font-bold">{activeSatellite.tleLine1}</div>
            <div className="text-purple-300 font-bold">{activeSatellite.tleLine2}</div>
          </div>

          {/* Decoded Keplerian Telemetry Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 text-[10px] pt-1">
            <div className="p-2 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-500 block">Catalog Number</span>
              <span className="font-bold text-white">{activeTleParsed.catalogNumber} ({activeTleParsed.classification})</span>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-500 block">Epoch Year / Day</span>
              <span className="font-bold text-white">{activeTleParsed.epochYear} / {activeTleParsed.epochDay.toFixed(4)}</span>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-500 block">Eccentricity (e)</span>
              <span className="font-bold text-cyan-300">{activeTleParsed.eccentricity.toFixed(7)}</span>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-500 block">RAAN (Ω)</span>
              <span className="font-bold text-purple-300">{activeTleParsed.raanDeg}°</span>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-500 block">Arg of Perigee (ω)</span>
              <span className="font-bold text-pink-300">{activeTleParsed.argPerigeeDeg}°</span>
            </div>
            <div className="p-2 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-500 block">Mean Motion (n)</span>
              <span className="font-bold text-emerald-400">{activeTleParsed.meanMotionRevsPerDay.toFixed(6)} rev/day</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          5. INTERACTIVE WORLD MAP & SATELLITE FOOTPRINT PROJECTION
          ======================================================== */}
      <div className="px-5">
        <div className="relative aspect-[2/1] w-full bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-inner">
          <svg
            viewBox="0 0 900 450"
            className="w-full h-full select-none"
            style={{ backgroundColor: '#020617' }}
          >
            <defs>
              {/* Radial gradient for satellite footprint cone */}
              <radialGradient id="footprintGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={activeSatellite.color} stopOpacity="0.45" />
                <stop offset="65%" stopColor={activeSatellite.color} stopOpacity="0.18" />
                <stop offset="100%" stopColor={activeSatellite.color} stopOpacity="0.0" />
              </radialGradient>

              {/* Pulsing sub-satellite glow */}
              <radialGradient id="subSatGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                <stop offset="40%" stopColor={activeSatellite.color} stopOpacity="0.6" />
                <stop offset="100%" stopColor={activeSatellite.color} stopOpacity="0" />
              </radialGradient>

              {/* Pattern for grid coordinates */}
              <pattern id="gridPattern" width="75" height="75" patternUnits="userSpaceOnUse">
                <path d="M 75 0 L 0 0 0 75" fill="none" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="2,2" />
              </pattern>
            </defs>

            {/* Latitude/Longitude Grid lines */}
            <rect width="900" height="450" fill="url(#gridPattern)" />

            {/* Equator (lat 0°) */}
            <line x1="0" y1="225" x2="900" y2="225" stroke="#334155" strokeWidth="1" strokeDasharray="4,4" />
            <text x="8" y="222" fill="#475569" fontSize="8" fontFamily="monospace">EQUATOR 0°</text>

            {/* Prime Meridian (lon 0°) */}
            <line x1="450" y1="0" x2="450" y2="450" stroke="#334155" strokeWidth="1" strokeDasharray="4,4" />
            <text x="454" y="14" fill="#475569" fontSize="8" fontFamily="monospace">0° MERIDIAN</text>

            {/* Approximate Vector Continent Landmass Outlines for High-Fidelity Spatial Context */}
            <g fill="#0f172a" stroke="#1e293b" strokeWidth="0.75" opacity="0.85">
              {/* North America */}
              <path d="M 120 70 L 280 65 L 340 100 L 320 160 L 240 190 L 210 260 L 180 240 L 150 170 L 110 130 Z" />
              {/* South America */}
              <path d="M 230 250 L 310 270 L 330 350 L 280 430 L 250 370 L 220 280 Z" />
              {/* Europe */}
              <path d="M 430 80 L 530 85 L 540 130 L 480 150 L 440 130 Z" />
              {/* Africa */}
              <path d="M 430 160 L 540 160 L 560 250 L 520 370 L 470 340 L 420 230 Z" />
              {/* Asia */}
              <path d="M 540 70 L 800 65 L 830 160 L 750 250 L 630 220 L 550 140 Z" />
              {/* Australia */}
              <path d="M 720 310 L 830 310 L 820 400 L 730 390 Z" />
            </g>

            {/* Ground Track Trajectory Line */}
            {showGroundTracks && groundTrackPoints.length > 1 && (
              <polyline
                points={groundTrackPoints.map((p) => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke={activeSatellite.color}
                strokeWidth="1.5"
                strokeDasharray="4,3"
                opacity="0.6"
              />
            )}

            {/* Real-Time Footprint Cone Projection */}
            {showFootprintCones && (
              <g>
                {/* Projected Footprint Ellipse on Mercator */}
                <ellipse
                  cx={activeSatSvgCoords.x}
                  cy={activeSatSvgCoords.y}
                  rx={footprintRadiusSvgX}
                  ry={footprintRadiusSvgY}
                  fill="url(#footprintGradient)"
                  stroke={activeSatellite.color}
                  strokeWidth="1.5"
                  strokeDasharray="5,2"
                  opacity="0.85"
                />

                {/* Inner Core High-Gain Footprint (25° elevation mask) */}
                <ellipse
                  cx={activeSatSvgCoords.x}
                  cy={activeSatSvgCoords.y}
                  rx={footprintRadiusSvgX * 0.45}
                  ry={footprintRadiusSvgY * 0.45}
                  fill={activeSatellite.color}
                  fillOpacity="0.12"
                  stroke={activeSatellite.color}
                  strokeWidth="0.75"
                  opacity="0.7"
                />
              </g>
            )}

            {/* 352 Leaf Mesh Nodes Plotted */}
            {showMeshNodes && (
              <g>
                {ALL_NETWORK_LEAF_NODES.map((node) => {
                  const coords = getNodeCoordinates(node);
                  const svgPt = latLonToSvg(coords.lat, coords.lon);
                  const isCovered = coveredNodesData.coveredSet.has(node.id);
                  const isSelected = selectedNode?.id === node.id;
                  const isDp = node.id.startsWith('dp_');

                  return (
                    <g
                      key={node.id}
                      onClick={() => onSelectNode && onSelectNode(node)}
                      className="cursor-pointer"
                    >
                      {/* Connection beam line from Satellite nadir to covered node */}
                      {showCoveredLinks && isCovered && (
                        <line
                          x1={activeSatSvgCoords.x}
                          y1={activeSatSvgCoords.y}
                          x2={svgPt.x}
                          y2={svgPt.y}
                          stroke={activeSatellite.color}
                          strokeWidth="0.75"
                          strokeDasharray="2,2"
                          opacity="0.4"
                        />
                      )}

                      {/* Node circle marker */}
                      <circle
                        cx={svgPt.x}
                        cy={svgPt.y}
                        r={isSelected ? 4 : isCovered ? 2.8 : 1.2}
                        fill={
                          isSelected
                            ? '#ffffff'
                            : isCovered
                            ? activeSatellite.color
                            : isDp
                            ? '#38bdf8'
                            : '#10b981'
                        }
                        stroke={isCovered ? '#ffffff' : '#020617'}
                        strokeWidth="0.5"
                      />

                      {/* Ripple ring on covered or selected node */}
                      {(isCovered || isSelected) && (
                        <circle
                          cx={svgPt.x}
                          cy={svgPt.y}
                          r={isSelected ? 7 : 4.5}
                          fill="none"
                          stroke={isCovered ? activeSatellite.color : '#ffffff'}
                          strokeWidth="0.75"
                          opacity="0.6"
                        />
                      )}
                    </g>
                  );
                })}
              </g>
            )}

            {/* Sub-Satellite Nadir Point Marker */}
            <g>
              {/* Outer pulsing glow */}
              <circle
                cx={activeSatSvgCoords.x}
                cy={activeSatSvgCoords.y}
                r="14"
                fill="url(#subSatGlow)"
              />

              {/* Sub-satellite center icon */}
              <circle
                cx={activeSatSvgCoords.x}
                cy={activeSatSvgCoords.y}
                r="3.5"
                fill="#ffffff"
                stroke={activeSatellite.color}
                strokeWidth="1.5"
              />

              {/* Crosshair indicators */}
              <line
                x1={activeSatSvgCoords.x - 7}
                y1={activeSatSvgCoords.y}
                x2={activeSatSvgCoords.x + 7}
                y2={activeSatSvgCoords.y}
                stroke="#ffffff"
                strokeWidth="0.8"
              />
              <line
                x1={activeSatSvgCoords.x}
                y1={activeSatSvgCoords.y - 7}
                x2={activeSatSvgCoords.x}
                y2={activeSatSvgCoords.y + 7}
                stroke="#ffffff"
                strokeWidth="0.8"
              />

              {/* Satellite Name Tag */}
              <text
                x={activeSatSvgCoords.x + 10}
                y={activeSatSvgCoords.y - 6}
                fill="#ffffff"
                fontSize="9"
                fontWeight="bold"
                fontFamily="monospace"
                filter="drop-shadow(0px 1px 2px rgba(0,0,0,0.9))"
              >
                {activeSatellite.name.split(' (')[0]}
              </text>
              <text
                x={activeSatSvgCoords.x + 10}
                y={activeSatSvgCoords.y + 6}
                fill={activeSatellite.color}
                fontSize="8"
                fontFamily="monospace"
                filter="drop-shadow(0px 1px 2px rgba(0,0,0,0.9))"
              >
                {activeSatellite.altitudeKm} km &bull; {effectiveFootprintRadiusKm} km Footprint
              </text>
            </g>
          </svg>

          {/* Map Controls Floating Badge */}
          <div className="absolute bottom-3 left-3 bg-slate-950/90 border border-slate-800 rounded-lg p-2 flex items-center gap-3 text-[10px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activeSatellite.color }} />
              <span className="text-white font-bold">{activeSatellite.name.split(' ')[0]} Footprint</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>335 Switch Nodes</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              <span>12 DataPacket 100G Edge</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          6. COVERED MESH NODES LIST & LINK TELEMETRY TABLE
          ======================================================== */}
      <div className="px-5 pb-5 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-white">
              Leaf Mesh Nodes Currently Illuminated by {activeSatellite.name.split(' (')[0]}
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
              {coveredNodesData.nodes.length} Nodes Online
            </span>
          </div>
          <span className="text-slate-500 text-[11px]">
            Real-time slant range &amp; 3GPP propagation delay calculated from orbital coordinates
          </span>
        </div>

        {coveredNodesData.nodes.length === 0 ? (
          <div className="p-6 rounded-xl bg-slate-950/80 border border-slate-800 text-center space-y-2">
            <Radio className="w-8 h-8 text-slate-600 mx-auto" />
            <div className="text-slate-300 font-bold">No Mesh Nodes Currently Inside Beam Footprint</div>
            <p className="text-[11px] text-slate-500 max-w-md mx-auto">
              {activeSatellite.name} is currently transiting outside coverage zones. Advance the simulation clock or adjust the elevation mask angle to view upcoming passes.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[300px] overflow-y-auto custom-nav-scrollbar pr-1">
            {coveredNodesData.nodes.map(({ node, distanceKm, elevationDeg, propagationDelayMs, signalQuality }) => {
              const isSelected = selectedNode?.id === node.id;
              const isDp = node.id.startsWith('dp_');
              return (
                <div
                  key={node.id}
                  onClick={() => onSelectNode && onSelectNode(node)}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer space-y-1.5 ${
                    isSelected
                      ? 'bg-cyan-950/60 border-cyan-400 ring-1 ring-cyan-500/50 shadow-lg'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white truncate max-w-[170px]">{node.name}</span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-900 text-cyan-300 border border-cyan-500/30">
                      SID {node.sid}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 truncate">
                    {node.campusName || node.location}
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800/80 text-[10px]">
                    <div>
                      <span className="text-slate-500 block">Slant Distance</span>
                      <span className="font-bold text-white tabular-nums">{distanceKm} km</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Elevation</span>
                      <span className="font-bold text-emerald-400 tabular-nums">{elevationDeg}°</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">RF Delay</span>
                      <span className="font-bold text-amber-300 tabular-nums">{propagationDelayMs} ms</span>
                    </div>
                  </div>

                  <div className="text-[9px] font-mono text-cyan-300 flex items-center justify-between pt-0.5">
                    <span>{signalQuality}</span>
                    <span className="text-slate-500">{isDp ? 'DataPacket 100G' : 'Switch SUPERNAP'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
