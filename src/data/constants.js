// =============================================================================
// 무림기행 (Murim Adventure) - Game Constants
// =============================================================================

/**
 * Character and combat stats
 */
export const STATS = Object.freeze({
  HP:         { key: 'HP',         nameKo: '체력',     description: 'Hit Points' },
  MP:         { key: 'MP',         nameKo: '내력',     description: 'Mana / Internal Energy' },
  STR:        { key: 'STR',        nameKo: '근력',     description: 'Strength' },
  AGI:        { key: 'AGI',        nameKo: '민첩',     description: 'Agility' },
  INT:        { key: 'INT',        nameKo: '지력',     description: 'Intelligence' },
  LUK:        { key: 'LUK',        nameKo: '운',       description: 'Luck' },
  DEF:        { key: 'DEF',        nameKo: '방어력',   description: 'Defense' },
  ATK:        { key: 'ATK',        nameKo: '공격력',   description: 'Attack Power' },
  EVASION:    { key: 'EVASION',    nameKo: '회피율',   description: 'Evasion Rate' },
  ACCURACY:   { key: 'ACCURACY',   nameKo: '명중률',   description: 'Accuracy' },
  CRIT_RATE:  { key: 'CRIT_RATE',  nameKo: '치명타율', description: 'Critical Hit Rate' },
  CRIT_DMG:   { key: 'CRIT_DMG',   nameKo: '치명타피해', description: 'Critical Hit Damage' },
  SPIRIT:     { key: 'SPIRIT',     nameKo: '정신력',   description: 'Spirit / Mental Fortitude' },
  ITEM_FIND:  { key: 'ITEM_FIND',  nameKo: '아이템발견', description: 'Item Find Rate' },
  MOVE_SPEED: { key: 'MOVE_SPEED', nameKo: '이동속도', description: 'Movement Speed' },
  ATK_SPEED:  { key: 'ATK_SPEED',  nameKo: '공격속도', description: 'Attack Speed' },
});

/**
 * Equipment slot definitions
 */
export const EQUIPMENT_SLOTS = Object.freeze({
  WEAPON:     { key: 'WEAPON',     nameKo: '무기',     order: 0 },
  SHIELD:     { key: 'SHIELD',     nameKo: '방패',     order: 1 },
  HELMET:     { key: 'HELMET',     nameKo: '투구',     order: 2 },
  ARMOR:      { key: 'ARMOR',      nameKo: '갑옷',     order: 3 },
  PANTS:      { key: 'PANTS',      nameKo: '하의',     order: 4 },
  SHOES:      { key: 'SHOES',      nameKo: '신발',     order: 5 },
  GLOVES:     { key: 'GLOVES',     nameKo: '장갑',     order: 6 },
  BELT:       { key: 'BELT',       nameKo: '요대',     order: 7 },
  RING_RIGHT: { key: 'RING_RIGHT', nameKo: '반지(우)', order: 8 },
  RING_LEFT:  { key: 'RING_LEFT',  nameKo: '반지(좌)', order: 9 },
  NECKLACE:   { key: 'NECKLACE',   nameKo: '목걸이',   order: 10 },
  TALISMAN:   { key: 'TALISMAN',   nameKo: '부적',     order: 11 },
  JADE_TOKEN: { key: 'JADE_TOKEN', nameKo: '옥패',     order: 12 },
});

/**
 * Weapon type classifications
 */
export const WEAPON_TYPES = Object.freeze({
  TWO_HANDED: { key: 'TWO_HANDED', nameKo: '양손무기', blocksShield: true },
  ONE_HANDED: { key: 'ONE_HANDED', nameKo: '한손무기', blocksShield: false },
  DUAL_WIELD: { key: 'DUAL_WIELD', nameKo: '쌍수무기', blocksShield: true },
});

/**
 * Skill category system (무공 체계)
 */
export const SKILL_CATEGORIES = Object.freeze({
  SIMBEOP:    { key: 'SIMBEOP',    nameKo: '심법',   nameHanja: '心法', description: '내면의 기를 수련하는 심법 (Passive internal cultivation)' },
  MUGONG:     { key: 'MUGONG',     nameKo: '무공',   nameHanja: '武功', description: '전투에 사용하는 무공 (Martial arts combat skills)' },
  GYEONGGONG: { key: 'GYEONGGONG', nameKo: '경공',   nameHanja: '輕功', description: '몸을 가볍게 하는 경공 (Movement / lightness skills)' },
  JUSUL:      { key: 'JUSUL',      nameKo: '주술',   nameHanja: '呪術', description: '기를 이용한 주술 (Sorcery / qi manipulation)' },
});

/**
 * Mugong sub-types
 */
export const MUGONG_TYPES = Object.freeze({
  INTERNAL: { key: 'INTERNAL', nameKo: '내가무공', description: '내공을 기반으로 한 무공 (Internal energy / magic-based martial arts)' },
  EXTERNAL: { key: 'EXTERNAL', nameKo: '외가무공', description: '신체 단련을 기반으로 한 무공 (Physical / external martial arts)' },
});

/**
 * Jusul (sorcery) sub-types
 */
export const JUSUL_TYPES = Object.freeze({
  ATTACK: { key: 'ATTACK', nameKo: '공격 주술', description: '적에게 피해를 주는 주술' },
  BUFF:   { key: 'BUFF',   nameKo: '강화 주술', description: '아군을 강화하는 주술' },
  DEBUFF: { key: 'DEBUFF', nameKo: '약화 주술', description: '적을 약화시키는 주술' },
});

/**
 * Item rarity tiers
 */
export const ITEM_RARITY = Object.freeze({
  COMMON:    { key: 'COMMON',    nameKo: '범용',   tier: 0, color: '#9d9d9d', dropWeight: 1000 },
  UNCOMMON:  { key: 'UNCOMMON',  nameKo: '고급',   tier: 1, color: '#1eff00', dropWeight: 500 },
  RARE:      { key: 'RARE',      nameKo: '희귀',   tier: 2, color: '#0070dd', dropWeight: 200 },
  EPIC:      { key: 'EPIC',      nameKo: '영웅',   tier: 3, color: '#a335ee', dropWeight: 50 },
  LEGENDARY: { key: 'LEGENDARY', nameKo: '전설',   tier: 4, color: '#ff8000', dropWeight: 10 },
  MYTHIC:    { key: 'MYTHIC',    nameKo: '신화',   tier: 5, color: '#e6cc80', dropWeight: 1 },
});

/**
 * Elemental affinities for skills
 */
export const ELEMENT_TYPES = Object.freeze({
  NONE:      { key: 'NONE',      nameKo: '무속성', color: '#cccccc' },
  FIRE:      { key: 'FIRE',      nameKo: '화(火)', color: '#ff4500' },
  ICE:       { key: 'ICE',       nameKo: '빙(氷)', color: '#00bfff' },
  LIGHTNING: { key: 'LIGHTNING', nameKo: '뇌(雷)', color: '#ffd700' },
  WIND:      { key: 'WIND',      nameKo: '풍(風)', color: '#7cfc00' },
  EARTH:     { key: 'EARTH',     nameKo: '지(地)', color: '#8b4513' },
  DARK:      { key: 'DARK',      nameKo: '암(暗)', color: '#4b0082' },
  LIGHT:     { key: 'LIGHT',     nameKo: '광(光)', color: '#fffacd' },
  POISON:    { key: 'POISON',    nameKo: '독(毒)', color: '#32cd32' },
});

/**
 * Proficiency (숙련도) progression levels with thresholds
 */
export const PROFICIENCY_LEVELS = Object.freeze({
  BEGINNER:     { key: 'BEGINNER',     nameKo: '초식',   threshold: 0,     statMultiplier: 1.0 },
  INTERMEDIATE: { key: 'INTERMEDIATE', nameKo: '중급',   threshold: 100,   statMultiplier: 1.15 },
  ADVANCED:     { key: 'ADVANCED',     nameKo: '상급',   threshold: 500,   statMultiplier: 1.35 },
  EXPERT:       { key: 'EXPERT',       nameKo: '절정',   threshold: 1500,  statMultiplier: 1.6 },
  MASTER:       { key: 'MASTER',       nameKo: '화경',   threshold: 4000,  statMultiplier: 2.0 },
  GRANDMASTER:  { key: 'GRANDMASTER',  nameKo: '현경',   threshold: 10000, statMultiplier: 2.5 },
  TRANSCENDENT: { key: 'TRANSCENDENT', nameKo: '탈태환골', threshold: 25000, statMultiplier: 3.5 },
});

/**
 * Monster AI behavior types
 */
export const AI_BEHAVIOR = Object.freeze({
  PASSIVE:     { key: 'PASSIVE',     nameKo: '온순',     description: 'Does not attack unless provoked' },
  AGGRESSIVE:  { key: 'AGGRESSIVE',  nameKo: '공격적',   description: 'Attacks player on sight' },
  TERRITORIAL: { key: 'TERRITORIAL', nameKo: '영역수호', description: 'Attacks when player enters territory' },
  PATROL:      { key: 'PATROL',      nameKo: '순찰',     description: 'Patrols a set path, engages on proximity' },
  BOSS:        { key: 'BOSS',        nameKo: '두목',     description: 'Boss encounter with phased behavior' },
  FLEE:        { key: 'FLEE',        nameKo: '도주',     description: 'Runs away when HP is low' },
});

/**
 * Item type classifications
 */
export const ITEM_TYPES = Object.freeze({
  WEAPON:      { key: 'WEAPON',      nameKo: '무기' },
  ARMOR:       { key: 'ARMOR',       nameKo: '방어구' },
  ACCESSORY:   { key: 'ACCESSORY',   nameKo: '장신구' },
  CONSUMABLE:  { key: 'CONSUMABLE',  nameKo: '소비품' },
  MATERIAL:    { key: 'MATERIAL',    nameKo: '재료' },
  QUEST:       { key: 'QUEST',       nameKo: '임무품' },
  SKILL_BOOK:  { key: 'SKILL_BOOK',  nameKo: '무공비급' },
});

/**
 * Effect types used in skill and item effects
 */
export const EFFECT_TYPES = Object.freeze({
  DAMAGE:            { key: 'DAMAGE',            nameKo: '피해' },
  HEAL:              { key: 'HEAL',              nameKo: '회복' },
  DOT:               { key: 'DOT',               nameKo: '지속피해' },
  HOT:               { key: 'HOT',               nameKo: '지속회복' },
  STAT_BUFF:         { key: 'STAT_BUFF',         nameKo: '능력치 강화' },
  STAT_DEBUFF:       { key: 'STAT_DEBUFF',       nameKo: '능력치 약화' },
  STUN:              { key: 'STUN',              nameKo: '기절' },
  KNOCKBACK:         { key: 'KNOCKBACK',         nameKo: '밀어내기' },
  INVINCIBILITY:     { key: 'INVINCIBILITY',     nameKo: '무적' },
  STEALTH:           { key: 'STEALTH',           nameKo: '은신' },
  MOVEMENT_BOOST:    { key: 'MOVEMENT_BOOST',    nameKo: '이동속도 증가' },
  COOLDOWN_RESET:    { key: 'COOLDOWN_RESET',    nameKo: '재사용 초기화' },
});

/**
 * Damage types
 */
export const DAMAGE_TYPES = Object.freeze({
  PHYSICAL: { key: 'PHYSICAL', nameKo: '물리' },
  MAGICAL:  { key: 'MAGICAL',  nameKo: '내공' },
  TRUE:     { key: 'TRUE',     nameKo: '진기' },
});

/**
 * Utility: Get the proficiency level for a given proficiency value
 * @param {number} proficiency - Current proficiency points
 * @returns {object} The matching proficiency level definition
 */
export function getProficiencyLevel(proficiency) {
  const levels = Object.values(PROFICIENCY_LEVELS);
  for (let i = levels.length - 1; i >= 0; i--) {
    if (proficiency >= levels[i].threshold) {
      return levels[i];
    }
  }
  return levels[0];
}

/**
 * Utility: Get the next proficiency level threshold
 * @param {number} proficiency - Current proficiency points
 * @returns {number|null} Points needed for next level, or null if max
 */
export function getNextProficiencyThreshold(proficiency) {
  const levels = Object.values(PROFICIENCY_LEVELS);
  for (const level of levels) {
    if (proficiency < level.threshold) {
      return level.threshold;
    }
  }
  return null; // Already at max level
}
