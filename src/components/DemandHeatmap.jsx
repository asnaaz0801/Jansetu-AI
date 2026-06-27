import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

export default function DemandHeatmap({ complaints, highContrast }) {
  // Center map around Delhi (Ward 1 area)
  const defaultPosition = { lat: 28.6139, lng: 77.2090 };

  return (
    <div className={`border rounded-2xl p-6 transition-all ${
      highContrast 
        ? 'bg-[#1e293b] border-yellow-500/20 text-yellow-300 shadow-yellow-500/5' 
        : 'bg-white border-slate-200 text-slate-800 shadow-sm'
    } space-y-4`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse"></span>
            Demand Heatmap (Live)
          </h2>
          <p className="text-xs opacity-70 mt-1 font-semibold">Geospatial distribution of submitted citizen issues and urgency</p>
        </div>
        <div className="flex flex-wrap gap-4 text-xs font-semibold">
          <div className={`flex items-center gap-2 border px-3 py-1.5 rounded-xl ${
            highContrast ? 'bg-slate-900 border-yellow-500/30 text-yellow-300' : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}>
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block shadow-md"></span>
            <span>High Urgency (≥50 votes / Safety / Health)</span>
          </div>
          <div className={`flex items-center gap-2 border px-3 py-1.5 rounded-xl ${
            highContrast ? 'bg-slate-900 border-yellow-500/30 text-yellow-300' : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}>
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block shadow-md"></span>
            <span>Medium Urgency</span>
          </div>
        </div>
      </div>

      <div className={`h-96 w-full rounded-xl overflow-hidden border relative flex items-center justify-center ${
        highContrast ? 'border-yellow-500/20 bg-slate-950' : 'border-slate-200 bg-slate-100'
      }`}>
        <APIProvider apiKey="YOUR_GOOGLE_MAPS_API_KEY">
          <Map
            defaultCenter={defaultPosition}
            defaultZoom={12}
            mapId="YOUR_MAP_ID"
            className="w-full h-full"
            gestureHandling="cooperative"
            disableDefaultUI={false}
          >
            {complaints &&
              complaints.map((complaint) => {
                // Skip rendering if no coordinates are present
                if (typeof complaint.lat !== 'number' || typeof complaint.lng !== 'number') {
                  return null;
                }

                // High urgency is defined as 50+ votes or critical categories (Public Safety, Healthcare)
                const isHighUrgency =
                  complaint.votes >= 50 ||
                  complaint.category === 'Public Safety' ||
                  complaint.category === 'Healthcare';

                return (
                  <AdvancedMarker
                    key={complaint.id}
                    position={{ lat: complaint.lat, lng: complaint.lng }}
                    title={`${complaint.title} (${complaint.category})`}
                  >
                    <Pin
                      background={isHighUrgency ? '#EF4444' : '#F59E0B'}
                      borderColor={isHighUrgency ? '#B91C1C' : '#D97706'}
                      glyphColor="#FFFFFF"
                      scale={1.1}
                    />
                  </AdvancedMarker>
                );
              })}
          </Map>
        </APIProvider>
      </div>
    </div>
  );
}
