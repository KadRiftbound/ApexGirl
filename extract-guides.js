const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');

const imageDir = 'C:/Users/magna/Documents/APEXGIRLDATA';

const guideImages = [
  // Events
  'VSGroupGuide.jpg',
  'VSGroupGuide2.jpg',
  'FishingEventGuide1.jpg',
  'FishingEventGuide2.jpg',
  'FishingEventGuide3.jpg',
  // Guides
  'WorldBuildingGuide.jpg',
  'VIPLevelGuide.jpg',
  'CEOcoinsPurchaseGuide.jpg',
  'CEOcoinsPurchaseGuide2.jpg',
  'GuideAllianceManagement.jpg',
  'PeakLevelGuide.jpg',
  'PeakLevelGuide2.jpg',
  'PeakLevelGuide3.jpg',
  'GroupShopGuide.jpg',
];

async function extractText(imagePath) {
  try {
    const result = await Tesseract.recognize(imagePath, 'eng', {
      logger: m => console.log(m)
    });
    return result.data.text;
  } catch (err) {
    console.error(`Error processing ${imagePath}:`, err.message);
    return '';
  }
}

async function main() {
  const output = {};
  
  for (const image of guideImages) {
    const imagePath = path.join(imageDir, image);
    if (fs.existsSync(imagePath)) {
      console.log(`\n=== Processing: ${image} ===`);
      const text = await extractText(imagePath);
      output[image] = text;
      console.log(`Extracted text:\n${text}\n`);
    } else {
      console.log(`File not found: ${imagePath}`);
    }
  }
  
  // Save results to JSON
  fs.writeFileSync('extracted-guides.json', JSON.stringify(output, null, 2));
  console.log('\nResults saved to extracted-guides.json');
}

main();
