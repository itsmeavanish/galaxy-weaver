import { create } from 'zustand';
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

export type NodeData = {
  label?: string;
  content?: string;
  images?: string[];
  systemPrompt?: string;
  userPrompt?: string;
  output?: string;
  isLoading?: boolean;
};

export type WorkflowNode = Node<NodeData>;

type WorkflowState = {
  nodes: WorkflowNode[];
  edges: Edge[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (node: WorkflowNode) => void;
  updateNodeData: (nodeId: string, data: Partial<NodeData>) => void;
  deleteNode: (nodeId: string) => void;
  getConnectedInputs: (nodeId: string) => { texts: string[]; images: string[]; systemPrompt?: string };
  resetWorkflow: () => void;
  loadSampleWorkflow: () => void;
};

const defaultEdgeOptions = {
  type: 'animated',
  markerEnd: { type: MarkerType.ArrowClosed },
  style: { stroke: 'hsl(263, 70%, 58%)', strokeWidth: 2 },
};

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  nodes: [],
  edges: [],

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

  getConnectedInputs: (nodeId) => {
    const { nodes, edges } = get();
    const texts: string[] = [];
    const images: string[] = [];
    let systemPrompt: string | undefined;

    const incomingEdges = edges.filter((edge) => edge.target === nodeId);

    incomingEdges.forEach((edge) => {
      const sourceNode = nodes.find((n) => n.id === edge.source);
      if (!sourceNode) return;

      if (sourceNode.type === 'textInput') {
        if (edge.targetHandle === 'system_prompt') {
          systemPrompt = sourceNode.data.content || '';
        } else {
          texts.push(sourceNode.data.content || '');
        }
      } else if (sourceNode.type === 'imageUpload') {
        images.push(...(sourceNode.data.images || []));
      } else if (sourceNode.type === 'llmNode') {
        texts.push(sourceNode.data.output || '');
      }
    });

    return { texts, images, systemPrompt };
  },

  resetWorkflow: () => {
    set({ nodes: [], edges: [] });
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
          content: 'You are a professional product analyst. Analyze images and provide detailed product descriptions.'
        },
      },
      {
        id: 'text-specs',
        type: 'textInput',
        position: { x: 50, y: 560 },
        data: { 
          label: 'Product Specs',
          content: 'Product: Premium Wireless Headphones\nBrand: AudioMax Pro\nFeatures: Active Noise Cancellation, 40hr battery'
        },
      },
      {
        id: 'llm-analyze',
        type: 'llmNode',
        position: { x: 400, y: 200 },
        data: { 
          label: 'Analyze Product',
          systemPrompt: '',
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
}));
