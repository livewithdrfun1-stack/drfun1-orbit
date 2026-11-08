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
import { LatencyTrendChart } from './components/LatencyTrendChart';
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
import { IrcdStatsView } from './components/IrcdStatsView';
import { BroadcastMediaView } from './components/BroadcastMediaView';
import { DrFun1MasterBroadcastStudio, StudioToolId } from './components/DrFun1MasterBroadcastStudio';
import { PhoneCarriersView } from './components/PhoneCarriersView';
import { MpdBotControlView } from './components/MpdBotControlView';
import { IrcDuplicatorView } from './components/IrcDuplicatorView';
import { HostingResellerProgramModal } from './components/HostingResellerProgramModal';
import { IrcdAdminPanelModal } from './components/IrcdAdminPanelModal';
import { SwitchWittSatelliteFiberModal } from './components/SwitchWittSatelliteFiberModal';
import { SatelliteRssNewsSection } from './components/SatelliteRssNewsSection';
import { CommunityHubView } from './components/CommunityHubView';
import { MembershipPlansModal } from './components/MembershipPlansModal';
import { ZncWebControlPanelView } from './components/ZncWebControlPanelView';
import { ZncWebAdminModal } from './components/ZncWebAdminModal';
import { IntegrationHubView } from './components/IntegrationHubView';
import { UnrealIrcdSearchEngineModal } from './components/UnrealIrcdSearchEngineModal';
import { SlaCalculatorModal } from './components/SlaCalculatorModal';
import { DomainSearchView } from './components/DomainSearchView';
import { DomainSearchModal } from './components/DomainSearchModal';
import { OrbitTrackingMapModal } from './components/OrbitTrackingMapModal';
import { IrcStartupLoginModal } from './components/IrcStartupLoginModal';
import { IndexIrcFloatingClient } from './components/IndexIrcFloatingClient';
import { UnifiedAllInOneIndexHub } from './components/UnifiedAllInOneIndexHub';
import { DevPlatformWittLawModal } from './components/DevPlatformWittLawModal';
import { TvNewscastingStudio } from './components/TvNewscastingStudio';
import { OnlineRadioDjStudio } from './components/OnlineRadioDjStudio';
import { MasterControlView } from './components/MasterControlView';
import { IrcLoginCredentials, IrcLoginSession } from './types/irc';
import { UserMembershipState } from './types/membership';
import { DEFAULT_MEMBERSHIP_STATE } from './data/membershipData';
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
  Terminal,
  Calculator,
  Smartphone,
  User
} from 'lucide-react';

const STORAGE_KEY_CUSTOM_COMPANIES = 'satcom_directory_custom_companies';
const STORAGE_KEY_BOOKMARKS = 'satcom_directory_bookmarks';
const STORAGE_KEY_NOTES = 'satcom_directory_user_notes';
const STORAGE_KEY_CART = 'drfun1_store_cart_items';
const STORAGE_KEY_MEMBERSHIP = 'drfun1_user_membership';
const STORAGE_KEY_IRC_SESSION = 'drfun1_irc_session';

export default function App() {
  // Tab state
  const [activeTab, setActiveTab] = useState<AppTab>('broadcast_studio');
  const [directorySubView, setDirectorySubView] = useState<'operators' | 'carriers'>('operators');
  const [storeSubTab, setStoreSubTab] = useState<'catalog' | 'domains'>('catalog');
  const [orbitsSubTab, setOrbitsSubTab] = useState<'tracker' | 'altitude_ladder' | 'donut_distribution' | 'telemetry_apis'>('tracker');
  const [communitySubTab, setCommunitySubTab] = useState<'discussions' | 'memberships' | 'showcase' | 'events' | 'roster' | 'spacebook'>('discussions');
  const [mediaStudioTool, setMediaStudioTool] = useState<StudioToolId>('strimm_drfun1tv');

  // IRC Client Session & Startup Login State
  const [ircSession, setIrcSession] = useState<IrcLoginSession>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_IRC_SESSION);
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return {
      nick: 'RichardAlanWitt',
      ident: 'satcom_web',
      realname: 'DrFun1 Satcom WebIRC Client (dev.drfun1media.com)',
      serverHost: 'dev.drfun1media.com',
      serverPort: 6697,
      useSsl: true,
      channel: '#lobby',
      autoConnectOnStartup: true,
      activeNodeId: 'dev_drfun1media_node',
      connectedAt: Date.now(),
      isConnected: true,
    };
  });

  // Prompt login on startup on index unless session dismissed in current tab
  const [isIrcStartupLoginOpen, setIsIrcStartupLoginOpen] = useState<boolean>(() => {
    try {
      const dismissed = sessionStorage.getItem('drfun1_irc_startup_dismissed');
      return !dismissed;
    } catch (_) {
      return true;
    }
  });

  const handleIrcLogin = (credentials: IrcLoginCredentials, openFullTab?: boolean) => {
    const updated: IrcLoginSession = {
      ...credentials,
      connectedAt: Date.now(),
      isConnected: true,
    };
    setIrcSession(updated);
    try {
      localStorage.setItem(STORAGE_KEY_IRC_SESSION, JSON.stringify(updated));
      sessionStorage.setItem('drfun1_irc_startup_dismissed', 'true');
    } catch (_) {}
    setIsIrcStartupLoginOpen(false);

    if (openFullTab) {
      handleNavigateTab('irc');
    }
  };

  const handleCloseIrcStartupLogin = () => {
    try {
      sessionStorage.setItem('drfun1_irc_startup_dismissed', 'true');
    } catch (_) {}
    setIsIrcStartupLoginOpen(false);
  };

  const handleNavigateTab = (tab: AppTab) => {
    if (tab === 'media' || tab === 'stream') {
      setActiveTab('broadcast_studio');
    } else if (tab === 'mpd') {
      setActiveTab('radio_dj');
    } else if (tab === 'directory' || tab === 'orbits' || tab === 'compare' || tab === 'carriers' || tab === 'integrations') {
      setActiveTab('master_control');
    } else {
      setActiveTab(tab);
    }
  };

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
  const [isSwitchWittModalOpen, setIsSwitchWittModalOpen] = useState(false);
  const [isHostingResellerModalOpen, setIsHostingResellerModalOpen] = useState(false);
  const [isIrcdAdminOpen, setIsIrcdAdminOpen] = useState(false);
  const [isZncWebAdminOpen, setIsZncWebAdminOpen] = useState(false);
  const [isMembershipModalOpen, setIsMembershipModalOpen] = useState(false);
  const [isUnrealSearchOpen, setIsUnrealSearchOpen] = useState(false);
  const [isSlaCalculatorOpen, setIsSlaCalculatorOpen] = useState(false);
  const [slaSelectedCompany, setSlaSelectedCompany] = useState<SatelliteCompany | null>(null);
  const [isDomainSearchModalOpen, setIsDomainSearchModalOpen] = useState(false);
  const [isOrbitMapModalOpen, setIsOrbitMapModalOpen] = useState(false);
  const [isDevPlatformOpen, setIsDevPlatformOpen] = useState(false);
  const [isNewsFeedExpanded, setIsNewsFeedExpanded] = useState(false);
  const [userMembership, setUserMembership] = useState<UserMembershipState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MEMBERSHIP);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading membership state', e);
    }
    return DEFAULT_MEMBERSHIP_STATE;
  });

  const handleUpdateMembership = (updated: UserMembershipState) => {
    setUserMembership(updated);
    try {
      localStorage.setItem(STORAGE_KEY_MEMBERSHIP, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving membership state', e);
    }
  };

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
        if (next.size >= 6) {
          setExportNotice('You can compare a maximum of 6 satellite operators simultaneously.');
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

  // Open SLA Calculator modal handler
  const handleOpenSlaCalculator = (company?: SatelliteCompany) => {
    setSlaSelectedCompany(company || comparedCompaniesList[0] || companies[0] || null);
    setIsSlaCalculatorOpen(true);
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
        setActiveTab={handleNavigateTab}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onExport={handleExportCsv}
        savedCount={bookmarkedIds.size}
        compareCount={comparedIds.size}
        onOpenCompare={() => setIsCompareModalOpen(true)}
        onOpenLicense={() => setIsLicenseModalOpen(true)}
        onOpenSwitchMesh={() => setIsSwitchMeshModalOpen(true)}
        onOpenSwitchWittServices={() => setIsSwitchWittModalOpen(true)}
        onOpenResellerProgram={() => setIsHostingResellerModalOpen(true)}
        onOpenIrcdAdmin={() => setIsIrcdAdminOpen(true)}
        onOpenZncWebAdmin={() => setIsZncWebAdminOpen(true)}
        activeOperRank={activeOperRank}
        cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        userMembership={userMembership}
        onOpenMembershipModal={() => setIsMembershipModalOpen(true)}
        onOpenUnrealSearch={() => setIsUnrealSearchOpen(true)}
        onOpenDomainSearch={() => {
          setActiveTab('store');
          setStoreSubTab('domains');
        }}
        onOpenOrbitMapModal={() => setIsOrbitMapModalOpen(true)}
        onOpenIrcLogin={() => setIsIrcStartupLoginOpen(true)}
        onOpenDevPlatform={() => setIsDevPlatformOpen(true)}
        ircNick={ircSession.nick}
        isIrcConnected={ircSession.isConnected}
      />

      {/* Real-time Telemetry Stats Banner */}
      {(activeTab === 'directory' || activeTab === 'orbits' || activeTab === 'compare') && (
        <StatsBanner 
          companies={companies} 
          onOpenOrbitMap={() => setIsOrbitMapModalOpen(true)}
        />
      )}

      {/* Export Toast Notification */}
      {exportNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 px-4 py-2.5 rounded-lg shadow-xl text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* ========================================================
          5 UNIFIED BROADCASTING, ONLINE RADIO, TV & NEWSCASTING HUBS
          ======================================================== */}

      {/* Hub 1: Master Broadcast In/Out Studio */}
      {activeTab === 'broadcast_studio' || activeTab === 'media' || activeTab === 'stream' || activeTab === 'duplicator' ? (
        <DrFun1MasterBroadcastStudio
          initialTool={
            activeTab === 'stream'
              ? 'restream_multistream'
              : activeTab === 'duplicator'
              ? 'wordpress_duplicator'
              : mediaStudioTool
          }
          onOpenStore={() => setActiveTab('master_control')}
          onOpenIrc={() => setActiveTab('irc')}
          onOpenLicense={() => setIsLicenseModalOpen(true)}
          onOpenSwitchMesh={() => setIsSwitchMeshModalOpen(true)}
          onOpenSwitchWittServices={() => setIsSwitchWittModalOpen(true)}
          onOpenMpd={() => setActiveTab('radio_dj')}
          onOpenDuplicator={() => setActiveTab('broadcast_studio')}
          activeRank={activeOperRank}
          onOpenIrcdAdmin={() => setIsIrcdAdminOpen(true)}
          onOpenIrcStats={() => setActiveTab('irc')}
          onOpenUnrealSearch={() => setIsUnrealSearchOpen(true)}
          onToolChange={(tool) => {
            setMediaStudioTool(tool);
            if (tool === 'irc_client') setActiveTab('irc');
            else if (tool === 'mpd_bot') setActiveTab('radio_dj');
            else setActiveTab('broadcast_studio');
          }}
        />
      ) : activeTab === 'tv_newscast' ? (
        /* Hub 2: Live TV & Newscasting Desk */
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <TvNewscastingStudio
            onOpenLicense={() => setIsLicenseModalOpen(true)}
            onOpenSwitchMesh={() => setIsSwitchMeshModalOpen(true)}
            onNavigateToIrc={() => setActiveTab('irc')}
            activeRank={activeOperRank}
            onOpenIrcdAdmin={() => setIsIrcdAdminOpen(true)}
          />
        </main>
      ) : activeTab === 'radio_dj' || activeTab === 'mpd' ? (
        /* Hub 3: Online Radio & MPD DJ Station */
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <OnlineRadioDjStudio
            onOpenLicense={() => setIsLicenseModalOpen(true)}
            onOpenSwitchMesh={() => setIsSwitchMeshModalOpen(true)}
            onNavigateToIrc={() => setActiveTab('irc')}
            activeRank={activeOperRank}
            onOpenIrcdAdmin={() => setIsIrcdAdminOpen(true)}
            ircSession={ircSession}
            onUpdateSession={(newSession) => {
              const updated: IrcLoginSession = { ...ircSession, ...newSession };
              setIrcSession(updated);
              try {
                localStorage.setItem(STORAGE_KEY_IRC_SESSION, JSON.stringify(updated));
              } catch (_) {}
            }}
          />
        </main>
      ) : activeTab === 'irc' || activeTab === 'ircstats' ? (
        /* Hub 4: Unified IRC Client & Leaf Mesh */
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <IrcClientView
            onOpenLicense={() => setIsLicenseModalOpen(true)}
            onOpenSwitchMesh={() => setIsSwitchMeshModalOpen(true)}
            onNavigateToStore={() => setActiveTab('master_control')}
            onNavigateToStudio={() => setActiveTab('broadcast_studio')}
            activeRank={activeOperRank}
            onOpenIrcdAdmin={() => setIsIrcdAdminOpen(true)}
            onOpenZncWebAdmin={() => setIsZncWebAdminOpen(true)}
            onOpenUnrealSearch={() => setIsUnrealSearchOpen(true)}
          />
        </main>
      ) : activeTab === 'community' || activeTab === 'social' ? (
        /* Community Lounge */
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <CommunityHubView
            userMembership={userMembership}
            onUpdateMembership={handleUpdateMembership}
            onOpenMembershipModal={() => setIsMembershipModalOpen(true)}
            onOpenHostingModal={() => setIsHostingResellerModalOpen(true)}
            onOpenLegalCenter={() => setIsLicenseModalOpen(true)}
            onOpenZncWebAdmin={() => setIsZncWebAdminOpen(true)}
            onOpenSwitchMesh={() => setIsSwitchMeshModalOpen(true)}
            onOpenSwitchWittServices={() => setIsSwitchWittModalOpen(true)}
            onJoinIrcChannel={() => setActiveTab('irc')}
            onNavigateToTab={(tab) => handleNavigateTab(tab)}
            initialSubTab={activeTab === 'social' ? 'spacebook' : communitySubTab}
          />
        </main>
      ) : (
        /* Hub 5: Master Control & Carrier Downlinks (with Switch 100G, DataPacket, TVU CDN & Satellite Downlinks) */
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <MasterControlView
            companies={companies}
            onOpenLicense={() => setIsLicenseModalOpen(true)}
            onOpenSwitchMesh={() => setIsSwitchMeshModalOpen(true)}
            onOpenSwitchWittServices={() => setIsSwitchWittModalOpen(true)}
            onOpenIrcdAdmin={() => setIsIrcdAdminOpen(true)}
            onOpenZncWebAdmin={() => setIsZncWebAdminOpen(true)}
            onOpenUnrealSearch={() => setIsUnrealSearchOpen(true)}
            activeRank={activeOperRank}
          />
        </main>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/90 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Satellite className="w-4 h-4 text-purple-400" />
              <span className="text-white font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-sky-400 bg-clip-text text-transparent">
                DrFun1 Media
              </span>
              <span>—</span>
              <span>Global Broadcasting, TV &amp; Radio Streaming, Satcom Directory &amp; Resale Store</span>
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
        onOpenOrbitMap={() => setIsOrbitMapModalOpen(true)}
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
        onOpenSlaCalculator={(c) => {
          setIsCompareModalOpen(false);
          handleOpenSlaCalculator(c);
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
        onOpenLegalCenter={() => setIsLicenseModalOpen(true)}
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

      {/* Switch.com Owned Infrastructure & Witt Law Firm Satellite Fiber Interactive Portal Modal */}
      <SwitchWittSatelliteFiberModal
        isOpen={isSwitchWittModalOpen}
        onClose={() => setIsSwitchWittModalOpen(false)}
        onAddToCart={(product) => handleQuickAddToCart(product, true)}
      />

      {/* Free & Paid Broadcaster Memberships & Subscription Modal */}
      <MembershipPlansModal
        isOpen={isMembershipModalOpen}
        onClose={() => setIsMembershipModalOpen(false)}
        userMembership={userMembership}
        onUpdateMembership={handleUpdateMembership}
        onOpenLegalCenter={() => setIsLicenseModalOpen(true)}
        onNavigateToTab={(tab) => setActiveTab(tab)}
      />

      {/* Official ZNC 1.9.1 Web Control Panel (webadmin Port 5000) Modal */}
      <ZncWebAdminModal
        isOpen={isZncWebAdminOpen}
        onClose={() => setIsZncWebAdminOpen(false)}
        onNavigateToIrc={() => setActiveTab('irc')}
        onNavigateToStats={() => setActiveTab('ircstats')}
        onOpenLicense={() => setIsLicenseModalOpen(true)}
      />

      {/* UnrealIRCd.org Search Engine - Ask users to leaf to irc.drfun1.com before listing */}
      <UnrealIrcdSearchEngineModal
        isOpen={isUnrealSearchOpen}
        onClose={() => setIsUnrealSearchOpen(false)}
        onNavigateToIrc={(chan) => {
          setActiveTab('irc');
        }}
        onOpenSwitchMesh={() => setIsSwitchMeshModalOpen(true)}
      />

      {/* Satellite Carrier SLA Uptime Credit Calculator Modal */}
      <SlaCalculatorModal
        isOpen={isSlaCalculatorOpen}
        onClose={() => setIsSlaCalculatorOpen(false)}
        companies={comparedCompaniesList.length > 0 ? comparedCompaniesList : companies}
        initialSelectedCompany={slaSelectedCompany}
        onOpenRfq={handleOpenRfq}
      />

      {/* Domain Name Search & Purchase Modal */}
      <DomainSearchModal
        isOpen={isDomainSearchModalOpen}
        onClose={() => setIsDomainSearchModalOpen(false)}
        onAddToCart={(product) => handleQuickAddToCart(product, true)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenLicense={() => setIsLicenseModalOpen(true)}
        onOpenSwitchMesh={() => setIsSwitchMeshModalOpen(true)}
        onNavigateToStudio={() => setActiveTab('media')}
      />

      {/* Orbit Tracking Map Fullscreen / Dialog Modal */}
      <OrbitTrackingMapModal
        isOpen={isOrbitMapModalOpen}
        onClose={() => setIsOrbitMapModalOpen(false)}
        onOpenLicense={() => setIsLicenseModalOpen(true)}
        onOpenSwitchMesh={() => setIsSwitchMeshModalOpen(true)}
      />

      {/* IRC Network Client Startup Login Modal */}
      <IrcStartupLoginModal
        isOpen={isIrcStartupLoginOpen}
        onClose={handleCloseIrcStartupLogin}
        onLogin={handleIrcLogin}
        initialCredentials={ircSession}
      />

      {/* dev.drfun1media.com Developer Platform & WittLaw Moderation Modal */}
      <DevPlatformWittLawModal
        isOpen={isDevPlatformOpen}
        onClose={() => setIsDevPlatformOpen(false)}
        onDispatchIrcQuery={(nick) => {
          handleNavigateTab('irc');
        }}
        onJoinDevChannel={(chan) => {
          handleNavigateTab('irc');
        }}
      />

      {/* Persistent Floating / Docked Live IRC Client on Index */}
      {activeTab === 'directory' && (
        <IndexIrcFloatingClient
          session={ircSession}
          onOpenLoginModal={() => setIsIrcStartupLoginOpen(true)}
          onOpenFullIrcTab={() => handleNavigateTab('irc')}
          onDisconnect={() => {
            setIrcSession((prev) => ({ ...prev, isConnected: false }));
          }}
        />
      )}
    </div>
  );
}
