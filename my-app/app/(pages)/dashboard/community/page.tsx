"use client";

import { MessageSquare, Heart, Share2, Calendar, Users, Filter, Search, PlusCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface Post {
    id: string;
    author: string;
    avatar: string;
    content: string;
    category: string;
    likes: number;
    comments: number;
    timeAgo: string;
}

interface Group {
    id: string;
    name: string;
    members: number;
    description: string;
    image?: string;
    tags: string[];
}

interface Event {
    id: string;
    title: string;
    date: string;
    day?: number;
    month?: string;
    location: string;
    type: 'Online' | 'Offline';
    link?: string;
    attendees: number;
}

const CATEGORIES = [
    'Diabetes Warriors',
    'Ask the Community',
    'Health Tips',
    'Heart Health',
    'Mental Wellness',
    'Nutrition',
    'Exercise & Fitness',
    'Medication Support',
    'General Discussion'
];

export default function CommunityPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [postContent, setPostContent] = useState('');
    const [postCategory, setPostCategory] = useState(CATEGORIES[0]);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            // Fetch posts
            const postsRes = await fetch('/api/community/posts');
            const postsData = await postsRes.json();
            if (postsData.success) {
                setPosts(postsData.posts);
            }

            // Fetch groups
            const groupsRes = await fetch('/api/community/groups');
            const groupsData = await groupsRes.json();
            if (groupsData.success) {
                setGroups(groupsData.groups);
            }

            // Fetch events
            const eventsRes = await fetch('/api/community/events');
            const eventsData = await eventsRes.json();
            if (eventsData.success) {
                setEvents(eventsData.events);
            }
        } catch (error) {
            console.error('Error loading community data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async (postId: string) => {
        try {
            const res = await fetch(`/api/community/posts/${postId}/like`, {
                method: 'POST',
            });
            const data = await res.json();
            if (data.success) {
                setPosts(posts.map(post => 
                    post.id === postId 
                        ? { ...post, likes: data.likesCount }
                        : post
                ));
            }
        } catch (error) {
            console.error('Error liking post:', error);
        }
    };

    const handleJoinGroup = async (groupId: string) => {
        try {
            const res = await fetch('/api/community/groups', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ groupId }),
            });
            const data = await res.json();
            if (data.success) {
                alert('Joined group successfully!');
                loadData();
            }
        } catch (error) {
            console.error('Error joining group:', error);
        }
    };

    const handleRSVP = async (eventId: string) => {
        try {
            const res = await fetch('/api/community/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eventId }),
            });
            const data = await res.json();
            if (data.success) {
                alert('RSVP successful!');
                loadData();
            }
        } catch (error) {
            console.error('Error RSVPing:', error);
        }
    };

    const handleCreatePost = async () => {
        if (!postContent.trim()) {
            alert('Please enter some content');
            return;
        }

        setCreating(true);
        try {
            const res = await fetch('/api/community/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: postContent.trim(), category: postCategory }),
            });
            const data = await res.json();
            if (data.success) {
                alert('Post created successfully!');
                setShowCreateModal(false);
                setPostContent('');
                setPostCategory(CATEGORIES[0]);
                loadData();
            } else {
                alert('Failed to create post');
            }
        } catch (error) {
            console.error('Error creating post:', error);
            alert('Failed to create post');
        } finally {
            setCreating(false);
        }
    };
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
                    <button 
                        onClick={() => setShowCreateModal(true)}
                        className="bg-emerald-500 text-white px-4 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-colors"
                    >
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

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            No posts yet. Be the first to share!
                        </div>
                    ) : (
                        posts.map((post) => (
                            <div key={post.id} className="bg-white rounded-3xl p-6 border border-border shadow-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                                        {post.avatar}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm">{post.author}</h3>
                                        <p className="text-xs text-muted-foreground">{post.category} • {post.timeAgo}</p>
                                    </div>
                                </div>
                                <p className="text-muted-foreground text-sm leading-relaxed mb-4">{post.content}</p>
                                <div className="flex items-center gap-6 pt-4 border-t border-border">
                                    <button 
                                        onClick={() => handleLike(post.id)}
                                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-red-500 transition-colors font-medium"
                                    >
                                        <Heart className="h-4 w-4" /> {post.likes} Likes
                                    </button>
                                    <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-blue-500 transition-colors font-medium">
                                        <MessageSquare className="h-4 w-4" /> {post.comments} Comments
                                    </button>
                                    <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium ml-auto">
                                        <Share2 className="h-4 w-4" /> Share
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Upcoming Events */}
                    <div className="bg-white rounded-3xl p-6 border border-border shadow-sm">
                        <h3 className="font-bold text-lg mb-4">Upcoming Events</h3>
                        {events.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No upcoming events</p>
                        ) : (
                            <div className="space-y-4">
                                {events.slice(0, 3).map((event) => (
                                    <div key={event.id} className="flex gap-3 items-start p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer">
                                        <div className="bg-emerald-100 text-emerald-700 h-10 w-10 rounded-lg flex flex-col items-center justify-center flex-shrink-0 text-xs font-bold leading-tight">
                                            <span>{event.month || 'JAN'}</span>
                                            <span className="text-sm">{event.day || '25'}</span>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-sm">{event.title}</h4>
                                            <p className="text-xs text-muted-foreground">{event.date} • {event.type}</p>
                                            <p className="text-xs text-muted-foreground">{event.location}</p>
                                        </div>
                                        <button 
                                            onClick={() => handleRSVP(event.id)}
                                            className="bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded hover:bg-emerald-600"
                                        >
                                            RSVP
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Popular Groups */}
                    <div className="bg-sidebar rounded-3xl p-6 border border-border shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">Popular Groups</h3>
                            <button className="text-emerald-600 text-xs font-bold hover:underline">See All</button>
                        </div>
                        {groups.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No groups available</p>
                        ) : (
                            <div className="space-y-3">
                                {groups.slice(0, 3).map((group) => (
                                    <div key={group.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
                                                <Users className="h-4 w-4" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-sm">{group.name}</span>
                                                <span className="text-[10px] text-muted-foreground">{group.members} members</span>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleJoinGroup(group.id)}
                                            className="bg-white border border-border text-xs font-bold px-2 py-1 rounded hover:bg-gray-50"
                                        >
                                            Join
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Create Post Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
                    <div className="bg-white rounded-t-3xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between p-6 border-b border-border">
                            <h2 className="text-xl font-bold">Create Post</h2>
                            <button 
                                onClick={() => setShowCreateModal(false)}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="mb-6">
                                <label className="block text-sm font-semibold mb-2">Category</label>
                                <div className="flex flex-wrap gap-2">
                                    {CATEGORIES.map((cat) => (
                                        <button
                                            key={cat}
                                            onClick={() => setPostCategory(cat)}
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                                postCategory === cat
                                                    ? 'bg-emerald-500 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold mb-2">What's on your mind?</label>
                                <textarea
                                    value={postContent}
                                    onChange={(e) => setPostContent(e.target.value)}
                                    placeholder="Share your thoughts, tips, or ask a question..."
                                    className="w-full min-h-[150px] p-4 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                        </div>
                        
                        <div className="flex gap-3 p-6 border-t border-border">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreatePost}
                                disabled={creating || !postContent.trim()}
                                className="flex-1 px-4 py-2.5 bg-emerald-500 text-white rounded-lg font-bold hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {creating ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Posting...
                                    </>
                                ) : (
                                    'Post'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
