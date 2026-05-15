import { useState } from 'react';
import { Theme } from '@carbon/react';
import GlobalHeader from './components/GlobalHeader';
import ArchitectureGrid from './components/ArchitectureGrid';
import './App.css';

export default function App() {
  const [isDark, setIsDark] = useState(false);

  return (
    <Theme theme={isDark ? 'g100' : 'white'}>
      <div className={`app-root${isDark ? ' dark' : ''}`}>
        <GlobalHeader isDark={isDark} onToggleDark={() => setIsDark((d) => !d)} />
        <main className="app-main">
          <ArchitectureGrid />
        </main>
      </div>
    </Theme>
  );
}
