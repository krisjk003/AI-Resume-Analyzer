const axios = require("axios");

// 🔹 Clean PDF text (remove weird unicode + extra spaces)
function cleanText(text) {
  if (!text) return "";
  return text
    .replace(/[^\x00-\x7F]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function analyzeWithAI(resumeText, jobDescription) {
  try {
    const cleanedResume = cleanText(resumeText).slice(0, 2500);
    const cleanedJD = cleanText(jobDescription).slice(0, 2000);

 const prompt = `
You are an ATS scoring system.

Compare the resume with the job description.

Rules:
- atsScore must be a number between 0 and 100.
- similarityScore must be a number between 0 and 100.
- Never return null.
- Always provide numeric values.

Return JSON only with this structure:

{
  "atsScore": number,
  "similarityScore": number,
  "matchedSkills": [],
  "missingSkills": [],
  "feedback": {
    "strengths": [],
    "weaknesses": [],
    "suggestions": []
  }
}

Resume:
${cleanedResume}

Job Description:
${cleanedJD}
`;

    console.log("Prompt length:", prompt.length);
    console.log("Sending request to Ollama...");

    const response = await axios.post(
      "http://localhost:11434/api/generate",
      {
        model: "phi3",
        prompt: prompt,
        stream: false,
        format: "json",
        options: {
          temperature: 0,
          num_predict: 800
        }
      },
      {
        timeout: 0
      }
    );

    console.log("Received response from Ollama.");

    let rawText = response.data.response;

    console.log("RAW AI TEXT:", rawText);

    // 🔥 CLEAN AI RESPONSE

    // 🔥 CLEAN AI RESPONSE

// Remove markdown blocks
rawText = rawText.replace(/```json|```/g, "");

// Remove JS-style comments
rawText = rawText.replace(/\/\/.*$/gm, "");

// Remove trailing commas
rawText = rawText.replace(/,\s*([}\]])/g, "$1");

// Trim extra spaces
rawText = rawText.trim();

// 🔥 Find FIRST valid JSON object safely
const firstBrace = rawText.indexOf("{");
const lastBrace = rawText.lastIndexOf("}");

if (firstBrace === -1 || lastBrace === -1) {
  throw new Error("No JSON object found");
}

const cleanJsonString = rawText.substring(firstBrace, lastBrace + 1);

const parsed = JSON.parse(cleanJsonString);
   

    return parsed;

  } catch (error) {
    console.error("AI ERROR:", error.message);
    throw new Error("AI analysis failed");
  }
}

module.exports = analyzeWithAI;