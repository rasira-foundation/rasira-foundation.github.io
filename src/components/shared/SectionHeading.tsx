import { BlurRevealText } from './BlurRevealElement';
import './sectionHeading.css';

interface SectionHeadingProps {
  title: string;
  subtitle: string;
}

/**
 * Title and subtitle — the header both the article hub and the framework
 * diagram sit under.
 *
 * One shared component rather than a block of markup in each section: the
 * two are meant to read as the same kind of thing, and a copy-pasted
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
      <BlurRevealText className="section-heading-subtitle" delay={0.12}>
        {subtitle}
      </BlurRevealText>
    </header>
  );
}
