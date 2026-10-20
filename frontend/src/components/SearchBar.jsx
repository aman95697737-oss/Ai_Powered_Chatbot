import React, { useRef, useEffect } from 'react';
import { Send, X, Sparkles } from 'lucide-react';

export default function SearchBar({
  input,
  setInput,
  onSendMessage,
  isLoading,
  placeholder = "Ask any question about university life, exams, hostels..."
}) {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleClear = () => {
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="searchbar-container">
      <div className={`searchbar-box ${isLoading ? 'is-loading' : ''}`}>
        <div className="input-prefix">
          <Sparkles size={18} className="sparkle-icon" />
        </div>

        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          disabled={isLoading}
          className="search-textarea"
        />

        <div className="search-actions">
          {input && !isLoading && (
            <button 
              type="button" 
              onClick={handleClear} 
              className="action-icon-btn clear-btn"
              title="Clear input"
            >
              <X size={16} />
            </button>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!input.trim() || isLoading}
            className="btn btn-primary send-btn"
            title="Send question (Enter)"
          >
            {isLoading ? (
              <span className="spinner-dots">
                <span className="dot dot-1">•</span>
                <span className="dot dot-2">•</span>
                <span className="dot dot-3">•</span>
              </span>
            ) : (
              <>
                <Send size={15} />
                <span className="hide-on-mobile send-label">Send</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="searchbar-hints">
        <span className="hint-text">
          Press <kbd>Enter ↵</kbd> to ask • <span className="text-gradient-sunset font-semibold">Instant Answers with Zero Downtime</span>
        </span>
      </div>

      <style>{`
        .searchbar-container {
          width: 100%;
          max-width: 860px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .searchbar-box {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px 8px 16px;
          border-radius: var(--radius-xl);
          background: #0f0f14;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.8);
          transition: all 0.25s ease;
        }
        .searchbar-box:focus-within {
          border-color: #ffd700;
          box-shadow: 0 0 24px rgba(250, 204, 21, 0.3);
        }
        .searchbar-box.is-loading {
          opacity: 0.85;
          pointer-events: none;
        }
        .input-prefix {
          display: flex;
          align-items: center;
          color: #ffd700;
        }
        .search-textarea {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: #ffffff;
          font-family: var(--font-sans);
          font-size: 0.95rem;
          resize: none;
          max-height: 120px;
          line-height: 1.5;
          padding: 6px 0;
        }
        .search-textarea::placeholder {
          color: #6b7280;
        }
        .search-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .action-icon-btn {
          background: transparent;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          padding: 6px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .action-icon-btn:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.08);
        }
        .send-btn {
          padding: 8px 16px;
          border-radius: var(--radius-full);
          font-size: 0.875rem;
          min-width: 44px;
          height: 38px;
        }
        .spinner-dots {
          display: inline-flex;
          align-items: center;
          gap: 2px;
          font-size: 1.2rem;
          line-height: 0;
        }
        .searchbar-hints {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .hint-text {
          font-size: 0.725rem;
          color: #9ca3af;
        }
        .font-semibold {
          font-weight: 600;
        }
        kbd {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 4px;
          padding: 1px 5px;
          font-family: var(--font-mono);
          font-size: 0.675rem;
          color: #ffd700;
        }
      `}</style>
    </div>
  );
}
