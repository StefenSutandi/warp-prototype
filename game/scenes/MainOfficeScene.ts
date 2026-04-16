import Phaser from 'phaser';
import { useAvatarStore } from '@/stores/useAvatarStore';

function hexToNum(hex: string): number {
  return parseInt(hex.replace('#', ''), 16);
}

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
  teammates: { x: number; y: number; color: number; name: string; role: string }[];
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
  sitOverlay?: Phaser.GameObjects.Image;
}

const VIRTUAL_ROOM_ASSETS = {
  roomBase: '/assets/virtual-room/base/room_base.png',
  table: '/assets/virtual-room/furniture/table.png',
  tv: '/assets/virtual-room/furniture/tv_console.png',
  door: '/assets/virtual-room/furniture/door_closed.png',
  chairFrontOrange: '/assets/virtual-room/chairs/front/chair_front_orange.png',
  chairFrontGreen: '/assets/virtual-room/chairs/front/chair_front_green.png',
  chairFrontBlue: '/assets/virtual-room/chairs/front/chair_front_blue.png',
  chairBackOrange: '/assets/virtual-room/chairs/back/chair_back_orange.png',
  chairBackGreen: '/assets/virtual-room/chairs/back/chair_back_green.png',
  chairBackBlue: '/assets/virtual-room/chairs/back/chair_back_blue.png',
  chairFrontHoverOrange: '/assets/virtual-room/chairs/hover/chair_front_hover_orange.png',
  chairFrontHoverGreen: '/assets/virtual-room/chairs/hover/chair_front_hover_green.png',
  chairFrontHoverBlue: '/assets/virtual-room/chairs/hover/chair_front_hover_blue.png',
  chairBackHoverOrange: '/assets/virtual-room/chairs/hover/chair_back_hover_orange.png',
  chairBackHoverGreen: '/assets/virtual-room/chairs/hover/chair_back_hover_green.png',
  chairBackHoverBlue: '/assets/virtual-room/chairs/hover/chair_back_hover_blue.png',
  sitPopupPrimary: '/assets/virtual-room/overlays/sit_popup_primary.png',
} as const;

const FIGMA_MAIN_ROOM = {
  roomBase: { x: 8, y: 127, w: 1274.9627685546875, h: 779.8630981445312 },
  tv: { x: 232.869140625, y: 143.8271484375, w: 291.2351379394531, h: 372.7810363769531 },
  table: { x: 402.1380920410156, y: 389.75921630859375, w: 387.66632080078125, h: 269.8779296875 },
  door: { x: 974.2535400390625, y: 272.61749267578125, w: 135.90972900390625, h: 300.29583740234375 },
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
  private player!: Phaser.GameObjects.Arc;
  private playerLabel!: Phaser.GameObjects.Text;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };
  private speed: number = 250;

  private currentRoomId: string = 'main';
  private teammates: TeammateData[] = [];
  private desks: DeskData[] = [];
  private seats: SeatData[] = [];
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
  private handleExternalRoomSwitch = (event: Event) => {
    const customEvent = event as CustomEvent<{ roomId?: string }>;
    const nextRoomId = customEvent.detail?.roomId;

    if (!nextRoomId || nextRoomId === this.currentRoomId || !ROOMS[nextRoomId]) {
      return;
    }

    this.switchRoom(nextRoomId);
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

  private lastAvatarColor: string = '';

  constructor() {
    super({ key: 'MainOfficeScene' });
  }

  // =============================================
  //  PRELOAD — load all image assets
  // =============================================

  preload() {
    this.load.image('room_base', VIRTUAL_ROOM_ASSETS.roomBase);
    this.load.image('table', VIRTUAL_ROOM_ASSETS.table);
    this.load.image('tv', VIRTUAL_ROOM_ASSETS.tv);
    this.load.image('door_main', VIRTUAL_ROOM_ASSETS.door);
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
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // --- Soft background fill (warm beige, visible if assets don't cover edges) ---
    this.add.rectangle(width / 2, height / 2, width, height, 0xf0ece4).setDepth(-1);

    // --- Room title HUD (top-right, persistent) ---
    this.roomTitleText = this.add.text(width - 20, 18, '', {
      fontSize: '14px', color: '#6366f1', fontStyle: 'bold'
    }).setOrigin(1, 0).setDepth(50).setScrollFactor(0).setVisible(false);
    this.roomSubText = this.add.text(width - 20, 36, '', {
      fontSize: '10px', color: '#9ca3af'
    }).setOrigin(1, 0).setDepth(50).setScrollFactor(0).setVisible(false);

    // --- Player Avatar (persistent across rooms) ---
    const avatarColor = hexToNum(useAvatarStore.getState().config.topColor);
    this.player = this.add.circle(400, 300, 14, avatarColor);
    this.player.setStrokeStyle(2, 0xffffff);
    this.player.setDepth(5);
    this.physics.add.existing(this.player);
    (this.player.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);

    this.playerLabel = this.add.text(400, 270, 'You', {
      fontSize: '11px', color: '#6366f1', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(5).setVisible(false);

    this.events.on('update', () => {
      this.playerLabel.setPosition(this.player.x, this.player.y - 22);
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
        Phaser.Input.Keyboard.KeyCodes.W,
        Phaser.Input.Keyboard.KeyCodes.A,
        Phaser.Input.Keyboard.KeyCodes.S,
        Phaser.Input.Keyboard.KeyCodes.D,
      ]);
    }

    // --- Click-away to dismiss menus ---
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const hitObjects = this.input.hitTestPointer(pointer);
      if (hitObjects.length === 0) this.dismissAllOverlays();
    });

    if (typeof window !== 'undefined') {
      window.addEventListener('warp:switch-room', this.handleExternalRoomSwitch as EventListener);
      window.addEventListener('blur', this.handleWindowBlur);
      document.addEventListener('focusin', this.handleDocumentFocusChange);
      document.addEventListener('focusout', this.handleDocumentFocusChange);
      this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
        window.removeEventListener('warp:switch-room', this.handleExternalRoomSwitch as EventListener);
        window.removeEventListener('blur', this.handleWindowBlur);
        document.removeEventListener('focusin', this.handleDocumentFocusChange);
        document.removeEventListener('focusout', this.handleDocumentFocusChange);
        if (this.focusSyncTimeout !== null) {
          window.clearTimeout(this.focusSyncTimeout);
          this.focusSyncTimeout = null;
        }
      });
    }

    this.syncMovementKeyboardState();

    // --- Load initial room ---
    this.loadRoom('main');
  }

  update() {
    if (!this.cursors || !this.player.body) return;

    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0);

    if (this.movementInputBlocked || this.isEditableElementFocused()) {
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

    // Reactive avatar color sync
    const currentColor = useAvatarStore.getState().config.topColor;
    if (currentColor !== this.lastAvatarColor) {
      this.lastAvatarColor = currentColor;
      this.player.setFillStyle(hexToNum(currentColor));
    }
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
      // ===== OTHER ROOMS: Keep a neutral non-final holding state only =====
      const fallbackBg = this.add.rectangle(width / 2, height / 2, width, height, 0xf5f1e8)
        .setDepth(0);
      this.roomObjects.push(fallbackBg);
    }

    if (roomId === 'main') {
      // Desks (invisible hitboxes for main room only)
      for (const d of room.desks) {
        this.spawnDesk(d.x, d.y, d.w, d.h, 0x000000, d.label, d.desc, true);
      }

      // Teammates
      for (const tm of room.teammates) {
        this.spawnTeammate(tm.x, tm.y, tm.color, tm.name, tm.role);
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
    const baseScale = Math.min(width / 1970, height / 1205) * 1.08;
    const roomCenterX = width * 0.505;
    const roomCenterY = height * 0.54;
    const roomBaseWidth = 1970 * baseScale;
    const roomBaseHeight = 1205 * baseScale;
    const roomBaseLeft = roomCenterX - roomBaseWidth / 2;
    const roomBaseTop = roomCenterY - roomBaseHeight / 2;
    const layoutScale = roomBaseWidth / FIGMA_MAIN_ROOM.roomBase.w;

    const roomBase = this.add.image(roomCenterX, roomCenterY, 'room_base')
      .setScale(baseScale)
      .setDepth(0);
    this.roomObjects.push(roomBase);

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

    room.desks[0].x = tableRect.x + tableRect.w / 2;
    room.desks[0].y = tableRect.y + tableRect.h / 2;
    room.desks[0].w = tableRect.w * 0.62;
    room.desks[0].h = tableRect.h * 0.46;

    room.teammates[0].x = mapRect(FIGMA_MAIN_ROOM.seats[3]).x + mapRect(FIGMA_MAIN_ROOM.seats[3]).w * 0.5;
    room.teammates[0].y = mapRect(FIGMA_MAIN_ROOM.seats[3]).y + mapRect(FIGMA_MAIN_ROOM.seats[3]).h * 0.46;
    room.teammates[1].x = mapRect(FIGMA_MAIN_ROOM.seats[1]).x + mapRect(FIGMA_MAIN_ROOM.seats[1]).w * 0.52;
    room.teammates[1].y = mapRect(FIGMA_MAIN_ROOM.seats[1]).y + mapRect(FIGMA_MAIN_ROOM.seats[1]).h * 0.44;
    room.teammates[2].x = mapRect(FIGMA_MAIN_ROOM.seats[5]).x + mapRect(FIGMA_MAIN_ROOM.seats[5]).w * 0.48;
    room.teammates[2].y = mapRect(FIGMA_MAIN_ROOM.seats[5]).y + mapRect(FIGMA_MAIN_ROOM.seats[5]).h * 0.42;

    const doorRect = mapRect(FIGMA_MAIN_ROOM.door);
    room.doors[0].x = doorRect.x;
    room.doors[0].y = doorRect.y;
    room.doors[0].w = doorRect.w;
    room.doors[0].h = doorRect.h;
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

    if (seat.sitOverlay) {
      seat.sitOverlay
        .setPosition(overlayX, overlayY)
        .setDisplaySize(overlayWidth, overlayHeight)
        .setDepth(seat.depth + 6)
        .setVisible(true);
      return;
    }

    seat.sitOverlay = this.add.image(overlayX, overlayY, 'sit_popup_primary')
      .setOrigin(0, 0)
      .setDisplaySize(overlayWidth, overlayHeight)
      .setDepth(seat.depth + 6);
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
      doorImg.setTint(0xddd6fe);
      doorImg.setAlpha(0.96);
    });
    doorImg.on('pointerout', () => {
      doorImg.clearTint();
      doorImg.setAlpha(1);
    });

    // Click → switch room
    doorImg.on('pointerdown', (p: Phaser.Input.Pointer) => {
      p.event.stopPropagation();
      this.switchRoom(targetRoom);
    });
  }

  private clearRoom() {
    // Destroy all room-specific objects
    for (const obj of this.roomObjects) {
      obj.destroy();
    }
    this.roomObjects = [];
    this.seats = [];
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
  }

  private switchRoom(targetRoom: string) {
    // Fade out then rebuild
    this.cameras.main.fadeOut(250, 0, 0, 0);
    this.time.delayedCall(260, () => {
      // Reposition player on the opposite side
      const width = this.cameras.main.width;
      const target = ROOMS[targetRoom];
      if (!target) return;

      // If the door we entered from is on the left, spawn player on the right and vice versa
      const door = target.doors[0];
      if (door) {
        if (door.x < width / 2) {
          this.player.setPosition(width - 100, 300);
        } else {
          this.player.setPosition(100, 300);
        }
      }

      this.loadRoom(targetRoom);
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

  private spawnTeammate(x: number, y: number, color: number, name: string, role: string) {
    const teammate = this.add.circle(x, y, 12, color);
    teammate.setStrokeStyle(2, 0xffffff, 0.5);
    teammate.setInteractive({ useHandCursor: true });
    teammate.setDepth(y + 18);
    this.roomObjects.push(teammate);

    const shadow = this.add.ellipse(x, y + 14, 26, 10, 0x312e81, 0.14)
      .setDepth(y - 3);
    this.roomObjects.push(shadow);

    const tmData: TeammateData = {
      circle: teammate, name, role, color, x, y,
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
    this.activeMenu.setDepth(25);
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
        .setStrokeStyle(2, 0x22c55e, 0.7).setDepth(2);
      this.tweens.add({
        targets: tm.callRing,
        scaleX: 1.8, scaleY: 1.8, alpha: 0,
        duration: 900, repeat: -1, ease: 'Sine.easeOut'
      });
      this.roomObjects.push(tm.callRing);

      // Call domain (green transparent area)
      tm.callDomain = this.add.circle(tm.x, tm.y, 55, 0x22c55e, 0.08)
        .setStrokeStyle(1, 0x22c55e, 0.3).setDepth(1)
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
      tm.callLabel = this.add.container(0, 0, [labelBg, labelText]).setDepth(10);
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
      tm.joinLabel = this.add.container(0, 0, [jBg, jText]).setDepth(10);
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
