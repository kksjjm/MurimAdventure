// =============================================================================
// ShopSystem.js - Buy/sell shop UI using Phaser graphics
// =============================================================================

import { getGameData } from '../../data/GameDataLoader.js';
import { SHOP_CONSUMABLES_BY_ID, WEAPON_SHOP_ITEMS, GENERAL_SHOP_ITEMS } from '../data/shopData.js';

/**
 * Resolve an item definition by ID, checking both the game data items
 * and the shop-exclusive consumables.
 */
function getItemData(itemId) {
  return getGameData().items[itemId] || SHOP_CONSUMABLES_BY_ID[itemId] || null;
}

export default class ShopSystem {
  /**
   * @param {Phaser.Scene} scene - The UI scene (UIScene)
   */
  constructor(scene) {
    this.scene = scene;

    /** @type {boolean} */
    this.isOpen = false;

    /** @type {'buy'|'sell'} Current tab */
    this.currentTab = 'buy';

    /** @type {'weapon'|'general'} Shop type */
    this.shopType = 'weapon';

    /** @type {object[]} Current shop inventory [{itemId, price, stock}] */
    this.shopItems = [];

    /** @type {number} Scroll offset for long lists */
    this.scrollOffset = 0;

    /** @type {Phaser.GameObjects.Container} */
    this.container = scene.add.container(0, 0);
    this.container.setDepth(2500);
    this.container.setVisible(false);

    // ESC to close shop
    this.scene.input.keyboard.on('keydown-ESC', () => {
      if (this.isOpen) this.closeShop();
    });
  }

  // ===========================================================================
  // Public API
  // ===========================================================================

  /**
   * Open the shop panel.
   * @param {'weapon'|'general'} shopType
   * @param {object[]} [shopData] - Override items; defaults to predefined lists
   */
  openShop(shopType, shopData) {
    this.shopType = shopType || 'weapon';
    this.currentTab = 'buy';
    this.scrollOffset = 0;

    if (shopData) {
      this.shopItems = shopData.map(s => ({ ...s }));
    } else {
      const source = shopType === 'weapon' ? WEAPON_SHOP_ITEMS : GENERAL_SHOP_ITEMS;
      this.shopItems = source.map(s => ({ ...s }));
    }

    this.isOpen = true;
    this._render();
  }

  /**
   * Close the shop panel.
   */
  closeShop() {
    this.isOpen = false;
    this.container.removeAll(true);
    this.container.setVisible(false);
    this.scene.events.emit('shop-closed');
  }

  // ===========================================================================
  // Rendering
  // ===========================================================================

  /** @private */
  _render() {
    this.container.removeAll(true);
    this.container.setVisible(true);

    const { width, height } = this.scene.cameras.main;
    const pw = 380;
    const ph = 440;
    const px = (width - pw) / 2;
    const py = (height - ph) / 2;

    // --- Panel background ---
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x1a1a2e, 0.95);
    bg.fillRect(px, py, pw, ph);
    bg.fillStyle(0x2a2a4e, 1.0);
    bg.fillRect(px, py, pw, 28);
    bg.lineStyle(2, 0x4a4a6e);
    bg.strokeRect(px, py, pw, ph);
    this.container.add(bg);

    // --- Title ---
    const titleText = this.shopType === 'weapon' ? '무기점 (Weapon Shop)' : '잡화점 (General Shop)';
    const title = this.scene.add.text(px + pw / 2, py + 14, titleText, {
      fontSize: '13px',
      fontFamily: 'monospace',
      color: '#ffcc66',
    }).setOrigin(0.5);
    this.container.add(title);

    // --- Close button ---
    this._addCloseButton(px + pw - 20, py + 14);

    // --- Player gold ---
    const player = this._getPlayer();
    const goldAmount = player ? player.stats.gold : 0;
    const goldText = this.scene.add.text(px + 14, py + 34, `소지금: ${goldAmount} Gold`, {
      fontSize: '11px',
      fontFamily: 'monospace',
      color: '#ffcc00',
      stroke: '#000000',
      strokeThickness: 1,
    });
    this.container.add(goldText);

    // --- Tabs (Buy / Sell) ---
    this._renderTabs(px, py);

    // --- Item list ---
    if (this.currentTab === 'buy') {
      this._renderBuyList(px, py, pw, ph);
    } else {
      this._renderSellList(px, py, pw, ph);
    }
  }

  /** @private */
  _renderTabs(px, py) {
    const tabs = [
      { label: '구매', key: 'buy' },
      { label: '판매', key: 'sell' },
    ];

    const tabW = 70;
    const tabH = 22;
    const tabStartX = px + 240;
    const tabY = py + 32;

    tabs.forEach((tab, i) => {
      const tx = tabStartX + i * (tabW + 4);
      const isActive = this.currentTab === tab.key;

      const tabBg = this.scene.add.graphics();
      tabBg.fillStyle(isActive ? 0x3a3a6e : 0x222244, 0.9);
      tabBg.fillRect(tx, tabY, tabW, tabH);
      tabBg.lineStyle(1, isActive ? 0x6a6a9e : 0x444466);
      tabBg.strokeRect(tx, tabY, tabW, tabH);
      this.container.add(tabBg);

      const tabText = this.scene.add.text(tx + tabW / 2, tabY + tabH / 2, tab.label, {
        fontSize: '11px',
        fontFamily: 'monospace',
        color: isActive ? '#ffffff' : '#888899',
      }).setOrigin(0.5);
      this.container.add(tabText);

      const zone = this.scene.add.zone(tx + tabW / 2, tabY + tabH / 2, tabW, tabH)
        .setInteractive();
      this.container.add(zone);

      zone.on('pointerdown', () => {
        this.currentTab = tab.key;
        this.scrollOffset = 0;
        this._render();
      });
    });
  }

  /** @private */
  _renderBuyList(px, py, pw, ph) {
    const listX = px + 10;
    const listY = py + 62;
    const listW = pw - 20;
    const rowH = 48;
    const maxVisible = Math.floor((ph - 80) / rowH);

    const items = this.shopItems;
    const visible = items.slice(this.scrollOffset, this.scrollOffset + maxVisible);

    if (visible.length === 0) {
      const emptyText = this.scene.add.text(px + pw / 2, listY + 40, '판매 중인 물품이 없습니다.', {
        fontSize: '11px', fontFamily: 'monospace', color: '#666688',
      }).setOrigin(0.5);
      this.container.add(emptyText);
      return;
    }

    visible.forEach((shopItem, i) => {
      const itemData = getItemData(shopItem.itemId);
      if (!itemData) return;

      const ry = listY + i * rowH;

      // Row background
      const rowBg = this.scene.add.graphics();
      rowBg.fillStyle(i % 2 === 0 ? 0x222244 : 0x1e1e3a, 0.7);
      rowBg.fillRect(listX, ry, listW, rowH - 2);
      this.container.add(rowBg);

      // Item name
      const nameText = this.scene.add.text(listX + 8, ry + 6, itemData.nameKo || itemData.name, {
        fontSize: '11px', fontFamily: 'monospace', color: '#ffffff',
      });
      this.container.add(nameText);

      // Item description (truncated)
      const desc = (itemData.description || '').substring(0, 30);
      const descText = this.scene.add.text(listX + 8, ry + 22, desc, {
        fontSize: '8px', fontFamily: 'monospace', color: '#888899',
      });
      this.container.add(descText);

      // Price
      const priceColor = this._canAfford(shopItem.price) ? '#ffcc00' : '#ff4444';
      const priceText = this.scene.add.text(listX + listW - 90, ry + 6, `${shopItem.price} G`, {
        fontSize: '11px', fontFamily: 'monospace', color: priceColor,
      });
      this.container.add(priceText);

      // Stock
      const stockLabel = shopItem.stock > 0 ? `잔여: ${shopItem.stock}` : '품절';
      const stockColor = shopItem.stock > 0 ? '#aaaacc' : '#ff4444';
      const stockText = this.scene.add.text(listX + listW - 90, ry + 22, stockLabel, {
        fontSize: '8px', fontFamily: 'monospace', color: stockColor,
      });
      this.container.add(stockText);

      // Buy button
      if (shopItem.stock > 0) {
        const btnX = listX + listW - 40;
        const btnY2 = ry + 8;
        const btnW = 36;
        const btnH = 28;

        const btnBg = this.scene.add.graphics();
        btnBg.fillStyle(0x335533, 0.9);
        btnBg.fillRect(btnX, btnY2, btnW, btnH);
        btnBg.lineStyle(1, 0x448844);
        btnBg.strokeRect(btnX, btnY2, btnW, btnH);
        this.container.add(btnBg);

        const btnText = this.scene.add.text(btnX + btnW / 2, btnY2 + btnH / 2, '구매', {
          fontSize: '10px', fontFamily: 'monospace', color: '#88ff88',
        }).setOrigin(0.5);
        this.container.add(btnText);

        const zone = this.scene.add.zone(btnX + btnW / 2, btnY2 + btnH / 2, btnW, btnH)
          .setInteractive();
        this.container.add(zone);

        zone.on('pointerdown', () => {
          this._buyItem(this.scrollOffset + i);
        });

        zone.on('pointerover', () => {
          btnBg.clear();
          btnBg.fillStyle(0x447744, 0.9);
          btnBg.fillRect(btnX, btnY2, btnW, btnH);
          btnBg.lineStyle(1, 0x66aa66);
          btnBg.strokeRect(btnX, btnY2, btnW, btnH);
        });
        zone.on('pointerout', () => {
          btnBg.clear();
          btnBg.fillStyle(0x335533, 0.9);
          btnBg.fillRect(btnX, btnY2, btnW, btnH);
          btnBg.lineStyle(1, 0x448844);
          btnBg.strokeRect(btnX, btnY2, btnW, btnH);
        });
      }
    });

    // Scroll indicators
    this._renderScrollButtons(px, py, pw, ph, items.length, maxVisible);
  }

  /** @private */
  _renderSellList(px, py, pw, ph) {
    const listX = px + 10;
    const listY = py + 62;
    const listW = pw - 20;
    const rowH = 48;
    const maxVisible = Math.floor((ph - 80) / rowH);

    const player = this._getPlayer();
    if (!player) return;

    const sellable = player.inventory.filter(inv => {
      const data = getItemData(inv.itemId);
      return data != null;
    });

    const visible = sellable.slice(this.scrollOffset, this.scrollOffset + maxVisible);

    if (visible.length === 0) {
      const emptyText = this.scene.add.text(px + pw / 2, listY + 40, '판매할 물품이 없습니다.', {
        fontSize: '11px', fontFamily: 'monospace', color: '#666688',
      }).setOrigin(0.5);
      this.container.add(emptyText);
      return;
    }

    visible.forEach((invEntry, i) => {
      const itemData = getItemData(invEntry.itemId);
      if (!itemData) return;

      const ry = listY + i * rowH;

      // Row background
      const rowBg = this.scene.add.graphics();
      rowBg.fillStyle(i % 2 === 0 ? 0x222244 : 0x1e1e3a, 0.7);
      rowBg.fillRect(listX, ry, listW, rowH - 2);
      this.container.add(rowBg);

      // Item name + qty
      const qtyStr = invEntry.quantity > 1 ? ` x${invEntry.quantity}` : '';
      const nameText = this.scene.add.text(listX + 8, ry + 6,
        `${itemData.nameKo || itemData.name}${qtyStr}`, {
        fontSize: '11px', fontFamily: 'monospace', color: '#ffffff',
      });
      this.container.add(nameText);

      // Sell price (50% of buy price)
      const sellPrice = this._getSellPrice(invEntry.itemId);
      const priceText = this.scene.add.text(listX + listW - 90, ry + 6, `${sellPrice} G`, {
        fontSize: '11px', fontFamily: 'monospace', color: '#ffcc00',
      });
      this.container.add(priceText);

      // Description
      const desc = (itemData.description || '').substring(0, 30);
      const descText = this.scene.add.text(listX + 8, ry + 22, desc, {
        fontSize: '8px', fontFamily: 'monospace', color: '#888899',
      });
      this.container.add(descText);

      // Sell button
      const btnX = listX + listW - 40;
      const btnY2 = ry + 8;
      const btnW = 36;
      const btnH = 28;

      const btnBg = this.scene.add.graphics();
      btnBg.fillStyle(0x553333, 0.9);
      btnBg.fillRect(btnX, btnY2, btnW, btnH);
      btnBg.lineStyle(1, 0x884444);
      btnBg.strokeRect(btnX, btnY2, btnW, btnH);
      this.container.add(btnBg);

      const btnText = this.scene.add.text(btnX + btnW / 2, btnY2 + btnH / 2, '판매', {
        fontSize: '10px', fontFamily: 'monospace', color: '#ff8888',
      }).setOrigin(0.5);
      this.container.add(btnText);

      const zone = this.scene.add.zone(btnX + btnW / 2, btnY2 + btnH / 2, btnW, btnH)
        .setInteractive();
      this.container.add(zone);

      zone.on('pointerdown', () => {
        this._sellItem(invEntry.itemId);
      });

      zone.on('pointerover', () => {
        btnBg.clear();
        btnBg.fillStyle(0x774444, 0.9);
        btnBg.fillRect(btnX, btnY2, btnW, btnH);
        btnBg.lineStyle(1, 0xaa6666);
        btnBg.strokeRect(btnX, btnY2, btnW, btnH);
      });
      zone.on('pointerout', () => {
        btnBg.clear();
        btnBg.fillStyle(0x553333, 0.9);
        btnBg.fillRect(btnX, btnY2, btnW, btnH);
        btnBg.lineStyle(1, 0x884444);
        btnBg.strokeRect(btnX, btnY2, btnW, btnH);
      });
    });

    this._renderScrollButtons(px, py, pw, ph, sellable.length, maxVisible);
  }

  /** @private Render up/down scroll buttons if list overflows */
  _renderScrollButtons(px, py, pw, ph, totalItems, maxVisible) {
    if (totalItems <= maxVisible) return;

    // Up arrow
    if (this.scrollOffset > 0) {
      const upBtn = this.scene.add.text(px + pw - 20, py + 60, '\u25B2', {
        fontSize: '14px', fontFamily: 'monospace', color: '#aaaacc',
      }).setOrigin(0.5).setInteractive();
      this.container.add(upBtn);
      upBtn.on('pointerdown', () => {
        this.scrollOffset = Math.max(0, this.scrollOffset - 1);
        this._render();
      });
    }

    // Down arrow
    if (this.scrollOffset + maxVisible < totalItems) {
      const downBtn = this.scene.add.text(px + pw - 20, py + ph - 18, '\u25BC', {
        fontSize: '14px', fontFamily: 'monospace', color: '#aaaacc',
      }).setOrigin(0.5).setInteractive();
      this.container.add(downBtn);
      downBtn.on('pointerdown', () => {
        this.scrollOffset = Math.min(totalItems - maxVisible, this.scrollOffset + 1);
        this._render();
      });
    }
  }

  // ===========================================================================
  // Buy / Sell Logic
  // ===========================================================================

  /** @private */
  _buyItem(shopIndex) {
    const shopItem = this.shopItems[shopIndex];
    if (!shopItem || shopItem.stock <= 0) return;

    const player = this._getPlayer();
    if (!player) return;

    if (player.stats.gold < shopItem.price) {
      this._showMessage('금액이 부족합니다!');
      return;
    }

    // Deduct gold
    player.stats.gold -= shopItem.price;

    // Add item to inventory
    const itemData = getItemData(shopItem.itemId);
    if (itemData) {
      // For items not in ITEMS_BY_ID, manually add to inventory
      const existing = player.inventory.find(e => e.itemId === shopItem.itemId);
      if (existing && itemData.stackable) {
        existing.quantity += 1;
      } else {
        player.inventory.push({ itemId: shopItem.itemId, quantity: 1 });
      }
    } else {
      player.addItem(shopItem.itemId, 1);
    }

    // Reduce stock
    shopItem.stock -= 1;

    // Emit events
    this.scene.events.emit('shop-buy', shopItem);
    if (this.scene.worldScene) {
      this.scene.worldScene.events.emit('player-stats-changed');
      this.scene.worldScene.events.emit('inventory-changed');
    }

    this._showMessage(`${(itemData && itemData.nameKo) || shopItem.itemId} 구매 완료!`);
    this._render();
  }

  /** @private */
  _sellItem(itemId) {
    const player = this._getPlayer();
    if (!player) return;

    const invEntry = player.inventory.find(e => e.itemId === itemId);
    if (!invEntry || invEntry.quantity <= 0) return;

    const sellPrice = this._getSellPrice(itemId);

    // Give gold
    player.stats.gold += sellPrice;

    // Remove item
    invEntry.quantity -= 1;
    if (invEntry.quantity <= 0) {
      const idx = player.inventory.indexOf(invEntry);
      if (idx !== -1) player.inventory.splice(idx, 1);
    }

    // Emit events
    this.scene.events.emit('shop-sell', { itemId, price: sellPrice });
    if (this.scene.worldScene) {
      this.scene.worldScene.events.emit('player-stats-changed');
      this.scene.worldScene.events.emit('inventory-changed');
    }

    const itemData = getItemData(itemId);
    this._showMessage(`${(itemData && itemData.nameKo) || itemId} 판매 완료! (+${sellPrice} G)`);
    this._render();
  }

  /** @private Get sell price for an item (50% of buy price or a base value) */
  _getSellPrice(itemId) {
    // Check if item is in any shop's inventory for a base price
    const allShopItems = [...WEAPON_SHOP_ITEMS, ...GENERAL_SHOP_ITEMS];
    const shopEntry = allShopItems.find(s => s.itemId === itemId);
    if (shopEntry) {
      return Math.floor(shopEntry.price * 0.5);
    }
    // Default: 10 gold for unknown items
    return 10;
  }

  /** @private */
  _canAfford(price) {
    const player = this._getPlayer();
    return player && player.stats.gold >= price;
  }

  /** @private Get player reference via worldScene */
  _getPlayer() {
    if (this.scene.worldScene && this.scene.worldScene.player) {
      return this.scene.worldScene.player;
    }
    return null;
  }

  // ===========================================================================
  // Helpers
  // ===========================================================================

  /** @private Show a brief floating message */
  _showMessage(msg) {
    const { width, height } = this.scene.cameras.main;
    const text = this.scene.add.text(width / 2, height / 2 - 60, msg, {
      fontSize: '13px',
      fontFamily: 'monospace',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
      backgroundColor: '#222244',
      padding: { x: 10, y: 6 },
    }).setOrigin(0.5).setDepth(4000);

    this.scene.tweens.add({
      targets: text,
      y: height / 2 - 100,
      alpha: 0,
      duration: 1500,
      ease: 'Power2',
      onComplete: () => text.destroy(),
    });
  }

  /** @private */
  _addCloseButton(x, y) {
    const closeBtn = this.scene.add.text(x, y, 'X', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#ff6666',
      stroke: '#000000',
      strokeThickness: 1,
    }).setOrigin(0.5).setInteractive();
    this.container.add(closeBtn);

    closeBtn.on('pointerdown', () => this.closeShop());
    closeBtn.on('pointerover', () => closeBtn.setColor('#ff9999'));
    closeBtn.on('pointerout', () => closeBtn.setColor('#ff6666'));
  }
}
