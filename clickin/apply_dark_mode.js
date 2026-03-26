const fs = require('fs');
const path = require('path');

const walk = (dir) => {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.jsx')) { 
            results.push(file);
        }
    });
    return results;
};

const map = {
    'bg-white': 'bg-white dark:bg-gray-900',
    'bg-gray-50': 'bg-gray-50 dark:bg-gray-950',
    'bg-gray-100': 'bg-gray-100 dark:bg-gray-800',
    'text-gray-900': 'text-gray-900 dark:text-gray-100',
    'text-gray-800': 'text-gray-800 dark:text-gray-200',
    'text-gray-700': 'text-gray-700 dark:text-gray-300',
    'text-gray-600': 'text-gray-600 dark:text-gray-400',
    'text-gray-500': 'text-gray-500 dark:text-gray-400',
    'text-gray-400': 'text-gray-400 dark:text-gray-500',
    'border-gray-100': 'border-gray-100 dark:border-gray-800',
    'border-gray-200': 'border-gray-200 dark:border-gray-700',
    'border-gray-50': 'border-gray-50 dark:border-gray-800',
    'bg-[#F8F9FA]': 'bg-[#F8F9FA] dark:bg-gray-950',
    'bg-white/80': 'bg-white/80 dark:bg-gray-900/80',
    'bg-white/90': 'bg-white/90 dark:bg-gray-900/90',
    'hover:bg-gray-50': 'hover:bg-gray-50 dark:hover:bg-gray-800',
    'hover:bg-gray-100': 'hover:bg-gray-100 dark:hover:bg-gray-700'
};

const customerDir = path.join(process.cwd(), 'app', '(customer)');
const files = walk(customerDir);

let modified = 0;
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    for (const [key, val] of Object.entries(map)) {
        // Prevent doubling up
        if (content.includes(val)) continue;
        
        // Replace exact class boundaries
        const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp('([\"\'\\s`])' + escapeRegex(key) + '(?=[\\s\"\'`\\\\]|$)', 'g');
        content = content.replace(regex, '$1' + val);
    }
    
    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        modified++;
        console.log(`Updated: ${file}`);
    }
});
console.log('Total files modified: ' + modified);
