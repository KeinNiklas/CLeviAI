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
                    // Wir lassen tokenPayload weg, um Headersize-Probleme am Edge zu vermeiden
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
