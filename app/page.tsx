"use client";

import React from "react";
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import HomeContent from "./components/HomeContent";

export default function Home() {
    return (
        <DynamicContextProvider
            settings={{
                environmentId: "da43eec4-0253-4950-b5fe-741236182249",
                walletConnectors: [EthereumWalletConnectors],
            }}
        >
            <HomeContent />
        </DynamicContextProvider>
    );
}