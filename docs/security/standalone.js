'use strict';
// Defense in depth for Pages: this is not an HTTP frame-ancestors policy.
// Fail closed when framed, sandboxed, or unable to inspect the window relation.
(() => {
  try {
    if (window.self === window.top) {
      document.documentElement.classList.remove('standalone-pending');
    }
  } catch (_) { /* Keep the document hidden. */ }
})();
