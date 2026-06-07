#!/usr/bin/env node
// =============================================================================
// Export all modular ARPG game data to public/data/
// =============================================================================

import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, join } from 'path';
import { writeFileSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = join(__dirname, '..');
const outDir = join(root, 'public/data');

mkdirSync(outDir, { recursive: true });

function arrayToDict(arr) {
  const dict = {};
  for (const item of arr || []) {
    if (item && item.id) dict[item.id] = item;
  }
  return dict;
}

function writeJSON(name, data) {
  writeFileSync(join(outDir, name), JSON.stringify(data, null, 2), 'utf8');
}

const defaultData = await import(pathToFileURL(join(root, 'src/data/defaultData.js')).href);
const mapData = await import(pathToFileURL(join(root, 'src/game/data/mapData.js')).href);
const npcData = await import(pathToFileURL(join(root, 'src/game/data/npcData.js')).href);
const questData = await import(pathToFileURL(join(root, 'src/game/data/questData.js')).href);

const items = arrayToDict(defaultData.DEFAULT_ITEMS);
const skills = arrayToDict(defaultData.DEFAULT_SKILLS);
const monsters = arrayToDict(defaultData.DEFAULT_MONSTERS);
const maps = Object.fromEntries(['field_01', 'village_01', 'dark_forest'].map((id) => [id, mapData.getMapData(id)]));
const npcs = arrayToDict(npcData.NPC_LIST);
const quests = Array.isArray(questData.QUESTS) ? arrayToDict(questData.QUESTS) : { ...questData.QUESTS };

writeJSON('items.json', items);
writeJSON('skills.json', skills);
writeJSON('monsters.json', monsters);
writeJSON('skillCombinations.json', defaultData.DEFAULT_SKILL_COMBINATIONS);
writeJSON('spawnConfig.json', defaultData.SPAWN_CONFIG);
writeJSON('config.json', {
  schemaVersion: defaultData.DATA_SCHEMA_VERSION,
  playerDefaults: defaultData.DEFAULT_PLAYER_STATS,
  levelUpGains: defaultData.LEVEL_UP_GAINS,
  defaultInventory: defaultData.DEFAULT_INVENTORY,
  defaultStartingSkills: defaultData.DEFAULT_STARTING_SKILLS,
  defaultSkillSlots: defaultData.DEFAULT_SKILL_SLOTS,
  systemModules: defaultData.DEFAULT_SYSTEM_MODULES,
  tableCatalog: defaultData.DEFAULT_TABLE_CATALOG,
  statDefinitions: defaultData.DEFAULT_STAT_DEFINITIONS,
  combatActions: defaultData.DEFAULT_COMBAT_ACTIONS,
  hitboxTemplates: defaultData.DEFAULT_HITBOX_TEMPLATES,
  formulas: defaultData.DEFAULT_FORMULAS,
});
writeJSON('maps.json', maps);
writeJSON('npcs.json', npcs);
writeJSON('quests.json', quests);

console.log('Exported modular ARPG data to public/data/');
console.log(`items=${Object.keys(items).length}, skills=${Object.keys(skills).length}, monsters=${Object.keys(monsters).length}, maps=${Object.keys(maps).length}`);
