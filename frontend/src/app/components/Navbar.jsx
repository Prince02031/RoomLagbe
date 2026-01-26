import { Link, useNavigate } from 'react-router-dom';
import { Home, Search, Heart, Bookmark, LayoutDashboard, BarChart3, User, LogOut, LogIn } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback } from './ui/avatar';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';

export default function Navbar() {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated, logout } = useApp();

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <Home className="h-6 w-6" />
            </div>
            <span className="text-xl font-semibold text-gray-900">RoomLagbe</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/search')}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            {isAuthenticated && (
              <>
                {currentUser?.role === 'student' && (
                  <Button variant="ghost" onClick={() => navigate('/wishlist')}>
                    <Heart className="h-4 w-4 mr-2" />
                    Wishlist
                  </Button>
                )}
                <Button variant="ghost" onClick={() => navigate('/saved-searches')}>
                  <Bookmark className="h-4 w-4 mr-2" />
                  Saved Searches
                </Button>
                <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
                {currentUser?.role === 'admin' && (
                  <Button variant="ghost" onClick={() => navigate('/analytics')}>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Analytics
                  </Button>
                )}
              </>
            )}
          </div>

          {/* User Menu */}
          {isAuthenticated && currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarFallback className="bg-blue-600 text-white">
                      {getInitials(currentUser.name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p>{currentUser.name}</p>
                    <p className="text-xs text-gray-500">{currentUser.email}</p>
                    <p className="text-xs text-blue-600 capitalize">{currentUser.role}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => navigate('/login')}>
              <LogIn className="h-4 w-4 mr-2" />
              Login
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
