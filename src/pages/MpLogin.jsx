import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/db';
import emblemOfIndia from '../assets/emblem-of-india.svg';
import ashokaChakra from '../assets/ashoka-chakra.svg';
import { AlertCircle, ShieldCheck } from 'lucide-react';

const loginTranslations = {
  en: {
    goi: "Government of India",
    portalTitle: "Member of Parliament Portal",
    subtitle: "Secure Access Gateway",
    emailLabel: "Official Email Address",
    emailPlaceholder: "example@sansad.nic.in",
    passwordLabel: "Password",
    passwordPlaceholder: "••••••••",
    loginBtn: "Secure Login",
    loggingIn: "Authenticating...",
    invalidCreds: "Invalid email or password.",
    designedBy: "Designed & Developed by National Informatics Centre (NIC)",
    securityNotice: "Authorized Access Only. All activities on this portal are logged and monitored.",
    signInWithGoogle: "Sign In with Google",
    onlyAuthorizedMps: "Authorized MPs will be redirected to the dashboard. Citizens will be redirected to the public portal."
  },
  hi: {
    goi: "भारत सरकार",
    portalTitle: "संसद सदस्य पोर्टल",
    subtitle: "सुरक्षित पहुंच गेटवे",
    emailLabel: "आधिकारिक ईमेल पता",
    emailPlaceholder: "example@sansad.nic.in",
    passwordLabel: "पासवर्ड",
    passwordPlaceholder: "••••••••",
    loginBtn: "सुरक्षित लॉगिन",
    loggingIn: "प्रमाणित किया जा रहा है...",
    invalidCreds: "अमान्य ईमेल या पासवर्ड।",
    designedBy: "राष्ट्रीय सूचना विज्ञान केंद्र (एनआईसी) द्वारा डिजाइन और विकसित",
    securityNotice: "केवल अधिकृत पहुंच। इस पोर्टल पर सभी गतिविधियां लॉग और मॉनिटर की जाती हैं।",
    signInWithGoogle: "गूगल के साथ साइन इन करें",
    onlyAuthorizedMps: "अधिकृत सांसदों को डैशबोर्ड पर निर्देशित किया जाएगा। नागरिकों को सार्वजनिक पोर्टल पर निर्देशित किया जाएगा।"
  },
  mr: {
    goi: "भारत सरकार",
    portalTitle: "खासदार पोर्टल",
    subtitle: "सुरक्षित प्रवेश मार्ग",
    emailLabel: "अधिकृत ईमेल पत्ता",
    emailPlaceholder: "example@sansad.nic.in",
    passwordLabel: "पासवर्ड",
    passwordPlaceholder: "••••••••",
    loginBtn: "सुरक्षित लॉगिन",
    loggingIn: "प्रमाणित करत आहे...",
    invalidCreds: "अमान्य ईमेल किंवा पासवर्ड.",
    designedBy: "राष्ट्रीय सूचना विज्ञान केंद्र (NIC) द्वारे डिझाइन आणि विकसित",
    securityNotice: "फक्त अधिकृत प्रवेश. या पोर्टलवरील सर्व क्रियाकलाप लॉग आणि मॉनिटर केले जातात.",
    signInWithGoogle: "गूगलने साइन इन करा",
    onlyAuthorizedMps: "अधिकृत खासदारांना डॅशबोर्डवर निर्देशित केले जाईल. नागरिकांना सार्वजनिक पोर्टलवर निर्देशित केले जाईल।"
  }
};

export default function MpLogin({ language, highContrast }) {
  const navigate = useNavigate();
  const t = loginTranslations[language] || loginTranslations['en'];

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // If already logged in, redirect to dashboard
  useEffect(() => {
    try {
      const sessionString = localStorage.getItem('mp_session');
      const session = sessionString ? JSON.parse(sessionString) : null;
      if (session && session.loggedIn) {
        navigate('/mp/dashboard');
      }
    } catch (e) {
      console.error("Error reading session on login mount:", e);
    }
  }, [navigate]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/mp/login',
        },
      });
      if (error) {
        console.error("Sign-in failed:", error.message);
        setErrorMessage(error.message);
        setLoading(false);
      }
    } catch (err) {
      console.error("Sign-in unexpected error:", err);
      setErrorMessage("An unexpected error occurred during sign-in.");
      setLoading(false);
    }
  };

  return (
    <div className={`flex-1 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden transition-colors duration-200 ${
      highContrast ? 'bg-[#0f172a]' : 'bg-[#F8FAFC]'
    }`}>
      {/* Background Ashoka Chakra Watermark */}
      <div 
        className="absolute pointer-events-none flex items-center justify-center overflow-hidden z-0 select-none opacity-3"
        style={{ width: '500px', height: '500px' }}
      >
        <img 
          src={ashokaChakra} 
          alt="" 
          className="w-full h-full object-contain" 
        />
      </div>

      <div className="w-full max-w-md z-10">
        {/* Tricolor Accent Card wrapper */}
        <div className={`shadow-xl rounded-3xl border overflow-hidden transition-all duration-200 ${
          highContrast 
            ? 'bg-[#1e293b] border-yellow-500/30 shadow-yellow-500/5' 
            : 'bg-white border-slate-200 shadow-slate-200/50'
        }`}>
          {/* Saffron/White/Green top strip */}
          <div className="h-1.5 flex w-full">
            <div className="bg-[#FF9933] flex-1"></div>
            <div className="bg-[#FFFFFF] w-1/4"></div>
            <div className="bg-[#138808] flex-1"></div>
          </div>

          <div className="p-8">
            {/* National Emblem & Title Header */}
            <div className="flex flex-col items-center text-center mb-8">
              <img 
                src={emblemOfIndia} 
                alt="National Emblem of India" 
                className="h-16 w-auto select-none pointer-events-none mb-3 object-contain"
              />
              <span className={`text-[10px] font-black uppercase tracking-widest ${
                highContrast ? 'text-yellow-400' : 'text-[#FF9933]'
              }`}>
                {t.goi}
              </span>
              <h2 className={`text-xl font-black tracking-tight mt-1 ${
                highContrast ? 'text-white' : 'text-[#000080]'
              }`}>
                {t.portalTitle}
              </h2>
              <div className={`mt-2.5 px-3 py-1 rounded-full text-[10px] font-bold border inline-flex items-center space-x-1.5 ${
                highContrast 
                  ? 'bg-slate-900 border-yellow-500/30 text-yellow-300' 
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}>
                <ShieldCheck className="h-3.5 w-3.5 text-[#138808]" />
                <span>{t.subtitle}</span>
              </div>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className={`p-4 rounded-xl border flex items-start space-x-2.5 mb-6 text-sm font-semibold animate-fadeIn ${
                highContrast 
                  ? 'bg-red-950/20 border-red-500/40 text-red-300' 
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}>
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Google Sign-In Button */}
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className={`w-full flex items-center justify-center space-x-3 font-black py-3.5 px-4 rounded-xl border transition-all duration-300 shadow-md text-sm md:text-base cursor-pointer ${
                  highContrast
                    ? 'bg-yellow-400 text-black border-yellow-400 hover:bg-yellow-300 disabled:opacity-50'
                    : 'bg-white text-slate-800 border-slate-250 hover:bg-slate-50 hover:shadow-lg focus:ring-4 focus:ring-slate-100 disabled:opacity-75'
                }`}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className={`w-4.5 h-4.5 border-2 rounded-full animate-spin ${
                      highContrast ? 'border-black border-t-transparent' : 'border-slate-850 border-t-transparent'
                    }`}></div>
                    <span>{t.loggingIn}</span>
                  </div>
                ) : (
                  <>
                    <svg className="w-5.5 h-5.5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    <span>{t.signInWithGoogle}</span>
                  </>
                )}
              </button>
              <p className={`text-[11px] font-semibold text-center leading-relaxed ${
                highContrast ? 'text-yellow-450/80' : 'text-slate-500'
              }`}>
                {t.onlyAuthorizedMps}
              </p>
            </div>
          </div>

          {/* Security Banner Notice */}
          <div className={`px-8 py-3.5 border-t text-[10px] leading-relaxed text-center font-semibold ${
            highContrast ? 'border-yellow-500/20 bg-slate-900/40 text-yellow-500/70' : 'bg-slate-50/50 border-slate-100 text-slate-500'
          }`}>
            {t.securityNotice}
          </div>
        </div>

      </div>
    </div>
  );
}
