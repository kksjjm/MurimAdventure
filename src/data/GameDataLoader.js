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
  DEFAULT_NPCS,
  DEFAULT_SHOPS,
} from './defaultData.js';
import { getAllMaps } from '../game/data/mapData.js';

const ADMIN_STORAGE_KEY = 'moduRpg_adminData_v2';
const REQUIRED_MAP_EDITOR_VERSION = 4;
const MAP_ID_ALIASES = {
  map_arpg_test_field: 'field_01',
  arpg_test_field: 'field_01',
};

// Cached loaded data (shared across game scenes)
let _cache = null;

export function normalizeMapId(mapId) {
  const id = String(mapId || '').trim();
  return MAP_ID_ALIASES[id] || id;
}

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

function mergeDeep(defaultValue, overrideValue) {
  if (Array.isArray(defaultValue) || Array.isArray(overrideValue)) {
    return overrideValue ?? defaultValue;
  }
  if (defaultValue && typeof defaultValue === 'object') {
    const merged = { ...defaultValue };
    for (const [key, value] of Object.entries(overrideValue || {})) {
      merged[key] = mergeDeep(defaultValue[key], value);
    }
    return merged;
  }
  return overrideValue ?? defaultValue;
}

function mergeDictById(defaults, overrides) {
  const merged = { ...ensureDict(defaults) };
  for (const [id, item] of Object.entries(ensureDict(overrides))) {
    merged[id] = mergeDeep(merged[id] || {}, item);
  }
  return merged;
}

function normalizeBasicAttackImpact(skills) {
  const skill = skills?.skill_basic_attack;
  if (!skill?.impactConfig) return;
  const impact = skill.impactConfig;
  if (impact.hitEffect) {
    impact.hitEffect.rotation = 0;
    impact.hitEffect.rotationDelta = 0;
    impact.hitEffect.dualFirstAngleOffset = 0;
    impact.hitEffect.dualSecondAngleOffset = 0;
  }
  if (impact.whiffEffect) {
    impact.whiffEffect.rotationDelta = 0;
    impact.whiffEffect.rotationByFacing = { right: 0, down: 0, left: 0, up: 0 };
  }
}

function mergeArrayById(defaults, overrides) {
  const merged = new Map();
  for (const item of defaults || []) {
    if (item?.id) merged.set(item.id, { ...item });
  }
  for (const item of overrides || []) {
    if (item?.id) merged.set(item.id, { ...merged.get(item.id), ...item });
  }
  return Array.from(merged.values());
}

function convertGameMapToManagedMap(gameMap) {
  const gameTileToEditor = { 0: 1, 1: 2, 2: 3, 3: 4, 4: 5, 5: 6 };
  const width = gameMap.width || 20;
  const height = gameMap.height || 15;
  const ground = new Array(width * height).fill(1);
  const objects = new Array(width * height).fill(0);
  const collision = new Array(width * height).fill(0);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const gameTile = gameMap.tiles?.[y]?.[x] ?? 0;
      const editorTile = gameTileToEditor[gameTile] ?? 1;
      ground[y * width + x] = editorTile;
      if (editorTile === 4 || editorTile === 5 || editorTile === 6) collision[y * width + x] = 1;
    }
  }

  return {
    id: gameMap.id,
    name: gameMap.nameKo || gameMap.name || gameMap.id,
    width,
    height,
    tileSize: 32,
    layers: { ground, objects, collision },
    spawnPoints: {
      player: gameMap.spawns?.player ? { ...gameMap.spawns.player } : { x: 1, y: 1 },
      monsters: gameMap.spawns?.monsters ? gameMap.spawns.monsters.map(sp => ({ ...sp })) : [],
      npcs: gameMap.npcs ? gameMap.npcs.map(n => ({ npcId: n.id, x: n.tileX, y: n.tileY })) : [],
      items: [],
      portals: gameMap.portals ? gameMap.portals.map(p => ({ ...p })) : [],
    },
  };
}

function getManagedDefaultMaps() {
  return getAllMaps().map(convertGameMapToManagedMap);
}

function hasUsableLayers(map) {
  const width = Number(map?.width) || 0;
  const height = Number(map?.height) || 0;
  const expectedSize = width * height;
  return expectedSize > 0
    && Array.isArray(map?.layers?.ground)
    && map.layers.ground.length === expectedSize;
}

function normalizePortal(portal) {
  if (!portal) return portal;
  return {
    ...portal,
    targetMap: normalizeMapId(portal.targetMap),
  };
}

function mergeMapsById(adminMaps) {
  const merged = new Map();
  for (const map of getManagedDefaultMaps()) {
    if (map?.id) merged.set(map.id, map);
  }
  for (const map of adminMaps || []) {
    if (!map?.id) continue;
    const mapId = normalizeMapId(map.id);
    const defaultMap = merged.get(mapId) || {};
    const defaultPortals = defaultMap.spawnPoints?.portals || defaultMap.portals || [];
    const adminPortals = map.spawnPoints?.portals || map.portals || [];
    const useAdminLayers = hasUsableLayers(map);
    const spawnPoints = {
      ...(defaultMap.spawnPoints || {}),
      ...(map.spawnPoints || {}),
    };
    if (!Array.isArray(adminPortals) || adminPortals.length === 0) {
      spawnPoints.portals = defaultPortals.map(normalizePortal);
    } else {
      spawnPoints.portals = adminPortals.map(normalizePortal);
    }
    merged.set(mapId, {
      ...defaultMap,
      ...map,
      id: mapId,
      width: useAdminLayers ? map.width : (defaultMap.width || map.width),
      height: useAdminLayers ? map.height : (defaultMap.height || map.height),
      layers: useAdminLayers ? map.layers : defaultMap.layers,
      spawnPoints,
    });
  }
  return Array.from(merged.values());
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
      skills: mergeDictById(DEFAULT_SKILLS_BY_ID, admin.skills),
      monsters: ensureDict(admin.monsters),
      npcs: { ...ensureDict(DEFAULT_NPCS), ...ensureDict(admin.npcs) },
      shops: { ...DEFAULT_SHOPS, ...(admin.shops || {}) },
      maps: admin.mapEditorVersion === REQUIRED_MAP_EDITOR_VERSION
        ? mergeMapsById(Array.isArray(admin.maps) ? admin.maps : [])
        : getManagedDefaultMaps(),
      skillCombinations: admin.skillCombinations || [...DEFAULT_SKILL_COMBINATIONS],
      quests: Array.isArray(admin.quests) ? admin.quests : [],
      events: Array.isArray(admin.events) ? admin.events : [],
      mounts: Array.isArray(admin.mounts) ? admin.mounts : [],
      pets: Array.isArray(admin.pets) ? admin.pets : [],
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
      combatActions: mergeArrayById(DEFAULT_COMBAT_ACTIONS, admin.combatActions),
      hitboxTemplates: mergeArrayById(DEFAULT_HITBOX_TEMPLATES, admin.hitboxTemplates),
      formulas: admin.formulas || [...DEFAULT_FORMULAS],
    };
  } else {
    console.log('[GameDataLoader] Loading from default data (no admin data found)');
    _cache = {
      items: { ...DEFAULT_ITEMS_BY_ID },
      skills: { ...DEFAULT_SKILLS_BY_ID },
      monsters: { ...DEFAULT_MONSTERS_BY_ID },
      npcs: ensureDict(DEFAULT_NPCS),
      shops: { ...DEFAULT_SHOPS },
      maps: getManagedDefaultMaps(),
      skillCombinations: [...DEFAULT_SKILL_COMBINATIONS],
      quests: [],
      events: [],
      mounts: [],
      pets: [],
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

  normalizeBasicAttackImpact(_cache.skills);

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
