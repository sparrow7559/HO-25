import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MinigameLoader from '../components/MinigameLoader';
import { startOfflineSession } from '../lib/offlineMode';
import { MINIGAME_IDS } from '../lib/minigameIds';

// Lets a minigame be opened straight from its URL (e.g. /m1), skipping the
// story-gated /play flow and its login requirement. If nobody's logged in,
// a guest session is started silently so the game still has a session to score.
export default function MinigameDirect() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const id = (gameId || '').toUpperCase();
  const valid = MINIGAME_IDS.includes(id);

  useEffect(() => {
    if (!localStorage.getItem('token')) startOfflineSession({ demo: false });
  }, []);

  if (!valid) {
    navigate('/', { replace: true });
    return null;
  }

  return (
    <MinigameLoader
      id={id}
      config={null}
      onComplete={() => navigate('/', { replace: true })}
    />
  );
}
