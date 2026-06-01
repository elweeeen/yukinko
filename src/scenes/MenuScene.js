class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  create() {
    const W = C.W, H = C.H;
    this.add.tileSprite(0, 0, W, H, 'bg').setOrigin(0);

    this.add.text(W/2, 70, 'YUKINKO', {
      fontSize: '54px', color: '#ffaadd', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 6
    }).setOrigin(0.5);
    this.add.text(W/2, 134, 'SHOOTER', {
      fontSize: '38px', color: '#ffddee', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5);

    const face = this.add.image(W/2, H/2 - 20, 'yukinko-baby')
      .setDisplaySize(180, 180);
    this.tweens.add({ targets: face, y: H/2 - 40, yoyo: true, duration: 900, repeat: -1, ease: 'Sine.easeInOut' });

    this.add.text(W/2, H - 170, '指でドラッグして移動', { fontSize: '16px', color: '#dddddd' }).setOrigin(0.5);
    this.add.text(W/2, H - 145, '弾は自動発射！', { fontSize: '16px', color: '#dddddd' }).setOrigin(0.5);

    const s = this.add.text(W/2, H - 95, 'タップでスタート', {
      fontSize: '22px', color: '#ffff88', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5);
    this.tweens.add({ targets: s, alpha: 0, yoyo: true, duration: 600, repeat: -1 });

    // Photo upload button
    const photoBtnBg = this.add.rectangle(W/2, H - 38, 260, 36, 0x333333).setOrigin(0.5).setInteractive();
    const photoBtnTxt = this.add.text(W/2, H - 38, '📷 ゆきんこの写真を使う', {
      fontSize: '15px', color: '#ffffff'
    }).setOrigin(0.5);
    photoBtnBg.on('pointerdown', () => document.getElementById('photoInput').click());
    photoBtnTxt.setInteractive().on('pointerdown', () => document.getElementById('photoInput').click());

    const go = () => this.scene.start('GameScene');
    this.input.keyboard.once('keydown-SPACE', go);
    // Only start game on tap if NOT tapping the photo button
    this.input.on('pointerdown', (p) => {
      const onBtn = Math.abs(p.x - W/2) < 130 && Math.abs(p.y - (H - 38)) < 18;
      if (!onBtn) go();
    });
  }
}
