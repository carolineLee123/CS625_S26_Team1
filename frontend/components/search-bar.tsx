"use client";

import { useState } from "react";
import { Search, X, MapPin, TrendingUp, Clock, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  { type: "location", label: "New York, NY", sublabel: "United States" },
  { type: "location", label: "Tokyo, Japan", sublabel: "Asia Pacific" },
  { type: "trending", label: "#GoldenHour", sublabel: "14.2k posts today" },
  { type: "trending", label: "#HiddenGem", sublabel: "9.8k posts today" },
  { type: "recent", label: "Brooklyn, NY", sublabel: "Searched recently" },
  { type: "recent", label: "Portland, OR", sublabel: "Searched recently" },
];

interface SearchBarProps {
  onMenuClick?: () => void;
  sidebarOpen?: boolean;
  onSearch: (query: string) => void | Promise<void>;
  placeholder?: string;
  showMenuButton?: boolean;
  compact?: boolean;
}

export function SearchBar({ onMenuClick, sidebarOpen, onSearch }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const filtered = query
    ? SUGGESTIONS.filter((s) =>
        s.label.toLowerCase().includes(query.toLowerCase())
      )
    : SUGGESTIONS;

  const showDropdown = focused && filtered.length > 0;

  const iconFor = (type: string) => {
    if (type === "location") return <MapPin size={14} className="text-teal-400 shrink-0" />;
    if (type === "trending") return <TrendingUp size={14} className="text-amber-400 shrink-0" />;
    return <Clock size={14} className="text-muted-foreground shrink-0" />;
  };

  const handleSubmit = async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    await onSearch(trimmed);
    setFocused(false);
  };

  return (
    <div className="flex-1 relative">
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(query);
      }}
    >
      <div
        className={cn(
          "flex items-center gap-2 h-9 px-3 rounded-lg border transition-all duration-200",
          focused
            ? "border-blue-400 ring-1 ring-blue-200"
            : "border-gray-200 bg-gray-50"
        )}
      >
        <Search
          size={14}
          className={cn(
            "shrink-0 transition-colors",
            focused ? "text-blue-500" : "text-gray-400"
          )}
          aria-hidden="true"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder={"Search..."}
          className="flex-1 bg-transparent text-xs text-foreground placeholder:text-gray-400 outline-none"
          aria-label="Search locations or tags"
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Clear search"
          >
            <X size={12} />
          </button>
        )}
      </div>
    </form>
  </div>
  );
}