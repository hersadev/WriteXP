import type { ReactElement } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AchievementToasts } from '@/components/AchievementToasts';
import { HeroBar } from '@/components/HeroBar';
import { LevelUpCelebration } from '@/components/LevelUpCelebration';
import { AchievementsScreen } from '@/screens/AchievementsScreen';
import { ChapterMapScreen } from '@/screens/ChapterMapScreen';
import { IntroScreen } from '@/screens/IntroScreen';
import { LevelSelectScreen } from '@/screens/LevelSelectScreen';
import { LoginScreen } from '@/screens/LoginScreen';
import { ReviewScreen } from '@/screens/ReviewScreen';
import { SceneScreen } from '@/screens/SceneScreen';
import { AuthProvider, useAuth } from '@/state/AuthContext';
import { GameProvider, useGame } from '@/state/GameContext';

function Loading() {
  return (
    <div className="auth-shell">
      <span className="muted">Abriendo el archivo…</span>
    </div>
  );
}

/**
 * Puerta de las pantallas de juego: hace falta sesión y, la primera vez, haber
 * pasado por la introducción.
 *
 * El orden importa. Mientras el progreso no está cargado, `progress` es el de
 * una partida vacía, así que decidir con él si toca la introducción mandaría a
 * la intro a todo el que recarga la página.
 */
function RequireAuth({
  children,
  allowBeforeIntro = false,
}: {
  children: ReactElement;
  /** La propia introducción, que evidentemente no puede exigirse a sí misma. */
  allowBeforeIntro?: boolean;
}) {
  const { user, ready } = useAuth();
  const { ready: progressReady, progress } = useGame();

  if (!ready) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;
  if (!progressReady) return <Loading />;
  if (!allowBeforeIntro && !progress.onboardedAt) return <Navigate to="/intro" replace />;

  return (
    <>
      <HeroBar />
      {children}
      <AchievementToasts />
      <LevelUpCelebration />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <GameProvider>
          <Routes>
            <Route path="/login" element={<LoginScreen />} />
            <Route
              path="/intro"
              element={
                <RequireAuth allowBeforeIntro>
                  <IntroScreen />
                </RequireAuth>
              }
            />
            <Route
              path="/review"
              element={
                <RequireAuth>
                  <ReviewScreen />
                </RequireAuth>
              }
            />
            <Route
              path="/levels"
              element={
                <RequireAuth>
                  <LevelSelectScreen />
                </RequireAuth>
              }
            />
            <Route
              path="/level/:levelId"
              element={
                <RequireAuth>
                  <ChapterMapScreen />
                </RequireAuth>
              }
            />
            <Route
              path="/play/:chapterId"
              element={
                <RequireAuth>
                  <SceneScreen />
                </RequireAuth>
              }
            />
            <Route
              path="/achievements"
              element={
                <RequireAuth>
                  <AchievementsScreen />
                </RequireAuth>
              }
            />
            <Route path="*" element={<Navigate to="/levels" replace />} />
          </Routes>
        </GameProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
