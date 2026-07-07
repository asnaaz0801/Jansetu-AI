import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { translations } from '../lib/translations';
import {
  Sparkles,
  Mic,
  Send,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

// Predefined Quick Suggestions Chips mapping queryIntent IDs
const SUGGESTION_CHIPS = [
  { labelKey: 'submit', queryIntent: 'submitComplaint' },
  { labelKey: 'track', queryIntent: 'trackComplaint' },
  { labelKey: 'gps', queryIntent: 'gpsHelp' },
  { labelKey: 'languages', queryIntent: 'supportedLanguages' },
  { labelKey: 'notices', queryIntent: 'publicNotices' },
  { labelKey: 'actionPlanner', queryIntent: 'actionPlanner' },
  { labelKey: 'analytics', queryIntent: 'analytics' },
  { labelKey: 'contact', queryIntent: 'contactSupport' }
];

// Predefined Left Sidebar Suggestion Cards mapping queryIntent IDs
const SIDEBAR_SUGGESTIONS = [
  { labelKey: 'submit', icon: '📝', queryIntent: 'submitComplaint' },
  { labelKey: 'track', icon: '🔍', queryIntent: 'trackComplaint' },
  { labelKey: 'notices', icon: '📢', queryIntent: 'publicNotices' },
  { labelKey: 'gps', icon: '📍', queryIntent: 'gpsHelp' },
  { labelKey: 'languages', icon: '🌐', queryIntent: 'supportedLanguages' },
  { labelKey: 'categories', icon: '📂', queryIntent: 'complaintCategories' },
  { labelKey: 'features', icon: '⚙️', queryIntent: 'platformFeatures' }
];

export default function HelpSupport({ language = 'en', fontSize = 16, highContrast = false }) {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const contactCardRef = useRef(null);

  // Local translation function that mirrors the t("helpSupport...") requirement
  const t = (key) => {
    const parts = key.split('.');
    let current = translations[language] || translations.en;
    for (const part of parts) {
      current = current ? current[part] : undefined;
    }
    // Fallback to English if undefined for this language
    if (current === undefined) {
      current = translations.en;
      for (const part of parts) {
        current = current ? current[part] : undefined;
      }
    }
    return current || '';
  };

  // States
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      intentId: 'welcomeStart',
      timestamp: new Date()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState(null);

  // FAQ Accordion State
  const [expandedFaq, setExpandedFaq] = useState({
    faq1: false,
    faq2: false,
    faq3: false,
    faq4: false,
    faq5: false
  });

  // Intent query mappings in case user types something
  const getIntentFromText = (text) => {
    const cleanText = text.trim().toLowerCase();

    if (
      cleanText.includes('how do i submit a complaint') ||
      cleanText.includes('i want to submit a complaint') ||
      (cleanText.includes('submit') && cleanText.includes('complaint')) ||
      (cleanText.includes('how') && cleanText.includes('submit')) ||
      cleanText.includes('file a complaint')
    ) {
      return 'submitComplaint';
    }

    if (
      cleanText.includes('track') ||
      cleanText.includes('status') ||
      cleanText.includes('progress')
    ) {
      return 'trackComplaint';
    }

    if (cleanText.includes('gps') || cleanText.includes('location')) {
      return 'gpsHelp';
    }

    if (cleanText.includes('language') || cleanText.includes('languages')) {
      return 'supportedLanguages';
    }

    if (
      cleanText.includes('notice') ||
      cleanText.includes('notices') ||
      cleanText.includes('public notice') ||
      cleanText.includes('public notices')
    ) {
      return 'publicNotices';
    }

    if (cleanText.includes('action planner') || cleanText.includes('planner')) {
      return 'actionPlanner';
    }

    if (cleanText.includes('analytics') || cleanText.includes('dashboard') || cleanText.includes('trends') || cleanText.includes('chart') || cleanText.includes('metrics')) {
      return 'analytics';
    }

    if (cleanText.includes('contact') || cleanText.includes('support')) {
      return 'contactSupport';
    }

    if (cleanText.includes('category') || cleanText.includes('categories')) {
      return 'complaintCategories';
    }

    if (cleanText.includes('feature') || cleanText.includes('features') || cleanText.includes('what can you do') || cleanText.includes('capabilities') || cleanText.includes('provide') || cleanText.includes('function')) {
      return 'platformFeatures';
    }

    return 'unknown';
  };

  const getResponseForIntent = (intentId) => {
    switch (intentId) {
      case 'submitComplaint':
        return {
          intentId: 'submitComplaint',
          actions: ['submit_complaint']
        };
      case 'trackComplaint':
        return {
          intentId: 'trackComplaint',
          actions: ['track_complaint']
        };
      case 'gpsHelp':
        return {
          intentId: 'gpsHelp',
          actions: []
        };
      case 'supportedLanguages':
        return {
          intentId: 'supportedLanguages',
          actions: []
        };
      case 'publicNotices':
        return {
          intentId: 'publicNotices',
          actions: ['view_notices']
        };
      case 'actionPlanner':
        return {
          intentId: 'actionPlanner',
          actions: []
        };
      case 'analytics':
        return {
          intentId: 'analytics',
          actions: []
        };
      case 'contactSupport':
        return {
          intentId: 'contactSupport',
          actions: []
        };
      case 'complaintCategories':
        return {
          intentId: 'complaintCategories',
          actions: []
        };
      case 'platformFeatures':
        return {
          intentId: 'platformFeatures',
          actions: []
        };
      default:
        return {
          intentId: 'unknown',
          actions: [],
          showSuggestions: true
        };
    }
  };

  const getQueryForIntent = (intentId) => {
    switch (intentId) {
      case 'submitComplaint':
        return t("helpSupport.suggestions.submit");
      case 'trackComplaint':
        return t("helpSupport.suggestions.track");
      case 'gpsHelp':
        return t("helpSupport.suggestions.gps");
      case 'supportedLanguages':
        return t("helpSupport.suggestions.languages");
      case 'publicNotices':
        return t("helpSupport.suggestions.notices");
      case 'actionPlanner':
        return t("helpSupport.suggestions.actionPlanner");
      case 'analytics':
        return t("helpSupport.suggestions.analytics");
      case 'contactSupport':
        return t("helpSupport.suggestions.contact");
      case 'complaintCategories':
        return t("helpSupport.suggestions.categories");
      case 'platformFeatures':
        return t("helpSupport.suggestions.features");
      default:
        return '';
    }
  };

  // Speech Recognition Setup
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  const startListening = () => {
    if (!SpeechRecognition) {
      alert(t("helpSupport.assistant.speechNotSupported") || "Speech recognition is not supported in this browser. Please try Chrome or Edge.");
      return;
    }

    setSpeechError(null);
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-IN';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        handleSendMessage(transcript);
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setSpeechError(event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = (textToSend, intentId = null) => {
    const text = textToSend || inputText;
    if (!text.trim() && !intentId) return;

    if (!textToSend) setInputText('');

    let userMessageText = text;
    let resolvedIntent = intentId;
    let queryKey = null;

    if (intentId) {
      switch (intentId) {
        case 'submitComplaint': queryKey = 'submit'; break;
        case 'trackComplaint': queryKey = 'track'; break;
        case 'gpsHelp': queryKey = 'gps'; break;
        case 'supportedLanguages': queryKey = 'languages'; break;
        case 'publicNotices': queryKey = 'notices'; break;
        case 'actionPlanner': queryKey = 'actionPlanner'; break;
        case 'analytics': queryKey = 'analytics'; break;
        case 'contactSupport': queryKey = 'contact'; break;
        case 'complaintCategories': queryKey = 'categories'; break;
        case 'platformFeatures': queryKey = 'features'; break;
        default: break;
      }
      userMessageText = getQueryForIntent(intentId);
    } else {
      resolvedIntent = getIntentFromText(text);
    }

    // Append User Message
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: userMessageText,
      queryKey,
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    // Simulate thinking delay for chatbot feel
    setTimeout(() => {
      const response = getResponseForIntent(resolvedIntent);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          intentId: response.intentId,
          actions: response.actions || [],
          showSuggestions: response.showSuggestions || false,
          timestamp: new Date()
        }
      ]);
      setIsTyping(false);
    }, 600);
  };

  const handleActionClick = (action) => {
    switch (action) {
      case 'submit_complaint':
        navigate('/submit');
        break;
      case 'track_complaint':
        navigate('/track');
        break;
      case 'view_notices':
        navigate('/notices');
        break;
      default:
        break;
    }
  };

  const toggleFaq = (key) => {
    setExpandedFaq(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Helper mappings
  const getActionIconAndLabel = (action) => {
    switch (action) {
      case 'submit_complaint':
        return (
          <>
            <span>📝</span>
            <span>{t("helpSupport.buttons.openSubmit")}</span>
          </>
        );
      case 'track_complaint':
        return (
          <>
            <span>🔍</span>
            <span>{t("helpSupport.buttons.openTrack")}</span>
          </>
        );
      case 'view_notices':
        return (
          <>
            <span>📢</span>
            <span>{t("helpSupport.buttons.viewNotices")}</span>
          </>
        );
      default:
        return (
          <>
            <span>🔗</span>
            <span>Go</span>
          </>
        );
    }
  };

  const getChipEmoji = (key) => {
    switch (key) {
      case 'submit': return '📝';
      case 'track': return '🔍';
      case 'gps': return '📍';
      case 'languages': return '🌐';
      case 'notices': return '📢';
      case 'actionPlanner': return '🧠';
      case 'analytics': return '📊';
      case 'contact': return '☎';
      default: return '🔗';
    }
  };

  const getMessageText = (msg) => {
    if (msg.sender === 'user') {
      return msg.queryKey ? t(`helpSupport.suggestions.${msg.queryKey}`) : msg.text;
    } else {
      if (msg.intentId) {
        if (msg.intentId === 'welcomeStart') {
          return t("helpSupport.assistant.welcomeStart");
        }
        return t(`helpSupport.responses.${msg.intentId}`);
      }
      return msg.text;
    }
  };

  const faqKeys = ['faq1', 'faq2', 'faq3', 'faq4', 'faq5'];

  return (
    <div className={`flex-1 transition-colors duration-200 py-10 px-4 md:px-8 max-w-5xl mx-auto w-full space-y-12 ${
      highContrast ? 'bg-[#0f172a] text-yellow-300' : 'bg-[#F8FAFC] text-slate-800'
    }`}>

      {/* SECTION 1 — HERO */}
      <header className={`text-center space-y-4 rounded-3xl p-8 md:p-12 border shadow-lg transition-all duration-300 relative overflow-hidden ${
        highContrast
          ? 'bg-[#1e293b] border-yellow-500/30 text-yellow-300'
          : 'bg-gradient-to-br from-[#000080] to-[#000066] border-blue-900 text-white'
      }`}>
        <div className="absolute top-0 left-0 right-0 h-1.5 flex">
          <div className="bg-[#FF9933] flex-1"></div>
          <div className="bg-white flex-1"></div>
          <div className="bg-[#138808] flex-1"></div>
        </div>

        {!highContrast && (
          <>
            <div className="absolute top-0 left-0 w-32 h-32 bg-[#FF9933]/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#138808]/10 rounded-full blur-3xl"></div>
          </>
        )}

        <div className="flex justify-center mb-4">
          <span className="text-5xl" role="img" aria-label="Help">🆘</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight">
          {t("helpSupport.hero.title")}
        </h1>
        <p className={`text-lg md:text-xl font-bold tracking-tight ${highContrast ? 'text-yellow-200' : 'text-slate-200'}`}>
          {t("helpSupport.hero.subtitle")}
        </p>
        <p className={`max-w-2xl mx-auto text-sm leading-relaxed ${highContrast ? 'text-yellow-100/90' : 'text-slate-200/95 font-medium'}`}>
          {t("helpSupport.hero.description")}
        </p>
      </header>

      {/* SECTION 2 — AI ASSISTANT */}
      <section className={`border rounded-2xl shadow-md overflow-hidden transition-all duration-200 ${
        highContrast ? 'bg-[#1e293b] border-yellow-500' : 'bg-white border-slate-200'
      }`}>

        {/* Card Header */}
        <div className={`p-4 md:p-6 border-b flex items-center justify-between ${
          highContrast ? 'border-yellow-500 bg-[#0f172a]/40' : 'border-slate-100 bg-slate-50/50'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-xl ${highContrast ? 'bg-yellow-500/10' : 'bg-blue-50'}`}>
              <span className="text-2xl">🤖</span>
            </div>
            <div>
              <h2 className="text-base md:text-lg font-black tracking-tight">
                {t("helpSupport.assistant.header")}
              </h2>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600 dark:text-emerald-400">
                  {t("helpSupport.assistant.status")}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1 opacity-85">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg"
              alt="GOI Emblem"
              className="h-7 w-auto opacity-75"
            />
            <span className="text-[9px] font-black uppercase tracking-widest text-[#FF9933] hidden sm:inline">
              {t("helpSupport.assistant.goiDigital")}
            </span>
          </div>
        </div>

        {/* Layout grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-slate-800">

          {/* Left panel suggestion cards */}
          <div className={`lg:col-span-4 p-5 md:p-6 space-y-4 text-xs md:text-sm font-semibold select-none ${
            highContrast ? 'bg-[#0f172a]/20' : 'bg-slate-50/30'
          }`}>
            <div className="space-y-1">
              <span className="text-xl">{t("helpSupport.assistant.welcomeGreeting")}</span>
              <p className="font-bold">{t("helpSupport.assistant.header")}</p>
              <p className="opacity-85 whitespace-pre-line">{t("helpSupport.assistant.welcomeText")}</p>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
              <p className={`font-black uppercase tracking-wider text-[10px] ${highContrast ? 'text-yellow-400' : 'text-slate-400'}`}>
                {t("helpSupport.assistant.welcomeListTitle")}
              </p>
              <div className="space-y-2">
                {SIDEBAR_SUGGESTIONS.map((item) => (
                  <button
                    key={item.labelKey}
                    onClick={() => handleSendMessage('', item.queryIntent)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-xl border text-left text-xs font-bold transition-all duration-200 cursor-pointer ${
                      highContrast
                        ? 'bg-slate-900 border-yellow-500/20 text-yellow-300 hover:border-yellow-400 hover:bg-slate-800/40 hover:shadow-sm'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-[#000080] hover:bg-blue-50/50 hover:shadow-sm'
                    }`}
                  >
                    <span className="text-base select-none">{item.icon}</span>
                    <span className="leading-tight">{t("helpSupport.suggestions." + item.labelKey)}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right panel: Chat messages and input */}
          <div className="lg:col-span-8 flex flex-col h-[500px]">

            {/* Message log */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className="space-y-2">

                  <div className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm text-sm ${
                      msg.sender === 'user'
                        ? highContrast
                          ? 'bg-yellow-400 text-black rounded-tr-none font-bold'
                          : 'bg-[#FF9933] text-white rounded-tr-none'
                        : highContrast
                          ? 'bg-[#1e293b] text-yellow-300 border border-yellow-500/40 rounded-tl-none'
                          : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-100'
                    }`}>
                      <p className="whitespace-pre-line leading-relaxed font-medium">
                        {getMessageText(msg)}
                      </p>
                    </div>
                  </div>

                  {/* Predefined Action Cards inside chat feed */}
                  {msg.sender === 'ai' && msg.actions && msg.actions.length > 0 && (
                    <div className="flex justify-start pl-2">
                      <div className={`w-full max-w-[85%] mt-1 p-4 rounded-xl border transition-all ${
                        highContrast
                          ? 'bg-[#1e293b] border-yellow-500 text-yellow-200'
                          : 'bg-gradient-to-br from-blue-50/50 to-white border-blue-100 shadow-sm'
                      }`}>
                        <div className="flex items-center justify-between border-b pb-2 mb-3 border-slate-100 dark:border-slate-800/60">
                          <div className="flex items-center space-x-1.5">
                            <span className="text-sm">🎯</span>
                            <h4 className={`text-xs font-black tracking-tight ${highContrast ? 'text-yellow-300' : 'text-[#000080]'}`}>
                              {t("helpSupport.assistant.recommendedAction")}
                            </h4>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {msg.actions.map((act) => (
                            <button
                              key={act}
                              onClick={() => handleActionClick(act)}
                              className={`flex items-center space-x-1.5 font-bold py-1.5 px-3 rounded-lg border transition-all text-xs cursor-pointer shadow-sm ${
                                highContrast
                                  ? 'bg-yellow-400 text-black border-yellow-400 hover:bg-yellow-300'
                                  : 'bg-white hover:bg-[#FF9933] text-[#000080] hover:text-white border-blue-200 hover:border-[#FF9933] shadow-sm'
                              }`}
                            >
                              {getActionIconAndLabel(act)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Suggestion Chips automatically shown on unknown fallback */}
                  {msg.sender === 'ai' && msg.showSuggestions && (
                    <div className="flex justify-start pl-2">
                      <div className="flex flex-wrap gap-2 mt-1 max-w-[85%]">
                        {SUGGESTION_CHIPS.map((chip) => (
                          <button
                            key={chip.labelKey}
                            onClick={() => handleSendMessage('', chip.queryIntent)}
                            className={`py-1.5 px-3 rounded-full border text-[11px] font-bold transition-all hover:scale-105 cursor-pointer shadow-sm ${
                              highContrast
                                ? 'bg-slate-900 border-yellow-500 text-yellow-300 hover:bg-yellow-500 hover:text-black'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-[#FF9933] hover:text-[#FF9933] hover:bg-orange-50/5'
                            }`}
                          >
                            {getChipEmoji(chip.labelKey)} {t("helpSupport.suggestions." + chip.labelKey)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              ))}

              {/* Typing simulation dots */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className={`rounded-2xl px-4 py-3 text-sm flex items-center space-x-1 ${
                    highContrast ? 'bg-[#1e293b] border border-yellow-500/40' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <span className="h-1.5 w-1.5 bg-slate-400 dark:bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="h-1.5 w-1.5 bg-slate-400 dark:bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="h-1.5 w-1.5 bg-slate-400 dark:bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Voice listening indicators */}
            {isListening && (
              <div className="mx-4 p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-center text-xs animate-pulse text-red-500 font-bold">
                {t("helpSupport.buttons.listening")}
              </div>
            )}

            {speechError && (
              <div className="mx-4 p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-center text-xs text-amber-500 font-bold">
                {t("helpSupport.buttons.voiceError")} {speechError}
              </div>
            )}

            {/* Input form */}
            <div className={`p-4 border-t ${
              highContrast ? 'border-yellow-500 bg-[#1e293b]/40' : 'border-slate-100 bg-slate-50/50'
            }`}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center space-x-2"
              >
                <button
                  type="button"
                  onClick={startListening}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                    isListening
                      ? 'bg-red-500 border-red-500 text-white animate-pulse'
                      : highContrast
                        ? 'bg-slate-900 border-yellow-500 text-yellow-300 hover:bg-yellow-500 hover:text-black'
                        : 'bg-white border-slate-200 text-slate-600 hover:text-slate-800 hover:border-slate-350 shadow-sm'
                  }`}
                  title={t("helpSupport.buttons.voiceInput")}
                >
                  <Mic className="h-5 w-5" />
                </button>

                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={t("helpSupport.buttons.placeholder")}
                  className={`flex-1 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                    highContrast
                      ? 'bg-slate-900 border-yellow-500 text-yellow-300 placeholder-yellow-600/70 focus:outline-yellow-400'
                      : 'bg-white border-slate-250 text-slate-800 placeholder-slate-400 focus:border-[#000080]'
                  }`}
                />

                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                    inputText.trim()
                      ? highContrast
                        ? 'bg-yellow-400 text-black border-yellow-400 hover:bg-yellow-300'
                        : 'bg-[#000080] hover:bg-[#FF9933] text-white'
                      : 'bg-slate-200 text-slate-400 border-transparent cursor-not-allowed'
                  }`}
                >
                  <Send className="h-5 w-5" />
                </button>
              </form>
            </div>

          </div>

        </div>

      </section>

      {/* QUICK SUGGESTIONS SECTION */}
      <section className="space-y-4">
        <h3 className={`text-xs uppercase font-black tracking-widest text-center ${highContrast ? 'text-yellow-400' : 'text-slate-400'}`}>
          {t("helpSupport.suggestions.title")}
        </h3>
        <div className="flex flex-wrap justify-center gap-2.5 max-w-3xl mx-auto">
          {SUGGESTION_CHIPS.map((chip) => (
            <button
              key={chip.labelKey}
              onClick={() => handleSendMessage('', chip.queryIntent)}
              className={`py-2 px-4 rounded-full border text-xs font-bold transition-all hover:scale-105 cursor-pointer shadow-sm ${
                highContrast
                  ? 'bg-slate-900 border-yellow-500/40 text-yellow-300 hover:border-yellow-400 hover:bg-yellow-500/5'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-[#FF9933] hover:text-[#FF9933] hover:bg-orange-50/10'
              }`}
            >
              {getChipEmoji(chip.labelKey)} {t("helpSupport.suggestions." + chip.labelKey)}
            </button>
          ))}
        </div>
      </section>

      {/* FAQ ACCORDION SECTION */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">
            {t("helpSupport.faq.title")}
          </h2>
          <p className={`text-xs font-bold uppercase tracking-wider mt-1 ${highContrast ? 'text-yellow-400' : 'text-slate-400'}`}>
            {t("helpSupport.faq.subtitle")}
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqKeys.map((key, index) => {
            const isExpanded = expandedFaq[key];
            return (
              <div
                key={key}
                className={`border rounded-xl transition shadow-sm overflow-hidden ${
                  highContrast ? 'bg-[#1e293b] border-yellow-500/30 text-yellow-300' : 'bg-white border-slate-200/90 text-slate-800'
                }`}
              >
                <button
                  onClick={() => toggleFaq(key)}
                  className={`w-full flex items-center justify-between p-4 font-bold text-sm md:text-base text-left cursor-pointer transition ${
                    highContrast ? 'hover:bg-yellow-500/5' : 'hover:bg-slate-50/50'
                  }`}
                >
                  <span>{t(`helpSupport.faq.q${index + 1}`)}</span>
                  {isExpanded ? <ChevronUp className="h-4.5 w-4.5" /> : <ChevronDown className="h-4.5 w-4.5" />}
                </button>

                {isExpanded && (
                  <div className={`p-4 text-xs md:text-sm font-semibold border-t leading-relaxed opacity-90 ${
                    highContrast ? 'border-yellow-500/30' : 'border-slate-100 bg-slate-50/20'
                  }`}>
                    {t(`helpSupport.faq.a${index + 1}`)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* CONTACT SUPPORT CARD */}
      <section
        ref={contactCardRef}
        className={`max-w-3xl mx-auto rounded-2xl border p-6 md:p-8 text-center space-y-4 shadow-md transition-all duration-200 relative overflow-hidden ${
          highContrast
            ? 'bg-[#1e293b] border-yellow-500 text-yellow-300'
            : 'bg-white border-slate-250 text-slate-850'
        }`}
      >
        <div className="absolute top-0 left-0 right-0 h-1 flex">
          <div className="bg-[#FF9933] flex-1"></div>
          <div className="bg-white flex-1"></div>
          <div className="bg-[#138808] flex-1"></div>
        </div>

        <h3 className="text-xl font-black tracking-tight">{t("helpSupport.contact.title")}</h3>

        <div className="space-y-1">
          <p className="text-sm font-bold">{t("helpSupport.contact.subtitle")}</p>
          <a
            href="mailto:jansetusupportteam@gmail.com"
            className="text-base font-black text-[#000080] dark:text-yellow-400 hover:underline tracking-tight block"
          >
            jansetusupportteam@gmail.com
          </a>
        </div>

        <p className="text-xs opacity-75 font-semibold max-w-md mx-auto">
          {t("helpSupport.contact.desc")}
        </p>
      </section>

    </div>
  );
}
