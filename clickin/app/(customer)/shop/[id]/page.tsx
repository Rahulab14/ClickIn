import { getShop, getMenuItems } from "@/lib/vendor-service"
import { getShopById } from "@/lib/mock-data"
import { ShopMenuClient } from "@/components/customer/shop-menu-client"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function ShopMenuPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: shopId } = await params

    // Try Firestore first
    let shop: any = await getShop(shopId)
    let menu: any[] = []

    if (shop) {
        menu = await getMenuItems(shopId)
    } else {
        // Fallback to mock data for existing links (e.g. from static categories)
        shop = getShopById(shopId)
        if (shop) {
            menu = shop.menu
        }
    }

    if (!shop) {
        return notFound()
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-28 font-sans transition-all duration-300">
            <ShopMenuClient shop={shop} menu={menu} />
        </div>
    )
}
