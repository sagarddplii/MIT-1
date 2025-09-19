import React, { useState, useRef } from 'react';
import { Download, Edit, Save, Eye, EyeOff, Copy, Share2, Printer } from 'lucide-react';

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
  editable?: boolean;
}

const PaperDraft: React.FC<PaperDraftProps> = ({ 
  paper, 
  onEdit, 
  onSave, 
  editable = false 
}) => {
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showWordCount, setShowWordCount] = useState(true);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
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
    const icons: Record<string, string> = {
      'abstract': '📄',
      'introduction': '📖',
      'literature_review': '📚',
      'methodology': '🔬',
      'results': '📊',
      'discussion': '💭',
      'conclusion': '✅',
      'references': '📝'
    };
    return icons[sectionKey] || '📄';
  };

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Paper Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-2">{paper.title}</h1>
            <div className="flex items-center space-x-4 text-blue-100">
              <span>Generated on {formatDate(paper.metadata.generation_date)}</span>
              <span>•</span>
              <span>Topic: {paper.metadata.topic}</span>
              {showWordCount && (
                <>
                  <span>•</span>
                  <span>{paper.metadata.word_count.toLocaleString()} words</span>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowWordCount(!showWordCount)}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
              title="Toggle word count"
            >
              {showWordCount ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={downloadPaper}
            className="flex items-center space-x-2 px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Download</span>
          </button>
          
          <button
            onClick={printPaper}
            className="flex items-center space-x-2 px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors"
          >
            <Printer className="h-4 w-4" />
            <span>Print</span>
          </button>
          
          <button
            className="flex items-center space-x-2 px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors"
          >
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Paper Content */}
      <div ref={paperRef} className="p-6 space-y-8">
        {/* Abstract */}
        {paper.abstract && (
          <div className="border-l-4 border-blue-500 pl-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                <span>{getSectionIcon('abstract')}</span>
                <span>Abstract</span>
              </h2>
              {editable && (
                <div className="flex items-center space-x-2">
                  {editingSection === 'abstract' ? (
                    <>
                      <button
                        onClick={handleSave}
                        className="p-1 text-green-600 hover:bg-green-100 rounded"
                        title="Save changes"
                      >
                        <Save className="h-4 w-4" />
                      </button>
                      <button
                        onClick={handleCancel}
                        className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                        title="Cancel editing"
                      >
                        ×
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEdit('abstract')}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                        title="Edit abstract"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => copyToClipboard(paper.abstract, 'abstract')}
                        className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                        title="Copy to clipboard"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
            
            {editingSection === 'abstract' ? (
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={6}
                placeholder="Enter abstract..."
              />
            ) : (
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">{paper.abstract}</p>
              </div>
            )}
            
            {copiedSection === 'abstract' && (
              <div className="mt-2 text-sm text-green-600">✓ Copied to clipboard</div>
            )}
          </div>
        )}

        {/* Paper Sections */}
        {Object.entries(paper.sections).map(([sectionKey, section]) => (
          <div key={sectionKey} className="border-l-4 border-gray-300 pl-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                <span>{getSectionIcon(sectionKey)}</span>
                <span className="capitalize">{section.title}</span>
                {section.word_count && showWordCount && (
                  <span className="text-sm font-normal text-gray-500">
                    ({section.word_count} words)
                  </span>
                )}
              </h2>
              
              {editable && (
                <div className="flex items-center space-x-2">
                  {editingSection === sectionKey ? (
                    <>
                      <button
                        onClick={handleSave}
                        className="p-1 text-green-600 hover:bg-green-100 rounded"
                        title="Save changes"
                      >
                        <Save className="h-4 w-4" />
                      </button>
                      <button
                        onClick={handleCancel}
                        className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                        title="Cancel editing"
                      >
                        ×
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEdit(sectionKey)}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                        title="Edit section"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => copyToClipboard(section.content, sectionKey)}
                        className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                        title="Copy to clipboard"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
            
            {editingSection === sectionKey ? (
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={Math.max(6, Math.ceil(section.content.length / 100))}
                placeholder={`Enter ${section.title.toLowerCase()} content...`}
              />
            ) : (
              <div className="prose max-w-none">
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {section.content}
                </div>
              </div>
            )}
            
            {copiedSection === sectionKey && (
              <div className="mt-2 text-sm text-green-600">✓ Copied to clipboard</div>
            )}
          </div>
        ))}
      </div>

      {/* Paper Footer */}
      <div className="bg-gray-50 px-6 py-4 border-t">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            Generated by MIT Research Paper Generator
          </div>
          <div>
            Last updated: {formatDate(paper.metadata.generation_date)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaperDraft;
