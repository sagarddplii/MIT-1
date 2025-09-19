import React, { useState, useEffect } from 'react';
import { Search, FileText, BarChart3, BookOpen, Loader2 } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import SummaryCard from '../components/SummaryCard';
import PaperDraft from '../components/PaperDraft';
import References from '../components/References';
import AnalyticsDashboard from '../components/AnalyticsDashboard';

interface SearchFilters {
  maxPapers: number;
  sources: string[];
  dateRange: {
    start: string;
    end: string;
  };
  paperType: string;
}

interface ResearchData {
  topic: string;
  papers: any[];
  summaries: any;
  citations: any;
  paper_draft: any;
  analytics: any;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
}

const Home: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<'search' | 'results' | 'paper' | 'analytics'>('search');
  const [researchData, setResearchData] = useState<ResearchData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedReference, setSelectedReference] = useState<any>(null);

  const handleSearch = async (query: string, filters: SearchFilters) => {
    setLoading(true);
    setError(null);
    setCurrentStep('results');

    try {
      // Simulate API call
      const response = await fetch('/api/research/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: query,
          requirements: {
            length: 'medium',
            type: filters.paperType,
            max_papers: filters.maxPapers,
            sources: filters.sources,
            focus_areas: [],
            citation_style: 'apa'
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate research paper');
      }

      const data = await response.json();
      setResearchData(data);
      setCurrentStep('paper');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setCurrentStep('search');
    } finally {
      setLoading(false);
    }
  };

  const handleStepChange = (step: 'search' | 'results' | 'paper' | 'analytics') => {
    setCurrentStep(step);
  };

  const handleReferenceSelect = (reference: any) => {
    setSelectedReference(reference);
  };

  const renderStepIndicator = () => {
    const steps = [
      { id: 'search', label: 'Search', icon: <Search className="h-4 w-4" /> },
      { id: 'results', label: 'Results', icon: <FileText className="h-4 w-4" /> },
      { id: 'paper', label: 'Paper', icon: <BookOpen className="h-4 w-4" /> },
      { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="h-4 w-4" /> }
    ];

    return (
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex items-center space-x-2">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  currentStep === step.id || (researchData && currentStep !== 'search')
                    ? 'border-blue-500 bg-blue-500 text-white'
                    : 'border-gray-300 bg-white text-gray-500'
                }`}>
                  {loading && currentStep === step.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    step.icon
                  )}
                </div>
                <span className={`text-sm font-medium ${
                  currentStep === step.id || (researchData && currentStep !== 'search')
                    ? 'text-blue-600'
                    : 'text-gray-500'
                }`}>
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${
                  researchData && currentStep !== 'search'
                    ? 'bg-blue-500'
                    : 'bg-gray-300'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  const renderSearchStep = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          MIT Research Paper Generator
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Generate comprehensive research papers with AI-powered analysis, 
          automatic citation management, and quality assessment.
        </p>
      </div>

      <SearchBar onSearch={handleSearch} loading={loading} />

      {error && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  {error}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Features */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Search className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Smart Search</h3>
            </div>
            <p className="text-gray-600">
              Search across multiple academic databases including arXiv, PubMed, and Google Scholar to find the most relevant papers.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">AI-Powered Analysis</h3>
            </div>
            <p className="text-gray-600">
              Advanced AI algorithms analyze papers, extract key findings, and generate comprehensive summaries.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Paper Generation</h3>
            </div>
            <p className="text-gray-600">
              Generate well-structured research papers with proper citations, methodology, and academic formatting.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Quality Analytics</h3>
            </div>
            <p className="text-gray-600">
              Comprehensive analytics and quality assessment to ensure your paper meets academic standards.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <FileText className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Citation Management</h3>
            </div>
            <p className="text-gray-600">
              Automatic citation formatting in multiple styles (APA, MLA, Chicago, IEEE) with proper reference management.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Trend Analysis</h3>
            </div>
            <p className="text-gray-600">
              Analyze research trends, identify gaps, and discover emerging topics in your field of study.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderResultsStep = () => {
    if (!researchData) return null;

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Research Results for "{researchData.topic}"
          </h2>
          <p className="text-gray-600">
            Found {researchData.papers?.length || 0} relevant papers
          </p>
        </div>

        <div className="space-y-6">
          {researchData.summaries && Object.entries(researchData.summaries).map(([key, summary]: [string, any]) => (
            <SummaryCard
              key={key}
              summary={{
                type: key as any,
                title: key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
                content: summary,
                metadata: {
                  paper_count: researchData.papers?.length || 0,
                  average_relevance: researchData.papers?.reduce((acc: number, p: any) => acc + p.relevance_score, 0) / (researchData.papers?.length || 1) || 0
                }
              }}
              onPaperSelect={handleReferenceSelect}
            />
          ))}
        </div>

        <div className="flex justify-center space-x-4">
          <button
            onClick={() => setCurrentStep('paper')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Generate Paper
          </button>
          <button
            onClick={() => setCurrentStep('analytics')}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            View Analytics
          </button>
        </div>
      </div>
    );
  };

  const renderPaperStep = () => {
    if (!researchData?.paper_draft) return null;

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Generated Paper
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentStep('analytics')}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              View Analytics
            </button>
            <button
              onClick={() => setCurrentStep('results')}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to Results
            </button>
          </div>
        </div>

        <PaperDraft
          paper={researchData.paper_draft}
          editable={true}
        />

        {researchData.citations && (
          <References
            references={researchData.citations.bibliography || []}
            citationStyle="apa"
            onReferenceSelect={handleReferenceSelect}
          />
        )}
      </div>
    );
  };

  const renderAnalyticsStep = () => {
    if (!researchData?.analytics) return null;

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Analytics Dashboard
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentStep('paper')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Paper
            </button>
          </div>
        </div>

        <AnalyticsDashboard analytics={researchData.analytics} />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {renderStepIndicator()}
        
        {currentStep === 'search' && renderSearchStep()}
        {currentStep === 'results' && renderResultsStep()}
        {currentStep === 'paper' && renderPaperStep()}
        {currentStep === 'analytics' && renderAnalyticsStep()}
      </div>
    </div>
  );
};

export default Home;
