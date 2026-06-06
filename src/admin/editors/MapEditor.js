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
};

const LAYERS = ['ground', 'objects', 'collision'];

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
  }

  getMaps() { return this.dm.data.maps || []; }

  getCurrentMap() {
    const maps = this.getMaps();
    return maps[this.currentMapIdx] || null;
  }

  render(container) {
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
      </div>
    `;

    // Bind events
    container.querySelector('#mapSelect').onchange = (e) => {
      this.currentMapIdx = parseInt(e.target.value);
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

    container.querySelector('#zoomInBtn').onclick = () => { this.zoom = Math.min(3, this.zoom + 0.25); this.render(container); };
    container.querySelector('#zoomOutBtn').onclick = () => { this.zoom = Math.max(0.25, this.zoom - 0.25); this.render(container); };

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

    // Ensure layers exist
    LAYERS.forEach(layer => {
      if (!map.layers[layer] || !Array.isArray(map.layers[layer]) || map.layers[layer].length !== this.gridWidth * this.gridHeight) {
        map.layers[layer] = new Array(this.gridWidth * this.gridHeight).fill(0);
      }
    });
    if (!map.spawnPoints) map.spawnPoints = { player: null, monsters: [], npcs: [], items: [] };

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
      this.placeSpawn(map, x, y);
      this.drawMap();
    }
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

  placeSpawn(map, x, y) {
    if (this.spawnType === 'player') {
      map.spawnPoints.player = { x, y };
    } else if (this.spawnType === 'monster') {
      const mid = prompt('몬스터 ID를 입력하세요:');
      if (mid) map.spawnPoints.monsters.push({ monsterId: mid, x, y });
    } else if (this.spawnType === 'npc') {
      const nid = prompt('NPC ID를 입력하세요:');
      if (nid) map.spawnPoints.npcs.push({ npcId: nid, x, y });
    } else if (this.spawnType === 'item') {
      const iid = prompt('아이템 ID를 입력하세요:');
      if (iid) map.spawnPoints.items.push({ itemId: iid, x, y });
    }
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
      const drawSpawn = (sp, type) => {
        if (!sp) return;
        const def = SPAWN_TYPES[type];
        ctx.fillStyle = def.color;
        ctx.font = `bold ${Math.floor(scaledTile * 0.6)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(def.symbol, sp.x * scaledTile + scaledTile / 2, sp.y * scaledTile + scaledTile / 2);
      };

      if (map.spawnPoints.player) drawSpawn(map.spawnPoints.player, 'player');
      (map.spawnPoints.monsters || []).forEach(sp => drawSpawn(sp, 'monster'));
      (map.spawnPoints.npcs || []).forEach(sp => drawSpawn(sp, 'npc'));
      (map.spawnPoints.items || []).forEach(sp => drawSpawn(sp, 'item'));
    }

    // Highlight active layer
    ctx.strokeStyle = this.currentLayer === 'collision' ? 'rgba(255,0,0,0.5)' : 'rgba(212,168,67,0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
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
          ${gameMaps.map(m => `
            <div class="game-map-item" data-id="${m.id}" style="padding:10px;margin-bottom:6px;background:var(--bg-panel);border:1px solid var(--border);border-radius:4px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;">
              <div>
                <div style="font-weight:700;color:var(--text);">${m.nameKo || m.id}</div>
                <div style="font-size:11px;color:var(--text-dim);">${m.width}x${m.height} ${m.tiles ? '(타일 데이터 있음)' : '(절차적 생성)'}</div>
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

        // Convert game map tiles (2D array) → editor format (1D layers)
        // Game tiles: 0=grass,1=dirt,2=stone,3=water,4=wall,5=tree
        // Editor tiles: 0=blank,1=grass,2=dirt,3=stone,4=water,5=wall,6=tree
        const gameTileToEditor = { 0: 1, 1: 2, 2: 3, 3: 4, 4: 5, 5: 6 };
        const w = gameMap.width;
        const h = gameMap.height;
        const ground = new Array(w * h).fill(0);

        if (gameMap.tiles) {
          for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
              const gameTile = gameMap.tiles[y] ? gameMap.tiles[y][x] : 0;
              ground[y * w + x] = gameTileToEditor[gameTile] !== undefined ? gameTileToEditor[gameTile] : gameTile;
            }
          }
        }

        // Build collision layer from wall/tree/water tiles
        const collision = new Array(w * h).fill(0);
        for (let i = 0; i < ground.length; i++) {
          if (ground[i] === 4 || ground[i] === 5 || ground[i] === 6) collision[i] = 1;
        }

        const editorMap = {
          id: gameMap.id,
          name: gameMap.nameKo || gameMap.id,
          width: w,
          height: h,
          tileSize: 32,
          layers: {
            ground,
            objects: new Array(w * h).fill(0),
            collision,
          },
          spawnPoints: {
            player: gameMap.spawns ? { x: gameMap.spawns.player.x, y: gameMap.spawns.player.y } : { x: 1, y: 1 },
            monsters: [],
            npcs: gameMap.npcs ? gameMap.npcs.map(n => ({ x: n.tileX, y: n.tileY, id: n.id })) : [],
            items: [],
          },
        };

        // Add portals as items
        if (gameMap.portals) {
          editorMap.spawnPoints.items = gameMap.portals.map(p => ({
            x: p.x, y: p.y, label: p.label, targetMap: p.targetMap,
          }));
        }

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
    const w = parseInt(prompt('가로 크기 (기본 20):', '20')) || 20;
    const h = parseInt(prompt('세로 크기 (기본 15):', '15')) || 15;

    const newMap = {
      id, name, width: w, height: h, tileSize: 32,
      layers: {
        ground: new Array(w * h).fill(1),
        objects: new Array(w * h).fill(0),
        collision: new Array(w * h).fill(0)
      },
      spawnPoints: { player: { x: 1, y: 1 }, monsters: [], npcs: [], items: [] }
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
