import { useState } from 'react';
import { supabase } from '../lib/db';
import { translations } from '../lib/translations';
import emblemOfIndia from '../assets/emblem-of-india.svg';
import ashokaChakra from '../assets/ashoka-chakra.svg';
import { 
  X, 
  Sparkles, 
  RefreshCw, 
  AlertOctagon, 
  MapPin, 
  Inbox, 
  Star,
  CheckCircle,
  FileText
} from 'lucide-react';

export default function AIAnalyzerModal({ 
  isOpen, 
  onClose, 
  selectedLocation, 
  stateFilter = 'All',
  districtFilter = 'All',
  cityFilter = 'All',
  areaFilter = 'All',
  complaintsCount = 0,
  totalVotes = 0,
  highContrast = false,
  language = 'en'
}) {
  const t = translations[language] || translations['en'];
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);

  if (!isOpen) return null;

  const generateActionPlan = async () => {
    setLoading(true);
    setError(null);
    setSummary(null);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('analyze-area', {
        body: { 
          location: selectedLocation,
          state: stateFilter,
          district: districtFilter,
          city: cityFilter,
          area: areaFilter
        }
      });

      if (invokeError) {
        let errorMsg = invokeError.message;
        
        // Safely extract actual response error message if returned from Deno function
        if (invokeError.context) {
          try {
            if (typeof invokeError.context.json === 'function') {
              const body = await invokeError.context.json();
              if (body && body.error) errorMsg = body.error;
            } else if (invokeError.context.error) {
              errorMsg = invokeError.context.error;
            }
          } catch (e) {
            console.error('Failed to parse error context JSON:', e);
          }
        }
        throw new Error(errorMsg);
      }

      if (data && data.summary) {
        setSummary(data.summary);
      } else if (data && data.error) {
        throw new Error(data.error);
      } else {
        throw new Error('No summary returned from AI analyzer.');
      }
    } catch (err) {
      console.error('Error generating AI plan:', err);
      setError(err.message || 'Failed to generate AI action plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintReport = () => {
    const dateStr = new Date().toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const printWindow = window.open('', '', 'height=800,width=850');
    printWindow.document.write('<html><head><title>AI Area Report - JanSetu AI</title>');
    printWindow.document.write('<script src="https://cdn.tailwindcss.com"></script>');
    printWindow.document.write('<style>body { font-family: sans-serif; }</style>');
    printWindow.document.write('</head><body class="p-8 bg-white text-slate-800">');

    printWindow.document.write(`
      <div class="bg-white text-slate-800 p-8 border-4 border-slate-800 rounded-lg shadow-inner relative overflow-hidden" style="min-height: 520px;">
        <!-- 3% Opacity Ashoka Chakra Watermark -->
        <div class="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0" style="opacity: 0.03;">
          <img src="${ashokaChakra}" alt="" class="h-96 w-96 object-contain select-none pointer-events-none" />
        </div>

        <div class="h-1.5 w-full flex mb-6 relative z-10">
          <div class="bg-[#FF9933] flex-1"></div>
          <div class="bg-slate-200 w-1/12"></div>
          <div class="bg-[#138808] flex-1"></div>
        </div>

        <div class="text-center pb-6 border-b-2 border-slate-800 relative z-10">
          <div class="flex justify-center mb-2">
            <img src="${emblemOfIndia}" alt="National Emblem of India" class="h-20 w-auto select-none pointer-events-none object-contain" />
          </div>
          <h1 class="text-xs font-black tracking-widest text-[#000080] uppercase">
            ${t.goiText}
          </h1>
          <h2 class="text-sm font-extrabold text-[#000080] tracking-tight mt-1">
            JanSetu AI Area Diagnostic Report
          </h2>
          <p class="text-[10px] tracking-wide text-slate-500 font-bold uppercase mt-1">
            AI-Powered Constituency Development &amp; Planning System
          </p>
        </div>

        <div class="py-6 space-y-4 text-xs relative z-10">
          <div class="flex justify-between items-center bg-slate-100 p-2.5 rounded border border-slate-300">
            <span class="font-extrabold uppercase text-[10px] tracking-wide text-slate-600">
              Locality Scope:
            </span>
            <span class="font-black text-sm tracking-tight text-slate-900">
              ${selectedLocation || 'All Regions'}
            </span>
          </div>

          <div class="grid grid-cols-3 gap-4">
            <div>
              <span class="font-bold block text-slate-500 text-[9px] uppercase tracking-wide mb-0.5">
                Report Date
              </span>
              <span class="font-black text-slate-800">
                ${dateStr}
              </span>
            </div>
            <div>
              <span class="font-bold block text-slate-500 text-[9px] uppercase tracking-wide mb-0.5">
                Active Complaints
              </span>
              <span class="font-black text-slate-800">${complaintsCount}</span>
            </div>
            <div>
              <span class="font-bold block text-slate-500 text-[9px] uppercase tracking-wide mb-0.5">
                ${t.dbScopeTotalVotes}
              </span>
              <span class="font-black text-slate-800">${totalVotes}</span>
            </div>
          </div>

          <div class="border-t pt-3">
            <span class="font-bold block text-slate-500 text-[9px] uppercase tracking-wide mb-1">
              AI Strategic Recommendations &amp; Action Plan
            </span>
            <div class="text-[11px] leading-relaxed text-slate-700 whitespace-pre-line bg-slate-50 p-4 rounded border border-slate-200">
              ${summary}
            </div>
          </div>
        </div>

        <div class="border-t-2 border-slate-800 pt-6 mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-[9px] relative z-10">
          <div class="max-w-md text-slate-400">
            <p class="font-bold">${t.receiptDisclaimerLabel}</p>
            <p class="leading-tight mt-0.5">
              ${t.receiptDisclaimerText}
            </p>
          </div>
          <div class="text-right self-end sm:self-auto border border-dashed border-slate-400 p-2 rounded bg-slate-50">
            <div class="font-black text-[#000080] uppercase tracking-wider text-[10px]">${t.receiptSecureLabel}</div>
            <div class="text-slate-400 font-mono mt-0.5">REF: JSA-PLAN-${Math.floor(10000 + Math.random() * 90000)}</div>
            <div class="text-slate-400">${t.receiptStatusVerified}</div>
          </div>
        </div>
      </div>
    `);

    printWindow.document.write('</body></html>');
    printWindow.document.close();

    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 500);
  };

  // Helper to format the AI response text beautifully
  const renderFormattedSummary = (text) => {
    if (!text) return null;

    const dateStr = new Date().toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return (
      <div className="space-y-4">
        {/* Receipt-Themed Report Preview */}
        <div className={`p-6 border-2 rounded-xl relative overflow-hidden transition-all duration-200 ${
          highContrast 
            ? 'bg-slate-950 border-yellow-500 text-yellow-300' 
            : 'bg-white border-slate-300 text-slate-800 shadow-inner'
        }`}>
          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 opacity-[0.02]">
            <img src={ashokaChakra} alt="" className="h-64 w-64 object-contain select-none pointer-events-none" />
          </div>

          {/* Tricolor Strip */}
          <div className="h-1.5 w-full flex mb-4 relative z-10">
            <div className="bg-[#FF9933] flex-1"></div>
            <div className="bg-slate-200 w-1/12"></div>
            <div className="bg-[#138808] flex-1"></div>
          </div>

          {/* Report Header */}
          <div className={`text-center pb-4 mb-4 border-b ${
            highContrast ? 'border-yellow-500/20' : 'border-slate-200'
          } relative z-10`}>
            <div className="flex justify-center mb-1.5">
              <img src={emblemOfIndia} alt="Emblem" className="h-12 w-auto select-none object-contain" />
            </div>
            <h4 className={`text-[10px] font-black tracking-widest uppercase ${highContrast ? 'text-yellow-400' : 'text-[#000080]'}`}>
              {t.goiText}
            </h4>
            <h3 className={`text-xs font-black tracking-tight mt-0.5 ${highContrast ? 'text-white' : 'text-[#000080]'}`}>
              {t.modalTitle}
            </h3>
          </div>

          {/* Report Metadata */}
          <div className="grid grid-cols-2 gap-3 text-[10px] leading-tight mb-4 relative z-10">
            <div>
              <span className="text-slate-400 font-extrabold uppercase text-[8px] tracking-wider block mb-0.5">{t.dbScopeLabel}</span>
              <span className="font-bold">{selectedLocation || 'All Regions'}</span>
            </div>
            <div>
              <span className="text-slate-400 font-extrabold uppercase text-[8px] tracking-wider block mb-0.5">Date</span>
              <span className="font-bold">{dateStr}</span>
            </div>
          </div>

          {/* Report Text Content */}
          <div className={`p-4 rounded-lg border text-[11px] leading-relaxed whitespace-pre-line relative z-10 font-medium ${
            highContrast 
              ? 'bg-slate-900 border-yellow-500/20 text-yellow-100' 
              : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}>
            {text}
          </div>

          {/* Report Footer */}
          <div className={`border-t pt-4 mt-4 flex items-center justify-between text-[8px] opacity-75 relative z-10 ${
            highContrast ? 'border-yellow-500/20' : 'border-slate-200'
          }`}>
            <div className="max-w-[70%]">
              <p className="font-bold">Secure Digitally Signed Analysis</p>
            </div>
            <div className="text-right font-mono">
              STATUS: SECURE
            </div>
          </div>
        </div>

        {/* Download & Print Button */}
        <button
          onClick={handlePrintReport}
          className={`w-full inline-flex items-center justify-center space-x-2.5 font-bold py-3 px-6 rounded-xl border transition-all duration-200 hover:scale-[1.01] cursor-pointer shadow-md text-xs ${
            highContrast
              ? 'bg-yellow-400 text-black border-yellow-400 hover:bg-yellow-300'
              : 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 hover:shadow-lg'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
          </svg>
          <span>{t.modalDownloadPdf}</span>
        </button>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className={`relative w-full max-w-lg md:max-w-xl rounded-2xl shadow-2xl border flex flex-col max-h-[90vh] overflow-hidden transition-all duration-200 ${
        highContrast 
          ? 'bg-[#1e293b] border-yellow-500 text-yellow-300' 
          : 'bg-white border-slate-200 text-slate-800'
      }`}>
        
        {/* Header */}
        <div className={`px-6 py-4 flex items-center justify-between border-b ${
          highContrast ? 'border-yellow-500/20' : 'border-slate-100'
        }`}>
          <div className="flex items-center space-x-2.5">
            <div className={`p-2 rounded-xl ${
              highContrast ? 'bg-yellow-500/10' : 'bg-indigo-50'
            }`}>
              <Sparkles className={`h-5 w-5 ${highContrast ? 'text-yellow-400' : 'text-indigo-600'}`} />
            </div>
            <div>
              <h3 className={`text-base font-black tracking-tight ${highContrast ? 'text-white' : 'text-slate-900'}`}>
                {t.modalTitle}
              </h3>
              <p className="text-[10px] opacity-70 font-bold uppercase tracking-wider">{t.modalSubtitle}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              highContrast 
                ? 'hover:bg-yellow-500/10 text-yellow-300' 
                : 'hover:bg-slate-100 text-slate-400 hover:text-slate-600'
            }`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Target Location Banner */}
          <div className={`p-4 rounded-xl border flex items-center justify-between ${
            highContrast 
              ? 'bg-slate-950 border-yellow-500/10' 
              : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${
                highContrast ? 'bg-yellow-500/10' : 'bg-[#138808]/10'
              }`}>
                <MapPin className={`h-4.5 w-4.5 ${highContrast ? 'text-yellow-400' : 'text-[#138808]'}`} />
              </div>
              <div>
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">{t.modalAnalyzingLocality}</span>
                <p className={`text-sm font-black ${highContrast ? 'text-yellow-200' : 'text-slate-800'}`}>
                  {selectedLocation || 'N/A'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-1 font-bold text-xs uppercase tracking-wide">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="opacity-70">Ready</span>
            </div>
          </div>

          {/* Area Metrics */}
          <div className="grid grid-cols-2 gap-4">
            {/* Metric: Complaints Count */}
            <div className={`p-4 rounded-xl border text-center flex flex-col justify-center items-center ${
              highContrast 
                ? 'bg-slate-950 border-yellow-500/10 text-yellow-300' 
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              <Inbox className={`h-5 w-5 mb-1.5 ${highContrast ? 'text-yellow-400' : 'text-amber-600'}`} />
              <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">{t.modalLocalComplaints}</p>
              <span className={`text-2xl font-black mt-1 ${
                highContrast ? 'text-white' : 'text-slate-800'
              }`}>{complaintsCount}</span>
            </div>

            {/* Metric: Total Votes/Support */}
            <div className={`p-4 rounded-xl border text-center flex flex-col justify-center items-center ${
              highContrast 
                ? 'bg-slate-950 border-yellow-500/10 text-yellow-300' 
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              <Star className={`h-5 w-5 mb-1.5 ${highContrast ? 'text-yellow-400' : 'text-[#138808]'}`} />
              <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">{t.dbScopeTotalVotes}</p>
              <span className={`text-2xl font-black mt-1 ${
                highContrast ? 'text-white' : 'text-slate-800'
              }`}>{totalVotes}</span>
            </div>
          </div>

          {/* Prompt/Generate Button (if no result yet) */}
          {!loading && !error && !summary && (
            <div className="text-center space-y-4 py-4">
              <p className={`text-xs md:text-sm font-medium ${
                highContrast ? 'text-yellow-200' : 'text-slate-600'
              }`}>
                Click the button below to process citizen feeds in {selectedLocation} and formulate a prioritized constituency development plan using Gemini AI models.
              </p>
              
              <button
                onClick={generateActionPlan}
                className={`w-full inline-flex items-center justify-center space-x-2.5 font-bold py-3.5 px-6 rounded-xl border transition-all duration-200 hover:scale-[1.01] cursor-pointer shadow-md text-sm ${
                  highContrast
                    ? 'bg-yellow-400 text-black border-yellow-400 hover:bg-yellow-300'
                    : 'bg-[#000080] text-white border-[#000080] hover:bg-[#000080]/90 hover:shadow-lg'
                }`}
              >
                <Sparkles className="h-4.5 w-4.5" />
                <span>{t.dbBtnGeneratePlan}</span>
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
              <div className="relative">
                <div className={`w-12 h-12 border-4 rounded-full animate-spin ${
                  highContrast ? 'border-yellow-500/20 border-t-yellow-400' : 'border-slate-200 border-t-indigo-600'
                }`}></div>
                <Sparkles className={`h-5 w-5 absolute top-3.5 left-3.5 animate-pulse ${
                  highContrast ? 'text-yellow-400' : 'text-indigo-500'
                }`} />
              </div>
              <div className="text-center">
                <p className={`text-sm font-extrabold ${highContrast ? 'text-yellow-300' : 'text-slate-800'}`}>
                  {t.modalSynthesizingPlan}
                </p>
                <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">
                  {t.modalPromptText}
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className={`p-4 rounded-xl border ${
              highContrast 
                ? 'bg-red-950/20 border-red-500/50 text-red-300' 
                : 'bg-red-50 border-red-200 text-red-800'
            } space-y-3`}>
              <div className="flex items-start space-x-2">
                <AlertOctagon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-xs uppercase tracking-wide">Analysis Blocked</h4>
                  <p className="text-xs md:text-sm font-medium mt-1">{error}</p>
                </div>
              </div>
              
              <button
                onClick={generateActionPlan}
                className={`inline-flex items-center space-x-1.5 text-xs font-black border px-3.5 py-2 rounded-lg cursor-pointer transition ${
                  highContrast
                    ? 'bg-slate-900 border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10'
                    : 'bg-white border-slate-300 hover:bg-slate-50 text-slate-700 shadow-xs'
                }`}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>{t.modalRetry}</span>
              </button>
            </div>
          )}

          {/* Success State */}
          {summary && renderFormattedSummary(summary)}

        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t flex justify-between items-center ${
          highContrast ? 'border-yellow-500/20 bg-slate-950/40' : 'border-slate-100 bg-slate-50'
        }`}>
          <div className="flex items-center space-x-1.5 opacity-60 text-[9px] font-bold uppercase tracking-wider">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
            <span>Gemini 1.5 Flash Enabled</span>
          </div>

          <div className="flex items-center space-x-2">
            {summary && (
              <button
                onClick={generateActionPlan}
                disabled={loading}
                className={`text-xs font-black border px-3 py-1.5 rounded-lg cursor-pointer transition flex items-center space-x-1.5 ${
                  highContrast
                    ? 'bg-slate-900 border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10'
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 shadow-xs'
                }`}
              >
                <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                <span>{t.modalRegenerate}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className={`text-xs font-black border px-3 py-1.5 rounded-lg cursor-pointer transition ${
                highContrast
                  ? 'bg-yellow-400 text-black border-yellow-400 hover:bg-yellow-300'
                  : 'bg-white border-slate-300 hover:bg-slate-50 text-slate-700 shadow-xs'
              }`}
            >
              {t.modalClose}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
