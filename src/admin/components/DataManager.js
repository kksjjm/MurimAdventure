// =============================================================================
// DataManager - Load/Save/Import/Export game data
// =============================================================================

import {
  DEFAULT_ITEMS as ITEMS,
  DEFAULT_MONSTERS as MONSTERS,
  DEFAULT_SKILLS as SKILLS,
  DEFAULT_SKILL_COMBINATIONS as SKILL_COMBINATIONS,
  SPAWN_CONFIG,
  DEFAULT_PLAYER_STATS, LEVEL_UP_GAINS
} from '../../data/defaultData.js';

const STORAGE_KEY = 'murimAdventure_adminData';

function arrayToDict(arr) {
  const dict = {};
  for (const item of arr) {
    if (item && item.id) dict[item.id] = item;
  }
  return dict;
}

function getDefaultData() {
  return {
    items: arrayToDict(JSON.parse(JSON.stringify(ITEMS))),
    skills: arrayToDict(JSON.parse(JSON.stringify(SKILLS))),
    skillCombinations: JSON.parse(JSON.stringify(SKILL_COMBINATIONS)),
    monsters: arrayToDict(JSON.parse(JSON.stringify(MONSTERS))),
    maps: [
      {
        id: 'map_green_forest', name: '녹림', width: 20, height: 15, tileSize: 32,
        layers: { ground: [], objects: [], collision: [] },
        spawnPoints: { player: { x: 2, y: 2 }, monsters: [], npcs: [], items: [] }
      }
    ],
    quests: [
      {
        id: 'quest_first_hunt', name: '첫 사냥',
        description: '마을 주변의 멧돼지를 처치하여 무인으로서의 첫 발을 내딛자.',
        type: 'main', prerequisites: [],
        objectives: [{ type: 'kill', targetId: 'wild_boar', count: 3, description: '멧돼지 3마리 처치' }],
        rewards: { exp: 50, gold: 30, items: ['hp_potion_small'], skills: [] },
        dialogues: [
          { npcName: '마을 촌장', text: '젊은이, 마을 주변 멧돼지들이 너무 늘었다네.' },
          { npcName: '마을 촌장', text: '수고했네! 자네에게 재능이 있구만.' }
        ]
      }
    ],
    events: [
      {
        id: 'event_double_exp', name: '무공 수련 대축제',
        description: '모든 경험치가 2배로 증가합니다.', type: 'bonus_exp',
        startDate: '2026-01-01', endDate: '2026-01-07', multiplier: 2.0, rewards: [], active: false
      }
    ],
    mounts: [
      {
        id: 'mount_brown_horse', name: '갈색 말', speedBonus: 30, abilities: [],
        rarity: 'COMMON', obtainMethod: '마을 마구간에서 구매 (500금)',
        levelTiers: [{ level: 1, speedBonus: 30 }, { level: 5, speedBonus: 45 }, { level: 10, speedBonus: 60 }]
      }
    ],
    pets: [
      {
        id: 'pet_fire_fox', name: '화여우', stats: { ATK: 10, DEF: 5, HP: 60 },
        abilities: ['화염 공격', '위협 울음'], growthSystem: { expPerLevel: 100, maxLevel: 20 },
        elementAffinity: 'FIRE', rarity: 'RARE',
        evolutionTiers: [
          { tier: 1, name: '화여우', level: 1 },
          { tier: 2, name: '염호', level: 10 },
          { tier: 3, name: '구미호', level: 20 }
        ]
      }
    ],
    statsConfig: {
      levelUpGrowth: JSON.parse(JSON.stringify(LEVEL_UP_GAINS)),
      combatFormulas: {
        physicalDamageCoeff: 1.5, magicalDamageCoeff: 1.3,
        defenseReductionCoeff: 0.8, critMultiplierBase: 1.5,
        evasionCap: 0.75, accuracyBase: 0.85
      },
      dropRateMultipliers: { baseRate: 1.0, luckCoeff: 0.01, itemFindCoeff: 0.02 },
      expCurve: { baseExp: 100, growthFactor: 1.15, maxLevel: 100 },
      proficiencyThresholds: {
        BEGINNER: 0, INTERMEDIATE: 100, ADVANCED: 500, EXPERT: 1500,
        MASTER: 4000, GRANDMASTER: 10000, TRANSCENDENT: 25000
      }
    },
    gameSettings: {
      gameTitle: '무림기행', version: '0.1.0',
      startingStats: JSON.parse(JSON.stringify(DEFAULT_PLAYER_STATS)),
      inventorySize: 30, maxLevel: 100,
      globalMultipliers: { expMultiplier: 1.0, goldMultiplier: 1.0, dropRateMultiplier: 1.0, damageMultiplier: 1.0 },
      featureToggles: {
        pvpEnabled: false, tradingEnabled: true, mountSystemEnabled: true,
        petSystemEnabled: true, craftingEnabled: false, guildSystemEnabled: false
      }
    },
    spawnConfig: JSON.parse(JSON.stringify(SPAWN_CONFIG))
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
        // Migrate: if items/skills/monsters are arrays, convert to id-keyed objects
        if (Array.isArray(this.data.items)) {
          this.data.items = arrayToDict(this.data.items);
        }
        if (Array.isArray(this.data.skills)) {
          this.data.skills = arrayToDict(this.data.skills);
        }
        if (Array.isArray(this.data.monsters)) {
          this.data.monsters = arrayToDict(this.data.monsters);
        }
        this.save(); // persist migration
      } catch (e) {
        console.error('Failed to parse stored data, loading defaults', e);
        this.data = getDefaultData();
        this.save();
      }
    } else {
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
    a.download = `murim_data_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    window.showToast('전체 데이터가 내보내기 되었습니다.', 'success');
  }

  exportSection(sectionKey) {
    const sectionData = this.data[sectionKey];
    if (!sectionData) { window.showToast('해당 섹션 데이터가 없습니다.', 'error'); return; }
    const blob = new Blob([JSON.stringify(sectionData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `murim_${sectionKey}_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    window.showToast(`${sectionKey} 데이터가 내보내기 되었습니다.`, 'success');
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
          this.data = imported;
          this.save();
          window.showToast('데이터를 성공적으로 가져왔습니다.', 'success');
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
          const imported = JSON.parse(e.target.result);
          this.data[sectionKey] = imported;
          this.save();
          window.showToast(`${sectionKey} 데이터를 성공적으로 가져왔습니다.`, 'success');
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
    return requiredKeys.every(key => key in data);
  }

  loadDefaults() {
    this.data = getDefaultData();
    this.save();
    window.showToast('기본 데이터로 초기화되었습니다.', 'success');
  }

  backup() {
    const backupKey = `${STORAGE_KEY}_backup_${Date.now()}`;
    localStorage.setItem(backupKey, JSON.stringify(this.data));
    window.showToast('백업이 생성되었습니다.', 'success');
    return backupKey;
  }

  getBackups() {
    const backups = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`${STORAGE_KEY}_backup_`)) {
        const ts = parseInt(key.split('_backup_')[1]);
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
      window.showToast('백업에서 복구되었습니다.', 'success');
    }
  }

  deleteBackup(backupKey) {
    localStorage.removeItem(backupKey);
    window.showToast('백업이 삭제되었습니다.', 'info');
  }

  // Render data management UI
  render(container) {
    const sections = [
      { key: 'items', label: '아이템' },
      { key: 'skills', label: '스킬' },
      { key: 'monsters', label: '몬스터' },
      { key: 'maps', label: '맵' },
      { key: 'quests', label: '퀘스트' },
      { key: 'events', label: '이벤트' },
      { key: 'mounts', label: '탈것' },
      { key: 'pets', label: '환수' },
      { key: 'statsConfig', label: '능력치 설정' },
      { key: 'gameSettings', label: '게임 설정' },
      { key: 'spawnConfig', label: '스폰 설정' },
    ];

    const backups = this.getBackups();

    container.innerHTML = `
      <div class="section-header">
        <h2>데이터 관리 <small>Data Import/Export</small></h2>
      </div>

      <div class="card">
        <div class="card-header"><h3>전체 데이터</h3></div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          <button class="btn btn-primary" id="exportAllBtn">전체 내보내기 (JSON)</button>
          <button class="btn btn-secondary" id="importAllBtn">전체 가져오기</button>
          <input type="file" id="importAllFile" accept=".json" style="display:none;">
          <button class="btn btn-danger" id="loadDefaultsBtn">기본 데이터 초기화</button>
          <button class="btn btn-success" id="backupBtn">백업 생성</button>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><h3>섹션별 내보내기/가져오기</h3></div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:8px;">
          ${sections.map(s => `
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
            backups.map(b => `
              <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
                <span style="font-size:12px;color:var(--text-dim);min-width:160px;">${b.date}</span>
                <button class="btn btn-secondary btn-small restore-backup-btn" data-key="${b.key}">복구</button>
                <button class="btn btn-danger btn-small delete-backup-btn" data-key="${b.key}">삭제</button>
              </div>
            `).join('')}
        </div>
      </div>
    `;

    // Bind events
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
      if (confirm('모든 데이터가 초기값으로 대체됩니다. 계속하시겠습니까?')) {
        this.loadDefaults();
        this.render(container);
        if (window.adminApp) window.adminApp.renderDashboard();
      }
    };
    container.querySelector('#backupBtn').onclick = () => { this.backup(); this.render(container); };

    container.querySelectorAll('.export-section-btn').forEach(btn => {
      btn.onclick = () => this.exportSection(btn.dataset.key);
    });
    container.querySelectorAll('.import-section-btn').forEach(btn => {
      btn.onclick = () => {
        container.querySelector(`.import-section-file[data-key="${btn.dataset.key}"]`).click();
      };
    });
    container.querySelectorAll('.import-section-file').forEach(input => {
      input.onchange = async (e) => {
        if (e.target.files[0]) {
          await this.importSection(input.dataset.key, e.target.files[0]);
          this.render(container);
        }
      };
    });
    container.querySelectorAll('.restore-backup-btn').forEach(btn => {
      btn.onclick = () => {
        if (confirm('현재 데이터를 이 백업으로 교체합니다. 계속하시겠습니까?')) {
          this.restoreBackup(btn.dataset.key);
          this.render(container);
        }
      };
    });
    container.querySelectorAll('.delete-backup-btn').forEach(btn => {
      btn.onclick = () => { this.deleteBackup(btn.dataset.key); this.render(container); };
    });
  }
}
