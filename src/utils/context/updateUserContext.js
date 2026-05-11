// src/utils/context/updateUserContext.js
export async function updateUserContext(setUser) {
  try {
    const sessionRes = await fetch('/api/auth/session', { credentials: 'include' });
    if (sessionRes.ok) {
      const sessionData = await sessionRes.json();
      setUser(sessionData.user || null);
    }
  } catch {}
}

