// =============================================================================
// MapTransitionSystem.js - Handles transitions between maps
// =============================================================================

import { getMapData } from '../data/mapData.js';

const FADE_DURATION = 500; // ms

// Map ID -> Scene key mapping
const MAP_TO_SCENE = {
  field_01: 'WorldScene',
  village_01: 'VillageScene',
  dark_forest: 'DarkForestScene',
};

export default class MapTransitionSystem {
  /**
   * Transition from one map scene to another.
   * @param {Phaser.Scene} currentScene - The currently active scene
   * @param {string} targetMapId - The map ID to transition to
   * @param {number} targetX - Tile X to spawn at in the target map
   * @param {number} targetY - Tile Y to spawn at in the target map
   */
  static transition(currentScene, targetMapId, targetX, targetY) {
    if (currentScene._mapTransitionInProgress) return;
    currentScene._mapTransitionInProgress = true;
    currentScene._transitioning = true;

    const targetSceneKey = MAP_TO_SCENE[targetMapId];
    if (!targetSceneKey) {
      console.warn(`[MapTransition] Unknown map ID: ${targetMapId}`);
      currentScene._transitioning = false;
      currentScene._mapTransitionInProgress = false;
      return;
    }

    const mapData = getMapData(targetMapId);
    if (!mapData) {
      console.warn(`[MapTransition] No map data for: ${targetMapId}`);
      currentScene._transitioning = false;
      currentScene._mapTransitionInProgress = false;
      return;
    }

    // Collect player data to carry over
    const carryData = {
      spawnX: targetX,
      spawnY: targetY,
      fromMap: currentScene.mapId || 'unknown',
      mapId: targetMapId,
    };

    // If the current scene has a player, carry stats
    if (currentScene.player) {
      carryData.playerStats = { ...currentScene.player.stats };
      carryData.playerInventory = currentScene.player.inventory
        ? currentScene.player.inventory.map(e => ({ ...e }))
        : [];
      carryData.playerEquipment = currentScene.player.equipment
        ? { ...currentScene.player.equipment }
        : {};
      carryData.playerSkills = currentScene.player.skills
        ? [...currentScene.player.skills]
        : [];
      carryData.playerSkillSlots = currentScene.player.skillSlots
        ? [...currentScene.player.skillSlots]
        : [];
    }

    // Proficiency data
    if (currentScene.proficiencySystem) {
      carryData.proficiencyData = currentScene.proficiencySystem.serialize
        ? currentScene.proficiencySystem.serialize()
        : null;
    }

    // Fade out
    currentScene.cameras.main.fadeOut(FADE_DURATION, 0, 0, 0);

    currentScene.cameras.main.once('camerafadeoutcomplete', () => {
      // Stop UI scene if running
      if (currentScene.scene.isActive('UIScene')) {
        currentScene.scene.stop('UIScene');
      }

      // Stop current scene and start target
      currentScene.scene.start(targetSceneKey, carryData);
    });
  }

  /**
   * Show map name text when entering a new map.
   * @param {Phaser.Scene} scene - The scene to show the text in
   * @param {string} mapNameKo - Korean map name
   */
  static showMapName(scene, mapNameKo) {
    const cam = scene.cameras.main;

    // Fade in
    cam.fadeIn(FADE_DURATION, 0, 0, 0);

    // Map name banner
    const text = scene.add.text(cam.width / 2, cam.height / 2 - 40, mapNameKo, {
      fontSize: '28px',
      fontFamily: 'monospace',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
      shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 4, fill: true },
    });
    text.setOrigin(0.5, 0.5);
    text.setScrollFactor(0);
    text.setDepth(9999);
    text.setAlpha(0);

    scene.tweens.add({
      targets: text,
      alpha: 1,
      duration: 400,
      hold: 1500,
      yoyo: true,
      onComplete: () => text.destroy(),
    });
  }
}
