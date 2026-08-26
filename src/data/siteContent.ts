// Copy pulled directly from the design brief / mockups. Update freely —
// this file is the only place page copy lives outside the Sheet-fed articles.

export const CONTACT_EMAIL = 'hello@rasirafoundation.org';

export const heroIntro = {
  // No "Rasira" in the title itself — the header logo right above it
  // already carries the name, so repeating it here would just be noise.
  title: 'Helping young people imagine who they could become',
  paragraph:
    'Human capital potential starts at believing what is possible. We are a research-and-practice collective working on that layer.',
  tags: ['anthropology', 'workforce development', 'field-based program design'],
};

/* Heads the three-column panel. Sits INSIDE that panel rather than above
   it like the other two section headings, because the panel is pulled up
   over the classroom photo by a large negative margin — a heading placed
   before it would land on the photograph. */
export const pillarsSection = {
  title: 'How We Work',
};

export const pillars: Array<{ label: string; items?: string[]; body?: string }> = [
  {
    label: 'We help young people',
    items: [
      'Identify strengths',
      'Build confidence through evidence',
      'Make decisions based on fit, not just expectation',
    ],
  },
  {
    label: 'We measure',
    body: 'before, during, and after our programs so we can see what moves, what does not, and for whom.',
  },
  {
    label: 'We design programs with community partners',
    body: 'for young people the labor market often overlooks such as rural youth, first-generation jobseekers, and young people without strong credentials.',
  },
];

export const frameworkBridgeText = 'Here is the system logic behind that work';

export const systemFramework = {
  eyebrow: 'Public Framework',
  title: 'How We Think About the Work',
  subtitle: 'Connects "what we do" to "how we think".',
  /* Sits on the loop line beneath the diagram, breaking the dashed rule so
     the line reads as labelled rather than merely decorative. */
  loopLabel: 'Outcomes inform the next cycle',
  /* Columns, not a flat list of boxes. The first stage holds TWO stacked
   * nodes (01a Person Profile / 01b Opportunity Context) while the rest
   * hold one each — so the diagram is four columns across but five nodes
   * total, and a flat array could no longer describe it. `total` is the
   * denominator shown in each node's step counter; it counts stages, not
   * nodes, which is why 01a and 01b share the same one. */
  total: '04',
  columns: [
    {
      nodes: [
        {
          tag: 'Input',
          step: '01a',
          title: 'Person Profile',
          items: ['Capability', 'Orientation', 'Work Style', 'Agency & Adaptability'],
        },
        {
          tag: 'Context',
          step: '01b',
          title: 'Opportunity Context',
          items: ['Demand', 'Supports', 'Barriers', 'Access'],
        },
      ],
    },
    {
      nodes: [
        {
          tag: 'Process',
          step: '02',
          title: 'Evidence in Action',
          items: ['Observed responses', 'Behaviour', 'Outputs'],
        },
      ],
    },
    {
      pivot: true,
      nodes: [
        {
          tag: 'Pivot',
          step: '03',
          title: 'Decisions & Development',
          items: ['Program adjustment', 'Facilitator guidance', 'Pathway alignment'],
        },
      ],
    },
    {
      /* The link INTO this stage runs both ways: outcomes feed back into
         Decisions & Development rather than simply ending the sequence.
         This is what the dashed return curve under the diagram used to
         say — it was removed because it connected nothing once mobile
         turned the stages into a swipe deck, and the relationship reads
         more directly on the connector itself. */
      feedback: true,
      nodes: [
        {
          tag: 'Outcome',
          step: '04',
          title: 'Outcomes',
          items: ['Learning', 'Transition', 'Performance', 'Mobility'],
        },
      ],
    },
  ],
  note: 'This public framework communicates the system logic without disclosing proprietary dimensions, items, scoring models, weights, or decision rules.',
};

export const articleSection = {
  title: 'Story From the Field',
  subtitle: 'Toolkits, observations, and field notes from our programs and research.',
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
