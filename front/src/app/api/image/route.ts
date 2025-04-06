import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const url = searchParams.get('url');

        if (!url) {
            return NextResponse.json({ error: 'Invalid image URL' }, { status: 400 });
        }

        console.log(`🔗 Fetching image from: ${url}`);

        // Send request to get image from origin URL
        const response = await fetch(url, { method: 'GET' });

        const buffer = await response.arrayBuffer();

        return new Response(buffer, {
            headers: {
                'Content-Type': response.headers.get('content-type') || 'image/jpeg',
                'Cache-Control': 'public, max-age=86400',
            },
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch image' }, { status: 500 });
    }
}
