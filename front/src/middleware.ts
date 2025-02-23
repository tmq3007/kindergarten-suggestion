import {NextRequest, NextResponse} from "next/server";

export function middleware(req: NextRequest) {
    // Lấy URL hiện tại
    const url = req.nextUrl;
    // Kiểm tra nếu request đến "/forgot-password/reset-password"
    if (url.pathname === "/forgot-password/reset-password") {
        // Lấy giá trị username và token từ query parameters
        const username = url.searchParams.get("username");
        const token = url.searchParams.get("token");
        // Xóa query parameters khỏi URL
        const newUrl = new URL(url.origin + url.pathname); // Giữ nguyên pathname, bỏ query params
        if (username || token) {
            // Xử lý username và token tại đây

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
