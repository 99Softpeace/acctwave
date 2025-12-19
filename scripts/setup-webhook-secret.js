const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');

try {
    let content = '';
    if (fs.existsSync(envPath)) {
        content = fs.readFileSync(envPath, 'utf8');
    }

    if (content.includes('WEBHOOK_SIGNING_SECRET=')) {
        console.log('✅ WEBHOOK_SIGNING_SECRET already exists in .env');
        // Extract it to print for the simulation script (redacted)
        const match = content.match(/WEBHOOK_SIGNING_SECRET=(.+)/);
        if (match) {
            console.log(`Current Secret: ${match[1].substring(0, 5)}...`);
        }
    } else {
        const newSecret = crypto.randomBytes(32).toString('hex');
        console.log('Generating new WEBHOOK_SIGNING_SECRET...');
        fs.appendFileSync(envPath, `\nWEBHOOK_SIGNING_SECRET=${newSecret}\n`);
        console.log('✅ Added WEBHOOK_SIGNING_SECRET to .env');
        console.log(`New Secret: ${newSecret}`);
    }
} catch (e) {
    console.error('Error updating .env:', e);
}
