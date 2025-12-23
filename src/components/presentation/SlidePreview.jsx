import React from 'react';
import { cn } from "@/lib/utils";

const SlidePreview = React.forwardRef(({ 
  stanza, 
  background, 
  isActive = false, 
  onClick,
  size = 'md',
  showLabel = true
}, ref) => {
  const sizeClasses = {
    sm: 'w-24 h-14',
    md: 'w-40 h-24',
    lg: 'w-56 h-32'
  };

  const fontSizes = {
    sm: 'text-[6px]',
    md: 'text-[8px]',
    lg: 'text-xs'
  };

  return (
    <button
      ref={ref}
      onClick={onClick}
      className={cn(
        "relative rounded-lg overflow-hidden transition-all flex-shrink-0",
        sizeClasses[size],
        isActive 
          ? "ring-2 ring-indigo-500 shadow-lg shadow-indigo-500/30" 
          : "ring-1 ring-slate-700 hover:ring-slate-600"
      )}
    >
      {/* Background */}
      <div 
        className="absolute inset-0 bg-slate-900"
        style={background ? {
          backgroundImage: `url(${background})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : {}}
      />
      
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-black/40" />
      
      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center p-2">
        {stanza ? (
          <>
            {showLabel && stanza.label && stanza.label.trim() && (
              <span className={cn(
                "text-indigo-300 font-medium mb-0.5 uppercase tracking-wider",
                fontSizes[size]
              )}>
                {stanza.label}
              </span>
            )}
            <p className={cn(
              "text-white text-center line-clamp-3 leading-tight",
              fontSizes[size]
            )}>
              {stanza.lines?.split('\n').slice(0, 3).join(' ')}
            </p>
          </>
        ) : (
          <span className="text-slate-500 text-xs">Empty</span>
        )}
      </div>
      
      {/* Active indicator */}
      {isActive && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500" />
      )}
    </button>
  );
});

SlidePreview.displayName = 'SlidePreview';

export default SlidePreview;