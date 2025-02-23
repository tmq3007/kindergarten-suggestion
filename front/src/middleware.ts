import {NextRequest, NextResponse} from "next/server";
import {cookies} from "next/headers";
import {jwtDecode} from "jwt-decode";

export async function middleware(req: NextRequest) {
    // Lấy URL hiện tại
    const url = req.nextUrl;
    // Kiểm tra nếu request đến "/forgot-password/reset-password"
    if (url.pathname === "/forgot-password/reset-password") {
        // Lấy giá trị username và token từ query parameters
        const username = url.searchParams.get("username");
        const forgotpasswordToken = url.searchParams.get("token");
        // Xóa query parameters khỏi URL
        const newUrl = new URL(url.origin + url.pathname); // Giữ nguyên pathname, bỏ query params

        // Nếu có username và token thì lưu vào cookie
        if (username && forgotpasswordToken) {
            // Tạo đối tượng Cookie để lưu token
            const cookie = await cookies();
            // Giải mã token để lấy ra expiration time (exp)
            const decodedToken = jwtDecode(forgotpasswordToken);
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
            // Lưu ACCESS_TOKEN vào cookie
            cookie.set({
                name: 'FORGOT_PASSWORD_TOKEN',
                value: forgotpasswordToken,
                httpOnly: false,
                secure: false,
                maxAge: ttl, // 1 tuần
                path: '/',
                sameSite: 'strict',
            });

            // Lưu username vào cookie
            cookie.set({
                name: 'FORGOT_PASSWORD_USERNAME',
                value: username,
                httpOnly: false,
                secure: false,
                maxAge: ttl, // 1 tuần
                sameSite: 'strict',
            });


            // Redirect đến URL mới (không có query params)
            return NextResponse.redirect(newUrl);
        }
    }
    return NextResponse.next();
}

// Cấu hình middleware chỉ chạy cho "/forgot-password/reset-password"
export const config = {
    matcher: "/forgot-password/reset-password",
};
