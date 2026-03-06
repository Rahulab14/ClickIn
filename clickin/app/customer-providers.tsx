"use client"

import { CartProvider } from "@/context/customer/CartContext"
import { FavoritesProvider } from "@/context/customer/FavoritesContext"

export function CustomerProviders({ children }: { children: React.ReactNode }) {
    return (
        <FavoritesProvider>
            <CartProvider>
                {children}
            </CartProvider>
        </FavoritesProvider>
    )
}
