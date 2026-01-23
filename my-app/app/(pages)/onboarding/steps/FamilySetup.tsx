"use client";

import React from "react";
import { ChevronDown, Plus, UserPlus } from "lucide-react";

export default function FamilySetup() {
    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Build your care circle</h2>
                <p className="text-gray-500">
                    Add family members to help manage health records, share reports, and coordinate appointments together.
                </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-8">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-gray-200 text-sm font-bold text-gray-700">
                    <div className="col-span-3">Name</div>
                    <div className="col-span-2">Relationship</div>
                    <div className="col-span-3">Phone Number</div>
                    <div className="col-span-2">Access Permissions</div>
                    <div className="col-span-2 text-center">Status</div>
                </div>

                {/* Member Row 1 */}
                <div className="grid grid-cols-12 gap-4 p-4 items-center border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className="col-span-3 font-semibold text-gray-900">John Doe</div>
                    <div className="col-span-2 text-teal-600 font-medium">Father</div>
                    <div className="col-span-3 text-gray-600 font-mono text-sm tracking-wide">+1 234 567 8900</div>
                    <div className="col-span-2">
                        <button className="flex items-center gap-1 text-xs font-semibold bg-gray-100 px-3 py-1.5 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors">
                            Edit/Manage <ChevronDown className="w-3 h-3" />
                        </button>
                    </div>
                    <div className="col-span-2 flex justify-center">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 uppercase tracking-wide">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            Active
                        </span>
                    </div>
                </div>

                {/* Member Row 2 */}
                <div className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50 transition-colors">
                    <div className="col-span-3 font-semibold text-gray-900">Jane Doe</div>
                    <div className="col-span-2 text-teal-600 font-medium">Mother</div>
                    <div className="col-span-3 text-gray-600 font-mono text-sm tracking-wide">+1 234 567 8901</div>
                    <div className="col-span-2">
                        <button className="flex items-center gap-1 text-xs font-semibold bg-gray-100 px-3 py-1.5 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors">
                            View Only <ChevronDown className="w-3 h-3" />
                        </button>
                    </div>
                    <div className="col-span-2 flex justify-center">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700 uppercase tracking-wide">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                            Pending
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <button className="flex items-center gap-2 bg-[#22c55e] hover:bg-[#16a34a] text-black font-bold py-3 px-6 rounded-lg shadow-lg shadow-green-500/20 transition-all transform active:scale-[0.98]">
                    <UserPlus className="w-5 h-5" />
                    Add Member
                </button>
            </div>

        </div>
    );
}
