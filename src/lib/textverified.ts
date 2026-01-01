import { HttpsProxyAgent } from 'https-proxy-agent';

const API_KEY = process.env.TEXTVERIFIED_API_KEY || '';
const BASE_URL = 'https://www.textverified.com/api/pub/v2';

export interface TVService {
    id: string; // serviceName (string) for V2
    name: string;
    cost: number;
}

export interface TVVerification {
    id: string;
    number: string;
    service: string;
    status: 'Pending' | 'Completed' | 'Timed Out' | 'Cancelled';
    code?: string;
    sms?: string | { href: string };
    time_remaining?: string;
}

export class TextVerified {
    private static token: string | null = null;
    private static tokenExpiry: number | null = null;
    public static debugLog: string[] = [];

    private static getAgent() {
        // [FIX] Disabled proxy for V2 public API
        return undefined;
    }

    private static async getBearerToken(): Promise<string> {
        const currentToken = this.token;
        if (currentToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
            return currentToken;
        }

        const email = process.env.TEXTVERIFIED_EMAIL;
        if (!email) {
            throw new Error('TEXTVERIFIED_EMAIL is not set in .env');
        }

        const agent = this.getAgent();

        const response = await fetch(`${BASE_URL}/auth`, {
            method: 'POST',
            headers: {
                'X-API-KEY': API_KEY,
                'X-API-USERNAME': email,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            // @ts-ignore
            agent: agent,
            cache: 'no-store'
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('TextVerified Auth Error:', response.status, errorText.substring(0, 200));
            throw new Error(`Failed to authenticate with TextVerified: ${response.status} ${errorText.substring(0, 100)}...`);
        }

        let data;
        try {
            data = await response.json();
        } catch (e) {
            console.error('TextVerified Auth JSON Parse Error:', e);
            throw new Error('Auth returned non-JSON response');
        }

        const token = data.token || data.bearer_token;
        if (!token) {
            throw new Error('No token found in TextVerified auth response');
        }

        let expiryTime = Date.now() + (30 * 60 * 1000);
        if (data.expiration) {
            expiryTime = new Date(data.expiration).getTime();
        }

        this.token = token;
        // Expire 1 minute early to be safe
        this.tokenExpiry = expiryTime - (60 * 1000);

        return token;
    }

    public static async request(endpoint: string, method: 'GET' | 'POST' = 'GET', body?: any): Promise<any> {
        let token;
        try {
            token = await this.getBearerToken();
        } catch (error) {
            console.warn('Bearer Token generation failed:', error);
            throw error;
        }

        const headers: Record<string, string> = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };

        const agent = this.getAgent();

        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
            // @ts-ignore
            agent: agent,
            cache: 'no-store'
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`TextVerified Error (${endpoint}):`, response.status, errorText.substring(0, 200));
            throw new Error(`TextVerified API error: ${response.status} ${errorText.substring(0, 100)}...`);
        }

        try {
            return await response.json();
        } catch (e) {
            console.error('TextVerified JSON Parse Error:', e);
            throw new Error('Failed to parse TextVerified response');
        }
    }

    static async getServices(): Promise<TVService[]> {
        try {
            // [FIX] V2 returns { serviceName, capability } but no serviceId/cost sometimes
            const data = await this.request('/services?reservationType=verification&numberType=mobile');

            if (!Array.isArray(data)) return [];

            return data
                .filter((item: any) => item.serviceName || item.serviceId || item.targetId)
                .map((item: any) => {
                    const id = (item.serviceId || item.targetId || item.serviceName || '').toString();
                    const name = item.name || item.serviceName || item.targetName || 'Unknown';
                    // [LOCAL DATABASE STRATEGY] 
                    // Manual Price Map seeded from Uchenzylogs/Competitor data
                    const COST_MAP: { [key: string]: number } = {
                        'whatsapp': 0.50, 'viber': 0.10, 'openai': 0.20, 'chatgpt': 0.20,
                        'telegram': 0.70, 'yahoo': 0.20, 'microsoft': 0.30, 'outlook': 0.30, 'hotmail': 0.30,
                        'facebook': 0.50, 'craigslist': 0.10, 'discord': 0.30, 'linkedin': 0.30,
                        'twitter': 0.30, 'doordash': 0.10, 'google': 0.20, 'gmail': 0.20, 'youtube': 0.20, 'googlevoice': 0.20,
                        'poshmark': 0.10, 'apple': 0.20, 'tinder': 0.30, 'bumble': 0.18,
                        'paypal': 0.30, 'venmo': 1.10, 'tiktok': 0.30, 'fiverr': 0.10,
                        'nike': 0.20, 'instagram': 0.15, 'leagueoflegends': 0.10, 'wechat': 0.20,
                        'uber': 0.10, 'hinge': 0.30, 'ebay': 0.10, 'grindr': 0.10,
                        'coinbase': 0.25, 'vkontakte': 0.20, 'ticketmaster': 0.10, 'temu': 0.10,
                        'line': 0.05, 'collegepulse': 0.40, 'truthsocial': 0.08, 'amazon': 0.10, 'aws': 0.10,
                        'claudeai': 0.30, 'crowdtap': 0.14, 'plentyoffish': 0.10, 'steam': 0.50,
                        'aarprewards': 0.15, 'aol': 0.10, 'jd.com': 0.08, 'cocacola': 0.05,
                        'creditkarma': 0.50, 'chevron': 0.25, 'texaco': 0.25, 'gaintplay': 0.15,
                        'swagbucks': 0.10, 'inboxdollars': 0.10, 'mypoints': 0.10, 'ysense': 0.10, 'noones': 0.10, 'adgatesurvey': 0.10,
                        'blizzard': 0.20, 'battle.net': 0.20, 'fetlife': 0.10, 'trapcall': 0.20,
                        'kudos': 0.12, 'linode': 0.10, 'resy.com': 0.50, 'blastbucks': 0.40,
                        'timewall': 0.20, 'okcupid': 0.10, 'currently.com': 0.10, 'att': 0.10,
                        'eneba': 0.20, 'sideline': 0.15, 'indexbypinger': 0.15, 'signal': 0.10,
                        'neocrypto': 0.20, 'ibotta': 0.20, 'gopuff': 0.20, 'textr': 0.20,
                        'badoo': 0.20, 'etsy': 0.20, 'ring4': 0.15, 'taimi': 0.30,
                        'walmart': 0.10, 'mercari': 0.25, 'snapchat': 0.30, 'cashapp': 0.60,
                        'noonlight': 0.15, 'lyft': 0.20, 'current.com': 0.80, 'pixels.xyz': 0.09,
                        'textfree': 0.08, 'pvc': 0.30, 'laa': 0.80, 'chase': 0.30,
                        'hily': 0.20, 'juno': 0.20, 'offerup': 0.10, 'chispa': 0.10,
                        'pogo': 0.10, 'match.com': 0.10, 'blk': 0.10, 'ipsosisay': 0.20,
                        'dutchbros': 0.10, 'fetchrewards': 0.10, 'feeld': 0.05, 'chick-fil-a': 0.10,
                        'centurylink': 0.20, 'rebtel': 0.05, 'shein': 0.20, 'visionengage': 0.10,
                        'seated': 0.10, 'chipotle': 0.05, 'pelago': 0.50, 'go2bank': 0.50,
                        'frisbeerewards': 0.25, 'verasight': 0.10, 'flip': 1.00, 'capitalone': 0.40,
                        'deliveroo': 0.20, 'webull': 0.20, 'phoner': 0.20, 'chime': 1.80,
                        '3fun': 0.20, 'phound': 0.40, 'pinger': 0.20, 'square': 0.20,
                        'skrill': 0.20, 'mygiftcardredemption': 0.40, 'circlek': 0.10, 'zyrtec': 0.10,
                        'kakaotalk': 0.05, 'one.app': 0.25, 'onepay': 0.25, 'marylouscoffee': 0.15,
                        'wellsfargo': 0.80, 'bankofamerica': 0.80, 'pnc': 0.80, 'twitch': 0.20,
                        'footlocker': 0.20, 'gmx.com': 0.10, 'zalo': 0.10, 'luvs': 0.10,
                        'usaa': 0.80, 'keybank': 0.80, 'citi': 0.80, 'truist': 0.80,
                        'rate4rewards': 0.10, 'wolt': 0.10, 'cod': 0.05, 'schwab': 0.80,
                        'santander': 0.80, 'regions': 0.80, 'shiftkey': 0.50, 'dunkindonuts': 0.20,
                        'benjamin': 0.20, 'opentable': 0.50, 'bet365': 0.80, 'westernunion': 0.50,
                        'revtrax': 0.10, 'kraken': 1.00, 'plaid': 1.00, 'snaplii': 0.40,
                        'shop.app': 0.30, 'moneylion': 0.20, 'wert': 0.15, 'wise': 0.80,
                        'doublelist': 0.10, 'super.com': 0.15, 'attapoll': 0.10, 'stash.com': 0.10,
                        'moonpay': 0.30, 'klover': 0.10, 'brightcapital': 0.10, 'greenlight.com': 0.50,
                        'jointrue.com': 0.10, 'everbank': 0.80, 'fedex': 0.15, 'usbank': 0.80,
                        'fidelity': 0.80, 'shippingeasy': 0.10, 'discoverbank': 0.80, 'nfcu': 1.00,
                        'inkind': 0.10, 'reddit': 0.40, 'wingstop': 0.10, 'whatnot': 0.10,
                        'usalliance': 0.80, 'citizens': 0.80, 'bmoharris': 0.80, 'sofibank': 0.80,
                        'public.com': 0.30, 'grifin.com': 0.12, 'etoro': 0.30, 'gemini': 0.20,
                        'coffeemeetsbagel': 0.18, 'huntington': 0.80, 'dingdingding': 0.10, 'pingme': 0.10,
                        'ourtime': 0.10, 'koho.ca': 0.20, 'qantas': 0.20, 'tencentqq': 0.10,
                        'fidelitynetbenefits': 1.00, 'yendo': 1.00, 'ozk': 1.00, 'wallethub': 0.20,
                        'burner': 0.10, 'stir': 0.10, 'textla': 0.10, 'chargepoint': 0.10,
                        'gameflip': 0.10, 'greendot': 0.50, 'beehiiv': 0.10, 'hostinger': 0.10,
                        'upwork': 0.10, 'crypto.com': 0.10, 'acima': 0.50, 'docusign': 0.10,
                        'upaynet': 0.10, 'uprova': 1.00, 'experian': 1.00, 'onlinecheckwriter': 0.10,
                        'astrafi.com': 0.20, 'aspiration': 0.80, 'greenfi': 0.80, 'feastables': 0.10,
                        'cleo': 0.25, 'prolific': 0.10, 'screenconnect': 0.10, 'perpay': 0.20,
                        'vitacost': 0.20, 'wayfair': 0.10, 'payoneer': 0.50, 'skout': 0.20,
                        'happn': 0.20, 'twilio': 0.50, 'vinted': 0.20, 'aegpresents': 0.10,
                        'openphone': 0.10, 'dovetail': 0.25, 'bluesky': 0.20, 'bmoalto': 0.80,
                        'td.com': 0.80, 'afterpay': 0.20, 'googlechat': 0.43, 'hitch': 0.10,
                        'strike': 0.20, 'bestbuy': 0.20, 'rumble': 0.20, 'espnbet': 0.50,
                        'golden1': 0.80, 'innago': 0.10, 'netspend': 1.00, 'rayatheapp': 0.15,
                        'varo': 0.80, 'nexon': 0.05, 'wheely': 0.10, 'weebly': 0.10,
                        'ally': 0.80, 'gofundme': 0.50, 'upward': 0.10, 'rednote': 0.10, 'xiaohongshu': 0.10,
                        'frostbank': 1.00, 'oneforma': 0.10, 'klarna': 1.00, 'getholdings': 1.00,
                        'dave.com': 0.80, 'seatgeek': 0.10, 'zillow': 0.20, 'bridgemoney.co': 0.50,
                        'northone': 0.80, 'turbotenant': 0.20, 'outlierai': 0.10, 'courtyard.io': 0.10,
                        'snakzy': 0.10, 'fanaticslive': 0.10, 'relayfi.com': 0.50, 'alipay': 0.50,
                        'tradify': 0.10, 'ashleymadison': 0.40, 'fanduel': 0.50, 'pinata.ai': 0.20,
                        'fivesurveys': 0.15, 'archerapp': 0.30, 'legoofferhub': 0.50, 'axosbank': 0.80,
                        'butcherbox': 0.15, 'cvs': 0.10, 'revel': 0.10, 'topsurveys': 0.15, 'earnstar': 0.15,
                        'intuit': 0.30, 'instacart': 0.15, 'vercel': 0.10, 'betfanatics': 0.70,
                        'hopper': 0.15, 'alibabacloud': 0.10, 'found.com': 0.30, 'sprucemoney.com': 0.10,
                        'bcbs': 0.05, 'gcx': 0.50, 'unitedairlines': 0.60, 'ufbdirect.com': 0.80,
                        'stripe': 0.80, 'af247.com': 0.80, 'navyfederal': 0.80, 'uphold': 0.50,
                        'lysted': 0.10, 'draftkings': 0.70, '2redbeans': 0.50, 'manus.im': 0.20,
                        'snapfinance': 0.80, 'nicesurveys': 0.15, 'playfulrewards': 0.20, 'naver': 0.10,
                        'lightningai': 0.20, 'baselane': 0.20, 'roblox': 0.20, 'threads': 0.10,
                        'lowes': 0.25, 'indeed': 0.10, 'caesars': 0.70, 'walmartmoneycard': 0.25,
                        'amex': 0.80, 'biltrewards': 0.20, 'healthsafe': 0.20, 'optum': 0.20,
                        'riamoneytransfer': 0.30, 'airbaton.net': 0.10, 'revolut': 0.40, 'finnfox': 0.75,
                        'eiloan': 0.75, 'novo': 0.20, 'evgo': 0.10, 'merrilledge': 0.80,
                        'bossmoney': 0.35, 'dingtone': 0.10, 'sezzle': 0.80, 'affirm': 0.80,
                        'cashloansexpress': 0.80, 'step': 0.20, 'waymo': 0.10, 'splitdrop': 0.15,
                        'future.green': 0.50, 'robinhood': 0.40, 'unbank': 0.40, 'betr': 0.40,
                        'classpass': 0.20, 'albertsons': 0.10, 'safeway': 0.10, 'acorns': 0.20,
                        'keitaro': 0.50, 'ticketswap': 0.20, 'advanceamerica': 0.25, 'codashop': 0.30,
                        'etrade': 0.50, 'openbank': 0.40, 'tcgplayer': 0.20, 'fifththirdbank': 0.80,
                        'soulapp': 0.20, 'taobao': 0.10, 'alibaba': 0.10, 'wealthfront': 0.20,
                        'bankmobile': 0.80, 'bluevine': 0.10, 'nyc': 0.20, 'heycash': 0.10,
                        'samsclub': 0.10, 'dripshop': 0.20, 'veriswap': 0.10, 'hud': 0.15,
                        'trading.com': 0.50, 'gbank': 0.80, 'epicpull': 0.10, 'wonder.com': 0.20,
                        'shopback': 0.15, 'penfed': 0.80, '7-eleven': 0.10, 'hotstreak': 0.20,
                        'sonetel': 0.20, 'kalshi': 0.40, 'chumbacasino': 0.40, 'onemainfinancial': 0.80,
                        'raisin': 0.10, 'imprint': 0.20, 'eastwestbank': 0.80, 'slingmoney': 0.40,
                        'brandedsurveys': 0.10, 'axs': 0.10, 'lightstream.com': 0.80, 'albert.com': 0.20,
                        'transunion': 0.80, 'veoride': 0.25, 'storecash': 0.40, 'firstnationalbank': 0.80,
                        'anthropologie': 0.10, 'snipp': 0.10, 'sunbit': 0.80, 'feelsapp': 0.10,
                        'river': 0.50, 'zoho': 0.10, 'zip.co': 0.50, 'kikoff': 0.20,
                        'rovemiles': 0.20, 'ding.com': 0.10, 'netpayadvance': 0.80, 'netflix': 0.10,
                        'rocketreach': 0.10, 'primeopinion': 0.12, 'binance.us': 0.40, 'klutch': 0.40,
                        'godaddy': 0.30, 'bossrevolution': 0.30, 'roomies': 0.10, 'dollargeneral': 0.10,
                        'patientfi': 0.50, 'hardrockbet': 0.50, 'swittch': 0.12, 'nextdoor': 0.10,
                        'dilmil': 0.20, 'gala': 0.06, 'hking': 0.06, 'pureminutes': 0.20,
                        'wetalk': 0.20, 'yay.com': 0.10, 'dialpad': 0.20, 'airbnb': 0.10,
                        'vumber': 0.20, 'fooji': 0.05, 'kktix': 0.10, 'zestearn.com': 0.10,
                        'aaa': 0.50, 'layup': 0.10, 'backbone': 0.20, 'novig': 0.40,
                        'nerdwallet': 0.10, 'cobrandfredagain': 0.10, 'sendwave': 0.10, 'jerry.ai': 0.10,
                        'seagm': 0.10, 'tixel': 0.50, 'expedia': 0.10, 'buffalowildwings': 0.10,
                        'cursor': 0.10, 'breadpayments': 0.80, 'duet': 0.20
                    };

                    const lookupName = (item.serviceName || item.name || '').toLowerCase();

                    // Fallback to Deterministic "Organic" Price for unmapped services
                    // Logic: Hash name to get a stable price between $0.30 and $0.80
                    // This satisfies the request to price unlisted services within this specific range
                    let cost = COST_MAP[lookupName];

                    if (!cost) {
                        // FORCE Deterministic Price for ALL unmapped services (Ignore API defaults)
                        // Logic: Hash name to get a stable price between $0.10 and $0.30
                        // This ensures every unlisted service is cheap and varied.

                        let hash = 0;
                        for (let i = 0; i < lookupName.length; i++) {
                            hash = lookupName.charCodeAt(i) + ((hash << 5) - hash);
                        }

                        // Calculate variance in range 0.00 - 0.20
                        // Modulo 21 ensures 0-20 range. Divided by 100 gives 0.00-0.20.
                        const variance = (Math.abs(hash) % 21) / 100;

                        // Base 0.10 + Variance = Range [0.10, 0.30]
                        cost = 0.10 + variance;
                    }

                    return { id, name, cost };
                })
                // [FIX] Deduplicate by name to prevent React key errors
                .filter((item, index, self) =>
                    index === self.findIndex((t) => t.name === item.name)
                )
                .sort((a: TVService, b: TVService) => a.name.localeCompare(b.name));
        } catch (error) {
            console.error('Failed to fetch TextVerified services:', error);
            return [];
        }
    }

    static async createVerification(targetId: string): Promise<TVVerification> {
        // [FORCE REFRESH 2]
        // [FIX] V2 uses serviceName (string) as ID. Do NOT parseInt.
        // Send 'id' as the service identifier.
        const data = await this.request('/verifications', 'POST', {
            id: targetId,
            serviceName: targetId,
            capability: 'Sms'
        });

        // [DEBUG LOCAL] Log to file
        try {
            const fs = require('fs');
            const path = require('path');
            const logPath = path.join(process.cwd(), 'debug_error.log');
            fs.appendFileSync(logPath, `[${new Date().toISOString()}] [TV Response] ${JSON.stringify(data, null, 2)}\n---\n`);
        } catch (e) {
            console.error('Failed to log TV response:', e);
        }

        console.log('[TextVerified] Create Response:', JSON.stringify(data, null, 2));

        // [FIX] Handle V2 response which returns { href: '...' } instead of object
        if (data.href && !data.number) {
            try {
                const fs = require('fs');
                const path = require('path');
                const logPath = path.join(process.cwd(), 'debug_error.log');
                fs.appendFileSync(logPath, `[${new Date().toISOString()}] [TV Href Triggered] Fetching details for ID...\n`);
            } catch (e) { }

            const parts = data.href.split('/');
            const newId = parts[parts.length - 1]; // Extract ID from URL

            // Fetch the actual verification object
            const fullDetails = await this.getVerification(newId);

            try {
                const fs = require('fs');
                const path = require('path');
                const logPath = path.join(process.cwd(), 'debug_error.log');
                fs.appendFileSync(logPath, `[${new Date().toISOString()}] [TV Full Details] ${JSON.stringify(fullDetails, null, 2)}\n---\n`);
            } catch (e) { }

            return {
                ...fullDetails,
                number: fullDetails.number || 'Pending' // Ensure fallback exists here too
            };
        }

        return {
            id: data.id,
            number: data.number || data.phone_number || 'Pending',
            service: data.service_name || data.target_name || 'Unknown',
            status: data.status || 'Pending',
            time_remaining: data.time_remaining
        };
    }

    static async getVerification(id: string): Promise<TVVerification> {
        const data = await this.request(`/verifications/${id}`);

        return {
            id: data.id,
            number: data.number,
            service: data.service_name || data.target_name,
            status: data.status || 'Pending',
            code: data.code,
            sms: data.sms,
            time_remaining: data.time_remaining
        };
    }

    static async cancelVerification(id: string): Promise<void> {
        await this.request(`/verifications/${id}/cancel`, 'POST');
    }

    static async getRentalServices(): Promise<TVService[]> {
        try {
            const data = await this.request('/services?reservationType=renewable&numberType=mobile');

            if (!Array.isArray(data)) return [];

            return data
                .filter((item: any) => item.serviceName || item.serviceId || item.targetId)
                .map((item: any) => {
                    const id = (item.serviceId || item.targetId || item.serviceName || '').toString();
                    const name = item.name || item.serviceName || 'Unknown';
                    // [FIX] Default cost to 4.0 for rentals (Approximation since API hides it)
                    const cost = item.cost || 4.0;
                    return { id, name, cost };
                })
                // [FIX] Deduplicate by name to prevent React key errors
                .filter((item, index, self) =>
                    index === self.findIndex((t) => t.name === item.name)
                )
                .sort((a: TVService, b: TVService) => a.name.localeCompare(b.name));
        } catch (error) {
            console.error('Failed to fetch TextVerified rental services:', error);
            return [];
        }
    }

    static async purchaseRental(targetId: string, duration: number, unit: 'Days' | 'Weeks' | 'Months', areaCode?: string): Promise<TVVerification> {
        // [FIX] Use string ID for V2
        const payload: any = {
            id: targetId,
            duration,
            unit
        };

        if (areaCode) {
            payload.areaCode = areaCode;
        }

        const data = await this.request('/rentals', 'POST', payload);

        return {
            id: data.id,
            number: data.number,
            service: data.service_name || 'Unknown',
            status: 'Pending',
            time_remaining: 'Calculating...'
        };
    }

    static async getRental(id: string): Promise<TVVerification> {
        const data = await this.request(`/rentals/${id}`);
        return {
            id: data.id,
            number: data.number,
            service: data.service_name,
            status: data.status,
            code: data.messages?.[0]?.message,
            sms: data.messages?.[0]?.message,
            time_remaining: data.time_remaining
        };
    }
}
