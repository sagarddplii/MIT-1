import React, { useState } from 'react';
import { Search, Filter, Settings } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  loading?: boolean;
}

interface SearchFilters {
  maxPapers: number;
  sources: string[];
  dateRange: {
    start: string;
    end: string;
  };
  paperType: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, loading = false }) => {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    maxPapers: 50,
    sources: ['arxiv', 'pubmed'],
    dateRange: {
      start: '',
      end: ''
    },
    paperType: 'research_paper'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim(), filters);
    }
  };

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateDateRange = (field: 'start' | 'end', value: string) => {
    setFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [field]: value
      }
    }));
  };

  const toggleSource = (source: string) => {
    setFilters(prev => ({
      ...prev,
      sources: prev.sources.includes(source)
        ? prev.sources.filter(s => s !== source)
        : [...prev.sources, source]
    }));
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Main Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter your research topic (e.g., 'Machine Learning in Healthcare')"
            className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <div className={`px-4 py-2 rounded-md text-sm font-medium ${
              loading || !query.trim()
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}>
              {loading ? 'Searching...' : 'Search'}
            </div>
          </button>
        </div>

        {/* Filter Toggle */}
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
          >
            <Filter className="h-4 w-4" />
            <span>Advanced Filters</span>
          </button>
          
          <button
            type="button"
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="border-t pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Max Papers */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Papers
                </label>
                <select
                  value={filters.maxPapers}
                  onChange={(e) => updateFilter('maxPapers', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={25}>25 papers</option>
                  <option value={50}>50 papers</option>
                  <option value={100}>100 papers</option>
                  <option value={200}>200 papers</option>
                </select>
              </div>

              {/* Paper Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paper Type
                </label>
                <select
                  value={filters.paperType}
                  onChange={(e) => updateFilter('paperType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="research_paper">Research Paper</option>
                  <option value="review_paper">Review Paper</option>
                  <option value="methodology_paper">Methodology Paper</option>
                </select>
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Publication Date Range
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <input
                    type="date"
                    value={filters.dateRange.start}
                    onChange={(e) => updateDateRange('start', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Start date"
                  />
                </div>
                <div>
                  <input
                    type="date"
                    value={filters.dateRange.end}
                    onChange={(e) => updateDateRange('end', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="End date"
                  />
                </div>
              </div>
            </div>

            {/* Sources */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Sources
              </label>
              <div className="flex flex-wrap gap-2">
                {['arxiv', 'pubmed', 'google_scholar', 'ieee'].map((source) => (
                  <button
                    key={source}
                    type="button"
                    onClick={() => toggleSource(source)}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      filters.sources.includes(source)
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    {source.charAt(0).toUpperCase() + source.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </form>

      {/* Search Suggestions */}
      <div className="mt-4">
        <p className="text-sm text-gray-600 mb-2">Popular research topics:</p>
        <div className="flex flex-wrap gap-2">
          {[
            'Machine Learning in Healthcare',
            'Climate Change Research',
            'Artificial Intelligence Ethics',
            'Quantum Computing Applications',
            'Sustainable Energy Solutions'
          ].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => setQuery(suggestion)}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
