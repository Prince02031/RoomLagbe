import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Circle, CircleMarker, Popup } from 'react-leaflet';
import { MapPin, Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Slider } from '../components/ui/slider';
import listingService from '../services/listing.service';
import { calculateDistance, formatCurrency } from '../lib/utils';
import { toast } from 'sonner';

const DEFAULT_CENTER = [23.8103, 90.4125];

function getPrice(listing) {
  const price = listing?.price_per_person
    ?? listing?.pricePerPerson
    ?? listing?.price_total
    ?? listing?.totalRent
    ?? 0;
  return Number.parseFloat(price) || 0;
}

function getHeatColor(price, minPrice, maxPrice) {
  if (!Number.isFinite(price)) return '#6b7280';
  if (!Number.isFinite(minPrice) || !Number.isFinite(maxPrice) || maxPrice === minPrice) {
    return '#f59e0b';
  }

  const ratio = (price - minPrice) / (maxPrice - minPrice);
  if (ratio >= 0.8) return '#dc2626';
  if (ratio >= 0.6) return '#ea580c';
  if (ratio >= 0.4) return '#f59e0b';
  if (ratio >= 0.2) return '#84cc16';
  return '#16a34a';
}

function computeFairRentScore(targetPrice, minPrice, maxPrice) {
  if (!Number.isFinite(targetPrice)) return 0;
  if (!Number.isFinite(minPrice) || !Number.isFinite(maxPrice) || maxPrice <= minPrice) {
    return 3;
  }

  const normalized = (targetPrice - minPrice) / (maxPrice - minPrice);
  const inverted = 1 - normalized;
  const score = 1 + (inverted * 4);
  return Math.max(1, Math.min(5, Number.parseFloat(score.toFixed(1))));
}

export default function AnalyticsPage() {
  const [searchParams] = useSearchParams();

  const initialLat = Number.parseFloat(searchParams.get('lat'));
  const initialLng = Number.parseFloat(searchParams.get('lng'));
  const initialListingId = searchParams.get('listingId');

  const [allListings, setAllListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [radiusKm, setRadiusKm] = useState(2);
  const [center, setCenter] = useState(
    Number.isFinite(initialLat) && Number.isFinite(initialLng)
      ? [initialLat, initialLng]
      : DEFAULT_CENTER
  );

  const [locationSearch, setLocationSearch] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchingLocation, setSearchingLocation] = useState(false);

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const data = await listingService.getAll({});
        const listings = Array.isArray(data?.listings) ? data.listings : Array.isArray(data) ? data : [];

        const normalized = listings
          .map((listing) => {
            const latitude = Number.parseFloat(listing?.latitude ?? listing?.location?.latitude);
            const longitude = Number.parseFloat(listing?.longitude ?? listing?.location?.longitude);
            const price = getPrice(listing);

            if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || !price) {
              return null;
            }

            return {
              ...listing,
              listingId: listing?.listing_id || listing?.id,
              title: listing?.title || listing?.apartment_title || listing?.room_name || 'Listing',
              latitude,
              longitude,
              price,
            };
          })
          .filter(Boolean);

        setAllListings(normalized);
      } catch (error) {
        console.error('Failed to fetch listings for analytics:', error);
        toast.error('Failed to load listings for rent analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  useEffect(() => {
    const query = locationSearch.trim();

    if (query.length < 3) {
      setLocationSuggestions([]);
      setSearchingLocation(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      setSearchingLocation(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&limit=8`,
          {
            signal: controller.signal,
            headers: { Accept: 'application/json' },
          }
        );

        if (!response.ok) {
          setLocationSuggestions([]);
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

        setLocationSuggestions(suggestions);
      } catch (error) {
        if (error.name !== 'AbortError') {
          setLocationSuggestions([]);
        }
      } finally {
        setSearchingLocation(false);
      }
    }, 250);

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [locationSearch]);

  const nearbyListings = useMemo(() => {
    if (!Array.isArray(allListings) || allListings.length === 0) return [];

    return allListings.filter((listing) => {
      const distanceKm = calculateDistance(center[0], center[1], listing.latitude, listing.longitude);
      return distanceKm <= radiusKm;
    });
  }, [allListings, center, radiusKm]);

  const rentStats = useMemo(() => {
    if (!nearbyListings.length) {
      return {
        count: 0,
        minPrice: 0,
        maxPrice: 0,
        avgPrice: 0,
      };
    }

    const prices = nearbyListings.map((l) => l.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;

    return {
      count: nearbyListings.length,
      minPrice,
      maxPrice,
      avgPrice,
    };
  }, [nearbyListings]);

  const targetListing = useMemo(() => {
    if (!nearbyListings.length) return null;
    if (initialListingId) {
      return nearbyListings.find((listing) => String(listing.listingId) === String(initialListingId)) || null;
    }

    let closestListing = nearbyListings[0];
    let closestDistance = calculateDistance(center[0], center[1], closestListing.latitude, closestListing.longitude);

    nearbyListings.forEach((listing) => {
      const distance = calculateDistance(center[0], center[1], listing.latitude, listing.longitude);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestListing = listing;
      }
    });

    return closestListing;
  }, [nearbyListings, initialListingId, center]);

  const fairRentScore = useMemo(() => {
    if (!targetListing || rentStats.count < 2) return null;
    return computeFairRentScore(targetListing.price, rentStats.minPrice, rentStats.maxPrice);
  }, [targetListing, rentStats]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <h1 className="text-3xl font-semibold">Rent Analytics Heatmap</h1>

        <Card>
          <CardHeader>
            <CardTitle>Location & Radius</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Search Location</Label>
              <div className="relative mt-2">
                <Input
                  value={locationSearch}
                  onChange={(e) => {
                    setLocationSearch(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Search area with OpenStreetMap (min 3 chars)"
                />

                {showSuggestions && locationSearch.trim() && (
                  <div className="absolute z-30 mt-1 w-full rounded-md border bg-white shadow-sm max-h-52 overflow-y-auto">
                    {searchingLocation ? (
                      <div className="px-3 py-2 text-sm text-gray-500">Searching OpenStreetMap...</div>
                    ) : locationSuggestions.length > 0 ? (
                      locationSuggestions.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                          onClick={() => {
                            setCenter([item.latitude, item.longitude]);
                            setLocationSearch(item.name);
                            setShowSuggestions(false);
                          }}
                        >
                          {item.name}
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-gray-500">No matching places found</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label>Radius: {radiusKm} km</Label>
              <div className="mt-4 px-2">
                <Slider min={1} max={10} step={1} value={[radiusKm]} onValueChange={(value) => setRadiusKm(value[0])} />
                <div className="flex justify-between mt-2 text-sm text-gray-600">
                  <span>1 km</span>
                  <span>10 km</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Rent Heatmap</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[520px] rounded-lg overflow-hidden border border-gray-200">
                  <MapContainer
                    center={center}
                    zoom={13}
                    scrollWheelZoom
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <Circle center={center} radius={radiusKm * 1000} pathOptions={{ color: '#2563eb', fillColor: '#2563eb', fillOpacity: 0.08 }} />

                    {nearbyListings.map((listing) => {
                      const color = getHeatColor(listing.price, rentStats.minPrice, rentStats.maxPrice);
                      const isTarget = targetListing && String(targetListing.listingId) === String(listing.listingId);

                      return (
                        <CircleMarker
                          key={listing.listingId}
                          center={[listing.latitude, listing.longitude]}
                          radius={isTarget ? 9 : 7}
                          pathOptions={{
                            color,
                            fillColor: color,
                            fillOpacity: isTarget ? 0.95 : 0.8,
                            weight: isTarget ? 3 : 2,
                          }}
                        >
                          <Popup>
                            <div className="text-sm space-y-1">
                              <p className="font-semibold">{listing.title}</p>
                              <p>Rent: {formatCurrency(listing.price)}</p>
                              <p>{listing.location?.area_name || listing.area_name || 'Unknown area'}</p>
                            </div>
                          </Popup>
                        </CircleMarker>
                      );
                    })}

                    <CircleMarker center={center} radius={6} pathOptions={{ color: '#1d4ed8', fillColor: '#1d4ed8', fillOpacity: 1 }}>
                      <Popup>
                        <div className="text-sm">
                          <p className="font-semibold flex items-center gap-1"><MapPin className="h-4 w-4" /> Selected Center</p>
                          <p>Lat: {center[0].toFixed(5)}</p>
                          <p>Lng: {center[1].toFixed(5)}</p>
                        </div>
                      </Popup>
                    </CircleMarker>
                  </MapContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Nearby Rent Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {loading ? (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading listings...
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between"><span>Listings in radius</span><span className="font-semibold">{rentStats.count}</span></div>
                    <div className="flex justify-between"><span>Average rent</span><span className="font-semibold">{formatCurrency(rentStats.avgPrice)}</span></div>
                    <div className="flex justify-between"><span>Lowest rent</span><span className="font-semibold text-green-600">{formatCurrency(rentStats.minPrice)}</span></div>
                    <div className="flex justify-between"><span>Highest rent</span><span className="font-semibold text-red-600">{formatCurrency(rentStats.maxPrice)}</span></div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fair Rent Score (Out of 5)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {!targetListing ? (
                  <p className="text-gray-600">No target listing found in this radius.</p>
                ) : rentStats.count < 2 ? (
                  <p className="text-gray-600">Need at least 2 listings in this radius to compute fair rent score.</p>
                ) : (
                  <>
                    <p className="font-semibold">{targetListing.title}</p>
                    <div className="flex justify-between"><span>Target rent</span><span className="font-semibold">{formatCurrency(targetListing.price)}</span></div>
                    <div className="flex justify-between"><span>Fair rent point</span><span className="font-semibold text-blue-700">{fairRentScore} / 5</span></div>
                    <p className="text-xs text-gray-600">
                      Higher rent in the same radius gets a lower score, lower rent gets a higher score.
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Heatmap Legend</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center justify-between"><span>Low rent</span><span className="h-3 w-6 rounded" style={{ backgroundColor: '#16a34a' }} /></div>
                <div className="flex items-center justify-between"><span>Medium rent</span><span className="h-3 w-6 rounded" style={{ backgroundColor: '#f59e0b' }} /></div>
                <div className="flex items-center justify-between"><span>High rent</span><span className="h-3 w-6 rounded" style={{ backgroundColor: '#dc2626' }} /></div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
