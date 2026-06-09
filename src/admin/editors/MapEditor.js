// =============================================================================
// MapEditor - 맵 에디터
// =============================================================================

import { getAllMaps } from '../../game/data/mapData.js';

const TILE_TYPES = {
  0:  { name: '빈칸',   color: '#111111' },
  1:  { name: '잔디',   color: '#2d5a1e' },
  2:  { name: '흙',     color: '#8b6914' },
  3:  { name: '돌',     color: '#666666' },
  4:  { name: '물',     color: '#1a5276' },
  5:  { name: '벽',     color: '#4a3728' },
  6:  { name: '나무',   color: '#1a4a1a' },
  7:  { name: '모래',   color: '#c2b280' },
  8:  { name: '눈',     color: '#dcdcdc' },
  9:  { name: '용암',   color: '#cc3300' },
  10: { name: '대나무', color: '#3a7a3a' },
  11: { name: '기와',   color: '#8b4513' },
};

const SPAWN_TYPES = {
  player:   { name: '플레이어', color: '#00ff00', symbol: 'P' },
  monster:  { name: '몬스터',   color: '#ff4444', symbol: 'M' },
  npc:      { name: 'NPC',      color: '#4488ff', symbol: 'N' },
  item:     { name: '아이템',   color: '#ffaa00', symbol: 'I' },
  portal:   { name: '포탈',     color: '#66ccff', symbol: 'T' },
};

const LAYERS = ['ground', 'objects', 'collision'];

function convertGameMapToEditorMap(gameMap) {
  const gameTileToEditor = { 0: 1, 1: 2, 2: 3, 3: 4, 4: 5, 5: 6 };
  const w = gameMap.width || 20;
  const h = gameMap.height || 15;
  const ground = new Array(w * h).fill(1);
  const objects = new Array(w * h).fill(0);
  const collision = new Array(w * h).fill(0);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const gameTile = gameMap.tiles?.[y]?.[x] ?? 0;
      const editorTile = gameTileToEditor[gameTile] ?? 1;
      ground[y * w + x] = editorTile;
      if (editorTile === 4 || editorTile === 5 || editorTile === 6) {
        collision[y * w + x] = 1;
      }
    }
  }

  return {
    id: gameMap.id,
    name: gameMap.nameKo || gameMap.id,
    width: w,
    height: h,
    tileSize: 32,
    module_id: gameMap.module_id || 'world_system',
    layers: { ground, objects, collision },
    spawnPoints: {
      player: gameMap.spawns?.player ? { ...gameMap.spawns.player } : { x: 1, y: 1 },
      monsters: gameMap.spawns?.monsters ? gameMap.spawns.monsters.map(sp => ({ ...sp })) : [],
      npcs: gameMap.npcs ? gameMap.npcs.map(n => ({ npcId: n.id, x: n.tileX, y: n.tileY })) : [],
      items: [],
      portals: gameMap.portals ? gameMap.portals.map(p => ({ ...p })) : [],
    },
  };
}

export class MapEditor {
  constructor(dataManager) {
    this.dm = dataManager;
    this.currentMapIdx = 0;
    this.selectedTile = 1;
    this.currentLayer = 'ground';
    this.tool = 'paint'; // paint | erase | fill | spawn
    this.spawnType = 'player';
    this.zoom = 1.0;
    this.isPainting = false;
    this.canvas = null;
    this.ctx = null;
    this.gridWidth = 20;
    this.gridHeight = 15;
    this.tileSize = 32;
    this.container = null;
    this.selectedObjectRef = null;
    this.linkSearchTerms = {};
  }

  getMaps() { return this.dm.data.maps || []; }

  getCurrentMap() {
    const maps = this.getMaps();
    return maps[this.currentMapIdx] || null;
  }

  render(container) {
    this.container = container;
    // Auto-load game maps if maps list is empty or only has placeholder
    if (!this.dm.data.maps || this.dm.data.maps.length === 0 ||
        (this.dm.data.maps.length === 1 && (!this.dm.data.maps[0].layers || !this.dm.data.maps[0].layers.ground || this.dm.data.maps[0].layers.ground.length === 0))) {
      this._autoLoadGameMaps();
    }

    const maps = this.getMaps();
    const map = this.getCurrentMap();

    const mapOptions = maps.map((m, i) =>
      `<option value="${i}" ${i === this.currentMapIdx ? 'selected' : ''}>${m.name || m.id}</option>`
    ).join('');

    container.innerHTML = `
      <div class="section-header">
        <h2>맵 에디터 <small>Map Editor</small></h2>
        <div style="display:flex;gap:8px;">
          <button class="btn btn-primary" id="addMapBtn">+ 새 맵</button>
          <button class="btn btn-secondary" id="importGameMapBtn">게임 맵 불러오기</button>
          <button class="btn btn-success" id="saveMapBtn">맵 저장</button>
        </div>
      </div>

      <div class="toolbar">
        <select class="filter-select" id="mapSelect">${mapOptions}</select>
        <select class="filter-select" id="layerSelect">
          <option value="ground" ${this.currentLayer === 'ground' ? 'selected' : ''}>지면</option>
          <option value="objects" ${this.currentLayer === 'objects' ? 'selected' : ''}>오브젝트</option>
          <option value="collision" ${this.currentLayer === 'collision' ? 'selected' : ''}>충돌</option>
        </select>
        <div style="display:flex;gap:4px;">
          <button class="btn btn-small ${this.tool === 'paint' ? 'btn-primary' : 'btn-secondary'} tool-btn" data-tool="paint">브러시</button>
          <button class="btn btn-small ${this.tool === 'erase' ? 'btn-primary' : 'btn-secondary'} tool-btn" data-tool="erase">지우개</button>
          <button class="btn btn-small ${this.tool === 'fill' ? 'btn-primary' : 'btn-secondary'} tool-btn" data-tool="fill">채우기</button>
          <button class="btn btn-small ${this.tool === 'spawn' ? 'btn-primary' : 'btn-secondary'} tool-btn" data-tool="spawn">스폰</button>
        </div>
        <select class="filter-select" id="spawnTypeSelect" style="${this.tool === 'spawn' ? '' : 'display:none;'}">
          ${Object.entries(SPAWN_TYPES).map(([k, v]) => `<option value="${k}" ${this.spawnType === k ? 'selected' : ''}>${v.name}</option>`).join('')}
        </select>
        <div style="display:flex;align-items:center;gap:6px;">
          <button class="btn btn-secondary btn-small" id="zoomOutBtn">-</button>
          <span style="font-size:12px;color:var(--text-dim);" id="zoomLabel">${Math.round(this.zoom * 100)}%</span>
          <button class="btn btn-secondary btn-small" id="zoomInBtn">+</button>
          <button class="btn btn-secondary btn-small" id="zoomFitBtn">전체보기</button>
        </div>
        ${map ? `
        <div style="display:flex;align-items:center;gap:6px;">
          <label style="font-size:12px;color:var(--text-dim);">W:</label>
          <input type="number" id="gridW" value="${map.width || 20}" min="5" max="100" style="width:50px;padding:4px;background:var(--bg-input);border:1px solid var(--border);border-radius:4px;color:var(--text);font-size:12px;">
          <label style="font-size:12px;color:var(--text-dim);">H:</label>
          <input type="number" id="gridH" value="${map.height || 15}" min="5" max="100" style="width:50px;padding:4px;background:var(--bg-input);border:1px solid var(--border);border-radius:4px;color:var(--text);font-size:12px;">
          <button class="btn btn-secondary btn-small" id="resizeGridBtn">적용</button>
        </div>
        ` : ''}
        <button class="btn btn-danger btn-small" id="deleteMapBtn" ${maps.length <= 1 ? 'disabled' : ''}>맵 삭제</button>
      </div>

      <div class="map-editor-layout">
        <div class="tile-palette">
          <h4>타일 팔레트</h4>
          <div id="tilePalette">
            ${Object.entries(TILE_TYPES).map(([id, t]) => `
              <div class="tile-swatch ${parseInt(id) === this.selectedTile ? 'selected' : ''}"
                   data-tile="${id}"
                   style="background:${t.color};"
                   title="${t.name}"></div>
            `).join('')}
          </div>
          ${this.tool === 'spawn' ? `
            <h4 style="margin-top:12px;">스폰 정보</h4>
            <div id="spawnInfo" style="font-size:11px;color:var(--text-dim);">
              <div>유형: ${SPAWN_TYPES[this.spawnType]?.name}</div>
              <div style="margin-top:4px;">클릭하여 스폰 포인트 배치</div>
            </div>
          ` : ''}
        </div>
        <div class="map-canvas-container" id="mapCanvasContainer">
          <canvas id="mapCanvas"></canvas>
        </div>
        <div id="mapObjectPanel" style="width:320px;flex-shrink:0;background:var(--bg-card);border:1px solid var(--border);border-radius:6px;overflow:auto;max-height:calc(100vh - 210px);padding:10px;">
          ${this._renderObjectPanel(map)}
        </div>
      </div>
    `;

    // Bind events
    container.querySelector('#mapSelect').onchange = (e) => {
      this.currentMapIdx = parseInt(e.target.value);
      this.selectedObjectRef = null;
      this.render(container);
    };
    container.querySelector('#layerSelect').onchange = (e) => {
      this.currentLayer = e.target.value;
      this.drawMap();
    };
    container.querySelectorAll('.tool-btn').forEach(btn => {
      btn.onclick = () => {
        this.tool = btn.dataset.tool;
        this.render(container);
      };
    });
    const spawnSel = container.querySelector('#spawnTypeSelect');
    if (spawnSel) spawnSel.onchange = (e) => { this.spawnType = e.target.value; this.render(container); };

    container.querySelector('#zoomInBtn').onclick = () => { this.zoom = Math.min(4, this.zoom + 0.25); this.render(container); };
    container.querySelector('#zoomOutBtn').onclick = () => { this.zoom = Math.max(0.1, this.zoom - 0.25); this.render(container); };
    container.querySelector('#zoomFitBtn').onclick = () => {
      this.zoom = this._calculateFitZoom(container, this.getCurrentMap());
      this.render(container);
    };

    container.querySelector('#addMapBtn').onclick = () => this.addMap(container);
    container.querySelector('#importGameMapBtn').onclick = () => this._importGameMap(container);
    container.querySelector('#saveMapBtn').onclick = () => { this.dm.save(); window.showToast('맵이 저장되었습니다.', 'success'); };
    container.querySelector('#deleteMapBtn')?.addEventListener('click', () => {
      if (confirm('이 맵을 삭제하시겠습니까?')) {
        this.dm.data.maps.splice(this.currentMapIdx, 1);
        this.currentMapIdx = 0;
        this.dm.save();
        this.render(container);
        window.showToast('맵이 삭제되었습니다.', 'success');
      }
    });

    const resizeBtn = container.querySelector('#resizeGridBtn');
    if (resizeBtn) {
      resizeBtn.onclick = () => {
        const w = parseInt(container.querySelector('#gridW').value) || 20;
        const h = parseInt(container.querySelector('#gridH').value) || 15;
        this.resizeMap(w, h);
        this.render(container);
      };
    }

    // Tile palette
    container.querySelectorAll('.tile-swatch').forEach(swatch => {
      swatch.onclick = () => {
        this.selectedTile = parseInt(swatch.dataset.tile);
        container.querySelectorAll('.tile-swatch').forEach(s => s.classList.remove('selected'));
        swatch.classList.add('selected');
      };
    });

    // Init canvas
    if (map) {
      this.initCanvas(container, map);
      this._bindObjectPanel(container, map);
    }
  }

  initCanvas(container, map) {
    this.canvas = container.querySelector('#mapCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.gridWidth = map.width || 20;
    this.gridHeight = map.height || 15;
    this.tileSize = map.tileSize || 32;

    const scaledTile = this.tileSize * this.zoom;
    this.canvas.width = this.gridWidth * scaledTile;
    this.canvas.height = this.gridHeight * scaledTile;
    this.canvas.style.width = `${this.canvas.width}px`;
    this.canvas.style.height = `${this.canvas.height}px`;

    // Ensure layers exist
    LAYERS.forEach(layer => {
      if (!map.layers[layer] || !Array.isArray(map.layers[layer]) || map.layers[layer].length !== this.gridWidth * this.gridHeight) {
        map.layers[layer] = new Array(this.gridWidth * this.gridHeight).fill(0);
      }
    });
    if (!map.spawnPoints) map.spawnPoints = { player: null, monsters: [], npcs: [], items: [], portals: [] };
    if (!map.spawnPoints.monsters) map.spawnPoints.monsters = [];
    if (!map.spawnPoints.npcs) map.spawnPoints.npcs = [];
    if (!map.spawnPoints.items) map.spawnPoints.items = [];
    if (!map.spawnPoints.portals) map.spawnPoints.portals = [];

    this.drawMap();

    // Mouse events
    this.canvas.onmousedown = (e) => {
      this.isPainting = true;
      this.handleCanvasClick(e, map);
    };
    this.canvas.onmousemove = (e) => {
      if (this.isPainting && this.tool !== 'fill' && this.tool !== 'spawn') {
        this.handleCanvasClick(e, map);
      }
    };
    this.canvas.onmouseup = () => { this.isPainting = false; };
    this.canvas.onmouseleave = () => { this.isPainting = false; };
  }

  handleCanvasClick(e, map) {
    const rect = this.canvas.getBoundingClientRect();
    const scaledTile = this.tileSize * this.zoom;
    const x = Math.floor((e.clientX - rect.left) / scaledTile);
    const y = Math.floor((e.clientY - rect.top) / scaledTile);

    if (x < 0 || x >= this.gridWidth || y < 0 || y >= this.gridHeight) return;

    if (this.tool === 'paint') {
      map.layers[this.currentLayer][y * this.gridWidth + x] = this.selectedTile;
      this.drawMap();
    } else if (this.tool === 'erase') {
      map.layers[this.currentLayer][y * this.gridWidth + x] = 0;
      this.drawMap();
    } else if (this.tool === 'fill') {
      this.floodFill(map, x, y, this.selectedTile);
      this.drawMap();
    } else if (this.tool === 'spawn') {
      const existing = this._findObjectAt(map, x, y);
      if (existing) {
        this.selectedObjectRef = { type: existing.type, index: existing.index };
        this.drawMap();
        this._refreshObjectPanel();
        return;
      }
      this.placeSpawn(map, x, y);
      this.drawMap();
    }
  }

  _calculateFitZoom(container, map) {
    if (!map) return this.zoom;
    const canvasContainer = container.querySelector('#mapCanvasContainer');
    const rect = canvasContainer?.getBoundingClientRect?.();
    const availableW = Math.max(1, (rect?.width || 900) - 24);
    const availableH = Math.max(1, (rect?.height || 540) - 24);
    const mapW = Math.max(1, (map.width || 20) * (map.tileSize || 32));
    const mapH = Math.max(1, (map.height || 15) * (map.tileSize || 32));
    return Math.max(0.1, Math.min(4, Math.floor(Math.min(availableW / mapW, availableH / mapH) * 100) / 100));
  }

  floodFill(map, startX, startY, newTile) {
    const layer = map.layers[this.currentLayer];
    const oldTile = layer[startY * this.gridWidth + startX];
    if (oldTile === newTile) return;

    const stack = [[startX, startY]];
    const visited = new Set();

    while (stack.length > 0) {
      const [x, y] = stack.pop();
      const key = `${x},${y}`;
      if (visited.has(key)) continue;
      if (x < 0 || x >= this.gridWidth || y < 0 || y >= this.gridHeight) continue;
      if (layer[y * this.gridWidth + x] !== oldTile) continue;

      visited.add(key);
      layer[y * this.gridWidth + x] = newTile;

      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
  }

  _getCatalog(kind) {
    if (kind === 'monster') return Object.values(this.dm.data.monsters || {});
    if (kind === 'npc') return Object.values(this.dm.data.npcs || {});
    if (kind === 'item') return Object.values(this.dm.data.items || {});
    if (kind === 'map') return this.getMaps();
    return [];
  }

  _getLinkedName(kind, id) {
    const item = this._getCatalog(kind).find(entry => entry.id === id);
    return item ? (item.nameKo || item.name || item.id) : id || '미연결';
  }

  _getObjectEntries(map) {
    if (!map?.spawnPoints) return [];
    const entries = [];
    if (map.spawnPoints.player) {
      entries.push({ type: 'player', index: -1, title: '플레이어 시작 위치', id: 'player', data: map.spawnPoints.player });
    }
    (map.spawnPoints.monsters || []).forEach((sp, index) => {
      entries.push({ type: 'monster', index, title: this._getLinkedName('monster', sp.monsterId), id: sp.monsterId, data: sp });
    });
    (map.spawnPoints.npcs || []).forEach((sp, index) => {
      entries.push({ type: 'npc', index, title: this._getLinkedName('npc', sp.npcId), id: sp.npcId, data: sp });
    });
    (map.spawnPoints.items || []).forEach((sp, index) => {
      entries.push({ type: 'item', index, title: this._getLinkedName('item', sp.itemId), id: sp.itemId, data: sp });
    });
    (map.spawnPoints.portals || []).forEach((sp, index) => {
      entries.push({ type: 'portal', index, title: sp.label || this._getLinkedName('map', sp.targetMap), id: sp.targetMap, data: sp });
    });
    return entries;
  }

  _findObjectAt(map, x, y) {
    return this._getObjectEntries(map).find(entry => entry.data.x === x && entry.data.y === y) || null;
  }

  _getSelectedObject(map) {
    if (!this.selectedObjectRef) return null;
    const { type, index } = this.selectedObjectRef;
    if (type === 'player') return map.spawnPoints?.player ? { type, index: -1, data: map.spawnPoints.player } : null;
    const listKey = this._getSpawnListKey(type);
    const data = listKey ? map.spawnPoints?.[listKey]?.[index] : null;
    return data ? { type, index, data } : null;
  }

  _getSpawnListKey(type) {
    return ({ monster: 'monsters', npc: 'npcs', item: 'items', portal: 'portals' })[type] || null;
  }

  _getLinkField(type) {
    return ({ monster: 'monsterId', npc: 'npcId', item: 'itemId', portal: 'targetMap' })[type] || null;
  }

  _getCatalogKind(type) {
    return type === 'portal' ? 'map' : type;
  }

  _getTypeName(type) {
    return SPAWN_TYPES[type]?.name || type;
  }

  _isSelected(type, index) {
    return this.selectedObjectRef?.type === type && Number(this.selectedObjectRef?.index) === Number(index);
  }

  _renderObjectPanel(map) {
    if (!map) return '<div style="color:var(--text-dim);font-size:12px;">맵을 선택하세요.</div>';
    const entries = this._getObjectEntries(map);
    const selected = this._getSelectedObject(map);
    return `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px;">
        <h4 style="margin:0;color:var(--gold);font-size:13px;">맵 오브젝트</h4>
        <span style="color:var(--text-dim);font-size:11px;">${entries.length}개</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:12px;">
        ${entries.length === 0 ? '<div style="color:var(--text-dim);font-size:12px;padding:10px;border:1px dashed var(--border);border-radius:6px;">현재 맵에 배치된 오브젝트가 없습니다.</div>' : entries.map(entry => `
          <button class="map-object-row" data-type="${entry.type}" data-index="${entry.index}" style="text-align:left;padding:8px;border:1px solid ${this._isSelected(entry.type, entry.index) ? 'var(--gold)' : 'var(--border)'};background:${this._isSelected(entry.type, entry.index) ? 'rgba(212,168,67,0.12)' : 'var(--bg-panel)'};border-radius:6px;color:var(--text);cursor:pointer;">
            <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
              <strong style="font-size:12px;">${this._escapeHtml(entry.title)}</strong>
              <span style="font-size:10px;color:${SPAWN_TYPES[entry.type]?.color || 'var(--text-dim)'};">${this._getTypeName(entry.type)}</span>
            </div>
            <div style="font-size:10px;color:var(--text-dim);margin-top:3px;">x:${entry.data.x ?? '-'} y:${entry.data.y ?? '-'} · ${this._escapeHtml(entry.id || '')}</div>
          </button>
        `).join('')}
      </div>
      ${selected ? this._renderObjectInspector(selected) : '<div style="color:var(--text-dim);font-size:12px;padding:12px;background:var(--bg-panel);border:1px solid var(--border);border-radius:6px;">목록에서 오브젝트를 선택하면 정보를 수정할 수 있습니다.</div>'}
    `;
  }

  _renderObjectInspector(selected) {
    const { type, index, data } = selected;
    const linkField = this._getLinkField(type);
    const catalogKind = this._getCatalogKind(type);
    const searchKey = `${type}:${index}:${linkField || 'none'}`;
    return `
      <div style="border-top:1px solid var(--border);padding-top:10px;">
        <h4 style="margin:0 0 10px;color:var(--gold);font-size:13px;">선택 정보 수정</h4>
        <div class="form-row">
          <div class="form-group"><label>X</label><input type="number" class="map-object-input" data-field="x" value="${data.x ?? 0}"></div>
          <div class="form-group"><label>Y</label><input type="number" class="map-object-input" data-field="y" value="${data.y ?? 0}"></div>
        </div>
        <div class="form-group"><label>표시 이름</label><input type="text" class="map-object-input" data-field="label" value="${this._escapeHtml(data.label || '')}" placeholder="관리자용 표시 이름"></div>
        <div class="form-group"><label>설명</label><textarea class="map-object-input" data-field="description" placeholder="이 배치 오브젝트에 대한 설명">${this._escapeHtml(data.description || '')}</textarea></div>
        ${linkField ? this._renderSearchableSelect({
          label: type === 'portal' ? '연결 맵' : '연결 데이터',
          kind: catalogKind,
          field: linkField,
          value: data[linkField] || '',
          searchKey,
        }) : ''}
        ${type === 'portal' ? `
          <div class="form-row">
            <div class="form-group"><label>도착 X</label><input type="number" class="map-object-input" data-field="targetX" value="${data.targetX ?? data.x ?? 0}"></div>
            <div class="form-group"><label>도착 Y</label><input type="number" class="map-object-input" data-field="targetY" value="${data.targetY ?? data.y ?? 0}"></div>
          </div>
        ` : ''}
        ${type === 'monster' ? '<div class="form-group"><label>리스폰(ms)</label><input type="number" class="map-object-input" data-field="respawnMs" value="' + (data.respawnMs || '') + '" placeholder="비우면 기본값"></div>' : ''}
        <div style="display:flex;gap:8px;margin-top:10px;">
          <button class="btn btn-success btn-small" id="mapObjectSaveBtn">저장</button>
          ${type !== 'player' ? '<button class="btn btn-danger btn-small" id="mapObjectDeleteBtn">삭제</button>' : ''}
        </div>
      </div>
    `;
  }

  _renderSearchableSelect({ label, kind, field, value, searchKey }) {
    const search = this.linkSearchTerms[searchKey] || '';
    const q = search.trim().toLowerCase();
    const entries = this._getCatalog(kind);
    const filtered = entries.filter(entry => {
      const text = [
        entry.id,
        entry.name,
        entry.nameKo,
        entry.description,
        entry.type,
        entry.module_id,
      ].filter(Boolean).join(' ').toLowerCase();
      return !q || text.includes(q);
    });
    const selectedEntry = entries.find(entry => entry.id === value);
    const optionEntries = selectedEntry && !filtered.some(entry => entry.id === value)
      ? [selectedEntry, ...filtered]
      : filtered;
    return `
      <div class="form-group">
        <label>${label}</label>
        <input type="text" class="map-link-search" data-search-key="${this._escapeHtml(searchKey)}" placeholder="ID 또는 이름으로 검색..." value="${this._escapeHtml(search)}" style="margin-bottom:6px;">
        <select class="map-object-link-select" data-field="${field}" data-kind="${kind}" style="min-height:34px;">
          <option value="">선택 안 함</option>
          ${optionEntries.map(entry => `<option value="${this._escapeHtml(entry.id)}" ${entry.id === value ? 'selected' : ''}>${this._escapeHtml(entry.nameKo || entry.name || entry.id)} (${this._escapeHtml(entry.id)})</option>`).join('')}
        </select>
        <small style="color:var(--text-dim);font-size:10px;">드롭다운 목록은 검색어에 따라 필터링됩니다.</small>
      </div>
    `;
  }

  _getFilteredCatalog(kind, search) {
    const q = (search || '').trim().toLowerCase();
    return this._getCatalog(kind).filter(entry => {
      const text = [
        entry.id,
        entry.name,
        entry.nameKo,
        entry.title,
        entry.description,
        entry.type,
        entry.module_id,
      ].filter(Boolean).join(' ').toLowerCase();
      return !q || text.includes(q);
    });
  }

  _populateLinkSelect(select, kind, value, search) {
    const entries = this._getCatalog(kind);
    const filtered = this._getFilteredCatalog(kind, search);
    const selectedEntry = entries.find(entry => entry.id === value);
    const optionEntries = selectedEntry && !filtered.some(entry => entry.id === value)
      ? [selectedEntry, ...filtered]
      : filtered;
    select.innerHTML = `
      <option value="">선택 안 함</option>
      ${optionEntries.map(entry => `<option value="${this._escapeHtml(entry.id)}" ${entry.id === value ? 'selected' : ''}>${this._escapeHtml(entry.nameKo || entry.name || entry.id)} (${this._escapeHtml(entry.id)})</option>`).join('')}
    `;
  }

  _refreshObjectPanel() {
    if (!this.container) return;
    const map = this.getCurrentMap();
    const panel = this.container.querySelector('#mapObjectPanel');
    if (!panel) return;
    panel.innerHTML = this._renderObjectPanel(map);
    this._bindObjectPanel(this.container, map);
  }

  _bindObjectPanel(container, map) {
    const panel = container.querySelector('#mapObjectPanel');
    if (!panel || !map) return;

    panel.querySelectorAll('.map-object-row').forEach(btn => {
      btn.onclick = () => {
        this.selectedObjectRef = { type: btn.dataset.type, index: parseInt(btn.dataset.index, 10) };
        this._refreshObjectPanel();
        this.drawMap();
      };
    });

    panel.querySelectorAll('.map-link-search').forEach(input => {
      input.oninput = () => {
        this.linkSearchTerms[input.dataset.searchKey] = input.value;
        const group = input.closest('.form-group');
        const select = group?.querySelector('.map-object-link-select');
        const selected = this._getSelectedObject(map);
        if (!select || !selected) return;
        this._populateLinkSelect(select, select.dataset.kind, selected.data[select.dataset.field] || '', input.value);
      };
    });

    panel.querySelectorAll('.map-object-input').forEach(input => {
      input.onchange = () => {
        const selected = this._getSelectedObject(map);
        if (!selected) return;
        const field = input.dataset.field;
        const numericFields = new Set(['x', 'y', 'targetX', 'targetY', 'respawnMs']);
        const raw = input.value;
        selected.data[field] = numericFields.has(field) ? (raw === '' ? null : parseInt(raw, 10) || 0) : raw;
        this.dm.save();
        this.drawMap();
        this._refreshObjectPanel();
      };
    });

    panel.querySelectorAll('.map-object-link-select').forEach(select => {
      select.onchange = () => {
        const selected = this._getSelectedObject(map);
        if (!selected) return;
        selected.data[select.dataset.field] = select.value;
        if (selected.type === 'portal' && !selected.data.label) {
          selected.data.label = this._getLinkedName('map', select.value);
        }
        this.dm.save();
        this.drawMap();
        this._refreshObjectPanel();
      };
    });

    panel.querySelector('#mapObjectSaveBtn')?.addEventListener('click', () => {
      this.dm.save();
      this.drawMap();
      this._refreshObjectPanel();
      window.showToast('맵 오브젝트가 저장되었습니다.', 'success');
    });

    panel.querySelector('#mapObjectDeleteBtn')?.addEventListener('click', () => {
      const selected = this._getSelectedObject(map);
      if (!selected || selected.type === 'player') return;
      if (!confirm('선택한 맵 오브젝트를 삭제할까요?')) return;
      const listKey = this._getSpawnListKey(selected.type);
      map.spawnPoints[listKey].splice(selected.index, 1);
      this.selectedObjectRef = null;
      this.dm.save();
      this.drawMap();
      this._refreshObjectPanel();
      window.showToast('맵 오브젝트가 삭제되었습니다.', 'success');
    });
  }

  placeSpawn(map, x, y) {
    if (this.spawnType === 'player') {
      map.spawnPoints.player = { x, y };
      this.selectedObjectRef = { type: 'player', index: -1 };
      this.dm.save();
      this._refreshObjectPanel();
    } else if (this.spawnType === 'monster') {
      this._openDataPicker({
        title: '몬스터 선택',
        description: '관리자 몬스터 데이터에서 배치할 몬스터를 검색하세요.',
        items: Object.values(this.dm.data.monsters || {}),
        emptyText: '등록된 몬스터가 없습니다. 몬스터 관리에서 먼저 생성하세요.',
        onSelect: (monsterId) => {
          const index = map.spawnPoints.monsters.push({ monsterId, x, y, label: this._getLinkedName('monster', monsterId), description: '' }) - 1;
          this.selectedObjectRef = { type: 'monster', index };
          this.dm.save();
          this.drawMap();
          this._refreshObjectPanel();
          window.showToast(`몬스터 스폰을 배치했습니다: ${monsterId}`, 'success');
        },
      });
    } else if (this.spawnType === 'npc') {
      this._openDataPicker({
        title: 'NPC 선택',
        description: '관리자 NPC 데이터에서 배치할 NPC를 검색하세요.',
        items: Object.values(this.dm.data.npcs || {}),
        emptyText: '등록된 NPC가 없습니다. NPC 관리에서 먼저 생성하세요.',
        onSelect: (npcId) => {
          const index = map.spawnPoints.npcs.push({ npcId, x, y, label: this._getLinkedName('npc', npcId), description: '' }) - 1;
          this.selectedObjectRef = { type: 'npc', index };
          this.dm.save();
          this.drawMap();
          this._refreshObjectPanel();
          window.showToast(`NPC 스폰을 배치했습니다: ${npcId}`, 'success');
        },
      });
    } else if (this.spawnType === 'item') {
      this._openDataPicker({
        title: '아이템 선택',
        description: '관리자 아이템 데이터에서 배치할 아이템을 검색하세요.',
        items: Object.values(this.dm.data.items || {}),
        emptyText: '등록된 아이템이 없습니다.',
        onSelect: (itemId) => {
          const index = map.spawnPoints.items.push({ itemId, x, y, label: this._getLinkedName('item', itemId), description: '' }) - 1;
          this.selectedObjectRef = { type: 'item', index };
          this.dm.save();
          this.drawMap();
          this._refreshObjectPanel();
          window.showToast(`아이템 스폰을 배치했습니다: ${itemId}`, 'success');
        },
      });
    } else if (this.spawnType === 'portal') {
      this._openDataPicker({
        title: '연결 맵 선택',
        description: '포탈이 이동할 맵을 검색해서 선택하세요.',
        items: this.getMaps(),
        emptyText: '연결 가능한 맵이 없습니다.',
        onSelect: (targetMap) => {
          const label = this._getLinkedName('map', targetMap);
          const index = map.spawnPoints.portals.push({ x, y, targetMap, targetX: x, targetY: y, label, description: '' }) - 1;
          this.selectedObjectRef = { type: 'portal', index };
          this.dm.save();
          this.drawMap();
          this._refreshObjectPanel();
          window.showToast(`포탈을 배치했습니다: ${label}`, 'success');
        },
      });
    }
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

  _openDataPicker({ title, description, items, emptyText, onSelect }) {
    if (!items || items.length === 0) {
      window.showToast(emptyText || '선택 가능한 데이터가 없습니다.', 'error');
      return;
    }

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal" style="max-width:560px;">
        <div class="modal-header">
          <h3>${this._escapeHtml(title)}</h3>
          <button class="btn btn-secondary btn-small modal-close-btn">X</button>
        </div>
        <div class="modal-body">
          <p style="color:var(--text-dim);font-size:12px;margin-bottom:10px;">${this._escapeHtml(description || '')}</p>
          <input type="text" class="search-input" id="mapSpawnPickerSearch" placeholder="ID, 이름, 설명 검색..." style="width:100%;margin-bottom:10px;">
          <select id="mapSpawnPickerSelect" size="10" style="width:100%;min-height:260px;background:var(--bg-input);border:1px solid var(--border);border-radius:6px;color:var(--text);padding:6px;"></select>
          <div id="mapSpawnPickerMeta" style="color:var(--text-dim);font-size:11px;margin-top:8px;min-height:32px;"></div>
          <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:12px;">
            <button class="btn btn-secondary btn-small modal-close-btn">취소</button>
            <button class="btn btn-primary btn-small" id="mapSpawnPickerConfirm">선택</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    overlay.querySelectorAll('.modal-close-btn').forEach(btn => btn.onclick = () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

    const selectEl = overlay.querySelector('#mapSpawnPickerSelect');
    const metaEl = overlay.querySelector('#mapSpawnPickerMeta');
    const searchEl = overlay.querySelector('#mapSpawnPickerSearch');
    let filtered = [];

    const updateMeta = () => {
      const selected = filtered.find(item => item.id === selectEl.value);
      if (!selected) {
        metaEl.textContent = '';
        return;
      }
      metaEl.textContent = [selected.id, selected.type, selected.module_id, selected.description].filter(Boolean).join(' · ');
    };

    const renderList = () => {
      const q = searchEl.value.trim().toLowerCase();
      filtered = items.filter(item => {
        const text = [
          item.id,
          item.name,
          item.nameKo,
          item.title,
          item.description,
          item.type,
          item.module_id,
        ].filter(Boolean).join(' ').toLowerCase();
        return !q || text.includes(q);
      });

      selectEl.innerHTML = filtered.length === 0
        ? '<option value="">검색 결과가 없습니다</option>'
        : filtered.map(item => {
          const id = item.id;
          const name = item.nameKo || item.name || id;
          const meta = [item.type, item.module_id, item.level ? `Lv.${item.level}` : null].filter(Boolean).join(' · ');
          return `<option value="${this._escapeHtml(id)}">${this._escapeHtml(name)} (${this._escapeHtml(id)})${meta ? ` · ${this._escapeHtml(meta)}` : ''}</option>`;
        }).join('');
      if (filtered.length > 0) selectEl.value = filtered[0].id;
      updateMeta();
    };

    searchEl.oninput = renderList;
    selectEl.onchange = updateMeta;
    selectEl.ondblclick = () => {
      if (!selectEl.value) return;
      onSelect?.(selectEl.value);
      overlay.remove();
    };
    overlay.querySelector('#mapSpawnPickerConfirm').onclick = () => {
      if (!selectEl.value) {
        window.showToast('연결할 데이터를 선택해주세요.', 'error');
        return;
      }
      onSelect?.(selectEl.value);
      overlay.remove();
    };
    renderList();
    searchEl.focus();
  }

  drawMap() {
    const map = this.getCurrentMap();
    if (!map || !this.ctx) return;

    const ctx = this.ctx;
    const scaledTile = this.tileSize * this.zoom;

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw layers
    LAYERS.forEach(layer => {
      const data = map.layers[layer];
      if (!data) return;

      for (let y = 0; y < this.gridHeight; y++) {
        for (let x = 0; x < this.gridWidth; x++) {
          const tile = data[y * this.gridWidth + x];
          if (tile === 0 && layer !== 'ground') continue;

          if (layer === 'collision' && tile > 0) {
            ctx.fillStyle = 'rgba(255,0,0,0.3)';
          } else {
            const tileDef = TILE_TYPES[tile];
            if (!tileDef) continue;
            ctx.fillStyle = layer === 'objects' ? tileDef.color + 'cc' : tileDef.color;
          }
          ctx.fillRect(x * scaledTile, y * scaledTile, scaledTile, scaledTile);
        }
      }
    });

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= this.gridWidth; x++) {
      ctx.beginPath();
      ctx.moveTo(x * scaledTile, 0);
      ctx.lineTo(x * scaledTile, this.gridHeight * scaledTile);
      ctx.stroke();
    }
    for (let y = 0; y <= this.gridHeight; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * scaledTile);
      ctx.lineTo(this.gridWidth * scaledTile, y * scaledTile);
      ctx.stroke();
    }

    // Spawn points
    if (map.spawnPoints) {
      const drawSpawn = (sp, type, index = -1) => {
        if (!sp) return;
        const def = SPAWN_TYPES[type];
        ctx.fillStyle = def.color;
        ctx.font = `bold ${Math.floor(scaledTile * 0.6)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(def.symbol, sp.x * scaledTile + scaledTile / 2, sp.y * scaledTile + scaledTile / 2);
        if (this._isSelected(type, index)) {
          ctx.strokeStyle = '#ffd166';
          ctx.lineWidth = 3;
          ctx.strokeRect(sp.x * scaledTile + 2, sp.y * scaledTile + 2, scaledTile - 4, scaledTile - 4);
        }
      };

      if (map.spawnPoints.player) drawSpawn(map.spawnPoints.player, 'player', -1);
      (map.spawnPoints.monsters || []).forEach((sp, index) => drawSpawn(sp, 'monster', index));
      (map.spawnPoints.npcs || []).forEach((sp, index) => drawSpawn(sp, 'npc', index));
      (map.spawnPoints.items || []).forEach((sp, index) => drawSpawn(sp, 'item', index));
      (map.spawnPoints.portals || []).forEach((sp, index) => drawSpawn(sp, 'portal', index));
    }

    // Highlight active layer
    ctx.strokeStyle = this.currentLayer === 'collision' ? 'rgba(255,0,0,0.5)' : 'rgba(212,168,67,0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
  }

  _autoLoadGameMaps() {
    let gameMaps;
    try { gameMaps = getAllMaps(); } catch { return; }

    const mapsWithTiles = gameMaps.filter(m => m.tiles && Array.isArray(m.tiles));
    if (mapsWithTiles.length === 0) return;

    this.dm.data.maps = mapsWithTiles.map(convertGameMapToEditorMap);
    this.currentMapIdx = Math.max(0, this.dm.data.maps.findIndex(m => m.id === 'field_01'));
    this.dm.save();
  }

  _importGameMap(container) {
    let gameMaps;
    try {
      gameMaps = getAllMaps();
    } catch {
      window.showToast('게임 맵 데이터를 불러올 수 없습니다.', 'error');
      return;
    }

    const mapsWithTiles = gameMaps.filter(m => m.tiles && Array.isArray(m.tiles));
    if (mapsWithTiles.length === 0) {
      window.showToast('타일 데이터가 있는 맵이 없습니다.', 'error');
      return;
    }

    // Show selection dialog
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal" style="max-width:400px;">
        <div class="modal-header">
          <h3>게임 맵 불러오기</h3>
          <button class="btn btn-secondary btn-small modal-close-btn">X</button>
        </div>
        <div class="modal-body">
          <p style="color:var(--text-dim);font-size:12px;margin-bottom:12px;">불러올 맵을 선택하세요. 기존 에디터에 추가됩니다.</p>
          ${mapsWithTiles.map(m => `
            <div class="game-map-item" data-id="${m.id}" style="padding:10px;margin-bottom:6px;background:var(--bg-panel);border:1px solid var(--border);border-radius:4px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;">
              <div>
                <div style="font-weight:700;color:var(--text);">${m.nameKo || m.id}</div>
                <div style="font-size:11px;color:var(--text-dim);">${m.width}x${m.height} 편집 가능</div>
              </div>
              <button class="btn btn-primary btn-small import-map-btn" data-id="${m.id}">불러오기</button>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    overlay.querySelectorAll('.modal-close-btn').forEach(b => b.onclick = () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

    overlay.querySelectorAll('.import-map-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const mapId = btn.dataset.id;
        const gameMap = gameMaps.find(m => m.id === mapId);
        if (!gameMap) return;

        const editorMap = convertGameMapToEditorMap(gameMap);

        if (!this.dm.data.maps) this.dm.data.maps = [];

        // Check if already exists
        const existIdx = this.dm.data.maps.findIndex(m => m.id === editorMap.id);
        if (existIdx >= 0) {
          if (!confirm(`맵 "${editorMap.name}"이(가) 이미 존재합니다. 덮어쓰시겠습니까?`)) return;
          this.dm.data.maps[existIdx] = editorMap;
          this.currentMapIdx = existIdx;
        } else {
          this.dm.data.maps.push(editorMap);
          this.currentMapIdx = this.dm.data.maps.length - 1;
        }

        this.dm.save();
        overlay.remove();
        this.render(container);
        window.showToast(`맵 "${editorMap.name}" 불러오기 완료!`, 'success');
      });
    });
  }

  addMap(container) {
    const id = prompt('맵 ID를 입력하세요:');
    if (!id) return;
    const name = prompt('맵 이름을 입력하세요:') || id;
    const w = parseInt(prompt('가로 크기 (기본 30):', '30')) || 30;
    const h = parseInt(prompt('세로 크기 (기본 17):', '17')) || 17;

    const newMap = {
      id, name, width: w, height: h, tileSize: 32,
      layers: {
        ground: new Array(w * h).fill(1),
        objects: new Array(w * h).fill(0),
        collision: new Array(w * h).fill(0)
      },
      spawnPoints: { player: { x: Math.floor(w / 2), y: Math.floor(h / 2) }, monsters: [], npcs: [], items: [], portals: [] }
    };

    if (!this.dm.data.maps) this.dm.data.maps = [];
    this.dm.data.maps.push(newMap);
    this.currentMapIdx = this.dm.data.maps.length - 1;
    this.dm.save();
    this.render(container);
    window.showToast('새 맵이 추가되었습니다.', 'success');
  }

  resizeMap(newW, newH) {
    const map = this.getCurrentMap();
    if (!map) return;

    const oldW = map.width;
    const oldH = map.height;

    LAYERS.forEach(layer => {
      const oldData = map.layers[layer] || [];
      const newData = new Array(newW * newH).fill(0);

      for (let y = 0; y < Math.min(oldH, newH); y++) {
        for (let x = 0; x < Math.min(oldW, newW); x++) {
          newData[y * newW + x] = oldData[y * oldW + x] || 0;
        }
      }
      map.layers[layer] = newData;
    });

    map.width = newW;
    map.height = newH;
    this.dm.save();
    window.showToast(`맵 크기가 ${newW}x${newH}로 변경되었습니다.`, 'success');
  }
}
