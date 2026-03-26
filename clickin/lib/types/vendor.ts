// =============================================
// Vendor Data Models for Firestore
// =============================================

export type OrderType = "Dine-in" | "Takeaway" | "Delivery";

export interface VendorShop {
    id: string;
    name: string;
    description: string;
    logo: string;
    address: string;
    location: string;
    phone: string;
    contactPhone: string;
    contactEmail: string;
    cuisineType?: string[];
    rating: number;
    ratingCount: number;
    totalStars: number;
    tags: string[];
    isOnline: boolean;
    estimatedWaitTime: number; // minutes
    banner?: string;
    category?: string;
    ownerName?: string;
    alternatePhone?: string;
    campus?: string;
    building?: string;
    openingTime?: string;
    closingTime?: string;
    workingDays?: string[];
    orderTypesSupported?: OrderType[];
    upiId?: string;
    famappUpiId?: string;
    paymentInstructions?: string;
    allowStaffRequests?: boolean;
    maxStaffAllowed?: number;
    averagePrepTime?: number;
    autoAcceptOrders?: boolean;
    orderQueueLimit?: number;
    holidayMode: boolean;
    holidayMessage: string;
    ownerId: string;
    createdAt: string;
    updatedAt: string;
}

export interface VendorMenuItem {
    id: string;
    shopId: string;
    name: string;
    description: string;
    price: number;
    category: string;
    image: string;
    isVeg: boolean;
    available: boolean;
    bestseller: boolean;
    stock: number; // -1 means unlimited, 0 means sold out
    createdAt: string;
    updatedAt: string;
}

export interface VendorCategory {
    id: string;
    shopId: string;
    name: string;
    sortOrder: number;
}

export interface OrderItem {
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
    isVeg: boolean;
    image: string;
    specialInstructions?: string;
}

export type OrderStatus = "NEW" | "PREPARING" | "READY" | "COMPLETED" | "CANCELLED";
export type PaymentMethod = "UPI" | "CASH";

export interface VendorOrder {
    id: string;
    shopId: string;
    items: OrderItem[];
    total: number;
    status: OrderStatus;
    payment: PaymentMethod;
    orderType: OrderType;
    customerName: string;
    customerPhone: string;
    customerId?: string;
    tableNumber?: string;
    specialInstructions?: string;
    cancelReason?: string;
    cancelledBy?: string;
    handledByStaffId?: string;
    isRated?: boolean;
    createdAt: string;
    updatedAt: string;
    completedAt?: string;
}

export type StaffRole = "OWNER" | "MANAGER" | "CHEF" | "WAITER" | "CASHIER";
export type StaffApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface VendorStaff {
    id: string;
    shopId: string;
    uid?: string; // Firebase Auth UID if they have an account
    name: string;
    email: string;
    phone: string;
    role: StaffRole;
    status: StaffApprovalStatus;
    isActive: boolean;
    isOnline?: boolean;
    shiftStart?: string;
    shiftEnd?: string;
    createdAt: string;
    lastActiveAt?: string;
}

export interface StaffActivity {
    id: string;
    shopId: string;
    staffId: string;
    staffName: string;
    staffRole: StaffRole;
    action: string;
    impact: "positive" | "neutral" | "negative";
    timestamp: string;
}

export interface OperatingHours {
    day: string;
    isOpen: boolean;
    openTime: string;
    closeTime: string;
}

export interface VendorSettings {
    shopId: string;
    operatingHours: OperatingHours[];
    taxPercentage: number;
    gstNumber: string;
    upiId: string;
    famappUpiId?: string;
    bankAccountName: string;
    bankAccountNumber: string;
    bankIFSC: string;
    notifyNewOrders: boolean;
    notifyOrderStatusChange: boolean;
    notifyLowStock: boolean;
    notifyDailySummary: boolean;
    orderAlertSound: boolean;
    isManualMode?: boolean;
}

export interface VendorTransaction {
    id: string;
    shopId: string;
    orderId: string;
    type: "PAYMENT" | "REFUND" | "PAYOUT";
    amount: number;
    method: PaymentMethod;
    status: "COMPLETED" | "PENDING" | "FAILED";
    description: string;
    createdAt: string;
}

export interface DailySummary {
    date: string;
    shopId: string;
    totalRevenue: number;
    onlineRevenue: number;
    cashRevenue: number;
    totalOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    averageOrderValue: number;
    topSellingItems: { name: string; count: number; revenue: number }[];
    peakHour: string;
    newCustomers: number;
    returningCustomers: number;
    hourlySales: { hour: string; revenue: number; orders: number }[];
}

export interface VendorNotification {
    id: string;
    shopId: string;
    type: "NEW_ORDER" | "ORDER_STATUS" | "LOW_STOCK" | "DAILY_SUMMARY" | "SYSTEM";
    title: string;
    message: string;
    isRead: boolean;
    orderId?: string;
    createdAt: string;
}

export type UserRole = "user" | "vendor_owner" | "vendor_staff" | "admin";
export type UserStatus = "active" | "pending" | "blocked";

export interface VendorProfile {
    uid: string;
    email: string;
    name: string;
    shopId: string;
    shopName?: string;
    role: StaffRole;
    userRole: UserRole; // Added for unified auth
    status: StaffApprovalStatus;
    createdAt: string;
}
