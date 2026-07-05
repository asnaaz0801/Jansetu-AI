import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import emblemOfIndia from '../assets/emblem-of-india.svg';
import {
  Inbox,
  LayoutDashboard,
  BarChart2,
  Sparkles,
  LogOut,
  Menu,
  X,
  User,
  MapPin
} from 'lucide-react';
import { translations } from '../lib/translations';

export default function MpLayout({ mpSession, onLogout, language, highContrast }) {
  const location = useLocation();
  const navigate = useNavigate();
  const t = translations[language] || translations['en'];
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const activePath = location.pathname;

  const handleNavClick = (section, path, elementId) => {
    setIsMobileMenuOpen(false);
    if (path) {
      if (elementId) {
        // Navigate with state to scroll to section
        navigate(path, { state: { scrollTo: elementId } });
      } else {
        navigate(path);
      }
    } else {
      alert(`${section.charAt(0).toUpperCase() + section.slice(1)} features are coming soon!`);
    }
  };

  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/mp/dashboard", elementId: null },
    { name: "Complaints", icon: Inbox, path: "/mp/complaints", elementId: null },
    { name: "Analytics", icon: BarChart2, path: "/mp/analytics", elementId: null },
    { name: "AI Action Planner", icon: Sparkles, path: "/mp/dashboard", elementId: "mp-ai-planner" }
  ];

  const renderNavLinks = () => {
    return navItems.map((item) => {
      const Icon = item.icon;
      const isActive = item.path && (
        item.elementId 
          ? activePath === item.path && location.state?.scrollTo === item.elementId
          : activePath === item.path || (item.path === "/mp/complaints" && activePath.startsWith("/mp/complaints/"))
      );

      return (
        <button
          key={item.name}
          onClick={() => handleNavClick(item.name, item.path, item.elementId)}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold transition duration-250 cursor-pointer text-left ${
            isActive
              ? (highContrast ? 'bg-yellow-400 text-black shadow-sm' : 'bg-[#000080] text-white shadow-md')
              : (highContrast ? 'text-yellow-300 hover:bg-yellow-500/10' : 'text-slate-600 hover:bg-slate-50 hover:text-[#000080]')
          }`}
        >
          <Icon className="h-4.5 w-4.5" />
          <span>{item.name}</span>
        </button>
      );
    });
  };

  return (
    <div className={`min-h-screen flex flex-col md:flex-row transition-colors duration-200 ${
      highContrast ? 'bg-[#0f172a] text-[#fef08a]' : 'bg-[#F8FAFC] text-slate-800'
    }`}>
      
      {/* Mobile Header Bar */}
      <header className={`md:hidden flex items-center justify-between px-4 py-3 border-b z-40 transition-colors ${
        highContrast ? 'bg-[#1e293b] border-yellow-500/20 text-yellow-300' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center space-x-2">
          <img src={emblemOfIndia} alt="Emblem" className="h-9 w-auto" />
          <span className={`font-black text-sm tracking-tight ${highContrast ? 'text-yellow-300' : 'text-[#000080]'}`}>
            MP Portal
          </span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`p-1.5 rounded-lg border transition ${
            highContrast ? 'border-yellow-500/50 text-yellow-300' : 'border-slate-350 text-slate-700'
          }`}
        >
          {isMobileMenuOpen ? <X className="h-5.5 w-5.5" /> : <Menu className="h-5.5 w-5.5" />}
        </button>
      </header>

      {/* Sidebar - Desktop */}
      <aside className={`hidden md:flex w-64 flex-col flex-shrink-0 border-r transition-colors z-30 ${
        highContrast 
          ? 'bg-[#1e293b] border-yellow-500/20 text-yellow-300' 
          : 'bg-white border-slate-200 text-slate-700 shadow-sm'
      }`}>
        {/* Sidebar Header */}
        <div className={`p-6 border-b ${highContrast ? 'border-yellow-500/20' : 'border-slate-100'}`}>
          <div className="flex items-center space-x-2.5 mb-4">
            <img src={emblemOfIndia} alt="Emblem" className="h-10 w-auto" />
            <div className="flex flex-col">
              <span className={`text-[10px] font-black uppercase tracking-widest leading-none ${highContrast ? 'text-yellow-400' : 'text-[#FF9933]'}`}>
                {t.goiText || "Govt of India"}
              </span>
              <span className={`text-xs font-black tracking-tight leading-none mt-1 ${highContrast ? 'text-white' : 'text-[#000080]'}`}>
                MP Portal
              </span>
            </div>
          </div>
          <div className={`mt-2 p-2.5 rounded-xl border flex flex-col space-y-1 ${
            highContrast ? 'bg-slate-900 border-yellow-500/20' : 'bg-slate-50 border-slate-150'
          }`}>
            <span className={`text-[12px] font-black flex items-center space-x-1.5 truncate ${
              highContrast ? 'text-yellow-300' : 'text-[#000080]'
            }`}>
              <User className="h-3.5 w-3.5 text-[#FF9933] flex-shrink-0" />
              <span className="truncate">{mpSession ? mpSession.name : "Hon. Member"}</span>
            </span>
            <span className={`text-[11px] font-semibold flex items-center space-x-1.5 truncate ${
              highContrast ? 'text-yellow-300/80' : 'text-[#138808]'
            }`}>
              <MapPin className="h-3 w-3 text-[#138808] flex-shrink-0" />
              <span className="truncate">{mpSession ? mpSession.constituency : "Constituency"}</span>
            </span>
          </div>
        </div>

        {/* Sidebar Navigation Links */}
        <nav className="p-4 space-y-1.5">
          {renderNavLinks()}
          <div className="pt-4">
            <button
              onClick={() => {
                onLogout();
                navigate('/mp/login');
              }}
              className={`w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-sm font-bold border transition duration-200 cursor-pointer ${
                highContrast 
                  ? 'border-red-500/50 text-red-400 bg-transparent hover:bg-red-500/10' 
                  : 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700'
              }`}
            >
              <LogOut className="h-4.5 w-4.5" />
              <span>Logout</span>
            </button>
          </div>
        </nav>

        <div className="flex-1"></div>
      </aside>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/40 z-40 md:hidden" 
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          <aside className={`fixed inset-y-0 left-0 w-64 border-r flex flex-col z-50 animate-slideDown md:hidden transition-colors ${
            highContrast ? 'bg-[#1e293b] border-yellow-500/30 text-yellow-300' : 'bg-white border-slate-200'
          }`}>
            <div className="p-4 border-b flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider">Navigation</span>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="p-4 flex-1 space-y-1.5 overflow-y-auto">
              {renderNavLinks()}
            </nav>
            <div className="p-4 border-t">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onLogout();
                  navigate('/mp/login');
                }}
                className={`w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-sm font-bold border cursor-pointer transition ${
                  highContrast 
                    ? 'border-red-500/50 text-red-400 bg-transparent' 
                    : 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                }`}
              >
                <LogOut className="h-4.5 w-4.5" />
                <span>Logout</span>
              </button>
            </div>
          </aside>
        </>
      )}

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Tricolor Strip above content */}
        <div className="h-1 flex w-full flex-shrink-0">
          <div className="bg-[#FF9933] flex-1"></div>
          <div className="bg-[#FFFFFF] w-1/4"></div>
          <div className="bg-[#138808] flex-1"></div>
        </div>
        <main className="flex-1 flex flex-col relative min-h-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
