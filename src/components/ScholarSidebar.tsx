'use client';

import { useState } from "react";

interface Paper {
  title: string;
  summary: string;
  link: string;
  // adapt fields if your backend sends different keys
}

interface ScholarSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function ScholarSidebar({ isOpen = true, onClose }: ScholarSidebarProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Paper[]>([]);
  const [error, setError] = useState<string | null>(null);

// inside ScholarSidebar.tsx — replace existing runSearch with the code below
const runSearch = async () => {
  if (!query.trim()) return;
  setLoading(true);
  setError(null);
  setResults([]);

  try {
    // 1) Try local content search first
    const searchUrl = `${API_BASE}/api/feeds/search/${encodeURIComponent(query)}`;
    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) {
      const txt = await searchRes.text();
      console.warn('Local search failed:', searchRes.status, txt);
    }
    const searchData = (await searchRes.json()) || [];

    let papersForAgent = (searchData || []).map((a: any) => ({
      title: a.title || "",
      abstract: a.snippet || a.content || "",
      url: a.url || a.link || ""
    }));

    // 2) If local search returned nothing, fall back to Semantic Scholar endpoint
    if (!papersForAgent.length) {
      console.log('No local results — falling back to /api/search (Semantic Scholar)');
      const remoteRes = await fetch(`${API_BASE}/api/search?q=${encodeURIComponent(query)}&top_k=8`);
      if (!remoteRes.ok) {
        const txt = await remoteRes.text();
        throw new Error(`Remote search failed: ${remoteRes.status} ${txt}`);
      }
      const remoteJson = await remoteRes.json();
      // /api/search returns { results: [ { title, summary, link } ] }
      const remoteResults = remoteJson.results || [];
      papersForAgent = remoteResults.map((p: any) => ({
        title: p.title || "",
        abstract: p.summary || p.abstract || "",
        url: p.link || p.url || ""
      }));
    }

    if (!papersForAgent.length) {
      setError('No papers found locally or remotely for that query.');
      return;
    }

    // 3) Call scholar-agent to summarize the papers (LLM)
    const agentRes = await fetch(`${API_BASE}/api/scholar-agent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_prompt: query,
        papers: papersForAgent
      }),
    });
    if (!agentRes.ok) {
      const txt = await agentRes.text();
      throw new Error(`Scholar Agent failed: ${agentRes.status} ${txt}`);
    }
    const agentData = await agentRes.json();
    const agentResults = agentData.results ?? agentData ?? [];

    // Normalize results for UI
    const normalized: Paper[] = (Array.isArray(agentResults) ? agentResults : [])
      .map((r: any) => ({
        title: r.title || r.name || r.title_text || "Untitled",
        summary: r.summary || r.abstract || (r.snippet && String(r.snippet).slice(0, 300)) || "",
        link: r.link || r.url || r.pdf || ""
      }));

    setResults(normalized);
  } catch (err: any) {
    console.error(err);
    setError(err.message || "Something went wrong");
  } finally {
    setLoading(false);
  }
};

  if (!isOpen) return null;

  return (
    <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Scholar</h2>
        <button
          onClick={() => onClose?.()}
          className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
          title="Close Scholar"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-3">
        <div className="flex gap-2 mb-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runSearch()}
            placeholder="Search research papers..."
            className="flex-1 border rounded px-2 py-1 text-sm"
          />
          <button
            onClick={runSearch}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
          >
            Search
          </button>
        </div>
        {loading && <p className="text-sm text-gray-500">Searching…</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>

      <div className="overflow-y-auto flex-1 p-3 space-y-3">
        {results.map((paper, idx) => (
          <div key={idx} className="p-2 border rounded bg-gray-50">
            <h3 className="font-medium text-sm">{paper.title}</h3>
            <p className="text-xs text-gray-700 mt-1">{paper.summary}</p>
            <a
              href={paper.link}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-600 mt-2 inline-block"
            >
              Open Paper
            </a>
          </div>
        ))}

        {!loading && results.length === 0 && (
          <p className="text-xs text-gray-400">No results yet — try searching.</p>
        )}
      </div>
    </div>
  );
}
