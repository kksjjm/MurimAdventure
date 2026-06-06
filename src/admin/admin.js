// =============================================================================
// 무림기행 Admin Panel - Main Entry Point
// =============================================================================

import { DataManager } from './components/DataManager.js';
import { ItemEditor } from './editors/ItemEditor.js';
import { SkillEditor } from './editors/SkillEditor.js';
import { MonsterEditor } from './editors/MonsterEditor.js';
import { MapEditor } from './editors/MapEditor.js';
import { QuestEditor } from './editors/QuestEditor.js';
import { EventEditor } from './editors/EventEditor.js';
import { MountPetEditor } from './editors/MountPetEditor.js';
import { StatsConfigEditor } from './editors/StatsConfigEditor.js';
import { GameSettingsEditor } from './editors/GameSettingsEditor.js';
import { SpriteEditor } from './editors/SpriteEditor.js';

// ---- Global toast helper ----
window.showToast = function(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3000);
};

// ---- Admin App ----
class AdminApp {
  constructor() {
    this.dataManager = new DataManager();
    this.currentSection = 'dashboard';
    this.editors = {};
    this.init();
  }

  init() {
    this.dataManager.load();
    this.initEditors();
    this.bindSidebar();
    this.renderDashboard();
    this.updateVersionBadge();
  }

  initEditors() {
    this.editors = {
      items: new ItemEditor(this.dataManager),
      skills: new SkillEditor(this.dataManager),
      monsters: new MonsterEditor(this.dataManager),
      maps: new MapEditor(this.dataManager),
      sprites: new SpriteEditor(this.dataManager),
      quests: new QuestEditor(this.dataManager),
      events: new EventEditor(this.dataManager),
      mounts: new MountPetEditor(this.dataManager),
      stats: new StatsConfigEditor(this.dataManager),
      settings: new GameSettingsEditor(this.dataManager),
      data: this.dataManager,
    };
  }

  bindSidebar() {
    document.querySelectorAll('.sidebar-item').forEach(item => {
      item.addEventListener('click', () => {
        const section = item.dataset.section;
        this.navigate(section);
      });
    });
  }

  navigate(section) {
    // Update sidebar
    document.querySelectorAll('.sidebar-item').forEach(el => el.classList.remove('active'));
    document.querySelector(`.sidebar-item[data-section="${section}"]`)?.classList.add('active');

    // Update sections
    document.querySelectorAll('.section').forEach(el => el.classList.remove('active'));
    const sectionEl = document.getElementById(`section-${section}`);
    if (sectionEl) {
      sectionEl.classList.add('active');
    }

    this.currentSection = section;

    if (section === 'dashboard') {
      this.renderDashboard();
    } else if (this.editors[section]) {
      this.editors[section].render(sectionEl);
    }
  }

  renderDashboard() {
    const container = document.getElementById('section-dashboard');
    const data = this.dataManager.data;
    const itemCount = Object.keys(data.items || {}).length;
    const skillCount = Object.keys(data.skills || {}).length;
    const monsterCount = Object.keys(data.monsters || {}).length;
    const mapCount = (data.maps || []).length;
    const questCount = (data.quests || []).length;
    const eventCount = (data.events || []).length;
    const mountCount = (data.mounts || []).length;
    const petCount = (data.pets || []).length;

    container.innerHTML = `
      <div class="section-header">
        <h2>대시보드 <small>Dashboard</small></h2>
      </div>
      <div class="dashboard-grid">
        <div class="stat-card"><div class="stat-value">${itemCount}</div><div class="stat-label">아이템</div></div>
        <div class="stat-card"><div class="stat-value">${skillCount}</div><div class="stat-label">스킬</div></div>
        <div class="stat-card"><div class="stat-value">${monsterCount}</div><div class="stat-label">몬스터</div></div>
        <div class="stat-card"><div class="stat-value">${mapCount}</div><div class="stat-label">맵</div></div>
        <div class="stat-card"><div class="stat-value">${questCount}</div><div class="stat-label">퀘스트</div></div>
        <div class="stat-card"><div class="stat-value">${eventCount}</div><div class="stat-label">이벤트</div></div>
        <div class="stat-card"><div class="stat-value">${mountCount}</div><div class="stat-label">탈것</div></div>
        <div class="stat-card"><div class="stat-value">${petCount}</div><div class="stat-label">환수</div></div>
      </div>
      <div class="card">
        <div class="card-header"><h3>최근 데이터 현황</h3></div>
        <p style="color:var(--text-dim);font-size:13px;">
          좌측 사이드바에서 각 섹션을 선택하여 게임 데이터를 편집할 수 있습니다.<br>
          변경사항은 자동으로 localStorage에 저장됩니다.<br>
          <strong style="color:var(--gold);">데이터 관리</strong> 섹션에서 JSON 내보내기/가져오기가 가능합니다.
        </p>
      </div>
      <div class="card">
        <div class="card-header"><h3>빠른 가이드</h3></div>
        <div style="font-size:13px;color:var(--text-dim);line-height:1.8;">
          <div><span style="color:var(--gold);">아이템 관리</span> - 장비, 소비품, 재료 등 모든 아이템 데이터 편집</div>
          <div><span style="color:var(--gold);">스킬 관리</span> - 심법/무공/경공/주술 스킬 및 합격기 설정</div>
          <div><span style="color:var(--gold);">몬스터 관리</span> - 몬스터 능력치, 드롭 테이블, AI 행동 설정</div>
          <div><span style="color:var(--gold);">맵 에디터</span> - 타일 기반 맵 생성 및 스폰 포인트 배치</div>
          <div><span style="color:var(--gold);">퀘스트 관리</span> - 메인/서브/일일 퀘스트 및 보상 설정</div>
          <div><span style="color:var(--gold);">이벤트 관리</span> - 기간 이벤트 및 보너스 설정</div>
          <div><span style="color:var(--gold);">탈것/환수</span> - 탈것과 환수의 능력치 및 성장 시스템</div>
          <div><span style="color:var(--gold);">능력치 설정</span> - 레벨업 성장률, 전투 공식 계수 조정</div>
          <div><span style="color:var(--gold);">게임 설정</span> - 게임 기본 설정 및 기능 토글</div>
          <div><span style="color:var(--gold);">데이터 관리</span> - JSON 내보내기/가져오기, 초기화</div>
        </div>
      </div>
    `;
  }

  updateVersionBadge() {
    const settings = this.dataManager.data.gameSettings || {};
    document.getElementById('versionBadge').textContent = `v${settings.version || '0.1.0'}`;
  }
}

// Boot
document.addEventListener('DOMContentLoaded', () => {
  window.adminApp = new AdminApp();
});
