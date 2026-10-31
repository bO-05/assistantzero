export const GUEST_DEMO_ASSETS = new Set([
  '/demo/index.html',
  '/demo/demo.css',
  '/demo/demo.mjs',
]);

export const GUEST_DEMO_CSP = [
  "default-src 'none'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'none'",
  "form-action 'none'",
  "base-uri 'none'",
  "frame-ancestors 'none'",
].join('; ');
