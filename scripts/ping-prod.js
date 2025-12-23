
const fetch = globalThis.fetch;
// Node 18+ has native fetch

const WEBHOOK_URL = 'https://www.acctwave.com/api/pf_notify'; // Production

async function testWebhook() {
    console.log(`Pinging ${WEBHOOK_URL} ...`);

    // Minimal payload that looks like a verification ping
    const payload = {
        event: 'ping',
        timestamp: Date.now()
    };

    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // No signature = Verification Ping
            },
            body: JSON.stringify(payload)
        });

        const text = await response.text();
        console.log(`Status: ${response.status}`);
        console.log(`Body: ${text}`);

    } catch (error) {
        console.error('Error pinging webhook:', error.message);
    }
}

testWebhook();
