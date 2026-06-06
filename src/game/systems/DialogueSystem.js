// =============================================================================
// DialogueSystem.js - NPC dialogue display using Phaser graphics
// =============================================================================

export default class DialogueSystem {
  /**
   * @param {Phaser.Scene} scene - The UI scene (UIScene) where dialogue is rendered
   */
  constructor(scene) {
    this.scene = scene;

    /** @type {boolean} Whether dialogue is currently showing */
    this.isActive = false;

    /** @type {object|null} Current NPC being talked to */
    this.currentNPC = null;

    /** @type {string[]} Dialogue lines */
    this.lines = [];

    /** @type {number} Current line index */
    this.lineIndex = 0;

    /** @type {object[]} Choice buttons [{text, action}] */
    this.choices = [];

    /** @type {Phaser.GameObjects.Container} UI container */
    this.container = scene.add.container(0, 0);
    this.container.setDepth(3000);
    this.container.setVisible(false);

    // Listen for advance input
    this.scene.input.keyboard.on('keydown-SPACE', () => this._advance());
    this.scene.input.keyboard.on('keydown-F', () => this._advance());
  }

  // ===========================================================================
  // Public API
  // ===========================================================================

  /**
   * Show a dialogue sequence.
   * @param {object} npc - NPC instance (has nameKo, npcId, etc.)
   * @param {object} dialogueData - { lines: string[], choices?: [{text, action}] }
   */
  showDialogue(npc, dialogueData) {
    this.currentNPC = npc;
    this.lines = dialogueData.lines || [];
    this.choices = dialogueData.choices || [];
    this.lineIndex = 0;
    this.isActive = true;

    this._render();
  }

  /**
   * Close the dialogue and clean up.
   */
  closeDialogue() {
    this.isActive = false;
    this.currentNPC = null;
    this.lines = [];
    this.choices = [];
    this.lineIndex = 0;

    this.container.removeAll(true);
    this.container.setVisible(false);

    this.scene.events.emit('dialogue-closed');
  }

  // ===========================================================================
  // Rendering
  // ===========================================================================

  /** @private Render the current dialogue state */
  _render() {
    this.container.removeAll(true);
    this.container.setVisible(true);

    const { width, height } = this.scene.cameras.main;
    const panelW = Math.min(width - 40, 600);
    const panelH = 140;
    const panelX = (width - panelW) / 2;
    const panelY = height - panelH - 20;

    // --- Dark panel background ---
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x111122, 0.92);
    bg.fillRect(panelX, panelY, panelW, panelH);
    // Header bar
    bg.fillStyle(0x222244, 1.0);
    bg.fillRect(panelX, panelY, panelW, 26);
    // Border
    bg.lineStyle(2, 0x4a4a8e);
    bg.strokeRect(panelX, panelY, panelW, panelH);
    this.container.add(bg);

    // --- NPC Name ---
    const npcName = this.currentNPC ? (this.currentNPC.nameKo || this.currentNPC.npcName || 'NPC') : 'NPC';
    const nameText = this.scene.add.text(panelX + 14, panelY + 13, npcName, {
      fontSize: '13px',
      fontFamily: 'monospace',
      color: '#ffcc66',
      stroke: '#000000',
      strokeThickness: 1,
    }).setOrigin(0, 0.5);
    this.container.add(nameText);

    // --- Close hint ---
    const closeHint = this.scene.add.text(panelX + panelW - 14, panelY + 13, '[ESC] 닫기', {
      fontSize: '9px',
      fontFamily: 'monospace',
      color: '#888899',
    }).setOrigin(1, 0.5);
    this.container.add(closeHint);

    // Determine what to show: dialogue text or choices
    if (this.lineIndex < this.lines.length) {
      this._renderDialogueLine(panelX, panelY, panelW, panelH);
    } else if (this.choices.length > 0) {
      this._renderChoices(panelX, panelY, panelW, panelH);
    } else {
      // No more lines, no choices => auto-close
      this.closeDialogue();
    }
  }

  /** @private Render a single dialogue line with advance prompt */
  _renderDialogueLine(panelX, panelY, panelW, panelH) {
    const line = this.lines[this.lineIndex];

    const dialogueText = this.scene.add.text(panelX + 18, panelY + 38, line, {
      fontSize: '13px',
      fontFamily: 'monospace',
      color: '#ddddee',
      wordWrap: { width: panelW - 36 },
      lineSpacing: 4,
    });
    this.container.add(dialogueText);

    // Advance prompt
    const remaining = this.lines.length - this.lineIndex - 1;
    const promptText = remaining > 0
      ? `[Space / F] 계속 (${this.lineIndex + 1}/${this.lines.length})`
      : (this.choices.length > 0 ? '[Space / F] 계속' : '[Space / F] 닫기');

    const prompt = this.scene.add.text(panelX + panelW - 18, panelY + panelH - 14, promptText, {
      fontSize: '9px',
      fontFamily: 'monospace',
      color: '#888899',
    }).setOrigin(1, 1);
    this.container.add(prompt);

    // Blinking indicator
    this.scene.tweens.add({
      targets: prompt,
      alpha: 0.3,
      duration: 600,
      yoyo: true,
      repeat: -1,
    });
  }

  /** @private Render choice buttons */
  _renderChoices(panelX, panelY, panelW, panelH) {
    const choiceStartY = panelY + 36;
    const btnH = 28;
    const btnGap = 6;

    this.choices.forEach((choice, i) => {
      const btnY = choiceStartY + i * (btnH + btnGap);
      const btnW = panelW - 60;
      const btnX = panelX + 30;

      // Button background
      const btnBg = this.scene.add.graphics();
      btnBg.fillStyle(0x2a2a5e, 0.9);
      btnBg.fillRect(btnX, btnY, btnW, btnH);
      btnBg.lineStyle(1, 0x5a5a9e);
      btnBg.strokeRect(btnX, btnY, btnW, btnH);
      this.container.add(btnBg);

      // Button text
      const btnText = this.scene.add.text(btnX + btnW / 2, btnY + btnH / 2, choice.text, {
        fontSize: '12px',
        fontFamily: 'monospace',
        color: '#ccccee',
      }).setOrigin(0.5);
      this.container.add(btnText);

      // Interactive zone
      const zone = this.scene.add.zone(btnX + btnW / 2, btnY + btnH / 2, btnW, btnH)
        .setInteractive();
      this.container.add(zone);

      zone.on('pointerover', () => {
        btnBg.clear();
        btnBg.fillStyle(0x3a3a7e, 0.9);
        btnBg.fillRect(btnX, btnY, btnW, btnH);
        btnBg.lineStyle(1, 0x7a7abe);
        btnBg.strokeRect(btnX, btnY, btnW, btnH);
        btnText.setColor('#ffffff');
      });

      zone.on('pointerout', () => {
        btnBg.clear();
        btnBg.fillStyle(0x2a2a5e, 0.9);
        btnBg.fillRect(btnX, btnY, btnW, btnH);
        btnBg.lineStyle(1, 0x5a5a9e);
        btnBg.strokeRect(btnX, btnY, btnW, btnH);
        btnText.setColor('#ccccee');
      });

      zone.on('pointerdown', () => {
        this._handleChoice(choice);
      });
    });
  }

  // ===========================================================================
  // Input Handling
  // ===========================================================================

  /** @private Advance to the next line or choices */
  _advance() {
    if (!this.isActive) return;

    if (this.lineIndex < this.lines.length) {
      this.lineIndex += 1;

      if (this.lineIndex >= this.lines.length && this.choices.length === 0) {
        // No choices after lines - close
        this.closeDialogue();
      } else {
        this._render();
      }
    }
    // If choices are showing, do nothing on space (player must click)
  }

  /** @private Handle a choice button click */
  _handleChoice(choice) {
    const action = choice.action;
    const npc = this.currentNPC;

    this.closeDialogue();

    if (action && this.scene) {
      this.scene.events.emit('dialogue-choice', {
        npc,
        action,
        data: choice.data || null,
      });
    }
  }
}
