// =============================================================================
// CombatSystem.js - Combat Calculations and Damage Application
// =============================================================================

export default class CombatSystem {
  constructor(scene) {
    this.scene = scene;
  }

  /**
   * Calculate raw damage for an attack.
   * @param {object} attacker - entity with stats (getComputedStats() or .stats)
   * @param {object} defender - entity with stats
   * @param {object} [skill] - optional skill data
   * @returns {number} raw damage before defense
   */
  calculateDamage(attacker, defender, skill = null) {
    const aStats = attacker.getComputedStats
      ? attacker.getComputedStats()
      : attacker.stats || attacker;
    const dStats = defender.getComputedStats
      ? defender.getComputedStats()
      : defender.stats || defender;

    let baseDamage;

    if (skill && skill.baseDamage !== undefined) {
      baseDamage = skill.baseDamage;
      // Apply scaling - check both top-level and effects array
      let scaling = skill.scaling;
      if (!scaling && skill.effects) {
        const dmgEffect = skill.effects.find((e) => e.type === 'DAMAGE' || e.type === 'damage');
        if (dmgEffect && dmgEffect.scaling) {
          scaling = dmgEffect.scaling;
        }
      }
      if (scaling) {
        for (const [stat, ratio] of Object.entries(scaling)) {
          baseDamage += (aStats[stat] || 0) * ratio;
        }
      }
    } else {
      // Basic attack: ATK stat
      baseDamage = (aStats.ATK || 0) * 1.0;
    }

    // Apply proficiency bonus if available
    if (attacker.proficiencyBonus) {
      baseDamage *= attacker.proficiencyBonus;
    }

    // Subtract defense
    const defense = dStats.DEF || 0;
    const damageReduction = defense / (defense + 50); // diminishing returns
    let finalDamage = baseDamage * (1 - damageReduction);

    // Minimum damage
    finalDamage = Math.max(1, Math.floor(finalDamage));

    return finalDamage;
  }

  /**
   * Check if an attack hits.
   * @param {object} attacker
   * @param {object} defender
   * @returns {boolean}
   */
  calculateHit(attacker, defender) {
    const aStats = attacker.getComputedStats
      ? attacker.getComputedStats()
      : attacker.stats || attacker;
    const dStats = defender.getComputedStats
      ? defender.getComputedStats()
      : defender.stats || defender;

    const accuracy = aStats.ACCURACY || 90;
    const evasion = dStats.EVASION || 0;

    // Hit chance = accuracy - evasion, clamped between 30-100
    const hitChance = Math.min(100, Math.max(30, accuracy - evasion));
    return Math.random() * 100 < hitChance;
  }

  /**
   * Check if attack is a critical hit.
   * @param {object} attacker
   * @returns {{ isCrit: boolean, critMultiplier: number }}
   */
  calculateCrit(attacker) {
    const aStats = attacker.getComputedStats
      ? attacker.getComputedStats()
      : attacker.stats || attacker;

    const critRate = aStats.CRIT_RATE || 5;
    const critDmg = aStats.CRIT_DMG || 150;

    const isCrit = Math.random() * 100 < critRate;
    return {
      isCrit,
      critMultiplier: isCrit ? critDmg / 100 : 1.0,
    };
  }

  /**
   * Apply damage to a target and handle death.
   * @param {object} target - entity with stats.HP, stats.maxHP, die()
   * @param {number} damage - damage amount
   * @param {boolean} isCrit - whether this was a critical hit
   * @returns {{ died: boolean, actualDamage: number }}
   */
  applyDamage(target, damage, isCrit = false) {
    const stats = target.stats || target;
    const actualDamage = Math.min(stats.HP, Math.max(1, Math.floor(damage)));
    stats.HP -= actualDamage;

    // Show floating damage number
    this.showDamageNumber(target, actualDamage, isCrit);

    const died = stats.HP <= 0;
    if (died && typeof target.die === 'function') {
      target.die();
    }

    return { died, actualDamage };
  }

  /**
   * Full attack sequence: hit check -> damage calc -> crit check -> apply.
   * @param {object} attacker
   * @param {object} defender
   * @param {object} [skill]
   * @returns {{ hit: boolean, damage: number, isCrit: boolean, died: boolean }|null}
   */
  performAttack(attacker, defender, skill = null) {
    // Check hit
    if (!this.calculateHit(attacker, defender)) {
      this.showMissText(defender);
      return { hit: false, damage: 0, isCrit: false, died: false };
    }

    // Calculate damage
    let damage = this.calculateDamage(attacker, defender, skill);

    // Check crit
    const { isCrit, critMultiplier } = this.calculateCrit(attacker);
    damage = Math.floor(damage * critMultiplier);

    // Apply damage
    const { died, actualDamage } = this.applyDamage(defender, damage, isCrit);

    return { hit: true, damage: actualDamage, isCrit, died };
  }

  /**
   * Show floating damage number above target.
   */
  showDamageNumber(target, damage, isCrit = false) {
    if (!this.scene || !target.x || !target.y) return;

    const color = isCrit ? '#ffaa00' : '#ff4444';
    const fontSize = isCrit ? '18px' : '14px';
    const prefix = isCrit ? 'CRIT! ' : '';

    const text = this.scene.add.text(
      target.x,
      target.y - 20,
      `${prefix}-${damage}`,
      {
        fontSize,
        fontFamily: 'monospace',
        color,
        stroke: '#000000',
        strokeThickness: 3,
      }
    );
    text.setOrigin(0.5, 1);
    text.setDepth(1000);

    // Float up and fade
    this.scene.tweens.add({
      targets: text,
      y: target.y - 60,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => text.destroy(),
    });
  }

  /**
   * Show "MISS" text above target.
   */
  showMissText(target) {
    if (!this.scene || !target.x || !target.y) return;

    const text = this.scene.add.text(
      target.x,
      target.y - 20,
      'MISS',
      {
        fontSize: '12px',
        fontFamily: 'monospace',
        color: '#aaaaaa',
        stroke: '#000000',
        strokeThickness: 2,
      }
    );
    text.setOrigin(0.5, 1);
    text.setDepth(1000);

    this.scene.tweens.add({
      targets: text,
      y: target.y - 50,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => text.destroy(),
    });
  }
}
