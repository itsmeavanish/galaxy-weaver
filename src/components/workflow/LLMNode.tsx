import { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Bot, X, Play, Loader2, Copy } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useWorkflowStore, NodeData } from '@/stores/workflowStore';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export const LLMNode = memo(({ id, data, selected }: NodeProps<NodeData>) => {
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
  const deleteNode = useWorkflowStore((state) => state.deleteNode);
  const duplicateNode = useWorkflowStore((state) => state.duplicateNode);
  const runLLMNode = useWorkflowStore((state) => state.runLLMNode);
  const runningNodes = useWorkflowStore((state) => state.runningNodes);
  
  const isLoading = runningNodes.has(id) || data.isLoading;

  const handleRun = async () => {
    toast.info('Running LLM...');
    await runLLMNode(id);
    if (!data.hasError) {
      toast.success('LLM execution complete!');
    } else {
      toast.error('LLM execution failed');
    }
  };

  return (
    <div className={`node-card min-w-[320px] max-w-[400px] ${selected ? 'node-card-selected' : ''} ${data.hasError ? 'border-destructive/60' : ''}`}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
            <Bot className="w-4 h-4 text-primary" />
          </div>
          <span className="font-medium text-sm text-foreground">
            {data.label || 'Run Any LLM'}
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

      {/* Input Handles */}
      <Handle
        type="target"
        position={Position.Left}
        id="system_prompt"
        style={{ top: '30%' }}
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
        style={{ top: '70%' }}
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
          className="min-h-[80px] bg-muted/50 border-border/50 resize-none text-sm nodrag"
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
          <div className={`mt-3 p-3 bg-muted/30 rounded-lg border max-h-[200px] overflow-y-auto nodrag ${data.hasError ? 'border-destructive/50' : 'border-border/50'}`}>
            <p className="text-xs text-muted-foreground mb-2">Output:</p>
            <div className="prose prose-sm prose-invert max-w-none text-sm">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                  code: ({ children }) => (
                    <code className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono text-primary">
                      {children}
                    </code>
                  ),
                  pre: ({ children }) => (
                    <pre className="p-2 bg-muted rounded-lg overflow-x-auto text-xs">
                      {children}
                    </pre>
                  ),
                  ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                  li: ({ children }) => <li className="text-sm">{children}</li>,
                  h1: ({ children }) => <h1 className="text-base font-bold mb-2">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-sm font-bold mb-1">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-sm font-semibold mb-1">{children}</h3>,
                }}
              >
                {data.output}
              </ReactMarkdown>
            </div>
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
