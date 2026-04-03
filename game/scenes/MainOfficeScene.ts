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
    zones: [
      { x: 240, y: 145, label: '💻 DEV ZONE' },
      { x: 600, y: 345, label: '🎨 DESIGN ZONE' },
      { x: 200, y: 445, label: '📋 MEETING AREA' },
    ],
    desks: [
      { x: 300, y: 200, w: 120, h: 60, label: 'Dev Station Alpha', desc: 'Main development workstation. 2 monitors, standing desk.' },
      { x: 600, y: 400, w: 120, h: 60, label: 'Design Bench', desc: 'Creative workspace with drawing tablet and color-calibrated display.' },
      { x: 200, y: 500, w: 160, h: 80, label: 'Meeting Table', desc: 'Team standup area. Seats 6 people.' },
    ],
    teammates: [
      { x: 300, y: 240, color: 0x06b6d4, name: 'Jane', role: 'UI Designer' },
      { x: 600, y: 360, color: 0x10b981, name: 'Mark', role: 'Backend Eng.' },
      { x: 200, y: 550, color: 0xf59e0b, name: 'Sarah', role: 'Product Mgr.' },
    ],
    doors: [
      { x: 750, y: 300, w: 30, h: 80, label: '→ Lounge', targetRoom: 'lounge' },
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
  hoverContainer: Phaser.GameObjects.Container;
  callLabel?: Phaser.GameObjects.Container;
  callRing?: Phaser.GameObjects.Arc;
  callDomain?: Phaser.GameObjects.Arc;
  joinLabel?: Phaser.GameObjects.Container;
}

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
  private roomObjects: Phaser.GameObjects.GameObject[] = [];

  private activeMenu: Phaser.GameObjects.Container | null = null;
  private activePopup: Phaser.GameObjects.Container | null = null;
  private notifContainer: Phaser.GameObjects.Container | null = null;
  private roomTitleText!: Phaser.GameObjects.Text;
  private roomSubText!: Phaser.GameObjects.Text;

  private lastAvatarColor: string = '';

  constructor() {
    super({ key: 'MainOfficeScene' });
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // --- Persistent background grid (re-tinted per room) ---
    this.add.grid(width / 2, height / 2, width * 2, height * 2, 40, 40, 0x0f172a, 1, 0x1e293b, 0.4);

    // --- Room title HUD (top-right, persistent) ---
    this.roomTitleText = this.add.text(width - 20, 18, '', {
      fontSize: '14px', color: '#c084fc', fontStyle: 'bold'
    }).setOrigin(1, 0).setDepth(50).setScrollFactor(0);
    this.roomSubText = this.add.text(width - 20, 36, '', {
      fontSize: '10px', color: '#64748b'
    }).setOrigin(1, 0).setDepth(50).setScrollFactor(0);

    // --- Player Avatar (persistent across rooms) ---
    const avatarColor = hexToNum(useAvatarStore.getState().config.topColor);
    this.player = this.add.circle(400, 300, 14, avatarColor);
    this.player.setStrokeStyle(2, 0xffffff);
    this.player.setDepth(5);
    this.physics.add.existing(this.player);
    (this.player.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);

    this.playerLabel = this.add.text(400, 270, 'You', {
      fontSize: '11px', color: '#c084fc', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(5);

    this.events.on('update', () => {
      this.playerLabel.setPosition(this.player.x, this.player.y - 22);
    });

    // --- Keyboard Input ---
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd = {
        W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      };
    }

    // --- Click-away to dismiss menus ---
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const hitObjects = this.input.hitTestPointer(pointer);
      if (hitObjects.length === 0) this.dismissAllOverlays();
    });

    // --- Load initial room ---
    this.loadRoom('main');
  }

  update() {
    if (!this.cursors || !this.player.body) return;

    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0);

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

    // Zone labels
    for (const z of room.zones) {
      const t = this.add.text(z.x, z.y, z.label, { fontSize: '10px', color: '#475569' }).setOrigin(0.5);
      this.roomObjects.push(t);
    }

    // Desks
    for (const d of room.desks) {
      this.spawnDesk(d.x, d.y, d.w, d.h, 0x334155, d.label, d.desc);
    }

    // Teammates
    for (const tm of room.teammates) {
      this.spawnTeammate(tm.x, tm.y, tm.color, tm.name, tm.role);
    }

    // Doors
    for (const dr of room.doors) {
      this.spawnDoor(dr.x, dr.y, dr.w, dr.h, dr.label, dr.targetRoom);
    }

    // Transition flash
    this.cameras.main.fadeIn(350, 0, 0, 0);
  }

  private clearRoom() {
    // Destroy all room-specific objects
    for (const obj of this.roomObjects) {
      obj.destroy();
    }
    this.roomObjects = [];

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
  //  DOOR CREATION
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
      fontSize: '11px', color: '#c084fc', fontStyle: 'bold'
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

  // =============================================
  //  DESK CREATION + INTERACTION
  // =============================================

  private spawnDesk(x: number, y: number, w: number, h: number, color: number, label: string, description: string) {
    const desk = this.add.rectangle(x, y, w, h, color, 0.2);
    desk.setStrokeStyle(1, color);
    desk.setInteractive({ useHandCursor: true });
    desk.setDepth(1);
    this.roomObjects.push(desk);

    this.physics.add.existing(desk, true);

    const deskData: DeskData = { rect: desk, label, description, x, y };
    this.desks.push(deskData);

    desk.on('pointerover', () => {
      desk.setStrokeStyle(2, 0x7c3aed);
      desk.setFillStyle(color, 0.35);
    });
    desk.on('pointerout', () => {
      desk.setStrokeStyle(1, color);
      desk.setFillStyle(color, 0.2);
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

    const bg = this.add.rectangle(px, py, popupW, popupH, 0x0f172a, 0.95)
      .setStrokeStyle(1, 0x7c3aed).setOrigin(0.5);
    const title = this.add.text(px, py - 18, desk.label, {
      fontSize: '13px', color: '#e2e8f0', fontStyle: 'bold'
    }).setOrigin(0.5);
    const desc = this.add.text(px, py + 6, desk.description, {
      fontSize: '10px', color: '#94a3b8', wordWrap: { width: popupW - 24 }, align: 'center'
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
    teammate.setDepth(3);
    this.roomObjects.push(teammate);

    const hoverBg = this.add.rectangle(x, y - 35, 120, 40, 0x1e293b, 0.9)
      .setStrokeStyle(1, 0x475569);
    const hoverName = this.add.text(x, y - 43, name, {
      fontSize: '13px', color: '#fff', fontStyle: 'bold'
    }).setOrigin(0.5);
    const hoverRole = this.add.text(x, y - 27, role, {
      fontSize: '10px', color: '#94a3b8'
    }).setOrigin(0.5);
    const hoverContainer = this.add.container(0, 0, [hoverBg, hoverName, hoverRole]);
    hoverContainer.setAlpha(0).setDepth(10);
    this.roomObjects.push(hoverContainer);

    const tmData: TeammateData = {
      circle: teammate, name, role, color, x, y,
      inCall: false, playerJoined: false, hoverContainer
    };
    this.teammates.push(tmData);

    teammate.on('pointerover', () => {
      this.tweens.add({ targets: hoverContainer, alpha: 1, duration: 120 });
      teammate.setStrokeStyle(2, 0xffffff, 1);
    });
    teammate.on('pointerout', () => {
      this.tweens.add({ targets: hoverContainer, alpha: 0, duration: 120 });
      teammate.setStrokeStyle(2, 0xffffff, tmData.inCall ? 1 : 0.5);
    });
    teammate.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation();
      this.showTeammateMenu(tmData);
    });
  }

  private showTeammateMenu(tm: TeammateData) {
    this.dismissAllOverlays();

    const menuX = tm.x + 30;
    const menuY = tm.y - 60;
    const menuW = 140;

    const items: { icon: string; label: string; action: () => void }[] = [
      { icon: '🎉', label: 'Send Kudos', action: () => { this.dismissAllOverlays(); this.doKudos(tm); } },
      { icon: tm.inCall ? '📴' : '📞', label: tm.inCall ? 'End Call' : 'Start Call', action: () => { this.dismissAllOverlays(); this.toggleCall(tm); } },
    ];

    // If a call is active, offer Join / Leave
    if (tm.inCall) {
      items.push({
        icon: tm.playerJoined ? '🚪' : '🔗',
        label: tm.playerJoined ? 'Leave Call' : 'Join Call',
        action: () => { this.dismissAllOverlays(); this.toggleJoin(tm); }
      });
    }

    items.push({ icon: '👋', label: 'Wave', action: () => { this.dismissAllOverlays(); this.doWave(tm); } });

    const rowH = 32;
    const headerH = 28;
    const totalH = headerH + items.length * rowH + 8;
    const children: Phaser.GameObjects.GameObject[] = [];

    const bg = this.add.rectangle(menuX, menuY + totalH / 2, menuW, totalH, 0x0f172a, 0.95)
      .setStrokeStyle(1, 0x475569).setOrigin(0.5);
    children.push(bg);

    const header = this.add.text(menuX, menuY + 14, tm.name, {
      fontSize: '12px', color: '#c084fc', fontStyle: 'bold'
    }).setOrigin(0.5);
    children.push(header);

    const divider = this.add.rectangle(menuX, menuY + headerH, menuW - 16, 1, 0x334155);
    children.push(divider);

    items.forEach((item, i) => {
      const iy = menuY + headerH + 8 + i * rowH + rowH / 2;
      const rowBg = this.add.rectangle(menuX, iy, menuW - 8, rowH - 4, 0x1e293b, 0)
        .setInteractive({ useHandCursor: true }).setOrigin(0.5);
      const rowText = this.add.text(menuX - menuW / 2 + 16, iy, `${item.icon}  ${item.label}`, {
        fontSize: '12px', color: '#e2e8f0'
      }).setOrigin(0, 0.5);

      rowBg.on('pointerover', () => rowBg.setFillStyle(0x334155, 0.6));
      rowBg.on('pointerout', () => rowBg.setFillStyle(0x1e293b, 0));
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
      // --- End Call ---
      tm.inCall = false;
      tm.playerJoined = false;
      tm.circle.setStrokeStyle(2, 0xffffff, 0.5);
      if (tm.callRing) { tm.callRing.destroy(); tm.callRing = undefined; }
      if (tm.callLabel) { tm.callLabel.destroy(); tm.callLabel = undefined; }
      if (tm.callDomain) { tm.callDomain.destroy(); tm.callDomain = undefined; }
      if (tm.joinLabel) { tm.joinLabel.destroy(); tm.joinLabel = undefined; }
      this.showNotification(`Call with ${tm.name} ended.`);
    } else {
      // --- Start Call ---
      tm.inCall = true;
      tm.playerJoined = false;
      tm.circle.setStrokeStyle(3, 0x22c55e, 1);

      // Pulsing ring
      const ring = this.add.circle(tm.x, tm.y, 18, 0x22c55e, 0).setStrokeStyle(2, 0x22c55e, 0.6).setDepth(2);
      tm.callRing = ring;
      this.roomObjects.push(ring);
      this.tweens.add({
        targets: ring, scaleX: 1.6, scaleY: 1.6, alpha: 0,
        duration: 1200, repeat: -1, ease: 'Sine.easeOut'
      });

      // Call domain zone (large translucent green area)
      const domain = this.add.circle(tm.x, tm.y, 55, 0x22c55e, 0.06);
      domain.setStrokeStyle(1, 0x22c55e, 0.25);
      domain.setDepth(1);
      domain.setInteractive({ useHandCursor: true });
      tm.callDomain = domain;
      this.roomObjects.push(domain);

      // Click domain to join
      domain.on('pointerdown', (p: Phaser.Input.Pointer) => {
        p.event.stopPropagation();
        if (!tm.playerJoined) this.toggleJoin(tm);
      });

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
      const jBg = this.add.rectangle(tm.x, tm.y + 48, 100, 18, 0x0f172a, 0.9).setStrokeStyle(1, 0x22c55e);
      const jText = this.add.text(tm.x, tm.y + 48, `🔗 You + ${tm.name}`, {
        fontSize: '9px', color: '#86efac', fontStyle: 'bold'
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

    const bg = this.add.rectangle(nx, ny, message.length * 7.5 + 40, 30, 0x0f172a, 0.92)
      .setStrokeStyle(1, 0x7c3aed).setOrigin(0.5);
    const text = this.add.text(nx, ny, message, { fontSize: '12px', color: '#e2e8f0' }).setOrigin(0.5);

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
  }
}
