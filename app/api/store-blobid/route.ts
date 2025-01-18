// File: app/api/store-blobid/route.ts
import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

// ABI for the anonTherapy contract (only the write function)
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
            },
            {
                "internalType": "string",
                "name": "_blobId",
                "type": "string"
            }
        ],
        "name": "write",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

export async function POST(request: Request) {
    const body = await request.json();
    const { address, persona, blobId } = body;

    // Validate input
    if (!address || !persona || !blobId) {
        return NextResponse.json({
            success: false,
            message: 'Missing required parameters'
        }, { status: 400 });
    }

    try {
        // Connect to the Ethereum network (replace with your network details)
        const provider = new ethers.JsonRpcProvider('https://testnet.evm.nodes.onflow.org');

        // Use the private key from environment variables
        const privateKey = process.env.FUND_KEY;
        if (!privateKey) {
            throw new Error('Contract owner private key not found in environment variables');
        }

        const signer = new ethers.Wallet(privateKey, provider);

        // Create contract instance (replace with your contract address)
        const contractAddress = process.env.ANON_THERAPY_CONTRACT_ADDRESS;
        if (!contractAddress) {
            throw new Error('Contract address not found in environment variables');
        }

        const contract = new ethers.Contract(contractAddress, ABI, signer);

        // Call the write function
        const tx = await contract.write(address, persona, blobId);
        await tx.wait(); // Wait for the transaction to be mined

        console.log("Flow tx: " + tx.hash)

        return NextResponse.json({
            success: true,
            message: 'BlobId stored successfully in the contract',
            transactionHash: tx.hash
        });

    } catch (error) {
        console.error('Error storing blobId in contract:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to store blobId in contract'
        }, { status: 500 });
    }
}
