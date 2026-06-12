import { useState } from 'react';
import { TextInput, TextArea, Button, Select, SelectItem, SelectItemGroup, Toggle } from '@carbon/react';
import { Add, TrashCan, ArrowLeft } from '@carbon/icons-react';
import { submitUseCase } from '../services/dbService';
import { MUST_WINS, MUST_WIN_CATEGORIES, getMustWinByName } from '../data/mustWinsData';
import './SubmitUseCase.css';

const MAX_STEPS = 5;
const MIN_STEPS = 2;
const MAX_LINKS = 5;

function required(val) { return val.trim() === ''; }

export default function SubmitUseCase({ onSubmit, onCancel }) {
  const [submitting, setSubmitting] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [name, setName] = useState('');
  const [companyEnabled, setCompanyEnabled] = useState(true);
  const [company, setCompany] = useState('');
  const [date, setDate] = useState('');
  const [products, setProducts] = useState(['', '', '']);
  const [mustWinName, setMustWinName] = useState('');
  const [links, setLinks] = useState([
    { url: '', title: '', description: '', autoDesc: true },
  ]);
  const [narrative, setNarrative] = useState('');
  const [steps, setSteps] = useState([
    { label: '', description: '' },
    { label: '', description: '' },
  ]);
  const [pitch, setPitch] = useState('');

  const updateProduct = (i, val) =>
    setProducts((p) => p.map((v, idx) => (idx === i ? val : v)));

  const updateStep = (i, field, val) =>
    setSteps((s) => s.map((v, idx) => idx === i ? { ...v, [field]: val } : v));

  const addStep = () => {
    if (steps.length < MAX_STEPS) setSteps((s) => [...s, { label: '', description: '' }]);
  };

  const removeStep = (i) => {
    if (steps.length > MIN_STEPS) setSteps((s) => s.filter((_, idx) => idx !== i));
  };

  const addLink = () => {
    if (links.length < MAX_LINKS)
      setLinks((prev) => [...prev, { url: '', title: '', description: '', autoDesc: true }]);
  };

  const removeLink = (i) => {
    if (links.length > 1) setLinks((prev) => prev.filter((_, idx) => idx !== i));
  };

  const updateLink = (i, field, val) =>
    setLinks((prev) => prev.map((l, idx) => idx === i ? { ...l, [field]: val } : l));

  const handleLinkDescChange = (i, val) =>
    setLinks((prev) => prev.map((l, idx) => idx === i ? { ...l, description: val, autoDesc: false } : l));

  const fetchLinkMeta = async (i, url) => {
    if (!url || !links[i].autoDesc) return;
    try {
      const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      if (data.title) {
        const desc = data.title.slice(0, 100);
        setLinks((prev) => prev.map((l, idx) =>
          idx === i && l.autoDesc ? { ...l, description: desc } : l
        ));
      }
    } catch {
      // silently fail — description stays blank
    }
  };

  const filledProducts = products.filter((p) => p.trim());

  const linksWithUrl = links.filter((l) => l.url.trim());
  const linksTitleMissing = linksWithUrl.some((l) => !l.title.trim());

  const isValid = () =>
    !required(name) &&
    (!companyEnabled || !required(company)) &&
    !required(mustWinName) &&
    !required(narrative) &&
    steps.filter((s) => s.label.trim()).length >= MIN_STEPS &&
    !required(pitch) &&
    filledProducts.length >= 1 &&
    !linksTitleMissing;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAttempted(true);
    if (!isValid()) return;

    setSubmitting(true);
    setSubmitError('');
    try {
      const selected = getMustWinByName(mustWinName);
      const entry = await submitUseCase({
        name: name.trim(),
        company: company.trim(),
        date: date.trim() || null,
        products: products.map((p) => p.trim()).filter(Boolean),
        mustWinName: mustWinName.trim(),
        mustWinDetails: selected?.details ?? '',
        narrative: narrative.trim(),
        goldenPathSteps: steps
          .map((s) => ({ label: s.label.trim(), description: s.description.trim() }))
          .filter((s) => s.label),
        goldenPathSummary: steps.map((s) => s.label.trim()).filter(Boolean).join(' ➔ '),
        pitch: pitch.trim(),
        links: links
          .filter((l) => l.url.trim() && l.title.trim())
          .map(({ url, title, description }) => ({ url: url.trim(), title: title.trim(), description: description.trim() })),
      });
      onSubmit(entry);
    } catch (err) {
      setSubmitError(err.message || 'Submission failed. Please try again.');
      setSubmitting(false);
    }
  };

  const inv = (val) => attempted && required(val);
  const stepsInvalid = attempted && steps.filter((s) => s.label.trim()).length < MIN_STEPS;

  return (
    <div className="su-page">
      <div className="su-page-header">
        <button type="button" className="su-back-btn" onClick={onCancel}>
          <ArrowLeft size={16} /> Back
        </button>
        <div>
          <h1 className="su-page-title">Submit a Use Case</h1>
          <p className="su-page-subtitle">
            All fields marked with * are required. Your submission will appear immediately.
          </p>
        </div>
      </div>

      <form className="su-form" onSubmit={handleSubmit} noValidate>

        {/* ── Overview ─────────────────────────────────────────── */}
        <section className="su-section">
          <h2 className="su-section-title">Overview</h2>
          <div className="su-row">
            <TextInput
              id="su-name"
              labelText="Use Case Name *"
              placeholder="e.g. The Unified Enterprise Business Manager"
              value={name}
              onChange={(e) => setName(e.target.value)}
              invalid={inv(name)}
              invalidText="Required"
            />
          </div>
          <div className="su-row su-row--3col su-row--align-end">
            <div className="su-company-wrap">
              <Toggle
                id="su-company-toggle"
                size="sm"
                labelText="Company"
                labelA="Anonymous"
                labelB="Named"
                toggled={companyEnabled}
                onToggle={(checked) => {
                  setCompanyEnabled(checked);
                  if (!checked) setCompany('');
                }}
              />
              <TextInput
                id="su-company"
                labelText="Company name"
                hideLabel
                placeholder="e.g. Cleveland Clinic"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                invalid={companyEnabled && inv(company)}
                invalidText="Required"
                disabled={!companyEnabled}
              />
            </div>
            <TextInput
              id="su-date"
              labelText="Date"
              placeholder="e.g. Sept 24'"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="su-row su-row--3col">
            {products.map((p, i) => (
              <TextInput
                key={i}
                id={`su-product-${i}`}
                labelText={`Product ${i + 1}${i === 0 ? ' *' : ''}`}
                placeholder="e.g. Apptio"
                value={p}
                onChange={(e) => updateProduct(i, e.target.value)}
                invalid={i === 0 && attempted && required(p)}
                invalidText="At least one product required"
              />
            ))}
          </div>
        </section>

        {/* ── The Must Win ──────────────────────────────────────── */}
        <section className="su-section">
          <h2 className="su-section-title">The Must Win</h2>
          <p className="su-section-hint">
            Details are auto-populated from the 2026 FSM Must Wins document.
          </p>
          <div className="su-row">
            <Select
              id="su-mw-name"
              labelText="Must Win *"
              value={mustWinName}
              onChange={(e) => setMustWinName(e.target.value)}
              invalid={attempted && required(mustWinName)}
              invalidText="Required"
            >
              <SelectItem value="" text="Select a Must Win…" hidden />
              {MUST_WIN_CATEGORIES.map((cat) => (
                <SelectItemGroup key={cat} label={cat}>
                  {MUST_WINS.filter((m) => m.category === cat).map((m) => (
                    <SelectItem key={m.name} value={m.name} text={m.name} />
                  ))}
                </SelectItemGroup>
              ))}
            </Select>
          </div>
          {mustWinName && (() => {
            const selected = getMustWinByName(mustWinName);
            return selected ? (
              <div className="su-mw-preview">
                <p className="su-mw-preview-text">{selected.details}</p>
              </div>
            ) : null;
          })()}
        </section>

        {/* ── The Narrative ─────────────────────────────────────── */}
        <section className="su-section">
          <h2 className="su-section-title">The Narrative</h2>
          <div className="su-row">
            <TextArea
              id="su-narrative"
              labelText="Narrative *"
              placeholder="Tell the story behind this use case…"
              value={narrative}
              onChange={(e) => setNarrative(e.target.value)}
              rows={4}
              invalid={inv(narrative)}
              invalidText="Required"
            />
          </div>
        </section>

        {/* ── The Golden Path ───────────────────────────────────── */}
        <section className="su-section">
          <h2 className="su-section-title">The Golden Path</h2>
          <p className="su-section-hint">
            Define the sequential steps of the path (min {MIN_STEPS}, max {MAX_STEPS}).
            The last step represents the destination.
          </p>
          <div className="su-steps">
            {steps.map((step, i) => (
              <div key={i} className="su-step-row">
                <span className="su-step-num">{i + 1}</span>
                <div className="su-step-fields">
                  <TextInput
                    id={`su-step-label-${i}`}
                    labelText=""
                    hideLabel
                    placeholder={i === steps.length - 1 ? 'Destination (e.g. Data Lakehouse/Catalog)' : `Step ${i + 1} (e.g. Web/Internal Portals)`}
                    value={step.label}
                    onChange={(e) => updateStep(i, 'label', e.target.value)}
                    invalid={stepsInvalid && step.label.trim() === ''}
                    invalidText="Required"
                  />
                  <TextInput
                    id={`su-step-desc-${i}`}
                    labelText=""
                    hideLabel
                    placeholder="Short description (optional)"
                    value={step.description}
                    onChange={(e) => updateStep(i, 'description', e.target.value)}
                  />
                </div>
                {steps.length > MIN_STEPS && (
                  <button
                    type="button"
                    className="su-step-remove"
                    onClick={() => removeStep(i)}
                    aria-label={`Remove step ${i + 1}`}
                  >
                    <TrashCan size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
          {stepsInvalid && (
            <p className="su-field-error">At least {MIN_STEPS} steps required.</p>
          )}
          {steps.length < MAX_STEPS && (
            <Button
              type="button"
              kind="ghost"
              size="sm"
              renderIcon={Add}
              onClick={addStep}
              className="su-add-step-btn"
            >
              Add Step
            </Button>
          )}
        </section>

        {/* ── The Pitch ─────────────────────────────────────────── */}
        <section className="su-section">
          <h2 className="su-section-title">The Pitch</h2>
          <div className="su-row">
            <TextArea
              id="su-pitch"
              labelText="Pitch *"
              placeholder="How do you position this in a sales conversation?"
              value={pitch}
              onChange={(e) => setPitch(e.target.value)}
              rows={4}
              invalid={inv(pitch)}
              invalidText="Required"
            />
          </div>
        </section>

        {/* ── The Content ───────────────────────────────────────── */}
        <section className="su-section">
          <h2 className="su-section-title">The Content</h2>
          <p className="su-section-hint">
            The title is required and becomes the clickable link. Paste a URL to auto-generate the description.
          </p>
          <div className="su-steps">
            {links.map((link, i) => (
              <div key={i} className="su-step-row">
                <span className="su-step-num">{i + 1}</span>
                <div className="su-step-fields">
                  <TextInput
                    id={`su-link-url-${i}`}
                    labelText=""
                    hideLabel
                    placeholder="URL — https://…"
                    value={link.url}
                    onChange={(e) => updateLink(i, 'url', e.target.value)}
                    onBlur={(e) => fetchLinkMeta(i, e.target.value)}
                  />
                  <TextInput
                    id={`su-link-title-${i}`}
                    labelText=""
                    hideLabel
                    placeholder={link.url.trim() ? 'Title *' : 'Title — e.g. Apptio Product Overview'}
                    value={link.title}
                    onChange={(e) => updateLink(i, 'title', e.target.value)}
                    invalid={attempted && !!link.url.trim() && !link.title.trim()}
                    invalidText="Required when a URL is provided"
                  />
                  <div className="su-link-desc-wrap">
                    <TextInput
                      id={`su-link-desc-${i}`}
                      labelText=""
                      hideLabel
                      placeholder="Description — auto-generated or type your own…"
                      value={link.description}
                      onChange={(e) => handleLinkDescChange(i, e.target.value)}
                      maxLength={100}
                    />
                    <span className="su-link-char-count">{link.description.length}/100</span>
                  </div>
                </div>
                {links.length > 1 && (
                  <button
                    type="button"
                    className="su-step-remove"
                    onClick={() => removeLink(i)}
                    aria-label={`Remove link ${i + 1}`}
                  >
                    <TrashCan size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
          {links.length < MAX_LINKS && (
            <Button
              type="button"
              kind="ghost"
              size="sm"
              renderIcon={Add}
              onClick={addLink}
              className="su-add-step-btn"
            >
              Add Link
            </Button>
          )}
        </section>

        {/* ── Actions ───────────────────────────────────────────── */}
        <div className="su-actions">
          {submitError && (
            <p className="su-submit-error">{submitError}</p>
          )}
          <Button type="button" kind="secondary" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" kind="primary" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit Use Case'}
          </Button>
        </div>

      </form>
    </div>
  );
}
