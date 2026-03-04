import { useNavigate } from 'react-router-dom';
import { Home, Plus, Users, Eye, Check, X, Heart, CheckCircle, BarChart2, TrendingUp, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
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
  const [selectedListingId, setSelectedListingId] = useState(null);

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
      console.log('Updating booking:', bookingId, 'to status:', status);
      await bookingService.updateStatus(bookingId, status);
      toast.success(`Booking ${status} successfully`);
      // Refresh bookings
      const data = await bookingService.getOwnerBookings();
      setBookings(data);
    } catch (error) {
      console.error('Error updating booking status:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || `Failed to ${status} booking`;
      toast.error(errorMessage);
    }
  };

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const approvedBookings = bookings.filter(b => b.status === 'approved');
  const approvalRate = bookings.length > 0
    ? Math.round((approvedBookings.length / bookings.length) * 100)
    : 0;

  // Per-listing request breakdown
  const listingRequestStats = listings.map(listing => {
    const listingBookings = bookings.filter(b => b.listing_id === listing.listing_id);
    return {
      ...listing,
      requestCount: listingBookings.length,
      approvedCount: listingBookings.filter(b => b.status === 'approved').length,
      pendingCount: listingBookings.filter(b => b.status === 'pending').length,
    };
  }).sort((a, b) => b.requestCount - a.requestCount);

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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
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
              <Eye className="h-10 w-10 text-yellow-500" />
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
                <p className="text-sm text-gray-600">Approval Rate</p>
                <p className="text-2xl font-semibold mt-1 text-blue-600">{approvalRate}%</p>
              </div>
              <BarChart2 className="h-10 w-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Wishlist Adds</p>
                <p className="text-2xl font-semibold mt-1">{listings.reduce((sum, l) => sum + (l.wishlist_count ?? 0), 0)}</p>
              </div>
              <Heart className="h-10 w-10 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My Listings */}
      <Tabs defaultValue="listings">
        <TabsList>
          <TabsTrigger value="listings">My Listings</TabsTrigger>
          <TabsTrigger value="requests">Visit Requests</TabsTrigger>
          <TabsTrigger value="breakdown">Per-Listing Stats</TabsTrigger>
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
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="breakdown" className="mt-6">
          {listingRequestStats.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                No listings yet.
              </CardContent>
            </Card>
          ) : (() => {
            const selected = listingRequestStats.find(l => l.listing_id === selectedListingId) || listingRequestStats[0];
            const rejectedCount = bookings.filter(b => b.listing_id === selected.listing_id && b.status === 'rejected').length;
            const conversionRate = (selected.view_count ?? 0) > 0
              ? Math.round((selected.requestCount / (selected.view_count ?? 1)) * 100)
              : 0;
            const listingApprovalRate = selected.requestCount > 0
              ? Math.round((selected.approvedCount / selected.requestCount) * 100)
              : 0;

            return (
              <div className="space-y-6">
                {/* Dropdown */}
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Select listing:</label>
                  <Select
                    value={selectedListingId || listingRequestStats[0]?.listing_id}
                    onValueChange={setSelectedListingId}
                  >
                    <SelectTrigger className="w-full max-w-md">
                      <SelectValue placeholder="Choose a listing" />
                    </SelectTrigger>
                    <SelectContent>
                      {listingRequestStats.map(l => (
                        <SelectItem key={l.listing_id} value={l.listing_id}>
                          {l.apartment_title || 'Listing'}
                          {l.requestCount > 0 && (
                            <span className="ml-2 text-gray-400 text-xs">· {l.requestCount} requests</span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Listing header */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Home className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{selected.apartment_title || 'Listing'}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{selected.listing_type}</Badge>
                      <Badge variant={selected.availability_status === 'available' ? 'default' : 'secondary'}>
                        {selected.availability_status}
                      </Badge>
                      <span className="text-sm text-gray-500">{formatCurrency(selected.price_per_person)}/person</span>
                    </div>
                  </div>
                </div>

                {/* Metric cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="rounded-2xl bg-blue-50 border border-blue-100 p-5">
                    <div className="flex items-center gap-2 mb-1">
                      <Eye className="h-4 w-4 text-blue-500" />
                      <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Views</p>
                    </div>
                    <p className="text-4xl font-bold text-blue-700">{selected.view_count ?? 0}</p>
                    <p className="text-xs text-blue-400 mt-1">Total profile views</p>
                  </div>

                  <div className="rounded-2xl bg-red-50 border border-red-100 p-5">
                    <div className="flex items-center gap-2 mb-1">
                      <Heart className="h-4 w-4 text-red-500" />
                      <p className="text-xs font-medium text-red-600 uppercase tracking-wide">Wishlisted</p>
                    </div>
                    <p className="text-4xl font-bold text-red-600">{selected.wishlist_count ?? 0}</p>
                    <p className="text-xs text-red-400 mt-1">Students saved this</p>
                  </div>

                  <div className="rounded-2xl bg-purple-50 border border-purple-100 p-5">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="h-4 w-4 text-purple-500" />
                      <p className="text-xs font-medium text-purple-600 uppercase tracking-wide">Total Requests</p>
                    </div>
                    <p className="text-4xl font-bold text-purple-700">{selected.requestCount}</p>
                    <p className="text-xs text-purple-400 mt-1">Visit requests sent</p>
                  </div>

                  <div className="rounded-2xl bg-green-50 border border-green-100 p-5">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <p className="text-xs font-medium text-green-600 uppercase tracking-wide">Approved</p>
                    </div>
                    <p className="text-4xl font-bold text-green-700">{selected.approvedCount}</p>
                    <p className="text-xs text-green-400 mt-1">Visits confirmed</p>
                  </div>

                  <div className="rounded-2xl bg-yellow-50 border border-yellow-100 p-5">
                    <div className="flex items-center gap-2 mb-1">
                      <BarChart2 className="h-4 w-4 text-yellow-500" />
                      <p className="text-xs font-medium text-yellow-600 uppercase tracking-wide">Pending</p>
                    </div>
                    <p className="text-4xl font-bold text-yellow-600">{selected.pendingCount}</p>
                    <p className="text-xs text-yellow-400 mt-1">Awaiting response</p>
                  </div>

                  <div className="rounded-2xl bg-gray-50 border border-gray-200 p-5">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="h-4 w-4 text-gray-500" />
                      <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">View → Request</p>
                    </div>
                    <p className="text-4xl font-bold text-gray-700">{conversionRate}%</p>
                    <p className="text-xs text-gray-400 mt-1">Conversion rate</p>
                  </div>
                </div>

                {/* Request breakdown bar */}
                {selected.requestCount > 0 && (
                  <Card>
                    <CardContent className="p-5">
                      <div className="flex justify-between items-center mb-3">
                        <p className="font-semibold text-sm">Request Status Breakdown</p>
                        <p className="text-sm text-gray-500">{listingApprovalRate}% approval rate</p>
                      </div>
                      <div className="flex h-4 rounded-full overflow-hidden gap-0.5">
                        {selected.approvedCount > 0 && (
                          <div
                            className="bg-green-500 transition-all"
                            style={{ width: `${(selected.approvedCount / selected.requestCount) * 100}%` }}
                            title={`Approved: ${selected.approvedCount}`}
                          />
                        )}
                        {selected.pendingCount > 0 && (
                          <div
                            className="bg-yellow-400 transition-all"
                            style={{ width: `${(selected.pendingCount / selected.requestCount) * 100}%` }}
                            title={`Pending: ${selected.pendingCount}`}
                          />
                        )}
                        {rejectedCount > 0 && (
                          <div
                            className="bg-red-400 transition-all"
                            style={{ width: `${(rejectedCount / selected.requestCount) * 100}%` }}
                            title={`Rejected: ${rejectedCount}`}
                          />
                        )}
                      </div>
                      <div className="flex gap-4 mt-3 text-xs text-gray-600">
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" /> Approved ({selected.approvedCount})</span>
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block" /> Pending ({selected.pendingCount})</span>
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" /> Rejected ({rejectedCount})</span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            );
          })()}
        </TabsContent>

      </Tabs>
    </div>
  );
}