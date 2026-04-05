import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
    const body = (await request.json()) as HandleUploadBody;
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
        return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    try {
        const jsonResponse = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async (pathname: string) => {
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

        return NextResponse.json(jsonResponse);
    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 400 } // The webhook will retry 5 times waiting for a 200
        );
    }
}
