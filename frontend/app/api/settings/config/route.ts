import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:8000';

        // Forward to Python backend
        const response = await fetch(`${backendUrl}/settings/config`, {
            method: 'GET',
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error: any) {
        console.error('Error in settings/config proxy:', error);
        return NextResponse.json(
            { detail: error.message || 'Failed to fetch config' },
            { status: 500 }
        );
    }
}
