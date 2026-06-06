// =============================================================================
// GameSettingsEditor - 게임 설정
// =============================================================================

import { STATS } from '../../data/constants.js';

export class GameSettingsEditor {
  constructor(dataManager) {
    this.dm = dataManager;
  }

  getSettings() {
    if (!this.dm.data.gameSettings) {
      this.dm.data.gameSettings = {
        gameTitle: '무림기행', version: '0.1.0',
        startingStats: {}, inventorySize: 30, maxLevel: 100,
        globalMultipliers: { expMultiplier: 1.0, goldMultiplier: 1.0, dropRateMultiplier: 1.0, damageMultiplier: 1.0 },
        featureToggles: {}
      };
    }
    return this.dm.data.gameSettings;
  }

  render(container) {
    const settings = this.getSettings();
    const startingStats = settings.startingStats || {};
    const multipliers = settings.globalMultipliers || {};
    const toggles = settings.featureToggles || {};

    const statKeys = Object.keys(STATS);
    const toggleLabels = {
      pvpEnabled: 'PvP 시스템',
      tradingEnabled: '거래 시스템',
      mountSystemEnabled: '탈것 시스템',
      petSystemEnabled: '환수 시스템',
      craftingEnabled: '제작 시스템',
      guildSystemEnabled: '문파 시스템',
    };

    container.innerHTML = `
      <div class="section-header">
        <h2>게임 설정 <small>Game Settings</small></h2>
        <button class="btn btn-primary" id="saveSettingsBtn">설정 저장</button>
      </div>

      <!-- General -->
      <div class="card">
        <div class="card-header"><h3>일반 설정</h3></div>
        <div class="form-row">
          <div class="form-group"><label>게임 제목</label><input type="text" id="settTitle" value="${settings.gameTitle || ''}"></div>
          <div class="form-group"><label>버전</label><input type="text" id="settVersion" value="${settings.version || ''}"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>인벤토리 크기</label><input type="number" id="settInvSize" value="${settings.inventorySize || 30}" min="1"></div>
          <div class="form-group"><label>최대 레벨</label><input type="number" id="settMaxLevel" value="${settings.maxLevel || 100}" min="1"></div>
        </div>
      </div>

      <!-- Starting Stats -->
      <div class="card">
        <div class="card-header"><h3>초기 캐릭터 능력치</h3></div>
        <div class="form-row" style="flex-wrap:wrap;" id="startStatInputs">
          ${statKeys.map(k => `
            <div class="form-group" style="flex:0 0 calc(20% - 10px);min-width:120px;">
              <label>${STATS[k].nameKo} (${k})</label>
              <input type="number" class="start-stat" data-key="${k}" value="${startingStats[k] || 0}">
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Global Multipliers -->
      <div class="card">
        <div class="card-header"><h3>글로벌 배율</h3></div>
        <div class="form-row" style="flex-wrap:wrap;" id="multInputs">
          <div class="form-group" style="flex:0 0 calc(25% - 9px);">
            <label>경험치 배율</label>
            <input type="number" class="mult-input" data-key="expMultiplier" value="${multipliers.expMultiplier ?? 1}" step="0.1" min="0">
            <input type="range" class="mult-slider" data-key="expMultiplier" value="${(multipliers.expMultiplier ?? 1) * 10}" min="0" max="50" style="width:100%;margin-top:4px;">
          </div>
          <div class="form-group" style="flex:0 0 calc(25% - 9px);">
            <label>골드 배율</label>
            <input type="number" class="mult-input" data-key="goldMultiplier" value="${multipliers.goldMultiplier ?? 1}" step="0.1" min="0">
            <input type="range" class="mult-slider" data-key="goldMultiplier" value="${(multipliers.goldMultiplier ?? 1) * 10}" min="0" max="50" style="width:100%;margin-top:4px;">
          </div>
          <div class="form-group" style="flex:0 0 calc(25% - 9px);">
            <label>드롭률 배율</label>
            <input type="number" class="mult-input" data-key="dropRateMultiplier" value="${multipliers.dropRateMultiplier ?? 1}" step="0.1" min="0">
            <input type="range" class="mult-slider" data-key="dropRateMultiplier" value="${(multipliers.dropRateMultiplier ?? 1) * 10}" min="0" max="50" style="width:100%;margin-top:4px;">
          </div>
          <div class="form-group" style="flex:0 0 calc(25% - 9px);">
            <label>피해 배율</label>
            <input type="number" class="mult-input" data-key="damageMultiplier" value="${multipliers.damageMultiplier ?? 1}" step="0.1" min="0">
            <input type="range" class="mult-slider" data-key="damageMultiplier" value="${(multipliers.damageMultiplier ?? 1) * 10}" min="0" max="50" style="width:100%;margin-top:4px;">
          </div>
        </div>
      </div>

      <!-- Feature Toggles -->
      <div class="card">
        <div class="card-header"><h3>기능 토글</h3></div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;" id="toggleInputs">
          ${Object.entries(toggleLabels).map(([key, label]) => `
            <div class="toggle" data-key="${key}">
              <div class="toggle-track ${toggles[key] ? 'on' : ''}">
                <div class="toggle-thumb"></div>
              </div>
              <span class="toggle-label">${label}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Bind multiplier sliders
    container.querySelectorAll('.mult-slider').forEach(slider => {
      slider.oninput = () => {
        const key = slider.dataset.key;
        const val = parseInt(slider.value) / 10;
        container.querySelector(`.mult-input[data-key="${key}"]`).value = val.toFixed(1);
      };
    });
    container.querySelectorAll('.mult-input').forEach(inp => {
      inp.oninput = () => {
        const key = inp.dataset.key;
        const slider = container.querySelector(`.mult-slider[data-key="${key}"]`);
        if (slider) slider.value = parseFloat(inp.value) * 10;
      };
    });

    // Bind toggles
    container.querySelectorAll('.toggle').forEach(toggle => {
      toggle.onclick = () => {
        const track = toggle.querySelector('.toggle-track');
        track.classList.toggle('on');
      };
    });

    // Save
    container.querySelector('#saveSettingsBtn').onclick = () => {
      const startingStats = {};
      container.querySelectorAll('.start-stat').forEach(inp => {
        startingStats[inp.dataset.key] = parseFloat(inp.value) || 0;
      });

      const globalMultipliers = {};
      container.querySelectorAll('.mult-input').forEach(inp => {
        globalMultipliers[inp.dataset.key] = parseFloat(inp.value) || 1;
      });

      const featureToggles = {};
      container.querySelectorAll('.toggle').forEach(toggle => {
        featureToggles[toggle.dataset.key] = toggle.querySelector('.toggle-track').classList.contains('on');
      });

      this.dm.data.gameSettings = {
        gameTitle: container.querySelector('#settTitle').value.trim(),
        version: container.querySelector('#settVersion').value.trim(),
        startingStats,
        inventorySize: parseInt(container.querySelector('#settInvSize').value) || 30,
        maxLevel: parseInt(container.querySelector('#settMaxLevel').value) || 100,
        globalMultipliers,
        featureToggles,
      };
      this.dm.save();
      window.showToast('게임 설정이 저장되었습니다.', 'success');

      // Update header version badge
      const vb = document.getElementById('versionBadge');
      if (vb) vb.textContent = `v${this.dm.data.gameSettings.version}`;
    };
  }
}
