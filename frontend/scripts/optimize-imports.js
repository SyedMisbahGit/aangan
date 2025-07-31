const fs = require('fs');
const path = require('path');
const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');
const glob = require('glob');

// Configuration
const CONFIG = {
  srcDir: path.join(process.cwd(), 'src'),
  ignorePatterns: ['**/node_modules/**', '**/__tests__/**', '**/*.test.*', '**/*.spec.*'],
  lazyLoadByDefault: ['**/pages/**', '**/screens/**'],
  neverLazyLoad: ['**/components/common/**', '**/hooks/**', '**/utils/**'],
  dryRun: process.argv.includes('--dry-run'),
};

// Track changes
const changes = {
  filesProcessed: 0,
  filesModified: 0,
  componentsConverted: 0,
};

// Process a single file
async function processFile(filePath) {
  try {
    changes.filesProcessed++;
    const code = await fs.promises.readFile(filePath, 'utf8');
    const ast = parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript', 'classProperties', 'dynamicImport'],
    });

    let hasChanges = false;
    const importsToAdd = [];
    const importsToRemove = [];

    // Find imports to convert to lazy
    traverse(ast, {
      ImportDeclaration(path) {
        const source = path.node.source.value;
        if (!source.startsWith('.')) return;
        
        path.node.specifiers.forEach(specifier => {
          if (t.isImportDefaultSpecifier(specifier)) {
            const componentName = specifier.local.name;
            const importPath = path.resolve(path.dirname(filePath), source);
            
            // Skip if in neverLazyLoad
            if (CONFIG.neverLazyLoad.some(pattern => 
              minimatch(importPath, path.join(process.cwd(), pattern)))) {
              return;
            }
            
            // Convert to lazy import
            const lazyVarName = `Lazy${componentName}`;
            const lazyImport = t.variableDeclaration('const', [
              t.variableDeclarator(
                t.identifier(lazyVarName),
                t.callExpression(
                  t.identifier('React.lazy'),
                  [t.arrowFunctionExpression(
                    [],
                    t.callExpression(t.import(), [t.stringLiteral(source)])
                  )]
                )
              )
            ]);
            
            importsToAdd.push({ lazyImport, lazyVarName, componentName });
            importsToRemove.push(path);
            hasChanges = true;
            changes.componentsConverted++;
          }
        });
      }
    });

    // Apply changes if needed
    if (hasChanges && !CONFIG.dryRun) {
      // Add new lazy imports
      const newImports = importsToAdd.map(({ lazyImport }) => 
        generate(lazyImport).code
      ).join('\n');
      
      // Remove old imports
      importsToRemove.forEach(path => path.remove());
      
      // Update component usages
      traverse(ast, {
        JSXIdentifier(path) {
          const component = importsToAdd.find(imp => 
            imp.componentName === path.node.name
          );
          if (component) {
            path.node.name = component.lazyVarName;
          }
        }
      });
      
      // Generate new code
      const output = generate(ast, {
        retainLines: true,
        comments: true,
      }).code;
      
      // Write changes
      await fs.promises.writeFile(filePath, output);
      changes.filesModified++;
    }
    
    return hasChanges;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
}

// Main function
async function main() {
  console.log('🚀 Starting code splitting optimization...');
  
  // Find all JS/TS/JSX/TSX files
  const files = glob.sync('**/*.{js,jsx,ts,tsx}', {
    cwd: CONFIG.srcDir,
    ignore: CONFIG.ignorePatterns,
    absolute: true,
  });
  
  // Process each file
  for (const file of files) {
    await processFile(file);
  }
  
  // Print summary
  console.log('\n📊 Optimization Summary:');
  console.log(`- Files processed: ${changes.filesProcessed}`);
  console.log(`- Files modified: ${changes.filesModified}`);
  console.log(`- Components converted to lazy: ${changes.componentsConverted}`);
  
  if (CONFIG.dryRun) {
    console.log('\nℹ️ Dry run completed. No files were modified.');
  } else {
    console.log('\n✅ Optimization completed successfully!');
  }
}

// Run the script
main().catch(console.error);
