// =============================================================================
// SaveSystem.js - Save/Load System (localStorage + file export/import)
// =============================================================================

const SAVE_KEY = 'murimAdventure_save';
const AUTOSAVE_KEY = 'murimAdventure_autosave';
const SAVE_VERSION = 1;
const TILE_SIZE = 32;

export default class SaveSystem {
  constructor() {
    /** Accumulated play time in seconds (carried over from previous sessions). */
    this.playTimeSeconds = 0;

    /** Timestamp when the current session started tracking play time. */
    this._sessionStart = Date.now();
  }

  // ===========================================================================
  // Core save / load
  // ===========================================================================

  /**
   * Build the save data object from live game state.
   * @param {object} player   - Player entity instance
   * @param {string} mapId    - Current map identifier (e.g. 'field_01')
   * @param {object} proficiencySystem - ProficiencySystem instance (has toJSON)
   * @returns {object} serialisable save data
   */
  _buildSaveData(player, mapId, proficiencySystem) {
    // Accumulate play time up to now
    const now = Date.now();
    const sessionElapsed = Math.floor((now - this._sessionStart) / 1000);
    const totalPlayTime = this.playTimeSeconds + sessionElapsed;

    // Serialise equipment — store only plain item data (strip Phaser refs)
    const equipment = {};
    for (const slot of Object.keys(player.equipment)) {
      const item = player.equipment[slot];
      equipment[slot] = item ? { ...item } : null;
    }

    // Serialise inventory
    const inventory = player.inventory.map((entry) => ({
      itemId: entry.itemId,
      quantity: entry.quantity,
    }));

    // Serialise skills & skill slots
    const skills = [...player.skills];
    const skillSlots = [...player.skillSlots];

    // Serialise stats (shallow copy, all primitives)
    const stats = { ...player.stats };

    // Proficiency data via ProficiencySystem.toJSON()
    const proficiency = proficiencySystem ? proficiencySystem.toJSON() : { weapon: {}, skill: {} };

    return {
      version: SAVE_VERSION,
      timestamp: now,
      playTime: totalPlayTime,
      player: {
        stats,
        equipment,
        inventory,
        skills,
        skillSlots,
      },
      proficiency,
      map: {
        id: mapId || 'field_01',
        x: Math.round(player.x),
        y: Math.round(player.y),
        tileX: Math.floor(player.x / TILE_SIZE),
        tileY: Math.floor(player.y / TILE_SIZE),
      },
    };
  }

  /**
   * Save current game state to localStorage.
   * @param {object} player
   * @param {string} mapId
   * @param {object} proficiencySystem
   */
  save(player, mapId, proficiencySystem) {
    const data = this._buildSaveData(player, mapId, proficiencySystem);
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
      // Reset session timer so subsequent saves don't double-count
      this.playTimeSeconds = data.playTime;
      this._sessionStart = Date.now();
      return true;
    } catch (err) {
      console.error('[SaveSystem] Failed to save:', err);
      return false;
    }
  }

  /**
   * Auto-save to a separate localStorage key.
   * @param {object} player
   * @param {string} mapId
   * @param {object} proficiencySystem
   */
  autoSave(player, mapId, proficiencySystem) {
    const data = this._buildSaveData(player, mapId, proficiencySystem);
    try {
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(data));
      this.playTimeSeconds = data.playTime;
      this._sessionStart = Date.now();
      return true;
    } catch (err) {
      console.error('[SaveSystem] Failed to auto-save:', err);
      return false;
    }
  }

  /**
   * Load and validate save data from localStorage.
   * @param {string} [key=SAVE_KEY] - localStorage key to load from
   * @returns {object|null} parsed save data, or null if missing / invalid
   */
  load(key = SAVE_KEY) {
    return this._readSave(key, true);
  }

  /**
   * Load the newest valid save across manual save and auto-save.
   * This keeps in-game load behavior unified even if the latest snapshot came
   * from the auto-save timer.
   * @returns {object|null}
   */
  loadLatest() {
    const saves = [
      this._readSave(SAVE_KEY, false),
      this._readSave(AUTOSAVE_KEY, false),
    ].filter(Boolean);

    if (!saves.length) return null;

    const newest = saves.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))[0];
    if (typeof newest.playTime === 'number') {
      this.playTimeSeconds = newest.playTime;
      this._sessionStart = Date.now();
    }
    return newest;
  }

  _readSave(key, restorePlayTime) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;

      const data = JSON.parse(raw);
      if (!this._validate(data)) {
        console.warn('[SaveSystem] Save data failed validation.');
        return null;
      }

      // Restore accumulated play time for the session counter
      if (restorePlayTime && typeof data.playTime === 'number') {
        this.playTimeSeconds = data.playTime;
        this._sessionStart = Date.now();
      }

      // Clear transient runtime data that should not persist across sessions
      // Skill cooldowns — reset so skills are immediately available on load
      // (cooldowns are tracked at runtime only, not saved)
      // Buffs — cleared on load
      return data;
    } catch (err) {
      console.error('[SaveSystem] Failed to load:', err);
      return null;
    }
  }

  /**
   * Check whether a manual save exists.
   * @returns {boolean}
   */
  hasSave() {
    return localStorage.getItem(SAVE_KEY) !== null;
  }

  /**
   * Check whether an auto-save exists.
   * @returns {boolean}
   */
  hasAutoSave() {
    return localStorage.getItem(AUTOSAVE_KEY) !== null;
  }

  /**
   * Delete the manual save.
   */
  deleteSave() {
    localStorage.removeItem(SAVE_KEY);
  }

  /**
   * Delete the auto-save.
   */
  deleteAutoSave() {
    localStorage.removeItem(AUTOSAVE_KEY);
  }

  // ===========================================================================
  // File export / import
  // ===========================================================================

  /**
   * Export the current game state as a downloadable JSON file.
   * Triggers a browser download.
   * @param {object} player
   * @param {string} mapId
   * @param {object} proficiencySystem
   */
  exportToFile(player, mapId, proficiencySystem) {
    const data = this._buildSaveData(player, mapId, proficiencySystem);
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    a.download = `murimAdventure_save_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Open a file picker, read the selected JSON file, validate it,
   * and store it into localStorage as the manual save.
   * @returns {Promise<object|null>} the imported save data, or null on failure
   */
  importFromFile() {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json,application/json';

      input.addEventListener('change', () => {
        const file = input.files && input.files[0];
        if (!file) {
          resolve(null);
          return;
        }

        const reader = new FileReader();
        reader.onload = () => {
          try {
            const data = JSON.parse(reader.result);
            if (!this._validate(data)) {
              console.warn('[SaveSystem] Imported file failed validation.');
              resolve(null);
              return;
            }
            localStorage.setItem(SAVE_KEY, JSON.stringify(data));
            resolve(data);
          } catch (err) {
            console.error('[SaveSystem] Failed to parse imported file:', err);
            resolve(null);
          }
        };
        reader.onerror = () => {
          console.error('[SaveSystem] Failed to read file.');
          resolve(null);
        };
        reader.readAsText(file);
      });

      // If the user cancels the file picker, resolve null after a timeout
      input.addEventListener('cancel', () => resolve(null));

      input.click();
    });
  }

  // ===========================================================================
  // Play time helpers
  // ===========================================================================

  /**
   * Get total play time including the current session, formatted as HH:MM:SS.
   * @returns {string}
   */
  getPlayTime() {
    const sessionElapsed = Math.floor((Date.now() - this._sessionStart) / 1000);
    const total = this.playTimeSeconds + sessionElapsed;
    return this._formatTime(total);
  }

  /**
   * Get total play time in raw seconds (including current session).
   * @returns {number}
   */
  getPlayTimeSeconds() {
    const sessionElapsed = Math.floor((Date.now() - this._sessionStart) / 1000);
    return this.playTimeSeconds + sessionElapsed;
  }

  /**
   * Format seconds into HH:MM:SS string.
   * @param {number} totalSeconds
   * @returns {string}
   */
  _formatTime(totalSeconds) {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return [
      String(h).padStart(2, '0'),
      String(m).padStart(2, '0'),
      String(s).padStart(2, '0'),
    ].join(':');
  }

  // ===========================================================================
  // Validation
  // ===========================================================================

  /**
   * Validate that the save data has the expected structure.
   * @param {object} data
   * @returns {boolean}
   */
  _validate(data) {
    if (!data || typeof data !== 'object') return false;

    // Version check
    if (data.version !== SAVE_VERSION) {
      console.warn(`[SaveSystem] Unknown save version: ${data.version} (expected ${SAVE_VERSION})`);
      return false;
    }

    // Timestamp
    if (typeof data.timestamp !== 'number') return false;

    // Play time
    if (typeof data.playTime !== 'number') return false;

    // Player block
    if (!data.player || typeof data.player !== 'object') return false;
    if (!data.player.stats || typeof data.player.stats !== 'object') return false;
    if (!data.player.equipment || typeof data.player.equipment !== 'object') return false;
    if (!Array.isArray(data.player.inventory)) return false;
    if (!Array.isArray(data.player.skills)) return false;
    if (!Array.isArray(data.player.skillSlots)) return false;

    // Required stat fields
    const requiredStats = ['level', 'exp', 'gold', 'HP', 'MP', 'maxHP', 'maxMP'];
    for (const stat of requiredStats) {
      if (typeof data.player.stats[stat] !== 'number') return false;
    }

    // Proficiency block
    if (!data.proficiency || typeof data.proficiency !== 'object') return false;

    // Map block
    if (!data.map || typeof data.map !== 'object') return false;
    if (typeof data.map.id !== 'string') return false;
    if (typeof data.map.x !== 'number') return false;
    if (typeof data.map.y !== 'number') return false;

    return true;
  }
}
