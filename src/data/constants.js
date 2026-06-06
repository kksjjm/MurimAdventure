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
  HP_REGEN:   { key: 'HP_REGEN',   nameKo: '체력회복', description: 'HP Regeneration per tick' },
  MP_REGEN:   { key: 'MP_REGEN',   nameKo: '내력회복', description: 'MP Regeneration per tick' },
  DMG_BONUS:  { key: 'DMG_BONUS',  nameKo: '피해증가', description: 'Damage dealt increase %' },
  DMG_TAKEN:  { key: 'DMG_TAKEN',  nameKo: '받는피해증가', description: 'Damage taken increase % (negative = reduction)' },
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
/**
 * Weapon grip (how the weapon is held)
 */
export const WEAPON_GRIP = Object.freeze({
  ONE_HANDED: { key: 'ONE_HANDED', nameKo: '한손', blocksShield: false },
  TWO_HANDED: { key: 'TWO_HANDED', nameKo: '양손', blocksShield: true },
  DUAL_WIELD: { key: 'DUAL_WIELD', nameKo: '쌍수', blocksShield: true },
});

/**
 * Weapon type classifications (무기 분류) - determines proficiency category
 */
export const WEAPON_TYPES = Object.freeze({
  SWORD:    { key: 'SWORD',    nameKo: '검 (劍)',     description: '곧은 칼날의 양날검' },
  BLADE:    { key: 'BLADE',    nameKo: '도 (刀)',     description: '한쪽 날의 외날도' },
  SPEAR:    { key: 'SPEAR',    nameKo: '창 (槍)',     description: '긴 자루에 날이 달린 장병기' },
  STAFF:    { key: 'STAFF',    nameKo: '봉 (棒)',     description: '나무나 금속으로 만든 긴 봉' },
  HIDDEN:   { key: 'HIDDEN',   nameKo: '암기 (暗器)', description: '표창, 비수 등 투척/은닉 무기' },
  WHIP:     { key: 'WHIP',     nameKo: '편 (鞭)',     description: '채찍, 연환 등 유연한 무기' },
  FIST:     { key: 'FIST',     nameKo: '권 (拳)',     description: '맨손 또는 권갑류' },
  EXOTIC:   { key: 'EXOTIC',   nameKo: '기문병기 (奇門)', description: '부채, 피리, 바늘 등 특수 무기' },
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
/**
 * Item grade system (0등급 = 최고, 13등급 = 최하)
 * grade 숫자가 낮을수록 강력한 아이템
 */
export const ITEM_RARITY = Object.freeze({
  GRADE_0:  { key: 'GRADE_0',  grade: 0,  nameKo: '창세 (創世)',   color: '#ff0000', dropWeight: 0,    glowColor: 0xff0000 },
  GRADE_1:  { key: 'GRADE_1',  grade: 1,  nameKo: '무극 (無極)',   color: '#ff4400', dropWeight: 1,    glowColor: 0xff4400 },
  GRADE_2:  { key: 'GRADE_2',  grade: 2,  nameKo: '천기 (天機)',   color: '#ff8800', dropWeight: 2,    glowColor: 0xff8800 },
  GRADE_3:  { key: 'GRADE_3',  grade: 3,  nameKo: '태초 (太初)',   color: '#ffcc00', dropWeight: 5,    glowColor: 0xffcc00 },
  GRADE_4:  { key: 'GRADE_4',  grade: 4,  nameKo: '탈해 (脫解)',   color: '#ccff00', dropWeight: 8,    glowColor: 0xccff00 },
  GRADE_5:  { key: 'GRADE_5',  grade: 5,  nameKo: '신화 (神話)',   color: '#e6cc80', dropWeight: 12,   glowColor: 0xe6cc80 },
  GRADE_6:  { key: 'GRADE_6',  grade: 6,  nameKo: '현경 (玄境)',   color: '#a335ee', dropWeight: 25,   glowColor: 0xa335ee },
  GRADE_7:  { key: 'GRADE_7',  grade: 7,  nameKo: '보병 (寶兵)',   color: '#ff8000', dropWeight: 50,   glowColor: 0xff8000 },
  GRADE_8:  { key: 'GRADE_8',  grade: 8,  nameKo: '극품 (極品)',   color: '#0070dd', dropWeight: 100,  glowColor: 0x0070dd },
  GRADE_9:  { key: 'GRADE_9',  grade: 9,  nameKo: '명기 (名器)',   color: '#1eff00', dropWeight: 200,  glowColor: 0x1eff00 },
  GRADE_10: { key: 'GRADE_10', grade: 10, nameKo: '상품 (上品)',   color: '#00ccff', dropWeight: 400,  glowColor: 0x00ccff },
  GRADE_11: { key: 'GRADE_11', grade: 11, nameKo: '중품 (中品)',   color: '#cccccc', dropWeight: 600,  glowColor: 0xcccccc },
  GRADE_12: { key: 'GRADE_12', grade: 12, nameKo: '범품 (凡品)',   color: '#9d9d9d', dropWeight: 800,  glowColor: 0x9d9d9d },
  GRADE_13: { key: 'GRADE_13', grade: 13, nameKo: '하품 (下品)',   color: '#666666', dropWeight: 1000, glowColor: 0x666666 },
});

/** Helper: get rarity display name with grade number */
export function getRarityDisplay(rarityKey) {
  const r = ITEM_RARITY[rarityKey];
  if (!r) return rarityKey;
  return `${r.grade}등급 ${r.nameKo}`;
}

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
  BEGINNER:     { key: 'BEGINNER',     nameKo: '초식',     threshold: 0,     statMultiplier: 1.0,  dmgBonus: 0,   atkSpdBonus: 0,  critRateBonus: 0,  critDmgBonus: 0 },
  INTERMEDIATE: { key: 'INTERMEDIATE', nameKo: '중급',     threshold: 100,   statMultiplier: 1.15, dmgBonus: 5,   atkSpdBonus: 3,  critRateBonus: 1,  critDmgBonus: 5 },
  ADVANCED:     { key: 'ADVANCED',     nameKo: '상급',     threshold: 500,   statMultiplier: 1.35, dmgBonus: 12,  atkSpdBonus: 6,  critRateBonus: 3,  critDmgBonus: 12 },
  EXPERT:       { key: 'EXPERT',       nameKo: '절정',     threshold: 1500,  statMultiplier: 1.6,  dmgBonus: 22,  atkSpdBonus: 10, critRateBonus: 5,  critDmgBonus: 20 },
  MASTER:       { key: 'MASTER',       nameKo: '화경',     threshold: 4000,  statMultiplier: 2.0,  dmgBonus: 35,  atkSpdBonus: 15, critRateBonus: 8,  critDmgBonus: 30 },
  GRANDMASTER:  { key: 'GRANDMASTER',  nameKo: '현경',     threshold: 10000, statMultiplier: 2.5,  dmgBonus: 50,  atkSpdBonus: 20, critRateBonus: 12, critDmgBonus: 45 },
  TRANSCENDENT: { key: 'TRANSCENDENT', nameKo: '탈태환골', threshold: 25000, statMultiplier: 3.5,  dmgBonus: 75,  atkSpdBonus: 30, critRateBonus: 18, critDmgBonus: 65 },
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
