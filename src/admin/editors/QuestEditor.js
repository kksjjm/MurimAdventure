// =============================================================================
// QuestEditor - 퀘스트 관리
// =============================================================================

export class QuestEditor {
  constructor(dataManager) {
    this.dm = dataManager;
    this.searchTerm = '';
    this.filterType = '';
  }

  getQuests() { return this.dm.data.quests || []; }

  render(container) {
    const quests = this.getQuests();

    let filtered = quests.filter(q => {
      if (this.searchTerm && !q.name?.includes(this.searchTerm) && !q.id?.includes(this.searchTerm)) return false;
      if (this.filterType && q.type !== this.filterType) return false;
      return true;
    });

    const typeLabels = { main: '메인', side: '서브', daily: '일일', repeatable: '반복' };
    const typeBadge = { main: 'badge-gold', side: 'badge-blue', daily: 'badge-green', repeatable: 'badge-purple' };

    container.innerHTML = `
      <div class="section-header">
        <h2>퀘스트 관리 <small>Quests</small></h2>
        <button class="btn btn-primary" id="addQuestBtn">+ 퀘스트 추가</button>
      </div>

      <div class="toolbar">
        <input type="text" class="search-input" id="questSearch" placeholder="퀘스트 검색..." value="${this.searchTerm}">
        <select class="filter-select" id="questTypeFilter">
          <option value="">전체 유형</option>
          ${Object.entries(typeLabels).map(([k, v]) => `<option value="${k}" ${this.filterType === k ? 'selected' : ''}>${v}</option>`).join('')}
        </select>
        <span style="font-size:12px;color:var(--text-dim);">${filtered.length}개 퀘스트</span>
      </div>

      <!-- Quest chain visualization -->
      <div class="card" style="margin-bottom:16px;">
        <div class="card-header"><h3>퀘스트 체인</h3></div>
        <div class="quest-chain" id="questChainViz">
          ${this._buildChainHtml(quests)}
        </div>
      </div>

      <div class="table-container">
        <div class="table-scroll">
          <table class="data-table">
            <thead><tr>
              <th>ID</th><th>이름</th><th>유형</th><th>목표</th><th>보상</th><th>선행퀘스트</th><th>작업</th>
            </tr></thead>
            <tbody>
              ${filtered.map((q, idx) => `<tr>
                <td style="font-size:11px;color:var(--text-dim);">${q.id}</td>
                <td>${q.name || q.id}</td>
                <td><span class="badge ${typeBadge[q.type] || 'badge-blue'}">${typeLabels[q.type] || q.type}</span></td>
                <td style="font-size:11px;">${(q.objectives || []).map(o => o.description || '').join(', ') || '-'}</td>
                <td style="font-size:11px;">EXP:${q.rewards?.exp || 0} G:${q.rewards?.gold || 0}</td>
                <td style="font-size:11px;color:var(--text-dim);">${(q.prerequisites || []).join(', ') || '-'}</td>
                <td>
                  <button class="btn btn-secondary btn-small edit-quest-btn" data-idx="${idx}">편집</button>
                  <button class="btn btn-danger btn-small delete-quest-btn" data-idx="${idx}">삭제</button>
                </td>
              </tr>`).join('')}
              ${filtered.length === 0 ? '<tr><td colspan="7" style="text-align:center;color:var(--text-dim);">퀘스트가 없습니다.</td></tr>' : ''}
            </tbody>
          </table>
        </div>
      </div>
    `;

    container.querySelector('#questSearch').oninput = (e) => { this.searchTerm = e.target.value; this.render(container); };
    container.querySelector('#questTypeFilter').onchange = (e) => { this.filterType = e.target.value; this.render(container); };
    container.querySelector('#addQuestBtn').onclick = () => this.openEditor(container, -1);
    container.querySelectorAll('.edit-quest-btn').forEach(btn => {
      btn.onclick = () => this.openEditor(container, parseInt(btn.dataset.idx));
    });
    container.querySelectorAll('.delete-quest-btn').forEach(btn => {
      btn.onclick = () => {
        if (confirm('이 퀘스트를 삭제하시겠습니까?')) {
          this.dm.data.quests.splice(parseInt(btn.dataset.idx), 1);
          this.dm.save();
          this.render(container);
          window.showToast('퀘스트가 삭제되었습니다.', 'success');
        }
      };
    });
  }

  _buildChainHtml(quests) {
    // Build chain: show main quests in order with arrows
    const mainQuests = quests.filter(q => q.type === 'main');
    if (mainQuests.length === 0) return '<span style="font-size:12px;color:var(--text-dim);">메인 퀘스트가 없습니다.</span>';

    // Simple topological display
    const visited = new Set();
    const chain = [];
    const questMap = {};
    mainQuests.forEach(q => { questMap[q.id] = q; });

    // Find root quests (no prerequisites)
    const roots = mainQuests.filter(q => !q.prerequisites || q.prerequisites.length === 0);

    const traverse = (q) => {
      if (visited.has(q.id)) return;
      visited.add(q.id);
      chain.push(q);
      // Find quests that have this as prerequisite
      mainQuests.filter(mq => (mq.prerequisites || []).includes(q.id)).forEach(traverse);
    };
    roots.forEach(traverse);
    // Add any unvisited
    mainQuests.forEach(q => { if (!visited.has(q.id)) chain.push(q); });

    return chain.map((q, i) => {
      const arrow = i < chain.length - 1 ? '<span class="quest-arrow">&#x2192;</span>' : '';
      return `<span class="quest-node">${q.name || q.id}</span>${arrow}`;
    }).join('');
  }

  openEditor(root, idx) {
    const isNew = idx < 0;
    const quest = isNew ? {
      id: '', name: '', description: '', type: 'side', prerequisites: [],
      objectives: [], rewards: { exp: 0, gold: 0, items: [], skills: [] }, dialogues: []
    } : JSON.parse(JSON.stringify(this.dm.data.quests[idx]));

    if (!quest.objectives) quest.objectives = [];
    if (!quest.rewards) quest.rewards = { exp: 0, gold: 0, items: [], skills: [] };
    if (!quest.dialogues) quest.dialogues = [];
    if (!quest.prerequisites) quest.prerequisites = [];

    const questIds = this.getQuests().map(q => q.id).filter(id => id !== quest.id);
    const objectiveTypes = [
      { key: 'kill', label: '처치' },
      { key: 'collect', label: '수집' },
      { key: 'talk', label: '대화' },
      { key: 'reach', label: '도달' },
    ];

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal" style="max-width:800px;">
        <div class="modal-header">
          <h3>${isNew ? '새 퀘스트 추가' : '퀘스트 편집'}</h3>
          <button class="btn btn-secondary btn-small modal-close-btn">X</button>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <div class="form-group"><label>ID</label><input type="text" id="editQId" value="${quest.id}" ${isNew ? '' : 'readonly style="opacity:0.6;"'}></div>
            <div class="form-group"><label>이름</label><input type="text" id="editQName" value="${quest.name || ''}"></div>
          </div>
          <div class="form-group"><label>설명</label><textarea id="editQDesc">${quest.description || ''}</textarea></div>
          <div class="form-row">
            <div class="form-group">
              <label>유형</label>
              <select id="editQType">
                <option value="main" ${quest.type === 'main' ? 'selected' : ''}>메인</option>
                <option value="side" ${quest.type === 'side' ? 'selected' : ''}>서브</option>
                <option value="daily" ${quest.type === 'daily' ? 'selected' : ''}>일일</option>
                <option value="repeatable" ${quest.type === 'repeatable' ? 'selected' : ''}>반복</option>
              </select>
            </div>
            <div class="form-group">
              <label>선행 퀘스트</label>
              <input type="text" id="editQPrereqs" value="${(quest.prerequisites || []).join(', ')}" placeholder="quest_id1, quest_id2">
            </div>
          </div>

          <h4 style="color:var(--gold);font-size:13px;margin:12px 0 8px;">목표</h4>
          <div id="objectiveList">
            ${quest.objectives.map((obj, i) => `
              <div class="card" style="padding:10px;margin-bottom:6px;" data-obj-idx="${i}">
                <div class="form-row">
                  <div class="form-group">
                    <label>유형</label>
                    <select class="obj-type">
                      ${objectiveTypes.map(t => `<option value="${t.key}" ${obj.type === t.key ? 'selected' : ''}>${t.label}</option>`).join('')}
                    </select>
                  </div>
                  <div class="form-group"><label>대상 ID</label><input type="text" class="obj-target" value="${obj.targetId || ''}"></div>
                  <div class="form-group"><label>수량</label><input type="number" class="obj-count" value="${obj.count || 1}" min="1"></div>
                </div>
                <div class="form-row">
                  <div class="form-group"><label>설명</label><input type="text" class="obj-desc" value="${obj.description || ''}"></div>
                  <div class="form-group" style="flex:0;"><button class="btn btn-danger btn-small remove-obj-btn" style="margin-top:20px;">X</button></div>
                </div>
              </div>
            `).join('')}
          </div>
          <button class="btn btn-secondary btn-small" id="addObjBtn">+ 목표 추가</button>

          <h4 style="color:var(--gold);font-size:13px;margin:12px 0 8px;">보상</h4>
          <div class="form-row">
            <div class="form-group"><label>경험치</label><input type="number" id="editQRewardExp" value="${quest.rewards.exp || 0}"></div>
            <div class="form-group"><label>골드</label><input type="number" id="editQRewardGold" value="${quest.rewards.gold || 0}"></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>아이템 보상 (ID, 쉼표 구분)</label><input type="text" id="editQRewardItems" value="${(quest.rewards.items || []).join(', ')}"></div>
            <div class="form-group"><label>스킬 보상 (ID, 쉼표 구분)</label><input type="text" id="editQRewardSkills" value="${(quest.rewards.skills || []).join(', ')}"></div>
          </div>

          <h4 style="color:var(--gold);font-size:13px;margin:12px 0 8px;">대화</h4>
          <div id="dialogueList">
            ${quest.dialogues.map((d, i) => `
              <div class="form-row" style="margin-bottom:6px;" data-dlg-idx="${i}">
                <div class="form-group"><label>NPC</label><input type="text" class="dlg-npc" value="${d.npcName || ''}"></div>
                <div class="form-group" style="flex:2;"><label>대사</label><input type="text" class="dlg-text" value="${d.text || ''}"></div>
                <div class="form-group" style="flex:0;"><button class="btn btn-danger btn-small remove-dlg-btn" style="margin-top:20px;">X</button></div>
              </div>
            `).join('')}
          </div>
          <button class="btn btn-secondary btn-small" id="addDlgBtn">+ 대화 추가</button>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary modal-close-btn">취소</button>
          <button class="btn btn-primary" id="saveQuestBtn">저장</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    overlay.querySelectorAll('.modal-close-btn').forEach(b => b.onclick = () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

    // Add objective
    overlay.querySelector('#addObjBtn').onclick = () => {
      const list = overlay.querySelector('#objectiveList');
      list.insertAdjacentHTML('beforeend', `
        <div class="card" style="padding:10px;margin-bottom:6px;">
          <div class="form-row">
            <div class="form-group">
              <label>유형</label>
              <select class="obj-type">
                ${objectiveTypes.map(t => `<option value="${t.key}">${t.label}</option>`).join('')}
              </select>
            </div>
            <div class="form-group"><label>대상 ID</label><input type="text" class="obj-target" value=""></div>
            <div class="form-group"><label>수량</label><input type="number" class="obj-count" value="1" min="1"></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>설명</label><input type="text" class="obj-desc" value=""></div>
            <div class="form-group" style="flex:0;"><button class="btn btn-danger btn-small remove-obj-btn" style="margin-top:20px;">X</button></div>
          </div>
        </div>
      `);
      this._bindRemoveButtons(overlay);
    };

    // Add dialogue
    overlay.querySelector('#addDlgBtn').onclick = () => {
      const list = overlay.querySelector('#dialogueList');
      list.insertAdjacentHTML('beforeend', `
        <div class="form-row" style="margin-bottom:6px;">
          <div class="form-group"><label>NPC</label><input type="text" class="dlg-npc" value=""></div>
          <div class="form-group" style="flex:2;"><label>대사</label><input type="text" class="dlg-text" value=""></div>
          <div class="form-group" style="flex:0;"><button class="btn btn-danger btn-small remove-dlg-btn" style="margin-top:20px;">X</button></div>
        </div>
      `);
      this._bindRemoveButtons(overlay);
    };

    this._bindRemoveButtons(overlay);

    // Save
    overlay.querySelector('#saveQuestBtn').onclick = () => {
      const id = overlay.querySelector('#editQId').value.trim();
      if (!id) { window.showToast('ID를 입력해주세요.', 'error'); return; }

      const objectives = [];
      overlay.querySelectorAll('#objectiveList > *').forEach(card => {
        objectives.push({
          type: card.querySelector('.obj-type')?.value || 'kill',
          targetId: card.querySelector('.obj-target')?.value?.trim() || '',
          count: parseInt(card.querySelector('.obj-count')?.value) || 1,
          description: card.querySelector('.obj-desc')?.value?.trim() || ''
        });
      });

      const dialogues = [];
      overlay.querySelectorAll('#dialogueList > *').forEach(row => {
        const npc = row.querySelector('.dlg-npc')?.value?.trim();
        const text = row.querySelector('.dlg-text')?.value?.trim();
        if (npc || text) dialogues.push({ npcName: npc || '', text: text || '' });
      });

      const prereqStr = overlay.querySelector('#editQPrereqs').value.trim();
      const prerequisites = prereqStr ? prereqStr.split(',').map(s => s.trim()).filter(Boolean) : [];

      const itemsStr = overlay.querySelector('#editQRewardItems').value.trim();
      const skillsStr = overlay.querySelector('#editQRewardSkills').value.trim();

      const saved = {
        id,
        name: overlay.querySelector('#editQName').value.trim(),
        description: overlay.querySelector('#editQDesc').value.trim(),
        type: overlay.querySelector('#editQType').value,
        prerequisites,
        objectives,
        rewards: {
          exp: parseInt(overlay.querySelector('#editQRewardExp').value) || 0,
          gold: parseInt(overlay.querySelector('#editQRewardGold').value) || 0,
          items: itemsStr ? itemsStr.split(',').map(s => s.trim()).filter(Boolean) : [],
          skills: skillsStr ? skillsStr.split(',').map(s => s.trim()).filter(Boolean) : [],
        },
        dialogues
      };

      if (!this.dm.data.quests) this.dm.data.quests = [];
      if (isNew) {
        this.dm.data.quests.push(saved);
      } else {
        this.dm.data.quests[idx] = saved;
      }
      this.dm.save();
      overlay.remove();
      this.render(root);
      window.showToast('퀘스트가 저장되었습니다.', 'success');
    };
  }

  _bindRemoveButtons(overlay) {
    overlay.querySelectorAll('.remove-obj-btn').forEach(btn => {
      btn.onclick = () => btn.closest('.card').remove();
    });
    overlay.querySelectorAll('.remove-dlg-btn').forEach(btn => {
      btn.onclick = () => btn.closest('.form-row').remove();
    });
  }
}
