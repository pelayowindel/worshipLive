import React, { useState, useEffect } from 'react';
import { getDatabase } from "@/components/database";
import { Button } from "@/components/ui/button";
import { 
  Music, ListMusic, Play, Plus, ArrowRight, 
  Calendar, Sparkles, Monitor
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";

export default function Home() {
  const [songs, setSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    let songsSub, playlistsSub;
    
    const initDb = async () => {
      const db = await getDatabase();
      
      // Subscribe to recent songs
      songsSub = db.songs.find({
        sort: [{ created_date: 'desc' }],
        limit: 5
      }).$.subscribe(docs => {
        setSongs(docs.map(d => d.toJSON()));
      });
      
      // Subscribe to recent playlists
      playlistsSub = db.playlists.find({
        sort: [{ date: 'desc' }],
        limit: 5
      }).$.subscribe(docs => {
        setPlaylists(docs.map(d => d.toJSON()));
      });
    };
    
    initDb();
    
    return () => {
      if (songsSub) songsSub.unsubscribe();
      if (playlistsSub) playlistsSub.unsubscribe();
    };
  }, []);

  const upcomingPlaylists = playlists.filter(p => {
    if (!p.date) return false;
    return new Date(p.date) >= new Date(new Date().toDateString());
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        
        <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Worship{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Lyrics
            </span>
            <br />Presentation Made Easy
          </h1>
          
          <p className="text-xl text-slate-400 max-w-2xl mb-8">
            Display beautiful lyrics with stunning backgrounds. Manage your song library, 
            create service playlists, and present on multiple screens seamlessly.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Link to={createPageUrl('Songs')}>
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                <Music className="w-5 h-5 mr-2" /> Song Library
              </Button>
            </Link>
            <Link to={createPageUrl('Playlists')}>
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                <ListMusic className="w-5 h-5 mr-2" /> Playlists
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-6xl mx-auto px-4 -mt-8">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                <Music className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{songs.length}</p>
                <p className="text-slate-400 text-sm">Songs in Library</p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <ListMusic className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{playlists.length}</p>
                <p className="text-slate-400 text-sm">Service Playlists</p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <Monitor className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">∞</p>
                <p className="text-slate-400 text-sm">Multi-Screen Support</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upcoming Services */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Upcoming Services</h2>
              <Link to={createPageUrl('Playlists')}>
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hover:bg-green-600">
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
            
            {upcomingPlaylists.length === 0 ? (
              <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-8 text-center">
                <Calendar className="w-10 h-10 mx-auto mb-3 text-slate-600" />
                <p className="text-slate-500">No upcoming services scheduled</p>
                <Link to={createPageUrl('Playlists')}>
                  <Button size="sm" className="mt-4 bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="w-4 h-4 mr-1" /> Create Playlist
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingPlaylists.map(playlist => (
                  <div 
                    key={playlist.id}
                    className="bg-slate-800/50 border border-slate-700 hover:border-slate-600 rounded-lg p-4 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-white">{playlist.name}</h3>
                        <p className="text-sm text-slate-400 flex items-center gap-1.5 mt-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {format(new Date(playlist.date), 'EEEE, MMM d')}
                        </p>
                      </div>
                      <Link to={createPageUrl(`Present?playlist=${playlist.id}`)}>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <Play className="w-4 h-4 mr-1" /> Present
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Songs */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Recent Songs</h2>
              <Link to={createPageUrl('Songs')}>
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white hover:bg-green-600">
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
            
            {songs.length === 0 ? (
              <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-8 text-center">
                <Music className="w-10 h-10 mx-auto mb-3 text-slate-600" />
                <p className="text-slate-500">No songs in library yet</p>
                <Link to={createPageUrl('Songs')}>
                  <Button size="sm" className="mt-4 bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="w-4 h-4 mr-1" /> Add Song
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {songs.map(song => (
                  <div 
                    key={song.id}
                    className="bg-slate-800/50 border border-slate-700 hover:border-slate-600 rounded-lg p-3 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0"
                        style={song.default_background ? {
                          backgroundImage: `url(${song.default_background})`,
                          backgroundSize: 'cover'
                        } : {}}
                      >
                        {!song.default_background && <Music className="w-5 h-5 text-indigo-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white truncate">{song.title}</h3>
                        <p className="text-xs text-slate-500">
                          {song.stanzas?.length || 0} stanzas
                          {song.author && ` • ${song.author}`}
                        </p>
                      </div>
                      <Link to={createPageUrl(`Present?song=${song.id}`)}>
                        <Button size="icon" variant="ghost" className="text-slate-400 hover:text-green-400 h-8 w-8">
                          <Play className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-6xl mx-auto px-4 py-12 border-t border-slate-800">
        <h2 className="text-2xl font-bold text-center mb-8">Key Features</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center p-6">
            <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-indigo-500/20 flex items-center justify-center">
              <Music className="w-7 h-7 text-indigo-400" />
            </div>
            <h3 className="font-semibold mb-2">Song Library</h3>
            <p className="text-slate-400 text-sm">
              Organize songs by category with easy-to-edit stanzas for verses, chorus, and more.
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <ListMusic className="w-7 h-7 text-purple-400" />
            </div>
            <h3 className="font-semibold mb-2">Service Playlists</h3>
            <p className="text-slate-400 text-sm">
              Create playlists for each service. Drag and drop to reorder songs as needed.
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-green-500/20 flex items-center justify-center">
              <Monitor className="w-7 h-7 text-green-400" />
            </div>
            <h3 className="font-semibold mb-2">Multi-Screen</h3>
            <p className="text-slate-400 text-sm">
              Open mirror displays for projectors. All screens stay perfectly in sync.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}