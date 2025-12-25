
const fs = require('fs');
try {
    const data = fs.readFileSync('hardcoded_output.txt', 'utf8');
    console.log("--- START ---");
    console.log(data);
    console.log("--- END ---");
} catch (e) {
    console.error(e);
}
