import { useNavigate } from 'react-router-dom';
import { Home, Search, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-8xl font-bold text-blue-600 leading-none">404</p>
        <h1 className="text-2xl font-semibold text-gray-900 mt-4">Page not found</h1>
        <p className="text-gray-500 mt-2">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 mt-8 justify-center">
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
          <Button onClick={() => navigate('/')}>
            <Home className="h-4 w-4 mr-2" />
            Home
          </Button>
          <Button onClick={() => navigate('/search')} variant="outline">
            <Search className="h-4 w-4 mr-2" />
            Search Listings
          </Button>
        </div>
      </div>
    </div>
  );
}
