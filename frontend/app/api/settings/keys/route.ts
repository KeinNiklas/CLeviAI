import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:8000';

        // Forward to Python backend
        const response = await fetch(`${backendUrl}/settings/keys`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error: any) {
        console.error('Error in settings/keys proxy:', error);
        return NextResponse.json(
            { detail: error.message || 'Failed to save keys' },
            { status: 500 }
        );
    }
}
