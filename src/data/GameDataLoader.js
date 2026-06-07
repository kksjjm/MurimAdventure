// =============================================================================
// GameDataLoader - Unified data loading for game & admin
//
// Priority: localStorage (admin edits) → JSON files (public/data/) → defaultData.js
// =============================================================================

import {
  ITEMS_BY_ID as DEFAULT_ITEMS_BY_ID,
  SKILLS_BY_ID as DEFAULT_SKILLS_BY_ID,
  MONSTERS_BY_ID as DEFAULT_MONSTERS_BY_ID,
  DEFAULT_SKILL_COMBINATIONS,
  DEFAULT_PLAYER_STATS,
  LEVEL_UP_GAINS,
  DEFAULT_INVENTORY,
  DEFAULT_STARTING_SKILLS,
  DEFAULT_SKILL_SLOTS,
  SPAWN_CONFIG,
  DATA_SCHEMA_VERSION,
  DEFAULT_SYSTEM_MODULES,
  DEFAULT_TABLE_CATALOG,
  DEFAULT_STAT_DEFINITIONS,
  DEFAULT_COMBAT_ACTIONS,
  DEFAULT_HITBOX_TEMPLATES,
  DEFAULT_FORMULAS,
} from './defaultData.js';

const ADMIN_STORAGE_KEY = 'moduRpg_adminData_v2';

// Cached loaded data (shared across game scenes)
let _cache = null;

function getAdminData() {
  try {
    const raw = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    // Basic validation
    if (data && typeof data === 'object' && data.items && data.schemaVersion === DATA_SCHEMA_VERSION) return data;
    return null;
  } catch {
    return null;
  }
}

function ensureDict(data) {
  if (Array.isArray(data)) {
    const dict = {};
    for (const item of data) {
      if (item && item.id) dict[item.id] = item;
    }
    return dict;
  }
  return data || {};
}

/**
 * Load all game data. Uses admin localStorage data if available,
 * otherwise falls back to hardcoded defaults.
 * Call this once at game start (PreloadScene).
 */
export function loadGameData() {
  if (_cache) return _cache;

  const admin = getAdminData();

  if (admin) {
    console.log('[GameDataLoader] Loading from admin data (localStorage)');
    _cache = {
      items: ensureDict(admin.items),
      skills: ensureDict(admin.skills),
      monsters: ensureDict(admin.monsters),
      skillCombinations: admin.skillCombinations || [...DEFAULT_SKILL_COMBINATIONS],
      playerDefaults: admin.gameSettings?.startingStats || { ...DEFAULT_PLAYER_STATS },
      levelUpGains: admin.statsConfig?.levelUpGrowth || { ...LEVEL_UP_GAINS },
      defaultInventory: [...DEFAULT_INVENTORY],
      defaultStartingSkills: [...DEFAULT_STARTING_SKILLS],
      defaultSkillSlots: [...DEFAULT_SKILL_SLOTS],
      spawnConfig: admin.spawnConfig || { ...SPAWN_CONFIG },
      mainCharacter: admin.mainCharacter || null,
      gameSettings: admin.gameSettings || null,
      statsConfig: admin.statsConfig || null,
      systemModules: admin.systemModules || [...DEFAULT_SYSTEM_MODULES],
      tableCatalog: admin.tableCatalog || [...DEFAULT_TABLE_CATALOG],
      statDefinitions: admin.statDefinitions || [...DEFAULT_STAT_DEFINITIONS],
      combatActions: admin.combatActions || [...DEFAULT_COMBAT_ACTIONS],
      hitboxTemplates: admin.hitboxTemplates || [...DEFAULT_HITBOX_TEMPLATES],
      formulas: admin.formulas || [...DEFAULT_FORMULAS],
    };
  } else {
    console.log('[GameDataLoader] Loading from default data (no admin data found)');
    _cache = {
      items: { ...DEFAULT_ITEMS_BY_ID },
      skills: { ...DEFAULT_SKILLS_BY_ID },
      monsters: { ...DEFAULT_MONSTERS_BY_ID },
      skillCombinations: [...DEFAULT_SKILL_COMBINATIONS],
      playerDefaults: { ...DEFAULT_PLAYER_STATS },
      levelUpGains: { ...LEVEL_UP_GAINS },
      defaultInventory: [...DEFAULT_INVENTORY],
      defaultStartingSkills: [...DEFAULT_STARTING_SKILLS],
      defaultSkillSlots: [...DEFAULT_SKILL_SLOTS],
      spawnConfig: { ...SPAWN_CONFIG },
      mainCharacter: { id: 'main_character', name: 'Main Character', nameKo: '메인 캐릭터', spriteKey: 'player_base' },
      gameSettings: null,
      statsConfig: null,
      systemModules: [...DEFAULT_SYSTEM_MODULES],
      tableCatalog: [...DEFAULT_TABLE_CATALOG],
      statDefinitions: [...DEFAULT_STAT_DEFINITIONS],
      combatActions: [...DEFAULT_COMBAT_ACTIONS],
      hitboxTemplates: [...DEFAULT_HITBOX_TEMPLATES],
      formulas: [...DEFAULT_FORMULAS],
    };
  }

  return _cache;
}

/**
 * Force reload data (e.g. after admin panel changes).
 */
export function reloadGameData() {
  _cache = null;
  return loadGameData();
}

/**
 * Get cached data (must call loadGameData first).
 */
export function getGameData() {
  if (!_cache) return loadGameData();
  return _cache;
}

// Icon mapping by weapon type
const WEAPON_TYPE_ICON = {
  SWORD: 'icon_sword', BLADE: 'icon_blade', SPEAR: 'icon_spear',
  STAFF: 'icon_staff', HIDDEN: 'icon_hidden', WHIP: 'icon_whip',
  FIST: 'icon_fist', EXOTIC: 'icon_exotic',
};

// Icon mapping by equipment slot
const SLOT_ICON = {
  WEAPON: 'icon_sword', SHIELD: 'icon_shield',
  HELMET: 'icon_helmet', ARMOR: 'icon_armor',
  PANTS: 'icon_pants', SHOES: 'icon_shoes',
  GLOVES: 'icon_gloves', BELT: 'icon_belt',
  RING_RIGHT: 'icon_ring', RING_LEFT: 'icon_ring',
  NECKLACE: 'icon_necklace', TALISMAN: 'icon_talisman',
  JADE_TOKEN: 'icon_jade',
};

// Consumable icons by item id pattern
const CONSUMABLE_ICON = {
  consumable_hp_001: 'icon_potion',
};

/**
 * Get the best icon key for an item, based on its data.
 * Priority: item.spriteKey → item.iconKey → type/slot-specific → fallback
 */
export function getItemIconKey(itemData) {
  if (!itemData) return 'icon_potion';
  // Custom sprite from admin
  if (itemData.spriteKey) return itemData.spriteKey;
  if (itemData.iconKey) return itemData.iconKey;
  // Weapon: by weaponType
  if (itemData.slot === 'WEAPON' && itemData.weaponType) {
    return WEAPON_TYPE_ICON[itemData.weaponType] || 'icon_sword';
  }
  // Equipment: by slot
  if (itemData.slot) {
    return SLOT_ICON[itemData.slot] || 'icon_armor';
  }
  // Consumable: by id or generic
  if (itemData.type === 'CONSUMABLE') {
    return CONSUMABLE_ICON[itemData.id] || 'icon_potion';
  }
  // Material
  if (itemData.type === 'MATERIAL') return 'icon_material';
  // Fallback
  return 'icon_potion';
}
