// Authentication API Service for UniAssist AI
const BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

async function postJson(endpoint, body) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      let errorMsg = data?.detail || data?.message;
      if (response.status === 404) {
        errorMsg = "Backend API server not found (404). Please ensure VITE_API_URL is set in Vercel settings.";
      } else if (!errorMsg) {
        errorMsg = `Request failed with status ${response.status}`;
      }
      throw new Error(errorMsg);
    }

    return data;
  } catch (err) {
    if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
      throw new Error("Unable to reach backend server. Please check your internet connection or backend URL.");
    }
    throw err;
  }
}

export async function registerUser({ name, email, password, confirm_password }) {
  return await postJson('/api/auth/register', {
    name,
    email,
    password,
    confirm_password,
  });
}

export async function verifyRegisterOtp({ email, otp }) {
  return await postJson('/api/auth/verify-register-otp', {
    email,
    otp,
  });
}

export async function loginUser({ email, password }) {
  return await postJson('/api/auth/login', {
    email,
    password,
  });
}

export async function verifyLoginOtp({ email, otp }) {
  return await postJson('/api/auth/verify-login-otp', {
    email,
    otp,
  });
}

export async function logoutUser() {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    return await response.json();
  } catch (error) {
    console.error('Logout error:', error);
    return { success: true };
  }
}

export async function getCurrentUser() {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/me`, {
      method: 'GET',
      credentials: 'include',
    });
    if (!response.ok) return { authenticated: false, user: null };
    return await response.json();
  } catch (error) {
    console.error('Error fetching current user:', error);
    return { authenticated: false, user: null };
  }
}

export async function forgotPassword({ email }) {
  return await postJson('/api/auth/forgot-password', { email });
}

export async function verifyForgotPasswordOtp({ email, otp }) {
  return await postJson('/api/auth/verify-forgot-password-otp', { email, otp });
}

export async function resetPassword({ email, otp, new_password, confirm_password }) {
  return await postJson('/api/auth/reset-password', {
    email,
    otp,
    new_password,
    confirm_password,
  });
}

export async function resendOtp({ email, purpose }) {
  return await postJson('/api/auth/resend-otp', { email, purpose });
}
