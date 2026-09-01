import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://oujldtrhjluleqobcqyf.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY env var');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const schema = `
create table if not exists use_cases (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  date text,
  must_win_name text,
  narrative text,
  golden_path_summary text,
  golden_path_steps text[],
  pitch text,
  products text[],
  created_at timestamptz default now()
);

create table if not exists likes (
  id uuid primary key default gen_random_uuid(),
  use_case_id uuid references use_cases(id) on delete cascade,
  created_at timestamptz default now()
);

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  use_case_id uuid references use_cases(id) on delete cascade,
  author text default 'Anonymous',
  text text not null,
  created_at timestamptz default now()
);

alter table use_cases enable row level security;
alter table likes enable row level security;
alter table comments enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'use_cases' and policyname = 'public read') then
    create policy "public read" on use_cases for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'use_cases' and policyname = 'public insert') then
    create policy "public insert" on use_cases for insert with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'likes' and policyname = 'public read') then
    create policy "public read" on likes for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'likes' and policyname = 'public insert') then
    create policy "public insert" on likes for insert with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'comments' and policyname = 'public read') then
    create policy "public read" on comments for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'comments' and policyname = 'public insert') then
    create policy "public insert" on comments for insert with check (true);
  end if;
end $$;
`;

const USE_CASES = [
  {
    name: 'The Unified Enterprise Business Manager',
    company: 'Cleveland Clinic',
    date: "Sept 24'",
    must_win_name: 'Automate and Optimize Technology Investment and Operations',
    narrative: "Large organizations undergoing heavy M&A (like a hospital acquiring clinics) struggle to track their combined IT and physical assets. This path demonstrates how bridging Technology Business Management (IT spend) with Enterprise Business Management (physical facilities/medical equipment) allows a business to calculate their true operational profitability.",
    golden_path_summary: 'Web / Internal Portals (Channels) ➔ App/Data Integration ➔ Apptio (Business Processes) ➔ Maximo (Core Applications) ➔ Data Lakehouse / Catalog (Data).',
    golden_path_steps: ['Web/Internal Portals', 'App/Data Integration', 'Apptio', 'Maximo', 'Data Lakehouse/Catalog'],
    pitch: "This is how you move the conversation from IT to the boardroom. By showing how we integrated Apptio and Maximo for Cleveland Clinic, we prove we can measure the true cost-to-serve per patient by tying IT server costs directly to the power consumption of physical medical equipment.",
    products: ['Apptio', 'Maximo'],
  },
  {
    name: 'The Multi-Cloud AI Optimizer',
    company: 'Nvidia',
    date: "Oct 24'",
    must_win_name: 'Automate and Optimize Technology Investment and Operations',
    narrative: "Building and running Generative AI requires massive GPU grids spread across multiple hyperscalers (AWS, GCP, Azure, OCI). As these grids scale, cloud costs spiral out of control. This path shows how a FinOps culture tracks every dollar, while simultaneously assuring the performance of those heavy AI workloads.",
    golden_path_summary: 'Enterprise Applications (Developer Productivity) ➔ Apptio/Cloudability (Business Processes) ➔ Turbonomic (Applications) ➔ Infrastructure / Public Cloud (Foundation).',
    golden_path_steps: ['Enterprise Applications', 'Apptio/Cloudability', 'Turbonomic', 'Infrastructure/Public Cloud'],
    pitch: "When a client is scaling GenAI and their cloud bill is bleeding them dry, you light up this path. It shows how we do exactly what we did for Nvidia: provide the visibility to track the spend, and the automation to keep those GPU grids running efficiently without over-provisioning.",
    products: ['Apptio', 'Turbonomic'],
  },
  {
    name: 'The VMware Escape Plan',
    company: 'JPMorgan Chase',
    date: "Jan 25'",
    must_win_name: 'Enable Portable Workloads',
    narrative: "Following Broadcom's acquisition of VMware, licensing costs for large enterprise fleets tripled overnight. JPMorgan needed a path off VMware virtualization that preserved application portability without rewriting workloads. This path shows how Red Hat OpenShift Virtualization becomes the landing zone — keeping the same VM-based workloads running while opening a clear modernization runway.",
    golden_path_summary: 'VMware Estate (Core Applications) ➔ Red Hat OpenShift Virtualization (Applications) ➔ Red Hat Ansible (Developer Productivity) ➔ Red Hat Enterprise Linux (Foundation).',
    golden_path_steps: ['VMware Estate Assessment', 'Red Hat OpenShift Virtualization', 'Red Hat Ansible Automation', 'Red Hat Enterprise Linux'],
    pitch: "Every enterprise with a VMware contract is looking for a way out. This is the path we used with JPMorgan: migrate the VM estate to OpenShift Virtualization so they stop paying the Broadcom tax, then use Ansible to automate the ongoing lifecycle — all without a single application rewrite.",
    products: ['Red Hat OpenShift', 'Red Hat Ansible', 'Red Hat Enterprise Linux'],
  },
  {
    name: 'The Trusted AI Factory',
    company: 'Morgan Stanley',
    date: "Mar 25'",
    must_win_name: 'Accelerate the Business Impact of AI',
    narrative: "Financial services firms face a hard reality: AI models trained on stale or ungoverned data produce decisions that cannot be audited by regulators. Morgan Stanley needed a way to build, run, and govern AI at scale without sacrificing trust. This path demonstrates how watsonx.ai and watsonx.governance combine to create a fully auditable AI factory.",
    golden_path_summary: 'Data Lakehouse (Data) ➔ watsonx.data ➔ watsonx.ai (Applications) ➔ watsonx.governance (Business Processes) ➔ watsonx Assistants (Channels).',
    golden_path_steps: ['Data Lakehouse', 'watsonx.data', 'watsonx.ai', 'watsonx.governance', 'watsonx Assistants'],
    pitch: "When a client asks how they govern AI in a regulated environment, this is the answer. We show how Morgan Stanley went from ad-hoc model experiments to a fully governed AI pipeline — every model decision traceable, every bias check automated.",
    products: ['watsonx.ai', 'watsonx.governance', 'watsonx.data'],
  },
  {
    name: 'The Mainframe Modernization Sprint',
    company: 'Bank of America',
    date: "Feb 25'",
    must_win_name: 'Automate Mainframe Development',
    narrative: "Bank of America runs over 50 billion transactions per year on IBM Z — but their COBOL codebase had grown to 150 million lines with no automated testing and deployment cycles measured in months. This path shows how watsonx Code Assistant for Z and automated CI/CD pipelines cut deployment cycle time by 70%.",
    golden_path_summary: 'COBOL Source (Core Applications) ➔ watsonx Code Assistant for Z (Developer Productivity) ➔ CI/CD Pipeline ➔ Automated Testing ➔ IBM Z Production.',
    golden_path_steps: ['COBOL Source Analysis', 'watsonx Code Assistant for Z', 'CI/CD Pipeline Automation', 'Automated Test Coverage', 'IBM Z Production Deployment'],
    pitch: "Any bank running Z is sitting on a ticking clock — the COBOL developers who know this code are retiring. This is how we solved it for Bank of America: AI-assisted modernization that understands the code, generates tests, and automates deployments.",
    products: ['watsonx Code Assistant for Z', 'IBM Z', 'Red Hat Ansible'],
  },
];

async function run() {
  console.log('Creating schema…');
  const { error: schemaError } = await supabase.rpc('exec_sql', { sql: schema }).catch(() => ({ error: 'rpc not available' }));

  // Fall back to direct postgres if rpc isn't set up
  if (schemaError) {
    console.log('Schema: run the CREATE TABLE SQL manually in the Supabase dashboard (one-time only).');
  } else {
    console.log('Schema ready.');
  }

  console.log('Seeding use cases…');
  const { data: existing } = await supabase.from('use_cases').select('name');
  const existingNames = new Set((existing ?? []).map((r) => r.name));

  for (const uc of USE_CASES) {
    if (existingNames.has(uc.name)) {
      console.log(`  skip (exists): ${uc.name}`);
      continue;
    }
    const { error } = await supabase.from('use_cases').insert(uc);
    if (error) console.error(`  error: ${uc.name}`, error.message);
    else console.log(`  inserted: ${uc.name}`);
  }

  console.log('Done.');
}

run();
