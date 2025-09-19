import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  FileText, 
  Users, 
  Calendar, 
  Award,
  Target,
  Activity,
  PieChart,
  LineChart
} from 'lucide-react';

interface AnalyticsData {
  paper_metrics: {
    word_count: number;
    section_count: number;
    abstract_length: number;
    average_section_length: number;
    readability_score: number;
    citation_density: number;
  };
  content_analysis: {
    keywords: string[];
    topics: string[];
    sentiment: {
      positive: number;
      negative: number;
      neutral: number;
    };
    coherence_score: number;
    academic_tone_score: number;
  };
  source_analysis: {
    total_sources: number;
    publication_years: {
      earliest: number;
      latest: number;
      average: number;
      median: number;
    };
    journal_diversity: number;
    author_diversity: number;
    citation_impact: {
      total_citations: number;
      average_citations: number;
      median_citations: number;
      max_citations: number;
    };
    relevance_analysis: {
      average_relevance: number;
      median_relevance: number;
      high_relevance_count: number;
    };
  };
  quality_indicators: {
    content_completeness: number;
    logical_flow: number;
    evidence_strength: number;
    academic_rigor: number;
    citation_quality: number;
    overall_quality_score: number;
  };
  trend_analysis: {
    publication_trends: {
      year_distribution: Record<string, number>;
      growth_rate: number;
      recent_activity: number;
    };
    methodological_trends: Record<string, number>;
    topic_trends: Record<string, number>;
  };
  recommendations: string[];
}

interface AnalyticsDashboardProps {
  analytics: AnalyticsData;
  loading?: boolean;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ analytics, loading = false }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'quality' | 'sources' | 'trends'>('overview');

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
    trend?: {
      value: number;
      isPositive: boolean;
    };
  }> = ({ title, value, subtitle, icon, color, trend }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
      orange: 'bg-orange-50 text-orange-600 border-orange-200',
      red: 'bg-red-50 text-red-600 border-red-200'
    };

    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
            {trend && (
              <div className={`flex items-center mt-2 text-sm ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                <TrendingUp className={`h-4 w-4 mr-1 ${!trend.isPositive ? 'rotate-180' : ''}`} />
                <span>{Math.abs(trend.value)}%</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>
            {icon}
          </div>
        </div>
      </div>
    );
  };

  const ProgressBar: React.FC<{
    label: string;
    value: number;
    max?: number;
    color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  }> = ({ label, value, max = 1, color = 'blue' }) => {
    const percentage = (value / max) * 100;
    const colorClasses = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      purple: 'bg-purple-500',
      orange: 'bg-orange-500',
      red: 'bg-red-500'
    };

    return (
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium text-gray-700">{label}</span>
          <span className="text-gray-500">{Math.round(percentage)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${colorClasses[color]}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>
    );
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Word Count"
          value={analytics.paper_metrics.word_count.toLocaleString()}
          subtitle="Total words in paper"
          icon={<FileText className="h-6 w-6" />}
          color="blue"
        />
        <StatCard
          title="Sources Used"
          value={analytics.source_analysis.total_sources}
          subtitle={`${analytics.source_analysis.journal_diversity} journals`}
          icon={<Users className="h-6 w-6" />}
          color="green"
        />
        <StatCard
          title="Quality Score"
          value={`${Math.round(analytics.quality_indicators.overall_quality_score * 100)}%`}
          subtitle="Overall quality assessment"
          icon={<Award className="h-6 w-6" />}
          color="purple"
        />
        <StatCard
          title="Citation Density"
          value={analytics.paper_metrics.citation_density.toFixed(1)}
          subtitle="Citations per 1000 words"
          icon={<Target className="h-6 w-6" />}
          color="orange"
        />
      </div>

      {/* Quality Indicators */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quality Indicators</h3>
        <div className="space-y-4">
          <ProgressBar
            label="Content Completeness"
            value={analytics.quality_indicators.content_completeness}
            color="blue"
          />
          <ProgressBar
            label="Logical Flow"
            value={analytics.quality_indicators.logical_flow}
            color="green"
          />
          <ProgressBar
            label="Evidence Strength"
            value={analytics.quality_indicators.evidence_strength}
            color="purple"
          />
          <ProgressBar
            label="Academic Rigor"
            value={analytics.quality_indicators.academic_rigor}
            color="orange"
          />
        </div>
      </div>

      {/* Content Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sentiment Analysis</h3>
          <div className="space-y-3">
            <ProgressBar
              label="Positive"
              value={analytics.content_analysis.sentiment.positive}
              color="green"
            />
            <ProgressBar
              label="Neutral"
              value={analytics.content_analysis.sentiment.neutral}
              color="blue"
            />
            <ProgressBar
              label="Negative"
              value={analytics.content_analysis.sentiment.negative}
              color="red"
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Quality</h3>
          <div className="space-y-4">
            <ProgressBar
              label="Coherence Score"
              value={analytics.content_analysis.coherence_score}
              color="blue"
            />
            <ProgressBar
              label="Academic Tone"
              value={analytics.content_analysis.academic_tone_score}
              color="purple"
            />
            <ProgressBar
              label="Readability"
              value={analytics.paper_metrics.readability_score}
              color="green"
            />
          </div>
        </div>
      </div>

      {/* Top Keywords */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Keywords</h3>
        <div className="flex flex-wrap gap-2">
          {analytics.content_analysis.keywords.slice(0, 10).map((keyword, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
            >
              {keyword}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  const renderQuality = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Detailed Quality Assessment</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {Math.round(analytics.quality_indicators.overall_quality_score * 100)}%
              </div>
              <div className="text-sm text-gray-600">Overall Quality Score</div>
            </div>
            
            <div className="space-y-3">
              <ProgressBar
                label="Content Completeness"
                value={analytics.quality_indicators.content_completeness}
                color="blue"
              />
              <ProgressBar
                label="Logical Flow"
                value={analytics.quality_indicators.logical_flow}
                color="green"
              />
              <ProgressBar
                label="Evidence Strength"
                value={analytics.quality_indicators.evidence_strength}
                color="purple"
              />
              <ProgressBar
                label="Academic Rigor"
                value={analytics.quality_indicators.academic_rigor}
                color="orange"
              />
              <ProgressBar
                label="Citation Quality"
                value={analytics.quality_indicators.citation_quality}
                color="red"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Quality Breakdown</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Content Completeness</span>
                <span className="font-medium">
                  {Math.round(analytics.quality_indicators.content_completeness * 100)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Logical Flow</span>
                <span className="font-medium">
                  {Math.round(analytics.quality_indicators.logical_flow * 100)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Evidence Strength</span>
                <span className="font-medium">
                  {Math.round(analytics.quality_indicators.evidence_strength * 100)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Academic Rigor</span>
                <span className="font-medium">
                  {Math.round(analytics.quality_indicators.academic_rigor * 100)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Citation Quality</span>
                <span className="font-medium">
                  {Math.round(analytics.quality_indicators.citation_quality * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {analytics.recommendations && analytics.recommendations.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
          <div className="space-y-3">
            {analytics.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex-shrink-0 w-6 h-6 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <p className="text-gray-700">{recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderSources = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Sources"
          value={analytics.source_analysis.total_sources}
          subtitle="Research papers analyzed"
          icon={<FileText className="h-6 w-6" />}
          color="blue"
        />
        <StatCard
          title="Journal Diversity"
          value={analytics.source_analysis.journal_diversity}
          subtitle="Unique journals"
          icon={<Users className="h-6 w-6" />}
          color="green"
        />
        <StatCard
          title="Author Diversity"
          value={analytics.source_analysis.author_diversity}
          subtitle="Unique authors"
          icon={<Users className="h-6 w-6" />}
          color="purple"
        />
        <StatCard
          title="Total Citations"
          value={analytics.source_analysis.citation_impact.total_citations.toLocaleString()}
          subtitle="Across all sources"
          icon={<Target className="h-6 w-6" />}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Publication Timeline</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Earliest Publication</span>
              <span className="font-medium">{analytics.source_analysis.publication_years.earliest}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Latest Publication</span>
              <span className="font-medium">{analytics.source_analysis.publication_years.latest}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Average Year</span>
              <span className="font-medium">{Math.round(analytics.source_analysis.publication_years.average)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Recent Activity</span>
              <span className="font-medium">{analytics.source_analysis.publication_years.recent_activity} papers (2020+)</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Citation Impact</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Average Citations</span>
              <span className="font-medium">{Math.round(analytics.source_analysis.citation_impact.average_citations)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Median Citations</span>
              <span className="font-medium">{analytics.source_analysis.citation_impact.median_citations}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Max Citations</span>
              <span className="font-medium">{analytics.source_analysis.citation_impact.max_citations}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>High Relevance Sources</span>
              <span className="font-medium">{analytics.source_analysis.relevance_analysis.high_relevance_count}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Relevance Analysis</h3>
        <div className="space-y-4">
          <ProgressBar
            label="Average Relevance"
            value={analytics.source_analysis.relevance_analysis.average_relevance}
            color="blue"
          />
          <ProgressBar
            label="Median Relevance"
            value={analytics.source_analysis.relevance_analysis.median_relevance}
            color="green"
          />
          <div className="text-sm text-gray-600">
            <strong>{analytics.source_analysis.relevance_analysis.high_relevance_count}</strong> out of{' '}
            <strong>{analytics.source_analysis.total_sources}</strong> sources have high relevance (>70%)
          </div>
        </div>
      </div>
    </div>
  );

  const renderTrends = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Publication Trends</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Growth Rate</span>
            <span className={`font-medium ${analytics.trend_analysis.publication_trends.growth_rate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {analytics.trend_analysis.publication_trends.growth_rate >= 0 ? '+' : ''}
              {(analytics.trend_analysis.publication_trends.growth_rate * 100).toFixed(1)}%
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Recent Activity (2020+)</span>
            <span className="font-medium">{analytics.trend_analysis.publication_trends.recent_activity} papers</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Methodological Trends</h3>
          <div className="space-y-3">
            {Object.entries(analytics.trend_analysis.methodological_trends).map(([method, count]) => (
              <div key={method} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 capitalize">{method}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(count / Math.max(...Object.values(analytics.trend_analysis.methodological_trends))) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Topics</h3>
          <div className="space-y-3">
            {Object.entries(analytics.trend_analysis.topic_trends)
              .slice(0, 5)
              .map(([topic, count]) => (
              <div key={topic} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{topic}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${(count / Math.max(...Object.values(analytics.trend_analysis.topic_trends))) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-24 rounded-lg"></div>
            ))}
          </div>
          <div className="bg-gray-200 h-64 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
        <p className="text-gray-600">Comprehensive analysis of your research paper generation</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: <BarChart3 className="h-4 w-4" /> },
            { id: 'quality', label: 'Quality', icon: <Award className="h-4 w-4" /> },
            { id: 'sources', label: 'Sources', icon: <Users className="h-4 w-4" /> },
            { id: 'trends', label: 'Trends', icon: <TrendingUp className="h-4 w-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'quality' && renderQuality()}
      {activeTab === 'sources' && renderSources()}
      {activeTab === 'trends' && renderTrends()}
    </div>
  );
};

export default AnalyticsDashboard;
