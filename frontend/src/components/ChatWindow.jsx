import React, { useRef, useEffect, useState } from 'react';
import { 
  Paperclip, 
  Send, 
  RotateCcw, 
  Menu, 
  Truck, 
  Layers, 
  Calculator,
  Database,
  Search,
  X,
  Copy,
  Check,
  Sparkles,
  BookOpen,
  Home as HomeIcon
} from 'lucide-react';
import GoldenOrb from './GoldenOrb';
import UserProfile from './UserProfile';
import { useAuth } from '../context/AuthContext';
import { fetchFaqs, fetchCategories } from '../services/api';

export default function ChatWindow({
  messages,
  isLoading,
  input,
  setInput,
  onSendMessage,
  onClearChat,
  onOpenMobileSidebar,
  demoMode,
  onToggleDemo,
  onNavigateHome
}) {
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [showKbModal, setShowKbModal] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [kbFaqs, setKbFaqs] = useState([]);
  const [kbCategories, setKbCategories] = useState([]);
  const [kbSelectedCat, setKbSelectedCat] = useState('All');
  const [kbSearch, setKbSearch] = useState('');

  const { user } = useAuth();
  const displayName = user?.name || 'Student';
  const firstName = displayName.trim().split(' ')[0] || 'Student';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    async function loadKb() {
      try {
        const [cats, fData] = await Promise.all([fetchCategories(), fetchFaqs()]);
        setKbCategories(['All', ...(cats || [])]);
        setKbFaqs(fData.faqs || []);
      } catch (e) {
        console.warn('Could not load KB in modal', e);
      }
    }
    loadKb();
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        onSendMessage(input);
        setInput('');
      }
    }
  };

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleCopy = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredKb = kbFaqs.filter(faq => {
    const matchCat = kbSelectedCat === 'All' || faq.category === kbSelectedCat;
    const matchQ = !kbSearch || 
      faq.question.toLowerCase().includes(kbSearch.toLowerCase()) ||
      faq.answer.toLowerCase().includes(kbSearch.toLowerCase()) ||
      faq.keywords.some(k => k.toLowerCase().includes(kbSearch.toLowerCase()));
    return matchCat && matchQ;
  });

  return (
    <div className="exact-chat-window">
      {/* Top Header Bar */}
      <div className="top-header-bar">
        <div className="header-left-brand">
          <button 
            className="mobile-toggle-btn" 
            onClick={onOpenMobileSidebar}
            title="Open Sidebar"
          >
            <Menu size={18} />
          </button>

          {/* Yellow square logo with Chatbot brand */}
          <div 
            className="brand-logo-container cursor-pointer"
            onClick={onNavigateHome}
            title="Return to Home Page"
          >
            <div className="yellow-square-badge">
              <span className="badge-inner-square"></span>
            </div>
            <span className="brand-text-label">Chatbot</span>
            <span className="brand-sub-badge">UniAssist AI</span>
          </div>
        </div>

        {/* Right action controls */}
        <div className="header-right-user">
          {/* Aesthetic Return to Home Page button */}
          <button 
            className="home-header-btn"
            onClick={onNavigateHome}
            title="Return to Home Page"
          >
            <HomeIcon size={14} className="home-icon" />
            <span>Home</span>
          </button>

          {/* Reset chat */}
          {messages.length > 0 && (
            <button 
              className="clear-chat-small-btn" 
              onClick={onClearChat}
              title="Reset Conversation"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          )}

          {/* User profile dropdown on right */}
          <UserProfile />
        </div>
      </div>

      {/* Main Center Area */}
      <div className="center-scroll-body">
        {messages.length === 0 ? (
          /* Welcome hero matching screenshot */
          <div className="exact-welcome-hero">
            {/* Center glowing golden orb */}
            <GoldenOrb />

            {/* Dynamic Greeting in strictly Yellow and Black Theme */}
            <h1 className="hero-greeting-title">
              Hi, <span className="electric-alex">{firstName} 👋</span>
            </h1>

            <p className="hero-greeting-sub">
              How can I assist you with your university journey today?
            </p>

            {/* Big Main Input Capsule */}
            <div className="main-search-capsule">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="| Tell us about your capabilities"
                rows={1}
                className="capsule-input-text"
                disabled={isLoading}
              />

              <div className="capsule-actions-row">
                <div className="actions-left-group">
                  <button className="paperclip-circle-btn" title="Attach file">
                    <Paperclip size={14} />
                  </button>

                  {/* Mode pill: Green dot + Open AI */}
                  <div 
                    className="open-ai-pill" 
                    onClick={onToggleDemo}
                    title="Toggle between Open AI and Campus Guide"
                  >
                    <span className="green-pulsing-dot"></span>
                    <span className="open-ai-text">
                      {demoMode?.simulate_ai_failure ? "Campus Guide" : "Open AI"}
                    </span>
                  </div>
                </div>

                <div className="actions-right-group">
                  <button 
                    className="yellow-send-arrow-btn"
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    title="Send"
                  >
                    <Send size={14} className="send-arrow-icon" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Active Chat Stream */
          <div className="active-messages-container">
            {messages.map((msg, index) => {
              const isUser = msg.sender === 'user';
              const isDataset = msg.source === 'dataset';

              return (
                <div key={index} className={`message-item-row ${isUser ? 'user-item' : 'bot-item'}`}>
                  {!isUser && (
                    <div className="mini-yellow-logo">
                      <span className="mini-square-glyph"></span>
                    </div>
                  )}

                  <div className="message-content-col">
                    {!isUser && (
                      <div className="meta-source-row">
                        <span className="source-label-yellow">
                          {isDataset ? "◈ Campus Guide" : "✦ Open AI"}
                        </span>
                        {msg.category && (
                          <span className="meta-category">• {msg.category}</span>
                        )}
                        <span className="meta-time">{msg.timestamp}</span>
                      </div>
                    )}

                    <div className={`message-bubble-box ${isUser ? 'user-bubble-box' : 'bot-bubble-box'}`}>
                      {msg.text.split('\n').map((line, lIdx) => {
                        if (line.startsWith('• ') || line.startsWith('- ')) {
                          return (
                            <div key={lIdx} className="bullet-item-line">
                              <span className="yellow-bullet">•</span>
                              <span>{line.substring(2)}</span>
                            </div>
                          );
                        }
                        return line ? <p key={lIdx} className="line-p">{line}</p> : <div key={lIdx} className="line-gap" />;
                      })}

                      {/* Copy action for bot message */}
                      {!isUser && msg.text && (
                        <div className="bubble-bot-actions">
                          <button 
                            className="msg-copy-btn"
                            onClick={() => handleCopy(msg.text, msg.id || index)}
                            title="Copy response"
                          >
                            {copiedId === (msg.id || index) ? (
                              <>
                                <Check size={12} className="text-yellow-glow" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy size={12} />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    {!isUser && msg.suggested_questions && msg.suggested_questions.length > 0 && (
                      <div className="followup-chips-row">
                        {msg.suggested_questions.map((q, qIdx) => (
                          <button
                            key={qIdx}
                            className="followup-chip"
                            onClick={() => onSendMessage(q)}
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="message-item-row bot-item">
                <div className="mini-yellow-logo">
                  <span className="mini-square-glyph"></span>
                </div>
                <div className="thinking-pill-box">
                  <span className="yellow-spinner-dot"></span>
                  <span>Analyzing inquiry...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Persistent Bottom Bar when chat is active */}
      {messages.length > 0 && (
        <div className="bottom-fixed-input-bar">
          <div className="main-search-capsule active-chat-mode">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="| Ask your question..."
              rows={1}
              className="capsule-input-text"
              disabled={isLoading}
            />

            <div className="capsule-actions-row">
              <div className="actions-left-group">
                <button className="paperclip-circle-btn" title="Attach file">
                  <Paperclip size={14} />
                </button>

                <div 
                  className="open-ai-pill" 
                  onClick={onToggleDemo}
                  title="Click to toggle"
                >
                  <span className="green-pulsing-dot"></span>
                  <span className="open-ai-text">
                    {demoMode?.simulate_ai_failure ? "Campus Guide" : "Open AI"}
                  </span>
                </div>
              </div>

              <div className="actions-right-group">
                <button 
                  className="yellow-send-arrow-btn"
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  title="Send"
                >
                  <Send size={14} className="send-arrow-icon" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Knowledge Base Modal */}
      {showKbModal && (
        <div className="kb-modal-backdrop" onClick={() => setShowKbModal(false)}>
          <div className="kb-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="kb-modal-header">
              <div className="kb-modal-title-row">
                <Database size={18} className="text-yellow-glow" />
                <div>
                  <h3 className="kb-modal-heading">University Knowledge Base</h3>
                  <span className="kb-modal-sub">52 Verified institutional answers across 20 categories</span>
                </div>
              </div>
              <button className="kb-close-btn" onClick={() => setShowKbModal(false)}>
                <X size={16} />
              </button>
            </div>

            <div className="kb-search-container">
              <Search size={15} className="kb-search-icon" />
              <input 
                type="text"
                placeholder="Search questions or keywords (attendance, fee, hostel, exams...)"
                value={kbSearch}
                onChange={(e) => setKbSearch(e.target.value)}
                className="kb-search-field"
              />
            </div>

            {/* Categories */}
            <div className="kb-cats-scroll">
              {kbCategories.map((c, i) => (
                <button 
                  key={i}
                  className={`kb-cat-chip ${kbSelectedCat === c ? 'active' : ''}`}
                  onClick={() => setKbSelectedCat(c)}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* FAQs List */}
            <div className="kb-faqs-scroll">
              {filteredKb.length === 0 ? (
                <div className="kb-empty">No matching FAQ entries found.</div>
              ) : (
                filteredKb.map((faq) => (
                  <div 
                    key={faq.id} 
                    className="kb-faq-row"
                    onClick={() => {
                      setShowKbModal(false);
                      onSendMessage(faq.question);
                    }}
                    title="Click to ask this question"
                  >
                    <span className="kb-cat-tag">{faq.category}</span>
                    <span className="kb-faq-text">{faq.question}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .exact-chat-window {
          flex: 1;
          display: flex;
          flex-direction: column;
          background-color: #08090b;
          background-image: 
            radial-gradient(circle at 50% 28%, rgba(226, 238, 42, 0.08) 0%, transparent 40%),
            radial-gradient(circle at 82% 82%, rgba(226, 238, 42, 0.05) 0%, transparent 35%),
            linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
          background-size: 100% 100%, 100% 100%, 28px 28px, 28px 28px;
          height: 100vh;
          position: relative;
          overflow: hidden;
        }
        .top-header-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          background: #08090b;
          z-index: 10;
        }
        .header-left-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .mobile-toggle-btn {
          display: none;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #ffffff;
          padding: 6px;
          border-radius: 6px;
          cursor: pointer;
        }
        .brand-logo-container {
          display: flex;
          align-items: center;
          gap: 9px;
        }
        .yellow-square-badge {
          width: 22px;
          height: 22px;
          border-radius: 5px;
          background: #facc15;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 10px rgba(250, 204, 21, 0.4);
        }
        .badge-inner-square {
          width: 8px;
          height: 8px;
          border: 2px solid #101114;
          border-radius: 2px;
        }
        .brand-text-label {
          font-weight: 700;
          font-size: 0.95rem;
          color: #ffffff;
          letter-spacing: -0.01em;
        }
        .brand-sub-badge {
          font-size: 0.65rem;
          font-weight: 700;
          background: rgba(250, 204, 21, 0.15);
          color: #facc15;
          border: 1px solid rgba(250, 204, 21, 0.4);
          padding: 2px 7px;
          border-radius: 999px;
          letter-spacing: 0.02em;
        }
        .header-right-user {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .home-header-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: rgba(250, 204, 21, 0.08);
          border: 1.5px solid rgba(250, 204, 21, 0.35);
          border-radius: 9999px;
          padding: 6px 16px;
          color: #f3f4f6;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.6), 0 0 12px rgba(250, 204, 21, 0.12);
        }
        .home-header-btn .home-icon {
          color: #facc15;
          transition: transform 0.25s ease, color 0.25s ease;
        }
        .home-header-btn:hover {
          background: #facc15;
          color: #000000;
          border-color: #facc15;
          box-shadow: 0 4px 20px rgba(250, 204, 21, 0.5), 0 0 10px rgba(250, 204, 21, 0.3);
          transform: translateY(-1.5px);
        }
        .home-header-btn:hover .home-icon {
          color: #000000;
          transform: scale(1.15);
        }
        .home-header-btn:active {
          transform: translateY(0);
        }
        .cursor-pointer {
          cursor: pointer;
        }
        .kb-header-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(250, 204, 21, 0.08);
          border: 1px solid rgba(250, 204, 21, 0.3);
          border-radius: 20px;
          padding: 5px 12px;
          color: #e5e7eb;
          font-size: 0.725rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .kb-header-pill:hover {
          background: rgba(250, 204, 21, 0.15);
          border-color: #facc15;
          color: #facc15;
        }
        .text-yellow-glow {
          color: #facc15;
        }
        .clear-chat-small-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          background: transparent;
          border: none;
          color: #d1d5db;
          font-size: 0.75rem;
          cursor: pointer;
        }
        .clear-chat-small-btn:hover {
          color: #facc15;
        }
        .user-avatar-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          overflow: hidden;
          border: 1.5px solid rgba(250, 204, 21, 0.4);
          cursor: pointer;
        }
        .avatar-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .center-scroll-body {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }
        .exact-welcome-hero {
          margin: auto;
          width: 100%;
          max-width: 760px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 24px 20px 20px;
        }
        .hero-greeting-title {
          font-size: clamp(1.8rem, 4vw, 2.3rem);
          font-weight: 800;
          color: #ffffff;
          letter-spacing: -0.02em;
          margin-bottom: 8px;
        }
        .electric-alex {
          color: #ffd700;
          text-shadow: 0 0 16px rgba(250, 204, 21, 0.35);
        }
        .hero-greeting-sub {
          font-size: 0.95rem;
          color: #d1d5db;
          margin-bottom: 24px;
        }
        .main-search-capsule {
          width: 100%;
          max-width: 640px;
          background: #131417;
          border: 1px solid #202127;
          border-radius: 18px;
          padding: 14px 18px 12px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 28px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .main-search-capsule:focus-within {
          border-color: rgba(250, 204, 21, 0.5);
          box-shadow: 0 0 20px rgba(250, 204, 21, 0.2);
        }
        .main-search-capsule.active-chat-mode {
          margin-bottom: 0;
        }
        .capsule-input-text {
          width: 100%;
          background: transparent;
          border: none;
          outline: none;
          color: #ffffff;
          font-family: inherit;
          font-size: 0.925rem;
          resize: none;
          line-height: 1.5;
        }
        .capsule-input-text::placeholder {
          color: #9ca3af;
        }
        .capsule-actions-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .actions-left-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .paperclip-circle-btn {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #1a1b20;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #d1d5db;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: color 0.15s;
        }
        .paperclip-circle-btn:hover {
          color: #ffd700;
          border-color: rgba(250, 204, 21, 0.4);
        }
        .open-ai-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #1a1b20;
          border: 1px solid rgba(250, 204, 21, 0.25);
          border-radius: 20px;
          padding: 5px 12px;
          cursor: pointer;
          transition: border-color 0.2s;
        }
        .open-ai-pill:hover {
          border-color: #facc15;
          background: rgba(250, 204, 21, 0.1);
        }
        .green-pulsing-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 6px #22c55e;
        }
        .open-ai-text {
          font-size: 0.75rem;
          font-weight: 700;
          color: #ffffff;
        }
        .actions-right-group {
          display: flex;
          align-items: center;
        }
        .yellow-send-arrow-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #facc15;
          border: none;
          color: #000000;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 2px 10px rgba(250, 204, 21, 0.4);
        }
        .yellow-send-arrow-btn:hover:not(:disabled) {
          transform: scale(1.08);
          background: #ffe600;
          box-shadow: 0 0 16px rgba(250, 204, 21, 0.7);
        }
        .yellow-send-arrow-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .send-arrow-icon {
          transform: rotate(-10deg);
        }
        .three-cards-grid {
          width: 100%;
          max-width: 720px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }
        .exact-action-card {
          background: #141518;
          border: 1px solid #1f2026;
          border-radius: 16px;
          padding: 14px 12px 16px;
          display: flex;
          align-items: flex-start;
          gap: 10px;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .exact-action-card:hover {
          background: #1a1b20;
          border-color: rgba(250, 204, 21, 0.45);
          transform: translateY(-2px);
        }
        .card-yellow-icon-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #1a1c22;
          border: 1px solid rgba(250, 204, 21, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .icon-yellow-color {
          color: #facc15;
        }
        .card-info-stack {
          display: flex;
          flex-direction: column;
        }
        .card-main-title {
          font-size: 0.8rem;
          font-weight: 700;
          color: #ffffff;
          line-height: 1.2;
        }
        .card-second-title {
          font-size: 0.78rem;
          font-weight: 600;
          color: #d1d5db;
          line-height: 1.2;
        }
        .card-desc-text {
          font-size: 0.72rem;
          color: #d1d5db;
          margin-top: 5px;
          line-height: 1.35;
        }
        .quick-student-pills-bar {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 22px;
          width: 100%;
          max-width: 720px;
        }
        .quick-pills-lead {
          font-size: 0.75rem;
          font-weight: 700;
          color: #d1d5db;
        }
        .quick-pill-btn {
          background: #131418;
          border: 1px solid rgba(250, 204, 21, 0.25);
          border-radius: 12px;
          padding: 5px 12px;
          color: #e5e7eb;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .quick-pill-btn:hover {
          color: #000000;
          border-color: #facc15;
          background: #facc15;
        }
        .active-messages-container {
          padding: 24px 30px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .message-item-row {
          display: flex;
          gap: 12px;
          max-width: 85%;
        }
        .user-item {
          align-self: flex-end;
          justify-content: flex-end;
        }
        .bot-item {
          align-self: flex-start;
        }
        .mini-yellow-logo {
          width: 22px;
          height: 22px;
          border-radius: 5px;
          background: #facc15;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 4px;
          box-shadow: 0 0 8px rgba(250, 204, 21, 0.4);
        }
        .mini-square-glyph {
          width: 8px;
          height: 8px;
          border: 1.5px solid #000000;
          border-radius: 1px;
        }
        .message-content-col {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .meta-source-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.72rem;
          color: #9ca3af;
        }
        .source-label-yellow {
          color: #ffd700;
          font-weight: 700;
        }
        .meta-category {
          color: #d1d5db;
        }
        .meta-time {
          color: #9ca3af;
        }
        .message-bubble-box {
          padding: 14px 18px;
          border-radius: 16px;
          font-size: 0.92rem;
          line-height: 1.6;
        }
        /* Yellow bubble box with Black text for user */
        .user-bubble-box {
          background: linear-gradient(135deg, #ffe600 0%, #ffd700 50%, #eab308 100%);
          color: #000000;
          font-weight: 700;
          border: none;
          border-bottom-right-radius: 4px;
          box-shadow: 0 4px 18px rgba(250, 204, 21, 0.4);
        }
        .bot-bubble-box {
          background: #121318;
          color: #f3f4f6;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-bottom-left-radius: 4px;
        }
        .bullet-item-line {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          margin: 4px 0;
        }
        .yellow-bullet {
          color: #facc15;
          font-weight: bold;
          font-size: 1.1rem;
        }
        .line-p {
          margin-bottom: 6px;
        }
        .line-p:last-child {
          margin-bottom: 0;
        }
        .line-gap {
          height: 6px;
        }
        .bubble-bot-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 8px;
          padding-top: 6px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }
        .msg-copy-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: transparent;
          border: none;
          color: #d1d5db;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: color 0.15s;
        }
        .msg-copy-btn:hover {
          color: #ffd700;
        }
        .followup-chips-row {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 4px;
        }
        .followup-chip {
          background: #16171d;
          border: 1px solid rgba(250, 204, 21, 0.25);
          color: #e5e7eb;
          font-size: 0.75rem;
          padding: 5px 12px;
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .followup-chip:hover {
          background: rgba(250, 204, 21, 0.15);
          color: #ffd700;
          border-color: #ffd700;
        }
        .thinking-pill-box {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #141519;
          padding: 8px 14px;
          border-radius: 18px;
          font-size: 0.8rem;
          color: #ffd700;
          border: 1px solid rgba(250, 204, 21, 0.4);
        }
        .yellow-spinner-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #ffd700;
          box-shadow: 0 0 8px #ffd700;
        }
        .bottom-fixed-input-bar {
          padding: 12px 24px 16px;
          background: #08090b;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          display: flex;
          justify-content: center;
        }

        /* Modal Styles */
        .kb-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(6px);
          z-index: 999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .kb-modal-card {
          width: 100%;
          max-width: 680px;
          max-height: 80vh;
          background: #101116;
          border: 1px solid rgba(250, 204, 21, 0.45);
          border-radius: 20px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.95), 0 0 20px rgba(250, 204, 21, 0.15);
        }
        .kb-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 22px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .kb-modal-title-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .kb-modal-heading {
          font-size: 1.05rem;
          font-weight: 800;
          color: #ffffff;
        }
        .kb-modal-sub {
          font-size: 0.75rem;
          color: #d1d5db;
        }
        .kb-close-btn {
          background: transparent;
          border: none;
          color: #d1d5db;
          cursor: pointer;
          padding: 4px;
        }
        .kb-close-btn:hover {
          color: #ffd700;
        }
        .kb-search-container {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          margin: 14px 22px 10px;
          background: #171820;
          border: 1px solid rgba(250, 204, 21, 0.25);
          border-radius: 12px;
        }
        .kb-search-icon {
          color: #facc15;
        }
        .kb-search-field {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: #ffffff;
          font-size: 0.88rem;
        }
        .kb-search-field::placeholder {
          color: #9ca3af;
        }
        .kb-cats-scroll {
          display: flex;
          gap: 6px;
          padding: 0 22px 10px;
          overflow-x: auto;
        }
        .kb-cat-chip {
          padding: 5px 12px;
          border-radius: 12px;
          background: #171820;
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #d1d5db;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
        }
        .kb-cat-chip:hover {
          color: #ffffff;
          border-color: rgba(250, 204, 21, 0.4);
        }
        .kb-cat-chip.active {
          background: #facc15;
          color: #000000;
          font-weight: 800;
          border-color: #facc15;
        }
        .kb-faqs-scroll {
          flex: 1;
          overflow-y: auto;
          padding: 4px 22px 18px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .kb-empty {
          font-size: 0.85rem;
          color: #d1d5db;
          text-align: center;
          padding: 24px;
        }
        .kb-faq-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 14px;
          background: #15161d;
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .kb-faq-row:hover {
          background: #1c1e28;
          border-color: rgba(250, 204, 21, 0.5);
          transform: translateX(2px);
        }
        .kb-cat-tag {
          font-size: 0.68rem;
          font-weight: 800;
          color: #000000;
          background: #facc15;
          padding: 2px 7px;
          border-radius: 6px;
          flex-shrink: 0;
        }
        .kb-faq-text {
          font-size: 0.85rem;
          color: #f3f4f6;
          line-height: 1.4;
        }

        @media (max-width: 900px) {
          .mobile-toggle-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffd700;
            background: rgba(250, 204, 21, 0.12);
            border: 1px solid rgba(250, 204, 21, 0.35);
            padding: 7px;
            border-radius: 8px;
          }
          .three-cards-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .top-header-bar {
            padding: 12px 16px;
          }
          .active-messages-container {
            padding: 18px 16px;
            gap: 16px;
          }
          .message-item-row {
            max-width: 92%;
          }
          .bottom-fixed-input-bar {
            padding: 10px 14px;
          }
        }

        @media (max-width: 640px) {
          .top-header-bar {
            padding: 10px 12px;
          }
          .brand-sub-badge {
            display: none;
          }
          .brand-text-label {
            font-size: 0.88rem;
          }
          .home-header-btn {
            padding: 5px 10px;
            font-size: 0.76rem;
            gap: 4px;
          }
          .exact-welcome-hero {
            padding: 16px 12px 14px;
          }
          .hero-greeting-title {
            font-size: 1.6rem;
          }
          .hero-greeting-sub {
            font-size: 0.86rem;
            margin-bottom: 18px;
          }
          .main-search-capsule {
            padding: 12px 14px 10px;
            border-radius: 14px;
            margin-bottom: 16px;
          }
          .three-cards-grid {
            grid-template-columns: 1fr;
          }
          .message-item-row {
            max-width: 96%;
          }
          .message-bubble-box {
            padding: 11px 13px;
            font-size: 0.84rem;
          }
          .user-item {
            max-width: 90%;
          }
          .bottom-fixed-input-bar {
            padding: 8px 10px calc(8px + env(safe-area-inset-bottom, 0px));
          }
          .kb-modal-card {
            max-height: 90vh;
            border-radius: 14px;
          }
          .kb-search-container {
            margin: 10px 14px 8px;
          }
          .kb-cats-scroll {
            padding: 0 14px 8px;
          }
          .kb-faqs-scroll {
            padding: 4px 14px 14px;
          }
        }
      `}</style>
    </div>
  );
}
