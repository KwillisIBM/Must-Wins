import { Button } from '@carbon/react';
import {
  ChartNetwork,
  Catalog,
  Filter,
  Chat,
  Edit,
  Information,
  ArrowRight,
} from '@carbon/icons-react';
import './About.css';

const HOW_TO = [
  {
    icon: ChartNetwork,
    title: 'Explore the Architecture',
    body: 'The home page maps the IBM FSM Must Wins architecture. Click the chevron on any tile to open details and jump to filtered use cases for that Must Win category.',
  },
  {
    icon: Catalog,
    title: 'Browse Use Cases',
    body: 'Navigate to "Must Win Golden Paths" to see all submitted use cases. Expand a card to read the full narrative, golden path steps, pitch, and supporting content links.',
  },
  {
    icon: Filter,
    title: 'Filter the List',
    body: 'Use the Company, Must Wins, and Product filters to narrow the use case list. Combine filters freely — clear them all with one click.',
  },
  {
    icon: Information,
    title: 'Read the Color Code',
    body: 'Card headers are color-coded by Must Win category. Click the ⓘ icon next to the page title to see the full legend.',
  },
  {
    icon: Chat,
    title: 'Comment and Like',
    body: 'Expand any use case to leave a comment or like it. Likes and comments are visible to everyone and update in real time.',
  },
  {
    icon: Edit,
    title: 'Submit a Use Case',
    body: 'Click "Submit a Use Case" on the Use Cases page to contribute. Fill in the narrative, golden path, pitch, and links — your submission appears instantly.',
  },
];

export default function About({ onNavigate }) {
  return (
    <div className="about-page">

      {/* ── Banner ─────────────────────────────────────────────────── */}
      <div className="about-banner">
        <div className="about-banner-inner">
          <div className="about-banner-text">
            <p className="about-eyebrow">About this page</p>
            <h1 className="about-heading">FSM Must Wins Architecture Hub</h1>
            <p className="about-subheading">
              A living resource mapping the 2026 FSM Must Wins to our Client Architecture.
              Explore real customer use cases, sales play narratives, and Golden Paths —
              built to help you find the right story, faster.
            </p>
          </div>
          <div className="about-banner-logo">
            <img src="/EETeamLogo.svg" alt="Experience Engineering" className="about-ee-logo" />
          </div>
        </div>
      </div>

      {/* ── How to use — list ──────────────────────────────────────── */}
      <div className="about-list">
        {HOW_TO.map(({ icon: Icon, title, body }, i) => (
          <div key={title} className="about-list-item">
            <div className="about-list-icon">
              <Icon size={20} />
            </div>
            <div className="about-list-content">
              <span className="about-list-title">{title}</span>
              <span className="about-list-body">{body}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── CTA row ────────────────────────────────────────────────── */}
      <div className="about-cta-row">
        <div className="about-cta-text">
          <h2 className="about-cta-heading">Ready to explore?</h2>
          <p className="about-cta-sub">Start with the architecture or jump straight into use cases.</p>
        </div>
        <div className="about-cta-actions">
          <Button kind="primary" renderIcon={ArrowRight} onClick={() => onNavigate('architecture')}>
            Explore the Architecture
          </Button>
          <Button kind="tertiary" renderIcon={ArrowRight} onClick={() => onNavigate('use-cases')}>
            Browse Use Cases
          </Button>
        </div>
      </div>

      {/* ── Built by ───────────────────────────────────────────────── */}
      <div className="about-built-by">
        <img src="/EETeamLogo.svg" alt="Experience Engineering" className="about-built-logo" />
        <div className="about-built-text">
          <span className="about-built-label">Built by Experience Engineering</span>
          <span className="about-built-sub">
            <a
              href="https://ibm.enterprise.slack.com/team/U0A61PMKLKZ"
              target="_blank"
              rel="noopener noreferrer"
              className="about-built-link"
            >
              Kendall Willis
            </a>
            {' · 2026'}
          </span>
        </div>
      </div>

    </div>
  );
}
