// Mock database service simulating local storage database for Constituency Analytics
// Centered around Central Delhi (Ward W-04/W-02/W-07 areas)

const MOCK_COMPLAINTS = [
  {
    id: 'JSA-2026-0001',
    title: 'Severe potholes on Rajpath Road near India Gate',
    description: 'Multiple deep potholes have formed on the main Rajpath crossing. Vehicles are swerving unexpectedly, creating high risks of accidents during peak traffic hours.',
    category: 'Roads',
    location: 'Ward 4 (Central Secretariat)',
    submittedBy: 'Rahul Sharma',
    votes: 42,
    severity: 4,
    status: 'Pending',
    createdAt: '2026-06-25T08:30:00Z',
    lat: 28.6145,
    lng: 77.2085,
  },
  {
    id: 'JSA-2026-0002',
    title: 'Overflowing commercial garbage dump in Connaught Place Block E',
    description: 'Commercial waste has piled up outside the designated bins. Foul smell is spreading, and stray animals are dispersing garbage onto the pedestrian walkways.',
    category: 'Garbage',
    location: 'Ward 7 (Connaught Place)',
    submittedBy: 'Priya Patel',
    votes: 89,
    severity: 3,
    status: 'In Progress',
    createdAt: '2026-06-05T14:15:00Z',
    lat: 28.6304,
    lng: 77.2177,
  },
  {
    id: 'JSA-2026-0003',
    title: 'Water supply pipeline leakage in Chanakyapuri park sector 4',
    description: 'The main underground supply pipe has burst, causing thousands of gallons of clean drinking water to flood the public park. Water pressure in the residential colony is extremely low.',
    category: 'Water Supply',
    location: 'Ward 2 (Chanakyapuri)',
    submittedBy: 'Amit Verma',
    votes: 124,
    severity: 5,
    status: 'Pending',
    createdAt: '2026-06-21T09:00:00Z',
    lat: 28.5960,
    lng: 77.1950,
  },
  {
    id: 'JSA-2026-0004',
    title: 'Exposed wires and sparks from local transformer in Karol Bagh',
    description: 'The high-voltage transformer box is left open. Sparking occurs during light showers, causing severe safety threats to pedestrians on the narrow lane.',
    category: 'Electricity',
    location: 'Ward 9 (Karol Bagh)',
    submittedBy: 'Sanjay Singh',
    votes: 67,
    severity: 5,
    status: 'In Progress',
    createdAt: '2026-06-22T08:30:00Z',
    lat: 28.6450,
    lng: 77.1900,
  },
  {
    id: 'JSA-2026-0005',
    title: 'Broken street lights on Dwarka Sector 11 main walking path',
    description: 'All 8 street lights along the Sector 11 walking track are non-functional for a week. Residents feel unsafe walking there after 7 PM.',
    category: 'Street Lights',
    location: 'Ward 11 (Dwarka)',
    submittedBy: 'Neha Gupta',
    votes: 18,
    severity: 2,
    status: 'Resolved',
    createdAt: '2026-06-18T10:00:00Z',
    lat: 28.5920,
    lng: 77.0450,
  },
  {
    id: 'JSA-2026-0006',
    title: 'Clogged storm water drainage line causing street flooding in Lajpat Nagar',
    description: 'The drainage pipes are completely choked with plastic bags. The entire street is flooded with 1 foot of stagnant water, entering residential ground floor corridors.',
    category: 'Drainage',
    location: 'Ward 6 (Lajpat Nagar)',
    submittedBy: 'Vikram Malhotra',
    votes: 95,
    severity: 4,
    status: 'Pending',
    createdAt: '2026-06-20T11:45:00Z',
    lat: 28.5700,
    lng: 77.2400,
  },
  {
    id: 'JSA-2026-0007',
    title: 'Safety concerns due to dark spots and lack of patrolling in Safdarjung Enclave',
    description: 'Several streetlights are missing near the community park corner. Dark spots have become active zones for anti-social elements. Urgent lighting and CCTV installations are needed.',
    category: 'Public Safety',
    location: 'Ward 5 (Safdarjung)',
    submittedBy: 'Sunita Rao',
    votes: 110,
    severity: 4,
    status: 'Pending',
    createdAt: '2026-06-19T17:30:00Z',
    lat: 28.5650,
    lng: 77.2000,
  },
  // Clustered high-density complaints around Central Secretariat to create a strong hotspot
  {
    id: 'JSA-2026-0008',
    title: 'Pothole cave-in on Rafi Marg near Parliament Street',
    description: 'A major section of the asphalt has caved in, forming a massive pothole. Police have set up temporary barricades, but it is causing huge traffic congestion.',
    category: 'Roads',
    location: 'Ward 4 (Central Secretariat)',
    submittedBy: 'Karan Johar',
    votes: 55,
    severity: 5,
    status: 'Pending',
    createdAt: '2026-06-24T09:15:00Z',
    lat: 28.6140,
    lng: 77.2080,
  },
  {
    id: 'JSA-2026-0009',
    title: 'Broken road divider on Janpath crossing causing collisions',
    description: 'The concrete divider is smashed and debris is scattered in the middle of the road. Night drivers are unable to see it, leading to close calls.',
    category: 'Roads',
    location: 'Ward 4 (Central Secretariat)',
    submittedBy: 'Sneha Patil',
    votes: 38,
    severity: 4,
    status: 'Pending',
    createdAt: '2026-06-25T11:00:00Z',
    lat: 28.6152,
    lng: 77.2095,
  },
  {
    id: 'JSA-2026-0010',
    title: 'Overflowing sewage drain near Shastri Bhawan gate',
    description: 'Black sludge and sewer water are bubbling out of the manhole on the main footpath. Pedestrians are forced to walk on the busy motorable road.',
    category: 'Drainage',
    location: 'Ward 4 (Central Secretariat)',
    submittedBy: 'Anil Mehta',
    votes: 72,
    severity: 3,
    status: 'In Progress',
    createdAt: '2026-06-24T12:00:00Z',
    lat: 28.6135,
    lng: 77.2088,
  },
  {
    id: 'JSA-2026-0011',
    title: 'Littering and unswept garbage pile near Krishi Bhawan garden',
    description: 'Garbage bins are overflowing, and dry leaves combined with plastic bottles are piled up along the boundary wall. Needs immediate municipal sweepers.',
    category: 'Garbage',
    location: 'Ward 4 (Central Secretariat)',
    submittedBy: 'Ramesh Dev',
    votes: 21,
    severity: 2,
    status: 'Pending',
    createdAt: '2026-06-25T15:30:00Z',
    lat: 28.6148,
    lng: 77.2105,
  },
  {
    id: 'JSA-2026-0012',
    title: 'Defective street lights making Rajpath walking tracks unsafe',
    description: 'Three consecutive street lights on the jogging trail are flickering or completely dead. Heavy footfall in the evening makes it a high priority safety concern.',
    category: 'Public Safety',
    location: 'Ward 4 (Central Secretariat)',
    submittedBy: 'Meenakshi Iyer',
    votes: 62,
    severity: 5,
    status: 'Pending',
    createdAt: '2026-06-23T20:45:00Z',
    lat: 28.6128,
    lng: 77.2075,
  },
  // Additional complaints scattered in near-central region
  {
    id: 'JSA-2026-0013',
    title: 'Continuous water leakage from valve near Barakhamba metro gate',
    description: 'Water has been bubbling out from the water pipe joint, making the metro station exit muddy and slippery.',
    category: 'Water Supply',
    location: 'Ward 2 (Chanakyapuri)',
    submittedBy: 'Rajiv Malhotra',
    votes: 35,
    severity: 3,
    status: 'In Progress',
    createdAt: '2026-06-22T10:15:00Z',
    lat: 28.6250,
    lng: 77.2200,
  },
  {
    id: 'JSA-2026-0014',
    title: 'Flickering street light on Ferozeshah Road corner',
    description: 'The street light keeps blinking, creating strobe effect and distraction for night drivers. Needs bulb replacement.',
    category: 'Street Lights',
    location: 'Ward 2 (Chanakyapuri)',
    submittedBy: 'Divya Sen',
    votes: 12,
    severity: 2,
    status: 'Resolved',
    createdAt: '2026-06-21T21:00:00Z',
    lat: 28.6260,
    lng: 77.2210,
  },
  {
    id: 'JSA-2026-0015',
    title: 'Road patch repair required on Tolstoy Road near school',
    description: 'The road tarmac has weathered off completely, causing deep gravel and dust. Children walking to school are breathing heavy dust, and two-wheelers are slipping.',
    category: 'Roads',
    location: 'Ward 2 (Chanakyapuri)',
    submittedBy: 'Robert T.',
    votes: 78,
    severity: 4,
    status: 'Resolved',
    createdAt: '2026-06-20T09:00:00Z',
    lat: 28.6240,
    lng: 77.2190,
  },
  {
    id: 'JSA-2026-0016',
    title: 'Frequent voltage surges burning household appliances in Chanakyapuri',
    description: 'Power fluctuates wildly from 180V to 290V. Three households have reported damaged refrigerators and LED bulbs. Substation inspection needed.',
    category: 'Electricity',
    location: 'Ward 2 (Chanakyapuri)',
    submittedBy: 'Gopal Krishnan',
    votes: 49,
    severity: 3,
    status: 'Pending',
    createdAt: '2026-06-25T11:20:00Z',
    lat: 28.6010,
    lng: 77.2180,
  },
  {
    id: 'JSA-2026-0017',
    title: 'Blocked kitchen waste drainage line in government colony quarters',
    description: 'The main sewer output is clogged. Waste water is backing up in ground floor sinks, resulting in unhygienic conditions.',
    category: 'Drainage',
    location: 'Ward 2 (Chanakyapuri)',
    submittedBy: 'Harish Rawat',
    votes: 52,
    severity: 4,
    status: 'In Progress',
    createdAt: '2026-06-24T08:00:00Z',
    lat: 28.6020,
    lng: 77.2190,
  },
  {
    id: 'JSA-2026-0018',
    title: 'Illegally dumped construction debris block sidewalk near Lodhi Road',
    description: 'Massive concrete debris and bricks are dumped on the public walking footpath, forcing pedestrians, including seniors, to walk on the speeding motor lane.',
    category: 'Garbage',
    location: 'Ward 8 (Lodhi Estate)',
    submittedBy: 'Savita Devi',
    votes: 29,
    severity: 3,
    status: 'Pending',
    createdAt: '2026-06-24T16:45:00Z',
    lat: 28.5900,
    lng: 77.2220,
  }
];

// Initialize local storage if empty
const initDB = () => {
  if (!localStorage.getItem('peoples_priorities')) {
    localStorage.setItem('peoples_priorities', JSON.stringify(MOCK_COMPLAINTS));
  }
};

export const db = {
  // Get all priorities
  getPriorities: async () => {
    initDB();
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    return JSON.parse(localStorage.getItem('peoples_priorities'));
  },

  // Add a new priority
  submitPriority: async (priorityData) => {
    initDB();
    await new Promise((resolve) => setTimeout(resolve, 400));
    const current = JSON.parse(localStorage.getItem('peoples_priorities'));
    const newPriority = {
      id: priorityData.id || `JSA-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      title: priorityData.title,
      description: priorityData.description,
      category: priorityData.category,
      location: priorityData.location,
      submittedBy: priorityData.submittedBy || 'Anonymous Citizen',
      votes: priorityData.votes || 1,
      severity: typeof priorityData.severity === 'number' ? priorityData.severity : 3,
      status: priorityData.status || 'Pending',
      createdAt: priorityData.createdAt || new Date().toISOString(),
      lat: typeof priorityData.lat === 'number' ? priorityData.lat : null,
      lng: typeof priorityData.lng === 'number' ? priorityData.lng : null,
    };
    current.unshift(newPriority);
    localStorage.setItem('peoples_priorities', JSON.stringify(current));
    return newPriority;
  },

  // Upvote a priority
  upvotePriority: async (id) => {
    initDB();
    const current = JSON.parse(localStorage.getItem('peoples_priorities'));
    const updated = current.map((p) => {
      if (p.id === id) {
        return { ...p, votes: p.votes + 1 };
      }
      return p;
    });
    localStorage.setItem('peoples_priorities', JSON.stringify(updated));
    return updated.find((p) => p.id === id);
  },

  // Admin: Update priority status
  updateStatus: async (id, status) => {
    initDB();
    const current = JSON.parse(localStorage.getItem('peoples_priorities'));
    const updated = current.map((p) => {
      if (p.id === id) {
        return { ...p, status };
      }
      return p;
    });
    localStorage.setItem('peoples_priorities', JSON.stringify(updated));
    return updated.find((p) => p.id === id);
  },
};
