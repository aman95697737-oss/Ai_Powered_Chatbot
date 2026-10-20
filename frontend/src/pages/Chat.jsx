import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import { 
  sendChatMessage, 
  fetchChatHistory, 
  clearChatHistory as apiClearChatHistory, 
  deleteChatHistoryItem as apiDeleteChatHistoryItem 
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const STORAGE_KEY_HISTORY = 'uniassist_chat_history';

export default function Chat({
  backendInfo,
  demoMode,
  onToggleDemo,
  onNavigateHome
}) {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Always initialize as a fresh new chat on open / reload so the user sees the Golden Orb!
  const [messages, setMessages] = useState([]);

  // Load chat history from localStorage or MongoDB
  const [chatHistory, setChatHistory] = useState(() => {
    try {
      const savedHist = localStorage.getItem(STORAGE_KEY_HISTORY);
      return savedHist ? JSON.parse(savedHist) : [];
    } catch {
      return [];
    }
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Fetch student chat history from MongoDB on mount
  useEffect(() => {
    async function loadMongoHistory() {
      try {
        const res = await fetchChatHistory();
        if (res && res.success && Array.isArray(res.history) && res.history.length > 0) {
          const formatted = res.history.map(item => ({
            id: item.id,
            question: item.question,
            timestamp: item.timestamp || 'Recently',
            category: item.category,
            source: item.source,
            messages: [
              {
                id: `${item.id}-u`,
                sender: 'user',
                text: item.question,
                timestamp: item.timestamp || 'Recently',
                source: 'user'
              },
              {
                id: `${item.id}-b`,
                sender: 'bot',
                text: item.answer,
                timestamp: item.timestamp || 'Recently',
                source: item.source || 'ai',
                category: item.category
              }
            ]
          }));
          setChatHistory(formatted);
          localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(formatted));
        }
      } catch (err) {
        console.warn('Could not load chat history from MongoDB:', err);
      }
    }
    loadMongoHistory();
  }, [user]);

  // Sync history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(chatHistory));
    } catch (e) {
      console.warn('Could not save chat history to localStorage', e);
    }
  }, [chatHistory]);

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Create user message
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query,
      timestamp: timeNow,
      source: 'user'
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // 2. Call backend chat API (passes credentials for MongoDB logging)
    const response = await sendChatMessage(query);

    // 3. Format bot message
    const botMsg = {
      id: Date.now() + 1,
      sender: 'bot',
      text: response.answer,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: response.source || 'ai',
      category: response.category,
      confidence: response.confidence,
      suggested_questions: response.suggested_questions || []
    };

    const currentExchange = [userMsg, botMsg];

    setMessages(prev => [...prev, botMsg]);
    setIsLoading(false);

    // 4. Save to history list so it appears in the sidebar under "Today"
    setChatHistory(prev => {
      const filtered = prev.filter(h => h.question.toLowerCase() !== query.toLowerCase());
      const newEntry = {
        id: Date.now(),
        question: query,
        messages: currentExchange,
        timestamp: timeNow,
        category: response.category,
        source: response.source
      };
      return [newEntry, ...filtered.slice(0, 29)];
    });
  };

  // Open fresh new chat
  const handleNewChat = () => {
    setMessages([]);
    setInput('');
  };

  // Clear entire history
  const handleClearChat = async () => {
    setMessages([]);
    setChatHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY_HISTORY);
      localStorage.removeItem('uniassist_current_chat');
      await apiClearChatHistory();
    } catch (e) {
      console.warn('Clear chat error:', e);
    }
  };

  // Delete a single history item
  const handleDeleteHistoryItem = async (id) => {
    setChatHistory(prev => prev.filter(item => item.id !== id));
    try {
      await apiDeleteChatHistoryItem(id);
    } catch (e) {
      console.warn('Delete chat item error:', e);
    }
  };

  // Select history item to view previous conversation
  const handleSelectHistory = (item) => {
    if (item.messages && item.messages.length > 0) {
      setMessages(item.messages);
    } else if (item.question) {
      handleSendMessage(item.question);
    }
  };

  const handleReturnHome = () => {
    if (onNavigateHome) {
      onNavigateHome();
    } else {
      navigate('/');
    }
  };

  return (
    <div className="chat-page-container">
      {/* Mobile Backdrop overlay */}
      {mobileSidebarOpen && (
        <div 
          className="mobile-backdrop" 
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <Sidebar 
        chatHistory={chatHistory}
        onSelectHistory={handleSelectHistory}
        onNewChat={handleNewChat}
        onClearChat={handleClearChat}
        onDeleteItem={handleDeleteHistoryItem}
        backendInfo={backendInfo}
        demoMode={demoMode}
        onToggleDemo={onToggleDemo}
        isOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Chat Window */}
      <ChatWindow 
        messages={messages}
        isLoading={isLoading}
        input={input}
        setInput={setInput}
        onSendMessage={handleSendMessage}
        onClearChat={handleNewChat}
        onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
        demoMode={demoMode}
        onToggleDemo={onToggleDemo}
        onNavigateHome={handleReturnHome}
      />

      <style>{`
        .chat-page-container {
          display: flex;
          width: 100vw;
          height: 100vh;
          margin: 0;
          padding: 0;
          position: relative;
          overflow: hidden;
          background: #08090b;
        }
        .mobile-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          z-index: 90;
        }
        @media (max-width: 640px) {
          .chat-page-container {
            width: 100%;
            height: 100vh;
          }
        }
      `}</style>
    </div>
  );
}
