import { useState, useRef } from 'react';
import { Button, Modal, Tag } from '@carbon/react';
import { Upload, CheckmarkFilled, ErrorFilled, WarningFilled } from '@carbon/icons-react';
import { bulkSubmitUseCases } from '../services/dbService';
import { MUST_WINS } from '../data/mustWinsData';
import './CsvUploadModal.css';

// ─── CSV column spec ──────────────────────────────────────────────────────────
// Expected header row (order does not matter, matching is case-insensitive):
//   name, date, products, mustWinName, narrative, goldenPathSteps, pitch,
//   links
//
// products     → semicolon-separated list (min 1, max 3), e.g. "Apptio;Cloudability"
// goldenPathSteps → semicolon-separated "label:description" pairs (min 2, max 5, description optional),
//                   e.g. "Step A:desc;Step B:desc"
// links        → semicolon-separated "url|title|description" triples,
//                   e.g. "https://…|Title|Desc;https://…|Title2|"

function parseCSV(text, existingNamesSet) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) throw new Error('CSV must have a header row and at least one data row.');

  // Naive CSV parser: handles quoted fields with commas inside
  function splitLine(line) {
    const result = [];
    let cur = '';
    let inQuote = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuote && line[i + 1] === '"') { cur += '"'; i++; }
        else { inQuote = !inQuote; }
      } else if (ch === ',' && !inQuote) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += ch;
      }
    }
    result.push(cur.trim());
    return result;
  }

  const headers = splitLine(lines[0]).map((h) => h.toLowerCase().replace(/\s+/g, ''));
  const col = (name) => headers.indexOf(name);

  const required = ['name', 'mustwinname', 'narrative', 'pitch'];
  const missing = required.filter((r) => col(r) === -1);
  if (missing.length > 0) {
    throw new Error(`Missing required columns: ${missing.join(', ')}`);
  }

  return lines.slice(1).map((line, i) => {
    const cells = splitLine(line);
    const get = (name) => (cells[col(name)] ?? '').trim();

    const rawProducts = get('products');
    const products = (rawProducts ? rawProducts.split(';').map((p) => p.trim()).filter(Boolean) : []).slice(0, 3);

    const rawSteps = get('goldenpathsteps');
    const goldenPathSteps = (rawSteps
      ? rawSteps.split(';').map((s) => {
          const [label = '', description = ''] = s.split(':');
          return { label: label.trim(), description: description.trim() };
        }).filter((s) => s.label)
      : []).slice(0, 5);
    const stepsWithoutDescription = goldenPathSteps.filter((s) => !s.description);

    const rawLinks = get('links');
    const parsedLinks = rawLinks
      ? rawLinks.split(';').map((l) => {
          const [url = '', title = '', description = ''] = l.split('|');
          return { url: url.trim(), title: title.trim(), description: description.trim() };
        }).filter((l) => l.url)
      : [];
    const linksWithoutTitle = parsedLinks.filter((l) => !l.title);
    const links = parsedLinks.filter((l) => l.title);

    const mustWinName = get('mustwinname');
    const matchedMW = MUST_WINS.find((m) => m.name.toLowerCase() === mustWinName.toLowerCase());

    const skipReasons = [];
    if (!get('name'))        skipReasons.push('missing name');
    if (!mustWinName)        skipReasons.push('missing mustWinName');
    if (!matchedMW && mustWinName) skipReasons.push(`"${mustWinName}" doesn't match a known Must Win`);
    if (!get('narrative'))   skipReasons.push('missing narrative');
    if (!get('pitch'))       skipReasons.push('missing pitch');
    if (products.length < 1) skipReasons.push('at least 1 product required');
    if (goldenPathSteps.length < 2) skipReasons.push('at least 2 golden path steps required');
    if (stepsWithoutDescription.length > 0) skipReasons.push(`golden path step(s) missing description: ${stepsWithoutDescription.map((s) => `"${s.label}"`).join(', ')}`);
    if (linksWithoutTitle.length > 0) skipReasons.push(`link(s) missing title: ${linksWithoutTitle.map((l) => `"${l.url}"`).join(', ')}`);
    if (get('name') && existingNamesSet.has(get('name').toLowerCase())) skipReasons.push(`"${get('name')}" already exists`);

    return {
      _rowIndex: i + 2, // 1-based, accounting for header
      _valid: skipReasons.length === 0,
      _skipReasons: skipReasons,
      _warning: null,
      name: get('name'),
      date: get('date') || null,
      products,
      mustWinName: matchedMW ? matchedMW.name : mustWinName,
      mustWinDetails: matchedMW?.details ?? '',
      narrative: get('narrative'),
      goldenPathSteps,
      goldenPathSummary: goldenPathSteps.map((s) => s.label).join(' ➔ '),
      pitch: get('pitch'),
      links,
    };
  });
}

// ─── Stages ───────────────────────────────────────────────────────────────────
// idle → preview → submitting → results

export default function CsvUploadModal({ open, onClose, onUploaded, existingNames = [] }) {
  const fileRef = useRef(null);
  const [stage, setStage] = useState('idle'); // idle | preview | submitting | results
  const [parseError, setParseError] = useState('');
  const [rows, setRows] = useState([]);
  const [results, setResults] = useState([]); // { index, success, id?, error? }
  const [submitError, setSubmitError] = useState('');

  const reset = () => {
    setStage('idle');
    setParseError('');
    setRows([]);
    setResults([]);
    setSubmitError('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleClose = () => { reset(); onClose(); };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setParseError('');
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const existingNamesSet = new Set(existingNames.map((n) => n.toLowerCase()));
        const parsed = parseCSV(ev.target.result, existingNamesSet);
        setRows(parsed);
        setStage('preview');
      } catch (err) {
        setParseError(err.message);
        setStage('idle');
      }
    };
    reader.readAsText(file);
  };

  const validRows = rows.filter((r) => r._valid);

  const handleConfirm = async () => {
    setStage('submitting');
    setSubmitError('');
    try {
      // Strip internal tracking fields before sending to the server
      // eslint-disable-next-line no-unused-vars
      const payload = validRows.map(({ _rowIndex, _valid, _warning, _skipReasons, ...rest }) => rest);
      const { results: res } = await bulkSubmitUseCases(payload);
      setResults(res);
      setStage('results');
      const succeeded = res.filter((r) => r.success);
      if (succeeded.length > 0 && onUploaded) {
        onUploaded(succeeded.length);
      }
    } catch (err) {
      setSubmitError(err.message || 'Upload failed. Please try again.');
      setStage('preview');
    }
  };

  // ── Render helpers ──────────────────────────────────────────────────────────

  const renderIdle = () => (
    <div className="csv-idle">
      <p className="csv-hint">
        Required columns:{' '}
        <strong>name, product (min. 1, max. 3), mustWinName, narrative, goldenPathSteps (min. 2, max. 5), pitch</strong>. Optional:{' '}
        date, links.
      </p>
      <p className="csv-hint csv-hint--small">
        <strong>products</strong> — semicolon-separated · <strong>goldenPathSteps</strong> — semicolon-separated{' '}
        <code>label:description</code> pairs · <strong>links</strong> — semicolon-separated{' '}
        <code>url|title|description</code> triples
      </p>
      <p className="csv-hint">
        Ex. name, date, "product1; product2", mustWinName, "narrative", "golden1:desc; golden2:desc", "pitch", link1|title|desc; link2|title|desc
      </p>
      <p className="csv-hint">
        Note: Any descriptions/titles with commas in them MUST be surrounded by quotes. Ex. "Here, a description with a comma"
      </p>
      {parseError && <p className="csv-parse-error">{parseError}</p>}
      <Button
        kind="tertiary"
        renderIcon={Upload}
        onClick={() => fileRef.current?.click()}
        className="csv-pick-btn"
      >
        Choose CSV File
      </Button>
      <input
        ref={fileRef}
        type="file"
        accept=".csv,text/csv"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </div>
  );

  const renderPreview = () => (
    <div className="csv-preview">
      <p className="csv-summary">
        <strong>{rows.length}</strong> row{rows.length !== 1 ? 's' : ''} parsed —{' '}
        <strong>{validRows.length}</strong> valid,{' '}
        <strong>{rows.length - validRows.length}</strong> skipped (missing required fields). Hover over skipped rows for more information.
      </p>
      <div className="csv-table-wrap">
        <table className="csv-table">
          <thead>
            <tr>
              <th className="csv-th csv-th--row">#</th>
              <th className="csv-th">Name</th>
              <th className="csv-th">Must Win</th>
              <th className="csv-th">Products</th>
              <th className="csv-th csv-th--status">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row._rowIndex}
                className={`csv-tr ${row._valid ? '' : 'csv-tr--skip'}`}
                title={!row._valid ? row._skipReasons.join('; ') : undefined}
              >
                <td className="csv-td csv-td--row">{i + 1}</td>
                <td className="csv-td">{row.name || <span className="csv-empty">—</span>}</td>
                <td className="csv-td">{row.mustWinName || <span className="csv-empty">—</span>}</td>
                <td className="csv-td">{row.products.join(', ') || <span className="csv-empty">—</span>}</td>
                <td className="csv-td csv-td--status">
                  {!row._valid ? (
                    <span className="csv-status csv-status--skip">
                      <ErrorFilled size={14} /> Skip
                    </span>
                  ) : row._warning ? (
                    <span className="csv-status csv-status--warn" title={row._warning}>
                      <WarningFilled size={14} /> Warn
                    </span>
                  ) : (
                    <span className="csv-status csv-status--ok">
                      <CheckmarkFilled size={14} /> OK
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderResults = () => {
    const succeeded = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;
    return (
      <div className="csv-results">
        <div className="csv-results-summary">
          <Tag type="green" size="sm">{succeeded} uploaded</Tag>
          {failed > 0 && <Tag type="red" size="sm">{failed} failed</Tag>}
        </div>
        <div className="csv-table-wrap">
          <table className="csv-table">
            <thead>
              <tr>
                <th className="csv-th csv-th--row">#</th>
                <th className="csv-th">Name</th>
                <th className="csv-th csv-th--status">Result</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => {
                const row = validRows[r.index];
                return (
                  <tr key={r.index} className={`csv-tr ${r.success ? '' : 'csv-tr--skip'}`}>
                    <td className="csv-td csv-td--row">{r.index + 1}</td>
                    <td className="csv-td">{row?.name ?? '—'}</td>
                    <td className="csv-td csv-td--status">
                      {r.success ? (
                        <span className="csv-status csv-status--ok">
                          <CheckmarkFilled size={14} /> Uploaded
                        </span>
                      ) : (
                        <span className="csv-status csv-status--skip" title={r.error}>
                          <ErrorFilled size={14} /> Failed
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // ── Button config per stage ──────────────────────────────────────────────────
  const primaryBtnText =
    stage === 'preview' ? `Upload ${validRows.length} row${validRows.length !== 1 ? 's' : ''}` :
    stage === 'results' ? 'Done' : 'Submit';
  const primaryBtnDisabled = stage === 'submitting' || (stage === 'preview' && validRows.length === 0);
  const primaryBtnHandler =
    stage === 'preview' ? handleConfirm :
    stage === 'results' ? handleClose : undefined;

  const secondaryBtnText = stage === 'preview' ? 'Back' : stage === 'idle' ? 'Cancel' : undefined;
  const secondaryBtnHandler = stage === 'preview' ? reset : stage === 'idle' ? handleClose : undefined;

  return (
    <Modal
      open={open}
      modalHeading="Upload Use Cases from CSV"
      primaryButtonText={primaryBtnText}
      secondaryButtonText={secondaryBtnText}
      onRequestSubmit={primaryBtnHandler}
      onSecondarySubmit={secondaryBtnHandler}
      onRequestClose={handleClose}
      primaryButtonDisabled={primaryBtnDisabled}
      size="lg"
      className="csv-modal"
    >
      {stage === 'idle' && renderIdle()}
      {stage === 'preview' && renderPreview()}
      {stage === 'submitting' && (
        <p className="csv-hint csv-submitting">Uploading {validRows.length} rows…</p>
      )}
      {stage === 'results' && renderResults()}
      {submitError && <p className="csv-parse-error">{submitError}</p>}
    </Modal>
  );
}
