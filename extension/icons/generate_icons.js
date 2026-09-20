import fs from 'fs';
import path from 'path';

// Node script to generate SVG fallback icon files for extension
const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="128" height="128">
  <rect width="100" height="100" rx="20" fill="#4f46e5"/>
  <circle cx="50" cy="50" r="22" fill="none" stroke="#06b6d4" stroke-width="8"/>
  <circle cx="50" cy="50" r="10" fill="#ffffff"/>
</svg>`;

const dir = path.join(process.cwd(), 'extension', 'icons');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

fs.writeFileSync(path.join(dir, 'icon.svg'), iconSvg);
console.log('Generated extension icons successfully.');
