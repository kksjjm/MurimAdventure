// =============================================================================
// 무림기행 (Murim Adventure) - Game Configuration & Balance Constants
// =============================================================================

import { PROFICIENCY_LEVELS, ITEM_RARITY } from './constants.js';

// =============================================================================
// PHASER ENGINE CONFIGURATION
// =============================================================================

export const PHASER_CONFIG = Object.freeze({
  type: 'AUTO', // Phaser.AUTO — WebGL with Canvas fallback
  pixelArt: true,
  roundPixels: true,
  antialias: false,
  width: 960,
  height: 540,
  zoom: 1,
  fps: {
    target: 60,
    forceSetTimeOut: false,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      tileBias: 16,
      debug: false,
    },
  },
  // Scene list populated at runtime
  scene: [],
});

// =============================================================================
// TILE & MAP CONFIGURATION
// =============================================================================

export const MAP_CONFIG = Object.freeze({
  TILE_SIZE: 32,
  CHUNK_SIZE_TILES: 32,        // 32x32 tiles per chunk
  RENDER_DISTANCE_CHUNKS: 3,   // chunks visible around camera
  LAYERS: ['ground', 'terrain', 'objects', 'rooftops', 'collision'],
});

// =============================================================================
// LEVEL & EXPERIENCE
// =============================================================================

export const LEVEL_CONFIG = Object.freeze({
  MAX_LEVEL: 99,

  /**
   * Experience required to reach a given level.
   * Formula: baseExp * level^exponent + (level * linearScale)
   * Produces a smooth curve that ramps up steeply at higher levels.
   */
  BASE_EXP: 50,
  EXPONENT: 2.3,
  LINEAR_SCALE: 25,

  /**
   * Death penalty: percentage of current-level exp lost on death
   */
  DEATH_EXP_PENALTY: 0.05,
});

/**
 * Calculate total EXP needed to reach a specific level.
 * @param {number} level - Target level (1-99)
 * @returns {number} Total cumulative EXP required
 */
export function getExpForLevel(level) {
  if (level <= 1) return 0;
  const { BASE_EXP, EXPONENT, LINEAR_SCALE } = LEVEL_CONFIG;
  return Math.floor(BASE_EXP * Math.pow(level, EXPONENT) + level * LINEAR_SCALE);
}

/**
 * Calculate EXP needed to go from currentLevel to currentLevel+1.
 * @param {number} currentLevel
 * @returns {number}
 */
export function getExpToNextLevel(currentLevel) {
  return getExpForLevel(currentLevel + 1) - getExpForLevel(currentLevel);
}

// =============================================================================
// BASE STAT GROWTH PER LEVEL
// =============================================================================

export const STAT_GROWTH = Object.freeze({
  /** Fixed stat gains applied automatically each level-up */
  PER_LEVEL: {
    HP: 12,
    MP: 8,
    STR: 1,
    AGI: 1,
    INT: 1,
    DEF: 1,
    SPIRIT: 1,
  },

  /** Bonus stat points the player may freely distribute each level-up */
  FREE_POINTS_PER_LEVEL: 3,

  /** Starting stats for a new character at level 1 */
  BASE_STATS: {
    HP: 100,
    MP: 50,
    STR: 5,
    AGI: 5,
    INT: 5,
    LUK: 3,
    DEF: 3,
    ATK: 5,
    EVASION: 3,
    ACCURACY: 75,
    CRIT_RATE: 2,
    CRIT_DMG: 150,  // percent (1.5x)
    SPIRIT: 5,
    ITEM_FIND: 0,
    MOVE_SPEED: 100, // pixels per second base
    ATK_SPEED: 100,  // percent of base animation speed
  },
});

// =============================================================================
// COMBAT FORMULAS
// =============================================================================

export const COMBAT_CONFIG = Object.freeze({
  /**
   * Physical damage formula:
   *   rawDmg = skillBaseDmg + (ATK * atkMultiplier) + (STR * strMultiplier)
   *   finalDmg = rawDmg * (100 / (100 + target.DEF * defReduction))
   */
  PHYSICAL: {
    atkMultiplier: 1.2,
    strMultiplier: 0.5,
    defReduction: 0.8,
  },

  /**
   * Magical damage formula:
   *   rawDmg = skillBaseDmg + (ATK * atkMultiplier) + (INT * intMultiplier)
   *   finalDmg = rawDmg * (100 / (100 + target.SPIRIT * spiritReduction))
   */
  MAGICAL: {
    atkMultiplier: 0.4,
    intMultiplier: 1.5,
    spiritReduction: 0.6,
  },

  /**
   * True damage ignores all defenses — final = rawDmg
   */

  /**
   * Hit / Evasion check:
   *   hitChance = clamp(ACCURACY - target.EVASION + baseHitRate, minHit, maxHit)
   */
  HIT_CHECK: {
    baseHitRate: 80,  // percent
    minHitChance: 5,
    maxHitChance: 99,
  },

  /**
   * Critical hit:
   *   if random(0,100) < CRIT_RATE → dmg *= CRIT_DMG / 100
   */
  CRIT: {
    baseCritRate: 2,   // percent
    baseCritDmg: 150,  // percent (1.5x)
    maxCritRate: 80,
  },

  /**
   * Elemental effectiveness multipliers
   * Stored as attacker_element -> defender_weakness -> multiplier
   */
  ELEMENTAL_TABLE: {
    FIRE:      { ICE: 1.5, WIND: 0.75, EARTH: 1.25 },
    ICE:       { FIRE: 0.75, LIGHTNING: 1.25, WIND: 1.5 },
    LIGHTNING: { ICE: 0.75, EARTH: 0.5, WIND: 1.5 },
    WIND:      { LIGHTNING: 0.75, EARTH: 1.5, FIRE: 1.25 },
    EARTH:     { WIND: 0.75, LIGHTNING: 2.0, FIRE: 0.75 },
    DARK:      { LIGHT: 1.5, POISON: 0.75 },
    LIGHT:     { DARK: 1.5, POISON: 1.25 },
    POISON:    { LIGHT: 0.75, DARK: 1.25 },
  },
  ELEMENTAL_NEUTRAL: 1.0,

  /** Minimum damage floor — attacks always deal at least this much */
  MIN_DAMAGE: 1,

  /** Level difference scaling: damage modifier per level gap */
  LEVEL_DIFF_SCALE: 0.03, // 3% per level difference

  /** Maximum level-difference penalty cap */
  LEVEL_DIFF_CAP: 0.5, // 50% max reduction
});

// =============================================================================
// PROFICIENCY GAIN RATES
// =============================================================================

export const PROFICIENCY_CONFIG = Object.freeze({
  /**
   * Base proficiency gain per skill use.
   * Actual gain = skill.proficiencyGain * skillUseMultiplier * combatMultiplier
   */
  SKILL_USE_MULTIPLIER: 1.0,

  /**
   * Multiplier when fighting monsters near or above your level.
   * The gain scales with (monsterLevel / playerLevel).
   */
  COMBAT_LEVEL_SCALING: true,
  COMBAT_MIN_MULTIPLIER: 0.1,   // fighting much weaker enemies
  COMBAT_MAX_MULTIPLIER: 2.0,   // fighting much stronger enemies

  /**
   * Passive proficiency gain rate for equipped simbeop (심법).
   * Gains proficiency points every N seconds of real time while equipped.
   */
  SIMBEOP_PASSIVE_INTERVAL: 60000, // 60 seconds
  SIMBEOP_PASSIVE_GAIN: 1,

  /**
   * Proficiency gain reduction at higher proficiency tiers.
   * Prevents rapid mastery of already high-level skills.
   */
  DIMINISHING_RETURNS: {
    BEGINNER: 1.0,
    INTERMEDIATE: 0.9,
    ADVANCED: 0.75,
    EXPERT: 0.55,
    MASTER: 0.35,
    GRANDMASTER: 0.2,
    TRANSCENDENT: 0.1,
  },
});

/**
 * Calculate effective proficiency gain for a skill use.
 * @param {number} baseGain - The skill's proficiencyGain value
 * @param {number} currentProficiency - Player's current proficiency in this skill
 * @param {number} playerLevel - Player's character level
 * @param {number} monsterLevel - Monster's level (0 for non-combat)
 * @returns {number} Effective proficiency gained
 */
export function calculateProficiencyGain(baseGain, currentProficiency, playerLevel, monsterLevel = 0) {
  const { SKILL_USE_MULTIPLIER, COMBAT_LEVEL_SCALING, COMBAT_MIN_MULTIPLIER, COMBAT_MAX_MULTIPLIER, DIMINISHING_RETURNS } = PROFICIENCY_CONFIG;

  // Determine diminishing returns tier
  let tierKey = 'BEGINNER';
  const levels = Object.values(PROFICIENCY_LEVELS);
  for (let i = levels.length - 1; i >= 0; i--) {
    if (currentProficiency >= levels[i].threshold) {
      tierKey = levels[i].key;
      break;
    }
  }
  const dimReturn = DIMINISHING_RETURNS[tierKey] ?? 1.0;

  // Combat level scaling
  let combatMult = 1.0;
  if (COMBAT_LEVEL_SCALING && monsterLevel > 0 && playerLevel > 0) {
    combatMult = Math.min(
      COMBAT_MAX_MULTIPLIER,
      Math.max(COMBAT_MIN_MULTIPLIER, monsterLevel / playerLevel)
    );
  }

  return Math.max(1, Math.floor(baseGain * SKILL_USE_MULTIPLIER * combatMult * dimReturn));
}

// =============================================================================
// DROP RATE & LOOT
// =============================================================================

export const LOOT_CONFIG = Object.freeze({
  /**
   * Base drop chance multiplier applied globally.
   */
  GLOBAL_DROP_MULTIPLIER: 1.0,

  /**
   * ITEM_FIND stat influence:
   *   effectiveDropChance = baseChance * (1 + ITEM_FIND * itemFindScale / 100)
   */
  ITEM_FIND_SCALE: 0.5, // each point of ITEM_FIND adds 0.5% to drop chance

  /**
   * Rarity roll weights (used when an item drops without a specific rarity).
   * These are relative weights — higher = more common.
   */
  RARITY_WEIGHTS: {
    COMMON: 1000,
    UNCOMMON: 500,
    RARE: 200,
    EPIC: 50,
    LEGENDARY: 10,
    MYTHIC: 1,
  },

  /**
   * Gold drop formula:
   *   gold = random(monster.goldReward.min, monster.goldReward.max) * goldMultiplier
   *   Scaled by 1 + (LUK * luckGoldScale / 100)
   */
  GOLD_MULTIPLIER: 1.0,
  LUCK_GOLD_SCALE: 0.3, // each LUK point adds 0.3% gold

  /**
   * Maximum items that can drop from a single monster kill
   */
  MAX_DROPS_PER_KILL: 4,
});

/**
 * Roll for item drops from a defeated monster.
 * @param {object} monster - Monster definition with drops[]
 * @param {number} playerItemFind - Player's ITEM_FIND stat
 * @param {number} playerLuk - Player's LUK stat
 * @returns {{ items: string[], gold: number }} Dropped item IDs and gold amount
 */
export function rollDrops(monster, playerItemFind = 0, playerLuk = 0) {
  const { GLOBAL_DROP_MULTIPLIER, ITEM_FIND_SCALE, LUCK_GOLD_SCALE, GOLD_MULTIPLIER, MAX_DROPS_PER_KILL } = LOOT_CONFIG;

  const itemFindBonus = 1 + (playerItemFind * ITEM_FIND_SCALE / 100);
  const droppedItems = [];

  for (const drop of monster.drops) {
    if (droppedItems.length >= MAX_DROPS_PER_KILL) break;
    const effectiveChance = drop.chance * GLOBAL_DROP_MULTIPLIER * itemFindBonus;
    if (Math.random() < effectiveChance) {
      droppedItems.push(drop.itemId);
    }
  }

  // Gold calculation
  const { min, max } = monster.goldReward;
  const baseGold = Math.floor(Math.random() * (max - min + 1)) + min;
  const goldBonus = 1 + (playerLuk * LUCK_GOLD_SCALE / 100);
  const finalGold = Math.floor(baseGold * GOLD_MULTIPLIER * goldBonus);

  return { items: droppedItems, gold: finalGold };
}

// =============================================================================
// MOVEMENT & PHYSICS
// =============================================================================

export const MOVEMENT_CONFIG = Object.freeze({
  BASE_SPEED: 100,           // pixels per second
  SPRINT_MULTIPLIER: 1.5,
  SPRINT_MP_COST_PER_SEC: 3, // MP drained while sprinting
  DIAGONAL_FACTOR: 0.7071,   // 1/sqrt(2) for diagonal normalization
  DASH_COOLDOWN: 500,        // ms between dash inputs
});

// =============================================================================
// WORLD / DAY-NIGHT CYCLE
// =============================================================================

export const WORLD_CONFIG = Object.freeze({
  /** Day-night cycle duration in real-time milliseconds */
  DAY_CYCLE_DURATION: 600000, // 10 minutes = one full in-game day

  /** Time-of-day phases (fraction of cycle) */
  TIME_PHASES: {
    DAWN:  { start: 0.0,  end: 0.15, tint: 0xffccaa, nameKo: '새벽' },
    DAY:   { start: 0.15, end: 0.55, tint: 0xffffff, nameKo: '낮' },
    DUSK:  { start: 0.55, end: 0.7,  tint: 0xff9966, nameKo: '황혼' },
    NIGHT: { start: 0.7,  end: 1.0,  tint: 0x4466aa, nameKo: '밤' },
  },

  /** Monster spawn rate multiplier at night */
  NIGHT_SPAWN_MULTIPLIER: 1.5,

  /** Weather types and their effects */
  WEATHER: {
    CLEAR:  { key: 'CLEAR',  nameKo: '맑음',   movePenalty: 0,   visibilityMod: 1.0 },
    RAIN:   { key: 'RAIN',   nameKo: '비',     movePenalty: -5,  visibilityMod: 0.8 },
    STORM:  { key: 'STORM',  nameKo: '폭풍',   movePenalty: -15, visibilityMod: 0.5 },
    FOG:    { key: 'FOG',    nameKo: '안개',   movePenalty: 0,   visibilityMod: 0.4 },
    SNOW:   { key: 'SNOW',   nameKo: '눈',     movePenalty: -10, visibilityMod: 0.7 },
  },
});

// =============================================================================
// UI CONFIGURATION
// =============================================================================

export const UI_CONFIG = Object.freeze({
  /** Floating damage numbers */
  DAMAGE_NUMBER: {
    fontSize: 10,
    fontFamily: 'DungGeunMo, monospace',
    duration: 800,
    riseDistance: 30,
    critFontSize: 14,
    colors: {
      PHYSICAL: '#ffffff',
      MAGICAL: '#88ccff',
      TRUE: '#ffaa00',
      HEAL: '#44ff44',
      CRIT: '#ff4444',
    },
  },

  /** Inventory grid */
  INVENTORY: {
    rows: 6,
    cols: 8,
    slotSize: 32,
  },

  /** Health / MP bar dimensions */
  STATUS_BARS: {
    width: 120,
    height: 10,
    hpColor: 0xcc2222,
    mpColor: 0x2255cc,
    bgColor: 0x222222,
    borderColor: 0x444444,
  },

  /** Chat / dialogue */
  DIALOGUE: {
    textSpeed: 30,        // ms per character
    maxVisibleLines: 4,
    boxPadding: 8,
  },
});

// =============================================================================
// SAVE / SERIALIZATION
// =============================================================================

export const SAVE_CONFIG = Object.freeze({
  STORAGE_KEY: 'murim_adventure_save',
  AUTO_SAVE_INTERVAL: 120000, // 2 minutes
  MAX_SAVE_SLOTS: 3,
  VERSION: 1,
});
