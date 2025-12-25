
const fs = require('fs');
try {
    const data = fs.readFileSync('verify-regenerated-key.js', 'utf8');
    console.log(data);
} catch (e) {
    console.log("File not found or deleted");
}
