// =============================================================================
// SpriteEditor - 스프라이트 관리 (Pixel Art Editor)
// =============================================================================

const CUSTOM_SPRITES_KEY = 'murimAdventure_customSprites';

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

const CATEGORIES = ['캐릭터', '몬스터', 'NPC', '타일', '장비', '이펙트', '아이콘', '기타'];

const EQUIP_ANIM_SETS = [
  { type: 'idle', nameKo: '대기', dirs: ['down', 'side', 'up'], frames: [4, 4, 4] },
  { type: 'walk', nameKo: '걷기', dirs: ['down', 'side', 'up'], frames: [6, 6, 6] },
  { type: 'slice', nameKo: '공격', dirs: ['down', 'side', 'up'], frames: [4, 4, 4] },
];

const DIR_NAME_KO = { down: '아래', side: '옆', up: '위' };

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

export class SpriteEditor {
  constructor(dataManager) {
    this.dm = dataManager;
    this.selectedSprite = null;
    this.expandedCategories = { '캐릭터': true };
    this.currentTool = 'pencil';
    this.currentColor = '#000000';
    this.brushSize = 1;
    this.zoom = 8;
    this.showGrid = true;
    this.showCharGuide = false;
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
    this.isDrawing = false;
    this.lastPixel = null;
    this.lineStart = null;
    this.rectStart = null;
    this.container = null;
    this._boundKeyHandler = null;
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

  _renderBrowser() {
    const browser = document.getElementById('sprBrowser');
    if (!browser) return;
    const customSprites = this._getCustomSprites();

    // Add custom sprites not in registry
    for (const key of Object.keys(customSprites)) {
      if (!SPRITE_REGISTRY.find(s => s.key === key)) {
        const data = customSprites[key];
        SPRITE_REGISTRY.push({
          key,
          category: '커스텀',
          name: key,
          path: null,
          frameWidth: data.frameWidth || data.width || 64,
          frameHeight: data.frameHeight || data.height || 64,
          frames: data.frameWidth ? Math.max(1, Math.floor(data.width / data.frameWidth)) : 1,
          type: (data.frameWidth && data.width > data.frameWidth) ? 'spritesheet' : 'static',
          isCustom: true,
        });
      }
    }
    // Ensure 커스텀 category is listed
    if (!CATEGORIES.includes('커스텀') && SPRITE_REGISTRY.some(s => s.category === '커스텀')) {
      CATEGORIES.push('커스텀');
    }

    let html = '<div style="font-size:12px;color:var(--gold);font-weight:700;margin-bottom:8px;padding:4px;">카테고리</div>';

    for (const cat of CATEGORIES) {
      const expanded = this.expandedCategories[cat];
      const sprites = SPRITE_REGISTRY.filter(s => s.category === cat);
      html += `<div class="spr-cat" data-cat="${cat}" style="cursor:pointer;padding:6px 8px;font-size:13px;color:var(--text);display:flex;align-items:center;gap:6px;border-radius:4px;${expanded ? 'background:var(--bg-hover);' : ''}"
        ><span style="font-size:10px;transition:transform 0.2s;display:inline-block;${expanded ? 'transform:rotate(90deg);' : ''}">\u25B6</span> ${cat} <span style="font-size:11px;color:var(--text-dim);margin-left:auto;">${sprites.length}</span></div>`;
      if (expanded) {
        html += '<div style="padding-left:12px;">';
        for (const spr of sprites) {
          const isSelected = this.selectedSprite && this.selectedSprite.key === spr.key;
          const hasCustom = !!customSprites[spr.key];
          html += `<div class="spr-item" data-key="${spr.key}" style="cursor:pointer;padding:4px 8px;font-size:12px;border-radius:3px;display:flex;align-items:center;gap:4px;
            ${isSelected ? 'background:var(--bg-panel);color:var(--gold);border-left:2px solid var(--gold);' : 'color:var(--text-dim);border-left:2px solid transparent;'}
            ">${hasCustom ? '<span style="color:var(--accent-green);font-size:8px;">\u25CF</span>' : ''}${spr.name}</div>`;
        }
        html += '</div>';
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
      <span style="color:var(--text-dim);">${spr.frameWidth}x${spr.frameHeight}</span>
      ${spr.type === 'spritesheet' ? `<span style="color:var(--text-dim);">${spr.frames} 프레임</span>` : ''}
      ${!spr.path ? '<span style="color:var(--accent-orange);font-size:11px;">프로그래밍 생성 텍스처</span>' : ''}
    `;
    center.appendChild(infoBar);

    // Canvas area
    const canvasWrap = document.createElement('div');
    canvasWrap.style.cssText = 'flex:1;overflow:auto;display:flex;align-items:center;justify-content:center;background:var(--bg-darkest);position:relative;';
    canvasWrap.id = 'sprCanvasWrap';

    // Checkerboard background container
    const canvasContainer = document.createElement('div');
    canvasContainer.style.cssText = 'position:relative;';
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
        <button class="btn btn-secondary btn-small" id="sprPrevFrame">\u25C0</button>
        <span id="sprFrameInfo" style="min-width:60px;text-align:center;">프레임 ${this.currentFrame + 1}/${spr.frames}</span>
        <button class="btn btn-secondary btn-small" id="sprNextFrame">\u25B6</button>
        <span style="color:var(--border);margin:0 4px;">|</span>
        <button class="btn btn-secondary btn-small" id="sprPlayBtn">\u25B6 재생</button>
        <button class="btn btn-secondary btn-small" id="sprStopBtn">\u23F8 정지</button>
        <label style="display:flex;align-items:center;gap:4px;color:var(--text-dim);">속도:
          <input type="range" min="1" max="24" value="${this.animSpeed}" id="sprAnimSpeed" style="width:80px;">
          <span id="sprAnimSpeedVal">${this.animSpeed}fps</span>
        </label>
      `;
      center.appendChild(frameBar);

      // Bind frame events
      setTimeout(() => {
        document.getElementById('sprPrevFrame')?.addEventListener('click', () => {
          this.currentFrame = (this.currentFrame - 1 + spr.frames) % spr.frames;
          this._updateFrameDisplay();
        });
        document.getElementById('sprNextFrame')?.addEventListener('click', () => {
          this.currentFrame = (this.currentFrame + 1) % spr.frames;
          this._updateFrameDisplay();
        });
        document.getElementById('sprPlayBtn')?.addEventListener('click', () => this._startAnimation());
        document.getElementById('sprStopBtn')?.addEventListener('click', () => this._stopAnimation());
        document.getElementById('sprAnimSpeed')?.addEventListener('input', (e) => {
          this.animSpeed = parseInt(e.target.value);
          document.getElementById('sprAnimSpeedVal').textContent = this.animSpeed + 'fps';
          if (this.isPlaying) { this._stopAnimation(); this._startAnimation(); }
        });
      }, 0);
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

    // Zoom
    html += '<div style="font-size:11px;color:var(--gold);font-weight:700;margin-bottom:8px;">줌</div>';
    html += '<div style="display:flex;gap:4px;margin-bottom:8px;">';
    for (const z of [4, 8, 12, 16]) {
      const active = this.zoom === z;
      html += `<button class="spr-zoom-btn btn btn-small ${active ? 'btn-primary' : 'btn-secondary'}" data-zoom="${z}">${z}x</button>`;
    }
    html += '</div>';

    // Grid toggle
    html += `<div style="margin-bottom:8px;">
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:12px;color:var(--text-dim);">
        <input type="checkbox" id="sprGridToggle" ${this.showGrid ? 'checked' : ''}>
        그리드 표시
      </label>
    </div>`;

    // Character guide toggle (only for equipment sprites)
    if (this._isEquipmentSprite()) {
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
    tools.querySelectorAll('.spr-zoom-btn').forEach(el => {
      el.addEventListener('click', () => {
        this.zoom = parseInt(el.dataset.zoom);
        this._redrawDisplay();
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
    document.getElementById('sprCharGuide')?.addEventListener('change', (e) => {
      this.showCharGuide = e.target.checked;
      this._redrawDisplay();
    });
    document.getElementById('sprUndo')?.addEventListener('click', () => this._undo());
    document.getElementById('sprRedo')?.addEventListener('click', () => this._redo());
  }

  // =========================================================================
  // Sprite Loading
  // =========================================================================

  _isEquipmentSprite() {
    return this.selectedSprite && (this.selectedSprite.category === '장비' || this.selectedSprite.category === '커스텀');
  }

  /**
   * Check if the selected sprite is a base equipment sprite (not an animation variant).
   * Base sprites have keys like equip_weapon_sword but NOT equip_weapon_sword_idle_down.
   */
  _isEquipmentBaseSprite() {
    if (!this.selectedSprite || this.selectedSprite.category !== '장비') return false;
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
    };

    try {
      localStorage.setItem(CUSTOM_SPRITES_KEY, JSON.stringify(customs));
    } catch (e) {
      if (window.showToast) window.showToast('저장 실패: localStorage 용량 초과', 'error');
      return;
    }

    // Add to sprite registry if not already there
    if (!SPRITE_REGISTRY.find(s => s.key === animKey)) {
      SPRITE_REGISTRY.push({
        key: animKey,
        category: '장비',
        name: animKey,
        path: null,
        frameWidth: frameW,
        frameHeight: frameH,
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
          frames: data.frameWidth ? Math.max(1, Math.floor(data.width / data.frameWidth)) : 1,
          type: 'spritesheet',
          isCustom: true,
        };
        SPRITE_REGISTRY.push(entry);
      }
    }
    if (!entry) {
      if (window.showToast) window.showToast('스프라이트를 찾을 수 없습니다.', 'error');
      return;
    }

    this.selectedSprite = entry;
    this.currentFrame = 0;
    this._stopAnimation();
    this.expandedCategories['장비'] = true;
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
    this._charGuideImage = null;
    this._charGuideAnimType = animType;
    this._charGuideAnimDir = dir;

    const charKey = `char_${animType}_${dir}`;
    const customs = this._getCustomSprites();

    // Find the character spritesheet entry for frame info
    const charEntry = SPRITE_REGISTRY.find(s => s.key === charKey);

    const guideSrc = customs[charKey]
      ? customs[charKey].dataUrl
      : (charEntry && charEntry.path ? charEntry.path : null);

    if (!guideSrc) {
      // Fallback to idle_down
      this._loadCharGuide();
      return;
    }

    const img = new Image();
    img.onload = () => {
      this._charGuideImage = img;
      this._charGuideIsAnimSheet = true;
      this._charGuideFrameWidth = charEntry ? charEntry.frameWidth : 64;
      this._charGuideFrameHeight = charEntry ? charEntry.frameHeight : 64;
      this._charGuideFrames = charEntry ? charEntry.frames : 1;
      this._redrawDisplay();
    };
    img.onerror = () => {
      // Fallback to idle_down
      this._loadCharGuide();
    };
    img.src = guideSrc;
  }

  _loadCharGuide() {
    // Load character idle_down sprite as guide overlay for equipment editing
    this._charGuideImage = null;
    this._charGuideIsAnimSheet = false;
    this._charGuideAnimType = null;
    this._charGuideAnimDir = null;
    const customs = this._getCustomSprites();
    const guideSrc = customs['char_idle_down']
      ? customs['char_idle_down'].dataUrl
      : 'assets/char/Idle_Down.png';

    const img = new Image();
    img.onload = () => {
      this._charGuideImage = img;
      this._charGuideIsAnimSheet = false;
      this._redrawDisplay();
    };
    img.src = guideSrc;
  }

  _loadSprite() {
    if (!this.selectedSprite) return;
    const spr = this.selectedSprite;

    // Load character guide for equipment sprites
    if (this._isEquipmentSprite()) {
      this.showCharGuide = true;
      // Check if this is an equipment animation sprite
      const animInfo = this._parseEquipAnimKey(spr.key);
      if (animInfo) {
        // Load the matching character animation as guide
        this._loadCharGuideForAnim(animInfo.animType, animInfo.dir);
      } else {
        this._loadCharGuide();
      }
    } else {
      this.showCharGuide = false;
      this._charGuideImage = null;
      this._charGuideIsAnimSheet = false;
    }
    const customs = this._getCustomSprites();

    if (customs[spr.key]) {
      // Load custom sprite
      const img = new Image();
      img.onload = () => {
        this._initNativeCanvas(img.width, img.height);
        this.nativeCtx.drawImage(img, 0, 0);
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
        this.nativeCtx.drawImage(img, 0, 0, w, h);
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
      // Programmatic sprite - blank canvas
      const w = spr.type === 'spritesheet' ? spr.frameWidth * spr.frames : spr.frameWidth;
      const h = spr.frameHeight;
      this._initNativeCanvas(w, h);
      this.undoStack = [];
      this.redoStack = [];
      this._redrawDisplay();
      this._renderTools();
    }
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

    // For spritesheets, show only the current frame
    const srcX = isSheet ? this.currentFrame * spr.frameWidth : 0;
    const srcY = 0;
    const srcW = spr.frameWidth;
    const srcH = spr.frameHeight;

    const dw = srcW * this.zoom;
    const dh = srcH * this.zoom;

    this.displayCanvas.width = dw;
    this.displayCanvas.height = dh;
    this.displayCtx = this.displayCanvas.getContext('2d');
    this.displayCtx.imageSmoothingEnabled = false;

    // Draw checkerboard background
    const checkSize = this.zoom;
    for (let y = 0; y < dh; y += checkSize) {
      for (let x = 0; x < dw; x += checkSize) {
        const px = Math.floor(x / this.zoom);
        const py = Math.floor(y / this.zoom);
        this.displayCtx.fillStyle = (px + py) % 2 === 0 ? '#2a2a2a' : '#3a3a3a';
        this.displayCtx.fillRect(x, y, checkSize, checkSize);
      }
    }

    // Draw character guide overlay for equipment sprites
    if (this._isEquipmentSprite() && this._charGuideImage && this.showCharGuide) {
      this.displayCtx.globalAlpha = 0.3;

      if (this._charGuideIsAnimSheet && this._charGuideFrameWidth) {
        // Animation-specific guide: show the matching frame from the character spritesheet
        const guideFrameIdx = Math.min(this.currentFrame, this._charGuideFrames - 1);
        const guideSrcX = guideFrameIdx * this._charGuideFrameWidth;
        this.displayCtx.drawImage(
          this._charGuideImage,
          guideSrcX, 0, this._charGuideFrameWidth, this._charGuideFrameHeight,
          0, 0, dw, dh
        );
      } else {
        // Static guide: show first frame of idle_down
        this.displayCtx.drawImage(
          this._charGuideImage,
          0, 0, spr.frameWidth, spr.frameHeight,
          0, 0, dw, dh
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
      const headY = Math.round(spr.frameHeight * 0.1) * this.zoom;
      const neckY = Math.round(spr.frameHeight * 0.3) * this.zoom;
      const waistY = Math.round(spr.frameHeight * 0.6) * this.zoom;
      const kneeY = Math.round(spr.frameHeight * 0.75) * this.zoom;
      this.displayCtx.beginPath();
      this.displayCtx.moveTo(0, headY); this.displayCtx.lineTo(dw, headY);
      this.displayCtx.moveTo(0, neckY); this.displayCtx.lineTo(dw, neckY);
      this.displayCtx.moveTo(0, waistY); this.displayCtx.lineTo(dw, waistY);
      this.displayCtx.moveTo(0, kneeY); this.displayCtx.lineTo(dw, kneeY);
      this.displayCtx.stroke();
      this.displayCtx.setLineDash([]);

      // Region labels
      this.displayCtx.fillStyle = 'rgba(0, 200, 255, 0.5)';
      this.displayCtx.font = '10px monospace';
      this.displayCtx.fillText('투구', 2, headY + 12);
      this.displayCtx.fillText('갑옷', 2, neckY + 12);
      this.displayCtx.fillText('허리', 2, waistY + 12);
      this.displayCtx.fillText('신발', 2, kneeY + 12);
    }

    // Draw sprite scaled
    this.displayCtx.drawImage(
      this.nativeCanvas,
      srcX, srcY, srcW, srcH,
      0, 0, dw, dh
    );

    // Draw grid
    if (this.showGrid && this.zoom >= 4) {
      this.displayCtx.strokeStyle = 'rgba(255,255,255,0.08)';
      this.displayCtx.lineWidth = 1;
      for (let x = 0; x <= dw; x += this.zoom) {
        this.displayCtx.beginPath();
        this.displayCtx.moveTo(x + 0.5, 0);
        this.displayCtx.lineTo(x + 0.5, dh);
        this.displayCtx.stroke();
      }
      for (let y = 0; y <= dh; y += this.zoom) {
        this.displayCtx.beginPath();
        this.displayCtx.moveTo(0, y + 0.5);
        this.displayCtx.lineTo(dw, y + 0.5);
        this.displayCtx.stroke();
      }
    }
  }

  _updateFrameDisplay() {
    const info = document.getElementById('sprFrameInfo');
    if (info && this.selectedSprite) {
      info.textContent = `프레임 ${this.currentFrame + 1}/${this.selectedSprite.frames}`;
    }
    this._redrawDisplay();
  }

  // =========================================================================
  // Canvas Drawing Tools
  // =========================================================================

  _displayToNative(e) {
    const rect = this.displayCanvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    let px = Math.floor(mx / this.zoom);
    let py = Math.floor(my / this.zoom);

    // Offset for spritesheet frame
    const spr = this.selectedSprite;
    if (spr && spr.type === 'spritesheet' && spr.frames > 1) {
      px += this.currentFrame * spr.frameWidth;
    }
    return { px, py };
  }

  _onCanvasMouseDown(e) {
    if (!this.nativeCanvas || this.isPlaying) return;
    e.preventDefault();
    this.isDrawing = true;
    const { px, py } = this._displayToNative(e);

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
    const { px, py } = this._displayToNative(e);

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
    };
    try {
      localStorage.setItem(CUSTOM_SPRITES_KEY, JSON.stringify(customs));
      if (window.showToast) window.showToast(`${spr.name} 스프라이트가 저장되었습니다.`, 'success');
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
          // Validate dimensions for spritesheets
          if (spr.type === 'spritesheet') {
            if (img.height !== spr.frameHeight) {
              if (window.showToast) window.showToast(`높이가 ${spr.frameHeight}px 이어야 합니다. (현재: ${img.height}px)`, 'error');
              return;
            }
            if (img.width % spr.frameWidth !== 0) {
              if (window.showToast) window.showToast(`너비가 ${spr.frameWidth}의 배수여야 합니다. (현재: ${img.width}px)`, 'error');
              return;
            }
            // Auto-detect frame count
            const detectedFrames = img.width / spr.frameWidth;
            if (detectedFrames !== spr.frames) {
              if (window.showToast) window.showToast(`프레임 수가 다릅니다. (예상: ${spr.frames}, 감지: ${detectedFrames})`, 'info');
            }
          }

          this._pushUndo();
          this._initNativeCanvas(img.width, img.height);
          this.nativeCtx.drawImage(img, 0, 0);
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

    if (e.ctrlKey && e.key === 'z') {
      e.preventDefault();
      this._undo();
    } else if (e.ctrlKey && e.key === 'y') {
      e.preventDefault();
      this._redo();
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
              <input type="number" id="newSprFrameW" value="64" min="8" max="256">
            </div>
            <div class="form-group" style="flex:1;">
              <label>프레임 높이 (px)</label>
              <input type="number" id="newSprFrameH" value="64" min="8" max="256">
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
      const frameW = parseInt(overlay.querySelector('#newSprFrameW').value) || 64;
      const frameH = parseInt(overlay.querySelector('#newSprFrameH').value) || 64;
      const frames = parseInt(overlay.querySelector('#newSprFrames').value) || 1;
      const type = frames > 1 ? 'spritesheet' : 'static';

      // Add to registry
      const newEntry = {
        key: name,
        category,
        name,
        path: null,
        frameWidth: frameW,
        frameHeight: frameH,
        frames,
        type,
        isCustom: true,
      };
      SPRITE_REGISTRY.push(newEntry);

      // Handle file upload or blank canvas
      const file = overlay.querySelector('#newSprFile').files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            const customs = this._getCustomSprites();
            customs[name] = {
              dataUrl: canvas.toDataURL('image/png'),
              width: img.width,
              height: img.height,
              frameWidth: frameW,
              frameHeight: frameH,
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
