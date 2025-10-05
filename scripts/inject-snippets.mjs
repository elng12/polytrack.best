import { promises as fs } from 'node:fs';
import { globby } from 'globby';

async function load(path) {
  return fs.readFile(path, 'utf8');
}

function replaceFirstHeader(html, header) {
  const headerRegex = /<header[\s\S]*?<\/header>/i;
  if (headerRegex.test(html)) {
    return html.replace(headerRegex, header);
  }
  // inject after opening body tag if no header found
  const bodyOpen = /<body[^>]*>/i;
  if (bodyOpen.test(html)) {
    return html.replace(bodyOpen, (m) => m + '\n' + header + '\n');
  }
  return html;
}

function replaceLastFooter(html, footer) {
  const matches = [...html.matchAll(/<footer[\s\S]*?<\/footer>/gi)];
  if (matches.length) {
    const last = matches[matches.length - 1];
    const start = last.index;
    const end = start + last[0].length;
    return html.slice(0, start) + footer + html.slice(end);
  }
  // inject before closing body if no footer found
  const bodyClose = /<\/body>/i;
  if (bodyClose.test(html)) {
    return html.replace(bodyClose, '\n' + footer + '\n</body>');
  }
  return html;
}

async function run() {
  const header = await load('header.html');
  const footer = await load('footer.html');
  const files = await globby(['*.html', 'blog/*.html'], { gitignore: true });

  let changed = 0;
  for (const file of files) {
    const html = await load(file);
    let out = replaceFirstHeader(html, header);
    out = replaceLastFooter(out, footer);
    if (out !== html) {
      await fs.writeFile(file, out, 'utf8');
      changed++;
      console.log('Injected:', file);
    } else {
      console.log('No change:', file);
    }
  }

  console.log(`Done. Files changed: ${changed}`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});