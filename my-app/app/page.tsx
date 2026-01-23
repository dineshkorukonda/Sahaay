"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollAnimate } from "@/components/scroll-animate"
import {
  Calendar, Users, FileText,
  CheckCircle, Shield, Lock, Activity, Pill, Apple,
  BookOpen, Hospital, Sparkles, Sun, CloudRain,
  ArrowRight, Heart
} from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

export default function SanctuaryHome() {
  const [scrolled, setScrolled] = useState(false)
  const [activeCycle, setActiveCycle] = useState('analyze')

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const careCycle = {
    analyze: { title: "Analyze", desc: "Engine extracts insights from your records.", icon: FileText, color: "text-blue-500", bg: "bg-blue-50" },
    plan: { title: "Plan", desc: "Personalized daily routines created for you.", icon: Calendar, color: "text-green-500", bg: "bg-green-50" },
    track: { title: "Track", desc: "Log symptoms and meds with one tap.", icon: Activity, color: "text-orange-500", bg: "bg-orange-50" },
    support: { title: "Support", desc: "Connect with community and specialists.", icon: Users, color: "text-purple-500", bg: "bg-purple-50" }
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500 selection:bg-primary/20">

      {/* Navigation - Floating Circular Pill */}
      <nav className={cn(
        "fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]",
        scrolled ? "w-[90%] md:w-auto" : "w-[95%] md:w-auto"
      )}>
        <div className={cn(
          "flex items-center justify-between px-2 py-2 rounded-full border border-white/20 shadow-lg backdrop-blur-xl transition-all duration-500",
          scrolled ? "bg-white/90 pl-4 pr-2" : "bg-white/60 pl-6 pr-3"
        )}>
          <div className="flex items-center gap-3 mr-8">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-glow">
              <Sun className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-serif font-bold tracking-tight text-foreground/90 hidden sm:block">Sahaay</span>
          </div>

          <div className="hidden md:flex items-center gap-1 bg-muted/50 rounded-full px-2 py-1">
            {['Sanctuary', 'Daily Life', 'Community'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(' ', '-')}`}
                className="px-4 py-1.5 text-sm font-medium rounded-full hover:bg-white hover:shadow-sm transition-all text-muted-foreground hover:text-foreground"
              >
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2 ml-4 md:ml-8">
            <Link href="/auth/login">
              <Button className="rounded-full bg-primary text-white hover:bg-primary/90 px-6 h-10 shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95">
                Begin Journey
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* HERO: The Welcome Mat */}
        <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden pt-32 pb-20">

          {/* Organic Ambient Background */}
          <div className="absolute inset-0 -z-10 bg-[#FAF9F6]" />
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
            <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-primary/5 rounded-[100%] blur-[120px] animate-float-gentle" />
            <div className="absolute bottom-[10%] right-[20%] w-[400px] h-[400px] bg-secondary/5 rounded-[100%] blur-[100px] animate-breathe" />
          </div>

          <div className="max-w-4xl mx-auto text-center relative z-10 space-y-8">
            <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white border border-primary/10 shadow-sm animate-fade-in hover:shadow-md transition-shadow cursor-default">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-sm font-medium text-foreground/80">Your safe space for chronic care</span>
            </div>

            <h1 className="font-serif text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-medium tracking-tight text-balance leading-[1] text-foreground">
              Heal where <br />
              <span className="italic text-primary/90">you feel safe.</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-balance font-light">
              Sahaay brings intelligent medical guidance and community support
              into a space that feels less like a clinic, and more like home.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
              <Button size="xl" className="h-16 px-12 rounded-full text-lg shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.2)] hover:scale-105 transition-all bg-foreground text-background hover:bg-foreground/90">
                Enter Your Sanctuary
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button variant="outline" size="xl" className="h-16 px-12 rounded-full text-lg border-2 hover:bg-muted/50 hover:border-foreground/10 transition-all">
                Watch Demo
              </Button>
            </div>
          </div>
        </section>

        {/* NEW SECTION: Interactive Care Cycle */}
        <section className="py-24 px-6 bg-white relative overflow-hidden">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-serif text-4xl md:text-5xl mb-6">The Cycle of Care</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Click to explore how Sahaay adapts to your needs at every step.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Interactive Visualizer */}
              <div className="relative aspect-square max-w-md mx-auto lg:max-w-none w-full">
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-muted-foreground/20 animate-[spin_60s_linear_infinite]" />

                {/* Center Content */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-64 rounded-full bg-white shadow-[0_0_50px_-12px_rgba(0,0,0,0.1)] flex flex-col items-center justify-center p-8 text-center transition-all duration-500 border border-muted">
                    {(() => {
                      const info = careCycle[activeCycle as keyof typeof careCycle]
                      const Icon = info.icon
                      return (
                        <div className="animate-fade-in" key={activeCycle}>
                          <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-4 mx-auto transition-colors", info.bg, info.color)}>
                            <Icon className="w-7 h-7" />
                          </div>
                          <h3 className="text-xl font-bold mb-2">{info.title}</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">{info.desc}</p>
                        </div>
                      )
                    })()}
                  </div>
                </div>

                {/* Orbital Buttons */}
                {Object.entries(careCycle).map(([key, info], i) => {
                  // Positions: Top, Right, Bottom, Left
                  const positions = [
                    "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2",
                    "top-1/2 right-0 translate-x-1/2 -translate-y-1/2",
                    "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2",
                    "top-1/2 left-0 -translate-x-1/2 -translate-y-1/2"
                  ]

                  return (
                    <button
                      key={key}
                      onClick={() => setActiveCycle(key)}
                      className={cn(
                        "absolute w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg border-4 border-white",
                        positions[i],
                        activeCycle === key ? "bg-primary text-primary-foreground scale-110 ring-4 ring-primary/20" : "bg-white text-muted-foreground hover:bg-muted"
                      )}
                    >
                      <info.icon className="w-8 h-8" />
                    </button>
                  )
                })}
              </div>

              {/* Descriptions */}
              <div className="space-y-6">
                {Object.entries(careCycle).map(([key, info], i) => (
                  <div
                    key={key}
                    onClick={() => setActiveCycle(key)}
                    className={cn(
                      "p-6 rounded-2xl cursor-pointer transition-all duration-300 border",
                      activeCycle === key ? "bg-muted/50 border-primary/20 shadow-sm translate-x-4" : "bg-transparent border-transparent hover:bg-muted/30"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <span className={cn("text-sm font-bold uppercase tracking-wider", activeCycle === key ? "text-primary" : "text-muted-foreground")}>
                        Step 0{i + 1}
                      </span>
                      <div className="h-px flex-1 bg-border" />
                    </div>
                    <h3 className={cn("text-2xl font-bold mt-2", activeCycle === key ? "text-foreground" : "text-muted-foreground")}>
                      {info.title}
                    </h3>
                    <p className="text-muted-foreground mt-2 max-w-md">
                      {info.desc} {activeCycle === key && "This is a critical part of our holistic approach to your wellness."}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 1: The Health "Bento Box" */}
        <section id="sanctuary" className="py-32 px-6 bg-[#F4F4F0]">
          <div className="max-w-7xl mx-auto">
            <div className="mb-20">
              <Badge variant="outline" className="mb-6 rounded-full px-4 py-1 border-primary/20 text-primary bg-primary/5">The Engine</Badge>
              <h2 className="font-serif text-5xl md:text-6xl mb-6 leading-tight">Your Health, <br />Organized Beautifully.</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(240px,auto)]">

              {/* Main Big Feature - Interactive Tilt */}
              <div className="md:col-span-2 row-span-2 group relative overflow-hidden rounded-[3rem] bg-white border border-white/50 shadow-sm hover:shadow-2xl transition-all duration-500 p-12 flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 opacity-50" />

                <div className="relative z-10 max-w-lg">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-8 text-blue-600 group-hover:scale-110 transition-transform duration-500">
                    <Activity className="w-7 h-7" />
                  </div>
                  <h3 className="font-serif text-4xl font-medium mb-6">Medical Intelligence Engine</h3>
                  <p className="text-xl text-muted-foreground leading-relaxed">
                    Our core system processes your records, symptoms, and history throughout the day to extract structured insights.
                  </p>
                  <div className="mt-8 flex gap-3">
                    <Badge variant="secondary" className="rounded-full px-4 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100">AI Analysis</Badge>
                    <Badge variant="secondary" className="rounded-full px-4 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100">Real-time</Badge>
                  </div>
                </div>

                {/* Visual Representation */}
                <div className="relative mt-12 h-64 rounded-3xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center group-hover:bg-slate-100 transition-colors">
                  <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-100" />
                  {/* Abstract UI representation */}
                  <div className="w-64 h-40 bg-white rounded-xl shadow-lg border border-slate-200 p-4 space-y-3 animate-float-gentle">
                    <div className="h-2 w-1/3 bg-slate-200 rounded-full" />
                    <div className="h-2 w-2/3 bg-slate-100 rounded-full" />
                    <div className="h-24 w-full bg-slate-50 rounded-lg border border-dashed border-slate-200 flex items-center justify-center">
                      <Activity className="w-8 h-8 text-slate-300" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Tall Feature */}
              <div className="md:col-span-1 row-span-2 rounded-[3rem] bg-[#E8E8E3] border border-transparent p-10 flex flex-col shadow-none relative overflow-hidden group hover:bg-[#E0E0DB] transition-colors">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5" />
                <div className="relative z-10 flex flex-col h-full">
                  <div className="w-16 h-16 rounded-full bg-white/80 backdrop-blur-sm shadow-sm flex items-center justify-center mb-8 text-foreground group-hover:rotate-12 transition-transform duration-500">
                    <Lock className="w-7 h-7" />
                  </div>
                  <h3 className="font-serif text-3xl font-medium mb-4">Private Vault</h3>
                  <p className="text-foreground/70 mb-8 text-lg">
                    Your Secure Personal Health Profile. Encrypted, local-first, and always under your control.
                  </p>
                  <div className="mt-auto w-full bg-white/60 backdrop-blur-md rounded-3xl p-6 space-y-4 border border-white/40">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-foreground/50">Status</span>
                      <div className="flex items-center gap-1.5 text-green-600 text-xs font-bold bg-green-100 px-2 py-1 rounded-full">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse" />
                        SECURE
                      </div>
                    </div>
                    <div className="h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
                      <div className="h-full w-[80%] bg-foreground/80 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Standard Cards - Now with more padding and clearer icons */}
              {[
                { title: "Record Analysis", icon: FileText, color: "text-orange-600", bg: "bg-orange-100" },
                { title: "Medication Manager", icon: Pill, color: "text-emerald-600", bg: "bg-emerald-100" },
                { title: "Knowledge Hub", icon: BookOpen, color: "text-violet-600", bg: "bg-violet-100" }
              ].map((card, i) => (
                <div key={i} className="rounded-[3rem] bg-white border border-white/50 p-10 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300", card.bg, card.color)}>
                    <card.icon className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-serif text-2xl font-medium mb-3">{card.title}</h4>
                    <Link href="#" className="inline-flex items-center text-sm font-bold text-muted-foreground group-hover:text-foreground transition-colors">
                      Explore <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 2: Daily Living with Storyline */}
        <section id="daily-life" className="py-32 px-6 overflow-hidden relative bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-24 items-center">
              <div className="space-y-10">
                <Badge variant="outline" className="px-4 py-1.5 rounded-full border-primary/20 text-primary uppercase tracking-widest text-xs">Daily Living</Badge>
                <h2 className="font-serif text-6xl leading-[1.1]">
                  Small steps, <br />
                  <span className="text-primary italic">gentle impact.</span>
                </h2>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Sahaay is designed to whisper, not shout. We transform complex health protocols into
                  simple, manageable daily actions that fit your lifestyle.
                </p>

                <div className="space-y-4">
                  {[
                    "Personalized nutrition advice",
                    "Daily care routine generation",
                    "Symptom logging & trend spotting"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 hover:bg-muted/60 transition-colors">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      <span className="font-medium text-lg">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="aspect-[4/5] bg-[#F8F8F6] rounded-[4rem] shadow-2xl p-8 relative overflow-hidden border border-border">
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-orange-100 rounded-full blur-[80px] opacity-60" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-100 rounded-full blur-[80px] opacity-60" />

                  <div className="relative z-10 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-8 px-2">
                      <span className="font-bold text-xl text-foreground/80">Today</span>
                      <span className="text-sm font-medium text-muted-foreground bg-white px-3 py-1 rounded-full shadow-sm">Oct 24</span>
                    </div>

                    <div className="space-y-4 flex-1 overflow-visible">
                      <div className="bg-white p-6 rounded-[2rem] shadow-sm flex gap-4 items-center group cursor-pointer hover:shadow-md transition-all">
                        <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center text-lg">☀️</div>
                        <div>
                          <h4 className="font-bold">Morning Check-in</h4>
                          <p className="text-sm text-muted-foreground">Log your waking vitals</p>
                        </div>
                        <button className="ml-auto w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:bg-orange-500 group-hover:border-orange-500 group-hover:text-white transition-all">
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="bg-white p-6 rounded-[2rem] shadow-sm flex gap-4 items-center group cursor-pointer hover:shadow-md transition-all">
                        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-lg">💊</div>
                        <div>
                          <h4 className="font-bold">Medication</h4>
                          <p className="text-sm text-muted-foreground">Metformin after lunch</p>
                        </div>
                        <div className="ml-auto text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded-md">1:00 PM</div>
                      </div>

                      <div className="bg-primary/5 p-6 rounded-[2rem] border border-primary/10 flex flex-col gap-4 mt-8">
                        <div className="flex items-center gap-2 text-primary font-bold">
                          <Sparkles className="w-4 h-4" />
                          <span>Daily Tip</span>
                        </div>
                        <p className="text-sm text-foreground/80 leading-relaxed">
                          &quot;Small walks after meals can significantly lower blood sugar levels. Try 10 mins today!&quot;
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: Community & Connection */}
        <section id="community" className="py-32 px-6 bg-[#2D3436] text-[#FDFDFD] relative overflow-hidden rounded-t-[4rem] -mb-2">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />

          <div className="max-w-6xl mx-auto relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
              <div>
                <h2 className="font-serif text-5xl md:text-7xl mb-6">You don&apos;t have <br />to do this alone.</h2>
                <p className="text-xl opacity-70 max-w-lg leading-relaxed">
                  Connect with people who understand because they&apos;ve been there.
                  Sahaay builds bridges between experiences.
                </p>
              </div>
              <Button variant="secondary" size="xl" className="rounded-full px-8 h-14 bg-white text-black hover:bg-white/90">
                Join Community
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: "Peer Support", icon: Users, desc: "Moderated spaces for empathy and shared experience." },
                { title: "Local Discovery", icon: Hospital, desc: "Find affordable specialists in your neighborhood." },
                { title: "Safe Space", icon: Shield, desc: "Respectful environment where privacy is guaranteed." }
              ].map((item, i) => (
                <div key={i} className="group bg-white/5 backdrop-blur-sm rounded-[2.5rem] p-10 border border-white/10 hover:bg-white/10 transition-colors cursor-default">
                  <item.icon className="w-10 h-10 mb-8 text-white/80 group-hover:text-white transition-colors" />
                  <h3 className="text-2xl font-serif font-medium mb-4">{item.title}</h3>
                  <p className="opacity-60 leading-relaxed font-light">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 4: Trust Footer - Clean & Minimal */}
        <footer className="bg-white pt-24 pb-12 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col items-center text-center space-y-8 mb-20">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Sun className="w-8 h-8 text-primary" />
              </div>
              <h2 className="font-serif text-4xl font-bold">Sahaay</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Built with love to make chronic care management accessible, dignified, and simple for everyone.
              </p>
              <div className="flex gap-4">
                <Button variant="ghost" size="icon" className="rounded-full"><span className="sr-only">Twitter</span><Activity className="w-5 h-5" /></Button>
                <Button variant="ghost" size="icon" className="rounded-full"><span className="sr-only">GitHub</span><Users className="w-5 h-5" /></Button>
              </div>
            </div>

            <div className="border-t border-border pt-12 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-muted-foreground">
              <p>© 2026 Sahaay Platform.</p>
              <nav className="flex gap-8">
                <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
                <a href="#" className="hover:text-foreground transition-colors">Terms</a>
                <a href="#" className="hover:text-foreground transition-colors">Cookies</a>
              </nav>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
