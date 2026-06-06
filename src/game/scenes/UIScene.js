// =============================================================================
// UIScene.js - HUD overlay scene (runs parallel to WorldScene)
// =============================================================================

import Phaser from 'phaser';
import { ITEMS_BY_ID, SKILLS_BY_ID, getExpForLevel } from '../../data/defaultData.js';
import { EQUIPMENT_SLOTS, ITEM_RARITY, getProficiencyLevel, getRarityDisplay } from '../../data/constants.js';
import SaveSystem from '../systems/SaveSystem.js';

export default class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene' });
    this.activePanel = null; // 'inventory' | 'equipment' | 'skills' | 'character' | null
  }

  init(data) {
    this.worldScene = data.worldScene;
  }

  create() {
    const { width, height } = this.cameras.main;

    // --- HP Bar ---
    this._createBar('hp', 10, 10, 180, 14, 0xcc3333, 0x440000);
    // --- MP Bar ---
    this._createBar('mp', 10, 30, 180, 14, 0x3366cc, 0x001144);
    // --- EXP Bar ---
    this._createBar('exp', (width - 300) / 2, height - 24, 300, 12, 0x33cc66, 0x003311);

    // --- Level Display ---
    this.levelText = this.add.text(10, 50, 'Lv. 1', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    }).setDepth(1001);

    // --- Gold Display ---
    this.goldText = this.add.text(10, 70, 'Gold: 100', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#ffcc00',
      stroke: '#000000',
      strokeThickness: 2,
    }).setDepth(1001);

    // --- Skill Slots (bottom center) ---
    this._createSkillSlots(width, height);

    // --- Menu Buttons (right side) ---
    this._createMenuButtons(width);

    // --- Proficiency display ---
    this.profText = this.add.text(10, 90, '', {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#aaaacc',
      stroke: '#000000',
      strokeThickness: 2,
    }).setDepth(1001);

    // --- Panel container (for modal panels) ---
    this.panelContainer = this.add.container(0, 0);
    this.panelContainer.setDepth(2000);
    this.panelContainer.setVisible(false);

    // --- Listen to world scene events ---
    const ws = this.worldScene;
    if (ws) {
      ws.events.on('player-stats-changed', this._updateHUD, this);
      ws.events.on('player-levelup', this._onLevelUp, this);
      ws.events.on('exp-changed', this._updateExpBar, this);
      ws.events.on('inventory-changed', this._onInventoryChanged, this);
      ws.events.on('equipment-changed', this._onEquipmentChanged, this);
      ws.events.on('proficiency-levelup', this._onProfLevelUp, this);
    }

    // ESC to close panels
    this.input.keyboard.on('keydown-ESC', () => {
      this._closePanel();
    });

    // M for minimap toggle
    this.input.keyboard.on('keydown-M', () => {
      if (this.worldScene) this.worldScene.toggleMinimap();
    });

    // --- Save System ---
    this.saveSystem = new SaveSystem();

    // F5 to quick save
    this.input.keyboard.on('keydown-F5', (e) => {
      e.preventDefault();
      this._doSave();
    });
    // F9 to quick load
    this.input.keyboard.on('keydown-F9', (e) => {
      e.preventDefault();
      this._doLoadLast();
    });

    // Auto-save every 60 seconds
    this.time.addEvent({
      delay: 60000,
      callback: () => this._doAutoSave(),
      loop: true,
    });

    // Initial HUD update
    this._updateHUD();
  }

  // ==========================================================================
  // Bars
  // ==========================================================================

  _createBar(key, x, y, w, h, fillColor, bgColor) {
    const bg = this.add.graphics();
    bg.fillStyle(bgColor, 0.8);
    bg.fillRect(x, y, w, h);
    bg.lineStyle(1, 0x888888, 0.5);
    bg.strokeRect(x, y, w, h);
    bg.setDepth(1000);

    const fill = this.add.graphics();
    fill.setDepth(1001);

    const text = this.add.text(x + w / 2, y + h / 2, '', {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5).setDepth(1002);

    this[`${key}BarBg`] = bg;
    this[`${key}BarFill`] = fill;
    this[`${key}BarText`] = text;
    this[`${key}BarConfig`] = { x, y, w, h, fillColor };
  }

  _updateBar(key, current, max) {
    const config = this[`${key}BarConfig`];
    if (!config) return;

    const fill = this[`${key}BarFill`];
    const text = this[`${key}BarText`];
    const pct = Math.max(0, Math.min(1, current / max));

    fill.clear();
    fill.fillStyle(config.fillColor, 0.9);
    fill.fillRect(config.x + 1, config.y + 1, (config.w - 2) * pct, config.h - 2);

    text.setText(`${Math.floor(current)} / ${Math.floor(max)}`);
  }

  // ==========================================================================
  // Skill Slots
  // ==========================================================================

  _createSkillSlots(width, height) {
    this.skillSlotGfx = [];
    this.skillSlotTexts = [];
    const slotSize = 40;
    const gap = 6;
    const totalWidth = 5 * slotSize + 4 * gap;
    const startX = (width - totalWidth) / 2;
    const startY = height - 70;

    for (let i = 0; i < 5; i++) {
      const sx = startX + i * (slotSize + gap);

      // Slot background
      const bg = this.add.graphics();
      bg.fillStyle(0x1a1a2e, 0.9);
      bg.fillRect(sx, startY, slotSize, slotSize);
      bg.lineStyle(1, 0x4a4a6e);
      bg.strokeRect(sx, startY, slotSize, slotSize);
      bg.setDepth(1000);

      // Key number
      const keyText = this.add.text(sx + 2, startY + 1, `${i + 1}`, {
        fontSize: '9px',
        fontFamily: 'monospace',
        color: '#666688',
      }).setDepth(1002);

      // Skill name
      const skillText = this.add.text(sx + slotSize / 2, startY + slotSize / 2, '', {
        fontSize: '8px',
        fontFamily: 'monospace',
        color: '#ccccee',
        align: 'center',
        wordWrap: { width: slotSize - 4 },
      }).setOrigin(0.5).setDepth(1002);

      // Cooldown overlay
      const cdOverlay = this.add.graphics();
      cdOverlay.setDepth(1001);

      this.skillSlotGfx.push({ bg, cdOverlay, sx, sy: startY, size: slotSize });
      this.skillSlotTexts.push(skillText);
    }
  }

  _updateSkillSlots() {
    if (!this.worldScene || !this.worldScene.player) return;
    const player = this.worldScene.player;

    for (let i = 0; i < 5; i++) {
      const skillId = player.skillSlots[i];
      const text = this.skillSlotTexts[i];
      const gfx = this.skillSlotGfx[i];

      if (skillId && SKILLS_BY_ID[skillId]) {
        const skill = SKILLS_BY_ID[skillId];
        text.setText(skill.nameKo || skill.name);

        // Cooldown / Duration overlay
        gfx.cdOverlay.clear();
        const now = Date.now();

        // Check if skill is actively channeling/buffing (green overlay)
        const activeEffect = player.activeSkillEffects[skillId] || player.channelEffects[skillId];
        if (activeEffect) {
          const elapsed = now - activeEffect.startTime;
          const dur = activeEffect.duration;
          const remaining = Math.max(0, dur - elapsed);
          if (remaining > 0) {
            const pct = remaining / dur;
            gfx.cdOverlay.fillStyle(0x00aa44, 0.4);
            gfx.cdOverlay.fillRect(gfx.sx, gfx.sy + gfx.size * (1 - pct), gfx.size, gfx.size * pct);
          }
        }

        // Cooldown overlay (dark, on top)
        const lastUsed = player.skillCooldowns[skillId] || 0;
        const cd = skill.cooldown || 0;
        const cdRemaining = Math.max(0, cd - (now - lastUsed));
        if (cdRemaining > 0 && cd > 0) {
          const pct = cdRemaining / cd;
          gfx.cdOverlay.fillStyle(0x000000, 0.6);
          gfx.cdOverlay.fillRect(gfx.sx, gfx.sy, gfx.size, gfx.size * pct);
        }
      } else {
        text.setText('');
        gfx.cdOverlay.clear();
      }
    }
  }

  // ==========================================================================
  // Menu Buttons
  // ==========================================================================

  _createMenuButtons(screenWidth) {
    const buttons = [
      { label: '가방 (I)', key: 'inventory', hotkey: 'I' },
      { label: '장비 (E)', key: 'equipment', hotkey: 'E' },
      { label: '무공 (K)', key: 'skills', hotkey: 'K' },
      { label: '정보 (C)', key: 'character', hotkey: 'C' },
      { label: '저장 (F5)', key: 'save', hotkey: null },
      { label: '불러오기', key: 'load', hotkey: null },
    ];

    const btnW = 80;
    const btnH = 24;
    const gap = 4;
    const startX = screenWidth - btnW - 10;
    const startY = 170;

    buttons.forEach((btn, i) => {
      const by = startY + i * (btnH + gap);

      const bg = this.add.graphics();
      bg.fillStyle(0x2a2a4e, 0.9);
      bg.fillRect(startX, by, btnW, btnH);
      bg.lineStyle(1, 0x4a4a6e);
      bg.strokeRect(startX, by, btnW, btnH);
      bg.setDepth(1000);

      const text = this.add.text(startX + btnW / 2, by + btnH / 2, btn.label, {
        fontSize: '11px',
        fontFamily: 'monospace',
        color: '#ccccee',
      }).setOrigin(0.5).setDepth(1001);

      // Make interactive
      const hitZone = this.add.zone(startX + btnW / 2, by + btnH / 2, btnW, btnH)
        .setInteractive()
        .setDepth(1003);

      hitZone.on('pointerover', () => {
        bg.clear();
        bg.fillStyle(0x3a3a6e, 0.9);
        bg.fillRect(startX, by, btnW, btnH);
        bg.lineStyle(1, 0x6a6a9e);
        bg.strokeRect(startX, by, btnW, btnH);
      });
      hitZone.on('pointerout', () => {
        bg.clear();
        bg.fillStyle(0x2a2a4e, 0.9);
        bg.fillRect(startX, by, btnW, btnH);
        bg.lineStyle(1, 0x4a4a6e);
        bg.strokeRect(startX, by, btnW, btnH);
      });
      hitZone.on('pointerdown', () => {
        this._togglePanel(btn.key);
      });

      // Hotkey
      this.input.keyboard.on(`keydown-${btn.hotkey}`, () => {
        this._togglePanel(btn.key);
      });
    });
  }

  // ==========================================================================
  // Panel System
  // ==========================================================================

  _togglePanel(panelKey) {
    // Save/Load are actions, not panels
    if (panelKey === 'save') {
      this._doSave();
      return;
    }
    if (panelKey === 'load') {
      this._showPanel('load');
      return;
    }

    if (this.activePanel === panelKey) {
      this._closePanel();
    } else {
      this._showPanel(panelKey);
    }
  }

  _closePanel() {
    this._hideTooltip();
    this.panelContainer.removeAll(true);
    this.panelContainer.setVisible(false);
    this.activePanel = null;
  }

  _showPanel(panelKey) {
    this._closePanel();
    this.activePanel = panelKey;
    this.panelContainer.setVisible(true);

    switch (panelKey) {
      case 'inventory':
        this._drawInventoryPanel();
        break;
      case 'equipment':
        this._drawEquipmentPanel();
        break;
      case 'skills':
        this._drawSkillPanel();
        break;
      case 'character':
        this._drawCharacterPanel();
        break;
      case 'load':
        this._drawLoadPanel();
        break;
    }
  }

  // --- Inventory Panel ---
  _drawInventoryPanel() {
    const { width, height } = this.cameras.main;
    const pw = 320;
    const ph = 400;
    const px = (width - pw) / 2;
    const py = (height - ph) / 2;

    // Panel background
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 0.95);
    bg.fillRect(px, py, pw, ph);
    bg.fillStyle(0x2a2a4e, 1.0);
    bg.fillRect(px, py, pw, 28);
    bg.lineStyle(2, 0x4a4a6e);
    bg.strokeRect(px, py, pw, ph);
    this.panelContainer.add(bg);

    // Title
    const title = this.add.text(px + pw / 2, py + 14, '가방 (Inventory)', {
      fontSize: '13px', fontFamily: 'monospace', color: '#ffcc66',
    }).setOrigin(0.5);
    this.panelContainer.add(title);

    // Close button
    this._addCloseButton(px + pw - 20, py + 14);

    // Grid of items
    const player = this.worldScene.player;
    if (!player) return;

    const gridCols = 6;
    const cellSize = 42;
    const gridX = px + 15;
    const gridY = py + 40;

    player.inventory.forEach((invEntry, idx) => {
      const itemData = ITEMS_BY_ID[invEntry.itemId];
      if (!itemData) return;

      const col = idx % gridCols;
      const row = Math.floor(idx / gridCols);
      const cx = gridX + col * (cellSize + 4);
      const cy = gridY + row * (cellSize + 4);

      // Item slot bg
      const slotBg = this.add.graphics();
      slotBg.fillStyle(0x222244, 0.8);
      slotBg.fillRect(cx, cy, cellSize, cellSize);
      slotBg.lineStyle(1, 0x444466);
      slotBg.strokeRect(cx, cy, cellSize, cellSize);
      this.panelContainer.add(slotBg);

      // Item icon (map type to icon key)
      const iconMap = { WEAPON: 'icon_sword', ARMOR: 'icon_armor', ACCESSORY: 'icon_staff', CONSUMABLE: 'icon_potion' };
      const iconKey = itemData.icon || iconMap[itemData.type] || 'icon_potion';
      const icon = this.add.image(cx + cellSize / 2, cy + cellSize / 2 - 4, iconKey);
      icon.setScale(2);
      this.panelContainer.add(icon);

      // Quantity
      if (invEntry.quantity > 1) {
        const qtyText = this.add.text(cx + cellSize - 3, cy + cellSize - 3, `${invEntry.quantity}`, {
          fontSize: '9px', fontFamily: 'monospace', color: '#ffffff',
          stroke: '#000000', strokeThickness: 2,
        }).setOrigin(1, 1);
        this.panelContainer.add(qtyText);
      }

      // Item name below icon
      const nameText = this.add.text(cx + cellSize / 2, cy + cellSize - 2, itemData.nameKo || itemData.name, {
        fontSize: '7px', fontFamily: 'monospace', color: '#aaaacc',
      }).setOrigin(0.5, 1);
      this.panelContainer.add(nameText);

      // Click to use/equip
      const zone = this.add.zone(cx + cellSize / 2, cy + cellSize / 2, cellSize, cellSize)
        .setInteractive();
      this.panelContainer.add(zone);

      zone.on('pointerdown', () => {
        if (itemData.type === 'CONSUMABLE') {
          player.useConsumable(invEntry.itemId);
          this._showPanel('inventory'); // refresh
        } else if (itemData.slot) {
          player.equip(itemData, itemData.slot);
          this._showPanel('inventory'); // refresh
        }
      });

      // Tooltip on hover
      zone.on('pointerover', () => {
        this._showTooltip(cx + cellSize + 5, cy, itemData);
      });
      zone.on('pointerout', () => {
        this._hideTooltip();
      });
    });
  }

  // --- Equipment Panel ---
  _drawEquipmentPanel() {
    const { width, height } = this.cameras.main;
    const pw = 320;
    const ph = 420;
    const px = (width - pw) / 2;
    const py = (height - ph) / 2;

    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 0.95);
    bg.fillRect(px, py, pw, ph);
    bg.fillStyle(0x2a2a4e, 1.0);
    bg.fillRect(px, py, pw, 28);
    bg.lineStyle(2, 0x4a4a6e);
    bg.strokeRect(px, py, pw, ph);
    this.panelContainer.add(bg);

    const title = this.add.text(px + pw / 2, py + 14, '장비 (Equipment)', {
      fontSize: '13px', fontFamily: 'monospace', color: '#ffcc66',
    }).setOrigin(0.5);
    this.panelContainer.add(title);

    this._addCloseButton(px + pw - 20, py + 14);

    const player = this.worldScene.player;
    if (!player) return;

    // Character silhouette (simple)
    const silGfx = this.add.graphics();
    const sx = px + pw / 2;
    const sy = py + 140;
    // Head
    silGfx.fillStyle(0x334455, 0.6);
    silGfx.fillCircle(sx, sy - 40, 15);
    // Body
    silGfx.fillRect(sx - 15, sy - 25, 30, 40);
    // Arms
    silGfx.fillRect(sx - 30, sy - 20, 15, 35);
    silGfx.fillRect(sx + 15, sy - 20, 15, 35);
    // Legs
    silGfx.fillRect(sx - 12, sy + 15, 10, 30);
    silGfx.fillRect(sx + 2, sy + 15, 10, 30);
    this.panelContainer.add(silGfx);

    // Equipment slots around silhouette
    const slotPositions = {
      WEAPON: { x: sx - 70, y: sy - 30, label: '무기' },
      SHIELD: { x: sx + 50, y: sy - 30, label: '방패' },
      HELMET: { x: sx, y: sy - 70, label: '투구' },
      ARMOR: { x: sx, y: sy, label: '갑옷' },
      PANTS: { x: sx, y: sy + 35, label: '하의' },
      SHOES: { x: sx, y: sy + 60, label: '신발' },
      GLOVES: { x: sx - 70, y: sy + 10, label: '장갑' },
      RING_RIGHT: { x: sx + 50, y: sy + 10, label: '반지R' },
      RING_LEFT: { x: sx - 70, y: sy + 40, label: '반지L' },
      NECKLACE: { x: sx + 50, y: sy - 60, label: '목걸이' },
    };

    for (const [slotKey, pos] of Object.entries(slotPositions)) {
      const equipped = player.equipment[slotKey];

      const slotGfx = this.add.graphics();
      slotGfx.fillStyle(equipped ? 0x334466 : 0x222233, 0.9);
      slotGfx.fillRect(pos.x - 20, pos.y - 12, 40, 24);
      slotGfx.lineStyle(1, equipped ? 0x6688aa : 0x444466);
      slotGfx.strokeRect(pos.x - 20, pos.y - 12, 40, 24);
      this.panelContainer.add(slotGfx);

      const label = this.add.text(pos.x, pos.y - 4, equipped ? (equipped.nameKo || equipped.name) : pos.label, {
        fontSize: '8px', fontFamily: 'monospace',
        color: equipped ? '#ffffff' : '#666688',
      }).setOrigin(0.5);
      this.panelContainer.add(label);

      // Click to unequip
      if (equipped) {
        const zone = this.add.zone(pos.x, pos.y, 40, 24).setInteractive();
        this.panelContainer.add(zone);
        zone.on('pointerdown', () => {
          player.unequip(slotKey);
          this._showPanel('equipment');
        });
      }
    }

    // Stats summary at bottom
    const computed = player.getComputedStats();
    const statsText = `ATK: ${computed.ATK}  DEF: ${computed.DEF}  SPD: ${computed.MOVE_SPEED}`;
    const st = this.add.text(px + pw / 2, py + ph - 30, statsText, {
      fontSize: '11px', fontFamily: 'monospace', color: '#aaaacc',
    }).setOrigin(0.5);
    this.panelContainer.add(st);
  }

  // --- Skill Panel ---
  _drawSkillPanel() {
    const { width, height } = this.cameras.main;
    const pw = 340;
    const ph = 420;
    const px = (width - pw) / 2;
    const py = (height - ph) / 2;

    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 0.95);
    bg.fillRect(px, py, pw, ph);
    bg.fillStyle(0x2a2a4e, 1.0);
    bg.fillRect(px, py, pw, 28);
    bg.lineStyle(2, 0x4a4a6e);
    bg.strokeRect(px, py, pw, ph);
    this.panelContainer.add(bg);

    const title = this.add.text(px + pw / 2, py + 14, '무공 (Skills)', {
      fontSize: '13px', fontFamily: 'monospace', color: '#ffcc66',
    }).setOrigin(0.5);
    this.panelContainer.add(title);

    this._addCloseButton(px + pw - 20, py + 14);

    const player = this.worldScene.player;
    if (!player) return;

    let yOff = py + 40;
    for (const skillId of player.skills) {
      const skill = SKILLS_BY_ID[skillId];
      if (!skill) continue;

      // Skill row background
      const rowBg = this.add.graphics();
      rowBg.fillStyle(0x222244, 0.6);
      rowBg.fillRect(px + 10, yOff, pw - 20, 50);
      rowBg.lineStyle(1, 0x333355);
      rowBg.strokeRect(px + 10, yOff, pw - 20, 50);
      this.panelContainer.add(rowBg);

      // Skill name
      const nameText = this.add.text(px + 18, yOff + 4, `${skill.nameKo || skill.name} (${skill.name})`, {
        fontSize: '11px', fontFamily: 'monospace', color: '#ffffff',
      });
      this.panelContainer.add(nameText);

      // Skill info
      const info = `MP: ${skill.mpCost || 0}  CD: ${((skill.cooldown || 0) / 1000).toFixed(1)}s  ${skill.category || ''}`;
      const infoText = this.add.text(px + 18, yOff + 18, info, {
        fontSize: '9px', fontFamily: 'monospace', color: '#888899',
      });
      this.panelContainer.add(infoText);

      // Proficiency bar
      if (this.worldScene.proficiencySystem) {
        const profSys = this.worldScene.proficiencySystem;
        const profLevel = profSys.getProficiencyLevel('skill', skillId);
        const profProgress = profSys.getProgress('skill', skillId);
        const profExp = profSys.getProficiencyExp('skill', skillId);

        // Bar background
        const barGfx = this.add.graphics();
        const barX = px + 18;
        const barY = yOff + 34;
        const barW = pw - 60;
        barGfx.fillStyle(0x111122, 0.8);
        barGfx.fillRect(barX, barY, barW, 8);
        barGfx.fillStyle(0x6644aa, 0.8);
        barGfx.fillRect(barX, barY, barW * profProgress, 8);
        this.panelContainer.add(barGfx);

        const profLabel = this.add.text(barX + barW + 4, barY - 1, profLevel.nameKo, {
          fontSize: '8px', fontFamily: 'monospace', color: '#aa88ff',
        });
        this.panelContainer.add(profLabel);
      }

      yOff += 56;
      if (yOff > py + ph - 40) break;
    }
  }

  // --- Character Info Panel ---
  _drawCharacterPanel() {
    const { width, height } = this.cameras.main;
    const pw = 280;
    const ph = 420;
    const px = (width - pw) / 2;
    const py = (height - ph) / 2;

    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 0.95);
    bg.fillRect(px, py, pw, ph);
    bg.fillStyle(0x2a2a4e, 1.0);
    bg.fillRect(px, py, pw, 28);
    bg.lineStyle(2, 0x4a4a6e);
    bg.strokeRect(px, py, pw, ph);
    this.panelContainer.add(bg);

    const title = this.add.text(px + pw / 2, py + 14, '정보 (Character)', {
      fontSize: '13px', fontFamily: 'monospace', color: '#ffcc66',
    }).setOrigin(0.5);
    this.panelContainer.add(title);

    this._addCloseButton(px + pw - 20, py + 14);

    const player = this.worldScene.player;
    if (!player) return;

    const computed = player.getComputedStats();
    const statLines = [
      `Level: ${computed.level}`,
      `EXP: ${computed.exp} / ${getExpForLevel(computed.level)}`,
      `Gold: ${computed.gold}`,
      '',
      `--- 기본 능력치 ---`,
      `HP:  ${computed.HP} / ${computed.maxHP}`,
      `MP:  ${computed.MP} / ${computed.maxMP}`,
      `STR (근력): ${computed.STR}`,
      `AGI (민첩): ${computed.AGI}`,
      `INT (지력): ${computed.INT}`,
      `LUK (운):   ${computed.LUK}`,
      '',
      `--- 전투 능력치 ---`,
      `ATK (공격력): ${computed.ATK}`,
      `DEF (방어력): ${computed.DEF}`,
      `ACCURACY (명중): ${computed.ACCURACY}%`,
      `EVASION (회피): ${computed.EVASION}%`,
      `CRIT Rate: ${computed.CRIT_RATE}%`,
      `CRIT DMG:  ${computed.CRIT_DMG}%`,
      '',
      `--- 피해 증감 ---`,
      `피해 증가: ${computed.DMG_BONUS || 0}%`,
      `받는 피해: ${computed.DMG_TAKEN || 0}%`,
      '',
      `--- 회복 ---`,
      `HP 회복: ${computed.HP_REGEN || 0}/2초`,
      `MP 회복: ${computed.MP_REGEN || 0}/2초`,
      '',
      `--- 이동 ---`,
      `MOVE_SPEED: ${computed.MOVE_SPEED}`,
    ];

    let yOff = py + 38;
    for (const line of statLines) {
      const color = line.startsWith('---') ? '#ffcc66' : '#ccccee';
      const text = this.add.text(px + 16, yOff, line, {
        fontSize: '11px', fontFamily: 'monospace', color,
      });
      this.panelContainer.add(text);
      yOff += 16;
    }
  }

  // ==========================================================================
  // Tooltip
  // ==========================================================================

  _showTooltip(x, y, itemData) {
    this._hideTooltip();

    const { width, height } = this.cameras.main;
    const tipW = 180;
    const lines = [
      itemData.nameKo || itemData.name,
      itemData.name || '',
      `등급: ${getRarityDisplay(itemData.rarity)}`,
      itemData.description || '',
    ];

    // Show weapon base stats
    if (itemData.baseATK) lines.push(`  공격력: ${itemData.baseATK}`);
    if (itemData.baseATK_SPEED) lines.push(`  공격속도: ${itemData.baseATK_SPEED}`);
    if (itemData.baseRange) lines.push(`  사정거리: ${itemData.baseRange}`);
    // Show armor base DEF
    if (itemData.baseDEF) lines.push(`  방어력: ${itemData.baseDEF}`);

    if (itemData.stats && Object.keys(itemData.stats).length > 0) {
      lines.push('  --- 추가 옵션 ---');
      for (const [stat, val] of Object.entries(itemData.stats)) {
        const sign = val >= 0 ? '+' : '';
        lines.push(`  ${stat}: ${sign}${val}`);
      }
    }

    const tipH = lines.length * 14 + 12;

    // Clamp tooltip within screen bounds
    if (x + tipW > width) x = x - tipW - 50;
    if (y + tipH > height) y = height - tipH - 10;

    this.tooltipContainer = this.add.container(0, 0).setDepth(3000);

    const bg = this.add.graphics();
    bg.fillStyle(0x111122, 0.95);
    bg.fillRect(x, y, tipW, tipH);
    bg.lineStyle(1, 0x4a4a6e);
    bg.strokeRect(x, y, tipW, tipH);
    this.tooltipContainer.add(bg);

    lines.forEach((line, i) => {
      const color = i === 0 ? '#ffffff' : '#aaaacc';
      const text = this.add.text(x + 6, y + 6 + i * 14, line, {
        fontSize: '9px', fontFamily: 'monospace', color,
      });
      this.tooltipContainer.add(text);
    });
  }

  _hideTooltip() {
    if (this.tooltipContainer) {
      this.tooltipContainer.destroy();
      this.tooltipContainer = null;
    }
  }

  // ==========================================================================
  // Close Button helper
  // ==========================================================================

  _addCloseButton(x, y) {
    const closeBtn = this.add.text(x, y, 'X', {
      fontSize: '14px', fontFamily: 'monospace', color: '#ff6666',
      stroke: '#000000', strokeThickness: 1,
    }).setOrigin(0.5).setInteractive();
    this.panelContainer.add(closeBtn);

    closeBtn.on('pointerdown', () => this._closePanel());
    closeBtn.on('pointerover', () => closeBtn.setColor('#ff9999'));
    closeBtn.on('pointerout', () => closeBtn.setColor('#ff6666'));
  }

  // ==========================================================================
  // HUD Updates
  // ==========================================================================

  _updateHUD() {
    const player = this.worldScene && this.worldScene.player;
    if (!player) return;

    const stats = player.stats;

    // Bars
    this._updateBar('hp', stats.HP, stats.maxHP);
    this._updateBar('mp', stats.MP, stats.maxMP);
    this._updateBar('exp', stats.exp, getExpForLevel(stats.level));

    // Level
    this.levelText.setText(`Lv. ${stats.level}`);

    // Gold
    this.goldText.setText(`Gold: ${stats.gold}`);

    // Proficiency
    const weapon = player.equipment.WEAPON;
    if (weapon && weapon.weaponType && this.worldScene.proficiencySystem) {
      const profSys = this.worldScene.proficiencySystem;
      const profLevel = profSys.getProficiencyLevel('weapon', weapon.weaponType);
      const bonuses = profSys.getWeaponProfBonuses(weapon.weaponType);
      const weaponTypeNames = { SWORD:'검', BLADE:'도', SPEAR:'창', STAFF:'봉', HIDDEN:'암기', WHIP:'편', FIST:'권', EXOTIC:'기문' };
      const typeName = weaponTypeNames[weapon.weaponType] || weapon.weaponType;
      this.profText.setText(`${typeName} 숙련: ${profLevel.nameKo} (피해+${bonuses.dmgBonus}% 크리+${bonuses.critRateBonus}%)`);
    } else {
      this.profText.setText('');
    }
  }

  _updateExpBar(exp, expNeeded) {
    this._updateBar('exp', exp, expNeeded);
  }

  _onLevelUp(newLevel) {
    // Show level-up notification
    const { width, height } = this.cameras.main;
    const text = this.add.text(width / 2, height / 2 - 100, `레벨 업! Lv.${newLevel}`, {
      fontSize: '24px', fontFamily: 'serif', color: '#ffcc00',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(5000);

    this.tweens.add({
      targets: text,
      y: height / 2 - 140,
      alpha: 0,
      duration: 2000,
      ease: 'Power2',
      onComplete: () => text.destroy(),
    });

    this._updateHUD();
  }

  _onInventoryChanged() {
    if (this.activePanel === 'inventory') {
      this._showPanel('inventory');
    }
    this._updateHUD();
  }

  _onEquipmentChanged() {
    if (this.activePanel === 'equipment') {
      this._showPanel('equipment');
    }
    this._updateHUD();
  }

  _onProfLevelUp(data) {
    const { width, height } = this.cameras.main;
    const text = this.add.text(width / 2, height / 2 - 60,
      `숙련도 상승! ${data.id}: ${data.newLevel.nameKo}`, {
      fontSize: '16px', fontFamily: 'monospace', color: '#aa88ff',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(5000);

    this.tweens.add({
      targets: text,
      y: height / 2 - 100,
      alpha: 0,
      duration: 2000,
      onComplete: () => text.destroy(),
    });
  }

  // ==========================================================================
  // Save / Load
  // ==========================================================================

  _doSave() {
    const ws = this.worldScene;
    if (!ws || !ws.player) return;
    const mapId = ws.mapId || 'field_01';
    const ok = this.saveSystem.save(ws.player, mapId, ws.proficiencySystem);
    this._showSaveNotification(ok ? '저장 완료!' : '저장 실패!', ok);
  }

  _doAutoSave() {
    const ws = this.worldScene;
    if (!ws || !ws.player) return;
    const mapId = ws.mapId || 'field_01';
    this.saveSystem.autoSave(ws.player, mapId, ws.proficiencySystem);
  }

  _doLoadLast() {
    const data = this.saveSystem.load();
    if (!data) {
      this._showSaveNotification('저장 데이터가 없습니다!', false);
      return;
    }
    this._applyLoadData(data);
  }

  _applyLoadData(data) {
    const ws = this.worldScene;
    if (!ws || !ws.player) return;

    // Apply player data
    Object.assign(ws.player.stats, data.player.stats);
    ws.player.equipment = { ...ws.player.equipment, ...data.player.equipment };
    ws.player.inventory = data.player.inventory.map(e => ({ ...e }));
    ws.player.skills = [...data.player.skills];
    ws.player.skillSlots = [...data.player.skillSlots];
    ws.player.skillCooldowns = {};
    ws.player.buffs = [];
    ws.player.channelEffects = {};
    ws.player.activeSkillEffects = {};

    // Apply proficiency
    if (ws.proficiencySystem && data.proficiency) {
      ws.proficiencySystem.fromJSON(data.proficiency);
    }

    // Reposition player
    if (data.map) {
      ws.player.setPosition(data.map.x, data.map.y);
    }

    // Refresh equipment visuals
    ws.player._updateEquipmentVisuals();

    ws.events.emit('player-stats-changed');
    this._showSaveNotification('불러오기 완료!', true);

    // If different map, transition
    if (data.map && data.map.id && data.map.id !== (ws.mapId || 'field_01')) {
      // For simplicity, reload current scene with player data
      // Full map transition would require MapTransitionSystem
    }
  }

  _drawLoadPanel() {
    const { width, height } = this.cameras.main;
    const pw = 300;
    const ph = 280;
    const px = (width - pw) / 2;
    const py = (height - ph) / 2;

    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 0.95);
    bg.fillRect(px, py, pw, ph);
    bg.fillStyle(0x2a2a4e, 1.0);
    bg.fillRect(px, py, pw, 28);
    bg.lineStyle(2, 0x4a4a6e);
    bg.strokeRect(px, py, pw, ph);
    this.panelContainer.add(bg);

    const title = this.add.text(px + pw / 2, py + 14, '저장 / 불러오기', {
      fontSize: '13px', fontFamily: 'monospace', color: '#ffcc66',
    }).setOrigin(0.5);
    this.panelContainer.add(title);
    this._addCloseButton(px + pw - 20, py + 14);

    let yOff = py + 45;
    const btnW = pw - 40;
    const btnH = 32;

    const createBtn = (label, color, callback) => {
      const btnBg = this.add.graphics();
      btnBg.fillStyle(color, 0.9);
      btnBg.fillRect(px + 20, yOff, btnW, btnH);
      btnBg.lineStyle(1, 0x6a6a9e);
      btnBg.strokeRect(px + 20, yOff, btnW, btnH);
      this.panelContainer.add(btnBg);

      const btnText = this.add.text(px + 20 + btnW / 2, yOff + btnH / 2, label, {
        fontSize: '12px', fontFamily: 'monospace', color: '#ffffff',
      }).setOrigin(0.5);
      this.panelContainer.add(btnText);

      const zone = this.add.zone(px + 20 + btnW / 2, yOff + btnH / 2, btnW, btnH)
        .setInteractive().setDepth(3001);
      this.panelContainer.add(zone);

      zone.on('pointerover', () => { btnBg.setAlpha(0.7); });
      zone.on('pointerout', () => { btnBg.setAlpha(1); });
      zone.on('pointerdown', () => { callback(); this._closePanel(); });

      yOff += btnH + 8;
    };

    // Save info
    const hasSave = this.saveSystem.hasSave();
    const hasAuto = this.saveSystem.hasAutoSave();
    const infoText = this.add.text(px + 20, yOff,
      `수동 저장: ${hasSave ? '있음' : '없음'}  |  자동 저장: ${hasAuto ? '있음' : '없음'}`, {
      fontSize: '10px', fontFamily: 'monospace', color: '#888899',
    });
    this.panelContainer.add(infoText);
    yOff += 20;

    const playTime = this.add.text(px + 20, yOff,
      `플레이 시간: ${this.saveSystem.getPlayTime()}`, {
      fontSize: '10px', fontFamily: 'monospace', color: '#888899',
    });
    this.panelContainer.add(playTime);
    yOff += 24;

    createBtn('💾 저장하기 (F5)', 0x2a4a2e, () => this._doSave());
    createBtn('📂 불러오기 (F9)', 0x2a2a4e, () => this._doLoadLast());

    if (hasAuto) {
      createBtn('🔄 자동저장 불러오기', 0x3a3a2e, () => {
        const data = this.saveSystem.load('murimAdventure_autosave');
        if (data) this._applyLoadData(data);
        else this._showSaveNotification('자동저장 데이터 없음!', false);
      });
    }

    createBtn('📥 파일로 내보내기', 0x2a3a4e, () => {
      const ws = this.worldScene;
      if (ws && ws.player) {
        this.saveSystem.exportToFile(ws.player, ws.mapId || 'field_01', ws.proficiencySystem);
      }
    });

    createBtn('📤 파일에서 가져오기', 0x4a2a2e, () => {
      this.saveSystem.importFromFile().then((data) => {
        if (data) {
          this._applyLoadData(data);
        } else {
          this._showSaveNotification('가져오기 실패!', false);
        }
      });
    });
  }

  _showSaveNotification(msg, success) {
    const { width } = this.cameras.main;
    const color = success ? '#44ff88' : '#ff6666';
    const text = this.add.text(width / 2, 120, msg, {
      fontSize: '16px', fontFamily: 'monospace', color,
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(5000);

    this.tweens.add({
      targets: text,
      y: 90,
      alpha: 0,
      duration: 1500,
      ease: 'Power2',
      onComplete: () => text.destroy(),
    });
  }

  // ==========================================================================
  // Update
  // ==========================================================================

  update(time, delta) {
    this._updateSkillSlots();
  }
}
