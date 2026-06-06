// =============================================================================
// Monster.js - Monster Entity Class (64x64 HD)
// =============================================================================

import Phaser from 'phaser';
import { ITEMS_BY_ID } from '../../data/defaultData.js';

export default class Monster extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, monsterData) {
    const spriteMap = {
      mon_wild_boar: 'monster_boar',
      mon_mountain_bandit: 'monster_bandit',
      mon_poison_snake: 'monster_snake',
      mon_dark_swordsman: 'monster_bandit',
      mon_mountain_spirit: 'monster_wolf',
      mon_blood_demon_king: 'monster_bandit',
    };
    const spriteKey = spriteMap[monsterData.spriteKey] || spriteMap[monsterData.id] || 'monster_boar';
    super(scene, x, y, spriteKey);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(9);
    // 64x64 sprite with tighter collision body
    this.body.setSize(36, 40);
    this.body.setOffset(14, 20);

    // Prevent monsters from being pushed out of bounds
    this.setCollideWorldBounds(true);

    // Give monsters some mass so they don't slide when pushed
    this.body.setImmovable(false);
    this.body.setBounce(0.1);

    // Copy monster data
    this.monsterData = monsterData;
    this.monsterId = monsterData.id;
    this.monsterName = monsterData.nameKo || monsterData.name;
    this.monsterLevel = monsterData.level || 1;

    const stats = { ...monsterData.stats };
    if (!stats.maxHP) stats.maxHP = stats.HP;
    this.stats = stats;

    // AI config
    this.aiType = monsterData.aiBehavior || monsterData.ai || 'PASSIVE';
    this.chaseRange = monsterData.chaseRange || 150;
    this.attackRange = monsterData.attackRange || 40;
    this.attackSpeed = monsterData.attackSpeed || 1200;
    this.moveSpeed = monsterData.stats.AGI ? monsterData.stats.AGI * 5 : 80;

    // Drops
    this.drops = monsterData.drops || [];
    this.expReward = monsterData.expReward || monsterData.exp || 10;
    this.goldReward = monsterData.goldReward || monsterData.gold || { min: 1, max: 5 };

    // AI state
    this.aiState = 'idle';
    this.lastAttackTime = 0;
    this.wanderTarget = null;
    this.wanderTimer = 0;
    this.idleTimer = 0;
    this.spawnX = x;
    this.spawnY = y;
    this.isDead = false;

    if (monsterData.tint) {
      this.setTint(monsterData.tint);
    }

    // Health bar and name
    this.healthBar = this._createHealthBar();
    this.nameText = this._createNameText();
  }

  _createHealthBar() {
    const bar = this.scene.add.graphics();
    bar.setDepth(100);
    return bar;
  }

  _createNameText() {
    const text = this.scene.add.text(this.x, this.y - 36, `${this.monsterName} Lv.${this.monsterLevel}`, {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    });
    text.setOrigin(0.5, 1);
    text.setDepth(100);
    return text;
  }

  _drawHealthBar() {
    if (!this.healthBar || this.isDead) return;

    this.healthBar.clear();

    const barWidth = 40;
    const barHeight = 5;
    const x = this.x - barWidth / 2;
    const y = this.y - 30;

    // Background
    this.healthBar.fillStyle(0x440000, 0.8);
    this.healthBar.fillRect(x, y, barWidth, barHeight);

    // Health fill
    const healthPct = Math.max(0, this.stats.HP / this.stats.maxHP);
    const fillColor = healthPct > 0.5 ? 0x33cc33 : healthPct > 0.25 ? 0xcccc33 : 0xcc3333;
    this.healthBar.fillStyle(fillColor, 0.9);
    this.healthBar.fillRect(x, y, barWidth * healthPct, barHeight);

    // Border
    this.healthBar.lineStyle(1, 0x888888, 0.5);
    this.healthBar.strokeRect(x, y, barWidth, barHeight);

    if (this.nameText) {
      this.nameText.setPosition(this.x, this.y - 34);
    }
  }

  // ==========================================================================
  // AI Update
  // ==========================================================================

  updateAI(player, time, delta) {
    if (this.isDead) return;

    const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);

    switch (this.aiState) {
      case 'idle':
        this._handleIdle(player, dist, time, delta);
        break;
      case 'wander':
        this._handleWander(player, dist, time, delta);
        break;
      case 'chase':
        this._handleChase(player, dist, time, delta);
        break;
      case 'attack':
        this._handleAttack(player, dist, time, delta);
        break;
    }

    this._drawHealthBar();
  }

  _handleIdle(player, dist, time, delta) {
    this.setVelocity(0, 0);
    this.idleTimer += delta;

    if (this._shouldChase(dist)) {
      this.aiState = 'chase';
      return;
    }

    if (this.idleTimer > 2000 + Math.random() * 3000) {
      this.idleTimer = 0;
      this.aiState = 'wander';
      this.wanderTarget = {
        x: this.spawnX + (Math.random() - 0.5) * 100,
        y: this.spawnY + (Math.random() - 0.5) * 100,
      };
    }
  }

  _handleWander(player, dist, time, delta) {
    if (this._shouldChase(dist)) {
      this.aiState = 'chase';
      return;
    }

    if (!this.wanderTarget) {
      this.aiState = 'idle';
      return;
    }

    const wDist = Phaser.Math.Distance.Between(this.x, this.y, this.wanderTarget.x, this.wanderTarget.y);
    if (wDist < 5) {
      this.setVelocity(0, 0);
      this.aiState = 'idle';
      this.wanderTarget = null;
      return;
    }

    // 4-directional movement for monsters too
    const dx = this.wanderTarget.x - this.x;
    const dy = this.wanderTarget.y - this.y;
    const speed = this.moveSpeed * 0.5;

    if (Math.abs(dx) > Math.abs(dy)) {
      this.setVelocity(dx > 0 ? speed : -speed, 0);
      this.setFlipX(dx < 0);
    } else {
      this.setVelocity(0, dy > 0 ? speed : -speed);
    }
  }

  _handleChase(player, dist, time, delta) {
    const spawnDist = Phaser.Math.Distance.Between(this.x, this.y, this.spawnX, this.spawnY);
    if (spawnDist > this.chaseRange * 2.5 || dist > this.chaseRange * 2) {
      this.wanderTarget = { x: this.spawnX, y: this.spawnY };
      this.aiState = 'wander';
      return;
    }

    if (dist <= this.attackRange) {
      this.aiState = 'attack';
      this.setVelocity(0, 0);
      return;
    }

    // 4-directional chase
    const dx = player.x - this.x;
    const dy = player.y - this.y;

    if (Math.abs(dx) > Math.abs(dy)) {
      this.setVelocity(dx > 0 ? this.moveSpeed : -this.moveSpeed, 0);
      this.setFlipX(dx < 0);
    } else {
      this.setVelocity(0, dy > 0 ? this.moveSpeed : -this.moveSpeed);
    }
  }

  _handleAttack(player, dist, time, delta) {
    this.setVelocity(0, 0);

    if (dist > this.attackRange * 1.5) {
      this.aiState = 'chase';
      return;
    }

    const now = Date.now();
    if (now - this.lastAttackTime >= this.attackSpeed) {
      this.lastAttackTime = now;

      // Face the player
      if (player.x < this.x) this.setFlipX(true);
      else this.setFlipX(false);

      const result = this.scene.combatSystem.performAttack(this, player);

      if (result && result.hit) {
        // Play monster attack impact effect
        if (this.scene.impactSystem) {
          this.scene.impactSystem.playMonsterAttack(this, player);
        }

        // Attack lunge animation
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0) {
          const lunge = 6;
          this.scene.tweens.add({
            targets: this,
            x: this.x + (dx / dist) * lunge,
            y: this.y + (dy / dist) * lunge,
            duration: 60,
            yoyo: true,
          });
        }
      }

      this.scene.events.emit('player-stats-changed');
    }
  }

  _shouldChase(dist) {
    if (this.aiType === 'AGGRESSIVE' && dist < this.chaseRange) return true;
    if (this.aiType === 'TERRITORIAL' && dist < this.chaseRange * 0.6) return true;
    if (this.aiType === 'PATROL' && dist < this.chaseRange * 0.8) return true;
    return false;
  }

  provoke() {
    if (this.aiType === 'PASSIVE' && this.aiState !== 'chase' && this.aiState !== 'attack') {
      this.aiState = 'chase';
    }
  }

  // ==========================================================================
  // Death
  // ==========================================================================

  die() {
    if (this.isDead) return;
    this.isDead = true;

    this.setVelocity(0, 0);
    this.body.enable = false;

    this._dropLoot();

    const player = this.scene.player;
    if (player) {
      player.gainExp(this.expReward);
      const goldAmount =
        Math.floor(Math.random() * (this.goldReward.max - this.goldReward.min + 1)) +
        this.goldReward.min;
      player.stats.gold += goldAmount;

      const goldText = this.scene.add.text(this.x, this.y - 10, `+${goldAmount}G`, {
        fontSize: '11px',
        fontFamily: 'monospace',
        color: '#ffcc00',
        stroke: '#000000',
        strokeThickness: 2,
      });
      goldText.setOrigin(0.5, 1).setDepth(1000);
      this.scene.tweens.add({
        targets: goldText,
        y: this.y - 50,
        alpha: 0,
        duration: 1200,
        onComplete: () => goldText.destroy(),
      });

      this.scene.events.emit('player-stats-changed');
    }

    // Death animation
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 500,
      onComplete: () => {
        if (this.healthBar) this.healthBar.destroy();
        if (this.nameText) this.nameText.destroy();
        this.destroy();
      },
    });
  }

  _dropLoot() {
    for (const drop of this.drops) {
      if (Math.random() < drop.chance) {
        const offsetX = (Math.random() - 0.5) * 30;
        const offsetY = (Math.random() - 0.5) * 30;
        this.scene.spawnItemPickup(drop.itemId, this.x + offsetX, this.y + offsetY);
      }
    }
  }

  // ==========================================================================
  // Cleanup
  // ==========================================================================

  destroy(fromScene) {
    if (this.healthBar) {
      this.healthBar.destroy();
      this.healthBar = null;
    }
    if (this.nameText) {
      this.nameText.destroy();
      this.nameText = null;
    }
    super.destroy(fromScene);
  }
}
