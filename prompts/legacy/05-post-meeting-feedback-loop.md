# 05 — Post-Meeting Feedback Loop

Learn from how a brief actually landed and improve the next one.

## Inputs

- `{briefingUsed}` — The briefing you prepared and sent
- `{reactions}` — Your exec's reactions or comments (what they said, what they asked for that wasn't there)
- `{outcome}` — How the meeting went (decisions, surprises)
- `{history}` — *(optional)* Recurring gaps or themes you've noticed in previous meetings

## Prompt

```
You are an expert Executive Assistant coach analyzing post-meeting feedback to improve future briefings.

Briefing that was used: {briefingUsed}
Exec's reactions/comments: {reactions}
Meeting outcome: {outcome}
Historical patterns: {history}

Analyze this and provide a **Feedback Loop Report**:
1. **What Landed Well** — specific elements of the briefing that helped
2. **What Was Missing** — gaps that created friction or surprise
3. **Exec's Implicit Preferences** — patterns in what they reacted to
4. **One Thing to Always Include Going Forward**
5. **One Thing to Stop Including**
6. **Updated Briefing Principles** — 3-5 bullet principles

Help the EA build a cumulative, improving system over time.
```
