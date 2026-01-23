"use client";

import { MessageSquare, Heart, Share2, Calendar, Users, Filter, Search, PlusCircle } from "lucide-react";

export default function CommunityPage() {
    return (
        <div className="p-8 min-h-screen space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="text-sm text-muted-foreground mb-1">Community</div>
                    <h1 className="text-3xl font-bold tracking-tight">Health Support Groups</h1>
                    <p className="text-muted-foreground mt-1">Connect with others, share experiences, and find support.</p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-white border border-border text-foreground px-4 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors shadow-sm">
                        <Search className="h-4 w-4" /> Find Group
                    </button>
                    <button className="bg-emerald-500 text-white px-4 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-colors">
                        <PlusCircle className="h-4 w-4" /> Create Post
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Feed */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Feed Tabs */}
                    <div className="flex gap-6 border-b border-border pb-4">
                        <button className="font-bold text-foreground border-b-2 border-emerald-500 pb-4 -mb-4.5 px-2">Trending</button>
                        <button className="font-medium text-muted-foreground hover:text-foreground px-2">Newest</button>
                        <button className="font-medium text-muted-foreground hover:text-foreground px-2">Following</button>
                    </div>

                    {/* Post 1 */}
                    <div className="bg-white rounded-3xl p-6 border border-border shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100&h=100" alt="Avatar" className="h-10 w-10 rounded-full object-cover" />
                            <div>
                                <h3 className="font-bold text-sm">Martha Stewart</h3>
                                <p className="text-xs text-muted-foreground">Diabetes Support Group • 2h ago</p>
                            </div>
                        </div>
                        <h4 className="font-bold text-lg mb-2">Tips for managing blood sugar during holidays?</h4>
                        <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                            With the holiday season coming up, I'm a bit worried about managing my diet. Does anyone have any good recipes or tips for staying on track without feeling left out?
                        </p>
                        <div className="flex items-center gap-6 pt-4 border-t border-border">
                            <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-red-500 transition-colors font-medium">
                                <Heart className="h-4 w-4" /> 24 Likes
                            </button>
                            <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-blue-500 transition-colors font-medium">
                                <MessageSquare className="h-4 w-4" /> 8 Comments
                            </button>
                            <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium ml-auto">
                                <Share2 className="h-4 w-4" /> Share
                            </button>
                        </div>
                    </div>

                    {/* Post 2 */}
                    <div className="bg-white rounded-3xl p-6 border border-border shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=100&h=100" alt="Avatar" className="h-10 w-10 rounded-full object-cover" />
                            <div>
                                <h3 className="font-bold text-sm">David Chen</h3>
                                <p className="text-xs text-muted-foreground">Cardiac Rehab • 5h ago</p>
                            </div>
                        </div>
                        <h4 className="font-bold text-lg mb-2">First 5k after surgery!</h4>
                        <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                            Unbelievable feeling. 6 months ago I could barely walk down the block. Stick with your rehab exercises everyone, it pays off!
                        </p>
                        {/* Image Attachment Mock */}
                        <div className="h-48 w-full bg-gray-100 rounded-xl mb-4 relative overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1552674605-469555942da2?auto=format&fit=crop&q=80&w=800&h=400" alt="Run" className="h-full w-full object-cover" />
                        </div>
                        <div className="flex items-center gap-6 pt-4 border-t border-border">
                            <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-red-500 transition-colors font-medium text-red-500">
                                <Heart className="h-4 w-4 fill-current" /> 156 Likes
                            </button>
                            <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-blue-500 transition-colors font-medium">
                                <MessageSquare className="h-4 w-4" /> 42 Comments
                            </button>
                            <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium ml-auto">
                                <Share2 className="h-4 w-4" /> Share
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Upcoming Events */}
                    <div className="bg-white rounded-3xl p-6 border border-border shadow-sm">
                        <h3 className="font-bold text-lg mb-4">Upcoming Events</h3>
                        <div className="space-y-4">
                            <div className="flex gap-3 items-start p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer">
                                <div className="bg-emerald-100 text-emerald-700 h-10 w-10 rounded-lg flex flex-col items-center justify-center flex-shrink-0 text-xs font-bold leading-tight">
                                    <span>OCT</span>
                                    <span className="text-sm">25</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm">Nutrition Workshop</h4>
                                    <p className="text-xs text-muted-foreground">3:00 PM • Community Hall</p>
                                </div>
                            </div>
                            <div className="flex gap-3 items-start p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer">
                                <div className="bg-blue-100 text-blue-700 h-10 w-10 rounded-lg flex flex-col items-center justify-center flex-shrink-0 text-xs font-bold leading-tight">
                                    <span>OCT</span>
                                    <span className="text-sm">28</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm">Morning Yoga</h4>
                                    <p className="text-xs text-muted-foreground">8:00 AM • Zoom</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Popular Groups */}
                    <div className="bg-sidebar rounded-3xl p-6 border border-border shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">Popular Groups</h3>
                            <button className="text-emerald-600 text-xs font-bold hover:underline">See All</button>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
                                        <Heart className="h-4 w-4" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-sm">Heart Health</span>
                                        <span className="text-[10px] text-muted-foreground">1.2k members</span>
                                    </div>
                                </div>
                                <button className="bg-white border border-border text-xs font-bold px-2 py-1 rounded hover:bg-gray-50">Join</button>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                                        <Users className="h-4 w-4" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-sm">Caregivers</span>
                                        <span className="text-[10px] text-muted-foreground">850 members</span>
                                    </div>
                                </div>
                                <button className="bg-white border border-border text-xs font-bold px-2 py-1 rounded hover:bg-gray-50">Join</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
