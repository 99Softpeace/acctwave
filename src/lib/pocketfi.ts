const POCKETFI_API_KEY = process.env.POCKETFI_API_KEY || '';
const BASE_URL = 'https://api.pocketfi.ng/api/v1';

export async function initializePayment(email: string, amount: number, reference: string, firstName: string, lastName: string) {
    const url = `${BASE_URL}/checkout/request`;
    console.log(`PocketFi: Initializing payment at ${url}`);

    // Name parts are now passed in

    // Extract Business ID: Use env var or split API key
    const businessId = process.env.POCKETFI_BUSINESS_ID || POCKETFI_API_KEY.split('|')[0];

    const payload = {
        first_name: firstName,
        last_name: lastName,
        phone: `080${Math.floor(Math.random() * 90000000 + 10000000)}`, // Generate random valid-looking phone
        business_id: businessId,
        email: email,
        amount: amount.toString(), // API expects string
        redirect_link: `${process.env.NEXTAUTH_URL}/dashboard/fund-wallet`, // Required by API
        tx_ref: reference, // FIX: Send our reference
        reference: reference // FIX: Send our reference (PocketFi sometimes uses this alias)
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

    const responseData = await response.json();
    console.log('--- POCKETFI RESPONSE START ---');
    console.log(JSON.stringify(responseData, null, 2));
    console.log('--- POCKETFI RESPONSE END ---');

    if (!response.ok) {
        console.error(`PocketFi API Error (${response.status}):`, responseData);
        throw new Error(`Failed to initialize payment: ${response.status} - ${JSON.stringify(responseData)}`);
    }

    return responseData;
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

export async function createVirtualAccount(email: string, name: string, phoneNumber: string) {
    const url = `${BASE_URL}/virtual-accounts/create`;
    console.log(`PocketFi: Creating DVA at ${url}`);

    // Split name for potential API requirements
    const nameParts = name.split(' ');
    const firstName = nameParts[0] || 'User';
    const lastName = nameParts.slice(1).join(' ') || 'Customer';

    const txRef = `VA-${Date.now()}`; // Generate a ref similar to route

    const payload = {
        first_name: firstName,
        last_name: lastName,
        phone: phoneNumber,
        email: email,
        businessId: process.env.POCKETFI_BUSINESS_ID || POCKETFI_API_KEY.split('|')[0], // FIX: Add fallback
        bank: "paga"
    };

    console.log('--- POCKETFI DVA PAYLOAD START ---');
    console.log(JSON.stringify(payload, null, 2));
    console.log('--- POCKETFI DVA PAYLOAD END ---');

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${POCKETFI_API_KEY}`, // Using Public Key
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    const responseData = await response.json();
    console.log('--- POCKETFI DVA RESPONSE START ---');
    console.log(JSON.stringify(responseData, null, 2));
    console.log('--- POCKETFI DVA RESPONSE END ---');

    if (!response.ok) {
        console.error(`PocketFi API Error (${response.status}):`, responseData);
        throw new Error(`Failed to create virtual account: ${response.status} - ${responseData.message || JSON.stringify(responseData)}`);
    }

    return responseData;
}
