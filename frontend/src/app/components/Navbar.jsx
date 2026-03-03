import { Link, useNavigate } from 'react-router-dom';
import { Home, Search, Heart, Bookmark, LayoutDashboard, BarChart3, User, LogOut, LogIn, ShieldCheck, Bell } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
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
import notificationService from '../services/notification.service';
import { toast } from 'sonner';

export default function Navbar() {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated, logout } = useApp();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const fetchNotifications = async () => {
    if (!isAuthenticated || currentUser?.role !== 'student') {
      setUnreadNotifications(0);
      setNotifications([]);
      return;
    }

    try {
      setNotificationsLoading(true);
      const data = await notificationService.getMyNotifications();
      const rows = Array.isArray(data) ? data : [];
      setNotifications(rows);
      setUnreadNotifications(rows.filter((n) => !n.is_read).length);
    } catch (error) {
      console.error('Error loading navbar notifications:', error);
    } finally {
      setNotificationsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [isAuthenticated, currentUser?.role]);

  useEffect(() => {
    if (notificationsOpen) {
      fetchNotifications();
    }
  }, [notificationsOpen]);

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
                {currentUser?.role === 'student' && (
                  <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative">
                        <Bell className="h-4 w-4 mr-2" />
                        Notifications
                        {unreadNotifications > 0 && (
                          <span className="ml-2 inline-flex items-center justify-center min-w-5 h-5 rounded-full bg-blue-600 text-white text-xs px-1.5">
                            {unreadNotifications}
                          </span>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[420px] p-3" align="end" sideOffset={8}>
                      <div className="flex items-center justify-between pb-2">
                        <p className="font-semibold text-sm">Notifications</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            try {
                              await notificationService.markAllAsRead();
                              setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
                              setUnreadNotifications(0);
                              toast.success('All notifications marked as read');
                            } catch (error) {
                              console.error('Error marking notifications:', error);
                              toast.error('Failed to mark notifications as read');
                            }
                          }}
                          disabled={unreadNotifications === 0}
                        >
                          Mark all read
                        </Button>
                      </div>

                      <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-1">
                        {notificationsLoading ? (
                          <p className="text-sm text-gray-500">Loading notifications...</p>
                        ) : notifications.length === 0 ? (
                          <p className="text-sm text-gray-500">No notifications yet.</p>
                        ) : (
                          notifications.map((notification) => (
                            <Card key={notification.notification_id} className={!notification.is_read ? 'border-blue-200 bg-blue-50/30' : ''}>
                              <CardContent className="p-4 flex items-start justify-between gap-3">
                                <div>
                                  <p className="font-semibold text-sm text-gray-900">{notification.title}</p>
                                  <p className="text-sm text-gray-700 mt-1">{notification.message}</p>
                                  <p className="text-xs text-gray-500 mt-2">{new Date(notification.created_at).toLocaleString()}</p>
                                </div>
                                {!notification.is_read && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={async () => {
                                      try {
                                        await notificationService.markAsRead(notification.notification_id);
                                        setNotifications((prev) =>
                                          prev.map((item) =>
                                            item.notification_id === notification.notification_id
                                              ? { ...item, is_read: true }
                                              : item
                                          )
                                        );
                                        setUnreadNotifications((prev) => Math.max(0, prev - 1));
                                      } catch (error) {
                                        console.error('Error marking notification as read:', error);
                                        toast.error('Failed to update notification');
                                      }
                                    }}
                                  >
                                    Mark read
                                  </Button>
                                )}
                              </CardContent>
                            </Card>
                          ))
                        )}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                {currentUser?.role === 'admin' && (
                  <>
                    <Button variant="ghost" onClick={() => navigate('/admin/verifications')}>
                      <ShieldCheck className="h-4 w-4 mr-2" />
                      Verifications
                    </Button>
                    <Button variant="ghost" onClick={() => navigate('/admin/analytics')}>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Analytics
                    </Button>
                  </>
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
