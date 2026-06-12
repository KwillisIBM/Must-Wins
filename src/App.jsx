import { useState, useEffect } from 'react';
import { Theme } from '@carbon/react';
import GlobalHeader from './components/GlobalHeader';
import ArchitectureGrid from './components/ArchitectureGrid';
import UseCases from './components/UseCases';
import SubmitUseCase from './components/SubmitUseCase';
import About from './components/About';
import { fetchUseCases } from './services/dbService';
import './App.css';

const EMPTY_FILTERS = { company: '', mustWin: '', product: '' };

export default function App() {
  const [isDark, setIsDark] = useState(false);
  const [currentView, setCurrentView] = useState('architecture');
  const [useCases, setUseCases] = useState([]);
  const [loadingUseCases, setLoadingUseCases] = useState(true);
  const [useCasesFilters, setUseCasesFilters] = useState(EMPTY_FILTERS);

  useEffect(() => {
    fetchUseCases()
      .then(setUseCases)
      .finally(() => setLoadingUseCases(false));
  }, []);

  const handleUseCaseSubmit = (entry) => {
    setUseCases((prev) => [entry, ...prev]);
    setCurrentView('use-cases');
  };

  const navigateToUseCases = (filters = {}) => {
    setUseCasesFilters({ ...EMPTY_FILTERS, ...filters });
    setCurrentView('use-cases');
  };

  return (
    <Theme theme={isDark ? 'g100' : 'white'}>
      <div className={`app-root${isDark ? ' dark' : ''}`}>
        <GlobalHeader
          isDark={isDark}
          onToggleDark={() => setIsDark((d) => !d)}
          currentView={currentView}
          onNavigate={setCurrentView}
        />
        <main className="app-main">
          {currentView === 'architecture' && (
            <ArchitectureGrid onNavigateToUseCases={navigateToUseCases} />
          )}
          {currentView === 'use-cases' && (
            <UseCases
              useCases={useCases}
              loading={loadingUseCases}
              onNavigate={setCurrentView}
              filters={useCasesFilters}
              onFiltersChange={setUseCasesFilters}
            />
          )}
          {currentView === 'submit-use-case' && (
            <SubmitUseCase
              onSubmit={handleUseCaseSubmit}
              onCancel={() => setCurrentView('use-cases')}
            />
          )}
          {currentView === 'about' && (
            <About onNavigate={setCurrentView} />
          )}

        </main>
      </div>
    </Theme>
  );
}
