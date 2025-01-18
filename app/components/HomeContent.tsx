"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import CustomPersonaCreator from "./CustomPersonaCreator";
import SpeechRecorder from "./SpeechRecorder";
import Dynamic from "./Dynamic";
import { basePersonas } from "../lib/constants";

export default function HomeContent() {
    const { primaryWallet } = useDynamicContext();
    const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
    const [selectedPersona, setSelectedPersona] = useState(1);
    const [savedBlobIds, setSavedBlobIds] = useState<Record<number, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [personas, setPersonas] = useState(basePersonas);

    const handleAddCustomPersona = (newPersona: any) => {
        setPersonas(prev => [...prev, newPersona]);
    };

    const handleReset = () => {
        setMessages([]);
    };

    const handlePersonaChange = (newPersona: number) => {
        setSelectedPersona(newPersona);
        handleReset();
    };

    const handleSave = async () => {
        if (!primaryWallet || !primaryWallet.address) {
            alert("Wallet not connected");
            return;
        }

        setIsSaving(true);
        try {
            const saveResponse = await fetch("/api/save", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    messages,
                    persona: selectedPersona,
                }),
            });

            const saveData = await saveResponse.json();

            if (saveData.success) {
                const { blobId, persona } = saveData;

                const storeBlobResponse = await fetch("/api/store-blobid", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        address: primaryWallet.address,
                        persona: persona.toString(),
                        blobId: blobId,
                    }),
                });

                const storeBlobData = await storeBlobResponse.json();

                if (storeBlobData.success) {
                    localStorage.setItem(`persona_${persona}`, blobId);
                    setSavedBlobIds(prev => ({ ...prev, [persona]: blobId }));
                    alert("Chat saved successfully and stored on-chain!");
                } else {
                    throw new Error(storeBlobData.message);
                }
            } else {
                throw new Error(saveData.message);
            }
        } catch (error) {
            console.error("Error saving chat:", error);
            alert("Failed to save chat or store on-chain. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleLoad = async () => {
        const blobId = savedBlobIds[selectedPersona];
        if (!blobId) {
            alert("No saved chat found for this persona.");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`/api/fetchBlob?blobId=${blobId}`);
            const data = await response.json();
            setMessages(data.messages);
            alert("Chat loaded successfully!");
        } catch (error) {
            console.error("Error loading chat:", error);
            alert("Failed to load chat. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="container mx-auto p-4 flex flex-col min-h-screen bg-neutral-50 dark:bg-neutral-900">
            <div className="flex-grow">
                <div className="flex items-center mb-6">
                    <Image
                        src="/raccoon-logo.png"
                        alt="AnonTherapy Logo"
                        width={80}
                        height={80}
                        className="rounded-full mr-4"
                    />
                    <div>
                        <h1 className="text-3xl font-bold text-primary-800 dark:text-primary-200">AnonTherapy</h1>
                        <h2 className="text-xl font-semibold text-neutral-600 dark:text-neutral-400">
                            Voice-enabled AI Therapy
                        </h2>
                    </div>
                    <div className="ml-auto">
                        <Dynamic />
                    </div>
                </div>

                <CustomPersonaCreator onAdd={handleAddCustomPersona} />

                <div className="mb-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {personas.map((persona) => (
                            <div
                                key={persona.id}
                                onClick={() => handlePersonaChange(persona.id)}
                                className={`p-4 rounded-lg cursor-pointer transition-all ${
                                    selectedPersona === persona.id
                                        ? 'bg-primary-100 dark:bg-primary-900 border-2 border-primary-500'
                                        : 'bg-white dark:bg-neutral-800 hover:bg-primary-50 dark:hover:bg-primary-900/50'
                                }`}
                            >
                                <h3 className="font-semibold text-lg mb-2">{persona.name}</h3>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                    {persona.description}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-2 mt-4">
                        <button
                            onClick={handleReset}
                            className="bg-neutral-600 hover:bg-neutral-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            Reset Chat
                        </button>

                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className={`${
                                isSaving ? 'bg-neutral-400' : 'bg-primary-600 hover:bg-primary-700'
                            } text-white px-4 py-2 rounded-lg transition-colors`}
                        >
                            {isSaving ? 'Saving...' : 'Save Chat'}
                        </button>

                        {savedBlobIds[selectedPersona] && (
                            <button
                                onClick={handleLoad}
                                disabled={isLoading}
                                className="bg-secondary-600 hover:bg-secondary-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                {isLoading ? 'Loading...' : 'Load Saved Chat'}
                            </button>
                        )}
                    </div>
                </div>

                <SpeechRecorder
                    selectedPersona={selectedPersona}
                    messages={messages}
                    setMessages={setMessages}
                />

                <div className="bg-white dark:bg-neutral-800 p-4 h-96 overflow-y-auto mb-4 rounded-lg shadow-lg custom-scrollbar">
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`mb-2 ${message.role === "user" ? "text-right" : "text-left"}`}
                        >
                            <span
                                className={`inline-block p-2 rounded-lg max-w-[80%] ${
                                    message.role === "user"
                                        ? "bg-primary-500 text-white"
                                        : "bg-neutral-200 dark:bg-neutral-700"
                                }`}
                            >
                                {message.content}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <footer className="mt-8 text-center text-neutral-600 dark:text-neutral-400">
                Made with 🥰 by{" "}
                <Link href="https://cryptonomic.tech/" className="text-primary-600 hover:underline">
                    Cryptonomic
                </Link>{" "}
                &nbsp; | &nbsp;
                <Link
                    href="https://github.com/Cryptonomic/anonTherapy/blob/main/README.md"
                    className="text-primary-600 hover:underline"
                >
                    About the Project
                </Link>
            </footer>
        </main>
    );
}