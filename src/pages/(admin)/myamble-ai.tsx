// src/app/(pages)/(admin)/myamble-ai/page.tsx
"use client";
// why do we have 2 AIAnalysis components?

import { useState } from "react";
import { Button } from "~/components/shadcn/button";

export default function MyAmbleAI() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalysis = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/myamble-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data);
      } else {
        throw new Error("Failed to perform analysis");
      }
    } catch (error) {
      console.error("Error performing analysis:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <h1 className="mb-4 text-2xl font-bold">MyAmble AI</h1>
      <Textarea
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter your analysis query..."
        className="mb-4"
        rows={4}
      />
      <Button onClick={handleAnalysis} disabled={loading}>
        {loading ? "Analyzing..." : "Analyze"}
      </Button>
      {results && (
        <div className="mt-8">
          <h2 className="mb-2 text-xl font-bold">Analysis Results:</h2>
          <pre className="overflow-x-auto rounded bg-gray-100 p-4">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
