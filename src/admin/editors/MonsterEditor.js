// =============================================================================
// MonsterEditor - 몬스터 관리
// =============================================================================

import { STATS, AI_BEHAVIOR } from '../../data/constants.js';
import { bindSpriteSelect, spriteSelectHtml } from '../components/SpriteSelect.js';

export class MonsterEditor {
  constructor(dataManager) {
    this.dm = dataManager;
    this.searchTerm = '';
    this.filterAI = '';
  }

  getMonsters() { return this.dm.data.monsters || {}; }
  getAIOptions() {
    return [AI_BEHAVIOR.PASSIVE, AI_BEHAVIOR.AGGRESSIVE];
  }

  getMonsterAI(monster) {
    return monster?.aiBehavior || monster?.ai || 'PASSIVE';
  }

  render(container) {
    const monsters = this.getMonsters();
    const monsterList = Object.values(monsters);

    let filtered = monsterList.filter(m => {
      if (this.searchTerm && !m.name?.includes(this.searchTerm) && !m.id?.includes(this.searchTerm)) return false;
      if (this.filterAI && this.getMonsterAI(m) !== this.filterAI) return false;
      return true;
    }).sort((a, b) => (a.level || 0) - (b.level || 0));

    const aiOptions = this.getAIOptions().map(a =>
      `<option value="${a.key}" ${this.filterAI === a.key ? 'selected' : ''}>${a.nameKo}</option>`
    ).join('');

    container.innerHTML = `
      <div class="section-header">
        <h2>몬스터 관리 <small>Monsters</small></h2>
        <button class="btn btn-primary" id="addMonsterBtn">+ 몬스터 추가</button>
      </div>

      <div class="toolbar">
        <input type="text" class="search-input" id="monsterSearch" placeholder="몬스터 검색..." value="${this.searchTerm}">
        <select class="filter-select" id="monsterAIFilter">
          <option value="">전체 AI 유형</option>
          ${aiOptions}
        </select>
        <span style="font-size:12px;color:var(--text-dim);">${filtered.length}마리</span>
      </div>

      <div class="table-container">
        <div class="table-scroll">
          <table class="data-table">
            <thead><tr>
              <th>ID</th><th>이름</th><th>레벨</th><th>HP</th><th>ATK</th><th>DEF</th><th>AI</th><th>경험치</th><th>골드</th><th>작업</th>
            </tr></thead>
            <tbody>
              ${filtered.map(m => {
                const aiValue = this.getMonsterAI(m);
                const aiDef = AI_BEHAVIOR[aiValue] || {};
                const lvColor = m.level <= 3 ? '#27ae60' : m.level <= 10 ? '#e67e22' : '#e74c3c';
                return `<tr>
                  <td style="font-size:11px;color:var(--text-dim);">${m.id}</td>
                  <td>${m.name || m.id}</td>
                  <td><span style="color:${lvColor};font-weight:700;">Lv.${m.level || 1}</span></td>
                  <td>${m.stats?.HP || m.stats?.maxHP || '-'}</td>
                  <td>${m.stats?.ATK || '-'}</td>
                  <td>${m.stats?.DEF || '-'}</td>
                  <td><span class="badge badge-blue">${aiDef.nameKo || aiValue || '-'}</span></td>
                  <td>${m.exp || '-'}</td>
                  <td>${typeof m.gold === 'object' ? `${m.gold.min}-${m.gold.max}` : m.gold || '-'}</td>
                  <td>
                    <button class="btn btn-secondary btn-small edit-mon-btn" data-id="${m.id}">편집</button>
                    <button class="btn btn-danger btn-small delete-mon-btn" data-id="${m.id}">삭제</button>
                  </td>
                </tr>`;
              }).join('')}
              ${filtered.length === 0 ? '<tr><td colspan="10" style="text-align:center;color:var(--text-dim);">몬스터가 없습니다.</td></tr>' : ''}
            </tbody>
          </table>
        </div>
      </div>
    `;

    container.querySelector('#monsterSearch').oninput = (e) => { this.searchTerm = e.target.value; this.render(container); };
    container.querySelector('#monsterAIFilter').onchange = (e) => { this.filterAI = e.target.value; this.render(container); };
    container.querySelector('#addMonsterBtn').onclick = () => this.openEditor(container, null);
    container.querySelectorAll('.edit-mon-btn').forEach(btn => {
      btn.onclick = () => this.openEditor(container, btn.dataset.id);
    });
    container.querySelectorAll('.delete-mon-btn').forEach(btn => {
      btn.onclick = () => {
        if (confirm(`"${btn.dataset.id}" 몬스터를 삭제하시겠습니까?`)) {
          delete this.dm.data.monsters[btn.dataset.id];
          this.dm.save();
          this.render(container);
          window.showToast('몬스터가 삭제되었습니다.', 'success');
        }
      };
    });
  }

  openEditor(root, monsterId) {
    const isNew = !monsterId;
    const mon = isNew ? {
      id: '', name: '', level: 1,
      stats: { HP: 50, maxHP: 50, ATK: 10, DEF: 5, SPD: 80, ACCURACY: 85, EVASION: 5, CRIT_RATE: 5, CRIT_DMG: 130 },
      ai: 'PASSIVE', aiBehavior: 'PASSIVE', chaseRange: 100, attackRange: 30, attackSpeed: 1000,
      exp: 20, gold: { min: 5, max: 15 },
      drops: [], spriteKey: '', tint: 0xffffff
    } : JSON.parse(JSON.stringify(this.dm.data.monsters[monsterId] || {}));

    if (!mon.id && monsterId) { mon.id = monsterId; }
    if (!mon.stats) mon.stats = {};
    if (!mon.drops) mon.drops = [];
    if (typeof mon.gold !== 'object') mon.gold = { min: mon.gold || 0, max: mon.gold || 0 };

    const selectedAI = this.getMonsterAI(mon);
    const aiOptions = this.getAIOptions().map(a =>
      `<option value="${a.key}" ${selectedAI === a.key ? 'selected' : ''}>${a.nameKo}${a.description ? ` - ${a.description}` : ''}</option>`
    ).join('');

    const monsterStats = ['HP', 'maxHP', 'ATK', 'DEF', 'SPD', 'ACCURACY', 'EVASION', 'CRIT_RATE', 'CRIT_DMG'];
    const statsHtml = monsterStats.map(key => `
      <div class="form-group" style="flex:0 0 calc(33% - 8px);">
        <label>${STATS[key]?.nameKo || key} (${key})</label>
        <input type="number" class="monster-stat" data-key="${key}" value="${mon.stats[key] || 0}">
      </div>
    `).join('');

    const itemIds = Object.keys(this.dm.data.items || {});
    const dropRows = mon.drops.map((drop, i) => this._dropRowHtml(drop, i, itemIds)).join('');
    const impactConfigJson = mon.impactConfig ? JSON.stringify(mon.impactConfig, null, 2) : '';

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal" style="max-width:800px;">
        <div class="modal-header">
          <h3>${isNew ? '새 몬스터 추가' : '몬스터 편집'}</h3>
          <button class="btn btn-secondary btn-small modal-close-btn">X</button>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <div class="form-group"><label>ID</label><input type="text" id="editMonId" value="${mon.id}" ${isNew ? '' : 'readonly style="opacity:0.6;"'}></div>
            <div class="form-group"><label>이름</label><input type="text" id="editMonName" value="${mon.name || ''}"></div>
            <div class="form-group"><label>레벨</label><input type="number" id="editMonLevel" value="${mon.level || 1}" min="1"></div>
          </div>

          <h4 style="color:var(--gold);font-size:13px;margin:12px 0 8px;">능력치</h4>
          <div class="form-row" style="flex-wrap:wrap;">${statsHtml}</div>

          <div class="form-row">
            <div class="form-group"><label>AI 행동</label><select id="editMonAI">${aiOptions}</select></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>추적 범위</label><input type="number" id="editMonChase" value="${mon.chaseRange || 100}"></div>
            <div class="form-group"><label>공격 범위</label><input type="number" id="editMonAtkRange" value="${mon.attackRange || 30}"></div>
            <div class="form-group"><label>공격 속도 (ms)</label><input type="number" id="editMonAtkSpd" value="${mon.attackSpeed || 1000}"></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>경험치 보상</label><input type="number" id="editMonExp" value="${mon.exp || 0}"></div>
            <div class="form-group"><label>최소 골드</label><input type="number" id="editMonGoldMin" value="${mon.gold.min || 0}"></div>
            <div class="form-group"><label>최대 골드</label><input type="number" id="editMonGoldMax" value="${mon.gold.max || 0}"></div>
          </div>
          <div class="form-row">
            <div class="form-group" style="flex:2;">
              <label>스프라이트 키</label>
              ${spriteSelectHtml({ id: 'editMonSprite', value: mon.spriteKey || mon.sprite || '', placeholder: '몬스터 스프라이트 검색...' })}
              <small style="color:var(--text-dim);font-size:10px;">스프라이트 에디터에서 커스텀 몬스터 스프라이트를 생성할 수 있습니다</small>
            </div>
            <div class="form-group"><label>틴트 (hex)</label><input type="text" id="editMonTint" value="${typeof mon.tint === 'number' ? '0x' + mon.tint.toString(16) : mon.tint || ''}"></div>
          </div>

          <h4 style="color:var(--gold);font-size:13px;margin:16px 0 8px;">공격/피격 연출 JSON</h4>
          <div class="form-group">
            <textarea id="editMonImpactConfig" style="min-height:120px;font-family:monospace;font-size:12px;" placeholder='{"receiveHitEffect":{"flashColor":16711680,"particleCount":4}}'>${impactConfigJson}</textarea>
            <small style="color:var(--text-dim);font-size:10px;">몬스터가 플레이어를 공격했을 때 플레이어가 받는 피격 플래시/파티클/화면 흔들림을 관리합니다.</small>
          </div>

          <h4 style="color:var(--gold);font-size:13px;margin:16px 0 8px;">드롭 테이블</h4>
          <div id="dropTableList">${dropRows}</div>
          <button class="btn btn-secondary btn-small" id="addDropBtn" style="margin-top:6px;">+ 드롭 추가</button>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary modal-close-btn">취소</button>
          <button class="btn btn-primary" id="saveMonBtn">저장</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    overlay.querySelectorAll('.modal-close-btn').forEach(b => b.onclick = () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    bindSpriteSelect(overlay, 'editMonSprite');

    // Add drop
    overlay.querySelector('#addDropBtn').onclick = () => {
      const list = overlay.querySelector('#dropTableList');
      const idx = list.children.length;
      list.insertAdjacentHTML('beforeend', this._dropRowHtml({ itemId: '', chance: 0.1 }, idx, itemIds));
      this._bindDropRemove(overlay);
      this._bindDropSliders(overlay);
    };
    this._bindDropRemove(overlay);
    this._bindDropSliders(overlay);

    // Save
    overlay.querySelector('#saveMonBtn').onclick = () => {
      const id = overlay.querySelector('#editMonId').value.trim();
      if (!id) { window.showToast('ID를 입력해주세요.', 'error'); return; }

      const stats = {};
      overlay.querySelectorAll('.monster-stat').forEach(inp => {
        stats[inp.dataset.key] = parseFloat(inp.value) || 0;
      });

      const drops = [];
      overlay.querySelectorAll('.drop-row').forEach(row => {
        const itemId = row.querySelector('.drop-item-select')?.value;
        const chance = parseFloat(row.querySelector('.drop-chance')?.value) || 0;
        if (itemId) drops.push({ itemId, chance });
      });

      const tintStr = overlay.querySelector('#editMonTint').value.trim();
      let tint = 0xffffff;
      if (tintStr) {
        tint = tintStr.startsWith('0x') ? parseInt(tintStr, 16) : parseInt(tintStr);
        if (isNaN(tint)) tint = 0xffffff;
      }

      let impactConfig = null;
      const impactConfigText = overlay.querySelector('#editMonImpactConfig').value.trim();
      if (impactConfigText) {
        try { impactConfig = JSON.parse(impactConfigText); } catch (e) { window.showToast('공격/피격 연출 JSON 형식 오류', 'error'); return; }
      }

      const saved = {
        id,
        name: overlay.querySelector('#editMonName').value.trim(),
        level: parseInt(overlay.querySelector('#editMonLevel').value) || 1,
        stats,
        ai: overlay.querySelector('#editMonAI').value,
        aiBehavior: overlay.querySelector('#editMonAI').value,
        chaseRange: parseInt(overlay.querySelector('#editMonChase').value) || 100,
        attackRange: parseInt(overlay.querySelector('#editMonAtkRange').value) || 30,
        attackSpeed: parseInt(overlay.querySelector('#editMonAtkSpd').value) || 1000,
        exp: parseInt(overlay.querySelector('#editMonExp').value) || 0,
        gold: {
          min: parseInt(overlay.querySelector('#editMonGoldMin').value) || 0,
          max: parseInt(overlay.querySelector('#editMonGoldMax').value) || 0
        },
        drops,
        spriteKey: overlay.querySelector('#editMonSprite').value.trim(),
        tint,
        impactConfig,
      };

      if (!isNew) delete this.dm.data.monsters[monsterId];
      this.dm.data.monsters[id] = saved;
      this.dm.save();
      overlay.remove();
      this.render(root);
      window.showToast('몬스터가 저장되었습니다.', 'success');
    };
  }

  _getMonsterSpriteOptions() {
    // Built-in monster sprite keys from SPRITE_REGISTRY
    const builtIn = [
      'orc', 'orc_warrior', 'orc_shaman', 'orc_rogue',
      'skeleton_base', 'skeleton_warrior', 'skeleton_mage', 'skeleton_rogue',
    ];
    // Custom sprites from localStorage
    const customs = (() => {
      try { return Object.keys(JSON.parse(localStorage.getItem('murimAdventure_customSprites') || '{}')); }
      catch { return []; }
    })();
    const monsterCustoms = customs.filter(k => k.startsWith('mon_') || k.startsWith('monster_'));
    return [...builtIn, ...monsterCustoms].map(k => `<option value="${k}">${k}</option>`).join('');
  }

  _dropRowHtml(drop, idx, itemIds) {
    const pct = Math.round((drop.chance || 0) * 100);
    return `<div class="drop-row" data-idx="${idx}">
      <select class="drop-item-select" style="flex:2;">
        <option value="">아이템 선택...</option>
        ${itemIds.map(id => `<option value="${id}" ${id === drop.itemId ? 'selected' : ''}>${this.dm.data.items[id]?.name || id}</option>`).join('')}
      </select>
      <input type="range" class="drop-slider" min="0" max="100" value="${pct}" style="flex:2;">
      <input type="number" class="drop-chance" value="${drop.chance || 0}" step="0.01" min="0" max="1" style="max-width:70px;">
      <span class="drop-pct" style="font-size:12px;color:var(--text-dim);min-width:40px;">${pct}%</span>
      <button class="btn btn-danger btn-small btn-remove remove-drop-btn">X</button>
    </div>`;
  }

  _bindDropRemove(overlay) {
    overlay.querySelectorAll('.remove-drop-btn').forEach(btn => {
      btn.onclick = () => btn.closest('.drop-row').remove();
    });
  }

  _bindDropSliders(overlay) {
    overlay.querySelectorAll('.drop-slider').forEach(slider => {
      slider.oninput = () => {
        const row = slider.closest('.drop-row');
        const val = parseInt(slider.value) / 100;
        row.querySelector('.drop-chance').value = val.toFixed(2);
        row.querySelector('.drop-pct').textContent = slider.value + '%';
      };
    });
    overlay.querySelectorAll('.drop-chance').forEach(inp => {
      inp.oninput = () => {
        const row = inp.closest('.drop-row');
        const pct = Math.round(parseFloat(inp.value) * 100);
        row.querySelector('.drop-slider').value = pct;
        row.querySelector('.drop-pct').textContent = pct + '%';
      };
    });
  }
}
