import React from 'react';
import { 
  Sparkles, 
  MessageSquare, 
  Database, 
  ShieldCheck, 
  BookOpen, 
  ArrowRight, 
  Layers, 
  GraduationCap,
  Cpu,
  RefreshCw
} from 'lucide-react';

export default function Home({ onStartChat }) {
  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content-left">
          <div className="hero-pill-badge">
            <span className="badge-glow-dot"></span>
            <span>24/7 AI Campus Companion</span>
            <Sparkles size={13} className="text-yellow" />
          </div>

          <h1 className="hero-title">
            Ask anything about <span className="text-gradient">your university</span>
          </h1>

          <p className="hero-subtitle">
            Get instant, verified answers to questions about attendance rules, exam timetables, scholarships, hostel policies, and campus life.
          </p>

          <div className="hero-actions">
            <button 
              className="btn btn-primary hero-btn-lg"
              onClick={onStartChat}
            >
              <MessageSquare size={18} />
              <span>Ask a Question</span>
              <ArrowRight size={16} />
            </button>

            <a 
              href="#features" 
              className="btn btn-secondary hero-btn-lg"
            >
              <Layers size={18} />
              <span>Explore Features</span>
            </a>
          </div>
        </div>

        {/* Hero Interactive Visual Card */}
        <div className="hero-visual-right">
          <div className="hero-visual-card glass-panel-elevated">
            <div className="card-browser-bar">
              <div className="browser-dots">
                <span className="b-dot red"></span>
                <span className="b-dot yellow"></span>
                <span className="b-dot green"></span>
              </div>
              <div className="browser-url">uniassist.edu/live-demo</div>
              <div className="browser-badge">
                <span className="status-dot"></span>
                <span className="text-yellow font-bold">Online 24/7</span>
              </div>
            </div>

            <div className="mock-chat-preview">
              <div className="mock-bubble user-mock">
                <span>What happens if my attendance drops below 75%?</span>
              </div>
              <div className="mock-bubble bot-mock">
                <div className="mock-bot-header">
                  <span className="mock-badge">
                    <Database size={12} />
                    Campus Guide • Attendance
                  </span>
                </div>
                <p>
                  Students must maintain a minimum 75% attendance. If between 65%–74%, you can submit a medical certificate to your HOD within 5 days. Below 65%, students cannot sit for semester exams.
                </p>
              </div>

              <div className="mock-chips-row">
                <span className="mock-chip" onClick={onStartChat}>📚 Library Timings</span>
                <span className="mock-chip" onClick={onStartChat}>💰 Scholarship Criteria</span>
                <span className="mock-chip" onClick={onStartChat}>🏠 Hostel Rules</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter Bar */}
      <section className="stats-section">
        <div className="stat-card">
          <span className="stat-number text-gradient-sunset">52+</span>
          <span className="stat-label">Verified FAQ Answers</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-card">
          <span className="stat-number text-gradient-candy">20</span>
          <span className="stat-label">Academic Categories</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-card">
          <span className="stat-number text-gradient-aurora">100%</span>
          <span className="stat-label">Always Online Fallback</span>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-card">
          <span className="stat-number text-gradient-neon">0ms</span>
          <span className="stat-label">Offline Lookup Speed</span>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="section-wrapper">
        <div className="section-header-center">
          <span className="section-pill text-gradient-sunset">Core Capabilities</span>
          <h2 className="section-heading text-gradient-rainbow">Engineered for Academic Excellence</h2>
          <p className="section-desc">
            Designed specifically for college campuses, balancing modern conversational intelligence with instant local answers.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon icon-ai">
              <Cpu size={24} />
            </div>
            <h3 className="feature-title text-yellow">Smart Human Answers</h3>
            <p className="feature-desc">
              Gives clear, direct, and helpful explanations to student questions without confusing robotic jargon.
            </p>
          </div>

          <div className="feature-card highlight-border">
            <div className="feature-icon icon-fallback">
              <RefreshCw size={24} />
            </div>
            <h3 className="feature-title text-gold">Zero-Downtime Fallback</h3>
            <p className="feature-desc">
              If the external API has an outage or reaches limits, the local university knowledge base answers automatically.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon icon-kb">
              <BookOpen size={24} />
            </div>
            <h3 className="feature-title text-yellow">20+ Campus Topics</h3>
            <p className="feature-desc">
              From examinations and GPA calculations to hostel curfews, scholarships, placements, and club fairs.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon icon-security">
              <ShieldCheck size={24} />
            </div>
            <h3 className="feature-title text-gold">Safe & Clean UI</h3>
            <p className="feature-desc">
              Students never see scary error codes or raw technical stack traces. A friendly answer is always returned.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Architecture Pipeline */}
      <section id="how-it-works" className="section-wrapper">
        <div className="section-header-center">
          <span className="section-pill text-gradient-sunset">Architecture & Flow</span>
          <h2 className="section-heading text-gradient-rainbow">How The Dual Engine Works</h2>
          <p className="section-desc">
            Guarantees students receive immediate answers with zero disruption.
          </p>
        </div>

        <div className="pipeline-container">
          <div className="pipeline-step">
            <div className="step-number step-pink">1</div>
            <h4 className="step-title">Student Question</h4>
            <p className="step-desc">Student inputs inquiry via responsive web interface.</p>
          </div>

          <div className="pipeline-connector">
            <ArrowRight size={20} />
          </div>

          <div className="pipeline-step">
            <div className="step-number step-purple">2</div>
            <h4 className="step-title">Campus Backend</h4>
            <p className="step-desc">Chat Service validates input and processes inquiry.</p>
          </div>

          <div className="pipeline-connector">
            <ArrowRight size={20} />
          </div>

          <div className="pipeline-step step-decision">
            <div className="step-number step-amber">3</div>
            <h4 className="step-title">Resilience Gate</h4>
            <div className="decision-branches">
              <span className="branch branch-success">API Online → Smart Answer</span>
              <span className="branch branch-fallback">API Offline → Knowledge Base Search</span>
            </div>
          </div>

          <div className="pipeline-connector">
            <ArrowRight size={20} />
          </div>

          <div className="pipeline-step">
            <div className="step-number step-emerald">4</div>
            <h4 className="step-title">Instant Response</h4>
            <p className="step-desc">Returns verified answer with clear source attribution.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer-section">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">
              <GraduationCap size={22} className="footer-cap-icon" />
            </div>
            <div className="footer-brand-text">
              <div className="footer-brand-heading">
                <span className="footer-title">UniAssist</span>
                <span className="footer-badge">AI Assistant</span>
              </div>
              <p className="footer-desc">Intelligent 24/7 Academic Support for University Students</p>
            </div>
          </div>
          <div className="footer-links">
            <button 
              className="footer-nav-btn" 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              Home
            </button>
            <a href="#features" className="footer-link">Features</a>
            <a href="#how-it-works" className="footer-link">How It Works</a>
            <button className="footer-chat-pill" onClick={onStartChat}>
              <MessageSquare size={14} />
              <span>Ask AI</span>
            </button>
          </div>
        </div>
        <div className="footer-bottom">
          <span className="footer-copyright">&copy; {new Date().getFullYear()} UniAssist AI. All rights reserved.</span>
          <div className="footer-status-tag">
            <span className="footer-pulse-dot"></span>
            <span>24/7 Campus Live Support</span>
          </div>
        </div>
      </footer>

      <style>{`
        .home-container {
          width: 100%;
          max-width: 1320px;
          margin: 0 auto;
          padding: 24px 32px 80px;
          display: flex;
          flex-direction: column;
          gap: 64px;
          background: #000000;
        }
        .hero-section {
          display: grid;
          grid-template-columns: 1.05fr 1fr;
          align-items: center;
          gap: 52px;
          padding: 24px 0 10px;
          width: 100%;
        }
        .hero-content-left {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
        }
        .hero-pill-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          background: rgba(250, 204, 21, 0.08);
          border: 1px solid rgba(250, 204, 21, 0.28);
          border-radius: 9999px;
          font-size: 0.8rem;
          font-weight: 700;
          color: #facc15;
          margin-bottom: 20px;
          box-shadow: 0 0 16px rgba(250, 204, 21, 0.12);
        }
        .badge-glow-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #ffd700;
          box-shadow: 0 0 8px #ffd700;
        }
        .hero-title {
          font-size: clamp(2.2rem, 4.5vw, 3.5rem);
          font-weight: 900;
          line-height: 1.15;
          letter-spacing: -0.03em;
          color: #ffffff;
          max-width: 620px;
          margin-bottom: 18px;
        }
        .hero-subtitle {
          font-size: 1.1rem;
          color: #e5e7eb;
          max-width: 540px;
          line-height: 1.65;
          margin-bottom: 30px;
        }
        .font-bold { font-weight: 700; }
        .hero-actions {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }
        .hero-btn-lg {
          padding: 13px 30px;
          font-size: 0.98rem;
          font-weight: 700;
          border-radius: 12px;
          transition: all 0.25s ease;
        }
        .hero-visual-right {
          width: 100%;
          display: flex;
          justify-content: center;
        }
        .hero-visual-card {
          width: 100%;
          border-radius: 20px;
          overflow: hidden;
          background: linear-gradient(180deg, #0e0e14 0%, #08080c 100%);
          border: 1px solid rgba(250, 204, 21, 0.22);
          border-top: 1px solid rgba(250, 204, 21, 0.45);
          box-shadow: 0 24px 60px -15px rgba(0, 0, 0, 0.95), 0 0 32px rgba(250, 204, 21, 0.08);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .hero-visual-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 28px 70px -15px rgba(0, 0, 0, 0.98), 0 0 40px rgba(250, 204, 21, 0.12);
        }
        .card-browser-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 20px;
          background: #09090d;
          border-bottom: 1px solid rgba(255, 255, 255, 0.07);
        }
        .browser-dots {
          display: flex;
          gap: 6px;
        }
        .b-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }
        .b-dot.red { background: #ef4444; opacity: 0.85; }
        .b-dot.yellow { background: #f59e0b; opacity: 0.85; }
        .b-dot.green { background: #10b981; opacity: 0.85; }
        .browser-url {
          font-size: 0.775rem;
          font-family: var(--font-mono);
          color: #facc15;
          background: #14141c;
          border: 1px solid rgba(255, 255, 255, 0.06);
          padding: 3px 18px;
          border-radius: 6px;
        }
        .browser-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.725rem;
        }
        .status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 6px #10b981;
        }
        .mock-chat-preview {
          padding: 22px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          text-align: left;
          background: #09090d;
        }
        .mock-bubble {
          padding: 12px 18px;
          border-radius: 16px;
          font-size: 0.925rem;
          line-height: 1.5;
        }
        .user-mock {
          align-self: flex-end;
          background: linear-gradient(135deg, #ffe600 0%, #ffd700 50%, #eab308 100%);
          color: #000000;
          font-weight: 600;
          max-width: 82%;
          border-bottom-right-radius: 4px;
          box-shadow: 0 4px 14px rgba(250, 204, 21, 0.3);
        }
        .bot-mock {
          align-self: flex-start;
          background: #121218;
          border: 1px solid rgba(255, 255, 255, 0.08);
          max-width: 96%;
          border-bottom-left-radius: 4px;
        }
        .mock-bot-header {
          margin-bottom: 6px;
        }
        .mock-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.7rem;
          font-weight: 700;
          color: #ffd700;
          background: rgba(250, 204, 21, 0.12);
          border: 1px solid rgba(250, 204, 21, 0.4);
          padding: 2px 8px;
          border-radius: var(--radius-full);
        }
        .mock-chips-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 4px;
          padding-top: 10px;
          border-top: 1px dashed rgba(255, 255, 255, 0.08);
        }
        .mock-chip {
          font-size: 0.75rem;
          color: #d1d5db;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 4px 12px;
          border-radius: 9999px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .mock-chip:hover {
          color: #facc15;
          border-color: rgba(250, 204, 21, 0.45);
          background: rgba(250, 204, 21, 0.1);
          transform: translateY(-1px);
        }
        .stats-section {
          display: flex;
          align-items: center;
          justify-content: space-around;
          padding: 24px 32px;
          background: linear-gradient(180deg, #0e0e14 0%, #09090d 100%);
          border: 1px solid rgba(250, 204, 21, 0.2);
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8);
        }
        .stat-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }
        .stat-number {
          font-size: 2.4rem;
          font-weight: 900;
          line-height: 1.1;
        }
        .stat-label {
          font-size: 0.85rem;
          color: #d1d5db;
          font-weight: 600;
        }
        .stat-divider {
          width: 1px;
          height: 42px;
          background: rgba(250, 204, 21, 0.2);
        }
        .section-wrapper {
          display: flex;
          flex-direction: column;
          gap: 36px;
        }
        .section-header-center {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }
        .section-pill {
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .section-heading {
          font-size: 2.3rem;
          font-weight: 900;
          letter-spacing: -0.02em;
        }
        .section-desc {
          font-size: 1rem;
          color: var(--text-secondary);
          max-width: 600px;
        }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }
        .feature-card {
          padding: 28px 24px;
          border-radius: var(--radius-lg);
          display: flex;
          flex-direction: column;
          gap: 12px;
          background: #0d0d12;
          border: 1px solid rgba(255, 255, 255, 0.08);
          transition: all 0.25s ease;
        }
        .feature-card:hover {
          transform: translateY(-4px);
          border-color: rgba(250, 204, 21, 0.5);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.8), 0 0 16px rgba(250, 204, 21, 0.2);
        }
        .highlight-border {
          border-color: rgba(250, 204, 21, 0.4);
          background: linear-gradient(180deg, rgba(250, 204, 21, 0.08) 0%, #0d0d12 100%);
        }
        .feature-icon {
          width: 50px;
          height: 50px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 6px;
        }
        .icon-ai { background: rgba(250, 204, 21, 0.15); color: #ffd700; border: 1px solid rgba(250, 204, 21, 0.3); }
        .icon-fallback { background: rgba(250, 204, 21, 0.15); color: #ffd700; border: 1px solid rgba(250, 204, 21, 0.3); }
        .icon-kb { background: rgba(250, 204, 21, 0.15); color: #ffd700; border: 1px solid rgba(250, 204, 21, 0.3); }
        .icon-security { background: rgba(250, 204, 21, 0.15); color: #ffd700; border: 1px solid rgba(250, 204, 21, 0.3); }
        .feature-title {
          font-size: 1.15rem;
          font-weight: 800;
        }
        .feature-desc {
          font-size: 0.875rem;
          color: var(--text-secondary);
          line-height: 1.55;
        }
        .pipeline-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 32px 28px;
          gap: 12px;
          overflow-x: auto;
          background: #0b0b0f;
          border: 1px solid rgba(250, 204, 21, 0.2);
          border-radius: var(--radius-lg);
        }
        .pipeline-step {
          flex: 1;
          min-width: 170px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .step-number {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          font-weight: 800;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 4px;
        }
        .step-pink { background: rgba(250, 204, 21, 0.15); border: 1.5px solid #ffd700; color: #ffd700; }
        .step-purple { background: rgba(250, 204, 21, 0.15); border: 1.5px solid #ffd700; color: #ffd700; }
        .step-amber { background: rgba(250, 204, 21, 0.15); border: 1.5px solid #ffd700; color: #ffd700; }
        .step-emerald { background: rgba(250, 204, 21, 0.15); border: 1.5px solid #ffd700; color: #ffd700; }
        .step-title {
          font-size: 1rem;
          font-weight: 800;
          color: #ffffff;
        }
        .step-desc {
          font-size: 0.8rem;
          color: #d1d5db;
          line-height: 1.45;
        }
        .step-decision {
          background: #141419;
          padding: 12px;
          border-radius: var(--radius-md);
          border: 1px dashed rgba(250, 204, 21, 0.4);
        }
        .decision-branches {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-top: 6px;
        }
        .branch {
          font-size: 0.7rem;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
        }
        .branch-success {
          background: rgba(250, 204, 21, 0.2);
          color: #ffd700;
        }
        .branch-fallback {
          background: rgba(234, 179, 8, 0.12);
          color: #facc15;
        }
        .pipeline-connector {
          color: #ca8a04;
          display: flex;
          align-items: center;
          opacity: 0.8;
        }
        .footer-section {
          margin-top: 40px;
          padding-top: 36px;
          border-top: 1px solid rgba(250, 204, 21, 0.2);
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .footer-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 24px;
        }
        .footer-brand {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .footer-logo {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: #facc15;
          color: #000000;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 16px rgba(250, 204, 21, 0.4);
          flex-shrink: 0;
        }
        .footer-cap-icon {
          color: #000000;
        }
        .footer-brand-text {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .footer-brand-heading {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .footer-title {
          font-size: 1.15rem;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: -0.3px;
        }
        .footer-badge {
          font-size: 0.68rem;
          font-weight: 800;
          background: rgba(250, 204, 21, 0.15);
          color: #facc15;
          border: 1px solid rgba(250, 204, 21, 0.4);
          padding: 2px 8px;
          border-radius: 9999px;
          letter-spacing: 0.5px;
        }
        .footer-desc {
          font-size: 0.825rem;
          color: #d1d5db;
        }
        .footer-links {
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }
        .footer-nav-btn {
          background: none;
          border: none;
          color: #d1d5db;
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          transition: color 0.2s;
          padding: 0;
        }
        .footer-nav-btn:hover {
          color: #facc15;
        }
        .footer-link {
          color: #d1d5db;
          text-decoration: none;
          font-size: 0.88rem;
          font-weight: 600;
          transition: color 0.2s;
        }
        .footer-link:hover {
          color: #facc15;
        }
        .footer-chat-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #facc15;
          color: #000000;
          border: none;
          padding: 7px 16px;
          border-radius: 9999px;
          font-size: 0.82rem;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 10px rgba(250, 204, 21, 0.35);
        }
        .footer-chat-pill:hover {
          background: #ffe600;
          transform: translateY(-1px);
          box-shadow: 0 4px 16px rgba(250, 204, 21, 0.5);
        }
        .footer-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.82rem;
          color: #9ca3af;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding-top: 18px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .footer-copyright {
          color: #d1d5db;
        }
        .footer-status-tag {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-size: 0.78rem;
          font-weight: 700;
          color: #facc15;
          background: rgba(250, 204, 21, 0.08);
          border: 1px solid rgba(250, 204, 21, 0.3);
          padding: 4px 12px;
          border-radius: 9999px;
        }
        .footer-pulse-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 8px #22c55e;
        }
        @media (max-width: 968px) {
          .home-container {
            padding: 20px 20px 60px;
            gap: 48px;
          }
          .hero-section {
            grid-template-columns: 1fr;
            text-align: center;
            gap: 36px;
            min-height: auto;
          }
          .hero-content-left {
            align-items: center;
            text-align: center;
          }
          .hero-subtitle {
            max-width: 650px;
          }
          .hero-actions {
            justify-content: center;
          }
          .stats-section {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 24px;
            padding: 20px;
          }
          .stat-divider {
            display: none;
          }
        }
        @media (max-width: 640px) {
          .home-container {
            padding: 16px 12px 40px;
            gap: 36px;
          }
          .hero-title {
            font-size: clamp(1.85rem, 7vw, 2.3rem);
          }
          .hero-subtitle {
            font-size: 0.95rem;
            line-height: 1.5;
            margin-bottom: 24px;
          }
          .hero-actions {
            flex-direction: column;
            width: 100%;
            gap: 12px;
          }
          .hero-btn-lg {
            width: 100%;
            padding: 14px 20px;
          }
          .stats-section {
            grid-template-columns: 1fr;
            padding: 16px;
            gap: 16px;
          }
          .features-grid {
            grid-template-columns: 1fr;
          }
          .pipeline-container {
            flex-direction: column;
            align-items: stretch;
            padding: 20px 16px;
          }
          .pipeline-connector {
            transform: rotate(90deg);
            justify-content: center;
            margin: 4px 0;
          }
          .footer-content {
            flex-direction: column;
            text-align: center;
            gap: 16px;
          }
          .footer-brand {
            flex-direction: column;
            align-items: center;
          }
          .footer-bottom {
            flex-direction: column;
            text-align: center;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
