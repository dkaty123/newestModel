// File: app/api/retrieve-blobid/route.ts
import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

// ABI for the anonTherapy contract (only the read function)
const ABI = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_address",
                "type": "address"
            },
            {
                "internalType": "string",
                "name": "_persona",
                "type": "string"
            }
        ],
        "name": "read",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    const persona = searchParams.get('persona');

    // Validate input
    if (!address || !persona) {
        return NextResponse.json({
            success: false,
            message: 'Missing required parameters'
        }, { status: 400 });
    }

    try {
        // Connect to the Ethereum network (replace with your network details)
        const provider = new ethers.JsonRpcProvider('https://testnet.evm.nodes.onflow.org');

        // Create contract instance (replace with your contract address)
        const contractAddress = process.env.ANON_THERAPY_CONTRACT_ADDRESS;
        if (!contractAddress) {
            throw new Error('Contract address not found in environment variables');
        }

        const contract = new ethers.Contract(contractAddress, ABI, provider);

        // Call the read function
        const blobId = await contract.read(address, persona);

        return NextResponse.json({
            success: true,
            blobId: blobId
        });

    } catch (error) {
        console.error('Error retrieving blobId from contract:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to retrieve blobId from contract'
        }, { status: 500 });
    }
}
