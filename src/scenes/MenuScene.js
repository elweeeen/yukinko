class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  create() {
    const W = C.WIDTH, H = C.HEIGHT;

    // Background
    this.add.tileSprite(0, 0, W, H, 'bg').setOrigin(0);

    // Title
    this.add.text(W / 2, 80, 'YUKINKO', {
      fontSize: '52px', color: '#ffaadd', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 6
    }).setOrigin(0.5);
    this.add.text(W / 2, 138, 'SHOOTER', {
      fontSize: '40px', color: '#ffddee', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5);

    // Character preview
    const img = this.add.image(W / 2, H / 2 - 30, 'yukinko-baby').setOrigin(0.5);
    img.setDisplaySize(180, 180);

    // Bounce tween
    this.tweens.add({
      targets: img, y: H / 2 - 50, yoyo: true,
      duration: 900, repeat: -1, ease: 'Sine.easeInOut'
    });

    // Instructions
    this.add.text(W / 2, H - 180, '矢印キー / WASD で移動', {
      fontSize: '15px', color: '#dddddd'
    }).setOrigin(0.5);
    this.add.text(W / 2, H - 155, 'タッチ / ドラッグでも操作できます', {
      fontSize: '13px', color: '#aaaaaa'
    }).setOrigin(0.5);

    // Blinking start text
    const startTxt = this.add.text(W / 2, H - 100, 'SPACE / タップ でスタート', {
      fontSize: '18px', color: '#ffff88', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5);
    this.tweens.add({
      targets: startTxt, alpha: 0, yoyo: true,
      duration: 600, repeat: -1, ease: 'Sine.easeInOut'
    });

    const start = () => this.scene.start('GameScene');
    this.input.keyboard.once('keydown-SPACE', start);
    this.input.once('pointerdown', start);
  }
}
