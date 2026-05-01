# 04 — Meeting Type Playbook Builder

Build a reusable briefing template tailored to your exec.

## Inputs

- `{meetingType}` — Meeting type (e.g. "Board meeting", "client pitch", "1:1 with direct reports")
- `{execStyle}` — Your exec's communication style — how they like info presented, what annoys them
- `{pastExamples}` — Feedback or patterns you've noticed about what's worked
- `{stakeholders}` — Typical stakeholders in this meeting type and what they care about

## Prompt

```
You are an expert Executive Assistant creating a reusable briefing template/playbook.

Meeting type: {meetingType}
Exec's communication style: {execStyle}
What's worked well before: {pastExamples}
Typical stakeholders: {stakeholders}

Create a **Reusable Briefing Playbook** for this meeting type with:
1. **Template Structure** — the exact sections to always include
2. **Key Questions to Always Answer** — 5-7 questions this briefing must address every time
3. **Tone & Format Guidelines** — how long, what style, what to avoid
4. **Stakeholder Notes** — what to know/watch for with the usual attendees
5. **Day-Before Checklist** — 5-item checklist
6. **Common Pitfalls** — mistakes to avoid

Make it practical enough to use as a standing operating procedure.
```
