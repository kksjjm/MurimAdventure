// =============================================================================
// UIScene.js - Bottom HUD and integrated character window
// =============================================================================

import Phaser from 'phaser';
import { getExpForLevel } from '../../data/defaultData.js';
import { getGameData, getItemIconKey } from '../../data/GameDataLoader.js';
import { EQUIPMENT_SLOTS, getRarityDisplay } from '../../data/constants.js';
import SaveSystem from '../systems/SaveSystem.js';

export const BOTTOM_UI_HEIGHT = 112;

const STAT_SUMMARY = ['ATK', 'DEF', 'STR', 'AGI', 'INT', 'LUK'];
const STAT_DETAILS = [
  'HP', 'maxHP', 'MP', 'maxMP',
  'ATK', 'DEF', 'STR', 'AGI', 'INT', 'LUK',
  'ACCURACY', 'EVASION', 'CRIT_RATE', 'CRIT_DMG',
  'DMG_BONUS', 'DMG_TAKEN', 'HP_REGEN', 'MP_REGEN',
  'MOVE_SPEED', 'ATK_SPEED',
];

const EQUIP_SLOT_LABELS = {
  [EQUIPMENT_SLOTS.WEAPON.key]: '무기',
  [EQUIPMENT_SLOTS.SHIELD.key]: '방패',
  [EQUIPMENT_SLOTS.HELMET.key]: '투구',
  [EQUIPMENT_SLOTS.ARMOR.key]: '갑옷',
  [EQUIPMENT_SLOTS.PANTS.key]: '하의',
  [EQUIPMENT_SLOTS.SHOES.key]: '신발',
  [EQUIPMENT_SLOTS.GLOVES.key]: '장갑',
  [EQUIPMENT_SLOTS.BELT.key]: '허리',
  [EQUIPMENT_SLOTS.RING_RIGHT.key]: '반지R',
  [EQUIPMENT_SLOTS.RING_LEFT.key]: '반지L',
  [EQUIPMENT_SLOTS.NECKLACE.key]: '목걸이',
  [EQUIPMENT_SLOTS.TALISMAN.key]: '부적',
  [EQUIPMENT_SLOTS.JADE_TOKEN.key]: '옥패',
};

export default class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UIScene' });
    this.activePanel = null;
    this.showStatDetails = false;
    this.quickItemSlots = [];
  }

  init(data) {
    this.worldScene = data.worldScene;
  }

  create() {
    this.saveSystem = new SaveSystem();
    this.hudContainer = this.add.container(0, 0).setDepth(1000);
    this.panelContainer = this.add.container(0, 0).setDepth(2500).setVisible(false);
    this.tooltipContainer = null;

    this._createBottomHud();
    this._bindEvents();
    this._updateHUD();
  }

  _bindEvents() {
    const ws = this.worldScene;
    if (ws) {
      ws.events.on('player-stats-changed', this._updateHUD, this);
      ws.events.on('player-levelup', this._onLevelUp, this);
      ws.events.on('exp-changed', this._updateHUD, this);
      ws.events.on('inventory-changed', this._onInventoryChanged, this);
      ws.events.on('equipment-changed', this._onEquipmentChanged, this);
      ws.events.on('proficiency-levelup', this._onProfLevelUp, this);
    }

    this.input.keyboard.on('keydown-I', () => this._toggleCharacterPanel());
    this.input.keyboard.on('keydown-E', () => this._toggleCharacterPanel());
    this.input.keyboard.on('keydown-C', () => this._toggleCharacterPanel());
    this.input.keyboard.on('keydown-K', () => this._toggleCharacterPanel());
    this.input.keyboard.on('keydown-ESC', () => this._closePanel());
    this.input.keyboard.on('keydown-M', () => this.worldScene?.toggleMinimap?.());
    ['SIX', 'SEVEN', 'EIGHT', 'NINE'].forEach((key, index) => {
      this.input.keyboard.on(`keydown-${key}`, () => this._useQuickItem(index));
    });
    this.input.keyboard.on('keydown-F5', (e) => {
      e.preventDefault();
      this._doSave();
    });
    this.input.keyboard.on('keydown-F9', (e) => {
      e.preventDefault();
      this._doLoadLast();
    });

    this.time.addEvent({
      delay: 60000,
      callback: () => this._doAutoSave(),
      loop: true,
    });
  }

  _createBottomHud() {
    const { width, height } = this.cameras.main;
    const y = height - BOTTOM_UI_HEIGHT;

    const bg = this.add.graphics();
    bg.fillStyle(0x101018, 0.98);
    bg.fillRect(0, y, width, BOTTOM_UI_HEIGHT);
    bg.fillStyle(0x1b2130, 0.96);
    bg.fillRect(0, y, width, 24);
    bg.lineStyle(2, 0x45516a, 1);
    bg.lineBetween(0, y + 0.5, width, y + 0.5);
    bg.lineStyle(1, 0x2b3347, 1);
    bg.strokeRect(8, y + 8, 250, BOTTOM_UI_HEIGHT - 16);
    bg.strokeRect(270, y + 8, 360, BOTTOM_UI_HEIGHT - 16);
    bg.strokeRect(642, y + 8, 190, BOTTOM_UI_HEIGHT - 16);
    bg.strokeRect(844, y + 8, 108, BOTTOM_UI_HEIGHT - 16);
    this.hudContainer.add(bg);

    this.levelText = this.add.text(20, y + 18, 'Lv. 1', {
      fontSize: '15px',
      fontFamily: 'monospace',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    });
    this.hudContainer.add(this.levelText);

    this.goldText = this.add.text(20, y + 92, 'Gold 0', {
      fontSize: '11px',
      fontFamily: 'monospace',
      color: '#ffd166',
      stroke: '#000000',
      strokeThickness: 2,
    });
    this.hudContainer.add(this.goldText);

    this.hpBar = this._createBar(76, y + 18, 166, 16, 0xcc3333, 'HP');
    this.mpBar = this._createBar(76, y + 42, 166, 16, 0x3366cc, 'MP');
    this.expBar = this._createBar(76, y + 64, 166, 10, 0x33cc66, 'EXP', 9);

    this.profText = this.add.text(20, y + 76, '', {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#b8c0ff',
      stroke: '#000000',
      strokeThickness: 2,
    });
    this.hudContainer.add(this.profText);

    this._createSkillSlots(290, y + 36);
    this._createQuickItems(662, y + 38);
    this._createHudButtons(858, y + 20);
  }

  _createBar(x, y, w, h, color, label, fontSize = 10) {
    const bg = this.add.graphics();
    bg.fillStyle(0x05050a, 0.8);
    bg.fillRect(x, y, w, h);
    bg.lineStyle(1, 0x51576b, 1);
    bg.strokeRect(x, y, w, h);
    this.hudContainer.add(bg);

    const fill = this.add.graphics();
    this.hudContainer.add(fill);

    const text = this.add.text(x + w / 2, y + h / 2, '', {
      fontSize: `${fontSize}px`,
      fontFamily: 'monospace',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);
    this.hudContainer.add(text);

    const labelText = this.add.text(x - 34, y + h / 2, label, {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#9aa4bd',
    }).setOrigin(0, 0.5);
    this.hudContainer.add(labelText);

    return { x, y, w, h, color, fill, text };
  }

  _updateBar(bar, current, max, formatter = null) {
    const safeMax = Math.max(1, Number(max) || 1);
    const pct = Phaser.Math.Clamp((Number(current) || 0) / safeMax, 0, 1);
    bar.fill.clear();
    bar.fill.fillStyle(bar.color, 0.92);
    bar.fill.fillRect(bar.x + 1, bar.y + 1, Math.max(0, (bar.w - 2) * pct), bar.h - 2);
    bar.text.setText(formatter ? formatter(current, max) : `${Math.floor(current || 0)} / ${Math.floor(safeMax)}`);
  }

  _createSkillSlots(startX, startY) {
    this.skillSlots = [];
    const size = 46;
    const gap = 8;
    for (let i = 0; i < 5; i++) {
      const x = startX + i * (size + gap);
      const bg = this.add.graphics();
      bg.fillStyle(0x1b2130, 0.95);
      bg.fillRect(x, startY, size, size);
      bg.lineStyle(1, 0x556078, 1);
      bg.strokeRect(x, startY, size, size);
      this.hudContainer.add(bg);

      const keyText = this.add.text(x + 4, startY + 3, `${i + 1}`, {
        fontSize: '10px',
        fontFamily: 'monospace',
        color: '#9aa4bd',
      });
      this.hudContainer.add(keyText);

      const nameText = this.add.text(x + size / 2, startY + size / 2 + 2, '', {
        fontSize: '8px',
        fontFamily: 'monospace',
        color: '#dce4ff',
        align: 'center',
        wordWrap: { width: size - 6 },
      }).setOrigin(0.5);
      this.hudContainer.add(nameText);

      const cd = this.add.graphics();
      this.hudContainer.add(cd);
      this.skillSlots.push({ x, y: startY, size, bg, nameText, cd });
    }

    const label = this.add.text(startX, startY - 20, '스킬', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#ffcc66',
    });
    this.hudContainer.add(label);
  }

  _createQuickItems(startX, startY) {
    this.itemSlots = [];
    const size = 38;
    const gap = 5;
    for (let i = 0; i < 4; i++) {
      const x = startX + i * (size + gap);
      const bg = this.add.graphics();
      bg.fillStyle(0x1b2130, 0.95);
      bg.fillRect(x, startY, size, size);
      bg.lineStyle(1, 0x556078, 1);
      bg.strokeRect(x, startY, size, size);
      this.hudContainer.add(bg);

      const keyText = this.add.text(x + 4, startY + 3, `${i + 6}`, {
        fontSize: '9px',
        fontFamily: 'monospace',
        color: '#9aa4bd',
      });
      this.hudContainer.add(keyText);

      const icon = this.add.image(x + size / 2, startY + size / 2, 'icon_potion').setVisible(false);
      this.hudContainer.add(icon);

      const qty = this.add.text(x + size - 4, startY + size - 4, '', {
        fontSize: '9px',
        fontFamily: 'monospace',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2,
      }).setOrigin(1, 1);
      this.hudContainer.add(qty);

      const zone = this.add.zone(x + size / 2, startY + size / 2, size, size).setInteractive();
      zone.on('pointerdown', () => this._useQuickItem(i));
      this.hudContainer.add(zone);
      this.itemSlots.push({ x, y: startY, size, icon, qty, zone });
    }

    const label = this.add.text(startX, startY - 20, '사용 아이템', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#ffcc66',
    });
    this.hudContainer.add(label);
  }

  _createHudButtons(startX, startY) {
    const buttons = [
      { label: '캐릭터 I', action: () => this._toggleCharacterPanel() },
      { label: '미니맵 M', action: () => this.worldScene?.toggleMinimap?.() },
      { label: '저장 F5', action: () => this._doSave() },
      { label: '불러오기 F9', action: () => this._doLoadLast() },
    ];
    buttons.forEach((button, index) => {
      const y = startY + index * 22;
      const bg = this.add.graphics();
      bg.fillStyle(0x263145, 0.95);
      bg.fillRect(startX, y, 80, 18);
      bg.lineStyle(1, 0x5a6888, 1);
      bg.strokeRect(startX, y, 80, 18);
      this.hudContainer.add(bg);

      const text = this.add.text(startX + 40, y + 9, button.label, {
        fontSize: '9px',
        fontFamily: 'monospace',
        color: '#edf2ff',
      }).setOrigin(0.5);
      this.hudContainer.add(text);

      const zone = this.add.zone(startX + 40, y + 9, 80, 18).setInteractive();
      zone.on('pointerover', () => bg.setAlpha(0.75));
      zone.on('pointerout', () => bg.setAlpha(1));
      zone.on('pointerdown', button.action);
      this.hudContainer.add(zone);
    });
  }

  _updateSkillSlots() {
    const player = this.worldScene?.player;
    if (!player) return;
    const now = Date.now();
    const skills = getGameData().skills || {};
    for (let i = 0; i < this.skillSlots.length; i++) {
      const slot = this.skillSlots[i];
      const skillId = player.skillSlots[i];
      const skill = skills[skillId];
      slot.cd.clear();
      if (!skill) {
        slot.nameText.setText('');
        continue;
      }
      slot.nameText.setText(skill.nameKo || skill.name || skill.id);

      const activeEffect = player.activeSkillEffects[skillId] || player.channelEffects[skillId];
      if (activeEffect) {
        const remainPct = Phaser.Math.Clamp(1 - ((now - activeEffect.startTime) / Math.max(1, activeEffect.duration)), 0, 1);
        slot.cd.fillStyle(0x22aa66, 0.35);
        slot.cd.fillRect(slot.x, slot.y + slot.size * (1 - remainPct), slot.size, slot.size * remainPct);
      }

      const lastUsed = player.skillCooldowns[skillId] || 0;
      const cooldown = skill.cooldown || 0;
      const remain = Math.max(0, cooldown - (now - lastUsed));
      if (remain > 0 && cooldown > 0) {
        const pct = remain / cooldown;
        slot.cd.fillStyle(0x000000, 0.62);
        slot.cd.fillRect(slot.x, slot.y, slot.size, slot.size * pct);
      }
    }
  }

  _updateQuickItems() {
    const player = this.worldScene?.player;
    if (!player) return;
    const items = getGameData().items || {};
    this.quickItemSlots = player.inventory
      .filter(entry => items[entry.itemId]?.type === 'CONSUMABLE')
      .slice(0, this.itemSlots.length);

    for (let i = 0; i < this.itemSlots.length; i++) {
      const slot = this.itemSlots[i];
      const inv = this.quickItemSlots[i];
      const item = inv ? items[inv.itemId] : null;
      if (!item) {
        slot.icon.setVisible(false);
        slot.qty.setText('');
        continue;
      }
      slot.icon.setTexture(getItemIconKey(item));
      const frame = slot.icon.frame;
      slot.icon.setScale(Math.min((slot.size - 8) / frame.width, (slot.size - 8) / frame.height, 2.5));
      slot.icon.setVisible(true);
      slot.qty.setText(inv.quantity > 1 ? String(inv.quantity) : '');
    }
  }

  _useQuickItem(index) {
    const player = this.worldScene?.player;
    const inv = this.quickItemSlots[index];
    if (!player || !inv) return;
    player.useConsumable(inv.itemId);
    this._updateHUD();
    if (this.activePanel === 'character') this._drawCharacterPanel();
  }

  _toggleCharacterPanel() {
    if (this.activePanel === 'character') {
      this._closePanel();
    } else {
      this.activePanel = 'character';
      this._drawCharacterPanel();
    }
  }

  _closePanel() {
    this._hideTooltip();
    this.panelContainer.removeAll(true);
    this.panelContainer.setVisible(false);
    this.activePanel = null;
  }

  _drawCharacterPanel() {
    this._hideTooltip();
    this.panelContainer.removeAll(true);
    this.panelContainer.setVisible(true);
    this.activePanel = 'character';

    const { width, height } = this.cameras.main;
    const usableHeight = height - BOTTOM_UI_HEIGHT;
    const pw = 880;
    const ph = Math.min(390, usableHeight - 28);
    const px = (width - pw) / 2;
    const py = Math.max(12, (usableHeight - ph) / 2);
    const player = this.worldScene?.player;
    if (!player) return;

    const bg = this.add.graphics();
    bg.fillStyle(0x111722, 0.98);
    bg.fillRect(px, py, pw, ph);
    bg.fillStyle(0x202a3c, 1);
    bg.fillRect(px, py, pw, 30);
    bg.lineStyle(2, 0x586782, 1);
    bg.strokeRect(px, py, pw, ph);
    bg.lineStyle(1, 0x303b52, 1);
    bg.lineBetween(px + 220, py + 36, px + 220, py + ph - 12);
    bg.lineBetween(px + 560, py + 36, px + 560, py + ph - 12);
    this.panelContainer.add(bg);

    this._addText(px + 18, py + 9, '캐릭터 관리', 13, '#ffcc66');
    this._addText(px + 145, py + 10, '장비', 11, '#aab7d5');
    this._addText(px + 240, py + 10, '인벤토리', 11, '#aab7d5');
    this._addText(px + 578, py + 10, '능력치', 11, '#aab7d5');
    this._addCloseButton(px + pw - 20, py + 15);

    const detailBtn = this._addButton(px + pw - 126, py + 7, 88, 18, this.showStatDetails ? '간단 보기' : '상세 보기', () => {
      this.showStatDetails = !this.showStatDetails;
      this._drawCharacterPanel();
    });
    this.panelContainer.add(detailBtn);

    this._drawEquipmentSection(px + 18, py + 44, player);
    this._drawInventorySection(px + 236, py + 44, player);
    this._drawStatsSection(px + 578, py + 44, player);
  }

  _drawEquipmentSection(x, y, player) {
    this._drawEquipmentFigure(x + 101, y + 152);

    const layout = [
      { slot: 'HELMET', x: 79, y: 0 },
      { slot: 'NECKLACE', x: 79, y: 47 },
      { slot: 'ARMOR', x: 79, y: 94 },
      { slot: 'BELT', x: 79, y: 141 },
      { slot: 'PANTS', x: 79, y: 188 },
      { slot: 'SHOES', x: 79, y: 246 },
      { slot: 'WEAPON', x: 3, y: 68 },
      { slot: 'SHIELD', x: 155, y: 68 },
      { slot: 'GLOVES', x: 3, y: 128 },
      { slot: 'RING_LEFT', x: 3, y: 188 },
      { slot: 'RING_RIGHT', x: 155, y: 188 },
      { slot: 'TALISMAN', x: 3, y: 246 },
      { slot: 'JADE_TOKEN', x: 155, y: 246 },
    ];

    layout.forEach(({ slot, x: offsetX, y: offsetY }) => {
      const slotKey = EQUIPMENT_SLOTS[slot]?.key || slot;
      this._drawEquipmentSlot(x + offsetX, y + offsetY, 44, 38, slotKey, player.equipment[slotKey], player);
    });
  }

  _drawEquipmentFigure(cx, cy) {
    const figure = this.add.graphics();
    figure.fillStyle(0x1a2232, 0.88);
    figure.lineStyle(2, 0x39465f, 0.85);
    figure.fillCircle(cx, cy - 94, 18);
    figure.strokeCircle(cx, cy - 94, 18);
    figure.fillRoundedRect(cx - 24, cy - 66, 48, 78, 10);
    figure.strokeRoundedRect(cx - 24, cy - 66, 48, 78, 10);
    figure.lineStyle(7, 0x273247, 0.82);
    figure.lineBetween(cx - 30, cy - 50, cx - 54, cy + 18);
    figure.lineBetween(cx + 30, cy - 50, cx + 54, cy + 18);
    figure.lineBetween(cx - 13, cy + 10, cx - 28, cy + 78);
    figure.lineBetween(cx + 13, cy + 10, cx + 28, cy + 78);
    figure.lineStyle(1, 0x4d5d7a, 0.8);
    figure.strokeCircle(cx, cy - 94, 9);
    this.panelContainer.add(figure);
  }

  _drawEquipmentSlot(x, y, w, h, slotKey, item, player) {
    this._drawSlotBox(x, y, w, h, item ? 0x27384f : 0x171d2b);
    const label = EQUIP_SLOT_LABELS[slotKey] || slotKey;
    this._addText(x + w / 2, y + 2, label, 7, item ? '#c6d4f2' : '#7f8aa5').setOrigin(0.5, 0);

    if (item) {
      const iconKey = getItemIconKey(item);
      const safeIconKey = this.textures.exists(iconKey) ? iconKey : 'icon_armor';
      const icon = this.add.image(x + w / 2, y + h / 2 + 5, safeIconKey);
      const frame = icon.frame;
      icon.setScale(Math.min((w - 12) / frame.width, (h - 15) / frame.height, 2.3));
      this.panelContainer.add(icon);
    } else {
      this._addText(x + w / 2, y + h / 2 + 6, '-', 10, '#505a71').setOrigin(0.5);
    }

    const zone = this.add.zone(x + w / 2, y + h / 2, w, h).setInteractive();
    zone.on('pointerover', () => {
      if (item) this._showItemTooltip(x + w + 6, y, item);
    });
    zone.on('pointerout', () => this._hideTooltip());
    zone.on('pointerdown', () => {
      if (!item) return;
      player.unequip(slotKey);
      this._drawCharacterPanel();
    });
    this.panelContainer.add(zone);
  }

  _drawInventorySection(x, y, player) {
    const cols = 7;
    const cell = 40;
    const gap = 6;
    const items = getGameData().items || {};
    const maxRows = 7;
    for (let i = 0; i < cols * maxRows; i++) {
      const cx = x + (i % cols) * (cell + gap);
      const cy = y + Math.floor(i / cols) * (cell + gap);
      const inv = player.inventory[i];
      const item = inv ? items[inv.itemId] : null;
      this._drawSlotBox(cx, cy, cell, cell, item ? 0x223048 : 0x151b29);
      if (!item) continue;

      const icon = this.add.image(cx + cell / 2, cy + cell / 2 - 2, getItemIconKey(item));
      const frame = icon.frame;
      icon.setScale(Math.min((cell - 8) / frame.width, (cell - 8) / frame.height, 2.5));
      this.panelContainer.add(icon);

      if (inv.quantity > 1) {
        this._addText(cx + cell - 4, cy + cell - 13, String(inv.quantity), 9, '#ffffff').setOrigin(1, 0);
      }

      const zone = this.add.zone(cx + cell / 2, cy + cell / 2, cell, cell).setInteractive();
      zone.on('pointerover', () => this._showItemTooltip(cx + cell + 4, cy, item));
      zone.on('pointerout', () => this._hideTooltip());
      zone.on('pointerdown', () => {
        if (item.type === 'CONSUMABLE') {
          player.useConsumable(inv.itemId);
        } else if (item.slot) {
          player.equip(item, item.slot);
        }
        this._drawCharacterPanel();
      });
      this.panelContainer.add(zone);
    }
  }

  _drawStatsSection(x, y, player) {
    const stats = player.getComputedStats();
    this._addText(x, y, `Lv.${stats.level}  EXP ${stats.exp}/${getExpForLevel(stats.level)}`, 11, '#ffffff');
    this._addText(x, y + 18, `Gold ${stats.gold}`, 10, '#ffd166');

    const list = this.showStatDetails ? STAT_DETAILS : STAT_SUMMARY;
    let cy = y + 46;
    for (const stat of list) {
      const value = stats[stat] ?? 0;
      this._addText(x, cy, stat, 10, '#9aa4bd');
      this._addText(x + 130, cy, String(Math.floor(value)), 10, '#ffffff');
      cy += 18;
      if (cy > y + 315) break;
    }

    if (!this.showStatDetails) {
      this._addText(x, y + 180, '상세 보기에서 명중/회피/크리/회복 등 전체 능력치를 확인할 수 있습니다.', 9, '#7f8aa5', 260);
    }
  }

  _drawSlotBox(x, y, w, h, fill) {
    const gfx = this.add.graphics();
    gfx.fillStyle(fill, 0.96);
    gfx.fillRect(x, y, w, h);
    gfx.lineStyle(1, 0x44516b, 1);
    gfx.strokeRect(x, y, w, h);
    this.panelContainer.add(gfx);
    return gfx;
  }

  _addButton(x, y, w, h, label, callback) {
    const c = this.add.container(0, 0);
    const bg = this.add.graphics();
    bg.fillStyle(0x2b3952, 0.95);
    bg.fillRect(x, y, w, h);
    bg.lineStyle(1, 0x64738f, 1);
    bg.strokeRect(x, y, w, h);
    c.add(bg);
    c.add(this.add.text(x + w / 2, y + h / 2, label, {
      fontSize: '9px',
      fontFamily: 'monospace',
      color: '#ffffff',
    }).setOrigin(0.5));
    const zone = this.add.zone(x + w / 2, y + h / 2, w, h).setInteractive();
    zone.on('pointerover', () => bg.setAlpha(0.75));
    zone.on('pointerout', () => bg.setAlpha(1));
    zone.on('pointerdown', callback);
    c.add(zone);
    return c;
  }

  _addText(x, y, text, size = 10, color = '#ffffff', wrapWidth = null) {
    const obj = this.add.text(x, y, text, {
      fontSize: `${size}px`,
      fontFamily: 'monospace',
      color,
      wordWrap: wrapWidth ? { width: wrapWidth } : undefined,
    });
    this.panelContainer.add(obj);
    return obj;
  }

  _addCloseButton(x, y) {
    const close = this.add.text(x, y, 'X', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#ff7777',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5).setInteractive();
    close.on('pointerdown', () => this._closePanel());
    close.on('pointerover', () => close.setColor('#ffaaaa'));
    close.on('pointerout', () => close.setColor('#ff7777'));
    this.panelContainer.add(close);
  }

  _showItemTooltip(x, y, item) {
    this._hideTooltip();
    const lines = [
      item.nameKo || item.name || item.id,
      item.description || '',
      `등급: ${getRarityDisplay(item.rarity)}`,
    ];
    if (item.baseATK) lines.push(`공격력 +${item.baseATK}`);
    if (item.baseDEF) lines.push(`방어력 +${item.baseDEF}`);
    if (item.stats) {
      for (const [stat, value] of Object.entries(item.stats)) {
        lines.push(`${stat} ${value >= 0 ? '+' : ''}${value}`);
      }
    }

    const { width, height } = this.cameras.main;
    const tipW = 210;
    const tipH = Math.max(64, lines.length * 15 + 14);
    const maxY = height - BOTTOM_UI_HEIGHT - tipH - 8;
    const tx = Math.min(x, width - tipW - 8);
    const ty = Math.max(8, Math.min(y, maxY));
    this.tooltipContainer = this.add.container(0, 0).setDepth(4000);

    const bg = this.add.graphics();
    bg.fillStyle(0x080b12, 0.97);
    bg.fillRect(tx, ty, tipW, tipH);
    bg.lineStyle(1, 0x697996, 1);
    bg.strokeRect(tx, ty, tipW, tipH);
    this.tooltipContainer.add(bg);

    lines.forEach((line, idx) => {
      this.tooltipContainer.add(this.add.text(tx + 8, ty + 8 + idx * 15, line, {
        fontSize: idx === 0 ? '11px' : '9px',
        fontFamily: 'monospace',
        color: idx === 0 ? '#ffffff' : '#b8c0d6',
        wordWrap: { width: tipW - 16 },
      }));
    });
  }

  _hideTooltip() {
    if (this.tooltipContainer) {
      this.tooltipContainer.destroy();
      this.tooltipContainer = null;
    }
  }

  _updateHUD() {
    const player = this.worldScene?.player;
    if (!player) return;
    const stats = player.stats;
    this._updateBar(this.hpBar, stats.HP, stats.maxHP);
    this._updateBar(this.mpBar, stats.MP, stats.maxMP);
    this._updateBar(this.expBar, stats.exp, getExpForLevel(stats.level), (current, max) => `${Math.floor(current || 0)} / ${Math.floor(max || 1)}`);
    this.levelText.setText(`Lv. ${stats.level}`);
    this.goldText.setText(`Gold ${stats.gold || 0}`);
    this._updateSkillSlots();
    this._updateQuickItems();

    const weapon = player.equipment.WEAPON;
    if (weapon && this.worldScene?.proficiencySystem) {
      const type = weapon.weaponType || 'SWORD';
      const prof = this.worldScene.proficiencySystem.getProficiencyLevel('weapon', type);
      this.profText.setText(`숙련 ${prof.nameKo || prof.key}`);
    } else {
      this.profText.setText('숙련 -');
    }
  }

  _onInventoryChanged() {
    this._updateHUD();
    if (this.activePanel === 'character') this._drawCharacterPanel();
  }

  _onEquipmentChanged() {
    this._updateHUD();
    if (this.activePanel === 'character') this._drawCharacterPanel();
  }

  _onLevelUp(newLevel) {
    this._showNotification(`레벨 업! Lv.${newLevel}`, '#ffcc66');
    this._updateHUD();
  }

  _onProfLevelUp(data) {
    this._showNotification(`숙련도 상승: ${data.newLevel?.nameKo || ''}`, '#aa88ff');
  }

  _showNotification(message, color = '#ffffff') {
    const { width, height } = this.cameras.main;
    const y = (height - BOTTOM_UI_HEIGHT) / 2;
    const text = this.add.text(width / 2, y, message, {
      fontSize: '18px',
      fontFamily: 'monospace',
      color,
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(5000);
    this.tweens.add({
      targets: text,
      y: y - 36,
      alpha: 0,
      duration: 1600,
      ease: 'Power2',
      onComplete: () => text.destroy(),
    });
  }

  _doSave() {
    const ws = this.worldScene;
    if (!ws?.player) return;
    const ok = this.saveSystem.save(ws.player, ws.mapId || 'field_01', ws.proficiencySystem);
    this._showNotification(ok ? '저장 완료' : '저장 실패', ok ? '#44ff88' : '#ff6666');
  }

  _doAutoSave() {
    const ws = this.worldScene;
    if (!ws?.player) return;
    this.saveSystem.autoSave(ws.player, ws.mapId || 'field_01', ws.proficiencySystem);
  }

  _doLoadLast() {
    const data = this.saveSystem.load();
    if (!data) {
      this._showNotification('저장 데이터가 없습니다', '#ff7777');
      return;
    }
    this._applyLoadData(data);
  }

  _applyLoadData(data) {
    const ws = this.worldScene;
    if (!ws?.player || !data?.player) return;
    Object.assign(ws.player.stats, data.player.stats || {});
    ws.player.equipment = { ...ws.player.equipment, ...(data.player.equipment || {}) };
    ws.player.inventory = Array.isArray(data.player.inventory) ? data.player.inventory.map(entry => ({ ...entry })) : [];
    ws.player.skills = Array.isArray(data.player.skills) ? [...data.player.skills] : ws.player.skills;
    ws.player.skillSlots = Array.isArray(data.player.skillSlots) ? [...data.player.skillSlots] : ws.player.skillSlots;
    ws.player.skillCooldowns = {};
    ws.player.buffs = [];
    ws.player.channelEffects = {};
    ws.player.activeSkillEffects = {};
    if (ws.proficiencySystem && data.proficiency) ws.proficiencySystem.fromJSON(data.proficiency);
    if (data.map) ws.player.setPosition(data.map.x, data.map.y);
    ws.player._updateEquipmentVisuals();
    ws.events.emit('player-stats-changed');
    this._showNotification('불러오기 완료', '#44ff88');
  }

  update() {
    this._updateSkillSlots();
  }
}
