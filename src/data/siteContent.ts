// Copy pulled directly from the design brief / mockups. Update freely —
// this file is the only place page copy lives outside the Sheet-fed articles.

export const CONTACT_EMAIL = 'hello@rasirafoundation.org';

export const heroIntro = {
  // No "Rasira" in the title itself — the header logo right above it
  // already carries the name, so repeating it here would just be noise.
  title: 'Helping young people imagine who they could become',
  paragraph:
    'A research-and-practice collective working on how young people understand themselves, imagine their futures, and build the confidence to move toward them.',
  tags: ['anthropology', 'workforce development', 'field-based program design'],
};

export const pillars: Array<{ label: string; items?: string[]; body?: string }> = [
  {
    label: 'We aim to help young people',
    items: [
      'Identify strengths',
      'Practice real-world tasks before making high-stakes choices',
      'Build confidence through evidence',
      'Choose their own path',
    ],
  },
  {
    label: 'We measure',
    body: 'before, during, and after our programs so we can see what moves, what does not, and for whom.',
  },
  {
    label: 'We design programs with community partners',
    body: 'for young people the labor market often overlooks: rural youth, first-generation jobseekers, and young people without strong credentials.',
  },
];

export const frameworkBridgeText = 'Here is the system logic behind that work';

export const systemFramework = {
  eyebrow: 'Public Framework',
  title: 'How the work is structured',
  subtitle:
    'The system logic communicates how we think about the work — without disclosing proprietary dimensions, scoring models, or decision rules.',
  boxes: [
    {
      tag: 'Input',
      title: 'Person Profile',
      items: ['Capability', 'Orientation', 'Work Style', 'Agency & Adaptability'],
      variant: 'dark' as const,
    },
    {
      tag: 'Process',
      title: 'Evidence in Action',
      items: ['Observed responses', 'Behaviour', 'Outputs'],
      variant: 'neutral' as const,
    },
    {
      tag: 'Pivot',
      title: 'Decisions & Development',
      items: ['Program adjustment', 'Facilitator guidance', 'Pathway alignment'],
      variant: 'accent' as const,
    },
    {
      tag: 'Outcome',
      title: 'Outcomes',
      items: ['Learning', 'Transition', 'Performance', 'Mobility'],
      variant: 'cool' as const,
    },
  ],
  feedbackLabel: 'Evidence and learning feedback',
  note: 'This public framework communicates the system logic without disclosing proprietary dimensions, items, scoring models, weights, or decision rules.',
};

export const collabsSection = {
  heading: 'You might be working on the same problem.',
  body: "Whether you run programs, fund research, or design tools — if you're working on what young Indonesians believe is possible for them, we want to know you.",
  ctaLabel: 'Reach out →',
  ctaMailto: `mailto:${CONTACT_EMAIL}`,
  supportPrompt: 'Or support our field work directly ↓',
};

export const partnerSection = {
  partner: {
    role: 'Implementation Partner',
    lead: 'Where Rasira studies the psychological layer, Spring builds the tools young people use to act on it.',
    body: 'Career preparation platform for Indonesian youth (CV review, job simulation, personality assessment). Together: the research that informs the practice, and the practice that generates the research.',
    url: 'https://springtalents.com',
    urlLabel: 'springtalents.com ↗',
  },
};

export const donationSection = {
  eyebrow: 'Direct Support',
  eyebrowSub: 'Independent Research',
  lead: "Rasira doesn't run ads. We don't have a government grant yet. What we have is field time, careful questions, and the conviction that the psychological layer of human capital matters.",
  body: 'Every donation keeps a researcher in the field, a facilitator in a community, and a finding on its way to the people who can use it.',
  ctaLabel: 'Support Our Fieldwork →',
  ctaMailto: `mailto:${CONTACT_EMAIL}?subject=Supporting%20Rasira%27s%20Fieldwork`,
};

export const closingNarrative = {
  line1: 'Indonesia Emas 2045?',
  line2: 'time is ticking..',
};
