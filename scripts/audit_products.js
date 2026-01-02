const fs = require('fs');
const path = require('path');

try {
    const dumpPath = path.join(__dirname, '../products_dump.json');
    if (!fs.existsSync(dumpPath)) {
        console.error('products_dump.json not found');
        process.exit(1);
    }

    const rawData = fs.readFileSync(dumpPath, 'utf8');
    const db = JSON.parse(rawData);

    // Check if data structure is valid
    const items = db.data && db.data.items ? db.data.items : [];

    let output = '';
    const log = (msg) => { console.log(msg); output += msg + '\n'; };

    log(`Loaded ${items.length} products from dump.`);

    // Group by groupName
    const param = {};
    items.forEach(item => {
        const group = item.groupName || 'Unknown';
        if (!param[group]) param[group] = [];
        param[group].push({ code: item.code, name: item.name, price: item.price, stock: item.inStock });
    });

    log('\n--- AVAILABLE GROUPS ---');
    Object.keys(param).forEach(group => {
        log(`${group}: ${param[group].length} items`);
    });

    log('\n--- DETAILED LISTING (First 5 In-Stock per group) ---');
    Object.keys(param).forEach(group => {
        log(`\n[${group}]`);
        // Sort by stock desc
        const sorted = param[group].sort((a, b) => b.stock - a.stock);
        sorted.slice(0, 5).forEach(p => {
            log(`  Code: ${p.code} | Price: ${p.price} | Stock: ${p.stock} | Name: ${p.name.trim()}`);
        });
    });

    fs.writeFileSync(path.join(__dirname, '../audit_results.txt'), output);
    console.log('Saved to audit_results.txt');

} catch (e) {
    console.error('Error:', e.message);
}
