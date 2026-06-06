// =============================================================================
// Player.js - Player Entity Class (64x64 HD with equipment layers)
// =============================================================================

import Phaser from 'phaser';
import {
  DEFAULT_PLAYER_STATS, LEVEL_UP_GAINS, getExpForLevel,
  ITEMS_BY_ID, SKILLS_BY_ID, DEFAULT_INVENTORY,
  DEFAULT_STARTING_SKILLS, DEFAULT_SKILL_SLOTS,
} from '../../data/defaultData.js';
import { EQUIPMENT_SLOTS } from '../../data/constants.js';

// Map weapon types to equipment layer texture keys
const WEAPON_SPRITE_MAP = {
  ONE_HANDED: 'equip_weapon_sword',
  TWO_HANDED: 'equip_weapon_spear',
  DUAL_WIELD: 'equip_weapon_dual',
};

// Map rarity to overlay tint
const RARITY_TINT = {
  COMMON: null,
  UNCOMMON: 0x88ff88,
  RARE: 0x4488ff,
  EPIC: 0xaa44ff,
  LEGENDARY: 0xffaa00,
  MYTHIC: 0xff4444,
};

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player_base');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.setDepth(10);
    this.body.setSize(32, 40);
    this.body.setOffset(16, 20);

    // --- Core Stats ---
    this.stats = { ...DEFAULT_PLAYER_STATS };

    // --- Equipment: slot -> item data or null ---
    this.equipment = {};
    for (const slotKey of Object.keys(EQUIPMENT_SLOTS)) {
      this.equipment[slotKey] = null;
    }

    // --- Equipment visual layers ---
    this.equipLayers = {};

    // --- Inventory: array of { itemId, quantity } ---
    this.inventory = DEFAULT_INVENTORY.map((e) => ({ ...e }));

    // --- Skills: array of skill IDs ---
    this.skills = [...DEFAULT_STARTING_SKILLS];

    // --- Skill slots (hotbar 1-5) ---
    this.skillSlots = [...DEFAULT_SKILL_SLOTS];

    // --- Skill cooldowns: { skillId: lastUsedTimestamp } ---
    this.skillCooldowns = {};

    // --- Movement ---
    this.moveSpeed = this.stats.MOVE_SPEED || 160;
    this.facing = 'down';

    // --- Combat ---
    this.lastAttackTime = 0;
    this.attackCooldown = 600;
    this.proficiencyBonus = 1.0;
    this.isAttacking = false;
    this.attackAnimTimer = null;

    // --- Buffs: array of { stat, amount, duration, startTime } ---
    this.buffs = [];

    // Equip starting gear
    this._equipStartingGear();
  }

  _equipStartingGear() {
    for (const inv of this.inventory) {
      const item = ITEMS_BY_ID[inv.itemId];
      if (item && item.slot) {
        if (!this.equipment[item.slot]) {
          this.equip(item, item.slot);
        }
      }
    }
  }

  // ==========================================================================
  // Equipment Visual Layer System
  // ==========================================================================

  _updateEquipmentVisuals() {
    // Clear existing layers
    for (const key of Object.keys(this.equipLayers)) {
      if (this.equipLayers[key]) {
        this.equipLayers[key].destroy();
      }
    }
    this.equipLayers = {};

    // Layer order (back to front)
    const layerOrder = [
      { slot: 'TALISMAN', textures: ['equip_talisman'] },
      { slot: 'SHOES', textures: ['equip_shoes_basic'] },
      { slot: 'ARMOR', textures: ['equip_armor_leather', 'equip_armor_iron'] },
      { slot: 'BELT', textures: ['equip_belt_fancy'] },
      { slot: 'GLOVES', textures: ['equip_gloves_basic'] },
      { slot: 'NECKLACE', textures: ['equip_necklace'] },
      { slot: 'HELMET', textures: ['equip_helmet_basic', 'equip_helmet_crown'] },
      { slot: 'SHIELD', textures: ['equip_shield'] },
      { slot: 'WEAPON', textures: null },  // special handling
    ];

    for (const layer of layerOrder) {
      const equipped = this.equipment[layer.slot];
      if (!equipped) continue;

      let textureKey;

      if (layer.slot === 'WEAPON') {
        textureKey = WEAPON_SPRITE_MAP[equipped.weaponType] || 'equip_weapon_sword';
      } else if (layer.textures) {
        // Pick texture based on rarity
        const rIdx = ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY', 'MYTHIC'];
        const rarityIdx = rIdx.indexOf(equipped.rarity || 'COMMON');
        textureKey = rarityIdx >= 3 && layer.textures.length > 1
          ? layer.textures[1]
          : layer.textures[0];
      }

      if (!textureKey || !this.scene.textures.exists(textureKey)) continue;

      const sprite = this.scene.add.sprite(this.x, this.y, textureKey);
      sprite.setDepth(this.depth + 1);

      // Apply rarity tint
      const tint = RARITY_TINT[equipped.rarity];
      if (tint) {
        sprite.setTint(tint);
        sprite.setAlpha(0.85);
      }

      this.equipLayers[layer.slot] = sprite;
    }
  }

  _syncEquipmentLayerPositions() {
    for (const key of Object.keys(this.equipLayers)) {
      const sprite = this.equipLayers[key];
      if (sprite && sprite.active) {
        sprite.setPosition(this.x, this.y);
        sprite.setDepth(this.depth + 1);
        sprite.setFlipX(this.flipX);
      }
    }
  }

  // ==========================================================================
  // Movement
  // ==========================================================================

  move(cursors, wasd, delta) {
    if (this.isAttacking) {
      this.setVelocity(0, 0);
      return;
    }

    const speed = this.getComputedStats().MOVE_SPEED || this.moveSpeed;

    let speedMul = 1.0;
    for (const buff of this.buffs) {
      if (buff.stat === 'MOVE_SPEED_MUL') {
        speedMul *= buff.amount;
      }
    }

    const finalSpeed = speed * speedMul;

    // 4-directional movement only (no diagonal)
    // Priority: last pressed direction wins
    const left = cursors.left.isDown || (wasd && wasd.left.isDown);
    const right = cursors.right.isDown || (wasd && wasd.right.isDown);
    const up = cursors.up.isDown || (wasd && wasd.up.isDown);
    const down = cursors.down.isDown || (wasd && wasd.down.isDown);

    let vx = 0;
    let vy = 0;

    // Horizontal takes priority if both H and V pressed simultaneously
    // But within H or V, only one direction at a time
    if (left && !right) {
      vx = -finalSpeed;
      this.facing = 'left';
      this.setFlipX(true);
    } else if (right && !left) {
      vx = finalSpeed;
      this.facing = 'right';
      this.setFlipX(false);
    } else if (up && !down) {
      vy = -finalSpeed;
      this.facing = 'up';
    } else if (down && !up) {
      vy = finalSpeed;
      this.facing = 'down';
    }

    this.setVelocity(vx, vy);
  }

  // ==========================================================================
  // Basic Attack (Spacebar)
  // ==========================================================================

  performBasicAttack() {
    const now = Date.now();
    const computed = this.getComputedStats();
    const cd = Math.max(200, this.attackCooldown - (computed.ATK_SPEED || 0) * 2);

    if (now - this.lastAttackTime < cd) return null;
    if (this.isAttacking) return null;

    this.lastAttackTime = now;
    this.isAttacking = true;

    // Attack animation - brief lunge in facing direction
    const lungeDist = 8;
    let dx = 0, dy = 0;
    switch (this.facing) {
      case 'left': dx = -lungeDist; break;
      case 'right': dx = lungeDist; break;
      case 'up': dy = -lungeDist; break;
      case 'down': default: dy = lungeDist; break;
    }

    // Lunge forward
    this.scene.tweens.add({
      targets: this,
      x: this.x + dx,
      y: this.y + dy,
      duration: 80,
      yoyo: true,
      ease: 'Power2',
      onComplete: () => {
        this.isAttacking = false;
      },
    });

    // Gain weapon proficiency
    this._updateProficiencyBonus();
    const weapon = this.equipment.WEAPON;
    if (weapon && weapon.weaponType && this.scene.proficiencySystem) {
      this.scene.proficiencySystem.gainProficiency('weapon', weapon.weaponType, 3);
    }

    // Find nearest monster in attack range (directional cone)
    const target = this._findAttackTarget();

    if (target) {
      const result = this.scene.combatSystem.performAttack(this, target);

      // Spawn attack impact effect
      if (result && result.hit) {
        this.scene.impactSystem.playBasicAttack(this, target, weapon);
        target.provoke();
      }

      this.scene.events.emit('player-stats-changed');
      return result;
    } else {
      // Swing in air - still show slash
      this.scene.impactSystem.playWhiff(this);
    }

    return null;
  }

  _findAttackTarget() {
    const range = 60;
    let closest = null;
    let closestDist = range;

    for (const monster of this.scene.monsters.getChildren()) {
      if (monster.isDead) continue;

      const dist = Phaser.Math.Distance.Between(this.x, this.y, monster.x, monster.y);
      if (dist >= closestDist) continue;

      // Directional check - prefer monsters in facing direction
      const angle = Phaser.Math.Angle.Between(this.x, this.y, monster.x, monster.y);
      let facingAngle;
      switch (this.facing) {
        case 'right': facingAngle = 0; break;
        case 'down': facingAngle = Math.PI / 2; break;
        case 'left': facingAngle = Math.PI; break;
        case 'up': facingAngle = -Math.PI / 2; break;
      }

      const angleDiff = Math.abs(Phaser.Math.Angle.Wrap(angle - facingAngle));
      if (angleDiff < Math.PI * 0.6) { // ~108 degree cone
        closest = monster;
        closestDist = dist;
      }
    }

    // Fallback: if no monster in cone, check any nearby
    if (!closest) {
      for (const monster of this.scene.monsters.getChildren()) {
        if (monster.isDead) continue;
        const dist = Phaser.Math.Distance.Between(this.x, this.y, monster.x, monster.y);
        if (dist < 45 && dist < closestDist) {
          closest = monster;
          closestDist = dist;
        }
      }
    }

    return closest;
  }

  // ==========================================================================
  // Skill Attack (still supports click-based too)
  // ==========================================================================

  attack(target) {
    const now = Date.now();
    if (now - this.lastAttackTime < this.attackCooldown) return null;
    this.lastAttackTime = now;

    this._updateProficiencyBonus();

    const weapon = this.equipment.WEAPON;
    if (weapon && weapon.weaponType && this.scene.proficiencySystem) {
      this.scene.proficiencySystem.gainProficiency('weapon', weapon.weaponType, 3);
    }

    const result = this.scene.combatSystem.performAttack(this, target);

    if (result && result.hit && this.scene.impactSystem) {
      this.scene.impactSystem.playBasicAttack(this, target, weapon);
    }

    return result;
  }

  useSkill(skillId, target) {
    const skill = SKILLS_BY_ID[skillId];
    if (!skill) return null;

    const now = Date.now();

    const lastUsed = this.skillCooldowns[skillId] || 0;
    if (now - lastUsed < (skill.cooldown || 0)) return null;
    if (this.stats.MP < (skill.mpCost || 0)) return null;

    if (target && skill.range) {
      const dist = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y);
      if (dist > skill.range) return null;
    }

    this.stats.MP -= skill.mpCost || 0;
    this.skillCooldowns[skillId] = now;

    if (this.scene.proficiencySystem && skill.proficiencyGain) {
      this.scene.proficiencySystem.gainProficiency('skill', skillId, skill.proficiencyGain);
    }

    // Handle legacy single-effect format
    if (skill.effect && !skill.effects) {
      return this._applyLegacyEffect(skill, target);
    }

    // Damage-dealing active skills
    if (skill.baseDamage > 0 && target) {
      this._updateProficiencyBonus();
      const result = this.scene.combatSystem.performAttack(this, target, skill);

      // Skill impact effect
      if (result && result.hit && this.scene.impactSystem) {
        this.scene.impactSystem.playSkillImpact(this, target, skill);
      }

      this.scene.events.emit('player-stats-changed');
      return result;
    }

    // Non-damage skills (buffs, heals, movement)
    if (skill.effects && skill.effects.length > 0) {
      const result = this._applyEffects(skill, target);

      // Heal/buff effect
      if (result && this.scene.impactSystem) {
        this.scene.impactSystem.playBuffEffect(this, skill);
      }

      return result;
    }

    if (!skill.isActive) return null;
    return null;
  }

  _applyEffects(skill, target) {
    const results = [];
    for (const effect of skill.effects) {
      switch (effect.type) {
        case 'HEAL':
        case 'heal': {
          let amount = effect.value || effect.amount || 0;
          if (effect.scaling) {
            const stats = this.getComputedStats();
            for (const [stat, ratio] of Object.entries(effect.scaling)) {
              amount += (stats[stat] || 0) * ratio;
            }
          }
          amount = Math.floor(amount);
          const targetStat = effect.target || effect.stat || 'HP';
          const maxStat = targetStat === 'HP' ? 'maxHP' : 'maxMP';
          this.stats[targetStat] = Math.min(this.stats[maxStat], this.stats[targetStat] + amount);

          if (this.scene) {
            const text = this.scene.add.text(this.x, this.y - 20, `+${amount}`, {
              fontSize: '14px', fontFamily: 'monospace', color: '#44ff44',
              stroke: '#000000', strokeThickness: 3,
            });
            text.setOrigin(0.5, 1).setDepth(1000);
            this.scene.tweens.add({
              targets: text, y: this.y - 60, alpha: 0, duration: 1000,
              onComplete: () => text.destroy(),
            });
          }
          results.push({ type: 'heal', amount });
          break;
        }

        case 'STAT_BUFF':
        case 'stat_buff': {
          if (effect.duration && effect.duration > 0) {
            this.buffs.push({
              stat: effect.stat,
              amount: effect.value,
              isPercent: effect.isPercent || false,
              duration: effect.duration,
              startTime: Date.now(),
            });
          }
          results.push({ type: 'buff', stat: effect.stat });
          break;
        }

        case 'MOVEMENT_BOOST':
        case 'movement_boost': {
          this.buffs.push({
            stat: 'MOVE_SPEED_MUL',
            amount: effect.multiplier || 2.0,
            duration: effect.duration || 2000,
            startTime: Date.now(),
          });
          results.push({ type: 'buff', stat: 'MOVE_SPEED' });
          break;
        }
      }
    }
    return results.length > 0 ? results[0] : null;
  }

  _applyLegacyEffect(skill, target) {
    const effect = skill.effect;

    if (effect.type === 'heal') {
      let amount = effect.amount || 0;
      if (effect.scaling) {
        const stats = this.getComputedStats();
        for (const [stat, ratio] of Object.entries(effect.scaling)) {
          amount += (stats[stat] || 0) * ratio;
        }
      }
      amount = Math.floor(amount);
      this.stats.HP = Math.min(this.stats.maxHP, this.stats.HP + amount);

      if (this.scene) {
        const text = this.scene.add.text(this.x, this.y - 20, `+${amount}`, {
          fontSize: '14px', fontFamily: 'monospace', color: '#44ff44',
          stroke: '#000000', strokeThickness: 3,
        });
        text.setOrigin(0.5, 1).setDepth(1000);
        this.scene.tweens.add({
          targets: text, y: this.y - 60, alpha: 0, duration: 1000,
          onComplete: () => text.destroy(),
        });
      }

      if (this.scene.impactSystem) {
        this.scene.impactSystem.playBuffEffect(this, skill);
      }

      return { type: 'heal', amount };
    }

    if (effect.type === 'movement_boost') {
      this.buffs.push({
        stat: 'MOVE_SPEED_MUL',
        amount: effect.multiplier || 2.0,
        duration: effect.duration || 2000,
        startTime: Date.now(),
      });
      return { type: 'buff', stat: 'MOVE_SPEED' };
    }

    return null;
  }

  _updateProficiencyBonus() {
    const weapon = this.equipment.WEAPON;
    if (weapon && weapon.weaponType && this.scene.proficiencySystem) {
      this.proficiencyBonus = this.scene.proficiencySystem.getProficiencyBonus('weapon', weapon.weaponType);
    } else {
      this.proficiencyBonus = 1.0;
    }
  }

  // ==========================================================================
  // Equipment
  // ==========================================================================

  equip(item, slot) {
    if (!item || !slot) return false;

    if (this.equipment[slot]) {
      this.unequip(slot);
    }

    this.equipment[slot] = { ...item };

    const invIdx = this.inventory.findIndex((e) => e.itemId === item.id);
    if (invIdx !== -1) {
      this.inventory[invIdx].quantity -= 1;
      if (this.inventory[invIdx].quantity <= 0) {
        this.inventory.splice(invIdx, 1);
      }
    }

    this._updateEquipmentVisuals();
    this.scene.events.emit('equipment-changed', { slot, item });
    return true;
  }

  unequip(slot) {
    const item = this.equipment[slot];
    if (!item) return false;

    this.addItem(item.id, 1);
    this.equipment[slot] = null;

    this._updateEquipmentVisuals();
    this.scene.events.emit('equipment-changed', { slot, item: null });
    return true;
  }

  // ==========================================================================
  // Inventory
  // ==========================================================================

  addItem(itemId, quantity = 1) {
    const itemData = ITEMS_BY_ID[itemId];
    if (!itemData) return false;

    const existing = this.inventory.find((e) => e.itemId === itemId);
    if (existing && itemData.stackable) {
      existing.quantity += quantity;
    } else {
      this.inventory.push({ itemId, quantity });
    }

    this.scene.events.emit('inventory-changed');
    return true;
  }

  removeItem(itemId, quantity = 1) {
    const idx = this.inventory.findIndex((e) => e.itemId === itemId);
    if (idx === -1) return false;

    this.inventory[idx].quantity -= quantity;
    if (this.inventory[idx].quantity <= 0) {
      this.inventory.splice(idx, 1);
    }

    this.scene.events.emit('inventory-changed');
    return true;
  }

  useConsumable(itemId) {
    const itemData = ITEMS_BY_ID[itemId];
    if (!itemData || itemData.type !== 'CONSUMABLE') return false;
    if (!this.inventory.find((e) => e.itemId === itemId)) return false;

    if (itemData.effect) {
      if (itemData.effect.type === 'heal') {
        const stat = itemData.effect.stat;
        const amount = itemData.effect.amount;
        const maxStat = stat === 'HP' ? 'maxHP' : stat === 'MP' ? 'maxMP' : null;
        if (stat && maxStat) {
          this.stats[stat] = Math.min(this.stats[maxStat], this.stats[stat] + amount);
        }
      }
    }

    this.removeItem(itemId, 1);
    return true;
  }

  // ==========================================================================
  // Experience & Leveling
  // ==========================================================================

  gainExp(amount) {
    this.stats.exp += amount;

    while (this.stats.exp >= getExpForLevel(this.stats.level)) {
      this.stats.exp -= getExpForLevel(this.stats.level);
      this.stats.level += 1;

      for (const [stat, gain] of Object.entries(LEVEL_UP_GAINS)) {
        this.stats[stat] = (this.stats[stat] || 0) + gain;
      }
      this.stats.HP = this.stats.maxHP;
      this.stats.MP = this.stats.maxMP;

      if (this.scene) {
        this.scene.events.emit('player-levelup', this.stats.level);
      }
    }

    if (this.scene) {
      this.scene.events.emit('exp-changed', this.stats.exp, getExpForLevel(this.stats.level));
    }
  }

  // ==========================================================================
  // Computed Stats
  // ==========================================================================

  getComputedStats() {
    const computed = { ...this.stats };

    for (const slotKey of Object.keys(this.equipment)) {
      const item = this.equipment[slotKey];
      if (item && item.stats) {
        for (const [stat, value] of Object.entries(item.stats)) {
          computed[stat] = (computed[stat] || 0) + value;
        }
      }
    }

    return computed;
  }

  // ==========================================================================
  // Proficiency delegation
  // ==========================================================================

  gainProficiency(type, id, amount) {
    if (this.scene.proficiencySystem) {
      return this.scene.proficiencySystem.gainProficiency(type, id, amount);
    }
  }

  // ==========================================================================
  // Update
  // ==========================================================================

  update(time, delta) {
    // Remove expired buffs
    const now = Date.now();
    this.buffs = this.buffs.filter((b) => now - b.startTime < b.duration);

    // Sync equipment layer positions
    this._syncEquipmentLayerPositions();
  }

  // Cleanup on destroy
  destroy(fromScene) {
    for (const key of Object.keys(this.equipLayers)) {
      if (this.equipLayers[key]) {
        this.equipLayers[key].destroy();
      }
    }
    this.equipLayers = {};
    super.destroy(fromScene);
  }
}
