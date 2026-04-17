'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Pencil, Plus, X } from 'lucide-react';
import {
  FACE_PRESETS,
  useAvatarStore,
} from '@/stores/useAvatarStore';
import { cn } from '@/lib/utils';

const AVATAR_TABS = ['Face', 'Hair', 'Tops', 'Bottoms', 'Shoes'] as const;
type AvatarTab = (typeof AVATAR_TABS)[number];

const AVATAR_PREVIEW_ASSET = '/assets/avatar/custom%20profile.svg';
const FACE_OPTION_ASSET = '/assets/avatar/face%201.svg';

const DEMO_INTERESTS = ['UI/UX', 'Product', 'Frontend', 'Backend', 'Branding', 'Research', 'Motion', 'DevOps'];

type OptionCard = {
  id: string;
  label: string;
  preview?: string;
  imageSrc?: string;
  color?: string;
  active?: boolean;
  onSelect: () => void;
};

function StepIndicator() {
  const steps = [
    { number: 1, label: 'Account', state: 'done' as const },
    { number: 2, label: 'Avatar', state: 'active' as const },
    { number: 3, label: 'Workspace', state: 'upcoming' as const },
  ];

  return (
    <div className="flex items-center justify-center gap-4 xl:justify-start">
      {steps.map((step, index) => (
        <div key={step.label} className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-[14px] text-sm font-medium',
                step.state === 'done' && 'bg-[#56EFC4] text-white',
                step.state === 'active' && 'border-[3px] border-[#A29BFC75] bg-[#685EEB] text-white',
                step.state === 'upcoming' && 'border border-[#DFDFDF] bg-[#DFDFDF] text-[#858585]'
              )}
            >
              {step.number}
            </span>
            <span
              className={cn(
                'text-[16px] font-semibold',
                step.state === 'done' && 'text-[#56EFC4]',
                step.state === 'active' && 'text-[#685EEB]',
                step.state === 'upcoming' && 'text-[#858585]'
              )}
            >
              {step.label}
            </span>
          </div>

          {index < steps.length - 1 ? (
            <div className={cn('h-px w-[54px]', step.state === 'done' ? 'bg-[#56EFC4]' : 'bg-[#DFDFDF]')} />
          ) : null}
        </div>
      ))}
    </div>
  );
}

function AvatarPreviewPlaceholder() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6">
      <div className="relative flex h-[360px] w-[270px] items-center justify-center rounded-[36px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.7)_0%,rgba(236,244,255,0.92)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]">
        <div className="absolute inset-x-[48px] bottom-[26px] h-[18px] rounded-full bg-[#685EEB]/10 blur-md" />
        <div className="relative h-full w-full px-[10px] pt-[10px]">
          <Image
            src={AVATAR_PREVIEW_ASSET}
            alt="Avatar preview"
            fill
            sizes="270px"
            className="object-contain object-center scale-[1.08]"
            priority
          />
        </div>
      </div>

      <div className="text-center">
        <p className="text-[14px] font-semibold text-[#5C5780]">Avatar preview</p>
        <p className="mt-1 text-[12px] text-[#858585]">Using local reference avatar art until final customization assets are ready</p>
      </div>
    </div>
  );
}

function OptionGrid({
  tab,
  options,
}: {
  tab: AvatarTab;
  options: OptionCard[];
}) {
  return (
    <div className="grid grid-cols-3 gap-[12px]">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={option.onSelect}
          className={cn(
            'flex h-[108px] flex-col items-center justify-center rounded-[9px] border bg-[#f0f0f0] p-4 transition',
            option.active ? 'border-2 border-[#685EEB] bg-white shadow-[0_8px_20px_rgba(104,94,235,0.12)]' : 'border-[#DFDFDF] hover:border-[#CFCBEB]'
          )}
        >
          {tab === 'Face' ? (
            option.imageSrc ? (
              <div className="relative h-[60px] w-[76px]">
                <Image
                  src={option.imageSrc}
                  alt={option.label}
                  fill
                  sizes="76px"
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="h-[60px] w-[76px] rounded-[12px] bg-[linear-gradient(180deg,#F3F3F3_0%,#ECECEC_100%)]" />
            )
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="h-[46px] w-[64px] rounded-[14px] bg-[linear-gradient(180deg,#F3F3F3_0%,#ECECEC_100%)]" />
              {option.label ? <span className="text-[12px] font-medium text-[#5C5780]">{option.label}</span> : null}
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

export function AvatarCreationPage() {
  const router = useRouter();
  const config = useAvatarStore((state) => state.config);
  const profile = useAvatarStore((state) => state.profile);
  const updateConfig = useAvatarStore((state) => state.updateConfig);
  const updateProfile = useAvatarStore((state) => state.updateProfile);

  const [activeTab, setActiveTab] = useState<AvatarTab>('Face');

  const options = useMemo<OptionCard[]>(() => {
    if (activeTab === 'Face') {
      return Array.from({ length: 9 }, (_, index) => ({
        id: `face-${index + 1}`,
        label: index === 0 ? 'Face 1' : '',
        imageSrc: index === 0 ? FACE_OPTION_ASSET : undefined,
        active: index === 0,
        onSelect: () => {
          if (index === 0) updateConfig({ facePreset: FACE_PRESETS[0]?.id ?? config.facePreset });
        },
      }));
    }

    return Array.from({ length: 9 }, (_, index) => ({
      id: `${activeTab.toLowerCase()}-${index + 1}`,
      label: '',
      active: false,
      onSelect: () => undefined,
    }));
  }, [activeTab, config.facePreset, updateConfig]);

  return (
    <div className="warp-font-ui min-h-screen bg-[linear-gradient(108deg,#d5d2ff_2%,#f5f3ee_48%,#d9fff4_108%)] px-[42px] py-[52px] text-[#111111]">
      <div className="mx-auto flex max-w-[1390px] flex-col gap-[30px]">
        <div className="flex justify-center pt-[6px]">
          <StepIndicator />
        </div>

        <div className="pl-[6px]">
          <h1 className="warp-font-display text-[40px] font-extrabold leading-none tracking-[-0.04em] text-black">
            Create your <span className="bg-[linear-gradient(90deg,#685EEB_15%,#46D2D2_100%)] bg-clip-text text-transparent">Avatar</span>
          </h1>
          <p className="mt-3 text-[20px] font-light text-[#656565]">
            Customize how you appear in your virtual workspace - make it you!
          </p>
        </div>

        <div className="mx-auto grid min-h-[539px] w-full max-w-[1324px] items-stretch justify-center gap-[16px] xl:grid-cols-[436px_522px_338px]">
          <section className="overflow-hidden rounded-[51px] border-2 border-white bg-white/10 shadow-[0_2px_17.7px_rgba(104,94,235,0.31)] backdrop-blur-[4px]">
            <div className="h-full rounded-[49px] bg-[radial-gradient(circle_at_20%_20%,rgba(217,255,244,0.95),rgba(255,255,255,0.6)_45%,rgba(213,210,255,0.85)_100%)] px-[26px] py-[20px]">
              <AvatarPreviewPlaceholder />
            </div>
          </section>

          <section className="overflow-hidden rounded-[51px] border-2 border-white bg-white/48 shadow-[0_2px_17.7px_rgba(104,94,235,0.31)] backdrop-blur-[4px]">
            <div className="border-b border-[#E2E0F0] px-[28px] pt-[24px]">
              <div className="flex items-center gap-[30px] overflow-x-auto pb-[18px]">
                {AVATAR_TABS.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      'shrink-0 pb-[2px] text-[16px] font-semibold transition',
                      activeTab === tab ? 'text-[#685EEB]' : 'text-[#A5A4A4]'
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-[16px] pt-[18px]">
              <OptionGrid tab={activeTab} options={options} />
            </div>
          </section>

          <section className="overflow-hidden rounded-[51px] border-2 border-white bg-white/48 shadow-[0_2px_17.7px_rgba(104,94,235,0.31)] backdrop-blur-[4px]">
            <div className="px-[18px] py-[26px]">
              <div className="space-y-5">
                <label className="block">
                  <span className="warp-font-display text-[14px] font-extrabold uppercase tracking-[0.04em] text-[#685EEB]">
                    Display Name
                  </span>
                  <div className="mt-3 flex items-center gap-3 border-b border-[#A5A4A4] pb-2">
                    <input
                      value={profile.displayName}
                      onChange={(event) => updateProfile({ displayName: event.target.value })}
                      placeholder="Enter your name"
                      className="flex-1 bg-transparent text-[16px] text-[#5C5780] placeholder:text-[#858585] outline-none"
                    />
                    <Pencil className="h-4 w-4 text-[#858585]" strokeWidth={2} />
                  </div>
                </label>

                <label className="block">
                  <span className="warp-font-display text-[14px] font-extrabold uppercase tracking-[0.04em] text-[#685EEB]">
                    Position
                  </span>
                  <div className="mt-3 flex items-center gap-3 border-b border-[#A5A4A4] pb-2">
                    <input
                      value={profile.position}
                      onChange={(event) => updateProfile({ position: event.target.value })}
                      placeholder="Position"
                      className="flex-1 bg-transparent text-[16px] text-[#5C5780] placeholder:text-[#858585] outline-none"
                    />
                    <Pencil className="h-4 w-4 text-[#858585]" strokeWidth={2} />
                  </div>
                </label>

                <div>
                  <span className="warp-font-display text-[14px] font-extrabold uppercase tracking-[0.04em] text-[#685EEB]">
                    Interests &amp; Skills
                  </span>
                  <div className="mt-4 flex flex-wrap gap-[8px]">
                    {profile.interests.map((interest, index) => (
                      <button
                        key={`${interest}-${index}`}
                        type="button"
                        onClick={() =>
                          updateProfile({
                            interests: profile.interests.filter((_, currentIndex) => currentIndex !== index),
                          })
                        }
                        className="inline-flex items-center gap-[9px] rounded-[22px] border-2 border-[#685EEB] bg-[#DFDCFF] px-[14px] py-[8px] text-[13px] text-[#685EEB]"
                      >
                        <span>{interest}</span>
                        <X className="h-3 w-3" strokeWidth={2.2} />
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const remainingInterests = DEMO_INTERESTS.filter(
                          (interest) => !profile.interests.includes(interest)
                        );
                        if (remainingInterests.length === 0) return;

                        updateProfile({
                          interests: [
                            ...profile.interests,
                            remainingInterests[Math.floor(Math.random() * remainingInterests.length)],
                          ],
                        });
                      }}
                      className="inline-flex h-[38px] w-[38px] items-center justify-center rounded-full border-2 border-dashed border-[#A29BFC] text-[#685EEB]"
                    >
                      <Plus className="h-4 w-4" strokeWidth={2.2} />
                    </button>
                  </div>
                </div>

                <label className="block">
                  <span className="warp-font-display text-[14px] font-extrabold uppercase tracking-[0.04em] text-[#685EEB]">
                    Bio
                  </span>
                  <textarea
                    value={profile.bio}
                    onChange={(event) => updateProfile({ bio: event.target.value })}
                    rows={5}
                    placeholder="Tell your team a bit about yourself..."
                    className="mt-3 min-h-[124px] w-full resize-none rounded-[33px] border border-[#A5A4A4] bg-white/64 px-4 py-4 text-[15px] text-[#5C5780] placeholder:text-[#9B96B8] outline-none"
                  />
                </label>
              </div>
            </div>
          </section>
        </div>

        <div className="mx-auto flex w-full max-w-[1324px] items-center justify-end gap-[10px] pr-[18px]">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex h-[46px] items-center justify-center rounded-[10px] border border-[#A5A4A4] bg-[#F9FBFD] px-[23px] text-[16px] font-semibold text-[#050505]"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => router.push('/employer')}
            className="inline-flex h-[46px] items-center justify-center gap-2 rounded-[10px] bg-[#685EEB] px-[23px] text-[16px] font-semibold text-white shadow-[0_12px_24px_rgba(104,94,235,0.2)]"
          >
            Continue
            <ChevronRight className="h-4 w-4" strokeWidth={2.4} />
          </button>
        </div>
      </div>
    </div>
  );
}
