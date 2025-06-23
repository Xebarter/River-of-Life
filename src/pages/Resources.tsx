import React, { useEffect, useState } from 'react';
import { Play, Download, Filter, Search, Video, Music, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';
import { supabase, testSupabaseConnection, type Resource } from '../lib/supabase';
import LoadingSpinner from '../components/LoadingSpinner';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const Resources: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const types = ['all', 'video', 'audio'];
  const categories = ['all', 'sermons', 'worship', 'youth', 'general'];

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    filterResources();
  }, [resources, selectedType, selectedCategory, searchTerm]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      setError(null);

      // Test connection first
      const connectionTest = await testSupabaseConnection();
      if (!connectionTest.success) {
        throw new Error(`Connection failed: ${connectionTest.error}`);
      }

      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase query error:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log('Resources fetched successfully:', data?.length || 0);
      setResources(data || []);
    } catch (error) {
      console.error('Error fetching resources:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      
      // Provide helpful error messages based on common issues
      if (errorMessage.includes('Failed to fetch')) {
        setError('Unable to connect to the database. Please check your internet connection and try again.');
      } else if (errorMessage.includes('Invalid API key')) {
        setError('Database configuration error. Please contact support.');
      } else if (errorMessage.includes('CORS')) {
        setError('Cross-origin request blocked. Please contact support.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const filterResources = () => {
    let filtered = resources;

    if (selectedType !== 'all') {
      filtered = filtered.filter(resource => resource.type === selectedType);
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(resource => resource.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(resource =>
        resource.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredResources(filtered);
  };

  const getCategoryDisplayName = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const getYouTubeVideoId = (url: string) => {
    // Handle various YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }
    return null;
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = getYouTubeVideoId(url);
    if (!videoId) return null;
    
    // Use YouTube's nocookie domain for better privacy and embedding compatibility
    return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1`;
  };

  const getYouTubeThumbnail = (url: string) => {
    const videoId = getYouTubeVideoId(url);
    if (!videoId) return null;
    
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  };

  const isYouTubeUrl = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  const handleRetry = () => {
    fetchResources();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleRetry}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </button>
          <div className="mt-4 text-sm text-gray-500">
            <p>If the problem persists, please:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Check your internet connection</li>
              <li>Refresh the page</li>
              <li>Contact support if the issue continues</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Resources | River of Life Ministries</title>
        <meta name="description" content="Access sermons, worship music, and study materials from River of Life Ministries." />
        <link rel="canonical" href="https://yourdomain.com/resources" />
        {/* Open Graph */}
        <meta property="og:title" content="Resources | River of Life Ministries" />
        <meta property="og:description" content="Access sermons, worship music, and study materials from River of Life Ministries." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://yourdomain.com/resources" />
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Resources | River of Life Ministries" />
        <meta name="twitter:description" content="Access sermons, worship music, and study materials from River of Life Ministries." />
        {/* Structured Data */}
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Resources",
            "url": "https://yourdomain.com/resources"
          }
        `}</script>
      </Helmet>
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Resources</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Access our library of sermons, worship music, and spiritual resources to grow in your faith
            </p>
          </div>

          {/* Filters */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              {/* Type Filter */}
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-gray-700 mr-2">Type:</span>
                {types.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedType === type
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {getCategoryDisplayName(type)}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-700 mr-2">Category:</span>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {getCategoryDisplayName(category)}
                </button>
              ))}
            </div>
          </div>

          {/* Resources Grid */}
          {filteredResources.length === 0 ? (
            <div className="text-center py-12">
              <Filter className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No resources found</h3>
              <p className="text-gray-600">
                {searchTerm ? 'Try adjusting your search terms.' : 'No resources in this category yet.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource) => {
                const embedUrl = resource.type === 'video' && isYouTubeUrl(resource.url) 
                  ? getYouTubeEmbedUrl(resource.url) 
                  : null;
                const thumbnailUrl = resource.type === 'video' && isYouTubeUrl(resource.url)
                  ? getYouTubeThumbnail(resource.url)
                  : null;

                return (
                  <div
                    key={resource.id}
                    className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                  >
                    {resource.type === 'video' && embedUrl ? (
                      <div className="aspect-video relative">
                        <iframe
                          src={embedUrl}
                          title={resource.title}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                          loading="lazy"
                          onError={(e) => {
                            // If iframe fails to load, show thumbnail with external link
                            const iframe = e.target as HTMLIFrameElement;
                            const container = iframe.parentElement;
                            if (container && thumbnailUrl) {
                              container.innerHTML = `
                                <div class="w-full h-full bg-gray-100 flex flex-col items-center justify-center relative">
                                  <img src="${thumbnailUrl}" alt="${resource.title}" class="w-full h-full object-cover" />
                                  <div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                    <a href="${resource.url}" target="_blank" rel="noopener noreferrer" 
                                       class="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-red-700 transition-colors">
                                      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 12l-2-2m0 0l2-2m-2 2h8m-8 0H4"></path>
                                      </svg>
                                      <span>Watch on YouTube</span>
                                    </a>
                                  </div>
                                </div>
                              `;
                            }
                          }}
                        />
                      </div>
                    ) : resource.type === 'video' && thumbnailUrl ? (
                      <div className="aspect-video relative">
                        <img 
                          src={thumbnailUrl} 
                          alt={resource.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-red-700 transition-colors"
                          >
                            <Play className="w-5 h-5" />
                            <span>Watch on YouTube</span>
                          </a>
                        </div>
                      </div>
                    ) : resource.type === 'audio' ? (
                      <div className="aspect-video bg-gradient-to-br from-purple-100 to-orange-100 flex items-center justify-center">
                        <Music className="w-16 h-16 text-purple-600" />
                      </div>
                    ) : (
                      <div className="aspect-video bg-gray-100 flex items-center justify-center">
                        <Video className="w-16 h-16 text-gray-400" />
                      </div>
                    )}

                    <div className="p-4">
                      <div className="flex items-center mb-2">
                        {resource.type === 'video' ? (
                          <Video className="w-4 h-4 text-purple-600 mr-2" />
                        ) : (
                          <Music className="w-4 h-4 text-orange-500 mr-2" />
                        )}
                        <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {getCategoryDisplayName(resource.category)}
                        </span>
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{resource.title}</h3>
                      
                      {resource.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{resource.description}</p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          {new Date(resource.created_at).toLocaleDateString()}
                        </span>
                        
                        {resource.type === 'audio' ? (
                          <div className="flex-1 ml-4">
                            <audio controls className="w-full">
                              <source src={resource.url} type="audio/mpeg" />
                              Your browser does not support the audio element.
                            </audio>
                          </div>
                        ) : resource.type === 'video' && !embedUrl ? (
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-1 text-purple-600 hover:text-purple-700 font-medium"
                          >
                            <ExternalLink className="w-4 h-4" />
                            <span>Watch</span>
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <nav>
        <Link to="/">Back to Home</Link>
      </nav>
    </>
  );
};

export default Resources;