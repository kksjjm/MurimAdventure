// =============================================================================
// NPC.js - NPC Entity Class for village interactions
// =============================================================================

import Phaser from 'phaser';

/**
 * NPC type icons drawn above the NPC name tag.
 * Maps NPC type to a color used for the small indicator dot.
 */
const TYPE_COLORS = {
  quest:        0xffcc00,  // yellow - quest giver
  shop_weapon:  0x88aaff,  // blue   - weapon shop
  shop_general: 0x88ff88,  // green  - general shop
  info:         0xcccccc,  // gray   - informational
};

export default class NPC extends Phaser.Physics.Arcade.Sprite {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x - world x in pixels
   * @param {number} y - world y in pixels
   * @param {object} npcData - NPC definition from npcData.js
   */
  constructor(scene, x, y, npcData) {
    const textureKey = npcData.texture || 'npc_elder';
    super(scene, x, y, textureKey);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Immovable NPC body
    this.body.setImmovable(true);
    this.body.setSize(32, 40);
    this.body.setOffset(16, 20);
    this.setDepth(9);

    // --- NPC Data ---
    this.npcId = npcData.id;
    this.npcName = npcData.name;
    this.nameKo = npcData.nameKo;
    this.npcType = npcData.type;           // 'quest' | 'shop_weapon' | 'shop_general' | 'info'
    this.dialogues = npcData.dialogues;
    this.quests = npcData.quests || [];
    this.shopType = npcData.shopType || null;

    // --- Interaction state ---
    this.interactionRadius = 60;            // pixels; player must be within this to interact

    // --- Name tag ---
    this.nameTag = scene.add.text(x, y - 38, this.nameKo, {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
      align: 'center',
    }).setOrigin(0.5, 1).setDepth(100);

    // --- Type indicator (small colored dot above name) ---
    const dotColor = TYPE_COLORS[this.npcType] || 0xcccccc;
    this.typeIcon = scene.add.graphics();
    this.typeIcon.fillStyle(dotColor, 1);
    this.typeIcon.fillCircle(0, 0, 4);
    this.typeIcon.setPosition(x, y - 44);
    this.typeIcon.setDepth(100);

    // --- Quest exclamation mark (shown when quests available) ---
    this.questMarker = scene.add.text(x, y - 50, '!', {
      fontSize: '14px',
      fontFamily: 'serif',
      color: '#ffcc00',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5, 1).setDepth(101);
    this.questMarker.setVisible(false);

    // --- Interaction prompt (shown when player is near) ---
    this.interactPrompt = scene.add.text(x, y + 36, '[F] 대화', {
      fontSize: '9px',
      fontFamily: 'monospace',
      color: '#ffcc66',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5, 0).setDepth(100);
    this.interactPrompt.setVisible(false);
  }

  // ===========================================================================
  // Public API
  // ===========================================================================

  /**
   * Check if player is within interaction range.
   * @param {Player} player
   * @returns {boolean}
   */
  isPlayerNear(player) {
    if (!player) return false;
    const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
    return dist <= this.interactionRadius;
  }

  /**
   * Show or hide the quest exclamation marker.
   * @param {boolean} visible
   */
  setQuestAvailable(visible) {
    this.questMarker.setVisible(visible);
  }

  /**
   * Determine which dialogue set to use based on quest state.
   * @param {object} questSystem - QuestSystem instance
   * @returns {string[]} array of dialogue lines
   */
  getDialogueLines(questSystem) {
    if (this.quests.length > 0 && questSystem) {
      for (const questId of this.quests) {
        // Check if quest is active and complete
        const activeQuest = questSystem.getActiveQuest(questId);
        if (activeQuest && questSystem.isQuestObjectivesComplete(questId)) {
          const key = questId === 'quest_04' ? 'quest_04_complete' : 'quest_complete';
          return this.dialogues[key] || this.dialogues.quest_complete || this.dialogues.default;
        }

        // Check if quest is available (not active, not completed)
        if (!activeQuest && !questSystem.isQuestCompleted(questId)) {
          const key = questId === 'quest_04' ? 'quest_04_available' : 'quest_available';
          return this.dialogues[key] || this.dialogues.quest_available || this.dialogues.default;
        }
      }
    }
    return this.dialogues.default;
  }

  /**
   * Get the available quest ID (first quest not yet accepted or completed).
   * @param {object} questSystem
   * @returns {string|null}
   */
  getAvailableQuestId(questSystem) {
    if (!questSystem) return null;
    for (const questId of this.quests) {
      if (!questSystem.getActiveQuest(questId) && !questSystem.isQuestCompleted(questId)) {
        return questId;
      }
    }
    return null;
  }

  /**
   * Get quest ID that is active and has all objectives complete.
   * @param {object} questSystem
   * @returns {string|null}
   */
  getCompletableQuestId(questSystem) {
    if (!questSystem) return null;
    for (const questId of this.quests) {
      const activeQuest = questSystem.getActiveQuest(questId);
      if (activeQuest && questSystem.isQuestObjectivesComplete(questId)) {
        return questId;
      }
    }
    return null;
  }

  // ===========================================================================
  // Update
  // ===========================================================================

  /**
   * Called every frame. Syncs overlay positions and manages prompt visibility.
   * @param {Player} player
   */
  updateNPC(player) {
    // Sync overlay positions to sprite position
    this.nameTag.setPosition(this.x, this.y - 38);
    this.typeIcon.setPosition(this.x, this.y - 44);
    this.questMarker.setPosition(this.x, this.y - 50);
    this.interactPrompt.setPosition(this.x, this.y + 36);

    // Show/hide interaction prompt based on player proximity
    const near = this.isPlayerNear(player);
    this.interactPrompt.setVisible(near);
  }

  // ===========================================================================
  // Cleanup
  // ===========================================================================

  destroy(fromScene) {
    if (this.nameTag) this.nameTag.destroy();
    if (this.typeIcon) this.typeIcon.destroy();
    if (this.questMarker) this.questMarker.destroy();
    if (this.interactPrompt) this.interactPrompt.destroy();
    super.destroy(fromScene);
  }
}
