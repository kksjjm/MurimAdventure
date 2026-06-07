// =============================================================================
// mapData.js - Modular ARPG test maps
// Tile types: 0=grass, 1=dirt, 2=stone, 3=water, 4=wall, 5=tree
// =============================================================================

function makeFilledMap(width, height, fill = 0) {
  return Array.from({ length: height }, () => new Array(width).fill(fill));
}

function addBorder(map, tile = 5) {
  const height = map.length;
  const width = map[0].length;
  for (let x = 0; x < width; x++) {
    map[0][x] = tile;
    map[height - 1][x] = tile;
  }
  for (let y = 0; y < height; y++) {
    map[y][0] = tile;
    map[y][width - 1] = tile;
  }
}

function makeVillageTiles() {
  const map = makeFilledMap(30, 30, 0);
  addBorder(map, 5);

  for (let x = 5; x <= 24; x++) {
    map[13][x] = 1;
    map[14][x] = 1;
  }
  for (let y = 6; y <= 27; y++) {
    map[y][14] = 1;
    map[y][15] = 1;
  }
  for (let y = 12; y <= 17; y++) {
    for (let x = 11; x <= 19; x++) map[y][x] = 2;
  }

  const buildings = [
    { x1: 4, y1: 6, x2: 8, y2: 10 },
    { x1: 21, y1: 6, x2: 26, y2: 10 },
    { x1: 4, y1: 18, x2: 8, y2: 22 },
    { x1: 21, y1: 18, x2: 26, y2: 22 },
  ];
  for (const b of buildings) {
    for (let y = b.y1; y <= b.y2; y++) {
      for (let x = b.x1; x <= b.x2; x++) {
        const edge = y === b.y1 || y === b.y2 || x === b.x1 || x === b.x2;
        map[y][x] = edge ? 4 : 2;
      }
    }
  }

  map[10][6] = 1;
  map[10][24] = 1;
  map[22][6] = 1;
  map[22][24] = 1;

  return map;
}

function makeDarkForestTiles() {
  const map = makeFilledMap(40, 40, 5);
  for (let y = 2; y < 38; y++) {
    for (let x = 2; x < 38; x++) {
      if ((x + y) % 5 !== 0) map[y][x] = 0;
    }
  }
  for (let x = 0; x < 36; x++) {
    map[14][x] = 1;
    map[15][x] = 1;
    map[16][x] = 1;
  }
  for (let y = 12; y < 36; y++) {
    map[y][24] = 1;
    map[y][25] = 1;
  }
  for (let y = 6; y < 12; y++) {
    for (let x = 30; x < 37; x++) {
      const edge = y === 6 || y === 11 || x === 30 || x === 36;
      map[y][x] = edge ? 4 : 2;
    }
  }
  for (let x = 6; x < 16; x++) map[30][x] = 3;
  for (let x = 6; x < 16; x++) map[31][x] = 3;
  addBorder(map, 5);
  map[14][0] = 1;
  map[15][0] = 1;
  map[16][0] = 1;
  return map;
}

function makeFieldTiles() {
  const width = 50;
  const height = 50;
  const map = makeFilledMap(width, height, 0);
  addBorder(map, 4);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
      const val = n - Math.floor(n);
      if (val < 0.03) {
        map[y][x] = 3;
      } else if (val < 0.10) {
        map[y][x] = 1;
      } else if (val < 0.14) {
        map[y][x] = 2;
      } else if (val < 0.16 && ((x * 7 + y * 11) % 5 === 0)) {
        map[y][x] = 5;
      } else if (val > 0.96 && ((x * 3 + y * 5) % 7 === 0)) {
        map[y][x] = 4;
      }
    }
  }

  for (let y = 20; y <= 30; y++) {
    for (let x = 20; x <= 30; x++) map[y][x] = 0;
  }
  for (let x = 3; x < width - 3; x++) {
    map[24][x] = 1;
    map[25][x] = 1;
    map[26][x] = 1;
  }
  for (let y = 3; y < height - 3; y++) {
    map[y][24] = 1;
    map[y][25] = 1;
    map[y][26] = 1;
  }

  const portalTiles = [
    { x: 25, y: 3 },
    { x: 47, y: 25 },
  ];
  for (const portal of portalTiles) {
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const py = portal.y + dy;
        const px = portal.x + dx;
        if (py >= 0 && py < height && px >= 0 && px < width) {
          map[py][px] = (dy === 0 && dx === 0) ? 1 : 0;
        }
      }
    }
  }

  return map;
}

const field_01 = {
  id: 'field_01',
  module_id: 'world_system',
  nameKo: 'ARPG 테스트 필드',
  width: 50,
  height: 50,
  type: 'field',
  spawns: { player: { x: 25, y: 25 } },
  portals: [
    { x: 25, y: 3, targetMap: 'village_01', targetX: 15, targetY: 23, label: '관리자 허브' },
    { x: 47, y: 25, targetMap: 'dark_forest', targetX: 5, targetY: 15, label: 'AI 검증 숲' },
  ],
  monsterConfig: {
    types: ['monster_training_box', 'monster_aggressive_box'],
    weights: [70, 30],
    count: 8,
  },
  tiles: makeFieldTiles(),
};

const village_01 = {
  id: 'village_01',
  module_id: 'world_system',
  nameKo: '관리자 허브',
  width: 30,
  height: 30,
  type: 'village',
  spawns: { player: { x: 15, y: 23 } },
  portals: [
    { x: 15, y: 27, targetMap: 'field_01', targetX: 25, targetY: 5, label: 'ARPG 테스트 필드' },
  ],
  monsterConfig: null,
  tiles: makeVillageTiles(),
  npcs: [
    { id: 'npc_elder', tileX: 14, tileY: 11, facing: 'down' },
    { id: 'npc_blacksmith', tileX: 6, tileY: 11, facing: 'down' },
    { id: 'npc_merchant', tileX: 24, tileY: 11, facing: 'down' },
    { id: 'npc_guard', tileX: 24, tileY: 23, facing: 'down' },
    { id: 'npc_herbalist', tileX: 6, tileY: 23, facing: 'right' },
  ],
};

const dark_forest = {
  id: 'dark_forest',
  module_id: 'world_system',
  nameKo: 'AI 검증 숲',
  width: 40,
  height: 40,
  type: 'forest',
  spawns: { player: { x: 5, y: 15 } },
  portals: [
    { x: 0, y: 15, targetMap: 'field_01', targetX: 45, targetY: 25, label: 'ARPG 테스트 필드' },
  ],
  monsterConfig: {
    types: ['monster_training_box', 'monster_aggressive_box'],
    weights: [40, 60],
    count: 14,
  },
  tiles: makeDarkForestTiles(),
};

export const MAP_DATA = {
  field_01,
  village_01,
  dark_forest,
};

export function getMapData(mapId) {
  return MAP_DATA[mapId] || null;
}

export function getAllMaps() {
  return Object.values(MAP_DATA);
}

export default MAP_DATA;
