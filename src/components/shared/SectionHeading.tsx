import { BlurRevealText } from './BlurRevealElement';
import './sectionHeading.css';

interface SectionHeadingProps {
  title: string;
  /** Optional — the pillars panel heads itself with a title alone. The
   * element is omitted entirely rather than rendered empty, so the
   * heading's own bottom spacing is all that separates it from what
   * follows. */
  subtitle?: string;
}

/**
 * Title, with an optional subtitle — the header the article hub, the
 * framework diagram and the pillars panel all sit under.
 *
 * One shared component rather than a block of markup in each section: the
 * three are meant to read as the same kind of thing, and a copy-pasted
 * version drifts the moment one of them is adjusted.
 *
 * The divider rule between title and subtitle was removed — with only two
 * short lines it was separating things that already read as one block, and
 * it forced the spacing wider than the pair needs.
 */
export function SectionHeading({ title, subtitle }: SectionHeadingProps) {
  return (
    <header className="section-heading">
      <BlurRevealText as="h2" className="section-heading-title">
        {title}
      </BlurRevealText>
      {subtitle && (
        <BlurRevealText className="section-heading-subtitle" delay={0.12}>
          {subtitle}
        </BlurRevealText>
      )}
    </header>
  );
}
