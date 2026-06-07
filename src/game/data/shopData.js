// =============================================================================
// shopData.js - Modular ARPG shop inventories
// =============================================================================

export const WEAPON_SHOP_ITEMS = Object.freeze([
  { itemId: 'weapon_sword_001', price: 80, stock: 5 },
  { itemId: 'armor_cloth_001', price: 60, stock: 5 },
]);

export const GENERAL_SHOP_ITEMS = Object.freeze([
  { itemId: 'consumable_hp_001', price: 20, stock: 99 },
  { itemId: 'material_core_001', price: 8, stock: 99 },
]);

import { getGameData } from '../../data/GameDataLoader.js';

export const SHOP_CONSUMABLES_BY_ID = new Proxy({}, {
  get(_, id) {
    const item = getGameData().items[id];
    return item && item.type === 'CONSUMABLE' ? item : undefined;
  },
});
