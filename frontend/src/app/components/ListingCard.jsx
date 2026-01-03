import { useNavigate } from 'react-router-dom';
import { Heart, MapPin, Users, Home, Calendar, Star } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Apartment, RoomShareListing } from '../lib/mockData';
import { formatCurrency, formatDate, getFairRentColor, getFairRentLabel } from '../lib/utils';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';

export default function ListingCard({ listing, type }) {
  const navigate = useNavigate();
  const { addToWishlist, removeFromWishlist, isInWishlist, currentUser } = useApp();

  const isWishlisted = isInWishlist(listing.id);

  const handleWishlistToggle = (e) => {
    e.stopPropagation();
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

  const handleCardClick = () => {
    navigate(`/listing/${listing.id}?type=${type}`);
  };

  const isApartment = (listing) => {
    return type === 'apartment';
  };

  return (
    <Card
      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="relative h-48">
        <img
          src={listing.photos[0]}
          alt="Property"
          className="w-full h-full object-cover"
        />
        <Button
          variant="ghost"
          size="icon"
          className={`absolute top-2 right-2 bg-white/90 hover:bg-white ${
            isWishlisted ? 'text-red-500' : ''
          }`}
          onClick={handleWishlistToggle}
        >
          <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
        </Button>
        {isApartment(listing) && (
          <div className={`absolute bottom-2 left-2 flex items-center space-x-1 ${getFairRentColor(listing.fairRentScore)} bg-white px-2 py-1 rounded-md text-sm`}>
            <Star className="h-4 w-4 fill-current" />
            <span>{listing.fairRentScore.toFixed(1)} - {getFairRentLabel(listing.fairRentScore)}</span>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <div className="space-y-2">
          {/* Location */}
          <div className="flex items-center text-gray-600">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="text-sm">
              {isApartment(listing) ? listing.location : listing.location}
            </span>
          </div>

          {/* Type and Features */}
          <div className="flex flex-wrap gap-2">
            {isApartment(listing) && (
              <>
                <Badge variant="outline">
                  <Home className="h-3 w-3 mr-1" />
                  {listing.apartmentType}
                </Badge>
                <Badge variant="outline">
                  <Users className="h-3 w-3 mr-1" />
                  Max {listing.maxOccupancy}
                </Badge>
              </>
            )}
            {isApartment(listing) ? listing.womenOnly && (
              <Badge variant="secondary">Women Only</Badge>
            ) : listing.womenOnly && (
              <Badge variant="secondary">Women Only</Badge>
            )}
          </div>

          {/* Price */}
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-semibold text-gray-900">
              {formatCurrency(
                isApartment(listing) ? listing.pricePerPerson : listing.pricePerPerson
              )}
            </span>
            <span className="text-sm text-gray-500">/person/month</span>
          </div>

          {/* Availability Date */}
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-1" />
            <span>
              Available from{' '}
              {formatDate(
                isApartment(listing) ? listing.availabilityDate : listing.availableFrom
              )}
            </span>
          </div>

          {/* Owner/Student Name */}
          <p className="text-sm text-gray-500">
            {isApartment(listing) ? `Posted by ${listing.ownerName}` : `Posted by ${listing.studentName}`}
          </p>

          <Button className="w-full mt-2">View Details</Button>
        </div>
      </CardContent>
    </Card>
  );
}
