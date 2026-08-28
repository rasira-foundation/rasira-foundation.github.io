import { motion } from 'framer-motion';
import { systemFramework } from '../../data/siteContent';
import './systemFramework.css';
import { SPRING } from '../../lib/motion';
import { SectionHeading } from '../shared/SectionHeading';
import { AgencyWheel } from './AgencyWheel';

interface SystemFrameworkProps {
  /** Stays hidden until the splash + hero intro sequence has fully
   * finished, regardless of scroll position — see PillarsSection. */
  heroDone: boolean;
}

/** The public framework, now carried entirely by the Agency Spectrum dial
 * plus a disclaimer note.
 *
 * The four-stage terracotta diagram that used to sit here — Person Profile
 * and Opportunity Context feeding Evidence in Action, a Decisions pivot, and
 * Outcomes looping back — has been removed along with its cycle rail. It
 * described the same work at a coarser grain, and running both meant the
 * section explained itself twice before saying anything. The dial is the
 * sharper account: it names what the framework actually reads in a person
 * rather than the boxes the reading passes through.
 *
 * Everything that diagram needed is gone with it (FrameworkLoop, the diagram
 * and column CSS, and the `columns` / `total` / `loopLabel` fields), rather
 * than left behind unused. It is all recoverable from git if the coarser
 * view is ever wanted back. */
export function SystemFramework({ heroDone }: SystemFrameworkProps) {
  return (
    <motion.section
      className="system-framework"
      data-section="agency_framework"
      animate={{ opacity: heroDone ? 1 : 0 }}
      transition={SPRING}
      style={{ pointerEvents: heroDone ? 'auto' : 'none' }}
    >
      <div className="framework-inner">
        <SectionHeading title={systemFramework.title} subtitle={systemFramework.subtitle} />

        <AgencyWheel />
      </div>
    </motion.section>
  );
}
