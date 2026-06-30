'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DoorOpen } from 'lucide-react';
import { getRoleDestination, normalizeAppRole, ROLE_STORAGE_KEY } from '@/lib/types';
import { useRoomStore } from '@/stores/useRoomStore';

export function JoinRoomClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const joinRoomByCode = useRoomStore((state) => state.joinRoomByCode);
  const [invalidLink, setInvalidLink] = useState(false);

  useEffect(() => {
    const code = searchParams.get('code')?.trim();

    if (!code) {
      setInvalidLink(true);
      return;
    }

    joinRoomByCode(code);
    const role = normalizeAppRole(localStorage.getItem(ROLE_STORAGE_KEY)) ?? 'member';
    localStorage.setItem(ROLE_STORAGE_KEY, role);
    router.replace(getRoleDestination(role));
  }, [joinRoomByCode, router, searchParams]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(141deg,#d5d2ff_12%,#f2f8fe_52%,#d9fff4_110%)] px-5">
      <section className="w-full max-w-[460px] rounded-[24px] border border-[#e2e0f0] bg-white px-8 py-10 text-center shadow-[0_22px_60px_rgba(72,66,140,0.16)]">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#eeeaff] text-[#685eeb]">
          <DoorOpen className="h-7 w-7" strokeWidth={2.2} />
        </span>
        <h1 className="mt-5 text-[26px] font-extrabold tracking-[-0.03em] text-[#111111]">
          {invalidLink ? 'Room code required' : 'Joining workspace…'}
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#6f6a87]">
          {invalidLink
            ? 'This invite link does not include a room code.'
            : 'Your room is being prepared. You will enter the workspace automatically.'}
        </p>
        {invalidLink ? (
          <button
            type="button"
            onClick={() => router.replace('/member')}
            className="mt-6 h-[44px] rounded-[12px] bg-[#685eeb] px-5 text-sm font-bold text-white transition hover:bg-[#5d54df]"
          >
            Continue to Member Workspace
          </button>
        ) : null}
      </section>
    </main>
  );
}
