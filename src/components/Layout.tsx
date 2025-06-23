import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Heart, Church, BookOpen, Gift, HelpingHand as PrayingHands, Image, User, Menu, X, MessageCircle } from 'lucide-react';
import BackToTop from './BackToTop';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const navigation = [
    { name: 'Home', href: '/', icon: Church },
    { name: 'Gallery', href: '/gallery', icon: Image },
    { name: 'Devotions', href: '/devotions', icon: BookOpen },
    { name: 'Resources', href: '/resources', icon: Heart },
    { name: 'Give', href: '/give', icon: Gift },
    { name: 'Prayer', href: '/prayer', icon: PrayingHands },
  ];

  const whatsappNumber = '+256772828625';
  const whatsappMessage = 'Hello! I would like to connect with River of Life Ministries.';

  const openWhatsApp = () => {
    const encodedMessage = encodeURIComponent(whatsappMessage);
    const whatsappUrl = `https://wa.me/${whatsappNumber.replace('+', '')}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50">
      {/* Header - Sticky on large screens */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-lg border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-orange-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <Church className="w-6 h-6 text-white" />
              </div>
              {/* Show "ROL" on large screens, "River Of Life" on smaller screens */}
              <span className="hidden lg:block text-xl font-bold bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">
                ROL
              </span>
              <span className="lg:hidden text-xl font-bold bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">
                River Of Life
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                      isActive(item.href)
                        ? 'text-white bg-gradient-to-r from-purple-600 to-orange-500 shadow-lg transform scale-105'
                        : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50 hover:scale-105'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Right Side - WhatsApp */}
            <div className="hidden lg:flex items-center space-x-2">
              <button
                onClick={openWhatsApp}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transition-all duration-300 hover:scale-105 shadow-lg"
                title="Chat with us on WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-gray-700 hover:text-purple-600 hover:bg-purple-50 transition-all duration-300 z-50 relative"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          
          {/* Menu Panel */}
          <div
            ref={mobileMenuRef}
            className="absolute top-0 right-0 w-80 max-w-[85vw] h-full bg-white shadow-2xl transform transition-transform duration-300 ease-out overflow-y-auto"
          >
            <div className="p-6 h-full">
              {/* Header */}
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-orange-500 rounded-lg flex items-center justify-center">
                    <Church className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">
                    River Of Life
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-2 mb-6">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 ${
                        isActive(item.href)
                          ? 'text-white bg-gradient-to-r from-purple-600 to-orange-500 shadow-lg'
                          : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
              
              {/* Action Buttons */}
              <div className="pt-4 border-t border-gray-200 space-y-3">
                <button
                  onClick={openWhatsApp}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>WhatsApp Chat</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="relative">{children}</main>

      {/* Back to Top Button */}
      <BackToTop />

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Church className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">River of Life Ministries</span>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                A vibrant church community dedicated to spreading God's love and building faith in our community through worship, fellowship, and service.
              </p>
              <div className="flex space-x-4">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                  <Heart className="w-6 h-6 text-purple-300" />
                </div>
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                  <BookOpen className="w-6 h-6 text-orange-300" />
                </div>
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                  <PrayingHands className="w-6 h-6 text-purple-300" />
                </div>
                <button
                  onClick={openWhatsApp}
                  className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center hover:from-green-600 hover:to-green-700 transition-all duration-300 hover:scale-110 shadow-lg"
                  title="Chat with us on WhatsApp"
                >
                  <MessageCircle className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-6 text-transparent bg-gradient-to-r from-purple-300 to-orange-300 bg-clip-text">Contact Us</h3>
              <div className="space-y-4 text-gray-300">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center">
                    <span className="text-purple-300">@</span>
                  </div>
                  <span>{import.meta.env.VITE_CONTACT_EMAIL}</span>
                </div>
                <button
                  onClick={openWhatsApp}
                  className="flex items-center space-x-3 text-gray-300 hover:text-green-400 transition-colors group"
                >
                  <div className="w-8 h-8 bg-green-600/20 rounded-lg flex items-center justify-center group-hover:bg-green-600/30 transition-colors">
                    <MessageCircle className="w-4 h-4 text-green-400" />
                  </div>
                  <span>{whatsappNumber}</span>
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-6 text-transparent bg-gradient-to-r from-purple-300 to-orange-300 bg-clip-text">Quick Links</h3>
              <div className="grid grid-cols-2 gap-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="text-gray-300 hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-white/10"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-12 pt-8 text-center">
            <p className="text-gray-400">
              &copy; 2024 River of Life Ministries. All rights reserved. 
              <span className="text-transparent bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text font-semibold"> Where Faith Flows Freely</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;