import React, { useEffect, useState } from "react";

const steps = [
  "Parsing your resume sections...",
  "Analyzing ATS keyword gaps...",
  "Rewriting bullet points with impact...",
  "Optimizing action verbs & metrics...",
  "Structuring for recruiter readability...",
  "Finalizing ATS-optimized layout...",
];

export default function OptimizingLoader() {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const stepTimer = setInterval(() => {
      setStep((s) => Math.min(s + 1, steps.length - 1));
    }, 1400);
    const progressTimer = setInterval(() => {
      setProgress((p) => Math.min(p + 1, 95));
    }, 110);
    return () => {
      clearInterval(stepTimer);
      clearInterval(progressTimer);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(5,7,20,0.95)", backdropFilter: "blur(20px)" }}>
      <div className="text-center max-w-md px-8">
        {/* Animated orb */}
        <div className="relative mx-auto w-28 h-28 mb-10">
          <div className="absolute inset-0 rounded-full animate-ping"
            style={{ background: "rgba(99,102,241,0.3)", animationDuration: "1.5s" }} />
          <div className="absolute inset-2 rounded-full animate-spin"
            style={{
              background: "conic-gradient(from 0deg, #6366f1, #8b5cf6, #06b6d4, #6366f1)",
              animationDuration: "2s",
            }} />
          <div className="absolute inset-4 rounded-full flex items-center justify-center"
            style={{ background: "#0d0f23" }}>
            <svg className="w-10 h-10" fill="none" stroke="url(#grad)" viewBox="0 0 24 24">
              <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1"/>
                  <stop offset="100%" stopColor="#06b6d4"/>
                </linearGradient>
              </defs>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">Optimizing Your Resume</h2>
        <p className="text-indigo-300 mb-8 text-sm">Powered by AI • ATS Intelligence Engine</p>

        {/* Step text */}
        <div className="h-6 mb-6">
          <p key={step} className="text-gray-300 text-sm animate-pulse">{steps[step]}</p>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-800 rounded-full h-2 mb-3">
          <div
            className="h-2 rounded-full transition-all duration-300"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4)",
            }}
          />
        </div>
        <p className="text-gray-500 text-xs">{progress}% complete</p>
      </div>
    </div>
  );
}