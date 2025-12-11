import { useCallback, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  Position,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { X, Upload, Grid3X3, Package, Download, Settings, FolderOpen, Sparkles, Tag, Scissors, Layers, Image, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ResizableOverlayPanel } from '@/components/ResizableOverlayPanel';
import { toast } from 'sonner';

// Custom Node Component
interface CustomNodeData {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
  color?: string;
  link?: string;
}

function CustomNode({ data }: { data: CustomNodeData }) {
  const Icon = data.icon;
  
  return (
    <div 
      className="px-4 py-3 rounded-lg bg-card border-2 shadow-lg min-w-[140px] transition-all hover:shadow-xl hover:scale-105"
      style={{ borderColor: data.color || 'hsl(var(--border))' }}
    >
      <div className="flex items-center gap-2">
        {Icon && (
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: data.color ? `${data.color}20` : 'hsl(var(--muted))' }}
          >
            <Icon className="h-4 w-4" />
          </div>
        )}
        <span className="font-semibold text-sm text-foreground">{data.label}</span>
      </div>
      {data.description && (
        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{data.description}</p>
      )}
    </div>
  );
}

// Node types registration
const nodeTypes = { custom: CustomNode };

// Default edge options
const defaultEdgeOptions = {
  type: 'smoothstep',
  animated: true,
  style: { stroke: 'hsl(var(--primary))', strokeWidth: 2 },
  markerEnd: { type: MarkerType.ArrowClosed, color: 'hsl(var(--primary))' },
};

// App flow nodes
const createNodes = (): Node<CustomNodeData>[] => [
  // Row 1: Main Flow
  {
    id: 'upload',
    type: 'custom',
    position: { x: 0, y: 0 },
    data: { 
      label: 'Upload', 
      icon: Upload, 
      description: 'Import sprite sheet (PNG, JPG, WebP)',
      color: '#10b981'
    },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  {
    id: 'preview',
    type: 'custom',
    position: { x: 220, y: 0 },
    data: { 
      label: 'Preview', 
      icon: Image, 
      description: 'View with grid overlay',
      color: '#6366f1'
    },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  {
    id: 'slice',
    type: 'custom',
    position: { x: 440, y: 0 },
    data: { 
      label: 'Slice', 
      icon: Scissors, 
      description: 'Cut into individual sprites',
      color: '#f59e0b'
    },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  {
    id: 'library',
    type: 'custom',
    position: { x: 660, y: 0 },
    data: { 
      label: 'Library', 
      icon: Package, 
      description: 'Manage sprite assets',
      color: '#8b5cf6'
    },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },
  {
    id: 'export',
    type: 'custom',
    position: { x: 880, y: 0 },
    data: { 
      label: 'Export', 
      icon: Download, 
      description: 'Save individual or pack',
      color: '#ef4444'
    },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  },

  // Row 2: Editor Features
  {
    id: 'grid',
    type: 'custom',
    position: { x: 100, y: 150 },
    data: { 
      label: 'Grid Controls', 
      icon: Grid3X3, 
      description: 'Rows, columns, spacing, offset',
      color: '#06b6d4'
    },
    sourcePosition: Position.Right,
    targetPosition: Position.Top,
  },
  {
    id: 'freeform',
    type: 'custom',
    position: { x: 320, y: 150 },
    data: { 
      label: 'Freeform Slice', 
      icon: Layers, 
      description: 'Draw custom selection boxes',
      color: '#ec4899'
    },
    sourcePosition: Position.Right,
    targetPosition: Position.Top,
  },

  // Row 3: Library Features
  {
    id: 'tags',
    type: 'custom',
    position: { x: 550, y: 150 },
    data: { 
      label: 'Tags', 
      icon: Tag, 
      description: 'Organize with custom tags',
      color: '#14b8a6'
    },
    sourcePosition: Position.Right,
    targetPosition: Position.Top,
  },
  {
    id: 'projects',
    type: 'custom',
    position: { x: 770, y: 150 },
    data: { 
      label: 'Projects', 
      icon: FolderOpen, 
      description: 'Group into folders',
      color: '#f97316'
    },
    sourcePosition: Position.Right,
    targetPosition: Position.Top,
  },

  // Row 4: Enhancement & Settings
  {
    id: 'enhance',
    type: 'custom',
    position: { x: 660, y: 280 },
    data: { 
      label: 'AI Enhance', 
      icon: Sparkles, 
      description: 'Upscale and improve',
      color: '#eab308'
    },
    sourcePosition: Position.Right,
    targetPosition: Position.Top,
  },
  {
    id: 'preferences',
    type: 'custom',
    position: { x: 880, y: 150 },
    data: { 
      label: 'Preferences', 
      icon: Settings, 
      description: 'App settings & tag manager',
      color: '#64748b'
    },
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
  },
];

const createEdges = (): Edge[] => [
  { id: 'e-upload-preview', source: 'upload', target: 'preview' },
  { id: 'e-preview-slice', source: 'preview', target: 'slice' },
  { id: 'e-slice-library', source: 'slice', target: 'library' },
  { id: 'e-library-export', source: 'library', target: 'export' },
  { id: 'e-grid-preview', source: 'grid', target: 'preview', animated: false, style: { strokeDasharray: '5,5' } },
  { id: 'e-freeform-slice', source: 'freeform', target: 'slice', animated: false, style: { strokeDasharray: '5,5' } },
  { id: 'e-tags-library', source: 'tags', target: 'library', animated: false, style: { strokeDasharray: '5,5' } },
  { id: 'e-projects-library', source: 'projects', target: 'library', animated: false, style: { strokeDasharray: '5,5' } },
  { id: 'e-enhance-library', source: 'enhance', target: 'library', animated: false, style: { strokeDasharray: '5,5' } },
  { id: 'e-prefs-export', source: 'preferences', target: 'export', animated: false, style: { strokeDasharray: '5,5' } },
];

interface FlowchartPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (target: string) => void;
}

export function FlowchartPanel({ isOpen, onClose, onNavigate }: FlowchartPanelProps) {
  const initialNodes = useMemo(() => createNodes(), []);
  const initialEdges = useMemo(() => createEdges(), []);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node<CustomNodeData>) => {
    // Navigate to the feature area when clicking a node
    if (onNavigate) {
      onNavigate(node.id);
    }
    toast.success(`Navigated to ${node.data.label}`, {
      description: node.data.description,
    });
  }, [onNavigate]);

  return (
    <ResizableOverlayPanel
      isOpen={isOpen}
      onClose={onClose}
      defaultWidth={800}
      minWidth={600}
      maxWidth={90}
    >
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold text-lg">App Navigation Flow</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* ReactFlow Canvas */}
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            defaultEdgeOptions={defaultEdgeOptions}
            fitView
            fitViewOptions={{ padding: 0.3 }}
            minZoom={0.3}
            maxZoom={2}
            attributionPosition="bottom-left"
            className="bg-background"
          >
            <Background 
              variant={BackgroundVariant.Dots} 
              gap={20} 
              size={1} 
              color="hsl(var(--muted-foreground) / 0.2)"
            />
            <Controls 
              className="[&>button]:bg-card [&>button]:border-border [&>button]:text-foreground [&>button:hover]:bg-accent"
            />
          </ReactFlow>
        </div>

        {/* Legend */}
        <div className="p-3 border-t border-border bg-card/50">
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-primary" />
              <span>Main flow (animated)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 border-t-2 border-dashed border-primary" />
              <span>Feature connection</span>
            </div>
            <span className="ml-auto text-muted-foreground/60">Click nodes for details • Drag to pan • Scroll to zoom</span>
          </div>
        </div>
      </div>
    </ResizableOverlayPanel>
  );
}
