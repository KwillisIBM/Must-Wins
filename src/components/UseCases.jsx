import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Tag,
  TextArea,
  Button,
  Select,
  SelectItem,
  Popover,
  PopoverContent,
  TextInput,
} from '@carbon/react';
import {
  Favorite, FavoriteFilled, Chat, ChevronDown, ChevronUp,
  ChevronRight,
  Document,
  UvIndex,
  ArrowDown,
  Home,
  PresentationFile,
  Launch,
  Checkmark,
  Information,
  Close,
} from '@carbon/icons-react';
import { fetchLikes, incrementLike, fetchComments, addComment } from '../services/dbService';
import { getMustWinByName, CATEGORY_COLOR_CLASS, MUST_WIN_CATEGORIES } from '../data/mustWinsData';
import './UseCases.css';

// ─── Social hook — isolates all likes/comments state per use case ─────────────
function useSocial(useCaseId) {
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [draft, setDraft] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchLikes(useCaseId).then(setLikes);
    fetchComments(useCaseId).then(setComments);
  }, [useCaseId]);

  const handleLike = useCallback(async () => {
    if (liked) return;
    const newCount = await incrementLike(useCaseId);
    setLikes(newCount);
    setLiked(true);
  }, [useCaseId, liked]);

  const handleAddComment = useCallback(async () => {
    const text = draft.trim();
    if (!text) return;
    setSubmitting(true);
    const comment = await addComment(useCaseId, text);
    setComments((prev) => [...prev, comment]);
    setDraft('');
    setSubmitting(false);
  }, [useCaseId, draft]);

  return { likes, liked, comments, draft, setDraft, submitting, handleLike, handleAddComment };
}

// ─── Comments panel (right column — always visible while expanded) ────────────
function CommentsPanel({ useCaseId }) {
  const { likes, liked, comments, draft, setDraft, submitting, handleLike, handleAddComment } =
    useSocial(useCaseId);
  const listRef = useRef(null);

  // Scroll to bottom whenever a new comment appears
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [comments.length]);

  return (
    <div className="uc-comments-panel">
      <div className="uc-comments-header">
        <span className="uc-comments-title">Comments</span>
        <div className="uc-social-icons">
          <span className="uc-social-count">{likes}</span>
          <button
            type="button"
            className={`uc-icon-btn${liked ? ' uc-icon-btn--active' : ''}`}
            onClick={handleLike}
            aria-label="Like this use case"
            title={liked ? 'Liked' : 'Like'}
          >
            {liked ? <FavoriteFilled size={20} /> : <Favorite size={20} />}
          </button>
          <span className="uc-social-count">{comments.length}</span>
          <Chat size={20} className="uc-chat-icon" />
        </div>
      </div>

      <div className="uc-comments-list" ref={listRef}>
        {comments.length === 0 ? (
          <p className="uc-comments-empty">No comments yet. Be the first.</p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="uc-comment">
              <span className="uc-comment-author">{c.author}</span>
              <p className="uc-comment-text">{c.text}</p>
            </div>
          ))
        )}
      </div>

      <div className="uc-comments-input">
        <TextArea
          labelText="Add a comment"
          placeholder="Share your thoughts..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          enableCounter
          maxCount={300}
        />
        <Button
          kind="primary"
          size="sm"
          disabled={!draft.trim() || submitting}
          onClick={handleAddComment}
          className="uc-comment-submit"
        >
          Post
        </Button>
      </div>
    </div>
  );
}

// ─── Interactive Golden Path stepper ─────────────────────────────────────────
function normalizeStep(s) {
  if (typeof s !== 'string') return s;
  try { const p = JSON.parse(s); return { label: p.label || s, description: p.description || '' }; }
  catch { return { label: s, description: '' }; }
}

function GoldenPathContent({ useCase, activeNode, onSelect }) {
  const steps = useCase.goldenPathSteps.map(normalizeStep);
  const activeStep = activeNode === 'golden-path'
    ? 0
    : parseInt(activeNode.replace('golden-path-step-', ''), 10);

  const selectStep = (i) => onSelect(`golden-path-step-${i}`);
  const handlePrev = () => { if (activeStep > 0) selectStep(activeStep - 1); };
  const handleNext = () => { if (activeStep < steps.length - 1) selectStep(activeStep + 1); };

  const current = steps[activeStep] ?? { label: '', description: '' };

  return (
    <div className="uc-content-area uc-golden-path">
      <h2 className="uc-content-heading">The Golden Path</h2>

      {/* Horizontal step tabs */}
      <div className="gp-tabs">
        {steps.map((step, i) => {
          const isDone = i < activeStep;
          const isActive = i === activeStep;
          return (
            <button
              key={i}
              type="button"
              className={`gp-tab${isActive ? ' gp-tab--active' : ''}${isDone ? ' gp-tab--done' : ''}`}
              onClick={() => selectStep(i)}
              title={step.label}
            >
              <span className="gp-tab-badge">
                {isDone ? <Checkmark size={10} /> : i + 1}
              </span>
              <span className="gp-tab-label">{step.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active step panel */}
      <div className="gp-panel">
        <p className="gp-panel-meta">Step {String(activeStep + 1).padStart(2, '0')} of {steps.length}</p>
        <h3 className="gp-panel-heading">{current.label}</h3>
        {current.description ? (
          <p className="gp-panel-body">{current.description}</p>
        ) : (
          <p className="gp-panel-summary">{useCase.goldenPathSummary}</p>
        )}
      </div>

      {/* Prev / Next navigation */}
      <div className="gp-nav">
        <Button kind="secondary" size="sm" disabled={activeStep === 0} onClick={handlePrev}>
          Previous
        </Button>
        <Button kind="primary" size="sm" disabled={activeStep === steps.length - 1} onClick={handleNext}>
          Next
        </Button>
      </div>
    </div>
  );
}

// ─── Center content area — driven by TreeView selection ──────────────────────
function ContentArea({ useCase, activeNode, onSelect }) {
  if (!activeNode) {
    return (
      <div className="uc-content-area uc-content-empty">
        <p>Select a topic from the menu on the left.</p>
      </div>
    );
  }

  if (activeNode === 'must-win') {
    const details = useCase.mustWinDetails || getMustWinByName(useCase.mustWinName)?.details || '';
    return (
      <div className="uc-content-area">
        <h2 className="uc-content-heading">{useCase.mustWinName}</h2>
        <p className="uc-content-body">{details}</p>
      </div>
    );
  }

  if (activeNode === 'narrative') {
    let heading;
    if (useCase.cardHeader) {
      heading = useCase.cardHeader;
    } else {
      const first = useCase.narrative.split(/\.(?:\s|$)/)[0].trim();
      const mentionsCompany = !useCase.company ||
        first.toLowerCase().includes(useCase.company.toLowerCase());
      const raw = mentionsCompany
        ? `${first}.`
        : `${useCase.company} — ${first.charAt(0).toLowerCase() + first.slice(1)}.`;
      heading = raw.length > 130 ? raw.slice(0, 130).replace(/\W+\S*$/, '') + '.' : raw;
    }
    return (
      <div className="uc-content-area">
        <h2 className="uc-content-heading">{heading}</h2>
        <p className="uc-content-body">{useCase.narrative}</p>
      </div>
    );
  }

  if (activeNode === 'pitch') {
    return (
      <div className="uc-content-area">
        <h2 className="uc-content-heading">The Pitch</h2>
        <p className="uc-content-body">{useCase.pitch}</p>
      </div>
    );
  }

  if (activeNode === 'content') {
    const links = (useCase.links ?? []).filter((l) => l.url && l.title);
    return (
      <div className="uc-content-area">
        <h2 className="uc-content-heading">The Content</h2>
        {links.length === 0 ? (
          <p className="uc-content-body">No links have been added for this use case.</p>
        ) : (
          <div className="uc-links-list">
            {links.map((link, i) => (
              <div key={i} className="uc-link-item">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="uc-link-title"
                >
                  {link.title}
                  <Launch size={14} className="uc-link-icon" />
                </a>
                {link.description && (
                  <p className="uc-link-desc">{link.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (activeNode.startsWith('golden-path')) {
    return <GoldenPathContent useCase={useCase} activeNode={activeNode} onSelect={onSelect} />;
  }

  return null;
}

// ─── Custom tree nav — owns expand/select state so Carbon internals can't
//     interfere. Styled to match Carbon's sm TreeView appearance.
function TreeNav({ useCase, activeNode, onSelect }) {
  const [goldenOpen, setGoldenOpen] = useState(false);

  const item = (id, label, Icon, depth = 0) => (
    <button
      key={id}
      type="button"
      className={`uc-tree-item uc-tree-item--d${depth}${activeNode === id ? ' uc-tree-item--active' : ''}`}
      onClick={() => onSelect(id)}
    >
      <Icon size={16} className="uc-tree-icon" />
      <span>{label}</span>
    </button>
  );

  return (
    <nav className="uc-tree-nav" aria-label="Use case navigation">
      {item('narrative', 'The Narrative', Document)}
      {item('must-win', 'The Must Win', Document)}

      {/* Golden Path branch */}
      <button
        type="button"
        className={`uc-tree-item uc-tree-item--d0 uc-tree-branch${activeNode.startsWith('golden-path') ? ' uc-tree-item--active' : ''}`}
        onClick={() => {
          setGoldenOpen((o) => !o);
          onSelect('golden-path');
        }}
      >
        <span className="uc-tree-branch-chevron">
          {goldenOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>
        <UvIndex size={16} className="uc-tree-icon" />
        <span>The Golden Path</span>
      </button>

      {goldenOpen && useCase.goldenPathSteps.map((step, i) => {
        const isLast = i === useCase.goldenPathSteps.length - 1;
        const { label } = normalizeStep(step);
        return item(`golden-path-step-${i}`, label, isLast ? Home : ArrowDown, 1);
      })}

      {item('pitch', 'The Pitch', PresentationFile)}
      {item('content', 'The Content', Launch)}
    </nav>
  );
}

// ─── Expanded drawer for a single use case ───────────────────────────────────
function UseCaseDrawer({ useCase }) {
  const [activeNode, setActiveNode] = useState('narrative');

  return (
    <div className="uc-drawer">
      {/* Left: custom tree nav */}
      <div className="uc-tree-col">
        <TreeNav useCase={useCase} activeNode={activeNode} onSelect={setActiveNode} />
      </div>

      {/* Center: dynamic content */}
      <div className="uc-content-col">
        <ContentArea useCase={useCase} activeNode={activeNode} onSelect={setActiveNode} />
      </div>

      {/* Right: persistent comments */}
      <div className="uc-comments-col">
        <CommentsPanel useCaseId={useCase.id} />
      </div>
    </div>
  );
}

// ─── Single collapsed/expanded use case row ───────────────────────────────────
// NOTE: The outer element is a <div>, not a <button>, because the social icons
// are interactive elements and HTML forbids nesting buttons inside buttons.
function UseCaseRow({ useCase, defaultExpanded = false }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const { likes, liked, comments, handleLike } = useSocial(useCase.id);
  const toggle = () => setExpanded((prev) => !prev);

  const category = getMustWinByName(useCase.mustWinName)?.category;
  const colorClass = CATEGORY_COLOR_CLASS[category] ?? 'uc-header--default';

  return (
    <div className={`uc-row${expanded ? ' uc-row--expanded' : ''}`}>
      {/* Collapsed header — always visible */}
      <div className={`uc-row-header ${colorClass}`}>
        {/* Clickable expand area: name + tags */}
        <button
          type="button"
          className="uc-row-expand-area"
          onClick={toggle}
          aria-expanded={expanded}
          aria-label={`${expanded ? 'Collapse' : 'Expand'} ${useCase.name}`}
        >
          <span className="uc-row-name">{useCase.name}</span>
          <div className="uc-row-tags">
            <Tag type="cool-gray" size="sm">{useCase.company}</Tag>
            {useCase.products.filter(Boolean).map((p) => (
              <Tag key={p} type="blue" size="sm">{p}</Tag>
            ))}
            {useCase.date && (
              <span className="uc-row-date">{useCase.date}</span>
            )}
          </div>
        </button>

        {/* Social icons — separate from expand button to avoid nesting */}
        <div className="uc-row-social">
          <span className="uc-social-count">{likes}</span>
          <button
            type="button"
            className={`uc-icon-btn${liked ? ' uc-icon-btn--active' : ''}`}
            onClick={handleLike}
            aria-label="Like"
          >
            {liked ? <FavoriteFilled size={16} /> : <Favorite size={16} />}
          </button>
          <span className="uc-social-count">{comments.length}</span>
          <Chat size={16} className="uc-chat-icon" />
        </div>

        {/* Chevron toggle button */}
        <button
          type="button"
          className="uc-row-chevron-btn"
          onClick={toggle}
          aria-label={expanded ? 'Collapse' : 'Expand'}
          tabIndex={-1}
          aria-hidden="true"
        >
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Expanded drawer */}
      {expanded && <UseCaseDrawer useCase={useCase} />}
    </div>
  );
}

// ─── Color legend entries ─────────────────────────────────────────────────────
const LEGEND = [
  { category: 'Automation',             bg: '#e8daff', dark: '#31135e' },
  { category: 'Data',                   bg: '#bae6ff', dark: '#003a6d' },
  { category: 'Hybrid Cloud',           bg: '#d0e2ff', dark: '#001d6c' },
  { category: 'Transaction Processing', bg: '#dde1e6', dark: '#393939' },
];

// ─── Page root ────────────────────────────────────────────────────────────────
export default function UseCases({ useCases, loading, onNavigate, filters = {}, onFiltersChange }) {
  const [legendOpen, setLegendOpen] = useState(false);

  const companies = [...new Set(useCases.map((uc) => uc.company).filter(Boolean))].sort();

  const filtered = useCases.filter((uc) => {
    if (filters.company && uc.company !== filters.company) return false;
    if (filters.mustWin) {
      const cat = getMustWinByName(uc.mustWinName)?.category;
      if (cat !== filters.mustWin) return false;
    }
    if (filters.product) {
      const q = filters.product.toLowerCase();
      if (!uc.products.some((p) => p.toLowerCase().includes(q))) return false;
    }
    return true;
  });

  const hasFilter = !!(filters.company || filters.mustWin || filters.product);
  const clearFilters = () => onFiltersChange?.({ company: '', mustWin: '', product: '' });
  const setFilter = (key, val) => onFiltersChange?.({ ...filters, [key]: val });

  return (
    <div className="uc-page">

      {/* ── Page header ───────────────────────────────────────── */}
      <div className="uc-page-header">
        <div className="uc-page-header-text">
          <div className="uc-page-title-row">
            <h1 className="uc-page-title">Must Wins in Action: Executing the Golden Path</h1>
            <Popover
              open={legendOpen}
              align="bottom-left"
              onRequestClose={() => setLegendOpen(false)}
              dropShadow
            >
              <button
                type="button"
                className="uc-legend-btn"
                onClick={() => setLegendOpen((o) => !o)}
                aria-label="Color legend"
                title="Color legend"
              >
                <Information size={16} />
              </button>
              <PopoverContent className="uc-legend-popover">
                <p className="uc-legend-heading">Card color = Must Win category</p>
                <div className="uc-legend-list">
                  {LEGEND.map(({ category, bg }) => (
                    <div key={category} className="uc-legend-item">
                      <span className="uc-legend-swatch" style={{ backgroundColor: bg }} />
                      <span className="uc-legend-label">{category}</span>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <p className="uc-page-subtitle">
            Select a use case to explore the must win, narrative, golden path, and pitch.
          </p>
        </div>
        <Button kind="primary" size="sm" onClick={() => onNavigate('submit-use-case')}>
          Submit a Use Case
        </Button>
      </div>

      {/* ── Filters ───────────────────────────────────────────── */}
      <div className="uc-filters">
        <Select
          id="uc-filter-company"
          labelText="Company"
          size="sm"
          value={filters.company ?? ''}
          onChange={(e) => setFilter('company', e.target.value)}
        >
          <SelectItem value="" text="All companies" />
          {companies.map((c) => <SelectItem key={c} value={c} text={c} />)}
        </Select>

        <Select
          id="uc-filter-mustwin"
          labelText="Must Wins"
          size="sm"
          value={filters.mustWin ?? ''}
          onChange={(e) => setFilter('mustWin', e.target.value)}
        >
          <SelectItem value="" text="All Must Wins" />
          {MUST_WIN_CATEGORIES.map((cat) => (
            <SelectItem key={cat} value={cat} text={cat} />
          ))}
        </Select>

        <TextInput
          id="uc-filter-product"
          labelText="Product"
          size="sm"
          placeholder="Search products…"
          value={filters.product ?? ''}
          onChange={(e) => setFilter('product', e.target.value)}
        />

        {hasFilter && (
          <button type="button" className="uc-filter-clear" onClick={clearFilters}>
            <Close size={14} /> Clear
          </button>
        )}
      </div>

      {/* ── Use case list ─────────────────────────────────────── */}
      <div className="uc-list">
        {loading ? (
          <p className="uc-loading">Loading use cases…</p>
        ) : filtered.length === 0 ? (
          <p className="uc-loading">No use cases match the current filters.</p>
        ) : (
          filtered.map((uc, i) => (
            <UseCaseRow key={uc.id} useCase={uc} defaultExpanded={i === 0} />
          ))
        )}
      </div>
    </div>
  );
}
