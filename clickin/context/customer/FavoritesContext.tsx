"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@/context/auth/AuthContext";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface FavoritesData {
    likedShops: string[];
    likedItems: string[];
}

interface FavoritesContextType {
    likedShops: Set<string>;
    likedItems: Set<string>;
    toggleShopLike: (shopId: string) => void;
    toggleItemLike: (itemId: string) => void;
    isShopLiked: (shopId: string) => boolean;
    isItemLiked: (itemId: string) => boolean;
    loading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType>({
    likedShops: new Set(),
    likedItems: new Set(),
    toggleShopLike: () => { },
    toggleItemLike: () => { },
    isShopLiked: () => false,
    isItemLiked: () => false,
    loading: true,
});

export const useFavorites = () => useContext(FavoritesContext);

const GUEST_STORAGE_KEY = "guest-favorites";

function loadGuestFavorites(): FavoritesData {
    try {
        const raw = localStorage.getItem(GUEST_STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            return {
                likedShops: Array.isArray(parsed.likedShops) ? parsed.likedShops : [],
                likedItems: Array.isArray(parsed.likedItems) ? parsed.likedItems : [],
            };
        }
    } catch { }
    return { likedShops: [], likedItems: [] };
}

function saveGuestFavorites(data: FavoritesData) {
    try {
        localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(data));
    } catch { }
}

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
    const { user, loading: authLoading } = useAuth();
    const [likedShops, setLikedShops] = useState<Set<string>>(new Set());
    const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const isInitialLoad = useRef(true);
    const lastUserId = useRef<string | null>(null);

    // ── Load favorites when user changes (login / logout) ──
    useEffect(() => {
        // Don't load until auth is ready
        if (authLoading) return;

        const currentUid = user?.uid || null;

        // Skip if same user (avoids re-fetching on re-renders)
        if (currentUid === lastUserId.current && !isInitialLoad.current) return;
        lastUserId.current = currentUid;
        isInitialLoad.current = true;

        const loadFavorites = async () => {
            if (user) {
                // Signed-in: load from Firestore user doc
                try {
                    const userRef = doc(db, "users", user.uid);
                    const snap = await getDoc(userRef);
                    if (snap.exists()) {
                        const data = snap.data();
                        setLikedShops(new Set(Array.isArray(data.likedShops) ? data.likedShops : []));
                        setLikedItems(new Set(Array.isArray(data.likedItems) ? data.likedItems : []));
                    } else {
                        setLikedShops(new Set());
                        setLikedItems(new Set());
                    }
                } catch (err: any) {
                    if (err?.code !== "unavailable") {
                        console.warn("Failed to load favorites from Firestore:", err.message || err);
                    }
                    setLikedShops(new Set());
                    setLikedItems(new Set());
                }
            } else {
                // Guest: load from localStorage
                const guest = loadGuestFavorites();
                setLikedShops(new Set(guest.likedShops));
                setLikedItems(new Set(guest.likedItems));
            }
            setLoading(false);
            // Mark initial load as done AFTER state is set
            // Use a microtask to ensure setState has been processed
            setTimeout(() => {
                isInitialLoad.current = false;
            }, 100);
        };

        loadFavorites();
    }, [user, authLoading]);

    // ── Auto-persist whenever likedShops or likedItems change (skip initial load) ──
    useEffect(() => {
        if (isInitialLoad.current) return; // Don't persist the initial load

        const data: FavoritesData = {
            likedShops: Array.from(likedShops),
            likedItems: Array.from(likedItems),
        };

        if (user) {
            // Save directly to the user doc as top-level fields
            const userRef = doc(db, "users", user.uid);
            setDoc(userRef, { likedShops: data.likedShops, likedItems: data.likedItems }, { merge: true })
                .catch((err: any) => {
                    if (err?.code !== "unavailable") {
                        console.error("Failed to save favorites to Firestore:", err.message || err);
                    }
                });
        } else {
            saveGuestFavorites(data);
        }
    }, [likedShops, likedItems, user]);

    // ── Toggle functions ──
    const toggleShopLike = useCallback((shopId: string) => {
        setLikedShops((prev) => {
            const next = new Set(prev);
            if (next.has(shopId)) {
                next.delete(shopId);
            } else {
                next.add(shopId);
            }
            return next;
        });
    }, []);

    const toggleItemLike = useCallback((itemId: string) => {
        setLikedItems((prev) => {
            const next = new Set(prev);
            if (next.has(itemId)) {
                next.delete(itemId);
            } else {
                next.add(itemId);
            }
            return next;
        });
    }, []);

    const isShopLiked = useCallback((shopId: string) => likedShops.has(shopId), [likedShops]);
    const isItemLiked = useCallback((itemId: string) => likedItems.has(itemId), [likedItems]);

    return (
        <FavoritesContext.Provider
            value={{ likedShops, likedItems, toggleShopLike, toggleItemLike, isShopLiked, isItemLiked, loading }}
        >
            {children}
        </FavoritesContext.Provider>
    );
}
