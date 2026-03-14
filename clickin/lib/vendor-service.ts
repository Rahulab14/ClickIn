import { db } from "@/lib/firebase";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    addDoc,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    Timestamp,
    runTransaction,
    type Unsubscribe,
} from "firebase/firestore";
import type {
    VendorShop,
    VendorMenuItem,
    VendorOrder,
    VendorStaff,
    VendorSettings,
    VendorTransaction,
    VendorCategory,
    VendorNotification,
    VendorProfile,
    StaffActivity,
    DailySummary,
    OrderStatus,
    OperatingHours,
} from "@/lib/types/vendor";

// =============================================
// DEMO DATA — used when Firestore has no data
// =============================================

const DEMO_SHOP: VendorShop = {
    id: "demo-shop",
    name: "Sultan Kacchi",
    description: "Authentic Hyderabadi Biryani & More",
    logo: "",
    address: "123 Food Street, Campus Area",
    location: "Main Block",
    phone: "+91 98765 43210",
    contactPhone: "+91 98765 43210",
    contactEmail: "sultan@clickin.app",
    cuisineType: ["Biryani", "Non-Veg", "South Indian"],
    rating: 4.5,
    ratingCount: 1,
    totalStars: 4.5,
    tags: ["Biryani", "Non-Veg", "South Indian"],
    isOnline: true,
    estimatedWaitTime: 20,
    holidayMode: false,
    holidayMessage: "",
    ownerId: "demo-owner",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
};

const DEMO_MENU: VendorMenuItem[] = [
    { id: "m1", shopId: "demo-shop", name: "Chicken Biryani", description: "Aromatic basmati rice with tender chicken", price: 120, category: "Main Course", image: "🍗", isVeg: false, available: true, bestseller: true, stock: 25, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: "m2", shopId: "demo-shop", name: "Veg Meals", description: "Complete South Indian thali", price: 80, category: "Main Course", image: "🍛", isVeg: true, available: true, bestseller: false, stock: 40, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: "m3", shopId: "demo-shop", name: "Paneer Butter Masala", description: "Rich creamy paneer curry", price: 100, category: "Curry", image: "🧀", isVeg: true, available: false, bestseller: false, stock: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: "m4", shopId: "demo-shop", name: "Chapati", description: "Soft wheat flatbread", price: 15, category: "Breads", image: "🫓", isVeg: true, available: true, bestseller: false, stock: -1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: "m5", shopId: "demo-shop", name: "Tea", description: "Hot masala chai", price: 10, category: "Beverages", image: "☕", isVeg: true, available: true, bestseller: true, stock: -1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: "m6", shopId: "demo-shop", name: "Mutton Biryani", description: "Slow-cooked mutton dum biryani", price: 180, category: "Main Course", image: "🍖", isVeg: false, available: true, bestseller: true, stock: 15, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: "m7", shopId: "demo-shop", name: "Chicken 65", description: "Spicy deep-fried chicken", price: 90, category: "Starters", image: "🍗", isVeg: false, available: true, bestseller: false, stock: 30, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: "m8", shopId: "demo-shop", name: "Lassi", description: "Cool sweet yogurt drink", price: 30, category: "Beverages", image: "🥛", isVeg: true, available: true, bestseller: false, stock: 20, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

const DEMO_ORDERS: VendorOrder[] = [
    { id: "ORD-1001", shopId: "demo-shop", items: [{ menuItemId: "m1", name: "Chicken Biryani", price: 120, quantity: 2, isVeg: false, image: "🍗" }, { menuItemId: "m5", name: "Tea", price: 10, quantity: 2, isVeg: true, image: "☕" }], total: 270, status: "NEW", payment: "UPI", orderType: "Dine-in", customerName: "Rahul", customerPhone: "+91 98765 43210", tableNumber: "T-4", createdAt: new Date(Date.now() - 5 * 60000).toISOString(), updatedAt: new Date().toISOString() },
    { id: "ORD-1002", shopId: "demo-shop", items: [{ menuItemId: "m2", name: "Veg Meals", price: 80, quantity: 1, isVeg: true, image: "🍛" }, { menuItemId: "m4", name: "Chapati", price: 15, quantity: 4, isVeg: true, image: "🫓" }], total: 148, status: "PREPARING", payment: "CASH", orderType: "Takeaway", customerName: "Priya", customerPhone: "+91 87654 32109", createdAt: new Date(Date.now() - 12 * 60000).toISOString(), updatedAt: new Date().toISOString() },
    { id: "ORD-1003", shopId: "demo-shop", items: [{ menuItemId: "m6", name: "Mutton Biryani", price: 180, quantity: 1, isVeg: false, image: "🍖" }, { menuItemId: "m7", name: "Chicken 65", price: 90, quantity: 1, isVeg: false, image: "🍗" }, { menuItemId: "m8", name: "Lassi", price: 30, quantity: 2, isVeg: true, image: "🥛" }], total: 345, status: "READY", payment: "UPI", orderType: "Dine-in", customerName: "Arun", customerPhone: "+91 76543 21098", tableNumber: "T-7", createdAt: new Date(Date.now() - 25 * 60000).toISOString(), updatedAt: new Date().toISOString() },
    { id: "ORD-1004", shopId: "demo-shop", items: [{ menuItemId: "m1", name: "Chicken Biryani", price: 120, quantity: 3, isVeg: false, image: "🍗" }], total: 378, status: "COMPLETED", payment: "UPI", orderType: "Takeaway", customerName: "Karthik", customerPhone: "+91 65432 10987", createdAt: new Date(Date.now() - 60 * 60000).toISOString(), updatedAt: new Date(Date.now() - 30 * 60000).toISOString(), completedAt: new Date(Date.now() - 30 * 60000).toISOString() },
    { id: "ORD-1005", shopId: "demo-shop", items: [{ menuItemId: "m2", name: "Veg Meals", price: 80, quantity: 2, isVeg: true, image: "🍛" }, { menuItemId: "m5", name: "Tea", price: 10, quantity: 2, isVeg: true, image: "☕" }], total: 189, status: "COMPLETED", payment: "CASH", orderType: "Dine-in", customerName: "Meena", customerPhone: "+91 54321 09876", tableNumber: "T-2", createdAt: new Date(Date.now() - 90 * 60000).toISOString(), updatedAt: new Date(Date.now() - 60 * 60000).toISOString(), completedAt: new Date(Date.now() - 60 * 60000).toISOString() },
    { id: "ORD-1006", shopId: "demo-shop", items: [{ menuItemId: "m3", name: "Paneer Butter Masala", price: 100, quantity: 1, isVeg: true, image: "🧀" }], total: 105, status: "CANCELLED", payment: "UPI", orderType: "Dine-in", customerName: "Suresh", customerPhone: "+91 43210 98765", cancelReason: "Customer requested cancellation", cancelledBy: "Customer", createdAt: new Date(Date.now() - 120 * 60000).toISOString(), updatedAt: new Date(Date.now() - 110 * 60000).toISOString() },
];

const DEMO_STAFF: VendorStaff[] = [
    { id: "s1", shopId: "demo-shop", name: "Ravi Kumar", email: "ravi@clickin.app", phone: "+91 98765 11111", role: "WAITER", status: "APPROVED", isActive: true, shiftStart: "09:00", shiftEnd: "17:00", createdAt: new Date().toISOString(), lastActiveAt: new Date().toISOString() },
    { id: "s2", shopId: "demo-shop", name: "Suresh Chef", email: "suresh@clickin.app", phone: "+91 98765 22222", role: "CHEF", status: "APPROVED", isActive: true, shiftStart: "08:00", shiftEnd: "16:00", createdAt: new Date().toISOString(), lastActiveAt: new Date().toISOString() },
    { id: "s3", shopId: "demo-shop", name: "Ankit Sharma", email: "ankit@clickin.app", phone: "+91 98765 33333", role: "CHEF", status: "APPROVED", isActive: true, shiftStart: "12:00", shiftEnd: "20:00", createdAt: new Date().toISOString(), lastActiveAt: new Date(Date.now() - 3600000).toISOString() },
    { id: "s4", shopId: "demo-shop", name: "Priya M", email: "priya@clickin.app", phone: "+91 98765 44444", role: "CASHIER", status: "APPROVED", isActive: false, shiftStart: "10:00", shiftEnd: "18:00", createdAt: new Date().toISOString() },
    { id: "s5", shopId: "demo-shop", name: "Deepak R", email: "deepak@clickin.app", phone: "+91 98765 55555", role: "WAITER", status: "PENDING", isActive: false, createdAt: new Date().toISOString() },
];

const DEMO_STAFF_ACTIVITY: StaffActivity[] = [
    { id: "a1", shopId: "demo-shop", staffId: "s1", staffName: "Ravi", staffRole: "WAITER", action: "Verified 42 Orders", impact: "positive", timestamp: new Date().toISOString() },
    { id: "a2", shopId: "demo-shop", staffId: "s2", staffName: "Suresh", staffRole: "CHEF", action: "Marked 3 items Out of Stock", impact: "neutral", timestamp: new Date(Date.now() - 2 * 3600000).toISOString() },
    { id: "a3", shopId: "demo-shop", staffId: "s1", staffName: "Ravi", staffRole: "WAITER", action: "Cancelled Order #1042", impact: "negative", timestamp: new Date(Date.now() - 3 * 3600000).toISOString() },
    { id: "a4", shopId: "demo-shop", staffId: "s3", staffName: "Ankit", staffRole: "CHEF", action: "Completed 15 Orders", impact: "positive", timestamp: new Date(Date.now() - 6 * 3600000).toISOString() },
];

const DEFAULT_OPERATING_HOURS: OperatingHours[] = [
    { day: "Monday", isOpen: true, openTime: "08:00", closeTime: "22:00" },
    { day: "Tuesday", isOpen: true, openTime: "08:00", closeTime: "22:00" },
    { day: "Wednesday", isOpen: true, openTime: "08:00", closeTime: "22:00" },
    { day: "Thursday", isOpen: true, openTime: "08:00", closeTime: "22:00" },
    { day: "Friday", isOpen: true, openTime: "08:00", closeTime: "23:00" },
    { day: "Saturday", isOpen: true, openTime: "09:00", closeTime: "23:00" },
    { day: "Sunday", isOpen: false, openTime: "10:00", closeTime: "20:00" },
];

const DEMO_SETTINGS: VendorSettings = {
    shopId: "demo-shop",
    operatingHours: DEFAULT_OPERATING_HOURS,
    taxPercentage: 5,
    gstNumber: "29ABCDE1234F1Z5",
    // NOTE: this is just a placeholder demo ID – it's not a merchant handle and
    // may be blocked by real UPI apps (famapp/gpay will complain about non-merchant
    // IDs). Replace with your own valid merchant UPI when testing.
    upiId: "balajier2006@okaxis",
    bankAccountName: "Sultan Kacchi Foods Pvt Ltd",
    bankAccountNumber: "1234567890123456",
    bankIFSC: "SBIN0001234",
    notifyNewOrders: true,
    notifyOrderStatusChange: true,
    notifyLowStock: true,
    notifyDailySummary: true,
    orderAlertSound: true,
    isManualMode: false,
};

const DEMO_TRANSACTIONS: VendorTransaction[] = [
    { id: "t1", shopId: "demo-shop", orderId: "ORD-1001", type: "PAYMENT", amount: 270, method: "UPI", status: "COMPLETED", description: "Payment for Order #1001", createdAt: new Date(Date.now() - 5 * 60000).toISOString() },
    { id: "t2", shopId: "demo-shop", orderId: "ORD-1002", type: "PAYMENT", amount: 148, method: "CASH", status: "COMPLETED", description: "Payment for Order #1002", createdAt: new Date(Date.now() - 12 * 60000).toISOString() },
    { id: "t3", shopId: "demo-shop", orderId: "ORD-1003", type: "PAYMENT", amount: 345, method: "UPI", status: "COMPLETED", description: "Payment for Order #1003", createdAt: new Date(Date.now() - 25 * 60000).toISOString() },
    { id: "t4", shopId: "demo-shop", orderId: "ORD-1004", type: "PAYMENT", amount: 378, method: "UPI", status: "COMPLETED", description: "Payment for Order #1004", createdAt: new Date(Date.now() - 60 * 60000).toISOString() },
    { id: "t5", shopId: "demo-shop", orderId: "ORD-1005", type: "PAYMENT", amount: 189, method: "CASH", status: "COMPLETED", description: "Payment for Order #1005", createdAt: new Date(Date.now() - 90 * 60000).toISOString() },
    { id: "t6", shopId: "demo-shop", orderId: "ORD-1006", type: "REFUND", amount: 105, method: "UPI", status: "COMPLETED", description: "Refund for cancelled Order #1006", createdAt: new Date(Date.now() - 110 * 60000).toISOString() },
    { id: "t7", shopId: "demo-shop", orderId: "", type: "PAYOUT", amount: 8500, method: "UPI", status: "COMPLETED", description: "Daily payout settlement", createdAt: new Date(Date.now() - 24 * 3600000).toISOString() },
];

const DEMO_DAILY_SUMMARY: DailySummary = {
    date: new Date().toISOString().split("T")[0],
    shopId: "demo-shop",
    totalRevenue: 12450,
    onlineRevenue: 8300,
    cashRevenue: 4150,
    totalOrders: 143,
    completedOrders: 140,
    cancelledOrders: 3,
    averageOrderValue: 87,
    topSellingItems: [
        { name: "Chicken Biryani", count: 45, revenue: 5400 },
        { name: "Mutton Biryani", count: 28, revenue: 5040 },
        { name: "Veg Meals", count: 22, revenue: 1760 },
        { name: "Tea", count: 56, revenue: 560 },
        { name: "Chicken 65", count: 18, revenue: 1620 },
    ],
    peakHour: "1:00 PM - 2:00 PM",
    newCustomers: 24,
    returningCustomers: 119,
    hourlySales: Array.from({ length: 24 }, (_, i) => {
        const baseRevenue = [30, 10, 5, 5, 10, 20, 45, 80, 120, 100, 90, 140, 180, 200, 160, 140, 130, 150, 170, 120, 90, 70, 50, 35][i];
        return { hour: `${i}:00`, revenue: baseRevenue * 10, orders: Math.floor(baseRevenue / 8) };
    }),
};

const DEMO_NOTIFICATIONS: VendorNotification[] = [
    { id: "n1", shopId: "demo-shop", type: "NEW_ORDER", title: "New Order #1001", message: "2x Chicken Biryani, 2x Tea — Table T-4", isRead: false, orderId: "ORD-1001", createdAt: new Date(Date.now() - 5 * 60000).toISOString() },
    { id: "n2", shopId: "demo-shop", type: "LOW_STOCK", title: "Low Stock Alert", message: "Chicken and Basmati Rice are running low", isRead: false, createdAt: new Date(Date.now() - 30 * 60000).toISOString() },
    { id: "n3", shopId: "demo-shop", type: "ORDER_STATUS", title: "Order #1003 Ready", message: "Order for Arun (Table T-7) is ready for pickup", isRead: true, orderId: "ORD-1003", createdAt: new Date(Date.now() - 45 * 60000).toISOString() },
    { id: "n4", shopId: "demo-shop", type: "DAILY_SUMMARY", title: "Yesterday's Summary", message: "Revenue: ₹11,200 | Orders: 128 | Avg: ₹87.5", isRead: true, createdAt: new Date(Date.now() - 12 * 3600000).toISOString() },
];

// =============================================
// SERVICE: tries Firestore first, falls back to demo data
// =============================================

// Helper to check if Firestore is configured
const isFirestoreConfigured = () => {
    try {
        return !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    } catch {
        return false;
    }
};

// ---- SHOP ----
export async function getShop(shopId: string): Promise<VendorShop | null> {
    if (!shopId) return null;
    if (shopId === "demo-shop") return DEMO_SHOP;
    try {
        const snap = await getDoc(doc(db, "shops", shopId));
        if (snap.exists()) return { id: snap.id, ...snap.data() } as VendorShop;
    } catch (e) {
        if (e && typeof e === 'object' && 'code' in e && e.code !== 'unavailable') {
            console.warn("Firestore getShop error", e);
        }
    }
    return null;
}

export async function getAllShops(): Promise<VendorShop[]> {
    try {
        const q = query(collection(db, "shops"), orderBy("name", "asc"));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as VendorShop));
    } catch (e) {
        console.warn("Firestore getAllShops error", e);
        return [];
    }
}

// Real-time listener for all shops
export function subscribeToAllShops(callback: (shops: VendorShop[]) => void): Unsubscribe {
    const q = query(collection(db, "shops"), orderBy("name", "asc"));
    return onSnapshot(q, (snap) => {
        callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as VendorShop)));
    }, (error) => {
        console.error("Firestore subscribeToAllShops error:", error);
    });
}

export async function updateShop(shopId: string, data: Partial<VendorShop>): Promise<void> {
    if (!shopId || shopId === "demo-shop") return;
    await updateDoc(doc(db, "shops", shopId), { ...data, updatedAt: new Date().toISOString() });
}

export async function toggleShopOnline(shopId: string, isOnline: boolean): Promise<void> {
    if (!shopId || shopId === "demo-shop") return;
    await updateDoc(doc(db, "shops", shopId), { isOnline, updatedAt: new Date().toISOString() });
}

// Real-time shop listener
export function subscribeToShop(shopId: string, callback: (shop: VendorShop | null) => void): Unsubscribe {
    if (!shopId || shopId === "demo-shop") {
        callback(DEMO_SHOP);
        return () => { };
    }
    return onSnapshot(doc(db, "shops", shopId), (snap) => {
        if (snap.exists()) {
            callback({ id: snap.id, ...snap.data() } as VendorShop);
        } else {
            callback(null);
        }
    }, (error) => {
        console.error(`Firestore subscribeToShop error for ${shopId}:`, error);
    });
}

// ---- MENU ----
export async function getMenuItems(shopId: string): Promise<VendorMenuItem[]> {
    if (!shopId) return [];
    if (shopId === "demo-shop") return DEMO_MENU;
    try {
        const q = query(collection(db, "shops", shopId, "menu"), orderBy("name", "asc"));
        const snap = await getDocs(q);
        if (!snap.empty) return snap.docs.map(d => ({ id: d.id, ...d.data() }) as VendorMenuItem);
        return [];
    } catch (e) { console.warn("Firestore getMenuItems error", e); }
    return [];
}

// Real-time listener for menu items
export function subscribeToMenuItems(shopId: string, callback: (items: VendorMenuItem[]) => void): Unsubscribe {
    if (!shopId) {
        callback([]);
        return () => { };
    }
    if (shopId === "demo-shop") {
        callback(DEMO_MENU);
        return () => { };
    }
    const q = query(collection(db, "shops", shopId, "menu"), orderBy("name", "asc"));
    return onSnapshot(q, (snap) => {
        callback(snap.docs.map(d => ({ id: d.id, ...d.data() }) as VendorMenuItem));
    }, (error) => {
        console.error(`Firestore subscribeToMenuItems error for ${shopId}:`, error);
    });
}

export async function addMenuItem(shopId: string, item: Omit<VendorMenuItem, "id" | "shopId" | "createdAt" | "updatedAt">): Promise<string> {
    if (!shopId || shopId === "demo-shop") return "demo-" + Date.now();
    const ref = await addDoc(collection(db, "shops", shopId, "menu"), {
        ...item, shopId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    });
    return ref.id;
}

export async function updateMenuItem(shopId: string, itemId: string, data: Partial<VendorMenuItem>): Promise<void> {
    if (!shopId || shopId === "demo-shop") return;
    await updateDoc(doc(db, "shops", shopId, "menu", itemId), { ...data, updatedAt: new Date().toISOString() });
}

export async function deleteMenuItem(shopId: string, itemId: string): Promise<void> {
    if (!shopId || shopId === "demo-shop") return;
    await deleteDoc(doc(db, "shops", shopId, "menu", itemId));
}

export async function toggleItemAvailability(shopId: string, itemId: string, available: boolean): Promise<void> {
    if (!shopId || shopId === "demo-shop") return;
    await updateDoc(doc(db, "shops", shopId, "menu", itemId), { available, updatedAt: new Date().toISOString() });
}

// Update stock quantity for a menu item
export async function updateMenuItemStock(shopId: string, itemId: string, newStock: number): Promise<void> {
    if (!shopId || shopId === "demo-shop") return;
    const updates: Record<string, any> = { stock: newStock, updatedAt: new Date().toISOString() };
    // Auto-mark unavailable when stock hits 0
    if (newStock === 0) updates.available = false;
    // Auto-mark available when stock goes above 0 (from 0)
    if (newStock > 0) updates.available = true;
    await updateDoc(doc(db, "shops", shopId, "menu", itemId), updates);
}

// Reduce stock when customer places an order (called from order placement)
export async function reduceMenuItemStock(shopId: string, items: { menuItemId: string; quantity: number }[]): Promise<boolean> {
    // return true if update succeeded, false if not (errors swallowed)
    if (!shopId || shopId === "demo-shop") return true;
    try {
        await runTransaction(db, async (transaction) => {
            for (const item of items) {
                const ref = doc(db, "shops", shopId, "menu", item.menuItemId);
                const snap = await transaction.get(ref);
                if (snap.exists()) {
                    const data = snap.data();
                    const currentStock = data.stock ?? -1;
                    // Only reduce if stock is tracked (not unlimited = -1)
                    if (currentStock >= 0) {
                        const newStock = Math.max(0, currentStock - item.quantity);
                        const updates: Record<string, any> = { stock: newStock, updatedAt: new Date().toISOString() };
                        if (newStock === 0) updates.available = false;
                        transaction.update(ref, updates);
                    }
                }
            }
        });
        return true;
    } catch (e) {
        console.error(`reduceMenuItemStock txn failed for shop=${shopId} items=`, items, e);
        return false;
    }
}

// ---- CATEGORIES ----
export async function getCategories(shopId: string): Promise<VendorCategory[]> {
    if (!shopId || shopId === "demo-shop") {
        const cats = [...new Set(DEMO_MENU.map(m => m.category))];
        return cats.map((c, i) => ({ id: `cat-${i}`, shopId: "demo-shop", name: c, sortOrder: i }));
    }
    try {
        const q = query(collection(db, "shops", shopId, "categories"), orderBy("sortOrder"));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }) as VendorCategory);
    } catch { return []; }
}

// ---- ORDERS ----
export async function getActiveOrders(shopId: string): Promise<VendorOrder[]> {
    if (!shopId) return [];
    try {
        const q = query(
            collection(db, "orders"),
            where("shopId", "==", shopId),
            where("status", "in", ["NEW", "PREPARING", "READY"]),
            orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }) as VendorOrder);
    } catch (e) { console.warn("Firestore getActiveOrders error", e); }
    return [];
}

export async function getOrderHistory(shopId: string, limitCount = 50): Promise<VendorOrder[]> {
    if (!shopId) return [];
    
    // Only fetch orders from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    try {
        const q = query(
            collection(db, "orders"),
            where("shopId", "==", shopId),
            where("status", "in", ["COMPLETED", "CANCELLED"]),
            where("createdAt", ">=", thirtyDaysAgo.toISOString()),
            orderBy("createdAt", "desc"),
            limit(limitCount)
        );
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }) as VendorOrder);
    } catch (e) { console.warn("Firestore getOrderHistory error", e); }
    return [];
}

export function subscribeToOrderHistory(
    shopId: string, 
    callback: (orders: VendorOrder[]) => void, 
    range: "TODAY" | "7DAYS" | "1MONTH" = "1MONTH",
    limitCount = 100
): Unsubscribe {
    if (!shopId) return () => {};
    
    const now = new Date();
    let startDate = new Date();
    
    if (range === "TODAY") {
        startDate.setHours(0, 0, 0, 0);
    } else if (range === "7DAYS") {
        startDate.setDate(now.getDate() - 7);
    } else {
        startDate.setDate(now.getDate() - 30);
    }

    const q = query(
        collection(db, "orders"),
        where("shopId", "==", shopId),
        where("status", "in", ["COMPLETED", "CANCELLED"]),
        where("createdAt", ">=", startDate.toISOString()),
        orderBy("createdAt", "desc"),
        limit(limitCount)
    );
    
    return onSnapshot(q, (snap) => {
        const orders = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as VendorOrder);
        callback(orders);
    }, (error) => {
        console.error("Firestore subscribeToOrderHistory error:", error);
    });
}

/**
 * Cleanup orders older than 30 days for a specific shop.
 * Based on user requirement to delete data after one month.
 */
export async function cleanupOldOrders(shopId: string): Promise<number> {
    if (!shopId || shopId === "demo-shop") return 0;
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    try {
        const q = query(
            collection(db, "orders"),
            where("shopId", "==", shopId),
            where("createdAt", "<", thirtyDaysAgo.toISOString())
        );
        
        const snap = await getDocs(q);
        let deletedCount = 0;
        
        for (const d of snap.docs) {
            await deleteDoc(doc(db, "orders", d.id));
            deletedCount++;
        }
        
        console.log(`🧹 Cleaned up ${deletedCount} old orders for shop: ${shopId}`);
        return deletedCount;
    } catch (e) {
        console.error("Error during order cleanup:", e);
        return 0;
    }
}

export async function updateOrderStatus(orderId: string, status: OrderStatus, extra?: Partial<VendorOrder>): Promise<void> {
    if (!orderId) return;
    const data: Record<string, unknown> = { status, updatedAt: new Date().toISOString(), ...extra };
    if (status === "COMPLETED") data.completedAt = new Date().toISOString();
    await updateDoc(doc(db, "orders", orderId), data);
}

export async function cancelOrder(orderId: string, reason: string, cancelledBy: string): Promise<void> {
    if (!orderId) return;
    await updateDoc(doc(db, "orders", orderId), {
        status: "CANCELLED", cancelReason: reason, cancelledBy, updatedAt: new Date().toISOString(),
    });
}

// Real-time order listener
export function subscribeToOrders(shopId: string, callback: (orders: VendorOrder[]) => void): Unsubscribe {
    if (!shopId) {
        callback([]);
        return () => { };
    }
    const q = query(
        collection(db, "orders"),
        where("shopId", "==", shopId),
        where("status", "in", ["NEW", "PREPARING", "READY"]),
        orderBy("createdAt", "desc")
    );
    return onSnapshot(q, (snap) => {
        callback(snap.docs.map(d => ({ id: d.id, ...d.data() }) as VendorOrder));
    }, (error) => {
        console.error(`Firestore subscribeToOrders error for ${shopId}:`, error);
    });
}

export function subscribeToOrdersByDate(shopId: string, date: string, callback: (orders: VendorOrder[]) => void): Unsubscribe {
    if (!shopId) {
        callback([]);
        return () => { };
    }
    if (shopId === "demo-shop") {
        callback(DEMO_ORDERS.filter(o => o.createdAt.startsWith(date)));
        return () => { };
    }
    const startOfDay = `${date}T00:00:00.000Z`;
    const endOfDay = `${date}T23:59:59.999Z`;

    const q = query(
        collection(db, "orders"),
        where("shopId", "==", shopId),
        where("createdAt", ">=", startOfDay),
        where("createdAt", "<=", endOfDay),
        orderBy("createdAt", "desc")
    );
    return onSnapshot(q, (snap) => {
        callback(snap.docs.map(d => ({ id: d.id, ...d.data() }) as VendorOrder));
    }, (error) => {
        console.error(`Firestore subscribeToOrdersByDate error for ${shopId} date ${date}:`, error);
    });
}

// ---- STAFF ----
export async function getStaff(shopId: string): Promise<VendorStaff[]> {
    if (!shopId || shopId === "demo-shop") return DEMO_STAFF;
    try {
        const q = query(collection(db, "shops", shopId, "staff"), orderBy("name"));
        const snap = await getDocs(q);
        if (!snap.empty) return snap.docs.map(d => ({ id: d.id, ...d.data() }) as VendorStaff);
        return [];
    } catch (e) { console.warn("Firestore getStaff error", e); }
    return [];
}

export async function addStaff(shopId: string, staff: Omit<VendorStaff, "id" | "shopId" | "createdAt">): Promise<string> {
    if (!shopId || shopId === "demo-shop") return "demo-staff-" + Date.now();
    const ref = await addDoc(collection(db, "shops", shopId, "staff"), {
        ...staff, shopId, createdAt: new Date().toISOString(),
    });
    return ref.id;
}

export async function updateStaff(shopId: string, staffId: string, data: Partial<VendorStaff>): Promise<void> {
    if (!shopId || shopId === "demo-shop") return;
    await updateDoc(doc(db, "shops", shopId, "staff", staffId), data);
}

export async function removeStaff(shopId: string, staffId: string): Promise<void> {
    if (!shopId || shopId === "demo-shop") return;
    await deleteDoc(doc(db, "shops", shopId, "staff", staffId));
}

export async function getStaffActivity(shopId: string): Promise<StaffActivity[]> {
    if (!shopId || shopId === "demo-shop") return DEMO_STAFF_ACTIVITY;
    try {
        const q = query(collection(db, "shops", shopId, "activity"), orderBy("timestamp", "desc"), limit(20));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }) as StaffActivity);
    } catch { return DEMO_STAFF_ACTIVITY; }
}

// Real-time staff activity listener
export function subscribeToStaffActivity(shopId: string, callback: (activity: StaffActivity[]) => void): Unsubscribe {
    if (!shopId || shopId === "demo-shop") {
        callback(DEMO_STAFF_ACTIVITY);
        return () => { };
    }
    const q = query(collection(db, "shops", shopId, "activity"), orderBy("timestamp", "desc"), limit(20));
    return onSnapshot(q, (snap) => {
        callback(snap.docs.map(d => ({ id: d.id, ...d.data() }) as StaffActivity));
    }, (error) => {
        console.error(`Firestore subscribeToStaffActivity error for ${shopId}:`, error);
    });
}

// ---- SETTINGS ----
export async function getSettings(shopId: string): Promise<VendorSettings> {
    if (!shopId || shopId === "demo-shop") return DEMO_SETTINGS;
    try {
        const snap = await getDoc(doc(db, "shops", shopId, "config", "settings"));
        if (snap.exists()) return snap.data() as VendorSettings;
    } catch (e) { console.warn("Firestore getSettings error", e); }
    return {
        shopId,
        operatingHours: DEFAULT_OPERATING_HOURS,
        taxPercentage: 0,
        gstNumber: "",
        upiId: "",
        bankAccountName: "",
        bankAccountNumber: "",
        bankIFSC: "",
        notifyNewOrders: true,
        notifyOrderStatusChange: true,
        notifyLowStock: true,
        notifyDailySummary: true,
        orderAlertSound: true,
        isManualMode: false,
    };
}

export async function updateSettings(shopId: string, data: Partial<VendorSettings>): Promise<void> {
    if (!shopId || shopId === "demo-shop") return;
    await setDoc(doc(db, "shops", shopId, "config", "settings"), data, { merge: true });
}

export function subscribeToSettings(shopId: string, callback: (settings: VendorSettings) => void): Unsubscribe {
    if (!shopId || shopId === "demo-shop") {
        callback(DEMO_SETTINGS);
        return () => { };
    }
    return onSnapshot(doc(db, "shops", shopId, "config", "settings"), (snap) => {
        if (snap.exists()) {
            callback(snap.data() as VendorSettings);
        } else {
            callback({
                shopId,
                operatingHours: DEFAULT_OPERATING_HOURS,
                taxPercentage: 0,
                gstNumber: "",
                upiId: "",
                bankAccountName: "",
                bankAccountNumber: "",
                bankIFSC: "",
                notifyNewOrders: true,
                notifyOrderStatusChange: true,
                notifyLowStock: true,
                notifyDailySummary: true,
                orderAlertSound: true,
                isManualMode: false,
            });
        }
    }, (error) => {
        console.error(`Firestore subscribeToSettings error for ${shopId}:`, error);
    });
}

// ---- TRANSACTIONS ----
export async function getTransactions(shopId: string): Promise<VendorTransaction[]> {
    if (!shopId || shopId === "demo-shop") return DEMO_TRANSACTIONS;
    try {
        const q = query(collection(db, "transactions"), where("shopId", "==", shopId), orderBy("createdAt", "desc"), limit(100));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }) as VendorTransaction);
    } catch { return []; }
}

export function subscribeToTransactions(shopId: string, callback: (transactions: VendorTransaction[]) => void): Unsubscribe {
    if (!shopId || shopId === "demo-shop") {
        callback(DEMO_TRANSACTIONS);
        return () => { };
    }
    const q = query(
        collection(db, "transactions"),
        where("shopId", "==", shopId),
        orderBy("createdAt", "desc"),
        limit(100)
    );
    return onSnapshot(q, (snap) => {
        callback(snap.docs.map(d => ({ id: d.id, ...d.data() }) as VendorTransaction));
    }, (error) => {
        console.error(`Firestore subscribeToTransactions error for ${shopId}:`, error);
    });
}

export async function createRefund(shopId: string, orderId: string, amount: number, method: "UPI" | "CASH"): Promise<void> {
    if (!shopId || shopId === "demo-shop") return;
    await addDoc(collection(db, "transactions"), {
        shopId, orderId, type: "REFUND", amount, method, status: "COMPLETED",
        description: `Refund for Order ${orderId}`, createdAt: new Date().toISOString(),
    });
}

// ---- ANALYTICS ----
export async function getDailySummary(shopId: string, date?: string): Promise<DailySummary> {
    if (!shopId || shopId === "demo-shop") return DEMO_DAILY_SUMMARY;
    const d = date || new Date().toISOString().split("T")[0];
    try {
        const snap = await getDoc(doc(db, "shops", shopId, "analytics", d));
        if (snap.exists()) return snap.data() as DailySummary;
    } catch { }
    return {
        date: d,
        shopId,
        totalRevenue: 0,
        onlineRevenue: 0,
        cashRevenue: 0,
        totalOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0,
        averageOrderValue: 0,
        topSellingItems: [],
        peakHour: "--",
        newCustomers: 0,
        returningCustomers: 0,
        hourlySales: [],
    };
}

// Real-time daily summary listener
export function subscribeToDailySummary(shopId: string, callback: (summary: DailySummary) => void, date?: string): Unsubscribe {
    const d = date || new Date().toISOString().split("T")[0];
    if (!shopId || shopId === "demo-shop") {
        callback(DEMO_DAILY_SUMMARY);
        return () => { };
    }
    return onSnapshot(doc(db, "shops", shopId, "analytics", d), (snap) => {
        if (snap.exists()) {
            callback(snap.data() as DailySummary);
        } else {
            callback({
                date: d,
                shopId,
                totalRevenue: 0,
                onlineRevenue: 0,
                cashRevenue: 0,
                totalOrders: 0,
                completedOrders: 0,
                cancelledOrders: 0,
                averageOrderValue: 0,
                topSellingItems: [],
                peakHour: "--",
                newCustomers: 0,
                returningCustomers: 0,
                hourlySales: [],
            });
        }
    }, (error) => {
        console.error(`Firestore subscribeToDailySummary error for ${shopId} (date: ${d}):`, error);
    });
}

export async function getMonthlySummary(shopId: string): Promise<DailySummary[]> {
    // Returns last 30 daily summaries
    if (!shopId || shopId === "demo-shop") {
        const summaries: DailySummary[] = [];
        for (let i = 0; i < 30; i++) {
            const date = new Date(Date.now() - i * 86400000).toISOString().split("T")[0];
            const summary = { ...DEMO_DAILY_SUMMARY, date, totalRevenue: Math.floor(DEMO_DAILY_SUMMARY.totalRevenue * (0.7 + Math.random() * 0.6)) };
            summaries.push(summary);
        }
        return summaries;
    }

    const summaries: DailySummary[] = [];
    for (let i = 0; i < 30; i++) {
        const date = new Date(Date.now() - i * 86400000).toISOString().split("T")[0];
        try {
            const snap = await getDoc(doc(db, "shops", shopId, "analytics", date));
            if (snap.exists()) {
                summaries.push(snap.data() as DailySummary);
                continue;
            }
        } catch { }
        summaries.push({
            date,
            shopId,
            totalRevenue: 0,
            onlineRevenue: 0,
            cashRevenue: 0,
            totalOrders: 0,
            completedOrders: 0,
            cancelledOrders: 0,
            averageOrderValue: 0,
            topSellingItems: [],
            peakHour: "--",
            newCustomers: 0,
            returningCustomers: 0,
            hourlySales: [],
        });
    }
    return summaries;
}

export function subscribeToMonthlySummary(shopId: string, callback: (summaries: DailySummary[]) => void): Unsubscribe {
    if (!shopId || shopId === "demo-shop") {
        const summaries: DailySummary[] = [];
        for (let i = 0; i < 30; i++) {
            const date = new Date(Date.now() - i * 86400000).toISOString().split("T")[0];
            summaries.push({ ...DEMO_DAILY_SUMMARY, date, totalRevenue: Math.floor(DEMO_DAILY_SUMMARY.totalRevenue * (0.7 + Math.random() * 0.6)) });
        }
        callback(summaries);
        return () => { };
    }

    const q = query(
        collection(db, "shops", shopId, "analytics"),
        orderBy("date", "desc"),
        limit(30)
    );

    return onSnapshot(q, (snap) => {
        const summaries = snap.docs.map(d => d.data() as DailySummary);
        callback(summaries);
    }, (error) => {
        console.error(`Firestore subscribeToMonthlySummary error for ${shopId}:`, error);
    });
}

// ---- NOTIFICATIONS ----
export async function getNotifications(shopId: string): Promise<VendorNotification[]> {
    if (!shopId || shopId === "demo-shop") return DEMO_NOTIFICATIONS;
    try {
        const q = query(collection(db, "shops", shopId, "notifications"), orderBy("createdAt", "desc"), limit(50));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }) as VendorNotification);
    } catch { return []; }
}

export async function markNotificationRead(shopId: string, notifId: string): Promise<void> {
    if (!shopId || shopId === "demo-shop") return;
    await updateDoc(doc(db, "shops", shopId, "notifications", notifId), { isRead: true });
}

export function subscribeToNotifications(shopId: string, callback: (notifs: VendorNotification[]) => void): Unsubscribe {
    if (!shopId || shopId === "demo-shop") {
        callback(DEMO_NOTIFICATIONS);
        return () => { };
    }
    const q = query(collection(db, "shops", shopId, "notifications"), orderBy("createdAt", "desc"), limit(20));
    return onSnapshot(q, (snap) => {
        callback(snap.docs.map(d => ({ id: d.id, ...d.data() }) as VendorNotification));
    }, (error) => {
        console.error(`Firestore subscribeToNotifications error for ${shopId}:`, error);
    });
}

// ---- VENDOR PROFILE ----
export async function getVendorProfile(uid: string): Promise<VendorProfile | null> {
    try {
        const ownerSnap = await getDoc(doc(db, "vendors", uid));
        if (ownerSnap.exists()) {
            return ownerSnap.data() as VendorProfile;
        }

        const staffSnap = await getDoc(doc(db, "staff", uid));
        if (staffSnap.exists()) {
            return staffSnap.data() as VendorProfile;
        }
    } catch { }
    return null;
}

export async function createVendorProfile(profile: VendorProfile): Promise<void> {
    if (profile.userRole === "vendor_owner") {
        await setDoc(doc(db, "vendors", profile.uid), profile);
    } else {
        await setDoc(doc(db, "staff", profile.uid), profile);
    }
}

// ---- SHOP CREATION (Owner signup flow) ----
export async function createShopForOwner(
    ownerId: string,
    shopName: string,
    email: string
): Promise<string> {
    const shopData: Omit<VendorShop, "id"> = {
        name: shopName,
        description: "",
        logo: "",
        address: "",
        location: "",
        phone: "",
        contactPhone: "",
        contactEmail: email,
        cuisineType: [],
        rating: 0,
        ratingCount: 0,
        totalStars: 0,
        tags: [],
        isOnline: false,
        estimatedWaitTime: 20,
        holidayMode: false,
        holidayMessage: "",
        ownerId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    const ref = await addDoc(collection(db, "shops"), shopData);
    return ref.id;
}

// ---- FIND SHOP BY NAME (Staff join flow) ----
export async function findShopByName(shopName: string): Promise<VendorShop | null> {
    if (shopName.toLowerCase() === "sultan kacchi" || shopName.toLowerCase() === "demo-shop") {
        return DEMO_SHOP;
    }
    try {
        const q = query(collection(db, "shops"), where("name", "==", shopName));
        const snap = await getDocs(q);
        if (!snap.empty) {
            const d = snap.docs[0];
            return { id: d.id, ...d.data() } as VendorShop;
        }
    } catch (e) { console.warn("findShopByName error", e); }
    return null;
}

// ---- STAFF ACCESS REQUESTS (Staff signup → pending approval) ----
export async function requestStaffAccess(
    uid: string,
    email: string,
    name: string,
    shopId: string,
    shopName: string,
    role: import("@/lib/types/vendor").StaffRole
): Promise<void> {
    // Create vendor profile with PENDING status
    const profile: VendorProfile = {
        uid,
        email,
        name,
        shopId,
        shopName,
        role,
        userRole: "vendor_staff",
        status: "PENDING",
        createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, "staff", uid), profile);
}



// ---- CUSTOMER ORDER CREATION (for customer-facing integration) ----
export async function createCustomerOrder(order: Omit<VendorOrder, "id" | "updatedAt"> & { id?: string }): Promise<string> {
    let orderId: string;
    const orderData = {
        ...order,
        updatedAt: new Date().toISOString(),
    };

    if (order.id) {
        orderId = order.id;
        await setDoc(doc(db, "orders", orderId), orderData);
    } else {
        const ref = await addDoc(collection(db, "orders"), orderData);
        orderId = ref.id;
    }

    // Reduce stock for all ordered items (real-time sync).  The helper now
    // returns a boolean so we can quietly log without bubbling errors back to
    // the caller (order creation should succeed even if the transaction fails).
    const stockOk = await reduceMenuItemStock(
        order.shopId,
        order.items.map(item => ({ menuItemId: item.menuItemId, quantity: item.quantity }))
    );
    if (!stockOk) {
        // already logged inside the helper; optionally notify vendor later
        console.warn("reduceMenuItemStock returned false for order", orderId);
    }

    // Also create notification for vendor
    await addDoc(collection(db, "shops", order.shopId, "notifications"), {
        shopId: order.shopId,
        type: "NEW_ORDER",
        title: `New Order`,
        message: `${order.items.length} items — ${order.orderType}`,
        isRead: false,
        orderId: orderId,
        createdAt: new Date().toISOString(),
    });
    return orderId;
}

// ---- PAYMENT VERIFICATION (MVP via UTR) ----
export async function verifyPaymentUTR(orderId: string, utr: string): Promise<boolean> {
    if (!orderId || !utr || utr.length < 12) return false;

    // MVP: Just update the order status. In a real app, query a PG or check if UTR exists.
    if (orderId.startsWith("ORD-")) {
        // Mock success for demo data
        return true;
    }

    try {
        await updateDoc(doc(db, "orders", orderId), {
            status: "PAID" as OrderStatus, // Assuming PAID is a valid status, or we might need to map it to "NEW" and set a payment verified flag
            paymentVerified: true,
            utrNumber: utr,
            updatedAt: new Date().toISOString()
        });
        return true;
    } catch (e) {
        console.error("Failed to verify UTR payment", e);
        return false;
    }
}

// Export demo data for components that need it directly
export { DEMO_SHOP, DEMO_MENU, DEMO_ORDERS, DEMO_STAFF, DEMO_STAFF_ACTIVITY, DEMO_SETTINGS, DEMO_TRANSACTIONS, DEMO_DAILY_SUMMARY, DEMO_NOTIFICATIONS };
export async function submitOrderRating(shopId: string, orderId: string, rating: number): Promise<void> {
    if (!shopId || !orderId || rating < 1 || rating > 5) return;

    const shopRef = doc(db, "shops", shopId);
    const orderRef = doc(db, "orders", orderId);
    const ratingRef = doc(collection(db, "ratings"), `${orderId}_rating`);

    try {
        await runTransaction(db, async (transaction) => {
            const shopSnap = await transaction.get(shopRef);
            if (!shopSnap.exists()) throw new Error("Shop not found");

            const shopData = shopSnap.data() as VendorShop;

            // Aggregation logic that handles migration and first ratings
            let currentCount = shopData.ratingCount || 0;
            let currentStars = shopData.totalStars || 0;

            // If a shop had a legacy rating (e.g. 4.5) but no count/stars fields yet,
            // we bootstrap it as 1 rating of that value to avoid a massive drop.
            if (currentCount === 0 && shopData.rating > 0) {
                currentCount = 1;
                currentStars = shopData.rating;
            }

            const newCount = currentCount + 1;
            const newStars = Number((currentStars + rating).toFixed(1));
            const newAvg = Number((newStars / newCount).toFixed(1));

            // Update Shop
            transaction.update(shopRef, {
                rating: newAvg,
                ratingCount: newCount,
                totalStars: newStars,
                updatedAt: new Date().toISOString()
            });

            // Update Order
            transaction.update(orderRef, {
                isRated: true,
                updatedAt: new Date().toISOString()
            });

            // Log individual rating
            transaction.set(ratingRef, {
                shopId,
                orderId,
                rating,
                createdAt: new Date().toISOString()
            });
        });
    } catch (e) {
        console.error("Firestore submitOrderRating transaction error:", e);
        throw e;
    }
}
