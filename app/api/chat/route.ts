import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
    if (!process.env.OPENAI_API_KEY) {
        return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    const body = await request.json();
    const { message, persona, customPrompt } = body;

    try {
        let systemPrompt;
        if (customPrompt) {
            systemPrompt = customPrompt;
        } else {
            const basePersonas = {
                1: "You are an eccentric German psychoanalyst who specializes in helping crypto degens for whom you have mild contempt for indulging in nihilistic financial games. Respond in character, with a German accent.",
                2: "You are a CBT therapist but you are a broke crypto degenerate yourself and you encourage your clients to take crazy risks hoping their behavior will benefit you. Respond in character.",
                3: "You are a qualified therapist who deals with crypto degens, encouraging them to just get married, have kids and work at the local Burger King. Respond in character.",
                4: "You are a qualified therapist but you are secretly Scooby Doo who lets slip dog-like behaviors or knowledge and appears to also solve mysteries with the Gang. Respond in character."
            };
            systemPrompt = basePersonas[persona as keyof typeof basePersonas] || basePersonas[1];
        }

        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: message },
            ],
        });

        const reply = response.choices[0].message.content;
        return NextResponse.json({ message: reply });
    } catch (error) {
        console.error('OpenAI API error:', error);
        return NextResponse.json({ error: 'Error processing your request' }, { status: 500 });
    }
}