import { ReactFlowProvider } from 'reactflow';
import { NodeSidebar } from '@/components/workflow/NodeSidebar';
import { WorkflowCanvas } from '@/components/workflow/WorkflowCanvas';
import { Navbar } from '@/components/workflow/Navbar';

const Index = () => {
  return (
    <ReactFlowProvider>
      <div className="h-screen w-full flex flex-col overflow-hidden">
        <Navbar />
        <div className="flex flex-1 overflow-hidden">
          <NodeSidebar />
          <WorkflowCanvas />
        </div>
      </div>
    </ReactFlowProvider>
  );
};

export default Index;
