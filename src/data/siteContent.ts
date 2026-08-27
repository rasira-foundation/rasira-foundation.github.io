// Copy pulled directly from the design brief / mockups. Update freely —
// this file is the only place page copy lives outside the Sheet-fed articles.

export const CONTACT_EMAIL = 'rasira.foundation@gmail.com';

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
  subtitle: 'Agency is observed, in how behaviour adapts.',
  /* `columns`, `total` and `loopLabel` were removed with the four-stage
     diagram they described. The section is carried by the Agency Spectrum
     dial below instead — see the note in SystemFramework.tsx. */
  note: 'This public framework communicates the system logic without disclosing proprietary dimensions, items, scoring models, weights, or decision rules.',
};

/* The Agency Spectrum dial that sits under the framework diagram.
 *
 * Ordered as a movement from inside the person outward into the world:
 * whether they believe they can, whether the choice is theirs, whether they
 * can see a route, and whether anything around them responds. The dial
 * colours that sequence with the site's own dawn-to-dusk sky ramp, warm to
 * cool, so the palette carries the same argument the copy does.
 *
 * Each level is identified by its question alone. The L1..L4 codes and the
 * lever counts are both gone: numbering them implied a scored ladder rather
 * than four things looked at together.
 *
 * The levers are named without their originating researchers, and without
 * the internal annotations that sat beside some of them. They read as a
 * working vocabulary here rather than as a literature review or a scoring
 * sheet. */
export const agencySpectrum = {
  centerLabel: 'Agency',
  centerNote: ['observed as evidenced', 'adapting behaviour'],
  levels: [
    {
      id: 'l1',
      question: 'CAN I?',
      title: 'Capability beliefs',
      levers: [
        'Efficacy: for the work, for the process',
        'Malleability belief',
        'Psychological capital',
        'Self-esteem',
      ],
    },
    {
      id: 'l2',
      question: 'WILL I?',
      title: 'Ownership',
      levers: ['Autonomy', 'Possible selves', 'Values', 'Agency thinking'],
    },
    {
      id: 'l3',
      question: 'HOW DO I?',
      title: 'Pathways & volition',
      levers: ['If-then plans', 'Mental contrasting', 'Pathways thinking', 'Proximal goals'],
    },
    {
      id: 'l4',
      question: 'DOES THE WORLD RESPOND?',
      title: 'Standing',
      levers: [
        'Outcome expectations',
        'Critical consciousness',
        'Belonging',
        'Collective efficacy',
        'Proxy agency',
      ],
    },
  ],
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
