import { memo, useCallback } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Image, X, Upload, Copy } from 'lucide-react';
import { useWorkflowStore, NodeData } from '@/stores/workflowStore';

export const ImageUploadNode = memo(({ id, data, selected }: NodeProps<NodeData>) => {
  const updateNodeData = useWorkflowStore((state) => state.updateNodeData);
  const deleteNode = useWorkflowStore((state) => state.deleteNode);
  const duplicateNode = useWorkflowStore((state) => state.duplicateNode);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith('image/')
      );
      
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          updateNodeData(id, {
            images: [...(data.images || []), base64],
          });
        };
        reader.readAsDataURL(file);
      });
    },
    [id, data.images, updateNodeData]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          updateNodeData(id, {
            images: [...(data.images || []), base64],
          });
        };
        reader.readAsDataURL(file);
      });
    },
    [id, data.images, updateNodeData]
  );

  const removeImage = useCallback(
    (index: number) => {
      const newImages = [...(data.images || [])];
      newImages.splice(index, 1);
      updateNodeData(id, { images: newImages });
    },
    [id, data.images, updateNodeData]
  );

  return (
    <div className={`node-card min-w-[280px] ${selected ? 'node-card-selected' : ''}`}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <Image className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="font-medium text-sm text-foreground">
            {data.label || 'Image Upload'}
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
        {(data.images?.length || 0) > 0 ? (
          <div className="grid grid-cols-2 gap-2 mb-3">
            {data.images?.map((img, i) => (
              <div key={i} className="relative group">
                <img
                  src={img}
                  alt={`Upload ${i + 1}`}
                  className="w-full h-20 object-cover rounded-lg border border-border/50"
                />
                <button
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 p-1 rounded-md bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        ) : null}
        
        <label
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
          className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-border/50 rounded-lg cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors nodrag"
        >
          <Upload className="w-6 h-6 text-muted-foreground mb-2" />
          <span className="text-xs text-muted-foreground">
            Drop images or click to upload
          </span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-emerald-400 !border-2 !border-background"
      />
    </div>
  );
});

ImageUploadNode.displayName = 'ImageUploadNode';
