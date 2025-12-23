import React, { useState, useEffect } from 'react';
import { getDatabase, generateId, getCurrentTimestamp } from "@/components/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Music, Loader2 } from "lucide-react";
import SongCard from "@/components/presentation/SongCard";
import SongEditor from "@/components/presentation/SongEditor";
import { toast } from "sonner";

export default function Songs() {
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingSong, setEditingSong] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [songs, setSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [db, setDb] = useState(null);

  useEffect(() => {
    let subscription;
    
    const initDb = async () => {
      const database = await getDatabase();
      setDb(database);
      
      // Subscribe to song changes
      subscription = database.songs.find({
        sort: [{ created_date: 'desc' }]
      }).$.subscribe(docs => {
        setSongs(docs.map(doc => doc.toJSON()));
        setIsLoading(false);
      });
    };
    
    initDb();
    
    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const handleSave = async (data) => {
    try {
      if (editingSong) {
        await db.songs.findOne(editingSong.id).update({
          $set: {
            ...data,
            updated_date: getCurrentTimestamp()
          }
        });
        toast.success('Song updated successfully');
      } else {
        await db.songs.insert({
          id: generateId(),
          ...data,
          created_date: getCurrentTimestamp(),
          updated_date: getCurrentTimestamp()
        });
        toast.success('Song created successfully');
      }
      setEditorOpen(false);
      setEditingSong(null);
    } catch (error) {
      toast.error('Failed to save song');
    }
  };

  const handleEdit = (song) => {
    setEditingSong(song);
    setEditorOpen(true);
  };

  const handleDelete = async (song) => {
    if (confirm(`Delete "${song.title}"?`)) {
      try {
        await db.songs.findOne(song.id).remove();
        toast.success('Song deleted');
      } catch (error) {
        toast.error('Failed to delete song');
      }
    }
  };

  const filteredSongs = songs.filter(song => 
    song.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.author?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group songs by category
  const songsByCategory = filteredSongs.reduce((acc, song) => {
    const cat = song.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(song);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Song Library</h1>
            <p className="text-slate-400 mt-1">Manage your worship songs and lyrics</p>
          </div>
          
          <Button 
            onClick={() => { setEditingSong(null); setEditorOpen(true); }}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Song
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <Input
            placeholder="Search songs by title or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-900 border-slate-800 text-white placeholder:text-slate-500"
          />
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : songs.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
              <Music className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-300">No songs yet</h3>
            <p className="text-slate-500 mt-1 mb-4">Start building your song library</p>
            <Button 
              onClick={() => { setEditingSong(null); setEditorOpen(true); }}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Your First Song
            </Button>
          </div>
        ) : filteredSongs.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            No songs match your search
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(songsByCategory).map(([category, categorySongs]) => (
              <div key={category}>
                <h2 className="text-lg font-semibold text-slate-300 mb-3 capitalize">
                  {category.replace(/_/g, ' ')}
                  <span className="text-sm font-normal text-slate-500 ml-2">
                    ({categorySongs.length})
                  </span>
                </h2>
                <div className="grid gap-3">
                  {categorySongs.map(song => (
                    <SongCard
                      key={song.id}
                      song={song}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Song Editor Dialog */}
      <SongEditor
        song={editingSong}
        open={editorOpen}
        onOpenChange={setEditorOpen}
        onSave={handleSave}
      />
    </div>
  );
}