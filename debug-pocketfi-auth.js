require('dotenv').config({ path: '.env.local' });
require('dotenv').config(); // Fallback to .env

const setup = () => {
    const POCKETFI_API_KEY = process.env.POCKETFI_API_KEY;
    const POCKETFI_SECRET_KEY = process.env.POCKETFI_SECRET_KEY;

    console.log('--- Auth Debug ---');
    console.log('POCKETFI_API_KEY:', POCKETFI_API_KEY ? `${POCKETFI_API_KEY.substring(0, 5)}... (len ${POCKETFI_API_KEY.length})` : 'MISSING');
    console.log('POCKETFI_SECRET_KEY:', POCKETFI_SECRET_KEY ? `${POCKETFI_SECRET_KEY.substring(0, 5)}... (len ${POCKETFI_SECRET_KEY.length})` : 'MISSING');

    return { POCKETFI_API_KEY, POCKETFI_SECRET_KEY };
};

const testAuth = async (keyName, key, url) => {
    if (!key) {
        console.log(`[${keyName}] Skipped (Missing)`);
        return;
    }

    console.log(`\nTesting ${keyName} against ${url}...`);
    try {
        const response = await fetch(url, {
            method: 'GET', // Using GET on something safe like verify or just checking auth
            headers: {
                'Authorization': `Bearer ${key}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        const data = await response.json();
        console.log(`Status: ${response.status}`);
        console.log('Response:', JSON.stringify(data, null, 2));

        if (response.status === 401) {
            console.log(`❌ ${keyName} is INVALID or not authorized for this endpoint.`);
        } else {
            console.log(`✅ ${keyName} seems to work (or at least not 401).`);
        }
    } catch (e) {
        console.error(`Error testing ${keyName}:`, e.message);
    }
};

const run = async () => {
    const { POCKETFI_API_KEY, POCKETFI_SECRET_KEY } = setup();

    // Test 1: Try to create a DVA with API Key (Public) - this is what the app does currently
    // We'll use a mocked payload since we just want to see if we get 401 or 400
    const createUrl = 'https://api.pocketfi.ng/api/v1/virtual-accounts/create';

    console.log('\n--- Test 1: Create DVA with POCKETFI_API_KEY (Current Implementation) ---');
    await testAuth('POCKETFI_API_KEY', POCKETFI_API_KEY, createUrl);

    // Test 2: Try to create DVA with SECRET Key - this is likely what is needed
    console.log('\n--- Test 2: Create DVA with POCKETFI_SECRET_KEY (Proposed Fix) ---');
    await testAuth('POCKETFI_SECRET_KEY', POCKETFI_SECRET_KEY, createUrl);
};

run();
