import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-vercel-signature',
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
                // [DEBUG] Received clientPayload from frontend
                console.log("[DEBUG] Token Validation - Received clientPayload:", clientPayload ? `${clientPayload.substring(0, 20)}...` : "null");

                let verifiedPayload;
                try {
                    const secretKey = process.env.JWT_SECRET || "RvpeNCp2l9KvqJXWU7U1";
                    console.log("[DEBUG] Using JWT Secret:", process.env.JWT_SECRET ? "from process.env.JWT_SECRET" : "using hardcoded fallback");
                    
                    const secret = new TextEncoder().encode(secretKey);
                    const { payload } = await jwtVerify(clientPayload!, secret, { algorithms: ['HS256'] });
                    verifiedPayload = payload;
                    
                    console.log("[DEBUG] JWT Verification successful for user:", payload.sub);
                } catch (e: any) {
                    console.error("[DEBUG] JWT decoding FAILED. Details:", e.code || e.message);
                    throw new Error(`Token validation failed: ${e.message}`);
                }

                // Here we setup rules for the client upload token
                return {
                    maximumSizeInBytes: 20 * 1024 * 1024, // 20 MB limit
                    tokenPayload: verifiedPayload.sub as string, // User-ID aus JWT (schlank)
                };
            },
            // Zwingend erforderlicher Callback für den Abschluss des Uploads
            onUploadCompleted: async ({ blob, tokenPayload }) => {
                console.log("Upload erfolgreich abgeschlossen:", blob.url);
                // Platz für weitere Logik, z. B. Datenbankeinträge
            }
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
