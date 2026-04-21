"use client";

import { useState } from "react";
import {
  TrendingUp,
  MessageCircle,
  Heart,
  Share2,
  MapPin,
  ChevronRight,
  Hash,
  X,
  LayoutGrid,
  List,
  Search,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface TrendingPost {
  id: number;
  rank: number;
  username: string;
  handle: string;
  avatar: string;
  content: string;
  location: string;
  likes: number;
  comments: number;
  shares: number;
  tag: string;
  tagColor: "urgent" | "warning" | "nonurgent" | "safety" | "note" | "event" | "weather";
  timeAgo: string;
}

const POSTS: TrendingPost[] = [
  {
    id: 1,
    rank: 1,
    username: "Maya Chen",
    handle: "@mayaexplores",
    avatar: "MC",
    content: "The sunset from the old lighthouse is something else tonight. The whole coast turned gold.",
    location: "Cape Flattery, WA",
    likes: 14200,
    comments: 832,
    shares: 2100,
    tag: "#GoldenHour",
    tagColor: "event",
    timeAgo: "12m",
  },
  {
    id: 2,
    rank: 2,
    username: "Dev Torres",
    handle: "@devonthemap",
    avatar: "DT",
    content: "Just found an underground food market nobody talks about. 40 vendors, zero tourists. 🔥",
    location: "Brooklyn, NY",
    likes: 9870,
    comments: 1340,
    shares: 1600,
    tag: "#HiddenGem",
    tagColor: "note",
    timeAgo: "28m",
  },
  {
    id: 3,
    rank: 3,
    username: "Rina Nakamura",
    handle: "@rinawanders",
    avatar: "RN",
    content: "Cherry blossoms are at absolute peak right now. Come before the weekend crowd arrives.",
    location: "Portland, OR",
    likes: 8450,
    comments: 560,
    shares: 3200,
    tag: "#Sakura",
    tagColor: "event",
    timeAgo: "45m",
  },
  {
    id: 4,
    rank: 4,
    username: "Leo Okafor",
    handle: "@leoonthestreet",
    avatar: "LO",
    content: "Live music breaking out spontaneously at the plaza. This city never disappoints.",
    location: "Austin, TX",
    likes: 7620,
    comments: 412,
    shares: 980,
    tag: "#LiveMusic",
    tagColor: "event",
    timeAgo: "1h",
  },
  {
    id: 5,
    rank: 5,
    username: "Sasha Volkov",
    handle: "@sashalocal",
    avatar: "SV",
    content: "The new murals on 5th Avenue span an entire city block. Public art at its finest.",
    location: "Miami, FL",
    likes: 6100,
    comments: 290,
    shares: 750,
    tag: "#StreetArt",
    tagColor: "note",
    timeAgo: "2h",
  },
  {
    id: 6,
    rank: 6,
    username: "Priya Singh",
    handle: "@priyaroams",
    avatar: "PS",
    content: "Farmer's market has the best mangoes I've tasted outside of Jaipur. No exaggeration.",
    location: "San Francisco, CA",
    likes: 5340,
    comments: 178,
    shares: 440,
    tag: "#LocalFood",
    tagColor: "event",
    timeAgo: "3h",
  },
];

const TAG_COLORS: Record<string, string> = {
  urgent:    "tag-urgent",
  warning:   "tag-warning",
  nonurgent: "tag-nonurgent",
  safety:    "tag-safety",
  note:      "tag-note",
  event:     "tag-event",
  weather:   "tag-weather",
};

function formatNumber(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(n);
}

interface TrendingSidebarProps {
  open: boolean;
  onClose: () => void;
  activePost: number | null;
  onPostClick: (id: number) => void;
  posts?: TrendingPost[];
  onSearch: (query: string) => void | Promise<void>;
}

const SUGGESTIONS = [
  { type: "location", label: "New York, NY", sublabel: "United States" },
  { type: "location", label: "Boston, MA", sublabel: "Massachusetts" },
  { type: "trending", label: "#Urgent", sublabel: "4.2k posts today" },
  { type: "trending", label: "#Event", sublabel: "8.3k posts today" },
  { type: "recent", label: "Amherst, MA", sublabel: "Searched recently" },
  { type: "recent", label: "Portland, OR", sublabel: "Searched recently" },
];

export function TrendingSidebar({ open, onClose, activePost, onPostClick, posts = POSTS, onSearch, }: TrendingSidebarProps) {
  const [view, setView] = useState<"list" | "compact">("list");
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const filtered = posts;

  const suggestions = query
    ? SUGGESTIONS.filter((s) =>
        s.label.toLowerCase().includes(query.toLowerCase())
      )
    : SUGGESTIONS;

  const showDropdown = focused && suggestions.length > 0;

  const handleSubmit = async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
  
    await onSearch(trimmed);
    setFocused(false);
  };

  const iconFor = (type: string) => {
    if (type === "location") return <MapPin size={14} className="text-blue-500 shrink-0" />;
    if (type === "trending") return <TrendingUp size={14} className="text-orange-500 shrink-0" />;
    return <Clock size={14} className="text-gray-500 shrink-0" />;
  };

  return (
    <>
      {/* Backdrop (mobile) */}
      {open && (
        <div
          className="fixed inset-0 z-10 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 h-full z-20 flex flex-col",
          "w-[340px] transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full",
          "border-r border-border/50 bg-white shadow-lg"
        )}
        aria-label="Trending posts sidebar"
      >
        {/* Search bar in sidebar */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
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
                  placeholder="Search..."
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-gray-400 outline-none"
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

            {showDropdown && (
              <div
                className="absolute top-full mt-1 left-0 right-0 rounded-lg border border-gray-200 overflow-hidden py-1 bg-white shadow-md z-40"
                role="listbox"
                aria-label="Search suggestions"
              >
                {suggestions.slice(0, 4).map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 transition-colors text-left text-sm"
                    onMouseDown={() => {
                      setQuery(s.label);
                      handleSubmit(s.label);
                    }}
                    role="option"
                  >
                    {iconFor(s.type)}
                    <div>
                      <p className="text-sm text-foreground">{s.label}</p>
                      <p className="text-[11px] text-gray-500">{s.sublabel}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-md ml-2 md:hidden"
            aria-label="Close sidebar"
          >
            <X size={16} />
          </button>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-blue-500" aria-hidden="true" />
            <h2 className="font-semibold text-foreground text-sm">
              Trending
            </h2>
            <span className="text-sm bg-blue-100 text-blue-700 border border-blue-300 rounded-full px-2 py-0.5 font-mono">
              {filtered.length}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setView("list")}
              className={cn(
                "p-1.5 rounded-md transition-colors text-sm",
                view === "list"
                  ? "bg-gray-200 text-foreground"
                  : "text-gray-400 hover:text-foreground"
              )}
              aria-label="List view"
            >
              <List size={14} />
            </button>
            <button
              onClick={() => setView("compact")}
              className={cn(
                "p-1.5 rounded-md transition-colors text-sm",
                view === "compact"
                  ? "bg-gray-200 text-foreground"
                  : "text-gray-400 hover:text-foreground"
              )}
              aria-label="Compact view"
            >
              <LayoutGrid size={14} />
            </button>
          </div>
        </div>

        {/* Posts list */}
        <div className="flex-1 overflow-y-auto scrollbar-thin py-2">
          {filtered.map((post, idx) => (
            <PostCard
              key={post.id}
              post={post}
              compact={view === "compact"}
              active={activePost === post.id}
              onClick={() => onPostClick(post.id)}
              isLast={idx === filtered.length - 1}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-border/40">
          <p className="text-sm text-muted-foreground text-center">
            Updated live &bull; Powered by GeoFeed
          </p>
        </div>
      </aside>
    </>
  );
}

function PostCard({
  post,
  compact,
  active,
  onClick,
  isLast,
}: {
  post: TrendingPost;
  compact: boolean;
  active: boolean;
  onClick: () => void;
  isLast: boolean;
}) {
  if (compact) {
    return (
      <button
        onClick={onClick}
        className={cn(
          "w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors",
          active ? "bg-primary/10 border-l-2 border-primary" : "hover:bg-secondary/30 border-l-2 border-transparent"
        )}
      >
        <span className="text-sm font-mono text-muted-foreground w-5">#{post.rank}</span>
        <div
          className={cn(
            "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0",
            TAG_COLORS[post.tagColor]
          )}
        >
          {post.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{post.username}</p>
          <p className="text-[11px] text-muted-foreground truncate">{post.location}</p>
        </div>
        <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium", TAG_COLORS[post.tagColor])}>
          {formatNumber(post.likes)}
        </span>
      </button>
    );
  }

  return (
    <article>
      <button
        onClick={onClick}
        className={cn(
          "w-full text-left px-4 py-4 transition-colors",
          active
            ? "bg-primary/10 border-l-2 border-primary"
            : "hover:bg-secondary/20 border-l-2 border-transparent"
        )}
        aria-pressed={active}
      >
        {/* Top row */}
        <div className="flex items-start gap-3 mb-2">
          <span className="text-sm font-mono text-muted-foreground mt-1 w-4 shrink-0">
            {post.rank}
          </span>
          <div
            className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
              TAG_COLORS[post.tagColor]
            )}
            aria-hidden="true"
          >
            {post.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-foreground truncate">
                {post.username}
              </span>
              <span className="text-[11px] text-muted-foreground shrink-0">{post.timeAgo}</span>
            </div>
            <span className="text-sm text-muted-foreground">{post.handle}</span>
          </div>
        </div>

        {/* Content */}
        <p className="text-sm text-foreground/80 leading-relaxed mb-2.5 ml-7 line-clamp-2">
          {post.content}
        </p>

        {/* Location + tag */}
        <div className="flex items-center gap-2 mb-2.5 ml-7">
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <MapPin size={11} aria-hidden="true" />
            {post.location}
          </div>
          <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium", TAG_COLORS[post.tagColor])}>
            <Hash size={9} className="inline -mt-px mr-0.5" aria-hidden="true" />
            {post.tag.replace("#", "")}
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 ml-7">
          <StatItem icon={<Heart size={11} />} value={formatNumber(post.likes)} />
          <StatItem icon={<MessageCircle size={11} />} value={formatNumber(post.comments)} />
          <StatItem icon={<Share2 size={11} />} value={formatNumber(post.shares)} />
          <ChevronRight size={12} className="ml-auto text-muted-foreground/40" aria-hidden="true" />
        </div>
      </button>
      {!isLast && <div className="h-px bg-border/30 mx-4" />}
    </article>
  );
}

function StatItem({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
      <span aria-hidden="true">{icon}</span>
      {value}
    </div>
  );
}
