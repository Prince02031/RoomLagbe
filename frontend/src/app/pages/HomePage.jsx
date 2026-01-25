import { useNavigate } from 'react-router-dom';
import { Search, Home, Users, TrendingUp } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import Navbar from '../components/Navbar';
import ListingCard from '../components/ListingCard';
import { mockApartments, mockRoomShareListings } from '../lib/mockData';
import { useApp } from '../context/AppContext';

export default function HomePage() {
  const navigate = useNavigate();
  const { currentUser } = useApp();

  const featuredApartments = mockApartments.slice(0, 3);
  const featuredRoomShares = mockRoomShareListings.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4">Find Your Perfect Room</h1>
            <p className="text-xl mb-8 text-blue-100">
              Comprehensive room rental platform with advanced search, fair rent scoring, and
              verified listings
            </p>
            <div className="flex justify-center space-x-4">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100" onClick={() => navigate('/search')}>
                <Search className="mr-2 h-5 w-5" />
                Search Listings
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
                onClick={() => navigate('/create-listing')}
              >
                {currentUser?.role === 'student' ? 'Post a Room' : currentUser?.role === 'owner' ? 'Post an Apartment' : 'Post a Listing'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-semibold text-center mb-12">Why Choose RoomLagbe?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Fair Rent Score</h3>
              <p className="text-gray-600">
                Advanced algorithm calculates fair rent based on location, amenities, and market
                trends
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Home className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Verified Listings</h3>
              <p className="text-gray-600">
                All listings are verified by our team to ensure quality and authenticity
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Room Sharing</h3>
              <p className="text-gray-600">
                Students can post vacant rooms to find roommates and share costs
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Featured Apartments */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-semibold">Featured Apartments</h2>
          <Button variant="outline" onClick={() => navigate('/search?type=apartment')}>
            View All
          </Button>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {featuredApartments.map((apartment) => (
            <ListingCard key={apartment.id} listing={apartment} type="apartment" />
          ))}
        </div>
      </div>

      {/* Featured Room Shares */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-semibold">Room Share Listings</h2>
          <Button variant="outline" onClick={() => navigate('/search?type=room-share')}>
            View All
          </Button>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {featuredRoomShares.map((listing) => (
            <ListingCard key={listing.id} listing={listing} type="room-share" />
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-400">
              © 2026 RoomLagbe. All rights reserved. | Comprehensive Room Rental Platform
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Built with React, TypeScript, Tailwind CSS, and PostgreSQL
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
