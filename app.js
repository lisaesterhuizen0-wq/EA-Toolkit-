// EA Toolkit — vanilla JS controller.
// Step 2 (current): form-submit no-op for design review.
// Step 4 (next session): replace handler with fetch-to-Worker + Markdown render.

(function () {
  'use strict';

  const form = document.getElementById('brief-form');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    // Wiring to the Cloudflare Worker lands in step 4.
  });
})();
