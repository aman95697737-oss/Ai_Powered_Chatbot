// API Service for UniAssist AI frontend
const BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

/**
 * Send student question to the backend chat API.
 * The backend automatically handles AI API calls and cascades to the
 * predefined dataset fallback if the AI API is unavailable.
 * If authenticated, saves message to MongoDB.
 */
export async function sendChatMessage(question) {
  try {
    const response = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question: question.trim() }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.detail || `Server responded with status ${response.status}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error in sendChatMessage:', error);
    return {
      success: false,
      answer: "Unable to connect to the assistant right now. Please check if the backend server is running and try again.",
      source: "system",
      category: null,
      confidence: 0,
      suggested_questions: [
        "What is the minimum attendance requirement?",
        "How can I apply for a scholarship?"
      ],
      isNetworkError: true
    };
  }
}

/**
 * Fetch authenticated student's chat history from MongoDB
 */
export async function fetchChatHistory() {
  try {
    const response = await fetch(`${BASE_URL}/api/chat/history`, {
      method: 'GET',
      credentials: 'include'
    });
    if (!response.ok) return { success: false, history: [] };
    return await response.json();
  } catch (error) {
    console.error('Error fetching chat history from MongoDB:', error);
    return { success: false, history: [] };
  }
}

/**
 * Clear student's chat history in MongoDB
 */
export async function clearChatHistory() {
  try {
    const response = await fetch(`${BASE_URL}/api/chat/history`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error clearing chat history:', error);
    return { success: false };
  }
}

/**
 * Delete a specific chat item in MongoDB
 */
export async function deleteChatHistoryItem(id) {
  try {
    const response = await fetch(`${BASE_URL}/api/chat/history/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error deleting chat item:', error);
    return { success: false };
  }
}

/**
 * Fetch all FAQs or FAQs filtered by category
 */
export async function fetchFaqs(category = null) {
  try {
    const url = category 
      ? `${BASE_URL}/api/faqs?category=${encodeURIComponent(category)}`
      : `${BASE_URL}/api/faqs`;
    
    const response = await fetch(url, { credentials: 'include' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    return { total: 0, faqs: [] };
  }
}

/**
 * Fetch all available categories
 */
export async function fetchCategories() {
  try {
    const response = await fetch(`${BASE_URL}/api/categories`, { credentials: 'include' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return data.categories || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

/**
 * Fetch backend health and AI status
 */
export async function fetchHealth() {
  try {
    const response = await fetch(`${BASE_URL}/api/health`, { credentials: 'include' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    return { status: "offline", dataset_entries: 0, ai_status: "offline", simulate_ai_failure: false };
  }
}

/**
 * Fetch demo status for presentation
 */
export async function fetchDemoMode() {
  try {
    const response = await fetch(`${BASE_URL}/api/demo/mode`, { credentials: 'include' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    return { success: false, simulate_ai_failure: false };
  }
}

/**
 * Toggle simulated failure for presentation demo
 */
export async function toggleDemoFailure(simulateFailure) {
  try {
    const response = await fetch(`${BASE_URL}/api/demo/toggle`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ simulate_failure: simulateFailure })
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error toggling demo failure mode:', error);
    return { success: false, simulate_ai_failure: simulateFailure };
  }
}
