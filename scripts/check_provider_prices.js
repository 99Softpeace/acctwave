const { getServices } = require('../src/lib/smm');
require('dotenv').config({ path: '.env.local' });

// Polyfill fetch
if (!global.fetch) {
    global.fetch = require('node-fetch');
}

async function checkPrices() {
    try {
        const services = await getServices();
        console.log('Total Services:', services.length);

        // Find a few common services to compare
        const commonTerms = ['Instagram Followers', 'Instagram Likes', 'TikTok Views'];

        commonTerms.forEach(term => {
            const match = services.find(s => s.name.includes(term));
            if (match) {
                console.log(`\nService: ${match.name}`);
                console.log(`Provider Rate (USD): ${match.rate}`);
                console.log(`Category: ${match.category}`);
            }
        });

    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkPrices();
