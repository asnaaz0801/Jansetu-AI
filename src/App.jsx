import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import CitizenPortal from './pages/CitizenPortal';
import MpDashboard from './pages/MpDashboard';
import TrackRequest from './pages/TrackRequest';
import SubmitIssue from './pages/SubmitIssue';

function App() {
  const [language, setLanguage] = useState('en'); // 'en' | 'hi' | 'mr'
  const [fontSize, setFontSize] = useState(16); // font size in px
  const [highContrast, setHighContrast] = useState(false);

  return (
    <Router>
      <div 
        style={{ fontSize: `${fontSize}px` }}
        className={`min-h-screen flex flex-col font-sans antialiased transition-colors duration-200 ${
          highContrast 
            ? 'bg-[#0f172a] text-[#fef08a] selection:bg-[#fef08a] selection:text-black border-yellow-400' 
            : 'bg-[#F5F5F5] text-slate-800 selection:bg-[#000080] selection:text-white'
        }`}
      >
        <Navbar 
          language={language} 
          setLanguage={setLanguage}
          fontSize={fontSize}
          setFontSize={setFontSize}
          highContrast={highContrast}
          setHighContrast={setHighContrast}
        />
        <div className="flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={
              <CitizenPortal 
                language={language}
                fontSize={fontSize}
                highContrast={highContrast}
              />
            } />
            <Route path="/submit" element={
              <SubmitIssue 
                language={language}
                fontSize={fontSize}
                highContrast={highContrast}
              />
            } />
            <Route path="/dashboard" element={
              <MpDashboard 
                language={language}
                fontSize={fontSize}
                highContrast={highContrast}
              />
            } />
            <Route path="/track" element={
              <TrackRequest 
                language={language}
                fontSize={fontSize}
                highContrast={highContrast}
              />
            } />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
