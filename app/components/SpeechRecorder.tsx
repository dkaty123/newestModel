"use client";

import React, { useState, useRef, useEffect } from "react";

interface Message {
    role: string;
    content: string;
}

interface SpeechRecorderProps {
    selectedPersona: number;
    messages: Message[];
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

export default function SpeechRecorder({
    selectedPersona,
    messages,
    setMessages,
}: SpeechRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [partialTranscript, setPartialTranscript] = useState("");
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const lastResultTimeRef = useRef<number>(0);
    const intervalRef = useRef<NodeJS.Timer | null>(null);

    useEffect(() => {
        const SpeechRecognition =
            (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.warn("This browser does not support the Web Speech API.");
            return;
        }

        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = "en-US";

        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
            lastResultTimeRef.current = Date.now();
            let transcript = "";
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }
            setPartialTranscript(transcript);
        };

        recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
            console.error("Speech recognition error:", event.error);
        };

        recognitionRef.current.onend = () => {
            console.log("Speech recognition service disconnected");
        };

        return () => {
            stopCheckSilence();
            recognitionRef.current?.stop();
        };
    }, []);

    useEffect(() => {
        if (isRecording) {
            startCheckSilence();
        } else {
            stopCheckSilence();
        }
    }, [isRecording]);

    const startRecording = () => {
        if (!recognitionRef.current) {
            alert("Speech recognition is not supported in this browser.");
            return;
        }
        setPartialTranscript("");
        lastResultTimeRef.current = Date.now();
        recognitionRef.current.start();
        setIsRecording(true);
    };

    const stopRecording = () => {
        if (!recognitionRef.current) return;
        recognitionRef.current.stop();
        setIsRecording(false);

        if (partialTranscript.trim()) {
            finalizeChunk(partialTranscript.trim());
            setPartialTranscript("");
        }
    };

    const startCheckSilence = () => {
        if (intervalRef.current) return;
        intervalRef.current = setInterval(() => {
            const now = Date.now();
            const diff = now - lastResultTimeRef.current;
            if (diff >= 2000 && partialTranscript.trim()) {
                const chunk = partialTranscript.trim();
                setPartialTranscript("");
                finalizeChunk(chunk);
            }
        }, 500);
    };

    const stopCheckSilence = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    const finalizeChunk = async (chunk: string) => {
        setMessages(prev => [...prev, { role: "user", content: chunk }]);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: chunk,
                    persona: selectedPersona,
                }),
            });

            const data = await response.json();
            setMessages(prev => [...prev, { role: "assistant", content: data.message }]);
        } catch (error) {
            console.error("Error calling chat API:", error);
        }

        if (recognitionRef.current && isRecording) {
            recognitionRef.current.stop();
            setTimeout(() => {
                if (isRecording) {
                    recognitionRef.current?.start();
                }
            }, 300);
        }
    };

    return (
        <div className="mb-6">
            <div className="flex gap-2">
                <button
                    onClick={startRecording}
                    disabled={isRecording}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                        isRecording
                            ? 'bg-neutral-400 cursor-not-allowed'
                            : 'bg-primary-600 hover:bg-primary-700 text-white'
                    }`}
                >
                    Start Recording
                </button>

                <button
                    onClick={stopRecording}
                    disabled={!isRecording}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                        !isRecording
                            ? 'bg-neutral-400 cursor-not-allowed'
                            : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                >
                    Stop Recording
                </button>
            </div>

            {isRecording && (
                <div className="mt-4">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 italic">
                        Listening... (interim transcript below)
                    </p>
                    <div className="mt-2 p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg min-h-[3em]">
                        {partialTranscript}
                    </div>
                </div>
            )}
        </div>
    );
}