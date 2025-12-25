
const fs = require('fs');
const content = `MONGODB_URI=mongodb+srv://smm_user:Acctwave@timelessportalcluster.0iey6zn.mongodb.net/?retryWrites=true&w=majority&appName=TimelessPortalCluster
RESEND_API_KEY=re_atoruCTt_KAVRJwmjt1iku5f3yjUMhhWz
GMAIL_USER=404peaceolowosagba@gmail.com
NCWALLET_API_KEY=live_ncsk_df7b172049101b992cdbf6f85c99000afe483e127d70
NCWALLET_PIN=2171
NEXTAUTH_SECRET=331edb85c0352df9daa2b086922b7fd568122e0325cae2d26bffa934bd68
POCKETFI_SECRET_KEY=331edb85c0352df9daa2b086922b7fd568122e0325cae2d26bffa934bd68246
`;
fs.writeFileSync('.env', content.trim());
console.log(".env restored.");
