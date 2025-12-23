import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getDatabase } from "@/components/database";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  ArrowLeft, ArrowRight, MonitorOff, Monitor, Maximize, 
  ChevronLeft, ChevronRight, Home, Image, ExternalLink, Tv, ScrollText, EyeOff
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import PresentationDisplay from "@/components/presentation/PresentationDisplay";
import SlidePreview from "@/components/presentation/SlidePreview";
import BackgroundPicker from "@/components/presentation/BackgroundPicker";

export default function Present() {
  const urlParams = new URLSearchParams(window.location.search);
  const playlistId = urlParams.get('playlist');
  const songId = urlParams.get('song');
  
  // Generate consistent session ID based on playlist/song
  const sessionId = playlistId || songId || 'quick-present';
  
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [currentStanzaIndex, setCurrentStanzaIndex] = useState(-1); // -1 = title slide
  const [isBlank, setIsBlank] = useState(false);
  const [clearText, setClearText] = useState(true);
  const [liveBackground, setLiveBackground] = useState('');
  const [songs, setSongs] = useState([]);
  const [currentPlaylist, setCurrentPlaylist] = useState(null);
  const [allSongs, setAllSongs] = useState([]);
  const [broadcastChannel, setBroadcastChannel] = useState(null);
  const slideRefs = useRef({});
  const slideStripRef = useRef(null);

  // Initialize BroadcastChannel
  useEffect(() => {
    const channel = new BroadcastChannel(`presentation-${sessionId}`);
    setBroadcastChannel(channel);
    
    return () => {
      channel.close();
    };
  }, [sessionId]);

  useEffect(() => {
    let playlistSub, songsSub;
    
    const initDb = async () => {
      const db = await getDatabase();
      
      // Subscribe to all songs
      songsSub = db.songs.find().$.subscribe(docs => {
        const songsData = docs.map(d => d.toJSON());
        setAllSongs(songsData);
        
        // If single song mode
        if (songId) {
          setSongs(songsData.filter(s => s.id === songId));
        }
      });
      
      // Subscribe to playlist if in playlist mode
      if (playlistId) {
        playlistSub = db.playlists.findOne(playlistId).$.subscribe(doc => {
          if (doc) {
            const playlist = doc.toJSON();
            setCurrentPlaylist(playlist);
          }
        });
      }
    };
    
    initDb();
    
    return () => {
      if (playlistSub) playlistSub.unsubscribe();
      if (songsSub) songsSub.unsubscribe();
    };
  }, [playlistId, songId]);

  useEffect(() => {
    if (currentPlaylist?.song_ids && allSongs.length > 0) {
      const orderedSongs = currentPlaylist.song_ids
        .map(id => allSongs.find(s => s.id === id))
        .filter(Boolean);
      setSongs(orderedSongs);
    }
  }, [currentPlaylist, allSongs]);

  const currentSong = songs[currentSongIndex];
  const currentStanza = currentSong?.stanzas?.[currentStanzaIndex];
  const background = liveBackground || currentSong?.default_background;

  // Broadcast to connected windows via BroadcastChannel
  useEffect(() => {
    if (!broadcastChannel || !currentSong) return;
    
    const state = {
      stanza: currentStanza,
      background,
      songTitle: currentSong?.title,
      song: currentSong,
      stanzaIndex: currentStanzaIndex,
      isBlank,
      clearText,
      showTitleSlide: currentStanzaIndex === -1
    };
    
    broadcastChannel.postMessage({ type: 'PRESENTATION_UPDATE', state });
  }, [currentStanza, background, currentSong, currentStanzaIndex, isBlank, clearText, broadcastChannel]);

  // Auto-scroll the slide strip to the active slide
  useEffect(() => {
    if (currentStanzaIndex >= 0 && slideRefs.current[currentStanzaIndex]) {
      slideRefs.current[currentStanzaIndex].scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest'
      });
    }
  }, [currentStanzaIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        goPrevious();
      } else if (e.key === 'b' || e.key === 'B') {
        setIsBlank(prev => !prev);
      } else if (e.key === 'Escape') {
        setIsBlank(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSongIndex, currentStanzaIndex, songs]);

  const goNext = () => {
    if (!currentSong) return;
    const stanzas = currentSong.stanzas || [];
    
    if (currentStanzaIndex < stanzas.length - 1) {
      setCurrentStanzaIndex(currentStanzaIndex + 1);
      setClearText(false);
    } else if (currentSongIndex < songs.length - 1) {
      setCurrentSongIndex(currentSongIndex + 1);
      setCurrentStanzaIndex(-1); // Show title slide
      setClearText(false);
    }
  };

  const goPrevious = () => {
    if (currentStanzaIndex > -1) {
      setCurrentStanzaIndex(currentStanzaIndex - 1);
      setClearText(false);
    } else if (currentSongIndex > 0) {
      setCurrentSongIndex(currentSongIndex - 1);
      const prevSong = songs[currentSongIndex - 1];
      setCurrentStanzaIndex((prevSong?.stanzas?.length || 1) - 1);
      setClearText(false);
    }
  };

  const goToStanza = (songIdx, stanzaIdx) => {
    setCurrentSongIndex(songIdx);
    setCurrentStanzaIndex(stanzaIdx);
    setIsBlank(false);
    setClearText(false);
  };

  const openMirrorWindow = () => {
    window.open(
      createPageUrl(`MirrorDisplay?session=${sessionId}`),
      '_blank',
      'width=1280,height=720,menubar=no,toolbar=no,location=no,status=no'
    );
  };

  const openTeleprompter = () => {
    window.open(
      createPageUrl(`Teleprompter?session=${sessionId}`),
      '_blank',
      'width=800,height=900,menubar=no,toolbar=no,location=no,status=no'
    );
  };

  const openFullscreenOnScreen = async () => {
    try {
      // Try to get all screens
      if ('getScreenDetails' in window) {
        const screenDetails = await window.getScreenDetails();
        const screens = screenDetails.screens;
        
        if (screens.length > 1) {
          // Show screen picker
          const screenIndex = prompt(
            `Select screen (1-${screens.length}):\n${screens.map((s, i) => 
              `${i + 1}. ${s.label || `Screen ${i + 1}`} (${s.width}x${s.height})${s.isPrimary ? ' [Primary]' : ''}`
            ).join('\n')}`
          );
          
          if (screenIndex) {
            const index = parseInt(screenIndex) - 1;
            const targetScreen = screens[index];
            
            if (targetScreen) {
              // Open fullscreen window on selected screen
              const newWindow = window.open(
                createPageUrl(`MirrorDisplay?session=${sessionId}`),
                '_blank',
                `left=${targetScreen.availLeft},top=${targetScreen.availTop},width=${targetScreen.availWidth},height=${targetScreen.availHeight}`
              );
              
              if (newWindow) {
                // Request fullscreen after a short delay
                setTimeout(() => {
                  if (newWindow.document.documentElement.requestFullscreen) {
                    newWindow.document.documentElement.requestFullscreen();
                  }
                }, 500);
              }
              return;
            }
          }
        }
      }
      
      // Fallback to simple fullscreen
      const elem = document.getElementById('main-display');
      if (elem?.requestFullscreen) {
        elem.requestFullscreen();
      }
    } catch (error) {
      // Fallback to simple fullscreen
      const elem = document.getElementById('main-display');
      if (elem?.requestFullscreen) {
        elem.requestFullscreen();
      }
    }
  };

  if (songs.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-xl mb-4">No songs to present</p>
          <Link to={createPageUrl('Playlists')}>
            <Button>Go to Playlists</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-950 flex flex-col overflow-hidden">
      {/* Main Display Area */}
      <div className="flex-1 flex">
        {/* Left Panel - Song List */}
        <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
          <div className="p-3 border-b border-slate-800 flex items-center gap-2">
            <Link to={createPageUrl('Playlists')}>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white">
                <Home className="w-4 h-4" />
              </Button>
            </Link>
            <span className="text-sm font-medium text-white truncate flex-1">
              {currentPlaylist?.name || 'Quick Present'}
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            {songs.map((song, songIdx) => (
              <div key={song.id} className="mb-3">
                <div 
                  className={`text-sm font-medium px-2 py-1 rounded cursor-pointer transition-colors ${
                    songIdx === currentSongIndex 
                      ? 'text-indigo-400 bg-indigo-500/10' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                  onClick={() => goToStanza(songIdx, -1)}
                >
                  {song.title}
                </div>
                <div className="mt-1 space-y-0.5">
                  <button
                    onClick={() => goToStanza(songIdx, -1)}
                    className={`w-full text-left text-xs px-3 py-1 rounded transition-colors ${
                      songIdx === currentSongIndex && currentStanzaIndex === -1
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    Title
                  </button>
                  {song.stanzas?.map((stanza, stanzaIdx) => (
                    <button
                      key={stanzaIdx}
                      onClick={() => goToStanza(songIdx, stanzaIdx)}
                      className={`w-full text-left text-xs px-3 py-1 rounded transition-colors ${
                        songIdx === currentSongIndex && stanzaIdx === currentStanzaIndex
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {stanza.label && stanza.label.trim() ? stanza.label : `Slide ${stanzaIdx + 1}`}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Preview */}
        <div className="flex-1 flex flex-col min-w-0">
          <div 
            id="main-display"
            className="flex-1 relative overflow-hidden"
          >
            <PresentationDisplay
              stanza={currentStanza}
              background={background}
              songTitle={currentSong?.title}
              isBlank={isBlank}
              clearText={clearText}
              showTitleSlide={currentStanzaIndex === -1}
            />
          </div>

          {/* Slide Strip */}
          <div className="h-32 bg-slate-900 border-t border-slate-800 p-3">
            <div ref={slideStripRef} className="flex gap-2 overflow-x-auto h-full scroll-smooth">
              {currentSong?.stanzas?.map((stanza, idx) => (
                <SlidePreview
                  key={idx}
                  ref={el => slideRefs.current[idx] = el}
                  stanza={stanza}
                  background={background}
                  isActive={idx === currentStanzaIndex}
                  onClick={() => setCurrentStanzaIndex(idx)}
                  size="md"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Controls */}
        <div className="w-16 bg-slate-900 border-l border-slate-800 flex flex-col items-center py-4 gap-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={goPrevious}
                  disabled={currentSongIndex === 0 && currentStanzaIndex === -1}
                  className="text-slate-400 hover:text-white"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">Previous (←)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={goNext}
                  className="text-slate-400 hover:text-white"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">Next (→ or Space)</TooltipContent>
            </Tooltip>

            <div className="w-8 h-px bg-slate-800" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant={isBlank ? "default" : "ghost"}
                  onClick={() => setIsBlank(!isBlank)}
                  className={isBlank ? "bg-red-600 hover:bg-red-700" : "text-slate-400 hover:text-white"}
                >
                  {isBlank ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">Blank Screen (B)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant={clearText ? "default" : "ghost"}
                  onClick={() => setClearText(!clearText)}
                  className={clearText ? "bg-orange-600 hover:bg-orange-700" : "text-slate-400 hover:text-white"}
                >
                  <EyeOff className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">Clear Text</TooltipContent>
            </Tooltip>

            <div className="w-8 h-px bg-slate-800" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={openFullscreenOnScreen}
                  className="text-slate-400 hover:text-white"
                >
                  <Tv className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">Fullscreen (Select Screen)</TooltipContent>
            </Tooltip>

            <div className="w-8 h-px bg-slate-800" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={openMirrorWindow}
                  className="text-slate-400 hover:text-white"
                >
                  <ExternalLink className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">Open Mirror Display</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={openTeleprompter}
                  className="text-slate-400 hover:text-white"
                >
                  <ScrollText className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">Open Teleprompter</TooltipContent>
            </Tooltip>

            <BackgroundPicker
              value={liveBackground}
              onChange={setLiveBackground}
              trigger={
                <Button size="icon" variant="ghost" className="text-slate-400 hover:text-white">
                  <Image className="w-5 h-5" />
                </Button>
              }
            />
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}