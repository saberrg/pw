"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/_components/ui/select";
import { Search, X, Filter, ChevronDown, ChevronUp } from "lucide-react";

interface NotesFilterProps {
  pdfOptions: { id: string; title: string }[];
  currentPdf?: string;
  currentSearch?: string;
}

export function NotesFilter({
  pdfOptions,
  currentPdf,
  currentSearch,
}: NotesFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(currentSearch || "");
  const [selectedPdf, setSelectedPdf] = useState(currentPdf || "all");
  const [isExpanded, setIsExpanded] = useState(false);

  // Sync state with URL on mount
  useEffect(() => {
    setSearchQuery(currentSearch || "");
    setSelectedPdf(currentPdf || "all");
  }, [currentSearch, currentPdf]);

  // Update URL with filters
  const updateFilters = useCallback(
    (pdf: string, search: string) => {
      const params = new URLSearchParams();
      
      if (pdf && pdf !== "all") {
        params.set("pdf", pdf);
      }
      
      if (search.trim()) {
        params.set("q", search.trim());
      }

      const queryString = params.toString();
      router.push(queryString ? `/notes?${queryString}` : "/notes");
    },
    [router]
  );

  // Debounced search
  const debouncedSearch = useDebouncedCallback((value: string) => {
    updateFilters(selectedPdf, value);
  }, 300);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSearch(value);
  };

  const handlePdfChange = (value: string) => {
    setSelectedPdf(value);
    updateFilters(value, searchQuery);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedPdf("all");
    router.push("/notes");
  };

  const hasActiveFilters = selectedPdf !== "all" || searchQuery.trim().length > 0;

  return (
    <div className="mb-6 space-y-4">
      {/* Mobile: Collapsible filter section */}
      <div className="sm:hidden">
        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full justify-between"
        >
          <span className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter Notes
            {hasActiveFilters && (
              <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                {(selectedPdf !== "all" ? 1 : 0) + (searchQuery.trim() ? 1 : 0)}
              </span>
            )}
          </span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>

        {isExpanded && (
          <div className="mt-3 space-y-3 p-4 border rounded-lg bg-muted/30">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-9"
              />
            </div>

            {/* PDF Filter */}
            <Select value={selectedPdf} onValueChange={handlePdfChange}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by PDF" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All PDFs</SelectItem>
                {pdfOptions.map((pdf) => (
                  <SelectItem key={pdf.id} value={pdf.id}>
                    {pdf.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="w-full"
              >
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Desktop: Inline filters */}
      <div className="hidden sm:flex items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-9"
          />
        </div>

        {/* PDF Filter */}
        <Select value={selectedPdf} onValueChange={handlePdfChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by PDF" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All PDFs</SelectItem>
            {pdfOptions.map((pdf) => (
              <SelectItem key={pdf.id} value={pdf.id}>
                {pdf.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={handleClearFilters}>
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        )}
      </div>

      {/* Active filter pills */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {selectedPdf !== "all" && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-secondary text-secondary-foreground text-xs">
              PDF: {pdfOptions.find((p) => p.id === selectedPdf)?.title || selectedPdf}
              <button
                onClick={() => handlePdfChange("all")}
                className="hover:bg-secondary-foreground/10 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {searchQuery.trim() && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-secondary text-secondary-foreground text-xs">
              Search: &quot;{searchQuery}&quot;
              <button
                onClick={() => {
                  setSearchQuery("");
                  updateFilters(selectedPdf, "");
                }}
                className="hover:bg-secondary-foreground/10 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}




