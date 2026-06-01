class EnemySpawner {
  constructor(scene) {
    this.scene          = scene;
    this.enemies        = [];
    this.playerBullets  = [];
    this.enemyBullets   = [];
    this._spawnTimer    = 0;
    this._spawnInterval = C.SPAWN_BASE_INTERVAL;
    this._diffTimer     = 0;
    this._bossIndex     = 0;
    this._bossActive    = false;
    this._lastPlayerLevel = 1;

    this.enemyGroup        = scene.physics.add.group();
    this.playerBulletGroup = scene.physics.add.group();
    this.enemyBulletGroup  = scene.physics.add.group();

    this._setupCollisions();
  }

  _setupCollisions() {
    const scene = this.scene;

    // Player bullets hit enemies
    scene.physics.add.overlap(
      this.playerBulletGroup, this.enemyGroup,
      (bulletSprite, enemySprite) => {
        if (!bulletSprite.active || !enemySprite.active) return;
        const bullet = bulletSprite._bulletRef;
        const enemy  = enemySprite._enemyRef;
        if (bullet && enemy) {
          enemy.takeDamage(bullet.damage);
          bulletSprite.destroy();
        }
      }
    );

    // Enemy bullets hit player
    scene.physics.add.overlap(
      this.enemyBulletGroup, scene.player.sprite,
      (bulletSprite) => {
        if (!bulletSprite.active) return;
        const bullet = bulletSprite._bulletRef;
        if (scene.player.takeDamage(bullet ? bullet.damage : 18)) {
          bulletSprite.destroy();
        }
      }
    );

    // Enemies collide with player (body contact)
    scene.physics.add.overlap(
      this.enemyGroup, scene.player.sprite,
      (enemySprite) => {
        if (!enemySprite.active) return;
        const enemy = enemySprite._enemyRef;
        if (scene.player.takeDamage(30) && enemy) {
          enemy.takeDamage(9999);
        }
      }
    );
  }

  firePlayerBullets(x, y, tier) {
    const textureKey = tier === C.TIER_SAMURAI ? 'bullet-beam'
                     : tier === C.TIER_WARRIOR ? 'bullet-star' : 'bullet-milk';
    const offsets = tier.bulletCount === 3 ? [-22, 0, 22]
                  : tier.bulletCount === 2 ? [-13, 13] : [0];

    offsets.forEach(ox => {
      const b = new PlayerBullet(this.scene, x, y, ox, textureKey, tier.bulletSpeed, tier.damage);
      this.playerBulletGroup.add(b.sprite);
      this.playerBullets.push(b);
    });
  }

  fireBossProjectile(x, y) {
    const b = new EnemyBullet(this.scene, x, y);
    this.enemyBulletGroup.add(b.sprite);
    this.enemyBullets.push(b);
  }

  _spawnEnemy() {
    if (this._bossActive) return;
    const x     = Phaser.Math.Between(32, C.WIDTH - 32);
    const level = this.scene.player.level;
    const roll  = Math.random();
    let enemy;
    if      (level >= 8  && roll < 0.25) enemy = new TankEnemy(this.scene, x);
    else if (level >= 4  && roll < 0.45) enemy = new FastEnemy(this.scene, x);
    else                                 enemy = new BasicEnemy(this.scene, x);

    this.enemies.push(enemy);
    this.enemyGroup.add(enemy.sprite);
  }

  _checkBossTrigger() {
    const level = this.scene.player.level;
    if (Math.floor(level / 5) > Math.floor(this._lastPlayerLevel / 5) && !this._bossActive) {
      this._spawnBoss();
    }
    this._lastPlayerLevel = level;
  }

  _spawnBoss() {
    this._bossActive = true;
    // Clear regular enemies
    this.enemies.forEach(e => { if (e.sprite.active) e.sprite.destroy(); });
    this.enemies = [];

    const boss = new BossEnemy(this.scene, this._bossIndex);
    this.enemies.push(boss);
    this.enemyGroup.add(boss.sprite);
    this.scene.hud.showBossBar(boss);
    this._bossIndex++;
  }

  removeEnemy(enemy) {
    this.enemies = this.enemies.filter(e => e !== enemy);
    if (enemy.type === 'boss') {
      this._bossActive = false;
      this.scene.hud.hideBossBar();
    }
  }

  update(time, delta) {
    // Ramp difficulty
    this._diffTimer += delta;
    if (this._diffTimer >= 5000) {
      this._diffTimer   = 0;
      this._spawnInterval = Math.max(C.SPAWN_MIN_INTERVAL,
        this._spawnInterval * C.SPAWN_DIFFICULTY_RAMP);
    }

    // Spawn
    this._spawnTimer += delta;
    if (this._spawnTimer >= this._spawnInterval) {
      this._spawnTimer = 0;
      this._spawnEnemy();
    }

    this._checkBossTrigger();

    this.enemies.forEach(e => e.update(time, delta));
    this.playerBullets.forEach(b => b.update());
    this.enemyBullets.forEach(b => b.update());

    this.playerBullets = this.playerBullets.filter(b => b.sprite.active);
    this.enemyBullets  = this.enemyBullets.filter(b => b.sprite.active);
  }
}
