import { useCallback, useEffect, useRef, useState } from 'react';
import API_BASE from './api_endpoint';
import {
  isOfflineMode,
  offlineStartSession,
  offlineGetSessionState,
  offlineDecrementTry,
  offlineCompleteSession,
  offlineClaimReward,
} from './offlineMode';

// Simple hook to manage per-user per-minigame session via backend API
// Uses localStorage token for now (user requirement)
// In offline mode (guest / demo play) it talks to the local engine in offlineMode.js instead.
export default function useMinigameSession(minigameId, { pollInterval = 1000 } = {}) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const pollRef = useRef(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
  };

  const startSession = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      if (isOfflineMode()) {
        setSession(offlineStartSession(minigameId));
        return;
      }
  const res = await fetch(`${API_BASE}/minigame/session/start`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ minigameId })
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setSession(data.session);
    } catch (e) {
      setError(e.message || 'Failed to start session');
    } finally {
      setLoading(false);
    }
  }, [minigameId]);

  const fetchState = useCallback(async () => {
    try {
      if (isOfflineMode()) {
        const s = offlineGetSessionState(minigameId);
        if (s) setSession(s);
        return;
      }
  const res = await fetch(`${API_BASE}/minigame/session/state?minigameId=${encodeURIComponent(minigameId)}`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setSession(data.session);
    } catch (e) {
      setError(e.message || 'Failed to fetch session state');
    }
  }, [minigameId]);

  const completeSession = useCallback(async () => {
    try {
      if (isOfflineMode()) {
        const data = offlineCompleteSession(minigameId);
        await fetchState();
        return data;
      }
  const res = await fetch(`${API_BASE}/minigame/session/complete`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ minigameId })
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      // refresh state
      await fetchState();
      return data;
    } catch (e) {
      setError(e.message || 'Failed to complete session');
      return null;
    }
  }, [minigameId, fetchState]);

  const decrementTry = useCallback(async () => {
    try {
      if (isOfflineMode()) {
        offlineDecrementTry(minigameId);
        await fetchState();
        return;
      }
  const res = await fetch(`${API_BASE}/minigame/session/decrement`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ minigameId })
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchState();
    } catch (e) {
      setError(e.message || 'Failed to decrement try');
    }
  }, [minigameId, fetchState]);

  const claimReward = useCallback(async () => {
    try {
      if (isOfflineMode()) {
        return offlineClaimReward(minigameId);
      }
  const res = await fetch(`${API_BASE}/minigame/session/claim-reward`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ minigameId })
      });
      if (!res.ok) throw new Error(await res.text());
      return await res.json().catch(() => ({}));
    } catch (e) {
      setError(e.message || 'Failed to claim reward');
      return null;
    }
  }, [minigameId]);

  // initial start
  useEffect(() => {
    if (!minigameId) return;
    startSession();
  }, [minigameId, startSession]);

  // polling
  useEffect(() => {
    if (!minigameId) return;
    pollRef.current = setInterval(() => {
      fetchState();
    }, pollInterval);
    return () => clearInterval(pollRef.current);
  }, [minigameId, fetchState, pollInterval]);

  const remainingSeconds = session?.remainingSeconds ?? null;
  const triesLeft = session?.triesLeft ?? null;

  return {
    session,
    loading,
    error,
    remainingSeconds,
    triesLeft,
    api: {
      startSession,
      fetchState,
      completeSession,
      decrementTry,
      claimReward,
    }
  };
}
