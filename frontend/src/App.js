import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import SubmissionDetail from './components/SubmissionDetail';
import AdminPage from './components/AdminPage';
import Forbidden from './components/Forbidden';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/submission/:submissionId" element={<SubmissionDetail />} />
        <Route path='/userManagement' element={<AdminPage/>} />
        <Route path='/403' element={<Forbidden/>}/>
      </Routes>
    </Router>
  );
}

export default App;