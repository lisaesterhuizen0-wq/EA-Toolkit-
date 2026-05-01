# 01 — Briefing Doc Generator

Turn raw context into a polished first draft of a pre-meeting brief.

## Inputs

- `{meeting}` — Meeting title and attendees (e.g. "Q3 Strategy Review — CEO, CFO, VP Sales")
- `{goal}` — What this meeting is trying to achieve
- `{emails}` — Relevant emails / Slack threads (key excerpts)
- `{actions}` — Open action items from past meetings
- `{okrs}` — Exec's current OKRs / priorities

## Prompt

```
You are an expert Executive Assistant helping prepare a meeting briefing document.

Meeting: {meeting}
Goal: {goal}
Relevant email/Slack context: {emails}
Open action items: {actions}
Exec's OKRs/Priorities: {okrs}

Create a structured briefing document with these sections:
1. **Meeting Overview** — 2-3 sentence summary of purpose and context
2. **Key Background** — critical context the exec needs walking in
3. **Open Action Items** — unresolved items relevant to this meeting
4. **Likely Questions the Exec Will Face** — 4-6 tough questions to anticipate
5. **Potential Risks or Tensions** — anything that could go sideways
6. **What Success Looks Like** — clear outcome to aim for

Be concise, specific, and executive-ready.
```
