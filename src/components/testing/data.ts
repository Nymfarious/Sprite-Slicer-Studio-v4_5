// Testing Checklist Data Constants

import { BuildLogItem, PlanCategory, Category, ChecklistItem, MobileIssue, AIFeature } from './types';

export const buildLog: BuildLogItem[] = [
  {
    category: "Layout & UI",
    items: [
      { name: "Resizable Two-Panel Layout", status: "complete", desc: "Drag handle between editor/library" },
      { name: "Responsive Mobile Stacking", status: "complete", desc: "Vertical layout on small screens" },
      { name: "Dark Theme with Accent Colors", status: "complete", desc: "Customizable via Preferences" },
      { name: "Tab Icons Added", status: "complete", desc: "Checklist ☑️ and Notes 📝 icons" },
      { name: "Tooltip Z-index Fix", status: "complete", desc: "Fixed .txt download tooltip overlap" },
      { name: "Tab Content Height", status: "complete", desc: "50%+ fill for all tabs" },
      { name: "Library Panel Opacity", status: "complete", desc: "85-90% backdrop blur" },
      { name: "Resizable Bottom Panel", status: "complete", desc: "Draggable divider (25%-75% height range) with snap buttons" },
    ]
  },
  {
    category: "Image Upload",
    items: [
      { name: "Drag & Drop Upload", status: "complete", desc: "PNG, JPG, WebP support" },
      { name: "File Validation", status: "complete", desc: "Type and size (10MB) checks" },
      { name: "Empty State Guidance", status: "complete", desc: "Upload prompts in both panels" },
    ]
  },
  {
    category: "Slicing Engine",
    items: [
      { name: "Grid Presets (Cookie Cutter)", status: "complete", desc: "Merged with Grid Settings" },
      { name: "Visual Grid Overlay", status: "complete", desc: "Preview before slicing" },
      { name: "Manual Boundary Adjustment", status: "partial", desc: "Freeform drag deferred to V3" },
      { name: "Auto-naming Convention", status: "complete", desc: "sheet_name_row_col format" },
      { name: "10-Step Undo History", status: "complete", desc: "useUndoRedo hook" },
      { name: "Up/Down Buttons Styled", status: "complete", desc: "Improved visual design" },
      { name: "Clear Selections Confirmation", status: "complete", desc: "Dialog to prevent accidental data loss" },
    ]
  },
  {
    category: "Crop Tool (v4.5)",
    items: [
      { name: "Octagon Shape", status: "complete", desc: "Added octagon option to crop shapes" },
      { name: "Use Grid Selection", status: "complete", desc: "Checkbox to use grid cells as crop boundary" },
      { name: "Inside/Outside Mode", status: "complete", desc: "Renamed from Keep/Remove for clarity" },
      { name: "Clear Selection Button", status: "complete", desc: "Quick clear without canceling crop" },
      { name: "SaveToLibraryDialog", status: "complete", desc: "Save cropped result with name/tags" },
      { name: "CropTool Refactored", status: "complete", desc: "Split 655-line file into 5 focused modules" },
    ]
  },
  {
    category: "Library Management",
    items: [
      { name: "Sprite Library Panel", status: "complete", desc: "Grid view with thumbnails" },
      { name: "Hover Metadata Tooltips", status: "complete", desc: "Size, source, slice info" },
      { name: "Delete with Confirmation", status: "complete", desc: "Modal confirmation dialog" },
      { name: "Clear All", status: "complete", desc: "Bulk delete with confirm" },
      { name: "Provenance Tracking", status: "complete", desc: "Link slices to source sheet" },
      { name: "Sort Options", status: "complete", desc: "Sort by name/date/size" },
      { name: "Tag Manager UI", status: "complete", desc: "View/edit/remove tags globally" },
    ]
  },
  {
    category: "Export System",
    items: [
      { name: "Individual PNG Export", status: "complete", desc: "Download single sprites" },
      { name: "ZIP Bundle Export", status: "complete", desc: "JSZip integration" },
      { name: "JSON Coordinates", status: "complete", desc: "Sprite atlas metadata" },
      { name: "Multi-select Export", status: "complete", desc: "Export Pack modal" },
      { name: "Re-pack Sheet", status: "complete", desc: "Combines sprites into sheet" },
    ]
  },
  {
    category: "AI Features",
    items: [
      { name: "AI Enhance Modal", status: "stub", desc: "Modal UI with sparkle badge" },
      { name: "Batch Processing Flow", status: "complete", desc: "Progress bar and completion screen" },
      { name: "Avatar Completion Screen", status: "complete", desc: "Replayable animation" },
      { name: "AI Error Analyzer", status: "complete", desc: "Edge function integration" },
      { name: "AI Boundaries Button", status: "stub", desc: "Coming soon in v4.5 tooltip" },
    ]
  },
  {
    category: "Editor Toolbar (v4.5)",
    items: [
      { name: "Clear Selections Renamed", status: "complete", desc: "Changed from 'Select None'" },
      { name: "Freeform Tool Popover", status: "complete", desc: "Moved from panel to icon with popup" },
      { name: "Reload Original Image", status: "complete", desc: "Button to restore original after transforms" },
      { name: "Projects Bar Compact", status: "complete", desc: "New Project button icon-only with tooltip" },
    ]
  },
  {
    category: "Persistence",
    items: [
      { name: "localStorage Persistence", status: "complete", desc: "useLocalStorage hook" },
      { name: "Session Recovery", status: "complete", desc: "State restored on refresh" },
      { name: "Cloud Sync", status: "stub", desc: "Supabase connected, tables pending" },
    ]
  },
  {
    category: "Planning & Testing",
    items: [
      { name: "Testing Checklist Modal", status: "complete", desc: "This component!" },
      { name: "Plan Options Tab", status: "complete", desc: "30 items with Yes/No/Maybe/Later" },
      { name: "Build Log Tab", status: "complete", desc: "Feature changelog with v4.5 updates" },
      { name: "Error Log + AI Debugger", status: "complete", desc: "Split-screen error analysis" },
      { name: "Mind Map Flowchart", status: "complete", desc: "Mermaid diagram pane" },
      { name: "Mobile Issues Tab", status: "complete", desc: "Tracking mobile UX gaps" },
      { name: "AI Features Tab", status: "complete", desc: "AI dependency documentation" },
    ]
  },
];

export const planCategories: PlanCategory[] = [
  {
    title: "✅ V4.5 DONE (Implemented)",
    items: [
      { id: "done-version", num: 1, text: "Version updated to 4.5 Pre-Alpha in Header" },
      { id: "done-croptool", num: 2, text: "CropTool refactored into 5 focused modules" },
      { id: "done-upload", num: 3, text: "Upload with drag & drop, validation (PNG/JPG/WebP, 10MB)" },
      { id: "done-grid", num: 4, text: "Grid configure with rows/cols/offset/spacing" },
      { id: "done-slice", num: 5, text: "Slice with click, shift-click, marquee selection" },
      { id: "done-library", num: 6, text: "Library panel with thumbnails, tags, bulk actions" },
      { id: "done-export", num: 7, text: "Export ZIP, JSON atlas, individual PNGs" },
      { id: "done-tags", num: 8, text: "Tag system with TagManager and filter by tags" },
      { id: "done-projects", num: 9, text: "Projects/folders system for organization" },
      { id: "done-animation", num: 10, text: "Animation Loom with playback and FPS controls" },
      { id: "done-clearconfirm", num: 11, text: "Clear Selections confirmation dialog" },
      { id: "done-errorlog", num: 12, text: "Error log panel with pin/delete/export" },
      { id: "done-aianalyze", num: 13, text: "AI error analysis wired to ErrorLogPanel" },
      { id: "done-pipeline", num: 14, text: "Pipeline visualization with correct status colors" },
    ]
  },
  {
    title: "🟡 PARTIAL (Needs Work)",
    items: [
      { id: "partial-genpose", num: 15, text: "Generate Pose - edge function exists but often falls back to stub" },
      { id: "partial-gensheet", num: 16, text: "Generate Sheet - same issue, API may fail" },
      { id: "partial-batch", num: 17, text: "Batch Session - UI complete but uses mock file picker" },
    ]
  },
  {
    title: "❌ V5 TODO (Not Implemented)",
    items: [
      { id: "todo-magicwand", num: 18, text: "AI Sprite Boundary Detection (Magic Wand) - button disabled" },
      { id: "todo-enhance", num: 19, text: "AI Enhance with real image generation (currently stubbed)" },
      { id: "todo-repack", num: 20, text: "AI Re-pack optimization algorithm" },
      { id: "todo-clearai", num: 21, text: "Clear AI Detection results button & Escape shortcut" },
      { id: "todo-progress", num: 22, text: "Animated progress icons/overlays for AI processing" },
    ]
  },
  {
    title: "🔮 V5+ FUTURE (Roadmap)",
    items: [
      { id: "future-unity", num: 23, text: "Unity sprite sheet format export" },
      { id: "future-godot", num: 24, text: "Godot sprite sheet format export" },
      { id: "future-trim", num: 25, text: "Trim whitespace option for exports" },
      { id: "future-binpack", num: 26, text: "Optimal bin-packing for re-pack" },
      { id: "future-cloud", num: 27, text: "Supabase cloud sync for library" },
      { id: "future-share", num: 28, text: "Shareable links for sprite packs" },
      { id: "future-collab", num: 29, text: "Team collaboration features" },
      { id: "future-mobile", num: 30, text: "Touch-friendly mobile version" },
    ]
  },
];

export const completedV2Items: ChecklistItem[] = [
  { id: "layout-1", text: "✅ Two-panel resizable layout (ResizablePanels.tsx with drag handle)", priority: "P1" },
  { id: "layout-2", text: "✅ Mobile responsive stacking (use-mobile hook + vertical layout)", priority: "P1" },
  { id: "upload-1", text: "✅ Upload with validation (ImageUpload.tsx - type/size checks)", priority: "P1" },
  { id: "upload-2", text: "✅ Empty states for editor & library panels", priority: "P1" },
  { id: "upload-3", text: "✅ PNG, JPG, WebP support in upload", priority: "P1" },
  { id: "upload-4", text: "✅ 10MB file size validation", priority: "P1" },
  { id: "slice-1", text: "✅ Grid presets in GridControls (merged Cookie Cutter)", priority: "P1" },
  { id: "slice-2", text: "✅ Visual grid overlay preview (EditorPanel canvas)", priority: "P1" },
  { id: "slice-4", text: "✅ Auto-naming: sheet_row_col format", priority: "P1" },
  { id: "slice-5", text: "✅ 10-step undo/redo (useUndoRedo hook)", priority: "P1" },
  { id: "lib-1", text: "✅ Library panel with hover metadata tooltips", priority: "P1" },
  { id: "lib-2", text: "✅ Delete confirmation modal", priority: "P1" },
  { id: "lib-3", text: "✅ Clear All with confirmation dialog", priority: "P1" },
  { id: "lib-4", text: "✅ Provenance tracking (sourceSheet in SpriteAsset)", priority: "P1" },
  { id: "lib-5", text: "✅ Sort by name/date/size in Library", priority: "P1" },
  { id: "lib-6", text: "✅ Search bar with filter in LibraryPanel", priority: "P1" },
  { id: "pref-1", text: "✅ Preferences panel (themes, export format, grid color)", priority: "P1" },
  { id: "pref-2", text: "✅ Click-outside closes PreferencesPanel", priority: "P1" },
  { id: "ai-1", text: "✅ BatchCompletionScreen with replayable avatar animation", priority: "P1" },
  { id: "ai-2", text: "✅ Batch processing flow with progress bar", priority: "P1" },
  { id: "ai-3", text: "✅ EnhanceModal stub (sparkle badge, prompt input)", priority: "P2" },
  { id: "export-1", text: "✅ Export individual sprites (useSpriteLibrary.exportAsset)", priority: "P1" },
  { id: "export-2", text: "✅ ZIP bundle export (JSZip in imageExport.ts)", priority: "P1" },
  { id: "export-3", text: "✅ JSON coordinates in ExportPackModal", priority: "P1" },
  { id: "export-4", text: "✅ Re-pack sheet from selection", priority: "P1" },
  { id: "persist-1", text: "✅ localStorage persistence (useLocalStorage hook)", priority: "P1" },
  { id: "persist-2", text: "✅ Supabase connected via Lovable Cloud", priority: "P1" },
  { id: "persist-3", text: "✅ Session recovery on refresh", priority: "P1" },
  { id: "map-1", text: "✅ FlowchartPanel with pipeline visualization", priority: "P2" },
  { id: "v2-tags", text: "✅ Tag system (useTags, TagManager, TagPickerPopover)", priority: "P1" },
  { id: "v2-themes", text: "✅ 10 theme presets (useTheme hook)", priority: "P1" },
  { id: "v2-zoom", text: "✅ Zoom controls (CollapsibleZoomPanel)", priority: "P1" },
  { id: "v2-crop", text: "✅ Crop tool (CropTool + useCropTool)", priority: "P1" },
  { id: "v2-freeform", text: "✅ Freeform slicing (FreeformSlicing + useFreeformSlicing)", priority: "P1" },
  { id: "v2-bgremoval", text: "✅ Background removal tool (BackgroundRemovalTool)", priority: "P1" },
  { id: "v2-keyboard", text: "✅ Keyboard shortcuts (useKeyboardShortcuts hook)", priority: "P1" },
  { id: "v2-projects", text: "✅ Projects system (useProjects, ProjectsBar, ProjectView)", priority: "P1" },
  { id: "v2-dirhandle", text: "✅ Directory handle persistence (useDirectoryHandle + IndexedDB)", priority: "P1" },
  { id: "v2-errorlog", text: "✅ Error log with AI analyzer (ErrorLogPanel + edge function)", priority: "P1" },
];

export const categories: Category[] = [
  {
    title: "🔴 Slicing Gaps (Not Implemented)",
    items: [
      { id: "slice-3", text: "Manual slice boundary adjustment (drag edges to resize individual cells)", priority: "P2" },
      { id: "slice-smart", text: "Smart edge detection for irregular sprites (auto-detect boundaries)", priority: "P3" },
    ]
  },
  {
    title: "🔴 Library Gaps (Not Implemented)",
    items: [
      { id: "lib-7", text: "Bulk delete (multi-select → delete in one action)", priority: "P2" },
      { id: "lib-8", text: "Bulk tagging (apply tags to multiple sprites at once)", priority: "P2" },
      { id: "lib-drag", text: "Drag-to-reorder sprites in library grid", priority: "P3" },
      { id: "lib-duplicates", text: "Duplicate detection (visual hash comparison)", priority: "P3" },
    ]
  },
  {
    title: "🔴 AI Features (Not Implemented)",
    items: [
      { id: "ai-flux", text: "Connect EnhanceModal to real Flux AI image generation", priority: "P2" },
      { id: "ai-upscale", text: "AI upscaling for low-res sprites", priority: "P3" },
      { id: "ai-auto-slice", text: "AI-powered auto-detection of sprite boundaries", priority: "P3" },
    ]
  },
  {
    title: "🔴 Export Gaps (Not Implemented)",
    items: [
      { id: "export-unity", text: "Unity sprite sheet format export", priority: "P3" },
      { id: "export-godot", text: "Godot sprite sheet format export", priority: "P3" },
      { id: "export-trim", text: "Trim whitespace option for exports", priority: "P2" },
      { id: "export-binpack", text: "Optimal bin-packing algorithm for re-pack", priority: "P3" },
    ]
  },
  {
    title: "🔴 Cloud Features (Not Implemented)",
    items: [
      { id: "cloud-sync", text: "Supabase cloud sync for library (save sprites to DB)", priority: "P2" },
      { id: "cloud-share", text: "Shareable links for sprite packs", priority: "P3" },
      { id: "cloud-backup", text: "Automatic backup/versioning", priority: "P3" },
    ]
  },
  {
    title: "🟡 V3 MVP: Animation Timeline",
    items: [
      { id: "v3-timeline", text: "Timeline node for stitching sprites into animation sequences", priority: "V2" },
      { id: "v3-tweening", text: "Tweening engine for smooth sprite transitions", priority: "V2" },
      { id: "v3-loading", text: "Loading screen generator from sprite sequences", priority: "V2" },
      { id: "v3-preview", text: "Real-time animation preview player", priority: "V2" },
      { id: "v3-export-gif", text: "Export animations as GIF/WebM/sprite sheets", priority: "V2" },
    ]
  },
];

export const mobileIssues: MobileIssue[] = [
  { section: 'Library', issue: 'Thumbnail grid needs responsive columns', priority: 'P2', status: 'tracked' },
  { section: 'Library', issue: 'Drag-to-project not touch-friendly', priority: 'P3', status: 'tracked' },
  { section: 'Library', issue: 'Filter chips overflow on small screens', priority: 'P2', status: 'tracked' },
  { section: 'Splicing Mat', issue: 'Canvas gestures need touch support (pinch zoom, two-finger pan)', priority: 'P1', status: 'tracked' },
  { section: 'Splicing Mat', issue: 'Icon bar too small for touch targets (44px min)', priority: 'P1', status: 'tracked' },
  { section: 'Splicing Mat', issue: 'Elastic Grid fence handles too small', priority: 'P2', status: 'tracked' },
  { section: 'Splicing Mat', issue: "Grid Settings wheel-scroll won't work on touch", priority: 'P2', status: 'tracked' },
  { section: 'Mending Loom', issue: 'Timeline too cramped, needs horizontal scroll', priority: 'P1', status: 'tracked' },
  { section: 'Mending Loom', issue: 'Keyframe drag needs touch events', priority: 'P1', status: 'tracked' },
  { section: 'Mending Loom', issue: 'Preview panel aspect ratio breaks on portrait', priority: 'P2', status: 'tracked' },
  { section: 'Mending Loom', issue: 'Playback controls need larger touch targets', priority: 'P2', status: 'tracked' },
  { section: 'Animation Loom', issue: 'Thread rows too thin for touch', priority: 'P2', status: 'tracked' },
  { section: 'Animation Loom', issue: 'FPS slider needs touch-friendly alternative', priority: 'P3', status: 'tracked' },
  { section: 'General', issue: 'Keyboard shortcuts need on-screen alternatives', priority: 'P1', status: 'tracked' },
  { section: 'General', issue: 'Popovers need bottom-sheet alternative on mobile', priority: 'P2', status: 'tracked' },
  { section: 'General', issue: 'Panel dividers need swipe gestures', priority: 'P2', status: 'tracked' },
  { section: 'General', issue: 'Tab toggle needs swipeable tabs', priority: 'P3', status: 'tracked' },
];

export const aiFeatures: AIFeature[] = [
  {
    id: 'ai-1',
    feature: 'Generate Pose',
    location: 'GeneratePoseDialog → Library header',
    purpose: 'Create single sprite pose from text prompt',
    withoutAI: 'Button works but may fall back to stub placeholder',
    fallback: 'SVG placeholder with "AI Pose" text',
    apiUsed: 'generate-sprite → google/gemini-2.5-flash-image-preview',
  },
  {
    id: 'ai-2',
    feature: 'Generate Sheet',
    location: 'GenerateSheetDialog → Library header',
    purpose: 'Create sprite sheet from character + action description',
    withoutAI: 'Button works but may fall back to stub placeholder',
    fallback: 'SVG placeholder grid',
    apiUsed: 'generate-sprite → google/gemini-2.5-flash-image-preview',
  },
  {
    id: 'ai-3',
    feature: 'AI Error Analysis',
    location: 'ErrorLogPanel → Sparkle button per error',
    purpose: 'Analyze errors and suggest fixes',
    withoutAI: 'Shows "AI analysis unavailable" fallback',
    fallback: 'Manual error inspection',
    apiUsed: 'analyze-error → google/gemini-2.5-flash',
  },
  {
    id: 'ai-4',
    feature: 'Magic Wand (Boundary Detection)',
    location: 'SlicingToolbar → Magic button (DISABLED)',
    purpose: 'Auto-detect sprite boundaries on sheet',
    withoutAI: 'Button disabled with "Coming soon" tooltip',
    fallback: 'Manual grid configuration',
    apiUsed: 'NOT IMPLEMENTED - needs new edge function',
  },
  {
    id: 'ai-5',
    feature: 'AI Enhance',
    location: 'EnhanceModal → Library context menu',
    purpose: 'Upscale and improve sprite quality',
    withoutAI: 'Modal shows but action is STUBBED (setTimeout only)',
    fallback: 'No enhancement applied',
    apiUsed: 'NOT IMPLEMENTED - needs image editing API',
  },
  {
    id: 'ai-6',
    feature: 'AI Re-pack',
    location: 'PipelineVisualization (planned)',
    purpose: 'Optimize sprite sheet layout',
    withoutAI: 'Feature not available',
    fallback: 'Manual re-pack via Export Pack',
    apiUsed: 'NOT IMPLEMENTED',
  },
  {
    id: 'ai-7',
    feature: 'Batch AI Processing',
    location: 'SlicingToolbar → Batch Session modal',
    purpose: 'Process multiple sheets with AI detection',
    withoutAI: 'UI works but uses MOCK data (no real file picker)',
    fallback: 'Process sheets one at a time',
    apiUsed: 'NOT IMPLEMENTED - UI only',
  },
];
