import { db } from "./firebase";
import { 
    collection, 
    doc, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    query, 
    orderBy, 
    onSnapshot, 
    where, 
    getDocs,
    writeBatch
} from "firebase/firestore";

export type NotificationType = 'error' | 'success' | 'warning' | 'info' | 'neutral';

export interface CustomerNotification {
    id: string;
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    isRead: boolean;
    createdAt: string;
}

// ---- CUSTOMER NOTIFICATIONS ----

/**
 * Creates a new notification for a specific customer
 */
export async function createCustomerNotification(userId: string, data: Omit<CustomerNotification, "id" | "userId" | "isRead" | "createdAt">): Promise<string> {
    if (!userId) return "";
    
    const notifData = {
        ...data,
        userId,
        isRead: false,
        createdAt: new Date().toISOString(),
    };
    
    const ref = await addDoc(collection(db, "users", userId, "notifications"), notifData);
    return ref.id;
}

/**
 * Real-time listener for a customer's notifications, ordered by newest first
 */
export function subscribeToCustomerNotifications(
    userId: string, 
    callback: (notifications: CustomerNotification[]) => void
) {
    if (!userId) {
        callback([]);
        return () => {};
    }

    const q = query(
        collection(db, "users", userId, "notifications"),
        orderBy("createdAt", "desc")
    );

    return onSnapshot(q, (snapshot) => {
        const notifications = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as CustomerNotification[];
        callback(notifications);
    }, (error) => {
        console.error("Firestore subscribeToCustomerNotifications error:", error);
    });
}

/**
 * Marks a specific notification as read
 */
export async function markNotificationRead(userId: string, notificationId: string): Promise<void> {
    if (!userId || !notificationId) return;
    await updateDoc(doc(db, "users", userId, "notifications", notificationId), {
        isRead: true
    });
}

/**
 * Marks all of a customer's unread notifications as read
 */
export async function markAllNotificationsRead(userId: string): Promise<void> {
    if (!userId) return;
    
    try {
        const q = query(
            collection(db, "users", userId, "notifications"),
            where("isRead", "==", false)
        );
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) return;
        
        const batch = writeBatch(db);
        snapshot.docs.forEach((document) => {
            batch.update(document.ref, { isRead: true });
        });
        
        await batch.commit();
    } catch (e) {
        console.error("Error marking all notifications as read:", e);
    }
}

/**
 * Deletes multiple notifications at once
 */
export async function deleteNotifications(userId: string, notificationIds: string[]): Promise<void> {
    if (!userId || !notificationIds || notificationIds.length === 0) return;
    
    try {
        const batch = writeBatch(db);
        notificationIds.forEach(id => {
            const ref = doc(db, "users", userId, "notifications", id);
            batch.delete(ref);
        });
        await batch.commit();
    } catch (e) {
        console.error("Error deleting notifications:", e);
    }
}
