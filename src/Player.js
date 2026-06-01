class Player {
  constructor(scene) {
    this.scene    = scene;
    this.hp       = C.PLAYER_BASE_HP;
    this.maxHp    = C.PLAYER_BASE_HP;
    this.xp       = 0;
    this.level    = 1;
    this.score    = 0;

    this._lastFired    = 0;
    this._iframeTimer  = 0;
    this._isInvincible = false;

    this.sprite = scene.physics.add.sprite(C.WIDTH / 2, C.HEIGHT - 100, 'yukinko-baby');
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setDepth(C.DEPTH_PLAYER);
    this.sprite.setDisplaySize(72, 72);

    this.cursors = scene.input.keyboard.createCursorKeys();
    this.wasd    = scene.input.keyboard.addKeys('W,A,S,D');

    // Touch: drag player to pointer position
    scene.input.on('pointermove', ptr => {
      if (ptr.isDown) {
        this.sprite.x = Phaser.Math.Clamp(ptr.x, 28, C.WIDTH  - 28);
        this.sprite.y = Phaser.Math.Clamp(ptr.y, C.HEIGHT * 0.30, C.HEIGHT - 28);
      }
    });
  }

  getTier() {
    if (this.level >= 10) return C.TIER_SAMURAI;
    if (this.level >= 5)  return C.TIER_WARRIOR;
    return C.TIER_BABY;
  }

  getTierKey() {
    if (this.level >= 10) return 'yukinko-samurai';
    if (this.level >= 5)  return 'yukinko-warrior';
    return 'yukinko-baby';
  }

  getTierName() {
    if (this.level >= 10) return '侍';
    if (this.level >= 5)  return 'ウォリアー';
    return '赤ちゃん';
  }

  addXP(amount) {
    this.xp += amount;
    const t = C.XP_THRESHOLDS;
    while (this.level < t.length - 1 && this.xp >= t[this.level]) {
      this.level++;
      this._onLevelUp();
    }
  }

  _onLevelUp() {
    this.hp = Math.min(this.maxHp, this.hp + this.maxHp * 0.25);
    this.sprite.setTexture(this.getTierKey());
    this.sprite.setDisplaySize(72, 72);
    if (this.level === 5 || this.level === 10) {
      this.scene.effects.playTierUpFlash(this.sprite.x, this.sprite.y, this.level);
    }
    this.scene.hud.onLevelUp(this.level, this.getTierName());
  }

  takeDamage(amount) {
    if (this._isInvincible) return false;
    this.hp -= amount;
    this._isInvincible = true;
    this._iframeTimer  = C.PLAYER_IFRAMES_MS;
    this.scene.tweens.add({
      targets: this.sprite, alpha: 0.3, yoyo: true,
      duration: 100, repeat: 5,
      onComplete: () => { if (this.sprite.active) this.sprite.alpha = 1; }
    });
    return true;
  }

  tryFire(time) {
    const tier = this.getTier();
    if (time - this._lastFired < tier.fireRate) return;
    this._lastFired = time;
    this.scene.spawner.firePlayerBullets(this.sprite.x, this.sprite.y, tier);
  }

  update(time, delta) {
    if (this._isInvincible) {
      this._iframeTimer -= delta;
      if (this._iframeTimer <= 0) this._isInvincible = false;
    }

    const speed = C.PLAYER_SPEED;
    let vx = 0, vy = 0;
    if (this.cursors.left.isDown  || this.wasd.A.isDown) vx = -speed;
    if (this.cursors.right.isDown || this.wasd.D.isDown) vx = +speed;
    if (this.cursors.up.isDown    || this.wasd.W.isDown) vy = -speed;
    if (this.cursors.down.isDown  || this.wasd.S.isDown) vy = +speed;
    if (vx !== 0 && vy !== 0) { vx *= 0.707; vy *= 0.707; }
    this.sprite.setVelocity(vx, vy);

    this.sprite.y = Phaser.Math.Clamp(this.sprite.y, C.HEIGHT * 0.30, C.HEIGHT - 28);

    this.tryFire(time);
  }

  isDead() { return this.hp <= 0; }
}
