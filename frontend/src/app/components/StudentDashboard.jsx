import { useNavigate } from 'react-router-dom';
import { Home, Plus, Users, Heart, Check, X } from 'lucide-react';
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

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { currentUser, wishlist, savedSearches } = useApp();
  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [receivedBookings, setReceivedBookings] = useState([]);
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
        // Fetch bookings sent by this student
        const myRequests = await bookingService.getMyBookings();
        setBookings(myRequests);
        
        // Fetch bookings received for this student's listings
        const received = await bookingService.getOwnerBookings();
        setReceivedBookings(received);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setBookingsLoading(false);
      }
    };
    fetchBookings();
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
                <p className="text-sm text-gray-600">My Bookings</p>
                <p className="text-2xl font-semibold mt-1">{bookings.length}</p>
              </div>
              <Users className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Wishlist</p>
                <p className="text-2xl font-semibold mt-1">{wishlist.length}</p>
              </div>
              <Heart className="h-10 w-10 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Saved Searches</p>
                <p className="text-2xl font-semibold mt-1">{savedSearches.length}</p>
              </div>
              <Plus className="h-10 w-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My Listings */}
      <Tabs defaultValue="listings">
        <TabsList>
          <TabsTrigger value="listings">My Listings</TabsTrigger>
          <TabsTrigger value="sent-requests">My Visit Requests</TabsTrigger>
          <TabsTrigger value="received-requests">Received Requests ({receivedBookings.length})</TabsTrigger>
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

        <TabsContent value="sent-requests" className="mt-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">My Visit Requests</h2>
            {bookingsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            ) : bookings.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-gray-500">
                  No visit requests yet. Start exploring listings!
                </CardContent>
              </Card>
            ) : (
              bookings.map((booking) => (
                <Card key={booking.booking_id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg">
                              {booking.apartment_title || booking.room_name || 'Listing'}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {booking.location && `${booking.location} • `}
                              {formatCurrency(booking.price_per_person)}/person
                            </p>
                          </div>
                          <Badge 
                            variant={
                              booking.status === 'approved' ? 'default' : 
                              booking.status === 'rejected' ? 'destructive' : 
                              'secondary'
                            }
                            className="ml-4"
                          >
                            {booking.status}
                          </Badge>
                        </div>
                        <div className="mt-3 space-y-1">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Owner:</span> {booking.owner_name || 'N/A'}
                          </p>
                          {booking.owner_phone && (
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Phone:</span> {booking.owner_phone}
                            </p>
                          )}
                          {booking.visit_time && (
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Visit Time:</span> {new Date(booking.visit_time).toLocaleString()}
                            </p>
                          )}
                          <p className="text-sm text-gray-500">
                            Requested on: {formatDate(booking.created_at)}
                          </p>
                        </div>
                      </div>
                      <Button 
                        onClick={() => navigate(`/listing/${booking.listing_id}`)}
                        variant="outline"
                        className="ml-4"
                      >
                        View Listing
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="received-requests" className="mt-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Received Visit Requests</h2>
            <p className="text-sm text-gray-600">Visit requests for your room listings</p>
            {bookingsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            ) : receivedBookings.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-gray-500">
                  No visit requests yet for your listings
                </CardContent>
              </Card>
            ) : (
              receivedBookings.map((booking) => (
                <Card key={booking.booking_id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-lg">
                              {booking.apartment_title || booking.room_name || 'Listing'}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {formatCurrency(booking.price_per_person)}/person
                            </p>
                          </div>
                          <Badge 
                            variant={
                              booking.status === 'approved' ? 'default' : 
                              booking.status === 'rejected' ? 'destructive' : 
                              'secondary'
                            }
                            className="ml-4"
                          >
                            {booking.status}
                          </Badge>
                        </div>
                        <div className="mt-3 space-y-1">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Student:</span> {booking.student_name || 'Student'}
                          </p>
                          {booking.student_email && (
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Email:</span> {booking.student_email}
                            </p>
                          )}
                          {booking.student_phone && (
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Phone:</span> {booking.student_phone}
                            </p>
                          )}
                          {booking.visit_time && (
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Visit Time:</span> {new Date(booking.visit_time).toLocaleString()}
                            </p>
                          )}
                          <p className="text-sm text-gray-500">
                            Requested on: {formatDate(booking.created_at)}
                          </p>
                        </div>
                      </div>
                      {booking.status === 'pending' ? (
                        <div className="flex space-x-2 ml-4">
                          <Button 
                            size="sm" 
                            onClick={async () => {
                              try {
                                await bookingService.updateStatus(booking.booking_id, 'approved');
                                toast.success('Booking approved successfully');
                                const received = await bookingService.getOwnerBookings();
                                setReceivedBookings(received);
                              } catch (error) {
                                console.error('Error approving booking:', error);
                                const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to approve booking';
                                toast.error(errorMessage);
                              }
                            }}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={async () => {
                              try {
                                await bookingService.updateStatus(booking.booking_id, 'rejected');
                                toast.success('Booking rejected successfully');
                                const received = await bookingService.getOwnerBookings();
                                setReceivedBookings(received);
                              } catch (error) {
                                console.error('Error rejecting booking:', error);
                                const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to reject booking';
                                toast.error(errorMessage);
                              }
                            }}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      ) : null}
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
