import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Shield, 
  FileText, 
  Database, 
  Eye, 
  Lock, 
  Share2, 
  UserCheck, 
  RefreshCw, 
  Mail 
} from 'lucide-react';

export default function PrivacyPolicy({ language = 'en', fontSize = 16, highContrast = false }) {
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
              <Shield className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">Privacy Policy</h1>
              <p className={`text-sm font-semibold opacity-90 ${highContrast ? 'text-yellow-250' : 'text-slate-500'}`}>
                Your privacy is important to us.
              </p>
            </div>
          </div>
        </div>

        {/* Policy Content Cards Grid */}
        <div className="space-y-6">
          
          {/* Section 1: Introduction */}
          <div className={`rounded-xl border p-6 shadow-sm hover:shadow-md transition-all duration-200 ${
            highContrast ? 'bg-[#1e293b] border-yellow-500/40 text-yellow-200' : 'bg-white border-slate-100'
          }`}>
            <div className="flex items-center space-x-3 mb-3">
              <FileText className={`h-5 w-5 ${highContrast ? 'text-yellow-400' : 'text-[#000080]'}`} />
              <h2 className={`text-base md:text-lg font-black tracking-tight ${highContrast ? 'text-yellow-300' : 'text-slate-800'}`}>
                1. Introduction
              </h2>
            </div>
            <p className="text-xs md:text-sm font-semibold leading-relaxed opacity-95 text-justify">
              JanSetu AI is committed to protecting user privacy. We understand that your trust is built on security and transparency. 
              This Policy details how we handle, process, and secure information collected on our citizen-led platform.
            </p>
          </div>

          {/* Section 2: Information We Collect */}
          <div className={`rounded-xl border p-6 shadow-sm hover:shadow-md transition-all duration-200 ${
            highContrast ? 'bg-[#1e293b] border-yellow-500/40 text-yellow-200' : 'bg-white border-slate-100'
          }`}>
            <div className="flex items-center space-x-3 mb-3">
              <Database className={`h-5 w-5 ${highContrast ? 'text-yellow-400' : 'text-[#000080]'}`} />
              <h2 className={`text-base md:text-lg font-black tracking-tight ${highContrast ? 'text-yellow-300' : 'text-slate-800'}`}>
                2. Information We Collect
              </h2>
            </div>
            <p className="text-xs md:text-sm font-semibold mb-4 leading-relaxed opacity-95">
              To operate the platform effectively and process public requests, we collect the following types of information:
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-1">
              {[
                "Full Name",
                "Email Address",
                "Phone Number",
                "Complaint Details",
                "Uploaded Images/Documents",
                "Location (if user provides)"
              ].map((item, idx) => (
                <li key={idx} className="flex items-center space-x-2 text-xs md:text-sm font-bold opacity-90">
                  <span className={`h-1.5 w-1.5 rounded-full ${highContrast ? 'bg-yellow-400' : 'bg-[#FFC107]'}`}></span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section 3: How We Use Information */}
          <div className={`rounded-xl border p-6 shadow-sm hover:shadow-md transition-all duration-200 ${
            highContrast ? 'bg-[#1e293b] border-yellow-500/40 text-yellow-200' : 'bg-white border-slate-100'
          }`}>
            <div className="flex items-center space-x-3 mb-3">
              <Eye className={`h-5 w-5 ${highContrast ? 'text-yellow-400' : 'text-[#000080]'}`} />
              <h2 className={`text-base md:text-lg font-black tracking-tight ${highContrast ? 'text-yellow-300' : 'text-slate-800'}`}>
                3. How We Use Information
              </h2>
            </div>
            <p className="text-xs md:text-sm font-semibold mb-4 leading-relaxed opacity-95">
              Your collected information is used with strict operational boundaries to:
            </p>
            <ul className="space-y-2.5 pl-1">
              {[
                "Process grievance requests and assign them to respective constituency administrators.",
                "Improve platform performance, responsiveness, and algorithmic triage models.",
                "Contact users regarding complaint progress updates and notifications.",
                "Generate AI-assisted response summaries and development diagnostics.",
                "Maintain platform security and prevent malicious access or fraudulent submissions."
              ].map((item, idx) => (
                <li key={idx} className="flex items-start space-x-2.5 text-xs md:text-sm font-bold opacity-90">
                  <span className={`h-1.5 w-1.5 rounded-full mt-1.5 flex-shrink-0 ${highContrast ? 'bg-yellow-400' : 'bg-[#FFC107]'}`}></span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section 4: Data Security */}
          <div className={`rounded-xl border p-6 shadow-sm hover:shadow-md transition-all duration-200 ${
            highContrast ? 'bg-[#1e293b] border-yellow-500/40 text-yellow-200' : 'bg-white border-slate-100'
          }`}>
            <div className="flex items-center space-x-3 mb-3">
              <Lock className={`h-5 w-5 ${highContrast ? 'text-yellow-400' : 'text-[#000080]'}`} />
              <h2 className={`text-base md:text-lg font-black tracking-tight ${highContrast ? 'text-yellow-300' : 'text-slate-800'}`}>
                4. Data Security
              </h2>
            </div>
            <p className="text-xs md:text-sm font-semibold leading-relaxed opacity-95 text-justify">
              All user data is stored securely using cryptographic mechanisms and secure database infrastructure. 
              We utilize robust encryption protocols, network isolation, and access control lists to ensure reasonable security measures are enforced continuously to protect citizen information against unauthorized access, alteration, or disclosure.
            </p>
          </div>

          {/* Section 5: Data Sharing */}
          <div className={`rounded-xl border p-6 shadow-sm hover:shadow-md transition-all duration-200 ${
            highContrast ? 'bg-[#1e293b] border-yellow-500/40 text-yellow-200' : 'bg-white border-slate-100'
          }`}>
            <div className="flex items-center space-x-3 mb-3">
              <Share2 className={`h-5 w-5 ${highContrast ? 'text-yellow-400' : 'text-[#000080]'}`} />
              <h2 className={`text-base md:text-lg font-black tracking-tight ${highContrast ? 'text-yellow-300' : 'text-slate-800'}`}>
                5. Data Sharing
              </h2>
            </div>
            <p className="text-xs md:text-sm font-semibold leading-relaxed opacity-95 text-justify">
              We uphold a strict no-sale privacy model: <strong className={highContrast ? 'text-white' : 'text-black'}>your user data is never sold.</strong> 
              Information is shared only when required by law or with authorized government and constituency authorities solely for the resolution of your submitted grievances.
            </p>
          </div>

          {/* Section 6: User Rights */}
          <div className={`rounded-xl border p-6 shadow-sm hover:shadow-md transition-all duration-200 ${
            highContrast ? 'bg-[#1e293b] border-yellow-500/40 text-yellow-200' : 'bg-white border-slate-100'
          }`}>
            <div className="flex items-center space-x-3 mb-3">
              <UserCheck className={`h-5 w-5 ${highContrast ? 'text-yellow-400' : 'text-[#000080]'}`} />
              <h2 className={`text-base md:text-lg font-black tracking-tight ${highContrast ? 'text-yellow-300' : 'text-slate-800'}`}>
                6. User Rights
              </h2>
            </div>
            <p className="text-xs md:text-sm font-semibold leading-relaxed opacity-95 text-justify">
              Citizens are in complete control of their inputs. Users may request correction or deletion of their personal information and file records at any time by contacting our support team directly.
            </p>
          </div>

          {/* Section 7: Changes to Policy */}
          <div className={`rounded-xl border p-6 shadow-sm hover:shadow-md transition-all duration-200 ${
            highContrast ? 'bg-[#1e293b] border-yellow-500/40 text-yellow-200' : 'bg-white border-slate-100'
          }`}>
            <div className="flex items-center space-x-3 mb-3">
              <RefreshCw className={`h-5 w-5 ${highContrast ? 'text-yellow-400' : 'text-[#000080]'}`} />
              <h2 className={`text-base md:text-lg font-black tracking-tight ${highContrast ? 'text-yellow-300' : 'text-slate-800'}`}>
                7. Changes to Policy
              </h2>
            </div>
            <p className="text-xs md:text-sm font-semibold leading-relaxed opacity-95 text-justify">
              To support evolving compliance frameworks and platform improvements, this policy may be updated periodically. 
              We encourage users to review this page regularly for changes.
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
              For any questions regarding privacy practices, or to exercise your user rights, reach out to us:
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
