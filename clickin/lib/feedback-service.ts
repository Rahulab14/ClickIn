import { db } from "./firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";

export interface FeedbackData {
  userId: string;
  orderId?: string; // Optional
  shopId?: string; // Optional
  rating: number; // 1-5
  tags: string[];
  message: string;
  likedFeatures?: string; // Optional specific liked features
  isSerious: boolean;
  createdAt?: any;
}

/**
 * Submit structured feedback to the global `feedback` collection.
 */
export async function submitFeedback(data: FeedbackData) {
  try {
    const feedbackRef = collection(db, "feedback");
    
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined)
    );

    const feedbackDoc = {
      ...cleanData,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(feedbackRef, feedbackDoc);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error submitting feedback:", error);
    throw error;
  }
}

/**
 * Fetch recent completed orders for the user to attach feedback to.
 */
export async function getRecentEligibleOrders(uid: string, limitCount: number = 5) {
  try {
    const ordersRef = collection(db, "users", uid, "orders");
    const q = query(
      ordersRef,
      where("status", "in", ["completed", "delivered", "picked_up", "cancelled"]),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    
    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return orders;
  } catch (error) {
    console.error("Error fetching recent eligible orders:", error);
    return [];
  }
}
