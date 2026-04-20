const fs = require('fs');
const path = require('path');

const IGNORE_DIRS = ['node_modules', '.git', '.expo', 'dist', 'build', 'public', 'assets', 'scratch', '.agents', 'ui'];
const FILE_EXTS = ['.js', '.jsx', '.ts', '.tsx'];

const LINE_LIMIT_FILE = 200; // Let's lower limit to find files that might need refactor (Component 100-250 lines)
const LINE_LIMIT_WARNING = 150;

function scanDirectory(dirPath, results) {
    if (!fs.existsSync(dirPath)) return;
    
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
        const fullPath = path.join(dirPath, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            // specifically ignore UI folder in components
            if (file === 'ui' && dirPath.includes('components')) continue;

            if (!IGNORE_DIRS.includes(file)) {
                scanDirectory(fullPath, results);
            }
        } else {
            const ext = path.extname(file);
            if (FILE_EXTS.includes(ext)) {
                const content = fs.readFileSync(fullPath, 'utf-8');
                const lineCount = content.split('\n').length;
                
                results.push({
                    file: fullPath,
                    lines: lineCount,
                    isOversized: lineCount >= LINE_LIMIT_FILE,
                    isWarning: lineCount >= LINE_LIMIT_WARNING && lineCount < LINE_LIMIT_FILE,
                });
            }
        }
    }
}

const rootDir = process.cwd();
const results = [];

scanDirectory(rootDir, results);

results.sort((a, b) => b.lines - a.lines);

console.log('--- CLEAN CODE & ARCHITECTURE SCAN REPORT ---');
console.log('\n🔴 OVERSIZED FILES (>' + LINE_LIMIT_FILE + ' lines):');
const oversized = results.filter(r => r.isOversized);
if (oversized.length === 0) console.log('  None! Great job.');
oversized.forEach(r => console.log(`  - ${path.relative(rootDir, r.file)}: ${r.lines} lines`));

console.log('\n🟡 WARNING FILES (' + LINE_LIMIT_WARNING + '-' + LINE_LIMIT_FILE + ' lines):');
const warnings = results.filter(r => r.isWarning);
if (warnings.length === 0) console.log('  None!');
warnings.forEach(r => console.log(`  - ${path.relative(rootDir, r.file)}: ${r.lines} lines`));

console.log('\n🟢 ARCHITECTURE CHECK:');
const dirs = [
    { name: 'app', p: 'app' },
    { name: 'components', p: 'src/components' },
    { name: 'services', p: 'src/services' },
    { name: 'hooks', p: 'src/hooks' },
    { name: 'utils', p: 'src/utils' },
    { name: 'types', p: 'src/types' }
];

dirs.forEach(d => {
    const dPath = path.join(rootDir, d.p);
    if (fs.existsSync(dPath)) {
        console.log(`  - [OK] ${d.name}/ exists`);
    } else {
        console.log(`  - [MISSING] ${d.name}/ directory not found`);
    }
});

console.log('\nTOP 10 LARGEST FILES (Excluding UI library):');
results.slice(0, 10).forEach(r => console.log(`  - ${path.relative(rootDir, r.file)}: ${r.lines} lines`));
