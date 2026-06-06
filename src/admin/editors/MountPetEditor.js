// =============================================================================
// MountPetEditor - 탈것/환수 관리
// =============================================================================

import { ITEM_RARITY, ELEMENT_TYPES, STATS } from '../../data/constants.js';

export class MountPetEditor {
  constructor(dataManager) {
    this.dm = dataManager;
    this.activeTab = 'mounts';
  }

  render(container) {
    container.innerHTML = `
      <div class="section-header">
        <h2>탈것/환수 관리 <small>Mounts & Pets</small></h2>
      </div>
      <div class="tabs">
        <div class="tab ${this.activeTab === 'mounts' ? 'active' : ''}" data-tab="mounts">탈것 관리</div>
        <div class="tab ${this.activeTab === 'pets' ? 'active' : ''}" data-tab="pets">환수 관리</div>
      </div>
      <div id="mountPetContent"></div>
    `;

    container.querySelectorAll('.tab').forEach(tab => {
      tab.onclick = () => { this.activeTab = tab.dataset.tab; this.render(container); };
    });

    const content = container.querySelector('#mountPetContent');
    if (this.activeTab === 'mounts') this.renderMounts(content, container);
    else this.renderPets(content, container);
  }

  renderMounts(content, root) {
    const mounts = this.dm.data.mounts || [];
    const rarityOpts = Object.values(ITEM_RARITY);

    content.innerHTML = `
      <div style="margin-bottom:12px;"><button class="btn btn-primary" id="addMountBtn">+ 탈것 추가</button></div>
      <div class="table-container">
        <div class="table-scroll">
          <table class="data-table">
            <thead><tr><th>ID</th><th>이름</th><th>속도 보너스</th><th>등급</th><th>특수 능력</th><th>획득 방법</th><th>작업</th></tr></thead>
            <tbody>
              ${mounts.map((m, i) => `<tr>
                <td style="font-size:11px;color:var(--text-dim);">${m.id}</td>
                <td><span class="rarity-${m.rarity}">${m.name}</span></td>
                <td>+${m.speedBonus}%</td>
                <td><span class="rarity-${m.rarity}">${ITEM_RARITY[m.rarity]?.nameKo || m.rarity}</span></td>
                <td style="font-size:11px;">${(m.abilities || []).join(', ') || '-'}</td>
                <td style="font-size:11px;color:var(--text-dim);">${m.obtainMethod || '-'}</td>
                <td>
                  <button class="btn btn-secondary btn-small edit-mount-btn" data-idx="${i}">편집</button>
                  <button class="btn btn-danger btn-small delete-mount-btn" data-idx="${i}">삭제</button>
                </td>
              </tr>`).join('')}
              ${mounts.length === 0 ? '<tr><td colspan="7" style="text-align:center;color:var(--text-dim);">탈것이 없습니다.</td></tr>' : ''}
            </tbody>
          </table>
        </div>
      </div>
    `;

    content.querySelector('#addMountBtn').onclick = () => this.openMountEditor(root, -1);
    content.querySelectorAll('.edit-mount-btn').forEach(btn => {
      btn.onclick = () => this.openMountEditor(root, parseInt(btn.dataset.idx));
    });
    content.querySelectorAll('.delete-mount-btn').forEach(btn => {
      btn.onclick = () => {
        if (confirm('이 탈것을 삭제하시겠습니까?')) {
          this.dm.data.mounts.splice(parseInt(btn.dataset.idx), 1);
          this.dm.save(); this.render(root);
          window.showToast('탈것이 삭제되었습니다.', 'success');
        }
      };
    });
  }

  openMountEditor(root, idx) {
    const isNew = idx < 0;
    const mount = isNew ? {
      id: '', name: '', speedBonus: 30, abilities: [], rarity: 'COMMON',
      obtainMethod: '', levelTiers: [{ level: 1, speedBonus: 30 }]
    } : JSON.parse(JSON.stringify(this.dm.data.mounts[idx]));

    const rarityOpts = Object.values(ITEM_RARITY).map(r =>
      `<option value="${r.key}" ${mount.rarity === r.key ? 'selected' : ''}>${r.nameKo}</option>`
    ).join('');

    const tierRows = (mount.levelTiers || []).map((t, i) => `
      <div class="form-row tier-row" style="margin-bottom:4px;">
        <div class="form-group"><label>레벨</label><input type="number" class="tier-level" value="${t.level}" min="1"></div>
        <div class="form-group"><label>속도 보너스</label><input type="number" class="tier-speed" value="${t.speedBonus}"></div>
        <div class="form-group" style="flex:0;"><button class="btn btn-danger btn-small remove-tier-btn" style="margin-top:20px;">X</button></div>
      </div>
    `).join('');

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3>${isNew ? '새 탈것 추가' : '탈것 편집'}</h3>
          <button class="btn btn-secondary btn-small modal-close-btn">X</button>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <div class="form-group"><label>ID</label><input type="text" id="editMtId" value="${mount.id}" ${isNew ? '' : 'readonly style="opacity:0.6;"'}></div>
            <div class="form-group"><label>이름</label><input type="text" id="editMtName" value="${mount.name || ''}"></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>기본 속도 보너스 (%)</label><input type="number" id="editMtSpeed" value="${mount.speedBonus || 0}"></div>
            <div class="form-group"><label>등급</label><select id="editMtRarity">${rarityOpts}</select></div>
          </div>
          <div class="form-group"><label>특수 능력 (쉼표 구분)</label><input type="text" id="editMtAbilities" value="${(mount.abilities || []).join(', ')}"></div>
          <div class="form-group"><label>획득 방법</label><input type="text" id="editMtObtain" value="${mount.obtainMethod || ''}"></div>

          <h4 style="color:var(--gold);font-size:13px;margin:12px 0 8px;">레벨 단계</h4>
          <div id="tierList">${tierRows}</div>
          <button class="btn btn-secondary btn-small" id="addTierBtn">+ 단계 추가</button>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary modal-close-btn">취소</button>
          <button class="btn btn-primary" id="saveMountBtn">저장</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    overlay.querySelectorAll('.modal-close-btn').forEach(b => b.onclick = () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

    overlay.querySelector('#addTierBtn').onclick = () => {
      overlay.querySelector('#tierList').insertAdjacentHTML('beforeend', `
        <div class="form-row tier-row" style="margin-bottom:4px;">
          <div class="form-group"><label>레벨</label><input type="number" class="tier-level" value="1" min="1"></div>
          <div class="form-group"><label>속도 보너스</label><input type="number" class="tier-speed" value="30"></div>
          <div class="form-group" style="flex:0;"><button class="btn btn-danger btn-small remove-tier-btn" style="margin-top:20px;">X</button></div>
        </div>
      `);
      this._bindTierRemove(overlay);
    };
    this._bindTierRemove(overlay);

    overlay.querySelector('#saveMountBtn').onclick = () => {
      const id = overlay.querySelector('#editMtId').value.trim();
      if (!id) { window.showToast('ID를 입력해주세요.', 'error'); return; }

      const abilitiesStr = overlay.querySelector('#editMtAbilities').value.trim();
      const tiers = [];
      overlay.querySelectorAll('.tier-row').forEach(row => {
        tiers.push({
          level: parseInt(row.querySelector('.tier-level')?.value) || 1,
          speedBonus: parseInt(row.querySelector('.tier-speed')?.value) || 0
        });
      });

      const saved = {
        id,
        name: overlay.querySelector('#editMtName').value.trim(),
        speedBonus: parseInt(overlay.querySelector('#editMtSpeed').value) || 0,
        abilities: abilitiesStr ? abilitiesStr.split(',').map(s => s.trim()).filter(Boolean) : [],
        rarity: overlay.querySelector('#editMtRarity').value,
        obtainMethod: overlay.querySelector('#editMtObtain').value.trim(),
        levelTiers: tiers,
      };

      if (!this.dm.data.mounts) this.dm.data.mounts = [];
      if (isNew) this.dm.data.mounts.push(saved);
      else this.dm.data.mounts[idx] = saved;
      this.dm.save(); overlay.remove(); this.render(root);
      window.showToast('탈것이 저장되었습니다.', 'success');
    };
  }

  renderPets(content, root) {
    const pets = this.dm.data.pets || [];

    content.innerHTML = `
      <div style="margin-bottom:12px;"><button class="btn btn-primary" id="addPetBtn">+ 환수 추가</button></div>
      <div class="table-container">
        <div class="table-scroll">
          <table class="data-table">
            <thead><tr><th>ID</th><th>이름</th><th>속성</th><th>등급</th><th>능력</th><th>진화 단계</th><th>작업</th></tr></thead>
            <tbody>
              ${pets.map((p, i) => {
                const elemDef = ELEMENT_TYPES[p.elementAffinity] || {};
                return `<tr>
                  <td style="font-size:11px;color:var(--text-dim);">${p.id}</td>
                  <td><span class="rarity-${p.rarity}">${p.name}</span></td>
                  <td style="color:${elemDef.color || '#ccc'};">${elemDef.nameKo || p.elementAffinity || '-'}</td>
                  <td><span class="rarity-${p.rarity}">${ITEM_RARITY[p.rarity]?.nameKo || p.rarity}</span></td>
                  <td style="font-size:11px;">${(p.abilities || []).join(', ') || '-'}</td>
                  <td style="font-size:11px;">${(p.evolutionTiers || []).map(t => t.name).join(' > ') || '-'}</td>
                  <td>
                    <button class="btn btn-secondary btn-small edit-pet-btn" data-idx="${i}">편집</button>
                    <button class="btn btn-danger btn-small delete-pet-btn" data-idx="${i}">삭제</button>
                  </td>
                </tr>`;
              }).join('')}
              ${pets.length === 0 ? '<tr><td colspan="7" style="text-align:center;color:var(--text-dim);">환수가 없습니다.</td></tr>' : ''}
            </tbody>
          </table>
        </div>
      </div>
    `;

    content.querySelector('#addPetBtn').onclick = () => this.openPetEditor(root, -1);
    content.querySelectorAll('.edit-pet-btn').forEach(btn => {
      btn.onclick = () => this.openPetEditor(root, parseInt(btn.dataset.idx));
    });
    content.querySelectorAll('.delete-pet-btn').forEach(btn => {
      btn.onclick = () => {
        if (confirm('이 환수를 삭제하시겠습니까?')) {
          this.dm.data.pets.splice(parseInt(btn.dataset.idx), 1);
          this.dm.save(); this.render(root);
          window.showToast('환수가 삭제되었습니다.', 'success');
        }
      };
    });
  }

  openPetEditor(root, idx) {
    const isNew = idx < 0;
    const pet = isNew ? {
      id: '', name: '', stats: { ATK: 5, DEF: 5, HP: 50 }, abilities: [],
      growthSystem: { expPerLevel: 100, maxLevel: 20 }, elementAffinity: 'NONE',
      rarity: 'COMMON', evolutionTiers: [{ tier: 1, name: '', level: 1 }]
    } : JSON.parse(JSON.stringify(this.dm.data.pets[idx]));

    if (!pet.stats) pet.stats = {};
    if (!pet.evolutionTiers) pet.evolutionTiers = [];
    if (!pet.growthSystem) pet.growthSystem = { expPerLevel: 100, maxLevel: 20 };

    const rarityOpts = Object.values(ITEM_RARITY).map(r =>
      `<option value="${r.key}" ${pet.rarity === r.key ? 'selected' : ''}>${r.nameKo}</option>`
    ).join('');
    const elemOpts = Object.values(ELEMENT_TYPES).map(e =>
      `<option value="${e.key}" ${pet.elementAffinity === e.key ? 'selected' : ''}>${e.nameKo}</option>`
    ).join('');

    const petStatKeys = ['ATK', 'DEF', 'HP', 'MP', 'AGI', 'INT'];
    const statInputs = petStatKeys.map(k => `
      <div class="form-group" style="flex:0 0 calc(33% - 8px);">
        <label>${STATS[k]?.nameKo || k}</label>
        <input type="number" class="pet-stat" data-key="${k}" value="${pet.stats[k] || 0}">
      </div>
    `).join('');

    const evoRows = pet.evolutionTiers.map((t, i) => `
      <div class="form-row evo-row" style="margin-bottom:4px;">
        <div class="form-group"><label>단계</label><input type="number" class="evo-tier" value="${t.tier}" min="1"></div>
        <div class="form-group"><label>이름</label><input type="text" class="evo-name" value="${t.name || ''}"></div>
        <div class="form-group"><label>레벨</label><input type="number" class="evo-level" value="${t.level}" min="1"></div>
        <div class="form-group" style="flex:0;"><button class="btn btn-danger btn-small remove-evo-btn" style="margin-top:20px;">X</button></div>
      </div>
    `).join('');

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal" style="max-width:750px;">
        <div class="modal-header">
          <h3>${isNew ? '새 환수 추가' : '환수 편집'}</h3>
          <button class="btn btn-secondary btn-small modal-close-btn">X</button>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <div class="form-group"><label>ID</label><input type="text" id="editPetId" value="${pet.id}" ${isNew ? '' : 'readonly style="opacity:0.6;"'}></div>
            <div class="form-group"><label>이름</label><input type="text" id="editPetName" value="${pet.name || ''}"></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>속성</label><select id="editPetElem">${elemOpts}</select></div>
            <div class="form-group"><label>등급</label><select id="editPetRarity">${rarityOpts}</select></div>
          </div>

          <h4 style="color:var(--gold);font-size:13px;margin:12px 0 8px;">능력치</h4>
          <div class="form-row" style="flex-wrap:wrap;">${statInputs}</div>

          <div class="form-group"><label>능력 (쉼표 구분)</label><input type="text" id="editPetAbilities" value="${(pet.abilities || []).join(', ')}"></div>

          <div class="form-row">
            <div class="form-group"><label>레벨당 경험치</label><input type="number" id="editPetExpPerLvl" value="${pet.growthSystem.expPerLevel || 100}"></div>
            <div class="form-group"><label>최대 레벨</label><input type="number" id="editPetMaxLvl" value="${pet.growthSystem.maxLevel || 20}"></div>
          </div>

          <h4 style="color:var(--gold);font-size:13px;margin:12px 0 8px;">진화 단계</h4>
          <div id="evoList">${evoRows}</div>
          <button class="btn btn-secondary btn-small" id="addEvoBtn">+ 진화 단계 추가</button>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary modal-close-btn">취소</button>
          <button class="btn btn-primary" id="savePetBtn">저장</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    overlay.querySelectorAll('.modal-close-btn').forEach(b => b.onclick = () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

    overlay.querySelector('#addEvoBtn').onclick = () => {
      overlay.querySelector('#evoList').insertAdjacentHTML('beforeend', `
        <div class="form-row evo-row" style="margin-bottom:4px;">
          <div class="form-group"><label>단계</label><input type="number" class="evo-tier" value="1" min="1"></div>
          <div class="form-group"><label>이름</label><input type="text" class="evo-name" value=""></div>
          <div class="form-group"><label>레벨</label><input type="number" class="evo-level" value="1" min="1"></div>
          <div class="form-group" style="flex:0;"><button class="btn btn-danger btn-small remove-evo-btn" style="margin-top:20px;">X</button></div>
        </div>
      `);
      this._bindEvoRemove(overlay);
    };
    this._bindEvoRemove(overlay);

    overlay.querySelector('#savePetBtn').onclick = () => {
      const id = overlay.querySelector('#editPetId').value.trim();
      if (!id) { window.showToast('ID를 입력해주세요.', 'error'); return; }

      const stats = {};
      overlay.querySelectorAll('.pet-stat').forEach(inp => {
        const v = parseInt(inp.value);
        if (v) stats[inp.dataset.key] = v;
      });

      const abStr = overlay.querySelector('#editPetAbilities').value.trim();
      const evos = [];
      overlay.querySelectorAll('.evo-row').forEach(row => {
        evos.push({
          tier: parseInt(row.querySelector('.evo-tier')?.value) || 1,
          name: row.querySelector('.evo-name')?.value?.trim() || '',
          level: parseInt(row.querySelector('.evo-level')?.value) || 1
        });
      });

      const saved = {
        id,
        name: overlay.querySelector('#editPetName').value.trim(),
        stats,
        abilities: abStr ? abStr.split(',').map(s => s.trim()).filter(Boolean) : [],
        growthSystem: {
          expPerLevel: parseInt(overlay.querySelector('#editPetExpPerLvl').value) || 100,
          maxLevel: parseInt(overlay.querySelector('#editPetMaxLvl').value) || 20
        },
        elementAffinity: overlay.querySelector('#editPetElem').value,
        rarity: overlay.querySelector('#editPetRarity').value,
        evolutionTiers: evos,
      };

      if (!this.dm.data.pets) this.dm.data.pets = [];
      if (isNew) this.dm.data.pets.push(saved);
      else this.dm.data.pets[idx] = saved;
      this.dm.save(); overlay.remove(); this.render(root);
      window.showToast('환수가 저장되었습니다.', 'success');
    };
  }

  _bindTierRemove(overlay) {
    overlay.querySelectorAll('.remove-tier-btn').forEach(btn => {
      btn.onclick = () => btn.closest('.tier-row, .form-row').remove();
    });
  }

  _bindEvoRemove(overlay) {
    overlay.querySelectorAll('.remove-evo-btn').forEach(btn => {
      btn.onclick = () => btn.closest('.evo-row').remove();
    });
  }
}
