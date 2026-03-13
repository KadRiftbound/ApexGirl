const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const screenshotDir = './Screenshot';

// Artist images to process (only named ones)
const artistImages = [
  'Kokoro.jpg', 'Everly.jpg', 'Alice.jpg', 'Cindy.jpg', 'Anya.jpg', 'Sari.jpg',
  'Aurora.jpg', 'Savannah.jpg', 'Brooklyn.jpg', 'Monica.jpg', 'Zendayah.jpg', 'Nova.jpg',
  'Julia.jpg', 'Sora.jpg', 'Kesnia.jpg', 'Ratih.jpg', 'Chizuru.jpg', 'Calliope.jpg',
  'Ariadne.jpg', 'Eirene.jpg', 'Megan.jpg', 'Kasha.jpg', 'Yuuko.jpg', 'Leilani.jpg',
  'Rosemary.jpg', 'Ruby.jpg', 'Hestia.jpg', 'Noora.jpg', 'Ningsih.jpg', 'Lestari.jpg',
  'Bella.jpg', 'Avery.jpg', 'Ayaka.jpg', 'Audrey.jpg', 'Melissa.jpg', 'Daphne.jpg',
  'Longkui.jpg', 'Natassja.jpg', 'Octavia.jpg', 'Monn.jpg'
];

async function cropImages() {
  console.log('Cropping images...');
  
  for (const image of artistImages) {
    const inputPath = path.join(screenshotDir, image);
    const outputPath = path.join(screenshotDir, 'cropped_' + image);
    
    if (!fs.existsSync(inputPath)) {
      console.log(`Skipping ${image} - not found`);
      continue;
    }
    
    try {
      const metadata = await sharp(inputPath).metadata();
      console.log(`${image}: ${metadata.width}x${metadata.height}`);
      
      // Crop: 75% width from middle, 50% height from top
      // For example: 1080x2340 -> crop to 810x960 starting from x=135 (middle), y=0 (top)
      const newWidth = Math.floor(metadata.width * 0.75);
      const newHeight = Math.floor(metadata.height * 0.5);
      const left = Math.floor((metadata.width - newWidth) / 2); // center horizontally
      const top = 0; // top of the image
      
      await sharp(inputPath)
        .extract({ left: left, top: top, width: newWidth, height: newHeight })
        .toFile(outputPath);
      
      console.log(`✓ Cropped ${image}: ${newWidth}x${newHeight} (left:${left}, top:${top})`);
      
      // Replace original with cropped
      fs.unlinkSync(inputPath);
      fs.renameSync(outputPath, inputPath);
    } catch (err) {
      console.error(`Error processing ${image}:`, err.message);
    }
  }
  
  console.log('Done!');
}

cropImages();
