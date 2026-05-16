import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AppLayout from './layouts/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import LiveAuctionPage from './pages/LiveAuctionPage';
import LivePage from './pages/LivePage';
import GroupsPage from './pages/GroupsPage';
import CaptainsPage from './pages/CaptainsPage';
import PlayersPage from './pages/PlayersPage';
import TeamsPage from './pages/TeamsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import CaptainLivePage from './pages/CaptainLivePage';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
          },
        }}
      />
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/live" element={<LivePage />} />

        {/* Protected */}
        <Route path="/" element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="live-auction" element={
            <ProtectedRoute roles={['admin', 'operator']}>
              <LiveAuctionPage />
            </ProtectedRoute>
          } />
          <Route path="captain-live" element={
            <ProtectedRoute roles={['captain']}>
              <CaptainLivePage />
            </ProtectedRoute>
          } />
          <Route path="groups" element={
            <ProtectedRoute roles={['admin']}>
              <GroupsPage />
            </ProtectedRoute>
          } />
          <Route path="captains" element={
            <ProtectedRoute roles={['admin']}>
              <CaptainsPage />
            </ProtectedRoute>
          } />
          <Route path="players" element={
            <ProtectedRoute roles={['admin']}>
              <PlayersPage />
            </ProtectedRoute>
          } />
          <Route path="teams" element={<TeamsPage />} />
          <Route path="analytics" element={
            <ProtectedRoute roles={['admin']}>
              <AnalyticsPage />
            </ProtectedRoute>
          } />
          <Route path="settings" element={
            <ProtectedRoute roles={['admin']}>
              <SettingsPage />
            </ProtectedRoute>
          } />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
