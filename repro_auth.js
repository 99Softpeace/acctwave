const https = require('https');
const dotenv = require('dotenv');
dotenv.config();

const email = process.env.TEXTVERIFIED_EMAIL;
const apiKey = process.env.TEXTVERIFIED_API_KEY;

console.log('Credentials:', { email, apiKey: apiKey ? '***' : 'missing' });

async function getBearerToken() {
    console.log('Generating new TextVerified Bearer Token...');

    const authString = Buffer.from(`${email}:${apiKey}`).toString('base64');

    // Using native fetch if node 18+ or https request
    // Let's use https request to be enviroment agnostic here or assume fetch
    // Implementing with https to be safe and verbose

    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'www.textverified.com',
            port: 443,
            path: '/api/v2/authentication',
            method: 'POST',
            headers: {
                'Authorization': `Basic ${authString}`,
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0'
            }
        };

        const req = https.request(options, (res) => {
            console.log(`Status: ${res.statusCode}`);
            let data = '';
            res.on('data', d => data += d);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    console.log('Success Body:', data);
                    resolve(data);
                } else {
                    console.error('Error Body:', data);
                    reject(new Error(`Status ${res.statusCode}`));
                }
            });
        });

        req.on('error', e => reject(e));
        req.end();
    });
}

getBearerToken().catch(e => console.error('Main Error:', e));
