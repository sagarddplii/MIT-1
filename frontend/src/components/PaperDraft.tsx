import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  Edit, 
  Save, 
  Eye, 
  EyeOff, 
  Copy, 
  Share2, 
  Printer,
  ArrowUp,
  ArrowDown,
  FileText,
  // GripVertical,
  Sparkles,
  CheckCircle,
  Clock,
  Hash,
  BookOpen,
  PenTool,
  // RefreshCw,
  Brain,
  FlaskConical,
  TrendingUp
} from 'lucide-react';

interface PaperSection {
  title: string;
  content: string;
  word_count?: number;
}

interface PaperDraftProps {
  paper: {
    title: string;
    abstract: string;
    sections: Record<string, PaperSection>;
    metadata: {
      word_count: number;
      generation_date: string;
      topic: string;
    };
  };
  onEdit?: (section: string, content: string) => void;
  onSave?: () => void;
  onReorder?: (sectionId: string, direction: 'up' | 'down') => void;
  editable?: boolean;
}

const PaperDraft: React.FC<PaperDraftProps> = ({ 
  paper, 
  onEdit, 
  onSave, 
  onReorder,
  editable = false 
}) => {
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showWordCount, setShowWordCount] = useState(true);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('preview');
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const paperRef = useRef<HTMLDivElement>(null);

  const handleEdit = (sectionKey: string) => {
    const section = paper.sections[sectionKey];
    setEditingSection(sectionKey);
    setEditContent(section?.content || '');
  };

  const handleSave = () => {
    if (editingSection && onEdit) {
      onEdit(editingSection, editContent);
    }
    setEditingSection(null);
    setEditContent('');
    if (onSave) {
      onSave();
    }
  };

  const handleCancel = () => {
    setEditingSection(null);
    setEditContent('');
  };

  const copyToClipboard = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const downloadPaper = () => {
    const content = paperRef.current?.innerText || '';
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${paper.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const printPaper = () => {
    window.print();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getSectionIcon = (sectionKey: string) => {
    const icons: Record<string, React.ReactNode> = {
      'abstract': <FileText className="h-5 w-5" />,
      'introduction': <BookOpen className="h-5 w-5" />,
      'literature_review': <Brain className="h-5 w-5" />,
      'methodology': <FlaskConical className="h-5 w-5" />,
      'results': <TrendingUp className="h-5 w-5" />,
      'discussion': <Sparkles className="h-5 w-5" />,
      'conclusion': <CheckCircle className="h-5 w-5" />,
      'references': <PenTool className="h-5 w-5" />
    };
    return icons[sectionKey] || <FileText className="h-5 w-5" />;
  };

  const getSectionColor = (sectionKey: string) => {
    const colors: Record<string, string> = {
      'abstract': 'from-blue-500 to-blue-600',
      'introduction': 'from-blue-500 to-blue-600',
      'literature_review': 'from-purple-500 to-purple-600',
      'methodology': 'from-orange-500 to-orange-600',
      'results': 'from-green-500 to-green-600',
      'discussion': 'from-pink-500 to-pink-600',
      'conclusion': 'from-teal-500 to-teal-600',
      'references': 'from-gray-500 to-gray-600'
    };
    return colors[sectionKey] || 'from-gray-500 to-gray-600';
  };

  const getSectionBg = (sectionKey: string) => {
    const backgrounds: Record<string, string> = {
      'abstract': 'from-blue-50 to-blue-100',
      'introduction': 'from-blue-50 to-blue-100',
      'literature_review': 'from-purple-50 to-purple-100',
      'methodology': 'from-orange-50 to-orange-100',
      'results': 'from-green-50 to-green-100',
      'discussion': 'from-pink-50 to-pink-100',
      'conclusion': 'from-teal-50 to-teal-100',
      'references': 'from-gray-50 to-gray-100'
    };
    return backgrounds[sectionKey] || 'from-gray-50 to-gray-100';
  };

  const sectionsArray = Object.entries(paper.sections);

  return (
    <motion.div 
      className="max-w-5xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-200/50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Paper Header */}
      <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/50 via-purple-600/50 to-pink-600/50 animate-pulse"></div>
        
        <div className="relative p-8">
          <div className="flex justify-between items-start mb-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex-1"
            >
              <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                {paper.title}
              </h1>
              <div className="flex items-center space-x-6 text-blue-100">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">Generated on {formatDate(paper.metadata.generation_date)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4" />
                  <span className="font-medium">Topic: {paper.metadata.topic}</span>
                </div>
                {showWordCount && (
                  <div className="flex items-center space-x-2">
                    <Hash className="h-4 w-4" />
                    <span className="font-medium">{paper.metadata.word_count.toLocaleString()} words</span>
                  </div>
                )}
              </div>
            </motion.div>
            
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <motion.button
                onClick={() => setShowWordCount(!showWordCount)}
                className="p-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl transition-all duration-300 border border-white/30"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {showWordCount ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </motion.button>
              
              <motion.button
                onClick={() => setViewMode(viewMode === 'edit' ? 'preview' : 'edit')}
                className="flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl transition-all duration-300 border border-white/30"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {viewMode === 'edit' ? <Eye className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                <span className="font-medium">{viewMode === 'edit' ? 'Preview' : 'Edit'}</span>
              </motion.button>
            </motion.div>
          </div>

          {/* Action Buttons */}
          <motion.div 
            className="flex items-center space-x-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <motion.button
              onClick={downloadPaper}
              className="flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl transition-all duration-300 border border-white/30"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download className="h-4 w-4" />
              <span className="font-medium">Download</span>
            </motion.button>
            
            <motion.button
              onClick={printPaper}
              className="flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl transition-all duration-300 border border-white/30"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Printer className="h-4 w-4" />
              <span className="font-medium">Print</span>
            </motion.button>
            
            <motion.button
              className="flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl transition-all duration-300 border border-white/30"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Share2 className="h-4 w-4" />
              <span className="font-medium">Share</span>
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Paper Content */}
      <div ref={paperRef} className="p-8 space-y-8">
        {/* Abstract */}
        {paper.abstract && (
          <motion.div 
            className="border-l-4 border-blue-500 pl-6 rounded-r-2xl bg-gradient-to-br from-blue-50 to-purple-50 p-6 shadow-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-white">
                  {getSectionIcon('abstract')}
                </div>
                <h2 className="text-xl font-bold text-gray-900">Abstract</h2>
              </div>
              
              {editable && (
                <div className="flex items-center space-x-2">
                  {editingSection === 'abstract' ? (
                    <>
                      <motion.button
                        onClick={handleSave}
                        className="p-2 text-green-600 hover:bg-green-100 rounded-xl transition-all duration-300"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Save className="h-4 w-4" />
                      </motion.button>
                      <motion.button
                        onClick={handleCancel}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-300"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        ×
                      </motion.button>
                    </>
                  ) : (
                    <>
                      <motion.button
                        onClick={() => handleEdit('abstract')}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-xl transition-all duration-300"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Edit className="h-4 w-4" />
                      </motion.button>
                      <motion.button
                        onClick={() => copyToClipboard(paper.abstract, 'abstract')}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-300"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Copy className="h-4 w-4" />
                      </motion.button>
                    </>
                  )}
                </div>
              )}
            </div>
            
            <AnimatePresence mode="wait">
              {editingSection === 'abstract' ? (
                <motion.textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                  rows={6}
                  placeholder="Enter abstract..."
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                />
              ) : (
                <motion.div 
                  className="prose max-w-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-gray-700 leading-relaxed text-lg">{paper.abstract}</p>
                </motion.div>
              )}
            </AnimatePresence>
            
            {copiedSection === 'abstract' && (
              <motion.div 
                className="mt-3 text-sm text-green-600 font-medium flex items-center space-x-1"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <CheckCircle className="h-4 w-4" />
                <span>Copied to clipboard</span>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Paper Sections */}
        {sectionsArray.map(([sectionKey, section], index) => (
          <motion.div 
            key={sectionKey} 
            className={`relative border-2 rounded-2xl overflow-hidden transition-all duration-300 ${
              hoveredSection === sectionKey 
                ? 'border-blue-400 shadow-2xl scale-105' 
                : 'border-gray-200 shadow-lg hover:shadow-xl'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + index * 0.1 }}
            onMouseEnter={() => setHoveredSection(sectionKey)}
            onMouseLeave={() => setHoveredSection(null)}
            whileHover={{ y: -5 }}
          >
            {/* Section Header */}
            <div className={`relative bg-gradient-to-r ${getSectionBg(sectionKey)} p-6 border-b-2 border-gray-200`}>
              <div className={`absolute inset-0 bg-gradient-to-r ${getSectionColor(sectionKey)} opacity-5`}></div>
              
              <div className="relative flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <motion.div 
                    className={`p-3 rounded-xl bg-gradient-to-r ${getSectionColor(sectionKey)} text-white shadow-lg`}
                    whileHover={{ rotate: 10 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {getSectionIcon(sectionKey)}
                  </motion.div>
                  
                  <div>
                    <div className="flex items-center space-x-3 mb-1">
                      <span className="text-lg font-bold text-gray-500">
                        {index + 1}.
                      </span>
                      <h3 className="text-xl font-bold text-gray-900 capitalize">
                        {section.title}
                      </h3>
                    </div>
                    {section.word_count && showWordCount && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Hash className="h-3 w-3" />
                        <span className="font-medium">{section.word_count} words</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {editable && viewMode === 'edit' && onReorder && (
                    <>
                      <motion.button
                        onClick={() => onReorder(sectionKey, 'up')}
                        disabled={index === 0}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </motion.button>
                      <motion.button
                        onClick={() => onReorder(sectionKey, 'down')}
                        disabled={index === sectionsArray.length - 1}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </motion.button>
                    </>
                  )}
                  
                  {editable && (
                    <div className="flex items-center space-x-2">
                      {editingSection === sectionKey ? (
                        <>
                          <motion.button
                            onClick={handleSave}
                            className="p-2 text-green-600 hover:bg-green-100 rounded-xl transition-all duration-300"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Save className="h-4 w-4" />
                          </motion.button>
                          <motion.button
                            onClick={handleCancel}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-300"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            ×
                          </motion.button>
                        </>
                      ) : (
                        <>
                          <motion.button
                            onClick={() => handleEdit(sectionKey)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-xl transition-all duration-300"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Edit className="h-4 w-4" />
                          </motion.button>
                          <motion.button
                            onClick={() => copyToClipboard(section.content, sectionKey)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-300"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Copy className="h-4 w-4" />
                          </motion.button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Section Content */}
            <div className="p-6 bg-white">
              <AnimatePresence mode="wait">
                {editingSection === sectionKey ? (
                  <motion.textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                    rows={Math.max(6, Math.ceil(section.content.length / 100))}
                    placeholder={`Enter ${section.title.toLowerCase()} content...`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  />
                ) : (
                  <motion.div 
                    className="prose max-w-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="text-gray-700 leading-relaxed text-lg whitespace-pre-wrap">
                      {section.content}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {copiedSection === sectionKey && (
                <motion.div 
                  className="mt-3 text-sm text-green-600 font-medium flex items-center space-x-1"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Copied to clipboard</span>
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Paper Footer */}
      <motion.div 
        className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-t border-gray-200"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-blue-500" />
            <span className="font-medium">Generated by MIT Research Paper Generator</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Last updated: {formatDate(paper.metadata.generation_date)}</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PaperDraft;