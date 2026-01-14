const http = require('http');

http.get('http://localhost:3000/api/numbers/services?country=US', (resp) => {
    let data = '';

    resp.on('data', (chunk) => {
        data += chunk;
    });

    resp.on('end', () => {
        try {
            const json = JSON.parse(data);
            console.log('Success:', json.success);
            console.log('Services Count:', json.services.length);
            console.log('Countries Count:', json.countries.length);

            const whatsapp = json.services.find(s => s.name === 'WhatsApp');
            if (whatsapp) {
                console.log('WhatsApp Price:', whatsapp.price);
            } else {
                console.log('WhatsApp: NOT FOUND');
            }

            const telegram = json.services.find(s => s.name === 'Telegram');
            if (telegram) console.log('Telegram Price:', telegram.price);

        } catch (e) {
            console.error('Error parsing JSON:', e.message);
            console.log('Raw Data Preview:', data.substring(0, 100));
        }
    });

}).on("error", (err) => {
    console.log("Error: " + err.message);
});
