// =============================================================================
// ProficiencySystem.js - Weapon & Skill Proficiency Tracking
// =============================================================================

import { PROFICIENCY_LEVELS, getProficiencyLevel, getNextProficiencyThreshold } from '../../data/constants.js';

export default class ProficiencySystem {
  constructor(scene) {
    this.scene = scene;
    // { weapon: { sword: 0, staff: 0, ... }, skill: { horizontal_slash: 0, ... } }
    this.proficiencies = {
      weapon: {},
      skill: {},
    };
  }

  /**
   * Gain proficiency experience for a weapon type or skill.
   * @param {'weapon'|'skill'} type
   * @param {string} id - weapon type key or skill id
   * @param {number} amount
   * @returns {{ leveledUp: boolean, oldLevel: object, newLevel: object }}
   */
  gainProficiency(type, id, amount) {
    if (!this.proficiencies[type]) {
      this.proficiencies[type] = {};
    }

    const oldExp = this.proficiencies[type][id] || 0;
    const oldLevel = getProficiencyLevel(oldExp);

    this.proficiencies[type][id] = oldExp + amount;

    const newExp = this.proficiencies[type][id];
    const newLevel = getProficiencyLevel(newExp);

    const leveledUp = oldLevel.key !== newLevel.key;

    if (leveledUp && this.scene) {
      this.scene.events.emit('proficiency-levelup', {
        type,
        id,
        oldLevel,
        newLevel,
        exp: newExp,
      });
    }

    return { leveledUp, oldLevel, newLevel, exp: newExp };
  }

  /**
   * Get the current proficiency experience for a type/id.
   * @param {'weapon'|'skill'} type
   * @param {string} id
   * @returns {number}
   */
  getProficiencyExp(type, id) {
    return (this.proficiencies[type] && this.proficiencies[type][id]) || 0;
  }

  /**
   * Get the current proficiency level object.
   * @param {'weapon'|'skill'} type
   * @param {string} id
   * @returns {object} proficiency level from constants
   */
  getProficiencyLevel(type, id) {
    const exp = this.getProficiencyExp(type, id);
    return getProficiencyLevel(exp);
  }

  /**
   * Get stat bonus multiplier from proficiency.
   * @param {'weapon'|'skill'} type
   * @param {string} id
   * @returns {number} stat multiplier (1.0 = no bonus)
   */
  getProficiencyBonus(type, id) {
    const level = this.getProficiencyLevel(type, id);
    return level.statMultiplier || 1.0;
  }

  /**
   * Get progress toward next proficiency level (0.0 to 1.0).
   * @param {'weapon'|'skill'} type
   * @param {string} id
   * @returns {number}
   */
  getProgress(type, id) {
    const exp = this.getProficiencyExp(type, id);
    const currentLevel = getProficiencyLevel(exp);
    const nextThreshold = getNextProficiencyThreshold(exp);

    if (nextThreshold === null) return 1.0; // max level

    const currentThreshold = currentLevel.threshold;
    const range = nextThreshold - currentThreshold;
    const progress = (exp - currentThreshold) / range;
    return Math.min(1.0, Math.max(0.0, progress));
  }

  /**
   * Serialize proficiency data for save.
   */
  toJSON() {
    return JSON.parse(JSON.stringify(this.proficiencies));
  }

  /**
   * Load proficiency data from save.
   */
  fromJSON(data) {
    if (data) {
      this.proficiencies = JSON.parse(JSON.stringify(data));
    }
  }
}
