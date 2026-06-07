// =============================================================================
// ItemPickupSystem.js - Shared item pickup logic for all map scenes
// =============================================================================

import { getGameData, getItemIconKey } from '../../data/GameDataLoader.js';

const RARITY_TINTS = {
  GRADE_11: 0xcccccc, GRADE_10: 0x00ccff, GRADE_9: 0x1eff00,
  GRADE_8: 0x0070dd, GRADE_7: 0xff8000, GRADE_6: 0xa335ee,
  GRADE_5: 0xff4444, GRADE_4: 0xffaa00, GRADE_3: 0xff00ff,
};

/**
 * Spawn a floating item pickup sprite on the map.
 * @param {Phaser.Scene} scene
 * @param {Phaser.Physics.Arcade.Group} group - itemPickups group
 * @param {string} itemId
 * @param {number} x
 * @param {number} y
 * @returns {Phaser.Physics.Arcade.Sprite}
 */
export function spawnItemPickup(scene, group, itemId, x, y) {
  const itemData = getGameData().items[itemId];
  const iconKey = itemData ? getItemIconKey(itemData) : 'item_pickup';
  const texKey = scene.textures.exists(iconKey) ? iconKey : 'item_pickup';

  const pickup = scene.physics.add.sprite(x, y, texKey);
  pickup.setDepth(8);
  pickup.setScale(texKey === 'item_pickup' ? 1 : 1.5);
  pickup.setData('itemId', itemId);

  if (itemData?.rarity) {
    const tint = RARITY_TINTS[itemData.rarity];
    if (tint) pickup.setTint(tint);
  }

  scene.tweens.add({
    targets: pickup,
    y: y - 5,
    duration: 600,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut',
  });

  group.add(pickup);
  return pickup;
}

/**
 * Handle player picking up an item.
 * @param {Phaser.Scene} scene
 * @param {Player} player
 * @param {Phaser.Physics.Arcade.Sprite} pickup
 */
export function onItemPickup(scene, player, pickup) {
  const itemId = pickup.getData('itemId');
  if (itemId) {
    player.addItem(itemId, 1);

    const itemData = getGameData().items[itemId];
    const name = itemData ? (itemData.nameKo || itemData.name) : itemId;
    const text = scene.add.text(pickup.x, pickup.y - 10, `획득: ${name}`, {
      fontSize: '11px',
      fontFamily: 'monospace',
      color: '#66ff66',
      stroke: '#000000',
      strokeThickness: 2,
    });
    text.setOrigin(0.5, 1).setDepth(1000);
    scene.tweens.add({
      targets: text,
      y: pickup.y - 40,
      alpha: 0,
      duration: 1000,
      onComplete: () => text.destroy(),
    });
  }
  pickup.destroy();
}
