"use client";

import { Plus, MoreVertical, Trash2, Edit2, Users, Activity, Heart, Phone, Mail, Calendar } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Loader } from "@/components/ui/loader";
import { useToast } from "@/components/ui/toast";

export default function FamilyPage() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingMember, setEditingMember] = useState<any>(null);
    const [newMember, setNewMember] = useState({
        name: '',
        relationship: '',
        age: '',
        email: '',
        phone: ''
    });
    const { showToast } = useToast();

    useEffect(() => {
        fetchFamily();
    }, []);

    const fetchFamily = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/family');
            const json = await res.json();
            if (json.success && json.family) {
                setMembers(json.family);
            } else {
                setMembers([]);
            }
        } catch (e) {
            console.error(e);
            setMembers([]);
            showToast('Failed to load family members', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAddMember = async () => {
        if (!newMember.name || !newMember.relationship) {
            showToast('Name and relationship are required', 'error');
            return;
        }

        try {
            const res = await fetch('/api/family', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newMember)
            });
            const data = await res.json();
            if (res.ok) {
                showToast('Family member added successfully', 'success');
                setShowAddModal(false);
                setNewMember({ name: '', relationship: '', age: '', email: '', phone: '' });
                fetchFamily();
            } else {
                showToast(data.error || 'Failed to add family member', 'error');
            }
        } catch (err) {
            console.error('Error adding member:', err);
            showToast('Failed to add family member', 'error');
        }
    };

    const handleDeleteMember = async (memberId: string) => {
        if (!confirm('Are you sure you want to remove this family member?')) {
            return;
        }

        try {
            const res = await fetch(`/api/family/${memberId}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                showToast('Family member removed', 'success');
                fetchFamily();
            } else {
                showToast('Failed to remove family member', 'error');
            }
        } catch (err) {
            console.error('Error deleting member:', err);
            showToast('Failed to remove family member', 'error');
        }
    };

    const handleReset = () => {
        if (!confirm('Are you sure you want to reset all family members? This action cannot be undone.')) {
            return;
        }
        // Reset functionality - clear all members
        showToast('Reset functionality coming soon', 'info');
    };

    if (loading) {
        return <Loader fullScreen text="Loading family members..." />;
    }

    // Calculate stats from members
    const totalMembers = members.length;
    const averageAge = members.length > 0 
        ? Math.round(members.reduce((sum, m) => sum + (parseInt(m.age) || 0), 0) / members.length)
        : 0;

    return (
        <div className="p-8 min-h-screen space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Family Circle</h1>
                    <p className="text-muted-foreground text-sm">Manage and monitor your family members' health</p>
                </div>
                <div className="flex gap-3">
                    {members.length > 0 && (
                        <button 
                            onClick={handleReset}
                            className="bg-gray-100 text-foreground px-4 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-gray-200 transition-colors"
                        >
                            Reset
                        </button>
                    )}
                    <button 
                        onClick={() => {
                            setEditingMember(null);
                            setNewMember({ name: '', relationship: '', age: '', email: '', phone: '' });
                            setShowAddModal(true);
                        }}
                        className="bg-emerald-500 text-white px-4 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-colors"
                    >
                        <Plus className="h-4 w-4" /> Add Member
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            {members.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-3xl p-6 border border-emerald-200">
                        <div className="flex items-center justify-between mb-4">
                            <Users className="h-8 w-8 text-emerald-600" />
                        </div>
                        <p className="text-sm font-medium text-emerald-700 mb-1">Total Members</p>
                        <p className="text-4xl font-bold text-emerald-900">{totalMembers}</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-6 border border-blue-200">
                        <div className="flex items-center justify-between mb-4">
                            <Activity className="h-8 w-8 text-blue-600" />
                        </div>
                        <p className="text-sm font-medium text-blue-700 mb-1">Average Age</p>
                        <p className="text-4xl font-bold text-blue-900">{averageAge || 'N/A'}</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl p-6 border border-purple-200">
                        <div className="flex items-center justify-between mb-4">
                            <Heart className="h-8 w-8 text-purple-600" />
                        </div>
                        <p className="text-sm font-medium text-purple-700 mb-1">Active Members</p>
                        <p className="text-4xl font-bold text-purple-900">{totalMembers}</p>
                    </div>
                </div>
            )}

            {/* Member Cards */}
            {members.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-border shadow-sm">
                    <div className="max-w-md mx-auto">
                        <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="h-10 w-10 text-emerald-600" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">No Family Members Yet</h3>
                        <p className="text-muted-foreground mb-6">Start building your family circle by adding members to share health information and care plans.</p>
                        <button 
                            onClick={() => {
                                setShowAddModal(true);
                            }}
                            className="bg-emerald-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
                        >
                            Add Your First Family Member
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {members.map((member) => (
                        <div key={member.id} className="bg-white rounded-3xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex gap-4">
                                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                                        {member.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-xl mb-1">{member.name}</h3>
                                        <div className="inline-block px-3 py-1 rounded-lg text-xs font-bold uppercase bg-blue-100 text-blue-700">
                                            {member.relationship}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <button 
                                        onClick={() => handleDeleteMember(member.id)}
                                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                        title="Remove member"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {member.age && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">Age:</span>
                                        <span className="font-semibold">{member.age} years</span>
                                    </div>
                                )}
                                {member.email && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">Email:</span>
                                        <span className="font-semibold truncate">{member.email}</span>
                                    </div>
                                )}
                                {member.phone && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">Phone:</span>
                                        <span className="font-semibold">{member.phone}</span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 pt-4 border-t border-border">
                                <button className="w-full bg-emerald-50 text-emerald-700 py-2 rounded-lg font-semibold text-sm hover:bg-emerald-100 transition-colors">
                                    View Health Profile
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Member Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
                        <h2 className="text-2xl font-bold mb-6">{editingMember ? 'Edit' : 'Add'} Family Member</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-bold text-muted-foreground block mb-1">
                                    Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={newMember.name}
                                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                    placeholder="Enter full name"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-muted-foreground block mb-1">
                                    Relationship <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={newMember.relationship}
                                    onChange={(e) => setNewMember({ ...newMember, relationship: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                >
                                    <option value="">Select relationship</option>
                                    <option>Parent</option>
                                    <option>Spouse</option>
                                    <option>Sibling</option>
                                    <option>Child</option>
                                    <option>Friend</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-bold text-muted-foreground block mb-1">Age</label>
                                <input
                                    type="number"
                                    value={newMember.age}
                                    onChange={(e) => setNewMember({ ...newMember, age: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                    placeholder="Enter age"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-muted-foreground block mb-1">Email</label>
                                <input
                                    type="email"
                                    value={newMember.email}
                                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                    placeholder="email@example.com"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-muted-foreground block mb-1">Phone</label>
                                <input
                                    type="tel"
                                    value={newMember.phone}
                                    onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                    placeholder="+91 1234567890"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    setEditingMember(null);
                                    setNewMember({ name: '', relationship: '', age: '', email: '', phone: '' });
                                }}
                                className="flex-1 px-6 py-2.5 rounded-xl font-bold text-sm text-foreground bg-gray-100 hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddMember}
                                className="flex-1 px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-emerald-500 hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
                            >
                                {editingMember ? 'Update' : 'Add'} Member
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
