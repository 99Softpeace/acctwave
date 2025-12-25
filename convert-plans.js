
const fs = require('fs');

try {
    const raw = fs.readFileSync('ncwallet_plans.json', 'utf8');
    const plans = JSON.parse(raw);

    // Check if it's wrapped in { status: ..., data: [...] } or just [...]
    // The previous output showed an array inside... wait.
    // "    },\n    {\n      "plan_id": 193,"
    // It matched the structure of the JSON. If it's `{"status": "success", "data": [...]}` I need to handle that.
    // The fetch script did `console.log(JSON.stringify(json, null, 2));`
    // Let's assume the root is the object from the API.

    // Actually, based on the `type` output earlier:
    // It ended with `] }`.
    // It likely has a "data" property if it's `{...}`.
    // Looking at the end of the `type` output: `] }` suggests it closes an array then an object.

    let dataList = [];
    if (Array.isArray(plans)) {
        dataList = plans;
    } else if (plans && Array.isArray(plans.plans)) { // NCWallet docs might say 'plans' or 'data'
        dataList = plans.plans;
    } else if (plans && Array.isArray(plans.data)) {
        dataList = plans.data;
    } else {
        // Fallback: iterate keys to find an array
        for (const key in plans) {
            if (Array.isArray(plans[key])) {
                dataList = plans[key];
                break;
            }
        }
    }

    const mapped = dataList.filter(p => p.status === 'enabled').map(p => {
        let type = 'SME';
        const rawType = (p.data_type || '').toUpperCase();
        if (rawType.includes('CORPORATE') || rawType.includes('CG')) type = 'CG';
        else if (rawType.includes('GIFTING')) type = 'GIFTING';
        else if (rawType.includes('AWOOF')) type = 'AWOOF';
        else if (rawType.includes('CARD')) type = 'DATA CARD';
        else if (rawType.includes('SME')) type = 'SME';

        // Parse price: "NGN 380.00" -> 380
        let price = 0;
        if (typeof p.plan_price === 'string') {
            price = parseFloat(p.plan_price.replace(/[^\d.]/g, ''));
        } else {
            price = Number(p.plan_price);
        }

        return {
            id: p.plan_id,
            network: p.network, // "MTN", "9MOBILE", etc.
            type: type,
            name: p.plan_size, // Usually "1 GB"
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
    console.log(`Converted ${mapped.length} plans to src/lib/vtu-plans.ts`);

} catch (e) {
    console.error(e);
}
