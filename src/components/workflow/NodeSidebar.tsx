import { Type, Image, Bot, Zap, ChevronDown } from 'lucide-react';
import { useWorkflowStore } from '@/stores/workflowStore';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useState } from 'react';

const nodeTypes = [
  {
    category: 'Inputs',
    items: [
      {
        type: 'textInput',
        label: 'Text Node',
        icon: Type,
        color: 'bg-cyan-glow/20',
        iconColor: 'text-cyan-glow',
        description: 'Text input for prompts',
      },
      {
        type: 'imageUpload',
        label: 'Image Node',
        icon: Image,
        color: 'bg-emerald-500/20',
        iconColor: 'text-emerald-400',
        description: 'Upload images for vision',
      },
    ],
  },
  {
    category: 'Logic',
    items: [
      {
        type: 'llmNode',
        label: 'Run Any LLM',
        icon: Bot,
        color: 'bg-gradient-to-br from-primary/30 to-accent/30',
        iconColor: 'text-primary',
        description: 'Execute AI model',
      },
    ],
  },
];

export function NodeSidebar() {
  const addNode = useWorkflowStore((state) => state.addNode);
  const nodes = useWorkflowStore((state) => state.nodes);
  const [openCategories, setOpenCategories] = useState(['Inputs', 'Logic']);

  const handleAddNode = (type: string) => {
    const id = `${type}-${Date.now()}`;
    const offset = nodes.length * 20;
    
    addNode({
      id,
      type,
      position: { x: 300 + offset, y: 200 + offset },
      data: { label: type === 'textInput' ? 'Text Input' : type === 'imageUpload' ? 'Image Upload' : 'LLM Node' },
    });
  };

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-64 h-full bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-border flex items-center justify-center">
            <Zap className="w-4 h-4 text-background" />
          </div>
          <div>
            <h1 className="font-bold text-foreground">Weavy.ai</h1>
            <p className="text-xs text-muted-foreground">Workflow Builder</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Quick Access
          </h2>
          
          {nodeTypes.map((category) => (
            <Collapsible
              key={category.category}
              open={openCategories.includes(category.category)}
              onOpenChange={(open) => {
                if (open) {
                  setOpenCategories([...openCategories, category.category]);
                } else {
                  setOpenCategories(openCategories.filter((c) => c !== category.category));
                }
              }}
              className="mb-3"
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-muted/50 transition-colors text-sm font-medium text-foreground">
                {category.category}
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${
                  openCategories.includes(category.category) ? 'rotate-180' : ''
                }`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 mt-2">
                {category.items.map((node) => (
                  <div
                    key={node.type}
                    draggable
                    onDragStart={(e) => onDragStart(e, node.type)}
                    onClick={() => handleAddNode(node.type)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-card/50 border border-border/50 cursor-grab hover:border-primary/50 hover:bg-muted/30 transition-all active:cursor-grabbing group"
                  >
                    <div className={`w-10 h-10 rounded-lg ${node.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <node.icon className={`w-5 h-5 ${node.iconColor}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{node.label}</p>
                      <p className="text-xs text-muted-foreground">{node.description}</p>
                    </div>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-sidebar-border">
        <p className="text-xs text-muted-foreground text-center">
          Drag nodes to canvas or click to add
        </p>
      </div>
    </aside>
  );
}
