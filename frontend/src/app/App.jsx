import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Toaster } from './components/ui/sonner';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SearchPage from './pages/SearchPage';
import ListingDetailsPage from './pages/ListingDetailsPage';
import DashboardPage from './pages/DashboardPage';
import CreateListingPage from './pages/CreateListingPage';
import PostRoomSharePage from './pages/PostRoomSharePage';
import WishlistPage from './pages/WishlistPage';
import SavedSearchesPage from './pages/SavedSearchesPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/listing/:id" element={<ListingDetailsPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/create-listing" element={<CreateListingPage />} />
            <Route path="/post-room-share" element={<PostRoomSharePage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/saved-searches" element={<SavedSearchesPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster />
        </div>
      </AppProvider>
    </BrowserRouter>
  );
}
