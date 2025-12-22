
export interface DataPlan {
    id: number;
    network: 'MTN' | 'AIRTEL' | 'GLO' | '9MOBILE';
    type: 'AWOOF' | 'CG' | 'GIFTING' | 'SME' | 'DATA CARD';
    name: string;
    price: number;
    size: string;
    validity: string;
}

export const STATIC_DATA_PLANS: DataPlan[] = [
    {
        "id": 325,
        "network": "MTN",
        "type": "AWOOF",
        "name": "11 GB",
        "price": 3600,
        "size": "11 GB",
        "validity": "1 Week"
    },
    {
        "id": 324,
        "network": "MTN",
        "type": "AWOOF",
        "name": "3.2 GB",
        "price": 1130,
        "size": "3.2 GB",
        "validity": "2 Days"
    },
    {
        "id": 323,
        "network": "MTN",
        "type": "AWOOF",
        "name": "5Mins + 1 GB",
        "price": 570,
        "size": "5Mins + 1 GB",
        "validity": "1 Day"
    },
    {
        "id": 11376,
        "network": "MTN",
        "type": "AWOOF",
        "name": "Direct 10 GB",
        "price": 4890,
        "size": "Direct 10 GB",
        "validity": "1 Month"
    },
    {
        "id": 336,
        "network": "MTN",
        "type": "AWOOF",
        "name": "Direct, 1 GB",
        "price": 570,
        "size": "Direct, 1 GB",
        "validity": "1 Day"
    },
    {
        "id": 337,
        "network": "MTN",
        "type": "AWOOF",
        "name": "Direct, 1 GB",
        "price": 930,
        "size": "Direct, 1 GB",
        "validity": "1 Week"
    },
    {
        "id": 329,
        "network": "MTN",
        "type": "AWOOF",
        "name": "Direct, 1.5 GB",
        "price": 740,
        "size": "Direct, 1.5 GB",
        "validity": "2 Days"
    },
    {
        "id": 11375,
        "network": "MTN",
        "type": "AWOOF",
        "name": "Direct, 110 MB",
        "price": 150,
        "size": "Direct, 110 MB",
        "validity": "1 Day"
    },
    {
        "id": 340,
        "network": "MTN",
        "type": "AWOOF",
        "name": "Direct, 12.5 GB",
        "price": 6170,
        "size": "Direct, 12.5 GB",
        "validity": "1 Month"
    },
    {
        "id": 341,
        "network": "MTN",
        "type": "AWOOF",
        "name": "Direct, 16.5 GB",
        "price": 7140,
        "size": "Direct, 16.5 GB",
        "validity": "1 Month"
    },
    {
        "id": 330,
        "network": "MTN",
        "type": "AWOOF",
        "name": "Direct, 2 GB",
        "price": 890,
        "size": "Direct, 2 GB",
        "validity": "2 Days"
    },
    {
        "id": 339,
        "network": "MTN",
        "type": "AWOOF",
        "name": "Direct, 2 GB",
        "price": 1770,
        "size": "Direct, 2 GB",
        "validity": "1 Month"
    },
    {
        "id": 326,
        "network": "MTN",
        "type": "AWOOF",
        "name": "Direct, 2.5 GB",
        "price": 890,
        "size": "Direct, 2.5 GB",
        "validity": "1 Day"
    },
    {
        "id": 331,
        "network": "MTN",
        "type": "AWOOF",
        "name": "Direct, 2.5 GB",
        "price": 1030,
        "size": "Direct, 2.5 GB",
        "validity": "2 Days"
    },
    {
        "id": 11382,
        "network": "MTN",
        "type": "AWOOF",
        "name": "Direct, 230 MB",
        "price": 250,
        "size": "Direct, 230 MB",
        "validity": "1 Day"
    },
    {
        "id": 11402,
        "network": "MTN",
        "type": "AWOOF",
        "name": "Direct, 3.5 GB",
        "price": 1770,
        "size": "Direct, 3.5 GB",
        "validity": "1 Week"
    },
    {
        "id": 342,
        "network": "MTN",
        "type": "AWOOF",
        "name": "Direct, 36 GB",
        "price": 11530,
        "size": "Direct, 36 GB",
        "validity": "1 Month"
    },
    {
        "id": 332,
        "network": "MTN",
        "type": "AWOOF",
        "name": "Direct, 6 GB",
        "price": 2740,
        "size": "Direct, 6 GB",
        "validity": "1 Week"
    },
    {
        "id": 343,
        "network": "MTN",
        "type": "AWOOF",
        "name": "Direct, 75 GB",
        "price": 18350,
        "size": "Direct, 75 GB",
        "validity": "1 Month"
    },
    {
        "id": 338,
        "network": "MTN",
        "type": "AWOOF",
        "name": "Direct,1.5 GB",
        "price": 1130,
        "size": "Direct,1.5 GB",
        "validity": "1 Week"
    },
    {
        "id": 156,
        "network": "MTN",
        "type": "CG",
        "name": "1 GB",
        "price": 780,
        "size": "1 GB",
        "validity": "1 Week"
    },
    {
        "id": 160,
        "network": "MTN",
        "type": "CG",
        "name": "10 GB",
        "price": 7050,
        "size": "10 GB",
        "validity": "1 Month"
    },
    {
        "id": 157,
        "network": "MTN",
        "type": "CG",
        "name": "2 GB",
        "price": 1500,
        "size": "2 GB",
        "validity": "1 Month"
    },
    {
        "id": 158,
        "network": "MTN",
        "type": "CG",
        "name": "3 GB",
        "price": 2150,
        "size": "3 GB",
        "validity": "1 Month"
    },
    {
        "id": 159,
        "network": "MTN",
        "type": "CG",
        "name": "5 GB",
        "price": 3600,
        "size": "5 GB",
        "validity": "1 Month"
    },
    {
        "id": 155,
        "network": "MTN",
        "type": "CG",
        "name": "500 MB",
        "price": 500,
        "size": "500 MB",
        "validity": "1 Week"
    },
    {
        "id": 9,
        "network": "MTN",
        "type": "SME",
        "name": "1 GB",
        "price": 870,
        "size": "1 GB",
        "validity": "1 Month"
    },
    {
        "id": 13,
        "network": "MTN",
        "type": "SME",
        "name": "10 GB",
        "price": 8000,
        "size": "10 GB",
        "validity": "1 Month"
    },
    {
        "id": 10,
        "network": "MTN",
        "type": "SME",
        "name": "2 GB",
        "price": 1740,
        "size": "2 GB",
        "validity": "1 Month"
    },
    {
        "id": 11,
        "network": "MTN",
        "type": "SME",
        "name": "3 GB",
        "price": 2460,
        "size": "3 GB",
        "validity": "1 Month"
    },
    {
        "id": 12,
        "network": "MTN",
        "type": "SME",
        "name": "5 GB",
        "price": 4100,
        "size": "5 GB",
        "validity": "1 Month"
    },
    {
        "id": 8,
        "network": "MTN",
        "type": "SME",
        "name": "500 MB",
        "price": 510,
        "size": "500 MB",
        "validity": "1 Week"
    },
    {
        "id": 362,
        "network": "AIRTEL",
        "type": "GIFTING",
        "name": "1 GB",
        "price": 940,
        "size": "1 GB",
        "validity": "1 Week"
    },
    {
        "id": 11384,
        "network": "AIRTEL",
        "type": "GIFTING",
        "name": "1.5 GB",
        "price": 1140,
        "size": "1.5 GB",
        "validity": "1 Week"
    },
    {
        "id": 11401,
        "network": "AIRTEL",
        "type": "GIFTING",
        "name": "10 GB",
        "price": 4440,
        "size": "10 GB",
        "validity": "1 Month"
    },
    {
        "id": 11390,
        "network": "AIRTEL",
        "type": "GIFTING",
        "name": "13 GB",
        "price": 5400,
        "size": "13 GB",
        "validity": "1 Month"
    },
    {
        "id": 11391,
        "network": "AIRTEL",
        "type": "GIFTING",
        "name": "18 GB",
        "price": 6680,
        "size": "18 GB",
        "validity": "1 Month"
    },
    {
        "id": 11397,
        "network": "AIRTEL",
        "type": "GIFTING",
        "name": "2 GB",
        "price": 1780,
        "size": "2 GB",
        "validity": "1 Month"
    },
    {
        "id": 11392,
        "network": "AIRTEL",
        "type": "GIFTING",
        "name": "25 GB",
        "price": 8640,
        "size": "25 GB",
        "validity": "1 Month"
    },
    {
        "id": 11398,
        "network": "AIRTEL",
        "type": "GIFTING",
        "name": "3 GB",
        "price": 2270,
        "size": "3 GB",
        "validity": "1 Month"
    },
    {
        "id": 360,
        "network": "AIRTEL",
        "type": "GIFTING",
        "name": "3.5 GB",
        "price": 1780,
        "size": "3.5 GB",
        "validity": "1 Week"
    },
    {
        "id": 11393,
        "network": "AIRTEL",
        "type": "GIFTING",
        "name": "35 GB",
        "price": 10600,
        "size": "35 GB",
        "validity": "1 Month"
    },
    {
        "id": 11399,
        "network": "AIRTEL",
        "type": "GIFTING",
        "name": "4 GB",
        "price": 2760,
        "size": "4 GB",
        "validity": "1 Month"
    },
    {
        "id": 11395,
        "network": "AIRTEL",
        "type": "GIFTING",
        "name": "500 MB",
        "price": 580,
        "size": "500 MB",
        "validity": "1 Week"
    },
    {
        "id": 11400,
        "network": "AIRTEL",
        "type": "GIFTING",
        "name": "8 GB",
        "price": 3250,
        "size": "8 GB",
        "validity": "1 Month"
    },
    {
        "id": 313,
        "network": "AIRTEL",
        "type": "SME",
        "name": "10 GB",
        "price": 2000,
        "size": "10 GB",
        "validity": "1 Month"
    },
    {
        "id": 11388,
        "network": "AIRTEL",
        "type": "SME",
        "name": "10 GB",
        "price": 2000,
        "size": "10 GB",
        "validity": "1 Week"
    },
    {
        "id": 308,
        "network": "AIRTEL",
        "type": "SME",
        "name": "150 MB",
        "price": 100,
        "size": "150 MB",
        "validity": "1 Day"
    },
    {
        "id": 11404,
        "network": "AIRTEL",
        "type": "SME",
        "name": "2 GB",
        "price": 750,
        "size": "2 GB",
        "validity": "2 Days"
    },
    {
        "id": 11405,
        "network": "AIRTEL",
        "type": "SME",
        "name": "3.2 GB",
        "price": 570,
        "size": "3.2 GB",
        "validity": "3 Days"
    },
    {
        "id": 11394,
        "network": "AIRTEL",
        "type": "SME",
        "name": "3.5 GB",
        "price": 1780,
        "size": "3.5 GB",
        "validity": "1 Week"
    },
    {
        "id": 359,
        "network": "AIRTEL",
        "type": "SME",
        "name": "300 MB",
        "price": 150,
        "size": "300 MB",
        "validity": "2 Days"
    },
    {
        "id": 11387,
        "network": "AIRTEL",
        "type": "SME",
        "name": "4 GB",
        "price": 2760,
        "size": "4 GB",
        "validity": "1 Month"
    },
    {
        "id": 11406,
        "network": "AIRTEL",
        "type": "SME",
        "name": "6.5 GB",
        "price": 1120,
        "size": "6.5 GB",
        "validity": "1 Week"
    },
    {
        "id": 11383,
        "network": "AIRTEL",
        "type": "SME",
        "name": "600 MB",
        "price": 250,
        "size": "600 MB",
        "validity": "2 Days"
    },
    {
        "id": 348,
        "network": "GLO",
        "type": "CG",
        "name": "1 GB",
        "price": 350,
        "size": "1 GB",
        "validity": "3 Days"
    },
    {
        "id": 349,
        "network": "GLO",
        "type": "CG",
        "name": "1 GB",
        "price": 380,
        "size": "1 GB",
        "validity": "1 Week"
    },
    {
        "id": 173,
        "network": "GLO",
        "type": "CG",
        "name": "1 GB",
        "price": 350,
        "size": "1 GB",
        "validity": "1 Month"
    },
    {
        "id": 178,
        "network": "GLO",
        "type": "CG",
        "name": "10 GB",
        "price": 2000,
        "size": "10 GB",
        "validity": "1 Month"
    },
    {
        "id": 174,
        "network": "GLO",
        "type": "CG",
        "name": "2 GB",
        "price": 970,
        "size": "2 GB",
        "validity": "1 Month"
    },
    {
        "id": 208,
        "network": "GLO",
        "type": "CG",
        "name": "200 MB",
        "price": 140,
        "size": "200 MB",
        "validity": "1 Month"
    },
    {
        "id": 350,
        "network": "GLO",
        "type": "CG",
        "name": "3 GB",
        "price": 850,
        "size": "3 GB",
        "validity": "3 Days"
    },
    {
        "id": 351,
        "network": "GLO",
        "type": "CG",
        "name": "3 GB",
        "price": 1050,
        "size": "3 GB",
        "validity": "1 Week"
    },
    {
        "id": 176,
        "network": "GLO",
        "type": "CG",
        "name": "3 GB",
        "price": 850,
        "size": "3 GB",
        "validity": "1 Month"
    },
    {
        "id": 352,
        "network": "GLO",
        "type": "CG",
        "name": "5 GB",
        "price": 1500,
        "size": "5 GB",
        "validity": "3 Days"
    },
    {
        "id": 353,
        "network": "GLO",
        "type": "CG",
        "name": "5 GB",
        "price": 1750,
        "size": "5 GB",
        "validity": "1 Week"
    },
    {
        "id": 177,
        "network": "GLO",
        "type": "CG",
        "name": "5 GB",
        "price": 1500,
        "size": "5 GB",
        "validity": "1 Month"
    },
    {
        "id": 172,
        "network": "GLO",
        "type": "CG",
        "name": "500 MB",
        "price": 300,
        "size": "500 MB",
        "validity": "1 Month"
    },
    {
        "id": 11365,
        "network": "GLO",
        "type": "GIFTING",
        "name": "1.1GB + 1.5GB Night, 2.6 GB",
        "price": 1020,
        "size": "1.1GB + 1.5GB Night, 2.6 GB",
        "validity": "1 Month"
    },
    {
        "id": 11370,
        "network": "GLO",
        "type": "GIFTING",
        "name": "10.5GB + 2GB Night, 12.5 GB",
        "price": 3950,
        "size": "10.5GB + 2GB Night, 12.5 GB",
        "validity": "1 Month"
    },
    {
        "id": 11371,
        "network": "GLO",
        "type": "GIFTING",
        "name": "13.5GB + 2.5GB Night, 16 GB",
        "price": 4900,
        "size": "13.5GB + 2.5GB Night, 16 GB",
        "validity": "1 Month"
    },
    {
        "id": 11378,
        "network": "GLO",
        "type": "GIFTING",
        "name": "18.5GB + 2GB Night, 20.5 GB",
        "price": 5900,
        "size": "18.5GB + 2GB Night, 20.5 GB",
        "validity": "1 Month"
    },
    {
        "id": 11379,
        "network": "GLO",
        "type": "GIFTING",
        "name": "18.5GB + 2GB Night, 20.5 GB",
        "price": 5900,
        "size": "18.5GB + 2GB Night, 20.5 GB",
        "validity": "1 Week"
    },
    {
        "id": 11372,
        "network": "GLO",
        "type": "GIFTING",
        "name": "26GB + 2GB Night , 28 GB",
        "price": 7900,
        "size": "26GB + 2GB Night , 28 GB",
        "validity": "1 Month"
    },
    {
        "id": 11366,
        "network": "GLO",
        "type": "GIFTING",
        "name": "2GB + 3GB Night, 5 GB",
        "price": 1500,
        "size": "2GB + 3GB Night, 5 GB",
        "validity": "1 Month"
    },
    {
        "id": 11367,
        "network": "GLO",
        "type": "GIFTING",
        "name": "3.15GB + 3GB Night, 6.15 GB",
        "price": 2000,
        "size": "3.15GB + 3GB Night, 6.15 GB",
        "validity": "1 Month"
    },
    {
        "id": 11368,
        "network": "GLO",
        "type": "GIFTING",
        "name": "4.25GB + 3GB Night, 7.25 GB",
        "price": 2500,
        "size": "4.25GB + 3GB Night, 7.25 GB",
        "validity": "1 Month"
    },
    {
        "id": 11369,
        "network": "GLO",
        "type": "GIFTING",
        "name": "8GB + 2GB Night, 10 GB",
        "price": 2950,
        "size": "8GB + 2GB Night, 10 GB",
        "validity": "1 Month"
    },
    {
        "id": 355,
        "network": "GLO",
        "type": "SME",
        "name": "1.5 GB",
        "price": 350,
        "size": "1.5 GB",
        "validity": "1 Day"
    },
    {
        "id": 357,
        "network": "GLO",
        "type": "SME",
        "name": "10 GB",
        "price": 2000,
        "size": "10 GB",
        "validity": "1 Week"
    },
    {
        "id": 356,
        "network": "GLO",
        "type": "SME",
        "name": "2.5 GB",
        "price": 560,
        "size": "2.5 GB",
        "validity": "2 Days"
    },
    {
        "id": 354,
        "network": "GLO",
        "type": "SME",
        "name": "750 MB",
        "price": 250,
        "size": "750 MB",
        "validity": "1 Day"
    },
    {
        "id": 282,
        "network": "9MOBILE",
        "type": "SME",
        "name": "1 GB",
        "price": 460,
        "size": "1 GB",
        "validity": "1 Month"
    },
    {
        "id": 290,
        "network": "9MOBILE",
        "type": "SME",
        "name": "1.5 GB",
        "price": 350,
        "size": "1.5 GB",
        "validity": "1 Month"
    },
    {
        "id": 293,
        "network": "9MOBILE",
        "type": "SME",
        "name": "10 GB",
        "price": 2000,
        "size": "10 GB",
        "validity": "1 Month"
    },
    {
        "id": 278,
        "network": "9MOBILE",
        "type": "SME",
        "name": "2 GB",
        "price": 900,
        "size": "2 GB",
        "validity": "1 Month"
    },
    {
        "id": 291,
        "network": "9MOBILE",
        "type": "SME",
        "name": "3 GB",
        "price": 1410,
        "size": "3 GB",
        "validity": "1 Month"
    },
    {
        "id": 142,
        "network": "9MOBILE",
        "type": "SME",
        "name": "4 GB",
        "price": 1780,
        "size": "4 GB",
        "validity": "1 Month"
    },
    {
        "id": 292,
        "network": "9MOBILE",
        "type": "SME",
        "name": "5 GB",
        "price": 2170,
        "size": "5 GB",
        "validity": "1 Month"
    },
    {
        "id": 216,
        "network": "9MOBILE",
        "type": "SME",
        "name": "500 MB",
        "price": 240,
        "size": "500 MB",
        "validity": "1 Month"
    }
];
