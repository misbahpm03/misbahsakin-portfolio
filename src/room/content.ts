/**
 * Every word the room can show. Kept apart from the 3D scene so copy edits
 * never mean touching geometry.
 */

export type Block =
  | { kind: 'lede'; text: string }
  | { kind: 'stat'; value: string; label: string }
  | { kind: 'entry'; title: string; when?: string; body?: string; bullets?: string[]; tags?: string[] }
  | { kind: 'tags'; title: string; tags: string[] }
  | { kind: 'link'; label: string; value: string; href: string }
  /** opens the brief dialog over the room, instead of leaving for a page */
  | { kind: 'brief'; label: string; value: string };

export type Section = {
  /** matches the mesh id in the scene */
  id: SectionId;
  /** the object you clicked, named as an object */
  object: string;
  title: string;
  /** this section's own URL, e.g. /projects */
  slug: string;
  /** one sentence; becomes the meta description for that URL */
  blurb: string;
  blocks: Block[];
};

export type SectionId =
  | 'laptop'
  | 'whiteboard'
  | 'corkboard'
  | 'pegboard'
  | 'shelf'
  | 'bookcase'
  | 'camera'
  | 'polaroids'
  | 'phone';

export const PROFILE = {
  name: 'Md Misbahul Islam',
  role: 'Product Manager',
  place: 'Dhaka, Bangladesh',
  email: 'misbahsakin1@gmail.com',
  phone: '+8801601802857',
  linkedin: 'https://linkedin.com/in/misbahsakin',
  resume:
    'https://drive.google.com/file/d/1Yl1A1TrHsxdUDfN9YKd0TDZNtoNHwxIF/view?usp=drivesdk',
};

export const SECTIONS: Record<SectionId, Section> = {
  laptop: {
    id: 'laptop',
    object: 'The laptop',
    title: 'Product manager, B2B and fintech',
    slug: 'about',
    blurb:
      'Product manager for SaaS and fintech in Dhaka, with a QA background and two years owning delivery end to end.',
    blocks: [
      {
        kind: 'lede',
        text: 'I own SaaS and fintech products end to end — discovery, requirements, roadmap, delivery, launch, and the iteration nobody puts on the roadmap. I came up through QA, so I know exactly where a vague requirement ends up.',
      },
      { kind: 'stat', value: '2+', label: 'years owning product' },
      { kind: 'stat', value: '10 Cr+', label: 'BDT moving daily through features I shipped' },
      { kind: 'stat', value: '30%', label: 'faster delivery after recutting the backlog' },
      { kind: 'stat', value: '7+', label: 'engineers, designers and QA led at once' },
      {
        kind: 'entry',
        title: 'How I work',
        bullets: [
          'Write the PRD before the ticket — ambiguity gets expensive downstream.',
          'Prioritize with numbers where they exist and stated assumptions where they do not.',
          'Sit close to engineering, UX, and QA. A roadmap is only as real as the sprint.',
          'Watch product health after launch, not just before it.',
        ],
      },
    ],
  },

  whiteboard: {
    id: 'whiteboard',
    object: 'The roadmap wall',
    title: 'Experience',
    slug: 'experience',
    blurb:
      'Product roles at Riseup Labs and Sheba Platform, from trainee QA to B2B product manager, and what each one delivered.',
    blocks: [
      {
        kind: 'entry',
        title: 'Product Manager, B2B',
        when: 'Riseup Labs · Dhaka · Dec 2025 — present',
        body: 'B2B product strategy and execution for enterprise clients, from first conversation to shipped release.',
        bullets: [
          'Own the product lifecycle from discovery to launch, aligning client requirements with business objectives.',
          'Define and execute roadmaps, cutting delivery timelines 30% through Agile frameworks.',
          'Work with engineering, QA, and stakeholders to raise solution accuracy 15%.',
          'Translate enterprise client requirements into scalable product features.',
        ],
        tags: ['B2B Strategy', 'Roadmapping', 'Agile Delivery', 'Stakeholder Management'],
      },
      {
        kind: 'entry',
        title: 'Product Manager',
        when: 'Sheba Platform Limited · Dhaka · Oct 2024 — Nov 2025',
        body: 'Led cross-functional delivery on fintech and consumer platforms, lifting user engagement 40%.',
        bullets: [
          'Owned roadmap and execution, reducing delivery timelines 30%.',
          'Partnered with engineering and QA on scalable solutions, improving accuracy 15%.',
          'Drove cross-functional collaboration across fintech, raising project success rates 10%.',
        ],
        tags: ['Product Strategy', 'Agile Delivery', 'Data-Driven Decisions'],
      },
      {
        kind: 'entry',
        title: 'Associate Product Manager',
        when: 'Sheba Platform Limited · Dhaka · Apr 2024 — Sep 2024',
        bullets: [
          'Managed project timelines, reducing delivery times 30% with Agile methods.',
          'Drove adoption of new engineering tooling, improving project accuracy 15%.',
          'Collaborated across teams on fintech products, lifting success rates 10%.',
        ],
        tags: ['User Research', 'Roadmapping', 'Product Planning'],
      },
      {
        kind: 'entry',
        title: 'Trainee QA',
        when: 'Riseup Labs · Dhaka · 2023',
        body: 'Six-month intensive QA program, then real projects under senior guidance.',
        bullets: [
          'Hands-on SDLC and STLC: requirement analysis, test planning, execution, defect management.',
          'Built working expertise across testing tools and frameworks.',
        ],
        tags: ['Manual Testing', 'Test Case Design', 'JIRA', 'SQL'],
      },
      {
        kind: 'entry',
        title: 'Motion Graphics and Video Editor',
        when: 'aTech · Remote · 2022 — 2023',
        bullets: [
          'Edited promotional videos and documentaries for a range of clients.',
          'Produced motion graphics and visual effects, running several projects at once.',
        ],
        tags: ['Premiere Pro', 'After Effects', 'Color Grading'],
      },
    ],
  },

  corkboard: {
    id: 'corkboard',
    object: 'The wall of notes',
    title: 'Projects',
    slug: 'projects',
    blurb:
      'Sheba Pay, Sheba Manager, Graphoskop, a microfinance loan engine, PMOps and Midnight Arcade — six shipped products and their numbers.',
    blocks: [
      {
        kind: 'entry',
        title: 'Sheba Pay — enterprise payments',
        when: 'Fintech · payments at scale',
        body: 'Corporate transaction platform built for volume and reliability.',
        bullets: [
          '10 Cr+ BDT in daily transactions at 99.9% reliability.',
          'Aligned three cross-functional teams and cut processing issues 30%.',
        ],
      },
      {
        kind: 'entry',
        title: 'Sheba Manager — business management',
        when: 'B2B SaaS',
        body: 'One platform for employee operations, access control, and internal workflows.',
        bullets: [
          'Serves 10,000+ enterprise users with role-based access control.',
          'Designed 10+ operational workflows for employee and business processes.',
        ],
      },
      {
        kind: 'entry',
        title: 'Graphoskop — research tool',
        when: 'Research · analytics and visualization',
        body: 'A research platform that turns study data into decisions.',
        bullets: [
          'Delivered 12 core visualization and measurement modules.',
          'Turned stakeholder requirements into features that lifted reporting efficiency 65%.',
        ],
      },
      {
        kind: 'entry',
        title: 'Microfinance Loan Engine',
        when: 'NGO · lending automation',
        body: 'Digital loan processing from application through approval to repayment.',
        bullets: [
          'Designed 15 end-to-end loan lifecycle workflows.',
          'Improved processing turnaround 40% by reworking the flow.',
        ],
      },
      {
        kind: 'entry',
        title: 'PMOps',
        when: 'AI · product workspace',
        body: 'Where a PM defines scope and keeps meeting notes, decisions, and comms in one place.',
        bullets: ['Builds and maintains tasks and backlog straight from meetings and inputs.'],
      },
      {
        kind: 'entry',
        title: 'Midnight Arcade',
        when: 'Games · arcade platform',
        bullets: [
          'Shipped 30 interactive level mechanics, tuned for performance across platforms.',
          'Worked with a 10+ person team inside the planned sprint timeline.',
        ],
      },
    ],
  },

  pegboard: {
    id: 'pegboard',
    object: 'The pegboard',
    title: 'Skills & tools',
    slug: 'skills',
    blurb:
      'Product management, quality assurance, delivery tooling, data and AI tools used day to day.',
    blocks: [
      {
        kind: 'tags',
        title: 'Product management',
        tags: [
          'Product Strategy',
          'Roadmapping',
          'Product Discovery',
          'User Research',
          'PRDs',
          'Prioritization',
          'Agile / Scrum',
          'Sprint Planning',
          'Backlog Grooming',
          'KPI Definition',
          'Stakeholder Communication',
        ],
      },
      {
        kind: 'tags',
        title: 'Quality assurance',
        tags: [
          'Manual Testing',
          'Test Case Design',
          'QAT / UAT Documentation',
          'API Testing',
          'Performance Testing',
          'Defect Management',
        ],
      },
      {
        kind: 'tags',
        title: 'Delivery tools',
        tags: ['JIRA', 'ClickUp', 'Notion', 'Figma', 'Miro', 'Slack', 'Trello', 'Confluence', 'GitHub', 'Postman'],
      },
      {
        kind: 'tags',
        title: 'Data',
        tags: ['Power BI', 'Superset', 'Product Analytics', 'A/B Testing', 'SQL'],
      },
      {
        kind: 'tags',
        title: 'AI tools',
        tags: ['Claude', 'Cursor', 'ChatGPT', 'Gemini', 'Google AI Studio', 'GitHub Copilot', 'Perplexity', 'Lovable', 'Bolt.new'],
      },
      {
        kind: 'tags',
        title: 'Creative',
        tags: ['Premiere Pro', 'After Effects', 'Photoshop', 'Illustrator', 'DaVinci Resolve', 'Final Cut'],
      },
    ],
  },

  shelf: {
    id: 'shelf',
    object: 'The shelf',
    title: 'Awards & recognition',
    slug: 'awards',
    blurb:
      'AI Excellence Award, 40% product adoption growth, a 60% cut in defect rate, and cross-functional teams of seven or more.',
    blocks: [
      {
        kind: 'lede',
        text: 'What the work was measured by, rather than what it was called.',
      },
      {
        kind: 'entry',
        title: 'AI Excellence Award',
        when: 'Riseup Labs · Q1 2026',
        body: 'For AI prototypes and innovation projects.',
      },
      {
        kind: 'entry',
        title: 'Product adoption up 40%',
        when: 'Sheba Platform',
        body: 'Led the strategy behind a sustained lift in daily and monthly active users.',
      },
      {
        kind: 'entry',
        title: 'Defect rate down 60%',
        when: 'Quality assurance',
        body: 'Testing practice that cut defects while shortening the cycle — QA rounds went from two weeks to five days.',
      },
      {
        kind: 'entry',
        title: 'Team leadership',
        when: 'Across multiple projects',
        body: 'Ran cross-functional teams of 7+ — mobile, backend, and UI/UX — without losing a delivery date.',
      },
      { kind: 'stat', value: '40%', label: 'user growth' },
      { kind: 'stat', value: '60%', label: 'fewer defects' },
      { kind: 'stat', value: '75%', label: 'less QA cycle time' },
      { kind: 'stat', value: '7+', label: 'people led at once' },
    ],
  },

  bookcase: {
    id: 'bookcase',
    object: 'The bookcase',
    title: 'Education & certifications',
    slug: 'education',
    blurb:
      'B.Sc. in Electronics and Telecommunication Engineering from CUET, plus product, Scrum and Six Sigma certifications.',
    blocks: [
      {
        kind: 'entry',
        title: 'B.Sc. Electronics & Telecommunication Engineering',
        when: 'Chittagong University of Engineering & Technology · 2019 — 2024',
        body: 'Majored in Telecommunication. Thesis on antenna design — the engineering background is why conversations with engineers tend to go quickly.',
        tags: ['Telecommunication', 'Networking', 'Software Development', 'GPA 3.19 / 4.0'],
      },
      {
        kind: 'entry',
        title: 'Higher Secondary Certificate',
        when: 'Cantonment Public School and College, Rangpur · 2018',
        tags: ['Science', 'IoT Projects', 'GPA 5.00 / 5.00'],
      },
      {
        kind: 'entry',
        title: 'Secondary School Certificate',
        when: 'Police Lines School and College, Rangpur · 2016',
        tags: ['Science', 'Club & ECA', 'GPA 5.00 / 5.00'],
      },
      {
        kind: 'entry',
        title: 'Product & process',
        bullets: [
          'Professional Diploma in Digital Products Management — MTF Institute of Management, Technology & Finance, 2025',
          'Product Owner Certification — Agile Enterprise Coach London, 2025',
          'Lean Six Sigma Yellow Belt, accredited — OPEXLEADER, 2025',
        ],
      },
      {
        kind: 'entry',
        title: 'Technical',
        bullets: [
          'Power BI Essential Training — Career Club, 2024',
          'SDLC and STLC — QA Academy, 2023',
          'Basic API Implementation — AppLink, 2022',
        ],
      },
    ],
  },

  camera: {
    id: 'camera',
    object: 'The camera',
    title: 'Creative & film',
    slug: 'creative',
    blurb:
      'Six years of design, motion graphics and film before product — including an ANIMATIBA Brazil best feature film award.',
    blocks: [
      {
        kind: 'lede',
        text: 'Six years of design and film before product management. It is why I can sit in a room with designers and be useful rather than decorative — and why an award-winning short film is on this CV next to a payment platform.',
      },
      {
        kind: 'entry',
        title: 'Motion Graphics and Video Editor',
        when: 'aTech · Remote · 2022 — 2023',
        bullets: [
          'Edited promotional videos and documentaries for a range of clients.',
          'Produced motion graphics and visual effects, running several projects at once against tight deadlines.',
        ],
        tags: ['Premiere Pro', 'After Effects', 'Color Grading', 'Motion Graphics'],
      },
      {
        kind: 'entry',
        title: 'Graphics Design & Video Editor',
        when: '2016 — 2022',
        bullets: [
          'HTM Records, Bangladesh · 2019 — 2022',
          'Graphics Design Director, CUET Model United Nations Club · 2021',
        ],
        tags: ['Photoshop', 'Illustrator', 'DaVinci Resolve', 'Final Cut'],
      },
      {
        kind: 'entry',
        title: 'Best Feature Film',
        when: 'ANIMATIBA 2021 · Festival Internacional de Animação de Curitiba, Brazil',
      },
      {
        kind: 'entry',
        title: 'UNFPA "Save the Children" Award',
      },
      {
        kind: 'entry',
        title: 'Official Selection',
        when: "International Children's Film Festival · 2018 — 2019",
      },
    ],
  },

  polaroids: {
    id: 'polaroids',
    object: 'The photo wall',
    title: 'Community & organising',
    slug: 'community',
    blurb:
      'HULT Prize, IEEE, Banglalink campus ambassador and festival organising: 500+ people mentored across 15+ voluntary projects.',
    blocks: [
      {
        kind: 'lede',
        text: 'Running events is product management with a harder deadline and no way to ship a patch afterwards. Most of what I know about stakeholders, I learned here first.',
      },
      {
        kind: 'entry',
        title: 'Campus leadership',
        when: '2021 — present',
        bullets: [
          'Campus Ambassador, Applink (Banglalink)',
          'IT Secretary, HULT Prize Competition',
          'Design Coordinator, IEEE Face the Case 2.0',
          'Organizing Secretary, Joyoddhoney, CUET',
        ],
      },
      {
        kind: 'entry',
        title: 'Events & coordination',
        when: '2016 — 2022',
        bullets: [
          'Chief Coordinator, Pitha Utshab 2022, Bangladesh Navy',
          'Coordinator, Alpona Utshab 1426, Rangpur · 2019',
          'Project Coordinator, Project Notun Jama, Spriha (NGO), Rangpur · 2017 — 2019',
        ],
      },
      { kind: 'stat', value: '500+', label: 'people mentored' },
      { kind: 'stat', value: '15+', label: 'voluntary projects' },
    ],
  },

  phone: {
    id: 'phone',
    object: 'The phone',
    title: 'Start a conversation',
    slug: 'contact',
    blurb:
      'Get in touch about product roles and delivery ownership — email, phone, LinkedIn and a short brief form.',
    blocks: [
      {
        kind: 'lede',
        text: 'Open to product roles and to teams who need someone to own delivery. Email is fastest — I usually reply within 24 to 48 hours.',
      },
      { kind: 'link', label: 'Email', value: PROFILE.email, href: `mailto:${PROFILE.email}` },
      { kind: 'link', label: 'Phone', value: PROFILE.phone, href: `tel:${PROFILE.phone.replace(/\s/g, '')}` },
      { kind: 'link', label: 'LinkedIn', value: 'linkedin.com/in/misbahsakin', href: PROFILE.linkedin },
      { kind: 'link', label: 'Resume', value: 'Download PDF', href: PROFILE.resume },
      { kind: 'brief', label: 'Message form', value: 'Send a brief' },
    ],
  },
};

/** Order used by the keyboard/mobile navigation. */
export const SECTION_ORDER: SectionId[] = [
  'laptop',
  'whiteboard',
  'corkboard',
  'pegboard',
  'shelf',
  'bookcase',
  'camera',
  'polaroids',
  'phone',
];

/** URL slug -> section id, for routing. */
export const BY_SLUG: Record<string, SectionId> = Object.fromEntries(
  SECTION_ORDER.map((id) => [SECTIONS[id].slug, id]),
) as Record<string, SectionId>;

export const NAV_LABEL: Record<SectionId, string> = {
  laptop: 'About',
  whiteboard: 'Experience',
  corkboard: 'Projects',
  pegboard: 'Skills',
  shelf: 'Awards',
  bookcase: 'Education',
  camera: 'Creative',
  polaroids: 'Community',
  phone: 'Contact',
};
