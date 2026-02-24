document.addEventListener("DOMContentLoaded", function () {

  const form = document.getElementById("resumeForm");
  const output = document.getElementById("output");
  const scoreValue = document.getElementById("scoreValue");
  const progressFill = document.getElementById("progressFill");
  const resultDiv = document.getElementById("result");
  const analyzeBtn = document.getElementById("analyzeBtn");

  const fileInput = document.getElementById("resumeInput");
  const fileLabel = document.getElementById("fileLabel");
  const uploadBox = document.querySelector(".upload-box");

  /* 🔥 FILE NAME DISPLAY */
  fileInput.addEventListener("change", function () {
    if (fileInput.files.length > 0) {
      const file = fileInput.files[0];
      fileLabel.textContent = `Selected: ${file.name}`;
      uploadBox.style.borderColor = "#00f5ff";
    } else {
      fileLabel.textContent = "";
      uploadBox.style.borderColor = "rgba(255,255,255,0.3)";
    }
  });

  /* 🔥 DRAG & DROP SUPPORT */
  uploadBox.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadBox.style.borderColor = "#00f5ff";
    uploadBox.style.background = "rgba(0,245,255,0.1)";
  });

  uploadBox.addEventListener("dragleave", () => {
    uploadBox.style.borderColor = "rgba(255,255,255,0.3)";
    uploadBox.style.background = "rgba(255,255,255,0.05)";
  });

  uploadBox.addEventListener("drop", (e) => {
    e.preventDefault();
    fileInput.files = e.dataTransfer.files;
    const file = fileInput.files[0];
    if (file) {
      fileLabel.textContent = `Selected: ${file.name}`;
    }
  });

  /* 🔥 FORM SUBMIT */
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    if (!fileInput.files.length) {
      alert("Please upload a resume PDF.");
      return;
    }

    analyzeBtn.disabled = true;
    analyzeBtn.textContent = "Analyzing...";
    output.classList.add("hidden");

    resultDiv.innerHTML = `
      <div class="card">
        <h3>Analyzing Resume...</h3>
        <p>Please wait. AI is working...</p>
      </div>
    `;

    try {
      const formData = new FormData(form);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Server error");
      }

      const data = await response.json();

      output.classList.remove("hidden");

      scoreValue.textContent = (data.atsScore || 0) + "%";
      progressFill.style.width = (data.atsScore || 0) + "%";

      resultDiv.innerHTML = `
        <div class="card">
          <h3>Similarity Score</h3>
          <p>${data.similarityScore || 0}%</p>
        </div>

        <div class="card">
          <h3>Matched Skills</h3>
          <ul>
            ${(data.matchedSkills || []).map(skill => `<li>${skill}</li>`).join("")}
          </ul>
        </div>

        <div class="card">
          <h3>Missing Skills</h3>
          <ul>
            ${(data.missingSkills || []).map(skill => `<li>${skill}</li>`).join("")}
          </ul>
        </div>

        <div class="card">
          <h3>Strengths</h3>
          <ul>
            ${(data.feedback?.strengths || []).map(item => `<li>${item}</li>`).join("")}
          </ul>
        </div>

        <div class="card">
          <h3>Weaknesses</h3>
          <ul>
            ${(data.feedback?.weaknesses || []).map(item => `<li>${item}</li>`).join("")}
          </ul>
        </div>

        <div class="card">
          <h3>Suggestions</h3>
          <ul>
            ${(data.feedback?.suggestions || []).map(item => `<li>${item}</li>`).join("")}
          </ul>
        </div>
      `;

    } catch (error) {
      resultDiv.innerHTML = `
        <div class="card">
          <h3 style="color:red;">Error</h3>
          <p>${error.message}</p>
        </div>
      `;
    } finally {
      analyzeBtn.disabled = false;
      analyzeBtn.textContent = "Analyze Resume";
    }
  });

});