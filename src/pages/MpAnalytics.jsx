import { useState, useEffect } from 'react';
import { supabase } from '../lib/db';
import ashokaChakra from '../assets/ashoka-chakra.svg';
import {
  BarChart2,
  TrendingUp,
  Map,
  Sparkles,
  AlertCircle,
  FileText,
  Volume2,
  Filter,
  CheckCircle,
  Clock,
  Layers,
  X,
  AlertOctagon,
  ThumbsUp,
  RefreshCw
} from 'lucide-react';

export default function MpAnalytics({ highContrast }) {
  // Data States
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter States
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedState, setSelectedState] = useState('All');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedArea, setSelectedArea] = useState('All');
  const [selectedSeverity, setSelectedSeverity] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // AI Insights State
  const [aiInsights, setAiInsights] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);


  // 1. Declare fetch functions first
  const fetchComplaints = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchErr } = await supabase
        .from('issues')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchErr) throw fetchErr;
      setComplaints(data || []);
    } catch (err) {
      console.error("Error loading complaints for analytics:", err);
      setError("Failed to query complaints database.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Initial Mount Hook
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchComplaints();
  }, []);

  // Filters Options lists
  const statuses = ['All', 'Pending', 'In Progress', 'Resolved', 'Rejected'];
  const categories = ['All', ...new Set(complaints.map(c => c.category).filter(Boolean))];
  const states = ['All', ...new Set(complaints.map(c => c.state).filter(Boolean))];
  
  const districts = ['All', ...new Set(complaints
    .filter(c => selectedState === 'All' || c.state === selectedState)
    .map(c => c.district)
    .filter(Boolean)
  )];

  const areas = ['All', ...new Set(complaints
    .filter(c => (selectedState === 'All' || c.state === selectedState) && (selectedDistrict === 'All' || c.district === selectedDistrict))
    .map(c => c.area)
    .filter(Boolean)
  )];

  const severities = ['All', '1', '2', '3', '4', '5'];

  // Handle Reset Filters
  const handleResetFilters = () => {
    setSelectedStatus('All');
    setSelectedCategory('All');
    setSelectedState('All');
    setSelectedDistrict('All');
    setSelectedArea('All');
    setSelectedSeverity('All');
    setStartDate('');
    setEndDate('');
  };

  // Apply filters
  const filteredData = complaints.filter(c => {
    if (selectedStatus !== 'All' && c.status !== selectedStatus) return false;
    if (selectedCategory !== 'All' && c.category !== selectedCategory) return false;
    if (selectedState !== 'All' && c.state !== selectedState) return false;
    if (selectedDistrict !== 'All' && c.district !== selectedDistrict) return false;
    if (selectedArea !== 'All' && c.area !== selectedArea) return false;
    if (selectedSeverity !== 'All' && String(c.severity || '') !== selectedSeverity) return false;

    if (startDate) {
      if (new Date(c.created_at) < new Date(startDate)) return false;
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      if (new Date(c.created_at) > end) return false;
    }

    return true;
  });

  // Calculate Metrics (Section 1)
  const totalComplaints = filteredData.length;
  const pendingCount = filteredData.filter(c => c.status === 'Pending' || c.status === 'open').length;
  const inProgressCount = filteredData.filter(c => c.status === 'In Progress').length;
  const resolvedCount = filteredData.filter(c => c.status === 'Resolved' || c.status === 'resolved').length;
  const highPriorityCount = filteredData.filter(c => (c.severity && c.severity >= 4) || c.category === 'Public Safety').length;

  const resolutionRate = totalComplaints > 0 ? Math.round((resolvedCount / totalComplaints) * 100) : 0;
  
  // Calculate average resolution time (in days) using created_at and resolved_at
  const getAverageResolutionTime = () => {
    const resolvedIssues = filteredData.filter(c => (c.status === 'Resolved' || c.status === 'resolved') && c.resolved_at && c.created_at);
    if (resolvedIssues.length === 0) return 'N/A';
    
    const totalDiffMs = resolvedIssues.reduce((acc, curr) => {
      const start = new Date(curr.created_at).getTime();
      const end = new Date(curr.resolved_at).getTime();
      return acc + (end - start);
    }, 0);

    const avgDiffDays = Math.round(totalDiffMs / (1000 * 60 * 60 * 24) / resolvedIssues.length);
    return `${avgDiffDays} days`;
  };

  const avgResolutionTime = getAverageResolutionTime();

  // AI Generated Action plans count (Issues that have non-null ai_analysis)
  const aiGeneratedPlansCount = filteredData.filter(c => c.ai_analysis).length;

  // Notification generation (Section 8)
  const getNotifications = () => {
    const list = [];
    
    // 1. Critical received (Severity >= 5, pending)
    const criticals = filteredData.filter(c => c.severity >= 5 && (c.status === 'Pending' || c.status === 'open'));
    criticals.slice(0, 2).forEach(c => {
      list.push({
        id: `noti-crit-${c.issue_id}`,
        type: 'critical',
        message: `Critical complaint: "${c.title}" received in ${c.area || 'Constituency'}.`,
        time: new Date(c.created_at).toLocaleDateString()
      });
    });

    // 2. High priority (Severity >= 4, pending)
    const highs = filteredData.filter(c => c.severity === 4 && (c.status === 'Pending' || c.status === 'open'));
    highs.slice(0, 1).forEach(c => {
      list.push({
        id: `noti-high-${c.issue_id}`,
        type: 'high',
        message: `High priority issue: "${c.title}" awaiting triage.`,
        time: new Date(c.created_at).toLocaleDateString()
      });
    });

    // 3. Pending older than 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const oldPendings = filteredData.filter(c => (c.status === 'Pending' || c.status === 'open') && c.created_at && new Date(c.created_at) < sevenDaysAgo);
    oldPendings.slice(0, 2).forEach(c => {
      list.push({
        id: `noti-old-${c.issue_id || Math.random()}`,
        type: 'pending_old',
        message: `Pending grievance older than 7 days: Reference "${c.reference_code || (c.issue_id ? c.issue_id.substring(0,8) : 'N/A')}".`,
        time: c.created_at ? `${Math.round((Date.now() - new Date(c.created_at).getTime()) / (1000 * 60 * 60 * 24))} days pending` : 'N/A'
      });
    });

    // 4. Area requires attention (Area with >= 3 pending complaints)
    const areaPendingCounts = {};
    filteredData.filter(c => (c.status === 'Pending' || c.status === 'open') && c.area).forEach(c => {
      areaPendingCounts[c.area] = (areaPendingCounts[c.area] || 0) + 1;
    });
    Object.keys(areaPendingCounts).forEach(a => {
      if (areaPendingCounts[a] >= 3) {
        list.push({
          id: `noti-area-${a}`,
          type: 'area_alert',
          message: `Area Alert: "${a}" has ${areaPendingCounts[a]} pending grievances needing attention.`,
          time: 'Action required'
        });
      }
    });

    return list.slice(0, 5); // return top 5
  };

  const notifications = getNotifications();

  // Top Priority Areas ranking (Section 4)
  const getTopPriorityAreas = () => {
    // Group by area/village
    const areaMetrics = {};
    filteredData.forEach(c => {
      const areaName = c.area || c.city || 'Constituency Central';
      if (!areaMetrics[areaName]) {
        areaMetrics[areaName] = {
          name: areaName,
          count: 0,
          pending: 0,
          totalSeverity: 0,
          maxSeverity: 0,
          votes: 0
        };
      }
      areaMetrics[areaName].count += 1;
      areaMetrics[areaName].votes += (c.votes || 0);
      areaMetrics[areaName].totalSeverity += (c.severity || 3);
      if ((c.severity || 3) > areaMetrics[areaName].maxSeverity) {
        areaMetrics[areaName].maxSeverity = (c.severity || 3);
      }
      if (c.status === 'Pending' || c.status === 'open') {
        areaMetrics[areaName].pending += 1;
      }
    });

    // Calculate score: Count * 2 + AvgSeverity * 3 + Pending * 2 + Votes * 0.1
    const ranked = Object.values(areaMetrics).map(a => {
      const avgSeverity = a.count > 0 ? (a.totalSeverity / a.count) : 0;
      const score = (a.count * 2) + (avgSeverity * 3) + (a.pending * 2.5) + (a.votes * 0.1);
      return {
        ...a,
        score: Math.round(score * 10) / 10,
        avgSeverity: Math.round(avgSeverity * 10) / 10
      };
    });

    // Sort descending by score
    return ranked.sort((x, y) => y.score - x.score).slice(0, 10);
  };

  const topPriorityAreas = getTopPriorityAreas();

  // Density Heatmap Data calculation (Section 3)
  const getHeatmapData = () => {
    const statesMap = {};
    
    filteredData.forEach(c => {
      const s = c.state || 'Unknown State';
      const d = c.district || 'Unknown District';
      const a = c.area || c.city || 'Constituency Central';

      if (!statesMap[s]) statesMap[s] = { name: s, count: 0, districts: {} };
      statesMap[s].count += 1;

      if (!statesMap[s].districts[d]) statesMap[s].districts[d] = { name: d, count: 0, areas: {} };
      statesMap[s].districts[d].count += 1;

      statesMap[s].districts[d].areas[a] = (statesMap[s].districts[d].areas[a] || 0) + 1;
    });

    return Object.values(statesMap).map(st => ({
      ...st,
      districts: Object.values(st.districts).map(di => ({
        ...di,
        areas: Object.entries(di.areas).map(([areaName, cCount]) => ({
          name: areaName,
          count: cCount
        })).sort((m, n) => n.count - m.count)
      })).sort((m, n) => n.count - m.count)
    })).sort((m, n) => n.count - m.count);
  };

  const heatmapData = getHeatmapData();

  // 3. Declare fetchAIInsights function before the useEffect trigger
  const fetchAIInsights = async () => {
    setAiLoading(true);
    setAiError(null);
    setAiInsights(null);

    // Build unique identifiers for cache matching in localStorage
    const cacheKey = `ai_insights_${selectedState}_${selectedDistrict}_${selectedArea}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (cached) {
      try {
        setAiInsights(JSON.parse(cached));
        setAiLoading(false);
        return;
      } catch (e) {
        console.error(e);
      }
    }

    try {
      // Calculate category counts, district counts to send as aggregate context
      const categoryStats = {};
      const districtStats = {};
      const stateStats = {};

      filteredData.forEach(c => {
        if (c.category) categoryStats[c.category] = (categoryStats[c.category] || 0) + 1;
        if (c.district) districtStats[c.district] = (districtStats[c.district] || 0) + 1;
        if (c.state) stateStats[c.state] = (stateStats[c.state] || 0) + 1;
      });

      const payload = {
        type: 'analytics',
        totalCount: totalComplaints,
        pendingCount,
        resolvedCount,
        categoryStats,
        districtStats,
        stateStats
      };

      const { data, error: invokeErr } = await supabase.functions.invoke('analyze-complaint', {
        body: payload
      });

      if (invokeErr) throw invokeErr;
      if (!data || data.error) {
        throw new Error(data?.error || "AI could not process data.");
      }

      setAiInsights(data);
      localStorage.setItem(cacheKey, JSON.stringify(data));

    } catch (err) {
      console.error("AI Insights fetch failed:", err);
      setAiError("AI insights temporarily unavailable.");
    } finally {
      setAiLoading(false);
    }
  };

  // 4. Hook triggers AI processing
  useEffect(() => {
    if (complaints.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchAIInsights();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [complaints.length, selectedState, selectedDistrict, selectedArea]);

  // SVGs Charting helpers (Section 2)
  const getCategoryChartData = () => {
    const counts = {};
    filteredData.forEach(c => {
      if (c.category) counts[c.category] = (counts[c.category] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  };

  const getDistrictChartData = () => {
    const counts = {};
    filteredData.forEach(c => {
      if (c.district) counts[c.district] = (counts[c.district] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5); // top 5
  };

  const getStateChartData = () => {
    const counts = {};
    filteredData.forEach(c => {
      if (c.state) counts[c.state] = (counts[c.state] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  };

  const getMonthlyTrendData = () => {
    const monthlyCounts = {};
    filteredData.forEach(c => {
      if (c.created_at) {
        const d = new Date(c.created_at);
        const key = d.toLocaleString('default', { month: 'short', year: 'numeric' });
        monthlyCounts[key] = (monthlyCounts[key] || 0) + 1;
      }
    });
    return Object.entries(monthlyCounts).reverse().slice(0, 6); // last 6 months
  };

  const categoryChartData = getCategoryChartData();
  const districtChartData = getDistrictChartData();
  const stateChartData = getStateChartData();
  const monthlyTrendData = getMonthlyTrendData();


  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 space-y-4">
        <div className={`w-8 h-8 border-4 rounded-full animate-spin ${
          highContrast ? 'border-yellow-500/20 border-t-yellow-400' : 'border-slate-200 border-t-[#000080]'
        }`}></div>
        <p className="text-slate-400 text-xs font-bold">Querying analytics database...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto relative overflow-hidden flex flex-col">

      {/* Background Ashoka Chakra Watermark */}
      <div 
        className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-0 select-none opacity-3 print:hidden"
      >
        <img 
          src={ashokaChakra} 
          alt="" 
          className="w-[80%] max-w-[600px] aspect-square object-contain" 
        />
      </div>

      <div className="relative z-10 flex-1 flex flex-col">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 print:hidden">
          <div>
            <h1 className={`text-2xl font-black tracking-tight ${highContrast ? 'text-white' : 'text-[#000080]'}`}>
              Grievance Analytics & Decision Intelligence
            </h1>
            <p className="text-xs opacity-70 font-semibold mt-1">
              Live constituency oversight, diagnostic SVG metrics, heatmaps, and Gemini AI strategic policy planners.
            </p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={fetchComplaints}
              className={`flex items-center space-x-2 border px-4 py-2 rounded-xl text-xs font-bold transition duration-200 cursor-pointer ${
                highContrast 
                  ? 'border-yellow-500/50 text-yellow-300 bg-slate-900 hover:bg-yellow-500/10' 
                  : 'border-slate-300 text-slate-700 bg-white hover:bg-slate-50 shadow-sm'
              }`}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Reload Database</span>
            </button>
          </div>
        </header>

        {/* Database Error Block */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center space-x-2">
            <AlertOctagon className="h-4.5 w-4.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Dashboard Filters Control Panel (Section 9) */}
        <div className={`border rounded-2xl shadow-sm p-5 mb-6 transition-all print:hidden ${
          highContrast ? 'bg-[#1e293b] border-yellow-500/20 text-yellow-300' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="h-4.5 w-4.5 text-[#000080] dark:text-yellow-400" />
            <span className="font-bold text-sm">Dashboard Filters control deck</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {/* State */}
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-slate-400">State</label>
              <select
                value={selectedState}
                onChange={(e) => {
                  setSelectedState(e.target.value);
                  setSelectedDistrict('All');
                  setSelectedArea('All');
                }}
                className={`w-full border rounded-xl px-2 py-2 text-xs font-bold focus:ring-1 outline-none cursor-pointer ${
                  highContrast 
                    ? 'bg-slate-950 border-yellow-500/50 text-yellow-300' 
                    : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {states.map(s => (
                  <option key={s} value={s}>{s === 'All' ? 'All States' : s}</option>
                ))}
              </select>
            </div>

            {/* District */}
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-slate-400">District</label>
              <select
                value={selectedDistrict}
                disabled={selectedState === 'All'}
                onChange={(e) => {
                  setSelectedDistrict(e.target.value);
                  setSelectedArea('All');
                }}
                className={`w-full border rounded-xl px-2 py-2 text-xs font-bold focus:ring-1 outline-none cursor-pointer disabled:opacity-50 ${
                  highContrast 
                    ? 'bg-slate-950 border-yellow-500/50 text-yellow-300' 
                    : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {districts.map(d => (
                  <option key={d} value={d}>{d === 'All' ? 'All Districts' : d}</option>
                ))}
              </select>
            </div>

            {/* Area */}
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-slate-400">Area</label>
              <select
                value={selectedArea}
                disabled={selectedDistrict === 'All'}
                onChange={(e) => setSelectedArea(e.target.value)}
                className={`w-full border rounded-xl px-2 py-2 text-xs font-bold focus:ring-1 outline-none cursor-pointer disabled:opacity-50 ${
                  highContrast 
                    ? 'bg-slate-950 border-yellow-500/50 text-yellow-300' 
                    : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {areas.map(a => (
                  <option key={a} value={a}>{a === 'All' ? 'All Areas' : a}</option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-slate-400">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`w-full border rounded-xl px-2 py-2 text-xs font-bold focus:ring-1 outline-none cursor-pointer ${
                  highContrast 
                    ? 'bg-slate-950 border-yellow-500/50 text-yellow-300' 
                    : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-slate-400">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className={`w-full border rounded-xl px-2 py-2 text-xs font-bold focus:ring-1 outline-none cursor-pointer ${
                  highContrast 
                    ? 'bg-slate-950 border-yellow-500/50 text-yellow-300' 
                    : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {statuses.map(s => (
                  <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>
                ))}
              </select>
            </div>

            {/* Severity filter (Section 9) */}
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-slate-400">Severity</label>
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className={`w-full border rounded-xl px-2 py-2 text-xs font-bold focus:ring-1 outline-none cursor-pointer ${
                  highContrast 
                    ? 'bg-slate-950 border-yellow-500/50 text-yellow-300' 
                    : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {severities.map(s => (
                  <option key={s} value={s}>{s === 'All' ? 'All Severities' : `Severity ${s}`}</option>
                ))}
              </select>
            </div>

            {/* Date range start */}
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-slate-400">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={`w-full border rounded-xl px-2 py-1.5 text-xs font-bold focus:ring-1 outline-none cursor-pointer ${
                  highContrast 
                    ? 'bg-slate-950 border-yellow-500/50 text-yellow-300' 
                    : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              />
            </div>

            {/* Date range end */}
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase text-slate-400">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={`w-full border rounded-xl px-2 py-1.5 text-xs font-bold focus:ring-1 outline-none cursor-pointer ${
                  highContrast 
                    ? 'bg-slate-950 border-yellow-500/50 text-yellow-300' 
                    : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              />
            </div>
          </div>

          {/* Filters Summary & Reset */}
          <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100/10">
            <span className="text-[10px] font-bold opacity-60">
              Active Query Result: <span className="font-extrabold text-[#000080] dark:text-yellow-400">{filteredData.length}</span> complaints.
            </span>
            {(selectedStatus !== 'All' || selectedCategory !== 'All' || selectedState !== 'All' || selectedDistrict !== 'All' || selectedArea !== 'All' || selectedSeverity !== 'All' || startDate || endDate) && (
              <button
                onClick={handleResetFilters}
                className="flex items-center space-x-1 text-xs text-red-600 dark:text-yellow-400 hover:underline font-bold cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
                <span>Reset control deck</span>
              </button>
            )}
          </div>
        </div>

        {/* SECTION 1: Overview Cards */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {/* Total Complaints */}
          <div className={`border rounded-2xl p-4 relative overflow-hidden transition-all ${
            highContrast ? 'bg-[#1e293b] border-yellow-500/20 text-yellow-300' : 'bg-white border-slate-200 text-slate-800 shadow-sm'
          }`}>
            <p className="text-[9px] font-black uppercase tracking-wider opacity-65">Total Complaints</p>
            <p className="text-2xl font-black mt-1 text-[#FF9933]">{totalComplaints}</p>
          </div>

          {/* Pending */}
          <div className={`border rounded-2xl p-4 relative overflow-hidden transition-all ${
            highContrast ? 'bg-[#1e293b] border-yellow-500/20 text-yellow-300' : 'bg-white border-slate-200 text-slate-800 shadow-sm'
          }`}>
            <p className="text-[9px] font-black uppercase tracking-wider opacity-65">Pending Triages</p>
            <p className="text-2xl font-black mt-1 text-amber-500">{pendingCount}</p>
          </div>

          {/* In Progress */}
          <div className={`border rounded-2xl p-4 relative overflow-hidden transition-all ${
            highContrast ? 'bg-[#1e293b] border-yellow-500/20 text-yellow-300' : 'bg-white border-slate-200 text-slate-800 shadow-sm'
          }`}>
            <p className="text-[9px] font-black uppercase tracking-wider opacity-65">In Progress</p>
            <p className="text-2xl font-black mt-1 text-[#000080] dark:text-yellow-300">{inProgressCount}</p>
          </div>

          {/* Resolved */}
          <div className={`border rounded-2xl p-4 relative overflow-hidden transition-all ${
            highContrast ? 'bg-[#1e293b] border-yellow-500/20 text-yellow-300' : 'bg-white border-slate-200 text-slate-800 shadow-sm'
          }`}>
            <p className="text-[9px] font-black uppercase tracking-wider opacity-65">Resolved Closed</p>
            <p className="text-2xl font-black mt-1 text-emerald-600">{resolvedCount}</p>
          </div>

          {/* High Priority */}
          <div className={`border rounded-2xl p-4 relative overflow-hidden transition-all ${
            highContrast ? 'bg-[#1e293b] border-yellow-500/20 text-yellow-300' : 'bg-white border-slate-200 text-slate-800 shadow-sm'
          }`}>
            <p className="text-[9px] font-black uppercase tracking-wider opacity-65">Critical / Safety</p>
            <p className="text-2xl font-black mt-1 text-red-650">{highPriorityCount}</p>
          </div>

          {/* Resolution Rate */}
          <div className={`border rounded-2xl p-4 relative overflow-hidden transition-all ${
            highContrast ? 'bg-[#1e293b] border-yellow-500/20 text-yellow-300' : 'bg-white border-slate-200 text-slate-800 shadow-sm'
          }`}>
            <p className="text-[9px] font-black uppercase tracking-wider opacity-65">Resolution Rate (%)</p>
            <p className="text-2xl font-black mt-1 text-[#138808]">{resolutionRate}%</p>
          </div>

          {/* Avg Resolution Time */}
          <div className={`border rounded-2xl p-4 relative overflow-hidden transition-all ${
            highContrast ? 'bg-[#1e293b] border-yellow-500/20 text-yellow-300' : 'bg-white border-slate-200 text-slate-800 shadow-sm'
          }`}>
            <p className="text-[9px] font-black uppercase tracking-wider opacity-65">Avg Resolution Speed</p>
            <p className="text-2xl font-black mt-1 text-slate-600 dark:text-yellow-400">{avgResolutionTime}</p>
          </div>

          {/* AI Generated Action Plans */}
          <div className={`border rounded-2xl p-4 relative overflow-hidden transition-all ${
            highContrast ? 'bg-[#1e293b] border-yellow-500/20 text-yellow-300' : 'bg-white border-slate-200 text-slate-800 shadow-sm'
          }`}>
            <p className="text-[9px] font-black uppercase tracking-wider opacity-65">AI Cached Action Plans</p>
            <p className="text-2xl font-black mt-1 text-[#138808] flex items-center gap-1">
              <Sparkles className="h-4 w-4 text-[#FF9933] animate-pulse" />
              <span>{aiGeneratedPlansCount}</span>
            </p>
          </div>
        </section>

        {/* Dynamic Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          
          {/* Left/Middle Column (2 Columns wide): Charts & Tables */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* SECTION 2: Interactive SVG & HTML Charts (All 7 types) */}
            <div className="space-y-6">
              
              {/* Row A: Category & District Distribution */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. Category Chart */}
                <div className={`border rounded-2xl p-5 shadow-sm transition-all ${
                  highContrast ? 'bg-[#1e293b] border-yellow-500/20 text-yellow-300' : 'bg-white border-slate-200 text-slate-850'
                }`}>
                  <h3 className="text-xs font-black uppercase tracking-wider mb-4 flex items-center space-x-2 text-slate-400">
                    <BarChart2 className="h-4 w-4 text-[#000080] dark:text-yellow-400" />
                    <span>Complaints by Category</span>
                  </h3>
                  {categoryChartData.length === 0 ? (
                    <p className="text-xs opacity-60 py-4 text-center">No categories to display.</p>
                  ) : (
                    <div className="space-y-3 py-2">
                      {categoryChartData.slice(0, 5).map(([cat, val]) => {
                        const pct = totalComplaints > 0 ? Math.round((val / totalComplaints) * 100) : 0;
                        return (
                          <div key={cat} className="space-y-1">
                            <div className="flex justify-between text-xs font-bold">
                              <span className="truncate max-w-[150px]">{cat}</span>
                              <span className="opacity-70">{val} ({pct}%)</span>
                            </div>
                            <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
                              <div 
                                style={{ width: `${pct}%` }}
                                className={`h-full rounded-full transition-all duration-500 ${
                                  highContrast ? 'bg-yellow-400' : 'bg-[#000080]'
                                }`}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 2. District Chart */}
                <div className={`border rounded-2xl p-5 shadow-sm transition-all ${
                  highContrast ? 'bg-[#1e293b] border-yellow-500/20 text-yellow-300' : 'bg-white border-slate-200 text-slate-850'
                }`}>
                  <h3 className="text-xs font-black uppercase tracking-wider mb-4 flex items-center space-x-2 text-slate-400">
                    <BarChart2 className="h-4 w-4 text-[#138808]" />
                    <span>Complaints by District</span>
                  </h3>
                  {districtChartData.length === 0 ? (
                    <p className="text-xs opacity-60 py-4 text-center">No district data to display.</p>
                  ) : (
                    <div className="space-y-3 py-2">
                      {districtChartData.map(([dist, val]) => {
                        const pct = totalComplaints > 0 ? Math.round((val / totalComplaints) * 100) : 0;
                        return (
                          <div key={dist} className="space-y-1">
                            <div className="flex justify-between text-xs font-bold">
                              <span>{dist}</span>
                              <span className="opacity-70">{val} ({pct}%)</span>
                            </div>
                            <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
                              <div 
                                style={{ width: `${pct}%` }}
                                className={`h-full rounded-full transition-all duration-500 ${
                                  highContrast ? 'bg-yellow-400' : 'bg-[#138808]'
                                }`}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>

              {/* Row B: State & Monthly trend Line Chart */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 3. State Chart */}
                <div className={`border rounded-2xl p-5 shadow-sm transition-all ${
                  highContrast ? 'bg-[#1e293b] border-yellow-500/20 text-yellow-300' : 'bg-white border-slate-200 text-slate-850'
                }`}>
                  <h3 className="text-xs font-black uppercase tracking-wider mb-4 flex items-center space-x-2 text-slate-400">
                    <Layers className="h-4 w-4 text-[#FF9933]" />
                    <span>Complaints by State</span>
                  </h3>
                  {stateChartData.length === 0 ? (
                    <p className="text-xs opacity-60 py-4 text-center">No state data to display.</p>
                  ) : (
                    <div className="space-y-3 py-2">
                      {stateChartData.map(([st, val]) => {
                        const pct = totalComplaints > 0 ? Math.round((val / totalComplaints) * 100) : 0;
                        return (
                          <div key={st} className="space-y-1">
                            <div className="flex justify-between text-xs font-bold">
                              <span>{st}</span>
                              <span className="opacity-70">{val} ({pct}%)</span>
                            </div>
                            <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
                              <div 
                                style={{ width: `${pct}%` }}
                                className={`h-full rounded-full transition-all duration-500 ${
                                  highContrast ? 'bg-yellow-400' : 'bg-[#FF9933]'
                                }`}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 4. Monthly Complaint Trend (SVG Line) */}
                <div className={`border rounded-2xl p-5 shadow-sm transition-all ${
                  highContrast ? 'bg-[#1e293b] border-yellow-500/20 text-yellow-300' : 'bg-white border-slate-200 text-slate-850'
                }`}>
                  <h3 className="text-xs font-black uppercase tracking-wider mb-4 flex items-center space-x-2 text-slate-400">
                    <TrendingUp className="h-4 w-4 text-violet-500" />
                    <span>Monthly Complaint Trend</span>
                  </h3>
                  {monthlyTrendData.length === 0 ? (
                    <p className="text-xs opacity-60 py-4 text-center">No chronological trend data.</p>
                  ) : (
                    <div className="flex flex-col items-center">
                      {/* Simple Responsive SVG Line chart */}
                      <svg viewBox="0 0 300 120" className="w-full h-24 overflow-visible">
                        <polyline
                          fill="none"
                          stroke={highContrast ? "#facc15" : "#7c3aed"}
                          strokeWidth="3"
                          points={monthlyTrendData.map(([, val], idx) => {
                            const x = 30 + (idx * 50);
                            const maxVal = Math.max(...monthlyTrendData.map(v => v[1]), 1);
                            const y = 100 - ((val / maxVal) * 80);
                            return `${x},${y}`;
                          }).join(' ')}
                        />
                        {/* Bullet indicators */}
                        {monthlyTrendData.map(([, val], idx) => {
                          const x = 30 + (idx * 50);
                          const maxVal = Math.max(...monthlyTrendData.map(v => v[1]), 1);
                          const y = 100 - ((val / maxVal) * 80);
                          return (
                            <g key={idx}>
                              <circle
                                cx={x}
                                cy={y}
                                r="4"
                                fill={highContrast ? "#0f172a" : "#ffffff"}
                                stroke={highContrast ? "#facc15" : "#7c3aed"}
                                strokeWidth="2"
                              />
                              <text x={x} y={y - 8} fontSize="7" fontWeight="bold" textAnchor="middle" fill="currentColor">
                                {val}
                              </text>
                              <text x={x} y="115" fontSize="7" fontWeight="bold" textAnchor="middle" opacity="0.6" fill="currentColor">
                                {monthlyTrendData[idx][0].split(' ')[0]}
                              </text>
                            </g>
                          );
                        })}
                      </svg>
                    </div>
                  )}
                </div>

              </div>

              {/* Row C: Status & Severity Distributions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 5. Status Distribution (Donut ring) */}
                <div className={`border rounded-2xl p-5 shadow-sm transition-all md:col-span-1 ${
                  highContrast ? 'bg-[#1e293b] border-yellow-500/20 text-yellow-300' : 'bg-white border-slate-200 text-slate-850'
                }`}>
                  <h3 className="text-xs font-black uppercase tracking-wider mb-4 flex items-center space-x-2 text-slate-400">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    <span>Status Distribution</span>
                  </h3>
                  
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <svg viewBox="0 0 100 100" className="w-20 h-20">
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#e2e8f0" strokeWidth="10" />
                      <circle 
                        cx="50" 
                        cy="50" 
                        r="40" 
                        fill="transparent" 
                        stroke="#059669" 
                        strokeWidth="10" 
                        strokeDasharray={`${(resolvedCount / (totalComplaints || 1)) * 251.2} 251.2`}
                        strokeDashoffset="0"
                        transform="rotate(-90 50 50)"
                      />
                    </svg>
                    <div className="text-[11px] font-bold space-y-1 w-full text-center">
                      <div className="flex justify-between">
                        <span className="text-emerald-600">Resolved:</span>
                        <span>{resolvedCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-amber-500">Pending:</span>
                        <span>{pendingCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-500">In Progress:</span>
                        <span>{inProgressCount}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 6. Severity Distribution (Stacked bar graph) */}
                <div className={`border rounded-2xl p-5 shadow-sm transition-all md:col-span-1 ${
                  highContrast ? 'bg-[#1e293b] border-yellow-500/20 text-yellow-300' : 'bg-white border-slate-200 text-slate-850'
                }`}>
                  <h3 className="text-xs font-black uppercase tracking-wider mb-4 flex items-center space-x-2 text-slate-400">
                    <AlertCircle className="h-4 w-4 text-red-650" />
                    <span>Severity Distribution</span>
                  </h3>

                  <div className="space-y-2 py-1">
                    {[5, 4, 3, 2, 1].map(sev => {
                      const count = filteredData.filter(c => c.severity === sev).length;
                      const pct = totalComplaints > 0 ? Math.round((count / totalComplaints) * 100) : 0;
                      return (
                        <div key={sev} className="flex items-center space-x-2 text-[10px] font-bold">
                          <span className="w-8">Lvl {sev}</span>
                          <div className="flex-1 h-2 rounded bg-slate-100 dark:bg-slate-900 overflow-hidden border">
                            <div 
                              style={{ width: `${pct}%` }} 
                              className={`h-full ${
                                sev >= 4 ? 'bg-red-500' : sev === 3 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                            ></div>
                          </div>
                          <span className="w-8 text-right opacity-70">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 7. Resolution Performance (Comparison speed) */}
                <div className={`border rounded-2xl p-5 shadow-sm transition-all md:col-span-1 ${
                  highContrast ? 'bg-[#1e293b] border-yellow-500/20 text-yellow-300' : 'bg-white border-slate-200 text-slate-850'
                }`}>
                  <h3 className="text-xs font-black uppercase tracking-wider mb-4 flex items-center space-x-2 text-slate-400">
                    <Clock className="h-4 w-4 text-sky-500" />
                    <span>Resolution Ratio</span>
                  </h3>

                  <div className="flex flex-col items-center justify-center py-2 text-center">
                    <span className="text-3xl font-black text-emerald-600">{resolutionRate}%</span>
                    <span className="text-[10px] font-bold opacity-60 uppercase mt-1">Grievances Closed Ratio</span>
                    
                    <div className="h-2 w-full bg-slate-100 rounded-full mt-4 overflow-hidden border">
                      <div style={{ width: `${resolutionRate}%` }} className="h-full bg-emerald-600"></div>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* SECTION 3: Density Heatmap (Hierarchy State -> District -> Area) */}
            <div className={`border rounded-2xl p-5 shadow-sm transition-all ${
              highContrast ? 'bg-[#1e293b] border-yellow-500/20 text-yellow-300' : 'bg-white border-slate-200 text-slate-850'
            }`}>
              <h3 className="text-xs font-black uppercase tracking-wider mb-4 flex items-center space-x-2 text-slate-400">
                <Map className="h-4 w-4 text-[#138808]" />
                <span>Geospatial Density Heatmap (Hierarchy)</span>
              </h3>

              {heatmapData.length === 0 ? (
                <p className="text-xs opacity-60 py-4 text-center">No density data available.</p>
              ) : (
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                  {heatmapData.map(st => (
                    <div key={st.name} className="border-l-2 border-[#FF9933] pl-3 py-1 space-y-2">
                      <div className="flex justify-between text-xs font-extrabold">
                        <span className="text-[#FF9933] uppercase">State: {st.name}</span>
                        <span>{st.count} complaints</span>
                      </div>
                      
                      {st.districts.map(di => (
                        <div key={di.name} className="border-l-2 border-[#000080] pl-3 py-0.5 space-y-1.5 ml-2">
                          <div className="flex justify-between text-xs font-bold text-slate-800 dark:text-white">
                            <span>District: {di.name}</span>
                            <span className="opacity-70">{di.count} issues</span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 ml-2">
                            {di.areas.map(ar => (
                              <div 
                                key={ar.name} 
                                className={`p-2 rounded-xl border flex flex-col text-[11px] font-bold ${
                                  ar.count >= 3 
                                    ? (highContrast ? 'bg-red-950/20 border-red-500/50 text-red-400' : 'bg-red-50 border-red-200 text-red-700')
                                    : (highContrast ? 'bg-slate-900 border-yellow-500/10' : 'bg-slate-50 border-slate-150')
                                }`}
                              >
                                <span className="truncate">{ar.name}</span>
                                <span className="opacity-70 mt-0.5">{ar.count} cases</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SECTION 4: Top Priority Areas */}
            <div className={`border rounded-2xl p-5 shadow-sm transition-all ${
              highContrast ? 'bg-[#1e293b] border-yellow-500/20 text-yellow-300' : 'bg-white border-slate-200 text-slate-850'
            }`}>
              <h3 className="text-xs font-black uppercase tracking-wider mb-4 flex items-center space-x-2 text-slate-400">
                <AlertOctagon className="h-4 w-4 text-red-650" />
                <span>Top 10 Priority Areas (AI Decision Ranking Model)</span>
              </h3>

              {topPriorityAreas.length === 0 ? (
                <p className="text-xs opacity-60 py-4 text-center">No ranked areas.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-100/10 text-left">
                    <thead className="text-[10px] font-black uppercase tracking-wider opacity-60">
                      <tr>
                        <th className="py-2">Rank</th>
                        <th className="py-2">Area / Village Name</th>
                        <th className="py-2 text-center">Complaints</th>
                        <th className="py-2 text-center">Pending</th>
                        <th className="py-2 text-center">Avg Severity</th>
                        <th className="py-2 text-center">Upvotes</th>
                        <th className="py-2 text-right">AI Priority Score</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs divide-y divide-slate-100/10">
                      {topPriorityAreas.map((area, idx) => (
                        <tr key={area.name}>
                          <td className="py-2.5 font-black text-slate-400">#{idx + 1}</td>
                          <td className="py-2.5 font-bold text-[#000080] dark:text-blue-400">
                            <span className="inline-block truncate max-w-[150px]">{area.name}</span>
                          </td>
                          <td className="py-2.5 text-center font-semibold">{area.count}</td>
                          <td className="py-2.5 text-center font-bold text-amber-500">{area.pending}</td>
                          <td className="py-2.5 text-center font-semibold">{area.avgSeverity} / 5</td>
                          <td className="py-2.5 text-center text-slate-400">{area.votes}</td>
                          <td className="py-2.5 text-right font-black text-red-650">{area.score}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>

          {/* Right Column: AI Insights, MP Performance, Notifications & Reports */}
          <div className="space-y-6">
            

            {/* SECTION 8: Real-Time Critical Notifications */}
            <div className={`border rounded-2xl p-5 shadow-sm transition-all print:hidden ${
              highContrast ? 'bg-[#1e293b] border-yellow-500/20 text-yellow-300' : 'bg-white border-slate-200 text-slate-850'
            }`}>
              <h3 className="text-xs font-black uppercase tracking-wider mb-3 flex items-center space-x-2 text-slate-400">
                <AlertCircle className="h-4 w-4 text-red-600 animate-bounce" />
                <span>Dashboard Alerts & Notifications</span>
              </h3>

              {notifications.length === 0 ? (
                <p className="text-xs opacity-60 text-center py-2">No critical alerts detected in query.</p>
              ) : (
                <div className="space-y-2">
                  {notifications.map(n => (
                    <div 
                      key={n.id}
                      className={`p-2.5 rounded-xl border flex items-start gap-2.5 text-[11px] font-bold ${
                        n.type === 'critical'
                          ? (highContrast ? 'bg-red-950/20 border-red-500/50 text-red-400' : 'bg-red-50 border-red-200 text-red-700')
                          : n.type === 'high'
                            ? (highContrast ? 'bg-amber-950/20 border-amber-500/50 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-700')
                            : (highContrast ? 'bg-slate-900 border-yellow-500/10' : 'bg-slate-50 border-slate-150')
                      }`}
                    >
                      <AlertOctagon className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="leading-tight">{n.message}</p>
                        <span className="text-[9px] opacity-60 block mt-1 uppercase tracking-wider">{n.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SECTION 5: MP Performance Metric Panel */}
            <div className={`border rounded-2xl p-5 shadow-sm transition-all ${
              highContrast ? 'bg-[#1e293b] border-yellow-500/20 text-yellow-300' : 'bg-white border-slate-200 text-slate-850'
            }`}>
              <h3 className="text-xs font-black uppercase tracking-wider mb-4 flex items-center space-x-2 text-slate-400">
                <ThumbsUp className="h-4 w-4 text-[#138808]" />
                <span>Representative Resolution Performance</span>
              </h3>
              
              <div className="grid grid-cols-2 gap-4 text-xs font-bold">
                <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100/10">
                  <span className="opacity-60 text-[10px] block uppercase">Grievances Resolved</span>
                  <span className="text-base font-black text-emerald-600 mt-1 block">{resolvedCount}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100/10">
                  <span className="opacity-60 text-[10px] block uppercase">Active Backlog</span>
                  <span className="text-base font-black text-amber-500 mt-1 block">{pendingCount}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100/10">
                  <span className="opacity-60 text-[10px] block uppercase">Average Action Speed</span>
                  <span className="text-base font-black mt-1 block">{avgResolutionTime}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100/10">
                  <span className="opacity-60 text-[10px] block uppercase">Resolution Ratio</span>
                  <span className="text-base font-black text-blue-600 dark:text-yellow-400 mt-1 block">{resolutionRate}%</span>
                </div>
              </div>
            </div>


          </div>

        </div>

      </div>
    </div>
  );
}
