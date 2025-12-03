import { Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';

// Pages - will be implemented in Block 5
import Enter from './pages/Enter';
import Choose from './pages/Choose';
import Thanks from './pages/Thanks';
import Presenter from './pages/Presenter';
import Admin from './pages/Admin';

function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-night-dark text-white font-inter">
        <Routes>
          <Route path="/" element={<Enter />} />
          <Route path="/choose" element={<Choose />} />
          <Route path="/thanks" element={<Thanks />} />
          <Route path="/presenter" element={<Presenter />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
    </AppProvider>
  );
}

export default App;

