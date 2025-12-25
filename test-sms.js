
const https = require('https');

const API_TOKEN = "HnF8RqZu5MwUvayo7px3tsYh2ie6vtTv0LybHMm4WXt9J7tnnPDgQLwRTsfZ";

function sendTestSMS() {
    // API endpoint based on common knowledge/search (v1/sms/create)
    // trying v1 first as it's very common for this specific provider
    const url = `https://www.bulksmsnigeria.com/api/v1/sms/create?api_token=${API_TOKEN}&from=Acctwave&to=08123456789&body=Test_Message&dnd=2`;

    console.log("Testing GET request to: " + url);

    https.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
            console.log("Status Code:", res.statusCode);
            console.log("Response Body:", data);
        });
    }).on('error', (err) => {
        console.error("Error: ", err.message);
    });
}

sendTestSMS();
