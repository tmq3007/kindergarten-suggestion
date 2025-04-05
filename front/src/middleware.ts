import {NextRequest, NextResponse} from "next/server";
import {cookies} from "next/headers";
import {jwtDecode} from "jwt-decode";

/**
 * Middleware function to handle requests to the "/forgot-password/reset-password" endpoint.
 * It extracts username and token from query parameters, validates the token,
 * stores them in cookies if valid, and redirects to a clean URL without query parameters.
 *
 * @param req - The incoming Next.js request object
 * @returns A response to either redirect or proceed to the next middleware
 */
export async function middleware(req: NextRequest) {
    // Retrieve the current URL
    const url = req.nextUrl;

    // Check if the request is for the "/forgot-password/reset-password" endpoint
    if (url.pathname === "/forgot-password/reset-password") {
        // Extract username and token from query parameters
        const username = url.searchParams.get("username");
        const forgotPasswordToken = url.searchParams.get("token");
        // Create a new URL without query parameters
        const newUrl = new URL(url.origin + url.pathname);

        // If both username and token are present, proceed to store them in cookies
        if (username && forgotPasswordToken) {
            // Create a Cookie object to store the token
            const cookie = await cookies();
            // Decode the token to extract expiration time (exp)
            const decodedToken = jwtDecode(forgotPasswordToken);
            const exp = decodedToken.exp;

            // If expiration time is not present, return an error response
            if (exp === undefined) {
                return NextResponse.json({message: 'Invalid token: Missing exp property'}, {status: 400});
            }

            const ttl = exp - Math.floor(Date.now() / 1000);

            if (ttl <= 0) {
                return NextResponse.json({message: 'Token has expired'}, {status: 400});
            }

            cookie.set({
                name: 'FORGOT_PASSWORD_TOKEN',
                value: forgotPasswordToken,
                httpOnly: true,
                secure: true,
                maxAge: ttl,
                path: '/',
                sameSite: 'none',
            });
            cookie.set({
                name: 'FORGOT_PASSWORD_USERNAME',
                value: username,
                httpOnly: true,
                secure: true,
                maxAge: ttl,
                path: '/',
                sameSite: 'none',
            });

            return NextResponse.redirect(newUrl);
        }
    }

    // Proceed to the next middleware if no action is required
    return NextResponse.next();
}

// Config middleware only for the endpoint "/forgot-password/reset-password"
export const config = {
    matcher: "/forgot-password/reset-password",
};
