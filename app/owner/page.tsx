import { WorkspaceShell } from '@/components/workspace-shell';
import { mockCurrentOwnerUser, mockEmployerTasks, mockTeammates } from '@/lib/mock-data';

export const metadata = { title: 'WARP - Owner Workspace', description: 'Manage your WARP team and project workspace' };

export default function OwnerPage() {
  return <WorkspaceShell user={mockCurrentOwnerUser} tasks={mockEmployerTasks} teammates={mockTeammates} />;
}