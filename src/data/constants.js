// =============================================================================
// Modu RPG - Modular realtime ARPG constants
// =============================================================================

export const MODULE_CATEGORIES = Object.freeze({
  core: { key: 'core', nameKo: '코어' },
  admin: { key: 'admin', nameKo: '관리자' },
  character: { key: 'character', nameKo: '캐릭터' },
  item: { key: 'item', nameKo: '아이템' },
  combat: { key: 'combat', nameKo: '실시간 전투' },
  skill: { key: 'skill', nameKo: '스킬' },
  world: { key: 'world', nameKo: '월드' },
  economy: { key: 'economy', nameKo: '경제' },
  liveops: { key: 'liveops', nameKo: '라이브 운영' },
});

export const FALLBACK_POLICIES = Object.freeze({
  block_publish: { key: 'block_publish', nameKo: '배포 차단' },
  preserve_data_hide_ui: { key: 'preserve_data_hide_ui', nameKo: '데이터 보존 + UI 숨김' },
  use_default: { key: 'use_default', nameKo: '기본값 사용' },
  disable_feature: { key: 'disable_feature', nameKo: '기능 비활성' },
});

export const TEMPLATE_KINDS = Object.freeze({
  template: { key: 'template', nameKo: '템플릿' },
  instance: { key: 'instance', nameKo: '인스턴스' },
  rule: { key: 'rule', nameKo: '규칙' },
  runtime: { key: 'runtime', nameKo: '런타임 상태' },
});

export const STAT_VALUE_TYPES = Object.freeze({
  integer: { key: 'integer', nameKo: '정수' },
  decimal: { key: 'decimal', nameKo: '소수' },
  percent: { key: 'percent', nameKo: '퍼센트' },
  boolean: { key: 'boolean', nameKo: '불리언' },
});

export const STACK_RULES = Object.freeze({
  add: { key: 'add', nameKo: '합산' },
  multiply: { key: 'multiply', nameKo: '곱연산' },
  max: { key: 'max', nameKo: '최댓값' },
  min: { key: 'min', nameKo: '최솟값' },
  override: { key: 'override', nameKo: '덮어쓰기' },
});

export const STATS = Object.freeze({
  HP: { key: 'HP', code: 'current_hp', nameKo: '현재 체력', valueType: 'decimal', stackRule: 'override' },
  MP: { key: 'MP', code: 'current_mp', nameKo: '현재 마나', valueType: 'decimal', stackRule: 'override' },
  maxHP: { key: 'maxHP', code: 'max_hp', nameKo: '최대 체력', valueType: 'decimal', stackRule: 'add' },
  maxMP: { key: 'maxMP', code: 'max_mp', nameKo: '최대 마나', valueType: 'decimal', stackRule: 'add' },
  STR: { key: 'STR', code: 'strength', nameKo: '힘', valueType: 'decimal', stackRule: 'add' },
  AGI: { key: 'AGI', code: 'agility', nameKo: '민첩', valueType: 'decimal', stackRule: 'add' },
  INT: { key: 'INT', code: 'intelligence', nameKo: '지능', valueType: 'decimal', stackRule: 'add' },
  LUK: { key: 'LUK', code: 'luck', nameKo: '운', valueType: 'decimal', stackRule: 'add' },
  DEF: { key: 'DEF', code: 'defense', nameKo: '방어력', valueType: 'decimal', stackRule: 'add' },
  ATK: { key: 'ATK', code: 'attack', nameKo: '공격력', valueType: 'decimal', stackRule: 'add' },
  EVASION: { key: 'EVASION', code: 'evasion', nameKo: '회피', valueType: 'decimal', stackRule: 'add' },
  ACCURACY: { key: 'ACCURACY', code: 'accuracy', nameKo: '명중', valueType: 'decimal', stackRule: 'add' },
  CRIT_RATE: { key: 'CRIT_RATE', code: 'critical_chance_pct', nameKo: '치명 확률', valueType: 'percent', stackRule: 'add' },
  CRIT_DMG: { key: 'CRIT_DMG', code: 'critical_multiplier_pct', nameKo: '치명 배율', valueType: 'percent', stackRule: 'add' },
  SPIRIT: { key: 'SPIRIT', code: 'spirit', nameKo: '정신력', valueType: 'decimal', stackRule: 'add' },
  ITEM_FIND: { key: 'ITEM_FIND', code: 'item_find_chance_pct', nameKo: '아이템 발견', valueType: 'percent', stackRule: 'add' },
  MOVE_SPEED: { key: 'MOVE_SPEED', code: 'move_speed', nameKo: '이동 속도', valueType: 'decimal', stackRule: 'add' },
  ATK_SPEED: { key: 'ATK_SPEED', code: 'attack_speed', nameKo: '공격 속도', valueType: 'decimal', stackRule: 'add' },
  HP_REGEN: { key: 'HP_REGEN', code: 'hp_regen_per_10s_pct', nameKo: '체력 재생', valueType: 'percent', stackRule: 'add' },
  MP_REGEN: { key: 'MP_REGEN', code: 'mp_regen_per_10s_pct', nameKo: '마나 재생', valueType: 'percent', stackRule: 'add' },
  DMG_BONUS: { key: 'DMG_BONUS', code: 'damage_increase_pct', nameKo: '주는 피해 증가', valueType: 'percent', stackRule: 'add' },
  DMG_TAKEN: { key: 'DMG_TAKEN', code: 'received_damage_delta_pct', nameKo: '받는 피해 변화', valueType: 'percent', stackRule: 'add' },
});

export const EQUIPMENT_SLOTS = Object.freeze({
  WEAPON: { key: 'WEAPON', code: 'weapon', nameKo: '무기', order: 0 },
  SHIELD: { key: 'SHIELD', code: 'shield', nameKo: '보조/방패', order: 1 },
  HELMET: { key: 'HELMET', code: 'helmet', nameKo: '머리', order: 2 },
  ARMOR: { key: 'ARMOR', code: 'armor', nameKo: '상의', order: 3 },
  PANTS: { key: 'PANTS', code: 'pants', nameKo: '하의', order: 4 },
  SHOES: { key: 'SHOES', code: 'shoes', nameKo: '신발', order: 5 },
  GLOVES: { key: 'GLOVES', code: 'gloves', nameKo: '장갑', order: 6 },
  BELT: { key: 'BELT', code: 'belt', nameKo: '허리', order: 7 },
  RING_RIGHT: { key: 'RING_RIGHT', code: 'ring_right', nameKo: '반지 오른쪽', order: 8 },
  RING_LEFT: { key: 'RING_LEFT', code: 'ring_left', nameKo: '반지 왼쪽', order: 9 },
  NECKLACE: { key: 'NECKLACE', code: 'necklace', nameKo: '목걸이', order: 10 },
  TALISMAN: { key: 'TALISMAN', code: 'talisman', nameKo: '부적', order: 11 },
  JADE_TOKEN: { key: 'JADE_TOKEN', code: 'token', nameKo: '증표', order: 12 },
});

export const WEAPON_GRIP = Object.freeze({
  ONE_HANDED: { key: 'ONE_HANDED', code: 'one_hand', nameKo: '한손', blocksShield: false },
  TWO_HANDED: { key: 'TWO_HANDED', code: 'two_hand', nameKo: '양손', blocksShield: true },
  DUAL_WIELD: { key: 'DUAL_WIELD', code: 'dual_wield', nameKo: '쌍수', blocksShield: true },
});

export const WEAPON_TYPES = Object.freeze({
  ONE_HAND_WEAPON: { key: 'ONE_HAND_WEAPON', code: 'one_hand_weapon', nameKo: '한손 무기' },
  TWO_HAND_WEAPON: { key: 'TWO_HAND_WEAPON', code: 'two_hand_weapon', nameKo: '양손 무기' },
  RANGED_WEAPON: { key: 'RANGED_WEAPON', code: 'ranged_weapon', nameKo: '원거리 무기' },
  MAGIC_WEAPON: { key: 'MAGIC_WEAPON', code: 'magic_weapon', nameKo: '마법 무기' },
  FIST: { key: 'FIST', code: 'fist', nameKo: '격투' },
  SWORD: { key: 'SWORD', code: 'sword', nameKo: '검' },
  BLADE: { key: 'BLADE', code: 'blade', nameKo: '도' },
  SPEAR: { key: 'SPEAR', code: 'spear', nameKo: '창' },
  STAFF: { key: 'STAFF', code: 'staff', nameKo: '지팡이' },
  HIDDEN: { key: 'HIDDEN', code: 'hidden', nameKo: '투척/암기' },
  WHIP: { key: 'WHIP', code: 'whip', nameKo: '채찍' },
  EXOTIC: { key: 'EXOTIC', code: 'exotic', nameKo: '특수 무기' },
});

export const ITEM_TYPES = Object.freeze({
  EQUIPMENT: { key: 'EQUIPMENT', code: 'equipment', nameKo: '장비' },
  WEAPON: { key: 'WEAPON', code: 'equipment.weapon', nameKo: '무기' },
  ARMOR: { key: 'ARMOR', code: 'equipment.armor', nameKo: '방어구' },
  ACCESSORY: { key: 'ACCESSORY', code: 'equipment.accessory', nameKo: '장신구' },
  CONSUMABLE: { key: 'CONSUMABLE', code: 'consumable', nameKo: '소비품' },
  MATERIAL: { key: 'MATERIAL', code: 'material', nameKo: '재료' },
  QUEST: { key: 'QUEST', code: 'quest', nameKo: '퀘스트' },
  SKILL_BOOK: { key: 'SKILL_BOOK', code: 'skill_book', nameKo: '스킬북' },
});

export const ITEM_RARITY = Object.freeze({
  G01: { key: 'G01', grade: 1, nameKo: '1급', color: '#f59e0b', dropWeight: 5, glowColor: 0xf59e0b },
  G02: { key: 'G02', grade: 2, nameKo: '2급', color: '#a855f7', dropWeight: 12, glowColor: 0xa855f7 },
  G03: { key: 'G03', grade: 3, nameKo: '3급', color: '#3b82f6', dropWeight: 30, glowColor: 0x3b82f6 },
  G04: { key: 'G04', grade: 4, nameKo: '4급', color: '#22c55e', dropWeight: 75, glowColor: 0x22c55e },
  G05: { key: 'G05', grade: 5, nameKo: '5급', color: '#d1d5db', dropWeight: 160, glowColor: 0xd1d5db },
  GRADE_0: { key: 'G01', grade: 1, nameKo: '1급', color: '#f59e0b', dropWeight: 5, glowColor: 0xf59e0b },
  GRADE_1: { key: 'G01', grade: 1, nameKo: '1급', color: '#f59e0b', dropWeight: 5, glowColor: 0xf59e0b },
  GRADE_2: { key: 'G02', grade: 2, nameKo: '2급', color: '#a855f7', dropWeight: 12, glowColor: 0xa855f7 },
  GRADE_3: { key: 'G03', grade: 3, nameKo: '3급', color: '#3b82f6', dropWeight: 30, glowColor: 0x3b82f6 },
  GRADE_4: { key: 'G04', grade: 4, nameKo: '4급', color: '#22c55e', dropWeight: 75, glowColor: 0x22c55e },
  GRADE_5: { key: 'G05', grade: 5, nameKo: '5급', color: '#d1d5db', dropWeight: 160, glowColor: 0xd1d5db },
  GRADE_6: { key: 'G05', grade: 5, nameKo: '5급', color: '#d1d5db', dropWeight: 160, glowColor: 0xd1d5db },
  GRADE_7: { key: 'G05', grade: 5, nameKo: '5급', color: '#d1d5db', dropWeight: 160, glowColor: 0xd1d5db },
  GRADE_8: { key: 'G05', grade: 5, nameKo: '5급', color: '#d1d5db', dropWeight: 160, glowColor: 0xd1d5db },
  GRADE_9: { key: 'G05', grade: 5, nameKo: '5급', color: '#d1d5db', dropWeight: 160, glowColor: 0xd1d5db },
  GRADE_10: { key: 'G05', grade: 5, nameKo: '5급', color: '#d1d5db', dropWeight: 160, glowColor: 0xd1d5db },
  GRADE_11: { key: 'G05', grade: 5, nameKo: '5급', color: '#d1d5db', dropWeight: 160, glowColor: 0xd1d5db },
  GRADE_12: { key: 'G05', grade: 5, nameKo: '5급', color: '#d1d5db', dropWeight: 160, glowColor: 0xd1d5db },
  GRADE_13: { key: 'G05', grade: 5, nameKo: '5급', color: '#d1d5db', dropWeight: 160, glowColor: 0xd1d5db },
});

export function getRarityDisplay(rarityKey) {
  const rarity = ITEM_RARITY[rarityKey];
  return rarity ? `${rarity.nameKo} (${rarity.key})` : rarityKey;
}

export const SKILL_CATEGORIES = Object.freeze({
  melee: { key: 'melee', nameKo: '근접', description: '근접 판정 기반 액션 스킬' },
  ranged: { key: 'ranged', nameKo: '원거리', description: '투사체/사거리 기반 스킬' },
  magic: { key: 'magic', nameKo: '마법', description: '마법 피해와 장판/상태이상' },
  movement: { key: 'movement', nameKo: '이동', description: '대시, 점멸, 이동 보정' },
  support: { key: 'support', nameKo: '지원', description: '회복, 보호막, 버프' },
  passive: { key: 'passive', nameKo: '패시브', description: '상시 성장/숙련 보정' },
  MUGONG: { key: 'melee', nameKo: '근접', description: '호환용 근접 카테고리' },
  GYEONGGONG: { key: 'movement', nameKo: '이동', description: '호환용 이동 카테고리' },
  JUSUL: { key: 'magic', nameKo: '마법', description: '호환용 마법 카테고리' },
  SIMBEOP: { key: 'passive', nameKo: '패시브', description: '호환용 패시브 카테고리' },
});

export const MUGONG_TYPES = Object.freeze({
  INTERNAL: { key: 'INTERNAL', nameKo: '내공형' },
  EXTERNAL: { key: 'EXTERNAL', nameKo: '외공형' },
});

export const JUSUL_TYPES = Object.freeze({
  ATTACK: { key: 'ATTACK', nameKo: '공격' },
  BUFF: { key: 'BUFF', nameKo: '버프' },
  DEBUFF: { key: 'DEBUFF', nameKo: '디버프' },
});

export const ELEMENT_TYPES = Object.freeze({
  NONE: { key: 'NONE', nameKo: '무속성', color: '#cbd5e1' },
  FIRE: { key: 'FIRE', nameKo: '화염', color: '#ef4444' },
  ICE: { key: 'ICE', nameKo: '빙결', color: '#38bdf8' },
  LIGHTNING: { key: 'LIGHTNING', nameKo: '번개', color: '#facc15' },
  WIND: { key: 'WIND', nameKo: '바람', color: '#2dd4bf' },
  EARTH: { key: 'EARTH', nameKo: '대지', color: '#a16207' },
  DARK: { key: 'DARK', nameKo: '암흑', color: '#7c3aed' },
  LIGHT: { key: 'LIGHT', nameKo: '빛', color: '#fde68a' },
  POISON: { key: 'POISON', nameKo: '독', color: '#84cc16' },
});

export const EFFECT_TYPES = Object.freeze({
  DAMAGE: { key: 'DAMAGE', nameKo: '피해' },
  HEAL: { key: 'HEAL', nameKo: '회복' },
  DOT: { key: 'DOT', nameKo: '지속 피해' },
  HOT: { key: 'HOT', nameKo: '지속 회복' },
  STAT_BUFF: { key: 'STAT_BUFF', nameKo: '능력치 버프' },
  STAT_DEBUFF: { key: 'STAT_DEBUFF', nameKo: '능력치 디버프' },
  STUN: { key: 'STUN', nameKo: '기절' },
  KNOCKBACK: { key: 'KNOCKBACK', nameKo: '넉백' },
  INVINCIBILITY: { key: 'INVINCIBILITY', nameKo: '무적' },
  MOVEMENT_BOOST: { key: 'MOVEMENT_BOOST', nameKo: '이동 보정' },
  CHANNEL_REGEN: { key: 'CHANNEL_REGEN', nameKo: '채널링 회복' },
});

export const DAMAGE_TYPES = Object.freeze({
  PHYSICAL: { key: 'PHYSICAL', code: 'physical', nameKo: '물리' },
  MAGICAL: { key: 'MAGICAL', code: 'magic', nameKo: '마법' },
  TRUE: { key: 'TRUE', code: 'true', nameKo: '고정' },
});

export const AI_BEHAVIOR = Object.freeze({
  PASSIVE: { key: 'PASSIVE', code: 'passive', nameKo: '비선공' },
  AGGRESSIVE: { key: 'AGGRESSIVE', code: 'aggressive', nameKo: '선공' },
  TERRITORIAL: { key: 'TERRITORIAL', code: 'territorial', nameKo: '영역 방어' },
  PATROL: { key: 'PATROL', code: 'patrol', nameKo: '순찰' },
  BOSS: { key: 'BOSS', code: 'boss', nameKo: '보스' },
  FLEE: { key: 'FLEE', code: 'flee', nameKo: '도주' },
});

export const HITBOX_SHAPES = Object.freeze({
  rect: { key: 'rect', nameKo: '사각형' },
  circle: { key: 'circle', nameKo: '원형' },
  cone: { key: 'cone', nameKo: '부채꼴' },
});

export const TARGET_TYPES = Object.freeze({
  self: { key: 'self', nameKo: '자신' },
  ally: { key: 'ally', nameKo: '아군' },
  monster_only: { key: 'monster_only', nameKo: '몬스터' },
  area: { key: 'area', nameKo: '지역' },
});

export const PROFICIENCY_LEVELS = Object.freeze({
  NOVICE: { key: 'NOVICE', nameKo: '입문', threshold: 0, statMultiplier: 1.0, dmgBonus: 0, atkSpdBonus: 0, critRateBonus: 0, critDmgBonus: 0 },
  APPRENTICE: { key: 'APPRENTICE', nameKo: '수련', threshold: 100, statMultiplier: 1.08, dmgBonus: 4, atkSpdBonus: 2, critRateBonus: 1, critDmgBonus: 4 },
  ADEPT: { key: 'ADEPT', nameKo: '숙련', threshold: 500, statMultiplier: 1.18, dmgBonus: 9, atkSpdBonus: 5, critRateBonus: 2, critDmgBonus: 8 },
  EXPERT: { key: 'EXPERT', nameKo: '전문', threshold: 1500, statMultiplier: 1.32, dmgBonus: 16, atkSpdBonus: 8, critRateBonus: 4, critDmgBonus: 14 },
  MASTER: { key: 'MASTER', nameKo: '달인', threshold: 4000, statMultiplier: 1.5, dmgBonus: 25, atkSpdBonus: 12, critRateBonus: 6, critDmgBonus: 22 },
  LEGEND: { key: 'LEGEND', nameKo: '전설', threshold: 10000, statMultiplier: 1.75, dmgBonus: 38, atkSpdBonus: 18, critRateBonus: 10, critDmgBonus: 35 },
  MYTH: { key: 'MYTH', nameKo: '신화', threshold: 25000, statMultiplier: 2.1, dmgBonus: 55, atkSpdBonus: 26, critRateBonus: 15, critDmgBonus: 50 },
});

export function getProficiencyLevel(proficiency) {
  const levels = Object.values(PROFICIENCY_LEVELS);
  for (let i = levels.length - 1; i >= 0; i--) {
    if (proficiency >= levels[i].threshold) return levels[i];
  }
  return levels[0];
}

export function getNextProficiencyThreshold(proficiency) {
  const levels = Object.values(PROFICIENCY_LEVELS);
  for (const level of levels) {
    if (proficiency < level.threshold) return level.threshold;
  }
  return null;
}
