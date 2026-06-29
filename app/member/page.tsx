import { WorkspaceShell } from '@/components/workspace-shell';
import { mockCurrentMemberUser, mockEmployeeTasks, mockTeammates } from '@/lib/mock-data';

export const metadata = { title: 'WARP - Member Workspace', description: 'Collaborate with your team in the WARP virtual workspace' };

export default function MemberPage() {
  return <div className="h-[100svh] overflow-hidden"><WorkspaceShell user={mockCurrentMemberUser} tasks={mockEmployeeTasks} teammates={mockTeammates} /></div>;
}