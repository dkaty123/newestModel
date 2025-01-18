"use client";

import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

// Types for GPT messages
interface Message {
    role: string;
    content: string;
}

interface SpeechRecorderProps {
    // The persona chosen by the user (1,2,3,4...) from your existing code
    selectedPersona: number;
    // Current messages in the conversation (user + assistant)
    messages: Message[];
    // State setter for messages (so we can append new messages from speech)
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

    // We'll track the last time we received a speech result to detect 2s of silence
    const lastResultTimeRef = useRef<number>(0);
    const intervalRef = useRef<NodeJS.Timer | null>(null);

    // Initialize speech recognition once on mount
    useEffect(() => {
        // Check for browser compatibility
        const SpeechRecognition =
            (window as any).SpeechRecognition ||
            (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.warn("This browser does not support the Web Speech API.");
            return;
        }

        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = "en-US";

        // Fired when the speech recognition service returns a result
        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
            lastResultTimeRef.current = Date.now();

            // Combine all results into a single transcript (for interim results)
            let transcript = "";
            for (let i = event.resultIndex; i < event.results.length; i++) {
                // results[i] is a SpeechRecognitionResult
                const result = event.results[i];
                // If it's the final result, we can finalize
                transcript += result[0].transcript;
            }

            // Update partial transcript
            setPartialTranscript((prev) => prev + " " + transcript);
        };

        // (Optional) handle errors
        recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
            console.error("Speech recognition error:", event.error);
        };

        // (Optional) handle end-of-speech automatically if the recognition stops
        recognitionRef.current.onend = () => {
            // If we're still in recording mode but recognition ended, you might want
            // to restart recognition. For now, we'll rely on the 2s pause logic.
            console.log("Speech recognition service disconnected");
        };

        // Cleanup if component unmounts
        return () => {
            stopCheckSilence();
            recognitionRef.current?.stop();
        };
    }, []);

    // Periodically check if we've had a >=2s silence 
    useEffect(() => {
        if (isRecording) {
            startCheckSilence();
        } else {
            stopCheckSilence();
        }
    }, [isRecording]);

    // Start the microphone & speech recognition
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

    // Stop the microphone & speech recognition
    const stopRecording = () => {
        if (!recognitionRef.current) return;
        recognitionRef.current.stop();
        setIsRecording(false);

        // If there's any leftover partial transcript, finalize it now
        if (partialTranscript.trim()) {
            finalizeChunk(partialTranscript.trim());
            setPartialTranscript("");
        }
    };

    // Check if 2s have passed since last speech result
    const startCheckSilence = () => {
        // Check every 500ms
        if (intervalRef.current) return; // do not start multiple intervals
        intervalRef.current = setInterval(() => {
            const now = Date.now();
            const diff = now - lastResultTimeRef.current;
            if (diff >= 2000 && partialTranscript.trim()) {
                // It's been 2 seconds of silence, finalize the chunk
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

    // This function sends the recognized speech chunk to GPT,
    // just like your text input submission logic
    const finalizeChunk = async (chunk: string) => {
        // 1. Add the user message to local state
        setMessages((prev) => [...prev, { role: "user", content: chunk }]);

        // 2. Call your existing /api/chat endpoint with the recognized text
        try {
            const response = await axios.post("/api/chat", {
                message: chunk,
                persona: selectedPersona,
            });

            // 3. Add the assistant's response to local state
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: response.data.message },
            ]);
        } catch (error) {
            console.error("Error calling GPT /api/chat:", error);
        }
    };

    return (
        <div style={{ marginBottom: "1rem" }}>
            <div>
                <button
                    onClick={startRecording}
                    disabled={isRecording}
                    style={{
                        marginRight: "0.5rem",
                        backgroundColor: isRecording ? "#ccc" : "#88A700",
                        color: "#fff",
                        padding: "0.5rem 1rem",
                        borderRadius: "5px",
                        cursor: isRecording ? "not-allowed" : "pointer",
                    }}
                >
                    Start Recording
                </button>

                <button
                    onClick={stopRecording}
                    disabled={!isRecording}
                    style={{
                        backgroundColor: !isRecording ? "#ccc" : "#D90000",
                        color: "#fff",
                        padding: "0.5rem 1rem",
                        borderRadius: "5px",
                        cursor: !isRecording ? "not-allowed" : "pointer",
                    }}
                >
                    Stop Recording
                </button>
            </div>

            {isRecording && (
                <div style={{ marginTop: "1rem", fontStyle: "italic" }}>
                    Listening... (interim transcript)
                    <div
                        style={{
                            background: "#eee",
                            padding: "0.5rem",
                            borderRadius: "5px",
                            marginTop: "0.5rem",
                        }}
                    >
                        {partialTranscript}
                    </div>
                </div>
            )}
        </div>
    );
}
