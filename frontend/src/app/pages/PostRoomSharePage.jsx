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
import { mockLocations } from '../lib/mockData';
import { toast } from 'sonner';

export default function PostRoomSharePage() {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const [pricePerPerson, setPricePerPerson] = useState('');
  const [description, setDescription] = useState('');
  const [womenOnly, setWomenOnly] = useState(false);
  const [availableFrom, setAvailableFrom] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Room share listing posted successfully!');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-semibold mb-8">Post Room Share Listing</h1>

        <Card>
          <CardHeader>
            <CardTitle>Room Share Details</CardTitle>
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
                  <Label>Price per Person (BDT)</Label>
                  <Input
                    type="number"
                    value={pricePerPerson}
                    onChange={(e) => setPricePerPerson(e.target.value)}
                    placeholder="5500"
                    className="mt-2"
                    required
                  />
                </div>

                <div>
                  <Label>Available From</Label>
                  <Input
                    type="date"
                    value={availableFrom}
                    onChange={(e) => setAvailableFrom(e.target.value)}
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
                  placeholder="Describe the room and requirements..."
                  className="mt-2"
                  rows={4}
                  required
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
                <Button type="submit">Post Listing</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
