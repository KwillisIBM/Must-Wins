import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Theme } from '@carbon/react';
import GlobalHeader from './components/GlobalHeader';
import ArchitectureGrid from './components/ArchitectureGrid';
import UseCases from './components/UseCases';
import SubmitUseCase from './components/SubmitUseCase';
import About from './components/About';
import FidelityArchitecturePage from './components/views/FidelityArchitecturePage';
import { fetchUseCases, fetchCurrentUser } from './services/dbService';
import { MUST_WIN_CATEGORIES } from './data/mustWinsData';
import './App.css';

// All categories open by default
const DEFAULT_CATEGORIES_OPEN = Object.fromEntries(MUST_WIN_CATEGORIES.map((c) => [c, true]));

function AppInner() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isDark, setIsDark] = useState(false);
  const [useCases, setUseCases] = useState([]);
  const [loadingUseCases, setLoadingUseCases] = useState(true);
  const [categoriesOpen, setCategoriesOpen] = useState(DEFAULT_CATEGORIES_OPEN);
  const [previewAsUser, setPreviewAsUser] = useState(false);

  const refreshUseCases = useCallback(() => {
    fetchUseCases().then((data) => {
      setUseCases(data);
      setLoadingUseCases(false);
    });
  }, []);

  // Initial data load
  useEffect(() => {
    fetchUseCases().then((data) => {
      setUseCases(data);
      setLoadingUseCases(false);
    });
  }, []);

  // Check admin status on mount — identity comes from oauth2-proxy via /api/me
  useEffect(() => {
    fetchCurrentUser().then(user => {
      if (user?.email) {
        setUserEmail(user.email);
        setIsAdmin(user.isAdmin === true);
      }
    });
  }, []);

  return (
    <Theme theme={isDark ? 'g100' : 'white'}>
      <div className={`app-root${isDark ? ' dark' : ''}`}>
        <GlobalHeader
          isDark={isDark}
          onToggleDark={() => setIsDark((d) => !d)}
        />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<ArchitectureGrid isDark={isDark} />} />
            <Route
              path="/use-cases"
              element={
                <UseCases
                  isAdmin={isAdmin}
                  userEmail={userEmail}
                  isDark={isDark}
                  useCases={useCases}
                  loading={loadingUseCases}
                  onUseCasesChange={setUseCases}
                  refreshUseCases={refreshUseCases}
                  categoriesOpen={categoriesOpen}
                  onCategoryToggle={(cat) =>
                    setCategoriesOpen((prev) => ({ ...prev, [cat]: !prev[cat] }))
                  }
                  previewAsUser={previewAsUser}
                  onPreviewAsUserChange={setPreviewAsUser}
                />
              }
            />
            <Route path="/submit" element={<SubmitUseCase />} />
            <Route path="/about" element={<About isDark={isDark} />} />
            <Route path="/use-cases/fidelity-architecture" element={<FidelityArchitecturePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Theme>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
}
