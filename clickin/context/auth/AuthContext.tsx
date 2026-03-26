"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import {
    User,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    FacebookAuthProvider,
    OAuthProvider
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { UserRole, StaffRole, UserStatus } from "@/lib/types/vendor";
import { createShopForOwner, findShopByName, requestStaffAccess } from "@/lib/vendor-service";

// Human-friendly error messages for Firebase Auth errors
function getAuthErrorMessage(error: any): string {
    const code = error?.code || "";
    switch (code) {
        case "auth/email-already-in-use":
            return "This email is already registered. Try logging in instead.";
        case "auth/weak-password":
            return "Password must be at least 6 characters.";
        case "auth/invalid-email":
            return "Please enter a valid email address.";
        case "auth/user-not-found":
            return "No account found with this email.";
        case "auth/wrong-password":
            return "Incorrect password. Please try again.";
        case "auth/too-many-requests":
            return "Too many attempts. Please wait a moment and try again.";
        case "auth/network-request-failed":
            return "Network error. Please check your connection.";
        case "auth/invalid-credential":
            return "Invalid email or password.";
        case "auth/popup-closed-by-user":
            return "Sign-in popup was closed. Please try again.";
        case "custom":
            return error.message;
        default:
            return error?.message || "Something went wrong. Please try again.";
    }
}

interface AuthContextType {
    user: User | null;
    userRole: UserRole | null;
    userStatus: UserStatus | null;
    loading: boolean;
    login: (email: string, password: string, roleHint?: UserRole) => Promise<any>;
    signup: (email: string, password: string, fullName: string, role?: UserRole, shopName?: string, staffRole?: StaffRole) => Promise<any>;
    logout: () => Promise<void>;
    googleSignIn: () => Promise<any>;
    facebookSignIn: () => Promise<any>;
    appleSignIn: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    userRole: null,
    userStatus: null,
    loading: true,
    login: async () => { },
    signup: async () => { },
    logout: async () => { },
    googleSignIn: async () => { },
    facebookSignIn: async () => { },
    appleSignIn: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userRole, setUserRole] = useState<UserRole | null>(null);
    const [userStatus, setUserStatus] = useState<UserStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const isAuthenticatingRef = useRef(false);

    useEffect(() => {
        // Handle redirect result for mobile social login
        getRedirectResult(auth).then(async (result) => {
            if (result && result.user) {
                try {
                    const userRef = doc(db, "users", result.user.uid);
                    const userSnap = await getDoc(userRef);
                    if (!userSnap.exists()) {
                        await setDoc(userRef, {
                            uid: result.user.uid,
                            email: result.user.email,
                            fullName: result.user.displayName || "User",
                            createdAt: new Date().toISOString(),
                            photoURL: result.user.photoURL || "",
                            role: "user",
                            status: "active"
                        });
                        setUserRole("user");
                        setUserStatus("active");
                    } else {
                        setUserRole(userSnap.data().role as UserRole);
                        setUserStatus((userSnap.data().status as UserStatus) || "active");
                    }

                    // Redirect after successful login
                    const redirectPath = localStorage.getItem("redirectAfterLogin");
                    if (redirectPath) {
                        localStorage.removeItem("redirectAfterLogin");
                        window.location.assign(redirectPath);
                    }
                } catch (err) {
                    console.warn("Could not sync redirect user to Firestore", err);
                }
            }
        }).catch(error => {
            console.error("Redirect auth error:", error);
        });

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                if (isAuthenticatingRef.current) {
                    // login/signup function is handling role; don't set loading false yet
                    return;
                }
                // If role was already set by signup/login (vendor roles), don't override it
                // This prevents the race condition where onAuthStateChanged re-fires
                // and falls back to "user" before Firestore docs are readable
                setUserRole((prevRole) => {
                    if (prevRole === "vendor_owner" || prevRole === "vendor_staff") {
                        // Role was already correctly set by signup/login, keep it
                        return prevRole;
                    }
                    return prevRole; // Will be updated below via async fetch
                });

                // Fetch user role from Firestore
                try {
                    const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                    if (userDoc.exists() && userDoc.data().role) {
                        setUserRole(userDoc.data().role as UserRole);
                        setUserStatus((userDoc.data().status as UserStatus) || "active");
                    } else {
                        // Fallback check vendors and staff if users doc doesn't have it initially
                        const vendorDoc = await getDoc(doc(db, "vendors", currentUser.uid));
                        if (vendorDoc.exists()) {
                            setUserRole("vendor_owner"); // Map to old string temporarily for compatibility or update completely
                        } else {
                            const staffDoc = await getDoc(doc(db, "staff", currentUser.uid));
                            if (staffDoc.exists()) {
                                setUserRole("vendor_staff");
                            } else {
                                // Default to user
                                setUserRole((prev) => {
                                    if (prev === "vendor_owner" || prev === "vendor_staff") return prev;
                                    return "user";
                                });
                            }
                        }
                    }
                } catch (e) {
                    console.warn("Failed to fetch user role (offline?):", e);
                    // Only default to "user" if no role was previously set
                    setUserRole((prev) => prev ?? "user");
                }
            } else {
                setUserRole(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const login = async (email: string, password: string, roleHint?: UserRole) => {
        isAuthenticatingRef.current = true;
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            // Ensure role is fetched before resolving to allow immediate routing
            let roleFetched = false;
            try {
                const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
                if (userDoc.exists() && userDoc.data().role) {
                    setUserRole(userDoc.data().role as UserRole);
                    setUserStatus((userDoc.data().status as UserStatus) || "active");
                    roleFetched = true;
                } else {
                    const vendorDoc = await getDoc(doc(db, "vendors", userCredential.user.uid));
                    if (vendorDoc.exists()) {
                        setUserRole("vendor_owner");
                        roleFetched = true;
                    } else {
                        const staffDoc = await getDoc(doc(db, "staff", userCredential.user.uid));
                        if (staffDoc.exists()) {
                            setUserRole("vendor_staff");
                            roleFetched = true;
                        } else {
                            setUserRole(roleHint || "user");
                            roleFetched = true;
                        }
                    }
                }
            } catch (e) {
                console.error("Failed to fetch user role on login (offline?):", e);
                // Use roleHint when Firestore is offline
                if (roleHint) {
                    setUserRole(roleHint);
                    roleFetched = true;
                }
            }
            if (!roleFetched) {
                setUserRole(roleHint || "user");
            }
            setLoading(false);
            return userCredential;
        } catch (e: any) {
            setLoading(false);
            throw new Error(getAuthErrorMessage(e));
        } finally {
            isAuthenticatingRef.current = false;
        }
    };

    const signup = async (email: string, password: string, fullName: string, role: UserRole = "user", shopName?: string, staffRole?: StaffRole) => {
        isAuthenticatingRef.current = true;
        try {
            // First perform early checks if vendor
            let foundShop = null;
            if (role === "vendor_staff") {
                if (!shopName) throw { code: "custom", message: "Shop name is required for staff" };
                foundShop = await findShopByName(shopName);
                if (!foundShop) throw { code: "custom", message: `Shop "${shopName}" not found. Please check the name.` };
                if (!staffRole) throw { code: "custom", message: "Staff role is required for staff signup" };
            } else if (role === "vendor_owner") {
                if (!shopName) throw { code: "custom", message: "Shop name is required for owners" };
            }

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            // Set displayName on the Firebase Auth user profile
            try {
                await updateProfile(userCredential.user, { displayName: fullName });
            } catch (profileErr) {
                console.warn("Could not update user profile displayName:", profileErr);
            }

            // Create user document in Firestore on signup
            try {
                await setDoc(doc(db, "users", userCredential.user.uid), {
                    uid: userCredential.user.uid,
                    email: email,
                    fullName: fullName,
                    createdAt: new Date().toISOString(),
                    role: role,
                    status: role === "vendor_owner" ? "pending" : "active"
                });
            } catch (firestoreErr) {
                console.warn("Could not save user profile to Firestore:", firestoreErr);
            }

            // Handle specific vendor setup
            if (role === "vendor_owner" && shopName) {
                try {
                    const newShopId = await createShopForOwner(userCredential.user.uid, shopName, email);
                    await setDoc(doc(db, "vendors", userCredential.user.uid), {
                        uid: userCredential.user.uid,
                        email: email,
                        shopId: newShopId,
                        shopName: shopName,
                        verified: false,
                        isApproved: false,
                        createdAt: new Date().toISOString(),
                    });
                } catch (e) {
                    console.error("Error setting up vendor owner profile:", e);
                }
            } else if (role === "vendor_staff" && shopName && staffRole && foundShop) {
                try {
                    // Create pending staff request
                    await requestStaffAccess(userCredential.user.uid, email, fullName, foundShop.id, shopName, staffRole);
                } catch (e: any) {
                    console.error("Error setting up vendor staff profile:", e);
                    throw { code: "custom", message: "Failed to submit staff request. Please try again." };
                }
            }


            setUserRole(role);
            setLoading(false);
            return userCredential;
        } catch (e: any) {
            if (e.message && !e.code) throw e;
            throw new Error(getAuthErrorMessage(e));
        } finally {
            isAuthenticatingRef.current = false;
        }
    };

    const logout = () => {
        return signOut(auth);
    };

    const googleSignIn = async () => {
        isAuthenticatingRef.current = true;
        try {
            const provider = new GoogleAuthProvider();
            
            let result;
            try {
                result = await signInWithPopup(auth, provider);
            } catch (err: any) {
                if (err.code === "auth/popup-blocked" || err.code === "auth/popup-closed-by-user") {
                    await signInWithRedirect(auth, provider);
                    return; // Will reload page
                }
                throw err;
            }
            
            // Handle user doc for popup
            try {
                const userRef = doc(db, "users", result.user.uid);
                const userSnap = await getDoc(userRef);
                if (!userSnap.exists()) {
                    await setDoc(userRef, {
                        uid: result.user.uid,
                        email: result.user.email,
                        fullName: result.user.displayName,
                        createdAt: new Date().toISOString(),
                        photoURL: result.user.photoURL,
                        role: "user",
                        status: "active"
                    });
                    setUserRole("user");
                    setUserStatus("active");
                } else {
                    setUserRole(userSnap.data().role as UserRole);
                    setUserStatus((userSnap.data().status as UserStatus) || "active");
                }
            } catch (firestoreErr) {
                console.warn("Could not sync user profile to Firestore:", firestoreErr);
            }
            return result;
        } catch (e: any) {
            throw new Error(getAuthErrorMessage(e));
        } finally {
            isAuthenticatingRef.current = false;
        }
    };

    const facebookSignIn = async () => {
        try {
            const provider = new FacebookAuthProvider();
            let result;
            try {
                result = await signInWithPopup(auth, provider);
            } catch (err: any) {
                if (err.code === "auth/popup-blocked" || err.code === "auth/popup-closed-by-user") {
                    await signInWithRedirect(auth, provider);
                    return;
                }
                throw err;
            }
            
            // Handle user doc for popup
            try {
                const userRef = doc(db, "users", result.user.uid);
                const userSnap = await getDoc(userRef);
                if (!userSnap.exists()) {
                    await setDoc(userRef, {
                        uid: result.user.uid,
                        email: result.user.email,
                        fullName: result.user.displayName || "User",
                        createdAt: new Date().toISOString(),
                        photoURL: result.user.photoURL || "",
                        role: "user",
                        status: "active"
                    });
                    setUserRole("user");
                    setUserStatus("active");
                } else {
                    setUserRole(userSnap.data().role as UserRole);
                    setUserStatus((userSnap.data().status as UserStatus) || "active");
                }
            } catch (firestoreErr) {
                console.warn("Could not sync user profile to Firestore:", firestoreErr);
            }
            return result;
        } catch (e: any) {
            throw new Error(getAuthErrorMessage(e));
        }
    };

    const appleSignIn = async () => {
        try {
            const provider = new OAuthProvider('apple.com');
            let result;
            try {
                result = await signInWithPopup(auth, provider);
            } catch (err: any) {
                if (err.code === "auth/popup-blocked" || err.code === "auth/popup-closed-by-user") {
                    await signInWithRedirect(auth, provider);
                    return;
                }
                throw err;
            }
            
            // Handle user doc for popup
            try {
                const userRef = doc(db, "users", result.user.uid);
                const userSnap = await getDoc(userRef);
                if (!userSnap.exists()) {
                    await setDoc(userRef, {
                        uid: result.user.uid,
                        email: result.user.email,
                        fullName: result.user.displayName || "User",
                        createdAt: new Date().toISOString(),
                        photoURL: result.user.photoURL || "",
                        role: "user",
                        status: "active"
                    });
                    setUserRole("user");
                    setUserStatus("active");
                } else {
                    setUserRole(userSnap.data().role as UserRole);
                    setUserStatus((userSnap.data().status as UserStatus) || "active");
                }
            } catch (firestoreErr) {
                console.warn("Could not sync user profile to Firestore:", firestoreErr);
            }
            return result;
        } catch (e: any) {
            throw new Error(getAuthErrorMessage(e));
        }
    };

    return (
        <AuthContext.Provider value={{ user, userRole, userStatus, loading, login, signup, logout, googleSignIn, facebookSignIn, appleSignIn }}>
            {children}
        </AuthContext.Provider>
    );
};
