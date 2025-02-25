import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest) {

    console.log("Hello logout")

    try {
        // Lấy đối tượng cookies
        const cookie = await cookies();

        cookie.delete("ACCESS_TOKEN");

        cookie.delete("CSRF_TOKEN");

        return NextResponse.json({ message: 'Cookies cleared successfully' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
