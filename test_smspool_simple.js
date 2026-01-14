require('dotenv').config();
const API_KEY = process.env.SMSPOOL_API_KEY;

async function run() {
    console.log('API Key:', API_KEY ? (API_KEY.substring(0, 5) + '...') : 'Missing');

    // 1. Get Services for US
    const url = `https://api.smspool.net/service/retrieve_all?key=${API_KEY}&country=1`;
    console.log(`Fetching: ${url.replace(API_KEY, '***')}`);

    try {
        const res = await fetch(url);
        const text = await res.text();
        console.log('Response Status:', res.status);

        // Write raw text to file
        require('fs').writeFileSync('debug_api_raw.txt', text);
        console.log('Raw body saved to debug_api_raw.txt');

        try {
            const json = JSON.parse(text);
            console.log('Parsed Services Count:', Array.isArray(json) ? json.length : 'Not an array');
        } catch (e) {
            console.log('JSON Parse Error:', e.message);
        }
    } catch (e) {
        console.error('Fetch Error:', e);
    }
}

run();
