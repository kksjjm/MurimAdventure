// =============================================================================
// NavigationSystem.js - Tile-aware 4-way pathfinding for actors
// =============================================================================

const DEFAULT_TILE_SIZE = 32;
const MAX_SEARCH_NODES = 900;

export default class NavigationSystem {
  constructor(scene, collisionData, tileSize = DEFAULT_TILE_SIZE) {
    this.scene = scene;
    this.collisionData = collisionData || [];
    this.tileSize = tileSize;
    this.height = this.collisionData.length;
    this.width = this.height > 0 ? this.collisionData[0].length : 0;
  }

  worldToTile(x, y) {
    return {
      x: Math.floor(x / this.tileSize),
      y: Math.floor(y / this.tileSize),
    };
  }

  tileToWorld(x, y) {
    return {
      x: x * this.tileSize + this.tileSize / 2,
      y: y * this.tileSize + this.tileSize / 2,
    };
  }

  isWalkable(x, y) {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return false;
    return !this.collisionData?.[y]?.[x];
  }

  getNextWorldStep(fromWorldX, fromWorldY, toWorldX, toWorldY) {
    const start = this.worldToTile(fromWorldX, fromWorldY);
    const goal = this.worldToTile(toWorldX, toWorldY);
    const path = this.findPath(start, goal);
    if (path.length < 2) return null;
    return this.tileToWorld(path[1].x, path[1].y);
  }

  findPath(start, goal) {
    if (!this.isWalkable(start.x, start.y) || !this.isWalkable(goal.x, goal.y)) {
      return [];
    }
    if (start.x === goal.x && start.y === goal.y) return [start];

    const open = [{ ...start, g: 0, f: this._heuristic(start, goal), parentKey: null }];
    const best = new Map([[this._key(start), open[0]]]);
    const closed = new Set();
    let visited = 0;

    while (open.length && visited < MAX_SEARCH_NODES) {
      open.sort((a, b) => a.f - b.f);
      const current = open.shift();
      const currentKey = this._key(current);
      if (closed.has(currentKey)) continue;
      closed.add(currentKey);
      visited++;

      if (current.x === goal.x && current.y === goal.y) {
        return this._reconstructPath(current, best);
      }

      for (const next of this._neighbors(current)) {
        const nextKey = this._key(next);
        if (closed.has(nextKey)) continue;

        const g = current.g + 1;
        const previous = best.get(nextKey);
        if (previous && previous.g <= g) continue;

        const node = {
          ...next,
          g,
          f: g + this._heuristic(next, goal),
          parentKey: currentKey,
        };
        best.set(nextKey, node);
        open.push(node);
      }
    }

    return [];
  }

  _neighbors(tile) {
    return [
      { x: tile.x + 1, y: tile.y },
      { x: tile.x - 1, y: tile.y },
      { x: tile.x, y: tile.y + 1 },
      { x: tile.x, y: tile.y - 1 },
    ].filter(next => this.isWalkable(next.x, next.y));
  }

  _heuristic(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }

  _key(tile) {
    return `${tile.x},${tile.y}`;
  }

  _reconstructPath(goalNode, nodeMap) {
    const path = [];
    let current = goalNode;
    while (current) {
      path.push({ x: current.x, y: current.y });
      current = current.parentKey ? nodeMap.get(current.parentKey) : null;
    }
    return path.reverse();
  }
}
