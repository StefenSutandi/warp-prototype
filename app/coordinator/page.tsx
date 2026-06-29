import { WorkspaceShell } from '@/components/workspace-shell';
import { mockCurrentCoordinatorUser, mockEmployerTasks, mockTeammates } from '@/lib/mock-data';

export const metadata = { title: 'WARP - Coordinator Workspace', description: 'Coordinate tasks, reviews, and team activity in WARP' };

export default function CoordinatorPage() {
  return <WorkspaceShell user={mockCurrentCoordinatorUser} tasks={mockEmployerTasks} teammates={mockTeammates} />;
}