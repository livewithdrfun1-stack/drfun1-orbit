/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 * 
 * Satellite Fleet Status & Real-Time TLE Alert Seed Data
 */

import { SatelliteFleetAlert, FleetConstellationSummary } from '../types/satelliteFleetAlerts';

export const INITIAL_FLEET_CONSTELLATIONS: FleetConstellationSummary[] = [
  {
    constellationName: 'Starlink Gen2 & Direct-to-Cell',
    operator: 'SpaceX / Starlink',
    activeSatellites: 6850,
    orbitType: 'LEO',
    primaryFrequency: 'Ku/Ka-Band & 3GPP PCS G-Block',
    status: 'nominal',
    lastEpochUpdate: '14 min ago (Epoch 26046.5412)',
    tleChanges24h: 38,
    badgeColor: '#38bdf8'
  },
  {
    constellationName: 'Eutelsat OneWeb Polar Enterprise',
    operator: 'Eutelsat OneWeb',
    activeSatellites: 634,
    orbitType: 'LEO',
    primaryFrequency: 'Ku/Ka-Band Enterprise Trunking',
    status: 'nominal',
    lastEpochUpdate: '32 min ago (Epoch 26046.4910)',
    tleChanges24h: 12,
    badgeColor: '#a855f7'
  },
  {
    constellationName: 'SES O3b mPOWER MEO Gigabit',
    operator: 'SES S.A.',
    activeSatellites: 8,
    orbitType: 'MEO',
    primaryFrequency: 'Ka-Band Electronically Steerable Spot Beams',
    status: 'maneuver_in_progress',
    lastEpochUpdate: '2 hours ago (Epoch 26046.3812)',
    tleChanges24h: 3,
    badgeColor: '#ec4899'
  },
  {
    constellationName: 'Iridium NEXT & Certus Safety',
    operator: 'Iridium Communications',
    activeSatellites: 66,
    orbitType: 'LEO',
    primaryFrequency: 'L-Band 1616-1626.5 MHz Mobile Safety',
    status: 'nominal',
    lastEpochUpdate: '1 hour ago (Epoch 26046.4210)',
    tleChanges24h: 6,
    badgeColor: '#10b981'
  },
  {
    constellationName: 'AST SpaceMobile BlueBird',
    operator: 'AST SpaceMobile / AT&T & Verizon',
    activeSatellites: 5,
    orbitType: 'LEO',
    primaryFrequency: '850/700 MHz Commercial Cellular 5G NTN',
    status: 'nominal',
    lastEpochUpdate: '45 min ago (Epoch 26046.4810)',
    tleChanges24h: 4,
    badgeColor: '#f59e0b'
  },
  {
    constellationName: 'EchoStar / DISH Direct Broadcast',
    operator: 'DISH Network / EchoStar',
    activeSatellites: 14,
    orbitType: 'GEO',
    primaryFrequency: 'Ku-Band 12.2-12.7 GHz CONUS Broadcast',
    status: 'nominal',
    lastEpochUpdate: '6 hours ago (Epoch 26046.2104)',
    tleChanges24h: 1,
    badgeColor: '#f97316'
  },
  {
    constellationName: 'International Space Station (ISS)',
    operator: 'NASA / Roscosmos / ESA / JAXA',
    activeSatellites: 1,
    orbitType: 'LEO',
    primaryFrequency: 'VHF 145.80 MHz & Ku/Ka Space-to-Ground',
    status: 'nominal',
    lastEpochUpdate: '8 min ago (Epoch 26046.5412)',
    tleChanges24h: 5,
    badgeColor: '#6366f1'
  },
  {
    constellationName: 'GPS Block IIF / III Navstar',
    operator: 'US Space Force (USSF)',
    activeSatellites: 31,
    orbitType: 'MEO',
    primaryFrequency: 'L1 (1575.42 MHz) / L2 (1227.60 MHz) / L5',
    status: 'nominal',
    lastEpochUpdate: '4 hours ago (Epoch 26046.4812)',
    tleChanges24h: 2,
    badgeColor: '#14b8a6'
  }
];

export const INITIAL_FLEET_ALERTS: SatelliteFleetAlert[] = [
  {
    id: 'tle_alert_01',
    satelliteId: 'starlink_v2_cell',
    satelliteName: 'STARLINK-5124 (Direct-to-Cell V2)',
    noradId: 54201,
    constellation: 'Starlink',
    operator: 'SpaceX / Starlink',
    timestamp: '2 min ago',
    secondsAgo: 120,
    severity: 'maneuver',
    eventCategory: 'station_keeping_burn',
    title: 'Autonomous Hall Thruster Station-Keeping Burn Executed',
    message: 'Argon electric propulsion firing detected by Space-Track radar. Orbit raised by +1.42 km to offset thermospheric solar drag; new TLE epoch published.',
    oldTleLine1: '1 54201U 22134A   26046.41098421  .00003120  00000+0  18420-3 0  9993',
    oldTleLine2: '2 54201  53.0538 142.1082 0001410  74.1984 285.9320 15.06200140182408',
    newTleLine1: '1 54201U 22134A   26046.42109842  .00003410  00000+0  19840-3 0  9997',
    newTleLine2: '2 54201  53.0540 142.1098 0001420  74.2012 285.9410 15.06201840182412',
    deltaMetrics: {
      oldEpoch: '26046.4109',
      newEpoch: '26046.4210 (+0.0101)',
      deltaAltitudeKm: 1.42,
      deltaMeanMotion: 0.000017,
      deltaInclinationDeg: 0.0002,
      deltaBstarDrag: '+1.42e-4',
      stationKeepingManeuver: true,
      conjunctionRisk: 'None'
    },
    isRead: false,
    acknowledged: false
  },
  {
    id: 'tle_alert_02',
    satelliteId: 'iss_zarya',
    satelliteName: 'ISS (ZARYA Space Station)',
    noradId: 25544,
    constellation: 'Space Stations',
    operator: 'NASA / International Space Station',
    timestamp: '11 min ago',
    secondsAgo: 660,
    severity: 'info',
    eventCategory: 'epoch_update',
    title: 'Routine High-Precision Orbit Ephemeris Published',
    message: '18th Space Defense Squadron radar catalog updated. Mean motion 15.4982 revs/day verified with amateur AX.25 digipeater and Ku-band tracking stations.',
    oldTleLine1: '1 25544U 98067A   26046.48102941  .00013890  00000+0  24910-3 0  9990',
    oldTleLine2: '2 25544  51.6418 284.1790 0005390 112.4180 247.7780 15.49820100542100',
    newTleLine1: '1 25544U 98067A   26046.54128941  .00014280  00000+0  25690-3 0  9993',
    newTleLine2: '2 25544  51.6420 284.1802 0005412 112.4201 247.7812 15.49821420542104',
    deltaMetrics: {
      oldEpoch: '26046.4810',
      newEpoch: '26046.5412 (+0.0602)',
      deltaAltitudeKm: -0.18,
      deltaMeanMotion: 0.0000132,
      deltaInclinationDeg: 0.0002,
      deltaBstarDrag: '+7.80e-5',
      stationKeepingManeuver: false,
      conjunctionRisk: 'None'
    },
    isRead: false,
    acknowledged: false
  },
  {
    id: 'tle_alert_03',
    satelliteId: 'oneweb_polar_08',
    satelliteName: 'ONEWEB-0348 (Polar Enterprise LEO)',
    noradId: 45131,
    constellation: 'OneWeb',
    operator: 'Eutelsat OneWeb',
    timestamp: '26 min ago',
    secondsAgo: 1560,
    severity: 'warning',
    eventCategory: 'solar_drag_adjustment',
    title: 'Space Weather Atmospheric Drag Perturbation Detected',
    message: 'Increased geomagnetic storm index (Kp 5+) caused slight orbital decay rate increase. BSTAR drag coefficient increased from 3.8e-4 to 4.12e-4.',
    oldTleLine1: '1 45131U 20008D   26046.18402941  .00000095  00000+0  38000-4 0  9991',
    oldTleLine2: '2 45131  87.9012 212.4080 0002130 102.4090 257.8990 13.16201700321040',
    newTleLine1: '1 45131U 20008D   26046.29104812  .00000120  00000+0  41200-4 0  9995',
    newTleLine2: '2 45131  87.9014 212.4098 0002140 102.4109 257.9012 13.16201940321048',
    deltaMetrics: {
      oldEpoch: '26046.1840',
      newEpoch: '26046.2910 (+0.1070)',
      deltaAltitudeKm: -0.42,
      deltaMeanMotion: 0.0000024,
      deltaInclinationDeg: 0.0002,
      deltaBstarDrag: '+3.20e-5',
      stationKeepingManeuver: false,
      conjunctionRisk: 'Monitored'
    },
    isRead: false,
    acknowledged: false
  },
  {
    id: 'tle_alert_04',
    satelliteId: 'ast_bluebird_1',
    satelliteName: 'BLUEBIRD-1 (AST SpaceMobile Direct 5G)',
    noradId: 60920,
    constellation: 'AST SpaceMobile',
    operator: 'AST SpaceMobile / AT&T & Verizon',
    timestamp: '48 min ago',
    secondsAgo: 2880,
    severity: 'maneuver',
    eventCategory: 'plane_rephasing',
    title: 'Phased Array Pitch & Yaw Orientation Burn',
    message: 'Attitude control burn locked to optimize 3GPP Band 5/12 cellular phased array footprint over the Continental US. RF doppler calibration synchronized.',
    oldTleLine1: '1 60920U 24162A   26046.39102841  .00003840  00000+0  20400-3 0  9992',
    oldTleLine2: '2 60920  53.0008 189.4082 0002090  92.1070 268.0120 15.12401500 48098',
    newTleLine1: '1 60920U 24162A   26046.48102941  .00004120  00000+0  22100-3 0  9998',
    newTleLine2: '2 60920  53.0012 189.4109 0002104  92.1098 268.0142 15.12401820 48102',
    deltaMetrics: {
      oldEpoch: '26046.3910',
      newEpoch: '26046.4810 (+0.0900)',
      deltaAltitudeKm: 0.65,
      deltaMeanMotion: 0.0000032,
      deltaInclinationDeg: 0.0004,
      deltaBstarDrag: '+1.70e-4',
      stationKeepingManeuver: true,
      conjunctionRisk: 'None'
    },
    isRead: true,
    acknowledged: true
  },
  {
    id: 'tle_alert_05',
    satelliteId: 'echostar_14',
    satelliteName: 'ECHOSTAR-14 (DISH Network 119°W GEO)',
    noradId: 36499,
    constellation: 'GEO DBS',
    operator: 'DISH Network / EchoStar',
    timestamp: '1 hour ago',
    secondsAgo: 3600,
    severity: 'info',
    eventCategory: 'station_keeping_burn',
    title: 'Semi-Annual North-South GEO Station-Keeping Trim',
    message: 'Geostationary orbital inclination corrected by 0.004° back toward true equatorial zero plane. Continuous 119.0°W orbital slot lock verified.',
    oldTleLine1: '1 36499U 10010A   26046.10402910 -.00000135  00000+0  00000+0 0  9990',
    oldTleLine2: '2 36499   0.0560  68.1990 0002130 248.1070 111.9000  1.00271380 54100',
    newTleLine1: '1 36499U 10010A   26046.21049812 -.00000140  00000+0  00000+0 0  9992',
    newTleLine2: '2 36499   0.0520  68.2014 0002140 248.1098 111.9024  1.00271420 54108',
    deltaMetrics: {
      oldEpoch: '26046.1040',
      newEpoch: '26046.2104 (+0.1064)',
      deltaAltitudeKm: 0.12,
      deltaMeanMotion: 0.0000004,
      deltaInclinationDeg: -0.0040,
      deltaBstarDrag: '0.00',
      stationKeepingManeuver: true,
      conjunctionRisk: 'None'
    },
    isRead: true,
    acknowledged: true
  }
];

// Helper to generate a realistic simulated new TLE change alert
export function generateSimulatedTleAlert(counter: number): SatelliteFleetAlert {
  const satellites = [
    {
      id: 'starlink_laser_gate',
      name: 'STARLINK-5894 (Optical Space Laser)',
      noradId: 58941,
      constellation: 'Starlink' as const,
      operator: 'SpaceX / Starlink',
      deltaAlt: 0.95,
      severity: 'maneuver' as const,
      category: 'station_keeping_burn' as const,
      title: 'Inter-Satellite Laser Cross-Connect Trim Maneuver',
      message: 'Autonomous optical laser gimbal recalibration burn completed. Inter-satellite mesh latency with Switch Teleport reduced by 0.4 ms.'
    },
    {
      id: 'o3b_mpower_01',
      name: 'O3B MPOWER-1 (Equatorial MEO Gigabit)',
      noradId: 54754,
      constellation: 'O3b mPOWER' as const,
      operator: 'SES S.A.',
      deltaAlt: 2.10,
      severity: 'maneuver' as const,
      category: 'plane_rephasing' as const,
      title: 'MEO Equatorial Slot Phasing & High-Power Ka Beam Boost',
      message: 'Equatorial drift compensation maneuver locked 0.05° plane. All 5,000 steerable digital spot beam channels recalibrated.'
    },
    {
      id: 'iridium_next_141',
      name: 'IRIDIUM-NEXT-141 (GMDSS Safety & D2D)',
      noradId: 43075,
      constellation: 'Iridium' as const,
      operator: 'Iridium Communications',
      deltaAlt: -0.25,
      severity: 'info' as const,
      category: 'epoch_update' as const,
      title: 'Polar Orbit Revolution Ephemeris Refresh (Rev #42105)',
      message: 'Space-Track NORAD orbital element set synchronized. Cross-linked polar ring transit confirmed nominal.'
    },
    {
      id: 'gps_biif_10',
      name: 'GPS BIIF-10 (PRN 08 / NAVSTAR)',
      noradId: 40730,
      constellation: 'GPS' as const,
      operator: 'US Space Force (USSF)',
      deltaAlt: 0.08,
      severity: 'info' as const,
      category: 'rf_transponder_sync' as const,
      title: 'Atomic Rubidium Clock Ephemeris Calibration Upload',
      message: 'Schriever Space Force Base master control station uploaded nanosecond-precision atomic clock offsets. L1/L2/L5 signals nominal.'
    }
  ];

  const target = satellites[counter % satellites.length];
  const epochDay = (46.55 + counter * 0.012).toFixed(4);

  return {
    id: `tle_sim_${Date.now()}_${counter}`,
    satelliteId: target.id,
    satelliteName: target.name,
    noradId: target.noradId,
    constellation: target.constellation,
    operator: target.operator,
    timestamp: 'Just now',
    secondsAgo: 0,
    severity: target.severity,
    eventCategory: target.category,
    title: target.title,
    message: target.message,
    newTleLine1: `1 ${target.noradId}U 24001A   260${epochDay}  .00003420  00000+0  19840-3 0  999${(counter % 9) + 1}`,
    newTleLine2: `2 ${target.noradId}  53.0540 142.1098 0001420  74.2012 285.9410 15.06201840${counter + 100}`,
    deltaMetrics: {
      oldEpoch: `260${(parseFloat(epochDay) - 0.012).toFixed(4)}`,
      newEpoch: `260${epochDay} (+0.0120)`,
      deltaAltitudeKm: target.deltaAlt,
      deltaMeanMotion: 0.000012,
      deltaInclinationDeg: 0.0001,
      deltaBstarDrag: '+1.20e-5',
      stationKeepingManeuver: target.severity === 'maneuver',
      conjunctionRisk: 'None'
    },
    isRead: false,
    acknowledged: false
  };
}
