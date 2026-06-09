// =============================================================================
// WorldScene.js - Main game world with tilemap, player, monsters, items
// =============================================================================

import Phaser from 'phaser';
import Player from '../entities/Player.js';
import Monster from '../entities/Monster.js';
import CombatSystem from '../systems/CombatSystem.js';
import ProficiencySystem from '../systems/ProficiencySystem.js';
import SkillCombinationSystem from '../systems/SkillCombinationSystem.js';
import ImpactSystem from '../systems/ImpactSystem.js';
import MapTransitionSystem from '../systems/MapTransitionSystem.js';
import { getGameData, normalizeMapId } from '../../data/GameDataLoader.js';
import { spawnItemPickup, onItemPickup } from '../systems/ItemPickupSystem.js';
import { BOTTOM_UI_HEIGHT } from './UIScene.js';

const TILE_SIZE = 32;
const MAP_W = 30;
const MAP_H = 17;
const PORTAL_RANGE = 40;
const PORTAL_TRIGGER_RANGE = 28;
const NPC_INTERACT_RANGE = 64;

export default class WorldScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WorldScene' });
  }

  init(data) {
    this.initData = data || {};
  }

  create() {
    this.mapId = normalizeMapId(this.initData.mapId || 'field_01');
    this._transitioning = false;
    this._mapTransitionInProgress = false;
    this._portalCooldownUntil = this.time.now + (Number(this.initData.portalCooldownMs) || 0);
    // --- Systems ---
    this.combatSystem = new CombatSystem(this);
    this.proficiencySystem = new ProficiencySystem(this);
    this.skillCombinationSystem = new SkillCombinationSystem(this);
    this.impactSystem = new ImpactSystem(this);

    // --- Load editable tilemap ---
    this.currentMap = this._resolveMapData(this.mapId);
    this.mapWidth = Math.max(1, Number(this.currentMap.width) || MAP_W);
    this.mapHeight = Math.max(1, Number(this.currentMap.height) || MAP_H);
    this.mapData = this._generateMap();
    this._renderMap();

    // --- World bounds ---
    this.physics.world.setBounds(0, 0, this.mapWidth * TILE_SIZE, this.mapHeight * TILE_SIZE);

    // --- Player ---
    const defaultSpawn = this.currentMap.spawnPoints?.player || this.currentMap.spawns?.player || { x: 25, y: 25 };
    const spTileX = Phaser.Math.Clamp(Number(this.initData.spawnX ?? defaultSpawn.x) || 1, 0, this.mapWidth - 1);
    const spTileY = Phaser.Math.Clamp(Number(this.initData.spawnY ?? defaultSpawn.y) || 1, 0, this.mapHeight - 1);
    const spawnX = spTileX * TILE_SIZE + TILE_SIZE / 2;
    const spawnY = spTileY * TILE_SIZE + TILE_SIZE / 2;
    this.player = new Player(this, spawnX, spawnY);

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

    // --- Monsters ---
    this.monsters = this.physics.add.group({ classType: Monster, runChildUpdate: false });

    // --- Item pickups ---
    this.itemPickups = this.physics.add.group();
    this._spawnMapItems();
    this._spawnMonsters();
    this._spawnNPCs();

    // --- Collisions ---
    this.physics.add.collider(this.player, this.wallLayer);
    this.physics.add.collider(this.monsters, this.wallLayer);
    // Player <-> Monster collision (they cannot pass through each other)
    this.physics.add.collider(this.player, this.monsters);
    // Monster <-> Monster collision
    this.physics.add.collider(this.monsters, this.monsters);
    if (this.npcGroup) {
      this.physics.add.collider(this.player, this.npcGroup);
    }

    // Item pickup overlap
    this.physics.add.overlap(this.player, this.itemPickups, this._onItemPickup, null, this);

    // --- Camera ---
    const cameraWidth = this.scale.width || this.cameras.main.width;
    const cameraHeight = Math.max(1, (this.scale.height || this.cameras.main.height) - BOTTOM_UI_HEIGHT);
    this.cameras.main.setViewport(0, 0, cameraWidth, cameraHeight);
    this.cameras.main.setBounds(0, 0, this.mapWidth * TILE_SIZE, this.mapHeight * TILE_SIZE);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.snapToFloor = true;

    // --- Input ---
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };

    // Spacebar for basic attack
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Skill hotkeys 1-5
    this.skillKeys = [
      this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
      this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
      this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
      this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR),
      this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FIVE),
    ];
    this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);

    // Click to interact
    this.input.on('pointerdown', this._onPointerDown, this);

    // --- Portals ---
    this.portalZones = [];
    this.portalLabels = [];
    const mapData = this.currentMap;
    const portals = this._getMapPortals();
    if (portals.length) {
      this._createPortals(portals);
    }

    // --- Minimap ---
    this._createMinimap();

    // --- Launch UI overlay scene ---
    this.scene.launch('UIScene', { worldScene: this });

    // --- Show map name if coming from another map ---
    if (this.initData.fromMap) {
      MapTransitionSystem.showMapName(this, mapData ? mapData.nameKo : '녹림 평원');
    }

    // --- Respawn timer ---
    if (this._getMonsterSpawns().length > 0) {
      this.time.addEvent({
        delay: getGameData().spawnConfig.default.respawnTime || 15000,
        callback: this._respawnMonsters,
        callbackScope: this,
        loop: true,
      });
    }

    // --- Emit initial stats ---
    this.events.emit('player-stats-changed');
  }

  // ==========================================================================
  // Map Generation
  // ==========================================================================

  _resolveMapData(mapId) {
    const normalizedMapId = normalizeMapId(mapId);
    const editableMap = this._findManagedMap(normalizedMapId);
    if (editableMap) return editableMap;

    const fallbackMap = this._findManagedMap('field_01') || (getGameData().maps || [])[0];
    if (fallbackMap) {
      const fallbackId = normalizeMapId(fallbackMap.id);
      console.warn(`[WorldScene] No admin-managed map data found for ${normalizedMapId}. Falling back to ${fallbackId}.`);
      this.mapId = fallbackId;
      return fallbackMap;
    }

    console.error(`[WorldScene] No map data available. Creating empty fallback map for ${normalizedMapId}.`);
    return {
      id: normalizedMapId || 'field_01',
      name: 'Fallback Field',
      nameKo: 'Fallback Field',
      width: MAP_W,
      height: MAP_H,
      spawnPoints: { player: { x: 1, y: 1 }, monsters: [], npcs: [], items: [], portals: [] },
    };
  }

  _findManagedMap(mapId) {
    const normalizedMapId = normalizeMapId(mapId);
    return (getGameData().maps || []).find(map => normalizeMapId(map?.id) === normalizedMapId) || null;
  }

  _editorTileToGameTile(tile) {
    const editorToGame = { 0: 0, 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 1, 8: 2, 9: 4, 10: 5, 11: 1 };
    return editorToGame[tile] ?? 0;
  }

  _buildMapFromEditorLayers(map) {
    const width = map.width || MAP_W;
    const height = map.height || MAP_H;
    const ground = map.layers?.ground || [];
    const objects = map.layers?.objects || [];
    const collision = map.layers?.collision || [];
    this.collisionData = [];

    const rows = [];
    for (let y = 0; y < height; y++) {
      const row = [];
      const collisionRow = [];
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const objectTile = objects[idx] || 0;
        const groundTile = ground[idx] || 1;
        const gameTile = this._editorTileToGameTile(objectTile || groundTile);
        row.push(gameTile);
        collisionRow.push(Boolean(collision[idx]) || gameTile === 3 || gameTile === 4 || gameTile === 5);
      }
      rows.push(row);
      this.collisionData.push(collisionRow);
    }
    return rows;
  }

  _generateMap() {
    if (this.currentMap?.layers?.ground?.length) {
      return this._buildMapFromEditorLayers(this.currentMap);
    }

    if (this.currentMap?.tiles && Array.isArray(this.currentMap.tiles)) {
      this.collisionData = this.currentMap.tiles.map(row => row.map(tile => tile === 3 || tile === 4 || tile === 5));
      return this.currentMap.tiles.map(row => [...row]);
    }

    this.collisionData = Array.from({ length: this.mapHeight }, () => new Array(this.mapWidth).fill(false));
    return Array.from({ length: this.mapHeight }, () => new Array(this.mapWidth).fill(0));
  }

  _renderMap() {
    const tileKeys = ['tile_grass', 'tile_dirt', 'tile_stone', 'tile_water', 'tile_wall', 'tile_tree'];

    this.groundLayer = this.add.container(0, 0);
    this.groundLayer.setDepth(0);

    this.wallLayer = this.physics.add.staticGroup();

    for (let y = 0; y < this.mapHeight; y++) {
      for (let x = 0; x < this.mapWidth; x++) {
        const tileType = Number.isInteger(this.mapData?.[y]?.[x]) ? this.mapData[y][x] : 0;
        const tileKey = tileKeys[tileType] || tileKeys[0];
        const px = x * TILE_SIZE + TILE_SIZE / 2;
        const py = y * TILE_SIZE + TILE_SIZE / 2;

        const sprite = this.add.image(px, py, tileKey);
        sprite.setDepth(0);

        if (this.collisionData?.[y]?.[x] || tileType === 4 || tileType === 5 || tileType === 3) {
          const wall = this.wallLayer.create(px, py, tileKey);
          wall.setVisible(false);
          wall.body.setSize(TILE_SIZE, TILE_SIZE);
          wall.refreshBody();
        }
      }
    }
  }

  // ==========================================================================
  // Monster Spawning
  // ==========================================================================

  _getMonsterSpawns() {
    return this.currentMap?.spawnPoints?.monsters || this.currentMap?.spawns?.monsters || [];
  }

  _spawnMonsterAt(spawn) {
    const monsterId = spawn.monsterId || spawn.id || spawn.type;
    const monsterData = getGameData().monsters[monsterId];
    if (!monsterData) return;

    const px = spawn.x * TILE_SIZE + TILE_SIZE / 2;
    const py = spawn.y * TILE_SIZE + TILE_SIZE / 2;
    const monster = new Monster(this, px, py, monsterData);
    monster.spawnTileX = spawn.x;
    monster.spawnTileY = spawn.y;
    monster.spawnMonsterId = monsterId;
    this.monsters.add(monster);
  }

  _spawnMonsters() {
    for (const spawn of this._getMonsterSpawns()) {
      this._spawnMonsterAt(spawn);
    }
  }

  _respawnMonsters() {
    for (const spawn of this._getMonsterSpawns()) {
      const hasAliveAtSpawn = this.monsters.getChildren().some(monster => (
        !monster.isDead
        && monster.spawnTileX === spawn.x
        && monster.spawnTileY === spawn.y
        && monster.spawnMonsterId === (spawn.monsterId || spawn.id || spawn.type)
      ));
      if (!hasAliveAtSpawn) {
        this._spawnMonsterAt(spawn);
      }
    }
  }

  // ==========================================================================
  // Item Pickups
  // ==========================================================================

  _spawnMapItems() {
    const itemSpawns = this.currentMap?.spawnPoints?.items || [];
    for (const spawn of itemSpawns) {
      if (spawn.targetMap) continue;
      const itemId = spawn.itemId || spawn.id;
      if (!itemId) continue;
      const px = spawn.x * TILE_SIZE + TILE_SIZE / 2;
      const py = spawn.y * TILE_SIZE + TILE_SIZE / 2;
      this.spawnItemPickup(itemId, px, py);
    }
  }

  // ==========================================================================
  // NPCs
  // ==========================================================================

  _getNPCSpawns() {
    return this.currentMap?.spawnPoints?.npcs || [];
  }

  _getNPCDefinition(npcId) {
    return getGameData().npcs?.[npcId] || null;
  }

  _spawnNPCs() {
    this.npcs = [];
    this.npcGroup = this.physics.add.staticGroup();

    for (const spawn of this._getNPCSpawns()) {
      const npcId = spawn.npcId || spawn.id;
      const npcData = this._getNPCDefinition(npcId);
      if (!npcData) continue;

      const px = spawn.x * TILE_SIZE + TILE_SIZE / 2;
      const py = spawn.y * TILE_SIZE + TILE_SIZE / 2;
      const textureKey = npcData.spriteKey || npcData.texture || 'player_base';
      const usableTexture = this.textures.exists(textureKey) ? textureKey : 'player_base';
      const npc = this.physics.add.sprite(px, py, usableTexture);
      npc.setDepth(9);
      npc.setImmovable(true);
      npc.body.setSize(32, 32);
      npc.body.setOffset(0, 16);
      npc.npcId = npcId;
      npc.npcData = npcData;

      const nameLabel = this.add.text(px, py - 40, npcData.nameKo || npcData.name || npcId, {
        fontSize: '10px',
        fontFamily: 'monospace',
        color: '#ffdd88',
        stroke: '#000000',
        strokeThickness: 2,
      });
      nameLabel.setOrigin(0.5, 1);
      nameLabel.setDepth(100);
      npc.nameLabel = nameLabel;

      this.npcGroup.add(npc);
      this.npcs.push(npc);
    }
  }

  _findNearestNPC(maxRange) {
    let closest = null;
    let closestDist = maxRange;
    for (const npc of this.npcs || []) {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.x, npc.y);
      if (dist < closestDist) {
        closest = npc;
        closestDist = dist;
      }
    }
    return closest;
  }

  _getNPCDialogueLines(npcData) {
    const dialogues = npcData.dialogues || {};
    if (Array.isArray(dialogues)) return dialogues;
    if (npcData.shopType && dialogues.shop) return dialogues.shop;
    return dialogues.default || [npcData.description || npcData.nameKo || npcData.name || npcData.id];
  }

  _interactWithNPC(npc) {
    if (!npc?.npcData) return;
    const npcData = npc.npcData;
    const lines = this._getNPCDialogueLines(npcData);
    const shop = npcData.shopType ? getGameData().shops?.[npcData.shopType] : null;
    const shopLine = shop?.items?.length
      ? `${shop.nameKo || shop.id}: ${shop.items.map(entry => getGameData().items?.[entry.itemId]?.nameKo || entry.itemId).join(', ')}`
      : null;
    const text = [lines[0], shopLine].filter(Boolean).join('\n');

    if (this._dialogBubble) this._dialogBubble.destroy();
    if (this._dialogText) this._dialogText.destroy();

    const bx = npc.x;
    const by = npc.y - 58;
    const bubbleW = 280;
    const bubbleH = shopLine ? 68 : 48;

    this._dialogBubble = this.add.graphics();
    this._dialogBubble.setDepth(200);
    this._dialogBubble.fillStyle(0x1a1a2e, 0.92);
    this._dialogBubble.fillRoundedRect(bx - bubbleW / 2, by - bubbleH / 2, bubbleW, bubbleH, 6);
    this._dialogBubble.lineStyle(1, 0x4a4a6e);
    this._dialogBubble.strokeRoundedRect(bx - bubbleW / 2, by - bubbleH / 2, bubbleW, bubbleH, 6);

    this._dialogText = this.add.text(bx, by, text, {
      fontSize: '11px',
      fontFamily: 'monospace',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: bubbleW - 24 },
    });
    this._dialogText.setOrigin(0.5, 0.5);
    this._dialogText.setDepth(201);

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

  spawnItemPickup(itemId, x, y) {
    return spawnItemPickup(this, this.itemPickups, itemId, x, y);
  }

  _onItemPickup(player, pickup) {
    onItemPickup(this, player, pickup);
  }

  // ==========================================================================
  // Pointer Interaction
  // ==========================================================================

  _onPointerDown(pointer) {
    const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);

    for (const npc of this.npcs || []) {
      const dist = Phaser.Math.Distance.Between(worldPoint.x, worldPoint.y, npc.x, npc.y);
      if (dist < 32 && Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.x, npc.y) <= NPC_INTERACT_RANGE) {
        this._interactWithNPC(npc);
        return;
      }
    }

    let closestMonster = null;
    let closestDist = Infinity;

    for (const monster of this.monsters.getChildren()) {
      if (monster.isDead) continue;
      const dist = Phaser.Math.Distance.Between(worldPoint.x, worldPoint.y, monster.x, monster.y);
      if (dist < 32 && dist < closestDist) {
        closestMonster = monster;
        closestDist = dist;
      }
    }

    if (closestMonster) {
      const playerDist = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        closestMonster.x, closestMonster.y
      );

      if (playerDist <= 60) {
        const result = this.player.attack(closestMonster);
        if (result && result.hit) {
          closestMonster.provoke();
        }
        this.events.emit('player-stats-changed');
      }
    }
  }

  // ==========================================================================
  // Minimap
  // ==========================================================================

  _createMinimap() {
    const mmSize = 150;

    this.minimapGfx = this.add.graphics();
    this.minimapGfx.setScrollFactor(0);
    this.minimapGfx.setDepth(500);

    this.minimapPlayerDot = this.add.graphics();
    this.minimapPlayerDot.setScrollFactor(0);
    this.minimapPlayerDot.setDepth(501);

    this.minimapVisible = true;
    this._drawMinimap();
  }

  _drawMinimap() {
    if (!this.minimapVisible) {
      this.minimapGfx.setVisible(false);
      this.minimapPlayerDot.setVisible(false);
      return;
    }

    this.minimapGfx.setVisible(true);
    this.minimapPlayerDot.setVisible(true);

    const mmSize = 150;
    const mmX = this.cameras.main.width - mmSize - 10;
    const mmY = 10;
    const tileScaleX = mmSize / this.mapWidth;
    const tileScaleY = mmSize / this.mapHeight;

    this.minimapGfx.clear();

    this.minimapGfx.fillStyle(0x000000, 0.88);
    this.minimapGfx.fillRect(mmX - 2, mmY - 2, mmSize + 4, mmSize + 4);

    const tileColors = [0x3a7d44, 0x8b6c42, 0x888888, 0x2266bb, 0x555555, 0x225522];

    for (let y = 0; y < this.mapHeight; y++) {
      for (let x = 0; x < this.mapWidth; x++) {
        const tileType = this.mapData[y][x];
        this.minimapGfx.fillStyle(tileColors[tileType], 0.96);
        this.minimapGfx.fillRect(
          mmX + x * tileScaleX,
          mmY + y * tileScaleY,
          Math.ceil(tileScaleX),
          Math.ceil(tileScaleY)
        );
      }
    }

    this.minimapGfx.lineStyle(1, 0xa9b5d6, 0.95);
    this.minimapGfx.strokeRect(mmX - 2, mmY - 2, mmSize + 4, mmSize + 4);
  }

  _updateMinimapDots() {
    if (!this.minimapVisible) return;

    const mmSize = 150;
    const mmX = this.cameras.main.width - mmSize - 10;
    const mmY = 10;
    const worldW = this.mapWidth * TILE_SIZE;
    const worldH = this.mapHeight * TILE_SIZE;

    this.minimapPlayerDot.clear();

    const px = mmX + (this.player.x / worldW) * mmSize;
    const py = mmY + (this.player.y / worldH) * mmSize;
    this.minimapPlayerDot.fillStyle(0xffffff, 1);
    this.minimapPlayerDot.fillRect(px - 2, py - 2, 4, 4);

    for (const monster of this.monsters.getChildren()) {
      if (monster.isDead) continue;
      const mx = mmX + (monster.x / worldW) * mmSize;
      const my = mmY + (monster.y / worldH) * mmSize;
      this.minimapPlayerDot.fillStyle(0xff3333, 0.8);
      this.minimapPlayerDot.fillRect(mx - 1, my - 1, 2, 2);
    }

    for (const npc of this.npcs || []) {
      const nx = mmX + (npc.x / worldW) * mmSize;
      const ny = mmY + (npc.y / worldH) * mmSize;
      this.minimapPlayerDot.fillStyle(0xffdd44, 0.9);
      this.minimapPlayerDot.fillRect(nx - 1, ny - 1, 3, 3);
    }
  }

  toggleMinimap() {
    this.minimapVisible = !this.minimapVisible;
    this._drawMinimap();
  }

  // ==========================================================================
  // Update
  // ==========================================================================

  update(time, delta) {
    // Player movement (4-directional only)
    this.player.move(this.cursors, this.wasd, delta);
    this.player.update(time, delta);

    // Spacebar basic attack
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.player.performBasicAttack();
      this.events.emit('player-stats-changed');
    }

    if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
      const nearestNPC = this._findNearestNPC(NPC_INTERACT_RANGE);
      if (nearestNPC) this._interactWithNPC(nearestNPC);
    }

    // Skill hotkeys
    for (let i = 0; i < 5; i++) {
      if (Phaser.Input.Keyboard.JustDown(this.skillKeys[i])) {
        const skillId = this.player.skillSlots[i];
        if (skillId) {
          const target = this._findNearestMonster(200);
          this.player.useSkill(skillId, target);
          this.events.emit('player-stats-changed');
        }
      }
    }

    // Monster AI
    for (const monster of this.monsters.getChildren()) {
      if (!monster.isDead) {
        monster.updateAI(this.player, time, delta);
      }
    }

    // Check portals
    this._checkPortals();

    // HP/MP regen is handled by Player.update() using HP_REGEN/MP_REGEN stats

    // Minimap
    this._updateMinimapDots();

    for (const npc of this.npcs || []) {
      if (npc.nameLabel) npc.nameLabel.setPosition(npc.x, npc.y - 40);
    }
  }

  // ==========================================================================
  // Portals
  // ==========================================================================

  _getMapPortals() {
    const explicitPortals = [
      ...(Array.isArray(this.currentMap?.spawnPoints?.portals) ? this.currentMap.spawnPoints.portals : []),
      ...(Array.isArray(this.currentMap?.portals) ? this.currentMap.portals : []),
    ];
    const itemPortals = (this.currentMap?.spawnPoints?.items || []).filter(spawn => spawn.targetMap);
    const seen = new Set();
    return [...explicitPortals, ...itemPortals]
      .filter(portal => portal && portal.targetMap && Number.isFinite(Number(portal.x)) && Number.isFinite(Number(portal.y)))
      .map(portal => ({
        ...portal,
        x: Number(portal.x),
        y: Number(portal.y),
        targetMap: normalizeMapId(portal.targetMap),
        targetX: Number.isFinite(Number(portal.targetX)) ? Number(portal.targetX) : null,
        targetY: Number.isFinite(Number(portal.targetY)) ? Number(portal.targetY) : null,
      }))
      .filter(portal => {
        const key = `${portal.x}:${portal.y}:${portal.targetMap}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }

  _createPortals(portals) {
    for (const portal of portals) {
      const targetMapData = this._findManagedMap(portal.targetMap);
      if (!targetMapData) {
        console.warn(`[WorldScene] Portal target map not found: ${portal.targetMap}`, portal);
        continue;
      }
      const px = portal.x * TILE_SIZE + TILE_SIZE / 2;
      const py = portal.y * TILE_SIZE + TILE_SIZE / 2;

      const portalSprite = this.add.image(px, py, 'portal');
      portalSprite.setDepth(5);
      portalSprite.setAlpha(0.7);

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

      const labelText = portal.label || targetMapData.nameKo || targetMapData.name || portal.targetMap;
      const label = this.add.text(px, py - 24, labelText, {
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
        tileX: portal.x,
        tileY: portal.y,
        targetMap: portal.targetMap,
        targetX: portal.targetX ?? targetMapData.spawnPoints?.player?.x ?? targetMapData.spawns?.player?.x ?? 1,
        targetY: portal.targetY ?? targetMapData.spawnPoints?.player?.y ?? targetMapData.spawns?.player?.y ?? 1,
        label,
        sprite: portalSprite,
        triggerRange: Number(portal.triggerRange) || PORTAL_TRIGGER_RANGE,
      });
      this.portalLabels.push(label);
    }
  }

  _checkPortals() {
    if (this._transitioning) return;
    if (this.time.now < this._portalCooldownUntil) {
      for (const portal of this.portalZones) {
        if (portal.label) portal.label.setVisible(false);
      }
      return;
    }

    for (const portal of this.portalZones) {
      const dist = Phaser.Math.Distance.Between(
        this.player.x, this.player.y, portal.x, portal.y
      );
      const playerTileX = Math.floor(this.player.x / TILE_SIZE);
      const playerTileY = Math.floor(this.player.y / TILE_SIZE);
      const onPortalTile = playerTileX === portal.tileX && playerTileY === portal.tileY;

      if (dist < PORTAL_RANGE) {
        portal.label.setVisible(true);
        if (onPortalTile || dist <= portal.triggerRange) {
          MapTransitionSystem.transition(this, portal.targetMap, portal.targetX, portal.targetY);
          return;
        }
      } else {
        portal.label.setVisible(false);
      }
    }
  }

  _findNearestMonster(maxRange) {
    let closest = null;
    let closestDist = maxRange;

    for (const monster of this.monsters.getChildren()) {
      if (monster.isDead) continue;
      const dist = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        monster.x, monster.y
      );
      if (dist < closestDist) {
        closest = monster;
        closestDist = dist;
      }
    }

    return closest;
  }
}
