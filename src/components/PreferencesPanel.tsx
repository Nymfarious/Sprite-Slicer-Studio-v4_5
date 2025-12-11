import { useRef } from 'react';
import { X, Palette, Download, Database, Shield, Tag, User, FolderOpen, Image, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { ResizableOverlayPanel } from '@/components/ResizableOverlayPanel';
import { TagManager } from '@/components/TagManager';
import { AvatarEditor, AvatarDisplay, AvatarShape } from '@/components/AvatarEditor';
import { AppPreferences, Tag as TagType, TagIcon } from '@/types/sprite';
import { THEME_PRESETS } from '@/hooks/useTheme';
import { useDirectoryHandle } from '@/hooks/useDirectoryHandle';
import { toast } from 'sonner';

interface PreferencesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: AppPreferences;
  onPreferencesChange: (prefs: Partial<AppPreferences>) => void;
  onOpenAuth: () => void;
  tags: TagType[];
  onCreateTag: (name: string, color: string, icon: TagIcon) => void;
  onUpdateTag: (id: string, updates: Partial<Omit<TagType, 'id' | 'createdAt'>>) => void;
  onDeleteTag: (id: string) => void;
  onOpenTagManager: () => void;
  tagUsageStats?: Record<string, number>;
}

export function PreferencesPanel({ 
  isOpen, 
  onClose, 
  preferences, 
  onPreferencesChange,
  onOpenAuth,
  tags,
  onCreateTag,
  onUpdateTag,
  onDeleteTag,
  onOpenTagManager,
  tagUsageStats = {},
}: PreferencesPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { 
    directoryName, 
    hasPermission, 
    selectDirectory, 
    requestPermission,
    clearDirectory 
  } = useDirectoryHandle();

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onPreferencesChange({ 
          userAvatar: event.target?.result as string,
          avatarPosition: { x: 0, y: 0 } // Reset position on new upload
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectDirectory = async () => {
    if (!window.showDirectoryPicker) {
      toast.error('File System Access API not supported', {
        description: 'Your browser does not support folder selection. Files will be saved to Downloads.',
      });
      return;
    }

    const handle = await selectDirectory();
    if (handle) {
      onPreferencesChange({ autoSavePath: handle.name });
      toast.success(`Auto-save folder set to: ${handle.name}`);
    }
  };

  const handleRequestPermission = async () => {
    const granted = await requestPermission();
    if (granted) {
      toast.success('Permission granted');
    } else {
      toast.error('Permission denied - please select the folder again');
      await clearDirectory();
      onPreferencesChange({ autoSavePath: undefined });
    }
  };

  return (
    <ResizableOverlayPanel
      isOpen={isOpen}
      onClose={onClose}
      defaultWidth={400}
      minWidth={320}
      maxWidth={75}
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-lg">Preferences</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 space-y-6 scrollbar-thin">
          {/* User Profile */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <User className="w-4 h-4 text-primary" />
              Profile
            </div>
            
            <div className="space-y-4">
              {/* Avatar with shape and drag */}
              {preferences.userAvatar ? (
                <AvatarEditor
                  imageUrl={preferences.userAvatar}
                  shape={preferences.avatarShape || 'circle'}
                  position={preferences.avatarPosition || { x: 0, y: 0 }}
                  onShapeChange={(shape) => onPreferencesChange({ avatarShape: shape })}
                  onPositionChange={(position) => onPreferencesChange({ avatarPosition: position })}
                />
              ) : (
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-16 h-16 rounded-lg border-2 border-dashed border-border bg-secondary/50 flex items-center justify-center overflow-hidden hover:border-primary transition-colors"
                  >
                    <Image className="w-6 h-6 text-muted-foreground" />
                  </button>
                  <span className="text-xs text-muted-foreground">Click to upload avatar</span>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />

              {preferences.userAvatar && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Change Image
                </Button>
              )}

              {/* Username */}
              <div className="space-y-2">
                <Label className="text-sm">Display Name</Label>
                <Input
                  value={preferences.userName || ''}
                  onChange={(e) => onPreferencesChange({ userName: e.target.value })}
                  placeholder="Enter your name"
                  className="bg-input border-border"
                />
              </div>
            </div>
          </div>

          <Separator className="bg-border" />

          {/* Theme Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Palette className="w-4 h-4 text-primary" />
              Theme
            </div>
            
            <div className="grid grid-cols-5 gap-2">
              {THEME_PRESETS.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => onPreferencesChange({ theme: theme.id })}
                  className={`p-1 rounded-lg border-2 transition-all ${
                    preferences.theme === theme.id 
                      ? 'border-primary scale-105' 
                      : 'border-transparent hover:border-muted-foreground'
                  }`}
                  title={theme.name}
                >
                  <div className="w-full aspect-square rounded-md flex flex-col overflow-hidden">
                    <div 
                      className="flex-1" 
                      style={{ backgroundColor: `hsl(${theme.primary})` }}
                    />
                    <div 
                      className="h-2" 
                      style={{ backgroundColor: `hsl(${theme.accent})` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 block text-center">
                    {theme.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <Separator className="bg-border" />

          {/* Cloud Sync */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Database className="w-4 h-4 text-primary" />
              Cloud Sync
            </div>
            <div className="p-4 bg-secondary/30 rounded-lg border border-border space-y-3">
              <p className="text-sm text-muted-foreground">
                Connect to cloud storage to sync your library across devices.
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={onOpenAuth}
              >
                <Shield className="w-4 h-4 mr-2" />
                Sign In to Sync
              </Button>
            </div>
          </div>

          <Separator className="bg-border" />

          {/* Export Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Download className="w-4 h-4 text-primary" />
              Export Settings
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm">Export Format</Label>
                <Select
                  value={preferences.exportFormat}
                  onValueChange={(value: 'png' | 'webp' | 'jpeg' | 'svg') => onPreferencesChange({ exportFormat: value })}
                >
                  <SelectTrigger className="bg-input border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="png">PNG (Lossless)</SelectItem>
                    <SelectItem value="webp">WebP (Smaller)</SelectItem>
                    <SelectItem value="jpeg">JPEG (No Transparency)</SelectItem>
                    <SelectItem value="svg">SVG (Vector Wrapper)</SelectItem>
                  </SelectContent>
                </Select>
                {preferences.exportFormat === 'jpeg' && (
                  <p className="text-xs text-muted-foreground">
                    Transparency will be flattened to white
                  </p>
                )}
              </div>

              {(preferences.exportFormat === 'webp' || preferences.exportFormat === 'jpeg') && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-sm">Quality</Label>
                    <span className="text-sm font-mono text-muted-foreground">
                      {preferences.exportQuality}%
                    </span>
                  </div>
                  <Slider
                    value={[preferences.exportQuality]}
                    onValueChange={([value]) => onPreferencesChange({ exportQuality: value })}
                    min={50}
                    max={100}
                    step={5}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2 pt-2">
              <Label className="text-sm">Slice Background</Label>
              <Select
                value={preferences.sliceBackground || 'transparent'}
                onValueChange={(value: 'transparent' | 'black' | 'white') => onPreferencesChange({ sliceBackground: value })}
              >
                <SelectTrigger className="bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="transparent">Transparent</SelectItem>
                  <SelectItem value="black">Solid Black</SelectItem>
                  <SelectItem value="white">Solid White</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Background for exported slices
              </p>
            </div>
          </div>

          <Separator className="bg-border" />

          {/* Tag Management */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Tag className="w-4 h-4 text-primary" />
              Tag Management
            </div>
            
            {/* Tag Usage Stats */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Tag Usage</Label>
              <div className="space-y-1.5">
                {tags.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No tags created yet.</p>
                ) : (
                  tags.map(tag => (
                    <div key={tag.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: tag.color }} 
                        />
                        <span className="text-foreground">{tag.name}</span>
                      </div>
                      <span className="text-muted-foreground">
                        {tagUsageStats[tag.id] || 0} assets
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={onOpenTagManager}
            >
              <Tag className="w-4 h-4 mr-2" />
              Manage Tags
            </Button>
          </div>

          <Separator className="bg-border" />

          {/* Editor Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Palette className="w-4 h-4 text-primary" />
              Editor
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">Auto Save to Library</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Automatically save sliced assets
                  </p>
                </div>
                <Switch
                  checked={preferences.autoSave}
                  onCheckedChange={(checked) => onPreferencesChange({ autoSave: checked })}
                />
              </div>

              {/* Auto Save path picker */}
              <div className="space-y-2">
                <Label className="text-sm">Auto Save Location</Label>
                <div className="flex gap-2">
                  <div className="flex-1 px-3 py-2 bg-input border border-border rounded-md text-sm text-muted-foreground truncate">
                    {directoryName || preferences.autoSavePath || 'Downloads (default)'}
                  </div>
                  {directoryName && !hasPermission ? (
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={handleRequestPermission}
                      title="Re-grant permission"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={handleSelectDirectory}
                      title="Select folder"
                    >
                      <FolderOpen className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {directoryName && !hasPermission 
                    ? 'Click refresh to re-grant access to folder'
                    : 'Choose where auto-saved exports are stored'}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Grid Color</Label>
              <div className="flex gap-2">
                {['#2dd4bf', '#a78bfa', '#f472b6', '#fbbf24', '#4ade80'].map(color => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-lg border-2 transition-all ${
                      preferences.gridColor === color 
                        ? 'border-foreground scale-110' 
                        : 'border-transparent hover:border-muted-foreground'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => onPreferencesChange({ gridColor: color })}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Removed branding */}
        <div className="p-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Sprite Slicer Pro v1.0
          </p>
        </div>
      </div>
    </ResizableOverlayPanel>
  );
}
