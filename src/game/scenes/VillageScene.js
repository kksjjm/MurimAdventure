// =============================================================================
// VillageScene.js - Village map scene (no combat, NPCs, portals)
// =============================================================================

import Phaser from 'phaser';
import Player from '../entities/Player.js';
import MapTransitionSystem from '../systems/MapTransitionSystem.js';
import { getMapData } from '../data/mapData.js';

const TILE_SIZE = 32;
const PORTAL_RANGE = 40; // pixels
const NPC_INTERACT_RANGE = 64; // pixels

export default class VillageScene extends Phaser.Scene {
  constructor() {
    super({ key: 'VillageScene' });
  }

  init(data) {
    this.initData = data || {};
  }

  create() {
    this.mapId = 'village_01';
    this._transitioning = false;

    const mapData = getMapData(this.mapId);
    if (!mapData) {
      console.error('[VillageScene] No map data for village_01');
      return;
    }

    this.mapConfig = mapData;
    this.mapTiles = mapData.tiles;
    const MAP_W = mapData.width;
    const MAP_H = mapData.height;

    // --- Render tilemap ---
    this._renderMap(MAP_W, MAP_H);

    // --- World bounds ---
    this.physics.world.setBounds(0, 0, MAP_W * TILE_SIZE, MAP_H * TILE_SIZE);

    // --- Player ---
    const spawnX = (this.initData.spawnX || mapData.spawns.player.x);
    const spawnY = (this.initData.spawnY || mapData.spawns.player.y);
    const px = spawnX * TILE_SIZE + TILE_SIZE / 2;
    const py = spawnY * TILE_SIZE + TILE_SIZE / 2;

    this.player = new Player(this, px, py);

    // Restore player data if transitioning from another scene
    if (this.initData.playerStats) {
      Object.assign(this.player.stats, this.initData.playerStats);
    }
    if (this.initData.playerInventory) {
      this.player.inventory = this.initData.playerInventory;
    }
    if (this.initData.playerEquipment) {
      this.player.equipment = { ...this.player.equipment, ...this.initData.playerEquipment };
    }
    if (this.initData.playerSkills) {
      this.player.skills = this.initData.playerSkills;
    }
    if (this.initData.playerSkillSlots) {
      this.player.skillSlots = this.initData.playerSkillSlots;
    }

    // --- Collisions ---
    this.physics.add.collider(this.player, this.wallLayer);

    // --- Camera ---
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setBounds(0, 0, MAP_W * TILE_SIZE, MAP_H * TILE_SIZE);

    // --- Portals ---
    this.portalZones = [];
    this.portalLabels = [];
    this._createPortals(mapData.portals);

    // --- NPCs ---
    this.npcs = [];
    this.npcGroup = this.physics.add.staticGroup();
    this._createNPCs(mapData.npcs || []);
    this.physics.add.collider(this.player, this.npcGroup);

    // --- Input ---
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
    this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);

    // Click to interact with NPC
    this.input.on('pointerdown', this._onPointerDown, this);

    // --- Minimap ---
    this._createMinimap(MAP_W, MAP_H);

    // --- Launch UI overlay ---
    this.scene.launch('UIScene', { worldScene: this });

    // --- Show map name ---
    MapTransitionSystem.showMapName(this, mapData.nameKo);

    // --- Emit initial stats ---
    this.events.emit('player-stats-changed');
  }

  // ==========================================================================
  // Map Rendering
  // ==========================================================================

  _renderMap(MAP_W, MAP_H) {
    const tileKeys = ['tile_grass', 'tile_dirt', 'tile_stone', 'tile_water', 'tile_wall', 'tile_tree'];

    this.groundLayer = this.add.container(0, 0);
    this.groundLayer.setDepth(0);

    this.wallLayer = this.physics.add.staticGroup();

    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const tileType = this.mapTiles[y][x];
        const px = x * TILE_SIZE + TILE_SIZE / 2;
        const py = y * TILE_SIZE + TILE_SIZE / 2;

        const sprite = this.add.image(px, py, tileKeys[tileType]);
        sprite.setDepth(0);

        if (tileType === 4 || tileType === 5 || tileType === 3) {
          const wall = this.wallLayer.create(px, py, tileKeys[tileType]);
          wall.setVisible(false);
          wall.body.setSize(TILE_SIZE, TILE_SIZE);
          wall.refreshBody();
        }
      }
    }
  }

  // ==========================================================================
  // Portals
  // ==========================================================================

  _createPortals(portals) {
    if (!portals) return;

    for (const portal of portals) {
      const px = portal.x * TILE_SIZE + TILE_SIZE / 2;
      const py = portal.y * TILE_SIZE + TILE_SIZE / 2;

      // Visual indicator
      const portalSprite = this.add.image(px, py, 'portal');
      portalSprite.setDepth(5);
      portalSprite.setAlpha(0.7);

      // Pulsing animation
      this.tweens.add({
        targets: portalSprite,
        alpha: { from: 0.4, to: 0.9 },
        scaleX: { from: 0.9, to: 1.1 },
        scaleY: { from: 0.9, to: 1.1 },
        duration: 1200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      // Label (hidden by default)
      const label = this.add.text(px, py - 24, portal.label, {
        fontSize: '12px',
        fontFamily: 'monospace',
        color: '#aaddff',
        stroke: '#000000',
        strokeThickness: 2,
      });
      label.setOrigin(0.5, 1);
      label.setDepth(100);
      label.setVisible(false);

      this.portalZones.push({
        x: px, y: py,
        targetMap: portal.targetMap,
        targetX: portal.targetX,
        targetY: portal.targetY,
        label,
        sprite: portalSprite,
      });
      this.portalLabels.push(label);
    }
  }

  _checkPortals() {
    if (this._transitioning) return;

    for (const portal of this.portalZones) {
      const dist = Phaser.Math.Distance.Between(
        this.player.x, this.player.y, portal.x, portal.y
      );

      if (dist < PORTAL_RANGE) {
        portal.label.setVisible(true);

        // Auto-transition when very close
        if (dist < 20) {
          this._transitioning = true;
          MapTransitionSystem.transition(this, portal.targetMap, portal.targetX, portal.targetY);
          return;
        }
      } else {
        portal.label.setVisible(false);
      }
    }
  }

  // ==========================================================================
  // NPCs
  // ==========================================================================

  _createNPCs(npcConfigs) {
    // Try to import NPC class dynamically - if not available, create placeholder sprites
    for (const npcConf of npcConfigs) {
      const px = npcConf.tileX * TILE_SIZE + TILE_SIZE / 2;
      const py = npcConf.tileY * TILE_SIZE + TILE_SIZE / 2;

      // Try to use NPC entity class
      let npcSprite;
      try {
        // Use the NPC texture if available
        const textureKey = npcConf.id; // e.g. 'npc_elder'
        if (this.textures.exists(textureKey)) {
          npcSprite = this.physics.add.sprite(px, py, textureKey);
        } else {
          // Fallback: use player_base with tint
          npcSprite = this.physics.add.sprite(px, py, 'player_base');
          npcSprite.setTint(0xaaaaff);
        }
      } catch (e) {
        npcSprite = this.physics.add.sprite(px, py, 'player_base');
        npcSprite.setTint(0xaaaaff);
      }

      npcSprite.setDepth(10);
      npcSprite.setImmovable(true);
      npcSprite.body.setSize(32, 40);
      npcSprite.body.setOffset(16, 20);

      // Store NPC data
      npcSprite.npcId = npcConf.id;
      npcSprite.npcData = npcConf;

      // NPC name label
      const nameLabel = this.add.text(px, py - 40, this._getNPCDisplayName(npcConf.id), {
        fontSize: '10px',
        fontFamily: 'monospace',
        color: '#ffdd88',
        stroke: '#000000',
        strokeThickness: 2,
      });
      nameLabel.setOrigin(0.5, 1);
      nameLabel.setDepth(100);
      npcSprite.nameLabel = nameLabel;

      this.npcGroup.add(npcSprite);
      this.npcs.push(npcSprite);
    }
  }

  _getNPCDisplayName(npcId) {
    const names = {
      npc_elder: '촌장 어른',
      npc_blacksmith: '대장장이',
      npc_merchant: '상인',
      npc_guard: '경비병',
      npc_herbalist: '약초꾼',
    };
    return names[npcId] || npcId;
  }

  _findNearestNPC(maxRange) {
    let closest = null;
    let closestDist = maxRange;

    for (const npc of this.npcs) {
      const dist = Phaser.Math.Distance.Between(
        this.player.x, this.player.y, npc.x, npc.y
      );
      if (dist < closestDist) {
        closest = npc;
        closestDist = dist;
      }
    }

    return closest;
  }

  _interactWithNPC(npc) {
    if (!npc) return;

    // Show interaction bubble
    const dialogTexts = {
      npc_elder: '환영하네, 젊은이. 이 무림촌에서 수련하고 강해지거라.',
      npc_blacksmith: '무기가 필요한가? 좋은 검을 만들어 줄 수 있지.',
      npc_merchant: '어서 오세요~ 여행에 필요한 물건이 있습니다.',
      npc_guard: '마을 밖은 위험하니 조심하시오.',
      npc_herbalist: '약초가 필요하시면 말씀하세요.',
    };

    const text = dialogTexts[npc.npcId] || '...';

    // Create dialog bubble
    if (this._dialogBubble) {
      this._dialogBubble.destroy();
      this._dialogText.destroy();
    }

    const bx = npc.x;
    const by = npc.y - 56;

    this._dialogBubble = this.add.graphics();
    this._dialogBubble.setDepth(200);
    this._dialogBubble.fillStyle(0x1a1a2e, 0.92);
    this._dialogBubble.fillRoundedRect(bx - 120, by - 20, 240, 40, 6);
    this._dialogBubble.lineStyle(1, 0x4a4a6e);
    this._dialogBubble.strokeRoundedRect(bx - 120, by - 20, 240, 40, 6);

    this._dialogText = this.add.text(bx, by, text, {
      fontSize: '11px',
      fontFamily: 'monospace',
      color: '#ffffff',
      wordWrap: { width: 220 },
    });
    this._dialogText.setOrigin(0.5, 0.5);
    this._dialogText.setDepth(201);

    // Auto-dismiss after 3 seconds
    this.time.delayedCall(3000, () => {
      if (this._dialogBubble) {
        this._dialogBubble.destroy();
        this._dialogBubble = null;
      }
      if (this._dialogText) {
        this._dialogText.destroy();
        this._dialogText = null;
      }
    });
  }

  _onPointerDown(pointer) {
    const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);

    // Check if clicked near an NPC
    for (const npc of this.npcs) {
      const dist = Phaser.Math.Distance.Between(worldPoint.x, worldPoint.y, npc.x, npc.y);
      if (dist < 32) {
        const playerDist = Phaser.Math.Distance.Between(
          this.player.x, this.player.y, npc.x, npc.y
        );
        if (playerDist <= NPC_INTERACT_RANGE) {
          this._interactWithNPC(npc);
          return;
        }
      }
    }
  }

  // ==========================================================================
  // Minimap
  // ==========================================================================

  _createMinimap(MAP_W, MAP_H) {
    this._mmW = MAP_W;
    this._mmH = MAP_H;

    const mmSize = 150;
    this.minimapGfx = this.add.graphics();
    this.minimapGfx.setScrollFactor(0);
    this.minimapGfx.setDepth(500);

    this.minimapPlayerDot = this.add.graphics();
    this.minimapPlayerDot.setScrollFactor(0);
    this.minimapPlayerDot.setDepth(501);

    this._drawMinimap(MAP_W, MAP_H);
  }

  _drawMinimap(MAP_W, MAP_H) {
    const mmSize = 150;
    const mmX = this.cameras.main.width - mmSize - 10;
    const mmY = 10;
    const tileScale = mmSize / Math.max(MAP_W, MAP_H);

    this.minimapGfx.clear();
    this.minimapGfx.fillStyle(0x000000, 0.7);
    this.minimapGfx.fillRect(mmX - 2, mmY - 2, mmSize + 4, mmSize + 4);

    const tileColors = [0x3a7d44, 0x8b6c42, 0x888888, 0x2266bb, 0x555555, 0x225522];

    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const tileType = this.mapTiles[y][x];
        this.minimapGfx.fillStyle(tileColors[tileType], 0.9);
        this.minimapGfx.fillRect(
          mmX + x * tileScale,
          mmY + y * tileScale,
          Math.ceil(tileScale),
          Math.ceil(tileScale)
        );
      }
    }

    // Portal indicators
    for (const portal of this.portalZones) {
      const ptx = mmX + (portal.x / (MAP_W * TILE_SIZE)) * mmSize;
      const pty = mmY + (portal.y / (MAP_H * TILE_SIZE)) * mmSize;
      this.minimapGfx.fillStyle(0x4488ff, 1);
      this.minimapGfx.fillRect(ptx - 2, pty - 2, 4, 4);
    }

    this.minimapGfx.lineStyle(1, 0x4a4a6e);
    this.minimapGfx.strokeRect(mmX - 2, mmY - 2, mmSize + 4, mmSize + 4);
  }

  _updateMinimapDots() {
    const MAP_W = this._mmW;
    const MAP_H = this._mmH;
    const mmSize = 150;
    const mmX = this.cameras.main.width - mmSize - 10;
    const mmY = 10;
    const worldW = MAP_W * TILE_SIZE;
    const worldH = MAP_H * TILE_SIZE;

    this.minimapPlayerDot.clear();

    const px = mmX + (this.player.x / worldW) * mmSize;
    const py = mmY + (this.player.y / worldH) * mmSize;
    this.minimapPlayerDot.fillStyle(0xffffff, 1);
    this.minimapPlayerDot.fillRect(px - 2, py - 2, 4, 4);

    // NPC dots (yellow)
    for (const npc of this.npcs) {
      const nx = mmX + (npc.x / worldW) * mmSize;
      const ny = mmY + (npc.y / worldH) * mmSize;
      this.minimapPlayerDot.fillStyle(0xffdd44, 0.9);
      this.minimapPlayerDot.fillRect(nx - 1, ny - 1, 3, 3);
    }
  }

  // ==========================================================================
  // Update
  // ==========================================================================

  update(time, delta) {
    // Player movement
    this.player.move(this.cursors, this.wasd, delta);
    this.player.update(time, delta);

    // F key for NPC interaction
    if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
      const nearestNPC = this._findNearestNPC(NPC_INTERACT_RANGE);
      if (nearestNPC) {
        this._interactWithNPC(nearestNPC);
      }
    }

    // Check portals
    this._checkPortals();

    // HP/MP regen handled by Player.update() using HP_REGEN/MP_REGEN stats

    // Minimap
    this._updateMinimapDots();

    // Update NPC name label positions
    for (const npc of this.npcs) {
      if (npc.nameLabel) {
        npc.nameLabel.setPosition(npc.x, npc.y - 40);
      }
    }
  }
}
