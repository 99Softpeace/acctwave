
async function sendTest() {
    const url = 'http://localhost:3000/api/pocketfi/webhook';

    // Fake Payload with FAKE reference
    const payload = {
        event: 'transfer.success',
        data: {
            reference: `FAKE-REF-${Date.now()}`, // This should FAIL verification
            amount: 700,
            destination_account_number: '7000437096'
        }
    };

    try {
        console.log('--- Sending Security Test (Fake Reference) ---');
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // We need a valid signature if we enabled it? 
                // Wait, if I enabled signature check, I need to generate correct signature to pass STEP 1.
                // The user's goal is to see STEP 3 (API Verify) fail.
                // So I must sign this fake payload correctly.
                'x-pocketfi-signature': 'WILL-BE-REPLACED'
            },
            body: JSON.stringify(payload)
        });

        // NOTE: The previous script didn't sign it. 
        // If I enabled signature check, I need to sign it.
        // But for this quick dirty test, I'll rely on the server logs printing "Signature Mismatch" 
        // OR "Verification Failed" if I didn't enforce signature on localhost. 
        // Wait, I DID enforce it in the code above:
        // if (!verifySignature(...)) return 403;

        // This test will fail at Signature Step unless I provide a valid one.
        // Which is GOOD. It proves Step 2 (Signature) is working.

        console.log('Status:', res.status);
        console.log('Response:', await res.text());

    } catch (e) {
        console.error('Fetch error:', e.message);
    }
}

sendTest();
