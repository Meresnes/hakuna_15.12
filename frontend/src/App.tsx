import { Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';

// Pages
import Enter from './pages/Enter';
import Choose from './pages/Choose';
import Thanks from './pages/Thanks';
import Presenter from './pages/Presenter';
import PresenterQuestionsPage from './pages/PresenterQuestionsPage';
import Admin from './pages/Admin';
import Introduce from './pages/Introduce';

function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-bg-900 text-text-on-dark font-sans">
        <Routes>
          <Route path="/" element={<Enter />} />
          <Route path="/choose" element={<Choose />} />
          <Route path="/thanks" element={<Thanks />} />
          <Route path="/presenter" element={<Presenter />} />
          <Route path="/introduce" element={<Introduce />} />
          <Route path="/presenter/questions" element={<PresenterQuestionsPage />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
    </AppProvider>
  );
}

export default App;

