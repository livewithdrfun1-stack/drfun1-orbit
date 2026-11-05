/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 * Leaflet Interactive Global Satellite Tracker, Orbit Propagation & Pass Radar
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  TrackedSatellite,
  ObserverStation,
  SatellitePassPrediction,
  SkyTrackPoint
} from '../types/satellitePass';
import {
  DEFAULT_TRACKED_SATELLITES,
  OBSERVER_STATIONS,
  calculateSatellitePasses,
  computeGroundTrackCoordinates,
  computeSolarTerminatorPolygon,
  calculateGroundStationLink,
  azimuthToCompass
} from '../data/satellitePassData';
import {
  Satellite,
  Compass,
  Radio,
  Clock,
  Globe,
  Activity,
  Layers,
  MapPin,
  Eye,
  RefreshCw,
  Search,
  Filter,
  Maximize2,
  Calendar,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Zap,
  Info,
  Server,
  Sun,
  Moon,
  Play,
  Pause,
  FastForward,
  Wifi,
  Crosshair,
  Sliders
} from 'lucide-react';

export type MapTileTheme = 'dark' | 'satellite' | 'streets';

interface LeafletSatelliteTrackerProps {
  onOpenLicense?: () => void;
  onOpenSwitchMesh?: () => void;
  onSelectConstellationCompany?: (companyName: string) => void;
  isModalView?: boolean;
}

export const LeafletSatelliteTracker: React.FC<LeafletSatelliteTrackerProps> = ({
  onOpenLicense,
  onOpenSwitchMesh,
  onSelectConstellationCompany,
  isModalView = false
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const layersGroupRef = useRef<L.LayerGroup | null>(null);

  // Active Satellite and Observer Selection
  const [satellites, setSatellites] = useState<TrackedSatellite[]>(DEFAULT_TRACKED_SATELLITES);
  const [selectedSatelliteId, setSelectedSatelliteId] = useState<string>('iss_zarya');
  const [selectedObserverId, setSelectedObserverId] = useState<string>('switch_lasvegas');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Map Feature Toggles
  const [tileTheme, setTileTheme] = useState<MapTileTheme>('dark');
  const [showTerminator, setShowTerminator] = useState<boolean>(true);
  const [showGroundLink, setShowGroundLink] = useState<boolean>(true);
  const [showAllFootprints, setShowAllFootprints] = useState<boolean>(false);
  const [showOrbitTracks, setShowOrbitTracks] = useState<boolean>(true);

  // Orbit Simulation Controls
  const [isSimPaused, setIsSimPaused] = useState<boolean>(false);
  const [simSpeed, setSimSpeed] = useState<number>(1); // 1x, 5x, 15x, 60x
  const [isLiveAutoTracking, setIsLiveAutoTracking] = useState<boolean>(true);
  const [simulationTick, setSimulationTick] = useState<number>(0);

  // Pass Predictions State
  const [activePassPrediction, setActivePassPrediction] = useState<SatellitePassPrediction | null>(null);
  const [countdownString, setCountdownString] = useState<string>('00:14:28');

  const selectedSatellite = useMemo(() => {
    return satellites.find(s => s.id === selectedSatelliteId) || satellites[0];
  }, [satellites, selectedSatelliteId]);

  const selectedObserver = useMemo(() => {
    return OBSERVER_STATIONS.find(o => o.id === selectedObserverId) || OBSERVER_STATIONS[0];
  }, [selectedObserverId]);

  // Compute Ground Link Real-Time Parameters
  const groundLinkInfo = useMemo(() => {
    return calculateGroundStationLink(selectedObserver, selectedSatellite);
  }, [selectedObserver, selectedSatellite]);

  // Compute Passes for Selected Satellite & Observer
  const passPredictions = useMemo(() => {
    return calculateSatellitePasses(selectedSatellite, selectedObserver);
  }, [selectedSatellite, selectedObserver]);

  // Set default active pass
  useEffect(() => {
    if (passPredictions.length > 0) {
      setActivePassPrediction(passPredictions[0]);
    } else {
      setActivePassPrediction(null);
    }
  }, [passPredictions]);

  // Live Position Orbit Propagation Simulation
  useEffect(() => {
    if (isSimPaused) return;

    const intervalMs = 1500;
    const timer = setInterval(() => {
      setSimulationTick(prev => prev + 1);

      setSatellites(prev =>
        prev.map(sat => {
          if (sat.orbitType === 'GEO') return sat; // GEO stays fixed at assigned slot

          // Propagate orbit based on simulation speed multiplier
          const stepMultiplier = simSpeed;
          const lonStep = (360 / (sat.periodMinutes * 60)) * (1.5 * stepMultiplier);
          const nextLon = ((sat.currentLon + lonStep + 180) % 360) - 180;
          
          // Phase shift for inclination oscillation
          const phase = (Date.now() / 1000 / (sat.periodMinutes * 60)) * Math.PI * 2 * (1 + (stepMultiplier - 1) * 0.1);
          const nextLat = Math.sin(phase) * sat.inclinationDeg;

          return {
            ...sat,
            currentLat: parseFloat(nextLat.toFixed(3)),
            currentLon: parseFloat(nextLon.toFixed(3))
          };
        })
      );
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isSimPaused, simSpeed]);

  // Pass Countdown Timer
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const targetSeconds = 14 * 60 + 28 - (now.getSeconds() % 60);
      const m = Math.floor(targetSeconds / 60);
      const s = targetSeconds % 60;
      setCountdownString(`00:${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Invalidate Map Size on resize or modal opening
  useEffect(() => {
    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };
    const timer = setTimeout(handleResize, 350);
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Tile Layer Definition Helper
  const getTileConfig = (theme: MapTileTheme) => {
    switch (theme) {
      case 'satellite':
        return {
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          options: {
            maxZoom: 18,
            attribution: 'Esri, Maxar, Earthstar Geographics'
          }
        };
      case 'streets':
        return {
          url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
          options: {
            maxZoom: 19,
            subdomains: 'abcd',
            attribution: '&copy; CartoDB &copy; OpenStreetMap'
          }
        };
      case 'dark':
      default:
        return {
          url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
          options: {
            maxZoom: 19,
            subdomains: 'abcd',
            attribution: '&copy; CartoDB &copy; OpenStreetMap'
          }
        };
    }
  };

  // Switch Tile Layer when tileTheme changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const { url, options } = getTileConfig(tileTheme);
    const newLayer = L.tileLayer(url, options).addTo(map);
    tileLayerRef.current = newLayer;
  }, [tileTheme]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [selectedSatellite.currentLat, selectedSatellite.currentLon],
        zoom: 2.5,
        minZoom: 1.5,
        maxZoom: 11,
        worldCopyJump: true,
        zoomControl: false,
        attributionControl: false
      });

      // Add Zoom Control at top right
      L.control.zoom({ position: 'topright' }).addTo(map);

      const { url, options } = getTileConfig(tileTheme);
      tileLayerRef.current = L.tileLayer(url, options).addTo(map);
      layersGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const layersGroup = layersGroupRef.current;
    if (!map || !layersGroup) return;

    layersGroup.clearLayers();

    // 1. Render Solar Day / Night Terminator Polygon
    if (showTerminator) {
      const terminatorPolygon = computeSolarTerminatorPolygon(new Date());
      L.polygon(terminatorPolygon, {
        color: '#f59e0b',
        weight: 1.5,
        opacity: 0.65,
        dashArray: '4, 6',
        fillColor: '#000814',
        fillOpacity: tileTheme === 'satellite' ? 0.45 : 0.35,
        interactive: false
      }).addTo(layersGroup);
    }

    // 2. Render Observer Station Marker (Teleport Pin)
    const obsIcon = L.divIcon({
      className: 'custom-observer-pin',
      html: `
        <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer;">
          <div style="
            width: 16px; 
            height: 16px; 
            border-radius: 50%; 
            background: #10b981; 
            border: 2px solid #ffffff; 
            box-shadow: 0 0 14px rgba(16, 185, 129, 0.95);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="width: 5px; height: 5px; border-radius: 50%; background: #ffffff;"></div>
          </div>
          <span style="
            background: rgba(15, 23, 42, 0.95); 
            color: #a7f3d0; 
            font-family: ui-monospace, monospace; 
            font-size: 10px; 
            font-weight: 700; 
            padding: 2px 7px; 
            border-radius: 5px; 
            border: 1px solid #059669; 
            margin-top: 4px; 
            white-space: nowrap;
            box-shadow: 0 4px 10px rgba(0,0,0,0.5);
          ">
            📍 ${selectedObserver.name.split(' ')[0]} Teleport
          </span>
        </div>
      `,
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    });

    L.marker([selectedObserver.lat, selectedObserver.lon], { icon: obsIcon })
      .bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; color: #0f172a; padding: 2px;">
          <strong style="font-size: 13px; color: #047857;">${selectedObserver.name}</strong><br/>
          <span>Location: ${selectedObserver.location}</span><br/>
          <span>Elevation: ${selectedObserver.elevationM}m MSL</span><br/>
          <span>Coordinates: ${selectedObserver.lat.toFixed(3)}°N, ${selectedObserver.lon.toFixed(3)}°E</span>
        </div>
      `)
      .addTo(layersGroup);

    // 3. Render Ground Station to Satellite Uplink / Downlink Beam
    if (showGroundLink) {
      const isDirectSight = groundLinkInfo.isInFootprint;
      const beamCoords: [number, number][] = [
        [selectedObserver.lat, selectedObserver.lon],
        [selectedSatellite.currentLat, selectedSatellite.currentLon]
      ];

      L.polyline(beamCoords, {
        color: isDirectSight ? '#10b981' : '#64748b',
        weight: isDirectSight ? 3 : 1.5,
        opacity: isDirectSight ? 0.9 : 0.45,
        dashArray: isDirectSight ? '6, 6' : '3, 6'
      }).addTo(layersGroup);
    }

    // 4. Draw Orbit Ground Track Polyline for Selected Satellite
    if (showOrbitTracks) {
      const trackCoords = computeGroundTrackCoordinates(selectedSatellite, 90);
      L.polyline(trackCoords, {
        color: selectedSatellite.color,
        weight: 2.2,
        opacity: 0.8,
        dashArray: '6, 8'
      }).addTo(layersGroup);
    }

    // 5. Draw Footprints (Selected only OR All active constellations)
    if (showAllFootprints) {
      satellites.forEach(sat => {
        const isSel = sat.id === selectedSatellite.id;
        L.circle([sat.currentLat, sat.currentLon], {
          radius: sat.footprintRadiusKm * 1000,
          color: sat.color,
          fillColor: sat.color,
          fillOpacity: isSel ? 0.16 : 0.05,
          weight: isSel ? 1.8 : 0.8
        }).addTo(layersGroup);
      });
    } else {
      L.circle([selectedSatellite.currentLat, selectedSatellite.currentLon], {
        radius: selectedSatellite.footprintRadiusKm * 1000,
        color: selectedSatellite.color,
        fillColor: selectedSatellite.color,
        fillOpacity: 0.15,
        weight: 1.8
      }).addTo(layersGroup);
    }

    // 6. Render Satellite Markers with Interactive Pins
    satellites.forEach(sat => {
      const isSelected = sat.id === selectedSatellite.id;
      const satIcon = L.divIcon({
        className: 'custom-sat-marker',
        html: `
          <div style="position: relative; cursor: pointer; display: flex; flex-direction: column; align-items: center;">
            <div style="
              width: ${isSelected ? '24px' : '18px'};
              height: ${isSelected ? '24px' : '18px'};
              border-radius: 50%;
              background: ${sat.color};
              border: 2px solid #ffffff;
              box-shadow: 0 0 ${isSelected ? '20px' : '9px'} ${sat.color};
              display: flex;
              align-items: center;
              justify-content: center;
              transition: transform 0.2s ease;
            ">
              <span style="font-size: ${isSelected ? '12px' : '9px'};">🛰️</span>
            </div>
            ${isSelected ? `
              <div style="
                background: rgba(2, 6, 23, 0.95);
                color: #ffffff;
                font-family: ui-monospace, monospace;
                font-size: 11px;
                font-weight: 700;
                padding: 3px 8px;
                border-radius: 6px;
                border: 1px solid ${sat.color};
                margin-top: 4px;
                white-space: nowrap;
                box-shadow: 0 4px 14px rgba(0,0,0,0.7);
              ">
                ${sat.name}
              </div>
            ` : ''}
          </div>
        `,
        iconSize: [isSelected ? 30 : 22, isSelected ? 30 : 22],
        iconAnchor: [isSelected ? 15 : 11, isSelected ? 15 : 11]
      });

      const marker = L.marker([sat.currentLat, sat.currentLon], { icon: satIcon })
        .addTo(layersGroup);

      marker.on('click', () => {
        setSelectedSatelliteId(sat.id);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.panTo([sat.currentLat, sat.currentLon], { animate: true, duration: 0.8 });
        }
      });
    });

    // Auto-center on selected satellite if enabled
    if (isLiveAutoTracking) {
      map.panTo([selectedSatellite.currentLat, selectedSatellite.currentLon], { animate: true, duration: 0.6 });
    }
  }, [
    selectedSatellite,
    selectedObserver,
    satellites,
    showTerminator,
    showGroundLink,
    showAllFootprints,
    showOrbitTracks,
    isLiveAutoTracking,
    groundLinkInfo,
    tileTheme
  ]);

  // Filtered Satellites for Catalog Picker
  const filteredSatellites = useMemo(() => {
    return satellites.filter(s => {
      const matchCat = selectedCategory === 'All' || s.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q ||
        s.name.toLowerCase().includes(q) ||
        s.operator.toLowerCase().includes(q) ||
        s.noradId.toString().includes(q);
      return matchCat && matchSearch;
    });
  }, [satellites, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6">

      {/* ========================================================
          BANNER: ORBIT TRACKING MAP SUITE & TELEMETRY
          ======================================================== */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/80 border border-slate-800 p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[11px] font-mono font-bold flex items-center space-x-1.5">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>Orbit Tracking Map</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-mono font-semibold flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live SGP4 Orbit Propagation Engine</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 text-[11px] font-mono">
                FCC FRN #0034981290
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-mono">
                Solar Day/Night Terminator
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
              <span>Real-Time Orbit Tracking Map &amp; Celestial Ground Radar</span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Global multi-constellation orbital tracker with live day/night solar terminator shadow, ground station slant-range line-of-sight vectors for Switch SUPERNAP &amp; DSN teleports, Keplerian ground track projection, and celestial dome pass radar.
            </p>
          </div>

          {/* Real-Time Link Telemetry Pod */}
          <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 shrink-0 lg:w-76 space-y-2.5 shadow-2xl">
            <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-800/80">
              <span className="text-slate-400 font-medium">Ground Link Status:</span>
              <span className={`font-mono font-bold px-2 py-0.5 rounded text-[10px] ${
                groundLinkInfo.isInFootprint
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse'
                  : 'bg-slate-800 text-slate-400'
              }`}>
                {groundLinkInfo.isInFootprint ? '● IN FOOTPRINT' : '○ BELOW HORIZON'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div>
                <span className="text-slate-500 block text-[10px]">SLANT RANGE</span>
                <span className="text-white font-bold">{groundLinkInfo.distanceKm.toLocaleString()} km</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">RF DELAY (1-WAY)</span>
                <span className="text-cyan-300 font-bold">{groundLinkInfo.propagationDelayMs} ms</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">ELEVATION</span>
                <span className={groundLinkInfo.elevationDeg > 0 ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                  {groundLinkInfo.elevationDeg}°
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">AZIMUTH</span>
                <span className="text-slate-200 font-bold">{groundLinkInfo.azimuthDeg}° ({azimuthToCompass(groundLinkInfo.azimuthDeg)})</span>
              </div>
            </div>

            <div className="pt-1 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>Next Pass (AOS):</span>
              <span className="text-emerald-400 font-bold">{countdownString}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          TWO-COLUMN MAIN WORKSTATION:
          LEFT: INTERACTIVE ORBIT MAP (7 COLS)
          RIGHT: PASS PREDICTIONS & POLAR RADAR (5 COLS)
          ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN: MAP & SATELLITE PICKER */}
        <div className="lg:col-span-7 space-y-4">

          {/* Interactive Map Toolbar */}
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-2.5 text-xs">
            
            {/* Basemap Tile Switcher */}
            <div className="flex items-center space-x-1.5">
              <span className="text-slate-400 font-mono text-[11px] flex items-center space-x-1">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Layer:</span>
              </span>
              <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                <button
                  onClick={() => setTileTheme('dark')}
                  className={`px-2 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
                    tileTheme === 'dark' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                  title="CartoDB Dark Matter (High Contrast Night)"
                >
                  Dark Space
                </button>
                <button
                  onClick={() => setTileTheme('satellite')}
                  className={`px-2 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
                    tileTheme === 'satellite' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Esri Photorealistic Satellite Imagery"
                >
                  Earth Imagery
                </button>
                <button
                  onClick={() => setTileTheme('streets')}
                  className={`px-2 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
                    tileTheme === 'streets' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                  title="CartoDB Voyager Streets"
                >
                  Terrain
                </button>
              </div>
            </div>

            {/* Orbit Simulation Time Warp Controls */}
            <div className="flex items-center space-x-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
              <button
                onClick={() => setIsSimPaused(!isSimPaused)}
                className={`p-1.5 rounded transition cursor-pointer ${
                  isSimPaused ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title={isSimPaused ? 'Resume Simulation' : 'Pause Simulation'}
              >
                {isSimPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
              </button>

              {[1, 5, 15, 60].map(multiplier => (
                <button
                  key={multiplier}
                  onClick={() => {
                    setSimSpeed(multiplier);
                    if (isSimPaused) setIsSimPaused(false);
                  }}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition cursor-pointer ${
                    simSpeed === multiplier && !isSimPaused
                      ? 'bg-purple-600 text-white font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title={`${multiplier}x Orbital Speed Multiplier`}
                >
                  {multiplier}x
                </button>
              ))}
            </div>

            {/* Layer Overlay Toggles */}
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setShowTerminator(!showTerminator)}
                className={`px-2 py-1 rounded-lg text-[11px] font-medium flex items-center space-x-1 transition cursor-pointer ${
                  showTerminator
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
                title="Toggle Solar Day/Night Terminator Curve"
              >
                <Sun className="w-3 h-3 text-amber-400" />
                <span className="hidden sm:inline">Terminator</span>
              </button>

              <button
                onClick={() => setShowGroundLink(!showGroundLink)}
                className={`px-2 py-1 rounded-lg text-[11px] font-medium flex items-center space-x-1 transition cursor-pointer ${
                  showGroundLink
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
                title="Toggle Observer Teleport Uplink/Downlink Vector"
              >
                <Radio className="w-3 h-3 text-emerald-400" />
                <span className="hidden sm:inline">Uplink</span>
              </button>

              <button
                onClick={() => setShowAllFootprints(!showAllFootprints)}
                className={`px-2 py-1 rounded-lg text-[11px] font-medium flex items-center space-x-1 transition cursor-pointer ${
                  showAllFootprints
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
                title="Toggle Visibility Footprint Circles for All Constellations"
              >
                <Eye className="w-3 h-3 text-indigo-400" />
                <span className="hidden sm:inline">All Cones</span>
              </button>
            </div>

            {/* Centering Quick Actions */}
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setIsLiveAutoTracking(!isLiveAutoTracking)}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition cursor-pointer ${
                  isLiveAutoTracking
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
                title={isLiveAutoTracking ? 'Auto-Centering Satellite (Click to release free pan)' : 'Free Pan Mode (Click to lock on satellite)'}
              >
                <Crosshair className={`w-3.5 h-3.5 ${isLiveAutoTracking ? 'text-cyan-400' : ''}`} />
              </button>

              <button
                onClick={() => {
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.setView([selectedObserver.lat, selectedObserver.lon], 4);
                  }
                }}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                title="Center on Observer Ground Teleport"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              </button>

              <button
                onClick={() => {
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.setView([20, 0], 2);
                  }
                }}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                title="Reset Global World View"
              >
                <Globe className="w-3.5 h-3.5 text-sky-400" />
              </button>
            </div>

          </div>

          {/* Leaflet Map Canvas Container */}
          <div className="relative rounded-2xl border border-slate-800 overflow-hidden shadow-2xl bg-slate-950">
            <div
              ref={mapContainerRef}
              className={`w-full ${isModalView ? 'h-[540px]' : 'h-[460px] sm:h-[520px]'} z-10`}
              style={{ background: '#020617' }}
            />

            {/* In-Map Telemetry HUD Overlay (Bottom-Left) */}
            <div className="absolute bottom-4 left-4 z-20 bg-slate-950/92 backdrop-blur-md border border-slate-800 p-3.5 rounded-xl text-xs font-mono space-y-1.5 shadow-2xl max-w-xs border-l-4 border-l-cyan-500">
              <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between pb-1 border-b border-slate-800">
                <span className="flex items-center space-x-1.5 text-cyan-300 font-bold">
                  <Satellite className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{selectedSatellite.name}</span>
                </span>
                <span className="text-emerald-400">NORAD #{selectedSatellite.noradId}</span>
              </div>
              <div className="flex justify-between text-slate-300 text-[11px]">
                <span className="text-slate-500">Sub-Satellite Lat/Lon:</span>
                <span className="text-cyan-300 font-bold">{selectedSatellite.currentLat}° / {selectedSatellite.currentLon}°</span>
              </div>
              <div className="flex justify-between text-slate-300 text-[11px]">
                <span className="text-slate-500">Altitude / Speed:</span>
                <span>{selectedSatellite.altitudeKm} km · {selectedSatellite.velocityKmS} km/s</span>
              </div>
              <div className="flex justify-between text-slate-300 text-[11px]">
                <span className="text-slate-500">Footprint Diameter:</span>
                <span className="text-purple-300">{selectedSatellite.footprintRadiusKm * 2} km</span>
              </div>
              <div className="flex justify-between text-slate-300 text-[11px]">
                <span className="text-slate-500">Downlink Carrier:</span>
                <span className="text-amber-300">{selectedSatellite.downlinkFreqMHz} MHz</span>
              </div>
              <div className="flex justify-between text-slate-300 text-[11px] pt-1 border-t border-slate-800/80">
                <span className="text-slate-500">Teleport Uplink:</span>
                <span className={groundLinkInfo.isInFootprint ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                  {groundLinkInfo.isInFootprint ? `Active (${groundLinkInfo.propagationDelayMs}ms)` : 'Out of Line-of-Sight'}
                </span>
              </div>
            </div>

            {/* In-Map Mission Simulation Status Badge (Top-Left) */}
            <div className="absolute top-4 left-4 z-20 flex items-center space-x-2 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[11px] font-mono shadow-lg">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isSimPaused ? 'bg-amber-400' : 'bg-emerald-400'} opacity-75`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isSimPaused ? 'bg-amber-500' : 'bg-emerald-500'}`} />
              </span>
              <span className="text-white font-bold">{isSimPaused ? 'SIM PAUSED' : `SIMULATING (${simSpeed}x)`}</span>
              <span className="text-slate-500">·</span>
              <span className="text-cyan-400">{selectedObserver.name.split(' ')[0]} Teleport</span>
            </div>
          </div>

          {/* Satellite Selection Strip */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <span className="font-bold text-white flex items-center space-x-1.5">
                <Satellite className="w-4 h-4 text-cyan-400" />
                <span>Select Satellite to Track &amp; Project Pass:</span>
              </span>

              {/* Filter Categories */}
              <div className="flex items-center space-x-1 overflow-x-auto pb-1 custom-nav-scrollbar">
                {['All', 'Space Stations', 'LEO Broadband', 'Scientific & Weather', 'Direct Broadcast (DBS)', 'Navigation'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold whitespace-nowrap transition cursor-pointer ${
                      selectedCategory === cat ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input for Satellite Catalog */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search satellite name, operator, or NORAD catalog ID..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Satellite Grid Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto custom-nav-scrollbar pr-1">
              {filteredSatellites.map(sat => {
                const isSelected = sat.id === selectedSatellite.id;
                return (
                  <button
                    key={sat.id}
                    onClick={() => {
                      setSelectedSatelliteId(sat.id);
                      if (mapInstanceRef.current) {
                        mapInstanceRef.current.panTo([sat.currentLat, sat.currentLon], { animate: true, duration: 0.8 });
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-cyan-950/50 border-cyan-500 shadow-md ring-1 ring-cyan-500/40'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: sat.color }} />
                        <span className="text-[10px] font-mono text-slate-500">#{sat.noradId}</span>
                      </div>
                      <div className="text-xs font-bold text-white truncate mt-1">{sat.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{sat.operator}</div>
                    </div>
                    <div className="text-[10px] font-mono text-cyan-300 mt-2 flex items-center justify-between">
                      <span>{sat.orbitType}</span>
                      <span>{sat.altitudeKm} km</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: PASS PREDICTIONS & POLAR CELESTIAL RADAR */}
        <div className="lg:col-span-5 space-y-5">

          {/* Observer Station Picker Card */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>Observer Ground Station Teleport</span>
              </span>
              <span className="text-[11px] font-mono text-emerald-400">
                {selectedObserver.lat.toFixed(2)}°N, {selectedObserver.lon.toFixed(2)}°E
              </span>
            </div>

            <select
              value={selectedObserverId}
              onChange={e => setSelectedObserverId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              {OBSERVER_STATIONS.map(obs => (
                <option key={obs.id} value={obs.id}>
                  {obs.name} ({obs.location})
                </option>
              ))}
            </select>
          </div>

          {/* Interactive Celestial Sky Dome Polar Radar */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
              <span className="font-bold text-white flex items-center space-x-1.5">
                <Compass className="w-4 h-4 text-cyan-400" />
                <span>Celestial Sky Dome Polar Track Radar</span>
              </span>
              <span className="text-slate-400 font-mono text-[11px]">
                Max El: <strong className="text-emerald-400">{activePassPrediction?.maxElevationDeg || 0}°</strong>
              </span>
            </div>

            {/* Radar Canvas Emulation */}
            <div className="relative w-full h-56 sm:h-64 flex items-center justify-center bg-slate-900/60 rounded-xl border border-slate-800/80 overflow-hidden">
              {/* Polar Radar Concentric Elevation Rings (0°, 30°, 60°, 90° zenith) */}
              <div className="absolute w-48 h-48 sm:w-56 sm:h-56 rounded-full border border-slate-800" />
              <div className="absolute w-32 h-32 sm:w-40 sm:h-40 rounded-full border border-slate-800/80 border-dashed" />
              <div className="absolute w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-cyan-500/30" />
              <div className="absolute w-1.5 h-1.5 rounded-full bg-cyan-400" /> {/* Zenith */}

              {/* Crosshairs */}
              <div className="absolute inset-x-0 top-1/2 h-px bg-slate-800" />
              <div className="absolute inset-y-0 left-1/2 w-px bg-slate-800" />

              {/* Compass Labels */}
              <span className="absolute top-2 font-mono text-[10px] font-bold text-slate-400">N (0°)</span>
              <span className="absolute bottom-2 font-mono text-[10px] font-bold text-slate-400">S (180°)</span>
              <span className="absolute right-2 font-mono text-[10px] font-bold text-slate-400">E (90°)</span>
              <span className="absolute left-2 font-mono text-[10px] font-bold text-slate-400">W (270°)</span>

              {/* SVG Polar Arc of the Satellite Pass */}
              {activePassPrediction && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  {/* Trajectory path */}
                  <path
                    d={activePassPrediction.skyTrackPoints.reduce((acc, pt, i) => {
                      const rad = (pt.azimuthDeg - 90) * (Math.PI / 180);
                      const rScale = ((90 - pt.elevationDeg) / 90) * 42;
                      const cx = 50 + rScale * Math.cos(rad);
                      const cy = 50 + rScale * Math.sin(rad);
                      return i === 0 ? `M ${cx}% ${cy}%` : `${acc} L ${cx}% ${cy}%`;
                    }, '')}
                    fill="none"
                    stroke={selectedSatellite.color}
                    strokeWidth="2.5"
                    strokeDasharray="4, 4"
                  />
                  {/* Point markers for AOS, TCA, LOS */}
                  {activePassPrediction.skyTrackPoints.map((pt, idx) => {
                    const rad = (pt.azimuthDeg - 90) * (Math.PI / 180);
                    const rScale = ((90 - pt.elevationDeg) / 90) * 42;
                    const cx = 50 + rScale * Math.cos(rad);
                    const cy = 50 + rScale * Math.sin(rad);
                    const isPeak = pt.elevationDeg === activePassPrediction.maxElevationDeg;
                    const isAos = idx === 0;
                    const isLos = idx === activePassPrediction.skyTrackPoints.length - 1;

                    if (!isPeak && !isAos && !isLos) return null;

                    return (
                      <circle
                        key={idx}
                        cx={`${cx}%`}
                        cy={`${cy}%`}
                        r={isPeak ? 5 : 3.5}
                        fill={isPeak ? '#10b981' : isAos ? '#38bdf8' : '#f59e0b'}
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                    );
                  })}
                </svg>
              )}

              {/* Legend overlay */}
              <div className="absolute bottom-2 left-2 flex items-center space-x-2 text-[10px] font-mono bg-slate-950/80 px-2 py-1 rounded border border-slate-800">
                <span className="text-sky-400">● Rise</span>
                <span className="text-emerald-400">● Peak (TCA)</span>
                <span className="text-amber-400">● Set</span>
              </div>
            </div>

            {/* Active Pass Trajectory Metrics */}
            {activePassPrediction && (
              <div className="grid grid-cols-3 gap-2 text-xs font-mono bg-slate-900 p-3 rounded-xl border border-slate-800 text-center">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Acquisition (AOS)</span>
                  <span className="text-sky-300 font-bold">{activePassPrediction.aosTime}</span>
                  <span className="text-[10px] text-slate-400 block">{activePassPrediction.aosCompass} ({activePassPrediction.aosAzimuthDeg}°)</span>
                </div>
                <div className="border-x border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">Max Elevation</span>
                  <span className="text-emerald-400 font-bold text-sm">{activePassPrediction.maxElevationDeg}°</span>
                  <span className="text-[10px] text-slate-400 block">{activePassPrediction.tcaTime}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Loss of Signal (LOS)</span>
                  <span className="text-amber-300 font-bold">{activePassPrediction.losTime}</span>
                  <span className="text-[10px] text-slate-400 block">{activePassPrediction.losCompass} ({activePassPrediction.losAzimuthDeg}°)</span>
                </div>
              </div>
            )}
          </div>

          {/* Upcoming Passes Table */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 shadow-lg">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center space-x-1.5">
                <Calendar className="w-4 h-4 text-purple-400" />
                <span>Upcoming Pass Predictions (Next 24h)</span>
              </span>
              <span className="text-slate-400 font-mono text-[11px]">{passPredictions.length} passes calculated</span>
            </div>

            {selectedSatellite.orbitType === 'GEO' ? (
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-2 text-xs">
                <Info className="w-5 h-5 text-amber-400 mx-auto" />
                <div className="font-bold text-white">Geostationary Satellite (GEO)</div>
                <p className="text-slate-400 text-[11px]">
                  {selectedSatellite.name} is in geostationary orbit at 35,786 km and maintains a fixed sky azimuth and elevation relative to {selectedObserver.name}. Pass events are not applicable.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {passPredictions.map((pass, idx) => {
                  const isSelected = activePassPrediction?.id === pass.id;
                  return (
                    <div
                      key={pass.id}
                      onClick={() => setActivePassPrediction(pass)}
                      className={`p-3 rounded-xl border text-xs transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-purple-950/40 border-purple-500 shadow-md ring-1 ring-purple-500/40'
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white font-mono">Pass #{idx + 1}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300 font-mono">
                            {pass.visibility}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-300 font-mono">
                          {pass.aosTime} → {pass.losTime} ({Math.round(pass.durationSeconds / 60)} min)
                        </div>
                      </div>

                      <div className="text-right space-y-0.5">
                        <div className="font-bold font-mono text-emerald-400 text-sm">
                          {pass.maxElevationDeg}° El
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Doppler: ±{pass.maxDopplerShiftKHz} kHz
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
