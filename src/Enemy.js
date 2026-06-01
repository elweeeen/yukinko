class Enemy {
  constructor(scene, x, y, textureKey, scale, config) {
    this.scene  = scene;
    this.config = config;
    this.hp     = config.hp;
    this.maxHp  = config.hp;
    this.xp     = config.xp;
    this.score  = config.score;
    this.type   = config.type;

    this.sprite = scene.physics.add.sprite(x, y, textureKey);
    this.sprite.setDepth(C.DEPTH_ENEMY);
    this.sprite.setScale(scale);
    this.sprite.setVelocityY(config.speed);
    this.sprite._enemyRef = this;
  }

  takeDamage(amount) {
    this.hp -= amount;
    this.scene.tweens.add({
      targets: this.sprite, alpha: 0.4, yoyo: true, duration: 60
    });
    if (this.hp <= 0) this.destroy();
  }

  destroy() {
    if (!this.sprite.active) return;
    this.scene.effects.playExplosion(this.sprite.x, this.sprite.y);
    this.scene.player.addXP(this.xp);
    this.scene.player.score += this.score;
    this.scene.hud.updateScore(this.scene.player.score);
    this.sprite.destroy();
    this.scene.spawner.removeEnemy(this);
  }

  update(time, delta) {
    if (!this.sprite.active) return;
    if (this.sprite.y > C.HEIGHT + 100) {
      this.sprite.destroy();
      this.scene.spawner.removeEnemy(this);
    }
  }
}

class BasicEnemy extends Enemy {
  constructor(scene, x) {
    super(scene, x, -48, 'enemy-basic', 1, {
      hp: C.ENEMY_BASIC_HP, speed: C.ENEMY_BASIC_SPEED,
      xp: C.ENEMY_BASIC_XP, score: C.ENEMY_BASIC_SCORE, type: 'basic'
    });
  }
}

class FastEnemy extends Enemy {
  constructor(scene, x) {
    super(scene, x, -48, 'enemy-fast', 1, {
      hp: C.ENEMY_FAST_HP, speed: C.ENEMY_FAST_SPEED,
      xp: C.ENEMY_FAST_XP, score: C.ENEMY_FAST_SCORE, type: 'fast'
    });
    this._weavePeriod  = 1200 + Math.random() * 800;
    this._weaveOriginX = x;
  }

  update(time, delta) {
    if (!this.sprite.active) return;
    super.update(time, delta);
    if (!this.sprite.active) return;
    this.sprite.x = Phaser.Math.Clamp(
      this._weaveOriginX + Math.sin(time / this._weavePeriod * Math.PI * 2) * 80,
      20, C.WIDTH - 20
    );
  }
}

class TankEnemy extends Enemy {
  constructor(scene, x) {
    super(scene, x, -64, 'enemy-tank', 1.4, {
      hp: C.ENEMY_TANK_HP, speed: C.ENEMY_TANK_SPEED,
      xp: C.ENEMY_TANK_XP, score: C.ENEMY_TANK_SCORE, type: 'tank'
    });
  }
}

class BossEnemy extends Enemy {
  constructor(scene, bossIndex) {
    const hp = C.BOSS_HP_BASE + C.BOSS_HP_SCALE * bossIndex;
    super(scene, C.WIDTH / 2, -100, 'boss', 1.8, {
      hp, speed: C.BOSS_SPEED, xp: C.BOSS_XP, score: C.BOSS_SCORE, type: 'boss'
    });
    this.maxHp      = hp;
    this._moveDir   = 1;
    this._moveTimer = 0;
    this._nextShot  = 0;
    this._shootInterval = Math.max(1200, 2000 - bossIndex * 200);
    this._entered   = false;
  }

  update(time, delta) {
    if (!this.sprite.active) return;

    // Decelerate when entering screen
    if (!this._entered && this.sprite.y >= C.HEIGHT * 0.22) {
      this.sprite.setVelocityY(0);
      this._entered = true;
      this._nextShot = time + 1500;
    }

    if (this._entered) {
      // Patrol side to side
      this._moveTimer += delta;
      if (this._moveTimer > 1600) {
        this._moveDir  *= -1;
        this._moveTimer = 0;
      }
      this.sprite.setVelocityX(this._moveDir * 110);
      this.sprite.x = Phaser.Math.Clamp(this.sprite.x, 60, C.WIDTH - 60);

      // Shoot at player
      if (time >= this._nextShot) {
        this._nextShot = time + this._shootInterval;
        this.scene.spawner.fireBossProjectile(this.sprite.x, this.sprite.y);
      }
    }
  }
}
