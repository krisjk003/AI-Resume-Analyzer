const path = require("path");
const fs = require("fs");

const extractTextFromPDF = require("../services/pdfService");
const analyzeWithAI = require("../services/aiAnalyzer");

exports.analyzeResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Resume file is required" });
    }

    const jobDescription = req.body.jobDescription;
    if (!jobDescription) {
      return res.status(400).json({ error: "Job description is required" });
    }

    const filePath = path.join(__dirname, "../uploads", req.file.filename);

    // 1️⃣ Extract resume text
    const resumeText = await extractTextFromPDF(filePath);

    // Delete uploaded file
    fs.unlinkSync(filePath);

    // 2️⃣ Send to Phi-3 AI
    const aiResult = await analyzeWithAI(resumeText, jobDescription);

    // 3️⃣ Return AI result directly
    return res.json(aiResult);

  } catch (error) {
    console.error("Error analyzing resume:", error);
    return res.status(500).json({ error: "Server error" });
  }
};