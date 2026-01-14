const fs = require('fs');
try {
    const content = fs.readFileSync('api_response_whatsapp.json', 'utf8');
    const data = JSON.parse(content);

    // Check where the services are
    // Based on previous view, it has "services": [...]
    const services = data.services || data;

    if (!Array.isArray(services)) {
        console.log('Not an array');
        process.exit(1);
    }

    const targets = ['whatsapp', 'telegram', 'facebook', 'twitter', 'google', 'instagram', 'tiktok', 'discord'];

    targets.forEach(t => {
        const found = services.find(s => s.name.toLowerCase().includes(t));
        if (found) {
            console.log(`${t}: ${found.id} (${found.name})`);
        } else {
            console.log(`${t}: NOT FOUND`);
        }
    });

} catch (e) {
    console.error(e);
}
