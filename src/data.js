// SkillFlix Data Store & LocalStorage Persistence Engine

const STORAGE_KEYS = {
  COURSES: 'skillflix_courses_v1',
  USER: 'skillflix_user_v1',
  TRANSACTIONS: 'skillflix_transactions_v1',
  STUDENTS: 'skillflix_students_v1',
  SETTINGS: 'skillflix_settings_v1',
};

// Initial High-End Demo Courses Data
const DEFAULT_COURSES = [
  {
    id: 'course-1',
    title: 'Full-Stack Next.js 15 & AI SaaS Architecture Masterclass',
    tagline: 'Production-ready full-stack applications with Next.js 15, React Server Components, Stripe, and Claude/OpenAI integration.',
    category: 'Web & AI Engineering',
    categorySlug: 'web-ai',
    instructor: {
      name: 'Sarah Jenkins',
      role: 'Ex-Google Staff Engineer & SaaS Founder',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
      bio: 'Built multi-million dollar SaaS platforms. Consulted for top Silicon Valley startups on modern web architecture.'
    },
    thumbnail: '/hero-banner.jpg',
    trailerVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    rating: 4.95,
    reviewsCount: 1420,
    studentsCount: 3840,
    level: 'Intermediate to Advanced',
    duration: '22h 45m',
    lessonsCount: 48,
    pdfCount: 8,
    price: 2499,
    originalPrice: 8999,
    badge: 'Bestseller',
    featured: true,
    published: true,
    createdAt: '2026-02-15',
    modules: [
      {
        id: 'mod-1',
        title: 'Module 1: Next.js 15 App Router & Server Actions Deep Dive',
        lessons: [
          {
            id: 'les-1-1',
            title: '01. Architecture Overview & High-Concurrency Patterns',
            duration: '24:10',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            freePreview: true,
            summary: 'Understanding Server Components vs Client Components, parallel routing, and zero-bundle-size logic.'
          },
          {
            id: 'les-1-2',
            title: '02. Server Actions, Optimistic UI & Cache Revalidation',
            duration: '31:45',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            freePreview: false,
            summary: 'Deep dive into mutate functions, stale-while-revalidate tags, and zero-waterfall data fetching.'
          },
          {
            id: 'les-1-3',
            title: '03. Streaming SSR & Suspense Boundaries Under Load',
            duration: '28:15',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
            freePreview: false,
            summary: 'Building silky smooth skeletal loaders and concurrent stream chunking.'
          }
        ]
      },
      {
        id: 'mod-2',
        title: 'Module 2: AI SDK, Streaming LLM Responses & Vector Embeddings',
        lessons: [
          {
            id: 'les-2-1',
            title: '04. Vercel AI SDK Integration & Token Streaming',
            duration: '35:20',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
            freePreview: false,
            summary: 'Connecting Anthropic Claude 3.7 & OpenAI GPT-4o with real-time UI token streams.'
          },
          {
            id: 'les-2-2',
            title: '05. Pinecone Vector Databases & Semantic Search RAG',
            duration: '42:10',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
            freePreview: false,
            summary: 'Building high accuracy retrieval-augmented generation pipelines for multi-tenant documents.'
          }
        ]
      },
      {
        id: 'mod-3',
        title: 'Module 3: Monetization, Razorpay & Stripe Webhooks at Scale',
        lessons: [
          {
            id: 'les-3-1',
            title: '06. Multi-Tier Subscriptions & Usage-Based Billing',
            duration: '38:50',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
            freePreview: false,
            summary: 'Designing bulletproof webhook reconciliation, idempotent ledger entries, and automated invoice delivery.'
          }
        ]
      }
    ],
    resources: [
      {
        id: 'res-1',
        title: 'Next.js 15 Full-Stack Enterprise Architecture Blueprint',
        type: 'PDF Guide',
        size: '14.2 MB',
        pages: 36,
        downloadUrl: '#',
        description: 'Comprehensive architectural diagrams, schema designs, and folder structures.'
      },
      {
        id: 'res-2',
        title: 'Complete SaaS Production Boilerplate & Code Cheatsheet',
        type: 'ZIP / Code',
        size: '48.5 MB',
        pages: 18,
        downloadUrl: '#',
        description: 'Ready-to-deploy GitHub repository template with Auth, Stripe, Tailwind, and Prisma ORM.'
      },
      {
        id: 'res-3',
        title: 'AI Prompt Engineering & High-Throughput RAG Reference',
        type: 'PDF Notes',
        size: '8.4 MB',
        pages: 22,
        downloadUrl: '#',
        description: 'Top-performing system prompts, chunking strategies, and caching configs.'
      }
    ],
    quiz: [
      {
        question: 'Which Next.js feature allows running code exclusively on the server with automatic client serialization?',
        options: ['React Server Components', 'Client Boundaries', 'getInitialProps', 'CSS Modules'],
        correctIndex: 0
      },
      {
        question: 'What is the primary benefit of Server Actions in Next.js?',
        options: ['Simpler state management without writing explicit REST API boilerplate', 'Faster font rendering', 'Direct GPU rendering', 'Compiling to WebAssembly'],
        correctIndex: 0
      }
    ]
  },
  {
    id: 'course-2',
    title: 'Mastering High-Scale System Design & Microservices Architecture',
    tagline: 'Designing systems for 100M+ DAU: Distributed caching, Kafka event streaming, database sharding, and resilience patterns.',
    category: 'System Design',
    categorySlug: 'system-design',
    instructor: {
      name: 'Alex Rivera',
      role: 'Principal Distributed Systems Architect',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
      bio: 'Former Meta infrastructure lead, author of Distributed Systems at Scale, consultant for tier-1 fintech firms.'
    },
    thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=900&q=80',
    trailerVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    rating: 4.98,
    reviewsCount: 980,
    studentsCount: 2950,
    level: 'Advanced',
    duration: '28h 15m',
    lessonsCount: 52,
    pdfCount: 12,
    price: 2999,
    originalPrice: 9999,
    badge: 'Staff Pick',
    featured: true,
    published: true,
    createdAt: '2026-01-20',
    modules: [
      {
        id: 'mod-2-1',
        title: 'Module 1: Foundations of Planetary-Scale Systems',
        lessons: [
          {
            id: 'les-2-1-1',
            title: '01. CAP Theorem, PACELC & Consistency Models',
            duration: '29:40',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
            freePreview: true,
            summary: 'Eventual consistency vs strong linearizability in distributed databases.'
          },
          {
            id: 'les-2-1-2',
            title: '02. Consistent Hashing & Distributed Ring Topologies',
            duration: '34:15',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
            freePreview: false,
            summary: 'How DynamoDB, Cassandra, and Memcached balance data with zero master bottleneck.'
          }
        ]
      },
      {
        id: 'mod-2-2',
        title: 'Module 2: Event-Driven Systems & Apache Kafka Streaming',
        lessons: [
          {
            id: 'les-2-2-1',
            title: '03. Event Sourcing, CQRS & Message Idempotency',
            duration: '45:00',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            freePreview: false,
            summary: 'Handling out-of-order events, dead-letter queues, and exactly-once processing guarantees.'
          }
        ]
      }
    ],
    resources: [
      {
        id: 'res-4',
        title: 'The Ultimate System Design Interview Handbook (2026 Edition)',
        type: 'PDF Guide',
        size: '28.6 MB',
        pages: 120,
        downloadUrl: '#',
        description: 'Complete breakdowns of Netflix, Uber, WhatsApp, and Google Drive system designs.'
      },
      {
        id: 'res-5',
        title: 'Distributed Caching Strategies & Redis Cluster Topology Guide',
        type: 'PDF Notes',
        size: '12.1 MB',
        pages: 34,
        downloadUrl: '#',
        description: 'Cache-aside, write-through, write-behind, and cache avalanche mitigations.'
      }
    ],
    quiz: [
      {
        question: 'Which theorem states that a distributed system cannot simultaneously provide Consistency, Availability, and Partition Tolerance?',
        options: ['CAP Theorem', 'Amdahl Law', 'Little Law', 'Moore Law'],
        correctIndex: 0
      }
    ]
  },
  {
    id: 'course-3',
    title: 'Autonomous AI Agents, LangGraph & Multi-Agent Swarms',
    tagline: 'Build autonomous agents that write code, browse the web, analyze data, and run 24/7 self-healing business workflows.',
    category: 'Web & AI Engineering',
    categorySlug: 'web-ai',
    instructor: {
      name: 'Dr. Dev Sharma',
      role: 'Principal AI Researcher & Founder',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
      bio: 'Published author in NeurIPS & ICLR. Pioneer in hierarchical multi-agent cognitive architectures.'
    },
    thumbnail: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=900&q=80',
    trailerVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    rating: 4.96,
    reviewsCount: 740,
    studentsCount: 2180,
    level: 'Intermediate to Advanced',
    duration: '19h 30m',
    lessonsCount: 38,
    pdfCount: 7,
    price: 3499,
    originalPrice: 11999,
    badge: 'Trending',
    featured: true,
    published: true,
    createdAt: '2026-03-01',
    modules: [
      {
        id: 'mod-3-1',
        title: 'Module 1: Cognitive Architectures & ReAct Loops',
        lessons: [
          {
            id: 'les-3-1-1',
            title: '01. Anatomy of an Agent: Memory, Tools & State Machines',
            duration: '26:10',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            freePreview: true,
            summary: 'Understanding reasoning traces, tool calling schemas, and long-term memory retrieval.'
          },
          {
            id: 'les-3-1-2',
            title: '02. LangGraph State Graphs & Human-in-the-Loop Approval',
            duration: '38:40',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
            freePreview: false,
            summary: 'Designing cyclical workflows with checkpointing and state persistence.'
          }
        ]
      }
    ],
    resources: [
      {
        id: 'res-6',
        title: 'Multi-Agent Swarm Orchestration Blueprint & Code',
        type: 'PDF Guide',
        size: '16.5 MB',
        pages: 45,
        downloadUrl: '#',
        description: 'Complete Python & TypeScript implementations for supervisor-worker agent networks.'
      }
    ],
    quiz: [
      {
        question: 'What pattern combines Reasoning and Action execution in language model agents?',
        options: ['ReAct Pattern', 'MapReduce Pattern', 'MVC Pattern', 'Observer Pattern'],
        correctIndex: 0
      }
    ]
  },
  {
    id: 'course-4',
    title: 'UI/UX Design Mastery: Figma, Design Systems & High-Converting Prototyping',
    tagline: 'Design world-class web and mobile interfaces with auto-layout, design tokens, micro-interactions, and developer handoff.',
    category: 'UI/UX & Product',
    categorySlug: 'ui-ux',
    instructor: {
      name: 'Elena Rostova',
      role: 'Head of Product Design, Studio Forma',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&q=80',
      bio: 'Award-winning product designer behind top consumer apps downloaded by over 50M users worldwide.'
    },
    thumbnail: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=900&q=80',
    trailerVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    rating: 4.88,
    reviewsCount: 2120,
    studentsCount: 5410,
    level: 'Beginner to Advanced',
    duration: '16h 20m',
    lessonsCount: 36,
    pdfCount: 14,
    price: 1999,
    originalPrice: 6999,
    badge: 'Popular',
    featured: false,
    published: true,
    createdAt: '2026-01-10',
    modules: [
      {
        id: 'mod-4-1',
        title: 'Module 1: Figma Power User Workflows & Components',
        lessons: [
          {
            id: 'les-4-1-1',
            title: '01. Auto-Layout 5.0, Min/Max Constraints & Fluid Grids',
            duration: '22:15',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
            freePreview: true,
            summary: 'Responsive design without breaking layouts across desktop, tablet, and mobile screens.'
          }
        ]
      }
    ],
    resources: [
      {
        id: 'res-7',
        title: 'Premium Figma UI Kit & Design System Tokens (Community Edition)',
        type: 'Figma File + PDF',
        size: '52.0 MB',
        pages: 60,
        downloadUrl: '#',
        description: 'Over 2,400+ accessible components, color palettes, dark mode tokens, and icon packs.'
      }
    ],
    quiz: [
      {
        question: 'Which Figma feature enables elements to automatically adapt padding and spacing when content changes?',
        options: ['Auto Layout', 'Boolean Groups', 'Smart Animate', 'Component Variations'],
        correctIndex: 0
      }
    ]
  },
  {
    id: 'course-5',
    title: 'Cloud DevOps, Kubernetes & Infrastructure as Code (AWS & Terraform)',
    tagline: 'Zero-downtime deployments, GitOps with ArgoCD, Terraform multi-environment provisioning, and observability with Prometheus.',
    category: 'Cloud & DevOps',
    categorySlug: 'cloud-devops',
    instructor: {
      name: 'Marcus Vance',
      role: 'Principal Site Reliability Engineer',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=160&q=80',
      bio: 'Architected cloud environments managing over 15,000 Kubernetes pods with 99.999% uptime.'
    },
    thumbnail: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=900&q=80',
    trailerVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    rating: 4.92,
    reviewsCount: 890,
    studentsCount: 2340,
    level: 'Intermediate to Advanced',
    duration: '24h 00m',
    lessonsCount: 44,
    pdfCount: 9,
    price: 2699,
    originalPrice: 8499,
    badge: 'Pro Choice',
    featured: false,
    published: true,
    createdAt: '2026-02-01',
    modules: [
      {
        id: 'mod-5-1',
        title: 'Module 1: Production Kubernetes Clusters from Scratch',
        lessons: [
          {
            id: 'les-5-1-1',
            title: '01. Pod Lifecycle, Ingress Controllers & Network Policies',
            duration: '32:10',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
            freePreview: true,
            summary: 'Hardening Kubernetes clusters, zero-trust pod communication, and ingress routing.'
          }
        ]
      }
    ],
    resources: [
      {
        id: 'res-8',
        title: 'Kubernetes Production Hardening & YAML Cheat Sheet',
        type: 'PDF Guide',
        size: '18.4 MB',
        pages: 42,
        downloadUrl: '#',
        description: 'Ready-to-use manifests for ingress-nginx, cert-manager, sealed secrets, and resource limits.'
      }
    ],
    quiz: [
      {
        question: 'Which tool is used for declarative Infrastructure as Code across multi-cloud providers?',
        options: ['Terraform', 'Docker Compose', 'Webpack', 'Postman'],
        correctIndex: 0
      }
    ]
  },
  {
    id: 'course-6',
    title: 'Algorithmic Trading & Quantitative Financial Modeling with Python',
    tagline: 'Statistical arbitrage, backtesting with VectorBT, momentum alpha strategies, risk parity portfolios, and automated broker execution.',
    category: 'Finance & Quant',
    categorySlug: 'finance',
    instructor: {
      name: 'Kabir Mehta',
      role: 'Ex-Hedge Fund Quant Strategist',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=160&q=80',
      bio: '12+ years deploying automated trading strategies across NSE, NYSE, and crypto derivatives markets.'
    },
    thumbnail: 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=900&q=80',
    trailerVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    rating: 4.97,
    reviewsCount: 620,
    studentsCount: 1780,
    level: 'Advanced',
    duration: '21h 10m',
    lessonsCount: 34,
    pdfCount: 15,
    price: 3999,
    originalPrice: 14999,
    badge: 'Exclusive',
    featured: false,
    published: true,
    createdAt: '2026-03-05',
    modules: [
      {
        id: 'mod-6-1',
        title: 'Module 1: Alpha Generation & Quantitative Signals',
        lessons: [
          {
            id: 'les-6-1-1',
            title: '01. Statistical Arbitrage, Cointegration & Mean Reversion',
            duration: '35:45',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
            freePreview: true,
            summary: 'Formulating pairs trading strategies, ADF test verification, and rolling z-scores.'
          }
        ]
      }
    ],
    resources: [
      {
        id: 'res-9',
        title: 'Quantitative Finance & Backtesting Python Formula Compendium',
        type: 'PDF + Jupyter Notebooks',
        size: '34.2 MB',
        pages: 85,
        downloadUrl: '#',
        description: 'Complete formulas for Sharpe ratio, Sortino, Maximum Drawdown, and Monte Carlo simulations.'
      }
    ],
    quiz: [
      {
        question: 'Which metric measures the excess return per unit of downside risk in trading portfolios?',
        options: ['Sortino Ratio', 'Sharpe Ratio', 'Beta', 'R-Squared'],
        correctIndex: 0
      }
    ]
  }
];

// Initial Transactions Ledger
const DEFAULT_TRANSACTIONS = [
  {
    id: 'TXN-98241',
    orderId: 'order_NY81x920aL',
    studentName: 'Rahul Verma',
    studentEmail: 'rahul.verma@example.com',
    courseId: 'course-1',
    courseTitle: 'Full-Stack Next.js 15 & AI SaaS Architecture Masterclass',
    amount: 2499,
    gateway: 'Razorpay UPI (GPay)',
    status: 'Success',
    date: '2026-10-25 09:14 AM'
  },
  {
    id: 'TXN-98240',
    orderId: 'order_LP10z741bK',
    studentName: 'Priya Sharma',
    studentEmail: 'priya.s@techcorp.in',
    courseId: 'course-2',
    courseTitle: 'Mastering High-Scale System Design & Microservices Architecture',
    amount: 2999,
    gateway: 'PhonePe UPI',
    status: 'Success',
    date: '2026-10-25 08:32 AM'
  },
  {
    id: 'TXN-98239',
    orderId: 'order_KD44w552cM',
    studentName: 'Aman Patel',
    studentEmail: 'aman.patel@startup.io',
    courseId: 'course-3',
    courseTitle: 'Autonomous AI Agents, LangGraph & Multi-Agent Swarms',
    amount: 3499,
    gateway: 'Credit Card (HDFC Visa)',
    status: 'Success',
    date: '2026-10-24 11:45 PM'
  },
  {
    id: 'TXN-98238',
    orderId: 'order_QW99x112dN',
    studentName: 'Sneha Kulkarni',
    studentEmail: 'sneha.ux@designcraft.co',
    courseId: 'course-4',
    courseTitle: 'UI/UX Design Mastery: Figma & High-Converting Prototyping',
    amount: 1999,
    gateway: 'Paytm UPI',
    status: 'Success',
    date: '2026-10-24 07:18 PM'
  },
  {
    id: 'TXN-98237',
    orderId: 'order_MN33r881eP',
    studentName: 'Vikram Singhania',
    studentEmail: 'vikram.s@quantdesk.com',
    courseId: 'course-6',
    courseTitle: 'Algorithmic Trading & Quantitative Financial Modeling',
    amount: 3999,
    gateway: 'Net Banking (ICICI)',
    status: 'Success',
    date: '2026-10-24 03:05 PM'
  }
];

// Initial Registered Students List
const DEFAULT_STUDENTS = [
  {
    id: 'stu-1',
    name: 'Rahul Verma',
    email: 'rahul.verma@example.com',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    enrolledCourses: ['course-1', 'course-2'],
    totalSpent: 5498,
    joinedDate: '2026-09-12',
    status: 'Active',
    lastActive: '12 mins ago'
  },
  {
    id: 'stu-2',
    name: 'Priya Sharma',
    email: 'priya.s@techcorp.in',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    enrolledCourses: ['course-2'],
    totalSpent: 2999,
    joinedDate: '2026-10-01',
    status: 'Active',
    lastActive: '45 mins ago'
  },
  {
    id: 'stu-3',
    name: 'Aman Patel',
    email: 'aman.patel@startup.io',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80',
    enrolledCourses: ['course-3'],
    totalSpent: 3499,
    joinedDate: '2026-08-19',
    status: 'Active',
    lastActive: '2 hours ago'
  },
  {
    id: 'stu-4',
    name: 'Sneha Kulkarni',
    email: 'sneha.ux@designcraft.co',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80',
    enrolledCourses: ['course-4'],
    totalSpent: 1999,
    joinedDate: '2026-07-25',
    status: 'Active',
    lastActive: '1 day ago'
  },
  {
    id: 'stu-5',
    name: 'Vikram Singhania',
    email: 'vikram.s@quantdesk.com',
    avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=120&q=80',
    enrolledCourses: ['course-6'],
    totalSpent: 3999,
    joinedDate: '2026-09-30',
    status: 'Active',
    lastActive: '3 days ago'
  }
];

// Initial Logged In User State
const DEFAULT_USER = {
  id: 'current-user-1',
  name: 'Naveen Kumar',
  email: 'naveen.demo@skillflix.io',
  role: 'student', // 'student' or 'admin'
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
  enrolledCourseIds: ['course-1'], // Initially enrolled in course 1 for instant demo experience
  courseProgress: {
    'course-1': {
      completedLessons: ['les-1-1'],
      quizScore: 100,
      certified: false
    }
  }
};

// Initial Platform Settings
const DEFAULT_SETTINGS = {
  platformName: 'SkillFlix Pro',
  supportEmail: 'support@skillflix.io',
  currency: '₹',
  razorpayKey: 'rzp_live_DemoAccessKey2026',
  razorpayMode: 'Test / Demo Sandbox',
  upiId: 'skillflix@okhdfcbank',
  heroHeadline: 'Unlock World-Class Masterclasses. Stream Anywhere, Anytime.',
  heroSubheadline: 'Bite-sized high definition video masterclasses, downloadable production blueprints, interactive quizzes, and verified certification from world-class industry leads.'
};

// --- DATA ACCESS LAYER ---

export const getCourses = () => {
  const stored = localStorage.getItem(STORAGE_KEYS.COURSES);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(DEFAULT_COURSES));
    return DEFAULT_COURSES;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return DEFAULT_COURSES;
  }
};

export const getCourseById = (id) => {
  const courses = getCourses();
  return courses.find(c => c.id === id) || null;
};

export const saveCourse = (courseData) => {
  const courses = getCourses();
  let updated;
  if (courseData.id) {
    // Update
    updated = courses.map(c => c.id === courseData.id ? { ...c, ...courseData } : c);
  } else {
    // New course
    const newCourse = {
      ...courseData,
      id: 'course-' + Date.now(),
      rating: 5.0,
      reviewsCount: 1,
      studentsCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      modules: courseData.modules || [
        {
          id: 'mod-' + Date.now(),
          title: 'Module 1: Getting Started & Core Fundamentals',
          lessons: [
            {
              id: 'les-' + Date.now(),
              title: '01. Course Introduction & Project Setup',
              duration: '18:40',
              videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
              freePreview: true,
              summary: 'Overview of the course deliverables, prerequisites, and developer setup.'
            }
          ]
        }
      ],
      resources: courseData.resources || [
        {
          id: 'res-' + Date.now(),
          title: 'Course Cheatsheet & Quickstart Guide',
          type: 'PDF Notes',
          size: '6.5 MB',
          pages: 15,
          downloadUrl: '#',
          description: 'High-yield reference notes and architectural summaries.'
        }
      ],
      quiz: courseData.quiz || [
        {
          question: 'What is the primary architectural concept taught in this masterclass?',
          options: ['Production-grade scalability', 'Basic scripting', 'Manual deployment', 'Legacy monolithic design'],
          correctIndex: 0
        }
      ]
    };
    updated = [newCourse, ...courses];
  }
  localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(updated));
  return updated;
};

export const deleteCourse = (id) => {
  const courses = getCourses().filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
  return courses;
};

export const addLessonToCourse = (courseId, lessonData) => {
  const courses = getCourses();
  const updated = courses.map(course => {
    if (course.id !== courseId) return course;
    const modules = [...course.modules];
    if (modules.length === 0) {
      modules.push({
        id: 'mod-' + Date.now(),
        title: 'Module 1: Course Curriculum',
        lessons: []
      });
    }
    const newLesson = {
      id: 'les-' + Date.now(),
      title: lessonData.title || 'New Video Lesson',
      duration: lessonData.duration || '20:00',
      videoUrl: lessonData.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      freePreview: !!lessonData.freePreview,
      summary: lessonData.summary || 'Detailed hands-on code walkthrough and demonstration.'
    };
    modules[0].lessons.push(newLesson);
    
    // update lesson count & total duration
    const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
    return {
      ...course,
      modules,
      lessonsCount: totalLessons
    };
  });
  localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(updated));
  return updated;
};

export const addResourceToCourse = (courseId, resourceData) => {
  const courses = getCourses();
  const updated = courses.map(course => {
    if (course.id !== courseId) return course;
    const resources = [...(course.resources || [])];
    const newResource = {
      id: 'res-' + Date.now(),
      title: resourceData.title || 'New Study Material PDF',
      type: resourceData.type || 'PDF Document',
      size: resourceData.size || '12.4 MB',
      pages: resourceData.pages || 24,
      downloadUrl: resourceData.downloadUrl || '#',
      description: resourceData.description || 'Curated study guide and practice questions.'
    };
    resources.push(newResource);
    return {
      ...course,
      resources,
      pdfCount: resources.length
    };
  });
  localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(updated));
  return updated;
};

// --- USER & AUTHENTICATION STATE ---

export const getUser = () => {
  const stored = localStorage.getItem(STORAGE_KEYS.USER);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(DEFAULT_USER));
    return DEFAULT_USER;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return DEFAULT_USER;
  }
};

export const saveUser = (userData) => {
  const current = getUser();
  const updated = { ...current, ...userData };
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
  return updated;
};

export const isCourseEnrolled = (courseId) => {
  const user = getUser();
  return user.enrolledCourseIds && user.enrolledCourseIds.includes(courseId);
};

export const enrollInCourse = (courseId, paymentDetails = {}) => {
  const user = getUser();
  const course = getCourseById(courseId);
  if (!course) return { success: false, error: 'Course not found' };

  if (!user.enrolledCourseIds.includes(courseId)) {
    user.enrolledCourseIds.push(courseId);
  }

  if (!user.courseProgress[courseId]) {
    user.courseProgress[courseId] = {
      completedLessons: [],
      quizScore: 0,
      certified: false
    };
  }
  saveUser(user);

  // Increment student count in course
  const courses = getCourses().map(c => {
    if (c.id === courseId) {
      return { ...c, studentsCount: (c.studentsCount || 0) + 1 };
    }
    return c;
  });
  localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));

  // Add transaction to ledger
  const transactions = getTransactions();
  const newTxn = {
    id: 'TXN-' + Math.floor(10000 + Math.random() * 90000),
    orderId: 'order_' + Math.random().toString(36).substring(2, 12).toUpperCase(),
    studentName: user.name || 'Demo Student',
    studentEmail: user.email || 'student@skillflix.io',
    courseId: course.id,
    courseTitle: course.title,
    amount: paymentDetails.amount || course.price,
    gateway: paymentDetails.gateway || 'Razorpay Instant UPI',
    status: 'Success',
    date: new Date().toLocaleString()
  };
  transactions.unshift(newTxn);
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));

  // Add/Update student in directory
  const students = getStudents();
  const existingIdx = students.findIndex(s => s.email === user.email);
  if (existingIdx >= 0) {
    if (!students[existingIdx].enrolledCourses.includes(courseId)) {
      students[existingIdx].enrolledCourses.push(courseId);
    }
    students[existingIdx].totalSpent += newTxn.amount;
    students[existingIdx].lastActive = 'Just now';
  } else {
    students.unshift({
      id: 'stu-' + Date.now(),
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      enrolledCourses: [courseId],
      totalSpent: newTxn.amount,
      joinedDate: new Date().toISOString().split('T')[0],
      status: 'Active',
      lastActive: 'Just now'
    });
  }
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));

  return { success: true, transaction: newTxn, course };
};

export const markLessonComplete = (courseId, lessonId) => {
  const user = getUser();
  if (!user.courseProgress[courseId]) {
    user.courseProgress[courseId] = { completedLessons: [], quizScore: 0, certified: false };
  }
  const completed = user.courseProgress[courseId].completedLessons || [];
  if (!completed.includes(lessonId)) {
    completed.push(lessonId);
    user.courseProgress[courseId].completedLessons = completed;
    saveUser(user);
  }
  return user.courseProgress[courseId];
};

// --- TRANSACTIONS & LEDGER ---

export const getTransactions = () => {
  const stored = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(DEFAULT_TRANSACTIONS));
    return DEFAULT_TRANSACTIONS;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return DEFAULT_TRANSACTIONS;
  }
};

// --- STUDENTS DIRECTORY ---

export const getStudents = () => {
  const stored = localStorage.getItem(STORAGE_KEYS.STUDENTS);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(DEFAULT_STUDENTS));
    return DEFAULT_STUDENTS;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return DEFAULT_STUDENTS;
  }
};

export const toggleStudentStatus = (studentId) => {
  const students = getStudents().map(s => {
    if (s.id === studentId) {
      return { ...s, status: s.status === 'Active' ? 'Suspended' : 'Active' };
    }
    return s;
  });
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  return students;
};

// --- PLATFORM SETTINGS ---

export const getSettings = () => {
  const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    return DEFAULT_SETTINGS;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = (newSettings) => {
  const current = getSettings();
  const updated = { ...current, ...newSettings };
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
  return updated;
};

// --- RESET DEMO DATA ---
export const resetAllDemoData = () => {
  localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(DEFAULT_COURSES));
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(DEFAULT_USER));
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(DEFAULT_TRANSACTIONS));
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(DEFAULT_STUDENTS));
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
};
