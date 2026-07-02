'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Pencil, Plus, Redo2, Undo2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getRoleDestination, normalizeAppRole, ROLE_STORAGE_KEY, type AppRole } from '@/lib/types';
import { useAvatarStore } from '@/stores/useAvatarStore';
import { useUserStore } from '@/stores/useUserStore';

type AvatarTab = 'face' | 'hair' | 'outfit';
type HairColorId = 'dark' | 'brown' | 'blonde';
type BodyToneId = 'light' | 'medium' | 'dark';

type AvatarOption = {
  id: string;
  label: string;
  src: string;
  optionCardSrc?: string;
  previewLayerSrc?: string;
  closedSrc?: string;
  allowedRoles?: AppRole[];
};

type PurchasableAvatarCategory = 'face' | 'hair' | 'outfit';

type PendingAvatarPurchase = {
  option: AvatarOption;
  category: PurchasableAvatarCategory;
  price: number;
};

type AvatarSelectionSnapshot = {
  face: AvatarOption;
  hair: AvatarOption;
  outfit: AvatarOption;
  hairColorId: HairColorId;
  bodyTone: BodyToneId;
};

type ColorOption = {
  id: string;
  label: string;
  value: string;
};

type HairColorOption = ColorOption & {
  id: HairColorId;
};

type BodyToneOption = ColorOption & {
  id: BodyToneId;
};

const avatarTabs: { id: AvatarTab; label: string }[] = [
  { id: 'face', label: 'Face' },
  { id: 'hair', label: 'Hair' },
  { id: 'outfit', label: 'Outfit' },
];

const AVATAR_CUSTOMIZATION_ASSET_BASE = '/assets/figma-export/avatar-customization';
const WARP_COIN_ASSET = `${AVATAR_CUSTOMIZATION_ASSET_BASE}/icons/warp-coin.svg`;

const bodyPreviewAssets: Record<BodyToneId, { src: string; fallbackSrc: string }> = {
  light: {
    src: `${AVATAR_CUSTOMIZATION_ASSET_BASE}/body/body-light.png`,
    fallbackSrc: `${AVATAR_CUSTOMIZATION_ASSET_BASE}/body/body_light.png`,
  },
  medium: {
    src: `${AVATAR_CUSTOMIZATION_ASSET_BASE}/body/body-medium.png`,
    fallbackSrc: `${AVATAR_CUSTOMIZATION_ASSET_BASE}/body/body_medium.png`,
  },
  dark: {
    src: `${AVATAR_CUSTOMIZATION_ASSET_BASE}/body/body-dark.png`,
    fallbackSrc: `${AVATAR_CUSTOMIZATION_ASSET_BASE}/body/body_dark.png`,
  },
};

const outfitPreviewAssets: Record<string, string> = {
  short: `${AVATAR_CUSTOMIZATION_ASSET_BASE}/outfit/outfit-short.png`,
  long: `${AVATAR_CUSTOMIZATION_ASSET_BASE}/outfit/outfit-long.png`,
  hoodie: `${AVATAR_CUSTOMIZATION_ASSET_BASE}/outfit/outfit-hoodie.png`,
  suit: `${AVATAR_CUSTOMIZATION_ASSET_BASE}/outfit/outfit-suit.png`,
};

const hairPreviewAssets: Record<HairColorId, Record<number, string>> = {
  brown: {
    1: `${AVATAR_CUSTOMIZATION_ASSET_BASE}/hair/hair-1-brown.png`,
    2: `${AVATAR_CUSTOMIZATION_ASSET_BASE}/hair/hair-2-brown.png`,
    3: `${AVATAR_CUSTOMIZATION_ASSET_BASE}/hair/hair-3-brown.png`,
    4: `${AVATAR_CUSTOMIZATION_ASSET_BASE}/hair/hair-4-brown.png`,
  },
  dark: {
    1: `${AVATAR_CUSTOMIZATION_ASSET_BASE}/hair/hair-1-dark.png`,
    2: `${AVATAR_CUSTOMIZATION_ASSET_BASE}/hair/hair-2-dark.png`,
    3: `${AVATAR_CUSTOMIZATION_ASSET_BASE}/hair/hair-3-dark.png`,
    4: `${AVATAR_CUSTOMIZATION_ASSET_BASE}/hair/hair-4-dark.png`,
  },
  blonde: {
    1: `${AVATAR_CUSTOMIZATION_ASSET_BASE}/hair/hair-1-blonde.png`,
    2: `${AVATAR_CUSTOMIZATION_ASSET_BASE}/hair/hair-2-blonde.png`,
    3: `${AVATAR_CUSTOMIZATION_ASSET_BASE}/hair/hair-3-blonde.png`,
    4: `${AVATAR_CUSTOMIZATION_ASSET_BASE}/hair/hair-4-blonde.png`,
  },
};

const faceOptions: AvatarOption[] = [
  {
    id: 'face-1-default',
    label: 'Face 1 default',
    src: '/assets/avatar/face/Layer_1-2.png',
    optionCardSrc: `${AVATAR_CUSTOMIZATION_ASSET_BASE}/face/face-1.png`,
    previewLayerSrc: `${AVATAR_CUSTOMIZATION_ASSET_BASE}/face-preview/face-1-default-fr.png`,
  },
  {
    id: 'face-2-default',
    label: 'Face 2 default',
    src: '/assets/avatar/face/Layer_1-3.png',
    optionCardSrc: `${AVATAR_CUSTOMIZATION_ASSET_BASE}/face/face-2.png`,
    previewLayerSrc: `${AVATAR_CUSTOMIZATION_ASSET_BASE}/face-preview/face-2-default-fr.png`,
  },
  {
    id: 'face-3-default',
    label: 'Face 3 default',
    src: '/assets/avatar/face/Layer_1-5.png',
    optionCardSrc: `${AVATAR_CUSTOMIZATION_ASSET_BASE}/face/face-3.png`,
    previewLayerSrc: `${AVATAR_CUSTOMIZATION_ASSET_BASE}/face-preview/face-3-default-fr.png`,
  },
  {
    id: 'face-4-default',
    label: 'Angry Face',
    src: '/assets/avatar/face/Layer_1-7.png',
    optionCardSrc: `${AVATAR_CUSTOMIZATION_ASSET_BASE}/face/face-4.png`,
    previewLayerSrc: `${AVATAR_CUSTOMIZATION_ASSET_BASE}/face-preview/face-4-default-fr.png`,
  },
];

const hairOptionsByColor: Record<HairColorId, AvatarOption[]> = {
  dark: [
    { id: 'hair-dark-1', label: 'Bob dark', src: '/assets/avatar/hair/hair_1%202.svg' },
    { id: 'hair-dark-2', label: 'Side dark', src: '/assets/avatar/hair/hair_2%202.svg' },
    { id: 'hair-dark-3', label: 'Wave dark', src: '/assets/avatar/hair/hair_3%202.svg' },
    { id: 'hair-dark-4', label: 'Crop dark', src: '/assets/avatar/hair/hair_4%202.svg' },
    { id: 'hair-dark-1-back', label: 'Bob dark back', src: '/assets/avatar/hair/hair_1_back%202.svg' },
    { id: 'hair-dark-2-back', label: 'Side dark back', src: '/assets/avatar/hair/hair_2_back%202.svg' },
    { id: 'hair-dark-3-back', label: 'Wave dark back', src: '/assets/avatar/hair/hair_3_back%202.svg' },
    { id: 'hair-dark-4-back', label: 'Crop dark back', src: '/assets/avatar/hair/hair_4_back%202.svg' },
  ],
  brown: [
    { id: 'hair-brown-1', label: 'Bob brown', src: '/assets/avatar/hair/hair_1%201.svg' },
    { id: 'hair-brown-2', label: 'Side brown', src: '/assets/avatar/hair/hair_2%201.svg' },
    { id: 'hair-brown-3', label: 'Wave brown', src: '/assets/avatar/hair/hair_3%201.svg' },
    { id: 'hair-brown-4', label: 'Crop Brown', src: '/assets/avatar/hair/hair_4%201.svg' },
    { id: 'hair-brown-1-back', label: 'Bob brown back', src: '/assets/avatar/hair/hair_1_back%201.svg' },
    { id: 'hair-brown-2-back', label: 'Side brown back', src: '/assets/avatar/hair/hair_2_back%201.svg' },
    { id: 'hair-brown-3-back', label: 'Wave brown back', src: '/assets/avatar/hair/hair_3_back%201.svg' },
    { id: 'hair-brown-4-back', label: 'Crop brown back', src: '/assets/avatar/hair/hair_4_back%201.svg' },
  ],
  blonde: [
    { id: 'hair-blonde-1', label: 'Bob blonde', src: '/assets/avatar/hair/hair_1%203.svg' },
    { id: 'hair-blonde-2', label: 'Side blonde', src: '/assets/avatar/hair/hair_2%203.svg' },
    { id: 'hair-blonde-3', label: 'Wave blonde', src: '/assets/avatar/hair/hair_3%203.svg' },
    { id: 'hair-blonde-4', label: 'Crop blonde', src: '/assets/avatar/hair/hair_4%203.svg' },
    { id: 'hair-blonde-1-back', label: 'Bob blonde back', src: '/assets/avatar/hair/hair_1_back%203.svg' },
    { id: 'hair-blonde-2-back', label: 'Side blonde back', src: '/assets/avatar/hair/hair_2_back%203.svg' },
    { id: 'hair-blonde-3-back', label: 'Wave blonde back', src: '/assets/avatar/hair/hair_3_back%203.svg' },
    { id: 'hair-blonde-4-back', label: 'Crop blonde back', src: '/assets/avatar/hair/hair_4_back%203.svg' },
  ],
};

const isFrontFacingHairOption = (option: AvatarOption) => {
  const searchable = decodeURIComponent(`${option.id} ${option.label} ${option.src}`).toLowerCase();
  return !searchable.includes('_back') && !searchable.includes('back');
};

const selectableHairOptionsByColor: Record<HairColorId, AvatarOption[]> = {
  dark: hairOptionsByColor.dark.filter(isFrontFacingHairOption),
  brown: hairOptionsByColor.brown.filter(isFrontFacingHairOption),
  blonde: hairOptionsByColor.blonde.filter(isFrontFacingHairOption),
};

const outfitOptions: AvatarOption[] = [
  { id: 'outfit-1', label: 'Studio', src: '/assets/avatar/outfit/outfit1_idle.png' },
  { id: 'outfit-2', label: 'Casual', src: '/assets/avatar/outfit/outfit2_idle.png' },
  { id: 'outfit-3', label: 'Classic', src: '/assets/avatar/outfit/outfit3_idle.png' },
  { id: 'outfit-4', label: 'Boss Suit', src: '/assets/avatar/outfit/outfit4_idle.png', allowedRoles: ['coordinator', 'owner'] },
];

const outfitTypesById: Record<string, string> = {
  'outfit-1': 'long',
  'outfit-2': 'hoodie',
  'outfit-3': 'short',
  'outfit-4': 'suit',
};

const hairColors: HairColorOption[] = [
  { id: 'dark', label: 'Dark hair', value: '#241B1B' },
  { id: 'brown', label: 'Brown hair', value: '#8F5A3C' },
  { id: 'blonde', label: 'Blonde hair', value: '#DDBA72' },
];

const bodyToneOptions: BodyToneOption[] = [
  { id: 'light', label: 'Light body tone', value: '#F0C7A2' },
  { id: 'medium', label: 'Medium body tone', value: '#C98558' },
  { id: 'dark', label: 'Dark body tone', value: '#8A5038' },
];

const defaultInterests: string[] = [];
const interestPool = ['UI/UX', 'Product', 'Frontend', 'Backend', 'Branding', 'Research', 'Motion', 'DevOps'];

const isHairColorId = (value: string): value is HairColorId =>
  hairColors.some((color) => color.id === value);

const isBodyToneId = (value: string): value is BodyToneId =>
  bodyToneOptions.some((tone) => tone.id === value);

const findAvatarOption = (options: AvatarOption[], id: string, fallback: AvatarOption) =>
  options.find((option) => option.id === id) ?? fallback;

const getOptionNumber = (id: string, fallback = 1) => {
  const match = id.match(/-(\d+)(?:-|$)/);
  const value = match ? Number(match[1]) : fallback;
  return value >= 1 && value <= 4 ? value : fallback;
};

const getPreviewOutfitType = (selectedOutfit: AvatarOption) =>
  outfitTypesById[selectedOutfit.id] ?? 'short';

function StepIndicator() {
  const steps = [
    { number: 1, label: 'Account', state: 'done' as const },
    { number: 2, label: 'Avatar', state: 'active' as const },
    { number: 3, label: 'Workspace', state: 'upcoming' as const },
  ];

  return (
    <div className="flex items-center justify-center gap-[12px]">
      {steps.map((step, index) => (
        <div key={step.label} className="flex items-center gap-[12px]">
          <div className="flex items-center gap-[8px]">
            <span
              className={cn(
                'flex h-[28px] w-[28px] items-center justify-center rounded-[14px] text-[14px] font-medium',
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

function ColorSwatches({
  colors,
  selectedId,
  onSelect,
  label,
}: {
  colors: ColorOption[];
  selectedId: string;
  onSelect: (color: ColorOption) => void;
  label?: string;
}) {
  return (
    <div className="flex items-center justify-center gap-[10px]">
      {label ? <span className="text-[12px] font-semibold text-[#858585]">{label}</span> : null}
      <div className="flex items-center gap-[11px]">
        {colors.map((color) => (
          <button
            key={color.id}
            type="button"
            aria-label={color.label}
            onClick={() => onSelect(color)}
            className={cn(
              'h-[30px] w-[30px] rounded-full border-2 transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#685EEB] focus-visible:ring-offset-2',
              selectedId === color.id
                ? 'border-white shadow-[0_0_0_3px_rgba(104,94,235,0.3)] ring-1 ring-[#685EEB]'
                : 'border-white/80 shadow-[0_2px_8px_rgba(104,94,235,0.12)]'
            )}
            style={{ backgroundColor: color.value }}
          />
        ))}
      </div>
    </div>
  );
}

function AvatarOptionCard({
  option,
  selected,
  onSelect,
  locked = false,
  roleLocked = false,
  roleLockLabel = 'Coordinator / Owner only',
  compact = false,
  price = 200,
}: {
  option?: AvatarOption;
  selected?: boolean;
  onSelect?: () => void;
  locked?: boolean;
  roleLocked?: boolean;
  roleLockLabel?: string;
  compact?: boolean;
  price?: number;
}) {
  const cardClassName = cn(
    'relative flex items-center justify-center rounded-[10px] border-2',
    compact ? 'h-[104px] p-[7px] sm:h-[122px]' : 'h-[110px] p-[10px] sm:h-[155px]'
  );

  if (!option) {
    return <div className={cn(cardClassName, 'border-[#DFDFDF] bg-[#F0F0F0]')} aria-hidden="true" />;
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={roleLocked}
      className={cn(
        cardClassName,
        'group transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#685EEB] focus-visible:ring-offset-2',
        locked && !roleLocked && 'cursor-pointer border-[#DFDFDF] bg-[#F0F0F0] grayscale-[0.35] hover:border-[#A29BFC]',
        roleLocked && 'cursor-not-allowed border-[#DFDFDF] bg-[#ececf0] grayscale opacity-65',
        selected
          ? 'border-[#685EEB] bg-white shadow-[0_9px_20px_rgba(104,94,235,0.14)]'
          : 'border-[#DFDFDF] bg-[#F0F0F0] hover:border-[#B9B4FF] hover:bg-white/80'
      )}
      aria-pressed={selected}
      aria-disabled={roleLocked}
    >
      <span className="sr-only">{option.label}</span>
      <span className={cn('relative', locked && 'opacity-35', compact ? 'h-[78px] w-[86px] sm:h-[92px] sm:w-[102px]' : 'h-[78px] w-[78px] sm:h-[115px] sm:w-[115px]')}>
        <Image src={option.optionCardSrc ?? option.src} alt="" fill sizes={compact ? '102px' : '115px'} className="object-contain" />
      </span>
      {locked ? (
        <span className="absolute bottom-[8px] left-1/2 inline-flex h-[34px] -translate-x-1/2 items-center gap-[4px] rounded-full border-2 border-[#685EEB] bg-[#F0EFF8] px-[7px] text-[17px] font-semibold text-[#685EEB] shadow-[0_4px_10px_rgba(104,94,235,0.14)]">
          <Image src={WARP_COIN_ASSET} alt="" width={22} height={22} className="h-[22px] w-[22px]" />
          {price}
        </span>
      ) : null}
      {roleLocked ? <span className="absolute left-1/2 top-[7px] w-[calc(100%-12px)] -translate-x-1/2 text-center text-[9px] font-bold uppercase leading-[1.2] text-[#5c5780]">{roleLockLabel}</span> : null}
    </button>
  );
}

function PreviewLayer({
  src,
  fallbackSrc,
  className,
}: {
  src: string;
  fallbackSrc?: string;
  className?: string;
}) {
  return (
    <img
      src={src}
      alt=""
      className={cn('pointer-events-none select-none', className)}
      draggable={false}
      onError={(event) => {
        if (!fallbackSrc || event.currentTarget.src.endsWith(fallbackSrc)) return;
        event.currentTarget.src = fallbackSrc;
      }}
    />
  );
}

function AvatarPreview({
  selectedFace,
  selectedHair,
  selectedOutfit,
  selectedHairColorId,
  selectedBodyTone,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  coinBalance,
}: {
  selectedFace: AvatarOption;
  selectedHair: AvatarOption;
  selectedOutfit: AvatarOption;
  selectedHairColorId: HairColorId;
  selectedBodyTone: BodyToneId;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  coinBalance: number;
}) {
  const bodyAsset = bodyPreviewAssets[selectedBodyTone] ?? bodyPreviewAssets.light;
  const outfitType = getPreviewOutfitType(selectedOutfit);
  const outfitAsset = outfitPreviewAssets[outfitType] ?? outfitPreviewAssets.short;
  const hairStyleNumber = getOptionNumber(selectedHair.id);
  const hairAsset = hairPreviewAssets[selectedHairColorId]?.[hairStyleNumber] ?? hairPreviewAssets.brown[1];
  const faceAsset = selectedFace.previewLayerSrc ?? faceOptions[0].previewLayerSrc!;

  return (
    <section className="relative min-h-[440px] overflow-hidden rounded-[51px] border-2 border-white bg-white/10 shadow-[0_2px_17.7px_rgba(104,94,235,0.31)] backdrop-blur-[4px] lg:min-h-[539px]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_26%_18%,rgba(217,255,244,0.95),rgba(255,255,255,0.46)_43%,rgba(213,210,255,0.74)_100%)]" />
      <div className="absolute left-[14px] top-[14px] z-10 inline-flex h-[40px] items-center gap-[6px] rounded-full border-2 border-[#685EEB] bg-[#F0EFF8] px-[9px] text-[20px] font-semibold text-[#111111] shadow-[0_5px_14px_rgba(104,94,235,0.12)] lg:left-[26px] lg:top-[22px]">
        <Image src={WARP_COIN_ASSET} alt="WARP coin" width={26} height={26} className="h-[26px] w-[26px]" />
        <span>{coinBalance}</span>
      </div>
      <div className="relative flex h-full min-h-[440px] items-center justify-center lg:min-h-[539px]">
        <div className="relative aspect-square w-[260px] max-w-full lg:w-[318px]" aria-label="Avatar preview">
          <PreviewLayer src={bodyAsset.src} fallbackSrc={bodyAsset.fallbackSrc} className="absolute inset-0 h-full w-full object-contain" />
          <PreviewLayer src={outfitAsset} className="absolute inset-0 h-full w-full object-contain" />
          <PreviewLayer src={hairAsset} className="absolute inset-0 h-full w-full object-contain" />
          <PreviewLayer src={faceAsset} className="absolute inset-0 h-full w-full object-contain" />
        </div>
      </div>
      <div className="absolute bottom-[16px] left-1/2 z-10 flex -translate-x-1/2 items-center gap-[10px]">
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          aria-label="Undo avatar change"
          className="flex h-[46px] w-[46px] items-center justify-center rounded-full text-[#858585] transition hover:bg-white/60 hover:text-[#685EEB] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-[#858585] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#685EEB]"
        >
          <Undo2 className="h-[34px] w-[34px]" strokeWidth={2.2} />
        </button>
        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          aria-label="Redo avatar change"
          className="flex h-[46px] w-[46px] items-center justify-center rounded-full text-[#858585] transition hover:bg-white/60 hover:text-[#685EEB] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-[#858585] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#685EEB]"
        >
          <Redo2 className="h-[34px] w-[34px]" strokeWidth={2.2} />
        </button>
      </div>
    </section>
  );
}

function AvatarOptionsPanel({
  activeTab,
  setActiveTab,
  selectedFace,
  setSelectedFace,
  selectedHair,
  setSelectedHair,
  selectedOutfit,
  setSelectedOutfit,
  selectedHairColorId,
  setSelectedHairColorId,
  selectedBodyTone,
  setSelectedBodyTone,
  unlockedOptionIds,
  onPurchaseRequest,
  currentRole,
  memberCanUseBossSuit,
}: {
  activeTab: AvatarTab;
  setActiveTab: (tab: AvatarTab) => void;
  selectedFace: AvatarOption;
  setSelectedFace: (option: AvatarOption) => void;
  selectedHair: AvatarOption;
  setSelectedHair: (option: AvatarOption) => void;
  selectedOutfit: AvatarOption;
  setSelectedOutfit: (option: AvatarOption) => void;
  selectedHairColorId: HairColorId;
  setSelectedHairColorId: (color: HairColorId) => void;
  selectedBodyTone: BodyToneId;
  setSelectedBodyTone: (tone: BodyToneId) => void;
  unlockedOptionIds: Set<string>;
  onPurchaseRequest: (purchase: PendingAvatarPurchase) => void;
  currentRole: AppRole;
  memberCanUseBossSuit: boolean;
}) {
  const visibleOptions = useMemo(() => {
    if (activeTab === 'face') return faceOptions;
    if (activeTab === 'hair') return selectableHairOptionsByColor[selectedHairColorId];
    return outfitOptions;
  }, [activeTab, selectedHairColorId]);

  const gridSlots = [...visibleOptions, ...Array.from<undefined>({ length: Math.max(0, 6 - visibleOptions.length) })];
  const optionCards = activeTab === 'outfit' || activeTab === 'face' ? gridSlots.slice(0, 6) : visibleOptions;

  return (
    <section className="min-h-[440px] overflow-hidden rounded-[51px] border-2 border-white bg-white/50 shadow-[0_2px_17.7px_rgba(104,94,235,0.31)] backdrop-blur-[4px] lg:min-h-[539px]">
      <div className="border-b border-[#DFDFDF] px-[34px] pt-[25px]">
        <div className="flex items-center justify-center gap-[74px] pb-[25px]">
          {avatarTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'text-[16px] font-semibold transition hover:text-[#685EEB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#685EEB] focus-visible:ring-offset-4',
                activeTab === tab.id ? 'text-[#685EEB]' : 'text-[#A5A4A4]'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-[16px] py-[18px] sm:py-[20px]">
        <div className="flex flex-wrap items-center justify-center gap-x-[24px] gap-y-[12px]">
          <ColorSwatches
            colors={bodyToneOptions}
            selectedId={selectedBodyTone}
            label="Body"
            onSelect={(color) => setSelectedBodyTone(color.id as BodyToneId)}
          />
          {activeTab === 'hair' ? (
            <ColorSwatches
              colors={hairColors}
              selectedId={selectedHairColorId}
              label="Hair"
              onSelect={(color) => setSelectedHairColorId(color.id as HairColorId)}
            />
          ) : null}
        </div>
        <div className={cn(activeTab === 'hair' && 'max-h-[356px] overflow-y-auto pr-[4px]')}>
          <div
            className={cn(
              'grid grid-cols-3',
              activeTab === 'face' ? 'mt-[4px] gap-[7px] sm:gap-[8px]' : 'gap-[10px] sm:gap-[12px]',
              activeTab === 'outfit' ? 'mt-[42px]' : activeTab === 'face' ? '' : 'mt-[20px]'
            )}
          >
            {optionCards.map((option, index) => {
              const requiresPurchase = Boolean(
                option && (
                  (activeTab === 'face' && option.id === 'face-4-default') ||
                  (activeTab === 'hair' && option.id.endsWith('-4')) ||
                  (activeTab === 'outfit' && option.id === 'outfit-4')
                )
              );
              const isBossSuit = activeTab === 'outfit' && option?.id === 'outfit-4';
              const memberBossSuitException = Boolean(isBossSuit && currentRole === 'member' && memberCanUseBossSuit);
              const roleLocked = Boolean(option?.allowedRoles && !option.allowedRoles.includes(currentRole) && !memberBossSuitException);
              const locked = Boolean(option && (roleLocked || (requiresPurchase && !unlockedOptionIds.has(option.id))));
              const price =
                activeTab === 'face' || (activeTab === 'outfit' && option?.id === 'outfit-4')
                  ? 250
                  : 200;
              const selected =
                (activeTab === 'face' && option?.id === selectedFace.id) ||
                (activeTab === 'hair' && option?.id === selectedHair.id) ||
                (activeTab === 'outfit' && option?.id === selectedOutfit.id && !roleLocked);
              const handleSelect = () => {
                if (!option) return;
                if (roleLocked) return;
                if (locked) {
                  onPurchaseRequest({ option, category: activeTab, price });
                  return;
                }
                if (activeTab === 'face') setSelectedFace(option);
                if (activeTab === 'hair') setSelectedHair(option);
                if (activeTab === 'outfit') setSelectedOutfit(option);
              };

              return (
                <AvatarOptionCard
                  key={option?.id ?? `placeholder-${index}`}
                  option={option}
                  selected={selected}
                  onSelect={handleSelect}
                  locked={locked}
                  roleLocked={roleLocked}
                  roleLockLabel={isBossSuit && currentRole === 'member' ? 'Unlock after entering workspace' : undefined}
                  price={price}
                  compact={activeTab === 'face' || activeTab === 'hair'}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function AvatarPurchaseModal({
  purchase,
  coinBalance,
  message,
  onCancel,
  onBuy,
}: {
  purchase: PendingAvatarPurchase;
  coinBalance: number;
  message: string;
  onCancel: () => void;
  onBuy: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#171329]/45 px-4 backdrop-blur-[3px]" role="presentation" onMouseDown={onCancel}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="avatar-purchase-title"
        onMouseDown={(event) => event.stopPropagation()}
        className="relative w-full max-w-[430px] rounded-[32px] border border-white/80 bg-white px-[32px] pb-[30px] pt-[34px] text-center shadow-[0_28px_80px_rgba(52,46,117,0.28)]"
      >
        <button
          type="button"
          onClick={onCancel}
          aria-label="Close purchase confirmation"
          className="absolute right-[18px] top-[18px] flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#f0eff8] text-[#858585] transition hover:text-[#685eeb]"
        >
          <X className="h-[18px] w-[18px]" strokeWidth={2.2} />
        </button>

        <div className="relative mx-auto h-[150px] w-[150px] rounded-[24px] border border-[#e2e0f0] bg-[linear-gradient(145deg,#f0eff8,#fbfaff)] p-[12px]">
          <Image src={purchase.option.optionCardSrc ?? purchase.option.src} alt={purchase.option.label} fill sizes="150px" className="object-contain p-[12px]" />
        </div>

        <h2 id="avatar-purchase-title" className="mt-[22px] text-[22px] font-extrabold text-[#111111]">
          Buy {purchase.option.label} for {purchase.price} coins?
        </h2>
        <div className="mt-[12px] inline-flex items-center gap-[6px] rounded-full bg-[#f0eff8] px-[12px] py-[7px] text-[14px] font-semibold text-[#5c5780]">
          <Image src={WARP_COIN_ASSET} alt="" width={22} height={22} className="h-[22px] w-[22px]" />
          Balance: {coinBalance}
        </div>

        {message ? (
          <p role="alert" className="mt-[14px] rounded-[12px] border border-[#ffcaca] bg-[#fff0f0] px-[14px] py-[10px] text-[13px] font-semibold text-[#c54e4e]">
            {message}
          </p>
        ) : null}

        <div className="mt-[26px] grid grid-cols-2 gap-[12px]">
          <button
            type="button"
            onClick={onCancel}
            className="h-[44px] rounded-[13px] border border-[#d8d3f2] bg-white text-[15px] font-bold text-[#685eeb] transition hover:bg-[#f7f5ff]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onBuy}
            className="inline-flex h-[44px] items-center justify-center gap-[7px] rounded-[13px] bg-[#685eeb] text-[15px] font-bold text-white shadow-[0_10px_22px_rgba(104,94,235,0.24)] transition hover:bg-[#5d54df]"
          >
            <Image src={WARP_COIN_ASSET} alt="" width={20} height={20} className="h-[20px] w-[20px]" />
            Buy
          </button>
        </div>
      </section>
    </div>
  );
}

function ProfileInfoCard({
  displayName,
  setDisplayName,
  position,
  setPosition,
  interests,
  setInterests,
  bio,
  setBio,
}: {
  displayName: string;
  setDisplayName: (value: string) => void;
  position: string;
  setPosition: (value: string) => void;
  interests: string[];
  setInterests: (value: string[]) => void;
  bio: string;
  setBio: (value: string) => void;
}) {
  const addRandomInterest = () => {
    const remainingInterests = interestPool.filter((interest) => !interests.includes(interest));
    if (remainingInterests.length === 0) return;

    const nextInterest = remainingInterests[Math.floor(Math.random() * remainingInterests.length)];
    setInterests([...interests, nextInterest]);
  };

  return (
    <section className="min-h-[440px] overflow-hidden rounded-[51px] border-2 border-white bg-white/50 shadow-[0_2px_17.7px_rgba(104,94,235,0.31)] backdrop-blur-[4px] lg:min-h-[539px]">
      <div className="space-y-[21px] px-[18px] py-[26px]">
        <label className="block">
          <span className="warp-font-display text-[14px] font-extrabold uppercase text-[#685EEB]">Display Name</span>
          <div className="mt-[13px] flex items-center gap-3 border-b border-[#A5A4A4] pb-[7px]">
            <input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Enter your name"
              className="min-w-0 flex-1 bg-transparent text-[16px] text-[#656565] placeholder:text-[#858585] outline-none"
            />
            <Pencil className="h-5 w-5 shrink-0 text-[#A5A4A4]" strokeWidth={2.4} />
          </div>
        </label>

        <label className="block">
          <span className="warp-font-display text-[14px] font-extrabold uppercase text-[#685EEB]">Position</span>
          <div className="mt-[13px] flex items-center gap-3 border-b border-[#A5A4A4] pb-[7px]">
            <input
              value={position}
              onChange={(event) => setPosition(event.target.value)}
              placeholder="Position"
              className="min-w-0 flex-1 bg-transparent text-[16px] text-[#656565] placeholder:text-[#858585] outline-none"
            />
            <Pencil className="h-5 w-5 shrink-0 text-[#A5A4A4]" strokeWidth={2.4} />
          </div>
        </label>

        <div>
          <span className="warp-font-display text-[14px] font-extrabold uppercase text-[#685EEB]">Interests &amp; Skills</span>
          <div className="mt-[12px] flex flex-wrap gap-[6px]">
            {interests.map((interest, index) => (
              <button
                key={`${interest}-${index}`}
                type="button"
                onClick={() => setInterests(interests.filter((_, currentIndex) => currentIndex !== index))}
                className="inline-flex h-[30px] items-center gap-[8px] rounded-[22px] border-2 border-[#685EEB] bg-[#DFDCFF] px-[12px] text-[12px] text-[#685EEB] transition hover:bg-[#E9E6FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#685EEB] focus-visible:ring-offset-2"
              >
                <span>{interest}</span>
                <X className="h-[10px] w-[10px]" strokeWidth={2.4} />
              </button>
            ))}
            <button
              type="button"
              onClick={addRandomInterest}
              className="inline-flex h-[30px] w-[30px] items-center justify-center rounded-full border-2 border-dashed border-[#A29BFC] text-[#685EEB] transition hover:border-[#685EEB] hover:bg-[#DFDCFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#685EEB] focus-visible:ring-offset-2"
              aria-label="Add random interest"
            >
              <Plus className="h-[14px] w-[14px]" strokeWidth={2.4} />
            </button>
          </div>
        </div>

        <label className="block">
          <span className="warp-font-display text-[14px] font-extrabold uppercase text-[#685EEB]">Bio</span>
          <textarea
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            rows={5}
            className="mt-[12px] min-h-[126px] w-full resize-none rounded-[28px] border border-[#A5A4A4] bg-white/60 px-[16px] py-[14px] text-[15px] text-[#656565] outline-none transition focus:border-[#685EEB] focus:ring-2 focus:ring-[#685EEB]/20 sm:rounded-[33px]"
          />
        </label>
      </div>
    </section>
  );
}

export function AvatarCreationPage() {
  const router = useRouter();
  const currentUserRole = useUserStore((state) => state.isInitialized ? state.currentUser?.role : null);
  const memberHasEnteredWorkspace = useUserStore((state) => state.memberHasEnteredWorkspace);
  const avatarProfile = useAvatarStore((state) => state.profile);
  const avatarSelection = useAvatarStore((state) => state.selection);
  const updateAvatarProfile = useAvatarStore((state) => state.updateProfile);
  const updateAvatarSelection = useAvatarStore((state) => state.updateAvatarSelection);
  const [isEditMode, setIsEditMode] = useState(false);
  const resolvedInitialRole = normalizeAppRole(currentUserRole) ?? 'member';
  const [avatarRole, setAvatarRole] = useState<AppRole>(resolvedInitialRole);
  const initialHairColorId = isHairColorId(avatarSelection.selectedHairColorId)
    ? avatarSelection.selectedHairColorId
    : 'brown';
  const initialBodyTone = isBodyToneId(avatarSelection.selectedBodyTone)
    ? avatarSelection.selectedBodyTone
    : 'light';
  const [activeTab, setActiveTab] = useState<AvatarTab>('face');
  const [selectedFace, setSelectedFace] = useState(() =>
    findAvatarOption(faceOptions, avatarSelection.selectedFaceId, faceOptions[0])
  );
  const [selectedHairColorId, setSelectedHairColorId] = useState<HairColorId>(initialHairColorId);
  const [selectedHair, setSelectedHair] = useState(() =>
    findAvatarOption(
      selectableHairOptionsByColor[initialHairColorId],
      avatarSelection.selectedHairId,
      selectableHairOptionsByColor[initialHairColorId][0],
    )
  );
  const [selectedOutfit, setSelectedOutfit] = useState(() =>
    resolvedInitialRole === 'member' && (!memberHasEnteredWorkspace || !isEditMode) && avatarSelection.selectedOutfitId === 'outfit-4'
      ? outfitOptions[2]
      : findAvatarOption(outfitOptions, avatarSelection.selectedOutfitId, outfitOptions[2])
  );
  const [selectedBodyTone, setSelectedBodyTone] = useState<BodyToneId>(initialBodyTone);
  const [undoStack, setUndoStack] = useState<AvatarSelectionSnapshot[]>([]);
  const [redoStack, setRedoStack] = useState<AvatarSelectionSnapshot[]>([]);
  const [coinBalance, setCoinBalance] = useState(250);
  const [unlockedOptionIds, setUnlockedOptionIds] = useState<Set<string>>(() => new Set([avatarSelection.selectedOutfitId]));
  const [pendingPurchase, setPendingPurchase] = useState<PendingAvatarPurchase | null>(null);
  const [purchaseMessage, setPurchaseMessage] = useState('');
  const [displayName, setDisplayName] = useState(() => avatarProfile.displayName);
  const [position, setPosition] = useState(() => avatarProfile.position);
  const [interests, setInterests] = useState<string[]>(() => avatarProfile.interests.length > 0 ? avatarProfile.interests : defaultInterests);
  const [bio, setBio] = useState(() => avatarProfile.bio);
  const memberCanUseBossSuit = avatarRole === 'member' && memberHasEnteredWorkspace && isEditMode;
  const canUseAvatarOption = (option: AvatarOption) => {
    if (!option.allowedRoles || option.allowedRoles.includes(avatarRole)) return true;
    return option.id === 'outfit-4' && memberCanUseBossSuit;
  };

  useEffect(() => {
    setIsEditMode(new URLSearchParams(window.location.search).get('mode') === 'edit');
  }, []);

  useEffect(() => {
    const nextRole = normalizeAppRole(localStorage.getItem(ROLE_STORAGE_KEY))
      ?? normalizeAppRole(currentUserRole)
      ?? 'member';
    setAvatarRole(nextRole);
    if (nextRole !== 'member' && avatarSelection.selectedOutfitId === 'outfit-4') {
      setSelectedOutfit(outfitOptions[3]);
    }
  }, [avatarSelection.selectedOutfitId, currentUserRole]);

  useEffect(() => {
    if (memberCanUseBossSuit && avatarSelection.selectedOutfitId === 'outfit-4') {
      setSelectedOutfit(outfitOptions[3]);
      return;
    }
    if (avatarRole !== 'member' || memberCanUseBossSuit || (selectedOutfit.id !== 'outfit-4' && avatarSelection.selectedOutfitId !== 'outfit-4')) return;
    const fallbackOutfit = outfitOptions[2];
    setSelectedOutfit(fallbackOutfit);
    setPendingPurchase((purchase) => purchase?.option.id === 'outfit-4' ? null : purchase);
    updateAvatarSelection({
      selectedOutfitId: fallbackOutfit.id,
      selectedOutfitSrc: fallbackOutfit.src,
      selectedOutfitType: outfitTypesById[fallbackOutfit.id],
    });
  }, [avatarRole, avatarSelection.selectedOutfitId, memberCanUseBossSuit, selectedOutfit.id, updateAvatarSelection]);

  const currentSelectionSnapshot = (): AvatarSelectionSnapshot => ({
    face: selectedFace,
    hair: selectedHair,
    outfit: selectedOutfit,
    hairColorId: selectedHairColorId,
    bodyTone: selectedBodyTone,
  });

  const restoreSelectionSnapshot = (snapshot: AvatarSelectionSnapshot) => {
    setSelectedFace(snapshot.face);
    setSelectedHair(snapshot.hair);
    setSelectedOutfit(avatarRole === 'member' && !memberCanUseBossSuit && snapshot.outfit.id === 'outfit-4' ? outfitOptions[2] : snapshot.outfit);
    setSelectedHairColorId(snapshot.hairColorId);
    setSelectedBodyTone(snapshot.bodyTone);
  };

  const recordSelectionChange = () => {
    setUndoStack((history) => [...history.slice(-19), currentSelectionSnapshot()]);
    setRedoStack([]);
  };

  const handleUndo = () => {
    const previous = undoStack.at(-1);
    if (!previous) return;

    setRedoStack((history) => [...history.slice(-19), currentSelectionSnapshot()]);
    setUndoStack((history) => history.slice(0, -1));
    restoreSelectionSnapshot(previous);
  };

  const handleRedo = () => {
    const next = redoStack.at(-1);
    if (!next) return;

    setUndoStack((history) => [...history.slice(-19), currentSelectionSnapshot()]);
    setRedoStack((history) => history.slice(0, -1));
    restoreSelectionSnapshot(next);
  };

  const handleFaceSelect = (option: AvatarOption) => {
    if (option.id === selectedFace.id) return;
    recordSelectionChange();
    setSelectedFace(option);
  };

  const handleHairSelect = (option: AvatarOption) => {
    if (option.id === selectedHair.id) return;
    recordSelectionChange();
    setSelectedHair(option);
  };

  const handleOutfitSelect = (option: AvatarOption) => {
    if (!canUseAvatarOption(option)) return;
    if (option.id === selectedOutfit.id) return;
    recordSelectionChange();
    setSelectedOutfit(option);
  };

  const closePurchaseModal = () => {
    setPendingPurchase(null);
    setPurchaseMessage('');
  };

  const handlePurchase = () => {
    if (!pendingPurchase) return;
    if (!canUseAvatarOption(pendingPurchase.option)) {
      setPurchaseMessage(avatarRole === 'member'
        ? 'Enter the workspace once, then return to Edit Profile to unlock Boss Suit.'
        : 'Boss Suit is available to Coordinators and Owners only.');
      return;
    }
    if (coinBalance < pendingPurchase.price) {
      setPurchaseMessage(`Not enough WARP coins. You need ${pendingPurchase.price - coinBalance} more.`);
      return;
    }

    setCoinBalance((balance) => balance - pendingPurchase.price);
    setUnlockedOptionIds((current) => new Set(current).add(pendingPurchase.option.id));
    if (pendingPurchase.category === 'face') handleFaceSelect(pendingPurchase.option);
    if (pendingPurchase.category === 'hair') handleHairSelect(pendingPurchase.option);
    if (pendingPurchase.category === 'outfit') handleOutfitSelect(pendingPurchase.option);
    closePurchaseModal();
  };

  const handleBodyToneSelect = (tone: BodyToneId) => {
    if (tone === selectedBodyTone) return;
    recordSelectionChange();
    setSelectedBodyTone(tone);
  };

  const handleDisplayNameChange = (value: string) => {
    setDisplayName(value);
    updateAvatarProfile({ displayName: value });
  };

  const handlePositionChange = (value: string) => {
    setPosition(value);
    updateAvatarProfile({ position: value });
  };

  const handleInterestsChange = (nextInterests: string[]) => {
    setInterests(nextInterests);
    updateAvatarProfile({ interests: nextInterests });
  };

  const handleBioChange = (value: string) => {
    setBio(value);
    updateAvatarProfile({ bio: value });
  };

  const handleContinue = () => {
    const safeSelectedOutfit = avatarRole === 'member' && !memberCanUseBossSuit && selectedOutfit.id === 'outfit-4' ? outfitOptions[2] : selectedOutfit;
    updateAvatarSelection({
      selectedFaceId: selectedFace.id,
      selectedFaceSrc: selectedFace.src,
      selectedHairId: selectedHair.id,
      selectedHairSrc: selectedHair.src,
      selectedHairColorId,
      selectedOutfitId: safeSelectedOutfit.id,
      selectedOutfitSrc: safeSelectedOutfit.src,
      selectedOutfitType: outfitTypesById[safeSelectedOutfit.id] ?? 'short',
      selectedBodyTone,
    });
    updateAvatarProfile({
      displayName: displayName.trim(),
      position: position.trim(),
      interests,
      bio: bio.trim(),
    });
    const storedRole = normalizeAppRole(localStorage.getItem(ROLE_STORAGE_KEY));
    const canonicalRole = storedRole ?? normalizeAppRole(currentUserRole) ?? 'member';
    localStorage.setItem(ROLE_STORAGE_KEY, canonicalRole);
    router.push(getRoleDestination(canonicalRole));
  };

  const handleHairColorSelect = (colorId: HairColorId) => {
    if (colorId === selectedHairColorId) return;
    recordSelectionChange();
    const nextHairOptions = selectableHairOptionsByColor[colorId];
    setSelectedHairColorId(colorId);
    if (!nextHairOptions.some((option) => option.id === selectedHair.id)) {
      setSelectedHair(nextHairOptions[0]);
    }
  };

  return (
    <main className="warp-font-ui min-h-screen overflow-x-hidden bg-[linear-gradient(108deg,#D5D2FF_2%,#F5F3EE_48%,#D9FFF4_108%)] px-[24px] py-[48px] text-[#050505] sm:px-[42px] sm:py-[52px]">
      <div className="mx-auto max-w-[1324px]">
        <div className="flex justify-center">
          <StepIndicator />
        </div>

        <header className="mt-[18px] sm:mt-[10px]">
          <h1 className="warp-font-display text-[34px] font-black leading-none text-black sm:text-[40px]">
            Create your <span className="bg-[linear-gradient(90deg,#685EEB_18%,#46D2D2_100%)] bg-clip-text text-transparent">Avatar</span>
          </h1>
          <p className="mt-[8px] text-[17px] font-light text-[#656565] sm:text-[20px]">
            Customize how you appear in your virtual workspace - make it you!
          </p>
        </header>

        <div className="mt-[48px] grid items-stretch gap-[12px] lg:grid-cols-[436px_minmax(430px,522px)_338px]">
          <AvatarPreview
            selectedFace={selectedFace}
            selectedHair={selectedHair}
            selectedOutfit={selectedOutfit}
            selectedHairColorId={selectedHairColorId}
            selectedBodyTone={selectedBodyTone}
            canUndo={undoStack.length > 0}
            canRedo={redoStack.length > 0}
            onUndo={handleUndo}
            onRedo={handleRedo}
            coinBalance={coinBalance}
          />

          <AvatarOptionsPanel
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            selectedFace={selectedFace}
            setSelectedFace={handleFaceSelect}
            selectedHair={selectedHair}
            setSelectedHair={handleHairSelect}
            selectedOutfit={selectedOutfit}
            setSelectedOutfit={handleOutfitSelect}
            selectedHairColorId={selectedHairColorId}
            setSelectedHairColorId={handleHairColorSelect}
            selectedBodyTone={selectedBodyTone}
            setSelectedBodyTone={handleBodyToneSelect}
            unlockedOptionIds={unlockedOptionIds}
            currentRole={avatarRole}
            memberCanUseBossSuit={memberCanUseBossSuit}
            onPurchaseRequest={(purchase) => {
              if (!canUseAvatarOption(purchase.option)) return;
              setPurchaseMessage('');
              setPendingPurchase(purchase);
            }}
          />

          <ProfileInfoCard
            displayName={displayName}
            setDisplayName={handleDisplayNameChange}
            position={position}
            setPosition={handlePositionChange}
            interests={interests}
            setInterests={handleInterestsChange}
            bio={bio}
            setBio={handleBioChange}
          />
        </div>

        <div className="mt-[14px] flex items-center justify-end gap-[10px] pr-[16px]">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex h-[38px] items-center justify-center rounded-[10px] border border-[#A5A4A4] bg-[#F9FBFD] px-[23px] text-[16px] font-semibold text-[#050505] transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#685EEB] focus-visible:ring-offset-2"
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleContinue}
            className="inline-flex h-[38px] items-center justify-center gap-2 rounded-[10px] bg-[#685EEB] px-[23px] text-[16px] font-semibold text-white shadow-[0_12px_24px_rgba(104,94,235,0.2)] transition hover:bg-[#5E54D8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#685EEB] focus-visible:ring-offset-2"
          >
            Save &amp; Continue
            <ChevronRight className="h-4 w-4" strokeWidth={2.4} />
          </button>
        </div>
      </div>
      {pendingPurchase ? (
        <AvatarPurchaseModal
          purchase={pendingPurchase}
          coinBalance={coinBalance}
          message={purchaseMessage}
          onCancel={closePurchaseModal}
          onBuy={handlePurchase}
        />
      ) : null}
    </main>
  );
}
