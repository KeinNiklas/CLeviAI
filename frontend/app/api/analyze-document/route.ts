import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        // Get backend URL from environment variable
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:8000';

        // Forward the request to the Python backend
        const response = await fetch(`${backendUrl}/analyze-document`, {
            method: 'POST',
            body: formData,
        });

        // Get the response data
        const data = await response.json();

        // Return the response with the same status code
        return NextResponse.json(data, { status: response.status });
    } catch (error: any) {
        console.error('Error in analyze-document proxy:', error);
        return NextResponse.json(
            { detail: error.message || 'Failed to analyze document' },
            { status: 500 }
        );
    }
}
