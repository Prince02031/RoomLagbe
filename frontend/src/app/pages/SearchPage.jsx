import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Filter, Bookmark, Loader2, MapPin } from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Popup, Circle, useMap } from 'react-leaflet';
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
import { calculateDistance } from '../lib/utils';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';

function MapFocusController({ focusCoordinates }) {
  const map = useMap();

  useEffect(() => {
    if (!Array.isArray(focusCoordinates) || focusCoordinates.length !== 2) {
      return;
    }

    map.setView(focusCoordinates, 14, { animate: true });
  }, [focusCoordinates, map]);

  return null;
}

function MapFitToListings({ coordinates }) {
  const map = useMap();

  useEffect(() => {
    if (!Array.isArray(coordinates) || coordinates.length === 0) {
      return;
    }

    if (coordinates.length === 1) {
      map.setView(coordinates[0], 14, { animate: true });
      return;
    }

    map.fitBounds(coordinates, { padding: [30, 30] });
  }, [coordinates, map]);

  return null;
}

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addSavedSearch, currentUser, isAuthenticated } = useApp();

  const initialType = searchParams.get('type') || 'all';
  const initialLocation = searchParams.get('location') || '';
  const initialMinPrice = parseInt(searchParams.get('minPrice')) || 0;
  const initialMaxPrice = parseInt(searchParams.get('maxPrice')) || 15000;
  const initialWomenOnly = searchParams.get('womenOnly') === 'true';

  // Filter states
  const [listingType, setListingType] = useState(initialType);
  const [location, setLocation] = useState(initialLocation);
  const [priceRange, setPriceRange] = useState([initialMinPrice, initialMaxPrice]);
  const [womenOnly, setWomenOnly] = useState(initialWomenOnly);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [searchingSuggestions, setSearchingSuggestions] = useState(false);

  // Data states
  const [listings, setListings] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Save search dialog
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [selectedSearchCoordinates, setSelectedSearchCoordinates] = useState(null);
  const [searchRadiusKm, setSearchRadiusKm] = useState(5);
  const [fallbackCoordinates, setFallbackCoordinates] = useState({});

  // Fetch locations on mount
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const data = await locationService.getAll();
        setLocations(data.locations || data || []);
      } catch (err) {
        console.error('Error fetching locations:', err);
      }
    };
    fetchLocations();
  }, []);

  // OpenStreetMap suggestions for search bar
  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length < 3) {
      setSearchSuggestions([]);
      setSearchingSuggestions(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      setSearchingSuggestions(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&limit=8`,
          {
            signal: controller.signal,
            headers: { Accept: 'application/json' },
          }
        );

        if (!response.ok) {
          setSearchSuggestions([]);
          return;
        }

        const data = await response.json();
        const suggestions = Array.isArray(data)
          ? data.map((item, index) => {
            const displayName = item.display_name || '';
            const shortName = displayName.split(',')[0]?.trim() || displayName;
            return {
              id: `${index}`,
              shortName,
              displayName,
              latitude: Number.parseFloat(item.lat),
              longitude: Number.parseFloat(item.lon),
            };
          })
          : [];

        setSearchSuggestions(suggestions);
      } catch (error) {
        if (error.name !== 'AbortError') {
          setSearchSuggestions([]);
        }
      } finally {
        setSearchingSuggestions(false);
      }
    }, 250);

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [searchQuery]);

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
        let fetchedListings = data.listings || data || [];

        // Radius-based location filter when a place is selected from OSM suggestions
        if (selectedSearchCoordinates && Array.isArray(fetchedListings)) {
          const [centerLat, centerLng] = selectedSearchCoordinates;
          fetchedListings = fetchedListings.filter((listing) => {
            if (!listing || listing.availability_status !== 'available') {
              return false;
            }

            const lat = Number.parseFloat(listing.latitude ?? listing.location?.latitude);
            const lng = Number.parseFloat(listing.longitude ?? listing.location?.longitude);
            if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
              return false;
            }

            const distanceKm = calculateDistance(centerLat, centerLng, lat, lng);
            return distanceKm <= searchRadiusKm;
          });
        }

        // Client-side search query filter
        if (!selectedSearchCoordinates && searchQuery && Array.isArray(fetchedListings)) {
          const searchLower = searchQuery.toLowerCase();
          fetchedListings = fetchedListings.filter(listing => {
            if (!listing) return false;
            const title = (listing.title || listing.apartment_title || '').toLowerCase();
            const desc = (listing.description || '').toLowerCase();
            const locName = (listing.location?.area_name || listing.area_name || listing.location || '').toLowerCase();

            return (
              title.includes(searchLower) ||
              desc.includes(searchLower) ||
              locName.includes(searchLower)
            );
          });
        }

        setListings(Array.isArray(fetchedListings) ? fetchedListings : []);
      } catch (err) {
        console.error('Error fetching listings:', err);
        setError('Failed to load listings. Please try again.');
        toast.error('Failed to load listings');
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [listingType, location, priceRange, womenOnly, searchQuery, selectedSearchCoordinates, searchRadiusKm]);

  // Separate listings by type
  const safeListings = Array.isArray(listings) ? listings : [];
  const apartments = safeListings.filter(l => l?.listing_type === 'apartment');
  const roomShares = safeListings.filter(l => l?.listing_type === 'room_share');

  const filteredApartments = listingType === 'all' || listingType === 'apartment' ? apartments : [];
  const filteredRoomShares = listingType === 'all' || listingType === 'room-share' ? roomShares : [];
  const totalResults = filteredApartments.length + filteredRoomShares.length;

  const visibleListings = [...filteredApartments, ...filteredRoomShares];

  useEffect(() => {
    const listingsMissingCoords = visibleListings.filter((listing) => {
      const listingId = listing?.listing_id || listing?.id;
      if (!listingId || fallbackCoordinates[listingId]) {
        return false;
      }

      const lat = Number.parseFloat(listing?.latitude ?? listing?.location?.latitude);
      const lng = Number.parseFloat(listing?.longitude ?? listing?.location?.longitude);
      return !Number.isFinite(lat) || !Number.isFinite(lng);
    });

    if (listingsMissingCoords.length === 0) {
      return;
    }

    const controller = new AbortController();

    const fetchMissingCoordinates = async () => {
      const resolved = {};

      await Promise.all(
        listingsMissingCoords.map(async (listing) => {
          const listingId = listing?.listing_id || listing?.id;
          const locationQuery = listing?.location?.area_name || listing?.area_name || listing?.location;

          if (!listingId || !locationQuery) {
            return;
          }

          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(locationQuery)}&limit=1`,
              {
                signal: controller.signal,
                headers: { Accept: 'application/json' },
              }
            );

            if (!response.ok) {
              return;
            }

            const data = await response.json();
            const bestMatch = Array.isArray(data) ? data[0] : null;

            const lat = Number.parseFloat(bestMatch?.lat);
            const lng = Number.parseFloat(bestMatch?.lon);

            if (Number.isFinite(lat) && Number.isFinite(lng)) {
              resolved[listingId] = { latitude: lat, longitude: lng };
            }
          } catch (error) {
            if (error.name !== 'AbortError') {
              console.error('Geocoding listing location failed:', error);
            }
          }
        })
      );

      if (Object.keys(resolved).length > 0) {
        setFallbackCoordinates((prev) => ({ ...prev, ...resolved }));
      }
    };

    fetchMissingCoordinates();

    return () => {
      controller.abort();
    };
  }, [visibleListings, fallbackCoordinates]);

  const listingsForMap = visibleListings
    .map((listing) => {
      const listingId = listing?.listing_id || listing?.id;
      const fallback = listingId ? fallbackCoordinates[listingId] : null;
      const latitude = Number.parseFloat(
        listing?.latitude
        ?? listing?.location?.latitude
        ?? fallback?.latitude
        ?? selectedSearchCoordinates?.[0]
      );
      const longitude = Number.parseFloat(
        listing?.longitude
        ?? listing?.location?.longitude
        ?? fallback?.longitude
        ?? selectedSearchCoordinates?.[1]
      );

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        return null;
      }

      return {
        ...listing,
        latitude,
        longitude,
      };
    })
    .filter(Boolean);

  const mapCenter = listingsForMap.length > 0
    ? [listingsForMap[0].latitude, listingsForMap[0].longitude]
    : [23.8103, 90.4125];

  const resolvedMapCenter = selectedSearchCoordinates || mapCenter;

  const handleSaveSearch = () => {
    if (!isAuthenticated) {
      toast.error('Please login to save searches');
      return;
    }
    setSearchName(`Search on ${new Date().toLocaleDateString()}`);
    setShowSaveDialog(true);
  };

  const confirmSaveSearch = async () => {
    if (!searchName.trim()) {
      toast.error('Please enter a search name');
      return;
    }

    const search = {
      name: searchName,
      filters: {
        location: location || undefined,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        listingType: listingType === 'all' ? undefined : listingType,
        womenOnly: womenOnly || undefined,
      },
    };
    
    try {
      await addSavedSearch(search);
      toast.success('Search saved successfully');
      setShowSaveDialog(false);
      setSearchName('');
    } catch (error) {
      toast.error('Failed to save search');
    }
  };

  const clearFilters = () => {
    setListingType('all');
    setLocation('');
    setPriceRange([0, 15000]);
    setWomenOnly(false);
    setSearchQuery('');
    setSelectedSearchCoordinates(null);
    setSearchRadiusKm(5);
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
                      placeholder="Search places via OpenStreetMap..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowSearchSuggestions(true);
                        setSelectedSearchCoordinates(null);
                      }}
                      onFocus={() => setShowSearchSuggestions(true)}
                      className="pl-10"
                    />

                    {showSearchSuggestions && searchQuery.trim() && (
                      <div className="absolute z-30 mt-1 w-full rounded-md border bg-white shadow-sm max-h-52 overflow-y-auto">
                        {searchingSuggestions ? (
                          <div className="px-3 py-2 text-sm text-gray-500">Searching OpenStreetMap...</div>
                        ) : searchSuggestions.length > 0 ? (
                          searchSuggestions.map((suggestion) => (
                            <button
                              key={suggestion.id}
                              type="button"
                              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                              onClick={() => {
                                setSearchQuery(suggestion.shortName);
                                if (Number.isFinite(suggestion.latitude) && Number.isFinite(suggestion.longitude)) {
                                  setSelectedSearchCoordinates([suggestion.latitude, suggestion.longitude]);
                                }
                                setShowSearchSuggestions(false);
                              }}
                            >
                              {suggestion.displayName}
                            </button>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-sm text-gray-500">No matching places found</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {selectedSearchCoordinates && (
                  <div>
                    <Label>Radius: {searchRadiusKm} km</Label>
                    <div className="mt-4 px-2">
                      <Slider
                        min={1}
                        max={20}
                        step={1}
                        value={[searchRadiusKm]}
                        onValueChange={(value) => setSearchRadiusKm(value[0])}
                      />
                      <div className="flex justify-between mt-2 text-sm text-gray-600">
                        <span>1 km</span>
                        <span>20 km</span>
                      </div>
                    </div>
                  </div>
                )}

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
                      {Array.isArray(locations) && locations.map((loc) => (
                        <SelectItem key={loc?.location_id || Math.random()} value={loc?.location_id || '#'}>
                          {loc?.area_name || 'Unknown'}
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
            <div className="mb-6 flex items-center justify-between gap-3">
              <p className="text-gray-600">
                Found <span className="font-semibold">{totalResults}</span> results
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowMap((prev) => !prev)}
              >
                <MapPin className="h-4 w-4 mr-1" />
                {showMap ? 'Hide Map' : 'Map'}
              </Button>
            </div>

            {showMap && (
              <Card className="mb-6 overflow-hidden">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-lg">
                    <MapPin className="h-5 w-5 mr-2" />
                    Listings Map
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {listingsForMap.length > 0 ? (
                    <div className="h-[380px] rounded-md overflow-hidden border">
                      <MapContainer
                        center={resolvedMapCenter}
                        zoom={13}
                        scrollWheelZoom={true}
                        className="h-full w-full"
                      >
                        <MapFocusController focusCoordinates={selectedSearchCoordinates} />
                        <MapFitToListings coordinates={listingsForMap.map((item) => [item.latitude, item.longitude])} />
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        {selectedSearchCoordinates && (
                          <Circle
                            center={selectedSearchCoordinates}
                            radius={searchRadiusKm * 1000}
                            pathOptions={{ color: '#2563eb', fillColor: '#2563eb', fillOpacity: 0.08 }}
                          />
                        )}

                        {listingsForMap.map((listing) => {
                          const listingId = listing?.listing_id || listing?.id;
                          const listingTitle = listing?.title || listing?.apartment_title || listing?.room_name || 'Listing';
                          const listingLocation = listing?.location?.area_name || listing?.area_name || listing?.location || 'Unknown location';
                          const listingTypeValue = listing?.listing_type || 'apartment';
                          const apartmentType = listing?.apartment_type || 'N/A';
                          const maxOccupancy = listing?.max_occupancy || 'N/A';

                          return (
                            <CircleMarker
                              key={`map-marker-${listingId}`}
                              center={[listing.latitude, listing.longitude]}
                              radius={9}
                              pathOptions={{ color: '#2563eb', fillColor: '#3b82f6', fillOpacity: 0.7 }}
                            >
                              <Popup>
                                <div className="space-y-2 min-w-[200px]">
                                  <p className="font-medium text-sm">{listingTitle}</p>
                                  <p className="text-xs text-gray-600">{listingLocation}</p>
                                  <p className="text-xs font-semibold">৳{listing?.price_per_person || 0}/person</p>
                                  {listingTypeValue === 'apartment' && (
                                    <p className="text-xs text-gray-600">Type: {apartmentType} • Max: {maxOccupancy}</p>
                                  )}
                                  {listing?.women_only && (
                                    <p className="text-xs text-gray-600">Women only</p>
                                  )}
                                  <Button
                                    size="sm"
                                    className="w-full"
                                    onClick={() => navigate(`/listing/${listingId}?type=${listingTypeValue}`)}
                                  >
                                    View Details
                                  </Button>
                                </div>
                              </Popup>
                            </CircleMarker>
                          );
                        })}
                      </MapContainer>
                    </div>
                  ) : (
                    <div className="h-[180px] border rounded-md flex items-center justify-center text-gray-500 text-sm">
                      No mappable locations found for current filters.
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

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
                        <ListingCard key={apartment?.listing_id || Math.random()} listing={apartment} type="apartment" />
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
                        <ListingCard key={listing?.listing_id || Math.random()} listing={listing} type="room-share" />
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

      {/* Save Search Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center" onClick={() => setShowSaveDialog(false)}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-2">Save Search</h2>
            <p className="text-sm text-gray-600 mb-4">
              Give your search a name so you can easily find it later.
            </p>
            <div className="mb-4">
              <Label htmlFor="search-name">Search Name</Label>
              <Input
                id="search-name"
                placeholder="e.g., Affordable rooms near campus"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    confirmSaveSearch();
                  }
                }}
                maxLength={50}
                autoFocus
                className="mt-2"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                Cancel
              </Button>
              <Button onClick={confirmSaveSearch}>
                Save Search
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
