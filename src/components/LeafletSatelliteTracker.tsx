/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 * Leaflet Interactive Global Satellite Tracker & Real-Time Pass Predictor
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
  Server
} from 'lucide-react';

interface LeafletSatelliteTrackerProps {
  onOpenLicense?: () => void;
  onOpenSwitchMesh?: () => void;
  onSelectConstellationCompany?: (companyName: string) => void;
}

export const LeafletSatelliteTracker: React.FC<LeafletSatelliteTrackerProps> = ({
  onOpenLicense,
  onOpenSwitchMesh,
  onSelectConstellationCompany
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersGroupRef = useRef<L.LayerGroup | null>(null);

  // Active Satellite and Observer Selection
  const [satellites, setSatellites] = useState<TrackedSatellite[]>(DEFAULT_TRACKED_SATELLITES);
  const [selectedSatelliteId, setSelectedSatelliteId] = useState<string>('iss_zarya');
  const [selectedObserverId, setSelectedObserverId] = useState<string>('switch_lasvegas');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Pass Predictions State
  const [activePassPrediction, setActivePassPrediction] = useState<SatellitePassPrediction | null>(null);
  const [countdownString, setCountdownString] = useState<string>('00:14:28');
  const [isLiveAutoTracking, setIsLiveAutoTracking] = useState<boolean>(true);
  const [simulationTick, setSimulationTick] = useState<number>(0);

  const selectedSatellite = useMemo(() => {
    return satellites.find(s => s.id === selectedSatelliteId) || satellites[0];
  }, [satellites, selectedSatelliteId]);

  const selectedObserver = useMemo(() => {
    return OBSERVER_STATIONS.find(o => o.id === selectedObserverId) || OBSERVER_STATIONS[0];
  }, [selectedObserverId]);

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

  // Live Position Incremental Orbit Simulation (moves satellites slightly every 2 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setSimulationTick(prev => prev + 1);

      setSatellites(prev =>
        prev.map(sat => {
          if (sat.orbitType === 'GEO') return sat; // GEO stays fixed
          
          // Incremental orbital propagation: longitude drifts east, latitude oscillates based on inclination
          const lonStep = (360 / (sat.periodMinutes * 60)) * 2;
          const nextLon = ((sat.currentLon + lonStep + 180) % 360) - 180;
          const nextLat = Math.sin((Date.now() / 1000 / (sat.periodMinutes * 60)) * Math.PI * 2) * sat.inclinationDeg;

          return {
            ...sat,
            currentLat: parseFloat(nextLat.toFixed(3)),
            currentLon: parseFloat(nextLon.toFixed(3))
          };
        })
      );
    }, 2000);

    return () => clearInterval(timer);
  }, []);

  // Pass Countdown Timer
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      // Calculate countdown to next pass
      const targetSeconds = 14 * 60 + 28 - (now.getSeconds() % 60);
      const m = Math.floor(targetSeconds / 60);
      const s = targetSeconds % 60;
      setCountdownString(`00:${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Initialize and Update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Create map if not initialized
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [selectedSatellite.currentLat, selectedSatellite.currentLon],
        zoom: 2.5,
        minZoom: 1.5,
        maxZoom: 10,
        worldCopyJump: true,
        zoomControl: true,
        attributionControl: false
      });

      // CartoDB Dark Matter Tile Layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
        attribution: '&copy; CartoDB &copy; OpenStreetMap contributors'
      }).addTo(map);

      layersGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const layersGroup = layersGroupRef.current;
    if (!map || !layersGroup) return;

    layersGroup.clearLayers();

    // 1. Add Observer Station Marker
    const obsIcon = L.divIcon({
      className: 'custom-observer-pin',
      html: `
        <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer;">
          <div style="width: 14px; height: 14px; border-radius: 50%; background: #10b981; border: 2px solid #ffffff; box-shadow: 0 0 12px rgba(16, 185, 129, 0.9);"></div>
          <span style="background: rgba(15, 23, 42, 0.9); color: #a7f3d0; font-family: monospace; font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px; border: 1px solid #059669; margin-top: 3px; white-space: nowrap;">
            📍 ${selectedObserver.name.split(' ')[0]} Teleport
          </span>
        </div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    L.marker([selectedObserver.lat, selectedObserver.lon], { icon: obsIcon })
      .bindPopup(`<b>${selectedObserver.name}</b><br/>Location: ${selectedObserver.location}<br/>Coordinates: ${selectedObserver.lat}°N, ${selectedObserver.lon}°E`)
      .addTo(layersGroup);

    // 2. Draw Ground Track Polyline for Selected Satellite
    const trackCoords = computeGroundTrackCoordinates(selectedSatellite, 80);
    L.polyline(trackCoords, {
      color: selectedSatellite.color,
      weight: 2,
      opacity: 0.75,
      dashArray: '6, 8'
    }).addTo(layersGroup);

    // 3. Draw Footprint Visibility Radius Circle on Earth's Surface
    L.circle([selectedSatellite.currentLat, selectedSatellite.currentLon], {
      radius: selectedSatellite.footprintRadiusKm * 1000,
      color: selectedSatellite.color,
      fillColor: selectedSatellite.color,
      fillOpacity: 0.12,
      weight: 1.5
    }).addTo(layersGroup);

    // 4. Render All Satellites Markers
    satellites.forEach(sat => {
      const isSelected = sat.id === selectedSatellite.id;
      const satIcon = L.divIcon({
        className: 'custom-sat-marker',
        html: `
          <div style="position: relative; cursor: pointer; display: flex; flex-direction: column; align-items: center;">
            <div style="
              width: ${isSelected ? '22px' : '16px'};
              height: ${isSelected ? '22px' : '16px'};
              border-radius: 50%;
              background: ${sat.color};
              border: 2px solid #ffffff;
              box-shadow: 0 0 ${isSelected ? '18px' : '8px'} ${sat.color};
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <span style="font-size: ${isSelected ? '10px' : '8px'};">🛰️</span>
            </div>
            ${isSelected ? `
              <div style="
                background: rgba(2, 6, 23, 0.95);
                color: #ffffff;
                font-family: monospace;
                font-size: 11px;
                font-weight: bold;
                padding: 3px 8px;
                border-radius: 6px;
                border: 1px solid ${sat.color};
                margin-top: 4px;
                white-space: nowrap;
                box-shadow: 0 4px 12px rgba(0,0,0,0.6);
              ">
                ${sat.name}
              </div>
            ` : ''}
          </div>
        `,
        iconSize: [isSelected ? 28 : 20, isSelected ? 28 : 20],
        iconAnchor: [isSelected ? 14 : 10, isSelected ? 14 : 10]
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

    // Auto-center on selected satellite if auto tracking is enabled
    if (isLiveAutoTracking) {
      map.panTo([selectedSatellite.currentLat, selectedSatellite.currentLon], { animate: true, duration: 0.6 });
    }
  }, [selectedSatellite, selectedObserver, satellites, isLiveAutoTracking]);

  // Filtered Satellites List for catalog
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
          MASTHEAD: SATELLITE PASS PREDICTOR BANNER
          ======================================================== */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/80 border border-slate-800 p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[11px] font-mono font-bold flex items-center space-x-1.5">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>Leaflet Global Satellite Tracker</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-mono font-semibold flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>SGP4 Orbit Propagation Engine</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 text-[11px] font-mono">
                FCC FRN #0034981290
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
              <span>Interactive Satellite Pass Predictions &amp; Ground Track Radar</span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Track commercial and scientific satellites in real time with interactive Leaflet map overlays, conical footprint boundaries, Doppler shift compensation curves, and celestial sky-dome pass prediction radar for Switch SUPERNAP and global teleports.
            </p>
          </div>

          {/* Quick Telemetry Countdown Pod */}
          <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 shrink-0 lg:w-72 space-y-2">
            <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-800/80">
              <span className="text-slate-400 font-medium">Next Pass (AOS):</span>
              <span className="text-cyan-400 font-mono font-bold">{selectedSatellite.name}</span>
            </div>
            <div className="text-2xl font-extrabold font-mono text-emerald-400 tracking-wider">
              {countdownString}
            </div>
            <div className="text-[11px] text-slate-400 flex items-center justify-between font-mono">
              <span>Target Observer:</span>
              <span className="text-slate-200">{selectedObserver.name.split(' ')[0]}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          TWO-COLUMN MAIN WORKSTATION:
          LEFT: LEAFLET GLOBAL MAP & SATELLITE SELECTOR
          RIGHT: REAL-TIME PASS PREDICTIONS & POLAR SKY DOME RADAR
          ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: INTERACTIVE LEAFLET MAP (7 COLS) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Map Top Control Strip */}
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-white flex items-center space-x-1.5">
                <Satellite className="w-4 h-4 text-cyan-400" />
                <span>Tracking:</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono font-bold">
                {selectedSatellite.name}
              </span>
              <span className="text-slate-400 font-mono text-[11px]">
                ({selectedSatellite.altitudeKm} km · {selectedSatellite.velocityKmS} km/s)
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsLiveAutoTracking(!isLiveAutoTracking)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 transition cursor-pointer ${
                  isLiveAutoTracking 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <RefreshCw className={`w-3 h-3 ${isLiveAutoTracking ? 'animate-spin' : ''}`} />
                <span>{isLiveAutoTracking ? 'Auto-Centering' : 'Free Pan'}</span>
              </button>

              <button
                onClick={() => {
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.setView([selectedSatellite.currentLat, selectedSatellite.currentLon], 3);
                  }
                }}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                title="Reset Satellite View"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Leaflet Map Canvas Container */}
          <div className="relative rounded-2xl border border-slate-800 overflow-hidden shadow-2xl bg-slate-950">
            <div 
              ref={mapContainerRef} 
              className="w-full h-[440px] sm:h-[500px] z-10"
              style={{ background: '#020617' }}
            />

            {/* In-Map Telemetry HUD Overlay */}
            <div className="absolute bottom-4 left-4 z-20 bg-slate-950/90 backdrop-blur-md border border-slate-800 p-3 rounded-xl text-xs font-mono space-y-1.5 shadow-xl max-w-xs">
              <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between">
                <span>Sub-Satellite Telemetry</span>
                <span className="text-emerald-400">NORAD #{selectedSatellite.noradId}</span>
              </div>
              <div className="flex justify-between text-slate-300 text-[11px]">
                <span className="text-slate-500">Latitude / Longitude:</span>
                <span className="text-cyan-300">{selectedSatellite.currentLat}° / {selectedSatellite.currentLon}°</span>
              </div>
              <div className="flex justify-between text-slate-300 text-[11px]">
                <span className="text-slate-500">Altitude / Speed:</span>
                <span>{selectedSatellite.altitudeKm} km · {selectedSatellite.velocityKmS} km/s</span>
              </div>
              <div className="flex justify-between text-slate-300 text-[11px]">
                <span className="text-slate-500">Footprint Coverage:</span>
                <span className="text-purple-300">{selectedSatellite.footprintRadiusKm * 2} km dia.</span>
              </div>
              <div className="flex justify-between text-slate-300 text-[11px]">
                <span className="text-slate-500">Downlink Carrier:</span>
                <span className="text-amber-300">{selectedSatellite.downlinkFreqMHz} MHz</span>
              </div>
            </div>
          </div>

          {/* Satellite Selection Strip */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <span className="font-bold text-white">Select Satellite to Track &amp; Predict:</span>
              <div className="flex items-center space-x-1 overflow-x-auto pb-1 custom-nav-scrollbar">
                {['All', 'Space Stations', 'LEO Broadband', 'Scientific & Weather', 'Direct Broadcast (DBS)'].map(cat => (
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

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                        ? 'bg-cyan-950/40 border-cyan-500 shadow-md ring-1 ring-cyan-500/40'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="w-2 h-2 rounded-full" style={{ background: sat.color }} />
                        <span className="text-[10px] font-mono text-slate-500">#{sat.noradId}</span>
                      </div>
                      <div className="text-xs font-bold text-white truncate mt-1">{sat.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{sat.operator}</div>
                    </div>
                    <div className="text-[10px] font-mono text-cyan-300 mt-2">
                      {sat.orbitType} · {sat.altitudeKm} km
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: PASS PREDICTIONS & POLAR RADAR (5 COLS) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Observer Station Picker Card */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>Observer Ground Teleport</span>
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
                  {/* Draw arc trajectory through points */}
                  <path
                    d={activePassPrediction.skyTrackPoints.reduce((acc, pt, i) => {
                      const rad = (pt.azimuthDeg - 90) * (Math.PI / 180);
                      // Center is 50%, radius scaled by (90 - el) / 90
                      const rScale = ((90 - pt.elevationDeg) / 90) * 42; // percent of half-width
                      const cx = 50 + rScale * Math.cos(rad);
                      const cy = 50 + rScale * Math.sin(rad);
                      return i === 0 ? `M ${cx}% ${cy}%` : `${acc} L ${cx}% ${cy}%`;
                    }, '')}
                    fill="none"
                    stroke={selectedSatellite.color}
                    strokeWidth="2.5"
                    strokeDasharray="4, 4"
                  />
                  {/* Point circles for AOS, TCA (Peak), LOS */}
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
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
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
