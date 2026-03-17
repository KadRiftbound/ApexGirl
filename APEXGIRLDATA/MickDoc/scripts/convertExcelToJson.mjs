import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import xlsx from 'xlsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const excelFilePath = path.join(__dirname, '../artists-and-records-1.9.xlsx');

const workbook = xlsx.readFile(excelFilePath);

function processRow(row, id) {
  const skills = [
    row['Skill 1'],
    row['Skill 2'],
    row['Skill 3']
  ].filter(Boolean);

  const thoughts = row['Micks Thoughts are they Good'] || '';
  const buildWorthy = row['Skill Build Worthy'] || '';
  
  let build = '';
  if (buildWorthy.toLowerCase() === 'yes' || thoughts.toLowerCase() === 'yes') {
    build = '';
  } else if (thoughts.toLowerCase().includes('defensive')) {
    build = 'Damage Reduction';
  } else if (thoughts.toLowerCase().includes('rally')) {
    build = 'Rally';
  } else if (thoughts.toLowerCase().includes('single')) {
    build = 'Single Car';
  } else if (thoughts.toLowerCase().includes('offensive')) {
    build = 'Offensive Car';
  } else if (thoughts.toLowerCase().includes('hq')) {
    build = 'HQ Defense';
  }

  return {
    id,
    name: row.Name || 'Unknown Artist',
    group: row.Group || '',
    rank: row.Rank || '',
    position: row.Position || '',
    genre: row.Genre || 'Various',
    skills,
    description: `A talented ${row.Position || 'artist'} from ${row.Group || 'various groups'}.`,
    rating: null,
    thoughts: thoughts || '',
    build,
    photos: 'Universal'
  };
}

const allArtists = [];
let currentId = 1;

workbook.SheetNames.forEach(sheetName => {
  const worksheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(worksheet);
  
  console.log(`Processing ${sheetName}: ${data.length} artists`);
  
  data.forEach(row => {
    allArtists.push(processRow(row, currentId++));
  });
});

allArtists.sort((a, b) => {
  const rankOrder = { UR: 0, SSR: 1, SR: 2 };
  const aRank = rankOrder[a.rank] ?? 99;
  const bRank = rankOrder[b.rank] ?? 99;
  if (aRank !== bRank) return aRank - bRank;
  const genreCompare = a.genre.localeCompare(b.genre);
  if (genreCompare !== 0) return genreCompare;
  const positionCompare = a.position.localeCompare(b.position);
  if (positionCompare !== 0) return positionCompare;
  return a.name.localeCompare(b.name);
});

const outputPath = path.join(__dirname, '../src/data/artists.json');
fs.writeFileSync(outputPath, JSON.stringify(allArtists, null, 2));

console.log(`Successfully converted all Excel data to JSON.`);
console.log(`Total artists: ${allArtists.length}`);
console.log(`Output saved to: ${outputPath}`);

const rankCounts = allArtists.reduce((acc, artist) => {
  acc[artist.rank] = (acc[artist.rank] || 0) + 1;
  return acc;
}, {});
console.log('Rank distribution:', rankCounts);
