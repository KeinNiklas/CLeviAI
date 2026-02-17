import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:8000';

        console.log('[upload-to-gemini-base64] Forwarding request to:', `${backendUrl}/upload-to-gemini-base64`);

        // Forward to Python backend
        const response = await fetch(`${backendUrl}/upload-to-gemini-base64`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        console.log('[upload-to-gemini-base64] Backend response status:', response.status);

        const data = await response.json();

        if (!response.ok) {
            console.error('[upload-to-gemini-base64] Backend error:', data);
            return NextResponse.json(data, { status: response.status });
        }

        console.log('[upload-to-gemini-base64] Success, returning file URI');
        return NextResponse.json(data, { status: 200 });

    } catch (error: any) {
        console.error('[upload-to-gemini-base64] Proxy error:', error);
        return NextResponse.json(
            { detail: error.message || 'Failed to upload file' },
            { status: 500 }
        );
    }
}
