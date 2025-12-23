import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Image, Upload, Loader2, Check } from "lucide-react";
import { getDatabase, generateId, getCurrentTimestamp } from "@/components/database";

const PRESET_BACKGROUNDS = [
  { name: 'Sunset Sky', url: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=1920&q=80', category: 'sky' },
  { name: 'Mountain Sunrise', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80', category: 'nature' },
  { name: 'Ocean Waves', url: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=1920&q=80', category: 'water' },
  { name: 'Starry Night', url: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&q=80', category: 'sky' },
  { name: 'Forest Light', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=80', category: 'nature' },
  { name: 'Aurora Borealis', url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1920&q=80', category: 'sky' },
  { name: 'Calm Lake', url: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=1920&q=80', category: 'water' },
  { name: 'Purple Sky', url: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=1920&q=80', category: 'abstract' },
];

export default function BackgroundPicker({ value, onChange, trigger }) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [customBackgrounds, setCustomBackgrounds] = useState([]);
  const [db, setDb] = useState(null);

  useEffect(() => {
    let subscription;
    
    const initDb = async () => {
      const database = await getDatabase();
      setDb(database);
      
      // Subscribe to backgrounds
      subscription = database.backgrounds.find().$.subscribe(docs => {
        setCustomBackgrounds(docs.map(d => d.toJSON()));
      });
    };
    
    initDb();
    
    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    try {
      // Convert file to Data URL for local storage
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target.result;
        
        await db.backgrounds.insert({
          id: generateId(),
          name: file.name,
          url: dataUrl, // Store as data URL instead of cloud URL
          type: file.type.startsWith('video') ? 'video' : 'image',
          category: 'custom',
          created_date: getCurrentTimestamp()
        });
        
        onChange(dataUrl);
        setOpen(false);
        setUploading(false);
      };
      
      reader.onerror = () => {
        console.error('Failed to read file');
        setUploading(false);
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload failed:', error);
      setUploading(false);
    }
  };

  const handleSelect = (url) => {
    onChange(url);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
            <Image className="w-4 h-4 mr-2" /> Choose Background
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle>Select Background</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="presets" className="w-full">
          <TabsList className="bg-slate-800">
            <TabsTrigger value="presets">Presets</TabsTrigger>
            <TabsTrigger value="library">My Library</TabsTrigger>
            <TabsTrigger value="upload">Upload</TabsTrigger>
          </TabsList>
          
          <TabsContent value="presets" className="mt-4">
            <div className="grid grid-cols-4 gap-3">
              {PRESET_BACKGROUNDS.map((bg) => (
                <button
                  key={bg.url}
                  onClick={() => handleSelect(bg.url)}
                  className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                    value === bg.url ? 'border-indigo-500 ring-2 ring-indigo-500/50' : 'border-transparent hover:border-slate-600'
                  }`}
                >
                  <img src={bg.url} alt={bg.name} className="w-full h-full object-cover" />
                  {value === bg.url && (
                    <div className="absolute inset-0 bg-indigo-500/30 flex items-center justify-center">
                      <Check className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <p className="text-xs text-white truncate">{bg.name}</p>
                  </div>
                </button>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="library" className="mt-4">
            {customBackgrounds.length > 0 ? (
              <div className="grid grid-cols-4 gap-3">
                {customBackgrounds.map((bg) => (
                  <button
                    key={bg.id}
                    onClick={() => handleSelect(bg.url)}
                    className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                      value === bg.url ? 'border-indigo-500 ring-2 ring-indigo-500/50' : 'border-transparent hover:border-slate-600'
                    }`}
                  >
                    {bg.type === 'video' ? (
                      <video src={bg.url} className="w-full h-full object-cover" muted />
                    ) : (
                      <img src={bg.url} alt={bg.name} className="w-full h-full object-cover" />
                    )}
                    {value === bg.url && (
                      <div className="absolute inset-0 bg-indigo-500/30 flex items-center justify-center">
                        <Check className="w-6 h-6 text-white" />
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                      <p className="text-xs text-white truncate">{bg.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <Image className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No custom backgrounds yet</p>
                <p className="text-sm">Upload your own in the Upload tab</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="upload" className="mt-4 space-y-4">
            <div className="border-2 border-dashed border-slate-700 rounded-lg p-8 text-center">
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileUpload}
                className="hidden"
                id="bg-upload"
                disabled={uploading}
              />
              <label htmlFor="bg-upload" className="cursor-pointer">
                {uploading ? (
                  <Loader2 className="w-12 h-12 mx-auto mb-3 text-indigo-500 animate-spin" />
                ) : (
                  <Upload className="w-12 h-12 mx-auto mb-3 text-slate-500" />
                )}
                <p className="text-slate-400">
                  {uploading ? 'Uploading...' : 'Click to upload image or video'}
                </p>
                <p className="text-xs text-slate-600 mt-1">JPG, PNG, MP4 supported</p>
              </label>
            </div>
            
            <div className="space-y-2">
              <Label className="text-slate-400">Or paste URL</Label>
              <div className="flex gap-2">
                <Input
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://..."
                  className="bg-slate-800 border-slate-700 text-white"
                />
                <Button 
                  onClick={() => { handleSelect(customUrl); setCustomUrl(''); }}
                  disabled={!customUrl}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  Use
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}