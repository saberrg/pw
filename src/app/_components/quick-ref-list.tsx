"use client";

import { useEffect, useState } from "react";
import { QuickRef } from "@/interfaces/quickref";
import QuickRefAccordionItem from "./quick-ref-accordion-item";
import { getAllQuickRefsClient } from "@/lib/api-client";
import { Accordion } from "@/app/_components/ui/accordion";

interface QuickRefListProps {
  initialQuickRefs?: QuickRef[];
  refreshTrigger?: number;
  searchQuery?: string;
}

export default function QuickRefList({ 
  initialQuickRefs = [], 
  refreshTrigger,
  searchQuery = ""
}: QuickRefListProps) {
  const [quickRefs, setQuickRefs] = useState<QuickRef[]>(initialQuickRefs);
  const [loading, setLoading] = useState(false);

  const fetchQuickRefs = async () => {
    setLoading(true);
    try {
      const data = await getAllQuickRefsClient();
      setQuickRefs(data);
    } catch (error) {
      console.error("Error fetching quick refs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuickRefs();
  }, [refreshTrigger]);

  const handleUpdate = () => {
    fetchQuickRefs();
  };

  // Filter quick refs based on search query
  const filteredQuickRefs = quickRefs.filter((quickRef) => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    const name = quickRef.name?.toLowerCase() || "";
    const content = quickRef.content?.toLowerCase() || "";
    const tag = quickRef.tag?.toLowerCase() || "";
    const link = quickRef.link?.toLowerCase() || "";
    
    return (
      name.includes(query) ||
      content.includes(query) ||
      tag.includes(query) ||
      link.includes(query)
    );
  });

  if (loading && quickRefs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">Loading...</p>
      </div>
    );
  }

  if (quickRefs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">
          No quick references yet. Be the first to create one!
        </p>
      </div>
    );
  }

  if (filteredQuickRefs.length === 0 && searchQuery) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">
          No results found for "{searchQuery}"
        </p>
      </div>
    );
  }

  return (
    <Accordion type="single" collapsible className="w-full">
      {filteredQuickRefs.map((quickRef) => (
        <QuickRefAccordionItem
          key={quickRef.id}
          quickRef={quickRef}
          onUpdate={handleUpdate}
        />
      ))}
    </Accordion>
  );
}


