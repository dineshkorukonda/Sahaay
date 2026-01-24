import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import connectDB from '@/lib/db';
import { CarePlan, MedicalRecord } from '@/lib/models';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const groq = new Groq({ apiKey: process.env.GROQ_API });

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'fallback_secret_key_change_in_prod'
);

export async function POST(req: Request) {
    try {
        await connectDB();
        const token = (await cookies()).get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { payload } = await jwtVerify(token, JWT_SECRET);
        const userId = payload.userId as string;

        // Get latest medical records to understand the problem
        const records = await MedicalRecord.find({ userId })
            .sort({ analyzedAt: -1 })
            .limit(5);

        if (records.length === 0) {
            return NextResponse.json({ 
                error: 'No medical records found. Please upload medical reports first.' 
            }, { status: 400 });
        }

        // Get the most recent problem/diagnosis
        const latestRecord = records[0];
        const problem = latestRecord.diseaseName || latestRecord.diagnosis || 'General Health Management';
        const medications = latestRecord.medicines || [];

        // Prepare context for AI
        const context = {
            problem: problem,
            medications: medications,
            symptoms: latestRecord.symptoms || [],
            recommendations: latestRecord.recommendations || [],
            vitals: latestRecord.vitals || {}
        };

        // Get all records for comprehensive analysis
        const allRecords = await MedicalRecord.find({ userId })
            .sort({ analyzedAt: -1 })
            .limit(10);

        // Aggregate health data
        const allMedications = new Set<string>();
        const allProblems = new Set<string>();
        const allSymptoms: string[] = [];
        const allRecommendations: string[] = [];
        
        allRecords.forEach(r => {
            if (r.medicines) r.medicines.forEach(m => allMedications.add(m));
            if (r.diseaseName) allProblems.add(r.diseaseName);
            if (r.diagnosis) allProblems.add(r.diagnosis);
            if (r.symptoms) allSymptoms.push(...r.symptoms);
            if (r.recommendations) allRecommendations.push(...r.recommendations);
        });

        // Build medications array from actual medical records
        const actualMedications = Array.from(allMedications).map(medName => ({
            name: medName,
            dosage: "As prescribed", // Will be extracted from records if available
            frequency: "As prescribed",
            time: "08:00 AM" // Default, will be scheduled by LLM
        }));

        // Generate care plan using AI with comprehensive data
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are a medical care plan assistant. Based on the patient's health condition and medical history, generate a comprehensive care plan. 

IMPORTANT: Use the EXACT medications provided by the user. Do NOT generate new medications. Only schedule them and suggest appropriate times.

Return ONLY a valid JSON object with this structure:
{
  "title": "Care Plan Title",
  "description": "Brief description",
  "problem": "Health condition/problem",
  "medications": [
    {
      "name": "EXACT medication name from user's list",
      "dosage": "Dosage (extract from context or use 'As prescribed')",
      "frequency": "Frequency (e.g., 'Once daily', 'Twice daily', 'Three times daily')",
      "time": "Best time to take (e.g., '08:00 AM', '08:00 AM and 08:00 PM', 'After meals')"
    }
  ],
  "dietPlan": {
    "breakfast": "Detailed breakfast recommendations based on health condition",
    "lunch": "Detailed lunch recommendations based on health condition",
    "dinner": "Detailed dinner recommendations based on health condition",
    "snacks": "Healthy snack recommendations",
    "restrictions": ["List of food restrictions based on condition"],
    "recommendations": ["General dietary recommendations"]
  },
  "exercisePlan": {
    "activities": [
      {
        "name": "Activity name (e.g., 'Walking', 'Yoga', 'Swimming')",
        "duration": "Duration (e.g., '30 minutes')",
        "frequency": "Frequency (e.g., '3 times per week', 'Daily')",
        "intensity": "Intensity level (e.g., 'Low', 'Moderate', 'High')"
      }
    ],
    "recommendations": ["Exercise recommendations based on condition"]
  },
  "weeklySchedule": [
    {
      "day": "Monday",
      "appointments": [
        {
          "title": "Appointment title (e.g., 'Morning Walk', 'Doctor Consultation', 'Medication')",
          "type": "medication|exercise|doctor|checkup|other",
          "time": "Time (e.g., '08:00 AM', '02:00 PM')",
          "duration": "Duration (e.g., '30 minutes', '1 hour')",
          "description": "Brief description"
        }
      ]
    }
  ],
  "dailyTasks": [
    {
      "title": "Task title",
      "description": "Task description",
      "time": "Time (e.g., '08:00 AM')",
      "category": "Category (e.g., 'medication', 'vitals', 'exercise')"
    }
  ]
}
Generate a realistic weekly schedule with:
- Medication reminders at appropriate times
- Exercise sessions spread throughout the week
- Doctor appointments/checkups as needed
- Other health-related activities

Create a comprehensive 7-day schedule (Monday through Sunday) with appointments distributed appropriately.`
                },
                {
                    role: "user",
                    content: `Generate a comprehensive care plan for a patient with:
- Health Problems: ${Array.from(allProblems).join(', ') || context.problem}
- ACTUAL Medications (USE THESE EXACT NAMES - DO NOT CREATE NEW ONES): ${Array.from(allMedications).join(', ') || 'None'}
- Symptoms: ${allSymptoms.join(', ') || context.symptoms.join(', ') || 'None specified'}
- Medical Recommendations: ${allRecommendations.join(', ') || context.recommendations.join(', ') || 'None specified'}
- Latest Vitals: ${JSON.stringify(context.vitals)}
- Lab Values: ${JSON.stringify(latestRecord.labValues || [])}

CRITICAL INSTRUCTIONS:
1. For medications: Use ONLY the medications listed above. For each medication, suggest appropriate:
   - Dosage (if not clear, use "As prescribed")
   - Frequency (Once daily, Twice daily, etc.)
   - Best time to take (e.g., "08:00 AM", "08:00 AM and 08:00 PM", "After breakfast")

2. Create a DETAILED diet plan with specific meal recommendations:
   - Breakfast: Specific foods and portions
   - Lunch: Specific foods and portions
   - Dinner: Specific foods and portions
   - Snacks: Healthy snack options
   - Restrictions: Foods to avoid based on condition
   - Recommendations: General dietary guidelines

3. Create a DETAILED exercise plan with:
   - Specific activities (Walking, Yoga, Swimming, etc.)
   - Duration for each activity
   - Frequency (e.g., "3 times per week", "Daily")
   - Intensity level (Low, Moderate, High)
   - Recommendations: Exercise guidelines

4. Create a complete weekly schedule (Monday-Sunday) with:
   - Medication reminders using the ACTUAL medication names at scheduled times
   - Exercise sessions (3-5 times per week) from the exercise plan
   - Doctor appointments/checkups as needed
   - Other health activities

Make everything specific, realistic, and tailored to the health condition.`
                }
            ],
            model: "llama-3.1-8b-instant",
            response_format: { type: "json_object" }
        });

        const result = completion.choices[0]?.message?.content;
        if (!result) {
            throw new Error('No result from AI');
        }

        const carePlanData = JSON.parse(result);

        // Ensure we use actual medications from records, merge with LLM scheduling
        if (actualMedications.length > 0) {
            // Match LLM-scheduled medications with actual medications
            const scheduledMeds = carePlanData.medications || [];
            carePlanData.medications = actualMedications.map(actualMed => {
                // Find matching scheduled medication from LLM
                const scheduled = scheduledMeds.find((s: any) => 
                    s.name.toLowerCase() === actualMed.name.toLowerCase()
                );
                return {
                    name: actualMed.name,
                    dosage: scheduled?.dosage || actualMed.dosage,
                    frequency: scheduled?.frequency || actualMed.frequency,
                    time: scheduled?.time || actualMed.time,
                    status: 'pending'
                };
            });
        } else if (carePlanData.medications) {
            // If no actual medications, use LLM generated but mark as pending
            carePlanData.medications = carePlanData.medications.map((med: any) => ({
                ...med,
                status: 'pending'
            }));
        }

        if (carePlanData.dailyTasks) {
            carePlanData.dailyTasks = carePlanData.dailyTasks.map((task: any) => ({
                ...task,
                status: 'pending'
            }));
        }

        // Process weekly schedule - add dates and set default status
        if (carePlanData.weeklySchedule) {
            const today = new Date();
            const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
            const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            
            // Find Monday of current week
            const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
            const monday = new Date(today);
            monday.setDate(today.getDate() + mondayOffset);
            
            carePlanData.weeklySchedule = carePlanData.weeklySchedule.map((daySchedule: any, index: number) => {
                const dayDate = new Date(monday);
                dayDate.setDate(monday.getDate() + index);
                
                return {
                    ...daySchedule,
                    date: dayDate.toISOString().split('T')[0],
                    appointments: (daySchedule.appointments || []).map((apt: any) => ({
                        ...apt,
                        status: 'pending'
                    }))
                };
            });
        }

        // Save or update care plan
        const carePlan = await CarePlan.findOneAndUpdate(
            { userId },
            {
                userId,
                ...carePlanData
            },
            { new: true, upsert: true }
        );

        return NextResponse.json({
            success: true,
            data: carePlan
        });
    } catch (error: unknown) {
        console.error('Generate Care Plan Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
