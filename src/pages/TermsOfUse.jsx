import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  BookOpen, 
  CheckCircle, 
  AlertTriangle, 
  Hammer, 
  HelpCircle, 
  ShieldAlert, 
  Cpu, 
  RefreshCw, 
  Mail 
} from 'lucide-react';

export default function TermsOfUse({ language = 'en', fontSize = 16, highContrast = false }) {
  const navigate = useNavigate();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <div className={`w-full flex-1 py-8 px-4 md:py-12 md:px-6 transition-all duration-200 ${
      highContrast ? 'bg-[#0f172a]' : 'bg-[#F5F5F5]'
    }`}>
      {/* Container */}
      <div className="max-w-[900px] mx-auto space-y-8 animate-fadeIn">
        
        {/* Back Button & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-6 border-slate-200 dark:border-slate-800">
          <button
            onClick={() => navigate('/')}
            className={`flex items-center space-x-2 font-bold text-xs uppercase tracking-wider py-2 px-4 rounded-full border transition cursor-pointer hover:scale-[1.02] shadow-sm ${
              highContrast 
                ? 'bg-yellow-400 text-black border-yellow-400 hover:bg-yellow-350' 
                : 'bg-white text-[#000080] border-slate-200 hover:bg-slate-50'
            }`}
            aria-label="Back to home page"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </button>
          
          <div className={`text-xs font-bold uppercase tracking-widest ${
            highContrast ? 'text-yellow-400' : 'text-slate-400'
          }`}>
            Last Updated: July 2026
          </div>
        </div>

        {/* Hero Section Card */}
        <div className={`rounded-2xl border p-6 md:p-8 space-y-4 shadow-md overflow-hidden relative ${
          highContrast 
            ? 'bg-[#1e293b] border-yellow-500 text-yellow-300' 
            : 'bg-white border-slate-200 text-slate-800'
        }`}>
          {/* Tri-color Top Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 flex">
            <div className="bg-[#FF9933] flex-1"></div>
            <div className="bg-white flex-1"></div>
            <div className="bg-[#138808] flex-1"></div>
          </div>

          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-xl ${
              highContrast ? 'bg-yellow-400/10 text-yellow-400' : 'bg-blue-50 text-[#000080]'
            }`}>
              <BookOpen className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">Terms of Use</h1>
              <p className={`text-sm font-semibold opacity-90 ${highContrast ? 'text-yellow-250' : 'text-slate-500'}`}>
                Please read these terms carefully before using JanSetu AI.
              </p>
            </div>
          </div>
        </div>

        {/* Terms Content Cards Grid */}
        <div className="space-y-6">
          
          {/* Section 1: Acceptance of Terms */}
          <div className={`rounded-xl border p-6 shadow-sm hover:shadow-md transition-all duration-200 ${
            highContrast ? 'bg-[#1e293b] border-yellow-500/40 text-yellow-200' : 'bg-white border-slate-100'
          }`}>
            <div className="flex items-center space-x-3 mb-3">
              <CheckCircle className={`h-5 w-5 ${highContrast ? 'text-yellow-400' : 'text-[#000080]'}`} />
              <h2 className={`text-base md:text-lg font-black tracking-tight ${highContrast ? 'text-yellow-300' : 'text-slate-800'}`}>
                1. Acceptance of Terms
              </h2>
            </div>
            <p className="text-xs md:text-sm font-semibold leading-relaxed opacity-95 text-justify">
              By accessing, browsing, or using the JanSetu AI platform, you agree to comply with and be bound by these Terms of Use. 
              If you do not agree with any part of these terms, you should immediately cease all usage of our services.
            </p>
          </div>

          {/* Section 2: User Responsibilities */}
          <div className={`rounded-xl border p-6 shadow-sm hover:shadow-md transition-all duration-200 ${
            highContrast ? 'bg-[#1e293b] border-yellow-500/40 text-yellow-200' : 'bg-white border-slate-100'
          }`}>
            <div className="flex items-center space-x-3 mb-3">
              <AlertTriangle className={`h-5 w-5 ${highContrast ? 'text-yellow-400' : 'text-[#000080]'}`} />
              <h2 className={`text-base md:text-lg font-black tracking-tight ${highContrast ? 'text-yellow-300' : 'text-slate-800'}`}>
                2. User Responsibilities
              </h2>
            </div>
            <p className="text-xs md:text-sm font-semibold mb-4 leading-relaxed opacity-95">
              As a citizen using JanSetu AI, you are expected to maintain platform integrity by adhering to the following guidelines:
            </p>
            <ul className="space-y-2.5 pl-1">
              {[
                "Provide accurate, truthful, and complete information when submitting issues.",
                "Avoid filing false complaints, mock submissions, or misleading priority requests.",
                "Do not misuse the platform or attempt to disrupt its servers, APIs, or database integrity.",
                "Do not upload illegal, abusive, harmful, obscene, or copy-protected content."
              ].map((item, idx) => (
                <li key={idx} className="flex items-start space-x-2.5 text-xs md:text-sm font-bold opacity-90">
                  <span className={`h-1.5 w-1.5 rounded-full mt-2 flex-shrink-0 ${highContrast ? 'bg-yellow-400' : 'bg-[#FFC107]'}`}></span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section 3: Platform Usage */}
          <div className={`rounded-xl border p-6 shadow-sm hover:shadow-md transition-all duration-200 ${
            highContrast ? 'bg-[#1e293b] border-yellow-500/40 text-yellow-200' : 'bg-white border-slate-100'
          }`}>
            <div className="flex items-center space-x-3 mb-3">
              <Hammer className={`h-5 w-5 ${highContrast ? 'text-yellow-400' : 'text-[#000080]'}`} />
              <h2 className={`text-base md:text-lg font-black tracking-tight ${highContrast ? 'text-yellow-300' : 'text-slate-800'}`}>
                3. Platform Usage
              </h2>
            </div>
            <p className="text-xs md:text-sm font-semibold leading-relaxed opacity-95 text-justify">
              JanSetu AI is designed as a civic-tech public utility to assist citizens in submitting and tracking community grievances. 
              Platform usage is strictly intended for public development and grievance routing to local representatives, and must not be used for commercial advertisement or unrelated communications.
            </p>
          </div>

          {/* Section 4: AI Disclaimer */}
          <div className={`rounded-xl border p-6 shadow-sm hover:shadow-md transition-all duration-200 ${
            highContrast ? 'bg-[#1e293b] border-yellow-500/40 text-yellow-200' : 'bg-white border-slate-100'
          }`}>
            <div className="flex items-center space-x-3 mb-3">
              <Cpu className={`h-5 w-5 ${highContrast ? 'text-yellow-400' : 'text-[#000080]'}`} />
              <h2 className={`text-base md:text-lg font-black tracking-tight ${highContrast ? 'text-yellow-300' : 'text-slate-800'}`}>
                4. AI Disclaimer
              </h2>
            </div>
            <p className="text-xs md:text-sm font-semibold leading-relaxed opacity-95 text-justify">
              The platform utilizes generative and machine learning models to synthesize constituency roadmap action plans, summarize complaint descriptions, and process automated triage assessments. 
              Responses generated by AI are informational in nature and may require human verification and official audit before being relied upon for legal or budgetary purposes.
            </p>
          </div>

          {/* Section 5: Intellectual Property */}
          <div className={`rounded-xl border p-6 shadow-sm hover:shadow-md transition-all duration-200 ${
            highContrast ? 'bg-[#1e293b] border-yellow-500/40 text-yellow-200' : 'bg-white border-slate-100'
          }`}>
            <div className="flex items-center space-x-3 mb-3">
              <HelpCircle className={`h-5 w-5 ${highContrast ? 'text-yellow-400' : 'text-[#000080]'}`} />
              <h2 className={`text-base md:text-lg font-black tracking-tight ${highContrast ? 'text-yellow-300' : 'text-slate-800'}`}>
                5. Intellectual Property
              </h2>
            </div>
            <p className="text-xs md:text-sm font-semibold leading-relaxed opacity-95 text-justify">
              All branding assets, user interface designs, dynamic logos, codebase libraries, templates, and analytical software frameworks belong exclusively to JanSetu AI and the operating developer entity. 
              Unauthorized replication, scraping, or distribution of these assets is prohibited.
            </p>
          </div>

          {/* Section 6: Limitation of Liability */}
          <div className={`rounded-xl border p-6 shadow-sm hover:shadow-md transition-all duration-200 ${
            highContrast ? 'bg-[#1e293b] border-yellow-500/40 text-yellow-200' : 'bg-white border-slate-100'
          }`}>
            <div className="flex items-center space-x-3 mb-3">
              <ShieldAlert className={`h-5 w-5 ${highContrast ? 'text-yellow-400' : 'text-[#000080]'}`} />
              <h2 className={`text-base md:text-lg font-black tracking-tight ${highContrast ? 'text-yellow-300' : 'text-slate-800'}`}>
                6. Limitation of Liability
              </h2>
            </div>
            <p className="text-xs md:text-sm font-semibold leading-relaxed opacity-95 text-justify">
              JanSetu AI, its administrators, representatives, and technology partners are not responsible for any indirect, direct, incidental, or consequential losses caused by user misuse of the platform, database connection failures, or inaccurate coordinates/information submitted by platform users.
            </p>
          </div>

          {/* Section 7: Changes to Terms */}
          <div className={`rounded-xl border p-6 shadow-sm hover:shadow-md transition-all duration-200 ${
            highContrast ? 'bg-[#1e293b] border-yellow-500/40 text-yellow-200' : 'bg-white border-slate-100'
          }`}>
            <div className="flex items-center space-x-3 mb-3">
              <RefreshCw className={`h-5 w-5 ${highContrast ? 'text-yellow-400' : 'text-[#000080]'}`} />
              <h2 className={`text-base md:text-lg font-black tracking-tight ${highContrast ? 'text-yellow-300' : 'text-slate-800'}`}>
                7. Changes to Terms
              </h2>
            </div>
            <p className="text-xs md:text-sm font-semibold leading-relaxed opacity-95 text-justify">
              These terms of use may be updated periodically without prior notice to reflect operational changes. 
              Continued usage of JanSetu AI following any term revisions constitutes explicit agreement to the modified terms.
            </p>
          </div>

          {/* Section 8: Contact Card */}
          <div className={`rounded-xl border p-6 text-center space-y-3 shadow-md ${
            highContrast 
              ? 'bg-[#1e293b] border-yellow-500 text-yellow-300' 
              : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="flex justify-center">
              <div className={`p-2.5 rounded-full ${
                highContrast ? 'bg-yellow-400/10 text-yellow-400' : 'bg-amber-50 text-[#FFC107]'
              }`}>
                <Mail className="h-6 w-6" />
              </div>
            </div>
            <h3 className="text-base font-black tracking-tight">8. Contact Support</h3>
            <p className="text-xs md:text-sm font-semibold opacity-90">
              For queries or clarifications regarding these Terms of Use, reach out to our team:
            </p>
            <a
              href="mailto:jansetusupportteam@gmail.com"
              className="inline-block text-base font-black text-[#000080] dark:text-yellow-400 hover:underline tracking-tight"
            >
              jansetusupportteam@gmail.com
            </a>
          </div>

        </div>

        {/* Footer Area */}
        <div className="text-center pt-4 border-t border-slate-200 dark:border-slate-800">
          <p className="text-xs opacity-75 font-bold">
            © 2026 JanSetu AI. All rights reserved.
          </p>
        </div>

      </div>
    </div>
  );
}
