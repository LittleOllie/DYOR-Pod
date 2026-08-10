import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const root = path.join(import.meta.dirname, "..", "public");

const conversions = [
  ["/tmp/dw.png", "hosts/dw.webp"],
  ["/tmp/janner.jpg", "hosts/janner.webp"],
  ["/tmp/petey-k.png", "hosts/petey-k.webp"],
  ["/tmp/show1.jpg", "shows/dyor-sunday.webp"],
  ["/tmp/show2.jpg", "shows/will-work-for-crypto.webp"],
  ["/tmp/show3.jpg", "shows/no-fud-friday.webp"],
  ["/tmp/show4.jpg", "shows/dyor-podcast.webp"],
  ["/tmp/logo.jpg", "brand/dyor-logo.webp"],
];

for (const [src, dest] of conversions) {
  const out = path.join(root, dest);
  await mkdir(path.dirname(out), { recursive: true });
  await sharp(src).webp({ quality: 85 }).toFile(out);
  console.log("Wrote", dest);
}

// OG social preview
const ogPath = path.join(root, "og", "dyor-social-preview.jpg");
await mkdir(path.dirname(ogPath), { recursive: true });
await sharp({
  create: {
    width: 1200,
    height: 630,
    channels: 3,
    background: { r: 6, g: 24, b: 33 },
  },
})
  .composite([
    {
      input: Buffer.from(
        `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="g" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stop-color="#13A9A6" stop-opacity="0.35"/>
              <stop offset="100%" stop-color="#061821" stop-opacity="0"/>
            </radialGradient>
          </defs>
          <rect width="1200" height="630" fill="#061821"/>
          <rect width="1200" height="630" fill="url(#g)"/>
          <circle cx="980" cy="120" r="3" fill="#F5FAFA" opacity="0.6"/>
          <circle cx="1050" cy="200" r="2" fill="#F5FAFA" opacity="0.4"/>
          <circle cx="900" cy="80" r="2" fill="#F5FAFA" opacity="0.5"/>
          <ellipse cx="600" cy="520" rx="420" ry="80" fill="none" stroke="#13A9A6" stroke-opacity="0.25" stroke-width="1"/>
          <text x="80" y="200" fill="#31D1C6" font-family="Arial,sans-serif" font-size="28" font-weight="700" letter-spacing="4">DYOR</text>
          <text x="80" y="280" fill="#F5FAFA" font-family="Arial,sans-serif" font-size="52" font-weight="700">Live Crypto Spaces,</text>
          <text x="80" y="350" fill="#F5FAFA" font-family="Arial,sans-serif" font-size="52" font-weight="700">News &amp; Opinion</text>
          <text x="80" y="430" fill="#AFC3C7" font-family="Arial,sans-serif" font-size="26">Weekly on X, Spotify and Apple Podcasts</text>
          <polygon points="980,400 990,430 1010,430 995,445 1000,470 980,455 960,470 965,445 950,430 970,430" fill="#E5CF59"/>
          <rect x="975" y="480" width="10" height="40" rx="2" fill="#13A9A6"/>
          <polygon points="970,520 980,560 990,560 1000,520" fill="#31D1C6" opacity="0.8"/>
        </svg>`,
      ),
      top: 0,
      left: 0,
    },
  ])
  .jpeg({ quality: 90 })
  .toFile(ogPath);

console.log("Wrote og/dyor-social-preview.jpg");

console.log("Run npm run generate:favicons to rebuild tab icons from public/brand/Game-O.png");
console.log("Done");
