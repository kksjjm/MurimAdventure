// =============================================================================
// SpriteEditor - 스프라이트 관리 (Pixel Art Editor)
// =============================================================================

import { getItemIconKey } from '../../data/GameDataLoader.js';

const CUSTOM_SPRITES_KEY = 'murimAdventure_customSprites';
const SPRITE_WORKSPACE_VERSION_KEY = 'murimAdventure_spriteWorkspaceVersion';

const SPRITE_REGISTRY = [
  // Characters (18 sheets: 6 anims x 3 dirs)
  { key: 'char_idle_down', category: '캐릭터', name: '대기 (아래)', path: 'assets/char/Idle_Down.png', frameWidth: 64, frameHeight: 64, frames: 4, type: 'spritesheet' },
  { key: 'char_idle_side', category: '캐릭터', name: '대기 (옆)', path: 'assets/char/Idle_Side.png', frameWidth: 64, frameHeight: 64, frames: 4, type: 'spritesheet' },
  { key: 'char_idle_up', category: '캐릭터', name: '대기 (위)', path: 'assets/char/Idle_Up.png', frameWidth: 64, frameHeight: 64, frames: 4, type: 'spritesheet' },
  { key: 'char_walk_down', category: '캐릭터', name: '걷기 (아래)', path: 'assets/char/Walk_Down.png', frameWidth: 64, frameHeight: 64, frames: 6, type: 'spritesheet' },
  { key: 'char_walk_side', category: '캐릭터', name: '걷기 (옆)', path: 'assets/char/Walk_Side.png', frameWidth: 64, frameHeight: 64, frames: 6, type: 'spritesheet' },
  { key: 'char_walk_up', category: '캐릭터', name: '걷기 (위)', path: 'assets/char/Walk_Up.png', frameWidth: 64, frameHeight: 64, frames: 6, type: 'spritesheet' },
  { key: 'char_run_down', category: '캐릭터', name: '달리기 (아래)', path: 'assets/char/Run_Down.png', frameWidth: 64, frameHeight: 64, frames: 6, type: 'spritesheet' },
  { key: 'char_run_side', category: '캐릭터', name: '달리기 (옆)', path: 'assets/char/Run_Side.png', frameWidth: 64, frameHeight: 64, frames: 6, type: 'spritesheet' },
  { key: 'char_run_up', category: '캐릭터', name: '달리기 (위)', path: 'assets/char/Run_Up.png', frameWidth: 64, frameHeight: 64, frames: 6, type: 'spritesheet' },
  { key: 'char_slice_down', category: '캐릭터', name: '공격 (아래)', path: 'assets/char/Slice_Down.png', frameWidth: 64, frameHeight: 64, frames: 4, type: 'spritesheet' },
  { key: 'char_slice_side', category: '캐릭터', name: '공격 (옆)', path: 'assets/char/Slice_Side.png', frameWidth: 64, frameHeight: 64, frames: 4, type: 'spritesheet' },
  { key: 'char_slice_up', category: '캐릭터', name: '공격 (위)', path: 'assets/char/Slice_Up.png', frameWidth: 64, frameHeight: 64, frames: 4, type: 'spritesheet' },
  { key: 'char_hit_down', category: '캐릭터', name: '피격 (아래)', path: 'assets/char/Hit_Down.png', frameWidth: 64, frameHeight: 64, frames: 2, type: 'spritesheet' },
  { key: 'char_hit_side', category: '캐릭터', name: '피격 (옆)', path: 'assets/char/Hit_Side.png', frameWidth: 64, frameHeight: 64, frames: 2, type: 'spritesheet' },
  { key: 'char_hit_up', category: '캐릭터', name: '피격 (위)', path: 'assets/char/Hit_Up.png', frameWidth: 64, frameHeight: 64, frames: 2, type: 'spritesheet' },
  { key: 'char_death_down', category: '캐릭터', name: '사망 (아래)', path: 'assets/char/Death_Down.png', frameWidth: 64, frameHeight: 64, frames: 4, type: 'spritesheet' },
  { key: 'char_death_side', category: '캐릭터', name: '사망 (옆)', path: 'assets/char/Death_Side.png', frameWidth: 64, frameHeight: 64, frames: 4, type: 'spritesheet' },
  { key: 'char_death_up', category: '캐릭터', name: '사망 (위)', path: 'assets/char/Death_Up.png', frameWidth: 64, frameHeight: 64, frames: 4, type: 'spritesheet' },

  // Monsters (24 sheets: 8 mobs x 3 anims)
  { key: 'orc_idle', category: '몬스터', name: '오크 대기', path: 'assets/mobs/Orc_Idle.png', frameWidth: 32, frameHeight: 32, frames: 4, type: 'spritesheet' },
  { key: 'orc_run', category: '몬스터', name: '오크 달리기', path: 'assets/mobs/Orc_Run.png', frameWidth: 32, frameHeight: 32, frames: 4, type: 'spritesheet' },
  { key: 'orc_death', category: '몬스터', name: '오크 사망', path: 'assets/mobs/Orc_Death.png', frameWidth: 32, frameHeight: 32, frames: 4, type: 'spritesheet' },
  { key: 'orc_warrior_idle', category: '몬스터', name: '오크 전사 대기', path: 'assets/mobs/Orc___Warrior_Idle.png', frameWidth: 32, frameHeight: 32, frames: 4, type: 'spritesheet' },
  { key: 'orc_warrior_run', category: '몬스터', name: '오크 전사 달리기', path: 'assets/mobs/Orc___Warrior_Run.png', frameWidth: 32, frameHeight: 32, frames: 4, type: 'spritesheet' },
  { key: 'orc_warrior_death', category: '몬스터', name: '오크 전사 사망', path: 'assets/mobs/Orc___Warrior_Death.png', frameWidth: 32, frameHeight: 32, frames: 4, type: 'spritesheet' },
  { key: 'orc_shaman_idle', category: '몬스터', name: '오크 주술사 대기', path: 'assets/mobs/Orc___Shaman_Idle.png', frameWidth: 32, frameHeight: 32, frames: 4, type: 'spritesheet' },
  { key: 'orc_shaman_run', category: '몬스터', name: '오크 주술사 달리기', path: 'assets/mobs/Orc___Shaman_Run.png', frameWidth: 32, frameHeight: 32, frames: 4, type: 'spritesheet' },
  { key: 'orc_shaman_death', category: '몬스터', name: '오크 주술사 사망', path: 'assets/mobs/Orc___Shaman_Death.png', frameWidth: 32, frameHeight: 32, frames: 4, type: 'spritesheet' },
  { key: 'orc_rogue_idle', category: '몬스터', name: '오크 도적 대기', path: 'assets/mobs/Orc___Rogue_Idle.png', frameWidth: 32, frameHeight: 32, frames: 4, type: 'spritesheet' },
  { key: 'orc_rogue_run', category: '몬스터', name: '오크 도적 달리기', path: 'assets/mobs/Orc___Rogue_Run.png', frameWidth: 32, frameHeight: 32, frames: 4, type: 'spritesheet' },
  { key: 'orc_rogue_death', category: '몬스터', name: '오크 도적 사망', path: 'assets/mobs/Orc___Rogue_Death.png', frameWidth: 32, frameHeight: 32, frames: 4, type: 'spritesheet' },
  { key: 'skeleton_base_idle', category: '몬스터', name: '스켈레톤 대기', path: 'assets/mobs/Skeleton___Base_Idle.png', frameWidth: 32, frameHeight: 32, frames: 4, type: 'spritesheet' },
  { key: 'skeleton_base_run', category: '몬스터', name: '스켈레톤 달리기', path: 'assets/mobs/Skeleton___Base_Run.png', frameWidth: 32, frameHeight: 32, frames: 4, type: 'spritesheet' },
  { key: 'skeleton_base_death', category: '몬스터', name: '스켈레톤 사망', path: 'assets/mobs/Skeleton___Base_Death.png', frameWidth: 32, frameHeight: 32, frames: 4, type: 'spritesheet' },
  { key: 'skeleton_warrior_idle', category: '몬스터', name: '스켈레톤 전사 대기', path: 'assets/mobs/Skeleton___Warrior_Idle.png', frameWidth: 32, frameHeight: 32, frames: 4, type: 'spritesheet' },
  { key: 'skeleton_warrior_run', category: '몬스터', name: '스켈레톤 전사 달리기', path: 'assets/mobs/Skeleton___Warrior_Run.png', frameWidth: 32, frameHeight: 32, frames: 4, type: 'spritesheet' },
  { key: 'skeleton_warrior_death', category: '몬스터', name: '스켈레톤 전사 사망', path: 'assets/mobs/Skeleton___Warrior_Death.png', frameWidth: 32, frameHeight: 32, frames: 4, type: 'spritesheet' },
  { key: 'skeleton_mage_idle', category: '몬스터', name: '스켈레톤 마법사 대기', path: 'assets/mobs/Skeleton___Mage_Idle.png', frameWidth: 32, frameHeight: 32, frames: 4, type: 'spritesheet' },
  { key: 'skeleton_mage_run', category: '몬스터', name: '스켈레톤 마법사 달리기', path: 'assets/mobs/Skeleton___Mage_Run.png', frameWidth: 32, frameHeight: 32, frames: 4, type: 'spritesheet' },
  { key: 'skeleton_mage_death', category: '몬스터', name: '스켈레톤 마법사 사망', path: 'assets/mobs/Skeleton___Mage_Death.png', frameWidth: 32, frameHeight: 32, frames: 4, type: 'spritesheet' },
  { key: 'skeleton_rogue_idle', category: '몬스터', name: '스켈레톤 도적 대기', path: 'assets/mobs/Skeleton___Rogue_Idle.png', frameWidth: 32, frameHeight: 32, frames: 4, type: 'spritesheet' },
  { key: 'skeleton_rogue_run', category: '몬스터', name: '스켈레톤 도적 달리기', path: 'assets/mobs/Skeleton___Rogue_Run.png', frameWidth: 32, frameHeight: 32, frames: 4, type: 'spritesheet' },
  { key: 'skeleton_rogue_death', category: '몬스터', name: '스켈레톤 도적 사망', path: 'assets/mobs/Skeleton___Rogue_Death.png', frameWidth: 32, frameHeight: 32, frames: 4, type: 'spritesheet' },

  // NPC (programmatic)
  { key: 'npc_elder', category: 'NPC', name: '촌장', path: null, frameWidth: 64, frameHeight: 64, frames: 1, type: 'static' },
  { key: 'npc_blacksmith', category: 'NPC', name: '대장장이', path: null, frameWidth: 64, frameHeight: 64, frames: 1, type: 'static' },
  { key: 'npc_merchant', category: 'NPC', name: '상인', path: null, frameWidth: 64, frameHeight: 64, frames: 1, type: 'static' },
  { key: 'npc_guard', category: 'NPC', name: '경비병', path: null, frameWidth: 64, frameHeight: 64, frames: 1, type: 'static' },
  { key: 'npc_herbalist', category: 'NPC', name: '약초꾼', path: null, frameWidth: 64, frameHeight: 64, frames: 1, type: 'static' },

  // Tiles
  { key: 'tile_grass', category: '타일', name: '풀', path: null, frameWidth: 32, frameHeight: 32, frames: 1, type: 'static' },
  { key: 'tile_dirt', category: '타일', name: '흙', path: null, frameWidth: 32, frameHeight: 32, frames: 1, type: 'static' },
  { key: 'tile_stone', category: '타일', name: '돌', path: null, frameWidth: 32, frameHeight: 32, frames: 1, type: 'static' },
  { key: 'tile_water', category: '타일', name: '물', path: null, frameWidth: 32, frameHeight: 32, frames: 1, type: 'static' },
  { key: 'tile_wall', category: '타일', name: '벽', path: null, frameWidth: 32, frameHeight: 32, frames: 1, type: 'static' },
  { key: 'tile_tree', category: '타일', name: '나무', path: null, frameWidth: 32, frameHeight: 32, frames: 1, type: 'static' },

  // Equipment
  { key: 'equip_weapon_sword', category: '장비', name: '검', path: null, frameWidth: 64, frameHeight: 64, frames: 1, type: 'static' },
  { key: 'equip_weapon_spear', category: '장비', name: '창', path: null, frameWidth: 64, frameHeight: 64, frames: 1, type: 'static' },
  { key: 'equip_weapon_dual', category: '장비', name: '쌍수', path: null, frameWidth: 64, frameHeight: 64, frames: 1, type: 'static' },
  { key: 'equip_weapon_staff', category: '장비', name: '지팡이', path: null, frameWidth: 64, frameHeight: 64, frames: 1, type: 'static' },
  { key: 'equip_helmet_basic', category: '장비', name: '기본 투구', path: null, frameWidth: 64, frameHeight: 64, frames: 1, type: 'static' },
  { key: 'equip_helmet_crown', category: '장비', name: '왕관', path: null, frameWidth: 64, frameHeight: 64, frames: 1, type: 'static' },
  { key: 'equip_armor_leather', category: '장비', name: '가죽 갑옷', path: null, frameWidth: 64, frameHeight: 64, frames: 1, type: 'static' },
  { key: 'equip_armor_iron', category: '장비', name: '철 갑옷', path: null, frameWidth: 64, frameHeight: 64, frames: 1, type: 'static' },
  { key: 'equip_shield', category: '장비', name: '방패', path: null, frameWidth: 64, frameHeight: 64, frames: 1, type: 'static' },
  { key: 'equip_gloves_basic', category: '장비', name: '장갑', path: null, frameWidth: 64, frameHeight: 64, frames: 1, type: 'static' },
  { key: 'equip_shoes_basic', category: '장비', name: '신발', path: null, frameWidth: 64, frameHeight: 64, frames: 1, type: 'static' },
  { key: 'equip_belt_fancy', category: '장비', name: '허리띠', path: null, frameWidth: 64, frameHeight: 64, frames: 1, type: 'static' },
  { key: 'equip_necklace', category: '장비', name: '목걸이', path: null, frameWidth: 64, frameHeight: 64, frames: 1, type: 'static' },
  { key: 'equip_talisman', category: '장비', name: '부적', path: null, frameWidth: 64, frameHeight: 64, frames: 1, type: 'static' },

  // Effects
  { key: 'fx_slash', category: '이펙트', name: '슬래시', path: null, frameWidth: 96, frameHeight: 96, frames: 1, type: 'static' },
  { key: 'fx_heavy_slash', category: '이펙트', name: '강공격', path: null, frameWidth: 96, frameHeight: 96, frames: 1, type: 'static' },
  { key: 'fx_hit_receive', category: '이펙트', name: '피격', path: null, frameWidth: 96, frameHeight: 96, frames: 4, type: 'spritesheet' },
  { key: 'fx_fist', category: '이펙트', name: '주먹', path: null, frameWidth: 96, frameHeight: 96, frames: 1, type: 'static' },
  { key: 'fx_qi_wave', category: '이펙트', name: '기파', path: null, frameWidth: 96, frameHeight: 96, frames: 1, type: 'static' },
  { key: 'fx_fire', category: '이펙트', name: '화염', path: null, frameWidth: 96, frameHeight: 96, frames: 1, type: 'static' },
  { key: 'fx_ice', category: '이펙트', name: '빙결', path: null, frameWidth: 96, frameHeight: 96, frames: 1, type: 'static' },
  { key: 'fx_lightning', category: '이펙트', name: '번개', path: null, frameWidth: 96, frameHeight: 96, frames: 1, type: 'static' },
  { key: 'fx_dark', category: '이펙트', name: '암흑', path: null, frameWidth: 96, frameHeight: 96, frames: 1, type: 'static' },
  { key: 'fx_heal', category: '이펙트', name: '회복', path: null, frameWidth: 96, frameHeight: 96, frames: 1, type: 'static' },

  // Icons
  { key: 'icon_sword', category: '아이콘', name: '검', path: null, frameWidth: 16, frameHeight: 16, frames: 1, type: 'static' },
  { key: 'icon_staff', category: '아이콘', name: '지팡이', path: null, frameWidth: 16, frameHeight: 16, frames: 1, type: 'static' },
  { key: 'icon_armor', category: '아이콘', name: '갑옷', path: null, frameWidth: 16, frameHeight: 16, frames: 1, type: 'static' },
  { key: 'icon_potion', category: '아이콘', name: '물약', path: null, frameWidth: 16, frameHeight: 16, frames: 1, type: 'static' },

  // Other
  { key: 'portal', category: '기타', name: '포탈', path: null, frameWidth: 32, frameHeight: 32, frames: 1, type: 'static' },
  { key: 'item_pickup', category: '기타', name: '아이템 드롭', path: null, frameWidth: 16, frameHeight: 16, frames: 1, type: 'static' },
];

const CATEGORIES = ['장비', '캐릭터', '몬스터', 'NPC', '타일', '이펙트', '아이콘', '기타', '커스텀'];

const EQUIP_ANIM_SETS = [
  { type: 'idle', nameKo: '대기', dirs: ['down', 'side', 'up'], frames: [4, 4, 4] },
  { type: 'walk', nameKo: '걷기', dirs: ['down', 'side', 'up'], frames: [6, 6, 6] },
  { type: 'slice', nameKo: '공격', dirs: ['down', 'side', 'up'], frames: [4, 4, 4] },
];

const DIR_NAME_KO = { down: '아래', side: '옆', up: '위' };

const BROWSER_CATEGORIES = ['메인 캐릭터', '아이템 장비', '몬스터', 'NPC', '스킬/이펙트', '소모품', '탈것/환수', '커스텀'];

const SKILL_EFFECT_SPRITE_MAP = {
  effect_slash_damage: 'fx_slash',
  effect_bolt_damage: 'fx_lightning',
  effect_recover_channel: 'fx_heal',
};

const EQUIPMENT_SLOT_LABELS = {
  WEAPON: '무기',
  SHIELD: '방패',
  HELMET: '투구',
  ARMOR: '갑옷',
  PANTS: '하의',
  SHOES: '신발',
  GLOVES: '장갑',
  BELT: '허리띠',
  RING_RIGHT: '반지',
  RING_LEFT: '반지',
  NECKLACE: '목걸이',
  TALISMAN: '부적',
  JADE_TOKEN: '옥패',
};

const WEAPON_TYPE_LABELS = {
  SWORD: '검',
  BLADE: '도',
  SPEAR: '창',
  STAFF: '봉',
  HIDDEN: '암기',
  WHIP: '편',
  FIST: '권',
  EXOTIC: '기문병기',
};

const TOOLS = [
  { id: 'pencil', label: '연필', icon: '\u270F' },
  { id: 'eraser', label: '지우개', icon: '\u2702' },
  { id: 'fill', label: '채우기', icon: '\uD83E\uDEA3' },
  { id: 'picker', label: '스포이드', icon: '\uD83D\uDC89' },
  { id: 'line', label: '선', icon: '\u2014' },
  { id: 'rect', label: '사각형', icon: '\u25FB' },
];

const DEFAULT_PALETTE = [
  '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00',
  '#ff00ff', '#00ffff', '#ff8800', '#8800ff', '#0088ff', '#ff0088',
  '#884400', '#448800', '#004488', '#880044', '#888888', '#444444',
  '#cccccc', '#663322', '#336622', '#223366', '#662233', '#cc9933',
  '#339966', '#336699', '#993366', '#66cc33', '#3366cc', '#cc3366',
  '#f0c8a0', '#d0a878', '#e8c098', '#f5d0a8',
];

const EDITOR_VIEW_MIN_WIDTH = 960;
const EDITOR_VIEW_MIN_HEIGHT = 540;
const DEFAULT_ACTOR_WIDTH = 32;
const DEFAULT_ACTOR_HEIGHT = 64;
const DEFAULT_TILE_SIZE = 32;
const SPRITE_WORKSPACE_VERSION = '960-32x64-v1';

export class SpriteEditor {
  constructor(dataManager) {
    this.dm = dataManager;
    this._resetStoredSpritesForWorkspaceUpgrade();
    this.selectedSprite = null;
    this.expandedCategories = {
      '아이템 장비': true,
      '스킬/이펙트': true,
      '스킬/이펙트>스킬 아이콘': true,
      '스킬/이펙트>스킬 이펙트': true,
      '스킬/이펙트>시전 애니메이션': true,
    };
    this.currentTool = 'pencil';
    this.currentColor = '#000000';
    this.brushSize = 1;
    this.zoom = 8;
    this.showGrid = true;
    this.showCharGuide = true;
    this.showInvGuide = false;
    this._charGuideImage = null;
    this.currentFrame = 0;
    this.isPlaying = false;
    this.animSpeed = 8;
    this.animInterval = null;
    this.recentColors = ['#000000', '#ffffff', '#ff0000', '#00ff00'];

    // Canvas state
    this.nativeCanvas = null;
    this.nativeCtx = null;
    this.displayCanvas = null;
    this.displayCtx = null;
    this.undoStack = [];
    this.redoStack = [];
    this.clipboardImageData = null;
    this.isDrawing = false;
    this.lastPixel = null;
    this.lineStart = null;
    this.rectStart = null;
    this.container = null;
    this._boundKeyHandler = null;
    this.stage = { offsetX: 0, offsetY: 0, scale: 1, frameWidth: 0, frameHeight: 0 };
  }

  _resetStoredSpritesForWorkspaceUpgrade() {
    try {
      if (typeof localStorage === 'undefined') return;
      if (localStorage.getItem(SPRITE_WORKSPACE_VERSION_KEY) === SPRITE_WORKSPACE_VERSION) return;
      localStorage.removeItem(CUSTOM_SPRITES_KEY);
      localStorage.setItem(SPRITE_WORKSPACE_VERSION_KEY, SPRITE_WORKSPACE_VERSION);
    } catch {}
  }

  // =========================================================================
  // Render
  // =========================================================================

  render(container) {
    this.container = container;
    container.innerHTML = '';

    // Build layout
    const header = document.createElement('div');
    header.className = 'section-header';
    header.innerHTML = `<h2>스프라이트 에디터 <small>Sprite Editor</small></h2>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-primary btn-small" id="sprCreateNew">+ 새 스프라이트</button>
        <button class="btn btn-secondary btn-small" id="sprExportAll">모두 내보내기</button>
        <button class="btn btn-secondary btn-small" id="sprImportAll">가져오기</button>
      </div>`;
    container.appendChild(header);

    const layout = document.createElement('div');
    layout.style.cssText = 'display:flex;gap:12px;height:calc(100vh - 140px);';
    container.appendChild(layout);

    // Left panel - browser
    const leftPanel = document.createElement('div');
    leftPanel.style.cssText = 'width:220px;flex-shrink:0;background:var(--bg-card);border:1px solid var(--border);border-radius:6px;overflow-y:auto;padding:8px;';
    leftPanel.id = 'sprBrowser';
    layout.appendChild(leftPanel);

    // Center panel - canvas
    const centerPanel = document.createElement('div');
    centerPanel.style.cssText = 'flex:1;display:flex;flex-direction:column;background:var(--bg-card);border:1px solid var(--border);border-radius:6px;overflow:hidden;min-width:0;';
    centerPanel.id = 'sprCenter';
    layout.appendChild(centerPanel);

    // Right panel - tools
    const rightPanel = document.createElement('div');
    rightPanel.style.cssText = 'width:200px;flex-shrink:0;background:var(--bg-card);border:1px solid var(--border);border-radius:6px;overflow-y:auto;padding:12px;';
    rightPanel.id = 'sprTools';
    layout.appendChild(rightPanel);

    this._renderBrowser();
    this._renderCenter();
    this._renderTools();

    // Bind header buttons
    document.getElementById('sprCreateNew').addEventListener('click', () => this._createNewSprite());
    document.getElementById('sprExportAll').addEventListener('click', () => this._exportAll());
    document.getElementById('sprImportAll').addEventListener('click', () => this._importAll());

    // Keyboard shortcuts
    if (this._boundKeyHandler) document.removeEventListener('keydown', this._boundKeyHandler);
    this._boundKeyHandler = (e) => this._handleKeyboard(e);
    document.addEventListener('keydown', this._boundKeyHandler);
  }

  // =========================================================================
  // Browser Panel
  // =========================================================================

  _escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (ch) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[ch]));
  }

  _ensureRegistryEntry(entry) {
    const sourceFrameWidth = entry.sourceFrameWidth || entry.frameWidth || DEFAULT_ACTOR_WIDTH;
    const sourceFrameHeight = entry.sourceFrameHeight || entry.frameHeight || DEFAULT_ACTOR_HEIGHT;
    const isActor = /^(char_|player_|monster_|npc_)/.test(entry.key || '')
      || ['캐릭터', '몬스터', 'NPC'].includes(entry.category);
    const frameWidth = entry.frameWidth || sourceFrameWidth;
    const frameHeight = entry.frameHeight || sourceFrameHeight;
    const normalizedFrameWidth = isActor ? DEFAULT_ACTOR_WIDTH : frameWidth;
    const normalizedFrameHeight = isActor ? DEFAULT_ACTOR_HEIGHT : frameHeight;
    const logicalFrameWidth = entry.logicalFrameWidth || normalizedFrameWidth;
    const logicalFrameHeight = entry.logicalFrameHeight || normalizedFrameHeight;
    const normalized = {
      ...entry,
      logicalFrameWidth,
      logicalFrameHeight,
      sourceFrameWidth,
      sourceFrameHeight,
      workspaceMode: 'infinite-centered',
      frameWidth: normalizedFrameWidth,
      frameHeight: normalizedFrameHeight,
    };
    const existing = SPRITE_REGISTRY.find(s => s.key === entry.key);
    if (existing) {
      Object.assign(existing, normalized);
      return existing;
    }
    SPRITE_REGISTRY.push(normalized);
    return normalized;
  }

  _getGeneratedEquipmentKey(item) {
    const rawId = item?.id || 'unknown_item';
    return `equip_${rawId.replace(/[^a-zA-Z0-9_]/g, '_')}`;
  }

  _getEquipmentBaseKey(item) {
    if (!item) return null;
    if (item.spriteKey) return item.spriteKey;
    return this._getGeneratedEquipmentKey(item);
  }

  _getGeneratedSkillIconKey(skill) {
    const rawId = skill?.id || 'unknown_skill';
    return `skill_icon_${rawId.replace(/[^a-zA-Z0-9_]/g, '_')}`;
  }

  _getGeneratedSkillEffectKey(skill) {
    const rawId = skill?.id || 'unknown_skill';
    return `skill_fx_${rawId.replace(/[^a-zA-Z0-9_]/g, '_')}`;
  }

  _getSkillEffectSpriteKey(skill) {
    if (skill?.effectKey) return skill.effectKey;
    if (skill?.effectSpriteKey) return skill.effectSpriteKey;
    if (skill?.base_effect_id && SKILL_EFFECT_SPRITE_MAP[skill.base_effect_id]) {
      return SKILL_EFFECT_SPRITE_MAP[skill.base_effect_id];
    }
    return this._getGeneratedSkillEffectKey(skill);
  }

  _getEquipmentGroupLabel(item) {
    if (item?.slot === 'WEAPON') {
      const weaponType = WEAPON_TYPE_LABELS[item.weaponType] || '무기';
      return `무기 / ${weaponType}`;
    }
    return EQUIPMENT_SLOT_LABELS[item?.slot] || item?.slot || '기타 장비';
  }

  _getSpriteInfo(key, fallback = {}) {
    const base = SPRITE_REGISTRY.find(s => s.key === key);
    return this._ensureRegistryEntry({
      key,
      category: fallback.category || base?.category || '기타',
      name: fallback.name || base?.name || key,
      path: fallback.path ?? base?.path ?? null,
      frameWidth: fallback.frameWidth || base?.frameWidth || 64,
      frameHeight: fallback.frameHeight || base?.frameHeight || 64,
      frames: fallback.frames || base?.frames || 1,
      type: fallback.type || base?.type || 'static',
      ...fallback,
    });
  }

  _getEquipmentSpriteEntries(item) {
    const baseKey = this._getEquipmentBaseKey(item);
    if (!baseKey) return [];

    const itemName = item.name || item.nameKo || item.id;
    const browserItem = item.slot === 'WEAPON'
      ? `${itemName} (${WEAPON_TYPE_LABELS[item.weaponType] || item.weaponType || '무기'})`
      : itemName;
    const entries = [this._getSpriteInfo(baseKey, {
      category: '장비',
      browserCategory: '아이템 장비',
      browserGroup: this._getEquipmentGroupLabel(item),
      browserItem,
      name: `${itemName} / 기본`,
      itemId: item.id,
      dataId: item.id,
      baseSpriteKey: baseKey,
      frameWidth: 64,
      frameHeight: 64,
      frames: 1,
      type: 'static',
    })];

    for (const set of EQUIP_ANIM_SETS) {
      set.dirs.forEach((dir, index) => {
        const key = `${baseKey}_${set.type}_${dir}`;
        entries.push(this._getSpriteInfo(key, {
          category: '장비',
          browserCategory: '아이템 장비',
          browserGroup: this._getEquipmentGroupLabel(item),
          browserItem,
          name: `${set.nameKo} (${DIR_NAME_KO[dir]})`,
          itemId: item.id,
          dataId: item.id,
          baseSpriteKey: baseKey,
          frameWidth: 64,
          frameHeight: 64,
          frames: set.frames[index],
          type: 'spritesheet',
        }));
      });
    }

    return entries;
  }

  _getDataSpriteEntries(customSprites) {
    const data = this.dm?.data || {};
    const entries = [];

    // --- Main Character ---
    const mainCharacter = data.mainCharacter || {};
    const characterName = mainCharacter.nameKo || mainCharacter.name || 'Main Character';
    const playerBaseKey = mainCharacter.spriteKey || 'player_base';
    entries.push(this._getSpriteInfo(playerBaseKey, {
      category: '캐릭터',
      browserCategory: '메인 캐릭터',
      browserGroup: '기본',
      browserItem: characterName,
      name: `${characterName} / 기본 박스`,
      dataId: 'mainCharacter',
      characterSpriteRole: 'base',
      frameWidth: 64,
      frameHeight: 64,
      frames: 1,
      type: 'static',
    }));

    for (const action of ['idle', 'walk', 'run', 'attack', 'hit', 'death']) {
      for (const dir of ['down', 'side', 'up']) {
        const key = `player_${action}_${dir}`;
        entries.push(this._getSpriteInfo(key, {
          category: '캐릭터',
          browserCategory: '메인 캐릭터',
          browserGroup: action,
          browserItem: characterName,
          name: `${characterName} / ${action} ${dir}`,
          dataId: 'mainCharacter',
          characterSpriteRole: 'animation',
          baseSpriteKey: playerBaseKey,
          frameWidth: 64,
          frameHeight: 64,
          frames: action === 'idle' || action === 'attack' || action === 'death' ? 4 : action === 'hit' ? 2 : 6,
          type: 'spritesheet',
        }));
      }
    }

    // --- Equipment Items ---
    const items = Object.values(data.items || {});
    const equipmentItems = items.filter(item => item?.slot);
    for (const item of equipmentItems) {
      entries.push(...this._getEquipmentSpriteEntries(item));
    }

    // --- Consumable / Non-equipment Items ---
    const nonEquipItems = items.filter(item => item && !item.slot);
    for (const item of nonEquipItems) {
      const sprKey = getItemIconKey(item);
      entries.push(this._getSpriteInfo(sprKey, {
        category: '아이콘',
        browserCategory: '소모품',
        browserGroup: item.type || '기타',
        browserItem: item.nameKo || item.name || item.id,
        name: item.nameKo || item.name || item.id,
        dataId: item.id,
        itemId: item.id,
        spriteRole: 'itemIcon',
        frameWidth: 32,
        frameHeight: 32,
        frames: 1,
        type: 'static',
      }));
      entries.push(this._getSpriteInfo(sprKey, {
        category: '아이콘',
        browserCategory: '소모품',
        browserGroup: item.type || '기타',
        browserItem: item.nameKo || item.name || item.id,
        name: item.nameKo || item.name || item.id,
        dataId: item.id,
        itemId: item.id,
        spriteRole: 'itemIcon',
        frameWidth: 32, frameHeight: 32, frames: 1, type: 'static',
      }));
    }

    // --- Monsters ---
    const monsters = Object.values(data.monsters || {});
    for (const mon of monsters) {
      const monName = mon.nameKo || mon.name || mon.id;
      const sprKey = mon.spriteKey || `mon_${mon.id}`;
      // Base idle sprite
      entries.push(this._getSpriteInfo(sprKey, {
        category: '몬스터',
        browserCategory: '몬스터',
        browserGroup: `Lv.${mon.level || '?'}`,
        browserItem: monName,
        name: `${monName} (기본)`,
        dataId: mon.id,
        frameWidth: 32, frameHeight: 32, frames: 4, type: 'spritesheet',
      }));
      // Animation variants (idle/run/death)
      for (const anim of ['idle', 'run', 'death']) {
        const animKey = `${sprKey}_${anim}`;
        entries.push(this._getSpriteInfo(animKey, {
          category: '몬스터',
          browserCategory: '몬스터',
          browserGroup: `Lv.${mon.level || '?'}`,
          browserItem: monName,
          name: `${monName} / ${anim}`,
          dataId: mon.id,
          baseSpriteKey: sprKey,
          frameWidth: 32, frameHeight: 32, frames: 4, type: 'spritesheet',
        }));
      }
    }

    // --- Skills ---
    const skills = Object.values(data.skills || {});
    for (const skill of skills) {
      const skillName = skill.nameKo || skill.name || skill.id;
      const isBasicAttack = skill.isBasicAttack || skill.inputBinding === 'SPACE' || skill.id === 'skill_basic_attack';
      const skillBrowserItem = isBasicAttack ? `${skillName} (Space)` : skillName;
      const effectBrowserGroup = isBasicAttack ? '기본공격 이펙트' : '스킬 이펙트';
      const generatedIconKey = this._getGeneratedSkillIconKey(skill);
      const generatedEffectKey = this._getGeneratedSkillEffectKey(skill);
      const resolvedIconKey = skill.iconKey || generatedIconKey;
      const resolvedEffectKey = this._getSkillEffectSpriteKey(skill);
      const targetHitEffectKey = skill.impactConfig?.targetHitEffect?.effectKey || 'fx_hit_receive';
      const receiveHitEffectKey = skill.impactConfig?.receiveHitEffect?.effectKey || 'fx_hit_receive';

      entries.push(this._getSpriteInfo(resolvedIconKey, {
        category: '아이콘',
        browserCategory: '스킬/이펙트',
        browserGroup: '스킬 아이콘',
        browserItem: skillBrowserItem,
        name: `${skillName} (아이콘)`,
        dataId: skill.id,
        skillId: skill.id,
        spriteRole: 'skillIcon',
        frameWidth: 32,
        frameHeight: 32,
        frames: 1,
        type: 'static',
      }));

      entries.push(this._getSpriteInfo(resolvedEffectKey, {
        category: '이펙트',
        browserCategory: '스킬/이펙트',
        browserGroup: effectBrowserGroup,
        browserItem: skillBrowserItem,
        name: isBasicAttack ? `${skillName} (스페이스바 이펙트)` : `${skillName} (이펙트)`,
        dataId: skill.id,
        skillId: skill.id,
        spriteRole: 'skillEffect',
        frameWidth: 96,
        frameHeight: 96,
        frames: 4,
        type: 'spritesheet',
      }));

      if (isBasicAttack) {
        entries.push(this._getSpriteInfo(targetHitEffectKey, {
          category: '이펙트',
          browserCategory: '스킬/이펙트',
          browserGroup: '기본공격 피격 이펙트',
          browserItem: skillBrowserItem,
          name: `${skillName} (대상 피격)`,
          dataId: skill.id,
          skillId: skill.id,
          spriteRole: 'skillTargetHitEffect',
          frameWidth: 96,
          frameHeight: 96,
          frames: 4,
          type: 'spritesheet',
        }));
        entries.push(this._getSpriteInfo(receiveHitEffectKey, {
          category: '이펙트',
          browserCategory: '스킬/이펙트',
          browserGroup: '맞을 때 이펙트',
          browserItem: skillBrowserItem,
          name: `${skillName} (받는 피격)`,
          dataId: skill.id,
          skillId: skill.id,
          spriteRole: 'skillReceiveHitEffect',
          frameWidth: 96,
          frameHeight: 96,
          frames: 4,
          type: 'spritesheet',
        }));
      }

      if (!skill.iconKey) {
        entries.push(this._getSpriteInfo(generatedIconKey, {
          category: 'Icon',
          browserCategory: 'Skill / Effect',
          browserGroup: 'Skill Icon',
          browserItem: skillBrowserItem,
          name: `${skillName} (Icon)`,
          dataId: skill.id,
          skillId: skill.id,
          spriteRole: 'skillIcon',
          frameWidth: 32,
          frameHeight: 32,
          frames: 1,
          type: 'static',
        }));
      }

      if (!skill.effectKey && !skill.effectSpriteKey && resolvedEffectKey === generatedEffectKey) {
        entries.push(this._getSpriteInfo(generatedEffectKey, {
          category: 'Effect',
          browserCategory: 'Skill / Effect',
          browserGroup: effectBrowserGroup,
          browserItem: skillBrowserItem,
          name: `${skillName} (Effect)`,
          dataId: skill.id,
          skillId: skill.id,
          spriteRole: 'skillEffect',
          frameWidth: 96,
          frameHeight: 96,
          frames: 4,
          type: 'spritesheet',
        }));
      }

      entries.push(this._getSpriteInfo(skill.castSpriteKey || `${resolvedEffectKey}_cast`, {
        category: '이펙트',
        browserCategory: '스킬/이펙트',
        browserGroup: '시전 애니메이션',
        browserItem: skillBrowserItem,
        name: `${skillName} (시전)`,
        dataId: skill.id,
        skillId: skill.id,
        spriteRole: 'skillCast',
        frameWidth: 96,
        frameHeight: 96,
        frames: 4,
        type: 'spritesheet',
      }));
      if (skill.iconKey) {
        entries.push(this._getSpriteInfo(skill.iconKey, {
          category: '아이콘',
          browserCategory: '스킬/이펙트',
          browserGroup: '스킬 아이콘',
          browserItem: skillBrowserItem,
          name: `${skillName} (아이콘)`,
          dataId: skill.id,
          skillId: skill.id,
          spriteRole: 'skillIcon',
          frameWidth: 32, frameHeight: 32, frames: 1, type: 'static',
        }));
      }
      if (skill.effectKey) {
        entries.push(this._getSpriteInfo(skill.effectKey, {
          category: '이펙트',
          browserCategory: '스킬/이펙트',
          browserGroup: effectBrowserGroup,
          browserItem: skillBrowserItem,
          name: isBasicAttack ? `${skillName} (스페이스바 이펙트)` : `${skillName} (이펙트)`,
          dataId: skill.id,
          skillId: skill.id,
          spriteRole: 'skillEffect',
          frameWidth: 96, frameHeight: 96, frames: 4, type: 'spritesheet',
        }));
      }
    }

    // --- Mounts ---
    const mounts = data.mounts || [];
    for (const mount of mounts) {
      const mountName = mount.nameKo || mount.name || mount.id;
      const sprKey = mount.spriteKey || `mount_${mount.id}`;
      entries.push(this._getSpriteInfo(sprKey, {
        category: '기타',
        browserCategory: '탈것/환수',
        browserGroup: '탈것',
        browserItem: mountName,
        name: mountName,
        dataId: mount.id,
        frameWidth: 64, frameHeight: 64, frames: 1, type: 'static',
      }));
    }

    // --- Pets ---
    const pets = data.pets || [];
    for (const pet of pets) {
      const petName = pet.nameKo || pet.name || pet.id;
      const sprKey = pet.spriteKey || `pet_${pet.id}`;
      entries.push(this._getSpriteInfo(sprKey, {
        category: '기타',
        browserCategory: '탈것/환수',
        browserGroup: '환수',
        browserItem: petName,
        name: petName,
        dataId: pet.id,
        frameWidth: 32, frameHeight: 32, frames: 4, type: 'spritesheet',
      }));
    }

    // --- Custom Sprites (not already listed above) ---
    const knownKeys = new Set(entries.map(e => e.key));
    for (const key of Object.keys(customSprites)) {
      if (knownKeys.has(key)) continue;

      const cData = customSprites[key];
      const cat = cData.category || '커스텀';
      entries.push(this._getSpriteInfo(key, {
        category: cat,
        browserCategory: '커스텀',
        browserGroup: cat,
        browserItem: key,
        name: key,
        path: null,
        frameWidth: cData.frameWidth || cData.width || 64,
        frameHeight: cData.frameHeight || cData.height || 64,
        logicalFrameWidth: cData.logicalFrameWidth || cData.sourceFrameWidth || cData.frameWidth || cData.width || 64,
        logicalFrameHeight: cData.logicalFrameHeight || cData.sourceFrameHeight || cData.frameHeight || cData.height || 64,
        workspaceMode: cData.workspaceMode || 'infinite-centered',
        frames: cData.frameWidth ? Math.max(1, Math.floor(cData.width / cData.frameWidth)) : 1,
        type: (cData.frameWidth && cData.width > cData.frameWidth) ? 'spritesheet' : 'static',
        isCustom: true,
      }));
    }

    return entries;
  }

  _dedupeSprites(entries) {
    const seen = new Set();
    return entries.filter(entry => {
      const scope = `${entry.browserCategory}|${entry.browserGroup}|${entry.browserItem}|${entry.key}`;
      if (seen.has(scope)) return false;
      seen.add(scope);
      return true;
    });
  }

  _renderGroupHeader(id, label, count, depth) {
    const expanded = this.expandedCategories[id];
    const safeId = this._escapeHtml(id);
    return `<div class="spr-cat" data-cat="${safeId}" style="cursor:pointer;margin-left:${depth * 10}px;padding:5px 7px;font-size:${depth ? 12 : 13}px;color:var(--text);display:flex;align-items:center;gap:6px;border-radius:4px;${expanded ? 'background:var(--bg-hover);' : ''}">
      <span style="font-size:10px;transition:transform 0.2s;display:inline-block;${expanded ? 'transform:rotate(90deg);' : ''}">\u25B6</span>
      <span title="${safeId}">${this._escapeHtml(label)}</span>
      <span style="font-size:11px;color:var(--text-dim);margin-left:auto;">${count}</span>
    </div>`;
  }

  _renderSpriteRow(spr, customSprites, depth) {
    const isSelected = this.selectedSprite && this.selectedSprite.key === spr.key;
    const hasCustom = !!customSprites[spr.key];
    const key = this._escapeHtml(spr.key);
    const path = spr.path ? `<div style="font-size:10px;color:var(--text-dim);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${this._escapeHtml(spr.path)}</div>` : '';
    const dataId = spr.dataId ? `<span style="font-size:10px;color:var(--text-dim);">data: ${this._escapeHtml(spr.dataId)}</span>` : '';
    return `<div class="spr-item" data-key="${key}" style="cursor:pointer;margin-left:${depth * 10}px;padding:5px 8px;font-size:12px;border-radius:3px;border-left:2px solid ${isSelected ? 'var(--gold)' : 'transparent'};${isSelected ? 'background:var(--bg-panel);color:var(--gold);' : 'color:var(--text-dim);'}">
      <div style="display:flex;align-items:center;gap:4px;min-width:0;">
        ${hasCustom ? '<span style="color:var(--accent-green);font-size:8px;">\u25CF</span>' : ''}
        <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${key}">${this._escapeHtml(spr.name || spr.key)}</span>
      </div>
      <div style="font-size:10px;color:var(--text-dim);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${key} ${dataId}</div>
      ${path}
    </div>`;
  }

  _renderBrowser() {
    const browser = document.getElementById('sprBrowser');
    if (!browser) return;
    const customSprites = this._getCustomSprites();

    const entries = this._dedupeSprites(this._getDataSpriteEntries(customSprites));
    let html = '<div style="font-size:12px;color:var(--gold);font-weight:700;margin-bottom:8px;padding:4px;">스프라이트 카테고리</div>';

    for (const cat of BROWSER_CATEGORIES) {
      const catEntries = entries.filter(entry => entry.browserCategory === cat);
      if (!catEntries.length) continue;

      html += this._renderGroupHeader(cat, cat, catEntries.length, 0);
      if (this.expandedCategories[cat]) {
        const groups = [...new Set(catEntries.map(entry => entry.browserGroup || cat))];
        for (const group of groups) {
          const groupId = `${cat}>${group}`;
          const groupEntries = catEntries.filter(entry => (entry.browserGroup || cat) === group);
          html += this._renderGroupHeader(groupId, group, groupEntries.length, 1);
          if (this.expandedCategories[groupId]) {
            const items = [...new Set(groupEntries.map(entry => entry.browserItem || entry.name || entry.key))];
            for (const item of items) {
              const itemId = `${groupId}>${item}`;
              const itemEntries = groupEntries.filter(entry => (entry.browserItem || entry.name || entry.key) === item);
              html += this._renderGroupHeader(itemId, item, itemEntries.length, 2);
              if (this.expandedCategories[itemId] || cat === '스킬/이펙트') {
                for (const spr of itemEntries) {
                  html += this._renderSpriteRow(spr, customSprites, 3);
                }
              }
            }
          }
        }
      }
    }
    browser.innerHTML = html;

    // Bind events
    browser.querySelectorAll('.spr-cat').forEach(el => {
      el.addEventListener('click', () => {
        const cat = el.dataset.cat;
        this.expandedCategories[cat] = !this.expandedCategories[cat];
        this._renderBrowser();
      });
    });
    browser.querySelectorAll('.spr-item').forEach(el => {
      el.addEventListener('click', () => {
        const key = el.dataset.key;
        this.selectedSprite = SPRITE_REGISTRY.find(s => s.key === key);
        this.currentFrame = 0;
        this._stopAnimation();
        this._renderCenter();   // Rebuild canvas DOM first
        this._renderBrowser();  // Update selection highlight
        this._renderTools();    // Update tool panel
      });
    });
  }

  // =========================================================================
  // Center Panel
  // =========================================================================

  _renderCenter() {
    const center = document.getElementById('sprCenter');
    if (!center) return;

    if (!this.selectedSprite) {
      center.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-dim);font-size:14px;">
        좌측에서 스프라이트를 선택하세요</div>`;
      return;
    }

    const spr = this.selectedSprite;
    center.innerHTML = '';

    // Info bar
    const infoBar = document.createElement('div');
    infoBar.style.cssText = 'padding:8px 12px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:12px;flex-wrap:wrap;font-size:12px;';
    infoBar.innerHTML = `
      <span style="color:var(--gold);font-weight:700;">${spr.name}</span>
      <span style="color:var(--text-dim);">${spr.key}</span>
      <span style="color:var(--text-dim);">작업판 무한 확장형</span>
      <span style="color:var(--text-dim);">1칸 = 스프라이트 1px</span>
      <span style="color:var(--text-dim);">프레임 ${spr.frameWidth}x${spr.frameHeight}</span>
      ${spr.type === 'spritesheet' ? `<span style="color:var(--text-dim);">${spr.frames} 프레임</span>` : ''}
      ${!spr.path ? '<span style="color:var(--accent-orange);font-size:11px;">프로그래밍 생성 텍스처</span>' : ''}
    `;
    center.appendChild(infoBar);

    // Canvas area
    const canvasWrap = document.createElement('div');
    canvasWrap.style.cssText = 'flex:1;overflow:auto;background:var(--bg-darkest);position:relative;';
    canvasWrap.id = 'sprCanvasWrap';

    // Checkerboard background container
    const canvasContainer = document.createElement('div');
    canvasContainer.style.cssText = 'position:relative;min-width:100%;min-height:100%;';
    canvasContainer.id = 'sprCanvasContainer';

    this.displayCanvas = document.createElement('canvas');
    this.displayCanvas.style.cssText = 'image-rendering:pixelated;cursor:crosshair;display:block;';
    this.displayCanvas.id = 'sprDisplayCanvas';
    canvasContainer.appendChild(this.displayCanvas);
    canvasWrap.appendChild(canvasContainer);
    center.appendChild(canvasWrap);

    // Frame controls (for spritesheets)
    if (spr.type === 'spritesheet' && spr.frames > 1) {
      const frameBar = document.createElement('div');
      frameBar.style.cssText = 'padding:8px 12px;border-top:1px solid var(--border);display:flex;align-items:center;gap:10px;font-size:12px;';
      frameBar.innerHTML = `
        <button type="button" class="btn btn-secondary btn-small" id="sprPrevFrame">\u25C0</button>
        <span id="sprFrameInfo" style="min-width:60px;text-align:center;">프레임 ${this.currentFrame + 1}/${spr.frames}</span>
        <button type="button" class="btn btn-secondary btn-small" id="sprNextFrame">\u25B6</button>
        <button type="button" class="btn btn-secondary btn-small" id="sprCopyPrevFrame" title="이전 프레임을 현재 프레임으로 복사" ${this.currentFrame <= 0 ? 'disabled' : ''}>이전 프레임 복사</button>
        <span style="color:var(--border);margin:0 4px;">|</span>
        <button type="button" class="btn btn-secondary btn-small" id="sprPlayBtn">\u25B6 재생</button>
        <button type="button" class="btn btn-secondary btn-small" id="sprStopBtn">\u23F8 정지</button>
        <label style="display:flex;align-items:center;gap:4px;color:var(--text-dim);">속도:
          <input type="range" min="1" max="24" value="${this.animSpeed}" id="sprAnimSpeed" style="width:80px;">
          <span id="sprAnimSpeedVal">${this.animSpeed}fps</span>
        </label>
      `;
      center.appendChild(frameBar);

      // Bind frame events
      requestAnimationFrame(() => {
        frameBar.querySelector('#sprPrevFrame')?.addEventListener('click', () => {
          this.currentFrame = (this.currentFrame - 1 + spr.frames) % spr.frames;
          this._updateFrameDisplay();
        });
        frameBar.querySelector('#sprNextFrame')?.addEventListener('click', () => {
          this.currentFrame = (this.currentFrame + 1) % spr.frames;
          this._updateFrameDisplay();
        });
        frameBar.querySelector('#sprCopyPrevFrame')?.addEventListener('click', () => this._copyPreviousFrameIntoCurrent());
        frameBar.querySelector('#sprPlayBtn')?.addEventListener('click', () => this._startAnimation());
        frameBar.querySelector('#sprStopBtn')?.addEventListener('click', () => this._stopAnimation());
        frameBar.querySelector('#sprAnimSpeed')?.addEventListener('input', (e) => {
          this.animSpeed = parseInt(e.target.value);
          frameBar.querySelector('#sprAnimSpeedVal').textContent = this.animSpeed + 'fps';
          if (this.isPlaying) { this._stopAnimation(); this._startAnimation(); }
        });
        this._syncFrameControls();
      });
    }

    // Action bar
    const actionBar = document.createElement('div');
    actionBar.style.cssText = 'padding:8px 12px;border-top:1px solid var(--border);display:flex;align-items:center;gap:8px;flex-wrap:wrap;';
    actionBar.innerHTML = `
      <button class="btn btn-primary btn-small" id="sprUpload">PNG 업로드</button>
      <button class="btn btn-secondary btn-small" id="sprDownload">PNG 다운로드</button>
      <button class="btn btn-success btn-small" id="sprSave">저장</button>
      <button class="btn btn-danger btn-small" id="sprReset">초기화</button>
      <button class="btn btn-secondary btn-small" id="sprMirrorH">좌우 반전</button>
      <button class="btn btn-secondary btn-small" id="sprMirrorV">상하 반전</button>
    `;
    center.appendChild(actionBar);

    // Equipment animation set panel (only for equipment base sprites)
    if (this._isEquipmentBaseSprite()) {
      const equipAnimPanel = document.createElement('div');
      equipAnimPanel.id = 'equipAnimSetPanel';
      equipAnimPanel.style.cssText = 'padding:12px;border-top:1px solid var(--border);max-height:220px;overflow-y:auto;';
      equipAnimPanel.innerHTML = `
        <h4 style="color:var(--gold);font-size:13px;margin-bottom:8px;">장비 애니메이션 세트</h4>
        <p style="font-size:11px;color:var(--text-dim);margin-bottom:8px;">
          캐릭터 애니메이션에 맞는 장비 스프라이트시트를 생성합니다.
          각 스프라이트시트의 프레임 수는 캐릭터 애니메이션과 동일해야 합니다.
        </p>
        <div id="equipAnimList"></div>
      `;
      center.appendChild(equipAnimPanel);
      setTimeout(() => this._renderEquipAnimList(), 0);
    }

    // Bind actions after DOM
    setTimeout(() => this._bindCenterActions(), 0);

    // Load sprite
    this._loadSprite();
  }

  _bindCenterActions() {
    document.getElementById('sprUpload')?.addEventListener('click', () => this._uploadPNG());
    document.getElementById('sprDownload')?.addEventListener('click', () => this._downloadPNG());
    document.getElementById('sprSave')?.addEventListener('click', () => this._saveSprite());
    document.getElementById('sprReset')?.addEventListener('click', () => this._resetSprite());
    document.getElementById('sprMirrorH')?.addEventListener('click', () => this._mirror('h'));
    document.getElementById('sprMirrorV')?.addEventListener('click', () => this._mirror('v'));

    // Canvas mouse events
    if (this.displayCanvas) {
      this.displayCanvas.addEventListener('mousedown', (e) => this._onCanvasMouseDown(e));
      this.displayCanvas.addEventListener('mousemove', (e) => this._onCanvasMouseMove(e));
      this.displayCanvas.addEventListener('mouseup', () => this._onCanvasMouseUp());
      this.displayCanvas.addEventListener('mouseleave', () => this._onCanvasMouseUp());
      this.displayCanvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }
  }

  // =========================================================================
  // Tools Panel
  // =========================================================================

  _renderTools() {
    const tools = document.getElementById('sprTools');
    if (!tools) return;

    let html = '';

    // Tools
    html += '<div style="font-size:11px;color:var(--gold);font-weight:700;margin-bottom:8px;">도구</div>';
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:16px;">';
    for (const t of TOOLS) {
      const active = this.currentTool === t.id;
      html += `<button class="spr-tool-btn btn btn-small ${active ? 'btn-primary' : 'btn-secondary'}" data-tool="${t.id}" style="font-size:12px;">${t.icon} ${t.label}</button>`;
    }
    html += '</div>';

    // Color
    html += '<div style="font-size:11px;color:var(--gold);font-weight:700;margin-bottom:8px;">색상</div>';
    html += `<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
      <input type="color" value="${this.currentColor}" id="sprColorPicker" style="width:36px;height:36px;border:1px solid var(--border);background:none;cursor:pointer;padding:0;">
      <div style="font-size:11px;color:var(--text-dim);" id="sprColorHex">${this.currentColor}</div>
    </div>`;

    // Recent colors
    html += '<div style="font-size:10px;color:var(--text-dim);margin-bottom:4px;">최근 사용</div>';
    html += '<div style="display:flex;gap:3px;flex-wrap:wrap;margin-bottom:8px;">';
    for (const c of this.recentColors) {
      html += `<div class="spr-recent-color" data-color="${c}" style="width:18px;height:18px;background:${c};border:1px solid var(--border);border-radius:2px;cursor:pointer;" title="${c}"></div>`;
    }
    html += '</div>';

    // Palette
    html += '<div style="font-size:10px;color:var(--text-dim);margin-bottom:4px;">팔레트</div>';
    html += '<div style="display:flex;gap:2px;flex-wrap:wrap;margin-bottom:16px;">';
    for (const c of DEFAULT_PALETTE) {
      html += `<div class="spr-palette-color" data-color="${c}" style="width:14px;height:14px;background:${c};border:1px solid var(--border);border-radius:1px;cursor:pointer;" title="${c}"></div>`;
    }
    html += '</div>';

    // Brush size
    html += '<div style="font-size:11px;color:var(--gold);font-weight:700;margin-bottom:8px;">브러시 크기</div>';
    html += '<div style="display:flex;gap:4px;margin-bottom:16px;">';
    for (const sz of [1, 2, 3]) {
      const active = this.brushSize === sz;
      html += `<button class="spr-brush-btn btn btn-small ${active ? 'btn-primary' : 'btn-secondary'}" data-size="${sz}">${sz}px</button>`;
    }
    html += '</div>';

    // Unified stage info
    html += '<div style="font-size:11px;color:var(--gold);font-weight:700;margin-bottom:8px;">작업창</div>';
    const stageCell = this.stage?.scale || '-';
    html += `<div style="font-size:11px;color:var(--text-dim);line-height:1.5;margin-bottom:12px;">
      무한 작업판 중앙 배치<br>
      1칸 = 현재 프레임 1px<br>
      현재 1칸 화면 크기: ${stageCell}px
    </div>`;

    // Grid toggle
    html += `<div style="margin-bottom:8px;">
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:12px;color:var(--text-dim);">
        <input type="checkbox" id="sprGridToggle" ${this.showGrid ? 'checked' : ''}>
        그리드 표시
      </label>
    </div>`;

    // Inventory box guide toggle
    html += `<div style="margin-bottom:8px;">
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:12px;color:#ffaa44;">
        <input type="checkbox" id="sprInvGuide" ${this.showInvGuide ? 'checked' : ''}>
        인벤토리 박스 가이드
      </label>
      <small style="color:var(--text-dim);font-size:10px;margin-left:26px;">42×42 셀 내 표시 영역 (36×36)</small>
    </div>`;

    // Character guide toggle (only for equipment sprites)
    if (this.selectedSprite) {
      html += `<div style="margin-bottom:8px;">
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:12px;color:#66ccff;">
          <input type="checkbox" id="sprCharGuide" ${this.showCharGuide ? 'checked' : ''}>
          캐릭터 가이드 표시
        </label>
      </div>`;
      html += `<div style="font-size:10px;color:#888;margin-bottom:16px;line-height:1.4;">
        <span style="color:#66ccff;">투구</span>: 상단 10~30%<br>
        <span style="color:#66ccff;">갑옷</span>: 30~60%<br>
        <span style="color:#66ccff;">허리</span>: 60~75%<br>
        <span style="color:#66ccff;">신발</span>: 75% 이하<br>
        <span style="color:#aaa;">캐릭터 위에 겹쳐 그리세요</span>
      </div>`;
    }

    // Undo/Redo
    html += '<div style="font-size:11px;color:var(--gold);font-weight:700;margin-bottom:8px;">편집</div>';
    html += `<div style="display:flex;gap:4px;margin-bottom:16px;">
      <button class="btn btn-secondary btn-small" id="sprUndo" title="Ctrl+Z">실행취소 (${this.undoStack.length})</button>
      <button class="btn btn-secondary btn-small" id="sprRedo" title="Ctrl+Y">다시실행 (${this.redoStack.length})</button>
    </div>`;

    html += '<div style="font-size:11px;color:var(--gold);font-weight:700;margin-bottom:8px;">복사 / 이동</div>';
    html += `<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:8px;">
      <button class="btn btn-secondary btn-small" id="sprCopyFrame" title="Ctrl+C">복사</button>
      <button class="btn btn-secondary btn-small" id="sprPasteFrame" title="Ctrl+V" ${this.clipboardImageData ? '' : 'disabled'}>붙여넣기</button>
    </div>`;
    html += `<div style="display:grid;grid-template-columns:32px 32px 32px;gap:4px;justify-content:center;margin-bottom:16px;">
      <span></span><button class="btn btn-secondary btn-small spr-shift-btn" data-dx="0" data-dy="-1" title="위로 1칸">↑</button><span></span>
      <button class="btn btn-secondary btn-small spr-shift-btn" data-dx="-1" data-dy="0" title="왼쪽 1칸">←</button>
      <button class="btn btn-secondary btn-small spr-shift-btn" data-dx="0" data-dy="1" title="아래로 1칸">↓</button>
      <button class="btn btn-secondary btn-small spr-shift-btn" data-dx="1" data-dy="0" title="오른쪽 1칸">→</button>
    </div>`;

    // Custom sprite count
    const customs = this._getCustomSprites();
    const customCount = Object.keys(customs).length;
    html += `<div style="margin-top:auto;padding-top:12px;border-top:1px solid var(--border);font-size:11px;color:var(--text-dim);">
      커스텀 스프라이트: ${customCount}개
    </div>`;

    tools.innerHTML = html;

    // Bind tool events
    tools.querySelectorAll('.spr-tool-btn').forEach(el => {
      el.addEventListener('click', () => {
        this.currentTool = el.dataset.tool;
        this._renderTools();
      });
    });
    tools.querySelectorAll('.spr-palette-color, .spr-recent-color').forEach(el => {
      el.addEventListener('click', () => {
        this.currentColor = el.dataset.color;
        this._addRecentColor(el.dataset.color);
        this._renderTools();
      });
    });
    tools.querySelectorAll('.spr-brush-btn').forEach(el => {
      el.addEventListener('click', () => {
        this.brushSize = parseInt(el.dataset.size);
        this._renderTools();
      });
    });
    document.getElementById('sprColorPicker')?.addEventListener('input', (e) => {
      this.currentColor = e.target.value;
      this._addRecentColor(e.target.value);
      const hex = document.getElementById('sprColorHex');
      if (hex) hex.textContent = e.target.value;
    });
    document.getElementById('sprGridToggle')?.addEventListener('change', (e) => {
      this.showGrid = e.target.checked;
      this._redrawDisplay();
    });
    document.getElementById('sprInvGuide')?.addEventListener('change', (e) => {
      this.showInvGuide = e.target.checked;
      this._redrawDisplay();
    });
    document.getElementById('sprCharGuide')?.addEventListener('change', (e) => {
      this.showCharGuide = e.target.checked;
      this._redrawDisplay();
    });
    document.getElementById('sprUndo')?.addEventListener('click', () => this._undo());
    document.getElementById('sprRedo')?.addEventListener('click', () => this._redo());
    document.getElementById('sprCopyFrame')?.addEventListener('click', () => this._copyFrame());
    document.getElementById('sprPasteFrame')?.addEventListener('click', () => this._pasteFrame());
    tools.querySelectorAll('.spr-shift-btn').forEach(el => {
      el.addEventListener('click', () => {
        this._shiftFrame(parseInt(el.dataset.dx, 10) || 0, parseInt(el.dataset.dy, 10) || 0);
      });
    });
  }

  // =========================================================================
  // Sprite Loading
  // =========================================================================

  _isEquipmentSprite() {
    return this.selectedSprite && (
      this.selectedSprite.category === '장비'
      || this.selectedSprite.browserCategory === '장비'
      || this.selectedSprite.category === '커스텀'
    );
  }

  /**
   * Check if the selected sprite is a base equipment sprite (not an animation variant).
   * Base sprites have keys like equip_weapon_sword but NOT equip_weapon_sword_idle_down.
   */
  _isEquipmentBaseSprite() {
    if (!this.selectedSprite || (this.selectedSprite.category !== '장비' && this.selectedSprite.browserCategory !== '장비')) return false;
    const key = this.selectedSprite.key;
    // Base equipment sprites don't end with _{animType}_{dir}
    for (const set of EQUIP_ANIM_SETS) {
      for (const dir of set.dirs) {
        if (key.endsWith(`_${set.type}_${dir}`)) return false;
      }
    }
    return true;
  }

  /**
   * Check if the selected sprite is an equipment animation variant sprite.
   * Returns { baseKey, animType, dir } or null.
   */
  _parseEquipAnimKey(key) {
    if (!key) return null;
    for (const set of EQUIP_ANIM_SETS) {
      for (let i = 0; i < set.dirs.length; i++) {
        const suffix = `_${set.type}_${set.dirs[i]}`;
        if (key.endsWith(suffix)) {
          return {
            baseKey: key.slice(0, -suffix.length),
            animType: set.type,
            dir: set.dirs[i],
            frames: set.frames[i],
          };
        }
      }
    }
    return null;
  }

  /**
   * Render the equipment animation set list for the current base equipment sprite.
   */
  _renderEquipAnimList() {
    const listEl = document.getElementById('equipAnimList');
    if (!listEl || !this.selectedSprite) return;

    const baseKey = this.selectedSprite.key;
    const customs = this._getCustomSprites();

    let html = `<table style="width:100%;font-size:11px;border-collapse:collapse;">
      <thead>
        <tr style="color:var(--gold);border-bottom:1px solid var(--border);">
          <th style="text-align:left;padding:4px;">애니메이션</th>
          <th style="text-align:left;padding:4px;">방향</th>
          <th style="text-align:center;padding:4px;">프레임</th>
          <th style="text-align:center;padding:4px;">상태</th>
          <th style="text-align:right;padding:4px;">작업</th>
        </tr>
      </thead>
      <tbody>`;

    for (const set of EQUIP_ANIM_SETS) {
      for (let i = 0; i < set.dirs.length; i++) {
        const dir = set.dirs[i];
        const frameCount = set.frames[i];
        const animKey = `${baseKey}_${set.type}_${dir}`;
        const exists = !!customs[animKey];
        // Also check if it exists in the registry
        const inRegistry = SPRITE_REGISTRY.some(s => s.key === animKey);

        html += `<tr style="border-bottom:1px solid var(--border);">
          <td style="padding:4px;color:var(--text);">${set.nameKo} (${set.type})</td>
          <td style="padding:4px;color:var(--text-dim);">${DIR_NAME_KO[dir] || dir}</td>
          <td style="padding:4px;text-align:center;color:var(--text-dim);">${frameCount}</td>
          <td style="padding:4px;text-align:center;">${exists ? '<span style="color:#44ff44;">있음</span>' : '<span style="color:#ff4444;">없음</span>'}</td>
          <td style="padding:4px;text-align:right;">
            ${exists || inRegistry
              ? `<button class="btn btn-secondary btn-small equip-anim-edit-btn" data-key="${animKey}" style="font-size:10px;padding:2px 6px;">편집</button>`
              : `<button class="btn btn-primary btn-small equip-anim-create-btn" data-key="${animKey}" data-type="${set.type}" data-dir="${dir}" data-frames="${frameCount}" style="font-size:10px;padding:2px 6px;">생성</button>`
            }
          </td>
        </tr>`;
      }
    }

    html += '</tbody></table>';
    listEl.innerHTML = html;

    // Bind create buttons
    listEl.querySelectorAll('.equip-anim-create-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const animKey = btn.dataset.key;
        const frameCount = parseInt(btn.dataset.frames);
        this._createEquipAnimSprite(animKey, frameCount);
      });
    });

    // Bind edit buttons
    listEl.querySelectorAll('.equip-anim-edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const animKey = btn.dataset.key;
        this._switchToEquipAnimSprite(animKey);
      });
    });
  }

  /**
   * Create a new blank equipment animation spritesheet.
   */
  _createEquipAnimSprite(animKey, frameCount) {
    const spr = this.selectedSprite;
    if (!spr) return;

    const frameW = spr.frameWidth;
    const frameH = spr.frameHeight;
    const logicalFrameW = spr.logicalFrameWidth || spr.sourceFrameWidth || frameW;
    const logicalFrameH = spr.logicalFrameHeight || spr.sourceFrameHeight || frameH;
    const totalW = frameW * frameCount;

    // Create blank canvas
    const canvas = document.createElement('canvas');
    canvas.width = totalW;
    canvas.height = frameH;

    // Save to custom sprites
    const customs = this._getCustomSprites();
    customs[animKey] = {
      dataUrl: canvas.toDataURL('image/png'),
      width: totalW,
      height: frameH,
      frameWidth: frameW,
      frameHeight: frameH,
      logicalFrameWidth: logicalFrameW,
      logicalFrameHeight: logicalFrameH,
      workspaceMode: 'infinite-centered',
    };

    try {
      localStorage.setItem(CUSTOM_SPRITES_KEY, JSON.stringify(customs));
    } catch (e) {
      if (window.showToast) window.showToast('저장 실패: localStorage 용량 초과', 'error');
      return;
    }

    // Add to sprite registry if not already there
    if (!SPRITE_REGISTRY.find(s => s.key === animKey)) {
      this._ensureRegistryEntry({
        key: animKey,
        category: '장비',
        name: animKey,
        path: null,
        frameWidth: frameW,
        frameHeight: frameH,
        logicalFrameWidth: logicalFrameW,
        logicalFrameHeight: logicalFrameH,
        frames: frameCount,
        type: 'spritesheet',
        isCustom: true,
      });
    }

    if (window.showToast) window.showToast(`애니메이션 스프라이트 "${animKey}" 생성 완료`, 'success');

    // Refresh the animation list
    this._renderEquipAnimList();
    this._renderBrowser();
  }

  /**
   * Switch editor to an equipment animation sprite.
   */
  _switchToEquipAnimSprite(animKey) {
    let entry = SPRITE_REGISTRY.find(s => s.key === animKey);
    if (!entry) {
      // Try to infer from custom sprites
      const customs = this._getCustomSprites();
      if (customs[animKey]) {
        const data = customs[animKey];
        entry = {
          key: animKey,
          category: '장비',
          name: animKey,
          path: null,
          frameWidth: data.frameWidth || 64,
          frameHeight: data.frameHeight || 64,
          logicalFrameWidth: data.logicalFrameWidth || data.sourceFrameWidth || data.frameWidth || 64,
          logicalFrameHeight: data.logicalFrameHeight || data.sourceFrameHeight || data.frameHeight || 64,
          frames: data.frameWidth ? Math.max(1, Math.floor(data.width / data.frameWidth)) : 1,
          type: 'spritesheet',
          isCustom: true,
        };
        entry = this._ensureRegistryEntry(entry);
      }
    }
    if (!entry) {
      if (window.showToast) window.showToast('스프라이트를 찾을 수 없습니다.', 'error');
      return;
    }

    this.selectedSprite = entry;
    this.currentFrame = 0;
    this._stopAnimation();
    this.expandedCategories['아이템 장비'] = true;
    this._renderBrowser();
    this._renderCenter();
    this._renderTools();
  }

  /**
   * Load character guide frame for animation-specific equipment editing.
   * When editing e.g. equip_weapon_sword_slice_down, loads char_slice_down
   * and shows the matching frame as guide overlay.
   */
  _loadCharGuideForAnim(animType, dir) {
    this._charGuideAnimType = animType;
    this._charGuideAnimDir = dir;
    this._charGuideImage = this._createBoxCharacterGuideCanvas(DEFAULT_ACTOR_WIDTH, DEFAULT_ACTOR_HEIGHT, dir);
    this._charGuideIsAnimSheet = false;
    this._charGuideFrameWidth = DEFAULT_ACTOR_WIDTH;
    this._charGuideFrameHeight = DEFAULT_ACTOR_HEIGHT;
    this._charGuideFrames = 1;
    this._redrawDisplay();
  }

  _loadCharGuide() {
    // Current game character is a generated 32x64 box sprite, so the editor guide
    // is drawn locally instead of loading old character spritesheets.
    this._charGuideImage = this._createBoxCharacterGuideCanvas(DEFAULT_ACTOR_WIDTH, DEFAULT_ACTOR_HEIGHT, 'down');
    this._charGuideIsAnimSheet = false;
    this._charGuideAnimType = null;
    this._charGuideAnimDir = null;
    this._charGuideFrameWidth = DEFAULT_ACTOR_WIDTH;
    this._charGuideFrameHeight = DEFAULT_ACTOR_HEIGHT;
    this._charGuideFrames = 1;
    this._redrawDisplay();
  }

  _createBoxCharacterGuideCanvas(width = DEFAULT_ACTOR_WIDTH, height = DEFAULT_ACTOR_HEIGHT, dir = 'down') {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    const sx = width / DEFAULT_ACTOR_WIDTH;
    const sy = height / DEFAULT_ACTOR_HEIGHT;
    const rect = (x, y, w, h, color) => {
      ctx.fillStyle = color;
      ctx.fillRect(Math.round(x * sx), Math.round(y * sy), Math.round(w * sx), Math.round(h * sy));
    };
    const stroke = (x, y, w, h, color, lineWidth = 1) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(1, Math.round(lineWidth * Math.max(sx, sy)));
      ctx.strokeRect(Math.round(x * sx) + 0.5, Math.round(y * sy) + 0.5, Math.round(w * sx), Math.round(h * sy));
    };

    rect(2, 58, 28, 4, 'rgba(0,0,0,0.35)');
    rect(0, 0, 32, 64, 'rgba(37,99,235,0.45)');
    stroke(1, 1, 30, 62, 'rgba(147,197,253,0.95)', 2);
    rect(7, 18, 5, 5, 'rgba(255,255,255,0.85)');
    rect(20, 18, 5, 5, 'rgba(255,255,255,0.85)');
    rect(8, 19, 2, 2, 'rgba(17,24,39,0.9)');
    rect(21, 19, 2, 2, 'rgba(17,24,39,0.9)');
    rect(10, 34, 12, 3, 'rgba(17,24,39,0.9)');

    stroke(0, 0, 32, 64, 'rgba(34,211,238,0.9)', 1);
    stroke(0, 16, 32, 32, 'rgba(250,204,21,0.75)', 1);

    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = `${Math.max(7, Math.round(8 * sx))}px monospace`;
    ctx.fillText(`box:${dir}`, Math.round(2 * sx), Math.round(10 * sy));
    return canvas;
  }

  _loadSprite() {
    if (!this.selectedSprite) return;
    const spr = this.selectedSprite;

    // Unified editor always shows the current box character guide.
    this.showCharGuide = true;
    const animInfo = this._parseEquipAnimKey(spr.key);
    if (animInfo) {
      this._loadCharGuideForAnim(animInfo.animType, animInfo.dir);
    } else {
      this._loadCharGuide();
    }
    const customs = this._getCustomSprites();

    if (customs[spr.key]) {
      // Load custom sprite
      const img = new Image();
      img.onload = () => {
        this._initNativeCanvas(spr.frameWidth * Math.max(1, spr.frames || 1), spr.frameHeight);
        this._drawImageFramesToWorkspace(
          img,
          customs[spr.key].frameWidth || spr.frameWidth,
          customs[spr.key].frameHeight || spr.frameHeight,
          Math.max(1, Math.floor(img.width / (customs[spr.key].frameWidth || spr.frameWidth))),
          spr
        );
        this.undoStack = [];
        this.redoStack = [];
        this._redrawDisplay();
        this._renderTools();
      };
      img.src = customs[spr.key].dataUrl;
    } else if (spr.path) {
      // Load from asset file
      const img = new Image();
      img.onload = () => {
        const w = spr.type === 'spritesheet' ? spr.frameWidth * spr.frames : spr.frameWidth;
        const h = spr.frameHeight;
        this._initNativeCanvas(w, h);
        this._drawImageFramesToWorkspace(
          img,
          spr.sourceFrameWidth || spr.logicalFrameWidth || img.width,
          spr.sourceFrameHeight || spr.logicalFrameHeight || img.height,
          Math.max(1, spr.frames || 1),
          spr
        );
        this.undoStack = [];
        this.redoStack = [];
        this._redrawDisplay();
        this._renderTools();
      };
      img.onerror = () => {
        // File not found, show blank
        const w = spr.type === 'spritesheet' ? spr.frameWidth * spr.frames : spr.frameWidth;
        const h = spr.frameHeight;
        this._initNativeCanvas(w, h);
        this.undoStack = [];
        this.redoStack = [];
        this._redrawDisplay();
        this._renderTools();
      };
      img.src = spr.path;
    } else {
      const w = spr.type === 'spritesheet' ? spr.frameWidth * spr.frames : spr.frameWidth;
      const h = spr.frameHeight;
      this._initNativeCanvas(w, h);
      this._drawProgrammaticSprite(spr);
      this.undoStack = [];
      this.redoStack = [];
      this._redrawDisplay();
      this._renderTools();
    }
  }

  _drawProgrammaticSprite(spr) {
    if (!this.nativeCtx || !spr) return;
    const fw = spr.frameWidth || this.nativeCanvas.width;
    const fh = spr.frameHeight || this.nativeCanvas.height;
    const sourceW = spr.sourceFrameWidth || spr.logicalFrameWidth || fw;
    const sourceH = spr.sourceFrameHeight || spr.logicalFrameHeight || fh;
    const frames = spr.type === 'spritesheet' ? Math.max(1, spr.frames || 1) : 1;

    for (let frame = 0; frame < frames; frame++) {
      const temp = document.createElement('canvas');
      temp.width = sourceW;
      temp.height = sourceH;
      const tctx = temp.getContext('2d');
      tctx.imageSmoothingEnabled = false;
      this._drawProgrammaticFrame(tctx, spr.key, 0, 0, sourceW, sourceH, frame, frames);
      this.nativeCtx.drawImage(temp, 0, 0, sourceW, sourceH, frame * fw, 0, fw, fh);
    }
  }

  _drawImageFramesToWorkspace(img, sourceFrameWidth, sourceFrameHeight, sourceFrames, spr) {
    if (!this.nativeCtx || !img || !spr) return;
    const targetFrameWidth = spr.frameWidth || DEFAULT_ACTOR_WIDTH;
    const targetFrameHeight = spr.frameHeight || DEFAULT_ACTOR_HEIGHT;
    const frameCount = Math.max(1, spr.type === 'spritesheet' ? (spr.frames || sourceFrames || 1) : 1);
    const sourceW = Math.max(1, Number(sourceFrameWidth) || img.width);
    const sourceH = Math.max(1, Number(sourceFrameHeight) || img.height);
    const availableFrames = Math.max(1, Math.floor(img.width / sourceW));

    for (let frame = 0; frame < frameCount; frame++) {
      const sourceFrame = Math.min(frame, availableFrames - 1);
      this.nativeCtx.drawImage(
        img,
        sourceFrame * sourceW,
        0,
        Math.min(sourceW, img.width - sourceFrame * sourceW),
        Math.min(sourceH, img.height),
        frame * targetFrameWidth,
        0,
        targetFrameWidth,
        targetFrameHeight
      );
    }
  }

  _drawProgrammaticFrame(ctx, key, ox, oy, w, h, frame = 0, frames = 1) {
    ctx.clearRect(ox, oy, w, h);
    const rect = (x, y, rw, rh, color) => {
      ctx.fillStyle = color;
      ctx.fillRect(Math.round(ox + x), Math.round(oy + y), Math.round(rw), Math.round(rh));
    };
    const stroke = (x, y, rw, rh, color, lineWidth = 1) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.strokeRect(Math.round(ox + x) + 0.5, Math.round(oy + y) + 0.5, Math.round(rw), Math.round(rh));
    };
    const circle = (x, y, r, color) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(ox + x, oy + y, r, 0, Math.PI * 2);
      ctx.fill();
    };
    const line = (x1, y1, x2, y2, color, lineWidth = 2) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      ctx.moveTo(ox + x1, oy + y1);
      ctx.lineTo(ox + x2, oy + y2);
      ctx.stroke();
    };

    if (/^(char_|player_|monster_|npc_)/.test(key) || key === 'player_base' || key === 'player_box') {
      const actorFill = key.startsWith('monster_') ? '#dc2626' : key.startsWith('npc_') ? '#16a34a' : '#2563eb';
      const actorEdge = key.startsWith('monster_') ? '#fca5a5' : key.startsWith('npc_') ? '#86efac' : '#93c5fd';
      rect(2, h - 6, Math.max(1, w - 4), 4, 'rgba(0,0,0,0.35)');
      rect(0, 0, w, h, actorFill);
      stroke(1, 1, Math.max(1, w - 2), Math.max(1, h - 2), actorEdge, 2);
      rect(Math.round(w * 0.22), Math.round(h * 0.28), 5, 5, '#ffffff');
      rect(Math.round(w * 0.62), Math.round(h * 0.28), 5, 5, '#ffffff');
      rect(Math.round(w * 0.25), Math.round(h * 0.30), 2, 2, '#111827');
      rect(Math.round(w * 0.65), Math.round(h * 0.30), 2, 2, '#111827');
      rect(Math.round(w * 0.31), Math.round(h * 0.53), Math.max(4, Math.round(w * 0.38)), 3, '#111827');
      stroke(0, Math.max(0, Math.round((h - DEFAULT_TILE_SIZE) / 2)), Math.min(w, DEFAULT_TILE_SIZE), Math.min(h, DEFAULT_TILE_SIZE), '#facc15', 1);
      if (frames > 1) rect(2 + frame * 2, 6, 6, 4, '#facc15');
      return;
    }

    if (key === 'icon_potion') {
      rect(10, 12, 12, 18, '#cc3333');
      rect(12, 7, 8, 7, '#886644');
      rect(12, 5, 8, 3, '#aa8855');
      rect(13, 17, 4, 9, '#ff6666');
      return;
    }
    if (key === 'icon_material') {
      rect(8, 13, 16, 12, '#88aa66');
      rect(10, 9, 12, 6, '#aacc88');
      rect(14, 4, 4, 7, '#667744');
      return;
    }
    if (key.startsWith('icon_')) {
      rect(8, 8, w - 16, h - 16, '#5b6ee1');
      stroke(8, 8, w - 16, h - 16, '#a7b1ff', 2);
      rect(w / 2 - 2, 4, 4, h - 8, '#f7d56b');
      return;
    }

    if (key === 'fx_slash' || key === 'fx_heavy_slash') {
      const spread = frames > 1 ? frame * 4 : 0;
      line(22 - spread, 70 + spread, 72 + spread, 20 - spread, '#ffffff', 8);
      line(25 - spread, 72 + spread, 75 + spread, 22 - spread, '#66ccff', 4);
      if (key === 'fx_heavy_slash') {
        line(24 - spread, 22 - spread, 72 + spread, 70 + spread, '#ffffff', 7);
        line(27 - spread, 24 - spread, 75 + spread, 72 + spread, '#ffaa66', 4);
      }
      return;
    }
    if (key === 'fx_hit_receive') {
      const r = 10 + frame * 7;
      circle(w / 2, h / 2, r, 'rgba(255,255,255,0.2)');
      circle(w / 2, h / 2, Math.max(4, r - 7), 'rgba(255,68,68,0.35)');
      circle(w / 2, h / 2, 4 + frame, 'rgba(255,255,255,0.9)');
      for (let i = 0; i < 8; i++) {
        const a = (Math.PI * 2 * i) / 8;
        const x1 = w / 2 + Math.cos(a) * (6 + frame * 2);
        const y1 = h / 2 + Math.sin(a) * (6 + frame * 2);
        const x2 = w / 2 + Math.cos(a) * (18 + frame * 7);
        const y2 = h / 2 + Math.sin(a) * (18 + frame * 7);
        line(x1, y1, x2, y2, '#ffeeee', Math.max(1, 4 - frame));
      }
      return;
    }
    if (key === 'fx_lightning') {
      line(52, 8, 34, 42, '#ffff88', 7);
      line(34, 42, 52, 42, '#ffff88', 7);
      line(52, 42, 34, 88, '#ffff88', 7);
      line(54, 8, 36, 88, '#ffffff', 2);
      return;
    }
    if (key === 'fx_heal') {
      circle(48, 48, 28, 'rgba(68,255,136,0.35)');
      rect(43, 24, 10, 52, '#66ff99');
      rect(24, 43, 52, 10, '#66ff99');
      return;
    }
    if (key.startsWith('fx_')) {
      circle(w / 2, h / 2, Math.min(w, h) / 3, 'rgba(255,120,80,0.55)');
      circle(w / 2, h / 2, Math.min(w, h) / 5, 'rgba(255,240,140,0.9)');
      return;
    }

    rect(0, 0, w, h, '#202033');
    stroke(2, 2, w - 4, h - 4, '#666688', 1);
  }

  _initNativeCanvas(w, h) {
    this.nativeCanvas = document.createElement('canvas');
    this.nativeCanvas.width = w;
    this.nativeCanvas.height = h;
    this.nativeCtx = this.nativeCanvas.getContext('2d');
    this.nativeCtx.imageSmoothingEnabled = false;
  }

  // =========================================================================
  // Display Rendering
  // =========================================================================

  _redrawDisplay() {
    if (!this.displayCanvas || !this.nativeCanvas || !this.selectedSprite) return;

    const spr = this.selectedSprite;
    const isSheet = spr.type === 'spritesheet' && spr.frames > 1;

    const srcX = isSheet ? this.currentFrame * spr.frameWidth : 0;
    const srcY = 0;
    const srcW = spr.frameWidth;
    const srcH = spr.frameHeight;

    const wrap = document.getElementById('sprCanvasWrap');
    const wrapRect = wrap?.getBoundingClientRect?.();
    let dw = Math.max(EDITOR_VIEW_MIN_WIDTH, Math.floor(wrapRect?.width || 0));
    let dh = Math.max(EDITOR_VIEW_MIN_HEIGHT, Math.floor(wrapRect?.height || 0));
    const availableW = Math.max(1, dw - 160);
    const availableH = Math.max(1, dh - 160);
    const scale = Math.max(1, Math.min(16, Math.floor(Math.min(availableW / srcW, availableH / srcH))));
    const viewW = srcW * scale;
    const viewH = srcH * scale;
    dw = Math.max(dw, viewW + 160);
    dh = Math.max(dh, viewH + 160);
    const offsetX = Math.floor((dw - viewW) / 2);
    const offsetY = Math.floor((dh - viewH) / 2);
    this.stage = { offsetX, offsetY, scale, frameWidth: srcW, frameHeight: srcH };

    this.displayCanvas.width = dw;
    this.displayCanvas.height = dh;
    this.displayCtx = this.displayCanvas.getContext('2d');
    this.displayCtx.imageSmoothingEnabled = false;
    this.displayCanvas.style.width = `${dw}px`;
    this.displayCanvas.style.height = `${dh}px`;

    // Unified editor background. Keep it identical for every sprite type/size.
    this.displayCtx.fillStyle = '#15151f';
    this.displayCtx.fillRect(0, 0, dw, dh);
    const bgCell = 32;
    for (let y = 0; y < dh; y += bgCell) {
      for (let x = 0; x < dw; x += bgCell) {
        this.displayCtx.fillStyle = ((x / bgCell + y / bgCell) % 2 === 0) ? '#1d1d28' : '#181822';
        this.displayCtx.fillRect(x, y, bgCell, bgCell);
      }
    }
    this.displayCtx.fillStyle = '#242432';
    this.displayCtx.fillRect(offsetX, offsetY, viewW, viewH);

    // Draw character guide overlay
    if (this._charGuideImage && this.showCharGuide) {
      this.displayCtx.globalAlpha = 0.3;

      if (this._charGuideIsAnimSheet && this._charGuideFrameWidth) {
        // Animation-specific guide: show the matching frame from the character spritesheet
        const guideFrameIdx = Math.min(this.currentFrame, this._charGuideFrames - 1);
        const guideSrcX = guideFrameIdx * this._charGuideFrameWidth;
        this.displayCtx.drawImage(
          this._charGuideImage,
          guideSrcX, 0, this._charGuideFrameWidth, this._charGuideFrameHeight,
          offsetX, offsetY, viewW, viewH
        );
      } else {
        // Static guide: show first frame of idle_down
        this.displayCtx.drawImage(
          this._charGuideImage,
          0, 0, this._charGuideImage.width, this._charGuideImage.height,
          offsetX, offsetY, viewW, viewH
        );
      }
      this.displayCtx.globalAlpha = 1.0;

      // Show which character animation frame is being used as guide
      if (this._charGuideIsAnimSheet && this._charGuideAnimType) {
        const animLabel = `char_${this._charGuideAnimType}_${this._charGuideAnimDir} [${this.currentFrame + 1}/${this._charGuideFrames}]`;
        this.displayCtx.fillStyle = 'rgba(0, 200, 255, 0.7)';
        this.displayCtx.font = '10px monospace';
        this.displayCtx.fillText(animLabel, 2, dh - 4);
      }

      // Draw body region guides (head, torso, legs) as dotted lines
      this.displayCtx.strokeStyle = 'rgba(0, 200, 255, 0.3)';
      this.displayCtx.setLineDash([4, 4]);
      this.displayCtx.lineWidth = 1;
      // Head region ~row 6-20 (top quarter)
      const headY = offsetY + Math.round(spr.frameHeight * 0.1) * scale;
      const neckY = offsetY + Math.round(spr.frameHeight * 0.3) * scale;
      const waistY = offsetY + Math.round(spr.frameHeight * 0.6) * scale;
      const kneeY = offsetY + Math.round(spr.frameHeight * 0.75) * scale;
      this.displayCtx.beginPath();
      this.displayCtx.moveTo(offsetX, headY); this.displayCtx.lineTo(offsetX + viewW, headY);
      this.displayCtx.moveTo(offsetX, neckY); this.displayCtx.lineTo(offsetX + viewW, neckY);
      this.displayCtx.moveTo(offsetX, waistY); this.displayCtx.lineTo(offsetX + viewW, waistY);
      this.displayCtx.moveTo(offsetX, kneeY); this.displayCtx.lineTo(offsetX + viewW, kneeY);
      this.displayCtx.stroke();
      this.displayCtx.setLineDash([]);

      // Region labels
      this.displayCtx.fillStyle = 'rgba(0, 200, 255, 0.5)';
      this.displayCtx.font = '10px monospace';
      this.displayCtx.fillText('투구', 2, headY + 12);
      this.displayCtx.fillText('갑옷', 2, neckY + 12);
      this.displayCtx.fillText('허리', 2, waistY + 12);
      this.displayCtx.fillText('신발', 2, kneeY + 12);
      // Current generated actors are 32x64 with a centered 32x32 collision box.
      const boxBodyX = offsetX;
      const boxBodyY = offsetY;
      const boxBodyW = viewW;
      const boxBodyH = viewH;
      const boxHitX = offsetX;
      const boxHitY = offsetY + Math.max(0, Math.round((srcH - DEFAULT_TILE_SIZE) / 2) * scale);
      const boxHitW = Math.min(viewW, DEFAULT_TILE_SIZE * scale);
      const boxHitH = Math.min(viewH, DEFAULT_TILE_SIZE * scale);
      this.displayCtx.setLineDash([6, 3]);
      this.displayCtx.strokeStyle = 'rgba(34, 211, 238, 0.75)';
      this.displayCtx.strokeRect(boxBodyX, boxBodyY, boxBodyW, boxBodyH);
      this.displayCtx.strokeStyle = 'rgba(250, 204, 21, 0.65)';
      this.displayCtx.strokeRect(boxHitX, boxHitY, boxHitW, boxHitH);
      this.displayCtx.setLineDash([]);
      this.displayCtx.fillStyle = 'rgba(34, 211, 238, 0.8)';
      this.displayCtx.fillText('box body', boxBodyX + 2, boxBodyY + 12);
      this.displayCtx.fillStyle = 'rgba(250, 204, 21, 0.8)';
      this.displayCtx.fillText('hitbox', boxHitX + 2, boxHitY + boxHitH - 4);
    }

    // Draw sprite scaled
    this.displayCtx.drawImage(
      this.nativeCanvas,
      srcX, srcY, srcW, srcH,
      offsetX, offsetY, viewW, viewH
    );

    // Draw 1-pixel cell grid. Every line marks one native sprite pixel.
    if (this.showGrid) {
      this.displayCtx.lineWidth = 1;
      for (let x = 0; x <= viewW; x += scale) {
        const cell = Math.round(x / scale);
        this.displayCtx.strokeStyle = cell % 8 === 0 ? 'rgba(255,255,255,0.24)' : 'rgba(255,255,255,0.10)';
        this.displayCtx.beginPath();
        this.displayCtx.moveTo(offsetX + x + 0.5, offsetY);
        this.displayCtx.lineTo(offsetX + x + 0.5, offsetY + viewH);
        this.displayCtx.stroke();
      }
      for (let y = 0; y <= viewH; y += scale) {
        const cell = Math.round(y / scale);
        this.displayCtx.strokeStyle = cell % 8 === 0 ? 'rgba(255,255,255,0.24)' : 'rgba(255,255,255,0.10)';
        this.displayCtx.beginPath();
        this.displayCtx.moveTo(offsetX, offsetY + y + 0.5);
        this.displayCtx.lineTo(offsetX + viewW, offsetY + y + 0.5);
        this.displayCtx.stroke();
      }
    }

    // Draw inventory box guide
    if (this.showInvGuide) {
      // Inventory cell is 42x42, usable icon area is 36x36 (3px padding each side)
      // Icon is auto-scaled to fit: scale = min(36/sprW, 36/sprH, 2.5)
      const invCell = 42;
      const invPad = 3;
      const invUsable = invCell - invPad * 2; // 36px max icon display area

      const fitScale = Math.min(invUsable / srcW, invUsable / srcH, 2.5);
      const renderW = srcW * fitScale;
      const renderH = srcH * fitScale;

      // Map from game render coordinates to editor canvas coordinates
      // In game: icon is centered in cell. In editor: show how much of the sprite fits.
      // Show the 36x36 usable zone mapped onto the sprite's native pixels
      const usablePixW = invUsable / fitScale; // how many native pixels fit in 36px
      const usablePixH = invUsable / fitScale;

      // Draw the "safe zone" box centered on the sprite
      const safeL = offsetX + ((srcW - usablePixW) / 2) * scale;
      const safeT = offsetY + ((srcH - usablePixH) / 2) * scale;
      const safeW = usablePixW * scale;
      const safeH = usablePixH * scale;

      // Dim area outside the safe zone
      this.displayCtx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      // Top strip
      if (safeT > offsetY) this.displayCtx.fillRect(offsetX, offsetY, viewW, safeT - offsetY);
      // Bottom strip
      if (safeT + safeH < offsetY + viewH) this.displayCtx.fillRect(offsetX, safeT + safeH, viewW, offsetY + viewH - safeT - safeH);
      // Left strip
      if (safeL > offsetX) this.displayCtx.fillRect(offsetX, safeT, safeL - offsetX, safeH);
      // Right strip
      if (safeL + safeW < offsetX + viewW) this.displayCtx.fillRect(safeL + safeW, safeT, offsetX + viewW - safeL - safeW, safeH);

      // Draw the safe zone border
      this.displayCtx.strokeStyle = 'rgba(255, 170, 68, 0.8)';
      this.displayCtx.lineWidth = 2;
      this.displayCtx.setLineDash([6, 3]);
      this.displayCtx.strokeRect(safeL, safeT, safeW, safeH);
      this.displayCtx.setLineDash([]);

      // Label
      this.displayCtx.fillStyle = 'rgba(255, 170, 68, 0.9)';
      this.displayCtx.font = '11px monospace';
      this.displayCtx.fillText(`인벤토리 (${invCell}×${invCell}, ${Math.round(fitScale * 100)}%)`, safeL + 2, safeT - 4 > 12 ? safeT - 4 : safeT + 14);
    }

    this.displayCtx.strokeStyle = 'rgba(255,255,255,0.55)';
    this.displayCtx.lineWidth = 2;
    this.displayCtx.strokeRect(offsetX + 0.5, offsetY + 0.5, viewW, viewH);
    this.displayCtx.fillStyle = 'rgba(255,255,255,0.86)';
    this.displayCtx.font = '13px monospace';
    this.displayCtx.fillText(`infinite board | 1 grid = 1px | frame ${srcW}x${srcH} | cell ${scale}px`, 12, 22);
  }

  _updateFrameDisplay() {
    const info = document.getElementById('sprFrameInfo');
    if (info && this.selectedSprite) {
      info.textContent = `프레임 ${this.currentFrame + 1}/${this.selectedSprite.frames}`;
    }
    this._syncFrameControls();
    this._redrawDisplay();
  }

  _syncFrameControls() {
    const copyPrevBtn = document.getElementById('sprCopyPrevFrame');
    if (!copyPrevBtn || !this.selectedSprite) return;
    const canCopyPrevious = this.selectedSprite.type === 'spritesheet'
      && this.selectedSprite.frames > 1
      && this.currentFrame > 0
      && !!this.nativeCtx;
    copyPrevBtn.disabled = !canCopyPrevious;
    copyPrevBtn.title = canCopyPrevious
      ? `${this.currentFrame}번 프레임을 ${this.currentFrame + 1}번 프레임으로 복사`
      : '2번 프레임 이상에서 사용할 수 있습니다';
  }

  // =========================================================================
  // Canvas Drawing Tools
  // =========================================================================

  _displayToNative(e) {
    const rect = this.displayCanvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const stage = this.stage || { offsetX: 0, offsetY: 0, scale: this.zoom };
    let localX = Math.floor((mx - stage.offsetX) / stage.scale);
    let localY = Math.floor((my - stage.offsetY) / stage.scale);
    const inBounds = localX >= 0 && localX < stage.frameWidth && localY >= 0 && localY < stage.frameHeight;

    // Offset for spritesheet frame
    const spr = this.selectedSprite;
    let px = localX;
    let py = localY;
    if (spr && spr.type === 'spritesheet' && spr.frames > 1) {
      px += this.currentFrame * spr.frameWidth;
    }
    return { px, py, inBounds };
  }

  _onCanvasMouseDown(e) {
    if (!this.nativeCanvas || this.isPlaying) return;
    e.preventDefault();
    const { px, py, inBounds } = this._displayToNative(e);
    if (!inBounds) return;
    this.isDrawing = true;

    if (this.currentTool === 'picker') {
      this._eyedrop(px, py);
      return;
    }

    if (this.currentTool === 'fill') {
      this._pushUndo();
      this._floodFill(px, py);
      this._redrawDisplay();
      return;
    }

    if (this.currentTool === 'line') {
      this.lineStart = { px, py };
      return;
    }

    if (this.currentTool === 'rect') {
      this.rectStart = { px, py };
      return;
    }

    // Pencil / Eraser
    this._pushUndo();
    this._drawPixel(px, py);
    this.lastPixel = { px, py };
    this._redrawDisplay();
  }

  _onCanvasMouseMove(e) {
    if (!this.isDrawing || !this.nativeCanvas || this.isPlaying) return;
    const { px, py, inBounds } = this._displayToNative(e);
    if (!inBounds) return;

    if (this.currentTool === 'pencil' || this.currentTool === 'eraser') {
      if (this.lastPixel && (this.lastPixel.px !== px || this.lastPixel.py !== py)) {
        // Bresenham line for smooth drawing
        this._drawLine(this.lastPixel.px, this.lastPixel.py, px, py);
        this.lastPixel = { px, py };
        this._redrawDisplay();
      }
    }
  }

  _onCanvasMouseUp() {
    if (!this.isDrawing) return;

    if (this.currentTool === 'line' && this.lineStart) {
      // We need the last mouse position... get from the display
      // Use a separate approach: line is drawn on mouseup at end position
    }
    if (this.currentTool === 'rect' && this.rectStart) {
      // Similar
    }

    this.isDrawing = false;
    this.lastPixel = null;
    this.lineStart = null;
    this.rectStart = null;
  }

  _drawPixel(px, py) {
    if (!this.nativeCtx) return;
    const size = this.brushSize;
    if (this.currentTool === 'eraser') {
      this.nativeCtx.clearRect(px - Math.floor(size / 2), py - Math.floor(size / 2), size, size);
    } else {
      this.nativeCtx.fillStyle = this.currentColor;
      this.nativeCtx.fillRect(px - Math.floor(size / 2), py - Math.floor(size / 2), size, size);
    }
  }

  _drawLine(x0, y0, x1, y1) {
    // Bresenham
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;
    while (true) {
      this._drawPixel(x0, y0);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 > -dy) { err -= dy; x0 += sx; }
      if (e2 < dx) { err += dx; y0 += sy; }
    }
  }

  _eyedrop(px, py) {
    if (!this.nativeCtx) return;
    const data = this.nativeCtx.getImageData(px, py, 1, 1).data;
    if (data[3] === 0) return;
    const hex = '#' + [data[0], data[1], data[2]].map(v => v.toString(16).padStart(2, '0')).join('');
    this.currentColor = hex;
    this._addRecentColor(hex);
    this._renderTools();
    this.isDrawing = false;
  }

  _floodFill(startX, startY) {
    if (!this.nativeCtx) return;
    const w = this.nativeCanvas.width;
    const h = this.nativeCanvas.height;
    if (startX < 0 || startX >= w || startY < 0 || startY >= h) return;

    const imageData = this.nativeCtx.getImageData(0, 0, w, h);
    const data = imageData.data;

    // Parse target color
    const tc = this._hexToRgba(this.currentColor);

    // Get color at start
    const idx = (startY * w + startX) * 4;
    const sr = data[idx], sg = data[idx + 1], sb = data[idx + 2], sa = data[idx + 3];

    // Don't fill if same color
    if (sr === tc.r && sg === tc.g && sb === tc.b && sa === tc.a) return;

    const stack = [[startX, startY]];
    const visited = new Set();

    while (stack.length > 0) {
      const [x, y] = stack.pop();
      if (x < 0 || x >= w || y < 0 || y >= h) continue;
      const key = y * w + x;
      if (visited.has(key)) continue;
      visited.add(key);

      const i = key * 4;
      if (data[i] !== sr || data[i + 1] !== sg || data[i + 2] !== sb || data[i + 3] !== sa) continue;

      data[i] = tc.r;
      data[i + 1] = tc.g;
      data[i + 2] = tc.b;
      data[i + 3] = tc.a;

      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }

    this.nativeCtx.putImageData(imageData, 0, 0);
  }

  _hexToRgba(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b, a: 255 };
  }

  _getCurrentFrameRect() {
    if (!this.selectedSprite || !this.nativeCanvas) return null;
    const spr = this.selectedSprite;
    const isSheet = spr.type === 'spritesheet' && spr.frames > 1;
    const frameW = spr.frameWidth || this.nativeCanvas.width;
    const frameH = spr.frameHeight || this.nativeCanvas.height;
    const actualFrames = isSheet ? Math.max(1, Math.floor(this.nativeCanvas.width / frameW)) : 1;
    const frameIndex = isSheet ? Math.min(this.currentFrame, actualFrames - 1) : 0;
    return {
      x: isSheet ? frameIndex * frameW : 0,
      y: 0,
      w: Math.min(frameW, Math.max(0, this.nativeCanvas.width - (isSheet ? frameIndex * frameW : 0))),
      h: Math.min(frameH, this.nativeCanvas.height),
    };
  }

  _ensureCanvasFrameCapacity() {
    if (!this.selectedSprite || !this.nativeCanvas || !this.nativeCtx) return false;
    const spr = this.selectedSprite;
    const frameW = spr.frameWidth || this.nativeCanvas.width;
    const frameH = spr.frameHeight || this.nativeCanvas.height;
    const frames = spr.type === 'spritesheet' ? Math.max(1, spr.frames || 1) : 1;
    const requiredW = frameW * frames;
    const requiredH = frameH;
    if (this.nativeCanvas.width >= requiredW && this.nativeCanvas.height >= requiredH) return true;

    const nextCanvas = document.createElement('canvas');
    nextCanvas.width = Math.max(requiredW, this.nativeCanvas.width);
    nextCanvas.height = Math.max(requiredH, this.nativeCanvas.height);
    const nextCtx = nextCanvas.getContext('2d');
    nextCtx.imageSmoothingEnabled = false;
    nextCtx.drawImage(this.nativeCanvas, 0, 0);
    this.nativeCanvas = nextCanvas;
    this.nativeCtx = nextCtx;
    return true;
  }

  _copyRectAsPixelJson(rect) {
    if (!rect || !this.nativeCtx || rect.w <= 0 || rect.h <= 0) return null;
    const imageData = this.nativeCtx.getImageData(rect.x, rect.y, rect.w, rect.h);
    return {
      type: 'murim-sprite-pixels',
      width: imageData.width,
      height: imageData.height,
      pixels: Array.from(imageData.data),
    };
  }

  _pastePixelJsonToRect(payload, rect) {
    if (!payload || !rect || !this.nativeCtx) return false;
    const srcPixels = Array.isArray(payload.pixels) ? payload.pixels : null;
    const srcW = parseInt(payload.width, 10) || 0;
    const srcH = parseInt(payload.height, 10) || 0;
    if (!srcPixels || srcW <= 0 || srcH <= 0 || rect.w <= 0 || rect.h <= 0) return false;

    const pasteW = Math.min(srcW, rect.w);
    const pasteH = Math.min(srcH, rect.h);
    const target = this.nativeCtx.getImageData(rect.x, rect.y, rect.w, rect.h);
    for (let y = 0; y < pasteH; y++) {
      for (let x = 0; x < pasteW; x++) {
        const srcIdx = (y * srcW + x) * 4;
        const dstIdx = (y * rect.w + x) * 4;
        target.data[dstIdx] = srcPixels[srcIdx] || 0;
        target.data[dstIdx + 1] = srcPixels[srcIdx + 1] || 0;
        target.data[dstIdx + 2] = srcPixels[srcIdx + 2] || 0;
        target.data[dstIdx + 3] = srcPixels[srcIdx + 3] || 0;
      }
    }
    this.nativeCtx.putImageData(target, rect.x, rect.y);
    return true;
  }

  _copyFrame() {
    this._ensureCanvasFrameCapacity();
    const rect = this._getCurrentFrameRect();
    if (!rect || !this.nativeCtx) return;
    this.clipboardImageData = this._copyRectAsPixelJson(rect);
    this._renderTools();
    if (window.showToast) window.showToast(`현재 프레임 픽셀 ${rect.w}x${rect.h}를 JSON으로 복사했습니다.`, 'success');
  }

  _copyPreviousFrameIntoCurrent() {
    if (!this.selectedSprite || !this.nativeCtx || !this.nativeCanvas) {
      if (window.showToast) window.showToast('스프라이트 로딩이 끝난 뒤 다시 시도해주세요.', 'info');
      return;
    }
    const spr = this.selectedSprite;
    if (spr.type !== 'spritesheet' || spr.frames <= 1) {
      if (window.showToast) window.showToast('프레임이 2개 이상인 스프라이트에서만 사용할 수 있습니다.', 'info');
      return;
    }
    if (this.currentFrame <= 0) {
      if (window.showToast) window.showToast('첫 프레임에는 이전 프레임이 없습니다. 2번 프레임 이상에서 사용해주세요.', 'info');
      return;
    }

    this._ensureCanvasFrameCapacity();
    const frameW = spr.frameWidth || this.nativeCanvas.width;
    const frameH = spr.frameHeight || this.nativeCanvas.height;

    const currentX = this.currentFrame * frameW;
    const previousX = (this.currentFrame - 1) * frameW;
    const previousRect = { x: previousX, y: 0, w: frameW, h: frameH };
    const currentRect = { x: currentX, y: 0, w: frameW, h: frameH };
    const payload = this._copyRectAsPixelJson(previousRect);
    if (!payload) {
      if (window.showToast) window.showToast('이전 프레임 픽셀을 읽을 수 없습니다.', 'error');
      return;
    }

    this._pushUndo();
    this.nativeCtx.clearRect(currentX, 0, frameW, frameH);
    this._pastePixelJsonToRect(payload, currentRect);
    this._redrawDisplay();
    this._renderTools();
    this._syncFrameControls();
    if (window.showToast) window.showToast(`${this.currentFrame}번 프레임을 ${this.currentFrame + 1}번 프레임으로 복사했습니다.`, 'success');
  }

  _pasteFrame() {
    this._ensureCanvasFrameCapacity();
    const rect = this._getCurrentFrameRect();
    if (!rect || !this.nativeCtx || !this.clipboardImageData) return;
    if (!Array.isArray(this.clipboardImageData.pixels) || !this.clipboardImageData.width || !this.clipboardImageData.height) {
      if (window.showToast) window.showToast('붙여넣을 픽셀 JSON을 읽을 수 없습니다.', 'error');
      return;
    }
    this._pushUndo();
    this.nativeCtx.clearRect(rect.x, rect.y, rect.w, rect.h);
    const ok = this._pastePixelJsonToRect(this.clipboardImageData, rect);
    if (!ok) {
      if (window.showToast) window.showToast('붙여넣을 픽셀 JSON을 읽을 수 없습니다.', 'error');
      return;
    }

    this._redrawDisplay();
    this._renderTools();
    if (window.showToast) window.showToast('복사한 픽셀 정보를 현재 프레임에 붙여넣었습니다.', 'success');
  }

  _shiftFrame(dx, dy) {
    const rect = this._getCurrentFrameRect();
    if (!rect || !this.nativeCtx || (!dx && !dy)) return;
    this._pushUndo();

    const frameData = this.nativeCtx.getImageData(rect.x, rect.y, rect.w, rect.h);
    const temp = document.createElement('canvas');
    temp.width = rect.w;
    temp.height = rect.h;
    temp.getContext('2d').putImageData(frameData, 0, 0);

    this.nativeCtx.clearRect(rect.x, rect.y, rect.w, rect.h);
    this.nativeCtx.save();
    this.nativeCtx.beginPath();
    this.nativeCtx.rect(rect.x, rect.y, rect.w, rect.h);
    this.nativeCtx.clip();
    this.nativeCtx.drawImage(temp, rect.x + dx, rect.y + dy);
    this.nativeCtx.restore();
    this._redrawDisplay();
    this._renderTools();
  }

  // =========================================================================
  // Line / Rectangle tool via mouseup with position tracking
  // =========================================================================

  // Override the mousedown/up for line/rect to properly track start and end
  // We'll use a simpler approach: track the end position on mouseup

  // Re-bind canvas with proper line/rect support
  _onCanvasMouseDown2(e) {
    // This is handled by the existing _onCanvasMouseDown
  }

  // =========================================================================
  // Undo / Redo
  // =========================================================================

  _pushUndo() {
    if (!this.nativeCanvas) return;
    const data = this.nativeCtx.getImageData(0, 0, this.nativeCanvas.width, this.nativeCanvas.height);
    this.undoStack.push(data);
    if (this.undoStack.length > 20) this.undoStack.shift();
    this.redoStack = [];
  }

  _undo() {
    if (this.undoStack.length === 0 || !this.nativeCtx) return;
    const current = this.nativeCtx.getImageData(0, 0, this.nativeCanvas.width, this.nativeCanvas.height);
    this.redoStack.push(current);
    const prev = this.undoStack.pop();
    this.nativeCtx.putImageData(prev, 0, 0);
    this._redrawDisplay();
    this._renderTools();
  }

  _redo() {
    if (this.redoStack.length === 0 || !this.nativeCtx) return;
    const current = this.nativeCtx.getImageData(0, 0, this.nativeCanvas.width, this.nativeCanvas.height);
    this.undoStack.push(current);
    const next = this.redoStack.pop();
    this.nativeCtx.putImageData(next, 0, 0);
    this._redrawDisplay();
    this._renderTools();
  }

  // =========================================================================
  // Mirror
  // =========================================================================

  _mirror(direction) {
    if (!this.nativeCanvas || !this.selectedSprite) return;
    this._pushUndo();

    const spr = this.selectedSprite;
    const isSheet = spr.type === 'spritesheet' && spr.frames > 1;

    if (isSheet) {
      // Mirror only current frame
      const fx = this.currentFrame * spr.frameWidth;
      const frameData = this.nativeCtx.getImageData(fx, 0, spr.frameWidth, spr.frameHeight);
      const temp = document.createElement('canvas');
      temp.width = spr.frameWidth;
      temp.height = spr.frameHeight;
      const tctx = temp.getContext('2d');
      tctx.putImageData(frameData, 0, 0);

      this.nativeCtx.clearRect(fx, 0, spr.frameWidth, spr.frameHeight);
      this.nativeCtx.save();
      this.nativeCtx.translate(fx + (direction === 'h' ? spr.frameWidth : 0), direction === 'v' ? spr.frameHeight : 0);
      this.nativeCtx.scale(direction === 'h' ? -1 : 1, direction === 'v' ? -1 : 1);
      this.nativeCtx.drawImage(temp, 0, 0);
      this.nativeCtx.restore();
    } else {
      const temp = document.createElement('canvas');
      temp.width = this.nativeCanvas.width;
      temp.height = this.nativeCanvas.height;
      const tctx = temp.getContext('2d');
      tctx.drawImage(this.nativeCanvas, 0, 0);

      this.nativeCtx.clearRect(0, 0, this.nativeCanvas.width, this.nativeCanvas.height);
      this.nativeCtx.save();
      this.nativeCtx.translate(direction === 'h' ? this.nativeCanvas.width : 0, direction === 'v' ? this.nativeCanvas.height : 0);
      this.nativeCtx.scale(direction === 'h' ? -1 : 1, direction === 'v' ? -1 : 1);
      this.nativeCtx.drawImage(temp, 0, 0);
      this.nativeCtx.restore();
    }

    this._redrawDisplay();
  }

  // =========================================================================
  // Animation
  // =========================================================================

  _startAnimation() {
    if (!this.selectedSprite || this.selectedSprite.frames <= 1) return;
    this._stopAnimation();
    this.isPlaying = true;
    this.animInterval = setInterval(() => {
      this.currentFrame = (this.currentFrame + 1) % this.selectedSprite.frames;
      this._updateFrameDisplay();
    }, 1000 / this.animSpeed);
  }

  _stopAnimation() {
    this.isPlaying = false;
    if (this.animInterval) {
      clearInterval(this.animInterval);
      this.animInterval = null;
    }
  }

  // =========================================================================
  // Save / Load / Import / Export
  // =========================================================================

  _getCustomSprites() {
    try {
      return JSON.parse(localStorage.getItem(CUSTOM_SPRITES_KEY) || '{}');
    } catch { return {}; }
  }

  _saveSprite() {
    if (!this.nativeCanvas || !this.selectedSprite) return;
    const spr = this.selectedSprite;
    const customs = this._getCustomSprites();
    customs[spr.key] = {
      dataUrl: this.nativeCanvas.toDataURL('image/png'),
      width: this.nativeCanvas.width,
      height: this.nativeCanvas.height,
      frameWidth: spr.frameWidth,
      frameHeight: spr.frameHeight,
      logicalFrameWidth: spr.logicalFrameWidth || spr.sourceFrameWidth || spr.frameWidth,
      logicalFrameHeight: spr.logicalFrameHeight || spr.sourceFrameHeight || spr.frameHeight,
      workspaceMode: 'infinite-centered',
      category: spr.category || '커스텀',
    };
    if (spr.baseSpriteKey && spr.key !== spr.baseSpriteKey && !spr.characterSpriteRole && !customs[spr.baseSpriteKey]) {
      const baseCanvas = document.createElement('canvas');
      baseCanvas.width = spr.frameWidth;
      baseCanvas.height = spr.frameHeight;
      customs[spr.baseSpriteKey] = {
        dataUrl: baseCanvas.toDataURL('image/png'),
        width: spr.frameWidth,
        height: spr.frameHeight,
        frameWidth: spr.frameWidth,
        frameHeight: spr.frameHeight,
        logicalFrameWidth: spr.logicalFrameWidth || spr.sourceFrameWidth || spr.frameWidth,
        logicalFrameHeight: spr.logicalFrameHeight || spr.sourceFrameHeight || spr.frameHeight,
        workspaceMode: 'infinite-centered',
      };
    }
    try {
      localStorage.setItem(CUSTOM_SPRITES_KEY, JSON.stringify(customs));
      if (spr.itemId && spr.baseSpriteKey && this.dm?.data?.items?.[spr.itemId]) {
        this.dm.data.items[spr.itemId].spriteKey = spr.baseSpriteKey;
        this.dm.save();
      }
      if (spr.itemId && spr.spriteRole === 'itemIcon' && this.dm?.data?.items?.[spr.itemId]) {
        this.dm.data.items[spr.itemId].iconKey = spr.key;
        this.dm.save();
      }
      if (spr.characterSpriteRole === 'base') {
        if (!this.dm.data.mainCharacter) this.dm.data.mainCharacter = {};
        this.dm.data.mainCharacter.spriteKey = spr.key;
        this.dm.save();
      }
      if (window.showToast) window.showToast(`${spr.name} 스프라이트가 저장되었습니다.`, 'success');
      if (spr.skillId && this.dm?.data?.skills?.[spr.skillId]) {
        const skill = this.dm.data.skills[spr.skillId];
        if (spr.spriteRole === 'skillIcon') {
          skill.iconKey = spr.key;
        } else if (spr.spriteRole === 'skillEffect') {
          skill.effectKey = spr.key;
          skill.effectSpriteKey = spr.key;
        } else if (spr.spriteRole === 'skillCast') {
          skill.castSpriteKey = spr.key;
        } else if (spr.spriteRole === 'skillTargetHitEffect') {
          if (!skill.impactConfig) skill.impactConfig = {};
          if (!skill.impactConfig.targetHitEffect) skill.impactConfig.targetHitEffect = {};
          skill.impactConfig.targetHitEffect.effectKey = spr.key;
        } else if (spr.spriteRole === 'skillReceiveHitEffect') {
          if (!skill.impactConfig) skill.impactConfig = {};
          if (!skill.impactConfig.receiveHitEffect) skill.impactConfig.receiveHitEffect = {};
          skill.impactConfig.receiveHitEffect.effectKey = spr.key;
        }
        this.dm.save();
      }
      this._renderBrowser();
      this._renderTools();
    } catch (e) {
      if (window.showToast) window.showToast('저장 실패: localStorage 용량 초과', 'error');
    }
  }

  _resetSprite() {
    if (!this.selectedSprite) return;
    const spr = this.selectedSprite;
    const customs = this._getCustomSprites();
    if (customs[spr.key]) {
      delete customs[spr.key];
      localStorage.setItem(CUSTOM_SPRITES_KEY, JSON.stringify(customs));
      if (window.showToast) window.showToast(`${spr.name} 스프라이트가 초기화되었습니다.`, 'info');
    }
    this._loadSprite();
    this._renderBrowser();
    this._renderTools();
  }

  _uploadPNG() {
    if (!this.selectedSprite) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const spr = this.selectedSprite;
          const logicalW = spr.logicalFrameWidth || spr.sourceFrameWidth || spr.frameWidth || img.width;
          const logicalH = spr.logicalFrameHeight || spr.sourceFrameHeight || spr.frameHeight || img.height;
          const expectedFrames = Math.max(1, spr.frames || 1);
          const sourceFrameW = spr.type === 'spritesheet'
            ? (img.width % logicalW === 0 ? logicalW : Math.max(1, Math.floor(img.width / expectedFrames)))
            : img.width;
          const sourceFrameH = spr.type === 'spritesheet' && img.height >= logicalH ? logicalH : img.height;
          const detectedFrames = Math.max(1, spr.type === 'spritesheet' ? Math.floor(img.width / sourceFrameW) : 1);
          if (spr.type === 'spritesheet' && detectedFrames !== spr.frames && window.showToast) {
            window.showToast(`PNG 프레임 수가 다릅니다. 예상: ${spr.frames}, 감지: ${detectedFrames}`, 'info');
          }

          this._pushUndo();
          this._initNativeCanvas(spr.frameWidth * Math.max(1, spr.frames || detectedFrames), spr.frameHeight);
          this._drawImageFramesToWorkspace(img, sourceFrameW, sourceFrameH, detectedFrames, spr);
          this._redrawDisplay();
          if (window.showToast) window.showToast('PNG 업로드 완료', 'success');
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    };
    input.click();
  }

  _downloadPNG() {
    if (!this.nativeCanvas || !this.selectedSprite) return;
    const link = document.createElement('a');
    link.download = `${this.selectedSprite.key}.png`;
    link.href = this.nativeCanvas.toDataURL('image/png');
    link.click();
  }

  _exportAll() {
    const customs = this._getCustomSprites();
    const keys = Object.keys(customs);
    if (keys.length === 0) {
      if (window.showToast) window.showToast('내보낼 커스텀 스프라이트가 없습니다.', 'info');
      return;
    }
    const json = JSON.stringify(customs, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    link.download = 'murim_custom_sprites.json';
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
    if (window.showToast) window.showToast(`${keys.length}개 커스텀 스프라이트를 내보냈습니다.`, 'success');
  }

  _importAll() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const imported = JSON.parse(ev.target.result);
          const existing = this._getCustomSprites();
          const merged = { ...existing, ...imported };
          localStorage.setItem(CUSTOM_SPRITES_KEY, JSON.stringify(merged));
          const count = Object.keys(imported).length;
          if (window.showToast) window.showToast(`${count}개 스프라이트를 가져왔습니다.`, 'success');
          this._renderBrowser();
          this._renderTools();
          if (this.selectedSprite) this._loadSprite();
        } catch {
          if (window.showToast) window.showToast('잘못된 JSON 파일입니다.', 'error');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  // =========================================================================
  // Keyboard
  // =========================================================================

  _handleKeyboard(e) {
    // Only handle when sprite editor is active
    if (!this.container || !this.container.classList.contains('active')) return;
    const tag = e.target?.tagName?.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

    const key = e.key.toLowerCase();
    if (e.ctrlKey && key === 'z') {
      e.preventDefault();
      this._undo();
    } else if (e.ctrlKey && key === 'y') {
      e.preventDefault();
      this._redo();
    } else if (e.ctrlKey && key === 'c') {
      e.preventDefault();
      this._copyFrame();
    } else if (e.ctrlKey && key === 'v') {
      e.preventDefault();
      this._pasteFrame();
    } else if (e.altKey && e.key === 'ArrowUp') {
      e.preventDefault();
      this._shiftFrame(0, -1);
    } else if (e.altKey && e.key === 'ArrowDown') {
      e.preventDefault();
      this._shiftFrame(0, 1);
    } else if (e.altKey && e.key === 'ArrowLeft') {
      e.preventDefault();
      this._shiftFrame(-1, 0);
    } else if (e.altKey && e.key === 'ArrowRight') {
      e.preventDefault();
      this._shiftFrame(1, 0);
    }
  }

  // =========================================================================
  // Helpers
  // =========================================================================

  _addRecentColor(color) {
    this.recentColors = [color, ...this.recentColors.filter(c => c !== color)].slice(0, 12);
  }

  // =========================================================================
  // Create New Sprite
  // =========================================================================

  _createNewSprite() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal" style="max-width:400px;">
        <div class="modal-header">
          <h3>새 스프라이트 생성</h3>
          <button class="btn btn-secondary btn-small modal-close-btn">X</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>스프라이트 이름 (= 파일명, 영문)</label>
            <input type="text" id="newSprName" placeholder="예: equip_weapon_katana" style="width:100%;">
            <small style="color:var(--text-dim);font-size:10px;">게임에서 사용될 키 이름. 영문, 밑줄(_) 사용</small>
          </div>
          <div class="form-group">
            <label>카테고리</label>
            <select id="newSprCategory" style="width:100%;">
              ${CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}
            </select>
          </div>
          <div class="form-row" style="display:flex;gap:10px;">
            <div class="form-group" style="flex:1;">
              <label>프레임 너비 (px)</label>
              <input type="number" id="newSprFrameW" value="32" min="1" max="4096">
            </div>
            <div class="form-group" style="flex:1;">
              <label>프레임 높이 (px)</label>
              <input type="number" id="newSprFrameH" value="64" min="1" max="4096">
            </div>
          </div>
          <div class="form-group">
            <label>프레임 수 (1 = 정적 이미지)</label>
            <input type="number" id="newSprFrames" value="1" min="1" max="32">
          </div>
          <div class="form-group">
            <label>PNG 업로드 (선택사항)</label>
            <input type="file" id="newSprFile" accept=".png,image/png">
            <small style="color:var(--text-dim);font-size:10px;">비워두면 빈 캔버스로 시작</small>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary modal-close-btn">취소</button>
          <button class="btn btn-primary" id="createSprBtn">생성</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    overlay.querySelectorAll('.modal-close-btn').forEach(b => b.onclick = () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

    overlay.querySelector('#createSprBtn').addEventListener('click', () => {
      const name = overlay.querySelector('#newSprName').value.trim();
      if (!name) { window.showToast('이름을 입력해주세요.', 'error'); return; }
      if (!/^[a-zA-Z0-9_]+$/.test(name)) { window.showToast('영문, 숫자, 밑줄(_)만 사용 가능합니다.', 'error'); return; }

      // Check duplicate
      if (SPRITE_REGISTRY.find(s => s.key === name)) {
        window.showToast('이미 존재하는 키입니다.', 'error');
        return;
      }

      const category = overlay.querySelector('#newSprCategory').value;
      const frameW = parseInt(overlay.querySelector('#newSprFrameW').value) || DEFAULT_ACTOR_WIDTH;
      const frameH = parseInt(overlay.querySelector('#newSprFrameH').value) || DEFAULT_ACTOR_HEIGHT;
      const frames = parseInt(overlay.querySelector('#newSprFrames').value) || 1;
      const type = frames > 1 ? 'spritesheet' : 'static';

      // Add to registry
      const newEntry = this._ensureRegistryEntry({
        key: name,
        category,
        name,
        path: null,
        frameWidth: frameW,
        frameHeight: frameH,
        logicalFrameWidth: frameW,
        logicalFrameHeight: frameH,
        workspaceMode: 'infinite-centered',
        frames,
        type,
        isCustom: true,
      });

      // Handle file upload or blank canvas
      const file = overlay.querySelector('#newSprFile').files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = frameW * frames;
            canvas.height = frameH;
            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = false;
            const sourceFrameW = type === 'spritesheet'
              ? (img.width % frameW === 0 ? frameW : Math.max(1, Math.floor(img.width / frames)))
              : img.width;
            const sourceFrameH = type === 'spritesheet' && img.height >= frameH ? frameH : img.height;
            const availableFrames = Math.max(1, Math.floor(img.width / sourceFrameW));
            for (let frame = 0; frame < frames; frame++) {
              const sourceFrame = Math.min(frame, availableFrames - 1);
              ctx.drawImage(
                img,
                sourceFrame * sourceFrameW,
                0,
                Math.min(sourceFrameW, img.width - sourceFrame * sourceFrameW),
                Math.min(sourceFrameH, img.height),
                frame * frameW,
                0,
                frameW,
                frameH
              );
            }

            const customs = this._getCustomSprites();
            customs[name] = {
              dataUrl: canvas.toDataURL('image/png'),
              width: canvas.width,
              height: canvas.height,
              frameWidth: frameW,
              frameHeight: frameH,
              logicalFrameWidth: frameW,
              logicalFrameHeight: frameH,
              workspaceMode: 'infinite-centered',
              category,
            };
            localStorage.setItem(CUSTOM_SPRITES_KEY, JSON.stringify(customs));

            this.selectedSprite = newEntry;
            this.expandedCategories[category] = true;
            overlay.remove();
            this._renderBrowser();
            this._renderCenter();
            this._renderTools();
            window.showToast(`스프라이트 "${name}" 생성 완료!`, 'success');
          };
          img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
      } else {
        // Blank canvas
        const w = frameW * frames;
        const h = frameH;
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;

        const customs = this._getCustomSprites();
        customs[name] = {
          dataUrl: canvas.toDataURL('image/png'),
          width: w,
          height: h,
          frameWidth: frameW,
          frameHeight: frameH,
          logicalFrameWidth: frameW,
          logicalFrameHeight: frameH,
          workspaceMode: 'infinite-centered',
          category,
        };
        localStorage.setItem(CUSTOM_SPRITES_KEY, JSON.stringify(customs));

        this.selectedSprite = newEntry;
        this.expandedCategories[category] = true;
        overlay.remove();
        this._renderBrowser();
        this._renderCenter();
        this._renderTools();
        window.showToast(`스프라이트 "${name}" 생성 완료 (빈 캔버스)!`, 'success');
      }
    });
  }
}
