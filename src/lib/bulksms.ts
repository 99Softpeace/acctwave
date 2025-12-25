
const API_TOKEN = "HnF8RqZu5MwUvayo7px3tsYh2ie6vtTv0LybHMm4WXt9J7tnnPDgQLwRTsfZ";
const BASE_URL = "https://www.bulksmsnigeria.com/api/v1/sms/create";

export async function sendBulkSMS(numbers: string[], message: string) {
    if (!numbers.length) return { success: false, message: 'No numbers provided' };

    // Format numbers: comma separated
    const to = numbers.join(',');

    // Construct URL with parameters
    const params = new URLSearchParams({
        api_token: API_TOKEN,
        from: 'Acctwave', // Sender ID
        to: to,
        body: message,
        dnd: '2' // 2 = Direct Refund (best delivery attempt)
    });

    try {
        const response = await fetch(`${BASE_URL}?${params.toString()}`, {
            method: 'GET', // V1 uses GET mostly, but POST is also supported. GET verified by test script.
        });

        const data = await response.json();

        if (data.data?.status === 'success' || data.status === 'success') {
            return { success: true, count: numbers.length, data };
        } else {
            return { success: false, message: data.message || 'SMS Provider Error', data };
        }
    } catch (error: any) {
        console.error('BulkSMS Error:', error);
        return { success: false, message: error.message || 'Network Error' };
    }
}
