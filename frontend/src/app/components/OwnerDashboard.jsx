import { useNavigate } from 'react-router-dom';
import { Home, Plus, Users, Eye } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useApp } from '../context/AppContext';
import { mockApartments } from '../lib/mockData';
import { formatCurrency, formatDate } from '../lib/utils';

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useApp();
  const userApartments = mockApartments.filter((apt) => apt.ownerId === currentUser.id);

  return (
    <div>
      <div className="flex justify-end mb-8">
        <Button onClick={() => navigate('/create-listing')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Listing
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">My Listings</p>
                <p className="text-2xl font-semibold mt-1">{userApartments.length}</p>
              </div>
              <Home className="h-10 w-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Requests</p>
                <p className="text-2xl font-semibold mt-1">5</p>
              </div>
              <Eye className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Views</p>
                <p className="text-2xl font-semibold mt-1">152</p>
              </div>
              <Users className="h-10 w-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Wishlist Adds</p>
                <p className="text-2xl font-semibold mt-1">23</p>
              </div>
              <Plus className="h-10 w-10 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My Listings */}
      <Tabs defaultValue="listings">
        <TabsList>
          <TabsTrigger value="listings">My Listings</TabsTrigger>
          <TabsTrigger value="requests">Visit Requests</TabsTrigger>
        </TabsList>
        
        <TabsContent value="listings" className="mt-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">My Apartments</h2>
            {userApartments.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-gray-500">
                  No listings yet. Create your first listing to get started!
                </CardContent>
              </Card>
            ) : (
              userApartments.map((apt) => (
                <Card key={apt.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex space-x-4">
                        <img src={apt.photos[0]} alt={apt.location} className="w-24 h-24 rounded object-cover" />
                        <div>
                          <h3 className="font-semibold text-lg">{apt.apartmentType} in {apt.location}</h3>
                          <p className="text-2xl font-semibold text-gray-900 mt-2">{formatCurrency(apt.pricePerPerson)}/person</p>
                          <p className="text-sm text-gray-500 mt-1">Available from {formatDate(apt.availabilityDate)}</p>
                          <div className="flex space-x-2 mt-2">
                            <Badge variant={apt.status === 'available' ? 'default' : 'secondary'}>
                              {apt.status}
                            </Badge>
                            {apt.womenOnly && <Badge>Women Only</Badge>}
                          </div>
                        </div>
                      </div>
                      <Button onClick={() => navigate(`/listing/${apt.id}?type=apartment`)}>
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="requests" className="mt-6">
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              <p>No visit requests at the moment</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}