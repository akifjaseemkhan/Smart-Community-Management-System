/* ============================================================
   SCMS — Frontend runtime configuration
   ------------------------------------------------------------
   The UI talks to a small REST API (/api/login, /api/visitors …).

   • useMock = true  → every /api/* call is answered by an in-browser
     mock (js/mock-api.js) backed by localStorage. No server needed,
     so the app runs on Netlify / GitHub Pages / a double-clicked file.

   • useMock = false → calls go to the real Java backend at `apiBase`.
     Deploy the WAR (see /backend + /docs/HOW_TO_RUN.txt), point
     `apiBase` at it, and flip this to false.
   ============================================================ */
window.SCMS_CONFIG = {
  apiBase: 'http://localhost:8080/scms/api',
  useMock: true
};

/* Optional override without editing this file:
   add ?mock=off (or ?mock=on) to the URL. */
try {
  var _m = new URLSearchParams(location.search).get('mock');
  if (_m === 'off') window.SCMS_CONFIG.useMock = false;
  if (_m === 'on')  window.SCMS_CONFIG.useMock = true;
} catch (e) {}
