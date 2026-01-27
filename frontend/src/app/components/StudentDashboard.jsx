import { useNavigate } from 'react-router-dom';
import { Home, Plus, Users, Eye } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useApp } from '../context/AppContext';
import { useState, useEffect } from 'react';
import listingService from '../services/listing.service';
import { formatCurrency, formatDate } from '../lib/utils';
import { Loader2 } from 'lucide-react';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useApp();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyListings = async () => {
      try {
        const data = await listingService.getMine();
        setListings(data);
      } catch (error) {
        console.error('Error fetching my listings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyListings();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-8">
        <Button onClick={() => navigate('/create-listing')}>
          <Plus className="h-4 w-4 mr-2" />
          Post Room Share
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">My Listings</p>
                <p className="text-2xl font-semibold mt-1">{listings.length}</p>
              </div>
              <Home className="h-10 w-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Requests</p>
                <p className="text-2xl font-semibold mt-1">5</p>
              </div>
              <Eye className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Views</p>
                <p className="text-2xl font-semibold mt-1">152</p>
              </div>
              <Users className="h-10 w-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Wishlist Adds</p>
                <p className="text-2xl font-semibold mt-1">23</p>
              </div>
              <Plus className="h-10 w-10 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My Listings */}
      <Tabs defaultValue="listings">
        <TabsList>
          <TabsTrigger value="listings">My Listings</TabsTrigger>
          <TabsTrigger value="requests">Visit Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="listings" className="mt-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">My Room Share Listings</h2>
            {listings.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-gray-500">
                  No room share listings yet. Post a listing to find roommates!
                </CardContent>
              </Card>
            ) : (
              listings.map((item) => (
                <Card key={item.listing_id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex space-x-4">
                        <div className="w-24 h-24 rounded bg-gray-200 flex items-center justify-center">
                          <Home className="text-gray-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{item.apartment_title || 'Shared Room'}</h3>
                          <p className="text-2xl font-semibold text-gray-900 mt-2">{formatCurrency(item.price_per_person)}/person</p>
                          <p className="text-sm text-gray-500 mt-1">Available from {formatDate(item.created_at)}</p>
                          <div className="flex space-x-2 mt-2">
                            <Badge variant={item.availability_status === 'available' ? 'default' : 'secondary'}>
                              {item.availability_status}
                            </Badge>
                            {item.women_only && <Badge>Women Only</Badge>}
                          </div>
                        </div>
                      </div>
                      <Button onClick={() => navigate(`/listing/${item.listing_id}`)}>
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="requests" className="mt-6">
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              <p>No visit requests at the moment</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}