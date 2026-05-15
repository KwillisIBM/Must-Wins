import { useRef, useState, useCallback } from 'react';
import { Popover, PopoverContent } from '@carbon/react';
import { FOUNDATION_ITEMS } from '../data/componentData';

function FoundationItem({ item }) {
  const [open, setOpen] = useState(false);
  const [align, setAlign] = useState('top-left');
  const ref = useRef(null);

  const getAlign = useCallback(() => {
    if (!ref.current) return 'top-left';
    const rect = ref.current.getBoundingClientRect();
    return rect.left + rect.width / 2 > window.innerWidth / 2 ? 'top-right' : 'top-left';
  }, []);

  const descriptions = [item.desc1, item.desc2, item.desc3, item.desc4, item.desc5].filter(Boolean);
  const colCount = Math.min(descriptions.length, 5);

  return (
    /* caret={false} = "No Tip" per spec; autoAlign keeps popover above the bar */
    <Popover
      open={open}
      align={align}
      onRequestClose={() => setOpen(false)}
      caret={false}
      autoAlign
      dropShadow
      as="div"
      className="foundation-popover-wrapper"
    >
      <button
        ref={ref}
        type="button"
        className="foundation-item"
        style={{ backgroundColor: item.color, color: item.textColor }}
        onClick={() => { if (!open) setAlign(getAlign()); setOpen((p) => !p); }}
        aria-expanded={open}
      >
        <span className="foundation-item-label">{item.text}</span>
      </button>
      <PopoverContent className="foundation-popover-content">
        <p className="popover-title">{item.text}</p>
        <div
          className="foundation-popover-grid"
          style={{ gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))` }}
        >
          {descriptions.map((desc, i) => (
            <div key={i} className="foundation-popover-col">
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default function FoundationSection() {
  return (
    <div className="labeled-section">
      {/* Left label with vertical line */}
      <div className="section-label-col">
        <div className="section-vertical-line" style={{ backgroundColor: '#121619' }} />
        <span className="section-label">Foundation</span>
      </div>

      <div className="foundation-items-stack">
        {FOUNDATION_ITEMS.map((item) => (
          <FoundationItem key={item.text} item={item} />
        ))}
      </div>
    </div>
  );
}
