import { create } from 'zustand';
import { temporal } from 'zundo';
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  MarkerType,
} from 'reactflow';
import { supabase } from '@/integrations/supabase/client';

export type NodeData = {
  label?: string;
  content?: string;
  images?: string[];
  systemPrompt?: string;
  userPrompt?: string;
  output?: string;
  isLoading?: boolean;
  hasError?: boolean;
};

export type WorkflowNode = Node<NodeData>;

type WorkflowState = {
  nodes: WorkflowNode[];
  edges: Edge[];
  runningNodes: Set<string>;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (node: WorkflowNode) => void;
  duplicateNode: (nodeId: string) => void;
  updateNodeData: (nodeId: string, data: Partial<NodeData>) => void;
  deleteNode: (nodeId: string) => void;
  getUpstreamData: (nodeId: string) => { texts: string[]; images: string[]; systemPrompt?: string };
  runLLMNode: (nodeId: string) => Promise<void>;
  resetWorkflow: () => void;
  loadSampleWorkflow: () => void;
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => boolean;
  exportToJSON: () => string;
};

const defaultEdgeOptions = {
  type: 'animated',
  markerEnd: { type: MarkerType.ArrowClosed },
  style: { stroke: 'hsl(263, 70%, 58%)', strokeWidth: 2 },
};

// DFS to collect all upstream nodes
function collectUpstreamNodes(
  nodeId: string,
  nodes: WorkflowNode[],
  edges: Edge[],
  visited: Set<string> = new Set()
): { texts: string[]; images: string[]; systemPrompt?: string } {
  if (visited.has(nodeId)) {
    return { texts: [], images: [] };
  }
  visited.add(nodeId);

  const result: { texts: string[]; images: string[]; systemPrompt?: string } = {
    texts: [],
    images: [],
  };

  const incomingEdges = edges.filter((edge) => edge.target === nodeId);

  for (const edge of incomingEdges) {
    const sourceNode = nodes.find((n) => n.id === edge.source);
    if (!sourceNode) continue;

    // Recursively collect from upstream nodes
    const upstream = collectUpstreamNodes(sourceNode.id, nodes, edges, visited);
    result.texts.push(...upstream.texts);
    result.images.push(...upstream.images);
    if (upstream.systemPrompt) result.systemPrompt = upstream.systemPrompt;

    // Add current node's data based on handle
    if (sourceNode.type === 'textInput') {
      if (edge.targetHandle === 'system_prompt') {
        result.systemPrompt = sourceNode.data.content || '';
      } else {
        if (sourceNode.data.content) {
          result.texts.push(sourceNode.data.content);
        }
      }
    } else if (sourceNode.type === 'imageUpload') {
      result.images.push(...(sourceNode.data.images || []));
    } else if (sourceNode.type === 'llmNode') {
      if (sourceNode.data.output) {
        result.texts.push(sourceNode.data.output);
      }
    }
  }

  return result;
}

export const useWorkflowStore = create<WorkflowState>()(
  temporal(
    (set, get) => ({
      nodes: [],
      edges: [],
      runningNodes: new Set(),

      onNodesChange: (changes) => {
        set({
          nodes: applyNodeChanges(changes, get().nodes),
        });
      },

      onEdgesChange: (changes) => {
        set({
          edges: applyEdgeChanges(changes, get().edges),
        });
      },

      onConnect: (connection) => {
        set({
          edges: addEdge(
            { ...connection, ...defaultEdgeOptions },
            get().edges
          ),
        });
      },

      addNode: (node) => {
        set({
          nodes: [...get().nodes, node],
        });
      },

      duplicateNode: (nodeId) => {
        const node = get().nodes.find((n) => n.id === nodeId);
        if (!node) return;

        const newId = `${node.type}-${Date.now()}`;
        const newNode: WorkflowNode = {
          ...node,
          id: newId,
          position: {
            x: node.position.x + 50,
            y: node.position.y + 50,
          },
          data: { ...node.data, output: undefined, isLoading: false, hasError: false },
          selected: false,
        };

        set({
          nodes: [...get().nodes, newNode],
        });
      },

      updateNodeData: (nodeId, data) => {
        set({
          nodes: get().nodes.map((node) =>
            node.id === nodeId
              ? { ...node, data: { ...node.data, ...data } }
              : node
          ),
        });
      },

      deleteNode: (nodeId) => {
        set({
          nodes: get().nodes.filter((node) => node.id !== nodeId),
          edges: get().edges.filter(
            (edge) => edge.source !== nodeId && edge.target !== nodeId
          ),
        });
      },

      getUpstreamData: (nodeId) => {
        const { nodes, edges } = get();
        return collectUpstreamNodes(nodeId, nodes, edges);
      },

      runLLMNode: async (nodeId) => {
        const { nodes, edges, updateNodeData, runningNodes } = get();
        const node = nodes.find((n) => n.id === nodeId);
        if (!node) return;

        // Mark node as running
        const newRunning = new Set(runningNodes);
        newRunning.add(nodeId);
        set({ runningNodes: newRunning });

        updateNodeData(nodeId, { isLoading: true, hasError: false, output: '' });

        try {
          // DFS to collect all upstream data
          const { texts, images, systemPrompt } = collectUpstreamNodes(nodeId, nodes, edges);

          // Build the prompt
          const combinedText = texts.filter(Boolean).join('\n\n');
          const userPrompt = node.data.userPrompt || '';
          const fullPrompt = userPrompt
            ? `${userPrompt}\n\nContext:\n${combinedText}`
            : combinedText || 'Please provide a response.';

          console.log('Running LLM with:', {
            promptLength: fullPrompt.length,
            imageCount: images.length,
            hasSystem: !!systemPrompt,
          });

          // Call the edge function
          const { data, error } = await supabase.functions.invoke('generate', {
            body: {
              prompt: fullPrompt,
              systemInstruction: systemPrompt,
              images: images.length > 0 ? images : undefined,
            },
          });

          if (error) {
            throw new Error(error.message || 'Failed to generate response');
          }

          if (data?.error) {
            throw new Error(data.error);
          }

          updateNodeData(nodeId, { 
            output: data.text, 
            isLoading: false,
            hasError: false 
          });
        } catch (error) {
          console.error('LLM Error:', error);
          updateNodeData(nodeId, {
            output: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            isLoading: false,
            hasError: true,
          });
        } finally {
          const updated = new Set(get().runningNodes);
          updated.delete(nodeId);
          set({ runningNodes: updated });
        }
      },

      resetWorkflow: () => {
        set({ nodes: [], edges: [], runningNodes: new Set() });
      },

      loadSampleWorkflow: () => {
        const sampleNodes: WorkflowNode[] = [
          {
            id: 'image-1',
            type: 'imageUpload',
            position: { x: 50, y: 50 },
            data: { label: 'Product Photo 1' },
          },
          {
            id: 'image-2',
            type: 'imageUpload',
            position: { x: 50, y: 220 },
            data: { label: 'Product Photo 2' },
          },
          {
            id: 'text-system',
            type: 'textInput',
            position: { x: 50, y: 390 },
            data: {
              label: 'System Prompt',
              content: 'You are a professional product analyst. Analyze images and provide detailed product descriptions.',
            },
          },
          {
            id: 'text-specs',
            type: 'textInput',
            position: { x: 50, y: 560 },
            data: {
              label: 'Product Specs',
              content: 'Product: Premium Wireless Headphones\nBrand: AudioMax Pro\nFeatures: Active Noise Cancellation, 40hr battery',
            },
          },
          {
            id: 'llm-analyze',
            type: 'llmNode',
            position: { x: 400, y: 200 },
            data: {
              label: 'Analyze Product',
              userPrompt: 'Analyze the product images and specs, then create a comprehensive product analysis.',
            },
          },
          {
            id: 'llm-amazon',
            type: 'llmNode',
            position: { x: 750, y: 50 },
            data: {
              label: 'Amazon Listing',
              userPrompt: 'Based on the analysis, write a compelling Amazon product listing with bullet points.',
            },
          },
          {
            id: 'llm-instagram',
            type: 'llmNode',
            position: { x: 750, y: 250 },
            data: {
              label: 'Instagram Caption',
              userPrompt: 'Based on the analysis, write an engaging Instagram caption with relevant hashtags.',
            },
          },
          {
            id: 'llm-seo',
            type: 'llmNode',
            position: { x: 750, y: 450 },
            data: {
              label: 'SEO Description',
              userPrompt: 'Based on the analysis, write an SEO-optimized meta description under 160 characters.',
            },
          },
        ];

        const sampleEdges: Edge[] = [
          { id: 'e1', source: 'image-1', target: 'llm-analyze', targetHandle: 'images', ...defaultEdgeOptions },
          { id: 'e2', source: 'image-2', target: 'llm-analyze', targetHandle: 'images', ...defaultEdgeOptions },
          { id: 'e3', source: 'text-system', target: 'llm-analyze', targetHandle: 'system_prompt', ...defaultEdgeOptions },
          { id: 'e4', source: 'text-specs', target: 'llm-analyze', targetHandle: 'user_message', ...defaultEdgeOptions },
          { id: 'e5', source: 'llm-analyze', target: 'llm-amazon', targetHandle: 'user_message', ...defaultEdgeOptions },
          { id: 'e6', source: 'llm-analyze', target: 'llm-instagram', targetHandle: 'user_message', ...defaultEdgeOptions },
          { id: 'e7', source: 'llm-analyze', target: 'llm-seo', targetHandle: 'user_message', ...defaultEdgeOptions },
        ];

        set({ nodes: sampleNodes, edges: sampleEdges });
      },

      saveToLocalStorage: () => {
        const { nodes, edges } = get();
        const workflow = { nodes, edges, savedAt: new Date().toISOString() };
        localStorage.setItem('weavy-workflow', JSON.stringify(workflow));
      },

      loadFromLocalStorage: () => {
        try {
          const saved = localStorage.getItem('weavy-workflow');
          if (saved) {
            const { nodes, edges } = JSON.parse(saved);
            set({ nodes, edges });
            return true;
          }
        } catch (e) {
          console.error('Failed to load workflow:', e);
        }
        return false;
      },

      exportToJSON: () => {
        const { nodes, edges } = get();
        return JSON.stringify({ nodes, edges, exportedAt: new Date().toISOString() }, null, 2);
      },
    }),
    {
      limit: 50, // Keep 50 history states
      partialize: (state) => ({
        nodes: state.nodes,
        edges: state.edges,
      }),
    }
  )
);

// Export temporal store for undo/redo
export const useTemporalStore = () => useWorkflowStore.temporal.getState();
