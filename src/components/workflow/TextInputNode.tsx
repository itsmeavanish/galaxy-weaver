import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Type, X, Copy } from 'lucide-react';
import { useWorkflowStore, NodeData } from '@/stores/workflowStore';
import { Textarea } from '@/components/ui/textarea';

export const TextInputNode = memo(({ id, data, selected }: NodeProps<NodeData>) => {
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
  const deleteNode = useWorkflowStore((state) => state.deleteNode);
  const duplicateNode = useWorkflowStore((state) => state.duplicateNode);

  return (
    <div className={`node-card min-w-[280px] ${selected ? 'node-card-selected' : ''}`}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-glow/20 flex items-center justify-center">
            <Type className="w-4 h-4 text-cyan-glow" />
          </div>
          <span className="font-medium text-sm text-foreground">
            {data.label || 'Text Input'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => duplicateNode(id)}
            className="p-1.5 rounded-md hover:bg-muted transition-colors"
            title="Duplicate node"
          >
            <Copy className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <button
            onClick={() => deleteNode(id)}
            className="p-1.5 rounded-md hover:bg-muted transition-colors"
          >
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>
      
      <div className="p-4">
        <Textarea
          placeholder="Enter your text here..."
          value={data.content || ''}
          onChange={(e) => updateNodeData(id, { content: e.target.value })}
          className="min-h-[100px] bg-muted/50 border-border/50 resize-none text-sm nodrag"
        />
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-cyan-glow !border-2 !border-background"
      />
    </div>
  );
});

TextInputNode.displayName = 'TextInputNode';
