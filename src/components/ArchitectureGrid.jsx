import { Grid, Column } from "@carbon/react";
import MainBox from "./MainBox";
import DataSection from "./DataSection";
import FoundationSection from "./FoundationSection";
import { COLUMNS } from "../data/componentData";

const colById = (id) => COLUMNS.find((c) => c.id === id);

export default function ArchitectureGrid({ onNavigateToUseCases }) {
  return (
    <Grid fullWidth className="arch-outer">
      <Column lg={16} md={8} sm={4}>
        <div className="arch-hero">
          <div className="arch-title">
            <h1 className="arch-heading">FSM Must Wins Architecture</h1>
            <p className="arch-subtitle">
              Click any component or expand the header arrows for more details
            </p>
          </div>
          <div className="arch-logo">
            <img src="EETeamLogo.svg" style={{ height: "4.5rem" }} />
          </div>
        </div>

        {/*
          CSS Grid layout — 7 columns, 3 explicit rows:
            Row 1: all 7 main boxes (shorter ones end here; taller ones continue)
            Row 2: Data section (cols 3–5) + App/DataInt & CoreApps continuation
            Row 3: Foundation (cols 3–7)
          DevProd (col 1) and Channels (col 2) span all 3 rows.
        */}
        <div className="arch-layout">
          {/* Col 1 — Developer Productivity (spans all rows) */}
          <div className="arch-col arch-col--devprod arch-col--full-span">
            <MainBox column={colById("devprod")} onNavigateToUseCases={onNavigateToUseCases} />
          </div>

          {/* Col 2 — Channels (spans all rows) */}
          <div className="arch-col arch-col--channels arch-col--full-span">
            <MainBox column={colById("channels")} onNavigateToUseCases={onNavigateToUseCases} />
          </div>

          {/* Col 3 — Experience APIs (row 1 only) */}
          <div className="arch-col arch-col--expapis arch-col--short">
            <MainBox column={colById("expapis")} onNavigateToUseCases={onNavigateToUseCases} />
          </div>

          {/* Col 4 — Business Processes (row 1 only) */}
          <div className="arch-col arch-col--bizproc arch-col--short">
            <MainBox column={colById("bizproc")} onNavigateToUseCases={onNavigateToUseCases} />
          </div>

          {/* Col 5 — Applications (row 1 only) */}
          <div className="arch-col arch-col--apps arch-col--short">
            <MainBox column={colById("apps")} onNavigateToUseCases={onNavigateToUseCases} />
          </div>

          {/* Col 6 — App/Data Integration (rows 1–2) */}
          <div className="arch-col arch-col--appdataint arch-col--tall">
            <MainBox column={colById("appdataint")} onNavigateToUseCases={onNavigateToUseCases} />
          </div>

          {/* Col 7 — Core Applications (rows 1–2) */}
          <div className="arch-col arch-col--coreapps arch-col--tall">
            <MainBox column={colById("coreapps")} onNavigateToUseCases={onNavigateToUseCases} />
          </div>

          {/* Row 2 — Data section (cols 3–5) */}
          <div className="arch-data">
            <DataSection />
          </div>

          {/* Row 3 — Foundation (cols 3–7) */}
          <div className="arch-foundation">
            <FoundationSection />
          </div>
        </div>
      </Column>
    </Grid>
  );
}
