
// Native fetch in Node 18+

async function pingProd() {
    try {
        console.log('Pinging https://www.acctwave.com/api/pf_notify ...');
        const res = await fetch('https://www.acctwave.com/api/pf_notify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                event: 'ping',
                data: { message: 'Can you hear me?', timestamp: Date.now() }
            })
        });

        console.log('Status:', res.status);
        console.log('Text:', await res.text());
    } catch (e) {
        console.error('Ping Failed:', e);
    }
}

pingProd();
