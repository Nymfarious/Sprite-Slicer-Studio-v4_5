import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Bot, Check, Plus, Trash2, Paperclip } from 'lucide-react';
import { SplitPane } from '@/components/SplitPane';
import { AINote } from '../types';

interface NotesTabProps {
  aiNotes: AINote[];
  newNote: string;
  setNewNote: (note: string) => void;
  onAddNote: () => void;
  onToggleNoteResolved: (id: string) => void;
  onDeleteNote: (id: string) => void;
}

export function NotesTab({
  aiNotes,
  newNote,
  setNewNote,
  onAddNote,
  onToggleNoteResolved,
  onDeleteNote,
}: NotesTabProps) {
  return (
    <SplitPane
      top={
        <div className="h-full flex flex-col">
          <div className="flex gap-2 mb-3 shrink-0">
            <Textarea
              placeholder="Add a note about what's not working or needs attention..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="min-h-[60px] border-cyan-500/30 focus:border-cyan-500"
            />
            <Button onClick={onAddNote} disabled={!newNote.trim()} className="shrink-0 bg-cyan-600 hover:bg-cyan-700">
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>

          <ScrollArea className="flex-1">
            <div className="space-y-2 pb-4 pr-4">
              {aiNotes.filter(n => !n.resolved).length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Bot className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No active notes. Add issues above.</p>
                </div>
              ) : (
                aiNotes.filter(n => !n.resolved).map(note => (
                  <div
                    key={note.id}
                    className="p-3 rounded-lg border bg-destructive/10 border-destructive/30"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm">{note.content}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(note.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onToggleNoteResolved(note.id)}
                          className="text-green-500 hover:bg-green-500/10"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteNote(note.id)}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      }
      bottom={
        <div className="h-full flex flex-col bg-muted/20 rounded-lg p-3 border border-border/50">
          <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider flex items-center gap-2">
            <Paperclip className="w-3 h-3" />
            Resolved Notes ({aiNotes.filter(n => n.resolved).length})
          </h4>
          <ScrollArea className="flex-1">
            <div className="space-y-1 pr-2">
              {aiNotes.filter(n => n.resolved).map(note => (
                <div
                  key={note.id}
                  className="flex items-center gap-2 text-xs text-muted-foreground p-2 rounded bg-success/5 border border-success/20"
                >
                  <Check className="w-3 h-3 text-success shrink-0" />
                  <span className="line-through flex-1">{note.content}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteNote(note.id)}
                    className="h-5 w-5 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
              {aiNotes.filter(n => n.resolved).length === 0 && (
                <p className="text-xs text-muted-foreground/60 text-center py-4">
                  Resolved notes will appear here
                </p>
              )}
            </div>
          </ScrollArea>
        </div>
      }
      defaultTopHeight={60}
      minTopHeight={50}
    />
  );
}
