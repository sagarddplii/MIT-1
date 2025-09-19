import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  FileText, 
  Users, 
  Calendar, 
  Award,
  Target,
  // Activity,
  PieChart,
  LineChart,
  Sparkles,
  Star,
  // Zap,
  Brain,
  // Eye,
  // EyeOff,
  // ChevronDown,
  // ChevronUp,
  // Download,
  // Share2,
  // RefreshCw,
  // Settings
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
  const [hoveredMetric, setHoveredMetric] = useState<string | null>(null);

  // const toggleCard = (cardId: string) => {
  //   const newExpanded = new Set(expandedCards);
  //   if (newExpanded.has(cardId)) {
  //     newExpanded.delete(cardId);
  //   } else {
  //     newExpanded.add(cardId);
  //   }
  //   setExpandedCards(newExpanded);
  // };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'pink' | 'teal' | 'indigo';
    trend?: {
      value: number;
      isPositive: boolean;
    };
    metricId?: string;
  }> = ({ title, value, subtitle, icon, color, trend, metricId }) => {
    const colorClasses = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      purple: 'from-purple-500 to-purple-600',
      orange: 'from-orange-500 to-orange-600',
      red: 'from-red-500 to-red-600',
      pink: 'from-pink-500 to-pink-600',
      teal: 'from-teal-500 to-teal-600',
      indigo: 'from-indigo-500 to-indigo-600'
    };

    const bgClasses = {
      blue: 'from-blue-50 to-blue-100',
      green: 'from-green-50 to-green-100',
      purple: 'from-purple-50 to-purple-100',
      orange: 'from-orange-50 to-orange-100',
      red: 'from-red-50 to-red-100',
      pink: 'from-pink-50 to-pink-100',
      teal: 'from-teal-50 to-teal-100',
      indigo: 'from-indigo-50 to-indigo-100'
    };

    return (
      <motion.div 
        className={`relative bg-gradient-to-br ${bgClasses[color]} p-6 rounded-2xl shadow-lg border-2 border-white/50 transition-all duration-300 ${
          hoveredMetric === metricId ? 'scale-105 shadow-2xl' : 'hover:shadow-xl'
        }`}
        onMouseEnter={() => setHoveredMetric(metricId || null)}
        onMouseLeave={() => setHoveredMetric(null)}
        whileHover={{ y: -5 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className={`absolute inset-0 bg-gradient-to-r ${colorClasses[color]} opacity-5 rounded-2xl`}></div>
        
        <div className="relative flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-600 mb-1">{title}</p>
            <motion.p 
              className="text-3xl font-bold text-gray-900"
              animate={{ scale: hoveredMetric === metricId ? 1.05 : 1 }}
            >
              {value}
            </motion.p>
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
            {trend && (
              <motion.div 
                className={`flex items-center mt-2 text-sm font-medium ${
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <motion.div
                  animate={{ rotate: trend.isPositive ? 0 : 180 }}
                  transition={{ duration: 0.3 }}
                >
                  <TrendingUp className="h-4 w-4 mr-1" />
                </motion.div>
                <span>{Math.abs(trend.value)}%</span>
              </motion.div>
            )}
          </div>
          <motion.div 
            className={`p-4 rounded-xl bg-gradient-to-r ${colorClasses[color]} text-white shadow-lg`}
            whileHover={{ rotate: 10, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {icon}
          </motion.div>
        </div>
      </motion.div>
    );
  };

  const ProgressBar: React.FC<{
    label: string;
    value: number;
    max?: number;
    color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'pink' | 'teal' | 'indigo';
    animated?: boolean;
  }> = ({ label, value, max = 1, color = 'blue', animated = true }) => {
    const percentage = (value / max) * 100;
    const colorClasses = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      purple: 'from-purple-500 to-purple-600',
      orange: 'from-orange-500 to-orange-600',
      red: 'from-red-500 to-red-600',
      pink: 'from-pink-500 to-pink-600',
      teal: 'from-teal-500 to-teal-600',
      indigo: 'from-indigo-500 to-indigo-600'
    };

    return (
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="font-semibold text-gray-700">{label}</span>
          <span className="text-gray-500 font-medium">{Math.round(percentage)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
          <motion.div
            className={`h-3 rounded-full bg-gradient-to-r ${colorClasses[color]} shadow-sm`}
            initial={{ width: 0 }}
            animate={{ width: animated ? `${Math.min(percentage, 100)}%` : `${Math.min(percentage, 100)}%` }}
            transition={{ duration: 1, delay: 0.2 }}
          />
        </div>
      </div>
    );
  };

  const PieChart3D: React.FC<{
    data: { label: string; value: number; color: string }[];
    title: string;
  }> = ({ data, title }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;

    return (
      <motion.div 
        className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
        <div className="relative w-48 h-48 mx-auto mb-4">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const angle = (percentage / 100) * 360;
              const startAngle = currentAngle;
              const endAngle = currentAngle + angle;
              
              const startAngleRad = (startAngle - 90) * (Math.PI / 180);
              const endAngleRad = (endAngle - 90) * (Math.PI / 180);
              
              const x1 = 50 + 35 * Math.cos(startAngleRad);
              const y1 = 50 + 35 * Math.sin(startAngleRad);
              const x2 = 50 + 35 * Math.cos(endAngleRad);
              const y2 = 50 + 35 * Math.sin(endAngleRad);
              
              const largeArcFlag = angle > 180 ? 1 : 0;
              const pathData = [
                `M 50 50`,
                `L ${x1} ${y1}`,
                `A 35 35 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z'
              ].join(' ');
              
              currentAngle += angle;
              
              return (
                <motion.path
                  key={index}
                  d={pathData}
                  fill={item.color}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ scale: 1.05 }}
                  className="cursor-pointer"
                />
              );
            })}
          </svg>
        </div>
        <div className="space-y-2">
          {data.map((item, index) => (
            <motion.div 
              key={index} 
              className="flex items-center space-x-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + 0.5 }}
            >
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-gray-600">{item.label}</span>
              <span className="text-sm font-semibold text-gray-900 ml-auto">
                {Math.round((item.value / total) * 100)}%
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  };

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Key Metrics */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <StatCard
          title="Word Count"
          value={analytics.paper_metrics.word_count.toLocaleString()}
          subtitle="Total words in paper"
          icon={<FileText className="h-6 w-6" />}
          color="blue"
          metricId="word-count"
        />
        <StatCard
          title="Sources Used"
          value={analytics.source_analysis.total_sources}
          subtitle={`${analytics.source_analysis.journal_diversity} journals`}
          icon={<Users className="h-6 w-6" />}
          color="green"
          metricId="sources"
        />
        <StatCard
          title="Quality Score"
          value={`${Math.round(analytics.quality_indicators.overall_quality_score * 100)}%`}
          subtitle="Overall quality assessment"
          icon={<Award className="h-6 w-6" />}
          color="purple"
          metricId="quality"
        />
        <StatCard
          title="Citation Density"
          value={analytics.paper_metrics.citation_density.toFixed(1)}
          subtitle="Citations per 1000 words"
          icon={<Target className="h-6 w-6" />}
          color="orange"
          metricId="citations"
        />
      </motion.div>

      {/* Interactive Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sentiment Analysis Pie Chart */}
        <PieChart3D
          data={[
            { label: 'Positive', value: analytics.content_analysis.sentiment.positive, color: '#10B981' },
            { label: 'Neutral', value: analytics.content_analysis.sentiment.neutral, color: '#3B82F6' },
            { label: 'Negative', value: analytics.content_analysis.sentiment.negative, color: '#EF4444' }
          ]}
          title="Sentiment Analysis"
        />

        {/* Quality Indicators */}
        <motion.div 
          className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center space-x-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <span>Quality Indicators</span>
          </h3>
          <div className="space-y-6">
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
        </motion.div>
      </div>

      {/* Top Keywords */}
      <motion.div 
        className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center space-x-2">
          <Brain className="h-5 w-5 text-purple-500" />
          <span>Top Keywords</span>
        </h3>
        <div className="flex flex-wrap gap-3">
          {analytics.content_analysis.keywords.slice(0, 12).map((keyword, index) => (
            <motion.span
              key={index}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold rounded-full shadow-md"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 + 0.6 }}
              whileHover={{ scale: 1.1, y: -2 }}
            >
              {keyword}
            </motion.span>
          ))}
        </div>
      </motion.div>
    </div>
  );

  const renderQuality = () => (
    <div className="space-y-8">
      <motion.div 
        className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
            <Award className="h-6 w-6 text-white" />
          </div>
          <span>Detailed Quality Assessment</span>
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="text-center">
              <motion.div 
                className="text-6xl font-bold text-gray-900 mb-2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              >
                {Math.round(analytics.quality_indicators.overall_quality_score * 100)}%
              </motion.div>
              <div className="text-lg text-gray-600 font-medium">Overall Quality Score</div>
            </div>
            
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
              <ProgressBar
                label="Citation Quality"
                value={analytics.quality_indicators.citation_quality}
                color="red"
              />
            </div>
          </div>
          
          <div className="space-y-6">
            <h4 className="font-bold text-gray-900 text-lg">Quality Breakdown</h4>
            <div className="space-y-4">
              {[
                { label: 'Content Completeness', value: analytics.quality_indicators.content_completeness },
                { label: 'Logical Flow', value: analytics.quality_indicators.logical_flow },
                { label: 'Evidence Strength', value: analytics.quality_indicators.evidence_strength },
                { label: 'Academic Rigor', value: analytics.quality_indicators.academic_rigor },
                { label: 'Citation Quality', value: analytics.quality_indicators.citation_quality }
              ].map((item, index) => (
                <motion.div 
                  key={index}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-xl"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.4 }}
                >
                  <span className="font-medium text-gray-700">{item.label}</span>
                  <span className="font-bold text-gray-900">
                    {Math.round(item.value * 100)}%
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Recommendations */}
      {analytics.recommendations && analytics.recommendations.length > 0 && (
        <motion.div 
          className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            <span>Recommendations</span>
          </h3>
          <div className="space-y-4">
            {analytics.recommendations.map((recommendation, index) => (
              <motion.div 
                key={index} 
                className="flex items-start space-x-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.8 }}
                whileHover={{ scale: 1.02 }}
              >
                <motion.div 
                  className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  {index + 1}
                </motion.div>
                <p className="text-gray-700 font-medium leading-relaxed">{recommendation}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );

  const renderSources = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div 
          className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            <span>Publication Timeline</span>
          </h3>
          <div className="space-y-4">
            {[
              { label: 'Earliest Publication', value: analytics.source_analysis.publication_years.earliest },
              { label: 'Latest Publication', value: analytics.source_analysis.publication_years.latest },
              { label: 'Average Year', value: Math.round(analytics.source_analysis.publication_years.average) },
              { label: 'Recent Activity', value: `${analytics.trend_analysis.publication_trends.recent_activity} papers (2020+)` }
            ].map((item, index) => (
              <motion.div 
                key={index}
                className="flex justify-between items-center p-3 bg-blue-50 rounded-xl"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.2 }}
              >
                <span className="font-medium text-gray-700">{item.label}</span>
                <span className="font-bold text-blue-600">{item.value}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <span>Citation Impact</span>
          </h3>
          <div className="space-y-4">
            {[
              { label: 'Average Citations', value: Math.round(analytics.source_analysis.citation_impact.average_citations) },
              { label: 'Median Citations', value: analytics.source_analysis.citation_impact.median_citations },
              { label: 'Max Citations', value: analytics.source_analysis.citation_impact.max_citations },
              { label: 'High Relevance Sources', value: analytics.source_analysis.relevance_analysis.high_relevance_count }
            ].map((item, index) => (
              <motion.div 
                key={index}
                className="flex justify-between items-center p-3 bg-green-50 rounded-xl"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.4 }}
              >
                <span className="font-medium text-gray-700">{item.label}</span>
                <span className="font-bold text-green-600">{item.value}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div 
        className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center space-x-2">
          <Target className="h-5 w-5 text-purple-500" />
          <span>Relevance Analysis</span>
        </h3>
        <div className="space-y-6">
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
          <div className="text-sm text-gray-600 bg-purple-50 p-4 rounded-xl">
            <strong>{analytics.source_analysis.relevance_analysis.high_relevance_count}</strong> out of{' '}
            <strong>{analytics.source_analysis.total_sources}</strong> sources have high relevance ({'>'}70%)
          </div>
        </div>
      </motion.div>
    </div>
  );

  const renderTrends = () => (
    <div className="space-y-8">
      <motion.div 
        className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center space-x-2">
          <LineChart className="h-5 w-5 text-blue-500" />
          <span>Publication Trends</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <motion.div 
              className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl"
              whileHover={{ scale: 1.02 }}
            >
              <span className="font-medium text-gray-700">Growth Rate</span>
              <span className={`font-bold text-lg ${analytics.trend_analysis.publication_trends.growth_rate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {analytics.trend_analysis.publication_trends.growth_rate >= 0 ? '+' : ''}
                {(analytics.trend_analysis.publication_trends.growth_rate * 100).toFixed(1)}%
              </span>
            </motion.div>
            <motion.div 
              className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl"
              whileHover={{ scale: 1.02 }}
            >
              <span className="font-medium text-gray-700">Recent Activity (2020+)</span>
              <span className="font-bold text-lg text-green-600">
                {analytics.trend_analysis.publication_trends.recent_activity} papers
              </span>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div 
          className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center space-x-2">
            <Brain className="h-5 w-5 text-orange-500" />
            <span>Methodological Trends</span>
          </h3>
          <div className="space-y-4">
            {Object.entries(analytics.trend_analysis.methodological_trends).map(([method, count], index) => (
              <motion.div 
                key={method} 
                className="flex justify-between items-center p-3 bg-orange-50 rounded-xl"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.4 }}
                whileHover={{ scale: 1.02 }}
              >
                <span className="font-medium text-gray-700 capitalize">{method}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-gray-200 rounded-full h-3">
                    <motion.div
                      className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / Math.max(...Object.values(analytics.trend_analysis.methodological_trends))) * 100}%` }}
                      transition={{ duration: 1, delay: index * 0.1 + 0.6 }}
                    />
                  </div>
                  <span className="font-bold text-orange-600">{count}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center space-x-2">
            <PieChart className="h-5 w-5 text-purple-500" />
            <span>Top Topics</span>
          </h3>
          <div className="space-y-4">
            {Object.entries(analytics.trend_analysis.topic_trends)
              .slice(0, 5)
              .map(([topic, count], index) => (
              <motion.div 
                key={topic} 
                className="flex justify-between items-center p-3 bg-purple-50 rounded-xl"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.6 }}
                whileHover={{ scale: 1.02 }}
              >
                <span className="font-medium text-gray-700">{topic}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-gray-200 rounded-full h-3">
                    <motion.div
                      className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / Math.max(...Object.values(analytics.trend_analysis.topic_trends))) * 100}%` }}
                      transition={{ duration: 1, delay: index * 0.1 + 0.8 }}
                    />
                  </div>
                  <span className="font-bold text-purple-600">{count}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-8">
        <motion.div 
          className="animate-pulse"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl w-1/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gradient-to-br from-gray-200 to-gray-300 h-32 rounded-2xl"></div>
            ))}
          </div>
          <div className="bg-gradient-to-r from-gray-200 to-gray-300 h-96 rounded-2xl"></div>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      className="max-w-7xl mx-auto p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Analytics Dashboard
          </h1>
          <p className="text-xl text-gray-600">Comprehensive analysis of your research paper generation</p>
        </motion.div>
      </div>

      {/* Tab Navigation */}
      <motion.div 
        className="border-b-2 border-gray-200 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: <BarChart3 className="h-5 w-5" /> },
            { id: 'quality', label: 'Quality', icon: <Award className="h-5 w-5" /> },
            { id: 'sources', label: 'Sources', icon: <Users className="h-5 w-5" /> },
            { id: 'trends', label: 'Trends', icon: <TrendingUp className="h-5 w-5" /> }
          ].map((tab, index) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-3 py-3 px-4 border-b-2 font-semibold text-lg transition-all duration-300 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.3 }}
              whileHover={{ y: -2 }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </motion.button>
          ))}
        </nav>
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'quality' && renderQuality()}
          {activeTab === 'sources' && renderSources()}
          {activeTab === 'trends' && renderTrends()}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default AnalyticsDashboard;
