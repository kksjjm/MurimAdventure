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
import { MONSTERS_BY_ID, ITEMS_BY_ID, SPAWN_CONFIG } from '../../data/defaultData.js';

const TILE_SIZE = 32;
const MAP_W = 50;
const MAP_H = 50;

export default class WorldScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WorldScene' });
  }

  create() {
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
    const spawnX = 25 * TILE_SIZE + TILE_SIZE / 2;
    const spawnY = 25 * TILE_SIZE + TILE_SIZE / 2;
    this.player = new Player(this, spawnX, spawnY);

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

    // --- Minimap ---
    this._createMinimap();

    // --- Launch UI overlay scene ---
    this.scene.launch('UIScene', { worldScene: this });

    // --- Respawn timer ---
    this.time.addEvent({
      delay: SPAWN_CONFIG.default.respawnTime || 15000,
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
    const map = [];
    for (let y = 0; y < MAP_H; y++) {
      const row = [];
      for (let x = 0; x < MAP_W; x++) {
        if (x === 0 || y === 0 || x === MAP_W - 1 || y === MAP_H - 1) {
          row.push(4);
          continue;
        }

        const val = this._simpleNoise(x, y);

        if (val < 0.08) {
          row.push(3); // water
        } else if (val < 0.15) {
          row.push(1); // dirt
        } else if (val < 0.22) {
          row.push(2); // stone
        } else if (val < 0.28 && Math.random() < 0.4) {
          row.push(5); // tree
        } else if (val > 0.85 && Math.random() < 0.3) {
          row.push(4); // wall
        } else {
          row.push(0); // grass
        }
      }
      map.push(row);
    }

    // Clear spawn area
    for (let y = 23; y <= 27; y++) {
      for (let x = 23; x <= 27; x++) {
        map[y][x] = 0;
      }
    }

    // Create paths
    for (let x = 5; x < MAP_W - 5; x++) {
      map[25][x] = 1;
    }
    for (let y = 5; y < MAP_H - 5; y++) {
      map[y][25] = 1;
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
    const config = SPAWN_CONFIG.default;

    for (let i = 0; i < config.monstersPerArea; i++) {
      const typeIdx = this._weightedRandom(config.weights);
      const monsterId = config.types[Math.min(typeIdx, config.types.length - 1)];
      const monsterData = MONSTERS_BY_ID[monsterId];
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
    const config = SPAWN_CONFIG.default;

    if (aliveCount < config.monstersPerArea) {
      const toSpawn = Math.min(2, config.monstersPerArea - aliveCount);
      for (let i = 0; i < toSpawn; i++) {
        const typeIdx = this._weightedRandom(config.weights);
        const monsterId = config.types[Math.min(typeIdx, config.types.length - 1)];
        const monsterData = MONSTERS_BY_ID[monsterId];
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
    const pickup = this.physics.add.sprite(x, y, 'item_pickup');
    pickup.setDepth(8);
    pickup.setData('itemId', itemId);

    this.tweens.add({
      targets: pickup,
      y: y - 5,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.itemPickups.add(pickup);
    return pickup;
  }

  _onItemPickup(player, pickup) {
    const itemId = pickup.getData('itemId');
    if (itemId) {
      player.addItem(itemId, 1);

      const itemData = ITEMS_BY_ID[itemId];
      const name = itemData ? (itemData.nameKo || itemData.name) : itemId;
      const text = this.add.text(pickup.x, pickup.y - 10, `획득: ${name}`, {
        fontSize: '11px',
        fontFamily: 'monospace',
        color: '#66ff66',
        stroke: '#000000',
        strokeThickness: 2,
      });
      text.setOrigin(0.5, 1).setDepth(1000);
      this.tweens.add({
        targets: text,
        y: pickup.y - 40,
        alpha: 0,
        duration: 1000,
        onComplete: () => text.destroy(),
      });
    }
    pickup.destroy();
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

    // HP/MP regen
    if (!this._regenTimer) this._regenTimer = 0;
    this._regenTimer += delta;
    if (this._regenTimer > 2000) {
      this._regenTimer = 0;
      if (this.player.stats.HP < this.player.stats.maxHP) {
        this.player.stats.HP = Math.min(this.player.stats.maxHP, this.player.stats.HP + 1);
      }
      if (this.player.stats.MP < this.player.stats.maxMP) {
        this.player.stats.MP = Math.min(this.player.stats.maxMP, this.player.stats.MP + 1);
      }
      this.events.emit('player-stats-changed');
    }

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
