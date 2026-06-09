// =============================================================================
// CustomSpriteLoader - Load custom sprites from localStorage into Phaser
// =============================================================================

export default class CustomSpriteLoader {
  static STORAGE_KEY = 'murimAdventure_customSprites';
  static WORKSPACE_VERSION_KEY = 'murimAdventure_spriteWorkspaceVersion';
  static WORKSPACE_VERSION = '960-32x64-v1';

  static ensureWorkspaceVersion() {
    try {
      if (localStorage.getItem(this.WORKSPACE_VERSION_KEY) === this.WORKSPACE_VERSION) return;
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.setItem(this.WORKSPACE_VERSION_KEY, this.WORKSPACE_VERSION);
    } catch {}
  }

  static getCustomSprites() {
    try {
      this.ensureWorkspaceVersion();
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
            const logicalFw = Number(data.logicalFrameWidth) || fw;
            const logicalFh = Number(data.logicalFrameHeight) || fh;
            const sourceFrames = Math.max(1, fw > 0 ? Math.floor(img.width / fw) : 1);
            const needsScaleForGame = logicalFw > 0 && logicalFh > 0 && (logicalFw !== fw || logicalFh !== fh);

            if (fw <= 0 || fh <= 0 || logicalFw <= 0 || logicalFh <= 0 || img.width < fw || img.height < fh) {
              console.warn(`[CustomSpriteLoader] Skipping invalid sprite ${key}`, {
                width: img.width,
                height: img.height,
                frameWidth: data.frameWidth,
                frameHeight: data.frameHeight,
                logicalFrameWidth: data.logicalFrameWidth,
                logicalFrameHeight: data.logicalFrameHeight,
              });
              return;
            }

            // Remove existing texture if any
            if (scene.textures.exists(key)) {
              scene.textures.remove(key);
            }

            let textureImage = img;
            let textureFrameWidth = fw;
            let textureFrameHeight = fh;

            if (needsScaleForGame) {
              const canvas = document.createElement('canvas');
              canvas.width = logicalFw * sourceFrames;
              canvas.height = logicalFh;
              const ctx = canvas.getContext('2d');
              ctx.imageSmoothingEnabled = false;

              for (let frame = 0; frame < sourceFrames; frame++) {
                ctx.drawImage(
                  img,
                  frame * fw,
                  0,
                  fw,
                  fh,
                  frame * logicalFw,
                  0,
                  logicalFw,
                  logicalFh
                );
              }

              textureImage = canvas;
              textureFrameWidth = logicalFw;
              textureFrameHeight = logicalFh;
            }

            const isSheet = sourceFrames > 1 || textureImage.width > textureFrameWidth || textureImage.height > textureFrameHeight;
            if (isSheet) {
              scene.textures.addSpriteSheet(key, textureImage, {
                frameWidth: textureFrameWidth,
                frameHeight: textureFrameHeight,
              });
            } else {
              scene.textures.addImage(key, textureImage);
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
