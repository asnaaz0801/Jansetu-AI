import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/db';
import ashokaChakra from '../assets/ashoka-chakra.svg';
import { 
  ArrowLeft, 
  User, 
  MapPin, 
  Layers, 
  Star, 
  Calendar, 
  Image as ImageIcon,
  MessageSquare,
  FileText,
  Save,
  CheckCircle,
  AlertCircle,
  Volume2
} from 'lucide-react';

export default function MpComplaintDetails({ highContrast }) {
  const { referenceCode } = useParams();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  // MP Notice States
  const [noticeArea, setNoticeArea] = useState('');
  const [noticeCategory, setNoticeCategory] = useState('');
  const [noticeStatus, setNoticeStatus] = useState('');
  const [noticeText, setNoticeText] = useState('');
  const [publishingNotice, setPublishingNotice] = useState(false);
  const [publishStatus, setPublishStatus] = useState(null);
  const [allComplaints, setAllComplaints] = useState([]);

  // Map Refs
  const mapRef = useRef(null);
  const leafletMapInstance = useRef(null);

  const [error, setError] = useState(null);

  const handleSaveAIAnalysis = async (aiResult) => {
    if (!complaint) return;
    try {
      const { error: updateErr } = await supabase
        .from('issues')
        .update({ ai_analysis: aiResult })
        .eq('issue_id', complaint.issue_id);

      if (updateErr) throw updateErr;

      setComplaint(prev => ({
        ...prev,
        ai_analysis: aiResult
      }));
    } catch (err) {
      console.warn("Caching AI analysis failed (issues.ai_analysis column might not exist on remote Supabase instance yet). Local session will proceed in-memory:", err);
    }
  };

  const fetchComplaintDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      // Query by either reference_code or issue_id
      const { data, error: fetchErr } = await supabase
        .from('issues')
        .select('*')
        .or(`reference_code.eq."${referenceCode}",issue_id.eq."${referenceCode}"`)
        .maybeSingle();

      if (fetchErr) throw fetchErr;

      if (!data) {
        setError(`No complaint found with Reference ID: ${referenceCode}`);
        return;
      }

      setComplaint(data);
      setNoticeArea(data.area || '');
      setNoticeCategory(data.category || '');
      setNoticeStatus(data.status || 'Pending');

      // Fetch all unique areas and categories to populate the dropdown lists
      const { data: allData } = await supabase
        .from('issues')
        .select('area, category');
      if (allData) {
        setAllComplaints(allData);
      }
    } catch (err) {
      console.error("Error loading complaint details:", err);
      setError("Failed to fetch complaint details from database.");
    } finally {
      setLoading(false);
    }
  };

  const handlePublishNotice = async () => {
    if (!noticeArea) {
      setPublishStatus({ type: 'error', message: 'Please select an area.' });
      return;
    }
    if (!noticeCategory) {
      setPublishStatus({ type: 'error', message: 'Please select a category.' });
      return;
    }
    if (!noticeStatus) {
      setPublishStatus({ type: 'error', message: 'Please select a complaint status.' });
      return;
    }
    if (!noticeText.trim()) {
      setPublishStatus({ type: 'error', message: 'Please write the notice content.' });
      return;
    }

    setPublishingNotice(true);
    setPublishStatus(null);

    // Get MP profile from local session
    const sessionString = localStorage.getItem('mp_session');
    let mpName = 'Unknown MP';
    let mpConstituency = 'Unknown Constituency';
    try {
      const session = sessionString ? JSON.parse(sessionString) : null;
      if (session && session.loggedIn) {
        mpName = session.name || 'Unknown MP';
        mpConstituency = session.constituency || 'Unknown Constituency';
      }
    } catch (e) {
      console.error("Error reading MP session during notice publish:", e);
    }

    try {
      // 1. Insert notice
      const { error: insertErr } = await supabase
        .from('mp_notices')
        .insert({
          area: noticeArea,
          category: noticeCategory,
          status: noticeStatus,
          notice: noticeText.trim(),
          mp_name: mpName,
          constituency: mpConstituency,
          created_at: new Date().toISOString()
        });

      if (insertErr) {
        console.error("Failure happens during: Insert into mp_notices");
        console.error("Complete Supabase error object:", insertErr);
        setPublishStatus({ type: 'error', message: `Failed to insert notice: ${insertErr.message}` });
        return;
      }

      // Fetch matching complaints count before update
      const { data: matchedBefore } = await supabase
        .from('issues')
        .select('issue_id')
        .eq('area', noticeArea)
        .eq('category', noticeCategory);

      const matchingCount = matchedBefore ? matchedBefore.length : 0;

      // Update matching complaints in the existing issues table
      const { data: updatedRows, error: updateErr } = await supabase
        .from('issues')
        .update({ status: noticeStatus })
        .eq('area', noticeArea)
        .eq('category', noticeCategory)
        .select();

      const updatedCount = updatedRows ? updatedRows.length : 0;

      console.log('Selected Area:', noticeArea);
      console.log('Selected Category:', noticeCategory);
      console.log('Selected Status:', noticeStatus);
      console.log('Number of matching complaints found:', matchingCount);
      console.log('Number of rows updated:', updatedCount);

      if (updateErr) {
        console.error("Failure happens during: Update issues table");
        setPublishStatus({ type: 'error', message: `Failed to update complaints: ${updateErr.message}` });
        return;
      }

      // Refresh current complaint details so local status updates immediately
      await fetchComplaintDetails();

      const savedStatus = noticeStatus;
      setPublishStatus({
        type: 'success',
        message: `✅ Notice published successfully.\n\n✅ Updated all matching complaints to "${savedStatus}".`
      });
      setNoticeText('');
    } catch (err) {
      console.error("Failed to publish MP notice:", err);
      setPublishStatus({ type: 'error', message: 'Failed to publish notice. Database error.' });
    } finally {
      setPublishingNotice(false);
    }
  };

  const initLeafletMap = () => {
    if (!window.L || !mapRef.current || !complaint) return;

    // Clean up previous map if it exists
    if (leafletMapInstance.current) {
      leafletMapInstance.current.remove();
      leafletMapInstance.current = null;
    }

    try {
      const lat = parseFloat(complaint.latitude);
      const lng = parseFloat(complaint.longitude);

      if (isNaN(lat) || isNaN(lng)) return;

      const L = window.L;
      const map = L.map(mapRef.current, {
        center: [lat, lng],
        zoom: 14,
        zoomControl: false,
        attributionControl: false
      });

      // Add appropriate tiles
      if (highContrast) {
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          maxZoom: 20
        }).addTo(map);
      } else {
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19
        }).addTo(map);
      }

      // Add marker
      L.marker([lat, lng]).addTo(map);
      leafletMapInstance.current = map;
    } catch (e) {
      console.error("Leaflet map initialization error:", e);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchComplaintDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [referenceCode]);

  useEffect(() => {
    // If complaint is loaded and has lat/lng, render leaflet map
    if (complaint && complaint.latitude && complaint.longitude) {
      // Small timeout to allow element to render
      const timer = setTimeout(() => {
        initLeafletMap();
      }, 300);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [complaint]);

  const getStatusColorClass = (s) => {
    if (s === 'Resolved') return highContrast ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/50' : 'bg-emerald-50 text-emerald-700 border border-emerald-250';
    if (s === 'In Progress') return highContrast ? 'bg-amber-950/40 text-amber-400 border border-amber-500/50' : 'bg-amber-50 text-amber-700 border border-amber-250';
    if (s === 'Rejected') return highContrast ? 'bg-red-950/40 text-red-450 border border-red-500/50' : 'bg-red-50 text-red-700 border border-red-250';
    return highContrast ? 'bg-slate-900 border border-yellow-500/30 text-yellow-300' : 'bg-slate-50 text-slate-600 border border-slate-250';
  };

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto relative overflow-hidden flex flex-col">
      {/* Background Ashoka Chakra Watermark */}
      <div 
        className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-0 select-none opacity-3"
      >
        <img 
          src={ashokaChakra} 
          alt="" 
          className="w-[80%] max-w-[600px] aspect-square object-contain" 
        />
      </div>

      <div className="relative z-10 flex-1 flex flex-col">
        {/* Navigation / Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/mp/complaints"
            className={`inline-flex items-center space-x-2 text-xs font-bold border px-3 py-1.5 rounded-lg transition duration-200 cursor-pointer ${
              highContrast 
                ? 'border-yellow-500/50 text-yellow-300 bg-slate-900 hover:bg-yellow-500/10' 
                : 'border-slate-300 text-slate-700 bg-white hover:bg-slate-50 shadow-sm'
            }`}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Database</span>
          </Link>

          {complaint && (
            <div className="flex items-center space-x-2">
              <span className="text-[10px] uppercase font-bold opacity-60">Status badge:</span>
              <span className={`inline-flex px-2.5 py-0.5 text-[10px] rounded-full font-bold uppercase tracking-wider ${getStatusColorClass(complaint.status)}`}>
                {complaint.status || 'Pending'}
              </span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 space-y-4">
            <div className={`w-8 h-8 border-4 rounded-full animate-spin ${
              highContrast ? 'border-yellow-500/20 border-t-yellow-400' : 'border-slate-200 border-t-[#000080]'
            }`}></div>
            <p className="text-slate-400 text-xs font-bold">Querying record details...</p>
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-red-500 font-bold space-y-2 border border-dashed border-red-200 rounded-2xl bg-red-50/20">
            <AlertCircle className="h-8 w-8" />
            <span className="text-sm">{error}</span>
            <Link to="/mp/complaints" className="text-xs text-[#000080] underline font-bold mt-2">Return to list</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left & Middle Column: Core Complaint Details */}
            <div className="lg:col-span-2 space-y-6">
              

              {/* Title & Description Box */}
              <div className={`border rounded-2xl p-6 shadow-sm transition-all ${
                highContrast ? 'bg-[#1e293b] border-yellow-500/20 text-yellow-300' : 'bg-white border-slate-200 text-slate-800'
              }`}>
                <div className="flex items-center justify-between border-b pb-4 mb-4 border-slate-100/10">
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">
                      Reference ID: {complaint.reference_code || complaint.issue_id}
                    </span>
                    <h2 className={`text-xl font-black mt-1 ${highContrast ? 'text-white' : 'text-slate-850'}`}>
                      {complaint.title}
                    </h2>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2 opacity-65 text-xs font-bold">
                    <FileText className="h-4 w-4" />
                    <span>Citizen Description</span>
                  </div>
                  <p className="text-sm opacity-90 leading-relaxed whitespace-pre-wrap font-medium">
                    {complaint.description || "No description provided by the citizen."}
                  </p>
                </div>
              </div>

              {/* Citizen Details & Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Citizen Information Card */}
                <div className={`border rounded-2xl p-5 shadow-sm transition-all ${
                  highContrast ? 'bg-[#1e293b] border-yellow-500/20 text-yellow-300' : 'bg-white border-slate-200 text-slate-800'
                }`}>
                  <h3 className="text-xs font-black uppercase tracking-wider mb-4 flex items-center space-x-2 text-slate-400">
                    <User className="h-4 w-4 text-[#FF9933]" />
                    <span>Citizen Information</span>
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="opacity-60 block">Full Name</span>
                      <span className="font-bold text-sm block mt-0.5">{complaint.citizen_name || "Anonymous Citizen"}</span>
                    </div>
                    <div>
                      <span className="opacity-60 block">Submitted On</span>
                      <span className="font-bold block mt-0.5 flex items-center space-x-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>{new Date(complaint.created_at).toLocaleString()}</span>
                      </span>
                    </div>
                    <div>
                      <span className="opacity-60 block">Complaint Support</span>
                      <span className="font-bold text-emerald-600 block mt-0.5">{complaint.votes || 0} Upvotes / Support</span>
                    </div>
                  </div>
                </div>

                {/* AI Analysis Parameters */}
                <div className={`border rounded-2xl p-5 shadow-sm transition-all ${
                  highContrast ? 'bg-[#1e293b] border-yellow-500/20 text-yellow-300' : 'bg-white border-slate-200 text-slate-800'
                }`}>
                  <h3 className="text-xs font-black uppercase tracking-wider mb-4 flex items-center space-x-2 text-slate-400">
                    <Layers className="h-4 w-4 text-[#000080] dark:text-yellow-400" />
                    <span>AI Model Analysis</span>
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="opacity-60 block">AI Category Model</span>
                      <span className="font-bold text-sm block mt-0.5">{complaint.category || "Unassigned"}</span>
                    </div>
                    <div>
                      <span className="opacity-60 block">AI Severity Rank</span>
                      <div className="flex items-center space-x-1.5 mt-0.5">
                        <span className="inline-flex items-center space-x-0.5 px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/15 font-black">
                          <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                          <span>{complaint.severity || 3} / 5</span>
                        </span>
                        <span className="text-[10px] opacity-70">
                          {complaint.severity >= 4 ? "(Critical Issue)" : complaint.severity <= 2 ? "(Minor Issue)" : "(Standard)"}
                        </span>
                      </div>
                    </div>
                    {complaint.assigned_mp && (
                      <div>
                        <span className="opacity-60 block">Assigned Representative</span>
                        <span className="font-bold text-[#138808] block mt-0.5 truncate">{complaint.assigned_mp}</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Photo & Image Gallery Card */}
              <div className={`border rounded-2xl p-5 shadow-sm transition-all ${
                highContrast ? 'bg-[#1e293b] border-yellow-500/20 text-yellow-300' : 'bg-white border-slate-200 text-slate-800'
              }`}>
                <h3 className="text-xs font-black uppercase tracking-wider mb-4 flex items-center space-x-2 text-slate-400">
                  <ImageIcon className="h-4 w-4 text-[#138808]" />
                  <span>Uploaded Issue Evidence</span>
                </h3>
                {complaint.image_url ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-[350px] flex justify-center bg-slate-50 dark:bg-slate-950">
                    <img 
                      src={complaint.image_url} 
                      alt="Complaint Evidence" 
                      className="max-w-full max-h-[350px] object-contain shadow-sm"
                    />
                  </div>
                ) : (
                  <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center text-slate-400 flex flex-col items-center justify-center space-y-1">
                    <ImageIcon className="h-8 w-8 opacity-40" />
                    <span className="text-xs font-semibold">No image evidence uploaded for this complaint.</span>
                  </div>
                )}
              </div>

            </div>

            {/* Right Column: MP Action Center & Location */}
            <div className="space-y-6">
              
              {/* OFFICIAL MP PUBLIC NOTICE PANEL */}
              <div className={`border rounded-2xl p-5 shadow-sm transition-all ${
                highContrast ? 'bg-[#1e293b] border-yellow-500/20 text-yellow-300' : 'bg-white border-slate-200 text-slate-850'
              }`}>
                <h3 className="text-xs font-black uppercase tracking-wider mb-4 flex items-center space-x-2 text-slate-400">
                  <Volume2 className="h-4 w-4 text-[#FF9933]" />
                  <span>📢 Official MP Public Notice</span>
                </h3>

                <div className="space-y-4">
                  {/* Area Dropdown */}
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                      Select Area
                    </label>
                    <select
                      value={noticeArea}
                      onChange={(e) => setNoticeArea(e.target.value)}
                      className={`w-full border rounded-xl px-3 py-2 text-xs font-semibold focus:ring-1 focus:ring-blue-500 outline-none ${
                        highContrast ? 'bg-slate-950 border-yellow-500/50 text-yellow-300' : 'bg-slate-50 border-slate-300 text-slate-700'
                      }`}
                    >
                      <option value="">-- Choose Area --</option>
                      {[...new Set(allComplaints.map(c => c.area).filter(Boolean))].sort().map(area => (
                        <option key={area} value={area}>{area}</option>
                      ))}
                    </select>
                  </div>

                  {/* Category Dropdown */}
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                      Select Category
                    </label>
                    <select
                      value={noticeCategory}
                      onChange={(e) => setNoticeCategory(e.target.value)}
                      className={`w-full border rounded-xl px-3 py-2 text-xs font-semibold focus:ring-1 focus:ring-blue-500 outline-none ${
                        highContrast ? 'bg-slate-950 border-yellow-500/50 text-yellow-300' : 'bg-slate-50 border-slate-300 text-slate-700'
                      }`}
                    >
                      <option value="">-- Choose Category --</option>
                      {[...new Set(allComplaints.map(c => c.category).filter(Boolean))].sort().map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Complaint Status Dropdown */}
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                      Complaint Status
                    </label>
                    <select
                      value={noticeStatus}
                      onChange={(e) => setNoticeStatus(e.target.value)}
                      className={`w-full border rounded-xl px-3 py-2 text-xs font-semibold focus:ring-1 focus:ring-blue-500 outline-none ${
                        highContrast ? 'bg-slate-950 border-yellow-500/50 text-yellow-300' : 'bg-slate-50 border-slate-300 text-slate-700'
                      }`}
                    >
                      <option value="">-- Choose Status --</option>
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>

                  {/* Notice Textarea */}
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                      Notice Content
                    </label>
                    <textarea
                      placeholder="Write an official public notice for all citizens belonging to the selected Area and Category."
                      value={noticeText}
                      onChange={(e) => setNoticeText(e.target.value)}
                      rows={4}
                      className={`w-full border rounded-xl px-3 py-2 text-xs font-semibold focus:ring-1 focus:ring-blue-500 outline-none ${
                        highContrast ? 'bg-slate-950 border-yellow-500/50 text-yellow-300' : 'bg-slate-50 border-slate-300 text-slate-700'
                      }`}
                    />
                  </div>

                  {/* Publish Notice Button */}
                  <button
                    onClick={handlePublishNotice}
                    disabled={publishingNotice}
                    className={`w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-xs font-black cursor-pointer transition shadow-md ${
                      highContrast
                        ? 'bg-yellow-400 text-black border-yellow-400 hover:bg-yellow-300'
                        : 'bg-[#000080] text-white border-[#000080] hover:bg-[#000080]/90'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {publishingNotice ? 'Publishing...' : '📢 Publish Notice'}
                  </button>

                  {publishStatus && (
                    <p className={`text-[10px] font-extrabold text-center mt-1 whitespace-pre-line ${
                      publishStatus.type === 'success' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {publishStatus.message}
                    </p>
                  )}
                </div>
              </div>

              {/* LOCATION DETAILS */}
              <div className={`border rounded-2xl p-5 shadow-sm transition-all ${
                highContrast ? 'bg-[#1e293b] border-yellow-500/20 text-yellow-300' : 'bg-white border-slate-200 text-slate-800'
              }`}>
                <h3 className="text-xs font-black uppercase tracking-wider mb-4 flex items-center space-x-2 text-slate-400">
                  <MapPin className="h-4 w-4 text-[#FF9933]" />
                  <span>Geospatial Location</span>
                </h3>

                <div className="space-y-4 text-xs font-bold">
                  {/* Map placeholder/container */}
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 h-44 bg-slate-50 dark:bg-slate-950">
                    {complaint.latitude && complaint.longitude ? (
                      <div ref={mapRef} className="w-full h-full z-10" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-450 text-[10px] space-y-1">
                        <MapPin className="h-6 w-6 opacity-30" />
                        <span>No coordinates provided for map.</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100/10">
                    <div>
                      <span className="opacity-60 text-[10px] block uppercase">State</span>
                      <span className="font-extrabold text-xs block mt-0.5 truncate">{complaint.state || "N/A"}</span>
                    </div>
                    <div>
                      <span className="opacity-60 text-[10px] block uppercase">District</span>
                      <span className="font-extrabold text-xs block mt-0.5 truncate">{complaint.district || "N/A"}</span>
                    </div>
                    <div>
                      <span className="opacity-60 text-[10px] block uppercase">City / Town</span>
                      <span className="font-extrabold text-xs block mt-0.5 truncate">{complaint.city || "N/A"}</span>
                    </div>
                    <div>
                      <span className="opacity-60 text-[10px] block uppercase">Area</span>
                      <span className="font-extrabold text-xs block mt-0.5 truncate">{complaint.area || "N/A"}</span>
                    </div>
                    <div>
                      <span className="opacity-60 text-[10px] block uppercase">Pincode</span>
                      <span className="font-extrabold text-xs block mt-0.5 truncate">{complaint.pincode || "N/A"}</span>
                    </div>
                    {complaint.latitude && complaint.longitude && (
                      <div>
                        <span className="opacity-60 text-[10px] block uppercase">GPS Coordinates</span>
                        <span className="font-extrabold text-[10px] block mt-0.5 text-blue-600 dark:text-yellow-400">
                          {parseFloat(complaint.latitude).toFixed(4)}, {parseFloat(complaint.longitude).toFixed(4)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
