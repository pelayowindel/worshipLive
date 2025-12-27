import React, { useState, useEffect } from 'react';
import PresentationDisplay from "@/components/presentation/PresentationDisplay";

export default function MirrorDisplay() {
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('session');

  const [state, setState] = useState({
    stanza: null,
    background: '',
    songTitle: '',
    isBlank: false,
    clearText: false,
    showTitleSlide: false
  });

  useEffect(() => {
    if (!sessionId) return;

    const channel = new BroadcastChannel(`presentation-${sessionId}`);
    
    channel.onmessage = (event) => {
      if (event.data?.type === 'PRESENTATION_UPDATE') {
        setState(event.data.state);
      }
    };
    
    // Request fullscreen on any user interaction
    const handleFullscreenRequest = () => {
      const docEl = document.documentElement;
      if (docEl.requestFullscreen) {
        docEl.requestFullscreen().catch(err => console.log('Fullscreen failed:', err));
      } else if (docEl.webkitRequestFullscreen) {
        docEl.webkitRequestFullscreen();
      } else if (docEl.msRequestFullscreen) {
        docEl.msRequestFullscreen();
      }
    };

    // Listen for any click or key to trigger fullscreen
    window.addEventListener('click', handleFullscreenRequest);
    window.addEventListener('keydown', handleFullscreenRequest);

    return () => {
      window.removeEventListener('click', handleFullscreenRequest);
      window.removeEventListener('keydown', handleFullscreenRequest);
      channel.close();
    };
  }, [sessionId]);

  return (
    <div className="w-screen h-screen bg-black">
      <PresentationDisplay
        stanza={state.stanza}
        background={state.background}
        songTitle={state.songTitle}
        isBlank={state.isBlank}
        clearText={state.clearText}
        showTitleSlide={state.showTitleSlide}
      />
      
      {/* Instructions overlay - shows when no content */}
      {!state.songTitle && !state.isBlank && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center text-white/50">
            <p className="text-xl">Mirror Display Ready</p>
            <p className="text-sm mt-2">Click anywhere or press F11 to go fullscreen</p>
            <p className="text-sm">Waiting for presentation...</p>
          </div>
        </div>
      )}
    </div>
  );
}