// =============================================================================
// DarkForestScene.js - Dark forest map with harder monsters
// =============================================================================

import Phaser from 'phaser';
import Player from '../entities/Player.js';
import Monster from '../entities/Monster.js';
import CombatSystem from '../systems/CombatSystem.js';
import ProficiencySystem from '../systems/ProficiencySystem.js';
import SkillCombinationSystem from '../systems/SkillCombinationSystem.js';
import ImpactSystem from '../systems/ImpactSystem.js';
import MapTransitionSystem from '../systems/MapTransitionSystem.js';
import { getMapData } from '../data/mapData.js';
import { getGameData } from '../../data/GameDataLoader.js';
import { spawnItemPickup, onItemPickup } from '../systems/ItemPickupSystem.js';

const TILE_SIZE = 32;
const PORTAL_RANGE = 40;

export default class DarkForestScene extends Phaser.Scene {
  constructor() {
    super({ key: 'DarkForestScene' });
  }

  init(data) {
    this.initData = data || {};
  }

  create() {
    this.mapId = 'dark_forest';
    this._transitioning = false;

    const mapData = getMapData(this.mapId);
    if (!mapData) {
      console.error('[DarkForestScene] No map data for dark_forest');
      return;
    }

    this.mapConfig = mapData;
    this.mapTiles = mapData.tiles;
    const MAP_W = mapData.width;
    const MAP_H = mapData.height;

    // --- Systems ---
    this.combatSystem = new CombatSystem(this);
    this.proficiencySystem = new ProficiencySystem(this);
    this.skillCombinationSystem = new SkillCombinationSystem(this);
    this.impactSystem = new ImpactSystem(this);

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

    // Restore player data
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
    this._spawnMonsters(mapData.monsterConfig);

    // --- Item pickups ---
    this.itemPickups = this.physics.add.group();

    // --- Collisions ---
    this.physics.add.collider(this.player, this.wallLayer);
    this.physics.add.collider(this.monsters, this.wallLayer);
    this.physics.add.collider(this.player, this.monsters);
    this.physics.add.collider(this.monsters, this.monsters);
    this.physics.add.overlap(this.player, this.itemPickups, this._onItemPickup, null, this);

    // --- Camera ---
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setBounds(0, 0, MAP_W * TILE_SIZE, MAP_H * TILE_SIZE);

    // Darker tint for the forest atmosphere
    this.cameras.main.setBackgroundColor('#050510');
    // Apply dark tint overlay
    this._darkOverlay = this.add.graphics();
    this._darkOverlay.setScrollFactor(0);
    this._darkOverlay.setDepth(400);
    this._darkOverlay.fillStyle(0x000022, 0.25);
    this._darkOverlay.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);

    // --- Portals ---
    this.portalZones = [];
    this.portalLabels = [];
    this._createPortals(mapData.portals);

    // --- Input ---
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.skillKeys = [
      this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
      this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
      this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
      this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR),
      this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FIVE),
    ];

    this.input.on('pointerdown', this._onPointerDown, this);

    // --- Minimap ---
    this._createMinimap(MAP_W, MAP_H);

    // --- Launch UI overlay ---
    this.scene.launch('UIScene', { worldScene: this });

    // --- Respawn timer (faster in dark forest) ---
    this.time.addEvent({
      delay: 12000,
      callback: () => this._respawnMonsters(mapData.monsterConfig),
      callbackScope: this,
      loop: true,
    });

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

        // Darken tree tiles slightly for atmosphere
        if (tileType === 5) {
          sprite.setTint(0x88aa88);
        }

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
  // Monster Spawning
  // ==========================================================================

  _spawnMonsters(config) {
    if (!config) return;

    const MAP_W = this.mapConfig.width;
    const MAP_H = this.mapConfig.height;

    for (let i = 0; i < config.count; i++) {
      const typeIdx = this._weightedRandom(config.weights);
      const monsterId = config.types[Math.min(typeIdx, config.types.length - 1)];
      const monsterData = getGameData().monsters[monsterId];
      if (!monsterData) continue;

      let sx, sy, tile;
      let attempts = 0;
      do {
        sx = Math.floor(Math.random() * (MAP_W - 6)) + 3;
        sy = Math.floor(Math.random() * (MAP_H - 6)) + 3;
        tile = this.mapTiles[sy][sx];
        attempts++;
      } while ((tile !== 0 && tile !== 1) || attempts > 50);

      if (attempts > 50) continue;

      const px = sx * TILE_SIZE + TILE_SIZE / 2;
      const py = sy * TILE_SIZE + TILE_SIZE / 2;

      const monster = new Monster(this, px, py, monsterData);
      this.monsters.add(monster);
    }
  }

  _respawnMonsters(config) {
    if (!config) return;

    const aliveCount = this.monsters.getChildren().filter(m => !m.isDead).length;
    if (aliveCount < config.count) {
      const toSpawn = Math.min(3, config.count - aliveCount);
      const MAP_W = this.mapConfig.width;
      const MAP_H = this.mapConfig.height;

      for (let i = 0; i < toSpawn; i++) {
        const typeIdx = this._weightedRandom(config.weights);
        const monsterId = config.types[Math.min(typeIdx, config.types.length - 1)];
        const monsterData = getGameData().monsters[monsterId];
        if (!monsterData) continue;

        let sx, sy, tile;
        let attempts = 0;
        do {
          sx = Math.floor(Math.random() * (MAP_W - 6)) + 3;
          sy = Math.floor(Math.random() * (MAP_H - 6)) + 3;
          tile = this.mapTiles[sy][sx];
          attempts++;
        } while ((tile !== 0 && tile !== 1) || attempts > 30);

        if (attempts > 30) continue;

        const px = sx * TILE_SIZE + TILE_SIZE / 2;
        const py = sy * TILE_SIZE + TILE_SIZE / 2;
        const monster = new Monster(this, px, py, monsterData);
        this.monsters.add(monster);
      }
    }
  }

  _weightedRandom(weights) {
    const total = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    for (let i = 0; i < weights.length; i++) {
      r -= weights[i];
      if (r <= 0) return i;
    }
    return weights.length - 1;
  }

  // ==========================================================================
  // Item Pickups
  // ==========================================================================

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

  _createMinimap(MAP_W, MAP_H) {
    this._mmW = MAP_W;
    this._mmH = MAP_H;

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

    const tileColors = [0x2a5d34, 0x6b4c22, 0x666666, 0x1144aa, 0x444444, 0x1a3a1a];

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

    // Monster dots (red)
    for (const monster of this.monsters.getChildren()) {
      if (monster.isDead) continue;
      const mx = mmX + (monster.x / worldW) * mmSize;
      const my = mmY + (monster.y / worldH) * mmSize;
      this.minimapPlayerDot.fillStyle(0xff3333, 0.8);
      this.minimapPlayerDot.fillRect(mx - 1, my - 1, 2, 2);
    }
  }

  // ==========================================================================
  // Update
  // ==========================================================================

  update(time, delta) {
    // Player movement
    this.player.move(this.cursors, this.wasd, delta);
    this.player.update(time, delta);

    // Spacebar basic attack
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.player.performBasicAttack();
      this.events.emit('player-stats-changed');
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

    // HP/MP regen handled by Player.update() using HP_REGEN/MP_REGEN stats

    // Minimap
    this._updateMinimapDots();
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
