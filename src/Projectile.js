class PlayerBullet {
  constructor(scene, x, y, offsetX, textureKey, speed, damage) {
    this.damage = damage;
    this.sprite = scene.physics.add.sprite(x + offsetX, y - 24, textureKey);
    this.sprite.setDepth(C.DEPTH_BULLET);
    this.sprite.setVelocityY(-speed);
    this.sprite._bulletRef = this;
    this.sprite.setScale(0.7);
  }

  update() {
    if (!this.sprite.active) return;
    if (this.sprite.y < -40) this.sprite.destroy();
  }
}

class EnemyBullet {
  constructor(scene, x, y) {
    this.damage = 18;
    this.sprite = scene.physics.add.sprite(x, y + 20, 'enemy-bullet');
    this.sprite.setDepth(C.DEPTH_BULLET);
    this.sprite.setVelocityY(300);
    this.sprite._bulletRef = this;
    this.sprite.setScale(0.8);
  }

  update() {
    if (!this.sprite.active) return;
    if (this.sprite.y > C.HEIGHT + 40) this.sprite.destroy();
  }
}
