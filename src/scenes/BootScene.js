class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  preload() {
    const W = C.WIDTH, H = C.HEIGHT;

    // Loading bar
    const bgBar  = this.add.rectangle(W / 2, H / 2, W * 0.7, 24, 0x222222).setOrigin(0.5);
    const fillBar = this.add.rectangle(W / 2 - W * 0.35, H / 2, 0, 20, 0xff88cc).setOrigin(0, 0.5);
    this.add.text(W / 2, H / 2 + 24, 'Loading...', {
      fontSize: '14px', color: '#ffffff'
    }).setOrigin(0.5);

    this.load.on('progress', v => {
      fillBar.width = W * 0.7 * v;
    });

    // Track which keys failed so we can generate fallbacks
    this._failedKeys = new Set();
    this.load.on('loaderror', (file) => {
      this._failedKeys.add(file.key);
    });

    // Player sprites (real photos — must be placed in assets/images/)
    this.load.image('yukinko-baby',    'assets/images/yukinko-baby.png');
    this.load.image('yukinko-warrior', 'assets/images/yukinko-warrior.png');
    this.load.image('yukinko-samurai', 'assets/images/yukinko-samurai.png');

    // Projectiles
    this.load.image('bullet-milk', 'assets/images/bullet-milk.png');
    this.load.image('bullet-star', 'assets/images/bullet-star.png');
    this.load.image('bullet-beam', 'assets/images/bullet-beam.png');

    // Enemies
    this.load.image('enemy-basic', 'assets/images/enemy-basic.png');
    this.load.image('enemy-fast',  'assets/images/enemy-fast.png');
    this.load.image('enemy-tank',  'assets/images/enemy-tank.png');
    this.load.image('boss',        'assets/images/boss.png');
    this.load.image('enemy-bullet','assets/images/enemy-bullet.png');

    // Background
    this.load.image('bg', 'assets/images/bg.png');
  }

  create() {
    // Generate fallback textures for any assets that failed to load
    this._generateFallbacks();
    this.scene.start('MenuScene');
  }

  _generateFallbacks() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    const failed = this._failedKeys;
    const ensure = (key, drawFn) => {
      if (failed.has(key) || !this.textures.exists(key)) {
        g.clear();
        drawFn(g);
        g.generateTexture(key, 64, 64);
      }
    };

    // Player tiers (cute face placeholders)
    ensure('yukinko-baby', g => {
      g.fillStyle(0xffccaa); g.fillCircle(32, 32, 28);
      g.fillStyle(0x000000); g.fillCircle(24, 28, 4); g.fillCircle(40, 28, 4);
      g.fillStyle(0xff6688); g.fillRect(22, 40, 20, 5);
    });
    ensure('yukinko-warrior', g => {
      g.fillStyle(0xffccaa); g.fillCircle(32, 32, 28);
      g.fillStyle(0x000000); g.fillCircle(24, 28, 4); g.fillCircle(40, 28, 4);
      g.fillStyle(0x0044ff); g.fillRect(10, 4, 44, 8); // warrior headband
      g.fillStyle(0xff6688); g.fillRect(22, 40, 20, 5);
    });
    ensure('yukinko-samurai', g => {
      g.fillStyle(0xffccaa); g.fillCircle(32, 32, 28);
      g.fillStyle(0x000000); g.fillCircle(24, 28, 4); g.fillCircle(40, 28, 4);
      g.fillStyle(0xcc0000); g.fillRect(4, 2, 56, 10); // samurai helmet brim
      g.fillStyle(0xffdd00); g.fillRect(28, 2, 8, 16);  // helmet crest
      g.fillStyle(0xff6688); g.fillRect(22, 40, 20, 5);
    });

    // Projectiles
    ensure('bullet-milk', g => {
      g.fillStyle(0xffffff); g.fillRect(24, 8, 16, 24);
      g.fillStyle(0xffaacc); g.fillRect(26, 6, 12, 6);
    });
    ensure('bullet-star', g => {
      g.fillStyle(0xffff00);
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
        const x = 32 + Math.cos(a) * 20, y = 32 + Math.sin(a) * 20;
        g.fillRect(x - 4, y - 4, 8, 8);
      }
      g.fillCircle(32, 32, 8);
    });
    ensure('bullet-beam', g => {
      g.fillStyle(0x88ddff); g.fillRect(28, 4, 8, 56);
      g.fillStyle(0xffffff); g.fillRect(30, 4, 4, 56);
    });

    // Enemies
    ensure('enemy-basic', g => {
      g.fillStyle(0xff4444); g.fillTriangle(32, 4, 4, 60, 60, 60);
      g.fillStyle(0xff8800); g.fillCircle(32, 40, 8);
    });
    ensure('enemy-fast', g => {
      g.fillStyle(0xff00ff); g.fillRect(12, 8, 40, 20);
      g.fillStyle(0xffaaff); g.fillTriangle(32, 4, 16, 28, 48, 28);
      g.fillRect(4, 28, 56, 8);
    });
    ensure('enemy-tank', g => {
      g.fillStyle(0x884400); g.fillRect(8, 8, 48, 48);
      g.fillStyle(0xcc6600); g.fillRect(20, 4, 24, 14);
      g.fillStyle(0xff0000); g.fillRect(24, 6, 16, 4);
    });
    ensure('boss', g => {
      g.fillStyle(0x660066); g.fillCircle(32, 32, 30);
      g.fillStyle(0xff00ff); g.fillCircle(20, 24, 6); g.fillCircle(44, 24, 6);
      g.fillStyle(0xff8800);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        g.fillRect(32 + Math.cos(a) * 24 - 3, 32 + Math.sin(a) * 24 - 3, 6, 6);
      }
    });
    ensure('enemy-bullet', g => {
      g.fillStyle(0xff4400); g.fillCircle(32, 32, 10);
      g.fillStyle(0xff8800); g.fillCircle(32, 32, 5);
    });

    // Particle
    const pKey = 'particle';
    if (!this.textures.exists(pKey) || this.textures.get(pKey).key === '__MISSING') {
      g.clear();
      g.fillStyle(0xffffff); g.fillCircle(8, 8, 8);
      g.generateTexture(pKey, 16, 16);
    }

    // Background tile
    ensure('bg', g => {
      g.fillStyle(0x0a0020); g.fillRect(0, 0, 64, 64);
      g.fillStyle(0xffffff, 0.6);
      g.fillCircle(8, 8, 1); g.fillCircle(32, 20, 1); g.fillCircle(50, 44, 1);
      g.fillCircle(20, 54, 1); g.fillCircle(56, 10, 1);
    });

    g.destroy();
  }
}
