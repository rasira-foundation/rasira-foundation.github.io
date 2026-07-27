export interface ScatterItem {
  id: string;
  kind: 'resume' | 'photo' | 'quote' | 'label' | 'door' | 'sdg';
  top: string;
  left: string;
  rotate: number;
  depth: number; // 0 (far/slow) .. 1 (near/fast) — drives parallax + entry order
  width?: string;
  caption?: string;
  text?: string;
}

// Positions mirror the reference moodboard layout. Swap `caption`/photo
// treatment for real photography in src/assets/photos when available —
// see README for the swap-in path.
export const heroScatter: ScatterItem[] = [
  { id: 'resume', kind: 'resume', top: '4%', left: '8%', rotate: -8, depth: 0.9, width: '92px' },
  { id: 'question', kind: 'label', top: '6%', left: '24%', rotate: -2, depth: 0.5, text: 'Indonesia Emas 2045?' },
  { id: 'group', kind: 'photo', top: '16%', left: '27%', rotate: -4, depth: 0.75, width: '150px', caption: 'field visit — East Java' },
  { id: 'quote', kind: 'quote', top: '20%', left: '2%', rotate: -3, depth: 0.35, text: '"Not for people like me."' },
  { id: 'elder', kind: 'photo', top: '10%', left: '48%', rotate: 3, depth: 0.85, width: '180px', caption: 'home visit, rural program' },
  { id: 'door', kind: 'door', top: '2%', left: '78%', rotate: 4, depth: 0.6, width: '78px' },
  { id: 'sdg', kind: 'sdg', top: '24%', left: '76%', rotate: -3, depth: 0.65, width: '60px' },
];
