
const fs = require('fs');
try {
    const data = fs.readFileSync('fetch_test_output.txt', 'utf16le'); // PS Default
    console.log(data);
} catch (e) {
    try {
        const data8 = fs.readFileSync('fetch_test_output.txt', 'utf8');
        console.log(data8);
    } catch (e2) {
        console.error(e2);
    }
}
