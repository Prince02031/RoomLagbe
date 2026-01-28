import { useNavigate } from 'react-router-dom';
import { Heart, MapPin, Users, Home, Calendar, Star } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { formatCurrency, formatDate, getFairRentColor, getFairRentLabel } from '../lib/utils';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';

export default function ListingCard({ listing, type }) {
  const navigate = useNavigate();
  const { addToWishlist, removeFromWishlist, isInWishlist, currentUser } = useApp();

  // Handle both id (mock) and listing_id (backend)
  const listingId = listing?.listing_id || listing?.id;
  const isWishlisted = isInWishlist(listingId);

  // Handle both snake_case (backend) and camelCase (mock)
  const title = listing?.title || listing?.apartment_title || listing?.room_name || 'Untitled Listing';
  const price = listing?.price_per_person || listing?.pricePerPerson || 0;
  const locationName = listing?.location?.area_name || listing?.area_name || listing?.location || 'Unknown Location';
  const apartmentType = listing?.apartment_type || listing?.apartmentType;
  const maxOccupancy = listing?.max_occupancy || listing?.maxOccupancy;
  const womenOnly = listing?.women_only !== undefined ? listing?.women_only : listing?.womenOnly;
  const fairRentScore = listing?.fair_rent_score !== undefined ? listing?.fair_rent_score : listing?.fairRentScore;
  const ownerName = listing?.owner_name || listing?.ownerName || 'Property Owner';
  const studentName = listing?.student_name || listing?.studentName || 'Student';
  const photos = listing?.photos || [];
  const thumbnail = photos.length > 0 ? photos[0] : (listing?.thumbnail || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800&auto=format&fit=crop');

  // Availability date handling
  const availabilityDate = listing?.available_from || listing?.availabilityDate || listing?.availableFrom;

  const handleWishlistToggle = async (e) => {
    e.stopPropagation();
    
    // Redirect to login if not authenticated
    if (!currentUser) {
      toast.info('Please login to add items to wishlist');
      navigate('/login');
      return;
    }
    
    if (isWishlisted) {
      await removeFromWishlist(listingId);
      toast.success('Removed from wishlist');
    } else {
      await addToWishlist(listingId);
      toast.success('Added to wishlist');
    }
  };

  const handleCardClick = () => {
    navigate(`/listing/${listingId}?type=${type || listing?.listing_type || 'apartment'}`);
  };

  const isApartment = () => {
    return type === 'apartment' || listing?.listing_type === 'apartment';
  };

  return (
    <Card
      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="relative h-48">
        <img
          src={thumbnail}
          alt="Property"
          className="w-full h-full object-cover"
        />
        {(!currentUser || currentUser?.role === 'student') && (currentUser?.user_id || currentUser?.id) !== listing.creator_id && (
          <Button
            variant="ghost"
            size="icon"
            className={`absolute top-2 right-2 bg-white/90 hover:bg-white ${isWishlisted ? 'text-red-500' : ''
              }`}
            onClick={handleWishlistToggle}
          >
            <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
          </Button>
        )}
        {isApartment() && fairRentScore !== undefined && fairRentScore !== null && (
          <div className={`absolute bottom-2 left-2 flex items-center space-x-1 ${getFairRentColor(fairRentScore)} bg-white px-2 py-1 rounded-md text-sm`}>
            <Star className="h-4 w-4 fill-current" />
            <span>{Number(fairRentScore).toFixed(1)} - {getFairRentLabel(fairRentScore)}</span>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <div className="space-y-2">
          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {title}
          </h3>

          {/* Location */}
          <div className="flex items-center text-gray-600">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="text-sm truncate">
              {locationName}
            </span>
          </div>

          {/* Type and Features */}
          <div className="flex flex-wrap gap-2">
            {isApartment() && (
              <>
                {apartmentType && (
                  <Badge variant="outline">
                    <Home className="h-3 w-3 mr-1" />
                    {apartmentType}
                  </Badge>
                )}
                {maxOccupancy && (
                  <Badge variant="outline">
                    <Users className="h-3 w-3 mr-1" />
                    Max {maxOccupancy}
                  </Badge>
                )}
              </>
            )}
            {womenOnly && (
              <Badge variant="secondary">Women Only</Badge>
            )}
          </div>

          {/* Price */}
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-semibold text-gray-900">
              {formatCurrency(price)}
            </span>
            <span className="text-sm text-gray-500">/person/month</span>
          </div>

          {/* Availability Date */}
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-1" />
            <span>
              Available from{' '}
              {formatDate(availabilityDate)}
            </span>
          </div>

          {/* Owner/Student Name */}
          <p className="text-sm text-gray-500">
            Posted by {ownerName}
          </p>

          <Button className="w-full mt-2">View Details</Button>
        </div>
      </CardContent>
    </Card>
  );
}
