const axios = require('axios');

async function testReferral() {
    const timestamp = Date.now();
    const referrerEmail = `ref_${timestamp}@test.com`;
    const refereeEmail = `user_${timestamp}@test.com`;
    const password = 'password123';

    try {
        // 1. Register Referrer
        console.log('Registering Referrer...');
        await axios.post('http://localhost:3000/api/auth/register', {
            name: 'Referrer',
            email: referrerEmail,
            password: password
        });

        // 2. Get Referrer's code (via debug endpoint)
        let res = await axios.get('http://localhost:3000/api/debug/last-user');
        const referrerCode = res.data.referralCode;
        console.log('Referrer Code:', referrerCode);

        if (!referrerCode) {
            console.error('Failed to get referrer code');
            return;
        }

        // 3. Register Referee with code
        console.log('Registering Referee with code...');
        await axios.post('http://localhost:3000/api/auth/register', {
            name: 'Referee',
            email: refereeEmail,
            password: password,
            referralCode: referrerCode
        });

        // 4. Verify Link
        res = await axios.get('http://localhost:3000/api/debug/last-user');
        const lastUser = res.data;

        console.log('Last User (Referee):', lastUser);

        if (lastUser.email === refereeEmail && lastUser.referredBy) {
            console.log('SUCCESS: Referee is linked to:', lastUser.referredBy);
        } else {
            console.error('FAILURE: Referee is NOT linked correctly.');
            console.error('Expected email:', refereeEmail);
            console.error('Actual email:', lastUser.email);
            console.error('ReferredBy:', lastUser.referredBy);
        }

    } catch (e) {
        console.error('Error during test:', e.response?.data || e.message);
    }
}

testReferral();
