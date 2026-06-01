class HUD {
  constructor(scene) {
    this.scene = scene;
    const W    = C.WIDTH;

    // Background panel (top)
    scene.add.rectangle(0, 0, W, 62, 0x000000, 0.55).setOrigin(0).setDepth(C.DEPTH_HUD);

    // HP bar
    const hpLabel = scene.add.text(8, 8, 'HP', { fontSize: '11px', color: '#ffaacc' }).setDepth(C.DEPTH_HUD);
    scene.add.rectangle(30, 14, 160, 12, 0x330011).setOrigin(0, 0.5).setDepth(C.DEPTH_HUD);
    this._hpBar = scene.add.rectangle(30, 14, 160, 12, 0xff2266).setOrigin(0, 0.5).setDepth(C.DEPTH_HUD);

    // XP bar
    const xpLabel = scene.add.text(8, 26, 'XP', { fontSize: '11px', color: '#aaddff' }).setDepth(C.DEPTH_HUD);
    scene.add.rectangle(30, 33, 160, 8, 0x001133).setOrigin(0, 0.5).setDepth(C.DEPTH_HUD);
    this._xpBar = scene.add.rectangle(30, 33, 0, 8, 0x44aaff).setOrigin(0, 0.5).setDepth(C.DEPTH_HUD);

    // Level / tier text
    this._lvlTxt = scene.add.text(8, 42, 'LV 1  赤ちゃん', {
      fontSize: '12px', color: '#ffdd88', fontStyle: 'bold'
    }).setDepth(C.DEPTH_HUD);

    // Score
    this._scoreTxt = scene.add.text(W - 8, 10, '0', {
      fontSize: '20px', color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(1, 0).setDepth(C.DEPTH_HUD);

    // Boss HP bar (hidden by default)
    this._bossBg  = scene.add.rectangle(W / 2, C.HEIGHT - 36, W * 0.82, 18, 0x330000).setOrigin(0.5).setDepth(C.DEPTH_HUD).setVisible(false);
    this._bossBar = scene.add.rectangle(W / 2 - W * 0.41, C.HEIGHT - 36, W * 0.82, 18, 0xff2200).setOrigin(0, 0.5).setDepth(C.DEPTH_HUD).setVisible(false);
    this._bossTxt = scene.add.text(W / 2, C.HEIGHT - 52, 'BOSS', {
      fontSize: '14px', color: '#ff8888', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(C.DEPTH_HUD).setVisible(false);
    this._bossRef = null;
    this._bossMaxW = W * 0.82;
    this._bossBarOriginX = W / 2 - W * 0.41;

    // Level-up popup
    this._lvlUpTxt = scene.add.text(W / 2, C.HEIGHT / 2, '', {
      fontSize: '30px', color: '#ffff44', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5).setDepth(C.DEPTH_HUD).setAlpha(0);
  }

  update(player) {
    const hpRatio = Phaser.Math.Clamp(player.hp / player.maxHp, 0, 1);
    this._hpBar.width = 160 * hpRatio;

    const t   = C.XP_THRESHOLDS;
    const lv  = player.level;
    const idx = Math.min(lv - 1, t.length - 2);
    const cur = player.xp - t[idx];
    const nxt = t[idx + 1] - t[idx];
    const xpRatio = lv >= t.length - 1 ? 1 : Phaser.Math.Clamp(cur / nxt, 0, 1);
    this._xpBar.width = 160 * xpRatio;

    if (this._bossRef && this._bossRef.sprite.active) {
      const bRatio = Phaser.Math.Clamp(this._bossRef.hp / this._bossRef.maxHp, 0, 1);
      this._bossBar.width = this._bossMaxW * bRatio;
    }
  }

  updateScore(score) {
    this._scoreTxt.setText(score.toLocaleString());
  }

  onLevelUp(level, tierName) {
    this._lvlTxt.setText(`LV ${level}  ${tierName}`);
    this._lvlUpTxt.setText(`LEVEL ${level}!`);
    this._lvlUpTxt.setAlpha(1).setY(C.HEIGHT / 2);
    this.scene.tweens.add({
      targets: this._lvlUpTxt,
      alpha:   { from: 1, to: 0 },
      y:       { from: C.HEIGHT / 2, to: C.HEIGHT / 2 - 90 },
      duration: 1600,
      ease:    'Power2'
    });
  }

  showBossBar(bossRef) {
    this._bossRef = bossRef;
    this._bossBg.setVisible(true);
    this._bossBar.setVisible(true);
    this._bossTxt.setVisible(true);
  }

  hideBossBar() {
    this._bossRef = null;
    this._bossBg.setVisible(false);
    this._bossBar.setVisible(false);
    this._bossTxt.setVisible(false);
  }
}
