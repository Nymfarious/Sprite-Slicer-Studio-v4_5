import { useState, useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Film, Play, Trash2, SortAsc } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VideoProject } from '@/hooks/useVideoProjects';

interface VideoProjectsPanelProps {
  projects: VideoProject[];
  onLoadProject?: (project: VideoProject) => void;
  onDeleteProject?: (id: string) => void;
}

export function VideoProjectsPanel({ projects, onLoadProject, onDeleteProject }: VideoProjectsPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'duration'>('date');

  const filteredProjects = useMemo(() => {
    let filtered = projects.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    switch (sortBy) {
      case 'name': filtered.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'date': filtered.sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()); break;
      case 'duration': filtered.sort((a, b) => (b.frameCount / b.fps) - (a.frameCount / a.fps)); break;
    }
    return filtered;
  }, [projects, searchQuery, sortBy]);

  const formatDuration = (frames: number, fps: number) => {
    const seconds = frames / fps;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-border space-y-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search video projects..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-8 h-8" />
        </div>
        <div className="flex items-center gap-2">
          <SortAsc className="h-3 w-3 text-muted-foreground" />
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
            <SelectTrigger className="h-7 text-xs flex-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Last Modified</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="duration">Duration</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-3 grid grid-cols-2 gap-3">
          {filteredProjects.length === 0 ? (
            <div className="col-span-2 flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Film className="h-12 w-12 mb-3 opacity-30" />
              <p className="text-sm font-medium">No video projects yet</p>
              <p className="text-xs mt-1">Save animations from the Mending Loom</p>
            </div>
          ) : (
            filteredProjects.map(project => (
              <div
                key={project.id}
                className={cn("group relative rounded-lg border border-border overflow-hidden hover:border-primary/50 hover:shadow-md transition-all cursor-pointer")}
                onClick={() => onLoadProject?.(project)}
              >
                <div className="aspect-video bg-muted relative">
                  {project.thumbnail ? (
                    <img src={project.thumbnail} alt={project.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Film className="h-8 w-8 text-muted-foreground" /></div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <Play className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
                    {formatDuration(project.frameCount, project.fps)}
                  </div>
                  {onDeleteProject && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 bg-black/50 hover:bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => { e.stopPropagation(); onDeleteProject(project.id); }}
                    >
                      <Trash2 className="h-3 w-3 text-white" />
                    </Button>
                  )}
                </div>
                <div className="p-2">
                  <p className="text-sm font-medium truncate">{project.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <span>{project.frameCount} frames</span>
                    <span>•</span>
                    <span>{project.fps} fps</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
