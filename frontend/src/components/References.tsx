import React, { useState, useMemo } from 'react';
import { Search, Filter, Download, Copy, ExternalLink, BookOpen } from 'lucide-react';

interface Reference {
  id: string;
  title: string;
  authors: string[];
  journal: string;
  year: string;
  doi?: string;
  url?: string;
  pages?: string;
  volume?: string;
  issue?: string;
  relevance_score: number;
  citations_count: number;
}

interface ReferencesProps {
  references: Reference[];
  citationStyle: 'apa' | 'mla' | 'chicago' | 'ieee';
  onStyleChange?: (style: 'apa' | 'mla' | 'chicago' | 'ieee') => void;
  onReferenceSelect?: (reference: Reference) => void;
}

const References: React.FC<ReferencesProps> = ({
  references,
  citationStyle,
  onStyleChange,
  onReferenceSelect
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'relevance' | 'year' | 'citations' | 'alphabetical'>('relevance');
  const [filterYear, setFilterYear] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  const filteredAndSortedReferences = useMemo(() => {
    let filtered = references.filter(ref => {
      const matchesSearch = ref.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ref.authors.some(author => author.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           ref.journal.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesYear = !filterYear || ref.year === filterYear;
      
      return matchesSearch && matchesYear;
    });

    // Sort references
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'relevance':
          return b.relevance_score - a.relevance_score;
        case 'year':
          return parseInt(b.year) - parseInt(a.year);
        case 'citations':
          return b.citations_count - a.citations_count;
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [references, searchTerm, sortBy, filterYear]);

  const formatCitation = (ref: Reference, style: 'apa' | 'mla' | 'chicago' | 'ieee') => {
    const authors = ref.authors;
    const title = ref.title;
    const journal = ref.journal;
    const year = ref.year;
    const volume = ref.volume;
    const issue = ref.issue;
    const pages = ref.pages;
    const doi = ref.doi;

    switch (style) {
      case 'apa':
        const apaAuthors = authors.length === 1 ? authors[0] :
                          authors.length <= 7 ? authors.slice(0, -1).join(', ') + ', & ' + authors.slice(-1) :
                          authors.slice(0, 6).join(', ') + ', ... ' + authors.slice(-1);
        
        let apaCitation = `${apaAuthors} (${year}). ${title}. `;
        if (journal) {
          apaCitation += journal;
          if (volume) apaCitation += `, ${volume}`;
          if (pages) apaCitation += `, ${pages}`;
        }
        if (doi) apaCitation += ` https://doi.org/${doi}`;
        return apaCitation;

      case 'mla':
        const mlaAuthors = authors.length === 1 ? authors[0] :
                          authors.slice(0, -1).join(', ') + ', and ' + authors.slice(-1);
        
        let mlaCitation = `${mlaAuthors}. "${title}." `;
        if (journal) {
          mlaCitation += journal;
          if (volume) mlaCitation += `, vol. ${volume}`;
          if (pages) mlaCitation += `, ${year}, pp. ${pages}`;
          else mlaCitation += `, ${year}`;
        }
        return mlaCitation;

      case 'chicago':
        const chicagoAuthors = authors.length === 1 ? authors[0] :
                              authors.slice(0, -1).join(', ') + ', and ' + authors.slice(-1);
        
        let chicagoCitation = `${chicagoAuthors}. "${title}." `;
        if (journal) {
          chicagoCitation += journal;
          if (volume) chicagoCitation += ` ${volume}`;
          if (pages) chicagoCitation += `, no. ${issue} (${year}): ${pages}`;
          else chicagoCitation += ` (${year})`;
        }
        if (doi) chicagoCitation += ` https://doi.org/${doi}`;
        return chicagoCitation;

      case 'ieee':
        const ieeeAuthors = authors.length === 1 ? authors[0] :
                           authors.length <= 6 ? authors.join(', ') :
                           authors.slice(0, 3).join(', ') + ' et al.';
        
        let ieeeCitation = `${ieeeAuthors}, "${title}," `;
        if (journal) {
          ieeeCitation += journal;
          if (volume) ieeeCitation += `, vol. ${volume}`;
          if (pages) ieeeCitation += `, pp. ${pages}`;
          ieeeCitation += `, ${year}`;
        }
        return ieeeCitation;

      default:
        return `${authors.join(', ')} (${year}). ${title}. ${journal}`;
    }
  };

  const copyAllCitations = async () => {
    const citations = filteredAndSortedReferences.map(ref => formatCitation(ref, citationStyle));
    const text = citations.join('\n\n');
    
    try {
      await navigator.clipboard.writeText(text);
      // Show success message (you could add a toast notification here)
    } catch (err) {
      console.error('Failed to copy citations: ', err);
    }
  };

  const downloadCitations = () => {
    const citations = filteredAndSortedReferences.map(ref => formatCitation(ref, citationStyle));
    const text = citations.join('\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `references_${citationStyle}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getYearRange = () => {
    const years = references.map(ref => parseInt(ref.year)).filter(year => !isNaN(year));
    if (years.length === 0) return [];
    return Array.from({ length: Math.max(...years) - Math.min(...years) + 1 }, (_, i) => Math.min(...years) + i);
  };

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <BookOpen className="h-6 w-6" />
            <span>References</span>
            <span className="text-lg font-normal text-gray-500">({filteredAndSortedReferences.length})</span>
          </h2>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={copyAllCitations}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Copy className="h-4 w-4" />
              <span>Copy All</span>
            </button>
            
            <button
              onClick={downloadCitations}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Download</span>
            </button>
          </div>
        </div>

        {/* Citation Style Selector */}
        <div className="flex items-center space-x-4 mb-4">
          <span className="text-sm font-medium text-gray-700">Citation Style:</span>
          <div className="flex space-x-2">
            {(['apa', 'mla', 'chicago', 'ieee'] as const).map((style) => (
              <button
                key={style}
                onClick={() => onStyleChange?.(style)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  citationStyle === style
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {style.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search references..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="relevance">Sort by Relevance</option>
              <option value="year">Sort by Year</option>
              <option value="citations">Sort by Citations</option>
              <option value="alphabetical">Sort Alphabetically</option>
            </select>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <select
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All years</option>
                  {getYearRange().reverse().map(year => (
                    <option key={year} value={year.toString()}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* References List */}
      <div className="p-6">
        <div className="space-y-4">
          {filteredAndSortedReferences.map((ref, index) => (
            <div
              key={ref.id}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
              onClick={() => onReferenceSelect?.(ref)}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm font-medium text-gray-500">[{index + 1}]</span>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {(ref.relevance_score * 100).toFixed(0)}% relevant
                      </span>
                      {ref.citations_count > 0 && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          {ref.citations_count} citations
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-2">{ref.title}</h3>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    <p className="font-medium">{ref.authors.join(', ')}</p>
                    <p>{ref.journal} ({ref.year})</p>
                    {ref.volume && <span>Volume {ref.volume}</span>}
                    {ref.issue && <span>, Issue {ref.issue}</span>}
                    {ref.pages && <span>, pp. {ref.pages}</span>}
                  </div>
                  
                  <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded border-l-4 border-blue-500">
                    <strong>{citationStyle.toUpperCase()}:</strong> {formatCitation(ref, citationStyle)}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(formatCitation(ref, citationStyle));
                    }}
                    className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                    title="Copy citation"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  
                  {ref.url && (
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                      title="View paper"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                  
                  {ref.doi && (
                    <a
                      href={`https://doi.org/${ref.doi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1 text-purple-600 hover:bg-purple-100 rounded"
                      title="View DOI"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAndSortedReferences.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No references found</h3>
            <p className="text-gray-600">
              {searchTerm || filterYear 
                ? 'Try adjusting your search or filter criteria.' 
                : 'No references available for this research session.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default References;
