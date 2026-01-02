import { Save, Download, Rocket, RotateCcw, Undo, Redo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWorkflowStore, useTemporalStore } from '@/stores/workflowStore';
import { toast } from 'sonner';

export function Navbar() {
  const { nodes, edges, resetWorkflow, loadSampleWorkflow, saveToLocalStorage, exportToJSON } = useWorkflowStore();
  const temporalStore = useTemporalStore();
  const { undo, redo, pastStates, futureStates } = temporalStore;

  const canUndo = pastStates.length > 0;
  const canRedo = futureStates.length > 0;

  const handleSave = () => {
    saveToLocalStorage();
    toast.success('Workflow saved locally!');
  };

  const handleExport = () => {
    const json = exportToJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `weavy-workflow-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Workflow exported!');
  };

  const handleReset = () => {
    resetWorkflow();
    loadSampleWorkflow();
    toast.success('Workflow reset to sample!');
  };

  const handleUndo = () => {
    if (canUndo) {
      undo();
      toast.info('Undid last action');
    }
  };

  const handleRedo = () => {
    if (canRedo) {
      redo();
      toast.info('Redid action');
    }
  };

  const handleDeploy = () => {
    toast.info('Workflow deployment coming soon!');
  };

  return (
    <nav className="h-14 bg-sidebar border-b border-sidebar-border flex items-center justify-between px-4">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleUndo}
          disabled={!canUndo}
          className="text-muted-foreground hover:text-foreground disabled:opacity-30"
          title="Undo (Ctrl+Z)"
        >
          <Undo className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRedo}
          disabled={!canRedo}
          className="text-muted-foreground hover:text-foreground disabled:opacity-30"
          title="Redo (Ctrl+Y)"
        >
          <Redo className="w-4 h-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-2" />
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSave}
          className="text-muted-foreground hover:text-foreground"
        >
          <Save className="w-4 h-4 mr-2" />
          Save
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleExport}
          className="text-muted-foreground hover:text-foreground"
        >
          <Download className="w-4 h-4 mr-2" />
          Export JSON
        </Button>
        <Button
          size="sm"
          onClick={handleDeploy}
          className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
        >
          <Rocket className="w-4 h-4 mr-2" />
          Deploy
        </Button>
      </div>
    </nav>
  );
}
