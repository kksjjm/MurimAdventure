// =============================================================================
// SkillCombinationSystem.js - Skill Fusion / Combination
// =============================================================================

import { getGameData } from '../../data/GameDataLoader.js';

export default class SkillCombinationSystem {
  constructor(scene) {
    this.scene = scene;
    this.combinations = [...getGameData().skillCombinations];
  }

  /**
   * Check which combinations the player can attempt based on known skills.
   * @param {string[]} playerSkillIds - array of skill IDs the player has learned
   * @returns {Array<{ ingredients: string[], result: object, meetsReqs: boolean }>}
   */
  checkCombinations(playerSkillIds) {
    const available = [];

    for (const combo of this.combinations) {
      const hasAllIngredients = combo.ingredients.every(
        (id) => playerSkillIds.includes(id)
      );

      if (hasAllIngredients) {
        // Check if player already has the result skill
        const alreadyHas = playerSkillIds.includes(combo.result.id);
        if (alreadyHas) continue;

        // Check proficiency requirements
        let meetsReqs = true;
        const profReq = combo.requiredProficiency || combo.proficiencyReq || {};
        if (Object.keys(profReq).length > 0 && this.scene && this.scene.proficiencySystem) {
          for (const [skillId, reqExp] of Object.entries(profReq)) {
            const currentExp = this.scene.proficiencySystem.getProficiencyExp('skill', skillId);
            if (currentExp < reqExp) {
              meetsReqs = false;
              break;
            }
          }
        }

        available.push({
          ingredients: combo.ingredients,
          result: combo.result,
          meetsReqs,
          proficiencyReq: profReq,
        });
      }
    }

    return available;
  }

  /**
   * Attempt to combine two skills.
   * @param {string} skillId1
   * @param {string} skillId2
   * @param {string[]} playerSkillIds
   * @returns {{ success: boolean, newSkill: object|null, reason: string }}
   */
  combineSkills(skillId1, skillId2, playerSkillIds) {
    // Find a matching combination
    const matchingCombo = this.combinations.find((combo) => {
      const ids = [skillId1, skillId2].sort();
      const ingredients = [...combo.ingredients].sort();
      return (
        ids.length === ingredients.length &&
        ids.every((id, i) => id === ingredients[i])
      );
    });

    if (!matchingCombo) {
      return { success: false, newSkill: null, reason: '이 조합으로는 새로운 무공을 만들 수 없습니다.' };
    }

    // Check if player already has the result
    if (playerSkillIds.includes(matchingCombo.result.id)) {
      return { success: false, newSkill: null, reason: '이미 이 무공을 보유하고 있습니다.' };
    }

    // Check proficiency requirements
    const profReq = matchingCombo.requiredProficiency || matchingCombo.proficiencyReq || {};
    if (Object.keys(profReq).length > 0 && this.scene && this.scene.proficiencySystem) {
      for (const [skillId, reqExp] of Object.entries(profReq)) {
        const currentExp = this.scene.proficiencySystem.getProficiencyExp('skill', skillId);
        if (currentExp < reqExp) {
          const skillData = getGameData().skills[skillId];
          const skillName = skillData ? (skillData.nameKo || skillData.name) : skillId;
          return {
            success: false,
            newSkill: null,
            reason: `${skillName}의 숙련도가 부족합니다. (필요: ${reqExp}, 현재: ${currentExp})`,
          };
        }
      }
    }

    // Emit event
    if (this.scene) {
      this.scene.events.emit('skill-combined', {
        ingredients: matchingCombo.ingredients,
        result: matchingCombo.result,
      });
    }

    return { success: true, newSkill: matchingCombo.result, reason: '새로운 무공을 깨달았습니다!' };
  }
}
