require('dotenv').config({ path: '.env.local' });
require('dotenv').config();
const fs = require('fs');

const BASE_URL = 'https://ncwallet.africa/api/v1';

async function fetchPlans() {
    const apiKey = process.env.NCWALLET_API_KEY;
    if (!apiKey) {
        console.error('Missing NCWALLET_API_KEY');
        return;
    }

    console.log('Using Key:', apiKey.substring(0, 10) + '...');

    try {
        const res = await fetch(`${BASE_URL}/service/id/data`, {
            method: 'GET',
            headers: {
                'Authorization': `nc_afr_apikey${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Status:', res.status);
        const data = await res.json();

        fs.writeFileSync('ncwallet_plans.json', JSON.stringify(data, null, 2));
        console.log('Plans saved to ncwallet_plans.json');

    } catch (error) {
        console.error('Fetch Failed:', error);
    }
}

fetchPlans();
