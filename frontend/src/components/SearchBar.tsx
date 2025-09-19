import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Settings, 
  Sparkles, 
  TrendingUp, 
  Zap,
  ArrowRight,
  Check,
  // X
} from 'lucide-react';

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
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const [filters, setFilters] = useState<SearchFilters>({
    maxPapers: 50,
    sources: ['semantic_scholar', 'pubmed'],
    dateRange: {
      start: '',
      end: ''
    },
    paperType: 'research_paper'
  });

  const popularTopics = [
    'Machine Learning in Healthcare',
    'Climate Change Research',
    'Artificial Intelligence Ethics',
    'Quantum Computing Applications',
    'Sustainable Energy Solutions',
    'Blockchain Technology',
    'Neural Networks in Medicine',
    'Renewable Energy Systems',
    'Cybersecurity Threats',
    'Data Privacy Protection'
  ];

  const filteredSuggestions = popularTopics.filter(topic =>
    topic.toLowerCase().includes(query.toLowerCase()) && query.length > 0
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim(), filters);
      setShowSuggestions(false);
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

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    setSelectedSuggestion(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestion(prev => 
        prev < filteredSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestion(prev => 
        prev > 0 ? prev - 1 : filteredSuggestions.length - 1
      );
    } else if (e.key === 'Enter' && selectedSuggestion >= 0) {
      e.preventDefault();
      handleSuggestionClick(filteredSuggestions[selectedSuggestion]);
    }
  };

  return (
    <motion.div 
      ref={searchRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative w-full max-w-5xl mx-auto"
    >
      {/* Main Search Container */}
      <div className="relative">
        <motion.div
          className="relative bg-gradient-to-br from-white via-blue-50 to-purple-50 rounded-2xl shadow-2xl border border-white/20 backdrop-blur-sm overflow-hidden"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 animate-pulse"></div>
          
          <form onSubmit={handleSubmit} className="relative p-8 space-y-6">
            {/* Main Search Input */}
            <div className="relative">
              <motion.div 
                className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
                animate={{ rotate: loading ? 360 : 0 }}
                transition={{ duration: 2, repeat: loading ? Infinity : 0 }}
              >
                <Search className="h-6 w-6 text-blue-500" />
              </motion.div>
              
              <motion.input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onKeyDown={handleKeyDown}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Enter your research topic (e.g., 'Machine Learning in Healthcare')"
                className="block w-full pl-14 pr-16 py-4 bg-white/80 backdrop-blur-sm border-2 border-transparent rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 text-lg font-medium placeholder-gray-500 transition-all duration-300"
                disabled={loading}
                whileFocus={{ scale: 1.02 }}
              />
              
              <motion.button
                type="submit"
                disabled={loading || !query.trim()}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div 
                  className={`px-6 py-2 rounded-xl text-sm font-semibold flex items-center space-x-2 transition-all duration-300 ${
                    loading || !query.trim()
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl'
                  }`}
                  animate={loading ? { 
                    background: ["linear-gradient(to right, #3b82f6, #8b5cf6)", "linear-gradient(to right, #8b5cf6, #ec4899)", "linear-gradient(to right, #ec4899, #3b82f6)"]
                  } : {}}
                  transition={{ duration: 2, repeat: loading ? Infinity : 0 }}
                >
                  {loading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Zap className="h-4 w-4" />
                      </motion.div>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Generate</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </motion.div>
              </motion.button>
            </div>

            {/* Search Suggestions Dropdown */}
            <AnimatePresence>
              {showSuggestions && filteredSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200/50 backdrop-blur-sm z-50 max-h-60 overflow-y-auto"
                >
                  {filteredSuggestions.map((suggestion, index) => (
                    <motion.button
                      key={suggestion}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className={`w-full px-4 py-3 text-left hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 flex items-center space-x-3 ${
                        index === selectedSuggestion ? 'bg-gradient-to-r from-blue-50 to-purple-50' : ''
                      } ${index === filteredSuggestions.length - 1 ? 'rounded-b-xl' : ''}`}
                      whileHover={{ x: 4 }}
                    >
                      <TrendingUp className="h-4 w-4 text-blue-500" />
                      <span className="text-gray-700">{suggestion}</span>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Control Buttons */}
            <div className="flex justify-between items-center">
              <motion.button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:shadow-lg transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Filter className="h-4 w-4" />
                <span>Advanced Filters</span>
                <motion.div
                  animate={{ rotate: showFilters ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ArrowRight className="h-4 w-4" />
                </motion.div>
              </motion.button>
              
              <motion.button
                type="button"
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:shadow-lg transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </motion.button>
            </div>

            {/* Advanced Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t border-gray-200/50 pt-6 space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Max Papers */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Maximum Papers
                      </label>
                      <select
                        value={filters.maxPapers}
                        onChange={(e) => updateFilter('maxPapers', parseInt(e.target.value))}
                        className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                      >
                        <option value={25}>25 papers</option>
                        <option value={50}>50 papers</option>
                        <option value={100}>100 papers</option>
                        <option value={200}>200 papers</option>
                      </select>
                    </div>

                    {/* Paper Type */}
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Paper Type
                      </label>
                      <select
                        value={filters.paperType}
                        onChange={(e) => updateFilter('paperType', e.target.value)}
                        className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                      >
                        <option value="research_paper">Research Paper</option>
                        <option value="review_paper">Review Paper</option>
                        <option value="methodology_paper">Methodology Paper</option>
                      </select>
                    </div>
                  </div>

                  {/* Date Range */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Publication Date Range
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="date"
                        value={filters.dateRange.start}
                        onChange={(e) => updateDateRange('start', e.target.value)}
                        className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                        placeholder="Start date"
                      />
                      <input
                        type="date"
                        value={filters.dateRange.end}
                        onChange={(e) => updateDateRange('end', e.target.value)}
                        className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                        placeholder="End date"
                      />
                    </div>
                  </div>

                  {/* Sources */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Data Sources
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {[
                        { id: 'semantic_scholar', name: 'Semantic Scholar', color: 'from-blue-500 to-blue-600' },
                        { id: 'pubmed', name: 'PubMed', color: 'from-green-500 to-green-600' },
                        { id: 'openalex', name: 'OpenAlex', color: 'from-purple-500 to-purple-600' },
                        { id: 'crossref', name: 'CrossRef', color: 'from-orange-500 to-orange-600' },
                        { id: 'arxiv', name: 'arXiv', color: 'from-red-500 to-red-600' }
                      ].map((source) => (
                        <motion.button
                          key={source.id}
                          type="button"
                          onClick={() => toggleSource(source.id)}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center space-x-2 ${
                            filters.sources.includes(source.id)
                              ? `bg-gradient-to-r ${source.color} text-white shadow-lg`
                              : 'bg-white/80 text-gray-600 border-2 border-gray-200 hover:border-gray-300'
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {filters.sources.includes(source.id) ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-gray-400"></div>
                          )}
                          <span>{source.name}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </motion.div>
      </div>

      {/* Popular Topics */}
      <motion.div 
        className="mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <p className="text-sm font-semibold text-gray-600 mb-3 flex items-center space-x-2">
          <TrendingUp className="h-4 w-4 text-blue-500" />
          <span>Popular Research Topics</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {popularTopics.slice(0, 6).map((suggestion, index) => (
            <motion.button
              key={suggestion}
              onClick={() => setQuery(suggestion)}
              className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-full text-sm font-medium hover:from-blue-100 hover:to-purple-100 hover:text-blue-700 transition-all duration-300 border border-gray-200/50"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              {suggestion}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SearchBar;
