import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import connectDB from '@/lib/db';
import { MedicalRecord } from '@/lib/models';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const groq = new Groq({ apiKey: process.env.GROQ_API });

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'fallback_secret_key_change_in_prod'
);

export async function POST(req: Request) {
    try {
        // Verify User
        const token = (await cookies()).get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const userId = payload.userId as string;

        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        const text = formData.get('text') as string | null;

        let contentToAnalyze = text;

        if (file) {
            // In a real scenario, we would parse the PDF here using 'pdf-parse' or send to an OCR service.
            // Since pdf-parse is purely Node.js and might have issues in Edge or specific environments, 
            // and handling file upload parsing in Next.js App Router can be tricky without additional libs,
            // we will assume for this task that the CLIENT extracts text or we use a basic text extraction if possible.
            // However, the user said "analyse the pdf".
            // Let's rely on the text content sent by the client OR simple placeholder for file parsing if not provided.

            // For now, if we receive a file, we might not be able to parse it directly with just 'groq-sdk'. 
            // The prompt implies "analyse the pdf and get the disease name". 
            // I'll assume text is passed or we need to extract it. 
            // Let's assume the frontend sends the *text* content of the PDF for now, 
            // or we use a library if extracting on server is required.
            // Given I see `pdf-parse` in package.json, I can try to use it if I was in a Node runtime.
            // But App Router API routes run in Node by default unless specified.
            if (!contentToAnalyze) {
                // Fallback: If 'pdf-parse' is available and we received a blob.
                // But 'pdf-parse' takes a buffer.
                const arrayBuffer = await file.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);

                // Polyfill for pdf-parse/pdf.js dependencies in Node env
                if (typeof global.DOMMatrix === 'undefined') {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (global as any).DOMMatrix = class DOMMatrix { };
                }
                if (typeof global.ImageData === 'undefined') {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (global as any).ImageData = class ImageData { };
                }
                if (typeof global.Path2D === 'undefined') {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (global as any).Path2D = class Path2D { };
                }
                if (typeof global.performance === 'undefined') {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (global as any).performance = require('perf_hooks').performance;
                }

                // eslint-disable-next-line @typescript-eslint/no-require-imports
                const pdfParse = require('pdf-parse');

                const data = await pdfParse(buffer);
                contentToAnalyze = data.text;
            }
        }

        if (!contentToAnalyze) {
            return NextResponse.json({ error: 'No content to analyze' }, { status: 400 });
        }

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a medical assistant. Extract the disease name/diagnosis and a list of medicines from the provided medical report text. Return ONLY a valid JSON object with keys: 'diseaseName' (string) and 'medicines' (array of strings). If not found, return null values."
                },
                {
                    role: "user",
                    content: contentToAnalyze
                }
            ],
            model: "llama3-8b-8192",
            response_format: { type: "json_object" }
        });

        const result = completion.choices[0]?.message?.content;
        if (!result) {
            throw new Error('No result from Groq');
        }

        const parsedResult = JSON.parse(result);

        // Save to DB
        await connectDB();
        const record = await MedicalRecord.create({
            userId,
            diseaseName: parsedResult.diseaseName,
            medicines: parsedResult.medicines,
            source: 'groq_scan',
            analyzedAt: new Date(),
        });

        return NextResponse.json({ success: true, data: record });


    } catch (error: unknown) {
        console.error('Analyze PDF Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
