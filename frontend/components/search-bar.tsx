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
  onMenuClick: () => void;
  sidebarOpen: boolean;
}

export function SearchBar({ onMenuClick, sidebarOpen }: SearchBarProps) {
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

  return (
    <div className="absolute top-4 left-0 right-0 z-30 flex items-center gap-3 px-4 pointer-events-none">
      {/* Sidebar toggle */}
      <button
        onClick={onMenuClick}
        className={cn(
          "pointer-events-auto flex items-center justify-center w-10 h-10 rounded-xl border transition-all duration-200 shrink-0",
          "border-border/50 text-foreground hover:bg-secondary/60",
          sidebarOpen ? "bg-primary/20 border-primary/40" : "border-border/50"
        )}
        style={{
          background: sidebarOpen
            ? "oklch(0.65 0.18 200 / 0.15)"
            : "oklch(0.12 0.008 240 / 0.85)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
        aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        aria-expanded={sidebarOpen}
      >
        <Menu size={18} aria-hidden="true" />
      </button>

      {/* Search field */}
      <div className="pointer-events-auto flex-1 max-w-xl relative">
        <div
          className={cn(
            "flex items-center gap-2 h-10 px-3 rounded-xl border transition-all duration-200",
            focused
              ? "border-primary/60 ring-1 ring-primary/20"
              : "border-border/50"
          )}
          style={{
            background: "oklch(0.12 0.008 240 / 0.88)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
          }}
        >
          <Search
            size={16}
            className={cn(
              "shrink-0 transition-colors",
              focused ? "text-primary" : "text-muted-foreground"
            )}
            aria-hidden="true"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            placeholder="Search locations, tags, events..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            aria-label="Search locations, tags, or events"
            autoComplete="off"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Dropdown */}
        {showDropdown && (
          <div
            className="absolute top-full mt-2 left-0 right-0 rounded-xl border border-border/50 overflow-hidden py-1"
            style={{
              background: "oklch(0.12 0.008 240 / 0.95)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
            }}
            role="listbox"
            aria-label="Search suggestions"
          >
            {filtered.slice(0, 5).map((s, i) => (
              <button
                key={i}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-secondary/40 transition-colors text-left"
                onMouseDown={() => {
                  setQuery(s.label);
                  setFocused(false);
                }}
                role="option"
              >
                {iconFor(s.type)}
                <div>
                  <p className="text-sm text-foreground">{s.label}</p>
                  <p className="text-xs text-muted-foreground">{s.sublabel}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Live indicator */}
      <div
        className="pointer-events-auto flex items-center gap-2 h-10 px-3 rounded-xl border border-border/50 shrink-0"
        style={{
          background: "oklch(0.12 0.008 240 / 0.85)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" aria-hidden="true" />
        <span className="text-xs text-foreground font-medium hidden sm:inline">Live</span>
      </div>
    </div>
  );
}
