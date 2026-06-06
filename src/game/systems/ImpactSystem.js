// =============================================================================
// ImpactSystem.js - Visual impact effects for attacks and skills
// =============================================================================

import Phaser from 'phaser';
import { ELEMENT_TYPES } from '../../data/constants.js';

// Map element types to effect textures
const ELEMENT_FX_MAP = {
  FIRE: 'fx_fire',
  ICE: 'fx_ice',
  LIGHTNING: 'fx_lightning',
  WIND: 'fx_qi_wave',
  EARTH: 'fx_fist',
  DARK: 'fx_dark',
  LIGHT: 'fx_heal',
  POISON: 'fx_dark',
  NONE: null,
};

// Map skill categories/types to default effects
const SKILL_FX_MAP = {
  MUGONG_INTERNAL: 'fx_qi_wave',
  MUGONG_EXTERNAL: 'fx_fist',
  JUSUL_ATTACK: 'fx_fire',
  JUSUL_BUFF: 'fx_heal',
  JUSUL_DEBUFF: 'fx_dark',
  GYEONGGONG: 'fx_qi_wave',
};

export default class ImpactSystem {
  constructor(scene) {
    this.scene = scene;
  }

  // ==========================================================================
  // Basic Attack Impact
  // ==========================================================================

  playBasicAttack(attacker, target, weapon) {
    const scene = this.scene;

    // Determine effect based on weapon grip
    const grip = weapon && weapon.weaponGrip;
    if (grip === 'DUAL_WIELD') {
      this._playSlashEffect(target.x - 8, target.y, -0.3);
      scene.time.delayedCall(80, () => {
        this._playSlashEffect(target.x + 8, target.y, 0.3);
      });
    } else if (grip === 'TWO_HANDED') {
      this._playHeavySlash(target.x, target.y);
    } else {
      this._playSlashEffect(target.x, target.y, 0);
    }

    // Screen shake (subtle)
    scene.cameras.main.shake(80, 0.003);

    // Hit flash on target
    this._flashTarget(target);

    // Spawn hit particles
    this._spawnHitParticles(target.x, target.y, 0xffffff, 6);
  }

  // ==========================================================================
  // Skill Impact
  // ==========================================================================

  playSkillImpact(attacker, target, skill) {
    const scene = this.scene;

    // Determine which effect to use
    let fxKey = null;

    // Priority 1: element-based
    if (skill.element && skill.element !== 'NONE') {
      fxKey = ELEMENT_FX_MAP[skill.element];
    }

    // Priority 2: skill type based
    if (!fxKey) {
      if (skill.category === 'MUGONG') {
        fxKey = skill.type === 'INTERNAL' ? 'fx_qi_wave' : 'fx_fist';
      } else if (skill.category === 'JUSUL') {
        if (skill.type === 'ATTACK') fxKey = 'fx_fire';
        else if (skill.type === 'BUFF') fxKey = 'fx_heal';
        else fxKey = 'fx_dark';
      } else {
        fxKey = 'fx_qi_wave';
      }
    }

    // Play the main effect
    this._playCenteredEffect(target.x, target.y, fxKey, {
      scale: 1.2,
      duration: 500,
      shake: true,
    });

    // Additional directional effect from attacker to target
    this._playProjectileTrail(attacker, target, skill);

    // Stronger screen shake for skills
    scene.cameras.main.shake(120, 0.006);

    // Target flash
    this._flashTarget(target);

    // More particles for skills
    const particleColor = this._getElementColor(skill.element);
    this._spawnHitParticles(target.x, target.y, particleColor, 12);
  }

  // ==========================================================================
  // Buff / Heal Effect
  // ==========================================================================

  playBuffEffect(target, skill) {
    this._playCenteredEffect(target.x, target.y, 'fx_heal', {
      scale: 1.0,
      duration: 600,
      shake: false,
    });

    // Rising sparkle particles
    this._spawnRisingParticles(target.x, target.y, 0x44ff88, 8);
  }

  // ==========================================================================
  // Whiff (attack in air, no target)
  // ==========================================================================

  playWhiff(attacker) {
    const scene = this.scene;

    // Direction offset
    let ox = 0, oy = 0;
    switch (attacker.facing) {
      case 'right': ox = 30; break;
      case 'left': ox = -30; break;
      case 'up': oy = -30; break;
      case 'down': oy = 30; break;
    }

    const fx = scene.add.sprite(attacker.x + ox, attacker.y + oy, 'fx_slash');
    fx.setDepth(999);
    fx.setAlpha(0.6);
    fx.setScale(0.8);

    // Rotate based on facing (+90 degrees clockwise correction)
    const rotations = { right: Math.PI / 2, down: Math.PI, left: -Math.PI / 2, up: 0 };
    fx.setRotation(rotations[attacker.facing] || 0);

    scene.tweens.add({
      targets: fx,
      alpha: 0,
      scaleX: 1.2,
      scaleY: 1.2,
      rotation: fx.rotation + 0.3,
      duration: 200,
      onComplete: () => fx.destroy(),
    });
  }

  // ==========================================================================
  // Monster Attack Impact (when monsters hit the player)
  // ==========================================================================

  playMonsterAttack(monster, player) {
    this._flashTarget(player, 0xff0000);
    this._spawnHitParticles(player.x, player.y, 0xff4444, 4);
    this.scene.cameras.main.shake(60, 0.004);
  }

  // ==========================================================================
  // Internal Effect Helpers
  // ==========================================================================

  _playSlashEffect(x, y, angleOffset) {
    const scene = this.scene;
    const fx = scene.add.sprite(x, y, 'fx_slash');
    fx.setDepth(999);
    fx.setAlpha(0.95);
    fx.setScale(1.1);
    fx.setRotation(angleOffset + Math.PI / 2);

    scene.tweens.add({
      targets: fx,
      alpha: 0,
      scaleX: 1.5,
      scaleY: 1.5,
      rotation: fx.rotation + 0.4,
      duration: 220,
      ease: 'Power2',
      onComplete: () => fx.destroy(),
    });
  }

  _playHeavySlash(x, y) {
    const scene = this.scene;
    const fx = scene.add.sprite(x, y, 'fx_heavy_slash');
    fx.setDepth(999);
    fx.setAlpha(0.9);
    fx.setScale(0.5);

    scene.tweens.add({
      targets: fx,
      alpha: 0,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 350,
      ease: 'Power2',
      onComplete: () => fx.destroy(),
    });

    // Extra shake for heavy attacks
    scene.cameras.main.shake(100, 0.008);
  }

  _playCenteredEffect(x, y, fxKey, options = {}) {
    const scene = this.scene;
    const { scale = 1.0, duration = 400, shake = false } = options;

    if (!scene.textures.exists(fxKey)) return;

    const fx = scene.add.sprite(x, y, fxKey);
    fx.setDepth(999);
    fx.setAlpha(0.9);
    fx.setScale(scale * 0.3);

    // Grow then fade
    scene.tweens.add({
      targets: fx,
      scaleX: scale * 1.2,
      scaleY: scale * 1.2,
      alpha: 0,
      duration: duration,
      ease: 'Power2',
      onComplete: () => fx.destroy(),
    });

    if (shake) {
      scene.cameras.main.shake(80, 0.004);
    }
  }

  _playProjectileTrail(attacker, target, skill) {
    const scene = this.scene;

    // Create a trail of particles from attacker to target
    const dx = target.x - attacker.x;
    const dy = target.y - attacker.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 10) return;

    const steps = Math.min(5, Math.floor(dist / 15));
    const color = this._getElementColor(skill.element);

    for (let i = 0; i < steps; i++) {
      const t = (i + 1) / (steps + 1);
      const px = attacker.x + dx * t;
      const py = attacker.y + dy * t;

      scene.time.delayedCall(i * 30, () => {
        const particle = scene.add.graphics();
        particle.fillStyle(color, 0.7);
        particle.fillCircle(0, 0, 4 - i * 0.5);
        particle.setPosition(px, py);
        particle.setDepth(998);

        scene.tweens.add({
          targets: particle,
          alpha: 0,
          scaleX: 2,
          scaleY: 2,
          duration: 200,
          onComplete: () => particle.destroy(),
        });
      });
    }
  }

  _flashTarget(target, color = 0xffffff) {
    if (!target || !target.active) return;

    const originalTint = target.tintTopLeft;
    target.setTint(color);

    this.scene.time.delayedCall(100, () => {
      if (target && target.active) {
        if (target.monsterData && target.monsterData.tint) {
          target.setTint(target.monsterData.tint);
        } else {
          target.clearTint();
        }
      }
    });
  }

  _spawnHitParticles(x, y, color, count) {
    const scene = this.scene;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 30 + Math.random() * 40;
      const size = 1 + Math.random() * 3;

      const particle = scene.add.graphics();
      particle.fillStyle(color, 0.9);
      particle.fillRect(-size / 2, -size / 2, size, size);
      particle.setPosition(x, y);
      particle.setDepth(998);

      scene.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * speed,
        y: y + Math.sin(angle) * speed,
        alpha: 0,
        duration: 300 + Math.random() * 200,
        ease: 'Power2',
        onComplete: () => particle.destroy(),
      });
    }
  }

  _spawnRisingParticles(x, y, color, count) {
    const scene = this.scene;

    for (let i = 0; i < count; i++) {
      const offsetX = (Math.random() - 0.5) * 30;
      const delay = Math.random() * 300;

      scene.time.delayedCall(delay, () => {
        const particle = scene.add.graphics();
        particle.fillStyle(color, 0.8);
        particle.fillCircle(0, 0, 2 + Math.random() * 2);
        particle.setPosition(x + offsetX, y + 10);
        particle.setDepth(998);

        scene.tweens.add({
          targets: particle,
          y: y - 40 - Math.random() * 20,
          alpha: 0,
          duration: 600 + Math.random() * 400,
          ease: 'Power1',
          onComplete: () => particle.destroy(),
        });
      });
    }
  }

  _getElementColor(element) {
    const colors = {
      FIRE: 0xff4400,
      ICE: 0x88ccff,
      LIGHTNING: 0xffff44,
      WIND: 0x88ffaa,
      EARTH: 0xbb8844,
      DARK: 0x8822cc,
      LIGHT: 0xffffaa,
      POISON: 0x44cc44,
    };
    return colors[element] || 0xffffff;
  }
}
