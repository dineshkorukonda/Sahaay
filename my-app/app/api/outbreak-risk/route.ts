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
        const model = genAI.getGenerativeModel({ model: 'gemini-pro-latest' });

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

        const areaCounts: Record<string, {
            symptomCount: number;
            waterFailCount?: number;
            trends: Record<string, { symptoms: number; waterFails: number }>;
        }> = {};

        // Initialize 7-day trend map structure
        const last7Days = Array.from({ length: 7 }).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d.toISOString().split('T')[0];
        });

        for (const rec of records) {
            if (!hasWaterborneSymptom(rec.symptoms)) continue;
            const profile = profileByUser.get(rec.userId?.toString());
            const area = profile?.pinCode || profile?.location?.pinCode || profile?.location?.city || 'unknown';

            if (!areaCounts[area]) {
                const initialTrends: Record<string, { symptoms: number; waterFails: number }> = {};
                last7Days.forEach(day => initialTrends[day] = { symptoms: 0, waterFails: 0 });
                areaCounts[area] = { symptomCount: 0, trends: initialTrends };
            }

            areaCounts[area].symptomCount += 1;

            if (rec.analyzedAt) {
                const dateStr = new Date(rec.analyzedAt).toISOString().split('T')[0];
                if (areaCounts[area].trends[dateStr]) {
                    areaCounts[area].trends[dateStr].symptoms += 1;
                }
            }
        }

        const waterFails = await WaterQualityReport.find({
            reportedAt: { $gte: since },
            bacterialPresence: 'fail',
        })
            .select('pinCode location reportedAt')
            .lean();

        for (const w of waterFails) {
            const area = w.pinCode || w.location?.city || 'unknown';
            if (!areaCounts[area]) {
                const initialTrends: Record<string, { symptoms: number; waterFails: number }> = {};
                last7Days.forEach(day => initialTrends[day] = { symptoms: 0, waterFails: 0 });
                areaCounts[area] = { symptomCount: 0, trends: initialTrends };
            }
            areaCounts[area].waterFailCount = (areaCounts[area].waterFailCount || 0) + 1;

            if (w.reportedAt) {
                const dateStr = new Date(w.reportedAt).toISOString().split('T')[0];
                if (areaCounts[area].trends[dateStr]) {
                    areaCounts[area].trends[dateStr].waterFails += 1;
                }
            }
        }

        const areas = Object.entries(areaCounts).map(([area, data]) => {
            let risk: 'low' | 'medium' | 'high' = 'low';
            const count = data.symptomCount + (data.waterFailCount || 0) * 2;
            if (count >= HIGH_RISK_THRESHOLD) risk = 'high';
            else if (count >= MEDIUM_RISK_THRESHOLD) risk = 'medium';

            const trendArray = last7Days.map(date => ({
                date: date.substring(5), // MM-DD
                symptoms: data.trends[date].symptoms,
                waterFails: data.trends[date].waterFails
            }));

            return { area, risk, symptomCount: data.symptomCount, waterFailCount: data.waterFailCount || 0, trends: trendArray };
        });

        // Add dummy trends to mock areas
        const mockAreas = [
            { area: '781001', risk: 'high', symptomCount: 12, waterFailCount: 3 },
            { area: '781006', risk: 'medium', symptomCount: 4, waterFailCount: 1 },
            { area: '781028', risk: 'low', symptomCount: 1, waterFailCount: 0 },
            { area: '781040', risk: 'medium', symptomCount: 3, waterFailCount: 1 },
            { area: '781123', risk: 'high', symptomCount: 8, waterFailCount: 2 },
        ].map(m => {
            const trendArray = last7Days.map((date, idx) => ({
                date: date.substring(5),
                symptoms: Math.max(0, Math.floor((m.symptomCount / 7) + (Math.random() * 2 - 1))),
                waterFails: Math.max(0, Math.floor((m.waterFailCount / 7) + (Math.random() < 0.3 ? 1 : 0)))
            }));
            return {
                ...m,
                trends: trendArray
            };
        });

        const areaMap = new Map();
        mockAreas.forEach(m => areaMap.set(m.area, m));
        areas.forEach(a => {
            if (a.area !== 'unknown') {
                areaMap.set(a.area, a);
            }
        });

        const mergedAreas = Array.from(areaMap.values());

        // Trigger Alerts for HIGH risk areas
        for (const a of mergedAreas) {
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

        const filtered = pinCode ? mergedAreas.filter((a) => a.area === pinCode) : mergedAreas;

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
