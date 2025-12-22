// Native fetch in Node 18+

async function sendTest() {
    const url = 'http://localhost:3000/api/pocketfi/webhook'; // Local URL

    // Payload matching a real PocketFi event
    const payload = {
        event: 'transfer.success',
        data: {
            reference: `LOCAL-TEST-${Date.now()}`,
            amount: 700,
            destination_account_number: '7000437096', // Use the known account
            account_number: '0123456789'
        }
    };

    try {
        console.log('Sending Webhook to:', url);
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-pocketfi-signature': 'LOCAL-DEBUG-SIG'
            },
            body: JSON.stringify(payload)
        });

        console.log('Status:', res.status);
        console.log('Response:', await res.text());

    } catch (e) {
        console.error('Fetch error:', e.message);
    }
}

sendTest();
