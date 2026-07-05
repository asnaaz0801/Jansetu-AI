import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/db';
import ashokaChakra from '../assets/ashoka-chakra.svg';
import { 
  Search, 
  Filter, 
  X, 
  Eye, 
  Star, 
  Layers, 
  MapPin, 
  Calendar, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';
export default function MpComplaints({ highContrast }) {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchField, setSearchField] = useState('all'); // 'all' | 'refId' | 'name' | 'title'

  // Filter States
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedState, setSelectedState] = useState('All');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedSeverity, setSelectedSeverity] = useState('All');

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
      console.error("Error loading complaints:", err);
      setError("Failed to load complaints from database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchComplaints();
  }, []);

  // Extract unique filter options from data
  const statuses = ['All', 'Pending', 'In Progress', 'Resolved', 'Rejected'];
  const categories = ['All', ...new Set(complaints.map(c => c.category).filter(Boolean))];
  const states = ['All', ...new Set(complaints.map(c => c.state).filter(Boolean))];
  
  const districts = ['All', ...new Set(complaints
    .filter(c => selectedState === 'All' || c.state === selectedState)
    .map(c => c.district)
    .filter(Boolean)
  )];

  const severities = ['All', '1', '2', '3', '4', '5'];

  const handleRowClick = (referenceCode, issueId) => {
    const targetRef = referenceCode || issueId;
    if (targetRef) {
      navigate(`/mp/complaints/${targetRef}`);
    }
  };

  // Reset Filters & Search
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedStatus('All');
    setSelectedCategory('All');
    setSelectedState('All');
    setSelectedDistrict('All');
    setSelectedSeverity('All');
  };

  // Filter and Search logic
  const filteredComplaints = complaints.filter(c => {
    // 1. Search Query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const refCode = (c.reference_code || '').toLowerCase();
      const issueId = (c.issue_id || '').toLowerCase();
      const citizenName = (c.citizen_name || '').toLowerCase();
      const title = (c.title || '').toLowerCase();

      if (searchField === 'refId') {
        if (!refCode.includes(query) && !issueId.includes(query)) return false;
      } else if (searchField === 'name') {
        if (!citizenName.includes(query)) return false;
      } else if (searchField === 'title') {
        if (!title.includes(query)) return false;
      } else {
        // 'all' field match
        if (
          !refCode.includes(query) &&
          !issueId.includes(query) &&
          !citizenName.includes(query) &&
          !title.includes(query)
        ) {
          return false;
        }
      }
    }

    // 2. Status Filter
    if (selectedStatus !== 'All') {
      const s = c.status || 'Pending';
      if (selectedStatus === 'Pending' && s !== 'Pending' && s !== 'open') return false;
      if (selectedStatus === 'Resolved' && s !== 'Resolved' && s !== 'resolved') return false;
      if (selectedStatus !== 'Pending' && selectedStatus !== 'Resolved' && s !== selectedStatus) return false;
    }

    // 3. Category Filter
    if (selectedCategory !== 'All' && c.category !== selectedCategory) return false;

    // 4. State Filter
    if (selectedState !== 'All' && c.state !== selectedState) return false;

    // 5. District Filter
    if (selectedDistrict !== 'All' && c.district !== selectedDistrict) return false;

    // 6. Severity Filter
    if (selectedSeverity !== 'All' && String(c.severity || '') !== selectedSeverity) return false;

    return true;
  });

  const getStatusBadgeClass = (status) => {
    const s = status || 'Pending';
    if (s === 'Resolved' || s === 'resolved') return highContrast ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/50' : 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    if (s === 'In Progress') return highContrast ? 'bg-amber-950/40 text-amber-400 border border-amber-500/50' : 'bg-amber-50 text-amber-700 border border-amber-200';
    if (s === 'Rejected') return highContrast ? 'bg-red-950/40 text-red-450 border border-red-500/50' : 'bg-red-50 text-red-700 border border-red-200';
    return highContrast ? 'bg-slate-900 border border-yellow-500/30 text-yellow-300' : 'bg-slate-50 text-slate-600 border border-slate-200';
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
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className={`text-2xl font-black tracking-tight ${highContrast ? 'text-white' : 'text-[#000080]'}`}>
              Complaint Triage Database
            </h1>
            <p className="text-xs opacity-70 font-semibold mt-1">
              Search, filter, and manage all citizen complaints. Click on any record to view details and execute response actions.
            </p>
          </div>
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
        </header>

        {/* Database Search & Filters Card */}
        <div className={`border rounded-2xl shadow-sm p-5 mb-6 transition-all ${
          highContrast ? 'bg-[#1e293b] border-yellow-500/20 text-yellow-300' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <div className="flex items-center space-x-2 mb-4">
            <Filter className="h-4.5 w-4.5 text-[#000080] dark:text-yellow-400" />
            <span className="font-bold text-sm">Search & Filtering Control Panel</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Search inputs */}
            <div className="lg:col-span-6 flex gap-2">
              <select
                value={searchField}
                onChange={(e) => setSearchField(e.target.value)}
                className={`border rounded-xl px-2.5 py-2 text-xs font-bold focus:ring-1 focus:ring-[#000080] outline-none cursor-pointer ${
                  highContrast 
                    ? 'bg-slate-950 border-yellow-500/50 text-yellow-300' 
                    : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <option value="all">Search All</option>
                <option value="refId">Reference ID</option>
                <option value="name">Citizen Name</option>
                <option value="title">Issue Title</option>
              </select>

              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Enter keywords to search database..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full rounded-xl pl-9 pr-3 py-2 text-xs font-semibold focus:outline-none transition-colors border ${
                    highContrast 
                      ? 'bg-slate-950 border-yellow-500/50 text-yellow-300' 
                      : 'bg-slate-50 border-slate-300 text-slate-850 focus:border-[#000080]'
                  }`}
                />
              </div>
            </div>

            {/* Dropdown filters */}
            <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-5 gap-2">
              {/* Status */}
              <div className="flex flex-col space-y-0.5">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className={`w-full border rounded-xl px-2 py-2 text-[11px] font-bold focus:ring-1 outline-none cursor-pointer ${
                    highContrast 
                      ? 'bg-slate-950 border-yellow-500/50 text-yellow-300' 
                      : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <option disabled>Status</option>
                  {statuses.map(s => (
                    <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div className="flex flex-col space-y-0.5">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className={`w-full border rounded-xl px-2 py-2 text-[11px] font-bold focus:ring-1 outline-none cursor-pointer ${
                    highContrast 
                      ? 'bg-slate-950 border-yellow-500/50 text-yellow-300' 
                      : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <option disabled>Category</option>
                  {categories.map(c => (
                    <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
                  ))}
                </select>
              </div>

              {/* State */}
              <div className="flex flex-col space-y-0.5">
                <select
                  value={selectedState}
                  onChange={(e) => {
                    setSelectedState(e.target.value);
                    setSelectedDistrict('All');
                  }}
                  className={`w-full border rounded-xl px-2 py-2 text-[11px] font-bold focus:ring-1 outline-none cursor-pointer ${
                    highContrast 
                      ? 'bg-slate-950 border-yellow-500/50 text-yellow-300' 
                      : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <option disabled>State</option>
                  {states.map(s => (
                    <option key={s} value={s}>{s === 'All' ? 'All States' : s}</option>
                  ))}
                </select>
              </div>

              {/* District */}
              <div className="flex flex-col space-y-0.5">
                <select
                  value={selectedDistrict}
                  disabled={selectedState === 'All'}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className={`w-full border rounded-xl px-2 py-2 text-[11px] font-bold focus:ring-1 outline-none cursor-pointer disabled:opacity-50 ${
                    highContrast 
                      ? 'bg-slate-950 border-yellow-500/50 text-yellow-300' 
                      : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <option disabled>District</option>
                  {districts.map(d => (
                    <option key={d} value={d}>{d === 'All' ? 'All Districts' : d}</option>
                  ))}
                </select>
              </div>

              {/* Severity */}
              <div className="flex flex-col space-y-0.5">
                <select
                  value={selectedSeverity}
                  onChange={(e) => setSelectedSeverity(e.target.value)}
                  className={`w-full border rounded-xl px-2 py-2 text-[11px] font-bold focus:ring-1 outline-none cursor-pointer ${
                    highContrast 
                      ? 'bg-slate-950 border-yellow-500/50 text-yellow-300' 
                      : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <option disabled>Severity</option>
                  {severities.map(v => (
                    <option key={v} value={v}>{v === 'All' ? 'All Severities' : `Severity ${v}`}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Reset button & active filters info */}
          <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100/10">
            <span className="text-[10px] font-bold opacity-60">
              Filtered Result Count: <span className="font-extrabold text-[#000080] dark:text-yellow-400">{filteredComplaints.length}</span> of {complaints.length} records.
            </span>
            {(selectedStatus !== 'All' || selectedCategory !== 'All' || selectedState !== 'All' || selectedDistrict !== 'All' || selectedSeverity !== 'All' || searchQuery) && (
              <button
                onClick={handleResetFilters}
                className="flex items-center space-x-1 text-xs text-red-600 dark:text-yellow-400 hover:underline font-bold cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
                <span>Reset all filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Database List / Table Area */}
        <div className={`border rounded-2xl shadow-sm overflow-hidden flex-1 flex flex-col transition-all ${
          highContrast ? 'bg-[#1e293b] border-yellow-500/20 text-yellow-300' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 space-y-4">
              <div className={`w-8 h-8 border-4 rounded-full animate-spin ${
                highContrast ? 'border-yellow-500/20 border-t-yellow-400' : 'border-slate-200 border-t-[#000080]'
              }`}></div>
              <p className="text-slate-400 text-xs font-bold">Querying database records...</p>
            </div>
          ) : error ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-red-500 font-bold space-y-2">
              <AlertCircle className="h-8 w-8" />
              <span>{error}</span>
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-400 text-sm font-semibold">
              No matching database complaints found. Try refining your controls.
            </div>
          ) : (
            <div className="overflow-x-auto flex-1">
              <table className="min-w-full divide-y divide-slate-100/10 text-left border-collapse">
                <thead className={`text-[10px] font-black uppercase tracking-wider ${
                  highContrast ? 'bg-slate-900 text-yellow-400' : 'bg-slate-50 text-slate-500 border-b border-slate-100'
                }`}>
                  <tr>
                    <th className="px-6 py-3.5">Reference ID</th>
                    <th className="px-6 py-3.5">Citizen Name</th>
                    <th className="px-6 py-3.5">Title</th>
                    <th className="px-6 py-3.5">Category</th>
                    <th className="px-6 py-3.5">Region (State/Dist)</th>
                    <th className="px-6 py-3.5 text-center">Severity</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Created Date</th>
                    <th className="px-6 py-3.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className={`divide-y divide-slate-100/10 text-xs font-semibold ${
                  highContrast ? 'text-yellow-300' : 'text-slate-700'
                }`}>
                  {filteredComplaints.map((item) => (
                    <tr 
                      key={item.issue_id}
                      onClick={() => handleRowClick(item.reference_code, item.issue_id)}
                      className={`transition duration-150 cursor-pointer ${
                        highContrast ? 'hover:bg-yellow-500/5' : 'hover:bg-slate-50/70'
                      }`}
                    >
                      <td className="px-6 py-4.5 font-bold uppercase tracking-tight text-[#FF9933]">
                        {item.reference_code || (item.issue_id ? item.issue_id.substring(0, 8) : 'N/A')}
                      </td>
                      <td className="px-6 py-4.5 truncate max-w-[120px]">
                        {item.citizen_name || "Anonymous Citizen"}
                      </td>
                      <td className="px-6 py-4.5 font-bold truncate max-w-[200px]" title={item.title}>
                        {item.title}
                      </td>
                      <td className="px-6 py-4.5">
                        <span className="inline-flex items-center space-x-1">
                          <Layers className="h-3 w-3 text-slate-400" />
                          <span>{item.category}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4.5 truncate max-w-[150px]">
                        <span className="inline-flex items-center space-x-1">
                          <MapPin className="h-3 w-3 text-slate-400" />
                          <span>{item.district || 'Unknown'}, {item.state || 'Unknown'}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4.5 text-center">
                        <span className="inline-flex items-center space-x-0.5 px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/15">
                          <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                          <span>{item.severity || 3}/5</span>
                        </span>
                      </td>
                      <td className="px-6 py-4.5">
                        <span className={`inline-flex px-2 py-0.5 text-[10px] rounded-full font-bold uppercase tracking-wider ${getStatusBadgeClass(item.status)}`}>
                          {item.status === 'open' ? 'Pending' : (item.status === 'resolved' ? 'Resolved' : (item.status || 'Pending'))}
                        </span>
                      </td>
                      <td className="px-6 py-4.5 whitespace-nowrap">
                        <span className="inline-flex items-center space-x-1">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          <span>{item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4.5 text-center">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(item.reference_code, item.issue_id);
                          }}
                          className={`p-1.5 rounded-lg border transition duration-150 cursor-pointer ${
                            highContrast 
                              ? 'border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/10' 
                              : 'border-slate-350 text-[#000080] hover:bg-[#000080]/10 hover:border-[#000080]'
                          }`}
                          title="View Complaint Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
