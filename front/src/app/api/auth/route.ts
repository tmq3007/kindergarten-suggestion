import {cookies} from 'next/headers';
import {NextRequest, NextResponse} from 'next/server';
import {jwtDecode} from 'jwt-decode';

// deprecated
export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        const accessToken = data.accessToken;
        const csrfToken = data.csrfToken;
        // If either of the two tokens is missing, throw an error
        if (!accessToken || !csrfToken) {
            return NextResponse.json({message: 'Missing token'}, {status: 400});
        }
        // Create Cookie object to save token
        const cookie = await cookies();
        // Decode token to extract expiration time (exp)
        const decodedToken = jwtDecode(accessToken);
        const exp = decodedToken.exp;
        // If there is no exp, throw an error
        if (exp === undefined) {
            return NextResponse.json({message: 'Invalid token: Missing exp property'}, {status: 400});
        }
        const ttl = exp - Math.floor(Date.now() / 1000);
        // If token expire, throw an error
        if (ttl <= 0) {
            return NextResponse.json({message: 'Token has expired'}, {status: 400});
        }
        // Save ACCESS_TOKEN in cookie with HttpOnly
        const cookieTtl = ttl + (24 * 60 * 60);
        cookie.set({
            name: 'ACCESS_TOKEN2',
            value: accessToken,
            httpOnly: true,
            secure: true,
            maxAge: cookieTtl,
            path: '/',
            sameSite: "none",
        });
        // Save CSRF_TOKEN in cookie
        cookie.set({
            name: 'CSRF_TOKEN2',
            value: csrfToken,
            httpOnly: false,
            secure: true,
            maxAge: cookieTtl,
            path: '/',
            sameSite: "none",
        });
        return NextResponse.json({message: 'Token saved successfully'}, {status: 200});
    } catch (error) {
        return NextResponse.json({message: 'Internal server error'}, {status: 500});
    }
}
