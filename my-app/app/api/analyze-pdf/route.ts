import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import connectDB from '@/lib/db';
import { MedicalRecord } from '@/lib/models';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'fallback_secret_key_change_in_prod'
);

export async function POST(req: Request) {
    try {
        // Verify User - Support both Bearer token (mobile) and cookie (web)
        const authHeader = req.headers.get('authorization');
        let userId: string;

        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const { payload} = await jwtVerify(token, JWT_SECRET);
            userId = payload.userId as string;
        } else {
            const token = (await cookies()).get('token')?.value;
            if (!token) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
            const { payload } = await jwtVerify(token, JWT_SECRET);
            userId = payload.userId as string;
        }

        const formData = await req.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Data = buffer.toString('base64');
        const fileType = file.type;

        // Initialize Gemini Model
        const model = genAI.getGenerativeModel({ model: "gemini-pro-latest" });

        // Prepare parts for Gemini
        const parts = [
            {
                inlineData: {
                    data: base64Data,
                    mimeType: fileType
                }
            },
            {
                text: `Analyze this medical report thoroughly and extract the following structured data.
                Focus heavily on MEDICATIONS (names, dosages, timings) and any specific DIET or EXERCISE recommendations explicitly mentioned or implied by the condition.
                
                Return extracted data in this JSON structure:
                {
                  "diseaseName": "string (Primary diagnosis)",
                  "medicines": ["array of strings (e.g. 'Metformin 500mg - Twice daily before meals')"],
                  "vitals": {
                    "bloodPressure": "string",
                    "heartRate": "number",
                    "temperature": "number",
                    "weight": "number",
                    "glucose": "number",
                    "bmi": "number"
                  },
                  "labValues": [{"name": "string", "value": "string", "unit": "string", "normalRange": "string"}],
                  "reportDate": "date string",
                  "doctorName": "string",
                  "hospitalName": "string",
                  "diagnosis": "string",
                  "symptoms": ["string"],
                  "recommendations": ["string (General medical recommendations)"]
                }
                `
            }
        ];

        const result = await model.generateContent({
            contents: [{ role: "user", parts: parts }],
            generationConfig: { responseMimeType: "application/json" }
        });

        const responseText = result.response.text();
        const parsedResult = JSON.parse(responseText);

        // Save to DB with file information
        await connectDB();

        // Store file as base64 in MongoDB (for hackathon - in production use cloud storage)
        let fileUrl: string | undefined;
        if (file) {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const base64 = buffer.toString('base64');
            // Store as data URL for retrieval
            fileUrl = `data:${fileType};base64,${base64}`;
        }

        // Parse report date if available
        let reportDate: Date | undefined;
        if (parsedResult.reportDate) {
            reportDate = new Date(parsedResult.reportDate);
            if (isNaN(reportDate.getTime())) {
                reportDate = undefined;
            }
        }

        const record = await MedicalRecord.create({
            userId,
            diseaseName: parsedResult.diseaseName,
            medicines: parsedResult.medicines || [],
            source: 'groq_scan',
            analyzedAt: new Date(),
            fileName: file?.name,
            fileType: fileType,
            fileSize: file?.size,
            fileUrl: fileUrl,
            vitals: parsedResult.vitals || {},
            labValues: parsedResult.labValues || [],
            reportDate: reportDate,
            doctorName: parsedResult.doctorName,
            hospitalName: parsedResult.hospitalName,
            diagnosis: parsedResult.diagnosis,
            symptoms: parsedResult.symptoms || [],
            recommendations: parsedResult.recommendations || []
        });

        return NextResponse.json({
            success: true,
            data: {
                ...record.toObject(),
                diseaseName: parsedResult.diseaseName,
                medicines: parsedResult.medicines || []
            }
        });


    } catch (error: unknown) {
        console.error('Analyze PDF Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
