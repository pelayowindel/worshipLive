import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { GripVertical, Trash2, Plus } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const STANZA_TYPES = [
  { value: 'verse', label: 'Verse' },
  { value: 'chorus', label: 'Chorus' },
  { value: 'bridge', label: 'Bridge' },
  { value: 'pre-chorus', label: 'Pre-Chorus' },
  { value: 'intro', label: 'Intro' },
  { value: 'outro', label: 'Outro' },
  { value: 'tag', label: 'Tag' },
];

export default function StanzaEditor({ stanzas = [], onChange }) {
  const addStanza = () => {
    const verseCount = stanzas.filter(s => s.type === 'verse').length + 1;
    onChange([...stanzas, { 
      type: 'verse', 
      label: `Verse ${verseCount}`, 
      lines: '' 
    }]);
  };

  const updateStanza = (index, field, value) => {
    const updated = [...stanzas];
    updated[index] = { ...updated[index], [field]: value };
    
    // Auto-update label based on type
    if (field === 'type') {
      const typeLabel = STANZA_TYPES.find(t => t.value === value)?.label || value;
      const count = stanzas.filter((s, i) => s.type === value && i < index).length + 1;
      updated[index].label = value === 'chorus' ? 'Chorus' : `${typeLabel} ${count}`;
    }
    
    onChange(updated);
  };

  const removeStanza = (index) => {
    onChange(stanzas.filter((_, i) => i !== index));
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(stanzas);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    onChange(items);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-300">Stanzas</h3>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={addStanza}
          className="border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          <Plus className="w-4 h-4 mr-1" /> Add Stanza
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="stanzas">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
              {stanzas.map((stanza, index) => (
                <Draggable key={index} draggableId={`stanza-${index}`} index={index}>
                  {(provided, snapshot) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`p-4 bg-slate-800/50 border-slate-700 ${snapshot.isDragging ? 'ring-2 ring-indigo-500' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <div {...provided.dragHandleProps} className="pt-2 cursor-grab">
                          <GripVertical className="w-5 h-5 text-slate-500" />
                        </div>
                        
                        <div className="flex-1 space-y-3">
                          <div className="flex gap-3">
                            <Select 
                              value={stanza.type} 
                              onValueChange={(v) => updateStanza(index, 'type', v)}
                            >
                              <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {STANZA_TYPES.map(type => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            
                            <Input
                              value={stanza.label}
                              onChange={(e) => updateStanza(index, 'label', e.target.value)}
                              placeholder="Label"
                              className="flex-1 bg-slate-700 border-slate-600 text-white"
                            />
                          </div>
                          
                          <Textarea
                            value={stanza.lines}
                            onChange={(e) => updateStanza(index, 'lines', e.target.value)}
                            placeholder="Enter lyrics here... (Press Enter for new lines)"
                            rows={4}
                            className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 font-mono"
                          />
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeStanza(index)}
                          className="text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {stanzas.length === 0 && (
        <div className="text-center py-8 text-slate-500 border-2 border-dashed border-slate-700 rounded-lg">
          <p>No stanzas yet. Click "Add Stanza" to begin.</p>
        </div>
      )}
    </div>
  );
}