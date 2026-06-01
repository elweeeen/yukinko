class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }

  create() {
    // Scrolling star background
    this._bg = this.add.tileSprite(0, 0, C.WIDTH, C.HEIGHT, 'bg')
      .setOrigin(0).setDepth(C.DEPTH_BG);

    // Instantiate in dependency order
    this.effects = new ParticleEffects(this);
    this.player  = new Player(this);
    this.spawner = new EnemySpawner(this);
    this.hud     = new HUD(this);

    // Pause on ESC
    this.input.keyboard.on('keydown-ESC', () => {
      this.scene.pause();
    });
  }

  update(time, delta) {
    this._bg.tilePositionY -= 1.5;

    this.player.update(time, delta);
    this.spawner.update(time, delta);
    this.hud.update(this.player);

    if (this.player.isDead()) {
      this.scene.start('GameOverScene', {
        score: this.player.score,
        level: this.player.level
      });
    }
  }
}
