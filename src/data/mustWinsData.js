// Source: 2026 FSM Must Wins.docx
// Details are auto-populated in the submission form when a Must Win is selected.

export const MUST_WINS = [
  // ── Automation ────────────────────────────────────────────────────────────
  {
    category: 'Automation',
    name: 'Automate and Optimize Technology Investment and Operations',
    details: 'Overview: Align resource needs with business value\n\nBusiness Value:\n• Provide real-time, actionable cost and performance insights to make data-driven decisions\n• Increase cloud cost visibility and proactively optimize costs\n• Achieve increased productivity and cost-effective asset operations\n\nUse Cases:\n• Hybrid IT Financial Management\n• Maximize the value of cloud investments\n• Asset Lifecycle Management\n\nLead Products: Apptio, Cloudability, Turbonomic',
  },
  {
    category: 'Automation',
    name: 'Automate Application Resiliency',
    details: 'Overview: Minimize disruptions, maximize availability and enhance application performance\n\nBusiness Value:\n• Avoid costly outages\n• Increase operational efficiency\n• Enhance customer experience\n\nUse Cases:\n• Gain full-stack enterprise observability\n• Simplify and optimize application performance\n• Improve application resilience and action at scale\n\nLead Products: Turbonomic, Instana, Concert, SevOne, Ansible, WCA for Ansible',
  },
  {
    category: 'Automation',
    name: 'Integrate Applications',
    details: 'Overview: Integrate data, applications, and processes across the hybrid cloud\n\nBusiness Value:\n• Optimize IT with flexible integration to any system\n• Empower business technologists to quickly compose applications\n• Securely enable innovation by governing integration access to critical systems\n\nUse Cases:\n• Centrally manage distributed integrations and drive AI productivity\n• Modernize your integration and application landscape to ensure compliance and security\n\nLead Products: IBM webMethods Hybrid Integration, API Connect, Event Automation',
  },
  {
    category: 'Automation',
    name: 'Automate Infrastructure Delivery',
    details: 'Overview: Optimize and secure IT operations and the application pipeline\n\nBusiness Value:\n• Eliminate silos between development, infrastructure and security\n• Reduce deployment times – from weeks to minutes\n• Implement Zero Trust security across operations\n\nUse Cases:\n• Automate infrastructure lifecycle management\n• Protect access for both human and non-human identities\n\nLead Products: Terraform, Red Hat Ansible Automation Platform, Verify, Vault',
  },

  // ── Data ──────────────────────────────────────────────────────────────────
  {
    category: 'Data',
    name: 'Secure Data',
    details: 'Overview: Protect your data from risks, including AI and cryptographic attacks, through a unified experience\n\nBusiness Value:\n• Manage the full data security lifecycle, powered by AI, for all data types, across all data environments\n• Empower data & security teams to collaborate cross-functionally, through integrated use cases\n\nUse Cases:\n• Secure your data wherever it resides\n• Simplify data compliance\n• Secure AI deployments\n• Data Recovery\n\nLead Products: Guardium Data Protection, Guardium AI Security, Quantum Safe Explorer, Quantum Safe Remediator, Guardium Quantum Safe',
  },
  {
    category: 'Data',
    name: 'Manage Data',
    details: 'Overview: Empower businesses to access, integrate, and leverage all data seamlessly, transforming it into actionable insights\n\nBusiness Value:\n• Enable real time data driven insights\n• Streamline operations with unified data access\n• Drive growth through agile data integration\n\nUse Cases:\n• Deliver Powerful Data At Scale With Data Integration\n• Unlock actionable Data with Data Intelligence\n• Unify Data Anywhere With Lakehouse\n\nLead Products: watsonx.data, watsonx.data intelligence, watsonx.data integration, Confluent (Kafka), unstructured.io',
  },
  {
    category: 'Data',
    name: 'Accelerate the Business Impact of AI',
    details: 'Overview: Propelling the next wave of AI productivity\n\nBusiness Value:\n• Bridge the skills gaps\n• Reduce costs\n• Improve employee and customer experiences\n• Developer productivity\n\nUse Cases:\n• Scale Enterprise Productivity with AI\n• Build, Run, and Manage Trusted AI\n• Infuse AI in SDLC\n\nLead Products: watsonx.ai, watsonx.governance, watsonx Assistants, watsonx Orchestrate, Planning Analytics, Code Assistants, IBM Bob',
  },
  {
    category: 'Data',
    name: 'AI Inferencing Stack',
    details: 'Overview: An end-to-end hybrid AI inferencing architecture that spans infrastructure, platform, and runtime to support enterprise AI at scale\n\nBusiness Value:\n• Delivers a cost-efficient inferencing stack optimized for performance and scale\n• Enables flexible deployment across on-premises, cloud, and hybrid environments to meet regulatory, latency, and data residency requirements\n\nUse Cases:\n• Scaling enterprise AI workloads reliably across business units\n• Grounding AI models with enterprise data to drive more accurate and trusted outcomes\n\nLead Products: watsonx.ai running (RHEL AI & OCP AI), Spyre (IBM Z and IBM P)',
  },
  {
    category: 'Data',
    name: 'AI Ready Enterprise Storage Platform',
    details: 'Overview: A unified enterprise storage platform that supports AI, analytics, and cloud-native workloads across hybrid environments\n\nBusiness Value:\n• Delivers a cost-efficient and scalable storage foundation for AI and cloud-native workloads\n• Consolidates block, file, and object storage into a single platform reducing operational complexity\n• Accelerates AI outcomes by bringing data closer to compute and enabling real-time data understanding\n• Reduces GPU and infrastructure costs through intelligent data processing and continuous vectorization\n• Supports hybrid deployment models to meet security, latency, and regulatory requirements\n\nUse Cases:\n• Unified storage for OpenShift, Kubernetes, virtual machines, and AI workloads\n• Enterprise scale management of unstructured data for AI, RAG, and agentic workflows\n• High performance data access for AI training, inferencing, and analytics\n• Data caching, movement, and lifecycle management across hybrid cloud environments\n• Real-time extraction and vectorization of enterprise data to eliminate silos and improve AI accuracy\n\nLead Products: Fusion, Ceph, Scale, Content Aware Storage (CAS)',
  },

  // ── Hybrid Cloud ──────────────────────────────────────────────────────────
  {
    category: 'Hybrid Cloud',
    name: 'Enable Portable Workloads',
    details: 'Overview: Accelerate application deployments across any cloud or edge environment, in a consistent, secure and cost-effective way\n\nBusiness Value:\n• Simplify deployment & adoption of innovation of existing IT investments\n• Reduce operational costs & improve IT efficiencies across all applications\n• Increase business resiliency to meet availability and regulatory needs\n\nUse Cases:\n• Migrate and modernize from VMware virtualization\n• Deploy applications anywhere in a hybrid cloud environment\n• Accelerate gen AI adoption across the Enterprise\n\nLead Products: Red Hat OpenShift, Red Hat Enterprise Linux, Red Hat Ansible, Red Hat OpenShift Virtualization',
  },

  // ── Mainframe Modernization ───────────────────────────────────────────────
  {
    category: 'Mainframe Modernization',
    name: 'Mainframe Modernization',
    details: 'Overview: Modernize critical mainframe workloads from batch-bound, table-level CDC to real-time event streaming\n\nBusiness Value:\n• Eliminate MIPS general processor tax via ~97% zIIP offload through IBM zDIH\n• Deliver atomic unit-of-work streaming from DB2 + VSAM to Confluent Platform\n• Power sub-second trading inquiry APIs with SingleStore read cache\n• Establish a governed open lakehouse on watsonx.data (Apache Iceberg v3)\n• Enable zero-copy Snowflake analytics via Apache Polaris / Horizon integration\n\nUse Cases:\n• Real-time brokerage event streaming with CQRS isolation\n• Single governed analytic copy via right-sized IIDR CDC\n• Zero-copy open table access for downstream consumers\n\nLead Products: IBM zDIH, Confluent Platform, IBM IIDR, watsonx.data, SingleStore, Snowflake',
  },

  // ── Transaction Processing ────────────────────────────────────────────────
  {
    category: 'Transaction Processing',
    name: 'Automate Mainframe Development',
    details: 'Overview: Automating mainframe development ensures improved efficiency, higher code quality and faster time to market while reducing risk and IT costs\n\nBusiness Value:\n• Decrease technical debt, complexity and cost\n• Increase business efficiency and agility\n• Increase developer productivity\n• Accelerate time to market\n\nUse Cases:\n• AI-assisted mainframe application modernization\n• Automate Continuous Integration and Continuous Deployment (CI/CD)\n• Automate testing practices across the software development life cycle (SDLC)\n\nLead Products: Z Application Development Tools (includes watsonx code assistant for Z)',
  },
  {
    category: 'Transaction Processing',
    name: 'Simplify Mainframe Operations',
    details: 'Overview: Ease mainframe management with visualization, observability and expert assistance\n\nBusiness Value:\n• Elevate mainframe performance analysis with next-level intelligence\n• Ease systems management functions\n• Decrease costly downtime with early warning\n• Improve team collaboration and speed time to resolve service delivery problems\n• Reduce annual operational costs and improve operations\n\nUse Cases:\n• Leverage enterprise-wide observability, leveraging OpenTelemetry detection and resolution\n• Maximize application and infrastructure availability through AI-assisted performance optimization\n• Utilize AI assistant to boost productivity across operations and reduce incident resolution time\n\nLead Products: Z Observability and Automation (including Instana and OMEGAMON), IntelliMagic, watsonx Assistant for Z, HashiCorp (Terraform, Vault, Nomad), Concert for Z, Machine Learning for Z, zAI Optimizer',
  },
];

export const MUST_WIN_CATEGORIES = [...new Set(MUST_WINS.map((m) => m.category))];

// Maps each Must Win category to its closest architecture column line color.
// bg = light tint for header background (dark text); bgDark = dark-mode equivalent.
// CSS class per category — light/dark handled entirely in UseCases.css
export const CATEGORY_COLOR_CLASS = {
  'Automation':              'uc-header--automation',
  'Data':                    'uc-header--data',
  'Hybrid Cloud':            'uc-header--hybrid',
  'Transaction Processing':  'uc-header--transaction',
  'Mainframe Modernization': 'uc-header--mainframe',
};

export function getMustWinByName(name) {
  return MUST_WINS.find((m) => m.name === name) ?? null;
}
