import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { MapPin, Users, Calendar, Phone, Mail, Heart, Navigation, Star, Loader2, CheckCircle2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../components/ui/carousel';
import { MapContainer, TileLayer, Polyline, CircleMarker, useMap } from 'react-leaflet';
import listingService from '../services/listing.service';
import amenityService from '../services/amenity.service';
import bookingService from '../services/booking.service';
import { formatCurrency, formatDate, calculateCommute, getFairRentColor, getFairRentLabel } from '../lib/utils';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';

function FitRouteBounds({ coordinates }) {
  const map = useMap();

  useEffect(() => {
    if (!Array.isArray(coordinates) || coordinates.length < 2) {
      return;
    }

    map.fitBounds(coordinates, { padding: [20, 20] });
  }, [coordinates, map]);

  return null;
}

export default function ListingDetailsPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToWishlist, removeFromWishlist, isInWishlist, currentUser } = useApp();

  const typeFromQuery = searchParams.get('type');
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [universitySearch, setUniversitySearch] = useState('');
  const [showUniversitySuggestions, setShowUniversitySuggestions] = useState(false);
  const [searchingUniversities, setSearchingUniversities] = useState(false);
  const [commuteInfo, setCommuteInfo] = useState(null);
  const [universities, setUniversities] = useState([]);
  const [calculatingCommute, setCalculatingCommute] = useState(false);

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
        if (data.apartment_id && data.listing_type === 'apartment') {
          try {
            const amenitiesData = await amenityService.getByApartment(data.apartment_id);
            setAmenities(amenitiesData);
          } catch (amenityError) {
            console.error('Error fetching amenities:', amenityError);
          }
        } else if (data.room_id && data.listing_type === 'room_share') {
          try {
            const amenitiesData = await amenityService.getByRoom(data.room_id);
            setAmenities(amenitiesData);
          } catch (amenityError) {
            console.error('Error fetching amenities:', amenityError);
          }
        }

      } catch (err) {
        console.error('Error fetching listing details:', err);
        setError('Listing not found');
      } finally {
        setLoading(false);
      }
    };
    fetchListingAndData();
  }, [id]);

  useEffect(() => {
    const query = universitySearch.trim();
    if (query.length < 3) {
      setUniversities([]);
      setSearchingUniversities(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      setSearchingUniversities(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&limit=8`,
          {
            signal: controller.signal,
            headers: {
              Accept: 'application/json',
            },
          }
        );

        if (!response.ok) {
          setUniversities([]);
          return;
        }

        const data = await response.json();
        const suggestions = Array.isArray(data)
          ? data
            .map((item, index) => ({
              id: `${index}`,
              name: item.display_name,
              latitude: Number.parseFloat(item.lat),
              longitude: Number.parseFloat(item.lon),
            }))
            .filter((item) => Number.isFinite(item.latitude) && Number.isFinite(item.longitude))
          : [];

        setUniversities(suggestions);
      } catch (error) {
        if (error.name !== 'AbortError') {
          setUniversities([]);
        }
      } finally {
        setSearchingUniversities(false);
      }
    }, 250);

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [universitySearch]);

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
  const isPosterVerified = [
    listing.poster_verification_status,
    listing.owner_verification_status,
    listing.student_verification_status,
    listing.verification_status,
  ].includes('verified');
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

  const getRouteInfo = async (profile, fromLat, fromLon, toLat, toLon) => {
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/${profile}/${fromLon},${fromLat};${toLon},${toLat}?overview=full&geometries=geojson&alternatives=false&steps=false`,
      {
        headers: {
          Accept: 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Route API failed for ${profile}`);
    }

    const data = await response.json();
    const route = data?.routes?.[0];
    if (!route) {
      throw new Error(`No route data for ${profile}`);
    }

    return {
      distanceKm: route.distance / 1000,
      durationMinutes: Math.round(route.duration / 60),
      routeCoordinates: Array.isArray(route.geometry?.coordinates)
        ? route.geometry.coordinates
          .map((point) => [point[1], point[0]])
          .filter((point) => Number.isFinite(point[0]) && Number.isFinite(point[1]))
        : [],
    };
  };

  const handleCalculateCommute = async () => {
    if (!selectedUniversity) return;

    // Use coordinates from location object if available
    const lat = Number.parseFloat(listing.location?.latitude ?? listing.latitude);
    const lng = Number.parseFloat(listing.location?.longitude ?? listing.longitude);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      toast.error('Location coordinates not available for this property');
      return;
    }

    setCalculatingCommute(true);
    try {
      const [walkingRoute, drivingRoute] = await Promise.allSettled([
        getRouteInfo('walking', lat, lng, selectedUniversity.latitude, selectedUniversity.longitude),
        getRouteInfo('driving', lat, lng, selectedUniversity.latitude, selectedUniversity.longitude),
      ]);

      const fallback = calculateCommute(lat, lng, selectedUniversity.latitude, selectedUniversity.longitude);
      const fallbackDistance = Number.parseFloat(fallback.distance);

      const walkingDistance = walkingRoute.status === 'fulfilled' ? walkingRoute.value.distanceKm : null;
      const drivingDistance = drivingRoute.status === 'fulfilled' ? drivingRoute.value.distanceKm : null;

      const distance = drivingDistance ?? walkingDistance ?? fallbackDistance;
      const walkingTime = walkingRoute.status === 'fulfilled' ? walkingRoute.value.durationMinutes : fallback.walkingTime;
      const drivingTime = drivingRoute.status === 'fulfilled'
        ? drivingRoute.value.durationMinutes
        : Math.round((distance / 28) * 60);

      const routeCoordinates = drivingRoute.status === 'fulfilled'
        ? drivingRoute.value.routeCoordinates
        : walkingRoute.status === 'fulfilled'
          ? walkingRoute.value.routeCoordinates
          : [
            [lat, lng],
            [selectedUniversity.latitude, selectedUniversity.longitude],
          ];

      setCommuteInfo({
        distance: distance.toFixed(2),
        walkingTime,
        drivingTime,
        routeCoordinates,
        origin: [lat, lng],
        destination: [selectedUniversity.latitude, selectedUniversity.longitude],
      });

      if (walkingRoute.status === 'rejected' && drivingRoute.status === 'rejected') {
        toast.info('Showing estimated commute (route API unavailable)');
      } else {
        toast.success('Commute calculated');
      }
    } catch {
      const fallback = calculateCommute(lat, lng, selectedUniversity.latitude, selectedUniversity.longitude);
      setCommuteInfo({
        distance: fallback.distance,
        walkingTime: fallback.walkingTime,
        drivingTime: Math.round((Number.parseFloat(fallback.distance) / 28) * 60),
        routeCoordinates: [
          [lat, lng],
          [selectedUniversity.latitude, selectedUniversity.longitude],
        ],
        origin: [lat, lng],
        destination: [selectedUniversity.latitude, selectedUniversity.longitude],
      });
      toast.info('Showing estimated commute');
    } finally {
      setCalculatingCommute(false);
    }
  };

  const handleViewRentAnalytics = () => {
    const lat = Number.parseFloat(listing?.location?.latitude ?? listing?.latitude);
    const lng = Number.parseFloat(listing?.location?.longitude ?? listing?.longitude);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      toast.error('Location coordinates not available for analytics');
      return;
    }

    navigate(`/analytics?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}&listingId=${encodeURIComponent(listingId)}`);
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
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to send visit request. Please try again.';
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
                {amenities.length > 0 && (
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
                  <p className="font-semibold text-lg flex items-center gap-1.5">
                    <span>{ownerName}</span>
                    {isPosterVerified && <CheckCircle2 className="h-4 w-4 text-blue-600" aria-label="Verified" />}
                  </p>
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
                  <Label>Search University / Destination</Label>
                  <div className="relative mt-2">
                    <Input
                      value={universitySearch}
                      onChange={(e) => {
                        setUniversitySearch(e.target.value);
                        setShowUniversitySuggestions(true);
                        setSelectedUniversity(null);
                      }}
                      onFocus={() => setShowUniversitySuggestions(true)}
                      placeholder="Search places via OpenStreetMap (min 3 chars)"
                    />

                    {showUniversitySuggestions && universitySearch.trim() && (
                      <div className="absolute z-30 mt-1 w-full rounded-md border bg-white shadow-sm max-h-52 overflow-y-auto">
                        {searchingUniversities ? (
                          <div className="px-3 py-2 text-sm text-gray-500">Searching OpenStreetMap...</div>
                        ) : universities.length > 0 ? (
                          universities.map((uni) => (
                            <button
                              key={uni.id}
                              type="button"
                              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                              onClick={() => {
                                setSelectedUniversity(uni);
                                setUniversitySearch(uni.name);
                                setShowUniversitySuggestions(false);
                              }}
                            >
                              {uni.name}
                            </button>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-sm text-gray-500">No matching places found</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Button onClick={handleCalculateCommute} className="w-full" disabled={!selectedUniversity || calculatingCommute}>
                    {calculatingCommute ? 'Calculating...' : 'Calculate Commute'}
                  </Button>
                  <Button type="button" variant="outline" className="w-full" onClick={handleViewRentAnalytics}>
                    View Rent Analytics
                  </Button>
                </div>

                {commuteInfo && (
                  <div className="space-y-3">
                    <div className="bg-blue-50 p-4 rounded-lg space-y-2 border border-blue-100">
                      <div className="flex justify-between">
                        <span className="text-gray-600 text-sm">Distance:</span>
                        <span className="font-semibold">{commuteInfo.distance} km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 text-sm">Walking Time:</span>
                        <span className="font-semibold">{commuteInfo.walkingTime} mins</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 text-sm">Driving Time:</span>
                        <span className="font-semibold">{commuteInfo.drivingTime} mins</span>
                      </div>
                    </div>

                    <div className="h-44 rounded-lg overflow-hidden border border-gray-200">
                      <MapContainer
                        center={commuteInfo.origin || [23.8103, 90.4125]}
                        zoom={13}
                        scrollWheelZoom={false}
                        style={{ height: '100%', width: '100%' }}
                      >
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {Array.isArray(commuteInfo.routeCoordinates) && commuteInfo.routeCoordinates.length > 1 && (
                          <>
                            <Polyline positions={commuteInfo.routeCoordinates} pathOptions={{ color: '#2563eb', weight: 4 }} />
                            <FitRouteBounds coordinates={commuteInfo.routeCoordinates} />
                          </>
                        )}
                        {Array.isArray(commuteInfo.origin) && (
                          <CircleMarker center={commuteInfo.origin} radius={5} pathOptions={{ color: '#16a34a', fillColor: '#16a34a', fillOpacity: 1 }} />
                        )}
                        {Array.isArray(commuteInfo.destination) && (
                          <CircleMarker center={commuteInfo.destination} radius={5} pathOptions={{ color: '#dc2626', fillColor: '#dc2626', fillOpacity: 1 }} />
                        )}
                      </MapContainer>
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

