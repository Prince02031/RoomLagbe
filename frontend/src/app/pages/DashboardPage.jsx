import { Home, Plus, Users, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import OwnerDashboard from '../components/OwnerDashboard';
import StudentDashboard from '../components/StudentDashboard';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useApp } from '../context/AppContext';
import { mockApartments, mockRoomShareListings } from '../lib/mockData';
import { formatCurrency, formatDate } from '../lib/utils';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { currentUser } = useApp();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-semibold">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {currentUser.name} ({currentUser.role})
            </p>
          </div>
        </div>

        {/* Render role-based dashboard */}
        {currentUser.role === 'owner' ? (
          <OwnerDashboard />
        ) : currentUser.role === 'student' ? (
          <StudentDashboard />
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500">Admin dashboard coming soon...</p>
              <Button onClick={() => navigate('/analytics')} className="mt-4">
                View Analytics
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
