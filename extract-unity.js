const fs = require('fs');
const path = require('path');
const mgr = require('unity-assets-mgr');

const apkPath = 'C:/Users/magna/Documents/ApexGirl/apk_extracted/assets/bin/Data/data.unity3d';
const outputDir = 'C:/Users/magna/Documents/ApexGirl/assets/images/unity';

async function extractUnity() {
  console.log('Starting Unity extraction...');
  
  try {
    await mgr.extractAssets(apkPath, outputDir);
    console.log('Extraction complete!');
    
    // List extracted files
    const files = fs.readdirSync(outputDir);
    console.log(`Extracted ${files.length} items`);
    
    // Count by type
    const images = files.filter(f => /\.(png|jpg|jpeg|tga)$/i.test(f));
    const texts = files.filter(f => /\.(txt|json|xml|yaml)$/i.test(f));
    const audios = files.filter(f => /\.(mp3|wav|ogg)$/i.test(f));
    
    console.log(`Images: ${images.length}`);
    console.log(`Text files: ${texts.length}`);
    console.log(`Audio: ${audios.length}`);
    
    // Show some image names
    if (images.length > 0) {
      console.log('\nSample images:');
      images.slice(0, 20).forEach(img => console.log('  - ' + img));
    }
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

extractUnity();
