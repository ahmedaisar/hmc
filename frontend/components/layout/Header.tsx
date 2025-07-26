'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X, User, LogOut, Settings, Calendar, Heart } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [pathname]);

  const navigation = [
    { name: 'Hotels', href: '/hotels' },
    { name: 'Destinations', href: '/destinations' },
    { name: 'Experiences', href: '/experiences' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const userNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: User },
    { name: 'My Bookings', href: '/dashboard/bookings', icon: Calendar },
    { name: 'Wishlist', href: '/dashboard/wishlist', icon: Heart },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <Logo className={`h-8 w-auto ${isScrolled ? 'text-primary-600' : 'text-white'}`} />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex lg:items-center lg:space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary-600 ${
                  isScrolled
                    ? 'text-gray-900'
                    : 'text-white hover:text-primary-200'
                } ${
                  pathname === item.href
                    ? 'text-primary-600'
                    : ''
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden lg:flex lg:items-center lg:space-x-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={`flex items-center space-x-2 text-sm font-medium transition-colors ${
                    isScrolled
                      ? 'text-gray-900 hover:text-primary-600'
                      : 'text-white hover:text-primary-200'
                  }`}
                >
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {user?.firstName?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <span>{user?.firstName}</span>
                </button>

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    {userNavigation.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Icon className="w-4 h-4 mr-3" />
                          {item.name}
                        </Link>
                      );
                    })}
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/auth/login"
                  className={`text-sm font-medium transition-colors ${
                    isScrolled
                      ? 'text-gray-900 hover:text-primary-600'
                      : 'text-white hover:text-primary-200'
                  }`}
                >
                  Sign in
                </Link>
                <Button
                  asChild
                  variant={isScrolled ? 'primary' : 'outline'}
                  size="sm"
                >
                  <Link href="/auth/register">Get Started</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-2 rounded-md transition-colors ${
                isScrolled
                  ? 'text-gray-900 hover:text-primary-600'
                  : 'text-white hover:text-primary-200'
              }`}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white rounded-lg shadow-lg mt-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-3 py-2 text-base font-medium text-gray-900 hover:text-primary-600 hover:bg-gray-50 rounded-md ${
                    pathname === item.href
                      ? 'text-primary-600 bg-primary-50'
                      : ''
                  }`}
                >
                  {item.name}
                </Link>
              ))}

              <hr className="my-2" />

              {isAuthenticated ? (
                <div className="space-y-1">
                  <div className="px-3 py-2 text-sm font-medium text-gray-500">
                    {user?.firstName} {user?.lastName}
                  </div>
                  {userNavigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="flex items-center px-3 py-2 text-base font-medium text-gray-900 hover:text-primary-600 hover:bg-gray-50 rounded-md"
                      >
                        <Icon className="w-5 h-5 mr-3" />
                        {item.name}
                      </Link>
                    );
                  })}
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-900 hover:text-primary-600 hover:bg-gray-50 rounded-md"
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  <Link
                    href="/auth/login"
                    className="block px-3 py-2 text-base font-medium text-gray-900 hover:text-primary-600 hover:bg-gray-50 rounded-md"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/auth/register"
                    className="block px-3 py-2 text-base font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}