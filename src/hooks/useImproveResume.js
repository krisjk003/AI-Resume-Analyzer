import { useState } from "react";

export function useImproveResume() {
  const [loading, setLoading] = useState(false);
  const [improvedData, setImprovedData] = useState(null);
  const [error, setError] = useState(null);

  async function improveResume(analysisData) {
    setLoading(true);
    setError(null);
    try {
      // Send the FULL analysis result (including parsed_resume) to the server
      const res = await fetch("https://ai-resume-analyzer-sbav.onrender.com", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysisData }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to improve resume");
      }
      const data = await res.json();
      setImprovedData(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return { loading, improvedData, error, improveResume, setImprovedData };
}
