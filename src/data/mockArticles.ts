import type { Article } from '../lib/sheets';

/**
 * Fallback content shown when VITE_SHEET_ID isn't configured, or the sheet
 * fetch fails (offline, sheet not shared publicly, etc). Lets the site run
 * and look right in local dev without a live spreadsheet. Replace by
 * publishing rows in the real sheet — see README for the column schema.
 */
export const mockArticles: Article[] = [
  {
    slug: 'untangling-org-structure',
    title: 'We untangle orgs',
    excerpt: 'Change management that turns mess into usable structure.',
    content:
      'Most workforce programs fail quietly, in the handoff between the field team and the partner organization. This piece walks through the mapping exercise we run with every new community partner before a single session is designed.',
    category: 'Framework',
    coverImage: null,
    author: 'Rasira Foundation',
    date: '2026-05-12',
  },
  {
    slug: 'adoption-that-sticks',
    title: 'Adoption that sticks',
    excerpt: 'A field-tested rollout deck, built for teams without a dedicated ops function.',
    content:
      'Real adoption is not a deck that sits in a drive. It is a sequence of small, observed wins. Here is the checklist we hand to partners in week one, and why we resist adding a slide to it.',
    category: 'Toolkit',
    coverImage: null,
    author: 'Rasira Foundation',
    date: '2026-04-30',
  },
  {
    slug: 'affordable-design-lasting-impact',
    title: 'Affordable design, lasting impact',
    excerpt: 'Frugal innovation beats novelty. Notes from the field on what actually gets used.',
    content:
      'Technology adoption in rural programs rarely fails because the tool was wrong. It fails because nobody budgeted for the six months after launch. This is what we changed after watching three pilots stall.',
    category: 'Highlight',
    coverImage: null,
    author: 'Rasira Foundation',
    date: '2026-06-02',
  },
  {
    slug: 'measuring-what-moves',
    title: 'Measuring what moves',
    excerpt: 'Our before/during/after framework for programs without a research team.',
    content:
      'We measure before, during, and after every program so we can see what moves, what does not, and for whom. This article breaks down the three checkpoints and the two metrics we refuse to drop, even under budget pressure.',
    category: 'Article',
    coverImage: null,
    author: 'Rasira Foundation',
    date: '2026-03-18',
  },
];
