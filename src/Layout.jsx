import React from 'react';
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Music, ListMusic, Home, Play } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";

export default function Layout({ children, currentPageName }) {
  // Don't show nav on presentation pages
  const hideNav = ['Present', 'MirrorDisplay', 'Teleprompter'].includes(currentPageName);

  if (hideNav) {
    return (
      <>
        {children}
        <Toaster position="top-center" />
      </>
    );
  }

  const navItems = [
    { name: 'Home', icon: Home, page: 'Home' },
    { name: 'Songs', icon: Music, page: 'Songs' },
    { name: 'Playlists', icon: ListMusic, page: 'Playlists' },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={createPageUrl('Home')} className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Play className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="font-bold text-white text-lg hidden sm:block">WorshipLive</span>
            </Link>

            {/* Nav Links */}
            <div className="flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPageName === item.page;
                
                return (
                  <Link key={item.page} to={createPageUrl(item.page)}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`gap-2 ${
                        isActive 
                          ? 'text-white bg-slate-800' 
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{item.name}</span>
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {children}
      </main>

      <Toaster position="top-center" theme="dark" />
    </div>
  );
}