import { CategoryDetailClient } from "@/components/customer/category-detail-client"

export default async function CategoryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug: rawSlug } = await params
    const slug = decodeURIComponent(rawSlug)

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900">
            <CategoryDetailClient slug={slug} />
        </div>
    )
}
