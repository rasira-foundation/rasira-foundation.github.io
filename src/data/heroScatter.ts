import youthGroup from '../assets/photos/youth-group.png';
import archivalCutout from '../assets/photos/archival-cutout.png';
import openDoor from '../assets/photos/open-door.png';
import sdg10Badge from '../assets/photos/sdg10-badge.png';

export interface ScatterItem {
  id: string;
  kind: 'resume' | 'image' | 'quote' | 'label';
  top: string;
  left: string;
  rotate: number;
  depth: number; // 0 (far/slow) .. 1 (near/fast) — drives parallax + entry order
  width?: string;
  src?: string;
  alt?: string;
  text?: string;
}

// Organic, borderless anchor layout — no card chrome around the photography.
export const heroScatter: ScatterItem[] = [
  { id: 'resume', kind: 'resume', top: '4%', left: '6%', rotate: -8, depth: 0.9, width: '90px' },
  { id: 'question', kind: 'label', top: '3%', left: '30%', rotate: -2, depth: 0.5, text: 'Indonesia Emas 2045?' },
  {
    id: 'youth-group',
    kind: 'image',
    top: '28%',
    left: '25%',
    rotate: -6,
    depth: 0.8,
    width: '168px',
    src: youthGroup,
    alt: 'Group of smiling young people',
  },
  {
    id: 'archival-cutout',
    kind: 'image',
    top: '10%',
    left: '45%',
    rotate: 5,
    depth: 0.85,
    width: '240px',
    src: archivalCutout,
    alt: 'Archival cut-out photograph',
  },
  {
    id: 'open-door',
    kind: 'image',
    top: '2%',
    left: '80%',
    rotate: 3,
    depth: 0.6,
    width: '92px',
    src: openDoor,
    alt: 'Open door revealing sky',
  },
  {
    id: 'sdg10-badge',
    kind: 'image',
    top: '32%',
    left: '78%',
    rotate: -4,
    depth: 0.55,
    width: '68px',
    src: sdg10Badge,
    alt: 'Sustainable Development Goal 10: Reduced Inequalities',
  },
];
