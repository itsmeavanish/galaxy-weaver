import { Save, Download, Rocket, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWorkflowStore } from '@/stores/workflowStore';
import { toast } from 'sonner';

export function Navbar() {
  const { nodes, edges, resetWorkflow, loadSampleWorkflow } = useWorkflowStore();

  const handleSave = () => {
    const workflow = { nodes, edges };
    localStorage.setItem('weavy-workflow', JSON.stringify(workflow));
    toast.success('Workflow saved locally!');
  };

  const handleExport = () => {
    const workflow = { nodes, edges };
    const blob = new Blob([JSON.stringify(workflow, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'weavy-workflow.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Workflow exported!');
  };

  const handleReset = () => {
    resetWorkflow();
    loadSampleWorkflow();
    toast.success('Workflow reset to sample!');
  };

  const handleDeploy = () => {
    toast.info('Connect to Lovable Cloud to deploy workflows!');
  };

  return (
    <nav className="h-14 bg-sidebar border-b border-sidebar-border flex items-center justify-between px-4">
      <div className="flex items-center gap-2">
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
