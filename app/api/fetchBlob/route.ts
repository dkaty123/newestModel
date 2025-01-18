// File: app/api/fetchBlob/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const blobId = searchParams.get('blobId');

    if (!blobId) {
        return NextResponse.json({ error: 'No blobId provided' }, { status: 400 });
    }

    try {
        const response = await fetch(`https://aggregator.walrus-testnet.walrus.space/v1/${blobId}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const blobContent = await response.json();
        return NextResponse.json(blobContent);
    } catch (error) {
        console.error('Error fetching blob:', error);
        return NextResponse.json({ error: 'Failed to fetch blob content' }, { status: 500 });
    }
}
