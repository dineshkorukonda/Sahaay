"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Utensils, Activity, Check, Pill, Loader2, Clock } from "lucide-react";
import { Loader } from "@/components/ui/loader";
import { useToast } from "@/components/ui/toast";

interface Medication {
    name: string;
    dosage: string;
    frequency: string;
    time?: string;
    status: 'pending' | 'completed' | 'missed';
}

interface DailyTask {
    title: string;
    description?: string;
    time?: string;
    status: 'pending' | 'completed' | 'missed';
    category?: string;
}

interface Appointment {
    title: string;
    type: 'medication' | 'exercise' | 'doctor' | 'checkup' | 'other';
    time: string;
    duration?: string;
    description?: string;
    status?: 'pending' | 'completed' | 'missed';
}

interface WeeklySchedule {
    day: string;
    date?: string;
    appointments?: Appointment[];
}

interface CarePlanData {
    _id: string;
    title: string;
    description?: string;
    problem?: string;
    medications?: Medication[];
    dietPlan?: {
        breakfast?: Array<{ name: string; portion: string }> | string;
        lunch?: Array<{ name: string; portion: string }> | string;
        dinner?: Array<{ name: string; portion: string }> | string;
        snacks?: Array<{ name: string; portion: string }> | string;
        restrictions?: string[];
        recommendations?: string[];
    };
    exercisePlan?: {
        activities?: Array<{
            name: string;
            duration: string;
            frequency: string;
            intensity?: string;
        }>;
        recommendations?: string[];
    };
    dailyTasks?: DailyTask[];
    weeklySchedule?: WeeklySchedule[];
    checkups?: Array<{
        title: string;
        type: string;
        time?: string;
        status: 'pending' | 'completed' | 'missed';
    }>;
}

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function CarePlanPage() {
    const [carePlan, setCarePlan] = useState<CarePlanData | null>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const { showToast } = useToast();

    useEffect(() => {
        fetchCarePlan();
    }, []);

    const fetchCarePlan = async () => {
        try {
            const res = await fetch('/api/care-plan');
            const json = await res.json();
            if (json.success && json.data) {
                setCarePlan(json.data);
            }
        } catch (err) {
            console.error('Error fetching care plan:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateSummary = async () => {
        setGenerating(true);
        try {
            const res = await fetch('/api/care-plan/generate', {
                method: 'POST'
            });
            const json = await res.json();
            if (json.success) {
                showToast('Care plan summary generated successfully', 'success');
                await fetchCarePlan();
            } else {
                showToast(json.error || 'Failed to generate summary', 'error');
            }
        } catch (err) {
            console.error('Error generating summary:', err);
            showToast('Failed to generate summary', 'error');
        } finally {
            setGenerating(false);
        }
    };

    const toggleTaskStatus = async (taskIndex: number) => {
        if (!carePlan || !carePlan.dailyTasks) return;

        const tasks = [...carePlan.dailyTasks];
        const task = tasks[taskIndex];
        const newStatus = task.status === 'completed' ? 'pending' : 'completed';
        tasks[taskIndex] = { ...task, status: newStatus };

        try {
            const res = await fetch('/api/care-plan', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    dailyTasks: tasks
                })
            });
            if (res.ok) {
                setCarePlan({ ...carePlan, dailyTasks: tasks });
                // Award points for task completion
                await fetch('/api/health-stats/update', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ points: 10 })
                });
            }
        } catch (err) {
            console.error('Error updating task:', err);
        }
    };

    const markMedicationTaken = async (medIndex: number) => {
        if (!carePlan || !carePlan.medications) return;

        const meds = [...carePlan.medications];
        meds[medIndex] = { ...meds[medIndex], status: 'completed' };

        try {
            const res = await fetch('/api/care-plan', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    medications: meds
                })
            });
            if (res.ok) {
                setCarePlan({ ...carePlan, medications: meds });
                // Award points for medication adherence
                await fetch('/api/health-stats/update', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ points: 15 })
                });
                showToast('Medication logged! +15 points', 'success');
            }
        } catch (err) {
            console.error('Error updating medication:', err);
        }
    };

    const getWeekDates = () => {
        const monday = new Date(currentWeek);
        const day = monday.getDay();
        const diff = monday.getDate() - day + (day === 0 ? -6 : 1);
        monday.setDate(diff);

        const days = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(monday);
            date.setDate(monday.getDate() + i);
            days.push(date);
        }
        return days;
    };

    const getAppointmentsForDay = (dayName: string) => {
        if (!carePlan?.weeklySchedule) return [];
        const daySchedule = carePlan.weeklySchedule.find(s => s.day === dayName);
        return daySchedule?.appointments || [];
    };

    const getAppointmentColor = (type: string) => {
        switch (type) {
            case 'medication': return 'bg-emerald-100 border-emerald-500 text-emerald-800';
            case 'exercise': return 'bg-blue-100 border-blue-500 text-blue-800';
            case 'doctor': return 'bg-orange-100 border-orange-500 text-orange-800';
            case 'checkup': return 'bg-purple-100 border-purple-500 text-purple-800';
            default: return 'bg-gray-100 border-gray-500 text-gray-800';
        }
    };

    const getTodayMedications = () => {
        if (!carePlan?.medications) return [];
        return carePlan.medications.filter(m => m.status === 'pending');
    };

    const renderDietItem = (label: string, item: Array<{ name: string; portion: string }> | string) => {
        return (
            <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                <h4 className="font-bold text-sm text-orange-700 mb-2 uppercase">{label}</h4>
                {Array.isArray(item) ? (
                    <ul className="space-y-2">
                        {item.map((food, i) => (
                            <li key={i} className="flex justify-between items-center text-sm">
                                <span className="font-medium text-foreground">{food.name}</span>
                                <span className="text-muted-foreground bg-white px-2 py-0.5 rounded border border-orange-100 text-xs">
                                    {food.portion}
                                </span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-foreground leading-relaxed">{item}</p>
                )}
            </div>
        );
    };

    const handleDownloadReport = async () => {
        try {
            showToast('Generating report...', 'success');
            const res = await fetch('/api/reports/download');
            if (!res.ok) throw new Error('Failed to generate');

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `sahaay-medical-report-${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            showToast('Report downloaded successfully', 'success');
        } catch (err) {
            console.error('Download error:', err);
            showToast('Failed to download report', 'error');
        }
    };

    if (loading) {
        return <Loader fullScreen text="Loading care plan..." />;
    }

    const dietPlan = carePlan?.dietPlan;
    const exercisePlan = carePlan?.exercisePlan;
    const dailyTasks = carePlan?.dailyTasks || [];
    const weekDates = getWeekDates();
    const todayMedications = getTodayMedications();

    return (
        <div className="p-8 min-h-screen space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="text-sm text-muted-foreground mb-1">Care Plan & Monitoring</div>
                    <h1 className="text-3xl font-bold tracking-tight">Care Plan & Monitoring</h1>
                    <p className="text-muted-foreground mt-1">
                        {carePlan?.problem ? `Managing: ${carePlan.problem}` : 'Management of patient health trajectories and real-time medical intelligence.'}
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleDownloadReport}
                        className="bg-white border border-gray-200 text-foreground px-4 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><path d="M12 18v-6" /><path d="m9 15 3 3 3-3" /></svg>
                        Download Report
                    </button>
                    <button
                        onClick={handleGenerateSummary}
                        disabled={generating}
                        className="bg-emerald-500 text-white px-4 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {generating ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            'Generate Summary'
                        )}
                    </button>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 items-start">
                {/* Left Column (Wide) - Main Content */}
                <div className="xl:col-span-3 space-y-8">
                    {/* Weekly Schedule Calendar */}
                    <div className="bg-white rounded-3xl p-6 border border-border shadow-sm">
                        <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
                            <h3 className="font-bold text-xl">Weekly Schedule</h3>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => {
                                            const newWeek = new Date(currentWeek);
                                            newWeek.setDate(newWeek.getDate() - 7);
                                            setCurrentWeek(newWeek);
                                        }}
                                        className="p-2 hover:bg-gray-100 rounded-lg"
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </button>
                                    <span className="font-bold">
                                        {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </span>
                                    <button
                                        onClick={() => {
                                            const newWeek = new Date(currentWeek);
                                            newWeek.setDate(newWeek.getDate() + 7);
                                            setCurrentWeek(newWeek);
                                        }}
                                        className="p-2 hover:bg-gray-100 rounded-lg"
                                    >
                                        <ChevronRight className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 gap-px bg-gray-100 border border-gray-100 rounded-2xl overflow-hidden text-center">
                            {/* Days Header */}
                            {weekDates.map((date, i) => {
                                const dayName = daysOfWeek[i];
                                const dayAbbr = dayName.substring(0, 3).toUpperCase();
                                return (
                                    <div key={i} className="bg-white py-3 text-xs font-bold text-emerald-700 uppercase">
                                        {dayAbbr} {date.getDate()}
                                    </div>
                                );
                            })}

                            {/* Calendar Columns */}
                            {daysOfWeek.map((dayName, colIndex) => {
                                const appointments = getAppointmentsForDay(dayName);
                                return (
                                    <div key={colIndex} className="bg-white h-64 p-2 relative group hover:bg-gray-50/50 transition-colors">
                                        {appointments.map((apt, aptIndex) => (
                                            <div
                                                key={aptIndex}
                                                className={`${getAppointmentColor(apt.type)} border-l-4 rounded p-2 text-left mb-2 cursor-pointer hover:scale-105 transition-transform`}
                                            >
                                                <p className="text-[10px] font-bold">{apt.time}</p>
                                                <p className="text-[10px] font-medium leading-tight">{apt.title}</p>
                                                {apt.duration && (
                                                    <p className="text-[9px] opacity-75 mt-0.5">{apt.duration}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Medication Reminders */}
                    {todayMedications.length > 0 && (
                        <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-3xl p-6 border border-emerald-200 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-10 w-10 bg-emerald-500 rounded-lg flex items-center justify-center text-white">
                                    <Pill className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-xl">Today&apos;s Medication Reminders</h3>
                                    <p className="text-sm text-muted-foreground">Take your medications to boost your health score!</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {todayMedications.map((med, index) => (
                                    <div key={index} className="bg-white rounded-xl p-4 border border-emerald-200 flex items-center justify-between">
                                        <div className="flex-1">
                                            <h4 className="font-bold text-lg">{med.name}</h4>
                                            <p className="text-sm text-muted-foreground">
                                                {med.dosage} • {med.frequency}
                                                {med.time && ` • ${med.time}`}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => markMedicationTaken(index)}
                                            className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-emerald-600 transition-colors flex items-center gap-2"
                                        >
                                            <Check className="h-4 w-4" />
                                            Taken
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Diet Plan Section - Collapsible */}
                    <div className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden">
                        <details className="group" open>
                            <summary className="flex items-center justify-between p-6 cursor-pointer bg-white hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center">
                                        <Utensils className="h-5 w-5" />
                                    </div>
                                    <h3 className="font-bold text-xl">Diet Plan</h3>
                                </div>
                                <div className="transform transition-transform group-open:rotate-180">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                </div>
                            </summary>
                            <div className="p-6 pt-0 border-t border-gray-100">
                                {dietPlan ? (
                                    <div className="space-y-6 mt-6">
                                        {dietPlan.breakfast && renderDietItem('Breakfast', dietPlan.breakfast)}
                                        {dietPlan.lunch && renderDietItem('Lunch', dietPlan.lunch)}
                                        {dietPlan.dinner && renderDietItem('Dinner', dietPlan.dinner)}
                                        {dietPlan.snacks && renderDietItem('Snacks', dietPlan.snacks)}

                                        {dietPlan.restrictions && dietPlan.restrictions.length > 0 && (
                                            <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                                                <h4 className="font-bold text-sm text-red-700 mb-2 uppercase">Food Restrictions</h4>
                                                <ul className="list-disc list-inside space-y-1">
                                                    {dietPlan.restrictions.map((r, i) => (
                                                        <li key={i} className="text-foreground">{r}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {dietPlan.recommendations && dietPlan.recommendations.length > 0 && (
                                            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                                                <h4 className="font-bold text-sm text-emerald-700 mb-2 uppercase">Dietary Recommendations</h4>
                                                <ul className="list-disc list-inside space-y-1">
                                                    {dietPlan.recommendations.map((r, i) => (
                                                        <li key={i} className="text-foreground">{r}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Utensils className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                                        <p className="text-muted-foreground font-medium">No diet plan available</p>
                                        <p className="text-sm text-muted-foreground mt-2">Click &quot;Generate Summary&quot; to create a personalized diet plan</p>
                                    </div>
                                )}
                            </div>
                        </details>
                    </div>

                    {/* Exercise Plan Section - Collapsible */}
                    <div className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden">
                        <details className="group" open>
                            <summary className="flex items-center justify-between p-6 cursor-pointer bg-white hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                                        <Activity className="h-5 w-5" />
                                    </div>
                                    <h3 className="font-bold text-xl">Exercise & Workout Plan</h3>
                                </div>
                                <div className="transform transition-transform group-open:rotate-180">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                </div>
                            </summary>
                            <div className="p-6 pt-0 border-t border-gray-100">
                                {exercisePlan && exercisePlan.activities && exercisePlan.activities.length > 0 ? (
                                    <div className="space-y-4 mt-6">
                                        {exercisePlan.activities.map((activity, index) => (
                                            <div key={index} className="p-4 rounded-xl border-2 border-blue-200 bg-blue-50">
                                                <div className="flex items-start justify-between mb-2">
                                                    <h4 className="font-bold text-lg text-blue-900">{activity.name}</h4>
                                                    {activity.intensity && (
                                                        <span className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-xs font-bold uppercase">
                                                            {activity.intensity}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex gap-4 text-sm text-blue-700 font-medium">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-4 w-4" />
                                                        {activity.duration}
                                                    </span>
                                                    <span>•</span>
                                                    <span>{activity.frequency}</span>
                                                </div>
                                            </div>
                                        ))}
                                        {exercisePlan.recommendations && exercisePlan.recommendations.length > 0 && (
                                            <div className="mt-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                                                <h4 className="font-bold text-sm text-emerald-700 mb-2 uppercase">Exercise Recommendations</h4>
                                                <ul className="list-disc list-inside space-y-1">
                                                    {exercisePlan.recommendations.map((r, i) => (
                                                        <li key={i} className="text-foreground">{r}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                                        <p className="text-muted-foreground font-medium">No exercise plan available</p>
                                        <p className="text-sm text-muted-foreground mt-2">Click &quot;Generate Summary&quot; to create a personalized workout plan</p>
                                    </div>
                                )}
                            </div>
                        </details>
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-8">
                    {/* Daily Tasks */}
                    <div className="bg-white rounded-3xl p-6 border border-border shadow-sm">
                        <h3 className="font-bold text-lg mb-4">Daily Tasks</h3>
                        {dailyTasks.length > 0 ? (
                            <div className="space-y-3">
                                {dailyTasks.map((task, index) => (
                                    <label
                                        key={index}
                                        onClick={() => toggleTaskStatus(index)}
                                        className="flex items-center gap-3 p-3 rounded-xl border border-transparent hover:bg-gray-50 transition-colors cursor-pointer group"
                                    >
                                        <div className={`h-5 w-5 rounded flex items-center justify-center flex-shrink-0 ${task.status === 'completed'
                                            ? 'bg-emerald-500 text-white'
                                            : 'border-2 border-gray-300 group-hover:border-emerald-500'
                                            }`}>
                                            {task.status === 'completed' && <Check className="h-3 w-3" />}
                                        </div>
                                        <div className="flex flex-col flex-1">
                                            <span className={`text-sm font-bold ${task.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'
                                                }`}>
                                                {task.title}
                                            </span>
                                            {task.description && (
                                                <span className="text-[10px] text-muted-foreground">{task.description}</span>
                                            )}
                                            {task.time && (
                                                <span className="text-[10px] text-muted-foreground">Due by {task.time}</span>
                                            )}
                                        </div>
                                    </label>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-center py-4 text-sm">No daily tasks</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
