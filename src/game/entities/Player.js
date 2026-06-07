// =============================================================================
// Player.js - Player Entity Class (64x64 HD with equipment layers)
// =============================================================================

import Phaser from 'phaser';
import { getGameData } from '../../data/GameDataLoader.js';
import { getExpForLevel } from '../../data/defaultData.js';
import { EQUIPMENT_SLOTS } from '../../data/constants.js';

// Map weapon types to equipment layer texture keys
// Map weapon type to visual sprite (primary)
const WEAPON_TYPE_SPRITE_MAP = {
  SWORD: 'equip_weapon_sword',
  BLADE: 'equip_weapon_sword',
  SPEAR: 'equip_weapon_spear',
  STAFF: 'equip_weapon_staff',
  HIDDEN: 'equip_weapon_dual',
  WHIP: 'equip_weapon_sword',
  FIST: 'equip_weapon_dual',
  EXOTIC: 'equip_weapon_staff',
};

// Fallback: map grip to sprite
const WEAPON_GRIP_SPRITE_MAP = {
  ONE_HANDED: 'equip_weapon_sword',
  TWO_HANDED: 'equip_weapon_spear',
  DUAL_WIELD: 'equip_weapon_dual',
};

// Map rarity grade to overlay tint (lower grade = stronger tint)
const RARITY_TINT = {
  GRADE_13: null,
  GRADE_12: null,
  GRADE_11: 0xcccccc,
  GRADE_10: 0x00ccff,
  GRADE_9: 0x1eff00,
  GRADE_8: 0x0070dd,
  GRADE_7: 0xff8000,
  GRADE_6: 0xa335ee,
  GRADE_5: 0xe6cc80,
  GRADE_4: 0xccff00,
  GRADE_3: 0xffcc00,
  GRADE_2: 0xff8800,
  GRADE_1: 0xff4400,
  GRADE_0: 0xff0000,
};

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    const gd = getGameData();
    const configuredSprite = gd.mainCharacter?.spriteKey || 'player_base';
    const initialTexture = scene.textures.exists(configuredSprite)
      ? configuredSprite
      : scene.textures.exists('player_base') ? 'player_base' : 'player_box';
    super(scene, x, y, initialTexture);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.setDepth(10);
    this.body.setSize(32, 40);
    this.body.setOffset(16, 20);

    // Play initial idle animation if available
    if (scene.anims.exists('player_idle_down')) {
      this.play('player_idle_down');
    }

    // --- Core Stats ---
    this.stats = { ...gd.playerDefaults };

    // --- Equipment: slot -> item data or null ---
    this.equipment = {};
    for (const slotKey of Object.keys(EQUIPMENT_SLOTS)) {
      this.equipment[slotKey] = null;
    }

    // --- Equipment visual layers ---
    this.equipLayers = {};

    // --- Inventory: array of { itemId, quantity } ---
    this.inventory = gd.defaultInventory.map((e) => ({ ...e }));

    // --- Skills: array of skill IDs ---
    this.skills = [...gd.defaultStartingSkills];

    // --- Skill slots (hotbar 1-5) ---
    this.skillSlots = [...gd.defaultSkillSlots];

    // --- Skill cooldowns: { skillId: lastUsedTimestamp } ---
    this.skillCooldowns = {};

    // --- Active skill durations: { skillId: { startTime, duration, effects } } ---
    this.activeSkillEffects = {};

    // --- Channel effects: { skillId: { startTime, duration, stat, percentPerSec } } ---
    this.channelEffects = {};

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

    // --- Regen timer ---
    this._regenAccum = 0;

    // Equip starting gear
    this._equipStartingGear();
  }

  _equipStartingGear() {
    for (const inv of this.inventory) {
      const item = getGameData().items[inv.itemId];
      if (item && item.slot) {
        if (!this.equipment[item.slot]) {
          this.equip(item, item.slot);
        }
      }
    }
  }

  // ==========================================================================
  // Equipment Visual Layer System (Frame-Synced)
  //
  // Equipment sprites can be:
  // 1. Static (single 64x64 image) - legacy, positioned on character
  // 2. Animated spritesheet - same frame count as character animations,
  //    synced frame-by-frame (e.g. equip_weapon_sword_idle_down has 4 frames
  //    matching char_idle_down's 4 frames)
  //
  // Naming convention for animated equipment sprites:
  //   {equipTextureKey}_{animType}_{direction}
  //   e.g. equip_weapon_sword_idle_down, equip_armor_iron_walk_side
  //
  // If animated version doesn't exist, falls back to static overlay.
  // ==========================================================================

  _updateEquipmentVisuals() {
    // Clear existing layers
    for (const key of Object.keys(this.equipLayers)) {
      if (this.equipLayers[key]) {
        this.equipLayers[key].destroy();
      }
    }
    this.equipLayers = {};

    // Layer order (back to front): slot + default texture keys
    const layerOrder = [
      { slot: 'TALISMAN',  texKey: 'equip_talisman',       depthOff: 0 },
      { slot: 'SHOES',     texKey: 'equip_shoes_basic',    depthOff: 0 },
      { slot: 'ARMOR',     texKey: 'equip_armor_leather',  depthOff: 1 },
      { slot: 'BELT',      texKey: 'equip_belt_fancy',     depthOff: 2 },
      { slot: 'GLOVES',    texKey: 'equip_gloves_basic',   depthOff: 2 },
      { slot: 'NECKLACE',  texKey: 'equip_necklace',       depthOff: 2 },
      { slot: 'HELMET',    texKey: 'equip_helmet_basic',   depthOff: 3 },
      { slot: 'SHIELD',    texKey: 'equip_shield',         depthOff: 1 },
      { slot: 'WEAPON',    texKey: null,                   depthOff: 4 },
    ];

    for (const layer of layerOrder) {
      const equipped = this.equipment[layer.slot];
      if (!equipped) continue;

      // Determine base texture key
      let baseTexKey;
      if (equipped.spriteKey && this.scene.textures.exists(equipped.spriteKey)) {
        // Item-specific custom sprite takes priority for all slots
        baseTexKey = equipped.spriteKey;
      } else if (layer.slot === 'WEAPON') {
        baseTexKey = WEAPON_TYPE_SPRITE_MAP[equipped.weaponType]
          || WEAPON_GRIP_SPRITE_MAP[equipped.weaponGrip]
          || 'equip_weapon_sword';
      } else {
        baseTexKey = layer.texKey;
      }

      if (!baseTexKey) continue;

      // Try to find the texture (static fallback)
      const staticExists = this.scene.textures.exists(baseTexKey);
      if (!staticExists) continue;

      const sprite = this.scene.add.sprite(this.x, this.y, baseTexKey);
      sprite.setDepth(this.depth + layer.depthOff);

      // Store the base key for animation sync lookup
      sprite.setData('baseTexKey', baseTexKey);
      sprite.setData('slot', layer.slot);

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
    // Get current character animation state
    let animType = 'idle';
    let animDir = 'down';

    if (this.anims && this.anims.currentAnim) {
      const parts = this.anims.currentAnim.key.split('_');
      // player_idle_down → ['player', 'idle', 'down']
      // player_attack_down → ['player', 'attack', 'down']
      animType = parts[1] || 'idle';
      animDir = parts[2] || 'down';
    }

    // Map 'attack' back to 'slice' for equipment sprites
    // (character uses 'attack' but sprite files use 'slice')
    const equipAnimType = animType === 'attack' ? 'slice' : animType;

    const currentFrame = (this.anims && this.anims.currentFrame) ? this.anims.currentFrame.index : 0;

    for (const key of Object.keys(this.equipLayers)) {
      const sprite = this.equipLayers[key];
      if (!sprite || !sprite.active) continue;

      sprite.setPosition(this.x, this.y);
      sprite.setFlipX(this.flipX);
      sprite.setDepth(this.depth + (sprite.getData('depthOff') || 1));

      const baseTexKey = sprite.getData('baseTexKey');
      if (!baseTexKey) continue;

      // Try animated equipment texture: {baseTexKey}_{animType}_{direction}
      const animEquipKey = `${baseTexKey}_${equipAnimType}_${animDir}`;

      if (this.scene.textures.exists(animEquipKey)) {
        // Animated equipment spritesheet - sync frame with character
        const tex = this.scene.textures.get(animEquipKey);
        const frameCount = tex.frameTotal - 1; // exclude __BASE
        if (frameCount > 0) {
          const frameIdx = Math.min(currentFrame, frameCount - 1);
          sprite.setTexture(animEquipKey, frameIdx);
        } else {
          sprite.setTexture(animEquipKey);
        }
      } else {
        // Fallback to static base texture
        if (sprite.texture.key !== baseTexKey) {
          sprite.setTexture(baseTexKey);
        }
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

    // Animation state machine
    this._updateAnimation(vx, vy);
  }

  _getFacingDirection() {
    // Map left/right to 'side' for animation keys
    if (this.facing === 'left' || this.facing === 'right') return 'side';
    return this.facing; // 'up' or 'down'
  }

  _updateAnimation(vx, vy) {
    if (vx !== 0 || vy !== 0) {
      // Moving
      const dir = this._getFacingDirection();
      const animKey = `player_walk_${dir}`;
      if (this.scene.anims.exists(animKey)) {
        if (!this.anims.currentAnim || this.anims.currentAnim.key !== animKey) {
          this.play(animKey);
        }
      }
    } else {
      // Idle
      const dir = this._getFacingDirection();
      const animKey = `player_idle_${dir}`;
      if (this.scene.anims.exists(animKey)) {
        if (!this.anims.currentAnim || this.anims.currentAnim.key !== animKey) {
          this.play(animKey);
        }
      }
    }
  }

  // ==========================================================================
  // Basic Attack (Spacebar)
  // ==========================================================================

  performBasicAttack() {
    const now = Date.now();
    const computed = this.getComputedStats();

    // Get weapon proficiency attack speed bonus
    let atkSpdProfBonus = 0;
    const weapon = this.equipment.WEAPON;
    if (weapon && weapon.weaponType && this.scene.proficiencySystem) {
      const bonuses = this.scene.proficiencySystem.getWeaponProfBonuses(weapon.weaponType);
      atkSpdProfBonus = bonuses.atkSpdBonus || 0;
    }

    const totalAtkSpd = (computed.ATK_SPEED || 0) + atkSpdProfBonus;
    const cd = Math.max(200, this.attackCooldown - totalAtkSpd * 2);

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

    // Play attack (slice) animation if available
    const dir = this._getFacingDirection();
    const attackAnimKey = `player_attack_${dir}`;
    if (this.scene.anims.exists(attackAnimKey)) {
      this.play(attackAnimKey);
      this.once('animationcomplete', () => {
        // Return to idle after attack animation finishes
        const idleKey = `player_idle_${this._getFacingDirection()}`;
        if (this.scene && this.scene.anims.exists(idleKey)) {
          this.play(idleKey);
        }
      });
    }

    // Find nearest monster in attack range (directional cone)
    const target = this._findAttackTarget();

    // Gain weapon proficiency
    this._updateProficiencyBonus();
    if (weapon && weapon.weaponType && this.scene.proficiencySystem) {
      this.scene.proficiencySystem.gainProficiency('weapon', weapon.weaponType, 3);
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

    if (target) {
      // Capture target position before lunge changes things
      const tx = target.x;
      const ty = target.y;

      // Delay impact to lunge peak (80ms) so effect appears on monster
      this.scene.time.delayedCall(60, () => {
        const result = this.scene.combatSystem.performAttack(this, target);
        if (result && result.hit && this.scene.impactSystem) {
          this.scene.impactSystem.playBasicAttack(this, target, weapon);
          target.provoke();
        }
        this.scene.events.emit('player-stats-changed');
      });

      return { pending: true };
    } else {
      // Swing in air
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
    const skill = getGameData().skills[skillId];
    if (!skill) return null;

    const now = Date.now();

    // Check cooldown - show message if blocked
    const lastUsed = this.skillCooldowns[skillId] || 0;
    const cdRemaining = (skill.cooldown || 0) - (now - lastUsed);
    if (cdRemaining > 0) {
      this._showSkillBlockedMessage(`재사용 대기 중 (${(cdRemaining / 1000).toFixed(1)}초)`);
      return null;
    }

    // Check MP - show message if not enough
    if (this.stats.MP < (skill.mpCost || 0)) {
      this._showSkillBlockedMessage(`내력 부족! (필요: ${skill.mpCost}, 현재: ${Math.floor(this.stats.MP)})`);
      return null;
    }

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

        case 'CHANNEL_REGEN': {
          // Channeled regen effect (e.g. 운기조식)
          this.channelEffects[skill.id] = {
            startTime: Date.now(),
            duration: effect.duration || skill.duration || 8000,
            stat: effect.stat || 'MP',
            percentPerSec: effect.percentPerSec || 10,
          };

          // Visual feedback
          if (this.scene) {
            const text = this.scene.add.text(this.x, this.y - 30, `${skill.nameKo} 시전!`, {
              fontSize: '12px', fontFamily: 'monospace', color: '#88ddff',
              stroke: '#000000', strokeThickness: 3,
            });
            text.setOrigin(0.5, 1).setDepth(1000);
            this.scene.tweens.add({
              targets: text, y: this.y - 60, alpha: 0, duration: 1500,
              onComplete: () => text.destroy(),
            });
          }
          results.push({ type: 'channel', stat: effect.stat });
          break;
        }
      }
    }

    // Track skill duration if defined
    if (skill.duration && skill.duration > 0) {
      this.activeSkillEffects[skill.id] = {
        startTime: Date.now(),
        duration: skill.duration,
        skillNameKo: skill.nameKo,
      };
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

  _showSkillBlockedMessage(msg) {
    if (!this.scene) return;
    // Throttle: don't spam messages
    const now = Date.now();
    if (this._lastBlockedMsgTime && now - this._lastBlockedMsgTime < 500) return;
    this._lastBlockedMsgTime = now;

    const text = this.scene.add.text(this.x, this.y - 40, msg, {
      fontSize: '11px',
      fontFamily: 'monospace',
      color: '#ff8888',
      stroke: '#000000',
      strokeThickness: 3,
    });
    text.setOrigin(0.5, 1).setDepth(1000);
    this.scene.tweens.add({
      targets: text,
      y: this.y - 70,
      alpha: 0,
      duration: 1200,
      onComplete: () => text.destroy(),
    });
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
    const itemData = getGameData().items[itemId];
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
    const itemData = getGameData().items[itemId];
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

      for (const [stat, gain] of Object.entries(getGameData().levelUpGains)) {
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
      if (!item) continue;

      // Add base weapon stats (ATK, ATK_SPEED from baseATK/baseATK_SPEED)
      if (item.baseATK) computed.ATK = (computed.ATK || 0) + item.baseATK;
      if (item.baseATK_SPEED) computed.ATK_SPEED = (computed.ATK_SPEED || 0) + item.baseATK_SPEED;

      // Add base armor DEF
      if (item.baseDEF) computed.DEF = (computed.DEF || 0) + item.baseDEF;

      // Add additional stats
      if (item.stats) {
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
    const now = Date.now();

    // Remove expired buffs
    this.buffs = this.buffs.filter((b) => now - b.startTime < b.duration);

    // --- Expire active skill effects ---
    for (const [skillId, data] of Object.entries(this.activeSkillEffects)) {
      if (now - data.startTime >= data.duration) {
        delete this.activeSkillEffects[skillId];
      }
    }

    // --- Channel effects (운기조식 등) ---
    for (const [skillId, ch] of Object.entries(this.channelEffects)) {
      if (now - ch.startTime >= ch.duration) {
        delete this.channelEffects[skillId];
        continue;
      }
      // Apply regen per second (delta is in ms)
      const regenPerMs = (ch.percentPerSec / 100) * this.stats['max' + ch.stat] / 1000;
      const amount = regenPerMs * delta;
      const maxKey = 'max' + ch.stat;
      this.stats[ch.stat] = Math.min(this.stats[maxKey], this.stats[ch.stat] + amount);
    }

    // --- HP/MP regen from stats (every 2 seconds) ---
    this._regenAccum += delta;
    if (this._regenAccum >= 2000) {
      this._regenAccum = 0;
      const computed = this.getComputedStats();
      const hpRegen = computed.HP_REGEN || 0;
      const mpRegen = computed.MP_REGEN || 0;
      if (hpRegen > 0 && this.stats.HP < this.stats.maxHP) {
        this.stats.HP = Math.min(this.stats.maxHP, this.stats.HP + hpRegen);
      }
      if (mpRegen > 0 && this.stats.MP < this.stats.maxMP) {
        this.stats.MP = Math.min(this.stats.maxMP, this.stats.MP + mpRegen);
      }
      if ((hpRegen > 0 || mpRegen > 0) && this.scene) {
        this.scene.events.emit('player-stats-changed');
      }
    }

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
