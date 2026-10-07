# Security requirements for every change

This repository publishes static browser-only games and tools on GitHub Pages.

- Work on a branch. Open a PR and require the existing `verify` check to succeed at its current head before merging. Never push directly to main or weaken Rulesets, CSP, CI checks or permissions.
- Before any commit/push, scan new content for credentials using Gitleaks with redacted output. CI runs after push, so it is not a substitute for this pre-upload inspection. Never include real tokens, private keys, personal email addresses or user input datasets in commits or test fixtures.
- Run `node tests/security.cjs`, `node tests/security-regression.cjs`, `node tests/release.cjs` and the tests for affected games/tools. New public HTML must carry the same CSP and fail-closed standalone guard. All public source files are auto-discovered by the security check.
- Keep user-supplied strings out of HTML parsing sinks. Use textContent/createElement. Do not introduce eval, Function constructors, remote scripts, automatic external data transmission or third-party trackers.
- Treat browser storage and URL parameters as untrusted. Validate type, range, size and state consistency. Impose bounds on expensive calculations and input collection.
- Reassess security before adding authentication, a backend, database, payment, file uploads, external APIs, third-party packages or a shared leaderboard. Do not silence checks or add exclusions just to make CI green. Explain the changed trust boundaries to the owner first.
- Review new dependencies and CI tools; pin actions to commit hashes and binary downloads to a version plus digest. Keep workflow credentials read-only. Review changes to security tests, AGENTS.md, SECURITY.md and workflows explicitly.
- Never claim CI proves the absence of vulnerabilities. Report checks performed and limitations. The Pages frame guard is supplemental, not HTTP frame-ancestors protection.

See SECURITY.md for the operating procedure and incident response.
