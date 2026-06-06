// =============================================================================
// ItemEditor - 아이템 관리
// =============================================================================

import {
  STATS, EQUIPMENT_SLOTS, WEAPON_TYPES, ITEM_RARITY, ITEM_TYPES
} from '../../data/constants.js';

export class ItemEditor {
  constructor(dataManager) {
    this.dm = dataManager;
    this.searchTerm = '';
    this.filterType = '';
    this.filterRarity = '';
  }

  getItems() {
    return this.dm.data.items || {};
  }

  render(container) {
    const items = this.getItems();
    const itemList = Object.values(items);

    let filtered = itemList.filter(item => {
      if (this.searchTerm && !item.name.includes(this.searchTerm) && !item.id.includes(this.searchTerm)) return false;
      if (this.filterType && item.type !== this.filterType) return false;
      if (this.filterRarity && item.rarity !== this.filterRarity) return false;
      return true;
    });

    const typeOptions = Object.values(ITEM_TYPES).map(t => `<option value="${t.key}" ${this.filterType === t.key ? 'selected' : ''}>${t.nameKo}</option>`).join('');
    const rarityOptions = Object.values(ITEM_RARITY).map(r => `<option value="${r.key}" ${this.filterRarity === r.key ? 'selected' : ''}>${r.nameKo}</option>`).join('');

    container.innerHTML = `
      <div class="section-header">
        <h2>아이템 관리 <small>Items</small></h2>
        <button class="btn btn-primary" id="addItemBtn">+ 아이템 추가</button>
      </div>

      <div class="toolbar">
        <input type="text" class="search-input" id="itemSearch" placeholder="아이템 검색 (이름/ID)..." value="${this.searchTerm}">
        <select class="filter-select" id="itemTypeFilter">
          <option value="">전체 유형</option>
          ${typeOptions}
        </select>
        <select class="filter-select" id="itemRarityFilter">
          <option value="">전체 등급</option>
          ${rarityOptions}
        </select>
        <span style="font-size:12px;color:var(--text-dim);">${filtered.length}개 아이템</span>
      </div>

      <div class="table-container">
        <div class="table-scroll">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>이름</th>
                <th>유형</th>
                <th>등급</th>
                <th>레벨</th>
                <th>주요 능력치</th>
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.map(item => {
                const rarityDef = ITEM_RARITY[item.rarity] || {};
                const typeDef = ITEM_TYPES[item.type] || {};
                const statsStr = item.stats ? Object.entries(item.stats).map(([k,v]) => `${k}+${v}`).join(', ') : '-';
                return `<tr>
                  <td style="font-size:11px;color:var(--text-dim);">${item.id}</td>
                  <td><span class="rarity-${item.rarity}">${item.name || item.id}</span></td>
                  <td>${typeDef.nameKo || item.type || '-'}</td>
                  <td><span class="rarity-${item.rarity}">${rarityDef.nameKo || item.rarity || '-'}</span></td>
                  <td>${item.levelReq || 1}</td>
                  <td style="font-size:11px;">${statsStr}</td>
                  <td>
                    <button class="btn btn-secondary btn-small edit-item-btn" data-id="${item.id}">편집</button>
                    <button class="btn btn-danger btn-small delete-item-btn" data-id="${item.id}">삭제</button>
                  </td>
                </tr>`;
              }).join('')}
              ${filtered.length === 0 ? '<tr><td colspan="7" style="text-align:center;color:var(--text-dim);">아이템이 없습니다.</td></tr>' : ''}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // Bind
    container.querySelector('#itemSearch').oninput = (e) => { this.searchTerm = e.target.value; this.render(container); };
    container.querySelector('#itemTypeFilter').onchange = (e) => { this.filterType = e.target.value; this.render(container); };
    container.querySelector('#itemRarityFilter').onchange = (e) => { this.filterRarity = e.target.value; this.render(container); };
    container.querySelector('#addItemBtn').onclick = () => this.openEditor(container, null);
    container.querySelectorAll('.edit-item-btn').forEach(btn => {
      btn.onclick = () => this.openEditor(container, btn.dataset.id);
    });
    container.querySelectorAll('.delete-item-btn').forEach(btn => {
      btn.onclick = () => {
        if (confirm(`"${btn.dataset.id}" 아이템을 삭제하시겠습니까?`)) {
          delete this.dm.data.items[btn.dataset.id];
          this.dm.save();
          this.render(container);
          window.showToast('아이템이 삭제되었습니다.', 'success');
        }
      };
    });
  }

  openEditor(container, itemId) {
    const isNew = !itemId;
    const item = isNew ? {
      id: '', name: '', description: '', type: 'WEAPON', weaponType: '',
      rarity: 'GRADE_13', levelReq: 1, stats: {}, slot: 'WEAPON',
      proficiencyBonus: 0, specialEffects: [], icon: '', spriteKey: '',
      stackable: false, maxStack: 1, baseATK: 0, baseATK_SPEED: 0, baseRange: 0, baseDEF: 0
    } : { ...this.dm.data.items[itemId] };

    // Ensure stats is an object
    if (!item.stats) item.stats = {};
    if (!item.specialEffects) item.specialEffects = [];

    const typeOptions = Object.values(ITEM_TYPES).map(t => `<option value="${t.key}" ${item.type === t.key ? 'selected' : ''}>${t.nameKo}</option>`).join('');
    const rarityOptions = Object.values(ITEM_RARITY).map(r => `<option value="${r.key}" ${item.rarity === r.key ? 'selected' : ''}>${r.nameKo}</option>`).join('');
    const slotOptions = Object.values(EQUIPMENT_SLOTS).map(s => `<option value="${s.key}" ${item.slot === s.key ? 'selected' : ''}>${s.nameKo}</option>`).join('');
    const statKeys = Object.keys(STATS);

    const statRows = Object.entries(item.stats).map(([key, val]) => this._statRowHtml(key, val, statKeys)).join('');

    const effectsList = (item.specialEffects || []).map((eff, i) =>
      `<div class="kv-row">
        <input type="text" class="effect-val" value="${typeof eff === 'string' ? eff : JSON.stringify(eff)}" data-idx="${i}">
        <button class="btn btn-danger btn-small btn-remove remove-effect-btn" data-idx="${i}">X</button>
      </div>`
    ).join('');

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3>${isNew ? '새 아이템 추가' : '아이템 편집'}</h3>
          <button class="btn btn-secondary btn-small modal-close-btn">X</button>
        </div>
        <div class="modal-body" style="display:flex;gap:20px;">
          <div style="flex:1;">
            <div class="form-row">
              <div class="form-group">
                <label>ID (영문)</label>
                <input type="text" id="editItemId" value="${item.id}" ${isNew ? '' : 'readonly'} style="${isNew ? '' : 'opacity:0.6;'}">
              </div>
              <div class="form-group">
                <label>이름 (한글)</label>
                <input type="text" id="editItemName" value="${item.name || ''}">
              </div>
            </div>
            <div class="form-group">
              <label>설명</label>
              <textarea id="editItemDesc">${item.description || ''}</textarea>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>유형</label>
                <select id="editItemType">${typeOptions}</select>
              </div>
              <div class="form-group">
                <label>장비 슬롯</label>
                <select id="editItemSlot">${slotOptions}</select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>무기 유형</label>
                <input type="text" id="editItemWeaponType" value="${item.weaponType || ''}" placeholder="sword, staff, etc.">
              </div>
              <div class="form-group">
                <label>등급</label>
                <select id="editItemRarity">${rarityOptions}</select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>레벨 요구</label>
                <input type="number" id="editItemLevel" value="${item.levelReq || 1}" min="1">
              </div>
              <div class="form-group">
                <label>숙련 보너스</label>
                <input type="number" id="editItemProf" value="${item.proficiencyBonus || 0}" min="0">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>아이콘</label>
                <input type="text" id="editItemIcon" value="${item.icon || ''}" placeholder="icon_sword">
              </div>
              <div class="form-group">
                <label>스프라이트 키</label>
                <div style="position:relative;">
                  <input type="text" id="editItemSpriteKey" value="${item.spriteKey || ''}" placeholder="검색 또는 직접 입력..." autocomplete="off">
                  <div id="spriteDropdown" style="display:none;position:absolute;top:100%;left:0;right:0;max-height:200px;overflow-y:auto;background:var(--bg-card);border:1px solid var(--border);border-radius:4px;z-index:100;"></div>
                </div>
                <div id="spritePreviewBox" style="margin-top:6px;min-height:40px;display:flex;align-items:center;gap:8px;">
                  ${item.spriteKey ? `<span style="color:var(--text-dim);font-size:11px;">미리보기 로딩 중...</span>` : '<span style="color:var(--text-dim);font-size:10px;">장비 착용 시 캐릭터에 표시될 스프라이트</span>'}
                </div>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>기본 공격력 (무기)</label>
                <input type="number" id="editItemBaseATK" value="${item.baseATK || 0}" min="0">
              </div>
              <div class="form-group">
                <label>기본 공격속도 (무기)</label>
                <input type="number" id="editItemBaseAtkSpd" value="${item.baseATK_SPEED || 0}" min="0">
              </div>
              <div class="form-group">
                <label>사정거리 (무기)</label>
                <input type="number" id="editItemBaseRange" value="${item.baseRange || 0}" min="0">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>기본 방어력 (방어구)</label>
                <input type="number" id="editItemBaseDEF" value="${item.baseDEF || 0}" min="0">
              </div>
              <div class="form-group" style="display:flex;align-items:flex-end;gap:10px;">
                <label style="display:flex;align-items:center;gap:6px;">
                  <input type="checkbox" id="editItemStackable" ${item.stackable ? 'checked' : ''}>
                  중첩 가능
                </label>
                <input type="number" id="editItemMaxStack" value="${item.maxStack || 1}" min="1" style="max-width:60px;" placeholder="최대">
              </div>
            </div>

            <h4 style="color:var(--gold);font-size:13px;margin:12px 0 6px;">능력치 보너스</h4>
            <div class="kv-list" id="statBonusList">${statRows}</div>
            <button class="btn btn-secondary btn-small" id="addStatBtn" style="margin-top:6px;">+ 능력치 추가</button>

            <h4 style="color:var(--gold);font-size:13px;margin:12px 0 6px;">특수 효과</h4>
            <div class="kv-list" id="effectsList">${effectsList}</div>
            <button class="btn btn-secondary btn-small" id="addEffectBtn" style="margin-top:6px;">+ 효과 추가</button>
          </div>

          <div id="itemPreview" style="flex-shrink:0;"></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary modal-close-btn">취소</button>
          <button class="btn btn-primary" id="saveItemBtn">저장</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    this._updatePreview(overlay, item);

    // Close
    overlay.querySelectorAll('.modal-close-btn').forEach(b => b.onclick = () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

    // Add stat row
    overlay.querySelector('#addStatBtn').onclick = () => {
      const list = overlay.querySelector('#statBonusList');
      list.insertAdjacentHTML('beforeend', this._statRowHtml('HP', 0, statKeys));
      this._bindStatRowRemove(overlay, item);
    };
    this._bindStatRowRemove(overlay, item);

    // Add effect
    overlay.querySelector('#addEffectBtn').onclick = () => {
      const list = overlay.querySelector('#effectsList');
      const idx = list.children.length;
      list.insertAdjacentHTML('beforeend', `
        <div class="kv-row">
          <input type="text" class="effect-val" value="" data-idx="${idx}" placeholder="효과 설명...">
          <button class="btn btn-danger btn-small btn-remove remove-effect-btn" data-idx="${idx}">X</button>
        </div>
      `);
      this._bindEffectRemove(overlay);
    };
    this._bindEffectRemove(overlay);

    // Sprite key dropdown + preview
    this._initSpriteSelector(overlay);

    // Live preview update
    const updatePreviewFromForm = () => {
      const rarity = overlay.querySelector('#editItemRarity').value;
      const name = overlay.querySelector('#editItemName').value;
      const desc = overlay.querySelector('#editItemDesc').value;
      const stats = {};
      overlay.querySelectorAll('#statBonusList .kv-row').forEach(row => {
        const k = row.querySelector('select')?.value;
        const v = parseFloat(row.querySelector('input[type="number"]')?.value) || 0;
        if (k) stats[k] = v;
      });
      this._updatePreview(overlay, { ...item, rarity, name, description: desc, stats });
    };
    ['#editItemName', '#editItemDesc', '#editItemRarity'].forEach(sel => {
      const el = overlay.querySelector(sel);
      if (el) el.addEventListener('input', updatePreviewFromForm);
      if (el) el.addEventListener('change', updatePreviewFromForm);
    });

    // Save
    overlay.querySelector('#saveItemBtn').onclick = () => {
      const id = overlay.querySelector('#editItemId').value.trim();
      if (!id) { window.showToast('ID를 입력해주세요.', 'error'); return; }

      const stats = {};
      overlay.querySelectorAll('#statBonusList .kv-row').forEach(row => {
        const k = row.querySelector('select')?.value;
        const v = parseFloat(row.querySelector('input[type="number"]')?.value) || 0;
        if (k) stats[k] = v;
      });

      const effects = [];
      overlay.querySelectorAll('#effectsList .effect-val').forEach(inp => {
        if (inp.value.trim()) effects.push(inp.value.trim());
      });

      const baseATK = parseInt(overlay.querySelector('#editItemBaseATK').value) || 0;
      const baseATK_SPEED = parseInt(overlay.querySelector('#editItemBaseAtkSpd').value) || 0;
      const baseRange = parseInt(overlay.querySelector('#editItemBaseRange').value) || 0;
      const baseDEF = parseInt(overlay.querySelector('#editItemBaseDEF').value) || 0;

      const saved = {
        id,
        name: overlay.querySelector('#editItemName').value.trim(),
        description: overlay.querySelector('#editItemDesc').value.trim(),
        type: overlay.querySelector('#editItemType').value,
        slot: overlay.querySelector('#editItemSlot').value,
        weaponType: overlay.querySelector('#editItemWeaponType').value.trim() || null,
        rarity: overlay.querySelector('#editItemRarity').value,
        levelReq: parseInt(overlay.querySelector('#editItemLevel').value) || 1,
        stats,
        proficiencyBonus: parseInt(overlay.querySelector('#editItemProf').value) || 0,
        specialEffects: effects,
        icon: overlay.querySelector('#editItemIcon').value.trim(),
        spriteKey: overlay.querySelector('#editItemSpriteKey').value.trim() || null,
        stackable: overlay.querySelector('#editItemStackable').checked,
        maxStack: parseInt(overlay.querySelector('#editItemMaxStack').value) || 1,
      };
      if (baseATK) saved.baseATK = baseATK;
      if (baseATK_SPEED) saved.baseATK_SPEED = baseATK_SPEED;
      if (baseRange) saved.baseRange = baseRange;
      if (baseDEF) saved.baseDEF = baseDEF;

      if (!isNew) delete this.dm.data.items[itemId]; // remove old key if id changed
      this.dm.data.items[id] = saved;
      this.dm.save();
      overlay.remove();
      this.render(container);
      window.showToast('아이템이 저장되었습니다.', 'success');
    };
  }

  _statRowHtml(key, val, statKeys) {
    const opts = statKeys.map(k => `<option value="${k}" ${k === key ? 'selected' : ''}>${STATS[k]?.nameKo || k} (${k})</option>`).join('');
    return `<div class="kv-row">
      <select>${opts}</select>
      <input type="number" value="${val}" step="1">
      <button class="btn btn-danger btn-small btn-remove remove-stat-btn">X</button>
    </div>`;
  }

  _bindStatRowRemove(overlay) {
    overlay.querySelectorAll('.remove-stat-btn').forEach(btn => {
      btn.onclick = () => btn.closest('.kv-row').remove();
    });
  }

  _bindEffectRemove(overlay) {
    overlay.querySelectorAll('.remove-effect-btn').forEach(btn => {
      btn.onclick = () => btn.closest('.kv-row').remove();
    });
  }

  // =========================================================================
  // Sprite Key Selector (Dropdown + Search + Preview)
  // =========================================================================

  _getSpriteKeys() {
    // All equipment/icon sprite keys
    const builtIn = [
      'equip_weapon_sword', 'equip_weapon_spear', 'equip_weapon_dual', 'equip_weapon_staff',
      'equip_helmet_basic', 'equip_helmet_crown',
      'equip_armor_leather', 'equip_armor_iron',
      'equip_shield', 'equip_gloves_basic', 'equip_shoes_basic',
      'equip_belt_fancy', 'equip_necklace', 'equip_talisman',
      'icon_sword', 'icon_staff', 'icon_armor', 'icon_potion',
    ];
    // Add custom sprites from localStorage
    try {
      const customs = JSON.parse(localStorage.getItem('murimAdventure_customSprites') || '{}');
      for (const key of Object.keys(customs)) {
        if (!builtIn.includes(key)) builtIn.push(key);
      }
    } catch {}
    return builtIn;
  }

  _initSpriteSelector(overlay) {
    const input = overlay.querySelector('#editItemSpriteKey');
    const dropdown = overlay.querySelector('#spriteDropdown');
    const previewBox = overlay.querySelector('#spritePreviewBox');
    if (!input || !dropdown) return;

    const allKeys = this._getSpriteKeys();

    const showDropdown = (filter) => {
      const term = (filter || '').toLowerCase();
      const filtered = term ? allKeys.filter(k => k.toLowerCase().includes(term)) : allKeys;
      if (filtered.length === 0) {
        dropdown.style.display = 'none';
        return;
      }
      dropdown.style.display = 'block';
      dropdown.innerHTML = filtered.map(k =>
        `<div class="spr-dd-item" data-key="${k}" style="padding:6px 10px;cursor:pointer;font-size:12px;color:var(--text);display:flex;align-items:center;gap:8px;border-bottom:1px solid var(--border);">
          <canvas class="spr-dd-thumb" data-key="${k}" width="24" height="24" style="image-rendering:pixelated;background:#222;border-radius:2px;flex-shrink:0;"></canvas>
          <span>${k}</span>
        </div>`
      ).join('');

      // Load thumbnails
      dropdown.querySelectorAll('.spr-dd-thumb').forEach(canvas => {
        this._drawSpriteThumb(canvas, canvas.dataset.key);
      });

      // Click to select
      dropdown.querySelectorAll('.spr-dd-item').forEach(el => {
        el.addEventListener('click', () => {
          input.value = el.dataset.key;
          dropdown.style.display = 'none';
          this._updateSpritePreview(previewBox, el.dataset.key);
        });
        el.addEventListener('mouseenter', () => { el.style.background = 'var(--bg-hover)'; });
        el.addEventListener('mouseleave', () => { el.style.background = ''; });
      });
    };

    // Events
    input.addEventListener('focus', () => showDropdown(input.value));
    input.addEventListener('input', () => showDropdown(input.value));
    input.addEventListener('blur', () => {
      setTimeout(() => { dropdown.style.display = 'none'; }, 200);
    });

    // Initial preview
    if (input.value) {
      this._updateSpritePreview(previewBox, input.value);
    }
  }

  _drawSpriteThumb(canvas, spriteKey) {
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // Try custom sprite first
    try {
      const customs = JSON.parse(localStorage.getItem('murimAdventure_customSprites') || '{}');
      if (customs[spriteKey]) {
        const img = new Image();
        img.onload = () => {
          const fw = customs[spriteKey].frameWidth || img.width;
          const fh = customs[spriteKey].frameHeight || img.height;
          ctx.drawImage(img, 0, 0, fw, fh, 0, 0, 24, 24);
        };
        img.src = customs[spriteKey].dataUrl;
        return;
      }
    } catch {}

    // Fallback: draw colored placeholder
    const colors = {
      'equip_weapon_sword': '#ccccdd', 'equip_weapon_spear': '#886644', 'equip_weapon_dual': '#ccccdd',
      'equip_weapon_staff': '#775533', 'equip_helmet_basic': '#888899', 'equip_helmet_crown': '#ccaa33',
      'equip_armor_leather': '#8B6914', 'equip_armor_iron': '#888899', 'equip_shield': '#885533',
      'equip_gloves_basic': '#885533', 'equip_shoes_basic': '#664422', 'equip_belt_fancy': '#cc3333',
      'equip_necklace': '#ccaa33', 'equip_talisman': '#eeee88',
      'icon_sword': '#ccccdd', 'icon_staff': '#886644', 'icon_armor': '#888899', 'icon_potion': '#cc3333',
    };
    ctx.fillStyle = colors[spriteKey] || '#666';
    ctx.fillRect(4, 4, 16, 16);
    ctx.fillStyle = '#fff';
    ctx.font = '8px monospace';
    ctx.fillText(spriteKey.slice(0, 3), 2, 22);
  }

  _updateSpritePreview(container, spriteKey) {
    if (!container) return;
    if (!spriteKey) {
      container.innerHTML = '<span style="color:var(--text-dim);font-size:10px;">스프라이트 미선택</span>';
      return;
    }

    container.innerHTML = `
      <canvas id="sprPreviewCanvas" width="48" height="48" style="image-rendering:pixelated;background:#1a1a2e;border:1px solid var(--border);border-radius:4px;"></canvas>
      <span style="color:var(--text-dim);font-size:11px;">${spriteKey}</span>
    `;

    const canvas = container.querySelector('#sprPreviewCanvas');
    if (canvas) {
      const pctx = canvas.getContext('2d');
      pctx.imageSmoothingEnabled = false;

      // Try custom
      try {
        const customs = JSON.parse(localStorage.getItem('murimAdventure_customSprites') || '{}');
        if (customs[spriteKey]) {
          const img = new Image();
          img.onload = () => {
            const fw = customs[spriteKey].frameWidth || img.width;
            const fh = customs[spriteKey].frameHeight || img.height;
            pctx.drawImage(img, 0, 0, fw, fh, 0, 0, 48, 48);
          };
          img.src = customs[spriteKey].dataUrl;
          return;
        }
      } catch {}

      // Placeholder
      pctx.fillStyle = '#444';
      pctx.fillRect(8, 8, 32, 32);
      pctx.fillStyle = '#aaa';
      pctx.font = '10px monospace';
      pctx.fillText(spriteKey.split('_').pop(), 4, 30);
    }
  }

  _updatePreview(overlay, item) {
    const previewEl = overlay.querySelector('#itemPreview');
    const rarityDef = ITEM_RARITY[item.rarity] || {};
    const borderColor = rarityDef.color || '#555';
    const statsHtml = item.stats ? Object.entries(item.stats).map(([k, v]) =>
      `<div><span class="stat-key">${STATS[k]?.nameKo || k}</span><span class="stat-val">+${v}</span></div>`
    ).join('') : '';

    previewEl.innerHTML = `
      <div class="preview-card" style="border-color:${borderColor};">
        <div class="preview-name rarity-${item.rarity}">${item.name || '(이름없음)'}</div>
        <div style="font-size:11px;margin-bottom:4px;">
          <span class="rarity-${item.rarity}">${rarityDef.nameKo || ''}</span>
          <span style="color:var(--text-dim);margin-left:6px;">Lv.${item.levelReq || 1}</span>
        </div>
        <div class="preview-desc">${item.description || ''}</div>
        <div class="preview-stats">${statsHtml}</div>
      </div>
    `;
  }
}
