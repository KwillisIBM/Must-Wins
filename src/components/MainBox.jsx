import { useState } from 'react';
import { Popover, PopoverContent } from '@carbon/react';
import { ChevronDown, ArrowRight } from '@carbon/icons-react';
import SubBox from './SubBox';
import { SUB_BOXES } from '../data/componentData';

export default function MainBox({ column, onNavigateToUseCases }) {
  const [open, setOpen] = useState(false);

  const subBoxes = SUB_BOXES.filter((s) => s.group === column.id);

  return (
    <div className="mainbox">
      <div className="mainbox-line" style={{ backgroundColor: column.lineColor }} data-col={column.id} />

      <div className="mainbox-header">
        <span className="mainbox-title">
          {column.label.split('\n').map((line, i, arr) => (
            <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
          ))}
        </span>
        {column.hasPopover && (
          <div className="mainbox-expand-wrap">
            <Popover
              open={open}
              align="bottom-right"
              onRequestClose={() => setOpen(false)}
              autoAlign
              dropShadow
            >
              <button
                type="button"
                className="mainbox-expand-btn"
                onClick={() => setOpen((prev) => !prev)}
                aria-label={`Expand ${column.label} details`}
                aria-expanded={open}
              >
                <ChevronDown size={16} />
              </button>
              <PopoverContent className="mainbox-popover-content">
                <h6 className="popover-title">{column.label}</h6>
                <p className="popover-desc">{column.description}</p>
                {column.mustWinCategory && onNavigateToUseCases && (
                  <div className="popover-uc-link-row">
                    <button
                      type="button"
                      className="popover-uc-link"
                      onClick={() => {
                        setOpen(false);
                        onNavigateToUseCases({ mustWin: column.mustWinCategory });
                      }}
                    >
                      Use Cases <ArrowRight size={14} />
                    </button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>

      <div className="mainbox-subboxes">
        {subBoxes.map((item) => (
          <SubBox key={item.text} item={item} />
        ))}
      </div>
    </div>
  );
}
