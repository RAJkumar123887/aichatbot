import { useState, useRef, useEffect, useCallback } from "react";

// ─────────────────────────────────────────────
//  CONVERSATION STAGES
// ─────────────────────────────────────────────
const STAGES = [
  "welcome", "name", "contact", "summary", "experience",
  "education", "skills", "projects", "certifications", "done"
];

const STAGE_PROMPTS = {
  welcome: null,
  name: "What's your full name and desired job title?",
  contact: "Great! Now share your contact details — email, phone, LinkedIn, location (city/country).",
  summary: "Write a short professional summary (2–3 sentences) or tell me your background and I'll craft one.",
  experience: "Tell me about your work experience. Include company name, role, dates, and key achievements. Add multiple jobs if needed (type 'done' when finished).",
  education: "Share your education — degree, institution, graduation year, GPA (optional).",
  skills: "List your technical and soft skills separated by commas.",
  projects: "Any notable projects? Give name, description, and technologies used. Type 'skip' to skip.",
  certifications: "Any certifications or awards? Type 'skip' to skip.",
  done: null,
};

// ─────────────────────────────────────────────
//  AI LLM ENGINE
// ─────────────────────────────────────────────
async function callLLM(systemPrompt, userMessage) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{ role: "user", content: `${systemPrompt}\n\nUser input: ${userMessage}` }],
    }),
  });
  const data = await res.json();
  return data.content?.map(b => b.text || "").join("") || "";
}

// ─────────────────────────────────────────────
//  RESUME TEMPLATES
// ─────────────────────────────────────────────

// ── Template 1: Modern Teal ──
function TemplateModern({ data }) {
  const { name, title, contact, summary, experience, education, skills, projects, certifications } = data;
  return (
    <div style={{ fontFamily: "'Crimson Pro', Georgia, serif", background: "#fff", minHeight: "297mm", width: "210mm", margin: "0 auto", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0f4c75, #1b6ca8)", padding: "32px 40px 28px", color: "#fff" }}>
        <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.5px", lineHeight: 1.1 }}>{name || "Your Name"}</div>
        <div style={{ fontSize: 14, marginTop: 5, opacity: 0.85, fontStyle: "italic", letterSpacing: "0.5px" }}>{title || "Professional Title"}</div>
        <div style={{ display: "flex", gap: 20, marginTop: 14, flexWrap: "wrap" }}>
          {[contact?.email, contact?.phone, contact?.location, contact?.linkedin].filter(Boolean).map((c, i) => (
            <span key={i} style={{ fontSize: 11, opacity: 0.9, display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 9, opacity: 0.7 }}>●</span> {c}
            </span>
          ))}
        </div>
      </div>
      {/* Body */}
      <div style={{ display: "flex", flex: 1 }}>
        {/* Left */}
        <div style={{ width: "35%", background: "#f0f4f8", padding: "24px 20px", borderRight: "1px solid #e2e8f0" }}>
          {skills?.length > 0 && (
            <Section title="Skills" color="#0f4c75">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {skills.map((s, i) => (
                  <span key={i} style={{ background: "#0f4c75", color: "#fff", borderRadius: 3, padding: "2px 8px", fontSize: 10, fontFamily: "sans-serif" }}>{s}</span>
                ))}
              </div>
            </Section>
          )}
          {education?.length > 0 && (
            <Section title="Education" color="#0f4c75">
              {education.map((e, i) => (
                <div key={i} style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#1a202c", fontFamily: "sans-serif" }}>{e.degree}</div>
                  <div style={{ fontSize: 11, color: "#4a5568", fontFamily: "sans-serif" }}>{e.institution}</div>
                  <div style={{ fontSize: 10, color: "#718096", fontFamily: "sans-serif" }}>{e.year}{e.gpa ? ` · GPA ${e.gpa}` : ""}</div>
                </div>
              ))}
            </Section>
          )}
          {certifications?.length > 0 && (
            <Section title="Certifications" color="#0f4c75">
              {certifications.map((c, i) => (
                <div key={i} style={{ fontSize: 11, color: "#2d3748", fontFamily: "sans-serif", marginBottom: 5, paddingLeft: 8, borderLeft: "2px solid #0f4c75" }}>{c}</div>
              ))}
            </Section>
          )}
        </div>
        {/* Right */}
        <div style={{ flex: 1, padding: "24px 28px" }}>
          {summary && (
            <Section title="Professional Summary" color="#0f4c75">
              <p style={{ fontSize: 12, color: "#4a5568", lineHeight: 1.7, fontFamily: "sans-serif", margin: 0 }}>{summary}</p>
            </Section>
          )}
          {experience?.length > 0 && (
            <Section title="Work Experience" color="#0f4c75">
              {experience.map((e, i) => (
                <div key={i} style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#1a202c", fontFamily: "sans-serif" }}>{e.role}</div>
                    <div style={{ fontSize: 10, color: "#718096", fontFamily: "sans-serif", whiteSpace: "nowrap", marginLeft: 8 }}>{e.dates}</div>
                  </div>
                  <div style={{ fontSize: 11, color: "#0f4c75", fontFamily: "sans-serif", marginBottom: 5 }}>{e.company}</div>
                  {e.bullets?.map((b, j) => (
                    <div key={j} style={{ display: "flex", gap: 6, fontSize: 11, color: "#4a5568", fontFamily: "sans-serif", marginBottom: 3 }}>
                      <span style={{ color: "#0f4c75", flexShrink: 0, marginTop: 1 }}>▸</span> {b}
                    </div>
                  ))}
                </div>
              ))}
            </Section>
          )}
          {projects?.length > 0 && (
            <Section title="Projects" color="#0f4c75">
              {projects.map((p, i) => (
                <div key={i} style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#1a202c", fontFamily: "sans-serif" }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: "#4a5568", fontFamily: "sans-serif", lineHeight: 1.6 }}>{p.description}</div>
                  {p.tech && <div style={{ fontSize: 10, color: "#718096", fontFamily: "sans-serif", marginTop: 2 }}>Tech: {p.tech}</div>}
                </div>
              ))}
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Template 2: Executive Classic ──
function TemplateExecutive({ data }) {
  const { name, title, contact, summary, experience, education, skills, projects, certifications } = data;
  return (
    <div style={{ fontFamily: "'Playfair Display', Georgia, serif", background: "#fff", minHeight: "297mm", width: "210mm", margin: "0 auto", padding: "40px 48px" }}>
      <div style={{ textAlign: "center", borderBottom: "3px double #1a1a2e", paddingBottom: 20, marginBottom: 20 }}>
        <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: "2px", color: "#1a1a2e", textTransform: "uppercase" }}>{name || "YOUR NAME"}</div>
        <div style={{ fontSize: 13, color: "#4a4a6a", letterSpacing: "3px", textTransform: "uppercase", marginTop: 5, fontFamily: "sans-serif" }}>{title || "Professional Title"}</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 18, marginTop: 12, flexWrap: "wrap" }}>
          {[contact?.email, contact?.phone, contact?.location, contact?.linkedin].filter(Boolean).map((c, i) => (
            <span key={i} style={{ fontSize: 11, color: "#666", fontFamily: "sans-serif" }}>{c}</span>
          ))}
        </div>
      </div>
      {summary && <div style={{ marginBottom: 20 }}><p style={{ fontSize: 12, color: "#333", lineHeight: 1.75, textAlign: "justify", fontStyle: "italic", fontFamily: "'Crimson Pro', Georgia, serif" }}>{summary}</p></div>}
      {experience?.length > 0 && (
        <ExecSection title="Professional Experience">
          {experience.map((e, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#1a1a2e" }}>{e.role}</span>
                <span style={{ fontSize: 11, color: "#666", fontFamily: "sans-serif" }}>{e.dates}</span>
              </div>
              <div style={{ fontSize: 12, color: "#4a4a6a", fontStyle: "italic", marginBottom: 5 }}>{e.company}</div>
              {e.bullets?.map((b, j) => (
                <div key={j} style={{ display: "flex", gap: 8, fontSize: 11.5, color: "#444", fontFamily: "sans-serif", marginBottom: 3 }}>
                  <span style={{ flexShrink: 0 }}>•</span> {b}
                </div>
              ))}
            </div>
          ))}
        </ExecSection>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {education?.length > 0 && (
          <ExecSection title="Education">
            {education.map((e, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#1a1a2e" }}>{e.degree}</div>
                <div style={{ fontSize: 11, color: "#666", fontFamily: "sans-serif" }}>{e.institution} · {e.year}</div>
              </div>
            ))}
          </ExecSection>
        )}
        {skills?.length > 0 && (
          <ExecSection title="Core Competencies">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {skills.map((s, i) => (
                <span key={i} style={{ fontSize: 11, color: "#1a1a2e", fontFamily: "sans-serif", padding: "2px 0" }}>
                  {s}{i < skills.length - 1 ? " ·" : ""}
                </span>
              ))}
            </div>
          </ExecSection>
        )}
      </div>
      {certifications?.length > 0 && (
        <ExecSection title="Certifications & Awards">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {certifications.map((c, i) => (
              <span key={i} style={{ fontSize: 11, color: "#444", fontFamily: "sans-serif" }}>✦ {c}</span>
            ))}
          </div>
        </ExecSection>
      )}
    </div>
  );
}

// ── Template 3: Creative Dark ──
function TemplateCreative({ data }) {
  const { name, title, contact, summary, experience, education, skills, projects, certifications } = data;
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#0d1117", minHeight: "297mm", width: "210mm", margin: "0 auto", display: "flex" }}>
      {/* Left dark sidebar */}
      <div style={{ width: "38%", background: "#161b22", padding: "32px 22px", borderRight: "1px solid #30363d" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg, #58a6ff, #3fb950)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 16 }}>
          {(name || "U").charAt(0).toUpperCase()}
        </div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#e6edf3", lineHeight: 1.2 }}>{name || "Your Name"}</div>
        <div style={{ fontSize: 11, color: "#58a6ff", marginTop: 5, letterSpacing: "0.5px" }}>{title || "Professional Title"}</div>
        <div style={{ marginTop: 18, paddingTop: 18, borderTop: "1px solid #30363d" }}>
          {[{ icon: "✉", val: contact?.email }, { icon: "☎", val: contact?.phone }, { icon: "⌖", val: contact?.location }, { icon: "in", val: contact?.linkedin }].filter(i => i.val).map((c, i) => (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 10, color: "#58a6ff", width: 14, textAlign: "center" }}>{c.icon}</span>
              <span style={{ fontSize: 10, color: "#8b949e" }}>{c.val}</span>
            </div>
          ))}
        </div>
        {skills?.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#58a6ff", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 10 }}>Skills</div>
            {skills.map((s, i) => (
              <div key={i} style={{ marginBottom: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                  <span style={{ fontSize: 10, color: "#c9d1d9" }}>{s}</span>
                </div>
                <div style={{ height: 3, background: "#21262d", borderRadius: 2 }}>
                  <div style={{ height: 3, background: "linear-gradient(90deg, #58a6ff, #3fb950)", borderRadius: 2, width: `${70 + (i * 17) % 30}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
        {education?.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#58a6ff", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 10 }}>Education</div>
            {education.map((e, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#c9d1d9" }}>{e.degree}</div>
                <div style={{ fontSize: 10, color: "#8b949e" }}>{e.institution}</div>
                <div style={{ fontSize: 9, color: "#58a6ff", marginTop: 1 }}>{e.year}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Right content */}
      <div style={{ flex: 1, padding: "32px 28px", overflowY: "auto" }}>
        {summary && (
          <div style={{ marginBottom: 22, padding: 14, background: "#161b22", borderRadius: 8, borderLeft: "3px solid #58a6ff" }}>
            <p style={{ fontSize: 11.5, color: "#8b949e", lineHeight: 1.7, margin: 0 }}>{summary}</p>
          </div>
        )}
        {experience?.length > 0 && (
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#3fb950", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 20, height: 1, background: "#3fb950", display: "inline-block" }} /> Experience
            </div>
            {experience.map((e, i) => (
              <div key={i} style={{ marginBottom: 16, paddingLeft: 12, borderLeft: "1px solid #21262d" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#e6edf3" }}>{e.role}</div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: "#58a6ff" }}>{e.company}</span>
                  <span style={{ fontSize: 10, color: "#484f58" }}>{e.dates}</span>
                </div>
                {e.bullets?.map((b, j) => (
                  <div key={j} style={{ display: "flex", gap: 6, fontSize: 11, color: "#8b949e", marginBottom: 3 }}>
                    <span style={{ color: "#3fb950", flexShrink: 0 }}>→</span> {b}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
        {projects?.length > 0 && (
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#3fb950", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 20, height: 1, background: "#3fb950", display: "inline-block" }} /> Projects
            </div>
            {projects.map((p, i) => (
              <div key={i} style={{ marginBottom: 12, padding: 10, background: "#161b22", borderRadius: 6 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#e6edf3" }}>{p.name}</div>
                <div style={{ fontSize: 11, color: "#8b949e", marginTop: 3, lineHeight: 1.6 }}>{p.description}</div>
                {p.tech && <div style={{ fontSize: 10, color: "#58a6ff", marginTop: 4 }}>{p.tech}</div>}
              </div>
            ))}
          </div>
        )}
        {certifications?.length > 0 && (
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#3fb950", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 20, height: 1, background: "#3fb950", display: "inline-block" }} /> Certifications
            </div>
            {certifications.map((c, i) => (
              <div key={i} style={{ fontSize: 11, color: "#8b949e", marginBottom: 5, paddingLeft: 10, borderLeft: "2px solid #3fb950" }}>{c}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Template 4: Minimal Clean ──
function TemplateMinimal({ data }) {
  const { name, title, contact, summary, experience, education, skills, projects, certifications } = data;
  return (
    <div style={{ fontFamily: "'Lato', sans-serif", background: "#fff", minHeight: "297mm", width: "210mm", margin: "0 auto", padding: "44px 52px" }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 32, fontWeight: 300, color: "#111", letterSpacing: "-1px" }}>{name || "Your Name"}</div>
        <div style={{ fontSize: 13, color: "#666", marginTop: 3, fontWeight: 400 }}>{title || "Professional Title"}</div>
        <div style={{ display: "flex", gap: 16, marginTop: 10, flexWrap: "wrap" }}>
          {[contact?.email, contact?.phone, contact?.location, contact?.linkedin].filter(Boolean).map((c, i) => (
            <span key={i} style={{ fontSize: 11, color: "#888" }}>{c}</span>
          ))}
        </div>
        <div style={{ height: 1, background: "#e5e5e5", marginTop: 16 }} />
      </div>
      {summary && <MinSection title="About"><p style={{ fontSize: 12, color: "#555", lineHeight: 1.8, margin: 0 }}>{summary}</p></MinSection>}
      {experience?.length > 0 && (
        <MinSection title="Experience">
          {experience.map((e, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#222" }}>{e.role}</span>
                <span style={{ fontSize: 10, color: "#aaa" }}>{e.dates}</span>
              </div>
              <div style={{ fontSize: 11, color: "#888", marginBottom: 5 }}>{e.company}</div>
              {e.bullets?.map((b, j) => (
                <div key={j} style={{ display: "flex", gap: 8, fontSize: 11, color: "#555", marginBottom: 3 }}>
                  <span style={{ color: "#aaa", flexShrink: 0 }}>—</span> {b}
                </div>
              ))}
            </div>
          ))}
        </MinSection>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
        {education?.length > 0 && (
          <MinSection title="Education">
            {education.map((e, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#222" }}>{e.degree}</div>
                <div style={{ fontSize: 11, color: "#888" }}>{e.institution}</div>
                <div style={{ fontSize: 10, color: "#aaa" }}>{e.year}</div>
              </div>
            ))}
          </MinSection>
        )}
        {skills?.length > 0 && (
          <MinSection title="Skills">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {skills.map((s, i) => (
                <span key={i} style={{ fontSize: 11, color: "#555", background: "#f5f5f5", padding: "3px 9px", borderRadius: 3 }}>{s}</span>
              ))}
            </div>
          </MinSection>
        )}
      </div>
      {projects?.length > 0 && (
        <MinSection title="Projects">
          {projects.map((p, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#222" }}>{p.name}</span>
              {p.tech && <span style={{ fontSize: 10, color: "#aaa", marginLeft: 8 }}>{p.tech}</span>}
              <div style={{ fontSize: 11, color: "#666", marginTop: 2, lineHeight: 1.6 }}>{p.description}</div>
            </div>
          ))}
        </MinSection>
      )}
      {certifications?.length > 0 && (
        <MinSection title="Certifications">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {certifications.map((c, i) => <span key={i} style={{ fontSize: 11, color: "#555" }}>· {c}</span>)}
          </div>
        </MinSection>
      )}
    </div>
  );
}

// ── Section helpers ──
function Section({ title, color, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: color, letterSpacing: "1.5px", textTransform: "uppercase", borderBottom: `1.5px solid ${color}`, paddingBottom: 4, marginBottom: 10, fontFamily: "sans-serif" }}>{title}</div>
      {children}
    </div>
  );
}
function ExecSection({ title, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#1a1a2e", letterSpacing: "2px", textTransform: "uppercase", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 24, height: 1, background: "#1a1a2e", display: "inline-block" }} /> {title} <span style={{ flex: 1, height: 1, background: "#1a1a2e", display: "inline-block" }} />
      </div>
      {children}
    </div>
  );
}
function MinSection({ title, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ fontSize: 9, fontWeight: 700, color: "#aaa", letterSpacing: "2px", textTransform: "uppercase", marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────
//  CHAT MESSAGE
// ─────────────────────────────────────────────
function ChatMsg({ msg }) {
  const isBot = msg.role === "bot";
  return (
    <div style={{ display: "flex", justifyContent: isBot ? "flex-start" : "flex-end", marginBottom: 14, animation: "fadeUp 0.3s ease" }}>
      {isBot && (
        <div style={{
          width: 30, height: 30, borderRadius: "50%", flexShrink: 0, marginRight: 8,
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, color: "#fff", fontWeight: 700, marginTop: 2,
        }}>AI</div>
      )}
      <div style={{
        maxWidth: "78%", padding: "11px 15px", borderRadius: isBot ? "4px 16px 16px 16px" : "16px 4px 16px 16px",
        background: isBot ? "#fff" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
        border: isBot ? "1px solid #e5e7eb" : "none",
        color: isBot ? "#1f2937" : "#fff",
        fontSize: 13.5, lineHeight: 1.65,
        boxShadow: isBot ? "0 1px 4px rgba(0,0,0,0.06)" : "0 2px 8px rgba(99,102,241,0.3)",
      }}>
        {msg.content}
        {msg.typing && <span style={{ opacity: 0.6 }}>
          {[0,1,2].map(i => <span key={i} style={{ display: "inline-block", width: 4, height: 4, borderRadius: "50%", background: "currentColor", margin: "0 1px", animation: `dot 1s ease infinite`, animationDelay: `${i*0.2}s` }} />)}
        </span>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  MAIN APP
// ─────────────────────────────────────────────
const TEMPLATES = [
  { id: "modern", label: "Modern", icon: "◈" },
  { id: "executive", label: "Executive", icon: "◆" },
  { id: "creative", label: "Creative", icon: "✦" },
  { id: "minimal", label: "Minimal", icon: "○" },
];

const EMPTY_RESUME = {
  name: "", title: "", contact: {}, summary: "",
  experience: [], education: [], skills: [],
  projects: [], certifications: [],
};

export default function AIResumeBuilder() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState("welcome");
  const [resume, setResume] = useState(EMPTY_RESUME);
  const [template, setTemplate] = useState("modern");
  const [expBuffer, setExpBuffer] = useState([]);
  const [activeTab, setActiveTab] = useState("chat"); // mobile
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // Boot greeting
  useEffect(() => {
    setTimeout(() => {
      addBot(`👋 Welcome to **AI Resume Builder**! I'm your personal AI career assistant.

I'll guide you through building a stunning, ATS-optimized professional resume step by step.

Let's start — **what's your full name and desired job title?**
_(e.g. "John Smith, Senior Software Engineer")_`);
      setStage("name");
    }, 500);
  }, []);

  const addBot = (content) => {
    setMessages(prev => [...prev, { role: "bot", content, id: Date.now() }]);
  };

  const parseAndUpdate = useCallback(async (userInput, currentStage) => {
    setLoading(true);
    try {
      let updated = { ...resume };
      let nextStage = currentStage;
      let botReply = "";

      const systemBase = `You are a professional resume writing AI assistant. Extract structured data from user input and return ONLY valid JSON. No markdown, no explanation — just JSON.`;

      if (currentStage === "name") {
        const raw = await callLLM(`${systemBase}
Extract full name and job title from this text.
Return: {"name": "...", "title": "..."}`, userInput);
        try {
          const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
          updated.name = parsed.name || userInput;
          updated.title = parsed.title || "";
        } catch { updated.name = userInput; }
        nextStage = "contact";
        botReply = `Great, **${updated.name}**! 🎯\n\nNow share your **contact details**:\n— Email address\n— Phone number\n— City & Country\n— LinkedIn URL (optional)`;

      } else if (currentStage === "contact") {
        const raw = await callLLM(`${systemBase}
Extract contact info. Return: {"email":"","phone":"","location":"","linkedin":""}`, userInput);
        try {
          const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
          updated.contact = parsed;
        } catch { updated.contact = { email: userInput }; }
        nextStage = "summary";
        botReply = `Perfect! ✅\n\nNow write a **professional summary** (2–3 sentences about your background, expertise, and value).\n\nOr just describe yourself and I'll craft one for you!`;

      } else if (currentStage === "summary") {
        const raw = await callLLM(`You are a professional resume writer. Write a powerful 2-3 sentence professional summary based on this input. Return ONLY the summary text, no quotes, no JSON.`, userInput);
        updated.summary = raw.trim();
        nextStage = "experience";
        botReply = `Excellent summary! 📝\n\nNow let's add your **work experience**. For each job, share:\n— Job title & Company\n— Dates (e.g. Jan 2020 – Mar 2023)\n— 2-4 key achievements\n\nType **'done'** when you've added all your experience.`;

      } else if (currentStage === "experience") {
        if (userInput.trim().toLowerCase() === "done") {
          nextStage = "education";
          botReply = `Got all your experience! 💼\n\nNow your **education** details:\n— Degree name\n— Institution\n— Graduation year\n— GPA (optional)`;
        } else {
          const raw = await callLLM(`${systemBase}
Extract one work experience entry. Return: {"role":"","company":"","dates":"","bullets":["achievement 1","achievement 2","achievement 3"]}
Make bullets strong action-verb-led achievement statements.`, userInput);
          try {
            const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
            updated.experience = [...(updated.experience || []), parsed];
          } catch { updated.experience = [...(updated.experience || []), { role: "Role", company: userInput, dates: "", bullets: [userInput] }]; }
          botReply = `Added! ✅ Tell me about another job, or type **'done'** to move on.`;
          nextStage = "experience";
        }

      } else if (currentStage === "education") {
        const raw = await callLLM(`${systemBase}
Extract education. Return: {"degree":"","institution":"","year":"","gpa":""}`, userInput);
        try {
          const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
          updated.education = [...(updated.education || []), parsed];
        } catch { updated.education = [{ degree: userInput, institution: "", year: "" }]; }
        nextStage = "skills";
        botReply = `Education added! 🎓\n\nNow list your **skills** (comma-separated):\n_e.g. Python, React, Project Management, AWS, Leadership_`;

      } else if (currentStage === "skills") {
        const skills = userInput.split(/,|;|\n/).map(s => s.trim()).filter(Boolean);
        updated.skills = skills;
        nextStage = "projects";
        botReply = `Fantastic skill set! 💡\n\nAny **notable projects**? Share:\n— Project name\n— What it does\n— Technologies used\n\nType **'skip'** to skip this section.`;

      } else if (currentStage === "projects") {
        if (userInput.trim().toLowerCase() === "skip") {
          nextStage = "certifications";
          botReply = `No problem! 🏆\n\nAny **certifications, awards, or achievements**?\n_(e.g. AWS Certified, Google Analytics, Dean's List)_\n\nType **'skip'** to skip.`;
        } else {
          const raw = await callLLM(`${systemBase}
Extract project info. Return: {"name":"","description":"","tech":""}`, userInput);
          try {
            const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
            updated.projects = [...(updated.projects || []), parsed];
          } catch { updated.projects = [...(updated.projects || []), { name: "Project", description: userInput, tech: "" }]; }
          nextStage = "certifications";
          botReply = `Project added! 🚀\n\nAny **certifications or awards**? Type **'skip'** to skip.`;
        }

      } else if (currentStage === "certifications") {
        if (userInput.trim().toLowerCase() !== "skip") {
          updated.certifications = userInput.split(/,|;|\n/).map(s => s.trim()).filter(Boolean);
        }
        nextStage = "done";
        botReply = `🎉 **Your resume is complete!**\n\nYour professional resume has been generated on the right. You can:\n— Switch between **4 templates** using the selector\n— **Print or save** as PDF using the button\n\nWant to refine anything? Just ask me! 💬`;
      }

      setResume(updated);
      setStage(nextStage);
      addBot(botReply);
    } catch (err) {
      addBot(`⚠️ Sorry, I had trouble processing that. Could you rephrase? (${err.message})`);
    } finally {
      setLoading(false);
    }
  }, [resume]);

  const send = useCallback(() => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: text, id: Date.now() }]);
    parseAndUpdate(text, stage);
  }, [input, loading, stage, parseAndUpdate]);

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const printResume = () => {
    const el = document.getElementById("resume-preview");
    if (!el) return;
    const win = window.open("", "_blank");
    win.document.write(`<!DOCTYPE html><html><head><title>Resume</title>
<link href="https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,600;0,700;1,400&family=Playfair+Display:wght@400;700&family=DM+Sans:wght@300;400;500;600;700;800&family=Lato:wght@300;400;600&display=swap" rel="stylesheet">
<style>*{margin:0;padding:0;box-sizing:border-box;}body{background:#fff;}</style>
</head><body>${el.innerHTML}</body></html>`);
    win.document.close();
    setTimeout(() => { win.print(); }, 800);
  };

  const renderTemplate = () => {
    const props = { data: resume };
    if (template === "modern") return <TemplateModern {...props} />;
    if (template === "executive") return <TemplateExecutive {...props} />;
    if (template === "creative") return <TemplateCreative {...props} />;
    if (template === "minimal") return <TemplateMinimal {...props} />;
  };

  const progress = Math.round((STAGES.indexOf(stage) / (STAGES.length - 1)) * 100);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,400;0,600;0,700;1,400&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600;700;800&family=Lato:wght@300;400;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body{background:#f1f3f7;font-family:'DM Sans',system-ui,sans-serif;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes dot{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-4px)}}
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:0.6}50%{opacity:1}}
        textarea{resize:none;outline:none;}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-thumb{background:#d1d5db;border-radius:4px;}
        .tpl-btn:hover{border-color:#6366f1!important;color:#6366f1!important;}
        .tpl-btn.active{background:#6366f1!important;color:#fff!important;border-color:#6366f1!important;}
        .send-btn:hover:not(:disabled){background:#4f46e5!important;transform:scale(1.05);}
        .tab-btn.active{background:#fff!important;color:#1f2937!important;box-shadow:0 1px 3px rgba(0,0,0,0.1);}
      `}</style>

      <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#f1f3f7" }}>

        {/* ── Top Bar ── */}
        <header style={{
          height: 56, background: "#fff", borderBottom: "1px solid #e5e7eb",
          display: "flex", alignItems: "center", padding: "0 20px", gap: 12,
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)", flexShrink: 0, zIndex: 10,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, color: "#fff", fontWeight: 800,
            }}>AI</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#111827", letterSpacing: "-0.02em" }}>AI Resume Builder</div>
              <div style={{ fontSize: 10, color: "#9ca3af", letterSpacing: "0.05em" }}>Powered by LLM · 4 Templates</div>
            </div>
          </div>

          {/* Progress */}
          <div style={{ flex: 1, maxWidth: 300, margin: "0 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 10, color: "#9ca3af" }}>Resume Progress</span>
              <span style={{ fontSize: 10, color: "#6366f1", fontWeight: 600 }}>{progress}%</span>
            </div>
            <div style={{ height: 5, background: "#f3f4f6", borderRadius: 3 }}>
              <div style={{ height: 5, background: "linear-gradient(90deg, #6366f1, #8b5cf6)", borderRadius: 3, width: `${progress}%`, transition: "width 0.5s ease" }} />
            </div>
          </div>

          {/* Template selector */}
          <div style={{ display: "flex", gap: 5 }}>
            {TEMPLATES.map(t => (
              <button key={t.id} className={`tpl-btn${template === t.id ? " active" : ""}`}
                onClick={() => setTemplate(t.id)} style={{
                  padding: "5px 11px", borderRadius: 7, border: "1.5px solid #e5e7eb",
                  background: "none", fontSize: 11.5, fontWeight: 600, color: "#6b7280",
                  cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit",
                  display: "flex", alignItems: "center", gap: 5,
                }}>
                <span style={{ fontSize: 10 }}>{t.icon}</span> {t.label}
              </button>
            ))}
          </div>

          <button onClick={printResume} style={{
            marginLeft: 8, padding: "7px 16px", borderRadius: 8,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            border: "none", color: "#fff", fontSize: 12, fontWeight: 600,
            cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
            boxShadow: "0 2px 8px rgba(99,102,241,0.35)",
          }}>
            ⬇ Export PDF
          </button>
        </header>

        {/* ── Main Layout ── */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

          {/* ── Chat Panel ── */}
          <div style={{
            width: 380, flexShrink: 0, display: "flex", flexDirection: "column",
            background: "#f8f9fb", borderRight: "1px solid #e5e7eb",
          }}>
            {/* Stage indicator */}
            <div style={{
              padding: "10px 16px", background: "#fff", borderBottom: "1px solid #f3f4f6",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: stage === "done" ? "#22c55e" : "#6366f1", animation: loading ? "pulse 1s ease infinite" : "none" }} />
              <span style={{ fontSize: 11.5, fontWeight: 600, color: "#4b5563" }}>
                {stage === "done" ? "✅ Resume Complete!" : `Step: ${stage.charAt(0).toUpperCase() + stage.slice(1)}`}
              </span>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
              {messages.map(msg => <ChatMsg key={msg.id} msg={msg} />)}
              {loading && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff", fontWeight: 700 }}>AI</div>
                  <div style={{ padding: "10px 14px", background: "#fff", borderRadius: "4px 14px 14px 14px", border: "1px solid #e5e7eb", display: "flex", gap: 4, alignItems: "center" }}>
                    {[0,1,2].map(i => <span key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "#6366f1", display: "inline-block", animation: "dot 1s ease infinite", animationDelay: `${i*0.18}s` }} />)}
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div style={{ padding: "12px 14px", background: "#fff", borderTop: "1px solid #f3f4f6" }}>
              <div style={{
                display: "flex", alignItems: "flex-end", gap: 8,
                background: "#f9fafb", border: `1.5px solid ${loading ? "#6366f1" : "#e5e7eb"}`,
                borderRadius: 12, padding: "9px 12px",
                transition: "border-color 0.2s",
              }}>
                <textarea
                  ref={inputRef}
                  rows={1}
                  value={input}
                  onChange={e => {
                    setInput(e.target.value);
                    e.target.style.height = "auto";
                    e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
                  }}
                  onKeyDown={handleKey}
                  disabled={loading || stage === "welcome"}
                  placeholder={stage === "done" ? "Ask me to refine anything…" : "Type your answer…"}
                  style={{
                    flex: 1, border: "none", background: "transparent",
                    fontSize: 13.5, color: "#1f2937", lineHeight: 1.5,
                    fontFamily: "'DM Sans', system-ui, sans-serif", overflow: "hidden",
                  }}
                />
                <button className="send-btn" onClick={send} disabled={loading || !input.trim()} style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  background: loading || !input.trim() ? "#f3f4f6" : "linear-gradient(135deg,#6366f1,#8b5cf6)",
                  border: "none",
                  color: loading || !input.trim() ? "#9ca3af" : "#fff",
                  fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.15s",
                  boxShadow: !loading && input.trim() ? "0 2px 8px rgba(99,102,241,0.35)" : "none",
                }}>
                  {loading ? <span style={{ animation: "spin 0.8s linear infinite", display: "block" }}>⟳</span> : "↑"}
                </button>
              </div>
              <div style={{ textAlign: "center", marginTop: 6, fontSize: 10, color: "#d1d5db" }}>Press Enter to send · Shift+Enter for new line</div>
            </div>
          </div>

          {/* ── Resume Preview ── */}
          <div style={{ flex: 1, overflowY: "auto", background: "#e8eaf0", padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#6b7280" }}>📄 Live Preview — {TEMPLATES.find(t=>t.id===template)?.label} Template</span>
              <div style={{ display: "flex", gap: 6 }}>
                {TEMPLATES.map(t => (
                  <button key={t.id} className={`tpl-btn${template === t.id ? " active" : ""}`}
                    onClick={() => setTemplate(t.id)} style={{
                      padding: "4px 10px", borderRadius: 6, border: "1.5px solid #d1d5db",
                      background: "none", fontSize: 11, fontWeight: 600, color: "#6b7280",
                      cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit",
                    }}>
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div id="resume-preview" style={{
              boxShadow: "0 8px 32px rgba(0,0,0,0.14)", borderRadius: 4,
              overflow: "hidden", transformOrigin: "top center",
              transform: "scale(0.82)", marginBottom: -120,
            }}>
              {renderTemplate()}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
