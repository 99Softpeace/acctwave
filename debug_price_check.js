// Native fetch is available in Node 18+

async function checkPrices() {
    try {
        console.log('Fetching services...');
        const res = await fetch('http://localhost:3000/api/numbers/services?country=US');
        const data = await res.json();

        if (data.success) {
            const discord = data.services.find(s => s.name.toLowerCase().includes('discord'));
            const signal = data.services.find(s => s.name.toLowerCase().includes('signal'));

            console.log('--- Price Check ---');
            if (discord) {
                console.log(`Discord: ${discord.price} (Expected: 1680) - ${discord.price === 1680 ? 'PASS' : 'FAIL'}`);
            } else {
                console.log('Discord: NOT FOUND');
            }

            if (signal) {
                console.log(`Signal:  ${signal.price} (Expected: 1680) - ${signal.price === 1680 ? 'PASS' : 'FAIL'}`);
            } else {
                console.log('Signal:  NOT FOUND');
            }
        } else {
            console.error('Failed to fetch services:', data.error);
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkPrices();
