// =============================================================================
// mapData.js - Managed 960x540 ARPG maps
// Tile types: 0=grass, 1=dirt, 2=stone, 3=water, 4=wall, 5=tree
// =============================================================================

const SCREEN_TILE_WIDTH = 30;
const SCREEN_TILE_HEIGHT = 17;
const FIELD_TILE_WIDTH = 60;
const FIELD_TILE_HEIGHT = 34;

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

function carvePortalPad(map, x, y) {
  const height = map.length;
  const width = map[0].length;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const px = x + dx;
      const py = y + dy;
      if (px >= 0 && px < width && py >= 0 && py < height) {
        map[py][px] = 1;
      }
    }
  }
}

function makeFieldTiles() {
  const map = makeFilledMap(FIELD_TILE_WIDTH, FIELD_TILE_HEIGHT, 0);
  addBorder(map, 4);

  for (let x = 3; x < FIELD_TILE_WIDTH - 3; x++) {
    map[16][x] = 1;
    map[17][x] = 1;
    map[18][x] = 1;
  }
  for (let y = 3; y < FIELD_TILE_HEIGHT - 3; y++) {
    map[y][29] = 1;
    map[y][30] = 1;
  }
  for (let y = 6; y < FIELD_TILE_HEIGHT - 6; y += 6) {
    for (let x = 7; x < FIELD_TILE_WIDTH - 7; x += 11) {
      map[y][x] = 5;
      map[y][x + 1] = 5;
    }
  }

  carvePortalPad(map, 30, 1);
  carvePortalPad(map, 58, 17);
  return map;
}

function makeVillageTiles() {
  const map = makeFilledMap(SCREEN_TILE_WIDTH, SCREEN_TILE_HEIGHT, 0);
  addBorder(map, 5);

  for (let x = 3; x <= 26; x++) {
    map[8][x] = 1;
    map[9][x] = 1;
  }
  for (let y = 2; y <= 15; y++) {
    map[y][14] = 1;
    map[y][15] = 1;
  }
  for (let y = 6; y <= 10; y++) {
    for (let x = 11; x <= 18; x++) map[y][x] = 2;
  }

  const buildings = [
    { x1: 3, y1: 3, x2: 7, y2: 6 },
    { x1: 22, y1: 3, x2: 26, y2: 6 },
    { x1: 3, y1: 11, x2: 7, y2: 14 },
    { x1: 22, y1: 11, x2: 26, y2: 14 },
  ];
  for (const b of buildings) {
    for (let y = b.y1; y <= b.y2; y++) {
      for (let x = b.x1; x <= b.x2; x++) {
        const edge = y === b.y1 || y === b.y2 || x === b.x1 || x === b.x2;
        map[y][x] = edge ? 4 : 2;
      }
    }
  }

  map[6][5] = 1;
  map[6][24] = 1;
  map[14][5] = 1;
  map[14][24] = 1;
  carvePortalPad(map, 15, 16);
  return map;
}

function makeDarkForestTiles() {
  const map = makeFilledMap(SCREEN_TILE_WIDTH, SCREEN_TILE_HEIGHT, 5);
  for (let y = 1; y < SCREEN_TILE_HEIGHT - 1; y++) {
    for (let x = 1; x < SCREEN_TILE_WIDTH - 1; x++) {
      if ((x + y) % 5 !== 0) map[y][x] = 0;
    }
  }

  for (let x = 0; x < 28; x++) {
    map[8][x] = 1;
    map[9][x] = 1;
  }
  for (let y = 4; y < 15; y++) {
    map[y][20] = 1;
    map[y][21] = 1;
  }
  for (let y = 3; y < 7; y++) {
    for (let x = 23; x < 28; x++) {
      const edge = y === 3 || y === 6 || x === 23 || x === 27;
      map[y][x] = edge ? 4 : 2;
    }
  }
  for (let x = 5; x < 13; x++) {
    map[13][x] = 3;
    map[14][x] = 3;
  }

  addBorder(map, 5);
  carvePortalPad(map, 0, 8);
  return map;
}

const field_01 = {
  id: 'field_01',
  module_id: 'world_system',
  nameKo: 'ARPG 테스트 필드',
  width: FIELD_TILE_WIDTH,
  height: FIELD_TILE_HEIGHT,
  type: 'field',
  spawns: {
    player: { x: 30, y: 18 },
    monsters: [
      { monsterId: 'monster_training_box', x: 24, y: 15 },
      { monsterId: 'monster_training_box', x: 36, y: 15 },
      { monsterId: 'monster_aggressive_box', x: 30, y: 23 },
      { monsterId: 'monster_training_box', x: 18, y: 25 },
      { monsterId: 'monster_aggressive_box', x: 43, y: 22 },
    ],
  },
  portals: [
    { x: 30, y: 1, targetMap: 'village_01', targetX: 15, targetY: 14, label: '관리자 허브' },
    { x: 58, y: 17, targetMap: 'dark_forest', targetX: 2, targetY: 8, label: 'AI 검증 필드' },
  ],
  monsterConfig: null,
  tiles: makeFieldTiles(),
};

const village_01 = {
  id: 'village_01',
  module_id: 'world_system',
  nameKo: '관리자 허브',
  width: SCREEN_TILE_WIDTH,
  height: SCREEN_TILE_HEIGHT,
  type: 'village',
  spawns: { player: { x: 15, y: 14 } },
  portals: [
    { x: 15, y: 16, targetMap: 'field_01', targetX: 30, targetY: 3, label: 'ARPG 테스트 필드' },
  ],
  monsterConfig: null,
  tiles: makeVillageTiles(),
  npcs: [
    { id: 'npc_elder', tileX: 14, tileY: 5, facing: 'down' },
    { id: 'npc_blacksmith', tileX: 5, tileY: 7, facing: 'down' },
    { id: 'npc_merchant', tileX: 24, tileY: 7, facing: 'down' },
    { id: 'npc_guard', tileX: 24, tileY: 15, facing: 'down' },
    { id: 'npc_herbalist', tileX: 5, tileY: 15, facing: 'right' },
  ],
};

const dark_forest = {
  id: 'dark_forest',
  module_id: 'world_system',
  nameKo: 'AI 검증 필드',
  width: SCREEN_TILE_WIDTH,
  height: SCREEN_TILE_HEIGHT,
  type: 'forest',
  spawns: { player: { x: 2, y: 8 } },
  portals: [
    { x: 0, y: 8, targetMap: 'field_01', targetX: 56, targetY: 17, label: 'ARPG 테스트 필드' },
  ],
  monsterConfig: {
    types: ['monster_training_box', 'monster_aggressive_box'],
    weights: [40, 60],
    count: 6,
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
