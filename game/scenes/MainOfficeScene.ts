import Phaser from 'phaser';
import type { AvatarSelection } from '@/stores/useAvatarStore';

// =============================================
//  ROOM DEFINITIONS
// =============================================

interface RoomDef {
  id: string;
  title: string;
  subtitle: string;
  gridColor: number;
  zones: { x: number; y: number; label: string }[];
  desks: { x: number; y: number; w: number; h: number; label: string; desc: string }[];
  teammates: {
    x: number;
    y: number;
    color: number;
    name: string;
    role: string;
    assetKey?: string;
    flipX?: boolean;
    displayRect?: FigmaRect;
  }[];
  doors: { x: number; y: number; w: number; h: number; label: string; targetRoom: string }[];
}

const ROOMS: Record<string, RoomDef> = {
  main: {
    id: 'main',
    title: 'Main Office',
    subtitle: 'Primary workspace',
    gridColor: 0x1e293b,
    zones: [],
    desks: [
      // Invisible hitbox over the table image — click to get popup
      { x: 0, y: 0, w: 180, h: 90, label: 'Meeting Table', desc: 'Team meeting area. Seats 6 people.' },
    ],
    teammates: [
      // Positioned relative to canvas in loadRoom(); these are overridden dynamically
      { x: 0, y: 0, color: 0x06b6d4, name: 'Jane', role: 'UI Designer' },
      { x: 0, y: 0, color: 0x10b981, name: 'Mark', role: 'Backend Eng.' },
      { x: 0, y: 0, color: 0xf59e0b, name: 'Sarah', role: 'Product Mgr.' },
    ],
    doors: [
      { x: 0, y: 0, w: 40, h: 90, label: '→ Lounge', targetRoom: 'lounge' },
    ],
  },
  lounge: {
    id: 'lounge',
    title: 'Team Lounge',
    subtitle: 'Break & social area',
    gridColor: 0x1a2332,
    zones: [
      { x: 250, y: 160, label: '☕ COFFEE BAR' },
      { x: 550, y: 400, label: '🎮 GAME CORNER' },
      { x: 200, y: 450, label: '🛋️ CHILL ZONE' },
    ],
    desks: [
      { x: 250, y: 220, w: 100, h: 50, label: 'Coffee Bar', desc: 'Espresso machine, cold brew tap, and snack shelf.' },
      { x: 550, y: 460, w: 130, h: 70, label: 'Game Table', desc: 'Board games, cards, and a mini arcade cabinet.' },
      { x: 150, y: 500, w: 120, h: 60, label: 'Sofa Area', desc: 'Comfortable couches for informal chats and breaks.' },
    ],
    teammates: [
      { x: 250, y: 260, color: 0xec4899, name: 'Leo', role: 'QA Engineer' },
      { x: 550, y: 420, color: 0x8b5cf6, name: 'Priya', role: 'Animator' },
    ],
    doors: [
      { x: 50, y: 300, w: 30, h: 80, label: '← Office', targetRoom: 'main' },
    ],
  },
};

// =============================================
//  CHAIR SPRITESHEET FRAME MAP
//  chair_front.png: 706x890, 3 cols × 3 rows
//  Each frame ≈ 235×296
//  Col 0=orange, Col 1=green, Col 2=blue
//  Row 0=normal, Row 1=hover, Row 2=with sit label
// =============================================

// Idle chairs use the base front/back PNGs.
// Hover and selected chairs use the outline PNGs in /hover.
// The "Sit" label is rendered as a small Phaser chip near the selected chair.

// =============================================
//  INTERNAL TYPES
// =============================================

interface TeammateData {
  circle: Phaser.GameObjects.Arc;
  sprite?: Phaser.GameObjects.Image;
  coworkerLayers?: RoomCoworkerLayers;
  name: string;
  role: string;
  color: number;
  x: number;
  y: number;
  inCall: boolean;
  playerJoined: boolean;
  callLabel?: Phaser.GameObjects.Container;
  callRing?: Phaser.GameObjects.Arc;
  callDomain?: Phaser.GameObjects.Arc;
  joinLabel?: Phaser.GameObjects.Container;
}

type SeatVariant = 'front' | 'back';
type SeatColor = 'orange' | 'green' | 'blue';
type SeatState = 'idle' | 'hover' | 'selected';
type SeatRow = 'top' | 'bottom';

const SEAT_ASSET_METRICS = {
  front: {
    idle: { width: 186, height: 227 },
    hover: { width: 169, height: 229, offsetX: 11, offsetY: 0 },
  },
  back: {
    idle: { width: 186, height: 214 },
    hover: { width: 169, height: 189, offsetX: 8, offsetY: 18 },
  },
} as const;

interface FigmaRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface FigmaPoint {
  x: number;
  y: number;
}

interface WalkBlockZone {
  id: string;
  rect: Phaser.Geom.Rectangle;
}

interface FigmaWalkBlockZone extends FigmaRect {
  id: string;
}

interface SeatData {
  id: string;
  idleSprite: Phaser.GameObjects.Image;
  hoverSprite: Phaser.GameObjects.Image;
  row: SeatRow;
  variant: SeatVariant;
  color: SeatColor;
  x: number;
  y: number;
  w: number;
  h: number;
  depth: number;
  state: SeatState;
  sitOverlay?: Phaser.GameObjects.Container;
}

const VIRTUAL_ROOM_ASSETS = {
  roomBase: '/assets/virtual-room/base/room_base.svg',
  table: '/assets/virtual-room/furniture/table.svg',
  tv: '/assets/virtual-room/furniture/tv_console.svg',
  door: '/assets/virtual-room/furniture/door 3.svg',
  doorHover: '/assets/virtual-room/furniture/door_hover.svg',
  chairFrontOrange: '/assets/virtual-room/chairs/front/chair_front_orange.svg',
  chairFrontGreen: '/assets/virtual-room/chairs/front/chair_front_green.svg',
  chairFrontBlue: '/assets/virtual-room/chairs/front/chair_front_blue.svg',
  chairBackOrange: '/assets/virtual-room/chairs/back/chair_back_orange.svg',
  chairBackGreen: '/assets/virtual-room/chairs/back/chair_back_green.svg',
  chairBackBlue: '/assets/virtual-room/chairs/back/chair_back_blue.svg',
  chairFrontHoverOrange: '/assets/virtual-room/chairs/hover/chair_front_hover_orange.png',
  chairFrontHoverGreen: '/assets/virtual-room/chairs/hover/chair_front_hover_green.png',
  chairFrontHoverBlue: '/assets/virtual-room/chairs/hover/chair_front_hover_blue.png',
  chairBackHoverOrange: '/assets/virtual-room/chairs/hover/chair_back_hover_orange.png',
  chairBackHoverGreen: '/assets/virtual-room/chairs/hover/chair_back_hover_green.png',
  chairBackHoverBlue: '/assets/virtual-room/chairs/hover/chair_back_hover_blue.png',
  sitPopupPrimary: '/assets/virtual-room/overlays/sit_popup_primary.png',
} as const;

type AvatarDirection = 'FR' | 'FL' | 'BR' | 'BL';
type HairLayerConfig = {
  texture: string;
  flipX: boolean;
  offsetX: number;
  offsetY: number;
};
type FaceLayerConfig = {
  visible: boolean;
  texture: string;
  flipX: boolean;
  offsetX: number;
  offsetY: number;
};

type OutfitIdleLayerConfig = {
  texture: string;
  flipX: boolean;
  offsetX: number;
  offsetY: number;
};
type OutfitWalkLayerConfig = {
  sourceDirection: AvatarDirection;
  flipX: boolean;
  offsetX: number;
  offsetY: number;
};
type BodyTone = 'light' | 'medium' | 'dark';
type OutfitType = 'long' | 'hoodie' | 'short' | 'suit';
type RoomCoworkerConfig = {
  id: string;
  x: number;
  y: number;
  direction: Extract<AvatarDirection, 'FR' | 'FL'>;
  bodyTone: BodyTone;
  bodyTextureKey?: string;
  outfitType: OutfitType;
  hairTextureKey: string;
  faceDefaultTextureKey: string;
  faceBlinkTextureKey: string;
  faceVisible?: boolean;
  faceFlipX?: boolean;
  depthOffset?: number;
};
type RoomCoworkerLayers = {
  id: string;
  shadow?: Phaser.GameObjects.Sprite;
  body: Phaser.GameObjects.Sprite;
  outfit: Phaser.GameObjects.Sprite;
  hair?: Phaser.GameObjects.Sprite;
  face?: Phaser.GameObjects.Sprite;
  faceDefaultTextureKey: string;
  faceBlinkTextureKey: string;
  blinkEvent?: Phaser.Time.TimerEvent;
  hitArea?: Phaser.GameObjects.Arc;
};

const AVATAR_BODY_BASE_PATH = '/assets/avatar/walk/body';
const AVATAR_OUTFIT_BASE_PATH = '/assets/avatar/walk/outfit';
const AVATAR_HAIR_BASE_PATH = '/assets/avatar/walk/hair/source';
const AVATAR_FACE_BASE_PATH = '/assets/avatar/walk/face/source';
const AVATAR_SHADOW_ASSET_PATH = '/assets/avatar/walk/shadow/SHADOW_BASE.png';
const COWORKER_SHADOW_ASSET_PATH = '/assets/avatar/walk/shadow/source/Frame%203852%20(3).png';
const AVATAR_DEPTH_OFFSET = 16;
const AVATAR_DISPLAY_SIZE = 180;
const AVATAR_WALK_FRAME_RATE = 16;
const AVATAR_FACE_BLINK_INTERVAL_MS = 3500;
const AVATAR_FACE_BLINK_DURATION_MS = 140;
const AVATAR_DIRECTIONS: AvatarDirection[] = ['FR', 'FL', 'BR', 'BL'];
const PLAYER_BODY_TONES: BodyTone[] = ['light', 'medium', 'dark'];
const PLAYER_OUTFIT_TYPES: OutfitType[] = ['long', 'hoodie', 'short', 'suit'];
const COWORKER_IDLE_DIRECTIONS: Extract<AvatarDirection, 'FR' | 'FL'>[] = ['FR', 'FL'];
const COWORKER_DISPLAY_SIZE = AVATAR_DISPLAY_SIZE;
const COWORKER_BLINK_INTERVAL_MS = 3200;
const COWORKER_BLINK_DURATION_MS = 130;
const COWORKER_OUTFIT_IDLE_FILES: Record<OutfitType, string> = {
  long: 'outfit1_idle.png',
  hoodie: 'outfit2_idle.png',
  short: 'outfit3_idle.png',
  suit: 'outfit4_idle.png',
};
const PLAYER_OUTFIT_IDLE_FILES: Record<OutfitType, { front: string; back: string }> = {
  long: { front: 'outfit1_idle.png', back: 'outfit1_idle_back.png' },
  hoodie: { front: 'outfit2_idle.png', back: 'outfit2_idle_back.png' },
  short: { front: 'outfit3_idle_front left.png', back: 'outfit3_idle_back right.png' },
  suit: { front: 'outfit4_idle.png', back: 'outfit4_idle_back.png' },
};
const HAIR_COLOR_SUFFIX_BY_ID: Record<string, string> = {
  brown: '1',
  dark: '2',
  blonde: '3',
};
const DEFAULT_PLAYER_AVATAR_SELECTION: Pick<
  AvatarSelection,
  'selectedFaceId' | 'selectedHairId' | 'selectedHairColorId' | 'selectedOutfitType' | 'selectedBodyTone'
> = {
  selectedFaceId: 'face-1-default',
  selectedHairId: 'hair-brown-1',
  selectedHairColorId: 'brown',
  selectedOutfitType: 'short',
  selectedBodyTone: 'light',
};
const MAIN_ROOM_COWORKER_CONFIGS: Omit<RoomCoworkerConfig, 'x' | 'y'>[] = [
  {
    id: 'coworker-left',
    direction: 'FR',
    bodyTone: 'medium',
    outfitType: 'suit',
    hairTextureKey: 'avatar-coworker-hair-4',
    faceDefaultTextureKey: 'avatar-coworker-face-4-default',
    faceBlinkTextureKey: 'avatar-coworker-face-4-blink',
  },
  {
    id: 'coworker-middle',
    direction: 'FL',
    bodyTone: 'light',
    outfitType: 'hoodie',
    hairTextureKey: 'avatar-coworker-hair-2-1',
    faceDefaultTextureKey: 'avatar-coworker-face-2-default-2',
    faceBlinkTextureKey: 'avatar-coworker-face-2-blink-2',
    faceFlipX: false,
  },
  {
    id: 'coworker-right',
    direction: 'FL',
    bodyTone: 'dark',
    bodyTextureKey: 'avatar-coworker-body-dark-FL-idle-tone',
    outfitType: 'short',
    hairTextureKey: 'avatar-coworker-hair-1-3',
    faceDefaultTextureKey: 'avatar-coworker-face-1-default-2',
    faceBlinkTextureKey: 'avatar-coworker-face-1-blink-2',
    faceFlipX: false,
  },
];
const PLAYER_MAIN_ROOM_BOUNDS_RATIO = {
  left: 0.1,
  right: 0.86,
  top: 0.35,
  bottom: 0.84,
} as const;
const ENABLE_STRICT_ROOM_WALK_BOUNDS = false;
const DEBUG_WALK_ZONES = false;
const ROOM_CHARACTER_DISPLAY_SCALE = 0.82;
const MAIN_ROOM_SAFE_SPAWN_FOOT: FigmaPoint = { x: 590, y: 760 };
const MAIN_ROOM_WALKABLE_FLOOR_POLYGON: FigmaPoint[] = [
  { x: 88, y: 505 },
  { x: 390, y: 288 },
  { x: 923, y: 405 },
  { x: 1088, y: 526 },
  { x: 693, y: 877 },
  { x: 115, y: 610 },
];
const MAIN_ROOM_BLOCK_ZONES: FigmaWalkBlockZone[] = [
  { id: 'left-drawer-cabinet', x: 92, y: 403, w: 222, h: 151 },
  { id: 'tv-console-and-wall', x: 185, y: 222, w: 362, h: 158 },
  { id: 'bookshelf-plant-wall', x: 438, y: 164, w: 248, h: 204 },
  { id: 'door-and-right-wall', x: 879, y: 249, w: 253, h: 270 },
  { id: 'table-center', x: 432, y: 441, w: 335, h: 141 },
  { id: 'front-chair-orange', x: 570, y: 448, w: 95, h: 76 },
  { id: 'front-chair-green', x: 652, y: 485, w: 96, h: 78 },
  { id: 'front-chair-blue', x: 736, y: 522, w: 96, h: 82 },
  { id: 'back-chair-orange', x: 355, y: 542, w: 96, h: 80 },
  { id: 'back-chair-green', x: 436, y: 581, w: 96, h: 82 },
  { id: 'back-chair-blue', x: 516, y: 616, w: 98, h: 84 },
  { id: 'right-chair-person-zone', x: 815, y: 560, w: 154, h: 150 },
  { id: 'lower-left-platform-lip', x: 74, y: 585, w: 198, h: 88 },
];
const AVATAR_BODY_WALK_FILES: Record<AvatarDirection, string[]> = {
  FR: Array.from({ length: 13 }, (_, index) => `base_walk${String(index + 1).padStart(4, '0')} 1.png`),
  FL: Array.from({ length: 13 }, (_, index) => `base_walk${String(index + 1).padStart(4, '0')} 1.png`),
  BR: Array.from({ length: 13 }, (_, index) => `walkcycle_back_${String(index + 1).padStart(4, '0')} 1.png`),
  BL: Array.from({ length: 13 }, (_, index) => `walkcycle_back_${String(index + 1).padStart(4, '0')} 1.png`),
};

function avatarBodyIdleFile(tone: BodyTone, direction: AvatarDirection): string {
  return `base_${tone}_idle_${direction}.png`;
}

function avatarBodyTextureKey(tone: BodyTone, direction: AvatarDirection, frame: 'idle' | number): string {
  return `avatar-body-${tone}-${direction}-${frame}`;
}

function avatarBodyAssetPath(tone: BodyTone, direction: AvatarDirection, fileName: string): string {
  return `${AVATAR_BODY_BASE_PATH}/${tone}/${direction}/${encodeURIComponent(fileName)}`;
}

function coworkerBodyTextureKey(tone: BodyTone, direction: AvatarDirection): string {
  return `avatar-coworker-body-${tone}-${direction}-idle`;
}

function coworkerBodyAssetPath(tone: BodyTone, direction: AvatarDirection): string {
  return `/assets/avatar/walk/body/${tone}/source/${direction === 'FR' || direction === 'FL' ? 'base_idle.png' : 'base_idle_back.png'}`;
}

function avatarOutfitWalkFile(outfitType: OutfitType, direction: AvatarDirection, frameNumber: number): string {
  const frame = String(frameNumber).padStart(4, '0');
  const isBack = direction === 'BR' || direction === 'BL';

  if (isBack) {
    const backPrefixByOutfit: Record<OutfitType, string> = {
      long: 'OUTFIT_1_back_',
      hoodie: 'OUTFIT_2_back_',
      short: 'OUTFIT_3_back_',
      suit: 'OUTFIT_4_back_',
    };
    return `${backPrefixByOutfit[outfitType]}${frame} 1.png`;
  }

  const frontPrefixByOutfit: Record<OutfitType, string> = {
    long: 'outfit_1_right_front_',
    hoodie: 'outfit_2_front',
    short: 'outfit_3_front_',
    suit: 'outfit_4_front_',
  };
  return `${frontPrefixByOutfit[outfitType]}${frame} 1.png`;
}

function avatarOutfitTextureKey(outfitType: OutfitType, direction: AvatarDirection, frame: 'idle' | number): string {
  return `avatar-outfit-${outfitType}-${direction}-${frame}`;
}

function avatarOutfitAssetPath(outfitType: OutfitType, direction: AvatarDirection, fileName: string): string {
  const isIdle = Object.values(PLAYER_OUTFIT_IDLE_FILES[outfitType]).includes(fileName);
  return `${AVATAR_OUTFIT_BASE_PATH}/${outfitType}${isIdle ? '' : `/${direction}`}/${encodeURIComponent(fileName)}`;
}

function coworkerOutfitTextureKey(outfitType: OutfitType): string {
  return `avatar-coworker-outfit-${outfitType}-idle`;
}

function coworkerOutfitAssetPath(outfitType: OutfitType): string {
  return `/assets/avatar/walk/outfit/${outfitType}/source/${encodeURIComponent(COWORKER_OUTFIT_IDLE_FILES[outfitType])}`;
}

function avatarHairAssetPath(fileName: string): string {
  return `${AVATAR_HAIR_BASE_PATH}/${encodeURIComponent(fileName)}`;
}

function avatarHairColorVariantAssetPath(fileName: string): string {
  return `/assets/avatar/walk/hair/${encodeURIComponent(fileName)}`;
}

function avatarFaceAssetPath(fileName: string): string {
  return `${AVATAR_FACE_BASE_PATH}/${encodeURIComponent(fileName)}`;
}

function avatarFaceVariantAssetPath(fileName: string): string {
  return `/assets/avatar/walk/face/${encodeURIComponent(fileName)}`;
}

function avatarHairTextureKey(styleIndex: number, colorSuffix: string, side: 'front' | 'back'): string {
  return `avatar-player-hair-${styleIndex}-${colorSuffix}-${side}`;
}

function avatarFaceTextureKey(faceIndex: number, state: 'default' | 'blink'): string {
  return `avatar-player-face-${faceIndex}-${state}`;
}

function getSelectionFaceIndex(selection: Pick<AvatarSelection, 'selectedFaceId'>): number {
  const match = selection.selectedFaceId.match(/face-(\d+)/);
  const faceIndex = match ? Number(match[1]) : 1;
  return faceIndex >= 1 && faceIndex <= 4 ? faceIndex : 1;
}

function getSelectionHairStyleIndex(selection: Pick<AvatarSelection, 'selectedHairId'>): number {
  const match = selection.selectedHairId.match(/hair-[^-]+-(\d+)/);
  const hairIndex = match ? Number(match[1]) : 1;
  return hairIndex >= 1 && hairIndex <= 4 ? hairIndex : 1;
}

function getSelectionHairColorSuffix(selection: Pick<AvatarSelection, 'selectedHairColorId'>): string {
  return HAIR_COLOR_SUFFIX_BY_ID[selection.selectedHairColorId] ?? HAIR_COLOR_SUFFIX_BY_ID.brown;
}

function getSelectionOutfitType(selection: Pick<AvatarSelection, 'selectedOutfitType'>): OutfitType {
  return PLAYER_OUTFIT_TYPES.includes(selection.selectedOutfitType as OutfitType)
    ? selection.selectedOutfitType as OutfitType
    : 'short';
}

function getSelectionBodyTone(selection: Pick<AvatarSelection, 'selectedBodyTone'>): BodyTone {
  return PLAYER_BODY_TONES.includes(selection.selectedBodyTone as BodyTone)
    ? selection.selectedBodyTone as BodyTone
    : 'light';
}

const FIGMA_MAIN_ROOM = {
  roomBase: { x: 8, y: 127, w: 1274.9627685546875, h: 779.8630981445312 },
  tv: { x: 232.869140625, y: 143.8271484375, w: 291.2351379394531, h: 372.7810363769531 },
  table: { x: 402.1380920410156, y: 389.75921630859375, w: 387.66632080078125, h: 269.8779296875 },
  door: { x: 974.2535400390625, y: 272.61749267578125, w: 135.90972900390625, h: 300.29583740234375 },
  characters: [
    { id: 'coworker-left', x: 186, y: 440, w: 180, h: 180 },
    { id: 'coworker-middle', x: 714, y: 552, w: 180, h: 180 },
    { id: 'coworker-right', x: 852, y: 479.91, w: 180, h: 180 },
  ] as Array<FigmaRect & { id: string }>,
  seats: [
    { id: 'front-orange', row: 'top', variant: 'front', color: 'orange', x: 565.2298583984375, y: 352.8690185546875, w: 120.377197265625, h: 146.91197204589844 },
    { id: 'front-green', row: 'top', variant: 'front', color: 'green', x: 647.423095703125, y: 389.1114501953125, w: 120.377197265625, h: 146.91197204589844 },
    { id: 'front-blue', row: 'top', variant: 'front', color: 'blue', x: 731.5571899414062, y: 426.00164794921875, w: 120.377197265625, h: 146.91197204589844 },
    { id: 'back-orange', row: 'bottom', variant: 'back', color: 'orange', x: 351.65777587890625, y: 477.77667236328125, w: 120.377197265625, h: 138.49850463867188 },
    { id: 'back-green', row: 'bottom', variant: 'back', color: 'green', x: 432.5563049316406, y: 515.9607543945312, w: 120.377197265625, h: 138.49850463867188 },
    { id: 'back-blue', row: 'bottom', variant: 'back', color: 'blue', x: 512.807861328125, y: 551.5562744140625, w: 120.377197265625, h: 138.49850463867188 },
  ] as Array<FigmaRect & { id: string; row: SeatRow; variant: SeatVariant; color: SeatColor }>,
} as const;

interface DeskData {
  rect: Phaser.GameObjects.Rectangle;
  label: string;
  description: string;
  x: number;
  y: number;
}

// =============================================
//  SCENE
// =============================================

export default class MainOfficeScene extends Phaser.Scene {
  private static readonly DEFAULT_ZOOM = 1;
  private static readonly MIN_ZOOM = 0.8;
  private static readonly MAX_ZOOM = 1.35;
  private static readonly ZOOM_STEP = 0.1;
  private static readonly VISUAL_CAMERA_Y_OFFSET = 70;

  private player!: Phaser.Physics.Arcade.Sprite;
  private playerShadow!: Phaser.GameObjects.Sprite;
  private playerOutfit!: Phaser.GameObjects.Sprite;
  private playerHair!: Phaser.GameObjects.Sprite;
  private playerFace!: Phaser.GameObjects.Sprite;
  private playerLabel!: Phaser.GameObjects.Text;
  private playerAvatarSelection: Pick<
    AvatarSelection,
    'selectedFaceId' | 'selectedHairId' | 'selectedHairColorId' | 'selectedOutfitType' | 'selectedBodyTone'
  >;
  private playerBodyTone: BodyTone = 'light';
  private playerOutfitType: OutfitType = 'short';
  private playerHairStyleIndex = 1;
  private playerHairColorSuffix = HAIR_COLOR_SUFFIX_BY_ID.brown;
  private playerFaceIndex = 1;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };
  private speed: number = 250;
  private lastAvatarDirection: AvatarDirection = 'FR';
  private isPlayerWalking = false;
  private activeWalkDirection: AvatarDirection | null = null;
  private activeBodyWalkAnimationKey: string | null = null;
  private activeOutfitWalkAnimationKey: string | null = null;
  private isFaceBlinking = false;
  private blinkEvent?: Phaser.Time.TimerEvent;

  private currentRoomId: string = 'main';
  private teammates: TeammateData[] = [];
  private desks: DeskData[] = [];
  private seats: SeatData[] = [];
  private roomCoworkers: RoomCoworkerLayers[] = [];
  private hoveredSeat: SeatData | null = null;
  private selectedSeat: SeatData | null = null;
  private roomObjects: Phaser.GameObjects.GameObject[] = [];

  private activeMenu: Phaser.GameObjects.Container | null = null;
  private activePopup: Phaser.GameObjects.Container | null = null;
  private notifContainer: Phaser.GameObjects.Container | null = null;
  private roomTitleText!: Phaser.GameObjects.Text;
  private roomSubText!: Phaser.GameObjects.Text;
  private movementInputBlocked = false;
  private focusSyncTimeout: number | null = null;
  private sceneZoom = MainOfficeScene.DEFAULT_ZOOM;
  private mainRoomBounds: Phaser.Geom.Rectangle | null = null;
  private playerMovementBounds: Phaser.Geom.Rectangle | null = null;
  private playerWalkablePolygon: Phaser.Geom.Polygon | null = null;
  private playerBlockZones: WalkBlockZone[] = [];
  private lastValidPlayerPosition = new Phaser.Math.Vector2(400, 300);
  private debugWalkZoneGraphics?: Phaser.GameObjects.Graphics;
  private isSceneReady = false;
  private isSceneShuttingDown = false;
  private handleExternalRoomSwitch = (event: Event) => {
    const customEvent = event as CustomEvent<{ roomId?: string }>;
    const nextRoomId = customEvent.detail?.roomId;

    if (!nextRoomId || nextRoomId === this.currentRoomId || !ROOMS[nextRoomId]) {
      return;
    }

    this.switchRoom(nextRoomId);
  };
  private handleAvatarSelectionChanged = (event: Event) => {
    const customEvent = event as CustomEvent<Partial<AvatarSelection>>;
    this.applyPlayerAvatarSelection(customEvent.detail);
  };
  private handleDocumentFocusChange = () => {
    if (typeof window === 'undefined') {
      return;
    }

    if (this.focusSyncTimeout !== null) {
      window.clearTimeout(this.focusSyncTimeout);
    }

    this.focusSyncTimeout = window.setTimeout(() => {
      this.focusSyncTimeout = null;
      this.syncMovementKeyboardState();
    }, 0);
  };
  private handleWindowBlur = () => {
    this.syncMovementKeyboardState(true);
  };
  private handleWindowFocus = () => {
    this.focusGameInput();
  };
  private handleViewportControl = (event: Event) => {
    if (!this.canApplySceneViewport()) {
      return;
    }

    const customEvent = event as CustomEvent<{ action?: 'zoom-in' | 'zoom-out' }>;
    const action = customEvent.detail?.action;

    if (action === 'zoom-in') {
      this.setSceneZoom(this.sceneZoom + MainOfficeScene.ZOOM_STEP);
    } else if (action === 'zoom-out') {
      this.setSceneZoom(this.sceneZoom - MainOfficeScene.ZOOM_STEP);
    }
  };
  private handleScaleResize = () => {
    if (this.isSceneShuttingDown || !this.sys?.isActive()) {
      return;
    }

    this.loadRoom(this.currentRoomId);
  };

  constructor(avatarSelection = DEFAULT_PLAYER_AVATAR_SELECTION) {
    super({ key: 'MainOfficeScene' });
    this.playerAvatarSelection = { ...DEFAULT_PLAYER_AVATAR_SELECTION, ...avatarSelection };
    this.applyPlayerAvatarSelection(this.playerAvatarSelection, false);
  }

  // =============================================
  //  PRELOAD — load all image assets
  // =============================================

  preload() {
    this.load.image('room_base', VIRTUAL_ROOM_ASSETS.roomBase);
    this.load.image('table', VIRTUAL_ROOM_ASSETS.table);
    this.load.image('tv', VIRTUAL_ROOM_ASSETS.tv);
    this.load.image('door_main', VIRTUAL_ROOM_ASSETS.door);
    this.load.image('door_hover', VIRTUAL_ROOM_ASSETS.doorHover);
    this.load.image('chair_front_orange', VIRTUAL_ROOM_ASSETS.chairFrontOrange);
    this.load.image('chair_front_green', VIRTUAL_ROOM_ASSETS.chairFrontGreen);
    this.load.image('chair_front_blue', VIRTUAL_ROOM_ASSETS.chairFrontBlue);
    this.load.image('chair_back_orange', VIRTUAL_ROOM_ASSETS.chairBackOrange);
    this.load.image('chair_back_green', VIRTUAL_ROOM_ASSETS.chairBackGreen);
    this.load.image('chair_back_blue', VIRTUAL_ROOM_ASSETS.chairBackBlue);
    this.load.image('chair_front_hover_orange', VIRTUAL_ROOM_ASSETS.chairFrontHoverOrange);
    this.load.image('chair_front_hover_green', VIRTUAL_ROOM_ASSETS.chairFrontHoverGreen);
    this.load.image('chair_front_hover_blue', VIRTUAL_ROOM_ASSETS.chairFrontHoverBlue);
    this.load.image('chair_back_hover_orange', VIRTUAL_ROOM_ASSETS.chairBackHoverOrange);
    this.load.image('chair_back_hover_green', VIRTUAL_ROOM_ASSETS.chairBackHoverGreen);
    this.load.image('chair_back_hover_blue', VIRTUAL_ROOM_ASSETS.chairBackHoverBlue);
    this.load.image('sit_popup_primary', VIRTUAL_ROOM_ASSETS.sitPopupPrimary);
    this.load.image('avatar-shadow', AVATAR_SHADOW_ASSET_PATH);
    [1, 2, 3, 4].forEach((hairIndex) => {
      ['1', '2', '3'].forEach((colorSuffix) => {
        this.load.image(
          avatarHairTextureKey(hairIndex, colorSuffix, 'front'),
          avatarHairColorVariantAssetPath(`hair_${hairIndex} ${colorSuffix}.png`),
        );
        this.load.image(
          avatarHairTextureKey(hairIndex, colorSuffix, 'back'),
          avatarHairColorVariantAssetPath(`hair_${hairIndex}_back ${colorSuffix}.png`),
        );
      });
    });
    [1, 2, 3, 4].forEach((faceIndex) => {
      this.load.image(avatarFaceTextureKey(faceIndex, 'default'), avatarFaceAssetPath(`face_${faceIndex}_default.png`));
      this.load.image(avatarFaceTextureKey(faceIndex, 'blink'), avatarFaceAssetPath(`face_${faceIndex}_blink.png`));
    });
    this.load.image('avatar-coworker-shadow', COWORKER_SHADOW_ASSET_PATH);
    this.load.image('avatar-coworker-hair-1', avatarHairAssetPath('hair_1.png'));
    this.load.image('avatar-coworker-hair-1-3', avatarHairColorVariantAssetPath('hair_1 3.png'));
    this.load.image('avatar-coworker-hair-2', avatarHairAssetPath('hair_2.png'));
    this.load.image('avatar-coworker-hair-2-1', avatarHairColorVariantAssetPath('hair_2 1.png'));
    this.load.image('avatar-coworker-hair-3', avatarHairColorVariantAssetPath('hair_3 3.png'));
    this.load.image('avatar-coworker-hair-4', avatarHairColorVariantAssetPath('hair_4 2.png'));
    this.load.image('avatar-coworker-face-1-default', avatarFaceAssetPath('face_1_default.png'));
    this.load.image('avatar-coworker-face-1-blink', avatarFaceAssetPath('face_1_blink.png'));
    this.load.image('avatar-coworker-face-1-default-2', avatarFaceVariantAssetPath('face_1_default 2.png'));
    this.load.image('avatar-coworker-face-1-blink-2', avatarFaceVariantAssetPath('face_1_blink 2.png'));
    this.load.image('avatar-coworker-face-2-default-2', avatarFaceVariantAssetPath('face_2_default 2.png'));
    this.load.image('avatar-coworker-face-2-blink-2', avatarFaceVariantAssetPath('face_2_blink 2.png'));
    this.load.image('avatar-coworker-face-3-default', avatarFaceAssetPath('face_3_default.png'));
    this.load.image('avatar-coworker-face-3-blink', avatarFaceAssetPath('face_3_blink.png'));
    this.load.image('avatar-coworker-face-4-default', avatarFaceAssetPath('face_4_default.png'));
    this.load.image('avatar-coworker-face-4-blink', avatarFaceAssetPath('face_4_blink.png'));
    this.load.image('avatar-coworker-body-dark-FL-idle-tone', '/assets/avatar/walk/body/dark/FL/base_dark_idle_FL.png');
    (['light', 'medium', 'dark'] as BodyTone[]).forEach((tone) => {
      COWORKER_IDLE_DIRECTIONS.forEach((direction) => {
        this.load.image(
          coworkerBodyTextureKey(tone, direction),
          coworkerBodyAssetPath(tone, direction),
        );
      });
    });
    (['long', 'hoodie', 'short', 'suit'] as OutfitType[]).forEach((outfitType) => {
      this.load.image(coworkerOutfitTextureKey(outfitType), coworkerOutfitAssetPath(outfitType));
    });

    PLAYER_BODY_TONES.forEach((tone) => {
      AVATAR_DIRECTIONS.forEach((direction) => {
        this.load.image(
          avatarBodyTextureKey(tone, direction, 'idle'),
          avatarBodyAssetPath(tone, direction, avatarBodyIdleFile(tone, direction)),
        );

        AVATAR_BODY_WALK_FILES[direction].forEach((fileName, index) => {
          this.load.image(
            avatarBodyTextureKey(tone, direction, index + 1),
            avatarBodyAssetPath(tone, direction, fileName),
          );
        });
      });
    });

    PLAYER_OUTFIT_TYPES.forEach((outfitType) => {
      AVATAR_DIRECTIONS.forEach((direction) => {
        const idleFile = direction === 'FR' || direction === 'FL'
          ? PLAYER_OUTFIT_IDLE_FILES[outfitType].front
          : PLAYER_OUTFIT_IDLE_FILES[outfitType].back;
        this.load.image(
          avatarOutfitTextureKey(outfitType, direction, 'idle'),
          avatarOutfitAssetPath(outfitType, direction, idleFile),
        );

        Array.from({ length: 13 }, (_, index) => avatarOutfitWalkFile(outfitType, direction, index + 1)).forEach((fileName, index) => {
          this.load.image(
            avatarOutfitTextureKey(outfitType, direction, index + 1),
            avatarOutfitAssetPath(outfitType, direction, fileName),
          );
        });
      });
    });
  }

  private applyCoworkerTextureSmoothing() {
    [
      'avatar-coworker-body-dark-FL-idle-tone',
      'avatar-coworker-hair-2-1',
      'avatar-coworker-face-2-default-2',
      'avatar-coworker-face-2-blink-2',
      'avatar-coworker-hair-1-3',
      'avatar-coworker-face-1-default-2',
      'avatar-coworker-face-1-blink-2',
    ].forEach((textureKey) => {
      if (this.textures.exists(textureKey)) {
        this.textures.get(textureKey).setFilter(Phaser.Textures.FilterMode.LINEAR);
      }
    });
  }

  create() {
    this.isSceneShuttingDown = false;
    this.cameras.main.setBackgroundColor('rgba(0,0,0,0)');

    // --- Room title HUD (top-right, persistent) ---
    const width = this.cameras.main.width;
    this.roomTitleText = this.add.text(width - 20, 18, '', {
      fontSize: '14px', color: '#6366f1', fontStyle: 'bold'
    }).setOrigin(1, 0).setDepth(50).setScrollFactor(0).setVisible(false);
    this.roomSubText = this.add.text(width - 20, 36, '', {
      fontSize: '10px', color: '#9ca3af'
    }).setOrigin(1, 0).setDepth(50).setScrollFactor(0).setVisible(false);

    this.createAvatarAnimations();
    this.applyCoworkerTextureSmoothing();

    // --- Player Avatar (persistent across rooms) ---
    this.player = this.physics.add.sprite(400, 300, this.getBodyIdleTexture(this.lastAvatarDirection));
    this.player.setOrigin(0.5, 0.88);
    this.player.setDisplaySize(AVATAR_DISPLAY_SIZE, AVATAR_DISPLAY_SIZE);
    this.player.setCollideWorldBounds(true);
    this.player.body?.setSize(26, 20, true);
    this.updatePlayerDepth();

    this.playerShadow = this.add.sprite(400, 300, 'avatar-shadow');
    this.playerShadow.setOrigin(0.5, 0.88);
    this.playerShadow.setDisplaySize(AVATAR_DISPLAY_SIZE, AVATAR_DISPLAY_SIZE);

    this.playerOutfit = this.add.sprite(400, 300, this.getOutfitIdleTexture(this.lastAvatarDirection));
    this.applyOutfitVisualTransform();
    this.applyOutfitIdleLayerConfig();

    this.playerHair = this.add.sprite(400, 300, this.getHairLayerConfig(this.lastAvatarDirection).texture);
    this.playerHair.setOrigin(0.5, 0.88);
    this.playerHair.setDisplaySize(AVATAR_DISPLAY_SIZE, AVATAR_DISPLAY_SIZE);
    this.applyHairLayerConfig();

    this.playerFace = this.add.sprite(400, 300, this.getFaceLayerConfig(this.lastAvatarDirection).texture);
    this.playerFace.setOrigin(0.5, 0.88);
    this.playerFace.setDisplaySize(AVATAR_DISPLAY_SIZE, AVATAR_DISPLAY_SIZE);
    this.applyFaceLayerConfig();
    this.syncAvatarLayers();

    this.playerLabel = this.add.text(400, 270, 'You', {
      fontSize: '11px', color: '#6366f1', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(5).setVisible(false);

    this.events.on('update', () => {
      this.playerLabel.setPosition(this.player.x, this.player.y - 22);
      this.playerLabel.setDepth(this.player.depth + 4);
    });

    this.blinkEvent = this.time.addEvent({
      delay: AVATAR_FACE_BLINK_INTERVAL_MS,
      loop: true,
      callback: () => this.triggerFaceBlink(),
    });

    // --- Keyboard Input ---
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd = {
        W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W, false),
        A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A, false),
        S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S, false),
        D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D, false),
      };

      this.input.keyboard.removeCapture([
        Phaser.Input.Keyboard.KeyCodes.SPACE,
        Phaser.Input.Keyboard.KeyCodes.W,
        Phaser.Input.Keyboard.KeyCodes.A,
        Phaser.Input.Keyboard.KeyCodes.S,
        Phaser.Input.Keyboard.KeyCodes.D,
      ]);
    }

    // --- Click-away to dismiss menus ---
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.focusGameInput();
      const hitObjects = this.input.hitTestPointer(pointer);
      if (hitObjects.length === 0) this.dismissAllOverlays();
    });

    if (typeof window !== 'undefined') {
      window.addEventListener('warp:switch-room', this.handleExternalRoomSwitch as EventListener);
      window.addEventListener('warp:viewport-control', this.handleViewportControl as EventListener);
      window.addEventListener('warp:avatar-selection-changed', this.handleAvatarSelectionChanged as EventListener);
      window.addEventListener('blur', this.handleWindowBlur);
      window.addEventListener('focus', this.handleWindowFocus);
      document.addEventListener('focusin', this.handleDocumentFocusChange);
      document.addEventListener('focusout', this.handleDocumentFocusChange);
      this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
        this.isSceneReady = false;
        this.isSceneShuttingDown = true;
        window.removeEventListener('warp:switch-room', this.handleExternalRoomSwitch as EventListener);
        window.removeEventListener('warp:viewport-control', this.handleViewportControl as EventListener);
        window.removeEventListener('warp:avatar-selection-changed', this.handleAvatarSelectionChanged as EventListener);
        window.removeEventListener('blur', this.handleWindowBlur);
        window.removeEventListener('focus', this.handleWindowFocus);
        document.removeEventListener('focusin', this.handleDocumentFocusChange);
        document.removeEventListener('focusout', this.handleDocumentFocusChange);
        if (this.focusSyncTimeout !== null) {
          window.clearTimeout(this.focusSyncTimeout);
          this.focusSyncTimeout = null;
        }
        this.blinkEvent?.remove(false);
        this.blinkEvent = undefined;
      });
    }
    this.scale.on(Phaser.Scale.Events.RESIZE, this.handleScaleResize, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, this.handleScaleResize, this);
    });

    this.syncMovementKeyboardState();

    // --- Load initial room ---
    this.loadRoom('main');
    this.placePlayerAtSafeSpawn('main');
    this.isSceneReady = true;
  }

  private createAvatarAnimations() {
    PLAYER_BODY_TONES.forEach((tone) => {
      AVATAR_DIRECTIONS.forEach((direction) => {
        const key = this.getBodyWalkAnimationKey(direction, tone);
        if (!this.anims.exists(key)) {
          this.anims.create({
            key,
            frames: AVATAR_BODY_WALK_FILES[direction].map((_, index) => ({
              key: avatarBodyTextureKey(tone, direction, index + 1),
            })),
            frameRate: AVATAR_WALK_FRAME_RATE,
            repeat: -1,
          });
        }
      });
    });

    PLAYER_OUTFIT_TYPES.forEach((outfitType) => {
      AVATAR_DIRECTIONS.forEach((direction) => {
        const outfitKey = this.getOutfitWalkAnimationKey(direction, outfitType);
        if (!this.anims.exists(outfitKey)) {
          this.anims.create({
            key: outfitKey,
            frames: Array.from({ length: 13 }, (_, index) => ({
              key: avatarOutfitTextureKey(outfitType, direction, index + 1),
            })),
            frameRate: AVATAR_WALK_FRAME_RATE,
            repeat: -1,
          });
        }
      });
    });
  }

  update() {
    if (!this.cursors || !this.player.body) return;

    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0);

    if (this.movementInputBlocked || this.isEditableElementFocused()) {
      this.setAvatarIdle();
      this.clampPlayerToRoomBounds();
      this.resolvePlayerObstacleCollisions();
      this.updatePlayerDepth();
      this.syncAvatarLayers();
      return;
    }

    const left = this.cursors.left.isDown || this.wasd?.A?.isDown;
    const right = this.cursors.right.isDown || this.wasd?.D?.isDown;
    const up = this.cursors.up.isDown || this.wasd?.W?.isDown;
    const down = this.cursors.down.isDown || this.wasd?.S?.isDown;

    if (left) body.setVelocityX(-this.speed);
    else if (right) body.setVelocityX(this.speed);
    if (up) body.setVelocityY(-this.speed);
    else if (down) body.setVelocityY(this.speed);

    const isMoving = left || right || up || down;
    if (isMoving) {
      const nextAvatarDirection = this.getAvatarDirection(left, right, up, down);
      const outfitWalkConfig = this.getOutfitWalkLayerConfig(nextAvatarDirection);
      const bodyAnimationKey = this.getBodyWalkAnimationKey(nextAvatarDirection);
      const outfitAnimationKey = this.getOutfitWalkAnimationKey(outfitWalkConfig.sourceDirection);
      const shouldStartWalkAnimation = this.activeWalkDirection !== nextAvatarDirection
        || this.activeBodyWalkAnimationKey !== bodyAnimationKey
        || this.activeOutfitWalkAnimationKey !== outfitAnimationKey
        || !this.player.anims.isPlaying
        || !this.playerOutfit.anims.isPlaying;
      this.lastAvatarDirection = nextAvatarDirection;
      this.isPlayerWalking = true;
      this.applyHairLayerConfig();
      this.applyFaceLayerConfig();
      if (shouldStartWalkAnimation) {
        this.playAvatarWalkAnimations(nextAvatarDirection);
      }
    } else {
      this.setAvatarIdle();
    }

    this.clampPlayerToRoomBounds();
    this.resolvePlayerObstacleCollisions();
    this.updatePlayerDepth();
    this.syncAvatarLayers();
  }

  private getPlayerFootYOffset(): number {
    return this.player.displayHeight * (1 - this.player.originY);
  }

  private getPlayerFootPoint(): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(this.player.x, this.player.y + this.getPlayerFootYOffset());
  }

  private applyPlayerAvatarSelection(selection: Partial<AvatarSelection> | undefined, refreshSprites: boolean = true) {
    this.playerAvatarSelection = {
      ...DEFAULT_PLAYER_AVATAR_SELECTION,
      ...this.playerAvatarSelection,
      ...selection,
    };

    this.playerBodyTone = getSelectionBodyTone(this.playerAvatarSelection);
    this.playerOutfitType = getSelectionOutfitType(this.playerAvatarSelection);
    this.playerHairStyleIndex = getSelectionHairStyleIndex(this.playerAvatarSelection);
    this.playerHairColorSuffix = getSelectionHairColorSuffix(this.playerAvatarSelection);
    this.playerFaceIndex = getSelectionFaceIndex(this.playerAvatarSelection);

    if (!refreshSprites || !this.player || !this.playerOutfit || !this.playerHair || !this.playerFace) {
      return;
    }

    if (this.isPlayerWalking) {
      this.playAvatarWalkAnimations(this.lastAvatarDirection);
    } else {
      this.player.setTexture(this.getBodyIdleTexture(this.lastAvatarDirection));
      this.applyOutfitIdleLayerConfig();
    }

    this.applyHairLayerConfig();
    this.applyFaceLayerConfig();
    this.syncAvatarLayers();
  }

  private clampPlayerToRoomBounds() {
    if (!ENABLE_STRICT_ROOM_WALK_BOUNDS) {
      return;
    }

    if (!this.playerMovementBounds) {
      return;
    }

    const footYOffset = this.getPlayerFootYOffset();
    const footPoint = this.getPlayerFootPoint();
    const clampedFootX = Phaser.Math.Clamp(footPoint.x, this.playerMovementBounds.left, this.playerMovementBounds.right);
    const clampedFootY = Phaser.Math.Clamp(
      footPoint.y,
      this.playerMovementBounds.top,
      this.playerMovementBounds.bottom,
    );

    this.player.setPosition(clampedFootX, clampedFootY - footYOffset);
  }

  private isPlayerFootInWalkableArea(): boolean {
    if (!ENABLE_STRICT_ROOM_WALK_BOUNDS) {
      return true;
    }

    const footPoint = this.getPlayerFootPoint();

    if (this.playerMovementBounds && !this.playerMovementBounds.contains(footPoint.x, footPoint.y)) {
      return false;
    }

    if (this.playerWalkablePolygon && !Phaser.Geom.Polygon.Contains(this.playerWalkablePolygon, footPoint.x, footPoint.y)) {
      return false;
    }

    return !this.playerBlockZones.some((zone) => zone.rect.contains(footPoint.x, footPoint.y));
  }

  private resolvePlayerObstacleCollisions() {
    if (!ENABLE_STRICT_ROOM_WALK_BOUNDS) {
      this.lastValidPlayerPosition.set(this.player.x, this.player.y);
      return;
    }

    if (!this.playerMovementBounds) {
      this.lastValidPlayerPosition.set(this.player.x, this.player.y);
      return;
    }

    if (this.isPlayerFootInWalkableArea()) {
      this.lastValidPlayerPosition.set(this.player.x, this.player.y);
      return;
    }

    this.player.setPosition(this.lastValidPlayerPosition.x, this.lastValidPlayerPosition.y);
    this.clampPlayerToRoomBounds();

    if (!this.isPlayerFootInWalkableArea()) {
      const fallback = this.getRoomSafeSpawnPosition(this.currentRoomId);
      this.player.setPosition(fallback.x, fallback.y);
    }

    this.lastValidPlayerPosition.set(this.player.x, this.player.y);
  }

  private updatePlayerDepth() {
    const footY = this.player.y + this.player.displayHeight * (1 - this.player.originY);
    this.player.setDepth(footY + AVATAR_DEPTH_OFFSET);
    this.playerShadow?.setDepth(this.player.depth - 1);
    this.playerOutfit?.setDepth(this.player.depth + 1);
    this.playerHair?.setDepth(this.player.depth + 2);
    this.playerFace?.setDepth(this.player.depth + 3);
    this.playerLabel?.setDepth(this.player.depth + 4);
  }

  private syncAvatarLayers() {
    this.playerShadow.setPosition(this.player.x, this.player.y);
    this.playerShadow.setDepth(this.player.depth - 1);
    const outfitLayerConfig = this.isPlayerWalking
      ? this.getOutfitWalkLayerConfig(this.lastAvatarDirection)
      : this.getOutfitIdleLayerConfig(this.lastAvatarDirection);
    this.playerOutfit.setPosition(
      this.player.x + outfitLayerConfig.offsetX,
      this.player.y + outfitLayerConfig.offsetY,
    );
    this.playerOutfit.setDepth(this.player.depth + 1);
    const hairConfig = this.getHairLayerConfig(this.lastAvatarDirection);
    this.playerHair.setPosition(this.player.x + hairConfig.offsetX, this.player.y + hairConfig.offsetY);
    this.playerHair.setDepth(this.player.depth + 2);
    const faceConfig = this.getFaceLayerConfig(this.lastAvatarDirection);
    this.playerFace.setPosition(this.player.x + faceConfig.offsetX, this.player.y + faceConfig.offsetY);
    this.playerFace.setDepth(this.player.depth + 3);
    this.playerLabel?.setDepth(this.player.depth + 4);
  }

  private getBodyIdleTexture(direction: AvatarDirection): string {
    return avatarBodyTextureKey(this.playerBodyTone, direction, 'idle');
  }

  private getOutfitIdleTexture(direction: AvatarDirection): string {
    return avatarOutfitTextureKey(this.playerOutfitType, direction, 'idle');
  }

  private getBodyWalkAnimationKey(direction: AvatarDirection, tone: BodyTone = this.playerBodyTone): string {
    return `avatar-walk-${tone}-${direction}`;
  }

  private getOutfitWalkAnimationKey(direction: AvatarDirection, outfitType: OutfitType = this.playerOutfitType): string {
    return `avatar-outfit-walk-${outfitType}-${direction}`;
  }

  private getOutfitIdleLayerConfig(direction: AvatarDirection): OutfitIdleLayerConfig {
    switch (direction) {
      case 'FR':
        return { texture: this.getOutfitIdleTexture(direction), flipX: true, offsetX: 0, offsetY: 0 };
      case 'FL':
        return { texture: this.getOutfitIdleTexture(direction), flipX: false, offsetX: 0, offsetY: 0 };
      case 'BR':
        return { texture: this.getOutfitIdleTexture(direction), flipX: false, offsetX: -4, offsetY: 0 };
      case 'BL':
        return { texture: this.getOutfitIdleTexture(direction), flipX: true, offsetX: 0, offsetY: 0 };
    }
  }

  private getOutfitWalkLayerConfig(direction: AvatarDirection): OutfitWalkLayerConfig {
    switch (direction) {
      case 'FR':
        return { sourceDirection: 'FR', flipX: false, offsetX: 0, offsetY: 0 };
      case 'FL':
        return { sourceDirection: 'FR', flipX: true, offsetX: 0, offsetY: 0 };
      case 'BR':
        return { sourceDirection: 'BR', flipX: false, offsetX: 0, offsetY: 4 };
      case 'BL':
        return { sourceDirection: 'BL', flipX: false, offsetX: 0, offsetY: 4 };
    }
  }

  private playAvatarWalkAnimations(direction: AvatarDirection) {
    const outfitWalkConfig = this.getOutfitWalkLayerConfig(direction);
    const bodyAnimationKey = this.getBodyWalkAnimationKey(direction);
    const outfitAnimationKey = this.getOutfitWalkAnimationKey(outfitWalkConfig.sourceDirection);

    this.playerOutfit.setFlipX(outfitWalkConfig.flipX);
    this.player.anims.play(bodyAnimationKey);
    this.playerOutfit.anims.play(outfitAnimationKey);
    this.applyOutfitVisualTransform();

    this.activeWalkDirection = direction;
    this.activeBodyWalkAnimationKey = bodyAnimationKey;
    this.activeOutfitWalkAnimationKey = outfitAnimationKey;
  }

  private applyOutfitVisualTransform() {
    this.playerOutfit.setOrigin(0.5, 0.88);
    this.playerOutfit.setDisplaySize(AVATAR_DISPLAY_SIZE, AVATAR_DISPLAY_SIZE);
  }

  private applyOutfitIdleLayerConfig() {
    const outfitIdleConfig = this.getOutfitIdleLayerConfig(this.lastAvatarDirection);
    this.playerOutfit.setTexture(outfitIdleConfig.texture);
    this.playerOutfit.setFlipX(outfitIdleConfig.flipX);
    this.applyOutfitVisualTransform();
  }

  private getHairLayerConfig(direction: AvatarDirection): HairLayerConfig {
    switch (direction) {
      case 'FR':
        return { texture: avatarHairTextureKey(this.playerHairStyleIndex, this.playerHairColorSuffix, 'front'), flipX: false, offsetX: 0, offsetY: 0 };
      case 'FL':
        return { texture: avatarHairTextureKey(this.playerHairStyleIndex, this.playerHairColorSuffix, 'front'), flipX: true, offsetX: 0, offsetY: 0 };
      case 'BR':
        return { texture: avatarHairTextureKey(this.playerHairStyleIndex, this.playerHairColorSuffix, 'back'), flipX: true, offsetX: 8, offsetY: 6 };
      case 'BL':
        return { texture: avatarHairTextureKey(this.playerHairStyleIndex, this.playerHairColorSuffix, 'back'), flipX: false, offsetX: -8, offsetY: 6 };
    }
  }

  private applyHairLayerConfig() {
    const hairConfig = this.getHairLayerConfig(this.lastAvatarDirection);
    this.playerHair.setTexture(hairConfig.texture);
    this.playerHair.setFlipX(hairConfig.flipX);
  }

  private getFaceLayerConfig(direction: AvatarDirection): FaceLayerConfig {
    const defaultTexture = avatarFaceTextureKey(this.playerFaceIndex, 'default');
    switch (direction) {
      case 'FR':
        return { visible: true, texture: defaultTexture, flipX: false, offsetX: 0, offsetY: 0 };
      case 'FL':
        return { visible: true, texture: defaultTexture, flipX: true, offsetX: 0, offsetY: 0 };
      case 'BR':
        return { visible: false, texture: defaultTexture, flipX: false, offsetX: 0, offsetY: 0 };
      case 'BL':
        return { visible: false, texture: defaultTexture, flipX: true, offsetX: 0, offsetY: 0 };
    }
  }

  private applyFaceLayerConfig() {
    const faceConfig = this.getFaceLayerConfig(this.lastAvatarDirection);
    const texture = faceConfig.visible && this.isFaceBlinking ? avatarFaceTextureKey(this.playerFaceIndex, 'blink') : faceConfig.texture;
    this.playerFace.setTexture(texture);
    this.playerFace.setFlipX(faceConfig.flipX);
    this.playerFace.setVisible(faceConfig.visible);
  }

  private triggerFaceBlink() {
    const faceConfig = this.getFaceLayerConfig(this.lastAvatarDirection);
    if (!faceConfig.visible || this.isFaceBlinking) {
      return;
    }

    this.isFaceBlinking = true;
    this.applyFaceLayerConfig();

    this.time.delayedCall(AVATAR_FACE_BLINK_DURATION_MS, () => {
      this.isFaceBlinking = false;
      this.applyFaceLayerConfig();
    });
  }

  private setAvatarIdle() {
    if (!this.isPlayerWalking) {
      return;
    }

    this.isPlayerWalking = false;
    this.activeWalkDirection = null;
    this.activeBodyWalkAnimationKey = null;
    this.activeOutfitWalkAnimationKey = null;
    this.player.anims.stop();
    this.playerOutfit.anims.stop();
    this.player.setTexture(this.getBodyIdleTexture(this.lastAvatarDirection));
    this.applyOutfitIdleLayerConfig();
  }

  private getAvatarDirection(left: boolean, right: boolean, up: boolean, down: boolean): AvatarDirection {
    if (up) {
      if (left) return 'BL';
      if (right) return 'BR';
      return this.lastAvatarDirection.endsWith('L') ? 'BL' : 'BR';
    }

    if (down) {
      if (left) return 'FL';
      if (right) return 'FR';
      return this.lastAvatarDirection.endsWith('L') ? 'FL' : 'FR';
    }

    if (left) {
      return this.lastAvatarDirection.startsWith('B') ? 'BL' : 'FL';
    }

    if (right) {
      return this.lastAvatarDirection.startsWith('B') ? 'BR' : 'FR';
    }

    return this.lastAvatarDirection;
  }

  private isEditableElementFocused(): boolean {
    if (typeof document === 'undefined') {
      return false;
    }

    const activeElement = document.activeElement;
    if (!(activeElement instanceof HTMLElement)) {
      return false;
    }

    const tagName = activeElement.tagName;
    return activeElement.isContentEditable
      || tagName === 'INPUT'
      || tagName === 'TEXTAREA'
      || tagName === 'SELECT';
  }

  private syncMovementKeyboardState(forceBlocked = this.isEditableElementFocused()) {
    this.movementInputBlocked = forceBlocked;

    if (!this.input.keyboard) {
      return;
    }

    this.input.keyboard.enabled = !forceBlocked;
    this.input.keyboard.resetKeys();

    if (this.player.body) {
      (this.player.body as Phaser.Physics.Arcade.Body).setVelocity(0);
    }

    this.setAvatarIdle();
  }

  private focusGameInput() {
    if (this.isEditableElementFocused()) {
      this.syncMovementKeyboardState(true);
      return;
    }

    const canvas = this.sys.game.canvas;
    if (canvas.tabIndex < 0) {
      canvas.tabIndex = 0;
    }

    try {
      canvas.focus({ preventScroll: true });
    } catch {
      canvas.focus();
    }

    this.syncMovementKeyboardState(false);
  }

  // =============================================
  //  ROOM SWITCHING
  // =============================================

  private loadRoom(roomId: string) {
    this.dismissAllOverlays();
    this.clearRoom();
    this.currentRoomId = roomId;

    const room = ROOMS[roomId];
    if (!room) return;

    // Update HUD
    this.roomTitleText.setText(room.title);
    this.roomSubText.setText(room.subtitle);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('warp:room-changed', {
        detail: {
          roomId: room.id,
          title: room.title,
          subtitle: room.subtitle,
        },
      }));
    }

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    if (roomId === 'main') {
      // ===== MAIN OFFICE: Use image assets =====
      this.loadMainOfficeAssets(width, height, room);
    } else {
      this.mainRoomBounds = new Phaser.Geom.Rectangle(0, 0, width, height);
      this.playerMovementBounds = new Phaser.Geom.Rectangle(0, 0, width, height);
      this.applySceneViewport();
    }

    if (roomId === 'main') {
      // Desks (invisible hitboxes for main room only)
      for (const d of room.desks) {
        this.spawnDesk(d.x, d.y, d.w, d.h, 0x000000, d.label, d.desc, true);
      }

      // Teammates
      for (const [index, tm] of room.teammates.entries()) {
        const coworkerBaseConfig = MAIN_ROOM_COWORKER_CONFIGS[index];
        const coworkerConfig = coworkerBaseConfig
          ? { ...coworkerBaseConfig, x: tm.x, y: tm.y }
          : undefined;
        this.spawnTeammate(tm.x, tm.y, tm.color, tm.name, tm.role, tm.assetKey, tm.flipX, tm.displayRect, coworkerConfig);
      }

      // Doors
      for (const dr of room.doors) {
        this.spawnImageDoor(dr.x, dr.y, dr.w, dr.h, dr.label, dr.targetRoom);
      }
    } else {
      // Preserve navigation out of non-final rooms without rendering placeholder UI.
      for (const dr of room.doors) {
        this.spawnInvisibleDoor(dr.x, dr.y, dr.w, dr.h, dr.targetRoom);
      }
    }

    // Transition flash
    this.cameras.main.fadeIn(350, 0, 0, 0);
  }

  // =============================================
  //  MAIN OFFICE: Image-based room layout
  // =============================================

  private loadMainOfficeAssets(width: number, height: number, room: RoomDef) {
    const baseScale = Math.min(width / 1970, height / 1205) * 0.98;
    const roomVerticalOffset = height * 0.08;
    const roomBaseWidth = 1970 * baseScale;
    const roomBaseHeight = 1205 * baseScale;
    const roomBaseLeft = (width - roomBaseWidth) / 2;
    const roomBaseTop = (height - roomBaseHeight) / 2 + roomVerticalOffset;
    const roomCenterX = roomBaseLeft + roomBaseWidth / 2;
    const roomCenterY = roomBaseTop + roomBaseHeight / 2;
    const layoutScale = roomBaseWidth / FIGMA_MAIN_ROOM.roomBase.w;
    this.mainRoomBounds = new Phaser.Geom.Rectangle(roomBaseLeft, roomBaseTop, roomBaseWidth, roomBaseHeight);
    const movementLeft = roomBaseLeft + roomBaseWidth * PLAYER_MAIN_ROOM_BOUNDS_RATIO.left;
    const movementTop = roomBaseTop + roomBaseHeight * PLAYER_MAIN_ROOM_BOUNDS_RATIO.top;
    const movementRight = roomBaseLeft + roomBaseWidth * PLAYER_MAIN_ROOM_BOUNDS_RATIO.right;
    const movementBottom = roomBaseTop + roomBaseHeight * PLAYER_MAIN_ROOM_BOUNDS_RATIO.bottom;
    this.playerMovementBounds = new Phaser.Geom.Rectangle(
      movementLeft,
      movementTop,
      movementRight - movementLeft,
      movementBottom - movementTop,
    );
    this.playerWalkablePolygon = new Phaser.Geom.Polygon(
      MAIN_ROOM_WALKABLE_FLOOR_POLYGON.map((point) => this.mapMainRoomPoint(point)),
    );
    this.playerBlockZones = MAIN_ROOM_BLOCK_ZONES.map((zone) => ({
      id: zone.id,
      rect: this.mapMainRoomRect(zone),
    }));
    const roomBase = this.add.image(roomCenterX, roomCenterY, 'room_base')
      .setScale(baseScale)
      .setDepth(0);
    this.roomObjects.push(roomBase);
    this.applySceneViewport();

    const mapRect = (rect: FigmaRect) => ({
      x: roomBaseLeft + (rect.x - FIGMA_MAIN_ROOM.roomBase.x) * layoutScale,
      y: roomBaseTop + (rect.y - FIGMA_MAIN_ROOM.roomBase.y) * layoutScale,
      w: rect.w * layoutScale,
      h: rect.h * layoutScale,
    });

    const tvRect = mapRect(FIGMA_MAIN_ROOM.tv);
    const tv = this.add.image(tvRect.x, tvRect.y, 'tv')
      .setOrigin(0, 0)
      .setDisplaySize(tvRect.w, tvRect.h)
      .setDepth(tvRect.y + tvRect.h);
    this.roomObjects.push(tv);

    const tableRect = mapRect(FIGMA_MAIN_ROOM.table);
    const table = this.add.image(tableRect.x, tableRect.y, 'table')
      .setOrigin(0, 0)
      .setDisplaySize(tableRect.w, tableRect.h)
      .setDepth(tableRect.y + tableRect.h);
    this.roomObjects.push(table);

    const tableDepth = table.depth;

    FIGMA_MAIN_ROOM.seats.forEach((seatRect, index) => {
      const mappedSeat = mapRect(seatRect);
      this.spawnSeat({
        id: seatRect.id,
        x: mappedSeat.x,
        y: mappedSeat.y,
        w: mappedSeat.w,
        h: mappedSeat.h,
        row: seatRect.row,
        variant: seatRect.variant,
        color: seatRect.color,
        depth: this.getSeatDepth(seatRect.row, mappedSeat.y, mappedSeat.h, tableDepth, index),
      });
    });

    this.drawDebugWalkZones();

    room.desks[0].x = tableRect.x + tableRect.w / 2;
    room.desks[0].y = tableRect.y + tableRect.h / 2;
    room.desks[0].w = tableRect.w * 0.62;
    room.desks[0].h = tableRect.h * 0.46;

    FIGMA_MAIN_ROOM.characters.forEach((character, index) => {
      const mappedCharacter = mapRect(character);
      const teammate = room.teammates[index];
      if (!teammate) {
        return;
      }

      teammate.x = mappedCharacter.x + mappedCharacter.w / 2;
      teammate.y = mappedCharacter.y + mappedCharacter.h * 0.88;
      teammate.assetKey = undefined;
      teammate.flipX = false;
      teammate.displayRect = {
        x: mappedCharacter.x + (mappedCharacter.w * (1 - ROOM_CHARACTER_DISPLAY_SCALE)) / 2,
        y: mappedCharacter.y + mappedCharacter.h * (1 - ROOM_CHARACTER_DISPLAY_SCALE),
        w: mappedCharacter.w * ROOM_CHARACTER_DISPLAY_SCALE,
        h: mappedCharacter.h * ROOM_CHARACTER_DISPLAY_SCALE,
      };
    });

    const doorRect = mapRect(FIGMA_MAIN_ROOM.door);
    room.doors[0].x = doorRect.x;
    room.doors[0].y = doorRect.y;
    room.doors[0].w = doorRect.w;
    room.doors[0].h = doorRect.h;
  }

  private mapMainRoomPoint(point: FigmaPoint): Phaser.Math.Vector2 {
    if (!this.mainRoomBounds) {
      return new Phaser.Math.Vector2(point.x, point.y);
    }

    const layoutScale = this.mainRoomBounds.width / FIGMA_MAIN_ROOM.roomBase.w;
    return new Phaser.Math.Vector2(
      this.mainRoomBounds.left + (point.x - FIGMA_MAIN_ROOM.roomBase.x) * layoutScale,
      this.mainRoomBounds.top + (point.y - FIGMA_MAIN_ROOM.roomBase.y) * layoutScale,
    );
  }

  private mapMainRoomRect(rect: FigmaRect): Phaser.Geom.Rectangle {
    const topLeft = this.mapMainRoomPoint({ x: rect.x, y: rect.y });
    if (!this.mainRoomBounds) {
      return new Phaser.Geom.Rectangle(topLeft.x, topLeft.y, rect.w, rect.h);
    }

    const layoutScale = this.mainRoomBounds.width / FIGMA_MAIN_ROOM.roomBase.w;
    return new Phaser.Geom.Rectangle(topLeft.x, topLeft.y, rect.w * layoutScale, rect.h * layoutScale);
  }

  private drawDebugWalkZones() {
    this.debugWalkZoneGraphics?.destroy();
    this.debugWalkZoneGraphics = undefined;

    if (!DEBUG_WALK_ZONES) {
      return;
    }

    const graphics = this.add.graphics().setDepth(2000);
    graphics.lineStyle(2, 0x22c55e, 0.9);
    if (this.playerMovementBounds) {
      graphics.strokeRectShape(this.playerMovementBounds);
    }
    if (this.playerWalkablePolygon) {
      graphics.strokePoints(this.playerWalkablePolygon.points, true);
    }
    graphics.fillStyle(0xef4444, 0.22);
    this.playerBlockZones.forEach((zone) => graphics.fillRectShape(zone.rect));
    this.debugWalkZoneGraphics = graphics;
    this.roomObjects.push(graphics);
  }

  private getSeatTextureKey(variant: SeatVariant, color: SeatColor, state: SeatState): string {
    if (variant === 'front') {
      return `chair_front_${color}`;
    }

    return `chair_back_${color}`;
  }

  private getSeatHoverTextureKey(variant: SeatVariant, color: SeatColor): string {
    return variant === 'front' ? `chair_front_hover_${color}` : `chair_back_hover_${color}`;
  }

  private getSeatDepth(row: SeatRow, seatY: number, seatH: number, tableDepth: number, index: number): number {
    const baseDepth = seatY + seatH + index;

    if (row === 'top') {
      return Math.min(baseDepth, tableDepth - 6 - index);
    }

    return Math.max(baseDepth, tableDepth + 6 + index);
  }

  private spawnSeat({
    id,
    x,
    y,
    w,
    h,
    row,
    variant,
    color,
    depth,
  }: {
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
    row: SeatRow;
    variant: SeatVariant;
    color: SeatColor;
    depth: number;
  }) {
    const metrics = SEAT_ASSET_METRICS[variant];
    const scaleX = w / metrics.idle.width;
    const scaleY = h / metrics.idle.height;
    const hoverSprite = this.add.image(
      x + metrics.hover.offsetX * scaleX,
      y + metrics.hover.offsetY * scaleY,
      this.getSeatHoverTextureKey(variant, color),
    )
      .setOrigin(0, 0)
      .setDisplaySize(metrics.hover.width * scaleX, metrics.hover.height * scaleY)
      .setDepth(depth - 1)
      .setVisible(false);

    const idleSprite = this.add.image(x, y, this.getSeatTextureKey(variant, color, 'idle'))
      .setOrigin(0, 0)
      .setDisplaySize(w, h)
      .setDepth(depth)
      .setInteractive({ useHandCursor: true });

    const seat: SeatData = {
      id,
      idleSprite,
      hoverSprite,
      row,
      variant,
      color,
      x,
      y,
      w,
      h,
      depth,
      state: 'idle',
    };

    idleSprite.on('pointerover', () => this.handleSeatHover(seat));
    idleSprite.on('pointerout', () => this.handleSeatHoverEnd(seat));
    idleSprite.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation();
      this.selectSeat(seat);
    });

    this.seats.push(seat);
    this.roomObjects.push(hoverSprite, idleSprite);
  }

  private setSeatState(seat: SeatData, nextState: SeatState) {
    seat.state = nextState;
    seat.hoverSprite.setVisible(nextState === 'hover' || nextState === 'selected');

    if (nextState === 'selected') {
      this.showSeatChip(seat);
    } else {
      this.hideSeatChip(seat);
    }
  }

  private handleSeatHover(seat: SeatData) {
    if (this.hoveredSeat && this.hoveredSeat !== seat && this.hoveredSeat !== this.selectedSeat) {
      this.setSeatState(this.hoveredSeat, 'idle');
    }

    if (this.selectedSeat && this.selectedSeat !== seat) {
      this.setSeatState(this.selectedSeat, 'idle');
      this.selectedSeat = null;
    }

    this.hoveredSeat = seat;
    this.setSeatState(seat, 'hover');
  }

  private handleSeatHoverEnd(seat: SeatData) {
    if (this.hoveredSeat === seat) {
      this.hoveredSeat = null;
    }

    this.setSeatState(seat, seat === this.selectedSeat ? 'selected' : 'idle');
  }

  private selectSeat(seat: SeatData) {
    if (this.selectedSeat && this.selectedSeat !== seat) {
      this.setSeatState(this.selectedSeat, 'idle');
    }

    this.selectedSeat = seat;
    this.hoveredSeat = seat;
    this.setSeatState(seat, 'selected');
  }

  private showSeatChip(seat: SeatData) {
    const overlayWidth = 66 * (seat.w / 120.377197265625);
    const overlayHeight = 28 * (seat.w / 120.377197265625);
    const overlayX = seat.x + (seat.w - overlayWidth) / 2;
    const overlayY = seat.variant === 'front'
      ? seat.y - overlayHeight - seat.h * 0.06
      : seat.y - overlayHeight * 0.78;
    const overlayDepth = 1000;

    if (seat.sitOverlay) {
      seat.sitOverlay
        .setPosition(overlayX, overlayY)
        .setDepth(overlayDepth)
        .setVisible(true);
      return;
    }

    const bg = this.add.graphics();
    bg.fillStyle(0xffffff, 0.98);
    bg.lineStyle(1.5, 0xe2e0f0, 1);
    bg.fillRoundedRect(0, 0, overlayWidth, overlayHeight, overlayHeight / 2);
    bg.strokeRoundedRect(0, 0, overlayWidth, overlayHeight, overlayHeight / 2);

    const icon = this.add.text(overlayWidth * 0.28, overlayHeight / 2, '✓', {
      fontFamily: 'Arial',
      fontSize: `${Math.max(11, overlayHeight * 0.48)}px`,
      color: '#7C5CFC',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const label = this.add.text(overlayWidth * 0.6, overlayHeight / 2, 'Sit', {
      fontFamily: 'Funnel Sans, Arial, sans-serif',
      fontSize: `${Math.max(10, overlayHeight * 0.42)}px`,
      color: '#7C5CFC',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    seat.sitOverlay = this.add.container(overlayX, overlayY, [bg, icon, label])
      .setDepth(overlayDepth)
      .setSize(overlayWidth, overlayHeight)
      .setInteractive(
        new Phaser.Geom.Rectangle(0, 0, overlayWidth, overlayHeight),
        Phaser.Geom.Rectangle.Contains
      );
    seat.sitOverlay.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation();
      this.selectSeat(seat);
    });
    seat.sitOverlay.on('pointerover', () => this.handleSeatHover(seat));
    seat.sitOverlay.on('pointerout', () => this.handleSeatHoverEnd(seat));
    this.roomObjects.push(seat.sitOverlay);
  }

  private hideSeatChip(seat: SeatData) {
    if (!seat.sitOverlay) return;
    seat.sitOverlay.setVisible(false);
  }

  // =============================================
  //  IMAGE-BASED DOOR (for main room)
  // =============================================

  private spawnImageDoor(x: number, y: number, w: number, h: number, label: string, targetRoom: string) {
    const doorImg = this.add.image(x, y, 'door_main')
      .setOrigin(0, 0)
      .setDisplaySize(w, h)
      .setDepth(y + h)
      .setInteractive({ useHandCursor: true });
    this.roomObjects.push(doorImg);

    // Hover effects
    doorImg.on('pointerover', () => {
      doorImg.setTexture('door_hover');
    });
    doorImg.on('pointerout', () => {
      doorImg.setTexture('door_main');
    });

    // Click → switch room
    doorImg.on('pointerdown', (p: Phaser.Input.Pointer) => {
      p.event.stopPropagation();
      this.switchRoom(targetRoom);
    });
  }

  private clearRoom() {
    for (const coworker of this.roomCoworkers) {
      coworker.blinkEvent?.remove(false);
    }

    // Destroy all room-specific objects
    for (const obj of this.roomObjects) {
      obj.destroy();
    }
    this.roomObjects = [];
    this.seats = [];
    this.roomCoworkers = [];
    this.hoveredSeat = null;
    this.selectedSeat = null;

    // Clear teammate data (call rings, domains, join labels)
    for (const tm of this.teammates) {
      if (tm.callRing) tm.callRing.destroy();
      if (tm.callLabel) tm.callLabel.destroy();
      if (tm.callDomain) tm.callDomain.destroy();
      if (tm.joinLabel) tm.joinLabel.destroy();
    }
    this.teammates = [];
    this.desks = [];
    this.mainRoomBounds = null;
    this.playerMovementBounds = null;
    this.playerWalkablePolygon = null;
    this.playerBlockZones = [];
    this.debugWalkZoneGraphics = undefined;
  }

  private canApplySceneViewport() {
    return Boolean(
      this.isSceneReady &&
      !this.isSceneShuttingDown &&
      this.sys?.isActive() &&
      this.mainRoomBounds
    );
  }

  private setSceneZoom(nextZoom: number) {
    if (!this.canApplySceneViewport()) {
      return;
    }

    this.sceneZoom = Phaser.Math.Clamp(nextZoom, MainOfficeScene.MIN_ZOOM, MainOfficeScene.MAX_ZOOM);
    this.applySceneViewport();
  }

  private applySceneViewport() {
    if (!this.canApplySceneViewport()) {
      return;
    }

    const camera = this.cameras?.main;
    if (!camera) {
      return;
    }

    const mainRoomBounds = this.mainRoomBounds;
    if (!mainRoomBounds) {
      return;
    }

    camera.setZoom(this.sceneZoom);
    camera.centerOn(mainRoomBounds.centerX, mainRoomBounds.centerY - MainOfficeScene.VISUAL_CAMERA_Y_OFFSET);
  }

  private getRoomSafeSpawnPosition(roomId: string): Phaser.Math.Vector2 {
    if (roomId === 'main') {
      const footPoint = this.mapMainRoomPoint(MAIN_ROOM_SAFE_SPAWN_FOOT);
      return new Phaser.Math.Vector2(footPoint.x, footPoint.y - this.getPlayerFootYOffset());
    }

    const width = this.cameras.main.width;
    const target = ROOMS[roomId];
    const door = target?.doors[0];
    const x = door && door.x < width / 2 ? width - 100 : 100;
    return new Phaser.Math.Vector2(x, 300);
  }

  private placePlayerAtSafeSpawn(roomId: string) {
    const spawn = this.getRoomSafeSpawnPosition(roomId);
    this.player.setPosition(spawn.x, spawn.y);
    this.clampPlayerToRoomBounds();

    if (!this.isPlayerFootInWalkableArea()) {
      this.player.setPosition(spawn.x, spawn.y);
    }

    this.lastValidPlayerPosition.set(this.player.x, this.player.y);
    this.updatePlayerDepth();
    this.syncAvatarLayers();
  }

  private switchRoom(targetRoom: string) {
    // Fade out then rebuild
    this.cameras.main.fadeOut(250, 0, 0, 0);
    this.time.delayedCall(260, () => {
      const target = ROOMS[targetRoom];
      if (!target) return;

      this.loadRoom(targetRoom);
      this.placePlayerAtSafeSpawn(targetRoom);
    });
  }

  // =============================================
  //  DOOR CREATION (geometric fallback for non-main rooms)
  // =============================================

  private spawnDoor(x: number, y: number, w: number, h: number, label: string, targetRoom: string) {
    // Door visual
    const doorBg = this.add.rectangle(x, y, w, h, 0x7c3aed, 0.15);
    doorBg.setStrokeStyle(2, 0x7c3aed, 0.6);
    doorBg.setInteractive({ useHandCursor: true });
    doorBg.setDepth(1);
    this.roomObjects.push(doorBg);

    // Door label
    const doorLabel = this.add.text(x, y, label, {
      fontSize: '11px', color: '#7c3aed', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(2);
    this.roomObjects.push(doorLabel);

    // Pulsing glow effect
    this.tweens.add({
      targets: doorBg,
      alpha: { from: 0.6, to: 1 },
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Hover
    doorBg.on('pointerover', () => {
      doorBg.setFillStyle(0x7c3aed, 0.35);
      doorBg.setStrokeStyle(2, 0xa855f7, 1);
    });
    doorBg.on('pointerout', () => {
      doorBg.setFillStyle(0x7c3aed, 0.15);
      doorBg.setStrokeStyle(2, 0x7c3aed, 0.6);
    });

    // Click -> switch room
    doorBg.on('pointerdown', (p: Phaser.Input.Pointer) => {
      p.event.stopPropagation();
      this.switchRoom(targetRoom);
    });
  }

  private spawnInvisibleDoor(x: number, y: number, w: number, h: number, targetRoom: string) {
    const doorHitbox = this.add.rectangle(x, y, w, h, 0x000000, 0)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setDepth(1);
    this.roomObjects.push(doorHitbox);

    doorHitbox.on('pointerdown', (p: Phaser.Input.Pointer) => {
      p.event.stopPropagation();
      this.switchRoom(targetRoom);
    });
  }

  // =============================================
  //  DESK CREATION + INTERACTION
  // =============================================

  private spawnDesk(x: number, y: number, w: number, h: number, color: number, label: string, description: string, invisible: boolean = false) {
    const desk = this.add.rectangle(x, y, w, h, color, invisible ? 0 : 0.2);
    if (!invisible) desk.setStrokeStyle(1, color);
    desk.setDepth(invisible ? 3 : 1); // Higher depth if invisible overlay
    this.roomObjects.push(desk);

    this.physics.add.existing(desk, true);

    const deskData: DeskData = { rect: desk, label, description, x, y };
    this.desks.push(deskData);

    if (invisible) {
      return;
    }

    desk.setInteractive({ useHandCursor: true });

    desk.on('pointerover', () => {
      if (!invisible) {
        desk.setStrokeStyle(2, 0x7c3aed);
        desk.setFillStyle(color, 0.35);
      } else {
        // Light highlight on invisible hitbox
        desk.setFillStyle(0x7c3aed, 0.08);
      }
    });
    desk.on('pointerout', () => {
      if (!invisible) {
        desk.setStrokeStyle(1, color);
        desk.setFillStyle(color, 0.2);
      } else {
        desk.setFillStyle(0x000000, 0);
      }
    });
    desk.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation();
      this.showDeskPopup(deskData);
    });
  }

  private showDeskPopup(desk: DeskData) {
    this.dismissAllOverlays();

    const popupW = 220;
    const popupH = 80;
    const px = desk.x;
    const py = desk.y - (popupH / 2) - 45;

    const bg = this.add.rectangle(px, py, popupW, popupH, 0xffffff, 0.97)
      .setStrokeStyle(1, 0xd1d5db).setOrigin(0.5);
    const title = this.add.text(px, py - 18, desk.label, {
      fontSize: '13px', color: '#1f2937', fontStyle: 'bold'
    }).setOrigin(0.5);
    const desc = this.add.text(px, py + 6, desk.description, {
      fontSize: '10px', color: '#6b7280', wordWrap: { width: popupW - 24 }, align: 'center'
    }).setOrigin(0.5, 0);
    const closeBtn = this.add.text(px + popupW / 2 - 14, py - popupH / 2 + 6, '✕', {
      fontSize: '12px', color: '#64748b'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.dismissAllOverlays());

    this.activePopup = this.add.container(0, 0, [bg, title, desc, closeBtn]);
    this.activePopup.setDepth(20);
    this.activePopup.setAlpha(0).setScale(0.9);
    this.tweens.add({ targets: this.activePopup, alpha: 1, scale: 1, duration: 150, ease: 'Back.easeOut' });
  }

  // =============================================
  //  TEAMMATE CREATION + INTERACTION MENU
  // =============================================

  private spawnLayeredCoworker(config: RoomCoworkerConfig, hitArea?: Phaser.GameObjects.Arc): RoomCoworkerLayers {
    const shouldFlipFrontLayer = config.direction === 'FL';
    const body = this.add.sprite(config.x, config.y, config.bodyTextureKey ?? this.getCoworkerBodyIdleTexture(config.bodyTone, config.direction));
    const outfit = this.add.sprite(config.x, config.y, this.getCoworkerOutfitIdleTexture(config.outfitType));
    const hair = this.add.sprite(config.x, config.y, config.hairTextureKey);
    const face = this.add.sprite(config.x, config.y, config.faceDefaultTextureKey);
    const shadow = this.add.sprite(config.x, config.y, 'avatar-coworker-shadow');

    [shadow, body, outfit, hair, face].forEach((layer) => {
      layer.setOrigin(0.5, 0.88);
      layer.setDisplaySize(COWORKER_DISPLAY_SIZE, COWORKER_DISPLAY_SIZE);
      this.roomObjects.push(layer);
    });

    body.setFlipX(config.bodyTextureKey ? false : shouldFlipFrontLayer);
    outfit.setFlipX(shouldFlipFrontLayer);
    hair.setFlipX(shouldFlipFrontLayer);
    face.setFlipX(config.faceFlipX ?? shouldFlipFrontLayer);
    face.setVisible(config.faceVisible ?? true);

    const coworker: RoomCoworkerLayers = {
      id: config.id,
      shadow,
      body,
      outfit,
      hair,
      face,
      faceDefaultTextureKey: config.faceDefaultTextureKey,
      faceBlinkTextureKey: config.faceBlinkTextureKey,
      hitArea,
    };
    this.startCoworkerBlink(coworker, config.faceVisible ?? true);
    this.syncCoworkerLayers(coworker, config.x, config.y, config.depthOffset ?? 0);
    this.roomCoworkers.push(coworker);

    return coworker;
  }

  private syncCoworkerLayers(coworker: RoomCoworkerLayers, x: number, y: number, depthOffset: number = 0) {
    const baseDepth = y + depthOffset + AVATAR_DEPTH_OFFSET;

    coworker.shadow?.setPosition(x, y).setDepth(baseDepth - 1);
    coworker.body.setPosition(x, y).setDepth(baseDepth);
    coworker.outfit.setPosition(x, y).setDepth(baseDepth + 1);
    coworker.hair?.setPosition(x, y).setDepth(baseDepth + 2);
    coworker.face?.setPosition(x, y).setDepth(baseDepth + 3);
    coworker.hitArea?.setPosition(x, y).setDepth(baseDepth + 4);
  }

  private getCoworkerBodyIdleTexture(tone: BodyTone, direction: Extract<AvatarDirection, 'FR' | 'FL'>): string {
    return coworkerBodyTextureKey(tone, direction);
  }

  private getCoworkerOutfitIdleTexture(outfitType: OutfitType): string {
    return coworkerOutfitTextureKey(outfitType);
  }

  private startCoworkerBlink(coworker: RoomCoworkerLayers, canBlink: boolean) {
    if (!canBlink || !coworker.face) {
      return;
    }

    const delay = COWORKER_BLINK_INTERVAL_MS + (this.roomCoworkers.length * 450);
    coworker.blinkEvent = this.time.addEvent({
      delay,
      loop: true,
      callback: () => {
        if (!coworker.face?.active || !coworker.face.visible) {
          return;
        }

        coworker.face.setTexture(coworker.faceBlinkTextureKey);
        this.time.delayedCall(COWORKER_BLINK_DURATION_MS, () => {
          if (coworker.face?.active) {
            coworker.face.setTexture(coworker.faceDefaultTextureKey);
          }
        });
      },
    });
  }

  private spawnTeammate(
    x: number,
    y: number,
    color: number,
    name: string,
    role: string,
    assetKey?: string,
    flipX: boolean = false,
    displayRect?: FigmaRect,
    coworkerConfig?: RoomCoworkerConfig,
  ) {
    const teammate = this.add.circle(x, y, 12, color);
    const hasCustomVisual = Boolean(assetKey || coworkerConfig);
    teammate.setStrokeStyle(2, 0xffffff, hasCustomVisual ? 0 : 0.5);
    teammate.setAlpha(hasCustomVisual ? 0.001 : 1);
    teammate.setInteractive({ useHandCursor: true });
    teammate.setDepth(y + 22);
    this.roomObjects.push(teammate);

    let sprite: Phaser.GameObjects.Image | undefined;
    let coworkerLayers: RoomCoworkerLayers | undefined;
    if (coworkerConfig) {
      coworkerLayers = this.spawnLayeredCoworker({ ...coworkerConfig, x, y }, teammate);
    } else if (assetKey && displayRect) {
      sprite = this.add.image(displayRect.x, displayRect.y, assetKey)
        .setOrigin(0, 0)
        .setDisplaySize(displayRect.w, displayRect.h)
        .setFlipX(flipX)
        .setDepth(y + 18);
      this.roomObjects.push(sprite);
    } else {
      const shadow = this.add.ellipse(x, y + 14, 26, 10, 0x312e81, 0.14)
        .setDepth(y - 3);
      this.roomObjects.push(shadow);
    }

    const tmData: TeammateData = {
      circle: teammate, sprite, coworkerLayers, name, role, color, x, y,
      inCall: false, playerJoined: false,
    };
    this.teammates.push(tmData);

    teammate.on('pointerover', () => {
      teammate.setScale(1.2);
    });
    teammate.on('pointerout', () => {
      teammate.setScale(1);
    });
    teammate.on('pointerdown', (p: Phaser.Input.Pointer) => {
      p.event.stopPropagation();
      this.showTeammateMenu(tmData);
    });
  }

  private showTeammateMenu(tm: TeammateData) {
    this.dismissAllOverlays();

    const menuW = 160;
    const menuX = tm.x;
    const menuY = tm.y - 60;

    const items: { icon: string; label: string; action: () => void }[] = [];

    if (tm.inCall) {
      items.push({ icon: '🔗', label: tm.playerJoined ? 'Leave Call' : 'Join Call', action: () => { this.dismissAllOverlays(); this.toggleJoin(tm); } });
      items.push({ icon: '📞', label: 'End Call', action: () => { this.dismissAllOverlays(); this.toggleCall(tm); } });
    } else {
      items.push({ icon: '📞', label: 'Talk', action: () => { this.dismissAllOverlays(); this.toggleCall(tm); } });
      items.push({
        icon: '🎉', label: 'Send Kudos', action: () => {
          this.dismissAllOverlays(); this.doKudos(tm);
        }
      });
    }

    items.push({ icon: '👋', label: 'Wave', action: () => { this.dismissAllOverlays(); this.doWave(tm); } });

    const rowH = 32;
    const headerH = 28;
    const totalH = headerH + items.length * rowH + 8;
    const children: Phaser.GameObjects.GameObject[] = [];

    const bg = this.add.rectangle(menuX, menuY + totalH / 2, menuW, totalH, 0xffffff, 0.97)
      .setStrokeStyle(1, 0xd1d5db).setOrigin(0.5);
    children.push(bg);

    const header = this.add.text(menuX, menuY + 14, tm.name, {
      fontSize: '12px', color: '#6366f1', fontStyle: 'bold'
    }).setOrigin(0.5);
    children.push(header);

    const divider = this.add.rectangle(menuX, menuY + headerH, menuW - 16, 1, 0xe5e7eb);
    children.push(divider);

    items.forEach((item, i) => {
      const iy = menuY + headerH + 8 + i * rowH + rowH / 2;
      const rowBg = this.add.rectangle(menuX, iy, menuW - 8, rowH - 4, 0xf9fafb, 0)
        .setInteractive({ useHandCursor: true }).setOrigin(0.5);
      const rowText = this.add.text(menuX - menuW / 2 + 16, iy, `${item.icon}  ${item.label}`, {
        fontSize: '12px', color: '#374151'
      }).setOrigin(0, 0.5);

      rowBg.on('pointerover', () => rowBg.setFillStyle(0xf3f4f6, 1));
      rowBg.on('pointerout', () => rowBg.setFillStyle(0xf9fafb, 0));
      rowBg.on('pointerdown', (p: Phaser.Input.Pointer) => { p.event.stopPropagation(); item.action(); });

      children.push(rowBg, rowText);
    });

    this.activeMenu = this.add.container(0, 0, children);
    this.activeMenu.setDepth(2000);
    this.activeMenu.setAlpha(0).setScale(0.85);
    this.tweens.add({ targets: this.activeMenu, alpha: 1, scale: 1, duration: 140, ease: 'Back.easeOut' });
  }

  // =============================================
  //  ACTIONS
  // =============================================

  private doKudos(tm: TeammateData) {
    const kudosText = this.add.text(tm.x, tm.y - 30, '🎉 +1 Kudos!', {
      fontSize: '14px', color: '#fbbf24', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(30);

    this.tweens.add({
      targets: kudosText, y: kudosText.y - 50, alpha: 0,
      duration: 1200, ease: 'Cubic.easeOut',
      onComplete: () => kudosText.destroy()
    });
    this.showNotification(`Kudos sent to ${tm.name}!`);
  }

  private toggleCall(tm: TeammateData) {
    if (tm.inCall) {
      // --- End call ---
      tm.inCall = false;
      tm.playerJoined = false;
      if (tm.callRing) { tm.callRing.destroy(); tm.callRing = undefined; }
      if (tm.callLabel) { tm.callLabel.destroy(); tm.callLabel = undefined; }
      if (tm.callDomain) { tm.callDomain.destroy(); tm.callDomain = undefined; }
      if (tm.joinLabel) { tm.joinLabel.destroy(); tm.joinLabel = undefined; }
      this.showNotification(`Call with ${tm.name} ended.`);
    } else {
      // --- Start call ---
      tm.inCall = true;
      tm.playerJoined = false;

      // Pulsing ring
      tm.callRing = this.add.circle(tm.x, tm.y, 20, 0x22c55e, 0)
        .setStrokeStyle(2, 0x22c55e, 0.7).setDepth(tm.y + 19);
      this.tweens.add({
        targets: tm.callRing,
        scaleX: 1.8, scaleY: 1.8, alpha: 0,
        duration: 900, repeat: -1, ease: 'Sine.easeOut'
      });
      this.roomObjects.push(tm.callRing);

      // Call domain (green transparent area)
      tm.callDomain = this.add.circle(tm.x, tm.y, 55, 0x22c55e, 0.08)
        .setStrokeStyle(1, 0x22c55e, 0.3).setDepth(tm.y + 17)
        .setInteractive({ useHandCursor: true });
      tm.callDomain.on('pointerdown', (p: Phaser.Input.Pointer) => {
        p.event.stopPropagation();
        this.toggleJoin(tm);
      });
      this.roomObjects.push(tm.callDomain);

      // "In a Call" label
      const labelBg = this.add.rectangle(tm.x, tm.y + 28, 80, 18, 0x166534, 0.9).setStrokeStyle(1, 0x22c55e);
      const labelText = this.add.text(tm.x, tm.y + 28, '📞 In a Call', {
        fontSize: '9px', color: '#bbf7d0', fontStyle: 'bold'
      }).setOrigin(0.5);
      tm.callLabel = this.add.container(0, 0, [labelBg, labelText]).setDepth(tm.y + 35);
      this.roomObjects.push(tm.callLabel);

      this.showNotification(`Call started with ${tm.name}`);
    }
  }

  private toggleJoin(tm: TeammateData) {
    if (!tm.inCall) return;

    if (tm.playerJoined) {
      // --- Leave ---
      tm.playerJoined = false;
      if (tm.joinLabel) { tm.joinLabel.destroy(); tm.joinLabel = undefined; }
      // Shrink domain back
      if (tm.callDomain) {
        this.tweens.add({ targets: tm.callDomain, scaleX: 1, scaleY: 1, duration: 300, ease: 'Back.easeIn' });
      }
      this.showNotification(`You left the call with ${tm.name}.`);
    } else {
      // --- Join ---
      tm.playerJoined = true;

      // Expand domain to show you joined
      if (tm.callDomain) {
        tm.callDomain.setFillStyle(0x22c55e, 0.12);
        this.tweens.add({ targets: tm.callDomain, scaleX: 1.3, scaleY: 1.3, duration: 400, ease: 'Back.easeOut' });
      }

      // "You + Name" joined label
      const jBg = this.add.rectangle(tm.x, tm.y + 48, 100, 18, 0xffffff, 0.95).setStrokeStyle(1, 0x22c55e);
      const jText = this.add.text(tm.x, tm.y + 48, `🔗 You + ${tm.name}`, {
        fontSize: '9px', color: '#16a34a', fontStyle: 'bold'
      }).setOrigin(0.5);
      tm.joinLabel = this.add.container(0, 0, [jBg, jText]).setDepth(tm.y + 40);
      this.roomObjects.push(tm.joinLabel);

      // Confirmation burst
      const confirm = this.add.text(tm.x, tm.y - 40, '✅ Joined!', {
        fontSize: '14px', color: '#4ade80', fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(30);
      this.tweens.add({
        targets: confirm, y: confirm.y - 35, alpha: 0,
        duration: 1000, ease: 'Cubic.easeOut',
        onComplete: () => confirm.destroy()
      });

      this.showNotification(`You joined the call with ${tm.name}!`);
    }
  }

  private doWave(tm: TeammateData) {
    for (let i = 0; i < 3; i++) {
      const wave = this.add.text(
        tm.x + Phaser.Math.Between(-20, 20),
        tm.y + Phaser.Math.Between(-20, 5),
        '👋', { fontSize: '18px' }
      ).setOrigin(0.5).setDepth(30);

      this.tweens.add({
        targets: wave,
        y: wave.y - 40 - i * 12, alpha: 0,
        angle: Phaser.Math.Between(-30, 30),
        duration: 800 + i * 200, delay: i * 100,
        ease: 'Cubic.easeOut',
        onComplete: () => wave.destroy()
      });
    }
    this.showNotification(`You waved at ${tm.name}!`);
  }

  // =============================================
  //  NOTIFICATION TOAST
  // =============================================

  private showNotification(message: string) {
    if (this.notifContainer) this.notifContainer.destroy();

    const w = this.cameras.main.width;
    const nx = w / 2;
    const ny = 40;

    const bg = this.add.rectangle(nx, ny, message.length * 7.5 + 40, 30, 0xffffff, 0.95)
      .setStrokeStyle(1, 0xd1d5db).setOrigin(0.5);
    const text = this.add.text(nx, ny, message, { fontSize: '12px', color: '#374151' }).setOrigin(0.5);

    this.notifContainer = this.add.container(0, 0, [bg, text]).setDepth(50).setAlpha(0);
    this.tweens.add({ targets: this.notifContainer, alpha: 1, duration: 200 });

    this.time.delayedCall(2500, () => {
      if (this.notifContainer) {
        this.tweens.add({
          targets: this.notifContainer, alpha: 0, duration: 300,
          onComplete: () => { this.notifContainer?.destroy(); this.notifContainer = null; }
        });
      }
    });
  }

  // =============================================
  //  CLEANUP
  // =============================================

  private dismissAllOverlays() {
    if (this.activeMenu) { this.activeMenu.destroy(); this.activeMenu = null; }
    if (this.activePopup) { this.activePopup.destroy(); this.activePopup = null; }
    if (this.selectedSeat) {
      this.setSeatState(this.selectedSeat, 'idle');
      this.selectedSeat = null;
    }
  }
}
