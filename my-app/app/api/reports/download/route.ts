import { NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import connectDB from '@/lib/db';
import { Profile, CarePlan, User } from '@/lib/models';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'fallback_secret_key_change_in_prod'
);

export async function GET(req: Request) {
    try {
        await connectDB();
        const token = (await cookies()).get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { payload } = await jwtVerify(token, JWT_SECRET);
        const userId = payload.userId as string;

        // Fetch Data
        const user = await User.findById(userId);
        const profile = await Profile.findOne({ userId });
        const carePlan = await CarePlan.findOne({ userId }); // Ensure you get the latest plan

        if (!carePlan) {
            return NextResponse.json({ error: 'No Care Plan found' }, { status: 404 });
        }

        // Create PDF
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        // --- Header ---
        doc.setFillColor(37, 99, 235); // Primary Blue
        doc.rect(0, 0, pageWidth, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('Sahaay Medical Report', 14, 25);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth - 14, 25, { align: 'right' });

        // --- Patient Details ---
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.text('Patient Information', 14, 50);
        doc.setLineWidth(0.5);
        doc.line(14, 52, 60, 52); // Underline

        const patientInfo = [
            ['Name', user?.name || 'N/A'],
            ['Date of Birth', profile?.dob ? new Date(profile.dob).toLocaleDateString() : 'N/A'],
            ['Gender', profile?.gender || 'N/A'],
            ['Blood Group', profile?.bloodGroup || 'N/A'],
        ];

        autoTable(doc, {
            startY: 55,
            head: [],
            body: patientInfo,
            theme: 'plain',
            styles: { fontSize: 10, cellPadding: 2 },
            columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40 } },
            margin: { left: 14 }
        });

        let finalY = (doc as any).lastAutoTable.finalY + 15;

        // --- Medical Summary ---
        if (carePlan.problem) {
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Medical Condition Summary', 14, finalY);
            doc.line(14, finalY + 2, 75, finalY + 2);

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            const splitText = doc.splitTextToSize(carePlan.description || 'No description available', pageWidth - 28);
            doc.text(splitText, 14, finalY + 8);
            finalY += 10 + (splitText.length * 5);
        }

        // --- Medications Table ---
        if (carePlan.medications && carePlan.medications.length > 0) {
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Prescribed Medications', 14, finalY);
            doc.line(14, finalY + 2, 65, finalY + 2);

            const medRows = carePlan.medications.map((med: any) => [
                med.name,
                med.dosage,
                med.frequency,
                med.time
            ]);

            autoTable(doc, {
                startY: finalY + 5,
                head: [['Medication', 'Dosage', 'Frequency', 'Timing']],
                body: medRows,
                theme: 'striped',
                headStyles: { fillColor: [37, 99, 235] },
                styles: { fontSize: 10 }
            });

            finalY = (doc as any).lastAutoTable.finalY + 15;
        }

        // --- Lifestyle & Diet ---
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Lifestyle Recommendations', 14, finalY);
        doc.line(14, finalY + 2, 75, finalY + 2);

        // Diet Summary
        doc.setFontSize(11);
        doc.text('Diet Plan Overview:', 14, finalY + 10);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const dietText = doc.splitTextToSize(
            carePlan.dietPlan?.recommendations?.join(', ') || 'Follow a balanced diet as prescribed.',
            pageWidth - 28
        );
        doc.text(dietText, 14, finalY + 16);

        // Exercises Summary
        const exerciseY = finalY + 20 + (dietText.length * 5);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text('Exercise Routine:', 14, exerciseY);

        let exTextStr = '';
        if (carePlan.exercisePlan?.activities) {
            exTextStr = carePlan.exercisePlan.activities.map((a: any) => `- ${a.name} (${a.duration})`).join('\n');
        }

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const exText = doc.splitTextToSize(exTextStr || 'Regular light exercise recommended.', pageWidth - 28);
        doc.text(exText, 14, exerciseY + 6);

        // --- Doctor Notes ---
        const noteY = exerciseY + 20 + (exText.length * 6);

        // Check if we need a new page
        if (noteY > 250) {
            doc.addPage();
            finalY = 20;
        } else {
            finalY = noteY;
        }

        doc.setDrawColor(150);
        doc.setLineWidth(0.5);
        doc.rect(14, finalY, pageWidth - 28, 40);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("Doctor's Notes:", 16, finalY + 6);

        // Output PDF Buffer
        const pdfBuffer = doc.output('arraybuffer');

        return new NextResponse(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="sahaay-medical-report-${new Date().toISOString().split('T')[0]}.pdf"`
            }
        });

    } catch (error) {
        console.error('Report Generation Error:', error);
        return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
    }
}
