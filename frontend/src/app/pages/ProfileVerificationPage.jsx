import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useApp } from '../context/AppContext';
import VerificationForm from './VerificationForm.jsx';

export default function ProfileVerificationPage() {
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useApp();

  useEffect(() => {
    if (!currentUser) return;

    if (currentUser.role !== 'student' && currentUser.role !== 'owner') {
      navigate('/profile', { replace: true });
      return;
    }

    if (currentUser.verification_status === 'pending' || currentUser.verification_status === 'verified') {
      navigate('/profile', { replace: true });
    }
  }, [currentUser, navigate]);

  if (!currentUser) {
    return null;
  }

  const handleSuccess = (user) => {
    setCurrentUser(user);
    navigate('/profile');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-semibold mb-2">Apply for Verification</h1>
        <p className="text-gray-600 mb-8">
          {currentUser.role === 'student'
            ? 'Submit your student information and upload your student ID.'
            : 'Submit your owner information and upload your verification document.'}
        </p>

        <Card>
          <CardHeader>
            <CardTitle>Verification Details</CardTitle>
          </CardHeader>
          <CardContent>
            <VerificationForm
              role={currentUser.role}
              onSuccess={handleSuccess}
              onCancel={() => navigate('/profile')}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
