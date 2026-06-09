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

const BASE_EFFECT_FX_MAP = {
  effect_slash_damage: 'fx_slash',
  effect_bolt_damage: 'fx_lightning',
  effect_recover_channel: 'fx_heal',
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

const DEFAULT_BASIC_ATTACK_IMPACT_CONFIG = {
  hitEffect: {
    offsetX: 0,
    offsetY: 0,
    rotation: 0,
    alpha: 0.95,
    startScale: 1.1,
    endScale: 1.5,
    rotationDelta: 0,
    duration: 220,
    dualOffsetX: 8,
    dualFirstAngleOffset: 0,
    dualSecondAngleOffset: 0,
    dualDelay: 80,
    heavyAlpha: 0.9,
    heavyStartScale: 0.5,
    heavyEndScale: 1.3,
    heavyDuration: 350,
    heavyShakeDuration: 100,
    heavyShakeIntensity: 0.008,
  },
  whiffEffect: {
    offset: 30,
    alpha: 0.6,
    startScale: 0.8,
    endScale: 1.2,
    rotationDelta: 0,
    duration: 200,
    rotationByFacing: {
      right: 0,
      down: 0,
      left: 0,
      up: 0,
    },
  },
  targetHitEffect: {
    effectKey: 'fx_hit_receive',
    flashColor: 0xffffff,
    flashDuration: 100,
    particleColor: 0xffffff,
    particleCount: 6,
    particleMinSpeed: 30,
    particleMaxSpeed: 70,
    particleMinSize: 1,
    particleMaxSize: 4,
    particleDuration: 300,
    particleDurationJitter: 200,
    shakeDuration: 80,
    shakeIntensity: 0.003,
  },
  receiveHitEffect: {
    effectKey: 'fx_hit_receive',
    flashColor: 0xff0000,
    flashDuration: 100,
    particleColor: 0xff4444,
    particleCount: 4,
    particleMinSpeed: 24,
    particleMaxSpeed: 58,
    particleMinSize: 1,
    particleMaxSize: 3,
    particleDuration: 260,
    particleDurationJitter: 160,
    shakeDuration: 60,
    shakeIntensity: 0.004,
  },
};

export default class ImpactSystem {
  constructor(scene) {
    this.scene = scene;
  }

  _resolveSkillFx(skill, fallbackKey = 'fx_slash') {
    const scene = this.scene;
    const generatedSkillFxKey = skill?.id
      ? `skill_fx_${String(skill.id).replace(/[^a-zA-Z0-9_]/g, '_')}`
      : null;
    const defaultBaseFxKey = skill?.base_effect_id ? BASE_EFFECT_FX_MAP[skill.base_effect_id] : null;
    const explicitEffectKey = skill?.effectKey && skill.effectKey !== defaultBaseFxKey && skill.effectKey !== fallbackKey
      ? skill.effectKey
      : null;
    const explicitEffectSpriteKey = skill?.effectSpriteKey && skill.effectSpriteKey !== defaultBaseFxKey && skill.effectSpriteKey !== fallbackKey
      ? skill.effectSpriteKey
      : null;
    const candidates = [
      explicitEffectKey,
      explicitEffectSpriteKey,
      generatedSkillFxKey,
      skill?.effectKey,
      skill?.effectSpriteKey,
      defaultBaseFxKey,
      fallbackKey,
    ];
    return candidates.find(key => key && scene.textures.exists(key)) || fallbackKey;
  }

  _mergeConfig(base, override) {
    const merged = { ...base };
    for (const [key, value] of Object.entries(override || {})) {
      if (value && typeof value === 'object' && !Array.isArray(value) && base[key] && typeof base[key] === 'object') {
        merged[key] = this._mergeConfig(base[key], value);
      } else {
        merged[key] = value;
      }
    }
    return merged;
  }

  _getBasicAttackImpactConfig(skill) {
    return this._mergeConfig(DEFAULT_BASIC_ATTACK_IMPACT_CONFIG, skill?.impactConfig || {});
  }

  _colorValue(value, fallback) {
    if (typeof value === 'number') return value;
    if (typeof value === 'string' && value.trim()) {
      const normalized = value.trim().startsWith('#') ? value.trim().replace('#', '0x') : value.trim();
      const parsed = parseInt(normalized, normalized.startsWith('0x') ? 16 : 10);
      if (!Number.isNaN(parsed)) return parsed;
    }
    return fallback;
  }

  _resolveEffectAnimationKey(fxKey, explicitAnimKey = null) {
    const scene = this.scene;
    if (explicitAnimKey && scene.anims.exists(explicitAnimKey)) return explicitAnimKey;
    const generatedKey = `${fxKey}_anim`;
    return scene.anims.exists(generatedKey) ? generatedKey : null;
  }

  _playEffectSprite(x, y, fxKey, options = {}) {
    const scene = this.scene;
    if (!fxKey || !scene.textures.exists(fxKey)) return null;

    const {
      alpha = 0.9,
      startScale = 1,
      endScale = startScale,
      duration = 240,
      depth = 999,
      rotation = 0,
      rotationDelta = 0,
      ease = 'Power2',
      animationKey = null,
    } = options;

    const fx = scene.add.sprite(x, y, fxKey);
    fx.setDepth(depth);
    fx.setAlpha(alpha);
    fx.setScale(startScale);
    fx.setRotation(rotation);

    const resolvedAnimKey = this._resolveEffectAnimationKey(fxKey, animationKey);
    let effectDuration = duration;
    let destroyedByAnimation = false;
    if (resolvedAnimKey) {
      const anim = scene.anims.get(resolvedAnimKey);
      if (anim?.duration) effectDuration = Math.max(effectDuration, anim.duration);
      fx.play(resolvedAnimKey);
      fx.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
        destroyedByAnimation = true;
        if (fx.active) fx.destroy();
      });
    }

    if (effectDuration > 0) {
      scene.tweens.add({
        targets: fx,
        alpha: 0,
        scaleX: endScale,
        scaleY: endScale,
        rotation: rotation + rotationDelta,
        duration: effectDuration,
        ease,
        onComplete: () => {
          if (!destroyedByAnimation && fx.active) fx.destroy();
        },
      });
    }

    return fx;
  }

  // ==========================================================================
  // Basic Attack Impact
  // ==========================================================================

  playBasicAttack(attacker, target, weapon, basicAttackSkill = null) {
    const scene = this.scene;
    const impactConfig = this._getBasicAttackImpactConfig(basicAttackSkill);
    const hitEffect = impactConfig.hitEffect;
    const targetHitEffect = impactConfig.targetHitEffect;
    const slashFxKey = this._resolveSkillFx(basicAttackSkill, 'fx_slash');
    const heavyFxKey = basicAttackSkill?.heavyEffectKey
      && basicAttackSkill.heavyEffectKey !== 'fx_heavy_slash'
      && scene.textures.exists(basicAttackSkill.heavyEffectKey)
      ? basicAttackSkill.heavyEffectKey
      : slashFxKey;
    const baseX = target.x + (hitEffect.offsetX || 0);
    const baseY = target.y + (hitEffect.offsetY || 0);

    // Determine effect based on weapon grip
    const grip = weapon && weapon.weaponGrip;
    if (grip === 'DUAL_WIELD') {
      this._playSlashEffect(baseX - hitEffect.dualOffsetX, baseY, hitEffect.dualFirstAngleOffset, slashFxKey, hitEffect);
      scene.time.delayedCall(hitEffect.dualDelay, () => {
        this._playSlashEffect(baseX + hitEffect.dualOffsetX, baseY, hitEffect.dualSecondAngleOffset, slashFxKey, hitEffect);
      });
    } else if (grip === 'TWO_HANDED') {
      this._playHeavySlash(baseX, baseY, heavyFxKey, hitEffect);
    } else {
      this._playSlashEffect(baseX, baseY, 0, slashFxKey, hitEffect);
    }

    if (targetHitEffect.effectKey) {
      this._playEffectSprite(target.x, target.y, targetHitEffect.effectKey, {
        animationKey: targetHitEffect.animationKey,
        alpha: targetHitEffect.effectAlpha ?? 0.9,
        startScale: targetHitEffect.effectStartScale ?? 0.9,
        endScale: targetHitEffect.effectEndScale ?? 1.2,
        duration: targetHitEffect.effectDuration ?? 220,
      });
    }

    if (targetHitEffect.shakeDuration > 0 && targetHitEffect.shakeIntensity > 0) {
      scene.cameras.main.shake(targetHitEffect.shakeDuration, targetHitEffect.shakeIntensity);
    }

    this._flashTarget(target, this._colorValue(targetHitEffect.flashColor, 0xffffff), targetHitEffect.flashDuration);

    this._spawnHitParticles(
      target.x,
      target.y,
      this._colorValue(targetHitEffect.particleColor, 0xffffff),
      targetHitEffect.particleCount,
      targetHitEffect
    );
  }

  // ==========================================================================
  // Skill Impact
  // ==========================================================================

  playSkillImpact(attacker, target, skill) {
    const scene = this.scene;

    // Determine which effect to use
    let fxKey = null;

    // Priority 1: skill-specific custom effect from admin data
    if (skill.effectKey && scene.textures.exists(skill.effectKey)) {
      fxKey = skill.effectKey;
    } else if (skill.effectSpriteKey && scene.textures.exists(skill.effectSpriteKey)) {
      fxKey = skill.effectSpriteKey;
    } else if (skill.base_effect_id) {
      const baseFxKey = BASE_EFFECT_FX_MAP[skill.base_effect_id];
      if (baseFxKey && scene.textures.exists(baseFxKey)) fxKey = baseFxKey;
    }

    // Priority 2: element-based
    if (!fxKey && skill.element && skill.element !== 'NONE') {
      fxKey = ELEMENT_FX_MAP[skill.element];
    }

    // Priority 3: skill type based
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

    // Play the main effect centered on target (monster)
    this._playCenteredEffect(target.x, target.y, fxKey, {
      scale: 1.2,
      duration: 500,
      shake: true,
    });

    // Stronger screen shake for skills
    scene.cameras.main.shake(120, 0.006);

    // Target flash
    this._flashTarget(target);

    // Particles on target
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

  playWhiff(attacker, basicAttackSkill = null) {
    const scene = this.scene;
    const whiffEffect = this._getBasicAttackImpactConfig(basicAttackSkill).whiffEffect;
    const fxKey = this._resolveSkillFx(basicAttackSkill, 'fx_slash');

    // Direction offset
    let ox = 0, oy = 0;
    const offset = whiffEffect.offset || 30;
    switch (attacker.facing) {
      case 'right': ox = offset; break;
      case 'left': ox = -offset; break;
      case 'up': oy = -offset; break;
      case 'down': oy = offset; break;
    }

    const fx = scene.add.sprite(attacker.x + ox, attacker.y + oy, fxKey);
    fx.setDepth(999);
    fx.setAlpha(whiffEffect.alpha);
    fx.setScale(whiffEffect.startScale);

    // Rotate based on facing (+90 degrees clockwise correction)
    const rotations = whiffEffect.rotationByFacing || DEFAULT_BASIC_ATTACK_IMPACT_CONFIG.whiffEffect.rotationByFacing;
    fx.setRotation(rotations[attacker.facing] || 0);
    const resolvedAnimKey = this._resolveEffectAnimationKey(fxKey, whiffEffect.animationKey);
    if (resolvedAnimKey) fx.play(resolvedAnimKey);

    scene.tweens.add({
      targets: fx,
      alpha: 0,
      scaleX: whiffEffect.endScale,
      scaleY: whiffEffect.endScale,
      rotation: fx.rotation + whiffEffect.rotationDelta,
      duration: whiffEffect.duration,
      onComplete: () => fx.destroy(),
    });
  }

  // ==========================================================================
  // Monster Attack Impact (when monsters hit the player)
  // ==========================================================================

  playMonsterAttack(monster, player) {
    const receiveHitEffect = this._mergeConfig(
      DEFAULT_BASIC_ATTACK_IMPACT_CONFIG.receiveHitEffect,
      monster?.monsterData?.impactConfig?.receiveHitEffect || monster?.monsterData?.attackImpactConfig || {}
    );
    if (receiveHitEffect.effectKey) {
      this._playEffectSprite(player.x, player.y, receiveHitEffect.effectKey, {
        animationKey: receiveHitEffect.animationKey,
        alpha: receiveHitEffect.effectAlpha ?? 0.9,
        startScale: receiveHitEffect.effectStartScale ?? 0.9,
        endScale: receiveHitEffect.effectEndScale ?? 1.2,
        duration: receiveHitEffect.effectDuration ?? 220,
      });
    }
    this._flashTarget(player, this._colorValue(receiveHitEffect.flashColor, 0xff0000), receiveHitEffect.flashDuration);
    this._spawnHitParticles(
      player.x,
      player.y,
      this._colorValue(receiveHitEffect.particleColor, 0xff4444),
      receiveHitEffect.particleCount,
      receiveHitEffect
    );
    if (receiveHitEffect.shakeDuration > 0 && receiveHitEffect.shakeIntensity > 0) {
      this.scene.cameras.main.shake(receiveHitEffect.shakeDuration, receiveHitEffect.shakeIntensity);
    }
  }

  // ==========================================================================
  // Internal Effect Helpers
  // ==========================================================================

  _playSlashEffect(x, y, angleOffset, fxKey = 'fx_slash', config = DEFAULT_BASIC_ATTACK_IMPACT_CONFIG.hitEffect) {
    this._playEffectSprite(x, y, fxKey, {
      animationKey: config.animationKey,
      alpha: config.alpha,
      startScale: config.startScale,
      endScale: config.endScale,
      rotation: angleOffset + config.rotation,
      rotationDelta: config.rotationDelta,
      duration: config.duration,
      ease: 'Power2',
    });
  }

  _playHeavySlash(x, y, fxKey = 'fx_heavy_slash', config = DEFAULT_BASIC_ATTACK_IMPACT_CONFIG.hitEffect) {
    const scene = this.scene;
    this._playEffectSprite(x, y, fxKey, {
      animationKey: config.heavyAnimationKey,
      alpha: config.heavyAlpha,
      startScale: config.heavyStartScale,
      endScale: config.heavyEndScale,
      duration: config.heavyDuration,
      ease: 'Power2',
    });

    if (config.heavyShakeDuration > 0 && config.heavyShakeIntensity > 0) {
      scene.cameras.main.shake(config.heavyShakeDuration, config.heavyShakeIntensity);
    }
  }

  _playCenteredEffect(x, y, fxKey, options = {}) {
    const scene = this.scene;
    const { scale = 1.0, duration = 400, shake = false } = options;

    if (!scene.textures.exists(fxKey)) return;

    this._playEffectSprite(x, y, fxKey, {
      alpha: 0.9,
      startScale: scale * 0.3,
      endScale: scale * 1.2,
      duration: duration,
      ease: 'Power2',
    });

    if (shake) {
      scene.cameras.main.shake(80, 0.004);
    }
  }

  _flashTarget(target, color = 0xffffff, duration = 100) {
    if (!target || !target.active) return;

    target.setTint(color);

    this.scene.time.delayedCall(duration, () => {
      if (target && target.active) {
        if (target.monsterData && target.monsterData.tint) {
          target.setTint(target.monsterData.tint);
        } else {
          target.clearTint();
        }
      }
    });
  }

  _spawnHitParticles(x, y, color, count, config = {}) {
    const scene = this.scene;
    const minSpeed = config.particleMinSpeed ?? 30;
    const maxSpeed = config.particleMaxSpeed ?? 70;
    const minSize = config.particleMinSize ?? 1;
    const maxSize = config.particleMaxSize ?? 4;
    const duration = config.particleDuration ?? 300;
    const durationJitter = config.particleDurationJitter ?? 200;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = minSpeed + Math.random() * Math.max(0, maxSpeed - minSpeed);
      const size = minSize + Math.random() * Math.max(0, maxSize - minSize);

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
        duration: duration + Math.random() * durationJitter,
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
