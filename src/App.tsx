/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Tv, 
  ExternalLink, 
  Download, 
  Bookmark, 
  CheckCircle2, 
  Info, 
  Trash2, 
  Search, 
  Sparkles, 
  Plus, 
  X, 
  Smartphone,
  Monitor,
  Heart,
  ChevronRight,
  ListPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Custom types for Watchlist and Bookmark items
interface WatchlistItem {
  id: string;
  title: string;
  episode: string;
  status: 'watching' | 'towatch' | 'completed';
  notes: string;
  url: string;
}

// Prefilled trending dramas for quick deep-linking
const TRENDING_DRAMAS = [
  {
    id: '1',
    title: '선재 업고 튀어 (Lovely Runner)',
    genre: '로맨스 / 판타지 / 타임슬립',
    stars: '4.9',
    episodes: '16부작',
    biliTvUrl: 'https://narto-drama.com/?lang=ko-KR&tab-provider=bilitv&search=선재업고튀어',
    desc: '임솔이 최애 선재를 구하기 위해 2008년으로 타임슬립하며 벌어지는 판타지 로맨스 드라마'
  },
  {
    id: '2',
    title: '눈물의 여왕 (Queen of Tears)',
    genre: '로맨스 / 휴먼 / 코미디',
    stars: '4.8',
    episodes: '16부작',
    biliTvUrl: 'https://narto-drama.com/?lang=ko-KR&tab-provider=bilitv&search=눈물의여왕',
    desc: '퀸즈 그룹 재벌 3세 홍해인과 용두리 이장 아들 백현우의 아찔한 위기와 기적 같은 로맨스'
  },
  {
    id: '3',
    title: '오징어 게임 시즌2 (Squid Game 2)',
    genre: '스릴러 / 서바이벌 / 액션',
    stars: '4.7',
    episodes: '6부작',
    biliTvUrl: 'https://narto-drama.com/?lang=ko-KR&tab-provider=bilitv&search=오징어게임',
    desc: '다시 시작된 생존 서바이벌. 456억 원의 상금을 둘러싸고 벌어지는 기훈의 복수와 극한 대결'
  },
  {
    id: '4',
    title: '더 글로리 (The Glory)',
    genre: '복수 / 스릴러 / 드라마',
    stars: '4.9',
    episodes: '16부작',
    biliTvUrl: 'https://narto-drama.com/?lang=ko-KR&tab-provider=bilitv&search=더글로리',
    desc: '유년 시절 폭력으로 영혼까지 부서진 한 여자가 온 생을 걸어 치밀하게 준비한 처절한 복수극'
  }
];

export default function App() {
  const defaultUrl = 'https://narto-drama.com/?lang=ko-KR&tab-provider=bilitv';
  const [currentUrl, setCurrentUrl] = useState(defaultUrl);
  const [activeTab, setActiveTab] = useState<'browse' | 'watchlist' | 'guide'>('browse');
  const [isViewerSticky, setIsViewerSticky] = useState(false);
  
  // PWA Install Prompt states
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  
  // Watchlist states
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchDramaQuery, setSearchDramaQuery] = useState('');
  
  // Form states for new watch item
  const [newTitle, setNewTitle] = useState('');
  const [newEpisode, setNewEpisode] = useState('');
  const [newStatus, setNewStatus] = useState<'watching' | 'towatch' | 'completed'>('watching');
  const [newNotes, setNewNotes] = useState('');
  const [newUrl, setNewUrl] = useState('');

  // Auto-detect device platform
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop'>('desktop');

  useEffect(() => {
    // Detect OS for specialized installation tips
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setPlatform('ios');
    } else if (/android/.test(userAgent)) {
      setPlatform('android');
    } else {
      setPlatform('desktop');
    }

    // Check standalone PWA mode
    const checkStandalone = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
        || (window.navigator as any).standalone 
        || document.referrer.includes('android-app://');
      setIsInstalled(isStandalone);
    };

    checkStandalone();
    
    // Listen for custom browser display changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', (e) => setIsInstalled(e.matches));

    // Handle standard beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowNotification(true); // Notify user about installable state!
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Load Local Storage watch list
    const savedWatchlist = localStorage.getItem('narto_pwa_watchlist');
    if (savedWatchlist) {
      try {
        setWatchlist(JSON.parse(savedWatchlist));
      } catch (e) {
        console.error('Error parsing watchlist from localStorage:', e);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Handle auto-sticky full screen viewer on mobile scroll
  useEffect(() => {
    // If already sticky, do not run scroll check to prevent layout change feedback loops (flickering)
    if (isViewerSticky) return;

    const handleScroll = () => {
      // Only run on mobile viewports (< 768px)
      if (window.innerWidth >= 768) return;

      // When the user scrolls past 100px on mobile, trigger full screen mode automatically
      if (window.scrollY > 100) {
        setIsViewerSticky(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isViewerSticky]);

  // Reset viewer sticky state when tab changes
  useEffect(() => {
    setIsViewerSticky(false);
  }, [activeTab]);

  // Lock parent body scroll in mobile sticky immersive mode to prevent double-scroll & jitter
  useEffect(() => {
    if (isViewerSticky) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isViewerSticky]);

  // Save watchlist helper
  const saveWatchlist = (updatedList: WatchlistItem[]) => {
    setWatchlist(updatedList);
    localStorage.setItem('narto_pwa_watchlist', JSON.stringify(updatedList));
  };

  // Add item to Watchlist
  const handleAddWatchlistItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem: WatchlistItem = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      episode: newEpisode.trim() || '1회',
      status: newStatus,
      notes: newNotes.trim(),
      url: newUrl.trim() || `https://narto-drama.com/?lang=ko-KR&tab-provider=bilitv&search=${encodeURIComponent(newTitle)}`
    };

    const updated = [newItem, ...watchlist];
    saveWatchlist(updated);
    
    // Reset Form
    setNewTitle('');
    setNewEpisode('');
    setNewStatus('watching');
    setNewNotes('');
    setNewUrl('');
    setShowAddForm(false);
  };

  // Remove Watchlist Item
  const handleRemoveItem = (id: string) => {
    const filtered = watchlist.filter(item => item.id !== id);
    saveWatchlist(filtered);
  };

  // Update Status or Episode inline
  const handleUpdateEpisode = (id: string, ep: string) => {
    const updated = watchlist.map(item => {
      if (item.id === id) {
        return { ...item, episode: ep };
      }
      return item;
    });
    saveWatchlist(updated);
  };

  // Change active item status
  const handleUpdateStatus = (id: string, status: 'watching' | 'towatch' | 'completed') => {
    const updated = watchlist.map(item => {
      if (item.id === id) {
        return { ...item, status };
      }
      return item;
    });
    saveWatchlist(updated);
  };

  // Trigger Native PWA installation dialog
  const handleInstallPWA = async () => {
    if (!deferredPrompt) {
      alert('이미 설치되었거나, 현재 사용 중인 브라우저가 자동 설치를 지원하지 않습니다. 아래의 "수동 설치 가이드"를 참고해주세요!');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA Installation outcome: ${outcome}`);
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowNotification(false);
    }
  };

  // Apply visual styling based on watch status
  const getStatusBadge = (status: 'watching' | 'towatch' | 'completed') => {
    switch (status) {
      case 'watching':
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/25">시청 중</span>;
      case 'towatch':
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/25">시청 예정</span>;
      case 'completed':
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">완결</span>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-zinc-100 selection:bg-rose-500 selection:text-white font-sans antialiased">
      
      {/* GLOW EFFECT CORNER ACCENTS */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-rose-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-violet-600/5 rounded-full blur-[100px] pointer-events-none" />

      {/* HEADER SECTION */}
      <header className={`sticky top-0 transition-all duration-300 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/60 ${
        isViewerSticky ? 'z-50' : 'z-40'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 md:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-gradient-to-tr from-rose-500 to-violet-600 flex items-center justify-center shadow-lg shadow-rose-500/20">
              <Tv className="w-4 h-4 md:w-5 md:h-5 text-white stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1 md:gap-1.5">
                <span className="font-extrabold text-sm sm:text-base md:text-lg tracking-wider bg-gradient-to-r from-rose-400 to-pink-500 bg-clip-text text-transparent">나토드라마</span>
                <span className="text-[8px] md:text-[10px] uppercase tracking-widest px-1 md:px-1.5 py-0.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold">PWA</span>
              </div>
              <p className="text-[8px] md:text-[10px] text-zinc-500 font-medium">BiliTV 자막지원 스트리밍</p>
            </div>
          </div>

          {/* Nav Tabs */}
          <div className="hidden md:flex items-center gap-1">
            <button 
              onClick={() => setActiveTab('browse')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${activeTab === 'browse' ? 'bg-zinc-800 text-rose-400 border border-zinc-700/50' : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'}`}
              id="tab-browse-desktop"
            >
              시청 및 재생기
            </button>
            <button 
              onClick={() => setActiveTab('watchlist')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-1.5 ${activeTab === 'watchlist' ? 'bg-zinc-800 text-rose-400 border border-zinc-700/50' : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'}`}
              id="tab-watchlist-desktop"
            >
              마이 북마크 {watchlist.length > 0 && <span className="text-[11px] bg-rose-500 text-white rounded-full px-1.5 py-0.2">{watchlist.length}</span>}
            </button>
            <button 
              onClick={() => setActiveTab('guide')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${activeTab === 'guide' ? 'bg-zinc-800 text-rose-400 border border-zinc-700/50' : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'}`}
              id="tab-guide-desktop"
            >
              설치 가이드
            </button>
            <a 
              href="https://tvwiki.store/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-sm font-bold rounded-lg text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 flex items-center gap-1.5 transition-all duration-200"
              id="link-tvwiki-desktop"
            >
              <span>TVWiKi 바로가기</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile Immersive Screen Toggle */}
            <button
              onClick={() => {
                if (isViewerSticky) {
                  setIsViewerSticky(false);
                  window.scrollTo({ top: 0, behavior: 'instant' });
                } else {
                  setIsViewerSticky(true);
                }
              }}
              className="md:hidden flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700/80 font-bold rounded-lg px-2.5 py-1 text-[10px] active:scale-95 transition-all"
              id="mobile-immersive-toggle"
            >
              <Smartphone className="w-3.5 h-3.5 text-rose-400" />
              <span>{isViewerSticky ? '일반화면' : '몰입화면'}</span>
            </button>

            {/* Install Status badge or quick trigger */}
            {isInstalled ? (
              <div className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5 md:px-3 md:py-1 text-[9px] md:text-xs font-semibold">
                <CheckCircle2 className="w-3 h-3 md:w-3.5 md:h-3.5" />
                <span>실행 중</span>
              </div>
            ) : (
              <button 
                onClick={handleInstallPWA}
                className="flex items-center gap-1 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold rounded-lg px-2 py-1 md:px-4 md:py-2 text-[10px] md:text-xs shadow-md shadow-rose-500/10 hover:shadow-rose-500/20 transition-all duration-200"
                id="install-btn-header"
              >
                <Download className="w-3 h-3 md:w-3.5 md:h-3.5" />
                <span>앱 설치</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* TOP FLOATING NOTIFICATION FOR INSTALLABLE STATE */}
      <AnimatePresence>
        {showNotification && !isInstalled && deferredPrompt && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-r from-zinc-900 to-zinc-950 border-b border-rose-500/30 text-zinc-100"
            id="install-pwa-banner"
          >
            <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div className="flex items-center gap-2.5">
                <div className="bg-rose-500/20 p-1.5 rounded-lg text-rose-400">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                </div>
                <p className="text-xs sm:text-sm font-medium">
                  나토드라마를 바탕화면이나 홈 화면에 바로가기 앱 형식으로 설치할 수 있습니다!
                </p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
                <button 
                  onClick={handleInstallPWA}
                  className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded-md shadow-sm transition"
                >
                  지금 즉시 설치
                </button>
                <button 
                  onClick={() => setShowNotification(false)}
                  className="text-zinc-400 hover:text-white p-1 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        
        {/* VIEW ROUTING (TABS CONTENT) */}
        <AnimatePresence mode="wait">
          
          {/* TAB 1: BROWSE & VIEWER */}
          {activeTab === 'browse' && (
            <motion.div
              key="browse"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-6"
            >
              {/* BRAND PROMOTION BANNER */}
              <div className={`bg-gradient-to-r from-zinc-900 via-[#121215] to-zinc-950 rounded-2xl p-5 sm:p-6 border border-zinc-800/80 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 overflow-hidden relative ${
                isViewerSticky ? 'hidden md:flex' : 'flex'
              }`}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-[80px] pointer-events-none" />
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2 text-rose-400 text-xs font-bold tracking-wider uppercase">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>추천 구성 및 빠른 재생 가이드</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
                    나토드라마 PWA로 BiliTV 한글 한국 드라마 시청하기
                  </h1>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    이 서비스는 <span className="text-rose-400 font-semibold">https://narto-drama.com/?lang=ko-KR&tab-provider=bilitv</span>의 콘텐츠를 완벽히 활용할 수 있도록 제작된 단독 설치형 PWA 앱입니다. 아래 빠른 즐겨찾기를 사용하거나 시청 중인 회차를 기록해보세요.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2.5 w-full lg:w-auto justify-start sm:justify-end">
                  <a 
                    href="https://tvwiki.store/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-750 text-zinc-950 font-black px-5 py-3 rounded-xl transition duration-200 shadow-md shadow-amber-500/20"
                  >
                    <span>TVWiKi 공식 홈 바로가기</span>
                    <ExternalLink className="w-4 h-4 text-zinc-950" />
                  </a>
                  <a 
                    href={currentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full sm:w-auto bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold px-5 py-3 rounded-xl border border-zinc-700/60 transition duration-200"
                  >
                    <span>새 창으로 나토드라마 바로 열기</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button 
                    onClick={() => {
                      setCurrentUrl(defaultUrl);
                      // Force reload iframe
                      const iframe = document.getElementById('narto-iframe') as HTMLIFrameElement;
                      if (iframe) iframe.src = defaultUrl;
                    }}
                    className="flex items-center justify-center gap-2 w-full sm:w-auto bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold px-5 py-3 rounded-xl border border-rose-500/20 transition duration-200"
                  >
                    <span>기본 주소로 재생기 리셋</span>
                  </button>
                </div>
              </div>

              {/* TWO COLUMN GRID FOR BROWSE */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* COLUMN A: WEB VIEW IFRAME (2/3 width) */}
                <div className={`lg:col-span-2 flex flex-col gap-3 transition-all duration-300 ${
                  isViewerSticky 
                    ? 'fixed top-12 bottom-[58px] left-0 right-0 z-40 bg-[#09090b] p-0 gap-0' 
                    : 'sticky top-[48px] md:relative md:top-auto z-30 bg-[#09090b] pb-2'
                }`}>
                  {!isViewerSticky && (
                    <div className="flex items-center justify-between px-4 sm:px-0">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                        <h2 className="text-xs md:text-sm font-bold text-zinc-300 uppercase tracking-wider">나토드라마 스트리밍 전용 뷰어</h2>
                      </div>
                      <span className="text-[10px] md:text-xs text-zinc-500 max-w-[200px] sm:max-w-none truncate">{currentUrl}</span>
                    </div>
                  )}

                  {/* IFRAME WRAPPER BOX WITH FALLBACK INFO */}
                  <div className={`bg-zinc-950 overflow-hidden shadow-2xl relative w-full flex flex-col ${
                    isViewerSticky 
                      ? 'h-full rounded-none border-none' 
                      : 'rounded-2xl border border-zinc-800/80 h-[320px] sm:h-[450px] md:h-[650px] lg:h-[750px] xl:h-[800px]'
                  }`}>
                    
                    {/* Fallback & Helper Banner over iframe or as a head/footer */}
                    {!isViewerSticky && (
                      <div className="bg-zinc-900 px-4 py-2 text-xs border-b border-zinc-800 flex items-center justify-between text-zinc-400 gap-4">
                        <div className="flex items-center gap-1.5 overflow-hidden">
                          <Info className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                          <span className="truncate">
                            화면 차단 시 외부 전용창을 이용하세요. 또는 
                            <a href="https://tvwiki.store/" target="_blank" rel="noreferrer" className="text-amber-400 font-bold ml-1 hover:underline">TVWiKi 바로가기</a>
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <a 
                            href="https://tvwiki.store/" 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-amber-400 font-bold hover:underline flex items-center gap-0.5"
                          >
                            <span>TVWiKi</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          <span className="text-zinc-700">|</span>
                          <a 
                            href={currentUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-rose-400 font-bold hover:underline flex items-center gap-0.5"
                          >
                            <span>외부 전용창</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    )}

                    <iframe 
                      id="narto-iframe"
                      src={currentUrl}
                      title="Narto Drama Stream"
                      className="w-full flex-1 bg-zinc-950 border-none"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                    
                    {/* Visual cue when loaded */}
                    {!isViewerSticky && (
                      <div className="absolute bottom-3 right-3 bg-zinc-950/90 text-zinc-300 px-2.5 py-1 rounded-md text-[10px] font-semibold border border-zinc-800 backdrop-blur pointer-events-none">
                        나토드라마 공식 임베디드 뷰어
                      </div>
                    )}
                  </div>

                  {/* QUICK ACCESS BUTTONS */}
                  {!isViewerSticky && (
                    <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-zinc-300">동작이 원활하지 않으신가요?</h4>
                        <p className="text-[11px] text-zinc-400 leading-relaxed">
                          모바일이나 PC 브라우저의 보안 정책으로 인해 페이지 내 프레임 로드가 차단되는 경우가 있습니다. 이 경우 PWA를 설치하여 실행하거나 바로가기로 실행하시면 차단 없이 완벽하게 동작합니다!
                        </p>
                      </div>
                      <a 
                        href="https://narto-drama.com/?lang=ko-KR&tab-provider=bilitv"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold px-4 py-2.5 rounded-lg border border-zinc-700/80 text-xs transition-all flex-shrink-0"
                      >
                        <span>나토드라마 바로 연결하기</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>

                {/* COLUMN B: QUICK NAVIGATION / TRENDING / WATCHLIST SNIPPET (1/3 width) */}
                <div className={`flex flex-col gap-6 ${isViewerSticky ? 'hidden md:flex' : 'flex'}`}>
                  
                  {/* SEARCH DEEP LINK */}
                  <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 p-5 rounded-2xl border border-zinc-800/80 space-y-4">
                    <div className="flex items-center gap-2">
                      <Search className="w-4 h-4 text-rose-400" />
                      <h3 className="text-sm font-bold text-zinc-200">나토드라마 직접 검색하기</h3>
                    </div>
                    <p className="text-xs text-zinc-400">
                      원하는 드라마 이름을 치면 bilitv 한국어 번역 상태로 검색을 시작합니다.
                    </p>
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        placeholder="예: 선재 업고 튀어, 더 글로리"
                        value={searchDramaQuery}
                        onChange={(e) => setSearchDramaQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && searchDramaQuery.trim()) {
                            const searchUrl = `https://narto-drama.com/?lang=ko-KR&tab-provider=bilitv&search=${encodeURIComponent(searchDramaQuery.trim())}`;
                            setCurrentUrl(searchUrl);
                            // Set to iframe
                            const iframe = document.getElementById('narto-iframe') as HTMLIFrameElement;
                            if (iframe) iframe.src = searchUrl;
                          }
                        }}
                        className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-rose-500/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none transition duration-150"
                      />
                      <button 
                        onClick={() => {
                          if (searchDramaQuery.trim()) {
                            const searchUrl = `https://narto-drama.com/?lang=ko-KR&tab-provider=bilitv&search=${encodeURIComponent(searchDramaQuery.trim())}`;
                            setCurrentUrl(searchUrl);
                            const iframe = document.getElementById('narto-iframe') as HTMLIFrameElement;
                            if (iframe) iframe.src = searchUrl;
                          }
                        }}
                        className="bg-rose-500 hover:bg-rose-600 text-white font-bold px-3 py-2 rounded-lg text-xs transition flex-shrink-0"
                      >
                        검색
                      </button>
                    </div>
                  </div>

                  {/* TRENDING POPULAR DRAMAS */}
                  <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 p-5 rounded-2xl border border-zinc-800/80 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-rose-500" />
                        <h3 className="text-sm font-bold text-zinc-200">화제의 드라마 빠른 링크</h3>
                      </div>
                      <span className="text-[10px] bg-rose-500/10 text-rose-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">bilitv</span>
                    </div>

                    <div className="flex flex-col gap-3">
                      {TRENDING_DRAMAS.map((drama) => (
                        <div 
                          key={drama.id}
                          className="group bg-zinc-900/50 hover:bg-zinc-900 p-3 rounded-xl border border-zinc-800/40 hover:border-zinc-700/60 transition duration-200 text-left"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-0.5">
                              <h4 className="text-xs font-bold text-white group-hover:text-rose-400 transition-colors duration-150">
                                {drama.title}
                              </h4>
                              <p className="text-[10px] text-zinc-400">{drama.genre}</p>
                            </div>
                            <span className="text-[10px] font-bold text-amber-400 bg-amber-400/5 px-1.5 py-0.5 rounded border border-amber-400/20">
                              ★ {drama.stars}
                            </span>
                          </div>
                          
                          <p className="text-[10px] text-zinc-500 mt-1.5 line-clamp-2 leading-relaxed">
                            {drama.desc}
                          </p>
                          
                          <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-zinc-800/50">
                            <span className="text-[9px] text-zinc-500">{drama.episodes}</span>
                            <button 
                              onClick={() => {
                                setCurrentUrl(drama.biliTvUrl);
                                const iframe = document.getElementById('narto-iframe') as HTMLIFrameElement;
                                if (iframe) iframe.src = drama.biliTvUrl;
                              }}
                              className="text-[10px] text-rose-400 group-hover:text-rose-300 font-bold flex items-center gap-0.5"
                            >
                              <span>지금 시청하기</span>
                              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform duration-150" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* QUICK STATS */}
                  <div className="bg-zinc-900/30 p-4 rounded-xl border border-zinc-800/40 text-center">
                    <p className="text-[11px] text-zinc-400">현재 선택된 자막 설정</p>
                    <p className="text-xs font-bold text-white mt-1">한국어 (ko-KR) / BiliTV 자막 재생</p>
                  </div>

                </div>
              </div>

            </motion.div>
          )}

          {/* TAB 2: PERSONAL WATCHLIST / BOOKMARKS */}
          {activeTab === 'watchlist' && (
            <motion.div
              key="watchlist"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                    <Bookmark className="w-5 h-5 text-rose-500" />
                    <span>나의 드라마 시청 기록장</span>
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    현재 시청 중인 나토드라마의 회차와 링크를 기록해두면, 나중에 원클릭으로 이어볼 수 있습니다. 브라우저에 자동 안전 저장됩니다.
                  </p>
                </div>
                
                <button 
                  onClick={() => {
                    setShowAddForm(!showAddForm);
                    setNewUrl(currentUrl); // Default to current loaded url
                  }}
                  className="flex items-center gap-1.5 bg-rose-500 hover:bg-rose-600 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition"
                  id="add-bookmark-btn"
                >
                  {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  <span>새 기록 등록하기</span>
                </button>
              </div>

              {/* ADD FORM ACCORDION */}
              <AnimatePresence>
                {showAddForm && (
                  <motion.form 
                    onSubmit={handleAddWatchlistItem}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-zinc-900 rounded-2xl border border-zinc-800/80 p-5 overflow-hidden space-y-4"
                  >
                    <h3 className="text-sm font-bold text-white">시청 목록에 새로운 드라마 등록</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-zinc-400">드라마 제목 *</label>
                        <input 
                          type="text" 
                          placeholder="예: 선재 업고 튀어"
                          required
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-zinc-400">현재 볼 차례 (회차)</label>
                        <input 
                          type="text" 
                          placeholder="예: 5회 12분"
                          value={newEpisode}
                          onChange={(e) => setNewEpisode(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-zinc-400">상태</label>
                        <select 
                          value={newStatus}
                          onChange={(e) => setNewStatus(e.target.value as any)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                        >
                          <option value="watching">시청 중 (Watching)</option>
                          <option value="towatch">시청 예정 (To Watch)</option>
                          <option value="completed">시청 완료 (Completed)</option>
                        </select>
                      </div>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-zinc-400">나토드라마 바로가기 주소 (자동 생성됨)</label>
                        <input 
                          type="url" 
                          placeholder="https://..."
                          value={newUrl}
                          onChange={(e) => setNewUrl(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-400 focus:outline-none focus:border-rose-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-zinc-400">기타 메모</label>
                        <input 
                          type="text" 
                          placeholder="예: bilitv 탭 클릭해서 볼 것, 서브스토리 재미있음"
                          value={newNotes}
                          onChange={(e) => setNewNotes(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button 
                        type="button"
                        onClick={() => setShowAddForm(false)}
                        className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold px-4 py-2 rounded-lg"
                      >
                        취소
                      </button>
                      <button 
                        type="submit"
                        className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm"
                      >
                        등록하기
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* WATCHLIST GRID */}
              {watchlist.length === 0 ? (
                <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-12 text-center max-w-xl mx-auto space-y-4">
                  <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
                    <ListPlus className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-zinc-200">시청하고 있는 기록이 없습니다</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      자주 시청하거나 앞으로 볼 예정인 나토드라마의 회차를 기록해두세요. 매번 검색하지 않고도 클릭 한번으로 최신 에피소드로 이동합니다.
                    </p>
                  </div>
                  <button 
                    onClick={() => setShowAddForm(true)}
                    className="bg-zinc-800 hover:bg-zinc-700 text-rose-400 text-xs font-bold px-4 py-2 rounded-lg"
                  >
                    첫 번째 드라마 기록하기
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {watchlist.map((item) => (
                    <motion.div
                      layout
                      key={item.id}
                      className="bg-zinc-900 border border-zinc-800/80 rounded-xl p-4 flex flex-col justify-between gap-4 relative overflow-hidden group"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <h4 className="font-bold text-white group-hover:text-rose-400 transition-colors duration-150">
                              {item.title}
                            </h4>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {getStatusBadge(item.status)}
                              <span className="text-[10px] text-zinc-500">BiliTV 자막</span>
                            </div>
                          </div>
                          
                          <button 
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-zinc-500 hover:text-rose-400 p-1 rounded-md hover:bg-zinc-800 transition"
                            title="삭제"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Watch Info Edit Controls */}
                        <div className="bg-zinc-950/80 rounded-lg p-3 space-y-2 border border-zinc-800/40">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-zinc-500">진행도:</span>
                            <input 
                              type="text"
                              value={item.episode}
                              onChange={(e) => handleUpdateEpisode(item.id, e.target.value)}
                              className="bg-transparent text-right font-semibold text-rose-400 border-none outline-none focus:ring-0 max-w-[120px]"
                              placeholder="1회 (클릭 시 수정)"
                            />
                          </div>
                          {item.notes && (
                            <p className="text-[11px] text-zinc-400 leading-relaxed border-t border-zinc-800/60 pt-1.5 italic">
                              💡 {item.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Quick Action buttons */}
                      <div className="flex gap-2 pt-2 border-t border-zinc-800/60">
                        {/* Open in Frame */}
                        <button 
                          onClick={() => {
                            setCurrentUrl(item.url);
                            setActiveTab('browse');
                            // Delay slightly to ensure tab switches before setting iframe
                            setTimeout(() => {
                              const iframe = document.getElementById('narto-iframe') as HTMLIFrameElement;
                              if (iframe) iframe.src = item.url;
                            }, 50);
                          }}
                          className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1 border border-zinc-700/50"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>재생기로 로드</span>
                        </button>
                        {/* Open Direct */}
                        <a 
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold p-2 rounded-lg text-xs flex items-center justify-center border border-rose-500/20"
                          title="새창으로 다이렉트 열기"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>

                      {/* Status quick changer menu */}
                      <div className="absolute top-2 right-12 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex gap-1 bg-zinc-950/90 rounded-md p-1 border border-zinc-800">
                        <button 
                          onClick={() => handleUpdateStatus(item.id, 'watching')}
                          className={`text-[9px] px-1.5 py-0.5 rounded ${item.status === 'watching' ? 'bg-rose-500/20 text-rose-400 font-bold' : 'text-zinc-500'}`}
                        >
                          시청중
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(item.id, 'towatch')}
                          className={`text-[9px] px-1.5 py-0.5 rounded ${item.status === 'towatch' ? 'bg-amber-500/20 text-amber-400 font-bold' : 'text-zinc-500'}`}
                        >
                          예정
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(item.id, 'completed')}
                          className={`text-[9px] px-1.5 py-0.5 rounded ${item.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-zinc-500'}`}
                        >
                          완료
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 3: INSTALLATION GUIDE */}
          {activeTab === 'guide' && (
            <motion.div
              key="guide"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="max-w-4xl mx-auto space-y-6"
            >
              <div className="text-center space-y-2">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  나토드라마 모바일 홈 화면 앱 설치 가이드 (PWA)
                </h2>
                <p className="text-sm text-zinc-400 max-w-xl mx-auto">
                  기기별로 아주 간편하게 바로가기 앱을 생성할 수 있습니다. 설치하면 광고가 줄어들고 브라우저 주소창 없이 온전히 풀스크린 비디오 시청이 가능합니다.
                </p>
              </div>

              {/* PLATFORM TOGGLES */}
              <div className="flex justify-center gap-2">
                <button 
                  onClick={() => setPlatform('android')}
                  className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl border transition ${platform === 'android' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>안드로이드 (삼성/LG/Pixel)</span>
                </button>
                <button 
                  onClick={() => setPlatform('ios')}
                  className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl border transition ${platform === 'ios' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>아이폰 / 아이패드 (iOS)</span>
                </button>
                <button 
                  onClick={() => setPlatform('desktop')}
                  className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl border transition ${platform === 'desktop' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}
                >
                  <Monitor className="w-4 h-4" />
                  <span>PC / 맥북 (Chrome)</span>
                </button>
              </div>

              {/* PLATFORM-SPECIFIC INSTRUCTIONS */}
              <div className="bg-zinc-900 rounded-2xl border border-zinc-800/80 p-6 space-y-6">
                
                {platform === 'android' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-green-500/20 text-green-400 flex items-center justify-center font-bold">안</div>
                      <h3 className="text-base font-bold text-white">삼성 인터넷 또는 구글 크롬 브라우저 기준</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                      <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/50 space-y-2">
                        <span className="text-zinc-500 font-mono text-xs">STEP 01</span>
                        <h4 className="text-xs font-bold text-white">메뉴 열기 또는 알림 클릭</h4>
                        <p className="text-[11px] text-zinc-400 leading-relaxed">
                          현재 페이지 상단의 &quot;앱 설치하기&quot; 버튼이나 브라우저 주소창 우측 끝의 (+) 설치 아이콘을 터치하세요.
                        </p>
                      </div>

                      <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/50 space-y-2">
                        <span className="text-zinc-500 font-mono text-xs">STEP 02</span>
                        <h4 className="text-xs font-bold text-white">&apos;앱 설치&apos; 선택</h4>
                        <p className="text-[11px] text-zinc-400 leading-relaxed">
                          팝업 창이 나타나면 &apos;설치&apos; 또는 &apos;홈 화면에 추가&apos; 버튼을 누릅니다.
                        </p>
                      </div>

                      <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/50 space-y-2">
                        <span className="text-zinc-500 font-mono text-xs">STEP 03</span>
                        <h4 className="text-xs font-bold text-white">홈 화면에서 앱 실행</h4>
                        <p className="text-[11px] text-zinc-400 leading-relaxed">
                          폰 바탕화면에 생성된 &apos;나토드라마&apos; 아이콘을 누르면, 브라우저 주소창 없이 몰입감 넘치게 즉시 실행됩니다!
                        </p>
                      </div>
                    </div>

                    {deferredPrompt && (
                      <div className="pt-4 flex justify-center">
                        <button 
                          onClick={handleInstallPWA}
                          className="flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold rounded-xl px-6 py-3.5 text-xs shadow-lg shadow-rose-500/20 transition duration-200"
                        >
                          <Download className="w-4 h-4" />
                          <span>지금 바로 원클릭 자동 설치 진행</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {platform === 'ios' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">iOS</div>
                      <h3 className="text-base font-bold text-white">아이폰 / 아이패드 사파리(Safari) 브라우저 전용</h3>
                    </div>

                    <p className="text-xs text-zinc-400 leading-relaxed bg-zinc-950 p-3 rounded-lg border border-zinc-800/50">
                      ⚠️ 애플 iOS 정책으로 인해 아이폰에서는 브라우저 자체 설치 기능이 차단되어 있습니다. 반드시 아래의 <span className="text-rose-400 font-semibold">사파리 공유 메뉴를 통한 수동 추가</span>만 가능합니다.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                      <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/50 space-y-2">
                        <span className="text-zinc-500 font-mono text-xs">STEP 01</span>
                        <h4 className="text-xs font-bold text-white">사파리 공유 버튼 터치</h4>
                        <p className="text-[11px] text-zinc-400 leading-relaxed">
                          사파리 브라우저 화면 하단 중앙에 있는 <span className="text-rose-400 font-bold">&apos;공유 (올리기 사각형)&apos;</span> 아이콘을 누릅니다.
                        </p>
                      </div>

                      <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/50 space-y-2">
                        <span className="text-zinc-500 font-mono text-xs">STEP 02</span>
                        <h4 className="text-xs font-bold text-white">&apos;홈 화면에 추가&apos; 터치</h4>
                        <p className="text-[11px] text-zinc-400 leading-relaxed">
                          공유 옵션 목록을 아래로 스크롤하여 <span className="text-rose-400 font-bold">&apos;홈 화면에 추가&apos;</span> 메뉴를 선택합니다.
                        </p>
                      </div>

                      <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/50 space-y-2">
                        <span className="text-zinc-500 font-mono text-xs">STEP 03</span>
                        <h4 className="text-xs font-bold text-white">우측 상단 &apos;추가&apos; 완료</h4>
                        <p className="text-[11px] text-zinc-400 leading-relaxed">
                          우측 상단의 &apos;추가&apos;를 누르면 홈화면에 프리미엄 나토드라마 앱 아이콘이 바로 생성됩니다.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {platform === 'desktop' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-zinc-700/50 text-white flex items-center justify-center font-bold">PC</div>
                      <h3 className="text-base font-bold text-white">윈도우 / 맥북 크롬, 웨일, 엣지 브라우저 기준</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                      <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/50 space-y-2">
                        <span className="text-zinc-500 font-mono text-xs">STEP 01</span>
                        <h4 className="text-xs font-bold text-white">주소창 우측 아이콘 찾기</h4>
                        <p className="text-[11px] text-zinc-400 leading-relaxed">
                          브라우저 주소창 맨 우측에 모니터/다운로드 모양의 설치 아이콘 혹은 우측 상단 점3개 메뉴를 누릅니다.
                        </p>
                      </div>

                      <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/50 space-y-2">
                        <span className="text-zinc-500 font-mono text-xs">STEP 02</span>
                        <h4 className="text-xs font-bold text-white">&apos;설치&apos; 진행</h4>
                        <p className="text-[11px] text-zinc-400 leading-relaxed">
                          &apos;나토드라마 PWA 설치&apos; 메시지가 나오면 설치 버튼을 누르십시오.
                        </p>
                      </div>

                      <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/50 space-y-2">
                        <span className="text-zinc-500 font-mono text-xs">STEP 03</span>
                        <h4 className="text-xs font-bold text-white">바탕화면 단독창 런칭</h4>
                        <p className="text-[11px] text-zinc-400 leading-relaxed">
                          컴퓨터 바탕화면에 공식 바로가기가 등록되어 크롬 실행 없이도 앱처럼 쾌적하게 비디오를 감상할 수 있습니다.
                        </p>
                      </div>
                    </div>

                    {deferredPrompt && (
                      <div className="pt-4 flex justify-center">
                        <button 
                          onClick={handleInstallPWA}
                          className="flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold rounded-xl px-6 py-3.5 text-xs shadow-lg shadow-rose-500/20 transition duration-200"
                        >
                          <Download className="w-4 h-4" />
                          <span>PC 자동 설치 시작하기</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

              </div>

              {/* ADVANTAGES OF PWA */}
              <div className="bg-[#121215] border border-zinc-800 rounded-2xl p-6 text-left space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-rose-400" />
                  <span>설치형 PWA 앱을 사용해야 하는 이유</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="flex gap-2.5 items-start">
                    <div className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold flex-shrink-0 mt-0.5">✓</div>
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-zinc-200">주소창 제거로 넓은 화면 확보</h4>
                      <p className="text-zinc-400 leading-relaxed">동영상 시청 시 귀찮은 브라우저 상단 바와 하단 네비게이션이 완전히 제거되어 풀스크린에 가깝게 동작합니다.</p>
                    </div>
                  </div>

                  <div className="flex gap-2.5 items-start">
                    <div className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold flex-shrink-0 mt-0.5">✓</div>
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-zinc-200">초고속 즉시 접속</h4>
                      <p className="text-zinc-400 leading-relaxed">홈화면에 앱 아이콘이 바로 활성화되어 번거로운 브라우저 검색이나 북마크 진입 과정 없이 한 번에 재생기에 연결됩니다.</p>
                    </div>
                  </div>

                  <div className="flex gap-2.5 items-start">
                    <div className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold flex-shrink-0 mt-0.5">✓</div>
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-zinc-200">완전한 시청 회차 보존</h4>
                      <p className="text-zinc-400 leading-relaxed">기록장에 저장해 둔 드라마들과 내가 마지막으로 본 시간이나 회차가 기기에 완벽히 저장됩니다.</p>
                    </div>
                  </div>

                  <div className="flex gap-2.5 items-start">
                    <div className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold flex-shrink-0 mt-0.5">✓</div>
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-zinc-200">안전한 데이터 격리 및 메모리 최적화</h4>
                      <p className="text-zinc-400 leading-relaxed">브라우저 프로세스와 분리되어 스트리밍 중 메모리가 부족해져 튕기는 현상을 막아주고, 한결 부드러운 화질을 선사합니다.</p>
                    </div>
                  </div>
                </div>
              </div>

            </motion.div>
          )}

        </AnimatePresence>

      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className={`z-50 md:hidden bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800/80 py-2.5 px-4 pb-safe transition-all duration-300 ${
        isViewerSticky ? 'fixed bottom-0 left-0 right-0' : 'sticky bottom-0'
      }`}>
        <div className="flex items-center justify-around">
          <button 
            onClick={() => setActiveTab('browse')}
            className={`flex flex-col items-center gap-1 transition ${activeTab === 'browse' ? 'text-rose-400 font-semibold' : 'text-zinc-500'}`}
            id="tab-browse-mobile"
          >
            <Tv className="w-5 h-5" />
            <span className="text-[10px]">시청 & 재생기</span>
          </button>

          <button 
            onClick={() => setActiveTab('watchlist')}
            className={`flex flex-col items-center gap-1 transition relative ${activeTab === 'watchlist' ? 'text-rose-400 font-semibold' : 'text-zinc-500'}`}
            id="tab-watchlist-mobile"
          >
            <Bookmark className="w-5 h-5" />
            <span className="text-[10px]">마이 북마크</span>
            {watchlist.length > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[9px] px-1 rounded-full font-bold">
                {watchlist.length}
              </span>
            )}
          </button>

          <button 
            onClick={() => setActiveTab('guide')}
            className={`flex flex-col items-center gap-1 transition ${activeTab === 'guide' ? 'text-rose-400 font-semibold' : 'text-zinc-500'}`}
            id="tab-guide-mobile"
          >
            <Download className="w-5 h-5" />
            <span className="text-[10px]">앱 설치</span>
          </button>

          <a 
            href="https://tvwiki.store/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 text-amber-400 transition"
            id="link-tvwiki-mobile"
          >
            <ExternalLink className="w-5 h-5" />
            <span className="text-[10px]">TVWiKi</span>
          </a>
        </div>
      </nav>

      {/* FOOTER SECTION */}
      <footer className={`bg-zinc-950 border-t border-zinc-900 py-8 text-center text-zinc-600 text-xs mt-12 ${isViewerSticky ? 'hidden md:block' : 'block'}`}>
        <div className="max-w-7xl mx-auto px-4 space-y-3">
          <p className="font-semibold tracking-wider text-zinc-500">나토드라마 PWA COMTABLE CLIENT</p>
          <p className="max-w-md mx-auto leading-relaxed text-zinc-600">
            본 앱은 https://narto-drama.com/?lang=ko-KR&tab-provider=bilitv 공식 주소 연결 및 PWA 설치 표준 기술을 제공하는 독립형 래퍼 서비스입니다.
          </p>
          <div className="flex items-center justify-center gap-4 text-[11px] pt-2">
            <a href="https://narto-drama.com/" target="_blank" rel="noreferrer" className="hover:text-rose-400 transition">나토드라마 공식홈</a>
            <span>•</span>
            <a href="https://tvwiki.store/" target="_blank" rel="noreferrer" className="text-amber-400 hover:text-amber-300 transition font-semibold">TVWiKi 공식홈</a>
            <span>•</span>
            <button onClick={() => setCurrentUrl(defaultUrl)} className="hover:text-rose-400 transition">bilitv 한글 필터 링크</button>
            <span>•</span>
            <span>Version 1.0.0</span>
          </div>
        </div>
      </footer>

      {/* FLOATING RESTORE BUTTON FOR STICKY MOBILE VIEW */}
      {isViewerSticky && (
        <button
          onClick={() => {
            setIsViewerSticky(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="fixed bottom-20 right-4 z-50 flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-full px-4 py-2.5 text-xs shadow-lg shadow-rose-500/30 transition-all duration-200 animate-bounce"
          id="restore-normal-view-btn"
        >
          <Smartphone className="w-4 h-4" />
          <span>일반화면 보기</span>
        </button>
      )}

    </div>
  );
}
