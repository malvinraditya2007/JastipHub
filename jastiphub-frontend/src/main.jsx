import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router';
import '@fontsource-variable/plus-jakarta-sans';
import './styles.css';
import { Store } from './store';
import { Layout, Notices, Missing, Gate } from './ui';
import Explore from './Explore';
import { Detail, MyTrips, Jastiper } from './Trips';
import { Account, Review } from './Account';
import { Editor } from './Editor';
import { Auth, ResetPassword } from './Auth';

const PAGE_TITLES = {
  '/': 'Cari Trip',
  '/my-trips': 'My Trips',
  '/login': 'Masuk',
  '/register': 'Daftar',
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
          <Route index element={<Explore />} />
          <Route path="trips/:id" element={<Detail key={location.pathname} />} />
          <Route path="jastiper/:id" element={<Jastiper key={location.pathname} />} />
          <Route
            path="my-trips"
            element={
              <Gate>
                <MyTrips />
              </Gate>
            }
          />
          <Route
            path="trips/baru"
            element={
              <Gate>
                <Editor key="new" />
              </Gate>
            }
          />
          <Route
            path="trips/:id/edit"
            element={
              <Gate>
                <Editor key={location.pathname} />
              </Gate>
            }
          />
          <Route
            path="profile"
            element={
              <Gate>
                <Account />
              </Gate>
            }
          />
          <Route
            path="ulasan/:id"
            element={
              <Gate>
                <Review />
              </Gate>
            }
          />
          <Route path="*" element={<Missing />} />
        </Route>
        <Route path="login" element={<Auth key="login" />} />
        <Route path="register" element={<Auth key="register" register />} />
        <Route path="reset-password" element={<ResetPassword />} />
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
