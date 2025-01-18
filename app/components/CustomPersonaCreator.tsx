"use client";

import React, { useState } from 'react';

interface CustomPersonaProps {
    onAdd: (persona: {
        id: number;
        name: string;
        description: string;
        customPrompt: string;
    }) => void;
}

export default function CustomPersonaCreator({ onAdd }: CustomPersonaProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [customPrompt, setCustomPrompt] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!name || !description || !customPrompt) {
            alert('Please fill in all fields');
            return;
        }

        // Generate a random ID above 1000 to avoid conflicts with base personas
        const id = Math.floor(Math.random() * 9000) + 1000;
        
        onAdd({
            id,
            name,
            description,
            customPrompt
        });

        // Reset form
        setName('');
        setDescription('');
        setCustomPrompt('');
        setIsOpen(false);
    };

    return (
        <div className="mb-6">
            {!isOpen ? (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-secondary-600 hover:bg-secondary-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    Create Custom Therapist
                </button>
            ) : (
                <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-lg">
                    <h3 className="text-xl font-semibold mb-4">Create Custom Therapist</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-neutral-700 dark:border-neutral-600"
                                placeholder="Dr. Smith"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                Short Description
                            </label>
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-neutral-700 dark:border-neutral-600"
                                placeholder="A compassionate therapist specializing in anxiety"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                Personality Prompt
                            </label>
                            <textarea
                                value={customPrompt}
                                onChange={(e) => setCustomPrompt(e.target.value)}
                                className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-neutral-700 dark:border-neutral-600"
                                rows={4}
                                placeholder="You are a compassionate therapist who specializes in anxiety disorders. You use a mix of CBT and mindfulness techniques..."
                            />
                        </div>
                        
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                Create Therapist
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="bg-neutral-600 hover:bg-neutral-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}