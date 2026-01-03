import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { mockLocations, mockAmenities } from '../lib/mockData';
import { toast } from 'sonner';

export default function CreateListingPage() {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const [apartmentType, setApartmentType] = useState('');
  const [totalRent, setTotalRent] = useState('');
  const [maxOccupancy, setMaxOccupancy] = useState('');
  const [description, setDescription] = useState('');
  const [womenOnly, setWomenOnly] = useState(false);
  const [availabilityDate, setAvailabilityDate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Listing created successfully!');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-semibold mb-8">Create Apartment Listing</h1>

        <Card>
          <CardHeader>
            <CardTitle>Listing Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label>Location</Label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockLocations.map((loc) => (
                        <SelectItem key={loc.id} value={loc.name}>
                          {loc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Apartment Type</Label>
                  <Select value={apartmentType} onValueChange={setApartmentType}>
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
                  <Label>Total Rent (BDT)</Label>
                  <Input
                    type="number"
                    value={totalRent}
                    onChange={(e) => setTotalRent(e.target.value)}
                    placeholder="18000"
                    className="mt-2"
                    required
                  />
                </div>

                <div>
                  <Label>Maximum Occupancy</Label>
                  <Input
                    type="number"
                    value={maxOccupancy}
                    onChange={(e) => setMaxOccupancy(e.target.value)}
                    placeholder="3"
                    className="mt-2"
                    required
                  />
                </div>

                <div>
                  <Label>Availability Date</Label>
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
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your property..."
                  className="mt-2"
                  rows={4}
                  required
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
                <Button type="submit">Create Listing</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
