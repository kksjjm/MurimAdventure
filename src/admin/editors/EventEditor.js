// =============================================================================
// EventEditor - 이벤트 관리
// =============================================================================

export class EventEditor {
  constructor(dataManager) {
    this.dm = dataManager;
  }

  getEvents() { return this.dm.data.events || []; }

  render(container) {
    const events = this.getEvents();
    const typeLabels = {
      bonus_exp: '경험치 보너스',
      bonus_drops: '드롭률 보너스',
      special_spawns: '특별 스폰',
      limited_quests: '한정 퀘스트',
    };

    container.innerHTML = `
      <div class="section-header">
        <h2>이벤트 관리 <small>Events</small></h2>
        <button class="btn btn-primary" id="addEventBtn">+ 이벤트 추가</button>
      </div>

      <div class="table-container">
        <div class="table-scroll">
          <table class="data-table">
            <thead><tr>
              <th>ID</th><th>이름</th><th>유형</th><th>시작일</th><th>종료일</th><th>배율</th><th>상태</th><th>작업</th>
            </tr></thead>
            <tbody>
              ${events.map((ev, idx) => {
                const now = new Date().toISOString().slice(0, 10);
                const isActive = ev.active || (ev.startDate <= now && ev.endDate >= now);
                return `<tr>
                  <td style="font-size:11px;color:var(--text-dim);">${ev.id}</td>
                  <td>${ev.name || ev.id}</td>
                  <td><span class="badge badge-blue">${typeLabels[ev.type] || ev.type}</span></td>
                  <td>${ev.startDate || '-'}</td>
                  <td>${ev.endDate || '-'}</td>
                  <td>${ev.multiplier || '-'}x</td>
                  <td>${isActive ?
                    '<span class="badge badge-green">진행중</span>' :
                    '<span class="badge badge-red">비활성</span>'
                  }</td>
                  <td>
                    <button class="btn btn-secondary btn-small edit-event-btn" data-idx="${idx}">편집</button>
                    <button class="btn btn-danger btn-small delete-event-btn" data-idx="${idx}">삭제</button>
                  </td>
                </tr>`;
              }).join('')}
              ${events.length === 0 ? '<tr><td colspan="8" style="text-align:center;color:var(--text-dim);">이벤트가 없습니다.</td></tr>' : ''}
            </tbody>
          </table>
        </div>
      </div>
    `;

    container.querySelector('#addEventBtn').onclick = () => this.openEditor(container, -1);
    container.querySelectorAll('.edit-event-btn').forEach(btn => {
      btn.onclick = () => this.openEditor(container, parseInt(btn.dataset.idx));
    });
    container.querySelectorAll('.delete-event-btn').forEach(btn => {
      btn.onclick = () => {
        if (confirm('이 이벤트를 삭제하시겠습니까?')) {
          this.dm.data.events.splice(parseInt(btn.dataset.idx), 1);
          this.dm.save();
          this.render(container);
          window.showToast('이벤트가 삭제되었습니다.', 'success');
        }
      };
    });
  }

  openEditor(root, idx) {
    const isNew = idx < 0;
    const ev = isNew ? {
      id: '', name: '', description: '', type: 'bonus_exp',
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      multiplier: 2.0, rewards: [], active: false
    } : JSON.parse(JSON.stringify(this.dm.data.events[idx]));

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3>${isNew ? '새 이벤트 추가' : '이벤트 편집'}</h3>
          <button class="btn btn-secondary btn-small modal-close-btn">X</button>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <div class="form-group"><label>ID</label><input type="text" id="editEvId" value="${ev.id}" ${isNew ? '' : 'readonly style="opacity:0.6;"'}></div>
            <div class="form-group"><label>이름</label><input type="text" id="editEvName" value="${ev.name || ''}"></div>
          </div>
          <div class="form-group"><label>설명</label><textarea id="editEvDesc">${ev.description || ''}</textarea></div>
          <div class="form-row">
            <div class="form-group">
              <label>유형</label>
              <select id="editEvType">
                <option value="bonus_exp" ${ev.type === 'bonus_exp' ? 'selected' : ''}>경험치 보너스</option>
                <option value="bonus_drops" ${ev.type === 'bonus_drops' ? 'selected' : ''}>드롭률 보너스</option>
                <option value="special_spawns" ${ev.type === 'special_spawns' ? 'selected' : ''}>특별 스폰</option>
                <option value="limited_quests" ${ev.type === 'limited_quests' ? 'selected' : ''}>한정 퀘스트</option>
              </select>
            </div>
            <div class="form-group"><label>배율</label><input type="number" id="editEvMult" value="${ev.multiplier || 1}" step="0.1" min="0.1"></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>시작일</label><input type="date" id="editEvStart" value="${ev.startDate || ''}"></div>
            <div class="form-group"><label>종료일</label><input type="date" id="editEvEnd" value="${ev.endDate || ''}"></div>
          </div>
          <div class="form-group">
            <label style="display:flex;align-items:center;gap:6px;">
              <input type="checkbox" id="editEvActive" ${ev.active ? 'checked' : ''}>
              수동 활성화
            </label>
          </div>
          <h4 style="color:var(--gold);font-size:13px;margin:12px 0 8px;">이벤트 보상 (JSON)</h4>
          <div class="form-group">
            <textarea id="editEvRewards" style="min-height:80px;font-family:monospace;font-size:12px;">${JSON.stringify(ev.rewards || [], null, 2)}</textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary modal-close-btn">취소</button>
          <button class="btn btn-primary" id="saveEventBtn">저장</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    overlay.querySelectorAll('.modal-close-btn').forEach(b => b.onclick = () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

    overlay.querySelector('#saveEventBtn').onclick = () => {
      const id = overlay.querySelector('#editEvId').value.trim();
      if (!id) { window.showToast('ID를 입력해주세요.', 'error'); return; }

      let rewards = [];
      try { rewards = JSON.parse(overlay.querySelector('#editEvRewards').value); } catch (e) { /* ok */ }

      const saved = {
        id,
        name: overlay.querySelector('#editEvName').value.trim(),
        description: overlay.querySelector('#editEvDesc').value.trim(),
        type: overlay.querySelector('#editEvType').value,
        multiplier: parseFloat(overlay.querySelector('#editEvMult').value) || 1,
        startDate: overlay.querySelector('#editEvStart').value,
        endDate: overlay.querySelector('#editEvEnd').value,
        active: overlay.querySelector('#editEvActive').checked,
        rewards,
      };

      if (!this.dm.data.events) this.dm.data.events = [];
      if (isNew) this.dm.data.events.push(saved);
      else this.dm.data.events[idx] = saved;

      this.dm.save();
      overlay.remove();
      this.render(root);
      window.showToast('이벤트가 저장되었습니다.', 'success');
    };
  }
}
