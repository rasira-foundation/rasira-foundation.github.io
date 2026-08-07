import type { ReactNode } from 'react';
import { resolveImageUrl } from './sheets';

// Standalone `![alt](url)` on its own line — same Drive-link handling as
// the Cover Image column (see resolveImageUrl in sheets.ts), so a Drive
// share link pasted here works exactly the same way.
const IMAGE_LINE = /^!\[([^\]]*)\]\((\S+)\)$/;

/**
 * Deliberately small markdown subset for article bodies: `#`/`##` headers,
 * `> ` blockquotes, `- `/`* ` lists, `![alt](url)` images, and blank-line-
 * separated paragraphs. No inline formatting, no external dependency —
 * content from the Sheet is plain enough that this covers it.
 */
export function parseMarkdownLite(content: string): ReactNode[] {
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const blocks: ReactNode[] = [];
  let i = 0;
  let key = 0;

  const isListLine = (line: string) => line.startsWith('- ') || line.startsWith('* ');
  const isSpecialLine = (line: string) =>
    line.trim() === '' ||
    line.startsWith('# ') ||
    line.startsWith('## ') ||
    line.startsWith('> ') ||
    isListLine(line) ||
    IMAGE_LINE.test(line.trim());

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === '') {
      i++;
      continue;
    }

    const imageMatch = line.trim().match(IMAGE_LINE);
    if (imageMatch) {
      const [, alt, url] = imageMatch;
      blocks.push(
        <img key={key++} className="article-detail-inline-image" src={resolveImageUrl(url) ?? url} alt={alt} loading="lazy" />,
      );
      i++;
      continue;
    }

    if (line.startsWith('## ')) {
      blocks.push(<h3 key={key++}>{line.slice(3)}</h3>);
      i++;
      continue;
    }

    if (line.startsWith('# ')) {
      blocks.push(<h2 key={key++}>{line.slice(2)}</h2>);
      i++;
      continue;
    }

    if (line.startsWith('> ')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('> ')) {
        quoteLines.push(lines[i].slice(2));
        i++;
      }
      blocks.push(<blockquote key={key++}>{quoteLines.join(' ')}</blockquote>);
      continue;
    }

    if (isListLine(line)) {
      const items: string[] = [];
      while (i < lines.length && isListLine(lines[i])) {
        items.push(lines[i].slice(2));
        i++;
      }
      blocks.push(
        <ul key={key++}>
          {items.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>,
      );
      continue;
    }

    const paraLines: string[] = [];
    while (i < lines.length && !isSpecialLine(lines[i])) {
      paraLines.push(lines[i]);
      i++;
    }
    blocks.push(<p key={key++}>{paraLines.join(' ')}</p>);
  }

  return blocks;
}
