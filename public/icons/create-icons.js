// Simple script to create basic PWA icons
// Run this in browser console or as Node.js script

const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

function createSVGIcon(size) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
        <stop offset="50%" style="stop-color:#8b5cf6;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#a855f7;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad)"/>
    <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.4}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">聖</text>
  </svg>`;
}

// Generate all icon sizes
iconSizes.forEach(size => {
  const svg = createSVGIcon(size);
  console.log(`Icon ${size}x${size}:`);
  console.log(svg);
  console.log('---');
});

console.log('Copy each SVG and convert to PNG using online tools like:');
console.log('- https://convertio.co/svg-png/');
console.log('- https://cloudconvert.com/svg-to-png');
console.log('Save as: icon-72x72.png, icon-96x96.png, etc.');