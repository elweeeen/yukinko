class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  create() {
    const W = C.W, H = C.H;

    // Show the native HTML photo button
    document.getElementById('photo-btn').style.display = 'block';

    this.add.tileSprite(0, 0, W, H, 'bg').setOrigin(0);

    this.add.text(W/2, 70, 'YUKINKO', {
      fontSize: '54px', color: '#ffaadd', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 6
    }).setOrigin(0.5);
    this.add.text(W/2, 134, 'SHOOTER', {
      fontSize: '38px', color: '#ffddee', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5);

    const face = this.add.image(W/2, H/2 - 20, 'yukinko-baby').setDisplaySize(180, 180);
    this.tweens.add({ targets: face, y: H/2 - 40, yoyo: true, duration: 900, repeat: -1, ease: 'Sine.easeInOut' });

    // High score
    let hiScore = 0;
    try { hiScore = parseInt(localStorage.getItem('yukinkoHiScore') || '0', 10); } catch(e) {}
    if (hiScore > 0) {
      this.add.text(W/2, H - 200, `BEST: ${hiScore.toLocaleString()}`, {
        fontSize: '18px', color: '#ffdd88', fontStyle: 'bold', stroke: '#000', strokeThickness: 3
      }).setOrigin(0.5);
    }

    this.add.text(W/2, H - 175, '指でドラッグして移動', { fontSize: '16px', color: '#dddddd' }).setOrigin(0.5);
    this.add.text(W/2, H - 150, '弾は自動発射！', { fontSize: '16px', color: '#dddddd' }).setOrigin(0.5);

    const s = this.add.text(W/2, H - 108, '画面をタップでスタート', {
      fontSize: '20px', color: '#ffff88', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5);
    this.tweens.add({ targets: s, alpha: 0, yoyo: true, duration: 600, repeat: -1 });

    // Start game on any canvas tap (the HTML photo button has z-index:999 so it won't trigger this)
    const go = () => {
      document.getElementById('photo-btn').style.display = 'none';
      this.scene.start('GameScene');
    };
    this.input.keyboard.once('keydown-SPACE', go);
    this.input.once('pointerdown', go);
  }
}
