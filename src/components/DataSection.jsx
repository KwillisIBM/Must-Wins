import { useRef, useState, useCallback } from 'react';
import { Popover, PopoverContent } from '@carbon/react';
import { DATA_ITEMS, getIconSrc } from '../data/componentData';

function DataItemIcon({ iconName }) {
  const src = getIconSrc(iconName);
  if (!src) return null;
  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      className="data-item-icon"
      style={{ filter: 'brightness(0)' }}
    />
  );
}

function DataItem({ item, className }) {
  const [open, setOpen] = useState(false);
  const [align, setAlign] = useState('top-left');
  const ref = useRef(null);

  const getAlign = useCallback(() => {
    if (!ref.current) return 'top-left';
    const rect = ref.current.getBoundingClientRect();
    return rect.left + rect.width / 2 > window.innerWidth / 2 ? 'top-right' : 'top-left';
  }, []);

  return (
    <Popover
      open={open}
      align={align}
      onRequestClose={() => setOpen(false)}
      caret={false}
      autoAlign
      dropShadow
      as="div"
      className="data-popover-wrapper"
    >
      <button
        ref={ref}
        type="button"
        className={`data-item ${item.icon ? 'data-item--with-icon' : ''} ${className || ''}`}
        style={{ backgroundColor: item.color }}
        onClick={() => { if (!open) setAlign(getAlign()); setOpen((p) => !p); }}
        aria-expanded={open}
      >
        <span className="data-item-label">{item.text}</span>
        {item.icon && <DataItemIcon iconName={item.icon} />}
      </button>
      <PopoverContent className="mainbox-popover-content">
        <p className="popover-title">{item.text}</p>
        <p className="popover-desc">{item.desc}</p>
      </PopoverContent>
    </Popover>
  );
}

export default function DataSection() {
  const byText = (t) => DATA_ITEMS.find((d) => d.text === t);

  return (
    <div className="labeled-section">
      <div className="section-label-col">
        <div className="section-vertical-line" style={{ backgroundColor: '#78AAF7' }} />
        <span className="section-label">Data</span>
      </div>

      <div className="data-grid-v2">
        {/* Col 1, Row 1 — SQL / NoSQL / Vector stacked */}
        <div className="data-cell data-cell--stack" style={{ gridColumn: 1, gridRow: 1 }}>
          <DataItem item={byText('SQL')} />
          <DataItem item={byText('NoSQL')} />
          <DataItem item={byText('Vector')} />
        </div>

        {/* Col 2, Row 1 — Lakehouse (fills full row height) */}
        <div className="data-cell" style={{ gridColumn: 2, gridRow: 1 }}>
          <DataItem item={byText('Lakehouse')} />
        </div>

        {/* Col 3, Row 1 — Hadoop (fills full row height) */}
        <div className="data-cell" style={{ gridColumn: 3, gridRow: 1 }}>
          <DataItem item={byText('Hadoop')} />
        </div>

        {/* Cols 4-6, Rows 1-2 — Streaming, Integration, Security span full height */}
        <div className="data-cell" style={{ gridColumn: 4, gridRow: '1 / 3' }}>
          <DataItem item={byText('Streaming')} className="data-item--rotated-label" />
        </div>
        <div className="data-cell" style={{ gridColumn: 5, gridRow: '1 / 3' }}>
          <DataItem item={byText('Integration')} className="data-item--rotated-label" />
        </div>
        <div className="data-cell" style={{ gridColumn: 6, gridRow: '1 / 3' }}>
          <DataItem item={byText('Security')} className="data-item--rotated-label" />
        </div>

        {/* Col 1-3, Row 2 — Catalog & Governance, Observability, Lineage */}
        <div className="data-cell" style={{ gridColumn: 1, gridRow: 2 }}>
          <DataItem item={byText('Catalog & Governance')} />
        </div>
        <div className="data-cell" style={{ gridColumn: 2, gridRow: 2 }}>
          <DataItem item={byText('Observability')} />
        </div>
        <div className="data-cell" style={{ gridColumn: 3, gridRow: 2 }}>
          <DataItem item={byText('Lineage')} />
        </div>
      </div>
    </div>
  );
}
