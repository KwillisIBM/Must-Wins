import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import CsvUploadModal from './CsvUploadModal';
import {
  Tag,
  TextArea,
  Button,
  Select,
  SelectItem,
  Popover,
  PopoverContent,
  TextInput,
  Modal,
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
  TrashCan,
  Upload,
} from '@carbon/icons-react';
import { fetchLikes, incrementLike, fetchComments, addComment, removeComment, deleteUseCase } from '../services/dbService';
import { getMustWinByName, MUST_WIN_CATEGORIES } from '../data/mustWinsData';
import './UseCases.css';

// ─── Social hook — isolates all likes/comments state per use case ─────────────
function useSocial(useCaseId, userEmail) {
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [draft, setDraft] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchLikes(useCaseId).then(({ count, emails }) => {
      setLikes(count);
      if (userEmail) setLiked(emails.includes(userEmail));
    });
    fetchComments(useCaseId).then(setComments);
  }, [useCaseId, userEmail]);

  const handleLike = useCallback(async () => {
    if (liked) return;
    const newCount = await incrementLike(useCaseId);
    setLikes(newCount);
    setLiked(true);
  }, [useCaseId, liked]);

  const handleRemoveComment = useCallback(async (commentId) => {
    await removeComment(useCaseId, commentId);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  }, [useCaseId]);

  const appendComment = useCallback((comment) => {
    setComments((prev) => [...prev, comment]);
  }, []);

  return { likes, liked, comments, draft, setDraft, submitting, handleLike, handleRemoveComment, appendComment };
}

// ─── Comments panel (right column — always visible while expanded) ────────────
function CommentsPanel({ useCaseId, userEmail, isAdmin, likes, liked, handleLike, comments, handleRemoveComment, onCommentPosted }) {
  const [draft, setDraft] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const listRef = useRef(null);

  const handleAddComment = useCallback(async () => {
    const text = draft.trim();
    if (!text) return;
    setSubmitting(true);
    const comment = await addComment(useCaseId, text);
    onCommentPosted(comment);
    setDraft('');
    setSubmitting(false);
  }, [useCaseId, draft, onCommentPosted]);

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
              <div className="uc-comment-header">
                <span className="uc-comment-author">{isAdmin ? c.author : 'Anonymous'}</span>
                {isAdmin && (
                  <button
                    type="button"
                    className="uc-comment-delete"
                    onClick={() => handleRemoveComment(c.id)}
                    aria-label="Delete comment"
                    title="Delete comment"
                  >
                    <TrashCan size={14} />
                  </button>
                )}
              </div>
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
      const raw = `${first}.`;
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
function UseCaseDrawer({ useCase, userEmail, isAdmin, likes, liked, handleLike, comments, handleRemoveComment, onCommentPosted }) {
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
        <CommentsPanel
          useCaseId={useCase.id}
          userEmail={userEmail}
          isAdmin={isAdmin}
          likes={likes}
          liked={liked}
          handleLike={handleLike}
          comments={comments}
          handleRemoveComment={handleRemoveComment}
          onCommentPosted={onCommentPosted}
        />
      </div>
    </div>
  );
}

// ─── Single collapsed/expanded use case row ───────────────────────────────────
// NOTE: The outer element is a <div>, not a <button>, because the social icons
// are interactive elements and HTML forbids nesting buttons inside buttons.
function UseCaseRow({ useCase, defaultExpanded = false, isAdmin = false, userEmail = '', onDelete }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { likes, liked, comments, handleLike, handleRemoveComment, appendComment } = useSocial(useCase.id, userEmail);
  const navigate = useNavigate();
  const toggle = () => setExpanded((prev) => !prev);

  const handleDeleteClick = async () => {
    setDeleting(true);
    try {
      await deleteUseCase(useCase.id, userEmail);
      setShowDeleteModal(false);
      onDelete?.(useCase.id);
    } catch (error) {
      console.error('Failed to delete use case:', error);
      alert(`Failed to delete use case: ${error.message}`);
    } finally {
      setDeleting(false);
    }
  };

  const isInteractive = useCase.isInteractive && useCase.viewKey;

  return (
    <div className={`uc-row${expanded ? ' uc-row--expanded' : ''}`}>
      {/* Collapsed header — always visible */}
      <div className="uc-row-header">
        {/* Clickable expand area: name + tags */}
        <button
          type="button"
          className="uc-row-expand-area"
          onClick={isInteractive ? () => navigate(`/use-cases/${useCase.viewKey}`) : toggle}
          aria-expanded={isInteractive ? undefined : expanded}
          aria-label={isInteractive ? `View interactive architecture for ${useCase.name}` : `${expanded ? 'Collapse' : 'Expand'} ${useCase.name}`}
        >
          <span className="uc-row-name">
            {useCase.name}
            {isInteractive && (
              <span className="uc-row-interactive-badge" title="Interactive architecture view">
                ✦ Interactive
              </span>
            )}
          </span>
        </button>

        {/* Products + date + social — all inline on the right */}
        <div className="uc-row-right">
          <div className="uc-row-tags">
            {useCase.products.filter(Boolean).map((p) => (
              <span key={p} className="uc-row-product">{p}</span>
            ))}
            {useCase.date && (
              <span className="uc-row-date">{useCase.date}</span>
            )}
          </div>
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
            {isAdmin && (
              <button
                type="button"
                className="uc-icon-btn uc-icon-btn--danger"
                onClick={() => setShowDeleteModal(true)}
                aria-label="Delete use case"
                title="Delete use case (admin only)"
              >
                <TrashCan size={16} />
              </button>
            )}
            <button
              type="button"
              className="uc-icon-btn uc-row-chevron-btn"
              onClick={toggle}
              aria-label={expanded ? 'Collapse' : 'Expand'}
            >
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded drawer */}
      {expanded && <UseCaseDrawer useCase={useCase} userEmail={userEmail} isAdmin={isAdmin} likes={likes} liked={liked} handleLike={handleLike} comments={comments} handleRemoveComment={handleRemoveComment} onCommentPosted={appendComment} />}
      
      {/* Delete confirmation modal */}
      <Modal
        open={showDeleteModal}
        danger
        modalHeading="Delete use case"
        primaryButtonText="Delete"
        secondaryButtonText="Cancel"
        onRequestClose={() => setShowDeleteModal(false)}
        onRequestSubmit={handleDeleteClick}
        primaryButtonDisabled={deleting}
      >
        <p>Are you sure you want to delete "{useCase.name}"?</p>
        <p style={{ marginTop: '1rem', color: '#da1e28' }}>
          This action cannot be undone. All associated likes and comments will also be deleted.
        </p>
      </Modal>
    </div>
  );
}

// ─── Category-level collapsible section ──────────────────────────────────────
const CATEGORY_ACCENT = {
  'Automation':              { light: '#e8daff', dark: '#491d8b', text: '#21006e' },
  'Data':                    { light: '#bae6ff', dark: '#012749', text: '#003a6d' },
  'Hybrid Cloud':            { light: '#d0e2ff', dark: '#002d9c', text: '#001d6c' },
  'Transaction Processing':  { light: '#dde1e6', dark: '#4c4c4c', text: '#393939' },
  'Mainframe Modernization': { light: '#d9fbfb', dark: '#022b30', text: '#00474a' },
};

function CategorySection({ category, useCases, isOpen, onToggle, isAdmin, userEmail, onDelete }) {
  const accent = CATEGORY_ACCENT[category] ?? { light: '#f4f4f4', dark: '#393939', text: '#161616' };
  return (
    <div className="uc-category-section" data-cat={category}>
      <button
        type="button"
        className="uc-category-header"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span className="uc-category-title">{category}</span>
        <span className="uc-category-count">{useCases.length} {useCases.length === 1 ? 'use case' : 'use cases'}</span>
        <span className="uc-category-chevron">
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>
      {isOpen && (
        <div className="uc-category-body">
          {useCases.map((uc) => (
            <UseCaseRow
              key={uc.id}
              useCase={uc}
              defaultExpanded={false}
              isAdmin={isAdmin}
              userEmail={userEmail}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Color legend entries ─────────────────────────────────────────────────────
const LEGEND = [
  { category: 'Automation',              bg: '#e8daff', dark: '#31135e' },
  { category: 'Data',                    bg: '#bae6ff', dark: '#003a6d' },
  { category: 'Hybrid Cloud',            bg: '#d0e2ff', dark: '#001d6c' },
  { category: 'Transaction Processing',  bg: '#dde1e6', dark: '#393939' },
  { category: 'Mainframe Modernization', bg: '#d9fbfb', dark: '#022b30' },
];

// ─── Page root ────────────────────────────────────────────────────────────────
export default function UseCases({
  isAdmin,
  userEmail,
  isDark = false,
  useCases,
  loading,
  onNavigate,
  filters = {},
  onFiltersChange,
  onUseCasesChange,
  refreshUseCases,
  categoriesOpen = {},
  onCategoryToggle,
  previewAsUser = false,
  onPreviewAsUserChange,
}) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [legendOpen, setLegendOpen] = useState(false);
  const [csvModalOpen, setCsvModalOpen] = useState(false);

  const { state: locationState } = useLocation();

  // Re-fetch only when arriving from a submit.
  // All filter changes use replace: true, so /use-cases itself stays in the stack.
  useEffect(() => {
    if (locationState?.submitted) {
      refreshUseCases?.();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const showAdminUi = isAdmin && !previewAsUser;

  // Filter state lives in the URL
  const mustWin = searchParams.get('mustWin') ?? '';
  const product = searchParams.get('product') ?? '';

  const setFilter = (key, val) => {
    const next = Object.fromEntries(searchParams.entries());
    if (val) {
      next[key] = val;
    } else {
      delete next[key];
    }
    setSearchParams(next, { replace: true });
  };

  const clearFilters = () => setSearchParams({}, { replace: true });

  const hasFilter = !!(mustWin || product);

  const filtered = useCases.filter((uc) => {
    if (mustWin) {
      const cat = getMustWinByName(uc.mustWinName)?.category;
      if (cat !== mustWin) return false;
    }
    if (product) {
      const q = product.toLowerCase();
      if (!uc.products.some((p) => p.toLowerCase().includes(q))) return false;
    }
    return true;
  });

  const handleDelete = (useCaseId) => {
    // Remove the deleted use case from the list
    if (onUseCasesChange) {
      const updated = useCases.filter(uc => uc.id !== useCaseId);
      onUseCasesChange(updated);
    }
  };

  return (
    <>
    <div className="uc-page">
      {previewAsUser && isAdmin && (
        <button
          type="button"
          className="uc-preview-banner"
          onClick={() => onPreviewAsUserChange?.(false)}
        >
          Previewing as User — Click to Exit
        </button>
      )}

      {/* ── Page header ───────────────────────────────────────── */}
      <div className="uc-page-header">
        <div className="uc-page-header-text">
          <div className="uc-page-title-row">
            <h1 className="uc-page-title">Product Use Cases and Golden Paths</h1>
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
                <p className="uc-legend-heading">Card color = Platform</p>
                <div className="uc-legend-list">
                  {LEGEND.map(({ category, bg, dark }) => (
                    <div key={category} className="uc-legend-item">
                      <span className="uc-legend-swatch" style={{ backgroundColor: isDark ? dark : bg }} />
                      <span className="uc-legend-label">{category}</span>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <p className="uc-page-subtitle">
            Select a use case to explore the relevant must-win, its business narrative, the golden path to success, and the platform/product pitch for the client.</p>
        </div>
        <div className="uc-page-actions">
          {showAdminUi && (
            <>
              <Tag type="red" size="sm" style={{ alignSelf: 'center' }}>
                Admin View
              </Tag>
              <Button kind="tertiary" size="sm" onClick={() => onPreviewAsUserChange?.(true)}>
                Preview as User
              </Button>
              <Button kind="secondary" size="sm" renderIcon={Upload} onClick={() => setCsvModalOpen(true)}>
                Upload CSV
              </Button>
            </>
          )}
          <Button kind="primary" size="sm" onClick={() => navigate('/submit')}>
            Submit a Use Case
          </Button>
        </div>
      </div>

      {/* ── Filters ───────────────────────────────────────────── */}
      <div className="uc-filters">
        <Select
          id="uc-filter-mustwin"
          labelText="Platform"
          size="sm"
          value={mustWin}
          onChange={(e) => setFilter('mustWin', e.target.value)}
        >
          <SelectItem value="" text="All Platforms" />
          {MUST_WIN_CATEGORIES.map((cat) => (
            <SelectItem key={cat} value={cat} text={cat} />
          ))}
        </Select>

        <TextInput
          id="uc-filter-product"
          labelText="Product"
          size="sm"
          placeholder="Search products…"
          value={product}
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
          MUST_WIN_CATEGORIES.map((cat) => {
            const catUseCases = filtered.filter(
              (uc) => getMustWinByName(uc.mustWinName)?.category === cat
            );
            if (catUseCases.length === 0) return null;
            return (
              <CategorySection
                key={cat}
                category={cat}
                useCases={catUseCases}
                isOpen={categoriesOpen[cat] !== false}
                onToggle={() => onCategoryToggle?.(cat)}
                isAdmin={showAdminUi}
                userEmail={userEmail}
                onDelete={handleDelete}
              />
            );
          })
        )}
      </div>
    </div>
    <CsvUploadModal
      open={csvModalOpen}
      onClose={() => setCsvModalOpen(false)}
      existingNames={useCases.map((uc) => uc.name)}
      onUploaded={() => {
        import('../services/dbService').then(({ fetchUseCases }) => {
          fetchUseCases().then((all) => onUseCasesChange?.(all));
        });
      }}
    />
    </>
  );
}
