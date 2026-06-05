/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';
import { 
  Play, Shuffle, Trash2, Plus, ListVideo, 
  SkipForward, SkipBack, Loader2, AlertCircle,
  Volume2, Pause, Repeat, Repeat1, PanelLeftClose, PanelLeftOpen, Moon, Maximize, Mouse, Settings, Radio, MoreVertical,
  X, Heart, Cast, AudioLines, RefreshCw, Star, Music, Film
} from 'lucide-react';
import { 
  fetchPlaylistInfo, fetchPlaylistItems, extractPlaylistId, 
  shuffleArray, PlaylistItem, PlaylistInfo 
} from './lib/youtube';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';

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
  playSpecificVideo,
  uiMode
}: { 
  queue: PlaylistItem[], 
  currentIndex: number, 
  playSpecificVideo: (index: number) => void,
  uiMode: string
}) => (
  <div className="flex flex-col gap-2 flex-1 min-h-0 pt-4 -mt-[17px] overflow-hidden">
    <div className={cn("text-sm 2xl:text-lg uppercase font-bold tracking-widest pb-1 2xl:pb-2 flex justify-between items-center shrink-0", uiMode === 'retro' ? "text-[var(--retro-accent-text)] border-b-0 px-2" : "border-b-2 2xl:border-b-4 border-brutal-black")}>
      <div className="flex items-center gap-3">
        {uiMode === 'retro' ? (
          <div className="paper-logo text-[1.4rem] 2xl:text-[1.8rem] ml-1 mb-2 mt-2" style={{ textTransform: 'none' }}>
            <span style={{ color: '#fcaf6c', transform: 'rotate(-2deg)' }}>U</span>
            <span style={{ color: '#f38883', transform: 'translateY(-2px) rotate(2deg)' }}>P</span>
            <span style={{ display: 'inline-block', width: '0.4em' }}></span>
            <span style={{ color: '#b7d698', transform: 'translateY(1px) rotate(-1deg)' }}>N</span>
            <span style={{ color: '#7bb1db', transform: 'rotate(2deg)' }}>e</span>
            <span style={{ color: '#aa95c7', transform: 'translateY(-1px) rotate(-2deg)' }}>x</span>
            <span style={{ color: '#f5cb74', transform: 'rotate(1deg)' }}>t</span>
          </div>
        ) : (
          <span>Up Next</span>
        )}
      </div>
      {uiMode === 'retro' ? (
        <div className="paper-logo text-[1.2rem] 2xl:text-[1.5rem]" style={{ textTransform: 'none' }}>
          <span style={{ color: '#7bb1db', transform: 'rotate(-2deg)' }}>{currentIndex + 1}</span>
          <span style={{ color: '#f5cb74', marginInline: '0.2em' }}>/</span>
          <span style={{ color: '#eb9dc5', transform: 'rotate(2deg)' }}>{queue.length}</span>
        </div>
      ) : (
        <span className="theme-badge px-3 py-1 2xl:px-4 2xl:py-1.5 rounded-full text-xs font-bold">{currentIndex + 1} / {queue.length}</span>
      )}
    </div>
    <div className={cn("flex flex-col overflow-y-auto px-6 -mx-6 py-6 -my-4 custom-scrollbar flex-1", uiMode === 'retro' ? "gap-4 2xl:gap-5" : "gap-3 2xl:gap-4")}>
      {queue.map((item, index) => {
        if (index < currentIndex) return null;

        const isPlaying = index === currentIndex;
        
        return (
          <div 
            key={`${item.id}-${index}`}
            onClick={() => playSpecificVideo(index)}
            className={cn(
              uiMode === 'retro'
                ? "retro-queue-item flex items-center gap-3 2xl:gap-4 p-3 2xl:p-4 px-4 2xl:px-5 cursor-pointer shrink-0 mx-2 mb-2 relative"
                : "flex items-center gap-4 2xl:gap-6 p-2 2xl:p-4 border-2 2xl:border-4 cursor-pointer transition-all shrink-0 mx-2 mb-2",
              uiMode !== 'retro' && isPlaying 
                ? "border-brutal-black bg-brutal-green shadow-[4px_4px_0_0_var(--color-brutal-black)] 2xl:shadow-[6px_6px_0_0_var(--color-brutal-black)]" 
                : uiMode !== 'retro' ? "border-brutal-black bg-brutal-white hover:bg-brutal-gray shadow-[4px_4px_0_0_var(--color-brutal-black)] 2xl:shadow-[6px_6px_0_0_var(--color-brutal-black)]" : ""
            )}
          >
            {uiMode !== 'retro' && (
              <div className="w-[100px] h-[56px] 2xl:w-[160px] 2xl:h-[90px] bg-brutal-black border-2 2xl:border-4 border-brutal-black overflow-hidden shrink-0 relative">
                <img 
                  src={item.thumbnail} 
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            {uiMode === 'retro' && (
              <div className="w-10 h-10 2xl:w-14 2xl:h-14 rounded-full overflow-hidden shrink-0 shadow-inner opacity-80" style={{ backgroundColor: 'var(--retro-secondary)' }}>
                <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <div className={cn("text-sm 2xl:text-lg font-extrabold truncate tracking-tight", uiMode === 'retro' ? "text-[var(--retro-accent-text)]" : "text-sm 2xl:text-xl font-bold uppercase")}>
                {item.title}
              </div>
              <div className={cn("text-xs 2xl:text-sm font-bold truncate", uiMode === 'retro' ? "text-[var(--retro-muted)] mt-0.5 tracking-wide" : "text-xs 2xl:text-base text-brutal-black/60 uppercase")}>
                {item.channelTitle}
              </div>
            </div>
            <div className={cn(
              "shrink-0 transition-all duration-300 flex items-center justify-end",
              uiMode === 'retro' ? "min-w-[50px] 2xl:min-w-[70px] pl-2" : "px-2 2xl:px-4 text-xl 2xl:text-3xl font-display",
              isPlaying 
                ? (uiMode === 'retro' ? "" : document.documentElement.classList.contains('ui-wood') ? "text-brutal-green font-medium tracking-wide text-sm" : "text-brutal-black") 
                : (uiMode === 'retro' ? "text-[var(--retro-accent-text)] font-extrabold text-[1.1rem] 2xl:text-2xl opacity-80" : "text-brutal-black/30 font-display")
            )} style={uiMode === 'retro' && !isPlaying ? { fontFamily: "'Nunito', sans-serif" } : {}}>
              {isPlaying && uiMode === 'retro' ? (
                <div className="relative mt-1" style={{ filter: 'var(--retro-filter-shadow)' }}>
                  <div className="relative inline-flex flex-col items-center justify-center bg-[var(--badge-bg)] rounded-full px-3 py-1.5 2xl:px-4 2xl:py-2 min-w-[65px] 2xl:min-w-[75px]">
                    {/* Cloud Bumps */}
                    <div className="absolute -top-2.5 left-[50%] -translate-x-[50%] w-6 h-6 2xl:w-7 2xl:h-7 bg-[var(--badge-bg)] rounded-full"></div>
                    <div className="absolute -top-1 left-0.5 w-4 h-4 2xl:w-5 2xl:h-5 bg-[var(--badge-bg)] rounded-full"></div>
                    <div className="absolute -top-1.5 right-0.5 w-4 h-4 2xl:w-5 2xl:h-5 bg-[var(--badge-bg)] rounded-full"></div>
                    {/* Heart */}
                    <div className="absolute -top-3 2xl:-top-4 left-1/2 -translate-x-1/2 z-10">
                      <Heart className="w-3 h-3 2xl:w-4 2xl:h-4 text-[#e06666] fill-current drop-shadow-sm" />
                    </div>
                    {/* Text */}
                    <span className="text-[9px] 2xl:text-[11px] font-extrabold text-[var(--badge-text)] tracking-wider relative z-10 pt-[2px]" style={{ fontFamily: "'Nunito', sans-serif" }}>PLAYING</span>
                  </div>
                </div>
              ) : isPlaying && uiMode === 'wood' ? (
                <div className="flex items-center gap-1 font-display text-sm tracking-widest text-[#b93c3c]">
                  <span className="text-[#b93c3c] text-lg">★</span>PLAYING
                </div>
              ) : isPlaying ? "PLAYING" : `#${index + 1}`}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

const WoodDecorations = ({ isPlayer = false }: { isPlayer?: boolean }) => {
  if (isPlayer) return null;
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[0]">
      <svg className="hidden">
        <filter id="sketch-filter">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      
      {/* Masking tapes */}
      <div className="absolute top-12 left-[20%] w-24 md:w-32 h-6 md:h-8 bg-[#e8e2d5]/60 rotate-[-4deg] shadow-sm backdrop-blur-sm mix-blend-multiply" style={{ clipPath: 'polygon(3% 0, 97% 5%, 98% 95%, 2% 100%)' }} />
      <div className="absolute bottom-16 right-[25%] w-20 md:w-28 h-6 md:h-8 bg-[#e8e2d5]/60 rotate-[6deg] shadow-sm backdrop-blur-sm mix-blend-multiply" style={{ clipPath: 'polygon(1% 4%, 99% 0, 96% 96%, 4% 98%)' }} />
      <div className="absolute top-1/3 right-[10%] w-16 md:w-24 h-6 md:h-8 bg-[#e8e2d5]/60 rotate-[85deg] shadow-sm backdrop-blur-sm mix-blend-multiply" style={{ clipPath: 'polygon(2% 2%, 98% 1%, 97% 99%, 3% 97%)' }} />

      {/* Coffee stains */}
      <div className="absolute top-[20%] right-[15%] w-32 h-32 md:w-48 md:h-48 rounded-full border-[4px] border-[#8a6b4e]/10 scale-y-90 -rotate-12 mix-blend-multiply" />
      <div className="absolute top-[20%] right-[15%] w-32 h-32 md:w-48 md:h-48 rounded-full border-[2px] border-[#8a6b4e]/15 scale-y-[0.85] -rotate-6 translate-x-2 translate-y-2 mix-blend-multiply" />
      
      <div className="absolute bottom-[25%] left-[10%] w-24 h-24 md:w-32 md:h-32 rounded-full border-[3px] border-[#8a6b4e]/10 scale-x-90 rotate-12 mix-blend-multiply" />

      {/* Hand-drawn scribbles */}
      <svg className="absolute top-[30%] left-[15%] w-16 h-16 md:w-24 md:h-24 stroke-[#332d29] opacity-15 fill-none stroke-[2] -rotate-12" style={{ filter: 'url(#sketch-filter)' }} viewBox="0 0 100 100">
        <path d="M10,50 Q20,20 40,50 T70,50 T90,30" strokeLinecap="round" />
      </svg>
      
      <svg className="absolute bottom-[40%] right-[20%] w-12 h-12 md:w-16 md:h-16 stroke-[#b93c3c] opacity-20 fill-none stroke-[3] rotate-45" style={{ filter: 'url(#sketch-filter)' }} viewBox="0 0 100 100">
        <path d="M50,10 L50,90 M10,50 L90,50" strokeLinecap="round" />
      </svg>
      
      <div style={{ filter: 'url(#sketch-filter)' }}>
        {/* Top Left */}
        <div className="absolute top-12 left-12 md:top-24 md:left-24 text-[#332d29] flex flex-col gap-8 opacity-25">
          <div className="relative group">
            <Music className="w-16 h-16 md:w-24 md:h-24 -rotate-12 absolute -top-0.5 -left-0.5" strokeWidth={1} />
            <Music className="w-16 h-16 md:w-24 md:h-24 -rotate-12" strokeWidth={1.5} />
          </div>
          <div className="relative ml-16">
            <Star className="w-10 h-10 md:w-12 md:h-12 rotate-[15deg] absolute top-0.5 left-0.5" strokeWidth={1} />
            <Star className="w-10 h-10 md:w-12 md:h-12 rotate-12" strokeWidth={1.5} />
          </div>
        </div>

        {/* Top Right */}
        <div className="absolute top-12 right-12 md:top-24 md:right-24 text-[#332d29] flex flex-col items-end gap-6 opacity-25">
          <div className="relative mr-16">
            <Star className="w-12 h-12 md:w-16 md:h-16 rotate-180 absolute -top-0.5 -left-0.5" strokeWidth={1} />
            <Star className="w-12 h-12 md:w-16 md:h-16 rotate-[175deg]" strokeWidth={1.5} />
          </div>
          <div className="relative">
            <Music className="w-14 h-14 md:w-20 md:h-20 rotate-[15deg] absolute top-0.5" strokeWidth={1} />
            <Music className="w-14 h-14 md:w-20 md:h-20 rotate-12" strokeWidth={1.5} />
          </div>
        </div>

        {/* Bottom Left */}
        <div className="absolute bottom-16 left-16 md:bottom-32 md:left-32 text-[#332d29] flex gap-6 items-end opacity-20">
          <div className="relative">
            <Film className="w-24 h-24 md:w-32 md:h-32 -rotate-6 absolute -left-1" strokeWidth={1} />
            <Film className="w-24 h-24 md:w-32 md:h-32 -rotate-3" strokeWidth={1.5} />
          </div>
        </div>

        {/* Bottom Right */}
        <div className="absolute bottom-20 right-20 md:bottom-32 md:right-32 text-[#332d29] opacity-25">
          <div className="relative">
            <Settings className="w-20 h-20 md:w-28 md:h-28 rotate-45 absolute" strokeWidth={1} />
            <Settings className="w-20 h-20 md:w-28 md:h-28 rotate-[43deg]" strokeWidth={1.5} />
          </div>
          <div className="relative -bottom-4 -left-8">
            <Settings className="w-14 h-14 md:w-20 md:h-20 -rotate-12 absolute -top-0.5 -left-0.5" strokeWidth={1} />
            <Settings className="w-14 h-14 md:w-20 md:h-20 -rotate-[10deg]" strokeWidth={1.5} />
          </div>
        </div>
      </div>
    </div>
  );
};

const RetroDecorations = ({ isPlayer = false }: { isPlayer?: boolean }) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[0]">
      {/* Decorative Border Frame */}
      <div className={cn("absolute top-0 left-0 w-full transition-all duration-500", isPlayer ? "h-[10px] md:h-[16px]" : "h-[20px] md:h-[30px]")} style={{ background: 'var(--retro-border-top)', filter: 'var(--retro-filter-shadow)' }}></div>
      <div className={cn("absolute bottom-0 left-0 w-full transition-all duration-500", isPlayer ? "h-[10px] md:h-[16px]" : "h-[20px] md:h-[30px]")} style={{ background: 'var(--retro-border-bottom)', filter: 'var(--retro-filter-shadow)' }}></div>
      <div className={cn("absolute top-0 left-0 h-full transition-all duration-500", isPlayer ? "w-[10px] md:w-[16px]" : "w-[20px] md:w-[30px]")} style={{ background: 'var(--retro-border-left)', filter: 'var(--retro-filter-shadow)' }}></div>
      <div className={cn("absolute top-0 right-0 h-full transition-all duration-500", isPlayer ? "w-[10px] md:w-[16px]" : "w-[20px] md:w-[30px]")} style={{ background: 'var(--retro-border-right)', filter: 'var(--retro-filter-shadow)' }}></div>

      {!isPlayer && (
        <>
          {/* Top Left Area - Clouds */}
          <div className="absolute -top-16 -left-16 md:-top-20 md:-left-20 w-80 h-80 drop-shadow-xl" style={{ filter: 'var(--retro-filter-shadow)' }}>
            <div className="absolute w-44 h-44 rounded-full bg-[#d0c3e1] top-8 left-4"></div>
            <div className="absolute w-36 h-36 rounded-full bg-[#d0c3e1] top-28 left-8"></div>
            <div className="absolute w-48 h-48 rounded-full bg-[#c5e6a9] top-16 left-28"></div>
            <div className="absolute w-40 h-40 rounded-full bg-[#c5e6a9] top-44 left-16"></div>
            <div className="absolute w-36 h-36 rounded-full bg-[#c5e6a9] top-32 left-44"></div>
            
            <Star className="absolute top-36 left-36 w-14 h-14 text-[#c5e6a9] fill-[#c5e6a9] stroke-white stroke-[2px]" style={{ filter: 'drop-shadow(2px 2px 2px rgba(100,90,80,0.1))' }} />
            <Star className="absolute top-20 left-48 w-10 h-10 text-[#fff] fill-[#fff] stroke-[#f0e6d2] stroke-[2px]" />
            <Heart className="absolute top-44 left-56 w-12 h-12 text-[#aa95c7] fill-[#aa95c7] stroke-white stroke-[2px]" />
          </div>

          {/* Top Right Area - Clouds */}
          <div className="absolute -top-16 -right-16 md:-top-20 md:-right-20 w-80 h-80 drop-shadow-xl" style={{ filter: 'var(--retro-filter-shadow)' }}>
            <div className="absolute w-56 h-56 rounded-full bg-[#9ed5ff] top-4 right-10"></div>
            <div className="absolute w-48 h-48 rounded-full bg-[#ffcce6] top-24 right-32"></div>
            <div className="absolute w-44 h-44 rounded-full bg-[#ffcce6] top-40 right-12"></div>
            
            <Star className="absolute top-28 right-32 w-14 h-14 text-[#ffb380] fill-[#ffb380] stroke-white stroke-[2px]" />
            <Star className="absolute top-24 right-52 w-10 h-10 text-[#fff] fill-[#fff] stroke-[#f0e6d2] stroke-[2px]" />
          </div>

          {/* Bottom Left Area - Clouds */}
          <div className="absolute -bottom-16 -left-16 md:-bottom-20 md:-left-20 w-80 h-80 drop-shadow-xl" style={{ filter: 'var(--retro-filter-shadow)' }}>
            <div className="absolute w-56 h-56 rounded-full bg-[#c5e6a9] bottom-10 left-4"></div>
            <div className="absolute w-44 h-44 rounded-full bg-[#fff] bottom-24 left-24 opacity-60"></div>
            <div className="absolute w-48 h-48 rounded-full bg-[#e8eecc] bottom-4 left-32"></div>
            
            <Heart className="absolute bottom-32 left-32 w-14 h-14 text-[#fff] fill-[#fff] stroke-[#f0e6d2] stroke-[2px]" />
            <Heart className="absolute bottom-20 left-48 w-10 h-10 text-[#c5e6a9] fill-[#c5e6a9] stroke-white stroke-[2px]" />
          </div>

          {/* Bottom Right Area - Clouds */}
          <div className="absolute -bottom-16 -right-16 md:-bottom-20 md:-right-20 w-[24rem] h-[24rem] drop-shadow-xl" style={{ filter: 'var(--retro-filter-shadow)' }}>
            <div className="absolute w-64 h-64 rounded-full bg-[#d0c3e1] bottom-10 right-4"></div>
            <div className="absolute w-56 h-56 rounded-full bg-[#ffcce6] bottom-28 right-32"></div>
            <div className="absolute w-48 h-48 rounded-full bg-[#d0c3e1] bottom-4 right-44"></div>
            
            <div className="absolute bottom-24 right-24 w-32 h-32 rounded-full bg-[#d0c3e1] flex items-center justify-center border-[8px] border-[#fff]" style={{ filter: 'drop-shadow(2px 4px 6px rgba(100,90,80,0.2))' }}>
              <Play className="w-12 h-12 text-[#fff] fill-[#d0c3e1] stroke-white stroke-[4px] ml-2" />
            </div>
            <Star className="absolute bottom-48 right-24 w-12 h-12 text-[#9ed5ff] fill-[#9ed5ff] stroke-white stroke-[2px]" />
          </div>

          {/* Confetti Particles */}
          <div style={{ filter: 'var(--retro-filter-shadow)' }}>
            <div className="absolute top-[18%] left-[8%] w-4 h-4 rounded-full bg-[#ffb380]"></div>
            <Heart className="absolute top-[25%] left-[15%] w-5 h-5 text-[#ffcce6] fill-[#ffcce6] -rotate-12 stroke-white stroke-[1px]" />
            <Star className="absolute top-[32%] left-[10%] w-6 h-6 text-[#9ed5ff] fill-[#9ed5ff] rotate-45 stroke-white stroke-[1px]" />
            <div className="absolute top-[15%] left-[22%] w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent border-b-[#c5e6a9] rotate-[30deg]"></div>
            <div className="absolute top-[40%] left-[5%] w-3 h-3 rounded-full bg-[#d0c3e1]"></div>

            <div className="absolute top-[12%] right-[25%] w-4 h-4 rounded-full bg-[#ffdf99]"></div>
            <Heart className="absolute top-[22%] right-[15%] w-5 h-5 text-[#ffb380] fill-[#ffb380] rotate-12 stroke-white stroke-[1px]" />
            <Star className="absolute top-[30%] right-[8%] w-6 h-6 text-[#c5e6a9] fill-[#c5e6a9] -rotate-12 stroke-white stroke-[1px]" />
            <div className="absolute top-[18%] right-[30%] w-0 h-0 border-l-[8px] border-r-[8px] border-b-[14px] border-l-transparent border-r-transparent border-b-[#9ed5ff] rotate-[60deg]"></div>
            <div className="absolute top-[40%] text-[#ffcce6] left-[50%] w-4 h-4 rounded-full bg-[#ffcce6]"></div>

            <div className="absolute bottom-[20%] left-[28%] w-3 h-3 rounded-full bg-[#9ed5ff]"></div>
            <Heart className="absolute bottom-[28%] left-[15%] w-5 h-5 text-[#ffdf99] fill-[#ffdf99] rotate-45 stroke-white stroke-[1px]" />
            <Star className="absolute bottom-[35%] left-[22%] w-6 h-6 text-[#d0c3e1] fill-[#d0c3e1] -rotate-12 stroke-white stroke-[1px]" />
            <div className="absolute bottom-[18%] left-[10%] w-0 h-0 border-l-[7px] border-r-[7px] border-b-[12px] border-l-transparent border-r-transparent border-b-[#ffb380] rotate-[45deg]"></div>

            <div className="absolute bottom-[25%] right-[38%] w-4 h-4 rounded-full bg-[#c5e6a9]"></div>
            <Heart className="absolute bottom-[32%] right-[18%] w-5 h-5 text-[#ffcce6] fill-[#ffcce6] rotate-12 stroke-white stroke-[1px]" />
            <Star className="absolute bottom-[40%] right-[28%] w-6 h-6 text-[#ffb380] fill-[#ffb380] rotate-45 stroke-white stroke-[1px]" />
            <div className="absolute bottom-[18%] right-[15%] w-0 h-0 border-l-[8px] border-r-[8px] border-b-[14px] border-l-transparent border-r-transparent border-b-[#9ed5ff] -rotate-[30deg]"></div>
          </div>
        </>
      )}
    </div>
  );
};

const safeGetItem = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    return null;
  }
};

const safeSetItem = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    // Ignore error
  }
};

export default function App() {
  const [inputValue, setInputValue] = useState('');
  const [playlists, setPlaylists] = useState<PlaylistInfo[]>(() => {
    const saved = safeGetItem('savedPlaylists');
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
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAutoplayEnabled, setIsAutoplayEnabled] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [volume, setVolume] = useState(() => {
    const saved = safeGetItem('playerVolume');
    return saved !== null ? Number(saved) : 100;
  });
  const [showVolumeIndicator, setShowVolumeIndicator] = useState(false);
  
  useEffect(() => {
    safeSetItem('playerVolume', volume.toString());
  }, [volume]);
  const [isOverlayEnabled, setIsOverlayEnabled] = useState(() => {
    const saved = safeGetItem('isOverlayEnabled');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRadioMode, setIsRadioMode] = useState(false);
  const [isRadioShaking, setIsRadioShaking] = useState(false);
  const [isDarkModeShaking, setIsDarkModeShaking] = useState(false);
  const [showThemeWarning, setShowThemeWarning] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = safeGetItem('theme');
    return (saved as 'light' | 'dark') || 'light';
  });
  const [uiMode, setUiMode] = useState<'retro' | 'wood' | 'acrobatic'>(() => {
    const saved = safeGetItem('uiMode');
    return (saved as 'retro' | 'wood' | 'acrobatic') || 'retro';
  });

  const playerRef = useRef<any>(null);
  const autoplayRef = useRef(isAutoplayEnabled);
  const repeatModeRef = useRef(repeatMode);
  const currentIndexRef = useRef(currentIndex);
  const queueRef = useRef(queue);
  const isPlayingRef = useRef(isPlaying);
  const volumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  
  // Save isOverlayEnabled to localStorage
  useEffect(() => {
    safeSetItem('isOverlayEnabled', JSON.stringify(isOverlayEnabled));
  }, [isOverlayEnabled]);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay || !isOverlayEnabled) return;

    const handleNativeWheel = (e: WheelEvent) => {
      e.preventDefault(); // Prevent page scroll
      if (!playerRef.current) return;
      
      const delta = e.deltaY > 0 ? -1 : 1; // 1단위로 볼륨 조절
      setVolume(prev => {
        const newVolume = Math.max(0, Math.min(100, prev + delta));
        if (playerRef.current) {
          playerRef.current.setVolume(newVolume);
        }
        return newVolume;
      });
      
      setShowVolumeIndicator(true);
      if (volumeTimeoutRef.current) {
        clearTimeout(volumeTimeoutRef.current);
      }
      volumeTimeoutRef.current = setTimeout(() => {
        setShowVolumeIndicator(false);
      }, 1500);
    };

    overlay.addEventListener('wheel', handleNativeWheel, { passive: false });
    return () => {
      overlay.removeEventListener('wheel', handleNativeWheel);
    };
  }, [queue.length, initialVideoId, isOverlayEnabled]);

  useEffect(() => {
    safeSetItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    safeSetItem('uiMode', uiMode);
    document.documentElement.classList.remove('ui-retro', 'ui-cyberpunk', 'ui-emotional', 'ui-modern', 'ui-futuristic', 'ui-neon', 'ui-cinema', 'ui-wood', 'ui-acrobatic', 'ui-brutal', 'ui-minimal', 'ui-glass');
    document.documentElement.classList.add(`ui-${uiMode}`);
  }, [uiMode]);

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
    safeSetItem('savedPlaylists', JSON.stringify(playlists));
  }, [playlists]);

  useEffect(() => {
    // ⭐️ 앱 로드 시 및 새로고침 시 모든 플레이리스트 자동 동기화 (최신 곡 반영)
    let isMounted = true;
    const syncPlaylists = async () => {
      if (playlists.length === 0) return;
      setIsSyncing(true);
      try {
        const updatedPlaylists = [];
        for (const playlist of playlists) {
          try {
            const info = await fetchPlaylistInfo(playlist.id);
            const items = await fetchPlaylistItems(playlist.id);
            updatedPlaylists.push({ ...info, items });
          } catch (err) {
            console.warn('Failed to sync playlist', playlist.id, err);
            updatedPlaylists.push(playlist); // 에러 시 기존 데이터 유지
          }
        }
        if (isMounted) {
          setPlaylists(updatedPlaylists);
        }
      } catch (e) {
        console.warn('Failed to sync playlists:', e);
      } finally {
        if (isMounted) setIsSyncing(false);
      }
    };

    syncPlaylists();
    
    return () => {
      isMounted = false;
    };
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

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      // Ignore if typing in input fields
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }
      
      if (!playerRef.current) return;

      switch (e.key) {
        case 'ArrowLeft': {
          e.preventDefault();
          const currentT = await playerRef.current.getCurrentTime();
          if (currentT !== undefined) {
            playerRef.current.seekTo(Math.max(0, currentT - 10), true);
          }
          break;
        }
        case 'ArrowRight': {
          e.preventDefault();
          const currentT = await playerRef.current.getCurrentTime();
          const totalD = await playerRef.current.getDuration();
          if (currentT !== undefined && totalD !== undefined) {
            playerRef.current.seekTo(Math.min(totalD, currentT + 10), true);
          }
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          setVolume(prev => {
            const newVolume = Math.min(100, prev + 5);
            if (playerRef.current) playerRef.current.setVolume(newVolume);
            return newVolume;
          });
          setShowVolumeIndicator(true);
          if (volumeTimeoutRef.current) clearTimeout(volumeTimeoutRef.current);
          volumeTimeoutRef.current = setTimeout(() => setShowVolumeIndicator(false), 1500);
          break;
        }
        case 'ArrowDown': {
          e.preventDefault();
          setVolume(prev => {
            const newVolume = Math.max(0, prev - 5);
            if (playerRef.current) playerRef.current.setVolume(newVolume);
            return newVolume;
          });
          setShowVolumeIndicator(true);
          if (volumeTimeoutRef.current) clearTimeout(volumeTimeoutRef.current);
          volumeTimeoutRef.current = setTimeout(() => setShowVolumeIndicator(false), 1500);
          break;
        }
        case ' ': // Spacebar
          e.preventDefault();
          if (isPlayingRef.current) {
            playerRef.current.pauseVideo();
          } else {
            playerRef.current.playVideo();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

  const handleShuffle = () => {
    if (queue.length <= 1) return;
    const currentItem = queue[currentIndex];
    const remaining = queue.filter((_, idx) => idx !== currentIndex);
    const shuffled = [...remaining].sort(() => Math.random() - 0.5);
    setQueue([currentItem, ...shuffled]);
    setCurrentIndex(0);
  };

  const onPlayerReady: YouTubeProps['onReady'] = (event) => {
    playerRef.current = event.target;
    setIsPlayerReady(true);
    event.target.setVolume(volume);
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

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (videoContainerRef.current && videoContainerRef.current.requestFullscreen) {
        videoContainerRef.current.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(err => {
          console.error(`Error attempting to exit fullscreen: ${err.message}`);
        });
      }
    }
  };

  // ⭐️ 삭제: 기존에 있던 currentIndex를 감지해서 playVideo를 호출하던 불안정한 useEffect 삭제 완료

  const currentVideo = queue[currentIndex];

  return (
    <div className="min-h-screen bg-brutal-bg text-brutal-black font-sans flex flex-col relative z-0 overflow-hidden">
      {uiMode === 'retro' && !isRadioMode && (
        <RetroDecorations isPlayer={queue.length > 0} />
      )}
      {uiMode === 'wood' && !isRadioMode && (
        <WoodDecorations isPlayer={queue.length > 0} />
      )}
      <div className={cn(
        "flex-1 w-full mx-auto p-4 md:p-8 flex flex-col lg:flex-row transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] relative z-10",
        queue.length > 0 
          ? (isSidebarOpen 
              ? "gap-8 max-w-[1400px] 2xl:max-w-[2000px] lg:items-center min-h-[calc(100vh-4rem)]" 
              : "gap-8 lg:gap-0 max-w-[1400px] 2xl:max-w-[2000px] lg:items-center min-h-[calc(100vh-4rem)]") 
          : "gap-8 max-w-[600px] 2xl:max-w-[800px] justify-center"
      )}>
        
        {/* Sidebar */}
        <div className={cn(
          "flex-col relative transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden shrink-0",
          queue.length > 0 ? "lg:sticky lg:top-8 lg:h-[calc(100vh-4rem)]" : "w-full gap-6 2xl:gap-10",
          !queue.length ? "flex" : isSidebarOpen ? "flex opacity-100 lg:w-[400px] 2xl:w-[500px]" : "hidden lg:flex opacity-0 lg:w-[0px]"
        )}>
          <div className={cn(
            "flex flex-col w-full h-full lg:relative",
            queue.length > 0 ? "gap-4 lg:w-[400px] 2xl:w-[500px] border-b-2 lg:border-b-0 border-brutal-black/10 pb-8 lg:pb-0 mb-4 lg:mb-0" : "gap-6 2xl:gap-10 border-transparent border-0 pr-0"
          )}>
            {/* Divider Line */}
            {queue.length > 0 && isSidebarOpen && (
              <div className="hidden lg:block absolute top-0 -right-4 bottom-0 w-[2px] bg-brutal-black/10 transition-opacity duration-300" />
            )}
            {/* Toggle Sidebar Button (When Open) */}
            {queue.length > 0 && isSidebarOpen && (
            <div className="fixed top-4 left-4 z-50">
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 bg-brutal-white border-2 border-brutal-black hover:bg-brutal-green transition-colors shadow-[4px_4px_0_0_var(--color-brutal-black)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
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
              "title-bar flex flex-col items-center justify-center transition-all duration-500",
              queue.length > 0 ? "gap-2 text-5xl -mt-[10px] -mb-[5px]" 
                : "gap-4 text-6xl 2xl:text-8xl -mt-[15px] -mb-[20px] 2xl:-mt-[20px] 2xl:-mb-[30px]"
            )}
          >
            <a href="./" className="shrink-0 cursor-pointer transition-transform hover:scale-105 active:scale-95 outline-none">
              <img 
                src={uiMode === 'retro' ? "./logo-1.png" : uiMode === 'wood' ? "./logo-2.png" : "./logo.png"} 
                alt="BuNaMix Logo" 
                className={cn(
                  "object-contain transition-all duration-500 border-none bg-transparent outline-none", 
                  uiMode === 'wood' 
                    ? (queue.length > 0 ? "w-[180px] h-[180px]" : "w-[220px] h-[220px] 2xl:w-[300px] 2xl:h-[300px]")
                    : (queue.length > 0 ? "w-[150px] h-[150px]" : "w-[180px] h-[180px] 2xl:w-[260px] 2xl:h-[260px]")
                )} 
              />
            </a>
            <span className={cn(
              "leading-none tracking-tight flex items-center justify-center transition-all duration-500 relative z-10", 
              uiMode === 'wood' ? "wood-logo font-semibold" : uiMode === 'retro' ? "paper-logo" : "font-display",
              queue.length > 0 
                ? (uiMode === 'wood' ? "-mt-[25px] h-[50px]" : "-mt-2 h-[50px]") 
                : (uiMode === 'wood' ? "-mt-[40px] 2xl:-mt-[60px] h-[70px] 2xl:h-[100px]" : "-mt-6 h-[70px] 2xl:-mt-10 2xl:h-[100px]"),
              queue.length === 0 ? "text-7xl 2xl:text-9xl" : "text-5xl"
            )}>
              {uiMode === 'retro' ? (
                <>
                  <span style={{ color: '#f5cb74', transform: 'translateY(-2%) rotate(-3deg)' }}>B</span>
                  <span style={{ color: '#fcaf6c', transform: 'translateY(4%) rotate(2deg)' }}>u</span>
                  <span style={{ color: '#f38883', transform: 'translateY(-1%) rotate(-1deg)' }}>n</span>
                  <span style={{ color: '#b7d698', transform: 'translateY(3%) rotate(2deg)' }}>a</span>
                  <span style={{ color: '#82c396', transform: 'translateY(-2%) rotate(-2deg)' }}>M</span>
                  <span style={{ color: '#7bb1db', transform: 'translateY(1%) rotate(1deg)', position: 'relative', paddingInline: '0.05em' }}>
                    <span style={{ position: 'absolute', top: '-0.38em', left: '50%', transform: 'translateX(-50%)', fontSize: '0.65em' }}>♥</span>
                    ı
                  </span>
                  <span style={{ color: '#aa95c7', transform: 'translateY(2%) rotate(-1deg)' }}>x</span>
                </>
              ) : uiMode === 'wood' ? (
                <span className="text-[#1c2b42]">
                  BunaMix
                </span>
              ) : (
                <>BuNa<span style={{ color: '#89d07e' }}>Mix</span></>
              )}
            </span>
          </motion.div>
          
          {/* Add Playlist */}
          {queue.length === 0 && (
            <div className="flex flex-col gap-2 2xl:gap-4 w-full">
              <div className={cn("text-sm 2xl:text-lg uppercase font-bold tracking-widest pb-1 2xl:pb-2", uiMode === 'retro' ? "text-[var(--retro-accent-text)] border-b-0 px-2" : "border-b-2 2xl:border-b-4 border-brutal-black")}>
                {uiMode === 'retro' ? (
                  <div className="paper-logo text-[1.4rem] 2xl:text-[1.8rem] mb-2 mt-2" style={{ textTransform: 'none' }}>
                    <span style={{ color: '#7bb1db', transform: 'rotate(-2deg)' }}>A</span>
                    <span style={{ color: '#f5cb74', transform: 'translateY(-2px) rotate(2deg)' }}>d</span>
                    <span style={{ color: '#eb9dc5', transform: 'translateY(1px) rotate(-1deg)' }}>d</span>
                    <span style={{ display: 'inline-block', width: '0.4em' }}></span>
                    <span style={{ color: '#89d07e', transform: 'rotate(2deg)' }}>P</span>
                    <span style={{ color: '#aa95c7', transform: 'translateY(-1px) rotate(-2deg)' }}>l</span>
                    <span style={{ color: '#f38883', transform: 'rotate(1deg)' }}>a</span>
                    <span style={{ color: '#fcaf6c', transform: 'translateY(2px) rotate(-1deg)' }}>y</span>
                    <span style={{ color: '#b7d698', transform: 'rotate(2deg)' }}>l</span>
                    <span style={{ color: '#7bb1db', transform: 'translateY(-1px) rotate(-1deg)' }}>i</span>
                    <span style={{ color: '#f5cb74', transform: 'rotate(1deg)' }}>s</span>
                    <span style={{ color: '#eb9dc5', transform: 'translateY(1px) rotate(-2deg)' }}>t</span>
                    <span style={{ color: '#aa95c7', transform: 'rotate(1deg)' }}>s</span>
                  </div>
                ) : (
                  <span>Add Playlists</span>
                )}
              </div>
              <form onSubmit={handleAddPlaylist} className="flex gap-2 2xl:gap-4 mt-2 2xl:mt-4">
                <input
                  type="text"
                  placeholder="www.youtube.com/playlist?list="
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="flex-1 bg-brutal-white border-2 2xl:border-4 border-brutal-black p-3 2xl:p-5 text-brutal-black font-bold text-sm 2xl:text-xl outline-none focus:bg-brutal-gray transition-colors placeholder:text-brutal-black/40 shadow-[4px_4px_0_0_var(--color-brutal-black)] 2xl:shadow-[6px_6px_0_0_var(--color-brutal-black)]"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputValue.trim()}
                  className="bg-brutal-white border-2 2xl:border-4 border-brutal-black text-brutal-black px-4 2xl:px-8 hover:bg-brutal-green disabled:opacity-50 transition-colors flex items-center justify-center shrink-0 shadow-[4px_4px_0_0_var(--color-brutal-black)] 2xl:shadow-[6px_6px_0_0_var(--color-brutal-black)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 2xl:w-8 2xl:h-8 animate-spin" /> : <Plus className="w-6 h-6 2xl:w-8 2xl:h-8 stroke-[3]" />}
                </button>
              </form>
              {error && (
                <div className="bg-brutal-black text-brutal-white p-2 2xl:p-4 text-sm 2xl:text-lg font-bold mt-2 2xl:mt-4 uppercase flex items-start gap-2 2xl:gap-3">
                  <AlertCircle className="w-5 h-5 2xl:w-7 2xl:h-7 shrink-0" />
                  <p>{error}</p>
                </div>
              )}
            </div>
          )}

          {/* Playlists List */}
          {queue.length === 0 && (
            <div className="flex flex-col gap-2 2xl:gap-4 shrink-0 max-h-[260px] 2xl:max-h-[400px] w-full">
              <div className={cn("text-sm 2xl:text-lg uppercase font-bold tracking-widest pb-1 2xl:pb-2 flex justify-between items-center shrink-0", uiMode === 'retro' ? "text-[var(--retro-accent-text)] border-b-0 px-2" : "border-b-2 2xl:border-b-4 border-brutal-black")}>
                <div className="flex items-center gap-1">
                  {uiMode === 'retro' ? (
                    <div className="paper-logo text-[1.4rem] 2xl:text-[1.8rem] mb-2 mt-2" style={{ textTransform: 'none' }}>
                      <span style={{ color: '#f5cb74', transform: 'rotate(-2deg)' }}>Y</span>
                      <span style={{ color: '#eb9dc5', transform: 'translateY(-2px) rotate(2deg)' }}>o</span>
                      <span style={{ color: '#aa95c7', transform: 'translateY(1px) rotate(-1deg)' }}>u</span>
                      <span style={{ color: '#89d07e', transform: 'rotate(2deg)' }}>r</span>
                      <span style={{ display: 'inline-block', width: '0.4em' }}></span>
                      <span style={{ color: '#f38883', transform: 'translateY(-1px) rotate(-2deg)' }}>P</span>
                      <span style={{ color: '#fcaf6c', transform: 'rotate(1deg)' }}>l</span>
                      <span style={{ color: '#b7d698', transform: 'translateY(2px) rotate(-1deg)' }}>a</span>
                      <span style={{ color: '#7bb1db', transform: 'rotate(2deg)' }}>y</span>
                      <span style={{ color: '#f5cb74', transform: 'translateY(-1px) rotate(-1deg)' }}>l</span>
                      <span style={{ color: '#eb9dc5', transform: 'rotate(1deg)' }}>i</span>
                      <span style={{ color: '#aa95c7', transform: 'translateY(1px) rotate(-2deg)' }}>s</span>
                      <span style={{ color: '#89d07e', transform: 'rotate(1deg)' }}>t</span>
                      <span style={{ color: '#f38883', transform: 'rotate(-1deg)' }}>s</span>
                    </div>
                  ) : (
                    <span>Your Playlists</span>
                  )}
                  {playlists.length > 0 && (
                    <button 
                      onClick={async (e) => {
                        e.stopPropagation();
                        setIsSyncing(true);
                        try {
                          const updatedPlaylists = await Promise.all(
                            playlists.map(async (playlist) => {
                              try {
                                const info = await fetchPlaylistInfo(playlist.id);
                                const items = await fetchPlaylistItems(playlist.id);
                                return { ...info, items };
                              } catch (err) {
                                return playlist;
                              }
                            })
                          );
                          setPlaylists(updatedPlaylists);
                        } finally {
                          setIsSyncing(false);
                        }
                      }}
                      className="p-1 hover:bg-brutal-black hover:text-white transition-colors border-2 border-transparent hover:border-black rounded-full"
                      title="Sync external changes"
                      disabled={isSyncing}
                    >
                      <RefreshCw className={cn("w-4 h-4 2xl:w-5 2xl:h-5", isSyncing && "animate-spin")} />
                    </button>
                  )}
                </div>
                {uiMode === 'retro' ? (
                  <div className="paper-logo text-[1.2rem] 2xl:text-[1.5rem]" style={{ textTransform: 'none' }}>
                    <span style={{ color: '#eb9dc5', transform: 'rotate(2deg)' }}>{playlists.length}</span>
                  </div>
                ) : (
                  <span className="theme-badge px-3 py-1 2xl:px-4 2xl:py-1.5 rounded-full text-xs font-bold">{playlists.length}</span>
                )}
              </div>
              <div className="space-y-3 2xl:space-y-4 overflow-y-auto px-6 -mx-6 py-6 -my-4 custom-scrollbar flex-1 min-h-0">
                {playlists.length === 0 ? (
                  <div className="text-center py-8 2xl:py-12 text-brutal-black font-bold uppercase border-2 2xl:border-4 border-dashed border-brutal-black bg-brutal-gray 2xl:text-xl">
                    NO PLAYLISTS ADDED.
                  </div>
                ) : (
                  playlists.map((playlist) => (
                    <div 
                      key={playlist.id} 
                      onClick={() => handleShuffleAndPlay(playlist.id)}
                      className="flex items-center gap-3 2xl:gap-5 bg-brutal-white border-2 2xl:border-4 border-brutal-black p-2 2xl:p-4 mx-2 mb-2 group transition-colors hover:bg-brutal-gray shadow-[4px_4px_0_0_var(--color-brutal-black)] 2xl:shadow-[6px_6px_0_0_var(--color-brutal-black)] cursor-pointer"
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
                        className="p-2 2xl:p-3 text-brutal-black hover:bg-brutal-black hover:text-brutal-white border-2 2xl:border-4 border-transparent hover:border-brutal-black transition-colors shrink-0"
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

          {/* Queue */}
          {queue.length > 0 && (
            <QueueComponent 
              queue={queue} 
              currentIndex={currentIndex} 
              playSpecificVideo={playSpecificVideo} 
              uiMode={uiMode}
            />
          )}
        </div>
      </div>

        {/* Main View */}
        {queue.length > 0 && (
          <div className={cn(
            "flex-1 flex flex-col gap-6 h-full overflow-hidden pt-8 lg:pt-0 transition-all duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] relative justify-center items-center w-full min-w-0"
          )}>
            
            {/* Toggle Sidebar Button (When Closed or Mobile) */}
            <div className={cn(
              "z-50 w-full",
              isSidebarOpen 
                ? "absolute -top-12 right-0 lg:hidden" 
                : "fixed top-4 left-4"
            )}>
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 bg-brutal-white border-2 border-brutal-black hover:bg-brutal-green transition-colors shadow-[4px_4px_0_0_var(--color-brutal-black)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
              >
                {isSidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
              </button>
            </div>

            {/* Player Area Wrapper */}
            <div className="flex flex-col gap-4 2xl:gap-6 w-full max-w-[1000px] 2xl:max-w-[1200px] relative justify-center mx-auto">
              {/* Player Mockup */}
              <div ref={videoContainerRef} className={cn(
                "w-full bg-brutal-black border-4 border-brutal-black flex items-center justify-center relative overflow-hidden shadow-[8px_8px_0_0_var(--color-brutal-black)] fullscreen-clean",
                isRadioMode ? "absolute w-[1px] h-[1px] opacity-0 pointer-events-none -z-50" : "aspect-video"
              )}>
                {/* ⭐️ 변경: queue가 있고 initialVideoId가 세팅되었을 때만 렌더링 */}
                {queue.length > 0 && initialVideoId ? (
                  <>
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
                    {/* Overlay to capture wheel events over iframe (centered to avoid blocking YT controls) */}
                    {isOverlayEnabled && (
                      <div 
                        ref={overlayRef}
                        className="absolute top-[60px] left-0 right-0 bottom-[60px] z-10 cursor-pointer"
                        onClick={() => {
                          if (isPlaying) {
                            playerRef.current?.pauseVideo();
                          } else {
                            playerRef.current?.playVideo();
                          }
                        }}
                        onDoubleClick={toggleFullscreen}
                      />
                    )}
                    {/* Volume Indicator Overlay */}
                    {showVolumeIndicator && (
                      <div className="absolute top-[10%] left-1/2 -translate-x-1/2 pointer-events-none z-50 bg-black/70 px-4 py-2 rounded text-white shadow-md">
                        <span className="text-lg font-medium">{volume}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center text-brutal-white">
                    <div className="w-20 h-20 bg-brutal-green border-4 border-brutal-white rounded-full flex items-center justify-center text-brutal-black mb-4">
                      <Play className="w-10 h-10 ml-2 fill-current" />
                    </div>
                    <p className="font-display text-2xl tracking-widest uppercase">READY</p>
                  </div>
                )}
              </div>

              {/* Normal Player Controls */}
              {!isRadioMode && currentVideo && (
                <>
                  <div className="flex flex-col gap-4 2xl:gap-6 bg-brutal-white border-4 border-brutal-black p-4 2xl:p-6 pt-[13px] 2xl:pt-[20px] pl-4 2xl:pl-6 shadow-[6px_6px_0_0_var(--color-brutal-black)] 2xl:shadow-[8px_8px_0_0_var(--color-brutal-black)] shrink-0">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 2xl:gap-8">
                      <div className="flex-1 min-w-0 w-full text-center md:text-left">
                        <div className="text-xl 2xl:text-3xl font-display uppercase truncate">
                          {currentVideo.title}
                        </div>
                        <div className="text-sm 2xl:text-xl font-bold text-brutal-black/60 uppercase truncate">
                          {currentVideo.channelTitle}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 2xl:gap-6 shrink-0 h-[52px] 2xl:h-[72px] px-6 -mx-6 py-8 -my-8">
                        <button 
                          onClick={handleShuffle}
                          className="p-3 2xl:p-4 bg-brutal-white border-2 2xl:border-4 border-brutal-black hover:bg-brutal-green transition-colors shadow-[2px_2px_0_0_var(--color-brutal-black)] 2xl:shadow-[4px_4px_0_0_var(--color-brutal-black)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                          title="Shuffle Playlist"
                        >
                          <Shuffle className="w-6 h-6 2xl:w-8 2xl:h-8" />
                        </button>
                        <button 
                          onClick={() => setRepeatMode(prev => prev === 'off' ? 'one' : 'off')}
                          className={cn(
                            "p-3 2xl:p-4 border-2 2xl:border-4 border-brutal-black transition-colors shadow-[2px_2px_0_0_var(--color-brutal-black)] 2xl:shadow-[4px_4px_0_0_var(--color-brutal-black)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none",
                            repeatMode !== 'off' ? "bg-brutal-green text-brutal-black" : "bg-brutal-white text-brutal-black hover:bg-brutal-gray"
                          )}
                          title={`Repeat: ${repeatMode}`}
                        >
                          {repeatMode === 'one' ? <Repeat1 className="w-6 h-6 2xl:w-8 2xl:h-8" /> : <Repeat className="w-6 h-6 2xl:w-8 2xl:h-8" />}
                        </button>
                        <button 
                          onClick={playPrevious}
                          disabled={currentIndex === 0 && repeatMode !== 'all'}
                          className="p-3 2xl:p-4 bg-brutal-white border-2 2xl:border-4 border-brutal-black hover:bg-brutal-green disabled:opacity-30 transition-colors shadow-[2px_2px_0_0_var(--color-brutal-black)] 2xl:shadow-[4px_4px_0_0_var(--color-brutal-black)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
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
                          className="w-[60px] h-[60px] 2xl:w-[80px] 2xl:h-[80px] bg-brutal-white text-brutal-black border-2 2xl:border-4 border-brutal-black flex items-center justify-center hover:bg-brutal-green transition-colors shadow-[4px_4px_0_0_var(--color-brutal-black)] 2xl:shadow-[6px_6px_0_0_var(--color-brutal-black)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
                        >
                          {isPlaying ? <Pause className="w-8 h-8 2xl:w-10 2xl:h-10 fill-current" /> : <Play className="w-8 h-8 2xl:w-10 2xl:h-10 fill-current ml-1" />}
                        </button>
                        <button 
                          onClick={playNext}
                          disabled={currentIndex === queue.length - 1 && repeatMode !== 'all'}
                          className="p-3 2xl:p-4 bg-brutal-white border-2 2xl:border-4 border-brutal-black hover:bg-brutal-green disabled:opacity-30 transition-colors shadow-[2px_2px_0_0_var(--color-brutal-black)] 2xl:shadow-[4px_4px_0_0_var(--color-brutal-black)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                        >
                          <SkipForward className="w-6 h-6 2xl:w-8 2xl:h-8" />
                        </button>
                      </div>
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
                        background: `linear-gradient(to right, var(--slider-fill, #89d07e) ${(currentTime / (duration || 100)) * 100}%, var(--slider-bg, #e5e7eb) ${(currentTime / (duration || 100)) * 100}%)`
                      }}
                      className="theme-slider flex-1 h-4 2xl:h-6 border-2 2xl:border-4 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 2xl:[&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 2xl:[&::-webkit-slider-thumb]:h-8 [&::-webkit-slider-thumb]:border-2 2xl:[&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:rounded-full"
                    />
                    <span className="text-sm 2xl:text-lg font-bold font-mono w-12 2xl:w-16 shrink-0">{formatTime(duration)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Queue (Shown below player when sidebar is closed) */}
            {!isSidebarOpen && queue.length > 0 && (
              <div className="w-full h-[500px] 2xl:h-[700px] flex flex-col">
                <QueueComponent 
                  queue={queue} 
                  currentIndex={currentIndex} 
                  playSpecificVideo={playSpecificVideo} 
                  uiMode={uiMode}
                />
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Settings Menu */}
      <AnimatePresence>
        {!isRadioMode && isSettingsOpen && (
          <>
            {/* Backdrop to close settings when clicking outside */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsSettingsOpen(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="settings-panel fixed bottom-16 right-4 2xl:bottom-24 2xl:right-8 z-50 bg-black/80 backdrop-blur-md rounded-xl p-5 shadow-2xl border border-white/10 w-[340px]"
            >
              <div className="grid grid-cols-3 gap-x-3 gap-y-4">
                
                {/* Dark Mode Toggle */}
                <div className="flex flex-col items-center gap-2 relative">
                  <motion.button
                    animate={isDarkModeShaking ? { x: [-3, 3, -3, 3, 0] } : {}}
                    transition={{ duration: 0.3 }}
                    onClick={() => {
                      if (uiMode === 'wood') {
                        setIsDarkModeShaking(true);
                        setShowThemeWarning(true);
                        setTimeout(() => setIsDarkModeShaking(false), 300);
                        setTimeout(() => setShowThemeWarning(false), 2000);
                        return;
                      }
                      setTheme(prev => prev === 'light' ? 'dark' : 'light');
                    }}
                    className={cn(
                      "settings-btn w-full h-12 rounded-lg flex items-center justify-center transition-colors",
                      theme === 'dark' ? "bg-[#4cc2ff] text-black" : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
                    )}
                  >
                    <Moon className="w-5 h-5" />
                  </motion.button>
                  <span className="text-xs text-white font-medium">다크 모드</span>
                  
                  <AnimatePresence>
                    {showThemeWarning && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-red-500/90 text-white text-[11px] px-2.5 py-1 rounded-md shadow-lg pointer-events-none"
                      >
                        해당 테마에서는 지원되지 않는 기능입니다
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Wheel Volume Toggle */}
                <div className="flex flex-col items-center gap-2">
                  <button
                    onClick={() => setIsOverlayEnabled(prev => !prev)}
                    className={cn(
                      "settings-btn w-full h-12 rounded-lg flex items-center justify-center transition-colors",
                      isOverlayEnabled ? "bg-[#4cc2ff] text-black" : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
                    )}
                  >
                    <Mouse className="w-5 h-5" />
                  </button>
                  <span className="text-xs text-white font-medium">휠 볼륨</span>
                </div>

                {/* Radio Mode Toggle */}
                <div className="flex flex-col items-center gap-2">
                  <motion.button
                    animate={isRadioShaking ? { x: [-5, 5, -5, 5, 0] } : {}}
                    transition={{ duration: 0.3 }}
                    onClick={() => {
                      if (queue.length === 0) {
                        setIsRadioShaking(true);
                        setTimeout(() => setIsRadioShaking(false), 300);
                        return;
                      }
                      setIsRadioMode(prev => !prev);
                      setIsSettingsOpen(false);
                    }}
                    className={cn(
                      "settings-btn w-full h-12 rounded-lg flex items-center justify-center transition-colors",
                      isRadioMode ? "bg-[#4cc2ff] text-black" : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
                    )}
                  >
                    <Radio className="w-5 h-5" />
                  </motion.button>
                  <span className="text-xs text-white font-medium">라디오 모드</span>
                </div>

              </div>

              {/* Theme Selector */}
              <div className="mt-2 border-t border-white/10 pt-2">
                <div className="mb-4 text-xs text-white text-center font-medium">테마 선택</div>
                <div className="grid grid-cols-3 gap-x-3">
                  <button 
                    onClick={() => setUiMode('retro')}
                    className={cn(
                      "settings-btn w-full h-12 rounded-lg flex items-center justify-center transition-colors text-sm font-bold",
                      uiMode === 'retro' ? "bg-[#4cc2ff] text-black" : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
                    )}
                  >
                    1
                  </button>
                  <button 
                    onClick={() => setUiMode('wood')}
                    className={cn(
                      "settings-btn w-full h-12 rounded-lg flex items-center justify-center transition-colors text-sm font-bold",
                      uiMode === 'wood' ? "bg-[#4cc2ff] text-black" : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
                    )}
                  >
                    2
                  </button>
                  <button 
                    onClick={() => setUiMode('acrobatic')}
                    className={cn(
                      "settings-btn w-full h-12 rounded-lg flex items-center justify-center transition-colors text-sm font-bold",
                      uiMode === 'acrobatic' ? "bg-[#4cc2ff] text-black" : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
                    )}
                  >
                    3
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Settings Toggle Button */}
      {!isRadioMode && (
        <>
          <button
            onClick={() => setIsSettingsOpen(prev => !prev)}
            className="settings-toggle-btn fixed bottom-4 right-4 2xl:bottom-8 2xl:right-8 p-2 2xl:p-3 bg-brutal-white border-2 2xl:border-4 border-brutal-black hover:bg-brutal-gray transition-colors z-50 rounded-full shadow-[4px_4px_0_0_var(--color-brutal-black)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
            title="Settings"
          >
          <Settings className="w-5 h-5 2xl:w-6 2xl:h-6 text-brutal-black" />
        </button>
        </>
      )}

      {/* Full-Screen Radio Mode Overlay */}
      {isRadioMode && currentVideo && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center bg-white overflow-hidden font-sans">
          {/* Blurred Background */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-40 blur-[60px] scale-110"
            style={{ backgroundImage: `url(${currentVideo.thumbnail})` }}
          />
          {/* Gradient Overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/80" />

          {/* Main Content */}
          <div className="relative z-10 w-full max-w-[360px] md:max-w-[420px] lg:max-w-[460px] h-full flex flex-col px-6 py-6 md:py-8 lg:py-10 justify-center">
            {/* Top Bar */}
            <div className="flex justify-center items-center w-full text-white/90 mb-6 md:mb-8 lg:mb-10">
              <button onClick={() => setIsRadioMode(false)} className="radio-btn p-2 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-8 h-8" />
              </button>
            </div>

            {/* Thumbnail */}
            <div className="w-full aspect-square rounded-2xl md:rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] mb-6 md:mb-8 lg:mb-10 bg-black/20">
              <img 
                key={currentVideo.videoId}
                src={`https://i.ytimg.com/vi/${currentVideo.videoId}/maxresdefault.jpg`} 
                alt={currentVideo.title} 
                className="w-full h-full object-cover" 
                onLoad={(e) => {
                  if (e.currentTarget.naturalWidth === 120 && e.currentTarget.src.includes('maxresdefault')) {
                    e.currentTarget.src = currentVideo.thumbnail;
                  }
                }}
                onError={(e) => {
                  if (e.currentTarget.src !== currentVideo.thumbnail) {
                    e.currentTarget.src = currentVideo.thumbnail;
                  }
                }}
              />
            </div>

            {/* Info */}
            <div className="flex flex-col items-center text-center mb-6 md:mb-8 w-full">
              <div className="w-full overflow-hidden relative mb-1 md:mb-2 py-1">
                <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-white animate-marquee leading-normal">
                  {currentVideo.title}
                </h2>
              </div>
              <p className="text-xs md:text-sm lg:text-base text-white/60 font-medium line-clamp-1 px-2">{currentVideo.channelTitle}</p>
            </div>

            {/* Progress */}
            <div className="w-full flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
              <span className="text-xs md:text-sm text-white/60 font-medium w-10 text-right shrink-0">{formatTime(currentTime)}</span>
              <div className="relative flex-1 h-1.5 md:h-2 bg-white/20 rounded-full flex items-center group cursor-pointer">
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
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                {/* Filled track */}
                <div 
                  className="absolute h-full bg-white rounded-full pointer-events-none" 
                  style={{ width: `${(currentTime / (duration || 100)) * 100}%` }} 
                />
                {/* Thumb */}
                <div 
                  className="absolute w-3 h-3 md:w-4 md:h-4 bg-white rounded-full shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" 
                  style={{ left: `calc(${(currentTime / (duration || 100)) * 100}% - 6px)` }} 
                />
              </div>
              <span className="text-xs md:text-sm text-white/60 font-medium w-10 shrink-0">{formatTime(duration)}</span>
            </div>

            {/* Controls */}
            <div className="w-full flex justify-center items-center px-2 md:px-6 mb-6 md:mb-10">
              <div className="flex items-center gap-6 md:gap-8 lg:gap-10">
                <button onClick={playPrevious} className="radio-btn text-white transition-colors active:scale-95">
                  <SkipBack className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 fill-current" />
                </button>
                <button 
                  onClick={() => {
                    if (isPlaying) playerRef.current?.pauseVideo();
                    else playerRef.current?.playVideo();
                  }} 
                  className="radio-btn text-white transition-transform active:scale-95"
                >
                  {isPlaying ? <Pause className="w-10 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 fill-current" /> : <Play className="w-10 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 fill-current ml-1" />}
                </button>
                <button onClick={playNext} className="radio-btn text-white transition-colors active:scale-95">
                  <SkipForward className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 fill-current" />
                </button>
              </div>
            </div>

            {/* Bottom Lyrics/Wave */}
            <div className="mt-auto flex flex-col items-center gap-4 pb-6">
            </div>

          </div>
        </div>
      )}
    </div>
  );
}