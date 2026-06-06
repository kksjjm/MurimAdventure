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
  static loadIntoScene(scene) {
    const customs = this.getCustomSprites();
    const keys = Object.keys(customs);
    if (keys.length === 0) return Promise.resolve();

    return new Promise(resolve => {
      let loaded = 0;
      for (const key of keys) {
        const data = customs[key];
        const img = new Image();
        img.onload = () => {
          // Remove existing texture if any
          if (scene.textures.exists(key)) {
            scene.textures.remove(key);
          }
          // Add as spritesheet or image
          if (data.frameWidth && data.frameHeight) {
            scene.textures.addSpriteSheet(key, img, {
              frameWidth: data.frameWidth,
              frameHeight: data.frameHeight,
            });
          } else {
            scene.textures.addImage(key, img);
          }
          loaded++;
          if (loaded >= keys.length) resolve();
        };
        img.onerror = () => {
          loaded++;
          if (loaded >= keys.length) resolve();
        };
        img.src = data.dataUrl;
      }
    });
  }
}
