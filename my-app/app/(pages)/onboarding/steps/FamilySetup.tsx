"use client";

import React from "react";
import { ChevronDown, Plus, UserPlus } from "lucide-react";

export default function FamilySetup() {
    const [members, setMembers] = React.useState<Array<{
        id: number;
        name: string;
        relation: string;
        phone: string;
        status: string;
    }>>([]);
    const [loading, setLoading] = React.useState(false);
    const [showAddForm, setShowAddForm] = React.useState(false);
    const [newMember, setNewMember] = React.useState({
        name: "",
        relation: "",
        phone: ""
    });

    const handleAddMember = async () => {
        if (!newMember.name || !newMember.relation || !newMember.phone) {
            alert("Please fill in all fields");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/family', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newMember)
            });
            const json = await res.json();
            if (res.ok) {
                const addedMember = {
                    id: Date.now(),
                    name: newMember.name,
                    relation: newMember.relation,
                    phone: newMember.phone,
                    status: "Pending"
                };
                setMembers([...members, addedMember]);
                setNewMember({ name: "", relation: "", phone: "" });
                setShowAddForm(false);
            } else {
                alert(json.error || "Failed to add family member");
            }
        } catch (e) {
            console.error(e);
            alert("Failed to add family member");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-serif font-medium text-foreground mb-2">Build Your Care Circle</h2>
                <p className="text-muted-foreground">
                    Add family members to help manage health records, share reports, and coordinate appointments together.
                </p>
            </div>

            {members.length === 0 ? (
                <div className="bg-muted/30 rounded-2xl border border-border p-12 text-center">
                    <UserPlus className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No Family Members Added</h3>
                    <p className="text-muted-foreground mb-6">
                        Add family members to help manage health records together.
                    </p>
                </div>
            ) : (
                <div className="bg-card rounded-2xl border border-border overflow-hidden mb-8">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-4 p-4 bg-muted/50 border-b border-border text-sm font-semibold text-foreground">
                        <div className="col-span-3">Name</div>
                        <div className="col-span-2">Relationship</div>
                        <div className="col-span-3">Phone Number</div>
                        <div className="col-span-2">Access Permissions</div>
                        <div className="col-span-2 text-center">Status</div>
                    </div>

                    {members.map((member) => (
                        <div key={member.id} className="grid grid-cols-12 gap-4 p-4 items-center border-b border-border hover:bg-muted/30 transition-colors">
                            <div className="col-span-3 font-semibold text-foreground">{member.name}</div>
                            <div className="col-span-2 text-primary font-medium">{member.relation}</div>
                            <div className="col-span-3 text-muted-foreground font-mono text-sm tracking-wide">{member.phone}</div>
                            <div className="col-span-2">
                                <button className="flex items-center gap-1 text-xs font-semibold bg-muted px-3 py-1.5 rounded-lg text-foreground hover:bg-muted/80 transition-colors">
                                    Edit/Manage <ChevronDown className="w-3 h-3" />
                                </button>
                            </div>
                            <div className="col-span-2 flex justify-center">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${member.status === 'Active' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary-foreground'
                                    }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${member.status === 'Active' ? 'bg-primary' : 'bg-secondary'
                                        }`} />
                                    {member.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Member Form */}
            {showAddForm && (
                <div className="bg-card rounded-2xl border border-border p-6 mb-8">
                    <h3 className="font-semibold text-foreground mb-4">Add Family Member</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-foreground mb-1">Name</label>
                            <input
                                type="text"
                                value={newMember.name}
                                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                                placeholder="Enter name"
                                className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-foreground mb-1">Relationship</label>
                            <select
                                value={newMember.relation}
                                onChange={(e) => setNewMember({ ...newMember, relation: e.target.value })}
                                className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="">Select relationship</option>
                                <option value="Father">Father</option>
                                <option value="Mother">Mother</option>
                                <option value="Spouse">Spouse</option>
                                <option value="Sibling">Sibling</option>
                                <option value="Child">Child</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-foreground mb-1">Phone Number</label>
                            <input
                                type="tel"
                                value={newMember.phone}
                                onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                                placeholder="+1 234 567 8900"
                                className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleAddMember}
                                disabled={loading}
                                className="flex-1 bg-primary text-primary-foreground font-semibold py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                            >
                                {loading ? "Adding..." : "Add Member"}
                            </button>
                            <button
                                onClick={() => {
                                    setShowAddForm(false);
                                    setNewMember({ name: "", relation: "", phone: "" });
                                }}
                                className="px-6 py-2 border border-border text-foreground font-semibold rounded-lg hover:bg-muted transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-end">
                {!showAddForm && (
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-6 rounded-lg shadow-lg shadow-primary/20 transition-all transform active:scale-[0.98]"
                    >
                        <UserPlus className="w-5 h-5" />
                        Add Family Member
                    </button>
                )}
            </div>

        </div>
    );
}
