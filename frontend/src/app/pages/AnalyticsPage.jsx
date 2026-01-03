import Navbar from '../components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, Home, Heart, TrendingUp } from 'lucide-react';
import { mockAnalyticsData } from '../lib/mockData';

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-semibold mb-8">Analytics Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-semibold mt-1">{mockAnalyticsData.totalUsers}</p>
                </div>
                <Users className="h-10 w-10 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Listings</p>
                  <p className="text-2xl font-semibold mt-1">{mockAnalyticsData.totalListings}</p>
                </div>
                <Home className="h-10 w-10 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Weekly Active Users</p>
                  <p className="text-2xl font-semibold mt-1">{mockAnalyticsData.weeklyActiveUsers}</p>
                </div>
                <TrendingUp className="h-10 w-10 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Top Wishlisted</p>
                  <p className="text-2xl font-semibold mt-1">{mockAnalyticsData.topWishlisted[0].count}</p>
                </div>
                <Heart className="h-10 w-10 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rent by Area Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Average Rent by Area</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={mockAnalyticsData.areaRentStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="area" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="avgRent" fill="#3b82f6" name="Average Rent" />
                <Bar dataKey="minRent" fill="#10b981" name="Min Rent" />
                <Bar dataKey="maxRent" fill="#ef4444" name="Max Rent" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Wishlisted */}
        <Card>
          <CardHeader>
            <CardTitle>Most Wishlisted Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockAnalyticsData.topWishlisted.map((item, index) => (
                <div key={item.listingId} className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">
                      {index + 1}. {item.name}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Heart className="h-4 w-4 text-red-600" />
                    <span className="font-semibold">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
