import React, { useState, useRef, useEffect } from "react";
import { ModernProfessionalTemplate, MinimalATSTemplate, TechDeveloperTemplate } from "./ResumeTemplates";

const TEMPLATES = [
  { id: "modern", label: "Modern Professional", icon: "🏛️" },
  { id: "minimal", label: "Minimal ATS", icon: "📄" },
  { id: "tech", label: "Tech Developer", icon: "💻" },
];

// ─── Missing field detector ───────────────────────────────────────────────────
function getMissingFields(data) {
  const missing = [];
  if (!data.name) missing.push({ key: "name", label: "Full Name", section: "contact" });
  if (!data.contact?.email) missing.push({ key: "email", label: "Email Address", section: "contact" });
  if (!data.contact?.phone) missing.push({ key: "phone", label: "Phone Number", section: "contact" });
  if (!data.contact?.linkedin) missing.push({ key: "linkedin", label: "LinkedIn URL", section: "contact" });
  if (!data.skills || data.skills.length === 0) missing.push({ key: "skills", label: "Skills", section: "skills" });
  if (!data.experience || data.experience.length === 0) missing.push({ key: "experience", label: "Work Experience", section: "experience" });
  if (!data.education || data.education.length === 0) missing.push({ key: "education", label: "Education", section: "education" });
  return missing;
}

// ─── Fill Missing Details Modal ───────────────────────────────────────────────
function FillDetailsModal({ missingFields, resumeData, onSave, onClose }) {
  const [values, setValues] = useState({
    name: resumeData.name || "",
    email: resumeData.contact?.email || "",
    phone: resumeData.contact?.phone || "",
    linkedin: resumeData.contact?.linkedin || "",
    skills: Array.isArray(resumeData.skills) ? resumeData.skills.join(", ") : "",
    experience: "",
    education: "",
  });

  function handleSave() {
    const updated = {
      ...resumeData,
      name: values.name || resumeData.name,
      contact: {
        ...resumeData.contact,
        email: values.email || resumeData.contact?.email,
        phone: values.phone || resumeData.contact?.phone,
        linkedin: values.linkedin || resumeData.contact?.linkedin,
      },
      skills: values.skills
        ? values.skills.split(",").map(s => s.trim()).filter(Boolean)
        : resumeData.skills,
      experience: values.experience
        ? [{ title: "Added Experience", company: "", duration: "", bullets: [values.experience] }]
        : resumeData.experience,
      education: values.education
        ? [{ degree: values.education, institution: "", year: "" }]
        : resumeData.education,
    };
    onSave(updated);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="rounded-2xl p-8 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto"
        style={{ background: "#0d0f23", border: "1px solid rgba(99,102,241,0.4)" }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-white font-bold text-xl">Complete Missing Details</h2>
            <p className="text-indigo-400 text-sm mt-1">Fill in to unlock a stronger ATS score</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors text-2xl leading-none">×</button>
        </div>

        {/* Warning banner */}
        <div className="rounded-xl p-4 mb-6 flex gap-3 items-start"
          style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.3)" }}>
          <span className="text-yellow-400 text-lg">⚠️</span>
          <div>
            <p className="text-yellow-300 text-sm font-semibold">Missing resume fields detected</p>
            <p className="text-yellow-400/70 text-xs mt-1">
              {missingFields.length} field{missingFields.length !== 1 ? "s" : ""} missing. Completing them improves your ATS score and recruiter visibility.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {missingFields.some(f => f.key === "name") && (
            <Field label="Full Name" placeholder="e.g. Jane Smith" value={values.name}
              onChange={v => setValues(p => ({ ...p, name: v }))} />
          )}
          {missingFields.some(f => f.key === "email") && (
            <Field label="Email Address" placeholder="e.g. jane@email.com" value={values.email}
              onChange={v => setValues(p => ({ ...p, email: v }))} />
          )}
          {missingFields.some(f => f.key === "phone") && (
            <Field label="Phone Number" placeholder="e.g. +1 (555) 000-0000" value={values.phone}
              onChange={v => setValues(p => ({ ...p, phone: v }))} />
          )}
          {missingFields.some(f => f.key === "linkedin") && (
            <Field label="LinkedIn URL" placeholder="e.g. linkedin.com/in/janesmith" value={values.linkedin}
              onChange={v => setValues(p => ({ ...p, linkedin: v }))} />
          )}
          {missingFields.some(f => f.key === "skills") && (
            <div>
              <label className="text-gray-300 text-sm font-medium mb-2 block">
                Skills <span className="text-indigo-400 text-xs">(comma-separated)</span>
              </label>
              <textarea
                value={values.skills}
                onChange={e => setValues(p => ({ ...p, skills: e.target.value }))}
                placeholder="e.g. Python, React, SQL, Machine Learning, AWS"
                rows={3}
                className="w-full rounded-xl px-4 py-3 text-sm text-white resize-none"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(99,102,241,0.3)", outline: "none" }}
              />
            </div>
          )}
          {missingFields.some(f => f.key === "experience") && (
            <div>
              <label className="text-gray-300 text-sm font-medium mb-2 block">
                Work Experience <span className="text-indigo-400 text-xs">(describe your most recent role)</span>
              </label>
              <textarea
                value={values.experience}
                onChange={e => setValues(p => ({ ...p, experience: e.target.value }))}
                placeholder="e.g. Software Engineer at Acme Corp (2021–2024) — built REST APIs, reduced load time by 40%, led a team of 3 engineers"
                rows={4}
                className="w-full rounded-xl px-4 py-3 text-sm text-white resize-none"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(99,102,241,0.3)", outline: "none" }}
              />
            </div>
          )}
          {missingFields.some(f => f.key === "education") && (
            <div>
              <label className="text-gray-300 text-sm font-medium mb-2 block">
                Education <span className="text-indigo-400 text-xs">(degree and institution)</span>
              </label>
              <textarea
                value={values.education}
                onChange={e => setValues(p => ({ ...p, education: e.target.value }))}
                placeholder="e.g. B.S. Computer Science — MIT, 2021"
                rows={3}
                className="w-full rounded-xl px-4 py-3 text-sm text-white resize-none"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(99,102,241,0.3)", outline: "none" }}
              />
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-8">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white transition-colors"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
            Cancel
          </button>
          <button onClick={handleSave}
            className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
            ✓ Update Resume Preview
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, placeholder, value, onChange }) {
  return (
    <div>
      <label className="text-gray-300 text-sm font-medium mb-2 block">{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl px-4 py-3 text-sm text-white"
        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(99,102,241,0.3)", outline: "none" }}
      />
    </div>
  );
}

// ─── Score Card ───────────────────────────────────────────────────────────────
function ScoreCard({ label, score, color, glow }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const safeScore = Math.max(0, Math.min(100, score || 0));
  const offset = circumference - (safeScore / 100) * circumference;
  return (
    <div className="rounded-2xl p-5 text-center"
      style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${color}33`, boxShadow: glow ? `0 0 24px ${color}22` : "none" }}>
      <p className="text-gray-400 text-xs mb-3">{label}</p>
      <svg width="100" height="100" viewBox="0 0 100 100" className="mx-auto mb-2">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8"/>
        <circle cx="50" cy="50" r={radius} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 50 50)"
          style={{ transition: "stroke-dashoffset 1s ease", filter: glow ? `drop-shadow(0 0 6px ${color})` : "none" }}/>
        <text x="50" y="55" textAnchor="middle" fill={color} fontSize="20" fontWeight="900">{safeScore}</text>
      </svg>
      <p className="text-xs" style={{ color }}>{safeScore >= 85 ? "Excellent" : safeScore >= 70 ? "Good" : "Needs Work"}</p>
    </div>
  );
}

// ─── Improvements Panel ───────────────────────────────────────────────────────
function ImprovementsPanel({ improvements }) {
  if (!improvements || improvements.length === 0) {
    return (
      <div className="rounded-2xl p-8 text-center"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <p className="text-gray-400">Improvements breakdown will appear here.</p>
      </div>
    );
  }
  return improvements.map((imp, i) => (
    <div key={i} className="rounded-2xl p-5"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(99,102,241,0.15)" }}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-bold px-3 py-1 rounded-full"
          style={{ background: "rgba(16,185,129,0.15)", color: "#10b981" }}>{imp.section}</span>
        {imp.impact && <span className="text-xs text-indigo-400">+{imp.impact} pts</span>}
      </div>
      {imp.before && (
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl p-3" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <p className="text-xs text-red-400 mb-2 font-semibold">Before</p>
            <p className="text-gray-300 text-sm">{imp.before}</p>
          </div>
          <div className="rounded-xl p-3" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
            <p className="text-xs text-green-400 mb-2 font-semibold">After</p>
            <p className="text-gray-300 text-sm">{imp.after}</p>
          </div>
        </div>
      )}
      {imp.note && <p className="text-gray-500 text-xs mt-3">{imp.note}</p>}
    </div>
  ));
}

// ─── MAIN MODAL ───────────────────────────────────────────────────────────────
export default function ResumeImproverModal({ open, onClose, improvedData, originalScore }) {
  const [activeTemplate, setActiveTemplate] = useState("modern");
  const [activeTab, setActiveTab] = useState("preview");
  const [showFillModal, setShowFillModal] = useState(false);
  const [localData, setLocalData] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  // Sync localData when improvedData changes
  useEffect(() => {
    if (improvedData) setLocalData(improvedData);
  }, [improvedData]);

  if (!open || !localData) return null;

  const {
    name, contact, improved_summary, improved_skills, improved_experience,
    education, projects, certifications, achievements,
    ats_score_before, ats_score_after, improvements,
  } = localData;

  const resumeData = {
    name: name || null,
    contact: contact || {},
    summary: improved_summary || null,
    skills: safeArray(improved_skills),
    experience: safeArray(improved_experience),
    education: safeArray(education),
    projects: safeArray(projects),
    certifications: safeArray(certifications),
    achievements: safeArray(achievements),
  };

  const missingFields = getMissingFields(resumeData);
  const scoreGain = (ats_score_after || 0) - (ats_score_before || originalScore || 0);

  function TemplateComponent() {
    if (activeTemplate === "minimal") return <MinimalATSTemplate data={resumeData} />;
    if (activeTemplate === "tech") return <TechDeveloperTemplate data={resumeData} />;
    return <ModernProfessionalTemplate data={resumeData} />;
  }

  function handleFillSave(updatedResume) {
    setLocalData(prev => ({
      ...prev,
      name: updatedResume.name,
      contact: updatedResume.contact,
      improved_skills: updatedResume.skills,
      improved_experience: updatedResume.experience,
      education: updatedResume.education,
    }));
    setShowFillModal(false);
  }

  async function downloadPDF() {
    setPdfLoading(true);
    try {
      const el = document.getElementById("resume-preview");
      if (!el) { alert("Resume preview not found."); return; }

      // Load html2pdf from CDN via script tag (avoids ESM import issues)
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js");

      const html2pdf = window.html2pdf;
      if (!html2pdf) throw new Error("html2pdf not loaded");

      const safeName = (name || "resume").replace(/[^a-z0-9]/gi, "_");

      await html2pdf()
        .set({
          margin: [8, 8, 8, 8],
          filename: "Improved_Resume.pdf",
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            letterRendering: true,
            allowTaint: true,
          },
          jsPDF: {
            unit: "mm",
            format: "a4",
            orientation: "portrait",
            compress: true,
          },
          pagebreak: { mode: ["avoid-all", "css", "legacy"] },
        })
        .from(el)
        .save();
    } catch (err) {
      console.error("PDF Error:", err);
      alert("PDF generation failed. Try the HTML download instead.");
    } finally {
      setPdfLoading(false);
    }
  }

  function downloadHTML() {
    const el = document.getElementById("resume-preview");
    if (!el) return;
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${name || "Resume"}</title><style>body{margin:0;padding:0;}</style></head><body>${el.outerHTML}</body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Improved_Resume.html";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="fixed inset-0 z-50 overflow-auto" style={{ background: "rgba(3,5,18,0.97)", backdropFilter: "blur(24px)" }}>

      {/* Top bar */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4"
        style={{ background: "rgba(13,15,35,0.95)", borderBottom: "1px solid rgba(99,102,241,0.2)" }}>
        <div className="flex items-center gap-4">
          <button onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
          </button>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">ATS-Optimized Resume</h1>
            <p className="text-indigo-400 text-xs">AI-Enhanced • Recruiter Ready</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={downloadHTML}
            className="px-4 py-2 rounded-xl text-sm font-medium border border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/10 transition-all">
            ⬇ HTML
          </button>
          <button onClick={downloadPDF} disabled={pdfLoading}
            className="px-4 py-2 rounded-xl text-sm font-bold text-white transition-all flex items-center gap-2"
            style={{ background: pdfLoading ? "rgba(99,102,241,0.5)" : "linear-gradient(135deg,#6366f1,#8b5cf6)", cursor: pdfLoading ? "wait" : "pointer" }}>
            {pdfLoading ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" /> Generating...</>
            ) : "⬇ Download PDF"}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Missing Fields Warning */}
        {missingFields.length > 0 && (
          <div className="rounded-2xl p-5 mb-6 flex items-center justify-between gap-4"
            style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.35)" }}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="text-yellow-300 font-semibold text-sm">Missing resume details detected</p>
                <p className="text-yellow-400/70 text-xs mt-0.5">
                  {missingFields.map(f => f.label).join(", ")} {missingFields.length === 1 ? "is" : "are"} missing from your resume.
                </p>
              </div>
            </div>
            <button onClick={() => setShowFillModal(true)}
              className="shrink-0 px-5 py-2 rounded-xl text-sm font-bold text-white whitespace-nowrap transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)" }}>
              ✏️ Complete Missing Details
            </button>
          </div>
        )}

        {/* Score Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <ScoreCard label="Original ATS Score" score={ats_score_before || originalScore} color="#ef4444" />
          <ScoreCard label="Optimized ATS Score" score={ats_score_after} color="#10b981" glow />
          <div className="rounded-2xl p-5 text-center flex flex-col items-center justify-center"
            style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.3)" }}>
            <p className="text-gray-400 text-xs mb-1">Score Improvement</p>
            <p className="text-4xl font-black" style={{ color: "#a5f3fc" }}>
              {scoreGain >= 0 ? "+" : ""}{scoreGain}
            </p>
            <p className="text-cyan-400 text-xs mt-1">points gained</p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2 mb-6">
          {["preview", "improvements"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${
                activeTab === tab ? "text-white" : "text-gray-500 hover:text-gray-300"
              }`}
              style={activeTab === tab ? { background: "linear-gradient(135deg,#6366f1,#8b5cf6)" } : { background: "rgba(255,255,255,0.05)" }}>
              {tab === "preview" ? "📄 Resume Preview" : "✨ Improvements"}
            </button>
          ))}
        </div>

        {activeTab === "preview" && (
          <div>
            {/* Template Switcher */}
            <div className="flex gap-3 mb-6 flex-wrap">
              {TEMPLATES.map(t => (
                <button key={t.id} onClick={() => setActiveTemplate(t.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    activeTemplate === t.id ? "text-white" : "text-gray-400 hover:text-white"
                  }`}
                  style={activeTemplate === t.id ? {
                    background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.6)"
                  } : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            {/* Resume Preview */}
            <div className="rounded-2xl overflow-hidden shadow-2xl"
              style={{ border: "1px solid rgba(99,102,241,0.2)", background: "#fff" }}>
              <TemplateComponent />
            </div>
          </div>
        )}

        {activeTab === "improvements" && (
          <div className="space-y-4">
            <ImprovementsPanel improvements={improvements} />
          </div>
        )}
      </div>

      {/* Fill Details Modal */}
      {showFillModal && (
        <FillDetailsModal
          missingFields={missingFields}
          resumeData={resumeData}
          onSave={handleFillSave}
          onClose={() => setShowFillModal(false)}
        />
      )}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function safeArray(val) {
  if (Array.isArray(val)) return val;
  if (val && typeof val === "object") return Object.values(val);
  return [];
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}