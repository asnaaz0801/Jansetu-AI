import { translations } from '../lib/translations';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  TrendingUp,
  Award,
  ArrowRight
} from 'lucide-react';

export default function CitizenPortal({ language, highContrast }) {
  const t = translations[language];

  return (
    <div className={`flex-1 transition-colors duration-200 flex flex-col justify-between ${highContrast ? 'bg-[#0f172a]' : 'bg-[#F8FAFC]'
      }`}>
      <div>
        {/* 1. Official Government Header */}
        <header className={`pt-8 pb-6 px-4 border-b flex flex-col items-center text-center transition-colors ${highContrast ? 'bg-[#1e293b] border-yellow-500/20 text-[#fef08a]' : 'bg-white border-slate-200 text-slate-800'
          }`}>
          <div className="max-w-4xl mx-auto flex flex-col items-center">
            {/* Ashoka Emblem */}
            <div className="mb-4">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg"
                alt="National Emblem of India"
                className="h-20 w-auto select-none pointer-events-none drop-shadow-sm"
                style={{ objectFit: 'contain' }}
              />
            </div>

            <p className="text-xs md:text-sm font-bold uppercase tracking-widest text-[#FF9933] mb-1.5">
              {t.goiText}
            </p>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
              JanSetu AI
            </h1>
            <p className="text-xs md:text-sm font-semibold italic text-[#138808] max-w-lg leading-relaxed">
              {t.tagline}
            </p>
          </div>
        </header>

        {/* 2. Hero Section */}
        <section id="hero" className="py-10 px-4 text-center">
          <div className={`max-w-4xl mx-auto space-y-6 rounded-3xl p-8 md:p-12 shadow-xl border transition-all duration-200 relative overflow-hidden ${highContrast
              ? 'bg-[#1e293b] border-yellow-500/30 text-yellow-300 shadow-yellow-500/5'
              : 'bg-gradient-to-br from-[#000080] to-[#000066] border-blue-900 text-white shadow-blue-950/20'
            }`}>
            {/* Subtle background glow decorative elements */}
            {!highContrast && (
              <>
                <div className="absolute top-0 left-0 w-32 h-32 bg-[#FF9933]/15 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#138808]/15 rounded-full blur-3xl"></div>
              </>
            )}

            <div className={`inline-flex items-center space-x-2 border px-3.5 py-1 rounded-full text-xs font-bold tracking-wide shadow-sm ${highContrast
                ? 'bg-[#1e293b] border-yellow-500/30 text-yellow-300'
                : 'bg-white/10 border-white/20 text-white'
              }`}>
              <Sparkles className={`h-3.5 w-3.5 ${highContrast ? 'text-yellow-300' : 'text-[#FF9933]'}`} />
              <span>{t.aiPoweredTriage}</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-white">
              {t.welcome}
            </h2>

            <p className={`text-lg md:text-xl font-medium max-w-xl mx-auto italic ${highContrast ? 'text-yellow-200' : 'text-slate-100 opacity-90'
              }`}>
              "{t.quote}"
            </p>

            {/* CTA Button routing to submit issue page */}
            <div className="pt-4 flex justify-center">
              <Link
                to="/submit"
                className={`inline-flex items-center space-x-2 font-bold py-3.5 px-8 rounded-xl border transition-all duration-300 hover:scale-105 cursor-pointer shadow-md text-sm md:text-base ${highContrast
                    ? 'bg-yellow-400 text-black border-yellow-400 hover:bg-yellow-300'
                    : 'bg-white text-[#000080] border-white hover:bg-[#FF9933] hover:text-white hover:border-[#FF9933] hover:shadow-lg'
                  }`}
              >
                <span>{t.submitIssue || 'Submit Issue'}</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>

            {/* Tricolor Slogan Accent */}
            <div className="pt-2 flex flex-col items-center">
              <span className={`text-xs md:text-sm font-black uppercase tracking-widest px-4 py-2 rounded-lg border ${highContrast
                  ? 'bg-slate-900 border-yellow-500/30 text-yellow-400'
                  : 'bg-[#FF9933] border-none text-white shadow-md'
                }`}>
                {t.slogan}
              </span>
              <div className="flex w-24 h-1 mt-3.5 rounded-full overflow-hidden">
                <div className="bg-[#FF9933] flex-1"></div>
                <div className="bg-[#F5F5F5] w-1/4"></div>
                <div className="bg-[#138808] flex-1"></div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Main Content: Insights & About sections */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">

            {/* Insights Section */}
            <div id="insights-section" className={`border rounded-2xl p-6 md:p-8 space-y-6 transition-all flex flex-col justify-between ${highContrast
                ? 'bg-[#1e293b] border-yellow-500/20 text-yellow-300'
                : 'bg-white border-slate-200 text-slate-800 shadow-sm'
              }`}>
              <div className="space-y-6">
                <h3 className="text-xl md:text-2xl font-bold flex items-center gap-2 tracking-tight">
                  <TrendingUp className="h-5 w-5 text-[#FF9933]" />
                  {t.insightsTitle}
                </h3>
                <p className="text-xs md:text-sm opacity-80 leading-relaxed font-semibold">
                  {t.insightsDesc}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-100/10">
                <div className={`p-4 rounded-xl border text-center ${highContrast ? 'bg-slate-900 border-yellow-500/30' : 'bg-slate-50 border-slate-100 shadow-sm'
                  }`}>
                  <span className="text-2xl font-black text-[#FF9933]">89%</span>
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-70 mt-1">
                    {t.triageAccuracyLabel}
                  </p>
                </div>
                <div className={`p-4 rounded-xl border text-center ${highContrast ? 'bg-slate-900 border-yellow-500/30' : 'bg-slate-50 border-slate-100 shadow-sm'
                  }`}>
                  <span className="text-2xl font-black text-[#000080]">4.2 Days</span>
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-70 mt-1">
                    {t.avgResponseLabel}
                  </p>
                </div>
                <div className={`p-4 rounded-xl border text-center ${highContrast ? 'bg-slate-900 border-yellow-500/30' : 'bg-slate-50 border-slate-100 shadow-sm'
                  }`}>
                  <span className="text-2xl font-black text-[#138808]">1,450+</span>
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-70 mt-1">
                    {t.resolvedIssuesLabel}
                  </p>
                </div>
              </div>
            </div>

            {/* About Section */}
            <div id="about-section" className={`border rounded-2xl p-6 md:p-8 space-y-5 transition-all flex flex-col justify-between ${highContrast
                ? 'bg-[#1e293b] border-yellow-500/20 text-yellow-300'
                : 'bg-white border-slate-200 text-slate-800 shadow-sm'
              }`}>
              <div className="space-y-5">
                <h3 className="text-xl md:text-2xl font-bold flex items-center gap-2 tracking-tight">
                  <Award className="h-5 w-5 text-[#138808]" />
                  {t.aboutTitleLabel}
                </h3>
                <p className="text-xs md:text-sm opacity-80 leading-relaxed font-semibold">
                  {t.aboutDescText}
                </p>
              </div>
              <div className="pt-6 border-t border-slate-100/10 text-xs opacity-65 font-bold italic">
                {t.officialPlatformLabel}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 4. Footer */}
      <footer id="footer" className={`border-t py-12 px-4 transition-colors relative mt-auto ${highContrast ? 'bg-[#1e293b] border-yellow-500/20 text-yellow-300' : 'bg-slate-900 text-slate-300 border-slate-800'
        }`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 pb-4">
          <div className="text-center md:text-left space-y-2">
            <p className={`font-bold text-sm ${highContrast ? 'text-yellow-300' : 'text-white'}`}>
              {t.goiText}
            </p>
            <p className="text-xs opacity-75">
              {t.poweredBy}
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-bold uppercase tracking-wider">
            <button className="hover:underline transition cursor-pointer">{t.privacy}</button>
            <button className="hover:underline transition cursor-pointer">{t.terms}</button>
            <button className="hover:underline transition cursor-pointer">{t.contact}</button>
          </div>

          <div className="text-center md:text-right text-xs opacity-60">
            <p>© 2026 JanSetu AI</p>
          </div>
        </div>

        {/* Tricolor Strip at bottom */}
        <div className="h-1 flex w-full absolute bottom-0 left-0 right-0">
          <div className="bg-[#FF9933] flex-1"></div>
          <div className="bg-[#FFFFFF] w-1/4"></div>
          <div className="bg-[#138808] flex-1"></div>
        </div>
      </footer>
    </div>
  );
}
