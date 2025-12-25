
const fs = require('fs');
try {
    const data = fs.readFileSync('rehash_output.txt', 'utf8');
    console.log("--- START OF FILE ---");
    console.log(data);
    console.log("--- END OF FILE ---");
} catch (e) {
    console.error(e);
}
