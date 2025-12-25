
const fs = require('fs');
try {
    const data = fs.readFileSync('debug_case_output.txt', 'utf8');
    console.log(data);
} catch (e) { console.error(e); }
