import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom';
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
import { supabase } from '../lib/db';
import emblemOfIndia from '../assets/emblem-of-india.svg';
import ashokaChakra from '../assets/ashoka-chakra.svg';
const MOCK_TRACK_DATA = {
  'JSA-DEMO-0001': {
    id: 'JSA-DEMO-0001',
    title: 'Water Supply: Low Pressure and Contaminated Water',
    description: 'We have been receiving yellow-ish, contaminated water for the past 5 days. The pressure is also extremely low, making it difficult to fill household containers.',
    category: 'Water Supply',
    subcategory: 'Contaminated Water',
    location: 'Wazirpur, Phase 1',
    area: 'Wazirpur',
    city: 'Delhi',
    district: 'North Delhi',
    state: 'Delhi',
    pincode: '110052',
    submittedBy: 'Amit Kumar',
    createdAt: '2026-07-01T10:00:00.000Z',
    status: 'Development Planning',
    currentStage: 5,
    priority: 'High',
    confidenceScore: '92%',
    citizensAffected: '350+',
    recommendedAction: 'Pipeline Flushing and Pressure Valve Regulation',
    aiInsights: {
      sentiment: 'Highly Concerned / Dissatisfied',
      urgency: 'High (Public Health Risk)',
    },
    coordinates: { lat: 28.6946, lng: 77.1687 },
    updates: [
      { stage: 1, title: 'complaintSubmittedUpdate', date: 'Jul 1, 2026', time: '10:00 AM' },
      { stage: 2, title: 'aiAnalysisCompletedUpdate', date: 'Jul 1, 2026', time: '10:05 AM' },
      { stage: 3, title: 'priorityScoreGeneratedUpdate', date: 'Jul 1, 2026', time: '10:15 AM' },
      { stage: 4, title: 'reviewedByPlanningUpdate', date: 'Jul 1, 2026', time: '02:30 PM' },
      { stage: 5, title: 'stageDevPlanning', date: 'Jul 2, 2026', time: '11:00 AM' },
    ]
  },
  'JSA-DEMO-0002': {
    id: 'JSA-DEMO-0002',
    title: 'Roads: Major Potholes on Main Bazar Road',
    description: 'Several massive potholes have formed near the main market square, causing traffic jams and multiple minor accidents of two-wheelers during night hours.',
    category: 'Roads',
    subcategory: 'Potholes',
    location: 'Karol Bagh Market',
    area: 'Karol Bagh',
    city: 'Delhi',
    district: 'Central Delhi',
    state: 'Delhi',
    pincode: '110005',
    submittedBy: 'Neha Sharma',
    createdAt: '2026-07-02T09:00:00.000Z',
    status: 'All stages completed',
    currentStage: 7,
    priority: 'Critical',
    confidenceScore: '96%',
    citizensAffected: '800+',
    recommendedAction: 'Immediate Road Patching & Resurfacing',
    aiInsights: {
      sentiment: 'Angry / Frustrated',
      urgency: 'Critical (Accident Prone Area)',
    },
    coordinates: { lat: 28.6443, lng: 77.1895 },
    updates: [
      { stage: 1, title: 'complaintSubmittedUpdate', date: 'Jul 2, 2026', time: '09:00 AM' },
      { stage: 2, title: 'aiAnalysisCompletedUpdate', date: 'Jul 2, 2026', time: '09:05 AM' },
      { stage: 3, title: 'priorityScoreGeneratedUpdate', date: 'Jul 2, 2026', time: '09:15 AM' },
      { stage: 4, title: 'reviewedByPlanningUpdate', date: 'Jul 2, 2026', time: '11:30 AM' },
      { stage: 5, title: 'stageDevPlanning', date: 'Jul 2, 2026', time: '02:00 PM' },
      { stage: 6, title: 'stageRecToMp', date: 'Jul 2, 2026', time: '04:00 PM' },
      { stage: 7, title: 'actionInitiatedUpdate', date: 'Jul 3, 2026', time: '10:30 AM' },
    ]
  },
  'JSA-DEMO-0003': {
    id: 'JSA-DEMO-0003',
    title: 'Electricity: Frequent Power Cuts (4+ Hours Daily)',
    description: 'We are experiencing multiple unscheduled power cuts daily in our locality, especially during the afternoon heat. Voltage fluctuation is also damaging appliances.',
    category: 'Electricity',
    subcategory: 'Power Cuts',
    location: 'Rohini Sector 8',
    area: 'Rohini',
    city: 'Delhi',
    district: 'North West Delhi',
    state: 'Delhi',
    pincode: '110085',
    submittedBy: 'Rajesh Gupta',
    createdAt: '2026-07-02T15:00:00.000Z',
    status: 'Under Review',
    currentStage: 4,
    priority: 'Medium',
    confidenceScore: '89%',
    citizensAffected: '600+',
    recommendedAction: 'Substation Load Balancing & Transformer Check',
    aiInsights: {
      sentiment: 'Concerned / Stressed',
      urgency: 'Medium (Summer Load Issue)',
    },
    coordinates: { lat: 28.7041, lng: 77.1251 },
    updates: [
      { stage: 1, title: 'complaintSubmittedUpdate', date: 'Jul 2, 2026', time: '03:00 PM' },
      { stage: 2, title: 'aiAnalysisCompletedUpdate', date: 'Jul 2, 2026', time: '03:05 PM' },
      { stage: 3, title: 'priorityScoreGeneratedUpdate', date: 'Jul 2, 2026', time: '03:15 PM' },
      { stage: 4, title: 'reviewedByPlanningUpdate', date: 'Jul 3, 2026', time: '09:00 AM' },
    ]
  },
  'JSA-DEMO-0004': {
    id: 'JSA-DEMO-0004',
    title: 'Sanitation: Garbage Overflow Near Public School',
    description: 'The municipal dustbin near the entrance of Government Primary School has not been cleared for three days. Stray animals are scattering the waste on the road.',
    category: 'Garbage',
    subcategory: 'Overflow Dustbins',
    location: 'Dwarka Sector 3',
    area: 'Dwarka',
    city: 'Delhi',
    district: 'South West Delhi',
    state: 'Delhi',
    pincode: '110078',
    submittedBy: 'Sunita Devi',
    createdAt: '2026-07-03T08:00:00.000Z',
    status: 'Submitted',
    currentStage: 1,
    priority: 'High',
    confidenceScore: '91%',
    citizensAffected: '200+',
    recommendedAction: 'Urgent waste clearance and relocation of municipal bin',
    aiInsights: {
      sentiment: 'Alarmed / Concerned',
      urgency: 'High (School Proximity Risk)',
    },
    coordinates: { lat: 28.5997, lng: 77.0396 },
    updates: [
      { stage: 1, title: 'complaintSubmittedUpdate', date: 'Jul 3, 2026', time: '08:00 AM' }
    ]
  }
};

export default function TrackRequest({ language, fontSize, highContrast }) {
  const t = translations[language];
  const location = useLocation();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [searchId, setSearchId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [searched, setSearched] = useState(false);
  const [currentRequest, setCurrentRequest] = useState(null);
  const [latestIssueIds, setLatestIssueIds] = useState([]);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [latestNotice, setLatestNotice] = useState(null);
  
  const receiptRef = useRef();

  const mapInstanceRef = useRef(null);
  const userMarkerRef = useRef(null);
  const [detecting, setDetecting] = useState(false);

  const fetchLatestIssue = async () => {
    try {
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSearchId(data.reference_code || data.issue_id);
        setCurrentRequest(mapSupabaseIssue(data));
        setErrorMsg('');
      } else {
        setCurrentRequest(null);
      }
    } catch (err) {
      console.error('Error fetching latest issue:', err);
    }
  };

  const fetchLatestIssueIds = async () => {
    try {
      const { data, error } = await supabase
        .from('issues')
        .select('reference_code, issue_id')
        .order('created_at', { ascending: false })
        .limit(4);

      if (error) throw error;

      if (data) {
        const ids = data.map(item => item.reference_code || item.issue_id).filter(Boolean);
        setLatestIssueIds(ids);
      }
    } catch (err) {
      console.error('Error fetching latest issue IDs:', err);
    }
  };

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

        const latToUse = currentRequest.coordinates?.lat;
        const lngToUse = currentRequest.coordinates?.lng;
        
        if (typeof latToUse === 'number' && typeof lngToUse === 'number') {
          const complaintLatLng = L.latLng(latToUse, lngToUse);
          const userLatLng = L.latLng(lat, lng);
          
          const bounds = L.latLngBounds([complaintLatLng, userLatLng]);
          mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] });
        } else {
          // If no complaint coordinates, just pan to user location
          mapInstanceRef.current.setView([lat, lng], 14);
        }
        
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
    const lat = currentRequest.coordinates?.lat;
    const lng = currentRequest.coordinates?.lng;

    // Cleanup existing map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Helper: initialize map at given lat/lng
    const initMapAt = (mapLat, mapLng, isApproximate = false) => {
      const mapTimer = setTimeout(() => {
        const mapEl = document.getElementById('simple-issue-map');
        if (!mapEl) return;

        // Clear any existing placeholder
        mapEl.innerHTML = '';

        const map = L.map('simple-issue-map', {
          center: [mapLat, mapLng],
          zoom: isApproximate ? 12 : 14,
          zoomControl: false,
          attributionControl: false,
          scrollWheelZoom: true,
          gestureHandling: true
        });

        setTimeout(() => { map.invalidateSize(); }, 150);

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        const tileUrl = highContrast
          ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
          : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        L.tileLayer(tileUrl).addTo(map);

        const colors = {
          'Roads': '#D97706', 'Garbage': '#16A34A', 'Water Supply': '#2563EB',
          'Electricity': '#EAB308', 'Street Lights': '#8B5CF6',
          'Drainage': '#0D9488', 'Public Safety': '#DC2626',
        };
        const color = colors[currentRequest.category] || '#475569';

        const issueIcon = L.divIcon({
          html: `
            <div class="relative flex items-center justify-center" style="width: 28px; height: 28px;">
              <span class="absolute inline-flex h-full w-full rounded-full opacity-35 animate-ping" style="background-color: ${color};"></span>
              <div class="relative rounded-full border-2 border-white shadow-lg flex items-center justify-center text-[10px]" 
                   style="background-color: ${color}; width: 16px; height: 16px; color: white;">
              </div>
            </div>
          `,
          className: 'custom-div-icon',
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        const marker = L.marker([mapLat, mapLng], { icon: issueIcon }).addTo(map);

        const popupContent = `
          <div class="p-1.5 font-sans text-xs min-w-[160px]">
            <div class="font-bold text-slate-900 mb-1 border-b pb-1">📍 ${isApproximate ? 'Approximate Location' : 'Issue Location'}</div>
            ${isApproximate ? '<div class="text-amber-600 text-[10px] mb-1">⚠ Approximate (address-based)</div>' : ''}
            <div class="mb-0.5"><span class="font-semibold">Area:</span> ${currentRequest.area || 'Not Available'}</div>
            <div class="mb-0.5"><span class="font-semibold">City:</span> ${currentRequest.city || 'Not Available'}</div>
            <div class="mb-0.5"><span class="font-semibold">District:</span> ${currentRequest.district || 'Not Available'}</div>
            <div><span class="font-semibold">State:</span> ${currentRequest.state || 'Not Available'}</div>
          </div>
        `;
        marker.bindPopup(popupContent).openPopup();

        mapInstanceRef.current = map;
      }, 200);
      return mapTimer;
    };

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      // No exact coordinates — try to geocode address text via Nominatim
      const addressText = [
        currentRequest.area,
        currentRequest.city,
        currentRequest.district,
        currentRequest.state,
        'India'
      ].filter(Boolean).join(', ');

      if (addressText && addressText !== 'India') {
        // Show loading state
        const mapEl = document.getElementById('simple-issue-map');
        if (mapEl) {
          mapEl.innerHTML = `
            <div class="absolute inset-0 flex flex-col items-center justify-center text-xs text-slate-500 font-bold bg-slate-100 dark:bg-slate-900">
              <span class="animate-spin text-xl mb-2">🗺️</span>
              <span>Loading map location...</span>
            </div>
          `;
        }

        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressText)}&limit=1`, {
          headers: { 'User-Agent': 'Jansetu-AI-App' }
        })
          .then(r => r.json())
          .then(results => {
            if (results && results.length > 0) {
              const geocodedLat = parseFloat(results[0].lat);
              const geocodedLng = parseFloat(results[0].lon);
              initMapAt(geocodedLat, geocodedLng, true);
            } else {
              // Geocoding returned no results — show India center
              initMapAt(20.5937, 78.9629, true);
            }
          })
          .catch(() => {
            // Network error — show India center
            initMapAt(20.5937, 78.9629, true);
          });
      } else {
        // No address at all — show India overview map
        initMapAt(20.5937, 78.9629, true);
      }
      return;
    }

    // Exact GPS coordinates available — initialize map precisely
    const mapTimer = initMapAt(lat, lng, false);

    return () => {
      if (mapTimer) clearTimeout(mapTimer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [currentRequest, highContrast]);

  // Helper: map a Supabase issues row → the display shape expected by the UI
  const mapSupabaseIssue = (row) => {
    const createdAt = row.created_at || new Date().toISOString();
    const dateStr = new Date(createdAt).toLocaleDateString(
      `${language}-IN`,
      { year: 'numeric', month: 'short', day: 'numeric' }
    );

    // Map DB status → stage number & text dynamically
    let currentStage = 1;
    let statusText = 'Submitted';
    const dbStatus = row.status || 'Pending';
    
    if (dbStatus === 'Pending' || dbStatus === 'open') {
      currentStage = 4;
      statusText = 'Under Review';
    } else if (dbStatus === 'In Progress') {
      currentStage = 5;
      statusText = 'Development Planning';
    } else if (dbStatus === 'Resolved' || dbStatus === 'resolved') {
      currentStage = 7;
      statusText = 'All stages completed';
    } else {
      statusText = dbStatus;
      currentStage = 1;
    }

    const updates = [
      { stage: 1, title: 'complaintSubmittedUpdate', date: dateStr, time: '10:00 AM' }
    ];
    if (currentStage >= 2) updates.push({ stage: 2, title: 'aiAnalysisCompletedUpdate',    date: dateStr, time: '10:05 AM' });
    if (currentStage >= 3) updates.push({ stage: 3, title: 'priorityScoreGeneratedUpdate', date: dateStr, time: '10:15 AM' });
    if (currentStage >= 4) updates.push({ stage: 4, title: 'reviewedByPlanningUpdate',     date: dateStr, time: '02:30 PM' });
    if (currentStage >= 5) updates.push({ stage: 5, title: 'stageDevPlanning',             date: dateStr, time: '11:00 AM' });
    if (currentStage >= 6) updates.push({ stage: 6, title: 'stageRecToMp',                 date: dateStr, time: '01:15 PM' });
    if (currentStage >= 7) updates.push({ stage: 7, title: 'actionInitiatedUpdate',        date: dateStr, time: '04:00 PM' });

    // Extract subcategory from title if not explicitly available
    const subcategory = row.subcategory || (row.title && row.title.includes(':') ? row.title.split(':')[1].replace(/Issue$/i, '').trim() : 'Not Available');

    // Determine priority based on severity or default to 'Medium'
    const dbSeverity = row.severity || 'Medium'; // Can be Low, Medium, High, Critical
    
    // Dynamic calculation based on issue_id hash
    let hash = 0;
    const issueIdStr = row.issue_id || '';
    for (let i = 0; i < issueIdStr.length; i++) {
      hash = issueIdStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    const score = 88 + (Math.abs(hash) % 10);
    const confidenceScore = `${score}%`;

    const affected = 50 + (Math.abs(hash) % 450) + (row.votes || 0) * 10;
    const citizensAffected = `${affected}+`;

    // Urgency level translation
    const urgencyLabelKey = 'severity' + dbSeverity;
    const urgencyTranslated = t[urgencyLabelKey] || dbSeverity;

    const sentimentVal = t.sentimentConcerned || 'Concerned';

    let cleanDescription = row.description || '';
    if (cleanDescription) {
      cleanDescription = cleanDescription.replace(/\n\[Image:\s*(.*?)\]/s, '');
    }

    return {
      id:          row.reference_code || row.issue_id,
      title:       row.title,
      description: cleanDescription,
      category:    row.category,
      subcategory: subcategory,
      location:    row.area || 'Not Available',
      area:        row.area || 'Not Available',
      city:        row.city || 'Not Available',
      district:    row.district || 'Not Available',
      state:       row.state || 'Not Available',
      pincode:     row.pincode || 'Not Available',
      submittedBy: row.citizen_name || 'Anonymous Citizen',
      createdAt,
      status: statusText,
      currentStage,
      priority: dbSeverity,
      confidenceScore,
      citizensAffected,
      recommendedAction: t.actionModernization || 'Facility Modernization',
      aiInsights: {
        sentiment:      sentimentVal,
        urgency:        urgencyTranslated,
      },
      coordinates: { 
        lat: row.latitude ? parseFloat(row.latitude) : null, 
        lng: row.longitude ? parseFloat(row.longitude) : null 
      },
      updates,
    };
  };


  // On mount: fetch latest IDs. 
  // Process incoming route params, query params, or react-router history state.
  useEffect(() => {
    fetchLatestIssueIds();
    
    const queryId = searchParams.get('id');
    console.log('TrackRequest Route parameter (id):', id);
    console.log('TrackRequest Query parameter (id):', queryId);
    console.log('TrackRequest State searchId:', location.state?.searchId);

    const activeId = id || queryId || location.state?.searchId;
    console.log('TrackRequest selected activeId:', activeId);

    if (activeId) {
      setSearchId(activeId);
      searchSupabase(activeId);
    } else {
      fetchLatestIssue();
    }
  }, [id, searchParams, location.state]);

  // Fetch latest notice matching category & area
  useEffect(() => {
    const fetchNotice = async () => {
      if (!currentRequest || !currentRequest.area || !currentRequest.category) {
        setLatestNotice(null);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('mp_notices')
          .select('*')
          .eq('area', currentRequest.area)
          .eq('category', currentRequest.category)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('Error fetching latest notice:', error);
          setLatestNotice(null);
        } else {
          setLatestNotice(data);
        }
      } catch (err) {
        console.error('Unexpected error fetching latest notice:', err);
        setLatestNotice(null);
      }
    };

    fetchNotice();
  }, [currentRequest]);

  // Query Supabase for an issue by reference_code OR issue_id
  const searchSupabase = async (cleanId) => {
    if (!cleanId) return;

    console.log('searchSupabase cleanId:', cleanId);

    // Handle demo IDs directly from local mock data
    if (MOCK_TRACK_DATA[cleanId]) {
      setCurrentRequest(MOCK_TRACK_DATA[cleanId]);
      setErrorMsg('');
      setSearched(true);
      return;
    }

    try {
      // 1. Try searching by reference_code first
      let { data, error } = await supabase
        .from('issues')
        .select('*')
        .eq('reference_code', cleanId)
        .maybeSingle();

      console.log('Supabase response by reference_code:', data);

      if (error) {
        console.error('Supabase reference_code search error:', error);
        throw error;
      }

      // 2. If not found by reference_code, try searching by issue_id (UUID)
      if (!data) {
        console.log('Not found by reference_code, trying issue_id...');
        const result2 = await supabase
          .from('issues')
          .select('*')
          .eq('issue_id', cleanId)
          .maybeSingle();
        
        if (result2.error) {
          console.error('Supabase issue_id search error:', result2.error);
        } else {
          data = result2.data;
          console.log('Supabase response by issue_id:', data);
        }
      }

      if (data) {
        setCurrentRequest(mapSupabaseIssue(data));
        setErrorMsg('');
      } else {
        setCurrentRequest(null);
        setErrorMsg(t.noRequestFound);
      }
      setSearched(true);
    } catch (err) {
      console.error('TrackRequest Supabase search error:', err);
      setCurrentRequest(null);
      setErrorMsg(t.noRequestFound);
      setSearched(true);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const cleanId = searchId.trim();

    if (!cleanId) {
      setErrorMsg(t.emptyIdError);
      setSearched(false);
      setCurrentRequest(null);
      return;
    }

    searchSupabase(cleanId);
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
            
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-[10px] uppercase font-bold opacity-60">Try Examples:</span>
              {['JSA-DEMO-0001', 'JSA-DEMO-0002', 'JSA-DEMO-0003', 'JSA-DEMO-0004'].map((id) => (
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
                <h3 className="text-lg font-bold">{t.searchRequestTitle}</h3>
                <p className="text-xs opacity-60 mt-1 max-w-xs mx-auto">
                  {t.searchRequestDesc}
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
                  {t.noRequestFound}
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
                    {t.clearInput}
                  </button>
                  <Link 
                    to="/"
                    className={`px-5 py-2.5 rounded-lg text-xs font-black text-center transition ${
                      highContrast 
                        ? 'bg-yellow-400 text-black hover:bg-yellow-500' 
                        : 'bg-[#000080] hover:bg-blue-900 text-white'
                    }`}
                  >
                    {t.registerNewComplaint}
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div 
              className="space-y-8 transition-opacity duration-300"
            >
              {/* Government-styled Card for MP Update */}
              {latestNotice && (
                <div className={`rounded-2xl border p-6 md:p-8 transition shadow-sm relative overflow-hidden ${
                  highContrast 
                    ? 'bg-[#1e293b] border-yellow-500/20 text-yellow-300' 
                    : 'bg-gradient-to-r from-blue-50/50 via-white to-emerald-50/30 border-slate-200 text-slate-800'
                }`}>
                  {/* Tricolor accent bar */}
                  <div className="absolute top-0 left-0 right-0 h-1 flex">
                    <div className="bg-[#FF9933] flex-1"></div>
                    <div className="bg-white flex-1"></div>
                    <div className="bg-[#138808] flex-1"></div>
                  </div>

                  {/* Header */}
                  <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800/60 pb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">📢</span>
                      <h4 className={`text-base font-black tracking-tight ${
                        highContrast ? 'text-yellow-300' : 'text-[#000080]'
                      }`}>
                        {language === 'en' ? 'Official MP Update' : language === 'hi' ? 'आधिकारिक सांसद अपडेट' : 'अधिकृत खासदार अपडेट'}
                      </h4>
                    </div>
                    {/* Emblem watermark or badge */}
                    <div className="flex items-center space-x-1.5 opacity-80">
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg"
                        alt="Emblem"
                        className="h-6 w-auto opacity-70 pointer-events-none select-none"
                      />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#FF9933]">
                        {language === 'en' ? 'GOVT OF INDIA' : language === 'hi' ? 'भारत सरकार' : 'भारत सरकार'}
                      </span>
                    </div>
                  </div>

                  {/* Notice Content */}
                  <div className="mb-4">
                    <p className={`text-sm font-semibold leading-relaxed ${
                      highContrast ? 'text-yellow-100' : 'text-slate-755'
                    }`}>
                      {latestNotice.notice}
                    </p>
                  </div>

                  {/* Divider line */}
                  <div className="border-t border-slate-100 dark:border-slate-800/60 my-3"></div>

                  {/* Footer Info */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                    <div className="flex flex-wrap items-center gap-4 text-slate-500 dark:text-slate-400">
                      {/* MP Name */}
                      <div className="flex items-center space-x-1 font-bold">
                        <User className="h-3.5 w-3.5 text-[#FF9933]" />
                        <span className="text-slate-700 dark:text-slate-350">{latestNotice.mp_name}</span>
                      </div>
                      {/* Constituency */}
                      <div className="flex items-center space-x-1 font-semibold">
                        <MapPin className="h-3.5 w-3.5 text-blue-500" />
                        <span>{latestNotice.constituency}</span>
                      </div>
                    </div>

                    {/* Published Date */}
                    <div className="flex items-center space-x-1 text-slate-500 dark:text-slate-400 font-semibold self-start sm:self-auto">
                      <Calendar className="h-3.5 w-3.5 text-[#138808]" />
                      <span>
                        {language === 'en' ? 'Published: ' : language === 'hi' ? 'प्रकाशित: ' : 'प्रसिद्धी तारीख: '}
                        {new Date(latestNotice.created_at).toLocaleDateString(
                          language === 'en' ? 'en-IN' : `${language}-IN`,
                          { year: 'numeric', month: 'short', day: 'numeric' }
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
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
                  <span>{t.roadmapTimeline}</span>
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
                      <span>{t.requestDetailsLabel}</span>
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
                          {t.subCategoryLabel}
                        </span>
                        <span className="text-sm font-semibold">{currentRequest.subcategory || 'Not Available'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold opacity-60 block mb-1">
                          {t.submissionDateLabel}
                        </span>
                        <span className="text-sm font-semibold">
                          {new Date(currentRequest.createdAt).toLocaleDateString(
                            language === 'en' ? 'en-IN' : `${language}-IN`,
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
                      <div>
                        <span className="text-[10px] uppercase font-bold opacity-60 block mb-1">
                          {t.currentStatusLabel}
                        </span>
                        <span className={`inline-block px-3 py-0.5 rounded-full text-xs font-black uppercase ${
                          currentRequest.status === 'Action Initiated' || currentRequest.status === 'All stages completed'
                            ? (highContrast ? 'bg-emerald-955 text-emerald-400 border border-emerald-400' : 'bg-emerald-50 text-emerald-700 border border-emerald-200')
                            : currentRequest.status === 'Under Review' || currentRequest.status === 'AI Analysis' || currentRequest.status === 'Development Planning'
                            ? (highContrast ? 'bg-amber-955 text-amber-400 border border-amber-400' : 'bg-amber-50 text-amber-700 border border-amber-200')
                            : (highContrast ? 'bg-slate-900 text-yellow-300 border border-yellow-300' : 'bg-slate-100 text-slate-700 border border-slate-200')
                        }`}>
                          {currentRequest.status}
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
                      <strong>{language === 'en' ? 'Core Insight:' : language === 'hi' ? 'मुख्य अंतर्दृष्टि:' : 'मुख्य निष्कर्ष:'}</strong> {currentRequest.id === 'JSA-DEMO-0001' ? 
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
                      <span>{t.statusSummaryTitle}</span>
                    </h3>

                    <div className="space-y-5 text-xs">
                      <div>
                        <span className="opacity-60 block font-bold mb-1 uppercase tracking-wide text-[9px]">{t.currentStatusLabel}</span>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase ${
                          currentRequest.status === 'Action Initiated' || currentRequest.status === 'All stages completed'
                            ? (highContrast ? 'bg-emerald-955 text-emerald-400 border border-emerald-400' : 'bg-emerald-50 text-emerald-700 border border-emerald-200')
                            : currentRequest.status === 'Under Review' || currentRequest.status === 'AI Analysis' || currentRequest.status === 'Development Planning'
                            ? (highContrast ? 'bg-amber-955 text-amber-400 border border-amber-400' : 'bg-amber-50 text-amber-700 border border-amber-200')
                            : (highContrast ? 'bg-slate-900 text-yellow-300 border border-yellow-300' : 'bg-slate-100 text-slate-700 border border-slate-200')
                        }`}>
                          {currentRequest.status}
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
                            : 'bg-slate-55 border-slate-300 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        {detecting ? (
                          <span className="w-3.5 h-3.5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></span>
                        ) : (
                          <Compass className="h-4 w-4 text-blue-600" />
                        )}
                        <span>{detecting ? t.detectingText : t.detectMyLocationBtn}</span>
                      </button>
                    </div>

                    <div className={`p-2.5 rounded-lg border text-[10px] font-bold flex justify-between items-center mb-4 ${
                      highContrast ? 'bg-[#0f172a] border-yellow-500/20 text-yellow-300' : 'bg-slate-55 border-slate-200 text-slate-600'
                    }`}>
                      <span>Lat: {typeof currentRequest.coordinates?.lat === 'number' ? currentRequest.coordinates.lat.toFixed(5) : 'Not Available'}</span>
                      <span>Lng: {typeof currentRequest.coordinates?.lng === 'number' ? currentRequest.coordinates.lng.toFixed(5) : 'Not Available'}</span>
                      <span className="text-[#FF9933] font-extrabold uppercase animate-pulse">{t.gpsStreamActive}</span>
                    </div>

                    <div className="space-y-2 text-xs text-left">
                      <div className="flex justify-between py-1 border-b border-slate-100/5">
                        <span className="opacity-70 font-semibold">📍 {t.labelArea || 'Area'}:</span>
                        <span className="font-bold">{currentRequest.area || 'Not Available'}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100/5">
                        <span className="opacity-70 font-semibold">🏙 {t.labelCity || 'City'}:</span>
                        <span className="font-bold">{currentRequest.city || 'Not Available'}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100/5">
                        <span className="opacity-70 font-semibold">🗺 {t.labelDistrict || 'District'}:</span>
                        <span className="font-bold">{currentRequest.district || 'Not Available'}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100/5">
                        <span className="opacity-70 font-semibold">📍 {t.labelState || 'State'}:</span>
                        <span className="font-bold">{currentRequest.state || 'Not Available'}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="opacity-70 font-semibold">📮 {t.labelPincode || 'Pincode'}:</span>
                        <span className="font-bold">{currentRequest.pincode || 'Not Available'}</span>
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
                    {t.goiText}
                  </h1>
                  <h2 className="text-sm font-extrabold text-[#000080] tracking-tight mt-1">
                    JanSetu AI
                  </h2>
                  <p className="text-[10px] tracking-wide text-slate-500 font-bold uppercase mt-1">
                    {t.devPlatformSub}
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
                      <span className="font-black text-slate-800">
                        {[currentRequest.area, currentRequest.city, currentRequest.district, currentRequest.state, currentRequest.pincode].filter(val => val && val !== 'Not Available').join(', ') || 'Not Available'}
                      </span>
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
                      {t.descLabel}
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
                    <p className="font-bold">{t.receiptDisclaimerLabel}</p>
                    <p className="leading-tight mt-0.5">
                      {t.receiptDisclaimerText}
                    </p>
                  </div>
                  <div className="text-right self-end sm:self-auto border border-dashed border-slate-400 p-2 rounded bg-slate-50">
                    <div className="font-black text-[#000080] uppercase tracking-wider">{t.receiptSecureLabel}</div>
                    <div className="text-slate-400 font-mono mt-0.5">REF: {currentRequest.id ? currentRequest.id.substring(4) : 'N/A'}</div>
                    <div className="text-slate-400">{t.receiptStatusVerified}</div>
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
