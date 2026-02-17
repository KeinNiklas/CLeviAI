import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:8000';

        console.log('[analyze-file-uri] Forwarding request to:', `${backendUrl}/analyze-file-uri`);

        // Forward to Python backend
        const response = await fetch(`${backendUrl}/analyze-file-uri`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        console.log('[analyze-file-uri] Backend response status:', response.status);

        const data = await response.json();

        if (!response.ok) {
            console.error('[analyze-file-uri] Backend error:', data);
            return NextResponse.json(data, { status: response.status });
        }

        console.log('[analyze-file-uri] Success, returning data');
        return NextResponse.json(data, { status: 200 });

    } catch (error: any) {
        console.error('[analyze-file-uri] Proxy error:', error);
        return NextResponse.json(
            { detail: error.message || 'Failed to analyze file' },
            { status: 500 }
        );
    }
}
