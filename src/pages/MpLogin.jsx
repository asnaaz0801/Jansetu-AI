import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/db';
import emblemOfIndia from '../assets/emblem-of-india.svg';
import ashokaChakra from '../assets/ashoka-chakra.svg';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ShieldCheck } from 'lucide-react';

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
    securityNotice: "Authorized Access Only. All activities on this portal are logged and monitored."
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
    securityNotice: "केवल अधिकृत पहुंच। इस पोर्टल पर सभी गतिविधियां लॉग और मॉनिटर की जाती हैं।"
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
    securityNotice: "फक्त अधिकृत प्रवेश. या पोर्टलवरील सर्व क्रियाकलाप लॉग आणि मॉनिटर केले जातात."
  }
};

export default function MpLogin({ language, highContrast }) {
  const navigate = useNavigate();
  const t = loginTranslations[language] || loginTranslations['en'];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setErrorMessage('');

    try {
      // Query the Supabase table mp_users
      const { data, error } = await supabase
        .from('mp_users')
        .select('*')
        .eq('email', email.trim().toLowerCase())
        .maybeSingle();

      if (error) {
        console.error("Supabase login query error:", error);
        setErrorMessage(t.invalidCreds);
        setLoading(false);
        return;
      }

      // Compare the entered password with the password stored in the table
      if (data && data.password === password) {
        // Save the MP session in localStorage
        const sessionData = {
          loggedIn: true,
          name: data.name,
          email: data.email,
          constituency: data.constituency
        };
        localStorage.setItem('mp_session', JSON.stringify(sessionData));

        // Dispatch a custom event to notify App.jsx of session changes
        window.dispatchEvent(new Event('mp_session_change'));

        // Redirect to /mp/dashboard
        navigate('/mp/dashboard');
      } else {
        setErrorMessage(t.invalidCreds);
      }
    } catch (err) {
      console.error("Login unexpected error:", err);
      setErrorMessage(t.invalidCreds);
    } finally {
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

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email field */}
              <div className="space-y-1">
                <label className={`text-xs font-bold ${
                  highContrast ? 'text-yellow-300' : 'text-slate-600'
                }`}>
                  {t.emailLabel}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className={`h-4.5 w-4.5 ${
                      highContrast ? 'text-yellow-400/60' : 'text-slate-400'
                    }`} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.emailPlaceholder}
                    className={`w-full rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold focus:outline-none transition-colors border ${
                      highContrast 
                        ? 'bg-slate-950 border-yellow-500/50 text-yellow-300 focus:border-yellow-400' 
                        : 'bg-slate-50 border-slate-300 text-slate-800 focus:border-[#000080] hover:bg-slate-100/50'
                    }`}
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-1">
                <label className={`text-xs font-bold ${
                  highContrast ? 'text-yellow-300' : 'text-slate-600'
                }`}>
                  {t.passwordLabel}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className={`h-4.5 w-4.5 ${
                      highContrast ? 'text-yellow-400/60' : 'text-slate-400'
                    }`} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.passwordPlaceholder}
                    className={`w-full rounded-xl pl-10 pr-10 py-2.5 text-sm font-semibold focus:outline-none transition-colors border ${
                      highContrast 
                        ? 'bg-slate-950 border-yellow-500/50 text-yellow-300 focus:border-yellow-400' 
                        : 'bg-slate-50 border-slate-300 text-slate-800 focus:border-[#000080] hover:bg-slate-100/50'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className={`h-4.5 w-4.5 ${highContrast ? 'text-yellow-400/60' : 'text-slate-400'}`} />
                    ) : (
                      <Eye className={`h-4.5 w-4.5 ${highContrast ? 'text-yellow-400/60' : 'text-slate-400'}`} />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex items-center justify-center font-bold py-3 rounded-xl border transition-all duration-200 shadow-md text-sm md:text-base cursor-pointer ${
                  highContrast
                    ? 'bg-yellow-400 text-black border-yellow-400 hover:bg-yellow-300 disabled:opacity-50'
                    : 'bg-[#000080] text-white border-[#000080] hover:bg-[#000080]/90 hover:shadow-lg disabled:opacity-75'
                }`}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className={`w-4 h-4 border-2 rounded-full animate-spin ${
                      highContrast ? 'border-black border-t-transparent' : 'border-white border-t-transparent'
                    }`}></div>
                    <span>{t.loggingIn}</span>
                  </div>
                ) : (
                  <span>{t.loginBtn}</span>
                )}
              </button>
            </form>
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
