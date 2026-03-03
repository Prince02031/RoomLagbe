import { useEffect, useState } from 'react';
import { ShieldCheck, RefreshCw, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import OwnerDashboard from '../components/OwnerDashboard';
import StudentDashboard from '../components/StudentDashboard';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useApp } from '../context/AppContext';
import adminService from '../services/admin.service';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { currentUser } = useApp();

  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState('');
  const [pendingCounts, setPendingCounts] = useState({
    students: 0,
    owners: 0,
    apartments: 0,
    listings: 0,
  });
  const [recentUserRequests, setRecentUserRequests] = useState([]);

  const fetchAdminVerificationData = async () => {
    if (currentUser?.role !== 'admin') return;

    setAdminLoading(true);
    setAdminError('');

    try {
      const [studentsRes, ownersRes, apartmentsRes, listingsRes] = await Promise.allSettled([
        adminService.getPendingStudents(),
        adminService.getPendingOwners(),
        adminService.getPendingApartments(),
        adminService.getPendingListings(),
      ]);

      const students = studentsRes.status === 'fulfilled' && Array.isArray(studentsRes.value)
        ? studentsRes.value
        : [];
      const owners = ownersRes.status === 'fulfilled' && Array.isArray(ownersRes.value)
        ? ownersRes.value
        : [];
      const apartments = apartmentsRes.status === 'fulfilled' && Array.isArray(apartmentsRes.value)
        ? apartmentsRes.value
        : [];
      const listings = listingsRes.status === 'fulfilled' && Array.isArray(listingsRes.value)
        ? listingsRes.value
        : [];

      setPendingCounts({
        students: students.length,
        owners: owners.length,
        apartments: apartments.length,
        listings: listings.length,
      });

      const mergedUsers = [
        ...students.map((user) => ({ ...user, requestRole: 'student' })),
        ...owners.map((user) => ({ ...user, requestRole: 'owner' })),
      ]
        .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
        .slice(0, 6);

      setRecentUserRequests(mergedUsers);

      if (
        studentsRes.status === 'rejected' ||
        ownersRes.status === 'rejected' ||
        apartmentsRes.status === 'rejected' ||
        listingsRes.status === 'rejected'
      ) {
        setAdminError('Some verification data could not be loaded. Showing available results.');
      }
    } catch (error) {
      setAdminError('Failed to load verification requests.');
    } finally {
      setAdminLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminVerificationData();
  }, [currentUser?.role]);

  const roleBadgeClass = currentUser?.role === 'admin'
    ? 'bg-purple-100 text-purple-700 border-purple-200'
    : currentUser?.role === 'owner'
      ? 'bg-orange-100 text-orange-700 border-orange-200'
      : 'bg-blue-100 text-blue-700 border-blue-200';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-semibold">Dashboard</h1>
            <div className="mt-1 flex items-center gap-2 text-gray-600">
              <p>Welcome back, {currentUser.name}</p>
              <Badge className={roleBadgeClass}>{currentUser.role}</Badge>
            </div>
          </div>
        </div>

        {/* Render role-based dashboard */}
        {currentUser.role === 'owner' ? (
          <OwnerDashboard />
        ) : currentUser.role === 'student' ? (
          <StudentDashboard />
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5" />
                  Admin Verification Overview
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchAdminVerificationData}
                  disabled={adminLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${adminLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {adminError && (
                  <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    {adminError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="rounded-md border bg-white p-4">
                    <p className="text-sm text-gray-500">Student Requests</p>
                    <p className="text-2xl font-semibold mt-1">{pendingCounts.students}</p>
                  </div>
                  <div className="rounded-md border bg-white p-4">
                    <p className="text-sm text-gray-500">Owner Requests</p>
                    <p className="text-2xl font-semibold mt-1">{pendingCounts.owners}</p>
                  </div>
                  <div className="rounded-md border bg-white p-4">
                    <p className="text-sm text-gray-500">Apartment Requests</p>
                    <p className="text-2xl font-semibold mt-1">{pendingCounts.apartments}</p>
                  </div>
                  <div className="rounded-md border bg-white p-4">
                    <p className="text-sm text-gray-500">Listing Requests</p>
                    <p className="text-2xl font-semibold mt-1">{pendingCounts.listings}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Latest User Verification Requests</h3>
                  {adminLoading ? (
                    <p className="text-sm text-gray-500">Loading verification requests...</p>
                  ) : recentUserRequests.length === 0 ? (
                    <p className="text-sm text-gray-500">No pending user verification requests.</p>
                  ) : (
                    <div className="space-y-2">
                      {recentUserRequests.map((request) => (
                        <div
                          key={request.user_id}
                          className="flex items-center justify-between rounded-md border bg-white px-3 py-2"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900">{request.name || 'Unnamed user'}</p>
                            <p className="text-xs text-gray-500">
                              {request.email || 'No email'} • {request.requestRole}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <Button onClick={() => navigate('/admin/verifications')}>View Verifications</Button>
                  <Button onClick={() => navigate('/admin/analytics')} variant="outline">
                    View Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
