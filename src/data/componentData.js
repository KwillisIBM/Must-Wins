const ICON_MAP = {
  'Banking': 'Banking.svg',
  'Insurance': 'Insurance.svg',
  'Finance -and-operations': 'Finance-and-operations.svg',
  'credit--card': 'Credit--card.svg',
  'Cics--vsam-recovery-for-z-os': 'Cics--vsam-recovery-for-z-os.svg',
  'DB2': 'DB2.svg',
  'Database': 'Database.svg',
  'data--store': 'data--store.svg',
  'documentation': 'Documentation.svg',
  'virtual--storage': 'Virtual--storage.svg',
  'Movement--of--items': 'Movement--of--items.svg',
  'confluent': 'confluent.svg',
  'question': 'Question.svg',
  'IBM--Z': 'IBM--z.svg',
  'visibility': 'Visibility.svg',
  'Concept--insights': 'Concept--insights.svg',
  'internet-of-things--03': 'internet-of-things--03.svg',
  'workflows': 'Workflows.svg',
  'oil--pump': 'Oil--pump.svg',
  'robotics': 'Robotics.svg',
  'Incident-reporter': 'Incident-reporter.svg',
  'App--developer': 'App--developer.svg',
  'Data--APIs ': 'Data--APIs.svg',
  'Lift-and-shift': 'Lift-and-shift.svg',
  'Control-panel': 'Control-panel.svg',
  'Hybrid--cloud--services': 'Hybrid--cloud--services.svg',
  'Data--storage': 'Data--storage.svg',
  'Flow--chart': 'Flow--chart.svg',
  'Connected--ecosystem': 'Connected--ecosystem.svg',
  'websites': 'Websites.svg',
  'Mobile--chat': 'Mobile--chat.svg',
  'Conversation': 'Conversation.svg',
  'Player--flow': 'Player--flow.svg',
  'Javascript': 'Javascript.svg',
  'Machine--learning--04': 'Machine--learning--04.svg',
  'waymo-car': 'waymo-car.svg',
  'Enterprise--design--thinking--02': 'Enterprise--design--thinking--02.svg',
  'Prepare': 'Prepare.svg',
  'Oil--pump': 'Oil--pump.svg',
  'Robotics': 'Robotics.svg',
};

export function getIconSrc(iconName) {
  if (!iconName) return null;
  const trimmed = iconName.trim();
  const file = ICON_MAP[trimmed] || `${trimmed}.svg`;
  return `/icons/${file}`;
}

// Main architecture columns (left to right)
export const COLUMNS = [
  {
    id: 'devprod',
    label: 'Developer\nProductivity',
    lineColor: '#78AAF7',
    hasPopover: false,
    spanAllRows: true,
    description: null,
  },
  {
    id: 'channels',
    label: 'Channels\n ',
    lineColor: '#A7C8F8',
    hasPopover: false,
    spanAllRows: true,
    description: null,
  },
  {
    id: 'expapis',
    label: 'Experience\nAPIs',
    lineColor: '#14AE5C',
    hasPopover: true,
    spanAllRows: false,
    tallHeight: false,
    mustWinCategory: 'Automation',
    description: 'Modern application integration connects systems, processes, and partners across hybrid environments. Secure, API‑led and event‑driven integration enables faster innovation without increasing operational risk.\n\nCore to Mod (Integration)\n• Datapower\n• ACE\n• API Connect\n• CP for Integration\n\nIntegrate Applications\n• webMethods Hybrid Integration\n• API Connect',
  },
  {
    id: 'bizproc',
    label: 'Business\nProcesses',
    lineColor: '#002D9C',
    hasPopover: true,
    spanAllRows: false,
    tallHeight: false,
    mustWinCategory: 'Automation',
    description: 'Business automation modernizes workflows by combining process intelligence, content, and AI‑driven decisioning. Agentic AI unlocks new levels of productivity by enabling smarter, more autonomous operations.\n\nCore to Mod (Business Automation)\n• CP for BA\n• Filenet\n• ODM\n• CMOD\n• BAW\n• MyEnvinio\n• WDG\n\nAgentic/AI Led Automation\n• WatsonX Orchestrate',
  },
  {
    id: 'apps',
    label: 'Applications\n ',
    lineColor: '#A56EFF',
    hasPopover: true,
    spanAllRows: false,
    tallHeight: false,
    mustWinCategory: 'Automation',
    description: 'Optimizing application performance and technology investments ensures modernization delivers measurable business value.\n\nAutomate Application Resiliency\n• Turbonomic, Instana, Concert\n• Sev One, Ansible, WCA for Ansible\n\nAutomate and Optimize Technology Investments\n• Apptio\n• Cloudablity\n• Turbonomic\n\nCore to Mod (App Runtime)\n• EAR\n• WCA for Java\n• Jsphere Suite',
  },
  {
    id: 'appdataint',
    label: 'App/Data\nIntegration',
    lineColor: '#8F8F8F',
    hasPopover: true,
    spanAllRows: false,
    tallHeight: true,
    mustWinCategory: 'Data',
    description: 'The central nervous system. Modern integration unlocks real‑time access to core data without disrupting systems of record. By streaming information instead of copying raw data, clients can power digital experiences and AI with lower cost and complexity.\n\nCore to Mod (Integration)\n• MQ\n• C:D, SFG\n\nCode Mod (Data)\n• CDC\n• Datastage\n\nIBM Z / Data\n• zDIH\n• Zconnect\n• DVM',
  },
  {
    id: 'coreapps',
    label: 'Core\nApplications',
    lineColor: '#000000',
    hasPopover: true,
    spanAllRows: false,
    tallHeight: true,
    mustWinCategory: 'Transaction Processing',
    description: 'Automating development and operations on IBM Z enables faster, safer modernization of core systems. AI‑assisted tooling and intelligent observability reduce technical debt while keeping mission‑critical workloads highly resilient.\n\nAutomate Z Development\n• Code Asst for Z\n• WatsonX Assistant\n\nSimplify Z Operations\n• Omegamon, Instana\n• Intellimagic\n• WatsonX Assistant\n• Hashicorp\n• Concert\n• ML for Z',
  },
];

// Sub-boxes: group maps to parent column id
export const SUB_BOXES = [
  // Core Applications
  { group: 'coreapps', text: 'Banking', color: '#C6C6C6', textColor: null, header: 'Banking', desc: 'Core Banking \nPayments\nCards processing\nCustomer/Product Master', icon: 'Banking' },
  { group: 'coreapps', text: 'Insurance', color: '#C6C6C6', textColor: null, header: 'Insurance', desc: 'Policy Administration\nClaims Processing\nBilling and Commissions', icon: 'Insurance' },
  { group: 'coreapps', text: 'Asset Management', color: '#C6C6C6', textColor: null, header: 'Asset Management', desc: 'Custody and Asset Servicing\nFund accounting\nTrade processing\nTrade Settlement', icon: 'Finance -and-operations' },
  { group: 'coreapps', text: 'Card Networks', color: '#C6C6C6', textColor: null, header: 'Card Networks', desc: 'Transaction authorization\nSettlement and Clearing\nFraud and Risk Decisioning', icon: 'credit--card' },
  { group: 'coreapps', text: 'VSAM', color: '#C6C6C6', textColor: null, header: 'Virtual Storage Access Method', desc: 'A highly efficient, record-oriented file storage system created —incredibly fast for reading and writing massive sequential files.', icon: 'Cics--vsam-recovery-for-z-os' },
  { group: 'coreapps', text: 'DB2', color: '#C6C6C6', textColor: null, header: 'Database 2', desc: "IBM's flagship relational database. It organizes data into strict tables with rows and columns.", icon: 'DB2' },
  { group: 'coreapps', text: 'IMS', color: '#C6C6C6', textColor: null, header: 'IP Multimedia Subsystem', desc: 'A hierarchical database (organizing data like a family tree) combined with a transaction processing engine — faster than almost anything else on earth for processing specific types of high-volume transactions.', icon: 'Database' },

  // App/Data Integration
  { group: 'appdataint', text: 'Messaging (MQ)', color: '#C6C6C6', textColor: null, header: 'Messaging', desc: "A highly secure, asynchronous message queue.\n\nExample: A customer initiates a wire transfer. The request is placed in an MQ queue to ensure that even if a server crashes, the money isn't accidentally sent twice or lost in the void.", icon: 'data--store' },
  { group: 'appdataint', text: 'Batch/File (C:D, SFG)', color: '#C6C6C6', textColor: null, header: 'Connect:Direct & Sterling File Gateway', desc: 'Connect:Direct (C:D) and Sterling File Gateway (SFG) are Managed File Transfer (MFT) solutions. These tools move massive files securely between banks and external partners.', icon: 'documentation' },
  { group: 'appdataint', text: 'ETL (Datastage)', color: '#C6C6C6', textColor: null, header: 'Extract, Transform, Load', desc: 'Extract, Transform, Load (ETL) or IBM DataStage. Extracts raw data transforms its format and loads it into a data warehouse or data lake.', icon: 'virtual--storage' },
  { group: 'appdataint', text: 'Replication (CDC)', color: '#C6C6C6', textColor: null, header: 'Change Data Capture', desc: "Change Data Capture (CDC) — Instead of asking the database for information, CDC silently listens to the database's internal transaction logs. The millisecond a record is updated in the core database, CDC pushes a copy of that change to another system without slowing down the primary database.", icon: 'Movement--of--items' },
  { group: 'appdataint', text: 'Events (Confluent)', color: '#C6C6C6', textColor: null, header: 'Event Streaming', desc: 'Confluent — Event Streaming. Confluent is the enterprise source for Apache Kafka. Unlike MQ, which is a direct point-to-point message, Kafka is a broadcast system. It operates on a publish/subscribe model.', icon: 'confluent' },
  { group: 'appdataint', text: 'Information (zDIH)', color: '#C6C6C6', textColor: null, header: 'zDIH', desc: 'Querying a mainframe database (like DB2) is expensive (banks pay for mainframe computing power, called MIPS). zDIH pulls operational data from the mainframe and caches it in memory. Modern applications can query this cache instantly without hitting the actual mainframe.', icon: 'question' },
  { group: 'appdataint', text: 'REST (Zconnect)', color: '#C6C6C6', textColor: null, header: 'z/OS Connect', desc: 'The ultimate universal translator. z/OS Connect sits in the middle of modern speak like JSON and mainframe applications which speak COBOL or CICS and instantly translates a modern web request into a language the 40-year-old mainframe can process.', icon: 'IBM--Z' },
  { group: 'appdataint', text: 'Visualization (DVM)', color: '#C6C6C6', textColor: null, header: 'Visualization', desc: 'It makes non-relational, highly complex data (like VSAM files or IMS hierarchical databases) look like a standard, modern SQL database to outside developers. It "virtualizes" the data without actually moving or copying it.', icon: 'visibility' },

  // Applications
  { group: 'apps', text: 'Microservices, COTS, etc.', color: '#E3E3E3', textColor: null, header: 'Examples of Microservices and COTS', desc: 'Account Balance Services\nPayment Routing Service\nCustomer Profile Service\nFraud Scoring Engine\nAML & KYC Suites\nCRM\nLOS\nDigital Banking Platforms', icon: 'Concept--insights' },
  { group: 'apps', text: 'JEE (WAS, Jboss, WLS)', color: '#E3E3E3', textColor: null, header: 'Application Servers', desc: 'These are enterprise-grade "application servers". They provide a highly secure, reliable, and strictly managed environment to run massive, complex, and heavy Java applications.', icon: 'internet-of-things--03' },

  // Business Processes
  { group: 'bizproc', text: 'Business Workflows', color: '#E3E3E3', textColor: null, header: 'Workflows', desc: 'Supported by Business Process Management (BPM) software. It orchestrates complex, multi-step processes that span across different departments, systems, and human workers.', icon: 'workflows' },
  { group: 'bizproc', text: 'Process Mining', color: '#E3E3E3', textColor: null, header: 'Process Mining', desc: 'Analytical software (like IBM Process Mining or Celonis) that acts like an X-ray for operations.\n\nExample: Bank executives believe it takes an average of 48 hours to onboard a new corporate client. Process Mining scans the system logs and reveals that 30% of applications are actually taking 5 days because they keep getting kicked back to the customer due to a confusing form field.', icon: 'oil--pump' },
  { group: 'bizproc', text: 'Robotic Process Automation', color: '#E3E3E3', textColor: null, header: 'Bots', desc: 'Software "bots" designed to mimic human actions on a computer screen.', icon: 'robotics' },
  { group: 'bizproc', text: 'Business Rules', color: '#E3E3E3', textColor: null, header: 'Rules', desc: 'BRE or Business Rules Engine extracts the complex "if/then" decision logic out of the main application code so that business users can manage the rules themselves without needing software developers to write new code.', icon: 'Incident-reporter' },
  { group: 'bizproc', text: 'Content Management', color: '#E3E3E3', textColor: null, header: 'ECM', desc: 'ECM or Enterprise Content Management systems — This system securely stores, organizes, and retrieves unstructured data (PDFs, scanned images, and emails), linking them to the correct customer profiles and ensuring they meet strict legal retention policies.', icon: 'App--developer' },

  // Experience APIs
  { group: 'expapis', text: 'API Gateway', color: '#E3E3E3', textColor: null, header: 'API Gateway', desc: "The Traffic Cop. When your phone tries to communicate with the bank, it doesn't talk directly to a database or even a microservice. It hits the API Gateway first. The Gateway checks your digital ID (security tokens), makes sure you aren't trying to send a million requests a second to crash the system (rate limiting), and then routes your request to the correct internal microservice.", icon: 'Data--APIs ' },
  { group: 'expapis', text: 'Developer Portal', color: '#E3E3E3', textColor: null, header: 'Developer Portal', desc: "APIs are useless if developers don't know how to use them. The Developer Portal is a secure website where software engineers can browse a catalog of available APIs, read the documentation, and request digital keys to start building apps with them.", icon: 'Lift-and-shift' },
  { group: 'expapis', text: 'Control Panel', color: '#E3E3E3', textColor: null, header: 'Control Panel', desc: "The dashboard for the bank's API administrators. This is the administrative interface used to manage the entire API ecosystem. It provides analytics, usage metrics, and control over who has access to what.", icon: 'Control-panel' },
  { group: 'expapis', text: 'Hybrid IpaaS', color: '#E3E3E3', textColor: null, header: 'Hybrid IpaaS', desc: 'Hybrid Integration Platform as a Service (Hybrid IPaaS). A cloud-based toolset that makes it incredibly fast and easy to string together workflows and move data between different environments (On-Prem, Cloud apps, etc.) without writing heavy custom code.', icon: 'Hybrid--cloud--services' },

  // Channels
  { group: 'channels', text: 'Partners & Ecosystems', color: '#C8DBF9', textColor: '#161616', header: 'Partners & Ecosystems', desc: 'External third-party applications and businesses that connect directly to the bank.', icon: 'Connected--ecosystem' },
  { group: 'channels', text: 'Web', color: '#C8DBF9', textColor: '#161616', header: 'Web', desc: 'Traditional desktop and laptop internet browsers.', icon: 'websites' },
  { group: 'channels', text: 'Mobile', color: '#C8DBF9', textColor: '#161616', header: 'Mobile', desc: 'The banking apps installed on smartphones and tablets.', icon: 'Mobile--chat' },
  { group: 'channels', text: 'Chatbots', color: '#C8DBF9', textColor: '#161616', header: 'Chatbots', desc: 'Automated conversational assistants.', icon: 'Conversation' },
  { group: 'channels', text: 'Other Invisible Channels…', color: '#C8DBF9', textColor: '#161616', header: 'Other', desc: "Interfaces that don't have a traditional screen, or background machine-to-machine connections.", icon: 'Player--flow' },

  // Developer Productivity
  { group: 'devprod', text: 'Java Modernization', color: '#A7C8F8', textColor: '#161616', header: 'Java Modernization', desc: 'Specialized software tools and frameworks designed to automatically analyze millions of lines of old Java code, map out the dependencies, and help developers rewrite it for the modern cloud.', icon: 'Javascript' },
  { group: 'devprod', text: 'Agentic AI Development', color: '#A7C8F8', textColor: '#161616', header: 'Agentic AI', desc: 'AI is given a goal and the permission to string together multiple steps to achieve it—frameworks for autonomous systems.', icon: 'Machine--learning--04' },
  { group: 'devprod', text: 'DevSecOps', color: '#A7C8F8', textColor: '#161616', header: 'Development, Security, and Ops', desc: 'Development, Security, and Operations (DevSecOps) — integrates the code writing, security checking and install into an automated pipeline.', icon: 'waymo-car' },
  { group: 'devprod', text: 'Enterprise Applications', color: '#A7C8F8', textColor: '#161616', header: 'Enterprise Apps', desc: 'The internal software suite used to run the IT department itself.', icon: 'Enterprise--design--thinking--02' },
  { group: 'devprod', text: 'Task Completion', color: '#A7C8F8', textColor: '#161616', header: 'Task Completion', desc: 'AI coding assistants and automation scripts.', icon: 'Prepare' },
];

// Data section items (Sub Box Special — entire div is trigger, Popover No Tip)
export const DATA_ITEMS = [
  { text: 'SQL', color: '#A2A8B0', desc: 'These are traditional, relational databases used specifically for analytical reporting. They store highly structured data in neat rows and columns.' },
  { text: 'NoSQL', color: '#A2A8B0', desc: 'Non-relational databases. NoSQL handles flexible, messy data (unstructured data or JSON files) much better and faster than strict SQL tables.' },
  { text: 'Vector', color: '#A2A8B0', desc: 'Vector databases store data as mathematical coordinates in high-dimensional space. This is the technology that allows LLMs to "understand" internal documents, policies, and customer histories.' },
  { text: 'Lakehouse', color: '#A2A8B0', desc: 'The modern evolution of big data storage—the inexpensive scalability of a lake combined with the fast, reliable querying of a warehouse.', icon: 'Data--storage' },
  { text: 'Hadoop', color: '#A2A8B0', desc: 'The framework that enables storage of massive historical data—petabyte-scale datasets across many servers.', icon: 'Flow--chart' },
  { text: 'Streaming', color: '#A2A8B0', desc: 'Technologies that process data in real-time as it flows.' },
  { text: 'Integration', color: '#A2A8B0', desc: 'This represents the specific tools (like ETL pipelines) dedicated to scraping data out of the Core Applications and transforming it into a format that the Lakehouse and Vector databases can actually use.' },
  { text: 'Security', color: '#A2A8B0', desc: 'This pillar ensures that data at rest (sitting in the Lakehouse) and data in motion (streaming through the pipelines) is heavily encrypted, masked, and tokenized so that even if a breach occurs, the raw data is completely unreadable to attackers.' },
  { text: 'Catalog & Governance', color: '#A2A8B0', desc: 'The Catalog is the master library index—it tells data scientists exactly what data exists and where to find it. Governance is the strict rulebook enforcing privacy laws (like GDPR or CCPA), dictating exactly who is allowed to see personally identifiable information (PII).' },
  { text: 'Observability', color: '#A2A8B0', desc: "Observability tools monitor the pipeline to ensure the data actually arrived, wasn't corrupted in transit, and didn't suddenly double in size due to a glitch." },
  { text: 'Lineage', color: '#A2A8B0', desc: 'Lineage visually maps exactly where a data point originated, how it was transformed, and every system it touched before arriving at the final answer.' },
];

// Foundation section items (Sub Box Special — Popover No Tip, 5-column grid content)
export const FOUNDATION_ITEMS = [
  {
    text: 'Gen AI — Agentic AI, Agents, MCP, A2A, Orchestration, Governance, LLMs, Inferencing Stack, Lifecycle Management…',
    color: '#121619',
    textColor: '#ffffff',
    desc1: 'Accelerating AI impact requires trusted data, scalable infrastructure, and strong governance. An end‑to‑end AI platform enables clients to move from experimentation to production with confidence.',
    desc2: 'Accelerate Business Impact of AI\n• WatsonX.AI\n• WatsonX.Governance\n• WatsonX.Orchestrate\n• WatsonX Assistants\n• Code Assistants\n• IBM Bob',
    desc3: 'AI Inferencing Stack\n• WatsonX.AI (running RHEL AI and OCP AI)\n• Spyre (IBM Z and IBM P)',
    desc4: null,
    desc5: null,
  },
  {
    text: 'Platform as a Service',
    color: '#121619',
    textColor: '#ffffff',
    desc1: 'Portable workloads give financial institutions the flexibility to modernize applications without rewriting them. A consistent hybrid platform enables faster innovation while meeting regulatory, latency, and resiliency requirements.',
    desc2: 'Enable Portable Workloads\n• Red Hat OpenShift\n• Red Hat OpenShift Virtualization\n• Red Hat Ansible\n• Red Hat Enterprise Linux',
    desc3: null,
    desc4: null,
    desc5: null,
  },
  {
    text: 'Infrastructure — IBM Z/Linux One, Power, Storage, IBM Cloud, AWS, Google Cloud, Azure',
    color: '#121619',
    textColor: '#ffffff',
    desc1: 'Modern infrastructure provides a resilient, scalable foundation for core, cloud, and AI workloads. By modernizing compute and storage incrementally, clients reduce cost while improving performance and availability.',
    desc2: 'AI Ready Enterprise Storage (Software Defined)\n• Ceph\n• Scale\n• Fusion\n• Content Aware Storage (CAS)',
    desc3: 'Automate Infrastructure Delivery\n• Terraform\n• Ansible\n• Vault',
    desc4: 'Digital Assets & Tokenization\n• IBM Digital Asset Haven\n\nEnterprise Linux Platform\n• IBM LinuxOne',
    desc5: 'Hyper Converged Platform for AI Workloads\n• IBM Fusion HCI\n\nCloud Enable Power\n• IBM Power VS',
  },
];
