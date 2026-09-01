/**
 * fidelityLayout.js
 * Geometry + palette lifted directly from the Figma frames:
 *   "Next Gen Brokerage Trading - Today"   378:953
 *   "Next Gen Brokerage Trading- Target"   380:1039
 *
 * Both frames are 1920x1080. The diagram occupies roughly x 200..1760, y 300..695,
 * so every coordinate below is the raw Figma value shifted by (ORIGIN_X, ORIGIN_Y).
 * The canvas renders at STAGE.w x STAGE.h and is scaled to fit its container, which
 * keeps the layout pixel-faithful at any width.
 *
 * Colours were sampled from the rendered frames, not guessed.
 *
 * Connectors are DERIVED, never hand-placed: a wire names the boxes it joins and
 * `resolveWires()` computes the endpoints from their real geometry, always leaving
 * ARROW_GAP of clearance at the head. Move a box and its arrows follow.
 */

const ORIGIN_X = 200;
const ORIGIN_Y = 300;

/** Clearance between an arrow head and the box it points at. */
export const ARROW_GAP = 6;

/** A connector label sits this far above its line (≈10px of visible air). */
const LABEL_RISE = 14;

export const STAGE = { w: 1560, h: 395 };

/** Below this scale the diagram stops shrinking and pans horizontally instead. */
export const MIN_SCALE = 0.58;

/** Figma frame coords -> stage coords */
const box = (x, y, w, h) => ({ x: x - ORIGIN_X, y: y - ORIGIN_Y, w, h });

export const C = {
  page:        '#f5f5f5',
  cardWhite:   '#fefefe',
  sorFill:     '#d6e3f8',   // System of Record + Analytics Lane
  servingFill: '#d4bbfb',   // Serving Lane
  cloudFill:   '#f6fff8',   // Cloud Microservices
  blueTile:    '#a7c8f8',   // DB2 / VSAM / COBOL
  redBody:     '#fff7f7',   // Today: IIDR + Database card bodies
  redTile:     '#ffefef',   // Today: copy tiles
  greenTile:   '#defbe6',   // Microservices / SingleStore / Future Domain
  purpleTile:  '#be95ff',   // zDIH + Confluent sub-tiles
  watsonxFill: '#b1cdf8',
  ruleBlue:    '#0f62fe',
  ruleRed:     '#da1e28',
  ruleTeal:    '#005d5d',
  rulePurple:  '#6929c4',
  ruleGray:    '#525252',
  wire:        '#5c5c5c',
  text:        '#161616',
  textSoft:    '#525252',
};

/* ── Region panels (lane / grouping rectangles) ───────────────────────────── */
export const PANELS = {
  today: [
    { id: 'sor',   ...box(309, 313, 404, 360), fill: C.sorFill,   label: 'System of Record' },
    { id: 'cloud', ...box(1340, 313, 271, 305), fill: C.cloudFill, label: 'Cloud Microservices', border: '#c7e8cf' },
  ],
  target: [
    { id: 'sor',       ...box(226, 313, 306, 331), fill: C.sorFill,     label: 'System of Record' },
    { id: 'serving',   ...box(578, 313, 596, 177), fill: C.servingFill, label: 'Serving Lane' },
    { id: 'analytics', ...box(578, 507, 596, 165), fill: C.sorFill,     label: 'Analytics Lane' },
    { id: 'cloud',     ...box(1229, 313, 494, 177), fill: C.cloudFill,  label: 'Cloud Microservices', border: '#c7e8cf' },
  ],
};

/* ── Cards ────────────────────────────────────────────────────────────────
   `node` marks the card itself as the clickable Toggletip trigger.
   Cards without `node` are plain containers whose tiles carry the content.
   `icon` is a filename under /icons — the same assets the homepage SubBoxes use. */
export const CARDS = {
  today: [
    { id: 'oms',       ...box(364, 336, 52, 320),  fill: C.cardWhite, rule: C.ruleGray,  vertical: 'Order Management System (OMS)', node: 'oms' },
    { id: 'mainframe', ...box(469, 336, 225, 260), fill: C.cardWhite, rule: C.ruleBlue,  header: 'Mainframe' },
    { id: 'iidr',      ...box(760, 336, 149, 260), fill: C.redBody,   rule: C.ruleRed,   header: 'IIDR CDC', body: 'Table Level\nBatch Driven', node: 'iidr', icon: 'Lift-and-shift.svg' },
    { id: 'dbOps',     ...box(958, 336, 149, 260), fill: C.redBody,   rule: C.ruleRed,   header: 'Database' },
    { id: 'dbSnow',    ...box(1150, 336, 149, 112), fill: C.redBody,  rule: C.ruleRed,   header: 'Database' },
    { id: 'micro',     ...box(1401, 336, 189, 260), fill: C.greenTile, rule: C.ruleTeal, header: 'Microservices', body: 'Read database copies, consume and replicate Kafka topics into cloud stores.', node: 'cloud-today', icon: 'Concept--insights.svg' },
  ],
  target: [
    { id: 'mainframe', ...box(288, 336, 225, 260), fill: C.cardWhite,   rule: C.ruleBlue,   header: 'Mainframe' },
    { id: 'zdih',      ...box(640, 330, 149, 120), fill: C.purpleTile,  rule: C.rulePurple, header: 'zDIH', body: 'Business Events', node: 'zdih', icon: 'Movement--of--items.svg' },
    { id: 'confluent', ...box(837, 329, 318, 121), fill: C.cardWhite,   rule: C.rulePurple, header: 'Confluent Platform' },
    { id: 'iidr',      ...box(640, 524, 149, 105), fill: C.cardWhite,   rule: C.ruleBlue,   header: 'IIDR CDC*', body: 'Table Level\nBatch Driven', node: 'iidr', icon: 'Lift-and-shift.svg' },
    { id: 'watsonx',   ...box(837, 523, 318, 106), fill: C.watsonxFill, rule: C.ruleBlue,   header: 'watsonx.data', body: 'Iceberg v3 open tables, the one live analytic copy; open catalog (Iceberg REST)', node: 'watsonx', icon: 'Data--storage.svg' },
    { id: 'single',    ...box(1290, 336, 189, 131), fill: C.greenTile,  rule: C.ruleTeal,   header: 'SingleStore', body: 'High speed read cache', node: 'singlestore', icon: 'Concept--insights.svg' },
    { id: 'future',    ...box(1498, 336, 189, 131), fill: C.greenTile,  rule: C.ruleTeal,   header: 'Future Domain Services', body: 'Subscribe, replay, rebuild, etc.', node: 'future-domain', icon: 'Connected--ecosystem.svg' },
    { id: 'snowZcc',   ...box(1231, 534, 343, 106), fill: C.cardWhite,  rule: C.ruleBlue,   header: 'Snowflake, Zero Copy Integration', body: 'bi-directional via Horizon Catalog (Apache Polaris); no landing zone, no duplicates', node: 'snowflake-target', icon: 'data--store.svg' },
  ],
};

/* ── Tiles (clickable sub-blocks inside a card) ───────────────────────────── */
export const TILES = {
  today: [
    { node: 'db2',             ...box(469, 386, 225, 62), fill: C.blueTile, label: 'DB2',  icon: 'DB2.svg' },
    { node: 'vsam',            ...box(469, 460, 225, 62), fill: C.blueTile, label: 'VSAM', icon: 'Cics--vsam-recovery-for-z-os.svg' },
    { node: 'cobol',           ...box(469, 534, 225, 62), fill: C.blueTile, label: 'CICS, Batch, COBOL', icon: 'IBM--z.svg' },
    { node: 'opscopy',         ...box(958, 386, 149, 62), fill: C.redTile,  label: 'Operational Copy', icon: 'Database.svg' },
    { node: 'secondschema',    ...box(958, 460, 149, 62), fill: C.redTile,  label: 'Second Schema', icon: 'Data--storage.svg' },
    { node: 'kafka-today',     ...box(958, 534, 149, 62), fill: C.redTile,  label: 'Fragmented Kafka Estates' },
    { node: 'snowflake-today', ...box(1150, 386, 149, 62), fill: C.redTile, label: 'Snowflake', icon: 'data--store.svg' },
  ],
  target: [
    { node: 'db2',          ...box(288, 386, 225, 62), fill: C.blueTile,   label: 'DB2',  icon: 'DB2.svg' },
    { node: 'vsam',         ...box(288, 460, 225, 62), fill: C.blueTile,   label: 'VSAM', icon: 'Cics--vsam-recovery-for-z-os.svg' },
    { node: 'cobol',        ...box(288, 534, 225, 62), fill: C.blueTile,   label: 'CICS, Batch, COBOL', icon: 'IBM--z.svg' },
    { node: 'kafka-target', ...box(837, 379, 88, 71),  fill: C.purpleTile, label: 'Kafka', icon: 'confluent.svg' },
    { node: 'schema-reg',   ...box(942, 379, 98, 71),  fill: C.purpleTile, label: 'Schema Registry' },
    { node: 'flink',        ...box(1057, 379, 98, 71), fill: C.purpleTile, label: 'Flink', icon: 'Flow--chart.svg' },
  ],
};

/* ── Italic captions ──────────────────────────────────────────────────────
   Each sits 8px below the card above it. The lane captions run the full inner
   width of their 596px lane panel (378..974). */
const note = (x, y, text, w) => ({ x: x - ORIGIN_X, y: y - ORIGIN_Y, text, w });
export const NOTES = {
  today: [],
  target: [
    note(288, 604, 'All writes stay here (CQRS)'),
    note(640, 458, 'Near real-time reads — one atomic event stream, served in well under a second', 520),
    note(640, 637, 'Open Lakehouse “Cloud Lake” — one governed copy, read in place by any engine', 520),
  ],
};

/* ═══════════════════════════════════════════════════════════════════════════
   Connectors — declared by the boxes they join, resolved against real geometry
   ═══════════════════════════════════════════════════════════════════════════ */
const WIRE_SPECS = {
  today: [
    { from: 'oms',          to: 'mainframe',       y: 193, label: 'Orders' },
    { from: 'sor',          to: 'iidr',            y: 193 },
    { from: 'iidr',         to: 'opscopy',         y: 117 },
    { from: 'iidr',         to: 'secondschema',    y: 191 },
    { from: 'iidr',         to: 'kafka-today',     y: 265 },
    { from: 'opscopy',      to: 'snowflake-today', y: 109 },
    { from: 'secondschema', to: 'cloud',           y: 193 },
    { from: 'kafka-today',  to: 'cloud',           y: 265 },
    // Operational Copy -> Cloud: right out of the tile, down through the gap
    // between the two Database cards, then under Snowflake to the panel.
    { from: 'opscopy', to: 'cloud', y: 124, via: [[941, 124], [941, 163]] },
    // Orders rail: out of the OMS, along the bottom, up into Fragmented Kafka.
    { start: [218, 328], to: 'kafka-today', edge: 'bottom', via: [[833, 328]],
      label: 'Orders', labelAt: 622 },
  ],
  target: [
    { from: 'sor',       to: 'serving',   y: 100 },
    { from: 'sor',       to: 'analytics', y: 275 },
    { from: 'zdih',      to: 'confluent', y: 86 },
    { from: 'iidr',      to: 'watsonx',   y: 276 },
    { from: 'serving',   to: 'cloud',     y: 100 },
    { from: 'analytics', to: 'snowZcc',   y: 289, bi: true },
  ],
};

/** id -> geometry, across panels, cards and tiles for the given state. */
function geometryIndex(state) {
  const ix = {};
  for (const p of PANELS[state]) ix[p.id] = p;
  for (const c of CARDS[state]) ix[c.id] = c;
  for (const t of TILES[state]) ix[t.node] = t;
  return ix;
}

/**
 * Turn the declarative specs above into drawable geometry. Every head lands
 * exactly ARROW_GAP short of its target box, by construction.
 */
export function resolveWires(state) {
  const ix = geometryIndex(state);
  const lines = [];
  const polys = [];
  const bi = [];
  const labels = [];

  for (const spec of WIRE_SPECS[state]) {
    const target = ix[spec.to];
    const source = spec.from ? ix[spec.from] : null;
    if (!target || (spec.from && !source)) continue;

    const startX = spec.start ? spec.start[0] : source.x + source.w;
    const startY = spec.start ? spec.start[1] : spec.y;

    if (spec.via) {
      // Routed connector: the final point is derived from the target's edge.
      const last = spec.via[spec.via.length - 1];
      const end = spec.edge === 'bottom'
        ? [last[0], target.y + target.h + ARROW_GAP]   // approaches from below
        : [target.x - ARROW_GAP, last[1]];             // approaches from the left
      polys.push({
        points: [[startX, startY], ...spec.via, end].map((p) => p.join(',')).join(' '),
        x: startX,
      });
    } else if (spec.bi) {
      bi.push({ x1: startX + ARROW_GAP, y1: spec.y, x2: target.x - ARROW_GAP, y2: spec.y, x: startX });
    } else {
      lines.push({ x1: startX, y1: spec.y, x2: target.x - ARROW_GAP, y2: spec.y, x: startX });
    }

    if (spec.label) {
      labels.push({
        x: spec.labelAt ?? Math.round((startX + (target.x - ARROW_GAP)) / 2),
        y: (spec.via ? spec.via[0][1] : spec.y) - LABEL_RISE,
        text: spec.label,
        anchor: spec.labelAt ? 'start' : 'middle',
      });
    }
  }
  return { lines, polys, bi, labels };
}

/* The ZCC annotation is interactive, so it renders as HTML rather than SVG text. */
export const ZCC_LABEL = { x: 986, y: 254, node: 'zcc', text: 'ZCC' };

/* ═══════════════════════════════════════════════════════════════════════════
   Lifecycle grouping — drives the legend and its highlight filter.

   NOTE: the OMS and the cloud microservices do NOT disappear in the target.
   The Figma simply stops drawing the OMS band in the target frame; that is a
   drawing decision, not an architectural one. The OMS is the system of record
   the whole pitch is built on keeping ("All writes stay here"), and the
   microservices persist — they just stop reading copies and start subscribing.
   ═══════════════════════════════════════════════════════════════════════════ */
export const LIFECYCLE = {
  today: {
    retained: ['db2', 'vsam', 'cobol', 'oms'],
    evolved: ['iidr', 'cloud-today'],
    removed: ['opscopy', 'secondschema', 'kafka-today', 'snowflake-today'],
  },
  target: {
    retained: ['db2', 'vsam', 'cobol'],
    evolved: ['iidr'],
    added: ['zdih', 'kafka-target', 'schema-reg', 'flink', 'watsonx', 'singlestore', 'future-domain', 'snowflake-target', 'zcc'],
  },
};

export const LIFECYCLE_META = {
  retained: { label: 'Retained', color: '#0f62fe', hint: 'Unchanged — carries straight over to the target' },
  evolved:  { label: 'Evolved',  color: '#007d79', hint: 'Survives, but with a different job to do' },
  added:    { label: 'New',      color: '#24a148', hint: 'Introduced by the target architecture' },
  removed:  { label: 'Retired',  color: '#da1e28', hint: 'Goes away in the target architecture' },
};

/* Plain-language flow, read out to assistive tech in place of the connectors. */
export const FLOW_SUMMARY = {
  today: [
    'Orders enter the Order Management System on IBM Z, where DB2, VSAM and CICS/COBOL hold the system of record.',
    'Table-level IIDR CDC replicates all 32,000 DB2 tables downstream.',
    'That feeds three separate copies: an Oracle operational copy, a CockroachDB second schema, and fragmented Kafka estates.',
    'The operational copy hops again into Snowflake, adding a third stop before analytics.',
    'Cloud microservices read those copies and replicate them once more into their own stores.',
  ],
  target: [
    'DB2, VSAM and CICS/COBOL keep every write on IBM Z. No application changes.',
    'On the serving lane, IBM zDIH captures each committed unit of work in memory and publishes it as one atomic business event.',
    'Confluent Platform carries that single rail: Kafka with multi-region clusters, Schema Registry contracts, and Flink enrichment.',
    'SingleStore serves sub-second inquiry APIs from it, and future domain services subscribe to the same log.',
    'On the analytics lane, a right-sized IIDR CDC feed lands in watsonx.data as Iceberg v3 open tables.',
    'Snowflake reads those same tables in place through the Horizon catalog: zero copy, no landing zone.',
  ],
};

/* Nodes present in both states — these keep a stable layoutId and morph. */
export const RETAINED = new Set(['db2', 'vsam', 'cobol', 'iidr']);
