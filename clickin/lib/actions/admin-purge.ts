"use server";

import { db, auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { collection, query, where, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";
import { checkAdminSession } from "./admin-auth";

export async function executeDeepPurge(shopId: string, ownerId: string) {
    // 1. Validate the Next.js HttpOnly Secure Cookie
    const isAuthorized = await checkAdminSession();
    if (!isAuthorized) {
        throw new Error("Unauthorized Next.js Session. Deep Purge denied.");
    }

    try {
        // 2. Authenticate the Node Firebase Client locally using environment secrets
        const adminEmail = process.env.SUPER_ADMIN_EMAIL;
        const adminPass = process.env.SUPER_ADMIN_PASSWORD;

        if (!adminEmail || !adminPass) {
            throw new Error("Missing System Super Admin Environment Tokens.");
        }
        
        try {
            await signInWithEmailAndPassword(auth, adminEmail, adminPass);
        } catch (authError: any) {
            if (authError.code === 'auth/invalid-credential' || authError.code === 'auth/user-not-found' || authError.code === 'auth/wrong-password') {
                // If the Next.js Admin doesn't actually have a mirrored Firebase Auth account yet, provision it.
                const { createUserWithEmailAndPassword } = await import("firebase/auth");
                const { setDoc } = await import("firebase/firestore");
                try {
                    const cred = await createUserWithEmailAndPassword(auth, adminEmail, adminPass);
                    // Provision their admin access role document so `isAdmin()` rule passes
                    await setDoc(doc(db, "users", cred.user.uid), {
                        email: adminEmail,
                        role: "admin",
                        name: "System Admin",
                        createdAt: new Date().toISOString(),
                    });
                } catch (createError: any) {
                    if (createError.code === 'auth/email-already-in-use') {
                        // Just sign in again if it was a race condition
                        await signInWithEmailAndPassword(auth, adminEmail, adminPass);
                    } else {
                        throw createError;
                    }
                }
            } else {
                throw authError; // Rethrow other unexpected errors
            }
        }

        // 3. Execute Cascade Delete
        
        // A. Destroy Menu Subcollection
        const menuSnap = await getDocs(collection(db, "shops", shopId, "menu"));
        for (const item of menuSnap.docs) {
            await deleteDoc(item.ref);
        }

        // B. Destroy Staff Subcollection inside the shop
        const staffSnap = await getDocs(collection(db, "shops", shopId, "staff"));
        for (const st of staffSnap.docs) {
            const uid = st.data().uid;
            if (uid) {
                try { await updateDoc(doc(db, "users", uid), { status: "deleted", role: "none" }); } catch {}
            }
            await deleteDoc(st.ref);
        }

        // C. Remove Global Staff records linked to this shop
        const gStaffSnap = await getDocs(query(collection(db, "staff"), where("shopId", "==", shopId)));
        for (const gSt of gStaffSnap.docs) {
            await deleteDoc(gSt.ref);
        }

        // D. Delete the Vendor profile
        await deleteDoc(doc(db, "vendors", ownerId)).catch(() => {});

        // E. Delete associated Shop documents (Query by ownerId)
        const shopsQuery = query(collection(db, "shops"), where("ownerId", "==", ownerId));
        const shopsSnap = await getDocs(shopsQuery);
        for (const sDoc of shopsSnap.docs) {
            await deleteDoc(sDoc.ref);
        }

        // F. Legacy delete by ID just in case
        await deleteDoc(doc(db, "shops", shopId)).catch(() => {});

        // G. Disconnect the owner's user role
        try { await updateDoc(doc(db, "users", ownerId), { status: "deleted", role: "none" }); } catch (e) {}

        // 4. Force Sign Out to clean Node environment
        await signOut(auth);

        return { success: true };
    } catch (e: any) {
        // Force cleanup array
        await signOut(auth).catch(() => {});
        console.error("[DEEP PURGE BACKEND] FAILURE:", e);
        throw new Error(e.message || "Failed to execute deep purge on the backend.");
    }
}
