// Node.js script to prepare Yukinko photo assets for the game.
// Usage: node prepare-assets.js <photo1.jpg> [photo2.jpg] [photo3.jpg]
//
// - Photo 1 → yukinko-baby.png    (level 1-4)
// - Photo 2 → yukinko-warrior.png (level 5-9, defaults to photo1 with blue tint)
// - Photo 3 → yukinko-samurai.png (level 10+, defaults to photo1 with gold tint)
//
// Requires: sharp  →  npm install sharp

const sharp = require('sharp');
const path  = require('path');
const fs    = require('fs');

const OUT_DIR = path.join(__dirname, 'assets', 'images');
fs.mkdirSync(OUT_DIR, { recursive: true });

const SIZE = 128; // sprite size in pixels

const [, , photo1, photo2, photo3] = process.argv;

if (!photo1) {
  console.error('Usage: node prepare-assets.js <baby-photo.jpg> [warrior-photo.jpg] [samurai-photo.jpg]');
  process.exit(1);
}

async function circularCrop(inputPath, outputPath, tint) {
  // Create circular mask
  const mask = Buffer.from(
    `<svg><circle cx="${SIZE/2}" cy="${SIZE/2}" r="${SIZE/2}" fill="white"/></svg>`
  );

  let pipeline = sharp(inputPath)
    .resize(SIZE, SIZE, { fit: 'cover', position: 'top' });

  if (tint) {
    // Apply color tint by blending a solid color layer
    const tintLayer = Buffer.from(
      `<svg width="${SIZE}" height="${SIZE}">
        <rect width="${SIZE}" height="${SIZE}" fill="${tint}" opacity="0.35"/>
      </svg>`
    );
    pipeline = pipeline.composite([{ input: tintLayer, blend: 'over' }]);
  }

  await pipeline
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toFile(outputPath);

  console.log('✓', path.basename(outputPath));
}

(async () => {
  await circularCrop(photo1, path.join(OUT_DIR, 'yukinko-baby.png'),    null);
  await circularCrop(photo2 || photo1, path.join(OUT_DIR, 'yukinko-warrior.png'), '#0044ff');
  await circularCrop(photo3 || photo1, path.join(OUT_DIR, 'yukinko-samurai.png'), '#ffaa00');
  console.log('\nAssets ready in', OUT_DIR);
})();
