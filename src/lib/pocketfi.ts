const POCKETFI_API_KEY = process.env.POCKETFI_API_KEY || '';
const BASE_URL = 'https://api.pocketfi.ng/api/v1';

export async function initializePayment(email: string, amount: number, reference: string) {
    const url = `${BASE_URL}/checkout/request`;
    console.log(`PocketFi: Initializing payment at ${url}`);

    // Extract name parts or use defaults
    const nameParts = (email.split('@')[0] || 'User').split('.');
    const firstName = nameParts[0] || 'User';
    const lastName = nameParts[1] || 'Customer';

    // Extract Business ID from API Key (Format: ID|SECRET)
    const businessId = POCKETFI_API_KEY.split('|')[0];

    const payload = {
        first_name: firstName,
        last_name: lastName,
        phone: `080${Math.floor(Math.random() * 90000000 + 10000000)}`, // Generate random valid-looking phone
        business_id: businessId,
        email: email,
        amount: amount.toString(), // API expects string
        redirect_link: `${process.env.NEXTAUTH_URL}/dashboard/fund-wallet` // Required by API
    };

    console.log('--- POCKETFI PAYLOAD START ---');
    console.log(JSON.stringify(payload, null, 2));
    console.log('--- POCKETFI PAYLOAD END ---');

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${POCKETFI_API_KEY}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`PocketFi API Error (${response.status}): ${errorText}`);
        throw new Error(`Failed to initialize payment: ${response.status} - ${errorText}`);
    }

    return response.json();
}

export async function verifyPayment(reference: string) {
    const response = await fetch(`${BASE_URL}/transaction/verify/${reference}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${POCKETFI_API_KEY}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error('Failed to verify payment');
    }

    return response.json();
}
