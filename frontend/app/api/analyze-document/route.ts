import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        // Get backend URL from environment variable
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:8000';

        console.log('[analyze-document] Forwarding request to:', `${backendUrl}/analyze-document`);

        // Forward the request to the Python backend
        const response = await fetch(`${backendUrl}/analyze-document`, {
            method: 'POST',
            body: formData,
        });

        console.log('[analyze-document] Backend response status:', response.status);

        // Clone response to read it multiple times if needed
        const responseClone = response.clone();

        // Try to get the response data
        let data;
        try {
            data = await response.json();
        } catch (jsonError) {
            // If JSON parsing fails, try to get text
            const textData = await responseClone.text();
            console.error('[analyze-document] Failed to parse JSON, got text:', textData);

            return NextResponse.json(
                { detail: textData || 'Failed to analyze document' },
                { status: response.status || 500 }
            );
        }

        // If response is not ok, return error
        if (!response.ok) {
            console.error('[analyze-document] Backend error:', data);
            return NextResponse.json(data, { status: response.status });
        }

        console.log('[analyze-document] Success, returning data');
        return NextResponse.json(data, { status: 200 });

    } catch (error: any) {
        console.error('[analyze-document] Proxy error:', error);
        return NextResponse.json(
            { detail: error.message || 'Failed to analyze document' },
            { status: 500 }
        );
    }
}
