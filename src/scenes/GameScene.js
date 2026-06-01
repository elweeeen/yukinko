class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }

  // ─── Setup ─────────────────────────────────────────────────────────────────

  create() {
    this._bg = this.add.tileSprite(0, 0, C.W, C.H, 'bg').setOrigin(0).setDepth(C.DEPTH_BG);

    // State
    this.hp     = C.PLAYER_HP;
    this.xp     = 0;
    this.level  = 1;
    this.score  = 0;
    this._iframes    = 0;
    this._fireTimer  = 0;
    this._spawnTimer = 0;
    this._spawnInterval = 1400;
    this._bossIndex  = 0;
    this._bossActive = false;
    this._lastLvForBoss = 1;

    // Object pools
    this.bullets     = [];
    this.enemies     = [];
    this.ebullets    = [];

    // Player
    this._touchX = C.W / 2;
    this._touchY = C.H - 110;
    this.player  = this.add.image(C.W / 2, C.H - 110, this._tierKey())
      .setDisplaySize(72, 72).setDepth(C.DEPTH_PLAYER);

    // Ensure HTML photo button is hidden during gameplay
    const btn = document.getElementById('photo-btn');
    if (btn) btn.style.display = 'none';

    this._setupInput();
    this._setupHUD();

    // Spawn first enemy quickly
    this._spawnTimer = 1200;
  }

  // ─── Tier helpers ──────────────────────────────────────────────────────────

  _tier()    { return C.TIERS[this.level >= 10 ? 2 : this.level >= 5 ? 1 : 0]; }
  _tierKey() { return this._tier().key; }

  // ─── Input ─────────────────────────────────────────────────────────────────

  _setupInput() {
    // Offset player 90px above finger so face is visible while touching
    const OFFSET = 90;
    this.input.on('pointerdown', p => { this._touchX = p.x; this._touchY = p.y - OFFSET; });
    this.input.on('pointermove', p => {
      if (!p.isDown) return;
      this._touchX = p.x;
      this._touchY = p.y - OFFSET;
    });
    this._cursors = this.input.keyboard.createCursorKeys();
    this._wasd    = this.input.keyboard.addKeys('W,A,S,D');
  }

  // ─── HUD ───────────────────────────────────────────────────────────────────

  _setupHUD() {
    const d = C.DEPTH_HUD;
    this.add.rectangle(0, 0, C.W, 58, 0x000000, 0.6).setOrigin(0).setDepth(d);

    // Hearts
    this._hearts = [];
    for (let i = 0; i < C.PLAYER_HP; i++) {
      this._hearts.push(
        this.add.text(10 + i * 28, 8, '❤️', { fontSize: '20px' }).setDepth(d)
      );
    }

    // XP bar
    this.add.rectangle(8, 36, 160, 10, 0x001133).setOrigin(0, 0).setDepth(d);
    this._xpBar = this.add.rectangle(8, 36, 0, 10, 0x44aaff).setOrigin(0, 0).setDepth(d);

    // Level label
    this._lvLabel = this.add.text(8, 48, 'LV1 ゆきんこベビー', {
      fontSize: '11px', color: '#ffdd88', fontStyle: 'bold'
    }).setDepth(d);

    // Score
    this._scoreTxt = this.add.text(C.W - 8, 8, '0', {
      fontSize: '20px', color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(1, 0).setDepth(d);

    // Level-up popup
    this._popup = this.add.text(C.W / 2, C.H / 2, '', {
      fontSize: '32px', color: '#ffff44', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 5
    }).setOrigin(0.5).setDepth(d).setAlpha(0);

    // Boss HP bar (hidden)
    this._bossBg  = this.add.rectangle(C.W/2, C.H - 40, C.W * 0.82, 18, 0x330000).setOrigin(0.5).setDepth(d).setVisible(false);
    this._bossBar = this.add.rectangle(C.W/2 - C.W * 0.41, C.H - 40, C.W * 0.82, 18, 0xff2200).setOrigin(0, 0.5).setDepth(d).setVisible(false);
    this._bossTxt = this.add.text(C.W/2, C.H - 58, 'BOSS', {
      fontSize: '14px', color: '#ff8888', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(d).setVisible(false);
    this._bossRef = null;
  }

  _updateHUD() {
    // Hearts
    for (let i = 0; i < this._hearts.length; i++) {
      this._hearts[i].setAlpha(i < this.hp ? 1 : 0.2);
    }
    // XP bar
    const t   = C.XP_THRESHOLDS;
    const idx = Math.min(this.level - 1, t.length - 2);
    const cur = this.xp - t[idx];
    const nxt = t[idx + 1] - t[idx];
    this._xpBar.width = 160 * Math.min(cur / nxt, 1);
    // Boss bar
    if (this._bossRef) {
      this._bossBar.width = C.W * 0.82 * Math.max(0, this._bossRef.hp / this._bossRef.maxHp);
    }
  }

  // ─── Update loop ───────────────────────────────────────────────────────────

  update(time, delta) {
    this._bg.tilePositionY -= 1.5;

    this._movePlayer(delta);
    this._doFire(delta);
    this._doSpawn(delta);
    this._moveObjects(delta);
    this._checkCollisions();
    this._updateHUD();
    this._cleanup();

    if (this.hp <= 0) {
      this.scene.start('GameOverScene', { score: this.score, level: this.level });
    }
  }

  // ─── Player movement ───────────────────────────────────────────────────────

  _movePlayer(delta) {
    const spd = C.PLAYER_SPEED * delta / 1000;
    let dx = 0, dy = 0;
    if (this._cursors.left.isDown  || this._wasd.A.isDown) dx -= spd;
    if (this._cursors.right.isDown || this._wasd.D.isDown) dx += spd;
    if (this._cursors.up.isDown    || this._wasd.W.isDown) dy -= spd;
    if (this._cursors.down.isDown  || this._wasd.S.isDown) dy += spd;

    if (dx !== 0 || dy !== 0) {
      // Keyboard takes over
      this.player.x = Phaser.Math.Clamp(this.player.x + dx, 30, C.W - 30);
      this.player.y = Phaser.Math.Clamp(this.player.y + dy, C.H * 0.3, C.H - 30);
      this._touchX  = this.player.x;
      this._touchY  = this.player.y;
    } else {
      // Smoothly follow touch/mouse
      this.player.x += (Phaser.Math.Clamp(this._touchX, 30, C.W - 30) - this.player.x) * 0.22;
      this.player.y += (Phaser.Math.Clamp(this._touchY, C.H * 0.3, C.H - 30) - this.player.y) * 0.22;
    }

    // Invincibility flash
    if (this._iframes > 0) {
      this._iframes -= delta;
      this.player.alpha = Math.floor(this._iframes / 80) % 2 === 0 ? 0.3 : 1;
    } else {
      this.player.alpha = 1;
    }
  }

  // ─── Firing ────────────────────────────────────────────────────────────────

  _doFire(delta) {
    this._fireTimer += delta;
    const tier = this._tier();
    if (this._fireTimer < tier.fireRate) return;
    this._fireTimer = 0;

    const offsets = tier.count === 3 ? [-20, 0, 20] : tier.count === 2 ? [-13, 13] : [0];
    offsets.forEach(ox => {
      const b = this.add.rectangle(
        this.player.x + ox, this.player.y - 28,
        7, 20, tier.color
      ).setDepth(C.DEPTH_BULLET);
      // Add glow for samurai
      if (tier.count === 3) b.setStrokeStyle(2, 0xffffff, 0.6);
      this.bullets.push({ img: b, vy: tier.bulletSpeed, dmg: tier.damage });
    });
  }

  // ─── Enemy spawning ────────────────────────────────────────────────────────

  _doSpawn(delta) {
    // Boss trigger
    const bossCheck = Math.floor(this.level / 5);
    if (bossCheck > Math.floor(this._lastLvForBoss / 5) && !this._bossActive) {
      this._lastLvForBoss = this.level;
      this._spawnBoss();
      return;
    }
    this._lastLvForBoss = this.level;

    if (this._bossActive) return;

    this._spawnTimer += delta;
    if (this._spawnTimer < this._spawnInterval) return;
    this._spawnTimer = 0;
    this._spawnInterval = Math.max(500, this._spawnInterval - 8);

    const x = Phaser.Math.Between(30, C.W - 30);
    const roll = Math.random();
    let cfg;

    // HP scaled to be killable in 3-6 baby bullets
    const lvScale = Math.floor(this.level / 3);
    if      (this.level >= 8 && roll < 0.25) cfg = { key: 'enemy-tank',  hp: 8 + lvScale * 3, xp: 40, score: 300, vy: 1.2, sz: 72, shoots: false };
    else if (this.level >= 4 && roll < 0.45) cfg = { key: 'enemy-fast',  hp: 2 + lvScale,     xp: 20, score: 150, vy: 3.2, sz: 56, weave: true, shoots: false };
    else                                      cfg = { key: 'enemy-basic', hp: 3 + lvScale,     xp: 15, score: 100, vy: 1.8, sz: 60, shoots: this.level >= 3 };

    const img = this.add.image(x, -40, cfg.key)
      .setDisplaySize(cfg.sz, cfg.sz).setDepth(C.DEPTH_ENEMY);
    this.enemies.push({
      img, hp: cfg.hp, maxHp: cfg.hp, xp: cfg.xp, score: cfg.score,
      vy: cfg.vy, weave: !!cfg.weave, shoots: !!cfg.shoots,
      originX: x, phase: Math.random() * Math.PI * 2,
      shootTimer: 3000,
    });
  }

  _spawnBoss() {
    // Clear all enemies
    this.enemies.forEach(e => e.img.destroy());
    this.enemies = [];

    this._bossActive = true;
    const hp = 500 + this._bossIndex * 350;
    const img = this.add.image(C.W / 2, -80, 'boss')
      .setDisplaySize(120, 120).setDepth(C.DEPTH_ENEMY);
    const boss = { img, hp, maxHp: hp, xp: 300, score: 2000, vy: 1.2, weave: false, shoots: true, originX: C.W/2, phase: 0, isBoss: true, entered: false, shootTimer: 2000, patrolDir: 1, patrolTimer: 0 };
    this.enemies.push(boss);
    this._bossRef = boss;
    this._bossBg.setVisible(true);
    this._bossBar.setVisible(true);
    this._bossTxt.setVisible(true);
    this._bossIndex++;
  }

  // ─── Move everything ───────────────────────────────────────────────────────

  _moveObjects(delta) {
    const t = this.time.now;

    // Player bullets
    this.bullets.forEach(b => { b.img.y -= b.vy; });

    // Enemies
    this.enemies.forEach(e => {
      if (e.isBoss) {
        if (!e.entered) {
          e.img.y += e.vy;
          if (e.img.y >= C.H * 0.22) { e.entered = true; e.img.y = C.H * 0.22; }
        } else {
          e.patrolTimer += delta;
          if (e.patrolTimer > 1400) { e.patrolDir *= -1; e.patrolTimer = 0; }
          e.img.x += e.patrolDir * 1.8;
          e.img.x = Phaser.Math.Clamp(e.img.x, 60, C.W - 60);
        }
      } else if (e.weave) {
        e.phase += delta * 0.003;
        e.img.x = Phaser.Math.Clamp(e.originX + Math.sin(e.phase) * 70, 20, C.W - 20);
        e.img.y += e.vy;
      } else {
        e.img.y += e.vy;
      }

      // Boss / level3+ enemies shoot back
      if (e.shoots) {
        e.shootTimer -= delta;
        if (e.shootTimer <= 0) {
          e.shootTimer = e.isBoss ? 1600 : 3500;
          const eb = this.add.image(e.img.x, e.img.y + 20, 'ebullet')
            .setDisplaySize(18, 26).setDepth(C.DEPTH_BULLET);
          this.ebullets.push({ img: eb, vy: e.isBoss ? 4.5 : 3 });
        }
      }
    });

    // Enemy bullets
    this.ebullets.forEach(b => { b.img.y += b.vy; });
  }

  // ─── Collision detection ───────────────────────────────────────────────────

  _hit(ax, ay, aw, ah, bx, by, bw, bh) {
    return Math.abs(ax - bx) < (aw + bw) / 2 && Math.abs(ay - by) < (ah + bh) / 2;
  }

  _checkCollisions() {
    // Player bullet vs enemy
    for (let bi = this.bullets.length - 1; bi >= 0; bi--) {
      const b = this.bullets[bi];
      if (!b.img.active) continue;
      for (let ei = this.enemies.length - 1; ei >= 0; ei--) {
        const e = this.enemies[ei];
        if (!e.img.active) continue;
        const sz = e.img.displayWidth;
        if (!this._hit(b.img.x, b.img.y, 14, 24, e.img.x, e.img.y, sz * 0.9, sz * 0.9)) continue;
        // Hit!
        b.img.destroy(); this.bullets.splice(bi, 1);
        e.hp -= b.dmg;
        this._flash(e.img);
        if (e.hp <= 0) this._killEnemy(e, ei);
        break;
      }
    }

    // Enemy bullet vs player
    for (let bi = this.ebullets.length - 1; bi >= 0; bi--) {
      const b = this.ebullets[bi];
      if (!b.img.active) continue;
      if (!this._hit(b.img.x, b.img.y, 16, 24, this.player.x, this.player.y, 52, 52)) continue;
      b.img.destroy(); this.ebullets.splice(bi, 1);
      this._hurtPlayer();
    }

    // Enemy body vs player
    for (let ei = this.enemies.length - 1; ei >= 0; ei--) {
      const e = this.enemies[ei];
      if (!e.img.active) continue;
      const sz = e.img.displayWidth;
      if (!this._hit(e.img.x, e.img.y, sz * 0.6, sz * 0.6, this.player.x, this.player.y, 50, 50)) continue;
      this._hurtPlayer();
      if (!e.isBoss) this._killEnemy(e, ei);
    }
  }

  _killEnemy(e, idx) {
    this._burst(e.img.x, e.img.y);
    e.img.destroy();
    this.enemies.splice(idx, 1);
    this._addXP(e.xp);
    this.score += e.score;
    this._scoreTxt.setText(this.score.toLocaleString());
    if (e.isBoss) {
      this._bossActive = false;
      this._bossRef = null;
      this._bossBg.setVisible(false);
      this._bossBar.setVisible(false);
      this._bossTxt.setVisible(false);
    }
  }

  _hurtPlayer() {
    if (this._iframes > 0) return;
    this.hp = Math.max(0, this.hp - 1);
    this._iframes = C.IFRAMES_MS;
    this.cameras.main.shake(200, 0.01);
  }

  // ─── XP / leveling ─────────────────────────────────────────────────────────

  _addXP(amount) {
    this.xp += amount;
    const t = C.XP_THRESHOLDS;
    while (this.level < t.length - 1 && this.xp >= t[this.level]) {
      this.level++;
      this._onLevelUp();
    }
  }

  _onLevelUp() {
    this.hp = Math.min(C.PLAYER_HP, this.hp + 1);  // Restore 1 heart
    this.player.setTexture(this._tierKey()).setDisplaySize(72, 72);
    const tier = this._tier();
    this._lvLabel.setText(`LV${this.level} ${tier.name}`);

    this._popup.setText(`LEVEL ${this.level}！`).setAlpha(1).setY(C.H / 2);
    this.tweens.add({
      targets: this._popup, alpha: 0,
      y: C.H / 2 - 80, duration: 1500, ease: 'Power2'
    });

    if (this.level === 5 || this.level === 10) {
      const flash = this.add.rectangle(0, 0, C.W, C.H, tier.color, 0.5).setOrigin(0).setDepth(C.DEPTH_EFFECT);
      this.tweens.add({ targets: flash, alpha: 0, duration: 600, onComplete: () => flash.destroy() });
    }
  }

  // ─── Effects ───────────────────────────────────────────────────────────────

  _burst(x, y) {
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const p = this.add.image(x, y, 'particle')
        .setDisplaySize(10, 10).setDepth(C.DEPTH_EFFECT)
        .setTint([0xff8800, 0xff4400, 0xffff00][i % 3]);
      const dx = Math.cos(a) * (60 + Math.random() * 60);
      const dy = Math.sin(a) * (60 + Math.random() * 60);
      this.tweens.add({
        targets: p, x: x + dx, y: y + dy, alpha: 0, scaleX: 0.2, scaleY: 0.2,
        duration: 400 + Math.random() * 200, onComplete: () => p.destroy()
      });
    }
  }

  _flash(img) {
    this.tweens.add({ targets: img, alpha: 0.3, yoyo: true, duration: 60 });
  }

  // ─── Cleanup ───────────────────────────────────────────────────────────────

  _cleanup() {
    this.bullets  = this.bullets.filter(b => {
      if (!b.img.active || b.img.y < -30) { if (b.img.active) b.img.destroy(); return false; }
      return true;
    });
    this.enemies  = this.enemies.filter(e => {
      if (!e.img.active) return false;
      if (!e.isBoss && e.img.y > C.H + 80) { e.img.destroy(); return false; }
      return true;
    });
    this.ebullets = this.ebullets.filter(b => {
      if (!b.img.active || b.img.y > C.H + 30) { if (b.img.active) b.img.destroy(); return false; }
      return true;
    });
  }
}
