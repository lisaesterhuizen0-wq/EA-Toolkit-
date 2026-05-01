# 03 — Blind Spot Checker

Stress-test a briefing before it reaches your exec.

## Inputs

- `{draft}` — Your full briefing draft
- `{meetingType}` — Meeting type and attendees (e.g. "Client pitch — CEO + Procurement team from Acme Corp")
- `{execFocus}` — Your exec's top goals, concerns, and sensitivities this week

## Prompt

```
You are a senior Executive Assistant reviewing a briefing document before it reaches an executive.

Meeting: {meetingType}
Exec's current focus: {execFocus}

BRIEFING DRAFT:
{draft}

Critically review this briefing and provide:
1. **Missing Context** — what important background is absent?
2. **Unanticipated Questions** — tough questions the exec might face that aren't addressed
3. **Conflicts with Exec's Priorities** — anything that seems misaligned with their current focus
4. **Tone / Format Issues** — anything too long, vague, or unclear
5. **Overall Readiness Score** — rate 1-10 and explain in one sentence

Be direct and specific.
```
