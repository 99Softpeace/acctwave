const fs = require('fs');
const path = require('path');

const moddedAppsPath = path.join(__dirname, '../src/lib/modded-apps.ts');
const dumpPath = path.join(__dirname, '../products_dump.json');

try {
    // 1. Extract IDs from modded-apps.ts
    const moddedContent = fs.readFileSync(moddedAppsPath, 'utf8');
    const idRegex = /'(\d{6})':\s*{/g;
    const localIds = [];
    let match;
    while ((match = idRegex.exec(moddedContent)) !== null) {
        localIds.push(match[1]);
    }
    console.log(`Found ${localIds.length} IDs in modded-apps.ts`);

    // 2. Load Dump
    if (!fs.existsSync(dumpPath)) {
        console.log('Dump file not ready yet.');
        process.exit(0);
    }
    const dump = JSON.parse(fs.readFileSync(dumpPath, 'utf8'));
    const remoteItems = dump.data.items || [];
    const remoteMap = new Map(remoteItems.map(i => [i.code, i]));
    console.log(`Loaded ${remoteItems.length} IDs from dump.`);

    // 3. Compare
    const missing = [];
    localIds.forEach(id => {
        if (!remoteMap.has(id)) {
            missing.push(id);
        }
    });

    console.log(`\n--- MISSING PRODUCTS (${missing.length}) ---`);
    console.log(missing.join(', '));

    // 4. Suggest Replacements (Simple Group check)
    // Create a lookup of remote items by group/category
    // This is just to help manual mapping later

} catch (e) {
    console.error(e);
}
