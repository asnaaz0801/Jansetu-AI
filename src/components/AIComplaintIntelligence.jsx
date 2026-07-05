import { useState, useEffect } from 'react';
import { supabase } from '../lib/db';
import {
  Sparkles,
  FileText,
  AlertTriangle,
  Building,
  Award,
  ClipboardList,
  Clock,
  Users,
  Brain,
  ShieldAlert,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  AlertOctagon,
  RefreshCw
} from 'lucide-react';

export default function AIComplaintIntelligence({ complaint, highContrast, onSaveAnalysis }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [copiedSection, setCopiedSection] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    executiveSummary: true, // default first expanded
    priorityLevel: false,
    suggestedDepartment: false,
    suggestedGovScheme: false,
    suggestedActionPlan: false,
    estimatedResolutionTime: false,
    estimatedPublicImpact: false,
    similarComplaintPattern: false,
    riskAssessment: false,
    mpRecommendation: false
  });

  const triggerAIAnalysis = async () => {
    if (!complaint) return;
    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const payload = {
        title: complaint.title,
        description: complaint.description,
        category: complaint.category,
        area: complaint.area || complaint.constituency,
        district: complaint.district,
        state: complaint.state,
        severity: complaint.severity,
        language: complaint.language || 'English'
      };

      const { data, error: invokeErr } = await supabase.functions.invoke('analyze-complaint', {
        body: payload
      });

      if (invokeErr) throw invokeErr;
      if (!data || data.error) {
        throw new Error(data?.error || "Empty analysis response returned.");
      }

      setAnalysis(data);
      
      // Save back to database (cache it)
      if (onSaveAnalysis) {
        await onSaveAnalysis(data);
      }
    } catch (err) {
      console.error("AI Analysis failed:", err);
      setError("AI analysis temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (complaint) {
      if (complaint.ai_analysis) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setAnalysis(complaint.ai_analysis);
        setLoading(false);
        setError(null);
      } else {
        triggerAIAnalysis();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [complaint?.issue_id]);

  const toggleSection = (sec) => {
    setExpandedSections(prev => ({
      ...prev,
      [sec]: !prev[sec]
    }));
  };

  const handleCopyText = (secKey, text) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedSection(secKey);
      setTimeout(() => setCopiedSection(null), 2000);
    }).catch(err => {
      console.error("Clipboard copy failed:", err);
    });
  };

  // Section templates for mapping
  const getSectionData = () => {
    if (!analysis) return [];

    return [
      {
        key: 'executiveSummary',
        title: 'Executive Summary',
        icon: FileText,
        iconColor: 'text-blue-500',
        content: analysis.executiveSummary || ''
      },
      {
        key: 'priorityLevel',
        title: 'Priority Level',
        icon: AlertTriangle,
        iconColor: 'text-amber-500',
        content: analysis.priorityLevel 
          ? `Level: ${analysis.priorityLevel.level || 'Medium'}\n\nExplanation: ${analysis.priorityLevel.explanation || ''}` 
          : ''
      },
      {
        key: 'suggestedDepartment',
        title: 'Suggested Department',
        icon: Building,
        iconColor: 'text-indigo-500',
        content: analysis.suggestedDepartment || ''
      },
      {
        key: 'suggestedGovScheme',
        title: 'Suggested Government Scheme',
        icon: Award,
        iconColor: 'text-emerald-500',
        content: analysis.suggestedGovScheme || 'No obvious government scheme.'
      },
      {
        key: 'suggestedActionPlan',
        title: 'Suggested Action Plan (5 Steps)',
        icon: ClipboardList,
        iconColor: 'text-violet-500',
        content: Array.isArray(analysis.suggestedActionPlan)
          ? analysis.suggestedActionPlan.map((step, idx) => `${idx + 1}. ${step}`).join('\n')
          : analysis.suggestedActionPlan || ''
      },
      {
        key: 'estimatedResolutionTime',
        title: 'Estimated Resolution Time',
        icon: Clock,
        iconColor: 'text-sky-500',
        content: analysis.estimatedResolutionTime || ''
      },
      {
        key: 'estimatedPublicImpact',
        title: 'Estimated Public Impact',
        icon: Users,
        iconColor: 'text-pink-500',
        content: analysis.estimatedPublicImpact
          ? `Impact: ${analysis.estimatedPublicImpact.level || 'Medium'}\n\nExplanation: ${analysis.estimatedPublicImpact.explanation || ''}`
          : ''
      },
      {
        key: 'similarComplaintPattern',
        title: 'Similar Complaint Pattern',
        icon: Brain,
        iconColor: 'text-purple-500',
        content: analysis.similarComplaintPattern || ''
      },
      {
        key: 'riskAssessment',
        title: 'Risk Assessment',
        icon: ShieldAlert,
        iconColor: 'text-red-500',
        content: analysis.riskAssessment || ''
      },
      {
        key: 'mpRecommendation',
        title: 'Official Representative Recommendation',
        icon: MessageSquare,
        iconColor: 'text-teal-500',
        content: analysis.mpRecommendation || ''
      }
    ];
  };

  const sections = getSectionData();

  return (
    <div className={`border rounded-2xl shadow-md p-6 mb-6 transition-all border-l-4 ${
      highContrast 
        ? 'bg-[#1e293b] border-yellow-500 text-yellow-300' 
        : 'bg-white border-[#000080] border-l-[#138808] text-slate-800'
    }`}>
      
      {/* Title block */}
      <div className="flex items-center justify-between border-b pb-4 mb-4 border-slate-100/10">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-xl ${highContrast ? 'bg-yellow-500/10' : 'bg-emerald-50'}`}>
            <Sparkles className={`h-5 w-5 ${highContrast ? 'text-yellow-400' : 'text-[#138808]'}`} />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight flex items-center">
              AI Complaint Intelligence
              <span className="ml-2 text-[9px] uppercase font-black tracking-widest px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                Gemini 2.5 Flash
              </span>
            </h2>
            <p className="text-xs opacity-75 font-semibold mt-0.5">
              Automated smart grievance analysis powered by Google Generative AI models.
            </p>
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-4 py-4">
          <div className="flex items-center space-x-3 animate-pulse">
            <div className="w-4 h-4 rounded bg-slate-200 dark:bg-slate-700"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
          </div>
          <div className="space-y-2 animate-pulse pl-7">
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-4/5"></div>
          </div>
          
          <div className="border-t border-slate-100/10 pt-4 flex items-center space-x-3 animate-pulse">
            <div className="w-4 h-4 rounded bg-slate-200 dark:bg-slate-700"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
          </div>
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3 animate-pulse pl-7"></div>
        </div>
      )}

      {/* Error block with Retry */}
      {error && !loading && (
        <div className="py-6 flex flex-col items-center justify-center text-center space-y-4">
          <div className="bg-red-500/10 text-red-500 p-2.5 rounded-xl border border-red-500/20">
            <AlertOctagon className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-red-500">{error}</p>
            <p className="text-xs opacity-70 mt-1">Please ensure database connections and API key integrations are fully active.</p>
          </div>
          <button
            onClick={triggerAIAnalysis}
            className={`flex items-center space-x-2 font-bold py-2 px-4 rounded-xl border transition cursor-pointer text-xs ${
              highContrast
                ? 'bg-yellow-400 text-black border-yellow-400 hover:bg-yellow-300'
                : 'bg-slate-50 border-slate-350 hover:bg-slate-100 text-slate-700 shadow-sm'
            }`}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Retry Analysis</span>
          </button>
        </div>
      )}

      {/* Structured Sections list */}
      {!loading && !error && analysis && (
        <div className="divide-y divide-slate-100/10 space-y-1">
          {sections.map((sec) => {
            const SecIcon = sec.icon;
            const isExpanded = expandedSections[sec.key];
            const isCopied = copiedSection === sec.key;

            return (
              <div key={sec.key} className="py-2.5 first:pt-0 last:pb-0">
                {/* Accordion Trigger Head */}
                <div 
                  onClick={() => toggleSection(sec.key)}
                  className={`flex items-center justify-between cursor-pointer p-2 rounded-xl transition ${
                    highContrast ? 'hover:bg-yellow-500/5' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-3 select-none">
                    <SecIcon className={`h-4.5 w-4.5 ${sec.iconColor}`} />
                    <span className="text-xs font-black tracking-tight">{sec.title}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Copy Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyText(sec.key, sec.content);
                      }}
                      className={`p-1.5 rounded-lg border transition ${
                        highContrast
                          ? 'border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10'
                          : 'border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                      }`}
                      title={`Copy ${sec.title}`}
                    >
                      {isCopied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    </button>

                    {/* Expand indicator */}
                    <div className="text-slate-400">
                      {isExpanded ? <ChevronUp className="h-4.5 w-4.5" /> : <ChevronDown className="h-4.5 w-4.5" />}
                    </div>
                  </div>
                </div>

                {/* Expandable Text Panel */}
                {isExpanded && (
                  <div className="pl-9 pr-2 py-2 mt-1">
                    <p className={`text-xs leading-relaxed whitespace-pre-wrap font-semibold leading-relaxed ${
                      highContrast ? 'text-yellow-450' : 'text-slate-650'
                    }`}>
                      {sec.content || 'N/A'}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
