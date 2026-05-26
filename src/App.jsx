import { useState, useMemo, useRef } from "react";

// ─── Analysis Engine ──────────────────────────────────────────────────────────

const CHECKS = [
  { id: "upper", label: "Uppercase (A-Z)", test: (p) => /[A-Z]/.test(p) },
  { id: "lower", label: "Lowercase (a-z)", test: (p) => /[a-z]/.test(p) },
  { id: "digit", label: "Digits (0-9)", test: (p) => /[0-9]/.test(p) },
  { id: "special", label: "Special chars", test: (p) => /[^A-Za-z0-9]/.test(p) },
  { id: "length8", label: "8+ characters", test: (p) => p.length >= 8 },
  { id: "length16", label: "16+ characters", test: (p) => p.length >= 16 },
  { id: "noRepeat", label: "No 3× repeats", test: (p) => !/(.)(\1){2}/.test(p) },
  {
    id: "noSeq", label: "No sequences",
    test: (p) =>
      !/(012|123|234|345|456|567|678|789|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(p),
  },
  {
    id: "noCommon", label: "Not common word",
    test: (p) => {
      const common = ["password", "123456", "qwerty", "letmein", "admin", "welcome", "monkey", "dragon", "master", "abc123"];
      return !common.some((w) => p.toLowerCase().includes(w));
    },
  },
  {
    id: "mixed", label: "Mixed types ×3",
    test: (p) =>
      [/[A-Z]/, /[a-z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((r) => r.test(p)).length >= 3,
  },
];

function calcEntropy(p) {
  let pool = 0;
  if (/[a-z]/.test(p)) pool += 26;
  if (/[A-Z]/.test(p)) pool += 26;
  if (/[0-9]/.test(p)) pool += 10;
  if (/[^A-Za-z0-9]/.test(p)) pool += 32;
  return pool > 0 ? Math.round(p.length * Math.log2(pool)) : 0;
}

function calcScore(p, entropy) {
  if (!p.length) return 0;
  let s = 0;
  s += Math.min(40, p.length * 2.5);
  s += Math.min(30, entropy * 0.35);
  const types = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((r) => r.test(p)).length;
  s += types * 7;
  s += CHECKS.filter((c) => c.test(p)).length * 1.2;
  s -= CHECKS.filter((c) => !c.test(p) && ["noRepeat", "noSeq", "noCommon"].includes(c.id)).length * 8;
  return Math.max(0, Math.min(100, Math.round(s)));
}

function crackTime(entropy) {
  const secs = Math.pow(2, entropy) / 1e10 / 2;
  if (secs < 1) return "Instantly";
  if (secs < 60) return `${Math.round(secs)} seconds`;
  if (secs < 3600) return `${Math.round(secs / 60)} minutes`;
  if (secs < 86400) return `${Math.round(secs / 3600)} hours`;
  if (secs < 2592000) return `${Math.round(secs / 86400)} days`;
  if (secs < 31536000) return `${Math.round(secs / 2592000)} months`;
  if (secs < 3.154e9) return `${Math.round(secs / 31536000)} years`;
  if (secs < 3.154e12) return `${Math.round(secs / 3.154e9)}K years`;
  if (secs < 3.154e15) return `${Math.round(secs / 3.154e12)}M years`;
  return "∞ eons";
}

function getStrength(score) {
  if (score < 20) return { label: "Critical", color: "#ff1744" };
  if (score < 40) return { label: "Weak", color: "#ff3d5a" };
  if (score < 60) return { label: "Fair", color: "#ffb300" };
  if (score < 80) return { label: "Strong", color: "#00e676" };
  return { label: "Elite", color: "#00fff7" };
}

function getTips(p) {
  const t = [];
  if (p.length < 12) t.push("Use at least 12 characters for meaningful security");
  if (!/[A-Z]/.test(p)) t.push("Add uppercase letters to expand the character pool");
  if (!/[^A-Za-z0-9]/.test(p)) t.push("Include special characters (!@#$%^&*) for higher entropy");
  if (/(.)(\1){2}/.test(p)) t.push("Remove repeated characters — they reduce effective entropy");
  if (/(012|123|234|345|789|abc|xyz)/i.test(p)) t.push("Avoid sequential patterns — they are first to be guessed");
  if (t.length === 0) t.push("Excellent password profile — consider a passphrase for memorability");
  return t;
}

function analyzePassword(p) {
  if (!p) return null;
  const entropy = calcEntropy(p);
  const score = calcScore(p, entropy);
  const strength = getStrength(score);
  return {
    entropy,
    score,
    strength,
    length: p.length,
    unique: new Set(p).size,
    crack: crackTime(entropy),
    checks: CHECKS.map((c) => ({ ...c, pass: c.test(p) })),
    tips: getTips(p),
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetricCard({ icon, name, value, sub, color, maxVal, passThreshold }) {
  const pct = Math.min(100, (value / maxVal) * 100);
  const pass = value >= passThreshold;
  return (
    <div
      className="metric-card"
      style={{ borderColor: pass ? `${color}40` : "rgba(255,61,90,.12)" }}
    >
      <span className="metric-icon">{icon}</span>
      <div className="metric-name">{name}</div>
      <div className="metric-val" style={{ color }}>{value}</div>
      <div className="metric-sub">{sub}</div>
      <div
        className="metric-bar"
        style={{ width: `${pct}%`, background: color, boxShadow: `0 0 8px ${color}66` }}
      />
    </div>
  );
}

function CheckItem({ label, pass }) {
  return (
    <div className={`check-item ${pass ? "pass" : "fail"}`}>
      <div className="check-icon">{pass ? "✓" : "✗"}</div>
      <span>{label}</span>
    </div>
  );
}

function generateSuggestions(current = "") {
  const charsets = {
    upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lower: "abcdefghijklmnopqrstuvwxyz",
    digit: "0123456789",
    spec: "!@#$%^&*()_+-=[]{}|;:,.<>?"
  };
  
  const genRandom = (len) => {
    const pool = charsets.upper + charsets.lower + charsets.digit + charsets.spec;
    let s = "";
    for (let i = 0; i < len; i++) s += pool[Math.floor(Math.random() * pool.length)];
    return s;
  };

  const strengthen = (base) => {
    if (!base) return genRandom(16);
    let s = base;
    // Add missing types
    if (!/[A-Z]/.test(s)) s += charsets.upper[Math.floor(Math.random() * 26)];
    if (!/[0-9]/.test(s)) s += charsets.digit[Math.floor(Math.random() * 10)];
    if (!/[^A-Za-z0-9]/.test(s)) s += charsets.spec[Math.floor(Math.random() * charsets.spec.length)];
    // Ensure length
    if (s.length < 16) s += genRandom(16 - s.length);
    return s;
  };

  const mix = (base) => {
    if (!base) return genRandom(14);
    const prefix = charsets.spec[Math.floor(Math.random() * charsets.spec.length)] + charsets.digit[Math.floor(Math.random() * 10)];
    const suffix = charsets.digit[Math.floor(Math.random() * 10)] + charsets.spec[Math.floor(Math.random() * charsets.spec.length)];
    return prefix + base + suffix;
  };

  return [
    strengthen(current),
    mix(current),
    current ? current + genRandom(6) : genRandom(18),
    genRandom(15) // One fully random
  ];
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [suggestions, setSuggestions] = useState(() => generateSuggestions(""));
  
  const inputRef = useRef(null);

  const data = useMemo(() => analyzePassword(password), [password]);
  const col = data?.strength.color ?? "#00d4ff";

  const handleCopy = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSuggestClick = (val) => {
    setPassword(val);
    if (inputRef.current) inputRef.current.focus();
  };

  const refreshSuggestions = () => setSuggestions(generateSuggestions(password));

  return (
    <div className="app-root">
      {/* Atmospheric layers */}
      <div className="scanlines" aria-hidden="true" />
      <div className="noise" aria-hidden="true" />

      <div className="app-container">
        {/* Header */}
        <header className="app-header">
          <div className="header-badge">
            <span className="pulse-dot" />
            Security Analysis System
          </div>
          <h1 className="app-title">
            <span className="title-solid">Password</span>
            <span className="title-outline">Strength Analyzer</span>
          </h1>
          <p className="app-subtitle">Real-time entropy &amp; vulnerability detection</p>
        </header>

        {/* Main card */}
        <div className="main-card">
          <div className="scan-line" aria-hidden="true" />

          {/* Input */}
          <div className="input-section">
            <div className="input-label">
              <span className="label-arrow">&gt;</span>
              Enter password
            </div>
            <div className="input-frame">
              <span className="corner tl" /><span className="corner tr" />
              <span className="corner bl" /><span className="corner br" />
              <input
                ref={inputRef}
                className="pw-input"
                type={visible ? "text" : "password"}
                placeholder="Type password to analyze…"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="off"
                spellCheck={false}
              />
              <button
                className="vis-toggle"
                onClick={() => setVisible((v) => !v)}
                title={visible ? "Hide password" : "View password"}
              >
                {visible ? "Hide" : "show"}
              </button>
            </div>

            {/* Action Row */}
            <div className="controls-row">
              <div className="copy-feedback-wrap">
                {copied && <div className="copy-feedback animate-in">COPIED</div>}
                <button
                  className="terminal-btn"
                  onClick={handleCopy}
                  disabled={!password}
                >
                  COPY PASSWORD
                </button>
              </div>
              <button className="terminal-btn" onClick={refreshSuggestions}>
                REFRESH SUGGESTIONS
              </button>
            </div>

            {/* Suggestions */}
            <div className="suggestions-section animate-in">
              <div className="section-label">Strong Suggestions</div>
              <div className="suggestions-grid">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    className="suggestion-chip"
                    onClick={() => handleSuggestClick(s)}
                  >
                    <span>{s}</span>
                    <span className="use-label">USE ▸</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Analysis */}
          {data && (
            <div className="analysis animate-in">

              {/* Strength meter */}
              <div className="strength-section">
                <div className="strength-header">
                  <span className="section-label">Overall Strength</span>
                  <span
                    className="strength-badge"
                    style={{
                      color: col,
                      background: `${col}18`,
                      border: `1px solid ${col}40`,
                    }}
                  >
                    {data.strength.label}
                  </span>
                </div>
                <div className="meter-track">
                  <div
                    className="meter-fill"
                    style={{
                      width: `${data.score}%`,
                      background: `linear-gradient(90deg, ${col}88, ${col})`,
                      boxShadow: `0 0 12px ${col}55`,
                    }}
                  />
                </div>
                <div className="hue-bar">
                  <div
                    className="hue-indicator"
                    style={{ left: `calc(${data.score}% - 1.5px)` }}
                  />
                </div>
              </div>

              {/* Metric cards */}
              <div className="metrics-grid">
                <MetricCard icon="📏" name="Length" value={data.length} sub="characters" color={col} maxVal={32} passThreshold={8} />
                <MetricCard icon="⚡" name="Entropy" value={data.entropy} sub="bits" color={col} maxVal={128} passThreshold={40} />
                <MetricCard icon="🔣" name="Charset" value={data.unique} sub="unique symbols" color={col} maxVal={40} passThreshold={8} />
                <MetricCard icon="🎯" name="Score" value={data.score} sub="/ 100" color={col} maxVal={100} passThreshold={60} />
              </div>

              {/* Checks */}
              <div className="checks-grid">
                {data.checks.map((c) => (
                  <CheckItem key={c.id} label={c.label} pass={c.pass} />
                ))}
              </div>

              {/* Tips */}
              {data.score < 80 && (
                <div className="feedback-box">
                  <div className="feedback-title">
                    <span className="comment-slash">{""}</span>
                    Recommendations
                  </div>
                  {data.tips.map((tip, i) => (
                    <div className="tip-item" key={i}>
                      <span className="tip-arrow">▸</span>
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Crack estimate */}
              <div className="crack-row">
                <div>
                  <div className="section-label">Estimated crack time</div>
                  <div
                    className="crack-value"
                    style={{ color: col, textShadow: `0 0 12px ${col}66` }}
                  >
                    {data.crack}
                  </div>
                </div>
                <div className="crack-meta">
                  10B attempts/sec<br />brute-force
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Security Guidelines */}
        <section className="guidelines-section animate-in">
          <div className="section-label mb-6 text-center">Security Guidelines</div>
          <div className="guidelines-grid">
            <div className="guide-card">
              <span className="guide-icon">🛡️</span>
              <h3 className="guide-title">The Passphrase Rule</h3>
              <p className="guide-text">
                Instead of "P@ssw0rd1", use 4+ random words like "Correct-Horse-Battery-Staple".
                Length beats complexity for brute-force protection.
              </p>
            </div>
            <div className="guide-card">
              <span className="guide-icon">🔄</span>
              <h3 className="guide-title">Rotation Policy</h3>
              <p className="guide-text">
                Don't change passwords for no reason, but rotate them immediately if a service reports a breach.
                Unique passwords for every service is key.
              </p>
            </div>
            <div className="guide-card">
              <span className="guide-icon">🔑</span>
              <h3 className="guide-title">Use a Manager</h3>
              <p className="guide-text">
                Human brains aren't meant to remember 50 random strings. Use Bitwarden or 1Password
                to store and generate complex secrets.
              </p>
            </div>
            <div className="guide-card">
              <span className="guide-icon">📱</span>
              <h3 className="guide-title">MFA is Mandatory</h3>
              <p className="guide-text">
                Even a weak password is safe if you have 2FA enabled. Use Authenticator apps
                instead of SMS whenever possible.
              </p>
            </div>
          </div>
        </section>

        <footer className="mt-12 text-center text-xs text-muted font-mono opacity-50">
          Use strong password and protect your details !.
        </footer>
      </div>
    </div>
  );
}

