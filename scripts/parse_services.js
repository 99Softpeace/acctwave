const fs = require('fs');
const path = require('path');

const rawText = fs.readFileSync(path.join(__dirname, '../raw_services.txt'), 'utf8');

const lines = rawText.split('\n').map(l => l.trim()).filter(l => l);
const services = [];
let currentCategory = 'Instagram Followers'; // Default category

let i = 0;
let serviceIdCounter = 1000;

while (i < lines.length) {
    const line = lines[i];

    // Heuristic: If line doesn't look like a service block start, maybe it's a category header
    // Service blocks usually start with an emoji or "Instagram ..." and are followed by "Min:"

    // Check if it's a category header (e.g., "Instagram Likes")
    // If the NEXT line is NOT a service start (doesn't have Min/Max), then THIS line is likely a header
    // OR if the line itself doesn't look like a service name

    // Let's look ahead to find the "Min: ... | Max: ..." line
    let minMaxIndex = -1;
    for (let j = 1; j <= 3; j++) { // Look ahead up to 3 lines
        if (i + j < lines.length && lines[i + j].startsWith('Min:')) {
            minMaxIndex = i + j;
            break;
        }
    }

    if (minMaxIndex === -1) {
        // This line is likely a category header
        if (!line.includes('Order') && !line.includes('/ 1k') && !line.startsWith('Min:')) {
            currentCategory = line.replace(/[^\w\s]/gi, '').trim(); // Clean up emojis
        }
        i++;
        continue;
    }

    // If we found a Min/Max line, the lines before it are the Name
    // Usually just 1 line before, but sometimes 2 if description is split
    const nameLine = lines[minMaxIndex - 1];
    const minMaxLine = lines[minMaxIndex];
    const priceLine = lines[minMaxIndex + 1];

    // Parse Min/Max
    const minMaxMatch = minMaxLine.match(/Min:\s*(\d+)\s*\|\s*Max:\s*(\d+)/);
    const min = minMaxMatch ? minMaxMatch[1] : '10';
    const max = minMaxMatch ? minMaxMatch[2] : '1000';

    // Parse Price
    // Price line is like "₦1,358.38"
    const priceMatch = priceLine.match(/₦([\d,]+\.?\d*)/);
    let rate = '0.00';
    if (priceMatch) {
        // Remove commas and convert to number, then back to string (or keep as string)
        // We need it in USD for the system usually, but here we are hardcoding NGN.
        // The system expects `rate` to be in USD usually if we use the converter.
        // BUT, since we are hardcoding, we can just store the NGN price directly if we modify the frontend to not convert.
        // OR we convert it back to USD (approx) so the existing frontend logic (which multiplies by 1600) works.

        const ngnPrice = parseFloat(priceMatch[1].replace(/,/g, ''));
        const usdRate = ngnPrice / 1600; // Assuming 1600 rate
        rate = usdRate.toFixed(4);
    }

    services.push({
        service: serviceIdCounter++,
        name: nameLine,
        type: 'default',
        category: currentCategory,
        rate: rate,
        min: min,
        max: max,
        refill: nameLine.toLowerCase().includes('refill'),
        cancel: true
    });

    // Move past this block
    // Block is: Name, Min/Max, Price, / 1k, Order
    // We are at Name (minMaxIndex - 1).
    // Price is minMaxIndex + 1
    // "/ 1k" is minMaxIndex + 2
    // "Order" is minMaxIndex + 3
    i = minMaxIndex + 4;
}

const output = `export const CUSTOM_SERVICES = ${JSON.stringify(services, null, 4)};`;
fs.writeFileSync(path.join(__dirname, '../src/lib/services-data.ts'), output);
console.log(`Parsed ${services.length} services.`);
