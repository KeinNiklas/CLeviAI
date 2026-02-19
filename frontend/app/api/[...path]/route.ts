import { NextRequest, NextResponse } from 'next/server';

/**
 * Catch-all proxy route that forwards requests to the FastAPI backend.
 * No environment variables needed - the backend URL is derived from convention:
 *  - In local dev: http://localhost:8000
 *  - In production: The same host but on port 8000 (or configured via the path)
 * 
 * Frontend calls relative paths like /auth/token → forwarded to backend.
 */

function getBackendBaseUrl(request: NextRequest): string {
    const host = request.headers.get('host') || 'localhost:3000';
    const proto = request.headers.get('x-forwarded-proto') || 'http';

    // In local dev (localhost), backend runs on port 8000
    if (host.startsWith('localhost') || host.startsWith('127.0.0.1')) {
        return 'http://localhost:8000';
    }

    // In production, the backend Vercel deployment shares the same base domain
    // but with a different subdomain or path. We use the referer/origin to detect
    // the backend URL, or fall back to a sibling deployment convention.
    // Attempt to find backend URL from environment (server-side, not public)
    const backendUrl = process.env.BACKEND_URL;
    if (backendUrl) return backendUrl;

    // Last resort: same origin (works if backend is co-deployed as serverless functions)
    return `${proto}://${host}`;
}

async function handler(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const backendUrl = getBackendBaseUrl(request);
    const { path } = await params;
    const targetUrl = `${backendUrl}/${path.join('/')}${request.nextUrl.search}`;

    // Forward headers (excluding host which is set automatically)
    const headers = new Headers();
    request.headers.forEach((value, key) => {
        if (!['host', 'connection'].includes(key.toLowerCase())) {
            headers.set(key, value);
        }
    });

    const body = ['GET', 'HEAD'].includes(request.method) ? undefined : await request.arrayBuffer();

    const response = await fetch(targetUrl, {
        method: request.method,
        headers,
        body,
    });

    const responseBody = await response.arrayBuffer();
    return new NextResponse(responseBody, {
        status: response.status,
        headers: response.headers,
    });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;
