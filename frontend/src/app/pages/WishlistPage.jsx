import Navbar from '../components/Navbar';
import ListingCard from '../components/ListingCard';
import { Card, CardContent } from '../components/ui/card';
import { useApp } from '../context/AppContext';
import { mockApartments, mockRoomShareListings } from '../lib/mockData';

export default function WishlistPage() {
  const { wishlist } = useApp();

  const wishlistedListings = wishlist.map((item) => {
    if (item.listingType === 'apartment') {
      return {
        listing: mockApartments.find((apt) => apt.id === item.listingId),
        type: 'apartment',
      };
    } else {
      return {
        listing: mockRoomShareListings.find((rs) => rs.id === item.listingId),
        type: 'room-share',
      };
    }
  }).filter((item) => item.listing);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-semibold mb-8">My Wishlist</h1>

        {wishlistedListings.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-gray-500">
              <p className="text-lg">Your wishlist is empty</p>
              <p className="text-sm mt-2">Save listings you like to view them later</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {wishlistedListings.map((item, index) => (
              item.listing && (
                <ListingCard
                  key={index}
                  listing={item.listing}
                  type={item.type}
                />
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
