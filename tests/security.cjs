const fs = require('node:fs');
const assert = require('node:assert/strict');
const pages = ['index.html', 'docs/index.html', 'docs/games/kagi-to-tobira/index.html', 'docs/games/squad-front/index.html'];
for (const page of pages) {
  const html = fs.readFileSync(page, 'utf8');
  const csp = html.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/);
  assert(csp, `${page}: CSP missing`);
  for (const directive of ["default-src 'none'", "script-src 'self'", "connect-src 'none'", "object-src 'none'", "base-uri 'self'", "form-action 'none'"]) {
    assert(csp[1].split(';').map(s => s.trim()).includes(directive), `${page}: ${directive}`);
  }
  assert(!/unsafe-eval|script-src[^;]*unsafe-inline/.test(csp[1]), `${page}: unsafe scripts`);
  assert(!/\son\w+\s*=/i.test(html), `${page}: inline event handler`);
  for (const script of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const src = script[1].match(/src="([^"]+)"/);
    assert(src && !/^\w+:|^\/\//.test(src[1]) && !script[2].trim(), `${page}: script must be a local file`);
  }
}
const workflow = fs.readFileSync('.github/workflows/pages.yml', 'utf8');
assert(workflow.includes('pull_request:') && workflow.includes('persist-credentials: false'));
assert(/actions\/checkout@[a-f0-9]{40}/.test(workflow));
console.log('PASS: script restrictions, local resources, CSP and workflow safeguards.');
