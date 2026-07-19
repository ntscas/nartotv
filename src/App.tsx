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
  const [tvWikiOffset, setTvWikiOffset] = useState<number>(180); // Default 180px
  const [activeTab, setActiveTab] = useState<'browse' | 'watchlist'>('browse');
  const [isViewerSticky, setIsViewerSticky] = useState(false);
  const isTvWiki = currentUrl.includes('tvwiki.store');

  const loadTvWikiInViewer = () => {
    const tvWikiUrl = 'https://tvwiki.store/';
    setCurrentUrl(tvWikiUrl);
    setActiveTab('browse');
    
    // Force update iframe src
    setTimeout(() => {
      const iframe = document.getElementById('narto-iframe') as HTMLIFrameElement;
      if (iframe) {
        iframe.src = tvWikiUrl;
      }
    }, 50);
  };
  
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

  useEffect(() => {
    // Load Local Storage watch list
    const savedWatchlist = localStorage.getItem('narto_pwa_watchlist');
    if (savedWatchlist) {
      try {
        setWatchlist(JSON.parse(savedWatchlist));
      } catch (e) {
        console.error('Error parsing watchlist from localStorage:', e);
      }
    }
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
      <header className={`sticky top-0 transition-all duration-300 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-900/80 ${
        isViewerSticky ? 'z-50' : 'z-40'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between gap-4">
          <div 
            onClick={() => {
              setCurrentUrl(defaultUrl);
              const iframe = document.getElementById('narto-iframe') as HTMLIFrameElement;
              if (iframe) iframe.src = defaultUrl;
              setActiveTab('browse');
            }}
            className="flex items-center gap-2 cursor-pointer flex-shrink-0"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-rose-500 to-violet-600 flex items-center justify-center shadow-lg shadow-rose-500/20">
              <Tv className="w-3.5 h-3.5 text-white stroke-[2.5]" />
            </div>
            <div>
              <span className="font-extrabold text-xs sm:text-sm md:text-base tracking-wider bg-gradient-to-r from-rose-400 to-pink-500 bg-clip-text text-transparent">OTT</span>
            </div>
          </div>

          {/* Unified Navigation & Source Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Source Button: Narto */}
            <button
              type="button"
              onClick={() => {
                setCurrentUrl(defaultUrl);
                const iframe = document.getElementById('narto-iframe') as HTMLIFrameElement;
                if (iframe) iframe.src = defaultUrl;
                setActiveTab('browse');
              }}
              className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                !isTvWiki && activeTab === 'browse'
                  ? 'bg-rose-500 text-white shadow shadow-rose-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <Tv className="w-3 h-3" />
              <span>Narto</span>
            </button>

            {/* Source Button: TVWiKi */}
            <button
              type="button"
              onClick={() => {
                loadTvWikiInViewer();
                setActiveTab('browse');
              }}
              className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                isTvWiki && activeTab === 'browse'
                  ? 'bg-amber-500 text-zinc-950 shadow shadow-amber-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>TVWiKi</span>
            </button>

            {/* Screen Mode Toggle */}
            <button
              type="button"
              onClick={() => {
                if (isViewerSticky) {
                  setIsViewerSticky(false);
                  window.scrollTo({ top: 0, behavior: 'instant' });
                } else {
                  setIsViewerSticky(true);
                }
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold text-[10px] sm:text-xs transition border cursor-pointer ${
                isViewerSticky 
                  ? 'bg-rose-500/15 text-rose-400 border-rose-500/30' 
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-850'
              }`}
            >
              <Smartphone className="w-3 h-3" />
              <span>{isViewerSticky ? '일반화면' : '몰입화면'}</span>
            </button>

            <span className="text-zinc-800 font-light text-xs hidden sm:inline">|</span>

            {/* Tab: Bookmark Toggle */}
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'watchlist' ? 'browse' : 'watchlist')}
              className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                activeTab === 'watchlist' 
                  ? 'bg-zinc-850 text-rose-400 border border-zinc-700/50' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'
              }`}
            >
              <Bookmark className="w-3 h-3" />
              <span className="hidden sm:inline">마이 북마크</span>
              {watchlist.length > 0 && (
                <span className="text-[9px] bg-rose-500 text-white rounded-full px-1 py-0.2 font-extrabold">{watchlist.length}</span>
              )}
            </button>
          </div>
        </div>
      </header>

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


              {/* TWO COLUMN GRID FOR BROWSE */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-6 gap-y-2">
                
                {/* COLUMN A: WEB VIEW IFRAME (2/3 width) */}
                <div className={`lg:col-span-2 flex flex-col gap-2 transition-all duration-300 ${
                  isViewerSticky 
                    ? 'fixed top-12 bottom-0 left-0 right-0 z-40 bg-[#09090b] p-0 gap-0' 
                    : 'sticky top-[48px] z-30 bg-[#09090b] pb-0 self-start'
                }`}>
                  {!isViewerSticky && (
                    <div className="flex items-center justify-between px-4 sm:px-0">
                      <div className="flex items-center gap-1.5">
                        <Tv className="w-3.5 h-3.5 text-rose-500" />
                        <h2 className="text-xs md:text-sm font-bold text-zinc-300 uppercase tracking-wider">OTT 스트리밍 전용 뷰어</h2>
                      </div>
                      <span className="text-[10px] md:text-xs text-zinc-500 max-w-[200px] sm:max-w-none truncate">{currentUrl}</span>
                    </div>
                  )}

                  {/* IFRAME WRAPPER BOX WITH UNIFIED CONTROL BAR */}
                  <div className={`bg-zinc-950 overflow-hidden shadow-2xl relative w-full flex flex-col ${
                    isViewerSticky 
                      ? 'h-full rounded-none border-none' 
                      : 'rounded-2xl border border-zinc-800/80 h-[420px] sm:h-[580px] md:h-[780px] lg:h-[880px] xl:h-[980px]'
                  }`}>
                    
                    {/* TVWiKi AD CROPPING TOOLBAR (ONLY FOR TVWIKI & VISIBLE AS SLIM BAR) */}
                    {isTvWiki && (
                      <div className="bg-zinc-900 border-b border-zinc-800 px-3 py-1.5 flex items-center justify-between gap-2 text-[11px] text-zinc-300 select-none z-20 relative">
                        <div className="flex items-center gap-1 font-bold text-amber-400">
                          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                          <span>광고차단</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-zinc-500 font-bold">오프셋:</span>
                          <div className="flex bg-zinc-950 p-0.5 rounded-md border border-zinc-800/60">
                            {[0, 180, 240, 300].map((offset) => (
                              <button
                                key={offset}
                                type="button"
                                onClick={() => setTvWikiOffset(offset)}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                                  tvWikiOffset === offset 
                                    ? 'bg-amber-500 text-zinc-950 font-extrabold' 
                                    : 'text-zinc-400 hover:text-zinc-200'
                                }`}
                              >
                                {offset === 0 ? '0px' : `${offset}px`}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="overflow-hidden relative flex-1 w-full h-full">
                      <iframe 
                        id="narto-iframe"
                        src={currentUrl}
                        title="Narto Drama Stream"
                        style={{
                          marginTop: currentUrl.includes('tvwiki.store') ? `-${tvWikiOffset}px` : '0px',
                          height: currentUrl.includes('tvwiki.store') ? `calc(100% + ${tvWikiOffset}px)` : '100%',
                          width: '100%',
                          border: 'none',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                        }}
                        className="bg-zinc-950"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                    
                    {/* Visual cue when loaded */}
                    {!isViewerSticky && (
                      <div className="absolute bottom-3 right-3 bg-zinc-950/90 text-zinc-300 px-2.5 py-1 rounded-md text-[10px] font-semibold border border-zinc-800 backdrop-blur pointer-events-none">
                        OTT 공식 임베디드 뷰어
                      </div>
                    )}
                  </div>


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
                            type="button"
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

        </AnimatePresence>

      </main>

      {/* FOOTER SECTION */}
      <footer className={`bg-zinc-950 border-t border-zinc-900 py-8 text-center text-zinc-600 text-xs mt-4 ${isViewerSticky ? 'hidden md:block' : 'block'}`}>
        <div className="max-w-7xl mx-auto px-4 space-y-3">
          <p className="font-semibold tracking-wider text-zinc-500">OTT 프리미엄 웹 뷰어</p>
          <p className="max-w-md mx-auto leading-relaxed text-zinc-600">
            본 앱은 https://narto-drama.com/?lang=ko-KR&tab-provider=bilitv 공식 주소 연결 및 스마트 오프셋 필터 기능을 제공하는 웹 서비스입니다.
          </p>
          <div className="flex items-center justify-center gap-4 text-[11px] pt-2">
            <a href="https://narto-drama.com/" target="_blank" rel="noreferrer" className="hover:text-rose-400 transition">OTT 공식홈</a>
            <span>•</span>
            <button type="button" onClick={loadTvWikiInViewer} className="text-amber-400 hover:text-amber-300 transition font-semibold cursor-pointer">TVWiKi 로드</button>
            <span>•</span>
            <button type="button" onClick={() => setCurrentUrl(defaultUrl)} className="hover:text-rose-400 transition">bilitv 한글 필터 링크</button>
            <span>•</span>
            <span>Version 1.1.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
