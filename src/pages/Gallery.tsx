import React, { useEffect, useState } from 'react';
import { Filter, Search, Sparkles, Heart } from 'lucide-react';
import { supabase, type GalleryItem } from '../lib/supabase';
import LoadingSpinner from '../components/LoadingSpinner';
import ImageModal from '../components/ImageModal';
import GalleryCarousel from '../components/GalleryCarousel';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const Gallery: React.FC = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImage, setSelectedImage] = useState<{ url: string; caption: string } | null>(null);

  const categories = ['all', 'worship', 'youth', 'outreach', 'prayer', 'study', 'general'];

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  useEffect(() => {
    filterItems();
  }, [items, selectedCategory, searchTerm]);

  const fetchGalleryItems = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching gallery items:', error);
      } else {
        setItems(data || []);
      }
    } catch (error) {
      console.error('Error fetching gallery items:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = items;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  };

  const getCategoryDisplayName = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-orange-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Gallery | River of Life Ministries</title>
        <meta name="description" content="View our church gallery featuring worship, events, and community moments at River of Life Ministries." />
        <link rel="canonical" href="https://yourdomain.com/gallery" />
        {/* Open Graph */}
        <meta property="og:title" content="Gallery | River of Life Ministries" />
        <meta property="og:description" content="View our church gallery featuring worship, events, and community moments at River of Life Ministries." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://yourdomain.com/gallery" />
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Gallery | River of Life Ministries" />
        <meta name="twitter:description" content="View our church gallery featuring worship, events, and community moments at River of Life Ministries." />
        {/* Structured Data */}
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "ImageGallery",
            "name": "River of Life Ministries Gallery",
            "url": "https://yourdomain.com/gallery"
          }
        `}</script>
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50">
        {/* Hero Section with Carousel */}
        <div className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <GalleryCarousel 
              className="w-full h-full"
              imageClassName="h-96"
              showControls={false}
              autoPlay={true}
              interval={5000}
              limit={6}
            />
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/80 to-orange-900/80 z-10"></div>
          
          <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
            <div className="flex items-center justify-center mb-6">
              <Sparkles className="w-8 h-8 text-yellow-300 mr-3 animate-pulse" />
              <h1 className="text-5xl md:text-6xl font-bold">
                <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  Our Gallery
                </span>
              </h1>
              <Sparkles className="w-8 h-8 text-yellow-300 ml-3 animate-pulse" />
            </div>
            <p className="text-xl md:text-2xl max-w-4xl mx-auto leading-relaxed text-purple-100">
              Witness the beautiful moments of worship, fellowship, and community outreach that define our ministry
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Filters */}
          <div className="mb-12">
            <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-purple-100">
              <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
                {/* Category Filters */}
                <div className="flex flex-wrap gap-3">
                  <span className="text-sm font-semibold text-gray-700 mr-2 flex items-center">
                    <Filter className="w-4 h-4 mr-1" />
                    Categories:
                  </span>
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-6 py-3 rounded-2xl font-medium transition-all duration-300 transform hover:scale-105 ${
                        selectedCategory === category
                          ? 'bg-gradient-to-r from-purple-600 to-orange-500 text-white shadow-lg'
                          : 'bg-white text-gray-700 hover:bg-purple-50 hover:text-purple-600 shadow-md border border-gray-200'
                      }`}
                    >
                      {getCategoryDisplayName(category)}
                    </button>
                  ))}
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search gallery..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-6 py-3 w-80 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/90 backdrop-blur-sm shadow-md"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Gallery Grid */}
          {filteredItems.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-white/80 backdrop-blur-md rounded-3xl p-12 shadow-xl border border-purple-100 max-w-md mx-auto">
                <Filter className="w-20 h-20 text-gray-400 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">No images found</h3>
                <p className="text-gray-600 text-lg">
                  {searchTerm ? 'Try adjusting your search terms.' : 'No images in this category yet.'}
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Results Count */}
              <div className="mb-8 text-center">
                <p className="text-lg text-gray-600">
                  Showing <span className="font-bold text-purple-600">{filteredItems.length}</span> beautiful moments
                  {selectedCategory !== 'all' && (
                    <span> in <span className="font-bold text-orange-500">{getCategoryDisplayName(selectedCategory)}</span></span>
                  )}
                </p>
              </div>

              {/* Masonry Grid */}
              <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
                {filteredItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="break-inside-avoid group relative overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer transform hover:scale-105"
                    onClick={() => setSelectedImage({ url: item.image_url, caption: item.title })}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="relative">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-700"
                        loading="lazy"
                      />
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {/* Content Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                        {item.description && (
                          <p className="text-white/90 text-sm mb-3 line-clamp-2">{item.description}</p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
                            <Heart className="w-3 h-3 mr-1" />
                            {getCategoryDisplayName(item.category)}
                          </span>
                          <span className="text-white/80 text-xs">
                            {new Date(item.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      {/* Hover Icon */}
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                          <Search className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Image Modal */}
          <ImageModal
            isOpen={!!selectedImage}
            onClose={() => setSelectedImage(null)}
            imageUrl={selectedImage?.url || ''}
            caption={selectedImage?.caption || ''}
          />
        </div>
      </div>
      <nav>
        <Link to="/">Back to Home</Link>
      </nav>
    </>
  );
};

export default Gallery;