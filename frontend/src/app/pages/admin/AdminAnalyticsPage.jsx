import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Circle, CircleMarker, Popup, useMapEvents } from 'react-leaflet';
import { BarChart3, Loader2, MapPin } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Navbar from '../../components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Slider } from '../../components/ui/slider';
import listingService from '../../services/listing.service';
import adminService from '../../services/admin.service';
import { calculateDistance, formatCurrency } from '../../lib/utils';
import { useApp } from '../../context/AppContext';
import { toast } from 'sonner';

const DEFAULT_CENTER = [23.8103, 90.4125];

function getListingPrice(listing) {
  const price = listing?.price_per_person
    ?? listing?.pricePerPerson
    ?? listing?.price_total
    ?? listing?.totalRent
    ?? 0;
  return Number.parseFloat(price) || 0;
}

function getListingArea(listing) {
  return listing?.location?.area_name || listing?.area_name || listing?.location || 'Unknown Area';
}

function groupAreaStats(listings) {
  const map = new Map();

  listings.forEach((listing) => {
    const area = getListingArea(listing);
    const price = getListingPrice(listing);
    if (!price) return;

    if (!map.has(area)) {
      map.set(area, {
        area,
        count: 0,
        totalPrice: 0,
        minPrice: Number.POSITIVE_INFINITY,
        maxPrice: 0,
      });
    }

    const current = map.get(area);
    current.count += 1;
    current.totalPrice += price;
    current.minPrice = Math.min(current.minPrice, price);
    current.maxPrice = Math.max(current.maxPrice, price);
  });

  return Array.from(map.values())
    .map((item) => ({
      ...item,
      avgPrice: item.count ? item.totalPrice / item.count : 0,
    }))
    .sort((a, b) => b.avgPrice - a.avgPrice);
}

function getHeatColor(price, minPrice, maxPrice) {
  if (!price || minPrice === maxPrice) return '#f59e0b';
  const ratio = (price - minPrice) / (maxPrice - minPrice);
  if (ratio >= 0.8) return '#dc2626';
  if (ratio >= 0.6) return '#ea580c';
  if (ratio >= 0.4) return '#f59e0b';
  if (ratio >= 0.2) return '#84cc16';
  return '#16a34a';
}

function MapClickHandler({ onMove }) {
  useMapEvents({
    click(e) {
      onMove([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

export default function AdminAnalyticsPage() {
  const { currentUser } = useApp();

  const [allListings, setAllListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [radiusKm, setRadiusKm] = useState(3);
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [locationSearch, setLocationSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const fetchAllListings = async () => {
      setLoading(true);
      try {
        const response = await listingService.getAll({});
        const listings = Array.isArray(response?.listings)
          ? response.listings
          : Array.isArray(response)
            ? response
            : [];

        setAllListings(listings);
      } catch (error) {
        console.error('Failed to fetch listings analytics:', error);
        toast.error('Failed to load listing analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAllListings();
  }, []);

  useEffect(() => {
    adminService.getAnalyticsSummary()
      .then(setSummary)
      .catch(() => toast.error('Failed to load analytics summary'))
      .finally(() => setSummaryLoading(false));
  }, []);

  useEffect(() => {
    const query = locationSearch.trim();
    if (query.length < 3) {
      setSuggestions([]);
      setSearching(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      setSearching(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&limit=8`,
          {
            signal: controller.signal,
            headers: { Accept: 'application/json' },
          }
        );

        if (!response.ok) {
          setSuggestions([]);
          return;
        }

        const data = await response.json();
        const items = Array.isArray(data)
          ? data
            .map((item, index) => ({
              id: `${index}`,
              name: item.display_name,
              latitude: Number.parseFloat(item.lat),
              longitude: Number.parseFloat(item.lon),
            }))
            .filter((item) => Number.isFinite(item.latitude) && Number.isFinite(item.longitude))
          : [];

        setSuggestions(items);
      } catch (error) {
        if (error.name !== 'AbortError') {
          setSuggestions([]);
        }
      } finally {
        setSearching(false);
      }
    }, 250);

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [locationSearch]);

  const listingsWithCoords = useMemo(() => {
    return allListings
      .map((listing) => {
        const latitude = Number.parseFloat(listing?.latitude ?? listing?.location?.latitude);
        const longitude = Number.parseFloat(listing?.longitude ?? listing?.location?.longitude);
        return {
          ...listing,
          latitude,
          longitude,
        };
      })
      .filter((listing) => Number.isFinite(listing.latitude) && Number.isFinite(listing.longitude));
  }, [allListings]);

  const listingsInRadius = useMemo(() => {
    return listingsWithCoords.filter((listing) => {
      const distance = calculateDistance(center[0], center[1], listing.latitude, listing.longitude);
      return distance <= radiusKm;
    });
  }, [listingsWithCoords, center, radiusKm]);

  const globalAreaStats = summary?.areaStats ?? [];
  const radiusAreaStats = useMemo(() => groupAreaStats(listingsInRadius), [listingsInRadius]);

  const { minPriceInRadius, maxPriceInRadius } = useMemo(() => {
    const prices = listingsInRadius.map(l => getListingPrice(l)).filter(p => p > 0);
    return {
      minPriceInRadius: prices.length ? Math.min(...prices) : 0,
      maxPriceInRadius: prices.length ? Math.max(...prices) : 0,
    };
  }, [listingsInRadius]);

  const highestAreaInRadius = radiusAreaStats.length ? radiusAreaStats[0] : null;
  const lowestAreaInRadius = radiusAreaStats.length ? radiusAreaStats[radiusAreaStats.length - 1] : null;

  const areaBarData = radiusAreaStats.map((area) => ({
    area: area.area,
    averageRent: Math.round(area.avgPrice),
    minRent: Math.round(area.minPrice),
    maxRent: Math.round(area.maxPrice),
  }));

  const chartWidth = Math.max(900, areaBarData.length * 90);

  if (currentUser?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Card>
            <CardContent className="p-6">
              <p className="text-gray-700">This page is only available for admin users.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-7 w-7 text-blue-600" />
          <h1 className="text-3xl font-semibold">Listing Analytics</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Radius-wise Calculation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Choose Center Location</Label>
              <div className="relative mt-2">
                <Input
                  value={locationSearch}
                  onChange={(e) => {
                    setLocationSearch(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Search location via OpenStreetMap"
                />

                {showSuggestions && locationSearch.trim() && (
                  <div className="absolute z-30 mt-1 w-full rounded-md border bg-white shadow-sm max-h-52 overflow-y-auto">
                    {searching ? (
                      <div className="px-3 py-2 text-sm text-gray-500">Searching...</div>
                    ) : suggestions.length > 0 ? (
                      suggestions.map((item) => (
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
                <Slider min={1} max={20} step={1} value={[radiusKm]} onValueChange={(value) => setRadiusKm(value[0])} />
                <div className="flex justify-between mt-2 text-sm text-gray-600">
                  <span>1 km</span>
                  <span>20 km</span>
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-600 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Center: {center[0].toFixed(5)}, {center[1].toFixed(5)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Area Map</CardTitle>
            <p className="text-sm text-gray-500">Dots are color-coded by rent. Click anywhere to move the center.</p>
          </CardHeader>
          <CardContent>
            <div className="h-[480px] rounded-lg overflow-hidden border border-gray-200">
              <MapContainer center={center} zoom={13} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapClickHandler onMove={setCenter} />

                <Circle
                  center={center}
                  radius={radiusKm * 1000}
                  pathOptions={{ color: '#2563eb', fillColor: '#2563eb', fillOpacity: 0.07 }}
                />

                {listingsInRadius.map((listing) => {
                  const price = getListingPrice(listing);
                  const color = getHeatColor(price, minPriceInRadius, maxPriceInRadius);
                  return (
                    <CircleMarker
                      key={listing.listing_id}
                      center={[listing.latitude, listing.longitude]}
                      radius={7}
                      pathOptions={{ color, fillColor: color, fillOpacity: 0.85, weight: 2 }}
                    >
                      <Popup>
                        <div className="text-sm space-y-1">
                          <p className="font-semibold">{listing.apartment_title || listing.room_name || 'Listing'}</p>
                          <p>{formatCurrency(price)}/person</p>
                          <p className="text-gray-500">{getListingArea(listing)}</p>
                          <p className="text-gray-500">{listing.listing_type}</p>
                        </div>
                      </Popup>
                    </CircleMarker>
                  );
                })}

                {listingsWithCoords
                  .filter(l => !listingsInRadius.includes(l))
                  .map((listing) => (
                    <CircleMarker
                      key={listing.listing_id}
                      center={[listing.latitude, listing.longitude]}
                      radius={4}
                      pathOptions={{ color: '#9ca3af', fillColor: '#9ca3af', fillOpacity: 0.4, weight: 1 }}
                    >
                      <Popup>
                        <div className="text-sm space-y-1">
                          <p className="font-semibold">{listing.apartment_title || listing.room_name || 'Listing'}</p>
                          <p>{formatCurrency(getListingPrice(listing))}/person</p>
                          <p className="text-gray-500">{getListingArea(listing)}</p>
                        </div>
                      </Popup>
                    </CircleMarker>
                  ))}

                <CircleMarker center={center} radius={7} pathOptions={{ color: '#1d4ed8', fillColor: '#1d4ed8', fillOpacity: 1, weight: 2 }}>
                  <Popup>
                    <p className="text-sm font-semibold">Center</p>
                    <p className="text-xs text-gray-500">{center[0].toFixed(5)}, {center[1].toFixed(5)}</p>
                  </Popup>
                </CircleMarker>
              </MapContainer>
            </div>
            <div className="flex gap-6 mt-3 text-xs text-gray-600">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-600 inline-block" /> Low rent (in radius)</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-400 inline-block" /> Mid rent</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-600 inline-block" /> High rent</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-gray-400 inline-block" /> Outside radius</span>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>All Listings</CardTitle>
            </CardHeader>
            <CardContent>
              {summaryLoading ? (
                <div className="flex items-center gap-2 text-gray-600"><Loader2 className="h-4 w-4 animate-spin" /> Loading...</div>
              ) : (
                <p className="text-2xl font-semibold">{summary?.totalListings ?? 0}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Listings In Radius</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{listingsInRadius.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Covered Areas In Radius</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{radiusAreaStats.length}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Highest Rent Area (Radius)</CardTitle>
            </CardHeader>
            <CardContent>
              {highestAreaInRadius ? (
                <div className="space-y-1">
                  <p className="text-lg font-semibold">{highestAreaInRadius.area}</p>
                  <p className="text-sm text-gray-600">Avg: {formatCurrency(highestAreaInRadius.avgPrice)}</p>
                  <p className="text-sm text-gray-600">Range: {formatCurrency(highestAreaInRadius.minPrice)} - {formatCurrency(highestAreaInRadius.maxPrice)}</p>
                </div>
              ) : (
                <p className="text-sm text-gray-600">No area data in this radius.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lowest Rent Area (Radius)</CardTitle>
            </CardHeader>
            <CardContent>
              {lowestAreaInRadius ? (
                <div className="space-y-1">
                  <p className="text-lg font-semibold">{lowestAreaInRadius.area}</p>
                  <p className="text-sm text-gray-600">Avg: {formatCurrency(lowestAreaInRadius.avgPrice)}</p>
                  <p className="text-sm text-gray-600">Range: {formatCurrency(lowestAreaInRadius.minPrice)} - {formatCurrency(lowestAreaInRadius.maxPrice)}</p>
                </div>
              ) : (
                <p className="text-sm text-gray-600">No area data in this radius.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Area Rent Comparison (Within Radius)</CardTitle>
          </CardHeader>
          <CardContent>
            {areaBarData.length > 0 ? (
              <div className="overflow-x-auto">
                <div style={{ width: `${chartWidth}px`, minWidth: '100%' }}>
                  <ResponsiveContainer width="100%" height={420}>
                    <BarChart data={areaBarData} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="area" tick={{ fontSize: 12 }} interval={0} angle={-30} textAnchor="end" height={90} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Bar dataKey="averageRent" fill="#2563eb" name="Average Rent" />
                      <Bar dataKey="minRent" fill="#16a34a" name="Min Rent" />
                      <Bar dataKey="maxRent" fill="#dc2626" name="Max Rent" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-600">No chart data for this radius yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Areas By Average Rent (All Listings)</CardTitle>
          </CardHeader>
          <CardContent>
            {globalAreaStats.length > 0 ? (
              <div className="space-y-2">
                {globalAreaStats.slice(0, 8).map((item) => (
                  <div key={item.area} className="flex justify-between items-center rounded border bg-white px-3 py-2">
                    <span className="font-medium">{item.area}</span>
                    <span className="text-sm text-gray-700">{formatCurrency(item.avgPrice)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600">No listing area analytics available.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
