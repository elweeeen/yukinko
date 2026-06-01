class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  preload() {
    const W = C.W, H = C.H;
    const bar = this.add.rectangle(W/2, H/2, W*0.7, 20, 0x333333).setOrigin(0.5);
    const fill = this.add.rectangle(W/2 - W*0.35, H/2, 0, 16, 0xff88cc).setOrigin(0, 0.5);
    this.load.on('progress', v => fill.width = W * 0.7 * v);

    this._failed = new Set();
    this.load.on('loaderror', f => this._failed.add(f.key));

    this.load.image('yukinko-baby',    'assets/images/yukinko-baby.png');
    this.load.image('yukinko-warrior', 'assets/images/yukinko-warrior.png');
    this.load.image('yukinko-samurai', 'assets/images/yukinko-samurai.png');
    this.load.image('bg',              'assets/images/bg.png');
  }

  create() {
    this._gen();
    // Load saved photo from localStorage and apply to all player tiers
    try {
      const photo = localStorage.getItem('yukinkoPhoto');
      if (photo) {
        ['yukinko-baby', 'yukinko-warrior', 'yukinko-samurai'].forEach(key => {
          if (this.textures.exists(key)) this.textures.remove(key);
          this.textures.addBase64(key, photo);
        });
      }
    } catch(e) {}
    this.scene.start('MenuScene');
  }

  _gen() {
    const g = this.make.graphics({ add: false });
    const failed = this._failed;

    const tex = (key, w, h, fn) => {
      if (failed.has(key) || !this.textures.exists(key)) {
        g.clear(); fn(g); g.generateTexture(key, w, h);
      }
    };

    // Player face (cute baby)
    const face = (g, headColor, extra) => {
      // Head
      g.fillStyle(0xffccaa); g.fillCircle(48, 52, 40);
      // Hair
      g.fillStyle(0x221100); g.fillRect(10, 14, 76, 22);
      g.fillCircle(48, 18, 26);
      // Eyes
      g.fillStyle(0x111111); g.fillCircle(36, 50, 7); g.fillCircle(60, 50, 7);
      // Eye shine
      g.fillStyle(0xffffff); g.fillCircle(39, 47, 3); g.fillCircle(63, 47, 3);
      // Cheeks
      g.fillStyle(0xff9999, 0.6); g.fillCircle(28, 60, 8); g.fillCircle(68, 60, 8);
      // Mouth
      g.fillStyle(0xff6688); g.fillRect(38, 64, 20, 5);
      if (extra) extra(g);
    };

    tex('yukinko-baby', 96, 96, g => {
      face(g);
    });
    tex('yukinko-warrior', 96, 96, g => {
      face(g);
      // Headband
      g.fillStyle(0x0033cc); g.fillRect(12, 30, 72, 10);
      g.fillStyle(0xffffff); g.fillRect(12, 33, 72, 4);
    });
    tex('yukinko-samurai', 96, 96, g => {
      face(g);
      // Helmet
      g.fillStyle(0xcc0000); g.fillRect(8, 8, 80, 16);
      g.fillStyle(0xffdd00); g.fillRect(42, 4, 12, 24);
    });

    // Enemies
    tex('enemy-basic', 64, 64, g => {
      g.fillStyle(0xff3333); g.fillCircle(32, 32, 28);
      g.fillStyle(0xffff00); g.fillCircle(24, 26, 6); g.fillCircle(40, 26, 6);
      g.fillStyle(0x000000); g.fillCircle(26, 26, 3); g.fillCircle(42, 26, 3);
      g.fillStyle(0xffffff); g.fillRect(22, 38, 20, 6);
    });
    tex('enemy-fast', 64, 64, g => {
      g.fillStyle(0xff00cc);
      g.fillTriangle(32, 4, 4, 60, 60, 60);
      g.fillStyle(0xffff00); g.fillCircle(32, 40, 8);
    });
    tex('enemy-tank', 64, 64, g => {
      g.fillStyle(0x884400); g.fillRect(6, 6, 52, 52);
      g.fillStyle(0xcc6600); g.fillRect(18, 2, 28, 14);
      g.fillStyle(0xff4400); g.fillRect(22, 4, 20, 6);
    });
    tex('boss', 96, 96, g => {
      g.fillStyle(0x4400aa); g.fillCircle(48, 48, 44);
      g.fillStyle(0xff00ff); g.fillCircle(30, 38, 10); g.fillCircle(66, 38, 10);
      g.fillStyle(0xffff00);
      for (let i = 0; i < 8; i++) {
        const a = i / 8 * Math.PI * 2;
        g.fillRect(48 + Math.cos(a) * 34 - 5, 48 + Math.sin(a) * 34 - 5, 10, 10);
      }
    });

    // Particle
    tex('particle', 16, 16, g => {
      g.fillStyle(0xffffff); g.fillCircle(8, 8, 8);
    });

    // Background
    tex('bg', 64, 64, g => {
      g.fillStyle(0x08001a); g.fillRect(0, 0, 64, 64);
      [[8,8],[20,40],[50,12],[38,55],[56,30]].forEach(([x,y]) => {
        g.fillStyle(0xffffff, 0.8); g.fillCircle(x, y, 1);
      });
    });

    // Enemy bullet
    tex('ebullet', 16, 24, g => {
      g.fillStyle(0xff4400); g.fillCircle(8, 8, 8);
      g.fillStyle(0xff8800); g.fillCircle(8, 8, 4);
    });

    g.destroy();
  }
}
