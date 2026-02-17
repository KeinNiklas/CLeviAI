import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:8000';

        // Forward to Python backend
        const response = await fetch(`${backendUrl}/plans`, {
            method: 'GET',
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error: any) {
        console.error('Error in plans GET proxy:', error);
        return NextResponse.json(
            { detail: error.message || 'Failed to fetch plans' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:8000';
        const { searchParams } = new URL(request.url);
        const planId = searchParams.get('id');

        if (!planId) {
            return NextResponse.json({ detail: 'Plan ID is required' }, { status: 400 });
        }

        // Forward to Python backend
        const response = await fetch(`${backendUrl}/plans/${planId}`, {
            method: 'DELETE',
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error: any) {
        console.error('Error in plans DELETE proxy:', error);
        return NextResponse.json(
            { detail: error.message || 'Failed to delete plan' },
            { status: 500 }
        );
    }
}
