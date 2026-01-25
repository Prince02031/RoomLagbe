import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, Bookmark, Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import ListingCard from '../components/ListingCard';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Slider } from '../components/ui/slider';
import { Switch } from '../components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import listingService from '../services/listing.service';
import locationService from '../services/location.service';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const { addSavedSearch, currentUser, isAuthenticated } = useApp();

  const initialType = searchParams.get('type') || 'all';

  // Filter states
  const [listingType, setListingType] = useState(initialType);
  const [location, setLocation] = useState('');
  const [priceRange, setPriceRange] = useState([0, 15000]);
  const [womenOnly, setWomenOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Data states
  const [listings, setListings] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch locations on mount
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const data = await locationService.getAll();
        setLocations(data.locations || data);
      } catch (err) {
        console.error('Error fetching locations:', err);
      }
    };
    fetchLocations();
  }, []);

  // Fetch listings when filters change
  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      setError(null);

      try {
        const filters = {};

        if (location) filters.location_id = location;
        if (listingType !== 'all') filters.listing_type = listingType === 'room-share' ? 'room_share' : listingType;
        filters.min_price = priceRange[0];
        filters.max_price = priceRange[1];
        if (womenOnly) filters.women_only = true;

        const data = await listingService.getAll(filters);
        let fetchedListings = data.listings || data;

        // Client-side search query filter
        if (searchQuery) {
          fetchedListings = fetchedListings.filter(listing => {
            const searchLower = searchQuery.toLowerCase();
            return (
              listing.title?.toLowerCase().includes(searchLower) ||
              listing.description?.toLowerCase().includes(searchLower) ||
              listing.location?.area_name?.toLowerCase().includes(searchLower)
            );
          });
        }

        setListings(fetchedListings);
      } catch (err) {
        console.error('Error fetching listings:', err);
        setError('Failed to load listings. Please try again.');
        toast.error('Failed to load listings');
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [listingType, location, priceRange, womenOnly, searchQuery]);

  // Separate listings by type
  const apartments = listings.filter(l => l.listing_type === 'apartment');
  const roomShares = listings.filter(l => l.listing_type === 'room_share');

  const filteredApartments = listingType === 'all' || listingType === 'apartment' ? apartments : [];
  const filteredRoomShares = listingType === 'all' || listingType === 'room-share' ? roomShares : [];
  const totalResults = filteredApartments.length + filteredRoomShares.length;

  const handleSaveSearch = () => {
    if (!isAuthenticated) {
      toast.error('Please login to save searches');
      return;
    }

    const search = {
      id: `search-${Date.now()}`,
      userId: currentUser?.user_id || currentUser?.id,
      name: `Search on ${new Date().toLocaleDateString()}`,
      filters: {
        location: location || undefined,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        listingType: listingType === 'all' ? undefined : listingType,
        womenOnly: womenOnly || undefined,
      },
      createdAt: new Date().toISOString(),
    };
    addSavedSearch(search);
    toast.success('Search saved successfully');
  };

  const clearFilters = () => {
    setListingType('all');
    setLocation('');
    setPriceRange([0, 15000]);
    setWomenOnly(false);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-semibold mb-8">Search Listings</h1>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search Query */}
                <div>
                  <Label>Search</Label>
                  <div className="relative mt-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by location..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Listing Type */}
                <div>
                  <Label>Listing Type</Label>
                  <Select value={listingType} onValueChange={(value) => setListingType(value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Listings</SelectItem>
                      <SelectItem value="apartment">Apartments</SelectItem>
                      <SelectItem value="room-share">Room Shares</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Location */}
                <div>
                  <Label>Location</Label>
                  <Select value={location || 'all'} onValueChange={(val) => setLocation(val === 'all' ? '' : val)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="All Locations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      {locations.map((loc) => (
                        <SelectItem key={loc.location_id} value={loc.location_id}>
                          {loc.area_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div>
                  <Label>Price Range (per person)</Label>
                  <div className="mt-4 px-2">
                    <Slider
                      min={0}
                      max={15000}
                      step={500}
                      value={priceRange}
                      onValueChange={setPriceRange}
                    />
                    <div className="flex justify-between mt-2 text-sm text-gray-600">
                      <span>৳{priceRange[0]}</span>
                      <span>৳{priceRange[1]}</span>
                    </div>
                  </div>
                </div>

                {/* Women Only */}
                <div className="flex items-center justify-between">
                  <Label>Women Only</Label>
                  <Switch checked={womenOnly} onCheckedChange={setWomenOnly} />
                </div>

                {/* Save Search */}
                {isAuthenticated && (
                  <Button onClick={handleSaveSearch} className="w-full" variant="outline">
                    <Bookmark className="h-4 w-4 mr-2" />
                    Save Search
                  </Button>
                )}

                {/* Clear Filters */}
                <Button onClick={clearFilters} variant="ghost" className="w-full">
                  Clear All Filters
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <p className="text-gray-600">
                Found <span className="font-semibold">{totalResults}</span> results
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Loading listings...</span>
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <p className="text-red-500 text-lg">{error}</p>
                <Button variant="outline" className="mt-4" onClick={clearFilters}>
                  Try Again
                </Button>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Apartments */}
                {filteredApartments.length > 0 && (
                  <div>
                    {(listingType === 'all' || listingType === 'apartment') && (
                      <h2 className="text-xl font-semibold mb-4">Apartments ({filteredApartments.length})</h2>
                    )}
                    <div className="grid md:grid-cols-2 gap-6">
                      {filteredApartments.map((apartment) => (
                        <ListingCard key={apartment.listing_id} listing={apartment} type="apartment" />
                      ))}
                    </div>
                  </div>
                )}

                {/* Room Shares */}
                {filteredRoomShares.length > 0 && (
                  <div>
                    {(listingType === 'all' || listingType === 'room-share') && (
                      <h2 className="text-xl font-semibold mb-4">
                        Room Shares ({filteredRoomShares.length})
                      </h2>
                    )}
                    <div className="grid md:grid-cols-2 gap-6">
                      {filteredRoomShares.map((listing) => (
                        <ListingCard key={listing.listing_id} listing={listing} type="room-share" />
                      ))}
                    </div>
                  </div>
                )}

                {totalResults === 0 && !loading && (
                  <div className="text-center py-16">
                    <p className="text-gray-500 text-lg">No listings found matching your criteria</p>
                    <Button variant="outline" className="mt-4" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
