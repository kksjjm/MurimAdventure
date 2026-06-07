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
import { getMapData } from '../data/mapData.js';
import { getGameData } from '../../data/GameDataLoader.js';
import { spawnItemPickup, onItemPickup } from '../systems/ItemPickupSystem.js';

const TILE_SIZE = 32;
const MAP_W = 50;
const MAP_H = 50;
const PORTAL_RANGE = 40;

export default class WorldScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WorldScene' });
  }

  init(data) {
    this.initData = data || {};
  }

  create() {
    this.mapId = 'field_01';
    this._transitioning = false;
    // --- Systems ---
    this.combatSystem = new CombatSystem(this);
    this.proficiencySystem = new ProficiencySystem(this);
    this.skillCombinationSystem = new SkillCombinationSystem(this);
    this.impactSystem = new ImpactSystem(this);

    // --- Generate tilemap ---
    this.mapData = this._generateMap();
    this._renderMap();

    // --- World bounds ---
    this.physics.world.setBounds(0, 0, MAP_W * TILE_SIZE, MAP_H * TILE_SIZE);

    // --- Player ---
    const spTileX = this.initData.spawnX || 25;
    const spTileY = this.initData.spawnY || 25;
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
    this._spawnMonsters();

    // --- Item pickups ---
    this.itemPickups = this.physics.add.group();

    // --- Collisions ---
    this.physics.add.collider(this.player, this.wallLayer);
    this.physics.add.collider(this.monsters, this.wallLayer);
    // Player <-> Monster collision (they cannot pass through each other)
    this.physics.add.collider(this.player, this.monsters);
    // Monster <-> Monster collision
    this.physics.add.collider(this.monsters, this.monsters);

    // Item pickup overlap
    this.physics.add.overlap(this.player, this.itemPickups, this._onItemPickup, null, this);

    // --- Camera ---
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setBounds(0, 0, MAP_W * TILE_SIZE, MAP_H * TILE_SIZE);

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

    // Click to interact
    this.input.on('pointerdown', this._onPointerDown, this);

    // --- Portals ---
    this.portalZones = [];
    this.portalLabels = [];
    const mapData = getMapData(this.mapId);
    if (mapData && mapData.portals) {
      this._createPortals(mapData.portals);
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
    this.time.addEvent({
      delay: getGameData().spawnConfig.default.respawnTime || 15000,
      callback: this._respawnMonsters,
      callbackScope: this,
      loop: true,
    });

    // --- Emit initial stats ---
    this.events.emit('player-stats-changed');
  }

  // ==========================================================================
  // Map Generation
  // ==========================================================================

  _generateMap() {
    const mapMeta = getMapData(this.mapId);
    if (mapMeta?.tiles && Array.isArray(mapMeta.tiles)) {
      return mapMeta.tiles.map(row => [...row]);
    }

    const map = [];
    for (let y = 0; y < MAP_H; y++) {
      const row = [];
      for (let x = 0; x < MAP_W; x++) {
        if (x === 0 || y === 0 || x === MAP_W - 1 || y === MAP_H - 1) {
          row.push(4);
          continue;
        }

        const val = this._simpleNoise(x, y);

        if (val < 0.03) {
          row.push(3); // water (rare, small puddles)
        } else if (val < 0.10) {
          row.push(1); // dirt
        } else if (val < 0.14) {
          row.push(2); // stone (walkable floor)
        } else if (val < 0.17 && Math.random() < 0.15) {
          row.push(5); // tree (sparse)
        } else if (val > 0.95 && Math.random() < 0.1) {
          row.push(4); // wall ruins (very rare)
        } else {
          row.push(0); // grass (dominant)
        }
      }
      map.push(row);
    }

    // Clear spawn area (larger open area)
    for (let y = 20; y <= 30; y++) {
      for (let x = 20; x <= 30; x++) {
        map[y][x] = 0;
      }
    }

    // Create wider paths (3 tiles wide)
    for (let x = 3; x < MAP_W - 3; x++) {
      map[24][x] = 1;
      map[25][x] = 1;
      map[26][x] = 1;
    }
    for (let y = 3; y < MAP_H - 3; y++) {
      map[y][24] = 1;
      map[y][25] = 1;
      map[y][26] = 1;
    }

    // Clear portal areas so they're accessible
    const portalMapMeta = getMapData('field_01');
    if (portalMapMeta && portalMapMeta.portals) {
      for (const portal of portalMapMeta.portals) {
        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            const py = portal.y + dy;
            const px = portal.x + dx;
            if (py >= 0 && py < MAP_H && px >= 0 && px < MAP_W) {
              map[py][px] = (dy === 0 && dx === 0) ? 1 : 0;
            }
          }
        }
      }
    }

    return map;
  }

  _simpleNoise(x, y) {
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return n - Math.floor(n);
  }

  _renderMap() {
    const tileKeys = ['tile_grass', 'tile_dirt', 'tile_stone', 'tile_water', 'tile_wall', 'tile_tree'];

    this.groundLayer = this.add.container(0, 0);
    this.groundLayer.setDepth(0);

    this.wallLayer = this.physics.add.staticGroup();

    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const tileType = this.mapData[y][x];
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
  // Monster Spawning
  // ==========================================================================

  _spawnMonsters() {
    const config = getGameData().spawnConfig.default;

    for (let i = 0; i < config.monstersPerArea; i++) {
      const typeIdx = this._weightedRandom(config.weights);
      const monsterId = config.types[Math.min(typeIdx, config.types.length - 1)];
      const monsterData = getGameData().monsters[monsterId];
      if (!monsterData) continue;

      let sx, sy, tile;
      let attempts = 0;
      do {
        sx = Math.floor(Math.random() * (MAP_W - 10)) + 5;
        sy = Math.floor(Math.random() * (MAP_H - 10)) + 5;
        tile = this.mapData[sy][sx];
        attempts++;
      } while ((tile !== 0 && tile !== 1) || (Math.abs(sx - 25) < 5 && Math.abs(sy - 25) < 5) || attempts > 50);

      if (attempts > 50) continue;

      const px = sx * TILE_SIZE + TILE_SIZE / 2;
      const py = sy * TILE_SIZE + TILE_SIZE / 2;

      const monster = new Monster(this, px, py, monsterData);
      this.monsters.add(monster);
    }
  }

  _respawnMonsters() {
    const aliveCount = this.monsters.getChildren().filter((m) => !m.isDead).length;
    const config = getGameData().spawnConfig.default;

    if (aliveCount < config.monstersPerArea) {
      const toSpawn = Math.min(2, config.monstersPerArea - aliveCount);
      for (let i = 0; i < toSpawn; i++) {
        const typeIdx = this._weightedRandom(config.weights);
        const monsterId = config.types[Math.min(typeIdx, config.types.length - 1)];
        const monsterData = getGameData().monsters[monsterId];
        if (!monsterData) continue;

        let sx, sy, tile;
        let attempts = 0;
        do {
          sx = Math.floor(Math.random() * (MAP_W - 10)) + 5;
          sy = Math.floor(Math.random() * (MAP_H - 10)) + 5;
          tile = this.mapData[sy][sx];
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
    const tileScale = mmSize / MAP_W;

    this.minimapGfx.clear();

    this.minimapGfx.fillStyle(0x000000, 0.7);
    this.minimapGfx.fillRect(mmX - 2, mmY - 2, mmSize + 4, mmSize + 4);

    const tileColors = [0x3a7d44, 0x8b6c42, 0x888888, 0x2266bb, 0x555555, 0x225522];

    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const tileType = this.mapData[y][x];
        this.minimapGfx.fillStyle(tileColors[tileType], 0.9);
        this.minimapGfx.fillRect(
          mmX + x * tileScale,
          mmY + y * tileScale,
          Math.ceil(tileScale),
          Math.ceil(tileScale)
        );
      }
    }

    this.minimapGfx.lineStyle(1, 0x4a4a6e);
    this.minimapGfx.strokeRect(mmX - 2, mmY - 2, mmSize + 4, mmSize + 4);
  }

  _updateMinimapDots() {
    if (!this.minimapVisible) return;

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

    for (const monster of this.monsters.getChildren()) {
      if (monster.isDead) continue;
      const mx = mmX + (monster.x / worldW) * mmSize;
      const my = mmY + (monster.y / worldH) * mmSize;
      this.minimapPlayerDot.fillStyle(0xff3333, 0.8);
      this.minimapPlayerDot.fillRect(mx - 1, my - 1, 2, 2);
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
  }

  // ==========================================================================
  // Portals
  // ==========================================================================

  _createPortals(portals) {
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
