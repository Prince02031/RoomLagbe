import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { MapPin, Users, Calendar, Phone, Mail, Heart, Navigation, Star, Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../components/ui/carousel';
import listingService from '../services/listing.service';
import locationService from '../services/location.service';
import amenityService from '../services/amenity.service';
import bookingService from '../services/booking.service';
import { formatCurrency, formatDate, calculateCommute, getFairRentColor, getFairRentLabel } from '../lib/utils';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';

export default function ListingDetailsPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToWishlist, removeFromWishlist, isInWishlist, currentUser } = useApp();

  const typeFromQuery = searchParams.get('type');
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [commuteInfo, setCommuteInfo] = useState(null);
  const [universities, setUniversities] = useState([]);

  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('');
  const [amenities, setAmenities] = useState([]);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const fetchListingAndData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await listingService.getById(id);
        setListing(data);

        // Fetch amenities for this listing
        if (data.apartment_id) {
          try {
            const amenitiesData = await amenityService.getByApartment(data.apartment_id);
            setAmenities(amenitiesData);
          } catch (amenityError) {
            console.error('Error fetching amenities:', amenityError);
          }
        }

        // Fetch universities for commute calculator (using mock for now or real if available)
        // For now let's use the mock data as a fallback
        setUniversities([
          { id: '1', name: 'IUT', latitude: 23.9482, longitude: 90.3793 },
          { id: '2', name: 'RUET', latitude: 24.3636, longitude: 88.6284 },
        ]);
      } catch (err) {
        console.error('Error fetching listing details:', err);
        setError('Listing not found');
      } finally {
        setLoading(false);
      }
    };
    fetchListingAndData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 text-center flex flex-col items-center justify-center">
        <Navbar />
        <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
        <p>Loading property details...</p>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-2xl font-semibold">{error || 'Listing not found'}</h2>
          <Button className="mt-4" onClick={() => navigate('/search')}>
            Back to Search
          </Button>
        </div>
      </div>
    );
  }

  // Data mapping with safeguards
  const listingId = listing.listing_id || listing.id;
  const isWishlisted = isInWishlist(listingId);
  const isApartment = (listing.listing_type || typeFromQuery) === 'apartment';

  const price = listing.price_per_person || listing.pricePerPerson;
  const totalRent = listing.price_total || listing.totalRent;
  const locationName = listing.location?.area_name || listing.area_name || listing.location;
  const apartmentType = listing.apartment_type || listing.apartmentType;
  const maxOccupancy = listing.max_occupancy || listing.maxOccupancy;
  const womenOnly = listing.women_only !== undefined ? listing.women_only : listing.womenOnly;
  const fairRentScore = listing.fair_rent_score !== undefined ? listing.fair_rent_score : listing.fairRentScore;
  const ownerName = listing.owner_name || listing.ownerName || 'Property Owner';
  const description = listing.description || listing.apartment_description || '';
  const photos = listing.photos || ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800&auto=format&fit=crop'];
  const availabilityDate = listing.available_from || listing.availabilityDate || listing.availableFrom;

  const handleWishlistToggle = () => {
    // Redirect to login if not authenticated
    if (!currentUser) {
      toast.info('Please login to add items to wishlist');
      navigate('/login');
      return;
    }
    
    if (isWishlisted) {
      removeFromWishlist(listingId);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist(listingId);
      toast.success('Added to wishlist');
    }
  };

  const handleCalculateCommute = () => {
    if (!selectedUniversity) return;

    const university = universities.find((u) => u.id === selectedUniversity);
    // Use coordinates from location object if available
    const lat = listing.location?.latitude || listing.latitude;
    const lng = listing.location?.longitude || listing.longitude;

    if (university && lat && lng) {
      const commute = calculateCommute(lat, lng, university.latitude, university.longitude);
      setCommuteInfo(commute);
      toast.success('Commute calculated');
    } else {
      toast.error('Location coordinates not available for this property');
    }
  };

  const handleBookVisit = async () => {
    if (!visitDate || !visitTime) {
      toast.error('Please select date and time');
      return;
    }

    // Check if user is logged in
    if (!currentUser) {
      toast.error('Please login to send a visit request');
      navigate('/login');
      return;
    }

    setBookingLoading(true);
    try {
      // Combine date and time into a single timestamp and get timezone offset
      const localDateTime = new Date(`${visitDate}T${visitTime}`);
      const timezoneOffset = -localDateTime.getTimezoneOffset(); // in minutes
      const offsetHours = Math.floor(Math.abs(timezoneOffset) / 60);
      const offsetMinutes = Math.abs(timezoneOffset) % 60;
      const offsetSign = timezoneOffset >= 0 ? '+' : '-';
      const timezoneString = `${offsetSign}${String(offsetHours).padStart(2, '0')}:${String(offsetMinutes).padStart(2, '0')}`;
      const visitDateTime = `${visitDate}T${visitTime}${timezoneString}`;
      
      await bookingService.create({
        listing_id: listingId,
        visit_time: visitDateTime,
        start_date: visitDate,
        end_date: visitDate
      });
      
      toast.success('Visit request sent successfully! The owner will review your request.');
      setDialogOpen(false);
      setVisitDate('');
      setVisitTime('');
    } catch (error) {
      console.error('Error creating booking:', error);
      const errorMessage = error?.message || error?.error || error?.toString() || 'Failed to send visit request. Please try again.';
      toast.error(errorMessage);
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          ← Back
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card>
              <CardContent className="p-0 overflow-hidden rounded-lg">
                <Carousel className="w-full">
                  <CarouselContent>
                    {photos.map((photo, index) => (
                      <CarouselItem key={index}>
                        <img
                          src={photo}
                          alt={`Property ${index + 1}`}
                          className="w-full h-[400px] object-cover"
                        />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  {photos.length > 1 && (
                    <>
                      <CarouselPrevious className="left-4" />
                      <CarouselNext className="right-4" />
                    </>
                  )}
                </Carousel>
              </CardContent>
            </Card>

            {/* Details */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">
                      {isApartment
                        ? (apartmentType ? `${apartmentType} in ${locationName}` : listing.title)
                        : (listing.room_name ? `${listing.room_name} in ${locationName}` : 'Room Share Listing')
                      }
                    </CardTitle>
                    <div className="flex items-center mt-2 text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{locationName}</span>
                    </div>
                  </div>
                  {(!currentUser || currentUser?.role === 'student') && (currentUser?.user_id || currentUser?.id) !== listing.creator_id && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleWishlistToggle}
                      className={isWishlisted ? 'text-red-500 border-red-500' : ''}
                    >
                      <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Price */}
                <div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-semibold text-gray-900">
                      {formatCurrency(price)}
                    </span>
                    <span className="text-gray-500">/person/month</span>
                  </div>
                  {isApartment && totalRent && (
                    <p className="text-sm text-gray-500 mt-1">
                      Total Rent: {formatCurrency(totalRent)}
                    </p>
                  )}
                </div>

                {/* Fair Rent Score */}
                {isApartment && fairRentScore !== undefined && fairRentScore !== null && (
                  <div className={`flex items-center space-x-2 ${getFairRentColor(fairRentScore)}`}>
                    <Star className="h-5 w-5 fill-current" />
                    <span className="font-semibold">
                      Fair Rent Score: {Number(fairRentScore).toFixed(1)} - {getFairRentLabel(fairRentScore)}
                    </span>
                  </div>
                )}

                {/* Key Features */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  {isApartment ? (
                    <>
                      {maxOccupancy && (
                        <div className="flex items-center space-x-2">
                          <Users className="h-5 w-5 text-gray-400" />
                          <span>Max {maxOccupancy} people</span>
                        </div>
                      )}
                      {availabilityDate && (
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-5 w-5 text-gray-400" />
                          <span>Available {formatDate(availabilityDate)}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    availabilityDate && (
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-5 w-5 text-gray-400" />
                        <span>Available {formatDate(availabilityDate)}</span>
                      </div>
                    )
                  )}
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  {womenOnly && (
                    <Badge variant="secondary">Women Only</Badge>
                  )}
                  {isApartment && apartmentType && <Badge variant="outline">{apartmentType}</Badge>}
                  {listing.verification_status && (
                    <Badge variant={listing.verification_status === 'verified' ? 'default' : 'outline'}>
                      {listing.verification_status === 'verified' ? 'Verified' : 'Verification Pending'}
                    </Badge>
                  )}
                </div>

                {/* Description */}
                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{description}</p>
                </div>

                {/* Amenities */}
                {isApartment && amenities.length > 0 && (
                  <div className="pt-4 border-t">
                    <h3 className="font-semibold mb-2">Amenities</h3>
                    <div className="flex flex-wrap gap-2">
                      {amenities.map((amenity) => (
                        <Badge key={amenity.amenity_id} variant="secondary">
                          {amenity.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Contact {isApartment ? 'Owner' : 'Student'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-semibold text-lg">{ownerName}</p>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mt-2">
                    <Phone className="h-4 w-4" />
                    <span>{listing.owner_phone || '+880 1xxx-xxxxxx'}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                    <Mail className="h-4 w-4" />
                    <span>{listing.owner_email || 'Contact through app'}</span>
                  </div>
                </div>

                {/* Request Visit - Only show for students, and hide if they created this listing */}
                {currentUser?.role === 'student' && (currentUser?.user_id || currentUser?.id) !== listing.creator_id && (
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full">Request Visit</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Schedule a Visit</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div>
                          <Label>Preferred Date</Label>
                          <Input
                            type="date"
                            value={visitDate}
                            onChange={(e) => setVisitDate(e.target.value)}
                            className="mt-2"
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                        <div>
                          <Label>Preferred Time</Label>
                          <Input
                            type="time"
                            value={visitTime}
                            onChange={(e) => setVisitTime(e.target.value)}
                            className="mt-2"
                          />
                        </div>
                        <Button 
                          onClick={handleBookVisit} 
                          className="w-full"
                          disabled={bookingLoading}
                        >
                          {bookingLoading ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            'Send Request'
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </CardContent>
            </Card>

            {/* Commute Calculator */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Navigation className="h-5 w-5 mr-2" />
                  Commute Calculator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Select University</Label>
                  <Select value={selectedUniversity} onValueChange={setSelectedUniversity}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Choose university" />
                    </SelectTrigger>
                    <SelectContent>
                      {universities.map((uni) => (
                        <SelectItem key={uni.id} value={uni.id}>
                          {uni.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCalculateCommute} className="w-full" disabled={!selectedUniversity}>
                  Calculate Commute
                </Button>

                {commuteInfo && (
                  <div className="bg-blue-50 p-4 rounded-lg space-y-2 border border-blue-100">
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm">Distance:</span>
                      <span className="font-semibold">{commuteInfo.distance} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 text-sm">Walking Time:</span>
                      <span className="font-semibold">{commuteInfo.walkingTime} mins</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

