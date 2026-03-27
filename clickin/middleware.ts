import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    // Specifically guard the admin routes natively at the edge
    if (request.nextUrl.pathname.startsWith('/admin') && !request.nextUrl.pathname.startsWith('/admin-login')) {
        
        // Check if the secure Node HTTPOnly cookie is attached to the request headers
        const sessionToken = request.cookies.get('admin_session_unlocked')?.value;
        
        // If they cleared the OTP gate, they will have the true token
        if (sessionToken !== "true") {
            const loginUrl = new URL('/admin-login', request.url);
            // Optionally pass a flag to show a toast warning on the login page
            loginUrl.searchParams.set("ejected", "true");
            return NextResponse.redirect(loginUrl);
        }
    }
    
    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths starting with /admin
         * But skip static files and API routes inside admin if any existed
         */
        '/admin/:path*'
    ],
};
