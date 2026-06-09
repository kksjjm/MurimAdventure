// =============================================================================
// NpcEditor - NPC data management
// =============================================================================

import { bindSpriteSelect, spriteSelectHtml } from '../components/SpriteSelect.js';

const NPC_TYPES = [
  { key: 'info', label: '정보 NPC' },
  { key: 'quest', label: '퀘스트 NPC' },
  { key: 'shop_weapon', label: '무기 상점 NPC' },
  { key: 'shop_general', label: '잡화 상점 NPC' },
];

export class NpcEditor {
  constructor(dataManager) {
    this.dm = dataManager;
    this.searchTerm = '';
    this.filterType = '';
  }

  getNpcs() {
    return this.dm.data.npcs || {};
  }

  _escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, ch => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[ch]));
  }

  render(container) {
    const npcs = Object.values(this.getNpcs());
    const filtered = npcs.filter((npc) => {
      const q = this.searchTerm.trim().toLowerCase();
      const searchText = [npc.id, npc.name, npc.nameKo, npc.type, npc.shopType, npc.description]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (q && !searchText.includes(q)) return false;
      if (this.filterType && npc.type !== this.filterType) return false;
      return true;
    });

    const typeOptions = NPC_TYPES.map(type =>
      `<option value="${type.key}" ${this.filterType === type.key ? 'selected' : ''}>${type.label}</option>`
    ).join('');

    container.innerHTML = `
      <div class="section-header">
        <h2>NPC 관리<small>NPC Data</small></h2>
        <button class="btn btn-primary" id="addNpcBtn">+ NPC 추가</button>
      </div>
      <div class="toolbar">
        <input type="text" class="search-input" id="npcSearch" placeholder="NPC ID, 이름, 타입 검색..." value="${this._escapeHtml(this.searchTerm)}">
        <select class="filter-select" id="npcTypeFilter">
          <option value="">전체 유형</option>
          ${typeOptions}
        </select>
      </div>
      <div class="table-container">
        <div class="table-scroll">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>이름</th>
                <th>유형</th>
                <th>스프라이트</th>
                <th>상점</th>
                <th>퀘스트</th>
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.map(npc => `
                <tr>
                  <td style="font-size:11px;color:var(--text-dim);">${this._escapeHtml(npc.id)}</td>
                  <td>${this._escapeHtml(npc.nameKo || npc.name || npc.id)}</td>
                  <td>${this._escapeHtml(NPC_TYPES.find(t => t.key === npc.type)?.label || npc.type || '-')}</td>
                  <td style="font-size:11px;color:var(--text-dim);">${this._escapeHtml(npc.spriteKey || npc.texture || '-')}</td>
                  <td>${this._escapeHtml(npc.shopType || '-')}</td>
                  <td>${this._escapeHtml((npc.quests || []).join(', ') || '-')}</td>
                  <td>
                    <button class="btn btn-secondary btn-small edit-npc-btn" data-id="${this._escapeHtml(npc.id)}">편집</button>
                    <button class="btn btn-danger btn-small delete-npc-btn" data-id="${this._escapeHtml(npc.id)}">삭제</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    container.querySelector('#addNpcBtn').onclick = () => this.openEditor(container, null);
    container.querySelector('#npcSearch').oninput = (event) => {
      this.searchTerm = event.target.value;
      this.render(container);
    };
    container.querySelector('#npcTypeFilter').onchange = (event) => {
      this.filterType = event.target.value;
      this.render(container);
    };
    container.querySelectorAll('.edit-npc-btn').forEach(btn => {
      btn.onclick = () => this.openEditor(container, btn.dataset.id);
    });
    container.querySelectorAll('.delete-npc-btn').forEach(btn => {
      btn.onclick = () => {
        if (!confirm(`"${btn.dataset.id}" NPC를 삭제하시겠습니까?`)) return;
        delete this.dm.data.npcs[btn.dataset.id];
        this.dm.save();
        this.render(container);
        window.showToast('NPC가 삭제되었습니다.', 'success');
      };
    });
  }

  openEditor(root, npcId) {
    const isNew = !npcId;
    const npc = isNew ? {
      id: '',
      module_id: 'world_system',
      name: '',
      nameKo: '',
      type: 'info',
      texture: 'npc_elder',
      spriteKey: 'npc_elder',
      description: '',
      dialogues: { default: ['관리자 페이지에서 작성한 NPC 대화입니다.'] },
      quests: [],
      shopType: null,
    } : JSON.parse(JSON.stringify(this.dm.data.npcs[npcId] || {}));

    if (!npc.id && npcId) npc.id = npcId;
    if (!npc.dialogues) npc.dialogues = { default: [] };
    if (!Array.isArray(npc.quests)) npc.quests = [];

    const typeOptions = NPC_TYPES.map(type =>
      `<option value="${type.key}" ${npc.type === type.key ? 'selected' : ''}>${type.label}</option>`
    ).join('');
    const shopOptions = Object.keys(this.dm.data.shops || {}).map(shopId =>
      `<option value="${shopId}" ${npc.shopType === shopId ? 'selected' : ''}>${shopId}</option>`
    ).join('');
    const dialogueJson = JSON.stringify(npc.dialogues, null, 2);

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal" style="max-width:800px;">
        <div class="modal-header">
          <h3>${isNew ? '새 NPC 추가' : 'NPC 편집'}</h3>
          <button class="btn btn-secondary btn-small modal-close-btn">X</button>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <div class="form-group"><label>ID</label><input type="text" id="editNpcId" value="${this._escapeHtml(npc.id)}" ${isNew ? '' : 'readonly style="opacity:0.6;"'}></div>
            <div class="form-group"><label>영문 이름</label><input type="text" id="editNpcName" value="${this._escapeHtml(npc.name || '')}"></div>
            <div class="form-group"><label>한글 이름</label><input type="text" id="editNpcNameKo" value="${this._escapeHtml(npc.nameKo || '')}"></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>유형</label><select id="editNpcType">${typeOptions}</select></div>
            <div class="form-group"><label>모듈</label><input type="text" id="editNpcModule" value="${this._escapeHtml(npc.module_id || 'world_system')}"></div>
            <div class="form-group"><label>상점 연결</label><select id="editNpcShop"><option value="">없음</option>${shopOptions}</select></div>
          </div>
          <div class="form-row">
            <div class="form-group" style="flex:2;">
              <label>스프라이트 키</label>
              ${spriteSelectHtml({ id: 'editNpcSprite', value: npc.spriteKey || npc.texture || '', placeholder: 'NPC 스프라이트 검색...' })}
            </div>
            <div class="form-group"><label>퀘스트 ID 목록</label><input type="text" id="editNpcQuests" value="${this._escapeHtml(npc.quests.join(', '))}" placeholder="quest_01, quest_02"></div>
          </div>
          <div class="form-group">
            <label>설명</label>
            <textarea id="editNpcDesc">${this._escapeHtml(npc.description || '')}</textarea>
          </div>
          <h4 style="color:var(--gold);font-size:13px;margin:12px 0 6px;">대화 JSON</h4>
          <div class="form-group">
            <textarea id="editNpcDialogues" style="min-height:180px;font-family:monospace;font-size:12px;">${this._escapeHtml(dialogueJson)}</textarea>
            <small style="color:var(--text-dim);font-size:10px;">예: {"default":["안녕하세요"],"shop":["상점을 열어드립니다."]}</small>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary modal-close-btn">취소</button>
          <button class="btn btn-primary" id="saveNpcBtn">저장</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    overlay.querySelectorAll('.modal-close-btn').forEach(btn => btn.onclick = () => overlay.remove());
    overlay.addEventListener('click', (event) => { if (event.target === overlay) overlay.remove(); });
    bindSpriteSelect(overlay, 'editNpcSprite', { allowEmpty: false });

    overlay.querySelector('#saveNpcBtn').onclick = () => {
      const id = overlay.querySelector('#editNpcId').value.trim();
      if (!id) {
        window.showToast('ID를 입력해주세요.', 'error');
        return;
      }

      let dialogues;
      try {
        dialogues = JSON.parse(overlay.querySelector('#editNpcDialogues').value.trim() || '{}');
      } catch (error) {
        window.showToast('대화 JSON 형식 오류', 'error');
        return;
      }

      const spriteKey = overlay.querySelector('#editNpcSprite').value.trim() || 'npc_elder';
      const quests = overlay.querySelector('#editNpcQuests').value
        .split(',')
        .map(value => value.trim())
        .filter(Boolean);
      const shopType = overlay.querySelector('#editNpcShop').value || null;

      const saved = {
        ...npc,
        id,
        module_id: overlay.querySelector('#editNpcModule').value.trim() || 'world_system',
        name: overlay.querySelector('#editNpcName').value.trim(),
        nameKo: overlay.querySelector('#editNpcNameKo').value.trim(),
        type: overlay.querySelector('#editNpcType').value,
        texture: spriteKey,
        spriteKey,
        description: overlay.querySelector('#editNpcDesc').value.trim(),
        dialogues,
        quests,
        shopType,
      };

      if (!isNew) delete this.dm.data.npcs[npcId];
      this.dm.data.npcs[id] = saved;
      this.dm.save();
      overlay.remove();
      this.render(root);
      window.showToast('NPC가 저장되었습니다.', 'success');
    };
  }

  _getNpcSpriteOptions() {
    const builtIn = ['npc_elder', 'npc_blacksmith', 'npc_merchant', 'npc_guard', 'npc_herbalist', 'player_base'];
    const customs = (() => {
      try { return Object.keys(JSON.parse(localStorage.getItem('murimAdventure_customSprites') || '{}')); }
      catch { return []; }
    })();
    const npcCustoms = customs.filter(key => key.startsWith('npc_') || key.startsWith('char_') || key.startsWith('player_'));
    return [...new Set([...builtIn, ...npcCustoms])];
  }
}
