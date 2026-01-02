const fs = require('fs');
const logContent = fs.readFileSync('debug_products_ua.json', 'utf8');

const keyword = 'Instagram';
const regex = new RegExp(keyword, 'i');
const idx = logContent.search(regex);

if (idx !== -1) {
    console.log(`\nFound "${keyword}" at index ${idx}`);
    // Print 500 chars before and after
    const start = Math.max(0, idx - 500);
    const end = Math.min(logContent.length, idx + 2000);
    console.log('--- CONTEXT ---');
    console.log(logContent.substring(start, end));
    console.log('--- END CONTEXT ---');
} else {
    console.log(`Keyword "${keyword}" not found.`);
}
