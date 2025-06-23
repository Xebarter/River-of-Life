import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, BookOpen, Gift, HelpingHand as PrayingHands, Image, Calendar, Users, Award, Star, Sparkles, ArrowRight, Music, Baby, GraduationCap, Handshake, Globe, Shield } from 'lucide-react';
import { supabase, type Devotion } from '../lib/supabase';
import LoadingSpinner from '../components/LoadingSpinner';
import GalleryCarousel from '../components/GalleryCarousel';
import { Helmet } from 'react-helmet-async';

const Home: React.FC = () => {
  const [latestDevotion, setLatestDevotion] = useState<Devotion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatestDevotion();
  }, []);

  const fetchLatestDevotion = async () => {
    try {
      const { data, error } = await supabase
        .from('devotions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching latest devotion:', error);
      } else {
        setLatestDevotion(data);
      }
    } catch (error) {
      console.error('Error fetching latest devotion:', error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      name: 'Gallery',
      description: 'View moments of worship, fellowship, and community outreach',
      icon: Image,
      href: '/gallery',
      gradient: 'from-purple-500 to-pink-500',
      hoverGradient: 'from-purple-600 to-pink-600',
    },
    {
      name: 'Daily Devotions',
      description: 'Start your day with inspiring devotions and scripture',
      icon: BookOpen,
      href: '/devotions',
      gradient: 'from-orange-500 to-red-500',
      hoverGradient: 'from-orange-600 to-red-600',
    },
    {
      name: 'Resources',
      description: 'Access sermons, worship music, and spiritual resources',
      icon: Heart,
      href: '/resources',
      gradient: 'from-purple-500 to-indigo-500',
      hoverGradient: 'from-purple-600 to-indigo-600',
    },
    {
      name: 'Give',
      description: 'Support our ministry and community outreach programs',
      icon: Gift,
      href: '/give',
      gradient: 'from-green-500 to-emerald-500',
      hoverGradient: 'from-green-600 to-emerald-600',
    },
  ];

  const ministries = [
    {
      name: 'Worship Ministry',
      description: 'Leading the congregation in heartfelt worship through music, song, and praise that glorifies God and creates an atmosphere for His presence.',
      icon: Music,
      gradient: 'from-purple-500 to-indigo-500',
      activities: ['Sunday Worship', 'Choir Practice', 'Instrumental Teams', 'Special Events']
    },
    {
      name: 'Youth Ministry',
      description: 'Empowering the next generation through discipleship, fellowship, and activities that build strong Christian character and leadership.',
      icon: Users,
      gradient: 'from-orange-500 to-red-500',
      activities: ['Youth Fellowship', 'Bible Study', 'Sports & Games', 'Leadership Training']
    },
    {
      name: 'Children\'s Ministry',
      description: 'Nurturing young hearts with age-appropriate Bible lessons, fun activities, and a safe environment where children can grow in faith.',
      icon: Baby,
      gradient: 'from-pink-500 to-rose-500',
      activities: ['Sunday School', 'Children\'s Church', 'VBS Programs', 'Family Events']
    },
    {
      name: 'Prayer Ministry',
      description: 'Interceding for our community, nation, and world through organized prayer meetings, prayer chains, and spiritual warfare.',
      icon: PrayingHands,
      gradient: 'from-blue-500 to-cyan-500',
      activities: ['Prayer Meetings', 'Intercessory Prayer', 'Prayer Chains', 'Healing Services']
    },
    {
      name: 'Community Outreach',
      description: 'Serving our local community through practical acts of love, charity work, and meeting the physical and spiritual needs of others.',
      icon: Handshake,
      gradient: 'from-green-500 to-emerald-500',
      activities: ['Food Distribution', 'Medical Camps', 'School Support', 'Elderly Care']
    },
    {
      name: 'Discipleship & Teaching',
      description: 'Equipping believers with biblical knowledge and practical faith through systematic teaching, mentorship, and spiritual growth programs.',
      icon: GraduationCap,
      gradient: 'from-indigo-500 to-purple-500',
      activities: ['Bible Study Groups', 'Discipleship Classes', 'Leadership Training', 'Mentorship']
    },
    {
      name: 'Missions & Evangelism',
      description: 'Spreading the Gospel locally and globally through evangelistic campaigns, mission trips, and church planting initiatives.',
      icon: Globe,
      gradient: 'from-teal-500 to-blue-500',
      activities: ['Evangelistic Crusades', 'Mission Trips', 'Church Planting', 'Street Evangelism']
    },
    {
      name: 'Pastoral Care',
      description: 'Providing spiritual guidance, counseling, and support to members during life\'s challenges, celebrations, and transitions.',
      icon: Shield,
      gradient: 'from-amber-500 to-orange-500',
      activities: ['Counseling Services', 'Hospital Visits', 'Marriage Support', 'Crisis Intervention']
    }
  ];

  return (
    <>
      <Helmet>
        <title>Home | River of Life Ministries</title>
        <meta name="description" content="Welcome to River of Life Ministries. Join us for worship, devotions, resources, and more." />
        <link rel="canonical" href="https://yourdomain.com/" />
        {/* Open Graph */}
        <meta property="og:title" content="Home | River of Life Ministries" />
        <meta property="og:description" content="Welcome to River of Life Ministries. Join us for worship, devotions, resources, and more." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://yourdomain.com/" />
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Home | River of Life Ministries" />
        <meta name="twitter:description" content="Welcome to River of Life Ministries. Join us for worship, devotions, resources, and more." />
        {/* Structured Data */}
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "River of Life Ministries",
            "url": "https://yourdomain.com",
            "logo": "https://yourdomain.com/logo.png"
          }
        `}</script>
      </Helmet>
      <div className="relative">
        {/* Hero Section with Carousel Background */}
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Background Carousel */}
          <div className="absolute inset-0 z-0">
            <GalleryCarousel 
              className="w-full h-full"
              imageClassName="h-screen"
              showControls={false}
              autoPlay={true}
              interval={6000}
            />
          </div>
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/80 via-purple-800/70 to-orange-900/80 z-10"></div>
          
          {/* Floating Elements */}
          <div className="absolute inset-0 z-20">
            <Sparkles className="absolute top-20 left-10 w-8 h-8 text-yellow-300 animate-pulse" />
            <Star className="absolute top-40 right-20 w-6 h-6 text-purple-300 animate-bounce" />
            <Heart className="absolute bottom-40 left-20 w-10 h-10 text-pink-300 animate-pulse" />
            <Sparkles className="absolute bottom-20 right-10 w-6 h-6 text-orange-300 animate-ping" />
          </div>
          
          {/* Hero Content */}
          <div className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
            <div className="animate-fade-in-up">
              <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
                <span className="block bg-gradient-to-r from-white via-purple-200 to-orange-200 bg-clip-text text-transparent">
                  Welcome to
                </span>
                <span className="block bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300 bg-clip-text text-transparent">
                  River of Life Ministries
                </span>
              </h1>
              <p className="text-2xl md:text-3xl mb-12 max-w-4xl mx-auto leading-relaxed text-purple-100">
                Where faith flows freely and lives are transformed by God's love
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link
                  to="/give"
                  className="group bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-10 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center justify-center space-x-2"
                >
                  <Gift className="w-6 h-6" />
                  <span>Give Now</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/prayer"
                  className="group bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white px-10 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center justify-center space-x-2"
                >
                  <PrayingHands className="w-6 h-6" />
                  <span>Submit Prayer Request</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-20 bg-gradient-to-br from-white via-purple-50 to-orange-50 relative overflow-hidden">
          {/* Background Decorations */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-40 h-40 bg-orange-500 rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">
                  Explore Our Ministry
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Discover the many ways we serve our community and grow together in faith
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Link
                    key={feature.name}
                    to={feature.href}
                    className="group relative p-8 bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-purple-200 transform hover:-translate-y-2"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-orange-50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="relative z-10">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-r ${feature.gradient} group-hover:${feature.hoverGradient} shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-700 transition-colors">
                        {feature.name}
                      </h3>
                      <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                        {feature.description}
                      </p>
                    </div>
                    
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <ArrowRight className="w-5 h-5 text-purple-500" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Today's Devotion with Side Carousel */}
        <div className="py-20 bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Devotion Content */}
              <div className="text-white">
                <div className="mb-8">
                  <h2 className="text-4xl md:text-5xl font-bold mb-4">
                    <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                      Today's Devotion
                    </span>
                  </h2>
                  <p className="text-xl text-purple-200">Start your day with God's word</p>
                </div>

                {loading ? (
                  <div className="flex justify-center">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : latestDevotion ? (
                  <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
                    <div className="flex items-center mb-4">
                      <Calendar className="w-5 h-5 text-orange-300 mr-2" />
                      <span className="text-purple-200">
                        {new Date(latestDevotion.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold mb-4">{latestDevotion.title}</h3>
                    <div className="bg-gradient-to-r from-purple-500/20 to-orange-500/20 border-l-4 border-orange-400 p-6 mb-6 rounded-lg">
                      <p className="text-orange-200 font-semibold italic text-lg">"{latestDevotion.scripture}"</p>
                    </div>
                    <p className="text-purple-100 leading-relaxed mb-6">
                      {latestDevotion.content.length > 300 
                        ? `${latestDevotion.content.substring(0, 300)}...`
                        : latestDevotion.content
                      }
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-purple-200">By {latestDevotion.author}</p>
                      <Link
                        to="/devotions"
                        className="group flex items-center space-x-2 text-orange-300 hover:text-orange-200 font-semibold transition-colors"
                      >
                        <span>Read More Devotions</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 text-center border border-white/20">
                    <p className="text-purple-200 mb-4">No devotions available at the moment.</p>
                    <Link
                      to="/devotions"
                      className="inline-flex items-center space-x-2 text-orange-300 hover:text-orange-200 font-semibold transition-colors"
                    >
                      <span>View All Devotions</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </div>

              {/* Side Carousel */}
              <div className="lg:pl-8">
                <GalleryCarousel 
                  className="h-96 lg:h-[500px]"
                  autoPlay={true}
                  interval={4000}
                  limit={8}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Ministries Section */}
        <div className="py-20 bg-gradient-to-br from-white via-purple-50 to-orange-50 relative overflow-hidden">
          {/* Background Decorations */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-40 left-20 w-64 h-64 bg-purple-500 rounded-full blur-3xl"></div>
            <div className="absolute bottom-40 right-20 w-80 h-80 bg-orange-500 rounded-full blur-3xl"></div>
            <div className="absolute top-20 right-40 w-48 h-48 bg-pink-500 rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="flex items-center justify-center mb-6">
                <Heart className="w-8 h-8 text-purple-600 mr-3" />
                <h2 className="text-4xl md:text-5xl font-bold">
                  <span className="bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">
                    Our Ministries
                  </span>
                </h2>
                <Heart className="w-8 h-8 text-orange-500 ml-3" />
              </div>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                Discover the diverse ways we serve God and our community through dedicated ministry programs designed to transform lives and spread His love
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {ministries.map((ministry, index) => {
                const Icon = ministry.icon;
                return (
                  <div
                    key={ministry.name}
                    className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-purple-200 transform hover:-translate-y-3"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Background Gradient on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-orange-50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="relative z-10">
                      {/* Icon */}
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-r ${ministry.gradient} shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      
                      {/* Title */}
                      <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-purple-700 transition-colors">
                        {ministry.name}
                      </h3>
                      
                      {/* Description */}
                      <p className="text-gray-600 leading-relaxed mb-6 group-hover:text-gray-700 transition-colors">
                        {ministry.description}
                      </p>
                      
                      {/* Activities */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-purple-600 mb-3">Key Activities:</h4>
                        <div className="grid grid-cols-1 gap-2">
                          {ministry.activities.map((activity, actIndex) => (
                            <div
                              key={actIndex}
                              className="flex items-center text-sm text-gray-600 group-hover:text-gray-700 transition-colors"
                            >
                              <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-orange-400 rounded-full mr-3 flex-shrink-0"></div>
                              <span>{activity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* Hover Indicator */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-orange-500 rounded-full flex items-center justify-center">
                        <Star className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Call to Action for Ministries */}
            <div className="text-center mt-16">
              <div className="bg-gradient-to-r from-purple-600 to-orange-500 rounded-3xl p-8 text-white">
                <h3 className="text-2xl md:text-3xl font-bold mb-4">Get Involved in Ministry</h3>
                <p className="text-lg mb-6 text-purple-100">
                  Join us in making a difference! Every ministry needs dedicated volunteers and passionate hearts.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/prayer"
                    className="group bg-white/20 backdrop-blur-md hover:bg-white/30 text-white px-8 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
                  >
                    <PrayingHands className="w-5 h-5" />
                    <span>Join Prayer Ministry</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to="/give"
                    className="group bg-white/20 backdrop-blur-md hover:bg-white/30 text-white px-8 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
                  >
                    <Gift className="w-5 h-5" />
                    <span>Support Ministries</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action with Background Carousel */}
        <div className="relative py-20 overflow-hidden">
          {/* Background Carousel */}
          <div className="absolute inset-0 z-0">
            <GalleryCarousel 
              className="w-full h-full"
              imageClassName="h-full"
              showControls={false}
              autoPlay={true}
              interval={7000}
              limit={5}
            />
          </div>
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/90 to-orange-900/90 z-10"></div>
          
          {/* Content */}
          <div className="relative z-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Join Our Community
              </span>
            </h2>
            <p className="text-xl md:text-2xl mb-12 leading-relaxed text-purple-100">
              Experience the love of Christ and grow in faith with our church family
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                to="/prayer"
                className="group flex items-center justify-center space-x-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-10 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
              >
                <PrayingHands className="w-6 h-6" />
                <span>Request Prayer</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/give"
                className="group flex items-center justify-center space-x-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-10 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
              >
                <Gift className="w-6 h-6" />
                <span>Support Ministry</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;