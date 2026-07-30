import type { Article } from '../lib/sheets';

/**
 * Fallback content shown when VITE_SHEET_ID isn't configured, or the sheet
 * fetch fails (offline, sheet not shared publicly, etc). Lets the site run
 * and look right in local dev without a live spreadsheet. Replace by
 * publishing rows in the real sheet — see README for the column schema.
 */
export const mockArticles: Article[] = [
  {
    slug: 'change-management',
    title: 'We untangle orgs. Change management that turns mess into usable structure.',
    excerpt: 'Change management that turns mess into usable structure.',
    content:
      'Most workforce programs fail quietly, in the handoff between the field team and the partner organization. This piece walks through the mapping exercise we run with every new community partner before a single session is designed.',
    category: 'Toolkit',
    coverImage: null,
    author: 'Rasira Foundation',
    date: '2026-05-12',
    readTime: '3 min read',
  },
  {
    slug: 'real-adoption',
    title: 'Real adoption decides whether a deck sits in a drive or changes a life.',
    excerpt: 'A field-tested rollout checklist, built for teams without a dedicated ops function.',
    content:
      'Real adoption is not a deck that sits in a drive. It is a sequence of small, observed wins. Here is the checklist we hand to partners in week one, and why we resist adding a slide to it.',
    category: 'Article',
    coverImage: null,
    author: 'Rasira Foundation',
    date: '2026-04-30',
    readTime: '2 min read',
  },
  {
    slug: 'frugal-innovation',
    title: 'We aim for lasting impact. Affordable design, frugal innovation until tech real adoption happens.',
    excerpt: 'Frugal innovation beats novelty. Notes from the field on what actually gets used.',
    content: `# Why novelty loses

Technology adoption in rural programs rarely fails because the tool was wrong. It fails because nobody budgeted for the six months after launch.

## What we changed

After watching three pilots stall at the same point, we rebuilt the rollout around three checkpoints instead of one big launch day.

- Week 1: a single supervised session, no take-home device
- Week 4: unsupervised use, checked against a short call
- Month 3: adoption re-measured against the original baseline

> The tool was never the bottleneck. The six months after launch was.

That reframing changed what we budget for, and it is the one line item partners no longer try to cut.`,
    category: 'Highlight',
    coverImage: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=800',
    author: 'Rasira Foundation',
    date: '2026-06-02',
    readTime: '4 min read',
  },
  {
    slug: 'fieldwork-notes',
    title: 'Fieldwork notes on how young jobseekers build agency before making high-stakes choices.',
    excerpt: 'Notes from the field on how confidence gets built before the choice that matters.',
    content:
      'Agency is not a personality trait we measure once. It is built in small, reversible decisions before the high-stakes one arrives. This piece walks through the sequence of low-risk practice tasks we run with young jobseekers, and what we watch for in each.',
    category: 'Article',
    coverImage: null,
    author: 'Rasira Foundation',
    date: '2026-03-18',
    readTime: '3 min read',
  },
];
