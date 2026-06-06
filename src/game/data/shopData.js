// =============================================================================
// shopData.js - Shop inventory definitions for Murim Adventure
// =============================================================================

/**
 * Weapon shop inventory (대장장이 / Blacksmith)
 * Sells weapons, shields, helmets, armor, gloves
 */
export const WEAPON_SHOP_ITEMS = Object.freeze([
  { itemId: 'wpn_iron_sword',      price: 80,   stock: 5 },
  { itemId: 'wpn_crescent_blade',  price: 250,  stock: 3 },
  { itemId: 'wpn_void_fan',        price: 400,  stock: 2 },
  { itemId: 'arm_leather_armor',   price: 60,   stock: 5 },
  { itemId: 'arm_iron_helmet',     price: 120,  stock: 3 },
]);

/**
 * General shop inventory (상인 / Merchant)
 * Sells potions, accessories, belts, shoes
 */
export const GENERAL_SHOP_ITEMS = Object.freeze([
  { itemId: 'item_hp_potion',        price: 20,  stock: 99 },
  { itemId: 'item_mp_potion',        price: 25,  stock: 99 },
  { itemId: 'item_hp_potion_large',  price: 60,  stock: 50 },
  { itemId: 'item_antidote',         price: 15,  stock: 50 },
  { itemId: 'acc_jade_ring',         price: 200, stock: 2 },
  { itemId: 'acc_fortune_talisman',  price: 350, stock: 1 },
  { itemId: 'arm_wind_shoes',        price: 300, stock: 2 },
]);

/**
 * Consumable item definitions (not in defaultData.js)
 * These are added to the global item registry at runtime or referenced directly.
 */
export const SHOP_CONSUMABLES = Object.freeze([
  {
    id: 'item_hp_potion',
    name: 'HP Potion',
    nameKo: 'HP 회복약',
    description: '체력을 50 회복하는 약.',
    type: 'CONSUMABLE',
    rarity: 'COMMON',
    stackable: true,
    effect: { type: 'heal', stat: 'HP', amount: 50 },
  },
  {
    id: 'item_mp_potion',
    name: 'MP Potion',
    nameKo: 'MP 회복약',
    description: '내력을 30 회복하는 약.',
    type: 'CONSUMABLE',
    rarity: 'COMMON',
    stackable: true,
    effect: { type: 'heal', stat: 'MP', amount: 30 },
  },
  {
    id: 'item_hp_potion_large',
    name: 'Large HP Potion',
    nameKo: '고급 HP 회복약',
    description: '체력을 150 회복하는 고급 약.',
    type: 'CONSUMABLE',
    rarity: 'UNCOMMON',
    stackable: true,
    effect: { type: 'heal', stat: 'HP', amount: 150 },
  },
  {
    id: 'item_antidote',
    name: 'Antidote',
    nameKo: '해독제',
    description: '독을 해제하는 약.',
    type: 'CONSUMABLE',
    rarity: 'COMMON',
    stackable: true,
    effect: { type: 'cure', status: 'poison' },
  },
]);

/**
 * Build a lookup map for shop consumables
 */
export const SHOP_CONSUMABLES_BY_ID = Object.freeze(
  Object.fromEntries(SHOP_CONSUMABLES.map(item => [item.id, item]))
);
