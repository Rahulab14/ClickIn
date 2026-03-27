"use server";

import nodemailer from "nodemailer";
import { cookies } from "next/headers";
import crypto from "crypto";

/**
 * Evaluates the credentials natively against the Environment payload, and issues the session cookie instantly.
 */
export async function verifyAdminCredentials(email: string, pass: string) {
    if (email === process.env.SUPER_ADMIN_EMAIL && pass === process.env.SUPER_ADMIN_PASSWORD) {
        
        // Issue the authentic Access System token natively
        const cookieStore = await cookies();
        cookieStore.set("admin_session_unlocked", "true", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 12, // 12 hours
            path: "/",
        });
        
        return { success: true };
    }
    return { success: false, error: "System rejects provided Environment credentials." };
}

/**
 * 1. Generates a 6 digit code.
 * 2. Hashes it dynamically and locks it inside a temporary HTTP-only Cookie queue.
 * 3. Emails the raw text equivalent.
 */
export async function sendAdminOtp(email: string) {
    if (email !== process.env.SUPER_ADMIN_EMAIL) {
        throw new Error("Unauthorized identity validation failed.");
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Create an HMAC hash for stateless verification 
    // Uses the email + a hardcoded pseudo-secret salt to lock the envelope securely
    const otpHash = crypto.createHmac("sha256", "CLICKIN_SYSTEM_SALT")
                          .update(`${email}:${otp}`)
                          .digest("hex");
                          
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 min payload
    const payload = `${otpHash}.${expiresAt}`;

    // Cache to Next.js Secure Cookie cache payload
    const cookieStore = await cookies();
    cookieStore.set("_admin_otp_challenge", payload, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 5 * 60, // 5 mins strict expiry natively implemented
        path: "/",
    });

    // Transport configuration for Nodemailer
    // Users must set these env vars in production
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER || "clickinsupport@gmail.com",
            pass: process.env.EMAIL_APP_PASSWORD || "", // Must be an App Password, not real password
        },
    });

    const mailOptions = {
        from: `"ClickIn Security" <${process.env.EMAIL_USER || "clickinsupport@gmail.com"}>`,
        to: email, // Sending directly to the validated email
        subject: "ClickIn Admin Authorization Code",
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Admin Login Attempt</h2>
                <p>An attempt was made to login to the ClickIn Operations Alpha dashboard.</p>
                <p>Your one-time password (OTP) is:</p>
                <div style="background-color: #f4f4f5; padding: 16px; border-radius: 8px; text-align: center; margin: 24px 0;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #10b981;">${otp}</span>
                </div>
                <p>This code will expire in 5 minutes. If you did not request this, please secure your account.</p>
            </div>
        `,
    };

    try {
        if (!process.env.EMAIL_APP_PASSWORD) {
            console.warn("⚠️ NO EMAIL_APP_PASSWORD SET! Simulating email send. OTP is:", otp);
            return { success: true, message: "OTP Simulated (Check Console)" };
        }

        await transporter.sendMail(mailOptions);
        return { success: true, message: "OTP sent to your email" };
    } catch (error) {
        console.error("Nodemailer error:", error);
        // Fallback for development/testing when SMTP fails
        if (process.env.NODE_ENV === "development") {
            console.log("\n=============================================");
            console.log("🔔 DEVELOPER OTP BYPASS (SMTP FAILED):");
            console.log(`The OTP you are looking for is: ${otp}`);
            console.log("=============================================\n");
            return { success: true, message: "SMTP Failed. OTP printed in your Terminal!" };
        }
        throw new Error("Failed to send OTP email. Check your SMTP configuration.");
    }
}

/**
 * Validates the OTP against the stateless challenge cookie.
 */
export async function verifyAdminOtp(email: string, userEnteredOtp: string) {
    if (email !== process.env.SUPER_ADMIN_EMAIL) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const cookieStore = await cookies();
        const challenge = cookieStore.get("_admin_otp_challenge")?.value;
        
        if (!challenge) {
            return { success: false, error: "OTP expired or was never requested." };
        }
        
        const [hash, expiresAt] = challenge.split(".");
        
        if (Date.now() > parseInt(expiresAt)) {
            cookieStore.delete("_admin_otp_challenge");
            return { success: false, error: "OTP has officially expired." };
        }

        // Reconstruct the internal signature to verify the integrity
        const checkHash = crypto.createHmac("sha256", "CLICKIN_SYSTEM_SALT")
                              .update(`${email}:${userEnteredOtp}`)
                              .digest("hex");
                              
        if (checkHash === hash) {
            // Destroy the temporary challenge cookie natively
            cookieStore.delete("_admin_otp_challenge");
            
            // Issue the authentic Access System token natively
            cookieStore.set("admin_session_unlocked", "true", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 60 * 60 * 12, // 12 hours
                path: "/",
            });

            return { success: true };
        }

        return { success: false, error: "Invalid or expired OTP" };

    } catch (error) {
        console.error("OTP Verification Error:", error);
        return { success: false, error: "System error verifying OTP" };
    }
}

/**
 * Checks if the secure Admin OTP session cookie exists.
 */
export async function checkAdminSession() {
    const cookieStore = await cookies();
    return cookieStore.has("admin_session_unlocked");
}

/**
 * Destroys the secure Admin OTP session cookie upon sign-out.
 */
export async function logoutAdminSession() {
    const cookieStore = await cookies();
    cookieStore.delete("admin_session_unlocked");
}
