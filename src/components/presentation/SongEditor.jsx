import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, X, Image, AlertCircle } from "lucide-react";
import BackgroundPicker from "./BackgroundPicker";
import SlidePreview from "./SlidePreview";

const CATEGORIES = [
  { value: 'worship', label: 'Worship' },
  { value: 'hymn', label: 'Hymn' },
  { value: 'contemporary', label: 'Contemporary' },
  { value: 'gospel', label: 'Gospel' },
  { value: 'christmas', label: 'Christmas' },
  { value: 'easter', label: 'Easter' },
  { value: 'other', label: 'Other' },
];

export default function SongEditor({ song, open, onOpenChange, onSave }) {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    category: 'worship',
    stanzas: [],
    default_background: ''
  });
  const [lyricsText, setLyricsText] = useState('');

  useEffect(() => {
    if (song) {
      setFormData({
        title: song.title || '',
        author: song.author || '',
        category: song.category || 'worship',
        stanzas: song.stanzas || [],
        default_background: song.default_background || ''
      });
      // Convert stanzas back to text format
      const text = song.stanzas?.map(s => {
        const label = s.label ? `[${s.label}]\n` : '';
        return label + s.lines;
      }).join('\n\n') || '';
      setLyricsText(text);
    } else {
      setFormData({
        title: '',
        author: '',
        category: 'worship',
        stanzas: [],
        default_background: ''
      });
      setLyricsText('');
    }
  }, [song, open]);

  // Parse lyrics text into stanzas on change
  useEffect(() => {
    const parseStanzas = () => {
      if (!lyricsText.trim()) {
        return [];
      }

      // Split by double line breaks (2+ newlines)
      const blocks = lyricsText.split(/\n\s*\n+/);
      
      return blocks.map((block, index) => {
        let label = '';
        let lines = block.trim();
        
        // Check if block starts with [Label]
        const labelMatch = block.match(/^\[([^\]]+)\]\s*\n([\s\S]*)/);
        if (labelMatch) {
          label = labelMatch[1];
          lines = labelMatch[2].trim();
        }
        
        return {
          type: '', // Optional
          label: label || '', // Optional
          lines: lines
        };
      }).filter(s => s.lines); // Remove empty stanzas
    };

    const stanzas = parseStanzas();
    setFormData(prev => ({ ...prev, stanzas }));
  }, [lyricsText]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col bg-slate-900 border-slate-700 text-white">
        <DialogHeader className="border-b border-slate-800 pb-4">
          <DialogTitle className="text-xl">
            {song ? 'Edit Song' : 'Add New Song'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto px-1 py-4 space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter song title"
                  className="bg-slate-800 border-slate-700 text-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Author/Artist</Label>
                <Input
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  placeholder="Hillsong, Chris Tomlin, etc."
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(v) => setFormData({ ...formData, category: v })}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Default Background</Label>
                <div className="flex gap-2">
                  {formData.default_background && (
                    <div 
                      className="w-16 h-10 rounded border border-slate-700 bg-cover bg-center"
                      style={{ backgroundImage: `url(${formData.default_background})` }}
                    />
                  )}
                  <BackgroundPicker
                    value={formData.default_background}
                    onChange={(url) => setFormData({ ...formData, default_background: url })}
                    trigger={
                      <Button type="button" variant="outline" className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800">
                        <Image className="w-4 h-4 mr-2" />
                        {formData.default_background ? 'Change' : 'Choose'}
                      </Button>
                    }
                  />
                </div>
              </div>
            </div>
            
            {/* Lyrics Editor */}
            <div className="space-y-2">
              <Label className="text-slate-300">Lyrics</Label>
              <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-3 mb-2">
                <div className="flex items-start gap-2 text-xs text-slate-400">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-300 mb-1">How to format:</p>
                    <ul className="space-y-0.5 list-disc list-inside">
                      <li>Separate stanzas with a blank line (press Enter twice)</li>
                      <li>Optional: Add <code className="bg-slate-700 px-1 rounded">[Verse 1]</code> or <code className="bg-slate-700 px-1 rounded">[Chorus]</code> before a stanza to label it</li>
                      <li>The app will automatically split your lyrics into slides</li>
                    </ul>
                  </div>
                </div>
              </div>
              <Textarea
                value={lyricsText}
                onChange={(e) => setLyricsText(e.target.value)}
                placeholder="[Verse 1]&#10;Amazing grace, how sweet the sound&#10;That saved a wretch like me&#10;&#10;[Chorus]&#10;How great is our God&#10;Sing with me, how great is our God"
                rows={12}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 font-mono text-sm"
              />
              <p className="text-xs text-slate-500">
                {formData.stanzas.length} stanza{formData.stanzas.length !== 1 ? 's' : ''} detected
              </p>
            </div>
            
            {/* Preview Slides */}
            {formData.stanzas.length > 0 && (
              <div className="space-y-2">
                <Label className="text-slate-300">Preview Slides</Label>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {formData.stanzas.map((stanza, index) => (
                    <SlidePreview
                      key={index}
                      stanza={stanza}
                      background={formData.default_background}
                      size="md"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              <X className="w-4 h-4 mr-2" /> Cancel
            </Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
              <Save className="w-4 h-4 mr-2" /> Save Song
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}