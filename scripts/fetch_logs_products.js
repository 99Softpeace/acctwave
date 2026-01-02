require('dotenv').config();
const fs = require('fs');

const API_URL = process.env.MODDED_APPS_API_URL || 'https://bulkacc.com';
const API_KEY = process.env.MODDED_APPS_API_KEY || '9c9ebbd481c1f9ba1d2caf326140de4f89926c16f1f14c2b0bfb3fdb73f5e674';

async function fetchProducts() {
    console.log(`Fetching products from: ${API_URL}`);

    let allItems = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
        try {
            const url = `${API_URL}/api/products/list?apiKey=${API_KEY}&pageIndex=${page}&pageSize=100`;
            console.log(`\nFetching Page ${page}...`);

            const options = {
                method: 'GET',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            };

            const res = await fetch(url, options);
            if (!res.ok) {
                console.log(`❌ Page ${page} failed: ${res.status}`);
                break;
            }

            const text = await res.text();
            let json;
            try {
                json = JSON.parse(text);
            } catch (e) {
                console.log('Failed to parse JSON for page', page);
                break;
            }

            if (json.data && json.data.items && json.data.items.length > 0) {
                console.log(`✅ Page ${page}: Found ${json.data.items.length} items`);
                allItems = allItems.concat(json.data.items);

                // Check if we reached the last page
                if (json.data.pageIndex >= json.data.totalPage) {
                    hasMore = false;
                } else {
                    page++;
                }
            } else {
                console.log('No more items found.');
                hasMore = false;
            }

        } catch (err) {
            console.error(`Request Failed on page ${page}:`, err.message);
            hasMore = false;
        }
    }

    console.log(`\nTotal items fetched: ${allItems.length}`);

    if (allItems.length > 0) {
        const finalData = {
            data: {
                items: allItems
            }
        };
        fs.writeFileSync('products_dump.json', JSON.stringify(finalData, null, 2));
        console.log('Saved all products to products_dump.json');
    }
}

fetchProducts();
