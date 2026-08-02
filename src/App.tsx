import type { ReactElement } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AchievementToasts } from '@/components/AchievementToasts';
import { HeroBar } from '@/components/HeroBar';
import { AchievementsScreen } from '@/screens/AchievementsScreen';
import { ChapterMapScreen } from '@/screens/ChapterMapScreen';
import { LevelSelectScreen } from '@/screens/LevelSelectScreen';
import { LoginScreen } from '@/screens/LoginScreen';
import { SceneScreen } from '@/screens/SceneScreen';
import { AuthProvider, useAuth } from '@/state/AuthContext';
import { GameProvider } from '@/state/GameContext';

function RequireAuth({ children }: { children: ReactElement }) {
  const { user, ready } = useAuth();

  if (!ready) {
    return (
      <div className="auth-shell">
        <span className="muted">Abriendo el archivo…</span>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <>
      <HeroBar />
      {children}
      <AchievementToasts />
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
