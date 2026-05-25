import React from "react";

// ─── Safe helpers ─────────────────────────────────────────────────────────────
function safe(val, fallback = "") {
  if (val === null || val === undefined) return fallback;
  if (typeof val === "string") return val;
  if (typeof val === "number") return String(val);
  if (typeof val === "object") return JSON.stringify(val);
  return fallback;
}

function safeArr(val) {
  if (Array.isArray(val)) return val;
  if (val && typeof val === "object") return Object.values(val);
  return [];
}

function renderCert(c) {
  if (!c) return "";
  if (typeof c === "string") return c;
  const parts = [c.certification_name, c.issuing_organization, c.date].filter(Boolean);
  return parts.join(" – ");
}

function renderAchievement(a) {
  if (!a) return "";
  if (typeof a === "string") return a;
  const parts = [a.achievement_name, a.description, a.date].filter(Boolean);
  return parts.join(" – ");
}

// ─── Template 1: Modern Professional ──────────────────────────────────────────
export function ModernProfessionalTemplate({ data }) {
  const { name, contact, summary, skills, experience, education, projects, certifications, achievements } = data || {};

  return (
    <div id="resume-preview" style={{
      fontFamily: "'Georgia', 'Times New Roman', serif",
      background: "#fff", color: "#1a1a2e",
      maxWidth: "800px", margin: "0 auto", padding: "48px 56px", lineHeight: "1.6",
    }}>
      {/* Header */}
      <div style={{ borderBottom: "3px solid #6366f1", paddingBottom: "20px", marginBottom: "24px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: "700", margin: "0 0 6px", letterSpacing: "-0.5px", color: "#1a1a2e" }}>
          {safe(name) || <span style={{ color: "#ccc" }}>Name not provided</span>}
        </h1>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", fontSize: "13px", color: "#555" }}>
          {contact?.email && <span>✉ {contact.email}</span>}
          {contact?.phone && <span>📞 {contact.phone}</span>}
          {contact?.location && <span>📍 {contact.location}</span>}
          {contact?.linkedin && <span>🔗 {contact.linkedin}</span>}
          {contact?.github && <span>💻 {contact.github}</span>}
        </div>
      </div>

      {summary && (
        <Section title="Professional Summary">
          <p style={{ margin: 0, color: "#333", fontSize: "14px" }}>{safe(summary)}</p>
        </Section>
      )}

      {safeArr(skills).length > 0 && (
        <Section title="Core Competencies">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {safeArr(skills).map((s, i) => (
              <span key={i} style={{ background: "#f0f0ff", border: "1px solid #c7d2fe", color: "#4338ca", borderRadius: "4px", padding: "3px 10px", fontSize: "12px", fontWeight: "600" }}>
                {safe(s)}
              </span>
            ))}
          </div>
        </Section>
      )}

      {safeArr(experience).length > 0 && (
        <Section title="Professional Experience">
          {safeArr(experience).map((exp, i) => <ExpBlock key={i} item={exp} />)}
        </Section>
      )}

      {safeArr(education).length > 0 && (
        <Section title="Education">
          {safeArr(education).map((edu, i) => <EduBlock key={i} item={edu} />)}
        </Section>
      )}

      {safeArr(projects).length > 0 && (
        <Section title="Projects">
          {safeArr(projects).map((p, i) => <ProjectBlock key={i} item={p} />)}
        </Section>
      )}

      {safeArr(certifications).length > 0 && (
        <Section title="Certifications">
          {safeArr(certifications).map((c, i) => (
            <p key={i} style={{ margin: "4px 0", fontSize: "13px" }}>▪ {renderCert(c)}</p>
          ))}
        </Section>
      )}

      {safeArr(achievements).length > 0 && (
        <Section title="Achievements">
          {safeArr(achievements).map((a, i) => (
            <p key={i} style={{ margin: "4px 0", fontSize: "13px" }}>▪ {renderAchievement(a)}</p>
          ))}
        </Section>
      )}
    </div>
  );
}

// ─── Template 2: Minimal ATS ──────────────────────────────────────────────────
export function MinimalATSTemplate({ data }) {
  const { name, contact, summary, skills, experience, education, projects, certifications, achievements } = data || {};

  return (
    <div id="resume-preview" style={{
      fontFamily: "'Arial', 'Helvetica', sans-serif",
      background: "#fff", color: "#222",
      maxWidth: "800px", margin: "0 auto", padding: "40px 48px", lineHeight: "1.55",
    }}>
      <div style={{ textAlign: "center", borderBottom: "2px solid #222", paddingBottom: "16px", marginBottom: "20px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "700", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "2px" }}>
          {safe(name) || <span style={{ color: "#ccc" }}>Name not provided</span>}
        </h1>
        <div style={{ fontSize: "12px", color: "#444", display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "12px" }}>
          {contact?.email && <span>{contact.email}</span>}
          {contact?.phone && <span>{contact.phone}</span>}
          {contact?.location && <span>{contact.location}</span>}
          {contact?.linkedin && <span>{contact.linkedin}</span>}
        </div>
      </div>

      {summary && (
        <ATSSection title="SUMMARY">
          <p style={{ margin: 0, fontSize: "13px" }}>{safe(summary)}</p>
        </ATSSection>
      )}

      {safeArr(skills).length > 0 && (
        <ATSSection title="SKILLS">
          <p style={{ margin: 0, fontSize: "13px" }}>{safeArr(skills).map(s => safe(s)).join(" • ")}</p>
        </ATSSection>
      )}

      {safeArr(experience).length > 0 && (
        <ATSSection title="EXPERIENCE">
          {safeArr(experience).map((exp, i) => <ExpBlock key={i} item={exp} minimal />)}
        </ATSSection>
      )}

      {safeArr(education).length > 0 && (
        <ATSSection title="EDUCATION">
          {safeArr(education).map((edu, i) => <EduBlock key={i} item={edu} minimal />)}
        </ATSSection>
      )}

      {safeArr(projects).length > 0 && (
        <ATSSection title="PROJECTS">
          {safeArr(projects).map((p, i) => <ProjectBlock key={i} item={p} minimal />)}
        </ATSSection>
      )}

      {safeArr(certifications).length > 0 && (
        <ATSSection title="CERTIFICATIONS">
          {safeArr(certifications).map((c, i) => (
            <p key={i} style={{ margin: "2px 0", fontSize: "13px" }}>• {renderCert(c)}</p>
          ))}
        </ATSSection>
      )}

      {safeArr(achievements).length > 0 && (
        <ATSSection title="ACHIEVEMENTS">
          {safeArr(achievements).map((a, i) => (
            <p key={i} style={{ margin: "2px 0", fontSize: "13px" }}>• {renderAchievement(a)}</p>
          ))}
        </ATSSection>
      )}
    </div>
  );
}

// ─── Template 3: Tech Developer ───────────────────────────────────────────────
export function TechDeveloperTemplate({ data }) {
  const { name, contact, summary, skills, experience, education, projects, certifications, achievements } = data || {};

  // Detect job title from first experience or summary
  const inferredTitle = safeArr(experience)?.[0]?.title || "Software Developer";

  return (
    <div id="resume-preview" style={{
      fontFamily: "'Courier New', 'Lucida Console', monospace",
      background: "#fafafa", color: "#111",
      maxWidth: "800px", margin: "0 auto", padding: "40px 48px", lineHeight: "1.6",
    }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", alignItems: "start", borderBottom: "3px solid #111", paddingBottom: "20px", marginBottom: "24px", gap: "20px" }}>
        <div>
          <h1 style={{ fontSize: "30px", fontWeight: "900", margin: "0 0 4px", letterSpacing: "-1px" }}>
            {safe(name) || <span style={{ color: "#ccc" }}>Name not provided</span>}
          </h1>
          <p style={{ margin: 0, fontSize: "12px", color: "#555", fontFamily: "Arial, sans-serif" }}>{inferredTitle}</p>
        </div>
        <div style={{ fontSize: "11px", color: "#444", textAlign: "right", fontFamily: "Arial, sans-serif" }}>
          {contact?.email && <p style={{ margin: "2px 0" }}>{contact.email}</p>}
          {contact?.phone && <p style={{ margin: "2px 0" }}>{contact.phone}</p>}
          {contact?.github && <p style={{ margin: "2px 0" }}>{contact.github}</p>}
          {contact?.linkedin && <p style={{ margin: "2px 0" }}>{contact.linkedin}</p>}
        </div>
      </div>

      {summary && (
        <TechSection title="// ABOUT">
          <p style={{ margin: 0, fontSize: "13px", fontFamily: "Arial, sans-serif", color: "#333" }}>{safe(summary)}</p>
        </TechSection>
      )}

      {safeArr(skills).length > 0 && (
        <TechSection title="// TECH STACK">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {safeArr(skills).map((s, i) => (
              <span key={i} style={{ background: "#111", color: "#fff", borderRadius: "3px", padding: "2px 8px", fontSize: "11px", fontWeight: "700" }}>
                {safe(s)}
              </span>
            ))}
          </div>
        </TechSection>
      )}

      {safeArr(experience).length > 0 && (
        <TechSection title="// EXPERIENCE">
          {safeArr(experience).map((exp, i) => <ExpBlock key={i} item={exp} tech />)}
        </TechSection>
      )}

      {safeArr(projects).length > 0 && (
        <TechSection title="// PROJECTS">
          {safeArr(projects).map((p, i) => <ProjectBlock key={i} item={p} tech />)}
        </TechSection>
      )}

      {safeArr(education).length > 0 && (
        <TechSection title="// EDUCATION">
          {safeArr(education).map((edu, i) => <EduBlock key={i} item={edu} tech />)}
        </TechSection>
      )}

      {safeArr(certifications).length > 0 && (
        <TechSection title="// CERTIFICATIONS">
          {safeArr(certifications).map((c, i) => (
            <p key={i} style={{ margin: "3px 0", fontSize: "12px", fontFamily: "Arial" }}>→ {renderCert(c)}</p>
          ))}
        </TechSection>
      )}

      {safeArr(achievements).length > 0 && (
        <TechSection title="// ACHIEVEMENTS">
          {safeArr(achievements).map((a, i) => (
            <p key={i} style={{ margin: "3px 0", fontSize: "12px", fontFamily: "Arial" }}>→ {renderAchievement(a)}</p>
          ))}
        </TechSection>
      )}
    </div>
  );
}

// ─── Section wrappers ─────────────────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <div style={{ marginBottom: "22px" }}>
      <h2 style={{ fontSize: "13px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.5px", color: "#6366f1", borderBottom: "1px solid #e0e0f0", paddingBottom: "4px", marginBottom: "12px" }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

function ATSSection({ title, children }) {
  return (
    <div style={{ marginBottom: "18px" }}>
      <h2 style={{ fontSize: "12px", fontWeight: "700", letterSpacing: "1.5px", borderBottom: "1px solid #ccc", paddingBottom: "3px", marginBottom: "10px" }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

function TechSection({ title, children }) {
  return (
    <div style={{ marginBottom: "22px" }}>
      <h2 style={{ fontSize: "13px", fontWeight: "900", color: "#111", marginBottom: "12px", letterSpacing: "-0.5px" }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

// ─── Shared blocks ────────────────────────────────────────────────────────────
function ExpBlock({ item, tech }) {
  if (!item) return null;
  const fontFam = tech ? "Arial, sans-serif" : "inherit";
  const bullets = safeArr(item.bullets);

  return (
    <div style={{ marginBottom: "14px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <strong style={{ fontSize: "14px", fontFamily: fontFam }}>
          {safe(item.title || item.role)}
        </strong>
        <span style={{ fontSize: "12px", color: "#666", fontFamily: fontFam }}>
          {safe(item.duration || item.dates)}
        </span>
      </div>
      <div style={{ fontSize: "12px", color: "#555", marginBottom: "6px", fontFamily: fontFam }}>
        {safe(item.company)}{item.location ? ` · ${safe(item.location)}` : ""}
      </div>
      {bullets.map((b, i) => (
        <p key={i} style={{ margin: "3px 0", fontSize: "13px", paddingLeft: "16px", fontFamily: fontFam }}>
          • {safe(b)}
        </p>
      ))}
    </div>
  );
}

function EduBlock({ item, tech }) {
  if (!item) return null;
  const fontFam = tech ? "Arial, sans-serif" : "inherit";
  return (
    <div style={{ marginBottom: "10px" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <strong style={{ fontSize: "14px", fontFamily: fontFam }}>{safe(item.degree)}</strong>
        <span style={{ fontSize: "12px", color: "#666", fontFamily: fontFam }}>{safe(item.year || item.dates)}</span>
      </div>
      <p style={{ margin: "2px 0", fontSize: "13px", color: "#555", fontFamily: fontFam }}>{safe(item.institution)}</p>
      {item.gpa && (
        <p style={{ margin: "2px 0", fontSize: "12px", color: "#777", fontFamily: fontFam }}>GPA: {safe(item.gpa)}</p>
      )}
    </div>
  );
}

function ProjectBlock({ item, tech }) {
  if (!item) return null;
  const fontFam = tech ? "Arial, sans-serif" : "inherit";
  const techList = safeArr(item.tech);
  const bullets = safeArr(item.bullets);

  return (
    <div style={{ marginBottom: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <strong style={{ fontSize: "13px", fontFamily: fontFam }}>{safe(item.name)}</strong>
        {item.link && (
          <a href={item.link} style={{ fontSize: "11px", color: "#6366f1", fontFamily: fontFam }}>View Project</a>
        )}
      </div>
      {techList.length > 0 && (
        <p style={{ margin: "2px 0 4px", fontSize: "11px", color: "#888", fontFamily: fontFam }}>
          Tech: {techList.map(t => safe(t)).join(", ")}
        </p>
      )}
      {item.description && (
        <p style={{ margin: "3px 0", fontSize: "13px", fontFamily: fontFam }}>{safe(item.description)}</p>
      )}
      {bullets.map((b, i) => (
        <p key={i} style={{ margin: "3px 0", fontSize: "13px", paddingLeft: "14px", fontFamily: fontFam }}>
          • {safe(b)}
        </p>
      ))}
    </div>
  );
}
