import { WorkspaceShell } from '@/components/workspace-shell';
import { mockCurrentEmployerUser, mockTeammates, mockEmployerTasks } from '@/lib/mock-data';

export const metadata = {
  title: 'WARP - Management Workspace',
  description: 'Manage your team and oversee project progress',
};

export default function EmployerPage() {
  return (
    <WorkspaceShell 
      user={mockCurrentEmployerUser}
      tasks={mockEmployerTasks}
      teammates={mockTeammates}
    />
  );
}
