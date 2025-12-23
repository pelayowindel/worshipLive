import React from 'react';
import { motion, AnimatePresence } from "framer-motion";

export default function PresentationDisplay({ 
  stanza, 
  background, 
  songTitle,
  isBlank = false,
  clearText = false,
  showTitleSlide = false,
  className = ""
}) {
  return (
    <div className={`relative w-full h-full overflow-hidden bg-black ${className}`}>
      {/* Background Layer */}
      <AnimatePresence mode="wait">
        {background && !isBlank && (
          <motion.div
            key={background}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            {background.includes('.mp4') || background.includes('.webm') ? (
              <video
                src={background}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={background}
                alt=""
                className="w-full h-full object-cover"
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Gradient Overlay */}
      {!isBlank && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/50" />
      )}
      
      {/* Content Layer */}
      <AnimatePresence mode="wait">
        {!isBlank && !clearText && showTitleSlide && (
          <motion.div
            key="title-slide"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.6 }}
            className="absolute top-0 left-0 right-0 bottom-0 flex flex-col items-center justify-center p-6 sm:p-10 md:p-16 lg:p-20"
          >
            <div 
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white text-center"
              style={{
                textShadow: '0 4px 40px rgba(0,0,0,0.9), 0 2px 20px rgba(0,0,0,0.6)'
              }}
            >
              {songTitle}
            </div>
          </motion.div>
        )}
        
        {!isBlank && !clearText && !showTitleSlide && stanza && (
          <motion.div
            key={stanza.label + stanza.lines}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute top-0 left-0 right-0 bottom-0 flex flex-col items-center justify-center p-6 sm:p-10 md:p-16 lg:p-20"
          >
            {/* Stanza Label (only if exists) */}
            {/* {stanza.label && stanza.label.trim() && (
              <motion.span
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-indigo-300 text-base sm:text-lg md:text-xl font-medium uppercase tracking-[0.3em] mb-3 md:mb-4"
              >
                {stanza.label}
              </motion.span>
            )} */}
            
            {/* Lyrics */}
            <div className="text-center w-full max-w-6xl overflow-hidden">
              {stanza.lines?.split('\n').map((line, index) => (
                <motion.p
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  className="text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-1 sm:mb-2 drop-shadow-2xl break-words"
                  style={{ 
                    textShadow: '0 4px 30px rgba(0,0,0,0.8), 0 2px 10px rgba(0,0,0,0.5)'
                  }}
                >
                  {line || '\u00A0'}
                </motion.p>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Song Title (bottom corner) */}
      {!isBlank && !showTitleSlide && songTitle && (
        <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 z-10">
          <p className="text-white/40 text-xs sm:text-sm md:text-base font-medium">{songTitle}</p>
        </div>
      )}
      
      {/* Blank Screen */}
      {isBlank && (
        <div className="absolute inset-0 bg-black" />
      )}
    </div>
  );
}