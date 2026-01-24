import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import connectDB from '@/lib/db';
import { CarePlan, MedicalRecord } from '@/lib/models';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

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

    // Initialize Gemini Model
    const model = genAI.getGenerativeModel({
      model: "gemini-pro-latest",
      generationConfig: { responseMimeType: "application/json" }
    });

    // Generate care plan using AI with comprehensive data
    const prompt = `
    You are an expert medical care plan assistant. Based on the patient's health condition and medical history, generate a comprehensive, actionable care plan.

    PATIENT DATA:
    - Health Problems: ${Array.from(allProblems).join(', ') || context.problem}
    - CURRENT MEDICATIONS: ${Array.from(allMedications).join(', ') || 'None'}
    - Symptoms: ${allSymptoms.join(', ') || context.symptoms.join(', ') || 'None specified'}
    - Medical Recommendations: ${allRecommendations.join(', ') || context.recommendations.join(', ') || 'None specified'}
    - Latest Vitals: ${JSON.stringify(context.vitals)}
    - Lab Values: ${JSON.stringify(latestRecord.labValues || [])}

    CRITICAL INSTRUCTIONS:
    1. MEDICATIONS: Schedule the EXACT medications listed above. Do NOT invent new ones. 
       - Suggest realistic timings (e.g., "08:00 AM", "After dinner").
       - If multiple medicines exist, space them out appropriately.

    2. DIET PLAN: Create a specific, condition-appropriate diet.
       - Provide structured meals (Breakfast, Lunch, Dinner, Snacks).
       - Each meal MUST be a list of items with portions (e.g., Name: "Oatmeal", Portion: "1 cup").
       - List specific foods to AVOID (Restrictions).

    3. EXERCISE PLAN: Suggest safe, effective exercises.
       - Include type, duration, and frequency.
       - Tailor intensity to the patient's condition (e.g., Low impact for arthritis).
       
    4. VITALS MONITORING:
       - For Blood Glucose: Schedule checks WEEKLY (e.g., "Every Monday morning fasting"), NOT daily unless critical.
       - For BP/Others: Schedule as appropriate (e.g., "Twice a week").

    5. SCHEDULE: Create a balanced 7-day weekly schedule integrating meds, meals, and exercises.

    OUTPUT FORMAT (JSON ONLY):
    {
      "title": "Care Plan Title",
      "description": "Brief health summary",
      "problem": "Primary condition(s)",
      "medications": [
        {
          "name": "Medication Name",
          "dosage": "Dosage",
          "frequency": "Frequency",
          "time": "Single preferred time string (e.g. '08:00 AM')"
        }
      ],
      "dietPlan": {
        "breakfast": [{ "name": "Food Item", "portion": "Quantity" }],
        "lunch": [{ "name": "Food Item", "portion": "Quantity" }],
        "dinner": [{ "name": "Food Item", "portion": "Quantity" }],
        "snacks": [{ "name": "Food Item", "portion": "Quantity" }],
        "restrictions": ["Food to avoid"],
        "recommendations": ["Dietary tip"]
      },
      "exercisePlan": {
        "activities": [
            {
                "name": "Activity Name",
                "duration": "Duration",
                "frequency": "Frequency",
                "intensity": "Intensity"
            }
        ],
        "recommendations": ["Safety tip"]
      },
      "weeklySchedule": [
        {
          "day": "Monday",
          "appointments": [
            {
              "title": "Event Title",
              "type": "medication|exercise|doctor|other",
              "time": "Time string",
              "duration": "Duration string",
              "description": "Details"
            }
          ]
        }
      ],
      "dailyTasks": [
        {
          "title": "Task Name",
          "description": "Task Details",
          "time": "Time",
          "category": "medication|vitals|exercise"
        }
      ]
    }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const carePlanData = JSON.parse(responseText);

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

    // Sanitize 'problem' field: If AI returns an array, join it into a string
    if (Array.isArray(carePlanData.problem)) {
      carePlanData.problem = carePlanData.problem.join(', ');
    }

    // Sanitize 'time' fields to prevent arrays (CastError)
    if (carePlanData.medications) {
      carePlanData.medications.forEach((med: any) => {
        if (Array.isArray(med.time)) med.time = med.time.join(', ');
      });
    }

    if (carePlanData.dailyTasks) {
      carePlanData.dailyTasks.forEach((task: any) => {
        if (Array.isArray(task.time)) task.time = task.time.join(', ');
      });
    }

    if (carePlanData.weeklySchedule) {
      carePlanData.weeklySchedule.forEach((day: any) => {
        if (day.appointments) {
          day.appointments.forEach((apt: any) => {
            if (Array.isArray(apt.time)) apt.time = apt.time.join(', ');
          });
        }
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
