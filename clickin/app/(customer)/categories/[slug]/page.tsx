import { getAllShops } from "@/lib/vendor-service"
import { SHOPS } from "@/lib/mock-data"
import { CategoryDetailClient } from "@/components/customer/category-detail-client"
import { VendorShop } from "@/lib/types/vendor"

export default async function CategoryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug: rawSlug } = await params
    const slug = decodeURIComponent(rawSlug)
    const lowerSlug = slug.toLowerCase()

    // Fetch all shops and filter by category
    const allFirestoreShops = await getAllShops()

    let matchingShops: VendorShop[] = allFirestoreShops.filter(shop => {
        const tagMatch = (shop.tags || []).some(t => t.toLowerCase().includes(lowerSlug) || lowerSlug.includes(t.toLowerCase()))
        const cuisineMatch = (shop.cuisineType || []).some(c => c.toLowerCase().includes(lowerSlug) || lowerSlug.includes(c.toLowerCase()))
        return tagMatch || cuisineMatch
    })

    // Fallback/Combine with mock data if needed for demo
    if (matchingShops.length === 0) {
        const mockMatches = SHOPS.filter(shop =>
            shop.tags.some(t => t.toLowerCase().includes(lowerSlug) || lowerSlug.includes(t.toLowerCase())) ||
            shop.menu.some(item => item.category.toLowerCase().includes(lowerSlug) || lowerSlug.includes(item.category.toLowerCase()))
        ) as any[]
        matchingShops = mockMatches
    }

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900">
            <CategoryDetailClient slug={slug} shops={matchingShops} />
        </div>
    )
}
