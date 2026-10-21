import React, { useState } from 'react';
import { 
  Sparkles, 
  Database, 
  User, 
  Bot, 
  Copy, 
  Check, 
  Tag, 
  AlertCircle 
} from 'lucide-react';

export default function ChatMessage({ message, onSelectPrompt }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.sender === 'user';
  const isSystem = message.source === 'system';
  const isAi = message.source === 'ai';
  const isDataset = message.source === 'dataset';

  const copyToClipboard = () => {
    if (message.text) {
      navigator.clipboard.writeText(message.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`message-row ${isUser ? 'user-row' : 'bot-row'} animate-fade-in`}>
      {/* Bot Avatar */}
      {!isUser && (
        <div className={`avatar bot-avatar ${isDataset ? 'avatar-kb' : 'avatar-ai'}`}>
          {isDataset ? <Database size={16} /> : <Bot size={18} />}
        </div>
      )}

      {/* Message Content Container */}
      <div className={`message-bubble-wrapper ${isUser ? 'user-wrapper' : 'bot-wrapper'}`}>
        
        {/* Source Badge on Bot Message Header */}
        {!isUser && (
          <div className="message-meta-header">
            {isAi && (
              <span className="source-badge badge-ai">
                <Sparkles size={12} />
                <span>✦ Student Assistant</span>
              </span>
            )}
            {isDataset && (
              <span className="source-badge badge-kb">
                <Database size={12} />
                <span>◈ Campus Knowledge Base</span>
              </span>
            )}
            {isSystem && (
              <span className="source-badge badge-system">
                <AlertCircle size={12} />
                <span>Notice</span>
              </span>
            )}

            {message.category && (
              <span className="category-pill">
                <Tag size={10} />
                <span>{message.category}</span>
              </span>
            )}

            {message.timestamp && (
              <span className="message-time">{message.timestamp}</span>
            )}
          </div>
        )}

        {/* Bubble */}
        <div className={`message-bubble ${isUser ? 'user-bubble' : 'bot-bubble'}`}>
          <div className="message-text">
            {message.text.split('\n').map((paragraph, idx) => {
              if (paragraph.startsWith('• ') || paragraph.startsWith('- ')) {
                return (
                  <div key={idx} className="bullet-point">
                    <span className="bullet-dot">•</span>
                    <span>{paragraph.substring(2)}</span>
                  </div>
                );
              }
              return paragraph ? (
                <p key={idx} className="message-paragraph">{paragraph}</p>
              ) : (
                <div key={idx} className="paragraph-spacer" />
              );
            })}
          </div>

          {/* Action buttons (Copy) for Bot responses */}
          {!isUser && message.text && (
            <div className="bubble-actions">
              <button 
                className="copy-btn" 
                onClick={copyToClipboard}
                title="Copy response to clipboard"
              >
                {copied ? (
                  <>
                    <Check size={13} className="text-emerald" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* User Timestamp */}
        {isUser && message.timestamp && (
          <div className="user-meta-footer">
            <span className="message-time">{message.timestamp}</span>
          </div>
        )}

        {/* Related Suggested Questions if provided */}
        {!isUser && message.suggested_questions && message.suggested_questions.length > 0 && (
          <div className="message-suggestions">
            <span className="suggestion-label text-gradient-sunset">Related questions:</span>
            <div className="suggestion-chips">
              {message.suggested_questions.map((prompt, pIdx) => (
                <button
                  key={pIdx}
                  className="suggestion-chip"
                  onClick={() => onSelectPrompt && onSelectPrompt(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="avatar user-avatar">
          <User size={16} />
        </div>
      )}

      <style>{`
        .message-row {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
          width: 100%;
        }
        .user-row {
          justify-content: flex-end;
        }
        .bot-row {
          justify-content: flex-start;
        }
        .avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 4px;
        }
        .avatar-ai {
          background: linear-gradient(135deg, #ffe600 0%, #ffd700 50%, #eab308 100%);
          color: #000000;
          box-shadow: 0 4px 14px rgba(250, 204, 21, 0.4);
        }
        .avatar-kb {
          background: #111114;
          color: #ffd700;
          border: 1.5px solid #ffd700;
          box-shadow: 0 4px 14px rgba(250, 204, 21, 0.2);
        }
        .user-avatar {
          background: #111114;
          color: #ffd700;
          border: 1.5px solid rgba(250, 204, 21, 0.4);
        }
        .message-bubble-wrapper {
          display: flex;
          flex-direction: column;
          max-width: 80%;
        }
        @media (max-width: 640px) {
          .message-bubble-wrapper {
            max-width: 90%;
          }
        }
        .user-wrapper {
          align-items: flex-end;
        }
        .bot-wrapper {
          align-items: flex-start;
        }
        .message-meta-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
          flex-wrap: wrap;
        }
        .source-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 0.725rem;
          font-weight: 700;
          padding: 2px 9px;
          border-radius: var(--radius-full);
          border: 1px solid;
          letter-spacing: 0.02em;
        }
        .badge-ai {
          background: rgba(250, 204, 21, 0.15);
          border-color: rgba(250, 204, 21, 0.5);
          color: #fde047;
        }
        .badge-kb {
          background: rgba(234, 179, 8, 0.12);
          border-color: rgba(234, 179, 8, 0.45);
          color: #facc15;
        }
        .badge-system {
          background: rgba(250, 204, 21, 0.1);
          border-color: rgba(250, 204, 21, 0.35);
          color: #fef08a;
        }
        .category-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.7rem;
          font-weight: 700;
          color: #000000;
          background: #ffd700;
          padding: 2px 8px;
          border-radius: var(--radius-full);
          border: 1px solid #ffd700;
        }
        .message-time {
          font-size: 0.72rem;
          color: #9ca3af;
        }
        .message-bubble {
          padding: 14px 18px;
          border-radius: var(--radius-lg);
          font-size: 0.95rem;
          line-height: 1.6;
          word-break: break-word;
        }
        .user-bubble {
          background: linear-gradient(135deg, #ffe600 0%, #ffd700 50%, #eab308 100%);
          color: #000000;
          font-weight: 600;
          border-bottom-right-radius: 4px;
          box-shadow: 0 4px 18px rgba(250, 204, 21, 0.35);
        }
        .bot-bubble {
          background: #111116;
          color: #f3f4f6;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-bottom-left-radius: 4px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.8);
        }
        .message-paragraph {
          margin-bottom: 8px;
        }
        .message-paragraph:last-child {
          margin-bottom: 0;
        }
        .paragraph-spacer {
          height: 6px;
        }
        .bullet-point {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          margin-bottom: 4px;
        }
        .bullet-dot {
          color: #ffd700;
          font-weight: bold;
        }
        .bubble-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 8px;
          padding-top: 6px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
        .copy-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: transparent;
          border: none;
          color: #d1d5db;
          font-size: 0.75rem;
          cursor: pointer;
          padding: 3px 6px;
          border-radius: 4px;
          transition: all 0.15s ease;
        }
        .copy-btn:hover {
          color: #ffd700;
          background: rgba(250, 204, 21, 0.1);
        }
        .text-emerald {
          color: #ffd700;
        }
        .user-meta-footer {
          margin-top: 4px;
        }
        .message-suggestions {
          margin-top: 10px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .suggestion-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: #d1d5db;
        }
        .suggestion-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .suggestion-chip {
          background: #141419;
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #e5e7eb;
          font-size: 0.75rem;
          font-weight: 500;
          padding: 5px 12px;
          border-radius: var(--radius-full);
          cursor: pointer;
          text-align: left;
          transition: all 0.2s ease;
        }
        .suggestion-chip:hover {
          background: rgba(250, 204, 21, 0.15);
          color: #ffd700;
          border-color: rgba(250, 204, 21, 0.5);
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
}
