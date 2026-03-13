const fs = require('fs');
const path = require('path');
const https = require('https');
const sharp = require('sharp');

const TARGET_SIZE = 200;
const IMAGES_DIR = path.join(__dirname, 'Screenshot');

const missingArtists = [
  'victoria', 'evelyn', 'violet', 'mia', 'harper', 'cornelia', 'aurelia',
  'olivia', 'sophia', 'isabella', 'ava', 'charlotte', 'vivienne', 'isla',
  'xenia', 'nastassja', 'eleanor', 'mellissa', 'hikari', 'rin', 'madison',
  'flora', 'claudius', 'antonia'
];

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (res) => {
      if (res.statusCode === 404) {
        file.close();
        fs.unlinkSync(filepath);
        resolve(null);
        return;
      }
      res.pipe(file);
      file.on('finish', () => resolve(filepath));
    }).on('error', reject);
  });
}

async function processArtist(name) {
  const url = `https://topgirl.gg/images/characters/ssr/${name}/${name}.webp`;
  const tempPath = path.join(IMAGES_DIR, `${name}.webp`);
  const jpgPath = path.join(IMAGES_DIR, `${name.charAt(0).toUpperCase() + name.slice(1)}.jpg`);
  
  console.log(`Downloading ${name}...`);
  const result = await downloadImage(url, tempPath);
  
  if (!result) {
    console.log(`  Not found at topgirl.gg`);
    return false;
  }
  
  const meta = await sharp(tempPath).metadata();
  
  let left = 0, top = 0, cropW = meta.width, cropH = meta.height;
  if (meta.width > meta.height) {
    cropW = meta.height;
    left = Math.floor((meta.width - meta.height) / 2);
  } else {
    cropH = Math.min(meta.height, TARGET_SIZE * 3);
    top = Math.floor((meta.height - cropH) / 3);
  }
  
  await sharp(tempPath)
    .extract({ left, top, width: cropW, height: cropH })
    .resize(TARGET_SIZE, TARGET_SIZE, { fit: 'cover' })
    .jpeg({ quality: 90 })
    .toFile(jpgPath);
  
  fs.unlinkSync(tempPath);
  console.log(`  Saved: ${jpgPath}`);
  return true;
}

async function main() {
  let downloaded = 0;
  for (const name of missingArtists) {
    if (await processArtist(name)) downloaded++;
  }
  console.log(`\nDownloaded: ${downloaded}/${missingArtists.length}`);
}

main().catch(console.error);
