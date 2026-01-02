import { NextResponse } from 'next/server';
import { fetchFullCatalog, categorizeProducts } from '@/lib/bulkacc-service';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const products = await fetchFullCatalog();
        const categorized = categorizeProducts(products);

        // Pricing is already applied in fetchFullCatalog via calculatePrice

        // Sort by stock descending within categories
        Object.keys(categorized).forEach(key => {
            categorized[key] = categorized[key].sort((a, b) => b.inStock - a.inStock);
        });

        // Also return a flat list of just IDs/codes to validate order requests quickly if needed,
        // but for the UI, the categorized map is enough.

        return NextResponse.json({
            success: true,
            data: categorized,
            total: products.length,
            timestamp: Date.now()
        });
    } catch (error: any) {
        console.error('Catalog fetch error:', error);
        return NextResponse.json({ message: 'Failed to fetch catalog' }, { status: 500 });
    }
}
