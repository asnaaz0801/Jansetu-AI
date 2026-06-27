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
import { db } from '../lib/db';
import emblemOfIndia from '../assets/emblem-of-india.svg';
import ashokaChakra from '../assets/ashoka-chakra.svg';

export default function SubmitIssue({ language, fontSize, highContrast }) {
  const t = translations[language];
  const navigate = useNavigate();

  // Categories configurations with icons & localized labels
  const categoriesData = [
    { id: 'roads', icon: '🛣', title: { en: 'Roads', hi: 'सड़कें', mr: 'रस्ते' } },
    { id: 'water', icon: '💧', title: { en: 'Water Supply', hi: 'जलापूर्ति', mr: 'पाणी पुरवठा' } },
    { id: 'electricity', icon: '⚡', title: { en: 'Electricity', hi: 'बिजली', mr: 'वीज' } },
    { id: 'health', icon: '🏥', title: { en: 'Health', hi: 'स्वास्थ्य', mr: 'आरोग्य' } },
    { id: 'education', icon: '🏫', title: { en: 'Education', hi: 'शिक्षा', mr: 'शिक्षण' } },
    { id: 'employment', icon: '💼', title: { en: 'Employment', hi: 'रोजगार', mr: 'रोजगार' } },
    { id: 'sanitation', icon: '🗑', title: { en: 'Sanitation', hi: 'स्वच्छता', mr: 'स्वच्छता' } },
    { id: 'other', icon: '📌', title: { en: 'Other', hi: 'अन्य', mr: 'इतर' } }
  ];

  // Subcategories configurations
  const subcategoriesData = {
    roads: [
      { id: 'potholes', label: { en: 'Potholes', hi: 'गड्ढे', mr: 'खड्डे' } },
      { id: 'road_damage', label: { en: 'Road Damage', hi: 'सड़क क्षति', mr: 'रस्त्याचे नुकसान' } },
      { id: 'construction', label: { en: 'Road Construction Required', hi: 'सड़क निर्माण की आवश्यकता', mr: 'नवीन रस्ता हवा आहे' } },
      { id: 'traffic', label: { en: 'Traffic Congestion', hi: 'यातायात जाम', mr: 'वाहतूक कोंडी' } },
      { id: 'missing_signs', label: { en: 'Missing Road Signs', hi: 'सड़क संकेत गायब होना', mr: 'वाहतूक चिन्हांचा अभाव' } },
      { id: 'poor_drainage', label: { en: 'Poor Drainage on Roads', hi: 'सड़क पर खराब जल निकासी', mr: 'रस्त्यावर पाणी साचणे' } },
      { id: 'encroachment', label: { en: 'Encroachment on Roads', hi: 'सड़क पर अतिक्रमण', mr: 'रस्त्यावरील अतिक्रमण' } },
      { id: 'other', label: { en: 'Other', hi: 'अन्य', mr: 'इतर' } }
    ],
    water: [
      { id: 'no_water', label: { en: 'No Water Supply', hi: 'पानी की आपूर्ति नहीं', mr: 'पाणी पुरवठा बंद' } },
      { id: 'shortage', label: { en: 'Drinking Water Shortage', hi: 'पीने के पानी की कमी', mr: 'पिण्याच्या पाण्याची टंचाई' } },
      { id: 'leakage', label: { en: 'Water Leakage', hi: 'पानी का रिसाव', mr: 'पाण्याचे गळती' } },
      { id: 'low_pressure', label: { en: 'Low Water Pressure', hi: 'पानी का कम दबाव', mr: 'पाण्याचा कमी दाब' } },
      { id: 'contaminated', label: { en: 'Contaminated Water', hi: 'दूषित पानी', mr: 'दूषित पाणी' } },
      { id: 'broken_pipeline', label: { en: 'Broken Pipeline', hi: 'टूटी हुई पाइपलाइन', mr: 'फुटलेली पाईपलाईन' } },
      { id: 'tank_maintenance', label: { en: 'Water Tank Maintenance', hi: 'पानी की टंकी का रखरखाव', mr: 'पाण्याच्या टाकीची देखभाल' } },
      { id: 'other', label: { en: 'Other', hi: 'अन्य', mr: 'इतर' } }
    ],
    electricity: [
      { id: 'outage', label: { en: 'Power Outage', hi: 'बिजली कटौती', mr: 'वीज खंडित होणे' } },
      { id: 'cuts', label: { en: 'Frequent Power Cuts', hi: 'बार-बार बिजली कटना', mr: 'वारंवार वीज जाणे' } },
      { id: 'street_lights', label: { en: 'Street Light Not Working', hi: 'स्ट्रीट लाइट काम नहीं कर रही', mr: 'पथदिवे बंद असणे' } },
      { id: 'transformer', label: { en: 'Transformer Damage', hi: 'ट्रांसफार्मर की क्षति', mr: 'ट्रान्सफॉर्मर बिघाड' } },
      { id: 'voltage', label: { en: 'Voltage Fluctuation', hi: 'वोल्टेज में उतार-चढ़ाव', mr: 'व्होल्टेज चढउतार' } },
      { id: 'wires', label: { en: 'Exposed Electrical Wires', hi: 'खुले बिजली के तार', mr: 'उघड्या विद्युत तारा' } },
      { id: 'other', label: { en: 'Other', hi: 'अन्य', mr: 'इतर' } }
    ],
    health: [
      { id: 'infrastructure', label: { en: 'Hospital Infrastructure', hi: 'अस्पताल का बुनियादी ढांचा', mr: 'रुग्णालय पायाभूत सुविधा' } },
      { id: 'doctor_shortage', label: { en: 'Doctor Shortage', hi: 'डॉक्टरों की कमी', mr: 'डॉक्टरांची कमतरता' } },
      { id: 'medicine_shortage', label: { en: 'Medicine Shortage', hi: 'दवाओं की कमी', mr: 'औषधांची टंचाई' } },
      { id: 'ambulance', label: { en: 'Ambulance Availability', hi: 'एम्बुलेंस की उपलब्धता', mr: 'रुग्णवाहिका उपलब्धता' } },
      { id: 'health_camp', label: { en: 'Health Camp Request', hi: 'स्वास्थ्य शिविर का अनुरोध', mr: 'आरोग्य शिबिर विनंती' } },
      { id: 'cleanliness', label: { en: 'Cleanliness Issues', hi: 'स्वच्छता के मुद्दे', mr: 'रुग्णालयातील अस्वच्छता' } },
      { id: 'other', label: { en: 'Other', hi: 'अन्य', mr: 'इतर' } }
    ],
    education: [
      { id: 'school_repair', label: { en: 'School Building Repair', hi: 'स्कूल भवन की मरम्मत', mr: 'शाळेच्या इमारतीची दुरुस्ती' } },
      { id: 'teacher_shortage', label: { en: 'Teacher Shortage', hi: 'शिक्षकों की कमी', mr: 'शिक्षकांची कमतरता' } },
      { id: 'classroom_shortage', label: { en: 'Classroom Shortage', hi: 'क्लासरूम की कमी', mr: 'वर्गखोल्यांची कमतरता' } },
      { id: 'toilets', label: { en: 'Toilet Facilities', hi: 'शौचालय की सुविधा', mr: 'स्वच्छतागृह सुविधा' } },
      { id: 'digital_learning', label: { en: 'Digital Learning Facilities', hi: 'डिजिटल लर्निंग सुविधाएं', mr: 'डिजिटल शिक्षण सुविधा' } },
      { id: 'new_school', label: { en: 'New School Request', hi: 'नए स्कूल का अनुरोध', mr: 'नवीन शाळेची विनंती' } },
      { id: 'other', label: { en: 'Other', hi: 'अन्य', mr: 'इतर' } }
    ],
    employment: [
      { id: 'skill_center', label: { en: 'Skill Development Center', hi: 'कौशल विकास केंद्र', mr: 'कौशल्य विकास केंद्र' } },
      { id: 'job_fair', label: { en: 'Job Fair Request', hi: 'रोजगार मेले का अनुरोध', mr: 'रोजगार मेळावा विनंती' } },
      { id: 'opportunities', label: { en: 'Employment Opportunities', hi: 'रोजगार के अवसर', mr: 'रोजगाराच्या संधी' } },
      { id: 'vocational', label: { en: 'Vocational Training', hi: 'व्यावसायिक प्रशिक्षण', mr: 'व्यावसायिक प्रशिक्षण' } },
      { id: 'self_employment', label: { en: 'Self-Employment Support', hi: 'स्वरोजगार सहायता', mr: 'स्वयंरोजगार सहाय्य' } },
      { id: 'other', label: { en: 'Other', hi: 'अन्य', mr: 'इतर' } }
    ],
    sanitation: [
      { id: 'garbage_collection', label: { en: 'Garbage Collection', hi: 'कचरा संग्रहण', mr: 'कचरा गोळा करणे' } },
      { id: 'overflow_dustbins', label: { en: 'Overflowing Dustbins', hi: 'ओवरफ्लो कचरा डिब्बे', mr: 'कचराकुंडी ओसंडून वाहणे' } },
      { id: 'toilet_issues', label: { en: 'Public Toilet Issues', hi: 'सार्वजनिक शौचालय के मुद्दे', mr: 'सार्वजनिक शौचालयाची दुरावस्था' } },
      { id: 'drainage_problems', label: { en: 'Drainage Problems', hi: 'जल निकासी की समस्याएं', mr: 'सांडपाणी समस्या' } },
      { id: 'sewage_leakage', label: { en: 'Sewage Leakage', hi: 'सीवेज रिसाव', mr: 'मैला वाहक गळती' } },
      { id: 'other', label: { en: 'Other', hi: 'अन्य', mr: 'इतर' } }
    ],
    other: [
      { id: 'custom_input', label: { en: 'Custom Input Field', hi: 'कस्टम इनपुट फ़ील्ड', mr: 'कस्टम इनपुट फील्ड' } }
    ]
  };

  // Severities config
  const severitiesList = [
    { id: 'Low', color: 'bg-emerald-500', text: 'severityLow', label: { en: 'Low', hi: 'कम', mr: 'कमी' } },
    { id: 'Medium', color: 'bg-yellow-500', text: 'severityMedium', label: { en: 'Medium', hi: 'मध्यम', mr: 'मध्यम' } },
    { id: 'High', color: 'bg-orange-500', text: 'severityHigh', label: { en: 'High', hi: 'उच्च', mr: 'उच्च' } },
    { id: 'Critical', color: 'bg-red-500', text: 'severityCritical', label: { en: 'Critical', hi: 'गंभीर', mr: 'गंभीर' } }
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

  // Submit and modal states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

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

  // VOICE INPUT SIMULATOR
  const startRecording = () => {
    setIsRecording(true);
    setVoiceTranscript('');
    setVoiceCompleted(false);
    
    // Mock speech-to-text conversion after 4 seconds
    setTimeout(() => {
      setIsRecording(false);
      setVoiceCompleted(true);
      
      let mockText = "";
      if (language === 'en') {
        mockText = "The drainage pipeline is blocked and overflowing onto the street, creating unhealthy conditions for neighbors.";
      } else if (language === 'hi') {
        mockText = "ड्रेनेज पाइपलाइन अवरुद्ध है और सड़क पर बह रही है, जिससे पड़ोसियों के लिए अस्वास्थ्यकर स्थिति पैदा हो रही है।";
      } else {
        mockText = "सांडपाण्याची वाहिनी तुंबली आहे आणि रस्त्यावर वाहत आहे, ज्यामुळे शेजाऱ्यांसाठी अस्वच्छता निर्माण झाली आहे.";
      }
      
      setVoiceTranscript(mockText);
      
      // Auto append or set description
      setDescription(prev => prev ? `${prev} [Transcript: ${mockText}]` : mockText);
    }, 4000);
  };

  const stopRecording = () => {
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
      alert(language === 'en' ? 'Only JPG, JPEG, and PNG images are allowed.' : 'केवल JPG, JPEG और PNG छवियों की अनुमति है।');
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

  // GPS LOCATION DETECTION (Attempt real geolocation first, fallback to mock if denied)
  const detectLocation = () => {
    setIsDetectingLocation(true);
    setLocationSuccess(false);
    
    if (navigator.geolocation) {
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
        },
        (error) => {
          console.warn("Geolocation failed or denied, using constituency fallback coordinates:", error);
          // Fallback to mock coordinates centered on Delhi
          setTimeout(() => {
            setIsDetectingLocation(false);
            const lat = 28.6139 + (Math.random() - 0.5) * 0.01;
            const lng = 77.2090 + (Math.random() - 0.5) * 0.01;
            
            setLocationCoords({ lat, lng });
            setLocationSuccess(true);
            if (validationErrors.location) {
              setValidationErrors(prev => ({ ...prev, location: null }));
            }
          }, 1000);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else {
      // Browser doesn't support Geolocation, use fallback
      setTimeout(() => {
        setIsDetectingLocation(false);
        const lat = 28.6139 + (Math.random() - 0.5) * 0.01;
        const lng = 77.2090 + (Math.random() - 0.5) * 0.01;
        
        setLocationCoords({ lat, lng });
        setLocationSuccess(true);
        if (validationErrors.location) {
          setValidationErrors(prev => ({ ...prev, location: null }));
        }
      }, 1000);
    }
  };

  // FORM VALIDATION & SUBMISSION
  const handleSubmit = async (e) => {
    e.preventDefault();
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
    }
    if (!locationCoords) {
      errors.location = t.detectLocationAlert;
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      
      // Scroll to the first error
      const firstErrorKey = Object.keys(errors)[0];
      const el = document.getElementById(`error-anchor-${firstErrorKey}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate standard GOI request Complaint ID (JSA-2026-XXXX)
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const generatedId = `JSA-2026-${randomNum}`;

      // Get category label translation
      const categoryLabelObj = categoriesData.find(c => c.id === selectedCategory);
      const categoryLabel = categoryLabelObj ? categoryLabelObj.title[language] : selectedCategory;
      
      // Get subcategory label translation
      let subcategoryLabel = '';
      if (selectedCategory === 'other') {
        subcategoryLabel = customCategoryText.trim();
      } else {
        const subList = subcategoriesData[selectedCategory] || [];
        const subObj = subList.find(s => s.id === selectedSubcategory);
        subcategoryLabel = subObj ? subObj.label[language] : selectedSubcategory;
      }

      // Format location label
      const locationLabel = `${categoryLabel} Location (Ward ${Math.floor(Math.random() * 12) + 1})`;

      // Create payload to save into localStorage database
      const payload = {
        id: generatedId,
        title: `${categoryLabel}: ${subcategoryLabel}`,
        description: description,
        category: categoryLabel,
        location: locationLabel,
        submittedBy: language === 'en' ? 'Citizen' : language === 'hi' ? 'नागरिक' : 'नागरिक',
        lat: locationCoords.lat,
        lng: locationCoords.lng,
      };

      // Submit to DB (local storage)
      await db.submitPriority(payload);

      setSubmittedId(generatedId);
      setIsSubmitting(false);
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Submission failed:", err);
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
    setValidationErrors({});
    setShowSuccessModal(false);
    setSelectedMethod('text');
  };

  const handleDownloadReceipt = () => {
    const dateStr = new Date().toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const categoryTitle = selectedCategory === 'other' 
      ? (customCategoryText || 'Other')
      : (categoriesData.find(c => c.id === selectedCategory)?.title[language] || selectedCategory);

    const subcategoryLabel = selectedCategory === 'other'
      ? 'Custom Category'
      : ((subcategoriesData[selectedCategory] || []).find(s => s.id === selectedSubcategory)?.label[language] || selectedSubcategory);

    const printWindow = window.open('', '', 'height=700,width=850');
    printWindow.document.write('<html><head><title>Receipt - JanSetu AI</title>');
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
            Government of India
          </h1>
          <h2 class="text-sm font-extrabold text-[#000080] tracking-tight mt-1">
            JanSetu AI
          </h2>
          <p class="text-[10px] tracking-wide text-slate-500 font-bold uppercase mt-1">
            AI-Powered Constituency Development Platform
          </p>
        </div>

        <div class="py-6 space-y-4 text-xs relative z-10">
          <div class="flex justify-between items-center bg-slate-100 p-2.5 rounded border border-slate-300">
            <span class="font-extrabold uppercase text-[10px] tracking-wide text-slate-600">
              Complaint ID:
            </span>
            <span class="font-black text-sm tracking-tight text-slate-900">
              ${submittedId}
            </span>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <span class="font-bold block text-slate-500 text-[9px] uppercase tracking-wide mb-0.5">
                Submission Date
              </span>
              <span class="font-black text-slate-800">
                ${dateStr}
              </span>
            </div>
            <div>
              <span class="font-bold block text-slate-500 text-[9px] uppercase tracking-wide mb-0.5">
                Category
              </span>
              <span class="font-black text-slate-800">${categoryTitle} (${subcategoryLabel})</span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 border-t pt-3">
            <div>
              <span class="font-bold block text-slate-500 text-[9px] uppercase tracking-wide mb-0.5">
                Location / Coordinates
              </span>
              <span class="font-black text-slate-800">
                ${locationCoords ? `Lat: ${locationCoords.lat.toFixed(4)}, Lng: ${locationCoords.lng.toFixed(4)}` : 'Detected Location'}
              </span>
            </div>
            <div>
              <span class="font-bold block text-slate-500 text-[9px] uppercase tracking-wide mb-0.5">
                Current Status
              </span>
              <span class="font-black text-[#138808] uppercase text-[11px] tracking-wide">
                SUBMITTED
              </span>
            </div>
          </div>

          <div class="border-t pt-3">
            <span class="font-bold block text-slate-500 text-[9px] uppercase tracking-wide mb-1">
              Description
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
                ${severity}
              </span>
            </div>
          </div>
        </div>

        <div class="border-t-2 border-slate-800 pt-6 mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-[9px] relative z-10">
          <div class="max-w-xs text-slate-400">
            <p class="font-bold">Disclaimer:</p>
            <p class="leading-tight mt-0.5">
              This is a digitally generated acknowledgement receipt from the JanSetu AI portal. No physical signature is required. All records are secured using cryptographic hashes on government servers.
            </p>
          </div>
          <div class="text-right self-end sm:self-auto border border-dashed border-slate-400 p-2 rounded bg-slate-50">
            <div class="font-black text-[#000080] uppercase tracking-wider">JanSetu AI Secure</div>
            <div class="text-slate-400 font-mono mt-0.5">REF: ${submittedId.substring(4) || 'XXXX'}</div>
            <div class="text-slate-400">STATUS: VERIFIED</div>
          </div>
        </div>
      </div>
    `);
    
    printWindow.document.write('</body></html>');
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
            {language === 'hi' ? 'एआई-संचालित निर्वाचन क्षेत्र विकास मंच' : language === 'mr' ? 'एआय-संचालित मतदारसंघ विकास मंच' : 'AI-Powered Constituency Development Platform'}
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
                    <span className="text-xs block font-bold leading-tight">{cat.title[language]}</span>
                    
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
                        <span className="text-xs font-bold leading-snug">{sub.label[language]}</span>
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
                const localizedImpact = language === 'en' ? imp.label : language === 'hi' ? (imp.id === '1000+' ? '1000+' : imp.id) : (imp.id === '1000+' ? '१०००+' : imp.id);
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
              <span>STEP 5 : REPORTING METHOD & DETAILS / रिपोर्टिंग विधि और विवरण</span>
            </h3>

            {/* The 4 boxes Selection Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              
              {/* Voice Input Card */}
              <button
                type="button"
                onClick={() => setSelectedMethod('voice')}
                className={`flex flex-col items-start text-left p-5 rounded-xl border-2 transition-all duration-200 group cursor-pointer ${
                  selectedMethod === 'voice'
                    ? (highContrast ? 'border-yellow-400 bg-yellow-400/10' : 'border-[#000080] bg-[#000080]/5')
                    : (highContrast ? 'border-slate-700 hover:border-yellow-500/55' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50')
                }`}
              >
                <div className={`p-3 rounded-lg mb-4 transition-colors ${
                  selectedMethod === 'voice'
                    ? (highContrast ? 'bg-yellow-400 text-black' : 'bg-[#000080] text-white')
                    : (highContrast ? 'bg-slate-800 text-yellow-300' : 'bg-slate-100 text-slate-700')
                }`}>
                  <Mic className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-base md:text-lg mb-1.5 flex items-center gap-1.5">
                  {t.voiceTitle}
                  <span className="text-[10px] bg-[#FF9933] text-white px-1.5 py-0.5 rounded font-black">AI</span>
                </h4>
                <p className="text-xs opacity-80 leading-relaxed">
                  {t.voiceDesc}
                </p>
              </button>

              {/* Text Complaint Card */}
              <button
                type="button"
                onClick={() => setSelectedMethod('text')}
                className={`flex flex-col items-start text-left p-5 rounded-xl border-2 transition-all duration-200 group cursor-pointer ${
                  selectedMethod === 'text'
                    ? (highContrast ? 'border-yellow-400 bg-yellow-400/10' : 'border-[#000080] bg-[#000080]/5')
                    : (highContrast ? 'border-slate-700 hover:border-yellow-500/55' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50')
                }`}
              >
                <div className={`p-3 rounded-lg mb-4 transition-colors ${
                  selectedMethod === 'text'
                    ? (highContrast ? 'bg-yellow-400 text-black' : 'bg-[#000080] text-white')
                    : (highContrast ? 'bg-slate-800 text-yellow-300' : 'bg-slate-100 text-slate-700')
                }`}>
                  <FileText className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-base md:text-lg mb-1.5">
                  {t.textTitle}
                </h4>
                <p className="text-xs opacity-80 leading-relaxed">
                  {t.textDesc}
                </p>
              </button>

              {/* Photo Card */}
              <button
                type="button"
                onClick={() => setSelectedMethod('photo')}
                className={`flex flex-col items-start text-left p-5 rounded-xl border-2 transition-all duration-200 group cursor-pointer ${
                  selectedMethod === 'photo'
                    ? (highContrast ? 'border-yellow-400 bg-yellow-400/10' : 'border-[#000080] bg-[#000080]/5')
                    : (highContrast ? 'border-slate-700 hover:border-yellow-500/55' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50')
                }`}
              >
                <div className={`p-3 rounded-lg mb-4 transition-colors ${
                  selectedMethod === 'photo'
                    ? (highContrast ? 'bg-yellow-400 text-black' : 'bg-[#000080] text-white')
                    : (highContrast ? 'bg-slate-800 text-yellow-300' : 'bg-slate-100 text-slate-700')
                }`}>
                  <Camera className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-base md:text-lg mb-1.5 flex items-center gap-1.5">
                  {t.photoTitle}
                  <span className="text-[10px] bg-[#138808] text-white px-1.5 py-0.5 rounded font-black">LIVE</span>
                </h4>
                <p className="text-xs opacity-80 leading-relaxed">
                  {t.photoDesc}
                </p>
              </button>

              {/* Location Detection Card */}
              <button
                type="button"
                onClick={() => setSelectedMethod('location')}
                className={`flex flex-col items-start text-left p-5 rounded-xl border-2 transition-all duration-200 group cursor-pointer ${
                  selectedMethod === 'location'
                    ? (highContrast ? 'border-yellow-400 bg-yellow-400/10' : 'border-[#000080] bg-[#000080]/5')
                    : (highContrast ? 'border-slate-700 hover:border-yellow-500/55' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50')
                }`}
              >
                <div className={`p-3 rounded-lg mb-4 transition-colors ${
                  selectedMethod === 'location'
                    ? (highContrast ? 'bg-yellow-400 text-black' : 'bg-[#000080] text-white')
                    : (highContrast ? 'bg-slate-800 text-yellow-300' : 'bg-slate-100 text-slate-700')
                }`}>
                  <MapPin className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-base md:text-lg mb-1.5">
                  {t.locationTitle}
                </h4>
                <p className="text-xs opacity-80 leading-relaxed">
                  {t.locationDesc}
                </p>
              </button>

            </div>

            {/* DYNAMIC COMPONENT: VOICE INPUT SIMULATOR */}
            {selectedMethod === 'voice' && (
              <div className="mb-6">
                <p className="text-xs opacity-75 mb-3">{t.step6Subtitle}</p>
                <div className="max-w-xl mx-auto">
                  <div className={`p-5 rounded-xl border flex flex-col items-center text-center ${
                    highContrast 
                      ? 'bg-[#0f172a] border-yellow-500/30' 
                      : 'bg-slate-50 border-slate-100'
                  }`}>
                    {isRecording ? (
                      <div className="flex items-end justify-center space-x-1.5 h-10 mb-4 select-none">
                        {[...Array(12)].map((_, i) => {
                          const heights = [16, 28, 40, 24, 36, 12, 32, 20, 28, 16, 36, 20];
                          const delays = [0.1, 0.4, 0.2, 0.6, 0.3, 0.5, 0.1, 0.4, 0.2, 0.5, 0.3, 0.1];
                          return (
                            <div 
                              key={i} 
                              className="w-1 bg-[#FF9933] rounded-full soundwave-bar-animated"
                              style={{
                                height: `${heights[i]}px`,
                                animationDelay: `${delays[i]}s`
                              }}
                            />
                          );
                        })}
                      </div>
                    ) : (
                      <div className="h-10 mb-4 flex items-center justify-center select-none">
                        <Mic className="h-8 w-8 text-slate-400 opacity-60" />
                      </div>
                    )}

                    <span className="text-[11px] font-extrabold tracking-wide uppercase mb-3 text-slate-500">
                      {isRecording ? t.voiceListening : t.voiceIdle}
                    </span>

                    <button
                      type="button"
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`px-6 py-2.5 rounded-full text-xs font-black transition cursor-pointer flex items-center space-x-1.5 shadow ${
                        isRecording
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : (highContrast 
                              ? 'bg-yellow-400 hover:bg-yellow-500 text-black' 
                              : 'bg-[#000080] hover:bg-blue-900 text-white')
                      }`}
                    >
                      {isRecording ? (
                        <>
                          <MicOff className="h-4 w-4" />
                          <span>{t.voiceRecordStop}</span>
                        </>
                      ) : (
                        <>
                          <Mic className="h-4 w-4" />
                          <span>{t.voiceRecordStart}</span>
                        </>
                      )}
                    </button>

                    {voiceCompleted && voiceTranscript && (
                      <div className={`mt-4 w-full text-left p-3.5 rounded-lg border text-xs leading-relaxed ${
                        highContrast 
                          ? 'bg-[#1e293b] border-yellow-500/30 text-yellow-300' 
                          : 'bg-emerald-50/50 border-emerald-100 text-emerald-800'
                      }`}>
                        <div className="flex items-center space-x-1 mb-1 text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-400">
                          <Sparkles className="h-3.5 w-3.5 shrink-0" />
                          <span>{t.voiceSuccess}</span>
                        </div>
                        "{voiceTranscript}"
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* DYNAMIC COMPONENT: PHOTO SELECTOR SIMULATOR */}
            {selectedMethod === 'photo' && (
              <div className="mb-6">
                <p className="text-[11px] opacity-75 mb-3">{t.step7Helper}</p>
                <div className="max-w-xl mx-auto">
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
                      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition flex flex-col items-center ${
                        dragActive
                          ? 'border-[#FF9933] bg-[#FF9933]/5'
                          : (highContrast 
                              ? 'border-yellow-500/50 hover:border-yellow-400 bg-slate-900/10' 
                              : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50/50')
                      }`}
                    >
                      <Upload className="h-10 w-10 text-slate-400 mb-3 opacity-60" />
                      <span className="text-xs font-bold leading-normal text-slate-700 dark:text-slate-300">
                        {t.dragDropText}
                      </span>
                      <span className="text-[10px] opacity-50 mt-1 uppercase font-bold">
                        Supports: JPG, JPEG, PNG
                      </span>
                    </div>
                  ) : (
                    <div className={`p-4 rounded-xl border relative ${
                      highContrast ? 'bg-[#0f172a] border-yellow-500/30' : 'bg-slate-50 border-slate-100'
                    }`}>
                      <div className="relative max-h-56 rounded-lg overflow-hidden flex justify-center bg-black/5">
                        <img 
                          src={photoPreviewUrl} 
                          alt="Complaint Preview" 
                          className="max-h-56 object-contain"
                        />
                        <button
                          type="button"
                          onClick={removePhoto}
                          className="absolute top-2.5 right-2.5 h-7 w-7 rounded-full bg-black/75 hover:bg-black text-white flex items-center justify-center shadow transition cursor-pointer"
                          title={t.removePhotoBtn}
                        >
                          <X className="h-4.5 w-4.5" />
                        </button>
                      </div>
                      
                      <div className="mt-3 flex items-center justify-between text-xs font-semibold px-1">
                        <span className="truncate max-w-[70%] text-slate-500">
                          {photoFile?.name || 'Uploaded Image'}
                        </span>
                        <button
                          type="button"
                          onClick={removePhoto}
                          className="text-red-500 hover:underline cursor-pointer"
                        >
                          {t.removePhotoBtn}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* DYNAMIC COMPONENT: GPS DETECTOR SIMULATOR (Only shown if selectedMethod is location) */}
            {selectedMethod === 'location' && (
              <div className="mb-6">
                {validationErrors.location && (
                  <p className="mb-4 text-xs font-bold text-red-500 flex items-center space-x-1">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{validationErrors.location}</span>
                  </p>
                )}

                <div className="max-w-xl mx-auto">
                  <div className={`p-5 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
                    highContrast 
                      ? 'bg-[#0f172a] border-yellow-500/30' 
                      : 'bg-slate-50 border-slate-100'
                  }`}>
                    <div className="flex items-center space-x-3 text-left">
                      <div className={`p-2.5 rounded-full ${
                        locationSuccess ? 'bg-[#138808] text-white' : 'bg-slate-200 text-slate-400'
                      }`}>
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-xs font-black block">
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
                </div>
              </div>
            )}

            {/* ALWAYS SHOW DESCRIPTION TEXTAREA */}
            <div id="error-anchor-description" className="mt-6 pt-6 border-t border-slate-100/10">
              <label className="block text-xs font-black uppercase tracking-wider mb-3 text-slate-500">
                {t.descLabel} <span className="text-red-500">*</span>
              </label>

              {validationErrors.description && (
                <p className="mb-4 text-xs font-bold text-red-500 flex items-center space-x-1">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{validationErrors.description}</span>
                </p>
              )}

              <div className="relative">
                <textarea
                  value={description}
                  onChange={handleDescChange}
                  placeholder={getDescriptionPlaceholder()}
                  rows={5}
                  className={`w-full p-4 rounded-xl border text-sm font-semibold transition resize-none ${
                    highContrast 
                      ? 'bg-[#0f172a] border-yellow-500 text-yellow-300 placeholder-yellow-500/50' 
                      : 'bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-400 focus:bg-white'
                  }`}
                />
                <div className="absolute bottom-3 right-3 text-[10px] font-semibold opacity-60">
                  {maxCharCount - description.length} {t.charRemaining}
                </div>
              </div>
            </div>

            {/* GPS LOCATION DETECTION (Only shown if selectedMethod is NOT location, to make sure location is captured) */}
            {selectedMethod !== 'location' && (
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

                <div className="max-w-xl mx-auto">
                  <div className={`p-5 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
                    highContrast 
                      ? 'bg-[#0f172a] border-yellow-500/30' 
                      : 'bg-slate-50 border-slate-100'
                  }`}>
                    <div className="flex items-center space-x-3 text-left">
                      <div className={`p-2.5 rounded-full ${
                        locationSuccess ? 'bg-[#138808] text-white' : 'bg-slate-200 text-slate-400'
                      }`}>
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-xs font-black block">
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
                </div>
              </div>
            )}

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
              <span>STEP 6 : WHY THIS INFORMATION MATTERS / यह जानकारी क्यों महत्वपूर्ण है</span>
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
              <span>STEP 7 : REVIEW SUBMISSION / सबमिशन की समीक्षा करें</span>
            </h3>

            {/* Structured Summary Review Container */}
            <div className={`p-5 rounded-xl border ${
              highContrast ? 'bg-[#0f172a] border-yellow-500/30' : 'bg-slate-50 border-slate-100'
            }`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                
                {/* Category summary */}
                <div className="py-2 border-b border-slate-100/10 flex justify-between gap-2">
                  <span className="opacity-60 font-semibold uppercase text-[9px] tracking-wide">Category</span>
                  <span className="font-extrabold text-right">
                    {selectedCategory ? (categoriesData.find(c => c.id === selectedCategory)?.title[language] || selectedCategory) : '-'}
                  </span>
                </div>

                {/* Subcategory summary */}
                <div className="py-2 border-b border-slate-100/10 flex justify-between gap-2">
                  <span className="opacity-60 font-semibold uppercase text-[9px] tracking-wide">Subcategory</span>
                  <span className="font-extrabold text-right">
                    {selectedCategory === 'other' 
                      ? (customCategoryText || '-') 
                      : (selectedSubcategory 
                          ? (subcategoriesData[selectedCategory]?.find(s => s.id === selectedSubcategory)?.label[language] || selectedSubcategory) 
                          : '-')}
                  </span>
                </div>

                {/* Severity summary */}
                <div className="py-2 border-b border-slate-100/10 flex justify-between gap-2">
                  <span className="opacity-60 font-semibold uppercase text-[9px] tracking-wide">Severity</span>
                  <span className="font-extrabold flex items-center space-x-1 text-right">
                    <span className={`h-2 w-2 rounded-full ${severitiesList.find(s => s.id === severity)?.color || 'bg-slate-400'}`} />
                    <span>{t[`severity${severity}`] || severity}</span>
                  </span>
                </div>

                {/* Population Affected summary */}
                <div className="py-2 border-b border-slate-100/10 flex justify-between gap-2">
                  <span className="opacity-60 font-semibold uppercase text-[9px] tracking-wide">Estimated Impact</span>
                  <span className="font-extrabold text-right">
                    {impact ? (language === 'mr' && impact === '1000+' ? '१०००+' : impact) : '-'}
                  </span>
                </div>

                {/* Photo summary */}
                <div className="py-2 border-b border-slate-100/10 flex justify-between gap-2">
                  <span className="opacity-60 font-semibold uppercase text-[9px] tracking-wide">Photo Attachment</span>
                  <span className={`font-extrabold text-right uppercase text-[10px] ${photoFile ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {photoFile ? t.photoUploadedLabel : 'No Image'}
                  </span>
                </div>

                {/* Location summary */}
                <div className="py-2 border-b border-slate-100/10 flex justify-between gap-2">
                  <span className="opacity-60 font-semibold uppercase text-[9px] tracking-wide">GPS Coordinate</span>
                  <span className={`font-extrabold text-right uppercase text-[10px] ${locationCoords ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {locationCoords ? t.locationCapturedLabel : 'Pending'}
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
          <div className="flex justify-center pt-4">
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
                  <span>{language === 'hi' ? 'कृपया अपनी रसीद डाउनलोड करें' : language === 'mr' ? 'कृपया आपली पावती डाउनलोड करा' : 'Please download your receipt'}</span>
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
                  <span>{t.trackRequestBtn || 'Track Request'}</span>
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
