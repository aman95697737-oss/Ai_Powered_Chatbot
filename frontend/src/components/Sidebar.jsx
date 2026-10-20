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
          width: 240px;
          min-width: 240px;
          height: 100vh;
          background: #101114;
          border-right: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          flex-direction: column;
          padding: 16px 14px 18px;
          position: relative;
          z-index: 10;
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
          color: #8b8d99;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: all 0.15s;
        }
        .icon-btn:hover {
          color: #e2ee2a;
          background: rgba(255, 255, 255, 0.06);
        }
        .close-btn {
          color: #555763;
        }
        .close-btn:hover {
          color: #ffffff;
        }
        .sidebar-search-capsule {
          display: flex;
          align-items: center;
          background: #18191e;
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 20px;
          padding: 6px 14px;
          margin-bottom: 14px;
        }
        .sidebar-search-capsule:focus-within {
          border-color: rgba(226, 238, 42, 0.35);
        }
        .search-input-field {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: #ffffff;
          font-size: 0.775rem;
          font-family: inherit;
        }
        .search-input-field::placeholder {
          color: #555763;
        }
        .search-glass-icon {
          color: #555763;
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
          font-size: 0.75rem;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 4px;
          padding-left: 2px;
          letter-spacing: 0.02em;
        }
        .history-pill {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #18191e;
          border: 1px solid rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          padding: 8px 10px 8px 12px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .history-pill:hover {
          background: #20222a;
          border-color: rgba(226, 238, 42, 0.3);
        }
        .pill-title {
          font-size: 0.75rem;
          color: #a5a7b2;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 160px;
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
          color: #555763;
          cursor: pointer;
          padding: 3px;
          display: flex;
          align-items: center;
          border-radius: 4px;
          transition: color 0.15s;
        }
        .pill-delete-btn:hover {
          color: #f87171;
        }
        .empty-history-container {
          padding: 32px 12px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }
        .empty-clock-icon {
          color: #3b3d4a;
          margin-bottom: 2px;
        }
        .empty-main-text {
          font-size: 0.75rem;
          font-weight: 600;
          color: #6b6d7c;
        }
        .empty-sub-text {
          font-size: 0.675rem;
          color: #4b4c57;
          line-height: 1.35;
        }

        @media (max-width: 900px) {
          .exact-sidebar {
            position: fixed;
            left: 0;
            top: 0;
            bottom: 0;
            z-index: 999;
            transform: translateX(-100%);
            transition: transform 0.3s ease;
            box-shadow: 10px 0 30px rgba(0, 0, 0, 0.9);
          }
          .exact-sidebar.open {
            transform: translateX(0);
          }
        }
      `}</style>
    </aside>
  );
}
