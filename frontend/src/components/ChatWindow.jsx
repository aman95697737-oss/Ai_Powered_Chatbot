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
          width: 20px;
          height: 20px;
          border-radius: 5px;
          background: #e2ee2a;
          display: flex;
          align-items: center;
          justify-content: center;
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
          background: rgba(226, 238, 42, 0.12);
          color: #e2ee2a;
          border: 1px solid rgba(226, 238, 42, 0.35);
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
          background: rgba(226, 238, 42, 0.08);
          border: 1px solid rgba(226, 238, 42, 0.3);
          border-radius: 20px;
          padding: 5px 12px;
          color: #ded9b1;
          font-size: 0.725rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .kb-header-pill:hover {
          background: rgba(226, 238, 42, 0.15);
          border-color: #e2ee2a;
          color: #e2ee2a;
        }
        .text-yellow-glow {
          color: #e2ee2a;
        }
        .clear-chat-small-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          background: transparent;
          border: none;
          color: #82838c;
          font-size: 0.75rem;
          cursor: pointer;
        }
        .clear-chat-small-btn:hover {
          color: #e2ee2a;
        }
        .user-avatar-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          overflow: hidden;
          border: 1.5px solid rgba(226, 238, 42, 0.4);
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
          font-size: 2.1rem;
          font-weight: 800;
          color: #ded9b1;
          letter-spacing: -0.02em;
          margin-bottom: 6px;
        }
        .electric-alex {
          color: #e2ee2a;
        }
        .hero-greeting-sub {
          font-size: 0.825rem;
          color: #82838c;
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
          border-color: rgba(226, 238, 42, 0.45);
          box-shadow: 0 0 20px rgba(226, 238, 42, 0.15);
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
          font-size: 0.875rem;
          resize: none;
          line-height: 1.5;
        }
        .capsule-input-text::placeholder {
          color: #565761;
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
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: #1a1b20;
          border: 1px solid rgba(255, 255, 255, 0.05);
          color: #82838c;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: color 0.15s;
        }
        .paperclip-circle-btn:hover {
          color: #ffffff;
        }
        .open-ai-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #1a1b20;
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 20px;
          padding: 4px 10px;
          cursor: pointer;
          transition: border-color 0.2s;
        }
        .open-ai-pill:hover {
          border-color: rgba(226, 238, 42, 0.35);
        }
        .green-pulsing-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 6px #22c55e;
        }
        .open-ai-text {
          font-size: 0.725rem;
          font-weight: 600;
          color: #e5e7eb;
        }
        .actions-right-group {
          display: flex;
          align-items: center;
        }
        .yellow-send-arrow-btn {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #e2ee2a;
          border: none;
          color: #101114;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .yellow-send-arrow-btn:hover:not(:disabled) {
          transform: scale(1.06);
          box-shadow: 0 0 14px rgba(226, 238, 42, 0.5);
        }
        .yellow-send-arrow-btn:disabled {
          opacity: 0.35;
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
          border-color: rgba(226, 238, 42, 0.35);
          transform: translateY(-2px);
        }
        .card-yellow-icon-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #1a1c22;
          border: 1px solid rgba(226, 238, 42, 0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .icon-yellow-color {
          color: #e2ee2a;
        }
        .card-info-stack {
          display: flex;
          flex-direction: column;
        }
        .card-main-title {
          font-size: 0.775rem;
          font-weight: 700;
          color: #ffffff;
          line-height: 1.2;
        }
        .card-second-title {
          font-size: 0.75rem;
          font-weight: 600;
          color: #a5a7b2;
          line-height: 1.2;
        }
        .card-desc-text {
          font-size: 0.625rem;
          color: #636674;
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
          font-size: 0.7rem;
          font-weight: 600;
          color: #6b6d7a;
        }
        .quick-pill-btn {
          background: #131418;
          border: 1px solid rgba(226, 238, 42, 0.2);
          border-radius: 12px;
          padding: 4px 10px;
          color: #a5a7b2;
          font-size: 0.7rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .quick-pill-btn:hover {
          color: #e2ee2a;
          border-color: #e2ee2a;
          background: rgba(226, 238, 42, 0.08);
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
          width: 20px;
          height: 20px;
          border-radius: 4px;
          background: #e2ee2a;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 4px;
        }
        .mini-square-glyph {
          width: 7px;
          height: 7px;
          border: 1.5px solid #101114;
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
          gap: 6px;
          font-size: 0.675rem;
          color: #82838c;
        }
        .source-label-yellow {
          color: #e2ee2a;
          font-weight: 600;
        }
        .meta-category {
          color: #a5a7b2;
        }
        .meta-time {
          color: #565761;
        }
        .message-bubble-box {
          padding: 14px 18px;
          border-radius: 16px;
          font-size: 0.875rem;
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
          background: #141519;
          color: #e5e7eb;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-bottom-left-radius: 4px;
        }
        .bullet-item-line {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          margin: 4px 0;
        }
        .yellow-bullet {
          color: #e2ee2a;
          font-weight: bold;
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
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
        .msg-copy-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: transparent;
          border: none;
          color: #82838c;
          font-size: 0.7rem;
          cursor: pointer;
          transition: color 0.15s;
        }
        .msg-copy-btn:hover {
          color: #e2ee2a;
        }
        .followup-chips-row {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 4px;
        }
        .followup-chip {
          background: #18191e;
          border: 1px solid rgba(255, 255, 255, 0.05);
          color: #a5a7b2;
          font-size: 0.725rem;
          padding: 4px 10px;
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .followup-chip:hover {
          background: #20222a;
          color: #e2ee2a;
          border-color: rgba(226, 238, 42, 0.35);
        }
        .thinking-pill-box {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #141519;
          padding: 8px 14px;
          border-radius: 18px;
          font-size: 0.775rem;
          color: #ded9b1;
          border: 1px solid rgba(226, 238, 42, 0.3);
        }
        .yellow-spinner-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #e2ee2a;
          box-shadow: 0 0 8px #e2ee2a;
        }
        .bottom-fixed-input-bar {
          padding: 12px 24px 16px;
          background: #08090b;
          border-top: 1px solid rgba(255, 255, 255, 0.04);
          display: flex;
          justify-content: center;
        }

        /* Modal Styles */
        .kb-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.82);
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
          border: 1px solid rgba(226, 238, 42, 0.35);
          border-radius: 20px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.95);
        }
        .kb-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 22px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
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
          font-size: 0.725rem;
          color: #82838c;
        }
        .kb-close-btn {
          background: transparent;
          border: none;
          color: #82838c;
          cursor: pointer;
          padding: 4px;
        }
        .kb-close-btn:hover {
          color: #e2ee2a;
        }
        .kb-search-container {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          margin: 14px 22px 10px;
          background: #171820;
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
        }
        .kb-search-icon {
          color: #e2ee2a;
        }
        .kb-search-field {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: #ffffff;
          font-size: 0.85rem;
        }
        .kb-search-field::placeholder {
          color: #636674;
        }
        .kb-cats-scroll {
          display: flex;
          gap: 6px;
          padding: 0 22px 10px;
          overflow-x: auto;
        }
        .kb-cat-chip {
          padding: 4px 10px;
          border-radius: 12px;
          background: #171820;
          border: 1px solid rgba(255, 255, 255, 0.05);
          color: #82838c;
          font-size: 0.7rem;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
        }
        .kb-cat-chip:hover {
          color: #ffffff;
        }
        .kb-cat-chip.active {
          background: #e2ee2a;
          color: #101114;
          font-weight: 700;
          border-color: #e2ee2a;
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
          font-size: 0.8rem;
          color: #82838c;
          text-align: center;
          padding: 24px;
        }
        .kb-faq-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          background: #15161d;
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .kb-faq-row:hover {
          background: #1c1e28;
          border-color: rgba(226, 238, 42, 0.4);
          transform: translateX(2px);
        }
        .kb-cat-tag {
          font-size: 0.65rem;
          font-weight: 700;
          color: #101114;
          background: #e2ee2a;
          padding: 2px 7px;
          border-radius: 6px;
          flex-shrink: 0;
        }
        .kb-faq-text {
          font-size: 0.8rem;
          color: #e5e7eb;
          line-height: 1.4;
        }

        @media (max-width: 900px) {
          .mobile-toggle-btn {
            display: flex;
          }
          .three-cards-grid {
            grid-template-columns: 1fr;
          }
          .hero-greeting-title {
            font-size: 1.6rem;
          }
          .kb-pill-text {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
