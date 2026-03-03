import { useState, useEffect } from "react";
import { Clock, Trash2, Search } from "lucide-react";
import * as api from "../api";

interface SearchHistoryItem {
  id: number;
  searchType: string;
  bloodGroup: string;
  city: string;
  filters: string;
  searchedAt: string;
}

export function SearchHistory() {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await api.getSearchHistory();
      setHistory(data || []);
    } catch (err) {
      console.error("Failed to load search history:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!confirm("Are you sure? This cannot be undone.")) return;
    try {
      await api.clearSearchHistory();
      setHistory([]);
    } catch (err) {
      console.error("Failed to clear history:", err);
      alert("Failed to clear history");
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString();
  };

  const parseFilters = (filterStr: string) => {
    try {
      return JSON.parse(filterStr);
    } catch {
      return {};
    }
  };

  if (loading) {
    return <div className="text-center text-muted-foreground p-8">Loading search history...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg border border-border shadow-sm p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Clock className="w-6 h-6 text-primary" />
            Search History
          </h2>
          {history.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="bg-destructive text-white px-3 py-1 rounded text-sm hover:bg-destructive/90 transition flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No search history yet</p>
            <p className="text-sm text-muted-foreground mt-2">Your searches will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item) => {
              const filters = parseFilters(item.filters);
              return (
                <div
                  key={item.id}
                  className="bg-surface rounded-lg p-4 border border-border hover:border-primary transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-bold text-primary uppercase">
                          {item.searchType}
                        </span>
                        {item.bloodGroup && (
                          <span className="text-sm text-destructive font-bold">
                            {item.bloodGroup}
                          </span>
                        )}
                        {item.city && (
                          <span className="text-sm text-muted-foreground">in {item.city}</span>
                        )}
                      </div>

                      {Object.keys(filters).length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {Object.entries(filters).map(([key, value]) => (
                            <span
                              key={key}
                              className="text-xs bg-border text-foreground px-2 py-1 rounded"
                            >
                              {key}: {String(value)}
                            </span>
                          ))}
                        </div>
                      )}

                      <p className="text-xs text-muted-foreground/70">{formatDate(item.searchedAt)}</p>
                    </div>

                    <button
                      className="text-muted-foreground hover:text-destructive transition ml-2"
                      title="Remove from history"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
