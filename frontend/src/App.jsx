import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Intro from './pages/Intro';
import Dashboard from './pages/Dashboard';
import Tools from './pages/Tools';
import Login from './pages/Login';
import Register from './pages/Register';
import Chatbot from './pages/Chatbot';
import Quiz from './pages/Quiz';
import DbAdmin from './pages/DbAdmin';
import ThreatRadar from './pages/ThreatRadar';
import NeuralNet from './pages/NeuralNet';
import MalwareSandbox from './pages/MalwareSandbox';
import DarkWeb from './pages/DarkWeb';
import KillChain from './pages/KillChain';
import VolumetricShield from './pages/VolumetricShield';
import ZeroTrust from './pages/ZeroTrust';
import CryptoTracker from './pages/CryptoTracker';
import CloudMesh from './pages/CloudMesh';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-black">
        <div className="bg-aurora">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
          <div className="orb orb-3"></div>
        </div>
        <Routes>
          <Route path="/" element={<Intro />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/chatbot" element={<Chatbot />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/dbadmin" element={<DbAdmin />} />
          <Route path="/threat-map" element={<ThreatRadar />} />
          <Route path="/neural-net" element={<NeuralNet />} />
          <Route path="/sandbox" element={<MalwareSandbox />} />
          <Route path="/dark-web" element={<DarkWeb />} />
          <Route path="/kill-chain" element={<KillChain />} />
          <Route path="/volumetric-shield" element={<VolumetricShield />} />
          <Route path="/zero-trust" element={<ZeroTrust />} />
          <Route path="/crypto-tracker" element={<CryptoTracker />} />
          <Route path="/cloud-mesh" element={<CloudMesh />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}
export default App;
