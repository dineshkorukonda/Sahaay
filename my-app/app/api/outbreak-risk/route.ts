import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import connectDB from '@/lib/db';
import { MedicalRecord, Profile, WaterQualityReport } from '@/lib/models';

const WATERBORNE_SYMPTOM_KEYWORDS = ['diarrhea', 'diarrhoea', 'vomiting', 'fever', 'typhoid', 'cholera', 'jaundice', 'dysentery', 'stomach', 'dehydration'];
const DAYS_LOOKBACK = 14;
const HIGH_RISK_THRESHOLD = 5;
const MEDIUM_RISK_THRESHOLD = 2;

function hasWaterborneSymptom(symptoms: string[] | undefined): boolean {
    if (!symptoms || !Array.isArray(symptoms)) return false;
    const lower = symptoms.map(s => String(s).toLowerCase());
    return WATERBORNE_SYMPTOM_KEYWORDS.some(kw => lower.some(s => s.includes(kw)));
}

/** Static fallback when AI is unavailable */
const FALLBACK_DEMO_AREAS = [
    { area: 'Block A, Kamrup (781001)', risk: 'high' as const, symptomCount: 12, waterFailCount: 3, reason: 'Multiple hand-pump failures and rising diarrhea cases' },
    { area: 'Boko PHC Zone (781123)', risk: 'high' as const, symptomCount: 8, waterFailCount: 2, reason: 'Contaminated well reports and fever cluster' },
    { area: 'Dispur Ward 5 (781006)', risk: 'medium' as const, symptomCount: 4, waterFailCount: 1, reason: 'Seasonal spike in gastric complaints' },
    { area: 'Guwahati Rural (781040)', risk: 'medium' as const, symptomCount: 3, waterFailCount: 0, reason: 'Elevated symptom reports, water quality pending' },
    { area: 'Sonapur (782402)', risk: 'low' as const, symptomCount: 1, waterFailCount: 0, reason: 'Within normal range' },
    { area: 'Beltola (781028)', risk: 'low' as const, symptomCount: 0, waterFailCount: 0, reason: 'No significant activity' },
];

async function generateDemoDataWithAI(): Promise<{ areas: typeof FALLBACK_DEMO_AREAS; aiSummary: string } | null> {
    const apiKey = process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
    if (!apiKey) return null;

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `You are a health surveillance analyst. Generate realistic DEMO/FAKE data for a water-borne disease outbreak early-warning dashboard in Northeast India (Assam area). 
Return ONLY valid JSON, no markdown or explanation, in this exact shape:
{
  "areas": [
    { "area": "Place name with PIN or zone", "risk": "high" or "medium" or "low", "symptomCount": number, "waterFailCount": number, "reason": "one line why" }
  ],
  "aiSummary": "2-3 sentence AI-generated summary of overall risk and recommended priority actions for health officials."
}
Generate 5-6 areas with a mix of high (1-2), medium (1-2), and low (2-3) risk. Use plausible Assamese/NER location names and PIN codes. Keep reasons short.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const cleaned = text.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(cleaned) as { areas: Array<{ area: string; risk: 'low' | 'medium' | 'high'; symptomCount: number; waterFailCount: number; reason?: string }>; aiSummary: string };

        const areas = (parsed.areas || []).slice(0, 8).map((a) => ({
            area: a.area || 'Unknown',
            risk: ['low', 'medium', 'high'].includes(a.risk) ? a.risk : 'low',
            symptomCount: typeof a.symptomCount === 'number' ? a.symptomCount : 0,
            waterFailCount: typeof a.waterFailCount === 'number' ? a.waterFailCount : 0,
            reason: typeof a.reason === 'string' ? a.reason : '',
        }));
        const aiSummary = typeof parsed.aiSummary === 'string' ? parsed.aiSummary : '';

        return { areas, aiSummary };
    } catch (e) {
        console.error('AI demo generation failed:', e);
        return null;
    }
}

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const pinCode = url.searchParams.get('pinCode');
        const demo = url.searchParams.get('demo') === '1' || url.searchParams.get('demo') === 'true';

        if (demo) {
            const since = new Date();
            since.setDate(since.getDate() - DAYS_LOOKBACK);

            const aiResult = await generateDemoDataWithAI();
            const areas = aiResult?.areas ?? FALLBACK_DEMO_AREAS;
            const aiSummary = aiResult?.aiSummary ?? 'Demo data: AI-generated risk view for presentation. Prioritize high-risk blocks for water testing and awareness campaigns.';

            const filtered = pinCode ? areas.filter((a) => a.area.includes(pinCode)) : areas;

            return NextResponse.json({
                success: true,
                since: since.toISOString(),
                areas: filtered,
                demo: true,
                aiSummary,
            });
        }

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

        const filtered = pinCode ? areas.filter((a) => a.area === pinCode) : areas;

        return NextResponse.json({
            success: true,
            since: since.toISOString(),
            areas: filtered,
        });
    } catch (error) {
        console.error('Outbreak risk error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
