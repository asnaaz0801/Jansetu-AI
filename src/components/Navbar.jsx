import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Landmark, Globe, Check, Contrast, User, LogOut, FileText, ChevronDown, Calendar, Loader } from 'lucide-react';
import { translations } from '../lib/translations';
import { supabase } from '../lib/db';
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
  const [user, setUser] = useState(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userComplaints, setUserComplaints] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (showProfileModal && user) {
      setLoadingComplaints(true);
      supabase
        .from('issues')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (error) {
            console.error('Error fetching user complaints:', error);
          } else {
            setUserComplaints(data || []);
          }
          setLoadingComplaints(false);
        });
    }
  }, [showProfileModal, user]);

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
    { name: t.help, id: 'support' },
  ];

  const isItemActive = (item) => {
    if (item.id === 'main-card' && location.pathname === '/submit') return true;
    if (item.id === 'active-feed' && (location.pathname === '/track' || location.pathname.startsWith('/track/'))) return true;
    if (item.id === 'support' && location.pathname === '/support') return true;
    if (item.id === 'hero' && location.pathname === '/') return true;
    return false;
  };

  useEffect(() => {
    if (location.pathname === '/' && location.state?.scrollTo) {
      const sectionId = location.state.scrollTo;
      const timer = setTimeout(() => {
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
          // Clear state to prevent scrolling again on page refresh
          window.history.replaceState({}, document.title);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, location.state]);

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
    if (sectionId === 'support') {
      navigate('/support');
      return;
    }

    // Anchor links: 'hero', 'insights-section', 'about-section'
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: sectionId } });
    } else {
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
    }
  };

  const languages = [
    { code: 'en', label: '🇮🇳 English' },
    { code: 'hi', label: '🇮🇳 हिन्दी' },
    { code: 'mr', label: '🇮🇳 मराठी' },
    { code: 'gu', label: '🇮🇳 ગુજરાતી' },
    { code: 'pa', label: '🇮🇳 ਪੰਜਾਬੀ' },
    { code: 'ta', label: '🇮🇳 தமிழ்' },
    { code: 'te', label: '🇮🇳 తెలుగు' },
    { code: 'kn', label: '🇮🇳 ಕನ್ನಡ' },
    { code: 'ml', label: '🇮🇳 മലയാളം' },
    { code: 'bn', label: '🇮🇳 বাংলা' },
    { code: 'or', label: '🇮🇳 ଓଡ଼ିଆ' },
    { code: 'as', label: '🇮🇳 অসমীয়া' },
    { code: 'ur', label: '🇮🇳 اردو' },
    { code: 'kok', label: '🇮🇳 कोंकणी' },
    { code: 'ks', label: '🇮🇳 کٲشُر' },
    { code: 'doi', label: '🇮🇳 डोगरी' },
    { code: 'mai', label: '🇮🇳 मैथिली' },
    { code: 'sat', label: '🇮🇳 ᱥᱟᱱᱛᱟᱲᱤ' },
    { code: 'mni', label: '🇮🇳 ꯃꯤꯇꯩ ꯂꯣꯟ' },
    { code: 'brx', label: '🇮🇳 बड़ो' },
    { code: 'ne', label: '🇮🇳 नेपाली' },
    { code: 'sa', label: '🇮🇳 संस्कृत' },
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
              {citizenNavItems.map((item) => {
                const isActive = isItemActive(item);
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-102 cursor-pointer ${
                      isActive
                        ? (highContrast ? 'bg-yellow-500/20 text-yellow-400 font-bold border border-yellow-500' : 'bg-slate-100 text-[#000080] font-bold')
                        : (highContrast ? 'text-yellow-200 hover:bg-yellow-500/10 hover:text-yellow-400' : 'text-slate-600 hover:bg-slate-100 hover:text-[#000080]')
                    }`}
                  >
                    {item.name}
                  </button>
                );
              })}
            </div>

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
                  <span>
                    {(() => {
                      const langObj = languages.find((l) => l.code === language);
                      return langObj ? langObj.label.substring(langObj.label.indexOf(' ') + 1) : '';
                    })()}
                  </span>
                </button>

                {langDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setLangDropdownOpen(false)}
                    ></div>
                    <div className={`absolute right-0 mt-2 w-48 max-h-[350px] overflow-y-auto rounded-xl shadow-xl border z-20 py-1.5 transition-all animate-slideDown ${
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

              {/* Profile Dropdown or Sign In */}
              <div className="relative ml-4 flex items-center">
                {user ? (
                  <div className="relative">
                    <button
                      onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                      className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                        highContrast
                          ? 'border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/10'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs'
                      }`}
                    >
                      {(user.user_metadata?.avatar_url || user.user_metadata?.picture) ? (
                        <img
                          src={user.user_metadata.avatar_url || user.user_metadata.picture}
                          alt="Profile"
                          className="h-6 w-6 rounded-full object-cover border border-slate-200"
                        />
                      ) : (
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          highContrast ? 'bg-yellow-400 text-black' : 'bg-[#000080] text-white'
                        }`}>
                          {user.email ? user.email.substring(0, 2).toUpperCase() : 'U'}
                        </div>
                      )}
                      <span className="text-xs font-semibold max-w-[100px] truncate hidden md:inline">
                        {user.user_metadata?.full_name || user.email?.split('@')[0]}
                      </span>
                      <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {profileDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setProfileDropdownOpen(false)}
                        ></div>
                        <div className={`absolute right-0 mt-2 w-64 rounded-2xl shadow-xl border z-20 overflow-hidden transition-all animate-slideDown ${
                          highContrast
                            ? 'bg-[#090d16] border-yellow-500 text-yellow-300'
                            : 'bg-white border-slate-200 text-slate-800'
                        }`}>
                          {/* Dropdown Header */}
                          <div className={`p-4 border-b flex items-center space-x-3 ${
                            highContrast ? 'border-yellow-500/20 bg-slate-900/50' : 'border-slate-100 bg-slate-50/50'
                          }`}>
                            {(user.user_metadata?.avatar_url || user.user_metadata?.picture) ? (
                              <img
                                src={user.user_metadata.avatar_url || user.user_metadata.picture}
                                alt="Profile"
                                className="h-10 w-10 rounded-full object-cover border"
                              />
                            ) : (
                              <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold ${
                                highContrast ? 'bg-yellow-400 text-black' : 'bg-[#000080] text-white'
                              }`}>
                                {user.email ? user.email.substring(0, 2).toUpperCase() : 'U'}
                              </div>
                            )}
                            <div className="flex flex-col min-w-0">
                              <span className="text-sm font-bold truncate">
                                {user.user_metadata?.full_name || 'Citizen'}
                              </span>
                              <span className="text-xs opacity-70 truncate font-semibold">
                                {user.email}
                              </span>
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider mt-1 w-max ${
                                highContrast ? 'bg-yellow-400/20 text-yellow-300' : 'bg-[#000080]/10 text-[#000080]'
                              }`}>
                                {language === 'hi' ? 'नागरिक खाता' : language === 'mr' ? 'नागरिक खाते' : 'Citizen'}
                              </span>
                            </div>
                          </div>

                          {/* Dropdown Options */}
                          <div className="p-1.5 space-y-1">
                            <button
                              onClick={() => {
                                setProfileDropdownOpen(false);
                                setShowProfileModal(true);
                              }}
                              className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition cursor-pointer ${
                                highContrast
                                  ? 'hover:bg-yellow-500/10 text-yellow-300'
                                  : 'hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <User className="h-4 w-4" />
                              <span>{language === 'hi' ? 'मेरा प्रोफाइल' : language === 'mr' ? 'माझे प्रोफाइल' : 'My Profile / Account'}</span>
                            </button>

                            <button
                              onClick={() => {
                                setProfileDropdownOpen(false);
                                navigate('/track');
                              }}
                              className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-left transition cursor-pointer ${
                                highContrast
                                  ? 'hover:bg-yellow-500/10 text-yellow-300'
                                  : 'hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <FileText className="h-4 w-4" />
                              <span>{language === 'hi' ? 'मेरी शिकायतें' : language === 'mr' ? 'माझ्या तक्रारी' : 'My Complaints'}</span>
                            </button>
                          </div>

                          {/* Dropdown Footer / Sign Out */}
                          <div className={`p-1.5 border-t ${
                            highContrast ? 'border-yellow-500/20' : 'border-slate-100'
                          }`}>
                            <button
                              onClick={async () => {
                                setProfileDropdownOpen(false);
                                await supabase.auth.signOut();
                              }}
                              className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-left transition cursor-pointer ${
                                highContrast
                                  ? 'text-red-400 hover:bg-red-500/10'
                                  : 'text-red-650 hover:bg-red-50'
                              }`}
                            >
                              <LogOut className="h-4 w-4" />
                              <span>{language === 'hi' ? 'साइन आउट' : language === 'mr' ? 'साइन आउट' : 'Sign Out'}</span>
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={async () => {
                      const { error } = await supabase.auth.signInWithOAuth({
                        provider: 'google',
                        options: {
                          redirectTo: window.location.origin,
                        },
                      });
                      if (error) console.error("Sign-in failed:", error.message);
                    }}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-black border transition duration-200 cursor-pointer ${
                      highContrast
                        ? 'border-yellow-500/50 text-yellow-300 bg-transparent hover:bg-yellow-500/10'
                        : 'border-[#000080] text-[#000080] bg-white hover:bg-slate-50'
                    }`}
                  >
                    <span>{language === 'en' ? 'Sign In with Google' : language === 'hi' ? 'गूगल से साइन इन करें' : 'गूगलने साइन इन करा'}</span>
                  </button>
                )}
              </div>

            {/* Mobile Menu & Language Toggle Button */}
            <div className="flex items-center space-x-2.5 lg:hidden">
              {user ? (
                <div className="flex items-center space-x-1.5">
                  <span className={`text-[10px] font-bold max-w-[85px] truncate ${
                    highContrast ? 'text-yellow-300' : 'text-slate-650'
                  }`}>
                    {user.email}
                  </span>
                  <button
                    onClick={async () => {
                      await supabase.auth.signOut();
                    }}
                    className={`px-2 py-1 rounded-md text-[10px] font-black border transition cursor-pointer ${
                      highContrast
                        ? 'border-yellow-500/50 text-yellow-300'
                        : 'border-red-200 text-red-650 bg-red-50'
                    }`}
                  >
                    {language === 'en' ? 'Out' : language === 'hi' ? 'आउट' : 'आउट'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={async () => {
                    const { error } = await supabase.auth.signInWithOAuth({
                      provider: 'google',
                      options: { redirectTo: window.location.origin }
                    });
                    if (error) console.error("Sign-in failed:", error.message);
                  }}
                  className={`px-2 py-1 rounded-md text-[10px] font-black border transition cursor-pointer ${
                    highContrast
                      ? 'border-yellow-500/50 text-yellow-300'
                      : 'border-[#000080] text-[#000080] bg-white'
                  }`}
                >
                  {language === 'en' ? 'Sign In' : language === 'hi' ? 'साइन इन' : 'साइन इन'}
                </button>
              )}

              {/* Quick Language Toggle icon */}
              <button
                onClick={() => {
                  const currentIndex = languages.findIndex((l) => l.code === language);
                  const nextIndex = (currentIndex + 1) % languages.length;
                  setLanguage(languages[nextIndex].code);
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
              {citizenNavItems.map((item) => {
                const isActive = isItemActive(item);
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center px-4 py-3 rounded-xl text-base font-semibold text-left transition hover:bg-slate-100 cursor-pointer ${
                      isActive
                        ? (highContrast ? 'text-yellow-400 font-bold' : 'text-[#000080] font-bold')
                        : (highContrast ? 'text-yellow-300' : 'text-slate-700')
                    }`}
                  >
                    {item.name}
                  </button>
                );
              })}

              {/* Mobile Auth inside Drawer */}
              <div className="pt-4 pb-2 border-t border-slate-100/10 px-4">
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-60 block mb-3">
                  {language === 'hi' ? 'खाता' : language === 'mr' ? 'खाते' : 'Account'}
                </span>
                {user ? (
                  <div className="space-y-3.5">
                    {/* User profile brief card */}
                    <div className={`p-3 rounded-2xl flex items-center space-x-3 border ${
                      highContrast ? 'bg-slate-900 border-yellow-500/20' : 'bg-slate-50 border-slate-100 shadow-xs'
                    }`}>
                      {(user.user_metadata?.avatar_url || user.user_metadata?.picture) ? (
                        <img
                          src={user.user_metadata.avatar_url || user.user_metadata.picture}
                          alt="Profile"
                          className="h-10 w-10 rounded-full object-cover border"
                        />
                      ) : (
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold ${
                          highContrast ? 'bg-yellow-400 text-black' : 'bg-[#000080] text-white'
                        }`}>
                          {user.email ? user.email.substring(0, 2).toUpperCase() : 'U'}
                        </div>
                      )}
                      <div className="flex flex-col min-w-0">
                        <span className={`text-sm font-bold truncate ${highContrast ? 'text-yellow-300' : 'text-slate-800'}`}>
                          {user.user_metadata?.full_name || 'Citizen'}
                        </span>
                        <span className={`text-xs truncate ${highContrast ? 'text-yellow-400/75' : 'text-slate-500'}`}>
                          {user.email}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          setShowProfileModal(true);
                        }}
                        className={`py-2 rounded-xl text-xs font-bold border text-center transition cursor-pointer ${
                          highContrast
                            ? 'border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/10'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-xs'
                        }`}
                      >
                        {language === 'hi' ? 'मेरा प्रोफ़ाइल' : language === 'mr' ? 'माझे प्रोफाइल' : 'My Profile'}
                      </button>
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          navigate('/track');
                        }}
                        className={`py-2 rounded-xl text-xs font-bold border text-center transition cursor-pointer ${
                          highContrast
                            ? 'border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/10'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-xs'
                        }`}
                      >
                        {language === 'hi' ? 'मेरी शिकायतें' : language === 'mr' ? 'माझ्या तक्रारी' : 'My Complaints'}
                      </button>
                    </div>

                    <button
                      onClick={async () => {
                        setIsOpen(false);
                        await supabase.auth.signOut();
                      }}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        highContrast
                          ? 'border-red-500/50 text-red-400 hover:bg-red-500/10'
                          : 'border-red-200 text-red-650 bg-red-50 hover:bg-red-100 hover:text-red-700'
                      }`}
                    >
                      {language === 'en' ? 'Sign Out' : language === 'hi' ? 'साइन आउट' : 'साइन आउट'}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={async () => {
                      setIsOpen(false);
                      const { error } = await supabase.auth.signInWithOAuth({
                        provider: 'google',
                        options: { redirectTo: window.location.origin }
                      });
                      if (error) console.error("Sign-in failed:", error.message);
                    }}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      highContrast
                        ? 'border-yellow-500/50 text-yellow-300 bg-transparent hover:bg-yellow-500/10'
                        : 'border-[#000080] text-[#000080] bg-white hover:bg-slate-50 shadow-xs'
                    }`}
                  >
                    {language === 'en' ? 'Sign In with Google' : language === 'hi' ? 'गूगल से साइन इन करें' : 'गूगलने साइन इन करा'}
                  </button>
                )}
              </div>

              {/* Mobile Language Selector Inline buttons */}
              <div className="pt-3 border-t border-slate-100/10 px-4">
                <span className="text-xs font-semibold uppercase tracking-wider opacity-60 block mb-2">{t.language}</span>
                <div className="grid grid-cols-3 gap-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setIsOpen(false);
                      }}
                      className={`text-center py-2 rounded-lg text-xs font-bold border transition cursor-pointer ${
                        language === lang.code
                          ? (highContrast ? 'bg-yellow-400 text-black border-yellow-400' : 'bg-[#000080] text-white border-[#000080]')
                          : (highContrast ? 'border-yellow-500/50 text-yellow-300' : 'border-slate-200 text-slate-600')
                      }`}
                    >
                      {lang.label.substring(lang.label.indexOf(' ') + 1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* elegant Flat Tricolor strip below navbar */}
        <div className="h-1 flex w-full">
          <div className="bg-[#FF9933] flex-1"></div>
          <div className="bg-[#FFFFFF] w-1/3"></div>
          <div className="bg-[#138808] flex-1"></div>
        </div>
      </nav>

      {/* Profile Modal */}
      {showProfileModal && user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowProfileModal(false)}
          ></div>

          {/* Modal Container */}
          <div className={`relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl shadow-2xl border overflow-hidden transition-colors duration-200 ${
            highContrast 
              ? 'bg-[#0f172a] border-yellow-500 text-yellow-300' 
              : 'bg-white border-slate-200 text-slate-800'
          }`}>
            {/* Modal Header */}
            <div className={`p-6 border-b flex items-center justify-between ${
              highContrast ? 'border-yellow-500/20 bg-slate-900/50' : 'border-slate-100 bg-slate-50/50'
            }`}>
              <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                <User className="h-5 w-5 text-[#FF9933]" />
                <span>{language === 'hi' ? 'नागरिक प्रोफाइल विवरण' : language === 'mr' ? 'नागरिक प्रोफाइल तपशील' : 'Citizen Profile Details'}</span>
              </h3>
              <button 
                onClick={() => setShowProfileModal(false)}
                className={`p-2 rounded-xl border transition-all duration-200 cursor-pointer ${
                  highContrast 
                    ? 'border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10' 
                    : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* User Bio Card */}
              <div className={`p-5 rounded-2xl border flex flex-col md:flex-row items-center md:items-start gap-4 transition-all duration-200 ${
                highContrast ? 'bg-slate-900 border-yellow-500/25' : 'bg-gradient-to-r from-slate-50 to-white border-slate-100 shadow-xs'
              }`}>
                {(user.user_metadata?.avatar_url || user.user_metadata?.picture) ? (
                  <img
                    src={user.user_metadata.avatar_url || user.user_metadata.picture}
                    alt="Profile"
                    className="h-16 w-16 rounded-full object-cover border-2 border-slate-200"
                  />
                ) : (
                  <div className={`h-16 w-16 rounded-full flex items-center justify-center text-2xl font-bold ${
                    highContrast ? 'bg-yellow-400 text-black' : 'bg-[#000080] text-white'
                  }`}>
                    {user.email ? user.email.substring(0, 2).toUpperCase() : 'U'}
                  </div>
                )}
                <div className="text-center md:text-left space-y-1.5 min-w-0 flex-1">
                  <h4 className="text-xl font-bold truncate">
                    {user.user_metadata?.full_name || 'Citizen'}
                  </h4>
                  <div className="flex flex-col gap-1 text-xs opacity-75 font-semibold">
                    <span className="truncate">Email: {user.email}</span>
                    <span>UID: {user.id}</span>
                    {user.created_at && (
                      <span className="flex items-center gap-1 justify-center md:justify-start">
                        <Calendar className="h-3 w-3" />
                        Joined: {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Complaints History Section */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold uppercase tracking-wider opacity-75">
                  {language === 'hi' ? 'मेरे शिकायत का इतिहास' : language === 'mr' ? 'माझ्या तक्रारींचा इतिहास' : 'My Complaints History'}
                </h4>

                {loadingComplaints ? (
                  <div className="py-12 flex flex-col items-center justify-center space-y-2.5">
                    <Loader className="h-8 w-8 animate-spin text-[#000080]" />
                    <p className="text-xs font-semibold opacity-70">
                      {language === 'hi' ? 'शिकायतें लोड हो रही हैं...' : language === 'mr' ? 'तक्रारी लोड होत आहेत...' : 'Loading your complaints...'}
                    </p>
                  </div>
                ) : userComplaints.length === 0 ? (
                  <div className={`p-8 text-center border rounded-2xl border-dashed ${
                    highContrast ? 'border-yellow-500/20 bg-slate-900/10' : 'border-slate-200 bg-slate-50/50'
                  }`}>
                    <p className="text-sm font-semibold opacity-70">
                      {language === 'hi' ? 'अभी तक कोई शिकायत दर्ज नहीं की गई है।' : language === 'mr' ? 'अद्याप कोणतीही तक्रार नोंदवली नाही.' : 'You have not submitted any complaints yet.'}
                    </p>
                    <Link
                      to="/submit"
                      onClick={() => setShowProfileModal(false)}
                      className={`inline-flex items-center gap-1 mt-3 px-4 py-2 rounded-xl text-xs font-bold transition duration-200 cursor-pointer ${
                        highContrast 
                          ? 'bg-yellow-400 text-black hover:bg-yellow-300' 
                          : 'bg-[#000080] text-white hover:bg-[#FF9933]'
                      }`}
                    >
                      {language === 'hi' ? 'शिकायत दर्ज करें' : language === 'mr' ? 'तक्रार नोंदवा' : 'File a Complaint'}
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                    {userComplaints.map((complaint) => (
                      <div 
                        key={complaint.issue_id}
                        className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                          highContrast 
                            ? 'bg-slate-900 border-yellow-500/20 hover:border-yellow-500/40' 
                            : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-xs'
                        }`}
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-black px-2 py-0.5 rounded-md ${
                              highContrast ? 'bg-slate-800 text-yellow-300' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {complaint.reference_code || 'No Ref'}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              complaint.status === 'Resolved' || complaint.status === 'resolved'
                                ? 'bg-green-100 text-green-700'
                                : complaint.status === 'Pending' || complaint.status === 'pending'
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {complaint.status}
                            </span>
                          </div>
                          <h5 className="text-sm font-bold truncate">
                            {complaint.title}
                          </h5>
                          <p className="text-[10px] opacity-60 font-semibold">
                            Submitted: {new Date(complaint.created_at).toLocaleDateString()} • Category: {complaint.category}
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            setShowProfileModal(false);
                            navigate(`/track/${complaint.reference_code || complaint.issue_id}`);
                          }}
                          className={`self-start sm:self-center px-4 py-2 rounded-xl text-xs font-black border transition duration-200 cursor-pointer ${
                            highContrast
                              ? 'border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/10'
                              : 'border-[#000080] text-[#000080] hover:bg-slate-50 bg-white shadow-2xs'
                          }`}
                        >
                          {language === 'hi' ? 'ट्रैक करें' : language === 'mr' ? 'ट्रॅक करा' : 'Track'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
