// =============================================================================
// CustomSpriteLoader - Load custom sprites from localStorage into Phaser
// =============================================================================

export default class CustomSpriteLoader {
  static STORAGE_KEY = 'murimAdventure_customSprites';

  static getCustomSprites() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
    } catch { return {}; }
  }

  static clearStoredSprites() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch {}
  }

  static hasCustomSprite(key) {
    const sprites = this.getCustomSprites();
    return !!sprites[key];
  }

  /**
   * Load all custom sprites into Phaser's texture manager.
   * Call this at the end of BootScene.create() before transitioning scenes.
   * @param {Phaser.Scene} scene
   * @returns {Promise<void>}
   */
  static loadIntoScene(scene, options = {}) {
    const customs = this.getCustomSprites();
    const keys = Object.keys(customs).filter(key => (
      typeof options.allowKey !== 'function' || options.allowKey(key, customs[key])
    ));
    if (keys.length === 0) return Promise.resolve();

    return new Promise(resolve => {
      let loaded = 0;
      const finishOne = () => {
        loaded++;
        if (loaded >= keys.length) resolve();
      };

      for (const key of keys) {
        const data = customs[key];
        if (!data || !data.dataUrl) {
          finishOne();
          continue;
        }

        const img = new Image();
        img.onload = () => {
          try {
            const fw = Number(data.frameWidth) || img.width;
            const fh = Number(data.frameHeight) || img.height;
            const isSheet = fw > 0 && fh > 0 && (img.width > fw || img.height > fh);

            if (fw <= 0 || fh <= 0 || img.width < fw || img.height < fh) {
              console.warn(`[CustomSpriteLoader] Skipping invalid sprite ${key}`, {
                width: img.width,
                height: img.height,
                frameWidth: data.frameWidth,
                frameHeight: data.frameHeight,
              });
              return;
            }

            // Remove existing texture if any
            if (scene.textures.exists(key)) {
              scene.textures.remove(key);
            }

            if (isSheet) {
              scene.textures.addSpriteSheet(key, img, {
                frameWidth: fw,
                frameHeight: fh,
              });
            } else {
              scene.textures.addImage(key, img);
            }
          } catch (error) {
            console.warn(`[CustomSpriteLoader] Failed to load custom sprite: ${key}`, error);
          } finally {
            finishOne();
          }
        };
        img.onerror = () => {
          console.warn(`[CustomSpriteLoader] Failed to decode custom sprite image: ${key}`);
          finishOne();
        };
        img.src = data.dataUrl;
      }
    });
  }
}
