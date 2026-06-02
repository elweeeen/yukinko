class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOverScene'); }
  init(d) { this._d = d || { score: 0, level: 1 }; }

  create() {
    const W = C.W, H = C.H;
    this.add.tileSprite(0, 0, W, H, 'bg').setOrigin(0);

    const tierName = this._d.level >= 10 ? 'ゆきんこ侍'
                   : this._d.level >= 5  ? 'ゆきんこウォリアー'
                   : '赤ちゃんゆきんこ';

    // Update and retrieve high score
    let hiScore = 0;
    try {
      hiScore = parseInt(localStorage.getItem('yukinkoHiScore') || '0', 10);
      if (this._d.score > hiScore) {
        hiScore = this._d.score;
        localStorage.setItem('yukinkoHiScore', hiScore);
      }
    } catch(e) {}

    const isNew = hiScore === this._d.score && this._d.score > 0;

    this.add.text(W/2, H/2 - 130, 'GAME OVER', {
      fontSize: '46px', color: '#ff4466', fontStyle: 'bold', stroke: '#000', strokeThickness: 6
    }).setOrigin(0.5);

    this.add.text(W/2, H/2 - 60, `${tierName} として戦った！`, {
      fontSize: '18px', color: '#ffddaa'
    }).setOrigin(0.5);

    this.add.text(W/2, H/2, `SCORE: ${this._d.score.toLocaleString()}`, {
      fontSize: '30px', color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5);

    if (isNew) {
      const newBest = this.add.text(W/2, H/2 + 38, '★ NEW BEST ★', {
        fontSize: '18px', color: '#ffdd00', fontStyle: 'bold', stroke: '#000', strokeThickness: 3
      }).setOrigin(0.5);
      this.tweens.add({ targets: newBest, alpha: 0.2, yoyo: true, duration: 500, repeat: -1 });
    } else {
      this.add.text(W/2, H/2 + 38, `BEST: ${hiScore.toLocaleString()}`, {
        fontSize: '18px', color: '#ffdd88'
      }).setOrigin(0.5);
    }

    this.add.text(W/2, H/2 + 70, `到達レベル: ${this._d.level}`, {
      fontSize: '22px', color: '#aaaaff'
    }).setOrigin(0.5);

    const r = this.add.text(W/2, H - 85, 'タップでリトライ', {
      fontSize: '20px', color: '#ffff88', fontStyle: 'bold', stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5);
    this.tweens.add({ targets: r, alpha: 0, yoyo: true, duration: 600, repeat: -1 });

    const go = () => this.scene.start('GameScene');
    this.input.keyboard.once('keydown-SPACE', go);
    this.input.once('pointerdown', go);
  }
}
