const fs = require('fs');
const path = require('path');

try {
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        if (content.includes('GMAIL_USER')) {
            console.log('GMAIL_USER found in .env');
        } else {
            console.log('GMAIL_USER NOT found in .env');
        }
    } else {
        console.log('.env file not found');
    }

    const localEnvPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(localEnvPath)) {
        console.log('.env.local found');
    } else {
        console.log('.env.local NOT found');
    }
} catch (error) {
    console.error('Error reading env files:', error);
}
