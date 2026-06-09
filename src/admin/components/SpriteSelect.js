// Shared searchable sprite selector for admin data links.

const CUSTOM_SPRITES_KEY = 'murimAdventure_customSprites';

const BUILTIN_SPRITES = [
  { key: 'player_base', name: '메인 캐릭터', category: '캐릭터' },
  { key: 'player_box', name: '메인 캐릭터 박스', category: '캐릭터' },
  { key: 'npc_elder', name: '촌장', category: 'NPC' },
  { key: 'npc_blacksmith', name: '대장장이', category: 'NPC' },
  { key: 'npc_merchant', name: '상인', category: 'NPC' },
  { key: 'npc_guard', name: '경비병', category: 'NPC' },
  { key: 'npc_herbalist', name: '약초꾼', category: 'NPC' },
  { key: 'monster_box', name: '몬스터 박스', category: '몬스터' },
  { key: 'monster_box_aggressive', name: '공격형 몬스터 박스', category: '몬스터' },
  { key: 'orc', name: '오크', category: '몬스터' },
  { key: 'orc_warrior', name: '오크 전사', category: '몬스터' },
  { key: 'orc_shaman', name: '오크 주술사', category: '몬스터' },
  { key: 'orc_rogue', name: '오크 도적', category: '몬스터' },
  { key: 'skeleton_base', name: '해골', category: '몬스터' },
  { key: 'skeleton_warrior', name: '해골 전사', category: '몬스터' },
  { key: 'skeleton_mage', name: '해골 마법사', category: '몬스터' },
  { key: 'skeleton_rogue', name: '해골 도적', category: '몬스터' },
  { key: 'equip_weapon_sword', name: '검 장비', category: '장비' },
  { key: 'equip_weapon_spear', name: '창 장비', category: '장비' },
  { key: 'equip_weapon_dual', name: '쌍수 장비', category: '장비' },
  { key: 'equip_weapon_staff', name: '지팡이 장비', category: '장비' },
  { key: 'equip_helmet_basic', name: '기본 투구', category: '장비' },
  { key: 'equip_armor_basic', name: '기본 갑옷', category: '장비' },
  { key: 'equip_shield_basic', name: '기본 방패', category: '장비' },
  { key: 'icon_sword', name: '검 아이콘', category: '아이콘' },
  { key: 'icon_staff', name: '지팡이 아이콘', category: '아이콘' },
  { key: 'icon_armor', name: '갑옷 아이콘', category: '아이콘' },
  { key: 'icon_potion', name: '물약 아이콘', category: '아이콘' },
  { key: 'icon_hp_potion', name: '체력 회복 아이콘', category: '아이콘' },
  { key: 'icon_mp_potion', name: '내력 회복 아이콘', category: '아이콘' },
  { key: 'slash', name: '기본 슬래시', category: '이펙트' },
  { key: 'fx_slash', name: '슬래시 이펙트', category: '이펙트' },
  { key: 'fx_heavy_slash', name: '강한 슬래시', category: '이펙트' },
  { key: 'fx_double_slash', name: '더블 슬래시', category: '이펙트' },
  { key: 'fx_hit', name: '피격 이펙트', category: '이펙트' },
  { key: 'fx_fire', name: '화염 이펙트', category: '이펙트' },
  { key: 'fx_ice', name: '빙결 이펙트', category: '이펙트' },
  { key: 'fx_lightning', name: '번개 이펙트', category: '이펙트' },
  { key: 'fx_wind', name: '바람 이펙트', category: '이펙트' },
  { key: 'fx_earth', name: '대지 이펙트', category: '이펙트' },
  { key: 'fx_dark', name: '암흑 이펙트', category: '이펙트' },
  { key: 'fx_light', name: '빛 이펙트', category: '이펙트' },
  { key: 'fx_poison', name: '독 이펙트', category: '이펙트' },
  { key: 'fx_heal', name: '회복 이펙트', category: '이펙트' },
  { key: 'skill_effect_red', name: '빨강 스킬 이펙트', category: '스킬' },
  { key: 'skill_effect_blue', name: '파랑 스킬 이펙트', category: '스킬' },
  { key: 'skill_effect_green', name: '초록 스킬 이펙트', category: '스킬' },
  { key: 'skill_effect_yellow', name: '노랑 스킬 이펙트', category: '스킬' },
  { key: 'skill_effect_purple', name: '보라 스킬 이펙트', category: '스킬' },
  { key: 'portal', name: '포탈', category: '맵' },
  { key: 'item_pickup', name: '아이템 드랍', category: '아이템' },
];

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[ch]));
}

function readCustomSprites() {
  try {
    const saved = JSON.parse(localStorage.getItem(CUSTOM_SPRITES_KEY) || '{}');
    return Object.entries(saved).map(([key, sprite]) => ({
      key,
      name: sprite?.name || sprite?.nameKo || key,
      category: sprite?.category || '커스텀',
    }));
  } catch {
    return [];
  }
}

export function getSpriteOptions(extraOptions = []) {
  const map = new Map();
  [...BUILTIN_SPRITES, ...readCustomSprites(), ...extraOptions].forEach(option => {
    if (!option?.key || map.has(option.key)) return;
    map.set(option.key, {
      key: option.key,
      name: option.name || option.nameKo || option.key,
      category: option.category || '기타',
    });
  });
  return [...map.values()].sort((a, b) => {
    const cat = a.category.localeCompare(b.category, 'ko');
    return cat || a.key.localeCompare(b.key, 'ko');
  });
}

export function spriteSelectHtml({ id, value = '', placeholder = '스프라이트 검색 또는 선택...' }) {
  return `
    <div class="sprite-select-wrap" data-sprite-select="${escapeHtml(id)}" style="position:relative;">
      <input type="text" id="${escapeHtml(id)}" value="${escapeHtml(value)}" placeholder="${escapeHtml(placeholder)}" autocomplete="off">
      <div class="sprite-select-dropdown" style="display:none;position:absolute;left:0;right:0;top:100%;z-index:10010;max-height:220px;overflow:auto;background:var(--bg-panel);border:1px solid var(--border);border-radius:4px;box-shadow:0 10px 24px rgba(0,0,0,0.35);"></div>
    </div>
  `;
}

export function bindSpriteSelect(root, inputId, options = {}) {
  const input = root.querySelector(`#${inputId}`);
  const wrap = input?.closest('.sprite-select-wrap');
  const dropdown = wrap?.querySelector('.sprite-select-dropdown');
  if (!input || !dropdown) return;

  const allOptions = getSpriteOptions(options.extraOptions || []);
  const allowEmpty = options.allowEmpty !== false;

  const render = () => {
    const q = input.value.trim().toLowerCase();
    const filtered = allOptions.filter(option => {
      const text = `${option.key} ${option.name} ${option.category}`.toLowerCase();
      return !q || text.includes(q);
    }).slice(0, 80);

    const emptyRow = allowEmpty ? `
      <div class="sprite-select-option" data-key="" style="padding:8px 10px;cursor:pointer;border-bottom:1px solid var(--border);color:var(--text-dim);">
        연결 없음
      </div>
    ` : '';

    dropdown.innerHTML = emptyRow + (filtered.length ? filtered.map(option => `
      <div class="sprite-select-option" data-key="${escapeHtml(option.key)}" style="padding:8px 10px;cursor:pointer;border-bottom:1px solid var(--border);">
        <div style="font-size:12px;font-weight:700;color:var(--text);">${escapeHtml(option.name)}</div>
        <div style="font-size:10px;color:var(--text-dim);">${escapeHtml(option.key)} · ${escapeHtml(option.category)}</div>
      </div>
    `).join('') : `
      <div style="padding:10px;color:var(--text-dim);font-size:12px;">검색 결과가 없습니다. 직접 입력해서 저장할 수 있습니다.</div>
    `);

    dropdown.querySelectorAll('.sprite-select-option').forEach(row => {
      row.onmouseenter = () => { row.style.background = 'var(--bg-dark)'; };
      row.onmouseleave = () => { row.style.background = 'transparent'; };
      row.onclick = () => {
        input.value = row.dataset.key || '';
        dropdown.style.display = 'none';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        options.onSelect?.(input.value);
      };
    });

    dropdown.style.display = 'block';
  };

  input.addEventListener('focus', render);
  input.addEventListener('input', () => {
    render();
    options.onInput?.(input.value);
  });
  input.addEventListener('blur', () => {
    setTimeout(() => { dropdown.style.display = 'none'; }, 160);
  });
}
