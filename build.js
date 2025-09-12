#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Building Polytrack.best...\n');

// Ensure directories exist
const dirs = ['assets', 'dist'];
dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  }
});

try {
  // Build CSS
  console.log('📦 Building Tailwind CSS...');
  execSync('npx tailwindcss -i ./src/input.css -o ./assets/styles.css --minify', { stdio: 'inherit' });
  console.log('✅ CSS built successfully\n');

  // Generate icons if they don't exist
  console.log('🎨 Checking icons...');
  const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];
  const missingIcons = iconSizes.filter(size => !fs.existsSync(`assets/icon-${size}x${size}.png`));
  
  if (missingIcons.length > 0) {
    console.log(`⚠️  Missing icons: ${missingIcons.map(s => `${s}x${s}`).join(', ')}`);
    console.log('💡 Run the favicon generator to create missing icons');
  } else {
    console.log('✅ All icons present\n');
  }

  // Validate manifest
  console.log('📋 Validating manifest...');
  const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
  if (manifest.name && manifest.short_name && manifest.start_url) {
    console.log('✅ Manifest is valid\n');
  } else {
    console.log('⚠️  Manifest validation failed\n');
  }

  // Check Service Worker
  console.log('🔧 Checking Service Worker...');
  if (fs.existsSync('sw.js')) {
    console.log('✅ Service Worker found\n');
  } else {
    console.log('⚠️  Service Worker not found\n');
  }

  // Analyze bundle size
  console.log('📊 Analyzing bundle sizes...');
  const stats = {
    'index.html': getFileSize('index.html'),
    'assets/styles.css': getFileSize('assets/styles.css'),
    'sw.js': getFileSize('sw.js'),
    'manifest.json': getFileSize('manifest.json')
  };

  console.log('\n📈 Bundle Analysis:');
  Object.entries(stats).forEach(([file, size]) => {
    if (size) {
      console.log(`   ${file}: ${size}`);
    }
  });

  // Performance recommendations
  console.log('\n💡 Performance Recommendations:');
  if (stats['assets/styles.css'] && parseFloat(stats['assets/styles.css']) > 50) {
    console.log('   - Consider purging unused CSS classes');
  }
  if (stats['index.html'] && parseFloat(stats['index.html']) > 100) {
    console.log('   - Consider code splitting for large HTML files');
  }
  console.log('   - Enable gzip compression on your server');
  console.log('   - Set proper cache headers for static assets');

  console.log('\n🎉 Build completed successfully!');
  console.log('\n📋 Next steps:');
  console.log('   1. Test the site locally: npm run serve');
  console.log('   2. Generate missing icons if needed');
  console.log('   3. Deploy to your hosting platform');
  console.log('   4. Configure analytics and monitoring');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    const sizeInKB = (stats.size / 1024).toFixed(1);
    return `${sizeInKB} KB`;
  } catch (error) {
    return null;
  }
}