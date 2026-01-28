import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import listingService from '../services/listing.service';
import locationService from '../services/location.service';
import amenityService from '../services/amenity.service';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';
import { Checkbox } from '../components/ui/checkbox';
import { Badge } from '../components/ui/badge';

export default function CreateListingPage() {
  const navigate = useNavigate();
  const { currentUser } = useApp();
  const isStudent = currentUser?.role === 'student';

  // Form states
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [apartmentType, setApartmentType] = useState('');
  const [totalRent, setTotalRent] = useState('');
  const [maxOccupancy, setMaxOccupancy] = useState('');
  const [description, setDescription] = useState('');
  const [womenOnly, setWomenOnly] = useState(false);
  const [availabilityDate, setAvailabilityDate] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState([]);

  // Data states
  const [locations, setLocations] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingLocations, setFetchingLocations] = useState(true);
  const [fetchingAmenities, setFetchingAmenities] = useState(true);

  // Fetch locations and amenities on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [locationsData, amenitiesData] = await Promise.all([
          locationService.getAll(),
          amenityService.getAll()
        ]);
        setLocations(locationsData.locations || locationsData);
        setAmenities(amenitiesData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load form data');
      } finally {
        setFetchingLocations(false);
        setFetchingAmenities(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Calculate price per person
      const pricePerPerson = Math.ceil(Number(totalRent) / Number(maxOccupancy));

      // Prepare listing data
      const listingData = {
        listing_type: isStudent ? 'room_share' : 'apartment',
        location_id: location,
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
      await listingService.create(listingData);

      toast.success('Listing created successfully!');

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
            {fetchingLocations ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Loading locations...</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
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

                  <div>
                    <Label>Location *</Label>
                    <Select value={location} onValueChange={setLocation} required>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {locations.map((loc) => (
                          <SelectItem key={loc.location_id} value={loc.location_id}>
                            {loc.area_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
