class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOverScene'); }

  init(data) { this._data = data || { score: 0, level: 1 }; }

  create() {
    const W = C.WIDTH, H = C.HEIGHT;

    this.add.tileSprite(0, 0, W, H, 'bg').setOrigin(0);

    this.add.text(W / 2, H / 2 - 120, 'GAME OVER', {
      fontSize: '44px', color: '#ff4466', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 6
    }).setOrigin(0.5);

    const tierName = this._data.level >= 10 ? 'ゆきんこ侍'
                   : this._data.level >= 5  ? 'ゆきんこウォリアー'
                   : '赤ちゃんゆきんこ';

    this.add.text(W / 2, H / 2 - 50, tierName + ' として戦った！', {
      fontSize: '18px', color: '#ffddaa'
    }).setOrigin(0.5);

    this.add.text(W / 2, H / 2 + 10, `SCORE: ${this._data.score.toLocaleString()}`, {
      fontSize: '28px', color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(W / 2, H / 2 + 55, `到達レベル: ${this._data.level}`, {
      fontSize: '20px', color: '#aaaaff'
    }).setOrigin(0.5);

    const retry = this.add.text(W / 2, H - 90, 'SPACE / タップ でリトライ', {
      fontSize: '18px', color: '#ffff88', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5);
    this.tweens.add({
      targets: retry, alpha: 0, yoyo: true,
      duration: 600, repeat: -1
    });

    const restart = () => this.scene.start('GameScene');
    this.input.keyboard.once('keydown-SPACE', restart);
    this.input.once('pointerdown', restart);
  }
}
