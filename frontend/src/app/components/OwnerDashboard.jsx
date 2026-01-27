import { useNavigate } from 'react-router-dom';
import { Home, Plus, Users, Eye, Check, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useApp } from '../context/AppContext';
import { useState, useEffect } from 'react';
import listingService from '../services/listing.service';
import bookingService from '../services/booking.service';
import { formatCurrency, formatDate } from '../lib/utils';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const { currentUser, wishlist } = useApp();
  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(true);

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

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await bookingService.getOwnerBookings();
        setBookings(data);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setBookingsLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const handleUpdateBookingStatus = async (bookingId, status) => {
    try {
      await bookingService.updateStatus(bookingId, status);
      toast.success(`Booking ${status} successfully`);
      // Refresh bookings
      const data = await bookingService.getOwnerBookings();
      setBookings(data);
    } catch (error) {
      toast.error(`Failed to ${status} booking`);
    }
  };

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const myListingsWishlisted = wishlist.filter(w => 
    listings.some(l => l.listing_id === w.listing_id)
  );

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
          Create Listing
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
                <p className="text-sm text-gray-600">Pending Requests</p>
                <p className="text-2xl font-semibold mt-1">{pendingBookings.length}</p>
              </div>
              <Eye className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Requests</p>
                <p className="text-2xl font-semibold mt-1">{bookings.length}</p>
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
                <p className="text-2xl font-semibold mt-1">{myListingsWishlisted.length}</p>
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
            <h2 className="text-xl font-semibold">My Listings</h2>
            {listings.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-gray-500">
                  No listings yet. Create your first listing to get started!
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
                          <h3 className="font-semibold text-lg">{item.apartment_title || 'Apartment'}</h3>
                          <p className="text-2xl font-semibold text-gray-900 mt-2">{formatCurrency(item.price_per_person)}/person</p>
                          <p className="text-sm text-gray-500 mt-1">Available from {formatDate(item.created_at)}</p>
                          <div className="flex space-x-2 mt-2">
                            <Badge variant={item.availability_status === 'available' ? 'default' : 'secondary'}>
                              {item.availability_status}
                            </Badge>
                            {item.women_only && <Badge>Women Only</Badge>}
                            <Badge variant="outline">{item.listing_type}</Badge>
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
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Visit Requests</h2>
            {bookingsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            ) : bookings.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-gray-500">
                  No visit requests at the moment
                </CardContent>
              </Card>
            ) : (
              bookings.map((booking) => (
                <Card key={booking.booking_id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{booking.listing_title || 'Listing'}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Requested by: {booking.student_name || 'Student'}
                        </p>
                        <p className="text-sm text-gray-600">
                          Visit Date: {formatDate(booking.visit_date)} at {booking.visit_time}
                        </p>
                        {booking.message && (
                          <p className="text-sm text-gray-600 mt-2">Message: {booking.message}</p>
                        )}
                        <div className="mt-2">
                          <Badge 
                            variant={
                              booking.status === 'approved' ? 'default' : 
                              booking.status === 'rejected' ? 'destructive' : 
                              'secondary'
                            }
                          >
                            {booking.status}
                          </Badge>
                        </div>
                      </div>
                      {booking.status === 'pending' && (
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleUpdateBookingStatus(booking.booking_id, 'approved')}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleUpdateBookingStatus(booking.booking_id, 'rejected')}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}