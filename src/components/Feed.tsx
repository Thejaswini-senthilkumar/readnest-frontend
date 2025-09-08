'use client';

import { useEffect, useState } from 'react';

interface Article {
  id: string;
  title: string;
  source: string;
  snippet: string;
  date: string;
  type: 'rss' | 'pdf';
  url?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

export default function Feed() {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showAddFeed, setShowAddFeed] = useState(false);
  const [rssUrl, setRssUrl] = useState('');
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch articles from backend
  const fetchArticles = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/feeds`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
      const data = await res.json();
      // assume data is Article[]
      setArticles(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load feeds');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
    // optionally set up polling or websockets for real-time updates
  }, []);

  // Simple URL validation for RSS
  const isValidUrl = (u: string) => {
    try {
      const parsed = new URL(u);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleAddFeed = async () => {
    if (!rssUrl.trim() || !isValidUrl(rssUrl.trim())) {
      setError('Please enter a valid URL (https://...)');
      return;
    }
    setAdding(true);
    setError(null);

    // optimistic UI: add a temporary article/placeholder so UX feels snappy
    const tempItem: Article = {
      id: `temp-${Date.now()}`,
      title: `Adding feed: ${rssUrl}`,
      source: 'Adding…',
      snippet: '',
      date: new Date().toISOString().slice(0, 10),
      type: 'rss',
      url: rssUrl
    };
    setArticles((prev) => [tempItem, ...prev]);
    setRssUrl('');
    setShowAddFeed(false);

    try {
      const res = await fetch(`${API_BASE}/feeds`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: rssUrl.trim() })
      });
      if (!res.ok) {
        // revert optimistic update on failure
        setArticles((prev) => prev.filter((a) => a.id !== tempItem.id));
        const txt = await res.text();
        throw new Error(txt || `Add feed failed: ${res.status}`);
      }
      const created = await res.json();
      // replace the temp item with the real created feed/article returned by backend
      setArticles((prev) => {
        return prev.map((a) => (a.id === tempItem.id ? created : a));
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to add feed');
    } finally {
      setAdding(false);
    }
  };

  const handleArticleClick = (article: Article) => {
    setSelectedArticle(article);
  };

  return (
    <div className="h-full flex">
      <div className={`${selectedArticle ? 'w-1/3' : 'w-full'} border-r border-gray-200 dark:border-gray-700 flex flex-col`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Feed</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddFeed(!showAddFeed)}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                + Add RSS Feed
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              >
                list
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              >
                grid
              </button>
            </div>
          </div>

          {showAddFeed && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <input
                  type="url"
                  value={rssUrl}
                  onChange={(e) => setRssUrl(e.target.value)}
                  placeholder="Enter RSS feed URL (e.g., https://example.com/feed.xml)"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleAddFeed}
                  disabled={!rssUrl.trim() || adding}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {adding ? 'Adding…' : 'Add Feed'}
                </button>
                <button
                  onClick={() => {
                    setShowAddFeed(false);
                    setRssUrl('');
                    setError(null);
                  }}
                  className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Popular RSS feeds: TechCrunch, Ars Technica, The Verge, etc.</p>
              {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading feeds…</div>
          ) : viewMode === 'list' ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {articles.map((article) => (
                <div
                  key={article.id}
                  onClick={() => handleArticleClick(article)}
                  className={`p-4 cursor-pointer transition-colors ${selectedArticle?.id === article.id ? 'bg-blue-50 dark:bg-blue-900/20 border-r-2 border-blue-500' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${article.type === 'rss' ? 'bg-green-500' : 'bg-blue-500'}`} />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">{article.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{article.source} • {article.date}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-2 line-clamp-2">{article.snippet}</p>
                    </div>
                  </div>
                </div>
              ))}
              {articles.length === 0 && <div className="p-6 text-center text-gray-500">No feeds yet — add one!</div>}
            </div>
          ) : (
            <div className="p-4 grid grid-cols-2 gap-4">
              {articles.map((article) => (
                <div
                  key={article.id}
                  onClick={() => handleArticleClick(article)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedArticle?.id === article.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}
                >
                  <div className={`w-2 h-2 rounded-full mb-2 ${article.type === 'rss' ? 'bg-green-500' : 'bg-blue-500'}`} />
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2">{article.title}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{article.source} • {article.date}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedArticle && (
        <div className="flex-1 flex flex-col">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedArticle.title}</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">{selectedArticle.source} • {selectedArticle.date} • {selectedArticle.type.toUpperCase()}</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">Summarize</button>
                <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">Save to Journal</button>
                <button onClick={() => setSelectedArticle(null)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <div className="flex-1 p-6 overflow-auto">
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{selectedArticle.snippet}</p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">This is a placeholder for the full article content. In a real implementation, this would display the actual article text, PDF content, or embedded reader view.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
