"use client";

import { useState, useEffect } from "react";
import { Trophy, Target, CheckCircle2, Heart } from "lucide-react";
import { Loader } from "@/components/ui/loader";

interface Badge {
    _id: string;
    badgeType: string;
    badgeName: string;
    description: string;
    icon?: string;
    earnedAt: string;
    metadata?: {
        problem?: string;
        milestone?: string;
        taskCount?: number;
        [key: string]: unknown;
    };
}

interface Milestone {
    title: string;
    description: string;
    progress: number;
    target: number;
    icon: string;
    category: string;
}

export default function AchievementsPage() {
    const [badges, setBadges] = useState<Badge[]>([]);
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAchievements();
    }, []);

    const fetchAchievements = async () => {
        try {
            const [badgesRes, milestonesRes] = await Promise.all([
                fetch('/api/achievements/badges'),
                fetch('/api/achievements/milestones')
            ]);

            const badgesJson = await badgesRes.json();
            const milestonesJson = await milestonesRes.json();

            if (badgesJson.success) {
                setBadges(badgesJson.data || []);
            }
            if (milestonesJson.success) {
                setMilestones(milestonesJson.data || []);
            }
        } catch (err) {
            console.error('Error fetching achievements:', err);
        } finally {
            setLoading(false);
        }
    };

    const getBadgeIcon = (badgeType: string, icon?: string) => {
        if (icon) return icon;
        switch (badgeType) {
            case 'milestone': return '🎯';
            case 'task_completion': return '✅';
            case 'health_goal': return '💪';
            case 'problem_management': return '🏥';
            default: return '🏆';
        }
    };

    const getBadgeColor = (badgeType: string) => {
        switch (badgeType) {
            case 'milestone': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
            case 'task_completion': return 'bg-green-100 text-green-700 border-green-300';
            case 'health_goal': return 'bg-blue-100 text-blue-700 border-blue-300';
            case 'problem_management': return 'bg-purple-100 text-purple-700 border-purple-300';
            default: return 'bg-gray-100 text-gray-700 border-gray-300';
        }
    };

    if (loading) {
        return <Loader fullScreen text="Loading achievements..." />;
    }

    return (
        <div className="p-8 min-h-screen space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="text-sm text-muted-foreground mb-1">Achievements & Milestones</div>
                    <h1 className="text-3xl font-bold tracking-tight">Your Achievements</h1>
                    <p className="text-muted-foreground mt-1">Track your health journey milestones and earned badges.</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-bold text-muted-foreground uppercase">Total Badges</p>
                        <Trophy className="h-5 w-5 text-yellow-500" />
                    </div>
                    <p className="text-4xl font-bold text-foreground">{badges.length}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-bold text-muted-foreground uppercase">Active Milestones</p>
                        <Target className="h-5 w-5 text-blue-500" />
                    </div>
                    <p className="text-4xl font-bold text-foreground">{milestones.length}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-bold text-muted-foreground uppercase">Completed Tasks</p>
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="text-4xl font-bold text-foreground">
                        {badges.filter(b => b.badgeType === 'task_completion').length}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-bold text-muted-foreground uppercase">Health Goals</p>
                        <Heart className="h-5 w-5 text-red-500" />
                    </div>
                    <p className="text-4xl font-bold text-foreground">
                        {badges.filter(b => b.badgeType === 'health_goal').length}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Badges Section */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold">Earned Badges</h2>
                    {badges.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                            {badges.map((badge) => (
                                <div
                                    key={badge._id}
                                    className={`bg-white rounded-2xl p-6 border-2 ${getBadgeColor(badge.badgeType)} shadow-sm hover:shadow-md transition-all`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="text-4xl flex-shrink-0">
                                            {getBadgeIcon(badge.badgeType, badge.icon)}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg mb-1">{badge.badgeName}</h3>
                                            <p className="text-sm text-muted-foreground mb-2">{badge.description}</p>
                                            {badge.metadata?.problem && (
                                                <p className="text-xs text-muted-foreground">
                                                    Condition: {badge.metadata.problem}
                                                </p>
                                            )}
                                            <p className="text-xs text-muted-foreground mt-2">
                                                Earned: {new Date(badge.earnedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl p-12 border border-border text-center">
                            <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                            <p className="text-muted-foreground font-medium">No badges earned yet</p>
                            <p className="text-sm text-muted-foreground mt-2">
                                Complete tasks and reach milestones to earn badges!
                            </p>
                        </div>
                    )}
                </div>

                {/* Milestones Section */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold">Active Milestones</h2>
                    {milestones.length > 0 ? (
                        <div className="space-y-4">
                            {milestones.map((milestone, index) => (
                                <div
                                    key={index}
                                    className="bg-white rounded-2xl p-6 border border-border shadow-sm"
                                >
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="text-3xl flex-shrink-0">{milestone.icon}</div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg mb-1">{milestone.title}</h3>
                                            <p className="text-sm text-muted-foreground">{milestone.description}</p>
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-muted-foreground">Progress</span>
                                            <span className="font-bold">
                                                {milestone.progress} / {milestone.target}
                                            </span>
                                        </div>
                                        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-emerald-500 rounded-full transition-all"
                                                style={{ width: `${(milestone.progress / milestone.target) * 100}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            {Math.round((milestone.progress / milestone.target) * 100)}% complete
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl p-12 border border-border text-center">
                            <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                            <p className="text-muted-foreground font-medium">No active milestones</p>
                            <p className="text-sm text-muted-foreground mt-2">
                                Milestones will appear as you progress in your health journey.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
