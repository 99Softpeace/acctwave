
const fs = require('fs');
const path = require('path');

const files = [
    'src/lib/mail.ts',
    'src/lib/vtu.ts',
    'src/lib/vtu-plans.ts',
    'src/lib/textverified.ts',
    'src/lib/smspool.ts',
    'src/lib/smm.ts',
    'src/lib/resend.ts',
    'src/lib/pocketfi.ts',
    'src/lib/ncwallet.ts',
    'src/lib/modded-apps.ts',
    'src/lib/db.ts',
    'src/lib/auth.ts',
    'src/lib/daisysms.ts',
    'src/app/api/test-esim/route.ts',
    'src/app/api/pocketfi/webhook/route.ts',
    'src/app/api/pocketfi/create-account/route.ts',
    'src/app/api/debug-pocketfi/route.ts'
];

const keys = new Set();
files.forEach(f => {
    try {
        const p = path.join(process.cwd(), f);
        if (fs.existsSync(p)) {
            const content = fs.readFileSync(p, 'utf8');
            const matches = content.match(/process\.env\.([A-Z_][A-Z0-9_]*)/g);
            if (matches) {
                matches.forEach(m => keys.add(m.replace('process.env.', '')));
            }
        }
    } catch (e) {
        console.error(`Error reading ${f}:`, e.message);
    }
});

console.log("FOUND KEYS:");
keys.forEach(k => console.log(k));
