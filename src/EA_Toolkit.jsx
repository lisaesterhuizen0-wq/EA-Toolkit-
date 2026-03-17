import { useState, useEffect, useCallback, useRef } from "react";
import mammoth from "mammoth";

/* ─────────────────────────── Tool Definitions ─────────────────────────── */

const TOOLS = [
  {
    id: "briefing",
    number: "01",
    name: "Briefing Doc Generator",
    tagline: "Turn raw context into a polished first draft",
    icon: "📋",
    fields: [
      { id: "meeting", label: "Meeting Title & Attendees", type: "textarea", placeholder: "e.g. Q3 Strategy Review — CEO, CFO, VP Sales", rows: 2 },
      { id: "goal", label: "Meeting Goal", type: "textarea", placeholder: "What is this meeting trying to achieve?", rows: 2 },
      { id: "emails", label: "Relevant Emails / Slack Threads", type: "textarea", placeholder: "Paste key excerpts or upload a doc...", rows: 3 },
      { id: "actions", label: "Open Action Items from Past Meetings", type: "textarea", placeholder: "Paste or summarize relevant past action items...", rows: 3 },
      { id: "okrs", label: "Exec's Current OKRs / Priorities", type: "textarea", placeholder: "What are the top 3-5 things your exec is focused on right now?", rows: 2 },
    ],
    prompt: (f) =>
      `You are an expert Executive Assistant helping prepare a meeting briefing document.\n\nMeeting: ${f.meeting}\nGoal: ${f.goal}\nRelevant email/Slack context: ${f.emails}\nOpen action items: ${f.actions}\nExec's OKRs/Priorities: ${f.okrs}\n\nCreate a structured briefing document with these sections:\n1. **Meeting Overview** — 2-3 sentence summary of purpose and context\n2. **Key Background** — critical context the exec needs walking in\n3. **Open Action Items** — unresolved items relevant to this meeting\n4. **Likely Questions the Exec Will Face** — 4-6 tough questions to anticipate\n5. **Potential Risks or Tensions** — anything that could go sideways\n6. **What Success Looks Like** — clear outcome to aim for\n\nBe concise, specific, and executive-ready.`,
  },
  {
    id: "priority",
    number: "02",
    name: "Priority Pulse Tracker",
    tagline: "Extract and rank what your exec actually cares about",
    icon: "🎯",
    fields: [
      { id: "checkin", label: "Notes from Recent Check-ins", type: "textarea", placeholder: "Paste your notes from 1:1s or verbal updates...", rows: 3 },
      { id: "emails2", label: "Emails / Slack Messages (last 7 days)", type: "textarea", placeholder: "Paste key messages that reveal priorities...", rows: 3 },
      { id: "context", label: "Any Upcoming Deadlines or Events", type: "textarea", placeholder: "Board meeting, product launch, quarterly close, etc.", rows: 2 },
    ],
    prompt: (f) =>
      `You are an expert Executive Assistant helping track an executive's shifting priorities.\n\nCheck-in notes: ${f.checkin}\nRecent emails/Slack: ${f.emails2}\nUpcoming deadlines/events: ${f.context}\n\nAnalyze these inputs and produce a **Priority Pulse Report** with:\n1. **Top 5 Priorities This Week** — ranked 1-5 with a one-line rationale for each\n2. **What's Gaining Urgency** — things that seem to be heating up\n3. **What's Fading** — things that were priorities but seem less pressing now\n4. **Watch List** — items that aren't urgent yet but need monitoring\n5. **Suggested Focus for EA** — what you should be proactively supporting\n\nBe specific and actionable.`,
  },
  {
    id: "blindspot",
    number: "03",
    name: "Blind Spot Checker",
    tagline: "Stress-test your briefing before it reaches your exec",
    icon: "🔍",
    fields: [
      { id: "draft", label: "Your Briefing Draft", type: "textarea", placeholder: "Paste your full briefing doc or upload it...", rows: 5 },
      { id: "meetingType", label: "Meeting Type & Attendees", type: "input", placeholder: "e.g. Client pitch — CEO + Procurement team from Acme Corp" },
      { id: "execFocus", label: "What Your Exec Is Most Focused On Right Now", type: "textarea", placeholder: "Their top goals, concerns, sensitivities this week...", rows: 3 },
    ],
    prompt: (f) =>
      `You are a senior Executive Assistant reviewing a briefing document before it reaches an executive.\n\nMeeting: ${f.meetingType}\nExec's current focus: ${f.execFocus}\n\nBRIEFING DRAFT:\n${f.draft}\n\nCritically review this briefing and provide:\n1. **Missing Context** — what important background is absent?\n2. **Unanticipated Questions** — tough questions the exec might face that aren't addressed\n3. **Conflicts with Exec's Priorities** — anything that seems misaligned with their current focus\n4. **Tone / Format Issues** — anything too long, vague, or unclear\n5. **Overall Readiness Score** — rate 1-10 and explain in one sentence\n\nBe direct and specific.`,
  },
  {
    id: "playbook",
    number: "04",
    name: "Meeting Type Playbook Builder",
    tagline: "Build reusable templates tailored to your exec",
    icon: "📚",
    fields: [
      { id: "meetingTypeP", label: "Meeting Type", type: "input", placeholder: "e.g. Board meeting, client pitch, 1:1 with direct reports..." },
      { id: "execStyle", label: "Your Exec's Communication Style", type: "textarea", placeholder: "How do they like information presented? What annoys them?", rows: 3 },
      { id: "pastExamples", label: "What's Worked Well in Past Briefings", type: "textarea", placeholder: "Any feedback or patterns you've noticed over time...", rows: 3 },
      { id: "stakeholders", label: "Typical Stakeholders in This Meeting Type", type: "textarea", placeholder: "Who's usually in the room and what do they care about?", rows: 2 },
    ],
    prompt: (f) =>
      `You are an expert Executive Assistant creating a reusable briefing template/playbook.\n\nMeeting type: ${f.meetingTypeP}\nExec's communication style: ${f.execStyle}\nWhat's worked well before: ${f.pastExamples}\nTypical stakeholders: ${f.stakeholders}\n\nCreate a **Reusable Briefing Playbook** for this meeting type with:\n1. **Template Structure** — the exact sections to always include\n2. **Key Questions to Always Answer** — 5-7 questions this briefing must address every time\n3. **Tone & Format Guidelines** — how long, what style, what to avoid\n4. **Stakeholder Notes** — what to know/watch for with the usual attendees\n5. **Day-Before Checklist** — 5-item checklist\n6. **Common Pitfalls** — mistakes to avoid\n\nMake it practical enough to use as a standing operating procedure.`,
  },
  {
    id: "feedback",
    number: "05",
    name: "Post-Meeting Feedback Loop",
    tagline: "Build the feedback system that currently doesn't exist",
    icon: "🔄",
    fields: [
      { id: "briefingUsed", label: "The Briefing You Prepared", type: "textarea", placeholder: "Paste or summarize the briefing you sent, or upload it...", rows: 3 },
      { id: "reactions", label: "Exec's Reactions or Comments", type: "textarea", placeholder: "What did they say? What did they ask for that wasn't there?", rows: 3 },
      { id: "outcome", label: "How Did the Meeting Go?", type: "textarea", placeholder: "What happened? What decisions were made? What surprised everyone?", rows: 3 },
      { id: "history", label: "Patterns from Previous Meetings (Optional)", type: "textarea", placeholder: "Any recurring gaps or themes you've noticed before...", rows: 2 },
    ],
    prompt: (f) =>
      `You are an expert Executive Assistant coach analyzing post-meeting feedback to improve future briefings.\n\nBriefing that was used: ${f.briefingUsed}\nExec's reactions/comments: ${f.reactions}\nMeeting outcome: ${f.outcome}\nHistorical patterns: ${f.history}\n\nAnalyze this and provide a **Feedback Loop Report**:\n1. **What Landed Well** — specific elements of the briefing that helped\n2. **What Was Missing** — gaps that created friction or surprise\n3. **Exec's Implicit Preferences** — patterns in what they reacted to\n4. **One Thing to Always Include Going Forward**\n5. **One Thing to Stop Including**\n6. **Updated Briefing Principles** — 3-5 bullet principles\n\nHelp the EA build a cumulative, improving system over time.`,
  },
];

/* ─────────────────────────── File Parsing ─────────────────────────── */

const ACCEPTED_TYPES = ".docx,.doc,.txt,.md,.text";

async function parseFile(file) {
  const name = file.name.toLowerCase();

  if (name.endsWith(".docx") || name.endsWith(".doc")) {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  }

  if (name.endsWith(".txt") || name.endsWith(".md") || name.endsWith(".text")) {
    return await file.text();
  }

  throw new Error(`Unsupported file type. Please upload a .docx, .txt, or .md file.`);
}

/* ─────────────────────────── API Call ─────────────────────────── */

const MAX_INPUT_CHARS = 12000;

async function callClaude(prompt) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) {
    const status = res.status;
    if (status === 429) throw new Error("Rate limited — please wait a moment and try again.");
    if (status >= 500) throw new Error("The AI service is temporarily unavailable. Please try again shortly.");
    throw new Error(`Request failed (${status}). Please try again.`);
  }
  const data = await res.json();
  return data.content?.[0]?.text || "No response received.";
}

/* ─────────────────────────── Markdown Renderer ─────────────────────────── */

function RenderedMarkdown({ text }) {
  const renderLine = (line, i) => {
    if (line.startsWith("### ")) return <h3 key={i} style={ms.h3}>{renderInline(line.slice(4))}</h3>;
    if (line.startsWith("## ")) return <h2 key={i} style={ms.h2}>{renderInline(line.slice(3))}</h2>;
    if (line.startsWith("# ")) return <h1 key={i} style={ms.h1}>{renderInline(line.slice(2))}</h1>;
    const numMatch = line.match(/^(\d+)\.\s+(.+)/);
    if (numMatch) return <div key={i} style={ms.li}><span style={ms.num}>{numMatch[1]}.</span><span>{renderInline(numMatch[2])}</span></div>;
    if (line.startsWith("- ") || line.startsWith("• ")) return <div key={i} style={ms.li}><span style={ms.bullet}>•</span><span>{renderInline(line.slice(2))}</span></div>;
    if (/^-{3,}$/.test(line.trim())) return <hr key={i} style={ms.hr} />;
    if (!line.trim()) return <div key={i} style={{ height: "0.6rem" }} />;
    return <p key={i} style={ms.p}>{renderInline(line)}</p>;
  };

  const renderInline = (text) => {
    const parts = [];
    let remaining = text;
    let key = 0;
    while (remaining.length > 0) {
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
      if (boldMatch) {
        const idx = boldMatch.index;
        if (idx > 0) parts.push(<span key={key++}>{remaining.slice(0, idx)}</span>);
        parts.push(<strong key={key++} style={ms.bold}>{boldMatch[1]}</strong>);
        remaining = remaining.slice(idx + boldMatch[0].length);
        continue;
      }
      const italicMatch = remaining.match(/\*(.+?)\*/);
      if (italicMatch) {
        const idx = italicMatch.index;
        if (idx > 0) parts.push(<span key={key++}>{remaining.slice(0, idx)}</span>);
        parts.push(<em key={key++} style={ms.italic}>{italicMatch[1]}</em>);
        remaining = remaining.slice(idx + italicMatch[0].length);
        continue;
      }
      const codeMatch = remaining.match(/`(.+?)`/);
      if (codeMatch) {
        const idx = codeMatch.index;
        if (idx > 0) parts.push(<span key={key++}>{remaining.slice(0, idx)}</span>);
        parts.push(<code key={key++} style={ms.code}>{codeMatch[1]}</code>);
        remaining = remaining.slice(idx + codeMatch[0].length);
        continue;
      }
      parts.push(<span key={key++}>{remaining}</span>);
      break;
    }
    return parts;
  };

  return <div>{text.split("\n").map(renderLine)}</div>;
}

const ms = {
  h1: { fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 700, color: "var(--ink)", margin: "1.2rem 0 0.5rem" },
  h2: { fontFamily: "var(--font-display)", fontSize: "1.05rem", fontWeight: 700, color: "var(--accent)", margin: "1.1rem 0 0.4rem", borderBottom: "1px solid var(--border-light)", paddingBottom: "0.3rem" },
  h3: { fontFamily: "var(--font-display)", fontSize: "0.95rem", fontWeight: 600, color: "var(--ink)", margin: "0.9rem 0 0.3rem" },
  p: { margin: "0 0 0.5rem", lineHeight: 1.75, color: "var(--ink-soft)" },
  li: { display: "flex", gap: "0.6rem", margin: "0.3rem 0", lineHeight: 1.7, color: "var(--ink-soft)", alignItems: "baseline" },
  num: { fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--accent)", fontSize: "0.85rem", minWidth: "1.4rem" },
  bullet: { color: "var(--accent)", fontSize: "0.7rem", minWidth: "0.8rem", marginTop: "0.15rem" },
  bold: { fontWeight: 700, color: "var(--ink)" },
  italic: { fontStyle: "italic", color: "var(--ink-muted)" },
  code: { fontFamily: "monospace", background: "var(--cream-deep)", padding: "0.1rem 0.4rem", borderRadius: "3px", fontSize: "0.82rem" },
  hr: { border: "none", borderTop: "1px solid var(--border-light)", margin: "0.8rem 0" },
};

/* ─────────────────────────── Loading Spinner ─────────────────────────── */

function LoadingPulse() {
  return (
    <div style={{ margin: "auto", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "1.2rem" }}>
      <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--accent)", animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite` }} />
        ))}
      </div>
      <span style={{ fontFamily: "var(--font-display)", fontSize: "0.82rem", letterSpacing: "0.12em", color: "var(--ink-muted)" }}>
        Generating your document...
      </span>
    </div>
  );
}

/* ─────────────────────────── File Upload Button ─────────────────────────── */

function UploadButton({ onFileContent, uploading }) {
  const inputRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await parseFile(file);
      onFileContent(text, file.name);
    } catch (err) {
      onFileContent(null, null, err.message);
    }
    // Reset so the same file can be re-uploaded
    e.target.value = "";
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        onChange={handleFile}
        style={{ display: "none" }}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        title="Upload .docx, .txt, or .md"
        style={{
          background: "none", border: "1px solid var(--border)", borderRadius: "4px",
          padding: "0.15rem 0.45rem", cursor: uploading ? "wait" : "pointer",
          fontSize: "0.65rem", color: "var(--ink-muted)", fontFamily: "var(--font-body)",
          fontWeight: 500, letterSpacing: "0.04em", transition: "all 0.2s",
          display: "inline-flex", alignItems: "center", gap: "0.3rem",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--ink-muted)"; }}
      >
        <span style={{ fontSize: "0.8rem" }}>📎</span> Upload
      </button>
    </>
  );
}

/* ─────────────────────────── Tool Panel ─────────────────────────── */

function ToolPanel({ tool, values, output, loading, error, onChange, onRun, onOutputChange, onClear, onCopy, copied, rawMode, onToggleRaw, onError }) {
  const panelRef = useRef(null);
  const [uploadingField, setUploadingField] = useState(null);
  const [uploadFeedback, setUploadFeedback] = useState({});

  const totalChars = Object.values(values).reduce((sum, v) => sum + (v?.length || 0), 0);
  const nearLimit = totalChars > MAX_INPUT_CHARS * 0.85;
  const overLimit = totalChars > MAX_INPUT_CHARS;

  // Ctrl+Enter / Cmd+Enter to generate
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        if (!loading) onRun();
      }
    };
    const node = panelRef.current;
    node?.addEventListener("keydown", handler);
    return () => node?.removeEventListener("keydown", handler);
  }, [loading, onRun]);

  const handleFileContent = (fieldId) => (text, fileName, errorMsg) => {
    setUploadingField(null);
    if (errorMsg) {
      setUploadFeedback((prev) => ({ ...prev, [fieldId]: { error: errorMsg } }));
      setTimeout(() => setUploadFeedback((prev) => ({ ...prev, [fieldId]: null })), 4000);
      return;
    }
    if (text) {
      // Append to existing content with a separator if there's already text
      const existing = values[fieldId]?.trim();
      const newVal = existing ? `${existing}\n\n--- Uploaded from ${fileName} ---\n\n${text}` : text;
      onChange(fieldId, newVal);
      setUploadFeedback((prev) => ({ ...prev, [fieldId]: { success: fileName } }));
      setTimeout(() => setUploadFeedback((prev) => ({ ...prev, [fieldId]: null })), 3000);
    }
  };

  return (
    <div ref={panelRef} style={{ display: "flex", gap: "2rem", height: "100%", flexWrap: "wrap" }}>
      {/* ── Input Column ── */}
      <div style={{ flex: "1 1 340px", display: "flex", flexDirection: "column", gap: "0.85rem", minWidth: 0 }}>
        {tool.fields.map((f, fi) => (
          <div key={f.id} style={{ animation: `fadeSlideUp 0.35s ease ${fi * 0.06}s both` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.35rem" }}>
              <label style={{
                fontFamily: "var(--font-display)", fontSize: "0.7rem",
                letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--accent)", fontWeight: 600,
              }}>
                {f.label}
              </label>
              {f.type === "textarea" && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  {uploadFeedback[f.id]?.success && (
                    <span style={{ fontSize: "0.65rem", color: "#16a34a", fontWeight: 500, animation: "fadeSlideUp 0.3s ease" }}>
                      ✓ {uploadFeedback[f.id].success}
                    </span>
                  )}
                  {uploadFeedback[f.id]?.error && (
                    <span style={{ fontSize: "0.65rem", color: "#b91c1c", fontWeight: 500, animation: "fadeSlideUp 0.3s ease" }}>
                      {uploadFeedback[f.id].error}
                    </span>
                  )}
                  <UploadButton
                    onFileContent={handleFileContent(f.id)}
                    uploading={uploadingField === f.id}
                  />
                </div>
              )}
            </div>
            {f.type === "input" ? (
              <input
                value={values[f.id] || ""}
                onChange={(e) => onChange(f.id, e.target.value)}
                placeholder={f.placeholder}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            ) : (
              <textarea
                value={values[f.id] || ""}
                onChange={(e) => onChange(f.id, e.target.value)}
                placeholder={f.placeholder}
                rows={f.rows || 3}
                style={{ ...inputStyle, resize: "vertical", lineHeight: 1.65 }}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            )}
          </div>
        ))}

        {error && (
          <div style={{
            padding: "0.6rem 0.8rem", background: "#fef2f2", border: "1px solid #fca5a5",
            borderRadius: "6px", color: "#b91c1c", fontSize: "0.82rem", lineHeight: 1.5,
          }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginTop: "0.3rem", flexWrap: "wrap" }}>
          <button onClick={onRun} disabled={loading || overLimit} style={{
            padding: "0.7rem 2rem",
            background: loading || overLimit ? "var(--cream-deep)" : "var(--accent)",
            border: "none", borderRadius: "6px",
            color: loading || overLimit ? "var(--ink-muted)" : "#fff",
            fontFamily: "var(--font-display)", fontSize: "0.82rem", fontWeight: 600,
            letterSpacing: "0.08em", cursor: loading || overLimit ? "not-allowed" : "pointer",
            transition: "all 0.2s",
          }}>
            {loading ? "Generating..." : "Generate"}
          </button>
          <span style={{ fontSize: "0.72rem", color: overLimit ? "#b91c1c" : nearLimit ? "#d97706" : "var(--ink-faint)", fontFamily: "var(--font-body)" }}>
            {nearLimit || overLimit ? `${totalChars.toLocaleString()} / ${MAX_INPUT_CHARS.toLocaleString()} chars` : ""}
          </span>
          <span style={{ fontSize: "0.68rem", color: "var(--ink-faint)", marginLeft: "auto" }}>
            {navigator.platform?.includes("Mac") ? "⌘" : "Ctrl"}+Enter
          </span>
        </div>
      </div>

      {/* ── Output Column ── */}
      <div style={{
        flex: "1 1 380px", background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "10px", padding: "1.4rem", overflowY: "auto", minHeight: "340px",
        display: "flex", flexDirection: "column", minWidth: 0,
      }}>
        {!output && !loading && (
          <div style={{
            margin: "auto", textAlign: "center", color: "var(--ink-faint)",
            fontFamily: "var(--font-display)", padding: "2rem",
          }}>
            <div style={{ fontSize: "2.8rem", marginBottom: "0.8rem", opacity: 0.5 }}>{tool.icon}</div>
            <div style={{ fontSize: "0.9rem", letterSpacing: "0.04em" }}>Your output will appear here</div>
            <div style={{ fontSize: "0.75rem", marginTop: "0.4rem", color: "var(--ink-faint)", opacity: 0.7 }}>
              Fill in the fields and hit Generate
            </div>
          </div>
        )}

        {loading && <LoadingPulse />}

        {output && !loading && (
          <div style={{ display: "flex", flexDirection: "column", flex: 1, animation: "fadeSlideUp 0.4s ease" }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              borderBottom: "1px solid var(--border-light)", marginBottom: "1rem", paddingBottom: "0.55rem",
            }}>
              <span style={{
                fontFamily: "var(--font-display)", fontSize: "0.68rem",
                letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--ink-muted)", fontWeight: 600,
              }}>
                Generated Output
              </span>
              <div style={{ display: "flex", gap: "0.4rem" }}>
                <ToolbarBtn onClick={onToggleRaw} active={rawMode} label={rawMode ? "Formatted" : "Raw"} />
                <ToolbarBtn onClick={onCopy} active={copied} label={copied ? "✓ Copied" : "Copy"} />
                <ToolbarBtn onClick={onClear} label="Clear" danger />
              </div>
            </div>

            {rawMode ? (
              <textarea
                value={output}
                onChange={(e) => onOutputChange(e.target.value)}
                style={{
                  flex: 1, minHeight: "300px", width: "100%", background: "transparent",
                  border: "none", outline: "none", resize: "none",
                  fontFamily: "var(--font-body)", fontSize: "0.88rem", color: "var(--ink-soft)",
                  lineHeight: 1.75, padding: 0,
                }}
              />
            ) : (
              <div style={{ fontFamily: "var(--font-body)", fontSize: "0.88rem", flex: 1 }}>
                <RenderedMarkdown text={output} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ToolbarBtn({ onClick, active, label, danger }) {
  return (
    <button onClick={onClick} style={{
      padding: "0.25rem 0.65rem",
      background: danger ? "#fef2f2" : active ? "#ecfdf5" : "var(--cream-deep)",
      border: `1px solid ${danger ? "#fca5a5" : active ? "#86efac" : "var(--border)"}`,
      borderRadius: "5px",
      color: danger ? "#b91c1c" : active ? "#16a34a" : "var(--accent)",
      fontFamily: "var(--font-display)", fontSize: "0.68rem", fontWeight: 600,
      letterSpacing: "0.06em", cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap",
    }}>
      {label}
    </button>
  );
}

const inputStyle = {
  width: "100%", background: "var(--surface)", border: "1px solid var(--border)",
  borderRadius: "7px", padding: "0.6rem 0.85rem", color: "var(--ink)",
  fontSize: "0.86rem", fontFamily: "var(--font-body)", outline: "none",
  boxSizing: "border-box", transition: "border-color 0.2s, box-shadow 0.2s", lineHeight: 1.5,
};

/* ─────────────────────────── Main App ─────────────────────────── */

export default function EAToolkit() {
  const [activeId, setActiveId] = useState("briefing");
  const [allValues, setAllValues] = useState({});
  const [allOutputs, setAllOutputs] = useState({});
  const [allLoading, setAllLoading] = useState({});
  const [allErrors, setAllErrors] = useState({});
  const [allRaw, setAllRaw] = useState({});
  const [copied, setCopied] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const activeTool = TOOLS.find((t) => t.id === activeId);
  const values = allValues[activeId] || {};
  const output = allOutputs[activeId] || "";
  const loading = allLoading[activeId] || false;
  const error = allErrors[activeId] || "";
  const rawMode = allRaw[activeId] || false;

  const handleChange = (fieldId, val) =>
    setAllValues((prev) => ({ ...prev, [activeId]: { ...prev[activeId], [fieldId]: val } }));

  const handleOutputChange = (val) =>
    setAllOutputs((prev) => ({ ...prev, [activeId]: val }));

  const handleClear = () => {
    if (output && !window.confirm("Clear the generated output?")) return;
    setAllOutputs((prev) => ({ ...prev, [activeId]: "" }));
  };

  const handleRun = useCallback(async () => {
    const filled = activeTool.fields.filter((f) => values[f.id]?.trim());
    if (!filled.length) {
      setAllErrors((prev) => ({ ...prev, [activeId]: "Please fill in at least one field before generating." }));
      return;
    }
    const totalChars = Object.values(values).reduce((s, v) => s + (v?.length || 0), 0);
    if (totalChars > MAX_INPUT_CHARS) {
      setAllErrors((prev) => ({ ...prev, [activeId]: `Input is too long (${totalChars.toLocaleString()} chars). Please reduce to under ${MAX_INPUT_CHARS.toLocaleString()}.` }));
      return;
    }
    setAllErrors((prev) => ({ ...prev, [activeId]: "" }));
    setAllLoading((prev) => ({ ...prev, [activeId]: true }));
    setAllOutputs((prev) => ({ ...prev, [activeId]: "" }));
    try {
      const result = await callClaude(activeTool.prompt(values));
      setAllOutputs((prev) => ({ ...prev, [activeId]: result }));
    } catch (err) {
      setAllErrors((prev) => ({ ...prev, [activeId]: err.message || "Something went wrong. Please try again." }));
    }
    setAllLoading((prev) => ({ ...prev, [activeId]: false }));
  }, [activeId, activeTool, values]);

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleToggleRaw = () =>
    setAllRaw((prev) => ({ ...prev, [activeId]: !prev[activeId] }));

  const selectTool = (id) => {
    setActiveId(id);
    setMobileNav(false);
  };

  const completedCount = TOOLS.filter((t) => allOutputs[t.id]).length;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", fontFamily: "var(--font-body)", color: "var(--ink)" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Source+Sans+3:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap" rel="stylesheet" />
      <style>{`
        :root {
          --font-display: 'DM Serif Display', serif;
          --font-body: 'Source Sans 3', sans-serif;
          --bg: #FAF8F5;
          --surface: #FFFFFF;
          --cream: #F5F0EB;
          --cream-deep: #EDE6DD;
          --accent: #7B5B3A;
          --accent-light: #A8845E;
          --accent-glow: rgba(123,91,58,0.08);
          --ink: #2D2418;
          --ink-soft: #4A3D30;
          --ink-muted: #8C7B69;
          --ink-faint: #B8A996;
          --border: #DDD4C8;
          --border-light: #EDE6DD;
          --danger: #B91C1C;
        }
        * { box-sizing: border-box; margin: 0; }
        body { margin: 0; }
        ::placeholder { color: var(--ink-faint); }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: var(--ink-muted); }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-12px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .sidebar-btn { transition: all 0.15s ease; }
        .sidebar-btn:hover { background: var(--cream) !important; }
        input:focus, textarea:focus { box-shadow: 0 0 0 3px var(--accent-glow); }
      `}</style>

      {/* ── Header ── */}
      <header style={{
        borderBottom: "1px solid var(--border-light)", padding: "0 2.5rem",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "var(--surface)", height: "64px", position: "sticky", top: 0, zIndex: 20,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.9rem" }}>
          {isMobile && (
            <button onClick={() => setMobileNav(!mobileNav)} style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: "1.3rem", color: "var(--accent)", padding: "0.3rem",
            }}>
              ☰
            </button>
          )}
          <span style={{ fontFamily: "var(--font-display)", fontSize: "1.45rem", color: "var(--accent)", letterSpacing: "-0.01em" }}>
            EA Toolkit
          </span>
          {!isMobile && (
            <>
              <span style={{ display: "inline-block", width: "1px", height: "18px", background: "var(--border)" }} />
              <span style={{ fontSize: "0.72rem", color: "var(--ink-muted)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 500 }}>
                AI-Powered Executive Assistant Suite
              </span>
            </>
          )}
        </div>
        {completedCount > 0 && (
          <div style={{
            fontSize: "0.7rem", color: "var(--accent-light)", fontWeight: 600,
            letterSpacing: "0.08em", background: "var(--cream)", padding: "0.3rem 0.7rem", borderRadius: "20px",
          }}>
            {completedCount}/5 GENERATED
          </div>
        )}
      </header>

      <div style={{ display: "flex", height: "calc(100vh - 64px)" }}>
        {/* ── Sidebar ── */}
        <nav style={{
          width: "270px", borderRight: "1px solid var(--border-light)",
          padding: "1.2rem 0", flexShrink: 0, overflowY: "auto", background: "var(--surface)",
          ...(isMobile
            ? {
                position: "fixed", left: 0, top: "64px", bottom: 0, zIndex: 15,
                transform: mobileNav ? "translateX(0)" : "translateX(-100%)",
                transition: "transform 0.25s ease", boxShadow: mobileNav ? "4px 0 20px rgba(0,0,0,0.08)" : "none",
              }
            : {}),
        }}>
          <div style={{
            padding: "0 1.4rem 1rem", fontSize: "0.62rem", letterSpacing: "0.16em",
            textTransform: "uppercase", color: "var(--ink-faint)", fontWeight: 600,
          }}>
            Tools
          </div>
          {TOOLS.map((tool, ti) => {
            const isActive = activeId === tool.id;
            const hasOutput = !!allOutputs[tool.id];
            return (
              <button key={tool.id} className="sidebar-btn" onClick={() => selectTool(tool.id)} style={{
                width: "100%", textAlign: "left", padding: "0.85rem 1.4rem",
                background: isActive ? "var(--cream)" : "transparent",
                border: "none", borderLeft: `3px solid ${isActive ? "var(--accent)" : "transparent"}`,
                cursor: "pointer", display: "block", animation: `slideIn 0.3s ease ${ti * 0.05}s both`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.2rem" }}>
                  <span style={{ fontSize: "0.6rem", fontFamily: "var(--font-display)", color: "var(--ink-faint)", fontWeight: 400 }}>
                    {tool.number}
                  </span>
                  <span style={{ fontSize: "1rem" }}>{tool.icon}</span>
                  {hasOutput && (
                    <span style={{ marginLeft: "auto", width: "7px", height: "7px", borderRadius: "50%", background: "var(--accent)", flexShrink: 0 }} />
                  )}
                </div>
                <div style={{
                  fontFamily: "var(--font-display)", fontSize: "0.88rem",
                  color: isActive ? "var(--accent)" : "var(--ink-soft)", marginBottom: "0.15rem",
                }}>
                  {tool.name}
                </div>
                <div style={{ fontSize: "0.73rem", color: "var(--ink-muted)", lineHeight: 1.45 }}>
                  {tool.tagline}
                </div>
              </button>
            );
          })}
          <div style={{
            padding: "1.8rem 1.4rem 1rem", borderTop: "1px solid var(--border-light)",
            marginTop: "1rem", fontSize: "0.65rem", color: "var(--ink-faint)", lineHeight: 1.6,
          }}>
            Built by Lisa Myburgh<br />
            <span style={{ opacity: 0.7 }}>RAY AI — Executive Assistant</span>
          </div>
        </nav>

        {/* Mobile overlay */}
        {mobileNav && isMobile && (
          <div onClick={() => setMobileNav(false)} style={{
            position: "fixed", inset: 0, top: "64px", background: "rgba(0,0,0,0.2)", zIndex: 14,
          }} />
        )}

        {/* ── Main Content ── */}
        <main style={{ flex: 1, padding: isMobile ? "1.5rem 1rem" : "2rem 2.5rem", overflowY: "auto" }}>
          <div style={{ marginBottom: "1.8rem", animation: "fadeSlideUp 0.35s ease" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.9rem", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "1.8rem" }}>{activeTool.icon}</span>
              <div>
                <h1 style={{
                  fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 400,
                  color: "var(--ink)", margin: 0, lineHeight: 1.2,
                }}>
                  {activeTool.name}
                </h1>
                <p style={{ fontSize: "0.82rem", color: "var(--ink-muted)", fontStyle: "italic", margin: "0.15rem 0 0" }}>
                  {activeTool.tagline}
                </p>
              </div>
            </div>
            <div style={{ height: "1px", background: "linear-gradient(to right, var(--border), transparent 80%)", marginTop: "0.3rem" }} />
          </div>

          <ToolPanel
            tool={activeTool}
            values={values}
            output={output}
            loading={loading}
            error={error}
            onChange={handleChange}
            onRun={handleRun}
            onOutputChange={handleOutputChange}
            onClear={handleClear}
            onCopy={handleCopy}
            copied={copied}
            rawMode={rawMode}
            onToggleRaw={handleToggleRaw}
          />
        </main>
      </div>
    </div>
  );
}
