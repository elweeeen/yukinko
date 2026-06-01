const C = {
  WIDTH:  480,
  HEIGHT: 720,

  PLAYER_SPEED:      220,
  PLAYER_BASE_HP:    100,
  PLAYER_IFRAMES_MS: 1200,

  // XP needed to reach each level (index = level-1, value = cumulative XP)
  XP_THRESHOLDS: [0, 100, 220, 360, 520, 720, 960, 1240, 1560, 1920, 99999],

  TIER_BABY:    { minLevel: 1,  fireRate: 450, bulletSpeed: 400, bulletCount: 1, damage: 10 },
  TIER_WARRIOR: { minLevel: 5,  fireRate: 280, bulletSpeed: 520, bulletCount: 2, damage: 15 },
  TIER_SAMURAI: { minLevel: 10, fireRate: 180, bulletSpeed: 650, bulletCount: 3, damage: 25 },

  ENEMY_BASIC_HP: 30,  ENEMY_BASIC_SPEED: 120, ENEMY_BASIC_XP: 15,  ENEMY_BASIC_SCORE: 100,
  ENEMY_FAST_HP:  15,  ENEMY_FAST_SPEED:  240, ENEMY_FAST_XP:  20,  ENEMY_FAST_SCORE:  150,
  ENEMY_TANK_HP:  100, ENEMY_TANK_SPEED:  70,  ENEMY_TANK_XP:  40,  ENEMY_TANK_SCORE:  300,

  BOSS_HP_BASE:   500,
  BOSS_HP_SCALE:  300,
  BOSS_SPEED:     80,
  BOSS_XP:        300,
  BOSS_SCORE:     2000,

  SPAWN_BASE_INTERVAL: 1800,
  SPAWN_MIN_INTERVAL:  400,
  SPAWN_DIFFICULTY_RAMP: 0.97,

  DEPTH_BG:      0,
  DEPTH_ENEMY:   10,
  DEPTH_PLAYER:  20,
  DEPTH_BULLET:  30,
  DEPTH_EFFECTS: 40,
  DEPTH_HUD:     50,
};
