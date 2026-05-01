// EA Toolkit — Tool 1 (Meeting Brief Generator) frontend controller.
//
// Flow: form submit → build prompt → POST to Cloudflare Worker → render Markdown.
// The Worker holds the Anthropic API key as a secret; the browser never sees it.

(function () {
  'use strict';

  // ---- Configuration ---------------------------------------------------------
  // Paste the Cloudflare Worker URL here after running `wrangler deploy`.
  // Example: "https://ea-toolkit-proxy.lisa-myburgh.workers.dev"
  const WORKER_URL = "https://ea-toolkit-proxy.lisa-775.workers.dev";

  const PROMPT_TEMPLATE = `You are a senior executive assistant preparing a pre-meeting brief for an executive who has 10 minutes to skim it before a call.

CALENDAR / MEETING CONTEXT:
{{meeting_context}}

PERSON THEY'RE MEETING:
{{person_profile}}

Generate a brief with exactly these five sections, in this order, using the section headings shown.

## Who they are
2–3 sentences distilled from the person's profile. Surface specific signal — current role, length in field, prior moves, public stances. Avoid generic descriptors.

## Meeting context
2–4 sentences framing what's actually being discussed and what's likely beneath the surface. Separate the stated agenda from the implicit one. Be honest about ambiguity if the inputs don't reveal motive.

## Suggested talking points
4–6 bullets. Each should be specific to this meeting and this person — not generic meeting advice. Lead with what your exec should establish, ask about, or be ready for.

## Questions to ask
4–6 sharp, specific questions. Avoid questions answerable from the inputs already provided. Avoid yes/no questions. Each should open useful information.

## Red flags & sensitivities
Anything to avoid or be careful around, drawn specifically from this profile or context (e.g. public stances they've taken, sensitive past projects, unusual signals in the invite). If the inputs reveal nothing concerning, write "None identified from the inputs provided." — do not invent.

Be concise. Use Markdown — \`## Heading\` for the five section titles, \`- bullet\` for lists. Do not include preamble before the first heading or summary after the last section. Do not wrap your output in code fences.`;

  // ---- DOM refs --------------------------------------------------------------
  const form = document.getElementById('brief-form');
  const meetingInput = document.getElementById('meeting_context');
  const personInput = document.getElementById('person_profile');
  const submitBtn = document.getElementById('generate-btn');
  const outputSection = document.getElementById('output-section');
  const outputContent = document.getElementById('brief-content');
  const outputHeader = outputSection?.querySelector('.output-header');

  if (!form || !meetingInput || !personInput || !submitBtn || !outputSection || !outputContent) {
    return;
  }

  // ---- Helpers ---------------------------------------------------------------
  function escapeHtml(s) {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderInline(text) {
    let s = escapeHtml(text);
    s = s.replace(/\*\*([^\n*][^\n]*?)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/(^|[^\*])\*([^\n*][^\n]*?)\*(?!\*)/g, '$1<em>$2</em>');
    return s;
  }

  function renderMarkdown(md) {
    const lines = md.replace(/\r\n/g, '\n').split('\n');
    const out = [];
    let listOpen = false;
    let paraBuf = [];

    function flushPara() {
      if (paraBuf.length) {
        out.push(`<p>${renderInline(paraBuf.join(' '))}</p>`);
        paraBuf = [];
      }
    }
    function closeList() {
      if (listOpen) {
        out.push('</ul>');
        listOpen = false;
      }
    }

    for (const raw of lines) {
      const line = raw.trimEnd();
      if (!line.trim()) {
        flushPara();
        closeList();
        continue;
      }
      const h2 = line.match(/^##\s+(.*)$/);
      const h3 = line.match(/^###\s+(.*)$/);
      const bullet = line.match(/^\s*[-•]\s+(.+)$/);
      if (h2) {
        flushPara();
        closeList();
        out.push(`<h2>${renderInline(h2[1])}</h2>`);
      } else if (h3) {
        flushPara();
        closeList();
        out.push(`<h3>${renderInline(h3[1])}</h3>`);
      } else if (bullet) {
        flushPara();
        if (!listOpen) {
          out.push('<ul>');
          listOpen = true;
        }
        out.push(`<li>${renderInline(bullet[1])}</li>`);
      } else {
        closeList();
        paraBuf.push(line.trim());
      }
    }
    flushPara();
    closeList();
    return out.join('\n');
  }

  function setLoading(isLoading) {
    submitBtn.classList.toggle('loading', isLoading);
    submitBtn.disabled = isLoading;
    submitBtn.querySelector('.btn-label').textContent = isLoading ? 'Generating' : 'Generate brief';
    meetingInput.disabled = isLoading;
    personInput.disabled = isLoading;
  }

  function showOutput({ kind, html, headerEyebrow, headerMeta }) {
    if (outputHeader) {
      const eyebrow = outputHeader.querySelector('.eyebrow');
      const meta = outputHeader.querySelector('.output-meta');
      if (eyebrow && headerEyebrow) {
        const dot = '<span class="dot"></span>';
        eyebrow.innerHTML = `${dot}${escapeHtml(headerEyebrow)}`;
      }
      if (meta) meta.textContent = headerMeta || '';
    }
    outputContent.className = `brief brief--${kind}`;
    outputContent.innerHTML = html;
    outputSection.hidden = false;
    outputSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function showError(message) {
    showOutput({
      kind: 'error',
      html: `<p class="error-text">${escapeHtml(message)}</p>`,
      headerEyebrow: 'Error',
      headerMeta: 'Something went wrong generating the brief.',
    });
  }

  function workerNotConfigured() {
    return WORKER_URL.includes('WORKER-URL-NOT-YET-CONFIGURED');
  }

  // ---- Submit ----------------------------------------------------------------
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    if (submitBtn.disabled) return;

    const meeting = meetingInput.value.trim();
    const person = personInput.value.trim();
    if (!meeting || !person) {
      showError('Please fill in both fields before generating.');
      return;
    }

    if (workerNotConfigured()) {
      showError(
        'The Cloudflare Worker URL has not been configured yet. ' +
        'This site is still being set up — check back shortly, or fork the repo and follow the README to deploy your own.'
      );
      return;
    }

    const prompt = PROMPT_TEMPLATE
      .replace('{{meeting_context}}', meeting)
      .replace('{{person_profile}}', person);

    setLoading(true);
    showOutput({
      kind: 'loading',
      html: '<p class="loading-text">Generating brief…</p>',
      headerEyebrow: 'Brief',
      headerMeta: 'Sending to Claude — usually takes 5–15 seconds.',
    });

    try {
      const res = await fetch(WORKER_URL + '/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        showError(data?.error || `Request failed (${res.status}). Please try again.`);
        return;
      }

      const text = data?.text;
      if (typeof text !== 'string' || !text.trim()) {
        showError('The model returned an empty response. Please try again.');
        return;
      }

      showOutput({
        kind: 'success',
        html: renderMarkdown(text),
        headerEyebrow: 'Brief',
        headerMeta: 'Generated by Claude. Review before sending to your exec.',
      });
    } catch (err) {
      showError("Couldn't reach the Worker. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  });
})();
