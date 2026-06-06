// =============================================================================
// QuestSystem.js - Quest tracking and progression
// =============================================================================

import { QUESTS_BY_ID } from '../data/questData.js';

export default class QuestSystem {
  /**
   * @param {Phaser.Scene} scene - The world scene
   */
  constructor(scene) {
    this.scene = scene;

    /** @type {object[]} Active quest instances (deep copies with current progress) */
    this.activeQuests = [];

    /** @type {string[]} IDs of completed quests */
    this.completedQuests = [];
  }

  // ===========================================================================
  // Quest Management
  // ===========================================================================

  /**
   * Accept a quest by ID. Copies the quest template and adds it as active.
   * @param {string} questId
   * @returns {boolean} true if accepted
   */
  acceptQuest(questId) {
    // Already active or completed
    if (this.getActiveQuest(questId)) return false;
    if (this.isQuestCompleted(questId)) return false;

    const template = QUESTS_BY_ID[questId];
    if (!template) return false;

    // Deep copy objectives so current progress is tracked independently
    const quest = {
      ...template,
      objectives: template.objectives.map(obj => ({ ...obj, current: 0 })),
    };

    this.activeQuests.push(quest);
    this.scene.events.emit('quest-accepted', quest);
    return true;
  }

  /**
   * Get an active quest by ID.
   * @param {string} questId
   * @returns {object|null}
   */
  getActiveQuest(questId) {
    return this.activeQuests.find(q => q.id === questId) || null;
  }

  /**
   * Check if a quest has been completed.
   * @param {string} questId
   * @returns {boolean}
   */
  isQuestCompleted(questId) {
    return this.completedQuests.includes(questId);
  }

  /**
   * Check if all objectives for an active quest are met.
   * @param {string} questId
   * @returns {boolean}
   */
  isQuestObjectivesComplete(questId) {
    const quest = this.getActiveQuest(questId);
    if (!quest) return false;
    return quest.objectives.every(obj => obj.current >= obj.count);
  }

  /**
   * Complete a quest: give rewards, move to completedQuests.
   * @param {string} questId
   * @param {Player} player
   * @returns {boolean}
   */
  completeQuest(questId, player) {
    const questIdx = this.activeQuests.findIndex(q => q.id === questId);
    if (questIdx === -1) return false;

    const quest = this.activeQuests[questIdx];

    // Verify all objectives are met
    if (!quest.objectives.every(obj => obj.current >= obj.count)) return false;

    // Give rewards
    const rewards = quest.rewards;
    if (rewards.exp && player.gainExp) {
      player.gainExp(rewards.exp);
    }
    if (rewards.gold) {
      player.stats.gold = (player.stats.gold || 0) + rewards.gold;
    }
    if (rewards.items && rewards.items.length > 0) {
      for (const rewardItem of rewards.items) {
        player.addItem(rewardItem.itemId, rewardItem.quantity || 1);
      }
    }

    // Move to completed
    this.activeQuests.splice(questIdx, 1);
    this.completedQuests.push(questId);

    this.scene.events.emit('quest-completed', quest);
    this.scene.events.emit('player-stats-changed');
    return true;
  }

  // ===========================================================================
  // Progress Tracking
  // ===========================================================================

  /**
   * Record a kill for quest tracking.
   * @param {string} monsterId - The killed monster's ID (e.g. 'mon_wild_boar')
   */
  onMonsterKilled(monsterId) {
    for (const quest of this.activeQuests) {
      for (const obj of quest.objectives) {
        if (obj.type === 'kill' && obj.target === monsterId && obj.current < obj.count) {
          obj.current += 1;
          this.scene.events.emit('quest-progress', quest, obj);
        }
      }
    }
  }

  /**
   * Record an item collection for quest tracking.
   * @param {string} itemId
   */
  onItemCollected(itemId) {
    for (const quest of this.activeQuests) {
      for (const obj of quest.objectives) {
        if (obj.type === 'collect' && obj.target === itemId && obj.current < obj.count) {
          obj.current += 1;
          this.scene.events.emit('quest-progress', quest, obj);
        }
      }
    }
  }

  /**
   * Record talking to an NPC for quest tracking.
   * @param {string} npcId
   */
  onTalkedToNPC(npcId) {
    for (const quest of this.activeQuests) {
      for (const obj of quest.objectives) {
        if (obj.type === 'talk' && obj.target === npcId && obj.current < obj.count) {
          obj.current += 1;
          this.scene.events.emit('quest-progress', quest, obj);
        }
      }
    }
  }

  /**
   * Check progress on all active quests given a player's state.
   * This is a general check that can be called periodically.
   * @param {Player} player
   */
  checkQuestProgress(player) {
    // For collect quests, re-check inventory counts
    for (const quest of this.activeQuests) {
      for (const obj of quest.objectives) {
        if (obj.type === 'collect') {
          const invEntry = player.inventory.find(e => e.itemId === obj.target);
          const count = invEntry ? invEntry.quantity : 0;
          if (count !== obj.current) {
            obj.current = Math.min(count, obj.count);
            this.scene.events.emit('quest-progress', quest, obj);
          }
        }
      }
    }
  }

  // ===========================================================================
  // Serialization
  // ===========================================================================

  /**
   * Serialize quest state for saving.
   * @returns {object}
   */
  toJSON() {
    return {
      activeQuests: this.activeQuests.map(q => ({
        id: q.id,
        objectives: q.objectives.map(o => ({ ...o })),
      })),
      completedQuests: [...this.completedQuests],
    };
  }

  /**
   * Restore quest state from save data.
   * @param {object} data
   */
  fromJSON(data) {
    if (!data) return;

    this.completedQuests = data.completedQuests || [];

    this.activeQuests = [];
    if (data.activeQuests) {
      for (const saved of data.activeQuests) {
        const template = QUESTS_BY_ID[saved.id];
        if (!template) continue;

        const quest = {
          ...template,
          objectives: template.objectives.map((obj, i) => ({
            ...obj,
            current: (saved.objectives && saved.objectives[i])
              ? saved.objectives[i].current
              : 0,
          })),
        };
        this.activeQuests.push(quest);
      }
    }
  }
}
