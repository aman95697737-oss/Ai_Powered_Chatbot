import React, { useState } from 'react';
import { 
  Edit3, 
  Trash2, 
  X, 
  Search, 
  Trash,
  Clock
} from 'lucide-react';

export default function Sidebar({
  chatHistory = [],
  onSelectHistory,
  onNewChat,
  onClearChat,
  onDeleteItem,
  isOpen,
  onCloseMobile
}) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter history items by search query
  const filteredHistory = chatHistory.filter(item => {
    if (!searchQuery.trim()) return true;
    const q = item.question || item;
    return typeof q === 'string' && q.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <aside className={`exact-sidebar ${isOpen ? 'open' : ''}`}>
      {/* Top action icons */}
      <div className="sidebar-top-bar">
        <div className="left-action-icons">
          <button 
            className="icon-btn" 
            onClick={onNewChat}
            title="New Chat (Fresh Start)"
          >
            <Edit3 size={15} />
          </button>
          {chatHistory.length > 0 && (
            <button 
              className="icon-btn" 
              onClick={onClearChat}
              title="Clear All History"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
        <button 
          className="icon-btn close-btn" 
          onClick={onCloseMobile}
          title="Close Sidebar"
        >
          <X size={15} />
        </button>
      </div>

      {/* Search Bar Capsule */}
      <div className="sidebar-search-capsule">
        <input 
          type="text" 
          placeholder="Search history" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input-field"
        />
        <Search size={14} className="search-glass-icon" />
      </div>

      {/* Scrollable history list: ONLY real user inquiries */}
      <div className="sidebar-content-scroll">
        <div className="history-time-section">
          <span className="time-heading">Search History</span>

          {filteredHistory.length > 0 ? (
            filteredHistory.map((item, idx) => {
              const qText = item.question || item;
              const itemId = item.id || idx;

              return (
                <div 
                  key={itemId} 
                  className="history-pill"
                  onClick={() => onSelectHistory && onSelectHistory(item)}
                  title={qText}
                >
                  <span className="pill-title">{qText}</span>
                  <div className="pill-actions-wrapper" onClick={(e) => e.stopPropagation()}>
                    <button 
                      className="pill-delete-btn" 
                      onClick={() => onDeleteItem && onDeleteItem(item.id)}
                      title="Remove from history"
                    >
                      <Trash size={12} />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="empty-history-container">
              <Clock size={20} className="empty-clock-icon" />
              <p className="empty-main-text">No history yet</p>
              <p className="empty-sub-text">Questions you search or ask will appear here.</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .exact-sidebar {
          width: 260px;
          min-width: 260px;
          height: 100vh;
          background: #0d0e12;
          border-right: 1px solid rgba(250, 204, 21, 0.15);
          display: flex;
          flex-direction: column;
          padding: 16px 14px 18px;
          position: relative;
          z-index: 100;
          user-select: none;
        }
        .sidebar-top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }
        .left-action-icons {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .icon-btn {
          background: transparent;
          border: none;
          color: #d1d5db;
          cursor: pointer;
          padding: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          transition: all 0.15s;
        }
        .icon-btn:hover {
          color: #ffd700;
          background: rgba(250, 204, 21, 0.15);
        }
        .close-btn {
          color: #facc15;
          background: rgba(250, 204, 21, 0.1);
          border: 1px solid rgba(250, 204, 21, 0.3);
          border-radius: 6px;
          padding: 6px;
        }
        .close-btn:hover {
          color: #000000;
          background: #facc15;
        }
        .sidebar-search-capsule {
          display: flex;
          align-items: center;
          background: #15161c;
          border: 1px solid rgba(250, 204, 21, 0.2);
          border-radius: 20px;
          padding: 8px 14px;
          margin-bottom: 14px;
        }
        .sidebar-search-capsule:focus-within {
          border-color: #facc15;
          box-shadow: 0 0 10px rgba(250, 204, 21, 0.2);
        }
        .search-input-field {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: #ffffff;
          font-size: 0.825rem;
          font-family: inherit;
        }
        .search-input-field::placeholder {
          color: #9ca3af;
        }
        .search-glass-icon {
          color: #facc15;
          flex-shrink: 0;
        }
        .sidebar-content-scroll {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding-right: 2px;
        }
        .history-time-section {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .time-heading {
          font-size: 0.78rem;
          font-weight: 800;
          color: #facc15;
          margin-bottom: 6px;
          padding-left: 2px;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .history-pill {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #15161c;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 9px 12px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .history-pill:hover {
          background: #1e1f28;
          border-color: rgba(250, 204, 21, 0.5);
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
        }
        .pill-title {
          font-size: 0.8rem;
          color: #e5e7eb;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 170px;
        }
        .history-pill:hover .pill-title {
          color: #ffffff;
        }
        .pill-actions-wrapper {
          display: flex;
          align-items: center;
        }
        .pill-delete-btn {
          background: transparent;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          border-radius: 4px;
          transition: color 0.15s;
        }
        .pill-delete-btn:hover {
          color: #ef4444;
        }
        .empty-history-container {
          padding: 36px 14px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        .empty-clock-icon {
          color: #facc15;
          margin-bottom: 4px;
        }
        .empty-main-text {
          font-size: 0.85rem;
          font-weight: 700;
          color: #ffffff;
        }
        .empty-sub-text {
          font-size: 0.75rem;
          color: #d1d5db;
          line-height: 1.4;
        }

        @media (max-width: 900px) {
          .exact-sidebar {
            position: fixed;
            left: 0;
            top: 0;
            bottom: 0;
            width: 280px;
            max-width: 85vw;
            z-index: 1000;
            transform: translateX(-100%);
            transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 12px 0 40px rgba(0, 0, 0, 0.95), 0 0 20px rgba(250, 204, 21, 0.1);
          }
          .exact-sidebar.open {
            transform: translateX(0);
          }
        }
      `}</style>
    </aside>
  );
}
