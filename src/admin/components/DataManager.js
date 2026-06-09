// =============================================================================
// DataManager - Load/save/import/export modular ARPG data
// =============================================================================

import {
  DEFAULT_ITEMS as ITEMS,
  DEFAULT_MONSTERS as MONSTERS,
  DEFAULT_SKILLS as SKILLS,
  DEFAULT_SKILL_COMBINATIONS as SKILL_COMBINATIONS,
  SPAWN_CONFIG,
  DEFAULT_PLAYER_STATS,
  LEVEL_UP_GAINS,
  DATA_SCHEMA_VERSION,
  DEFAULT_SYSTEM_MODULES,
  DEFAULT_TABLE_CATALOG,
  DEFAULT_STAT_DEFINITIONS,
  DEFAULT_COMBAT_ACTIONS,
  DEFAULT_HITBOX_TEMPLATES,
  DEFAULT_FORMULAS,
  DEFAULT_ADMIN_PAGES,
  DEFAULT_NPCS,
  DEFAULT_SHOPS,
} from '../../data/defaultData.js';
import { getAllMaps } from '../../game/data/mapData.js';

const STORAGE_KEY = 'moduRpg_adminData_v2';
const LEGACY_STORAGE_KEY = 'murimAdventure_adminData';
const CUSTOM_SPRITES_KEY = 'murimAdventure_customSprites';
const MAP_EDITOR_DATA_VERSION = 4;
const CONTENT_LINK_VERSION = 3;
const MAP_ID_ALIASES = {
  map_arpg_test_field: 'field_01',
  arpg_test_field: 'field_01',
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeMapId(mapId) {
  const id = String(mapId || '').trim();
  return MAP_ID_ALIASES[id] || id;
}

function arrayToDict(arr) {
  const dict = {};
  for (const item of arr || []) {
    if (item && item.id) dict[item.id] = item;
  }
  return dict;
}

function mergeMissing(target, defaults) {
  if (!target || typeof target !== 'object') return clone(defaults);
  for (const [key, value] of Object.entries(defaults || {})) {
    if (target[key] == null) {
      target[key] = clone(value);
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      target[key] = mergeMissing(target[key], value);
    }
  }
  return target;
}

function convertGameMapToEditorMap(gameMap) {
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
      if (editorTile === 4 || editorTile === 5 || editorTile === 6) {
        collision[y * width + x] = 1;
      }
    }
  }

  return {
    id: gameMap.id,
    name: gameMap.nameKo || gameMap.name || gameMap.id,
    width,
    height,
    tileSize: 32,
    module_id: gameMap.module_id || 'world_system',
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

function getDefaultEditorMaps() {
  return getAllMaps().map(convertGameMapToEditorMap);
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

function ensureDefaultMapIntegrity(data) {
  if (!Array.isArray(data.maps)) return;
  const defaults = getDefaultEditorMaps();
  const defaultsById = new Map(defaults.map(map => [map.id, map]));
  const normalizedMaps = new Map();

  for (const map of data.maps) {
    if (!map?.id) continue;
    const mapId = normalizeMapId(map.id);
    const defaultMap = defaultsById.get(mapId);
    let next = { ...map, id: mapId };

    if (defaultMap && !hasUsableLayers(next)) {
      next = {
        ...next,
        width: defaultMap.width,
        height: defaultMap.height,
        tileSize: defaultMap.tileSize,
        layers: clone(defaultMap.layers),
      };
    }

    const defaultPortals = defaultMap?.spawnPoints?.portals || [];
    if (!next.spawnPoints) next.spawnPoints = {};
    if (!Array.isArray(next.spawnPoints.portals) || next.spawnPoints.portals.length === 0) {
      next.spawnPoints.portals = defaultPortals.map(normalizePortal);
    } else {
      next.spawnPoints.portals = next.spawnPoints.portals.map(normalizePortal);
    }

    const existing = normalizedMaps.get(mapId);
    normalizedMaps.set(mapId, existing ? {
      ...existing,
      ...next,
      spawnPoints: {
        ...(existing.spawnPoints || {}),
        ...(next.spawnPoints || {}),
      },
    } : next);
  }

  for (const defaultMap of defaults) {
    if (!normalizedMaps.has(defaultMap.id)) {
      normalizedMaps.set(defaultMap.id, clone(defaultMap));
    }
  }

  data.maps = Array.from(normalizedMaps.values());
}

function ensureDefaultContentLinks(data) {
  const defaults = getDefaultData();
  if (!data.skills) data.skills = {};
  if (!Array.isArray(data.combatActions)) data.combatActions = [];
  if (!Array.isArray(data.hitboxTemplates)) data.hitboxTemplates = [];

  for (const skillId of ['skill_basic_attack']) {
    if (!data.skills[skillId]) {
      data.skills[skillId] = clone(defaults.skills[skillId]);
    } else {
      const defaultSkill = defaults.skills[skillId];
      for (const key of ['effectKey', 'effectSpriteKey', 'heavyEffectKey', 'impactConfig']) {
        if (data.skills[skillId][key] == null && defaultSkill[key] != null) {
          data.skills[skillId][key] = clone(defaultSkill[key]);
        }
      }
      if (data.skills[skillId].impactConfig && defaultSkill.impactConfig) {
        data.skills[skillId].impactConfig = mergeMissing(data.skills[skillId].impactConfig, defaultSkill.impactConfig);
        const impact = data.skills[skillId].impactConfig;
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
    }
  }

  for (const action of defaults.combatActions || []) {
    const existing = data.combatActions.find(entry => entry.id === action.id);
    if (!existing) {
      data.combatActions.push(clone(action));
    } else if (action.id === 'action_basic_slash') {
      existing.skill_id = existing.skill_id || action.skill_id;
      existing.inputBinding = existing.inputBinding || action.inputBinding;
      existing.effectKey = existing.effectKey || action.effectKey;
      existing.heavyEffectKey = existing.heavyEffectKey || action.heavyEffectKey;
    }
  }

  for (const hitbox of defaults.hitboxTemplates || []) {
    if (!data.hitboxTemplates.some(entry => entry.id === hitbox.id)) {
      data.hitboxTemplates.push(clone(hitbox));
    }
  }

  data.contentLinkVersion = CONTENT_LINK_VERSION;
}

function getDefaultData() {
  return {
    schemaVersion: DATA_SCHEMA_VERSION,
    mapEditorVersion: MAP_EDITOR_DATA_VERSION,
    contentLinkVersion: CONTENT_LINK_VERSION,
    project: {
      title: '모두의 RPG',
      genre: '실시간 Action RPG',
      designSource: 'modu_rpg_realtime_arpg_db_design.xlsx',
      principle: '템플릿과 인스턴스 분리, 모듈 ON/OFF, 데이터 검증/배포/롤백',
    },
    systemModules: clone(DEFAULT_SYSTEM_MODULES),
    tableCatalog: clone(DEFAULT_TABLE_CATALOG),
    statDefinitions: clone(DEFAULT_STAT_DEFINITIONS),
    combatActions: clone(DEFAULT_COMBAT_ACTIONS),
    hitboxTemplates: clone(DEFAULT_HITBOX_TEMPLATES),
    formulas: clone(DEFAULT_FORMULAS),
    adminPages: clone(DEFAULT_ADMIN_PAGES),
    items: arrayToDict(clone(ITEMS)),
    skills: arrayToDict(clone(SKILLS)),
    skillCombinations: clone(SKILL_COMBINATIONS),
    monsters: arrayToDict(clone(MONSTERS)),
    npcs: arrayToDict(clone(DEFAULT_NPCS)),
    shops: clone(DEFAULT_SHOPS),
    mainCharacter: {
      id: 'main_character',
      name: 'Main Character',
      nameKo: '메인 캐릭터',
      spriteKey: 'player_base',
      level: 1,
      classId: 'class_adventurer',
      raceId: 'race_human',
      description: '플레이어가 조작하는 기본 캐릭터입니다.',
    },
    maps: getDefaultEditorMaps(),
    quests: [
      {
        id: 'quest_training_boxes',
        module_id: 'quest_system',
        name: '전투 검증',
        description: '새 전투/히트박스 설계를 검증하기 위해 훈련용 박스를 처치합니다.',
        type: 'main',
        prerequisites: [],
        objectives: [{ type: 'kill', targetId: 'monster_training_box', count: 3, description: '훈련용 박스 3개 처치' }],
        rewards: { exp: 50, gold: 30, items: ['consumable_hp_001'], skills: [] },
        dialogues: [
          { npcName: '시스템 관리자', text: '액션 프레임과 히트박스가 정상인지 먼저 확인합시다.' },
          { npcName: '시스템 관리자', text: '좋습니다. 이제 데이터 중심으로 콘텐츠를 확장할 수 있습니다.' },
        ],
      },
    ],
    events: [
      {
        id: 'event_double_exp',
        module_id: 'liveops_system',
        name: '전투 테스트 보너스',
        description: '모든 경험치가 2배로 증가합니다.',
        type: 'bonus_exp',
        startDate: '2026-01-01',
        endDate: '2026-01-07',
        multiplier: 2.0,
        rewards: [],
        active: false,
      },
    ],
    mounts: [
      {
        id: 'mount_test_bike',
        module_id: 'mount_system',
        name: '테스트 탈것',
        speedBonus: 30,
        abilities: [],
        rarity: 'G05',
        obtainMethod: '관리자 지급',
        levelTiers: [{ level: 1, speedBonus: 30 }, { level: 5, speedBonus: 45 }, { level: 10, speedBonus: 60 }],
      },
    ],
    pets: [
      {
        id: 'pet_support_cube',
        module_id: 'pet_system',
        name: '지원 큐브',
        stats: { ATK: 4, DEF: 3, HP: 40 },
        abilities: ['보조 공격', '아이템 탐색'],
        growthSystem: { expPerLevel: 100, maxLevel: 20 },
        elementAffinity: 'NONE',
        rarity: 'G05',
        evolutionTiers: [
          { tier: 1, name: '지원 큐브 I', level: 1 },
          { tier: 2, name: '지원 큐브 II', level: 10 },
          { tier: 3, name: '지원 큐브 III', level: 20 },
        ],
      },
    ],
    statsConfig: {
      levelUpGrowth: clone(LEVEL_UP_GAINS),
      combatFormulas: {
        physicalDamageCoeff: 1.0,
        magicalDamageCoeff: 1.0,
        defenseReductionCoeff: 0.8,
        critMultiplierBase: 1.5,
        evasionCap: 0.75,
        accuracyBase: 0.85,
      },
      dropRateMultipliers: { baseRate: 1.0, luckCoeff: 0.01, itemFindCoeff: 0.02 },
      expCurve: { baseExp: 100, growthFactor: 1.15, maxLevel: 100 },
    },
    gameSettings: {
      gameTitle: '모두의 RPG',
      version: '0.2.0',
      startingStats: clone(DEFAULT_PLAYER_STATS),
      inventorySize: 30,
      maxLevel: 100,
      globalMultipliers: { expMultiplier: 1.0, goldMultiplier: 1.0, dropRateMultiplier: 1.0, damageMultiplier: 1.0 },
      featureToggles: {
        pvpEnabled: false,
        tradingEnabled: true,
        mountSystemEnabled: false,
        petSystemEnabled: false,
        craftingEnabled: false,
        guildSystemEnabled: false,
      },
    },
    spawnConfig: clone(SPAWN_CONFIG),
  };
}

export class DataManager {
  constructor() {
    this.data = {};
  }

  load() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        this.data = JSON.parse(stored);
        if (this.data.schemaVersion !== DATA_SCHEMA_VERSION) {
          this.data = getDefaultData();
          this.save();
          return;
        }
        if (Array.isArray(this.data.items)) this.data.items = arrayToDict(this.data.items);
        if (Array.isArray(this.data.skills)) this.data.skills = arrayToDict(this.data.skills);
        if (Array.isArray(this.data.monsters)) this.data.monsters = arrayToDict(this.data.monsters);
        if (Array.isArray(this.data.npcs)) this.data.npcs = arrayToDict(this.data.npcs);
        if (!this.data.mainCharacter) this.data.mainCharacter = getDefaultData().mainCharacter;
        if (!this.data.npcs || Object.keys(this.data.npcs).length === 0) this.data.npcs = getDefaultData().npcs;
        if (!this.data.shops) this.data.shops = getDefaultData().shops;
        if (this.data.contentLinkVersion !== CONTENT_LINK_VERSION
          || !this.data.skills?.skill_basic_attack
          || !Array.isArray(this.data.combatActions)
          || !this.data.combatActions.some(action => action.id === 'action_basic_slash' && action.skill_id === 'skill_basic_attack')) {
          ensureDefaultContentLinks(this.data);
        }
        if (this.data.mapEditorVersion !== MAP_EDITOR_DATA_VERSION
          || !Array.isArray(this.data.maps)
          || !this.data.maps.some(map => map?.id === 'field_01')
          || (this.data.maps.length === 1 && (!this.data.maps[0].layers?.ground?.length))) {
          this.data.maps = getDefaultEditorMaps();
          this.data.mapEditorVersion = MAP_EDITOR_DATA_VERSION;
        }
        ensureDefaultMapIntegrity(this.data);
        this.save();
      } catch (e) {
        console.error('Failed to parse stored data, loading defaults', e);
        this.data = getDefaultData();
        this.save();
      }
    } else {
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      localStorage.removeItem(CUSTOM_SPRITES_KEY);
      this.data = getDefaultData();
      this.save();
    }
  }

  save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
  }

  exportAll() {
    const blob = new Blob([JSON.stringify(this.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `modu_rpg_data_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    window.showToast('전체 데이터를 내보냈습니다.', 'success');
  }

  exportSection(sectionKey) {
    const sectionData = this.data[sectionKey];
    if (!sectionData) {
      window.showToast('해당 섹션 데이터가 없습니다.', 'error');
      return;
    }
    const blob = new Blob([JSON.stringify(sectionData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `modu_rpg_${sectionKey}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    window.showToast(`${sectionKey} 데이터를 내보냈습니다.`, 'success');
  }

  async importAll(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result);
          if (!this.validateData(imported)) {
            window.showToast('유효하지 않은 데이터 형식입니다.', 'error');
            reject(new Error('Invalid data'));
            return;
          }
          this.data = { schemaVersion: DATA_SCHEMA_VERSION, ...imported };
          this.save();
          window.showToast('데이터를 가져왔습니다.', 'success');
          resolve();
        } catch (err) {
          window.showToast('JSON 파싱 오류가 발생했습니다.', 'error');
          reject(err);
        }
      };
      reader.readAsText(file);
    });
  }

  async importSection(sectionKey, file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          this.data[sectionKey] = JSON.parse(e.target.result);
          this.save();
          window.showToast(`${sectionKey} 데이터를 가져왔습니다.`, 'success');
          resolve();
        } catch (err) {
          window.showToast('JSON 파싱 오류가 발생했습니다.', 'error');
          reject(err);
        }
      };
      reader.readAsText(file);
    });
  }

  validateData(data) {
    const requiredKeys = ['items', 'skills', 'monsters', 'gameSettings'];
    return requiredKeys.every((key) => key in data);
  }

  loadDefaults() {
    this.data = getDefaultData();
    localStorage.removeItem(CUSTOM_SPRITES_KEY);
    this.save();
    window.showToast('새 기획 데이터와 편집 가능한 기본 맵으로 초기화되었습니다.', 'success');
  }

  backup() {
    const backupKey = `${STORAGE_KEY}_backup_${Date.now()}`;
    localStorage.setItem(backupKey, JSON.stringify(this.data));
    window.showToast('백업을 생성했습니다.', 'success');
    return backupKey;
  }

  getBackups() {
    const backups = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`${STORAGE_KEY}_backup_`)) {
        const ts = parseInt(key.split('_backup_')[1], 10);
        backups.push({ key, date: new Date(ts).toLocaleString('ko-KR') });
      }
    }
    return backups.sort((a, b) => b.key.localeCompare(a.key));
  }

  restoreBackup(backupKey) {
    const backed = localStorage.getItem(backupKey);
    if (backed) {
      this.data = JSON.parse(backed);
      this.save();
      window.showToast('백업에서 복구했습니다.', 'success');
    }
  }

  deleteBackup(backupKey) {
    localStorage.removeItem(backupKey);
    window.showToast('백업을 삭제했습니다.', 'info');
  }

  _exportGameDataFiles() {
    const files = [
      { name: 'items.json', data: this.data.items },
      { name: 'skills.json', data: this.data.skills },
      { name: 'monsters.json', data: this.data.monsters },
      { name: 'maps.json', data: this.data.maps },
      { name: 'npcs.json', data: this.data.npcs },
      { name: 'shops.json', data: this.data.shops },
      { name: 'skillCombinations.json', data: this.data.skillCombinations },
      { name: 'spawnConfig.json', data: this.data.spawnConfig },
      { name: 'config.json', data: { playerDefaults: this.data.gameSettings?.startingStats || {}, levelUpGrowth: this.data.statsConfig?.levelUpGrowth || {} } },
    ];
    for (const f of files) {
      const blob = new Blob([JSON.stringify(f.data, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      link.download = f.name;
      link.href = URL.createObjectURL(blob);
      link.click();
      URL.revokeObjectURL(link.href);
    }
    window.showToast(`${files.length}개 게임 데이터 파일을 내보냈습니다.`, 'success');
  }

  render(container) {
    const sections = [
      { key: 'systemModules', label: '모듈' },
      { key: 'tableCatalog', label: '테이블' },
      { key: 'statDefinitions', label: '스탯 정의' },
      { key: 'combatActions', label: '전투 액션' },
      { key: 'hitboxTemplates', label: '히트박스' },
      { key: 'formulas', label: '공식' },
      { key: 'items', label: '아이템' },
      { key: 'skills', label: '스킬' },
      { key: 'mainCharacter', label: '메인 캐릭터' },
      { key: 'monsters', label: '몬스터' },
      { key: 'npcs', label: 'NPC' },
      { key: 'shops', label: '상점' },
      { key: 'maps', label: '맵' },
      { key: 'quests', label: '퀘스트' },
      { key: 'events', label: '이벤트' },
      { key: 'mounts', label: '탈것' },
      { key: 'pets', label: '펫' },
      { key: 'statsConfig', label: '밸런스' },
      { key: 'gameSettings', label: '게임 설정' },
      { key: 'spawnConfig', label: '스폰' },
    ];

    const backups = this.getBackups();
    const itemCount = Object.keys(this.data.items || {}).length;
    const skillCount = Object.keys(this.data.skills || {}).length;
    const monsterCount = Object.keys(this.data.monsters || {}).length;
    const moduleCount = (this.data.systemModules || []).length;

    container.innerHTML = `
      <div class="section-header">
        <h2>데이터 관리<small>Data Import/Export</small></h2>
      </div>

      <div class="card" style="border-left:3px solid var(--accent-green);">
        <div class="card-header"><h3>새 기획 데이터 상태</h3></div>
        <p style="font-size:13px;color:var(--text-dim);margin-bottom:8px;">
          현재 데이터는 <strong>모두의 RPG 실시간 ARPG DB 설계</strong> 기준입니다. 템플릿/인스턴스 분리, 모듈 ON/OFF, 히트박스/액션 프레임 메타데이터를 포함합니다.
        </p>
        <div style="display:flex;gap:16px;flex-wrap:wrap;font-size:13px;">
          <span>모듈: <strong>${moduleCount}</strong>종</span>
          <span>아이템: <strong>${itemCount}</strong>종</span>
          <span>스킬: <strong>${skillCount}</strong>종</span>
          <span>몬스터: <strong>${monsterCount}</strong>종</span>
        </div>
        <div style="margin-top:8px;display:flex;gap:8px;">
          <button class="btn btn-primary btn-small" id="exportGameDataBtn">게임 데이터 파일 내보내기</button>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><h3>전체 데이터</h3></div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          <button class="btn btn-primary" id="exportAllBtn">전체 내보내기</button>
          <button class="btn btn-secondary" id="importAllBtn">전체 가져오기</button>
          <input type="file" id="importAllFile" accept=".json" style="display:none;">
          <button class="btn btn-danger" id="loadDefaultsBtn">새 기획 기준으로 초기화</button>
          <button class="btn btn-success" id="backupBtn">백업 생성</button>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><h3>섹션별 내보내기/가져오기</h3></div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:8px;">
          ${sections.map((s) => `
            <div style="display:flex;gap:6px;align-items:center;">
              <span style="min-width:80px;font-size:13px;color:var(--text-dim);">${s.label}</span>
              <button class="btn btn-secondary btn-small export-section-btn" data-key="${s.key}">내보내기</button>
              <button class="btn btn-secondary btn-small import-section-btn" data-key="${s.key}">가져오기</button>
              <input type="file" class="import-section-file" data-key="${s.key}" accept=".json" style="display:none;">
            </div>
          `).join('')}
        </div>
      </div>

      <div class="card">
        <div class="card-header"><h3>백업 목록</h3></div>
        <div id="backupList">
          ${backups.length === 0 ? '<p style="color:var(--text-dim);font-size:13px;">저장된 백업이 없습니다.</p>' :
            backups.map((b) => `
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
                <span style="font-size:12px;color:var(--text-dim);min-width:160px;">${b.date}</span>
                <button class="btn btn-secondary btn-small restore-backup-btn" data-key="${b.key}">복구</button>
                <button class="btn btn-danger btn-small delete-backup-btn" data-key="${b.key}">삭제</button>
              </div>
            `).join('')}
        </div>
      </div>
    `;

    container.querySelector('#exportGameDataBtn').onclick = () => this._exportGameDataFiles();
    container.querySelector('#exportAllBtn').onclick = () => this.exportAll();
    container.querySelector('#importAllBtn').onclick = () => container.querySelector('#importAllFile').click();
    container.querySelector('#importAllFile').onchange = async (e) => {
      if (e.target.files[0]) {
        await this.importAll(e.target.files[0]);
        this.render(container);
        if (window.adminApp) window.adminApp.renderDashboard();
      }
    };
    container.querySelector('#loadDefaultsBtn').onclick = () => {
      if (confirm('현재 관리자 데이터를 새 기획 기준 기본값으로 교체하고 커스텀 스프라이트를 초기화합니다. 계속할까요?')) {
        this.loadDefaults();
        this.render(container);
        if (window.adminApp) window.adminApp.renderDashboard();
      }
    };
    container.querySelector('#backupBtn').onclick = () => { this.backup(); this.render(container); };

    container.querySelectorAll('.export-section-btn').forEach((btn) => {
      btn.onclick = () => this.exportSection(btn.dataset.key);
    });
    container.querySelectorAll('.import-section-btn').forEach((btn) => {
      btn.onclick = () => container.querySelector(`.import-section-file[data-key="${btn.dataset.key}"]`).click();
    });
    container.querySelectorAll('.import-section-file').forEach((input) => {
      input.onchange = async (e) => {
        if (e.target.files[0]) {
          await this.importSection(input.dataset.key, e.target.files[0]);
          this.render(container);
        }
      };
    });
    container.querySelectorAll('.restore-backup-btn').forEach((btn) => {
      btn.onclick = () => {
        if (confirm('현재 데이터를 이 백업으로 교체할까요?')) {
          this.restoreBackup(btn.dataset.key);
          this.render(container);
        }
      };
    });
    container.querySelectorAll('.delete-backup-btn').forEach((btn) => {
      btn.onclick = () => { this.deleteBackup(btn.dataset.key); this.render(container); };
    });
  }
}
