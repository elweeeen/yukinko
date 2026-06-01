class ParticleEffects {
  constructor(scene) {
    this.scene = scene;
  }

  playExplosion(x, y) {
    // Phaser 3.60+ particle emitter syntax
    const emitter = this.scene.add.particles(x, y, 'particle', {
      speed:    { min: 60, max: 180 },
      scale:    { start: 1.0, end: 0 },
      lifespan: 480,
      quantity: 10,
      tint:     [0xff8800, 0xff4400, 0xffff00, 0xffffff],
    });
    emitter.setDepth(C.DEPTH_EFFECTS);
    this.scene.time.delayedCall(500, () => emitter.destroy());
  }

  playTierUpFlash(x, y, level) {
    const color = level >= 10 ? 0xffaa00 : 0x00ccff;
    const ring  = this.scene.add.circle(x, y, 8, color, 0.85).setDepth(C.DEPTH_EFFECTS);
    this.scene.tweens.add({
      targets:  ring,
      scaleX:   20,
      scaleY:   20,
      alpha:    0,
      duration: 700,
      ease:     'Power2',
      onComplete: () => ring.destroy()
    });

    // Screen flash
    const flash = this.scene.add.rectangle(0, 0, C.WIDTH, C.HEIGHT, color, 0.35)
      .setOrigin(0).setDepth(C.DEPTH_EFFECTS);
    this.scene.tweens.add({
      targets: flash, alpha: 0, duration: 500,
      onComplete: () => flash.destroy()
    });
  }
}
