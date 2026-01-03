import { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { MapPin, Users, Calendar, Phone, Mail, Heart, Navigation, Star } from 'lucide-react';
import Navbar from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../components/ui/carousel';
import {
  mockApartments,
  mockRoomShareListings,
  mockUniversities,
  mockLocations,
} from '../lib/mockData';
import { formatCurrency, formatDate, calculateCommute, getFairRentColor, getFairRentLabel } from '../lib/utils';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';

export default function ListingDetailsPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToWishlist, removeFromWishlist, isInWishlist, currentUser } = useApp();
  
  const type = searchParams.get('type');
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [commuteInfo, setCommuteInfo] = useState(null);
  
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('');

  // Find the listing
  const listing =
    type === 'apartment'
      ? mockApartments.find((apt) => apt.id === id)
      : mockRoomShareListings.find((rs) => rs.id === id);

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-2xl font-semibold">Listing not found</h2>
          <Button className="mt-4" onClick={() => navigate('/search')}>
            Back to Search
          </Button>
        </div>
      </div>
    );
  }

  const isWishlisted = isInWishlist(listing.id);

  const handleWishlistToggle = () => {
    if (isWishlisted) {
      removeFromWishlist(listing.id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist({
        id: `wl-${Date.now()}`,
        userId: currentUser.id,
        listingId: listing.id,
        listingType: type,
        addedAt: new Date().toISOString(),
      });
      toast.success('Added to wishlist');
    }
  };

  const handleCalculateCommute = () => {
    if (!selectedUniversity) return;
    
    const university = mockUniversities.find((u) => u.id === selectedUniversity);
    const location = mockLocations.find((l) => l.name === listing.location);
    
    if (university && location) {
      const commute = calculateCommute(
        location.latitude,
        location.longitude,
        university.latitude,
        university.longitude
      );
      setCommuteInfo(commute);
      toast.success('Commute calculated');
    }
  };

  const handleBookVisit = () => {
    if (!visitDate || !visitTime) {
      toast.error('Please select date and time');
      return;
    }
    toast.success('Visit request sent to owner');
  };

  const isApartment = type === 'apartment';
  const apartmentData = isApartment ? listing : null;

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
              <CardContent className="p-0">
                <Carousel>
                  <CarouselContent>
                    {listing.photos.map((photo, index) => (
                      <CarouselItem key={index}>
                        <img
                          src={photo}
                          alt={`Property ${index + 1}`}
                          className="w-full h-96 object-cover rounded-lg"
                        />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-4" />
                  <CarouselNext className="right-4" />
                </Carousel>
              </CardContent>
            </Card>

            {/* Details */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">
                      {isApartment ? `${apartmentData.apartmentType} in ${listing.location}` : `Room Share in ${listing.location}`}
                    </CardTitle>
                    <div className="flex items-center mt-2 text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{listing.location}</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleWishlistToggle}
                    className={isWishlisted ? 'text-red-500 border-red-500' : ''}
                  >
                    <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Price */}
                <div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-semibold text-gray-900">
                      {formatCurrency(listing.pricePerPerson)}
                    </span>
                    <span className="text-gray-500">/person/month</span>
                  </div>
                  {isApartment && (
                    <p className="text-sm text-gray-500 mt-1">
                      Total Rent: {formatCurrency(apartmentData.totalRent)}
                    </p>
                  )}
                </div>

                {/* Fair Rent Score */}
                {isApartment && (
                  <div className={`flex items-center space-x-2 ${getFairRentColor(apartmentData.fairRentScore)}`}>
                    <Star className="h-5 w-5 fill-current" />
                    <span className="font-semibold">
                      Fair Rent Score: {apartmentData.fairRentScore.toFixed(1)} - {getFairRentLabel(apartmentData.fairRentScore)}
                    </span>
                  </div>
                )}

                {/* Key Features */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  {isApartment && (
                    <>
                      <div className="flex items-center space-x-2">
                        <Users className="h-5 w-5 text-gray-400" />
                        <span>Max {apartmentData.maxOccupancy} people</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-5 w-5 text-gray-400" />
                        <span>Available {formatDate(apartmentData.availabilityDate)}</span>
                      </div>
                    </>
                  )}
                  {!isApartment && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <span>Available {formatDate(listing.availableFrom)}</span>
                    </div>
                  )}
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  {listing.womenOnly && (
                    <Badge>Women Only</Badge>
                  )}
                  {isApartment && <Badge variant="outline">{apartmentData.apartmentType}</Badge>}
                  <Badge variant="outline">{listing.status}</Badge>
                </div>

                {/* Description */}
                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-gray-600">{listing.description}</p>
                </div>

                {/* Amenities */}
                {isApartment && apartmentData.amenities && (
                  <div className="pt-4 border-t">
                    <h3 className="font-semibold mb-2">Amenities</h3>
                    <div className="flex flex-wrap gap-2">
                      {apartmentData.amenities.map((amenity) => (
                        <Badge key={amenity} variant="secondary">
                          {amenity}
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
            {/* Contact Owner */}
            <Card>
              <CardHeader>
                <CardTitle>Contact {isApartment ? 'Owner' : 'Student'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-semibold">{isApartment ? listing.ownerName : listing.studentName}</p>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mt-2">
                    <Phone className="h-4 w-4" />
                    <span>+880 1234 567890</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                    <Mail className="h-4 w-4" />
                    <span>contact@example.com</span>
                  </div>
                </div>

                {/* Request Visit */}
                <Dialog>
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
                      <Button onClick={handleBookVisit} className="w-full">
                        Send Request
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
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
                      {mockUniversities.map((uni) => (
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
                  <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Distance:</span>
                      <span className="font-semibold">{commuteInfo.distance} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Walking Time:</span>
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
