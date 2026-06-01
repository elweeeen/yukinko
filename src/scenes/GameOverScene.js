class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOverScene'); }
  init(d) { this._d = d || { score: 0, level: 1 }; }

  create() {
    const W = C.W, H = C.H;
    this.add.tileSprite(0, 0, W, H, 'bg').setOrigin(0);

    const tierName = this._d.level >= 10 ? 'ゆきんこ侍'
                   : this._d.level >= 5  ? 'ゆきんこウォリアー'
                   : '赤ちゃんゆきんこ';

    this.add.text(W/2, H/2 - 130, 'GAME OVER', {
      fontSize: '46px', color: '#ff4466', fontStyle: 'bold', stroke: '#000', strokeThickness: 6
    }).setOrigin(0.5);

    this.add.text(W/2, H/2 - 60, `${tierName} として戦った！`, {
      fontSize: '18px', color: '#ffddaa'
    }).setOrigin(0.5);

    this.add.text(W/2, H/2, `SCORE: ${this._d.score.toLocaleString()}`, {
      fontSize: '30px', color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(W/2, H/2 + 55, `到達レベル: ${this._d.level}`, {
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
