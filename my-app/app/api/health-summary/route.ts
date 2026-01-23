import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { MedicalRecord } from '@/lib/models';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'fallback_secret_key_change_in_prod'
);

export async function GET(req: Request) {
    try {
        // Verify User
        const token = (await cookies()).get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const userId = payload.userId as string;

        await connectDB();
        
        // Fetch all medical records for the user
        const records = await MedicalRecord.find({ userId })
            .sort({ analyzedAt: -1 })
            .limit(50);

        // Calculate stats
        const totalReports = records.length;
        const highRiskConditions = records.filter(r => 
            r.diseaseName && 
            (r.diseaseName.toLowerCase().includes('chronic') || 
             r.diseaseName.toLowerCase().includes('severe') ||
             r.diseaseName.toLowerCase().includes('stage 3') ||
             r.diseaseName.toLowerCase().includes('stage 4'))
        ).length;
        
        const allMedicines = new Set<string>();
        records.forEach(r => {
            if (r.medicines && Array.isArray(r.medicines)) {
                r.medicines.forEach(m => allMedicines.add(m));
            }
        });
        const activeMedications = allMedicines.size;

        const recentReports = records.slice(0, 5).map(r => ({
            id: r._id.toString(),
            name: r.diseaseName || 'Medical Report',
            fileName: r.fileName || 'Unknown',
            fileType: r.fileType || 'application/pdf',
            analyzedAt: r.analyzedAt,
            source: r.source
        }));

        // Extract clinical conditions from records
        const clinicalConditions = records
            .filter(r => r.diseaseName)
            .map(r => ({
                id: r._id.toString(),
                conditionName: r.diseaseName || 'Unknown Condition',
                icd10Code: 'N/A', // Would need to be extracted or mapped
                severity: r.diseaseName?.toLowerCase().includes('chronic') || 
                         r.diseaseName?.toLowerCase().includes('stage 3') ||
                         r.diseaseName?.toLowerCase().includes('stage 4') 
                    ? 'High Risk' 
                    : r.diseaseName?.toLowerCase().includes('moderate') || 
                      r.diseaseName?.toLowerCase().includes('stage 2')
                    ? 'Moderate'
                    : 'Controlled',
                sourceDocument: r.fileName || 'Unknown',
                confidence: 85 + Math.floor(Math.random() * 10) // Mock confidence
            }));

        return NextResponse.json({
            success: true,
            data: {
                stats: {
                    highRiskConditions,
                    activeMedications,
                    recentReports: totalReports,
                    aiConfidence: totalReports > 0 ? 94 : 0
                },
                clinicalConditions,
                recentReports,
                totalReports
            }
        });

    } catch (error: unknown) {
        console.error('Health Summary Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
