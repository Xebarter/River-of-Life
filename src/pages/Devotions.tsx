import React, { useEffect, useState } from 'react';
import { Calendar, Search, BookOpen, User } from 'lucide-react';
import { supabase, type Devotion } from '../lib/supabase';
import LoadingSpinner from '../components/LoadingSpinner';
import { format } from 'date-fns';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const Devotions: React.FC = () => {
  const [devotions, setDevotions] = useState<Devotion[]>([]);
  const [filteredDevotions, setFilteredDevotions] = useState<Devotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDevotion, setSelectedDevotion] = useState<Devotion | null>(null);

  useEffect(() => {
    fetchDevotions();
  }, []);

  useEffect(() => {
    filterDevotions();
  }, [devotions, searchTerm]);

  const fetchDevotions = async () => {
    try {
      const { data, error } = await supabase
        .from('devotions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching devotions:', error);
      } else {
        setDevotions(data || []);
        if (data && data.length > 0) {
          setSelectedDevotion(data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching devotions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterDevotions = () => {
    if (!searchTerm) {
      setFilteredDevotions(devotions);
      return;
    }

    const filtered = devotions.filter(devotion =>
      devotion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      devotion.scripture.toLowerCase().includes(searchTerm.toLowerCase()) ||
      devotion.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredDevotions(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Devotions | River of Life Ministries</title>
        <meta name="description" content="Read daily devotions and spiritual reflections from River of Life Ministries." />
        <link rel="canonical" href="https://yourdomain.com/devotions" />
        {/* Open Graph */}
        <meta property="og:title" content="Devotions | River of Life Ministries" />
        <meta property="og:description" content="Read daily devotions and spiritual reflections from River of Life Ministries." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://yourdomain.com/devotions" />
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Devotions | River of Life Ministries" />
        <meta name="twitter:description" content="Read daily devotions and spiritual reflections from River of Life Ministries." />
        {/* Structured Data */}
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Devotions",
            "url": "https://yourdomain.com/devotions"
          }
        `}</script>
      </Helmet>
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Daily Devotions</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Find spiritual nourishment and inspiration through our daily devotional messages
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Devotions List */}
            <div className="lg:col-span-1">
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search devotions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredDevotions.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No devotions found.</p>
                  </div>
                ) : (
                  filteredDevotions.map((devotion) => (
                    <div
                      key={devotion.id}
                      onClick={() => setSelectedDevotion(devotion)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedDevotion?.id === devotion.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center mb-2">
                        <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                        <span className="text-sm text-gray-600">
                          {format(new Date(devotion.created_at), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">{devotion.title}</h3>
                      <p className="text-sm text-gray-600 italic">"{devotion.scripture}"</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Selected Devotion */}
            <div className="lg:col-span-2">
              {selectedDevotion ? (
                <div className="bg-white rounded-xl shadow-lg p-8">
                  <div className="flex items-center mb-6">
                    <Calendar className="w-5 h-5 text-purple-600 mr-2" />
                    <span className="text-gray-600">
                      {format(new Date(selectedDevotion.created_at), 'EEEE, MMMM dd, yyyy')}
                    </span>
                  </div>

                  <h1 className="text-3xl font-bold text-gray-900 mb-6">
                    {selectedDevotion.title}
                  </h1>

                  <div className="bg-gradient-to-r from-purple-50 to-orange-50 border-l-4 border-purple-500 p-6 mb-8">
                    <p className="text-purple-800 font-semibold text-lg italic">
                      "{selectedDevotion.scripture}"
                    </p>
                  </div>

                  <div className="prose prose-lg max-w-none mb-8">
                    <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {selectedDevotion.content}
                    </div>
                  </div>

                  <div className="flex items-center pt-6 border-t border-gray-200">
                    <User className="w-5 h-5 text-gray-500 mr-2" />
                    <span className="text-gray-700 font-medium">{selectedDevotion.author}</span>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                  <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Devotion Selected</h3>
                  <p className="text-gray-600">Select a devotion from the list to read it here.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Devotions;