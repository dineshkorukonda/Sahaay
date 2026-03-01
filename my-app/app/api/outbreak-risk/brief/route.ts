import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
    try {
        const { area, symptomCount, waterFailCount } = await req.json();

        if (!area) {
            return NextResponse.json({ error: 'Area is required' }, { status: 400 });
        }

        const apiKey = process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'AI not configured' }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-pro-latest' });

        const prompt = `You are a health surveillance analyst. Review the following recent (last 7 days) waterborne disease risk data for PIN code / Area: ${area}.
        
Data:
- Symptom Reports: ${symptomCount}
- Water Quality Failures: ${waterFailCount}

Provide a concise 4-6 line structured AI outbreak summary of the situation and recommended priority actions for health officials based exactly on this local data. Do not use markdown. If symptom and failure counts are low, state that it's low risk. If they are high, warn about a probable localized outbreak. Keep it professional.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        return NextResponse.json({
            success: true,
            summary: text.trim(),
        });
    } catch (error) {
        console.error('AI brief generation failed:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
