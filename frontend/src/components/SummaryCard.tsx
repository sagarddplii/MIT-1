import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  // ChevronDown, 
  // ChevronUp, 
  FileText, 
  Users, 
  Calendar, 
  ExternalLink,
  Star,
  TrendingUp,
  Brain,
  FlaskConical,
  // Sparkles,
  Eye,
  EyeOff
} from 'lucide-react';

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
  const [hoveredPaper, setHoveredPaper] = useState<string | null>(null);

  const renderContent = () => {
    switch (summary.type) {
      case 'individual':
        return (
          <div className="space-y-4">
            {Array.isArray(summary.content) && summary.content.map((paper: Paper, index: number) => (
              <motion.div
                key={paper.id}
                className={`relative p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                  hoveredPaper === paper.id 
                    ? 'border-blue-400 bg-gradient-to-br from-blue-50 to-purple-50 shadow-xl scale-105' 
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-lg'
                }`}
                onClick={() => onPaperSelect?.(paper)}
                onMouseEnter={() => setHoveredPaper(paper.id)}
                onMouseLeave={() => setHoveredPaper(null)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                {/* Relevance Badge */}
                <div className="absolute top-4 right-4">
                  <motion.div 
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      paper.relevance_score > 0.8 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' 
                        : paper.relevance_score > 0.6 
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                        : 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                    }`}
                    whileHover={{ scale: 1.1 }}
                  >
                    {(paper.relevance_score * 100).toFixed(0)}% relevant
                  </motion.div>
                </div>

                <div className="pr-20">
                  <h4 className="font-bold text-gray-900 text-lg mb-3 line-clamp-2 leading-tight">
                    {paper.title}
                  </h4>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                    {paper.abstract}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2 text-blue-600">
                        <Users className="h-4 w-4" />
                        <span className="font-medium">{paper.authors.length} authors</span>
                      </div>
                      <div className="flex items-center space-x-2 text-green-600">
                        <Calendar className="h-4 w-4" />
                        <span className="font-medium">{new Date(paper.published_date).getFullYear()}</span>
                      </div>
                      {paper.citations_count > 0 && (
                        <div className="flex items-center space-x-2 text-purple-600">
                          <TrendingUp className="h-4 w-4" />
                          <span className="font-medium">{paper.citations_count} citations</span>
                        </div>
                      )}
                    </div>
                    
                    {paper.url && (
                      <motion.a
                        href={paper.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-300"
                        onClick={(e) => e.stopPropagation()}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span className="font-medium">View</span>
                      </motion.a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        );

      case 'thematic':
        return (
          <motion.div 
            className="prose max-w-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-lg bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-200">
              {typeof summary.content === 'string' ? summary.content : JSON.stringify(summary.content)}
            </div>
          </motion.div>
        );

      case 'key_findings':
        return (
          <div className="space-y-4">
            {Array.isArray(summary.content) && summary.content.map((finding: any, index: number) => (
              <motion.div 
                key={index} 
                className="relative p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl shadow-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-start space-x-4">
                  <motion.div 
                    className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    {index + 1}
                  </motion.div>
                  <div className="flex-1">
                    <p className="text-gray-800 font-semibold text-lg mb-2">{finding.finding}</p>
                    {finding.papers && (
                      <p className="text-sm text-gray-600 mb-3">
                        Based on {finding.papers.length} paper{finding.papers.length !== 1 ? 's' : ''}
                      </p>
                    )}
                    {finding.confidence && (
                      <div className="mt-3">
                        <div className="flex items-center space-x-3">
                          <span className="text-xs font-medium text-gray-600">Confidence:</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-3 shadow-inner">
                            <motion.div
                              className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full shadow-sm"
                              initial={{ width: 0 }}
                              animate={{ width: `${finding.confidence * 100}%` }}
                              transition={{ duration: 1, delay: index * 0.2 }}
                            />
                          </div>
                          <span className="text-xs font-bold text-gray-700">
                            {(finding.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        );

      case 'methodology':
        return (
          <div className="space-y-6">
            {typeof summary.content === 'object' && summary.content !== null && 
             Object.entries(summary.content).map(([method, papers]: [string, any], index: number) => (
              <motion.div 
                key={method} 
                className="border-2 border-orange-200 rounded-2xl p-6 bg-gradient-to-br from-orange-50 to-yellow-50 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-lg">
                    <FlaskConical className="h-5 w-5 text-white" />
                  </div>
                  <h5 className="font-bold text-gray-900 text-lg capitalize">
                    {method.replace('_', ' ')} ({Array.isArray(papers) ? papers.length : 0} papers)
                  </h5>
                </div>
                {Array.isArray(papers) && papers.slice(0, 3).map((paper: any, paperIndex: number) => (
                  <motion.div 
                    key={paperIndex} 
                    className="text-sm text-gray-700 mb-2 pl-4 border-l-2 border-orange-300"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (index * 0.1) + (paperIndex * 0.05) }}
                  >
                    • {paper.title}
                  </motion.div>
                ))}
                {Array.isArray(papers) && papers.length > 3 && (
                  <div className="text-sm text-gray-500 mt-2 font-medium">
                    ... and {papers.length - 3} more papers
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        );

      default:
        return (
          <motion.div 
            className="text-gray-700 p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {typeof summary.content === 'string' ? summary.content : JSON.stringify(summary.content)}
          </motion.div>
        );
    }
  };

  const getCardIcon = () => {
    switch (summary.type) {
      case 'individual':
        return <FileText className="h-6 w-6" />;
      case 'thematic':
        return <Brain className="h-6 w-6" />;
      case 'key_findings':
        return <Star className="h-6 w-6" />;
      case 'methodology':
        return <FlaskConical className="h-6 w-6" />;
      default:
        return <FileText className="h-6 w-6" />;
    }
  };

  const getCardGradient = () => {
    switch (summary.type) {
      case 'individual':
        return 'from-blue-500 via-blue-600 to-purple-600';
      case 'thematic':
        return 'from-purple-500 via-purple-600 to-pink-600';
      case 'key_findings':
        return 'from-green-500 via-emerald-600 to-teal-600';
      case 'methodology':
        return 'from-orange-500 via-orange-600 to-red-600';
      default:
        return 'from-gray-500 via-gray-600 to-blue-600';
    }
  };

  const getCardBg = () => {
    switch (summary.type) {
      case 'individual':
        return 'from-blue-50 via-blue-100 to-purple-50';
      case 'thematic':
        return 'from-purple-50 via-purple-100 to-pink-50';
      case 'key_findings':
        return 'from-green-50 via-emerald-100 to-teal-50';
      case 'methodology':
        return 'from-orange-50 via-orange-100 to-red-50';
      default:
        return 'from-gray-50 via-gray-100 to-blue-50';
    }
  };

  return (
    <motion.div 
      className={`relative rounded-2xl shadow-xl border-2 transition-all duration-300 bg-gradient-to-br ${getCardBg()}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        scale: 1.02,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
      }}
    >
      {/* Header with gradient */}
      <div className="relative">
        <div className={`absolute inset-0 bg-gradient-to-r ${getCardGradient()} opacity-10 rounded-t-2xl`}></div>
        <motion.div
          className="relative p-6 cursor-pointer"
          onClick={() => setExpanded(!expanded)}
          whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.div 
                className={`p-3 rounded-xl bg-gradient-to-r ${getCardGradient()} text-white shadow-lg`}
                whileHover={{ rotate: 10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {getCardIcon()}
              </motion.div>
              <div>
                <h3 className="font-bold text-gray-900 text-xl mb-1">{summary.title}</h3>
                {summary.metadata && (
                  <div className="flex items-center space-x-4 text-sm">
                    {summary.metadata.paper_count && (
                      <div className="flex items-center space-x-1 text-blue-600">
                        <FileText className="h-4 w-4" />
                        <span className="font-semibold">{summary.metadata.paper_count} papers</span>
                      </div>
                    )}
                    {summary.metadata.average_relevance && (
                      <div className="flex items-center space-x-1 text-green-600">
                        <TrendingUp className="h-4 w-4" />
                        <span className="font-semibold">
                          {(summary.metadata.average_relevance * 100).toFixed(0)}% avg relevance
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <motion.button 
              className="flex-shrink-0 p-2 rounded-xl bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                animate={{ rotate: expanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {expanded ? (
                  <EyeOff className="h-5 w-5 text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-600" />
                )}
              </motion.div>
            </motion.button>
          </div>

          {/* Key Themes Preview */}
          {summary.metadata?.key_themes && summary.metadata.key_themes.length > 0 && (
            <motion.div 
              className="mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex flex-wrap gap-2">
                {summary.metadata.key_themes.slice(0, 4).map((theme, index) => (
                  <motion.span
                    key={index}
                    className={`px-3 py-1 bg-gradient-to-r ${getCardGradient()} text-white text-xs font-semibold rounded-full shadow-md`}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    whileHover={{ scale: 1.1 }}
                  >
                    {theme}
                  </motion.span>
                ))}
                {summary.metadata && summary.metadata.key_themes && summary.metadata.key_themes.length > 4 && (
                  <motion.span 
                    className="px-3 py-1 bg-white/80 text-gray-600 text-xs font-semibold rounded-full shadow-md"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    +{summary.metadata.key_themes.length - 4} more
                  </motion.span>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="px-6 pb-6 overflow-hidden"
          >
            <div className="border-t border-white/50 pt-6">
              {renderContent()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SummaryCard;
