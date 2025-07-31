const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const glob = require('glob');
const { promisify } = require('util');
const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const imageminWebp = require('imagemin-webp');
const imageminSvgo = require('imagemin-svgo');

// Promisify fs methods
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const stat = promisify(fs.stat);

// Configuration
const CONFIG = {
  // Source directories to search for images
  srcDirs: [
    path.join(process.cwd(), 'public'),
    path.join(process.cwd(), 'src', 'assets'),
  ],
  
  // Output directory for optimized images
  outputDir: path.join(process.cwd(), 'public', 'optimized'),
  
  // File patterns to include
  include: ['**/*.{jpg,jpeg,png,svg,gif,webp}'],
  
  // File patterns to exclude
  exclude: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/optimized/**',
    '**/*.min.*',
  ],
  
  // Image optimization settings
  quality: 80, // Default quality (0-100)
  
  // Resize settings (set to null to disable resizing)
  maxWidth: 2000, // Maximum width in pixels
  maxHeight: 2000, // Maximum height in pixels
  
  // WebP conversion settings
  convertToWebP: true, // Convert images to WebP format
  webpQuality: 75, // WebP quality (0-100)
  
  // SVG optimization settings
  svgo: {
    plugins: [
      { removeViewBox: false },
      { cleanupIDs: false },
      { removeDimensions: true },
    ],
  },
  
  // Whether to replace original files (false creates new files with .min extension)
  replaceOriginal: false,
  
  // Whether to run in dry-run mode (no files will be modified)
  dryRun: process.argv.includes('--dry-run'),
  
  // Whether to show debug output
  debug: process.argv.includes('--debug'),
};

// Track optimization results
const results = {
  totalProcessed: 0,
  totalOptimized: 0,
  totalSkipped: 0,
  totalErrors: 0,
  totalOriginalSize: 0,
  totalOptimizedSize: 0,
  files: [],
};

/**
 * Format file size in a human-readable format
 */
function formatFileSize(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Get file size in bytes
 */
async function getFileSize(filePath) {
  try {
    const stats = await stat(filePath);
    return stats.size;
  } catch (error) {
    console.error(`Error getting file size for ${filePath}:`, error);
    return 0;
  }
}

/**
 * Optimize a single image file
 */
async function optimizeImage(filePath) {
  const startTime = Date.now();
  const relativePath = path.relative(process.cwd(), filePath);
  const extname = path.extname(filePath).toLowerCase();
  const filename = path.basename(filePath, extname);
  const dirname = path.dirname(filePath);
  
  // Skip if already optimized
  if (filename.endsWith('.min') || filename.endsWith('.optimized')) {
    if (CONFIG.debug) {
      console.log(`Skipping already optimized file: ${relativePath}`);
    }
    return { skipped: true, reason: 'Already optimized' };
  }
  
  // Read the original file
  let originalSize;
  try {
    originalSize = await getFileSize(filePath);
    if (originalSize === 0) {
      throw new Error('File is empty');
    }
  } catch (error) {
    console.error(`Error reading file ${relativePath}:`, error);
    return { error: error.message };
  }
  
  // Create output directory if it doesn't exist
  const outputDir = CONFIG.replaceOriginal ? dirname : CONFIG.outputDir;
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Determine output path
  const outputExt = CONFIG.convertToWebP && extname !== '.svg' ? '.webp' : extname;
  const outputFilename = CONFIG.replaceOriginal 
    ? `${filename}${outputExt}`
    : `${filename}.min${outputExt}`;
  const outputPath = path.join(outputDir, outputFilename);
  
  try {
    let optimizedSize = 0;
    
    // Process different image types
    if (extname === '.svg') {
      // Optimize SVG
      const svgContent = await readFile(filePath, 'utf8');
      const result = await imagemin.buffer(Buffer.from(svgContent), {
        plugins: [
          imageminSvgo(CONFIG.svgo)
        ]
      });
      
      if (!CONFIG.dryRun) {
        await writeFile(outputPath, result);
      }
      
      optimizedSize = result.length;
    } else {
      // Process raster images with sharp
      let image = sharp(filePath);
      
      // Get image metadata
      const metadata = await image.metadata();
      
      // Resize if needed
      if (CONFIG.maxWidth || CONFIG.maxHeight) {
        const width = Math.min(metadata.width, CONFIG.maxWidth || Infinity);
        const height = Math.min(metadata.height, CONFIG.maxHeight || Infinity);
        
        if (width < metadata.width || height < metadata.height) {
          image = image.resize(width, height, {
            fit: 'inside',
            withoutEnlargement: true,
          });
        }
      }
      
      // Convert to WebP if enabled
      if (CONFIG.convertToWebP && extname !== '.gif') {
        image = image.webp({ quality: CONFIG.webpQuality });
      } else if (extname === '.jpg' || extname === '.jpeg') {
        image = image.jpeg({ quality: CONFIG.quality, mozjpeg: true });
      } else if (extname === '.png') {
        image = image.png({ quality: CONFIG.quality, compressionLevel: 9 });
      } else if (extname === '.gif') {
        // Skip GIF optimization for now as it requires additional handling
        return { skipped: true, reason: 'GIF optimization not supported' };
      }
      
      // Apply additional optimizations
      const buffer = await image.toBuffer();
      const optimizedBuffer = await imagemin.buffer(buffer, {
        plugins: [
          imageminMozjpeg({ quality: CONFIG.quality }),
          imageminPngquant({
            quality: [CONFIG.quality / 100, CONFIG.quality / 100],
          }),
          imageminWebp({ quality: CONFIG.webpQuality }),
        ],
      });
      
      if (!CONFIG.dryRun) {
        await writeFile(outputPath, optimizedBuffer);
      }
      
      optimizedSize = optimizedBuffer.length;
    }
    
    // Calculate savings
    const savings = originalSize - optimizedSize;
    const savingsPercent = ((savings / originalSize) * 100).toFixed(2);
    
    // Update results
    results.totalOriginalSize += originalSize;
    results.totalOptimizedSize += optimizedSize;
    results.totalOptimized++;
    
    const result = {
      file: relativePath,
      originalSize,
      optimizedSize,
      savings,
      savingsPercent,
      outputPath: path.relative(process.cwd(), outputPath),
      time: Date.now() - startTime,
    };
    
    results.files.push(result);
    
    if (CONFIG.debug) {
      console.log(`\n✅ Optimized: ${relativePath}`);
      console.log(`   Original: ${formatFileSize(originalSize)}`);
      console.log(`   Optimized: ${formatFileSize(optimizedSize)}`);
      console.log(`   Savings: ${formatFileSize(savings)} (${savingsPercent}%)`);
      console.log(`   Time: ${result.time}ms`);
    }
    
    return result;
  } catch (error) {
    console.error(`Error optimizing ${relativePath}:`, error);
    results.totalErrors++;
    return { error: error.message };
  }
}

/**
 * Process all images in the source directories
 */
async function processImages() {
  console.log('🚀 Starting image optimization...\n');
  
  // Find all image files
  const files = [];
  for (const srcDir of CONFIG.srcDirs) {
    if (!fs.existsSync(srcDir)) continue;
    
    for (const pattern of CONFIG.include) {
      const matches = glob.sync(pattern, {
        cwd: srcDir,
        absolute: true,
        nodir: true,
        ignore: CONFIG.exclude,
      });
      
      files.push(...matches);
    }
  }
  
  // Remove duplicates
  const uniqueFiles = [...new Set(files)];
  results.totalProcessed = uniqueFiles.length;
  
  if (uniqueFiles.length === 0) {
    console.log('No images found to optimize.');
    return;
  }
  
  console.log(`Found ${uniqueFiles.length} images to process.\n`);
  
  // Process each file
  for (const file of uniqueFiles) {
    await optimizeImage(file);
  }
  
  // Print summary
  printSummary();
}

/**
 * Print optimization summary
 */
function printSummary() {
  const totalSavings = results.totalOriginalSize - results.totalOptimizedSize;
  const totalSavingsPercent = results.totalOriginalSize > 0
    ? (totalSavings / results.totalOriginalSize * 100).toFixed(2)
    : 0;
  
  console.log('\n📊 Optimization Summary:');
  console.log('---------------------');
  console.log(`Total images processed: ${results.totalProcessed}`);
  console.log(`Images optimized: ${results.totalOptimized}`);
  console.log(`Images skipped: ${results.totalSkipped}`);
  console.log(`Errors: ${results.totalErrors}`);
  console.log(`Total original size: ${formatFileSize(results.totalOriginalSize)}`);
  console.log(`Total optimized size: ${formatFileSize(results.totalOptimizedSize)}`);
  console.log(`Total savings: ${formatFileSize(totalSavings)} (${totalSavingsPercent}%)`);
  
  // Print top 5 savings
  if (results.files.length > 0) {
    console.log('\n🏆 Top 5 savings:');
    results.files
      .sort((a, b) => b.savings - a.savings)
      .slice(0, 5)
      .forEach((file, index) => {
        console.log(`  ${index + 1}. ${file.file}: ${formatFileSize(file.savings)} (${file.savingsPercent}%)`);
      });
  }
  
  if (CONFIG.dryRun) {
    console.log('\nℹ️  Dry run completed. No files were modified.');
  } else {
    console.log('\n✅ Optimization completed successfully!');
  }
}

// Run the script
processImages().catch(console.error);
