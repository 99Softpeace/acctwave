
const https = require('https');
const fs = require('fs');
require('dotenv').config({ path: '.env' });

const API_KEY = process.env.NCWALLET_API_KEY;
const PIN = process.env.NCWALLET_PIN;

if (!API_KEY) {
    console.error("Missing NCWALLET_API_KEY in .env");
    process.exit(1);
}

const options = {
    hostname: 'ncwallet.africa',
    path: '/api/v1/service/id/data',
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `nc_afr_apikey${API_KEY}`,
        'trnx_pin': PIN || ''
    }
};

console.log("Fetching plans...");

const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            if (res.statusCode !== 200) {
                console.error(`API Error: ${res.statusCode}`);
                console.error(data);
                return;
            }

            const plans = JSON.parse(data);
            let dataList = [];

            // Handle response structure
            if (Array.isArray(plans)) {
                dataList = plans;
            } else if (plans && Array.isArray(plans.plans)) {
                dataList = plans.plans;
            } else if (plans && Array.isArray(plans.data)) {
                dataList = plans.data;
            } else {
                // Fallback search
                for (const key in plans) {
                    if (Array.isArray(plans[key])) {
                        dataList = plans[key];
                        break;
                    }
                }
            }

            console.log(`Found ${dataList.length} total plans.`);

            const mapped = dataList.filter(p => p.status === 'enabled').map(p => {
                let type = 'SME';
                const rawType = (p.data_type || '').toUpperCase();
                if (rawType.includes('CORPORATE') || rawType.includes('CG')) type = 'CG';
                else if (rawType.includes('GIFTING')) type = 'GIFTING';
                else if (rawType.includes('AWOOF')) type = 'AWOOF';
                else if (rawType.includes('CARD')) type = 'DATA CARD';
                else if (rawType.includes('SME')) type = 'SME';

                let price = 0;
                if (typeof p.plan_price === 'string') {
                    price = parseFloat(p.plan_price.replace(/[^\d.]/g, ''));
                } else {
                    price = Number(p.plan_price);
                }

                return {
                    id: p.plan_id,
                    network: p.network,
                    type: type,
                    name: p.plan_size, // simplified name
                    price: price,
                    size: p.plan_size,
                    validity: p.validity
                };
            });

            const tsOutput = `
export interface DataPlan {
    id: number;
    network: 'MTN' | 'AIRTEL' | 'GLO' | '9MOBILE';
    type: 'AWOOF' | 'CG' | 'GIFTING' | 'SME' | 'DATA CARD';
    name: string;
    price: number;
    size: string;
    validity: string;
}

export const STATIC_DATA_PLANS: DataPlan[] = ${JSON.stringify(mapped, null, 4)};
`;

            fs.writeFileSync('src/lib/vtu-plans.ts', tsOutput);
            console.log(`Successfully wrote ${mapped.length} enabled plans to src/lib/vtu-plans.ts`);

        } catch (e) {
            console.error("Error parsing/writing:", e);
            console.log("Raw response (start):", data.substring(0, 100));
        }
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});

req.end();
