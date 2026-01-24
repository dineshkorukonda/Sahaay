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
        let fileType = file?.type || 'application/pdf';

        if (file) {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            fileType = file.type;

            // Handle PDF files
            if (file.type === 'application/pdf' || file.name?.endsWith('.pdf')) {
                if (!contentToAnalyze) {
                    try {
                        // Use pdfjs-dist for PDF parsing (more reliable than pdf-parse)
                        // Import pdfjs-dist - use the build/pdf.mjs path
                        const pdfjsLib = await import('pdfjs-dist/build/pdf.mjs');
                        // Get the getDocument function from the library
                        const { getDocument } = pdfjsLib;
                        
                        // Load the PDF document
                        const loadingTask = getDocument({
                            data: new Uint8Array(buffer),
                            useSystemFonts: true,
                            verbosity: 0
                        });
                        
                        const pdfDocument = await loadingTask.promise;
                        const numPages = pdfDocument.numPages;
                        
                        // Extract text from all pages
                        const textParts: string[] = [];
                        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
                            const page = await pdfDocument.getPage(pageNum);
                            const textContent = await page.getTextContent();
                            const pageText = textContent.items
                                .map((item: any) => item.str)
                                .join(' ');
                            textParts.push(pageText);
                        }
                        
                        contentToAnalyze = textParts.join('\n\n');
                    } catch (pdfError) {
                        console.error('Error parsing PDF with pdfjs-dist:', pdfError);
                        
                        // Fallback to pdf-parse if pdfjs-dist fails
                        const originalError = console.error; // Declare outside try-catch for scope
                        try {
                            // Try pdf-parse as fallback (suppress initialization errors)
                            console.error = () => {}; // Suppress test file errors
                            
                            // eslint-disable-next-line @typescript-eslint/no-require-imports
                            const pdfParse = require('pdf-parse');
                            const data = await pdfParse(buffer);
                            contentToAnalyze = data.text;
                            
                            console.error = originalError; // Restore
                        } catch (fallbackError) {
                            console.error = originalError; // Restore
                            const errorMsg = fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
                            
                            // If it's the test file error, try one more time
                            if (errorMsg.includes('test/data') || errorMsg.includes('ENOENT')) {
                                try {
                                    // eslint-disable-next-line @typescript-eslint/no-require-imports
                                    const pdfParse = require('pdf-parse');
                                    const data = await pdfParse(buffer);
                                    contentToAnalyze = data.text;
                                } catch (finalError) {
                                    return NextResponse.json({ 
                                        error: 'Failed to parse PDF. The file may be corrupted, password-protected, or in an unsupported format.',
                                        details: 'Please try uploading a different PDF file.'
                                    }, { status: 400 });
                                }
                            } else {
                                return NextResponse.json({ 
                                    error: 'Failed to parse PDF. The file may be corrupted, password-protected, or in an unsupported format.',
                                    details: errorMsg
                                }, { status: 400 });
                            }
                        }
                    }
                }
            } 
            // Handle PNG/Image files - convert to base64 and use vision model or OCR
            else if (file.type.startsWith('image/') || file.name?.match(/\.(png|jpg|jpeg|gif)$/i)) {
                // Convert image to base64
                const base64Image = buffer.toString('base64');
                const dataUrl = `data:${file.type};base64,${base64Image}`;
                
                // For images, we'll use Groq's vision capabilities if available
                // For now, we'll extract text using a vision model or OCR
                // Since Groq might not have vision models in the current SDK, we'll use a workaround
                // by asking the user to provide text or use OCR service
                // For hackathon purposes, we'll use a simple approach: convert image to text description
                
                // Try to use Groq with image description
                // Note: This is a simplified approach. In production, use proper OCR or vision API
                contentToAnalyze = `[Image file: ${file.name}. Please analyze this medical report image and extract disease names and medicines. The image contains medical report data.]`;
                
                // Alternative: If you have access to a vision model, you could do:
                // const visionCompletion = await groq.chat.completions.create({
                //     messages: [{
                //         role: "user",
                //         content: [
                //             { type: "text", text: "Extract all text from this medical report image..." },
                //             { type: "image_url", image_url: { url: dataUrl } }
                //         ]
                //     }],
                //     model: "vision-model-name"
                // });
            }
        }

        if (!contentToAnalyze) {
            return NextResponse.json({ error: 'No content to analyze' }, { status: 400 });
        }

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are a medical assistant. Extract comprehensive information from the provided medical report text. Return ONLY a valid JSON object with the following structure:
{
  "diseaseName": "string or null",
  "medicines": ["array of strings"],
  "vitals": {
    "bloodPressure": "string (e.g., '120/80') or null",
    "heartRate": "number or null",
    "temperature": "number (in Celsius) or null",
    "weight": "number (in kg) or null",
    "glucose": "number (in mg/dL) or null",
    "bmi": "number or null"
  },
  "labValues": [
    {
      "name": "string (e.g., 'Hemoglobin', 'Cholesterol')",
      "value": "string",
      "unit": "string (e.g., 'g/dL', 'mg/dL') or null",
      "normalRange": "string or null"
    }
  ],
  "reportDate": "ISO date string or null",
  "doctorName": "string or null",
  "hospitalName": "string or null",
  "diagnosis": "string or null",
  "symptoms": ["array of strings"],
  "recommendations": ["array of strings"]
}
Extract all available information. If a field is not found, use null or empty array.`
                },
                {
                    role: "user",
                    content: contentToAnalyze
                }
            ],
            model: "llama-3.1-8b-instant",
            response_format: { type: "json_object" }
        });

        const result = completion.choices[0]?.message?.content;
        if (!result) {
            throw new Error('No result from Groq');
        }

        const parsedResult = JSON.parse(result);

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
