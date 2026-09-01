/**
 * FidelityArchitecturePage
 * Interactive architecture view for the Fidelity "Brokerage v1.5" use case.
 *
 * The diagram is a coordinate-faithful rebuild of the Figma frames
 *   "Next Gen Brokerage Trading - Today"   378:953
 *   "Next Gen Brokerage Trading- Target"   380:1039
 * All geometry, colour and connector routing lives in `fidelityLayout.js`.
 *
 * Both states render from one node registry into one tree, so framer-motion can
 * morph the nodes that survive instead of cross-fading two separate canvases:
 *   retained  -> DB2 / VSAM / COBOL / IIDR CDC   (slide + morph via layoutId)
 *   removed   -> Operational Copy, Second Schema, Fragmented Kafka, raw Snowflake
 *   added     -> zDIH, Confluent, SingleStore, watsonx.data, Snowflake Zero-Copy
 *
 * On first load the diagram assembles itself left to right — panels, then cards,
 * then tiles, then the connectors drawing themselves in — so the eye follows the
 * data path. Subsequent state switches skip the cascade and stay snappy.
 */
import { useState, useRef, useMemo, useEffect, useLayoutEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence, LayoutGroup, useReducedMotion } from 'framer-motion';
import {
  Button,
  Tag,
  ContentSwitcher,
  Switch,
  Toggletip,
  ToggletipButton,
  ToggletipContent,
} from '@carbon/react';
import { ArrowLeft } from '@carbon/icons-react';
import {
  STAGE, MIN_SCALE, C, PANELS, CARDS, TILES, NOTES, ZCC_LABEL,
  LIFECYCLE, LIFECYCLE_META, FLOW_SUMMARY, RETAINED, resolveWires,
} from './fidelityLayout';
import './FidelityArchitecturePage.css';

const NODES = {
  /* ── System of Record (retained across both states) ───────────────────── */
  db2: {
    title: 'DB2',
    today: {
      label: 'DB2',
      sub: '32,000 tables',
      tech: 'IBM Db2 for z/OS',
      breakdown:
        'IBM Z hosts 32,000 Db2 tables for the full Order Management System. Table-level CDC replicates every table downstream, burning general processor (MIPS) capacity even for tables no consumer needs.',
      point:
        'Only ~750 of 32,000 tables are actually needed downstream — all are replicated. Every new consumer adds billable MIPS.',
    },
    target: {
      label: 'DB2',
      sub: 'Single source of truth',
      tech: 'IBM Db2 for z/OS',
      breakdown:
        'IBM Z retains all transactional write authority. Db2 stays the system of record; read load is fully offloaded downstream via zDIH. No application changes required.',
      point:
        'CQRS isolation — the mainframe does exactly one job: commit transactions atomically.',
    },
  },
  vsam: {
    title: 'VSAM',
    today: {
      label: 'VSAM',
      tech: 'VSAM datasets on z/OS',
      breakdown:
        'VSAM flat files sit alongside Db2 as operational storage for the OMS. There is no change-capture path for them, so downstream consumers can only see VSAM state after a batch job materialises it.',
      point:
        'No sub-second freshness path exists from VSAM without running expensive GP-based CDC.',
    },
    target: {
      label: 'VSAM',
      sub: 'Captured by zDIH',
      tech: 'VSAM datasets on z/OS',
      breakdown:
        'VSAM retains its role as the write store for specific record types. zDIH captures VSAM changes at the unit-of-work boundary alongside Db2, in the same atomic event.',
      point:
        'Db2 and VSAM changes are captured atomically together — no separate CDC path, no partial state.',
    },
  },
  cobol: {
    title: 'CICS, Batch, COBOL',
    today: {
      label: 'CICS, Batch, COBOL',
      tech: 'CICS TS · COBOL batch',
      breakdown:
        'CICS transactions and COBOL batch jobs make up the operational fabric of the OMS. Batch windows bundle bulk record changes into scheduled cycles — no event-driven path exists.',
      point:
        'Batch-driven updates collapse API freshness to the batch window duration, spiking to 30+ minutes under load.',
    },
    target: {
      label: 'CICS, Batch, COBOL',
      sub: 'Unchanged',
      tech: 'CICS TS · COBOL batch',
      breakdown:
        'CICS and COBOL batch jobs continue to run exactly as they do today. Under CQRS they keep writing to the Z system of record; zDIH observes the commits rather than the applications.',
      point:
        'Zero application changes required on mainframe COBOL to adopt the target architecture.',
    },
  },

  /* ── IIDR CDC (retained — survives, but right-sized in Target) ─────────── */
  iidr: {
    title: 'IIDR CDC',
    today: {
      label: 'Table Level, Batch Driven',
      sub: 'All 32k tables replicated',
      tech: 'IBM InfoSphere Data Replication',
      breakdown:
        'Table-level IIDR CDC captures every row change across all 32k Db2 tables and fans out to the Oracle operational copy, CockroachDB, MSK/Kafka, and Snowflake.',
      point:
        'MIPS tax — table-level CDC burns general processor capacity replicating 32k tables to serve ~750.',
    },
    target: {
      label: 'Table Level, Batch Driven',
      sub: 'Right-sized analytics feed',
      tech: 'IBM InfoSphere Data Replication',
      breakdown:
        'IIDR survives, but only on the Analytics Lane: a right-sized change stream feeds watsonx.data as Iceberg v3 open tables, instead of the full 32k-table firehose.',
      point:
        'Selective feed means CDC overhead is minimal — only analytics-relevant tables are replicated.',
    },
  },

  /* ── Today only — the fragmented copies that disappear in Target ──────── */
  oms: {
    title: 'Order Management System (OMS)',
    today: {
      label: 'Order Management System (OMS)',
      tech: 'IBM Z \u00b7 CICS \u00b7 Db2 \u00b7 VSAM',
      breakdown:
        'The OMS is the trading heart of the platform: order capture, validation, routing, execution and settlement all run here as CICS transactions against Db2 and VSAM. It is the only place a trade is authoritative.',
      point:
        'Everything downstream is a copy of this. Because it is only observable through table-level CDC, consumers inherit its 32k-table storage model instead of its business events.',
    },
  },
  opscopy: {
    title: 'Operational Copy',
    today: {
      label: 'Operational Copy',
      sub: 'OracleDB relational replica',
      tech: 'Oracle Database',
      breakdown:
        'An Oracle relational replica maintained by CDC from Db2. It is the primary source for cloud microservices and the first hop toward Snowflake.',
      point:
        'Freshness collapse — APIs serve stale state during batch windows. Trading decisions made on minutes-old data.',
    },
  },
  secondschema: {
    title: 'Second Schema',
    today: {
      label: 'Second Schema',
      sub: 'CockroachDB, geo-distributed',
      tech: 'CockroachDB',
      breakdown:
        'A second operational copy in CockroachDB for geo-distribution. Every team re-stitches the 32k-table normalisation into its own semantics, independently of the Oracle copy.',
      point:
        'Three sources of truth, zero atomicity. A trade spanning four Db2 tables arrives as four unrelated events.',
    },
  },
  'kafka-today': {
    title: 'Fragmented Kafka Estates',
    today: {
      label: 'Fragmented Kafka Estates',
      sub: 'Amazon MSK + legacy Confluent',
      tech: 'Amazon MSK · legacy Confluent',
      breakdown:
        'A mix of Amazon MSK and legacy Confluent clusters with no shared Schema Registry. Multiple producers write partial table deltas with no coordination between them.',
      point:
        'N×M sprawl — every new consumer spawns another pipeline. Zero atomicity guarantees; partial states visible to readers.',
    },
  },
  'snowflake-today': {
    title: 'Snowflake',
    today: {
      label: 'Snowflake',
      sub: 'Multi-hop, landing zone',
      tech: 'Snowflake (proprietary storage)',
      breakdown:
        'Data arrives via CDC → Oracle → Snowflake: three hops, each adding latency and cost. No open table format, so full Snowflake proprietary compute runs on every refresh.',
      point:
        'Multi-hop cost doubles storage and incurs Snowflake compute charges on data that is already stale on arrival.',
    },
  },
  'cloud-today': {
    title: 'Microservices',
    today: {
      label: 'Read database copies, consume and replicate Kafka topics into cloud stores.',
      tech: '120+ downstream databases',
      breakdown:
        'Cloud microservices read directly from the Oracle copy or CockroachDB, or subscribe to MSK topics — then replicate again into their own cloud stores.',
      point:
        'Each new service spawns another replication pipeline, compounding N×M sprawl across every line of business.',
    },
  },

  /* ── Target only — the event-driven architecture that appears ─────────── */
  zcc: {
    title: 'Zero Copy Connection (ZCC)',
    target: {
      label: 'ZCC',
      tech: 'Apache Polaris / Horizon Catalog federation',
      breakdown:
        'The zero-copy connection lets Snowflake query watsonx.data\u2019s Iceberg tables in place through the shared REST catalog. It is a catalog federation, not a pipeline \u2014 no job moves data and no second copy is created.',
      point:
        'Bi-directional and copy-free. Analysts keep their Snowflake workbench while storage, governance and lineage stay in one governed lakehouse.',
    },
  },
  zdih: {
    title: 'IBM zDIH',
    target: {
      label: 'Business Events',
      sub: '~97% zIIP offload',
      tech: 'IBM Z Digital Integration Hub',
      breakdown:
        'zDIH intercepts Db2 and VSAM changes in-memory at the unit-of-work boundary before they hit disk. Events are grouped by transaction ID and published atomically to Confluent.',
      point:
        '~97% zIIP offload — CDC processing runs on specialty engines, not billable MIPS. One committed transaction = one Confluent message.',
    },
  },
  'kafka-target': {
    title: 'Kafka MRC',
    target: {
      label: 'Kafka MRC',
      tech: 'Confluent Platform, Multi-Region Clusters',
      breakdown:
        'A single authoritative Confluent cluster with Multi-Region Clusters for DR. This is the one write rail for every business event leaving the mainframe.',
      point:
        'One writer, many readers. Any downstream system subscribes to a governed topic instead of building a pipeline.',
    },
  },
  'schema-reg': {
    title: 'Schema Registry',
    target: {
      label: 'Schema Registry',
      tech: 'Confluent Schema Registry (Avro / Protobuf)',
      breakdown:
        'Schema Registry enforces Avro/Protobuf contracts on every topic. Producers cannot publish an incompatible schema change.',
      point:
        'Governed evolution — schema drift eliminated. Consumers always know the shape of the data.',
    },
  },
  flink: {
    title: 'Flink',
    target: {
      label: 'Flink',
      tech: 'Apache Flink (stateful stream processing)',
      breakdown:
        'Flink joins order events with reference data, computes derived aggregates, and republishes enriched, API-aligned domain events (BIAN reference model).',
      point:
        'Enrichment happens once on the stream; every consumer gets the enriched view without running its own pipeline.',
    },
  },
  singlestore: {
    title: 'SingleStore',
    target: {
      label: 'High speed read cache',
      sub: 'P99 < 10ms',
      tech: 'SingleStore (Kafka connector ingest)',
      breakdown:
        'SingleStore ingests Confluent topics and pre-materialises Account, Customer, and ACR aggregates in memory for sub-second inquiry APIs.',
      point:
        'P99 under 10ms for trading inquiry endpoints, served without touching the mainframe.',
    },
  },
  'future-domain': {
    title: 'Future Domain Services',
    target: {
      label: 'Subscribe, replay, rebuild, etc.',
      tech: 'Event-sourced domain services',
      breakdown:
        'Future domain services connect directly to Confluent topics and replay the ordered event log to build their own purpose-built read stores.',
      point:
        'Adding a consumer never adds a pipeline and never adds a copy. The event log is the operational contract.',
    },
  },
  watsonx: {
    title: 'watsonx.data',
    target: {
      label: 'Iceberg v3 open tables — the one live analytic copy; open catalog (Iceberg REST)',
      tech: 'IBM watsonx.data · Apache Iceberg v3',
      breakdown:
        'IIDR feeds a right-sized change stream into watsonx.data, persisted as Apache Iceberg v3 open tables under a unified Iceberg REST Catalog.',
      point:
        'Any engine (Spark, Trino, Presto) reads the same governed Iceberg table. No landing-zone hops, no redundant storage.',
    },
  },
  'snowflake-target': {
    title: 'Snowflake — Zero Copy Integration',
    target: {
      label: 'bi-directional via Horizon Catalog (Apache Polaris); no landing zone, no duplicates',
      tech: 'Snowflake ↔ Apache Polaris / Horizon Catalog',
      breakdown:
        "Snowflake federates to watsonx.data's Iceberg REST Catalog via Apache Polaris (Horizon). Queries run directly on the open Iceberg tables — no data movement, no duplication.",
      point:
        'Zero-copy open table access. Snowflake storage spend drops to near zero, and the Open Governance Plane enforces masking and row policies across every engine.',
    },
  },
};

/* Slide-3 comparison bullets */
const SLIDE3_TODAY = [
  'Ships the storage model \u2014 consumers inherit 32k table normalization shaped by 20 years of COBOL',
  'Freshness coupled to batch windows \u2014 seconds in the good case, 30+ minutes in the bad',
  'Every target re-stitches schemas; semantics re-derived team by team',
  'No unit-of-work atomicity \u2014 partial business states leak to readers',
];
const SLIDE3_TARGET = [
  'Captures business events at the unit-of-work boundary, atomic by construction',
  'API-aligned domain aggregates (BIAN reference model), denormalized for reads',
  'Publish once; any consumer subscribes, with zero new pipelines',
  'CQRS \u2014 writes stay on the Z system of record; reads served from purpose-built stores',
];

/* ═══════════════════════════════════════════════════════════════════════════
   Motion
   ═══════════════════════════════════════════════════════════════════════════ */
const SPRING = { type: 'spring', stiffness: 340, damping: 34, mass: 0.8 };
const POP = {
  initial: { opacity: 0, scale: 0.82 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.7, transition: { duration: 0.18, ease: 'easeIn' } },
};

/* Load cascade: each element's delay tracks its x position, so the diagram
   assembles left to right in the direction the data actually flows. */
const LOAD_SPREAD = 0.55;
const LAYER = { panel: 0, card: 0.10, tile: 0.16, wire: 0.26, note: 0.42 };
const loadDelay = (layer, x, on) =>
  (on ? LAYER[layer] + (Math.max(0, x) / STAGE.w) * LOAD_SPREAD : 0);

const abs = (b) => ({ position: 'absolute', left: b.x, top: b.y, width: b.w, height: b.h });

/* Entrance props for a box. Reduced motion gets a plain fade — no scale, no
   travel — while everyone else gets the pop. */
const entrance = (reduce, layer, x, stagger) => (reduce
  ? {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0, transition: { duration: 0.12 } },
    transition: { duration: 0.2 },
  }
  : {
    initial: POP.initial,
    animate: POP.animate,
    exit: POP.exit,
    transition: { ...SPRING, delay: loadDelay(layer, x, stagger) },
  });

/* ═══════════════════════════════════════════════════════════════════════════
   Toggletip body — Node Title + Technology + Breakdown + Pain / Benefit
   ═══════════════════════════════════════════════════════════════════════════ */
function TipBody({ nodeId, state }) {
  const node = NODES[nodeId];
  const v = node?.[state];
  if (!v) return null;
  const isTarget = state === 'target';
  return (
    <div className="fap-tip-inner">
      <p className="fap-tip-title">{node.title}</p>
      <p className="fap-tip-tech">{v.tech}</p>
      <p className="fap-tip-cap">Technical Breakdown</p>
      <p className="fap-tip-text">{v.breakdown}</p>
      <p className={`fap-tip-cap fap-tip-cap--${isTarget ? 'benefit' : 'pain'}`}>
        {isTarget ? '\u2705 Benefit' : '\uD83D\uDEA8 Pain Point'}
      </p>
      <p className="fap-tip-text">{v.point}</p>
    </div>
  );
}

function Clickable({ nodeId, state, className, style, children }) {
  return (
    <Toggletip autoAlign>
      <ToggletipButton label={`Details for ${NODES[nodeId]?.title || nodeId}`} className={className} style={style}>
        {children}
      </ToggletipButton>
      <ToggletipContent>
        <TipBody nodeId={nodeId} state={state} />
      </ToggletipContent>
    </Toggletip>
  );
}

/* Homepage convention: /icons SVG asset, 24px, brightness(0), bottom-right. */
function BoxIcon({ name }) {
  if (!name) return null;
  return <img src={`/icons/${name}`} alt="" aria-hidden="true" className="fad-icon" />;
}

/* ═══════════════════════════════════════════════════════════════════════════
   Diagram primitives — all absolutely positioned in Figma coordinates
   ═══════════════════════════════════════════════════════════════════════════ */
function Panel({ p, stagger, reduce }) {
  return (
    <motion.div
      layoutId={`panel-${p.id}`}
      layout
      className="fad-panel"
      style={{ ...abs(p), backgroundColor: p.fill, border: p.border ? `1px solid ${p.border}` : 'none' }}
      {...entrance(reduce, 'panel', p.x, stagger)}
    >
      {p.label && <span className="fad-panel-label">{p.label}</span>}
    </motion.div>
  );
}

function CardInner({ c }) {
  return (
    <>
      <span className="fad-rule" style={{ backgroundColor: c.rule }} />
      {c.vertical ? (
        <span className="fad-card-vertical">{c.vertical}</span>
      ) : (
        <span className="fad-card-text">
          {c.header && <span className="fad-card-header">{c.header}</span>}
          {c.body && <span className="fad-card-body">{c.body}</span>}
        </span>
      )}
      <BoxIcon name={c.icon} />
    </>
  );
}

function Card({ c, state, dim, stagger, reduce }) {
  const common = {
    layoutId: `card-${c.id}`,
    layout: true,
    ...entrance(reduce, 'card', c.x, stagger),
  };
  if (!c.node) {
    return (
      <motion.div {...common} className="fad-card" style={{ ...abs(c), backgroundColor: c.fill }}>
        <CardInner c={c} />
      </motion.div>
    );
  }
  return (
    <motion.div {...common} className={`fad-card fad-card--clickable${dim ? ' fad-dim' : ''}`} style={abs(c)}>
      <Clickable nodeId={c.node} state={state} className="fad-hit" style={{ backgroundColor: c.fill }}>
        <CardInner c={c} />
      </Clickable>
    </motion.div>
  );
}

function Tile({ t, state, dim, stagger, reduce }) {
  const retained = RETAINED.has(t.node);
  return (
    <motion.div
      {...(retained ? { layoutId: `tile-${t.node}`, layout: true } : {})}
      className={`fad-tile${dim ? ' fad-dim' : ''}`}
      style={abs(t)}
      {...entrance(reduce, 'tile', t.x, stagger)}
    >
      <Clickable nodeId={t.node} state={state} className="fad-hit" style={{ backgroundColor: t.fill }}>
        <span className="fad-tile-label">{t.label}</span>
        <BoxIcon name={t.icon} />
      </Clickable>
    </motion.div>
  );
}

/* Connectors draw themselves in, in step with the boxes they join. */
function Wires({ state, stagger, faded }) {
  const { lines, polys, bi, labels } = useMemo(() => resolveWires(state), [state]);
  const draw = (x) => {
    const d = loadDelay('wire', x, stagger);
    return {
      initial: { pathLength: 0, opacity: 0 },
      animate: { pathLength: 1, opacity: 1 },
      transition: {
        pathLength: { duration: 0.5, delay: d, ease: 'easeOut' },
        opacity: { duration: 0.25, delay: d },
      },
    };
  };
  return (
    <svg className={`fad-wires${faded ? ' fad-wires--faded' : ''}`}
      width={STAGE.w} height={STAGE.h} viewBox={`0 0 ${STAGE.w} ${STAGE.h}`} aria-hidden="true">
      <defs>
        <marker id="fadArrow" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto">
          <path d="M0,0 L7,3 L0,6 z" fill={C.wire} />
        </marker>
        <marker id="fadArrowBack" markerWidth="7" markerHeight="7" refX="1" refY="3" orient="auto">
          <path d="M7,0 L0,3 L7,6 z" fill={C.wire} />
        </marker>
      </defs>
      {lines.map((l, i) => (
        <motion.line key={`${state}-l${i}`} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
          stroke={C.wire} strokeWidth="1.5" markerEnd="url(#fadArrow)" {...draw(l.x)} />
      ))}
      {bi.map((l, i) => (
        <motion.line key={`${state}-b${i}`} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
          stroke={C.wire} strokeWidth="1.5"
          markerEnd="url(#fadArrow)" markerStart="url(#fadArrowBack)" {...draw(l.x)} />
      ))}
      {polys.map((p, i) => (
        <motion.polyline key={`${state}-p${i}`} points={p.points} fill="none"
          stroke={C.wire} strokeWidth="1.5" markerEnd="url(#fadArrow)" {...draw(p.x)} />
      ))}
      {labels.map((t, i) => (
        <motion.text key={`${state}-t${i}`} x={t.x} y={t.y} textAnchor={t.anchor || 'start'}
          className="fad-wire-label" fill={C.textSoft}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: loadDelay('wire', t.x, stagger) + 0.18 }}>
          {t.text}
        </motion.text>
      ))}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Stage — scales the fixed Figma-sized canvas to fit, panning when it can't
   ═══════════════════════════════════════════════════════════════════════════ */
function Diagram({ state, highlight }) {
  const wrapRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [panning, setPanning] = useState(false);
  const reduce = useReducedMotion();

  // Cascade on first paint only; state switches stay immediate.
  const [cascadeDone, setCascadeDone] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setCascadeDone(true), 1500);
    return () => clearTimeout(t);
  }, []);
  const stagger = !reduce && !cascadeDone;

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return undefined;
    const fit = () => {
      const raw = el.clientWidth / STAGE.w;
      setScale(Math.min(1, Math.max(MIN_SCALE, raw)));
      setPanning(raw < MIN_SCALE);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const inFocus = highlight ? new Set(LIFECYCLE[state][highlight] || []) : null;
  const dimmed = (nodeId) => Boolean(inFocus && nodeId && !inFocus.has(nodeId));

  // One list, ordered by x then y: gives correct paint order AND a tab order
  // that follows the architecture left to right instead of DOM grouping.
  const boxes = useMemo(() => [
    ...CARDS[state].map((c) => ({ kind: 'card', key: `card-${c.id}`, x: c.x, y: c.y, data: c })),
    ...TILES[state].map((t) => ({ kind: 'tile', key: `tile-${t.node}`, x: t.x, y: t.y, data: t })),
  ].sort((a, b) => a.x - b.x || a.y - b.y), [state]);

  return (
    <>
      <ol className="fap-sr-only" id="fad-flow-summary">
        {FLOW_SUMMARY[state].map((line) => <li key={line}>{line}</li>)}
      </ol>
      <div
        className={`fad-wrap${panning ? ' fad-wrap--pan' : ''}`}
        ref={wrapRef}
        style={{ height: STAGE.h * scale }}
        aria-describedby="fad-flow-summary"
      >
        <LayoutGroup id="fidelity-diagram">
          {/* The sizer carries the SCALED footprint. Without it the stage's
              untransformed 1560px layout box sets the scroll range, letting you
              pan hundreds of pixels into empty space. */}
          <div className="fad-sizer" style={{ width: STAGE.w * scale, height: STAGE.h * scale }}>
          <div className="fad-stage" style={{ width: STAGE.w, height: STAGE.h, transform: `scale(${scale})` }}>
            <AnimatePresence mode="popLayout">
              {PANELS[state].map((p) => <Panel key={`panel-${p.id}`} p={p} stagger={stagger} reduce={reduce} />)}
            </AnimatePresence>

            <Wires state={state} stagger={stagger} faded={Boolean(highlight)} />

            <AnimatePresence mode="popLayout">
              {boxes.map((b) => (b.kind === 'card'
                ? <Card key={b.key} c={b.data} state={state} dim={dimmed(b.data.node)} stagger={stagger} reduce={reduce} />
                : <Tile key={b.key} t={b.data} state={state} dim={dimmed(b.data.node)} stagger={stagger} reduce={reduce} />
              ))}
            </AnimatePresence>

            <AnimatePresence>
              {state === 'target' && (
                <motion.div
                  key="zcc"
                  className={`fad-zcc${dimmed(ZCC_LABEL.node) ? ' fad-dim' : ''}`}
                  style={{ position: 'absolute', left: ZCC_LABEL.x, top: ZCC_LABEL.y }}
                  {...entrance(reduce, 'note', ZCC_LABEL.x, stagger)}
                >
                  <Clickable nodeId={ZCC_LABEL.node} state={state} className="fad-zcc-hit">
                    <span className="fad-zcc-text">{ZCC_LABEL.text}</span>
                  </Clickable>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {NOTES[state].map((n) => (
                <motion.span
                  key={n.text}
                  className={`fad-note${highlight ? ' fad-note--faded' : ''}`}
                  style={{ position: 'absolute', left: n.x, top: n.y, width: n.w }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.14 } }}
                  transition={{ duration: 0.35, delay: loadDelay('note', n.x, stagger) }}
                >
                  {n.text}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
          </div>
        </LayoutGroup>
      </div>
    </>
  );
}

/* ─── Comparison bullets ──────────────────────────────────────────────────── */
function ComparisonBullets({ state }) {
  const col = (key, label, items) => (
    <div className={`fap-comparison-col fap-comparison-col--${key}${state === key ? ' fap-comparison-col--active' : ''}`}>
      <div className="fap-comparison-header">
        <span className={`fap-comparison-dot fap-comparison-dot--${key}`} />
        {label}
        {state === key && <span className="fap-comparison-badge">Showing</span>}
      </div>
      <ul className="fap-comparison-list">
        {items.map((b, i) => <li key={i} className="fap-comparison-item">{b}</li>)}
      </ul>
    </div>
  );
  return (
    <div className="fap-comparison">
      {col('today', 'Today', SLIDE3_TODAY)}
      <div className="fap-comparison-divider" />
      {col('target', 'Target', SLIDE3_TARGET)}
    </div>
  );
}

/* ─── Page root ───────────────────────────────────────────────────────────── */
export default function FidelityArchitecturePage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [highlight, setHighlight] = useState(null);

  const state = params.get('state') === 'target' ? 'target' : 'today';
  const stateIndex = state === 'target' ? 1 : 0;
  const groups = Object.keys(LIFECYCLE[state]);

  const switchState = (index) => {
    setParams(index === 1 ? { state: 'target' } : {}, { replace: true });
    setHighlight(null);   // a group may not exist on the other side
  };

  return (
    <div className="fap-root">
      <div className="fap-back-row">
        <Button kind="ghost" size="sm" renderIcon={ArrowLeft} iconDescription="Back"
          onClick={() => navigate('/use-cases')}>
          Use Cases
        </Button>
      </div>

      <div className="fap-header">
        <div className="fap-tags">
          <Tag type="purple" size="sm">Mainframe Modernization</Tag>
          <Tag type="cool-gray" size="sm">Fidelity Investments</Tag>
        </div>
        <h1 className="fap-title">Next-Gen Brokerage Trading Architecture</h1>
        <p className="fap-subtitle">
          Modernizing the world’s largest brokerage platform from table-level CDC batches to
          real-time event streaming — IBM zDIH, Confluent, watsonx.data, and zero-copy Snowflake.
        </p>
      </div>

      <div className="fap-brief">
        <div className="fap-brief-col">
          <h2 className="fap-brief-head fap-brief-head--problem">The problem</h2>
          <p className="fap-brief-text">
            The transactional core still runs on the mainframe, and every downstream team gets its
            data by copying it. Table-level change capture feeds an operational replica, a second
            replica covers another region, each consumer stands up its own streaming estate, and the
            warehouse gets a landing zone on top. Every hop adds licence cost, latency and one more
            schema for someone to re-stitch.
          </p>
          <p className="fap-brief-text">
            The deeper problem is what gets shipped: the storage model, not the business. Consumers
            inherit table structures shaped by decades of application code, freshness collapses to
            whatever the batch window happens to be, and because changes are captured per table
            rather than per transaction, readers can see half-finished business events.
          </p>
        </div>
        <div className="fap-brief-col">
          <h2 className="fap-brief-head fap-brief-head--solution">The solution</h2>
          <p className="fap-brief-text">
            Capture the business event once, at the unit-of-work boundary, and publish it to a
            single governed rail. Writes stay on the system of record, which does not change. Reads
            are served from purpose-built stores that subscribe to that rail, so the mainframe stops
            absorbing query load it was never meant to carry.
          </p>
          <p className="fap-brief-text">
            Analytics reads one open-table copy through a shared catalog instead of a chain of
            replicas. Adding a consumer becomes a subscription rather than a project, and what
            travels between systems is a complete, contract-checked business event.
          </p>
        </div>
      </div>

      <div className="fap-toggle-row">
        <ContentSwitcher selectedIndex={stateIndex}
          onChange={({ index }) => switchState(index)} size="sm">
          <Switch name="today" text="Today — One Mainframe and Many Copies" />
          <Switch name="target" text="Target — Optimized Data Architecture (Brokerage v1.5)" />
        </ContentSwitcher>
      </div>

      <Diagram state={state} highlight={highlight} />

      <div className="fap-legend-row">
        <div className="fap-legend" role="group" aria-label="Highlight components by lifecycle">
          {groups.map((key) => {
            const meta = LIFECYCLE_META[key];
            const active = highlight === key;
            return (
              <button
                key={key}
                type="button"
                className={`fap-chip${active ? ' fap-chip--active' : ''}`}
                style={active ? { borderColor: meta.color, color: meta.color } : undefined}
                aria-pressed={active}
                title={meta.hint}
                onClick={() => setHighlight(active ? null : key)}
              >
                <span className="fap-dot" style={{ backgroundColor: meta.color }} />
                {meta.label}
                <span className="fap-chip-count">{LIFECYCLE[state][key].length}</span>
              </button>
            );
          })}
        </div>
        <span className="fap-legend-hint" aria-live="polite">
          {highlight
            ? `${LIFECYCLE_META[highlight].label}: ${LIFECYCLE_META[highlight].hint}`
            : 'Select a group to highlight it — or click any box for technical detail'}
        </span>
      </div>

      <ComparisonBullets state={state} />
    </div>
  );
}
