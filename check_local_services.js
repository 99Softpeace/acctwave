const http = require('http');

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/numbers/services?country=US',
    method: 'GET'
};

const req = http.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log(`STATUS: ${res.statusCode}`);
        if (res.statusCode === 200) {
            try {
                const json = JSON.parse(data);
                console.log(`Success: ${json.success}`);
                if (json.services) {
                    console.log(`Services found: ${json.services.length}`);
                    if (json.services.length > 0) {
                        console.log(`Sample: ${json.services[0].name}`);
                    }
                }
            } catch (e) {
                console.log('Body is not JSON');
            }
        } else {
            console.log('Body:', data.substring(0, 200));
        }
    });
});

req.on('error', (e) => {
    console.error(`Problem: ${e.message}`);
});

req.end();
