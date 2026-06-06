// =============================================================================
// BootScene.js - Generate all placeholder pixel art textures (64x64 HD)
// =============================================================================

import Phaser from 'phaser';

const CHAR_SIZE = 64;  // Character sprite size
const TILE_SIZE = 32;  // Tile texture size
const ICON_SIZE = 16;  // Item icon size
const FX_SIZE = 96;    // Impact effect size

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create() {
    this._generatePlayerBase();
    this._generateEquipmentLayers();
    this._generateMonsterSprites();
    this._generateTileTextures();
    this._generateItemIcons();
    this._generateUIElements();
    this._generateImpactEffects();
    this._generateItemPickup();
    this._generateNPCSprites();
    this._generatePortalTexture();

    this.scene.start('PreloadScene');
  }

  // ==========================================================================
  // Player Base Sprite (64x64) - Detailed martial artist
  // ==========================================================================

  _generatePlayerBase() {
    const g = this.add.graphics();
    const s = CHAR_SIZE;

    // Shadow
    g.fillStyle(0x000000, 0.25);
    g.fillEllipse(s / 2, s - 4, 28, 8);

    // Shoes
    g.fillStyle(0x3d2b1f);
    g.fillRect(19, 54, 10, 6);
    g.fillRect(35, 54, 10, 6);
    g.fillStyle(0x4a3628);
    g.fillRect(20, 55, 8, 4);
    g.fillRect(36, 55, 8, 4);

    // Legs (pants - dark)
    g.fillStyle(0x2a2a3a);
    g.fillRect(22, 40, 8, 15);
    g.fillRect(34, 40, 8, 15);
    // Knee detail
    g.fillStyle(0x333345);
    g.fillRect(23, 44, 6, 3);
    g.fillRect(35, 44, 6, 3);

    // Body (inner robe)
    g.fillStyle(0x1a3366);
    g.fillRect(20, 22, 24, 20);
    // Outer robe (martial arts style - 도복)
    g.fillStyle(0x2244aa);
    g.fillRect(18, 22, 6, 18);
    g.fillRect(40, 22, 6, 18);
    // Robe overlap / lapel
    g.fillStyle(0x2a55bb);
    g.fillRect(22, 22, 10, 16);
    // Right lapel
    g.fillStyle(0x1a3388);
    g.fillRect(32, 22, 8, 16);
    // Robe bottom (skirt)
    g.fillStyle(0x2244aa);
    g.fillRect(18, 38, 28, 6);

    // Belt / Sash
    g.fillStyle(0xcc8833);
    g.fillRect(18, 36, 28, 3);
    g.fillStyle(0xddaa44);
    g.fillRect(19, 37, 26, 1);
    // Belt knot
    g.fillStyle(0xcc8833);
    g.fillRect(30, 36, 4, 6);

    // Arms
    g.fillStyle(0x2244aa);
    g.fillRect(12, 24, 6, 14);
    g.fillRect(46, 24, 6, 14);
    // Forearms (lighter inner robe)
    g.fillStyle(0xf0d0a0);
    g.fillRect(12, 36, 6, 6);
    g.fillRect(46, 36, 6, 6);

    // Hands
    g.fillStyle(0xf0c8a0);
    g.fillRect(12, 41, 6, 4);
    g.fillRect(46, 41, 6, 4);

    // Neck
    g.fillStyle(0xf0c8a0);
    g.fillRect(27, 18, 10, 5);

    // Head
    g.fillStyle(0xf5d0a8);
    g.fillRect(22, 6, 20, 14);
    // Face shading
    g.fillStyle(0xe8c098);
    g.fillRect(22, 14, 20, 4);

    // Eyes
    g.fillStyle(0x1a1a1a);
    g.fillRect(26, 11, 3, 3);
    g.fillRect(35, 11, 3, 3);
    // Eye highlights
    g.fillStyle(0xffffff);
    g.fillRect(27, 11, 1, 1);
    g.fillRect(36, 11, 1, 1);

    // Eyebrows
    g.fillStyle(0x222222);
    g.fillRect(25, 9, 5, 1);
    g.fillRect(34, 9, 5, 1);

    // Mouth
    g.fillStyle(0xcc8877);
    g.fillRect(30, 16, 4, 1);

    // Hair (top knot style - 상투)
    g.fillStyle(0x1a1a2a);
    g.fillRect(22, 4, 20, 6);
    g.fillRect(24, 2, 16, 4);
    // Top knot bun
    g.fillStyle(0x222233);
    g.fillRect(28, 0, 8, 4);
    g.fillRect(30, -1, 4, 2);
    // Hair pin
    g.fillStyle(0xccaa44);
    g.fillRect(27, 1, 10, 1);

    // Sideburns
    g.fillStyle(0x1a1a2a);
    g.fillRect(21, 8, 2, 6);
    g.fillRect(41, 8, 2, 6);

    g.generateTexture('player_base', s, s);
    g.destroy();
  }

  // ==========================================================================
  // Equipment Layer Textures (64x64 overlays)
  // ==========================================================================

  _generateEquipmentLayers() {
    const s = CHAR_SIZE;

    // --- WEAPON layers ---
    // Sword (한손검)
    this._genTex('equip_weapon_sword', s, s, (g) => {
      // Blade
      g.fillStyle(0xd0d0e0);
      g.fillRect(8, 10, 3, 28);
      g.fillStyle(0xe0e0f0);
      g.fillRect(9, 10, 1, 28);
      // Tip
      g.fillStyle(0xe8e8f8);
      g.fillRect(8, 8, 3, 3);
      g.fillRect(9, 6, 1, 3);
      // Guard (tsuba)
      g.fillStyle(0xccaa33);
      g.fillRect(5, 37, 9, 3);
      g.fillStyle(0xddbb44);
      g.fillRect(6, 38, 7, 1);
      // Handle
      g.fillStyle(0x553322);
      g.fillRect(8, 40, 3, 8);
      // Wrapping
      g.fillStyle(0x664433);
      g.fillRect(8, 41, 3, 1);
      g.fillRect(8, 44, 3, 1);
      g.fillRect(8, 47, 3, 1);
      // Pommel
      g.fillStyle(0xccaa33);
      g.fillRect(7, 48, 5, 2);
    });

    // Spear (창)
    this._genTex('equip_weapon_spear', s, s, (g) => {
      // Shaft
      g.fillStyle(0x886644);
      g.fillRect(9, 12, 2, 48);
      // Spear head
      g.fillStyle(0xccccdd);
      g.fillRect(8, 4, 4, 10);
      g.fillRect(9, 2, 2, 3);
      // Red tassel
      g.fillStyle(0xcc3333);
      g.fillRect(6, 13, 2, 6);
      g.fillRect(12, 13, 2, 6);
    });

    // Dual blades (쌍수)
    this._genTex('equip_weapon_dual', s, s, (g) => {
      // Left blade
      g.fillStyle(0xccccdd);
      g.fillRect(8, 16, 2, 20);
      g.fillStyle(0xccaa33);
      g.fillRect(6, 35, 6, 2);
      g.fillStyle(0x553322);
      g.fillRect(8, 37, 2, 5);
      // Right blade
      g.fillStyle(0xccccdd);
      g.fillRect(54, 16, 2, 20);
      g.fillStyle(0xccaa33);
      g.fillRect(52, 35, 6, 2);
      g.fillStyle(0x553322);
      g.fillRect(54, 37, 2, 5);
    });

    // Staff / Fan (부채/지팡이)
    this._genTex('equip_weapon_staff', s, s, (g) => {
      g.fillStyle(0x775533);
      g.fillRect(8, 8, 2, 50);
      // Orb on top
      g.fillStyle(0x4488ff);
      g.fillRect(5, 3, 8, 8);
      g.fillStyle(0x66aaff);
      g.fillRect(7, 5, 4, 4);
      g.fillStyle(0xaaddff);
      g.fillRect(8, 6, 2, 2);
    });

    // --- HELMET layers ---
    this._genTex('equip_helmet_basic', s, s, (g) => {
      // Helmet cap
      g.fillStyle(0x888899);
      g.fillRect(21, 2, 22, 6);
      g.fillRect(20, 4, 24, 4);
      // Rim
      g.fillStyle(0x999aaa);
      g.fillRect(19, 7, 26, 2);
      // Crest
      g.fillStyle(0xcc3333);
      g.fillRect(30, 0, 4, 4);
    });

    this._genTex('equip_helmet_crown', s, s, (g) => {
      g.fillStyle(0xccaa33);
      g.fillRect(22, 3, 20, 5);
      g.fillRect(20, 6, 24, 2);
      // Crown points
      g.fillStyle(0xddbb44);
      g.fillRect(24, 1, 3, 3);
      g.fillRect(31, 0, 2, 4);
      g.fillRect(38, 1, 3, 3);
      // Gems
      g.fillStyle(0xff3344);
      g.fillRect(25, 2, 1, 1);
      g.fillStyle(0x3344ff);
      g.fillRect(31, 1, 1, 1);
      g.fillStyle(0x33ff44);
      g.fillRect(38, 2, 1, 1);
    });

    // --- ARMOR layers ---
    this._genTex('equip_armor_leather', s, s, (g) => {
      // Leather chest
      g.fillStyle(0x8B6914, 0.85);
      g.fillRect(19, 22, 26, 18);
      // Shoulder pads
      g.fillStyle(0x9B7924, 0.85);
      g.fillRect(14, 22, 6, 6);
      g.fillRect(44, 22, 6, 6);
      // Stitching
      g.fillStyle(0x6B4904, 0.6);
      g.fillRect(32, 24, 1, 14);
    });

    this._genTex('equip_armor_iron', s, s, (g) => {
      // Iron plate
      g.fillStyle(0x888899, 0.9);
      g.fillRect(19, 22, 26, 18);
      // Plate segments
      g.fillStyle(0x999aaa, 0.9);
      g.fillRect(20, 22, 10, 16);
      g.fillRect(34, 22, 10, 16);
      // Shoulder plates
      g.fillStyle(0x777788, 0.9);
      g.fillRect(12, 22, 8, 8);
      g.fillRect(44, 22, 8, 8);
      // Rivets
      g.fillStyle(0xbbbbcc);
      g.fillRect(14, 24, 2, 2);
      g.fillRect(48, 24, 2, 2);
    });

    // --- SHIELD layer ---
    this._genTex('equip_shield', s, s, (g) => {
      // Shield on right arm
      g.fillStyle(0x885533);
      g.fillRect(48, 26, 14, 16);
      g.fillStyle(0x996644);
      g.fillRect(50, 28, 10, 12);
      // Boss (center emblem)
      g.fillStyle(0xccaa33);
      g.fillRect(53, 32, 4, 4);
      // Rim
      g.fillStyle(0x774422);
      g.fillRect(48, 26, 14, 1);
      g.fillRect(48, 41, 14, 1);
      g.fillRect(48, 26, 1, 16);
      g.fillRect(61, 26, 1, 16);
    });

    // --- GLOVES layer ---
    this._genTex('equip_gloves_basic', s, s, (g) => {
      g.fillStyle(0x885533, 0.9);
      g.fillRect(11, 38, 8, 8);
      g.fillRect(45, 38, 8, 8);
      // Knuckle detail
      g.fillStyle(0x996644);
      g.fillRect(12, 39, 6, 2);
      g.fillRect(46, 39, 6, 2);
    });

    // --- SHOES layer ---
    this._genTex('equip_shoes_basic', s, s, (g) => {
      g.fillStyle(0x664422, 0.9);
      g.fillRect(18, 54, 12, 7);
      g.fillRect(34, 54, 12, 7);
      // Toe caps
      g.fillStyle(0x775533);
      g.fillRect(18, 56, 4, 4);
      g.fillRect(34, 56, 4, 4);
    });

    // --- BELT layer ---
    this._genTex('equip_belt_fancy', s, s, (g) => {
      g.fillStyle(0xcc3333, 0.9);
      g.fillRect(18, 36, 28, 3);
      g.fillStyle(0xdd4444);
      g.fillRect(19, 37, 26, 1);
      // Buckle / jade
      g.fillStyle(0x44cc88);
      g.fillRect(29, 35, 6, 5);
      g.fillStyle(0x55ddaa);
      g.fillRect(30, 36, 4, 3);
    });

    // --- NECKLACE layer ---
    this._genTex('equip_necklace', s, s, (g) => {
      // Chain
      g.fillStyle(0xccaa33, 0.8);
      g.fillRect(26, 18, 1, 4);
      g.fillRect(37, 18, 1, 4);
      g.fillRect(27, 20, 10, 1);
      // Pendant
      g.fillStyle(0x44aaff);
      g.fillRect(30, 21, 4, 4);
      g.fillStyle(0x66ccff);
      g.fillRect(31, 22, 2, 2);
    });

    // --- CAPE / TALISMAN layer (부적 on back) ---
    this._genTex('equip_talisman', s, s, (g) => {
      // Paper talisman hanging from belt
      g.fillStyle(0xeeee88, 0.9);
      g.fillRect(40, 38, 6, 12);
      // Characters on talisman
      g.fillStyle(0xcc3333);
      g.fillRect(41, 40, 4, 1);
      g.fillRect(42, 42, 2, 3);
      g.fillRect(41, 46, 4, 1);
      g.fillRect(43, 47, 1, 2);
    });
  }

  // ==========================================================================
  // Monster Sprites (64x64 detailed)
  // ==========================================================================

  _generateMonsterSprites() {
    const s = CHAR_SIZE;

    // --- Wild Boar (야생 멧돼지) ---
    this._genTex('monster_boar', s, s, (g) => {
      // Shadow
      g.fillStyle(0x000000, 0.2);
      g.fillEllipse(s / 2, s - 4, 36, 8);
      // Body
      g.fillStyle(0x7B5B2A);
      g.fillRect(14, 24, 36, 22);
      g.fillStyle(0x8B6B3A);
      g.fillRect(16, 26, 32, 18);
      // Belly
      g.fillStyle(0x9B7B4A);
      g.fillRect(20, 36, 24, 8);
      // Head
      g.fillStyle(0x8B6B3A);
      g.fillRect(6, 22, 14, 18);
      g.fillStyle(0x9B7B4A);
      g.fillRect(8, 24, 10, 14);
      // Snout
      g.fillStyle(0xCC9966);
      g.fillRect(2, 30, 8, 8);
      g.fillStyle(0xDDAA77);
      g.fillRect(3, 32, 6, 4);
      // Nostrils
      g.fillStyle(0x664433);
      g.fillRect(3, 33, 2, 2);
      g.fillRect(6, 33, 2, 2);
      // Tusks
      g.fillStyle(0xffffff);
      g.fillRect(2, 38, 2, 5);
      g.fillRect(7, 38, 2, 5);
      g.fillStyle(0xeeeeee);
      g.fillRect(2, 38, 1, 5);
      g.fillRect(7, 38, 1, 5);
      // Eye
      g.fillStyle(0xff3300);
      g.fillRect(10, 26, 3, 3);
      g.fillStyle(0xff0000);
      g.fillRect(11, 27, 1, 1);
      // Ears
      g.fillStyle(0x7B5B2A);
      g.fillRect(8, 18, 4, 6);
      g.fillRect(14, 18, 4, 6);
      g.fillStyle(0xCC9966);
      g.fillRect(9, 19, 2, 4);
      g.fillRect(15, 19, 2, 4);
      // Legs
      g.fillStyle(0x5B3B0A);
      g.fillRect(16, 44, 6, 14);
      g.fillRect(24, 44, 6, 14);
      g.fillRect(32, 44, 6, 14);
      g.fillRect(40, 44, 6, 14);
      // Hooves
      g.fillStyle(0x333333);
      g.fillRect(16, 56, 6, 3);
      g.fillRect(24, 56, 6, 3);
      g.fillRect(32, 56, 6, 3);
      g.fillRect(40, 56, 6, 3);
      // Tail
      g.fillStyle(0x7B5B2A);
      g.fillRect(50, 24, 4, 3);
      g.fillRect(52, 22, 3, 4);
      // Bristles
      g.fillStyle(0x5B3B0A);
      g.fillRect(20, 22, 2, 3);
      g.fillRect(28, 22, 2, 3);
      g.fillRect(36, 22, 2, 3);
    });

    // --- Mountain Bandit (산적) ---
    this._genTex('monster_bandit', s, s, (g) => {
      // Shadow
      g.fillStyle(0x000000, 0.25);
      g.fillEllipse(s / 2, s - 4, 28, 8);
      // Shoes
      g.fillStyle(0x3d2b1f);
      g.fillRect(20, 54, 10, 6);
      g.fillRect(34, 54, 10, 6);
      // Legs
      g.fillStyle(0x444444);
      g.fillRect(22, 40, 8, 15);
      g.fillRect(34, 40, 8, 15);
      // Body (dark clothing)
      g.fillStyle(0x333344);
      g.fillRect(18, 22, 28, 20);
      // Sash
      g.fillStyle(0xcc2222);
      g.fillRect(18, 36, 28, 3);
      // Arms
      g.fillStyle(0x333344);
      g.fillRect(12, 24, 6, 14);
      g.fillRect(46, 24, 6, 14);
      // Hands
      g.fillStyle(0xddaa88);
      g.fillRect(12, 38, 6, 4);
      g.fillRect(46, 38, 6, 4);
      // Head
      g.fillStyle(0xddaa88);
      g.fillRect(24, 6, 16, 14);
      // Headband (red)
      g.fillStyle(0xcc2222);
      g.fillRect(22, 6, 20, 4);
      g.fillStyle(0xdd3333);
      g.fillRect(23, 7, 18, 2);
      // Headband tail
      g.fillStyle(0xcc2222);
      g.fillRect(42, 7, 6, 3);
      g.fillRect(46, 8, 4, 2);
      // Beard
      g.fillStyle(0x222222);
      g.fillRect(28, 16, 8, 4);
      // Eyes (menacing)
      g.fillStyle(0x111111);
      g.fillRect(27, 11, 3, 3);
      g.fillRect(34, 11, 3, 3);
      g.fillStyle(0xffffff);
      g.fillRect(28, 11, 1, 1);
      g.fillRect(35, 11, 1, 1);
      // Scar
      g.fillStyle(0xcc8888);
      g.fillRect(36, 9, 1, 6);
      // Weapon (large sword behind)
      g.fillStyle(0x999999);
      g.fillRect(50, 8, 3, 30);
      g.fillStyle(0xaaaaaa);
      g.fillRect(51, 8, 1, 30);
      // Sword guard
      g.fillStyle(0x886633);
      g.fillRect(48, 36, 7, 3);
      // Handle
      g.fillStyle(0x664422);
      g.fillRect(50, 39, 3, 8);
    });

    // --- Gray Wolf (회색 늑대) ---
    this._genTex('monster_wolf', s, s, (g) => {
      // Shadow
      g.fillStyle(0x000000, 0.2);
      g.fillEllipse(s / 2, s - 4, 38, 8);
      // Body
      g.fillStyle(0x555577);
      g.fillRect(14, 22, 36, 18);
      g.fillStyle(0x666688);
      g.fillRect(16, 24, 32, 14);
      // Belly
      g.fillStyle(0x888899);
      g.fillRect(20, 34, 20, 6);
      // Head
      g.fillStyle(0x666688);
      g.fillRect(4, 18, 16, 16);
      g.fillStyle(0x777799);
      g.fillRect(6, 20, 12, 12);
      // Snout
      g.fillStyle(0x8888aa);
      g.fillRect(0, 26, 8, 6);
      g.fillStyle(0x999abb);
      g.fillRect(1, 27, 6, 4);
      // Nose
      g.fillStyle(0x222222);
      g.fillRect(0, 27, 3, 2);
      // Teeth
      g.fillStyle(0xffffff);
      g.fillRect(2, 31, 2, 2);
      g.fillRect(5, 31, 2, 2);
      // Ears
      g.fillStyle(0x555577);
      g.fillRect(6, 12, 5, 8);
      g.fillRect(14, 12, 5, 8);
      g.fillStyle(0xcc8899);
      g.fillRect(7, 14, 3, 4);
      g.fillRect(15, 14, 3, 4);
      // Eyes
      g.fillStyle(0xffff00);
      g.fillRect(8, 22, 4, 3);
      g.fillStyle(0x000000);
      g.fillRect(9, 23, 2, 1);
      // Legs
      g.fillStyle(0x444466);
      g.fillRect(16, 38, 6, 16);
      g.fillRect(24, 38, 6, 16);
      g.fillRect(36, 38, 6, 16);
      g.fillRect(44, 38, 6, 16);
      // Paws
      g.fillStyle(0x555577);
      g.fillRect(15, 52, 8, 4);
      g.fillRect(23, 52, 8, 4);
      g.fillRect(35, 52, 8, 4);
      g.fillRect(43, 52, 8, 4);
      // Tail
      g.fillStyle(0x555577);
      g.fillRect(50, 18, 6, 4);
      g.fillRect(54, 16, 5, 4);
      g.fillRect(57, 14, 4, 4);
      g.fillStyle(0x888899);
      g.fillRect(58, 15, 2, 2);
    });

    // --- Poison Snake (독사) ---
    this._genTex('monster_snake', s, s, (g) => {
      // Shadow
      g.fillStyle(0x000000, 0.15);
      g.fillEllipse(s / 2, s - 6, 30, 6);
      // Body coils
      g.fillStyle(0x33AA33);
      g.fillRect(14, 36, 32, 8);
      g.fillRect(10, 28, 8, 16);
      g.fillRect(42, 28, 8, 16);
      g.fillRect(18, 22, 28, 8);
      // Pattern (diamond)
      g.fillStyle(0x228822);
      g.fillRect(18, 38, 4, 4);
      g.fillRect(28, 38, 4, 4);
      g.fillRect(38, 38, 4, 4);
      g.fillStyle(0x44CC44);
      g.fillRect(20, 24, 4, 4);
      g.fillRect(30, 24, 4, 4);
      g.fillRect(40, 24, 4, 4);
      // Belly scales
      g.fillStyle(0x88CC88);
      g.fillRect(14, 42, 32, 2);
      // Head (raised)
      g.fillStyle(0x44CC44);
      g.fillRect(22, 10, 12, 14);
      g.fillStyle(0x55DD55);
      g.fillRect(24, 12, 8, 10);
      // Hood (cobra-like)
      g.fillStyle(0x33AA33);
      g.fillRect(18, 14, 6, 8);
      g.fillRect(40, 14, 6, 8);
      // Eyes
      g.fillStyle(0xffff00);
      g.fillRect(24, 14, 3, 3);
      g.fillRect(33, 14, 3, 3);
      g.fillStyle(0x000000);
      g.fillRect(25, 15, 1, 1);
      g.fillRect(34, 15, 1, 1);
      // Tongue
      g.fillStyle(0xff3333);
      g.fillRect(29, 24, 2, 6);
      g.fillRect(27, 28, 2, 3);
      g.fillRect(31, 28, 2, 3);
      // Fangs
      g.fillStyle(0xffffff);
      g.fillRect(26, 22, 1, 3);
      g.fillRect(33, 22, 1, 3);
    });
  }

  // ==========================================================================
  // Tile Textures (32x32)
  // ==========================================================================

  _generateTileTextures() {
    this._genTex('tile_grass', TILE_SIZE, TILE_SIZE, (g) => {
      g.fillStyle(0x3a7d44);
      g.fillRect(0, 0, 32, 32);
      g.fillStyle(0x4a9d54);
      for (let i = 0; i < 10; i++) {
        g.fillRect(Math.floor(Math.random() * 30), Math.floor(Math.random() * 30), 2, 3);
      }
      g.fillStyle(0x2a6d34);
      for (let i = 0; i < 6; i++) {
        g.fillRect(Math.floor(Math.random() * 30), Math.floor(Math.random() * 30), 1, 2);
      }
    });

    this._genTex('tile_dirt', TILE_SIZE, TILE_SIZE, (g) => {
      g.fillStyle(0x8b6c42);
      g.fillRect(0, 0, 32, 32);
      g.fillStyle(0x7b5c32);
      for (let i = 0; i < 6; i++) {
        g.fillRect(Math.floor(Math.random() * 28), Math.floor(Math.random() * 28), 3, 2);
      }
      g.fillStyle(0x9b7c52);
      for (let i = 0; i < 4; i++) {
        g.fillRect(Math.floor(Math.random() * 29), Math.floor(Math.random() * 29), 2, 2);
      }
    });

    this._genTex('tile_stone', TILE_SIZE, TILE_SIZE, (g) => {
      g.fillStyle(0x888888);
      g.fillRect(0, 0, 32, 32);
      g.fillStyle(0x777777);
      g.fillRect(0, 0, 15, 15);
      g.fillRect(16, 16, 16, 16);
      g.fillStyle(0x999999);
      g.fillRect(16, 0, 16, 15);
      g.fillRect(0, 16, 15, 16);
      g.lineStyle(1, 0x666666, 0.5);
      g.lineBetween(0, 15, 32, 15);
      g.lineBetween(15, 0, 15, 32);
    });

    this._genTex('tile_water', TILE_SIZE, TILE_SIZE, (g) => {
      g.fillStyle(0x2266bb);
      g.fillRect(0, 0, 32, 32);
      g.fillStyle(0x3388dd);
      g.fillRect(2, 8, 12, 2);
      g.fillRect(18, 20, 10, 2);
      g.fillStyle(0x4499ee);
      g.fillRect(6, 4, 8, 1);
      g.fillRect(20, 14, 6, 1);
    });

    this._genTex('tile_wall', TILE_SIZE, TILE_SIZE, (g) => {
      g.fillStyle(0x555555);
      g.fillRect(0, 0, 32, 32);
      g.lineStyle(1, 0x444444, 0.8);
      g.lineBetween(0, 8, 32, 8);
      g.lineBetween(0, 16, 32, 16);
      g.lineBetween(0, 24, 32, 24);
      g.lineBetween(8, 0, 8, 8);
      g.lineBetween(24, 0, 24, 8);
      g.lineBetween(16, 8, 16, 16);
      g.lineBetween(8, 16, 8, 24);
      g.lineBetween(24, 16, 24, 24);
      g.lineBetween(16, 24, 16, 32);
      g.fillStyle(0x666666);
      g.fillRect(1, 1, 6, 6);
      g.fillRect(9, 9, 6, 6);
    });

    this._genTex('tile_tree', TILE_SIZE, TILE_SIZE, (g) => {
      g.fillStyle(0x3a7d44);
      g.fillRect(0, 0, 32, 32);
      g.fillStyle(0x664422);
      g.fillRect(13, 18, 6, 14);
      g.fillStyle(0x225522);
      g.fillRect(6, 4, 20, 16);
      g.fillStyle(0x338833);
      g.fillRect(8, 6, 16, 12);
      g.fillStyle(0x44aa44);
      g.fillRect(10, 8, 6, 6);
    });
  }

  // ==========================================================================
  // Item Icons (16x16)
  // ==========================================================================

  _generateItemIcons() {
    this._genTex('icon_sword', ICON_SIZE, ICON_SIZE, (g) => {
      g.fillStyle(0xccccdd);
      g.fillRect(7, 1, 2, 9);
      g.fillStyle(0xddddee);
      g.fillRect(7, 0, 2, 2);
      g.fillStyle(0xcc9933);
      g.fillRect(5, 10, 6, 2);
      g.fillStyle(0x664422);
      g.fillRect(7, 12, 2, 3);
      g.fillStyle(0xcc9933);
      g.fillRect(7, 15, 2, 1);
    });

    this._genTex('icon_staff', ICON_SIZE, ICON_SIZE, (g) => {
      g.fillStyle(0x886644);
      g.fillRect(7, 2, 2, 13);
      g.fillStyle(0x4488ff);
      g.fillRect(6, 0, 4, 4);
      g.fillStyle(0x66aaff);
      g.fillRect(7, 1, 2, 2);
    });

    this._genTex('icon_armor', ICON_SIZE, ICON_SIZE, (g) => {
      g.fillStyle(0x888899);
      g.fillRect(4, 4, 8, 10);
      g.fillStyle(0x999aaa);
      g.fillRect(5, 3, 6, 2);
      g.fillStyle(0x777788);
      g.fillRect(2, 5, 3, 6);
      g.fillRect(11, 5, 3, 6);
    });

    this._genTex('icon_potion', ICON_SIZE, ICON_SIZE, (g) => {
      g.fillStyle(0xcc3333);
      g.fillRect(5, 6, 6, 8);
      g.fillStyle(0x886644);
      g.fillRect(6, 3, 4, 4);
      g.fillStyle(0xaa8855);
      g.fillRect(6, 2, 4, 2);
      g.fillStyle(0xff5555);
      g.fillRect(6, 8, 2, 4);
    });
  }

  // ==========================================================================
  // UI Elements
  // ==========================================================================

  _generateUIElements() {
    let g = this.add.graphics();
    g.fillStyle(0x2a2a4e);
    g.fillRect(0, 0, 120, 32);
    g.lineStyle(1, 0x4a4a6e);
    g.strokeRect(0, 0, 120, 32);
    g.generateTexture('ui_button', 120, 32);
    g.destroy();

    g = this.add.graphics();
    g.fillStyle(0x1a1a2e, 0.95);
    g.fillRect(0, 0, 300, 400);
    g.lineStyle(2, 0x4a4a6e);
    g.strokeRect(0, 0, 300, 400);
    g.fillStyle(0x2a2a4e, 1.0);
    g.fillRect(0, 0, 300, 30);
    g.generateTexture('ui_panel', 300, 400);
    g.destroy();

    g = this.add.graphics();
    g.fillStyle(0x440000, 0.8);
    g.fillRect(0, 0, 200, 16);
    g.lineStyle(1, 0x888888, 0.5);
    g.strokeRect(0, 0, 200, 16);
    g.generateTexture('ui_bar_frame', 200, 16);
    g.destroy();

    g = this.add.graphics();
    g.fillStyle(0xffffff);
    g.fillRect(0, 0, 1, 1);
    g.generateTexture('pixel', 1, 1);
    g.destroy();
  }

  // ==========================================================================
  // Impact Effects (96x96 - larger, more detailed)
  // ==========================================================================

  _generateImpactEffects() {
    const s = FX_SIZE;
    const cx = s / 2;
    const cy = s / 2;

    // --- Basic Attack Slash (검기) - large white diagonal slash ---
    this._genTex('fx_slash', s, s, (g) => {
      // Main diagonal slash line (top-right to bottom-left)
      // Outer glow
      g.lineStyle(12, 0xffffff, 0.15);
      g.lineBetween(cx + 38, cy - 38, cx - 38, cy + 38);
      // Mid glow
      g.lineStyle(8, 0xffffff, 0.3);
      g.lineBetween(cx + 36, cy - 36, cx - 36, cy + 36);
      // Bright core
      g.lineStyle(4, 0xffffff, 0.85);
      g.lineBetween(cx + 34, cy - 34, cx - 34, cy + 34);
      // Sharp center
      g.lineStyle(2, 0xffffff, 1.0);
      g.lineBetween(cx + 32, cy - 32, cx - 32, cy + 32);

      // Secondary thinner slash (slight offset for thickness feel)
      g.lineStyle(2, 0xddddff, 0.5);
      g.lineBetween(cx + 30, cy - 36, cx - 36, cy + 30);

      // Slash tip sparks
      g.fillStyle(0xffffff, 0.7);
      g.fillCircle(cx + 32, cy - 32, 4);
      g.fillCircle(cx - 32, cy + 32, 3);

      // Speed lines perpendicular to slash
      g.lineStyle(1, 0xffffff, 0.3);
      g.lineBetween(cx + 10, cy - 20, cx + 24, cy - 6);
      g.lineBetween(cx - 6, cy - 6, cx + 8, cy + 8);
      g.lineBetween(cx - 20, cy + 8, cx - 6, cy + 22);
    });

    // --- Heavy Slash (강공격) ---
    this._genTex('fx_heavy_slash', s, s, (g) => {
      // Large cross slash
      g.lineStyle(5, 0xffaa33, 0.9);
      g.lineBetween(cx - 30, cy - 30, cx + 30, cy + 30);
      g.lineBetween(cx + 30, cy - 30, cx - 30, cy + 30);
      // Outer glow
      g.lineStyle(8, 0xff8800, 0.3);
      g.lineBetween(cx - 30, cy - 30, cx + 30, cy + 30);
      g.lineBetween(cx + 30, cy - 30, cx - 30, cy + 30);
      // Center burst
      g.fillStyle(0xffcc00, 0.6);
      g.fillCircle(cx, cy, 8);
      g.fillStyle(0xffffff, 0.8);
      g.fillCircle(cx, cy, 3);
    });

    // --- Fist Impact (주먹/철권) ---
    this._genTex('fx_fist', s, s, (g) => {
      // Shockwave ring
      g.lineStyle(3, 0xffcc44, 0.8);
      g.strokeCircle(cx, cy, 20);
      g.lineStyle(2, 0xff8833, 0.5);
      g.strokeCircle(cx, cy, 28);
      // Impact rays
      const rays = 8;
      for (let i = 0; i < rays; i++) {
        const angle = (i / rays) * Math.PI * 2;
        const innerR = 12;
        const outerR = 32;
        g.lineStyle(2, 0xffaa00, 0.6);
        g.lineBetween(
          cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR,
          cx + Math.cos(angle) * outerR, cy + Math.sin(angle) * outerR
        );
      }
      // Center
      g.fillStyle(0xffffff, 0.9);
      g.fillCircle(cx, cy, 6);
    });

    // --- Qi Wave (기파) ---
    this._genTex('fx_qi_wave', s, s, (g) => {
      // Blue energy rings
      g.lineStyle(3, 0x4488ff, 0.7);
      g.strokeCircle(cx, cy, 15);
      g.lineStyle(2, 0x66aaff, 0.5);
      g.strokeCircle(cx, cy, 25);
      g.lineStyle(1, 0x88ccff, 0.3);
      g.strokeCircle(cx, cy, 35);
      // Core glow
      g.fillStyle(0x4488ff, 0.6);
      g.fillCircle(cx, cy, 10);
      g.fillStyle(0xaaddff, 0.8);
      g.fillCircle(cx, cy, 4);
      // Qi particles
      g.fillStyle(0x88ccff, 0.5);
      g.fillCircle(cx - 18, cy - 12, 3);
      g.fillCircle(cx + 20, cy - 8, 2);
      g.fillCircle(cx - 10, cy + 18, 3);
      g.fillCircle(cx + 15, cy + 14, 2);
    });

    // --- Fire Burst (화염) ---
    this._genTex('fx_fire', s, s, (g) => {
      // Outer flames
      g.fillStyle(0xff4400, 0.5);
      g.fillCircle(cx, cy, 32);
      // Mid flames
      g.fillStyle(0xff6600, 0.6);
      g.fillCircle(cx, cy, 22);
      // Flame tips
      g.fillStyle(0xff8800, 0.7);
      g.fillRect(cx - 4, cy - 36, 8, 14);
      g.fillRect(cx - 24, cy - 8, 10, 6);
      g.fillRect(cx + 16, cy - 12, 10, 8);
      g.fillRect(cx - 8, cy + 18, 12, 10);
      // Inner glow
      g.fillStyle(0xffcc00, 0.8);
      g.fillCircle(cx, cy, 12);
      // White core
      g.fillStyle(0xffffaa, 0.9);
      g.fillCircle(cx, cy, 5);
    });

    // --- Ice Crystal (빙결) ---
    this._genTex('fx_ice', s, s, (g) => {
      // Ice shards
      g.fillStyle(0x88ccff, 0.7);
      // Cross pattern
      g.fillRect(cx - 2, cy - 30, 4, 60);
      g.fillRect(cx - 30, cy - 2, 60, 4);
      // Diagonal
      g.fillStyle(0x66aaff, 0.5);
      g.fillRect(cx - 2, cy - 2, 4, 4); // center
      const drawShard = (angle, len) => {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        for (let i = 0; i < len; i += 2) {
          g.fillRect(cx + cos * i - 1, cy + sin * i - 1, 3, 3);
        }
      };
      drawShard(Math.PI / 4, 28);
      drawShard(-Math.PI / 4, 28);
      drawShard(3 * Math.PI / 4, 28);
      drawShard(-3 * Math.PI / 4, 28);
      // Snowflake center
      g.fillStyle(0xaaddff, 0.9);
      g.fillCircle(cx, cy, 6);
      g.fillStyle(0xffffff, 0.8);
      g.fillCircle(cx, cy, 3);
    });

    // --- Lightning (번개) ---
    this._genTex('fx_lightning', s, s, (g) => {
      // Lightning bolt
      g.lineStyle(3, 0xffff44, 0.9);
      g.beginPath();
      g.moveTo(cx, cy - 38);
      g.lineTo(cx - 8, cy - 12);
      g.lineTo(cx + 4, cy - 10);
      g.lineTo(cx - 6, cy + 16);
      g.lineTo(cx + 2, cy + 14);
      g.lineTo(cx - 4, cy + 38);
      g.strokePath();
      // Glow
      g.lineStyle(8, 0xffff00, 0.2);
      g.beginPath();
      g.moveTo(cx, cy - 38);
      g.lineTo(cx - 8, cy - 12);
      g.lineTo(cx + 4, cy - 10);
      g.lineTo(cx - 6, cy + 16);
      g.strokePath();
      // Sparks
      g.fillStyle(0xffff88, 0.7);
      g.fillCircle(cx - 10, cy - 18, 3);
      g.fillCircle(cx + 12, cy + 6, 2);
      g.fillCircle(cx - 8, cy + 24, 3);
      g.fillCircle(cx + 6, cy - 6, 2);
    });

    // --- Dark / Poison Cloud (독/암) ---
    this._genTex('fx_dark', s, s, (g) => {
      g.fillStyle(0x662288, 0.4);
      g.fillCircle(cx, cy, 30);
      g.fillStyle(0x882288, 0.5);
      g.fillCircle(cx - 10, cy - 6, 16);
      g.fillCircle(cx + 12, cy + 4, 14);
      g.fillCircle(cx - 4, cy + 10, 12);
      g.fillStyle(0xaa44cc, 0.6);
      g.fillCircle(cx, cy, 8);
      g.fillStyle(0xcc66ff, 0.4);
      g.fillCircle(cx, cy, 4);
    });

    // --- Heal / Buff (회복/버프) ---
    this._genTex('fx_heal', s, s, (g) => {
      // Rising sparkles
      g.fillStyle(0x44ff88, 0.7);
      g.fillCircle(cx - 14, cy + 10, 4);
      g.fillCircle(cx + 10, cy + 4, 3);
      g.fillCircle(cx, cy - 6, 5);
      g.fillCircle(cx - 8, cy - 16, 3);
      g.fillCircle(cx + 16, cy - 12, 4);
      g.fillCircle(cx + 4, cy + 16, 3);
      // Cross symbol
      g.fillStyle(0x88ffaa, 0.6);
      g.fillRect(cx - 2, cy - 14, 4, 28);
      g.fillRect(cx - 14, cy - 2, 28, 4);
      // Core glow
      g.fillStyle(0xaaffcc, 0.5);
      g.fillCircle(cx, cy, 8);
    });

    // --- Generic skill effect colors (backwards compat) ---
    const colorEffects = [
      { key: 'skill_effect_red', color: 0xff4444 },
      { key: 'skill_effect_blue', color: 0x4488ff },
      { key: 'skill_effect_green', color: 0x44ff44 },
      { key: 'skill_effect_yellow', color: 0xffcc00 },
      { key: 'skill_effect_purple', color: 0xaa44ff },
    ];
    for (const { key, color } of colorEffects) {
      this._genTex(key, 64, 64, (g) => {
        g.fillStyle(color, 0.3);
        g.fillCircle(32, 32, 28);
        g.fillStyle(color, 0.6);
        g.fillCircle(32, 32, 18);
        g.fillStyle(0xffffff, 0.8);
        g.fillCircle(32, 32, 7);
      });
    }
  }

  // ==========================================================================
  // Item Pickup
  // ==========================================================================

  _generateItemPickup() {
    this._genTex('item_pickup', 16, 16, (g) => {
      g.fillStyle(0xccaa44, 0.9);
      g.fillRect(4, 4, 8, 8);
      g.fillStyle(0xeedd66, 0.7);
      g.fillRect(5, 5, 6, 6);
      g.lineStyle(1, 0xffeeaa, 0.5);
      g.strokeRect(3, 3, 10, 10);
    });
  }

  // ==========================================================================
  // Utility
  // ==========================================================================

  // ==========================================================================
  // NPC Sprites (64x64)
  // ==========================================================================

  _generateNPCSprites() {
    const s = CHAR_SIZE;

    // --- Village Elder (촌장 어른) - white beard, dark green/gold robes, walking stick ---
    this._genTex('npc_elder', s, s, (g) => {
      // Shadow
      g.fillStyle(0x000000, 0.25);
      g.fillEllipse(s / 2, s - 4, 28, 8);
      // Shoes
      g.fillStyle(0x3d2b1f);
      g.fillRect(20, 54, 10, 6);
      g.fillRect(34, 54, 10, 6);
      // Legs (dark)
      g.fillStyle(0x2a3a2a);
      g.fillRect(22, 42, 8, 13);
      g.fillRect(34, 42, 8, 13);
      // Body (dark green robe)
      g.fillStyle(0x1a4a2a);
      g.fillRect(18, 20, 28, 24);
      // Gold trim on robe
      g.fillStyle(0xccaa33);
      g.fillRect(18, 20, 28, 2);
      g.fillRect(18, 42, 28, 2);
      g.fillRect(30, 20, 2, 24);
      // Robe overlap
      g.fillStyle(0x225533);
      g.fillRect(20, 22, 10, 18);
      // Sash (gold)
      g.fillStyle(0xddbb44);
      g.fillRect(18, 38, 28, 3);
      // Arms
      g.fillStyle(0x1a4a2a);
      g.fillRect(12, 24, 6, 14);
      g.fillRect(46, 24, 6, 14);
      // Hands
      g.fillStyle(0xe8c098);
      g.fillRect(12, 38, 6, 4);
      g.fillRect(46, 38, 6, 4);
      // Walking stick (right hand)
      g.fillStyle(0x8B6914);
      g.fillRect(52, 12, 3, 48);
      g.fillStyle(0xA07828);
      g.fillRect(53, 12, 1, 48);
      // Stick top ornament
      g.fillStyle(0xccaa33);
      g.fillRect(50, 10, 7, 4);
      // Neck
      g.fillStyle(0xe8c098);
      g.fillRect(28, 16, 8, 5);
      // Head
      g.fillStyle(0xf0c8a0);
      g.fillRect(24, 4, 16, 14);
      // White hair
      g.fillStyle(0xdddddd);
      g.fillRect(22, 2, 20, 6);
      g.fillRect(24, 0, 16, 4);
      // Hair bun
      g.fillStyle(0xcccccc);
      g.fillRect(29, -1, 6, 4);
      // Sideburns (white)
      g.fillStyle(0xdddddd);
      g.fillRect(22, 6, 3, 8);
      g.fillRect(39, 6, 3, 8);
      // White beard
      g.fillStyle(0xeeeeee);
      g.fillRect(26, 16, 12, 8);
      g.fillRect(28, 24, 8, 4);
      g.fillRect(30, 28, 4, 2);
      g.fillStyle(0xdddddd);
      g.fillRect(27, 17, 10, 6);
      // Eyes (wise, narrow)
      g.fillStyle(0x222222);
      g.fillRect(27, 10, 4, 2);
      g.fillRect(35, 10, 4, 2);
      // Eyebrows (white, thick)
      g.fillStyle(0xdddddd);
      g.fillRect(26, 8, 6, 2);
      g.fillRect(34, 8, 6, 2);
    });

    // --- Blacksmith (대장장이) - muscular, leather apron, hammer, headband ---
    this._genTex('npc_blacksmith', s, s, (g) => {
      // Shadow
      g.fillStyle(0x000000, 0.25);
      g.fillEllipse(s / 2, s - 4, 30, 8);
      // Shoes (heavy boots)
      g.fillStyle(0x332211);
      g.fillRect(18, 54, 12, 6);
      g.fillRect(34, 54, 12, 6);
      // Legs (thick)
      g.fillStyle(0x3a3a3a);
      g.fillRect(20, 40, 10, 15);
      g.fillRect(34, 40, 10, 15);
      // Body (broad, bare chest visible)
      g.fillStyle(0xd0a878);
      g.fillRect(16, 20, 32, 22);
      // Leather apron (brown)
      g.fillStyle(0x6B4226);
      g.fillRect(20, 24, 24, 20);
      g.fillStyle(0x7B5236);
      g.fillRect(22, 26, 20, 16);
      // Apron strap
      g.fillStyle(0x5B3216);
      g.fillRect(26, 18, 4, 8);
      g.fillRect(34, 18, 4, 8);
      // Belt
      g.fillStyle(0x443322);
      g.fillRect(18, 40, 28, 3);
      // Arms (muscular, bare)
      g.fillStyle(0xd0a878);
      g.fillRect(10, 22, 8, 16);
      g.fillRect(46, 22, 8, 16);
      // Bicep detail
      g.fillStyle(0xc09868);
      g.fillRect(11, 24, 6, 4);
      g.fillRect(47, 24, 6, 4);
      // Hands
      g.fillStyle(0xc09868);
      g.fillRect(10, 38, 8, 5);
      g.fillRect(46, 38, 8, 5);
      // Hammer (left hand)
      g.fillStyle(0x775533);
      g.fillRect(6, 28, 3, 22);
      // Hammer head
      g.fillStyle(0x888899);
      g.fillRect(2, 24, 10, 6);
      g.fillStyle(0x999aaa);
      g.fillRect(3, 25, 8, 4);
      // Neck
      g.fillStyle(0xd0a878);
      g.fillRect(28, 16, 8, 5);
      // Head
      g.fillStyle(0xd0a878);
      g.fillRect(24, 4, 16, 14);
      // Headband (red)
      g.fillStyle(0xcc3333);
      g.fillRect(22, 4, 20, 4);
      g.fillStyle(0xdd4444);
      g.fillRect(23, 5, 18, 2);
      // Headband tail
      g.fillStyle(0xcc3333);
      g.fillRect(42, 5, 5, 3);
      // Hair (short, dark)
      g.fillStyle(0x222222);
      g.fillRect(24, 2, 16, 4);
      // Stubble / jaw
      g.fillStyle(0xb09060);
      g.fillRect(24, 14, 16, 4);
      // Eyes (determined)
      g.fillStyle(0x111111);
      g.fillRect(27, 9, 3, 3);
      g.fillRect(34, 9, 3, 3);
      g.fillStyle(0xffffff);
      g.fillRect(28, 9, 1, 1);
      g.fillRect(35, 9, 1, 1);
      // Thick eyebrows
      g.fillStyle(0x222222);
      g.fillRect(26, 7, 5, 2);
      g.fillRect(33, 7, 5, 2);
      // Mouth
      g.fillStyle(0x995544);
      g.fillRect(30, 15, 4, 1);
    });

    // --- Merchant (상인) - purple/red robes, bag, hat ---
    this._genTex('npc_merchant', s, s, (g) => {
      // Shadow
      g.fillStyle(0x000000, 0.25);
      g.fillEllipse(s / 2, s - 4, 28, 8);
      // Shoes
      g.fillStyle(0x443322);
      g.fillRect(20, 54, 10, 6);
      g.fillRect(34, 54, 10, 6);
      // Legs
      g.fillStyle(0x553344);
      g.fillRect(22, 42, 8, 13);
      g.fillRect(34, 42, 8, 13);
      // Body (purple/red robes)
      g.fillStyle(0x662244);
      g.fillRect(18, 20, 28, 24);
      g.fillStyle(0x883366);
      g.fillRect(20, 22, 24, 20);
      // Robe details - gold buttons
      g.fillStyle(0xddbb44);
      g.fillRect(31, 24, 2, 2);
      g.fillRect(31, 29, 2, 2);
      g.fillRect(31, 34, 2, 2);
      // Sash
      g.fillStyle(0xcc6633);
      g.fillRect(18, 38, 28, 3);
      // Arms
      g.fillStyle(0x662244);
      g.fillRect(12, 24, 6, 14);
      g.fillRect(46, 24, 6, 14);
      // Hands
      g.fillStyle(0xf0c8a0);
      g.fillRect(12, 38, 6, 4);
      g.fillRect(46, 38, 6, 4);
      // Bag (on back / right side)
      g.fillStyle(0x886644);
      g.fillRect(48, 28, 12, 14);
      g.fillStyle(0x997755);
      g.fillRect(50, 30, 8, 10);
      // Bag strap
      g.fillStyle(0x665533);
      g.fillRect(46, 22, 3, 8);
      // Neck
      g.fillStyle(0xf0c8a0);
      g.fillRect(28, 16, 8, 5);
      // Head
      g.fillStyle(0xf0c8a0);
      g.fillRect(24, 4, 16, 14);
      // Hat (wide merchant hat)
      g.fillStyle(0x663344);
      g.fillRect(18, 2, 28, 6);
      g.fillRect(22, 0, 20, 3);
      // Hat brim
      g.fillStyle(0x552233);
      g.fillRect(16, 6, 32, 2);
      // Eyes (shrewd)
      g.fillStyle(0x222222);
      g.fillRect(27, 10, 3, 2);
      g.fillRect(34, 10, 3, 2);
      g.fillStyle(0xffffff);
      g.fillRect(28, 10, 1, 1);
      g.fillRect(35, 10, 1, 1);
      // Mustache
      g.fillStyle(0x222222);
      g.fillRect(27, 14, 10, 2);
      g.fillRect(26, 14, 2, 1);
      g.fillRect(36, 14, 2, 1);
      // Smile
      g.fillStyle(0xcc8877);
      g.fillRect(30, 16, 4, 1);
    });

    // --- Guard (경비병) - light armor, spear, helmet ---
    this._genTex('npc_guard', s, s, (g) => {
      // Shadow
      g.fillStyle(0x000000, 0.25);
      g.fillEllipse(s / 2, s - 4, 28, 8);
      // Shoes (armored boots)
      g.fillStyle(0x555566);
      g.fillRect(20, 54, 10, 6);
      g.fillRect(34, 54, 10, 6);
      // Legs (leg guards)
      g.fillStyle(0x666677);
      g.fillRect(22, 40, 8, 15);
      g.fillRect(34, 40, 8, 15);
      // Shin guards
      g.fillStyle(0x777788);
      g.fillRect(22, 46, 8, 6);
      g.fillRect(34, 46, 8, 6);
      // Body (light armor / chainmail)
      g.fillStyle(0x888899);
      g.fillRect(18, 20, 28, 22);
      g.fillStyle(0x999aaa);
      g.fillRect(20, 22, 24, 18);
      // Armor plate detail
      g.fillStyle(0xaaaabb);
      g.fillRect(22, 24, 8, 14);
      g.fillRect(34, 24, 8, 14);
      // Belt
      g.fillStyle(0x664422);
      g.fillRect(18, 40, 28, 3);
      g.fillStyle(0xccaa33);
      g.fillRect(30, 39, 4, 5);
      // Shoulder plates
      g.fillStyle(0x777788);
      g.fillRect(12, 20, 8, 8);
      g.fillRect(44, 20, 8, 8);
      // Arms
      g.fillStyle(0x888899);
      g.fillRect(12, 28, 6, 10);
      g.fillRect(46, 28, 6, 10);
      // Hands (gauntlets)
      g.fillStyle(0x777788);
      g.fillRect(12, 38, 6, 4);
      g.fillRect(46, 38, 6, 4);
      // Spear (right hand)
      g.fillStyle(0x886644);
      g.fillRect(52, 6, 2, 50);
      // Spear head
      g.fillStyle(0xccccdd);
      g.fillRect(50, 0, 6, 8);
      g.fillRect(51, -2, 4, 3);
      // Red tassel on spear
      g.fillStyle(0xcc3333);
      g.fillRect(49, 8, 3, 5);
      g.fillRect(54, 8, 3, 5);
      // Neck
      g.fillStyle(0xf0c8a0);
      g.fillRect(28, 16, 8, 5);
      // Head
      g.fillStyle(0xf0c8a0);
      g.fillRect(24, 6, 16, 12);
      // Helmet
      g.fillStyle(0x777788);
      g.fillRect(22, 2, 20, 8);
      g.fillRect(20, 4, 24, 4);
      // Helmet visor
      g.fillStyle(0x666677);
      g.fillRect(22, 8, 20, 2);
      // Helmet crest
      g.fillStyle(0xcc3333);
      g.fillRect(30, 0, 4, 4);
      // Eyes (alert)
      g.fillStyle(0x222222);
      g.fillRect(27, 10, 3, 3);
      g.fillRect(34, 10, 3, 3);
      g.fillStyle(0xffffff);
      g.fillRect(28, 10, 1, 1);
      g.fillRect(35, 10, 1, 1);
      // Mouth
      g.fillStyle(0xcc8877);
      g.fillRect(30, 15, 4, 1);
    });

    // --- Herbalist (약초꾼) - green robes, herbs, hair in bun ---
    this._genTex('npc_herbalist', s, s, (g) => {
      // Shadow
      g.fillStyle(0x000000, 0.25);
      g.fillEllipse(s / 2, s - 4, 26, 8);
      // Shoes (cloth)
      g.fillStyle(0x554433);
      g.fillRect(22, 54, 8, 6);
      g.fillRect(34, 54, 8, 6);
      // Legs / skirt
      g.fillStyle(0x337744);
      g.fillRect(20, 40, 24, 15);
      g.fillStyle(0x448855);
      g.fillRect(22, 42, 20, 11);
      // Body (green robes, more elegant)
      g.fillStyle(0x337744);
      g.fillRect(20, 20, 24, 22);
      g.fillStyle(0x448855);
      g.fillRect(22, 22, 20, 18);
      // Floral pattern on robe
      g.fillStyle(0x66aa77);
      g.fillRect(26, 28, 3, 3);
      g.fillRect(35, 32, 3, 3);
      // Sash (light green)
      g.fillStyle(0x88cc88);
      g.fillRect(20, 38, 24, 3);
      // Arms (slender)
      g.fillStyle(0x337744);
      g.fillRect(14, 24, 6, 12);
      g.fillRect(44, 24, 6, 12);
      // Hands
      g.fillStyle(0xf0c8a0);
      g.fillRect(14, 36, 6, 4);
      g.fillRect(44, 36, 6, 4);
      // Herb bundle (left hand)
      g.fillStyle(0x44aa44);
      g.fillRect(8, 30, 8, 10);
      g.fillStyle(0x66cc66);
      g.fillRect(9, 31, 6, 3);
      g.fillRect(10, 37, 4, 3);
      // Small flowers
      g.fillStyle(0xffaa88);
      g.fillRect(9, 31, 2, 2);
      g.fillStyle(0xffff88);
      g.fillRect(13, 33, 2, 2);
      g.fillStyle(0xaa88ff);
      g.fillRect(11, 37, 2, 2);
      // Neck
      g.fillStyle(0xf5d0a8);
      g.fillRect(28, 16, 8, 5);
      // Head (slightly rounder, feminine)
      g.fillStyle(0xf5d0a8);
      g.fillRect(24, 4, 16, 14);
      // Hair (dark, in bun)
      g.fillStyle(0x1a1a2a);
      g.fillRect(22, 2, 20, 6);
      g.fillRect(24, 0, 16, 4);
      // Hair bun (top)
      g.fillStyle(0x222233);
      g.fillRect(28, -2, 8, 5);
      g.fillRect(30, -3, 4, 3);
      // Hair pin (jade)
      g.fillStyle(0x44cc88);
      g.fillRect(27, 0, 10, 1);
      g.fillStyle(0x55ddaa);
      g.fillRect(36, -1, 3, 3);
      // Side hair
      g.fillStyle(0x1a1a2a);
      g.fillRect(22, 6, 3, 10);
      g.fillRect(39, 6, 3, 10);
      // Eyes (gentle)
      g.fillStyle(0x332222);
      g.fillRect(27, 10, 3, 2);
      g.fillRect(34, 10, 3, 2);
      g.fillStyle(0xffffff);
      g.fillRect(28, 10, 1, 1);
      g.fillRect(35, 10, 1, 1);
      // Eyelashes
      g.fillStyle(0x222222);
      g.fillRect(27, 9, 4, 1);
      g.fillRect(34, 9, 4, 1);
      // Gentle smile
      g.fillStyle(0xcc8877);
      g.fillRect(30, 15, 4, 1);
      g.fillStyle(0xdd9988);
      g.fillRect(31, 14, 2, 1);
    });
  }

  // ==========================================================================
  // Portal Texture (32x32)
  // ==========================================================================

  _generatePortalTexture() {
    this._genTex('portal', TILE_SIZE, TILE_SIZE, (g) => {
      const cx = TILE_SIZE / 2;
      const cy = TILE_SIZE / 2;

      // Outer glow ring
      g.lineStyle(3, 0x2244aa, 0.3);
      g.strokeCircle(cx, cy, 14);

      // Mid ring
      g.lineStyle(2, 0x4488ff, 0.5);
      g.strokeCircle(cx, cy, 11);

      // Inner ring
      g.lineStyle(2, 0x88ccff, 0.7);
      g.strokeCircle(cx, cy, 8);

      // Core glow
      g.fillStyle(0xaaddff, 0.5);
      g.fillCircle(cx, cy, 6);

      // Bright center
      g.fillStyle(0xeeffff, 0.7);
      g.fillCircle(cx, cy, 3);

      // Sparkle particles
      g.fillStyle(0xffffff, 0.8);
      g.fillRect(cx - 1, cy - 12, 2, 2);
      g.fillRect(cx + 10, cy - 4, 2, 2);
      g.fillRect(cx - 10, cy + 3, 2, 2);
      g.fillRect(cx + 3, cy + 11, 2, 2);
      g.fillRect(cx - 6, cy - 9, 1, 1);
      g.fillRect(cx + 8, cy + 7, 1, 1);
    });
  }

  // ==========================================================================
  // Utility
  // ==========================================================================

  _genTex(key, w, h, drawFn) {
    const g = this.add.graphics();
    drawFn(g);
    g.generateTexture(key, w, h);
    g.destroy();
  }
}
