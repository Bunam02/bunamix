/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';
import { 
  Play, Shuffle, Trash2, Plus, ListVideo, 
  SkipForward, SkipBack, Loader2, AlertCircle,
  Volume2, Pause, Repeat, Repeat1, PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
import { 
  fetchPlaylistInfo, fetchPlaylistItems, extractPlaylistId, 
  shuffleArray, PlaylistItem, PlaylistInfo 
} from './lib/youtube';
import { cn } from './lib/utils';
import { motion } from 'motion/react';

const formatTime = (time: number) => {
  if (!time || isNaN(time)) return "0:00";
  const MathFloor = Math.floor;
  const h = MathFloor(time / 3600);
  const m = MathFloor((time % 3600) / 60);
  const s = MathFloor(time % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const QueueComponent = ({ 
  queue, 
  currentIndex, 
  playSpecificVideo 
}: { 
  queue: PlaylistItem[], 
  currentIndex: number, 
  playSpecificVideo: (index: number) => void 
}) => (
  <div className="flex flex-col gap-2 flex-1 min-h-0 pt-4 -mt-[17px] overflow-hidden">
    <div className="text-sm 2xl:text-lg uppercase font-bold tracking-widest border-b-2 2xl:border-b-4 border-brutal-black pb-1 2xl:pb-2 flex justify-between items-center shrink-0">
      <div className="flex items-center gap-3">
        <span>Up Next</span>
      </div>
      <span className="bg-brutal-black text-white px-2 py-0.5 2xl:px-3 2xl:py-1">{currentIndex + 1} / {queue.length}</span>
    </div>
    <div className="flex flex-col gap-3 2xl:gap-4 overflow-y-auto pr-2 custom-scrollbar py-2 flex-1">
      {queue.map((item, index) => {
        if (index < currentIndex) return null;

        const isPlaying = index === currentIndex;
        
        return (
          <div 
            key={`${item.id}-${index}`}
            onClick={() => playSpecificVideo(index)}
            className={cn(
              "flex items-center gap-4 2xl:gap-6 p-2 2xl:p-4 border-2 2xl:border-4 cursor-pointer transition-all shrink-0",
              isPlaying 
                ? "border-brutal-black bg-brutal-green shadow-[4px_4px_0_0_#000] 2xl:shadow-[6px_6px_0_0_#000]" 
                : "border-brutal-black bg-white hover:bg-brutal-gray shadow-[4px_4px_0_0_#000] 2xl:shadow-[6px_6px_0_0_#000]"
            )}
          >
            <div className="w-[100px] h-[56px] 2xl:w-[160px] 2xl:h-[90px] bg-brutal-black border-2 2xl:border-4 border-brutal-black overflow-hidden shrink-0 relative">
              <img 
                src={item.thumbnail} 
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm 2xl:text-xl font-bold uppercase truncate">
                {item.title}
              </div>
              <div className="text-xs 2xl:text-base font-bold text-brutal-black/60 uppercase truncate">
                {item.channelTitle}
              </div>
            </div>
            <div className={cn(
              "text-xl 2xl:text-3xl font-display shrink-0 px-2 2xl:px-4",
              isPlaying ? "text-brutal-black" : "text-brutal-black/30"
            )}>
              {isPlaying ? "PLAYING" : `#${index + 1}`}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

export default function App() {
  const [inputValue, setInputValue] = useState('');
  const [playlists, setPlaylists] = useState<PlaylistInfo[]>(() => {
    const saved = localStorage.getItem('savedPlaylists');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  const [queue, setQueue] = useState<PlaylistItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [initialVideoId, setInitialVideoId] = useState<string | null>(null); // ⭐️ 추가: 초기 곡 ID 고정용
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAutoplayEnabled, setIsAutoplayEnabled] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  
  const playerRef = useRef<any>(null);
  const autoplayRef = useRef(isAutoplayEnabled);
  const repeatModeRef = useRef(repeatMode);
  const currentIndexRef = useRef(currentIndex);
  const queueRef = useRef(queue);
  const isPlayingRef = useRef(isPlaying);
  
  useEffect(() => {
    autoplayRef.current = isAutoplayEnabled;
  }, [isAutoplayEnabled]);

  useEffect(() => {
    repeatModeRef.current = repeatMode;
  }, [repeatMode]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    localStorage.setItem('savedPlaylists', JSON.stringify(playlists));
  }, [playlists]);

  useEffect(() => {
    // Background fetch for any playlists that don't have items cached yet
    playlists.forEach(playlist => {
      if (!playlist.items || playlist.items.length === 0) {
        fetchPlaylistItems(playlist.id).then(items => {
          setPlaylists(prev => prev.map(p => p.id === playlist.id ? { ...p, items } : p));
        }).catch(console.error);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && isPlayerReady && playerRef.current) {
      interval = setInterval(async () => {
        try {
          const current = await playerRef.current.getCurrentTime();
          const total = await playerRef.current.getDuration();
          setCurrentTime(current || 0);
          setDuration(total || 0);
        } catch (e) {
          // ignore
        }
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isPlayerReady]);

  const handleAddPlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const playlistId = extractPlaylistId(inputValue);
    if (!playlistId) {
      setError('Invalid YouTube Playlist URL or ID.');
      return;
    }

    if (playlists.some(p => p.id === playlistId)) {
      setError('Playlist already added.');
      setInputValue('');
      return;
    }

    setIsLoading(true);
    try {
      const info = await fetchPlaylistInfo(playlistId);
      setPlaylists(prev => [...prev, info]);
      setInputValue('');
      
      // Fetch items in background to make shuffling instant later
      fetchPlaylistItems(playlistId).then(items => {
        setPlaylists(prev => prev.map(p => p.id === playlistId ? { ...p, items } : p));
      }).catch(console.error);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch playlist info.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemovePlaylist = (id: string) => {
    setPlaylists(prev => prev.filter(p => p.id !== id));
    if (queue.length > 0) {
      const newQueue = queue.filter(item => item.playlistId !== id);
      setQueue(newQueue);
      if (currentIndex >= newQueue.length) {
        setCurrentIndex(Math.max(0, newQueue.length - 1));
      }
    }
  };

  const handleShuffleAndPlay = async (specificPlaylistId?: string) => {
    const targetPlaylists = specificPlaylistId && typeof specificPlaylistId === 'string'
      ? playlists.filter(p => p.id === specificPlaylistId)
      : playlists;

    if (targetPlaylists.length === 0) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const fetchPromises = targetPlaylists.map(async (playlist) => {
        if (playlist.items && playlist.items.length > 0) {
          return playlist.items;
        }
        const items = await fetchPlaylistItems(playlist.id);
        // Cache the items for future use
        setPlaylists(prev => prev.map(p => p.id === playlist.id ? { ...p, items } : p));
        return items;
      });
      
      const itemsArrays = await Promise.all(fetchPromises);
      const allItems = itemsArrays.flat() as PlaylistItem[];
      
      if (allItems.length === 0) {
        setError('No playable videos found in the selected playlists.');
        return;
      }

      const shuffled = shuffleArray(allItems);
      setQueue(shuffled);
      setCurrentIndex(0);
      setInitialVideoId(shuffled[0].videoId); // ⭐️ 추가: 첫 번째 곡 ID를 초기 ID로 설정
      setIsPlaying(true);
      
      // If player is already mounted, force it to play the new video immediately
      if (playerRef.current) {
        playerRef.current.loadVideoById(shuffled[0].videoId);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch playlist items.');
    } finally {
      setIsLoading(false);
    }
  };

  // ⭐️ 추가: 곡 변경과 재생을 동시에 즉각적으로 처리하는 핵심 함수
  const playSpecificVideo = (index: number) => {
    setCurrentIndex(index);
    if (playerRef.current && queueRef.current[index]) {
      playerRef.current.loadVideoById(queueRef.current[index].videoId);
      setIsPlaying(true);
    }
  };

  const playNext = () => {
    if (currentIndexRef.current < queueRef.current.length - 1) {
      playSpecificVideo(currentIndexRef.current + 1); // ⭐️ 변경
    } else if (repeatModeRef.current === 'all' && queueRef.current.length > 0) {
      playSpecificVideo(0);
    }
  };

  const playPrevious = () => {
    if (currentIndexRef.current > 0) {
      playSpecificVideo(currentIndexRef.current - 1); // ⭐️ 변경
    } else if (repeatModeRef.current === 'all' && queueRef.current.length > 0) {
      playSpecificVideo(queueRef.current.length - 1);
    }
  };

  const onPlayerReady: YouTubeProps['onReady'] = (event) => {
    playerRef.current = event.target;
    setIsPlayerReady(true);
    if (isPlayingRef.current) {
      event.target.playVideo();
    }
  };

  const onPlayerStateChange: YouTubeProps['onStateChange'] = (event) => {
    // 0 = ended, 1 = playing, 2 = paused
    if (event.data === 0) {
      if (repeatModeRef.current === 'one') {
        playSpecificVideo(currentIndexRef.current);
      } else if (autoplayRef.current) {
        if (currentIndexRef.current < queueRef.current.length - 1 || repeatModeRef.current === 'all') {
          playNext();
        } else {
          setIsPlaying(false);
        }
      } else {
        setIsPlaying(false);
      }
    } else if (event.data === 1) {
      setIsPlaying(true);
    } else if (event.data === 2) {
      setIsPlaying(false);
    }
    // ⭐️ 불필요한 5(cued), -1(unstarted) 강제 재생 로직 삭제
  };

  // ⭐️ 삭제: 기존에 있던 currentIndex를 감지해서 playVideo를 호출하던 불안정한 useEffect 삭제 완료

  const currentVideo = queue[currentIndex];

  return (
    <div className="min-h-screen bg-brutal-bg text-brutal-black font-sans flex flex-col">
      <div className={cn(
        "flex-1 w-full mx-auto p-4 md:p-8 flex flex-col gap-8 transition-all duration-500",
        queue.length > 0 
          ? (isSidebarOpen ? "max-w-[1400px] 2xl:max-w-[2000px] lg:grid lg:grid-cols-[400px_1fr] 2xl:grid-cols-[500px_1fr]" : "max-w-[1000px] 2xl:max-w-[1400px] flex flex-col pl-4") 
          : "max-w-[600px] 2xl:max-w-[800px] justify-center"
      )}>
        
        {/* Sidebar */}
        <div className={cn(
          "flex-col w-full relative",
          queue.length > 0 ? "gap-4 lg:sticky lg:top-8 lg:h-[calc(100vh-4rem)]" : "gap-6 2xl:gap-10",
          (!queue.length || isSidebarOpen) ? "flex" : "hidden"
        )}>
          {/* Toggle Sidebar Button (When Open) */}
          {queue.length > 0 && isSidebarOpen && (
            <div className="fixed top-4 left-4 z-50">
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 bg-white border-2 border-brutal-black hover:bg-brutal-green transition-colors shadow-[4px_4px_0_0_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
                title="Hide Sidebar"
              >
                <PanelLeftClose className="w-5 h-5" />
              </button>
            </div>
          )}

          <motion.div 
            initial={{ y: -50, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className={cn(
              "flex flex-col items-center justify-center transition-all duration-500",
              queue.length > 0 ? "gap-2 text-5xl -mt-[10px] -mb-[5px]" 
                : "gap-4 text-6xl 2xl:text-8xl -mt-[15px] -mb-[20px] 2xl:-mt-[20px] 2xl:-mb-[30px]"
            )}
          >
            <a href="./" className="shrink-0 cursor-pointer transition-transform hover:scale-105 active:scale-95">
              <img 
                src="./logo.png" 
                alt="BuNaMix Logo" 
                className={cn(
                  "object-contain transition-all duration-500", 
                  queue.length > 0 ? "w-[150px] h-[150px]" : "w-[180px] h-[180px] 2xl:w-[260px] 2xl:h-[260px]"
                )} 
              />
            </a>
            <span className={cn(
              "font-display leading-none tracking-tight flex items-center justify-center transition-all duration-500", 
              queue.length > 0 ? "-mt-[20px] h-[50px]" : "-mt-[35px] h-[70px] 2xl:-mt-[50px] 2xl:h-[100px]"
            )}>
              BuNa<span style={{ color: '#89d07e' }}>Mix</span>
            </span>
          </motion.div>
          
          {/* Add Playlist */}
          {queue.length === 0 && (
            <div className="flex flex-col gap-2 2xl:gap-4 w-full">
              <div className="text-sm 2xl:text-xl uppercase font-bold tracking-widest border-b-2 2xl:border-b-4 border-brutal-black pb-1 2xl:pb-2">
                Add Playlists
              </div>
              <form onSubmit={handleAddPlaylist} className="flex gap-2 2xl:gap-4 mt-2 2xl:mt-4">
                <input
                  type="text"
                  placeholder="www.youtube.com/playlist?list="
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="flex-1 bg-white border-2 2xl:border-4 border-brutal-black p-3 2xl:p-5 text-brutal-black font-bold text-sm 2xl:text-xl outline-none focus:bg-brutal-gray transition-colors placeholder:text-brutal-black/40 shadow-[4px_4px_0_0_#000] 2xl:shadow-[6px_6px_0_0_#000]"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputValue.trim()}
                  className="bg-white border-2 2xl:border-4 border-brutal-black text-brutal-black px-4 2xl:px-8 hover:bg-brutal-green disabled:opacity-50 transition-colors flex items-center justify-center shrink-0 shadow-[4px_4px_0_0_#000] 2xl:shadow-[6px_6px_0_0_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 2xl:w-8 2xl:h-8 animate-spin" /> : <Plus className="w-6 h-6 2xl:w-8 2xl:h-8 stroke-[3]" />}
                </button>
              </form>
              {error && (
                <div className="bg-brutal-black text-white p-2 2xl:p-4 text-sm 2xl:text-lg font-bold mt-2 2xl:mt-4 uppercase flex items-start gap-2 2xl:gap-3">
                  <AlertCircle className="w-5 h-5 2xl:w-7 2xl:h-7 shrink-0" />
                  <p>{error}</p>
                </div>
              )}
            </div>
          )}

          {/* Playlists List */}
          {queue.length === 0 && (
            <div className="flex flex-col gap-2 2xl:gap-4 shrink-0 max-h-[260px] 2xl:max-h-[400px] w-full">
              <div className="text-sm 2xl:text-xl uppercase font-bold tracking-widest border-b-2 2xl:border-b-4 border-brutal-black pb-1 2xl:pb-2 flex justify-between items-center shrink-0">
                <span>Your Playlists</span>
                <span className="bg-brutal-black text-white px-2 py-0.5 2xl:px-3 2xl:py-1">{playlists.length}</span>
              </div>
              <div className="space-y-3 2xl:space-y-4 overflow-y-auto pr-2 custom-scrollbar py-2 flex-1 min-h-0">
                {playlists.length === 0 ? (
                  <div className="text-center py-8 2xl:py-12 text-brutal-black font-bold uppercase border-2 2xl:border-4 border-dashed border-brutal-black bg-brutal-gray 2xl:text-xl">
                    NO PLAYLISTS ADDED.
                  </div>
                ) : (
                  playlists.map((playlist) => (
                    <div 
                      key={playlist.id} 
                      onClick={() => handleShuffleAndPlay(playlist.id)}
                      className="flex items-center gap-3 2xl:gap-5 bg-white border-2 2xl:border-4 border-brutal-black p-2 2xl:p-4 group transition-colors hover:bg-brutal-gray shadow-[4px_4px_0_0_#000] 2xl:shadow-[6px_6px_0_0_#000] cursor-pointer"
                    >
                      <img 
                        src={playlist.thumbnail} 
                        alt={playlist.title} 
                        className="w-16 h-12 2xl:w-24 2xl:h-16 object-cover border-2 2xl:border-4 border-brutal-black shrink-0 transition-all"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm 2xl:text-xl font-bold uppercase truncate" title={playlist.title}>
                          {playlist.title}
                        </h3>
                        <p className="text-xs 2xl:text-sm font-bold text-brutal-black/60">{playlist.itemCount} VIDEOS</p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemovePlaylist(playlist.id);
                        }}
                        className="p-2 2xl:p-3 text-brutal-black hover:bg-brutal-black hover:text-white border-2 2xl:border-4 border-transparent hover:border-brutal-black transition-colors shrink-0"
                        title="Remove playlist"
                      >
                        <Trash2 className="w-5 h-5 2xl:w-7 2xl:h-7" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Queue (Only shown in sidebar when open) */}
          {isSidebarOpen && queue.length > 0 && (
            <QueueComponent 
              queue={queue} 
              currentIndex={currentIndex} 
              playSpecificVideo={playSpecificVideo} 
            />
          )}
        </div>

        {/* Main View */}
        {queue.length > 0 && (
          <div className={cn(
            "flex flex-col gap-6 h-full overflow-hidden border-brutal-black pt-8 lg:pt-0 transition-all duration-500 relative",
            isSidebarOpen ? "border-t-4 lg:border-t-0 lg:border-l-4 lg:pl-8" : ""
          )}>
            
            {/* Toggle Sidebar Button (When Closed or Mobile) */}
            <div className={cn(
              "z-50",
              isSidebarOpen 
                ? "absolute -top-12 right-0 lg:hidden" 
                : "fixed top-4 left-4"
            )}>
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 bg-white border-2 border-brutal-black hover:bg-brutal-green transition-colors shadow-[4px_4px_0_0_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
                title={isSidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
              >
                {isSidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
              </button>
            </div>

            {/* Player Mockup */}
            <div className="w-full aspect-video bg-brutal-black border-4 border-brutal-black flex items-center justify-center relative overflow-hidden shadow-[8px_8px_0_0_#000]">
              {/* ⭐️ 변경: queue가 있고 initialVideoId가 세팅되었을 때만 렌더링 */}
              {queue.length > 0 && initialVideoId ? (
                <YouTube
                  videoId={initialVideoId} // ⭐️ 핵심: 리렌더링 방지를 위해 초기 ID로 고정
                  opts={{
                    width: '100%',
                    height: '100%',
                    playerVars: {
                      autoplay: 1,
                      modestbranding: 1,
                      rel: 0,
                    },
                  }}
                  onReady={onPlayerReady}
                  onStateChange={onPlayerStateChange}
                  className="absolute inset-0 w-full h-full"
                  iframeClassName="w-full h-full"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-white">
                  <div className="w-20 h-20 bg-brutal-green border-4 border-white rounded-full flex items-center justify-center text-brutal-black mb-4">
                    <Play className="w-10 h-10 ml-2 fill-current" />
                  </div>
                  <p className="font-display text-2xl tracking-widest uppercase">READY</p>
                </div>
              )}
            </div>

            {/* Player Controls */}
            {currentVideo && (
              <div className="flex flex-col gap-4 2xl:gap-6 bg-white border-4 border-brutal-black p-4 2xl:p-6 pt-[13px] 2xl:pt-[20px] pl-4 2xl:pl-6 shadow-[6px_6px_0_0_#000] 2xl:shadow-[8px_8px_0_0_#000] shrink-0">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 2xl:gap-8">
                  <div className="flex-1 min-w-0 w-full text-center md:text-left">
                    <div className="text-xl 2xl:text-3xl font-display uppercase truncate">
                      {currentVideo.title}
                    </div>
                    <div className="text-sm 2xl:text-xl font-bold text-brutal-black/60 uppercase truncate">
                      {currentVideo.channelTitle}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 2xl:gap-6 shrink-0 h-[52px] 2xl:h-[72px] p-0 m-0">
                    <button 
                      onClick={() => setRepeatMode(prev => prev === 'off' ? 'one' : 'off')}
                      className={cn(
                        "p-3 2xl:p-4 border-2 2xl:border-4 border-brutal-black transition-colors shadow-[2px_2px_0_0_#000] 2xl:shadow-[4px_4px_0_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
                        repeatMode !== 'off' ? "bg-brutal-green text-brutal-black" : "bg-white text-brutal-black hover:bg-brutal-gray"
                      )}
                      title={`Repeat: ${repeatMode}`}
                    >
                      {repeatMode === 'one' ? <Repeat1 className="w-6 h-6 2xl:w-8 2xl:h-8" /> : <Repeat className="w-6 h-6 2xl:w-8 2xl:h-8" />}
                    </button>
                    <button 
                      onClick={playPrevious}
                      disabled={currentIndex === 0 && repeatMode !== 'all'}
                      className="p-3 2xl:p-4 bg-white border-2 2xl:border-4 border-brutal-black hover:bg-brutal-green disabled:opacity-30 transition-colors shadow-[2px_2px_0_0_#000] 2xl:shadow-[4px_4px_0_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                    >
                      <SkipBack className="w-6 h-6 2xl:w-8 2xl:h-8" />
                    </button>
                    <button 
                      onClick={() => {
                        if (isPlaying) {
                          playerRef.current?.pauseVideo();
                        } else {
                          playerRef.current?.playVideo();
                        }
                      }}
                      className="w-[60px] h-[60px] 2xl:w-[80px] 2xl:h-[80px] bg-brutal-black text-white border-2 2xl:border-4 border-brutal-black flex items-center justify-center hover:bg-brutal-green hover:text-brutal-black transition-colors shadow-[4px_4px_0_0_#000] 2xl:shadow-[6px_6px_0_0_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
                    >
                      {isPlaying ? <Pause className="w-8 h-8 2xl:w-10 2xl:h-10 fill-current" /> : <Play className="w-8 h-8 2xl:w-10 2xl:h-10 fill-current ml-1" />}
                    </button>
                    <button 
                      onClick={playNext}
                      disabled={currentIndex === queue.length - 1 && repeatMode !== 'all'}
                      className="p-3 2xl:p-4 bg-white border-2 2xl:border-4 border-brutal-black hover:bg-brutal-green disabled:opacity-30 transition-colors shadow-[2px_2px_0_0_#000] 2xl:shadow-[4px_4px_0_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                    >
                      <SkipForward className="w-6 h-6 2xl:w-8 2xl:h-8" />
                    </button>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="flex items-center gap-3 2xl:gap-5 w-full">
                  <span className="text-sm 2xl:text-lg font-bold font-mono w-12 2xl:w-16 text-right shrink-0">{formatTime(currentTime)}</span>
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    value={currentTime}
                    onChange={(e) => {
                      const newTime = Number(e.target.value);
                      setCurrentTime(newTime);
                      if (playerRef.current) {
                        playerRef.current.seekTo(newTime, true);
                      }
                    }}
                    style={{
                      background: `linear-gradient(to right, #89d07e ${(currentTime / (duration || 100)) * 100}%, #e5e7eb ${(currentTime / (duration || 100)) * 100}%)`
                    }}
                    className="flex-1 h-4 2xl:h-6 border-2 2xl:border-4 border-brutal-black appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 2xl:[&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 2xl:[&::-webkit-slider-thumb]:h-8 [&::-webkit-slider-thumb]:bg-brutal-black [&::-webkit-slider-thumb]:border-2 2xl:[&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-brutal-black active:[&::-webkit-slider-thumb]:bg-brutal-black"
                  />
                  <span className="text-sm 2xl:text-lg font-bold font-mono w-12 2xl:w-16 shrink-0">{formatTime(duration)}</span>
                </div>
              </div>
            )}

            {/* Queue (Shown below player when sidebar is closed) */}
            {!isSidebarOpen && queue.length > 0 && (
              <div className="w-full">
                <QueueComponent 
                  queue={queue} 
                  currentIndex={currentIndex} 
                  playSpecificVideo={playSpecificVideo} 
                />
              </div>
            )}


          </div>
        )}
      </div>
      
    </div>
  );
}