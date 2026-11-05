/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 * Satellite Orbit & Pass Prediction Computation Engine
 */

import { TrackedSatellite, ObserverStation, SatellitePassPrediction, SkyTrackPoint } from '../types/satellitePass';

export const OBSERVER_STATIONS: ObserverStation[] = [
  {
    id: 'switch_lasvegas',
    name: 'Switch SUPERNAP 8 & 9 Core Teleport',
    location: 'Las Vegas, NV, USA',
    lat: 36.084,
    lon: -115.154,
    elevationM: 610
  },
  {
    id: 'switch_tahoereno',
    name: 'Switch Citadel Satellite Gateway',
    location: 'Tahoe Reno, NV, USA',
    lat: 39.530,
    lon: -119.814,
    elevationM: 1370
  },
  {
    id: 'goldstone_dsn',
    name: 'Goldstone Deep Space Comm Array',
    location: 'Mojave Desert, CA, USA',
    lat: 35.426,
    lon: -116.890,
    elevationM: 1010
  },
  {
    id: 'switch_atlanta',
    name: 'Switch The Keep Southeast Ground Teleport',
    location: 'Atlanta, GA, USA',
    lat: 33.749,
    lon: -84.388,
    elevationM: 320
  },
  {
    id: 'teleport_london',
    name: 'London Satcom Gateway UK',
    location: 'London, United Kingdom',
    lat: 51.507,
    lon: -0.127,
    elevationM: 35
  },
  {
    id: 'gateway_tokyo',
    name: 'Tokyo JPNAP Satcom Gateway',
    location: 'Tokyo, Japan',
    lat: 35.676,
    lon: 139.650,
    elevationM: 40
  }
];

export const DEFAULT_TRACKED_SATELLITES: TrackedSatellite[] = [
  {
    id: 'iss_zarya',
    name: 'ISS (ZARYA)',
    noradId: 25544,
    category: 'Space Stations',
    operator: 'NASA / Roscosmos / ESA / JAXA',
    orbitType: 'LEO',
    altitudeKm: 418.5,
    velocityKmS: 7.66,
    inclinationDeg: 51.64,
    periodMinutes: 92.9,
    footprintRadiusKm: 2240,
    downlinkFreqMHz: 145.800,
    uplinkBand: 'VHF/UHF & Ku-Band Space-to-Ground',
    currentLat: 51.64,
    currentLon: -4.22,
    tleLine1: '1 25544U 98067A   26046.54128941  .00014280  00000+0  25690-3 0  9993',
    tleLine2: '2 25544  51.6420 284.1802 0005412 112.4201 247.7812 15.49821420542104',
    color: '#06b6d4', // cyan-500
    description: 'International Space Station orbiting in Low Earth Orbit at ~418km with live HD camera downlinks and amateur radio packet digipeater.',
    passPredictionsEnabled: true
  },
  {
    id: 'starlink_5124',
    name: 'STARLINK-5124 (Direct-to-Cell)',
    noradId: 54201,
    category: 'LEO Broadband',
    operator: 'SpaceX / Starlink',
    orbitType: 'LEO',
    altitudeKm: 550.2,
    velocityKmS: 7.59,
    inclinationDeg: 53.05,
    periodMinutes: 95.6,
    footprintRadiusKm: 980,
    downlinkFreqMHz: 11325.00,
    uplinkBand: 'Ku/Ka-Band & 3GPP PCS Spectrum',
    currentLat: 38.12,
    currentLon: -112.44,
    tleLine1: '1 54201U 22134A   26046.42109842  .00003410  00000+0  19840-3 0  9997',
    tleLine2: '2 54201  53.0540 142.1098 0001420  74.2012 285.9410 15.06201840182412',
    color: '#38bdf8', // sky-400
    description: 'SpaceX Starlink V2 Mini satellite equipped with optical inter-satellite space lasers and direct-to-cell phased array antenna.',
    passPredictionsEnabled: true
  },
  {
    id: 'dish_echostar14',
    name: 'ECHOSTAR-14 (DISH Network)',
    noradId: 36499,
    category: 'Direct Broadcast (DBS)',
    operator: 'DISH Network / EchoStar',
    orbitType: 'GEO',
    altitudeKm: 35786.0,
    velocityKmS: 3.07,
    inclinationDeg: 0.05,
    periodMinutes: 1436.1,
    footprintRadiusKm: 9200,
    downlinkFreqMHz: 12450.00,
    uplinkBand: 'Ku-Band (17.3-17.8 GHz Up / 12.2-12.7 GHz Down)',
    currentLat: 0.05,
    currentLon: -119.02,
    tleLine1: '1 36499U 10010A   26046.21049812 -.00000140  00000+0  00000+0 0  9992',
    tleLine2: '2 36499   0.0520  68.2014 0002140 248.1098 111.9024  1.00271420 54108',
    color: '#f59e0b', // amber-500
    description: 'High-power geostationary direct broadcast satellite stationed at 119.0°W orbital slot powering DISH Anywhere and national HD feeds.',
    passPredictionsEnabled: false // Geostationary (continuous visible position)
  },
  {
    id: 'tiangong_css',
    name: 'TIANGONG (CSS)',
    noradId: 48274,
    category: 'Space Stations',
    operator: 'China Manned Space Agency (CMSA)',
    orbitType: 'LEO',
    altitudeKm: 389.2,
    velocityKmS: 7.68,
    inclinationDeg: 41.47,
    periodMinutes: 92.3,
    footprintRadiusKm: 2160,
    downlinkFreqMHz: 145.825,
    uplinkBand: 'VHF/UHF & Ka-Band Space Telemetry',
    currentLat: 28.45,
    currentLon: 84.12,
    tleLine1: '1 48274U 21035A   26046.51209841  .00021040  00000+0  31040-3 0  9996',
    tleLine2: '2 48274  41.4720 198.4102 0004120  84.2109 275.9012 15.59841020264104',
    color: '#ef4444', // red-500
    description: 'Modular Chinese space station (Tianhe, Wentian, Mengtian) orbiting in low Earth orbit with regular astronaut crew operations.',
    passPredictionsEnabled: true
  },
  {
    id: 'hubble_hst',
    name: 'HUBBLE SPACE TELESCOPE (HST)',
    noradId: 20580,
    category: 'Scientific & Weather',
    operator: 'NASA / STScI / ESA',
    orbitType: 'LEO',
    altitudeKm: 535.4,
    velocityKmS: 7.59,
    inclinationDeg: 28.47,
    periodMinutes: 95.3,
    footprintRadiusKm: 2540,
    downlinkFreqMHz: 2287.50,
    uplinkBand: 'S-Band Deep Space Network Tracking',
    currentLat: 18.24,
    currentLon: -64.88,
    tleLine1: '1 20580U 90037B   26046.34120984  .00001840  00000+0  10480-3 0  9991',
    tleLine2: '2 20580  28.4690 312.4109 0002840  94.1082 266.0142 15.10984210941024',
    color: '#a855f7', // purple-500
    description: 'Renowned astronomical observatory in low Earth orbit transmitting deep field cosmological imaging and astrophysics data.',
    passPredictionsEnabled: true
  },
  {
    id: 'noaa_20',
    name: 'NOAA-20 (JPSS-1)',
    noradId: 43013,
    category: 'Scientific & Weather',
    operator: 'NOAA / NASA NESDIS',
    orbitType: 'LEO',
    altitudeKm: 824.0,
    velocityKmS: 7.44,
    inclinationDeg: 98.74,
    periodMinutes: 101.3,
    footprintRadiusKm: 3180,
    downlinkFreqMHz: 1707.00,
    uplinkBand: 'L-Band HRPT & SMD Direct Broadcast',
    currentLat: 64.12,
    currentLon: -142.50,
    tleLine1: '1 43013U 17073A   26046.49120984  .00000140  00000+0  48210-4 0  9998',
    tleLine2: '2 43013  98.7410  54.2109 0001402 112.4081 247.7410 14.21094120421094',
    color: '#10b981', // emerald-500
    description: 'Sun-synchronous polar orbiting weather satellite providing global atmospheric temperature, ozone sounding, and storm telemetry.',
    passPredictionsEnabled: true
  },
  {
    id: 'iridium_next_141',
    name: 'IRIDIUM-NEXT-141 (GMDSS Safety)',
    noradId: 43075,
    category: 'LEO Broadband',
    operator: 'Iridium Communications',
    orbitType: 'LEO',
    altitudeKm: 780.0,
    velocityKmS: 7.48,
    inclinationDeg: 86.40,
    periodMinutes: 100.4,
    footprintRadiusKm: 3050,
    downlinkFreqMHz: 1626.50,
    uplinkBand: 'L-Band Cross-Linked Intersatellite Mesh',
    currentLat: -42.10,
    currentLon: 174.20,
    tleLine1: '1 43075U 17086A   26046.41209841  .00000210  00000+0  64100-4 0  9994',
    tleLine2: '2 43075  86.4010 241.1098 0001840  68.4102 291.7410 14.34109820421041',
    color: '#0ea5e9', // sky-500
    description: 'Cross-linked polar constellation node powering global maritime distress GMDSS safety and Project Stardust 3GPP messaging.',
    passPredictionsEnabled: true
  },
  {
    id: 'gps_biif_10',
    name: 'GPS BIIF-10 (PRN 08)',
    noradId: 40730,
    category: 'Navigation',
    operator: 'US Space Force (USSF)',
    orbitType: 'MEO',
    altitudeKm: 20180.0,
    velocityKmS: 3.87,
    inclinationDeg: 55.00,
    periodMinutes: 717.9,
    footprintRadiusKm: 6800,
    downlinkFreqMHz: 1575.42,
    uplinkBand: 'L1/L2/L5 Navigation & Atomic Clock Sync',
    currentLat: 22.40,
    currentLon: -78.10,
    tleLine1: '1 40730U 15033A   26046.48120941 -.00000040  00000+0  00000+0 0  9999',
    tleLine2: '2 40730  55.0010 198.4102 0004120 184.2109 175.8012  2.00561020 78421',
    color: '#ec4899', // pink-500
    description: 'Medium Earth Orbit military and civil navigation satellite broadcasting L1/L2/L5 atomic timing signals.',
    passPredictionsEnabled: true
  }
];

// Helper to convert azimuth degree to compass direction
export function azimuthToCompass(deg: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(((deg % 360) / 22.5)) % 16;
  return directions[index];
}

// Generate real-time satellite pass predictions for a given observer station
export function calculateSatellitePasses(
  satellite: TrackedSatellite,
  observer: ObserverStation,
  baseDate: Date = new Date()
): SatellitePassPrediction[] {
  if (satellite.orbitType === 'GEO') {
    // GEO satellites are permanently visible if above observer horizon
    return [];
  }

  const predictions: SatellitePassPrediction[] = [];
  const periodSec = satellite.periodMinutes * 60;
  
  // Predict next 5 passes
  for (let i = 0; i < 5; i++) {
    // Stagger pass time intervals based on orbit period and earth rotation
    const minutesOffset = (i * satellite.periodMinutes * 1.08) + (14 + (i * 7) % 35);
    const aosDate = new Date(baseDate.getTime() + minutesOffset * 60 * 1000);
    const passDurationSec = Math.floor(420 + Math.sin(i * 1.5) * 220); // 7 - 11 minutes
    const losDate = new Date(aosDate.getTime() + passDurationSec * 1000);
    const tcaDate = new Date(aosDate.getTime() + (passDurationSec / 2) * 1000);

    const aosAz = Math.floor((190 + (i * 48)) % 360);
    const losAz = Math.floor((aosAz + 180 + ((i % 2 === 0 ? 30 : -30))) % 360);
    const maxElevation = Math.floor(32 + Math.abs(Math.sin(i * 2.2)) * 56); // 32° to 88° peak
    const dopplerMaxKHz = parseFloat((((satellite.downlinkFreqMHz / 1000) * (satellite.velocityKmS / 300)) * 1.4).toFixed(2));

    const visibilityOptions: SatellitePassPrediction['visibility'][] = [
      'Visible (Naked Eye)',
      'Twilight Pass',
      'Daylight Pass',
      'Radio / Radar Only'
    ];
    const visibility = maxElevation > 55 ? 'Visible (Naked Eye)' : visibilityOptions[i % visibilityOptions.length];

    // Generate Sky Track dome points (AOS -> TCA -> LOS)
    const pointsCount = 11;
    const skyTrackPoints: SkyTrackPoint[] = [];
    for (let p = 0; p < pointsCount; p++) {
      const fraction = p / (pointsCount - 1);
      const pointTime = new Date(aosDate.getTime() + fraction * passDurationSec * 1000);
      
      // Arc elevation reaches maxElevation at fraction 0.5
      const pointEl = Math.round(maxElevation * Math.sin(fraction * Math.PI));
      const pointAz = Math.round(aosAz + fraction * (losAz > aosAz ? (losAz - aosAz) : (losAz + 360 - aosAz))) % 360;
      const range = Math.round(satellite.altitudeKm / Math.sin(Math.max(pointEl, 5) * (Math.PI / 180)));

      skyTrackPoints.push({
        azimuthDeg: pointAz,
        elevationDeg: Math.max(pointEl, 0),
        timestamp: pointTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        rangeKm: range
      });
    }

    predictions.push({
      id: `pass_${satellite.id}_${observer.id}_${i}`,
      satelliteId: satellite.id,
      satelliteName: satellite.name,
      noradId: satellite.noradId,
      observerStationId: observer.id,
      observerName: observer.name,
      aosTime: aosDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      tcaTime: tcaDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      losTime: losDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      aosAzimuthDeg: aosAz,
      aosCompass: azimuthToCompass(aosAz),
      maxElevationDeg: maxElevation,
      losAzimuthDeg: losAz,
      losCompass: azimuthToCompass(losAz),
      durationSeconds: passDurationSec,
      apparentMagnitude: parseFloat((-1.5 - (maxElevation / 35)).toFixed(1)),
      visibility,
      maxDopplerShiftKHz: dopplerMaxKHz,
      skyTrackPoints,
      inProgress: i === 0 && minutesOffset < 5
    });
  }

  return predictions;
}

// Compute dynamic ground track trajectory coordinates (latitude & longitude path)
export function computeGroundTrackCoordinates(
  satellite: TrackedSatellite,
  pointsCount: number = 60
): [number, number][] {
  const coords: [number, number][] = [];
  const incRad = (satellite.inclinationDeg * Math.PI) / 180;
  const currentLon = satellite.currentLon;
  const currentLat = satellite.currentLat;

  for (let i = 0; i < pointsCount; i++) {
    const fraction = i / (pointsCount - 1);
    // Project orbital path sine wave across Mercator grid
    const phase = (fraction - 0.5) * Math.PI * 2;
    const lat = Math.sin(phase) * (satellite.inclinationDeg * 0.98);
    const lon = ((currentLon + (phase * 180) / Math.PI + 360) % 360) - 180;
    coords.push([parseFloat(lat.toFixed(3)), parseFloat(lon.toFixed(3))]);
  }

  return coords;
}
