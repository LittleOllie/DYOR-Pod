import sharp from "sharp";
import path from "node:path";

const root = path.join(import.meta.dirname, "..");
const publicRoot = path.join(root, "public");
const appRoot = path.join(root, "src", "app");
const source = path.join(publicRoot, "brand", "Game-O.png");

/** Match site background so the tab icon feels native on dark chrome. */
const TAB_BG = { r: 6, g: 24, b: 33, alpha: 1 };

async function writeSquareIcon(size, dest, padding = 0) {
  const inner = Math.max(16, size - padding * 2);

  const letter = await sharp(source)
    .resize(inner, inner, {
      fit: "contain",
      background: TAB_BG,
    })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: TAB_BG,
    },
  })
    .composite([{ input: letter, gravity: "centre" }])
    .png()
    .toFile(dest);
}

const outputs = [
  [32, path.join(publicRoot, "favicon.ico"), 2],
  [32, path.join(publicRoot, "brand", "favicon-32.png"), 2],
  [180, path.join(publicRoot, "apple-touch-icon.png"), 8],
  [192, path.join(publicRoot, "brand", "favicon-192.png"), 10],
  [512, path.join(publicRoot, "brand", "favicon-512.png"), 24],
  [32, path.join(appRoot, "icon.png"), 2],
  [180, path.join(appRoot, "apple-icon.png"), 8],
];

for (const [size, dest, padding] of outputs) {
  await writeSquareIcon(size, dest, padding);
  console.log("Wrote", path.relative(root, dest));
}

console.log("Favicons generated from public/brand/Game-O.png");
