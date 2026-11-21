/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 */

import {
  BreakingNewsAlert,
  DrFun1NewsBulletin,
  GlobalNewsOutlet,
  NewsStreamSourceType,
} from '../types/drfun1News';
import { getNextDynamicHeadline, INITIAL_RSS_ARTICLES } from './rssNewsData';

export const GLOBAL_NEWS_OUTLETS: GlobalNewsOutlet[] = [
  {
    id: 'news-drfun1-hq',
    callSign: 'DRFUN1 NEWS',
    name: 'DrFun1 News World Desk (4K Flagship)',
    country: 'United States',
    region: 'Global Wire',
    language: 'English',
    category: '24/7 Cable News',
    headquarters: 'Las Vegas Switch SUPERNAP & Washington, DC',
    website: 'https://www.drfun1media.com',
    streamUrl: 'https://news.drfun1media.com/live/world-desk',
    hlsFeedUrl: 'https://stream.drfun1media.com/hls/drfun1-news-4k/index.m3u8',
    currentProgram: 'DrFun1 World Newsroom Live',
    anchorOrDesk: 'Richard Alan Witt & Global Bureau Desk',
    headline: 'Global multi-hub Switch 100G & RisingNet fiber ring delivers sub-2ms live broadcast syndication to 32+ partner newsrooms.',
    isBreaking: true,
    status: 'ON AIR',
    bitrateMbps: 28.4,
    viewers: 42800,
    codec: 'AV1 4K60',
    switchIngestPop: 'Switch SUPERNAP 8 · rn02.losangeles',
    accentColor: '#ef4444',
  },
  {
    id: 'news-reuters-tv',
    callSign: 'REUTERS',
    name: 'Reuters TV Global Wire',
    country: 'United Kingdom / Global',
    region: 'Global Wire',
    language: 'English',
    category: 'Wire & Financial',
    headquarters: 'London, UK',
    website: 'https://www.reuters.com',
    streamUrl: 'https://news.drfun1media.com/relay/reuters-tv',
    hlsFeedUrl: 'https://stream.drfun1media.com/hls/reuters-global/index.m3u8',
    currentProgram: 'Reuters World Business & Diplomatic Wire',
    anchorOrDesk: 'Canary Wharf Bureau',
    headline: 'European bond yields steady ahead of central bank rate guidance while tech capex accelerates.',
    isBreaking: true,
    status: 'ON AIR',
    bitrateMbps: 18.2,
    viewers: 29400,
    codec: 'VP9 HDR',
    switchIngestPop: 'DataPacket London Core · dp07.london',
    accentColor: '#f97316',
  },
  {
    id: 'news-ap-live',
    callSign: 'AP NEWS',
    name: 'Associated Press Television (APT)',
    country: 'United States / Global',
    region: 'Global Wire',
    language: 'English',
    category: 'Wire & Financial',
    headquarters: 'New York, NY',
    website: 'https://apnews.com',
    streamUrl: 'https://news.drfun1media.com/relay/ap-television',
    hlsFeedUrl: 'https://stream.drfun1media.com/hls/ap-direct/index.m3u8',
    currentProgram: 'AP Live Wire & Raw Camera Pool',
    anchorOrDesk: 'NY & Geneva Bureaus',
    headline: 'UN multilateral summit opens plenary session on international satellite orbital debris treaties.',
    isBreaking: false,
    status: 'ON AIR',
    bitrateMbps: 16.5,
    viewers: 21700,
    codec: 'H.264 1080p60',
    switchIngestPop: 'RisingNet rn08.newyork · 100G DWDM',
    accentColor: '#e2e8f0',
  },
  {
    id: 'news-bloomberg',
    callSign: 'BLOOMBERG',
    name: 'Bloomberg Television Global',
    country: 'United States / Global',
    region: 'Global Wire',
    language: 'English',
    category: 'Wire & Financial',
    headquarters: 'New York / London / Hong Kong',
    website: 'https://www.bloomberg.com',
    streamUrl: 'https://news.drfun1media.com/relay/bloomberg-tv',
    hlsFeedUrl: 'https://stream.drfun1media.com/hls/bloomberg-uhd/index.m3u8',
    currentProgram: 'Bloomberg Surveillance & Markets',
    anchorOrDesk: 'Jonathan Ferro & Lisa Abramowicz',
    headline: 'Semiconductor supply chains & LEO satellite telecom equities lead institutional desk inflows.',
    isBreaking: false,
    status: 'ON AIR',
    bitrateMbps: 21.0,
    viewers: 26300,
    codec: 'VP9 HDR',
    switchIngestPop: 'RisingNet rn08.newyork · dp06.newyork',
    accentColor: '#38bdf8',
  },
  {
    id: 'news-cnn-us',
    callSign: 'CNN',
    name: 'CNN Domestic & World Desk',
    country: 'United States',
    region: 'North America',
    language: 'English',
    category: '24/7 Cable News',
    headquarters: 'Atlanta / New York',
    website: 'https://www.cnn.com',
    streamUrl: 'https://news.drfun1media.com/relay/cnn-us',
    hlsFeedUrl: 'https://stream.drfun1media.com/hls/cnn-us/index.m3u8',
    currentProgram: 'CNN Newsroom Live',
    anchorOrDesk: 'Washington & Atlanta Studio',
    headline: 'Senate commerce committee advances bipartisan spectrum modernization and rural broadband bill.',
    isBreaking: true,
    status: 'ON AIR',
    bitrateMbps: 17.8,
    viewers: 34100,
    codec: 'H.264 1080p60',
    switchIngestPop: 'RisingNet rn09.atlanta · 100G DWDM',
    accentColor: '#dc2626',
  },
  {
    id: 'news-cnbc',
    callSign: 'CNBC',
    name: 'CNBC World Business News',
    country: 'United States',
    region: 'North America',
    language: 'English',
    category: 'Wire & Financial',
    headquarters: 'Englewood Cliffs, NJ',
    website: 'https://www.cnbc.com',
    streamUrl: 'https://news.drfun1media.com/relay/cnbc',
    hlsFeedUrl: 'https://stream.drfun1media.com/hls/cnbc-live/index.m3u8',
    currentProgram: 'Squawk on the Street',
    anchorOrDesk: 'NYSE Floor Desk',
    headline: 'Direct-to-cell NTN partnerships expand North American 5G coverage maps.',
    isBreaking: false,
    status: 'ON AIR',
    bitrateMbps: 16.9,
    viewers: 23900,
    codec: 'H.264 1080p60',
    switchIngestPop: 'RisingNet rn08.newyork · 100G DWDM',
    accentColor: '#3b82f6',
  },
  {
    id: 'news-foxnews',
    callSign: 'FOX NEWS',
    name: 'FOX News Channel Live',
    country: 'United States',
    region: 'North America',
    language: 'English',
    category: '24/7 Cable News',
    headquarters: 'New York, NY',
    website: 'https://www.foxnews.com',
    streamUrl: 'https://news.drfun1media.com/relay/fox-news',
    hlsFeedUrl: 'https://stream.drfun1media.com/hls/fox-news/index.m3u8',
    currentProgram: 'Special Report with Bret Baier',
    anchorOrDesk: 'Washington Studio',
    headline: 'Federal judiciary hears oral arguments on interstate telecommunications infrastructure licensing.',
    isBreaking: false,
    status: 'ON AIR',
    bitrateMbps: 18.0,
    viewers: 36500,
    codec: 'VP9 HDR',
    switchIngestPop: 'RisingNet rn01.ashburn · rn08.newyork',
    accentColor: '#2563eb',
  },
  {
    id: 'news-msnbc',
    callSign: 'MSNBC',
    name: 'MSNBC Live Policy & Politics',
    country: 'United States',
    region: 'North America',
    language: 'English',
    category: '24/7 Cable News',
    headquarters: '30 Rockefeller Plaza, NY',
    website: 'https://www.msnbc.com',
    streamUrl: 'https://news.drfun1media.com/relay/msnbc',
    hlsFeedUrl: 'https://stream.drfun1media.com/hls/msnbc/index.m3u8',
    currentProgram: 'Deadline: White House Desk',
    anchorOrDesk: 'New York & DC Anchors',
    headline: 'FCC regulatory updates take center stage alongside federal appellate filings.',
    isBreaking: false,
    status: 'ON AIR',
    bitrateMbps: 16.4,
    viewers: 24800,
    codec: 'H.264 1080p60',
    switchIngestPop: 'RisingNet rn08.newyork · dp06.newyork',
    accentColor: '#0ea5e9',
  },
  {
    id: 'news-abc-live',
    callSign: 'ABC NEWS',
    name: 'ABC News Live 24/7',
    country: 'United States',
    region: 'North America',
    language: 'English',
    category: '24/7 Cable News',
    headquarters: 'New York, NY',
    website: 'https://abcnews.go.com',
    streamUrl: 'https://news.drfun1media.com/relay/abc-news-live',
    hlsFeedUrl: 'https://stream.drfun1media.com/hls/abc-news/index.m3u8',
    currentProgram: 'ABC News Prime',
    anchorOrDesk: 'New York Studio',
    headline: 'Aviation and orbital weather offices track geomagnetic activity over North America.',
    isBreaking: false,
    status: 'ON AIR',
    bitrateMbps: 15.6,
    viewers: 19200,
    codec: 'H.264 1080p60',
    switchIngestPop: 'RisingNet rn08.newyork',
    accentColor: '#94a3b8',
  },
  {
    id: 'news-cbs-247',
    callSign: 'CBS NEWS',
    name: 'CBS News 24/7',
    country: 'United States',
    region: 'North America',
    language: 'English',
    category: '24/7 Cable News',
    headquarters: 'New York, NY',
    website: 'https://www.cbsnews.com',
    streamUrl: 'https://news.drfun1media.com/relay/cbs-247',
    hlsFeedUrl: 'https://stream.drfun1media.com/hls/cbs-247/index.m3u8',
    currentProgram: 'CBS Reports Special',
    anchorOrDesk: 'CBS Broadcast Center',
    headline: 'Deep-dive investigation into solar-powered data centers and clean optical backbones.',
    isBreaking: false,
    status: 'ON AIR',
    bitrateMbps: 15.8,
    viewers: 18400,
    codec: 'VP9 HDR',
    switchIngestPop: 'RisingNet rn01.ashburn',
    accentColor: '#38bdf8',
  },
  {
    id: 'news-nbc-now',
    callSign: 'NBC NOW',
    name: 'NBC News NOW',
    country: 'United States',
    region: 'North America',
    language: 'English',
    category: '24/7 Cable News',
    headquarters: 'New York, NY',
    website: 'https://www.nbcnews.com',
    streamUrl: 'https://news.drfun1media.com/relay/nbc-now',
    hlsFeedUrl: 'https://stream.drfun1media.com/hls/nbc-now/index.m3u8',
    currentProgram: 'Top Story with Tom Llamas',
    anchorOrDesk: '30 Rock Newsroom',
    headline: 'National weather & grid resilience brief ahead of winter peak travel week.',
    isBreaking: false,
    status: 'ON AIR',
    bitrateMbps: 17.2,
    viewers: 20500,
    codec: 'VP9 HDR',
    switchIngestPop: 'RisingNet rn02.losangeles',
    accentColor: '#f59e0b',
  },
  {
    id: 'news-pbs-world',
    callSign: 'PBS NEWS',
    name: 'PBS NewsHour & World Channel',
    country: 'United States',
    region: 'North America',
    language: 'English',
    category: 'Public Broadcaster',
    headquarters: 'Arlington, VA',
    website: 'https://www.pbs.org/newshour',
    streamUrl: 'https://news.drfun1media.com/relay/pbs-news',
    hlsFeedUrl: 'https://stream.drfun1media.com/hls/pbs-news/index.m3u8',
    currentProgram: 'PBS NewsHour Extended',
    anchorOrDesk: 'Amna Nawaz & Geoff Bennett',
    headline: 'In-depth science, diplomacy, and federal courts reporting without commercial interruption.',
    isBreaking: false,
    status: 'ON AIR',
    bitrateMbps: 16.0,
    viewers: 14100,
    codec: 'VP9 HDR',
    switchIngestPop: 'RisingNet rn01.ashburn',
    accentColor: '#60a5fa',
  },
  {
    id: 'news-scotus-cspan',
    callSign: 'SCOTUS / C-SPAN',
    name: 'SCOTUS Docket & C-SPAN Federal Live',
    country: 'United States',
    region: 'North America',
    language: 'English',
    category: 'Judicial & Policy',
    headquarters: 'Washington, DC',
    website: 'https://www.supremecourt.gov',
    streamUrl: 'https://news.drfun1media.com/live/scotus-docket',
    hlsFeedUrl: 'https://stream.drfun1media.com/hls/scotus-cspan/index.m3u8',
    currentProgram: 'Supreme Court Oral Arguments & WittLaw Desk',
    anchorOrDesk: 'Supreme Court Press Pool & wittlawfirm.com',
    headline: 'Live coverage of Supreme Court appellate docket & FCC FRN 0034981290 carrier briefings.',
    isBreaking: true,
    status: 'ON AIR',
    bitrateMbps: 19.5,
    viewers: 17600,
    codec: 'VP9 HDR',
    switchIngestPop: 'RisingNet rn01.ashburn · DC Court Trunk',
    accentColor: '#10b981',
  },
  {
    id: 'news-cbc-nn',
    callSign: 'CBC NEWS',
    name: 'CBC News Network Canada',
    country: 'Canada',
    region: 'North America',
    language: 'English',
    category: 'Public Broadcaster',
    headquarters: 'Toronto, ON',
    website: 'https://www.cbc.ca/news',
    streamUrl: 'https://news.drfun1media.com/relay/cbc-news',
    hlsFeedUrl: 'https://stream.drfun1media.com/hls/cbc-news/index.m3u8',
    currentProgram: 'CBC News Live with Adrienne Arsenault',
    anchorOrDesk: 'Toronto Broadcast Centre',
    headline: 'Arctic satellite polar relay stations expand northern community gigabit connectivity.',
    isBreaking: false,
    status: 'ON AIR',
    bitrateMbps: 14.8,
    viewers: 11200,
    codec: 'H.264 1080p60',
    switchIngestPop: 'DataPacket Toronto · dp17.toronto',
    accentColor: '#f87171',
  },
  {
    id: 'news-bbc-world',
    callSign: 'BBC NEWS',
    name: 'BBC News (World Feed)',
    country: 'United Kingdom',
    region: 'Europe',
    language: 'English',
    category: 'Public Broadcaster',
    headquarters: 'Broadcasting House, London',
    website: 'https://www.bbc.com/news',
    streamUrl: 'https://news.drfun1media.com/relay/bbc-world',
    hlsFeedUrl: 'https://stream.drfun1media.com/hls/bbc-world/index.m3u8',
    currentProgram: 'BBC World News Today',
    anchorOrDesk: 'London Studio B & Singapore Desk',
    headline: 'Global diplomatic correspondents report on European energy corridors and Atlantic subsea cables.',
    isBreaking: true,
    status: 'ON AIR',
    bitrateMbps: 20.4,
    viewers: 38900,
    codec: 'AV1 4K60',
    switchIngestPop: 'DataPacket London · dp07.london',
    accentColor: '#b91c1c',
  },
  {
    id: 'news-sky-uk',
    callSign: 'SKY NEWS',
    name: 'Sky News International',
    country: 'United Kingdom',
    region: 'Europe',
    language: 'English',
    category: '24/7 Cable News',
    headquarters: 'Osterley, London',
    website: 'https://news.sky.com',
    streamUrl: 'https://news.drfun1media.com/relay/sky-news',
    hlsFeedUrl: 'https://stream.drfun1media.com/hls/sky-news/index.m3u8',
    currentProgram: 'Sky News Tonight',
    anchorOrDesk: 'London Westminster Desk',
    headline: 'Parliamentary technology committee opens inquiry into low-earth-orbit carrier competition.',
    isBreaking: false,
    status: 'ON AIR',
    bitrateMbps: 17.5,
    viewers: 22400,
    codec: 'VP9 HDR',
    switchIngestPop: 'DataPacket London · dp07.london',
    accentColor: '#38bdf8',
  },
  {
    id: 'news-euronews',
    callSign: 'EURONEWS',
    name: 'Euronews Multilingual HD',
    country: 'European Union / France',
    region: 'Europe',
    language: 'Multilingual (EN/FR/DE)',
    category: '24/7 Cable News',
    headquarters: 'Lyon & Brussels',
    website: 'https://www.euronews.com',
    streamUrl: 'https://news.drfun1media.com/relay/euronews',
    hlsFeedUrl: 'https://stream.drfun1media.com/hls/euronews/index.m3u8',
    currentProgram: 'Euronews Now: Brussels Bureau',
    anchorOrDesk: 'EU Institutions Desk',
    headline: 'EU IRIS2 sovereign multi-orbit constellation contracts advance with European consortium.',
    isBreaking: false,
    status: 'ON AIR',
    bitrateMbps: 15.2,
    viewers: 16800,
    codec: 'H.264 1080p60',
    switchIngestPop: 'DataPacket Paris · dp13.paris',
    accentColor: '#22d3ee',
  },
  {
    id: 'news-france24',
    callSign: 'FRANCE 24',
    name: 'France 24 English',
    country: 'France',
    region: 'Europe',
    language: 'English',
    category: 'Public Broadcaster',
    headquarters: 'Paris, France',
    website: 'https://www.france24.com/en/',
    streamUrl: 'https://news.drfun1media.com/relay/france24',
    hlsFeedUrl: 'https://stream.drfun1media.com/hls/france24/index.m3u8',
    currentProgram: 'The Debate & World News',
    anchorOrDesk: 'Paris Newsroom',
    headline: 'Arianespace Kourou spaceport prepares upcoming multi-payload commercial GEO/MEO manifest.',
    isBreaking: false,
    status: 'ON AIR',
    bitrateMbps: 15.0,
    viewers: 14700,
    codec: 'H.264 1080p60',
    switchIngestPop: 'DataPacket Paris · dp13.paris',
    accentColor: '#0284c7',
  },
  {
    id: 'news-dw',
    callSign: 'DW NEWS',
    name: 'Deutsche Welle (DW News)',
    country: 'Germany',
    region: 'Europe',
    language: 'English',
    category: 'Public Broadcaster',
    headquarters: 'Berlin & Bonn, Germany',
    website: 'https://www.dw.com',
    streamUrl: 'https://news.drfun1media.com/relay/dw-news',
    hlsFeedUrl: 'https://stream.drfun1media.com/hls/dw-news/index.m3u8',
    currentProgram: 'DW News Berlin',
    anchorOrDesk: 'Berlin International Desk',
    headline: 'DE-CIX Frankfurt optical peering sets fresh terabit peak record with zero packet drop.',
    isBreaking: false,
    status: 'ON AIR',
    bitrateMbps: 16.3,
    viewers: 15900,
    codec: 'VP9 HDR',
    switchIngestPop: 'DataPacket Frankfurt · dp09.frankfurt',
    accentColor: '#60a5fa',
  },
  {
    id: 'news-rai24',
    callSign: 'RAI NEWS 24',
    name: 'RAI News 24 Italia',
    country: 'Italy',
    region: 'Europe',
    language: 'Italian',
    category: 'Public Broadcaster',
    headquarters: 'Rome, Italy',
    website: 'https://www.rainews.it',
    streamUrl: 'https://news.drfun1media.com/relay/rai-news-24',
    hlsFeedUrl: 'https://stream.drfun1media.com/hls/rai24/index.m3u8',
    currentProgram: 'Edizione Diretta Roma',
    anchorOrDesk: 'Saxa Rubra Studio',
    headline: 'Mediterranean subsea fiber landing stations expand capacity into Milan and Marseille.',
    isBreaking: false,
    status: 'ON AIR',
    bitrateMbps: 13.8,
    viewers: 9600,
    codec: 'H.264 1080p60',
    switchIngestPop: 'DataPacket Milan · dp23.milan',
    accentColor: '#38bdf8',
  },
  {
    id: 'news-tve24h',
    callSign: '24H TVE',
    name: 'RTVE Canal 24 Horas',
    country: 'Spain',
    region: 'Europe',
    language: 'Spanish',
    category: 'Public Broadcaster',
    headquarters: 'Madrid, Spain',
    website: 'https://www.rtve.es/noticias/',
    streamUrl: 'https://news.drfun1media.com/relay/tve-24h',
    hlsFeedUrl: 'https://stream.drfun1media.com/hls/tve24h/index.m3u8',
    currentProgram: 'Telediario Internacional',
    anchorOrDesk: 'Torrespaña Madrid',
    headline: 'Trans-Atlantic Iberia subsea corridor links Madrid deep space station with Americas.',
    isBreaking: false,
    status: 'ON AIR',
    bitrateMbps: 14.1,
    viewers: 10300,
    codec: 'H.264 1080p60',
    switchIngestPop: 'DataPacket Madrid · dp14.madrid',
    accentColor: '#fbbf24',
  },
  {
    id: 'news-aljazeera',
    callSign: 'AL JAZEERA',
    name: 'Al Jazeera English',
    country: 'Qatar',
    region: 'Middle East',
    language: 'English',
    category: '24/7 Cable News',
    headquarters: 'Doha, Qatar',
    website: 'https://www.aljazeera.com',
    streamUrl: 'https://news.drfun1media.com/relay/aljazeera-en',
    hlsFeedUrl: 'https://stream.drfun1media.com/hls/aje-live/index.m3u8',
    currentProgram: 'Newshour Doha & London',
    anchorOrDesk: 'Doha Global Desk',
    headline: 'Correspondents report live on international diplomacy, maritime trade routes, and climate summits.',
    isBreaking: true,
    status: 'ON AIR',
    bitrateMbps: 19.0,
    viewers: 31200,
    codec: 'VP9 HDR',
    switchIngestPop: 'Switch MEA Gateway · Doha QDC5',
    accentColor: '#f59e0b',
  },
  {
    id: 'news-alarabiya',
    callSign: 'AL ARABIYA',
    name: 'Al Arabiya English & Business',
    country: 'UAE / Saudi Arabia',
    region: 'Middle East',
    language: 'Arabic / English',
    category: '24/7 Cable News',
    headquarters: 'Riyadh & Dubai',
    website: 'https://english.alarabiya.net',
    streamUrl: 'https://news.drfun1media.com/relay/alarabiya',
    hlsFeedUrl: 'https://stream.drfun1media.com/hls/alarabiya/index.m3u8',
    currentProgram: 'Business & Energy Markets Desk',
    anchorOrDesk: 'Riyadh Media City',
    headline: 'Gulf sovereign cloud & space teleport investments draw global carrier interconnect partners.',
    isBreaking: false,
    status: 'ON AIR',
    bitrateMbps: 16.1,
    viewers: 16400,
    codec: 'H.264 1080p60',
    switchIngestPop: 'Switch MEA Gateway · Equinix DX1 Dubai',
    accentColor: '#a855f7',
  },
  {
    id: 'news-trtworld',
    callSign: 'TRT WORLD',
    name: 'TRT World 24/7',
    country: 'Turkey',
    region: 'Middle East',
    language: 'English',
    category: 'Public Broadcaster',
    headquarters: 'Istanbul, Turkey',
    website: 'https://www.trtworld.com',
    streamUrl: 'https://news.drfun1media.com/relay/trt-world',
    hlsFeedUrl: 'https://stream.drfun1media.com/hls/trt-world/index.m3u8',
    currentProgram: 'TRT World Headlines',
    anchorOrDesk: 'Istanbul Bosphorus Studio',
    headline: 'Eurasian transit corridors boost high-capacity terrestrial optical diversity.',
    isBreaking: false,
    status: 'ON AIR',
    bitrateMbps: 14.9,
    viewers: 12100,
    codec: 'H.264 1080p60',
    switchIngestPop: 'Switch EMEA · Equinix IL2 Istanbul',
    accentColor: '#06b6d4',
  },
  {
    id: 'news-nhk-world',
    callSign: 'NHK WORLD',
    name: 'NHK World-Japan 4K',
    country: 'Japan',
    region: 'Asia-Pacific',
    language: 'English',
    category: 'Public Broadcaster',
    headquarters: 'Tokyo, Japan',
    website: 'https://www3.nhk.or.jp/nhkworld/',
    streamUrl: 'https://news.drfun1media.com/relay/nhk-world',
    hlsFeedUrl: 'https://stream.drfun1media.com/hls/nhk-world-4k/index.m3u8',
    currentProgram: 'NHK Newsline Tokyo',
    anchorOrDesk: 'Shibuya Broadcast Center',
    headline: 'Pacific tsunami early-warning buoy & optical laser satellite relay systems tested successfully.',
    isBreaking: false,
    status: 'ON AIR',
    bitrateMbps: 22.8,
    viewers: 21500,
    codec: 'AV1 4K60',
    switchIngestPop: 'DataPacket Tokyo · dp10.tokyo',
    accentColor: '#38bdf8',
  },
  {
    id: 'news-cna',
    callSign: 'CNA',
    name: 'CNA (Channel NewsAsia)',
    country: 'Singapore',
    region: 'Asia-Pacific',
    language: 'English',
    category: '24/7 Cable News',
    headquarters: 'Singapore',
    website: 'https://www.channelnewsasia.com',
    streamUrl: 'https://news.drfun1media.com/relay/cna',
    hlsFeedUrl: 'https://stream.drfun1media.com/hls/cna-asia/index.m3u8',
    currentProgram: 'Asia Tonight',
    anchorOrDesk: 'Mediacorp Campus Singapore',
    headline: 'ASEAN semiconductor manufacturing & maritime logistics hubs report record Q4 throughput.',
    isBreaking: false,
    status: 'ON AIR',
    bitrateMbps: 17.0,
    viewers: 18700,
    codec: 'VP9 HDR',
    switchIngestPop: 'DataPacket Singapore · dp11.singapore',
    accentColor: '#ef4444',
  },
  {
    id: 'news-abc-au',
    callSign: 'ABC AU',
    name: 'ABC News Australia',
    country: 'Australia',
    region: 'Asia-Pacific',
    language: 'English',
    category: 'Public Broadcaster',
    headquarters: 'Sydney, Australia',
    website: 'https://www.abc.net.au/news',
    streamUrl: 'https://news.drfun1media.com/relay/abc-australia',
    hlsFeedUrl: 'https://stream.drfun1media.com/hls/abc-au/index.m3u8',
    currentProgram: 'ABC News Breakfast / Pacific Desk',
    anchorOrDesk: 'Ultimo Studio Sydney',
    headline: 'Oceania telecom carriers expand rural satellite broadband reach across outback regions.',
    isBreaking: false,
    status: 'ON AIR',
    bitrateMbps: 15.4,
    viewers: 12900,
    codec: 'H.264 1080p60',
    switchIngestPop: 'DataPacket Sydney · dp12.sydney',
    accentColor: '#34d399',
  },
  {
    id: 'news-wion',
    callSign: 'WION',
    name: 'WION (World Is One News)',
    country: 'India',
    region: 'Asia-Pacific',
    language: 'English',
    category: '24/7 Cable News',
    headquarters: 'New Delhi / Mumbai',
    website: 'https://www.wionews.com',
    streamUrl: 'https://news.drfun1media.com/relay/wion',
    hlsFeedUrl: 'https://stream.drfun1media.com/hls/wion/index.m3u8',
    currentProgram: 'Gravitas & World Desk',
    anchorOrDesk: 'New Delhi Broadcast Desk',
    headline: 'ISRO deep-space orbital telemetry milestone sets new cost efficiency benchmark.',
    isBreaking: false,
    status: 'ON AIR',
    bitrateMbps: 15.9,
    viewers: 19600,
    codec: 'H.264 1080p60',
    switchIngestPop: 'DataPacket Mumbai · dp19.mumbai',
    accentColor: '#fb923c',
  },
  {
    id: 'news-arirang',
    callSign: 'ARIRANG',
    name: 'Arirang TV Korea',
    country: 'South Korea',
    region: 'Asia-Pacific',
    language: 'English',
    category: 'Public Broadcaster',
    headquarters: 'Seoul, South Korea',
    website: 'https://www.arirang.com',
    streamUrl: 'https://news.drfun1media.com/relay/arirang',
    hlsFeedUrl: 'https://stream.drfun1media.com/hls/arirang/index.m3u8',
    currentProgram: 'Arirang News Now',
    anchorOrDesk: 'Seocho-gu Seoul Studio',
    headline: 'Next-gen 6G satellite-terrestrial handoff trials demonstrate seamless 4K streaming.',
    isBreaking: false,
    status: 'ON AIR',
    bitrateMbps: 16.7,
    viewers: 11400,
    codec: 'VP9 HDR',
    switchIngestPop: 'DataPacket Seoul · dp20.seoul',
    accentColor: '#818cf8',
  },
  {
    id: 'news-globonews',
    callSign: 'GLOBONEWS',
    name: 'GloboNews Brasil',
    country: 'Brazil',
    region: 'Latin America',
    language: 'Portuguese',
    category: '24/7 Cable News',
    headquarters: 'Rio de Janeiro & Sao Paulo',
    website: 'https://g1.globo.com/globonews/',
    streamUrl: 'https://news.drfun1media.com/relay/globonews',
    hlsFeedUrl: 'https://stream.drfun1media.com/hls/globonews/index.m3u8',
    currentProgram: 'Jornal das Dez',
    anchorOrDesk: 'Sao Paulo Studio',
    headline: 'Mercosur fiber-to-satellite interconnects expand telemetry across Amazon basin stations.',
    isBreaking: false,
    status: 'ON AIR',
    bitrateMbps: 15.1,
    viewers: 13800,
    codec: 'H.264 1080p60',
    switchIngestPop: 'DataPacket Sao Paulo · dp18.saopaulo',
    accentColor: '#ef4444',
  },
  {
    id: 'news-sabc',
    callSign: 'SABC NEWS',
    name: 'SABC News Africa',
    country: 'South Africa',
    region: 'Africa',
    language: 'English',
    category: 'Public Broadcaster',
    headquarters: 'Auckland Park, Johannesburg',
    website: 'https://www.sabcnews.com',
    streamUrl: 'https://news.drfun1media.com/relay/sabc-news',
    hlsFeedUrl: 'https://stream.drfun1media.com/hls/sabc-news/index.m3u8',
    currentProgram: 'Full View Live',
    anchorOrDesk: 'Johannesburg News Desk',
    headline: 'Sub-Saharan terrestrial optical rings connect coastal submarine cable landings.',
    isBreaking: false,
    status: 'ON AIR',
    bitrateMbps: 14.0,
    viewers: 10900,
    codec: 'H.264 1080p60',
    switchIngestPop: 'Switch Africa · Teraco JB1 NAPAfrica',
    accentColor: '#10b981',
  },
  {
    id: 'news-africanews',
    callSign: 'AFRICANEWS',
    name: 'Africanews Pan-African Desk',
    country: 'Pan-African (Brazzaville)',
    region: 'Africa',
    language: 'English / French',
    category: '24/7 Cable News',
    headquarters: 'Pointe-Noire / Lyon',
    website: 'https://www.africanews.com',
    streamUrl: 'https://news.drfun1media.com/relay/africanews',
    hlsFeedUrl: 'https://stream.drfun1media.com/hls/africanews/index.m3u8',
    currentProgram: 'The Morning Call & Business Africa',
    anchorOrDesk: 'Pan-African Correspondents',
    headline: 'East African fintech & mobile satellite broadband adoption surges to new quarterly high.',
    isBreaking: false,
    status: 'ON AIR',
    bitrateMbps: 14.3,
    viewers: 9800,
    codec: 'H.264 1080p60',
    switchIngestPop: 'Switch Africa · Africa Data Centres NBO1',
    accentColor: '#22c55e',
  },
  {
    id: 'news-nasa-scan',
    callSign: 'NASA NEWS',
    name: 'NASA TV Space & Science Desk',
    country: 'United States / Orbit',
    region: 'Global Wire',
    language: 'English',
    category: 'Science & Satcom',
    headquarters: 'Houston, TX & Washington, DC',
    website: 'https://plus.nasa.gov',
    streamUrl: 'https://news.drfun1media.com/relay/nasa-news',
    hlsFeedUrl: 'https://stream.drfun1media.com/hls/nasa-news-4k/index.m3u8',
    currentProgram: 'NASA Live Mission Coverage & SCaN Briefing',
    anchorOrDesk: 'Johnson Space Center PAO',
    headline: 'Artemis & ISS optical laser relay experiments achieve record 1.2 Gbps Earth downlink.',
    isBreaking: true,
    status: 'ON AIR',
    bitrateMbps: 25.0,
    viewers: 27400,
    codec: 'AV1 4K60',
    switchIngestPop: 'Orbital Teleport · Goldstone DSN',
    accentColor: '#0ea5e9',
  },
];

export const INITIAL_DRFUN1_NEWS_BULLETINS: DrFun1NewsBulletin[] = [
  {
    id: 'bul-1',
    outletCallSign: 'DRFUN1 NEWS',
    region: 'Global Wire',
    headline: 'DrFun1 News World Desk now syndicating 33 international broadcast outlets live over Switch 100G & 10 RisingNet optical servers.',
    priority: 'FLASH',
    timestamp: 'Just now',
    author: 'RichardAlanWitt',
  },
  {
    id: 'bul-2',
    outletCallSign: 'SCOTUS / C-SPAN',
    region: 'North America',
    headline: 'Supreme Court Docket #26-0881 appellate stream synchronized with www.wittlawfirm.com & FCC FRN 0034981290 compliance desk.',
    priority: 'URGENT',
    timestamp: '4m ago',
    author: 'ChiefJustice_JohnRoberts',
  },
  {
    id: 'bul-3',
    outletCallSign: 'BBC NEWS',
    region: 'Europe',
    headline: 'European IRIS2 satellite relay infrastructure talks advance from Brussels & London bureaus.',
    priority: 'WORLD DESK',
    timestamp: '9m ago',
    author: 'London Bureau Pool',
  },
];

// Realistic upcoming 2-hour EPG lineup mapped for every built-in global news outlet (33 outlets)
export const OUTLET_UPCOMING_PROGRAMS: Record<
  string,
  { nextTitle: string; nextSynopsis: string; laterTitle: string; laterSynopsis: string }
> = {
  'news-drfun1-hq': {
    nextTitle: 'DrFun1 Prime World Wire & Satcom Telemetry',
    nextSynopsis: 'Live optical carrier reports across Switch SUPERNAP 100G & 10 RisingNet backbones.',
    laterTitle: 'Global Desk Overnight with Capitol & London Bureaus',
    laterSynopsis: 'Continuous international breaking news, markets & FCC spectrum docket coverage.',
  },
  'news-reuters-tv': {
    nextTitle: 'Reuters Global Markets & Central Bank Brief',
    nextSynopsis: 'Sovereign debt, currency desks & European industrial supply chain analysis.',
    laterTitle: 'Reuters Diplomatic & UN Security Council Wrap',
    laterSynopsis: 'Correspondent reports from Geneva, London, Tokyo & Washington.',
  },
  'news-ap-live': {
    nextTitle: 'AP Raw Camera Pool: Global Press Briefings',
    nextSynopsis: 'Unedited multilateral summits and breaking live agency feeds.',
    laterTitle: 'AP World Science, Climate & Space Coverage',
    laterSynopsis: 'Orbital treaty developments and international observatory briefings.',
  },
  'news-bloomberg': {
    nextTitle: 'Bloomberg Markets: Asia-Europe Crossover',
    nextSynopsis: 'Equities, telecom infrastructure capex & semiconductor futures.',
    laterTitle: 'Bloomberg Technology & Satellite Capital',
    laterSynopsis: 'Interviews with LEO constellation founders and institutional funds.',
  },
  'news-cnn-us': {
    nextTitle: 'CNN Inside Politics & Capitol Hill',
    nextSynopsis: 'Live floor votes, Senate Commerce briefings and national desk reporting.',
    laterTitle: 'CNN International Connect the World',
    laterSynopsis: 'Global diplomatic and breaking crisis coverage across five continents.',
  },
  'news-cnbc': {
    nextTitle: 'Closing Bell: Worldwide Market Desk',
    nextSynopsis: 'Real-time NYSE/NASDAQ reaction and 5G NTN carrier earnings coverage.',
    laterTitle: 'CNBC Squawk Box Asia & Europe Preview',
    laterSynopsis: 'Pre-market futures and global sovereign bond desk commentary.',
  },
  'news-foxnews': {
    nextTitle: 'The Story & Washington Bureau Live',
    nextSynopsis: 'Federal policy, energy independence and national security analysis.',
    laterTitle: 'FOX News @ Night West Coast Desk',
    laterSynopsis: 'Live congressional interviews and appellate court docket updates.',
  },
  'news-msnbc': {
    nextTitle: 'The Beat & Federal Justice Desk',
    nextSynopsis: 'Constitutional law panel and FCC regulatory compliance coverage.',
    laterTitle: 'The 11th Hour Live World Panel',
    laterSynopsis: 'Late-evening national and international diplomatic correspondents.',
  },
  'news-abc-live': {
    nextTitle: 'ABC World News Tonight Extended',
    nextSynopsis: 'National weather emergencies, aviation telemetry and top domestic stories.',
    laterTitle: 'Nightline Live Investigation Desk',
    laterSynopsis: 'Long-form reporting from ABC domestic and international bureaus.',
  },
  'news-cbs-247': {
    nextTitle: 'CBS Evening News Full Stream',
    nextSynopsis: 'Investigative reporting on clean energy, data centers and public health.',
    laterTitle: 'CBS 24/7 Americas & Pacific Edition',
    laterSynopsis: 'Overnight live breaking coverage from New York and Los Angeles.',
  },
  'news-nbc-now': {
    nextTitle: 'NBC Nightly News International Stream',
    nextSynopsis: 'National travel, severe weather tracking and White House briefings.',
    laterTitle: 'Hallie Jackson & Washington Late Desk',
    laterSynopsis: 'Live political reporting and technology policy spotlights.',
  },
  'news-pbs-world': {
    nextTitle: 'Washington Week & Foreign Affairs Desk',
    nextSynopsis: 'Commercial-free roundtable with diplomatic and science reporters.',
    laterTitle: 'Amanpour & Company Global Forum',
    laterSynopsis: 'In-depth interviews with world leaders, jurists and authors.',
  },
  'news-scotus-cspan': {
    nextTitle: 'WittLaw Federal Appellate Docket Analysis',
    nextSynopsis: 'Full breakdown of FCC FRN 0034981290 rulings and communications law.',
    laterTitle: 'C-SPAN Congressional Floor & Hearing Archive',
    laterSynopsis: 'Gavel-to-gavel legislative proceedings and judicial confirmation hearings.',
  },
  'news-cbc-nn': {
    nextTitle: 'Power & Politics Ottawa Desk',
    nextSynopsis: 'Canadian federal legislation, Arctic broadband and trade negotiations.',
    laterTitle: 'The National with Adrienne Arsenault',
    laterSynopsis: 'CBC flagship evening news and investigative documentaries.',
  },
  'news-bbc-world': {
    nextTitle: 'BBC News at Ten & Global Impact',
    nextSynopsis: 'Comprehensive UK, European and Commonwealth international reporting.',
    laterTitle: 'BBC HARDtalk & Dateline London',
    laterSynopsis: 'Unfiltered interviews with international policymakers and journalists.',
  },
  'news-sky-uk': {
    nextTitle: 'Sky News Press Preview & Westminster',
    nextSynopsis: 'Next-day UK front pages and parliamentary tech committee updates.',
    laterTitle: 'Sky News Global Live Desk',
    laterSynopsis: 'Overnight European and Atlantic breaking news updates.',
  },
  'news-euronews': {
    nextTitle: 'Brussels My Love & EU Policy Brief',
    nextSynopsis: 'European Parliament debates on IRIS2 satellites and digital sovereignty.',
    laterTitle: 'Euronews Witness: Europe in Focus',
    laterSynopsis: 'On-the-ground documentary dispatches across EU member states.',
  },
  'news-france24': {
    nextTitle: 'France 24 Perspectives & Europe Desk',
    nextSynopsis: 'Analysis of European security, space launches and Francophone affairs.',
    laterTitle: 'France 24 Encore & Tech 24',
    laterSynopsis: 'Culture, aerospace engineering and global cinema coverage from Paris.',
  },
  'news-dw': {
    nextTitle: 'DW Conflict Zone & Business Germany',
    nextSynopsis: 'Industrial manufacturing, DE-CIX peering records and European energy.',
    laterTitle: 'DW Shift & Global Science Magazine',
    laterSynopsis: 'Deep technology, robotics and transatlantic diplomacy reports.',
  },
  'news-rai24': {
    nextTitle: 'RAI Economia & Mediterraneo Live',
    nextSynopsis: 'Italian financial markets and Mediterranean subsea cable infrastructure.',
    laterTitle: 'RAI Notte 24 Diretta Roma',
    laterSynopsis: 'Continuous overnight Italian and Vatican diplomatic dispatches.',
  },
  'news-tve24h': {
    nextTitle: 'La Noche en 24 Horas Madrid',
    nextSynopsis: 'Iberian politics, Latin America links and deep space ground telemetry.',
    laterTitle: 'RTVE América & Global Wire',
    laterSynopsis: 'Trans-Atlantic Spanish-language breaking news desk.',
  },
  'news-aljazeera': {
    nextTitle: 'Inside Story & Middle East Brief',
    nextSynopsis: 'Multi-panel analysis from Doha, Beirut, Cairo and London.',
    laterTitle: 'Counting the Cost & Al Jazeera World',
    laterSynopsis: 'Global maritime trade, sovereign wealth and geopolitical reporting.',
  },
  'news-alarabiya': {
    nextTitle: 'Gulf Markets & Sovereign Cloud Report',
    nextSynopsis: 'Riyadh and Dubai telecom investments and OPEC+ energy briefings.',
    laterTitle: 'Al Arabiya Panorama Diplomatic Hour',
    laterSynopsis: 'Regional summits and Middle East technology corridors.',
  },
  'news-trtworld': {
    nextTitle: 'The Newsmakers & Strait Briefing',
    nextSynopsis: 'Eurasian transit corridors, trade logistics and Black Sea security.',
    laterTitle: 'TRT World Showcase & Strait Talk',
    laterSynopsis: 'Geopolitical roundtables from Istanbul and Washington.',
  },
  'news-nhk-world': {
    nextTitle: 'NHK Newsroom Tokyo & Science View',
    nextSynopsis: 'Optical laser relay satellites, robotics and Pacific early-warning buoys.',
    laterTitle: 'Asia Insight & Direct Talk',
    laterSynopsis: 'On-location documentaries from across Japan and East Asia.',
  },
  'news-cna': {
    nextTitle: 'CNA East Asia & Money Mind',
    nextSynopsis: 'Singapore semiconductor logistics and ASEAN central bank coverage.',
    laterTitle: 'CNA Insight Investigative Desk',
    laterSynopsis: 'Special reports on Asia-Pacific trade and subsea cable security.',
  },
  'news-abc-au': {
    nextTitle: 'ABC 7.30 Report & The Business',
    nextSynopsis: 'Australian resources, Indo-Pacific security and rural satellite networks.',
    laterTitle: 'ABC Pacific Beat & Overnight Wire',
    laterSynopsis: 'Regional reporting across Australia, New Zealand and Oceania.',
  },
  'news-wion': {
    nextTitle: 'WION World Order & ISRO Space Watch',
    nextSynopsis: 'South Asian diplomacy, orbital telemetry and Indo-Pacific strategy.',
    laterTitle: 'WION Global Leadership Series',
    laterSynopsis: 'Interviews with diplomats, defense analysts and space engineers.',
  },
  'news-arirang': {
    nextTitle: 'Arirang Biz & K-Tech 6G Report',
    nextSynopsis: 'Korean semiconductor exports and 6G satellite-terrestrial trials.',
    laterTitle: 'Arirang Global Insight Seoul',
    laterSynopsis: 'Korean Peninsula policy and global cultural diplomacy.',
  },
  'news-globonews': {
    nextTitle: 'Em Ponto & Mercosur Economic Hour',
    nextSynopsis: 'Brazilian fiscal policy, Sao Paulo exchange and Amazon telemetry.',
    laterTitle: 'GloboNews Painel & Edição da Madrugada',
    laterSynopsis: 'South American political analysis and overnight live updates.',
  },
  'news-sabc': {
    nextTitle: 'SABC Globe & Southern Africa Markets',
    nextSynopsis: 'Johannesburg power grid updates, mining equities and fiber rings.',
    laterTitle: 'SABC Prime Live Desk',
    laterSynopsis: 'Pan-African parliamentary and continental development news.',
  },
  'news-africanews': {
    nextTitle: 'Sci-Tech Africa & Startup Spotlight',
    nextSynopsis: 'East African fintech, mobile money and satellite broadband rollouts.',
    laterTitle: 'Africanews Tonight Multilingual',
    laterSynopsis: 'Breaking news across West, Central, East and Southern Africa.',
  },
  'news-nasa-scan': {
    nextTitle: 'ISS Expedition Mission Control Feed',
    nextSynopsis: 'Live astronaut downlink, orbital debris tracking and Goldstone DSN.',
    laterTitle: 'Artemis Deep Space Optical Comms Brief',
    laterSynopsis: 'Engineering briefings on 1.2 Gbps laser Earth-to-Moon relays.',
  },
};

const formatHourSlot = (baseDate: Date, offsetMinutes: number): string => {
  const d = new Date(baseDate.getTime() + offsetMinutes * 60000);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export function buildWorldNewsEpgRows(
  outlets: GlobalNewsOutlet[],
  allOrderedOutlets: GlobalNewsOutlet[],
  nowDate: Date = new Date()
): import('../types/drfun1News').NewsOutletEpgRow[] {
  // Align EPG block to the top of the current hour for realistic broadcast blocks
  const blockStart = new Date(nowDate);
  blockStart.setMinutes(0, 0, 0);
  const currentMinutePct = Math.max(8, Math.min(96, Math.round((nowDate.getMinutes() / 60) * 100)));

  const nowWindow = `${formatHourSlot(blockStart, 0)} – ${formatHourSlot(blockStart, 60)}`;
  const nextWindow = `${formatHourSlot(blockStart, 60)} – ${formatHourSlot(blockStart, 120)}`;
  const laterWindow = `${formatHourSlot(blockStart, 120)} – ${formatHourSlot(blockStart, 180)}`;

  const chNumMap = new Map<string, number>();
  allOrderedOutlets.forEach((o, idx) => chNumMap.set(o.id, 101 + idx));

  return outlets.map((outlet, idx) => {
    const channelNumber = chNumMap.get(outlet.id) ?? 101 + idx;
    const schedule = OUTLET_UPCOMING_PROGRAMS[outlet.id] ?? {
      nextTitle: `${outlet.callSign} Global Evening Desk`,
      nextSynopsis: `Continued live coverage from ${outlet.headquarters} (${outlet.region}).`,
      laterTitle: `${outlet.callSign} Overnight World Wire`,
      laterSynopsis: `24/7 Switch SUPERNAP & RisingNet syndicated news relay.`,
    };

    const staggeredProgress = Math.max(
      12,
      Math.min(94, (currentMinutePct + ((idx * 11) % 35) - 10 + 100) % 100 || 45)
    );

    return {
      outlet,
      channelNumber,
      progressPct: outlet.status === 'ON AIR' ? staggeredProgress : 0,
      slots: [
        {
          id: `${outlet.id}-epg-now`,
          windowType: 'now',
          timeRange: nowWindow,
          title: outlet.currentProgram,
          deskOrHost: outlet.anchorOrDesk,
          synopsis: outlet.headline,
          isLive: outlet.status === 'ON AIR',
        },
        {
          id: `${outlet.id}-epg-next`,
          windowType: 'next',
          timeRange: nextWindow,
          title: schedule.nextTitle,
          deskOrHost: `${outlet.callSign} Desk`,
          synopsis: schedule.nextSynopsis,
          isLive: false,
        },
        {
          id: `${outlet.id}-epg-later`,
          windowType: 'later',
          timeRange: laterWindow,
          title: schedule.laterTitle,
          deskOrHost: outlet.headquarters,
          synopsis: schedule.laterSynopsis,
          isLive: false,
        },
      ],
    };
  });
}

export const EPG_AUTO_SYNC_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

const LIVE_SYNC_BULLETIN_SUFFIXES = [
  'Live Update',
  'Verified Feed',
  'Extended Desk',
  'Global Dispatch',
];

/**
 * Simulated asynchronous EPG API call that refreshes the 33+ channel World News schedule
 * every 15 minutes (or on manual 'Sync EPG' click), returning fresh time slots, progress,
 * and server revision metadata.
 */
export function fetchSyncedWorldNewsEpg(
  outlets: GlobalNewsOutlet[],
  nextRevision: number,
  signal?: AbortSignal
): Promise<import('../types/drfun1News').EpgSyncSnapshot> {
  const simulatedLatencyMs = 460 + ((nextRevision * 97) % 280);

  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('EPG sync aborted', 'AbortError'));
      return;
    }

    const timer = window.setTimeout(() => {
      const now = new Date();
      const freshRows = buildWorldNewsEpgRows(outlets, outlets, now);
      const rowsByOutletId: Record<string, import('../types/drfun1News').NewsOutletEpgRow> = {};
      let updatedSlotCount = 0;

      freshRows.forEach((row, idx) => {
        // On subsequent sync revisions, subtly refresh active breaking-desk slot copy to reflect live schedule updates
        const shouldRefreshTag = nextRevision > 1 && row.outlet.isBreaking;
        const suffix =
          LIVE_SYNC_BULLETIN_SUFFIXES[(nextRevision + idx) % LIVE_SYNC_BULLETIN_SUFFIXES.length];

        const slots: [
          import('../types/drfun1News').NewsOutletEpgSlot,
          import('../types/drfun1News').NewsOutletEpgSlot,
          import('../types/drfun1News').NewsOutletEpgSlot,
        ] = [
          {
            ...row.slots[0],
            title: shouldRefreshTag
              ? `${row.slots[0].title} (${suffix})`
              : row.slots[0].title,
          },
          row.slots[1],
          row.slots[2],
        ];

        updatedSlotCount += slots.length;
        rowsByOutletId[row.outlet.id] = {
          ...row,
          slots,
        };
      });

      resolve({
        revision: nextRevision,
        syncedAt: now.toISOString(),
        channelCount: freshRows.length,
        updatedSlotCount,
        rowsByOutletId,
        endpointUrl: `https://api.drfun1media.com/v2/epg/world-news?channels=${freshRows.length}&rev=${nextRevision}`,
        latencyMs: simulatedLatencyMs,
      });
    }, simulatedLatencyMs);

    const onAbort = () => {
      window.clearTimeout(timer);
      reject(new DOMException('EPG sync aborted', 'AbortError'));
    };
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

export interface BreakingNewsFeedResponse {
  alerts: BreakingNewsAlert[];
  fetchedAt: string;
  latencyMs: number;
  feedLabel: string;
  endpointUrl: string;
}

const ACTIVE_DESK_FLASH_TEMPLATES = [
  (o: GlobalNewsOutlet, srcLabel: string) =>
    `${o.callSign} (${o.headquarters}) live bulletin via ${srcLabel}: ${o.headline}`,
  (o: GlobalNewsOutlet, srcLabel: string) =>
    `Now airing "${o.currentProgram}" with ${o.anchorOrDesk} · ${o.viewers.toLocaleString()} live viewers on ${srcLabel}.`,
  (o: GlobalNewsOutlet, srcLabel: string) =>
    `Bureau telemetry update for ${o.name} (${o.country}): ${o.region} live wire synchronized via ${o.switchIngestPop}.`,
];

/**
 * Fetches live breaking headline alerts from the active news outlet feed,
 * producer flash desk, regional breaking outlets, and live satcom wire.
 */
export function fetchActiveBreakingNewsAlerts(params: {
  tunedOutlet: GlobalNewsOutlet;
  allOutlets: GlobalNewsOutlet[];
  bulletins: DrFun1NewsBulletin[];
  activeSourceType: NewsStreamSourceType;
  activeFeedUrl: string;
  pollCycle: number;
  signal?: AbortSignal;
}): Promise<BreakingNewsFeedResponse> {
  const {
    tunedOutlet,
    allOutlets,
    bulletins,
    activeSourceType,
    activeFeedUrl,
    pollCycle,
    signal,
  } = params;

  const sourceProfile =
    NEWS_STREAM_SOURCE_PROFILES.find((p) => p.id === activeSourceType) ||
    NEWS_STREAM_SOURCE_PROFILES[0];
  const simulatedLatencyMs = 240 + ((pollCycle * 67) % 210);

  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Breaking news fetch aborted', 'AbortError'));
      return;
    }

    const timer = window.setTimeout(() => {
      const now = new Date();
      const timeLabel = now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });

      const alerts: BreakingNewsAlert[] = [];

      // 1. Live alert from the currently tuned active news feed
      const template =
        ACTIVE_DESK_FLASH_TEMPLATES[pollCycle % ACTIVE_DESK_FLASH_TEMPLATES.length];
      alerts.push({
        id: `active-${tunedOutlet.id}-${activeSourceType}-${pollCycle}`,
        outletId: tunedOutlet.id,
        outletCallSign: tunedOutlet.callSign,
        region: tunedOutlet.region,
        priority: tunedOutlet.isBreaking ? 'BREAKING' : 'LIVE FEED',
        headline: template(tunedOutlet, sourceProfile.label),
        timestamp: timeLabel,
        sourceFeedLabel: `${tunedOutlet.callSign} · ${sourceProfile.label}`,
        sourceUrl: activeFeedUrl,
      });

      // 2. Producer desk bulletins (prioritizing active outlet first)
      const orderedBulletins = [...bulletins].sort((a, b) => {
        const aMatch = a.outletCallSign === tunedOutlet.callSign ? 1 : 0;
        const bMatch = b.outletCallSign === tunedOutlet.callSign ? 1 : 0;
        return bMatch - aMatch;
      });

      orderedBulletins.slice(0, 3).forEach((b) => {
        const matchedOutlet = allOutlets.find((o) => o.callSign === b.outletCallSign);
        alerts.push({
          id: `bul-alert-${b.id}`,
          outletId: matchedOutlet?.id,
          outletCallSign: b.outletCallSign,
          region: b.region,
          priority: b.priority === 'WORLD DESK' ? 'BREAKING' : b.priority,
          headline: b.headline,
          timestamp: b.timestamp,
          sourceFeedLabel: `Producer Desk · ${b.author}`,
          sourceUrl: matchedOutlet?.website,
        });
      });

      // 3. Freshly polled live satcom/broadcast wire headline for this cycle
      const livePolledWire = getNextDynamicHeadline(pollCycle);
      alerts.push({
        id: `wire-live-${livePolledWire.id}`,
        outletCallSign: livePolledWire.sourceName.toUpperCase(),
        region: 'Global Wire',
        priority: livePolledWire.isBreaking ? 'FLASH' : 'URGENT',
        headline: livePolledWire.title,
        timestamp: timeLabel,
        sourceFeedLabel: `Live Wire · ${livePolledWire.category}`,
        sourceUrl: livePolledWire.link,
      });

      // 4. Other breaking global news outlets (same region first)
      const otherBreaking = allOutlets
        .filter((o) => o.id !== tunedOutlet.id && o.isBreaking && o.status === 'ON AIR')
        .sort((a, b) => {
          const aSame = a.region === tunedOutlet.region ? 1 : 0;
          const bSame = b.region === tunedOutlet.region ? 1 : 0;
          return bSame - aSame || b.viewers - a.viewers;
        })
        .slice(0, 4);

      otherBreaking.forEach((o) => {
        alerts.push({
          id: `outlet-brk-${o.id}-${pollCycle}`,
          outletId: o.id,
          outletCallSign: o.callSign,
          region: o.region,
          priority: 'BREAKING',
          headline: o.headline,
          timestamp: timeLabel,
          sourceFeedLabel: `${o.country} · ${o.currentProgram}`,
          sourceUrl: o.website,
        });
      });

      // 5. Additional breaking RSS wire items
      INITIAL_RSS_ARTICLES.filter((a) => a.isBreaking)
        .slice(0, 2)
        .forEach((art) => {
          alerts.push({
            id: `rss-brk-${art.id}`,
            outletCallSign: art.sourceName.toUpperCase(),
            region: 'Global Wire',
            priority: 'URGENT',
            headline: art.title,
            timestamp: art.pubDate,
            sourceFeedLabel: art.category,
            sourceUrl: art.link,
          });
        });

      resolve({
        alerts,
        fetchedAt: now.toISOString(),
        latencyMs: simulatedLatencyMs,
        feedLabel: `${tunedOutlet.callSign} (${sourceProfile.label})`,
        endpointUrl: activeFeedUrl,
      });
    }, simulatedLatencyMs);

    const onAbort = () => {
      window.clearTimeout(timer);
      reject(new DOMException('Breaking news fetch aborted', 'AbortError'));
    };
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

export const NEWS_STREAM_SOURCE_PROFILES: import('../types/drfun1News').NewsStreamSourceProfile[] = [
  {
    id: 'satellite',
    label: 'Satellite',
    shortLabel: 'SAT',
    protocol: 'DVB-S2X Ku/Ka-Band',
    baseLatencyMs: 248,
    bitrateMultiplier: 1.22,
    codecLabel: 'HEVC 4K60 10-bit',
    signalLabel: '14.8 dB C/N · Lock',
    description: 'Direct orbital transponder downlink via Switch & Goldstone C/Ku/Ka-band teleports.',
    accentHex: '#38bdf8',
    badgeClass: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
  },
  {
    id: 'web',
    label: 'Web',
    shortLabel: 'WEB',
    protocol: 'LL-HLS / Red5 WHEP',
    baseLatencyMs: 38,
    bitrateMultiplier: 0.88,
    codecLabel: 'AV1 / VP9 ABR',
    signalLabel: 'CDN Edge · 99.99%',
    description: 'Adaptive global internet stream over Red5 Pro WebRTC & multi-CDN HLS edge.',
    accentHex: '#a855f7',
    badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
  },
  {
    id: 'local',
    label: 'Local',
    shortLabel: 'LOCAL',
    protocol: 'ATSC 3.0 / Studio Feed',
    baseLatencyMs: 14,
    bitrateMultiplier: 1.0,
    codecLabel: 'NextGen TV HDR',
    signalLabel: 'OTA / Bureau Direct',
    description: 'Direct local affiliate broadcast tower & regional newsroom studio ingest feed.',
    accentHex: '#10b981',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  },
  {
    id: 'fiber',
    label: 'Fiber 100G',
    shortLabel: 'FIBER',
    protocol: 'SMPTE ST 2110 · 100G',
    baseLatencyMs: 2.1,
    bitrateMultiplier: 1.35,
    codecLabel: 'Uncompressed Mezzanine',
    signalLabel: 'DWDM 0% Loss',
    description: 'Dedicated Switch SUPERNAP 100G & 10 RisingNet optical ring contribution link.',
    accentHex: '#f59e0b',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  },
];

export interface ResolvedOutletStreamSource {
  profile: import('../types/drfun1News').NewsStreamSourceProfile;
  feedUrl: string;
  routeLabel: string;
  effectiveBitrateMbps: number;
  latencyMs: number;
  endpoints: import('../types/drfun1News').StreamMirrorEndpoint[];
  activeEndpointIndex: number;
  activeEndpoint: import('../types/drfun1News').StreamMirrorEndpoint;
  hasSecondaryMirror: boolean;
  nextMirrorEndpoint: import('../types/drfun1News').StreamMirrorEndpoint | null;
  qualityOptions: import('../types/drfun1News').StreamQualityOption[];
  activeQuality: import('../types/drfun1News').StreamQualityOption;
}

export function getSourceQualityTiers(
  outlet: GlobalNewsOutlet,
  sourceType: import('../types/drfun1News').NewsStreamSourceType
): import('../types/drfun1News').StreamQualityOption[] {
  const profile =
    NEWS_STREAM_SOURCE_PROFILES.find((p) => p.id === sourceType) ||
    NEWS_STREAM_SOURCE_PROFILES[0];
  const baseMaxMbps = +(outlet.bitrateMbps * profile.bitrateMultiplier).toFixed(1);

  const supports480p =
    sourceType === 'web'
      ? true
      : sourceType === 'local'
        ? true
        : sourceType === 'satellite'
          ? outlet.bitrateMbps < 20
          : false; // Fiber 100G mezzanine links carry HD minimum

  const reason480p =
    sourceType === 'fiber'
      ? 'HD minimum on 100G fiber'
      : sourceType === 'satellite'
        ? 'HD/UHD transponder only'
        : undefined;

  const supports1080p =
    sourceType === 'local' ? outlet.bitrateMbps >= 15.0 : true;

  const reason1080p =
    sourceType === 'local' && !supports1080p
      ? '720p max on regional OTA'
      : undefined;

  const bitrate1080 = Math.max(
    5.8,
    +(
      sourceType === 'web'
        ? Math.min(12.8, baseMaxMbps * 0.62)
        : sourceType === 'local'
          ? Math.min(14.5, baseMaxMbps * 0.78)
          : baseMaxMbps
    ).toFixed(1)
  );
  const bitrate720 = Math.max(
    3.0,
    +(
      sourceType === 'web'
        ? Math.min(6.4, bitrate1080 * 0.52)
        : bitrate1080 * 0.58
    ).toFixed(1)
  );
  const bitrate480 = Math.max(1.4, +(bitrate720 * 0.45).toFixed(1));

  return [
    {
      tier: '1080p',
      label: '1080p Full HD',
      shortLabel: '1080p',
      dimensions: '1920×1080',
      fps: 60,
      bitrateMbps: bitrate1080,
      available: supports1080p,
      unavailableReason: reason1080p,
    },
    {
      tier: '720p',
      label: '720p HD',
      shortLabel: '720p',
      dimensions: '1280×720',
      fps: 60,
      bitrateMbps: bitrate720,
      available: true,
    },
    {
      tier: '480p',
      label: '480p SD',
      shortLabel: '480p',
      dimensions: '854×480',
      fps: 30,
      bitrateMbps: bitrate480,
      available: supports480p,
      unavailableReason: reason480p,
    },
  ];
}

export function resolveOutletStreamSource(
  outlet: GlobalNewsOutlet,
  sourceType: import('../types/drfun1News').NewsStreamSourceType,
  liveTick: number = 0,
  activeEndpointIndex: number = 0,
  preferredQualityTier: import('../types/drfun1News').StreamQualityTier = '1080p'
): ResolvedOutletStreamSource {
  const profile =
    NEWS_STREAM_SOURCE_PROFILES.find((p) => p.id === sourceType) ||
    NEWS_STREAM_SOURCE_PROFILES[0];

  const qualityOptions = getSourceQualityTiers(outlet, sourceType);
  const requestedQuality = qualityOptions.find(
    (q) => q.tier === preferredQualityTier && q.available
  );
  const activeQuality =
    requestedQuality ||
    qualityOptions.find((q) => q.available) ||
    qualityOptions[1];

  const slug = outlet.id.replace(/^news-/, '');
  const jitter = ((liveTick % 5) - 2) * (sourceType === 'fiber' ? 0.1 : sourceType === 'local' ? 0.5 : 1.5);
  const effectiveBitrateMbps = activeQuality.bitrateMbps;

  const customSecondary = outlet.secondaryMirrorUrls?.[0]?.trim();
  const customTertiary = outlet.secondaryMirrorUrls?.[1]?.trim();

  let endpoints: import('../types/drfun1News').StreamMirrorEndpoint[];

  if (sourceType === 'satellite') {
    const band =
      outlet.region === 'Global Wire' || outlet.region === 'North America'
        ? 'Ka-Band 20.2 GHz'
        : 'Ku-Band 11.9 GHz';
    endpoints = [
      {
        tier: 'primary',
        label: 'Primary Transponder',
        url: `sat://dvb-s2x.drfun1media.com/${slug}/tp-42/${activeQuality.tier}`,
        routeLabel: `Orbital Downlink · ${band} (${outlet.region})`,
        latencyOffsetMs: 0,
      },
      {
        tier: 'secondary',
        label: 'Secondary Mirror (Teleport B)',
        url: customSecondary || `sat://dvb-s2x-mirror2.drfun1media.com/${slug}/tp-84-bkp/${activeQuality.tier}`,
        routeLabel: `Backup Teleport · Goldstone / Redundant ${band}`,
        latencyOffsetMs: 14,
      },
      {
        tier: 'tertiary',
        label: 'Tertiary Mirror (HLS Edge)',
        url: customTertiary || `${outlet.hlsFeedUrl}?res=${activeQuality.tier}`,
        routeLabel: `Satcom-to-Edge Fallback · Red5 LL-HLS (${outlet.country})`,
        latencyOffsetMs: -185,
      },
    ];
  } else if (sourceType === 'web') {
    endpoints = [
      {
        tier: 'primary',
        label: 'Primary Web Origin',
        url: `${outlet.hlsFeedUrl}?res=${activeQuality.tier}`,
        routeLabel: `Red5 WHEP & Global LL-HLS Edge (${outlet.country})`,
        latencyOffsetMs: 0,
      },
      {
        tier: 'secondary',
        label: 'Secondary Mirror (CDN EU/US)',
        url: customSecondary || `https://mirror-cdn2.drfun1media.com/hls/${slug}/${activeQuality.tier}/backup.m3u8`,
        routeLabel: `Secondary CDN Mirror · DataPacket Anycast (${outlet.region})`,
        latencyOffsetMs: 9,
      },
      {
        tier: 'tertiary',
        label: 'Tertiary Mirror (Relay)',
        url: customTertiary || `${outlet.streamUrl}?res=${activeQuality.tier}`,
        routeLabel: `Direct Broadcast Relay · DrFun1 Origin Mirror`,
        latencyOffsetMs: 18,
      },
    ];
  } else if (sourceType === 'local') {
    endpoints = [
      {
        tier: 'primary',
        label: 'Primary Studio Feed',
        url: `atsc3://local-desk.drfun1.local/${slug}/rf-ch34/${activeQuality.tier}`,
        routeLabel: `Local Bureau Direct · ${outlet.headquarters}`,
        latencyOffsetMs: 0,
      },
      {
        tier: 'secondary',
        label: 'Secondary Mirror (Backup Tower)',
        url: customSecondary || `atsc3://mirror-tower2.drfun1.local/${slug}/rf-ch51/${activeQuality.tier}`,
        routeLabel: `Backup Regional Tower · ${outlet.country} Affiliate`,
        latencyOffsetMs: 6,
      },
      {
        tier: 'tertiary',
        label: 'Tertiary Mirror (Web Studio)',
        url: customTertiary || `${outlet.hlsFeedUrl}?res=${activeQuality.tier}`,
        routeLabel: `Studio IP Backup · LL-HLS Ingest (${outlet.country})`,
        latencyOffsetMs: 22,
      },
    ];
  } else {
    endpoints = [
      {
        tier: 'primary',
        label: 'Primary 100G Ring',
        url: `st2110://switch-supernap.drfun1.net/100g/${slug}/${activeQuality.tier}`,
        routeLabel: outlet.switchIngestPop,
        latencyOffsetMs: 0,
      },
      {
        tier: 'secondary',
        label: 'Secondary Mirror (RisingNet Ring B)',
        url: customSecondary || `st2110://rn-backup-ring.drfun1.net/100g/${slug}/${activeQuality.tier}`,
        routeLabel: `RisingNet Redundant Optical Ring · Diversity Path B`,
        latencyOffsetMs: 0.8,
      },
      {
        tier: 'tertiary',
        label: 'Tertiary Mirror (Edge HLS)',
        url: customTertiary || `${outlet.hlsFeedUrl}?res=${activeQuality.tier}`,
        routeLabel: `Switch Optical-to-CDN Failover Mirror`,
        latencyOffsetMs: 32,
      },
    ];
  }

  const clampedIndex = Math.max(0, Math.min(endpoints.length - 1, activeEndpointIndex));
  const activeEndpoint = endpoints[clampedIndex];
  const latencyMs = Math.max(
    1.2,
    +(profile.baseLatencyMs + activeEndpoint.latencyOffsetMs + jitter).toFixed(1)
  );
  const nextMirrorEndpoint =
    clampedIndex + 1 < endpoints.length ? endpoints[clampedIndex + 1] : null;

  return {
    profile,
    feedUrl: activeEndpoint.url,
    routeLabel: activeEndpoint.routeLabel,
    effectiveBitrateMbps,
    latencyMs,
    endpoints,
    activeEndpointIndex: clampedIndex,
    activeEndpoint,
    hasSecondaryMirror: endpoints.length > 1,
    nextMirrorEndpoint,
    qualityOptions,
    activeQuality,
  };
}
