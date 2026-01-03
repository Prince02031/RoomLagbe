import { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { currentUser, setCurrentUser } = useApp();
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [phone, setPhone] = useState(currentUser.phone);

  const handleSave = (e) => {
    e.preventDefault();
    setCurrentUser({ ...currentUser, name, email, phone });
    toast.success('Profile updated successfully');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-semibold mb-8">My Profile</h1>

        <div className="space-y-6">
          {/* Profile Info */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Account Information</CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge className="capitalize">{currentUser.role}</Badge>
                  {currentUser.verified && (
                    <Badge variant="outline" className="text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <Label>Full Name</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Phone</Label>
                  <Input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <Button type="submit">Save Changes</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-semibold">5</p>
                  <p className="text-sm text-gray-600">Listings</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold">12</p>
                  <p className="text-sm text-gray-600">Wishlist Items</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold">8</p>
                  <p className="text-sm text-gray-600">Saved Searches</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
