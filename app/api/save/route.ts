// File: app/api/save/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const body = await request.json();
    const { messages, persona } = body;

    try {
        // Make HTTP PUT request to Walrus
        const response = await fetch('https://walrus-testnet-publisher.nodes.guru/v1/store', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ messages, persona }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const result = await response.json();

        // Extract blobId from the result
        const blobId = result.newlyCreated.blobObject.blobId;

        // In a server environment, we can't directly access localStorage.
        // Instead, we'll return the blobId and persona to the client
        // for it to save in localStorage.

        return NextResponse.json({
            success: true,
            message: 'Chat saved successfully',
            blobId,
            persona
        });

    } catch (error) {
        console.error('Error saving chat:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to save chat'
        }, { status: 500 });
    }
}
