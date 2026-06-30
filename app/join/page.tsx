import { Suspense } from 'react';
import { JoinRoomClient } from './join-room-client';

export const metadata = {
  title: 'WARP - Join Workspace',
  description: 'Join a WARP workspace with an invite code',
};

export default function JoinRoomPage() {
  return (
    <Suspense fallback={null}>
      <JoinRoomClient />
    </Suspense>
  );
}
