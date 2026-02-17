import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:8000';
        const { id: planId } = await params;

        // Forward to Python backend
        const response = await fetch(`${backendUrl}/plans/${planId}`, {
            method: 'GET',
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error: any) {
        console.error('Error in plan GET proxy:', error);
        return NextResponse.json(
            { detail: error.message || 'Failed to fetch plan' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:8000';
        const { id: planId } = await params;

        // Forward to Python backend
        const response = await fetch(`${backendUrl}/plans/${planId}`, {
            method: 'DELETE',
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error: any) {
        console.error('Error in plan DELETE proxy:', error);
        return NextResponse.json(
            { detail: error.message || 'Failed to delete plan' },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const body = await request.json();
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:8000';
        const { id: planId } = await params;

        // Forward to Python backend
        const response = await fetch(`${backendUrl}/plans/${planId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error: any) {
        console.error('Error in plan PATCH proxy:', error);
        return NextResponse.json(
            { detail: error.message || 'Failed to update plan' },
            { status: 500 }
        );
    }
}
