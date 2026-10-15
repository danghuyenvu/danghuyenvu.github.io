import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';

const WriteupPage = lazy(() => import('./pages/WriteupPage'));

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route
            path="writeups/:slug"
            element={
              <Suspense
                fallback={
                  <p className="font-mono text-sm text-[var(--color-ink-soft)]">loading…</p>
                }
              >
                <WriteupPage />
              </Suspense>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
