import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import {
  heroIntro,
  pillars,
  pillarsSection,
  systemFramework,
  articleSection,
  collabsSection,
  partnerSection,
  donationSection,
} from './src/data/siteContent.ts' // .ts extension required: this project is module:nodenext

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/**
 * Writes the site's copy into index.html as real HTML at build time.
 *
 * WHY NOT A HEADLESS BROWSER. The usual way to prerender a SPA is to load it
 * in Puppeteer and snapshot the DOM. That is the wrong tool here, and not
 * only because it would pull a ~300MB Chromium into every CI run. Every
 * section on this site carries initial={{ opacity: 0 }}, which Framer writes
 * as an inline style — so a snapshot (and React SSR equally, for the same
 * reason) captures opacity:0 on everything. Search engines discount content
 * hidden that way, so the snapshot approach produces a page full of text
 * that Google does not trust. It also depends on the runtime Sheets fetch
 * finishing inside the build.
 *
 * Generating the markup from the data instead avoids all of that: nothing is
 * hidden, nothing is timing-dependent, and there is no browser. It works
 * because siteContent.ts is plain data and Vite transpiles this config file
 * together with its local imports, so the copy can simply be imported here.
 * Both this and the React components read that one file, so they cannot
 * drift apart.
 *
 * WHAT IS NOT COVERED: the articles. They are fetched from Sheets at runtime
 * and have no data to import and no URLs of their own. Giving them real
 * routes is the separate, larger piece of work.
 *
 * The markup lands inside #root. createRoot() clears its container on first
 * render, so React replaces all of this the moment it mounts — no hydration,
 * no mismatch, and nothing to keep in sync at runtime.
 */
function prerenderContent(): Plugin {
  return {
    name: 'rasira-prerender-content',
    apply: 'build',
    transformIndexHtml(html) {
      const tags = heroIntro.tags.map((t) => esc(t)).join(' · ')

      const pillarBlocks = pillars
        .map((p) => {
          const body = p.items
            ? `<ul>${p.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`
            : `<p>${esc(p.body ?? '')}</p>`
          return `<section><h3>${esc(p.label)}</h3>${body}</section>`
        })
        .join('')

      /* The columns are not a uniform type — some carry `pivot`, some
         `feedback` — so the union defeats inference on flatMap. The node
         shape itself IS uniform, which is all this needs. */
      type Node = { tag: string; step: string; title: string; items: string[] }
      const frameworkNodes = systemFramework.columns
        .flatMap((c): Node[] => c.nodes)
        .map(
          (n) =>
            `<section><h3>${esc(n.step)} · ${esc(n.title)}</h3>` +
            `<p>${esc(n.tag)}: ${n.items.map((i) => esc(i)).join(', ')}</p></section>`,
        )
        .join('')

      const shell = `
    <div class="static-shell">
      <header>
        <h1>${esc(heroIntro.title)}</h1>
        <p>${esc(heroIntro.paragraph)}</p>
        <p>${tags}</p>
      </header>

      <section>
        <h2>${esc(pillarsSection.title)}</h2>
        ${pillarBlocks}
      </section>

      <section>
        <h2>${esc(systemFramework.title)}</h2>
        <p>${esc(systemFramework.subtitle)}</p>
        ${frameworkNodes}
        <p>${esc(systemFramework.loopLabel)}</p>
        <p>${esc(systemFramework.note)}</p>
      </section>

      <section>
        <h2>${esc(articleSection.title)}</h2>
        <p>${esc(articleSection.subtitle)}</p>
      </section>

      <section>
        <h2>${esc(collabsSection.heading)}</h2>
        <p>${esc(collabsSection.body)}</p>
      </section>

      <section>
        <h2>${esc(partnerSection.partner.role)}</h2>
        <p>${esc(partnerSection.partner.lead)}</p>
        <p>${esc(partnerSection.partner.body)}</p>
      </section>

      <section>
        <h2>${esc(donationSection.eyebrow)} · ${esc(donationSection.eyebrowSub)}</h2>
        <p>${esc(donationSection.lead)}</p>
        <p>${esc(donationSection.body)}</p>
      </section>
    </div>`

      return html.replace('<div id="root"></div>', `<div id="root">${shell}\n    </div>`)
    },
  }
}

// rasira-foundation.github.io is an organization root page, served at "/"
export default defineConfig({
  base: '/',
  plugins: [react(), prerenderContent()],
  server: {
    port: 5173,
    strictPort: true, // Fail loudly instead of silently drifting to 5174/5175
  },
})
