// =============================================================================
// SkillEditor - 스킬 관리
// =============================================================================

import {
  SKILL_CATEGORIES, MUGONG_TYPES, JUSUL_TYPES, ELEMENT_TYPES, STATS, EFFECT_TYPES, DAMAGE_TYPES
} from '../../data/constants.js';

export class SkillEditor {
  constructor(dataManager) {
    this.dm = dataManager;
    this.searchTerm = '';
    this.filterCategory = '';
    this.activeTab = 'list'; // list | combinations | tree
  }

  getSkills() { return this.dm.data.skills || {}; }
  getCombinations() { return this.dm.data.skillCombinations || []; }

  render(container) {
    const tabs = [
      { key: 'list', label: '스킬 목록' },
      { key: 'combinations', label: '합격기 설정' },
      { key: 'tree', label: '스킬 트리' },
    ];

    container.innerHTML = `
      <div class="section-header">
        <h2>스킬 관리 <small>Skills</small></h2>
        <button class="btn btn-primary" id="addSkillBtn">+ 스킬 추가</button>
      </div>
      <div class="tabs">
        ${tabs.map(t => `<div class="tab ${this.activeTab === t.key ? 'active' : ''}" data-tab="${t.key}">${t.label}</div>`).join('')}
      </div>
      <div id="skillTabContent"></div>
    `;

    container.querySelectorAll('.tab').forEach(tab => {
      tab.onclick = () => { this.activeTab = tab.dataset.tab; this.render(container); };
    });
    container.querySelector('#addSkillBtn').onclick = () => this.openSkillEditor(container, null);

    const content = container.querySelector('#skillTabContent');
    if (this.activeTab === 'list') this.renderList(content, container);
    else if (this.activeTab === 'combinations') this.renderCombinations(content, container);
    else if (this.activeTab === 'tree') this.renderTree(content);
  }

  renderList(content, root) {
    const skills = this.getSkills();
    const skillList = Object.values(skills);
    const catOptions = Object.values(SKILL_CATEGORIES).map(c =>
      `<option value="${c.key}" ${this.filterCategory === c.key ? 'selected' : ''}>${c.nameKo}</option>`
    ).join('');

    let filtered = skillList.filter(s => {
      if (this.searchTerm && !s.name?.includes(this.searchTerm) && !s.id?.includes(this.searchTerm)) return false;
      if (this.filterCategory && s.category !== this.filterCategory) return false;
      return true;
    });

    // Group by category
    const grouped = {};
    Object.values(SKILL_CATEGORIES).forEach(c => { grouped[c.key] = []; });
    filtered.forEach(s => {
      const cat = s.category || 'MUGONG';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(s);
    });

    let tableHtml = '';
    for (const [catKey, catSkills] of Object.entries(grouped)) {
      if (this.filterCategory && catKey !== this.filterCategory) continue;
      if (catSkills.length === 0 && this.filterCategory) continue;
      const catDef = SKILL_CATEGORIES[catKey] || {};
      tableHtml += `<tr><td colspan="7" style="background:var(--bg-panel);color:var(--gold);font-weight:700;padding:10px 12px;">
        ${catDef.nameKo || catKey} (${catDef.nameHanja || ''}) - ${catSkills.length}개
      </td></tr>`;
      catSkills.forEach(skill => {
        const elemDef = ELEMENT_TYPES[skill.element] || {};
        tableHtml += `<tr>
          <td style="font-size:11px;color:var(--text-dim);">${skill.id}</td>
          <td>${skill.name || skill.id}</td>
          <td>${skill.subType ? (MUGONG_TYPES[skill.subType]?.nameKo || JUSUL_TYPES[skill.subType]?.nameKo || skill.subType) : '-'}</td>
          <td style="color:${elemDef.color || '#ccc'};">${elemDef.nameKo || '-'}</td>
          <td>${skill.mpCost || 0}</td>
          <td>${skill.baseDamage || '-'}</td>
          <td>
            <button class="btn btn-secondary btn-small edit-skill-btn" data-id="${skill.id}">편집</button>
            <button class="btn btn-danger btn-small delete-skill-btn" data-id="${skill.id}">삭제</button>
          </td>
        </tr>`;
      });
    }

    content.innerHTML = `
      <div class="toolbar">
        <input type="text" class="search-input" id="skillSearch" placeholder="스킬 검색..." value="${this.searchTerm}">
        <select class="filter-select" id="skillCatFilter">
          <option value="">전체 분류</option>
          ${catOptions}
        </select>
      </div>
      <div class="table-container">
        <div class="table-scroll">
          <table class="data-table">
            <thead><tr>
              <th>ID</th><th>이름</th><th>세부유형</th><th>속성</th><th>MP</th><th>기본피해</th><th>작업</th>
            </tr></thead>
            <tbody>${tableHtml}</tbody>
          </table>
        </div>
      </div>
    `;

    content.querySelector('#skillSearch').oninput = (e) => { this.searchTerm = e.target.value; this.render(root); };
    content.querySelector('#skillCatFilter').onchange = (e) => { this.filterCategory = e.target.value; this.render(root); };
    content.querySelectorAll('.edit-skill-btn').forEach(btn => {
      btn.onclick = () => this.openSkillEditor(root, btn.dataset.id);
    });
    content.querySelectorAll('.delete-skill-btn').forEach(btn => {
      btn.onclick = () => {
        if (confirm(`"${btn.dataset.id}" 스킬을 삭제하시겠습니까?`)) {
          delete this.dm.data.skills[btn.dataset.id];
          this.dm.save();
          this.render(root);
          window.showToast('스킬이 삭제되었습니다.', 'success');
        }
      };
    });
  }

  openSkillEditor(root, skillId) {
    const isNew = !skillId;
    const skill = isNew ? {
      id: '', name: '', description: '', category: 'MUGONG', subType: 'EXTERNAL',
      element: 'NONE', damageType: 'PHYSICAL', mpCost: 0, hpCost: 0, cooldown: 0,
      baseDamage: 0, scaling: {}, range: 40, proficiencyGain: 1, levelReq: 1,
      weaponReq: '', effect: null
    } : { ...this.dm.data.skills[skillId] };

    if (!skill.scaling) skill.scaling = {};

    const catOpts = Object.values(SKILL_CATEGORIES).map(c => `<option value="${c.key}" ${skill.category === c.key ? 'selected' : ''}>${c.nameKo}</option>`).join('');
    const elemOpts = Object.values(ELEMENT_TYPES).map(e => `<option value="${e.key}" ${skill.element === e.key ? 'selected' : ''}>${e.nameKo}</option>`).join('');
    const dmgOpts = Object.values(DAMAGE_TYPES).map(d => `<option value="${d.key}" ${skill.damageType === d.key ? 'selected' : ''}>${d.nameKo}</option>`).join('');

    const mugongOpts = Object.values(MUGONG_TYPES).map(m => `<option value="${m.key}" ${skill.subType === m.key ? 'selected' : ''}>${m.nameKo}</option>`).join('');
    const jusulOpts = Object.values(JUSUL_TYPES).map(j => `<option value="${j.key}" ${skill.subType === j.key ? 'selected' : ''}>${j.nameKo}</option>`).join('');

    const statKeys = Object.keys(STATS);
    const scalingRows = Object.entries(skill.scaling).map(([k, v]) =>
      `<div class="kv-row">
        <select>${statKeys.map(s => `<option value="${s}" ${s === k ? 'selected' : ''}>${STATS[s]?.nameKo || s}</option>`).join('')}</select>
        <input type="number" value="${v}" step="0.1">
        <button class="btn btn-danger btn-small btn-remove remove-scale-btn">X</button>
      </div>`
    ).join('');

    const effectJson = skill.effect ? JSON.stringify(skill.effect, null, 2) : '';

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3>${isNew ? '새 스킬 추가' : '스킬 편집'}</h3>
          <button class="btn btn-secondary btn-small modal-close-btn">X</button>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <div class="form-group"><label>ID</label><input type="text" id="editSkillId" value="${skill.id}" ${isNew ? '' : 'readonly style="opacity:0.6;"'}></div>
            <div class="form-group"><label>이름 (한글)</label><input type="text" id="editSkillName" value="${skill.name || ''}"></div>
          </div>
          <div class="form-group"><label>설명</label><textarea id="editSkillDesc">${skill.description || ''}</textarea></div>
          <div class="form-row">
            <div class="form-group"><label>분류</label><select id="editSkillCat">${catOpts}</select></div>
            <div class="form-group"><label>세부 유형 (무공)</label><select id="editSkillSubMugong">${mugongOpts}</select></div>
            <div class="form-group"><label>세부 유형 (주술)</label><select id="editSkillSubJusul">${jusulOpts}</select></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>속성</label><select id="editSkillElem">${elemOpts}</select></div>
            <div class="form-group"><label>피해 유형</label><select id="editSkillDmgType">${dmgOpts}</select></div>
            <div class="form-group"><label>레벨 요구</label><input type="number" id="editSkillLevel" value="${skill.levelReq || 1}" min="1"></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>MP 소모</label><input type="number" id="editSkillMp" value="${skill.mpCost || 0}"></div>
            <div class="form-group"><label>HP 소모</label><input type="number" id="editSkillHp" value="${skill.hpCost || 0}"></div>
            <div class="form-group"><label>쿨타임 (ms)</label><input type="number" id="editSkillCd" value="${skill.cooldown || 0}"></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>기본 피해</label><input type="number" id="editSkillDmg" value="${skill.baseDamage || 0}"></div>
            <div class="form-group"><label>사거리</label><input type="number" id="editSkillRange" value="${skill.range || 0}"></div>
            <div class="form-group"><label>숙련 획득</label><input type="number" id="editSkillProf" value="${skill.proficiencyGain || 0}"></div>
          </div>
          <div class="form-group"><label>무기 요구</label><input type="text" id="editSkillWeaponReq" value="${skill.weaponReq || ''}" placeholder="sword, staff 등 (빈값 = 없음)"></div>

          <h4 style="color:var(--gold);font-size:13px;margin:12px 0 6px;">스케일링 계수</h4>
          <div class="kv-list" id="scalingList">${scalingRows}</div>
          <button class="btn btn-secondary btn-small" id="addScaleBtn" style="margin-top:6px;">+ 스케일링 추가</button>

          <h4 style="color:var(--gold);font-size:13px;margin:12px 0 6px;">효과 (JSON)</h4>
          <div class="form-group">
            <textarea id="editSkillEffect" style="min-height:80px;font-family:monospace;font-size:12px;">${effectJson}</textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary modal-close-btn">취소</button>
          <button class="btn btn-primary" id="saveSkillBtn">저장</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    overlay.querySelectorAll('.modal-close-btn').forEach(b => b.onclick = () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

    // Add scaling
    overlay.querySelector('#addScaleBtn').onclick = () => {
      const list = overlay.querySelector('#scalingList');
      list.insertAdjacentHTML('beforeend', `<div class="kv-row">
        <select>${statKeys.map(s => `<option value="${s}">${STATS[s]?.nameKo || s}</option>`).join('')}</select>
        <input type="number" value="1.0" step="0.1">
        <button class="btn btn-danger btn-small btn-remove remove-scale-btn">X</button>
      </div>`);
      this._bindRemove(overlay, '.remove-scale-btn');
    };
    this._bindRemove(overlay, '.remove-scale-btn');

    // Save
    overlay.querySelector('#saveSkillBtn').onclick = () => {
      const id = overlay.querySelector('#editSkillId').value.trim();
      if (!id) { window.showToast('ID를 입력해주세요.', 'error'); return; }

      const cat = overlay.querySelector('#editSkillCat').value;
      let subType = null;
      if (cat === 'MUGONG') subType = overlay.querySelector('#editSkillSubMugong').value;
      else if (cat === 'JUSUL') subType = overlay.querySelector('#editSkillSubJusul').value;

      const scaling = {};
      overlay.querySelectorAll('#scalingList .kv-row').forEach(row => {
        const k = row.querySelector('select')?.value;
        const v = parseFloat(row.querySelector('input[type="number"]')?.value) || 0;
        if (k) scaling[k] = v;
      });

      let effect = null;
      const effectText = overlay.querySelector('#editSkillEffect').value.trim();
      if (effectText) {
        try { effect = JSON.parse(effectText); } catch (e) { window.showToast('효과 JSON 형식 오류', 'error'); return; }
      }

      const saved = {
        id,
        name: overlay.querySelector('#editSkillName').value.trim(),
        description: overlay.querySelector('#editSkillDesc').value.trim(),
        category: cat,
        subType,
        element: overlay.querySelector('#editSkillElem').value,
        damageType: overlay.querySelector('#editSkillDmgType').value,
        mpCost: parseInt(overlay.querySelector('#editSkillMp').value) || 0,
        hpCost: parseInt(overlay.querySelector('#editSkillHp').value) || 0,
        cooldown: parseInt(overlay.querySelector('#editSkillCd').value) || 0,
        baseDamage: parseInt(overlay.querySelector('#editSkillDmg').value) || 0,
        scaling,
        range: parseInt(overlay.querySelector('#editSkillRange').value) || 0,
        proficiencyGain: parseInt(overlay.querySelector('#editSkillProf').value) || 0,
        levelReq: parseInt(overlay.querySelector('#editSkillLevel').value) || 1,
        weaponReq: overlay.querySelector('#editSkillWeaponReq').value.trim() || null,
        effect,
      };

      if (!isNew) delete this.dm.data.skills[skillId];
      this.dm.data.skills[id] = saved;
      this.dm.save();
      overlay.remove();
      this.render(root);
      window.showToast('스킬이 저장되었습니다.', 'success');
    };
  }

  renderCombinations(content, root) {
    const combos = this.getCombinations();
    const skills = this.getSkills();

    let html = `<div style="margin-bottom:12px;">
      <button class="btn btn-primary" id="addComboBtn">+ 합격기 추가</button>
    </div>`;

    combos.forEach((combo, idx) => {
      const ingredientNames = combo.ingredients.map(id => skills[id]?.name || id).join(' + ');
      const resultName = combo.result?.name || combo.result?.id || '?';
      html += `
        <div class="card">
          <div class="card-header">
            <h3 style="font-size:14px;">${ingredientNames} → ${resultName}</h3>
            <div>
              <button class="btn btn-secondary btn-small edit-combo-btn" data-idx="${idx}">편집</button>
              <button class="btn btn-danger btn-small delete-combo-btn" data-idx="${idx}">삭제</button>
            </div>
          </div>
          <div style="font-size:12px;color:var(--text-dim);">
            <div>재료 스킬: ${combo.ingredients.join(', ')}</div>
            <div>숙련 요구: ${JSON.stringify(combo.proficiencyReq || {})}</div>
            <div>결과: ${combo.result?.id} - ${combo.result?.description || ''}</div>
          </div>
        </div>
      `;
    });

    content.innerHTML = html;

    content.querySelector('#addComboBtn').onclick = () => this.openComboEditor(root, -1);
    content.querySelectorAll('.edit-combo-btn').forEach(btn => {
      btn.onclick = () => this.openComboEditor(root, parseInt(btn.dataset.idx));
    });
    content.querySelectorAll('.delete-combo-btn').forEach(btn => {
      btn.onclick = () => {
        if (confirm('이 합격기를 삭제하시겠습니까?')) {
          this.dm.data.skillCombinations.splice(parseInt(btn.dataset.idx), 1);
          this.dm.save();
          this.render(root);
          window.showToast('합격기가 삭제되었습니다.', 'success');
        }
      };
    });
  }

  openComboEditor(root, idx) {
    const isNew = idx < 0;
    const combo = isNew ? {
      ingredients: ['', ''],
      result: { id: '', name: '', description: '', category: 'MUGONG', subType: 'INTERNAL', element: 'NONE', damageType: 'PHYSICAL', mpCost: 0, cooldown: 0, baseDamage: 0, scaling: {}, range: 40, proficiencyGain: 1, levelReq: 1 },
      proficiencyReq: {}
    } : JSON.parse(JSON.stringify(this.dm.data.skillCombinations[idx]));

    const skillIds = Object.keys(this.getSkills());

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3>${isNew ? '새 합격기 추가' : '합격기 편집'}</h3>
          <button class="btn btn-secondary btn-small modal-close-btn">X</button>
        </div>
        <div class="modal-body">
          <h4 style="color:var(--gold);font-size:13px;margin-bottom:8px;">재료 스킬</h4>
          <div id="ingredientList">
            ${combo.ingredients.map((ing, i) => `
              <div class="form-group">
                <label>재료 ${i + 1}</label>
                <select class="ingredient-select">
                  <option value="">선택...</option>
                  ${skillIds.map(sid => `<option value="${sid}" ${sid === ing ? 'selected' : ''}>${this.getSkills()[sid]?.name || sid}</option>`).join('')}
                </select>
              </div>
            `).join('')}
          </div>
          <button class="btn btn-secondary btn-small" id="addIngredientBtn">+ 재료 추가</button>

          <h4 style="color:var(--gold);font-size:13px;margin:16px 0 8px;">숙련 요구 (JSON)</h4>
          <div class="form-group">
            <textarea id="editComboProfReq" style="font-family:monospace;font-size:12px;">${JSON.stringify(combo.proficiencyReq || {}, null, 2)}</textarea>
          </div>

          <h4 style="color:var(--gold);font-size:13px;margin:16px 0 8px;">결과 스킬 (JSON)</h4>
          <div class="form-group">
            <textarea id="editComboResult" style="min-height:150px;font-family:monospace;font-size:12px;">${JSON.stringify(combo.result, null, 2)}</textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary modal-close-btn">취소</button>
          <button class="btn btn-primary" id="saveComboBtn">저장</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    overlay.querySelectorAll('.modal-close-btn').forEach(b => b.onclick = () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

    overlay.querySelector('#addIngredientBtn').onclick = () => {
      const list = overlay.querySelector('#ingredientList');
      const i = list.children.length;
      list.insertAdjacentHTML('beforeend', `
        <div class="form-group">
          <label>재료 ${i + 1}</label>
          <select class="ingredient-select">
            <option value="">선택...</option>
            ${skillIds.map(sid => `<option value="${sid}">${this.getSkills()[sid]?.name || sid}</option>`).join('')}
          </select>
        </div>
      `);
    };

    overlay.querySelector('#saveComboBtn').onclick = () => {
      const ingredients = [];
      overlay.querySelectorAll('.ingredient-select').forEach(sel => {
        if (sel.value) ingredients.push(sel.value);
      });
      if (ingredients.length < 2) { window.showToast('재료 스킬을 2개 이상 선택해주세요.', 'error'); return; }

      let profReq, result;
      try {
        profReq = JSON.parse(overlay.querySelector('#editComboProfReq').value);
        result = JSON.parse(overlay.querySelector('#editComboResult').value);
      } catch (e) { window.showToast('JSON 형식 오류', 'error'); return; }

      const saved = { ingredients, result, proficiencyReq: profReq };
      if (!this.dm.data.skillCombinations) this.dm.data.skillCombinations = [];
      if (isNew) this.dm.data.skillCombinations.push(saved);
      else this.dm.data.skillCombinations[idx] = saved;

      this.dm.save();
      overlay.remove();
      this.render(root);
      window.showToast('합격기가 저장되었습니다.', 'success');
    };
  }

  renderTree(content) {
    const skills = Object.values(this.getSkills());
    const combos = this.getCombinations();

    content.innerHTML = `
      <div class="skill-tree-container">
        <canvas id="skillTreeCanvas" width="800" height="400"></canvas>
      </div>
    `;

    const canvas = content.querySelector('#skillTreeCanvas');
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1e1e32';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Group skills by category
    const categories = {};
    skills.forEach(s => {
      const cat = s.category || 'MUGONG';
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(s);
    });

    const catKeys = Object.keys(categories);
    const catWidth = canvas.width / Math.max(catKeys.length, 1);

    catKeys.forEach((cat, ci) => {
      const catDef = SKILL_CATEGORIES[cat] || {};
      const x = ci * catWidth + catWidth / 2;

      // Category label
      ctx.fillStyle = '#d4a843';
      ctx.font = 'bold 14px Noto Sans KR, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(catDef.nameKo || cat, x, 30);

      // Skill nodes
      const catSkills = categories[cat];
      catSkills.forEach((skill, si) => {
        const ny = 60 + si * 50;
        const nx = x;

        // Node
        ctx.fillStyle = '#252540';
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(nx - 50, ny - 12, 100, 24, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#e0ddd5';
        ctx.font = '11px Noto Sans KR, sans-serif';
        ctx.fillText(skill.name || skill.id, nx, ny + 4);

        // Connect to next
        if (si < catSkills.length - 1) {
          ctx.strokeStyle = '#333355';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(nx, ny + 12);
          ctx.lineTo(nx, ny + 38);
          ctx.stroke();
        }
      });
    });

    // Draw combination arrows
    combos.forEach(combo => {
      // Find ingredient positions (simplified)
      ctx.strokeStyle = '#d4a843';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      // Just draw label at bottom
      ctx.fillStyle = '#8b7536';
      ctx.font = '10px Noto Sans KR, sans-serif';
      ctx.textAlign = 'left';
      const label = `${combo.ingredients.join(' + ')} → ${combo.result?.id || '?'}`;
      ctx.fillText(label, 20, canvas.height - 20);
      ctx.setLineDash([]);
    });
  }

  _bindRemove(overlay, selector) {
    overlay.querySelectorAll(selector).forEach(btn => {
      btn.onclick = () => btn.closest('.kv-row').remove();
    });
  }
}
