
const fs = require('fs');
const file = process.argv[2];
try {
    const data = fs.readFileSync(file, 'utf8');
    console.log(`--- READ: ${file} ---`);
    console.log(data);
    console.log("--- END ---");
} catch (e) {
    console.error(`Error reading ${file}: ${e.message}`);
}
