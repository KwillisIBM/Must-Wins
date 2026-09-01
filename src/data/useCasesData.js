// Static use case data parsed from "Must Wins Use Cases.xlsx".
// Add new rows here as the spreadsheet grows — columns map 1:1 with the Excel headers.
export const USE_CASES = [
  {
    id: 'uc-1',
    // Col A
    name: 'The Unified Enterprise Business Manager',
    // Col B
    company: 'Cleveland Clinic',
    // Col C
    date: "Sept 24'",
    // Col D
    mustWinName: 'Automate and Optimize Technology Investment and Operations',
    // Col E
    mustWinDetails:
      'Overview: Align resource needs with business value\n\nBusiness Value:\n• Provide real-time, actionable cost and performance insights to make data-driven decisions\n• Increase cloud cost visibility and proactively optimize costs\n• Achieve increased productivity and cost-effective asset operations\n\nUse Cases:\n• Hybrid IT Financial Management\n• Maximize the value of cloud investments\n• Asset Lifecycle Management\n\nLead Products: Apptio, Cloudability, Turbonomic',
    // Col F
    narrative:
      'Large organizations undergoing heavy M&A (like a hospital acquiring clinics) struggle to track their combined IT and physical assets. This path demonstrates how bridging Technology Business Management (IT spend) with Enterprise Business Management (physical facilities/medical equipment) allows a business to calculate their true operational profitability.',
    // Col G (full path summary — for reference)
    goldenPathSummary:
      'Web / Internal Portals (Channels) ➔ App/Data Integration (Central Nervous System - Integrating platforms) ➔ Apptio (Business Processes - Costing) ➔ Maximo (Core Applications - Asset Lifecycle Management) ➔ Data Lakehouse / Catalog (Data - Merging the metrics).',
    // Cols H–L (sequential steps)
    goldenPathSteps: [
      'Web/Internal Portals',
      'App/Data Integration',
      'Apptio',
      'Maximo',
      'Data Lakehouse/Catalog',
    ],
    // Col M
    pitch:
      "This is how you move the conversation from IT to the boardroom. By showing how we integrated Apptio and Maximo for Cleveland Clinic, we prove we can measure the true 'cost-to-serve per patient' by tying IT server costs directly to the power consumption of physical medical equipment.",
    // Cols N–P
    products: ['Apptio', 'Maximo'],
    links: [
      { url: 'https://www.ibm.com/products/apptio', title: 'Apptio Product Overview', description: 'How Apptio aligns technology spend with business value across hybrid IT environments.' },
      { url: 'https://www.ibm.com/products/maximo', title: 'IBM Maximo Application Suite', description: 'AI-powered asset lifecycle management for physical infrastructure and facilities.' },
      { url: '', title: '', description: '' },
    ],
  },
  {
    id: 'uc-2',
    name: 'The Multi-Cloud AI Optimizer',
    company: 'Nvidia',
    date: "Oct 24'",
    mustWinName: 'Automate and Optimize Technology Investment and Operations',
    mustWinDetails:
      'Overview: Align resource needs with business value\n\nBusiness Value:\n• Provide real-time, actionable cost and performance insights to make data-driven decisions\n• Increase cloud cost visibility and proactively optimize costs\n• Achieve increased productivity and cost-effective asset operations\n\nUse Cases:\n• Hybrid IT Financial Management\n• Maximize the value of cloud investments\n• Asset Lifecycle Management\n\nLead Products: Apptio, Cloudability, Turbonomic',
    narrative:
      'Building and running Generative AI requires massive GPU grids spread across multiple hyperscalers (AWS, GCP, Azure, OCI). As these grids scale, cloud costs spiral out of control. This path shows how a FinOps culture tracks every dollar, while simultaneously assuring the performance of those heavy AI workloads.',
    goldenPathSummary:
      'Enterprise Applications (Developer Productivity / Channels) ➔ Apptio/Cloudability (Business Processes - Financial Management) ➔ Turbonomic (Applications - Resource Optimization) ➔ Infrastructure / Public Cloud (Foundation - AWS, Azure, GCP).',
    goldenPathSteps: [
      'Enterprise Applications',
      'Apptio/Cloudability',
      'Turbonomic',
      'Infrastructure/Public Cloud',
    ],
    pitch:
      "When a client is scaling GenAI and their cloud bill is bleeding them dry, you light up this path. It shows how we do exactly what we did for Nvidia: provide the visibility to track the spend, and the automation to keep those GPU grids running efficiently without over-provisioning.",
    products: ['Apptio', 'Turbonomic'],
    links: [
      { url: 'https://www.ibm.com/products/turbonomic', title: 'Turbonomic AI-Powered Optimization', description: 'Continuous resource optimization across cloud and on-prem to keep AI workloads performing efficiently.' },
      { url: 'https://www.ibm.com/products/cloudability', title: 'IBM Cloudability FinOps Platform', description: 'Track, allocate, and optimize multi-cloud spend across AWS, GCP, Azure, and OCI.' },
      { url: '', title: '', description: '' },
    ],
  },

  // ── Hybrid Cloud filler ───────────────────────────────────────────────────
  {
    id: 'uc-3',
    name: 'The VMware Escape Plan',
    company: 'JPMorgan Chase',
    date: "Jan 25'",
    mustWinName: 'Enable Portable Workloads',
    mustWinDetails: '',
    narrative:
      'Following Broadcom\'s acquisition of VMware, licensing costs for large enterprise fleets tripled overnight. JPMorgan needed a path off VMware virtualization that preserved application portability without rewriting workloads. This path shows how Red Hat OpenShift Virtualization becomes the landing zone — keeping the same VM-based workloads running while opening a clear modernization runway.',
    goldenPathSummary:
      'VMware Estate (Core Applications) ➔ Red Hat OpenShift Virtualization (Applications) ➔ Red Hat Ansible (Developer Productivity) ➔ Red Hat Enterprise Linux (Foundation).',
    goldenPathSteps: [
      'VMware Estate Assessment',
      'Red Hat OpenShift Virtualization',
      'Red Hat Ansible Automation',
      'Red Hat Enterprise Linux',
    ],
    pitch:
      'Every enterprise with a VMware contract is looking for a way out. This is the path we used with JPMorgan: migrate the VM estate to OpenShift Virtualization so they stop paying the Broadcom tax, then use Ansible to automate the ongoing lifecycle — all without a single application rewrite.',
    products: ['Red Hat OpenShift', 'Red Hat Ansible', 'Red Hat Enterprise Linux'],
    links: [],
  },

  // ── Data filler ───────────────────────────────────────────────────────────
  {
    id: 'uc-4',
    name: 'The Trusted AI Factory',
    company: 'Morgan Stanley',
    date: "Mar 25'",
    mustWinName: 'Accelerate the Business Impact of AI',
    mustWinDetails: '',
    narrative:
      'Financial services firms face a hard reality: AI models trained on stale or ungoverned data produce decisions that cannot be audited by regulators. Morgan Stanley needed a way to build, run, and govern AI at scale without sacrificing trust. This path demonstrates how watsonx.ai and watsonx.governance combine to create a fully auditable AI factory — from model training through production inference.',
    goldenPathSummary:
      'Data Lakehouse (Data) ➔ watsonx.data (Data Integration) ➔ watsonx.ai (Applications - Model Training) ➔ watsonx.governance (Business Processes - Risk & Compliance) ➔ watsonx Assistants (Channels - End User).',
    goldenPathSteps: [
      'Data Lakehouse',
      'watsonx.data',
      'watsonx.ai',
      'watsonx.governance',
      'watsonx Assistants',
    ],
    pitch:
      'When a client asks how they govern AI in a regulated environment, this is the answer. We show how Morgan Stanley went from ad-hoc model experiments to a fully governed AI pipeline — every model decision traceable, every bias check automated, every regulator question answerable in under 60 seconds.',
    products: ['watsonx.ai', 'watsonx.governance', 'watsonx.data'],
    links: [],
  },

  // ── Transaction Processing filler ─────────────────────────────────────────
  {
    id: 'uc-5',
    name: 'The Mainframe Modernization Sprint',
    company: 'Bank of America',
    date: "Feb 25'",
    mustWinName: 'Automate Mainframe Development',
    mustWinDetails: '',
    narrative:
      'Bank of America runs over 50 billion transactions per year on IBM Z — but their COBOL codebase had grown to 150 million lines with no automated testing and deployment cycles measured in months. This path shows how watsonx Code Assistant for Z and automated CI/CD pipelines cut deployment cycle time by 70%, with AI-generated test coverage catching regressions before they hit production.',
    goldenPathSummary:
      'COBOL Source (Core Applications) ➔ watsonx Code Assistant for Z (Developer Productivity) ➔ CI/CD Pipeline (Developer Productivity) ➔ Automated Testing (Developer Productivity) ➔ IBM Z Production (Core Applications).',
    goldenPathSteps: [
      'COBOL Source Analysis',
      'watsonx Code Assistant for Z',
      'CI/CD Pipeline Automation',
      'Automated Test Coverage',
      'IBM Z Production Deployment',
    ],
    pitch:
      'Any bank running Z is sitting on a ticking clock — the COBOL developers who know this code are retiring. This is how we solved it for Bank of America: AI-assisted modernization that understands the code, generates tests, and automates deployments so they can move fast without breaking the transaction rail that processes half the world\'s credit card payments.',
    products: ['watsonx Code Assistant for Z', 'IBM Z', 'Red Hat Ansible'],
    links: [],
  },

  // ── Mainframe Modernization ───────────────────────────────────────────────
  {
    id: 'fidelity-trading-architecture-v1-5',
    name: 'Fidelity Investments: Composing Next-Gen Trading Architecture',
    company: 'Fidelity Investments',
    date: "Jul 25'",
    mustWinName: 'Mainframe Modernization',
    mustWinDetails:
      'Overview: Modernize critical mainframe workloads from batch-bound, table-level CDC to real-time event streaming\n\nBusiness Value:\n• Eliminate MIPS general processor tax via ~97% zIIP offload through IBM zDIH\n• Deliver atomic unit-of-work streaming from DB2 + VSAM to Confluent Platform\n• Power sub-second trading inquiry APIs with SingleStore read cache\n• Establish a governed open lakehouse on watsonx.data (Apache Iceberg v3)\n• Enable zero-copy Snowflake analytics via Apache Polaris / Horizon integration\n\nUse Cases:\n• Real-time brokerage event streaming with CQRS isolation\n• Single governed analytic copy via right-sized IIDR CDC\n• Zero-copy open table access for downstream consumers\n\nLead Products: IBM zDIH, Confluent Platform, IBM IIDR, watsonx.data, SingleStore, Snowflake',
    narrative:
      "Fidelity Investments runs the world's largest brokerage platform on IBM Z — but their data architecture had calcified around table-level CDC batches, 30+ minute latency spikes, and a sprawl of redundant copies (OracleDB, CockroachDB, raw Snowflake) all fed by non-atomic Kafka pipelines. Brokerage v1.5 replaces that fragmentation with a clean, event-driven architecture: IBM zDIH captures every unit-of-work atomically at ~97% zIIP offload, Confluent Platform provides a single write rail with Flink enrichment, SingleStore serves sub-second Account and ACR inquiry APIs, and watsonx.data + Snowflake Zero-Copy eliminate the landing-zone tax entirely.",
    goldenPathSummary:
      'Mainframe / System of Record (IBM Z DB2 + VSAM) ➔ IBM zDIH (In-memory event cache, ~97% zIIP offload) ➔ Confluent Platform / Flink (One writer, many readers) ➔ SingleStore (Sub-second CQRS read cache) ➔ watsonx.data Iceberg v3 (Open lakehouse) ➔ Snowflake Zero-Copy (Apache Polaris / Horizon).',
    goldenPathSteps: [
      'Mainframe / System of Record',
      'IBM zDIH Event Cache',
      'Confluent Platform / Flink',
      'SingleStore Read Cache',
      'watsonx.data (Iceberg v3)',
      'Snowflake Zero-Copy',
    ],
    pitch:
      "Every large brokerage is drowning in data copies. The conversation you open with Fidelity is: 'What if you could eliminate four redundant schemas, cut Snowflake spend by removing multi-hop CDC pipelines, and serve sub-second trading inquiries — all from one atomic event rail?' IBM zDIH at the mainframe boundary, Confluent as the nervous system, and watsonx.data as the governed lakehouse makes that architecture real today.",
    products: ['IBM zDIH', 'Confluent Platform', 'IBM IIDR', 'watsonx.data', 'SingleStore', 'Snowflake'],
    links: [],
    isInteractive: true,
    viewKey: 'fidelity-architecture',
  },
];
