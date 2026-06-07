// =============================================================================
// PreloadScene.js - Load game data and initialize game state
// =============================================================================

import Phaser from 'phaser';
import { loadGameData } from '../../data/GameDataLoader.js';

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    // --- Background ---
    this.cameras.main.setBackgroundColor('#0a0a1a');

    // --- Title ---
    this.add.text(width / 2, height / 2 - 80, '모두의 RPG', {
      fontSize: '48px',
      fontFamily: 'serif',
      color: '#ffcc66',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 - 30, 'Realtime Modular ARPG', {
      fontSize: '18px',
      fontFamily: 'monospace',
      color: '#aaaacc',
    }).setOrigin(0.5);

    // --- Loading bar ---
    const barWidth = 300;
    const barHeight = 20;
    const barX = (width - barWidth) / 2;
    const barY = height / 2 + 30;

    const barBg = this.add.graphics();
    barBg.fillStyle(0x222233, 0.8);
    barBg.fillRect(barX, barY, barWidth, barHeight);
    barBg.lineStyle(1, 0x4a4a6e);
    barBg.strokeRect(barX, barY, barWidth, barHeight);

    const barFill = this.add.graphics();

    const statusText = this.add.text(width / 2, barY + barHeight + 20, '새 기획 데이터 로딩 중...', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#888899',
    }).setOrigin(0.5);

    // --- Simulate loading steps ---
    const steps = [
      { text: '모듈/테이블 설계 로딩...', progress: 0.2 },
      { text: '아이템/몬스터 템플릿 로딩...', progress: 0.4 },
      { text: '스킬/전투 액션 로딩...', progress: 0.6 },
      { text: '박스 스프라이트 초기화...', progress: 0.8 },
      { text: '로딩 완료!', progress: 1.0 },
    ];

    // Load game data (admin localStorage → defaults fallback)
    const gameData = loadGameData();
    this._validateData(gameData);

    // Store data on registry for access across scenes
    this.registry.set('items', gameData.items);
    this.registry.set('monsters', gameData.monsters);
    this.registry.set('skills', gameData.skills);
    this.registry.set('playerDefaults', gameData.playerDefaults);
    this.registry.set('gameData', gameData);

    let stepIndex = 0;
    const stepTimer = this.time.addEvent({
      delay: 300,
      callback: () => {
        if (stepIndex >= steps.length) return;

        const step = steps[stepIndex];
        statusText.setText(step.text);

        barFill.clear();
        barFill.fillStyle(0x33cc66, 0.9);
        barFill.fillRect(barX + 2, barY + 2, (barWidth - 4) * step.progress, barHeight - 4);

        stepIndex++;

        if (stepIndex >= steps.length) {
          // All done, transition after brief pause
          this.time.delayedCall(500, () => {
            this.scene.start('WorldScene');
          });
        }
      },
      repeat: steps.length - 1,
    });
  }

  _validateData(gameData) {
    const itemCount = Object.keys(gameData.items).length;
    const monsterCount = Object.keys(gameData.monsters).length;
    const skillCount = Object.keys(gameData.skills).length;

    console.log(`[PreloadScene] Loaded ${itemCount} items, ${monsterCount} monsters, ${skillCount} skills`);

    if (itemCount === 0) console.warn('[PreloadScene] No items loaded!');
    if (monsterCount === 0) console.warn('[PreloadScene] No monsters loaded!');
    if (skillCount === 0) console.warn('[PreloadScene] No skills loaded!');
  }
}
