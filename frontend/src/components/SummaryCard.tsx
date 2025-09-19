import React, { useState } from 'react';
import { ChevronDown, ChevronUp, FileText, Users, Calendar, ExternalLink } from 'lucide-react';

interface Paper {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  published_date: string;
  journal: string;
  url: string;
  relevance_score: number;
  citations_count: number;
}

interface SummaryCardProps {
  summary: {
    type: 'individual' | 'thematic' | 'key_findings' | 'methodology';
    title: string;
    content: string | Paper[];
    metadata?: {
      paper_count?: number;
      average_relevance?: number;
      key_themes?: string[];
    };
  };
  onPaperSelect?: (paper: Paper) => void;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ summary, onPaperSelect }) => {
  const [expanded, setExpanded] = useState(false);

  const renderContent = () => {
    switch (summary.type) {
      case 'individual':
        return (
          <div className="space-y-3">
            {Array.isArray(summary.content) && summary.content.map((paper: Paper) => (
              <div
                key={paper.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                onClick={() => onPaperSelect?.(paper)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-900 line-clamp-2">{paper.title}</h4>
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {(paper.relevance_score * 100).toFixed(0)}% relevant
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-3">{paper.abstract}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{paper.authors.length} authors</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(paper.published_date).getFullYear()}</span>
                    </div>
                    {paper.citations_count > 0 && (
                      <span>{paper.citations_count} citations</span>
                    )}
                  </div>
                  
                  {paper.url && (
                    <a
                      href={paper.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>View</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        );

      case 'thematic':
        return (
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {summary.content}
            </div>
          </div>
        );

      case 'key_findings':
        return (
          <div className="space-y-3">
            {Array.isArray(summary.content) && summary.content.map((finding: any, index: number) => (
              <div key={index} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800 font-medium">{finding.finding}</p>
                    {finding.papers && (
                      <p className="text-sm text-gray-600 mt-1">
                        Based on {finding.papers.length} paper{finding.papers.length !== 1 ? 's' : ''}
                      </p>
                    )}
                    {finding.confidence && (
                      <div className="mt-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">Confidence:</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${finding.confidence * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">
                            {(finding.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'methodology':
        return (
          <div className="space-y-4">
            {typeof summary.content === 'object' && summary.content !== null && 
             Object.entries(summary.content).map(([method, papers]: [string, any]) => (
              <div key={method} className="border border-gray-200 rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 capitalize mb-2">
                  {method.replace('_', ' ')} ({Array.isArray(papers) ? papers.length : 0} papers)
                </h5>
                {Array.isArray(papers) && papers.slice(0, 3).map((paper: any, index: number) => (
                  <div key={index} className="text-sm text-gray-600 mb-1">
                    • {paper.title}
                  </div>
                ))}
                {Array.isArray(papers) && papers.length > 3 && (
                  <div className="text-sm text-gray-500">
                    ... and {papers.length - 3} more papers
                  </div>
                )}
              </div>
            ))}
          </div>
        );

      default:
        return (
          <div className="text-gray-700">
            {typeof summary.content === 'string' ? summary.content : JSON.stringify(summary.content)}
          </div>
        );
    }
  };

  const getCardIcon = () => {
    switch (summary.type) {
      case 'individual':
        return <FileText className="h-5 w-5" />;
      case 'thematic':
        return <Users className="h-5 w-5" />;
      case 'key_findings':
        return <FileText className="h-5 w-5" />;
      case 'methodology':
        return <Calendar className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getCardColor = () => {
    switch (summary.type) {
      case 'individual':
        return 'border-blue-200 bg-blue-50';
      case 'thematic':
        return 'border-purple-200 bg-purple-50';
      case 'key_findings':
        return 'border-green-200 bg-green-50';
      case 'methodology':
        return 'border-orange-200 bg-orange-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className={`border rounded-lg shadow-sm transition-all duration-200 ${getCardColor()}`}>
      {/* Card Header */}
      <div
        className="p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {getCardIcon()}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{summary.title}</h3>
              {summary.metadata && (
                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                  {summary.metadata.paper_count && (
                    <span>{summary.metadata.paper_count} papers</span>
                  )}
                  {summary.metadata.average_relevance && (
                    <span>
                      {(summary.metadata.average_relevance * 100).toFixed(0)}% avg relevance
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <button className="flex-shrink-0 p-1 hover:bg-white hover:bg-opacity-50 rounded-full transition-colors">
            {expanded ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>
        </div>

        {/* Key Themes Preview */}
        {summary.metadata?.key_themes && summary.metadata.key_themes.length > 0 && (
          <div className="mt-3">
            <div className="flex flex-wrap gap-1">
              {summary.metadata.key_themes.slice(0, 3).map((theme, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-white bg-opacity-60 text-gray-700 text-xs rounded-full"
                >
                  {theme}
                </span>
              ))}
              {summary.metadata.key_themes.length > 3 && (
                <span className="px-2 py-1 bg-white bg-opacity-60 text-gray-500 text-xs rounded-full">
                  +{summary.metadata.key_themes.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Card Content */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-200 pt-4">
          {renderContent()}
        </div>
      )}
    </div>
  );
};

export default SummaryCard;
