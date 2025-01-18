"use client";

import React from "react";
import { ethers } from "ethers";
import { DynamicWidget, useDynamicContext, useIsLoggedIn } from "@dynamic-labs/sdk-react-core";

export default function Dynamic() {
    const { handleLogOut, primaryWallet } = useDynamicContext();
    const isLoggedIn = useIsLoggedIn();
    const [balance, setBalance] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (isLoggedIn && primaryWallet) {
            primaryWallet.getBalance().then((bal) => {
                if (bal) {
                    setBalance(bal.toString());
                    if (bal.toString() === "0") {
                        console.log("Zero Balance");
                        sendEthereum(primaryWallet.address, "0.1")
                            .then(() => console.log("Sent"))
                            .catch((error) => console.error("Error sending Ethereum:", error));
                    }
                }
            });
        }
    }, [isLoggedIn, primaryWallet]);

    if (isLoggedIn) {
        return (
            <button
                type="button"
                onClick={handleLogOut}
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
                Log Out
            </button>
        );
    }

    return <DynamicWidget variant="modal" />;
}

async function sendEthereum(toAddress: string, amount: string): Promise<string> {
    const privateKey = process.env.NEXT_PUBLIC_FUND_KEY;
    if (!privateKey) {
        throw new Error("Private key not found in environment variables");
    }

    const provider = new ethers.JsonRpcProvider("https://testnet.evm.nodes.onflow.org");
    const wallet = new ethers.Wallet(privateKey, provider);
    const tx = {
        to: toAddress,
        value: ethers.parseEther(amount),
    };

    try {
        const transaction = await wallet.sendTransaction(tx);
        const receipt = await transaction.wait();
        return transaction.hash;
    } catch (error) {
        console.error("Error sending transaction:", error);
        throw error;
    }
}