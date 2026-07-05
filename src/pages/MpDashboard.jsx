import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/db';
import { translations } from '../lib/translations';
import ConstituencyMap from '../components/ConstituencyMap';
import AIAnalyzerModal from '../components/AIAnalyzerModal';
import emblemOfIndia from '../assets/emblem-of-india.svg';
import ashokaChakra from '../assets/ashoka-chakra.svg';
import {
  Inbox,
  CheckCircle,
  FileText,
  MapPin,
  Filter,
  RefreshCw,
  Layers,
  AlertOctagon,
  Star,
  Sparkles
} from 'lucide-react';

export default function MpDashboard({ language, highContrast }) {
  const navigate = useNavigate();
  const location = useLocation();
  const t = translations[language] || translations['en'];
  const [priorities, setPriorities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedSeverity, setSelectedSeverity] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [focusedComplaint, setFocusedComplaint] = useState(null);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (location.state?.scrollTo) {
      const timer = setTimeout(() => {
        scrollToSection(location.state.scrollTo);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [location]);

  // AI Area Analyzer Dropdowns
  const [reportState, setReportState] = useState('All');
  const [reportDistrict, setReportDistrict] = useState('All');
  const [reportCity, setReportCity] = useState('All');
  const [reportArea, setReportArea] = useState('All');

  // AI Area Analyzer Modal State
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [selectedLocationForAI, setSelectedLocationForAI] = useState('');
  const [aiModalComplaintsCount, setAiModalComplaintsCount] = useState(0);
  const [aiModalTotalVotes, setAiModalTotalVotes] = useState(0);

  const handleOpenAIModal = (location, count, votes) => {
    setSelectedLocationForAI(location);
    setAiModalComplaintsCount(count);
    setAiModalTotalVotes(votes);
    setIsAIModalOpen(true);
  };

  const loadPriorities = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      // Map Supabase rows to local priorities format
      const mapped = (data || []).map((row) => ({
        id: row.reference_code || row.issue_id,
        title: row.title,
        description: row.description,
        category: row.category,
        location: row.constituency || 'Central Delhi',
        state: row.state || 'Delhi',
        district: row.district || '',
        city: row.city || '',
        area: row.area || '',
        submittedBy: row.citizen_name || 'Anonymous Citizen',
        votes: row.votes || 0,
        severity: row.severity || 3,
        status: row.status === 'open' ? 'Pending' : (row.status === 'resolved' ? 'Resolved' : (row.status || 'Pending')),
        createdAt: row.created_at,
        lat: row.latitude ? parseFloat(row.latitude) : null,
        lng: row.longitude ? parseFloat(row.longitude) : null,
        imageUrl: row.image_url
      }));
      setPriorities(mapped);
    } catch (err) {
      console.error('Error fetching priorities from Supabase:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadPriorities();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      const { data, error } = await supabase
        .from('issues')
        .update({ status: newStatus })
        .or(`reference_code.eq.${id},issue_id.eq.${id}`)
        .select()
        .single();

      if (error) throw error;

      const updated = {
        id: data.reference_code || data.issue_id,
        title: data.title,
        description: data.description,
        category: data.category,
        location: data.constituency || 'Central Delhi',
        state: data.state || 'Delhi',
        district: data.district || '',
        city: data.city || '',
        area: data.area || '',
        submittedBy: data.citizen_name || 'Anonymous Citizen',
        votes: data.votes || 0,
        severity: data.severity || 3,
        status: data.status === 'open' ? 'Pending' : (data.status === 'resolved' ? 'Resolved' : (data.status || 'Pending')),
        createdAt: data.created_at,
        lat: data.latitude ? parseFloat(data.latitude) : null,
        lng: data.longitude ? parseFloat(data.longitude) : null,
        imageUrl: data.image_url
      };

      setPriorities((prev) => prev.map((p) => (p.id === id ? updated : p)));
    } catch (err) {
      console.error('Error updating status in Supabase:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Unique dropdown options collected from Priorities
  const uniqueStates = ['All', ...new Set(priorities.map(p => p.state).filter(Boolean))];
  
  const uniqueDistricts = ['All', ...new Set(priorities
    .filter(p => reportState === 'All' || p.state === reportState)
    .map(p => p.district)
    .filter(Boolean)
  )];
  
  const uniqueCities = ['All', ...new Set(priorities
    .filter(p => (reportState === 'All' || p.state === reportState) && (reportDistrict === 'All' || p.district === reportDistrict))
    .map(p => p.city)
    .filter(Boolean)
  )];
  
  const uniqueAreas = ['All', ...new Set(priorities
    .filter(p => (reportState === 'All' || p.state === reportState) && (reportDistrict === 'All' || p.district === reportDistrict) && (reportCity === 'All' || p.city === reportCity))
    .map(p => p.area)
    .filter(Boolean)
  )];

  // Filter complaints based on the selected geographic options
  const getSelectedRegionMetrics = () => {
    const filtered = priorities.filter(p => {
      const stateMatch = reportState === 'All' || p.state === reportState;
      const districtMatch = reportDistrict === 'All' || p.district === reportDistrict;
      const cityMatch = reportCity === 'All' || p.city === reportCity;
      const areaMatch = reportArea === 'All' || p.area === reportArea;
      return stateMatch && districtMatch && cityMatch && areaMatch;
    });
    
    return {
      count: filtered.length,
      votes: filtered.reduce((acc, curr) => acc + (curr.votes || 0), 0)
    };
  };

  const { count: reportComplaintsCount, votes: reportTotalVotes } = getSelectedRegionMetrics();

  const handleGenerateAreaReport = () => {
    // Formulate a structured location name
    const locationParts = [reportArea, reportCity, reportDistrict, reportState]
      .filter(val => val && val !== 'All');
    
    const locationStr = locationParts.join(', ') || 'All Regions';
    handleOpenAIModal(locationStr, reportComplaintsCount, reportTotalVotes);
  };

  // Stats calculation
  const totalCount = priorities.length;
  const resolvedCount = priorities.filter((p) => p.status === 'Resolved').length;
  const pendingCount = priorities.filter((p) => p.status === 'Pending').length;
  // High priority: severity >= 4 or Public Safety category
  const highPriorityCount = priorities.filter(
    (p) => (p.severity && p.severity >= 4) || p.category === 'Public Safety'
  ).length;

  const categories = ['All', 'Roads', 'Garbage', 'Water Supply', 'Electricity', 'Street Lights', 'Drainage', 'Public Safety'];
  const statuses = ['All', 'Pending', 'In Progress', 'Resolved'];
  const severities = ['All', '1', '2', '3', '4', '5'];

  // Apply filters to data list
  const filteredPriorities = priorities.filter((p) => {
    const categoryMatch = selectedCategory === 'All' || p.category === selectedCategory;
    const statusMatch = selectedStatus === 'All' || p.status === selectedStatus;
    const severityMatch = selectedSeverity === 'All' || (p.severity && p.severity.toString() === selectedSeverity);
    
    let dateMatch = true;
    if (startDate) {
      dateMatch = dateMatch && new Date(p.createdAt) >= new Date(startDate);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateMatch = dateMatch && new Date(p.createdAt) <= end;
    }
    
    return categoryMatch && statusMatch && severityMatch && dateMatch;
  });

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto relative overflow-hidden">
        {/* 3% Opacity Ashoka Chakra Watermark */}
        <div 
          className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-0 select-none"
          style={{ opacity: 0.03 }}
        >
          <img 
            src={ashokaChakra} 
            alt="" 
            className="w-[80%] max-w-[600px] aspect-square object-contain select-none pointer-events-none" 
          />
        </div>

        <div id="mp-dashboard-overview" className="relative z-10">
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <img src={emblemOfIndia} alt="National Emblem of India" className="h-16 w-auto select-none pointer-events-none object-contain" />
            </div>
            <button
              onClick={loadPriorities}
              className={`flex items-center space-x-2 border px-4 py-2.5 rounded-xl text-sm font-bold transition duration-200 cursor-pointer ${
                highContrast 
                  ? 'border-yellow-500/50 text-yellow-300 bg-slate-900 hover:bg-yellow-500/10' 
                  : 'border-slate-300 text-slate-700 bg-white hover:bg-slate-50 shadow-sm'
              }`}
            >
              <RefreshCw className="h-4 w-4" />
              <span>{t.dbReloadFeeds}</span>
            </button>
          </header>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Card: Total Complaints */}
          <div className={`border rounded-2xl p-5 relative overflow-hidden transition-all ${
            highContrast 
              ? 'bg-[#1e293b] border-yellow-500/20 text-yellow-300 shadow-yellow-500/5' 
              : 'bg-white border-slate-200 text-slate-800 shadow-sm'
          }`}>
            <div className="absolute top-4 right-4 opacity-25 text-blue-600">
              <Inbox className="h-8 w-8" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-wider opacity-65">{t.dbCardTotal}</p>
            <p className="text-3xl font-black mt-2">{totalCount}</p>
            <p className="text-[11px] opacity-75 mt-2 flex items-center space-x-1">
              <span>{t.dbCardTotalSub}</span>
            </p>
          </div>

          {/* Card: Resolved */}
          <div className={`border rounded-2xl p-5 relative overflow-hidden transition-all ${
            highContrast 
              ? 'bg-[#1e293b] border-yellow-500/20 text-yellow-300 shadow-yellow-500/5' 
              : 'bg-white border-slate-200 text-slate-800 shadow-sm'
          }`}>
            <div className="absolute top-4 right-4 opacity-25 text-emerald-600">
              <CheckCircle className="h-8 w-8" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-wider opacity-65">{t.dbCardResolved}</p>
            <p className="text-3xl font-black text-emerald-600 mt-2">{resolvedCount}</p>
            <p className="text-[11px] text-emerald-600 font-bold mt-2">{t.dbCardResolvedSub}</p>
          </div>

          {/* Card: Pending */}
          <div className={`border rounded-2xl p-5 relative overflow-hidden transition-all ${
            highContrast 
              ? 'bg-[#1e293b] border-yellow-500/20 text-yellow-300 shadow-yellow-500/5' 
              : 'bg-white border-slate-200 text-slate-800 shadow-sm'
          }`}>
            <div className="absolute top-4 right-4 opacity-25 text-amber-500">
              <FileText className="h-8 w-8" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-wider opacity-65">{t.dbCardPending}</p>
            <p className="text-3xl font-black text-amber-600 mt-2">{pendingCount}</p>
            <p className="text-[11px] text-amber-600 font-bold mt-2">{t.dbCardPendingSub}</p>
          </div>

          {/* Card: High Priority */}
          <div className={`border rounded-2xl p-5 relative overflow-hidden transition-all ${
            highContrast 
              ? 'bg-[#1e293b] border-yellow-500/20 text-yellow-300 shadow-yellow-500/5' 
              : 'bg-white border-slate-200 text-slate-800 shadow-sm'
          }`}>
            <div className="absolute top-4 right-4 opacity-25 text-red-600">
              <AlertOctagon className="h-8 w-8" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-wider opacity-65">{t.dbCardHigh}</p>
            <p className="text-3xl font-black text-red-600 mt-2">{highPriorityCount}</p>
            <p className="text-[11px] text-red-600 font-bold mt-2">{t.dbCardHighSub}</p>
          </div>
        </section>

        {/* AI Area Action Planner */}
        <div id="mp-ai-planner" className={`border rounded-2xl shadow-md p-6 mb-8 transition-all ${
          highContrast 
            ? 'bg-[#1e293b] border-yellow-500/20 text-yellow-300' 
            : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <div className="flex items-center space-x-3 mb-4">
            <div className={`p-2 rounded-xl ${
              highContrast ? 'bg-yellow-500/10' : 'bg-indigo-50'
            }`}>
              <Sparkles className={`h-5 w-5 ${highContrast ? 'text-yellow-400' : 'text-indigo-600'}`} />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">{t.dbPlannerTitle}</h2>
              <p className="text-xs opacity-70 font-semibold mt-0.5">
                {t.dbPlannerSub}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* State Select */}
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400">{t.labelState}</label>
              <select
                value={reportState}
                onChange={(e) => {
                  setReportState(e.target.value);
                  setReportDistrict('All');
                  setReportCity('All');
                  setReportArea('All');
                }}
                className={`w-full border rounded-xl px-3 py-2.5 text-xs font-bold focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer ${
                  highContrast 
                    ? 'bg-slate-950 border-yellow-500/50 text-yellow-300' 
                    : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {uniqueStates.map((s) => (
                  <option key={s} value={s}>
                     {s === 'All' ? t.dbOptionAll + ' States' : s}
                  </option>
                ))}
              </select>
            </div>

            {/* District Select */}
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400">{t.labelDistrict}</label>
              <select
                value={reportDistrict}
                onChange={(e) => {
                  setReportDistrict(e.target.value);
                  setReportCity('All');
                  setReportArea('All');
                }}
                className={`w-full border rounded-xl px-3 py-2.5 text-xs font-bold focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer ${
                  highContrast 
                    ? 'bg-slate-950 border-yellow-500/50 text-yellow-300' 
                    : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {uniqueDistricts.map((d) => (
                  <option key={d} value={d}>
                    {d === 'All' ? t.dbOptionAll + ' Districts' : d}
                  </option>
                ))}
              </select>
            </div>

            {/* City Select */}
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400">{t.labelCity}</label>
              <select
                value={reportCity}
                onChange={(e) => {
                  setReportCity(e.target.value);
                  setReportArea('All');
                }}
                className={`w-full border rounded-xl px-3 py-2.5 text-xs font-bold focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer ${
                  highContrast 
                    ? 'bg-slate-950 border-yellow-500/50 text-yellow-300' 
                    : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {uniqueCities.map((c) => (
                  <option key={c} value={c}>
                    {c === 'All' ? t.dbOptionAll + ' Cities' : c}
                  </option>
                ))}
              </select>
            </div>

            {/* Area Select */}
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400">{t.labelArea}</label>
              <select
                value={reportArea}
                onChange={(e) => setReportArea(e.target.value)}
                className={`w-full border rounded-xl px-3 py-2.5 text-xs font-bold focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer ${
                  highContrast 
                    ? 'bg-slate-950 border-yellow-500/50 text-yellow-300' 
                    : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {uniqueAreas.map((a) => (
                  <option key={a} value={a}>
                    {a === 'All' ? t.dbOptionAll + ' Areas' : a}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-150 dark:border-slate-800">
            <div className="text-xs opacity-75 font-semibold leading-relaxed">
              <span className="font-extrabold uppercase text-[9px] tracking-wider text-slate-400 block mb-1">{t.dbScopeLabel}</span>
              {t.dbScopeSelectedLocation}: <span className="font-bold text-[#FF9933]">{[reportArea, reportCity, reportDistrict, reportState].filter(val => val && val !== 'All').join(', ') || 'All Regions'}</span>
              <span className="mx-2">•</span>
              {t.dbScopeComplaints}: <span className="font-bold text-[#138808]">{reportComplaintsCount}</span>
              <span className="mx-2">•</span>
              {t.dbScopeTotalVotes}: <span className="font-bold text-[#000080] dark:text-yellow-300">{reportTotalVotes}</span>
            </div>

            <button
              onClick={handleGenerateAreaReport}
              className={`w-full sm:w-auto inline-flex items-center justify-center space-x-2 font-bold py-2.5 px-6 rounded-xl border transition-all duration-200 hover:scale-[1.01] cursor-pointer shadow-md text-xs ${
                highContrast
                  ? 'bg-yellow-400 text-black border-yellow-400 hover:bg-yellow-300'
                  : 'bg-[#000080] text-white border-[#000080] hover:bg-[#000080]/90 hover:shadow-lg'
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span>{t.dbBtnGeneratePlan}</span>
            </button>
          </div>
        </div>

        {/* Live Leaflet Map Component */}
        <div className="mb-8">
          <ConstituencyMap 
            complaints={filteredPriorities} 
            highContrast={highContrast} 
            onUpdateStatus={handleStatusChange} 
            language={language}
            focusedComplaint={focusedComplaint}
          />
        </div>

        {/* Triage Workspace */}
        <div id="mp-triage-workspace" className={`border rounded-2xl shadow-md overflow-hidden transition-all ${
          highContrast 
            ? 'bg-[#1e293b] border-yellow-500/20 text-yellow-300' 
            : 'bg-white border-slate-200 text-slate-800'
        }`}>
          {/* Workspace Filters Header & Inputs */}
          <div className={`p-5 border-b space-y-4 ${
            highContrast ? 'border-yellow-500/20' : 'border-slate-100'
          }`}>
            <div className="flex items-center space-x-3">
              <Filter className="h-4.5 w-4.5 text-[#000080] dark:text-yellow-400" />
              <span className="font-bold text-base">{t.dbFiltersTitle}</span>
            </div>

            {/* Filter controls row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Category Filter */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">{t.categoryLabel}</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className={`w-full border rounded-xl px-3 py-2 text-xs font-bold focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer ${
                    highContrast 
                      ? 'bg-slate-950 border-yellow-500/50 text-yellow-300' 
                      : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c === 'All' ? t.dbOptionAll + ' Categories' : c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">{t.dbColStatus}</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className={`w-full border rounded-xl px-3 py-2 text-xs font-bold focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer ${
                    highContrast 
                      ? 'bg-slate-950 border-yellow-500/50 text-yellow-300' 
                      : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {s === 'All' ? t.dbOptionAll + ' Statuses' : s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Severity Filter */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">{t.colSeverity || 'Severity'}</label>
                <select
                  value={selectedSeverity}
                  onChange={(e) => setSelectedSeverity(e.target.value)}
                  className={`w-full border rounded-xl px-3 py-2 text-xs font-bold focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer ${
                    highContrast 
                      ? 'bg-slate-950 border-yellow-500/50 text-yellow-300' 
                      : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {severities.map((sev) => (
                    <option key={sev} value={sev}>
                      {sev === 'All' ? 'All Severities' : `Severity: ${sev}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range Filters */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Date Range</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={`w-full border rounded-xl px-2 py-1.5 text-xs font-semibold focus:ring-1 focus:ring-blue-500 outline-none ${
                      highContrast 
                        ? 'bg-slate-950 border-yellow-500/50 text-yellow-300' 
                        : 'bg-slate-50 border-slate-300 text-slate-700'
                    }`}
                    placeholder="Start"
                  />
                  <span className="opacity-50 text-xs">to</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className={`w-full border rounded-xl px-2 py-1.5 text-xs font-semibold focus:ring-1 focus:ring-blue-500 outline-none ${
                      highContrast 
                        ? 'bg-slate-950 border-yellow-500/50 text-yellow-300' 
                        : 'bg-slate-50 border-slate-300 text-slate-700'
                    }`}
                    placeholder="End"
                  />
                </div>
              </div>
            </div>

            {/* Clear Filters helper row */}
            {(selectedCategory !== 'All' || selectedStatus !== 'All' || selectedSeverity !== 'All' || startDate || endDate) && (
              <div className="flex justify-end pt-1">
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setSelectedStatus('All');
                    setSelectedSeverity('All');
                    setStartDate('');
                    setEndDate('');
                  }}
                  className="text-xs text-blue-600 dark:text-yellow-400 hover:underline font-bold"
                >
                  Clear all active filters
                </button>
              </div>
            )}
          </div>

          {/* Table / List View */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className={`w-8 h-8 border-4 rounded-full animate-spin ${
                highContrast ? 'border-yellow-500/20 border-t-yellow-400' : 'border-slate-200 border-t-blue-600'
              }`}></div>
              <p className="text-slate-400 text-xs font-bold">{t.dbAlertLoading}</p>
            </div>
          ) : filteredPriorities.length === 0 ? (
            <div className="py-20 text-center text-slate-400 text-sm font-semibold">
              {t.dbAlertNoComplaints}
            </div>
          ) : (
            <div className={`divide-y ${highContrast ? 'divide-yellow-500/20' : 'divide-slate-100'}`}>
              {filteredPriorities.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setFocusedComplaint({ id: item.id, timestamp: Date.now() })}
                  className={`p-5 flex flex-col lg:flex-row gap-5 items-start justify-between transition duration-150 cursor-pointer ${
                    highContrast ? 'hover:bg-yellow-500/5' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="space-y-2.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`flex items-center space-x-1 text-[10px] font-bold border px-2 py-0.5 rounded ${
                        highContrast ? 'bg-slate-950 border-yellow-500/30' : 'bg-slate-50 border-slate-200 text-slate-500'
                      }`}>
                        <Layers className="h-3 w-3 text-[#FF9933]" />
                        <span>{item.category}</span>
                      </span>

                      <span className={`flex items-center space-x-1 text-[10px] font-bold border px-2 py-0.5 rounded ${
                        highContrast ? 'bg-slate-950 border-yellow-500/30' : 'bg-slate-50 border-slate-200 text-slate-500'
                      }`}>
                        <MapPin className="h-3 w-3 text-[#138808]" />
                        <span>{item.location}</span>
                      </span>

                      <span className="text-[10px] font-bold opacity-60">Votes: {item.votes}</span>
                      
                      {/* Severity stars display */}
                      <span className="flex items-center gap-0.5 ml-2 text-[10px] font-bold bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded border border-amber-500/20">
                        <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                        <span>Severity {item.severity}/5</span>
                      </span>
                    </div>

                    <h3 className={`text-base font-bold flex flex-wrap items-center justify-between gap-2 ${highContrast ? 'text-white' : 'text-slate-800'}`}>
                      <span className="flex items-center">
                        <span className="text-xs font-black text-slate-400 mr-2 uppercase">{item.id}</span>
                        <span>{item.title}</span>
                      </span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/mp/complaints/${item.id}`);
                        }}
                        className="text-xs font-bold text-blue-650 hover:text-blue-800 dark:text-yellow-450 dark:hover:text-yellow-300 hover:underline flex items-center cursor-pointer bg-transparent border-none"
                        title="View Full Details"
                      >
                        Details ↗
                      </button>
                    </h3>
                    <p className="text-xs md:text-sm opacity-85 leading-relaxed max-w-3xl">{item.description}</p>

                    <div className="text-[10px] opacity-60 font-semibold">
                      <span>{t.labelSubmittedBy} {item.submittedBy || t.labelAnonymousCitizen}</span>
                      <span className="mx-2">•</span>
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Admin Triage Actions */}
                  <div 
                    onClick={(e) => e.stopPropagation()} 
                    className="w-full lg:w-auto flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch gap-2.5 sm:self-center lg:self-auto xl:self-center"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider block mb-1 lg:hidden xl:block self-center mr-2 opacity-75">
                      Triage Status:
                    </span>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStatusChange(item.id, 'Pending')}
                        disabled={updatingId === item.id || item.status === 'Pending'}
                        className={`flex-1 text-center text-xs px-3.5 py-2 rounded-lg font-bold transition cursor-pointer ${
                          item.status === 'Pending'
                            ? (highContrast ? 'bg-slate-900 border border-yellow-500/50 text-slate-500 cursor-default' : 'bg-slate-100 text-slate-400 cursor-default border border-slate-200')
                            : (highContrast ? 'bg-slate-950 hover:bg-slate-900 text-yellow-300 border border-yellow-500/45' : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200')
                        }`}
                      >
                        {t.dbOptionPending}
                      </button>

                      <button
                        onClick={() => handleStatusChange(item.id, 'In Progress')}
                        disabled={updatingId === item.id || item.status === 'In Progress'}
                        className={`flex-1 text-center text-xs px-3.5 py-2 rounded-lg font-bold transition cursor-pointer ${
                          item.status === 'In Progress'
                            ? (highContrast ? 'bg-amber-950/40 text-amber-400 border border-amber-500/50 cursor-default' : 'bg-amber-100 text-amber-700 border border-amber-200 cursor-default')
                            : 'bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-200'
                        }`}
                      >
                        {t.dbOptionInProgress}
                      </button>

                      <button
                        onClick={() => handleStatusChange(item.id, 'Resolved')}
                        disabled={updatingId === item.id || item.status === 'Resolved'}
                        className={`flex-1 text-center text-xs px-3.5 py-2 rounded-lg font-bold transition cursor-pointer ${
                          item.status === 'Resolved'
                            ? (highContrast ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/50 cursor-default' : 'bg-emerald-100 text-emerald-700 border border-emerald-200 cursor-default')
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200'
                        }`}
                      >
                        {t.dbOptionResolved}
                      </button>
                    </div>

                    {(item.status === 'Pending' || item.status === 'In Progress') && (
                      <button
                        onClick={() => handleStatusChange(item.id, 'resolved')}
                        disabled={updatingId === item.id}
                        className={`text-center text-xs px-3.5 py-2 rounded-lg font-black transition cursor-pointer flex items-center justify-center shadow-xs ${
                          highContrast
                            ? 'bg-yellow-400 hover:bg-yellow-500 text-black'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        {updatingId === item.id ? 'Updating...' : 'Mark as Resolved'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        </div>

        {/* AI Area Analyzer Modal */}
        <AIAnalyzerModal 
          isOpen={isAIModalOpen}
          onClose={() => setIsAIModalOpen(false)}
          selectedLocation={selectedLocationForAI}
          stateFilter={reportState}
          districtFilter={reportDistrict}
          cityFilter={reportCity}
          areaFilter={reportArea}
          complaintsCount={aiModalComplaintsCount}
          totalVotes={aiModalTotalVotes}
          highContrast={highContrast}
          language={language}
        />
    </div>
  );
}
