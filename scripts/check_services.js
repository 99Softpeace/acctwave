const { getServices } = require('../src/lib/smm');

// Mock environment variables if needed, or rely on dotenv
require('dotenv').config({ path: '.env.local' });

async function checkServices() {
    try {
        console.log('Fetching services from API...');
        const services = await getServices();
        console.log(`Successfully fetched ${services.length} services.`);

        // Print the first 5 services to check structure and content
        console.log('Sample Services:');
        console.log(JSON.stringify(services.slice(0, 5), null, 2));

        // Check if we can find a match for "Instagram Channel Members"
        const match = services.find(s => s.name.includes('Instagram Channel Members'));
        if (match) {
            console.log('Found potential match:', match);
        } else {
            console.log('No direct match found for "Instagram Channel Members"');
        }

    } catch (error) {
        console.error('Error fetching services:', error.message);
    }
}

// Mock fetch for Node.js environment if not available (Next.js polyfills it, but node script might need it)
if (!global.fetch) {
    console.log('Polyfilling fetch...');
    global.fetch = require('node-fetch');
}

checkServices();
