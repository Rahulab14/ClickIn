"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

interface CartContextType {
    items: { [itemId: string]: number }
    addItem: (itemId: string) => void
    removeItem: (itemId: string) => void
    updateQuantity: (itemId: string, delta: number) => void
    clearCart: () => void
    cartTotal: number
    getItemCount: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<{ [itemId: string]: number }>({})
    const [isLoaded, setIsLoaded] = useState(false)

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const savedCart = localStorage.getItem("cart-storage")
            if (savedCart) {
                setItems(JSON.parse(savedCart))
            }
        } catch (error) {
            console.error("Failed to load cart from storage", error)
        } finally {
            setIsLoaded(true)
        }
    }, [])

    // Save to localStorage on change
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem("cart-storage", JSON.stringify(items))
        }
    }, [items, isLoaded])

    const addItem = (itemId: string) => {
        setItems(prev => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }))
    }

    const removeItem = (itemId: string) => {
        setItems(prev => {
            const newCart = { ...prev }
            delete newCart[itemId]
            return newCart
        })
    }

    const updateQuantity = (itemId: string, delta: number) => {
        setItems(prev => {
            const currentQty = prev[itemId] || 0
            const newQty = currentQty + delta

            if (newQty <= 0) {
                const newCart = { ...prev }
                delete newCart[itemId]
                return newCart
            }

            return { ...prev, [itemId]: newQty }
        })
    }

    const clearCart = () => {
        setItems({})
    }

    const getItemCount = () => {
        return Object.values(items).reduce((a, b) => a + b, 0)
    }

    // Note: To get the actual total price, we need the item details (price). 
    // Since the context doesn't have the full menu, we can't calculate price here easily 
    // without passing the menu or looking it up. 
    // Consumers of the context should calculate total based on the items they have access to.
    const cartTotal = 0

    return (
        <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, cartTotal, getItemCount }}>
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext)
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider")
    }
    return context
}
