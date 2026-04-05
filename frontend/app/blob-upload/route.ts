import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

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
                
                // Verify the JWT securely using native crypto instead of unstable network loopback
                try {
                    const secretKey = process.env.JWT_SECRET || "supersecretkey_change_me_in_prod";
                    const secret = new TextEncoder().encode(secretKey);
                    await jwtVerify(clientPayload, secret);
                } catch (e) {
                    console.error("JWT decoding failed:", e);
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
                    tokenPayload: JSON.stringify({ verified: true }) // CRITICAL: explicit token payload so Vercel doesn't implicitly copy the 300-byte JWT into its internal upload token, which breaks AWS HTTP header limits!
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
