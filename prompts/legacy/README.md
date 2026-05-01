# Legacy prompts (v1 React toolkit)

These five prompts came from the original Vite + React build of the EA Toolkit (preserved at branch [`archive/v1-react`](https://github.com/lisaesterhuizen0-wq/ea-toolkit/tree/archive/v1-react), source: `src/EA_Toolkit.jsx`).

They cover a wider range of EA workflows than the new toolkit currently does — kept here as a prompt library, both for future tools in the new toolkit and for any EA who wants to lift them straight into Claude/ChatGPT.

| # | Prompt | Use when |
|---|---|---|
| 01 | [Briefing Doc Generator](01-briefing-doc-generator.md) | You have raw meeting context and need a structured pre-meeting brief |
| 02 | [Priority Pulse Tracker](02-priority-pulse-tracker.md) | You want to extract and rank what your exec is actually focused on this week |
| 03 | [Blind Spot Checker](03-blind-spot-checker.md) | You have a draft brief and want it stress-tested before it reaches your exec |
| 04 | [Meeting Type Playbook Builder](04-meeting-type-playbook-builder.md) | You want a reusable template for a recurring meeting type |
| 05 | [Post-Meeting Feedback Loop](05-post-meeting-feedback-loop.md) | You want to learn from how a brief actually landed |

Format: each file lists the inputs the prompt expects (as `{placeholders}`) and the full prompt body.
