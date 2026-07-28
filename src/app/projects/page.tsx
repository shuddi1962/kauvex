"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight, CheckCircle2, Building2, Sun, Ship, Monitor,
  Factory, Waves, Sprout, HardDrive, ChevronDown, ChevronUp,
  Users, Award, Briefcase, FileCheck, Star, TrendingUp, Shield,
} from "lucide-react";

const PROJECT_TYPES = [
  {
    icon: Building2,
    label: "Residential",
    desc: "Houses, apartments, estates, and residential complexes",
    color: "bg-blue-50 text-blue",
  },
  {
    icon: Building2,
    label: "Commercial",
    desc: "Offices, malls, hotels, and mixed-use developments",
    color: "bg-violet-50 text-violet",
  },
  {
    icon: Sun,
    label: "Energy",
    desc: "Solar farms, power plants, and renewable energy systems",
    color: "bg-amber-50 text-amber",
  },
  {
    icon: Ship,
    label: "Marine",
    desc: "Vessels, ports, jetties, and offshore structures",
    color: "bg-cyan-50 text-cyan-600",
  },
  {
    icon: HardDrive,
    label: "IT & Telecom",
    desc: "Data centers, networks, fibre optics, and software systems",
    color: "bg-emerald-50 text-emerald",
  },
  {
    icon: Factory,
    label: "Industrial",
    desc: "Factories, warehouses, processing plants, and logistics hubs",
    color: "bg-orange-50 text-orange",
  },
  {
    icon: Waves,
    label: "Dredging",
    desc: "Waterway dredging, land reclamation, and sediment management",
    color: "bg-sky-50 text-sky-600",
  },
  {
    icon: Sprout,
    label: "Agriculture",
    desc: "Farms, greenhouses, irrigation systems, and agro-processing",
    color: "bg-green-50 text-green",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Describe Your Project",
    desc: "Tell us about your project — type, scope, budget, and timeline.",
    icon: FileCheck,
  },
  {
    step: "02",
    title: "AI Analysis",
    desc: "Our AI analyzes your requirements and recommends the best professionals and materials.",
    icon: TrendingUp,
  },
  {
    step: "03",
    title: "Receive Bids",
    desc: "Qualified professionals bid on your project. Compare proposals side by side.",
    icon: Briefcase,
  },
  {
    step: "04",
    title: "Award & Execute",
    desc: "Award the project, track milestones, manage documents, and pay securely.",
    icon: Award,
  },
];

const STATS = [
  { value: "2,500+", label: "Projects Completed", icon: CheckCircle2 },
  { value: "1,800+", label: "Verified Professionals", icon: Users },
  { value: "98%", label: "Client Satisfaction", icon: Star },
  { value: "45+", label: "Countries Served", icon: Shield },
];

const FAQS = [
  {
    q: "How does the AI match professionals to my project?",
    a: "Our AI analyzes your project scope, budget, location, and timeline to recommend the most qualified professionals from our verified network. It considers past project performance, ratings, certifications, and availability.",
  },
  {
    q: "Is there a cost to create a project?",
    a: "No — creating a project and receiving bids is completely free for clients. We only charge a success fee when you award and complete a project through our platform.",
  },
  {
    q: "How are professionals verified?",
    a: "Every professional on Kauvex undergoes a multi-stage verification process including license validation, background checks, portfolio review, and client reference checks.",
  },
  {
    q: "Can I manage everything from one dashboard?",
    a: "Yes. Your Digital Project Room gives you documents, RFIs, site diary, variation orders, and milestone tracking — all in one place with real-time updates.",
  },
  {
    q: "What if I need to make changes after awarding?",
    a: "Variation orders are built into the platform. You can submit change requests, and professionals can quote adjustments — all tracked and approved digitally.",
  },
];

export default function ProjectsPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-gray-400">
          <Link href="/" className="hover:text-[#0A1628] transition-colors">Home</Link>
          <span>/</span>
          <span className="text-[#0A1628] font-medium">Project Hub</span>
        </div>
      </div>

      {/* Hero */}
      <section className="relative bg-[#0A1628] text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white opacity-20" />
        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm mb-6">
              <Shield className="w-4 h-4 text-[#FF6B00]" />
              <span>Trusted by 2,500+ project owners worldwide</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Your Vision,{" "}
              <span className="text-[#FF6B00]">Built by Experts</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl">
              From residential buildings to industrial complexes — create your project,
              let AI match you with the best professionals, and manage everything in one place.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/projects/create"
                className="inline-flex items-center gap-2 bg-[#FF6B00] hover:bg-[#E55A00] text-white font-semibold px-8 py-3.5 rounded-xl transition-all text-lg"
              >
                Start a Project <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/projects/my-projects"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-3.5 rounded-xl transition-all text-lg backdrop-blur-sm border border-white/20"
              >
                My Projects
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 -mt-10 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-6 text-center shadow-soft hover:shadow-medium transition-shadow">
              <stat.icon className="w-8 h-8 text-[#FF6B00] mx-auto mb-3" />
              <p className="text-2xl md:text-3xl font-bold text-[#0A1628]">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-[#0A1628] text-center mb-4">How It Works</h2>
        <p className="text-gray-500 text-center max-w-2xl mx-auto mb-12">
          From idea to execution in four simple steps. No complexity, no hidden fees.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {HOW_IT_WORKS.map((item) => (
            <div key={item.step} className="bg-white rounded-xl border border-gray-200 p-6 text-center shadow-soft hover:shadow-medium transition-all hover:-translate-y-1">
              <div className="w-12 h-12 bg-[#FF6B00]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <item.icon className="w-6 h-6 text-[#FF6B00]" />
              </div>
              <span className="text-xs font-bold text-[#FF6B00] tracking-widest">{item.step}</span>
              <h3 className="font-bold text-lg text-[#0A1628] mt-1 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Project Types */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0A1628] text-center mb-4">Project Types</h2>
          <p className="text-gray-500 text-center max-w-2xl mx-auto mb-12">
            From groundbreaking construction to specialized marine and energy projects.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PROJECT_TYPES.map((type) => (
              <Link
                key={type.label}
                href="/projects/create"
                className="group bg-gray-50 rounded-xl border border-gray-100 p-6 hover:shadow-medium hover:border-[#FF6B00]/30 transition-all hover:-translate-y-0.5"
              >
                <div className={`w-10 h-10 rounded-lg ${type.color} flex items-center justify-center mb-3`}>
                  <type.icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-[#0A1628] group-hover:text-[#FF6B00] transition-colors">{type.label}</h3>
                <p className="text-sm text-gray-500 mt-1">{type.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#0A1628] py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Bring Your Project to Life?
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of project owners who trust Kauvex to connect them with the best professionals.
          </p>
          <Link
            href="/projects/create"
            className="inline-flex items-center gap-2 bg-[#FF6B00] hover:bg-[#E55A00] text-white font-semibold px-10 py-4 rounded-xl transition-all text-lg"
          >
            Start Your Project <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-4 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-[#0A1628] text-center mb-12">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="font-semibold text-[#0A1628]">{faq.q}</span>
                {openFaq === i ? (
                  <ChevronUp className="w-5 h-5 text-[#FF6B00] flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
              </button>
              {openFaq === i && (
                <div className="px-5 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
