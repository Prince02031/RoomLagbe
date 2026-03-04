import { useNavigate } from 'react-router-dom';
import { Home, Plus, Users, Heart, Check, X, Clock, CheckCircle, Eye, Trash2, CheckSquare } from 'lucide-react';
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
  const [deletingListingId, setDeletingListingId] = useState(null);
  const [cancellingBookingId, setCancellingBookingId] = useState(null);
  const [closingListingId, setClosingListingId] = useState(null);

  const handleDeleteListing = async (listingId) => {
    if (!window.confirm('Remove this listing? It will be marked as deleted and hidden from search.')) return;
    setDeletingListingId(listingId);
    try {
      await listingService.deleteListing(listingId);
      setListings(prev => prev.filter(l => l.listing_id !== listingId));
      toast.success('Listing removed');
    } catch (error) {
      toast.error(error.message || 'Failed to remove listing');
    } finally {
      setDeletingListingId(null);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Cancel this visit request?')) return;
    setCancellingBookingId(bookingId);
    try {
      await bookingService.updateStatus(bookingId, 'cancelled');
      setBookings(prev => prev.map(b =>
        b.booking_id === bookingId ? { ...b, status: 'cancelled' } : b
      ));
      toast.success('Visit request cancelled');
    } catch (error) {
      toast.error(error.message || 'Failed to cancel request');
    } finally {
      setCancellingBookingId(null);
    }
  };

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

  const initialTab = 'listings';

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const approvedBookings = bookings.filter(b => b.status === 'approved');
  const rejectedBookings = bookings.filter(b => b.status === 'rejected');

  const closedListings = listings.filter(l => l.availability_status === 'closed');
  const activeListings = listings.filter(l => !['closed'].includes(l.availability_status));

  const handleCloseListing = async (listingId) => {
    if (!window.confirm('Mark this room share as closed? This means you found a roommate. The listing will be hidden from search.')) return;
    setClosingListingId(listingId);
    try {
      await listingService.closeListing(listingId);
      setListings(prev => prev.map(l =>
        l.listing_id === listingId ? { ...l, availability_status: 'closed' } : l
      ));
      toast.success('Room share closed — congratulations on finding a roommate!');
    } catch (error) {
      toast.error(error.message || 'Failed to close listing');
    } finally {
      setClosingListingId(null);
    }
  };

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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">My Listings</p>
                <p className="text-2xl font-semibold mt-1">{activeListings.length}</p>
              </div>
              <Home className="h-10 w-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Closed / Rented</p>
                <p className="text-2xl font-semibold mt-1 text-green-600">{closedListings.length}</p>
              </div>
              <CheckSquare className="h-10 w-10 text-green-500" />
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
              <Users className="h-10 w-10 text-gray-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-semibold mt-1 text-yellow-600">{pendingBookings.length}</p>
              </div>
              <Clock className="h-10 w-10 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-semibold mt-1 text-green-600">{approvedBookings.length}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-500" />
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
      <Tabs defaultValue={initialTab}>
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
                          <Badge variant={item.availability_status === 'available' ? 'default' : item.availability_status === 'closed' ? 'outline' : 'secondary'}
                            className={item.availability_status === 'closed' ? 'text-green-700 border-green-300 bg-green-50' : ''}>
                            {item.availability_status === 'closed' ? '✓ Closed' : item.availability_status}
                            </Badge>
                            {item.women_only && <Badge>Women Only</Badge>}
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Eye className="h-4 w-4" /> {item.view_count ?? 0} views
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="h-4 w-4" /> {item.wishlist_count ?? 0} wishlisted
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button onClick={() => navigate(`/listing/${item.listing_id}`)}
                          size="sm">
                          View Details
                        </Button>
                        {item.availability_status !== 'closed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-700 border-green-300 hover:bg-green-50"
                            disabled={closingListingId === item.listing_id}
                            onClick={() => handleCloseListing(item.listing_id)}
                          >
                            {closingListingId === item.listing_id
                              ? <Loader2 className="h-4 w-4 animate-spin" />
                              : <><CheckSquare className="h-4 w-4 mr-1" /> Mark Closed</>}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          disabled={deletingListingId === item.listing_id}
                          onClick={() => handleDeleteListing(item.listing_id)}
                        >
                          {deletingListingId === item.listing_id
                            ? <Loader2 className="h-4 w-4 animate-spin" />
                            : <><Trash2 className="h-4 w-4 mr-1" /> Remove</>}
                        </Button>
                      </div>
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
                              booking.status === 'rejected' || booking.status === 'cancelled' ? 'destructive' : 
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
                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          onClick={() => navigate(`/listing/${booking.listing_id}`)}
                          variant="outline"
                          size="sm"
                        >
                          View Listing
                        </Button>
                        {booking.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            disabled={cancellingBookingId === booking.booking_id}
                            onClick={() => handleCancelBooking(booking.booking_id)}
                          >
                            {cancellingBookingId === booking.booking_id
                              ? <Loader2 className="h-4 w-4 animate-spin" />
                              : <><X className="h-4 w-4 mr-1" /> Cancel</>}
                          </Button>
                        )}
                      </div>
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
