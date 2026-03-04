import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Toaster } from './components/ui/sonner';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SearchPage from './pages/SearchPage';
import ListingDetailsPage from './pages/ListingDetailsPage';
import DashboardPage from './pages/DashboardPage';
import CreateListingPage from './pages/CreateListingPage';
import WishlistPage from './pages/WishlistPage';
import SavedSearchesPage from './pages/SavedSearchesPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProfilePage from './pages/ProfilePage';
import ProfileVerificationPage from './pages/ProfileVerificationPage';
import AdminVerificationsPage from './pages/admin/AdminVerificationsPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/listing/:id" element={<ListingDetailsPage />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-listing"
              element={
                <ProtectedRoute>
                  <CreateListingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wishlist"
              element={
                <ProtectedRoute>
                  <WishlistPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/saved-searches"
              element={
                <ProtectedRoute>
                  <SavedSearchesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <AnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/verification"
              element={
                <ProtectedRoute>
                  <ProfileVerificationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/verifications"
              element={
                <ProtectedRoute>
                  <AdminVerificationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <ProtectedRoute>
                  <AdminAnalyticsPage />
                </ProtectedRoute>
              }
            />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          <Toaster />
        </div>
      </AppProvider>
    </BrowserRouter>
  );
}
