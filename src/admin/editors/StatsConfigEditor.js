// =============================================================================
// StatsConfigEditor - 능력치 설정
// =============================================================================

import { STATS, PROFICIENCY_LEVELS } from '../../data/constants.js';

export class StatsConfigEditor {
  constructor(dataManager) {
    this.dm = dataManager;
  }

  getConfig() {
    if (!this.dm.data.statsConfig) {
      this.dm.data.statsConfig = {
        levelUpGrowth: { maxHP: 15, maxMP: 8, STR: 2, AGI: 1, INT: 1, LUK: 1, DEF: 1, ATK: 2 },
        combatFormulas: {
          physicalDamageCoeff: 1.5, magicalDamageCoeff: 1.3,
          defenseReductionCoeff: 0.8, critMultiplierBase: 1.5,
          evasionCap: 0.75, accuracyBase: 0.85
        },
        dropRateMultipliers: { baseRate: 1.0, luckCoeff: 0.01, itemFindCoeff: 0.02 },
        expCurve: { baseExp: 100, growthFactor: 1.15, maxLevel: 100 },
        proficiencyThresholds: {}
      };
    }
    return this.dm.data.statsConfig;
  }

  render(container) {
    const config = this.getConfig();

    // Compute exp preview
    const expPreview = [];
    for (let lv = 1; lv <= Math.min(20, config.expCurve?.maxLevel || 100); lv++) {
      const exp = Math.floor((config.expCurve?.baseExp || 100) * Math.pow(config.expCurve?.growthFactor || 1.15, lv - 1));
      expPreview.push({ level: lv, exp });
    }

    // Stat growth preview
    const growthKeys = Object.keys(config.levelUpGrowth || {});
    const growthPreview = [5, 10, 20, 50].map(lv => {
      const row = { level: lv };
      growthKeys.forEach(k => {
        row[k] = (config.levelUpGrowth[k] || 0) * lv;
      });
      return row;
    });

    // Combat preview
    const cf = config.combatFormulas || {};

    container.innerHTML = `
      <div class="section-header">
        <h2>능력치 설정 <small>Stats Configuration</small></h2>
        <button class="btn btn-primary" id="saveStatsConfigBtn">설정 저장</button>
      </div>

      <!-- Level-up Growth -->
      <div class="card">
        <div class="card-header"><h3>레벨업 능력치 성장률</h3></div>
        <div class="form-row" style="flex-wrap:wrap;" id="growthInputs">
          ${growthKeys.map(k => `
            <div class="form-group" style="flex:0 0 calc(25% - 9px);">
              <label>${STATS[k]?.nameKo || k} (${k})</label>
              <input type="number" class="growth-input" data-key="${k}" value="${config.levelUpGrowth[k] || 0}" step="0.5">
            </div>
          `).join('')}
        </div>
        <h4 style="color:var(--gold);font-size:12px;margin:12px 0 6px;">성장 미리보기 (레벨별 누적 보너스)</h4>
        <div class="table-container">
          <table class="data-table" style="font-size:12px;">
            <thead><tr><th>레벨</th>${growthKeys.map(k => `<th>${k}</th>`).join('')}</tr></thead>
            <tbody>
              ${growthPreview.map(row => `<tr>
                <td style="color:var(--gold);">Lv.${row.level}</td>
                ${growthKeys.map(k => `<td>+${row[k]}</td>`).join('')}
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Combat Formulas -->
      <div class="card">
        <div class="card-header"><h3>전투 공식 계수</h3></div>
        <div class="form-row" style="flex-wrap:wrap;" id="combatInputs">
          <div class="form-group" style="flex:0 0 calc(33% - 8px);">
            <label>물리 피해 계수</label>
            <input type="number" class="combat-input" data-key="physicalDamageCoeff" value="${cf.physicalDamageCoeff || 1.5}" step="0.1">
          </div>
          <div class="form-group" style="flex:0 0 calc(33% - 8px);">
            <label>마법 피해 계수</label>
            <input type="number" class="combat-input" data-key="magicalDamageCoeff" value="${cf.magicalDamageCoeff || 1.3}" step="0.1">
          </div>
          <div class="form-group" style="flex:0 0 calc(33% - 8px);">
            <label>방어 감소 계수</label>
            <input type="number" class="combat-input" data-key="defenseReductionCoeff" value="${cf.defenseReductionCoeff || 0.8}" step="0.1">
          </div>
          <div class="form-group" style="flex:0 0 calc(33% - 8px);">
            <label>치명타 기본 배율</label>
            <input type="number" class="combat-input" data-key="critMultiplierBase" value="${cf.critMultiplierBase || 1.5}" step="0.1">
          </div>
          <div class="form-group" style="flex:0 0 calc(33% - 8px);">
            <label>회피 상한</label>
            <input type="number" class="combat-input" data-key="evasionCap" value="${cf.evasionCap || 0.75}" step="0.05" min="0" max="1">
          </div>
          <div class="form-group" style="flex:0 0 calc(33% - 8px);">
            <label>기본 명중률</label>
            <input type="number" class="combat-input" data-key="accuracyBase" value="${cf.accuracyBase || 0.85}" step="0.05" min="0" max="1">
          </div>
        </div>
        <div style="margin-top:12px;font-size:12px;color:var(--text-dim);">
          <div>물리 피해 = ATK x ${cf.physicalDamageCoeff || 1.5} - DEF x ${cf.defenseReductionCoeff || 0.8}</div>
          <div>마법 피해 = INT x ${cf.magicalDamageCoeff || 1.3} - SPIRIT x ${cf.defenseReductionCoeff || 0.8}</div>
          <div>치명타 피해 = 기본 피해 x ${cf.critMultiplierBase || 1.5} x (CRIT_DMG / 100)</div>
        </div>
      </div>

      <!-- Drop Rate Multipliers -->
      <div class="card">
        <div class="card-header"><h3>드롭률 계수</h3></div>
        <div class="form-row" id="dropRateInputs">
          <div class="form-group"><label>기본 드롭률</label><input type="number" class="drop-input" data-key="baseRate" value="${config.dropRateMultipliers?.baseRate || 1}" step="0.1"></div>
          <div class="form-group"><label>LUK 계수</label><input type="number" class="drop-input" data-key="luckCoeff" value="${config.dropRateMultipliers?.luckCoeff || 0.01}" step="0.005"></div>
          <div class="form-group"><label>ITEM_FIND 계수</label><input type="number" class="drop-input" data-key="itemFindCoeff" value="${config.dropRateMultipliers?.itemFindCoeff || 0.02}" step="0.005"></div>
        </div>
        <div style="margin-top:8px;font-size:12px;color:var(--text-dim);">
          실제 드롭률 = 기본 확률 x ${config.dropRateMultipliers?.baseRate || 1} x (1 + LUK x ${config.dropRateMultipliers?.luckCoeff || 0.01} + ITEM_FIND x ${config.dropRateMultipliers?.itemFindCoeff || 0.02})
        </div>
      </div>

      <!-- EXP Curve -->
      <div class="card">
        <div class="card-header"><h3>경험치 곡선</h3></div>
        <div class="form-row" id="expInputs">
          <div class="form-group"><label>기본 경험치</label><input type="number" class="exp-input" data-key="baseExp" value="${config.expCurve?.baseExp || 100}"></div>
          <div class="form-group"><label>성장 배수</label><input type="number" class="exp-input" data-key="growthFactor" value="${config.expCurve?.growthFactor || 1.15}" step="0.01"></div>
          <div class="form-group"><label>최대 레벨</label><input type="number" class="exp-input" data-key="maxLevel" value="${config.expCurve?.maxLevel || 100}"></div>
        </div>
        <h4 style="color:var(--gold);font-size:12px;margin:12px 0 6px;">경험치 미리보기</h4>
        <div style="display:flex;flex-wrap:wrap;gap:6px;">
          ${expPreview.map(p => `
            <div style="background:var(--bg-input);border:1px solid var(--border);border-radius:4px;padding:4px 8px;font-size:11px;min-width:100px;">
              <span style="color:var(--gold);">Lv.${p.level}</span>
              <span style="color:var(--text-dim);margin-left:4px;">${p.exp.toLocaleString()} EXP</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Proficiency Thresholds -->
      <div class="card">
        <div class="card-header"><h3>숙련도 단계 임계치</h3></div>
        <div class="form-row" style="flex-wrap:wrap;" id="profInputs">
          ${Object.entries(PROFICIENCY_LEVELS).map(([key, def]) => `
            <div class="form-group" style="flex:0 0 calc(25% - 9px);">
              <label>${def.nameKo} (${key})</label>
              <input type="number" class="prof-input" data-key="${key}" value="${config.proficiencyThresholds?.[key] ?? def.threshold}">
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Save handler
    container.querySelector('#saveStatsConfigBtn').onclick = () => {
      // Gather all inputs
      const levelUpGrowth = {};
      container.querySelectorAll('.growth-input').forEach(inp => {
        levelUpGrowth[inp.dataset.key] = parseFloat(inp.value) || 0;
      });

      const combatFormulas = {};
      container.querySelectorAll('.combat-input').forEach(inp => {
        combatFormulas[inp.dataset.key] = parseFloat(inp.value) || 0;
      });

      const dropRateMultipliers = {};
      container.querySelectorAll('.drop-input').forEach(inp => {
        dropRateMultipliers[inp.dataset.key] = parseFloat(inp.value) || 0;
      });

      const expCurve = {};
      container.querySelectorAll('.exp-input').forEach(inp => {
        expCurve[inp.dataset.key] = parseFloat(inp.value) || 0;
      });

      const proficiencyThresholds = {};
      container.querySelectorAll('.prof-input').forEach(inp => {
        proficiencyThresholds[inp.dataset.key] = parseInt(inp.value) || 0;
      });

      this.dm.data.statsConfig = {
        levelUpGrowth,
        combatFormulas,
        dropRateMultipliers,
        expCurve,
        proficiencyThresholds
      };
      this.dm.save();
      window.showToast('능력치 설정이 저장되었습니다.', 'success');
      this.render(container); // re-render to update previews
    };
  }
}
