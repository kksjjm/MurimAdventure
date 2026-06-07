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
} from '../../data/defaultData.js';

const STORAGE_KEY = 'moduRpg_adminData_v2';
const LEGACY_STORAGE_KEY = 'murimAdventure_adminData';
const CUSTOM_SPRITES_KEY = 'murimAdventure_customSprites';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function arrayToDict(arr) {
  const dict = {};
  for (const item of arr || []) {
    if (item && item.id) dict[item.id] = item;
  }
  return dict;
}

function getDefaultData() {
  return {
    schemaVersion: DATA_SCHEMA_VERSION,
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
    maps: [
      {
        id: 'map_arpg_test_field',
        name: 'ARPG 테스트 필드',
        width: 20,
        height: 15,
        tileSize: 32,
        module_id: 'world_system',
        layers: { ground: [], objects: [], collision: [] },
        spawnPoints: { player: { x: 2, y: 2 }, monsters: [], npcs: [], items: [] },
      },
    ],
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
        if (!this.data.mainCharacter) this.data.mainCharacter = getDefaultData().mainCharacter;
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
    window.showToast('새 기획 데이터와 박스 스프라이트 기준으로 초기화되었습니다.', 'success');
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
