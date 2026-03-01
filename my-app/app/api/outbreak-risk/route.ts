import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import connectDB from '@/lib/db';
import { MedicalRecord, Profile, WaterQualityReport, Alert } from '@/lib/models';

const WATERBORNE_SYMPTOM_KEYWORDS = ['diarrhea', 'diarrhoea', 'vomiting', 'fever', 'typhoid', 'cholera', 'jaundice', 'dysentery', 'stomach', 'dehydration'];
const DAYS_LOOKBACK = 14;
const HIGH_RISK_THRESHOLD = 5;
const MEDIUM_RISK_THRESHOLD = 2;

function hasWaterborneSymptom(symptoms: string[] | undefined): boolean {
    if (!symptoms || !Array.isArray(symptoms)) return false;
    const lower = symptoms.map(s => String(s).toLowerCase());
    return WATERBORNE_SYMPTOM_KEYWORDS.some(kw => lower.some(s => s.includes(kw)));
}



async function generateSummaryWithAI(areas: Array<{ area: string; risk: 'low' | 'medium' | 'high'; symptomCount: number; waterFailCount: number; }>): Promise<string | null> {
    const apiKey = process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
    if (!apiKey || areas.length === 0) return null;

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `You are a health surveillance analyst. Review the following recent waterborne disease risk data for various areas (based on symptom reports and water quality failures).
Data:
${JSON.stringify(areas, null, 2)}

Provide a concise 2-3 sentence AI summary of overall risk and recommended priority actions for health officials based exactly on this data. Do not use markdown.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return text.trim();
    } catch (e) {
        console.error('AI summary generation failed:', e);
        return null;
    }
}

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const pinCode = url.searchParams.get('pinCode');

        await connectDB();
        const since = new Date();
        since.setDate(since.getDate() - DAYS_LOOKBACK);

        const records = await MedicalRecord.find({ analyzedAt: { $gte: since } })
            .select('userId symptoms analyzedAt')
            .lean();
        const profiles = await Profile.find({}).select('userId location pinCode').lean();
        const profileByUser = new Map(profiles.map((p) => [p.userId.toString(), p]));

        const areaCounts: Record<string, { symptomCount: number; waterFailCount?: number }> = {};

        for (const rec of records) {
            if (!hasWaterborneSymptom(rec.symptoms)) continue;
            const profile = profileByUser.get(rec.userId?.toString());
            const area = profile?.pinCode || profile?.location?.pinCode || profile?.location?.city || 'unknown';
            if (!areaCounts[area]) areaCounts[area] = { symptomCount: 0 };
            areaCounts[area].symptomCount += 1;
        }

        const waterFails = await WaterQualityReport.find({
            reportedAt: { $gte: since },
            bacterialPresence: 'fail',
        })
            .select('pinCode location')
            .lean();

        for (const w of waterFails) {
            const area = w.pinCode || w.location?.city || 'unknown';
            if (!areaCounts[area]) areaCounts[area] = { symptomCount: 0 };
            areaCounts[area].waterFailCount = (areaCounts[area].waterFailCount || 0) + 1;
        }

        const areas = Object.entries(areaCounts).map(([area, data]) => {
            let risk: 'low' | 'medium' | 'high' = 'low';
            const count = data.symptomCount + (data.waterFailCount || 0) * 2;
            if (count >= HIGH_RISK_THRESHOLD) risk = 'high';
            else if (count >= MEDIUM_RISK_THRESHOLD) risk = 'medium';
            return { area, risk, symptomCount: data.symptomCount, waterFailCount: data.waterFailCount || 0 };
        });

        // Trigger Alerts for HIGH risk areas
        for (const a of areas) {
            if (a.risk === 'high' && a.area && a.area !== 'unknown') {
                // Check if an ACTIVE alert already exists for this PIN code
                const existingAlert = await Alert.findOne({
                    pincode: a.area,
                    status: 'ACTIVE'
                });

                if (!existingAlert) {
                    await Alert.create({
                        pincode: a.area,
                        riskLevel: 'HIGH',
                        message: `Automated Alert: High risk of waterborne disease outbreak detected in PIN ${a.area}. Medical records show a cluster of related symptoms, exacerbated by local water quality failures.`,
                        status: 'ACTIVE'
                    });
                }
            }
        }

        const filtered = pinCode ? areas.filter((a) => a.area === pinCode) : areas;

        const aiSummary = await generateSummaryWithAI(filtered);

        return NextResponse.json({
            success: true,
            since: since.toISOString(),
            areas: filtered,
            aiSummary: aiSummary || undefined,
        });
    } catch (error) {
        console.error('Outbreak risk error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
