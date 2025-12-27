import React, { useState, useEffect } from 'react';
import { getDatabase } from "@/components/database";
import { Button } from "@/components/ui/button";
import { 
  Music, ListMusic, Play, Plus, ArrowRight, 
  Calendar, Sparkles, Monitor, Mail, Facebook
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
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Guilt-Free 
            <br />
            </span>
            Worship Lyrics
            <br />Presentation Made Easy
          </h1>
          
          <p className="text-xl text-slate-400 max-w-2xl mb-8">
            Display beautiful lyrics with your own stunning backgrounds. Manage your song library, 
            create service playlists, and present on multiple screens seamlessly {" "} 
            <span className='font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent'> 
              with no one-time payment and subscription fees.</span>
            <br />With <span className='font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent'> easy to installation</span>
            {" "}all features are available offline.
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

      {/* Footer */}
      <div className="mt-16 border-t border-slate-800 bg-slate-900/50">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-3">Have Questions or Feedback?</h3>
            <p className="text-slate-400 mb-6">
              Reach out to us for demo requests or feature suggestions. We'd love to hear from you!
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a 
                href="https://www.facebook.com/bloidel" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="border-blue-600 text-blue-400 hover:bg-blue-600/10">
                  <Facebook className="w-4 h-4 mr-2" /> Facebook
                </Button>
              </a>
              <a href="mailto:pelayowindel@gmail.com">
                <Button variant="outline" className="border-indigo-600 text-indigo-400 hover:bg-indigo-600/10">
                  <Mail className="w-4 h-4 mr-2" /> Email
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}