import { motion } from 'framer-motion';
import { BlurRevealText } from '../shared/BlurRevealElement';
import { systemFramework } from '../../data/siteContent';
import './systemFramework.css';
import { IN_VIEW, SPRING } from '../../lib/motion';

interface SystemFrameworkProps {
  /** Stays hidden until the splash + hero intro sequence has fully
   * finished, regardless of scroll position — see PillarsSection. */
  heroDone: boolean;
}

/** The public-framework diagram: four stages across, five nodes total
 * (stage 01 splits into 01a Person Profile / 01b Opportunity Context),
 * joined by connector badges that straddle each stage rule, plus a
 * disclaimer note.
 *
 * The last connector is bidirectional rather than a forward arrow —
 * outcomes feed back into Decisions & Development. That relationship used
 * to be drawn as a dashed return curve beneath the diagram; it was removed
 * because it connected nothing once mobile turned the stages into a
 * horizontal swipe deck, and it now lives on the connector itself, which
 * survives that layout change.
 *
 * Text colour and size are fixed and explicit on every node, not dependent
 * on whatever is behind the card. */
export function SystemFramework({ heroDone }: SystemFrameworkProps) {
  return (
    <motion.section
      className="system-framework"
      animate={{ opacity: heroDone ? 1 : 0 }}
      transition={SPRING}
      style={{ pointerEvents: heroDone ? 'auto' : 'none' }}
    >
      <div className="framework-inner">
        {/* Just a spacing wrapper now — each .framework-box below carries
            its own explicit background and text color, so nothing here
            needs to guarantee contrast against ProductionGradient3D
            itself. */}
        <div className="framework-card">
          <div className="framework-diagram">
            {systemFramework.columns.map((column, columnIndex) => (
              <div
                key={column.nodes[0].title}
                className={[
                  'framework-column',
                  'pivot' in column && column.pivot ? 'framework-column--pivot' : '',
                  column.nodes.length > 1 ? 'framework-column--split' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {/* Forward connector, straddling this column's left edge.
                    Skipped on the first column, which nothing flows into.
                    aria-hidden because the sequence is already carried by
                    each node's step counter — a screen reader gains
                    nothing from four loose arrow glyphs. */}
                {columnIndex > 0 && (
                  <span
                    className={
                      'feedback' in column && column.feedback
                        ? 'framework-connector framework-connector--feedback'
                        : 'framework-connector'
                    }
                    /* Not aria-hidden like the one-way arrows: those only
                       restate the sequence the step counters already give,
                       but this one carries information nothing else does —
                       that the last stage feeds back into the third. */
                    role="img"
                    aria-label={
                      'feedback' in column && column.feedback
                        ? 'Feeds back into the previous stage'
                        : undefined
                    }
                    aria-hidden={'feedback' in column && column.feedback ? undefined : true}
                  >
                    {'feedback' in column && column.feedback ? '⇄' : '→'}
                  </span>
                )}

                {column.nodes.map((node, nodeIndex) => {
                  /* Stagger is computed across the whole diagram rather
                     than per column, so the five nodes still reveal in
                     reading order instead of restarting at each column. */
                  const delay = columnIndex * 0.1 + nodeIndex * 0.06;
                  return (
                    <motion.div
                      key={node.title}
                      className="framework-box"
                      initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
                      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      viewport={IN_VIEW}
                      transition={{ ...SPRING, delay }}
                    >
                      <div className="framework-box-body">
                        {/* Tag and step counter sit ABOVE the title — they
                            label the stage, so they read as a header for
                            what follows rather than as a footnote to it. */}
                        <div className="framework-box-meta">
                          <span className="framework-box-tag">[{node.tag}]</span>
                          <span className="framework-box-step">{`${node.step} / ${systemFramework.total}`}</span>
                        </div>
                        <BlurRevealText as="h3" className="framework-box-title" delay={delay}>
                          {node.title}
                        </BlurRevealText>
                        {/* One flowing line joined by pipes, not a stacked
                            list. Wrapping is natural rather than forced, so
                            a node with four short items takes two lines
                            instead of four — which is what lets the divider
                            rule go without the block collapsing into an
                            undifferentiated column of text.

                            A single BlurRevealText rather than one per item:
                            it already reveals word by word, so the sequence
                            reads the same while the separators travel with
                            the words they sit between. */}
                        <BlurRevealText className="framework-box-items" delay={delay}>
                          {node.items.join(' | ')}
                        </BlurRevealText>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ))}
          </div>

        </div>

        <p className="framework-note">{systemFramework.note}</p>
      </div>
    </motion.section>
  );
}
