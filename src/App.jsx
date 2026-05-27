import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import OptimizingLoader from "./components/OptimizingLoader";
import ImproveResumeButton from "./components/ImproveResumeButton";
import ResumeImproverModal from "./components/ResumeImproverModal";
import { useImproveResume } from "./hooks/useImproveResume";

// ─── HELPER: parse raw or already-parsed result ───────────────────────────────
function parseResult(data) {
  // Already parsed correctly
  if (data.ats_score !== undefined) return data;
  // Backend returned { raw: "```json...```" } because cleanAndParseJSON failed
  if (data.raw) {
    try {
      const cleaned = data.raw.replace(/```json|```/g, "").trim();
      return JSON.parse(cleaned);
    } catch (e) {
      console.error("Failed to parse raw JSON from backend:", e);
    }
  }
  return data;
}

// ─── 3D PAPER CARD ───────────────────────────────────────────────────────────
function ResumeCard() {
  const cardRef = useRef(null);
  const rawX = useMotionValue(-6);
  const rawY = useMotionValue(8);
  const rotateY = useSpring(rawX, { stiffness: 60, damping: 18 });
  const rotateX = useSpring(rawY, { stiffness: 60, damping: 18 });
  const shine = useTransform(rotateY, [-20, 20], ["-40%", "140%"]);

  function onMove(e) {
    const r = cardRef.current.getBoundingClientRect();
    rawX.set(((e.clientX - r.left) / r.width - 0.5) * 22);
    rawY.set(-((e.clientY - r.top) / r.height - 0.5) * 16);
  }
  function onLeave() { rawX.set(-6); rawY.set(8); }

  return (
    <motion.div ref={cardRef} onMouseMove={onMove} onMouseLeave={onLeave}
      animate={{ y: [0, -22, -8, 0], rotateZ: [0.8, -1.2, 1.6, 0.8] }}
      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: 1000 }}
      className="relative cursor-pointer select-none" whileHover={{ scale: 1.03 }}>
      <motion.div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[220px] h-[40px] rounded-full"
        style={{ background: "radial-gradient(ellipse, rgba(168,85,247,0.35) 0%, transparent 70%)", filter: "blur(12px)" }} />
      <div style={{ position:"absolute", left:-5, top:6, bottom:10, width:5, background:"linear-gradient(90deg,#1a0040,#3b0080)", borderRadius:"3px 0 0 3px" }} />
      <div style={{ position:"absolute", bottom:-5, left:6, right:10, height:5, background:"linear-gradient(180deg,#1a0040,#2d0060)", borderRadius:"0 0 3px 3px" }} />
      <div style={{ width:280, borderRadius:"6px 6px 5px 5px", background:"linear-gradient(155deg,#f5f2ff 0%,#ece6ff 35%,#f0ebff 65%,#e6deff 100%)", boxShadow:`0 2px 0 rgba(255,255,255,0.95) inset,22px 44px 90px rgba(60,0,140,0.55),6px 10px 30px rgba(168,85,247,0.45),0 0 0 0.5px rgba(168,85,247,0.4)`, position:"relative", overflow:"hidden", padding:"22px 18px 26px" }}>
        <motion.div style={{ position:"absolute", inset:0, zIndex:10, pointerEvents:"none", background:"linear-gradient(105deg,transparent 25%,rgba(255,255,255,0.42) 50%,transparent 75%)", left:shine, width:"60%" }} />
        <div style={{ position:"absolute", top:0, right:0, width:38, height:38, overflow:"hidden", zIndex:8 }}>
          <div style={{ position:"absolute", top:0, right:0, borderStyle:"solid", borderWidth:"0 38px 38px 0", borderColor:"transparent #c8b8ff transparent transparent" }} />
        </div>
        <div style={{ position:"relative", zIndex:20 }}>
          <div style={{ height:8, borderRadius:4, width:"58%", background:"rgba(130,80,230,0.5)", marginBottom:8 }} />
          <div style={{ height:6, borderRadius:4, width:"35%", background:"rgba(150,100,250,0.28)", marginBottom:14 }} />
          <div style={{ height:"0.5px", background:"rgba(120,80,200,0.22)", marginBottom:14 }} />
          {[100,88,75,62].map((w,i)=>(<div key={i} style={{ height:6, borderRadius:4, width:`${w}%`, background:"rgba(190,170,255,0.22)", marginBottom:7 }} />))}
          <div style={{ height:"0.5px", background:"rgba(120,80,200,0.18)", margin:"12px 0" }} />
          <div style={{ height:6, borderRadius:4, width:"40%", background:"rgba(200,80,255,0.38)", marginBottom:8 }} />
          {[100,82,68].map((w,i)=>(<div key={i} style={{ height:6, borderRadius:4, width:`${w}%`, background:i===1?"rgba(210,90,255,0.3)":"rgba(180,130,255,0.24)", marginBottom:7 }} />))}
        </div>
      </div>
    </motion.div>
  );
}

function Particle({ style }) {
  return (
    <motion.div className="absolute rounded-full pointer-events-none" style={style}
      animate={{ y: [0, -120, 0], opacity: [0, style.opacity, 0] }}
      transition={{ duration: style.duration, repeat: Infinity, ease: "easeInOut", delay: style.delay }} />
  );
}

function Pill({ icon, label }) {
  return (
    <motion.div whileHover={{ scale: 1.06, y: -2 }}
      className="flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium"
      style={{ background:"rgba(168,85,247,0.08)", border:"0.5px solid rgba(168,85,247,0.3)", color:"#d8b4fe", backdropFilter:"blur(8px)" }}>
      <span style={{ fontSize:14 }}>{icon}</span><span>{label}</span>
    </motion.div>
  );
}

function StatCard({ value, label, delay }) {
  return (
    <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ delay, duration:0.6 }}
      whileHover={{ scale:1.04, y:-4 }}
      style={{ background:"rgba(255,255,255,0.03)", border:"0.5px solid rgba(168,85,247,0.2)", borderRadius:16, padding:"20px 24px", backdropFilter:"blur(12px)", minWidth:120 }}>
      <div style={{ fontSize:28, fontWeight:700, background:"linear-gradient(135deg,#e879f9,#a855f7)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>{value}</div>
      <div style={{ fontSize:12, color:"rgba(255,255,255,0.45)", marginTop:4, letterSpacing:"0.05em", textTransform:"uppercase" }}>{label}</div>
    </motion.div>
  );
}

// ─── LOADING SCREEN ───────────────────────────────────────────────────────────
function LoadingScreen() {
  const steps = ["Parsing your resume...", "Running ATS checks...", "Scoring keywords...", "Generating suggestions..."];
  const [step, setStep] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setStep(s => Math.min(s + 1, steps.length - 1)), 1200);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center"
      style={{ background:"#04000d", fontFamily:"'DM Sans', system-ui, sans-serif" }}>
      <div style={{ position:"fixed", left:"-20%", top:"10%", width:700, height:700, background:"radial-gradient(circle,rgba(139,60,255,0.22) 0%,transparent 65%)", borderRadius:"50%", pointerEvents:"none" }} />
      <div style={{ position:"fixed", right:"-20%", bottom:"5%", width:700, height:700, background:"radial-gradient(circle,rgba(236,72,153,0.18) 0%,transparent 65%)", borderRadius:"50%", pointerEvents:"none" }} />
      <motion.div initial={{ scale:0.8, opacity:0 }} animate={{ scale:1, opacity:1 }} transition={{ duration:0.5 }}
        className="flex flex-col items-center gap-6">
        <div style={{ position:"relative", width:100, height:100 }}>
          <motion.div animate={{ rotate:360 }} transition={{ duration:1, repeat:Infinity, ease:"linear" }}
            style={{ position:"absolute", inset:0, borderRadius:"50%", border:"3px solid transparent", borderTopColor:"#a855f7", borderRightColor:"rgba(168,85,247,0.3)" }} />
          <motion.div animate={{ rotate:-360 }} transition={{ duration:1.5, repeat:Infinity, ease:"linear" }}
            style={{ position:"absolute", inset:6, borderRadius:"50%", border:"2px solid transparent", borderTopColor:"#f472b6", borderLeftColor:"rgba(244,114,182,0.2)" }} />
          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <div style={{ width:14, height:14, borderRadius:"50%", background:"linear-gradient(135deg,#a855f7,#f472b6)" }} />
          </div>
        </div>
        <div style={{ textAlign:"center" }}>
          <motion.p key={step} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
            style={{ fontSize:18, fontWeight:700, color:"white", letterSpacing:"-0.02em" }}>{steps[step]}</motion.p>
          <p style={{ fontSize:13, color:"rgba(255,255,255,0.35)", marginTop:6 }}>Powered by AI · Usually takes a few seconds</p>
        </div>
        <div style={{ display:"flex", gap:8, marginTop:8 }}>
          {steps.map((_, i) => (
            <motion.div key={i}
              animate={{ width: i === step ? 24 : 8, background: i <= step ? "#a855f7" : "rgba(255,255,255,0.12)" }}
              style={{ height:8, borderRadius:999 }} />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ─── SCORE RING ───────────────────────────────────────────────────────────────
function ScoreRing({ score }) {
  const [displayed, setDisplayed] = useState(0);
  const RADIUS = 82;
  const CIRC = 2 * Math.PI * RADIUS;

  useEffect(() => {
    let cur = 0;
    const tick = () => {
      cur = Math.min(cur + Math.ceil(score / 80), score);
      setDisplayed(cur);
      if (cur < score) requestAnimationFrame(tick);
    };
    const t = setTimeout(() => requestAnimationFrame(tick), 300);
    return () => clearTimeout(t);
  }, [score]);

  const offset = CIRC * (1 - displayed / 100);
  const color = score >= 75 ? { from:"#4ade80", to:"#22c55e" }
              : score >= 50 ? { from:"#fbbf24", to:"#f59e0b" }
              :               { from:"#f87171", to:"#ef4444" };
  const label = score >= 75 ? { text:"Strong score", cls:"good" }
              : score >= 50 ? { text:"Needs improvement", cls:"avg" }
              :               { text:"Needs major work", cls:"low" };

  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", marginBottom:40 }}>
      <div style={{ position:"relative", width:200, height:200 }}>
        <svg width="200" height="200" viewBox="0 0 200 200" style={{ transform:"rotate(-90deg)" }}>
          <defs>
            <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color.from} /><stop offset="100%" stopColor={color.to} />
            </linearGradient>
          </defs>
          <circle cx="100" cy="100" r={RADIUS} fill="none" stroke="rgba(168,85,247,0.12)" strokeWidth="14" />
          <motion.circle cx="100" cy="100" r={RADIUS} fill="none" stroke="url(#ringGrad)" strokeWidth="14"
            strokeLinecap="round" strokeDasharray={CIRC}
            initial={{ strokeDashoffset: CIRC }} animate={{ strokeDashoffset: offset }}
            transition={{ duration:1.4, ease:"easeOut", delay:0.2 }} />
        </svg>
        <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
          <span style={{ fontSize:52, fontWeight:800, lineHeight:1, background:`linear-gradient(135deg,${color.from},${color.to})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>{displayed}</span>
          <span style={{ fontSize:12, color:"rgba(255,255,255,0.4)", letterSpacing:"0.08em", textTransform:"uppercase", marginTop:4 }}>ATS Score</span>
        </div>
      </div>
      <div style={{ marginTop:16, fontSize:13, fontWeight:600, padding:"6px 20px", borderRadius:999,
        ...(label.cls==="good" ? { background:"rgba(34,197,94,0.12)", color:"#4ade80", border:"0.5px solid rgba(34,197,94,0.3)" }
          : label.cls==="avg"  ? { background:"rgba(251,191,36,0.12)", color:"#fbbf24", border:"0.5px solid rgba(251,191,36,0.3)" }
          :                      { background:"rgba(239,68,68,0.12)", color:"#f87171", border:"0.5px solid rgba(239,68,68,0.3)" }) }}>
        {label.text}
      </div>
    </div>
  );
}

// ─── RESULT CARD ──────────────────────────────────────────────────────────────
function ResultCard({ title, dotColor, children, delay }) {
  return (
    <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ delay, duration:0.5 }}
      style={{ background:"rgba(255,255,255,0.03)", border:"0.5px solid rgba(168,85,247,0.2)", borderRadius:16, padding:24, marginBottom:16 }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16, fontSize:12, fontWeight:600, letterSpacing:"0.06em", textTransform:"uppercase", color:"rgba(255,255,255,0.4)" }}>
        <div style={{ width:8, height:8, borderRadius:"50%", background:dotColor }} />{title}
      </div>
      {children}
    </motion.div>
  );
}

// ─── RESULTS PAGE ─────────────────────────────────────────────────────────────
function ResultsScreen({ result, onBack, onImprove }) {
  const glowRef = useRef(null);

  // Strip markdown **bold** markers Gemini sometimes adds
  function cleanText(str) {
    return str.replace(/\*\*(.*?)\*\*/g, "$1");
  }

  function onMouseMove(e) {
    if (glowRef.current) {
      glowRef.current.style.left = e.clientX + "px";
      glowRef.current.style.top = e.clientY + "px";
    }
  }

  return (
    <div className="min-h-screen text-white relative overflow-hidden"
      style={{ background:"#04000d", fontFamily:"'DM Sans', system-ui, sans-serif" }}
      onMouseMove={onMouseMove}>
      <div className="absolute inset-0 -z-10">
        <div style={{ position:"absolute", left:"-25%", top:"5%", width:900, height:900, background:"radial-gradient(circle,rgba(139,60,255,0.25) 0%,transparent 65%)", borderRadius:"50%" }} />
        <div style={{ position:"absolute", right:"-25%", bottom:"0%", width:900, height:900, background:"radial-gradient(circle,rgba(236,72,153,0.18) 0%,transparent 65%)", borderRadius:"50%" }} />
        <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(168,85,247,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(168,85,247,0.04) 1px,transparent 1px)", backgroundSize:"60px 60px" }} />
      </div>
      <div ref={glowRef} style={{ position:"fixed", width:160, height:160, borderRadius:"50%", background:"radial-gradient(circle,rgba(168,85,247,0.18),transparent 70%)", transform:"translate(-50%,-50%)", pointerEvents:"none", zIndex:1, transition:"left 0.08s,top 0.08s" }} />

      {/* Nav */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"20px 32px", borderBottom:"0.5px solid rgba(168,85,247,0.12)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:30, height:30, borderRadius:8, background:"linear-gradient(135deg,#a855f7,#ec4899)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700 }}>R</div>
          <span style={{ fontWeight:600, fontSize:16 }}>ResumeAI</span>
        </div>
        <motion.button onClick={onBack} whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }}
          style={{ padding:"8px 20px", borderRadius:999, fontSize:13, fontWeight:600, background:"rgba(168,85,247,0.1)", border:"0.5px solid rgba(168,85,247,0.3)", color:"#d8b4fe", cursor:"pointer" }}>
          ← Analyze Another
        </motion.button>
      </div>

      {/* Content */}
      <div style={{ maxWidth:680, margin:"0 auto", padding:"48px 24px 80px" }}>
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} style={{ textAlign:"center", marginBottom:40 }}>
          <h1 style={{ fontSize:32, fontWeight:800, letterSpacing:"-0.03em", marginBottom:8 }}>Your Resume Analysis</h1>
          <p style={{ fontSize:14, color:"rgba(255,255,255,0.4)" }}>Here's how your resume performs against ATS systems</p>
        </motion.div>

        <ScoreRing score={result.ats_score || 0} />

<div className="flex justify-center mb-10">
  <motion.button
    onClick={onImprove}
    whileHover={{ scale: 1.06 }}
    whileTap={{ scale: 0.96 }}
    className="relative group overflow-hidden px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300"
    style={{
      background:
        "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)",
      boxShadow:
        "0 0 30px rgba(99,102,241,0.5), 0 0 60px rgba(139,92,246,0.3)",
    }}
  >
    <span
      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      style={{
        background:
          "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)",
        animation: "shimmer 1.5s infinite",
      }}
    />

    <span className="relative flex items-center gap-3 text-white">
      ✨ Improve Your Resume
    </span>
  </motion.button>
</div>
        {result.missing_keywords?.length > 0 && (
          <ResultCard title="Missing Keywords" dotColor="#f87171" delay={0.1}>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
              {result.missing_keywords.map((k, i) => (
                <span key={i} style={{ fontSize:12, padding:"5px 12px", borderRadius:999, background:"rgba(239,68,68,0.1)", color:"#f87171", border:"0.5px solid rgba(239,68,68,0.25)" }}>
                  {cleanText(k)}
                </span>
              ))}
            </div>
          </ResultCard>
        )}

        {result.weaknesses?.length > 0 && (
          <ResultCard title="Weaknesses" dotColor="#fbbf24" delay={0.2}>
            <ul style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {result.weaknesses.map((w, i) => (
                <li key={i} style={{ fontSize:14, color:"rgba(255,255,255,0.7)", lineHeight:1.6, paddingLeft:18, position:"relative", listStyle:"none" }}>
                  <span style={{ position:"absolute", left:0, top:8, width:6, height:6, borderRadius:"50%", background:"#fbbf24", display:"block" }} />
                  {cleanText(w)}
                </li>
              ))}
            </ul>
          </ResultCard>
        )}

        {result.strengths?.length > 0 && (
          <ResultCard title="Strengths" dotColor="#4ade80" delay={0.3}>
            <ul style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {result.strengths.map((s, i) => (
                <li key={i} style={{ fontSize:14, color:"rgba(255,255,255,0.7)", lineHeight:1.6, paddingLeft:18, position:"relative", listStyle:"none" }}>
                  <span style={{ position:"absolute", left:0, top:8, width:6, height:6, borderRadius:"50%", background:"#4ade80", display:"block" }} />
                  {cleanText(s)}
                </li>
              ))}
            </ul>
          </ResultCard>
        )}

        {result.suggestions?.length > 0 && (
          <ResultCard title="Suggestions to Improve" dotColor="#c084fc" delay={0.4}>
            <ul style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {result.suggestions.map((s, i) => (
                <li key={i} style={{ fontSize:14, color:"rgba(255,255,255,0.7)", lineHeight:1.6, paddingLeft:18, position:"relative", listStyle:"none" }}>
                  <span style={{ position:"absolute", left:0, top:8, width:6, height:6, borderRadius:"50%", background:"#c084fc", display:"block" }} />
                  {cleanText(s)}
                </li>
              ))}
            </ul>
          </ResultCard>
        )}

        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.6 }} style={{ textAlign:"center", marginTop:32 }}>
          <motion.button onClick={onBack} whileHover={{ scale:1.06, boxShadow:"0 8px 40px rgba(168,85,247,0.6)" }} whileTap={{ scale:0.97 }}
            style={{ padding:"14px 34px", borderRadius:999, fontSize:15, fontWeight:700, background:"linear-gradient(135deg,#a855f7 0%,#ec4899 100%)", border:"none", color:"#fff", cursor:"pointer", boxShadow:"0 4px 30px rgba(168,85,247,0.45)" }}>
            Analyze Another Resume →
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("home");
  const [result, setResult] = useState(null);
  //const [optimizing, setOptimizing] = useState(false);
  const glowRef = useRef(null);

  const {                                      //ned addition!!
   loading: improving,
   improvedData,
   error: improveError,
   improveResume
   } = useImproveResume();

  const [showModal, setShowModal] = useState(false);

  async function handleImproveResume() {        //step3 srting
  try {
    await improveResume(result);
    setShowModal(true);
  } catch (err) {
    console.error("Error improving resume:", err);
  }
}                                          //new added step3

 

  const particles = Array.from({ length: 22 }, (_, i) => ({
    left:`${Math.random()*100}%`, top:`${Math.random()*100}%`,
    width:Math.random()>0.7?2:1, height:Math.random()>0.7?2:1,
    opacity:0.4+Math.random()*0.5,
    background:Math.random()>0.5?"#d8b4fe":"#f0abfc",
    duration:5+Math.random()*6, delay:Math.random()*5,
  }));

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = "";
    setScreen("loading");

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await fetch("https://ai-resume-analyzer-sbav.onrender.com/upload", { method:"POST", body:formData });
      const raw = await res.json();
      console.log("RAW API RESPONSE:", raw);

      const parsed = parseResult(raw);  // ✅ handles both parsed & raw cases
      console.log("FINAL PARSED:", parsed);

      setResult(parsed);
      setScreen("results");
    } catch (err) {
      console.error("Upload error:", err);
      setScreen("home");
      alert("Something went wrong. Is the server running?");
    }
  };


  function onMouseMove(e) {
    if (glowRef.current) {
      glowRef.current.style.left = e.clientX + "px";
      glowRef.current.style.top = e.clientY + "px";
    }
  }
  //if (optimizing) return <OptimizingLoader />;
  if (screen === "loading") return <LoadingScreen />;
  if (screen === "results")                        //step4 srting!!
  return (
    <>
      <ResultsScreen
        result={result}
        onBack={() => setScreen("home")}
        onImprove={handleImproveResume}
      />

      {improving && <OptimizingLoader />}

      <ResumeImproverModal
        open={showModal}
        onClose={() => setShowModal(false)}
        improvedData={improvedData}
        originalScore={result?.ats_score}
      />
    </>
  );                               //step4 complete

  // HOME
  return (
    <div className="min-h-screen text-white relative overflow-hidden"
      style={{ background:"#04000d", fontFamily:"'DM Sans', system-ui, sans-serif" }} onMouseMove={onMouseMove}>

      <div className="absolute inset-0 -z-10" aria-hidden>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(135deg,#04000d 0%,#080014 50%,#04000d 100%)" }} />
        <div style={{ position:"absolute", left:"-25%", top:"5%", width:900, height:900, background:"radial-gradient(circle,rgba(139,60,255,0.28) 0%,transparent 65%)", borderRadius:"50%", filter:"blur(1px)" }} />
        <div style={{ position:"absolute", right:"-25%", bottom:"0%", width:900, height:900, background:"radial-gradient(circle,rgba(236,72,153,0.22) 0%,transparent 65%)", borderRadius:"50%", filter:"blur(1px)" }} />
        <div style={{ position:"absolute", top:"20%", left:"35%", width:700, height:700, background:"radial-gradient(circle,rgba(168,85,247,0.12) 0%,transparent 60%)", borderRadius:"50%" }} />
        <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(168,85,247,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(168,85,247,0.04) 1px,transparent 1px)", backgroundSize:"60px 60px" }} />
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at 50% 50%,transparent 40%,rgba(4,0,13,0.7) 100%)" }} />
      </div>

      <div ref={glowRef} style={{ position:"fixed", width:160, height:160, borderRadius:"50%", background:"radial-gradient(circle,rgba(168,85,247,0.18),transparent 70%)", transform:"translate(-50%,-50%)", pointerEvents:"none", zIndex:1, transition:"left 0.08s,top 0.08s" }} />

      <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden>
        {particles.map((p, i) => <Particle key={i} style={p} />)}
      </div>

      {/* Nav */}
      <motion.nav initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }}
        className="relative z-20 flex items-center justify-between px-8 py-5"
        style={{ borderBottom:"0.5px solid rgba(168,85,247,0.12)" }}>
        <div className="flex items-center gap-2">
          <div style={{ width:30, height:30, borderRadius:8, background:"linear-gradient(135deg,#a855f7,#ec4899)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:700 }}>R</div>
          <span style={{ fontWeight:600, fontSize:16, letterSpacing:"-0.02em" }}>ResumeAI</span>
        </div>
        <div className="flex items-center gap-8">
          {["Features","Pricing","Blog"].map(item => (
            <a key={item} href="#" style={{ fontSize:14, color:"rgba(255,255,255,0.5)", textDecoration:"none" }}
              onMouseEnter={e=>e.target.style.color="#d8b4fe"} onMouseLeave={e=>e.target.style.color="rgba(255,255,255,0.5)"}>
              {item}
            </a>
          ))}
        </div>
        <motion.button whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }}
          style={{ padding:"8px 20px", borderRadius:999, fontSize:13, fontWeight:600, background:"linear-gradient(135deg,#a855f7,#ec4899)", border:"none", color:"#fff", cursor:"pointer", boxShadow:"0 4px 20px rgba(168,85,247,0.4)" }}>
          Get Started →
        </motion.button>
      </motion.nav>

      {/* Hero */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 pt-20 pb-12">
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
          style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"6px 14px", borderRadius:999, background:"rgba(168,85,247,0.1)", border:"0.5px solid rgba(168,85,247,0.35)", fontSize:12, color:"#d8b4fe", marginBottom:28, letterSpacing:"0.04em" }}>
          <span style={{ width:6, height:6, borderRadius:"50%", background:"#a855f7", display:"inline-block" }} />
          AI-POWERED RESUME INTELLIGENCE
        </motion.div>

        <motion.h1 initial={{ opacity:0, y:40 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2, duration:0.8 }}
          style={{ fontSize:"clamp(42px,6vw,76px)", fontWeight:800, lineHeight:1.05, letterSpacing:"-0.04em", marginBottom:0, maxWidth:820 }}>
          <span style={{ color:"rgba(255,255,255,0.92)" }}>Land your dream job</span><br />
          <span style={{ background:"linear-gradient(135deg,#c084fc 0%,#f472b6 50%,#a78bfa 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
            with a smarter resume.
          </span>
        </motion.h1>

        <motion.p initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.35 }}
          style={{ fontSize:17, color:"rgba(255,255,255,0.42)", maxWidth:520, lineHeight:1.7, margin:"24px auto 0" }}>
          Upload your resume and get an instant ATS score, keyword gap analysis, and personalized suggestions.
        </motion.p>

        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.5 }}
          className="flex flex-wrap justify-center gap-3 mt-8">
          <Pill icon="⚡" label="ATS Score" />
          <Pill icon="🔍" label="Keyword Analysis" />
          <Pill icon="✦" label="AI Suggestions" />
          <Pill icon="📊" label="Job Match %" />
        </motion.div>

        <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileUpload} id="resumeUpload" style={{ display:"none" }} />

        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.65 }}
          className="flex items-center gap-4 mt-10">
          <motion.button onClick={() => document.getElementById("resumeUpload").click()}
            whileHover={{ scale:1.06, boxShadow:"0 8px 40px rgba(168,85,247,0.6)" }} whileTap={{ scale:0.97 }}
            style={{ padding:"14px 34px", borderRadius:999, fontSize:15, fontWeight:700, background:"linear-gradient(135deg,#a855f7 0%,#ec4899 100%)", border:"none", color:"#fff", cursor:"pointer", boxShadow:"0 4px 30px rgba(168,85,247,0.45)", letterSpacing:"-0.01em" }}>
            Upload Resume →
          </motion.button>
          <motion.button whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }}
            style={{ padding:"13px 28px", borderRadius:999, fontSize:14, fontWeight:600, background:"transparent", border:"0.5px solid rgba(255,255,255,0.18)", color:"rgba(255,255,255,0.65)", cursor:"pointer" }}>
            See Demo
          </motion.button>
        </motion.div>

        <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.9 }}
          style={{ fontSize:12, color:"rgba(255,255,255,0.25)", marginTop:16, letterSpacing:"0.03em" }}>
          No account needed · Free to try · Powered by JK....
        </motion.p>
      </div>

      <div className="flex justify-center items-center py-12 relative z-10"><ResumeCard /></div>

      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.0 }}
        className="flex flex-wrap justify-center gap-4 px-6 pb-8 relative z-10">
        <StatCard value="98%" label="ATS Pass Rate" delay={1.0} />
        <StatCard value="2.4×" label="More Interviews" delay={1.1} />
        <StatCard value="50K+" label="Resumes Analyzed" delay={1.2} />
        <StatCard value="<30s" label="Instant Results" delay={1.3} />
      </motion.div>

      <div style={{ position:"relative", overflow:"hidden", padding:"20px 0", borderTop:"0.5px solid rgba(168,85,247,0.1)", borderBottom:"0.5px solid rgba(168,85,247,0.1)" }}>
        <motion.div animate={{ x:[0,-1200] }} transition={{ duration:22, repeat:Infinity, ease:"linear" }}
          style={{ display:"flex", gap:48, whiteSpace:"nowrap", width:"max-content" }}>
          {[...Array(3)].flatMap(()=>["Google","Amazon","Apple","Microsoft","Meta","Netflix","Stripe","Figma","Notion","Linear","Vercel","OpenAI"]).map((c,i)=>(
            <span key={i} style={{ fontSize:13, fontWeight:600, color:"rgba(255,255,255,0.18)", letterSpacing:"0.08em", textTransform:"uppercase" }}>{c}</span>
          ))}
        </motion.div>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(90deg,#04000d 0%,transparent 15%,transparent 85%,#04000d 100%)", pointerEvents:"none" }} />
      </div>

      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:50, opacity:0.025, mixBlendMode:"overlay", backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundRepeat:"repeat", backgroundSize:"128px 128px" }} />
    
{improving && <OptimizingLoader />}

<ResumeImproverModal
  open={showModal}
  onClose={() => setShowModal(false)}
  improvedData={improvedData}
  originalScore={result?.ats_score}
/>

</div>
  );
}