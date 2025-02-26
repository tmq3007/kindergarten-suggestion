import {cookies} from 'next/headers';
import {NextRequest, NextResponse} from 'next/server';
import {jwtDecode} from 'jwt-decode';

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        const accessToken = data.accessToken;
        const csrfToken = data.csrfToken;
        // Nếu thiếu 1 trong 2 token thì ném lỗi
        if (!accessToken || !csrfToken) {
            return NextResponse.json({message: 'Missing token'}, {status: 400});
        }
        // Tạo đối tượng Cookie để lưu token
        const cookie = await cookies();
        // Giải mã token để lấy ra expiration time (exp)
        const decodedToken = jwtDecode(accessToken);
        const exp = decodedToken.exp;
        // Nếu không có exp thì ném lỗi
        if (exp === undefined) {
            return NextResponse.json({message: 'Invalid token: Missing exp property'}, {status: 400});
        }
        const ttl = exp - Math.floor(Date.now() / 1000);
        // // Nếu token hết hạn thì ném lỗi
        if (ttl <= 0) {
            return NextResponse.json({message: 'Token has expired'}, {status: 400});
        }
        // Lưu ACCESS_TOKEN vào cookie với cờ HttpOnly
        const cookieTtl = ttl + (24 * 60 * 60);
        cookie.set({
            name: 'ACCESS_TOKEN',
            value: accessToken,
            httpOnly: true,
            secure: false,
            maxAge: cookieTtl,
            path: '/',
            sameSite: 'strict',
        });
        // Lưu CSRF_TOKEN vào cookie
        cookie.set({
            name: 'CSRF_TOKEN',
            value: csrfToken,
            httpOnly: false,
            secure: false,
            maxAge: cookieTtl,
            path: '/',
            sameSite: 'strict',
        });
        return NextResponse.json({message: 'Token saved successfully'}, {status: 200});
    } catch (error) {
        return NextResponse.json({message: 'Internal server error'}, {status: 500});
    }
}
