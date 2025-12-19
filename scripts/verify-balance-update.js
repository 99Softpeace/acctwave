require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const crypto = require('crypto');
const { Schema } = mongoose;

// minimal schemas for the script
const UserSchema = new Schema({
    email: String,
    balance: { type: Number, default: 0 },
    name: String
}, { strict: false });

const TransactionSchema = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    amount: Number,
    reference: String,
    status: { type: String, enum: ['pending', 'successful', 'failed'], default: 'pending' },
    payment_method: String,
    type: String,
    description: String,
    metadata: Object
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);

const WEBHOOK_URL = 'http://localhost:3000/api/pocketfi/webhook';
const SECRET = process.env.WEBHOOK_SIGNING_SECRET;

async function run() {
    if (!process.env.MONGODB_URI) {
        console.error('❌ MONGODB_URI missing');
        return;
    }
    if (!SECRET) {
        console.error('❌ WEBHOOK_SIGNING_SECRET missing');
        return;
    }

    try {
        console.log('1. Connecting to DB...');
        await mongoose.connect(process.env.MONGODB_URI);

        // 2. Find or Create Test User
        let user = await User.findOne({ email: 'verify_balance@test.com' });
        if (!user) {
            user = await User.create({
                email: 'verify_balance@test.com',
                name: 'Balance Tester',
                balance: 0,
                phoneNumber: '08000000000',
                password: 'password123'
            });
            console.log('   Created test user');
        } else {
            // Ensure fields exist (in case it was created by previous broken run)
            if (!user.phoneNumber || !user.password) {
                await User.updateOne({ _id: user._id }, { $set: { phoneNumber: '08000000000', password: 'password123' } });
                user = await User.findById(user._id);
            }
        }

        const startBalance = user.balance;
        console.log(`   User: ${user.email} | Start Balance: ₦${startBalance}`);

        // 3. Create Pending Transaction
        const ref = `VERIFY-${Date.now()}`;
        const amount = 500;
        await Transaction.create({
            user: user._id,
            amount: amount,
            reference: ref,
            status: 'pending',
            payment_method: 'pocketfi',
            type: 'deposit',
            description: 'Verification Test'
        });
        console.log(`2. Created Pending Transaction: ${ref} for ₦${amount}`);

        // 4. Fire Webhook
        console.log('3. Firing Webhook...');
        const payload = {
            event: 'payment.success',
            data: {
                reference: ref,
                amount: String(amount),
                tx_ref: ref,
                customer: { email: user.email }
            }
        };

        const rawBody = JSON.stringify(payload);
        const signature = crypto.createHmac('sha512', SECRET).update(rawBody).digest('hex');

        try {
            await axios.post(WEBHOOK_URL, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'x-pocketfi-signature': signature
                }
            });
            console.log('   Webhook sent (200 OK)');
        } catch (e) {
            console.error('   Webhook Request Failed:', e.message);
            if (e.response) {
                console.error(e.response.data);
                require('fs').writeFileSync('verification_error.json', JSON.stringify(e.response.data, null, 2));
            }
            process.exit(1);
        }

        // 5. Verify DB State
        console.log('4. Verifying DB update...');
        // Wait a split second for async DB ops in webhook (though they should be awaited)
        await new Promise(r => setTimeout(r, 1000));

        const updatedUser = await User.findById(user._id);
        const updatedTx = await Transaction.findOne({ reference: ref });

        console.log(`   End Balance: ₦${updatedUser.balance}`);
        console.log(`   Tx Status: ${updatedTx.status}`);

        if (updatedUser.balance === startBalance + amount) {
            console.log('✅ PASS: Balance increased correctly.');
        } else {
            console.log('❌ FAIL: Balance did not update.');
        }

        if (updatedTx.status === 'successful') {
            console.log('✅ PASS: Transaction marked successful.');
        } else {
            console.log('❌ FAIL: Transaction status not updated.');
        }

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await mongoose.disconnect();
    }
}

run();
