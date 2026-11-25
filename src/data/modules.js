// Curriculum content. Each module has groups of pointers; a group may have a heading.
// Pointer text is also used to build each checkbox's saved key, so editing a
// pointer's wording resets its tick for everyone (same as the original page).

export const MODULES = [
  {
    m: 1, title: 'Communication', short: 'Communication',
    intro: 'Foundation, learnt first and practised throughout.',
    groups: [
      { items: [
        'Tone, how we advise, how we speak to clients, what we look at',
        'Etiquette: offline, online, WhatsApp and calls, each in detail',
        'Practice: call practice and how to reply to the client',
        'SOP: every call should have a flow',
      ] },
      { heading: 'Call SOP basics', items: [
        'Tenure is not relevant to the first conversation',
        'Ask CIBIL and EMIs',
        'For employees of a bank/company: what can we pitch (payback, documentation handled by us)?',
      ] },
    ],
    note: 'Open question to check: if a loan comes through the employer, must the customer stay for the full tenure, or does the rate change?',
  },
  {
    m: 2, title: 'Eligibility', short: 'Eligibility',
    intro: 'The first technical skill.',
    groups: [
      { items: ['How eligibility is calculated', 'CRE concept'] },
      { heading: 'Structuring', items: [
        'Loan amount (an extension of LTV and eligibility)',
        'Loan structuring and property structuring',
        'Ownership split: who gets how much, to maximise exemption',
        'Pre-agreement vs post-agreement',
        'Joint ownership vs co-ownership',
        'If the split is not mentioned in the agreement: TDS plus down-payment route',
        'If already mentioned: just complete the process',
      ] },
    ],
  },
  {
    m: 3, title: 'Property', short: 'Property',
    groups: [
      { items: [
        'Ownership, legal report and technical report',
        'RERA and the approvals involved',
        'OC/CC and mortgage creation',
        'CERSAI',
        'SARFAESI',
      ] },
    ],
  },
  {
    m: 4, title: 'How to Use Tech', short: 'Tech',
    intro: 'Demo and training for the whole team.',
    groups: [
      { items: [
        'Internal side, client side and website: how everything works',
        'Calculators: how to use, how to make, how to present',
      ] },
    ],
  },
  {
    m: 5, title: 'Rate Grid', short: 'Rate grid',
    groups: [{ items: ['Understanding the rate grid', 'Which bank, and the suggestions that follow'] }],
  },
  {
    m: 6, title: 'List of Documents', short: 'Documents',
    groups: [
      { items: [
        'What each document is and why it is taken, so you can answer the customer',
        'Special cases and special requests from customers',
        'Bankers asking for extra documents that are not usually asked: why it happens and what to do',
      ] },
    ],
  },
  {
    m: 7, title: 'Verification', short: 'Verification',
    groups: [{ items: ['How to verify each document', 'What to look for in every document'] }],
  },
  {
    m: 8, title: 'Flow of the Loan and Documents', short: 'Loan flow',
    groups: [
      { items: [
        'Stage by stage: documents, login, legal, technical, sanction, document signing',
        'Knowing where a case stands, so you can guide the customer when they ask',
      ] },
    ],
  },
  {
    m: 9, title: 'Banker Relationships', short: 'Bankers',
    groups: [
      { items: [
        'What bankers are incentivised by and what they want',
        'What to do if they stop responding',
        'How to judge whether a banker is really interested in your case',
        'Bankers who boast or promise, then do not deliver',
      ] },
    ],
  },
  {
    m: 10, title: 'OwnWard Context', short: 'OwnWard',
    groups: [{ items: ['The brand and why we exist', 'Whom we cater to', 'What all we do'] }],
  },
  {
    m: 11, title: 'Reports', short: 'Reports',
    groups: [
      { heading: 'Builder report', items: [
        'How we make it and what the customer gets',
        'How to make it yourself',
        'How to deploy and show it',
      ] },
      { heading: 'Legal agreement report', items: [
        'How to present the checked output',
        'Common questions that can come up, and learning the answers',
      ] },
    ],
  },
  {
    m: 12, title: 'Tax Advice', short: 'Tax',
    intro: 'The major advisory area.',
    groups: [
      { heading: 'Tax component', items: [
        'Rent and interest, savings, capital gains',
        'Sections 54 and 54F',
        'Basic tax calculation, and long-term holding periods (12 vs 24 months by asset type)',
        'Cost step-up (sell and rebuy the same portfolio to raise cost price)',
        'Capital gain harvesting across spouses',
      ] },
    ],
  },
  {
    m: 13, title: 'Compliance', short: 'Compliance',
    groups: [
      { items: [
        'TDS deduction: the ratio in which TDS is paid is what the tax department reads as ownership',
        'Down payment made in the same ratio as supporting evidence',
        'TDS on purchase: resident vs non-resident seller',
        'Whether the person files ITR',
        'Dates and lock-ins: 54/54F funds cannot be diverted, and the house must be held for 3 years or the benefit is reversed',
      ] },
    ],
  },
  {
    m: 14, title: 'Ethics', short: 'Ethics',
    groups: [{ items: ["What we do and what we don't", 'Review the existing ethics binder and add any missing points or terms'] }],
  },
  {
    m: 15, title: 'Mechanics of Each Loan', short: 'Loan mechanics',
    groups: [
      { heading: 'Loan against property (LAP)', items: ['What happens, rates, and the extra checks involved'] },
      { heading: 'Balance transfer (BT)', items: [
        'What happens, and above all when to do it',
        'Three deciding metrics: difference in rate (bps), tenure, and amount left',
        'Savings must outweigh the processing fee, login fee, fresh legal and technical work, re-submitted income proof, and customer effort',
        'Status quo bias: customers resist change even when savings exist',
      ] },
    ],
  },
  {
    m: 16, title: 'Commission and Money Matters', short: 'Commission',
    groups: [{ items: ['Commission, clawback and TDS'] }],
  },
  {
    m: 17, title: 'Glossary', short: 'Glossary',
    groups: [{ items: ['All technical terms used across the training, in one place', 'Keep growing it as new points come up'] }],
  },
];

export const SPECIAL_MODULE = { m: 18, title: 'Special Cases', short: 'Special cases' };

// Module number -> full title, for quiz headers, PDFs and dropdowns.
export const MODULE_NAMES = Object.fromEntries(
  [...MODULES, SPECIAL_MODULE].map((mod) => [mod.m, mod.title])
);
