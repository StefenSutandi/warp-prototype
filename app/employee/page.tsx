import { WorkspaceShell } from '@/components/workspace-shell';
import { mockCurrentEmployeeUser, mockTeammates, mockEmployeeTasks } from '@/lib/mock-data';

export const metadata = {
  title: 'WARP - Employee Workspace',
  description: 'Your virtual workspace for collaboration and task completion',
};

export default function EmployeePage() {
  return (
    <div className="h-[100svh] overflow-hidden">
      <WorkspaceShell 
        user={mockCurrentEmployeeUser}
        tasks={mockEmployeeTasks}
        teammates={mockTeammates}
      />
    </div>
  );
}
