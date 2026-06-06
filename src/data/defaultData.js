// =============================================================================
// 무림기행 (Murim Adventure) - Default / Sample Game Data
// =============================================================================

import {
  STATS, EQUIPMENT_SLOTS, WEAPON_TYPES, WEAPON_GRIP, SKILL_CATEGORIES,
  MUGONG_TYPES, JUSUL_TYPES, ITEM_RARITY, ELEMENT_TYPES,
  AI_BEHAVIOR, ITEM_TYPES, EFFECT_TYPES, DAMAGE_TYPES,
} from './constants.js';

// =============================================================================
// ITEMS - Weapons
// =============================================================================

export const DEFAULT_WEAPONS = Object.freeze([
  {
    id: 'wpn_iron_sword',
    name: 'Iron Sword',
    nameKo: '철검',
    description: '흔하게 쓰이는 무림의 기본 검. 가볍고 다루기 쉽다.',
    type: ITEM_TYPES.WEAPON.key,
    slot: EQUIPMENT_SLOTS.WEAPON.key,
    weaponType: WEAPON_TYPES.SWORD.key,
    weaponGrip: WEAPON_GRIP.ONE_HANDED.key,
    rarity: ITEM_RARITY.GRADE_13.key,
    levelReq: 1,
    baseATK: 8, baseATK_SPEED: 105, baseRange: 45,
    stats: {},
  },
  {
    id: 'wpn_crescent_blade',
    name: 'Crescent Moon Blade',
    nameKo: '언월도',
    description: '반달 모양의 날이 달린 도. 강력하지만 느리다.',
    type: ITEM_TYPES.WEAPON.key,
    slot: EQUIPMENT_SLOTS.WEAPON.key,
    weaponType: WEAPON_TYPES.BLADE.key,
    weaponGrip: WEAPON_GRIP.TWO_HANDED.key,
    rarity: ITEM_RARITY.GRADE_11.key,
    levelReq: 8,
    baseATK: 22, baseATK_SPEED: 85, baseRange: 55,
    stats: { STR: 3, CRIT_DMG: 10 },
  },
  {
    id: 'wpn_twin_daggers',
    name: 'Shadow Twin Daggers',
    nameKo: '그림자 쌍단도',
    description: '암흑 속에서 벼려진 한 쌍의 단도. 빠르고 치명적이다.',
    type: ITEM_TYPES.WEAPON.key,
    slot: EQUIPMENT_SLOTS.WEAPON.key,
    weaponType: WEAPON_TYPES.BLADE.key,
    weaponGrip: WEAPON_GRIP.DUAL_WIELD.key,
    rarity: ITEM_RARITY.GRADE_9.key,
    levelReq: 15,
    baseATK: 16, baseATK_SPEED: 130, baseRange: 35,
    stats: { AGI: 7, CRIT_RATE: 8, EVASION: 3 },
  },
  {
    id: 'wpn_heaven_sword',
    name: 'Heavenly Demon Sword',
    nameKo: '천마검',
    description: '천마신교에서 전해지는 마검. 사용자의 내공을 증폭시킨다.',
    type: ITEM_TYPES.WEAPON.key,
    slot: EQUIPMENT_SLOTS.WEAPON.key,
    weaponType: WEAPON_TYPES.SWORD.key,
    weaponGrip: WEAPON_GRIP.ONE_HANDED.key,
    rarity: ITEM_RARITY.GRADE_6.key,
    levelReq: 30,
    baseATK: 38, baseATK_SPEED: 110, baseRange: 50,
    stats: { INT: 12, MP: 80, CRIT_RATE: 5, CRIT_DMG: 20 },
  },
  {
    id: 'wpn_dragon_spear',
    name: 'Azure Dragon Spear',
    nameKo: '청룡창',
    description: '전설의 명장이 용의 뼈로 단조한 창. 찌르는 순간 용의 기운이 폭발한다.',
    type: ITEM_TYPES.WEAPON.key,
    slot: EQUIPMENT_SLOTS.WEAPON.key,
    weaponType: WEAPON_TYPES.SPEAR.key,
    weaponGrip: WEAPON_GRIP.TWO_HANDED.key,
    rarity: ITEM_RARITY.GRADE_4.key,
    levelReq: 45,
    baseATK: 65, baseATK_SPEED: 80, baseRange: 70,
    stats: { STR: 15, AGI: 8, ACCURACY: 12, CRIT_RATE: 10, CRIT_DMG: 35 },
  },
  {
    id: 'wpn_void_fan',
    name: 'Void Silk Fan',
    nameKo: '허공선',
    description: '공간을 가르는 신비로운 부채. 내가무공에 특화된 무기.',
    type: ITEM_TYPES.WEAPON.key,
    slot: EQUIPMENT_SLOTS.WEAPON.key,
    weaponType: WEAPON_TYPES.EXOTIC.key,
    weaponGrip: WEAPON_GRIP.ONE_HANDED.key,
    rarity: ITEM_RARITY.GRADE_8.key,
    levelReq: 20,
    baseATK: 12, baseATK_SPEED: 115, baseRange: 60,
    stats: { INT: 18, MP: 120, SPIRIT: 10 },
  },
  {
    id: 'wpn_iron_staff',
    name: 'Iron Staff',
    nameKo: '철봉',
    description: '무거운 철로 만든 봉. 타격 범위가 넓고 방어에도 유리하다.',
    type: ITEM_TYPES.WEAPON.key,
    slot: EQUIPMENT_SLOTS.WEAPON.key,
    weaponType: WEAPON_TYPES.STAFF.key,
    weaponGrip: WEAPON_GRIP.TWO_HANDED.key,
    rarity: ITEM_RARITY.GRADE_12.key,
    levelReq: 1,
    baseATK: 10, baseATK_SPEED: 90, baseRange: 55,
    stats: { DEF: 3 },
  },
  {
    id: 'wpn_throwing_needles',
    name: 'Poison Needles',
    nameKo: '독침',
    description: '독을 바른 미세한 암기. 빠르고 은밀하다.',
    type: ITEM_TYPES.WEAPON.key,
    slot: EQUIPMENT_SLOTS.WEAPON.key,
    weaponType: WEAPON_TYPES.HIDDEN.key,
    weaponGrip: WEAPON_GRIP.ONE_HANDED.key,
    rarity: ITEM_RARITY.GRADE_10.key,
    levelReq: 10,
    baseATK: 10, baseATK_SPEED: 140, baseRange: 100,
    stats: { AGI: 5, CRIT_RATE: 6 },
  },
  {
    id: 'wpn_chain_whip',
    name: 'Nine Section Whip',
    nameKo: '구절편',
    description: '아홉 마디로 이어진 연환편. 예측 불허의 궤도를 그린다.',
    type: ITEM_TYPES.WEAPON.key,
    slot: EQUIPMENT_SLOTS.WEAPON.key,
    weaponType: WEAPON_TYPES.WHIP.key,
    weaponGrip: WEAPON_GRIP.ONE_HANDED.key,
    rarity: ITEM_RARITY.GRADE_9.key,
    levelReq: 18,
    baseATK: 18, baseATK_SPEED: 100, baseRange: 65,
    stats: { AGI: 4, ACCURACY: 8 },
  },
  {
    id: 'wpn_iron_fist',
    name: 'Vajra Gauntlets',
    nameKo: '금강권갑',
    description: '금강석으로 강화된 권갑. 주먹에 파괴력을 더한다.',
    type: ITEM_TYPES.WEAPON.key,
    slot: EQUIPMENT_SLOTS.WEAPON.key,
    weaponType: WEAPON_TYPES.FIST.key,
    weaponGrip: WEAPON_GRIP.DUAL_WIELD.key,
    rarity: ITEM_RARITY.GRADE_11.key,
    levelReq: 5,
    baseATK: 12, baseATK_SPEED: 125, baseRange: 30,
    stats: { STR: 4, CRIT_RATE: 3 },
  },
]);

// =============================================================================
// ITEMS - Armor
// =============================================================================

export const DEFAULT_ARMOR = Object.freeze([
  {
    id: 'arm_leather_armor',
    name: 'Leather Martial Robe',
    nameKo: '가죽 무복',
    description: '가죽으로 만든 기본적인 무복. 움직임을 방해하지 않는다.',
    type: ITEM_TYPES.ARMOR.key,
    slot: EQUIPMENT_SLOTS.ARMOR.key,
    rarity: ITEM_RARITY.GRADE_13.key,
    levelReq: 1,
    baseDEF: 5,
    stats: { HP: 20 },
  },
  {
    id: 'arm_iron_helmet',
    name: 'Iron Headband',
    nameKo: '철제 두건',
    description: '단단한 철로 만든 두건. 머리를 보호한다.',
    type: ITEM_TYPES.ARMOR.key,
    slot: EQUIPMENT_SLOTS.HELMET.key,
    rarity: ITEM_RARITY.GRADE_11.key,
    levelReq: 5,
    baseDEF: 8,
    stats: { HP: 30, SPIRIT: 2 },
  },
  {
    id: 'arm_wind_shoes',
    name: 'Wind-Treading Boots',
    nameKo: '답풍화',
    description: '바람을 밟는 듯 가벼운 신발. 경공 수련에 적합하다.',
    type: ITEM_TYPES.ARMOR.key,
    slot: EQUIPMENT_SLOTS.SHOES.key,
    rarity: ITEM_RARITY.GRADE_9.key,
    levelReq: 12,
    baseDEF: 4,
    stats: { AGI: 10, MOVE_SPEED: 15, EVASION: 6 },
    proficiencyBonus: { category: SKILL_CATEGORIES.GYEONGGONG.key, amount: 3 },
  },
  {
    id: 'arm_golden_armor',
    name: 'Golden Silk Armor',
    nameKo: '금잠갑',
    description: '금잠사로 짠 전설의 연갑. 가벼우면서도 모든 공격을 막아낸다.',
    type: ITEM_TYPES.ARMOR.key,
    slot: EQUIPMENT_SLOTS.ARMOR.key,
    rarity: ITEM_RARITY.GRADE_5.key,
    levelReq: 40,
    baseDEF: 45,
    stats: { HP: 200, EVASION: 8, SPIRIT: 12 },
    proficiencyBonus: { category: SKILL_CATEGORIES.SIMBEOP.key, amount: 5 },
  },
]);

// =============================================================================
// ITEMS - Accessories
// =============================================================================

export const DEFAULT_ACCESSORIES = Object.freeze([
  {
    id: 'acc_jade_ring',
    name: 'Jade Qi Ring',
    nameKo: '기옥 반지',
    description: '내공의 흐름을 원활하게 해주는 옥반지.',
    type: ITEM_TYPES.ACCESSORY.key,
    slot: EQUIPMENT_SLOTS.RING_RIGHT.key,
    rarity: ITEM_RARITY.GRADE_11.key,
    levelReq: 5,
    stats: {
      MP: 50,
      INT: 3,
      SPIRIT: 2,
    },
    proficiencyBonus: { category: SKILL_CATEGORIES.SIMBEOP.key, amount: 1 },
  },
  {
    id: 'acc_tiger_necklace',
    name: 'White Tiger Fang Necklace',
    nameKo: '백호아 목걸이',
    description: '백호의 이빨로 만든 목걸이. 착용자에게 맹수의 기운을 부여한다.',
    type: ITEM_TYPES.ACCESSORY.key,
    slot: EQUIPMENT_SLOTS.NECKLACE.key,
    rarity: ITEM_RARITY.GRADE_9.key,
    levelReq: 18,
    stats: {
      STR: 8,
      ATK: 6,
      CRIT_RATE: 4,
      CRIT_DMG: 12,
    },
    proficiencyBonus: null,
  },
  {
    id: 'acc_fortune_talisman',
    name: 'Fortune Talisman',
    nameKo: '행운의 부적',
    description: '기이한 문양이 새겨진 부적. 행운을 불러온다고 전해진다.',
    type: ITEM_TYPES.ACCESSORY.key,
    slot: EQUIPMENT_SLOTS.TALISMAN.key,
    rarity: ITEM_RARITY.GRADE_9.key,
    levelReq: 10,
    stats: {
      LUK: 15,
      ITEM_FIND: 10,
      EVASION: 3,
    },
    proficiencyBonus: null,
  },
  {
    id: 'acc_sect_jade_token',
    name: 'Wudang Sect Jade Token',
    nameKo: '무당파 옥패',
    description: '무당파의 신분을 증명하는 옥패. 내공 수련에 큰 도움이 된다.',
    type: ITEM_TYPES.ACCESSORY.key,
    slot: EQUIPMENT_SLOTS.JADE_TOKEN.key,
    rarity: ITEM_RARITY.GRADE_7.key,
    levelReq: 25,
    stats: {
      MP: 150,
      INT: 10,
      SPIRIT: 15,
      HP: 50,
    },
    proficiencyBonus: { category: SKILL_CATEGORIES.SIMBEOP.key, amount: 4 },
  },
]);

// =============================================================================
// SKILLS - 심법 (Simbeop / Heart Methods - Passive)
// =============================================================================

export const DEFAULT_SKILLS_SIMBEOP = Object.freeze([
  {
    id: 'skill_taichi_simbeop',
    name: 'Taichi Heart Method',
    nameKo: '태극심법',
    description: '태극의 원리에 따라 내공을 순환시키는 심법. 내력 회복 속도를 높인다.',
    category: SKILL_CATEGORIES.SIMBEOP.key,
    type: null,
    isActive: false,
    mpCost: 0,
    hpCost: 0,
    cooldown: 0,
    baseDamage: 0,
    element: ELEMENT_TYPES.NONE.key,
    damageType: null,
    effects: [
      { type: EFFECT_TYPES.STAT_BUFF.key, stat: 'MP', value: 100, isPercent: false },
      { type: EFFECT_TYPES.HOT.key, target: 'MP', valuePerTick: 2, tickInterval: 3000, description: '3초마다 내력 2 회복' },
    ],
    proficiencyGain: 1,
  },
  {
    id: 'skill_iron_body',
    name: 'Iron Body Cultivation',
    nameKo: '철체공',
    description: '전신을 강철처럼 단련하는 심법. 방어력과 체력이 크게 증가한다.',
    category: SKILL_CATEGORIES.SIMBEOP.key,
    type: null,
    isActive: false,
    mpCost: 0,
    hpCost: 0,
    cooldown: 0,
    baseDamage: 0,
    element: ELEMENT_TYPES.NONE.key,
    damageType: null,
    effects: [
      { type: EFFECT_TYPES.STAT_BUFF.key, stat: 'DEF', value: 15, isPercent: true },
      { type: EFFECT_TYPES.STAT_BUFF.key, stat: 'HP', value: 200, isPercent: false },
      { type: EFFECT_TYPES.STAT_BUFF.key, stat: 'MOVE_SPEED', value: -5, isPercent: true },
    ],
    proficiencyGain: 1,
  },
  {
    id: 'skill_ungi_josik',
    name: 'Qi Breathing Meditation',
    nameKo: '운기조식',
    description: '내공을 고르게 순환시켜 빠르게 내력을 회복한다. 시전 중 초당 최대 내력의 10%를 회복한다.',
    category: SKILL_CATEGORIES.SIMBEOP.key,
    type: null,
    isActive: true,
    mpCost: 0,
    hpCost: 0,
    cooldown: 30000,
    baseDamage: 0,
    element: ELEMENT_TYPES.NONE.key,
    damageType: null,
    duration: 8000,
    effects: [
      { type: 'CHANNEL_REGEN', stat: 'MP', percentPerSec: 10, duration: 8000, description: '8초간 초당 최대 내력의 10% 회복' },
    ],
    proficiencyGain: 3,
  },
]);

// =============================================================================
// SKILLS - 내가무공 (Internal Martial Arts - Magic-based)
// =============================================================================

export const DEFAULT_SKILLS_INTERNAL = Object.freeze([
  {
    id: 'skill_qiwave',
    name: 'Qi Wave Palm',
    nameKo: '기파장',
    description: '내공을 응축하여 장풍을 발사한다. 원거리 공격.',
    category: SKILL_CATEGORIES.MUGONG.key,
    type: MUGONG_TYPES.INTERNAL.key,
    isActive: true,
    mpCost: 15,
    hpCost: 0,
    cooldown: 2000,
    baseDamage: 25,
    element: ELEMENT_TYPES.NONE.key,
    damageType: DAMAGE_TYPES.MAGICAL.key,
    range: 200,
    effects: [
      { type: EFFECT_TYPES.DAMAGE.key, scaling: { INT: 0.8, STR: 0.2 } },
      { type: EFFECT_TYPES.KNOCKBACK.key, distance: 30 },
    ],
    proficiencyGain: 3,
  },
  {
    id: 'skill_frozen_meridian',
    name: 'Frozen Meridian Strike',
    nameKo: '빙결맥타',
    description: '얼음 기운을 담은 장타로 적의 경맥을 얼린다.',
    category: SKILL_CATEGORIES.MUGONG.key,
    type: MUGONG_TYPES.INTERNAL.key,
    isActive: true,
    mpCost: 30,
    hpCost: 0,
    cooldown: 5000,
    baseDamage: 40,
    element: ELEMENT_TYPES.ICE.key,
    damageType: DAMAGE_TYPES.MAGICAL.key,
    range: 80,
    effects: [
      { type: EFFECT_TYPES.DAMAGE.key, scaling: { INT: 1.2 } },
      { type: EFFECT_TYPES.STAT_DEBUFF.key, stat: 'ATK_SPEED', value: -30, isPercent: true, duration: 4000 },
      { type: EFFECT_TYPES.STAT_DEBUFF.key, stat: 'MOVE_SPEED', value: -20, isPercent: true, duration: 4000 },
    ],
    proficiencyGain: 4,
  },
  {
    id: 'skill_nine_yang',
    name: 'Nine Yang Divine Art',
    nameKo: '구양신공',
    description: '양기를 극한까지 끌어올려 강력한 내공을 폭발시킨다.',
    category: SKILL_CATEGORIES.MUGONG.key,
    type: MUGONG_TYPES.INTERNAL.key,
    isActive: true,
    mpCost: 60,
    hpCost: 0,
    cooldown: 12000,
    baseDamage: 80,
    element: ELEMENT_TYPES.FIRE.key,
    damageType: DAMAGE_TYPES.MAGICAL.key,
    range: 150,
    effects: [
      { type: EFFECT_TYPES.DAMAGE.key, scaling: { INT: 1.8, SPIRIT: 0.5 } },
      { type: EFFECT_TYPES.DOT.key, element: ELEMENT_TYPES.FIRE.key, damagePerTick: 10, tickInterval: 1000, duration: 5000 },
    ],
    proficiencyGain: 6,
  },
]);

// =============================================================================
// SKILLS - 외가무공 (External Martial Arts - Physical-based)
// =============================================================================

export const DEFAULT_SKILLS_EXTERNAL = Object.freeze([
  {
    id: 'skill_iron_fist',
    name: 'Iron Fist Barrage',
    nameKo: '철권난타',
    description: '강철같은 주먹으로 연속 타격한다.',
    category: SKILL_CATEGORIES.MUGONG.key,
    type: MUGONG_TYPES.EXTERNAL.key,
    isActive: true,
    mpCost: 10,
    hpCost: 0,
    cooldown: 1500,
    baseDamage: 18,
    element: ELEMENT_TYPES.NONE.key,
    damageType: DAMAGE_TYPES.PHYSICAL.key,
    range: 40,
    hitCount: 3,
    effects: [
      { type: EFFECT_TYPES.DAMAGE.key, scaling: { STR: 0.6, AGI: 0.3 } },
    ],
    proficiencyGain: 2,
  },
  {
    id: 'skill_whirlwind_kick',
    name: 'Whirlwind Kick',
    nameKo: '선풍각',
    description: '몸을 회전하며 강력한 발차기를 날린다. 주변 적을 공격.',
    category: SKILL_CATEGORIES.MUGONG.key,
    type: MUGONG_TYPES.EXTERNAL.key,
    isActive: true,
    mpCost: 20,
    hpCost: 0,
    cooldown: 4000,
    baseDamage: 35,
    element: ELEMENT_TYPES.WIND.key,
    damageType: DAMAGE_TYPES.PHYSICAL.key,
    range: 60,
    isAoE: true,
    aoeRadius: 80,
    effects: [
      { type: EFFECT_TYPES.DAMAGE.key, scaling: { STR: 1.0, AGI: 0.5 } },
      { type: EFFECT_TYPES.KNOCKBACK.key, distance: 50 },
    ],
    proficiencyGain: 4,
  },
  {
    id: 'skill_heaven_breaking_slash',
    name: 'Heaven-Breaking Slash',
    nameKo: '파천일검',
    description: '하늘을 가르는 일격. 높은 치명타 확률을 가진다.',
    category: SKILL_CATEGORIES.MUGONG.key,
    type: MUGONG_TYPES.EXTERNAL.key,
    isActive: true,
    mpCost: 35,
    hpCost: 5,
    cooldown: 8000,
    baseDamage: 70,
    element: ELEMENT_TYPES.NONE.key,
    damageType: DAMAGE_TYPES.PHYSICAL.key,
    range: 60,
    effects: [
      { type: EFFECT_TYPES.DAMAGE.key, scaling: { STR: 1.5, AGI: 0.3 } },
      { type: EFFECT_TYPES.STAT_BUFF.key, stat: 'CRIT_RATE', value: 30, isPercent: false, duration: 0, description: '이 공격에 한해 치명타율 +30%' },
    ],
    proficiencyGain: 5,
  },
]);

// =============================================================================
// SKILLS - 경공 (Gyeonggong / Movement Skills)
// =============================================================================

export const DEFAULT_SKILLS_GYEONGGONG = Object.freeze([
  {
    id: 'skill_shadow_step',
    name: 'Shadow Step',
    nameKo: '답영보',
    description: '그림자를 밟듯 빠르게 이동한다. 짧은 거리를 순간이동.',
    category: SKILL_CATEGORIES.GYEONGGONG.key,
    type: null,
    isActive: true,
    mpCost: 12,
    hpCost: 0,
    cooldown: 3000,
    baseDamage: 0,
    element: ELEMENT_TYPES.NONE.key,
    damageType: null,
    dashDistance: 120,
    effects: [
      { type: EFFECT_TYPES.MOVEMENT_BOOST.key, value: 120, unit: 'pixels', description: '전방 순간이동' },
      { type: EFFECT_TYPES.INVINCIBILITY.key, duration: 300, description: '이동 중 무적 0.3초' },
    ],
    proficiencyGain: 3,
  },
  {
    id: 'skill_cloud_walk',
    name: 'Cloud Treading Steps',
    nameKo: '운보비행',
    description: '구름 위를 걷듯 가벼운 보법. 일정 시간 이동속도가 크게 증가.',
    category: SKILL_CATEGORIES.GYEONGGONG.key,
    type: null,
    isActive: true,
    mpCost: 25,
    hpCost: 0,
    cooldown: 15000,
    baseDamage: 0,
    element: ELEMENT_TYPES.WIND.key,
    damageType: null,
    effects: [
      { type: EFFECT_TYPES.STAT_BUFF.key, stat: 'MOVE_SPEED', value: 50, isPercent: true, duration: 8000 },
      { type: EFFECT_TYPES.STAT_BUFF.key, stat: 'EVASION', value: 15, isPercent: false, duration: 8000 },
    ],
    proficiencyGain: 4,
  },
]);

// =============================================================================
// SKILLS - 주술 (Jusul / Sorcery)
// =============================================================================

export const DEFAULT_SKILLS_JUSUL = Object.freeze([
  {
    id: 'skill_lightning_talisman',
    name: 'Thunder Talisman',
    nameKo: '뇌부적',
    description: '번개를 담은 부적을 투척하여 적에게 감전 피해를 준다.',
    category: SKILL_CATEGORIES.JUSUL.key,
    type: JUSUL_TYPES.ATTACK.key,
    isActive: true,
    mpCost: 22,
    hpCost: 0,
    cooldown: 3500,
    baseDamage: 30,
    element: ELEMENT_TYPES.LIGHTNING.key,
    damageType: DAMAGE_TYPES.MAGICAL.key,
    range: 180,
    effects: [
      { type: EFFECT_TYPES.DAMAGE.key, scaling: { INT: 1.0 } },
      { type: EFFECT_TYPES.STUN.key, duration: 1500, chance: 0.3, description: '30% 확률로 1.5초 기절' },
    ],
    proficiencyGain: 3,
  },
  {
    id: 'skill_qi_shield',
    name: 'Qi Barrier',
    nameKo: '기결계',
    description: '기로 방어막을 생성하여 아군을 보호한다.',
    category: SKILL_CATEGORIES.JUSUL.key,
    type: JUSUL_TYPES.BUFF.key,
    isActive: true,
    mpCost: 35,
    hpCost: 0,
    cooldown: 18000,
    baseDamage: 0,
    element: ELEMENT_TYPES.LIGHT.key,
    damageType: null,
    effects: [
      { type: EFFECT_TYPES.STAT_BUFF.key, stat: 'DEF', value: 30, isPercent: true, duration: 10000 },
      { type: EFFECT_TYPES.STAT_BUFF.key, stat: 'SPIRIT', value: 10, isPercent: false, duration: 10000 },
    ],
    proficiencyGain: 4,
  },
  {
    id: 'skill_poison_mist',
    name: 'Venomous Mist',
    nameKo: '독무술',
    description: '독안개를 뿌려 적의 능력을 약화시킨다.',
    category: SKILL_CATEGORIES.JUSUL.key,
    type: JUSUL_TYPES.DEBUFF.key,
    isActive: true,
    mpCost: 28,
    hpCost: 0,
    cooldown: 10000,
    baseDamage: 10,
    element: ELEMENT_TYPES.POISON.key,
    damageType: DAMAGE_TYPES.MAGICAL.key,
    range: 100,
    isAoE: true,
    aoeRadius: 120,
    effects: [
      { type: EFFECT_TYPES.DOT.key, element: ELEMENT_TYPES.POISON.key, damagePerTick: 5, tickInterval: 1000, duration: 8000 },
      { type: EFFECT_TYPES.STAT_DEBUFF.key, stat: 'ATK', value: -15, isPercent: true, duration: 8000 },
      { type: EFFECT_TYPES.STAT_DEBUFF.key, stat: 'ACCURACY', value: -10, isPercent: false, duration: 8000 },
    ],
    proficiencyGain: 4,
  },
]);

// =============================================================================
// Consolidated skill list
// =============================================================================

export const DEFAULT_SKILLS = Object.freeze([
  ...DEFAULT_SKILLS_SIMBEOP,
  ...DEFAULT_SKILLS_INTERNAL,
  ...DEFAULT_SKILLS_EXTERNAL,
  ...DEFAULT_SKILLS_GYEONGGONG,
  ...DEFAULT_SKILLS_JUSUL,
]);

// =============================================================================
// MONSTERS
// =============================================================================

export const DEFAULT_MONSTERS = Object.freeze([
  {
    id: 'mon_wild_boar',
    name: 'Wild Boar',
    nameKo: '멧돼지',
    level: 1,
    stats: {
      HP: 50,
      MP: 0,
      STR: 6,
      AGI: 3,
      INT: 1,
      DEF: 3,
      ATK: 5,
      EVASION: 2,
      ACCURACY: 70,
    },
    drops: [
      { itemId: 'mat_boar_tusk', chance: 0.5, nameKo: '멧돼지 엄니' },
      { itemId: 'mat_raw_meat', chance: 0.8, nameKo: '생고기' },
      { itemId: 'wpn_iron_sword', chance: 0.02 },
    ],
    expReward: 15,
    goldReward: { min: 3, max: 8 },
    spriteKey: 'mon_wild_boar',
    aiBehavior: AI_BEHAVIOR.PASSIVE.key,
  },
  {
    id: 'mon_mountain_bandit',
    name: 'Mountain Bandit',
    nameKo: '산적',
    level: 5,
    stats: {
      HP: 120,
      MP: 10,
      STR: 10,
      AGI: 8,
      INT: 4,
      DEF: 6,
      ATK: 12,
      EVASION: 5,
      ACCURACY: 75,
      CRIT_RATE: 3,
    },
    drops: [
      { itemId: 'wpn_iron_sword', chance: 0.1 },
      { itemId: 'arm_leather_armor', chance: 0.08 },
      { itemId: 'mat_bandit_pouch', chance: 0.4, nameKo: '산적 주머니' },
    ],
    expReward: 40,
    goldReward: { min: 10, max: 25 },
    spriteKey: 'mon_mountain_bandit',
    aiBehavior: AI_BEHAVIOR.AGGRESSIVE.key,
  },
  {
    id: 'mon_poison_snake',
    name: 'Venomous Serpent',
    nameKo: '독사',
    level: 8,
    stats: {
      HP: 80,
      MP: 20,
      STR: 5,
      AGI: 18,
      INT: 6,
      DEF: 3,
      ATK: 15,
      EVASION: 15,
      ACCURACY: 85,
      CRIT_RATE: 8,
    },
    drops: [
      { itemId: 'mat_snake_venom', chance: 0.6, nameKo: '뱀독' },
      { itemId: 'mat_snake_skin', chance: 0.3, nameKo: '뱀가죽' },
    ],
    expReward: 55,
    goldReward: { min: 8, max: 18 },
    spriteKey: 'mon_poison_snake',
    aiBehavior: AI_BEHAVIOR.TERRITORIAL.key,
  },
  {
    id: 'mon_dark_swordsman',
    name: 'Dark Path Swordsman',
    nameKo: '사도 검객',
    level: 18,
    stats: {
      HP: 350,
      MP: 80,
      STR: 22,
      AGI: 20,
      INT: 15,
      DEF: 14,
      ATK: 28,
      EVASION: 12,
      ACCURACY: 88,
      CRIT_RATE: 10,
      CRIT_DMG: 150,
    },
    drops: [
      { itemId: 'wpn_twin_daggers', chance: 0.03 },
      { itemId: 'acc_jade_ring', chance: 0.05 },
      { itemId: 'mat_dark_qi_essence', chance: 0.25, nameKo: '사기 정수' },
      { itemId: 'mat_skill_fragment', chance: 0.1, nameKo: '무공 파편' },
    ],
    expReward: 180,
    goldReward: { min: 30, max: 65 },
    spriteKey: 'mon_dark_swordsman',
    aiBehavior: AI_BEHAVIOR.AGGRESSIVE.key,
  },
  {
    id: 'mon_mountain_spirit',
    name: 'Ancient Mountain Spirit',
    nameKo: '산령',
    level: 30,
    stats: {
      HP: 800,
      MP: 300,
      STR: 15,
      AGI: 12,
      INT: 35,
      DEF: 20,
      ATK: 18,
      EVASION: 8,
      ACCURACY: 90,
      SPIRIT: 30,
      CRIT_RATE: 5,
    },
    drops: [
      { itemId: 'acc_fortune_talisman', chance: 0.04 },
      { itemId: 'mat_spirit_crystal', chance: 0.15, nameKo: '영혼 수정' },
      { itemId: 'mat_ancient_herb', chance: 0.3, nameKo: '천년 영지' },
    ],
    expReward: 450,
    goldReward: { min: 80, max: 150 },
    spriteKey: 'mon_mountain_spirit',
    aiBehavior: AI_BEHAVIOR.TERRITORIAL.key,
  },
  {
    id: 'mon_blood_demon_king',
    name: 'Blood Demon King',
    nameKo: '혈마왕',
    level: 50,
    stats: {
      HP: 5000,
      MP: 800,
      STR: 55,
      AGI: 30,
      INT: 45,
      DEF: 40,
      ATK: 65,
      EVASION: 10,
      ACCURACY: 95,
      CRIT_RATE: 15,
      CRIT_DMG: 200,
      SPIRIT: 25,
    },
    drops: [
      { itemId: 'wpn_heaven_sword', chance: 0.05 },
      { itemId: 'arm_golden_armor', chance: 0.03 },
      { itemId: 'mat_blood_demon_core', chance: 1.0, nameKo: '혈마핵' },
      { itemId: 'mat_demon_essence', chance: 0.5, nameKo: '마기 정수' },
    ],
    expReward: 2500,
    goldReward: { min: 500, max: 1200 },
    spriteKey: 'mon_blood_demon_king',
    aiBehavior: AI_BEHAVIOR.BOSS.key,
    bossPhases: [
      { hpThreshold: 0.7, enrageMultiplier: 1.0, description: '일반 상태' },
      { hpThreshold: 0.4, enrageMultiplier: 1.3, description: '혈기 폭주 - 공격력 30% 증가' },
      { hpThreshold: 0.15, enrageMultiplier: 1.8, description: '광폭화 - 공격력 80% 증가, 체력 흡수' },
    ],
  },
]);

// =============================================================================
// SKILL COMBINATIONS (합공 / Fusion Skills)
// =============================================================================

export const DEFAULT_SKILL_COMBINATIONS = Object.freeze([
  {
    id: 'combo_thunder_fist',
    name: 'Thunder God Fist',
    nameKo: '뇌신권',
    description: '철권난타와 뇌부적을 융합한 기술. 전기를 두른 주먹으로 연타한다.',
    ingredients: ['skill_iron_fist', 'skill_lightning_talisman'],
    result: {
      id: 'skill_thunder_fist',
      name: 'Thunder God Fist',
      nameKo: '뇌신권',
      description: '번개를 두른 주먹으로 적을 연타한다. 감전 효과.',
      category: SKILL_CATEGORIES.MUGONG.key,
      type: MUGONG_TYPES.EXTERNAL.key,
      isActive: true,
      mpCost: 30,
      hpCost: 0,
      cooldown: 5000,
      baseDamage: 45,
      element: ELEMENT_TYPES.LIGHTNING.key,
      damageType: DAMAGE_TYPES.PHYSICAL.key,
      range: 40,
      hitCount: 4,
      effects: [
        { type: EFFECT_TYPES.DAMAGE.key, scaling: { STR: 0.8, INT: 0.5 } },
        { type: EFFECT_TYPES.STUN.key, duration: 2000, chance: 0.25 },
        { type: EFFECT_TYPES.DOT.key, element: ELEMENT_TYPES.LIGHTNING.key, damagePerTick: 8, tickInterval: 500, duration: 3000 },
      ],
      proficiencyGain: 5,
    },
    requiredProficiency: {
      'skill_iron_fist': 500,
      'skill_lightning_talisman': 500,
    },
  },
  {
    id: 'combo_frost_wind_step',
    name: 'Frost Wind Flash',
    nameKo: '빙풍섬',
    description: '경공과 빙결맥타를 융합. 순간이동하며 얼음 공격.',
    ingredients: ['skill_shadow_step', 'skill_frozen_meridian'],
    result: {
      id: 'skill_frost_wind_flash',
      name: 'Frost Wind Flash',
      nameKo: '빙풍섬',
      description: '얼음 기운을 두르고 순간이동하여 적을 관통한다.',
      category: SKILL_CATEGORIES.MUGONG.key,
      type: MUGONG_TYPES.INTERNAL.key,
      isActive: true,
      mpCost: 40,
      hpCost: 0,
      cooldown: 8000,
      baseDamage: 55,
      element: ELEMENT_TYPES.ICE.key,
      damageType: DAMAGE_TYPES.MAGICAL.key,
      range: 150,
      effects: [
        { type: EFFECT_TYPES.MOVEMENT_BOOST.key, value: 150, unit: 'pixels' },
        { type: EFFECT_TYPES.INVINCIBILITY.key, duration: 500 },
        { type: EFFECT_TYPES.DAMAGE.key, scaling: { INT: 1.0, AGI: 0.8 } },
        { type: EFFECT_TYPES.STAT_DEBUFF.key, stat: 'MOVE_SPEED', value: -40, isPercent: true, duration: 3000 },
      ],
      proficiencyGain: 6,
    },
    requiredProficiency: {
      'skill_shadow_step': 1500,
      'skill_frozen_meridian': 1500,
    },
  },
  {
    id: 'combo_divine_flame_art',
    name: 'Divine Flame Annihilation',
    nameKo: '신화멸진',
    description: '구양신공과 파천일검의 극의. 화염을 두른 검격으로 모든 것을 베어낸다.',
    ingredients: ['skill_nine_yang', 'skill_heaven_breaking_slash'],
    result: {
      id: 'skill_divine_flame',
      name: 'Divine Flame Annihilation',
      nameKo: '신화멸진',
      description: '타오르는 검기로 천지를 가른다. 최강의 합공.',
      category: SKILL_CATEGORIES.MUGONG.key,
      type: MUGONG_TYPES.EXTERNAL.key,
      isActive: true,
      mpCost: 80,
      hpCost: 15,
      cooldown: 20000,
      baseDamage: 150,
      element: ELEMENT_TYPES.FIRE.key,
      damageType: DAMAGE_TYPES.TRUE.key,
      range: 100,
      isAoE: true,
      aoeRadius: 150,
      effects: [
        { type: EFFECT_TYPES.DAMAGE.key, scaling: { STR: 1.5, INT: 1.5, SPIRIT: 0.5 } },
        { type: EFFECT_TYPES.DOT.key, element: ELEMENT_TYPES.FIRE.key, damagePerTick: 20, tickInterval: 1000, duration: 6000 },
        { type: EFFECT_TYPES.STAT_DEBUFF.key, stat: 'DEF', value: -25, isPercent: true, duration: 6000 },
      ],
      proficiencyGain: 10,
    },
    requiredProficiency: {
      'skill_nine_yang': 4000,
      'skill_heaven_breaking_slash': 4000,
    },
  },
]);

// =============================================================================
// Consolidated item list
// =============================================================================

export const DEFAULT_ITEMS = Object.freeze([
  ...DEFAULT_WEAPONS,
  ...DEFAULT_ARMOR,
  ...DEFAULT_ACCESSORIES,
]);

// =============================================================================
// Quick-lookup maps (built at module load)
// =============================================================================

export const ITEMS_BY_ID = Object.freeze(
  Object.fromEntries(DEFAULT_ITEMS.map(item => [item.id, item]))
);

export const SKILLS_BY_ID = Object.freeze(
  Object.fromEntries(DEFAULT_SKILLS.map(skill => [skill.id, skill]))
);

export const MONSTERS_BY_ID = Object.freeze(
  Object.fromEntries(DEFAULT_MONSTERS.map(monster => [monster.id, monster]))
);

// =============================================================================
// Player Defaults (used by game engine)
// =============================================================================

export const DEFAULT_PLAYER_STATS = Object.freeze({
  level: 1,
  exp: 0,
  gold: 100,
  HP: 100,
  MP: 50,
  maxHP: 100,
  maxMP: 50,
  STR: 10,
  AGI: 8,
  INT: 6,
  LUK: 5,
  DEF: 5,
  ATK: 12,
  EVASION: 5,
  ACCURACY: 90,
  CRIT_RATE: 5,
  CRIT_DMG: 150,
  SPIRIT: 5,
  MOVE_SPEED: 160,
  ATK_SPEED: 100,
  HP_REGEN: 2,
  MP_REGEN: 1,
  DMG_BONUS: 0,
  DMG_TAKEN: 0,
});

export const LEVEL_UP_GAINS = Object.freeze({
  maxHP: 15,
  maxMP: 8,
  STR: 2,
  AGI: 1,
  INT: 1,
  LUK: 1,
  DEF: 1,
  ATK: 2,
});

/**
 * EXP required to reach the next level from the given level.
 * @param {number} level
 * @returns {number}
 */
export function getExpForLevel(level) {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

/** Default starting inventory */
export const DEFAULT_INVENTORY = Object.freeze([
  { itemId: 'wpn_iron_sword', quantity: 1 },
  { itemId: 'arm_leather_armor', quantity: 1 },
]);

/** Default starting skill IDs */
export const DEFAULT_STARTING_SKILLS = Object.freeze([
  'skill_iron_fist',
  'skill_qiwave',
  'skill_taichi_simbeop',
  'skill_ungi_josik',
]);

/** Default skill hotbar (keys 1-5) */
export const DEFAULT_SKILL_SLOTS = Object.freeze([
  'skill_iron_fist',
  'skill_qiwave',
  'skill_ungi_josik',
  null,
  null,
]);

/** Monster spawn configuration */
export const SPAWN_CONFIG = Object.freeze({
  default: {
    monstersPerArea: 8,
    respawnTime: 15000,
    types: ['mon_wild_boar', 'mon_mountain_bandit', 'mon_poison_snake'],
    weights: [50, 30, 20],
  },
});
