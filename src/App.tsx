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

export default function App() {
  const defaultUrl = 'https://narto-drama.com/?lang=ko-KR';
  const [currentUrl, setCurrentUrl] = useState(defaultUrl);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState<'browse' | 'watchlist'>('browse');
  const [isViewerSticky, setIsViewerSticky] = useState(false);
  const isTvWiki = currentUrl.includes('tvwiki.store');
  const [iframeLoading, setIframeLoading] = useState(true);
  const [showSlowWarning, setShowSlowWarning] = useState(false);

  // Monitor window resize to detect mobile viewport
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setIframeLoading(true);
    setShowSlowWarning(false);
    
    const timer = setTimeout(() => {
      setShowSlowWarning(true);
    }, 3500);
    
    return () => clearTimeout(timer);
  }, [currentUrl]);

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
        <div className="w-full px-4 md:px-6 h-12 flex items-center justify-between gap-4">
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
      <main className={`flex-1 w-full flex flex-col transition-all duration-150 ${
        activeTab === 'browse' 
          ? 'h-[calc(100vh-48px)] min-h-[calc(100vh-48px)] max-h-[calc(100vh-48px)] overflow-hidden p-0' 
          : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6'
      }`}>
        
        {/* VIEW ROUTING (TABS CONTENT) */}
        <AnimatePresence mode="wait">
          
          {/* TAB 1: BROWSE & VIEWER */}
          {activeTab === 'browse' && (
            <motion.div
              key="browse"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="w-full h-full flex flex-col overflow-hidden flex-1"
            >


               {/* FULL-WIDTH VIEW FOR BROWSE */}
              <div className="w-full h-full flex flex-col overflow-hidden flex-1">
                
                {/* COLUMN A: WEB VIEW IFRAME (Full width) */}
                <div className={`w-full h-full flex flex-col overflow-hidden transition-all duration-300 flex-1 bg-[#09090b] ${
                  isViewerSticky 
                    ? 'fixed top-12 bottom-0 left-0 right-0 z-40 bg-[#09090b] p-0 gap-0 h-[calc(100vh-48px)]' 
                    : ''
                }`}>
                  {!isViewerSticky && (
                    <div className="flex items-center justify-between px-4 py-2 bg-zinc-950 border-b border-zinc-900/60 shrink-0">
                      <div className="flex items-center gap-1.5">
                        <Tv className="w-3.5 h-3.5 text-rose-500" />
                        <h2 className="text-xs md:text-sm font-bold text-zinc-300 uppercase tracking-wider">OTT 뷰어</h2>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] md:text-xs text-zinc-500 max-w-[120px] sm:max-w-[200px] md:max-w-none truncate">{currentUrl}</span>
                        <a 
                          href={currentUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="flex items-center gap-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[10px] font-bold px-2 py-1 rounded-md border border-rose-500/20 transition cursor-pointer"
                        >
                          <ExternalLink className="w-2.5 h-2.5" />
                          <span>새 창으로 시청</span>
                        </a>
                      </div>
                    </div>
                  )}

                  {/* IFRAME WRAPPER BOX WITH UNIFIED CONTROL BAR */}
                  <div className={`bg-zinc-950 overflow-hidden relative w-full flex-1 flex flex-col min-h-0 ${
                    isViewerSticky 
                      ? 'h-full rounded-none border-none' 
                      : 'border-t border-zinc-900/80'
                  }`}>

                    <div className="overflow-hidden relative flex-1 w-full min-h-0 bg-zinc-950">
                      {/* Loading & troubleshooting overlay */}
                      {iframeLoading && (
                        <div className="absolute inset-0 bg-zinc-950 flex flex-col items-center justify-center p-6 text-center z-10">
                          <div className="flex flex-col items-center gap-4 max-w-sm sm:max-w-md">
                            {/* Animated modern spinner */}
                            <div className="relative">
                              <div className="w-12 h-12 rounded-full border-4 border-rose-500/10 border-t-rose-500 animate-spin" />
                              <Tv className="w-5 h-5 text-rose-400 absolute inset-0 m-auto animate-pulse" />
                            </div>
                            
                            <div className="space-y-1">
                              <p className="text-sm font-bold text-zinc-200">콘텐츠 웹사이트에 연결하고 있습니다...</p>
                              <p className="text-xs text-zinc-500">잠시만 기다려 주시면 화면이 로드됩니다.</p>
                            </div>

                            {/* Show troubleshooting warning when taking too long */}
                            {showSlowWarning && (
                              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mt-2 space-y-3 shadow-lg shadow-black/40 text-left">
                                <p className="text-xs text-zinc-400 leading-relaxed">
                                  💡 <b>화면 로드가 너무 오래 걸리나요?</b><br />
                                  일부 모바일 및 PC 브라우저의 프레임 차단 보안 쿠키 정책으로 인해 내부 로드가 불가능하거나 검은색으로 멈출 수 있습니다. 이 경우 아래 <b>[새 창으로 시청]</b>을 이용하시면 차단 걱정 없이 가장 빠른 고화질 재생이 가능합니다!
                                </p>
                                <div className="flex flex-wrap gap-2 pt-1">
                                  <a
                                    href={currentUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    <span>새 창으로 시청하기</span>
                                  </a>
                                  <button
                                    onClick={() => {
                                      setIframeLoading(true);
                                      setShowSlowWarning(false);
                                      const iframe = document.getElementById('narto-iframe') as HTMLIFrameElement;
                                      if (iframe) {
                                        iframe.src = currentUrl;
                                      }
                                    }}
                                    className="flex items-center gap-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold px-3.5 py-2 rounded-lg transition"
                                  >
                                    <span>새로고침</span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <iframe 
                        id="narto-iframe"
                        src={currentUrl}
                        title="Narto Drama Stream"
                        onLoad={() => setIframeLoading(false)}
                        style={{
                          height: '100%',
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
    </div>
  );
}
