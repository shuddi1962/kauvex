"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Mic, Sparkles, TrendingUp, History } from "lucide-react";

const suggestions = [
  "marine engines under $500",
  "gaming laptops with RTX graphics",
  "best smartphones with good camera",
  "fishing equipment near me",
  "boat parts for Yamaha",
  "wireless headphones noise cancelling",
  "smart home security systems",
  "laptop for programming under $1000",
];

export default function SmartSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isAiSearch, setIsAiSearch] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("kauvex-recent-searches");
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const saveSearch = (q: string) => {
    const updated = [q, ...recentSearches.filter((s) => s !== q)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("kauvex-recent-searches", JSON.stringify(updated));
  };

  const handleSearch = (q: string) => {
    if (!q.trim()) return;
    saveSearch(q.trim());
    const params = new URLSearchParams({ q: q.trim() });
    if (isAiSearch) params.set("ai", "true");
    router.push(`/search?${params.toString()}`);
    setIsFocused(false);
  };

  const handleVoiceSearch = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Voice search is not supported in your browser. Try Chrome or Edge.");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;

    setIsListening(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      setIsListening(false);
      handleSearch(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const filteredSuggestions = query
    ? suggestions.filter((s) => s.toLowerCase().includes(query.toLowerCase()))
    : suggestions;

  return (
    <div className="flex-1 max-w-2xl relative" ref={searchRef}>
      <div className={`flex items-center rounded-lg border-2 transition-all overflow-hidden ${
        isFocused ? "border-orange shadow-lg shadow-orange/10" : "border-orange/20"
      }`}>
        <div className="relative flex-1 flex items-center">
          <Search size={16} className="absolute left-3 text-text-4" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch(query)}
            placeholder={isListening ? "Listening..." : 'Search products, brands, vendors... or try "marine engines under $500"'}
            className="w-full h-11 pl-9 pr-9 bg-transparent text-sm text-text-1 placeholder:text-text-4 focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} className="p-1 absolute right-1 hover:bg-gray-100 rounded transition-colors">
              <X size={14} className="text-text-4" />
            </button>
          )}
        </div>

        <button
          onClick={handleVoiceSearch}
          className={`h-11 px-3 transition-colors ${isListening ? "bg-red text-white" : "hover:bg-gray-100"}`}
          title="Voice search"
        >
          <Mic size={16} className={isListening ? "text-white animate-pulse" : "text-text-4"} />
        </button>

        <button
          onClick={() => setIsAiSearch(!isAiSearch)}
          className={`h-11 px-3 transition-colors ${isAiSearch ? "bg-purple-100 text-purple-700" : "hover:bg-gray-100"}`}
          title="AI-powered search"
        >
          <Sparkles size={16} className={isAiSearch ? "text-purple-700" : "text-text-4"} />
        </button>

        <button
          onClick={() => handleSearch(query)}
          className="bg-orange hover:bg-orange/90 h-11 px-6 transition-colors flex items-center gap-2 shrink-0"
        >
          <Search size={16} className="text-white" />
        </button>
      </div>

      {isFocused && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-strong border border-border z-50 overflow-hidden">
          {isAiSearch && (
            <div className="px-4 py-3 bg-purple-50 border-b border-purple-100 flex items-center gap-2">
              <Sparkles size={14} className="text-purple-700" />
              <span className="text-xs text-purple-700 font-medium">AI search enabled — natural language understanding active</span>
            </div>
          )}

          {isListening && (
            <div className="px-4 py-8 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2 animate-pulse">
                <Mic size={20} className="text-red" />
              </div>
              <p className="text-sm text-text-4">Listening... Speak your search query</p>
            </div>
          )}

          {!isListening && (
            <div className="max-h-[400px] overflow-y-auto">
              {recentSearches.length > 0 && (
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-[10px] text-text-4 font-semibold uppercase tracking-wider flex items-center gap-1 mb-2">
                    <History size={12} /> Recent Searches
                  </p>
                  <div className="space-y-1">
                    {recentSearches.map((s) => (
                      <button key={s} onClick={() => handleSearch(s)}
                        className="block w-full text-left text-xs text-text-2 hover:text-orange py-1 transition-colors">
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="px-4 py-3">
                <p className="text-[10px] text-text-4 font-semibold uppercase tracking-wider flex items-center gap-1 mb-2">
                  <TrendingUp size={12} /> Suggestions
                </p>
                <div className="space-y-1">
                  {filteredSuggestions.map((s) => (
                    <button key={s} onClick={() => { setQuery(s); handleSearch(s); }}
                      className="block w-full text-left text-xs text-text-2 hover:text-orange py-1 transition-colors">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
