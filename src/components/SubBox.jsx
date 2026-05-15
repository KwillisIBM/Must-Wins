import {
  Toggletip,
  ToggletipButton,
  ToggletipContent,
} from '@carbon/react';
import { getIconSrc } from '../data/componentData';

function SubBoxIcon({ iconName, textColor }) {
  const src = getIconSrc(iconName);
  if (!src) return null;
  // Dark textColor (#161616) means icon sits on a light box → keep it dark
  // null textColor means icon on a gray box → invert to white
  const filter = 'brightness(0)';
  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      className="subbox-icon"
      style={{ filter }}
    />
  );
}

export default function SubBox({ item }) {
  return (
    <div className="subbox-wrapper">
      {/* autoAlign lets Carbon/FloatingUI pick the best quadrant automatically */}
      <Toggletip autoAlign>
        <ToggletipButton
          label={`Show info for ${item.text}`}
          className="subbox-btn"
          style={{ backgroundColor: item.color, color: item.textColor || '#161616' }}
        >
          <span className="subbox-label">{item.text}</span>
          <SubBoxIcon iconName={item.icon} textColor={item.textColor} />
        </ToggletipButton>
        <ToggletipContent>
          <div className="popover-body">
            {item.header && <p className="popover-header">{item.header}</p>}
            <p className="popover-desc">{item.desc}</p>
          </div>
        </ToggletipContent>
      </Toggletip>
    </div>
  );
}
