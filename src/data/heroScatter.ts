import resume from '../assets/photos/resume.png';
import youthGroup from '../assets/photos/youth.jpg';
import archivalCutout from '../assets/photos/Graduate.jpg';
import thankYou from '../assets/photos/thank-you.png';
import sdg10Badge from '../assets/photos/sdg10-badge.png';
import mission from '../assets/photos/mission.png';

export interface ScatterItem {
  id: string;
  kind: 'image' | 'quote' | 'label';
  top: string;
  left: string;
  rotate: number;
  depth: number; // 0 (far/slow) .. 1 (near/fast) — drives parallax + entry order
  zIndex: number;
  width?: string;
  src?: string;
  alt?: string;
  text?: string;
}

// A tight, overlapping cluster (not a wide spread) — positions are
// percentages of .hero-scatter-field, which is now a fixed, narrow
// (max 550px) box specifically so these percentages read as a clustered
// stack rather than spacing items across the full hero width. Array
// order doubles as the DOM stacking fallback, but zIndex is what
// actually controls the layering described alongside each item below.
export const heroScatter: ScatterItem[] = [
  // Rejection note — top-left, peeking out from behind the photos.
  {
    id: 'thank-you',
    kind: 'image',
    top: '0%',
    left: '8%',
    rotate: -1,
    depth: 0.4,
    zIndex: 2,
    width: '85px',
    src: thankYou,
    alt: 'A "thank you" rejection note',
  },
  // Graduate portrait — upper-middle, sits behind the torn note.
  {
    id: 'archival-cutout',
    kind: 'image',
    top: '6%',
    left: '30%',
    rotate: -2,
    depth: 0.5,
    zIndex: 5,
    width: '190px',
    src: archivalCutout,
    alt: 'Graduation portrait',
  },
  // Resume — sits directly below the thank-you note, angled down.
  {
    id: 'resume',
    kind: 'image',
    top: '34%',
    left: '5%',
    rotate: -8,
    depth: 0.6,
    zIndex: 8,
    width: '90px',
    src: resume,
    alt: 'Resume sticky note with a checklist',
  },
  // Torn mission note — right side of the cluster.
  {
    id: 'mission',
    kind: 'image',
    top: '2%',
    left: '58%',
    rotate: 3,
    depth: 0.7,
    zIndex: 10,
    width: '190px',
    src: mission,
    alt: 'Rasira Foundation — building the self-knowledge and confidence that opens the door',
  },
  // Youth photo — bottom-left, in front of the graduate portrait, but
  // shifted down and left far enough that it only clips the graduate's
  // bottom-left corner (background, not the cape) rather than sitting
  // over the middle of it.
  {
    id: 'youth-group',
    kind: 'image',
    top: '58%',
    left: '4%',
    rotate: -5,
    depth: 0.8,
    zIndex: 6,
    width: '150px',
    src: youthGroup,
    alt: 'Group celebrating on a dock',
  },
  // SDG badge — overlaps the bottom-right corner of the whole cluster.
  {
    id: 'sdg10-badge',
    kind: 'image',
    top: '54%',
    left: '76%',
    rotate: 6,
    depth: 0.9,
    zIndex: 20,
    width: '70px',
    src: sdg10Badge,
    alt: 'Sustainable Development Goal 10: Reduced Inequalities',
  },
];
