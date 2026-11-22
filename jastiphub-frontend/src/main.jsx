import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router';
import '@fontsource-variable/plus-jakarta-sans';
import './styles.css';
import { Layout } from './components/Layout';
import { Gate, Missing, Notices } from './components/UI';
import { AuthPage } from './pages/AuthPage';
import { ExplorePage } from './pages/ExplorePage';
import { JastiperPage } from './pages/JastiperPage';
import { MyTripsPage } from './pages/MyTripsPage';
import { ProfilePage } from './pages/ProfilePage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { ReviewPage } from './pages/ReviewPage';
import { TripDetailPage } from './pages/TripDetailPage';
import { TripEditorPage } from './pages/TripEditorPage';
import { Store } from './services/store';

const PAGE_TITLES = {
  '/': 'Cari Trip',
  '/my-trips': 'My Trips',
  '/login': 'Masuk',
  '/register': 'Daftar',
  '/reset-password': 'Atur Ulang Password',
  '/profile': 'Profil',
  '/trips/baru': 'Buat Trip',
};

function App() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    const pageTitle = PAGE_TITLES[location.pathname] || 'Perjalanan';
    document.title = pageTitle + ' · JastipHub';
  }, [location.pathname]);

  return (
    <>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<ExplorePage />} />
          <Route path="trips/:id" element={<TripDetailPage key={location.pathname} />} />
          <Route path="jastiper/:id" element={<JastiperPage key={location.pathname} />} />
          <Route
            path="my-trips"
            element={
              <Gate>
                <MyTripsPage />
              </Gate>
            }
          />
          <Route
            path="trips/baru"
            element={
              <Gate>
                <TripEditorPage key="new" />
              </Gate>
            }
          />
          <Route
            path="trips/:id/edit"
            element={
              <Gate>
                <TripEditorPage key={location.pathname} />
              </Gate>
            }
          />
          <Route
            path="profile"
            element={
              <Gate>
                <ProfilePage />
              </Gate>
            }
          />
          <Route
            path="ulasan/:id"
            element={
              <Gate>
                <ReviewPage />
              </Gate>
            }
          />
          <Route path="*" element={<Missing />} />
        </Route>
        <Route path="login" element={<AuthPage key="login" />} />
        <Route path="register" element={<AuthPage key="register" register />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
      </Routes>
      <Notices />
    </>
  );
}
createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Store>
      <App />
    </Store>
  </BrowserRouter>,
);
