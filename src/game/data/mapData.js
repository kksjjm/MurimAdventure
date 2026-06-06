// =============================================================================
// mapData.js - Hand-crafted map definitions for 무림기행
// Tile types: 0=grass, 1=dirt, 2=stone, 3=water, 4=wall, 5=tree
// =============================================================================

// =============================================================================
// Map 1: field_01 (녹림 평원) - procedurally generated in WorldScene
// =============================================================================
const field_01 = {
  id: 'field_01',
  nameKo: '녹림 평원',
  width: 50,
  height: 50,
  type: 'field',
  spawns: { player: { x: 25, y: 25 } },
  portals: [
    { x: 25, y: 3, targetMap: 'village_01', targetX: 15, targetY: 23, label: '→ 무림촌' },
    { x: 47, y: 25, targetMap: 'dark_forest', targetX: 5, targetY: 15, label: '→ 흑림' },
  ],
  monsterConfig: {
    types: ['mon_wild_boar', 'mon_mountain_bandit', 'mon_poison_snake'],
    weights: [50, 30, 20],
    count: 8,
  },
  tiles: null, // generated procedurally
};

// =============================================================================
// Map 2: village_01 (무림촌) - 30x30 hand-crafted village
// =============================================================================

// prettier-ignore
const village_01_tiles = [
  // Row 0: top border - trees
  [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
  // Row 1: trees with grass interior
  [5,5,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,5,5],
  // Row 2: elder house top wall
  [5,5,0,0,0,0,0,0,0,0,0,0,4,4,4,4,4,4,0,0,0,0,0,0,0,0,0,0,5,5],
  // Row 3: elder house walls
  [5,0,0,0,0,5,0,0,0,0,0,0,4,2,2,2,2,4,0,0,0,0,0,0,5,0,0,0,0,5],
  // Row 4: elder house walls + interior
  [5,0,0,0,0,0,0,0,0,0,0,0,4,2,2,2,2,4,0,0,0,0,0,0,0,0,0,0,0,5],
  // Row 5: elder house bottom wall with door
  [5,0,0,0,0,0,0,0,0,0,0,0,4,4,1,1,4,4,0,0,0,0,0,0,0,0,0,0,0,5],
  // Row 6: path from elder house
  [5,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,5],
  // Row 7: open area, blacksmith top
  [5,0,0,4,4,4,4,4,0,0,0,0,0,1,1,1,1,0,0,0,0,0,4,4,4,4,4,0,0,5],
  // Row 8: blacksmith interior
  [5,0,0,4,2,2,2,4,0,0,0,0,0,1,1,1,1,0,0,0,0,0,4,2,2,2,4,0,0,5],
  // Row 9: blacksmith interior
  [5,0,0,4,2,2,2,4,0,0,0,0,0,0,1,1,0,0,0,0,0,0,4,2,2,2,4,0,0,5],
  // Row 10: blacksmith door
  [5,0,0,4,4,1,4,4,0,0,0,0,0,0,1,1,0,0,0,0,0,0,4,4,1,4,4,0,0,5],
  // Row 11: paths connecting buildings
  [5,0,0,0,0,1,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,1,0,0,0,0,5],
  // Row 12: main east-west path top
  [5,0,0,0,0,1,1,1,1,1,1,1,1,1,2,2,1,1,1,1,1,1,1,1,1,0,0,0,0,5],
  // Row 13: main east-west path + plaza
  [5,0,0,0,0,1,1,1,1,1,1,1,2,2,2,2,2,2,1,1,1,1,1,1,1,0,0,0,0,5],
  // Row 14: plaza center
  [5,0,0,0,0,0,0,0,1,1,2,2,2,2,2,2,2,2,2,2,1,1,0,0,0,0,0,0,0,5],
  // Row 15: plaza center
  [5,0,0,0,0,0,0,0,1,1,2,2,2,2,2,2,2,2,2,2,1,1,0,0,0,0,0,0,0,5],
  // Row 16: plaza bottom
  [5,0,0,0,0,1,1,1,1,1,1,1,2,2,2,2,2,2,1,1,1,1,1,1,1,0,0,0,0,5],
  // Row 17: main east-west path bottom
  [5,0,0,0,0,1,1,1,1,1,1,1,1,1,2,2,1,1,1,1,1,1,1,1,1,0,0,0,0,5],
  // Row 18: paths going south
  [5,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,5],
  // Row 19: pond area + grass
  [5,0,0,3,3,3,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,5,0,0,0,0,0,5],
  // Row 20: pond
  [5,0,3,3,3,3,3,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,5],
  // Row 21: pond bottom + trees
  [5,0,0,3,3,3,0,0,0,0,5,0,0,0,1,1,0,0,0,0,5,0,0,0,0,0,0,0,0,5],
  // Row 22: open grass
  [5,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,5],
  // Row 23: approaching village entrance
  [5,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,5],
  // Row 24: entrance area
  [5,0,0,0,0,5,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,5,0,0,0,0,5],
  // Row 25: entrance widening
  [5,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,5],
  // Row 26: entrance gate posts
  [5,0,0,0,0,0,0,0,0,0,4,1,1,1,1,1,1,1,1,4,0,0,0,0,0,0,0,0,0,5],
  // Row 27: entrance path
  [5,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,5],
  // Row 28: portal row (bottom entrance)
  [5,5,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,5,5],
  // Row 29: bottom border
  [5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5],
];

const village_01 = {
  id: 'village_01',
  nameKo: '무림촌',
  width: 30,
  height: 30,
  type: 'village',
  spawns: { player: { x: 15, y: 23 } },
  portals: [
    { x: 15, y: 27, targetMap: 'field_01', targetX: 25, targetY: 5, label: '→ 녹림 평원' },
  ],
  monsterConfig: null, // No monsters in village
  tiles: village_01_tiles,
  npcs: [
    { id: 'npc_elder', tileX: 14, tileY: 4, facing: 'down' },
    { id: 'npc_blacksmith', tileX: 5, tileY: 9, facing: 'down' },
    { id: 'npc_merchant', tileX: 24, tileY: 9, facing: 'down' },
    { id: 'npc_guard', tileX: 14, tileY: 26, facing: 'down' },
    { id: 'npc_herbalist', tileX: 4, tileY: 19, facing: 'right' },
  ],
};

// =============================================================================
// Map 3: dark_forest (흑림) - 40x40 dense dark forest
// =============================================================================

// Helper to generate 40x40 dark forest
function _buildDarkForestTiles() {
  const W = 40, H = 40;
  // Start with all trees
  const t = [];
  for (let y = 0; y < H; y++) {
    t.push(new Array(W).fill(5));
  }

  // Carve out main paths (dirt)
  // Horizontal main path at y=15 (entry from left)
  for (let x = 0; x < 20; x++) { t[14][x] = 1; t[15][x] = 1; t[16][x] = 1; }
  // Path curves south
  for (let y = 15; y < 25; y++) { t[y][18] = 1; t[y][19] = 1; t[y][20] = 1; }
  // Path goes east
  for (let x = 18; x < 35; x++) { t[23][x] = 1; t[24][x] = 1; t[25][x] = 1; }
  // Path goes north to ruins
  for (let y = 8; y < 24; y++) { t[y][33] = 1; t[y][34] = 1; }
  // Branch path south
  for (let y = 24; y < 36; y++) { t[y][26] = 1; t[y][27] = 1; }
  // Short branch west from center
  for (let x = 8; x < 19; x++) { t[24][x] = 1; t[25][x] = 1; }
  // Small loop path
  for (let x = 8; x < 14; x++) { t[30][x] = 1; t[31][x] = 1; }
  for (let y = 24; y < 31; y++) { t[y][8] = 1; t[y][9] = 1; }
  for (let y = 24; y < 31; y++) { t[y][13] = 1; t[y][14] = 1; }

  // Central clearing (grass)
  for (let y = 18; y < 28; y++) {
    for (let x = 15; x < 25; x++) {
      const dx = x - 20, dy = y - 23;
      if (dx * dx + dy * dy < 20) {
        t[y][x] = 0;
      }
    }
  }
  // Ensure paths through clearing
  for (let x = 15; x < 25; x++) { t[23][x] = 1; t[24][x] = 1; }

  // Stone ruins in the northeast (walls)
  for (let x = 30; x < 38; x++) { t[4][x] = 4; t[10][x] = 4; }
  for (let y = 4; y < 11; y++) { t[y][30] = 4; t[y][37] = 4; }
  // Ruin interior - stone floor
  for (let y = 5; y < 10; y++) {
    for (let x = 31; x < 37; x++) {
      t[y][x] = 2;
    }
  }
  // Ruin entrance
  t[10][33] = 2; t[10][34] = 2;

  // Streams (water) cutting through
  // Stream 1: diagonal from northwest
  for (let i = 0; i < 12; i++) {
    const sx = 3 + i, sy = 3 + i;
    if (sy < H && sx < W) { t[sy][sx] = 3; }
    if (sy < H && sx + 1 < W) { t[sy][sx + 1] = 3; }
  }
  // Stream 2: south area
  for (let x = 20; x < 32; x++) {
    t[33][x] = 3; t[34][x] = 3;
  }
  // Small pond
  for (let y = 32; y < 36; y++) {
    for (let x = 28; x < 33; x++) {
      t[y][x] = 3;
    }
  }

  // Make sure entry point is clear
  t[14][0] = 1; t[15][0] = 1; t[16][0] = 1;
  t[14][1] = 1; t[15][1] = 1; t[16][1] = 1;
  t[14][2] = 1; t[15][2] = 1; t[16][2] = 1;

  // Borders remain trees (already filled)
  // Add some scattered grass patches for variety
  const grassPatches = [
    [6, 5], [7, 6], [6, 6],
    [28, 28], [29, 28], [28, 29],
    [10, 34], [11, 34], [10, 35],
    [36, 18], [37, 18], [36, 19],
  ];
  for (const [x, y] of grassPatches) {
    if (y < H && x < W && t[y][x] === 5) t[y][x] = 0;
  }

  return t;
}

const dark_forest_tiles = _buildDarkForestTiles();

const dark_forest = {
  id: 'dark_forest',
  nameKo: '흑림',
  width: 40,
  height: 40,
  type: 'forest',
  spawns: { player: { x: 5, y: 15 } },
  portals: [
    { x: 0, y: 15, targetMap: 'field_01', targetX: 45, targetY: 25, label: '→ 녹림 평원' },
  ],
  monsterConfig: {
    types: ['mon_wild_boar', 'mon_mountain_bandit', 'mon_poison_snake', 'mon_gray_wolf'],
    weights: [20, 30, 20, 30],
    count: 14,
  },
  tiles: dark_forest_tiles,
};

// =============================================================================
// Exports
// =============================================================================

export const MAP_DATA = {
  field_01,
  village_01,
  dark_forest,
};

export function getMapData(mapId) {
  return MAP_DATA[mapId] || null;
}

export default MAP_DATA;
