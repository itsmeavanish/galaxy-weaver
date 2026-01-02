import { useCallback, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useWorkflowStore } from '@/stores/workflowStore';
import { TextInputNode } from './TextInputNode';
import { ImageUploadNode } from './ImageUploadNode';
import { LLMNode } from './LLMNode';
import { AnimatedEdge } from './AnimatedEdge';

const nodeTypes = {
  textInput: TextInputNode,
  imageUpload: ImageUploadNode,
  llmNode: LLMNode,
};

const edgeTypes = {
  animated: AnimatedEdge,
};

export function WorkflowCanvas() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, loadSampleWorkflow } =
    useWorkflowStore();
  const { addNode } = useWorkflowStore();
  const reactFlowInstance = useReactFlow();

  useEffect(() => {
    // Load sample workflow on mount if empty
    if (nodes.length === 0) {
      loadSampleWorkflow();
      // Fit view after a short delay to ensure nodes are rendered
      setTimeout(() => {
        reactFlowInstance.fitView({ padding: 0.2 });
      }, 100);
    }
  }, []);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const id = `${type}-${Date.now()}`;
      addNode({
        id,
        type,
        position,
        data: {
          label:
            type === 'textInput'
              ? 'Text Input'
              : type === 'imageUpload'
              ? 'Image Upload'
              : 'LLM Node',
        },
      });
    },
    [reactFlowInstance, addNode]
  );

  return (
    <div className="flex-1 h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={{ type: 'animated' }}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        proOptions={{ hideAttribution: true }}
        className="bg-background"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="hsl(222, 47%, 15%)"
        />
        <Controls className="!bg-card !border-border" />
        <MiniMap
          nodeColor={(node) => {
            switch (node.type) {
              case 'textInput':
                return 'hsl(192, 91%, 51%)';
              case 'imageUpload':
                return 'hsl(142, 71%, 45%)';
              case 'llmNode':
                return 'hsl(263, 70%, 58%)';
              default:
                return 'hsl(222, 47%, 30%)';
            }
          }}
          maskColor="hsl(222, 47%, 4%, 0.8)"
          className="!bg-card"
        />
      </ReactFlow>
    </div>
  );
}
