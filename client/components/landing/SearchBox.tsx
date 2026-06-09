"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Loader2 } from "lucide-react";
import { searchOrgs } from "@/modules/auth/api";
import type { OrgPublic } from "@/modules/auth/types";
import { cn } from "@/lib/utils";

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export function SearchBox() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<OrgPublic[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    searchOrgs(debouncedQuery)
      .then((orgs) => {
        if (!cancelled) {
          setResults(orgs);
          setOpen(orgs.length > 0);
          setActiveIndex(-1);
        }
      })
      .catch(() => {
        if (!cancelled) setResults([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  function handleSelect(org: OrgPublic) {
    setOpen(false);
    setQuery("");
    router.push(`/${org.slug}/login`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(results[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        inputRef.current &&
        !inputRef.current.closest("[data-searchbox]")?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative w-full max-w-md" data-searchbox>
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          id="pg-search"
          type="text"
          autoComplete="off"
          placeholder="Search your PG or hostel name…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setOpen(true)}
          aria-label="Search PG or hostel"
          aria-autocomplete="list"
          aria-controls="pg-search-results"
          aria-activedescendant={activeIndex >= 0 ? `pg-result-${activeIndex}` : undefined}
          className={cn(
            "w-full h-12 pl-10 pr-10 rounded-lg border border-border bg-background",
            "text-sm text-foreground placeholder:text-muted-foreground",
            "outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
            "shadow-sm"
          )}
        />
        {loading && (
          <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
        )}
      </div>

      {/* Dropdown */}
      {open && results.length > 0 && (
        <ul
          id="pg-search-results"
          ref={listRef}
          role="listbox"
          className={cn(
            "absolute z-50 top-full mt-1.5 w-full",
            "bg-popover border border-border rounded-lg shadow-lg overflow-hidden"
          )}
        >
          {results.map((org, i) => (
            <li
              key={org.id}
              id={`pg-result-${i}`}
              role="option"
              aria-selected={i === activeIndex}
              onMouseDown={() => handleSelect(org)}
              onMouseEnter={() => setActiveIndex(i)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 cursor-pointer",
                "text-sm text-popover-foreground",
                i === activeIndex
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent/60"
              )}
            >
              {/* Logo or placeholder */}
              <div className="flex-shrink-0 w-8 h-8 rounded-md overflow-hidden bg-muted flex items-center justify-center border border-border">
                {org.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={org.logo_url}
                    alt={org.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-semibold text-muted-foreground select-none">
                    {org.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              {/* Name + location */}
              <div className="min-w-0">
                <p className="font-medium truncate">{org.name}</p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground truncate">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  {org.city_state}
                </p>
              </div>

              {/* Brand color dot */}
              {org.brand_color && (
                <div
                  className="ml-auto flex-shrink-0 w-2.5 h-2.5 rounded-full border border-border"
                  style={{ backgroundColor: org.brand_color }}
                  aria-hidden="true"
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
