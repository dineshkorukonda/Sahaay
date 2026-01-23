"use client";

import { Search, HelpCircle, Phone, Mail, MessageSquare, ChevronDown, ChevronRight, FileText, ExternalLink } from "lucide-react";

export default function SupportPage() {
    return (
        <div className="p-8 min-h-screen space-y-8 pb-20">
            {/* Header */}
            <div className="max-w-2xl">
                <div className="text-sm text-muted-foreground mb-1">Help Center</div>
                <h1 className="text-3xl font-bold tracking-tight mb-4">How can we help you today?</h1>
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search for articles, billing questions, or technical help..."
                        className="w-full bg-white border border-border pl-12 pr-4 py-4 rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-lg"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* FAQs / Articles */}
                <div className="lg:col-span-2 space-y-8">
                    <section>
                        <h2 className="font-bold text-xl mb-4">Common Questions</h2>
                        <div className="space-y-4">
                            <FaqItem
                                question="How do I reschedule an appointment?"
                                answer="Navigate to the Dashboard or Care Plan page, find your upcoming appointment, and click the 'Reschedule' button. You can choose a new time slot from the available options."
                            />
                            <FaqItem
                                question="How can I download my medical records?"
                                answer="Go to the Health Summary page. Just below the header, you will find an 'Export PDF' button. You can choose to download a summary or your full history."
                            />
                            <FaqItem
                                question="Who has access to my health data?"
                                answer="You have full control. Visit the Family page to manage permissions for family members. Your primary care physician has default access, which you can revoke in Settings."
                            />
                        </div>
                    </section>

                    <section>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="font-bold text-xl">Browse Topics</h2>
                            <button className="text-emerald-600 text-sm font-bold hover:underline">View All Articles</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <TopicCard icon={<Calendar className="h-5 w-5 text-blue-500" />} title="Appointments & Visits" count={12} />
                            <TopicCard icon={<FileText className="h-5 w-5 text-orange-500" />} title="Medical Records" count={8} />
                            <TopicCard icon={<ShieldCheck className="h-5 w-5 text-emerald-500" />} title="Privacy & Security" count={5} />
                            <TopicCard icon={<CreditCard className="h-5 w-5 text-purple-500" />} title="Insurance & Billing" count={14} />
                        </div>
                    </section>
                </div>

                {/* Sidebar - Contact */}
                <div className="space-y-6">
                    <div className="bg-white rounded-3xl p-6 border border-border shadow-sm">
                        <h3 className="font-bold text-lg mb-4">Contact Support</h3>
                        <div className="space-y-4">
                            <ContactOption
                                icon={<MessageSquare className="h-5 w-5 text-white" />}
                                color="bg-emerald-500"
                                title="Live Chat"
                                desc="Chat with a support agent"
                                action="Start Chat"
                            />
                            <ContactOption
                                icon={<Phone className="h-5 w-5 text-white" />}
                                color="bg-blue-500"
                                title="Phone Support"
                                desc="+1 (800) 123-4567"
                                action="Call Now"
                            />
                            <ContactOption
                                icon={<Mail className="h-5 w-5 text-white" />}
                                color="bg-orange-500"
                                title="Email Us"
                                desc="support@careconnect.com"
                                action="Send Email"
                            />
                        </div>
                    </div>

                    <div className="bg-red-50 rounded-3xl p-6 border border-red-100">
                        <h3 className="font-bold text-lg text-red-900 mb-2">Emergency?</h3>
                        <p className="text-red-700/80 text-sm mb-4 leading-relaxed">
                            If you are experiencing a medical emergency, please do not use this support form. Call emergency services immediately.
                        </p>
                        <button className="w-full bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20 active:scale-95">
                            Call 911
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function FaqItem({ question, answer }: { question: string, answer: string }) {
    return (
        <div className="bg-white rounded-xl border border-border p-5 hover:border-emerald-200 transition-colors cursor-pointer group">
            <div className="flex justify-between items-center">
                <h4 className="font-bold text-foreground group-hover:text-emerald-700 transition-colors">{question}</h4>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-emerald-500 transition-colors" />
            </div>
            {/* Ideally this would use state for expand/collapse, but for static view just showing question is cleaner or we can show answer directly. Let's show answer for better preview content. */}
            <p className="text-muted-foreground text-sm mt-2 leading-relaxed">{answer}</p>
        </div>
    )
}

function TopicCard({ icon, title, count }: { icon: React.ReactNode, title: string, count: number }) {
    return (
        <div className="bg-white p-4 rounded-xl border border-border flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="h-10 w-10 bg-gray-50 rounded-lg flex items-center justify-center">
                {icon}
            </div>
            <div>
                <h4 className="font-bold text-sm">{title}</h4>
                <p className="text-xs text-muted-foreground">{count} articles</p>
            </div>
        </div>
    )
}

function ContactOption({ icon, color, title, desc, action }: { icon: React.ReactNode, color: string, title: string, desc: string, action: string }) {
    return (
        <div className="flex items-center gap-4">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center shadow-md ${color}`}>
                {icon}
            </div>
            <div className="flex-1">
                <h4 className="font-bold text-sm">{title}</h4>
                <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
            <button className="text-xs font-bold bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors">
                {action}
            </button>
        </div>
    )
}

// Missing imports for TopicCard icons
import { Calendar, ShieldCheck, CreditCard } from "lucide-react";
