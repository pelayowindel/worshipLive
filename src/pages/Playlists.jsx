import React, { useState, useEffect } from 'react';
import { getDatabase, generateId, getCurrentTimestamp } from "@/components/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Calendar, ListMusic, Trash2, Play, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { toast } from "sonner";

export default function Playlists() {
  const [createOpen, setCreateOpen] = useState(false);
  const [newPlaylist, setNewPlaylist] = useState({ name: '', date: '' });
  const [playlists, setPlaylists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [db, setDb] = useState(null);

  useEffect(() => {
    let subscription;
    
    const initDb = async () => {
      const database = await getDatabase();
      setDb(database);
      
      // Subscribe to playlist changes
      subscription = database.playlists.find({
        sort: [{ date: 'desc' }]
      }).$.subscribe(docs => {
        setPlaylists(docs.map(doc => doc.toJSON()));
        setIsLoading(false);
      });
    };
    
    initDb();
    
    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await db.playlists.insert({
        id: generateId(),
        ...newPlaylist,
        song_ids: [],
        created_date: getCurrentTimestamp(),
        updated_date: getCurrentTimestamp()
      });
      setCreateOpen(false);
      setNewPlaylist({ name: '', date: '' });
      toast.success('Playlist created');
    } catch (error) {
      toast.error('Failed to create playlist');
    }
  };

  const handleDelete = async (playlist) => {
    if (confirm(`Delete "${playlist.name}"?`)) {
      try {
        await db.playlists.findOne(playlist.id).remove();
        toast.success('Playlist deleted');
      } catch (error) {
        toast.error('Failed to delete playlist');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Service Playlists</h1>
            <p className="text-slate-400 mt-1">Organize songs for your worship services</p>
          </div>
          
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="w-4 h-4 mr-2" /> New Playlist
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-700 text-white">
              <DialogHeader>
                <DialogTitle>Create New Playlist</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label>Playlist Name</Label>
                  <Input
                    value={newPlaylist.name}
                    onChange={(e) => setNewPlaylist({ ...newPlaylist, name: e.target.value })}
                    placeholder="Sunday Morning Service"
                    className="bg-slate-800 border-slate-700 text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Service Date</Label>
                  <Input
                    type="date"
                    value={newPlaylist.date}
                    onChange={(e) => setNewPlaylist({ ...newPlaylist, date: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} className="border-slate-700 text-slate-300">
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                    Create
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : playlists.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
              <ListMusic className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-300">No playlists yet</h3>
            <p className="text-slate-500 mt-1 mb-4">Create your first service playlist</p>
            <Button 
              onClick={() => setCreateOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4 mr-2" /> Create Playlist
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {playlists.map(playlist => (
              <Card 
                key={playlist.id} 
                className="group bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-all p-5"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white truncate">{playlist.name}</h3>
                    {playlist.date && (
                      <div className="flex items-center gap-1.5 mt-1 text-slate-400 text-sm">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(playlist.date), 'EEEE, MMM d, yyyy')}
                      </div>
                    )}
                    <p className="text-slate-500 text-sm mt-2">
                      {playlist.song_ids?.length || 0} songs
                    </p>
                  </div>
                  
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(playlist)}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Link 
                    to={createPageUrl(`PlaylistEditor?id=${playlist.id}`)} 
                    className="flex-1"
                  >
                    <Button variant="outline" className="w-full border-slate-700 text-slate-300 hover:bg-slate-700">
                      Edit Songs
                    </Button>
                  </Link>
                  <Link to={createPageUrl(`Present?playlist=${playlist.id}`)}>
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Play className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}