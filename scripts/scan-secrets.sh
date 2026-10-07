#!/usr/bin/env bash
set -euo pipefail
# Pinned official release and archive digest; no third-party action or credentials.
scan_tmp=$(mktemp -d)
trap 'rm -rf "$scan_tmp"' EXIT
curl --fail --silent --show-error --location --retry 2 --max-time 120 \
  https://github.com/gitleaks/gitleaks/releases/download/v8.30.1/gitleaks_8.30.1_linux_x64.tar.gz \
  -o "$scan_tmp/gitleaks.tar.gz"
printf '%s  %s\n' '551f6fc83ea457d62a0d98237cbad105af8d557003051f41f3e7ca7b3f2470eb' "$scan_tmp/gitleaks.tar.gz" | sha256sum --check --status
tar --no-same-owner -xzf "$scan_tmp/gitleaks.tar.gz" -C "$scan_tmp" gitleaks
node tests/secret-scanner.cjs "$scan_tmp/gitleaks"
# Redact findings even in CI logs. Scan both checkout and all fetched Git refs.
"$scan_tmp/gitleaks" git --redact=100 --no-banner --log-opts='--all' .
"$scan_tmp/gitleaks" dir --redact=100 --no-banner .
