import express from "express";
import multer from "multer";
import cors from "cors";
import fs from "fs";
import dotenv from "dotenv";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

// ─── HELPER: call Groq API ────────────────────────────────────────────────────
async function callGroq(messages, temperature = 0.2) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages,
      temperature,
    }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`Groq API error: ${JSON.stringify(err)}`);
  }
  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

// ─── HELPER: safe JSON extract ────────────────────────────────────────────────
function extractJSON(text) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON found in response");
  return JSON.parse(match[0]);
}

// ✅ ATS ANALYZER ROUTE
app.post("/upload", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const filePath = req.file.path;
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    const resumeText = pdfData.text;
    console.log("📄 Extracted Text Length:", resumeText.length);

    // STEP 1: Parse the resume into structured data
    const parsePrompt = `You are a resume parser. Extract ALL information from this resume text into structured JSON.

Extract EXACTLY what is in the resume - do NOT invent or fill in anything that isn't there.
If a field is not found, use null or empty array [].

Return ONLY valid JSON:
{
  "name": "extracted full name or null",
  "contact": {
    "email": "extracted email or null",
    "phone": "extracted phone or null",
    "location": "extracted location/city or null",
    "linkedin": "extracted linkedin url or null",
    "github": "extracted github url or null",
    "website": "extracted website or null"
  },
  "summary": "extracted summary/objective paragraph or null",
  "skills": ["skill1", "skill2"],
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "location": "City, State",
      "duration": "Jan 2022 - Present",
      "bullets": ["bullet point 1", "bullet point 2"]
    }
  ],
  "education": [
    {
      "degree": "Degree Name",
      "institution": "University Name",
      "year": "2020",
      "gpa": "3.8 or null"
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "tech": ["tech1", "tech2"],
      "description": "description",
      "bullets": ["bullet1"]
    }
  ],
  "certifications": ["cert1", "cert2"],
  "achievements": ["achievement1"],
  "detected_domains": [],
  "primary_domain": ""
}

Resume text:
${resumeText}`;

    // STEP 2: ATS scoring
    const atsPrompt = `You are a HYPER-STRICT ATS system used by top global companies.

Analyze this resume text and return ONLY valid JSON:
{
  "ats_score": number,
  "missing_keywords": [],
  "strengths": [],
  "weaknesses": [],
  "suggestions": []
}

SCORING RULES:
- Start at 50
- Add for strong quantified results (+10), real experience (+10), advanced work (+10)
- Subtract for no measurable results (-15), weak projects (-10), missing keywords (-10), poor phrasing (-5), repetition (-5), poor structure (-5), missing sections (-10)
- Most resumes score 45-75. Do NOT give 80+ unless truly exceptional.
- Always find at least 3 specific weaknesses.

Resume:
${resumeText}`;

    const [parsedRaw, atsRaw] = await Promise.all([
      callGroq([
        { role: "system", content: "You are a resume parser. Return STRICT JSON only. No markdown." },
        { role: "user", content: parsePrompt }
      ], 0.1),
      callGroq([
        { role: "system", content: "You are an ATS resume analyzer. Return STRICT JSON only." },
        { role: "user", content: atsPrompt }
      ], 0.2)
    ]);

    let parsedResume = {};
    let atsResult = {};

    try { parsedResume = extractJSON(parsedRaw); } catch (e) { console.error("Parse error:", e); }
    try {
      atsResult = extractJSON(atsRaw);
      atsResult.ats_score = Math.round(atsResult.ats_score);
    } catch (e) { console.error("ATS parse error:", e); }

    // Merge: put parsed resume data INTO the ATS result so frontend has everything
    const combined = {
      ...atsResult,
      // ATS fields
      ats_score: atsResult.ats_score || 50,
      missing_keywords: atsResult.missing_keywords || [],
      strengths: atsResult.strengths || [],
      weaknesses: atsResult.weaknesses || [],
      suggestions: atsResult.suggestions || [],
      // Parsed resume fields
      parsed_resume: parsedResume,
    };

    console.log("✅ COMBINED RESULT:", JSON.stringify(combined, null, 2));
    fs.unlinkSync(filePath);
    res.json(combined);

  } catch (err) {
    console.error("🔥 SERVER ERROR:", err);
    res.status(500).json({ error: "Error processing resume" });
  }
});

// ✅ IMPROVE RESUME ROUTE
app.post("/api/improve-resume", async (req, res) => {
  const { analysisData } = req.body;

  if (!analysisData) return res.status(400).json({ error: "No analysis data provided" });

  // Extract parsed resume from the analysis result
  const parsedResume = analysisData.parsed_resume || {};
  const missingKeywords = analysisData.missing_keywords || [];
  const weaknesses = analysisData.weaknesses || [];
  const atsScoreBefore = analysisData.ats_score || 0;

  const prompt = `You are an expert ATS resume optimization specialist.

Here is the REAL resume data extracted from the user's actual resume:
${JSON.stringify(parsedResume, null, 2)}

ATS Analysis findings:
- Missing keywords: ${JSON.stringify(missingKeywords)}
- Weaknesses identified: ${JSON.stringify(weaknesses)}
- Current ATS score: ${atsScoreBefore}

YOUR TASK:
1. Use the EXACT personal details from the resume (name, email, phone, etc.)
2. Keep ALL original experience, education, projects exactly as they are
3. IMPROVE bullet points - make them stronger with action verbs and quantified impact
4. Integrate the missing keywords NATURALLY into bullets and summary
5. Write an improved professional summary using their actual background
6. Add relevant skills they likely have based on their experience (do not invent unrelated skills)
7. Fix weak phrasing and passive voice

CRITICAL RULES:
- NEVER use placeholder text like "Full Name", "example@email.com", "ABC Corporation"
- Use ONLY the actual name: "${parsedResume.name || 'extract from resume'}"
- Use ONLY the actual email: "${parsedResume.contact?.email || 'from resume'}"
- Keep ALL original companies, job titles, school names EXACTLY as they appear
- If a field is null/empty in the original, keep it null - do not invent data

Return ONLY valid JSON:
{
  "name": "${parsedResume.name || ''}",
  "contact": ${JSON.stringify(parsedResume.contact || {})},
  "improved_summary": "rewritten compelling summary using their real background",
  "improved_skills": ["skill1", "skill2"],
  "improved_experience": [
    {
      "title": "exact job title from original",
      "company": "exact company from original",
      "location": "exact location from original",
      "duration": "exact dates from original",
      "bullets": ["improved bullet 1", "improved bullet 2"]
    }
  ],
  "education": ${JSON.stringify(parsedResume.education || [])},
  "projects": [],
  "certifications": ${JSON.stringify(parsedResume.certifications || [])},
  "achievements": ${JSON.stringify(parsedResume.achievements || [])},
  "ats_score_before": ${atsScoreBefore},
  "ats_score_after": number,
  "improvements": [
    {
      "section": "section name",
      "before": "original text",
      "after": "improved text",
      "impact": number,
      "note": "why this improves ATS"
    }
  ]
}`;

  try {
    const rawText = await callGroq([
      { role: "system", content: "You are an ATS resume optimization expert. Return STRICT JSON only. Never use placeholder text." },
      { role: "user", content: prompt }
    ], 0.3);

    console.log("🧠 IMPROVED RESUME RAW:", rawText.substring(0, 500));

    const improved = extractJSON(rawText);
    console.log("✅ IMPROVED RESUME PARSED:", JSON.stringify(improved, null, 2));
    return res.json(improved);

  } catch (err) {
    console.error("🔥 Improve Resume Error:", err);
    return res.status(500).json({ error: err.message || "Failed to improve resume" });
  }
});

app.listen(5000, () => console.log("🚀 Server running on port 5000"));
