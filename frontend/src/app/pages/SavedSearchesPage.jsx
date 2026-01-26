import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useApp } from '../context/AppContext';
import { formatDate } from '../lib/utils';
import { toast } from 'sonner';

export default function SavedSearchesPage() {
  const navigate = useNavigate();
  const { savedSearches, removeSavedSearch } = useApp();

  const handleDelete = async (id) => {
    try {
      await removeSavedSearch(id);
      toast.success('Search deleted');
    } catch (error) {
      toast.error('Failed to delete search');
    }
  };

  const handleExecuteSearch = (search) => {
    const params = new URLSearchParams();
    const criteria = search.criteria || search.filters || {};
    if (criteria.location) params.set('location', criteria.location);
    if (criteria.listingType) params.set('type', criteria.listingType);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-semibold mb-8">Saved Searches</h1>

        {savedSearches.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-gray-500">
              <p className="text-lg">No saved searches yet</p>
              <p className="text-sm mt-2">Save your search filters to reuse them later</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {savedSearches.map((search) => {
              const criteria = search.criteria || {};
              const searchId = search.saved_search_id || search.id;
              const searchName = search.name || `Search on ${new Date(search.created_at || search.createdAt).toLocaleDateString()}`;
              return (
                <Card key={searchId}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{searchName}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Created on {formatDate(search.created_at || search.createdAt)}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {criteria.location && (
                            <Badge variant="outline">Location: {criteria.location}</Badge>
                          )}
                          {criteria.min_price !== undefined || criteria.minPrice !== undefined ? (
                            <Badge variant="outline">
                              Price: ৳{criteria.min_price || criteria.minPrice || 0} - ৳{criteria.max_price || criteria.maxPrice || 15000}
                            </Badge>
                          ) : null}
                          {criteria.listing_type && (
                            <Badge variant="outline">Type: {criteria.listing_type}</Badge>
                          )}
                          {criteria.listingType && criteria.listingType !== 'all' && (
                            <Badge variant="outline">Type: {criteria.listingType}</Badge>
                          )}
                          {criteria.women_only && (
                            <Badge variant="outline">Women Only</Badge>
                          )}
                          {criteria.womenOnly && (
                            <Badge variant="outline">Women Only</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button onClick={() => handleExecuteSearch(search)}>
                          Search Again
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(searchId)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
