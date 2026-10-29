import React, { useState } from 'react';
import { 
  SatelliteCompany, 
  OrbitType, 
  FrequencyBand, 
  ServiceCategory 
} from '../types/satellite';
import { X, Plus, Satellite, Check } from 'lucide-react';

interface AddCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCompany: (company: SatelliteCompany) => void;
}

const ALL_BANDS: FrequencyBand[] = [
  'Ka-band',
  'Ku-band',
  'C-band',
  'L-band',
  'S-band',
  'X-band',
  'VHF/UHF',
  'Optical/Laser',
  '3GPP NTN',
];

const ALL_CATEGORIES: ServiceCategory[] = [
  'Broadband & Backhaul',
  'Direct-to-Device (D2D)',
  'IoT & M2M',
  'Mobility (Aero & Maritime)',
  'Earth Observation & SAR',
  'Broadcast & Media',
  'Defense & Secure Satcom',
  'Teleport & Ground Infrastructure',
];

export const AddCompanyModal: React.FC<AddCompanyModalProps> = ({
  isOpen,
  onClose,
  onAddCompany,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [region, setRegion] = useState<'Americas' | 'EMEA' | 'APAC' | 'Global'>('Americas');
  const [founded, setFounded] = useState<number>(2024);
  const [website, setWebsite] = useState('');
  const [portalUrl, setPortalUrl] = useState('');
  const [orbitType, setOrbitType] = useState<OrbitType>('LEO');
  const [altitudeKm, setAltitudeKm] = useState('550 km');
  const [latencyMs, setLatencyMs] = useState('25 - 45 ms');
  const [throughputSummary, setThroughputSummary] = useState('');
  const [selectedBands, setSelectedBands] = useState<FrequencyBand[]>(['Ka-band', 'Ku-band']);
  const [activeSatellites, setActiveSatellites] = useState<number>(10);
  const [plannedSatellites, setPlannedSatellites] = useState<number>(100);
  const [coverage, setCoverage] = useState('Global coverage');
  const [selectedCategories, setSelectedCategories] = useState<ServiceCategory[]>([
    'Broadband & Backhaul',
  ]);
  const [summary, setSummary] = useState('');
  const [offeringsText, setOfferingsText] = useState('');
  const [strengthsText, setStrengthsText] = useState('');
  const [deptName, setDeptName] = useState('Wholesale Carrier Sales');
  const [deptEmail, setDeptEmail] = useState('');
  const [deptPhone, setDeptPhone] = useState('');
  const [contactPerson, setContactPerson] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleBand = (band: FrequencyBand) => {
    if (selectedBands.includes(band)) {
      if (selectedBands.length > 1) {
        setSelectedBands(selectedBands.filter((b) => b !== band));
      }
    } else {
      setSelectedBands([...selectedBands, band]);
    }
  };

  const toggleCategory = (cat: ServiceCategory) => {
    if (selectedCategories.includes(cat)) {
      if (selectedCategories.length > 1) {
        setSelectedCategories(selectedCategories.filter((c) => c !== cat));
      }
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Company name is required';
    if (!country.trim()) newErrors.country = 'Country is required';
    if (!deptEmail.trim()) newErrors.deptEmail = 'Contact email is required';
    if (!summary.trim()) newErrors.summary = 'Summary description is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const wholesaleOfferings = offeringsText
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const keyStrengths = strengthsText
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const newCompany: SatelliteCompany = {
      id: `custom-${Date.now()}-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      name: name.trim(),
      legalName: legalName.trim() || name.trim(),
      headquarters: {
        city: city.trim() || 'Unknown',
        country: country.trim(),
        region,
      },
      founded: Number(founded) || 2024,
      website: website.trim().startsWith('http') ? website.trim() : `https://${website.trim() || 'example.com'}`,
      portalUrl: portalUrl.trim() ? (portalUrl.trim().startsWith('http') ? portalUrl.trim() : `https://${portalUrl.trim()}`) : undefined,
      orbitType,
      altitudeKm: altitudeKm.trim() || '550 km',
      latencyMs: latencyMs.trim() || '30 - 50 ms',
      throughputSummary: throughputSummary.trim() || 'High-throughput carrier connectivity',
      frequencyBands: selectedBands,
      fleetSize: {
        activeSatellites: Number(activeSatellites) || 0,
        plannedSatellites: Number(plannedSatellites) || 0,
      },
      coverage: coverage.trim() || 'Regional & Global',
      categories: selectedCategories,
      status: 'Operational',
      summary: summary.trim(),
      satcomWholesaleOfferings: wholesaleOfferings.length > 0 ? wholesaleOfferings : ['Transponder capacity leasing', 'Direct enterprise connectivity'],
      keyStrengths: keyStrengths.length > 0 ? keyStrengths : ['Modern constellation architecture', 'Flexible wholesale agreements'],
      contacts: [
        {
          department: deptName.trim() || 'Wholesale Carrier Desk',
          email: deptEmail.trim(),
          phone: deptPhone.trim() || undefined,
          contactPerson: contactPerson.trim() || undefined,
        },
      ],
      regulatoryFilingCountry: country.trim(),
      isCustom: true,
    };

    onAddCompany(newCompany);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Add Custom Satellite Operator or Teleport
              </h3>
              <p className="text-xs text-slate-400">
                Register a new satellite constellation, regional teleport, or satcom carrier into your directory
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {/* Row 1: Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1 font-mono text-[11px] uppercase">
                Operator Brand Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Constellation X"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500 text-xs"
              />
              {errors.name && <p className="text-rose-400 text-[11px] mt-0.5">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-mono text-[11px] uppercase">
                Legal Entity Name
              </label>
              <input
                type="text"
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                placeholder="e.g. Constellation X Space Networks Ltd."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500 text-xs"
              />
            </div>
          </div>

          {/* Row 2: Location & Region */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-mono text-[11px] uppercase">
                Headquarters City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Munich"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500 text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-mono text-[11px] uppercase">
                Country *
              </label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g. Germany"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500 text-xs"
              />
              {errors.country && <p className="text-rose-400 text-[11px] mt-0.5">{errors.country}</p>}
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-mono text-[11px] uppercase">
                Region
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500 text-xs"
              >
                <option value="Americas">Americas</option>
                <option value="EMEA">EMEA</option>
                <option value="APAC">APAC</option>
                <option value="Global">Global</option>
              </select>
            </div>
          </div>

          {/* Row 3: Orbit, Altitude, Latency */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-mono text-[11px] uppercase">
                Orbit Regime
              </label>
              <select
                value={orbitType}
                onChange={(e) => setOrbitType(e.target.value as OrbitType)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500 text-xs"
              >
                <option value="LEO">LEO (Low Earth Orbit)</option>
                <option value="MEO">MEO (Medium Earth Orbit)</option>
                <option value="GEO">GEO (Geostationary Orbit)</option>
                <option value="Hybrid">Hybrid Constellation</option>
                <option value="Ground Segment">Ground Segment / Integrator</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-mono text-[11px] uppercase">
                Altitude (km)
              </label>
              <input
                type="text"
                value={altitudeKm}
                onChange={(e) => setAltitudeKm(e.target.value)}
                placeholder="e.g. 550 km"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500 text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-mono text-[11px] uppercase">
                Typical Latency
              </label>
              <input
                type="text"
                value={latencyMs}
                onChange={(e) => setLatencyMs(e.target.value)}
                placeholder="e.g. 25 - 40 ms"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500 text-xs"
              />
            </div>
          </div>

          {/* Row 4: Fleet Size */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-mono text-[11px] uppercase">
                Active Satellites in Orbit
              </label>
              <input
                type="number"
                value={activeSatellites}
                onChange={(e) => setActiveSatellites(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500 text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-mono text-[11px] uppercase">
                Planned Satellites
              </label>
              <input
                type="number"
                value={plannedSatellites}
                onChange={(e) => setPlannedSatellites(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500 text-xs"
              />
            </div>
          </div>

          {/* Frequency Bands Selectors */}
          <div>
            <label className="block text-slate-400 mb-1.5 font-mono text-[11px] uppercase">
              Supported Frequency Bands
            </label>
            <div className="flex flex-wrap gap-2">
              {ALL_BANDS.map((band) => {
                const isSelected = selectedBands.includes(band);
                return (
                  <button
                    type="button"
                    key={band}
                    onClick={() => toggleBand(band)}
                    className={`px-2.5 py-1 rounded text-xs font-mono transition-colors border ${
                      isSelected
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {band}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Service Categories */}
          <div>
            <label className="block text-slate-400 mb-1.5 font-mono text-[11px] uppercase">
              Primary Service Categories
            </label>
            <div className="flex flex-wrap gap-2">
              {ALL_CATEGORIES.map((cat) => {
                const isSelected = selectedCategories.includes(cat);
                return (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`px-2.5 py-1 rounded text-xs transition-colors border ${
                      isSelected
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Summary */}
          <div>
            <label className="block text-slate-400 mb-1 font-mono text-[11px] uppercase">
              Executive Description & Constellation Capabilities *
            </label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={3}
              placeholder="Detailed description of the satellite fleet, coverage footprint, payload specs, and satcom relevance..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-sky-500 text-xs resize-none"
            />
            {errors.summary && <p className="text-rose-400 text-[11px] mt-0.5">{errors.summary}</p>}
          </div>

          {/* Wholesale Offerings (one per line) */}
          <div>
            <label className="block text-slate-400 mb-1 font-mono text-[11px] uppercase">
              Wholesale / Carrier Capacities (one per line)
            </label>
            <textarea
              value={offeringsText}
              onChange={(e) => setOfferingsText(e.target.value)}
              rows={2}
              placeholder="e.g. Committed Information Rate (CIR) low-latency pipes&#10;Full transponder 36MHz C-band lease&#10;Direct-to-Device 3GPP roaming agreement"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-sky-500 text-xs resize-none font-mono"
            />
          </div>

          {/* Primary Contact Details */}
          <div className="border-t border-slate-800 pt-4 space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-sky-400 font-bold">
              Primary Carrier Contact Desk
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-mono text-[11px] uppercase">
                  Department
                </label>
                <input
                  type="text"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  placeholder="e.g. Carrier Wholesale Desk"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-sky-500 text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-mono text-[11px] uppercase">
                  Email *
                </label>
                <input
                  type="email"
                  value={deptEmail}
                  onChange={(e) => setDeptEmail(e.target.value)}
                  placeholder="e.g. wholesale@constellationx.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-sky-500 text-xs"
                />
                {errors.deptEmail && <p className="text-rose-400 text-[11px] mt-0.5">{errors.deptEmail}</p>}
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-mono text-[11px] uppercase">
                  Phone
                </label>
                <input
                  type="text"
                  value={deptPhone}
                  onChange={(e) => setDeptPhone(e.target.value)}
                  placeholder="e.g. +1 (555) 019-2831"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-sky-500 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Web Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1 font-mono text-[11px] uppercase">
                Official Website
              </label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://example.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-sky-500 text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-mono text-[11px] uppercase">
                Partner / Carrier Portal URL
              </label>
              <input
                type="text"
                value={portalUrl}
                onChange={(e) => setPortalUrl(e.target.value)}
                placeholder="https://example.com/wholesale"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-sky-500 text-xs"
              />
            </div>
          </div>

          {/* Submit button */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-lg transition-colors flex items-center gap-1.5 font-semibold"
            >
              <Plus className="w-4 h-4" />
              <span>Register Operator</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
