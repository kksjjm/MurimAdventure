// =============================================================================
// CharacterEditor - Main character management
// =============================================================================

import { STATS } from '../../data/constants.js';
import { bindSpriteSelect, spriteSelectHtml } from '../components/SpriteSelect.js';

export class CharacterEditor {
  constructor(dataManager) {
    this.dm = dataManager;
  }

  getCharacter() {
    if (!this.dm.data.mainCharacter) {
      this.dm.data.mainCharacter = {
        id: 'main_character',
        name: 'Main Character',
        nameKo: '메인 캐릭터',
        spriteKey: 'player_base',
        level: 1,
        classId: 'class_adventurer',
        raceId: 'race_human',
        description: '플레이어가 조작하는 기본 캐릭터입니다.',
      };
    }
    return this.dm.data.mainCharacter;
  }

  render(container) {
    const character = this.getCharacter();
    const stats = this.dm.data.gameSettings?.startingStats || {};
    const statKeys = Object.keys(STATS).slice(0, 12);

    container.innerHTML = `
      <div class="section-header">
        <h2>메인 캐릭터 관리 <small>Main Character</small></h2>
        <div style="display:flex;gap:8px;">
          <button class="btn btn-secondary" id="openCharacterSpritesBtn">스프라이트 관리로 이동</button>
          <button class="btn btn-primary" id="saveCharacterBtn">저장</button>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><h3>기본 정보</h3></div>
        <div class="form-row">
          <div class="form-group"><label>ID</label><input type="text" id="charId" value="${character.id || 'main_character'}"></div>
          <div class="form-group"><label>이름</label><input type="text" id="charName" value="${character.name || ''}"></div>
          <div class="form-group"><label>표시 이름</label><input type="text" id="charNameKo" value="${character.nameKo || ''}"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>레벨</label><input type="number" id="charLevel" value="${character.level || 1}" min="1"></div>
          <div class="form-group"><label>직업 ID</label><input type="text" id="charClassId" value="${character.classId || ''}"></div>
          <div class="form-group"><label>종족 ID</label><input type="text" id="charRaceId" value="${character.raceId || ''}"></div>
        </div>
        <div class="form-group">
          <label>설명</label>
          <textarea id="charDescription">${character.description || ''}</textarea>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><h3>스프라이트</h3></div>
        <div class="form-row">
          <div class="form-group">
            <label>기본 스프라이트 키</label>
            ${spriteSelectHtml({ id: 'charSpriteKey', value: character.spriteKey || 'player_base', placeholder: '메인 캐릭터 스프라이트 검색...' })}
            <small style="color:var(--text-dim);font-size:11px;">스프라이트 관리 > 메인 캐릭터에서 player_base를 수정하면 인게임 플레이어 박스 외형에 반영됩니다.</small>
          </div>
          <div class="form-group">
            <label>미리보기</label>
            <div style="height:72px;background:var(--bg-dark);border:1px solid var(--border);border-radius:4px;display:flex;align-items:center;justify-content:center;">
              <canvas id="charPreviewCanvas" width="64" height="64" style="width:64px;height:64px;image-rendering:pixelated;"></canvas>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><h3>초기 능력치</h3></div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;">
          ${statKeys.map(key => `
            <div style="background:var(--bg-dark);border:1px solid var(--border);border-radius:4px;padding:8px;">
              <div style="font-size:11px;color:var(--text-dim);">${STATS[key].nameKo}</div>
              <div style="font-size:16px;color:var(--gold);font-weight:700;">${stats[key] ?? 0}</div>
              <div style="font-size:10px;color:var(--text-dim);">${key}</div>
            </div>
          `).join('')}
        </div>
        <p style="margin-top:10px;font-size:12px;color:var(--text-dim);">초기 능력치는 게임 설정 페이지의 시작 능력치와 공유됩니다.</p>
      </div>
    `;

    this._drawPreview(container.querySelector('#charPreviewCanvas'));
    bindSpriteSelect(container, 'charSpriteKey', {
      allowEmpty: false,
      onInput: () => this._drawPreview(container.querySelector('#charPreviewCanvas')),
      onSelect: () => this._drawPreview(container.querySelector('#charPreviewCanvas')),
    });

    container.querySelector('#saveCharacterBtn').onclick = () => {
      this.dm.data.mainCharacter = {
        ...character,
        id: container.querySelector('#charId').value.trim() || 'main_character',
        name: container.querySelector('#charName').value.trim() || 'Main Character',
        nameKo: container.querySelector('#charNameKo').value.trim() || '메인 캐릭터',
        level: parseInt(container.querySelector('#charLevel').value) || 1,
        classId: container.querySelector('#charClassId').value.trim() || null,
        raceId: container.querySelector('#charRaceId').value.trim() || null,
        spriteKey: container.querySelector('#charSpriteKey').value.trim() || 'player_base',
        description: container.querySelector('#charDescription').value.trim(),
      };
      this.dm.save();
      if (window.showToast) window.showToast('메인 캐릭터가 저장되었습니다.', 'success');
      this.render(container);
    };

    container.querySelector('#openCharacterSpritesBtn').onclick = () => {
      window.adminApp?.navigate?.('sprites');
    };
  }

  _drawPreview(canvas) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 64, 64);
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(14, 52, 36, 6);
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(16, 16, 32, 32);
    ctx.strokeStyle = '#93c5fd';
    ctx.lineWidth = 3;
    ctx.strokeRect(16, 16, 32, 32);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(24, 28, 6, 6);
    ctx.fillRect(34, 28, 6, 6);
    ctx.fillStyle = '#111827';
    ctx.fillRect(25, 29, 3, 3);
    ctx.fillRect(35, 29, 3, 3);
    ctx.fillRect(26, 40, 12, 3);
  }
}
