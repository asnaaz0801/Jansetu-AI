import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Search, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ArrowLeft, 
  Download, 
  MapPin, 
  TrendingUp, 
  Sparkles, 
  Printer, 
  Calendar, 
  User, 
  Tag, 
  ChevronRight, 
  Info, 
  Map, 
  ShieldCheck, 
  UserCheck, 
  Building,
  Volume2,
  FileCheck,
  Compass
} from 'lucide-react';
import { translations } from '../lib/translations';
import { db } from '../lib/db';
import emblemOfIndia from '../assets/emblem-of-india.svg';
import ashokaChakra from '../assets/ashoka-chakra.svg';

export default function TrackRequest({ language, fontSize, highContrast }) {
  const t = translations[language];
  const location = useLocation();
  const [searchId, setSearchId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [searched, setSearched] = useState(false);
  const [currentRequest, setCurrentRequest] = useState(null);
  const [localPriorities, setLocalPriorities] = useState([]);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  
  const receiptRef = useRef();

  const mapInstanceRef = useRef(null);
  const userMarkerRef = useRef(null);
  const [detecting, setDetecting] = useState(false);

  const handleDetectUserLocation = () => {
    const L = window.L;
    if (!L || !mapInstanceRef.current) return;

    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        if (userMarkerRef.current) {
          mapInstanceRef.current.removeLayer(userMarkerRef.current);
        }

        const gpsIcon = L.divIcon({
          html: `
            <div class="relative flex items-center justify-center">
              <span class="absolute inline-flex h-8 w-8 rounded-full bg-blue-500 opacity-40 animate-ping"></span>
              <span class="relative h-4 w-4 rounded-full border-2 border-white bg-blue-600 shadow-md"></span>
            </div>
          `,
          className: 'gps-marker-icon',
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        userMarkerRef.current = L.marker([lat, lng], { icon: gpsIcon })
          .bindPopup('<div class="text-[10px] font-bold text-center">📍 You are here</div>')
          .addTo(mapInstanceRef.current);

        const latToUse = currentRequest.coordinates?.lat || (currentRequest.lat ? currentRequest.lat : 28.6139);
        const lngToUse = currentRequest.coordinates?.lng || (currentRequest.lng ? currentRequest.lng : 77.2090);
        
        const complaintLatLng = L.latLng(latToUse, lngToUse);
        const userLatLng = L.latLng(lat, lng);
        
        const bounds = L.latLngBounds([complaintLatLng, userLatLng]);
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] });
        
        setDetecting(false);
        setTimeout(() => {
          userMarkerRef.current.openPopup();
        }, 800);
      },
      (error) => {
        console.error("GPS detection failed:", error);
        alert("Unable to retrieve location. Please check browser permissions.");
        setDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  useEffect(() => {
    const L = window.L;
    if (!L || !currentRequest) return;
    
    // Find coordinates (support both formats)
    const lat = currentRequest.coordinates?.lat || (typeof currentRequest.lat === 'number' ? currentRequest.lat : 28.6139);
    const lng = currentRequest.coordinates?.lng || (typeof currentRequest.lng === 'number' ? currentRequest.lng : 77.2090);

    // Cleanup existing map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Wait a brief tick to ensure container is in DOM
    const mapTimer = setTimeout(() => {
      const mapEl = document.getElementById('simple-issue-map');
      if (!mapEl) return;

      // Initialize map
      const map = L.map('simple-issue-map', {
        center: [lat, lng],
        zoom: 14,
        zoomControl: false,
        attributionControl: false, // Hide Leaflet & OpenStreetMap attribution links
        scrollWheelZoom: true,
        gestureHandling: true
      });

      // Force recalculation of container size to prevent grey or misaligned tiles
      setTimeout(() => {
        map.invalidateSize();
      }, 150);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Apply CartoDB dark tiles or standard OpenStreetMap tiles based on highContrast/theme
      const tileUrl = highContrast
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

      L.tileLayer(tileUrl).addTo(map);

      // Custom Category colors matching the dashboard
      const colors = {
        'Roads': '#D97706',
        'Garbage': '#16A34A',
        'Water Supply': '#2563EB',
        'Electricity': '#EAB308',
        'Street Lights': '#8B5CF6',
        'Drainage': '#0D9488',
        'Public Safety': '#DC2626',
      };
      const color = colors[currentRequest.category] || '#475569';

      // Custom marker pin
      const issueIcon = L.divIcon({
        html: `
          <div class="relative flex items-center justify-center" style="width: 24px; height: 24px;">
            <span class="absolute inline-flex h-full w-full rounded-full opacity-35 animate-ping" style="background-color: ${color};"></span>
            <div class="relative rounded-full border-2 border-white shadow-lg flex items-center justify-center text-[10px]" 
                 style="background-color: ${color}; width: 14px; height: 14px; color: white;">
            </div>
          </div>
        `,
        className: 'custom-div-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([lat, lng], { icon: issueIcon }).addTo(map);
      
      // Popup details
      const popupContent = `
        <div class="p-1 font-sans text-xs">
          <div class="font-black text-slate-900 border-b pb-1 mb-1">${currentRequest.id}</div>
          <div class="font-bold text-slate-700 mb-0.5">${currentRequest.title}</div>
          <div class="text-[10px] opacity-75">Category: ${currentRequest.category}</div>
          <div class="text-[10px] opacity-75">Status: <span class="font-bold">${currentRequest.status}</span></div>
        </div>
      `;
      marker.bindPopup(popupContent).openPopup();
      
      mapInstanceRef.current = map;
    }, 100);

    return () => {
      clearTimeout(mapTimer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [currentRequest, highContrast]);

  // Core Hardcoded Mock Requests matching requirements
  const MOCK_TRACK_DATA = {
    'JSA-2026-0001': {
      id: 'JSA-2026-0001',
      title: language === 'en' ? 'Repair Main Street Water Pipeline' : language === 'hi' ? 'मुख्य सड़क पानी की पाइपलाइन की मरम्मत' : 'मुख्य रस्त्यावरील पाणी वाहिनी दुरुस्ती',
      description: language === 'en' 
        ? 'Multiple complaints from this locality indicate recurring water supply issues. Based on complaint frequency and affected population, this issue has been assigned High Priority and recommended for constituency planning.'
        : language === 'hi' 
        ? 'इस इलाके से कई शिकायतें बार-बार पानी की आपूर्ति की समस्याओं की ओर इशारा करती हैं। शिकायत की आवृत्ति और प्रभावित आबादी के आधार पर, इस मुद्दे को उच्च प्राथमिकता दी गई है और निर्वाचन क्षेत्र योजना के लिए अनुशंसित किया गया है।'
        : 'या भागातील अनेक तक्रारी वारंवार पाणी पुरवठ्याच्या समस्या दर्शवतात. तक्रारींची संख्या आणि बाधित लोकसंख्येच्या आधारे या समस्येला उच्च प्राधान्य देण्यात आले आहे आणि मतदारसंघ नियोजनासाठी शिफारस करण्यात आली आहे.',
      category: 'Infrastructure',
      location: language === 'en' ? 'Ward 4 (North End)' : language === 'hi' ? 'वॉर्ड 4 (उत्तरी सिरा)' : 'वॉर्ड ४ (उत्तर भाग)',
      district: language === 'en' ? 'New Delhi' : language === 'hi' ? 'नई दिल्ली' : 'नवी दिल्ली',
      state: language === 'en' ? 'Delhi' : language === 'hi' ? 'दिल्ली' : 'दिल्ली',
      submittedBy: 'David K.',
      createdAt: '2026-06-10T09:00:00Z',
      status: 'Under Review',
      currentStage: 4, // Under Review
      priority: 'High',
      confidenceScore: '92%',
      citizensAffected: '45,000+',
      recommendedAction: language === 'en' ? 'Pipeline Upgrade' : language === 'hi' ? 'पाइपलाइन अपग्रेड' : 'पाईपलाईन अपग्रेड',
      aiInsights: {
        sentiment: language === 'en' ? 'Negative / Frustrated' : language === 'hi' ? 'नकारात्मक / असंतुष्ट' : 'नकारात्मक / संतप्त',
        urgency: language === 'en' ? 'High (8.7/10)' : language === 'hi' ? 'उच्च (8.7/10)' : 'उच्च (८.७/१०)',
        summary: language === 'en' 
          ? 'Localized infrastructure failure causing water shortage. Historical logs show 4 duplicate reports within 48 hours.'
          : language === 'hi'
          ? 'स्थानीय बुनियादी ढांचे की विफलता के कारण पानी की कमी। ऐतिहासिक लॉग 48 घंटों के भीतर 4 डुप्लिकेट रिपोर्ट दिखाते हैं।'
          : 'स्थानिक पायाभूत सुविधा बिघाडामुळे पाणी टंचाई. मागील ४८ तासांत ४ वेळा याच समस्येची नोंद झाली आहे.',
        recommendation: language === 'en'
          ? 'Systemic replacement of corrosive galvanized iron pipes with leak-proof HDPE lines.'
          : language === 'hi'
          ? 'लीक-प्रूफ एचडीपीई लाइनों के साथ संक्षारक जस्ती लोहे के पाइपों का प्रणालीगत प्रतिस्थापन।'
          : 'गंजलेल्या गॅल्वनाइज्ड लोखंडी पाईप्स बदलून गळती-प्रतिबंधक HDPE पाईप्स बसवणे.'
      },
      coordinates: { lat: 28.6499, lng: 77.2450 },
      updates: [
        { stage: 1, title: 'complaintSubmittedUpdate', date: '2026-06-10', time: '09:00 AM' },
        { stage: 2, title: 'aiAnalysisCompletedUpdate', date: '2026-06-10', time: '09:05 AM' },
        { stage: 3, title: 'priorityScoreGeneratedUpdate', date: '2026-06-10', time: '10:12 AM' },
        { stage: 4, title: 'reviewedByPlanningUpdate', date: '2026-06-11', time: '11:30 AM' },
      ]
    },
    'JSA-2026-0002': {
      id: 'JSA-2026-0002',
      title: language === 'en' ? 'Install Solar Street Lights in Community Park' : language === 'hi' ? 'कम्युनिटी पार्क में सोलर स्ट्रीट लाइट लगाएं' : 'कम्युनिटी पार्कमध्ये सोलर पथदिवे बसवणे',
      description: language === 'en'
        ? 'The park is completely dark after sunset, raising security concerns for women and children who use the walking path.'
        : language === 'hi'
        ? 'सूर्यास्त के बाद पार्क में पूरी तरह से अंधेरा छा जाता है, जिससे टहलने वाले रास्ते का उपयोग करने वाली महिलाओं और बच्चों के लिए सुरक्षा संबंधी चिंताएं बढ़ जाती हैं।'
        : 'सूर्यास्तानंतर उद्यानात पूर्णपणे अंधार असतो, ज्यामुळे चालण्याच्या मार्गाचा वापर करणाऱ्या महिला आणि मुलांच्या सुरक्षिततेबद्दल चिंता निर्माण होते.',
      category: 'Public Safety',
      location: language === 'en' ? 'Ward 7 (Green Valley)' : language === 'hi' ? 'वॉर्ड 7 (ग्रीन वैली)' : 'वॉर्ड ७ (ग्रीन व्हॅली)',
      district: language === 'en' ? 'Central Delhi' : language === 'hi' ? 'मध्य दिल्ली' : 'मध्य दिल्ली',
      state: language === 'en' ? 'Delhi' : language === 'hi' ? 'दिल्ली' : 'दिल्ली',
      submittedBy: 'Sarah M.',
      createdAt: '2026-06-05T14:15:00Z',
      status: 'Action Initiated',
      currentStage: 7, // Action Initiated
      priority: 'Medium',
      confidenceScore: '88%',
      citizensAffected: '12,000+',
      recommendedAction: language === 'en' ? 'Solar Illumination Grid' : language === 'hi' ? 'सौर प्रकाश ग्रिड' : 'सौर प्रकाश ग्रिड',
      aiInsights: {
        sentiment: language === 'en' ? 'Apprehensive' : language === 'hi' ? 'आशंकित' : 'काळजीयुक्त',
        urgency: language === 'en' ? 'Medium (6.5/10)' : language === 'hi' ? 'मध्यम (6.5/10)' : 'मध्यम (६.५/१०)',
        summary: language === 'en'
          ? 'Lack of lighting creates safety hazards. Recommended for green energy integration.'
          : language === 'hi'
          ? 'रोशनी की कमी से सुरक्षा को खतरा। हरित ऊर्जा एकीकरण के लिए अनुशंसित।'
          : 'प्रकाशव्यवस्थेच्या अभावामुळे सुरक्षेचा धोका. हरित ऊर्जा प्रकल्पासाठी शिफारस केली आहे.',
        recommendation: language === 'en'
          ? 'Install 15 Standalone Solar PV Pole Lamps along the park jogging perimeter.'
          : language === 'hi'
          ? 'पार्क जॉगिंग परिधि के साथ 15 स्टैंडअलोन सोलर पीवी पोल लैंप स्थापित करें।'
          : 'उद्यानाच्या धावपट्टीभोवती १५ स्वयंचलित सौर पथदिवे खांब बसवा.'
      },
      coordinates: { lat: 28.6859, lng: 77.2990 },
      updates: [
        { stage: 1, title: 'complaintSubmittedUpdate', date: '2026-06-05', time: '02:15 PM' },
        { stage: 2, title: 'aiAnalysisCompletedUpdate', date: '2026-06-05', time: '02:30 PM' },
        { stage: 3, title: 'priorityScoreGeneratedUpdate', date: '2026-06-06', time: '11:00 AM' },
        { stage: 4, title: 'reviewedByPlanningUpdate', date: '2026-06-08', time: '04:00 PM' },
        { stage: 5, title: 'Development Planning', date: '2026-06-10', time: '02:00 PM' },
        { stage: 6, title: 'recommendedToMpUpdate', date: '2026-06-12', time: '10:30 AM' },
        { stage: 7, title: 'actionInitiatedUpdate', date: '2026-06-15', time: '09:00 AM' }
      ]
    },
    'JSA-2026-0003': {
      id: 'JSA-2026-0003',
      title: language === 'en' ? 'Renovate Community Primary School Roof' : language === 'hi' ? 'सामुदायिक प्राथमिक विद्यालय की छत का नवीनीकरण' : 'प्राथमिक शाळेच्या छताची दुरुस्ती',
      description: language === 'en'
        ? 'The classroom roofs are leaking during rains, forcing school closures. Urgent tiling and waterproofing are required.'
        : language === 'hi'
        ? 'बारिश के दौरान क्लासरूम की छतें टपक रही हैं, जिससे स्कूल बंद करने के लिए मजबूर होना पड़ रहा है। तत्काल टाइलिंग और वॉटरप्रूफिंग की आवश्यकता है।'
        : 'पावसाळ्यात वर्गाची छते गळतात, ज्यामुळे शाळा बंद ठेवावी लागते. तातडीने वॉटरप्रूफिंग आणि दुरुस्तीची गरज आहे.',
      category: 'Education',
      location: language === 'en' ? 'Ward 2 (Downtown)' : language === 'hi' ? 'वॉर्ड 2 (डाउनटाउन)' : 'वॉर्ड २ (मध्यवर्ती भाग)',
      district: language === 'en' ? 'New Delhi' : language === 'hi' ? 'नई दिल्ली' : 'नवी दिल्ली',
      state: language === 'en' ? 'Delhi' : language === 'hi' ? 'दिल्ली' : 'दिल्ली',
      submittedBy: 'Robert T.',
      createdAt: '2026-06-21T09:00:00Z',
      status: 'Submitted',
      currentStage: 1, // Submitted
      priority: 'Critical',
      confidenceScore: '95%',
      citizensAffected: '400+ Students',
      recommendedAction: language === 'en' ? 'Roof Reconstruction' : language === 'hi' ? 'छत का पुनर्निर्माण' : 'छताची पुनर्रचना',
      aiInsights: {
        sentiment: language === 'en' ? 'Distressed' : language === 'hi' ? 'व्यथित' : 'काळजीग्रस्त',
        urgency: language === 'en' ? 'Critical (9.4/10)' : language === 'hi' ? 'गंभीर (9.4/10)' : 'अतिशय तातडीचे (९.४/१०)',
        summary: language === 'en'
          ? 'Water logging inside school premises. Immediate action required before monsoon peaks.'
          : language === 'hi'
          ? 'स्कूल परिसर के अंदर जलभराव। मानसून के चरम पर पहुंचने से पहले तत्काल कार्रवाई आवश्यक।'
          : 'शाळेच्या आवारात पाणी साचणे. पावसाळा सुरू होण्यापूर्वी त्वरित कारवाई आवश्यक.',
        recommendation: language === 'en'
          ? 'Deploy emergency waterproof coating tarpaulins and clear budgetary allocation for cement re-casting.'
          : language === 'hi'
          ? 'आपातकालीन वॉटरप्रूफ कोटिंग तिरपाल तैनात करें और सीमेंट री-कास्टिंग के लिए बजटीय आवंटन स्वीकृत करें।'
          : 'तात्पुरती वॉटरप्रूफ ताडपत्री बसवा आणि सिमेंटच्या छताच्या नवीन स्लॅबसाठी निधी मंजूर करा.'
      },
      coordinates: { lat: 28.6259, lng: 77.2150 },
      updates: [
        { stage: 1, title: 'complaintSubmittedUpdate', date: '2026-06-21', time: '09:00 AM' }
      ]
    },
    'JSA-2026-0004': {
      id: 'JSA-2026-0004',
      title: language === 'en' ? 'Set up Public Health Clinic Waste Disposer' : language === 'hi' ? 'सार्वजनिक स्वास्थ्य क्लिनिक अपशिष्ट डिस्पोजर स्थापित करें' : 'आरोग्य केंद्रासाठी कचरा विल्हेवाट यंत्रणा',
      description: language === 'en'
        ? 'Medical waste is being piled behind the local clinic. Proper disposal incinerator/bin installation is needed urgently.'
        : language === 'hi'
        ? 'स्थानीय क्लिनिक के पीछे चिकित्सा कचरे का ढेर लगा हुआ है। उचित निपटान भस्मक/बिन स्थापना की तत्काल आवश्यकता है।'
        : 'स्थानिक क्लिनिकच्या मागे वैद्यकीय कचऱ्याचा ढीग साचला आहे. योग्य विल्हेवाट लावण्यासाठी इन्सिनरेटर बसवणे गरजेचे आहे.',
      category: 'Healthcare',
      location: language === 'en' ? 'Ward 9 (Eastside)' : language === 'hi' ? 'वॉर्ड 9 (ईस्टसाइड)' : 'वॉर्ड ९ (पूर्व भाग)',
      district: language === 'en' ? 'East Delhi' : language === 'hi' ? 'पूर्वी दिल्ली' : 'पूर्व दिल्ली',
      state: language === 'en' ? 'Delhi' : language === 'hi' ? 'दिल्ली' : 'दिल्ली',
      submittedBy: 'Dr. Aisha N.',
      createdAt: '2026-06-22T08:30:00Z',
      status: 'AI Analysis',
      currentStage: 2, // AI Analysis
      priority: 'Low',
      confidenceScore: '85%',
      citizensAffected: '3,500',
      recommendedAction: language === 'en' ? 'Incinerator Assembly' : language === 'hi' ? 'भस्मक असेंबली' : 'इन्सिनरेटर असेंब्ली',
      aiInsights: {
        sentiment: language === 'en' ? 'Concerned / Professional' : language === 'hi' ? 'चिंतित / पेशेवर' : 'काळजीयुक्त / व्यावसायिक',
        urgency: language === 'en' ? 'Low-Medium (4.2/10)' : language === 'hi' ? 'कम-मध्यम (4.2/10)' : 'कमी-मध्यम (४.२/१०)',
        summary: language === 'en'
          ? 'Hazardous medical waste piling up. Requires biosafety inspection before municipal clearance.'
          : language === 'hi'
          ? 'खतरनाक चिकित्सा अपशिष्ट का जमा होना। नगर निगम की मंजूरी से पहले जैव सुरक्षा निरीक्षण की आवश्यकता है।'
          : 'धोकादायक वैद्यकीय कचरा साचत आहे. पालिका मंजुरीपूर्वी जैवसुरक्षा तपासणी आवश्यक आहे.',
        recommendation: language === 'en'
          ? 'Allocate dual-chamber medical waste bins and coordinate with Delhi Pollution Control Committee.'
          : language === 'hi'
          ? 'दोहरे कक्ष वाले चिकित्सा अपशिष्ट डिब्बे आवंटित करें और दिल्ली प्रदूषण नियंत्रण समिति के साथ समन्वय करें।'
          : 'दोन भागांचे वैद्यकीय कचरा कुंडी उपलब्ध करा आणि प्रदूषण नियंत्रण मंडळाशी समन्वय साधा.'
      },
      coordinates: { lat: 28.7139, lng: 77.3090 },
      updates: [
        { stage: 1, title: 'complaintSubmittedUpdate', date: '2026-06-22', time: '08:30 AM' },
        { stage: 2, title: 'aiAnalysisCompletedUpdate', date: '2026-06-22', time: '08:35 AM' }
      ]
    }
  };

  const runSearchWithData = (cleanId, dataList) => {
    if (!cleanId) return;

    // Try finding in Hardcoded Mock Data
    let matched = MOCK_TRACK_DATA[cleanId];

    // If not found, try finding in Local Storage Priorities (id starts with p-)
    if (!matched) {
      const localMatched = dataList.find(p => p.id === cleanId || p.id.toLowerCase() === cleanId.toLowerCase());
      
      if (localMatched) {
        // Map local storage status to stage number
        let currentStage = 1;
        let statusText = 'Submitted';
        if (localMatched.status === 'In Progress') {
          currentStage = 4;
          statusText = 'Under Review';
        } else if (localMatched.status === 'Resolved') {
          currentStage = 7;
          statusText = 'Action Initiated';
        } else if (localMatched.status === 'Pending') {
          // Semi-randomize stages 1-3 for pending requests based on creation date
          const timeDiff = Date.now() - new Date(localMatched.createdAt).getTime();
          if (timeDiff > 10 * 60 * 1000) { // older than 10 mins
            currentStage = 3;
            statusText = 'Priority Assessment';
          } else if (timeDiff > 2 * 60 * 1000) { // older than 2 mins
            currentStage = 2;
            statusText = 'AI Analysis';
          } else {
            currentStage = 1;
            statusText = 'Submitted';
          }
        }

        // Generate mock AI data for custom submitted requests
        const dateStr = new Date(localMatched.createdAt).toLocaleDateString(
          language === 'en' ? 'en-US' : language === 'hi' ? 'hi-IN' : 'mr-IN',
          { year: 'numeric', month: 'short', day: 'numeric' }
        );

        // Map updates
        const updates = [
          { stage: 1, title: 'complaintSubmittedUpdate', date: dateStr, time: '10:00 AM' }
        ];
        if (currentStage >= 2) {
          updates.push({ stage: 2, title: 'aiAnalysisCompletedUpdate', date: dateStr, time: '10:05 AM' });
        }
        if (currentStage >= 3) {
          updates.push({ stage: 3, title: 'priorityScoreGeneratedUpdate', date: dateStr, time: '10:15 AM' });
        }
        if (currentStage >= 4) {
          updates.push({ stage: 4, title: 'reviewedByPlanningUpdate', date: dateStr, time: '02:30 PM' });
        }
        if (currentStage >= 7) {
          updates.push({ stage: 5, title: 'stageDevPlanning', date: dateStr, time: '11:00 AM' });
          updates.push({ stage: 6, title: 'stageRecToMp', date: dateStr, time: '01:15 PM' });
          updates.push({ stage: 7, title: 'actionInitiatedUpdate', date: dateStr, time: '04:00 PM' });
        }

        matched = {
          id: localMatched.id,
          title: localMatched.title,
          description: localMatched.description,
          category: localMatched.category,
          location: localMatched.location,
          district: language === 'en' ? 'Local District' : language === 'hi' ? 'स्थानीय जिला' : 'स्थानिक जिल्हा',
          state: language === 'en' ? 'State Territory' : language === 'hi' ? 'राज्य क्षेत्र' : 'राज्य क्षेत्र',
          submittedBy: localMatched.submittedBy || 'Anonymous',
          createdAt: localMatched.createdAt,
          status: statusText,
          currentStage,
          priority: localMatched.category === 'Education' || localMatched.category === 'Healthcare' ? 'High' : 'Medium',
          confidenceScore: '94%',
          citizensAffected: localMatched.votes * 180 + '+',
          recommendedAction: language === 'en' ? 'Facility Modernization' : language === 'hi' ? 'सुविधा आधुनिकीकरण' : 'सुविधा आधुनिकीकरण',
          aiInsights: {
            sentiment: language === 'en' ? 'Concerned' : language === 'hi' ? 'चिंतित' : 'काळजीयुक्त',
            urgency: language === 'en' ? 'Medium-High' : language === 'hi' ? 'मध्यम-उच्च' : 'मध्यम-उच्च',
            summary: language === 'en' 
              ? 'Local citizen priority flagged for constituency assessment. AI validates category as high social impact.'
              : language === 'hi'
              ? 'निर्वाचन क्षेत्र के मूल्यांकन के लिए स्थानीय नागरिक प्राथमिकता को चिह्नित किया गया। एआई ने उच्च सामाजिक प्रभाव के रूप में श्रेणी को मान्य किया।'
              : 'मतदारसंघ मूल्यांकनासाठी स्थानिक नागरिकांच्या समस्येची नोंद. एआयने या समस्येचे वर्गीकरण उच्च सामाजिक परिणाम म्हणून केले आहे.',
            recommendation: language === 'en'
              ? 'Inspect structural requirements and prepare local budget estimate for municipal dispatch.'
              : language === 'hi'
              ? 'संरचनात्मक आवश्यकताओं का निरीक्षण करें और नगर निगम प्रेषण के लिए स्थानीय बजट अनुमान तैयार करें।'
              : 'रचनात्मक गरजांची पाहणी करा आणि पालिका मंजुरीसाठी अंदाजपत्रक तयार करा.'
          },
          coordinates: { lat: localMatched.lat || 28.6139, lng: localMatched.lng || 77.2090 },
          updates
        };
      }
    }

    if (matched) {
      setCurrentRequest(matched);
      setErrorMsg('');
      setSearched(true);
    } else {
      setCurrentRequest(null);
      setErrorMsg(t.noRequestFound);
      setSearched(true);
    }
  };

  // Fetch local storage priorities when page mounts
  useEffect(() => {
    const loadLocalData = async () => {
      try {
        const data = await db.getPriorities();
        if (data) {
          setLocalPriorities(data);
          
          // Check if there is an incoming searchId from routing state
          if (location.state && location.state.searchId) {
            setSearchId(location.state.searchId);
            runSearchWithData(location.state.searchId, data);
          }
        }
      } catch (err) {
        console.error('Error fetching local priorities:', err);
      }
    };
    loadLocalData();
  }, [location.state]);

  const handleSearch = (e) => {
    e.preventDefault();
    const cleanId = searchId.trim();

    if (!cleanId) {
      setErrorMsg(t.emptyIdError);
      setSearched(false);
      setCurrentRequest(null);
      return;
    }

    runSearchWithData(cleanId, localPriorities);
  };

  const getStageStatus = (stageNum) => {
    if (!currentRequest) return 'pending';
    if (stageNum < currentRequest.currentStage) return 'completed';
    if (stageNum === currentRequest.currentStage) return 'current';
    return 'pending';
  };

  const getStageTitle = (stageKey) => {
    const stageMap = {
      1: t.stageSubmitted,
      2: t.stageAiAnalysis,
      3: t.stagePriorityAssessment,
      4: t.stageUnderReview,
      5: t.stageDevPlanning,
      6: t.stageRecToMp,
      7: t.stageActionInitiated
    };
    return stageMap[stageKey] || stageKey;
  };

  const getPriorityBadgeStyle = (priority) => {
    if (highContrast) {
      return 'bg-yellow-400 text-black border border-yellow-400 font-extrabold';
    }
    switch (priority?.toLowerCase()) {
      case 'critical':
        return 'bg-red-50 text-red-700 border border-red-200 font-bold';
      case 'high':
        return 'bg-orange-50 text-orange-700 border border-orange-200 font-bold';
      case 'medium':
        return 'bg-blue-50 text-blue-700 border border-blue-200 font-bold';
      default:
        return 'bg-slate-50 text-slate-700 border border-slate-200 font-bold';
    }
  };

  const handlePrint = () => {
    const printContent = receiptRef.current.innerHTML;
    const printWindow = window.open('', '', 'height=700,width=850');
    printWindow.document.write('<html><head><title>Receipt - JanSetu AI</title>');
    printWindow.document.write('<script src="https://cdn.tailwindcss.com"></script>');
    printWindow.document.write('<style>body { font-family: sans-serif; }</style>');
    printWindow.document.write('</head><body class="p-8 bg-white text-slate-800">');
    printWindow.document.write(printContent);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }, 800);
  };

  const stagesList = [1, 2, 3, 4, 5, 6, 7];

  return (
    <div className={`flex-1 transition-colors duration-200 relative overflow-hidden ${
      highContrast ? 'bg-[#0f172a] text-white' : 'bg-slate-50 text-slate-800'
    }`}>
      {/* Subtle Ashoka Chakra Watermark */}
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

      {/* Official Government Top Panel */}
      <div className={`border-b text-center py-6 px-4 transition-colors z-10 relative ${
        highContrast 
          ? 'bg-[#1e293b] border-yellow-500/20 text-yellow-300' 
          : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <img src={emblemOfIndia} alt="National Emblem of India" className="h-20 w-auto mb-2 select-none pointer-events-none object-contain" />
          <h2 className="text-xs uppercase tracking-widest font-extrabold opacity-80 text-[#FF9933]">
            {t.goiText}
          </h2>
          <h1 className={`text-2xl md:text-3xl font-extrabold mt-1 tracking-tight ${
            highContrast ? 'text-white' : 'text-[#000080]'
          }`}>
            JanSetu AI
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        
        {/* Breadcrumb & Navigation Back link */}
        <div className="mb-6 flex items-center justify-between">
          <Link 
            to="/" 
            className={`flex items-center space-x-2 text-xs font-bold transition-all ${
              highContrast 
                ? 'text-yellow-300 hover:text-yellow-400' 
                : 'text-slate-600 hover:text-[#000080]'
            }`}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{t.backBtn}</span>
          </Link>
          {searched && currentRequest && (
            <button 
              onClick={() => setShowReceiptModal(true)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                highContrast 
                  ? 'border-yellow-500 text-yellow-300 hover:bg-yellow-500/10' 
                  : 'border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <FileCheck className="h-4 w-4 text-[#138808]" />
              <span>{t.previewReceiptBtn}</span>
            </button>
          )}
        </div>

        {/* Large Search Section */}
        <div className={`rounded-2xl border p-6 md:p-8 mb-8 transition shadow-sm ${
          highContrast 
            ? 'bg-[#1e293b] border-yellow-500/20' 
            : 'bg-white border-slate-200'
        }`}>
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
            <label className={`block text-sm font-extrabold uppercase tracking-wide mb-3 ${
              highContrast ? 'text-yellow-300' : 'text-slate-700'
            }`}>
              {t.complaintIdLabel}
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 ${
                  highContrast ? 'text-yellow-400' : 'text-slate-400'
                }`} />
                <input 
                  type="text" 
                  value={searchId}
                  onChange={(e) => {
                    setSearchId(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder={t.complaintIdPlaceholder}
                  className={`w-full pl-12 pr-4 py-3.5 rounded-xl border text-sm font-semibold transition ${
                    highContrast 
                      ? 'bg-[#0f172a] border-yellow-500 text-yellow-300 placeholder-yellow-500/50' 
                      : 'bg-slate-50 border-slate-300 text-slate-800 placeholder-slate-400 focus:bg-white focus:shadow-inner'
                  }`}
                />
              </div>
              <button 
                type="submit"
                className={`px-8 py-3.5 rounded-xl text-sm font-black transition cursor-pointer flex items-center justify-center space-x-2 ${
                  highContrast 
                    ? 'bg-yellow-400 hover:bg-yellow-505 text-black shadow-sm font-black' 
                    : 'bg-[#000080] hover:bg-blue-900 text-white font-bold hover:shadow-lg hover:scale-[1.01]'
                }`}
              >
                <span>{t.trackStatusBtn}</span>
              </button>
            </div>
            {errorMsg && (
              <p className="mt-2 text-xs font-bold text-red-500 flex items-center space-x-1">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </p>
            )}
            
            {/* Quick Demo Suggestions */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-[10px] uppercase font-bold opacity-60">Try Examples:</span>
              {['JSA-2026-0001', 'JSA-2026-0002', 'JSA-2026-0003', 'JSA-2026-0004'].map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setSearchId(id);
                    setErrorMsg('');
                    setTimeout(() => {
                      const cleanId = id;
                      let matched = MOCK_TRACK_DATA[cleanId];
                      if (matched) {
                        setCurrentRequest(matched);
                        setSearched(true);
                      }
                    }, 50);
                  }}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-md border transition cursor-pointer ${
                    highContrast 
                      ? 'border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/10' 
                      : 'border-slate-200 bg-slate-100/60 text-[#000080] hover:bg-slate-200'
                  }`}
                >
                  {id}
                </button>
              ))}
            </div>
          </form>
        </div>

        {/* Dashboard Display Area */}
        <div className="transition-all duration-300">
          {!searched ? (
            <div 
              className="text-center py-16 transition-opacity duration-300"
            >
              <div className="max-w-md mx-auto flex flex-col items-center">
                <div className={`p-5 rounded-full mb-4 ${highContrast ? 'bg-yellow-500/10 text-yellow-300' : 'bg-blue-55 text-[#000080]'}`}>
                  <FileText className="h-12 w-12" />
                </div>
                <h3 className="text-lg font-bold">Search for a Request ID</h3>
                <p className="text-xs opacity-60 mt-1 max-w-xs mx-auto">
                  Enter the complaint ID provided upon your request submission to view its real-time progress, AI categorization, and constituency roadmap.
                </p>
              </div>
            </div>
          ) : searched && !currentRequest ? (
            <div 
              className={`rounded-2xl border p-12 text-center transition duration-300 ${
                highContrast 
                  ? 'bg-[#1e293b] border-yellow-500/20' 
                  : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="max-w-md mx-auto flex flex-col items-center">
                <div className={`p-4 rounded-full mb-4 ${highContrast ? 'bg-red-500/20 text-red-400' : 'bg-red-55 text-red-500'}`}>
                  <AlertCircle className="h-14 w-14" />
                </div>
                <h3 className="text-xl font-extrabold tracking-tight mb-2">
                  {language === 'en' ? 'No Request Found' : language === 'hi' ? 'कोई अनुरोध नहीं मिला' : 'तक्रार आढळली नाही'}
                </h3>
                <p className="text-xs opacity-75 leading-relaxed max-w-sm mb-6">
                  {t.noRequestFound}
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button 
                    onClick={() => setSearchId('')}
                    className={`px-5 py-2.5 rounded-lg text-xs font-bold border transition ${
                      highContrast 
                        ? 'border-yellow-500 text-yellow-300 hover:bg-yellow-500/10' 
                        : 'border-slate-300 text-slate-700 hover:bg-slate-55'
                    }`}
                  >
                    Clear Input
                  </button>
                  <Link 
                    to="/"
                    className={`px-5 py-2.5 rounded-lg text-xs font-black text-center transition ${
                      highContrast 
                        ? 'bg-yellow-400 text-black hover:bg-yellow-500' 
                        : 'bg-[#000080] hover:bg-blue-900 text-white'
                    }`}
                  >
                    Register New Complaint
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div 
              className="space-y-8 transition-opacity duration-300"
            >
              
              {/* VISUAL PROGRESS TRACKER */}
              <div className={`rounded-2xl border p-6 md:p-8 transition shadow-sm ${
                highContrast 
                  ? 'bg-[#1e293b] border-yellow-500/20' 
                  : 'bg-white border-slate-200'
              }`}>
                <h3 className={`text-base font-extrabold uppercase tracking-wider mb-6 flex items-center space-x-2 ${
                  highContrast ? 'text-yellow-300' : 'text-slate-800'
                }`}>
                  <TrendingUp className="h-5 w-5 text-[#FF9933]" />
                  <span>{language === 'en' ? 'Roadmap Timeline' : language === 'hi' ? 'रोडमैप समयरेखा' : 'रोडमॅप टाइमलाईन'}</span>
                </h3>

                {/* Horizontal Timeline (Desktop & Medium Screens) */}
                <div className="hidden lg:block w-full py-8">
                  <div className="relative flex items-center justify-between">
                    
                    {/* Background Progress Connector Line */}
                    <div className="absolute left-[7%] right-[7%] top-1/2 -translate-y-1/2 h-1 bg-slate-200 z-0">
                      <div 
                        className="h-full bg-[#138808] transition-all duration-500" 
                        style={{ width: `${((currentRequest.currentStage - 1) / 6) * 100}%` }}
                      />
                    </div>

                    {/* Timeline Milestones */}
                    {stagesList.map((stage) => {
                      const status = getStageStatus(stage);
                      const milestoneUpdate = currentRequest.updates.find(u => u.stage === stage);
                      return (
                        <div key={stage} className="relative z-10 flex flex-col items-center w-[12%] text-center">
                          <div className="mb-3.5">
                            {status === 'completed' && (
                              <div className="h-10 w-10 rounded-full bg-[#138808] text-white flex items-center justify-center shadow-md">
                                <CheckCircle2 className="h-5.5 w-5.5" />
                              </div>
                            )}
                            {status === 'current' && (
                              <div className="h-10 w-10 rounded-full bg-[#FF9933] text-white flex items-center justify-center shadow-lg ring-4 ring-[#FF9933]/20 animate-pulse">
                                <Clock className="h-5.5 w-5.5" />
                              </div>
                            )}
                            {status === 'pending' && (
                              <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 ${
                                highContrast 
                                  ? 'bg-[#0f172a] border-slate-600 text-slate-500' 
                                  : 'bg-white border-slate-300 text-slate-400'
                              }`}>
                                <span className="text-xs font-black">{stage}</span>
                              </div>
                            )}
                          </div>

                          <span className={`text-xs font-black leading-snug line-clamp-2 min-h-[2.5rem] px-1 ${
                            status === 'current' 
                              ? (highContrast ? 'text-yellow-300 font-extrabold' : 'text-[#FF9933] font-bold') 
                              : status === 'completed'
                              ? (highContrast ? 'text-emerald-400 font-extrabold' : 'text-slate-800')
                              : 'text-slate-400'
                          }`}>
                            {getStageTitle(stage)}
                          </span>

                          {milestoneUpdate ? (
                            <div className="mt-1 flex flex-col text-[10px] text-slate-400 leading-tight">
                              <span className="font-semibold">{milestoneUpdate.date}</span>
                              <span>{milestoneUpdate.time}</span>
                            </div>
                          ) : (
                            <span className="mt-1 text-[10px] opacity-0">-</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Vertical Timeline (Mobile Screens) */}
                <div className="lg:hidden space-y-4">
                  {stagesList.map((stage) => {
                    const status = getStageStatus(stage);
                    const milestoneUpdate = currentRequest.updates.find(u => u.stage === stage);
                    return (
                      <div key={stage} className="flex items-start">
                        <div className="flex flex-col items-center mr-4">
                          <div className="z-10">
                            {status === 'completed' && (
                              <div className="h-8 w-8 rounded-full bg-[#138808] text-white flex items-center justify-center shadow">
                                <CheckCircle2 className="h-4.5 w-4.5" />
                              </div>
                            )}
                            {status === 'current' && (
                              <div className="h-8 w-8 rounded-full bg-[#FF9933] text-white flex items-center justify-center shadow ring-4 ring-[#FF9933]/10 animate-pulse">
                                <Clock className="h-4.5 w-4.5" />
                              </div>
                            )}
                            {status === 'pending' && (
                              <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 ${
                                highContrast 
                                  ? 'bg-[#0f172a] border-slate-700 text-slate-400' 
                                  : 'bg-white border-slate-200 text-slate-400'
                              }`}>
                                <span className="text-xs font-bold">{stage}</span>
                              </div>
                            )}
                          </div>
                          {stage < 7 && (
                            <div className={`w-0.5 h-12 -mb-2 mt-1 ${
                              status === 'completed' ? 'bg-[#138808]' : 'bg-slate-200'
                            }`} />
                          )}
                        </div>

                        <div className="flex-1 pt-0.5">
                          <h4 className={`text-xs font-black ${
                            status === 'current' 
                              ? 'text-[#FF9933]' 
                              : status === 'completed'
                              ? (highContrast ? 'text-emerald-400' : 'text-slate-800')
                              : 'text-slate-400'
                          }`}>
                            {getStageTitle(stage)}
                          </h4>
                          {milestoneUpdate && (
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {milestoneUpdate.date} | {milestoneUpdate.time}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* TWO COLUMN CONTENT: Left details/insights, Right Summary & Map */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                <div className="lg:col-span-2 space-y-8">
                  
                  {/* REQUEST DETAILS CARD */}
                  <div className={`rounded-2xl border p-6 md:p-8 transition shadow-sm ${
                    highContrast 
                      ? 'bg-[#1e293b] border-yellow-500/20' 
                      : 'bg-white border-slate-200'
                  }`}>
                    <h3 className={`text-base font-extrabold uppercase tracking-wider mb-6 flex items-center space-x-2 ${
                      highContrast ? 'text-yellow-300' : 'text-slate-800'
                    }`}>
                      <FileText className="h-5 w-5 text-[#000080]" />
                      <span>{language === 'en' ? 'Request Details' : language === 'hi' ? 'अनुरोध विवरण' : 'तक्रारीचा तपशील'}</span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <span className="text-[10px] uppercase font-bold opacity-60 block mb-1">
                          {t.complaintIdLabel}
                        </span>
                        <span className="text-sm font-black tracking-tight">{currentRequest.id}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold opacity-60 block mb-1">
                          {t.categoryLabel}
                        </span>
                        <span className="text-sm font-semibold">{currentRequest.category}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold opacity-60 block mb-1">
                          {t.submissionDateLabel}
                        </span>
                        <span className="text-sm font-semibold">
                          {new Date(currentRequest.createdAt).toLocaleDateString(
                            language === 'en' ? 'en-US' : language === 'hi' ? 'hi-IN' : 'mr-IN',
                            { year: 'numeric', month: 'long', day: 'numeric' }
                          )}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold opacity-60 block mb-1">
                          {t.citizenNameLabel}
                        </span>
                        <span className="text-sm font-semibold flex items-center space-x-1">
                          <User className="h-4 w-4 opacity-50 shrink-0" />
                          <span>{currentRequest.submittedBy}</span>
                        </span>
                      </div>
                    </div>

                    <div className="border-t pt-5 border-slate-100/10">
                      <span className="text-[10px] uppercase font-bold opacity-60 block mb-1.5">
                        {t.issueDescriptionLabel}
                      </span>
                      <p className="text-xs leading-relaxed opacity-95 text-justify">
                        {currentRequest.description}
                      </p>
                    </div>
                  </div>

                  {/* AI INSIGHTS SECTION */}
                  <div className={`rounded-2xl border p-6 md:p-8 transition shadow-sm relative overflow-hidden ${
                    highContrast 
                      ? 'bg-[#1e293b] border-yellow-500/20' 
                      : 'bg-white border-slate-200'
                  }`}>
                    <div className="absolute top-0 left-0 right-0 h-1 flex">
                      <div className="bg-[#FF9933] flex-1"></div>
                      <div className="bg-white w-1/12"></div>
                      <div className="bg-[#138808] flex-1"></div>
                    </div>

                    <div className="flex items-center justify-between mb-6">
                      <h3 className={`text-base font-extrabold uppercase tracking-wider flex items-center space-x-2 ${
                        highContrast ? 'text-yellow-300' : 'text-slate-800'
                      }`}>
                        <Sparkles className="h-5 w-5 text-[#FF9933]" />
                        <span>{t.aiInsightsLabel}</span>
                      </h3>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold uppercase select-none shrink-0">
                        Gemini-Powered
                      </span>
                    </div>

                    <div className={`p-4 rounded-xl border mb-6 text-xs leading-relaxed ${
                      highContrast 
                        ? 'bg-[#0f172a] border-yellow-500/30 text-yellow-300' 
                        : 'bg-[#FF9933]/5 border-[#FF9933]/20 text-[#000080]'
                    }`}>
                      <strong>{language === 'en' ? 'Core Insight:' : language === 'hi' ? 'मुख्य अंतर्दृष्टि:' : 'मुख्य निष्कर्ष:'}</strong> {currentRequest.id === 'JSA-2026-0001' ? 
                        `Multiple complaints from this locality indicate recurring water supply issues. Based on complaint frequency and affected population, this issue has been assigned High Priority and recommended for constituency planning.` :
                        `The AI engine indicates this report relates to ${currentRequest.category.toLowerCase()} development. The citizen priority rating is supported by a community engagement score of ${currentRequest.confidenceScore}.`
                      }
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="flex items-center justify-between p-3 border rounded-xl">
                        <span className="font-semibold opacity-70">{t.categoryLabel}:</span>
                        <span className="font-extrabold text-[#000080] dark:text-yellow-300">{currentRequest.category}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-xl">
                        <span className="font-semibold opacity-70">{t.urgencyLabel}:</span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                          currentRequest.priority === 'High' || currentRequest.priority === 'Critical' 
                            ? 'bg-red-50 text-red-700 border border-red-200' 
                            : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                        }`}>
                          {currentRequest.aiInsights.urgency}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-xl">
                        <span className="font-semibold opacity-70">{t.sentimentLabel}:</span>
                        <span className="font-bold">{currentRequest.aiInsights.sentiment}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-xl">
                        <span className="font-semibold opacity-70">{t.confidenceScoreLabel}:</span>
                        <span className="font-extrabold text-[#138808] dark:text-emerald-400">{currentRequest.confidenceScore}</span>
                      </div>
                    </div>

                    <div className="mt-5 border-t pt-5 border-slate-100/10 space-y-3.5">
                      <div>
                        <span className="text-[10px] uppercase font-bold opacity-60 block mb-1">
                          {t.aiSummaryLabel}
                        </span>
                        <p className="text-xs leading-relaxed opacity-90">{currentRequest.aiInsights.summary}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold opacity-60 block mb-1">
                          {t.recommendationLabel}
                        </span>
                        <p className="text-xs leading-relaxed font-semibold text-slate-800 dark:text-yellow-200">
                          {currentRequest.aiInsights.recommendation}
                        </p>
                      </div>
                    </div>
                  </div>

                </div>

                <div className="space-y-8">
                  
                  {/* STATUS SUMMARY CARD */}
                  <div className={`rounded-2xl border p-6 md:p-8 transition shadow-sm relative overflow-hidden ${
                    highContrast 
                      ? 'bg-[#1e293b] border-yellow-500/20' 
                      : 'bg-white border-slate-200'
                  }`}>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#FF9933] rotate-45 translate-x-12 -translate-y-12 opacity-5 select-none" />

                    <h3 className={`text-base font-extrabold uppercase tracking-wider mb-6 flex items-center space-x-2 ${
                      highContrast ? 'text-yellow-300' : 'text-slate-800'
                    }`}>
                      <Info className="h-5 w-5 text-[#000080]" />
                      <span>{language === 'en' ? 'Status Summary' : language === 'hi' ? 'स्थिति सारांश' : 'स्थिती सारांश'}</span>
                    </h3>

                    <div className="space-y-5 text-xs">
                      <div>
                        <span className="opacity-60 block font-bold mb-1 uppercase tracking-wide text-[9px]">{t.currentStatusLabel}</span>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase ${
                          currentRequest.status === 'Action Initiated'
                            ? (highContrast ? 'bg-emerald-950 text-emerald-400 border border-emerald-400' : 'bg-emerald-50 text-emerald-700 border border-emerald-200')
                            : currentRequest.status === 'Under Review' || currentRequest.status === 'AI Analysis' || currentRequest.status === 'Development Planning'
                            ? (highContrast ? 'bg-amber-950 text-amber-400 border border-amber-400' : 'bg-amber-50 text-amber-700 border border-amber-200')
                            : (highContrast ? 'bg-slate-900 text-yellow-300 border border-yellow-300' : 'bg-slate-100 text-slate-700 border border-slate-200')
                        }`}>
                          {getStageTitle(currentRequest.currentStage)}
                        </span>
                      </div>

                      <div className="border-t border-slate-100/10 pt-4 grid grid-cols-2 gap-4">
                        <div>
                          <span className="opacity-60 block font-bold mb-0.5 uppercase tracking-wide text-[9px]">AI Category</span>
                          <span className="font-extrabold text-sm">{currentRequest.category}</span>
                        </div>
                        <div>
                          <span className="opacity-60 block font-bold mb-0.5 uppercase tracking-wide text-[9px]">Priority Level</span>
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] ${getPriorityBadgeStyle(currentRequest.priority)}`}>
                            {currentRequest.priority}
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-slate-100/10 pt-4 grid grid-cols-2 gap-4">
                        <div>
                          <span className="opacity-60 block font-bold mb-0.5 uppercase tracking-wide text-[9px]">AI Confidence</span>
                          <span className="font-extrabold text-sm text-[#138808] dark:text-emerald-400">{currentRequest.confidenceScore}</span>
                        </div>
                        <div>
                          <span className="opacity-60 block font-bold mb-0.5 uppercase tracking-wide text-[9px]">Affected Citizens</span>
                          <span className="font-extrabold text-sm text-slate-800 dark:text-yellow-100">{currentRequest.citizensAffected}</span>
                        </div>
                      </div>

                      <div className="border-t border-slate-100/10 pt-4">
                        <span className="opacity-60 block font-bold mb-1 uppercase tracking-wide text-[9px]">{t.recommendedActionLabel}</span>
                        <div className={`p-2.5 rounded-lg border font-black ${
                          highContrast 
                            ? 'bg-[#0f172a] border-yellow-500/30 text-yellow-300' 
                            : 'bg-slate-50 border-slate-100 text-[#000080]'
                        }`}>
                          {currentRequest.recommendedAction}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* LOCATION SECTION (Google Maps Preview) */}
                  <div className={`rounded-2xl border p-6 md:p-8 transition shadow-sm ${
                    highContrast 
                      ? 'bg-[#1e293b] border-yellow-500/20' 
                      : 'bg-white border-slate-200'
                  }`}>
                    <h3 className={`text-base font-extrabold uppercase tracking-wider mb-6 flex items-center space-x-2 ${
                      highContrast ? 'text-yellow-300' : 'text-slate-800'
                    }`}>
                      <MapPin className="h-5 w-5 text-[#138808]" />
                      <span>{t.locationLabel}</span>
                    </h3>

                    <div id="simple-issue-map" className="relative h-56 rounded-xl overflow-hidden border mb-3 bg-slate-100 dark:bg-slate-900 z-10" />

                    <div className="flex flex-col sm:flex-row gap-2 mb-3">
                      <button
                        type="button"
                        onClick={handleDetectUserLocation}
                        disabled={detecting}
                        className={`flex-1 flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-xl border text-xs font-black transition cursor-pointer select-none ${
                          highContrast
                            ? 'bg-slate-900 border-yellow-500/30 hover:bg-yellow-500/10 text-yellow-300'
                            : 'bg-slate-50 border-slate-300 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        {detecting ? (
                          <span className="w-3.5 h-3.5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></span>
                        ) : (
                          <Compass className="h-4 w-4 text-blue-600" />
                        )}
                        <span>{detecting ? 'Locating...' : 'Detect My Location'}</span>
                      </button>
                    </div>

                    <div className={`p-2.5 rounded-lg border text-[10px] font-bold flex justify-between items-center mb-4 ${
                      highContrast ? 'bg-[#0f172a] border-yellow-500/20 text-yellow-300' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}>
                      <span>Lat: {(currentRequest.coordinates?.lat || currentRequest.lat || 28.6139).toFixed(5)}</span>
                      <span>Lng: {(currentRequest.coordinates?.lng || currentRequest.lng || 77.2090).toFixed(5)}</span>
                      <span className="text-[#FF9933] font-extrabold uppercase animate-pulse">GPS Stream Active</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-100/5">
                        <span className="opacity-70 font-semibold">{language === 'en' ? 'Complaint Location' : language === 'hi' ? 'शिकायत का स्थान' : 'तक्रारीचे ठिकाण'}:</span>
                        <span className="font-bold">{currentRequest.location}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100/5">
                        <span className="opacity-70 font-semibold">{language === 'en' ? 'District' : language === 'hi' ? 'जिला' : 'जिल्हा'}:</span>
                        <span className="font-bold">{currentRequest.district}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="opacity-70 font-semibold">{language === 'en' ? 'State' : language === 'hi' ? 'राज्य' : 'राज्य'}:</span>
                        <span className="font-bold">{currentRequest.state}</span>
                      </div>
                    </div>
                  </div>

                </div>

              </div>

              {/* NOTIFICATION LOG SECTION */}
              <div className={`rounded-2xl border p-6 md:p-8 transition shadow-sm ${
                highContrast 
                  ? 'bg-[#1e293b] border-yellow-500/20' 
                  : 'bg-white border-slate-200'
              }`}>
                <div className="mb-6">
                  <h3 className={`text-base font-extrabold uppercase tracking-wider flex items-center space-x-2 ${
                    highContrast ? 'text-yellow-300' : 'text-slate-800'
                  }`}>
                    <Clock className="h-5 w-5 text-[#000080]" />
                    <span>{t.updatesTitle}</span>
                  </h3>
                  <p className="text-[11px] opacity-65 mt-0.5">{t.historyDesc}</p>
                </div>

                <div className="space-y-4">
                  {currentRequest.updates.slice().reverse().map((update, idx) => {
                    const statusName = t[update.title] || update.title;
                    return (
                      <div 
                        key={idx} 
                        className={`p-4 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition ${
                          idx === 0 
                            ? (highContrast ? 'bg-emerald-955 border-emerald-500/40 text-[#fef08a]' : 'bg-emerald-50/50 border-emerald-200 text-slate-800')
                            : (highContrast ? 'bg-[#0f172a] border-slate-800/80 text-slate-300' : 'bg-slate-50/60 border-slate-100 text-slate-600')
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`p-1.5 rounded-full ${
                            idx === 0 ? 'bg-[#138808] text-white shadow-sm' : 'bg-slate-200 text-slate-550'
                          }`}>
                            <CheckCircle2 className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="text-xs font-black block">{statusName}</span>
                            <span className="text-[10px] opacity-65">Milestone Verified</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2.5 text-[11px] font-bold select-none shrink-0 self-end sm:self-auto">
                          <span className="px-2 py-0.5 bg-slate-100/10 rounded-md border border-slate-100/5">
                            {update.date}
                          </span>
                          <span className="text-slate-400">
                            {update.time}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ACTION: Download/Print Receipt button */}
              <div className="flex justify-center pb-8">
                <button 
                  onClick={() => setShowReceiptModal(true)}
                  className={`px-8 py-3.5 rounded-xl text-sm font-black transition cursor-pointer flex items-center justify-center space-x-2.5 shadow-md ${
                    highContrast 
                      ? 'bg-yellow-400 hover:bg-yellow-500 text-black' 
                      : 'bg-[#000080] hover:bg-blue-900 text-white hover:shadow-lg'
                  }`}
                >
                  <Download className="h-5 w-5" />
                  <span>{t.downloadReceipt}</span>
                </button>
              </div>

            </div>
          )}
        </div>
      </div>

      {/* RECEIPT PREVIEW MODAL */}
      {showReceiptModal && currentRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity duration-300">
          <div 
            className={`w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl border flex flex-col max-h-[90vh] transition-transform duration-300 scale-100 ${
              highContrast ? 'bg-[#1e293b] border-yellow-500' : 'bg-white border-slate-200'
            }`}
          >
            <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50 dark:bg-slate-900 border-slate-100/10 shrink-0">
              <h3 className="text-sm font-extrabold uppercase tracking-wider flex items-center space-x-2">
                <ShieldCheck className="h-5 w-5 text-[#138808]" />
                <span>Official Receipt Preview</span>
              </h3>
              <button 
                onClick={() => setShowReceiptModal(false)}
                className={`text-lg font-black transition px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 ${
                  highContrast ? 'text-yellow-400' : 'text-slate-500'
                }`}
              >
                ✕
              </button>
            </div>

            <div className="p-6 md:p-8 overflow-y-auto flex-1">
              <div 
                ref={receiptRef}
                className="bg-white text-slate-800 p-8 border-4 border-slate-800 rounded-lg shadow-inner print-only relative overflow-hidden"
                style={{ minHeight: '520px' }}
              >
                {/* 3% Opacity Ashoka Chakra Watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0" style={{ opacity: 0.03 }}>
                  <img src={ashokaChakra} alt="" className="h-96 w-96 object-contain select-none pointer-events-none" />
                </div>

                <div className="h-1.5 w-full flex mb-6 relative z-10">
                  <div className="bg-[#FF9933] flex-1"></div>
                  <div className="bg-slate-200 w-1/12"></div>
                  <div className="bg-[#138808] flex-1"></div>
                </div>

                <div className="text-center pb-6 border-b-2 border-slate-800 relative z-10">
                  <div className="flex justify-center mb-2">
                    <img src={emblemOfIndia} alt="National Emblem of India" className="h-20 w-auto select-none pointer-events-none object-contain" />
                  </div>
                  <h1 className="text-xs font-black tracking-widest text-[#000080] uppercase">
                    Government of India
                  </h1>
                  <h2 className="text-sm font-extrabold text-[#000080] tracking-tight mt-1">
                    JanSetu AI
                  </h2>
                  <p className="text-[10px] tracking-wide text-slate-500 font-bold uppercase mt-1">
                    AI-Powered Constituency Development Platform
                  </p>
                </div>

                <div className="py-6 space-y-4 text-xs relative z-10">
                  <div className="flex justify-between items-center bg-slate-100 p-2.5 rounded border border-slate-300">
                    <span className="font-extrabold uppercase text-[10px] tracking-wide text-slate-600">
                      {t.complaintIdLabel}:
                    </span>
                    <span className="font-black text-sm tracking-tight text-slate-900">
                      {currentRequest.id}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-bold block text-slate-500 text-[9px] uppercase tracking-wide mb-0.5">
                        {t.submissionDateLabel}
                      </span>
                      <span className="font-black text-slate-800">
                        {new Date(currentRequest.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div>
                      <span className="font-bold block text-slate-500 text-[9px] uppercase tracking-wide mb-0.5">
                        {t.categoryLabel}
                      </span>
                      <span className="font-black text-slate-800">{currentRequest.category}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t pt-3">
                    <div>
                      <span className="font-bold block text-slate-500 text-[9px] uppercase tracking-wide mb-0.5">
                        {t.locationLabel}
                      </span>
                      <span className="font-black text-slate-800">{currentRequest.location}</span>
                    </div>
                    <div>
                      <span className="font-bold block text-slate-500 text-[9px] uppercase tracking-wide mb-0.5">
                        {t.currentStatusLabel}
                      </span>
                      <span className="font-black text-[#138808] uppercase text-[11px] tracking-wide">
                        {currentRequest.status}
                      </span>
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <span className="font-bold block text-slate-500 text-[9px] uppercase tracking-wide mb-1">
                      {language === 'en' ? 'Description' : language === 'hi' ? 'विवरण' : 'विवरण'}
                    </span>
                    <p className="text-[11px] leading-relaxed text-slate-700 italic bg-slate-50 p-2.5 rounded border border-slate-200">
                      "{currentRequest.description}"
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t pt-3">
                    <div>
                      <span className="font-bold block text-slate-500 text-[9px] uppercase tracking-wide mb-0.5">
                        Constituency Impact Assessment
                      </span>
                      <span className="font-bold block text-slate-700">
                        Estimated affected: {currentRequest.citizensAffected}
                      </span>
                    </div>
                    <div>
                      <span className="font-bold block text-slate-500 text-[9px] uppercase tracking-wide mb-0.5">
                        AI Priority Score
                      </span>
                      <span className="font-bold block text-slate-700">
                        Priority: {currentRequest.priority} ({currentRequest.confidenceScore})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t-2 border-slate-800 pt-6 mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-[9px] relative z-10">
                  <div className="max-w-xs text-slate-400">
                    <p className="font-bold">Disclaimer:</p>
                    <p className="leading-tight mt-0.5">
                      This is a digitally generated acknowledgement receipt from the JanSetu AI portal. No physical signature is required. All records are secured using cryptographic hashes on government servers.
                    </p>
                  </div>
                  <div className="text-right self-end sm:self-auto border border-dashed border-slate-400 p-2 rounded bg-slate-50">
                    <div className="font-black text-[#000080] uppercase tracking-wider">JanSetu AI Secure</div>
                    <div className="text-slate-400 font-mono mt-0.5">REF: {currentRequest.id.substring(4)}</div>
                    <div className="text-slate-400">STATUS: VERIFIED</div>
                  </div>
                </div>
              </div>
            </div>

              <div className="px-6 py-4 border-t flex flex-col sm:flex-row justify-end items-center gap-2 bg-slate-50 dark:bg-slate-900 border-slate-100/10 shrink-0">
                <button 
                  onClick={() => setShowReceiptModal(false)}
                  className={`w-full sm:w-auto px-5 py-2 rounded-lg text-xs font-bold border transition ${
                    highContrast 
                      ? 'border-yellow-500 text-yellow-300 hover:bg-yellow-500/10' 
                      : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Close Preview
                </button>
                <button 
                  onClick={handlePrint}
                  className={`w-full sm:w-auto px-6 py-2 rounded-lg text-xs font-black transition cursor-pointer flex items-center justify-center space-x-1.5 ${
                    highContrast 
                      ? 'bg-yellow-400 hover:bg-yellow-500 text-black shadow' 
                      : 'bg-[#000080] hover:bg-blue-900 text-white shadow hover:scale-[1.01]'
                  }`}
                >
                  <Printer className="h-4 w-4" />
                  <span>{t.printBtn}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}
