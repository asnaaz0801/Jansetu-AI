import { useEffect, useRef, useState } from 'react';
import { Search, MapPin, Layers, Radio, Sun, Moon, Compass, X } from 'lucide-react';
import { translations } from '../lib/translations';

export default function ConstituencyMap({ 
  complaints = [], 
  highContrast = false, 
  onUpdateStatus = null,
  simpleMode = false, // if true, disables administrative panels like quick status changes
  initialCenter = [28.6139, 77.2090], // Delhi center
  initialZoom = 11,
  language = 'en',
  focusedComplaint = null
}) {
  const t = translations[language] || translations['en'];
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerGroupRef = useRef(null);
  const heatLayerRef = useRef(null);
  const userMarkerRef = useRef(null);
  const tilesRef = useRef(null);
  
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showMarkers, setShowMarkers] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapTheme, setMapTheme] = useState('light'); // 'light' | 'dark'
  const [detecting, setDetecting] = useState(false);
  const [mapViewMode, setMapViewMode] = useState('hotspots'); // 'india' | 'hotspots'
  const [lightboxImage, setLightboxImage] = useState(null);
  const [enrichedComplaints, setEnrichedComplaints] = useState([]);

  // Delhi NCR bounding box for fallback coordinate generation
  const DELHI_CENTER = { lat: 28.6139, lng: 77.2090 };
  const DELHI_SPREAD = 0.12; // ~13km spread

  // Deterministic hash → coordinate offset (same input = same point on map)
  const hashString = (str) => {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
    }
    return h;
  };

  // Geocoding cache in local storage to prevent redundant API calls
  const getGeocodeCache = () => {
    try {
      const cached = localStorage.getItem('jansetu_geocode_cache');
      return cached ? JSON.parse(cached) : {};
    } catch {
      return {};
    }
  };

  const saveGeocodeCache = (cache) => {
    try {
      localStorage.setItem('jansetu_geocode_cache', JSON.stringify(cache));
    } catch (e) {
      console.warn("Failed to save geocode cache:", e);
    }
  };

  // Assign exact/approximate coordinates to complaints that lack GPS data
  useEffect(() => {
    if (!complaints || complaints.length === 0) {
      setEnrichedComplaints([]);
      return;
    }

    // Initialize with deterministic fallbacks first so the map renders immediately
    const initialEnriched = complaints.map((c) => {
      const parsedLat = typeof c.lat === 'string' ? parseFloat(c.lat) : (typeof c.lat === 'number' ? c.lat : NaN);
      const parsedLng = typeof c.lng === 'string' ? parseFloat(c.lng) : (typeof c.lng === 'number' ? c.lng : NaN);

      if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
        return { 
          ...c, 
          lat: parsedLat, 
          lng: parsedLng, 
          _coordsType: 'GPS' 
        };
      }

      const seed = `${c.id || ''}-${c.area || ''}-${c.city || ''}-${c.district || ''}`;
      const h = hashString(seed);
      const latOffset = ((h & 0xFFFF) / 0xFFFF - 0.5) * 2 * DELHI_SPREAD;
      const lngOffset = (((h >> 16) & 0xFFFF) / 0xFFFF - 0.5) * 2 * DELHI_SPREAD;

      return {
        ...c,
        lat: DELHI_CENTER.lat + latOffset,
        lng: DELHI_CENTER.lng + lngOffset,
        _coordsType: 'Approximate (Offset)',
        _isApproxCoords: true
      };
    });

    setEnrichedComplaints(initialEnriched);

    // Identify unique address strings for complaints missing GPS coordinates
    const addressToComplaints = {};
    complaints.forEach((c) => {
      const parsedLat = typeof c.lat === 'string' ? parseFloat(c.lat) : (typeof c.lat === 'number' ? c.lat : NaN);
      const parsedLng = typeof c.lng === 'string' ? parseFloat(c.lng) : (typeof c.lng === 'number' ? c.lng : NaN);

      if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
        return;
      }

      const parts = [c.area, c.city, c.district, c.state, 'India'].filter(Boolean);
      const addressStr = parts.join(', ').trim();
      if (addressStr && addressStr !== 'India') {
        if (!addressToComplaints[addressStr]) {
          addressToComplaints[addressStr] = [];
        }
        addressToComplaints[addressStr].push(c.id);
      }
    });

    const uniqueAddresses = Object.keys(addressToComplaints);
    if (uniqueAddresses.length === 0) return;

    const cache = getGeocodeCache();
    const addressesToFetch = [];

    // Apply cached values immediately
    let updated = [...initialEnriched];
    let needsUpdate = false;

    uniqueAddresses.forEach((addr) => {
      if (cache[addr]) {
        const { lat, lng } = cache[addr];
        const ids = addressToComplaints[addr];
        updated = updated.map((item) => {
          if (ids.includes(item.id)) {
            return {
              ...item,
              lat,
              lng,
              _coordsType: 'Exact (Geocoded Address)',
              _isApproxCoords: false
            };
          }
          return item;
        });
        needsUpdate = true;
      } else {
        addressesToFetch.push(addr);
      }
    });

    if (needsUpdate) {
      setEnrichedComplaints(updated);
    }

    if (addressesToFetch.length === 0) return;

    // Process remaining addresses sequentially with a 1200ms delay to respect Nominatim usage policy
    let currentUpdated = [...updated];
    let isCancelled = false;

    const fetchNext = async (index) => {
      if (index >= addressesToFetch.length || isCancelled) return;

      const addr = addressesToFetch[index];
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addr)}&limit=1`, {
          headers: { 'User-Agent': 'Jansetu-AI-App' }
        });
        const results = await res.json();
        
        if (results && results.length > 0) {
          const lat = parseFloat(results[0].lat);
          const lng = parseFloat(results[0].lon);

          // Update cache
          const currentCache = getGeocodeCache();
          currentCache[addr] = { lat, lng };
          saveGeocodeCache(currentCache);

          if (!isCancelled) {
            const ids = addressToComplaints[addr];
            currentUpdated = currentUpdated.map((item) => {
              if (ids.includes(item.id)) {
                return {
                  ...item,
                  lat,
                  lng,
                  _coordsType: 'Exact (Geocoded Address)',
                  _isApproxCoords: false
                };
              }
              return item;
            });
            setEnrichedComplaints(currentUpdated);
          }
        }
      } catch (err) {
        console.error("Geocoding failed for:", addr, err);
      }

      // Schedule next fetch after 1200ms
      setTimeout(() => fetchNext(index + 1), 1200);
    };

    fetchNext(0);

    return () => {
      isCancelled = true;
    };
  }, [complaints]);

  
  // Color configuration per category
  const categoryColors = {
    'Roads': '#D97706',       // Amber/Orange
    'Garbage': '#16A34A',     // Green
    'Water Supply': '#2563EB', // Blue
    'Electricity': '#EAB308', // Yellow
    'Street Lights': '#8B5CF6',// Purple
    'Drainage': '#0D9488',     // Teal
    'Public Safety': '#DC2626', // Red
  };

  const categoryIcons = {
    'Roads': '🛣',
    'Garbage': '🗑',
    'Water Supply': '💧',
    'Electricity': '⚡',
    'Street Lights': '💡',
    'Drainage': '🌀',
    'Public Safety': '🛡',
  };

  // Sync map theme with prop theme and local override
  useEffect(() => {
    setMapTheme(highContrast ? 'dark' : 'light');
  }, [highContrast]);

  // Handle tile layer change on theme toggle
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    
    if (tilesRef.current) {
      mapRef.current.removeLayer(tilesRef.current);
    }
    
    const tileUrl = mapTheme === 'dark' 
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      
    const attribution = mapTheme === 'dark'
      ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

    const L = window.L;
    if (L) {
      tilesRef.current = L.tileLayer(tileUrl, { attribution }).addTo(mapRef.current);
    }
  }, [mapTheme, mapLoaded]);

  // Initialize Map
  useEffect(() => {
    const L = window.L;
    if (!L || !mapContainerRef.current) return;

    // Cleanup existing map if any
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    // Workaround default icon paths in Leaflet
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    // Create Leaflet Map instance
    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      zoomControl: false, // will add custom positioned controls
      attributionControl: false, // Hide Leaflet & OpenStreetMap attribution links
      scrollWheelZoom: true,
      gestureHandling: true // cooperative gesture handling
    });
    
    // Force recalculation of container size to prevent grey or misaligned tiles
    setTimeout(() => {
      map.invalidateSize();
    }, 150);
    
    // Add custom zoom control to bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapRef.current = map;
    markerGroupRef.current = L.featureGroup().addTo(map);
    
    setMapLoaded(true);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update Markers & Heatmap when complaints data, showHeatmap, showMarkers changes
  useEffect(() => {
    const L = window.L;
    if (!L || !mapRef.current || !mapLoaded) return;

    // Clear previous layers
    markerGroupRef.current.clearLayers();
    if (heatLayerRef.current) {
      mapRef.current.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }

    // Use enriched complaints (with fallback coordinates for any GPS-missing entries)
    const validComplaints = enrichedComplaints.filter(
      c => typeof c.lat === 'number' && !isNaN(c.lat) &&
           typeof c.lng === 'number' && !isNaN(c.lng)
    );

    // 1. Add Heatmap Layer
    if (showHeatmap && validComplaints.length > 0) {
      // Map complaints to Leaflet.heat points format: [lat, lng, intensity]
      const heatPoints = validComplaints.map(c => {
        // Scale intensity: severity 1-5, but boost so single points show clearly
        const rawIntensity = (c.severity || 3) / 5;
        // Approximate-coord complaints still contribute heatmap data
        return [c.lat, c.lng, rawIntensity];
      });

      // Initialize heatLayer with boosted settings for clear visibility
      heatLayerRef.current = L.heatLayer(heatPoints, {
        radius: 35,
        blur: 25,
        minOpacity: 0.45,
        maxZoom: 18,
        max: 1.0,
        gradient: {
          0.0: '#93C5FD', // Very Low: light blue
          0.2: '#3B82F6', // Low: blue
          0.4: '#10B981', // Med-Low: green
          0.6: '#F59E0B', // Medium: amber
          0.8: '#EF4444', // High: red
          1.0: '#7F1D1D'  // Critical: dark red
        }
      }).addTo(mapRef.current);
    }

    // 2. Add Marker Pins
    if (showMarkers && validComplaints.length > 0) {
      validComplaints.forEach(c => {
        const color = categoryColors[c.category] || '#64748B';
        const iconUnicode = categoryIcons[c.category] || '📌';
        const size = 12 + (c.severity || 3) * 2;
        
        // Custom division icon (highly interactive & styled)
        const customIcon = L.divIcon({
          html: `
            <div class="relative flex items-center justify-center cursor-pointer marker-pin-${c.id}" style="width: ${size * 2}px; height: ${size * 2}px;">
              <span class="absolute inline-flex h-full w-full rounded-full opacity-35 animate-ping" style="background-color: ${color}; animation-duration: ${6 - (c.severity || 3)}s;"></span>
              <span class="absolute inline-flex h-[80%] w-[80%] rounded-full opacity-15" style="background-color: ${color};"></span>
              <div class="relative rounded-full border-2 border-white shadow-lg flex items-center justify-center text-[10px]" 
                   style="background-color: ${color}; width: ${size}px; height: ${size}px; color: white;">
                ${iconUnicode}
              </div>
            </div>
          `,
          className: 'custom-div-icon',
          iconSize: [size * 2, size * 2],
          iconAnchor: [size, size]
        });

        // Popup UI template
        const popupDiv = document.createElement('div');
        popupDiv.className = `p-1 text-slate-800 ${highContrast ? 'text-yellow-300' : 'text-slate-700'} font-sans min-w-[240px]`;
        
        const severityStars = '★'.repeat(c.severity) + '☆'.repeat(5 - c.severity);
        const dateStr = new Date(c.createdAt || c.Date || Date.now()).toLocaleDateString('en-US', {
          year: 'numeric', month: 'short', day: 'numeric'
        });

        const statusColors = {
          'Pending': 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50',
          'In Progress': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/50',
          'Resolved': 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50',
        };

        const statusColor = statusColors[c.status] || 'bg-slate-100 text-slate-800';

        let displayImgUrl = c.imageUrl || null;
        let cleanDescription = c.description || '';

        // Extract from description if image_url is missing
        if (!displayImgUrl && cleanDescription) {
          const match = cleanDescription.match(/\n\[Image:\s*(.*?)\]/s);
          if (match) {
            displayImgUrl = match[1];
            cleanDescription = cleanDescription.replace(/\n\[Image:\s*(.*?)\]/s, '');
          }
        }

        popupDiv.innerHTML = `
          <div class="border-b pb-2 mb-2">
            <div class="flex items-center justify-between gap-2 mb-1">
              <span class="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500">${c.id}</span>
              <span class="px-2 py-0.5 rounded-full border text-[9px] font-bold ${statusColor}">${c.status}</span>
            </div>
            <h4 class="text-xs font-black leading-tight text-slate-900 dark:text-white">${c.title || `${c.category} Issue`}</h4>
          </div>
          <div class="space-y-1 text-[11px] leading-relaxed mb-3">
            <div class="flex justify-between">
              <span class="opacity-60">Category:</span>
              <span class="font-bold">${c.category}</span>
            </div>
            <div class="flex justify-between">
              <span class="opacity-60">Citizen:</span>
              <span class="font-bold">${c.submittedBy || 'Anonymous'}</span>
            </div>
            <div class="flex justify-between">
              <span class="opacity-60">Date:</span>
              <span class="font-bold">${dateStr}</span>
            </div>
            <div class="flex justify-between">
              <span class="opacity-60">Severity:</span>
              <span class="text-amber-500 font-bold text-xs leading-none">${severityStars} (${c.severity}/5)</span>
            </div>
            <p class="mt-2 text-[10.5px] italic border-l-2 pl-2 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-1.5 rounded">
              "${cleanDescription || 'No additional details provided.'}"
            </p>
          </div>
        `;

        if (displayImgUrl) {
          const imgContainer = document.createElement('div');
          imgContainer.className = 'mt-2 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-black/5 cursor-zoom-in relative group';
          imgContainer.innerHTML = `
            <img src="${displayImgUrl}" class="w-full max-h-24 object-cover rounded-lg hover:scale-[1.02] transition-transform duration-200" alt="Complaint Image" />
            <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[9px] font-bold rounded-lg pointer-events-none">
              Click to Enlarge
            </div>
          `;
          
          imgContainer.querySelector('img').addEventListener('click', (e) => {
            e.stopPropagation();
            setLightboxImage(displayImgUrl);
          });
          
          popupDiv.querySelector('.space-y-1').appendChild(imgContainer);
        }

        // If not in simple mode and status updates are supported, add action triggers in popup
        if (!simpleMode && onUpdateStatus) {
          const actionWrapper = document.createElement('div');
          actionWrapper.className = 'border-t pt-2 mt-2 flex flex-col gap-1.5';
          
          actionWrapper.innerHTML = `
            <span class="text-[9px] font-black uppercase text-slate-400">Change Triage Status</span>
            <div class="flex gap-1">
              <button class="status-btn-pending text-[10px] font-bold px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 cursor-pointer flex-1 text-center transition">Pending</button>
              <button class="status-btn-progress text-[10px] font-bold px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 cursor-pointer flex-1 text-center transition">In Progress</button>
              <button class="status-btn-resolved text-[10px] font-bold px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 cursor-pointer flex-1 text-center transition">Resolve</button>
            </div>
          `;
          
          // Wire up event listeners
          actionWrapper.querySelector('.status-btn-pending').addEventListener('click', () => {
            onUpdateStatus(c.id, 'Pending');
            map.closePopup();
          });
          actionWrapper.querySelector('.status-btn-progress').addEventListener('click', () => {
            onUpdateStatus(c.id, 'In Progress');
            map.closePopup();
          });
          actionWrapper.querySelector('.status-btn-resolved').addEventListener('click', () => {
            onUpdateStatus(c.id, 'Resolved');
            map.closePopup();
          });

          popupDiv.appendChild(actionWrapper);
        }

        const marker = L.marker([c.lat, c.lng], { icon: customIcon })
          .bindPopup(popupDiv, { maxWidth: 300, minWidth: 240 })
          .addTo(markerGroupRef.current);
          
        // Add approximate location badge to popup if coordinates were generated
        if (c._isApproxCoords) {
          const approxBadge = document.createElement('div');
          approxBadge.className = 'text-[9px] text-amber-600 font-bold mt-1 flex items-center gap-1';
          approxBadge.innerHTML = '⚠ Approx. Location (GPS not captured)';
          popupDiv.appendChild(approxBadge);
        }

        // Store complaint ID on marker object for easy lookup on search
        marker.complaintId = (c.id || '').toLowerCase();
        marker.complaintData = c;
      });
    }

    // Auto-fit bounds if markers exist, simpleMode is false, and mapViewMode is 'hotspots'
    if (!simpleMode && showMarkers && validComplaints.length > 0 && mapViewMode === 'hotspots') {
      try {
        const bounds = markerGroupRef.current.getBounds();
        if (bounds.isValid()) {
          mapRef.current.fitBounds(bounds, { padding: [40, 40] });
        }
      } catch (e) {
        console.error('Error fitting bounds:', e);
      }
    }
  }, [enrichedComplaints, showHeatmap, showMarkers, mapLoaded, mapViewMode]);

  // Handle focusing map on clicked complaint card
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || !focusedComplaint || !focusedComplaint.id) return;

    const L = window.L;
    if (!L) return;

    const layers = markerGroupRef.current.getLayers();
    const marker = layers.find(layer => layer.complaintId === focusedComplaint.id.toLowerCase());

    if (marker) {
      // Focus map on the marker
      mapRef.current.setView(marker.getLatLng(), 15, { animate: true });
      // Open popup
      marker.openPopup();

      // Scroll map into view
      const mapContainer = mapContainerRef.current;
      if (mapContainer) {
        mapContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [focusedComplaint, mapLoaded, enrichedComplaints]);

  // Handle Search Submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim() || !mapRef.current) return;

    const L = window.L;
    if (!L) return;

    const query = searchQuery.trim().toLowerCase();
    
    // Find matching marker in markerGroup
    let matchedMarker = null;
    markerGroupRef.current.eachLayer((layer) => {
      if (
        layer.complaintId === query || 
        (layer.complaintData && layer.complaintData.title.toLowerCase().includes(query)) ||
        (layer.complaintData && layer.complaintData.description.toLowerCase().includes(query)) ||
        (layer.complaintData && layer.complaintData.submittedBy.toLowerCase().includes(query))
      ) {
        matchedMarker = layer;
      }
    });

    if (matchedMarker) {
      // Pan/Zoom to the marker and trigger popup
      mapRef.current.setView(matchedMarker.getLatLng(), 15, { animate: true, duration: 1 });
      setTimeout(() => {
        matchedMarker.openPopup();
      }, 800);
    } else {
      alert(`No complaint matching "${searchQuery}" found in this area.`);
    }
  };

  // Detect User Location using Geolocation API
  const handleDetectLocation = () => {
    const L = window.L;
    if (!L || !mapRef.current) return;
    
    setDetecting(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        // Remove previous user marker if any
        if (userMarkerRef.current) {
          mapRef.current.removeLayer(userMarkerRef.current);
        }

        // Custom pulsing GPS indicator
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
          .bindPopup(`<div class="text-xs font-bold text-center">📍 You are here</div>`)
          .addTo(mapRef.current);

        mapRef.current.setView([lat, lng], 14, { animate: true, duration: 1.2 });
        setDetecting(false);
        
        setTimeout(() => {
          userMarkerRef.current.openPopup();
        }, 1200);
      },
      (error) => {
        console.error("GPS detection failed:", error);
        alert("Unable to retrieve location. Please check browser permissions.");
        setDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div className={`border rounded-2xl p-6 transition-all ${
      highContrast 
        ? 'bg-[#1e293b] border-yellow-500/20 text-yellow-300 shadow-yellow-500/5' 
        : 'bg-white border-slate-200 text-slate-800 shadow-sm'
    } space-y-4`}>
      
      {/* Map Header / Toolbar */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-orange-600 animate-pulse"></span>
            {t.mapHeader}
          </h2>
          <p className="text-xs opacity-70 mt-1 font-semibold">
            {t.mapSubtext}
          </p>
        </div>

        {/* Filters and Toolbar controls */}
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          {/* Search bar inside the map */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:flex-initial">
            <input
              type="text"
              placeholder={t.mapSearchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full sm:w-56 pl-9 pr-3 py-1.5 rounded-xl border text-xs font-bold transition outline-none focus:ring-1 focus:ring-blue-500 ${
                highContrast 
                  ? 'bg-slate-900 border-yellow-500/30 text-yellow-300 placeholder-yellow-500/50' 
                  : 'bg-slate-50 border-slate-300 text-slate-700 placeholder-slate-400 focus:bg-white'
              }`}
            />
            <Search className="absolute left-3 top-2 text-slate-400 h-3.5 w-3.5" />
          </form>

          {/* Detect Location Button */}
          <button
            onClick={handleDetectLocation}
            disabled={detecting}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-black transition cursor-pointer select-none ${
              highContrast
                ? 'bg-slate-900 border-yellow-500/30 hover:bg-yellow-500/10 text-yellow-300'
                : 'bg-slate-50 border-slate-300 hover:bg-slate-100 text-slate-700'
            }`}
            title={t.mapLocateTooltip}
          >
            {detecting ? (
              <span className="w-3.5 h-3.5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <Compass className="h-3.5 w-3.5" />
            )}
            <span>{detecting ? t.mapLocating : t.mapLocateMe}</span>
          </button>

          {/* Map View Mode Toggles */}
          <div className="flex rounded-xl overflow-hidden border border-slate-300 dark:border-yellow-500/30">
            <button
              type="button"
              onClick={() => {
                setMapViewMode('india');
                if (mapRef.current) {
                  mapRef.current.setView([20.5937, 78.9629], 5, { animate: true });
                }
              }}
              className={`px-3 py-1.5 text-xs font-black transition cursor-pointer select-none ${
                mapViewMode === 'india'
                  ? (highContrast ? 'bg-yellow-400 text-black' : 'bg-[#000080] text-white')
                  : (highContrast ? 'bg-slate-900 text-yellow-300' : 'bg-slate-50 text-slate-700 hover:bg-slate-100')
              }`}
            >
              {t.mapIndiaBtn}
            </button>
            <button
              type="button"
              onClick={() => {
                setMapViewMode('hotspots');
                if (mapRef.current && enrichedComplaints.length > 0) {
                  try {
                    const validC = enrichedComplaints.filter(
                      c => typeof c.lat === 'number' && !isNaN(c.lat) &&
                           typeof c.lng === 'number' && !isNaN(c.lng)
                    );
                    if (validC.length > 0) {
                      const L = window.L;
                      const bounds = L.featureGroup(validC.map(c => L.marker([c.lat, c.lng]))).getBounds();
                      if (bounds.isValid()) {
                        mapRef.current.fitBounds(bounds, { padding: [40, 40] });
                      }
                    }
                  } catch (e) {
                    console.error(e);
                  }
                }
              }}
              className={`px-3 py-1.5 text-xs font-black transition cursor-pointer select-none border-l border-slate-300 dark:border-yellow-500/20 ${
                mapViewMode === 'hotspots'
                  ? (highContrast ? 'bg-yellow-400 text-black' : 'bg-[#000080] text-white')
                  : (highContrast ? 'bg-slate-900 text-yellow-300' : 'bg-slate-50 text-slate-700 hover:bg-slate-100')
              }`}
            >
              {t.mapHotspotsBtn}
            </button>
          </div>

          {/* Theme Layer Toggle */}
          <button
            onClick={() => setMapTheme(mapTheme === 'light' ? 'dark' : 'light')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-black transition cursor-pointer select-none ${
              highContrast
                ? 'bg-slate-900 border-yellow-500/30 text-yellow-300 cursor-not-allowed'
                : 'bg-slate-50 border-slate-300 hover:bg-slate-100 text-slate-700'
            }`}
            disabled={highContrast} // locked to dark in high contrast
          >
            {mapTheme === 'dark' ? <Sun className="h-3.5 w-3.5 text-amber-500" /> : <Moon className="h-3.5 w-3.5 text-indigo-600" />}
            <span className="hidden sm:inline">{mapTheme === 'dark' ? t.mapThemeLight : t.mapThemeDark}</span>
          </button>
        </div>
      </div>

      {/* Layer Toggles & Heatmap Legend */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-xl p-3.5 text-xs font-bold text-slate-600 dark:text-slate-400">
        
        {/* Layer Toggles */}
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer select-none text-black dark:text-black hover:text-slate-900 dark:hover:text-slate-900 transition">
            <input
              type="checkbox"
              checked={showHeatmap}
              onChange={(e) => setShowHeatmap(e.target.checked)}
              className="accent-orange-600 cursor-pointer h-4 w-4 rounded"
            />
            <span className="flex items-center gap-1.5">
              <Radio className="h-3.5 w-3.5 text-orange-600 animate-pulse" />
              {t.mapHeatmapOverlay}
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none text-black dark:text-black hover:text-slate-900 dark:hover:text-slate-900 transition">
            <input
              type="checkbox"
              checked={showMarkers}
              onChange={(e) => setShowMarkers(e.target.checked)}
              className="accent-blue-600 cursor-pointer h-4 w-4 rounded"
            />
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-blue-600" />
              {t.mapPinpointMarkers}
            </span>
          </label>
        </div>

        {/* Heatmap Legend */}
        {showHeatmap && (
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-wider opacity-70">{t.mapDensityLow && 'Hotspot Density:'}</span>
            <div className="flex items-center gap-1 text-[9px] font-extrabold uppercase">
              <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-950/20 dark:text-blue-300">{t.mapDensityLow}</span>
              <span className="h-0.5 w-3 bg-gradient-to-r from-blue-500 to-green-500"></span>
              <span className="px-1.5 py-0.5 rounded bg-green-100 text-green-700 border border-green-200 dark:bg-green-950/20 dark:text-green-300">{t.mapDensityMedium}</span>
              <span className="h-0.5 w-3 bg-gradient-to-r from-yellow-500 to-red-500"></span>
              <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 border border-red-200 dark:bg-red-950/20 dark:text-red-300">{t.mapDensityHigh}</span>
            </div>
          </div>
        )}
      </div>

      {/* Map Interactive Container */}
      <div className={`h-[480px] w-full rounded-2xl overflow-hidden border relative shadow-inner ${
        highContrast ? 'border-yellow-500/20 bg-slate-950' : 'border-slate-200 bg-slate-100'
      }`}>
        <div id="constituency-map" ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Fallback load screen */}
        {!mapLoaded && (
          <div className="absolute inset-0 bg-slate-500/10 backdrop-blur-xs flex items-center justify-center z-20">
            <div className="text-center space-y-2">
              <span className="w-8 h-8 border-4 border-slate-300 border-t-blue-600 rounded-full animate-spin inline-block"></span>
              <p className="text-xs font-bold text-slate-500">{t.mapConnecting}</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Category Legend */}
      {showMarkers && (
        <div className="flex flex-wrap gap-2 pt-1.5">
          <span className="text-[10px] font-black uppercase text-slate-400 mr-2 self-center">{t.mapCategoryPins}:</span>
          {Object.entries(categoryColors).map(([cat, color]) => (
            <div 
              key={cat}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-black ${
                highContrast 
                  ? 'bg-slate-900 border-yellow-500/20 text-yellow-300' 
                  : 'bg-white border-slate-200 text-slate-600 shadow-xs'
              }`}
            >
              <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: color }} />
              <span>{categoryIcons[cat] || '📌'} {cat}</span>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center justify-center">
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-slate-300 font-bold text-xs bg-black/50 px-3 py-1.5 rounded-full cursor-pointer transition flex items-center gap-1"
            >
              <X className="h-3.5 w-3.5" />
              <span>Close</span>
            </button>
            <img 
              src={lightboxImage} 
              alt="Enlarged complaint view" 
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
