"use client";

import { useState } from "react";
import Container from "@/app/_components/container";
import QuickRefList from "@/app/_components/quick-ref-list";
import QuickRefFormWrapper from "@/app/_components/quick-ref-form-wrapper";
import { Input } from "@/app/_components/ui/input";

export default function QuickRefPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const handleFormSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <main>
      <Container>
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">
            Quick References
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            A collection of quick references and useful links.
          </p>
        </div>
        
        {/* Search Input */}
        <div className="mb-6">
          <Input
            type="text"
            placeholder="Search references by name, content, tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        
        <QuickRefFormWrapper onSuccess={handleFormSuccess} />
        
        <QuickRefList 
          refreshTrigger={refreshTrigger}
          searchQuery={searchQuery}
        />
      </Container>
    </main>
  );
}
