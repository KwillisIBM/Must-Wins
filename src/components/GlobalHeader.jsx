import { useState } from 'react';
import {
  Header,
  HeaderMenuButton,
  HeaderName,
  HeaderNavigation,
  HeaderMenuItem,
  HeaderGlobalBar,
  HeaderGlobalAction,
  SideNav,
  SideNavItems,
  SideNavMenu,
  SideNavMenuItem,
  SkipToContent,
} from '@carbon/react';
import { Help } from '@carbon/icons-react';

export default function GlobalHeader({ isDark, onToggleDark, currentView, onNavigate }) {
  const [isSideNavExpanded, setIsSideNavExpanded] = useState(false);

  const closeNav = () => setIsSideNavExpanded(false);

  const handleNavigate = (view) => {
    onNavigate(view);
    closeNav();
  };

  return (
    <>
      <Header aria-label="IBM FSM Must Wins Architecture">
        <SkipToContent />
        <HeaderMenuButton
          aria-label={isSideNavExpanded ? 'Close menu' : 'Open menu'}
          onClick={() => setIsSideNavExpanded((prev) => !prev)}
          isActive={isSideNavExpanded}
        />
        <HeaderName
          href="#"
          prefix="IBM"
          onClick={(e) => { e.preventDefault(); onNavigate('architecture'); }}
        >
          FSM Must Wins Architecture
        </HeaderName>
        <HeaderNavigation>
          <HeaderMenuItem href="https://secure.video.ibm.com/channel/26253188/playlist/700519" target="_blank" rel="noopener noreferrer">Must Wins Interviews</HeaderMenuItem>
          <HeaderMenuItem href="https://workshop.ibm.com/agent/63f1c1de-a9e0-418c-a2d4-7128d503d42a/" target="_blank" rel="noopener noreferrer">WxW Must Wins Tutor</HeaderMenuItem>
          <HeaderMenuItem href="https://navattic-demos-np.dinero.techzone.ibm.com/" target="_blank" rel="noopener noreferrer">Must Wins Demo Library</HeaderMenuItem>
        </HeaderNavigation>
        <HeaderGlobalBar>
          <HeaderGlobalAction
            aria-label="About"
            title="About this page"
            isActive={currentView === 'about'}
            onClick={() => handleNavigate('about')}
          >
            <Help size={20} />
          </HeaderGlobalAction>
        </HeaderGlobalBar>
      </Header>

      <SideNav
        aria-label="Side navigation"
        expanded={isSideNavExpanded}
        isPersistent={false}
        onSideNavBlur={closeNav}
        style={{ top: '3rem' }}
      >
        <SideNavItems>
          <SideNavMenu title="Resources" defaultExpanded>
            <SideNavMenuItem href="https://secure.video.ibm.com/channel/26253188/playlist/700519" target="_blank" rel="noopener noreferrer">Must Wins Interviews</SideNavMenuItem>
            <SideNavMenuItem href="https://workshop.ibm.com/agent/63f1c1de-a9e0-418c-a2d4-7128d503d42a/" target="_blank" rel="noopener noreferrer">WxW Must Wins Tutor</SideNavMenuItem>
            <SideNavMenuItem href="https://navattic-demos-np.dinero.techzone.ibm.com/" target="_blank" rel="noopener noreferrer">Must Wins Demo Library</SideNavMenuItem>
            <SideNavMenuItem
              href="#"
              isActive={currentView === 'use-cases'}
              onClick={(e) => { e.preventDefault(); handleNavigate('use-cases'); }}
            >
              Must Win Golden Paths
            </SideNavMenuItem>
          </SideNavMenu>
          <SideNavMenuItem
            href="#"
            onClick={(e) => { e.preventDefault(); onToggleDark(); }}
          >
            Dark Mode {isDark ? '(On)' : '(Off)'}
          </SideNavMenuItem>
        </SideNavItems>
      </SideNav>
    </>
  );
}
