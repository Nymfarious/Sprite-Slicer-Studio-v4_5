import { useState } from 'react';
import { Upload, Grid3X3, Scissors, Package, Download, Sparkles, Wand2, RefreshCw } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface PipelineNode {
  id: string;
  label: string;
  icon: React.ReactNode;
  status: 'idle' | 'active' | 'complete';
  description: string;
  onClick?: () => void;
}

interface PipelineVisualizationProps {
  onNodeClick?: (nodeId: string) => void;
}

export function PipelineVisualization({ onNodeClick }: PipelineVisualizationProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const mainFlow: PipelineNode[] = [
    {
      id: 'upload',
      label: 'Upload',
      icon: <Upload className="w-4 h-4" />,
      status: 'complete',
      description: 'Drag & drop sprite sheet (PNG, JPG, WebP)',
    },
    {
      id: 'grid',
      label: 'Configure',
      icon: <Grid3X3 className="w-4 h-4" />,
      status: 'complete',
      description: 'Set grid dimensions, offset, spacing',
    },
    {
      id: 'slice',
      label: 'Slice',
      icon: <Scissors className="w-4 h-4" />,
      status: 'complete',
      description: 'Select cells and extract sprites',
    },
    {
      id: 'library',
      label: 'Library',
      icon: <Package className="w-4 h-4" />,
      status: 'complete',
      description: 'Manage, tag, and organize sprites',
    },
    {
      id: 'export',
      label: 'Export',
      icon: <Download className="w-4 h-4" />,
      status: 'complete',
      description: 'Download PNG, ZIP, or JSON atlas',
    },
  ];

  const aiNodes: PipelineNode[] = [
    {
      id: 'ai-detect',
      label: 'Magic Wand',
      icon: <Wand2 className="w-4 h-4" />,
      status: 'idle',
      description: 'AI auto-detect sprite boundaries (coming v5)',
    },
    {
      id: 'ai-enhance',
      label: 'Enhance',
      icon: <Sparkles className="w-4 h-4" />,
      status: 'idle',
      description: 'AI upscale and improve sprites (stubbed)',
    },
    {
      id: 'ai-repack',
      label: 'Re-pack',
      icon: <RefreshCw className="w-4 h-4" />,
      status: 'idle',
      description: 'Combine sprites into optimized sheet',
    },
  ];

  const getStatusColor = (status: PipelineNode['status']) => {
    switch (status) {
      case 'complete': return 'bg-success text-success-foreground border-success';
      case 'active': return 'bg-primary text-primary-foreground border-primary animate-pulse';
      case 'idle': return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusBg = (status: PipelineNode['status']) => {
    switch (status) {
      case 'complete': return 'bg-success/10';
      case 'active': return 'bg-primary/10';
      case 'idle': return 'bg-muted/30';
    }
  };

  const getConnectorColor = (fromStatus: PipelineNode['status'], toStatus: PipelineNode['status']) => {
    if (fromStatus === 'complete' && (toStatus === 'complete' || toStatus === 'active')) {
      return 'bg-success';
    }
    return 'bg-border';
  };

  return (
    <div className="space-y-6">
      {/* Main Pipeline */}
      <div>
        <h4 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
          Main Workflow
        </h4>
        <div className="flex items-center justify-between relative">
          {mainFlow.map((node, index) => (
            <div key={node.id} className="flex items-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className={`
                      relative flex flex-col items-center gap-1 p-2 rounded-lg
                      transition-all duration-200 cursor-pointer
                      ${getStatusBg(node.status)}
                      ${hoveredNode === node.id ? 'scale-110 shadow-lg' : ''}
                    `}
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    onClick={() => onNodeClick?.(node.id)}
                  >
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center
                      border-2 transition-all
                      ${getStatusColor(node.status)}
                    `}>
                      {node.icon}
                    </div>
                    <span className="text-[10px] font-medium">{node.label}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[200px]">
                  <p className="font-medium">{node.label}</p>
                  <p className="text-xs text-muted-foreground">{node.description}</p>
                </TooltipContent>
              </Tooltip>

              {/* Connector */}
              {index < mainFlow.length - 1 && (
                <div className={`
                  h-0.5 w-8 mx-1 rounded-full transition-colors
                  ${getConnectorColor(mainFlow[index].status, mainFlow[index + 1].status)}
                `} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* AI Integration Points */}
      <div>
        <h4 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
          AI Features
        </h4>
        <div className="flex items-center gap-4">
          {aiNodes.map((node) => (
            <Tooltip key={node.id}>
              <TooltipTrigger asChild>
                <button
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg
                    border transition-all duration-200 cursor-pointer
                    ${getStatusBg(node.status)}
                    ${node.status === 'complete' ? 'border-success/50' : 'border-border/50'}
                    ${hoveredNode === node.id ? 'scale-105 shadow-md' : ''}
                  `}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => onNodeClick?.(node.id)}
                >
                  <div className={`
                    w-6 h-6 rounded flex items-center justify-center
                    ${node.status === 'complete' ? 'text-success' : 'text-muted-foreground'}
                  `}>
                    {node.icon}
                  </div>
                  <span className="text-xs font-medium">{node.label}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[200px]">
                <p className="font-medium">{node.label}</p>
                <p className="text-xs text-muted-foreground">{node.description}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-[10px] text-muted-foreground pt-2 border-t border-border">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-success" />
          <span>Complete</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span>Active</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-muted" />
          <span>Pending</span>
        </div>
        <span className="ml-auto italic">Click nodes to jump to features</span>
      </div>
    </div>
  );
}
