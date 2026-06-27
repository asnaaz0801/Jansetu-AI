import { useState, useEffect } from 'react';
import { db } from '../lib/db';
import ConstituencyMap from '../components/ConstituencyMap';
import emblemOfIndia from '../assets/emblem-of-india.svg';
import ashokaChakra from '../assets/ashoka-chakra.svg';
import {
  Inbox,
  Clock,
  CheckCircle,
  FileText,
  TrendingUp,
  MapPin,
  Filter,
  RefreshCw,
  Layers,
  AlertOctagon,
  Calendar,
  Star
} from 'lucide-react';

export default function MpDashboard({ language, highContrast }) {
  const [priorities, setPriorities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedSeverity, setSelectedSeverity] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    loadPriorities();
  }, []);

  const loadPriorities = async () => {
    setLoading(true);
    try {
      const data = await db.getPriorities();
      setPriorities(data);
    } catch (err) {
      console.error('Error fetching priorities:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      const updated = await db.updateStatus(id, newStatus);
      setPriorities((prev) => prev.map((p) => (p.id === id ? updated : p)));
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setUpdatingId(null);
    }
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
    <div className={`min-h-screen flex flex-col md:flex-row transition-colors duration-200 ${
      highContrast ? 'bg-[#0f172a] text-[#fef08a]' : 'bg-[#F8FAFC] text-slate-800'
    }`}>
      {/* Dashboard Sidebar */}
      <aside className={`w-full md:w-64 flex flex-col flex-shrink-0 border-b md:border-b-0 md:border-r transition-colors ${
        highContrast 
          ? 'bg-[#1e293b] border-yellow-500/20 text-yellow-300' 
          : 'bg-white border-slate-200 text-slate-700 shadow-sm'
      }`}>
        {/* Sidebar Header */}
        <div className={`p-6 border-b ${highContrast ? 'border-yellow-500/20' : 'border-slate-100'}`}>
          <div className="flex items-center space-x-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-black uppercase tracking-widest opacity-85">
              MP Administrative Portal
            </span>
          </div>
          <p className={`text-sm font-black mt-1 ${highContrast ? 'text-white' : 'text-[#000080]'}`}>
            Hon. Member (Constituency Office)
          </p>
        </div>

        {/* Sidebar Navigation */}
        <nav className="p-4 flex-1 space-y-1.5">
          <button className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition duration-200 cursor-pointer ${
            highContrast 
              ? 'bg-yellow-400 text-black' 
              : 'bg-[#000080] text-white shadow-sm hover:bg-[#000080]/95'
          }`}>
            <div className="flex items-center space-x-3">
              <Inbox className="h-4.5 w-4.5" />
              <span>Complaint Triage</span>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-black ${
              highContrast ? 'bg-black/10 text-black' : 'bg-white/20 text-white'
            }`}>
              {pendingCount}
            </span>
          </button>

          <button className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition duration-200 text-left cursor-pointer ${
            highContrast 
              ? 'text-yellow-300 hover:bg-yellow-500/10' 
              : 'text-slate-600 hover:bg-slate-50 hover:text-[#000080]'
          }`}>
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-4.5 w-4.5" />
              <span>Geospatial Hub</span>
            </div>
            <span className="text-[10px] font-black uppercase bg-[#138808]/15 text-[#138808] px-2 py-0.5 rounded-full">
              Active
            </span>
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div className={`p-4 border-t text-[10px] text-center font-semibold opacity-60 ${
          highContrast ? 'border-yellow-500/20' : 'border-slate-100'
        }`}>
          <p>© 2026 Constituency Hub</p>
          <p className="mt-0.5 opacity-70">v2.1.0 (Leaflet Geospatial)</p>
        </div>
      </aside>

      {/* Main Dashboard Space */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto relative overflow-hidden">
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

        <div className="relative z-10">
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
              <span>Reload Feeds</span>
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
            <p className="text-[10px] font-black uppercase tracking-wider opacity-65">Total Complaints</p>
            <p className="text-3xl font-black mt-2">{totalCount}</p>
            <p className="text-[11px] opacity-75 mt-2 flex items-center space-x-1">
              <span>All submitted tickets</span>
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
            <p className="text-[10px] font-black uppercase tracking-wider opacity-65">Resolved</p>
            <p className="text-3xl font-black text-emerald-600 mt-2">{resolvedCount}</p>
            <p className="text-[11px] text-emerald-600 font-bold mt-2">Closed successfully</p>
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
            <p className="text-[10px] font-black uppercase tracking-wider opacity-65">Pending</p>
            <p className="text-3xl font-black text-amber-600 mt-2">{pendingCount}</p>
            <p className="text-[11px] text-amber-600 font-bold mt-2">Awaiting action</p>
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
            <p className="text-[10px] font-black uppercase tracking-wider opacity-65">High Priority</p>
            <p className="text-3xl font-black text-red-600 mt-2">{highPriorityCount}</p>
            <p className="text-[11px] text-red-600 font-bold mt-2">Severity ≥ 4 or Safety</p>
          </div>
        </section>

        {/* Live Leaflet Map Component */}
        <div className="mb-8">
          <ConstituencyMap 
            complaints={filteredPriorities} 
            highContrast={highContrast} 
            onUpdateStatus={handleStatusChange} 
          />
        </div>

        {/* Triage Workspace */}
        <div className={`border rounded-2xl shadow-md overflow-hidden transition-all ${
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
              <span className="font-bold text-base">Advanced Workspace Filters</span>
            </div>

            {/* Filter controls row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Category Filter */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Category</label>
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
                      {c === 'All' ? 'All Categories' : c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Status</label>
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
                      {s === 'All' ? 'All Statuses' : s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Severity Filter */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Severity</label>
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
              <p className="text-slate-400 text-xs font-bold">Loading admin dashboard workspace...</p>
            </div>
          ) : filteredPriorities.length === 0 ? (
            <div className="py-20 text-center text-slate-400 text-sm font-semibold">
              No matching complaints found for the selected criteria.
            </div>
          ) : (
            <div className={`divide-y ${highContrast ? 'divide-yellow-500/20' : 'divide-slate-100'}`}>
              {filteredPriorities.map((item) => (
                <div
                  key={item.id}
                  className={`p-5 flex flex-col lg:flex-row gap-5 items-start justify-between transition duration-150 ${
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

                    <h3 className={`text-base font-bold ${highContrast ? 'text-white' : 'text-slate-800'}`}>
                      <span className="text-xs font-black text-slate-400 mr-2 uppercase">{item.id}</span>
                      {item.title}
                    </h3>
                    <p className="text-xs md:text-sm opacity-85 leading-relaxed max-w-3xl">{item.description}</p>

                    <div className="text-[10px] opacity-60 font-semibold">
                      <span>Submitted by {item.submittedBy || 'Anonymous Citizen'}</span>
                      <span className="mx-2">•</span>
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Admin Triage Actions */}
                  <div className="w-full lg:w-auto flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch gap-2.5 sm:self-center lg:self-auto xl:self-center">
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
                        Pending
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
                        In Progress
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
                        Resolve
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        </div>
      </main>
    </div>
  );
}
