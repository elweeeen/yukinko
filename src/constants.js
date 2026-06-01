const C = {
  W: 480, H: 720,
  PLAYER_SPEED: 260,
  PLAYER_HP: 5,         // ハート5個
  IFRAMES_MS: 1400,

  XP_THRESHOLDS: [0, 80, 180, 300, 440, 600, 790, 1010, 1260, 1540, 99999],

  TIERS: [
    { minLv: 1,  name: 'ゆきんこベビー', fireRate: 420, bulletSpeed: 9, count: 1, damage: 1, color: 0xffffff, key: 'yukinko-baby'    },
    { minLv: 5,  name: 'ウォリアー', fireRate: 260, bulletSpeed: 11, count: 2, damage: 2, color: 0x88ddff, key: 'yukinko-warrior' },
    { minLv: 10, name: '侍',       fireRate: 160, bulletSpeed: 14, count: 3, damage: 3, color: 0xffdd44, key: 'yukinko-samurai' },
  ],

  DEPTH_BG: 0, DEPTH_ENEMY: 10, DEPTH_PLAYER: 20,
  DEPTH_BULLET: 30, DEPTH_EFFECT: 40, DEPTH_HUD: 50,
};
