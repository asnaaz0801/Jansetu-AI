import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Landmark, Globe, Check, ZoomIn, ZoomOut, Contrast } from 'lucide-react';
import { translations } from '../lib/translations';
import emblemOfIndia from '../assets/emblem-of-india.svg';

export default function Navbar({
  language,
  setLanguage,
  fontSize,
  setFontSize,
  highContrast,
  setHighContrast,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const t = translations[language];

  // Citizen Portal Navigation Items
  const citizenNavItems = [
    { name: t.home, id: 'hero' },
    { name: t.submitIssue, id: 'main-card' },
    { name: t.trackRequest, id: 'active-feed' },
    { name: t.insights, id: 'insights-section' },
    { name: t.about, id: 'about-section' },
    { name: t.help, id: 'footer' },
  ];

  const handleNavClick = (sectionId) => {
    setIsOpen(false);
    if (sectionId === 'active-feed') {
      navigate('/track');
      return;
    }
    if (sectionId === 'main-card') {
      navigate('/submit');
      return;
    }
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80; // height of sticky navbar
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  const languages = [
    { code: 'en', label: '🇮🇳 English' },
    { code: 'hi', label: '🇮🇳 हिंदी (Hindi)' },
    { code: 'mr', label: '🇮🇳 मराठी (Marathi)' },
  ];

  const increaseFontSize = () => {
    if (fontSize < 24) setFontSize((prev) => prev + 1);
  };

  const decreaseFontSize = () => {
    if (fontSize > 12) setFontSize((prev) => prev - 1);
  };

  const resetFontSize = () => {
    setFontSize(16);
  };

  return (
    <div className="w-full z-50 sticky top-0">
      {/* Official Top Bar with Tricolor & Accessibility controls */}
      <div className={`text-xs border-b transition-colors duration-200 ${
        highContrast 
          ? 'bg-[#090d16] text-[#fef08a] border-yellow-500/30' 
          : 'bg-[#000080] text-white border-blue-900'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-10 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-semibold tracking-wide">
              {language === 'en' ? 'Ministry of Electronics & IT' : language === 'hi' ? 'इलेक्ट्रॉनिक्स और आईटी मंत्रालय' : 'इलेक्ट्रॉनिक्स आणि आयटी मंत्रालय'}
            </span>
          </div>

          {/* Accessibility & Quick links */}
          <div className="flex items-center space-x-4">
            {/* Font Resize controls */}
            <div className="flex items-center space-x-1.5 border-r border-white/20 pr-4">
              <button 
                onClick={decreaseFontSize}
                title="Decrease Text Size (A-)"
                className="hover:bg-white/10 px-1.5 py-0.5 rounded font-bold transition cursor-pointer"
              >
                A-
              </button>
              <button 
                onClick={resetFontSize}
                title="Normal Text Size (A)"
                className="hover:bg-white/10 px-1.5 py-0.5 rounded font-bold transition cursor-pointer"
              >
                A
              </button>
              <button 
                onClick={increaseFontSize}
                title="Increase Text Size (A+)"
                className="hover:bg-white/10 px-1.5 py-0.5 rounded font-bold transition cursor-pointer"
              >
                A+
              </button>
            </div>

            {/* High Contrast Toggle */}
            <button 
              onClick={() => setHighContrast(!highContrast)}
              className="flex items-center space-x-1 hover:bg-white/10 px-2 py-0.5 rounded transition cursor-pointer"
              title="Toggle High Contrast Mode"
            >
              <Contrast className="h-3.5 w-3.5" />
              <span className="hidden sm:inline font-medium">
                {highContrast 
                  ? (language === 'en' ? 'Normal Contrast' : language === 'hi' ? 'सामान्य कंट्रास्ट' : 'सामान्य कॉन्ट्रास्ट') 
                  : (language === 'en' ? 'High Contrast' : language === 'hi' ? 'उच्च कंट्रास्ट' : 'उच्च कॉन्ट्रास्ट')}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Sticky Navbar */}
      <nav className={`shadow-md transition-colors duration-200 ${
        highContrast 
          ? 'bg-[#0f172a] text-[#fef08a] border-b-2 border-yellow-500' 
          : 'bg-[#FFFFFF] text-slate-800'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo / Brand */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2.5 group">
                {location.pathname === '/' ? (
                  <div className={`p-2 rounded-lg transition-colors duration-200 ${
                    highContrast ? 'bg-yellow-400 text-black' : 'bg-[#000080] text-white'
                  }`}>
                    <Landmark className="h-5 w-5" />
                  </div>
                ) : (
                  <img 
                    src={emblemOfIndia} 
                    alt="National Emblem of India" 
                    className="h-10 w-auto select-none pointer-events-none object-contain"
                  />
                )}
                {location.pathname !== '/dashboard' && (
                  <div className="flex flex-col">
                    <span className={`font-bold text-lg leading-tight tracking-tight ${
                      highContrast ? 'text-yellow-300' : 'text-[#000080]'
                    }`}>
                      JanSetu AI
                    </span>
                    <span className="text-[9px] opacity-75 font-semibold uppercase tracking-wider">
                      {t.goiText}
                    </span>
                  </div>
                )}
              </Link>
            </div>

            {/* Desktop Navigation Items */}
            <div className="hidden lg:flex items-center space-x-1">
              {location.pathname === '/' ? (
                // On home page, use smooth scrolling sections
                citizenNavItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-102 cursor-pointer ${
                      highContrast
                        ? 'text-yellow-200 hover:bg-yellow-500/10 hover:text-yellow-400'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-[#000080]'
                    }`}
                  >
                    {item.name}
                  </button>
                ))
              ) : (
                // Outside home page, redirect to home, submit or track
                <>
                  <Link
                    to="/"
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                      highContrast
                        ? 'text-yellow-200 hover:bg-yellow-500/10'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-[#000080]'
                    }`}
                  >
                    {t.home}
                  </Link>
                  <Link
                    to="/submit"
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                      location.pathname === '/submit'
                        ? (highContrast ? 'bg-yellow-500/20 text-yellow-400 font-bold border border-yellow-500' : 'bg-slate-100 text-[#000080] font-bold')
                        : (highContrast ? 'text-yellow-200 hover:bg-yellow-500/10' : 'text-slate-600 hover:bg-slate-100 hover:text-[#000080]')
                    }`}
                  >
                    {t.submitIssue}
                  </Link>
                  <Link
                    to="/track"
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                      location.pathname === '/track'
                        ? (highContrast ? 'bg-yellow-500/20 text-yellow-400 font-bold border border-yellow-500' : 'bg-slate-100 text-[#000080] font-bold')
                        : (highContrast ? 'text-yellow-200 hover:bg-yellow-500/10' : 'text-slate-600 hover:bg-slate-100 hover:text-[#000080]')
                    }`}
                  >
                    {t.trackRequest}
                  </Link>
                </>
              )}

              {/* MP Dashboard Page Selector */}
              <Link
                to="/dashboard"
                className={`ml-4 flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-sm font-bold border transition-all duration-200 cursor-pointer ${
                  location.pathname === '/dashboard'
                    ? (highContrast ? 'bg-yellow-400 text-black border-yellow-400' : 'bg-[#000080] text-white border-[#000080]')
                    : (highContrast 
                        ? 'border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/15' 
                        : 'border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-[#000080]')
                }`}
              >
                <span>{t.mpDashboard}</span>
              </Link>

              {/* Language Selector Dropdown */}
              <div className="relative ml-4">
                <button
                  onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-semibold border transition duration-200 cursor-pointer ${
                    highContrast
                      ? 'border-yellow-500/50 text-yellow-300 bg-transparent'
                      : 'border-slate-300 text-slate-700 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <Globe className="h-4 w-4" />
                  <span>{languages.find((l) => l.code === language)?.label.split(' ')[1]}</span>
                </button>

                {langDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setLangDropdownOpen(false)}
                    ></div>
                    <div className={`absolute right-0 mt-2 w-48 rounded-xl shadow-xl border z-20 py-1.5 transition-all animate-slideDown ${
                      highContrast 
                        ? 'bg-[#090d16] border-yellow-500 text-yellow-300' 
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}>
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setLanguage(lang.code);
                            setLangDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-4 py-2 text-sm text-left transition cursor-pointer ${
                            language === lang.code
                              ? (highContrast ? 'bg-yellow-500/20 text-yellow-400 font-bold' : 'bg-slate-100 text-[#000080] font-bold')
                              : (highContrast ? 'hover:bg-yellow-500/10' : 'hover:bg-slate-50')
                          }`}
                        >
                          <span>{lang.label}</span>
                          {language === lang.code && <Check className="h-4 w-4 text-[#FF9933]" />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Mobile Menu & Language Toggle Button */}
            <div className="flex items-center space-x-2.5 lg:hidden">
              {/* Quick Language Toggle icon */}
              <button
                onClick={() => {
                  const nextLangMap = { en: 'hi', hi: 'mr', mr: 'en' };
                  setLanguage(nextLangMap[language]);
                }}
                className={`p-2 rounded-lg border transition cursor-pointer ${
                  highContrast ? 'border-yellow-500/50 text-yellow-300' : 'border-slate-300 text-slate-700'
                }`}
                title="Switch Language"
              >
                <Globe className="h-4 w-4" />
              </button>

              <button
                onClick={() => setIsOpen(!isOpen)}
                type="button"
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  highContrast ? 'text-yellow-300 hover:bg-yellow-500/15' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isOpen && (
          <div className={`lg:hidden border-t animate-slideDown ${
            highContrast ? 'bg-[#0f172a] border-yellow-500 text-yellow-300' : 'bg-white border-slate-100 text-slate-700'
          }`}>
            <div className="px-3 pt-2.5 pb-4 space-y-1 sm:px-4">
              {location.pathname === '/' ? (
                citizenNavItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className="w-full flex items-center px-4 py-3 rounded-xl text-base font-semibold text-left transition hover:bg-slate-100 cursor-pointer"
                  >
                    {item.name}
                  </button>
                ))
              ) : (
                <>
                  <Link
                    to="/"
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-3 rounded-xl text-base font-semibold transition hover:bg-slate-100"
                  >
                    {t.home}
                  </Link>
                  <Link
                    to="/submit"
                    onClick={() => setIsOpen(false)}
                    className={`block px-4 py-3 rounded-xl text-base font-semibold transition hover:bg-slate-100 ${
                      location.pathname === '/submit'
                        ? (highContrast ? 'text-yellow-400 font-bold' : 'text-[#000080] font-bold')
                        : ''
                    }`}
                  >
                    {t.submitIssue}
                  </Link>
                  <Link
                    to="/track"
                    onClick={() => setIsOpen(false)}
                    className={`block px-4 py-3 rounded-xl text-base font-semibold transition hover:bg-slate-100 ${
                      location.pathname === '/track'
                        ? (highContrast ? 'text-yellow-400 font-bold' : 'text-[#000080] font-bold')
                        : ''
                    }`}
                  >
                    {t.trackRequest}
                  </Link>
                </>
              )}

              {/* MP Dashboard Page Selector */}
              <Link
                to="/dashboard"
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 rounded-xl text-base font-bold border-t ${
                  highContrast ? 'border-yellow-500/30 text-yellow-300' : 'border-slate-100 text-[#000080]'
                }`}
              >
                {t.mpDashboard}
              </Link>

              {/* Mobile Language Selector Inline buttons */}
              <div className="pt-3 border-t border-slate-100/10 px-4">
                <span className="text-xs font-semibold uppercase tracking-wider opacity-60 block mb-2">{t.language}</span>
                <div className="flex gap-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setIsOpen(false);
                      }}
                      className={`flex-1 text-center py-2 rounded-lg text-xs font-bold border transition cursor-pointer ${
                        language === lang.code
                          ? (highContrast ? 'bg-yellow-400 text-black border-yellow-400' : 'bg-[#000080] text-white border-[#000080]')
                          : (highContrast ? 'border-yellow-500/50 text-yellow-300' : 'border-slate-200 text-slate-600')
                      }`}
                    >
                      {lang.label.split(' ')[1]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Elegant Flat Tricolor strip below navbar */}
        <div className="h-1 flex w-full">
          <div className="bg-[#FF9933] flex-1"></div>
          <div className="bg-[#FFFFFF] w-1/3"></div>
          <div className="bg-[#138808] flex-1"></div>
        </div>
      </nav>
    </div>
  );
}
