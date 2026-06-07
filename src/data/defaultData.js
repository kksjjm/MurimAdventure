// =============================================================================
// Modu RPG - Default data from the realtime ARPG DB planning document
// =============================================================================

import {
  STATS,
  EQUIPMENT_SLOTS,
  WEAPON_TYPES,
  WEAPON_GRIP,
  SKILL_CATEGORIES,
  ITEM_RARITY,
  ELEMENT_TYPES,
  AI_BEHAVIOR,
  ITEM_TYPES,
  EFFECT_TYPES,
  DAMAGE_TYPES,
} from './constants.js';

export const DATA_SCHEMA_VERSION = 2;

export const DEFAULT_SYSTEM_MODULES = Object.freeze([
  { module_id: 'core', name: '코어', category: 'core', enabled_default: true, fallback_policy: 'block_publish', main_tables: ['system_modules', 'assets', 'stat_definitions'] },
  { module_id: 'admin_system', name: '관리자 시스템', category: 'admin', enabled_default: true, dependencies: ['core'], fallback_policy: 'block_publish', main_tables: ['admin_users', 'admin_audit_logs'] },
  { module_id: 'race_system', name: '종족 시스템', category: 'character', enabled_default: true, dependencies: ['core'], fallback_policy: 'use_default', main_tables: ['race_templates'] },
  { module_id: 'class_system', name: '직업 시스템', category: 'character', enabled_default: true, dependencies: ['core'], fallback_policy: 'use_default', main_tables: ['class_templates'] },
  { module_id: 'item_system', name: '아이템 시스템', category: 'item', enabled_default: true, dependencies: ['core'], fallback_policy: 'preserve_data_hide_ui', main_tables: ['item_templates', 'item_instances'] },
  { module_id: 'equipment_system', name: '장비 시스템', category: 'item', enabled_default: true, dependencies: ['item_system'], fallback_policy: 'use_default', main_tables: ['equipment_templates', 'weapon_templates'] },
  { module_id: 'combat_core', name: '실시간 전투 코어', category: 'combat', enabled_default: true, dependencies: ['core'], fallback_policy: 'block_publish', main_tables: ['combat_action_templates', 'hitbox_templates', 'hurtbox_templates'] },
  { module_id: 'skill_system', name: '스킬 시스템', category: 'skill', enabled_default: true, dependencies: ['combat_core'], fallback_policy: 'disable_feature', main_tables: ['skill_templates', 'effect_actions'] },
  { module_id: 'monster_system', name: '몬스터/AI', category: 'combat', enabled_default: true, dependencies: ['combat_core'], fallback_policy: 'disable_feature', main_tables: ['monster_templates', 'ai_behavior_templates'] },
  { module_id: 'quest_system', name: '퀘스트/NPC/대화', category: 'world', enabled_default: true, dependencies: ['core'], fallback_policy: 'preserve_data_hide_ui', main_tables: ['quest_templates', 'npc_templates', 'dialogue_nodes'] },
  { module_id: 'crafting_system', name: '제작', category: 'item', enabled_default: false, dependencies: ['item_system'], fallback_policy: 'disable_feature', main_tables: ['crafting_recipes'] },
  { module_id: 'enhance_system', name: '강화', category: 'item', enabled_default: false, dependencies: ['equipment_system'], fallback_policy: 'disable_feature', main_tables: ['equipment_enhance_rules'] },
]);

export const DEFAULT_TABLE_CATALOG = Object.freeze([
  { domain: 'Core', table_name: 'system_modules', pk: 'module_id', module_id: 'core', kind: '필수' },
  { domain: 'Core', table_name: 'assets', pk: 'asset_id', module_id: 'core', kind: '필수' },
  { domain: 'Stats', table_name: 'stat_definitions', pk: 'stat_id', module_id: 'core', kind: '필수' },
  { domain: 'Items', table_name: 'item_templates', pk: 'item_template_id', module_id: 'item_system', kind: '필수' },
  { domain: 'Items', table_name: 'item_instances', pk: 'item_instance_id', module_id: 'item_system', kind: '필수' },
  { domain: 'Items', table_name: 'equipment_templates', pk: 'equipment_template_id', module_id: 'equipment_system', kind: '필수' },
  { domain: 'Items', table_name: 'weapon_templates', pk: 'weapon_template_id', module_id: 'equipment_system', kind: '필수' },
  { domain: 'Combat', table_name: 'combat_action_templates', pk: 'action_id', module_id: 'combat_core', kind: '필수' },
  { domain: 'Combat', table_name: 'hitbox_templates', pk: 'hitbox_id', module_id: 'combat_core', kind: '필수' },
  { domain: 'Combat', table_name: 'hurtbox_templates', pk: 'hurtbox_id', module_id: 'combat_core', kind: '필수' },
  { domain: 'Skills', table_name: 'skill_templates', pk: 'skill_template_id', module_id: 'skill_system', kind: '필수' },
  { domain: 'Skills', table_name: 'effect_actions', pk: 'effect_action_id', module_id: 'skill_system', kind: '필수' },
  { domain: 'Monster', table_name: 'monster_templates', pk: 'monster_template_id', module_id: 'monster_system', kind: '필수' },
  { domain: 'Monster', table_name: 'ai_behavior_templates', pk: 'ai_template_id', module_id: 'monster_system', kind: '권장' },
  { domain: 'Quest', table_name: 'quest_templates', pk: 'quest_template_id', module_id: 'quest_system', kind: '권장' },
]);

export const DEFAULT_FORMULAS = Object.freeze([
  { id: 'physical_damage_received', name: '받는 물리 피해', expression: 'max(1,(incoming_damage-defense)*(1-physical_resist_pct)*(1+received_physical_damage_delta_pct))', module_id: 'combat_core' },
  { id: 'magic_damage_received', name: '받는 마법 피해', expression: 'max(1,incoming_damage*(1-magic_resist_pct)*(1+received_magic_damage_delta_pct))', module_id: 'combat_core' },
  { id: 'outgoing_damage', name: '주는 피해', expression: 'random(min_attack,max_attack)*(1+damage_increase_pct)*skill_multiplier', module_id: 'combat_core' },
  { id: 'critical_damage', name: '크리티컬 피해', expression: 'outgoing_damage*(1+critical_multiplier_pct)', module_id: 'combat_core' },
  { id: 'hp_regen_tick', name: '체력 리젠', expression: 'max_hp*hp_regen_per_10s_pct*(tick_interval_ms/10000)', module_id: 'combat_core' },
  { id: 'enhance_success_rate', name: '강화 성공률', expression: 'clamp(base_rate + enhance_success_bonus_pct - enhance_level*penalty_per_level, min_rate, max_rate)', module_id: 'enhance_system' },
  { id: 'drop_chance_final', name: '최종 드랍률', expression: 'clamp(base_drop_chance_pct*(1+item_find_chance_pct),0,max_drop_chance_pct)', module_id: 'loot_system' },
]);

export const DEFAULT_STAT_DEFINITIONS = Object.freeze(
  Object.values(STATS).map((stat) => ({
    stat_id: stat.code || stat.key,
    code: stat.code || stat.key,
    legacyKey: stat.key,
    name: stat.nameKo,
    value_type: stat.valueType || 'decimal',
    stack_rule: stat.stackRule || 'add',
    module_id: 'core',
    admin_editable: true,
  }))
);

export const DEFAULT_COMBAT_ACTIONS = Object.freeze([
  {
    id: 'action_basic_slash',
    name: '기본 베기',
    module_id: 'combat_core',
    startup_ms: 120,
    active_ms: 100,
    recovery_ms: 260,
    can_cancel_into_json: ['dash'],
    hitbox_id: 'hitbox_slash_small',
  },
  {
    id: 'action_projectile_shot',
    name: '기본 투사체',
    module_id: 'combat_core',
    startup_ms: 160,
    active_ms: 80,
    recovery_ms: 300,
    projectile_template_id: 'projectile_basic_bolt',
    hitbox_id: 'hitbox_projectile_small',
  },
]);

export const DEFAULT_HITBOX_TEMPLATES = Object.freeze([
  { id: 'hitbox_slash_small', shape_type: 'rect', offset_x: 0.8, offset_y: 0, width: 1.4, height: 0.7, duration_ms: 100 },
  { id: 'hitbox_projectile_small', shape_type: 'circle', offset_x: 0, offset_y: 0, radius: 0.35, duration_ms: 80 },
  { id: 'hitbox_area_pulse', shape_type: 'circle', offset_x: 0, offset_y: 0, radius: 2.4, duration_ms: 600 },
]);

export const DEFAULT_ITEMS = Object.freeze([
  {
    id: 'weapon_sword_001',
    item_template_id: 'weapon_sword_001',
    module_id: 'equipment_system',
    templateKind: 'template',
    name: 'Prototype Sword',
    nameKo: '프로토타입 한손검',
    description: '새 DB 설계의 weapon_templates 예시 장비입니다.',
    item_category: 'equipment',
    type: ITEM_TYPES.WEAPON.key,
    slot: EQUIPMENT_SLOTS.WEAPON.key,
    weaponType: WEAPON_TYPES.ONE_HAND_WEAPON.key,
    weaponGrip: WEAPON_GRIP.ONE_HANDED.key,
    grade: 'G01',
    rarity: ITEM_RARITY.G01.key,
    levelReq: 1,
    max_stack: 1,
    maxStack: 1,
    stackable: false,
    min_attack: 3,
    max_attack: 7,
    attack_range: 1.5,
    baseATK: 5,
    baseATK_SPEED: 80,
    baseRange: 48,
    stats: { ACCURACY: 5 },
    spriteKey: null,
  },
  {
    id: 'armor_cloth_001',
    item_template_id: 'armor_cloth_001',
    module_id: 'equipment_system',
    templateKind: 'template',
    name: 'Prototype Armor',
    nameKo: '프로토타입 방어구',
    description: 'equipment_templates 예시 방어구입니다.',
    item_category: 'equipment',
    type: ITEM_TYPES.ARMOR.key,
    slot: EQUIPMENT_SLOTS.ARMOR.key,
    grade: 'G05',
    rarity: ITEM_RARITY.G05.key,
    levelReq: 1,
    max_stack: 1,
    maxStack: 1,
    stackable: false,
    baseDEF: 4,
    stats: { maxHP: 20 },
    spriteKey: null,
  },
  {
    id: 'consumable_hp_001',
    item_template_id: 'consumable_hp_001',
    module_id: 'item_system',
    templateKind: 'template',
    name: 'Small HP Kit',
    nameKo: '소형 체력 키트',
    description: '소비품 템플릿 예시입니다.',
    item_category: 'consumable',
    type: ITEM_TYPES.CONSUMABLE.key,
    grade: 'G05',
    rarity: ITEM_RARITY.G05.key,
    stackable: true,
    max_stack: 99,
    maxStack: 99,
    effect: { type: 'heal', stat: 'HP', amount: 50 },
  },
  {
    id: 'material_core_001',
    item_template_id: 'material_core_001',
    module_id: 'item_system',
    templateKind: 'template',
    name: 'Test Core Fragment',
    nameKo: '테스트 코어 조각',
    description: '제작/강화 모듈용 재료 샘플입니다.',
    item_category: 'material',
    type: ITEM_TYPES.MATERIAL.key,
    grade: 'G04',
    rarity: ITEM_RARITY.G04.key,
    stackable: true,
    max_stack: 999,
    maxStack: 999,
  },
]);

export const DEFAULT_SKILLS = Object.freeze([
  {
    id: 'skill_slash',
    skill_template_id: 'skill_slash',
    module_id: 'skill_system',
    name: 'Slash',
    nameKo: '베기',
    description: 'combat_action_templates와 hitbox_templates를 참조하는 근접 스킬입니다.',
    skill_category: 'melee',
    category: SKILL_CATEGORIES.melee.key,
    target_type: 'monster_only',
    action_id: 'action_basic_slash',
    base_effect_id: 'effect_slash_damage',
    hitbox_id: 'hitbox_slash_small',
    isActive: true,
    mpCost: 0,
    hpCost: 0,
    cooldown: 700,
    baseDamage: 12,
    skill_multiplier: 1.0,
    element: ELEMENT_TYPES.NONE.key,
    damageType: DAMAGE_TYPES.PHYSICAL.key,
    range: 56,
    effects: [{ type: EFFECT_TYPES.DAMAGE.key, scaling: { ATK: 0.8, STR: 0.4 } }],
    proficiencyGain: 2,
  },
  {
    id: 'skill_bolt',
    skill_template_id: 'skill_bolt',
    module_id: 'skill_system',
    name: 'Bolt Shot',
    nameKo: '볼트 샷',
    description: '투사체 템플릿을 쓰는 원거리 스킬 예시입니다.',
    skill_category: 'ranged',
    category: SKILL_CATEGORIES.ranged.key,
    target_type: 'monster_only',
    action_id: 'action_projectile_shot',
    base_effect_id: 'effect_bolt_damage',
    hitbox_id: 'hitbox_projectile_small',
    isActive: true,
    mpCost: 8,
    hpCost: 0,
    cooldown: 1800,
    baseDamage: 18,
    skill_multiplier: 1.2,
    element: ELEMENT_TYPES.LIGHTNING.key,
    damageType: DAMAGE_TYPES.MAGICAL.key,
    range: 180,
    effects: [{ type: EFFECT_TYPES.DAMAGE.key, scaling: { INT: 0.9 } }],
    proficiencyGain: 3,
  },
  {
    id: 'skill_recover_channel',
    skill_template_id: 'skill_recover_channel',
    module_id: 'skill_system',
    name: 'Recover Channel',
    nameKo: '채널 회복',
    description: '지속시간/채널링 효과 설계 예시입니다.',
    skill_category: 'support',
    category: SKILL_CATEGORIES.support.key,
    target_type: 'self',
    isActive: true,
    mpCost: 0,
    hpCost: 0,
    cooldown: 12000,
    duration: 4000,
    baseDamage: 0,
    element: ELEMENT_TYPES.LIGHT.key,
    damageType: null,
    range: 0,
    effects: [{ type: EFFECT_TYPES.CHANNEL_REGEN.key, stat: 'MP', percentPerSec: 8, duration: 4000 }],
    proficiencyGain: 3,
  },
]);

export const DEFAULT_MONSTERS = Object.freeze([
  {
    id: 'monster_training_box',
    monster_template_id: 'monster_training_box',
    module_id: 'monster_system',
    name: 'Training Box',
    nameKo: '훈련용 박스',
    level: 1,
    stats: { HP: 45, maxHP: 45, MP: 0, STR: 4, AGI: 5, INT: 1, DEF: 1, ATK: 4, EVASION: 0, ACCURACY: 80, CRIT_RATE: 0, CRIT_DMG: 150 },
    aiBehavior: AI_BEHAVIOR.PASSIVE.key,
    chaseRange: 120,
    attackRange: 36,
    attackSpeed: 1400,
    drops: [{ itemId: 'material_core_001', chance: 0.45 }],
    expReward: 12,
    goldReward: { min: 1, max: 4 },
    spriteKey: 'monster_box',
  },
  {
    id: 'monster_aggressive_box',
    monster_template_id: 'monster_aggressive_box',
    module_id: 'monster_system',
    name: 'Aggressive Box',
    nameKo: '공격형 박스',
    level: 3,
    stats: { HP: 95, maxHP: 95, MP: 0, STR: 8, AGI: 8, INT: 1, DEF: 3, ATK: 9, EVASION: 3, ACCURACY: 82, CRIT_RATE: 2, CRIT_DMG: 150 },
    aiBehavior: AI_BEHAVIOR.AGGRESSIVE.key,
    chaseRange: 150,
    attackRange: 38,
    attackSpeed: 1200,
    drops: [{ itemId: 'consumable_hp_001', chance: 0.25 }, { itemId: 'material_core_001', chance: 0.55 }],
    expReward: 28,
    goldReward: { min: 4, max: 12 },
    spriteKey: 'monster_box_aggressive',
  },
]);

export const DEFAULT_SKILL_COMBINATIONS = Object.freeze([
  {
    id: 'combo_slash_bolt',
    module_id: 'skill_system',
    name: 'Charged Slash',
    nameKo: '충전 베기',
    description: '근접 판정과 원거리 속성을 합성하는 레시피 예시입니다.',
    ingredients: ['skill_slash', 'skill_bolt'],
    requiredProficiency: { skill_slash: 100, skill_bolt: 100 },
    proficiencyReq: { skill_slash: 100, skill_bolt: 100 },
    result: {
      id: 'skill_charged_slash',
      name: 'Charged Slash',
      nameKo: '충전 베기',
      category: SKILL_CATEGORIES.melee.key,
      element: ELEMENT_TYPES.LIGHTNING.key,
      damageType: DAMAGE_TYPES.PHYSICAL.key,
      mpCost: 12,
      cooldown: 3500,
      baseDamage: 35,
      range: 72,
      effects: [{ type: EFFECT_TYPES.DAMAGE.key, scaling: { ATK: 1.0, INT: 0.4 } }],
      proficiencyGain: 5,
    },
  },
]);

export const DEFAULT_PLAYER_STATS = Object.freeze({
  level: 1,
  exp: 0,
  gold: 100,
  HP: 120,
  MP: 60,
  maxHP: 120,
  maxMP: 60,
  STR: 8,
  AGI: 8,
  INT: 8,
  LUK: 5,
  DEF: 3,
  ATK: 10,
  EVASION: 4,
  ACCURACY: 90,
  CRIT_RATE: 5,
  CRIT_DMG: 150,
  SPIRIT: 5,
  ITEM_FIND: 0,
  MOVE_SPEED: 160,
  ATK_SPEED: 100,
  HP_REGEN: 1,
  MP_REGEN: 1,
  DMG_BONUS: 0,
  DMG_TAKEN: 0,
});

export const LEVEL_UP_GAINS = Object.freeze({
  maxHP: 12,
  maxMP: 6,
  STR: 1,
  AGI: 1,
  INT: 1,
  DEF: 1,
  ATK: 2,
});

export function getExpForLevel(level) {
  return Math.floor(100 * Math.pow(1.15, level - 1));
}

export const DEFAULT_INVENTORY = Object.freeze([
  { itemId: 'consumable_hp_001', quantity: 3 },
]);

export const DEFAULT_STARTING_SKILLS = Object.freeze([
  'skill_slash',
  'skill_bolt',
  'skill_recover_channel',
]);

export const DEFAULT_SKILL_SLOTS = Object.freeze([
  'skill_slash',
  'skill_bolt',
  'skill_recover_channel',
  null,
  null,
]);

export const SPAWN_CONFIG = Object.freeze({
  default: {
    monstersPerArea: 8,
    respawnTime: 15000,
    types: ['monster_training_box', 'monster_aggressive_box'],
    weights: [70, 30],
  },
});

export const DEFAULT_ADMIN_PAGES = Object.freeze([
  { page: '모듈 관리', requiredValidation: 'hard dependency 비활성 차단', preview: '영향받는 콘텐츠 목록', tables: ['system_modules', 'module_dependencies'] },
  { page: '아이템/장비', requiredValidation: '슬롯/타입/등급/옵션 참조 검증', preview: '장착 시 스탯 변화', tables: ['item_templates', 'equipment_templates'] },
  { page: '스킬/전투', requiredValidation: '공식/효과/애셋/히트박스 참조 검증', preview: '허수아비 DPS, 판정 미리보기', tables: ['skill_templates', 'combat_action_templates'] },
  { page: '몬스터/AI', requiredValidation: '드랍률, AI 조건식 검증', preview: '전투 시뮬레이션', tables: ['monster_templates', 'ai_behavior_templates'] },
  { page: '퀘스트/NPC/대화', requiredValidation: '선행퀘 순환, 대화 dead-end 검증', preview: '퀘스트 플로우 그래프', tables: ['quest_templates', 'dialogue_nodes'] },
]);

export const DEFAULT_ITEMS_BY_ID = Object.freeze(Object.fromEntries(DEFAULT_ITEMS.map((item) => [item.id, item])));
export const DEFAULT_SKILLS_BY_ID = Object.freeze(Object.fromEntries(DEFAULT_SKILLS.map((skill) => [skill.id, skill])));
export const DEFAULT_MONSTERS_BY_ID = Object.freeze(Object.fromEntries(DEFAULT_MONSTERS.map((monster) => [monster.id, monster])));

export const ITEMS_BY_ID = DEFAULT_ITEMS_BY_ID;
export const SKILLS_BY_ID = DEFAULT_SKILLS_BY_ID;
export const MONSTERS_BY_ID = DEFAULT_MONSTERS_BY_ID;
