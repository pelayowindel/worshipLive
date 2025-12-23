import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Music, Edit, Trash2, GripVertical, Play } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SongCard({ 
  song, 
  onEdit, 
  onDelete, 
  onPlay,
  dragHandleProps,
  isDragging,
  compact = false,
  showActions = true
}) {
  const stanzaCount = song.stanzas?.length || 0;
  
  return (
    <Card className={cn(
      "group transition-all duration-200",
      "bg-slate-800/50 border-slate-700 hover:border-slate-600",
      isDragging && "ring-2 ring-indigo-500 shadow-xl",
      compact ? "p-3" : "p-4"
    )}>
      <div className="flex items-center gap-3">
        {dragHandleProps && (
          <div {...dragHandleProps} className="cursor-grab text-slate-600 hover:text-slate-400">
            <GripVertical className="w-5 h-5" />
          </div>
        )}
        
        <div 
          className={cn(
            "flex items-center justify-center rounded-lg bg-indigo-500/20",
            compact ? "w-10 h-10" : "w-12 h-12"
          )}
          style={song.default_background ? {
            backgroundImage: `url(${song.default_background})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          } : {}}
        >
          {!song.default_background && (
            <Music className={cn("text-indigo-400", compact ? "w-5 h-5" : "w-6 h-6")} />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className={cn("font-semibold text-white truncate", compact ? "text-sm" : "text-base")}>
            {song.title}
          </h3>
          <div className="flex items-center gap-2 mt-0.5">
            {song.author && (
              <span className="text-xs text-slate-400 truncate">{song.author}</span>
            )}
            <span className="text-xs text-slate-600">•</span>
            <span className="text-xs text-slate-500">{stanzaCount} stanza{stanzaCount !== 1 ? 's' : ''}</span>
          </div>
        </div>
        
        {showActions && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onPlay && (
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => { e.stopPropagation(); onPlay(song); }}
                className="h-8 w-8 text-slate-400 hover:text-green-400 hover:bg-green-500/10"
              >
                <Play className="w-4 h-4" />
              </Button>
            )}
            {onEdit && (
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => { e.stopPropagation(); onEdit(song); }}
                className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-700"
              >
                <Edit className="w-4 h-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => { e.stopPropagation(); onDelete(song); }}
                className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}