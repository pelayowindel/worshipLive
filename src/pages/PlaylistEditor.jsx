import React, { useState, useEffect } from 'react';
import { getDatabase, getCurrentTimestamp } from "@/components/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Plus, Search, GripVertical, X, Play, Save, Music, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import SongCard from "@/components/presentation/SongCard";
import { toast } from "sonner";

export default function PlaylistEditor() {
  const urlParams = new URLSearchParams(window.location.search);
  const playlistId = urlParams.get('id');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [currentPlaylist, setCurrentPlaylist] = useState(null);
  const [allSongs, setAllSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [db, setDb] = useState(null);

  useEffect(() => {
    let playlistSub, songsSub;
    
    const initDb = async () => {
      const database = await getDatabase();
      setDb(database);
      
      // Subscribe to playlist
      playlistSub = database.playlists.findOne(playlistId).$.subscribe(doc => {
        if (doc) {
          setCurrentPlaylist(doc.toJSON());
        } else {
          setCurrentPlaylist(null);
        }
        setIsLoading(false);
      });
      
      // Subscribe to all songs
      songsSub = database.songs.find({
        sort: [{ created_date: 'desc' }]
      }).$.subscribe(docs => {
        setAllSongs(docs.map(d => d.toJSON()));
      });
    };
    
    initDb();
    
    return () => {
      if (playlistSub) playlistSub.unsubscribe();
      if (songsSub) songsSub.unsubscribe();
    };
  }, [playlistId]);

  useEffect(() => {
    if (currentPlaylist?.song_ids && allSongs.length > 0) {
      const orderedSongs = currentPlaylist.song_ids
        .map(id => allSongs.find(s => s.id === id))
        .filter(Boolean);
      setSelectedSongs(orderedSongs);
    }
  }, [currentPlaylist, allSongs]);

  const addSong = (song) => {
    if (!selectedSongs.find(s => s.id === song.id)) {
      setSelectedSongs([...selectedSongs, song]);
    }
  };

  const removeSong = (songId) => {
    setSelectedSongs(selectedSongs.filter(s => s.id !== songId));
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(selectedSongs);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    setSelectedSongs(items);
  };

  const handleSave = async () => {
    if (!db) return;
    try {
      const doc = await db.playlists.findOne(playlistId).exec();
      if (doc) {
        await doc.update({
          $set: {
            song_ids: selectedSongs.map(s => s.id),
            updated_date: getCurrentTimestamp()
          }
        });
        toast.success('Playlist saved');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save playlist');
    }
  };

  const availableSongs = allSongs.filter(song => 
    !selectedSongs.find(s => s.id === song.id) &&
    (song.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     song.author?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!currentPlaylist) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-xl">Playlist not found</p>
          <Link to={createPageUrl('Playlists')}>
            <Button className="mt-4">Go to Playlists</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('Playlists')}>
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">{currentPlaylist.name}</h1>
              <p className="text-slate-400 text-sm">{selectedSongs.length} songs in playlist</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700">
              <Save className="w-4 h-4 mr-2" /> Save
            </Button>
            <Link to={createPageUrl(`Present?playlist=${playlistId}`)}>
              <Button className="bg-green-600 hover:bg-green-700">
                <Play className="w-4 h-4 mr-2" /> Present
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Playlist Songs */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-sm">
                {selectedSongs.length}
              </span>
              Playlist Order
            </h2>
            
            {selectedSongs.length === 0 ? (
              <Card className="bg-slate-800/30 border-slate-700 border-dashed p-8 text-center">
                <Music className="w-10 h-10 mx-auto mb-3 text-slate-600" />
                <p className="text-slate-500">Add songs from the library</p>
              </Card>
            ) : (
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="playlist">
                  {(provided) => (
                    <div 
                      {...provided.droppableProps} 
                      ref={provided.innerRef}
                      className="space-y-2"
                    >
                      {selectedSongs.map((song, index) => (
                        <Draggable key={song.id} draggableId={song.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className="group"
                            >
                              <Card className={`p-3 bg-slate-800/50 border-slate-700 flex items-center gap-3 ${
                                snapshot.isDragging ? 'ring-2 ring-indigo-500' : ''
                              }`}>
                                <div {...provided.dragHandleProps} className="cursor-grab text-slate-600 hover:text-slate-400">
                                  <GripVertical className="w-5 h-5" />
                                </div>
                                <span className="w-6 h-6 rounded bg-slate-700 text-slate-400 flex items-center justify-center text-sm shrink-0">
                                  {index + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-white truncate">{song.title}</p>
                                  <p className="text-xs text-slate-500">{song.stanzas?.length || 0} stanzas</p>
                                </div>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => removeSong(song.id)}
                                  className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-400 hover:bg-red-500/10 h-8 w-8"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </Card>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </div>

          {/* Song Library */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Song Library</h2>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                placeholder="Search songs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-slate-900 border-slate-800 text-white"
              />
            </div>
            
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
              {availableSongs.length === 0 ? (
                <p className="text-center text-slate-500 py-8">
                  {allSongs.length === 0 ? 'No songs in library' : 'No matching songs'}
                </p>
              ) : (
                availableSongs.map(song => (
                  <Card 
                    key={song.id}
                    onClick={() => addSong(song)}
                    className="p-3 bg-slate-800/30 border-slate-700 hover:border-indigo-500/50 hover:bg-slate-800/50 cursor-pointer transition-all flex items-center gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">{song.title}</p>
                      <p className="text-xs text-slate-500">{song.author}</p>
                    </div>
                    <Plus className="w-5 h-5 text-slate-500" />
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}