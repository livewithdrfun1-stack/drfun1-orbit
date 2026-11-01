/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  SatelliteCompany, 
  CompanyFilterState, 
  UserNote 
} from './types/satellite';
import { INITIAL_SATELLITE_COMPANIES } from './data/satelliteCompanies';
import { Header } from './components/Header';
import { StatsBanner } from './components/StatsBanner';
import { FilterToolbar } from './components/FilterToolbar';
import { CompanyCard } from './components/CompanyCard';
import { CompanyTableView } from './components/CompanyTableView';
import { CompanyDetailDrawer } from './components/CompanyDetailDrawer';
import { OrbitVisualizer } from './components/OrbitVisualizer';
import { RfqOutreachModal } from './components/RfqOutreachModal';
import { CompareModal } from './components/CompareModal';
import { AddCompanyModal } from './components/AddCompanyModal';
import { LicenseModal } from './components/LicenseModal';
import { SwitchIrcMeshModal } from './components/SwitchIrcMeshModal';
import { StoreProduct, CartItem } from './types/store';
import { StoreView } from './components/StoreView';
import { ProductConfigModal } from './components/ProductConfigModal';
import { CartDrawer } from './components/CartDrawer';
import { RestreamStudioView } from './components/RestreamStudioView';
import { FacebookSocialView } from './components/FacebookSocialView';
import { IrcClientView } from './components/IrcClientView';
import { BroadcastMediaView } from './components/BroadcastMediaView';
import { PhoneCarriersView } from './components/PhoneCarriersView';
import { MpdBotControlView } from './components/MpdBotControlView';
import { IrcDuplicatorView } from './components/IrcDuplicatorView';
import { HostingResellerProgramModal } from './components/HostingResellerProgramModal';
import { IrcdAdminPanelModal } from './components/IrcdAdminPanelModal';
import { AnopeRankLevel } from './types/ircdAdmin';
import { STORE_PRODUCTS } from './data/storeProducts';
import { AppTab } from './components/Header';
import { 
  Satellite, 
  Radio, 
  Search, 
  RotateCcw,
  Mail,
  ShieldCheck,
  Check,
  ExternalLink,
  Server,
  Terminal
} from 'lucide-react';

const STORAGE_KEY_CUSTOM_COMPANIES = 'satcom_directory_custom_companies';
const STORAGE_KEY_BOOKMARKS = 'satcom_directory_bookmarks';
const STORAGE_KEY_NOTES = 'satcom_directory_user_notes';
const STORAGE_KEY_CART = 'drfun1_store_cart_items';

export default function App() {
  // Tab state
  const [activeTab, setActiveTab] = useState<AppTab>('directory');

  // Companies state (initial dataset + custom additions)
  const [companies, setCompanies] = useState<SatelliteCompany[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CUSTOM_COMPANIES);
      if (saved) {
        const parsed = JSON.parse(saved);
        return [...INITIAL_SATELLITE_COMPANIES, ...parsed];
      }
    } catch (e) {
      console.error('Error loading custom companies', e);
    }
    return INITIAL_SATELLITE_COMPANIES;
  });

  // Bookmarks
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BOOKMARKS);
      if (saved) return new Set(JSON.parse(saved));
    } catch (e) {
      console.error('Error loading bookmarks', e);
    }
    return new Set();
  });

  // User notes
  const [userNotes, setUserNotes] = useState<Record<string, UserNote>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_NOTES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading notes', e);
    }
    return {};
  });

  // Compared IDs
  const [comparedIds, setComparedIds] = useState<Set<string>>(new Set());

  // Filter state
  const [filters, setFilters] = useState<CompanyFilterState>({
    searchQuery: '',
    orbit: 'All',
    band: 'All',
    category: 'All',
    region: 'All',
    status: 'All',
    bookmarkedOnly: false,
  });

  // View mode
  const [viewMode, setViewMode] = useState<'cards' | 'table' | 'orbit'>('cards');

  // Modals & Drawers
  const [selectedCompany, setSelectedCompany] = useState<SatelliteCompany | null>(null);
  const [isRfqOpen, setIsRfqOpen] = useState(false);
  const [rfqPreSelectedCompany, setRfqPreSelectedCompany] = useState<SatelliteCompany | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false);
  const [isSwitchMeshModalOpen, setIsSwitchMeshModalOpen] = useState(false);
  const [isHostingResellerModalOpen, setIsHostingResellerModalOpen] = useState(false);
  const [isIrcdAdminOpen, setIsIrcdAdminOpen] = useState(false);
  const [activeOperRank, setActiveOperRank] = useState<AnopeRankLevel>(() => {
    try {
      const saved = localStorage.getItem('drfun1_active_anope_rank');
      if (saved) return saved as AnopeRankLevel;
    } catch (_) {}
    return 'op';
  });
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Store & Cart State
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedStoreProduct, setSelectedStoreProduct] = useState<StoreProduct | null>(null);
  const [configModalInitialDrfun1, setConfigModalInitialDrfun1] = useState(true);
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CART);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading cart', e);
    }
    return [];
  });

  // Sync bookmarks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_BOOKMARKS, JSON.stringify(Array.from(bookmarkedIds)));
    } catch (e) {
      console.error('Error saving bookmarks', e);
    }
  }, [bookmarkedIds]);

  // Sync user notes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(userNotes));
    } catch (e) {
      console.error('Error saving notes', e);
    }
  }, [userNotes]);

  // Sync active Anope rank
  useEffect(() => {
    try {
      localStorage.setItem('drfun1_active_anope_rank', activeOperRank);
    } catch (_) {}
  }, [activeOperRank]);

  // Sync cart items to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CART, JSON.stringify(cartItems));
    } catch (e) {
      console.error('Error saving cart items', e);
    }
  }, [cartItems]);

  // Store Cart Handlers
  const handleOpenProductConfig = (product: StoreProduct, isDrfun1: boolean) => {
    setSelectedStoreProduct(product);
    setConfigModalInitialDrfun1(isDrfun1);
  };

  const handleQuickAddToCart = (product: StoreProduct, isDrfun1: boolean) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.isDrfun1Branded === isDrfun1 &&
          item.addSwitchColocation === true &&
          item.addRisingNetTransit === true &&
          item.addUnrealIrcdPeering === true
      );

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + (product.minOrderQuantity || 1),
        };
        return next;
      }

      return [
        ...prev,
        {
          product,
          quantity: product.minOrderQuantity || 1,
          isDrfun1Branded: isDrfun1,
          addSwitchColocation: true,
          addRisingNetTransit: true,
          addUnrealIrcdPeering: true,
        },
      ];
    });
  };

  const handleAddConfiguredItemToCart = (item: CartItem) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) =>
          i.product.id === item.product.id &&
          i.isDrfun1Branded === item.isDrfun1Branded &&
          i.addSwitchColocation === item.addSwitchColocation &&
          i.addRisingNetTransit === item.addRisingNetTransit &&
          i.addUnrealIrcdPeering === item.addUnrealIrcdPeering
      );

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + item.quantity,
        };
        return next;
      }

      return [...prev, item];
    });
    setSelectedStoreProduct(null);
    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (index: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(index);
      return;
    }
    setCartItems((prev) => {
      const next = [...prev];
      if (next[index]) {
        next[index] = { ...next[index], quantity: newQty };
      }
      return next;
    });
  };

  const handleRemoveCartItem = (index: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Toggle bookmark handler
  const handleToggleBookmark = (id: string) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Toggle compare handler (max 4)
  const handleToggleCompare = (id: string) => {
    setComparedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (next.size >= 4) {
          setExportNotice('You can compare a maximum of 4 satellite operators simultaneously.');
          setTimeout(() => setExportNotice(null), 3500);
          return prev;
        }
        next.add(id);
      }
      return next;
    });
  };

  // Remove single company from compare
  const handleRemoveFromCompare = (id: string) => {
    setComparedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  // Save personal note handler
  const handleSaveNote = (note: UserNote) => {
    setUserNotes((prev) => ({
      ...prev,
      [note.companyId]: note,
    }));
  };

  // Add custom company handler
  const handleAddCompany = (newCompany: SatelliteCompany) => {
    setCompanies((prev) => {
      const next = [newCompany, ...prev];
      try {
        const customOnly = next.filter((c) => c.isCustom);
        localStorage.setItem(STORAGE_KEY_CUSTOM_COMPANIES, JSON.stringify(customOnly));
      } catch (e) {
        console.error('Error saving custom company', e);
      }
      return next;
    });
  };

  // Open RFQ modal handler
  const handleOpenRfq = (company?: SatelliteCompany) => {
    setRfqPreSelectedCompany(company || null);
    setIsRfqOpen(true);
  };

  // CSV Export handler
  const handleExportCsv = () => {
    const headers = [
      'Name',
      'Legal Name',
      'Orbit',
      'Altitude',
      'Latency',
      'Active Satellites',
      'Frequency Bands',
      'HQ Country',
      'Primary Contact Email',
      'Contact Department',
      'Website',
    ];

    const rows = filteredCompanies.map((c) => [
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.legalName.replace(/"/g, '""')}"`,
      `"${c.orbitType}"`,
      `"${c.altitudeKm}"`,
      `"${c.latencyMs}"`,
      `"${c.fleetSize.activeSatellites}"`,
      `"${c.frequencyBands.join('; ')}"`,
      `"${c.headquarters.country}"`,
      `"${c.contacts[0]?.email || ''}"`,
      `"${c.contacts[0]?.department || ''}"`,
      `"${c.website}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `satcom_operator_directory_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice(`Exported ${filteredCompanies.length} satellite operators to CSV`);
    setTimeout(() => setExportNotice(null), 3000);
  };

  // Filtered dataset
  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      // Search query
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchesName = c.name.toLowerCase().includes(q) || c.legalName.toLowerCase().includes(q);
        const matchesCountry = c.headquarters.country.toLowerCase().includes(q) || c.headquarters.city.toLowerCase().includes(q);
        const matchesSummary = c.summary.toLowerCase().includes(q);
        const matchesBands = c.frequencyBands.some((b) => b.toLowerCase().includes(q));
        const matchesOfferings = c.satcomWholesaleOfferings.some((o) => o.toLowerCase().includes(q));
        const matchesOrbit = c.orbitType.toLowerCase().includes(q);
        if (!matchesName && !matchesCountry && !matchesSummary && !matchesBands && !matchesOfferings && !matchesOrbit) {
          return false;
        }
      }

      // Orbit filter
      if (filters.orbit !== 'All' && c.orbitType !== filters.orbit) {
        return false;
      }

      // Frequency band filter
      if (filters.band !== 'All' && !c.frequencyBands.includes(filters.band)) {
        return false;
      }

      // Category filter
      if (filters.category !== 'All' && !c.categories.includes(filters.category)) {
        return false;
      }

      // Region filter
      if (filters.region !== 'All' && c.headquarters.region !== filters.region && filters.region !== 'Global') {
        return false;
      }

      // Bookmarked filter
      if (filters.bookmarkedOnly && !bookmarkedIds.has(c.id)) {
        return false;
      }

      return true;
    });
  }, [companies, filters, bookmarkedIds]);

  const comparedCompaniesList = useMemo(() => {
    return companies.filter((c) => comparedIds.has(c.id));
  }, [companies, comparedIds]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500/30 selection:text-sky-200">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onExport={handleExportCsv}
        savedCount={bookmarkedIds.size}
        compareCount={comparedIds.size}
        onOpenCompare={() => setIsCompareModalOpen(true)}
        onOpenLicense={() => setIsLicenseModalOpen(true)}
        onOpenSwitchMesh={() => setIsSwitchMeshModalOpen(true)}
        onOpenResellerProgram={() => setIsHostingResellerModalOpen(true)}
        onOpenIrcdAdmin={() => setIsIrcdAdminOpen(true)}
        activeOperRank={activeOperRank}
        cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Real-time Telemetry Stats Banner */}
      {(activeTab === 'directory' || activeTab === 'orbits' || activeTab === 'compare') && (
        <StatsBanner companies={companies} />
      )}

      {/* Export Toast Notification */}
      {exportNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 px-4 py-2.5 rounded-lg shadow-xl text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* View routing: MultiStream Studio, SpaceBook Social, WebIRC Client, Radio & TV, Phone Carriers, or Standard Workspace */}
      {activeTab === 'stream' ? (
        <RestreamStudioView
          onOpenLicense={() => setIsLicenseModalOpen(true)}
          onOpenSwitchMesh={() => setIsSwitchMeshModalOpen(true)}
          onNavigateToStore={() => setActiveTab('store')}
          onNavigateToIrc={() => setActiveTab('irc')}
          onAddToCart={handleQuickAddToCart}
          activeRank={activeOperRank}
          onOpenAdminPanel={() => setIsIrcdAdminOpen(true)}
        />
      ) : activeTab === 'social' ? (
        <FacebookSocialView
          onOpenLicense={() => setIsLicenseModalOpen(true)}
          onOpenSwitchMesh={() => setIsSwitchMeshModalOpen(true)}
          onNavigateToStore={() => setActiveTab('store')}
          onNavigateToStudio={() => setActiveTab('stream')}
          onNavigateToIrc={() => setActiveTab('irc')}
        />
      ) : activeTab === 'irc' ? (
        <IrcClientView
          onOpenLicense={() => setIsLicenseModalOpen(true)}
          onOpenSwitchMesh={() => setIsSwitchMeshModalOpen(true)}
          onNavigateToStore={() => setActiveTab('store')}
          onNavigateToStudio={() => setActiveTab('stream')}
          activeRank={activeOperRank}
          onOpenIrcdAdmin={() => setIsIrcdAdminOpen(true)}
        />
      ) : activeTab === 'media' ? (
        <BroadcastMediaView
          onOpenStore={() => setActiveTab('store')}
          onOpenIrc={() => setActiveTab('irc')}
          onOpenLicense={() => setIsLicenseModalOpen(true)}
          onOpenSwitchMesh={() => setIsSwitchMeshModalOpen(true)}
          onOpenMpd={() => setActiveTab('mpd')}
          onOpenDuplicator={() => setActiveTab('duplicator')}
          activeRank={activeOperRank}
          onOpenIrcdAdmin={() => setIsIrcdAdminOpen(true)}
        />
      ) : activeTab === 'carriers' ? (
        <PhoneCarriersView
          onOpenStore={() => setActiveTab('store')}
          onOpenLicense={() => setIsLicenseModalOpen(true)}
          onOpenSwitchMesh={() => setIsSwitchMeshModalOpen(true)}
        />
      ) : activeTab === 'mpd' ? (
        <MpdBotControlView
          onOpenIrc={() => setActiveTab('irc')}
          onOpenBroadcast={() => setActiveTab('media')}
          onOpenDuplicator={() => setActiveTab('duplicator')}
          activeRank={activeOperRank}
          onRankChange={setActiveOperRank}
          onOpenAdminPanel={() => setIsIrcdAdminOpen(true)}
        />
      ) : activeTab === 'duplicator' ? (
        <IrcDuplicatorView
          onOpenLicense={() => setIsLicenseModalOpen(true)}
          onOpenSwitchMesh={() => setIsSwitchMeshModalOpen(true)}
          onOpenIrc={() => setActiveTab('irc')}
          onOpenMpd={() => setActiveTab('mpd')}
          onOpenMedia={() => setActiveTab('media')}
        />
      ) : (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Editorial Domain Title & Description */}
        <div className="border-b border-slate-800/80 pb-6 space-y-3.5">
          {/* License Holder Ribbon */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <ShieldCheck className="w-4 h-4" />
                <span>Licensed to Richard Alan Witt</span>
              </span>
              <span className="text-slate-600 hidden sm:inline">·</span>
              <span className="text-slate-400 font-mono">
                Cert ID: RAW-SATCOM-2026-LIC-0881
              </span>
              <span className="text-slate-600 hidden sm:inline">·</span>
              <div className="flex items-center gap-3 text-slate-300 font-mono">
                <a
                  href="https://www.wittlawfirm.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-400 hover:text-sky-300 hover:underline flex items-center gap-1"
                >
                  <span>wittlawfirm.com</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <span className="text-slate-700">/</span>
                <a
                  href="https://www.owenscompany.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-400 hover:text-sky-300 hover:underline flex items-center gap-1"
                >
                  <span>owenscompany.com</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <button
              onClick={() => setIsLicenseModalOpen(true)}
              className="text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2.5 py-1 rounded text-[11px] font-medium transition-colors"
            >
              View Certificate
            </button>
          </div>

          {/* Switch & UnrealIRCd Leaf Mesh Ribbon */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 text-sky-400 font-medium">
                <Server className="w-4 h-4 text-sky-400" />
                <span>Switch Colocation & UnrealIRCd Leaf Mesh</span>
              </span>
              <span className="text-slate-600 hidden sm:inline">·</span>
              <span className="text-slate-300 font-mono text-[11px]">
                Hub: <strong className="text-emerald-400">irc.drfun1.com:6697 (SSL)</strong>
              </span>
              <span className="text-slate-600 hidden sm:inline">·</span>
              <div className="flex items-center gap-3 text-slate-300 font-mono text-[11px]">
                <a
                  href="https://www.switch.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-400 hover:text-sky-300 hover:underline flex items-center gap-1"
                >
                  <span>switch.com</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
                <span className="text-slate-700">/</span>
                <a
                  href="https://www.risingnet.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-400 hover:text-sky-300 hover:underline flex items-center gap-1"
                >
                  <span>risingnet.com</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
                <span className="text-slate-700">/</span>
                <a
                  href="https://www.unrealircd.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-400 hover:text-sky-300 hover:underline flex items-center gap-1"
                >
                  <span>unrealircd.com</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>

            <button
              onClick={() => setIsSwitchMeshModalOpen(true)}
              className="text-slate-950 font-semibold bg-emerald-400 hover:bg-emerald-300 px-2.5 py-1 rounded text-[11px] transition-colors flex items-center gap-1"
            >
              <Terminal className="w-3 h-3" />
              <span>Inspect Leaf Mesh & Configs</span>
            </button>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="max-w-3xl">
              <span className="text-[11px] font-mono uppercase tracking-widest text-sky-400 font-semibold block mb-1">
                Global Satellite Operator & Carrier Directory
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Commercial Satellite & Constellation Directory
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                Comprehensive directory of satellite communications operators, low Earth orbit mega-constellations, geostationary fleets, direct-to-device (3GPP NTN) carriers, and ground segment teleports. Includes orbital telemetry, frequency allocations, and verified contact channels for transponder leasing, cellular backhaul, and carrier interconnect.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={() => handleOpenRfq()}
                className="px-4 py-2 text-xs font-medium text-slate-950 bg-sky-400 hover:bg-sky-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm shadow-sky-500/10"
              >
                <Mail className="w-4 h-4" />
                <span>Compose Capacity RFQ</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab 1: Directory (Cards / Table) */}
        {activeTab === 'directory' && (
          <div className="space-y-6">
            {/* Filter Toolbar */}
            <FilterToolbar
              filters={filters}
              setFilters={setFilters}
              viewMode={viewMode}
              setViewMode={(mode) => {
                if (mode === 'orbit') {
                  setActiveTab('orbits');
                } else {
                  setViewMode(mode);
                }
              }}
              filteredCount={filteredCompanies.length}
              totalCount={companies.length}
              savedCount={bookmarkedIds.size}
            />

            {/* Empty state */}
            {filteredCompanies.length === 0 ? (
              <div className="py-20 text-center bg-slate-900/20 border border-slate-800/80 rounded-xl p-8">
                <Search className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-slate-300">
                  No matching satellite operators found
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Try broadening your search term, clearing band filters, or resetting orbital selections.
                </p>
                <button
                  onClick={() =>
                    setFilters({
                      searchQuery: '',
                      orbit: 'All',
                      band: 'All',
                      category: 'All',
                      region: 'All',
                      status: 'All',
                      bookmarkedOnly: false,
                    })
                  }
                  className="mt-4 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition-colors inline-flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            ) : viewMode === 'cards' ? (
              /* Grid of Cards */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredCompanies.map((company) => (
                  <CompanyCard
                    key={company.id}
                    company={company}
                    isBookmarked={bookmarkedIds.has(company.id)}
                    onToggleBookmark={handleToggleBookmark}
                    onSelectCompany={(c) => setSelectedCompany(c)}
                    onQuickContact={(c) => handleOpenRfq(c)}
                    isCompared={comparedIds.has(company.id)}
                    onToggleCompare={handleToggleCompare}
                  />
                ))}
              </div>
            ) : (
              /* High-Density Data Table */
              <CompanyTableView
                companies={filteredCompanies}
                bookmarkedIds={bookmarkedIds}
                onToggleBookmark={handleToggleBookmark}
                onSelectCompany={(c) => setSelectedCompany(c)}
                onQuickContact={(c) => handleOpenRfq(c)}
                comparedIds={comparedIds}
                onToggleCompare={handleToggleCompare}
              />
            )}
          </div>
        )}

        {/* Tab 2: Orbits & Fleet Distribution */}
        {activeTab === 'orbits' && (
          <div className="space-y-6">
            <OrbitVisualizer
              companies={companies}
              onSelectCompany={(c) => setSelectedCompany(c)}
            />
          </div>
        )}

        {/* Tab 3: Compare Operators Matrix */}
        {activeTab === 'compare' && (
          <div className="space-y-6">
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Multi-Operator Technical Comparison
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Select up to 4 satellite operators from the Directory using the "VS" button to compare technical parameters side-by-side.
                  </p>
                </div>
                {comparedIds.size > 0 && (
                  <button
                    onClick={() => setComparedIds(new Set())}
                    className="text-xs text-rose-400 hover:text-rose-300 transition-colors"
                  >
                    Clear Comparison
                  </button>
                )}
              </div>

              {comparedCompaniesList.length === 0 ? (
                <div className="py-16 text-center text-slate-400 border border-dashed border-slate-800 rounded-xl">
                  <p className="text-sm">No operators currently staged for comparison.</p>
                  <button
                    onClick={() => setActiveTab('directory')}
                    className="mt-3 px-4 py-2 bg-sky-400 text-slate-950 font-medium text-xs rounded-lg hover:bg-sky-300 transition-colors"
                  >
                    Browse Directory & Add Operators
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800">
                        <th className="py-3 px-4 w-44 text-slate-500 font-mono uppercase text-[11px] bg-slate-950/40">
                          Parameter
                        </th>
                        {comparedCompaniesList.map((c) => (
                          <th key={c.id} className="py-3 px-4 min-w-[220px] bg-slate-950/20">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="font-bold text-sm text-slate-100 block">
                                  {c.name}
                                </span>
                                <span className="text-[11px] text-slate-500 font-normal">
                                  {c.headquarters.country}
                                </span>
                              </div>
                              <button
                                onClick={() => handleRemoveFromCompare(c.id)}
                                className="text-slate-500 hover:text-rose-400 p-1 text-xs"
                              >
                                ✕
                              </button>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                      <tr>
                        <td className="py-3 px-4 text-slate-500 uppercase text-[10px] bg-slate-950/40">
                          Orbit Regime
                        </td>
                        {comparedCompaniesList.map((c) => (
                          <td key={c.id} className="py-3 px-4 text-slate-200">
                            <span className="text-sky-400 font-semibold">{c.orbitType}</span>
                            <span className="text-slate-400 block text-[11px] mt-0.5">{c.altitudeKm}</span>
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-slate-500 uppercase text-[10px] bg-slate-950/40">
                          Latency
                        </td>
                        {comparedCompaniesList.map((c) => (
                          <td key={c.id} className="py-3 px-4 text-slate-200">
                            {c.latencyMs}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-slate-500 uppercase text-[10px] bg-slate-950/40">
                          Fleet Size
                        </td>
                        {comparedCompaniesList.map((c) => (
                          <td key={c.id} className="py-3 px-4 text-slate-200 tabular-nums">
                            {c.fleetSize.activeSatellites > 0 ? (
                              <>
                                <strong className="text-slate-100">{c.fleetSize.activeSatellites.toLocaleString()}</strong> in orbit
                                <span className="text-slate-500 block text-[11px]">/ {c.fleetSize.plannedSatellites.toLocaleString()} planned</span>
                              </>
                            ) : (
                              <span className="text-slate-500">Integrator fleet</span>
                            )}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-slate-500 uppercase text-[10px] bg-slate-950/40">
                          Frequency Bands
                        </td>
                        {comparedCompaniesList.map((c) => (
                          <td key={c.id} className="py-3 px-4 text-slate-300">
                            {c.frequencyBands.join(', ')}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-slate-500 uppercase text-[10px] bg-slate-950/40">
                          Top Wholesale Offering
                        </td>
                        {comparedCompaniesList.map((c) => (
                          <td key={c.id} className="py-3 px-4 text-slate-300 font-sans text-xs">
                            {c.satcomWholesaleOfferings[0] || '-'}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-slate-500 uppercase text-[10px] bg-slate-950/40">
                          Carrier Contact Desk
                        </td>
                        {comparedCompaniesList.map((c) => {
                          const contact = c.contacts[0];
                          return (
                            <td key={c.id} className="py-3 px-4 text-xs font-sans">
                              {contact ? (
                                <div>
                                  <div className="font-semibold text-slate-200">{contact.department}</div>
                                  <a
                                    href={`mailto:${contact.email}`}
                                    className="text-sky-400 hover:underline font-mono text-[11px] block mt-0.5"
                                  >
                                    {contact.email}
                                  </a>
                                </div>
                              ) : (
                                <span className="text-slate-500">-</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-slate-500 uppercase text-[10px] bg-slate-950/40">
                          Quick Dispatch
                        </td>
                        {comparedCompaniesList.map((c) => (
                          <td key={c.id} className="py-3 px-4">
                            <button
                              onClick={() => handleOpenRfq(c)}
                              className="py-1.5 px-3 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 rounded text-xs transition-colors flex items-center gap-1 font-medium"
                            >
                              <Mail className="w-3 h-3" />
                              <span>RFQ Inquiry</span>
                            </button>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Outreach & RFQ Builder (Embedded Mode) */}
        {activeTab === 'rfq' && (
          <div className="space-y-6">
            <RfqOutreachModal
              isOpen={true}
              onClose={() => setActiveTab('directory')}
              availableCompanies={companies}
              preSelectedCompany={rfqPreSelectedCompany}
            />
          </div>
        )}

        {/* Tab 5: Store & Resale Marketplace (DrFun1 Rebranded Ecosystem) */}
        {activeTab === 'store' && (
          <StoreView
            onOpenProductConfig={handleOpenProductConfig}
            onQuickAddToCart={handleQuickAddToCart}
            cartItems={cartItems}
            onOpenCart={() => setIsCartOpen(true)}
            onOpenLicenseModal={() => setIsLicenseModalOpen(true)}
            onOpenSwitchMeshModal={() => setIsSwitchMeshModalOpen(true)}
          />
        )}
      </main>
    )}

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/90 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Satellite className="w-4 h-4 text-sky-400" />
              <span className="text-slate-300 font-semibold">DrFun1 Orbit</span>
              <span>—</span>
              <span>Commercial Satellite Operator Directory, Resale Store & Contact Portal</span>
            </div>

            <div className="flex items-center gap-4 font-mono text-[11px] text-slate-400">
              <span>Verified 2026 Fleet Data</span>
              <span className="text-slate-700">·</span>
              <span>3GPP Release 17/18 NTN</span>
              <span className="text-slate-700">·</span>
              <span>ITU Space Services Division</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Licensed to Richard Alan Witt</span>
              </span>
              <span className="text-slate-700 hidden sm:inline">·</span>
              <a
                href="https://www.wittlawfirm.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-400 hover:text-sky-300 hover:underline flex items-center gap-1 font-mono text-[11px]"
              >
                <span>The Law Office of Richard A. Witt LLC</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
              <span className="text-slate-700 hidden sm:inline">·</span>
              <a
                href="https://www.owenscompany.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-400 hover:text-sky-300 hover:underline flex items-center gap-1 font-mono text-[11px]"
              >
                <span>Owens Company</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>

            <div className="flex items-center gap-3 font-mono text-[11px]">
              <span className="text-slate-500">ID: RAW-SATCOM-2026-LIC-0881</span>
              <button
                onClick={() => setIsLicenseModalOpen(true)}
                className="text-sky-400 hover:text-sky-300 hover:underline"
              >
                View License Certificate
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Detail Slide-Over Drawer */}
      <CompanyDetailDrawer
        company={selectedCompany}
        onClose={() => setSelectedCompany(null)}
        isBookmarked={selectedCompany ? bookmarkedIds.has(selectedCompany.id) : false}
        onToggleBookmark={handleToggleBookmark}
        userNote={selectedCompany ? userNotes[selectedCompany.id] : undefined}
        onSaveNote={handleSaveNote}
        onOpenRfq={(c) => handleOpenRfq(c)}
      />

      {/* Floating Standalone RFQ Modal */}
      {isRfqOpen && activeTab !== 'rfq' && (
        <RfqOutreachModal
          isOpen={isRfqOpen}
          onClose={() => setIsRfqOpen(false)}
          availableCompanies={companies}
          preSelectedCompany={rfqPreSelectedCompany}
        />
      )}

      {/* Standalone Compare Modal */}
      <CompareModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        comparedCompanies={comparedCompaniesList}
        onRemoveFromCompare={handleRemoveFromCompare}
        onSelectCompany={(c) => {
          setIsCompareModalOpen(false);
          setSelectedCompany(c);
        }}
        onOpenRfq={(c) => {
          setIsCompareModalOpen(false);
          handleOpenRfq(c);
        }}
      />

      {/* Add Custom Company Modal */}
      <AddCompanyModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddCompany={handleAddCompany}
      />

      {/* License & Certificate Modal */}
      <LicenseModal
        isOpen={isLicenseModalOpen}
        onClose={() => setIsLicenseModalOpen(false)}
      />

      {/* Switch & UnrealIRCd Leaf Mesh Console Modal */}
      <SwitchIrcMeshModal
        isOpen={isSwitchMeshModalOpen}
        onClose={() => setIsSwitchMeshModalOpen(false)}
        companies={companies}
        onOpenBatchProposal={() => {
          setRfqPreSelectedCompany(null);
          setIsRfqOpen(true);
        }}
      />

      {/* Product Configuration Modal */}
      <ProductConfigModal
        product={selectedStoreProduct}
        initialDrfun1Branded={configModalInitialDrfun1}
        isOpen={!!selectedStoreProduct}
        onClose={() => setSelectedStoreProduct(null)}
        onAddToCart={handleAddConfiguredItemToCart}
      />

      {/* Procurement Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
      />

      {/* Global Master Hosting Reseller Program Modal */}
      <HostingResellerProgramModal
        isOpen={isHostingResellerModalOpen}
        onClose={() => setIsHostingResellerModalOpen(false)}
        onSelectProductForOrder={(id) => {
          const product = STORE_PRODUCTS.find((p) => p.id === id);
          if (product) {
            handleOpenProductConfig(product, true);
            setActiveTab('store');
          }
        }}
      />

      {/* UnrealIRCd & Anope Services Ops Web Control Panel Modal */}
      <IrcdAdminPanelModal
        isOpen={isIrcdAdminOpen}
        onClose={() => setIsIrcdAdminOpen(false)}
        activeRank={activeOperRank}
        onRankChange={setActiveOperRank}
        onNavigateToMpd={() => setActiveTab('mpd')}
        onNavigateToIrc={() => setActiveTab('irc')}
      />
    </div>
  );
}
