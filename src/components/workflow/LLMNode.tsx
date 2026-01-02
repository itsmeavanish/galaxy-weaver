import { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Bot, X, Play, Loader2 } from 'lucide-react';
import { useWorkflowStore, NodeData } from '@/stores/workflowStore';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export const LLMNode = memo(({ id, data, selected }: NodeProps<NodeData>) => {
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
  const deleteNode = useWorkflowStore((state) => state.deleteNode);
  const getConnectedInputs = useWorkflowStore((state) => state.getConnectedInputs);
  const [isLoading, setIsLoading] = useState(false);

  const handleRun = async () => {
    setIsLoading(true);
    updateNodeData(id, { isLoading: true, output: '' });

    try {
      const { texts, images, systemPrompt } = getConnectedInputs(id);
      
      // Build the prompt from connected inputs
      const combinedText = texts.filter(Boolean).join('\n\n');
      const userMessage = data.userPrompt 
        ? `${data.userPrompt}\n\nContext:\n${combinedText}`
        : combinedText;

      // Simulate LLM call (replace with actual API call when backend is connected)
      // For now, we'll show a placeholder response
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      const mockResponse = `**Analysis Complete**

Based on the provided inputs${images.length > 0 ? ` and ${images.length} image(s)` : ''}:

${userMessage ? `Your request: "${userMessage.slice(0, 100)}..."` : 'No specific prompt provided.'}

${systemPrompt ? `\nSystem context applied: "${systemPrompt.slice(0, 50)}..."` : ''}

---

*Connect to Lovable Cloud to enable real AI processing with Google Gemini.*`;

      updateNodeData(id, { output: mockResponse, isLoading: false });
      toast.success('LLM execution complete!');
    } catch (error) {
      console.error('LLM Error:', error);
      toast.error('Failed to execute LLM');
      updateNodeData(id, { isLoading: false });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`node-card min-w-[320px] max-w-[380px] ${selected ? 'node-card-selected' : ''}`}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
            <Bot className="w-4 h-4 text-primary" />
          </div>
          <span className="font-medium text-sm text-foreground">
            {data.label || 'Run Any LLM'}
          </span>
        </div>
        <button
          onClick={() => deleteNode(id)}
          className="p-1.5 rounded-md hover:bg-muted transition-colors"
        >
          <X className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>
      
      {/* Input Handles */}
      <Handle
        type="target"
        position={Position.Left}
        id="system_prompt"
        style={{ top: '25%' }}
        className="!w-3 !h-3 !bg-amber-400 !border-2 !border-background"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="user_message"
        style={{ top: '50%' }}
        className="!w-3 !h-3 !bg-primary !border-2 !border-background"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="images"
        style={{ top: '75%' }}
        className="!w-3 !h-3 !bg-emerald-400 !border-2 !border-background"
      />

      <div className="p-4 space-y-3">
        {/* Handle labels */}
        <div className="flex flex-col gap-1 text-xs text-muted-foreground -ml-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <span>system_prompt</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span>user_message</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>images</span>
          </div>
        </div>

        <Textarea
          placeholder="Enter your prompt here..."
          value={data.userPrompt || ''}
          onChange={(e) => updateNodeData(id, { userPrompt: e.target.value })}
          className="min-h-[80px] bg-muted/50 border-border/50 resize-none text-sm"
        />

        <Button
          onClick={handleRun}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Run
            </>
          )}
        </Button>

        {data.output && (
          <div className="mt-3 p-3 bg-muted/30 rounded-lg border border-border/50 max-h-[150px] overflow-y-auto">
            <p className="text-xs text-muted-foreground mb-1">Output:</p>
            <p className="text-sm whitespace-pre-wrap">{data.output}</p>
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-primary !border-2 !border-background"
      />
    </div>
  );
});

LLMNode.displayName = 'LLMNode';
