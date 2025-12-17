"use client";

import { useState } from "react";
import { PdfWithProgress } from "../page";
import { SearchBar } from "./search-bar";
import { LibraryGrid } from "./library-grid";

interface LibraryContentProps {
  pdfs: PdfWithProgress[];
}

export function LibraryContent({ pdfs }: LibraryContentProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPdfs = pdfs.filter((pdf) =>
    pdf.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <SearchBar value={searchQuery} onChange={setSearchQuery} />

      {filteredPdfs.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-muted-foreground">
            <svg
              className="mx-auto h-10 w-10 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <p className="text-lg font-medium">No results found</p>
            <p className="text-sm">
              No PDFs match &quot;{searchQuery}&quot;. Try a different search.
            </p>
          </div>
        </div>
      ) : (
        <LibraryGrid pdfs={filteredPdfs} />
      )}
    </div>
  );
}
