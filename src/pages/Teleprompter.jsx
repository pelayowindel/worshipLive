import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Teleprompter() {
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('session');

  const [currentSong, setCurrentSong] = useState(null);
  const [currentStanzaIndex, setCurrentStanzaIndex] = useState(0);
  const [isBlank, setIsBlank] = useState(false);
  const [showTitleSlide, setShowTitleSlide] = useState(false);

  useEffect(() => {
    if (!sessionId) return;

    const channel = new BroadcastChannel(`presentation-${sessionId}`);
    
    channel.onmessage = (event) => {
      if (event.data?.type === 'PRESENTATION_UPDATE') {
        const { state } = event.data;
        setCurrentSong(state.song);
        setCurrentStanzaIndex(state.stanzaIndex);
        setIsBlank(state.isBlank);
        setShowTitleSlide(state.showTitleSlide);
      }
    };

    return () => channel.close();
  }, [sessionId]);

  // Auto-scroll to current stanza
  useEffect(() => {
    if (showTitleSlide) {
      const titleElement = document.getElementById('song-title-slide');
      if (titleElement) {
        titleElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      const activeElement = document.getElementById(`stanza-${currentStanzaIndex}`);
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentStanzaIndex, showTitleSlide]);

  if (isBlank) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-slate-600 text-2xl">Screen Blanked</p>
      </div>
    );
  }

  if (!currentSong) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="text-center">
          <p className="text-xl mb-2">Teleprompter Ready</p>
          <p className="text-sm">Waiting for presentation to start...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8 overflow-y-auto">
      {/* Song Title */}
      <div className="mb-8 pb-4 border-b border-slate-800">
        <h1 className="text-3xl font-bold text-slate-200">{currentSong.title}</h1>
        {currentSong.author && (
          <p className="text-lg text-slate-500 mt-1">{currentSong.author}</p>
        )}
      </div>

      {/* Lyrics with highlighted current stanza */}
      <div className="mx-auto space-y-12 px-4">
        {/* Title Slide */}
        <motion.div
          id="song-title-slide"
          initial={false}
          animate={{
            scale: showTitleSlide ? 1.05 : 1,
            opacity: showTitleSlide ? 1 : 0.5,
          }}
          transition={{ duration: 0.3 }}
          className={`p-10 rounded-xl transition-all mx-auto ${
            showTitleSlide
              ? 'bg-indigo-600/20 border-3 border-indigo-500 shadow-2xl shadow-indigo-500/30 w-[85%]' 
              : 'bg-slate-900/30 border-2 border-transparent max-w-5xl'
          }`}
        >
          <div className={`font-bold mb-4 ${
            showTitleSlide ? 'text-indigo-300' : 'text-slate-500'
          }`}
          style={{ fontSize: 'clamp(1rem, 2vw, 1.5rem)' }}>
            Title
          </div>
          <div className={`leading-relaxed font-bold text-center ${
            showTitleSlide ? 'text-white' : 'text-slate-400'
          }`}
          style={{ fontSize: 'clamp(2rem, 6vw, 5rem)' }}>
            {currentSong.title}
          </div>
        </motion.div>

        {currentSong.stanzas?.map((stanza, index) => {
          const isActive = index === currentStanzaIndex;
          
          return (
            <motion.div
              id={`stanza-${index}`}
              key={index}
              initial={false}
              animate={{
                scale: isActive ? 1.05 : 1,
                opacity: isActive ? 1 : 0.5,
              }}
              transition={{ duration: 0.3 }}
              className={`p-10 rounded-xl transition-all mx-auto ${
                isActive 
                  ? 'bg-indigo-600/20 border-3 border-indigo-500 shadow-2xl shadow-indigo-500/30 w-[85%]' 
                  : 'bg-slate-900/30 border-2 border-transparent max-w-5xl'
              }`}
            >
              {/* Stanza Label */}
              {stanza.label && (
                <div className={`font-bold mb-4 ${
                  isActive ? 'text-indigo-300' : 'text-slate-500'
                }`}
                style={{ fontSize: 'clamp(1rem, 2vw, 1.5rem)' }}>
                  {stanza.label}
                </div>
              )}
              
              {/* Lyrics Lines */}
              <div className={`leading-relaxed whitespace-pre-wrap ${
                isActive ? 'text-white font-semibold' : 'text-slate-400'
              }`}
              style={{ fontSize: 'clamp(1.5rem, 4vw, 3.5rem)' }}>
                {stanza.lines}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Current Slide Indicator */}
      <div className="fixed bottom-4 right-4 bg-slate-800 rounded-lg px-4 py-2 shadow-lg border border-slate-700">
        <p className="text-sm text-slate-400">
          Slide <span className="text-white font-bold">{currentStanzaIndex + 1}</span> of{' '}
          <span className="text-white font-bold">{currentSong.stanzas?.length || 0}</span>
        </p>
      </div>
    </div>
  );
}