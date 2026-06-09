// =============================================================================
// MapTransitionSystem.js - Handles transitions between maps
// =============================================================================

import { getGameData, normalizeMapId } from '../../data/GameDataLoader.js';

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
    const normalizedTargetMapId = normalizeMapId(targetMapId);

    const maps = getGameData().maps || [];
    const mapData = maps.find(map => normalizeMapId(map?.id) === normalizedTargetMapId);
    if (!mapData) {
      console.warn(`[MapTransition] No admin-managed map data for: ${targetMapId}`);
      currentScene._transitioning = false;
      currentScene._mapTransitionInProgress = false;
      currentScene._portalCooldownUntil = (currentScene.time?.now || 0) + 1000;
      return;
    }

    // Collect player data to carry over
    const carryData = {
      spawnX: targetX,
      spawnY: targetY,
      fromMap: currentScene.mapId || 'unknown',
      mapId: normalizedTargetMapId,
      portalCooldownMs: 900,
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

    currentScene.cameras.main.resetFX();
    if (currentScene.changeMap) {
      currentScene.changeMap(normalizedTargetMapId, targetX, targetY);
    }
  }

  /**
   * Show map name text when entering a new map.
   * @param {Phaser.Scene} scene - The scene to show the text in
   * @param {string} mapNameKo - Korean map name
   */
  static showMapName(scene, mapNameKo) {
    const cam = scene.cameras.main;

    cam.resetFX();

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
