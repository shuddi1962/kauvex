"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search, BookOpen, Clock, CheckCircle2, GraduationCap,
  Filter, Brain, ChevronRight, Play, FileText, Sliders,
  Sparkles, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import VendorShell from "@/components/vendor/vendor-shell";

const TOPICS = [
  { name: "Send products to Kauvex", icon: "📦", count: 12 },
  { name: "List products", icon: "📋", count: 8 },
  { name: "Prepare to sell", icon: "📝", count: 10 },
  { name: "Fulfill orders", icon: "🚚", count: 6 },
  { name: "Account Health", icon: "❤️", count: 5 },
  { name: "Intro to listing", icon: "📖", count: 4 },
  { name: "Advertise", icon: "📢", count: 9 },
  { name: "Manage inventory", icon: "📊", count: 7 },
  { name: "Analyze performance", icon: "📈", count: 6 },
];

interface Course {
  id: string;
  title: string;
  description: string;
  topic: string;
  duration: string;
  completed: boolean;
  thumbnail: string;
  lessons: number;
}

const MOCK_COURSES: Course[] = [
  {
    id: "1",
    title: "Send to Kauvex - Workflow overview",
    description: "Learn the end-to-end process of sending your inventory to Kauvex fulfillment centers, from prep to shipment.",
    topic: "Send products to Kauvex",
    duration: "45 min",
    completed: true,
    thumbnail: "📦",
    lessons: 6,
  },
  {
    id: "2",
    title: "Intro to listing products",
    description: "Understand the basics of creating product listings that convert, including titles, images, and descriptions.",
    topic: "List products",
    duration: "30 min",
    completed: true,
    thumbnail: "📋",
    lessons: 4,
  },
  {
    id: "3",
    title: "Learn what you need before you list products",
    description: "Essential requirements and best practices to prepare before publishing your first product listing.",
    topic: "Prepare to sell",
    duration: "20 min",
    completed: false,
    thumbnail: "📝",
    lessons: 3,
  },
  {
    id: "4",
    title: "FBA vs FBM: Which fulfillment method is right for you?",
    description: "Compare Fulfilled by Kauvex vs Merchant Fulfilled to decide the best strategy for your business.",
    topic: "Fulfill orders",
    duration: "25 min",
    completed: false,
    thumbnail: "🚚",
    lessons: 4,
  },
  {
    id: "5",
    title: "Understanding Account Health metrics",
    description: "Monitor your Order Defect Rate, cancellation rate, and late shipment rate to maintain a healthy account.",
    topic: "Account Health",
    duration: "35 min",
    completed: false,
    thumbnail: "❤️",
    lessons: 5,
  },
  {
    id: "6",
    title: "Creating compelling product listings",
    description: "Advanced techniques for writing titles, bullet points, and descriptions that drive conversions.",
    topic: "Intro to listing",
    duration: "40 min",
    completed: false,
    thumbnail: "📖",
    lessons: 6,
  },
  {
    id: "7",
    title: "Sponsored Products campaign setup",
    description: "Step-by-step guide to launching your first Sponsored Products advertising campaign on Kauvex.",
    topic: "Advertise",
    duration: "50 min",
    completed: false,
    thumbnail: "📢",
    lessons: 7,
  },
  {
    id: "8",
    title: "Inventory forecasting and replenishment",
    description: "Use data-driven insights to predict demand and keep your best-selling items in stock.",
    topic: "Manage inventory",
    duration: "30 min",
    completed: false,
    thumbnail: "📊",
    lessons: 4,
  },
];

const LEARNING_PREFERENCES = [
  "Beginner (new to selling online)",
  "Intermediate (some experience)",
  "Advanced (experienced seller)",
  "Video tutorials",
  "Written guides",
  "Interactive quizzes",
];

export default function VendorUniversityPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<string[]>([]);

  const handleTogglePreference = (pref: string) => {
    setPreferences((prev) =>
      prev.includes(pref)
        ? prev.filter((p) => p !== pref)
        : [...prev, pref]
    );
  };

  const filteredCourses = MOCK_COURSES.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTopic = !selectedTopic || c.topic === selectedTopic;
    return matchesSearch && matchesTopic;
  });

  const completedCount = MOCK_COURSES.filter((c) => c.completed).length;

  return (
    <VendorShell
      title="Kauvex Seller University"
      subtitle="Learn how to grow your business on Kauvex"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl p-6 text-white">
          <h2 className="text-lg font-bold mb-1">
            Welcome to Kauvex Seller University
          </h2>
          <p className="text-sm text-purple-200 mb-4">
            Learn how to grow your business on Kauvex
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 max-w-md">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-300"
              />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What do you want to learn?"
                className="w-full h-10 pl-10 pr-4 text-sm text-gray-900 bg-white rounded-lg placeholder:text-gray-400"
              />
            </div>
            <Button
              variant="secondary"
              className="bg-white text-purple-700 hover:bg-purple-50"
              onClick={() => setSelectedTopic(null)}
            >
              <BookOpen size={14} className="mr-1.5" />
              Browse All Topics
            </Button>
            <button
              onClick={() => setShowPreferences(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <Sliders size={14} />
              Customize Your Learning
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm text-gray-500">
          <GraduationCap size={16} className="text-purple-600" />
          <span>
            {completedCount} of {MOCK_COURSES.length} lessons completed
          </span>
          <div className="flex-1 h-2 bg-gray-100 rounded-full max-w-xs">
            <div
              className="h-2 bg-purple-600 rounded-full transition-all"
              style={{
                width: `${(completedCount / MOCK_COURSES.length) * 100}%`,
              }}
            />
          </div>
        </div>

        <div className="flex gap-6">
          <div className="hidden lg:block w-56 shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Topic Categories
              </h3>
              <div className="space-y-1">
                {TOPICS.map((t) => (
                  <button
                    key={t.name}
                    onClick={() =>
                      setSelectedTopic(
                        selectedTopic === t.name ? null : t.name
                      )
                    }
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${
                      selectedTopic === t.name
                        ? "bg-purple-50 text-purple-700 font-semibold"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span className="mr-2">{t.icon}</span>
                    {t.name}
                    <span className="float-right text-[10px] text-gray-400">
                      {t.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-4">
            {filteredCourses.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <BookOpen size={32} className="mx-auto text-gray-200 mb-2" />
                <p className="text-sm text-gray-400">
                  No courses match your search
                </p>
              </div>
            ) : (
              filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-xl border border-gray-200 p-4 flex items-start gap-4 hover:border-gray-300 transition-colors cursor-pointer"
                >
                  <div className="w-14 h-14 rounded-xl bg-purple-50 flex items-center justify-center text-2xl shrink-0">
                    {course.thumbnail}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-gray-900">
                            {course.title}
                          </h4>
                          {course.completed && (
                            <span className="flex items-center gap-1 text-[10px] text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full font-medium">
                              <CheckCircle2 size={10} />
                              Completed
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {course.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1 text-[10px] text-gray-400">
                        <FileText size={11} />
                        {course.lessons} lessons
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-gray-400">
                        <Clock size={11} />
                        {course.duration}
                      </span>
                      <span className="text-[10px] text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-full">
                        {course.topic}
                      </span>
                    </div>
                  </div>
                  <button className="shrink-0 w-9 h-9 rounded-lg bg-purple-600 text-white flex items-center justify-center hover:bg-purple-700 transition-colors">
                    <Play size={15} fill="currentColor" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showPreferences && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
          onClick={() => setShowPreferences(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <Brain size={18} className="text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Customize Your Learning</h3>
                <p className="text-xs text-gray-400">
                  Select your preferences for a personalized feed
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {LEARNING_PREFERENCES.map((pref) => (
                <button
                  key={pref}
                  onClick={() => handleTogglePreference(pref)}
                  className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-all ${
                    preferences.includes(pref)
                      ? "border-purple-600 bg-purple-50 text-purple-700"
                      : "border-gray-200 text-gray-600 hover:border-purple-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{pref}</span>
                    {preferences.includes(pref) && (
                      <CheckCircle2 size={16} className="text-purple-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-2 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowPreferences(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  setShowPreferences(false);
                }}
              >
                <Sparkles size={14} className="mr-1" /> Apply Preferences
              </Button>
            </div>
          </div>
        </div>
      )}
    </VendorShell>
  );
}
