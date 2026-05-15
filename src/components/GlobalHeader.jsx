import { useState } from 'react';
import {
  Header,
  HeaderMenuButton,
  HeaderName,
  SideNav,
  SideNavItems,
  SideNavMenu,
  SideNavMenuItem,
  SkipToContent,
} from '@carbon/react';

export default function GlobalHeader({ isDark, onToggleDark }) {
  const [isSideNavExpanded, setIsSideNavExpanded] = useState(false);

  return (
    <>
      <Header aria-label="IBM FSM Must Wins Architecture">
        <SkipToContent />
        <HeaderMenuButton
          aria-label={isSideNavExpanded ? 'Close menu' : 'Open menu'}
          onClick={() => setIsSideNavExpanded((prev) => !prev)}
          isActive={isSideNavExpanded}
        />
        <HeaderName href="#" prefix="IBM">
          FSM Must Wins Architecture
        </HeaderName>
      </Header>

      <SideNav
        aria-label="Side navigation"
        expanded={isSideNavExpanded}
        isPersistent={false}
        onSideNavBlur={() => setIsSideNavExpanded(false)}
        style={{ top: '3rem' }}
      >
        <SideNavItems>
          <SideNavMenu title="Resources" defaultExpanded={false}>
            <SideNavMenuItem href="https://secure.video.ibm.com/channel/26253188/playlist/700519" target="_blank" rel="noopener noreferrer">Must Wins Interviews</SideNavMenuItem>
            <SideNavMenuItem href="#">WxW Must Wins Tutor</SideNavMenuItem>
            <SideNavMenuItem href="https://navattic-demos-np.dinero.techzone.ibm.com/" target="_blank" rel="noopener noreferrer">Must Wins Demo Library</SideNavMenuItem>
          </SideNavMenu>
          <SideNavMenuItem href="#">About this page</SideNavMenuItem>
          <SideNavMenuItem href="#">Feedback</SideNavMenuItem>
          <SideNavMenuItem
            onClick={(e) => {
              e.preventDefault();
              onToggleDark();
            }}
            href="#"
          >
            Dark Mode {isDark ? '(On)' : '(Off)'}
          </SideNavMenuItem>
        </SideNavItems>
      </SideNav>
    </>
  );
}
