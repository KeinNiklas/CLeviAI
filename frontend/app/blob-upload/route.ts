import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: Request): Promise<NextResponse> {
    const body = (await request.json()) as HandleUploadBody;

    try {
        const jsonResponse = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async (pathname: string, clientPayload: string | null) => {
                if (!clientPayload) {
                    throw new Error("Unauthorized: No token provided via clientPayload");
                }
                
                // Verify the JWT token securely using the Python backend
                const verifyUrl = new URL('/api/users/me', request.url);
                try {
                    const authRes = await fetch(verifyUrl.toString(), {
                        headers: { 'Authorization': `Bearer ${clientPayload}` }
                    });
                    if (!authRes.ok) {
                        throw new Error("Invalid or expired token");
                    }
                } catch (e) {
                    throw new Error(`Token validation failed: ${(e as Error).message}`);
                }

                // Here we setup rules for the client upload token
                return {
                    maximumSizeInBytes: 20 * 1024 * 1024, // 20 MB limit
                    // wir erlauben PDF, DOCX und TXT
                    allowedContentTypes: [
                        'application/pdf', 
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
                        'text/plain'
                    ],
                };
            },
            onUploadCompleted: async ({ blob, tokenPayload }) => {
                // Called once Vercel Blob finishes the upload
                console.log('blob upload completed', blob, tokenPayload);
            },
        });

        return NextResponse.json(jsonResponse, { headers: corsHeaders });
    } catch (error) {
        console.error("Blob Upload Route Error:", error);
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 400, headers: corsHeaders } // The webhook will retry 5 times waiting for a 200
        );
    }
}
