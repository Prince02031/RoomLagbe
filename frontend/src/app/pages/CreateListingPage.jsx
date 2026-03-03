import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ImagePlus, X } from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMapEvents } from 'react-leaflet';
import Navbar from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import listingService from '../services/listing.service';
import amenityService from '../services/amenity.service';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';
import { Checkbox } from '../components/ui/checkbox';
import { Badge } from '../components/ui/badge';

function LocationPickerMapEvents({ onPick }) {
  useMapEvents({
    click: (event) => {
      onPick(event.latlng);
    },
  });

  return null;
}

export default function CreateListingPage() {
  const navigate = useNavigate();
  const { currentUser } = useApp();
  const isStudent = currentUser?.role === 'student';

  // Form states
  const [title, setTitle] = useState('');
  const [selectedMapLocation, setSelectedMapLocation] = useState(null);
  const [apartmentType, setApartmentType] = useState('');
  const [totalRent, setTotalRent] = useState('');
  const [maxOccupancy, setMaxOccupancy] = useState('');
  const [description, setDescription] = useState('');
  const [womenOnly, setWomenOnly] = useState(false);
  const [availabilityDate, setAvailabilityDate] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [searchingLocations, setSearchingLocations] = useState(false);
  const [searchFocusPoint, setSearchFocusPoint] = useState(null);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [photoItems, setPhotoItems] = useState([]);
  const photoInputRef = useRef(null);

  // Data states
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingAmenities, setFetchingAmenities] = useState(true);

  const locationMapCenter = selectedMapLocation
    ? [selectedMapLocation.latitude, selectedMapLocation.longitude]
    : searchFocusPoint
      ? [searchFocusPoint.latitude, searchFocusPoint.longitude]
      : [23.8103, 90.4125];

  // Fetch amenities on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const amenitiesData = await amenityService.getAll();
        setAmenities(amenitiesData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load form data');
      } finally {
        setFetchingAmenities(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    return () => {
      photoItems.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, [photoItems]);

  useEffect(() => {
    const query = locationSearch.trim();
    if (query.length < 3) {
      setLocationSuggestions([]);
      setSearchingLocations(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      setSearchingLocations(true);
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
          setLocationSuggestions([]);
          return;
        }

        const data = await response.json();
        const suggestions = Array.isArray(data)
          ? data
            .map((item) => ({
              label: item.display_name,
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
        setSearchingLocations(false);
      }
    }, 250);

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [locationSearch]);

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setPhotoItems((prev) => {
      const remainingSlots = Math.max(10 - prev.length, 0);
      const nextFiles = files.slice(0, remainingSlots);
      const nextItems = nextFiles.map((file) => ({
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
        file,
        previewUrl: URL.createObjectURL(file),
      }));
      return [...prev, ...nextItems];
    });

    e.target.value = '';
  };

  const removePhoto = (photoId) => {
    setPhotoItems((prev) => {
      const target = prev.find((item) => item.id === photoId);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((item) => item.id !== photoId);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedMapLocation) {
      toast.error('Please choose a location from the map');
      return;
    }

    setLoading(true);

    try {
      // Calculate price per person
      const pricePerPerson = Math.ceil(Number(totalRent) / Number(maxOccupancy));

      // Prepare listing data
      const listingData = {
        listing_type: isStudent ? 'room_share' : 'apartment',
        latitude: selectedMapLocation.latitude,
        longitude: selectedMapLocation.longitude,
        area_name: selectedMapLocation.areaName,
        title: title,
        description: description,
        price_total: Number(totalRent),
        price_per_person: pricePerPerson,
        women_only: womenOnly,
        apartment_type: apartmentType,
        max_occupancy: Number(maxOccupancy),
        available_from: availabilityDate,
        amenities: selectedAmenities,
        // For students, the backend will auto-create a room using these details
        room_name: isStudent ? title : undefined
      };

      // Create the listing
      const createdListing = await listingService.create(listingData);

      const createdListingId = createdListing?.listing_id || createdListing?.id;
      if (createdListingId && photoItems.length > 0) {
        const files = photoItems.map((item) => item.file);
        try {
          await listingService.uploadPhotos(createdListingId, files);
          toast.success('Listing created successfully!');
        } catch (uploadError) {
          const uploadMessage = uploadError?.error || uploadError?.message || 'Photo upload failed';
          toast.error(`Listing created, but photo upload failed: ${uploadMessage}`);
        }
      } else {
        toast.success('Listing created successfully!');
      }

      // Redirect to search page to see the new listing
      navigate('/search');
    } catch (error) {
      console.error('Error creating listing:', error);
      const errorMessage = error.message || 'Failed to create listing. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const reverseGeocode = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}`,
        { headers: { Accept: 'application/json' } }
      );

      if (!response.ok) {
        return `Pinned location (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`;
      }

      const data = await response.json();
      return data?.display_name || `Pinned location (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`;
    } catch (error) {
      return `Pinned location (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`;
    }
  };

  const handleMapPick = async ({ lat, lng }) => {
    const areaName = await reverseGeocode(lat, lng);
    setSelectedMapLocation({
      latitude: lat,
      longitude: lng,
      areaName,
    });
    setLocationSearch(areaName);
    setLocationSuggestions([]);
    setShowLocationSuggestions(false);
    setSearchFocusPoint({ latitude: lat, longitude: lng });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-semibold mb-8">
          {isStudent ? 'Create Room Listing' : 'Create Apartment Listing'}
        </h1>

        <Card>
          <CardHeader>
            <CardTitle>Listing Details</CardTitle>
          </CardHeader>
          <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Photo Upload - moved to top */}
                <div className="col-span-full">
                  <Label>Listing Photos (up to 10, images only)</Label>
                  <div className="mt-2 space-y-3">
                    <input
                      type="file"
                      id="listing-photo-upload"
                      accept="image/*"
                      multiple
                      ref={photoInputRef}
                      onChange={handlePhotoChange}
                      disabled={loading}
                      className="hidden"
                    />

                    <label
                      htmlFor="listing-photo-upload"
                      className="block border-2 border-dashed border-gray-300 rounded-md p-6 text-center bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center gap-2 text-gray-600">
                        <ImagePlus className="h-6 w-6" />
                        <p className="text-sm font-medium">Click to upload listing photos</p>
                        <p className="text-xs text-gray-500">JPG, PNG, WEBP • max 10 images</p>
                      </div>
                    </label>

                    {photoItems.length > 0 && (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                        {photoItems.map((item, idx) => (
                          <div key={item.id} className="relative rounded-md border overflow-hidden bg-white">
                            <img
                              src={item.previewUrl}
                              alt={`Preview ${idx + 1}`}
                              className="w-full h-24 object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removePhoto(item.id)}
                              className="absolute top-1 right-1 inline-flex items-center justify-center h-6 w-6 rounded-full bg-black/70 text-white hover:bg-black"
                              aria-label="Remove image"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <p className="text-xs text-gray-500">
                      {photoItems.length}/10 images selected
                    </p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Title Field */}
                  <div className="col-span-full">
                    <Label>Listing Title *</Label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={isStudent ? "e.g., Master Room in a 3BHK Flat" : "e.g., Beautiful 2BHK Apartment near IUT"}
                      className="mt-2"
                      required
                    />
                  </div>

                  <div className="col-span-full">
                    <Label>Choose Location from Map *</Label>
                    <div className="relative z-50 mt-2">
                      <Input
                        value={locationSearch}
                        onChange={(e) => {
                          setLocationSearch(e.target.value);
                          setShowLocationSuggestions(true);
                        }}
                        onFocus={() => setShowLocationSuggestions(true)}
                        placeholder="Search places via OpenStreetMap (min 3 chars)"
                      />

                      {showLocationSuggestions && locationSearch.trim() && (
                        <div className="absolute z-[1000] mt-1 w-full rounded-md border bg-white shadow-sm max-h-52 overflow-y-auto">
                          {searchingLocations ? (
                            <div className="px-3 py-2 text-sm text-gray-500">Searching OpenStreetMap...</div>
                          ) : locationSuggestions.length > 0 ? (
                            locationSuggestions.map((suggestion, index) => (
                              <button
                                key={`${suggestion.label}-${index}`}
                                type="button"
                                onClick={() => {
                                  setLocationSearch(suggestion.label);
                                  setLocationSuggestions([]);
                                  setShowLocationSuggestions(false);
                                  setSearchFocusPoint({
                                    latitude: suggestion.latitude,
                                    longitude: suggestion.longitude,
                                  });
                                  setSelectedMapLocation({
                                    latitude: suggestion.latitude,
                                    longitude: suggestion.longitude,
                                    areaName: suggestion.label,
                                  });
                                }}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                              >
                                {suggestion.label}
                              </button>
                            ))
                          ) : (
                            <div className="px-3 py-2 text-sm text-gray-500">No matching places on OpenStreetMap</div>
                          )}
                        </div>
                      )}
                    </div>

                    <p className="mt-2 text-xs text-gray-500">Suggestions are powered by OpenStreetMap.</p>

                    <div className="relative z-0 mt-2 h-[280px] rounded-md overflow-hidden border bg-white">
                      <MapContainer
                        center={locationMapCenter}
                        zoom={13}
                        scrollWheelZoom={true}
                        className="h-full w-full z-0"
                      >
                          <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          />

                          <LocationPickerMapEvents onPick={handleMapPick} />

                          {selectedMapLocation && (
                            <CircleMarker
                              center={[selectedMapLocation.latitude, selectedMapLocation.longitude]}
                              radius={10}
                              pathOptions={{
                                color: '#1d4ed8',
                                fillColor: '#3b82f6',
                                fillOpacity: 0.9,
                              }}
                            >
                              <Popup>
                                <div className="space-y-1 min-w-[160px]">
                                  <p className="font-medium text-sm">Selected Location</p>
                                  <p className="text-xs text-gray-600">{selectedMapLocation.areaName}</p>
                                </div>
                              </Popup>
                            </CircleMarker>
                          )}
                      </MapContainer>
                    </div>
                  </div>

                  <div>
                    <Label>Apartment Type *</Label>
                    <Select value={apartmentType} onValueChange={setApartmentType} required>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1BHK">1BHK</SelectItem>
                        <SelectItem value="2BHK">2BHK</SelectItem>
                        <SelectItem value="3BHK">3BHK</SelectItem>
                        <SelectItem value="4BHK">4BHK</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Total Rent (BDT) *</Label>
                    <Input
                      type="number"
                      value={totalRent}
                      onChange={(e) => setTotalRent(e.target.value)}
                      placeholder="18000"
                      className="mt-2"
                      min="0"
                      required
                    />
                  </div>

                  <div>
                    <Label>Maximum Occupancy *</Label>
                    <Input
                      type="number"
                      value={maxOccupancy}
                      onChange={(e) => setMaxOccupancy(e.target.value)}
                      placeholder="3"
                      className="mt-2"
                      min="1"
                      required
                    />
                  </div>

                  <div>
                    <Label>Availability Date *</Label>
                    <Input
                      type="date"
                      value={availabilityDate}
                      onChange={(e) => setAvailabilityDate(e.target.value)}
                      className="mt-2"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Women Only</Label>
                    <Switch checked={womenOnly} onCheckedChange={setWomenOnly} />
                  </div>

                  <div className="col-span-full">
                    <Label>Description * ({isStudent
                        ? 'Provide details about the room and flatmates to find the right roommate'
                        : 'Provide detailed information about your property to attract potential tenants'})</Label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="mt-2 h-[120px] w-full resize-none overflow-y-auto"
                      rows={4}
                      required
                    />
                  </div>

                  {/* Amenities Selection */}
                  <div className="col-span-full">
                    <Label>Amenities (Optional)</Label>
                    {fetchingAmenities ? (
                      <div className="flex items-center py-4">
                        <Loader2 className="h-4 w-4 animate-spin text-blue-600 mr-2" />
                        <span className="text-sm text-gray-600">Loading amenities...</span>
                      </div>
                    ) : amenities.length === 0 ? (
                      <div className="mt-2 p-4 bg-gray-50 rounded-md border border-gray-200">
                        <p className="text-sm text-gray-500">No amenities available. Please contact admin to add amenities to the system.</p>
                      </div>
                    ) : (
                      <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-3">
                        {amenities.map((amenity) => (
                          <div
                            key={amenity.amenity_id}
                            className="flex items-center space-x-2 p-2 border rounded-md hover:bg-gray-50"
                          >
                            <Checkbox
                              id={`amenity-${amenity.amenity_id}`}
                              checked={selectedAmenities.includes(amenity.amenity_id)}
                              onCheckedChange={(checked) => {
                                setSelectedAmenities(prev =>
                                  checked
                                    ? [...prev, amenity.amenity_id]
                                    : prev.filter(id => id !== amenity.amenity_id)
                                );
                              }}
                            />
                            <label
                              htmlFor={`amenity-${amenity.amenity_id}`}
                              className="text-sm cursor-pointer flex-1"
                            >
                              {amenity.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                    {selectedAmenities.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {selectedAmenities.map(amenityId => {
                          const amenity = amenities.find(a => a.amenity_id === amenityId);
                          return amenity ? (
                            <Badge key={amenityId} variant="secondary">
                              {amenity.name}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>

                  {/* Price Per Person Preview */}
                  {totalRent && maxOccupancy && Number(maxOccupancy) > 0 && (
                    <div className="col-span-full bg-blue-50 border border-blue-200 rounded-md p-4">
                      <p className="text-sm text-blue-900">
                        <strong>Price per person:</strong> ৳{Math.ceil(Number(totalRent) / Number(maxOccupancy))}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(-1)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Listing'
                    )}
                  </Button>
                </div>
              </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
