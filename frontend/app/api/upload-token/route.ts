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
        // --- FIX: Webhook URL bereinigen ---
        const publicUrl = new URL(request.url);
        publicUrl.pathname = '/api/upload-token'; // Erzwingt den öffentlichen Pfad

        // Neuen Request mit sauberer URL und originalen Headern erstellen
        const fixedRequest = new Request(publicUrl.toString(), {
            method: request.method,
            headers: request.headers,
        });

        const jsonResponse = await handleUpload({
            body,
            request: fixedRequest, // Hier den manipulierten Request übergeben
            onBeforeGenerateToken: async (pathname: string, clientPayload: string | null) => {
                // [DEBUG Node.js] Start Token Validation
                console.log(`[DEBUG Node.js] Endpoint reached for pathname: ${pathname}`);
                console.log(`[DEBUG Node.js] Validating token (start): ${clientPayload?.substring(0, 20)}...`);

                let verifiedPayload;
                try {
                    const secretKey = process.env.JWT_SECRET || "RvpeNCp2l9KvqJXWU7U1";

                    // [DEBUG Node.js] Log Secret Details
                    console.log(`[DEBUG Node.js] Using Secret: ${secretKey.substring(0, 4)}...${secretKey.substring(secretKey.length - 4)} (Len: ${secretKey.length})`);
                    console.log(`[DEBUG Node.js] Secret Source: ${process.env.JWT_SECRET ? "env" : "hardcoded fallback"}`);

                    const secret = new TextEncoder().encode(secretKey);
                    const { payload } = await jwtVerify(clientPayload!, secret, { algorithms: ['HS256'] });
                    verifiedPayload = payload;

                    console.log("[DEBUG Node.js] JWT Verification SUCCESS for user:", payload.sub);
                } catch (e: any) {
                    console.error("[DEBUG Node.js] JWT decoding FAILED. Error Code/Message:", e.code || e.message);
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
                console.log("[DEBUG Node.js] Upload successfully finished:", blob.url);
                console.log("[DEBUG Node.js] Token Payload for completed upload:", tokenPayload);
            }
        });

        return NextResponse.json(jsonResponse, { headers: corsHeaders });
    } catch (error) {
        console.error("[DEBUG Node.js] CRITICAL ERROR in route handler:", (error as Error).message);
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 400, headers: corsHeaders }
        );
    }
}
