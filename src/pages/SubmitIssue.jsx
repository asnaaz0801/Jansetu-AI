import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Check, 
  MapPin, 
  Mic, 
  MicOff, 
  Upload, 
  X, 
  ShieldAlert, 
  AlertCircle, 
  CheckCircle2, 
  Info,
  Calendar,
  Sparkles,
  HelpCircle,
  Clock,
  ChevronRight,
  TrendingUp,
  Award,
  FileText,
  Camera
} from 'lucide-react';
import { translations } from '../lib/translations';
import { supabase } from '../lib/db';
import emblemOfIndia from '../assets/emblem-of-india.svg';
import ashokaChakra from '../assets/ashoka-chakra.svg';

export default function SubmitIssue({ language, fontSize, highContrast }) {
  const t = translations[language];
  const navigate = useNavigate();

  // Categories configurations with icons & localized labels
  const categoriesData = [
    { id: 'roads', icon: '🛣', titleKey: 'catRoads' },
    { id: 'water', icon: '💧', titleKey: 'catWater' },
    { id: 'electricity', icon: '⚡', titleKey: 'catElectricity' },
    { id: 'health', icon: '🏥', titleKey: 'catHealth' },
    { id: 'education', icon: '🏫', titleKey: 'catEducation' },
    { id: 'employment', icon: '💼', titleKey: 'catEmployment' },
    { id: 'sanitation', icon: '🗑', titleKey: 'catSanitation' },
    { id: 'other', icon: '📌', titleKey: 'catOther' }
  ];

  // Subcategories configurations
  const subcategoriesData = {
    roads: [
      { id: 'potholes', labelKey: 'subRoadsPotholes' },
      { id: 'road_damage', labelKey: 'subRoadsDamage' },
      { id: 'construction', labelKey: 'subRoadsConstruction' },
      { id: 'traffic', labelKey: 'subRoadsTraffic' },
      { id: 'missing_signs', labelKey: 'subRoadsSigns' },
      { id: 'poor_drainage', labelKey: 'subRoadsDrainage' },
      { id: 'encroachment', labelKey: 'subRoadsEncroachment' },
      { id: 'other', labelKey: 'subRoadsOther' }
    ],
    water: [
      { id: 'no_water', labelKey: 'subWaterNoWater' },
      { id: 'shortage', labelKey: 'subWaterShortage' },
      { id: 'leakage', labelKey: 'subWaterLeakage' },
      { id: 'low_pressure', labelKey: 'subWaterPressure' },
      { id: 'contaminated', labelKey: 'subWaterContaminated' },
      { id: 'broken_pipeline', labelKey: 'subWaterPipeline' },
      { id: 'tank_maintenance', labelKey: 'subWaterMaintenance' },
      { id: 'other', labelKey: 'subWaterOther' }
    ],
    electricity: [
      { id: 'outage', labelKey: 'subElecOutage' },
      { id: 'cuts', labelKey: 'subElecCuts' },
      { id: 'street_lights', labelKey: 'subElecStreetlights' },
      { id: 'transformer', labelKey: 'subElecTransformer' },
      { id: 'voltage', labelKey: 'subElecVoltage' },
      { id: 'wires', labelKey: 'subElecWires' },
      { id: 'other', labelKey: 'subElecOther' }
    ],
    health: [
      { id: 'infrastructure', labelKey: 'subHealthInfra' },
      { id: 'doctor_shortage', labelKey: 'subHealthDoctors' },
      { id: 'medicine_shortage', labelKey: 'subHealthMedicines' },
      { id: 'ambulance', labelKey: 'subHealthAmbulance' },
      { id: 'health_camp', labelKey: 'subHealthCamp' },
      { id: 'cleanliness', labelKey: 'subHealthCleanliness' },
      { id: 'other', labelKey: 'subHealthOther' }
    ],
    education: [
      { id: 'school_repair', labelKey: 'subEduRepair' },
      { id: 'teacher_shortage', labelKey: 'subEduTeachers' },
      { id: 'classroom_shortage', labelKey: 'subEduClassrooms' },
      { id: 'toilets', labelKey: 'subEduToilets' },
      { id: 'digital_learning', labelKey: 'subEduDigital' },
      { id: 'new_school', labelKey: 'subEduNewSchool' },
      { id: 'other', labelKey: 'subEduOther' }
    ],
    employment: [
      { id: 'skill_center', labelKey: 'subEmpCenter' },
      { id: 'job_fair', labelKey: 'subEmpFair' },
      { id: 'opportunities', labelKey: 'subEmpOpportunities' },
      { id: 'vocational', labelKey: 'subEmpVocational' },
      { id: 'self_employment', labelKey: 'subEmpSelf' },
      { id: 'other', labelKey: 'subEmpOther' }
    ],
    sanitation: [
      { id: 'garbage_collection', labelKey: 'subSanGarbage' },
      { id: 'overflow_dustbins', labelKey: 'subSanDustbins' },
      { id: 'toilet_issues', labelKey: 'subSanToilets' },
      { id: 'drainage_problems', labelKey: 'subSanDrainage' },
      { id: 'sewage_leakage', labelKey: 'subSanSewage' },
      { id: 'other', labelKey: 'subSanOther' }
    ],
    other: [
      { id: 'custom_input', labelKey: 'subOtherCustom' }
    ]
  };

  // Severities config
  const severitiesList = [
    { id: 'Low', color: 'bg-emerald-500', text: 'severityLow' },
    { id: 'Medium', color: 'bg-yellow-500', text: 'severityMedium' },
    { id: 'High', color: 'bg-orange-500', text: 'severityHigh' },
    { id: 'Critical', color: 'bg-red-500', text: 'severityCritical' }
  ];

  // Estimated Impact config
  const impactsList = [
    { id: '1-50', label: '1–50' },
    { id: '50-200', label: '50–200' },
    { id: '200-1000', label: '200–1000' },
    { id: '1000+', label: '1000+' }
  ];

  // FORM WIZARD STATE
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [customCategoryText, setCustomCategoryText] = useState('');
  const [severity, setSeverity] = useState('Medium');
  const [impact, setImpact] = useState('50-200');
  const [description, setDescription] = useState('');
  const [citizenName, setCitizenName] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('text'); // 'voice' | 'text' | 'photo' | 'location'
  
  // Simulation States
  const [isRecording, setIsRecording] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceCompleted, setVoiceCompleted] = useState(false);
  
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationCoords, setLocationCoords] = useState(null);
  const [locationSuccess, setLocationSuccess] = useState(false);

  // Location fields states
  const [locState, setLocState] = useState('');
  const [locDistrict, setLocDistrict] = useState('');
  const [locCity, setLocCity] = useState('');
  const [locArea, setLocArea] = useState('');
  const [locPincode, setLocPincode] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Submit and modal states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Helper variables
  const fileInputRef = useRef(null);

  // Description character limit
  const maxCharCount = 500;

  // Handle category change
  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory('');
    setCustomCategoryText('');
    
    // Clear validation error for category
    if (validationErrors.category) {
      setValidationErrors(prev => ({ ...prev, category: null }));
    }
  };

  // Handle Description Change
  const handleDescChange = (e) => {
    const val = e.target.value;
    if (val.length <= maxCharCount) {
      setDescription(val);
      if (validationErrors.description) {
        setValidationErrors(prev => ({ ...prev, description: null }));
      }
    }
  };

  // Dynamic placeholders based on category
  const getDescriptionPlaceholder = () => {
    if (language === 'hi') return 'अपनी समस्या का विस्तार से वर्णन करें...';
    if (language === 'mr') return 'तुमच्या समस्येचे सविस्तर वर्णन करा...';
    return 'Describe your issue in detail...';
  };

  // VOICE INPUT NATIVE SPEECH RECOGNITION
  const recognitionRef = useRef(null);
  const descriptionStartRef = useRef('');

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      
      let langCode = 'en-IN';
      if (language === 'hi') langCode = 'hi-IN';
      else if (language === 'mr') langCode = 'mr-IN';
      rec.lang = langCode;

      rec.onstart = () => {
        setIsRecording(true);
        setVoiceCompleted(false);
      };

      rec.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        if (event.error === 'not-allowed') {
          alert(language === 'hi' 
            ? 'माइक्रोफ़ोन अनुमति अस्वीकृत। कृपया अपने ब्राउज़र सेटिंग में अनुमति सक्षम करें।' 
            : language === 'mr'
            ? 'मायक्रोफोन परवानगी नाकारली. कृपया आपल्या ब्राउझर सेटिंग्जमध्ये परवानगी द्या.'
            : 'Microphone permission denied. Please enable permission in your browser settings.');
        }
        // Silently stop recording on common harmless errors like 'no-speech' or 'aborted' without popping up annoying alerts
      };

      rec.onend = () => {
        setIsRecording(false);
        setVoiceCompleted(true);
      };

      rec.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        const recognizedText = finalTranscript + interimTranscript;
        if (recognizedText.trim()) {
          setVoiceTranscript(recognizedText);
          const baseText = descriptionStartRef.current;
          const fullText = baseText ? `${baseText.trim()} ${recognizedText.trim()}` : recognizedText.trim();
          if (fullText.length <= maxCharCount) {
            setDescription(fullText);
          } else {
            setDescription(fullText.substring(0, maxCharCount));
          }
        }
      };

      recognitionRef.current = rec;
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [language]);

  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(language === 'hi' 
        ? 'आपका ब्राउज़र स्पीच रिकग्निशन का समर्थन नहीं करता है। कृपया क्रोम या एज का उपयोग करें।' 
        : language === 'mr'
        ? 'तुमचा ब्राउझर स्पीच रिकग्निशनला समर्थन देत नाही. कृपया क्रोम किंवा एज वापरा.'
        : 'Your browser does not support Speech Recognition. Please use Chrome or Edge.');
      return;
    }

    if (recognitionRef.current) {
      descriptionStartRef.current = description;
      setVoiceTranscript('');
      setVoiceCompleted(false);
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('Failed to start recognition:', err);
      }
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error('Failed to stop recognition:', err);
      }
    }
    setIsRecording(false);
  };

  // PHOTO UPLOAD HANDLERS
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  const processFile = (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      alert(t.onlyImagesAllowed);
      return;
    }
    setPhotoFile(file);
    const url = URL.createObjectURL(file);
    setPhotoPreviewUrl(url);
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreviewUrl(null);
  };

  // REVERSE GEOCODING API INTEGRATION
  const reverseGeocode = async (lat, lng) => {
    setIsGeocoding(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`, {
        headers: {
          'User-Agent': 'Jansetu-AI-Constituency-Planner-App'
        }
      });
      if (!response.ok) throw new Error('Geocoding network response failed');
      const data = await response.json();
      
      if (data && data.address) {
        const address = data.address;
        const displayName = data.display_name || '';

        const utMap = {
          'IN-DL': 'Delhi',
          'IN-CH': 'Chandigarh',
          'IN-JK': 'Jammu and Kashmir',
          'IN-PY': 'Puducherry',
          'IN-AN': 'Andaman and Nicobar Islands',
          'IN-DN': 'Dadra and Nagar Haveli and Daman and Diu',
          'IN-LA': 'Ladakh',
          'IN-LD': 'Lakshadweep'
        };

        // 1. State
        let state = address.state || '';
        if (!state && address['ISO3166-2-lvl4']) {
          const isoCode = address['ISO3166-2-lvl4'];
          if (utMap[isoCode]) {
            state = utMap[isoCode];
          }
        }
        if (!state && displayName) {
          const parts = displayName.split(',').map(p => p.trim());
          const knownStates = ["Delhi", "Chandigarh", "Jammu and Kashmir", "Puducherry", "Andaman and Nicobar Islands", "Dadra and Nagar Haveli and Daman and Diu", "Ladakh", "Lakshadweep", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"];
          for (const part of parts) {
            if (knownStates.includes(part)) {
              state = part;
              break;
            }
          }
        }

        // 2. District
        let district = address.state_district || address.county || address.district || '';
        if (!district && displayName) {
          if (address.city === "New Delhi" || address.city === "Delhi") {
            district = address.city;
          }
        }

        // 3. City
        const city = address.city || address.town || address.village || address.municipality || address.city_district || '';

        // 4. Area / Village / Locality
        const area = address.suburb || address.neighbourhood || address.quarter || address.residential || address.road || address.hamlet || '';

        // 5. Pincode
        const pincode = address.postcode || '';

        setLocState(state);
        setLocDistrict(district);
        setLocCity(city);
        
        // Clear address validation errors when populated
        setValidationErrors(prev => ({
          ...prev,
          locState: null,
          locDistrict: null,
          locCity: null
        }));
      }
    } catch (error) {
      console.error("Reverse geocoding error:", error);
    } finally {
      setIsGeocoding(false);
    }
  };

  // GPS LOCATION DETECTION (Capture exact location using device GPS)
  const detectLocation = () => {
    setIsDetectingLocation(true);
    setLocationSuccess(false);
    
    if (navigator.geolocation) {
      // Configure geolocation options to request fresh, high-accuracy GPS data
      const geoOptions = {
        enableHighAccuracy: true,
        timeout: 15000, // 15 seconds timeout to allow GPS hardware to lock
        maximumAge: 0   // Force fetching fresh location (no cache)
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsDetectingLocation(false);
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setLocationCoords({ lat, lng });
          setLocationSuccess(true);
          if (validationErrors.location) {
            setValidationErrors(prev => ({ ...prev, location: null }));
          }
          reverseGeocode(lat, lng);
        },
        (error) => {
          console.warn("GPS high-accuracy geolocation failed:", error);
          
          // Inform user of specific error types
          if (error.code === error.PERMISSION_DENIED) {
            setIsDetectingLocation(false);
            alert(language === 'hi' 
              ? 'स्थान अनुमति अस्वीकृत। कृपया सटीक स्थान प्राप्त करने के लिए अपने ब्राउज़र सेटिंग में स्थान अनुमति सक्षम करें।' 
              : language === 'mr'
              ? 'स्थान परवानगी नाकारली. कृपया अचूक स्थान मिळवण्यासाठी आपल्या ब्राउझर सेटिंग्जमध्ये स्थान परवानगी द्या.'
              : 'Location permission denied. Please enable location permissions in browser settings to capture precise GPS coordinates.');
            return;
          }

          // Fallback to network/IP-based location if GPS is unavailable or times out
          console.log("Attempting network location fallback...");
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              setIsDetectingLocation(false);
              const lat = pos.coords.latitude;
              const lng = pos.coords.longitude;
              setLocationCoords({ lat, lng });
              setLocationSuccess(true);
              if (validationErrors.location) {
                setValidationErrors(prev => ({ ...prev, location: null }));
              }
              reverseGeocode(lat, lng);
            },
            (err) => {
              console.warn("Network location fallback failed, using Delhi center coordinates:", err);
              setIsDetectingLocation(false);
              // Fallback to center coordinates (Delhi) with slight random variation
              const lat = 28.6139 + (Math.random() - 0.5) * 0.01;
              const lng = 77.2090 + (Math.random() - 0.5) * 0.01;
              setLocationCoords({ lat, lng });
              setLocationSuccess(true);
              if (validationErrors.location) {
                setValidationErrors(prev => ({ ...prev, location: null }));
              }
              reverseGeocode(lat, lng);
            },
            { enableHighAccuracy: false, timeout: 5000, maximumAge: 600000 }
          );
        },
        geoOptions
      );
    } else {
      setIsDetectingLocation(false);
      alert(language === 'hi' 
        ? 'आपका ब्राउज़र जीपीएस स्थान का समर्थन नहीं करता है।' 
        : language === 'mr'
        ? 'तुमचा ब्राउझर जीपीएस स्थानाला समर्थन देत नाही.'
        : 'Your browser does not support GPS location detection.');
    }
  };

  // Helper component to render administrative location input fields
  const renderAddressFields = () => {
    if (!locationSuccess) return null;
    
    return (
      <div className="mt-4 border-t border-slate-100/10 pt-4 animate-fadeIn space-y-4 text-left">
        {isGeocoding && (
          <div className="flex items-center space-x-2 text-xs font-semibold text-blue-600">
            <span className="h-3.5 w-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span>Fetching address details / पता विवरण लोड हो रहा है...</span>
          </div>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* State */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider mb-1.5 text-slate-500">
              State / राज्य <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={locState}
              onChange={(e) => {
                setLocState(e.target.value);
                if (validationErrors.locState) {
                  setValidationErrors(prev => ({ ...prev, locState: null }));
                }
              }}
              placeholder="e.g. Delhi"
              className={`w-full p-3 rounded-lg border text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                validationErrors.locState
                  ? 'border-red-500 focus:ring-red-500/20'
                  : highContrast
                    ? 'bg-[#0f172a] border-yellow-500/55 text-yellow-300'
                    : 'bg-white border-slate-200 text-slate-800'
              }`}
            />
            {validationErrors.locState && (
              <p className="mt-1 text-[10px] text-red-500 font-bold">{validationErrors.locState}</p>
            )}
          </div>

          {/* District */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider mb-1.5 text-slate-500">
              District / जिला <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={locDistrict}
              onChange={(e) => {
                setLocDistrict(e.target.value);
                if (validationErrors.locDistrict) {
                  setValidationErrors(prev => ({ ...prev, locDistrict: null }));
                }
              }}
              placeholder="e.g. Central Delhi"
              className={`w-full p-3 rounded-lg border text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                validationErrors.locDistrict
                  ? 'border-red-500 focus:ring-red-500/20'
                  : highContrast
                    ? 'bg-[#0f172a] border-yellow-500/55 text-yellow-300'
                    : 'bg-white border-slate-200 text-slate-800'
              }`}
            />
            {validationErrors.locDistrict && (
              <p className="mt-1 text-[10px] text-red-500 font-bold">{validationErrors.locDistrict}</p>
            )}
          </div>

          {/* City */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider mb-1.5 text-slate-500">
              City / शहर <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={locCity}
              onChange={(e) => {
                setLocCity(e.target.value);
                if (validationErrors.locCity) {
                  setValidationErrors(prev => ({ ...prev, locCity: null }));
                }
              }}
              placeholder="e.g. New Delhi"
              className={`w-full p-3 rounded-lg border text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                validationErrors.locCity
                  ? 'border-red-500 focus:ring-red-500/20'
                  : highContrast
                    ? 'bg-[#0f172a] border-yellow-500/55 text-yellow-300'
                    : 'bg-white border-slate-200 text-slate-800'
              }`}
            />
            {validationErrors.locCity && (
              <p className="mt-1 text-[10px] text-red-500 font-bold">{validationErrors.locCity}</p>
            )}
          </div>

          {/* Area / Village */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider mb-1.5 text-slate-500">
              Area / Village / क्षेत्र / गाँव <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={locArea}
              onChange={(e) => {
                setLocArea(e.target.value);
                if (validationErrors.locArea) {
                  setValidationErrors(prev => ({ ...prev, locArea: null }));
                }
              }}
              placeholder="e.g. Raisina Hill"
              className={`w-full p-3 rounded-lg border text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                validationErrors.locArea
                  ? 'border-red-500 focus:ring-red-500/20'
                  : highContrast
                    ? 'bg-[#0f172a] border-yellow-500/55 text-yellow-300'
                    : 'bg-white border-slate-200 text-slate-800'
              }`}
            />
            {validationErrors.locArea && (
              <p className="mt-1 text-[10px] text-red-500 font-bold">{validationErrors.locArea}</p>
            )}
          </div>

          {/* Pincode */}
          <div className="sm:col-span-2">
            <label className="block text-[10px] font-black uppercase tracking-wider mb-1.5 text-slate-500">
              Pincode / पिनकोड <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={locPincode}
              onChange={(e) => {
                setLocPincode(e.target.value);
                if (validationErrors.locPincode) {
                  setValidationErrors(prev => ({ ...prev, locPincode: null }));
                }
              }}
              placeholder="e.g. 110004"
              className={`w-full p-3 rounded-lg border text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                validationErrors.locPincode
                  ? 'border-red-500 focus:ring-red-500/20'
                  : highContrast
                    ? 'bg-[#0f172a] border-yellow-500/55 text-yellow-300'
                    : 'bg-white border-slate-200 text-slate-800'
              }`}
            />
            {validationErrors.locPincode && (
              <p className="mt-1 text-[10px] text-red-500 font-bold">{validationErrors.locPincode}</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  // FORM VALIDATION & SUBMISSION
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setValidationErrors({
        submit: language === 'hi' 
          ? 'कृपया शिकायत दर्ज करने से पहले गूगल के साथ साइन इन करें।' 
          : language === 'mr'
          ? 'कृपया तक्रार नोंदवण्यापूर्वी गूगलने साइन इन करा.'
          : 'Please Sign In with Google before submitting a complaint.'
      });
      return;
    }

    const errors = {};

    if (!selectedCategory) {
      errors.category = t.selectCategoryAlert;
    }
    if (!selectedSubcategory && selectedCategory !== 'other') {
      errors.subcategory = t.selectSubcategoryAlert;
    }
    if (selectedCategory === 'other' && !customCategoryText.trim()) {
      errors.subcategory = t.selectSubcategoryAlert;
    }
    if (!description.trim()) {
      errors.description = t.enterDescriptionAlert;
    } else if (description.trim().length < 30) {
      errors.description = t.descMinLengthError;
    }
    if (!locationCoords) {
      errors.location = t.detectLocationAlert;
    } else {
      // Validate administrative location fields
      if (!locState.trim()) {
        errors.locState = t.locStateRequired;
      }
      if (!locDistrict.trim()) {
        errors.locDistrict = t.locDistrictRequired;
      }
      if (!locCity.trim()) {
        errors.locCity = t.locCityRequired;
      }
      if (!locArea.trim()) {
        errors.locArea = t.locAreaRequired;
      }
      if (!locPincode.trim()) {
        errors.locPincode = t.locPincodeRequired;
      }
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      
      // Scroll to the first error
      const firstErrorKey = Object.keys(errors)[0];
      let anchorId = `error-anchor-${firstErrorKey}`;
      if (['locState', 'locDistrict', 'locCity', 'locArea', 'locPincode'].includes(firstErrorKey)) {
        anchorId = 'error-anchor-location';
      }
      const el = document.getElementById(anchorId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);

    try {
      // Map category ID to the exact English enums expected by the database
      const categoryMapping = {
        roads: 'Roads',
        water: 'Water Supply',
        electricity: 'Electricity',
        health: 'Healthcare',
        education: 'Education',
        employment: 'Other',
        sanitation: 'Garbage',
        other: 'Other'
      };
      const dbCategory = categoryMapping[selectedCategory] || 'Other';

      // Count complaints for this user in this category with status = 'open'
      const { count, error: limitError } = await supabase
        .from('issues')
        .select('issue_id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('category', dbCategory)
        .eq('status', 'open');

      if (limitError) {
        console.error('Error checking category limit:', limitError);
      } else if (count !== null && count >= 3) {
        setValidationErrors(prev => ({
          ...prev,
          submit: language === 'hi' 
            ? 'आपने इस श्रेणी के लिए 3 खुली शिकायतों की सीमा पूरी कर ली है। कृपया दूसरी शिकायत दर्ज करने से पहले सांसद द्वारा उनके समाधान की प्रतीक्षा करें।'
            : language === 'mr'
            ? 'आपण या श्रेणीसाठी 3 खुल्या तक्रारींची मर्यादा पूर्ण केली आहे. कृपया दुसरी तक्रार नोंदवण्यापूर्वी खासदाराने त्याचे निराकरण करण्याची प्रतीक्षा करा.'
            : 'You have reached the limit of 3 open complaints for this category. Please wait for the MP to resolve them before submitting another.'
        }));
        setIsSubmitting(false);
        return;
      }

      // Generate unique sequential reference code — query DB for max existing suffix and increment
      const generateUniqueReferenceCode = async () => {
        const YEAR = new Date().getFullYear();
        const PREFIX = `JSA-${YEAR}-`;

        // 1. Fetch the max existing numeric suffix for this year's codes
        const { data: existingRows } = await supabase
          .from('issues')
          .select('reference_code')
          .like('reference_code', `${PREFIX}%`)
          .order('reference_code', { ascending: false })
          .limit(20);

        let nextNum = 1;
        if (existingRows && existingRows.length > 0) {
          // Extract numeric suffixes and find the max
          const nums = existingRows
            .map(r => parseInt((r.reference_code || '').replace(PREFIX, ''), 10))
            .filter(n => !isNaN(n));
          if (nums.length > 0) {
            nextNum = Math.max(...nums) + 1;
          }
        }

        // 2. Verify the candidate ID doesn't exist (handles race conditions)
        for (let attempt = 0; attempt < 10; attempt++) {
          const candidate = `${PREFIX}${String(nextNum).padStart(4, '0')}`;
          const { data: existing } = await supabase
            .from('issues')
            .select('reference_code')
            .eq('reference_code', candidate)
            .maybeSingle();

          if (!existing) return candidate; // ID is available
          nextNum++; // Try next number on collision
        }

        // Fallback: use timestamp-based unique code
        return `${PREFIX}${Date.now().toString().slice(-6)}`;
      };

      const generatedId = await generateUniqueReferenceCode();

      // Get category label translation
      const categoryLabelObj = categoriesData.find(c => c.id === selectedCategory);
      const categoryLabel = categoryLabelObj ? t[categoryLabelObj.titleKey] : selectedCategory;
      
      // Get subcategory label translation
      let subcategoryLabel = '';
      if (selectedCategory === 'other') {
        subcategoryLabel = customCategoryText.trim();
      } else {
        const subList = subcategoriesData[selectedCategory] || [];
        const subObj = subList.find(s => s.id === selectedSubcategory);
        subcategoryLabel = subObj ? t[subObj.labelKey] : selectedSubcategory;
      }

      // Format location label
      const locationLabel = `${categoryLabel} Location (Ward ${Math.floor(Math.random() * 12) + 1})`;

      let dbTitle = `${categoryLabel}: ${subcategoryLabel}`;
      if (dbTitle.length < 10) {
        dbTitle = `${dbTitle} Issue`;
      }
      if (dbTitle.length < 10) {
        dbTitle = `Constituency Issue: ${dbTitle}`;
      }

      const getBase64 = (file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result);
          reader.onerror = error => reject(error);
        });
      };

      let dbImageUrl = null;
      if (photoFile) {
        try {
          dbImageUrl = await getBase64(photoFile);
        } catch (err) {
          console.error('Error converting photo to base64:', err);
        }
      }

      // Generate unique IDs client-side as fallback / default
      const generatedUuid = typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID 
        ? window.crypto.randomUUID() 
        : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });

      // Ensure coordinates are always set — fallback to Delhi center area if user hasn't detected location
      const finalCoords = locationCoords ?? {
        lat: 28.6139 + (Math.random() - 0.5) * 0.08,
        lng: 77.2090 + (Math.random() - 0.5) * 0.08
      };

      // Create payload matching the Supabase 'issues' table schema
      const payload = {
        issue_id: generatedUuid,
        reference_code: generatedId,
        user_id: user.id,
        citizen_id: user.id,
        email_id: user.email || null,
        title: dbTitle,
        description: description,
        category: dbCategory,
        constituency: 'Central Delhi',
        state: locState.trim() || 'Delhi',
        district: locDistrict.trim() || null,
        city: locCity.trim() || null,
        area: locArea.trim() || null,
        pincode: locPincode.trim() || null,
        latitude: finalCoords.lat,
        longitude: finalCoords.lng,
        geolocation: `POINT(${finalCoords.lng} ${finalCoords.lat})`,
        status: 'open',
        citizen_name: user.user_metadata?.full_name || citizenName.trim() || null,
        image_url: dbImageUrl,
        created_at: new Date().toISOString()
      };

      // Submit to Supabase and await response to get the official database-generated ID
      const { data, error } = await supabase
        .from('issues')
        .insert(payload)
        .select('reference_code')
        .single();

      if (error) {
        console.error('Supabase insert error:', error);
        setValidationErrors(prev => ({
          ...prev,
          submit: t.dbSaveError
        }));
        setIsSubmitting(false);
        return;
      }

      // Show success modal only on successful DB insertion
      setSubmittedId(data.reference_code);
      setValidationErrors({});
      setIsSubmitting(false);
      setShowSuccessModal(true);

    } catch (err) {
      console.error('Submission failed:', err);
      setValidationErrors(prev => ({
        ...prev,
        submit: t.unexpectedError
      }));
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedCategory('');
    setSelectedSubcategory('');
    setCustomCategoryText('');
    setSeverity('Medium');
    setImpact('50-200');
    setDescription('');
    setVoiceTranscript('');
    setVoiceCompleted(false);
    setPhotoFile(null);
    setPhotoPreviewUrl(null);
    setLocationCoords(null);
    setLocationSuccess(false);
    setLocState('');
    setLocDistrict('');
    setLocCity('');
    setLocArea('');
    setLocPincode('');
    setValidationErrors({});
    setShowSuccessModal(false);
    setSelectedMethod('text');
    setCitizenName('');
  };

  const handleDownloadReceipt = () => {
    const dateStr = new Date().toLocaleDateString(
      `${language}-IN`,
      { year: 'numeric', month: 'long', day: 'numeric' }
    );
    
    const categoryTitle = selectedCategory === 'other' 
      ? (customCategoryText || t.catOther)
      : (t[categoriesData.find(c => c.id === selectedCategory)?.titleKey] || selectedCategory);

    const subcategoryLabel = selectedCategory === 'other'
      ? t.otherCategoryCustom
      : (t[((subcategoriesData[selectedCategory] || []).find(s => s.id === selectedSubcategory)?.labelKey)] || selectedSubcategory);

    const printWindow = window.open('', '', 'height=700,width=850');
    printWindow.document.write('<html><head><title>' + t.receiptReceiptTitle + '</title>');
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
            JanSetu AI
          </h2>
          <p class="text-[10px] tracking-wide text-slate-500 font-bold uppercase mt-1">
            ${t.devPlatformSub}
          </p>
        </div>

        <div class="py-6 space-y-4 text-xs relative z-10">
          <div class="flex justify-between items-center bg-slate-100 p-2.5 rounded border border-slate-300">
            <span class="font-extrabold uppercase text-[10px] tracking-wide text-slate-600">
              ${t.complaintIdLabel}:
            </span>
            <span class="font-black text-sm tracking-tight text-slate-900">
              ${submittedId}
            </span>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <span class="font-bold block text-slate-500 text-[9px] uppercase tracking-wide mb-0.5">
                ${t.submissionDateLabel}
              </span>
              <span class="font-black text-slate-800">
                ${dateStr}
              </span>
            </div>
            <div>
              <span class="font-bold block text-slate-500 text-[9px] uppercase tracking-wide mb-0.5">
                ${t.categoryLabel}
              </span>
              <span class="font-black text-slate-800">${categoryTitle} (${subcategoryLabel})</span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 border-t pt-3">
            <div>
              <span class="font-bold block text-slate-500 text-[9px] uppercase tracking-wide mb-0.5">
                ${t.locationLabel} / Coordinates
              </span>
              <span class="font-black text-slate-800">
                ${locationCoords ? `Lat: ${locationCoords.lat.toFixed(4)}, Lng: ${locationCoords.lng.toFixed(4)}` : 'Detected Location'}
              </span>
            </div>
            <div>
              <span class="font-bold block text-slate-500 text-[9px] uppercase tracking-wide mb-0.5">
                ${t.currentStatusLabel}
              </span>
              <span class="font-black text-[#138808] uppercase text-[11px] tracking-wide">
                SUBMITTED
              </span>
            </div>
          </div>

          <div class="border-t pt-3">
            <span class="font-bold block text-slate-500 text-[9px] uppercase tracking-wide mb-1">
              ${t.descLabel}
            </span>
            <p class="text-[11px] leading-relaxed text-slate-700 italic bg-slate-50 p-2.5 rounded border border-slate-200">
              "${description}"
            </p>
          </div>

          <div class="grid grid-cols-2 gap-4 border-t pt-3">
            <div>
              <span class="font-bold block text-slate-500 text-[9px] uppercase tracking-wide mb-0.5">
                Constituency Impact Assessment
              </span>
              <span class="font-bold block text-slate-700">
                Estimated affected: ${impact}
              </span>
            </div>
            <div>
              <span class="font-bold block text-slate-500 text-[9px] uppercase tracking-wide mb-0.5">
                Issue Severity
              </span>
              <span class="font-bold block text-slate-700">
                ${t['severity' + severity] || severity}
              </span>
            </div>
          </div>
        </div>

        <div class="border-t-2 border-slate-800 pt-6 mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-[9px] relative z-10">
          <div class="max-w-xs text-slate-400">
            <p class="font-bold">${t.receiptDisclaimerLabel}</p>
            <p class="leading-tight mt-0.5">
              ${t.receiptDisclaimerText}
            </p>
          </div>
          <div class="text-right self-end sm:self-auto border border-dashed border-slate-400 p-2 rounded bg-slate-50">
            <div class="font-black text-[#000080] uppercase tracking-wider">${t.receiptSecureLabel}</div>
            <div class="text-slate-400 font-mono mt-0.5">REF: ${(submittedId && submittedId.substring(4)) || 'XXXX'}</div>
            <div class="text-slate-400">${t.receiptStatusVerified}</div>
          </div>
        </div>
      </div>
    `);
    
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }, 800);
  };

  // Soundwave animations CSS block
  const soundWaveStyles = `
    @keyframes soundwave-bar {
      0%, 100% { transform: scaleY(0.3); }
      50% { transform: scaleY(1); }
    }
    .soundwave-bar-animated {
      animation: soundwave-bar 1.2s ease-in-out infinite;
      transform-origin: bottom;
    }
  `;

  return (
    <div className={`flex-1 pb-16 transition-colors duration-200 relative overflow-hidden ${
      highContrast ? 'bg-[#0f172a] text-white' : 'bg-slate-50 text-slate-800'
    }`}>
      {/* Dynamic Sound Wave Styles */}
      <style dangerouslySetInnerHTML={{ __html: soundWaveStyles }} />

      {/* Very Large Ashoka Chakra Watermark */}
      <div 
        className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-0 select-none"
        style={{ opacity: 0.04 }}
      >
        <img 
          src={ashokaChakra} 
          alt="" 
          className="w-[120vw] md:w-[100vh] max-w-[800px] aspect-square object-contain select-none pointer-events-none" 
        />
      </div>

      {/* Official Government letterhead header */}
      <div className={`border-b text-center py-6 px-4 transition-colors z-10 relative ${
        highContrast 
          ? 'bg-[#1e293b] border-yellow-500/20 text-yellow-300' 
          : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <img src={emblemOfIndia} alt="National Emblem of India" className="h-20 w-auto mb-3 select-none pointer-events-none object-contain" />
          <h2 className="text-xs uppercase tracking-widest font-extrabold opacity-80 text-[#FF9933]">
            {t.goiText}
          </h2>
          <h1 className={`text-2xl md:text-3xl font-extrabold mt-1 tracking-tight ${
            highContrast ? 'text-white' : 'text-[#000080]'
          }`}>
            JanSetu AI
          </h1>
          <p className="text-xs md:text-sm font-semibold text-[#138808] mt-1.5 leading-relaxed">
            {t.devPlatformSub}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        
        {/* Breadcrumb Navigation */}
        <div className="mb-6 flex items-center space-x-2 text-xs font-bold opacity-75">
          <Link to="/" className="hover:underline">{t.breadcrumbHome}</Link>
          <ChevronRight className="h-3 w-3" />
          <span className={highContrast ? 'text-yellow-300' : 'text-[#000080]'}>{t.breadcrumbSubmit}</span>
        </div>

        {/* Wizard Form */}
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* STEP 1: SELECT ISSUE CATEGORY */}
          <div 
            id="error-anchor-category"
            className={`rounded-2xl border p-6 md:p-8 transition shadow-sm ${
              highContrast ? 'bg-[#1e293b] border-yellow-500/20' : 'bg-white border-slate-200'
            }`}
          >
            <h3 className={`text-xs font-black uppercase tracking-wider mb-5 flex items-center space-x-2 ${
              highContrast ? 'text-yellow-300' : 'text-slate-700'
            }`}>
              <span className="h-5 w-5 rounded-full bg-[#000080] text-white flex items-center justify-center text-[10px] font-black mr-1">1</span>
              <span>{t.step1Title}</span>
            </h3>

            {validationErrors.category && (
              <p className="mb-4 text-xs font-bold text-red-500 flex items-center space-x-1">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{validationErrors.category}</span>
              </p>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {categoriesData.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategorySelect(cat.id)}
                    className={`relative p-5 rounded-xl border flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? (highContrast 
                            ? 'border-yellow-400 bg-yellow-500/10 text-yellow-300 ring-2 ring-yellow-400 font-black' 
                            : 'border-[#FF9933] bg-[#FF9933]/5 text-[#000080] ring-2 ring-[#FF9933]/30 scale-102 font-bold')
                        : (highContrast 
                            ? 'border-slate-700 hover:border-yellow-500 text-slate-300' 
                            : 'border-slate-200 hover:border-[#000080]/30 hover:bg-slate-50/40 text-slate-700')
                    }`}
                  >
                    <span className="text-3xl mb-2.5 block filter drop-shadow-sm select-none">{cat.icon}</span>
                    <span className="text-xs block font-bold leading-tight">{t[cat.titleKey]}</span>
                    
                    {isSelected && (
                      <div className="absolute top-2 right-2 h-4 w-4 rounded-full bg-[#138808] text-white flex items-center justify-center shadow">
                        <Check className="h-2.5 w-2.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 2: DYNAMIC SUBCATEGORY SELECTION */}
          {selectedCategory && (
            <div 
              id="error-anchor-subcategory"
              className={`rounded-2xl border p-6 md:p-8 transition shadow-sm ${
                highContrast ? 'bg-[#1e293b] border-yellow-500/20' : 'bg-white border-slate-200'
              }`}
            >
              <h3 className={`text-xs font-black uppercase tracking-wider mb-5 flex items-center space-x-2 ${
                highContrast ? 'text-yellow-300' : 'text-slate-700'
              }`}>
                <span className="h-5 w-5 rounded-full bg-[#000080] text-white flex items-center justify-center text-[10px] font-black mr-1">2</span>
                <span>{t.step2Title}</span>
              </h3>

              {validationErrors.subcategory && (
                <p className="mb-4 text-xs font-bold text-red-500 flex items-center space-x-1">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{validationErrors.subcategory}</span>
                </p>
              )}

              {selectedCategory === 'other' ? (
                // Custom input field for Other category
                <div className="max-w-lg">
                  <label className="block text-xs font-bold opacity-75 mb-2">
                    {t.otherCategoryCustom}
                  </label>
                  <input
                    type="text"
                    value={customCategoryText}
                    onChange={(e) => {
                      setCustomCategoryText(e.target.value);
                      if (validationErrors.subcategory) {
                        setValidationErrors(prev => ({ ...prev, subcategory: null }));
                      }
                    }}
                    placeholder={t.customInputPlaceholder}
                    className={`w-full p-3 rounded-xl border text-sm font-semibold transition ${
                      highContrast 
                        ? 'bg-[#0f172a] border-yellow-500 text-yellow-300 placeholder-yellow-500/50' 
                        : 'bg-slate-50 border-slate-300 text-slate-800 focus:bg-white'
                    }`}
                  />
                </div>
              ) : (
                // Dynamic subcategory list
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(subcategoriesData[selectedCategory] || []).map((sub) => {
                    const isSelected = selectedSubcategory === sub.id;
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => {
                          setSelectedSubcategory(sub.id);
                          if (validationErrors.subcategory) {
                            setValidationErrors(prev => ({ ...prev, subcategory: null }));
                          }
                        }}
                        className={`p-4.5 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? (highContrast
                                ? 'border-yellow-400 bg-yellow-500/10 text-yellow-300 font-extrabold'
                                : 'border-[#FF9933] bg-[#FF9933]/5 text-[#000080] font-bold')
                            : (highContrast
                                ? 'border-slate-700 hover:border-yellow-500 text-slate-300'
                                : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50/50')
                        }`}
                      >
                        <span className="text-xs font-bold leading-snug">{t[sub.labelKey]}</span>
                        {isSelected && (
                          <Check className={`h-4 w-4 shrink-0 ${highContrast ? 'text-yellow-400' : 'text-[#FF9933]'}`} />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* STEP 3: ISSUE SEVERITY */}
          <div 
            className={`rounded-2xl border p-6 md:p-8 transition shadow-sm ${
              highContrast ? 'bg-[#1e293b] border-yellow-500/20' : 'bg-white border-slate-200'
            }`}
          >
            <h3 className={`text-xs font-black uppercase tracking-wider mb-5 flex items-center space-x-2 ${
              highContrast ? 'text-yellow-300' : 'text-slate-700'
            }`}>
              <span className="h-5 w-5 rounded-full bg-[#000080] text-white flex items-center justify-center text-[10px] font-black mr-1">3</span>
              <span>{t.step3Title}</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {severitiesList.map((sev) => {
                const isSelected = severity === sev.id;
                return (
                  <button
                    key={sev.id}
                    type="button"
                    onClick={() => setSeverity(sev.id)}
                    className={`p-4.5 rounded-xl border flex flex-col items-center justify-center text-center transition cursor-pointer ${
                      isSelected
                        ? (highContrast 
                            ? 'border-yellow-400 bg-yellow-500/10 text-yellow-300 font-extrabold ring-2 ring-yellow-400' 
                            : 'border-slate-350 bg-slate-100/50 text-slate-900 ring-2 ring-slate-800 font-extrabold scale-102')
                        : (highContrast 
                            ? 'border-slate-700 text-slate-400' 
                            : 'border-slate-200 text-slate-500 bg-slate-50/50')
                    }`}
                  >
                    <span className="flex items-center space-x-1.5 mb-1 text-xs">
                      <span className={`h-2.5 w-2.5 rounded-full ${sev.color}`} />
                      <span className="font-extrabold">{t[sev.text]}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 4: ESTIMATED IMPACT */}
          <div 
            className={`rounded-2xl border p-6 md:p-8 transition shadow-sm ${
              highContrast ? 'bg-[#1e293b] border-yellow-500/20' : 'bg-white border-slate-200'
            }`}
          >
            <h3 className={`text-xs font-black uppercase tracking-wider mb-2 flex items-center space-x-2 ${
              highContrast ? 'text-yellow-300' : 'text-slate-700'
            }`}>
              <span className="h-5 w-5 rounded-full bg-[#000080] text-white flex items-center justify-center text-[10px] font-black mr-1">4</span>
              <span>{t.step4Title}</span>
            </h3>
            <p className="text-xs opacity-75 mb-5 ml-7">{t.step4Question}</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {impactsList.map((imp) => {
                const isSelected = impact === imp.id;
                const localizedImpact = imp.label;
                return (
                  <button
                    key={imp.id}
                    type="button"
                    onClick={() => setImpact(imp.id)}
                    className={`p-4.5 rounded-xl border text-center transition cursor-pointer ${
                      isSelected
                        ? (highContrast 
                            ? 'border-yellow-400 bg-yellow-500/10 text-yellow-300 font-extrabold ring-2 ring-yellow-400' 
                            : 'border-[#FF9933] bg-[#FF9933]/5 text-[#000080] font-black ring-2 ring-[#FF9933]/30 scale-102')
                        : (highContrast 
                            ? 'border-slate-700 text-slate-300' 
                            : 'border-slate-200 text-slate-600 bg-slate-50/50')
                    }`}
                  >
                    <span className="text-xs font-extrabold">{localizedImpact}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 5: REPORTING METHOD & DETAILS */}
          <div 
            id="error-anchor-reporting"
            className={`rounded-2xl border p-6 md:p-8 transition shadow-sm ${
              highContrast ? 'bg-[#1e293b] border-yellow-500/20' : 'bg-white border-slate-200'
            }`}
          >
            <h3 className={`text-xs font-black uppercase tracking-wider mb-5 flex items-center space-x-2 ${
              highContrast ? 'text-yellow-300' : 'text-slate-700'
            }`}>
              <span className="h-5 w-5 rounded-full bg-[#000080] text-white flex items-center justify-center text-[10px] font-black mr-1">5</span>
              <span>{t.step5Title}</span>
            </h3>

            {/* Redesigned unified input section */}
            <div className="space-y-6">
              
              {/* Optional Citizen Name field */}
              <div className="max-w-lg">
                <label className="block text-xs font-black uppercase tracking-wider mb-2 text-slate-500">
                  {language === 'hi' ? 'आपका नाम (वैकल्पिक)' : language === 'mr' ? 'आपले नाव (पर्यायी)' : 'Your Name (Optional)'}
                </label>
                <input
                  type="text"
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                  placeholder={language === 'hi' ? 'अपना नाम दर्ज करें' : language === 'mr' ? 'आपले नाव प्रविष्ट करा' : 'Enter your name'}
                  className={`w-full p-3.5 rounded-xl border text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                    highContrast
                      ? 'bg-[#0f172a] border-yellow-500/55 text-yellow-300'
                      : 'bg-white border-slate-200 text-slate-800'
                  }`}
                />
              </div>

              {/* Layout: Upload Image Button | Multiline Complaint Textarea | Microphone Button */}
              <div className="flex flex-col lg:flex-row gap-4 items-stretch">
                
                {/* Upload Image Button / Preview */}
                <div className="flex-shrink-0 w-full lg:w-48 flex flex-col justify-center">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".jpg,.jpeg,.png"
                    className="hidden"
                  />
                  
                  {!photoPreviewUrl ? (
                    <div
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current.click()}
                      className={`w-full h-32 lg:h-full border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[128px] ${
                        dragActive
                          ? 'border-[#FF9933] bg-[#FF9933]/5'
                          : (highContrast 
                              ? 'border-yellow-500/50 hover:border-yellow-400 bg-slate-900/10' 
                              : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50/50')
                      }`}
                    >
                      <Upload className="h-8 w-8 text-slate-400 mb-2 opacity-60" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-normal">
                        {t.dragDropText || 'Upload Photo'}
                      </span>
                      <span className="text-[9px] opacity-50 mt-1 uppercase font-bold text-slate-500">
                        {language === 'hi' ? 'केवल छवियां' : language === 'mr' ? 'फक्त प्रतिमा' : 'Images Only'}
                      </span>
                    </div>
                  ) : (
                    <div className={`p-2.5 rounded-xl border relative w-full h-full min-h-[128px] flex flex-col justify-between ${
                      highContrast ? 'bg-[#0f172a] border-yellow-500/30' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div className="relative flex-1 rounded-lg overflow-hidden flex justify-center bg-black/5 min-h-[90px] items-center">
                        <img 
                          src={photoPreviewUrl} 
                          alt="Complaint Preview" 
                          className="max-h-24 object-contain rounded"
                        />
                        <button
                          type="button"
                          onClick={removePhoto}
                          className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/75 hover:bg-black text-white flex items-center justify-center shadow transition cursor-pointer"
                          title={t.removePhotoBtn}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      
                      <div className="mt-2 flex items-center justify-between text-[10px] font-semibold px-1">
                        <span className="truncate max-w-[70%] text-slate-500">
                          {photoFile?.name || 'Image'}
                        </span>
                        <button
                          type="button"
                          onClick={removePhoto}
                          className="text-red-500 hover:underline cursor-pointer"
                        >
                          {t.removePhotoBtn || 'Remove'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Multiline Complaint Textarea */}
                <div className="flex-1 flex flex-col relative min-h-[128px]">
                  <label className="block text-xs font-black uppercase tracking-wider mb-2 text-slate-500">
                    {t.descLabel} <span className="text-red-500">*</span>
                  </label>

                  {validationErrors.description && (
                    <p className="mb-2 text-xs font-bold text-red-500 flex items-center space-x-1">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      <span>{validationErrors.description}</span>
                    </p>
                  )}

                  <div className="relative flex-1">
                    <textarea
                      value={description}
                      onChange={handleDescChange}
                      placeholder={getDescriptionPlaceholder()}
                      rows={5}
                      className={`w-full h-full p-4 rounded-xl border text-sm font-semibold transition resize-none ${
                        highContrast 
                          ? 'bg-[#0f172a] border-yellow-500 text-yellow-300 placeholder-yellow-500/50' 
                          : 'bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20'
                      }`}
                    />
                    <div className="absolute bottom-3 right-3 text-[10px] font-semibold opacity-60 text-slate-500">
                      {maxCharCount - description.length} {t.charRemaining}
                    </div>
                  </div>
                </div>

                {/* Microphone Button with Simulator */}
                <div className="flex-shrink-0 w-full lg:w-48 flex flex-col justify-center">
                  <div className={`w-full h-32 lg:h-full p-4 rounded-xl border flex flex-col items-center justify-center text-center min-h-[128px] ${
                    highContrast 
                      ? 'bg-[#0f172a] border-yellow-500/30' 
                      : 'bg-slate-50 border-slate-200'
                  }`}>
                    {isRecording ? (
                      <div className="flex items-end justify-center space-x-1 h-8 mb-2 select-none">
                        {[...Array(8)].map((_, i) => {
                          const heights = [12, 24, 32, 20, 28, 10, 26, 16];
                          const delays = [0.1, 0.4, 0.2, 0.6, 0.3, 0.5, 0.1, 0.4];
                          return (
                            <div 
                              key={i} 
                              className="w-1 bg-[#FF9933] rounded-full soundwave-bar-animated animate-pulse"
                              style={{
                                height: `${heights[i]}px`,
                                animationDelay: `${delays[i]}s`
                              }}
                            />
                          );
                        })}
                      </div>
                    ) : (
                      <div className="h-8 mb-2 flex items-center justify-center select-none">
                        <Mic className="h-6 w-6 text-slate-400 opacity-60" />
                      </div>
                    )}

                    <span className="text-[9px] font-extrabold tracking-wide uppercase mb-2 text-slate-500 block leading-tight">
                      {isRecording ? t.voiceListening : (language === 'hi' ? 'आवाज़ रिकॉर्ड करें' : language === 'mr' ? 'आवाज रेकॉर्ड करा' : 'Record Voice')}
                    </span>

                    <button
                      type="button"
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`px-4 py-2 rounded-full text-[10px] font-black transition cursor-pointer flex items-center space-x-1 shadow ${
                        isRecording
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : (highContrast 
                              ? 'bg-yellow-400 hover:bg-yellow-500 text-black' 
                              : 'bg-[#000080] hover:bg-blue-900 text-white')
                      }`}
                    >
                      {isRecording ? (
                        <>
                          <MicOff className="h-3.5 w-3.5" />
                          <span>{t.voiceRecordStop}</span>
                        </>
                      ) : (
                        <>
                          <Mic className="h-3.5 w-3.5" />
                          <span>{t.voiceRecordStart}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>

              {/* Always display GPS location detection here */}
              <div id="error-anchor-location" className="mt-6 pt-6 border-t border-slate-100/10">
                <label className="block text-xs font-black uppercase tracking-wider mb-3 text-slate-500">
                  {t.locationTitle} <span className="text-red-500">*</span>
                </label>

                {validationErrors.location && (
                  <p className="mb-4 text-xs font-bold text-red-500 flex items-center space-x-1">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{validationErrors.location}</span>
                  </p>
                )}

                <div className="max-w-xl">
                  <div className={`p-5 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
                    highContrast 
                      ? 'bg-[#0f172a] border-yellow-500/30' 
                      : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex items-center space-x-3 text-left">
                      <div className={`p-2.5 rounded-full ${
                        locationSuccess ? 'bg-[#138808] text-white' : 'bg-slate-200 text-slate-400'
                      }`}>
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-xs font-black block text-slate-700 dark:text-slate-200">
                          {locationSuccess ? t.locationCapturedLabel : 'GPS Location Required'}
                        </span>
                        {locationSuccess && locationCoords ? (
                          <span className="text-[10px] text-slate-400 font-semibold block leading-tight mt-0.5">
                            Lat: {locationCoords.lat.toFixed(5)}, Lng: {locationCoords.lng.toFixed(5)}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-semibold block leading-tight mt-0.5">
                            Location coordinates help determine constituency routing.
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={detectLocation}
                      disabled={isDetectingLocation}
                      className={`w-full sm:w-auto px-6 py-2.5 rounded-lg text-xs font-black transition cursor-pointer flex items-center justify-center space-x-1.5 ${
                        isDetectingLocation 
                          ? 'bg-slate-350 text-slate-500 cursor-not-allowed' 
                          : (highContrast 
                              ? 'bg-yellow-400 hover:bg-yellow-500 text-black shadow' 
                              : 'bg-[#000080] hover:bg-blue-900 text-white shadow')
                      }`}
                    >
                      {isDetectingLocation ? (
                        <>
                          <span className="h-3.5 w-3.5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin mr-1" />
                          <span>Acquiring...</span>
                        </>
                      ) : (
                        <>
                          <MapPin className="h-4 w-4" />
                          <span>{t.step8Button}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {locationSuccess && (
                    <div className="mt-3.5 flex items-center space-x-1.5 px-1 text-xs font-bold text-[#138808] animate-fadeIn">
                      <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
                      <span>{t.locationSuccessAlert}</span>
                    </div>
                  )}

                  {renderAddressFields()}
                </div>
              </div>

            </div>

          </div>

          {/* STEP 6: WHY THIS INFORMATION MATTERS */}
          <div 
            className={`rounded-2xl border p-6 md:p-8 transition shadow-sm relative overflow-hidden ${
              highContrast ? 'bg-[#1e293b] border-yellow-500/20' : 'bg-white border-slate-200'
            }`}
          >
            {/* Tricolor corner ribbon */}
            <div className="absolute top-0 left-0 right-0 h-1 flex">
              <div className="bg-[#FF9933] flex-1"></div>
              <div className="bg-white w-1/12"></div>
              <div className="bg-[#138808] flex-1"></div>
            </div>

            <h3 className={`text-xs font-black uppercase tracking-wider mb-3 flex items-center space-x-2 ${
              highContrast ? 'text-yellow-300' : 'text-slate-700'
            }`}>
              <Info className="h-5 w-5 text-[#000080]" />
              <span>{t.step6Title}</span>
            </h3>
            
            <p className="text-xs leading-relaxed opacity-85 pl-7 text-justify">
              {t.step9Text}
            </p>
          </div>

          {/* STEP 7: REVIEW SUBMISSION */}
          <div 
            className={`rounded-2xl border p-6 md:p-8 transition shadow-sm ${
              highContrast ? 'bg-[#1e293b] border-yellow-500/20' : 'bg-white border-slate-200'
            }`}
          >
            <h3 className={`text-xs font-black uppercase tracking-wider mb-5 flex items-center space-x-2 ${
              highContrast ? 'text-yellow-300' : 'text-slate-700'
            }`}>
              <span className="h-5 w-5 rounded-full bg-[#000080] text-white flex items-center justify-center text-[10px] font-black mr-1">7</span>
              <span>{t.step7Title}</span>
            </h3>

            {/* Structured Summary Review Container */}
            <div className={`p-5 rounded-xl border ${
              highContrast ? 'bg-[#0f172a] border-yellow-500/30' : 'bg-slate-50 border-slate-100'
            }`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                
                {/* Category summary */}
                <div className="py-2 border-b border-slate-100/10 flex justify-between gap-2">
                  <span className="opacity-60 font-semibold uppercase text-[9px] tracking-wide">{t.categoryLabel}</span>
                  <span className="font-extrabold text-right">
                    {selectedCategory ? (t[categoriesData.find(c => c.id === selectedCategory)?.titleKey] || selectedCategory) : '-'}
                  </span>
                </div>

                {/* Subcategory summary */}
                <div className="py-2 border-b border-slate-100/10 flex justify-between gap-2">
                  <span className="opacity-60 font-semibold uppercase text-[9px] tracking-wide">{t.subCategoryLabel}</span>
                  <span className="font-extrabold text-right">
                    {selectedCategory === 'other' 
                      ? (customCategoryText || '-') 
                      : (selectedSubcategory 
                          ? (t[subcategoriesData[selectedCategory]?.find(s => s.id === selectedSubcategory)?.labelKey] || selectedSubcategory) 
                          : '-')}
                  </span>
                </div>

                {/* Severity summary */}
                <div className="py-2 border-b border-slate-100/10 flex justify-between gap-2">
                  <span className="opacity-60 font-semibold uppercase text-[9px] tracking-wide">{t.severityLabel}</span>
                  <span className="font-extrabold flex items-center space-x-1 text-right">
                    <span className={`h-2 w-2 rounded-full ${severitiesList.find(s => s.id === severity)?.color || 'bg-slate-400'}`} />
                    <span>{t[`severity${severity}`] || severity}</span>
                  </span>
                </div>

                {/* Population Affected summary */}
                <div className="py-2 border-b border-slate-100/10 flex justify-between gap-2">
                  <span className="opacity-60 font-semibold uppercase text-[9px] tracking-wide">{t.estimatedImpactLabel}</span>
                  <span className="font-extrabold text-right">
                    {impact ? impact : '-'}
                  </span>
                </div>

                {/* Photo summary */}
                <div className="py-2 border-b border-slate-100/10 flex justify-between gap-2">
                  <span className="opacity-60 font-semibold uppercase text-[9px] tracking-wide">{t.photoAttachmentLabel}</span>
                  <span className={`font-extrabold text-right uppercase text-[10px] ${photoFile ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {photoFile ? t.photoUploadedLabel : t.noImageLabel}
                  </span>
                </div>

                {/* Location summary */}
                <div className="py-2 border-b border-slate-100/10 flex justify-between gap-2">
                  <span className="opacity-60 font-semibold uppercase text-[9px] tracking-wide">{t.gpsCoordinateLabel}</span>
                  <span className={`font-extrabold text-right uppercase text-[10px] ${locationCoords ? t.locationCapturedLabel : t.pendingLabel}`}>
                    {locationCoords ? t.locationCapturedLabel : t.pendingLabel}
                  </span>
                </div>
              </div>

              {/* Description preview */}
              <div className="mt-4 pt-4 border-t border-slate-100/10 text-xs">
                <span className="opacity-60 block font-semibold uppercase text-[9px] tracking-wide mb-1">Issue Description</span>
                <p className="leading-relaxed font-semibold italic opacity-95">
                  {description.trim() ? `"${description}"` : 'Pending...'}
                </p>
              </div>

              {/* Transcript summary */}
              {voiceTranscript && (
                <div className="mt-3 pt-3 border-t border-dashed border-slate-100/10 text-xs">
                  <span className="opacity-60 block font-semibold uppercase text-[9px] tracking-wide mb-1">Audio Transcript (Captured)</span>
                  <p className="leading-relaxed opacity-75">
                    "{voiceTranscript}"
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* SUBMIT BUTTON CONTROL */}
          <div className="flex flex-col items-center pt-4">
            {validationErrors.submit && (
              <div className="w-full sm:w-80 p-4 mb-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                <span>{validationErrors.submit}</span>
              </div>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full sm:w-80 py-4.5 rounded-xl text-base font-black transition cursor-pointer flex items-center justify-center space-x-2.5 shadow-md ${
                isSubmitting 
                  ? 'bg-slate-350 text-slate-500 cursor-not-allowed' 
                  : (highContrast 
                      ? 'bg-yellow-400 hover:bg-yellow-500 text-black' 
                      : 'bg-[#000080] hover:bg-blue-900 text-white hover:shadow-lg hover:scale-[1.01]')
              }`}
            >
              {isSubmitting ? (
                <>
                  <span className="h-4.5 w-4.5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin mr-1.5" />
                  <span>{t.submittingLabel}</span>
                </>
              ) : (
                <>
                  <span>{t.submitIssueBtn}</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>

      {/* SUCCESS MODAL DIALOG */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity duration-300">
          <div 
            className={`w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border p-6 text-center transition-transform duration-300 scale-100 relative ${
              highContrast ? 'bg-[#1e293b] border-yellow-500 text-white' : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            {/* Watermark inside card */}
            <div 
              className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-0 select-none"
              style={{ opacity: 0.04 }}
            >
              <img 
                src={ashokaChakra} 
                alt="" 
                className="w-[80%] aspect-square object-contain select-none pointer-events-none" 
              />
            </div>

            <div className="relative z-10">
              {/* Header inside Success Modal */}
              <div className="flex flex-col items-center mb-5">
                <img src={emblemOfIndia} alt="National Emblem of India" className="h-14 w-auto mb-2 select-none pointer-events-none object-contain" />
                <p className="text-[9px] font-bold uppercase tracking-widest text-[#FF9933]">
                  {t.goiText}
                </p>
                <h1 className="text-sm font-black tracking-tight text-[#000080] dark:text-yellow-300">
                  JanSetu AI
                </h1>
              </div>

              <div className="flex justify-center mb-4 select-none">
                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/20 rounded-full border border-emerald-100 dark:border-emerald-900">
                  <CheckCircle2 className="h-12 w-12 text-[#138808]" />
                </div>
              </div>

              <h3 className="text-xl font-extrabold tracking-tight mb-2">
                {t.successModalTitle}
              </h3>
              <p className="text-xs opacity-75 max-w-xs mx-auto mb-6 leading-relaxed">
                {t.successModalDesc}
              </p>

              <div className={`p-4 rounded-xl border mb-6 text-xs text-left ${
                highContrast ? 'bg-[#0f172a] border-yellow-500/30' : 'bg-slate-50 border-slate-100'
              }`}>
                <div className="flex justify-between py-1.5 border-b border-slate-100/10">
                  <span className="opacity-60 font-semibold">{t.complaintIdLabel}:</span>
                  <span className="font-black tracking-tight">{submittedId}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="opacity-60 font-semibold">{t.statusLabel}:</span>
                  <span className="font-extrabold text-[#000080] dark:text-yellow-300 uppercase text-[10px] tracking-wide">
                    Submitted
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={handleDownloadReceipt}
                  className={`w-full py-3 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center space-x-1.5 ${
                    highContrast 
                      ? 'bg-yellow-400 hover:bg-yellow-500 text-black' 
                      : 'bg-[#FF9933] hover:bg-orange-600 text-white shadow-md'
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  <span>{t.downloadReceipt}</span>
                </button>

                <button
                  onClick={() => {
                    // Navigate to /track and pre-set searchId
                    navigate(`/track`, { state: { searchId: submittedId } });
                  }}
                  className={`w-full py-3 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center space-x-1.5 ${
                    highContrast 
                      ? 'border border-yellow-500 text-yellow-300 hover:bg-yellow-500/10' 
                      : 'bg-[#000080] hover:bg-blue-900 text-white'
                  }`}
                >
                  <span>{t.trackRequest}</span>
                </button>
                
                <button
                  onClick={resetForm}
                  className={`w-full py-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    highContrast 
                      ? 'border-yellow-500 text-yellow-300 hover:bg-yellow-500/10' 
                      : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {t.submitAnotherBtn}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
